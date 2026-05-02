import React, { useState, useEffect } from 'react'
import { getCompare, getCountries } from '../api/apiClient'
import PageContainer from '../components/layout/PageContainer'
import CountryRadar from '../components/charts/CountryRadar'
import { fmtUSD, fmtPct, fmtScore } from '../utils/formatters'
import { statusColor, statusLabel } from '../utils/scoreColors'

const ALL_COUNTRIES = ['USA','GBR','CAN','DEU','NLD','JPN','CHE','CHN','BRA','MEX']

export default function ComparePage() {
  const [year, setYear] = useState(2026)
  const [selected, setSelected] = useState(['USA', 'GBR'])
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (selected.length >= 2) load() }, [selected, year])

  async function load() {
    setLoading(true)
    try {
      const res = await getCompare(selected, year)
      setData(res.data)
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }

  function toggle(iso3) {
    setSelected(prev =>
      prev.includes(iso3) ? (prev.length > 2 ? prev.filter(c => c !== iso3) : prev) : (prev.length < 4 ? [...prev, iso3] : prev)
    )
  }

  const DIM_ROWS = [
    { key: 'economicScore', label: 'Económica' },
    { key: 'commercialScore', label: 'Comercial' },
    { key: 'demandScore', label: 'Demanda' },
    { key: 'logisticsScore', label: 'Logística' },
    { key: 'riskScore', label: 'Riesgo' },
    { key: 'legalScore', label: 'Legal' },
  ]

  const IND_ROWS = [
    { code: 'pbi_per_capita_usd', label: 'PBI per cápita', fmt: fmtUSD },
    { code: 'inflacion_pct', label: 'Inflación', fmt: fmtPct },
    { code: 'importacion_vino_usd', label: 'Importación vino', fmt: fmtUSD },
    { code: 'arancel_vino_pct', label: 'Arancel vino', fmt: fmtPct },
    { code: 'score_logistico', label: 'Score logístico', fmt: v => `${v}/100` },
  ]

  return (
    <PageContainer title="Comparador de mercados" subtitle="Seleccioná 2 a 4 países para comparar">
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={year} onChange={e => setYear(+e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white">
          {[2026,2025,2024,2023,2022,2021,2020].map(y => <option key={y}>{y}</option>)}
        </select>
        <div className="flex flex-wrap gap-1.5">
          {ALL_COUNTRIES.map(c => (
            <button key={c} onClick={() => toggle(c)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${selected.includes(c) ? 'bg-wine-800 text-white border-wine-800' : 'bg-white text-slate-600 border-slate-200 hover:border-wine-800'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando...</div>
      ) : data.length < 2 ? (
        <div className="text-center py-12 text-slate-400">Seleccioná al menos 2 países</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Radar de dimensiones</h3>
            <CountryRadar countries={data} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Scores totales</h3>
            <div className="space-y-2">
              {data.map(c => (
                <div key={c.iso3} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <div>
                    <span className="font-medium text-slate-800">{c.country}</span>
                    <span className="text-xs text-slate-400 ml-2">{c.region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{fmtScore(c.totalScore)}/100</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor(c.status)}`}>{statusLabel(c.status)}</span>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-semibold text-slate-700 mt-4 mb-2">Dimensiones</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-1 text-slate-500">Dimensión</th>
                    {data.map(c => <th key={c.iso3} className="py-1 text-center text-slate-500">{c.iso3}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {DIM_ROWS.map(d => (
                    <tr key={d.key} className="border-b border-slate-50">
                      <td className="py-1.5 text-slate-600">{d.label}</td>
                      {data.map(c => <td key={c.iso3} className="py-1.5 text-center font-medium text-slate-700">{fmtScore(c[d.key])}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Indicadores comparados</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 pr-4 text-slate-500 text-xs">Indicador</th>
                    {data.map(c => <th key={c.iso3} className="py-2 px-3 text-center text-slate-500 text-xs">{c.country}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {IND_ROWS.map(r => (
                    <tr key={r.code} className="border-b border-slate-50">
                      <td className="py-2 pr-4 text-slate-600 text-xs">{r.label}</td>
                      {data.map(c => <td key={c.iso3} className="py-2 px-3 text-center text-slate-700 text-xs">{c.indicators?.[r.code]?.value != null ? r.fmt(c.indicators[r.code].value) : '—'}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data[0]?.explanation && (
              <div className="mt-4 p-3 bg-wine-50 rounded-lg border border-wine-100">
                <p className="text-xs text-wine-800 font-medium mb-1">Resumen ejecutivo</p>
                {data.map(c => c.explanation && <p key={c.iso3} className="text-xs text-slate-600 mb-1">{c.explanation}</p>)}
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  )
}
