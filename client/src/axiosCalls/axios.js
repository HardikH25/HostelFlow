import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` : 'http://localhost:5005/api');

export const axiosInstance = axios.create({
    baseURL: apiUrl,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

export default axiosInstance;
