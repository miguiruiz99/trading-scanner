import { AppPairTickers } from "./api-services";

export type ScannerPair = AppPairTickers & {
  score: number;
  rsi: number;
  setups: string[];
  trend: "up" | "down";
  candles: CandleData[];
};

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorData {
  time: number;
  value: number;
}

export interface TradingSetup {
  name: string;
  description: string;
  type: "bullish" | "bearish" | "neutral";
  strength: number;
  timeDetected: number;
}

// export const generateScannerPairs = (
//   pairs: AppPairTickers[]
// ): ScannerPair[] => {
//   const trend = pairs.map((pair) => (pair.changePct24h > 0 ? "up" : "down"));
//   const pairsCandles = pairs.map((pair) =>
//     generateCandleData(pair.symbol, "5m")
//   );
//   const ema20 = pairsCandles.map((candles) => calculateEMA(candles, 20));
//   const ema50 = pairsCandles.map((candles) => calculateEMA(candles, 50));
//   const ema100 = pairsCandles.map((candles) => calculateEMA(candles, 100));
//   const rsi = pairsCandles.map((candles) => calculateRSI(candles, 14));
//   const setups = pairs.map((pair) => generateTradingSetups(pair.symbol));

//   return pairs.map((pair) => ({
//     ...pair,
//     score: 0,
//     rsi: 0,
//     setups: [],
//   }));
// };

// Generate realistic candle data
// export function generateCandleData(
//   pair: string,
//   timeframe: string,
//   periods = 100
// ): CandleData[] {
//   const candles: CandleData[] = [];
//   let currentPrice = pair;
//   const now = Date.now();

//   // Timeframe to milliseconds
//   const timeframeMs =
//     {
//       "1m": 60 * 1000,
//       "5m": 5 * 60 * 1000,
//       "15m": 15 * 60 * 1000,
//       "1h": 60 * 60 * 1000,
//       "4h": 4 * 60 * 60 * 1000,
//       "1d": 24 * 60 * 60 * 1000,
//     }[timeframe] || 60 * 60 * 1000;

//   for (let i = periods; i >= 0; i--) {
//     const time = now - i * timeframeMs;
//     const open = currentPrice;

//     // More realistic price movement based on volatility
//     const volatility =
//       {
//         BTCUSDT: 0.015,
//         ETHUSDT: 0.025,
//         ADAUSDT: 0.035,
//         SOLUSDT: 0.04,
//         DOTUSDT: 0.045,
//         LINKUSDT: 0.03,
//         MATICUSDT: 0.05,
//         AVAXUSDT: 0.055,
//         ATOMUSDT: 0.04,
//         FTMUSDT: 0.06,
//       }[pair] || 0.03;

//     const trend = basePair.trend === "up" ? 0.0002 : -0.0002;
//     const randomChange = (Math.random() - 0.5) * volatility + trend;

//     const high =
//       open * (1 + Math.abs(randomChange) + Math.random() * volatility * 0.5);
//     const low =
//       open * (1 - Math.abs(randomChange) - Math.random() * volatility * 0.5);
//     const close = open * (1 + randomChange);

//     // Volume varies by timeframe and pair popularity
//     const baseVolume =
//       basePair.volume24h / ((24 * 60) / (timeframeMs / (60 * 1000)));
//     const volume = baseVolume * (0.5 + Math.random() * 1.5);

//     candles.push({
//       time: Math.floor(time / 1000),
//       open,
//       high,
//       low,
//       close,
//       volume,
//     });

//     currentPrice = close;
//   }

//   return candles;
// }

// Calculate technical indicators
export function calculateEMA(
  data: CandleData[],
  period: number
): IndicatorData[] {
  const ema: IndicatorData[] = [];
  const multiplier = 2 / (period + 1);

  if (data.length === 0) return ema;

  // First EMA is just the first close price
  ema.push({ time: data[0].time, value: data[0].close });

  for (let i = 1; i < data.length; i++) {
    const value =
      (data[i].close - ema[i - 1].value) * multiplier + ema[i - 1].value;
    ema.push({ time: data[i].time, value });
  }

  return ema;
}

