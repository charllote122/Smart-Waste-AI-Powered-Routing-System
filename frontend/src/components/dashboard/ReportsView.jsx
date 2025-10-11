import React from 'react';
import { Trash2, MapPin, Clock, Monitor, Eye, Upload } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ReportsView = () => {
    const { reports } = useApp();

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
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

    const getReportIcon = (type) => {
        switch (type) {
            case 'cctv':
                return <Monitor className="w-4 h-4" />;
            case 'live-camera':
                return <Eye className="w-4 h-4" />;
            case 'manual':
            default:
                return <Upload className="w-4 h-4" />;
        }
    };

    const getReportTypeLabel = (type) => {
        switch (type) {
            case 'cctv':
                return 'CCTV Report';
            case 'live-camera':
                return 'Live Camera';
            case 'manual':
            default:
                return 'Image Upload';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">Waste Reports Dashboard</h1>
                    <p className="text-xl text-gray-600 mb-4">Track all waste reports with location data</p>
                    <div className="flex justify-center space-x-8">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">{reports.length}</div>
                            <div className="text-sm text-gray-600">Total Reports</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">
                                {reports.filter(r => r.status === "completed").length}
                            </div>
                            <div className="text-sm text-gray-600">Completed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-600">
                                {reports.filter(r => r.status === "pending").length}
                            </div>
                            <div className="text-sm text-gray-600">Pending</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">
                                {reports.filter(r => r.status === "in-progress").length}
                            </div>
                            <div className="text-sm text-gray-600">In Progress</div>
                        </div>
                    </div>
                </div>

                {reports.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Trash2 className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-xl font-semibold">No reports generated yet</p>
                        <p className="text-gray-400 mt-2">Start by reporting waste in your area</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {reports.map((report) => (
                            <div key={report.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
                                {report.image && (
                                    <div className="relative">
                                        <img
                                            src={report.image}
                                            alt="Waste bin report"
                                            className="w-full h-56 object-cover"
                                        />
                                        <div className="absolute top-4 right-4 flex space-x-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(report.analysis.urgency)}`}>
                                                {report.analysis.urgency} Priority
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(report.status)}`}>
                                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                        </span>
                                        <div className="flex items-center space-x-2 text-blue-600">
                                            {getReportIcon(report.type)}
                                            <span className="text-sm font-medium">{getReportTypeLabel(report.type)}</span>
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-xl mb-2 text-gray-900">{report.analysis.wasteType}</h3>
                                    <p className="text-gray-600 text-sm mb-4">Fill Level: {report.analysis.fillLevel}%</p>

                                    <div className="space-y-2 mb-4">
                                        {report.camera && (
                                            <div className="flex items-center text-gray-500 text-sm">
                                                <Monitor className="w-4 h-4 mr-2" />
                                                <span>{report.camera}</span>
                                            </div>
                                        )}

                                        {report.location && (
                                            <div className="flex items-center text-gray-500 text-sm">
                                          <MapPin className="w-4 h-4 mr-2" />
                                                <span>
                                                    {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center text-gray-500 text-sm">
                                            <Clock className="w-4 h-4 mr-2" />
                                            <span>{report.timestamp.toLocaleDateString()} at {report.timestamp.toLocaleTimeString()}</span>
                                        </div>
                                    </div>

                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${report.analysis.fillLevel}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Fill Level</span>
                                        <span>{report.analysis.fillLevel}%</span>
                                    </div>

                                    {report.analysis.detectedItems && report.analysis.detectedItems.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Detected Items:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {report.analysis.detectedItems.slice(0, 3).map((item, index) => (
                                                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                                        {item}
                                                    </span>
                                                ))}
                                                {report.analysis.detectedItems.length > 3 && (
                                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                                        +{report.analysis.detectedItems.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
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