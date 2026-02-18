// ClinicLab API Client
// Centralized HTTP client with JWT management + 2FA support

const API_BASE = '/api';

class ApiClient {
    constructor() {
        this.token = localStorage.getItem('cliniclab_token');
        this.deviceToken = localStorage.getItem('cliniclab_device_token');
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

    setDeviceToken(token) {
        this.deviceToken = token;
        if (token) {
            localStorage.setItem('cliniclab_device_token', token);
        } else {
            localStorage.removeItem('cliniclab_device_token');
        }
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

        // Send trusted device token for 2FA bypass
        if (this.deviceToken) {
            headers['X-Device-Token'] = this.deviceToken;
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        // Capture device token from response headers
        const newDeviceToken = response.headers.get('X-Device-Token');
        if (newDeviceToken) {
            this.setDeviceToken(newDeviceToken);
        }

        const data = await response.json();

        if (!response.ok) {
            throw new ApiError(data.error || 'حدث خطأ غير متوقع', response.status, data);
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
        // Only set token if not 2FA required
        if (result.token && !result.requires_2fa) {
            this.setToken(result.token);
        }
        return result;
    }

    async setup2FA(code) {
        return this.request('/auth/setup-2fa', {
            method: 'POST',
            body: JSON.stringify({ code }),
        });
    }

    async verify2FA(tempToken, code, trustDevice = false, deviceName = '') {
        const result = await this.request('/auth/verify-2fa', {
            method: 'POST',
            body: JSON.stringify({
                temp_token: tempToken,
                code,
                trust_device: trustDevice,
                device_name: deviceName,
            }),
        });
        if (result.token) {
            this.setToken(result.token);
        }
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
    constructor(message, status, data = {}) {
        super(message);
        this.status = status;
        this.data = data;
        this.name = 'ApiError';
    }
}

export const api = new ApiClient();
export { ApiError };
