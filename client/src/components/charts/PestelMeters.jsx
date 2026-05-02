export default function PestelMeters({ pestel }) {
  if (!pestel?.length) return null
  return (
    <div className="space-y-2">
      {pestel.map((p) => {
        const s = parseFloat(p.score) || 0
        const color = s >= 70 ? 'bg-green-500' : s >= 40 ? 'bg-amber-400' : 'bg-red-500'
        return (
          <div key={p.dimension}>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-slate-600 font-medium">{p.dimension}</span>
              <span className="text-slate-500">{s.toFixed(0)}/100</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${s}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
