import { RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#7f1d1d', '#1d4ed8', '#15803d', '#b45309']

const DIM_LABELS = {
  economicScore: 'Económica',
  commercialScore: 'Comercial',
  demandScore: 'Demanda',
  logisticsScore: 'Logística',
  riskScore: 'Riesgo',
  legalScore: 'Legal',
}

export default function CountryRadar({ countries }) {
  if (!countries?.length) return <div className="text-sm text-slate-400 py-8 text-center">Seleccioná países para comparar</div>

  const dims = Object.keys(DIM_LABELS)
  const data = dims.map((d) => ({
    dim: DIM_LABELS[d],
    ...Object.fromEntries(countries.map(c => [c.iso3, parseFloat(c[d]) || 0])),
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11 }} />
        {countries.map((c, i) => (
          <Radar key={c.iso3} name={c.country} dataKey={c.iso3} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.12} strokeWidth={2} />
        ))}
        <Legend iconType="circle" iconSize={8} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
