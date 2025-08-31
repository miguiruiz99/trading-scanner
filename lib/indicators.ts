// TS utilities para indicadores y setups.

import {
  RSI,
  EMA,
  SMA,
  ADX as TA_ADX,
  BollingerBands,
} from "technicalindicators";

/* =========================
 * Tipos básicos
 * ========================= */
export type Candle = {
  time: number; // epoch seconds (closeTime)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type OHLCV = {
  close: number[];
  high: number[];
  low: number[];
  open: number[];
  volume: number[];
  time: number[];
};

// Tipos de setups disponibles (alineado con la UI)
export type SetupBadge =
  | "RSI<30 + Vol↑"
  | "RSI>70"
  | "EMA20↕EMA50"
  | "EMA50↕EMA200"
  | "Pullback EMA (alcista)"
  | "Breakout + Vol"
  | "Volumen spike"
  | "Squeeze→Ruptura";

// Tipo para las bandas de Bollinger
export type BollingerResult = {
  upper: number;
  middle: number;
  lower: number;
};

export type EvalResult = {
  badges: SetupBadge[];
  score: number;
  why: string[];
  indicators: {
    rsi?: number;
    ema20?: number;
    ema50?: number;
    ema200?: number;
    adx?: number;
    bb?: {
      upper?: number;
      middle?: number;
      lower?: number;
      bandwidth?: number;
    };
    volSma20?: number;
  };
};

/* =========================
 * Helpers
 * ========================= */

// Convierte klines (array crudo de Binance) -> Candle[]
export function mapKlinesToCandles(klines: any[]): Candle[] {
  return klines.map((k) => ({
    time: Math.floor(k[6] / 1000),
    open: +k[1],
    high: +k[2],
    low: +k[3],
    close: +k[4],
    volume: +k[5],
  }));
}

// Construye series OHLCV desde candles
export function toSeries(data: Candle[]): OHLCV {
  const close: number[] = [];
  const high: number[] = [];
  const low: number[] = [];
  const open: number[] = [];
  const volume: number[] = [];
  const time: number[] = [];
  for (const d of data) {
    close.push(d.close);
    high.push(d.high);
    low.push(d.low);
    open.push(d.open);
    volume.push(d.volume);
    time.push(d.time);
  }
  return { close, high, low, open, volume, time };
}

// Devuelve el último valor de un array (o undefined)
const last = <T>(arr: T[]): T | undefined => arr[arr.length - 1];

// Alinea un indicador (más corto) con el final de la serie base y devuelve su último valor
function lastAlignedValue(
  values: number[],
  baseLen: number
): number | undefined {
  if (!values?.length) return undefined;
  const pad = baseLen - values.length;
  if (pad < 0) return undefined;
  return values[values.length - 1];
}

/* =========================
 * Indicadores clásicos
 * ========================= */

export function rsi(values: number[], period = 14) {
  return RSI.calculate({ values, period });
}

export function ema(values: number[], period: number) {
  return EMA.calculate({ values, period });
}

export function sma(values: number[], period: number) {
  return SMA.calculate({ values, period });
}

export function adx(
  high: number[],
  low: number[],
  close: number[],
  period = 14
) {
  // technicalindicators.ADX devuelve objetos { pdi, mdi, adx }
  return TA_ADX.calculate({ high, low, close, period });
}

export function bollinger(
  values: number[],
  period = 20,
  stdDev = 2
): BollingerResult[] {
  return BollingerBands.calculate({
    period,
    values,
    stdDev,
  }) as BollingerResult[];
}

// BandWidth = (Upper - Lower) / Middle
export function bollingerBandwidth(
  values: number[],
  period = 20,
  stdDev = 2
): (number | undefined)[] {
  const bb = bollinger(values, period, stdDev);
  return bb.map((b: BollingerResult) =>
    b.middle && b.upper !== undefined && b.lower !== undefined && b.middle !== 0
      ? (b.upper - b.lower) / b.middle
      : undefined
  );
}

/* =========================
 * Setups (reglas evaluables)
 * ========================= */

