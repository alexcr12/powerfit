import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logger } from '../utils/logger';

export default function RoleRoute({ allowedRoles = [], children }) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.rol)) {
    logger.warn('RBAC_FORBIDDEN', 'Acceso denegado por rol insuficiente', {
      usuario: user?.nombre,
      rolUsuario: user?.rol,
      rolesRequeridos: allowedRoles,
    });
    return <Navigate to="/403" replace />;
  }

  return children;
}
