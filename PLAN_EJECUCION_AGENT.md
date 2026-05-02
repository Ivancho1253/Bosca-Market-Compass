# Plan de ejecución para agente — MIS Luigi Bosca

> Proyecto: **Sistema de Información Gerencial (MIS) con características DSS para inteligencia comercial internacional**.  
> Objetivo del agente: construir un prototipo funcional simple, completo y ejecutable en Cloud Visual Studio Code / GitHub Codespaces, con **Frontend React + Tailwind**, **Backend Node.js + Express**, **scraping/ETL en Python** y **PostgreSQL**.

---

## 1. Contexto del trabajo

El sistema debe ayudar a Luigi Bosca a evaluar mercados internacionales para exportar vinos premium. El problema principal es que hoy la información está dispersa en fuentes externas, el análisis es manual, no hay criterios homogéneos y la toma de decisiones depende demasiado de interpretación manual.

El prototipo debe resolver esto con una plataforma simple que permita:

- Centralizar información económica, comercial, logística, legal y de riesgo.
- Extraer datos desde fuentes públicas.
- Guardar datos procesados e históricos.
- Calcular un **índice de atractivo de mercado**.
- Mostrar rankings, dashboards, comparativas y alertas.
- Generar un reporte ejecutivo simple.

El alcance debe ser de **MVP**, no un sistema empresarial grande. Priorizar que funcione, que sea claro y que se pueda mostrar.

---

## 2. Stack obligatorio

Usar estas tecnologías:

### Frontend

- React con Vite.
- Tailwind CSS.
- React Router.
- Axios.
- Recharts para gráficos.
- Lucide React para iconos.

### Backend

- Node.js.
- Express.
- PostgreSQL mediante `pg`.
- Zod para validaciones simples.
- Dotenv para variables de entorno.
- Morgan para logs.
- CORS.
- PDFKit o HTML imprimible para reporte ejecutivo.

### Scraping / ETL

- Python 3.
- Requests.
- Pandas.
- BeautifulSoup4 cuando haya que leer HTML.
- Psycopg2 o SQLAlchemy para cargar datos en PostgreSQL.
- Python-dotenv.
- Tenacity para reintentos simples.

### Base de datos

- PostgreSQL.
- Docker Compose para levantar la base.
- Migraciones SQL simples.

---

## 3. Principio de simplicidad

No implementar autenticación compleja, permisos avanzados, microservicios, colas, Kubernetes ni arquitectura sobredimensionada.

El prototipo debe funcionar con:

- Lista inicial de 10 países.
- Datos públicos reales cuando sea posible.
- Datos semilla cuando alguna fuente pública falle, pida token o tenga límites.
- Un botón o endpoint para actualizar datos.
- Un dashboard claro y usable.

Países iniciales sugeridos:

| ISO3 | País |
|---|---|
| USA | Estados Unidos |
| GBR | Reino Unido |
| CAN | Canadá |
| DEU | Alemania |
| NLD | Países Bajos |
| JPN | Japón |
| CHE | Suiza |
| CHN | China |
| BRA | Brasil |
| MEX | México |

---

## 4. Fuentes públicas de datos

Implementar una capa de extracción responsable. Primero intentar APIs o descargas públicas. Usar scraping HTML solo si la información pública no está disponible como JSON/CSV.

### 4.1 Banco Mundial

Usar World Bank Indicators API para:

- PBI total.
- PBI per cápita.
- Crecimiento del PBI.
- Inflación.
- Importaciones de bienes y servicios.
- Población.
- Apertura comercial.
- Estabilidad política / gobernanza si está disponible.

Ejemplo de endpoint:

```txt
https://api.worldbank.org/v2/country/{ISO3}/indicator/{INDICATOR_CODE}?format=json&date=2020:2024&per_page=100
```

Indicadores sugeridos:

