"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { Activity } from "lucide-react";

export type Timeframe = "5m" | "15m" | "1h" | "4h" | "1d";

export const TimeframeLabels: Record<Timeframe, string> = {
  "5m": "5 Minutos",
  "15m": "15 Minutos",
  "1h": "1 Hora",
  "4h": "4 Horas",
  "1d": "1 Día",
};

interface HeaderProps {
  timeframe: Timeframe;
  setTimeframe: (value: Timeframe) => void;
}

export function Header({ timeframe, setTimeframe }: HeaderProps) {
  const getTimeframeLabel = (tf: Timeframe) => {
    return TimeframeLabels[tf] || tf;
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                Crypto Scanner
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Label className="text-sm font-medium text-muted-foreground">
                Timeframe:
              </Label>
              <Select
                value={timeframe}
                onValueChange={(value: Timeframe) => setTimeframe(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5m">5m</SelectItem>
                  <SelectItem value="15m">15m</SelectItem>
                  <SelectItem value="1h">1h</SelectItem>
                  <SelectItem value="4h">4h</SelectItem>
                  <SelectItem value="1d">1d</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="text-xs">
                {getTimeframeLabel(timeframe)}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
