import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Eye, Wifi, Brain, Play, Pause, MapPin, AlertTriangle, CheckCircle, Upload, Navigation, Camera } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import apiService from '../../services/api';
import { generateBingMapsUrl, validateMapsConfig } from '../../config/maps';

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
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [mapsAvailable, setMapsAvailable] = useState(true);
    const [locationDetails, setLocationDetails] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Check maps availability and enumerate camera devices on component mount
    useEffect(() => {
        setMapsAvailable(validateMapsConfig());
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

                    // Get location details
                    getLocationDetails(coords.lat, coords.lng).then(details => {
                        setLocationDetails(details);
                    });

                    resolve(coords);
                },
                (error) => {
                    setIsGettingLocation(false);
                    let errorMsg;
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMsg = "Location access denied. Please enable location permissions.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMsg = "Location information is unavailable.";
                            break;
                        case error.TIMEOUT:
                            errorMsg = "Location request timed out.";
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

    // Get location details
    const getLocationDetails = async (lat, lng) => {
        try {
            return {
                address: `Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                city: "Current Area",
                country: "Your Location",
                locality: "Live Camera Location"
            };
        } catch (error) {
            return {
                address: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                city: "Unknown",
                country: "Location recorded",
                locality: "Camera analysis area"
            };
        }
    };

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
                videoRef.current.play(); // Ensure the video plays
            }
            setIsStreaming(true);
        } catch (error) {
            console.error("Camera access error:", error);
            setCameraError("Cannot access camera. Please check camera permissions and try again.");
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

    const analyzeWithApiService = async (blob, currentCoords) => {
        try {
            console.log('Using apiService.analyzeImage...', {
                blobSize: blob.size,
                blobType: blob.type,
                coordinates: currentCoords
            });

            // Validate the image file first
            await apiService.validateImageFile(blob, 10);

            // Use your actual apiService.analyzeImage method
            const analysisResult = await apiService.analyzeImage(blob);

            console.log('apiService.analyzeImage result:', analysisResult);

            if (!analysisResult) {
                throw new Error('No analysis result received from API service');
            }

            return analysisResult;

        } catch (error) {
            console.error('apiService.analyzeImage failed:', error);
            throw error;
        }
    };

    const analyzeCurrentFrame = async () => {
        if (!isStreaming) return;

        setIsAnalyzing(true);
        setCameraError(null); // Clear previous errors

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

        if (!frameImage) {
            setCameraError("Failed to capture frame from video.");
            setIsAnalyzing(false);
            return;
        }

        try {
            // Convert canvas to blob for API upload
            const blob = await new Promise(resolve => {
                canvasRef.current.toBlob(resolve, 'image/jpeg', 0.8);
            });

            console.log('Frame captured:', {
                width: canvasRef.current.width,
                height: canvasRef.current.height,
                blobSize: blob.size
            });

            const analysisResult = await analyzeWithApiService(blob, currentCoords);

            console.log('Raw analysis result from API:', analysisResult);

            // Process the API response - use the actual data from your backend
            const analysisWithLocation = {
                ...analysisResult,
                wasteType: analysisResult.wasteType || 'Unknown',
                urgency: analysisResult.urgency || 'Medium',
                confidence: analysisResult.confidence || 0,
                detectedItems: analysisResult.detectedItems || [],
                recommendations: analysisResult.recommendations || [],
                environmentalImpact: analysisResult.environmentalImpact || 1,
                fillLevel: analysisResult.fillLevel || 0,
                healthRisk: analysisResult.healthRisk || 1,
                estimatedWeight: analysisResult.estimatedWeight || 0,
                annotatedImage: analysisResult.annotatedImage || analysisResult.processedImage || analysisResult.imageUrl,
                coordinates: currentCoords,
                capturedImage: frameImage,
                bingMapsUrl: generateBingMapsUrl(currentCoords.lat, currentCoords.lng),
                locationDetails: locationDetails,
                isMockData: false,
                source: 'api-service'
            };

            console.log('Final analysis data:', analysisWithLocation);

            setAnalysis(analysisWithLocation);
            setShowSubmitButton(true);

        } catch (error) {
            console.error('API analysis failed:', error);
            setCameraError(`Analysis failed: ${error.message}. Please try again.`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmitReport = () => {
        if (analysis && userCoordinates) {
            const report = {
                image: analysis.annotatedImage || analysis.capturedImage,
                originalImage: analysis.capturedImage,
                location: userCoordinates,
                analysis: analysis,
                type: "live-camera",
                bingMapsUrl: analysis.bingMapsUrl,
                locationDetails: analysis.locationDetails,
                isMockData: analysis.isMockData || false,
                source: analysis.source || 'api-service'
            };

            console.log('Submitting report from API:', report);
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

    const retryLocation = () => {
        setLocationError(null);
        getCurrentLocation().catch((error) => {
            setLocationError(error.message);
        });
    };

    const getDisplayImage = () => {
        return analysis?.annotatedImage || analysis?.capturedImage;
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
                        <p className="text-sm text-gray-500">Real-time AI Analysis</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-medium ${mapsAvailable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${mapsAvailable ? 'bg-green-500' : 'bg-yellow-500'
                            }`}></div>
                        <span>{mapsAvailable ? 'Maps Ready' : 'Maps Check'}</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full">
                        <Wifi className={`w-4 h-4 ${isStreaming ? "text-green-500" : "text-gray-400"}`} />
                        <span className="text-sm font-medium text-green-700">Live Feed</span>
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
                                {userCoordinates ? 'Location Ready' : 'Camera Location'}
                            </p>
                            <p className="text-sm text-gray-600">
                                {userCoordinates
                                    ? `${userCoordinates.lat.toFixed(6)}, ${userCoordinates.lng.toFixed(6)}`
                                    : 'Location required for analysis'
                                }
                            </p>
                        </div>
                    </div>
                    {!userCoordinates && !isGettingLocation && (
                        <button
                            onClick={getCurrentLocation}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Get Location
                        </button>
                    )}
                    {isGettingLocation && (
                        <div className="flex items-center space-x-2 text-blue-600">
                            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                            <span className="text-sm">Getting location...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Camera Device Selection */}
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

            {/* Camera Display */}
            <div className="mb-6">
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden shadow-inner">
                    {cameraError ? (
                        <div className="text-center text-white p-8">
                            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                            <p className="text-red-400 font-semibold text-lg mb-2">Camera Error</p>
                            <p className="text-gray-400 text-sm mb-4">{cameraError}</p>
                            <button
                                onClick={startCamera}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Retry Camera
                            </button>
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
                                <span>LIVE STREAMING</span>
                            </div>
                            <div className="absolute bottom-6 left-6 bg-black/70 text-white px-3 py-2 rounded-lg backdrop-blur-sm">
                                <div className="flex items-center space-x-2">
                                    <MapPin className="w-4 h-4" />
                                    <div>
                                        <p className="text-sm font-medium">📍 Camera Location</p>
                                        <p className="text-xs opacity-90">
                                            {userCoordinates
                                                ? `${userCoordinates.lat.toFixed(4)}, ${userCoordinates.lng.toFixed(4)}`
                                                : `Getting location...`
                                            }
                                        </p>
                                        {userCoordinates?.accuracy && (
                                            <p className="text-xs opacity-75">Accuracy: ±{Math.round(userCoordinates.accuracy)}m</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-8">
                            <Camera className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-300 font-semibold text-lg mb-2">Camera Ready</p>
                            <p className="text-gray-400 text-sm mb-6">Start camera for live waste analysis</p>
                            <button
                                onClick={startCamera}
                                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                            >
                                <Play className="w-5 h-5" />
                                <span>Start Camera</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Location Error Display */}
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

            {/* Control Buttons */}
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

            {/* Analysis Loading State */}
            {isAnalyzing && (
                <div className="text-center py-12 mb-6 bg-blue-50 rounded-2xl border border-blue-200">
                    <div className="inline-block animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                    <p className="text-blue-700 font-bold text-lg mb-2">Analyzing Live Feed...</p>
                    <p className="text-gray-600 text-sm">Processing frame with AI vision models</p>
                    {userCoordinates && (
                        <div className="mt-4 inline-flex items-center px-3 py-1 bg-white text-blue-700 rounded-full text-sm border border-blue-200">
                            <MapPin className="w-3 h-3 mr-1" />
                            Location: {userCoordinates.lat.toFixed(4)}, {userCoordinates.lng.toFixed(4)}
                        </div>
                    )}
                </div>
            )}

            {/* Analysis Results */}
            {analysis && !isAnalyzing && (
                <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-8 border border-green-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-xl flex items-center">
                            <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
                            Live Analysis Results
                            {!analysis.isMockData && (
                                <span className="ml-3 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                    AI Processed
                                </span>
                            )}
                        </h3>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                                {analysis.confidence}% confident
                            </span>
                        </div>
                    </div>

                    {/* Location Map */}
                    {mapsAvailable && (
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
                            <div className="bg-white p-4 border-t">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900">📍 Analysis Location</p>
                                        <p className="text-sm text-gray-600">
                                            {analysis.locationDetails?.address || `${analysis.coordinates.lat.toFixed(6)}, ${analysis.coordinates.lng.toFixed(6)}`}
                                        </p>
                                    </div>
                                    {analysis.coordinates.accuracy && (
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">Accuracy</p>
                                            <p className="text-sm font-medium text-gray-700">±{Math.round(analysis.coordinates.accuracy)}m</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Show annotated image if available from backend */}
                    {analysis.annotatedImage && (
                        <div className="mb-6">
                            <p className="text-sm font-medium text-gray-700 mb-2">AI Annotated Image</p>
                            <img
                                src={analysis.annotatedImage}
                                alt="AI analyzed frame"
                                className="w-full h-48 object-cover rounded-lg shadow-md border border-gray-200"
                            />
                        </div>
                    )}

                    {/* Analysis Metrics */}
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

                    {/* Detected Items and Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-3">Detected Items:</p>
                            <div className="space-y-2">
                                {analysis.detectedItems.map((item, index) => (
                                    <div key={index} className="flex items-center bg-white p-3 rounded-lg border border-gray-200">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                        <span className="text-sm font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-3">AI Recommendations:</p>
                            <div className="space-y-2">
                                {analysis.recommendations.map((rec, index) => (
                                    <div key={index} className="flex items-start bg-white p-3 rounded-lg border border-gray-200">
                                        <AlertTriangle className="w-4 h-4 text-orange-500 mr-2 mt-0.5" />
                                        <span className="text-sm font-medium">{rec}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Location Confirmation */}
                    <div className="flex items-center space-x-2 p-4 bg-white rounded-lg border border-gray-200 mb-6">
                        <Navigation className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="font-medium text-green-800">Live Analysis Location</p>
                            <p className="text-sm text-green-600">
                                Current Position - {analysis.coordinates.lat.toFixed(6)}, {analysis.coordinates.lng.toFixed(6)}
                            </p>
                            {analysis.coordinates.accuracy && (
                                <p className="text-xs text-gray-500 mt-1">Location accuracy: ±{Math.round(analysis.coordinates.accuracy)}m</p>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    {showSubmitButton && (
                        <button
                            onClick={handleSubmitReport}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3"
                        >
                            <Upload className="w-6 h-6" />
                            <span>Submit Live Camera Report</span>
                        </button>
                    )}
                </div>
            )}

            {/* Help Text when no analysis */}
            {!analysis && !isAnalyzing && (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No analysis performed yet</p>
                    <p className="text-sm text-gray-400 mt-1">Start camera and analyze frames for AI waste detection</p>
                </div>
            )}
        </div>
    );
};

export default LiveCamera;
