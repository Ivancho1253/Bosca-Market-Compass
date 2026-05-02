const scoreRepo  = require('../repositories/score.repository');
const reportRepo = require('../repositories/report.repository');

async function generateExecutiveReport({ year, countries }) {
  const allScores = await scoreRepo.findAllForYear(year);
  let filtered = allScores;
  if (countries && countries.length > 0) {
    filtered = allScores.filter(s => countries.includes(s.iso3));
  }
  filtered = filtered.slice(0, 5);

  const top3 = filtered.slice(0, 3);

  const recommendations = top3.map(s => ({
    iso3:        s.iso3,
    country:     s.country_name,
    score:       parseFloat(s.total_score).toFixed(1),
    status:      s.status,
    explanation: s.explanation,
    strengths:   getStrengths(s),
    risks:       getRisks(s),
  }));

  const summary = top3.length > 0
    ? `Para el año ${year}, ${top3[0].country_name} se posiciona como el mercado más atractivo para la expansión internacional de Luigi Bosca, con un índice de ${parseFloat(top3[0].total_score).toFixed(0)}/100. ` +
      `Le siguen ${top3[1]?.country_name || '—'} (${parseFloat(top3[1]?.total_score || 0).toFixed(0)}/100) y ${top3[2]?.country_name || '—'} (${parseFloat(top3[2]?.total_score || 0).toFixed(0)}/100). ` +
      `Se recomienda avanzar con análisis comercial detallado y validación logística.`
    : 'No hay datos suficientes para generar el reporte.';

  const payload = { year, recommendations, filteredCountries: filtered.map(s => s.iso3) };

  const saved = await reportRepo.create({
    title:   `Reporte ejecutivo de mercados ${year}`,
    year,
    summary,
    payload,
  });

  return { ...saved, recommendations, summary };
}

function getStrengths(score) {
  const dims = [
    { name: 'Indicadores económicos',   val: score.economic_score   },
    { name: 'Actividad comercial',       val: score.commercial_score },
    { name: 'Tamaño de mercado',         val: score.demand_score     },
    { name: 'Infraestructura logística', val: score.logistics_score  },
    { name: 'Estabilidad política',      val: score.risk_score       },
    { name: 'Marco legal favorable',     val: score.legal_score      },
  ];
  return dims.filter(d => d.val && parseFloat(d.val) >= 60).map(d => d.name).slice(0, 3);
}

function getRisks(score) {
  const dims = [
    { name: 'Indicadores económicos débiles', val: score.economic_score   },
    { name: 'Baja actividad comercial',        val: score.commercial_score },
    { name: 'Mercado pequeño',                 val: score.demand_score     },
    { name: 'Logística deficiente',            val: score.logistics_score  },
    { name: 'Inestabilidad política',          val: score.risk_score       },
    { name: 'Barreras legales',                val: score.legal_score      },
  ];
  return dims.filter(d => !d.val || parseFloat(d.val) < 40).map(d => d.name).slice(0, 2);
}

async function listReports() {
  return reportRepo.getAll();
}

async function getReportById(id) {
  return reportRepo.getById(id);
}

module.exports = { generateExecutiveReport, listReports, getReportById };
