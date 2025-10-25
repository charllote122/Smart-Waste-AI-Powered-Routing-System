import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Camera, Brain, AlertTriangle, CheckCircle, Navigation, Trash2, Shield, Award, Zap, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import apiService from '../../services/api';
import { generateBingMapsUrl, validateMapsConfig } from '../../config/maps';

const EnhancedImageUpload = () => {
    const { submitReport,serverStatus} = useApp(); // Ensure serverStatus is provided by your context
    const [image, setImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [annotatedImage, setAnnotatedImage] = useState(null);
    const [location, setLocation] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [uploadError, setUploadError] = useState(null);
    const [showSubmitButton, setShowSubmitButton] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [mapsAvailable, setMapsAvailable] = useState(true);
    const [toastMessage, setToastMessage] = useState(null);
    const fileInputRef = useRef(null);

    // Check maps availability on component mount
    useEffect(() => {
        setMapsAvailable(validateMapsConfig());
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
                    setLocation(coords);
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
    
    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

       

        // Reset states
        setUploadError(null);
        setLocationError(null);
        setAnalysis(null);
        setAnnotatedImage(null);
        setShowSubmitButton(false);

        try {
            // Validate image file using API service
            await apiService.validateImageFile(file, 10);

            const reader = new FileReader();

            reader.onload = (e) => {
                setImage(e.target.result);
                setImageFile(file);
                setUploadError(null);

                // Get location when image is uploaded
                getCurrentLocation()
                    .then((locationCoords) => {
                        performBackendAnalysis(file, locationCoords);
                    })
                    .catch((error) => {
                        console.error('Location error:', error);
                        setLocationError(error.message);
                    });
            };

            reader.onerror = () => {
                setUploadError('Failed to read image file');
                resetFileInput();
            };

            reader.readAsDataURL(file);

        } catch (error) {
            setUploadError(error.message);
            resetFileInput();
        }
    };

    const performBackendAnalysis = async (file, locationCoords) => {
        if (!locationCoords) {
            setLocationError("Location required for analysis");
            return;
        }

        setIsAnalyzing(true);
        setAnalysis(null);
        setAnnotatedImage(null);
        setShowSubmitButton(false);

        try {
            console.log('Using apiService.analyzeImage...', {
                fileName: file.name,
                fileSize: file.size,
                location: locationCoords
            });

            // Call the actual API service to analyze the image
            const analysisResult = await apiService.analyzeImage(file, locationCoords);

            console.log('apiService.analyzeImage result:', analysisResult);

            if (!analysisResult) {
                throw new Error('No analysis result received from API service');
            }

            // Process the backend response
            processBackendResponse(analysisResult, locationCoords);

        } catch (error) {
            console.error('apiService.analyzeImage failed:', error);
            setUploadError(`Analysis failed: ${error.message}. Please try again.`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const processBackendResponse = (backendResult, locationCoords) => {
        // Extract annotated image from backend response
        let annotatedImageUrl = backendResult.annotatedImage || backendResult.imageUrl || backendResult.processedImage;

        // Set the annotated image
        if (annotatedImageUrl) {
            setAnnotatedImage(annotatedImageUrl);
            console.log('Annotated image set from backend');
        } else {
            console.log('No annotated image in backend response');
            setAnnotatedImage(image); // Keep the original image if no annotated image
        }

        // Create analysis object from backend data
        const analysisWithLocation = {
            ...backendResult,
            wasteType: backendResult.wasteType || 'Unknown',
            urgency: backendResult.urgency || 'Medium',
            confidence: backendResult.confidence || 0,
            detectedItems: backendResult.detectedItems || [],
            recommendations: backendResult.recommendations || [],
            healthRisk: backendResult.healthRisk || 1,
            estimatedWeight: backendResult.estimatedWeight || 0,
            environmentalImpact: backendResult.environmentalImpact || 1,
            fillLevel: backendResult.fillLevel || 0,
            coordinates: locationCoords,
            bingMapsUrl: locationCoords.bingMapsUrl,
            locationDetails: getLocationDetails(locationCoords.lat, locationCoords.lng),
            annotatedImage: annotatedImageUrl,
            isMockData: false,
            source: 'api-service'
        };

        console.log('Final analysis object:', analysisWithLocation);

        setAnalysis(analysisWithLocation);
        setShowSubmitButton(true);
    };

    const getLocationDetails = (lat, lng) => {
        return {
            address: `Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            city: "Current Location",
            country: "Your Area",
            locality: "Waste Spot Location"
        };
    };

    const handleSubmitReport = () => {
        if (image && location && analysis) {
            const report = {
                image: annotatedImage || image,
                originalImage: image,
                imageFile,
                location: location,
                analysis,
                type: "manual",
                bingMapsUrl: analysis.bingMapsUrl,
                locationDetails: analysis.locationDetails,
                coordinates: analysis.coordinates,
                isMockData: analysis.isMockData || false,
                hasAnnotations: !!annotatedImage,
                source: analysis.source || 'api-service'
            };

            console.log('Submitting report with backend data:', report);

            // Check server status before submitting
            if (serverStatus === 'offline') {
                setToastMessage("The server is unreachable right now.");
            } else {
                submitReport(report);
                resetForm();
            }
        }
    };

    const resetForm = () => {
        setShowSubmitButton(false);
        setImage(null);
        setAnnotatedImage(null);
        setImageFile(null);
        setLocation(null);
        setAnalysis(null);
        setLocationError(null);
        setUploadError(null);
        resetFileInput();
    };

    const resetFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeImage = () => {
        resetForm();
    };

    const retryLocation = () => {
        setLocationError(null);
        if (imageFile) {
            getCurrentLocation()
                .then((locationCoords) => {
                    performBackendAnalysis(imageFile, locationCoords);
                })
                .catch((error) => {
                    setLocationError(error.message);
                });
        }
    };

    const displayCoordinates = (coords) => {
        if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
            return 'Location not available';
        }
        return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
    };

    const displayAccuracy = (coords) => {
        if (!coords || !coords.accuracy) return null;
        return `Accuracy: ±${Math.round(coords.accuracy)}m`;
    };

    const getDisplayImage = () => {
        return annotatedImage || image;
    };

    return (
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Upload className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Image Upload & Analysis</h2>
                        <p className="text-sm text-gray-500">AI-Powered Waste Detection</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-medium ${mapsAvailable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${mapsAvailable ? 'bg-green-500' : 'bg-yellow-500'
                            }`}></div>
                        <span>{mapsAvailable ? 'Maps Ready' : 'Maps Check'}</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-full">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">AI Ready</span>
                    </div>
                </div>
            </div>

            {/* Location Status */}
            <div className="mb-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-3">
                        <MapPin className={`w-5 h-5 ${location ? 'text-green-600' : 'text-blue-600'}`} />
                        <div>
                            <p className="font-medium text-gray-900">
                                {location ? 'Location Captured' : 'Waiting for Location'}
                            </p>
                            <p className="text-sm text-gray-600">
                                {location ? displayCoordinates(location) : 'We need your location for accurate waste reporting'}
                            </p>
                        </div>
                    </div>
                    {!location && !isGettingLocation && (
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

            <div className="mb-8">
                {!image ? (
                    <div className="border-2 border-dashed border-purple-300 rounded-2xl p-16 text-center hover:border-purple-400 hover:bg-purple-50/30 transition-all duration-300">
                        <Camera className="w-20 h-20 text-purple-400 mx-auto mb-6" />
                        <p className="text-gray-700 font-semibold text-lg mb-2">Upload Waste Image for AI Analysis</p>
                        <p className="text-gray-500 mb-6">AI-powered waste detection with location tracking</p>

                        {uploadError && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                                <div className="flex items-center">
                                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                                    <div>
                                        <p className="text-red-700 text-sm font-medium">Analysis Error</p>
                                        <p className="text-red-600 text-sm">{uploadError}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            capture="environment"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 mx-auto transform hover:scale-105 shadow-lg"
                        >
                            <Upload className="w-5 h-5" />
                            <span>Choose Image</span>
                        </button>
                        <p className="text-xs text-gray-400 mt-4">Supports JPG, PNG, WebP formats (Max 10MB)</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative">
                            <img
                                src={getDisplayImage()}
                                alt={annotatedImage ? "AI Analyzed Waste Image" : "Uploaded waste"}
                                className="w-full h-80 object-cover rounded-2xl shadow-lg"
                            />
                            {annotatedImage && annotatedImage !== image && (
                                <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
                                    <Brain className="w-4 h-4" />
                                    <span>AI Analyzed</span>
                                </div>
                            )}
                            {location && (
                                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg backdrop-blur-sm">
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="w-4 h-4" />
                                        <div>
                                            <p className="text-sm font-medium">📍 Current Location</p>
                                            <p className="text-xs opacity-90">
                                                {displayCoordinates(location)}
                                            </p>
                                            {location.accuracy && (
                                                <p className="text-xs opacity-75">{displayAccuracy(location)}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={removeImage}
                                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors shadow-lg"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {annotatedImage && annotatedImage !== image && (
                            <div className="flex items-center justify-center space-x-4 bg-gray-50 p-3 rounded-xl">
                                <span className="text-sm text-gray-600">View:</span>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setAnnotatedImage(annotatedImage)}
                                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm"
                                    >
                                        AI Analysis
                                    </button>
                                    <button
                                        onClick={() => setAnnotatedImage(null)}
                                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm"
                                    >
                                        Original
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl transition-colors font-medium"
                        >
                            Change Image
                        </button>
                    </div>
                )}
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

            {isAnalyzing && (
                <div className="text-center py-16 mb-8">
                    <div className="relative inline-block">
                        <div className="animate-spin w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mb-6"></div>
                        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-pink-600 rounded-full animate-spin" style={{ animationDelay: '0.5s', animationDuration: '1.5s' }}></div>
                    </div>
                    <p className="text-purple-700 font-bold text-lg">Analyzing Image with AI...</p>
                    <p className="text-gray-600 text-sm mt-2">
                        Processing image • Waste detection • Location-based assessment
                    </p>
                    {location && (
                        <div className="mt-4 inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            <MapPin className="w-3 h-3 mr-1" />
                            Analyzing waste at {displayCoordinates(location)}
                        </div>
                    )}
                </div>
            )}

            {analysis && !isAnalyzing && (
                <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 rounded-2xl p-8 mb-8 border border-purple-100">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3">
                            <h3 className="font-bold text-2xl flex items-center">
                                <Brain className="w-7 h-7 mr-3 text-purple-600" />
                                AI Analysis Results
                                {!analysis.isMockData && (
                                    <span className="ml-3 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                        Real AI Data
                                    </span>
                                )}
                            </h3>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="text-sm bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-semibold">
                                {analysis.confidence}% Confident
                            </span>
                        </div>
                    </div>

                    {/* Enhanced Location Map with Details */}
                    {mapsAvailable && (
                        <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
                            <iframe
                                src={analysis.bingMapsUrl}
                                className="w-full h-48"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Analysis Location"
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

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="text-center p-5 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Trash2 className="w-6 h-6 text-blue-600" />
                            </div>
                            <p className="text-sm text-gray-600 font-medium mb-1">Waste Type</p>
                            <p className="font-bold text-lg text-gray-900">{analysis.wasteType}</p>
                        </div>
                        <div className="text-center p-5 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${analysis.urgency === "Critical" ? "bg-gradient-to-br from-red-100 to-red-200" :
                                analysis.urgency === "High" ? "bg-gradient-to-br from-orange-100 to-orange-200" :
                                    analysis.urgency === "Medium" ? "bg-gradient-to-br from-yellow-100 to-yellow-200" :
                                        "bg-gradient-to-br from-green-100 to-green-200"
                                }`}>
                                <AlertTriangle className={`w-6 h-6 ${analysis.urgency === "Critical" ? "text-red-600" :
                                    analysis.urgency === "High" ? "text-orange-600" :
                                        analysis.urgency === "Medium" ? "text-yellow-600" : "text-green-600"
                                    }`} />
                            </div>
                            <p className="text-sm text-gray-600 font-medium mb-1">Urgency</p>
                            <p className={`font-bold text-lg ${analysis.urgency === "Critical" ? "text-red-600" :
                                analysis.urgency === "High" ? "text-orange-600" :
                                    analysis.urgency === "Medium" ? "text-yellow-600" : "text-green-600"
                                }`}>
                                {analysis.urgency}
                            </p>
                        </div>
                        <div className="text-center p-5 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Shield className="w-6 h-6 text-red-600" />
                            </div>
                            <p className="text-sm text-gray-600 font-medium mb-1">Health Risk</p>
                            <p className="font-bold text-lg text-gray-900">{analysis.healthRisk}/5</p>
                        </div>
                        <div className="text-center p-5 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Award className="w-6 h-6 text-indigo-600" />
                            </div>
                            <p className="text-sm text-gray-600 font-medium mb-1">Est. Weight</p>
                            <p className="font-bold text-lg text-gray-900">{analysis.estimatedWeight}kg</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-sm font-bold text-gray-800 mb-4 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                Detected Items ({(analysis.detectedItems || []).length})
                            </p>
                            <div className="space-y-3">
                                {(analysis.detectedItems || []).map((item, index) => (
                                    <div key={index} className="flex items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                        <span className="text-sm font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800 mb-4 flex items-center">
                                <Zap className="w-4 h-4 mr-2 text-orange-600" />
                                AI Recommendations ({(analysis.recommendations || []).length})
                            </p>
                            <div className="space-y-3">
                                {(analysis.recommendations || []).map((rec, index) => (
                                    <div key={index} className="flex items-start bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2"></div>
                                        <span className="text-sm font-medium">{rec}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl flex items-center justify-center">
                                    <Navigation className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-green-800 text-lg">Analysis Complete</p>
                                    <p className="text-sm text-green-600">
                                        Current Position - {analysis.coordinates.lat.toFixed(6)}, {analysis.coordinates.lng.toFixed(6)}
                                    </p>
                                    {analysis.coordinates.accuracy && (
                                        <p className="text-xs text-gray-500 mt-1">Accuracy: ±{Math.round(analysis.coordinates.accuracy)}m</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {showSubmitButton && (
                        <button
                            onClick={handleSubmitReport}
                            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white py-5 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3"
                        >
                            <Upload className="w-6 h-6" />
                            <span>Submit Analysis Report</span>
                        </button>
                    )}
                </div>
            )}

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300">
                    {toastMessage}
                </div>
            )}
        </div>
    );
};

export default EnhancedImageUpload;
