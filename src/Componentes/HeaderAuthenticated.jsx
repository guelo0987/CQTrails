"use client"

import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from "react-router-dom"
import CartPreview from './CartPreview'
import "../Estilos/HeaderAuthenticated.css"
import logo from "../Imagenes/Logo.svg"
import { authService } from "../Services/AuthService.ts"
// Fix CartService import to use default export
import CartService from "../Services/CartService.ts"

function HeaderAuthenticated({ onLogout }) {
  const navigate = useNavigate()
  const [showCartPreview, setShowCartPreview] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const profileRef = useRef(null)
  const dropdownRef = useRef(null)
  const reservationsRef = useRef(null)

  useEffect(() => {
    // Get current user
    const user = authService.getCurrentUser()
    setCurrentUser(user)
    
    // Fetch cart items using CartService
    if (user) {
      fetchCartItems()
    } else {
      // Fallback to localStorage if no user is logged in
      const savedCart = JSON.parse(localStorage.getItem('cart')) || []
      setCartItems(savedCart)
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Function to fetch cart items
  const fetchCartItems = async () => {
    try {
      const userData = authService.getCurrentUser();
      if (!userData || !userData.idUsuario) {
        console.error('No se encontró información del usuario');
        return;
      }

     
      const items = await CartService.getUserCartItems(userData.idUsuario);
      setCartItems(items || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setCartItems([]);
    }
  };

  // Add effect to update user when auth changes
  useEffect(() => {
    // Function to update the current user
    const updateCurrentUser = () => {
      const user = authService.getCurrentUser()
      setCurrentUser(user)
      
      // Refresh cart items when user changes
      if (user) {
        fetchCartItems()
      }
    }
    
    // Listen for storage events (like auth status changes)
    window.addEventListener('storage', updateCurrentUser)
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', updateCurrentUser)
    }
  }, [])

  // Cerrar el dropdown cuando se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && 
          !profileRef.current.contains(event.target) && 
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false)
      }

      if (reservationsRef.current && 
          !reservationsRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileRef, dropdownRef, reservationsRef])

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      authService.handleLogout()
    }
  }

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown)
  }

  const toggleReservationsDropdown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDropdownOpen(!dropdownOpen)
  }

  const userName = currentUser?.nombre 
    ? `${currentUser.nombre} ${currentUser.apellido || ''}`
    : 'Usuario';

  const renderDesktopHeader = () => (
    <div className="header-auth-right">
      <nav className="header-auth-nav">
        <div className="header-auth-dropdown" ref={reservationsRef}>
          <button 
            className="header-auth-dropdown-toggle"
            onClick={toggleReservationsDropdown}
          >
            Reservaciones
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`header-auth-dropdown-icon ${dropdownOpen ? 'open' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="header-auth-dropdown-menu">
              <Link to="/reservar" className="header-auth-dropdown-item">
                Reservar
              </Link>
              <Link to="/historial" className="header-auth-dropdown-item">
                Historial
              </Link>
            </div>
          )}
        </div>
        <Link to="/contacto" className="header-auth-contact">
          Contacto
        </Link>
      </nav>
      
      <div className="header-auth-icons">
        <div className="cartheader-container"
             onMouseEnter={() => setShowCartPreview(true)}
             onMouseLeave={() => setShowCartPreview(false)}>
          <Link to="/micarrito" className="cart-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartItems.length > 0 && (
              <span className="cart-count">{cartItems.length}</span>
            )}
          </Link>
          <CartPreview items={cartItems} isVisible={showCartPreview} />
        </div>

        <div className="profile-dropdown-container">
          <div 
            ref={profileRef}
            className="profile-container" 
            onClick={toggleProfileDropdown}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          {showProfileDropdown && (
            <div 
              ref={dropdownRef}
              className="profile-dropdown" 
            >
              <div className="mobile-dropdown-header">
                {userName}
              </div>
              <Link to="/perfil" className="profile-dropdown-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Mi Perfil
              </Link>
              <button className="profile-dropdown-item logout-button" onClick={handleLogout}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderMobileHeader = () => (
    <div className="header-auth-right mobile">
      <div className="header-auth-mobile-group">
        <nav className="header-auth-nav">
          <div className="header-auth-dropdown" ref={reservationsRef}>
            <button 
              className="header-auth-dropdown-toggle"
              onClick={toggleReservationsDropdown}
            >
              Reservar
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`header-auth-dropdown-icon ${dropdownOpen ? 'open' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="header-auth-dropdown-menu">
                <Link to="/reservar" className="header-auth-dropdown-item">
                  Reservar
                </Link>
                <Link to="/historial" className="header-auth-dropdown-item">
                  Historial
                </Link>
              </div>
            )}
          </div>
          <Link to="/contacto" className="header-auth-contact">
            Contacto
          </Link>
        </nav>

        <div className="header-auth-icons">
          <div className="cartheader-container">
            <Link to="/micarrito" className="cart-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartItems.length > 0 && (
                <span className="cart-count">{cartItems.length}</span>
              )}
            </Link>
          </div>

          <div className="profile-container" onClick={toggleProfileDropdown} ref={profileRef}>
            <div className="profile-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {showProfileDropdown && (
        <div ref={dropdownRef} className="profile-dropdown mobile-dropdown">
          <div className="mobile-dropdown-header">
            {userName}
          </div>
          <Link to="/perfil" className="profile-dropdown-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Mi Perfil
          </Link>
          <button className="profile-dropdown-item logout-button" onClick={handleLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="header-auth">
      <div className="header-auth-container">
        <Link to="/home-auth" className="header-auth-logo-wrapper">
          <img src={logo} alt="Logo" className="header-auth-logo" />
        </Link>
        
        {isMobile ? renderMobileHeader() : renderDesktopHeader()}
      </div>
    </div>
  )
}

export default HeaderAuthenticated



















