import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import "../Estilos/Header.css"
import logo from "../Imagenes/Logo.png"
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  // Check authentication status on component mount
  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated())
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
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

  // Desktop header
  const renderDesktopHeader = () => (
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
            <div className="cq-header__user-profile">
              <span className="cq-header__user-greeting">
                Hola, {authService.getCurrentUser()?.nombre || 'Usuario'}
              </span>
              <button 
                className="cq-header__auth-button cq-header__auth-button--logout" 
                onClick={handleLogout}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <button 
              className="cq-header__auth-button cq-header__auth-button--login" 
              onClick={() => handleLoginClick()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Iniciar Sesión</span>
            </button>
            <button 
              className="cq-header__auth-button cq-header__auth-button--register" 
              onClick={handleRegisterClick}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              <span>Crear Cuenta</span>
            </button>
          </>
        )}
      </div>
    </div>
  )

  // Mobile header
  const renderMobileHeader = () => (
    <div className="cq-header__nav-section">
      <div className="cq-header__nav-group">
        <nav className="cq-header__nav">
          <div className="cq-header__nav-links">
            <div className="cq-header__dropdown dropdown-container">
              <button 
                type="button" 
                className="cq-header__nav-button" 
                onClick={toggleDropdown}
              >
                Reservar
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
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
                    Historial
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
              <button 
                className="cq-header__auth-button cq-header__auth-button--icon" 
                onClick={handleLogout}
                title={`Cerrar sesión: ${authService.getCurrentUser()?.nombre || 'Usuario'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </>
          ) : (
            <>
              <button 
                className="cq-header__auth-button cq-header__auth-button--icon" 
                onClick={() => handleLoginClick()}
                title="Iniciar sesión"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>
              <button 
                className="cq-header__auth-button cq-header__auth-button--icon cq-header__auth-button--register-icon" 
                onClick={handleRegisterClick}
                title="Crear cuenta"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <header className="cq-header">
        <div className="cq-header__container">
          <div className="cq-header__logo-wrapper">
            <Link to="/">
              <img src={logo} alt="CQ TRAILS" className="cq-header__logo" />
            </Link>
          </div>

          {isMobile ? renderMobileHeader() : renderDesktopHeader()}
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


















