import pandas as pd

DIRECTION_MAP = {
    'pbi_per_capita_usd': 'higher_is_better',
    'crecimiento_pbi_pct': 'higher_is_better',
    'inflacion_pct': 'lower_is_better',
    'importaciones_bienes_servicios_usd': 'higher_is_better',
    'apertura_comercial_pct_pbi': 'higher_is_better',
    'importacion_vino_usd': 'higher_is_better',
    'poblacion_total': 'higher_is_better',
    'estabilidad_politica': 'higher_is_better',
    'arancel_vino_pct': 'lower_is_better',
    'score_logistico': 'higher_is_better',
}

def enrich_direction(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df['direction'] = df['internal_code'].map(DIRECTION_MAP).fillna('higher_is_better')
    return df
