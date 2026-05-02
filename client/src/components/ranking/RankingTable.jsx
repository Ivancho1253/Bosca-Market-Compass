import { useNavigate } from 'react-router-dom'
import { fmtUSD, fmtPct, fmtScore } from '../../utils/formatters'
import { statusColor, statusLabel } from '../../utils/scoreColors'
import { ExternalLink } from 'lucide-react'

export default function RankingTable({ rows, loading }) {
  const navigate = useNavigate()
  if (loading) return <div className="text-center py-12 text-slate-400">Cargando ranking...</div>
  if (!rows?.length) return <div className="text-center py-12 text-slate-400">Sin datos disponibles</div>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {['#','País','Región','PBI/cáp','Inflación','Imp. Vino','Arancel','Score','Estado',''].map(h => (
              <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.iso3} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <td className="py-3 px-3 text-slate-400 font-mono text-xs">{r.rank}</td>
              <td className="py-3 px-3">
                <div className="font-medium text-slate-800">{r.country}</div>
                <div className="text-xs text-slate-400">{r.iso3}</div>
              </td>
              <td className="py-3 px-3 text-slate-600 text-xs">{r.region}</td>
              <td className="py-3 px-3 text-slate-700">{r.pbiPerCapita ? fmtUSD(r.pbiPerCapita) : '—'}</td>
              <td className="py-3 px-3 text-slate-700">{fmtPct(r.inflation)}</td>
              <td className="py-3 px-3 text-slate-700">{r.wineImportsUsd ? fmtUSD(r.wineImportsUsd) : '—'}</td>
              <td className="py-3 px-3 text-slate-700">{fmtPct(r.tariff)}</td>
              <td className="py-3 px-3">
                <span className="font-bold text-slate-800">{fmtScore(r.score)}</span>
                <span className="text-slate-400 text-xs">/100</span>
              </td>
              <td className="py-3 px-3">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColor(r.status)}`}>
                  {statusLabel(r.status)}
                </span>
              </td>
              <td className="py-3 px-3">
                <button onClick={() => navigate(`/pais/${r.iso3}`)} className="text-wine-800 hover:text-wine-500 transition-colors">
                  <ExternalLink size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
