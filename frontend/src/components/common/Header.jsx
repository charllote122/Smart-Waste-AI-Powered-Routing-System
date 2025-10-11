import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, User, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Header = () => {
    const { user, logout, setAuthMode } = useApp();
    const location = useLocation();
    const currentPage = location.pathname;

    const isActive = (path) => {
        return currentPage === path;
    };

    return (
        <header className="bg-white shadow-xl border-b sticky top-0 z-50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
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

                    {/* Navigation & Auth */}
                    <div className="flex items-center space-x-6">
                        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600">
                            <Link
                                to="/"
                                className={`hover:text-blue-600 transition-colors px-3 py-2 rounded-lg ${isActive("/") ? "text-blue-600 bg-blue-50" : ""
                                    }`}
                            >
                                Home
                            </Link>
                            <Link
                                to="/report"
                                className={`hover:text-blue-600 transition-colors px-3 py-2 rounded-lg ${isActive("/report") ? "text-blue-600 bg-blue-50" : ""
                                    }`}
                            >
                                Report Waste
                            </Link>
                            <Link
                                to="/reports"
                                className={`hover:text-blue-600 transition-colors px-3 py-2 rounded-lg ${isActive("/reports") ? "text-blue-600 bg-blue-50" : ""
                                    }`}
                            >
                                View Reports
                            </Link>
                        </nav>

                        {user ? (
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-100">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="font-medium text-blue-700">{user.name}</span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setAuthMode("login")}
                                    className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => setAuthMode("register")}
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
    );
};

export default Header;