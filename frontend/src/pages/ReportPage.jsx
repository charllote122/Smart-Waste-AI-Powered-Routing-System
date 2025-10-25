import React from 'react';
import { MapPin } from 'lucide-react';
import CCTVMonitoring from '../components/reporting/CCTVMonitoring';
import LiveCamera from '../components/reporting/LiveCamera';
import EnhancedImageUpload from '../components/reporting/EnhancedImageUpload';

const ReportPage = () => {
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
                   
                        <CCTVMonitoring />
                    
                    
                        <LiveCamera />
                 
                   
                        <EnhancedImageUpload />
                   
                </div>
            </div>
        </div>
    );
};

export default ReportPage;
