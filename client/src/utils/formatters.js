export const fmtUSD = (v) => {
  if (v == null) return '—'
  const n = parseFloat(v)
  if (n >= 1e9) return `USD ${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `USD ${(n / 1e6).toFixed(0)}M`
  return `USD ${n.toLocaleString('es-AR')}`
}

export const fmtPct = (v, decimals = 1) => v != null ? `${parseFloat(v).toFixed(decimals)}%` : '—'
export const fmtNum = (v) => v != null ? parseFloat(v).toLocaleString('es-AR') : '—'
export const fmtScore = (v) => v != null ? parseFloat(v).toFixed(1) : '—'
export const fmtPop = (v) => {
  if (v == null) return '—'
  const n = parseFloat(v)
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`
  return fmtNum(v)
}
