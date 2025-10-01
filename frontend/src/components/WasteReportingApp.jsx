"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import {
    Camera,
    MapPin,
    Brain,
    Upload,
    CheckCircle,
    AlertTriangle,
    Trash2,
    Clock,
    Video,
    Play,
    Pause,
    Eye,
    Monitor,
    Wifi,
    Navigation,
    Star,
    TrendingUp,
    Zap,
    Shield,
    Users,
    Award,
    User,
    LogOut
} from "lucide-react"

// Bing Maps API Key

// Enhanced CCTV Monitoring Component with Current Location
const CCTVMonitoring = ({ onReportSubmit }) => {
    const [isMonitoring, setIsMonitoring] = useState(false)
    const [selectedCamera, setSelectedCamera] = useState("Camera 1")
    const [countdown, setCountdown] = useState(600)
    const [reports, setReports] = useState([])
    const [lastAnalysis, setLastAnalysis] = useState(null)
    const [mapLoaded, setMapLoaded] = useState(false)
    const [userCoordinates, setUserCoordinates] = useState(null)
    const [locationError, setLocationError] = useState(null)
    const [showSubmitButton, setShowSubmitButton] = useState(false)

    const cameras = [
        "Camera 1 - CBD Area",
        "Camera 2 - Market Zone",
        "Camera 3 - Residential Sector",
        "Camera 4 - Industrial District"
    ]

    // Get user's current location
    const getCurrentLocation = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported"))
                return
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    }
                    setUserCoordinates(coords)
                    setLocationError(null)
                    resolve(coords)
                },
                (error) => {
                    const errorMsg = `Location access denied. Please enable location services.`
                    setLocationError(errorMsg)
                    reject(new Error(errorMsg))
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            )
        })
    }, [])

    useEffect(() => {
        // Get initial location
        getCurrentLocation().catch(() => {
            // Silently handle initial failure
        })

        let interval
        if (isMonitoring && countdown > 0) {
            interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        generateAutomaticReport()
                        return 600
                    }
                    return prev - 1
                })
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [isMonitoring, countdown, getCurrentLocation])

    const generateAutomaticReport = async () => {
        // Get fresh location for each report
        let currentCoords = userCoordinates
        if (!currentCoords) {
            try {
                currentCoords = await getCurrentLocation()
            } catch (error) {
                setLocationError("Cannot generate report without location access")
                return
            }
        }

        const wasteTypes = ["Mixed Waste", "Organic", "Plastic", "Paper", "Glass"]
        const urgencyLevels = ["Low", "Medium", "High", "Critical"]

        const analysis = {
            wasteType: wasteTypes[Math.floor(Math.random() * wasteTypes.length)],
            urgency: urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)],
            fillLevel: Math.floor(Math.random() * 100) + 1,
            confidence: Math.floor(Math.random() * 20) + 80,
            detectedItems: ["Plastic bottles", "Food waste", "Paper bags"],
            recommendations: ["Schedule immediate collection", "Check for overflow", "Monitor for 24 hours"],
        }

        const newReport = {
            id: Date.now(),
            camera: selectedCamera,
            timestamp: new Date(),
            analysis,
            type: "automatic",
            coordinates: currentCoords,
            bingMapsUrl: `https://www.bing.com/maps/embed?h=300&w=400&cp=${currentCoords.lat}~${currentCoords.lng}&lvl=15&typ=d&sty=r&src=SHELL&FORM=MBEDV8`
        }

        setReports((prev) => [newReport, ...prev.slice(0, 9)])
        setLastAnalysis(analysis)
        setShowSubmitButton(true)
    }

    const handleSubmitReport = () => {
        if (lastAnalysis && userCoordinates && onReportSubmit) {
            const report = {
                id: Date.now(),
                timestamp: new Date(),
                analysis: lastAnalysis,
                type: "cctv",
                location: userCoordinates,
                camera: selectedCamera,
                status: "pending"
            }
            onReportSubmit(report)
            setShowSubmitButton(false)
            setLastAnalysis(null)
        }
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const statusIndicatorClass = `absolute -top-1 -right-1 w-4 h-4 ${isMonitoring ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
        } rounded-full border-2 border-white`

    return (
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Monitor className="w-6 h-6 text-white" />
                        </div>
                        <div className={statusIndicatorClass}></div>
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

            {/* Real Bing Maps Integration with Current Location */}
            <div className="mb-6">
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden shadow-inner">
                    {userCoordinates ? (
                        <iframe
                            src={`https://www.bing.com/maps/embed?h=300&w=400&cp=${userCoordinates.lat}~${userCoordinates.lng}&lvl=15&typ=d&sty=r&src=SHELL&FORM=MBEDV8`}
                            className="w-full h-full rounded-2xl"
                            style={{ border: 0 }}
                            onLoad={() => setMapLoaded(true)}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
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
                    {!mapLoaded && userCoordinates && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                            <div className="text-white text-center">
                                <MapPin className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                                <p>Loading Current Location Map...</p>
                            </div>
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

            {/* Enhanced AI Analysis */}
            {lastAnalysis && (
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 mb-6 border border-blue-100">
                    <h3 className="font-bold text-xl mb-6 flex items-center">
                        <Brain className="w-6 h-6 mr-3 text-blue-600" />
                        Latest AI Analysis
                        <span className="ml-auto text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{lastAnalysis.confidence}% confident</span>
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

                    {/* SUBMIT BUTTON FOR CCTV */}
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

            {/* Enhanced Recent Reports */}
            <div>
                <h3 className="font-bold text-lg mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-gray-700" />
                    Recent Reports ({reports.length})
                </h3>
                {reports.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <Monitor className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No automatic reports generated yet</p>
                        <p className="text-sm text-gray-400">Start monitoring to generate reports</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto">
                        {reports.map((report) => (
                            <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-3 h-3 rounded-full ${report.analysis.urgency === "Critical" ? "bg-red-500" :
                                        report.analysis.urgency === "High" ? "bg-orange-500" :
                                            report.analysis.urgency === "Medium" ? "bg-yellow-500" : "bg-green-500"
                                        }`}></div>
                                    <div>
                                        <p className="font-semibold">{report.analysis.wasteType}</p>
                                        <p className="text-sm text-gray-600">{report.camera}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-semibold ${report.analysis.urgency === "Critical" ? "text-red-600" :
                                        report.analysis.urgency === "High" ? "text-orange-600" :
                                            report.analysis.urgency === "Medium" ? "text-yellow-600" : "text-green-600"
                                        }`}>
                                        {report.analysis.urgency}
                                    </p>
                                    <p className="text-xs text-gray-500">{report.timestamp.toLocaleTimeString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// Enhanced Live Camera Component with Real Location Services
const LiveCamera = ({ onReportSubmit }) => {
    const [isStreaming, setIsStreaming] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysis, setAnalysis] = useState(null)
    const [cameraError, setCameraError] = useState(null)
    const [deviceId, setDeviceId] = useState(null)
    const [devices, setDevices] = useState([])
    const [userCoordinates, setUserCoordinates] = useState(null)
    const [locationError, setLocationError] = useState(null)
    const [showSubmitButton, setShowSubmitButton] = useState(false)
    const videoRef = useRef(null)
    const canvasRef = useRef(null)

    // Get user's current location
    const getCurrentLocation = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported"))
                return
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    }
                    setUserCoordinates(coords)
                    setLocationError(null)
                    resolve(coords)
                },
                (error) => {
                    const errorMsg = `Location access denied. Please enable location services.`
                    setLocationError(errorMsg)
                    reject(new Error(errorMsg))
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            )
        })
    }, [])

    useEffect(() => {
        // Get initial location
        getCurrentLocation().catch(() => {
            // Silently handle initial failure
        })

        // Enumerate camera devices
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const videoDevices = devices.filter(device => device.kind === 'videoinput')
                setDevices(videoDevices)
                if (videoDevices.length > 0) {
                    setDeviceId(videoDevices[videoDevices.length - 1].deviceId)
                }
            })
            .catch(err => console.log('Error enumerating devices:', err))
    }, [getCurrentLocation])

    const startCamera = async () => {
        try {
            setCameraError(null)
            // Get fresh location when starting camera
            await getCurrentLocation()

            const constraints = {
                video: {
                    deviceId: deviceId ? { exact: deviceId } : undefined,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    facingMode: deviceId ? undefined : { ideal: "environment" }
                },
                audio: false
            }

            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                await videoRef.current.play()
            }
            setIsStreaming(true)
        } catch (error) {
            console.error("Camera access error:", error)
            setCameraError(error.message)
            setIsStreaming(false)
        }
    }

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks()
            tracks.forEach((track) => track.stop())
            videoRef.current.srcObject = null
        }
        setIsStreaming(false)
        setAnalysis(null)
        setCameraError(null)
        setShowSubmitButton(false)
    }

    const captureFrame = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current
            const video = videoRef.current
            const ctx = canvas.getContext('2d')

            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            ctx.drawImage(video, 0, 0)

            return canvas.toDataURL('image/jpeg', 0.8)
        }
        return null
    }

    const analyzeCurrentFrame = async () => {
        if (!isStreaming) return

        setIsAnalyzing(true)

        // Ensure we have current location
        let currentCoords = userCoordinates
        if (!currentCoords) {
            try {
                currentCoords = await getCurrentLocation()
            } catch (error) {
                setCameraError("Cannot analyze without location access")
                setIsAnalyzing(false)
                return
            }
        }

        const frameImage = captureFrame()

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 3000))

        const wasteTypes = ["Mixed Waste", "Organic", "Plastic", "Paper", "Glass", "Electronic"]
        const urgencyLevels = ["Low", "Medium", "High", "Critical"]

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
        }

        setAnalysis(mockAnalysis)
        setIsAnalyzing(false)
        setShowSubmitButton(true)
    }

    const handleSubmitReport = () => {
        if (analysis && userCoordinates && onReportSubmit) {
            const report = {
                id: Date.now(),
                image: analysis.capturedImage,
                location: userCoordinates,
                analysis: analysis,
                timestamp: new Date(),
                status: "pending",
                type: "live-camera"
            }
            onReportSubmit(report)
            setShowSubmitButton(false)
            setAnalysis(null)
        }
    }

    const switchCamera = (newDeviceId) => {
        if (isStreaming) {
            stopCamera()
            setDeviceId(newDeviceId)
            setTimeout(() => {
                startCamera()
            }, 100)
        } else {
            setDeviceId(newDeviceId)
        }
    }

    const statusIndicatorClass = `absolute -top-1 -right-1 w-4 h-4 ${isStreaming ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
        } rounded-full border-2 border-white`

    return (
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Eye className="w-6 h-6 text-white" />
                        </div>
                        <div className={statusIndicatorClass}></div>
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

                    {/* Real-time Location Map */}
                    <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
                        <iframe
                            src={analysis.bingMapsUrl}
                            className="w-full h-48"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Live Analysis Location"
                        ></iframe>
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

                    {/* SUBMIT BUTTON FOR LIVE CAMERA */}
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
    )
}

