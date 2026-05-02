// Patrón Repository — Abstrae el acceso a datos de la capa de lógica de negocio
const db = require('../config/db');

async function createRun() {
  const { rows } = await db.query(
    `INSERT INTO etl_runs (status) VALUES ('running') RETURNING id`
  );
  return rows[0];
}

async function updateRun(id, { status, errorMessage = null }) {
  await db.query(
    `UPDATE etl_runs SET finished_at = NOW(), status = $1, error_message = $2 WHERE id = $3`,
    [status, errorMessage, id]
  );
}

async function findAll() {
  const { rows } = await db.query('SELECT * FROM etl_runs ORDER BY started_at DESC LIMIT 20');
  return rows;
}

module.exports = { createRun, updateRun, findAll };
