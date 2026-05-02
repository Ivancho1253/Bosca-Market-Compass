const { spawn } = require('child_process');
const path       = require('path');
const etlRepo    = require('../repositories/etl.repository');

async function runEtl(years = '2020:2024') {
  const run = await etlRepo.createRun();
  const runId = run.id;

  const scraperPath = path.resolve(__dirname, '../../../../scraper/scrape_all.py');
  const python      = process.platform === 'win32' ? 'python' : 'python3';

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
      await etlRepo.updateRun(runId, {
        status,
        errorMessage: code !== 0 ? stderr.slice(0, 2000) : null,
      });
      resolve({ runId, status, stdout, stderr, exitCode: code });
    });
  });
}

async function listRuns() {
  return etlRepo.findAll();
}

module.exports = { runEtl, listRuns };
