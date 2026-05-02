import { AlertTriangle, Info, CheckCircle } from 'lucide-react'
import { priorityColor, priorityBadge } from '../../utils/scoreColors'

const icons = { alta: AlertTriangle, media: Info, baja: CheckCircle }
const iconColors = { alta: 'text-red-500', media: 'text-amber-500', baja: 'text-blue-400' }

export default function AlertPanel({ alerts, onMarkRead }) {
  if (!alerts?.length) return <div className="text-xs text-slate-400 py-4 text-center">Sin alertas</div>
  return (
    <div className="space-y-2">
      {alerts.map((a) => {
        const Icon = icons[a.priority] || Info
        return (
          <div key={a.id} className={`border-l-4 rounded-r-lg p-3 flex items-start gap-2 ${priorityColor(a.priority)}`}>
            <Icon size={14} className={`mt-0.5 flex-shrink-0 ${iconColors[a.priority]}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold text-slate-700 truncate">{a.title}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${priorityBadge(a.priority)}`}>{a.priority}</span>
              </div>
              <p className="text-xs text-slate-600">{a.message}</p>
            </div>
            {!a.is_read && onMarkRead && (
              <button onClick={() => onMarkRead(a.id)} className="text-slate-400 hover:text-slate-600 text-xs flex-shrink-0">✓</button>
            )}
          </div>
        )
      })}
    </div>
  )
}