| Código | Nombre interno | Sentido |
|---|---|---|
| NY.GDP.MKTP.CD | pbi_total_usd | Mayor es mejor |
| NY.GDP.PCAP.CD | pbi_per_capita_usd | Mayor es mejor |
| NY.GDP.MKTP.KD.ZG | crecimiento_pbi_pct | Mayor es mejor |
| FP.CPI.TOTL.ZG | inflacion_pct | Menor es mejor |
| NE.IMP.GNFS.CD | importaciones_bienes_servicios_usd | Mayor es mejor |
| SP.POP.TOTL | poblacion_total | Mayor es mejor |
| NE.TRD.GNFS.ZS | apertura_comercial_pct_pbi | Mayor es mejor |
| PV.EST | estabilidad_politica | Mayor es mejor |

### 4.2 FMI

Usar IMF Data API cuando sea posible para datos macroeconómicos complementarios:

- Inflación.
- Tipo de cambio.
- Deuda pública.
- Proyecciones de crecimiento.

Para el MVP, si integrar FMI demora demasiado, dejar la estructura creada y usar Banco Mundial + datos semilla para completar.

### 4.3 OMC / WTO

Usar WTO API o WTO Stats cuando sea posible para:

- Indicadores de comercio.
- Aranceles.
- Información de acceso a mercados.
- Barreras no arancelarias si están disponibles.

La WTO puede requerir API key gratuita. Si no se puede obtener en el entorno del agente, implementar fallback con WITS o archivo semilla.

### 4.4 WITS / World Bank

Usar WITS API como alternativa para:

- Aranceles promedio.
- Estadísticas agregadas de comercio.
- Datos de UNCTAD TRAINS.

Para vino usar HS code:

```txt
2204 = Wine of fresh grapes, including fortified wines; grape must
```

### 4.5 UN Comtrade como alternativa comercial

Usar UN Comtrade si hay token gratuito o acceso público disponible para:

- Importaciones de vino por país.
- Flujo comercial anual.
- Valor importado en USD.

Si requiere token, soportar variable opcional:

```env
COMTRADE_API_KEY=
```

Cuando no exista token, usar `database/seed/wine_imports_seed.csv`.

---

## 5. Reglas de scraping responsable

El agente debe cumplir estas reglas:

1. Usar solo fuentes públicas.
2. No evadir login, captcha, paywalls ni restricciones.
3. Respetar límites de consulta.
4. Agregar user-agent identificable.
5. Cachear resultados en `scraper/data/raw`.
6. Registrar errores en `etl_runs`.
7. Si una fuente falla, continuar con fallback semilla y marcar el origen como `seed_fallback`.
8. Guardar siempre `source_name`, `source_url`, `fetched_at` y `year`.

---

## 6. Arquitectura objetivo

```txt
┌────────────────────────────┐
│ Fuentes públicas            │
│ World Bank / IMF / WTO      │
│ WITS / UN Comtrade          │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│ Python Scraper / ETL        │
│ Extrae, limpia, normaliza   │
│ y carga datos               │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│ PostgreSQL                  │
│ Países, indicadores,        │
│ valores, scores, alertas    │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│ Backend Express API         │
│ Ranking, dashboard,         │
│ comparador, reportes        │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│ Frontend React + Tailwind   │
│ Dashboard, ranking,         │
│ comparador, alertas         │
└────────────────────────────┘
```

---

## 7. Estructura del repositorio

Crear esta estructura:

