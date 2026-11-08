import React, { createContext, useContext, useState } from 'react';
import api from '../api/axiosInstance';
import { logger } from '../utils/logger';
import { ROLES } from '../constants/roles';

const AuthContext = createContext(null);
const USER_STORAGE_KEY = 'powerfit_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);

    try {
      // 🔥 1. Llamamos al backend real (Spring Boot) para obtener el JWT
      const response = await api.post('/auth/login', { 
        email: email.trim().toLowerCase(), 
        password 
      });

      const { token, nombre, rol } = response.data;

      // 🔥 2. Guardamos el Token en el localStorage para Axios
      localStorage.setItem('token', token);

      // 3. Armamos la sesión del usuario
      const sessionUser = {
        nombre,
        email,
        rol,
      };

      setUser(sessionUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionUser));

      logger.info('AUTH_LOGIN', `Sesión iniciada con JWT por ${nombre} (${rol})`);

      return { success: true, user: sessionUser };

    } catch (err) {
      const errorMsg = err.response?.data?.mensaje || 'Credenciales incorrectas o error de conexión.';
      setAuthError(errorMsg);
      logger.warn('AUTH_LOGIN', 'Intento de login fallido', { email, error: errorMsg });
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (user) {
      logger.info('AUTH_LOGOUT', `Cierre de sesión de ${user.nombre}`);
    }
    setUser(null);
    // 🔥 Limpiamos TODOS los datos de sesión, incluyendo el Token
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('nombre');
  };

  const isAdmin = user?.rol === ROLES.ADMIN;
  const isStaff = user?.rol === ROLES.STAFF;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isStaff,
        loading,
        authError,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
