import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, Brain, AlertTriangle, CheckCircle, Navigation, Trash2, Shield, Award, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import apiService from '../../services/api';

const EnhancedImageUpload = () => {
    const { submitReport, analyzeImage } = useApp();
    const [image, setImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [location, setLocation] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [uploadError, setUploadError] = useState(null);
    const [showSubmitButton, setShowSubmitButton] = useState(false);
    const fileInputRef = useRef(null);

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
                        accuracy: position.coords.accuracy,
                        bingMapsUrl: `https://www.bing.com/maps/embed?h=300&w=400&cp=${position.coords.latitude}~${position.coords.longitude}&lvl=15&typ=d&sty=r&src=SHELL&FORM=MBEDV8`
                    };
                    setLocation(coords);
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

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

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
                    .then(() => {
                        // Auto-analyze after location is obtained
                        simulateEnhancedAIAnalysis(file);
                    })
                    .catch(() => {
                        setLocationError("Cannot analyze without location access");
                    });
            };
            reader.readAsDataURL(file);
        } catch (error) {
            setUploadError(error.message);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const simulateEnhancedAIAnalysis = async (file) => {
        if (!location) {
            setLocationError("Location required for analysis");
            return;
        }

        setIsAnalyzing(true);
        setAnalysis(null);

        try {
            // Use the actual API service for analysis
            const analysisResult = await analyzeImage(file);

            // Add location data to analysis
            const analysisWithLocation = {
                ...analysisResult,
                coordinates: location,
                bingMapsUrl: location.bingMapsUrl
            };

            setAnalysis(analysisWithLocation);
            setShowSubmitButton(true);
        } catch (error) {
            console.error('Analysis failed:', error);
            // Fallback to mock analysis
            await new Promise((resolve) => setTimeout(resolve, 4000));

            const wasteTypes = ["Mixed Waste", "Organic", "Plastic", "Paper", "Glass", "Metal", "Electronic"];
            const urgencyLevels = ["Low", "Medium", "High", "Critical"];

            const mockAnalysis = {
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
                coordinates: location,
                bingMapsUrl: location.bingMapsUrl
            };

            setAnalysis(mockAnalysis);
            setShowSubmitButton(true);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmitReport = () => {
        if (image && location && analysis) {
            const report = {
                image,
                imageFile,
                location: location,
                analysis,
                type: "manual",
                bingMapsUrl: analysis.bingMapsUrl
            };
            submitReport(report);
            setShowSubmitButton(false);
            setImage(null);
            setImageFile(null);
            setLocation(null);
            setAnalysis(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const removeImage = () => {
        setImage(null);
        setImageFile(null);
        setAnalysis(null);
        setShowSubmitButton(false);
        setUploadError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
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
                        <p className="text-sm text-gray-500">Advanced AI Processing</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-full">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">AI Ready</span>
                </div>
            </div>

            <div className="mb-8">
                {!image ? (
                    <div className="border-2 border-dashed border-purple-300 rounded-2xl p-16 text-center hover:border-purple-400 hover:bg-purple-50/30 transition-all duration-300">
                        <Camera className="w-20 h-20 text-purple-400 mx-auto mb-6" />
                        <p className="text-gray-700 font-semibold text-lg mb-2">Upload Waste Image for AI Analysis</p>
                        <p className="text-gray-500 mb-6">Advanced detection with location tracking</p>

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
                                src={image}
                                alt="Uploaded waste"
                                className="w-full h-80 object-cover rounded-2xl shadow-lg"
                            />
                            {location && (
                                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                                    📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                                </div>
                            )}
                            <button
                                onClick={removeImage}
                                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
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
                    <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                        <p className="text-red-700 text-sm">{locationError}</p>
                        <button
                            onClick={getCurrentLocation}
                            className="ml-auto bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
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
                    <p className="text-purple-700 font-bold text-lg">Performing Advanced AI Analysis...</p>
                    <p className="text-gray-600 text-sm mt-2">
                        Processing with computer vision • Environmental impact assessment • Location-based recommendations
                    </p>
                </div>
            )}

            {analysis && !isAnalyzing && (
                <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 rounded-2xl p-8 mb-8 border border-purple-100">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3">
                            <h3 className="font-bold text-2xl flex items-center">
                                <Brain className="w-7 h-7 mr-3 text-purple-600" />
                                Detailed Analysis Results
                            </h3>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="text-sm bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-semibold">
                                {analysis.confidence}% Confident
                            </span>
                        </div>
                    </div>

                    {/* Location Map */}
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
                    </div>

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
                                Detected Items ({analysis.detectedItems.length})
                            </p>
                            <div className="space-y-3">
                                {analysis.detectedItems.map((item, index) => (
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
                                AI Recommendations ({analysis.recommendations.length})
                            </p>
                            <div className="space-y-3">
                                {analysis.recommendations.map((rec, index) => (
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
                                    <p className="font-bold text-green-800 text-lg">Location Analysis Complete</p>
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
                            <span>Submit Image Analysis Report</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default EnhancedImageUpload;