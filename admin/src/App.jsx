import { useState, useEffect } from 'react'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
import adminApiService from './services/adminApi'

function App() {
  const [admin, setAdmin] = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)

  // Check for existing admin session
  useEffect(() => {
    const savedAdmin = localStorage.getItem('wastespotter_admin')
    const token = localStorage.getItem('wastespotter_admin_token')

    if (savedAdmin && token) {
      const adminData = JSON.parse(savedAdmin)
      setAdmin(adminData)
      adminApiService.setToken(token)
      loadReports()
      loadStats()
    }
  }, [])

  const loadReports = async (filters = {}) => {
    setLoading(true)
    try {
      const result = await adminApiService.getReports(filters)
      setReports(result.reports)
    } catch (error) {
      console.error('Failed to load reports:', error)
      alert('Failed to load reports: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const result = await adminApiService.getStats()
      setStats(result)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleLogin = async (email, password) => {
    setLoading(true)
    try {
      const result = await adminApiService.login({ email, password })
      setAdmin(result.user)
      localStorage.setItem('wastespotter_admin', JSON.stringify(result.user))
      await loadReports()
      await loadStats()
    } catch (error) {
      alert('Login failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setAdmin(null)
    setReports([])
    setStats(null)
    localStorage.removeItem('wastespotter_admin')
    adminApiService.removeToken()
  }

  const handleUpdateReportStatus = async (reportId, newStatus) => {
    try {
      await adminApiService.updateReportStatus(reportId, newStatus)
      setReports(prev => prev.map(report =>
        report.id === reportId ? { ...report, status: newStatus } : report
      ))
      await loadStats() // Refresh stats
    } catch (error) {
      alert('Failed to update report: ' + error.message)
    }
  }

  const handleDeleteReport = async (reportId) => {
    if (confirm('Are you sure you want to delete this report?')) {
      try {
        await adminApiService.deleteReport(reportId)
        setReports(prev => prev.filter(report => report.id !== reportId))
        await loadStats() // Refresh stats
      } catch (error) {
        alert('Failed to delete report: ' + error.message)
      }
    }
  }

  if (!admin) {
    return <AdminLogin onLogin={handleLogin} loading={loading} />
  }

  return (
    <AdminDashboard
      admin={admin}
      reports={reports}
      stats={stats}
      loading={loading}
      onLogout={handleLogout}
      onRefresh={loadReports}
      onUpdateReportStatus={handleUpdateReportStatus}
      onDeleteReport={handleDeleteReport}
    />
  )
}

export default App