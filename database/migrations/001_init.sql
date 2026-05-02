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

-- Seeds inline para garantizar datos disponibles desde el inicio

INSERT INTO countries (iso3, name, region, trade_block) VALUES
  ('USA', 'Estados Unidos', 'América', 'USMCA'),
  ('GBR', 'Reino Unido', 'Europa', 'Independiente'),
  ('CAN', 'Canadá', 'América', 'USMCA'),
  ('DEU', 'Alemania', 'Europa', 'UE'),
  ('NLD', 'Países Bajos', 'Europa', 'UE'),
  ('JPN', 'Japón', 'Asia', 'CPTPP'),
  ('CHE', 'Suiza', 'Europa', 'Independiente'),
  ('CHN', 'China', 'Asia', 'RCEP'),
  ('BRA', 'Brasil', 'América', 'Mercosur'),
  ('MEX', 'México', 'América', 'USMCA')
ON CONFLICT (iso3) DO NOTHING;

INSERT INTO indicators (code, name, dimension, unit, source_name, direction, weight) VALUES
  ('pbi_per_capita_usd',                'PBI per cápita (USD)',                    'economica',  'USD',      'World Bank', 'higher_is_better', 0.12),
  ('crecimiento_pbi_pct',               'Crecimiento del PBI (%)',                 'economica',  '%',        'World Bank', 'higher_is_better', 0.08),
  ('inflacion_pct',                     'Inflación (%)',                            'economica',  '%',        'World Bank', 'lower_is_better',  0.10),
  ('importaciones_bienes_servicios_usd','Importaciones de bienes y servicios (USD)','comercial', 'USD',      'World Bank', 'higher_is_better', 0.10),
  ('apertura_comercial_pct_pbi',        'Apertura comercial (% PBI)',              'comercial',  '% PBI',    'World Bank', 'higher_is_better', 0.08),
  ('importacion_vino_usd',              'Importación de vino (USD)',               'comercial',  'USD',      'Comtrade/Seed','higher_is_better',0.14),
  ('poblacion_total',                   'Población total',                         'demanda',    'personas', 'World Bank', 'higher_is_better', 0.06),
  ('estabilidad_politica',              'Estabilidad política',                    'riesgo',     'índice',   'World Bank', 'higher_is_better', 0.10),
  ('arancel_vino_pct',                  'Arancel vino (%)',                        'legal',      '%',        'WITS/Seed',  'lower_is_better',  0.12),
  ('score_logistico',                   'Score logístico',                         'logistica',  'índice',   'Seed',       'higher_is_better', 0.10)
ON CONFLICT (code) DO NOTHING;
