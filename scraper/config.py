import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).parent.parent / '.env')

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/luigi_bosca_mis')
USER_AGENT = os.getenv('SCRAPER_USER_AGENT', 'luigi-bosca-mis-student-project/1.0')
COMTRADE_API_KEY = os.getenv('COMTRADE_API_KEY', '')
WTO_API_KEY = os.getenv('WTO_API_KEY', '')
DEFAULT_START_YEAR = int(os.getenv('DEFAULT_START_YEAR', '2020'))
DEFAULT_END_YEAR = int(os.getenv('DEFAULT_END_YEAR', '2024'))

COUNTRIES = ['USA', 'GBR', 'CAN', 'DEU', 'NLD', 'JPN', 'CHE', 'CHN', 'BRA', 'MEX']

WB_INDICATORS = {
    'NY.GDP.PCAP.CD':   'pbi_per_capita_usd',
    'NY.GDP.MKTP.KD.ZG':'crecimiento_pbi_pct',
    'FP.CPI.TOTL.ZG':   'inflacion_pct',
    'NE.IMP.GNFS.CD':   'importaciones_bienes_servicios_usd',
    'NE.TRD.GNFS.ZS':   'apertura_comercial_pct_pbi',
    'SP.POP.TOTL':       'poblacion_total',
    'PV.EST':            'estabilidad_politica',
}

SEED_CSV = Path(__file__).parent.parent / 'database' / 'seed' / 'wine_imports_seed.csv'
MACRO_SEED_CSV = Path(__file__).parent.parent / 'database' / 'seed' / 'macro_seed.csv'
WB_PROJECTION_CSV = Path(__file__).parent.parent / 'database' / 'seed' / 'worldbank_projection_seed.csv'
WB_LAST_REAL_YEAR = 2024  # World Bank publica datos con ~1 año de retraso
RAW_DIR = Path(__file__).parent / 'data' / 'raw'
PROCESSED_DIR = Path(__file__).parent / 'data' / 'processed'

RAW_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
