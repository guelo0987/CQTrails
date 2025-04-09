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
            
            console.log('Login response from server:', response.status);
            console.log('Login response data (raw):', response.data);
            console.log('Login response data structure:', {
                token: !!response.data.token,
                user: response.data.user ? typeof response.data.user : 'missing',
                role: response.data.role,
                dataKeys: Object.keys(response.data)
            });

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
        try {
            const userStr = window.localStorage.getItem('user');
            const token = window.localStorage.getItem('token');
            const auth = window.localStorage.getItem('auth');
            
            console.log('Getting current user, auth state:', auth);
            console.log('Token exists:', !!token);
            
            if (!userStr || !token) {
                console.log('Missing user data or token in localStorage');
                return null;
            }
            
            try {
                const userData = JSON.parse(userStr);
                console.log('User data retrieved:', userData.idUsuario ? `ID: ${userData.idUsuario}` : 'No ID found');
                return userData;
            } catch (e) {
                console.error('Error parsing user data from localStorage:', e);
                
                // Try to clear and reset based on token
                if (token && auth === 'true') {
                    console.log('Attempting to recover user session via token');
                    // In a real app, you might try to refresh the user data using the token
                    // But for now, we'll just clear the invalid data
                    localStorage.removeItem('user');
                }
                return null;
            }
        } catch (e) {
            console.error('Unexpected error in getCurrentUser:', e);
            return null;
        }
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
        try {
            // Ensure all data is valid before setting
            if (!data.token) {
                console.error('Missing token in auth data');
                throw new Error('Token de autenticación faltante');
            }
            
            // Extract user data or create default if missing
            let userData = data.user || {};
            
            // Log the raw user data
            console.log('Raw user data from server:', userData);
            
            // Extract user ID from token if it's missing in user data
            if (!userData.idUsuario) {
                try {
                    // Decode JWT token to see if it contains the ID
                    const base64Url = data.token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const payload = JSON.parse(window.atob(base64));
                    
                    // Check if the payload contains an Id claim
                    if (payload.Id) {
                        console.log('Extracted user ID from token:', payload.Id);
                        userData = {
                            ...userData,
                            idUsuario: parseInt(payload.Id)
                        };
                    }
                } catch (tokenError) {
                    console.error('Error extracting user ID from token:', tokenError);
                }
            }
            
            // If we still don't have a user ID, check if there's anything in the user data that looks like an ID
            if (!userData.idUsuario && userData.email) {
                // This is a fallback - we'll at least store what we have
                console.log('Creating user object with available data');
            }
            
            // Save the data even if user ID is missing - better than nothing
            window.localStorage.setItem('token', data.token);
            window.localStorage.setItem('user', JSON.stringify(userData));
            window.localStorage.setItem('role', data.role || 'Cliente');
            window.localStorage.setItem('auth', 'true');
            
            // Verify the data was saved correctly
            const savedUser = window.localStorage.getItem('user');
            const savedToken = window.localStorage.getItem('token');
            const savedAuth = window.localStorage.getItem('auth');
            
            console.log('Auth state after setting:', savedAuth);
            console.log('User data verification:', savedUser);
            console.log('Token verification:', savedToken ? 'Token saved' : 'Token not saved');
            
            if (!savedUser || !savedToken || savedAuth !== 'true') {
                console.error('Failed to save auth data to localStorage');
                throw new Error('Error al guardar los datos de autenticación');
            }
            
            return true;
        } catch (error) {
            console.error('Error setting auth data:', error);
            throw error;
        }
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