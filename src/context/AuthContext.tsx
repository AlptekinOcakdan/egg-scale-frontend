import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

interface User {
    id: string;
    email: string;
    studentNo: string;
    NFCId: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string) => Promise<void>;
    verifyOtp: (email: string, otpCode: string) => Promise<void>;
    register: (data: { studentNo: string; email: string; NFCId: string }) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Sayfa yenilendiğinde kullanıcıyı hatırlamak için (Token varsa)
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data);
                } catch (error) {
                    console.error("Session expired", error);
                    logout();
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email: string) => {
        // Backend: Sadece mail gönderir, token dönmez.
        await api.post('/auth/login', { email });
    };

    const register = async (data: { studentNo: string; email: string; NFCId: string }) => {
        await api.post('/auth/register', data);
    };

    const verifyOtp = async (email: string, otpCode: string) => {
        const res = await api.post('/auth/verify-otp', { email, otpCode });
        const { accessToken } = res.data;

        // Token'ı kaydet
        localStorage.setItem('accessToken', accessToken);

        // Kullanıcı bilgisini çek
        const userRes = await api.get('/auth/me');
        setUser(userRes.data);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch(err) {
            console.log(err);
        }
        localStorage.removeItem('accessToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, verifyOtp, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};