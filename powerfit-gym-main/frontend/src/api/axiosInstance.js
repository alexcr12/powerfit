import axios from 'axios';
import { logger } from '../utils/logger';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

api.interceptors.request.use(
  (config) => {
    const method = (config.method || 'GET').toUpperCase();
    const url = config.url || '';

   
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    logger.info('API_REQUEST', `${method} ${url}`, {
      params: config.params,
      data: config.data,
    });

    return config;
  },
  (error) => {
    logger.error('API_REQUEST_ERROR', 'Error al preparar la solicitud HTTP', {
      mensaje: error.message,
    });
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const method = (response.config.method || 'GET').toUpperCase();
    const url = response.config.url || '';
    
    logger.info('API_RESPONSE', `${method} ${url} [${response.status}]`, {
      status: response.status,
      itemsCount: Array.isArray(response.data) ? response.data.length : undefined,
    });

    return response;
  },
  (error) => {
    const config = error.config || {};
    const method = (config.method || 'GET').toUpperCase();
    const url = config.url || '';
    const status = error.response ? error.response.status : 'ERR_NETWORK';

    
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('rol');
      localStorage.removeItem('nombre');
      
    }

    logger.error('API_RESPONSE_ERROR', `Fallo ${method} ${url} [${status}]`, {
      status,
      mensaje: error.message,
      respuesta: error.response?.data,
    });

    return Promise.reject(error);
  }
);

export default api;