export function calculateRSI(data: CandleData[], period = 14): IndicatorData[] {
  const rsi: IndicatorData[] = [];

  if (data.length < period + 1) return rsi;

  let gains = 0;
  let losses = 0;

  // Calculate initial average gain and loss
  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change > 0) gains += change;
    else losses -= change;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgGain / avgLoss;
    const rsiValue = 100 - 100 / (1 + rs);

    rsi.push({ time: data[i].time, value: rsiValue });
  }

  return rsi;
}

export function calculateSMA(
  data: CandleData[],
  period: number
): IndicatorData[] {
  const sma: IndicatorData[] = [];

  if (data.length < period) return sma;

  for (let i = period - 1; i < data.length; i++) {
    const sum = data
      .slice(i - period + 1, i + 1)
      .reduce((acc, candle) => acc + candle.close, 0);
    sma.push({ time: data[i].time, value: sum / period });
  }

  return sma;
}

export function calculateBollingerBands(
  data: CandleData[],
  period = 20,
  stdDev = 2
): {
  upper: IndicatorData[];
  middle: IndicatorData[];
  lower: IndicatorData[];
  bandwidth: IndicatorData[];
} {
  const sma = calculateSMA(data, period);
  const upper: IndicatorData[] = [];
  const lower: IndicatorData[] = [];
  const bandwidth: IndicatorData[] = [];

  for (let i = 0; i < sma.length; i++) {
    const dataIndex = i + period - 1;
    const slice = data.slice(dataIndex - period + 1, dataIndex + 1);
    const mean = sma[i].value;
    const variance =
      slice.reduce((acc, candle) => acc + Math.pow(candle.close - mean, 2), 0) /
      period;
    const standardDeviation = Math.sqrt(variance);

    const upperValue = mean + standardDeviation * stdDev;
    const lowerValue = mean - standardDeviation * stdDev;
    const bandwidthValue = (upperValue - lowerValue) / mean;

    upper.push({ time: sma[i].time, value: upperValue });
    lower.push({ time: sma[i].time, value: lowerValue });
    bandwidth.push({ time: sma[i].time, value: bandwidthValue });
  }

  return { upper, middle: sma, lower, bandwidth };
}

export function calculateADX(data: CandleData[], period = 14): IndicatorData[] {
  const adx: IndicatorData[] = [];

  if (data.length < period + 1) return adx;

  const trueRanges: number[] = [];
  const plusDMs: number[] = [];
  const minusDMs: number[] = [];

  // Calculate True Range, +DM, -DM
  for (let i = 1; i < data.length; i++) {
    const high = data[i].high;
    const low = data[i].low;
    const prevHigh = data[i - 1].high;
    const prevLow = data[i - 1].low;
    const prevClose = data[i - 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    const plusDM =
      high - prevHigh > prevLow - low ? Math.max(high - prevHigh, 0) : 0;
    const minusDM =
      prevLow - low > high - prevHigh ? Math.max(prevLow - low, 0) : 0;

    trueRanges.push(tr);
    plusDMs.push(plusDM);
    minusDMs.push(minusDM);
  }

  // Calculate smoothed values and ADX
  for (let i = period - 1; i < trueRanges.length; i++) {
    const avgTR =
      trueRanges.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) /
      period;
    const avgPlusDM =
      plusDMs.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
    const avgMinusDM =
      minusDMs.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;

    const plusDI = (avgPlusDM / avgTR) * 100;
    const minusDI = (avgMinusDM / avgTR) * 100;
    const dx = (Math.abs(plusDI - minusDI) / (plusDI + minusDI)) * 100;

    adx.push({ time: data[i + 1].time, value: dx });
  }

  return adx;
}

