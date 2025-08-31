"use client";

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
import { useParams } from "next/navigation";
import { usePairDetail } from "@/hooks/usePairDetail";

interface PairDetailProps {
  onBack: () => void;
  timeframe: string;
}

export default function PairDetail({
  onBack,
  timeframe: initialTimeframe,
}: PairDetailProps) {
  const { symbol } = useParams<{ symbol: string }>();

  const {
    chartType,
    currentPrice,
    currentRSI,
    ema20,
    ema200,
    ema50,
    pair,
    priceChange,
    rsi,
    selectedIndicators,
    setups,
    timeframe,
    formatPrice,
    getSetupBadgeColor,
    setChartType,
    setTimeframe,
  } = usePairDetail({ symbol, initialTimeframe });

  return (
    <main className="w-full max-w-7xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{symbol}</h1>
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
            candles={pair?.candles ?? []}
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
          {/* <Card className="p-4">
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
          </Card> */}

          {/* Quick Stats */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Estadísticas</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Score Actual:</span>
                <span className="font-semibold">{pair?.score || "N/A"}</span>
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
              {/* <div className="flex justify-between">
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
              </div> */}
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Indicadores Activos:
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedIndicators.length}/7
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