```txt
luigi-bosca-mis/
├── README.md
├── PLAN_EJECUCION_AGENT.md
├── docker-compose.yml
├── .env.example
├── package.json
├── client/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api/
│       │   └── apiClient.js
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navbar.jsx
│       │   │   └── PageContainer.jsx
│       │   ├── cards/
│       │   │   └── KpiCard.jsx
│       │   ├── charts/
│       │   │   ├── AttractionGauge.jsx
│       │   │   ├── AptitudeDonut.jsx
│       │   │   ├── PestelMeters.jsx
│       │   │   ├── ProfitabilityBar.jsx
│       │   │   ├── WineImportsBubble.jsx
│       │   │   ├── IndicatorHeatmap.jsx
│       │   │   ├── CountryRadar.jsx
│       │   │   └── TrendLineChart.jsx
│       │   ├── ranking/
│       │   │   └── RankingTable.jsx
│       │   └── alerts/
│       │       └── AlertPanel.jsx
│       ├── pages/
│       │   ├── DashboardPage.jsx
│       │   ├── RankingPage.jsx
│       │   ├── ComparePage.jsx
│       │   ├── CountryDetailPage.jsx
│       │   ├── AlertsPage.jsx
│       │   └── ReportsPage.jsx
│       └── utils/
│           ├── formatters.js
│           └── scoreColors.js
├── server/
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── index.js
│       ├── config/
│       │   └── db.js
│       ├── routes/
│       │   ├── health.routes.js
│       │   ├── countries.routes.js
│       │   ├── indicators.routes.js
│       │   ├── dashboard.routes.js
│       │   ├── ranking.routes.js
│       │   ├── compare.routes.js
│       │   ├── alerts.routes.js
│       │   ├── reports.routes.js
│       │   └── etl.routes.js
│       ├── controllers/
│       ├── services/
│       │   ├── marketScore.service.js
│       │   ├── dashboard.service.js
│       │   ├── report.service.js
│       │   └── etl.service.js
│       ├── repositories/
│       │   ├── country.repository.js
│       │   ├── indicator.repository.js
│       │   ├── score.repository.js
│       │   └── alert.repository.js
│       └── utils/
│           ├── normalize.js
│           └── apiError.js
├── scraper/
│   ├── requirements.txt
│   ├── scrape_all.py
│   ├── config.py
│   ├── db.py
│   ├── sources/
│   │   ├── worldbank.py
│   │   ├── imf.py
│   │   ├── wto.py
│   │   ├── wits.py
│   │   └── comtrade.py
│   ├── transform/
│   │   ├── normalize_indicators.py
│   │   └── build_scores.py
│   └── data/
│       ├── raw/
│       └── processed/
└── database/
    ├── migrations/
    │   └── 001_init.sql
    └── seed/
        ├── countries.sql
        ├── indicators.sql
        ├── business_parameters.sql
        └── wine_imports_seed.csv
```

---

## 8. Variables de entorno

Crear `.env.example` en la raíz:

```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=luigi_bosca_mis
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/luigi_bosca_mis

# Backend
SERVER_PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# APIs opcionales
WTO_API_KEY=
COMTRADE_API_KEY=
IMF_API_KEY=

# Scraper
SCRAPER_USER_AGENT=luigi-bosca-mis-student-project/1.0
DEFAULT_START_YEAR=2020
DEFAULT_END_YEAR=2024
```

---

## 9. Docker Compose

Crear `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16
    container_name: luigi_bosca_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: luigi_bosca_mis
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/migrations:/docker-entrypoint-initdb.d

volumes:
  postgres_data:
```

---

## 10. Modelo de base de datos

Implementar en `database/migrations/001_init.sql`.

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  iso3 VARCHAR(3) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  region VARCHAR(120),
  trade_block VARCHAR(120),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(80) UNIQUE NOT NULL,
  name VARCHAR(160) NOT NULL,
  dimension VARCHAR(80) NOT NULL,
  unit VARCHAR(80),
  source_name VARCHAR(120),
  direction VARCHAR(30) NOT NULL CHECK (direction IN ('higher_is_better', 'lower_is_better')),
  weight NUMERIC(6,4) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS indicator_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  indicator_id UUID NOT NULL REFERENCES indicators(id) ON DELETE CASCADE,
  year INT NOT NULL,
  value NUMERIC,
  normalized_score NUMERIC,
  source_name VARCHAR(120),
  source_url TEXT,
  fetched_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(country_id, indicator_id, year)
);

CREATE TABLE IF NOT EXISTS market_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  year INT NOT NULL,
  economic_score NUMERIC,
  commercial_score NUMERIC,
  demand_score NUMERIC,
  logistics_score NUMERIC,
  risk_score NUMERIC,
  legal_score NUMERIC,
  total_score NUMERIC NOT NULL,
  status VARCHAR(40) NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(country_id, year)
);

CREATE TABLE IF NOT EXISTS etl_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  started_at TIMESTAMP DEFAULT NOW(),
  finished_at TIMESTAMP,
  status VARCHAR(40) NOT NULL,
  source_summary JSONB,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_id UUID REFERENCES countries(id) ON DELETE SET NULL,
  title VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('alta', 'media', 'baja')),
  type VARCHAR(40) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(180) NOT NULL,
  year INT NOT NULL,
  generated_by VARCHAR(120) DEFAULT 'demo',
  summary TEXT,
  payload JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 11. Indicadores y ponderaciones iniciales

