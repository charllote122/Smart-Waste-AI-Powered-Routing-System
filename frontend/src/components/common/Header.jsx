import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Camera, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { validateMapsConfig } from '../../config/maps';

const Header = () => {
    const { user, logout, setAuthMode, serverStatus } = useApp();
    const location = useLocation();
    const navigate = useNavigate();
    const [mapsStatus, setMapsStatus] = useState('checking');
    const [showServerStatus, setShowServerStatus] = useState(true);
    const [showMapsStatus, setShowMapsStatus] = useState(true);

    useEffect(() => {
        setMapsStatus(validateMapsConfig() ? 'available' : 'unavailable');

        if (serverStatus === 'connected' && mapsStatus === 'available') {
            const timer = setTimeout(() => {
                setShowServerStatus(false);
                setShowMapsStatus(false);
            }, 180000); // 3 minutes in milliseconds

            return () => clearTimeout(timer);
        } else {
            setShowServerStatus(true);
            setShowMapsStatus(true);
        }
    }, [serverStatus, mapsStatus]);

    const handleMapsOfflineClick = () => {
        if (mapsStatus === 'unavailable') {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        console.log('Location access granted:', position);
                    },
                    (error) => {
                        console.error('Location access denied:', error);
                    }
                );
            } else {
                alert('Geolocation is not supported by this browser.');
            }
        }
    };

    const handleViewReportsClick = () => {
        const isAdminUser = window.confirm("Are you an admin?");
        if (isAdminUser) {
            navigate('/reports');
        } else {
            navigate('/');
        }
    };

    return (
        <header className="bg-white shadow-xl border-b sticky top-0 z-50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between flex-wrap">
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
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
                        </Link>

                        {/* Status Indicators */}
                        <div className="flex items-center space-x-4">
                            {/* Server Status Indicator */}
                            {showServerStatus && (
                                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${serverStatus === 'connected' ? 'bg-green-100 text-green-800 border-green-300' :
                                        serverStatus === 'disconnected' ? 'bg-red-100 text-red-800 border-red-300' :
                                            'bg-yellow-100 text-yellow-800 border-yellow-300'
                                    } transition duration-200 hover:shadow-md`}>
                                    <div className={`w-2 h-2 rounded-full ${serverStatus === 'connected' ? 'bg-green-500' :
                                            serverStatus === 'disconnected' ? 'bg-red-500' :
                                                'bg-yellow-500 animate-pulse'
                                        }`}></div>
                                    <span>
                                        {serverStatus === 'connected' ? 'Server Connected' :
                                            serverStatus === 'disconnected' ? 'Server Under Maintenance' :
                                                'Checking Connection...'}
                                    </span>
                                </div>
                            )}

                            {/* Maps Status Indicator */}
                            {showMapsStatus && (
                                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${mapsStatus === 'available' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                    } transition duration-200 hover:shadow-md`} onClick={handleMapsOfflineClick}>
                                    <MapPin className={`w-3 h-3 ${mapsStatus === 'available' ? 'text-green-500' : 'text-yellow-500'
                                        }`} />
                                    <span>
                                        {mapsStatus === 'available' ? 'Maps Ready' : 'Maps Offline'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Add links here */}
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <Link to="/report" className="px-4 py-2 border rounded-lg bg-gray-100 text-blue-600 hover:bg-gray-200 transition duration-200">Report</Link>

                        <button onClick={handleViewReportsClick} className="px-4 py-2 border rounded-lg bg-gray-100 text-blue-600 hover:bg-gray-200 transition duration-200">Reports</button>
                    <Link to="/analysis" className="px-4 py-2 border rounded-lg bg-gray-100 text-blue-600 hover:bg-gray-200 transition duration-200">Analysis</Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
