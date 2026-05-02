const { spawn } = require('child_process');
const path = require('path');
const db = require('../config/db');

async function runEtl(years = '2020:2024') {
  const { rows } = await db.query(
    `INSERT INTO etl_runs (status) VALUES ('running') RETURNING id`
  );
  const runId = rows[0].id;

  const scraperPath = path.resolve(__dirname, '../../../../scraper/scrape_all.py');
  const python = process.platform === 'win32' ? 'python' : 'python3';

  const child = spawn(python, [scraperPath, '--years', years], {
    cwd: path.dirname(scraperPath),
    env: { ...process.env },
  });

  let stdout = '';
  let stderr = '';
  child.stdout.on('data', d => { stdout += d.toString(); });
  child.stderr.on('data', d => { stderr += d.toString(); });

  return new Promise((resolve) => {
    child.on('close', async (code) => {
      const status = code === 0 ? 'success' : 'failed';
      await db.query(
        `UPDATE etl_runs SET finished_at = NOW(), status = $1, error_message = $2 WHERE id = $3`,
        [status, code !== 0 ? stderr.slice(0, 2000) : null, runId]
      );
      resolve({ runId, status, stdout, stderr, exitCode: code });
    });
  });
}

async function listRuns() {
  const { rows } = await db.query('SELECT * FROM etl_runs ORDER BY started_at DESC LIMIT 20');
  return rows;
}

module.exports = { runEtl, listRuns };
