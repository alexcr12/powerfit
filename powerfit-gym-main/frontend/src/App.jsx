import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext'; // 🔥 Importas el nuevo
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <ThemeProvider> {/* 🔥 Lo envuelves aquí */}
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}