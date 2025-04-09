"use client"

import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from "react-router-dom"
import CartPreview from './CartPreview'
import "../Estilos/HeaderAuthenticated.css"
import logo from "../Imagenes/Logo.svg"
import { ChevronDown, Car, User, LogOut } from "lucide-react"
import { authService } from "../Services/AuthService.ts"
// Fix CartService import to use default export
import CartService from "../Services/CartService.ts"

function HeaderAuthenticated({ onLogout }) {
  const navigate = useNavigate()
  const [showCartPreview, setShowCartPreview] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const profileRef = useRef(null)
  const dropdownRef = useRef(null)

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
  }, [])
  
  // Function to fetch cart items
  const fetchCartItems = async () => {
    try {
      // Get the current user's ID
      const user = authService.getCurrentUser();
      console.log("Current user:", user); // Debug log to see user object structure
      
      let userId = null;
      
      // Check different property names for ID
      if (user && user.idUsuario) {
        userId = user.idUsuario;
      } else if (user && user.ID) {
        userId = user.ID;
      } else if (user && user.id) {
        userId = user.id;
      }
      
      if (userId) {
        console.log(`Fetching cart items for user ID: ${userId}`);
        const items = await CartService.getUserCartItems(userId);
        console.log("Cart items fetched:", items);
        
        // Format cart items if needed
        const formattedItems = Array.isArray(items) ? items.map(item => ({
          ...item,
          // Ensure these properties exist
          price: item.price || 0,
          cantidad: item.cantidad || 1,
          subTotal: item.subTotal || 0,
          vehiculo: item.vehiculo || { 
            modelo: 'Vehículo no disponible',
            tipoVehiculo: 'Tipo no disponible' 
          }
        })) : [];
        
        setCartItems(formattedItems);
      } else {
        console.error("User ID not available", user);
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setCartItems([]);
    }
  }

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
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileRef, dropdownRef])

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

  const userName = currentUser?.nombre 
    ? `${currentUser.nombre} ${currentUser.apellido || ''}`
    : 'Usuario';

  return (
    <div className="header-auth">
      <div className="header-auth-container">
        <Link to="/home-auth" className="header-auth-logo">
          <img src={logo} alt="Logo" className="header-auth-logo" />
        </Link>
        
        <div className="header-auth-right">
          <nav className="header-auth-nav">
            <div className="header-auth-dropdown">
              <button className="header-auth-dropdown-toggle">
                Reservaciones
                <ChevronDown size={20} />
              </button>
              <div className="header-auth-dropdown-menu">
                <Link to="/reservar" className="header-auth-dropdown-item">
                  Reservar
                </Link>
                <Link to="/historial" className="header-auth-dropdown-item">
                  Mis Reservaciones
                </Link>
              </div>
            </div>
            <Link to="/contacto" className="header-auth-contact">
              Contacto
            </Link>
          </nav>
          
          <div className="header-auth-icons">
            <div className="cartheader-container"
                 onMouseEnter={() => setShowCartPreview(true)}
                 onMouseLeave={() => setShowCartPreview(false)}>
              <Link to="/mi-carrito" className="cart-link">
                <Car size={24} />
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
                onMouseEnter={() => setShowProfileDropdown(true)}
              >
                <div className="profile-link">
                  <User size={24} />
                  <span className="user-name">{userName}</span>
                </div>
              </div>
              {showProfileDropdown && (
                <div 
                  ref={dropdownRef}
                  className="profile-dropdown" 
                  onMouseEnter={() => setShowProfileDropdown(true)}
                  onMouseLeave={() => setShowProfileDropdown(false)}
                >
                  <Link to="/perfil" className="profile-dropdown-item">
                    Mi Perfil
                  </Link>
                  <button className="profile-dropdown-item logout-button" onClick={handleLogout}>
                    <LogOut size={18} />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeaderAuthenticated



















