import { API_BASE_URL, endpoints } from '../API/Endpoints';
import axios from 'axios';

class Login {
    private baseURL: string;

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    async login(credentials: { email: string; password: string }) {
        try {
            const response = await axios.post(`${this.baseURL}${endpoints.auth.login}`, {
                mail: credentials.email,
                password: credentials.password
            });

            const data = response.data;
            
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('role', data.role);
                
                // Decodificar el token para obtener la expiración
                const base64Url = data.token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(window.atob(base64));
                
                // Calcular el tiempo hasta la expiración (en milisegundos)
                const expiresIn = (payload.exp * 1000) - Date.now();
                
                // Configurar un temporizador para cerrar la sesión cuando expire el token
                setTimeout(() => {
                    console.log('Token expirado. Cerrando sesión automáticamente...');
                    this.handleLogout();
                }, expiresIn);
            }

            return data;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        window.location.href = '/login';
    }
}

export const logins = new Login();