import React, { useState, useEffect } from 'react'
import { generateReport, getReports } from '../api/apiClient'
import PageContainer from '../components/layout/PageContainer'
import { FileText, Download } from 'lucide-react'
import { statusColor, statusLabel } from '../utils/scoreColors'
import { fmtScore } from '../utils/formatters'

const COUNTRIES = ['USA','GBR','CAN','DEU','NLD','JPN','CHE','CHN','BRA','MEX']

export default function ReportsPage() {
  const [year, setYear] = useState(2026)
  const [selected, setSelected] = useState(['USA','GBR','CAN'])
  const [reports, setReports] = useState([])
  const [current, setCurrent] = useState(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => { loadReports() }, [])

  async function loadReports() {
    try {
      const res = await getReports()
      setReports(res.data)
    } catch { setReports([]) }
  }

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await generateReport({ year, countries: selected })
      setCurrent(res.data)
      await loadReports()
    } catch (e) {
      alert('Error generando reporte: ' + (e.response?.data?.error || e.message))
    } finally {
      setGenerating(false)
    }
  }

  function toggleCountry(iso3) {
    setSelected(prev => prev.includes(iso3) ? prev.filter(c => c !== iso3) : [...prev, iso3])
  }

  function printReport() { window.print() }

  return (
    <PageContainer title="Reportes ejecutivos" subtitle="Generá reportes para mercados seleccionados">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Configurar reporte</h3>

          <label className="text-xs text-slate-500 block mb-1">Año</label>
          <select value={year} onChange={e => setYear(+e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white mb-3">
            {[2026,2025,2024,2023,2022,2021,2020].map(y => <option key={y}>{y}</option>)}
          </select>

          <label className="text-xs text-slate-500 block mb-1">Países ({selected.length} seleccionados)</label>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {COUNTRIES.map(c => (
              <button key={c} onClick={() => toggleCountry(c)}
                className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${selected.includes(c) ? 'bg-wine-800 text-white border-wine-800' : 'bg-white text-slate-600 border-slate-200'}`}>
                {c}
              </button>
            ))}
          </div>

          <button onClick={handleGenerate} disabled={generating || selected.length === 0}
            className="w-full bg-wine-800 hover:bg-wine-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <FileText size={14} />
            {generating ? 'Generando...' : 'Generar reporte'}
          </button>

          {reports.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-slate-500 mb-2">Reportes anteriores</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {reports.map(r => (
                  <button key={r.id} onClick={() => setCurrent(r)}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-50 border border-slate-100 text-xs">
                    <div className="font-medium text-slate-700">{r.title}</div>
                    <div className="text-slate-400">{new Date(r.created_at).toLocaleDateString('es-AR')}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {current ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 print:shadow-none" id="report-print">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs text-wine-800 font-semibold uppercase tracking-wide">Luigi Bosca</div>
                  <h2 className="text-lg font-bold text-slate-800">{current.title}</h2>
                  <div className="text-xs text-slate-400">Generado el {new Date(current.created_at).toLocaleDateString('es-AR', { day:'2-digit', month:'long', year:'numeric' })}</div>
                </div>
                <button onClick={printReport} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-xs border border-slate-200 px-3 py-1.5 rounded-lg print:hidden">
                  <Download size={12} />
                  Imprimir
                </button>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 mb-5">
                <p className="text-sm text-slate-700 leading-relaxed">{current.summary}</p>
              </div>

              {current.recommendations?.map((r, i) => (
                <div key={r.iso3} className="mb-4 pb-4 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-slate-400">#{i + 1}</span>
                    <h3 className="font-semibold text-slate-800">{r.country}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor(r.status)}`}>{statusLabel(r.status)}</span>
                    <span className="text-sm font-bold text-slate-700 ml-auto">{fmtScore(r.score)}/100</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{r.explanation}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {r.strengths?.length > 0 && (
                      <div>
                        <div className="text-green-700 font-medium mb-1">Fortalezas</div>
                        {r.strengths.map(s => <div key={s} className="text-slate-600">• {s}</div>)}
                      </div>
                    )}
                    {r.risks?.length > 0 && (
                      <div>
                        <div className="text-red-700 font-medium mb-1">Riesgos</div>
                        {r.risks.map(s => <div key={s} className="text-slate-600">• {s}</div>)}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="mt-4 text-xs text-slate-400 text-center">
                MIS Luigi Bosca — Reporte generado automáticamente por el sistema de inteligencia comercial
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center justify-center h-full min-h-48 text-slate-400">
              <FileText size={32} className="mb-3 opacity-50" />
              <p className="text-sm">Configurá y generá un reporte para verlo aquí</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
