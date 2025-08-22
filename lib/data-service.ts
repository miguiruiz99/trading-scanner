// lib/data-service.ts
// Servicio de datos híbrido que puede usar datos mock o reales de Binance

import {
  getMarketScannerData as getBinanceMarketData,
  getCandleData as getBinanceCandleData,
  checkBinanceAPIHealth,
  getPairAnalysis as getBinancePairAnalysis,
} from "./binance-api";

import {
  getUpdatedPairs as getMockPairs,
  generateCandleData as getMockCandleData,
  type CryptoPair,
  type CandleData,
} from "./mock-data";

// Configuración del servicio
export interface DataServiceConfig {
  useRealData: boolean;
  fallbackToMock: boolean;
  cacheTimeout: number;
}

// Estado del servicio
let config: DataServiceConfig = {
  useRealData: process.env.NODE_ENV === "production" ? true : false, // Usar datos reales en producción
  fallbackToMock: true, // Siempre permitir fallback para mayor robustez
  cacheTimeout: 30000, // 30 segundos
};

let isAPIHealthy = true;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 60000; // 1 minuto

// Cache para datos
const dataCache = new Map<string, { data: any; timestamp: number }>();

// Configurar el servicio
export function configureDataService(newConfig: Partial<DataServiceConfig>) {
  config = { ...config, ...newConfig };
}

// Obtener configuración actual
export function getDataServiceConfig(): DataServiceConfig {
  return { ...config };
}

// Verificar salud de la API de Binance con cache
async function checkAPIHealth(): Promise<boolean> {
  const now = Date.now();
  if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL && isAPIHealthy) {
    return isAPIHealthy;
  }

  try {
    isAPIHealthy = await checkBinanceAPIHealth();
    lastHealthCheck = now;
    return isAPIHealthy;
  } catch (error) {
    console.warn("API health check failed:", error);
    isAPIHealthy = false;
    lastHealthCheck = now;
    return false;
  }
}

// Obtener datos del cache si están disponibles
function getCachedData<T>(key: string): T | null {
  const cached = dataCache.get(key);
  if (cached && Date.now() - cached.timestamp < config.cacheTimeout) {
    return cached.data as T;
  }
  return null;
}

// Guardar datos en cache
function setCachedData<T>(key: string, data: T): void {
  dataCache.set(key, { data, timestamp: Date.now() });
}

// Obtener datos de pares para el scanner
export async function getMarketData(): Promise<CryptoPair[]> {
  const cacheKey = "market-data";

  // Intentar obtener del cache primero
  const cached = getCachedData<CryptoPair[]>(cacheKey);
  if (cached) {
    return cached;
  }

  // Determinar qué fuente usar
  if (config.useRealData) {
    const apiHealthy = await checkAPIHealth();

    if (apiHealthy) {
      try {
        console.log("📊 Obteniendo datos reales de Binance...");
        const realData = await getBinanceMarketData();
        setCachedData(cacheKey, realData);
        return realData;
      } catch (error) {
        console.error("Error obteniendo datos reales de Binance:", error);

        if (config.fallbackToMock) {
          console.log("⚠️ Usando datos mock como fallback...");
          const mockData = getMockPairs();
          setCachedData(cacheKey, mockData);
          return mockData;
        }
        throw error;
      }
    } else if (config.fallbackToMock) {
      console.log("⚠️ API no disponible, usando datos mock...");
      const mockData = getMockPairs();
      setCachedData(cacheKey, mockData);
      return mockData;
    } else {
      throw new Error("Binance API no disponible y fallback deshabilitado");
    }
  } else {
    // Usar datos mock
    console.log("🎭 Usando datos mock...");
    const mockData = getMockPairs();
    setCachedData(cacheKey, mockData);
    return mockData;
  }
}

