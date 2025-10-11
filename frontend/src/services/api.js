import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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

// Health check
export const healthCheck = async () => {
    return request('/health', { method: 'GET' });
};

// Single image analysis
export const analyzeImage = async (imageFile, options = {}) => {
    const formData = new FormData();
    formData.append('image', imageFile);

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

// Batch image analysis
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

// Get annotated image URL
export const getAnnotatedImageUrl = (filename) => {
    return `${config.baseURL}/results/${filename}`;
};

// Get full backend URL for images
export const getFullImageUrl = (filename) => {
    return `${config.baseURL}/results/${filename}`;
};

// Set authentication token
export const setAuthToken = (token) => {
    if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axiosInstance.defaults.headers.common['Authorization'];
    }
};

// Clear authentication token
export const clearAuthToken = () => {
    delete axiosInstance.defaults.headers.common['Authorization'];
};

// Cancel all pending requests
export const cancelAllRequests = (reason = 'Requests cancelled by user') => {
    requestQueue.forEach((controller, requestId) => {
        controller.abort(reason);
        requestQueue.delete(requestId);
    });
};

// Create abort controller for request cancellation
export const createAbortController = () => {
    return new AbortController();
};

// Check if server is reachable
export const checkServerConnection = async () => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        await axiosInstance.get('/health', { signal: controller.signal });
        clearTimeout(timeoutId);
        return true;
    } catch (error) {
        alert('error', error);
        return false;
    }
};

// Get base URL
export const getBaseUrl = () => config.baseURL;

// Update base URL (useful for switching environments)
export const setBaseUrl = (newUrl) => {
    config.baseURL = newUrl;
    axiosInstance.defaults.baseURL = newUrl;
};

// Download file helper
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

// Validate image file
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

// Batch validate images
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

// Export default object with all functions
const apiService = {
    request,
    healthCheck,
    analyzeImage,
    batchAnalyze,
    getAnnotatedImageUrl,
    getFullImageUrl,
    setAuthToken,
    clearAuthToken,
    cancelAllRequests,
    createAbortController,
    checkServerConnection,
    getBaseUrl,
    setBaseUrl,
    downloadFile,
    validateImageFile,
    validateImageFiles,
};

export default apiService;