// Patrón Repository — Abstrae el acceso a datos de la capa de lógica de negocio
const db = require('../config/db');

async function findAll() {
  const { rows } = await db.query('SELECT * FROM countries ORDER BY name');
  return rows;
}

async function findByIso3(iso3) {
  const { rows } = await db.query('SELECT * FROM countries WHERE iso3 = $1', [iso3.toUpperCase()]);
  return rows[0] || null;
}

async function getAll() {
  return findAll();
}

async function getById(id) {
  const { rows } = await db.query('SELECT * FROM countries WHERE id = $1', [id]);
  return rows[0] || null;
}

async function getByRegion(region) {
  const { rows } = await db.query(
    'SELECT * FROM countries WHERE LOWER(region) = LOWER($1) ORDER BY name',
    [region]
  );
  return rows;
}

async function getRanking({ year = 2024, region = null, status = null } = {}) {
  let query = `
    SELECT ms.*, c.iso3, c.name AS country_name, c.region, c.trade_block
    FROM market_scores ms
    JOIN countries c ON c.id = ms.country_id
    WHERE ms.year = $1
  `;
  const params = [year];

  if (region) {
    params.push(region);
    query += ` AND LOWER(c.region) = LOWER($${params.length})`;
  }
  if (status) {
    params.push(status);
    query += ` AND ms.status = $${params.length}`;
  }
  query += ' ORDER BY ms.total_score DESC';

  const { rows } = await db.query(query, params);
  return rows;
}

module.exports = { findAll, findByIso3, getAll, getById, getByRegion, getRanking };
