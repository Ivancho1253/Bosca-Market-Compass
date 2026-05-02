// Patrón Repository — Abstrae el acceso a datos de la capa de lógica de negocio
const db = require('../config/db');

async function findAll() {
  const { rows } = await db.query(
    `SELECT a.*, c.iso3, c.name AS country_name
     FROM alerts a
     LEFT JOIN countries c ON c.id = a.country_id
     ORDER BY CASE a.priority WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END, a.created_at DESC`
  );
  return rows;
}

async function findUnread() {
  const { rows } = await db.query(
    `SELECT a.*, c.iso3, c.name AS country_name
     FROM alerts a
     LEFT JOIN countries c ON c.id = a.country_id
     WHERE a.is_read = false
     ORDER BY CASE a.priority WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END, a.created_at DESC
     LIMIT 10`
  );
  return rows;
}

async function markRead(id) {
  const { rows } = await db.query(
    'UPDATE alerts SET is_read = true WHERE id = $1 RETURNING *',
    [id]
  );
  return rows[0] || null;
}

async function create({ countryId, title, message, priority, type }) {
  const { rows } = await db.query(
    `INSERT INTO alerts (country_id, title, message, priority, type)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [countryId || null, title, message, priority, type]
  );
  return rows[0];
}

async function deleteByType(type) {
  await db.query('DELETE FROM alerts WHERE type = $1', [type]);
}

module.exports = { findAll, findUnread, markRead, create, deleteByType };
