import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logger } from '../utils/logger';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    logger.warn('ROUTER_PROTECTION', 'Acceso denegado: intento de acceso no autenticado', {
      rutaIntentada: location.pathname,
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