Crear `database/seed/indicators.sql`.

Usar ponderaciones simples. Deben sumar 1.00.

| Indicador | Dimensión | Peso | Sentido |
|---|---:|---:|---|
| pbi_per_capita_usd | económica | 0.12 | mayor mejor |
| crecimiento_pbi_pct | económica | 0.08 | mayor mejor |
| inflacion_pct | económica | 0.10 | menor mejor |
| importaciones_bienes_servicios_usd | comercial | 0.10 | mayor mejor |
| apertura_comercial_pct_pbi | comercial | 0.08 | mayor mejor |
| importacion_vino_usd | comercial | 0.14 | mayor mejor |
| poblacion_total | demanda | 0.06 | mayor mejor |
| estabilidad_politica | riesgo | 0.10 | mayor mejor |
| arancel_vino_pct | legal | 0.12 | menor mejor |
| score_logistico | logística | 0.10 | mayor mejor |

Dimensiones para el dashboard:

- Económica.
- Comercial.
- Demanda.
- Logística.
- Riesgo.
- Legal.

---

## 12. Fórmula del índice de atractivo

Implementar la fórmula en backend y también en Python ETL, para poder recalcular desde ambos lados.

### 12.1 Normalización min-max

Para indicadores donde mayor es mejor:

```txt
score = ((valor - minimo) / (maximo - minimo)) * 100
```

Para indicadores donde menor es mejor:

```txt
score = ((maximo - valor) / (maximo - minimo)) * 100
```

Reglas:

- Si `maximo == minimo`, usar score 50.
- Si el valor viene nulo, usar score 0 y registrar alerta baja.
- Limitar siempre a rango 0-100.

### 12.2 Score total

```txt
indice_atractivo = SUM(normalized_score * weight)
```

### 12.3 Estado del mercado

```txt
Apto: score >= 70
En evaluación: score >= 40 y < 70
No apto: score < 40
```

### 12.4 Explicación automática

Generar texto simple:

```txt
"{País} obtiene {score}/100. Se destaca por {fortaleza_1} y {fortaleza_2}. Requiere atención en {debilidad_1}."
```

---

## 13. Scraper / ETL Python

Crear un pipeline ejecutable con:

```bash
cd scraper
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python scrape_all.py --years 2020:2024 --countries USA,GBR,CAN,DEU,NLD,JPN,CHE,CHN,BRA,MEX
```

### 13.1 `requirements.txt`

```txt
requests==2.32.3
pandas==2.2.3
beautifulsoup4==4.12.3
psycopg2-binary==2.9.10
python-dotenv==1.0.1
tenacity==9.0.0
```

### 13.2 Comportamiento de `scrape_all.py`

Debe:

1. Crear un registro en `etl_runs` con estado `running`.
2. Leer países e indicadores.
3. Descargar datos de World Bank.
4. Intentar FMI si está configurado.
5. Intentar WTO/WITS para aranceles.
6. Intentar UN Comtrade para importación de vino.
7. Usar seed CSV si alguna fuente falla.
8. Normalizar datos.
9. Cargar datos en `indicator_values`.
10. Calcular `market_scores`.
11. Generar alertas básicas.
12. Cerrar `etl_runs` con estado `success`, `partial_success` o `failed`.

### 13.3 Archivos por fuente

#### `sources/worldbank.py`

Funciones mínimas:

```python
def fetch_worldbank_indicator(country_iso3: str, indicator_code: str, start_year: int, end_year: int) -> list[dict]:
    ...
```

Debe devolver:

```python
[
  {
    "country_iso3": "USA",
    "indicator_code": "NY.GDP.PCAP.CD",
    "year": 2024,
    "value": 85000.12,
    "source_name": "World Bank",
    "source_url": "..."
  }
]
```

#### `sources/wits.py`

Funciones mínimas:

```python
def fetch_wine_tariff(country_iso3: str, year: int) -> dict | None:
    ...
```

Usar HS `2204`. Si no obtiene datos, devolver `None` y usar seed.

#### `sources/comtrade.py`

