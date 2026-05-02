import requests
import pandas as pd
from pathlib import Path
from config import COMTRADE_API_KEY, USER_AGENT, SEED_CSV, RAW_DIR

HS_WINE = '2204'

def fetch_wine_imports(country_iso3: str, year: int) -> dict | None:
    if not COMTRADE_API_KEY:
        return None
    try:
        url = f'https://comtradeapi.un.org/data/v1/get/C/A/HS?reporterCode={_iso3_to_m49(country_iso3)}&period={year}&cmdCode={HS_WINE}&flowCode=M&maxRecords=5'
        headers = {'Ocp-Apim-Subscription-Key': COMTRADE_API_KEY, 'User-Agent': USER_AGENT}
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
        data = resp.json().get('data', [])
        if data:
            return {'country_iso3': country_iso3, 'year': year, 'importacion_vino_usd': data[0].get('primaryValue', 0)}
    except Exception as e:
        print(f'  Comtrade FAIL {country_iso3}/{year}: {e}')
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
            row = fetch_wine_imports(iso3, year)
            if row:
                results.append({**row, 'source': 'comtrade'})
            else:
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

_M49 = {'USA':'842','GBR':'826','CAN':'124','DEU':'276','NLD':'528','JPN':'392','CHE':'756','CHN':'156','BRA':'076','MEX':'484'}
def _iso3_to_m49(iso3):
    return _M49.get(iso3, iso3)
