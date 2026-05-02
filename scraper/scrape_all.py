#!/usr/bin/env python3
"""
Luigi Bosca MIS — ETL principal.
Uso: python scrape_all.py --years 2020:2024 [--countries USA,GBR,...]
"""
import sys
import argparse
import pandas as pd
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from config import COUNTRIES, WB_INDICATORS, DEFAULT_START_YEAR, DEFAULT_END_YEAR, MACRO_SEED_CSV
from db import get_conn, get_country_map, get_indicator_map, upsert_indicator_value, upsert_market_score, insert_alert, create_etl_run, close_etl_run
from sources.worldbank import fetch_all_wb_indicators
from sources.comtrade import fetch_all_wine_imports
from sources.wits import fetch_wine_tariff
from transform.normalize_indicators import enrich_direction, DIRECTION_MAP
from transform.build_scores import normalize_values, calculate_market_scores


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument('--years', default=f'{DEFAULT_START_YEAR}:{DEFAULT_END_YEAR}')
    p.add_argument('--countries', default=','.join(COUNTRIES))
    return p.parse_args()


def main():
    args = parse_args()
    start_year, end_year = map(int, args.years.split(':'))
    years = list(range(start_year, end_year + 1))
    countries = args.countries.split(',')
    print(f'ETL start | países={countries} | años={years}')

    conn = get_conn()
    run_id = create_etl_run(conn)
    conn.commit()
    source_summary = {'worldbank': 0, 'comtrade': 0, 'wits': 0, 'seed': 0}

    try:
        # --- World Bank ---
        print('\n[1/4] Descargando World Bank...')
        wb_rows = fetch_all_wb_indicators(countries, WB_INDICATORS, start_year, end_year)
        source_summary['worldbank'] = len(wb_rows)
        print(f'  WB total: {len(wb_rows)} registros')

        # --- Wine imports (Comtrade / seed) ---
        print('\n[2/4] Importación de vino...')
        wine_rows, used_seed = fetch_all_wine_imports(countries, years)
        if used_seed:
            source_summary['seed'] += sum(1 for r in wine_rows if r.get('source') == 'seed_fallback')
            print(f'  Seed fallback usado para wine imports ({source_summary["seed"]} registros)')
        source_summary['comtrade'] = sum(1 for r in wine_rows if r.get('source') == 'comtrade')

        # --- Macro seed (estabilidad política fallback) ---
        macro_rows = []
        wb_stability = [r for r in wb_rows if r.get('internal_code') == 'estabilidad_politica']
        if not wb_stability and MACRO_SEED_CSV.exists():
            macro_df = pd.read_csv(MACRO_SEED_CSV)
            for _, row in macro_df.iterrows():
                if row['iso3'] in countries and start_year <= row['year'] <= end_year:
                    macro_rows.append({'country_iso3': row['iso3'], 'internal_code': 'estabilidad_politica', 'year': int(row['year']), 'value': row['estabilidad_politica'], 'source_name': 'seed_fallback', 'source_url': ''})
            print(f'  Macro seed: {len(macro_rows)} registros de estabilidad política')

        # --- WITS aranceles ---
        print('\n[3/4] Aranceles WITS...')
        tariff_rows = []
        for iso3 in countries:
            for year in years:
                row = fetch_wine_tariff(iso3, year)
                if row:
                    tariff_rows.append({**row, 'internal_code': 'arancel_vino_pct', 'country_iso3': iso3, 'source_name': 'WITS'})
                    source_summary['wits'] += 1
        print(f'  WITS aranceles: {len(tariff_rows)} registros')

        # --- Preparar DataFrame ---
        print('\n[4/4] Normalizando y cargando...')
        all_records = []

        for r in wb_rows:
            all_records.append({'country_iso3': r['country_iso3'], 'internal_code': r['internal_code'], 'year': r['year'], 'value': r['value'], 'source_name': r['source_name'], 'source_url': r.get('source_url','')})

        for r in wine_rows:
            all_records.append({'country_iso3': r['country_iso3'], 'internal_code': 'importacion_vino_usd', 'year': r['year'], 'value': r['importacion_vino_usd'], 'source_name': r.get('source','seed_fallback'), 'source_url': ''})
            if 'arancel_vino_pct' in r:
                all_records.append({'country_iso3': r['country_iso3'], 'internal_code': 'arancel_vino_pct', 'year': r['year'], 'value': r['arancel_vino_pct'], 'source_name': 'seed_fallback', 'source_url': ''})
            if 'score_logistico' in r:
                all_records.append({'country_iso3': r['country_iso3'], 'internal_code': 'score_logistico', 'year': r['year'], 'value': r['score_logistico'], 'source_name': 'seed_fallback', 'source_url': ''})

        for r in macro_rows:
            all_records.append(r)

        for r in tariff_rows:
            all_records.append({'country_iso3': r['country_iso3'], 'internal_code': 'arancel_vino_pct', 'year': r['year'], 'value': r['value'], 'source_name': 'WITS', 'source_url': ''})

        if not all_records:
            print('  Sin datos. Abortando.')
            close_etl_run(conn, run_id, 'failed', source_summary, 'No data fetched')
            conn.commit()
            return

        df = pd.DataFrame(all_records).drop_duplicates(subset=['country_iso3', 'internal_code', 'year'], keep='last')
        df = enrich_direction(df)
        df = normalize_values(df)

        country_map = get_country_map(conn)
        indicator_map = get_indicator_map(conn)

        loaded = 0
        for _, row in df.iterrows():
            c_id = country_map.get(row['country_iso3'])
            i_id = indicator_map.get(row['internal_code'])
            if c_id and i_id:
                upsert_indicator_value(conn, c_id, i_id, row['year'], row['value'], row['normalized_score'], row['source_name'], row.get('source_url', ''))
                loaded += 1
        conn.commit()
        print(f'  Cargados {loaded} valores en indicator_values')

        # --- Calcular market scores ---
        weight_map = {'pbi_per_capita_usd':0.12,'crecimiento_pbi_pct':0.08,'inflacion_pct':0.10,'importaciones_bienes_servicios_usd':0.10,'apertura_comercial_pct_pbi':0.08,'importacion_vino_usd':0.14,'poblacion_total':0.06,'estabilidad_politica':0.10,'arancel_vino_pct':0.12,'score_logistico':0.10}
        df['weight'] = df['internal_code'].map(weight_map).fillna(0.05)
        scores_df = calculate_market_scores(df)

        # limpiar alertas previas de scores para evitar duplicados
        with conn.cursor() as cur:
            cur.execute("DELETE FROM alerts WHERE type = 'score_alert'")

        latest_year = end_year
        for _, row in scores_df.iterrows():
            c_id = country_map.get(row['country_iso3'])
            if not c_id:
                continue
            dim_scores = {k.replace('dim_',''):v for k,v in row.items() if k.startswith('dim_')}
            dim_scores['total'] = row['total_score']
            explanation = f"{row['country_iso3']} obtiene {row['total_score']:.0f}/100."
            upsert_market_score(conn, c_id, row['year'], dim_scores, row['status'], explanation)

            # alertas solo para el año más reciente
            if row['year'] != latest_year:
                continue
            inflation_row = df[(df['country_iso3']==row['country_iso3'])&(df['internal_code']=='inflacion_pct')&(df['year']==row['year'])]
            if not inflation_row.empty and float(inflation_row['value'].iloc[0]) > 10:
                insert_alert(conn, c_id, f"Inflación elevada en {row['country_iso3']}", f"Inflación {float(inflation_row['value'].iloc[0]):.1f}% supera umbral.", 'alta', 'score_alert')

            tariff_row = df[(df['country_iso3']==row['country_iso3'])&(df['internal_code']=='arancel_vino_pct')&(df['year']==row['year'])]
            if not tariff_row.empty and float(tariff_row['value'].iloc[0]) > 15:
                insert_alert(conn, c_id, f"Arancel alto en {row['country_iso3']}", f"Arancel vino {float(tariff_row['value'].iloc[0]):.1f}% es elevado.", 'alta', 'score_alert')

            if row['total_score'] < 40:
                insert_alert(conn, c_id, f"Mercado no apto: {row['country_iso3']}", f"Índice {row['total_score']:.0f}/100 por debajo del umbral mínimo.", 'alta', 'score_alert')
            elif row['total_score'] < 70:
                insert_alert(conn, c_id, f"{row['country_iso3']} en evaluación", f"Índice {row['total_score']:.0f}/100. Requiere análisis adicional.", 'media', 'score_alert')

        conn.commit()
        print(f'  Scores calculados para {len(scores_df)} registros')

        with conn.cursor() as cur:
            cur.execute("DELETE FROM alerts WHERE type = 'etl_info'")
        insert_alert(conn, None, 'ETL completado', f'Datos actualizados: {loaded} valores cargados para {len(countries)} países ({start_year}-{end_year}).', 'baja', 'etl_info')
        conn.commit()

        status = 'partial_success' if source_summary['seed'] > 0 else 'success'
        close_etl_run(conn, run_id, status, source_summary)
        conn.commit()
        print(f'\nETL finalizado con estado: {status}')

    except Exception as e:
        print(f'ERROR ETL: {e}')
        close_etl_run(conn, run_id, 'failed', source_summary, str(e))
        conn.commit()
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    main()
