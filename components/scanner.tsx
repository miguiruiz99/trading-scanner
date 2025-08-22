"use client";

import type React from "react";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Volume2, ArrowUpDown } from "lucide-react";
import { PairDetail } from "./pair-detail";
import { AdvancedFilters } from "./advanced-filters";
import {
  getMarketData,
  toggleDataSource,
  getServiceStatus,
} from "@/lib/data-service";
import { type CryptoPair } from "@/lib/mock-data";
import { Indicator, SortBy, SortOrder } from "@/enums/enums";
import { TableView } from "./TableView";
import { ScannerCard } from "./ScannerCard";

export function Scanner() {
  const [onlyActiveSetups, setOnlyActiveSetups] = useState(false);
  const [minVolume, setMinVolume] = useState("20M");
  const [trendFilter, setTrendFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.SCORE);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [selectedPair, setSelectedPair] = useState<string | null>(null);
  const [minScore, setMinScore] = useState(0);
  const [rsiRange, setRsiRange] = useState<[number, number]>([0, 100]);
  const [selectedSetups, setSelectedSetups] = useState<string[]>([]);
  const [timeframe, setTimeframe] = useState("15m");
  const [pairs, setPairs] = useState<CryptoPair[]>([]);
  const [selectedIndicators, setSelectedIndicators] = useState<Indicator[]>([
    Indicator.RSI_EXTREMES,
    Indicator.EMA_CROSS,
    Indicator.VOLUME_SPIKE,
  ]);
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
        const marketData = await getMarketData();
        setPairs(marketData);
      } catch (error) {
        console.error("Error loading market data:", error);
      }
    };

    loadPairs();

    const interval = setInterval(loadPairs, 30000);

    return () => clearInterval(interval);
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

      if (pair.volume24h < volumeThreshold) return false;

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
        return b.volume24h - a.volume24h;
      }

      const getValue = (pair: CryptoPair) => {
        switch (sortBy) {
          case "volume":
            return pair.volume24h;
          case "price":
            return pair.price;
          case "rsi":
            return pair.rsi;
          default:
            return pair.score;
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

  const handlePairClick = (pair: string) => {
    setSelectedPair(pair);
  };

  const handleBackToScanner = () => {
    setSelectedPair(null);
  };

  if (selectedPair) {
    return (
      <PairDetail
        pair={selectedPair}
        onBack={handleBackToScanner}
        timeframe={timeframe}
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdvancedFilters
        onlyActiveSetups={onlyActiveSetups}
        setOnlyActiveSetups={setOnlyActiveSetups}
        minVolume={minVolume}
        setMinVolume={setMinVolume}
        trendFilter={trendFilter}
        setTrendFilter={setTrendFilter}
        minScore={minScore}
        setMinScore={setMinScore}
        rsiRange={rsiRange}
        setRsiRange={setRsiRange}
        selectedSetups={selectedSetups}
        setSelectedSetups={setSelectedSetups}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedIndicators={selectedIndicators}
        setSelectedIndicators={setSelectedIndicators}
        indicatorParams={indicatorParams}
        setIndicatorParams={setIndicatorParams}
      />

      {viewMode === "table" ? (
        <TableView
          filteredAndSortedPairs={filteredAndSortedPairs}
          handlePairClick={handlePairClick}
          getSetupBadgeColor={getSetupBadgeColor}
          formatVolume={formatVolume}
        />
      ) : (
        <ScannerCard
          filteredAndSortedPairs={[]}
          handlePairClick={function (pair: string): void {
            throw new Error("Function not implemented.");
          }}
          formatVolume={function (volume: number): string {
            throw new Error("Function not implemented.");
          }}
          getSetupBadgeColor={function (setup: string): string {
            throw new Error("Function not implemented.");
          }}
        />
      )}

      {filteredAndSortedPairs.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No se encontraron pares que cumplan los filtros seleccionados.
          </p>
          <Button
            variant="outline"
            className="mt-4 bg-transparent"
            onClick={() => {
              setOnlyActiveSetups(false);
              setMinVolume("20M");
              setTrendFilter("all");
              setMinScore(0);
              setRsiRange([0, 100]);
              setSelectedSetups([]);
              setSelectedIndicators([]);
            }}
          >
            Limpiar Filtros
          </Button>
        </Card>
      )}
    </div>
  );
}
