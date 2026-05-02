import requests
import json
from pathlib import Path
from tenacity import retry, stop_after_attempt, wait_exponential
from config import USER_AGENT, RAW_DIR

BASE_URL = 'https://api.worldbank.org/v2/country/{iso3}/indicator/{indicator}?format=json&date={start}:{end}&per_page=100'

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def fetch_worldbank_indicator(country_iso3: str, indicator_code: str, start_year: int, end_year: int) -> list:
    url = BASE_URL.format(iso3=country_iso3, indicator=indicator_code, start=start_year, end=end_year)
    headers = {'User-Agent': USER_AGENT}
    resp = requests.get(url, headers=headers, timeout=15)
    resp.raise_for_status()
    data = resp.json()

    if not isinstance(data, list) or len(data) < 2:
        return []

    results = []
    for entry in data[1] or []:
        if entry.get('value') is None:
            continue
        results.append({
            'country_iso3': country_iso3,
            'indicator_code': indicator_code,
            'year': int(entry['date']),
            'value': float(entry['value']),
            'source_name': 'World Bank',
            'source_url': url,
        })

    cache_path = RAW_DIR / f'wb_{country_iso3}_{indicator_code}_{start_year}_{end_year}.json'
    cache_path.write_text(json.dumps(results))
    return results

def fetch_all_wb_indicators(countries, indicators_map, start_year, end_year):
    all_data = []
    for iso3 in countries:
        for wb_code, internal_code in indicators_map.items():
            try:
                rows = fetch_worldbank_indicator(iso3, wb_code, start_year, end_year)
                for r in rows:
                    r['internal_code'] = internal_code
                all_data.extend(rows)
                print(f'  WB OK: {iso3} / {internal_code} ({len(rows)} registros)')
            except Exception as e:
                print(f'  WB FAIL: {iso3} / {internal_code}: {e}')
    return all_data
