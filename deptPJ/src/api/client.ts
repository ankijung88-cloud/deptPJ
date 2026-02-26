import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || ''; // Use empty string for relative paths in production (leverages Vercel proxy)

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the JWT token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized (e.g., redirect to login or clear token)
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
        }
        return Promise.reject(error);
    }
);

export default api;
