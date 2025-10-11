import React, { useState, useCallback, useEffect } from 'react';
import { Monitor, MapPin, Brain, Play, Pause, Clock, AlertTriangle, Upload } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const CCTVMonitoring = () => {
    const { submitReport } = useApp();
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [selectedCamera, setSelectedCamera] = useState("Camera 1");
    const [countdown, setCountdown] = useState(600);
    const [lastAnalysis, setLastAnalysis] = useState(null);
    const [userCoordinates, setUserCoordinates] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [showSubmitButton, setShowSubmitButton] = useState(false);

    const cameras = [
        "Camera 1 - CBD Area",
        "Camera 2 - Market Zone",
        "Camera 3 - Residential Sector",
        "Camera 4 - Industrial District"
    ];

    const getCurrentLocation = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported"));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    setUserCoordinates(coords);
                    setLocationError(null);
                    resolve(coords);
                },
                (error) => {
                    const errorMsg = `Location access denied. Please enable location services.`;
                    setLocationError(errorMsg);
                    reject(new Error(errorMsg));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    }, []);

    useEffect(() => {
        getCurrentLocation().catch(() => {
            // Silently handle initial failure
        });

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
    }, [isMonitoring, countdown, getCurrentLocation]);

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
                camera: selectedCamera,
                analysis: lastAnalysis,
                type: "cctv",
                location: userCoordinates,
                bingMapsUrl: `https://www.bing.com/maps/embed?h=300&w=400&cp=${userCoordinates.lat}~${userCoordinates.lng}&lvl=15&typ=d&sty=r&src=SHELL&FORM=MBEDV8`
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
                        <p className="text-sm text-gray-500">Real-time Location Tracking</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-full">
                    <div className={`w-3 h-3 rounded-full ${isMonitoring ? "bg-green-500 animate-pulse" : "bg-gray-400"
                        }`}></div>
                    <span className="text-sm font-medium">{isMonitoring ? "Active" : "Inactive"}</span>
                </div>
            </div>

            {/* Map Section */}
            <div className="mb-6">
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden shadow-inner">
                    {userCoordinates ? (
                        <iframe
                            src={`https://www.bing.com/maps/embed?h=300&w=400&cp=${userCoordinates.lat}~${userCoordinates.lng}&lvl=15&typ=d&sty=r&src=SHELL&FORM=MBEDV8`}
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
                            <button
                                onClick={getCurrentLocation}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                            >
                                Enable Location
                            </button>
                        </div>
                    )}
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
                        📍 Current Location
                    </div>
                    {userCoordinates && (
                        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-xs">
                            📍 {userCoordinates.lat.toFixed(4)}, {userCoordinates.lng.toFixed(4)}
                        </div>
                    )}
                </div>
            </div>

            {locationError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                        <p className="text-red-700 text-sm">{locationError}</p>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Camera</label>
                <select
                    value={selectedCamera}
                    onChange={(e) => setSelectedCamera(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                >
                    {cameras.map((camera) => (
                        <option key={camera} value={camera}>
                            {camera}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                    onClick={() => setIsMonitoring(!isMonitoring)}
                    className={`flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${isMonitoring
                            ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg"
                            : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                        }`}
                >
                    {isMonitoring ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <span>{isMonitoring ? "Stop Monitoring" : "Start Monitoring"}</span>
                </button>

                <div className="flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <Clock className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="font-mono text-2xl font-bold text-blue-700">{formatTime(countdown)}</span>
                </div>
            </div>

            {/* AI Analysis Results */}
            {lastAnalysis && (
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 mb-6 border border-blue-100">
                    <h3 className="font-bold text-xl mb-6 flex items-center">
                        <Brain className="w-6 h-6 mr-3 text-blue-600" />
                        Latest AI Analysis
                        <span className="ml-auto text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                            {lastAnalysis.confidence}% confident
                        </span>
                    </h3>
                    <div className="grid grid-cols-4 gap-4 mb-6">
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
                            <p className="font-bold text-lg text-gray-900">Current Position</p>
                        </div>
                    </div>

                    {showSubmitButton && (
                        <button
                            onClick={handleSubmitReport}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg mt-6 flex items-center justify-center space-x-3"
                        >
                            <Upload className="w-6 h-6" />
                            <span>Submit CCTV Report</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default CCTVMonitoring;