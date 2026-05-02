import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts'

const COLORS = { apto: '#16a34a', en_evaluacion: '#d97706', no_apto: '#dc2626' }
const LABELS = { apto: 'Apto', en_evaluacion: 'En evaluación', no_apto: 'No apto' }

export default function AptitudeDonut({ distribution }) {
  const data = Object.entries(distribution || {})
    .map(([k, v]) => ({ name: LABELS[k] || k, value: v, key: k }))
    .filter(d => d.value > 0)

  return (
    <PieChart width={200} height={180}>
      <Pie data={data} cx={95} cy={80} innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
        {data.map((d) => <Cell key={d.key} fill={COLORS[d.key] || '#94a3b8'} />)}
      </Pie>
      <Tooltip formatter={(v) => [v, 'países']} />
      <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs">{v}</span>} />
    </PieChart>
  )
}
