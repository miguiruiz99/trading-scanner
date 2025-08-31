import { TrendingUp, TrendingDown, Volume2, Badge } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ScannerPair } from "@/lib/mock-data";
import Link from "next/link";

export const ScannerCard = ({
  filteredAndSortedPairs,
  formatVolume,
  getSetupBadgeColor,
}: {
  filteredAndSortedPairs: ScannerPair[];
  formatVolume: (volume: number) => string;
  getSetupBadgeColor: (setup: string) => string;
}) => {
  return (
    <div className="grid gap-4">
      {filteredAndSortedPairs.map((pair) => (
        <Link href={`/${pair.symbol}`} key={pair.symbol}>
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold">{pair.symbol}</h3>
                {pair.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-trading-green" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-trading-red" />
                )}
              </div>
              <div className="text-2xl font-bold text-black">{pair.score}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-lg font-semibold">
                  ${pair.lastPrice.toLocaleString()}
                </div>
                <div
                  className={`text-sm ${
                    pair.changePct24h >= 0
                      ? "text-trading-green"
                      : "text-trading-red"
                  }`}
                >
                  {pair.changePct24h >= 0 ? "+" : ""}
                  {pair.changePct24h.toFixed(2)}% 24h
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <Volume2 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {formatVolume(pair.quoteVolume24h)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  RSI:{" "}
                  <span
                    className={`font-medium ${
                      pair.rsi < 30
                        ? "text-trading-green"
                        : pair.rsi > 70
                        ? "text-trading-red"
                        : "text-muted-foreground"
                    }`}
                  >
                    {Math.round(pair.rsi)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {pair.setups.map((setup, index) => (
                  <Badge
                    key={index}
                    className={`text-xs ${getSetupBadgeColor(setup)}`}
                  >
                    {setup}
                  </Badge>
                ))}
              </div>
              <Link href={`/${pair.symbol}`}>
                <Button variant="outline" size="sm">
                  Ver Detalle
                </Button>
              </Link>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};
