const db = require('../config/db');

async function findAll() {
  const { rows } = await db.query('SELECT * FROM indicators ORDER BY dimension, weight DESC');
  return rows;
}

async function findValuesByCountryYear(countryId, year) {
  const { rows } = await db.query(
    `SELECT iv.*, i.code, i.name, i.dimension, i.direction, i.weight, i.unit
     FROM indicator_values iv
     JOIN indicators i ON i.id = iv.indicator_id
     WHERE iv.country_id = $1 AND iv.year = $2`,
    [countryId, year]
  );
  return rows;
}

async function findAllValuesForYear(year) {
  const { rows } = await db.query(
    `SELECT iv.*, i.code, i.name, i.dimension, i.direction, i.weight, i.unit,
            c.iso3, c.name AS country_name, c.region
     FROM indicator_values iv
     JOIN indicators i ON i.id = iv.indicator_id
     JOIN countries c ON c.id = iv.country_id
     WHERE iv.year = $1`,
    [year]
  );
  return rows;
}

async function upsertValue({ countryId, indicatorId, year, value, normalizedScore, sourceName, sourceUrl }) {
  await db.query(
    `INSERT INTO indicator_values (country_id, indicator_id, year, value, normalized_score, source_name, source_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (country_id, indicator_id, year)
     DO UPDATE SET value = EXCLUDED.value, normalized_score = EXCLUDED.normalized_score,
       source_name = EXCLUDED.source_name, source_url = EXCLUDED.source_url, fetched_at = NOW()`,
    [countryId, indicatorId, year, value, normalizedScore, sourceName, sourceUrl]
  );
}

module.exports = { findAll, findValuesByCountryYear, findAllValuesForYear, upsertValue };
