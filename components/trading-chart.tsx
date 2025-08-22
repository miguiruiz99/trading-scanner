"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type LineData,
  type HistogramData,
} from "lightweight-charts";
import { useTheme } from "next-themes";
import type { CandleData, IndicatorData } from "@/lib/mock-data";

interface TradingChartProps {
  candles: CandleData[];
  ema20: IndicatorData[];
  ema50: IndicatorData[];
  ema200: IndicatorData[];
  rsi: IndicatorData[];
  chartType: "candles" | "line";
  height?: number;
}

export function TradingChart({
  candles,
  ema20,
  ema50,
  ema200,
  rsi,
  chartType,
  height = 400,
}: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const volumeContainerRef = useRef<HTMLDivElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const volumeChartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (
      !chartContainerRef.current ||
      !volumeContainerRef.current ||
      !rsiContainerRef.current
    )
      return;

    const isDark = theme === "dark";

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: {
          type: ColorType.Solid,
          color: isDark ? "#0a0a0a" : "#ffffff",
        },
        textColor: isDark ? "#d1d5db" : "#374151",
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      grid: {
        vertLines: { color: isDark ? "#1f2937" : "#f3f4f6" },
        horzLines: { color: isDark ? "#1f2937" : "#f3f4f6" },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: isDark ? "#374151" : "#d1d5db",
      },
      timeScale: {
        borderColor: isDark ? "#374151" : "#d1d5db",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const volumeChart = createChart(volumeContainerRef.current, {
      layout: {
        background: {
          type: ColorType.Solid,
          color: isDark ? "#0a0a0a" : "#ffffff",
        },
        textColor: isDark ? "#d1d5db" : "#374151",
      },
      width: volumeContainerRef.current.clientWidth,
      height: 100,
      grid: {
        vertLines: { color: isDark ? "#1f2937" : "#f3f4f6" },
        horzLines: { color: isDark ? "#1f2937" : "#f3f4f6" },
      },
      rightPriceScale: {
        borderColor: isDark ? "#374151" : "#d1d5db",
      },
      timeScale: {
        borderColor: isDark ? "#374151" : "#d1d5db",
        visible: false,
      },
    });

    const rsiChart = createChart(rsiContainerRef.current, {
      layout: {
        background: {
          type: ColorType.Solid,
          color: isDark ? "#0a0a0a" : "#ffffff",
        },
        textColor: isDark ? "#d1d5db" : "#374151",
      },
      width: rsiContainerRef.current.clientWidth,
      height: 120,
      grid: {
        vertLines: { color: isDark ? "#1f2937" : "#f3f4f6" },
        horzLines: { color: isDark ? "#1f2937" : "#f3f4f6" },
      },
      rightPriceScale: {
        borderColor: isDark ? "#374151" : "#d1d5db",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: isDark ? "#374151" : "#d1d5db",
        visible: false,
      },
    });

    chartRef.current = chart;
    volumeChartRef.current = volumeChart;
    rsiChartRef.current = rsiChart;

    let priceSeries: ISeriesApi<"Candlestick"> | ISeriesApi<"Line">;

    if (chartType === "candles") {
      priceSeries = chart.addCandlestickSeries({
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderDownColor: "#ef4444",
        borderUpColor: "#22c55e",
        wickDownColor: "#ef4444",
        wickUpColor: "#22c55e",
      });

      const candleData: CandlestickData[] = candles.map((candle) => ({
        time: candle.time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }));

      priceSeries.setData(candleData);
    } else {
      priceSeries = chart.addLineSeries({
        color: "#3b82f6",
        lineWidth: 2,
      });

      const lineData: LineData[] = candles.map((candle) => ({
        time: candle.time,
        value: candle.close,
      }));

      priceSeries.setData(lineData);
    }

    if (ema20.length > 0) {
      const ema20Series = chart.addLineSeries({
        color: "#3b82f6",
        lineWidth: 1,
        title: "EMA 20",
      });
      ema20Series.setData(ema20.map((d) => ({ time: d.time, value: d.value })));
    }

    if (ema50.length > 0) {
      const ema50Series = chart.addLineSeries({
        color: "#f59e0b",
        lineWidth: 1,
        title: "EMA 50",
      });
      ema50Series.setData(ema50.map((d) => ({ time: d.time, value: d.value })));
    }

    if (ema200.length > 0) {
      const ema200Series = chart.addLineSeries({
        color: "#ef4444",
        lineWidth: 1,
        title: "EMA 200",
      });
      ema200Series.setData(
        ema200.map((d) => ({ time: d.time, value: d.value }))
      );
    }

    const volumeSeries = volumeChart.addHistogramSeries({
      color: "#64748b",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "",
    });

    const volumeData: HistogramData[] = candles.map((candle) => ({
      time: candle.time,
      value: candle.volume,
      color: candle.close >= candle.open ? "#22c55e" : "#ef4444",
    }));

    volumeSeries.setData(volumeData);

    const rsiSeries = rsiChart.addLineSeries({
      color: "#8b5cf6",
      lineWidth: 2,
    });

    if (rsi.length > 0) {
      rsiSeries.setData(rsi.map((d) => ({ time: d.time, value: d.value })));
    }

    // Add RSI levels (30 and 70)
    const rsiOverbought = rsiChart.addLineSeries({
      color: "#ef4444",
      lineWidth: 1,
      lineStyle: 2, // dashed
    });
    const rsiOversold = rsiChart.addLineSeries({
      color: "#22c55e",
      lineWidth: 1,
      lineStyle: 2, // dashed
    });

    if (rsi.length > 0) {
      rsiOverbought.setData(rsi.map((d) => ({ time: d.time, value: 70 })));
      rsiOversold.setData(rsi.map((d) => ({ time: d.time, value: 30 })));
    }

    const handleResize = () => {
      if (
        chartContainerRef.current &&
        volumeContainerRef.current &&
        rsiContainerRef.current
      ) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        volumeChart.applyOptions({
          width: volumeContainerRef.current.clientWidth,
        });
        rsiChart.applyOptions({ width: rsiContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      volumeChart.remove();
      rsiChart.remove();
    };
  }, [candles, ema20, ema50, ema200, rsi, chartType, theme, height]);

  return (
    <div className="space-y-4">
      {/* Main Price Chart */}
      <div className="bg-card rounded-lg border">
        <div ref={chartContainerRef} />
      </div>

      {/* Volume Chart */}
      <div className="bg-card rounded-lg border">
        <div ref={volumeContainerRef} />
      </div>

      {/* RSI Chart */}
      <div className="bg-card rounded-lg border">
        <div ref={rsiContainerRef} />
      </div>
    </div>
  );
}
