import { useState } from "react";
import { XIcon } from "lucide-react";
import '../Estilos/auth.css';
import logo from "../Imagenes/Logo.svg";
import { authService } from "../Services/AuthService.ts";

function ForgotPasswordPopUp({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError("El email es requerido");
      return false;
    } else if (!emailRegex.test(email)) {
      setError("Email inválido");
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateEmail()) {
      setIsLoading(true);
      
      try {
        await authService.forgotPassword(email);
        setMessage("Se ha enviado un correo para restablecer tu contraseña");
        setEmail("");
      } catch (error) {
        console.error("Error al solicitar restablecimiento de contraseña:", error);
        
        if (error.response && error.response.data && error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError("Error al enviar el correo. Por favor, intenta de nuevo.");
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

          <img
            className="auth-logo"
            alt="CQ TRAILS Logo"
            src={logo}
          />

          <div className="auth-card">
            <div>
              <h2 className="auth-title">¿Olvidaste tu contraseña?</h2>
              <p className="auth-subtitle">
                Ingresa tu correo electrónico para restablecer tu contraseña
              </p>

              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="error-banner">
                    {error}
                  </div>
                )}
                
                {message && (
                  <div className="success-banner">
                    {message}
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label">
                    Correo Electrónico
                  </label>
                  <input
                    className={`form-input ${error ? 'input-error' : ''}`}
                    placeholder="Dirección de correo electrónico"
                    type="email"
                    value={email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <button 
                  type="submit" 
                  className="login-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Siguiente"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPopUp; 