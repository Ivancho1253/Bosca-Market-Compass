import pandas as pd

def normalize_values(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df['normalized_score'] = 0.0
    for code in df['internal_code'].unique():
        mask = df['internal_code'] == code
        direction = df.loc[mask, 'direction'].iloc[0] if 'direction' in df.columns else 'higher_is_better'
        vals = df.loc[mask, 'value'].dropna()
        if vals.empty:
            continue
        vmin, vmax = vals.min(), vals.max()
        if vmax == vmin:
            df.loc[mask, 'normalized_score'] = 50.0
        else:
            if direction == 'higher_is_better':
                df.loc[mask, 'normalized_score'] = ((df.loc[mask, 'value'] - vmin) / (vmax - vmin)) * 100
            else:
                df.loc[mask, 'normalized_score'] = ((vmax - df.loc[mask, 'value']) / (vmax - vmin)) * 100
    df['normalized_score'] = df['normalized_score'].clip(0, 100)
    return df

def calculate_market_scores(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    if 'weight' not in df.columns:
        df['weight'] = 0.1
    df['weighted_score'] = df['normalized_score'] * df['weight']

    dim_map = {
        'pbi_per_capita_usd': 'economica', 'crecimiento_pbi_pct': 'economica', 'inflacion_pct': 'economica',
        'importaciones_bienes_servicios_usd': 'comercial', 'apertura_comercial_pct_pbi': 'comercial', 'importacion_vino_usd': 'comercial',
        'poblacion_total': 'demanda', 'estabilidad_politica': 'riesgo',
        'arancel_vino_pct': 'legal', 'score_logistico': 'logistica',
    }
    df['dimension'] = df['internal_code'].map(dim_map).fillna('otros')

    results = []
    for (iso3, year), group in df.groupby(['country_iso3', 'year']):
        total = group['weighted_score'].sum()
        dim_scores = {}
        for dim, dgroup in group.groupby('dimension'):
            w = dgroup['weight'].sum()
            dim_scores[dim] = (dgroup['weighted_score'].sum() / w * 100 / 100) if w > 0 else None

        status = 'apto' if total >= 70 else ('en_evaluacion' if total >= 40 else 'no_apto')
        results.append({'country_iso3': iso3, 'year': year, 'total_score': round(total, 2), 'status': status, **{f'dim_{k}': v for k, v in dim_scores.items()}})

    return pd.DataFrame(results)
