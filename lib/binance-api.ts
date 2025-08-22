// lib/binance-api.ts
// Servicio para obtener datos reales de la API de Binance

import { Candle, evaluateFromKlines, type EvalResult } from "./indicators";
import { type CryptoPair, type CandleData } from "./mock-data";

// Configuración de la API de Binance
const BINANCE_BASE_URL = "https://api.binance.com/api/v3";

// Tipos para la respuesta de Binance
export interface BinanceKline {
  0: number; // Open time
  1: string; // Open
  2: string; // High
  3: string; // Low
  4: string; // Close
  5: string; // Volume
  6: number; // Close time
  7: string; // Quote asset volume
  8: number; // Number of trades
  9: string; // Taker buy base asset volume
  10: string; // Taker buy quote asset volume
  11: string; // Ignore
}

export interface BinanceTicker24hr {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

export interface BinanceSymbolInfo {
  symbol: string;
  status: string;
  baseAsset: string;
  baseAssetPrecision: number;
  quoteAsset: string;
  quotePrecision: number;
  quoteAssetPrecision: number;
  orderTypes: string[];
  icebergAllowed: boolean;
  ocoAllowed: boolean;
  isSpotTradingAllowed: boolean;
  isMarginTradingAllowed: boolean;
}

// Lista de pares principales para el scanner
const MAIN_PAIRS = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "ADAUSDT",
  "SOLUSDT",
  "XRPUSDT",
  "DOTUSDT",
  "LINKUSDT",
  "MATICUSDT",
  "AVAXUSDT",
  "ATOMUSDT",
  "FTMUSDT",
  "NEARUSDT",
  "SANDUSDT",
  "MANAUSDT",
  "ALGOUSDT",
  "VETUSDT",
  "ICPUSDT",
  "FILUSDT",
  "HBARUSDT",
];

// Mapeo de timeframes
const TIMEFRAME_MAP: Record<string, string> = {
  "1m": "1m",
  "5m": "5m",
  "15m": "15m",
  "1h": "1h",
  "4h": "4h",
  "1d": "1d",
};

// Cache simple para evitar demasiadas requests
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 segundos

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
}

