const API_BASE_URL = 'http://localhost:5000';

class AdminApiService {
    constructor() {
        this.token = localStorage.getItem('wastespotter_admin_token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('wastespotter_admin_token', token);
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem('wastespotter_admin_token');
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('Admin API request failed:', error);
            throw error;
        }
    }

    // Auth methods
    async login(credentials) {
        const result = await this.request('/admin/login', {
            method: 'POST',
            body: credentials
        });

        this.setToken(result.access_token);
        return result;
    }

    // Report methods
    async getReports(filters = {}) {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });

        return this.request(`/api/admin/reports?${params}`);
    }

    async updateReportStatus(reportId, status) {
        return this.request(`/api/admin/reports/${reportId}`, {
            method: 'PUT',
            body: { status }
        });
    }

    async deleteReport(reportId) {
        return this.request(`/api/admin/reports/${reportId}`, {
            method: 'DELETE'
        });
    }

    async getStats() {
        return this.request('/api/admin/stats');
    }
}

export default new AdminApiService();