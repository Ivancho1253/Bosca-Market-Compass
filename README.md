# MIS Luigi Bosca

Sistema de Información Gerencial para evaluar mercados internacionales de exportación de vinos premium.

## Stack

- **Frontend**: React + Vite + Tailwind + Recharts
- **Backend**: Node.js + Express + PostgreSQL
- **ETL**: Python 3 + requests + pandas + psycopg2
- **Base de datos**: PostgreSQL 16 en Docker

## Instalación rápida

```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Levantar PostgreSQL
docker compose up -d

# 3. Instalar backend
cd server && npm install

# 4. Instalar frontend
cd ../client && npm install

# 5. Instalar scraper
cd ../scraper
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Ejecutar

### Backend (puerto 3000)

```bash
cd server
npm run dev
```

### Frontend (puerto 5173)

```bash
cd client
npm run dev
```

### ETL / Scraper

```bash
cd scraper
source .venv/bin/activate
python scrape_all.py --years 2020:2024
```

### Todo junto (desde raíz)

```bash
npm install          # instala concurrently
npm run db:up        # levanta PostgreSQL
npm run dev          # lanza backend + frontend en paralelo
```

## Estructura

```
├── client/          React + Vite + Tailwind
├── server/          Express API
├── scraper/         Python ETL
├── database/        Migraciones SQL + seeds
└── docker-compose.yml
```

## Endpoints API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Estado del servidor |
| GET | `/api/dashboard?year=2024` | Datos del dashboard |
| GET | `/api/ranking?year=2024&region=Europa` | Ranking de mercados |
| GET | `/api/compare?countries=USA,GBR&year=2024` | Comparador |
| GET | `/api/countries` | Lista de países |
| GET | `/api/countries/:iso3` | Detalle de país |
| GET | `/api/alerts` | Alertas |
| PATCH | `/api/alerts/:id/read` | Marcar alerta leída |
| POST | `/api/reports/executive` | Generar reporte |
| GET | `/api/reports` | Lista de reportes |
| POST | `/api/etl/run` | Ejecutar ETL |
| GET | `/api/etl/runs` | Historial ETL |

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Dashboard con KPIs, gauge, heatmap, alertas |
| `/ranking` | Tabla con filtros por año, región y estado |
| `/comparar` | Radar chart y tabla comparativa |
| `/pais/:iso3` | Detalle de país con tendencia histórica |
| `/alertas` | Panel de alertas con prioridades |
| `/reportes` | Generador de reportes ejecutivos |

## Índice de atractivo

El sistema calcula un índice 0-100 usando normalización min-max ponderada:

| Indicador | Peso | Sentido |
|-----------|------|---------|
| PBI per cápita | 12% | Mayor mejor |
| Importación vino | 14% | Mayor mejor |
| Inflación | 10% | Menor mejor |
| Arancel vino | 12% | Menor mejor |
| Importaciones totales | 10% | Mayor mejor |
| Estabilidad política | 10% | Mayor mejor |
| Score logístico | 10% | Mayor mejor |
| Apertura comercial | 8% | Mayor mejor |
| Crecimiento PBI | 8% | Mayor mejor |
| Población | 6% | Mayor mejor |

**Apto**: ≥ 70 · **En evaluación**: 40–69 · **No apto**: < 40

## Fuentes de datos

- **World Bank API**: indicadores macroeconómicos (en vivo)
- **WITS**: aranceles de vino (HS 2204)
- **UN Comtrade**: importaciones de vino (requiere API key)
- **Seed fallback**: datos semilla locales cuando alguna fuente falla

## Variables opcionales

```env
COMTRADE_API_KEY=   # Para importaciones vino en vivo
WTO_API_KEY=        # Para datos WTO en vivo
```

Sin estas claves el sistema funciona con datos semilla.

## Países analizados

USA · GBR · CAN · DEU · NLD · JPN · CHE · CHN · BRA · MEX
