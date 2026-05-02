import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 30000 })

export const getDashboard = (year = 2024) => api.get(`/dashboard?year=${year}`)
export const getRanking = (params = {}) => api.get('/ranking', { params })
export const getCompare = (countries, year = 2024) => api.get(`/compare?countries=${countries.join(',')}&year=${year}`)
export const getCountries = () => api.get('/countries')
export const getCountry = (iso3) => api.get(`/countries/${iso3}`)
export const getIndicators = () => api.get('/indicators')
export const getAlerts = () => api.get('/alerts')
export const markAlertRead = (id) => api.patch(`/alerts/${id}/read`)
export const generateReport = (body) => api.post('/reports/executive', body)
export const getReports = () => api.get('/reports')
export const getReport = (id) => api.get(`/reports/${id}`)
export const runEtl = (years = '2020:2024') => api.post('/etl/run', { years })
export const getEtlRuns = () => api.get('/etl/runs')