Funciones mínimas:

```python
def fetch_wine_imports(country_iso3: str, year: int) -> dict | None:
    ...
```

Si falta `COMTRADE_API_KEY`, leer `database/seed/wine_imports_seed.csv`.

#### `transform/build_scores.py`

Funciones mínimas:

```python
def normalize_values(df):
    ...

def calculate_market_scores(df):
    ...
```

---

## 14. Backend Express

### 14.1 Scripts

En `server/package.json`:

```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "etl": "node src/scripts/runEtl.js",
    "test": "node --test"
  }
}
```

### 14.2 Endpoints mínimos

#### Salud

```http
GET /api/health
```

Respuesta:

```json
{
  "status": "ok",
  "service": "luigi-bosca-mis-api"
}
```

#### Países

```http
GET /api/countries
GET /api/countries/:iso3
```

#### Indicadores

```http
GET /api/indicators
```

#### Dashboard

```http
GET /api/dashboard?year=2024
```

Respuesta esperada:

```json
{
  "year": 2024,
  "kpis": {
    "countriesAnalyzed": 10,
    "bestMarket": {
      "iso3": "USA",
      "name": "Estados Unidos",
      "score": 88
    },
    "averageAttractionIndex": 69,
    "analysisTimeReduction": 70
  },
  "aptitudeDistribution": {
    "apto": 4,
    "en_evaluacion": 4,
    "no_apto": 2
  },
  "topMarkets": [],
  "pestel": [],
  "alerts": []
}
```

#### Ranking

```http
GET /api/ranking?year=2024&region=Europa
```

Respuesta:

```json
[
  {
    "iso3": "USA",
    "country": "Estados Unidos",
    "region": "América",
    "score": 88,
    "status": "apto",
    "pbiPerCapita": 85000,
    "inflation": 3.2,
    "wineImportsUsd": 1200000000,
    "tariff": 5.0
  }
]
```

#### Comparador

```http
GET /api/compare?year=2024&countries=USA,GBR,JPN
```

Debe devolver valores normalizados y reales para gráficos radar y tabla.

#### Alertas

```http
GET /api/alerts
PATCH /api/alerts/:id/read
```

#### Reportes

```http
POST /api/reports/executive
GET /api/reports
GET /api/reports/:id
```

Payload:

```json
{
  "year": 2024,
  "countries": ["USA", "GBR", "CAN"]
}
```

Respuesta:

```json
{
  "id": "uuid",
  "title": "Reporte ejecutivo de mercados 2024",
  "summary": "Estados Unidos aparece como el mercado más atractivo...",
  "recommendations": []
}
```

Opcional: generar PDF simple.

#### ETL

```http
POST /api/etl/run
GET /api/etl/runs
```

`POST /api/etl/run` puede ejecutar el script Python usando `child_process.spawn`. Para el MVP está bien.

---

## 15. Frontend React + Tailwind

### 15.1 Páginas

Implementar estas páginas:

1. `/` — Dashboard principal.
2. `/ranking` — Ranking de mercados.
3. `/comparar` — Comparador de países.
4. `/pais/:iso3` — Detalle por país.
5. `/alertas` — Alertas.
6. `/reportes` — Reporte ejecutivo.

### 15.2 Dashboard principal

Debe parecerse al prototipo del trabajo:

- Barra superior con nombre: **Luigi Bosca — MIS Inteligencia Comercial Internacional**.
- Selector de año.
- Botón `Actualizar datos`.
- Botón `Generar reporte`.

Componentes:

1. KPI Cards:
   - Países analizados.
   - Mejor mercado recomendado.
   - Índice promedio.
   - Reducción estimada del tiempo de análisis.

2. Visualizaciones:
   - Gauge de índice de atractivo del mejor mercado.
   - Donut de distribución por aptitud.
   - Top 5 de mercados.
   - Medidores PESTEL.
   - Gráfico de rentabilidad vs umbral.
   - Mapa de calor de indicadores.
   - Panel de alertas.

### 15.3 Ranking

Tabla con:

- Posición.
- País.
- Región.
- PBI per cápita.
- Inflación.
- Importación de vino.
- Apertura comercial.
- Logística.
- Índice atractivo.
- Arancel.
- Estado.

