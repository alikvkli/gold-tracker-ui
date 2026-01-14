import axios from 'axios';
import CryptoJS from 'crypto-js';
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
        const token = state.app.token?.trim(); // Trim whitespace

        // Priority: Header Key > Store Key
        const headerKey = config.headers['X-Encryption-Key'] as string;
        const storeKey = state.app.encryptionKey?.trim();
        const encryptionKey = headerKey || storeKey;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('API Request: Token not found in store');
        }

        if (encryptionKey) {
            config.headers['X-Encryption-Key'] = encryptionKey;

            // Encrypt Payload if it exists and is an object/array, BUT skip for specific endpoints
            const shouldEncrypt = config.url && !config.url.includes('/encryption/toggle') && !config.url.includes('/assets');

            if (shouldEncrypt && config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
                try {
                    const jsonPayload = JSON.stringify(config.data);
                    const encrypted = CryptoJS.AES.encrypt(jsonPayload, encryptionKey).toString();

                    config.data = { encrypted_payload: encrypted };
                    config.headers['X-Encrypted-Body'] = 'true';
                } catch (error) {
                    console.error('Payload encryption failed:', error);
                    // Decide whether to fail or send unencrypted. 
                    // Sending unencrypted might leak data, so preventing request might be safer, 
                    // but for resilience we might just log it. 
                    // Let's stick to safe failure? No, let's allow it but warn.
                }
            }
        }

        // Ensure Accept header is set
        if (!config.headers.Accept) {
            config.headers.Accept = 'application/json';
        }

        // Debug log for DELETE, PUT, and PATCH requests
        if (config.method === 'delete' || config.method === 'put' || config.method === 'patch') {
            const authHeader = config.headers.Authorization;
            const authHeaderStr = typeof authHeader === 'string' ? authHeader : String(authHeader || '');
            const tokenPreview = authHeaderStr ? (authHeaderStr.startsWith('Bearer ') ? `Bearer ${authHeaderStr.substring(7, 20)}...` : authHeaderStr.substring(0, 20) + '...') : 'Missing';

            console.log('API Request:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                hasToken: !!token,
                tokenLength: token?.length || 0,
                hasEncryptionKey: !!encryptionKey,
                headers: {
                    Authorization: tokenPreview,
                    'X-Encryption-Key': encryptionKey ? '***' : 'Missing',
                    'Content-Type': config.headers['Content-Type']
                },
                fullUrl: `${config.baseURL}${config.url}`
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
            const state = store.getState();
            const errorData = error.response.data;
            console.error('403 Forbidden Error - DETAILED:', {
                url: error.config?.url,
                method: error.config?.method?.toUpperCase(),
                status: error.response.status,
                statusText: error.response.statusText,
                responseData: errorData,
                responseDataString: JSON.stringify(errorData, null, 2),
                requestHeaders: {
                    Authorization: error.config?.headers?.Authorization ? 'Bearer ***' : 'Missing',
                    'X-Encryption-Key': error.config?.headers?.['X-Encryption-Key'] ? '***' : 'Missing',
                    'Content-Type': error.config?.headers?.['Content-Type'],
                    'Accept': error.config?.headers?.Accept
                },
                storeState: {
                    hasToken: !!state.app.token,
                    tokenLength: state.app.token?.length || 0,
                    tokenPreview: state.app.token ? `${state.app.token.substring(0, 10)}...${state.app.token.substring(state.app.token.length - 5)}` : 'No token',
                    hasUser: !!state.app.user,
                    userId: state.app.user?.user_id,
                    userEmail: state.app.user?.email,
                    hasEncryptionKey: !!state.app.encryptionKey,
                    login: state.app.login
                },
                fullErrorResponse: error.response
            });
        }

        return Promise.reject(error);
    }
);

export default api;
