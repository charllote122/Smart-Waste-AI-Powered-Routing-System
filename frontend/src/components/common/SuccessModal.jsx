import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const SuccessModal = () => {
    const { showSuccessModal, setShowSuccessModal } = useApp();
    const navigate = useNavigate();

    const handleClose = () => {
        setShowSuccessModal(false);
        navigate('/reports');
    };

    if (!showSuccessModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Report Submitted Successfully!</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    Your waste analysis report has been successfully submitted to waste management authorities.
                    Thanks for helping keep our community clean and green!
                </p>
                <button
                    onClick={handleClose}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                >
                    View All Reports
                </button>
            </div>
        </div>
    );
};

export default SuccessModal;