import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Eye, Wifi, Brain, Play, Pause, MapPin, AlertTriangle, CheckCircle, Upload, Navigation, Camera } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const LiveCamera = () => {
    const { submitReport } = useApp();
    const [isStreaming, setIsStreaming] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [devices, setDevices] = useState([]);
    const [userCoordinates, setUserCoordinates] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [showSubmitButton, setShowSubmitButton] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

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

        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                setDevices(videoDevices);
                if (videoDevices.length > 0) {
                    setDeviceId(videoDevices[0].deviceId);
                }
            })
            .catch(err => console.log('Error enumerating devices:', err));
    }, [getCurrentLocation]);

    const startCamera = async () => {
        try {
            setCameraError(null);
            await getCurrentLocation();

            const constraints = {
                video: {
                    deviceId: deviceId ? { exact: deviceId } : undefined,
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: deviceId ? undefined : { ideal: "environment" }
                },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsStreaming(true);
        } catch (error) {
            console.error("Camera access error:", error);
            setCameraError("Cannot access camera. Please check permissions.");
            setIsStreaming(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsStreaming(false);
        setAnalysis(null);
        setCameraError(null);
        setShowSubmitButton(false);
    };

    const captureFrame = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            const ctx = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);

            return canvas.toDataURL('image/jpeg', 0.8);
        }
        return null;
    };

    const analyzeCurrentFrame = async () => {
        if (!isStreaming) return;

        setIsAnalyzing(true);

        let currentCoords = userCoordinates;
        if (!currentCoords) {
            try {
                currentCoords = await getCurrentLocation();
            } catch (error) {
                setCameraError("Cannot analyze without location access");
                setIsAnalyzing(false);
                return;
            }
        }

        const frameImage = captureFrame();

        // Simulate AI processing
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const wasteTypes = ["Mixed Waste", "Organic", "Plastic", "Paper", "Glass", "Electronic"];
        const urgencyLevels = ["Low", "Medium", "High", "Critical"];

        const mockAnalysis = {
            wasteType: wasteTypes[Math.floor(Math.random() * wasteTypes.length)],
            urgency: urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)],
            fillLevel: Math.floor(Math.random() * 100) + 1,
            confidence: Math.floor(Math.random() * 20) + 80,
            detectedItems: ["Plastic bottles", "Food containers", "Paper waste", "Metal cans"],
            environmentalImpact: Math.floor(Math.random() * 10) + 1,
            recommendations: [
                "Immediate collection needed",
                "Sort recyclables",
                "Monitor overflow risk",
                "Contact local waste management"
            ],
            coordinates: currentCoords,
            capturedImage: frameImage,
            bingMapsUrl: `https://www.bing.com/maps/embed?h=300&w=400&cp=${currentCoords.lat}~${currentCoords.lng}&lvl=15&typ=d&sty=r&src=SHELL&FORM=MBEDV8`
        };

        setAnalysis(mockAnalysis);
        setIsAnalyzing(false);
        setShowSubmitButton(true);
    };

    const handleSubmitReport = () => {
        if (analysis && userCoordinates) {
            const report = {
                image: analysis.capturedImage,
                location: userCoordinates,
                analysis: analysis,
                type: "live-camera",
                bingMapsUrl: analysis.bingMapsUrl
            };
            submitReport(report);
            setShowSubmitButton(false);
            setAnalysis(null);
        }
    };

    const switchCamera = (newDeviceId) => {
        if (isStreaming) {
            stopCamera();
            setDeviceId(newDeviceId);
            setTimeout(() => {
                startCamera();
            }, 100);
        } else {
            setDeviceId(newDeviceId);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Eye className="w-6 h-6 text-white" />
                        </div>
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isStreaming ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                            }`}></div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Live Camera</h2>
                        <p className="text-sm text-gray-500">Real-time Analysis</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-full">
                    <Wifi className={`w-4 h-4 ${isStreaming ? "text-green-500" : "text-gray-400"}`} />
                    <span className="text-sm font-medium">{isStreaming ? "Live" : "Offline"}</span>
                </div>
            </div>

            {devices.length > 1 && (
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Camera Device</label>
                    <select
                        value={deviceId || ""}
                        onChange={(e) => switchCamera(e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300"
                    >
                        {devices.map((device, index) => (
                            <option key={device.deviceId} value={device.deviceId}>
                                {device.label || `Camera ${index + 1}`}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="mb-6">
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden shadow-inner">
                    {cameraError ? (
                        <div className="text-center text-white">
                            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                            <p className="text-red-400 font-semibold">Camera Error</p>
                            <p className="text-gray-400 text-sm mt-2">{cameraError}</p>
                            <p className="text-gray-500 text-xs mt-1">Please allow camera access and refresh</p>
                        </div>
                    ) : isStreaming ? (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover rounded-2xl"
                            />
                            <canvas ref={canvasRef} className="hidden" />
                            <div className="absolute top-6 left-6 flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                <span>LIVE</span>
                            </div>
                            <div className="absolute bottom-6 left-6 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                                <MapPin className="w-3 h-3 inline mr-1" />
                                {userCoordinates
                                    ? `Current Location - ${userCoordinates.lat.toFixed(4)}, ${userCoordinates.lng.toFixed(4)}`
                                    : `Waiting for location...`
                                }
                            </div>
                        </>
                    ) : (
                        <div className="text-center">
                            <Camera className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-300 font-semibold text-lg">Camera Ready</p>
                            <p className="text-gray-400 text-sm">Click start to begin live analysis</p>
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

            <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                    onClick={isStreaming ? stopCamera : startCamera}
                    className={`flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${isStreaming
                            ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg"
                            : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                        }`}
                >
                    {isStreaming ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <span>{isStreaming ? "Stop Camera" : "Start Camera"}</span>
                </button>

                <button
                    onClick={analyzeCurrentFrame}
                    disabled={!isStreaming || isAnalyzing}
                    className="flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
                >
                    <Brain className="w-5 h-5" />
                    <span>{isAnalyzing ? "Analyzing..." : "Analyze Frame"}</span>
                </button>
            </div>

            {isAnalyzing && (
                <div className="text-center py-8 mb-6">
                    <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                    <p className="text-blue-600 font-semibold">Analyzing live frame...</p>
                    <p className="text-gray-500 text-sm mt-1">Processing with AI vision models</p>
                </div>
            )}

            {analysis && !isAnalyzing && (
                <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-8 border border-green-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-xl flex items-center">
                            <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
                            Live Analysis Results
                        </h3>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                                {analysis.confidence}% confident
                            </span>
                        </div>
                    </div>

                    {/* Location Map */}
                    <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
                        <iframe
                            src={analysis.bingMapsUrl}
                            className="w-full h-48"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Live Analysis Location"
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                            <p className="text-sm text-gray-600 font-medium">Waste Type</p>
                            <p className="font-bold text-lg text-gray-900">{analysis.wasteType}</p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                            <p className="text-sm text-gray-600 font-medium">Urgency</p>
                            <p className={`font-bold text-lg ${analysis.urgency === "Critical" ? "text-red-600" :
                                    analysis.urgency === "High" ? "text-orange-600" :
                                        analysis.urgency === "Medium" ? "text-yellow-600" : "text-green-600"
                                }`}>
                                {analysis.urgency}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                            <p className="text-sm text-gray-600 font-medium">Fill Level</p>
                            <p className="font-bold text-lg text-gray-900">{analysis.fillLevel}%</p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                            <p className="text-sm text-gray-600 font-medium">Environmental Impact</p>
                            <p className="font-bold text-lg text-gray-900">{analysis.environmentalImpact}/10</p>
                        </div>
                    </div>

                    {analysis.capturedImage && (
                        <div className="mb-6">
                            <p className="text-sm font-medium text-gray-700 mb-2">Captured Frame</p>
                            <img
                                src={analysis.capturedImage}
                                alt="Analyzed frame"
                                className="w-full h-32 object-cover rounded-lg shadow-md"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-3">Detected Items:</p>
                            <div className="space-y-2">
                                {analysis.detectedItems.map((item, index) => (
                                    <div key={index} className="flex items-center bg-white p-2 rounded">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                        <span className="text-sm">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-3">AI Recommendations:</p>
                            <div className="space-y-2">
                                {analysis.recommendations.map((rec, index) => (
                                    <div key={index} className="flex items-start bg-white p-2 rounded">
                                        <AlertTriangle className="w-4 h-4 text-orange-500 mr-2 mt-0.5" />
                                        <span className="text-sm">{rec}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center space-x-2 p-4 bg-white rounded-lg">
                        <Navigation className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="font-medium text-green-800">Analysis Location</p>
                            <p className="text-sm text-green-600">
                                Current Position - {analysis.coordinates.lat.toFixed(6)}, {analysis.coordinates.lng.toFixed(6)}
                            </p>
                        </div>
                    </div>

                    {showSubmitButton && (
                        <button
                            onClick={handleSubmitReport}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg mt-6 flex items-center justify-center space-x-3"
                        >
                            <Upload className="w-6 h-6" />
                            <span>Submit Live Camera Report</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default LiveCamera;