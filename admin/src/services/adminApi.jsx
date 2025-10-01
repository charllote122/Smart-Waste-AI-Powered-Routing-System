const API_BASE_URL = 'http://localhost:5000';

// Mock data
const mockReports = [
    {
        id: 1,
        county: "Nairobi",
        timestamp: new Date('2024-01-15T10:30:00'),
        type: "automatic",
        status: "pending",
        image: "https://images.unsplash.com/photo-1562077980-73a9c0ff0d6f?w=400",
        location: { lat: -1.286389, lng: 36.817223 },
        analysis: {
            wasteType: "Plastic Waste",
            urgency: "Critical",
            fillLevel: 85,
            confidence: 92,
            detectedItems: ["plastic bottles", "packaging", "containers"],
            recommendations: ["Immediate cleanup required", "High pollution risk area"]
        }
    },
    {
        id: 2,
        county: "Mombasa",
        timestamp: new Date('2024-01-14T14:20:00'),
        type: "manual",
        status: "in-progress",
        image: "https://images.unsplash.com/photo-1587334894132-8065059965e9?w=400",
        location: { lat: -4.043477, lng: 39.668206 },
        analysis: {
            wasteType: "Organic Waste",
            urgency: "Medium",
            fillLevel: 60,
            confidence: 88,
            detectedItems: ["food waste", "vegetables", "fruits"],
            recommendations: ["Schedule weekly collection", "Monitor decomposition"]
        }
    },
    {
        id: 3,
        county: "Kisumu",
        timestamp: new Date('2024-01-13T09:15:00'),
        type: "automatic",
        status: "completed",
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400",
        location: { lat: -0.102210, lng: 34.761711 },
        analysis: {
            wasteType: "Mixed Waste",
            urgency: "High",
            fillLevel: 75,
            confidence: 95,
            detectedItems: ["plastic", "paper", "metal", "glass"],
            recommendations: ["Segregation needed", "Recycling potential high"]
        }
    },
    {
        id: 4,
        county: "Nakuru",
        timestamp: new Date('2024-01-12T16:45:00'),
        type: "manual",
        status: "pending",
        image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b974?w=400",
        location: { lat: -0.303099, lng: 36.080026 },
        analysis: {
            wasteType: "Construction Waste",
            urgency: "Low",
            fillLevel: 40,
            confidence: 78,
            detectedItems: ["concrete", "bricks", "wood"],
            recommendations: ["Schedule monthly collection", "Low priority"]
        }
    },
    {
        id: 5,
        county: "Eldoret",
        timestamp: new Date('2024-01-11T11:20:00'),
        type: "automatic",
        status: "in-progress",
        image: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=400",
        location: { lat: 0.5143, lng: 35.2698 },
        analysis: {
            wasteType: "Electronic Waste",
            urgency: "High",
            fillLevel: 70,
            confidence: 89,
            detectedItems: ["circuit boards", "batteries", "wires"],
            recommendations: ["Hazardous materials present", "Special disposal required"]
        }
    }
];

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

    async simulateDelay(ms = 1000) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Mock login - no backend needed!
    async login(credentials) {
        await this.simulateDelay(1500);

        // Hardcoded credentials for development
        if (credentials.email === "admin@wastespotter.com" && credentials.password === "admin123") {
            const mockToken = "mock_jwt_token_" + Date.now();
            this.setToken(mockToken);

            return {
                user: {
                    id: 1,
                    name: "System Administrator",
                    email: credentials.email,
                    role: "super_admin"
                },
                access_token: mockToken
            };
        } else {
            throw new Error("Invalid credentials. Use: admin@wastespotter.com / admin123");
        }
    }

    // Mock getReports
    async getReports(filters = {}) {
        await this.simulateDelay(800);

        let filteredReports = [...mockReports];

        // Apply filters
        if (filters.status && filters.status !== 'all') {
            filteredReports = filteredReports.filter(report => report.status === filters.status);
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filteredReports = filteredReports.filter(report =>
                report.county.toLowerCase().includes(searchTerm) ||
                report.analysis.wasteType.toLowerCase().includes(searchTerm)
            );
        }

        return {
            reports: filteredReports,
            total: filteredReports.length,
            page: 1,
            totalPages: 1
        };
    }

    // Mock getStats
    async getStats() {
        await this.simulateDelay(600);

        const total = mockReports.length;
        const pending = mockReports.filter(r => r.status === 'pending').length;
        const inProgress = mockReports.filter(r => r.status === 'in-progress').length;
        const completed = mockReports.filter(r => r.status === 'completed').length;
        const critical = mockReports.filter(r => r.analysis.urgency === 'Critical').length;

        return {
            total_reports: total,
            pending_reports: pending,
            in_progress_reports: inProgress,
            completed_reports: completed,
            critical_reports: critical,
            users_count: 847,
            counties_covered: 12
        };
    }

    // Mock updateReportStatus
    async updateReportStatus(reportId, status) {
        await this.simulateDelay(500);

        const report = mockReports.find(r => r.id === reportId);
        if (!report) {
            throw new Error(`Report with ID ${reportId} not found`);
        }

        // In a real app, this would update the backend
        // For mock, we just simulate success
        console.log(`Mock: Updated report ${reportId} status to ${status}`);

        return {
            success: true,
            message: `Report status updated to ${status}`
        };
    }

    // Mock deleteReport
    async deleteReport(reportId) {
        await this.simulateDelay(500);

        const reportIndex = mockReports.findIndex(r => r.id === reportId);
        if (reportIndex === -1) {
            throw new Error(`Report with ID ${reportId} not found`);
        }

        // In a real app, this would delete from backend
        // For mock, we just simulate success
        console.log(`Mock: Deleted report ${reportId}`);

        return {
            success: true,
            message: 'Report deleted successfully'
        };
    }
}

export default new AdminApiService();