// Generate trading setups based on technical analysis
export function generateTradingSetups(
  candles: CandleData[],
  ema20: IndicatorData[],
  ema50: IndicatorData[],
  rsi: IndicatorData[]
): TradingSetup[] {
  const setups: TradingSetup[] = [];

  if (
    candles.length < 2 ||
    ema20.length < 2 ||
    ema50.length < 2 ||
    rsi.length < 1
  ) {
    return setups;
  }

  const latestCandle = candles[candles.length - 1];
  const prevCandle = candles[candles.length - 2];
  const latestEMA20 = ema20[ema20.length - 1];
  const prevEMA20 = ema20[ema20.length - 2];
  const latestEMA50 = ema50[ema50.length - 1];
  const prevEMA50 = ema50[ema50.length - 2];
  const latestRSI = rsi[rsi.length - 1];

  // EMA Cross
  if (
    prevEMA20.value <= prevEMA50.value &&
    latestEMA20.value > latestEMA50.value
  ) {
    setups.push({
      name: "EMA Cross",
      description: "EMA 20 cruzó por encima de EMA 50 (Golden Cross)",
      type: "bullish",
      strength: 8,
      timeDetected: latestCandle.time,
    });
  } else if (
    prevEMA20.value >= prevEMA50.value &&
    latestEMA20.value < latestEMA50.value
  ) {
    setups.push({
      name: "EMA Cross",
      description: "EMA 20 cruzó por debajo de EMA 50 (Death Cross)",
      type: "bearish",
      strength: 8,
      timeDetected: latestCandle.time,
    });
  }

  // RSI Conditions
  if (latestRSI.value < 30) {
    setups.push({
      name: "RSI<30",
      description: "RSI en zona de sobreventa, posible rebote",
      type: "bullish",
      strength: 7,
      timeDetected: latestCandle.time,
    });
  } else if (latestRSI.value > 70) {
    setups.push({
      name: "RSI>70",
      description: "RSI en zona de sobrecompra, posible corrección",
      type: "bearish",
      strength: 7,
      timeDetected: latestCandle.time,
    });
  }

  // Volume Analysis
  const avgVolume =
    candles.slice(-10).reduce((sum, c) => sum + c.volume, 0) / 10;
  if (latestCandle.volume > avgVolume * 1.5) {
    setups.push({
      name: "Vol↑",
      description: "Volumen por encima del promedio, confirma movimiento",
      type: "neutral",
      strength: 6,
      timeDetected: latestCandle.time,
    });
  }

  // Breakout Detection
  const highestHigh = Math.max(...candles.slice(-20).map((c) => c.high));
  const lowestLow = Math.min(...candles.slice(-20).map((c) => c.low));

  if (latestCandle.close > highestHigh * 0.999) {
    setups.push({
      name: "Breakout",
      description: "Precio rompió resistencia de 20 períodos",
      type: "bullish",
      strength: 9,
      timeDetected: latestCandle.time,
    });
  } else if (latestCandle.close < lowestLow * 1.001) {
    setups.push({
      name: "Breakdown",
      description: "Precio rompió soporte de 20 períodos",
      type: "bearish",
      strength: 9,
      timeDetected: latestCandle.time,
    });
  }

  return setups;
}

