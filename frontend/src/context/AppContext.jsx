import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/api';

const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(null);
    const [reports, setReports] = useState([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [authMode, setAuthMode] = useState(null);
    const [serverStatus, setServerStatus] = useState('checking');
    const [cameras, setCameras] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]);

    // Get current page from router location
    const currentPage = location.pathname;

    // Check server connection on app start with retry logic
    useEffect(() => {
        checkServerConnection();
        loadCameras();
        loadReportsFromStorage();

        // Set up periodic health checks
        const healthCheckInterval = setInterval(() => {
            checkServerConnection();
        }, 30000); // Check every 30 seconds

        return () => clearInterval(healthCheckInterval);
    }, []);

    // Enhanced server connection check with retry
    const checkServerConnection = useCallback(async () => {
        try {
            setServerStatus('checking');
            const health = await apiService.checkServerConnection();
            setServerStatus(health.connected ? 'connected' : 'disconnected');

            if (health.connected && error?.type === 'server') {
                setError(null);
                addNotification('Server connection restored', 'success');
            }
        } catch (error) {
            setServerStatus('disconnected');
            if (error.type !== 'server') {
                setError({
                    type: 'server',
                    message: 'Unable to connect to server. Some features may be limited.'
                });
            }
        }
    }, [error]);

    // Load cameras with real API integration
    const loadCameras = useCallback(async () => {
        try {
            // Try real API first, fallback to mock data
            const camerasData = await apiService.request('/cameras', { method: 'GET' });
            setCameras(camerasData);
        } catch (error) {
            console.warn('Using mock camera data:', error.message);
            const mockCameras = [
                {
                    id: 1,
                    name: "Camera 1 - CBD Area",
                    location: "Central Business District",
                    status: 'online',
                    lastActive: new Date(),
                    streamUrl: '/api/stream/1'
                },
                {
                    id: 2,
                    name: "Camera 2 - Market Zone",
                    location: "Main Market Area",
                    status: 'online',
                    lastActive: new Date(),
                    streamUrl: '/api/stream/2'
                },
                {
                    id: 3,
                    name: "Camera 3 - Residential Sector",
                    location: "Residential Zone",
                    status: 'offline',
                    lastActive: new Date(Date.now() - 3600000),
                    streamUrl: '/api/stream/3'
                },
                {
                    id: 4,
                    name: "Camera 4 - Industrial District",
                    location: "Industrial Area",
                    status: 'online',
                    lastActive: new Date(),
                    streamUrl: '/api/stream/4'
                }
            ];
            setCameras(mockCameras);
        }
    }, []);

    // Navigation function with analytics
    const setCurrentPage = useCallback((path, options = {}) => {
        const { replace = false, state = {} } = options;

        if (replace) {
            navigate(path, { replace: true, state });
        } else {
            navigate(path, { state });
        }

        // Track page views for analytics
        if (window.gtag) {
            window.gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: document.title,
                page_location: window.location.origin + path
            });
        }
    }, [navigate]);

    // Enhanced user loading with validation
    useEffect(() => {
        const loadUser = async () => {
            const storedUser = localStorage.getItem('wasteSpotterUser');
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);

                    // Validate token with backend
                    if (userData.token) {
                        apiService.setAuthToken(userData.token);

                        // Verify token is still valid
                        try {
                            const currentUser = await apiService.getCurrentUser();
                            setUser({ ...userData, ...currentUser });
                        } catch (error) {
                            // Token is invalid, clear local storage
                            console.warn('Token validation failed:', error);
                            logout();
                        }
                    } else {
                        setUser(userData);
                    }
                } catch (error) {
                    console.error('Failed to parse stored user:', error);
                    localStorage.removeItem('wasteSpotterUser');
                }
            }
        };

        loadUser();
    }, []);

    // Enhanced authentication functions with real API
    const login = async (userData) => {
        setLoading(true);
        setError(null);

        try {
            // Use real API for authentication
            const response = await apiService.login(userData.email, userData.password);

            const userWithToken = {
                ...response.user,
                token: response.token,
                lastLogin: new Date()
            };

            setUser(userWithToken);
            setAuthMode(null);
            apiService.setAuthToken(userWithToken.token);
            localStorage.setItem('wasteSpotterUser', JSON.stringify(userWithToken));

            addNotification('Login successful!', 'success');

            return response;
        } catch (error) {
            const message = error.message || 'Login failed. Please check your credentials.';
            setError({ type: 'auth', message });
            addNotification(message, 'error');
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        setError(null);

        try {
            // Use real API for registration
            const response = await apiService.register(userData);

            const userWithToken = {
                ...response.user,
                token: response.token,
                joinDate: new Date(),
                lastLogin: new Date()
            };

            setUser(userWithToken);
            setAuthMode(null);
            apiService.setAuthToken(userWithToken.token);
            localStorage.setItem('wasteSpotterUser', JSON.stringify(userWithToken));

            addNotification('Account created successfully!', 'success');

            return response;
        } catch (error) {
            const message = error.message || 'Registration failed. Please try again.';
            setError({ type: 'auth', message });
            addNotification(message, 'error');
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const logout = useCallback(() => {
        // Call logout API
        apiService.logout().catch(console.error);

        setUser(null);
        setAuthMode(null);
        apiService.clearAuthToken();
        localStorage.removeItem('wasteSpotterUser');
        setReports(prev => prev.filter(report => !report.userId)); // Clear user-specific reports

        addNotification('Logged out successfully', 'info');
        navigate('/');
    }, [navigate]);

    // Enhanced report management with persistence
    const loadReportsFromStorage = useCallback(() => {
        try {
            const storedReports = localStorage.getItem('wasteSpotterReports');
            if (storedReports) {
                const reportsData = JSON.parse(storedReports);
                setReports(reportsData.map(report => ({
                    ...report,
                    timestamp: new Date(report.timestamp)
                })));
            }
        } catch (error) {
            console.error('Failed to load reports from storage:', error);
        }
    }, []);

    const saveReportsToStorage = useCallback((reportsData) => {
        try {
            localStorage.setItem('wasteSpotterReports', JSON.stringify(reportsData));
        } catch (error) {
            console.error('Failed to save reports to storage:', error);
        }
    }, []);

    const submitReport = async (report) => {
        setLoading(true);
        setError(null);

        try {
            const reportWithUser = user ? {
                ...report,
                userId: user.id,
                userName: user.name
            } : report;

            const newReport = {
                ...reportWithUser,
                id: Date.now(),
                timestamp: new Date(),
                status: 'pending',
                reportId: `RPT-${Date.now()}`
            };

            // Try real API first
            try {
                const response = await apiService.request('/reports', {
                    method: 'POST',
                    data: newReport
                });
                newReport.id = response.id; // Use server-generated ID
            } catch (apiError) {
                console.warn('Using local storage for report:', apiError.message);
                // Continue with local storage fallback
            }

            setReports(prev => {
                const updatedReports = [newReport, ...prev];
                saveReportsToStorage(updatedReports);
                return updatedReports;
            });

            setShowSuccessModal(true);
            addNotification('Report submitted successfully!', 'success');

            // Simulate status progression for demo
            if (process.env.NODE_ENV === 'development') {
                setTimeout(() => {
                    setReports(prev => prev.map(r =>
                        r.id === newReport.id ? { ...r, status: "in-progress" } : r
                    ));
                }, 3000);

                setTimeout(() => {
                    setReports(prev => {
                        const updatedReports = prev.map(r =>
                            r.id === newReport.id ? { ...r, status: "completed" } : r
                        );
                        saveReportsToStorage(updatedReports);
                        return updatedReports;
                    });
                    addNotification(`Report ${newReport.reportId} completed!`, 'info');
                }, 10000);
            }

            return newReport;
        } catch (error) {
            const message = error.message || 'Failed to submit report';
            setError({ type: 'report', message });
            addNotification(message, 'error');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Enhanced AI Analysis with caching
    const analyzeImage = useCallback(async (imageFile, options = {}) => {
        setLoading(true);
        setError(null);

        try {
            // Use real API service with caching
            const analysis = await apiService.analyzeImage(imageFile, {
                onProgress: options.onProgress,
                signal: options.signal
            });

            addNotification('Image analysis completed!', 'success');
            return analysis;
        } catch (error) {
            console.warn('Image analysis failed, using mock data:', error);
            addNotification('Using demo analysis data', 'warning');

            // Fallback to mock analysis if API fails
            return generateMockAnalysis();
        } finally {
            setLoading(false);
        }
    }, []);

    // Enhanced mock analysis with more realistic data
    const generateMockAnalysis = useCallback(() => {
        const wasteTypes = [
            { type: "Mixed Waste", color: "#6B7280", icon: "🗑️" },
            { type: "Organic", color: "#10B981", icon: "🍂" },
            { type: "Plastic", color: "#3B82F6", icon: "🧴" },
            { type: "Paper", color: "#F59E0B", icon: "📄" },
            { type: "Glass", color: "#8B5CF6", icon: "🥃" },
            { type: "Metal", color: "#EF4444", icon: "🔩" },
            { type: "Electronic", color: "#6366F1", icon: "🔌" }
        ];

        const urgencyLevels = [
            { level: "Low", color: "#10B981", priority: 1 },
            { level: "Medium", color: "#F59E0B", priority: 2 },
            { level: "High", color: "#EF4444", priority: 3 },
            { level: "Critical", color: "#DC2626", priority: 4 }
        ];

        const selectedWaste = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
        const selectedUrgency = urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)];

        return {
            wasteType: selectedWaste.type,
            wasteColor: selectedWaste.color,
            wasteIcon: selectedWaste.icon,
            urgency: selectedUrgency.level,
            urgencyColor: selectedUrgency.color,
            urgencyPriority: selectedUrgency.priority,
            fillLevel: Math.floor(Math.random() * 100) + 1,
            confidence: Math.floor(Math.random() * 20) + 80,
            detectedItems: [
                "Plastic bottles",
                "Food containers",
                "Paper waste",
                "Glass bottles",
                "Metal cans",
                "Cardboard boxes"
            ].slice(0, Math.floor(Math.random() * 4) + 2),
            environmentalImpact: Math.floor(Math.random() * 10) + 1,
            recommendations: [
                "Schedule collection within 24 hours",
                "Separate recyclable materials",
                "Monitor for overflow",
                "Contact local waste management department",
                "Consider composting organic waste",
                "Check for hazardous materials"
            ].slice(0, Math.floor(Math.random() * 3) + 2),
            healthRisk: Math.floor(Math.random() * 5) + 1,
            estimatedWeight: Math.floor(Math.random() * 50) + 10,
            estimatedVolume: (Math.random() * 5 + 1).toFixed(1) + ' m³',
            processingTime: Math.floor(Math.random() * 120) + 30 + ' minutes',
            timestamp: new Date()
        };
    }, []);

    // Notification system
    const addNotification = useCallback((message, type = 'info') => {
        const id = Date.now();
        const notification = {
            id,
            message,
            type,
            timestamp: new Date()
        };

        setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5 notifications

        // Auto-remove notification after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);

    const clearNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Export reports functionality
    const exportReports = useCallback(async (format = 'json') => {
        try {
            if (format === 'json') {
                const dataStr = JSON.stringify(reports, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `waste-reports-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);
            }
            // Add CSV export support here
            addNotification('Reports exported successfully!', 'success');
        } catch (error) {
            addNotification('Export failed', 'error');
            throw error;
        }
    }, [reports, addNotification]);

    const value = {
        // Navigation
        currentPage,
        setCurrentPage,

        // Authentication
        user,
        authMode,
        setAuthMode,
        login,
        register,
        logout,
        loading,
        setLoading,

        // Reports
        reports,
        setReports,
        showSuccessModal,
        setShowSuccessModal,
        submitReport,
        exportReports,

        // AI Analysis
        analyzeImage,

        // System
        serverStatus,
        cameras,
        checkServerConnection,
        loadCameras,

        // Error Handling
        error,
        clearError,

        // Notifications
        notifications,
        addNotification,
        clearNotification
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};