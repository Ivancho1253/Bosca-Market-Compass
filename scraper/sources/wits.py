import requests
from config import USER_AGENT

HS_WINE = '2204'

def fetch_wine_tariff(country_iso3: str, year: int) -> dict | None:
    try:
        url = f'https://wits.worldbank.org/API/V1/wits/datasource/trn/country/{country_iso3}/indicator/AHS-WGHTD-AVRG/year/{year}/product/{HS_WINE}?format=JSON'
        headers = {'User-Agent': USER_AGENT}
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        if 'dataSeries' in data and data['dataSeries']:
            val = data['dataSeries'][0].get('value')
            if val is not None:
                return {'country_iso3': country_iso3, 'year': year, 'arancel_vino_pct': float(val)}
    except Exception as e:
        print(f'  WITS FAIL {country_iso3}/{year}: {e}')
    return None
