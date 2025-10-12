import React, { useState, useEffect } from 'react';
import { Trash2, MapPin, Clock, Monitor, Eye, Upload, RefreshCw, Filter, Download, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

import apiService from '../../services/api';

const ReportsView = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchReports();
    }, [filterStatus, filterPriority]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const filters = {};
            if (filterStatus) filters.status = filterStatus;
            if (filterPriority) filters.priority = filterPriority;
            
            const response = await apiService.getReports(filters);
            setReports(response.reports || []);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching reports:', err);
        } finally {
            setLoading(false);
        }
    };

    const refreshReports = async () => {
        setRefreshing(true);
        await fetchReports();
        setRefreshing(false);
    };

    const updateReportStatus = async (reportId, newStatus) => {
        try {
            await apiService.updateReport(reportId, { status: newStatus });
            await fetchReports();
        } catch (err) {
            console.error('Error updating report:', err);
            alert('Failed to update report status');
        }
    };

    const deleteReport = async (reportId) => {
        if (!window.confirm('Are you sure you want to delete this report?')) {
            return;
        }

        try {
            await apiService.deleteReport(reportId);
            await fetchReports();
        } catch (err) {
            console.error('Error deleting report:', err);
            alert('Failed to delete report');
        }
    };

    const downloadReportImage = async (reportId, imageName) => {
        try {
            const imageData = await apiService.getReportImage(reportId);
            
            // Convert base64 to blob and download
            const byteCharacters = atob(imageData.image);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = imageName || 'report-image.jpg';
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading image:', err);
            alert('Failed to download image');
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'resolved':
                return 'bg-green-100 text-green-800';
            case 'in progress':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'pending':
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'resolved':
                return <CheckCircle className="w-4 h-4" />;
            case 'in progress':
                return <RefreshCw className="w-4 h-4" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4" />;
            case 'pending':
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Critical':
                return 'bg-red-100 text-red-800';
            case 'High':
                return 'bg-orange-100 text-orange-800';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'Low':
            default:
                return 'bg-green-100 text-green-800';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
    };

    const statsData = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'Pending').length,
        inProgress: reports.filter(r => r.status === 'In Progress').length,
        resolved: reports.filter(r => r.status === 'Resolved').length,
    };

    if (loading && !refreshing) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
                    <p className="text-gray-600 text-lg font-medium">Loading reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">Waste Reports Dashboard</h1>
                    <p className="text-xl text-gray-600 mb-6">Track all waste reports with AI analysis</p>
                    
                    {/* Stats */}
                    <div className="flex justify-center space-x-8 mb-8">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">{statsData.total}</div>
                            <div className="text-sm text-gray-600">Total Reports</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">{statsData.resolved}</div>
                            <div className="text-sm text-gray-600">Resolved</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-600">{statsData.pending}</div>
                            <div className="text-sm text-gray-600">Pending</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">{statsData.inProgress}</div>
                            <div className="text-sm text-gray-600">In Progress</div>
                        </div>
                    </div>

                    {/* Filters and Actions */}
                    <div className="flex justify-center items-center space-x-4 flex-wrap gap-4">
                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-gray-600" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5 text-gray-600" />
                            <select
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Priorities</option>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>

                        <button
                            onClick={refreshReports}
                            disabled={refreshing}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                            <p className="text-red-700 font-medium">Error: {error}</p>
                        </div>
                    </div>
                )}

                {/* Reports Grid */}
                {reports.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Trash2 className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-xl font-semibold">No reports found</p>
                        <p className="text-gray-400 mt-2">
                            {filterStatus || filterPriority 
                                ? 'Try adjusting your filters'
                                : 'Start by analyzing waste images'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {reports.map((report) => (
                            <div key={report.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
                                {/* Image Section */}
                                {report.has_image && (
                                    <div className="relative h-56 bg-gray-200">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Upload className="w-16 h-16 text-gray-400" />
                                        </div>
                                        <div className="absolute top-4 right-4 flex space-x-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(report.priority)}`}>
                                                {report.priority} Priority
                                            </span>
                                        </div>
                                        
                                        <div className="absolute bottom-4 right-4">
                                            <button
                                                onClick={() => downloadReportImage(report.id, report.image_name)}
                                                className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                                                title="Download Image"
                                            >
                                                <Download className="w-4 h-4 text-gray-700" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Content Section */}
                                <div className="p-6">
                                    {/* Status and Confidence */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(report.status)}`}>
                                            {getStatusIcon(report.status)}
                                            <span>{report.status}</span>
                                        </span>
                                        <div className="flex items-center space-x-2 text-blue-600">
                                            <span className="text-sm font-medium">{report.ai_confidence/100}% confident</span>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="mb-4">
                                        <div className="flex items-center text-gray-700 mb-2">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            <span className="font-semibold">{report.location}</span>
                                        </div>
                                    </div>

                                    {/* Timestamp */}
                                    <div className="flex items-center text-gray-500 text-sm mb-4">
                                        <Clock className="w-4 h-4 mr-2" />
                                        <span>{formatDate(report.reportedAt)}</span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-3 gap-2 mt-4">
                                        <button
                                            onClick={() => updateReportStatus(report.id, 'In Progress')}
                                            className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                                        >
                                            In Progress
                                        </button>
                                        <button
                                            onClick={() => updateReportStatus(report.id, 'Resolved')}
                                            className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs font-medium transition-colors"
                                        >
                                            Resolve
                                        </button>
                                        <button
                                            onClick={() => deleteReport(report.id)}
                                            className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsView;