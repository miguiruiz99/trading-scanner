# 🎯 Crypto Sniper

Un escáner avanzado de criptomonedas con análisis técnico en tiempo real, construido con Next.js 15 y la API de Binance.

![Crypto Sniper](public/placeholder.svg)

## ✨ Características

- 📊 **Datos en Tiempo Real**: Integración con la API de Binance para datos de mercado actualizados
- 🔍 **Análisis Técnico Avanzado**: RSI, EMAs, Bandas de Bollinger, ADX y más
- 🎯 **Detección de Setups**: Identificación automática de patrones de trading
- 📈 **Gráficos Interactivos**: Visualización de precios con indicadores técnicos
- 🌓 **Modo Oscuro/Claro**: Interfaz adaptable con soporte completo de temas
- 📱 **Responsive**: Optimizado para desktop, tablet y móvil
- ⚡ **Performance**: Cache inteligente y optimizaciones de rendimiento
- 🔄 **Fallback Robusto**: Datos mock como respaldo si la API falla

## 🚀 Demo en Vivo

Visita la aplicación desplegada: [crypto-sniper.vercel.app](https://crypto-sniper.vercel.app)

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Charts**: Lightweight Charts, Recharts
- **API**: Binance Public API
- **Deployment**: Vercel
- **Technical Analysis**: technicalindicators library

## 📦 Instalación

1. **Clona el repositorio**

   ```bash
   git clone https://github.com/tu-usuario/crypto-sniper.git
   cd crypto-sniper
   ```

2. **Instala las dependencias**

   ```bash
   npm install
   # o
   pnpm install
   # o
   yarn install
   ```

3. **Ejecuta en desarrollo**

   ```bash
   npm run dev
   ```

4. **Abre el navegador**
   ```
   http://localhost:3000
   ```

## 🏗️ Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Construir para producción
npm run start    # Servidor de producción
npm run lint     # Linter de código
```

## 🔧 Configuración

### Fuente de Datos

La aplicación puede usar dos fuentes de datos:

- **Datos Reales**: API pública de Binance (por defecto en producción)
- **Datos Mock**: Datos simulados para desarrollo y testing

Puedes alternar entre ambos usando el botón en la interfaz.

### Variables de Entorno

Aunque no son requeridas para el funcionamiento básico, puedes personalizar:

```env
NODE_ENV=production
NEXT_PUBLIC_USE_REAL_DATA=true
NEXT_PUBLIC_CACHE_TIMEOUT=30000
```

## 📊 Pares Soportados

La aplicación monitorea 20 pares principales de criptomonedas:

- **Major**: BTC/USDT, ETH/USDT, BNB/USDT
- **Altcoins**: ADA/USDT, SOL/USDT, XRP/USDT, DOT/USDT
- **DeFi**: LINK/USDT, MATIC/USDT, AVAX/USDT
- **Y más**: ATOM/USDT, FTM/USDT, NEAR/USDT, etc.

## 🎯 Indicadores Técnicos

### Indicadores Disponibles

- **RSI**: Índice de Fuerza Relativa (14 períodos)
- **EMAs**: Medias Móviles Exponenciales (20, 50, 200)
- **Bollinger Bands**: Bandas de Bollinger (20, 2)
- **ADX**: Índice Direccional Promedio
- **Volume Analysis**: Análisis de volumen

### Setups Detectados

- **RSI Extremos**: RSI < 30 (sobreventa) / RSI > 70 (sobrecompra)
- **Cruces de EMAs**: Golden Cross / Death Cross
- **Breakouts**: Rupturas con volumen confirmatorio
- **Pullbacks**: Retrocesos en tendencia alcista
- **Volume Spikes**: Picos de volumen significativos
- **Bollinger Squeeze**: Compresiones seguidas de expansión

## 🔄 Arquitectura

```
lib/
├── binance-api.ts      # Cliente API de Binance
├── data-service.ts     # Servicio híbrido de datos
├── indicators.ts       # Cálculos de indicadores técnicos
├── mock-data.ts        # Datos simulados
└── utils.ts           # Utilidades generales

components/
├── ui/                # Componentes base (Radix UI)
├── scanner.tsx        # Componente principal del escáner
├── pair-detail.tsx    # Vista detallada de pares
├── trading-chart.tsx  # Gráficos de trading
└── ...

app/
├── layout.tsx         # Layout principal
├── page.tsx          # Página principal
└── globals.css       # Estilos globales
```

## 🚀 Despliegue en Vercel

1. **Conecta tu repositorio a Vercel**

   - Ve a [vercel.com](https://vercel.com)
   - Importa tu proyecto desde GitHub

2. **Configuración automática**

   - Vercel detectará Next.js automáticamente
   - No necesitas variables de entorno adicionales

3. **Deploy**
   - Vercel desplegará automáticamente en cada push

### Configuración Manual

Si prefieres usar Vercel CLI:

```bash
npm i -g vercel
vercel login
vercel --prod
```

## 📈 Performance

- **Cache**: 30 segundos para datos de mercado
- **Rate Limiting**: Respetuoso con límites de API
- **Optimizaciones**:
  - Lazy loading de componentes
  - Memoización de cálculos pesados
  - Requests paralelas cuando es posible

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## ⚠️ Disclaimer

Esta aplicación es solo para fines educativos e informativos. No constituye asesoramiento financiero. Siempre realiza tu propia investigación antes de tomar decisiones de inversión.

## 🙏 Agradecimientos

- [Binance](https://binance.com) por su API pública
- [TradingView](https://tradingview.com) por la inspiración del diseño
- [Radix UI](https://radix-ui.com) por los componentes accesibles
- [Tailwind CSS](https://tailwindcss.com) por el sistema de diseño

---

Desarrollado con ❤️ por [Tu Nombre](https://github.com/tu-usuario)