Filtros:

- Año.
- Región.
- Estado.

### 15.4 Comparador

Permitir seleccionar 2 a 4 países y mostrar:

- Radar chart.
- Tabla con valores reales.
- Diferencia porcentual entre países.
- Resumen ejecutivo corto.

### 15.5 Detalle de país

Mostrar:

- Score total.
- Scores por dimensión.
- Indicadores principales.
- Tendencia de 2020 a 2024.
- Alertas asociadas.
- Recomendación: apto / en evaluación / no apto.

### 15.6 Alertas

Mostrar cards con prioridad:

- Alta.
- Media.
- Baja.

Ejemplos:

- `Inflación supera umbral recomendado`.
- `Nuevo dato de importación de vino actualizado`.
- `Mercado supera el índice mínimo de atractivo`.

---

## 16. Diseño visual

Usar Tailwind con estética limpia:

- Fondo general claro: `bg-slate-50`.
- Cards blancas: `bg-white rounded-2xl shadow-sm border`.
- Color principal vino: `#7f1d1d` o clase Tailwind `bg-red-900`.
- Estados:
  - Apto: verde.
  - En evaluación: amarillo/naranja.
  - No apto: rojo.
- Tipografía simple y legible.

No hace falta replicar exactamente el prototipo, pero debe verse profesional y claro.

---

## 17. Datos semilla obligatorios

Como el entorno puede no tener acceso a todas las APIs, crear seeds.

### 17.1 Países

`database/seed/countries.sql` debe insertar los 10 países iniciales.

### 17.2 Indicadores

`database/seed/indicators.sql` debe insertar todos los indicadores y pesos.

### 17.3 Importación de vino

`database/seed/wine_imports_seed.csv`:

```csv
iso3,year,importacion_vino_usd,arancel_vino_pct,score_logistico
USA,2024,1200000000,5.0,58
GBR,2024,1450000000,3.5,62
CAN,2024,820000000,4.0,48
DEU,2024,1100000000,3.0,44
NLD,2024,780000000,2.5,40
JPN,2024,640000000,8.0,62
CHE,2024,420000000,2.0,46
CHN,2024,180000000,14.0,65
BRA,2024,130000000,20.0,72
MEX,2024,246000000,12.0,66
```

Agregar años 2020-2023 con valores simulados razonables para poder mostrar tendencias.

---

## 18. Reporte ejecutivo

Implementar reporte simple, no complejo.

Debe incluir:

- Año analizado.
- Top 3 mercados recomendados.
- Score total.
- Fortalezas.
- Riesgos.
- Conclusión.
- Fecha de generación.

Formato mínimo:

- Vista HTML imprimible o PDF generado con PDFKit.
- Guardar snapshot en tabla `reports`.

Ejemplo de texto:

```txt
Para el año 2024, Estados Unidos se posiciona como el mercado más atractivo para la expansión internacional de Luigi Bosca, con un índice de 88/100. Su principal fortaleza se encuentra en el poder adquisitivo, el volumen de importación de vinos y la estabilidad comercial. Se recomienda avanzar con análisis comercial detallado y validación logística.
```

---

## 19. Tareas de implementación para el agente

Ejecutar en este orden.

### Fase 1 — Preparación del repositorio

1. Crear monorepo.
2. Crear `.env.example`.
3. Crear `docker-compose.yml`.
4. Crear `README.md` con instrucciones de instalación.
5. Crear carpetas `client`, `server`, `scraper`, `database`.

Criterio de terminado:

- `docker compose up -d` levanta PostgreSQL.
- El repo tiene estructura clara.

### Fase 2 — Base de datos

1. Crear migración `001_init.sql`.
2. Crear seeds de países, indicadores y datos de vino.
3. Agregar script de carga de seeds.
4. Probar conexión desde Node.
5. Probar conexión desde Python.

Criterio de terminado:

- La base tiene tablas creadas.
- Hay 10 países y al menos 10 indicadores.
- Se pueden consultar datos desde backend.

### Fase 3 — Scraping / ETL

