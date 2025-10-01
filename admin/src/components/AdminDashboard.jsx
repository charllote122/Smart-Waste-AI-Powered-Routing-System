import { useState } from 'react'
import {
    Shield, LogOut, RefreshCw, Search, Filter,
    Download, Users, Settings, BarChart3,
    AlertTriangle, CheckCircle, Clock, Trash2,
    Eye, MoreVertical, User, MapPin, Calendar
} from 'lucide-react'
import ReportModal from './ReportModal'

const AdminDashboard = ({
    admin,
    reports,
    loading,
    onLogout,
    onRefresh,
    onUpdateReportStatus,
    onDeleteReport
}) => {
    const [filter, setFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedReport, setSelectedReport] = useState(null)

    // Filter and search reports
    const filteredReports = reports.filter(report => {
        const matchesFilter = filter === 'all' || report.status === filter
        const matchesSearch = searchTerm === '' ||
            report.analysis?.wasteType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.county?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesFilter && matchesSearch
    })

    // Statistics
    const stats = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        inProgress: reports.filter(r => r.status === 'in-progress').length,
        completed: reports.filter(r => r.status === 'completed').length,
        critical: reports.filter(r => r.analysis?.urgency === 'Critical').length,
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />
            case 'in-progress': return <RefreshCw className="w-4 h-4 text-blue-400" />
            default: return <Clock className="w-4 h-4 text-yellow-400" />
        }
    }

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'Critical': return 'text-red-400 bg-red-500/20'
            case 'High': return 'text-orange-400 bg-orange-500/20'
            case 'Medium': return 'text-yellow-400 bg-yellow-500/20'
            default: return 'text-green-400 bg-green-500/20'
        }
    }

    return (
        <div className="min-h-screen admin-gradient-bg">
            {/* Top Navigation */}
            <nav className="bg-gray-800/80 backdrop-blur-xl border-b border-gray-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Left Section */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold text-white">Admin Console</h1>
                                    <p className="text-xs text-gray-400">WasteSpotter Management</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onRefresh}
                                disabled={loading}
                                className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>

                            <div className="flex items-center space-x-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium text-white">{admin.name}</p>
                                    <p className="text-xs text-gray-400">Administrator</p>
                                </div>
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <button
                                onClick={onLogout}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="admin-glass rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Total Reports</p>
                                <p className="text-2xl font-bold text-white">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="admin-glass rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Pending</p>
                                <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-400" />
                            </div>
                        </div>
                    </div>

                    <div className="admin-glass rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">In Progress</p>
                                <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <RefreshCw className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="admin-glass rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Critical</p>
                                <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reports Table */}
                <div className="admin-glass rounded-2xl border border-gray-700/50 overflow-hidden">
                    {/* Table Header */}
                    <div className="p-6 border-b border-gray-700/50">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                            <h3 className="text-xl font-semibold text-white">Reports Management</h3>

                            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search reports..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64"
                                    />
                                </div>

                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Reports List */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700/30">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Report</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/30">
                                {filteredReports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-700/20 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <p className="text-sm font-medium text-white">
                                                    {report.analysis?.wasteType || "Waste Report"}
                                                </p>
                                                <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{report.timestamp.toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span>{report.type === "automatic" ? "CCTV" : "Manual"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-white">{report.county}</p>
                                                    {report.analysis?.urgency && (
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(report.analysis.urgency)}`}>
                                                            {report.analysis.urgency}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                {getStatusIcon(report.status)}
                                                <select
                                                    value={report.status || "pending"}
                                                    onChange={(e) => onUpdateReportStatus(report.id, e.target.value)}
                                                    className="bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-1 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="in-progress">In Progress</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => setSelectedReport(report)}
                                                    className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDeleteReport(report.id)}
                                                    className="text-red-400 hover:text-red-300 transition-colors p-1"
                                                    title="Delete Report"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredReports.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-gray-500" />
                                </div>
                                <p className="text-gray-400 text-lg">No reports found</p>
                                <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search terms</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Report Detail Modal */}
            {selectedReport && (
                <ReportModal
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                    onUpdateStatus={(newStatus) => {
                        onUpdateReportStatus(selectedReport.id, newStatus)
                        setSelectedReport(null)
                    }}
                />
            )}
        </div>
    )
}

export default AdminDashboard