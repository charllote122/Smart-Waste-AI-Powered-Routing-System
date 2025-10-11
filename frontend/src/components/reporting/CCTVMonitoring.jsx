import React, { useState, useCallback, useEffect } from 'react';
import { Monitor, MapPin, Brain, Play, Pause, Clock, AlertTriangle, Upload } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateBingMapsUrl, validateMapsConfig } from '../../config/maps';

const CCTVMonitoring = () => {
    const { submitReport } = useApp();
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [countdown, setCountdown] = useState(600);
    const [lastAnalysis, setLastAnalysis] = useState(null);
    const [userCoordinates, setUserCoordinates] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [showSubmitButton, setShowSubmitButton] = useState(false);
    const [mapsAvailable, setMapsAvailable] = useState(true);
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    // Check maps availability on component mount
    useEffect(() => {
        setMapsAvailable(validateMapsConfig());
        getCurrentLocation().catch(() => {
            // Silently handle initial failure
        });
    }, []);

    const getCurrentLocation = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by this browser"));
                return;
            }

            setIsGettingLocation(true);
            setLocationError(null);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp,
                        bingMapsUrl: generateBingMapsUrl(position.coords.latitude, position.coords.longitude)
                    };
                    setUserCoordinates(coords);
                    setLocationError(null);
                    setIsGettingLocation(false);
                    resolve(coords);
                },
                (error) => {
                    setIsGettingLocation(false);
                    let errorMsg;
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMsg = "Location access denied. Please enable location permissions in your browser settings.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMsg = "Location information is unavailable. Please check your device location services.";
                            break;
                        case error.TIMEOUT:
                            errorMsg = "Location request timed out. Please try again.";
                            break;
                        default:
                            errorMsg = "An unknown error occurred while getting location.";
                            break;
                    }
                    setLocationError(errorMsg);
                    reject(new Error(errorMsg));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 60000
                }
            );
        });
    }, []);

    useEffect(() => {
        let interval;
        if (isMonitoring && countdown > 0) {
            interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        generateAutomaticReport();
                        return 600;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isMonitoring, countdown]);

    const generateAutomaticReport = async () => {
        let currentCoords = userCoordinates;
        if (!currentCoords) {
            try {
                currentCoords = await getCurrentLocation();
            } catch (error) {
                setLocationError("Cannot generate report without location access");
                return;
            }
        }

        const wasteTypes = ["Mixed Waste", "Organic", "Plastic", "Paper", "Glass"];
        const urgencyLevels = ["Low", "Medium", "High", "Critical"];

        const analysis = {
            wasteType: wasteTypes[Math.floor(Math.random() * wasteTypes.length)],
            urgency: urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)],
            fillLevel: Math.floor(Math.random() * 100) + 1,
            confidence: Math.floor(Math.random() * 20) + 80,
            detectedItems: ["Plastic bottles", "Food waste", "Paper bags"],
            recommendations: ["Schedule immediate collection", "Check for overflow", "Monitor for 24 hours"],
        };

        setLastAnalysis(analysis);
        setShowSubmitButton(true);
    };

    const handleSubmitReport = () => {
        if (lastAnalysis && userCoordinates) {
            const report = {
                camera: "CCTV Auto-Detection",
                analysis: lastAnalysis,
                type: "cctv",
                location: userCoordinates,
                bingMapsUrl: generateBingMapsUrl(userCoordinates.lat, userCoordinates.lng)
            };
            submitReport(report);
            setShowSubmitButton(false);
            setLastAnalysis(null);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const retryLocation = () => {
        setLocationError(null);
        getCurrentLocation().catch((error) => {
            setLocationError(error.message);
        });
    };

    return (
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Monitor className="w-6 h-6 text-white" />
                        </div>
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isMonitoring ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                            }`}></div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">CCTV Monitoring</h2>
                        <p className="text-sm text-gray-500">Automated Location-based Detection</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-medium ${mapsAvailable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${mapsAvailable ? 'bg-green-500' : 'bg-yellow-500'
                            }`}></div>
                        <span>{mapsAvailable ? 'Maps Ready' : 'Maps Check'}</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-full">
                        <div className={`w-3 h-3 rounded-full ${isMonitoring ? "bg-green-500 animate-pulse" : "bg-gray-400"
                            }`}></div>
                        <span className="text-sm font-medium">{isMonitoring ? "Active" : "Inactive"}</span>
                    </div>
                </div>
            </div>

            {/* Location Status */}
            <div className="mb-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200 mb-4">
                    <div className="flex items-center space-x-3">
                        <MapPin className={`w-5 h-5 ${userCoordinates ? 'text-green-600' : 'text-blue-600'}`} />
                        <div>
                            <p className="font-medium text-gray-900">
                                {userCoordinates ? 'Live Location Tracking' : 'Location Services'}
                            </p>
                            <p className="text-sm text-gray-600">
                                {userCoordinates
                                    ? `Monitoring at ${userCoordinates.lat.toFixed(4)}, ${userCoordinates.lng.toFixed(4)}`
                                    : 'Enable location for automated reporting'
                                }
                            </p>
                        </div>
                    </div>
                    {!userCoordinates && !isGettingLocation && (
                        <button
                            onClick={getCurrentLocation}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Enable Location
                        </button>
                    )}
                    {isGettingLocation && (
                        <div className="flex items-center space-x-2 text-blue-600">
                            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                            <span className="text-sm">Getting location...</span>
                        </div>
                    )}
                </div>

                {/* Map Section */}
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden shadow-inner">
                    {userCoordinates ? (
                        <iframe
                            src={userCoordinates.bingMapsUrl}
                            className="w-full h-full rounded-2xl"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="CCTV Monitoring Location"
                        />
                    ) : (
                        <div className="text-center text-white">
                            <MapPin className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                            <p>Waiting for location access...</p>
                            <p className="text-sm text-gray-300 mt-2">Location is required for automated monitoring</p>
                            <button
                                onClick={getCurrentLocation}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Enable Location
                            </button>
                        </div>
                    )}
                    {userCoordinates && (
                        <>
                            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
                                📍 Live Monitoring Location
                            </div>
                            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-xs backdrop-blur-sm">
                                📍 {userCoordinates.lat.toFixed(4)}, {userCoordinates.lng.toFixed(4)}
                                {userCoordinates.accuracy && (
                                    <span className="ml-2 text-gray-300">±{Math.round(userCoordinates.accuracy)}m</span>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {locationError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                            <div>
                                <p className="text-red-700 text-sm font-medium">Location Error</p>
                                <p className="text-red-600 text-sm">{locationError}</p>
                            </div>
                        </div>
                        <button
                            onClick={retryLocation}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                    onClick={() => setIsMonitoring(!isMonitoring)}
                    disabled={!userCoordinates}
                    className={`flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${isMonitoring
                            ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg"
                            : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                        }`}
                >
                    {isMonitoring ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <span>{isMonitoring ? "Stop Monitoring" : "Start Monitoring"}</span>
                </button>

                <div className="flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <Clock className="w-5 h-5 text-blue-600 mr-3" />
                    <div className="text-center">
                        <span className="font-mono text-2xl font-bold text-blue-700 block">{formatTime(countdown)}</span>
                        <span className="text-xs text-blue-600 mt-1">Next auto-scan</span>
                    </div>
                </div>
            </div>

            {/* AI Analysis Results */}
            {lastAnalysis && (
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 mb-6 border border-blue-100">
                    <h3 className="font-bold text-xl mb-6 flex items-center">
                        <Brain className="w-6 h-6 mr-3 text-blue-600" />
                        Automated AI Analysis
                        <span className="ml-auto text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                            {lastAnalysis.confidence}% confident
                        </span>
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                            <p className="text-sm text-gray-600 font-medium">Waste Type</p>
                            <p className="font-bold text-lg text-gray-900">{lastAnalysis.wasteType}</p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                            <p className="text-sm text-gray-600 font-medium">Urgency</p>
                            <p className={`font-bold text-lg ${lastAnalysis.urgency === "Critical" ? "text-red-600" :
                                    lastAnalysis.urgency === "High" ? "text-orange-600" :
                                        lastAnalysis.urgency === "Medium" ? "text-yellow-600" : "text-green-600"
                                }`}>
                                {lastAnalysis.urgency}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                            <p className="text-sm text-gray-600 font-medium">Fill Level</p>
                            <p className="font-bold text-lg text-gray-900">{lastAnalysis.fillLevel}%</p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                            <p className="text-sm text-gray-600 font-medium">Location</p>
                            <p className="font-bold text-lg text-gray-900">Auto-detected</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-sm font-medium text-gray-700">Fill Level Progress</p>
                            <p className="text-sm text-gray-600">{lastAnalysis.fillLevel}%</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000 shadow-sm"
                                style={{ width: `${lastAnalysis.fillLevel}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Detected Items */}
                    <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Detected Items:</p>
                        <div className="flex flex-wrap gap-2">
                            {lastAnalysis.detectedItems.map((item, index) => (
                                <span key={index} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border border-gray-200">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="mb-6">
                        <p className="text-sm font-medium text-gray-700 mb-2">AI Recommendations:</p>
                        <div className="space-y-2">
                            {lastAnalysis.recommendations.map((rec, index) => (
                                <div key={index} className="flex items-start bg-white p-3 rounded-lg border border-gray-200">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                                    <span className="text-sm text-gray-700">{rec}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {showSubmitButton && (
                        <button
                            onClick={handleSubmitReport}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3"
                        >
                            <Upload className="w-6 h-6" />
                            <span>Submit Automated Report</span>
                        </button>
                    )}
                </div>
            )}

            {/* Monitoring Status Info */}
            {!lastAnalysis && (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <Monitor className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No automated reports generated yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {userCoordinates
                            ? "Start monitoring to generate automated reports every 10 minutes"
                            : "Enable location services to start monitoring"
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default CCTVMonitoring;