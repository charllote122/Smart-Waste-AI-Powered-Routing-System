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

    const currentPage = location.pathname;

    // Initialize app - check server and load data
    useEffect(() => {
        checkServerConnection();
        loadCameras();
        loadReports();

        // Set up periodic health checks every 30 seconds
        const healthCheckInterval = setInterval(() => {
            checkServerConnection();
        }, 30000);

        return () => clearInterval(healthCheckInterval);
    }, []);

    // Check server connection - FIXED to handle boolean return
    const checkServerConnection = useCallback(async () => {
        try {
            setServerStatus('checking');
            const isConnected = await apiService.checkServerConnection();
            setServerStatus(isConnected ? 'connected' : 'disconnected');

            if (isConnected && error?.type === 'server') {
                setError(null);
                addNotification('Server connection restored', 'success');
            }
        } catch (error) {
            console.error('Server connection check failed:', error);
            setServerStatus('disconnected');
            if (error?.type !== 'server') {
                setError({
                    type: 'server',
                    message: 'Unable to connect to server. Some features may be limited.'
                });
            }
        }
    }, [error]);

    // Load cameras from real API
    const loadCameras = useCallback(async () => {
        try {
            const response = await apiService.getCameras();
            // Backend returns { count, cameras }
            const camerasData = response.cameras || [];
            
            // Transform backend data to match frontend format
            const formattedCameras = camerasData.map(camera => ({
                id: camera.id,
                name: camera.name,
                location: camera.location,
                status: camera.status === 1 ? 'online' : 'offline',
                ipaddress: camera.ipaddress,
                lastActive: new Date(),
                streamUrl: `/api/stream/${camera.id}`
            }));
            
            setCameras(formattedCameras);
        } catch (error) {
            console.error('Failed to load cameras:', error);
            addNotification('Failed to load cameras', 'error');
            setCameras([]);
        }
    }, []);

    // Load reports from real API
    const loadReports = useCallback(async () => {
        try {
            const response = await apiService.getReports();
            // Backend returns { count, reports }
            const reportsData = response.reports || [];
            
            // Transform backend data to match frontend format
            const formattedReports = reportsData.map(report => ({
                id: report.id,
                location: report.location,
                priority: report.priority,
                status: report.status,
                confidence: report.ai_confidence,
                timestamp: new Date(report.reportedAt),
                reportId: `RPT-${report.id}`,
                hasImage: report.has_image,
                imageName: report.image_name
            }));
            
            setReports(formattedReports);
        } catch (error) {
            console.error('Failed to load reports:', error);
            addNotification('Failed to load reports', 'error');
            setReports([]);
        }
    }, []);

    // Navigation function
    const setCurrentPage = useCallback((path, options = {}) => {
        const { replace = false, state = {} } = options;

        if (replace) {
            navigate(path, { replace: true, state });
        } else {
            navigate(path, { state });
        }
    }, [navigate]);

    // User loading with token validation
    useEffect(() => {
        const loadUser = async () => {
            const storedUser = localStorage.getItem('wasteSpotterUser');
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);

                    if (userData.token) {
                        apiService.setAuthToken(userData.token);
                        // Note: Add token verification endpoint in backend if needed
                        setUser(userData);
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

    // Authentication functions (add these endpoints to your Flask backend)
    const login = async (userData) => {
        setLoading(true);
        setError(null);

        try {
            // For now, use mock login until backend auth is implemented
            const mockUser = {
                id: 1,
                email: userData.email,
                name: userData.email.split('@')[0],
                token: 'mock-token-' + Date.now(),
                lastLogin: new Date()
            };

            setUser(mockUser);
            setAuthMode(null);
            apiService.setAuthToken(mockUser.token);
            localStorage.setItem('wasteSpotterUser', JSON.stringify(mockUser));

            addNotification('Login successful!', 'success');
            return mockUser;
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
            // For now, use mock registration until backend auth is implemented
            const mockUser = {
                id: Date.now(),
                email: userData.email,
                name: userData.name || userData.email.split('@')[0],
                token: 'mock-token-' + Date.now(),
                joinDate: new Date(),
                lastLogin: new Date()
            };

            setUser(mockUser);
            setAuthMode(null);
            apiService.setAuthToken(mockUser.token);
            localStorage.setItem('wasteSpotterUser', JSON.stringify(mockUser));

            addNotification('Account created successfully!', 'success');
            return mockUser;
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
        setUser(null);
        setAuthMode(null);
        apiService.clearAuthToken();
        localStorage.removeItem('wasteSpotterUser');

        addNotification('Logged out successfully', 'info');
        navigate('/');
    }, [navigate]);

    // Submit report using real API
    const submitReport = async (report) => {
        setLoading(true);
        setError(null);

        try {
            // If we have an imageFile, analyze it first (which creates the report automatically)
            if (report.imageFile) {
                // Analyze the image - backend will create report if fillLevel > 50%
                const analysis = await apiService.analyzeImage(report.imageFile, {
                    location: report.location || 'Unknown Location'
                });

                // Backend automatically creates report, so just reload reports
                await loadReports();
                
                setShowSuccessModal(true);
                addNotification('Image analyzed and report created!', 'success');
                
                return analysis;
            } else {
                // Manual report without image
                const reportData = {
                    location: report.location || 'Unknown Location',
                    priority: report.priority || 'Medium',
                    status: 'Pending',
                    ai_confidence: Math.round(report.confidence || 0)
                };

                const response = await apiService.createReport(reportData);
                
                const newReport = {
                    id: response.report.id,
                    location: response.report.location,
                    priority: response.report.priority,
                    status: response.report.status,
                    confidence: response.report.ai_confidence,
                    timestamp: new Date(response.report.reportedAt),
                    reportId: `RPT-${response.report.id}`,
                    hasImage: response.report.has_image,
                    imageName: response.report.image_name
                };

                setReports(prev => [newReport, ...prev]);
                setShowSuccessModal(true);
                addNotification('Report submitted successfully!', 'success');

                setTimeout(() => loadReports(), 500);

                return newReport;
            }
        } catch (error) {
            const message = error.message || 'Failed to submit report';
            console.error('Submit report error:', error);
            setError({ type: 'report', message });
            addNotification(message, 'error');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // AI Image Analysis using real API
    const analyzeImage = useCallback(async (imageFile, options = {}) => {
        setLoading(true);
        setError(null);

        try {
            // Use real API service
            const response = await apiService.analyzeImage(imageFile, {
                location: options.location,
                onProgress: options.onProgress,
                signal: options.signal
            });

            // Backend returns the analysis results directly
            const analysis = {
                wasteType: response.wasteType || 'Unknown',
                wasteColor: response.wasteColor || '#6B7280',
                wasteIcon: response.wasteIcon || '🗑️',
                urgency: response.urgency || 'Medium',
                urgencyColor: response.urgencyColor || '#F59E0B',
                fillLevel: response.fillLevel || 0,
                confidence: response.confidence || 0,
                detectedItems: response.detectedItems || [],
                recommendations: response.recommendations || [],
                annotatedImageUrl: response.annotated_image_url || response.annotatedImageUrl,
                timestamp: new Date()
            };

            addNotification('Image analysis completed!', 'success');
            return analysis;
        } catch (error) {
            console.error('Image analysis failed:', error);
            const message = error.message || 'Image analysis failed';
            setError({ type: 'analysis', message });
            addNotification(message, 'error');
            throw error;
        } finally {
            setLoading(false);
        }
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

        setNotifications(prev => [notification, ...prev.slice(0, 4)]);

        // Auto-remove after 5 seconds
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
        loadReports,

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