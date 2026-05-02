import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getCountry } from '../api/apiClient'
import PageContainer from '../components/layout/PageContainer'
import TrendLineChart from '../components/charts/TrendLineChart'
import AlertPanel from '../components/alerts/AlertPanel'
import { fmtUSD, fmtPct, fmtScore, fmtPop } from '../utils/formatters'
import { statusColor, statusLabel, scoreToColor } from '../utils/scoreColors'

const IND_FMT = {
  pbi_per_capita_usd: { label: 'PBI per cápita', fmt: fmtUSD },
  inflacion_pct: { label: 'Inflación', fmt: fmtPct },
  importacion_vino_usd: { label: 'Importación vino', fmt: fmtUSD },
  arancel_vino_pct: { label: 'Arancel vino', fmt: fmtPct },
  score_logistico: { label: 'Score logístico', fmt: v => `${v}/100` },
  poblacion_total: { label: 'Población', fmt: fmtPop },
  estabilidad_politica: { label: 'Estabilidad política', fmt: v => parseFloat(v).toFixed(2) },
  apertura_comercial_pct_pbi: { label: 'Apertura comercial', fmt: fmtPct },
  crecimiento_pbi_pct: { label: 'Crecimiento PBI', fmt: fmtPct },
}

const DIM_LABELS = { economic_score:'Económica', commercial_score:'Comercial', demand_score:'Demanda', logistics_score:'Logística', risk_score:'Riesgo', legal_score:'Legal' }

export default function CountryDetailPage() {
  const { iso3 } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCountry(iso3).then(r => setData(r.data)).catch(() => setData(null)).finally(() => setLoading(false))
  }, [iso3])

  if (loading) return <div className="text-center py-16 text-slate-400">Cargando...</div>
  if (!data) return <div className="text-center py-16 text-slate-500">País no encontrado</div>

  const latestScore = data.scores?.find(s => s.year === data.latestYear)
  const countryAlerts = [] // alerts filtradas por país si se expone en endpoint

  return (
    <PageContainer
      title={data.name}
      subtitle={`${data.region} · ${data.trade_block || ''} · ISO3: ${data.iso3}`}
      actions={<button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-slate-600 hover:text-slate-800 text-sm"><ArrowLeft size={14} />Volver</button>}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold mb-1" style={{ color: scoreToColor(latestScore?.total_score || 0) }}>
            {fmtScore(latestScore?.total_score)}
          </div>
          <div className="text-sm text-slate-500 mb-2">/100 — Índice de atractivo {data.latestYear}</div>
          {latestScore && (
            <span className={`text-sm px-3 py-1 rounded-full border font-medium ${statusColor(latestScore.status)}`}>
              {statusLabel(latestScore.status)}
            </span>
          )}
          {latestScore?.explanation && <p className="text-xs text-slate-500 mt-3 text-center leading-relaxed">{latestScore.explanation}</p>}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Scores por dimensión</h3>
          <div className="space-y-2">
            {latestScore && Object.entries(DIM_LABELS).map(([key, label]) => {
              const s = parseFloat(latestScore[key]) || 0
              const color = s >= 70 ? 'bg-green-500' : s >= 40 ? 'bg-amber-400' : 'bg-red-500'
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-slate-600">{label}</span>
                    <span className="text-slate-500">{s.toFixed(0)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${s}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Indicadores ({data.latestYear})</h3>
          <div className="space-y-2">
            {data.indicators?.slice(0, 8).map(ind => {
              const def = IND_FMT[ind.code]
              return def ? (
                <div key={ind.code} className="flex justify-between text-xs py-0.5 border-b border-slate-50">
                  <span className="text-slate-500">{def.label}</span>
                  <span className="font-medium text-slate-700">{ind.value != null ? def.fmt(ind.value) : '—'}</span>
                </div>
              ) : null
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Tendencia histórica del índice</h3>
        <TrendLineChart scores={data.scores} />
      </div>
    </PageContainer>
  )
}
