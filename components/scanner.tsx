"use client";

import type React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdvancedFilters } from "./advanced-filters";
import { TableView } from "./TableView";
import { ScannerCard } from "./ScannerCard";
import { ScannerTableSkeleton } from "./skeletons/ScannerTableSkeleton";
import { ScannerCardSkeleton } from "./skeletons/ScannerCardSkeleton";
import { useScanner } from "@/hooks/useScanner";

export function Scanner() {
  const {
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
    filteredAndSortedPairs,
    formatVolume,
    getSetupBadgeColor,
    loading,
  } = useScanner();

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
        loading ? (
          <ScannerTableSkeleton />
        ) : (
          <TableView
            filteredAndSortedPairs={filteredAndSortedPairs}
            getSetupBadgeColor={getSetupBadgeColor}
            formatVolume={formatVolume}
          />
        )
      ) : loading ? (
        <ScannerCardSkeleton />
      ) : (
        <ScannerCard
          filteredAndSortedPairs={[]}
          formatVolume={function (volume: number): string {
            throw new Error("Function not implemented.");
          }}
          getSetupBadgeColor={function (setup: string): string {
            throw new Error("Function not implemented.");
          }}
        />
      )}

      {!loading && filteredAndSortedPairs.length === 0 && (
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
