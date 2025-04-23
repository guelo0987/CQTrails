import { useState } from "react";
import { XIcon } from "lucide-react";
import '../Estilos/auth.css';
import logo from "../Imagenes/Logo.svg";
import { authService } from "../Services/AuthService.ts";
import Swal from 'sweetalert2';

function ForgotPasswordPopUp({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateEmail()) {
      setIsLoading(true);
      
      try {
        const response = await authService.forgotPassword(email);
        
        if (response.Success) {
          // Clear the form and close it
          setEmail("");
          
          // Show success message with Swal
          Swal.fire({
            title: 'Correo enviado',
            text: response.Message || 'Si el correo existe en nuestro sistema, recibirás instrucciones para recuperar tu contraseña',
            icon: 'success',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#09A603'
          }).then(() => {
            onClose(); // Close the popup after showing success message
          });
        } else {
          setError(response.Message || "Ocurrió un error al procesar tu solicitud.");
        }
      } catch (error) {
        console.error("Error al solicitar restablecimiento de contraseña:", error);
        
        if (error.response && error.response.data && error.response.data.Message) {
          setError(error.response.data.Message);
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
                  {isLoading ? "Enviando..." : "Recuperar contraseña"}
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