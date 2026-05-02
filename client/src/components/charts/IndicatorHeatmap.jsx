const COLS = ['pbi_per_capita_usd','inflacion_pct','importacion_vino_usd','arancel_vino_pct','score_logistico','estabilidad_politica']
const LABELS = {'pbi_per_capita_usd':'PBI/cáp','inflacion_pct':'Inflación','importacion_vino_usd':'Imp.Vino','arancel_vino_pct':'Arancel','score_logistico':'Logística','estabilidad_politica':'Estabilidad'}

function cellColor(val) {
  if (val == null) return '#f8fafc'
  const v = parseFloat(val)
  if (v >= 70) return '#bbf7d0'
  if (v >= 40) return '#fef08a'
  return '#fecaca'
}

export default function IndicatorHeatmap({ heatmap }) {
  if (!heatmap?.length) return null
  return (
    <div className="overflow-x-auto">
      <table className="text-xs w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left py-1 pr-3 text-slate-500 font-medium">País</th>
            {COLS.map(c => <th key={c} className="px-2 py-1 text-slate-500 font-medium text-center">{LABELS[c]}</th>)}
          </tr>
        </thead>
        <tbody>
          {heatmap.map((row) => (
            <tr key={row.iso3}>
              <td className="py-1 pr-3 font-medium text-slate-700">{row.iso3}</td>
              {COLS.map(c => (
                <td key={c} className="px-2 py-1 text-center rounded" style={{ backgroundColor: cellColor(row[c]) }}>
                  {row[c] != null ? parseFloat(row[c]).toFixed(0) : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