// Obtener datos de velas para gráficos
export async function getCandleData(
  pair: string,
  timeframe: string,
  periods: number = 100
): Promise<CandleData[]> {
  const cacheKey = `candle-data-${pair}-${timeframe}-${periods}`;

  // Intentar obtener del cache primero
  const cached = getCachedData<CandleData[]>(cacheKey);
  if (cached) {
    return cached;
  }

  // Determinar qué fuente usar
  if (config.useRealData) {
    const apiHealthy = await checkAPIHealth();

    if (apiHealthy) {
      try {
        console.log(`📈 Obteniendo datos de velas reales para ${pair}...`);
        const realData = await getBinanceCandleData(pair, timeframe, periods);
        setCachedData(cacheKey, realData);
        return realData;
      } catch (error) {
        console.error(`Error obteniendo datos de velas para ${pair}:`, error);

        if (config.fallbackToMock) {
          console.log(`⚠️ Usando datos mock para ${pair}...`);
          const mockData = getMockCandleData(pair, timeframe, periods);
          setCachedData(cacheKey, mockData);
          return mockData;
        }
        throw error;
      }
    } else if (config.fallbackToMock) {
      console.log(`⚠️ API no disponible, usando datos mock para ${pair}...`);
      const mockData = getMockCandleData(pair, timeframe, periods);
      setCachedData(cacheKey, mockData);
      return mockData;
    } else {
      throw new Error("Binance API no disponible y fallback deshabilitado");
    }
  } else {
    // Usar datos mock
    console.log(`🎭 Usando datos mock para ${pair}...`);
    const mockData = getMockCandleData(pair, timeframe, periods);
    setCachedData(cacheKey, mockData);
    return mockData;
  }
}

// Obtener análisis completo de un par
export async function getPairAnalysis(
  symbol: string,
  timeframe: string = "15m"
) {
  const cacheKey = `pair-analysis-${symbol}-${timeframe}`;

  // Intentar obtener del cache primero
  const cached = getCachedData<any>(cacheKey);
  if (cached) {
    return cached;
  }

  // Solo disponible con datos reales
  if (config.useRealData) {
    const apiHealthy = await checkAPIHealth();

    if (apiHealthy) {
      try {
        console.log(`🔍 Obteniendo análisis completo para ${symbol}...`);
        const analysis = await getBinancePairAnalysis(symbol, timeframe);
        setCachedData(cacheKey, analysis);
        return analysis;
      } catch (error) {
        console.error(`Error obteniendo análisis para ${symbol}:`, error);
        throw error;
      }
    } else {
      throw new Error("Binance API no disponible para análisis detallado");
    }
  } else {
    throw new Error("Análisis detallado solo disponible con datos reales");
  }
}

// Limpiar cache
export function clearCache(): void {
  dataCache.clear();
  console.log("🧹 Cache limpiado");
}

// Obtener estadísticas del cache
export function getCacheStats(): {
  entries: number;
  totalSize: number;
  oldestEntry: number | null;
} {
  const entries = dataCache.size;
  let totalSize = 0;
  let oldestEntry: number | null = null;

  for (const [key, value] of dataCache.entries()) {
    totalSize += JSON.stringify(value.data).length;
    if (oldestEntry === null || value.timestamp < oldestEntry) {
      oldestEntry = value.timestamp;
    }
  }

  return {
    entries,
    totalSize,
    oldestEntry,
  };
}

// Alternar entre datos reales y mock
export async function toggleDataSource(): Promise<boolean> {
  const newUseRealData = !config.useRealData;

  if (newUseRealData) {
    // Verificar que la API esté disponible antes de cambiar
    const apiHealthy = await checkAPIHealth();
    if (!apiHealthy) {
      console.warn("⚠️ No se puede cambiar a datos reales: API no disponible");
      return false;
    }
  }

  config.useRealData = newUseRealData;
  clearCache(); // Limpiar cache al cambiar fuente

  console.log(`🔄 Cambiado a datos ${newUseRealData ? "reales" : "mock"}`);
  return true;
}

// Obtener estado actual del servicio
export function getServiceStatus(): {
  useRealData: boolean;
  apiHealthy: boolean;
  cacheStats: ReturnType<typeof getCacheStats>;
  lastHealthCheck: Date | null;
} {
  return {
    useRealData: config.useRealData,
    apiHealthy: isAPIHealthy,
    cacheStats: getCacheStats(),
    lastHealthCheck: lastHealthCheck > 0 ? new Date(lastHealthCheck) : null,
  };
}
