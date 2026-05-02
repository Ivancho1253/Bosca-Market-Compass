export function statusColor(status) {
  if (status === 'apto') return 'text-green-700 bg-green-50 border-green-200'
  if (status === 'en_evaluacion') return 'text-amber-700 bg-amber-50 border-amber-200'
  return 'text-red-700 bg-red-50 border-red-200'
}

export function statusLabel(status) {
  if (status === 'apto') return 'Apto'
  if (status === 'en_evaluacion') return 'En evaluación'
  return 'No apto'
}

export function scoreToColor(score) {
  const n = parseFloat(score)
  if (n >= 70) return '#16a34a'
  if (n >= 40) return '#d97706'
  return '#dc2626'
}

export function priorityColor(priority) {
  if (priority === 'alta') return 'border-l-red-500 bg-red-50'
  if (priority === 'media') return 'border-l-amber-500 bg-amber-50'
  return 'border-l-blue-400 bg-blue-50'
}

export function priorityBadge(priority) {
  if (priority === 'alta') return 'bg-red-100 text-red-700'
  if (priority === 'media') return 'bg-amber-100 text-amber-700'
  return 'bg-blue-100 text-blue-700'
}
