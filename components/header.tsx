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
import { RefreshCw, Activity, Clock, Database, Wifi } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { toggleDataSource, getServiceStatus } from "@/lib/data-service";

interface HeaderProps {
  timeframe: string;
  setTimeframe: (value: string) => void;
}

export function Header({ timeframe, setTimeframe }: HeaderProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState("2 min");
  const [autoScan, setAutoScan] = useState(true);
  const [nextScanIn, setNextScanIn] = useState(300); // 5 minutes in seconds
  const [useRealData, setUseRealData] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    // Obtener estado inicial del servicio de datos
    const status = getServiceStatus();
    setUseRealData(status.useRealData);
  }, []);

  useEffect(() => {
    if (!autoScan) return;

    const interval = setInterval(() => {
      setNextScanIn((prev) => {
        if (prev <= 1) {
          handleScan();
          return 300; // Reset to 5 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoScan]);

  const handleScan = async () => {
    setIsScanning(true);
    // Simulate scan delay
    setTimeout(() => {
      setIsScanning(false);
      setLastScan("Ahora");
      setNextScanIn(300); // Reset countdown
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleToggleDataSource = async () => {
    setIsToggling(true);
    try {
      const success = await toggleDataSource();
      if (success) {
        const status = getServiceStatus();
        setUseRealData(status.useRealData);
      }
    } catch (error) {
      console.error("Error toggling data source:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const getTimeframeLabel = (tf: string) => {
    const labels: Record<string, string> = {
      "5m": "5 Minutos",
      "15m": "15 Minutos",
      "1h": "1 Hora",
      "4h": "4 Horas",
      "1d": "1 Día",
    };
    return labels[tf] || tf;
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
              <Select value={timeframe} onValueChange={setTimeframe}>
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
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Último scan:
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Hace {lastScan}
                  </Badge>
                </div>
                {autoScan && !isScanning && (
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Próximo en {formatTime(nextScanIn)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />

              <Button
                variant={useRealData ? "default" : "outline"}
                size="sm"
                onClick={handleToggleDataSource}
                disabled={isToggling}
                className="gap-2"
              >
                {useRealData ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                {isToggling
                  ? "Cambiando..."
                  : useRealData
                  ? "Datos Reales"
                  : "Datos Mock"}
              </Button>

              <Button
                variant={autoScan ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoScan(!autoScan)}
                className="gap-2"
              >
                <Activity
                  className={`h-4 w-4 ${autoScan ? "animate-pulse" : ""}`}
                />
                Auto-Scan
              </Button>

              <Button
                onClick={handleScan}
                disabled={isScanning}
                className="gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isScanning ? "animate-spin" : ""}`}
                />
                {isScanning ? "Escaneando..." : "Scan Manual"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
