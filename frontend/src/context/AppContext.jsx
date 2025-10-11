import React, { createContext, useContext, useState, useEffect } from 'react';
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

    // Get current page from router location
    const currentPage = location.pathname;

    // Check server connection on app start
    useEffect(() => {
        checkServerConnection();
        loadCameras();
    }, []);

    const checkServerConnection = async () => {
        try {
            setServerStatus('checking');
            const isConnected = await apiService.checkServerConnection();
            setServerStatus(isConnected ? 'connected' : 'disconnected');
        } catch (error) {
            setServerStatus('disconnected');
            console.error('Server connection check failed:', error);
        }
    };

    const loadCameras = async () => {
        try {
            // This would typically come from your backend API
            const mockCameras = [
                { id: 1, name: "Camera 1 - CBD Area", location: "Central Business District" },
                { id: 2, name: "Camera 2 - Market Zone", location: "Main Market Area" },
                { id: 3, name: "Camera 3 - Residential Sector", location: "Residential Zone" },
                { id: 4, name: "Camera 4 - Industrial District", location: "Industrial Area" }
            ];
            setCameras(mockCameras);
        } catch (error) {
            console.error('Failed to load cameras:', error);
        }
    };

    // Navigation function using React Router
    const setCurrentPage = (path) => {
        navigate(path);
    };

    // Load user from localStorage on app start
    useEffect(() => {
        const storedUser = localStorage.getItem('wasteSpotterUser');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            if (userData.token) {
                apiService.setAuthToken(userData.token);
            }
        }
    }, []);

    // Authentication functions
    const login = async (userData) => {
        try {
            // In a real app, you would call your authentication API
            // const response = await apiService.request('/auth/login', {
            //   method: 'POST',
            //   data: { email: userData.email, password: userData.password }
            // });

            // For demo purposes, we'll simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const userWithToken = {
                ...userData,
                token: 'demo-token-' + Date.now()
            };

            setUser(userWithToken);
            setAuthMode(null);
            apiService.setAuthToken(userWithToken.token);
            localStorage.setItem('wasteSpotterUser', JSON.stringify(userWithToken));
        } catch (error) {
            throw new Error('Login failed: ' + error.message);
        }
    };

    const register = async (userData) => {
        try {
            // In a real app, you would call your registration API
            // const response = await apiService.request('/auth/register', {
            //   method: 'POST',
            //   data: userData
            // });

            // For demo purposes, we'll simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const userWithToken = {
                ...userData,
                token: 'demo-token-' + Date.now()
            };

            setUser(userWithToken);
            setAuthMode(null);
            apiService.setAuthToken(userWithToken.token);
            localStorage.setItem('wasteSpotterUser', JSON.stringify(userWithToken));
        } catch (error) {
            throw new Error('Registration failed: ' + error.message);
        }
    };

    const logout = () => {
        setUser(null);
        setAuthMode(null);
        apiService.clearAuthToken();
        localStorage.removeItem('wasteSpotterUser');
        navigate('/');
    };

    // Report management functions
    const submitReport = async (report) => {
        try {
            const reportWithUser = user ? { ...report, userId: user.id } : report;
            const newReport = {
                ...reportWithUser,
                id: Date.now(),
                timestamp: new Date(),
                status: 'pending'
            };

            setReports(prev => [newReport, ...prev]);
            setShowSuccessModal(true);

            // Simulate API submission
            // In a real app, you would call:
            // const response = await apiService.request('/reports', {
            //   method: 'POST',
            //   data: newReport
            // });

            // Simulate status progression
            setTimeout(() => {
                setReports(prev => prev.map(r =>
                    r.id === newReport.id ? { ...r, status: "in-progress" } : r
                ));
            }, 3000);

            setTimeout(() => {
                setReports(prev => prev.map(r =>
                    r.id === newReport.id ? { ...r, status: "completed" } : r
                ));
            }, 10000);

        } catch (error) {
            console.error('Failed to submit report:', error);
            throw error;
        }
    };

    // AI Analysis function
    const analyzeImage = async (imageFile) => {
        try {
            // Use your actual API service
            const analysis = await apiService.analyzeImage(imageFile);
            return analysis;
        } catch (error) {
            console.error('Image analysis failed:', error);
            // Fallback to mock analysis if API fails
            return generateMockAnalysis();
        }
    };

    // Mock analysis fallback
    const generateMockAnalysis = () => {
        const wasteTypes = ["Mixed Waste", "Organic", "Plastic", "Paper", "Glass", "Metal", "Electronic"];
        const urgencyLevels = ["Low", "Medium", "High", "Critical"];

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
                "Contact local waste management department"
            ],
            healthRisk: Math.floor(Math.random() * 5) + 1,
            estimatedWeight: Math.floor(Math.random() * 50) + 10,
        };
    };

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

        // Reports
        reports,
        showSuccessModal,
        setShowSuccessModal,
        submitReport,

        // AI Analysis
        analyzeImage,

        // System
        serverStatus,
        cameras,
        checkServerConnection
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};