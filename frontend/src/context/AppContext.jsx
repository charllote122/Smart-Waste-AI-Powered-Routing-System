import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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

    // Get current page from router location
    const currentPage = location.pathname;

    // Navigation function using React Router
    const setCurrentPage = (path) => {
        navigate(path);
    };

    // Load user from localStorage on app start
    useEffect(() => {
        const storedUser = localStorage.getItem('wasteSpotterUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Authentication functions
    const login = (userData) => {
        setUser(userData);
        setAuthMode(null);
        localStorage.setItem('wasteSpotterUser', JSON.stringify(userData));
    };

    const register = (userData) => {
        setUser(userData);
        setAuthMode(null);
        localStorage.setItem('wasteSpotterUser', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setAuthMode(null);
        localStorage.removeItem('wasteSpotterUser');
        navigate('/');
    };

    // Report management functions
    const submitReport = (report) => {
        const reportWithUser = user ? { ...report, userId: user.id } : report;
        const newReport = {
            ...reportWithUser,
            id: Date.now(),
            timestamp: new Date(),
            status: 'pending'
        };

        setReports(prev => [newReport, ...prev]);
        setShowSuccessModal(true);

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
        submitReport
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};