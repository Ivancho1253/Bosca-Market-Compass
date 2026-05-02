import React, { useState, useEffect } from 'react'
import { getRanking } from '../api/apiClient'
import PageContainer from '../components/layout/PageContainer'
import RankingTable from '../components/ranking/RankingTable'

const REGIONS = ['', 'América', 'Europa', 'Asia']
const STATUSES = [{ value: '', label: 'Todos' }, { value: 'apto', label: 'Apto' }, { value: 'en_evaluacion', label: 'En evaluación' }, { value: 'no_apto', label: 'No apto' }]

export default function RankingPage() {
  const [year, setYear] = useState(2026)
  const [region, setRegion] = useState('')
  const [status, setStatus] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [year, region, status])

  async function load() {
    setLoading(true)
    try {
      const params = { year }
      if (region) params.region = region
      if (status) params.status = status
      const res = await getRanking(params)
      setRows(res.data)
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  const filters = (
    <div className="flex flex-wrap gap-2">
      <select value={year} onChange={e => setYear(+e.target.value)}
        className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white">
        {[2026,2025,2024,2023,2022,2021,2020].map(y => <option key={y}>{y}</option>)}
      </select>
      <select value={region} onChange={e => setRegion(e.target.value)}
        className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white">
        <option value="">Todas las regiones</option>
        {REGIONS.filter(Boolean).map(r => <option key={r}>{r}</option>)}
      </select>
      <select value={status} onChange={e => setStatus(e.target.value)}
        className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white">
        {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
    </div>
  )

  return (
    <PageContainer title="Ranking de mercados" subtitle="Ordenado por índice de atractivo de mayor a menor" actions={filters}>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <RankingTable rows={rows} loading={loading} />
      </div>
    </PageContainer>
  )
}
