import { createBrowserClient } from "@/utils/api/client";
import { Candle, evaluateFromCandles } from "./indicators";
import { ScannerPair } from "./mock-data";

export type ApiCandle = {
  ts_close: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};
export type AppCandle = {
  tsClose: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type ApiPair = {
  symbol: string;
  base: string;
  quote: string;
  quote_volume_24h: number;
};
export type AppPair = {
  symbol: string;
  base: string;
  quote: string;
  quoteVolume24h: number;
};

export type ApiPairTickers = {
  symbol: string;
  last_price: number;
  change_pct_24h: number;
  high_24h: number;
  low_24h: number;
  quote_volume_24h: number;
  trades_24h: number;
  pos_in_range: number;
  volatility_24h: number;
  ticker_ts: string;
};
export type AppPairTickers = {
  symbol: string;
  lastPrice: number;
  changePct24h: number;
  high24h: number;
  low24h: number;
  quoteVolume24h: number;
  trades24h: number;
  posInRange: number;
  volatility24h: number;
  tickerTs: string;
};

export async function getPairs(): Promise<AppPair[]> {
  const client = await createBrowserClient();
  const { data, error } = await client.from("pairs").select("*").limit(100);
  if (error) throw error;
  return data?.map((pair: ApiPair) => ({
    symbol: pair.symbol,
    base: pair.base,
    quote: pair.quote,
    quoteVolume24h: pair.quote_volume_24h,
  }));
}

export async function getPairsTickers(): Promise<AppPairTickers[]> {
  const client = await createBrowserClient();
  const { data, error } = await client
    .from("pair_tickers")
    .select("*")
    .limit(100)
    .order("quote_volume_24h", {
      ascending: false,
    });
  if (error) throw error;
  return data?.map((pair: ApiPairTickers) => ({
    symbol: pair.symbol,
    lastPrice: pair.last_price,
    changePct24h: pair.change_pct_24h,
    high24h: pair.high_24h,
    low24h: pair.low_24h,
    quoteVolume24h: pair.quote_volume_24h,
    trades24h: pair.trades_24h,
    posInRange: pair.pos_in_range,
    volatility24h: pair.volatility_24h,
    tickerTs: pair.ticker_ts,
  }));
}

export async function getPairDetailTickers(
  symbol: string
): Promise<AppPairTickers> {
  const client = await createBrowserClient();
  const { data, error } = await client
    .from("pair_tickers")
    .select("*")
    .eq("symbol", symbol);
  if (error) throw error;
  return data?.[0];
}

export async function getPairCandles(
  symbol: string,
  interval = "5m",
  limit = 500
) {
  const client = await createBrowserClient();
  const { data, error } = await client
    .from(`candles_${interval}`)
    .select("*")
    .eq("symbol", symbol)
    .order("ts_close", {
      ascending: true,
    })
    .limit(limit);
  if (error) throw error;
  return data?.map((candle: ApiCandle) => ({
    tsClose: candle.ts_close,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    volume: candle.volume,
  })) as AppCandle[];
}

function apiCandlesToCandle(arr: AppCandle[]): Candle[] {
  return arr.map((k) => ({
    time: Math.floor(new Date(k.tsClose).getTime() / 1000),
    open: +k.open,
    high: +k.high,
    low: +k.low,
    close: +k.close,
    volume: +k.volume,
  }));
}

export async function getPairAnalysis(symbol: string, timeframe = "5m") {
  const [candlesApi] = await Promise.all([
    getPairCandles(symbol, timeframe, 500),
  ]);

  const candles = apiCandlesToCandle(candlesApi);
  const analysis = evaluateFromCandles(candles);

  return {
    candles,
    analysis,
  };
}

export async function getMarketScannerData(
  pairsTickers: AppPairTickers[]
): Promise<ScannerPair[]> {
  const out: ScannerPair[] = [];
  for (const pair of pairsTickers) {
    try {
      const { candles, analysis } = await getPairAnalysis(pair.symbol);
      if (!analysis) continue;
      out.push({
        symbol: pair.symbol,
        lastPrice: pair.lastPrice,
        score: analysis.score,
        changePct24h: pair.changePct24h,
        quoteVolume24h: pair.quoteVolume24h,
        rsi: analysis.indicators.rsi ?? 0,
        setups: analysis.badges,
        trend: pair.changePct24h > 0 ? "up" : "down",
        posInRange: pair.posInRange,
        volatility24h: pair.volatility24h,
        tickerTs: pair.tickerTs,
        high24h: pair.high24h,
        low24h: pair.low24h,
        trades24h: pair.trades24h,
        candles,
      });
    } catch {
      /* sigue con el siguiente */
    }
  }
  return out.sort((a, b) => b.score - a.score);
}

export async function getPairDetail(symbol: string): Promise<ScannerPair> {
  const pair = await getPairDetailTickers(symbol);

  try {
    const { candles, analysis } = await getPairAnalysis(pair.symbol);
    return {
      symbol: pair.symbol,
      lastPrice: pair.lastPrice,
      score: analysis.score,
      changePct24h: pair.changePct24h,
      quoteVolume24h: pair.quoteVolume24h,
      rsi: analysis.indicators.rsi ?? 0,
      setups: analysis.badges,
      trend: pair.changePct24h > 0 ? "up" : "down",
      posInRange: pair.posInRange,
      volatility24h: pair.volatility24h,
      tickerTs: pair.tickerTs,
      high24h: pair.high24h,
      low24h: pair.low24h,
      trades24h: pair.trades24h,
      candles,
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
}
