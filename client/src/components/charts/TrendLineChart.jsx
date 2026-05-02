import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function TrendLineChart({ scores }) {
  if (!scores?.length) return <div className="text-sm text-slate-400 py-8 text-center">Sin datos históricos</div>

  const data = scores.map(s => ({ year: s.year, score: parseFloat(s.total_score).toFixed(1) }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => [`${v}/100`, 'Índice atractivo']} />
        <Line type="monotone" dataKey="score" stroke="#7f1d1d" strokeWidth={2} dot={{ r: 3, fill: '#7f1d1d' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