function setCachedData<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// Función para hacer requests a la API de Binance
async function binanceRequest<T>(endpoint: string): Promise<T> {
  const cacheKey = endpoint;
  const cached = getCachedData<T>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${BINANCE_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(
        `Binance API error: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Error fetching from Binance API:", error);
    throw error;
  }
}

// Obtener datos de klines (velas) para un par específico
export async function getKlines(
  symbol: string,
  interval: string = "15m",
  limit: number = 500
): Promise<BinanceKline[]> {
  const mappedInterval = TIMEFRAME_MAP[interval] || "15m";
  const endpoint = `/klines?symbol=${symbol}&interval=${mappedInterval}&limit=${limit}`;
  return binanceRequest<BinanceKline[]>(endpoint);
}

// Obtener estadísticas de 24h para un símbolo
export async function get24hrTicker(
  symbol: string
): Promise<BinanceTicker24hr> {
  const endpoint = `/ticker/24hr?symbol=${symbol}`;
  return binanceRequest<BinanceTicker24hr>(endpoint);
}

// Obtener estadísticas de 24h para todos los símbolos principales
export async function getAll24hrTickers(): Promise<BinanceTicker24hr[]> {
  const endpoint = "/ticker/24hr";
  const allTickers = await binanceRequest<BinanceTicker24hr[]>(endpoint);
  return allTickers.filter((ticker) => MAIN_PAIRS.includes(ticker.symbol));
}

// Convertir klines de Binance a formato Candle
export function binanceKlinesToCandles(klines: BinanceKline[]): Candle[] {
  return klines.map((kline) => ({
    time: Math.floor(kline[6] / 1000), // Close time en segundos
    open: parseFloat(kline[1]),
    high: parseFloat(kline[2]),
    low: parseFloat(kline[3]),
    close: parseFloat(kline[4]),
    volume: parseFloat(kline[5]),
  }));
}

// Convertir klines de Binance a formato CandleData (compatible con mock-data)
export function binanceKlinesToCandleData(
  klines: BinanceKline[]
): CandleData[] {
  return klines.map((kline) => ({
    time: Math.floor(kline[6] / 1000), // Close time en segundos
    open: parseFloat(kline[1]),
    high: parseFloat(kline[2]),
    low: parseFloat(kline[3]),
    close: parseFloat(kline[4]),
    volume: parseFloat(kline[5]),
  }));
}

// Obtener datos completos de un par con análisis técnico
export async function getPairAnalysis(
  symbol: string,
  timeframe: string = "15m"
): Promise<{
  symbol: string;
  candles: Candle[];
  analysis: EvalResult;
  ticker24hr: BinanceTicker24hr;
}> {
  try {
    // Obtener datos en paralelo
    const [klines, ticker24hr] = await Promise.all([
      getKlines(symbol, timeframe, 500),
      get24hrTicker(symbol),
    ]);

    // Convertir a formato de velas
    const candles = binanceKlinesToCandles(klines);

    // Analizar con indicadores técnicos (sin la última vela que puede estar incompleta)
    const analysis = evaluateFromKlines(klines);

    return {
      symbol,
      candles,
      analysis,
      ticker24hr,
    };
  } catch (error) {
    console.error(`Error getting analysis for ${symbol}:`, error);
    throw error;
  }
}

// Obtener datos de mercado para el scanner
export async function getMarketScannerData(): Promise<CryptoPair[]> {
  try {
    // Obtener tickers de 24h para todos los pares principales
    const tickers = await getAll24hrTickers();

    // Obtener análisis para cada par (en lotes para no sobrecargar la API)
    const pairs: CryptoPair[] = [];

    for (const ticker of tickers) {
      try {
        const analysis = await getPairAnalysis(ticker.symbol);

        // Convertir a formato CryptoPair
        const pair: CryptoPair = {
          pair: ticker.symbol,
          price: parseFloat(ticker.lastPrice),
          score: analysis.analysis.score,
          change24h: parseFloat(ticker.priceChangePercent),
          volume24h: parseFloat(ticker.quoteVolume),
          rsi: analysis.analysis.indicators.rsi || 50,
          setups: analysis.analysis.badges,
          trend: parseFloat(ticker.priceChangePercent) > 0 ? "up" : "down",
          marketCap: 0, // No disponible en API pública de Binance
          ath: 0, // Requerirían APIs adicionales
          atl: 0,
          lastUpdated: Date.now(),
        };

        pairs.push(pair);
      } catch (error) {
        console.warn(`Error analyzing ${ticker.symbol}:`, error);
        // Continuar con el siguiente par si hay error
      }
    }

    return pairs.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error("Error getting market scanner data:", error);
    throw error;
  }
}

// Obtener datos de velas para el gráfico
export async function getCandleData(
  pair: string,
  timeframe: string,
  periods: number = 100
): Promise<CandleData[]> {
  try {
    const klines = await getKlines(pair, timeframe, periods);
    return binanceKlinesToCandleData(klines);
  } catch (error) {
    console.error(`Error getting candle data for ${pair}:`, error);
    throw error;
  }
}

// Verificar si la API de Binance está disponible
export async function checkBinanceAPIHealth(): Promise<boolean> {
  try {
    await binanceRequest("/ping");
    return true;
  } catch (error) {
    console.error("Binance API health check failed:", error);
    return false;
  }
}

// Obtener información de un símbolo específico
export async function getSymbolInfo(
  symbol: string
): Promise<BinanceSymbolInfo | null> {
  try {
    const exchangeInfo = await binanceRequest<{ symbols: BinanceSymbolInfo[] }>(
      "/exchangeInfo"
    );
    return exchangeInfo.symbols.find((s) => s.symbol === symbol) || null;
  } catch (error) {
    console.error(`Error getting symbol info for ${symbol}:`, error);
    return null;
  }
}
