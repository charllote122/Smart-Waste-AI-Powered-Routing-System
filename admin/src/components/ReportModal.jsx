import { X, MapPin, Calendar, User, AlertTriangle, CheckCircle } from 'lucide-react'

const ReportModal = ({ report, onClose, onUpdateStatus }) => {
    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'Critical': return 'text-red-400'
            case 'High': return 'text-orange-400'
            case 'Medium': return 'text-yellow-400'
            default: return 'text-green-400'
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-400'
            case 'in-progress': return 'text-blue-400'
            default: return 'text-yellow-400'
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-semibold text-white">Report Details</h2>
                            <p className="text-gray-400 text-sm mt-1">
                                ID: {report.id} • {report.timestamp.toLocaleDateString()} at {report.timestamp.toLocaleTimeString()}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors p-1"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Waste Type</label>
                                <p className="text-white font-medium text-lg">{report.analysis?.wasteType}</p>
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Urgency Level</label>
                                <p className={`font-medium text-lg ${getUrgencyColor(report.analysis?.urgency)}`}>
                                    {report.analysis?.urgency}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Fill Level</label>
                                <div className="flex items-center space-x-3">
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-green-400 to-red-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${report.analysis?.fillLevel || 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-white font-medium text-sm whitespace-nowrap">
                                        {report.analysis?.fillLevel}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Location</label>
                                <div className="flex items-center space-x-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <p className="text-white font-medium">{report.county} County</p>
                                </div>
                                {report.location && (
                                    <p className="text-gray-400 text-sm mt-1">
                                        {report.location.lat.toFixed(6)}, {report.location.lng.toFixed(6)}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Confidence Score</label>
                                <p className="text-white font-medium">{report.analysis?.confidence}%</p>
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Report Type</label>
                                <p className="text-white font-medium">
                                    {report.type === "automatic" ? "CCTV Auto-Detection" : "Manual Upload"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Detected Items */}
                    {report.analysis?.detectedItems && report.analysis.detectedItems.length > 0 && (
                        <div>
                            <label className="text-sm text-gray-400 block mb-3">Detected Items</label>
                            <div className="flex flex-wrap gap-2">
                                {report.analysis.detectedItems.map((item, index) => (
                                    <span key={index} className="bg-gray-700 text-gray-300 px-3 py-2 rounded-lg text-sm">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Recommendations */}
                    {report.analysis?.recommendations && report.analysis.recommendations.length > 0 && (
                        <div>
                            <label className="text-sm text-gray-400 block mb-3">AI Recommendations</label>
                            <div className="space-y-2">
                                {report.analysis.recommendations.map((rec, index) => (
                                    <div key={index} className="flex items-start space-x-3 bg-gray-700/50 rounded-lg p-3">
                                        <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-gray-300 text-sm">{rec}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Image Preview */}
                    {report.image && (
                        <div>
                            <label className="text-sm text-gray-400 block mb-2">Uploaded Image</label>
                            <img
                                src={report.image}
                                alt="Waste report"
                                className="w-full h-48 object-cover rounded-lg border border-gray-700"
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => onUpdateStatus('completed')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            <span>Mark Complete</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReportModal