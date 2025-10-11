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

    async simulateDelay(ms = 1000) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Mock login
    async login(credentials) {
        await this.simulateDelay(1500);

        
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

    
    }

    


const adminApi = new AdminApiService();

export default adminApi;