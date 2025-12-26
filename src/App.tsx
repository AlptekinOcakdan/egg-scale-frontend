import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from "@/components/ui/sonner"; // Sonner Toaster importu

// Sayfalar
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import DashboardPage from './pages/DashboardPage';

// Koruma Bileşeni
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Yükleniyor...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

// Zaten giriş yapmışsa login'e girmesin
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return <div>...</div>;

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Rotalar */}
                    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
                    <Route path="/verify-otp" element={<PublicRoute><VerifyOtpPage /></PublicRoute>} />

                    {/* Protected Rotalar */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Varsayılan yönlendirme */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<div>404 - Sayfa Bulunamadı</div>} />
                </Routes>
            </Router>
            {/* Toaster bileşeni burada global olarak tanımlanır */}
            <Toaster position="top-right" richColors />
        </AuthProvider>
    );
}

export default App;