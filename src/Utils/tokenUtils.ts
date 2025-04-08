// Función para verificar si el token ha expirado
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  
  try {
    // Decodificar el token (la parte del payload)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    // Verificar la expiración
    const expTime = payload.exp * 1000; // Convertir a milisegundos
    return Date.now() >= expTime;
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return true; // Si hay error, considerar que el token ha expirado
  }
};
