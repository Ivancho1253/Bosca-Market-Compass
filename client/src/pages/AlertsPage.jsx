import React, { useState, useEffect } from 'react'
import { getAlerts, markAlertRead } from '../api/apiClient'
import PageContainer from '../components/layout/PageContainer'
import AlertPanel from '../components/alerts/AlertPanel'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await getAlerts()
      setAlerts(res.data)
    } catch {
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkRead(id) {
    await markAlertRead(id)
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a))
  }

  const filtered = filter === 'all' ? alerts : filter === 'unread' ? alerts.filter(a => !a.is_read) : alerts.filter(a => a.priority === filter)

  const unreadCount = alerts.filter(a => !a.is_read).length

  return (
    <PageContainer title="Alertas" subtitle={`${unreadCount} sin leer · ${alerts.length} total`}>
      <div className="flex gap-2 mb-4">
        {[
          { val: 'all', label: 'Todas' },
          { val: 'unread', label: 'Sin leer' },
          { val: 'alta', label: 'Alta' },
          { val: 'media', label: 'Media' },
          { val: 'baja', label: 'Baja' },
        ].map(f => (
          <button key={f.val} onClick={() => setFilter(f.val)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${filter === f.val ? 'bg-wine-800 text-white border-wine-800' : 'bg-white text-slate-600 border-slate-200 hover:border-wine-800'}`}>
            {f.label}
          </button>
        ))}
        <button onClick={load} className="ml-auto text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg bg-white">
          Actualizar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando alertas...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <AlertPanel alerts={filtered} onMarkRead={handleMarkRead} />
        </div>
      )}
    </PageContainer>
  )
}
