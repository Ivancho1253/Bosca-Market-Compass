import requests
import pandas as pd
import json
from config import COMTRADE_API_KEY, USER_AGENT, SEED_CSV, RAW_DIR

HS_WINE = '2204'

# API pública gratuita — no requiere API key
PUBLIC_API = 'https://comtradeapi.un.org/public/v1/preview/C/A/HS'
# API premium (más datos, requiere key)
PREMIUM_API = 'https://comtradeapi.un.org/data/v1/get/C/A/HS'

_M49 = {
    'USA': '842', 'GBR': '826', 'CAN': '124', 'DEU': '276',
    'NLD': '528', 'JPN': '392', 'CHE': '756', 'CHN': '156',
    'BRA': '076', 'MEX': '484',
}

def _iso3_to_m49(iso3):
    return _M49.get(iso3, iso3)


def fetch_wine_imports_public(country_iso3: str, year: int) -> dict | None:
    """Usa la API pública de Comtrade (sin key). Datos hasta ~2 años atrás."""
    m49 = _iso3_to_m49(country_iso3)
    url = f'{PUBLIC_API}?reporterCode={m49}&cmdCode={HS_WINE}&flowCode=M&period={year}'
    try:
        headers = {'User-Agent': USER_AGENT}
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
        data = resp.json().get('data', [])
        if not data:
            return None
        # partnerCode=0 = total mundial. Puede haber varias filas por modo/aduana.
        # Usamos el valor máximo (fila más agregada / completa).
        world_vals = [r.get('primaryValue', 0) or 0 for r in data if r.get('partnerCode') == 0]
        if world_vals:
            total_usd = max(world_vals)
        else:
            # sin fila mundial: sumar socios individuales (puede haber sub-totales)
            partner_vals = [r.get('primaryValue', 0) or 0 for r in data if r.get('partnerCode', 0) != 0]
            total_usd = sum(partner_vals)
        if total_usd == 0:
            return None

        # guardar raw
        cache = RAW_DIR / f'comtrade_public_{country_iso3}_{year}.json'
        cache.write_text(json.dumps(data[:5]))

        return {
            'country_iso3': country_iso3,
            'year': year,
            'importacion_vino_usd': total_usd,
            'source': 'comtrade_public',
        }
    except Exception as e:
        print(f'  Comtrade public FAIL {country_iso3}/{year}: {e}')
    return None


def fetch_wine_imports_premium(country_iso3: str, year: int) -> dict | None:
    """Usa la API premium de Comtrade (requiere COMTRADE_API_KEY)."""
    if not COMTRADE_API_KEY:
        return None
    try:
        m49 = _iso3_to_m49(country_iso3)
        url = f'{PREMIUM_API}?reporterCode={m49}&period={year}&cmdCode={HS_WINE}&flowCode=M&maxRecords=5'
        headers = {'Ocp-Apim-Subscription-Key': COMTRADE_API_KEY, 'User-Agent': USER_AGENT}
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
        data = resp.json().get('data', [])
        if data:
            return {'country_iso3': country_iso3, 'year': year, 'importacion_vino_usd': data[0].get('primaryValue', 0), 'source': 'comtrade_premium'}
    except Exception as e:
        print(f'  Comtrade premium FAIL {country_iso3}/{year}: {e}')
    return None


def load_seed_wine_data():
    if not SEED_CSV.exists():
        return pd.DataFrame()
    return pd.read_csv(SEED_CSV)


def fetch_all_wine_imports(countries, years):
    seed_df = load_seed_wine_data()
    results = []
    used_seed = False

    for iso3 in countries:
        for year in years:
            row = None

            # 1) Intentar API premium si hay key
            if COMTRADE_API_KEY:
                row = fetch_wine_imports_premium(iso3, year)

            # 2) Intentar API pública gratuita
            if not row:
                row = fetch_wine_imports_public(iso3, year)

            if row:
                results.append(row)
            else:
                # 3) Fallback al seed CSV
                if not seed_df.empty:
                    match = seed_df[(seed_df['iso3'] == iso3) & (seed_df['year'] == year)]
                    if not match.empty:
                        r = match.iloc[0]
                        results.append({
                            'country_iso3': iso3, 'year': year,
                            'importacion_vino_usd': r['importacion_vino_usd'],
                            'arancel_vino_pct': r['arancel_vino_pct'],
                            'score_logistico': r['score_logistico'],
                            'source': 'seed_fallback',
                        })
                        used_seed = True

    return results, used_seed
