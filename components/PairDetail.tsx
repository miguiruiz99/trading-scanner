"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  BlendIcon as TrendIcon,
} from "lucide-react";
import { TradingChart } from "@/components/trading-chart";
import { getCandleData } from "@/lib/data-service";
import {
  calculateEMA,
  calculateRSI,
  generateTradingSetups,
  generateAdvancedTradingSetups,
  getScanHistory,
  basePairs,
  type CandleData,
  type IndicatorData,
  type TradingSetup,
} from "@/lib/mock-data";

interface PairDetailProps {
  pair: string;
  onBack: () => void;
  timeframe: string;
}

export function PairDetail({
  pair,
  onBack,
  timeframe: initialTimeframe,
}: PairDetailProps) {
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [chartType, setChartType] = useState<"candles" | "line">("candles");
  const [candles, setCandles] = useState<CandleData[]>([]);
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
    const basePair = basePairs.find((p) => p.pair === pair);
    if (!basePair) return;

    // Generate realistic candle data
    const loadCandleData = async () => {
      try {
        const candleData = await getCandleData(pair, timeframe, 100);
        setCandles(candleData);

        // Calculate technical indicators
        const ema20Data = calculateEMA(candleData, 20);
        const ema50Data = calculateEMA(candleData, 50);
        const ema200Data = calculateEMA(candleData, 200);
        const rsiData = calculateRSI(candleData, 14);

        setEma20(ema20Data);
        setEma50(ema50Data);
        setEma200(ema200Data);
        setRsi(rsiData);

        const basicSetups = generateTradingSetups(
          candleData,
          ema20Data,
          ema50Data,
          rsiData
        );
        const advancedSetups = generateAdvancedTradingSetups(
          candleData,
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
        if (candleData.length > 1) {
          const latest = candleData[candleData.length - 1];
          const previous = candleData[candleData.length - 2];
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
    const history = getScanHistory(pair);
    setScanHistory(history);

    // Update price periodically
    const interval = setInterval(() => {
      setCurrentPrice((prev) => {
        const change = (Math.random() - 0.5) * 0.001; // Small random change
        return prev * (1 + change);
      });
      setPriceChange((prev) => prev + (Math.random() - 0.5) * 0.1);
    }, 5000);

    return () => clearInterval(interval);
  }, [pair, timeframe, selectedIndicators, indicatorParams]);

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
  const basePair = basePairs.find((p) => p.pair === pair);

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{pair}</h1>
            {priceChange >= 0 ? (
              <TrendingUp className="h-5 w-5 text-trading-green" />
            ) : (
              <TrendingDown className="h-5 w-5 text-trading-red" />
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Timeframe:
              </Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1m</SelectItem>
                  <SelectItem value="5m">5m</SelectItem>
                  <SelectItem value="15m">15m</SelectItem>
                  <SelectItem value="1h">1h</SelectItem>
                  <SelectItem value="4h">4h</SelectItem>
                  <SelectItem value="1d">1d</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Tipo:
              </Label>
              <Select
                value={chartType}
                onValueChange={(value: "candles" | "line") =>
                  setChartType(value)
                }
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="candles">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-3 w-3" />
                      Velas
                    </div>
                  </SelectItem>
                  <SelectItem value="line">
                    <div className="flex items-center gap-2">
                      <TrendIcon className="h-3 w-3" />
                      Línea
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold">${formatPrice(currentPrice)}</div>
          <div
            className={`text-sm ${
              priceChange >= 0 ? "text-trading-green" : "text-trading-red"
            }`}
          >
            {priceChange >= 0 ? "+" : ""}
            {priceChange.toFixed(2)}% ({timeframe})
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-3">
          <TradingChart
            candles={candles}
            ema20={ema20}
            ema50={ema50}
            ema200={ema200}
            rsi={rsi}
            chartType={chartType}
            height={400}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Current Setups */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">
              Setups Detectados ({setups.length})
            </h3>
            <div className="space-y-3">
              {setups.length > 0 ? (
                setups.map((setup, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`text-xs ${getSetupBadgeColor(setup.type)}`}
                      >
                        {setup.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Fuerza: {setup.strength}/10
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {setup.description}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay setups activos detectados
                </p>
              )}
            </div>
          </Card>

          {/* Scan History */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Historial de Scans</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {scanHistory.map((scan, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm border-b border-muted/30 pb-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">
                      {scan.time}
                    </span>
                    <span className="font-medium">{scan.score}</span>
                    <span className="text-xs text-muted-foreground">
                      ${formatPrice(scan.price)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {scan.setups.slice(0, 2).map((setup: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {setup}
                      </Badge>
                    ))}
                    {scan.setups.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{scan.setups.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Estadísticas</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Score Actual:</span>
                <span className="font-semibold">
                  {basePair?.score || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">RSI:</span>
                <span
                  className={`font-semibold ${
                    currentRSI < 30
                      ? "text-trading-green"
                      : currentRSI > 70
                      ? "text-trading-red"
                      : "text-foreground"
                  }`}
                >
                  {Math.round(currentRSI)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vol 24h:</span>
                <span className="font-semibold">
                  {basePair
                    ? (basePair.volume24h / 1000000000).toFixed(2) + "B"
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Market Cap:</span>
                <span className="font-semibold">
                  {basePair
                    ? (basePair.marketCap / 1000000000).toFixed(0) + "B"
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ATH:</span>
                <span className="font-semibold">
                  ${basePair ? formatPrice(basePair.ath) : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Indicadores Activos:
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedIndicators.length}/7
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Última actualización:
                </span>
                <span className="text-xs text-muted-foreground">Hace 30s</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
