import axios from 'axios';

// Vite env değişkenlerinden API URL'ini alıyoruz
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // HttpOnly cookie (refresh token) için gerekli
});

// Her istekte Access Token'ı header'a ekle
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Hata yönetimi (Opsiyonel: 401 hatasında otomatik logout eklenebilir)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);