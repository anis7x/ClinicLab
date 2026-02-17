// ClinicLab API Client
// Centralized HTTP client with JWT management

const API_BASE = '/api';

class ApiClient {
    constructor() {
        this.token = localStorage.getItem('cliniclab_token');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('cliniclab_token', token);
        } else {
            localStorage.removeItem('cliniclab_token');
        }
    }

    getToken() {
        return this.token;
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new ApiError(data.error || 'حدث خطأ غير متوقع', response.status);
        }

        return data;
    }

    // --- Auth ---
    async registerPatient(data) {
        const result = await this.request('/auth/register/patient', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        this.setToken(result.token);
        return result;
    }

    async registerProfessional(data) {
        const result = await this.request('/auth/register/professional', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        this.setToken(result.token);
        return result;
    }

    async login(email, password) {
        const result = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        this.setToken(result.token);
        return result;
    }

    async getMe() {
        return this.request('/auth/me');
    }

    // --- Providers ---
    async searchProviders(wilaya, service, sort = 'rating') {
        const params = new URLSearchParams();
        if (wilaya) params.set('wilaya', wilaya);
        if (service) params.set('service', service);
        if (sort) params.set('sort', sort);
        return this.request(`/providers/search?${params.toString()}`);
    }

    async getProvider(id) {
        return this.request(`/providers/${id}`);
    }

    // --- Data ---
    async getWilayas() {
        return this.request('/wilayas');
    }

    async getServices() {
        return this.request('/services');
    }

    // --- Logout ---
    logout() {
        this.setToken(null);
    }
}

class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }
}

export const api = new ApiClient();
export { ApiError };
