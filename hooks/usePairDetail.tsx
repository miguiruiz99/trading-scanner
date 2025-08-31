import { getPairDetail } from "@/lib/api-services";
import {
  ScannerPair,
  IndicatorData,
  TradingSetup,
  calculateEMA,
  calculateRSI,
  generateTradingSetups,
  generateAdvancedTradingSetups,
} from "@/lib/mock-data";
import { useState, useEffect } from "react";

export const usePairDetail = ({
  symbol,
  initialTimeframe,
}: {
  symbol: string;
  initialTimeframe: string;
}) => {
  const [pair, setPair] = useState<ScannerPair | null>(null);
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [chartType, setChartType] = useState<"candles" | "line">("candles");
  const [ema20, setEma20] = useState<IndicatorData[]>([]);
  const [ema50, setEma50] = useState<IndicatorData[]>([]);
  const [ema200, setEma200] = useState<IndicatorData[]>([]);
  const [rsi, setRsi] = useState<IndicatorData[]>([]);
  const [setups, setSetups] = useState<TradingSetup[]>([]);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [selectedIndicators] = useState<string[]>([
    "rsi_extremes",
    "ema_cross",
    "volume_spike",
    "breakout_volume",
  ]);
  const [indicatorParams] = useState<Record<string, Record<string, number>>>({
    rsi_extremes: { period: 14, oversold: 30, overbought: 70 },
    ema_cross: { ema1: 20, ema2: 50, ema3: 200 },
    volume_spike: { sma_period: 20, multiplier: 3 },
    breakout_volume: { lookback: 20, volume_multiplier: 2 },
    bollinger_squeeze: { period: 20, std_dev: 2, squeeze_threshold: 0.1 },
    adx_strong: { period: 14, threshold: 25 },
    pullback_trend: { ema_short: 20, ema_mid: 50, ema_long: 200 },
  });

  useEffect(() => {
    if (!symbol) return;

    // Generate realistic candle data
    const loadCandleData = async () => {
      try {
        const pair = await getPairDetail(symbol);
        setPair(pair);

        // Calculate technical indicators
        const ema20Data = calculateEMA(pair.candles, 20);
        const ema50Data = calculateEMA(pair.candles, 50);
        const ema200Data = calculateEMA(pair.candles, 200);
        const rsiData = calculateRSI(pair.candles, 14);

        setEma20(ema20Data);
        setEma50(ema50Data);
        setEma200(ema200Data);
        setRsi(rsiData);

        const basicSetups = generateTradingSetups(
          pair.candles,
          ema20Data,
          ema50Data,
          rsiData
        );
        const advancedSetups = generateAdvancedTradingSetups(
          pair.candles,
          ema20Data,
          ema50Data,
          ema200Data,
          rsiData,
          selectedIndicators,
          indicatorParams
        );

        // Combine and deduplicate setups
        const allSetups = [...basicSetups, ...advancedSetups];
        const uniqueSetups = allSetups.filter(
          (setup, index, self) =>
            index ===
            self.findIndex(
              (s) => s.name === setup.name && s.type === setup.type
            )
        );
        setSetups(uniqueSetups);

        // Set current price and change
        if (pair.candles.length > 1) {
          const latest = pair.candles[pair.candles.length - 1];
          const previous = pair.candles[pair.candles.length - 2];
          setCurrentPrice(latest.close);
          setPriceChange(
            ((latest.close - previous.close) / previous.close) * 100
          );
        }
      } catch (error) {
        console.error("Error loading candle data:", error);
      }
    };

    loadCandleData();

    // Get scan history
    // const history = getScanHistory(pair.symbol);
    // setScanHistory(history);

    // Update price periodically
    const interval = setInterval(() => {
      setCurrentPrice((prev) => {
        const change = (Math.random() - 0.5) * 0.001; // Small random change
        return prev * (1 + change);
      });
      setPriceChange((prev) => prev + (Math.random() - 0.5) * 0.1);
    }, 5000);

    return () => clearInterval(interval);
  }, [symbol, timeframe, selectedIndicators, indicatorParams]);

  const getSetupBadgeColor = (type: string) => {
    switch (type) {
      case "bullish":
        return "bg-trading-green text-white";
      case "bearish":
        return "bg-trading-red text-white";
      default:
        return "bg-trading-blue text-white";
    }
  };

  const formatPrice = (price: number) => {
    if (price < 1) return price.toFixed(4);
    if (price < 100) return price.toFixed(2);
    return price.toLocaleString();
  };

  const currentRSI = rsi.length > 0 ? rsi[rsi.length - 1].value : 50;

  return {
    chartType,
    currentPrice,
    currentRSI,
    ema20,
    ema200,
    ema50,
    indicatorParams,
    pair,
    priceChange,
    rsi,
    scanHistory,
    selectedIndicators,
    setups,
    timeframe,
    formatPrice,
    getSetupBadgeColor,
    setChartType,
    setTimeframe,
  };
};
