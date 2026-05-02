// Patrón Repository — Abstrae el acceso a datos de la capa de lógica de negocio
const db = require('../config/db');

async function findAllForYear(year) {
  const { rows } = await db.query(
    `SELECT ms.*, c.iso3, c.name AS country_name, c.region, c.trade_block
     FROM market_scores ms
     JOIN countries c ON c.id = ms.country_id
     WHERE ms.year = $1
     ORDER BY ms.total_score DESC`,
    [year]
  );
  return rows;
}

async function findByCountryYear(countryId, year) {
  const { rows } = await db.query(
    `SELECT ms.*, c.iso3, c.name AS country_name, c.region
     FROM market_scores ms
     JOIN countries c ON c.id = ms.country_id
     WHERE ms.country_id = $1 AND ms.year = $2`,
    [countryId, year]
  );
  return rows[0] || null;
}

async function findByIso3AllYears(iso3) {
  const { rows } = await db.query(
    `SELECT ms.* FROM market_scores ms
     JOIN countries c ON c.id = ms.country_id
     WHERE c.iso3 = $1
     ORDER BY ms.year`,
    [iso3]
  );
  return rows;
}

async function upsert({ countryId, year, economicScore, commercialScore, demandScore, logisticsScore, riskScore, legalScore, totalScore, status, explanation }) {
  await db.query(
    `INSERT INTO market_scores (country_id, year, economic_score, commercial_score, demand_score, logistics_score, risk_score, legal_score, total_score, status, explanation)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (country_id, year)
     DO UPDATE SET economic_score=$3, commercial_score=$4, demand_score=$5, logistics_score=$6,
       risk_score=$7, legal_score=$8, total_score=$9, status=$10, explanation=$11, created_at=NOW()`,
    [countryId, year, economicScore, commercialScore, demandScore, logisticsScore, riskScore, legalScore, totalScore, status, explanation]
  );
}

module.exports = { findAllForYear, findByCountryYear, findByIso3AllYears, upsert };
