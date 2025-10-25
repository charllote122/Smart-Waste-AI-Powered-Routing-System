// api.js
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Configuration
const config = {
    baseURL: API_BASE_URL,
    timeout: 60000,
    retryAttempts: 3,
    retryDelay: 1000,
};

// Request queue for tracking active requests
const requestQueue = new Map();

// Generate unique request ID
const generateRequestId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Custom error formatter
const createApiError = (message, status, data) => {
    const error = new Error(message);
    error.name = 'ApiError';
    error.status = status;
    error.data = data;
    return error;
};

// Create axios instance
const axiosInstance = axios.create({
    baseURL: config.baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: config.timeout,
    validateStatus: (status) => status < 500,
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (requestConfig) => {
        const requestId = generateRequestId();
        requestConfig.metadata = { requestId, startTime: Date.now() };
        console.log(`[API] ${requestConfig.method.toUpperCase()} ${requestConfig.url} [${requestId}]`);
        return requestConfig;
    },
    (error) => {
        console.error('[API] Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        const duration = Date.now() - response.config.metadata.startTime;
        console.log(
            `[API] ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`
        );
        return response;
    },
    async (error) => {
        if (error.config && !error.config.__retryCount) {
            error.config.__retryCount = 0;
        }

        const shouldRetry =
            error.config &&
            error.config.__retryCount < config.retryAttempts &&
            (!error.response || error.response.status >= 500 || error.code === 'ECONNABORTED');

        if (shouldRetry) {
            error.config.__retryCount += 1;
            const delay = config.retryDelay * error.config.__retryCount;

            console.log(
                `[API] Retrying request (${error.config.__retryCount}/${config.retryAttempts}) after ${delay}ms`
            );

            await new Promise(resolve => setTimeout(resolve, delay));
            return axiosInstance(error.config);
        }

        console.error('[API] Request failed:', error.message);
        return Promise.reject(error);
    }
);

// Format error message
const formatError = (error) => {
    if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.error || error.response.data?.message || 'Unknown error';
        return createApiError(`Request failed: ${status} - ${message}`, status, error.response.data);
    } else if (error.request) {
        return createApiError('No response received from server. Please check your connection.', null, null);
    } else {
        return createApiError(`Request setup error: ${error.message}`, null, null);
    }
};

// Generic request handler
const request = async (endpoint, options = {}) => {
    try {
        const response = await axiosInstance({
            url: endpoint,
            ...options,
        });

        if (response.status >= 400) {
            throw createApiError(
                response.data?.error || 'Request failed',
                response.status,
                response.data
            );
        }

        return response.data;
    } catch (error) {
        throw formatError(error);
    }
};

// ===========================
// HEALTH & SYSTEM
// ===========================

export const healthCheck = async () => {
    return request('/health', { method: 'GET' });
};

export const checkServerConnection = async () => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        await axiosInstance.get('/health', { signal: controller.signal });
        clearTimeout(timeoutId);
        return true;
    } catch (error) {
        console.error('Server connection error:', error);
        return false;
    }
};

// ===========================
// IMAGE ANALYSIS
// ===========================

export const analyzeImage = async (imageFile, options = {}) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    // Add location if provided
    if (options.location) {
        formData.append('location', options.location);
    }

    try {
        const response = await axiosInstance.post('/analyze', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: options.onProgress,
            signal: options.signal,
        });

        if (response.status >= 400) {
            throw createApiError(
                response.data?.error || 'Analysis failed',
                response.status,
                response.data
            );
        }

        return response.data;
    } catch (error) {
        throw formatError(error);
    }
};

export const batchAnalyze = async (imageFiles, options = {}) => {
    const formData = new FormData();
    imageFiles.forEach((file) => {
        formData.append('images', file);
    });

    try {
        const response = await axiosInstance.post('/batch-analyze', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: options.onProgress,
            signal: options.signal,
        });

        if (response.status >= 400) {
            throw createApiError(
                response.data?.error || 'Batch analysis failed',
                response.status,
                response.data
            );
        }

        return response.data;
    } catch (error) {
        throw formatError(error);
    }
};

// ===========================
// CAMERA MANAGEMENT
// ===========================

export const addCamera = async (cameraData) => {
    return request('/cameras', {
        method: 'POST',
        data: cameraData,
    });
};

export const getCameras = async () => {
    return request('/cameras', { method: 'GET' });
};

export const getCamera = async (cameraId) => {
    return request(`/cameras/${cameraId}`, { method: 'GET' });
};

export const updateCamera = async (cameraId, cameraData) => {
    return request(`/cameras/${cameraId}`, {
        method: 'PUT',
        data: cameraData,
    });
};

export const deleteCamera = async (cameraId) => {
    return request(`/cameras/${cameraId}`, { method: 'DELETE' });
};

// ===========================
// REPORTS MANAGEMENT
// ===========================

export const createReport = async (reportData) => {
    return request('/reports', {
        method: 'POST',
        data: reportData,
    });
};

