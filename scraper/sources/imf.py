import requests
from config import USER_AGENT

def fetch_imf_indicator(country_iso2: str, indicator: str, start_year: int, end_year: int) -> list:
    try:
        url = f'https://www.imf.org/external/datamapper/api/v1/{indicator}/{country_iso2}'
        headers = {'User-Agent': USER_AGENT}
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        values_block = data.get('values', {}).get(indicator, {}).get(country_iso2, {})
        results = []
        for year_str, val in values_block.items():
            y = int(year_str)
            if start_year <= y <= end_year and val is not None:
                results.append({'country_iso2': country_iso2, 'indicator': indicator, 'year': y, 'value': float(val)})
        return results
    except Exception as e:
        print(f'  IMF FAIL {country_iso2}/{indicator}: {e}')
    return []

_ISO3_TO_ISO2 = {'USA':'US','GBR':'GB','CAN':'CA','DEU':'DE','NLD':'NL','JPN':'JP','CHE':'CH','CHN':'CN','BRA':'BR','MEX':'MX'}
def iso3_to_iso2(iso3):
    return _ISO3_TO_ISO2.get(iso3, iso3[:2])
