import axios from 'axios';
import { store } from '../store';

const api = axios.create({
    baseURL: 'https://altin.kiracilarim.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the Token and Encryption Key
api.interceptors.request.use(
    (config) => {
        const state = store.getState();
        const token = state.app.token;
        const encryptionKey = state.app.encryptionKey;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('API Request: Token not found in store');
        }

        if (encryptionKey) {
            config.headers['X-Encryption-Key'] = encryptionKey;
        }

        // Debug log for DELETE and PUT requests
        if (config.method === 'delete' || config.method === 'put') {
            console.log('API Request:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                hasToken: !!token,
                hasEncryptionKey: !!encryptionKey,
                headers: {
                    Authorization: config.headers.Authorization ? 'Bearer ***' : 'Missing',
                    'X-Encryption-Key': encryptionKey ? '***' : 'Missing'
                }
            });
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
            // Optional: Auto logout on 401
            // store.dispatch(logout());
        }
        
        // Log 403 errors in detail
        if (error.response?.status === 403) {
            console.error('403 Forbidden Error:', {
                url: error.config?.url,
                method: error.config?.method,
                status: error.response.status,
                data: error.response.data,
                headers: error.config?.headers
            });
        }
        
        return Promise.reject(error);
    }
);

export default api;