export function evalSetups(data: Candle[]): EvalResult {
  if (!data?.length) {
    return { badges: [], score: 0, why: [], indicators: {} };
  }
  // if (!data?.length || data.length < 220) {
  //   return { badges: [], score: 0, why: [], indicators: {} };
  // }

  // Trabajamos SIEMPRE con velas cerradas (asume que ya recortaste la vela viva fuera)
  const { close, high, low, volume } = toSeries(data);
  const n = close.length;
  const c = last(close)!;
  const v = last(volume)!;

  // Indicadores principales
  const rsi14Arr = rsi(close, 14);
  const ema20Arr = ema(close, 20);
  const ema50Arr = ema(close, 50);
  // const ema200Arr = ema(close, 200);
  const volSma20Arr = sma(volume, 20);
  const adx14Arr = adx(high, low, close, 14);
  const bbArr = bollinger(close, 20, 2);
  const bwArr = bollingerBandwidth(close, 20, 2);

  const rsiLast = lastAlignedValue(rsi14Arr, n);
  const e20 = lastAlignedValue(ema20Arr, n);
  const e50 = lastAlignedValue(ema50Arr, n);
  // const e200 = lastAlignedValue(ema200Arr, n);
  const vS20 = lastAlignedValue(volSma20Arr, n);
  const adxLast = last(alx(adx14Arr)); // helper abajo
  const bbLast = last(bbArr);
  const bwLast = lastAlignedValue(bwArr as any, n);

  const badges: SetupBadge[] = [];
  const why: string[] = [];
  let score = 0;

  // 1) RSI extremos (con y sin volumen)
  if (rsiLast !== undefined && vS20 !== undefined) {
    if (rsiLast < 30 && v >= 1.5 * vS20) {
      badges.push("RSI<30 + Vol↑");
      score += 2;
      why.push(`RSI ${rsiLast.toFixed(1)} < 30 & Vol≥1.5×SMA20`);
    } else if (rsiLast > 70) {
      badges.push("RSI>70");
      score += 1;
      why.push(`RSI ${rsiLast.toFixed(1)} > 70`);
    }
  }

  // 2) Cruces de EMAs
  // Señal cuando la EMA más corta supera a la más larga en esta vela respecto a la anterior
  const cross20_50 = crossed(ema20Arr, ema50Arr);
  if (cross20_50) {
    badges.push("EMA20↕EMA50");
    score += 2;
    why.push(`Cruce EMA20/EMA50: ${cross20_50}`);
  }
  // const cross50_200 = crossed(ema50Arr, ema200Arr);
  // if (cross50_200) {
  //   badges.push("EMA50↕EMA200");
  //   score += 3;
  //   why.push(`Cruce EMA50/EMA200: ${cross50_200}`);
  // }

  // 3) Pullback en tendencia alcista (EMA50>EMA200 y close≈EMA20 sin perder EMA50)
  // if (e50 !== undefined && e200 !== undefined && e20 !== undefined) {
  //   if (e50 > e200) {
  //     const nearE20 = Math.abs(c - e20) / e20 <= 0.003; // 0.3%
  //     const aboveE50 = c >= e50;
  //     if (nearE20 && aboveE50) {
  //       badges.push("Pullback EMA (alcista)");
  //       score += 2;
  //       why.push("EMA50>EMA200 y precio en pullback a EMA20 sin perder EMA50");
  //     }
  //   }
  // }

  // 4) Breakout + Volumen (cierre > max últimos 20 y Vol≥2×SMA20)
  if (vS20 !== undefined) {
    const hh20 = Math.max(...high.slice(n - 21, n - 1));
    if (c > hh20 && v >= 2 * vS20) {
      badges.push("Breakout + Vol");
      score += 3;
      why.push("Cierre > Máximo 20 y Vol≥2×SMA20");
    }
  }

  // 5) Volumen spike puro
  if (vS20 !== undefined && v >= 3 * vS20) {
    badges.push("Volumen spike");
    score += 1;
    why.push("Volumen ≥ 3×SMA20 (spike)");
  }

  // 6) Squeeze→Ruptura (BandWidth en percentil bajo y cierre fuera de banda)
  if (bbLast && bwLast !== undefined) {
    const isLowBW = isLowPercentile(bwArr.filter(Boolean) as number[], 0.2); // p20 en ventana disponible
    const closeAbove = c > (bbLast.upper ?? Infinity);
    const closeBelow = c < (bbLast.lower ?? -Infinity);
    if (isLowBW && (closeAbove || closeBelow)) {
      badges.push("Squeeze→Ruptura");
      score += 2;
      why.push("BandWidth bajo + cierre fuera de banda");
    }
  }

  // Contexto tendencia y fuerza (bonus)
  // if (e50 !== undefined && e200 !== undefined && e50 > e200) score += 1; // tendencia a favor
  if (adxLast !== undefined && adxLast >= 25) score += 1; // fuerza de tendencia

  return {
    badges,
    score,
    why,
    indicators: {
      rsi: rsiLast,
      ema20: e20,
      ema50: e50,
      // ema200: e200,
      adx: adxLast,
      bb: bbLast
        ? {
            upper: bbLast.upper,
            middle: bbLast.middle,
            lower: bbLast.lower,
            bandwidth: bwLast,
          }
        : {},
      volSma20: vS20,
    },
  };
}

/* =========================
 * Utilidades de reglas
 * ========================= */

// Detecta cruce de A sobre B (o viceversa) en la última barra: 'up' | 'down' | null
function crossed(a: number[], b: number[]): "up" | "down" | null {
  if (a.length < 2 || b.length < 2) return null;
  // Alineamos por el final; tomamos penúltimo y último de cada uno
  const a1 = a[a.length - 2],
    a2 = a[a.length - 1];
  const b1 = b[b.length - 2],
    b2 = b[b.length - 1];
  if ([a1, a2, b1, b2].some((v) => v === undefined)) return null;
  if (a1 <= b1 && a2 > b2) return "up";
  if (a1 >= b1 && a2 < b2) return "down";
  return null;
}

// Devuelve el último ADX del array de objetos de technicalindicators
function alx(arr: Array<{ adx: number }>): number[] {
  return arr.map((x) => x.adx).filter((v) => typeof v === "number");
}

// ¿Está el último valor del array dentro del percentil bajo (ej. 0.2)?
function isLowPercentile(series: number[], p = 0.2): boolean {
  if (!series.length) return false;
  const sorted = [...series].sort((x, y) => x - y);
  const idx = Math.max(0, Math.floor(sorted.length * p) - 1);
  const threshold = sorted[idx];
  const lastVal = series[series.length - 1];
  return lastVal <= threshold;
}

/* =========================
 * API de "todo-en-uno"
 * ========================= */

// Calcula y devuelve un resumen listo para tu panel (score + badges + indicadores clave)
export function evaluateFromCandles(candles: Candle[]): EvalResult {
  // Asume candles en ASC y sin vela viva. Si no estás seguro, corta la última:
  // const safe = candles.slice(0, -1);
  return evalSetups(candles);
}

// Atajo: si recibes klines crudos (Binance), mapea y evalúa
export function evaluateFromKlines(klines: any[]): EvalResult {
  const candles = mapKlinesToCandles(klines).slice(0, -1); // tira la vela viva por seguridad
  return evalSetups(candles);
}
