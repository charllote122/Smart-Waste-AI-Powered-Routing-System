import React, { useState, useRef, useCallback } from 'react';
import { Camera, MapPin, Brain, Zap, Users, Award, Upload, CheckCircle, AlertTriangle, Trash2, Home, Clock, Map } from 'lucide-react';

// Your original HeroSection component
const HeroSection = ({ setCurrentPage }) => (
    <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-8 animate-pulse">
                    <Brain className="w-4 h-4 mr-2" />
                    AI-Powered Waste Classification System
                </div>
                <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                    Report Waste Bins with
                    <span className="block bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                        Smart AI Detection
                    </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
                    Simply capture a photo of any waste bin. Our AI instantly analyzes the waste type,
                    captures location data, and sends alerts to municipal authorities for efficient collection.
                </p>

                <div className="flex justify-center mb-16">
                    <button
                        onClick={() => setCurrentPage('report')}
                        className="group bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xl font-semibold py-4 px-12 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3"
                    >
                        <Camera className="w-6 h-6 group-hover:animate-pulse" />
                        <span>Start Reporting Now</span>
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <div className="group text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Camera className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">1. Capture Photo</h3>
                        <p className="text-gray-600 text-sm">Take a clear photo of the waste bin</p>
                    </div>

                    <div className="group text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Brain className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">2. AI Analysis</h3>
                        <p className="text-gray-600 text-sm">ML identifies waste type & urgency</p>
                    </div>

                    <div className="group text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Zap className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">3. Auto Alert</h3>
                        <p className="text-gray-600 text-sm">County gets instant notification</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

// Header Component (Your improved design)
const Header = ({ currentPage, setCurrentPage }) => (
    <header className="bg-white shadow-lg border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                            <Camera className="w-7 h-7 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                            WasteSpotter
                        </h1>
                        <p className="text-xs text-gray-500 font-medium">AI-Powered Waste Detection</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600">
                    <button
                        onClick={() => setCurrentPage('home')}
                        className={`hover:text-blue-600 transition-colors ${currentPage === 'home' ? 'text-blue-600' : ''}`}
                    >
                        Home
                    </button>
                    <button
                        onClick={() => setCurrentPage('report')}
                        className={`hover:text-blue-600 transition-colors ${currentPage === 'report' ? 'text-blue-600' : ''}`}
                    >
                        Report Waste
                    </button>
                    <button
                        onClick={() => setCurrentPage('reports')}
                        className={`hover:text-blue-600 transition-colors ${currentPage === 'reports' ? 'text-blue-600' : ''}`}
                    >
                        View Reports
                    </button>
                    <div className="flex items-center space-x-1 text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>Nairobi County</span>
                    </div>
                </div>
            </div>
        </div>
    </header>
);

// Report Form Component
const ReportForm = ({ onSubmit }) => {
    const [image, setImage] = useState(null);
    const [location, setLocation] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const fileInputRef = useRef(null);

    const wasteTypes = ['Mixed Waste', 'Organic', 'Plastic', 'Paper', 'Glass', 'Metal', 'Hazardous'];
    const urgencyLevels = ['Low', 'Medium', 'High', 'Critical'];

    const getLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                () => {
                    // Fallback to Nairobi coordinates if location access denied
                    setLocation({ lat: -1.286389, lng: 36.817223 });
                }
            );
        } else {
            setLocation({ lat: -1.286389, lng: 36.817223 });
        }
    }, []);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImage(e.target.result);
                simulateAIAnalysis();
            };
            reader.readAsDataURL(file);
            getLocation();
        }
    };

    const simulateAIAnalysis = async () => {
        setIsAnalyzing(true);

        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock AI analysis results
        const mockAnalysis = {
            wasteType: wasteTypes[Math.floor(Math.random() * wasteTypes.length)],
            urgency: urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)],
            fillLevel: Math.floor(Math.random() * 100) + 1,
            confidence: Math.floor(Math.random() * 20) + 80
        };

        setAnalysis(mockAnalysis);
        setIsAnalyzing(false);
    };

    const handleSubmit = () => {
        if (image && location && analysis) {
            const report = {
                id: Date.now(),
                image,
                location,
                analysis,
                timestamp: new Date(),
                status: 'pending'
            };
            onSubmit(report);

            // Reset form
            setImage(null);
            setLocation(null);
            setAnalysis(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Report a Waste Bin</h1>
                    <p className="text-lg text-gray-600">Upload a photo and let our AI analyze the waste situation</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Upload Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Photo</h2>

                        {!image ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 mb-4">Click to upload or drag and drop</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => {
                                        console.log('Button clicked, file input ref:', fileInputRef.current);
                                        fileInputRef.current?.click();
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>Choose File</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <img src={image} alt="Uploaded waste bin" className="w-full h-64 object-cover rounded-xl" />
                                <button
                                    onClick={() => {
                                        console.log('Change photo clicked');
                                        fileInputRef.current?.click();
                                    }}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors"
                                >
                                    Change Photo
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Analysis Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Analysis</h2>

                        {!image ? (
                            <div className="text-center py-12">
                                <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Upload a photo to start AI analysis</p>
                            </div>
                        ) : isAnalyzing ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                                <p className="text-blue-600 font-medium">Analyzing image...</p>
                            </div>
                        ) : analysis ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span className="font-medium text-green-800">Analysis Complete</span>
                                    </div>
                                    <span className="text-green-600 text-sm">{analysis.confidence}% confident</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Waste Type</p>
                                        <p className="font-bold text-lg">{analysis.wasteType}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Urgency</p>
                                        <p className={`font-bold text-lg ${analysis.urgency === 'Critical' ? 'text-red-600' :
                                                analysis.urgency === 'High' ? 'text-orange-600' :
                                                    analysis.urgency === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                                            }`}>
                                            {analysis.urgency}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">Fill Level: {analysis.fillLevel}%</p>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                                            style={{ width: `${analysis.fillLevel}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {location && (
                                    <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                                        <MapPin className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-blue-800">Location Captured</p>
                                            <p className="text-sm text-blue-600">
                                                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    Submit Report
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reports View Component
const ReportsView = ({ reports }) => (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Submitted Reports</h1>
                <p className="text-lg text-gray-600">Track all your waste bin reports</p>
            </div>

            {reports.length === 0 ? (
                <div className="text-center py-16">
                    <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No reports submitted yet</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map((report) => (
                        <div key={report.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <img
                                src={report.image}
                                alt="Waste bin report"
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${report.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            report.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${report.analysis.urgency === 'Critical' ? 'bg-red-100 text-red-800' :
                                            report.analysis.urgency === 'High' ? 'bg-orange-100 text-orange-800' :
                                                report.analysis.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                        }`}>
                                        {report.analysis.urgency}
                                    </span>
                                </div>

                                <p className="font-bold text-lg mb-2">{report.analysis.wasteType}</p>
                                <p className="text-gray-600 text-sm mb-4">
                                    Fill Level: {report.analysis.fillLevel}%
                                </p>

                                <div className="flex items-center text-gray-500 text-sm mb-2">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    <span>{report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}</span>
                                </div>

                                <div className="flex items-center text-gray-500 text-sm">
                                    <Clock className="w-4 h-4 mr-1" />
                                    <span>{report.timestamp.toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);

// Success Modal Component
const SuccessModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Report Submitted!</h3>
                <p className="text-gray-600 mb-6">
                    Your waste bin report has been successfully submitted to the municipal authorities.
                    You'll receive updates on the collection status.
                </p>
                <button
                    onClick={onClose}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

// Main App Component
const WasteReportingApp = () => {
    const [currentPage, setCurrentPage] = useState('home');
    const [reports, setReports] = useState([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleReportSubmit = (report) => {
        setReports(prevReports => [report, ...prevReports]);
        setShowSuccessModal(true);

        // Simulate status updates
        setTimeout(() => {
            setReports(prev => prev.map(r =>
                r.id === report.id ? { ...r, status: 'in-progress' } : r
            ));
        }, 5000);

        setTimeout(() => {
            setReports(prev => prev.map(r =>
                r.id === report.id ? { ...r, status: 'completed' } : r
            ));
        }, 15000);
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        setCurrentPage('reports');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

            {currentPage === 'home' && <HeroSection setCurrentPage={setCurrentPage} />}
            {currentPage === 'report' && <ReportForm onSubmit={handleReportSubmit} />}
            {currentPage === 'reports' && <ReportsView reports={reports} />}

            <SuccessModal isOpen={showSuccessModal} onClose={handleSuccessModalClose} />
        </div>
    );
};

export default WasteReportingApp;