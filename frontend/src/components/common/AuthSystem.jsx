import React, { useState, useEffect, useCallback } from 'react';
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Phone,
    CheckCircle,
    AlertCircle,
    Shield,
    ArrowLeft,
    Brain,
    Camera,
    Upload,
    X,
    Loader2,
    Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const AuthSystem = () => {
    const { authMode, setAuthMode, login, register, user } = useApp();
    const [isLogin, setIsLogin] = useState(authMode === 'login');
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        phone: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [shake, setShake] = useState(false);

    // Check mobile device
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Reset form when authMode changes
    useEffect(() => {
        setIsLogin(authMode === 'login');
        setFormData({
            email: "",
            password: "",
            name: "",
            phone: ""
        });
        setErrors({});
        setSuccess('');
    }, [authMode]);

    // Enhanced validation with real-time feedback
    const validateForm = useCallback(() => {
        const newErrors = {};

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation with strength indicator
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        } else if (!isLogin && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Include uppercase, lowercase, and numbers';
        }

        // Registration specific validations
        if (!isLogin) {
            if (!formData.name?.trim()) {
                newErrors.name = 'Full name is required';
            } else if (formData.name.trim().length < 2) {
                newErrors.name = 'Name must be at least 2 characters';
            }

            if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
                newErrors.phone = 'Please enter a valid 10-digit phone number';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, isLogin]);

    // Real-time validation on input change
    useEffect(() => {
        if (formData.email && formData.email.includes('@')) {
            const emailError = !/\S+@\S+\.\S+/.test(formData.email) ? 'Please enter a valid email' : '';
            setErrors(prev => ({ ...prev, email: emailError }));
        }

        if (formData.password && formData.password.length > 0) {
            let passwordError = '';
            if (formData.password.length < 6) {
                passwordError = 'Too short (min 6 characters)';
            } else if (!isLogin && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
                passwordError = 'Include uppercase, lowercase, and numbers';
            }
            setErrors(prev => ({ ...prev, password: passwordError }));
        }
    }, [formData.email, formData.password, isLogin]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShake(false);

        if (!validateForm()) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }

        setLoading(true);
        setErrors({});
        setSuccess('');

        try {
            // Simulate API call with better error handling
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Simulate random API failures (remove in production)
                    if (Math.random() < 0.1) {
                        reject(new Error(isLogin ? 'Login failed. Please check your credentials.' : 'Registration failed. Email might be taken.'));
                    } else {
                        resolve();
                    }
                }, 1500);
            });

            const userData = {
                id: Date.now(),
                email: formData.email,
                name: formData.name || formData.email.split('@')[0],
                phone: formData.phone,
                joinDate: new Date(),
                lastLogin: new Date(),
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || formData.email.split('@')[0])}&background=10b981&color=fff`
            };

            if (isLogin) {
                await login(userData);
                setSuccess('🎉 Login successful! Redirecting...');
            } else {
                await register(userData);
                setSuccess('✨ Account created successfully! Welcome to EcoTrack!');
            }

            // Auto-close after success
            setTimeout(() => {
                setAuthMode(null);
            }, 2000);

        } catch (error) {
            setErrors({ submit: error.message });
            setShake(true);
            setTimeout(() => setShake(false), 500);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear field error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
        if (errors.submit) {
            setErrors(prev => ({ ...prev, submit: '' }));
        }
    };

    const handlePhoneChange = (value) => {
        const numbers = value.replace(/\D/g, '');
        let formatted = numbers;

        if (numbers.length > 3 && numbers.length <= 6) {
            formatted = `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
        } else if (numbers.length > 6) {
            formatted = `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
        }

        handleInputChange('phone', formatted);
    };

    const handleDemoLogin = () => {
        setFormData({
            email: "demo@ecotrack.com",
            password: "Demo123!",
            name: "Demo User",
            phone: "(555) 123-4567"
        });
        setErrors({});
        setSuccess('Demo credentials loaded! Click Sign In to continue.');
    };

    const getPasswordStrength = () => {
        if (!formData.password) return { strength: 0, text: '', color: '' };

        let strength = 0;
        if (formData.password.length >= 6) strength += 1;
        if (/[a-z]/.test(formData.password)) strength += 1;
        if (/[A-Z]/.test(formData.password)) strength += 1;
        if (/\d/.test(formData.password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;

        const strengths = [
            { text: 'Very Weak', color: 'bg-red-500' },
            { text: 'Weak', color: 'bg-orange-500' },
            { text: 'Fair', color: 'bg-yellow-500' },
            { text: 'Good', color: 'bg-blue-500' },
            { text: 'Strong', color: 'bg-green-500' }
        ];

        return { ...strengths[strength - 1], strength };
    };

    const passwordStrength = getPasswordStrength();

    if (!authMode) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm">
            <div className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto ${shake ? 'animate-shake' : ''
                }`}>
                {/* Enhanced Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => setAuthMode(null)}
                            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex items-center justify-center space-x-3 flex-1">
                            <div className="relative">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">EcoTrack AI</h1>
                                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Waste Management System</p>
                            </div>
                        </div>
                        <div className="w-9"></div> {/* Spacer for balance */}
                    </div>

                    <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-4">
                        <div className="flex items-center space-x-1 sm:space-x-2 bg-blue-50 px-2 sm:px-3 py-1 rounded-full">
                            <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                            <span className="text-xs sm:text-sm font-medium text-blue-700">Live Camera</span>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 bg-purple-50 px-2 sm:px-3 py-1 rounded-full">
                            <Upload className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                            <span className="text-xs sm:text-sm font-medium text-purple-700">Image Upload</span>
                        </div>
                    </div>
                </div>

                {/* Auth Form Card */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 sm:p-6 border border-gray-200">
                    <div className="mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 text-center">
                            {isLogin ? "Welcome Back" : "Join EcoTrack"}
                        </h2>
                        <p className="text-gray-600 text-xs sm:text-sm text-center mt-1">
                            {isLogin ? "Sign in to access all features" : "Create account to save reports"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        {/* Name Field (Signup only) */}
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2 sm:py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 text-sm sm:text-base ${errors.name
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                                                : 'border-gray-200 focus:border-green-500 focus:ring-green-100'
                                            }`}
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                {errors.name && (
                                    <div className="flex items-center mt-1 text-red-600 text-xs sm:text-sm">
                                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                        {errors.name}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 sm:py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 text-sm sm:text-base ${errors.email
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                                            : 'border-gray-200 focus:border-green-500 focus:ring-green-100'
                                        }`}
                                    placeholder="Enter your email"
                                />
                            </div>
                            {errors.email && (
                                <div className="flex items-center mt-1 text-red-600 text-xs sm:text-sm">
                                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                    {errors.email}
                                </div>
                            )}
                        </div>

                        {/* Phone Field (Signup only) */}
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number <span className="text-gray-400 text-xs">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handlePhoneChange(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                                        placeholder="(555) 123-4567"
                                        maxLength={14}
                                    />
                                </div>
                                {errors.phone && (
                                    <div className="flex items-center mt-1 text-red-600 text-xs sm:text-sm">
                                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                        {errors.phone}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className={`w-full pl-10 pr-10 py-2 sm:py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 text-sm sm:text-base ${errors.password
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                                            : 'border-gray-200 focus:border-green-500 focus:ring-green-100'
                                        }`}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {!isLogin && formData.password && (
                                <div className="mt-2">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Password strength:</span>
                                        <span className={passwordStrength.color.replace('bg-', 'text-')}>
                                            {passwordStrength.text}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div
                                            className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                            style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {errors.password && (
                                <div className="flex items-center mt-1 text-red-600 text-xs sm:text-sm">
                                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                    {errors.password}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg disabled:shadow-none"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" />
                                    {isLogin ? "Signing in..." : "Creating account..."}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    {!isLogin && <Sparkles className="w-4 h-4 mr-2" />}
                                    {isLogin ? "Sign In" : "Create Account"}
                                </div>
                            )}
                        </button>

                        {/* Demo Login Button */}
                        {isLogin && (
                            <button
                                type="button"
                                onClick={handleDemoLogin}
                                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md text-sm sm:text-base"
                            >
                                Try Demo Account
                            </button>
                        )}

                        {/* Error Message */}
                        {errors.submit && (
                            <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
                                <div className="flex items-start">
                                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <p className="text-red-700 text-xs sm:text-sm">{errors.submit}</p>
                                </div>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl">
                                <div className="flex items-start">
                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <p className="text-green-700 text-xs sm:text-sm">{success}</p>
                                </div>
                            </div>
                        )}
                    </form>

                    {/* Auth Mode Toggle */}
                    <div className="mt-4 sm:mt-6 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-green-600 hover:text-green-700 font-medium transition-colors text-sm sm:text-base"
                        >
                            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
                        </button>
                    </div>

                    {/* Continue without account */}
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                        <button
                            onClick={() => setAuthMode(null)}
                            className="w-full text-gray-600 hover:text-gray-700 font-medium py-2 sm:py-3 transition-colors text-sm sm:text-base hover:bg-gray-50 rounded-lg"
                        >
                            Continue without account (Limited Features)
                        </button>
                    </div>

                    {/* Security Notice */}
                    <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start">
                            <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                            <p className="text-blue-700 text-xs">
                                <strong>Login Required:</strong> Save reports, track history, and access all AI features.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthSystem;