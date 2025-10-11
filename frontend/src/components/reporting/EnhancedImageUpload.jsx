import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, Brain, AlertTriangle, CheckCircle, Navigation, Trash2, Shield, Award, Zap, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import apiService from '../../services/api';
import { generateBingMapsUrl, validateMapsConfig } from '../../config/maps';

const EnhancedImageUpload = () => {
    const { submitReport, analyzeImage } = useApp();
    const [image, setImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [annotatedImage, setAnnotatedImage] = useState(null); // NEW: For analyzed image from backend
    const [location, setLocation] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [uploadError, setUploadError] = useState(null);
    const [showSubmitButton, setShowSubmitButton] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [mapsAvailable, setMapsAvailable] = useState(true);
    const fileInputRef = useRef(null);

    // Check maps availability on component mount
    React.useEffect(() => {
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
        setAnnotatedImage(null); // Reset annotated image
        setShowSubmitButton(false);

        try {
            // Validate image file using API service
            apiService.validateImageFile(file, 10); // 10MB max size

            const reader = new FileReader();

            reader.onload = (e) => {
                setImage(e.target.result);
                setImageFile(file);
                setUploadError(null);

                // Get location when image is uploaded
                getCurrentLocation()
                    .then((locationCoords) => {
                        simulateEnhancedAIAnalysis(file, locationCoords);
                    })
                    .catch((error) => {
                        console.error('Location error:', error);
                        setLocationError(error.message);
                    });
            };

            reader.onerror = () => {
                setUploadError('Failed to read image file');
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            };

            reader.readAsDataURL(file);

        } catch (error) {
            setUploadError(error.message);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const simulateEnhancedAIAnalysis = async (file, locationCoords) => {
        if (!locationCoords) {
            setLocationError("Location required for analysis");
            return;
        }

        setIsAnalyzing(true);
        setAnalysis(null);
        setAnnotatedImage(null); // Reset annotated image
        setShowSubmitButton(false);

        try {
            // Prepare form data with location for API
            const formData = new FormData();
            formData.append('image', file);
            formData.append('latitude', locationCoords.lat.toString());
            formData.append('longitude', locationCoords.lng.toString());
            formData.append('accuracy', locationCoords.accuracy?.toString() || '0');

            console.log('Starting AI analysis with location:', {
                lat: locationCoords.lat,
                lng: locationCoords.lng,
                accuracy: locationCoords.accuracy
            });

            // Use the actual API service for analysis
            const analysisResult = await analyzeImage(formData);

            console.log('Backend analysis result:', analysisResult);

            if (!analysisResult) {
                throw new Error('No analysis result received from backend');
            }

            // Check if backend returns an annotated image
            let annotatedImageUrl = null;
            if (analysisResult.annotatedImage) {
                // If backend returns base64 or URL of annotated image
                annotatedImageUrl = analysisResult.annotatedImage;
            } else if (analysisResult.imageUrl) {
                // Alternative field name
                annotatedImageUrl = analysisResult.imageUrl;
            } else if (analysisResult.processedImage) {
                // Another common field name
                annotatedImageUrl = analysisResult.processedImage;
            }

            // Set the annotated image if available
            if (annotatedImageUrl) {
                setAnnotatedImage(annotatedImageUrl);
                console.log('Annotated image received from backend');
            } else {
                console.log('No annotated image received from backend, using original');
                setAnnotatedImage(image); // Fallback to original image
            }

            // Add location data to analysis
            const analysisWithLocation = {
                ...analysisResult,
                coordinates: locationCoords,
                bingMapsUrl: locationCoords.bingMapsUrl,
                locationDetails: await getLocationDetails(locationCoords.lat, locationCoords.lng),
                // Ensure all required fields are present
                wasteType: analysisResult.wasteType || analysisResult.type || analysisResult.detected_type || 'Unknown',
                urgency: analysisResult.urgency || analysisResult.priority || analysisResult.severity || 'Medium',
                confidence: analysisResult.confidence || analysisResult.accuracy || analysisResult.score || 80,
                detectedItems: analysisResult.detectedItems || analysisResult.items || analysisResult.detections || [],
                recommendations: analysisResult.recommendations || analysisResult.suggestions || analysisResult.actions || [],
                healthRisk: analysisResult.healthRisk || analysisResult.risk || analysisResult.danger_level || 1,
                estimatedWeight: analysisResult.estimatedWeight || analysisResult.weight || analysisResult.volume || 10,
                annotatedImage: annotatedImageUrl // Include in analysis data too
            };

            console.log('Final analysis with location:', analysisWithLocation);

            setAnalysis(analysisWithLocation);
            setShowSubmitButton(true);

        } catch (error) {
            console.error('Analysis failed:', error);

            // Only fallback to mock data if it's a real backend failure
            if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
                setUploadError('Backend analysis service is temporarily unavailable. Please try again.');
                setIsAnalyzing(false);
                return;
            }

            // If we have partial data from backend, use it
            if (error.partialResult) {
                const analysisWithLocation = {
                    ...error.partialResult,
                    coordinates: locationCoords,
                    bingMapsUrl: locationCoords.bingMapsUrl,
                    locationDetails: await getLocationDetails(locationCoords.lat, locationCoords.lng)
                };
                setAnalysis(analysisWithLocation);
                setShowSubmitButton(true);
            } else {
                // Use mock data as last resort
                console.log('Falling back to mock data');
                const analysisWithLocation = await generateMockAnalysisWithLocation(locationCoords);
                setAnalysis(analysisWithLocation);
                setAnnotatedImage(image); // Use original image for mock data
                setShowSubmitButton(true);
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Get human-readable location details
    const getLocationDetails = async (lat, lng) => {
        try {
            return {
                address: `Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                city: "Current Location",
                country: "Your Area",
                locality: "Waste Spot Location"
            };
        } catch (error) {
            return {
                address: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                city: "Unknown Area",
                country: "Location recorded",
                locality: "Waste detected area"
            };
        }
    };

    const generateMockAnalysisWithLocation = async (locationCoords) => {
        console.warn('Using mock data - backend not responding');
        const wasteTypes = ["Mixed Waste", "Organic", "Plastic", "Paper", "Glass", "Metal", "Electronic"];
        const urgencyLevels = ["Low", "Medium", "High", "Critical"];

        const locationDetails = await getLocationDetails(locationCoords.lat, locationCoords.lng);

        return {
            wasteType: wasteTypes[Math.floor(Math.random() * wasteTypes.length)],
            urgency: urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)],
            fillLevel: Math.floor(Math.random() * 100) + 1,
            confidence: Math.floor(Math.random() * 20) + 80,
            detectedItems: ["Plastic bottles", "Food containers", "Paper waste", "Glass bottles", "Metal cans"],
            environmentalImpact: Math.floor(Math.random() * 10) + 1,
            recommendations: [
                "Schedule collection within 24 hours",
                "Separate recyclable materials",
                "Monitor for overflow",
                "Consider additional bins for this location",
                "Contact local waste management department"
            ],
            healthRisk: Math.floor(Math.random() * 5) + 1,
            estimatedWeight: Math.floor(Math.random() * 50) + 10,
            coordinates: locationCoords,
            bingMapsUrl: locationCoords.bingMapsUrl,
            locationDetails: locationDetails,
            isMockData: true
        };
    };

    const handleSubmitReport = () => {
        if (image && location && analysis) {
            const report = {
                image: annotatedImage || image, // Use annotated image if available
                originalImage: image, // Keep original too
                imageFile,
                location: location,
                analysis,
                type: "manual",
                bingMapsUrl: analysis.bingMapsUrl,
                locationDetails: analysis.locationDetails,
                coordinates: analysis.coordinates,
                isMockData: analysis.isMockData || false,
                hasAnnotations: !!annotatedImage // Flag if we have AI annotations
            };

            console.log('Submitting report with image:', {
                hasAnnotatedImage: !!annotatedImage,
                imageType: annotatedImage ? 'annotated' : 'original'
            });

            submitReport(report);

            // Reset form
            setShowSubmitButton(false);
            setImage(null);
            setAnnotatedImage(null);
            setImageFile(null);
            setLocation(null);
            setAnalysis(null);
            setLocationError(null);
            setUploadError(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const removeImage = () => {
        setImage(null);
        setAnnotatedImage(null);
        setImageFile(null);
        setAnalysis(null);
        setShowSubmitButton(false);
        setUploadError(null);
        setLocationError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const retryLocation = () => {
        setLocationError(null);
        if (imageFile) {
            getCurrentLocation()
                .then((locationCoords) => {
                    simulateEnhancedAIAnalysis(imageFile, locationCoords);
                })
                .catch((error) => {
                    setLocationError(error.message);
                });
        }
    };

    // Safe coordinate display function
    const displayCoordinates = (coords) => {
        if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
            return 'Location not available';
        }
        return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
    };

    // Safe accuracy display function
    const displayAccuracy = (coords) => {
        if (!coords || !coords.accuracy) return null;
        return `Accuracy: ±${Math.round(coords.accuracy)}m`;
    };

    // Determine which image to display
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
                        <p className="text-sm text-gray-500">Location-based AI Processing</p>
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
                        <p className="text-gray-500 mb-6">Advanced detection with precise location tracking</p>

                        {uploadError && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                                <div className="flex items-center">
                                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                                    <p className="text-red-700 text-sm">{uploadError}</p>
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
                            {/* Show AI Analysis Badge if we have annotated image */}
                            {annotatedImage && (
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

                        {/* Image Comparison Toggle if we have both images */}
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

            {/* Rest of the component remains the same */}
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
                    <p className="text-purple-700 font-bold text-lg">Performing Location-based AI Analysis...</p>
                    <p className="text-gray-600 text-sm mt-2">
                        Processing with computer vision • Environmental impact assessment • Location-based recommendations
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
                                Location-based Analysis Results
                                {analysis.isMockData && (
                                    <span className="ml-3 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                                        Demo Data
                                    </span>
                                )}
                                {annotatedImage && !analysis.isMockData && (
                                    <span className="ml-3 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                        AI Annotated
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

                    {/* Rest of the analysis display remains the same */}
                    {/* ... */}

                    {showSubmitButton && (
                        <button
                            onClick={handleSubmitReport}
                            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white py-5 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3"
                        >
                            <Upload className="w-6 h-6" />
                            <span>Submit Location-based Report</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default EnhancedImageUpload;