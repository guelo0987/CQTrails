import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import "../Estilos/Header.css"
import logo from "../Imagenes/Logo.svg"
import LoginPopUp from "./LoginPopUp"
import RegisterPopUp from "./RegisterPopUp"
import ForgotPasswordPopUp from "./ForgotPasswordPopUp"
import { authService } from "../Services/AuthService.ts"

function Header({ onLoginClick }) {
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication status on component mount
  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated())
  }, [])

  const toggleDropdown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDropdownOpen(!dropdownOpen)
  }

  const closeDropdown = () => setDropdownOpen(false)

  const handleLoginClick = (redirectTo = null) => {
    if (onLoginClick) {
      onLoginClick()
      return
    }
    if (redirectTo) {
      setRedirectAfterLogin(redirectTo)
    }
    setIsLoginOpen(true)
    setIsRegisterOpen(false)
    setIsForgotPasswordOpen(false)
  }

  const handleRegisterClick = () => {
    setIsRegisterOpen(true)
    setIsLoginOpen(false)
    setIsForgotPasswordOpen(false)
  }

  const handleForgotPasswordClick = () => {
    setIsForgotPasswordOpen(true)
    setIsLoginOpen(false)
    setIsRegisterOpen(false)
  }

  const handleCloseLogin = () => {
    setIsLoginOpen(false)
    setRedirectAfterLogin(null)
  }

  const handleCloseRegister = () => setIsRegisterOpen(false)
  const handleCloseForgotPassword = () => setIsForgotPasswordOpen(false)

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    setIsLoginOpen(false)
    
    if (redirectAfterLogin) {
      navigate(redirectAfterLogin)
      setRedirectAfterLogin(null)
    }
  }

  const handleLogout = () => {
    authService.handleLogout()
    setIsAuthenticated(false)
  }

  const handleNavigation = (path, requiresAuth = false) => {
    if (requiresAuth && !isAuthenticated) {
      handleLoginClick(path)
      return
    }
    closeDropdown()
    navigate(path)
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown-container")) {
        closeDropdown()
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  return (
    <>
      <header className="cq-header">
        <div className="cq-header__container">
          <div className="cq-header__logo-wrapper">
            <Link to="/">
              <img src={logo} alt="CQ TRAILS" className="cq-header__logo" />
            </Link>
          </div>

          <div className="cq-header__nav-section">
            <nav className="cq-header__nav">
              <div className="cq-header__nav-links">
                <div className="cq-header__dropdown dropdown-container">
                  <button 
                    type="button" 
                    className="cq-header__nav-button" 
                    onClick={toggleDropdown}
                  >
                    Reservaciones
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`cq-header__dropdown-icon ${
                        dropdownOpen ? "cq-header__dropdown-icon--open" : ""
                      }`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  
                  {dropdownOpen && (
                    <div className="cq-header__dropdown-menu">
                      <button 
                        onClick={() => handleNavigation("/reservar")} 
                        className="cq-header__dropdown-item"
                      >
                        Reservar
                      </button>
                      <button 
                        onClick={() => handleNavigation("/historial", !isAuthenticated)} 
                        className="cq-header__dropdown-item"
                      >
                        Historial de Reservaciones
                      </button>
                    </div>
                  )}
                </div>

                <Link to="/contacto" className="cq-header__nav-button">
                  Contacto
                </Link>
              </div>
            </nav>

            <div className="cq-header__auth-buttons">
              {isAuthenticated ? (
                <>
                  <span className="cq-header__user-greeting">
                    Hola, {authService.getCurrentUser()?.nombre || 'Usuario'}
                  </span>
                  <button 
                    className="cq-header__auth-button cq-header__auth-button--logout" 
                    onClick={handleLogout}
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="cq-header__auth-button cq-header__auth-button--login" 
                    onClick={() => handleLoginClick()}
                  >
                    Iniciar Sesión
                  </button>
                  <button 
                    className="cq-header__auth-button cq-header__auth-button--register" 
                    onClick={handleRegisterClick}
                  >
                    Crear Cuenta
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {!onLoginClick && (
        <>
          <LoginPopUp 
            isOpen={isLoginOpen} 
            onClose={handleCloseLogin}
            onForgotPassword={handleForgotPasswordClick}
            redirectAfterLogin={redirectAfterLogin}
            onLoginSuccess={handleLoginSuccess}
          />

          <RegisterPopUp 
            isOpen={isRegisterOpen} 
            onClose={handleCloseRegister}
            onSwitchToLogin={handleLoginClick}
            onRegisterSuccess={handleLoginSuccess}
          />

          <ForgotPasswordPopUp 
            isOpen={isForgotPasswordOpen} 
            onClose={handleCloseForgotPassword}
          />
        </>
      )}
    </>
  )
}

export default Header


















