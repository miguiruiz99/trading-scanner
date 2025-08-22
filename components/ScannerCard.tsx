import { TrendingUp, TrendingDown, Volume2, Badge } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { CryptoPair } from "@/lib/mock-data";

export const ScannerCard = ({
  filteredAndSortedPairs,
  handlePairClick,
  formatVolume,
  getSetupBadgeColor,
}: {
  filteredAndSortedPairs: CryptoPair[];
  handlePairClick: (pair: string) => void;
  formatVolume: (volume: number) => string;
  getSetupBadgeColor: (setup: string) => string;
}) => (
  <div className="grid gap-4">
    {filteredAndSortedPairs.map((pair) => (
      <Card
        key={pair.pair}
        className="p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => handlePairClick(pair.pair)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold">{pair.pair}</h3>
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
              ${pair.price.toLocaleString()}
            </div>
            <div
              className={`text-sm ${
                pair.change24h >= 0 ? "text-trading-green" : "text-trading-red"
              }`}
            >
              {pair.change24h >= 0 ? "+" : ""}
              {pair.change24h.toFixed(2)}% 24h
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 mb-1">
              <Volume2 className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-medium">
                {formatVolume(pair.volume24h)}
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
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handlePairClick(pair.pair);
            }}
          >
            Ver Detalle
          </Button>
        </div>
      </Card>
    ))}
  </div>
);
