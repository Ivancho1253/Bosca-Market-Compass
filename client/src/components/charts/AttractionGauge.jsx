import { PieChart, Pie, Cell } from 'recharts'

export default function AttractionGauge({ score, label }) {
  const val = parseFloat(score) || 0
  const data = [{ value: val }, { value: 100 - val }]
  const color = val >= 70 ? '#16a34a' : val >= 40 ? '#d97706' : '#dc2626'

  return (
    <div className="flex flex-col items-center">
      <PieChart width={160} height={90}>
        <Pie data={data} cx={75} cy={80} startAngle={180} endAngle={0} innerRadius={50} outerRadius={70} dataKey="value" strokeWidth={0}>
          <Cell fill={color} />
          <Cell fill="#f1f5f9" />
        </Pie>
      </PieChart>
      <div className="-mt-6 text-center">
        <div className="text-3xl font-bold" style={{ color }}>{val.toFixed(0)}</div>
        <div className="text-xs text-slate-500">/100</div>
        {label && <div className="text-xs font-medium text-slate-600 mt-0.5">{label}</div>}
      </div>
    </div>
  )
}
