import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Brain, Monitor, Eye, Upload } from 'lucide-react';

const HeroSection = () => {
    return (
        <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    {/* Badge */}
                    <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full text-blue-700 text-sm font-semibold mb-8 border border-blue-200">
                        <Brain className="w-5 h-5 mr-2" />
                        AI-Powered Waste Management
                    </div>

                    {/* Main Heading */}
                    <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                        Smart Waste Reporting
                        <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                            Powered by AI Vision
                        </span>
                    </h2>

                    {/* Description */}
                    <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed">
                        Advanced monitoring with CCTV automation, live camera analysis, and detailed image processing.
                        Real-time location capture ensures accurate waste management.
                    </p>

                    {/* Stats */}
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

                    {/* CTA Button */}
                    <div className="flex justify-center mb-20">
                        <Link
                            to="/report"
                            className="group bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 text-white text-xl font-bold py-5 px-12 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-4"
                        >
                            <Camera className="w-7 h-7 group-hover:animate-pulse" />
                            <span>Start Reporting Now</span>
                        </Link>
                    </div>

                    {/* Features Grid */}
                  
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                       
                         <Link to="/report">
                        
                        <div className="group text-center p-6 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                <Monitor className="w-10 h-10 text-blue-600" />
                            
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">CCTV Monitoring </h3>
                            <p className="text-gray-600">Automated reports with real-time location tracking</p>
                        </div>

                        </Link>
                        <Link to="/report">
                        <div className="group text-center p-6 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                <Eye className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Live Camera</h3>
                            <p className="text-gray-600">Real-time analysis with location capture</p>
                        </div>
                        </Link>
                        <Link to="/report">
                        <div className="group text-center p-6 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                <Upload className="w-10 h-10 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Image Upload</h3>
                            <p className="text-gray-600">AI analysis with current location data</p>
                        </div>
                        </Link>
                    </div>
                    
                </div>
            </div>
        </section>
    );
};

export default HeroSection;