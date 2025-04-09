import { API_BASE_URL, endpoints } from '../API/Endpoints.ts';
import axios from 'axios';
import { notificationService } from '../Utils/notificationService.ts';

interface LoginCredentials {
    email: string;
    passwordHash: string;
}

interface RegisterData {
    email: string;
    PasswordHash: string; // Changed to match API expectations (uppercase P)
    nombre: string;
    apellido: string;
    nombreEmpresa: string;
    contactoEmail: string;
    contactoTelefono: string;
}

class AuthService {
    private baseURL: string;

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /**
     * Login user with email and password
     * @param credentials User credentials (email and password)
     * @returns Promise with authentication response
     */
    async login(credentials: LoginCredentials) {
        try {
            console.log('Received login credentials:', credentials);
            
            // Transform credentials to match API expectations
            const { passwordHash, ...otherData } = credentials;
            const loginData = {
                ...otherData,
                password: passwordHash // API expects 'password', not 'passwordHash'
            };
            
            console.log('Sending login request with:', loginData);
            
            const response = await axios.post(`${this.baseURL}${endpoints.auth.login}`, loginData);

            const data = response.data;
            
            if (data.token) {
                // Store authentication data
                this.setAuthData(data);
                
                // Setup token expiration handler
                this.setupTokenExpirationHandler(data.token);
            }

            return data;
        } catch (error) {
            console.error('Error en login:', error);
            // Log additional error details if available
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
                console.error('Error response headers:', error.response.headers);
            }
            throw error;
        }
    }

    /**
     * Register a new user
     * @param userData User registration data
     * @returns Promise with registration response
     */
    async register(userData: RegisterData) {
        try {
            console.log('Sending registration request with:', JSON.stringify(userData, null, 2));
            console.log('API URL:', `${this.baseURL}${endpoints.auth.register}`);
            
            // Send the request to the registration endpoint with the data as is
            const response = await axios.post(`${this.baseURL}${endpoints.auth.register}`, userData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Registration response:', response.data);
            
            // Get the data from the response
            const data = response.data;
            
            // If the registration was successful and contains a token, set auth data
            if (data && data.token) {
                // Store authentication data
                this.setAuthData(data);
                
                // Setup token expiration handler
                this.setupTokenExpirationHandler(data.token);
            }
            
            return data;
        } catch (error) {
            console.error('Error en registro:', error);
            // Log additional error details if available
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
                console.error('Error response headers:', error.response.headers);
                
                // More detailed error logging
                if (error.response.data && error.response.data.errors) {
                    console.error('Validation errors:', error.response.data.errors);
                }
            }
            throw error;
        }
    }

    /**
     * Request password reset
     * @param email User email
     * @returns Promise with password reset response
     */
    async forgotPassword(email: string) {
        try {
            // For testing purposes, simulate a success response
            console.log('Password reset requested for:', email);
            
            // Return a mock successful response
            return {
                success: true,
                message: 'Correo de recuperación enviado'
            };
            
            /* Uncomment this when the API is ready
            const response = await axios.post(`${this.baseURL}api/Auth/forgotPassword`, { email });
            return response.data;
            */
        } catch (error) {
            console.error('Error en solicitud de restablecimiento de contraseña:', error);
            throw error;
        }
    }

    /**
     * Reset password with token
     * @param token Reset token
     * @param newPassword New password
     * @returns Promise with password reset response
     */
    async resetPassword(token: string, newPassword: string) {
        try {
            // For testing purposes
            console.log('Password reset with token:', token, 'and new password');
            
            // Return a mock successful response
            return {
                success: true,
                message: 'Contraseña actualizada exitosamente'
            };
            
            /* Uncomment this when the API is ready
            const response = await axios.post(`${this.baseURL}api/Auth/resetPassword`, {
                token,
                newPassword
            });
            return response.data;
            */
        } catch (error) {
            console.error('Error en restablecimiento de contraseña:', error);
            throw error;
        }
    }

    /**
     * Logout user and clear local storage
     */
    handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        localStorage.removeItem('auth');
        notificationService.auth.logoutSuccess();
        window.location.href = '/';
    }

    /**
     * Check if user is authenticated
     * @returns Boolean indicating if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    }

    /**
     * Get current user data
     * @returns User data object or null
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Get user role
     * @returns User role or null
     */
    getUserRole(): string | null {
        return localStorage.getItem('role');
    }

    /**
     * Get authentication token
     * @returns Auth token or null
     */
    getToken(): string | null {
        return localStorage.getItem('token');
    }

    /**
     * Store authentication data in localStorage
     * @param data Authentication response data
     */
    private setAuthData(data: any) {
        console.log('Setting auth data:', data);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('role', data.role);
        localStorage.setItem('auth', 'true');
        console.log('Auth state after setting:', localStorage.getItem('auth'));
    }

    /**
     * Setup token expiration handler
     * @param token JWT token
     */
    private setupTokenExpirationHandler(token: string) {
        try {
            // Decode JWT token to get expiration time
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            
            // Calculate time until expiration (in milliseconds)
            const expiresIn = (payload.exp * 1000) - Date.now();
            
            // Setup timer to auto logout when token expires
            setTimeout(() => {
                console.log('Token expirado. Cerrando sesión automáticamente...');
                this.handleLogout();
            }, expiresIn);
        } catch (error) {
            console.error('Error al configurar el manejador de expiración del token:', error);
        }
    }
}

export const authService = new AuthService();