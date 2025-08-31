import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, Volume2 } from "lucide-react";
import { SortBy } from "@/enums/enums";
import { SortButton } from "@/components/SortButton";
import { ScannerPair } from "@/lib/mock-data";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const TableView = ({
  filteredAndSortedPairs,
  getSetupBadgeColor,
  formatVolume,
}: {
  filteredAndSortedPairs: ScannerPair[];
  getSetupBadgeColor: (setup: string) => string;
  formatVolume: (volume: number) => string;
}) => {
  const router = useRouter();
  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">
              <SortButton column={SortBy.SCORE} handleSort={() => {}}>
                Par
              </SortButton>
            </TableHead>
            <TableHead className="text-right">
              <SortButton column={SortBy.PRICE} handleSort={() => {}}>
                Precio
              </SortButton>
            </TableHead>
            <TableHead className="text-center">
              <SortButton column={SortBy.SCORE} handleSort={() => {}}>
                Score
              </SortButton>
            </TableHead>
            <TableHead>Setups</TableHead>
            <TableHead className="text-center">
              <SortButton column={SortBy.RSI} handleSort={() => {}}>
                RSI
              </SortButton>
            </TableHead>
            <TableHead className="text-right">
              <SortButton column={SortBy.VOLUME} handleSort={() => {}}>
                Volumen 24h
              </SortButton>
            </TableHead>
            <TableHead className="text-center">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedPairs.map((pair) => (
            <TableRow
              key={pair.symbol}
              className="hover:bg-muted/30 cursor-pointer"
              onClick={() => router.push(`/${pair.symbol}`)}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{pair.symbol}</span>
                  {pair.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-trading-green" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-trading-red" />
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div>
                  <div className="font-semibold">
                    ${pair.lastPrice.toLocaleString()}
                  </div>
                  <div
                    className={`text-xs ${
                      pair.changePct24h >= 0
                        ? "text-trading-green"
                        : "text-trading-red"
                    }`}
                  >
                    {pair.changePct24h >= 0 ? "+" : ""}
                    {pair.changePct24h.toFixed(2)}%
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="text-xl font-bold text-primary">
                  {pair.score}
                </div>
              </TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell className="text-center">
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
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Volume2 className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">
                    {formatVolume(pair.quoteVolume24h)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Link href={`/${pair.symbol}`}>
                  <Button variant="outline" size="sm">
                    Ver
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