export const getReports = async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.limit) params.append('limit', filters.limit);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/reports?${queryString}` : '/reports';
    
    return request(endpoint, { method: 'GET' });
};

export const getReport = async (reportId, includeImage = false) => {
    const params = includeImage ? '?include_image=true' : '';
    return request(`/reports/${reportId}${params}`, { method: 'GET' });
};

export const updateReport = async (reportId, reportData) => {
    return request(`/reports/${reportId}`, {
        method: 'PUT',
        data: reportData,
    });
};

export const deleteReport = async (reportId) => {
    return request(`/reports/${reportId}`, { method: 'DELETE' });
};

export const getReportImage = async (reportId) => {
    return request(`/reports/${reportId}/image`, { method: 'GET' });
};

// ===========================
// STATISTICS
// ===========================

export const getStatistics = async () => {
    return request('/statistics', { method: 'GET' });
};

export const updateStatistics = async () => {
    return request('/statistics/update', { method: 'POST' });
};

// ===========================
// DASHBOARD
// ===========================

export const getDashboardSummary = async () => {
    return request('/dashboard/summary', { method: 'GET' });
};

// ===========================
// IMAGE UTILITIES
// ===========================

export const getAnnotatedImageUrl = (filename) => {
    return `${config.baseURL}/results/${filename}`;
};

export const getFullImageUrl = (filename) => {
    return `${config.baseURL}/results/${filename}`;
};

export const downloadFile = async (url, filename) => {
    try {
        const response = await axiosInstance.get(url, {
            responseType: 'blob',
        });

        const blob = new Blob([response.data]);
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(link.href);
    } catch (error) {
        throw formatError(error);
    }
};

// ===========================
// VALIDATION
// ===========================

export const validateImageFile = (file, maxSizeMB = 10) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (!file) {
        throw new Error('No file provided');
    }

    if (!validTypes.includes(file.type)) {
        throw new Error(`Invalid file type. Allowed types: ${validTypes.join(', ')}`);
    }

    if (file.size > maxSizeBytes) {
        throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
    }

    return true;
};

export const validateImageFiles = (files, maxSizeMB = 10) => {
    const errors = [];

    files.forEach((file, index) => {
        try {
            validateImageFile(file, maxSizeMB);
        } catch (error) {
            errors.push({ index, filename: file.name, error: error.message });
        }
    });

    return errors;
};

export const validateCameraData = (cameraData) => {
    const errors = [];

    if (!cameraData.name || cameraData.name.trim() === '') {
        errors.push('Camera name is required');
    }

    if (!cameraData.ipaddress || cameraData.ipaddress.trim() === '') {
        errors.push('IP address is required');
    }

    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (cameraData.ipaddress && !ipRegex.test(cameraData.ipaddress)) {
        errors.push('Invalid IP address format');
    }

    return errors;
};

export const validateReportData = (reportData) => {
    const errors = [];

    if (!reportData.location || reportData.location.trim() === '') {
        errors.push('Location is required');
    }

    const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
    if (reportData.priority && !validPriorities.includes(reportData.priority)) {
        errors.push(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
    }

    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Cancelled'];
    if (reportData.status && !validStatuses.includes(reportData.status)) {
        errors.push(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return errors;
};

// ===========================
// REQUEST MANAGEMENT
// ===========================

export const setAuthToken = (token) => {
    if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axiosInstance.defaults.headers.common['Authorization'];
    }
};

export const clearAuthToken = () => {
    delete axiosInstance.defaults.headers.common['Authorization'];
};

export const cancelAllRequests = (reason = 'Requests cancelled by user') => {
    requestQueue.forEach((controller, requestId) => {
        controller.abort(reason);
        requestQueue.delete(requestId);
    });
};

export const createAbortController = () => {
    return new AbortController();
};

export const getBaseUrl = () => config.baseURL;

export const setBaseUrl = (newUrl) => {
    config.baseURL = newUrl;
    axiosInstance.defaults.baseURL = newUrl;
};

// ===========================
// EXPORT DEFAULT OBJECT
// ===========================

const apiService = {
    // Health & System
    healthCheck,
    checkServerConnection,
    
    // Image Analysis
    analyzeImage,
    batchAnalyze,
    
    // Camera Management
    addCamera,
    getCameras,
    getCamera,
    updateCamera,
    deleteCamera,
    
    // Reports Management
    createReport,
    getReports,
    getReport,
    updateReport,
    deleteReport,
    getReportImage,
    
    // Statistics
    getStatistics,
    updateStatistics,
    
    // Dashboard
    getDashboardSummary,
    
    // Image Utilities
    getAnnotatedImageUrl,
    getFullImageUrl,
    downloadFile,
    
    // Validation
    validateImageFile,
    validateImageFiles,
    validateCameraData,
    validateReportData,
    
    // Request Management
    setAuthToken,
    clearAuthToken,
    cancelAllRequests,
    createAbortController,
    getBaseUrl,
    setBaseUrl,
    request,
};

export default apiService;