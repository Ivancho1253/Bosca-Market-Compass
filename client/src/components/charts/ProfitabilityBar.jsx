import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts'

const THRESHOLD = 70

export default function ProfitabilityBar({ topMarkets }) {
  if (!topMarkets?.length) return null
  const data = topMarkets.map(m => ({ name: m.iso3, score: parseFloat(m.score), status: m.status }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={36} />
        <Tooltip formatter={(v) => [`${v}/100`, 'Índice']} />
        <ReferenceLine x={THRESHOLD} stroke="#16a34a" strokeDasharray="4 4" label={{ value: 'Umbral', position: 'insideTopRight', fontSize: 10, fill: '#16a34a' }} />
        <Bar dataKey="score" radius={[0, 4, 4, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.score >= 70 ? '#16a34a' : d.score >= 40 ? '#d97706' : '#dc2626'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
