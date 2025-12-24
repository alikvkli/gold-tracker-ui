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
        }

        if (encryptionKey) {
            config.headers['X-Encryption-Key'] = encryptionKey;
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
        return Promise.reject(error);
    }
);

export default api;
