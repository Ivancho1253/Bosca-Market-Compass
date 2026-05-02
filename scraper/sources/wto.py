import requests
from config import USER_AGENT, WTO_API_KEY

def fetch_wto_data(country_iso3: str, indicator: str, year: int) -> dict | None:
    if not WTO_API_KEY:
        return None
    try:
        url = f'https://api.wto.org/timeseries/v1/data?i={indicator}&r={country_iso3}&p=000&ps={year}&fmt=json'
        headers = {'User-Agent': USER_AGENT, 'Ocp-Apim-Subscription-Key': WTO_API_KEY}
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json().get('Dataset', [])
        if data:
            return {'country_iso3': country_iso3, 'year': year, 'value': data[0].get('Value')}
    except Exception as e:
        print(f'  WTO FAIL {country_iso3}: {e}')
    return None
