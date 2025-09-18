import React from 'react';
import { Brain, MapPin, Zap, Eye, Clock, Shield, BarChart3, Users } from 'lucide-react';

const FeaturesSection = () => (
    <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* AI Detection Explanation */}
            <div className="text-center mb-16">
                <h3 className="text-4xl font-bold text-gray-900 mb-4">How Our AI Works</h3>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Advanced machine learning algorithms analyze your photos to identify waste types and prioritize collection
                </p>
            </div>

            {/* Main Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <Brain className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="text-xl font-bold mb-4 text-center group-hover:text-blue-600 transition-colors">Smart Classification</h4>
                    <p className="text-gray-600 text-center leading-relaxed mb-4">
                        Our ML model identifies 15+ waste categories including organic, plastic, metal, hazardous, and mixed waste with 95% accuracy.
                    </p>
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-blue-700 font-medium">Categories: Organic • Plastic • Metal • Glass • Hazardous • E-waste</p>
                    </div>
                </div>

                <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200 hover:-translate-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <MapPin className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-xl font-bold mb-4 text-center group-hover:text-green-600 transition-colors">Precise Location</h4>
                    <p className="text-gray-600 text-center leading-relaxed mb-4">
                        GPS coordinates are automatically captured with each photo, ensuring collection teams can locate bins with meter-level precision.
                    </p>
                    <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-xs text-green-700 font-medium">Accuracy: ±3 meters • Timestamp • Address lookup</p>
                    </div>
                </div>

                <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200 hover:-translate-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <Zap className="w-8 h-8 text-purple-600" />
                    </div>
                    <h4 className="text-xl font-bold mb-4 text-center group-hover:text-purple-600 transition-colors">Instant Alerts</h4>
                    <p className="text-gray-600 text-center leading-relaxed mb-4">
                        Reports are immediately sent to the county municipal dashboard with priority levels based on waste type and urgency.
                    </p>
                    <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-xs text-purple-700 font-medium">Response: &lt;5 seconds • Priority scoring • Auto-assignment</p>
                    </div>
                </div>

                <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-200 hover:-translate-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <Eye className="w-8 h-8 text-orange-600" />
                    </div>
                    <h4 className="text-xl font-bold mb-4 text-center group-hover:text-orange-600 transition-colors">Visual Analysis</h4>
                    <p className="text-gray-600 text-center leading-relaxed mb-4">
                        Advanced computer vision detects bin fullness levels, overflow conditions, and surrounding cleanliness status.
                    </p>
                    <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="text-xs text-orange-700 font-medium">Detects: Overflow • Damage • Capacity level</p>
                    </div>
                </div>

                <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-indigo-200 hover:-translate-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <Clock className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h4 className="text-xl font-bold mb-4 text-center group-hover:text-indigo-600 transition-colors">Priority System</h4>
                    <p className="text-gray-600 text-center leading-relaxed mb-4">
                        AI assigns urgency levels: Critical (hazardous), High (overflow), Medium (full), Low (partial) for optimal resource allocation.
                    </p>
                    <div className="bg-indigo-50 p-3 rounded-lg">
                        <p className="text-xs text-indigo-700 font-medium">Levels: Critical • High • Medium • Low</p>
                    </div>
                </div>

                <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-teal-200 hover:-translate-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <Shield className="w-8 h-8 text-teal-600" />
                    </div>
                    <h4 className="text-xl font-bold mb-4 text-center group-hover:text-teal-600 transition-colors">Data Security</h4>
                    <p className="text-gray-600 text-center leading-relaxed mb-4">
                        All photos and location data are encrypted and stored securely. No personal information is collected or shared.
                    </p>
                    <div className="bg-teal-50 p-3 rounded-lg">
                        <p className="text-xs text-teal-700 font-medium">Encrypted • GDPR compliant • Anonymous reporting</p>
                    </div>
                </div>
            </div>

            {/* County Dashboard Info */}
            <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-3xl p-12 text-white">
                <div className="text-center mb-12">
                    <h4 className="text-3xl font-bold mb-4">Municipal Dashboard Integration</h4>
                    <p className="text-xl text-blue-200 max-w-3xl mx-auto">
                        Your reports power a comprehensive dashboard for county officials to manage waste collection efficiently
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <BarChart3 className="w-8 h-8 text-blue-300" />
                        </div>
                        <h5 className="font-bold mb-2">Real-time Analytics</h5>
                        <p className="text-sm text-blue-200">Live waste collection metrics and trends</p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-8 h-8 text-green-300" />
                        </div>
                        <h5 className="font-bold mb-2">Interactive Maps</h5>
                        <p className="text-sm text-blue-200">Visual location mapping of all reports</p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-purple-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-purple-300" />
                        </div>
                        <h5 className="font-bold mb-2">Team Assignment</h5>
                        <p className="text-sm text-blue-200">Auto-assign collection crews by location</p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-orange-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-orange-300" />
                        </div>
                        <h5 className="font-bold mb-2">Response Tracking</h5>
                        <p className="text-sm text-blue-200">Monitor collection completion times</p>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <div className="inline-flex items-center space-x-4 bg-blue-800 rounded-xl px-6 py-3">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">Live Dashboard Active</span>
                        </div>
                        <div className="text-blue-300">•</div>
                        <span className="text-sm text-blue-200">County officials monitor 24/7</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default FeaturesSection;