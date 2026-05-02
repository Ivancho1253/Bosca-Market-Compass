import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { BarChart2, Globe, GitCompare, Bell, FileText, Menu, X } from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: BarChart2 },
  { to: '/ranking', label: 'Ranking', icon: Globe },
  { to: '/comparar', label: 'Comparar', icon: GitCompare },
  { to: '/alertas', label: 'Alertas', icon: Bell },
  { to: '/reportes', label: 'Reportes', icon: FileText },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-wine-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">LB</div>
            <span className="font-semibold text-sm hidden sm:block">Luigi Bosca</span>
            <span className="font-semibold text-sm sm:hidden">Luigi Bosca MIS</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${isActive ? 'bg-white/20 font-medium' : 'hover:bg-white/10'}`
                }>
                <Icon size={14} />
                {label}
              </NavLink>
            ))}
          </div>

          <button className="md:hidden p-1" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-3 flex flex-col gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded text-sm ${isActive ? 'bg-white/20 font-medium' : 'hover:bg-white/10'}`
                }>
                <Icon size={14} />
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
