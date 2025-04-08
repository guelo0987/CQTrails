import axios from 'axios';
import { logins } from '../Services/AuthService';
import { isTokenExpired } from '../Utils/tokenUtils';
import { notificationService } from '../Utils/notificationService';

// Crear una instancia de axios
const axiosInstance = axios.create();

// Agregar un interceptor para verificar el token antes de cada solicitud
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Verificar si el token ha expirado
    if (token && isTokenExpired(token)) {
      console.log('Token expirado. Cerrando sesión...');
      logins.handleLogout();
      // Rechazar la solicitud
      return Promise.reject(new Error('Token expirado'));
    }
    
    // Continuar con la solicitud
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para manejar errores
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Manejar error 401 (Unauthorized)
      if (error.response.status === 401) {
        console.log('Sesión expirada. Cerrando sesión...');
        logins.handleLogout();
      }
      
      // Manejar error 403 (Forbidden)
      if (error.response.status === 403) {
        const forbiddenMessage = 'No tienes permiso';
        
        // Mostrar notificación de error usando el servicio
        notificationService.showError(forbiddenMessage);
        
        // Modificar el mensaje de error
        error.message = forbiddenMessage;
        error.customMessage = forbiddenMessage;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 