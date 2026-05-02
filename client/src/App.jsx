import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import DashboardPage from './pages/DashboardPage'
import RankingPage from './pages/RankingPage'
import ComparePage from './pages/ComparePage'
import CountryDetailPage from './pages/CountryDetailPage'
import AlertsPage from './pages/AlertsPage'
import ReportsPage from './pages/ReportsPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/comparar" element={<ComparePage />} />
            <Route path="/pais/:iso3" element={<CountryDetailPage />} />
            <Route path="/alertas" element={<AlertsPage />} />
            <Route path="/reportes" element={<ReportsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