export function generateAdvancedTradingSetups(
  candles: CandleData[],
  ema20: IndicatorData[],
  ema50: IndicatorData[],
  ema200: IndicatorData[],
  rsi: IndicatorData[],
  selectedIndicators: string[] = [],
  indicatorParams: Record<string, Record<string, number>> = {}
): TradingSetup[] {
  const setups: TradingSetup[] = [];

  if (candles.length < 21) return setups;

  const latestCandle = candles[candles.length - 1];
  const prevCandle = candles[candles.length - 2];
  const latestRSI = rsi[rsi.length - 1];
  const latestEMA20 = ema20[ema20.length - 1];
  const prevEMA20 = ema20[ema20.length - 2];
  const latestEMA50 = ema50[ema50.length - 1];
  const prevEMA50 = ema50[ema50.length - 2];
  const latestEMA200 = ema200[ema200.length - 1];

  // 1. RSI Extremos
  if (selectedIndicators.includes("rsi_extremes")) {
    const params = indicatorParams.rsi_extremes || {
      oversold: 30,
      overbought: 70,
    };

    if (latestRSI.value < params.oversold) {
      setups.push({
        name: "RSI Extremo",
        description: `RSI(${params.period || 14}) < ${
          params.oversold
        } - Zona de sobreventa`,
        type: "bullish",
        strength: 8,
        timeDetected: latestCandle.time,
      });
    } else if (latestRSI.value > params.overbought) {
      setups.push({
        name: "RSI Extremo",
        description: `RSI(${params.period || 14}) > ${
          params.overbought
        } - Zona de sobrecompra`,
        type: "bearish",
        strength: 8,
        timeDetected: latestCandle.time,
      });
    }
  }

  // 2. Cruce de EMAs
  if (selectedIndicators.includes("ema_cross")) {
    // EMA20 x EMA50
    if (
      prevEMA20.value <= prevEMA50.value &&
      latestEMA20.value > latestEMA50.value
    ) {
      setups.push({
        name: "Golden Cross",
        description: "EMA20 cruza por encima de EMA50 - Señal alcista",
        type: "bullish",
        strength: 9,
        timeDetected: latestCandle.time,
      });
    } else if (
      prevEMA20.value >= prevEMA50.value &&
      latestEMA20.value < latestEMA50.value
    ) {
      setups.push({
        name: "Death Cross",
        description: "EMA20 cruza por debajo de EMA50 - Señal bajista",
        type: "bearish",
        strength: 9,
        timeDetected: latestCandle.time,
      });
    }

    // EMA50 x EMA200 (major trend change)
    const prevEMA200 = ema200[ema200.length - 2];
    if (
      prevEMA50.value <= prevEMA200.value &&
      latestEMA50.value > latestEMA200.value
    ) {
      setups.push({
        name: "Major Golden Cross",
        description: "EMA50 cruza EMA200 - Cambio de tendencia mayor alcista",
        type: "bullish",
        strength: 10,
        timeDetected: latestCandle.time,
      });
    }
  }

  // 3. Pullback en Tendencia
  if (selectedIndicators.includes("pullback_trend")) {
    const priceNearEMA20 =
      Math.abs(latestCandle.close - latestEMA20.value) / latestCandle.close <
      0.01;
    const ema50AboveEma200 = latestEMA50.value > latestEMA200.value;
    const priceAboveEMA50 = latestCandle.close > latestEMA50.value;

    if (ema50AboveEma200 && priceNearEMA20 && priceAboveEMA50) {
      setups.push({
        name: "Pullback Alcista",
        description:
          "Precio toca EMA20 en tendencia alcista - Oportunidad de compra",
        type: "bullish",
        strength: 8,
        timeDetected: latestCandle.time,
      });
    }
  }

  // 4. Breakout con Volumen
  if (selectedIndicators.includes("breakout_volume")) {
    const params = indicatorParams.breakout_volume || {
      lookback: 20,
      volume_multiplier: 2,
    };
    const lookbackCandles = candles.slice(-params.lookback);
    const highestHigh = Math.max(...lookbackCandles.map((c) => c.high));
    const avgVolume =
      lookbackCandles.reduce((sum, c) => sum + c.volume, 0) / params.lookback;

    if (
      latestCandle.close > highestHigh &&
      latestCandle.volume >= avgVolume * params.volume_multiplier
    ) {
      setups.push({
        name: "Breakout con Volumen",
        description: `Precio rompe máximo de ${params.lookback} períodos con volumen ${params.volume_multiplier}x`,
        type: "bullish",
        strength: 9,
        timeDetected: latestCandle.time,
      });
    }
  }

  // 5. Bollinger Squeeze
  if (selectedIndicators.includes("bollinger_squeeze")) {
    const params = indicatorParams.bollinger_squeeze || {
      period: 20,
      std_dev: 2,
      squeeze_threshold: 0.1,
    };
    const bollinger = calculateBollingerBands(
      candles,
      params.period,
      params.std_dev
    );

    if (bollinger.bandwidth.length > 0) {
      const latestBandwidth =
        bollinger.bandwidth[bollinger.bandwidth.length - 1];
      const latestUpper = bollinger.upper[bollinger.upper.length - 1];
      const latestLower = bollinger.lower[bollinger.lower.length - 1];

      if (latestBandwidth.value < params.squeeze_threshold) {
        if (latestCandle.close > latestUpper.value) {
          setups.push({
            name: "Bollinger Breakout",
            description:
              "Precio rompe banda superior después de squeeze - Señal alcista",
            type: "bullish",
            strength: 8,
            timeDetected: latestCandle.time,
          });
        } else if (latestCandle.close < latestLower.value) {
          setups.push({
            name: "Bollinger Breakdown",
            description:
              "Precio rompe banda inferior después de squeeze - Señal bajista",
            type: "bearish",
            strength: 8,
            timeDetected: latestCandle.time,
          });
        }
      }
    }
  }

  // 6. ADX Fuerte
  if (selectedIndicators.includes("adx_strong")) {
    const params = indicatorParams.adx_strong || { period: 14, threshold: 25 };
    const adx = calculateADX(candles, params.period);

    if (adx.length > 0) {
      const latestADX = adx[adx.length - 1];
      if (latestADX.value > params.threshold) {
        const trendDirection =
          latestEMA20.value > latestEMA50.value ? "alcista" : "bajista";
        setups.push({
          name: "Tendencia Fuerte ADX",
          description: `ADX(${params.period}) > ${params.threshold} - Tendencia ${trendDirection} fuerte`,
          type: latestEMA20.value > latestEMA50.value ? "bullish" : "bearish",
          strength: 7,
          timeDetected: latestCandle.time,
        });
      }
    }
  }

  // 7. Volume Spike
  if (selectedIndicators.includes("volume_spike")) {
    const params = indicatorParams.volume_spike || {
      sma_period: 20,
      multiplier: 3,
    };
    const volumeSMA =
      candles.slice(-params.sma_period).reduce((sum, c) => sum + c.volume, 0) /
      params.sma_period;

    if (latestCandle.volume >= volumeSMA * params.multiplier) {
      const priceDirection =
        latestCandle.close > prevCandle.close ? "alcista" : "bajista";
      setups.push({
        name: "Volume Spike",
        description: `Volumen ${params.multiplier}x superior al promedio - Movimiento ${priceDirection}`,
        type: latestCandle.close > prevCandle.close ? "bullish" : "bearish",
        strength: 7,
        timeDetected: latestCandle.time,
      });
    }
  }

  return setups;
}

// Get scan history for a pair
// export function getScanHistory(pair: string): Array<{
//   time: string;
//   score: number;
//   setups: string[];
//   price: number;
// }> {
//   const history = [];
//   const now = new Date();

//   for (let i = 0; i < 10; i++) {
//     const time = new Date(now.getTime() - i * 5 * 60 * 1000); // Every 5 minutes
//     const baseScore = 60 + Math.random() * 30;
//     const setupCount = Math.floor(Math.random() * 4);
//     const possibleSetups = [
//       "EMA Cross",
//       "Vol↑",
//       "Support",
//       "RSI<30",
//       "RSI>70",
//       "Breakout",
//       "MACD Cross",
//     ];
//     const setups = possibleSetups.slice(0, setupCount);

//     const basePair = basePairs.find((p) => p.pair === pair);
//     const priceVariation = (Math.random() - 0.5) * 0.02;
//     const price = basePair ? basePair.price * (1 + priceVariation) : 0;

//     history.push({
//       time: time.toLocaleTimeString("es-ES", {
//         hour: "2-digit",
//         minute: "2-digit",
//       }),
//       score: Math.round(baseScore + setups.length * 5),
//       setups,
//       price,
//     });
//   }

//   return history.reverse();
// }

// export { basePairs };
