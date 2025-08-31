"use client";

import type React from "react";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Zap,
  Target,
  Volume2,
  Settings2,
  Info,
} from "lucide-react";
import { Indicator } from "@/enums/enums";

interface IndicatorConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: React.ReactNode;
  color: string;
  params?: Record<string, number>;
}

interface IndicatorsPanelProps {
  selectedIndicators: Indicator[];
  setSelectedIndicators: (indicators: Indicator[]) => void;
  indicatorParams: Record<string, Record<string, number>>;
  setIndicatorParams: (params: Record<string, Record<string, number>>) => void;
}

const defaultIndicators: IndicatorConfig[] = [
  {
    id: "rsi_extremes",
    name: "RSI Extremos",
    description: "RSI(14) < 30 (sobreventa) o RSI(14) > 70 (sobrecompra)",
    enabled: false,
    icon: <Activity className="h-4 w-4" />,
    color: "text-purple-500",
    params: { period: 14, oversold: 30, overbought: 70 },
  },
  {
    id: "ema_cross",
    name: "Cruce de EMAs",
    description: "EMA20 cruza EMA50, o EMA50 cruza EMA200 (golden/death cross)",
    enabled: false,
    icon: <TrendingUp className="h-4 w-4" />,
    color: "text-blue-500",
    params: { ema1: 20, ema2: 50, ema3: 200 },
  },
  {
    id: "pullback_trend",
    name: "Pullback en Tendencia",
    description: "EMA50 > EMA200 y el precio toca EMA20 sin perder EMA50",
    enabled: false,
    icon: <Target className="h-4 w-4" />,
    color: "text-green-500",
    params: { ema_short: 20, ema_mid: 50, ema_long: 200 },
  },
  {
    id: "breakout_volume",
    name: "Breakout con Volumen",
    description:
      "Cierre > máximo de últimas 20 velas + volumen ≥ 2×SMA20_volumen",
    enabled: false,
    icon: <Zap className="h-4 w-4" />,
    color: "text-orange-500",
    params: { lookback: 20, volume_multiplier: 2 },
  },
  {
    id: "bollinger_squeeze",
    name: "Bollinger Squeeze",
    description: "BandWidth muy bajo + vela rompe fuera de la banda",
    enabled: false,
    icon: <BarChart3 className="h-4 w-4" />,
    color: "text-pink-500",
    params: { period: 20, std_dev: 2, squeeze_threshold: 0.1 },
  },
  {
    id: "adx_strong",
    name: "ADX Fuerte",
    description: "ADX(14) > 25–30 (mercado en tendencia clara)",
    enabled: false,
    icon: <TrendingDown className="h-4 w-4" />,
    color: "text-red-500",
    params: { period: 14, threshold: 25 },
  },
  {
    id: "volume_spike",
    name: "Volume Spike",
    description: "Volumen actual ≥ 3×SMA20_volumen",
    enabled: false,
    icon: <Volume2 className="h-4 w-4" />,
    color: "text-cyan-500",
    params: { sma_period: 20, multiplier: 3 },
  },
];

export function IndicatorsPanel({
  selectedIndicators,
  setSelectedIndicators,
  indicatorParams,
  setIndicatorParams,
}: IndicatorsPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [indicators, setIndicators] =
    useState<IndicatorConfig[]>(defaultIndicators);

  const handleIndicatorToggle = (indicatorId: string) => {
    const newSelected = selectedIndicators.includes(indicatorId as Indicator)
      ? selectedIndicators.filter((id) => id !== indicatorId)
      : [...selectedIndicators, indicatorId as Indicator];

    setSelectedIndicators(newSelected);

    // Update local state
    setIndicators((prev) =>
      prev.map((ind) =>
        ind.id === indicatorId ? { ...ind, enabled: !ind.enabled } : ind
      )
    );
  };

  const handleParamChange = (
    indicatorId: string,
    paramName: string,
    value: number
  ) => {
    const newParams = {
      ...indicatorParams,
      [indicatorId]: {
        ...indicatorParams[indicatorId],
        [paramName]: value,
      },
    };
    setIndicatorParams(newParams);
  };

  const enabledCount = indicators.filter((ind) => ind.enabled).length;
  const totalSignals = selectedIndicators.length * 3; // Mock calculation

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Panel de Indicadores Técnicos</h3>
            <Badge variant="outline" className="text-xs">
              {enabledCount}/{indicators.length} activos
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right text-sm">
              <div className="font-medium">{totalSignals} señales</div>
              <div className="text-xs text-muted-foreground">detectadas</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="gap-2"
            >
              <Settings2 className="h-4 w-4" />
              {showAdvanced ? "Ocultar" : "Configurar"}
            </Button>
          </div>
        </div>

        {/* Quick Toggle Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {indicators.map((indicator) => (
            <div
              key={indicator.id}
              className={`
                relative p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md
                ${
                  indicator.enabled
                    ? "bg-primary/5 border-primary/20 shadow-sm"
                    : "bg-muted/20 border-muted hover:border-muted-foreground/20"
                }
              `}
              onClick={() => handleIndicatorToggle(indicator.id)}
            >
              <div className="flex items-start gap-2">
                <div className={`${indicator.color} mt-0.5`}>
                  {indicator.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm truncate">
                      {indicator.name}
                    </h4>
                    <Switch
                      checked={indicator.enabled}
                      onCheckedChange={() =>
                        handleIndicatorToggle(indicator.id)
                      }
                      className="size-4"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {indicator.description}
                  </p>
                </div>
              </div>

              {indicator.enabled && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Advanced Configuration */}
        {showAdvanced && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Configura los parámetros específicos de cada indicador
                </span>
              </div>

              <div className="grid gap-4">
                {indicators
                  .filter((ind) => ind.enabled)
                  .map((indicator) => (
                    <Card key={indicator.id} className="p-4 bg-muted/20">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={indicator.color}>
                            {indicator.icon}
                          </div>
                          <div>
                            <h4 className="font-medium">{indicator.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {indicator.description}
                            </p>
                          </div>
                        </div>

                        {indicator.params && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(indicator.params).map(
                              ([paramName, defaultValue]) => (
                                <div key={paramName} className="space-y-1">
                                  <Label className="text-xs font-medium capitalize">
                                    {paramName.replace(/_/g, " ")}
                                  </Label>
                                  <Input
                                    type="number"
                                    value={
                                      indicatorParams[indicator.id]?.[
                                        paramName
                                      ] || defaultValue
                                    }
                                    onChange={(e) =>
                                      handleParamChange(
                                        indicator.id,
                                        paramName,
                                        Number.parseFloat(e.target.value) ||
                                          defaultValue
                                      )
                                    }
                                    className="h-8 text-sm"
                                    min="0"
                                    step={
                                      paramName.includes("threshold") ||
                                      paramName.includes("multiplier")
                                        ? "0.1"
                                        : "1"
                                    }
                                  />
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          </>
        )}

        {/* Summary Stats */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">
                Señales Alcistas: {Math.floor(totalSignals * 0.6)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-muted-foreground">
                Señales Bajistas: {Math.floor(totalSignals * 0.4)}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedIndicators([]);
              setIndicators((prev) =>
                prev.map((ind) => ({ ...ind, enabled: false }))
              );
            }}
            className="text-xs"
          >
            Desactivar Todos
          </Button>
        </div>
      </div>
    </Card>
  );
}