1. Crear `scraper/requirements.txt`.
2. Crear módulos por fuente.
3. Implementar World Bank real.
4. Implementar WITS/WTO/Comtrade con fallback.
5. Guardar raw data.
6. Transformar y normalizar.
7. Cargar datos en PostgreSQL.
8. Calcular scores.
9. Registrar corrida ETL.
10. Crear alertas básicas.

Criterio de terminado:

- `python scraper/scrape_all.py` termina sin romper.
- Si una fuente falla, usa seed.
- `indicator_values`, `market_scores`, `etl_runs` y `alerts` quedan pobladas.

### Fase 4 — Backend

1. Crear servidor Express.
2. Crear repositorios.
3. Crear servicios.
4. Crear rutas.
5. Crear endpoint de dashboard.
6. Crear endpoint de ranking.
7. Crear endpoint de comparación.
8. Crear endpoint de alertas.
9. Crear endpoint de reportes.
10. Crear endpoint para disparar ETL.

Criterio de terminado:

- `npm run dev` en backend funciona.
- `GET /api/health` responde.
- El frontend puede consumir datos reales desde la API.

### Fase 5 — Frontend

1. Crear proyecto Vite React.
2. Configurar Tailwind.
3. Crear layout.
4. Crear dashboard.
5. Crear ranking.
6. Crear comparador.
7. Crear detalle país.
8. Crear alertas.
9. Crear reportes.
10. Conectar todo a la API.

Criterio de terminado:

- `npm run dev` en frontend funciona.
- El dashboard carga datos desde backend.
- Se ven gráficos, tabla ranking, comparador y alertas.

### Fase 6 — Calidad mínima

1. Agregar manejo de errores.
2. Agregar loading states.
3. Agregar `.env.example`.
4. Agregar README con comandos.
5. Agregar screenshots si es posible.
6. Verificar que todos los endpoints respondan.
7. Verificar que se puede ejecutar de cero.

Criterio de terminado:

- Proyecto corre desde cero con comandos documentados.
- No hay errores visibles en consola.
- El MVP cumple HU1 a HU5.

---

## 20. Comandos esperados

En README documentar:

```bash
# 1. Instalar dependencias raíz si se usan scripts con concurrently
npm install

# 2. Levantar base
docker compose up -d

# 3. Backend
cd server
npm install
npm run dev

# 4. Scraper
cd ../scraper
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python scrape_all.py --years 2020:2024

# 5. Frontend
cd ../client
npm install
npm run dev
```

Opcional en raíz:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
    "db:up": "docker compose up -d",
    "etl": "cd scraper && python scrape_all.py --years 2020:2024"
  }
}
```

---

## 21. Mapeo con historias de usuario

### HU1 — Visualizar ranking de países

Debe estar cubierto por:

- `/ranking`.
- `GET /api/ranking`.
- Score total.
- Filtros por región, año y estado.
- Link a detalle de país.

### HU2 — Comparar países

Debe estar cubierto por:

- `/comparar`.
- `GET /api/compare`.
- Selección de 2 a 4 países.
- Radar chart.
- Tabla comparativa.

### HU3 — Visualizar dashboard

Debe estar cubierto por:

- `/`.
- `GET /api/dashboard`.
- KPI cards.
- Donut.
- Gauge.
- Top 5.
- PESTEL.
- Heatmap.
- Alertas.

### HU4 — Integrar datos automáticamente

Debe estar cubierto por:

- `scraper/scrape_all.py`.
- `POST /api/etl/run`.
- `GET /api/etl/runs`.
- Tabla `etl_runs`.
- Fallback semilla.
- Fecha de actualización.

### HU5 — Generar reportes ejecutivos

Debe estar cubierto por:

- `/reportes`.
- `POST /api/reports/executive`.
- Tabla `reports`.
- Vista HTML/PDF simple.

---

## 22. Casos de uso cubiertos

| Caso de uso | Implementación |
|---|---|
| CU1 Consultar mercados internacionales | Dashboard, ranking y detalle de país |
| CU2 Comparar países | Página comparador + radar + tabla |
| CU3 Visualizar dashboard | Página principal con KPIs y gráficos |
| CU4 Actualizar datos automáticamente | Scraper Python + endpoint ETL |
| CU5 Generar reportes ejecutivos | Reportes HTML/PDF y snapshot en DB |

---

## 23. Alertas mínimas

Generar alertas después de calcular scores:

1. Alta:
   - Inflación mayor a 10%.
   - Arancel de vino mayor a 15%.
   - Score total cae por debajo de 40.

2. Media:
   - Score total entre 40 y 69.
   - Importación de vino cae más de 10% contra año anterior.
   - Falta dato importante y se usó fallback.

3. Baja:
   - Actualización de datos completada.
   - Nuevo país procesado.
   - Dato faltante no crítico.

---

## 24. Pruebas mínimas

No hacer testing complejo. Agregar pruebas simples.

### Backend

Probar:

- `normalize`.
- `marketScore.service`.
- `GET /api/health`.
- Que ranking devuelve array.

### Python

Probar manualmente:

- World Bank devuelve datos.
- Si WITS/Comtrade falla, seed funciona.
- Se crean scores.
- Se crea una corrida ETL.

### Frontend

Probar visualmente:

- Dashboard carga.
- Ranking ordena.
- Comparador cambia con selección de países.
- Botón actualizar muestra estado.
- Reporte se genera.

---

## 25. Definición de terminado

El proyecto se considera terminado cuando:

- Se puede levantar PostgreSQL con Docker Compose.
- El scraper carga datos reales o semilla.
- El backend expone endpoints funcionales.
- El frontend muestra dashboard, ranking, comparador, alertas y reportes.
- El índice de atractivo se calcula entre 0 y 100.
- Los países se clasifican como `apto`, `en evaluación` o `no apto`.
- Hay README claro.
- El proyecto se puede correr en Cloud VS Code sin configuración oculta.
- El código está ordenado y no sobredimensionado.


## 27. README mínimo esperado

El agente debe crear un README con:

```md
# MIS Luigi Bosca

