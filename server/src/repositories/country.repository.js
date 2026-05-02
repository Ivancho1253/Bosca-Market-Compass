const db = require('../config/db');

async function findAll() {
  const { rows } = await db.query('SELECT * FROM countries ORDER BY name');
  return rows;
}

async function findByIso3(iso3) {
  const { rows } = await db.query('SELECT * FROM countries WHERE iso3 = $1', [iso3.toUpperCase()]);
  return rows[0] || null;
}

module.exports = { findAll, findByIso3 };