// Enhanced Image Upload Component with Current Location
const EnhancedImageUpload = ({ onReportSubmit }) => {
    const [image, setImage] = useState(null)
    const [location, setLocation] = useState(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysis, setAnalysis] = useState(null)
    const [analysisHistory, setAnalysisHistory] = useState([])
    const [locationError, setLocationError] = useState(null)
    const [showSubmitButton, setShowSubmitButton] = useState(false)
    const fileInputRef = useRef(null)

    // Get user's current location
    const getCurrentLocation = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported"))
                return
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        bingMapsUrl: `https://www.bing.com/maps/embed?h=300&w=400&cp=${position.coords.latitude}~${position.coords.longitude}&lvl=15&typ=d&sty=r&src=SHELL&FORM=MBEDV8`
                    }
                    setLocation(coords)
                    setLocationError(null)
                    resolve(coords)
                },
                (error) => {
                    const errorMsg = `Location access denied. Please enable location services.`
                    setLocationError(errorMsg)
                    reject(new Error(errorMsg))
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            )
        })
    }, [])

    const handleImageUpload = (event) => {
        const file = event.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setImage(e.target.result)
                // Get location when image is uploaded
                getCurrentLocation()
                    .then(() => simulateEnhancedAIAnalysis())
                    .catch(() => {
                        setLocationError("Cannot analyze without location access")
                    })
            }
            reader.readAsDataURL(file)
        }
    }

    const simulateEnhancedAIAnalysis = async () => {
        if (!location) {
            setLocationError("Location required for analysis")
            return
        }

        setIsAnalyzing(true)

        await new Promise((resolve) => setTimeout(resolve, 4000))

        const wasteTypes = ["Mixed Waste", "Organic", "Plastic", "Paper", "Glass", "Metal", "Electronic"]
        const urgencyLevels = ["Low", "Medium", "High", "Critical"]

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
        }

        setAnalysis(mockAnalysis)
        setAnalysisHistory((prev) => [mockAnalysis, ...prev.slice(0, 4)])
        setIsAnalyzing(false)
        setShowSubmitButton(true)
    }

    const handleSubmitReport = () => {
        if (image && location && analysis && onReportSubmit) {
            const report = {
                id: Date.now(),
                image,
                location: location,
                analysis,
                timestamp: new Date(),
                status: "pending",
                type: "manual"
            }
            onReportSubmit(report)
            setShowSubmitButton(false)
            setImage(null)
            setLocation(null)
            setAnalysis(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

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
                        <p className="text-xs text-gray-400 mt-4">Supports JPG, PNG, WebP formats</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative">
                            <img
                                src={image || "/placeholder.svg"}
                                alt="Uploaded waste"
                                className="w-full h-80 object-cover rounded-2xl shadow-lg"
                            />
                            {location && (
                                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                                    📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                                </div>
                            )}
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
                        ></iframe>
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

                    {/* SUBMIT BUTTON FOR IMAGE UPLOAD */}
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
    )
}

// ... (rest of the components remain the same - HeroSection, Header, ReportForm, ReportsView, SuccessModal, AuthSystem, WasteReportingApp)

// Enhanced Hero Section (simplified)
const HeroSection = ({ setCurrentPage }) => {
    return (
        <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full text-blue-700 text-sm font-semibold mb-8 border border-blue-200">
                        <Brain className="w-5 h-5 mr-2" />
                        AI-Powered Waste Management
                    </div>
                    <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                        Smart Waste Reporting
                        <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                            Powered by AI Vision
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed">
                        Advanced monitoring with CCTV automation, live camera analysis, and detailed image processing.
                        Real-time location capture ensures accurate waste management.
                    </p>

                    <div className="flex justify-center items-center space-x-8 mb-12">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">24/7</div>
                            <div className="text-sm text-gray-600">AI Monitoring</div>
                        </div>
                        <div className="w-px h-12 bg-gray-300"></div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">Real-time</div>
                            <div className="text-sm text-gray-600">Location Tracking</div>
                        </div>
                        <div className="w-px h-12 bg-gray-300"></div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600">Instant</div>
                            <div className="text-sm text-gray-600">AI Analysis</div>
                        </div>
                    </div>

                    <div className="flex justify-center mb-20">
                        <button
                            onClick={() => setCurrentPage("report")}
                            className="group bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 text-white text-xl font-bold py-5 px-12 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-4"
                        >
                            <Camera className="w-7 h-7 group-hover:animate-pulse" />
                            <span>Start Reporting Now</span>
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <div className="group text-center p-6 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                <Monitor className="w-10 h-10 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">CCTV Monitoring</h3>
                            <p className="text-gray-600">Automated reports with real-time location tracking</p>
                        </div>

                        <div className="group text-center p-6 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                <Eye className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Live Camera</h3>
                            <p className="text-gray-600">Real-time analysis with location capture</p>
                        </div>

                        <div className="group text-center p-6 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                <Upload className="w-10 h-10 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Image Upload</h3>
                            <p className="text-gray-600">AI analysis with current location data</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

// Enhanced Header Component with Auth
const Header = ({ currentPage, setCurrentPage, user, onLogin, onLogout }) => (
    <header className="bg-white shadow-xl border-b sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                            WasteSpotter Pro
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">Advanced AI Waste Management</p>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600">
                        <button
                            onClick={() => setCurrentPage("home")}
                            className={`hover:text-blue-600 transition-colors px-3 py-2 rounded-lg ${currentPage === "home" ? "text-blue-600 bg-blue-50" : ""
                                }`}
                        >
                            Home
                        </button>
                        <button
                            onClick={() => setCurrentPage("report")}
                            className={`hover:text-blue-600 transition-colors px-3 py-2 rounded-lg ${currentPage === "report" ? "text-blue-600 bg-blue-50" : ""
                                }`}
                        >
                            Report Waste
                        </button>
                        <button
                            onClick={() => setCurrentPage("reports")}
                            className={`hover:text-blue-600 transition-colors px-3 py-2 rounded-lg ${currentPage === "reports" ? "text-blue-600 bg-blue-50" : ""
                                }`}
                        >
                            View Reports
                        </button>
                    </div>

                    {user ? (
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-100">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-medium text-blue-700">{user.name.split(' ')[0]}</span>
                            </div>
                            <button
                                onClick={onLogout}
                                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => onLogin("login")}
                                className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => onLogin("register")}
                                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                            >
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </header>
)

// Enhanced Report Form Component
const ReportForm = ({ onReportSubmit }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">Advanced Waste Reporting</h1>
                    <p className="text-xl text-gray-600 mb-4">Choose your preferred method for waste detection and analysis</p>
                    <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium">
                        <MapPin className="w-4 h-4 mr-2" />
                        Real-time Location Capture Enabled
                    </div>
                </div>

                <div className="grid lg:grid-cols-1 xl:grid-cols-3 gap-8">
                    <CCTVMonitoring onReportSubmit={onReportSubmit} />
                    <LiveCamera onReportSubmit={onReportSubmit} />
                    <EnhancedImageUpload onReportSubmit={onReportSubmit} />
                </div>
            </div>
        </div>
    )
}

// Enhanced Reports View Component
const ReportsView = ({ reports }) => {
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
                            <div className="text-3xl font-bold text-green-600">{reports.filter(r => r.status === "completed").length}</div>
                            <div className="text-sm text-gray-600">Completed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-600">{reports.filter(r => r.status === "pending").length}</div>
                            <div className="text-sm text-gray-600">Pending</div>
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
                                            src={report.image || "/placeholder.svg"}
                                            alt="Waste bin report"
                                            className="w-full h-56 object-cover"
                                        />
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <span
                                            className={`px-4 py-2 rounded-full text-sm font-semibold ${report.status === "completed"
                                                ? "bg-green-100 text-green-800"
                                                : report.status === "in-progress"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                                }`}
                                        >
                                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                        </span>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${report.analysis.urgency === "Critical"
                                                ? "bg-red-100 text-red-800"
                                                : report.analysis.urgency === "High"
                                                    ? "bg-orange-100 text-orange-800"
                                                    : report.analysis.urgency === "Medium"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-green-100 text-green-800"
                                                }`}
                                        >
                                            {report.analysis.urgency} Priority
                                        </span>
                                    </div>

                                    <p className="font-bold text-xl mb-2">{report.analysis.wasteType}</p>
                                    <p className="text-gray-600 text-sm mb-4">Fill Level: {report.analysis.fillLevel}%</p>

                                    <div className="space-y-2 mb-4">
                                        {report.type && (
                                            <div className="flex items-center text-blue-600 text-sm">
                                                {report.type === "cctv" ? (
                                                    <Monitor className="w-4 h-4 mr-2" />
                                                ) : report.type === "live-camera" ? (
                                                    <Eye className="w-4 h-4 mr-2" />
                                                ) : (
                                                    <Upload className="w-4 h-4 mr-2" />
                                                )}
                                                <span>
                                                    {report.type === "cctv" ? "CCTV Report" :
                                                        report.type === "live-camera" ? "Live Camera" : "Image Upload"}
                                                </span>
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
                                    <p className="text-xs text-gray-500">Fill Level: {report.analysis.fillLevel}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// Success Modal Component
const SuccessModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Report Submitted Successfully!</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    Your detailed waste analysis report has been successfully submitted to waste management authorities.
                    Thanks for helping keep our community clean and green!
                </p>
                <button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                >
                    Continue to Dashboard
                </button>
            </div>
        </div>
    )
}

// Auth System Component
const AuthSystem = ({ onLogin, onRegister, onClose, mode = "login" }) => {
    const [isLogin, setIsLogin] = useState(mode === "login")
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        phone: ""
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        const userData = {
            id: Date.now(),
            email: formData.email,
            name: formData.name,
            phone: formData.phone,
            joinDate: new Date()
        }

        if (isLogin) {
            onLogin(userData)
        } else {
            onRegister(userData)
        }

        setLoading(false)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </h2>
                    <p className="text-gray-600 mt-2">
                        {isLogin ? "Sign in to access your data" : "Join us to save your reports"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                                placeholder="Enter your full name"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                            placeholder="Enter your email"
                        />
                    </div>

                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                                placeholder="Enter your phone number"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                {isLogin ? "Signing in..." : "Creating account..."}
                            </div>
                        ) : (
                            isLogin ? "Sign In" : "Create Account"
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full text-gray-600 hover:text-gray-700 font-medium py-3"
                    >
                        Continue without account
                    </button>
                </div>
            </div>
        </div>
    )
}

// Main App Component
const WasteReportingApp = () => {
    const [currentPage, setCurrentPage] = useState("home")
    const [reports, setReports] = useState([])
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [user, setUser] = useState(null)
    const [authMode, setAuthMode] = useState(null)

    // Check for stored user session on component mount
    useEffect(() => {
        const storedUser = localStorage.getItem('wasteSpotterUser')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
    }, [])

    const handleLogin = (userData) => {
        setUser(userData)
        setAuthMode(null)
        localStorage.setItem('wasteSpotterUser', JSON.stringify(userData))
    }

    const handleRegister = (userData) => {
        setUser(userData)
        setAuthMode(null)
        localStorage.setItem('wasteSpotterUser', JSON.stringify(userData))
    }

    const handleLogout = () => {
        setUser(null)
        localStorage.removeItem('wasteSpotterUser')
    }

    const handleReportSubmit = (report) => {
        const reportWithUser = user ? { ...report, userId: user.id } : report
        setReports((prevReports) => [reportWithUser, ...prevReports])
        setShowSuccessModal(true)

        // Simulate status updates
        setTimeout(() => {
            setReports((prev) => prev.map((r) => (r.id === report.id ? { ...r, status: "in-progress" } : r)))
        }, 5000)

        setTimeout(() => {
            setReports((prev) => prev.map((r) => (r.id === report.id ? { ...r, status: "completed" } : r)))
        }, 15000)
    }

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false)
        setCurrentPage("reports")
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                user={user}
                onLogin={setAuthMode}
                onLogout={handleLogout}
            />

            {currentPage === "home" && <HeroSection setCurrentPage={setCurrentPage} />}
            {currentPage === "report" && <ReportForm onReportSubmit={handleReportSubmit} />}
            {currentPage === "reports" && <ReportsView reports={reports} />}

            {/* Auth Modal */}
            {authMode && (
                <AuthSystem
                    onLogin={handleLogin}
                    onRegister={handleRegister}
                    onClose={() => setAuthMode(null)}
                    mode={authMode}
                />
            )}

            <SuccessModal isOpen={showSuccessModal} onClose={handleSuccessModalClose} />
        </div>
    )
}

export default WasteReportingApp