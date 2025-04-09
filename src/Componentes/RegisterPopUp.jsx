import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { XIcon, Eye, EyeOff } from "lucide-react"
import "../Estilos/auth.css"
import logo from "../Imagenes/Logo.svg"
import { authService } from "../Services/AuthService.ts"
import { notificationService } from "../Utils/notificationService.ts"

function RegisterPopUp({ isOpen, onClose, onSwitchToLogin, onRegisterSuccess }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    phone: "",
    email: "",
    password: ""
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [registerError, setRegisterError] = useState("")

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors = {}
    
    // Validación nombre completo
    if (!formData.fullName.trim()) {
      newErrors.fullName = "El nombre es requerido"
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = "El nombre debe tener al menos 3 caracteres"
    }

    // Validación nombre de empresa
    if (!formData.companyName.trim()) {
      newErrors.companyName = "El nombre de la empresa es requerido"
    }

    // Validación teléfono
    const phoneRegex = /^\d{10}$/
    if (!formData.phone) {
      newErrors.phone = "El teléfono es requerido"
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Ingrese un número de teléfono válido (10 dígitos)"
    }

    // Validación email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = "El email es requerido"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    // Validación contraseña
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
    // Limpiar error general
    if (registerError) {
      setRegisterError("")
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      setIsLoading(true)
      setRegisterError("")
      
      try {
        // Dividir el nombre completo en nombre y apellido
        const nameParts = formData.fullName.trim().split(" ")
        const nombre = nameParts[0]
        const apellido = nameParts.slice(1).join(" ") || ""
        
        // Preparar datos para registro exactamente como los espera la API
        const userData = {
          email: formData.email,
          PasswordHash: formData.password,
          nombre: nombre,
          apellido: apellido,
          nombreEmpresa: formData.companyName,
          contactoEmail: formData.email,
          contactoTelefono: formData.phone
        }
        
        console.log('Sending registration data:', JSON.stringify(userData, null, 2))
        
        // Enviar solicitud de registro
        const response = await authService.register(userData)
        console.log('Registration successful:', response)
        
        // Mostrar notificación de éxito
        notificationService.auth.registerSuccess()
        
        // Cerrar el popup y notificar registro exitoso
        onClose()
        
        // Notificar registro exitoso si hay un callback
        if (onRegisterSuccess) {
          onRegisterSuccess()
        }
        
        // Verificar que el estado de autenticación esté configurado correctamente
        console.log('Auth state after registration:', localStorage.getItem('auth'))
        
        // Asegurar que el estado de autenticación esté establecido
        if (!localStorage.getItem('auth')) {
          localStorage.setItem('auth', 'true')
        }
        
        // Navegar a la página principal autenticada
        setTimeout(() => {
          console.log('Redirecting to home-auth page')
          navigate("/home-auth")
        }, 100) // Pequeño retraso para asegurar que el estado se haya actualizado
      } catch (error) {
        console.error("Error en registro:", error)
        
        if (error.response && error.response.data && error.response.data.message) {
          setRegisterError(error.response.data.message)
        } else if (error.response && error.response.data && error.response.data.errors) {
          // API validation errors
          const errorMsg = Object.values(error.response.data.errors)
            .flat()
            .join(', ')
          setRegisterError(`Errores de validación: ${errorMsg}`)
        } else if (error.response && error.response.data) {
          // Manejar errores de validación que puedan venir en diferentes formatos
          const errMsg = typeof error.response.data === 'string' 
            ? error.response.data 
            : 'Error al crear la cuenta. Por favor, verificar los datos.'
          setRegisterError(errMsg)
        } else {
          setRegisterError("Error al crear la cuenta. Por favor, intente de nuevo.")
        }
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="popup-overlay">
      <div className="auth-container">
        <div className="auth-background">
          <button className="close-button" onClick={onClose}>
            <XIcon size={25} />
          </button>

          <img className="auth-logo" alt="CQ TRAILS Logo" src={logo} />

          <div className="auth-card">
            <h2 className="auth-title">Crear Cuenta</h2>
            <p className="auth-subtitle">Completa tus datos para comenzar</p>

            <form onSubmit={handleRegister}>
              {registerError && (
                <div className="error-banner">
                  {registerError}
                </div>
              )}
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  <input 
                    className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                    type="text" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Tu nombre completo"
                    disabled={isLoading}
                  />
                  {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Nombre de Empresa</label>
                  <input 
                    className={`form-input ${errors.companyName ? 'input-error' : ''}`}
                    type="text" 
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Nombre de tu empresa"
                    disabled={isLoading}
                  />
                  {errors.companyName && <span className="error-message">{errors.companyName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input 
                    className={`form-input ${errors.phone ? 'input-error' : ''}`}
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Número de teléfono"
                    disabled={isLoading}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

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
                      placeholder="Crea una contraseña"
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
              </div>

              <button 
                type="submit" 
                className="auth-button"
                disabled={isLoading}
              >
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </button>
            </form>

            <div className="auth-footer">
              <p>¿Ya tienes cuenta?</p>
              <button 
                className="auth-link" 
                onClick={onSwitchToLogin}
                disabled={isLoading}
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPopUp
