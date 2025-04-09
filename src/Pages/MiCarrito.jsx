import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import "react-datepicker/dist/react-datepicker.css"
import HeaderAuthenticated from "../Componentes/HeaderAuthenticated"
import Footer from "../Componentes/Footer"
import CartItem from "../Componentes/CartItem"
import CartSummary from "../Componentes/CartSummary"
import ConfirmationModal from '../Componentes/ConfirmationModal'
import SuccessModal from '../Componentes/SuccessModal'
import CartService from "../Services/CartService.ts"
import { authService } from "../Services/AuthService.ts"
import { useCart } from "../Context/CartContext"
import "../Estilos/MiCarrito.css"
import Swal from 'sweetalert2'

export default function MiCarrito() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { refreshCart } = useCart()

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Obtener el usuario actual usando authService
        const userData = authService.getCurrentUser()
        
        if (!userData || !userData.idUsuario) {
          throw new Error('No se encontró información del usuario. Por favor, inicie sesión nuevamente.')
        }
        
        const items = await CartService.getUserCartItems(userData.idUsuario)
        setCartItems(items)
      } catch (error) {
        console.error('Error al cargar el carrito:', error)
        setError(error.message || 'Ocurrió un error al cargar los items del carrito')
        
        // Mostrar mensaje de error
        Swal.fire({
          title: 'Error',
          text: error.message || 'Ocurrió un error al cargar los items del carrito',
          icon: 'error',
          confirmButtonText: 'Entendido'
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchCartItems()
  }, [])

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.subTotal || 0)
    }, 0).toFixed(2)
  }

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal())
    const iva = subtotal * 0.13
    return (subtotal + iva).toFixed(2)
  }

  const handleRemoveItem = async (itemId) => {
    try {
      setLoading(true)
      // Llamar al API para eliminar el ítem
      const updatedCart = await CartService.removeItemFromCart(itemId)
      setCartItems(updatedCart)
      refreshCart() // Refrescar el carrito en el contexto global
    } catch (error) {
      console.error('Error al eliminar ítem:', error)
      
      // Mostrar mensaje de error
      Swal.fire({
        title: 'Error',
        text: error.message || 'Ocurrió un error al eliminar el ítem del carrito',
        icon: 'error',
        confirmButtonText: 'Entendido'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      setLoading(true)
      let updatedCart
      
      if (newQuantity > cartItems.find(item => item.id === itemId).cantidad) {
        // Incrementar cantidad
        updatedCart = await CartService.increaseItemQuantity(itemId)
      } else {
        // Decrementar cantidad
        updatedCart = await CartService.decreaseItemQuantity(itemId)
      }
      
      setCartItems(updatedCart)
      refreshCart() // Refrescar el carrito en el contexto global
    } catch (error) {
      console.error('Error al actualizar cantidad:', error)
      
      // Mostrar mensaje de error
      Swal.fire({
        title: 'Error',
        text: error.message || 'Ocurrió un error al actualizar la cantidad',
        icon: 'error',
        confirmButtonText: 'Entendido'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEmptyCart = async () => {
    try {
      setLoading(true)
      
      // Obtener el usuario actual usando authService
      const userData = authService.getCurrentUser()
      
      if (!userData || !userData.idUsuario) {
        throw new Error('No se encontró información del usuario')
      }
      
      // Confirmar antes de vaciar el carrito
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esto eliminará todos los ítems de tu carrito',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, vaciar carrito',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
      })
      
      if (result.isConfirmed) {
        // Llamar al API para vaciar el carrito
        await CartService.clearCart(userData.idUsuario)
        setCartItems([])
        refreshCart() // Refrescar el carrito en el contexto global
        
        Swal.fire({
          title: 'Carrito vaciado',
          text: 'Tu carrito ha sido vaciado correctamente',
          icon: 'success',
          confirmButtonText: 'Entendido'
        })
      }
    } catch (error) {
      console.error('Error al vaciar el carrito:', error)
      
      // Mostrar mensaje de error
      Swal.fire({
        title: 'Error',
        text: error.message || 'Ocurrió un error al vaciar el carrito',
        icon: 'error',
        confirmButtonText: 'Entendido'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReserveClick = () => {
    setIsConfirmationModalOpen(true)
  }

  const handleCancelReservation = () => {
    setIsConfirmationModalOpen(false)
    // Se mantiene en la página actual del carrito
  }

  const handleConfirmReservation = () => {
    setIsConfirmationModalOpen(false)
    setIsSuccessModalOpen(true)
  }

  const handleSuccessClose = async () => {
    setIsSuccessModalOpen(false)
    await handleEmptyCart()
    navigate('/historial')
  }

  // Formatear los datos de los ítems para el componente CartItem
  const formattedCartItems = cartItems.map(item => ({
    id: item.id,
    vehiculo: item.vehiculo?.modelo || 'Vehículo no disponible',
    tipo: item.vehiculo?.tipoVehiculo || 'Tipo no disponible',
    imagen: item.vehiculo?.image_url || 'https://placehold.co/300x200/CCCCCC/666666?text=No+Image',
    fechaInicio: new Date(item.fechaInicio),
    fechaFin: new Date(item.fechaFin),
    cantidad: item.cantidad,
    precio: item.price,
    subtotal: item.subTotal,
    ciudadInicio: item.ciudadInicio?.nombre || 'Ciudad no disponible',
    ciudadFin: item.ciudadFin?.nombre || 'Ciudad no disponible'
  }))

  return (
    <div className="micarrito-container">
      <HeaderAuthenticated />

      <main className="mi-reservacion-content">
        <div className="title-bar">
          <h1>Mi Reservación</h1>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner large"></div>
            <p>Cargando carrito...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button 
              className="retry-button" 
              onClick={() => window.location.reload()}
            >
              Intentar de nuevo
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Tu carrito está vacío</p>
            <Link to="/reservar" className="btn-primary">
              Ir a Reservar
            </Link>
          </div>
        ) : (
          <div className="cart-container">
            <div className="cart-table">
              <CartItem isHeader={true} />
              <div className="cart-items-container">
                {formattedCartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onRemove={handleRemoveItem}
                    onUpdateQuantity={handleUpdateQuantity}
                    disabled={loading}
                  />
                ))}
              </div>
              <div className="cart-actions">
                <Link to="/reservar" className="volver-btn">
                  Volver
                </Link>
                <button 
                  className="vaciar-btn" 
                  onClick={handleEmptyCart} 
                  disabled={loading}
                  aria-label="Vaciar carrito"
                >
                  Vaciar
                </button>
              </div>
            </div>
            <CartSummary 
              subtotal={calculateSubtotal()} 
              total={calculateTotal()} 
              onReserve={handleReserveClick}
              disabled={loading}
            />
          </div>
        )}
      </main>

      <ConfirmationModal 
        isOpen={isConfirmationModalOpen}
        onClose={handleCancelReservation}
        onConfirm={handleConfirmReservation}
      />

      <SuccessModal 
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessClose}
      />

      <Footer />
    </div>
  )
}





