import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { XIcon, Eye, EyeOff } from "lucide-react";
import "../Estilos/auth.css";
import logo from "../Imagenes/Logo.png";
import { authService } from "../Services/AuthService.ts";
import { notificationService } from "../Utils/notificationService.ts";

function LoginPopUp({ isOpen, onClose, onForgotPassword, onLoginSuccess, redirectAfterLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    
    // Validación email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Validación contraseña
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }

    // Limpiar error general de login
    if (loginError) {
      setLoginError("");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      setLoginError("");
      
      try {
        const loginData = {
          email: formData.email,
          passwordHash: formData.password
        };
        
        
        
        const result = await authService.login(loginData);
        
        // Ensure user data is set correctly
        
        
        // Small delay to ensure localStorage is updated
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verify that user data is now available in localStorage
        const userData = authService.getCurrentUser();
        if (!userData || !userData.idUsuario) {
          console.error("User data not properly stored after login");
          throw new Error("Error en la inicialización de sesión. Por favor, intente nuevamente.");
        }
        
        // Mostrar notificación de éxito
        notificationService.auth.loginSuccess();
        
        // Cerrar el popup
        onClose();
        
        // Si existe un callback de login exitoso, ejecutarlo
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        
        // Redireccionar a la página especificada o a la página principal autenticada
        if (redirectAfterLogin) {
          navigate(redirectAfterLogin);
        } else {
          navigate("/home-auth");
        }
      } catch (error) {
        console.error("Error al iniciar sesión:", error);
        
        if (error.response && error.response.data && error.response.data.message) {
          setLoginError(error.response.data.message);
        } else if (error.response && error.response.data) {
          // Manejar errores de validación que puedan venir en diferentes formatos
          const errMsg = typeof error.response.data === 'string' 
            ? error.response.data 
            : 'Credenciales inválidas. Por favor, verifica tu email y contraseña.';
          setLoginError(errMsg);
        } else {
          setLoginError(error.message || "Error al iniciar sesión. Por favor, intente de nuevo.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="popup-overlay">
      <div className="auth-container">
        <div className="auth-background">
          <button className="close-button" onClick={onClose}>
            <XIcon size={25} />
          </button>

          <img className="auth-logo" alt="CQ TRAILS Logo" src={logo} />

          <div className="auth-card">
            <h2 className="auth-title">Iniciar Sesión</h2>

            <form onSubmit={handleLogin}>
              {loginError && (
                <div className="error-banner">
                  {loginError}
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input 
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Dirección de correo" 
                  disabled={isLoading}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <div className="password-input-container">
                  <input 
                    className={`form-input ${errors.password ? 'input-error' : ''}`}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Tu contraseña" 
                    disabled={isLoading}
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <button 
                type="submit" 
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Ingresar"}
              </button>
            </form>

            <div className="login-link-container">
              <p className="forgot-password-text">¿Olvidaste tu Contraseña?</p>
              <button 
                className="forgot-password-link" 
                onClick={onForgotPassword}
                disabled={isLoading}
              >
                Recuperar Contraseña
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPopUp;

