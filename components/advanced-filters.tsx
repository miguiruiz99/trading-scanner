"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RotateCcw, Filter } from "lucide-react";
import { IndicatorsPanel } from "@/components/indicators-panel";
import { Indicator } from "@/enums/enums";

interface AdvancedFiltersProps {
  onlyActiveSetups: boolean;
  setOnlyActiveSetups: (value: boolean) => void;
  minVolume: string;
  setMinVolume: (value: string) => void;
  trendFilter: string;
  setTrendFilter: (value: string) => void;
  minScore: number;
  setMinScore: (value: number) => void;
  rsiRange: [number, number];
  setRsiRange: (value: [number, number]) => void;
  selectedSetups: string[];
  setSelectedSetups: (value: string[]) => void;
  viewMode: "table" | "cards";
  setViewMode: (value: "table" | "cards") => void;
  selectedIndicators: Indicator[];
  setSelectedIndicators: (indicators: Indicator[]) => void;
  indicatorParams: Record<string, Record<string, number>>;
  setIndicatorParams: (params: Record<string, Record<string, number>>) => void;
}

const availableSetups = [
  "RSI<30",
  "RSI>70",
  "Vol↑",
  "EMA Cross",
  "Breakout",
  "Support",
  "Resistance",
  "MACD Cross",
];

export function AdvancedFilters({
  onlyActiveSetups,
  setOnlyActiveSetups,
  minVolume,
  setMinVolume,
  trendFilter,
  setTrendFilter,
  minScore,
  setMinScore,
  rsiRange,
  setRsiRange,
  selectedSetups,
  setSelectedSetups,
  viewMode,
  setViewMode,
  selectedIndicators,
  setSelectedIndicators,
  indicatorParams,
  setIndicatorParams,
}: AdvancedFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showIndicators, setShowIndicators] = useState(false);

  const handleResetFilters = () => {
    setOnlyActiveSetups(false);
    setMinVolume("0");
    setTrendFilter("all");
    setMinScore(0);
    setRsiRange([0, 100]);
    setSelectedSetups([]);
    setSelectedIndicators([]);
    setIndicatorParams({});
  };

  const handleSetupToggle = (setup: string) => {
    setSelectedSetups((prev) =>
      prev.includes(setup) ? prev.filter((s) => s !== setup) : [...prev, setup]
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (onlyActiveSetups) count++;
    if (minVolume !== "0") count++;
    if (trendFilter !== "all") count++;
    if (minScore > 0) count++;
    if (rsiRange[0] > 0 || rsiRange[1] < 100) count++;
    if (selectedSetups.length > 0) count++;
    if (selectedIndicators.length > 0) count++;
    return count;
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-4">
          {/* Basic Filters Row */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="active-setups"
                checked={onlyActiveSetups}
                onCheckedChange={setOnlyActiveSetups}
              />
              <Label htmlFor="active-setups" className="text-sm font-medium">
                Sólo setups activos
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Volumen mínimo:
              </Label>
              <Select value={minVolume} onValueChange={setMinVolume}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0M</SelectItem>
                  <SelectItem value="20M">20M</SelectItem>
                  <SelectItem value="50M">50M</SelectItem>
                  <SelectItem value="100M">100M</SelectItem>
                  <SelectItem value="200M">200M</SelectItem>
                  <SelectItem value="500M">500M</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Tendencia:
              </Label>
              <Select value={trendFilter} onValueChange={setTrendFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="up">Alcista</SelectItem>
                  <SelectItem value="down">Bajista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowIndicators(!showIndicators)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Indicadores
                {selectedIndicators.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {selectedIndicators.length}
                  </Badge>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros Avanzados
                {getActiveFiltersCount() > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>

              <Separator orientation="vertical" className="h-6" />

              <Label className="text-sm font-medium text-muted-foreground">
                Vista:
              </Label>
              <Select
                value={viewMode}
                onValueChange={(value: "table" | "cards") => setViewMode(value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">Tabla</SelectItem>
                  <SelectItem value="cards">Tarjetas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Score Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Score Mínimo: {minScore}
                  </Label>
                  <Slider
                    value={[minScore]}
                    onValueChange={(value) => setMinScore(value[0])}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span>100</span>
                  </div>
                </div>

                {/* RSI Range Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    RSI Rango: {rsiRange[0]} - {rsiRange[1]}
                  </Label>
                  <Slider
                    value={rsiRange}
                    onValueChange={(value) =>
                      setRsiRange(value as [number, number])
                    }
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0 (Oversold)</span>
                    <span>100 (Overbought)</span>
                  </div>
                </div>

                {/* Setup Type Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tipos de Setup</Label>
                  <div className="flex flex-wrap gap-1">
                    {availableSetups.map((setup) => (
                      <Badge
                        key={setup}
                        variant={
                          selectedSetups.includes(setup) ? "default" : "outline"
                        }
                        className="cursor-pointer text-xs hover:bg-primary/80"
                        onClick={() => handleSetupToggle(setup)}
                      >
                        {setup}
                      </Badge>
                    ))}
                  </div>
                  {selectedSetups.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {selectedSetups.length} setup(s) seleccionado(s)
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {showIndicators && (
        <IndicatorsPanel
          selectedIndicators={selectedIndicators}
          setSelectedIndicators={setSelectedIndicators}
          indicatorParams={indicatorParams}
          setIndicatorParams={setIndicatorParams}
        />
      )}
    </div>
  );
}
