import psycopg2
import psycopg2.extras
from config import DATABASE_URL

def get_conn():
    return psycopg2.connect(DATABASE_URL)

def get_country_map(conn):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute('SELECT id, iso3 FROM countries')
        return {r['iso3']: r['id'] for r in cur.fetchall()}

def get_indicator_map(conn):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute('SELECT id, code FROM indicators')
        return {r['code']: r['id'] for r in cur.fetchall()}

def upsert_indicator_value(conn, country_id, indicator_id, year, value, normalized_score, source_name, source_url=''):
    with conn.cursor() as cur:
        cur.execute(
            '''INSERT INTO indicator_values (country_id, indicator_id, year, value, normalized_score, source_name, source_url)
               VALUES (%s, %s, %s, %s, %s, %s, %s)
               ON CONFLICT (country_id, indicator_id, year)
               DO UPDATE SET value=EXCLUDED.value, normalized_score=EXCLUDED.normalized_score,
                 source_name=EXCLUDED.source_name, source_url=EXCLUDED.source_url, fetched_at=NOW()''',
            (country_id, indicator_id, year, value, normalized_score, source_name, source_url)
        )

def upsert_market_score(conn, country_id, year, scores, status, explanation):
    with conn.cursor() as cur:
        cur.execute(
            '''INSERT INTO market_scores (country_id, year, economic_score, commercial_score, demand_score,
               logistics_score, risk_score, legal_score, total_score, status, explanation)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
               ON CONFLICT (country_id, year)
               DO UPDATE SET economic_score=%s, commercial_score=%s, demand_score=%s, logistics_score=%s,
               risk_score=%s, legal_score=%s, total_score=%s, status=%s, explanation=%s, created_at=NOW()''',
            (country_id, year,
             scores.get('economica'), scores.get('comercial'), scores.get('demanda'),
             scores.get('logistica'), scores.get('riesgo'), scores.get('legal'),
             scores['total'], status, explanation,
             scores.get('economica'), scores.get('comercial'), scores.get('demanda'),
             scores.get('logistica'), scores.get('riesgo'), scores.get('legal'),
             scores['total'], status, explanation)
        )

def insert_alert(conn, country_id, title, message, priority, alert_type):
    with conn.cursor() as cur:
        cur.execute(
            'INSERT INTO alerts (country_id, title, message, priority, type) VALUES (%s,%s,%s,%s,%s)',
            (country_id, title, message, priority, alert_type)
        )

def create_etl_run(conn):
    with conn.cursor() as cur:
        cur.execute("INSERT INTO etl_runs (status) VALUES ('running') RETURNING id")
        return cur.fetchone()[0]

def close_etl_run(conn, run_id, status, summary=None, error=None):
    import json
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE etl_runs SET finished_at=NOW(), status=%s, source_summary=%s, error_message=%s WHERE id=%s",
            (status, json.dumps(summary) if summary else None, error, run_id)
        )
