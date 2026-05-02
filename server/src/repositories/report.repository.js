// Patrón Repository — Abstrae el acceso a datos de la capa de lógica de negocio
const db = require('../config/db');

async function create({ title, year, summary, payload }) {
  const { rows } = await db.query(
    `INSERT INTO reports (title, year, summary, payload) VALUES ($1, $2, $3, $4) RETURNING *`,
    [title, year, summary, JSON.stringify(payload)]
  );
  return rows[0];
}

async function getAll() {
  const { rows } = await db.query(
    'SELECT id, title, year, generated_by, summary, created_at FROM reports ORDER BY created_at DESC'
  );
  return rows;
}

async function getById(id) {
  const { rows } = await db.query('SELECT * FROM reports WHERE id = $1', [id]);
  return rows[0] || null;
}

module.exports = { create, getAll, getById };
