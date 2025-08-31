import { SortBy, SortOrder, Indicator } from "@/enums/enums";
import {
  getPairsTickers,
  getMarketScannerData,
  AppPairTickers,
} from "@/lib/api-services";
import { ScannerPair } from "@/lib/mock-data";
import { useState, useEffect, useMemo } from "react";

export const useScanner = () => {
  const [onlyActiveSetups, setOnlyActiveSetups] = useState(false);
  const [minVolume, setMinVolume] = useState("0");
  const [trendFilter, setTrendFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.SCORE);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [minScore, setMinScore] = useState(0);
  const [rsiRange, setRsiRange] = useState<[number, number]>([0, 100]);
  const [selectedSetups, setSelectedSetups] = useState<string[]>([]);
  const [pairs, setPairs] = useState<ScannerPair[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndicators, setSelectedIndicators] = useState<Indicator[]>([]);
  const [indicatorParams, setIndicatorParams] = useState<
    Record<string, Record<string, number>>
  >({
    rsi_extremes: { period: 14, oversold: 30, overbought: 70 },
    ema_cross: { ema1: 20, ema2: 50, ema3: 200 },
    volume_spike: { sma_period: 20, multiplier: 3 },
    breakout_volume: { lookback: 20, volume_multiplier: 2 },
    bollinger_squeeze: { period: 20, std_dev: 2, squeeze_threshold: 0.1 },
    adx_strong: { period: 14, threshold: 25 },
    pullback_trend: { ema_short: 20, ema_mid: 50, ema_long: 200 },
  });

  useEffect(() => {
    const loadPairs = async () => {
      try {
        setLoading(true);

        // Cargar los tickers primero
        const pairsTickers = await getPairsTickers();

        // Cargar los primeros 20 pares inmediatamente
        const firstBatch = pairsTickers.slice(0, 20);
        const initialMarketData = await getMarketScannerData(firstBatch);
        setPairs(initialMarketData);
        setLoading(false); // Mostrar datos inmediatamente después de los primeros 20

        // Continuar cargando el resto en segundo plano
        await loadRemainingData(pairsTickers, 20);
      } catch (error) {
        console.error("Error loading market data:", error);
        setLoading(false);
      }
    };

    const loadRemainingData = async (
      allTickers: AppPairTickers[],
      startIndex: number
    ) => {
      const batchSize = 20;
      let currentIndex = startIndex;

      while (currentIndex < allTickers.length) {
        try {
          const batch = allTickers.slice(
            currentIndex,
            currentIndex + batchSize
          );
          const marketData = await getMarketScannerData(batch);

          // Agregar los nuevos datos sin mostrar loading
          setPairs((prevPairs) => [...prevPairs, ...marketData]);

          currentIndex += batchSize;

          // Pequeña pausa para no sobrecargar la API
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(
            `Error loading batch starting at ${currentIndex}:`,
            error
          );
          // Continuar con el siguiente batch en caso de error
          currentIndex += batchSize;
        }
      }
    };

    loadPairs();
  }, []);

  const filteredAndSortedPairs = useMemo(() => {
    const filtered = pairs.filter((pair) => {
      if (onlyActiveSetups && pair.setups.length === 0) return false;
      if (trendFilter === "up" && pair.trend !== "up") return false;
      if (trendFilter === "down" && pair.trend !== "down") return false;

      const volumeThreshold =
        {
          "20M": 20000000,
          "50M": 50000000,
          "100M": 100000000,
          "200M": 200000000,
          "500M": 500000000,
        }[minVolume] || 0;

      if (pair.quoteVolume24h < volumeThreshold) return false;

      if (pair.score < minScore) return false;
      if (pair.rsi < rsiRange[0] || pair.rsi > rsiRange[1]) return false;

      if (selectedSetups.length > 0) {
        const hasSelectedSetup = selectedSetups.some((setup) =>
          pair.setups.some((pairSetup) => pairSetup.includes(setup))
        );
        if (!hasSelectedSetup) return false;
      }

      if (selectedIndicators.length > 0) {
        const indicatorMatches = selectedIndicators.some((indicator) => {
          switch (indicator) {
            case "rsi_extremes":
              const rsiParams = indicatorParams.rsi_extremes || {
                oversold: 30,
                overbought: 70,
              };
              return (
                pair.rsi < rsiParams.oversold || pair.rsi > rsiParams.overbought
              );
            case "ema_cross":
              return pair.setups.some(
                (setup) =>
                  setup.includes("EMA Cross") ||
                  setup.includes("Golden") ||
                  setup.includes("Death")
              );
            case "volume_spike":
              return pair.setups.some((setup) => setup.includes("Vol↑"));
            case "breakout_volume":
              return pair.setups.some((setup) => setup.includes("Breakout"));
            case "pullback_trend":
              return (
                pair.trend === "up" &&
                pair.setups.some((setup) => setup.includes("Support"))
              );
            case "adx_strong":
              return pair.score > 75; // High score indicates strong trend
            case "bollinger_squeeze":
              return pair.setups.some(
                (setup) =>
                  setup.includes("Squeeze") || setup.includes("Breakout")
              );
            default:
              return false;
          }
        });
        if (!indicatorMatches) return false;
      }

      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "score") {
        const scoreCompare =
          sortOrder === "desc" ? b.score - a.score : a.score - b.score;
        if (scoreCompare !== 0) return scoreCompare;
        return b.quoteVolume24h - a.quoteVolume24h;
      }

      const getValue = (pair: ScannerPair) => {
        switch (sortBy) {
          case "volume":
            return pair.quoteVolume24h;
          case "price":
            return pair.lastPrice;
          case "rsi":
            return pair.rsi;
          default:
            return pair.lastPrice;
        }
      };

      const aVal = getValue(a);
      const bVal = getValue(b);
      return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [
    pairs,
    onlyActiveSetups,
    minVolume,
    trendFilter,
    sortBy,
    sortOrder,
    minScore,
    rsiRange,
    selectedSetups,
    selectedIndicators,
    indicatorParams,
  ]);

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(1)}B`;
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(0)}M`;
    return volume.toString();
  };

  const getSetupBadgeColor = (setup: string) => {
    if (
      setup.includes("RSI<30") ||
      setup.includes("Breakout") ||
      setup.includes("EMA Cross") ||
      setup.includes("Golden")
    )
      return "bg-trading-green text-white";
    if (
      setup.includes("RSI>70") ||
      setup.includes("Breakdown") ||
      setup.includes("Death")
    )
      return "bg-trading-red text-white";
    if (
      setup.includes("Vol↑") ||
      setup.includes("MACD Cross") ||
      setup.includes("Volume Spike")
    )
      return "bg-trading-blue text-white";
    if (
      setup.includes("Pullback") ||
      setup.includes("ADX") ||
      setup.includes("Bollinger")
    )
      return "bg-trading-orange text-white";
    return "bg-muted text-muted-foreground";
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(
        sortOrder === SortOrder.DESC ? SortOrder.ASC : SortOrder.DESC
      );
    } else {
      setSortBy(column);
      setSortOrder(SortOrder.DESC);
    }
  };

  return {
    onlyActiveSetups,
    setOnlyActiveSetups,
    minVolume,
    setMinVolume,
    trendFilter,
    setTrendFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    viewMode,
    setViewMode,
    minScore,
    setMinScore,
    rsiRange,
    setRsiRange,
    selectedSetups,
    setSelectedSetups,
    pairs,
    setPairs,
    loading,
    setLoading,
    selectedIndicators,
    setSelectedIndicators,
    indicatorParams,
    setIndicatorParams,
    filteredAndSortedPairs,
    formatVolume,
    getSetupBadgeColor,
    handleSort,
  };
};