Sistema de Información Gerencial para evaluar mercados internacionales de exportación de vinos premium.

## Stack

- React + Tailwind
- Node.js + Express
- PostgreSQL
- Python Scraping / ETL

## Instalación

1. Copiar `.env.example` a `.env`.
2. Levantar base: `docker compose up -d`.
3. Instalar backend: `cd server && npm install`.
4. Instalar frontend: `cd client && npm install`.
5. Instalar scraper: `cd scraper && pip install -r requirements.txt`.

## Ejecutar

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

ETL:

```bash
cd scraper
python scrape_all.py --years 2020:2024
```

## Funcionalidades

- Dashboard.
- Ranking de países.
- Comparador.
- Alertas.
- Reportes.
- Actualización de datos.
```

---

## 28. Notas para no trabarse

Si el agente encuentra problemas:

- Si WTO pide API key, usar WITS o seed.
- Si UN Comtrade pide token, usar seed.
- Si IMF complica la integración, dejar adaptador creado y usar Banco Mundial para indicadores macro.
- Si el PDF ejecutivo demora, hacer primero HTML imprimible y luego PDF opcional.
- Si un gráfico complejo demora, reemplazarlo por tabla o gráfico de barras.
- Si hay errores CORS, revisar `CLIENT_URL`.
- Si Docker falla, documentar alternativa con PostgreSQL local.

---

## 29. Priorización final

Orden de importancia:

1. Backend y DB funcionando.
2. Scraper/ETL cargando datos.
3. Dashboard principal.
4. Ranking.
5. Comparador.
6. Alertas.
7. Reporte ejecutivo.
8. Mejoras visuales.

No avanzar a detalles estéticos antes de tener datos fluyendo desde scraper → base → API → frontend.

---

## 30. Resultado esperado para la demo

La demo debe mostrar este flujo:

1. Abrir dashboard.
2. Ver KPIs generales.
3. Ver mejor mercado recomendado.
4. Ir a ranking.
5. Filtrar o revisar países.
6. Comparar 2 o 3 países.
7. Ver alertas.
8. Generar reporte ejecutivo.
9. Ejecutar actualización de datos.
10. Mostrar que la información queda registrada con fecha de actualización.

Con esto el proyecto demuestra que responde al problema del trabajo: reduce la dispersión de información, automatiza parte del análisis, centraliza datos y presenta información clara para la toma de decisiones.
