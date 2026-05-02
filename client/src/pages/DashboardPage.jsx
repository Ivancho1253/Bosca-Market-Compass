import React, { useState, useEffect } from 'react'
import { Globe, TrendingUp, BarChart2, Clock, RefreshCw, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getDashboard, runEtl } from '../api/apiClient'
import PageContainer from '../components/layout/PageContainer'
import KpiCard from '../components/cards/KpiCard'
import AttractionGauge from '../components/charts/AttractionGauge'
import AptitudeDonut from '../components/charts/AptitudeDonut'
import PestelMeters from '../components/charts/PestelMeters'
import ProfitabilityBar from '../components/charts/ProfitabilityBar'
import IndicatorHeatmap from '../components/charts/IndicatorHeatmap'
import AlertPanel from '../components/alerts/AlertPanel'
import { fmtScore } from '../utils/formatters'
import { statusLabel, statusColor } from '../utils/scoreColors'

export default function DashboardPage() {
  const [year, setYear] = useState(2026)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [etlRunning, setEtlRunning] = useState(false)
  const [etlMsg, setEtlMsg] = useState('')
  const navigate = useNavigate()

  useEffect(() => { load() }, [year])

  async function load() {
    setLoading(true)
    try {
      const res = await getDashboard(year)
      setData(res.data)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleEtl() {
    setEtlRunning(true)
    setEtlMsg('Ejecutando ETL...')
    try {
      const res = await runEtl('2020:2026')
      setEtlMsg(`ETL ${res.data.status}`)
      await load()
    } catch {
      setEtlMsg('Error en ETL')
    } finally {
      setEtlRunning(false)
    }
  }

  const actions = (
    <>
      <select value={year} onChange={e => setYear(+e.target.value)}
        className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white">
        {[2026,2025,2024,2023,2022,2021,2020].map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <button onClick={handleEtl} disabled={etlRunning}
        className="flex items-center gap-1.5 bg-wine-800 hover:bg-wine-700 disabled:opacity-60 text-white px-4 py-1.5 rounded-lg text-sm transition-colors">
        <RefreshCw size={13} className={etlRunning ? 'animate-spin' : ''} />
        {etlRunning ? 'Actualizando...' : 'Actualizar datos'}
      </button>
      <button onClick={() => navigate('/reportes')}
        className="flex items-center gap-1.5 border border-wine-800 text-wine-800 hover:bg-wine-50 px-4 py-1.5 rounded-lg text-sm transition-colors">
        <FileText size={13} />
        Generar reporte
      </button>
    </>
  )

  return (
    <PageContainer title="Dashboard Inteligencia Comercial" subtitle={`Análisis de mercados internacionales — ${year}`} actions={actions}>
      {etlMsg && <div className="mb-4 text-xs text-slate-500 bg-slate-100 rounded px-3 py-2">{etlMsg}</div>}

      {loading ? (
        <div className="text-center py-16 text-slate-400">Cargando datos...</div>
      ) : !data || !data.kpis?.countriesAnalyzed ? (
        <div className="text-center py-16">
          <p className="text-slate-500 mb-3">Sin datos para {year}. Ejecutá el ETL para cargar información.</p>
          <button onClick={handleEtl} disabled={etlRunning} className="bg-wine-800 text-white px-6 py-2 rounded-lg text-sm hover:bg-wine-700 disabled:opacity-60">
            {etlRunning ? 'Ejecutando...' : 'Ejecutar ETL ahora'}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Países analizados" value={data.kpis.countriesAnalyzed} sub="mercados evaluados" icon={Globe} />
            <KpiCard label="Mejor mercado" value={data.kpis.bestMarket?.name || '—'} sub={`Score ${fmtScore(data.kpis.bestMarket?.score)}/100`} icon={TrendingUp} />
            <KpiCard label="Índice promedio" value={`${fmtScore(data.kpis.averageAttractionIndex)}/100`} sub="todos los mercados" icon={BarChart2} />
            <KpiCard label="Reducción de análisis" value={`${data.kpis.analysisTimeReduction}%`} sub="vs proceso manual" icon={Clock} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Índice de atractivo — Mejor mercado</h3>
              {data.kpis.bestMarket ? (
                <AttractionGauge score={data.kpis.bestMarket.score} label={data.kpis.bestMarket.name} />
              ) : <div className="text-slate-400 text-xs py-4 text-center">Sin datos</div>}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Distribución por aptitud</h3>
              <AptitudeDonut distribution={data.aptitudeDistribution} />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Dimensiones PESTEL promedio</h3>
              <PestelMeters pestel={data.pestel} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Top 5 mercados vs umbral</h3>
              <ProfitabilityBar topMarkets={data.topMarkets} />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Top mercados</h3>
              <div className="space-y-2">
                {data.topMarkets.map((m, i) => (
                  <div key={m.iso3} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-4">{i + 1}</span>
                      <button onClick={() => navigate(`/pais/${m.iso3}`)} className="text-sm font-medium text-slate-700 hover:text-wine-800 transition-colors">{m.country}</button>
                      <span className="text-xs text-slate-400">{m.region}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{fmtScore(m.score)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor(m.status)}`}>{statusLabel(m.status)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Mapa de calor de indicadores</h3>
              <IndicatorHeatmap heatmap={data.heatmap} />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Alertas recientes</h3>
              <AlertPanel alerts={data.alerts} />
            </div>
          </div>
        </>
      )}
    </PageContainer>
  )
}
