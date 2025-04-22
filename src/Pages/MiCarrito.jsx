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
import { reservationService } from '../Services/ReservationService.ts'

export default function MiCarrito() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { refreshCart } = useCart()
  const [total, setTotal] = useState(0)
  const [subtotal, setSubtotal] = useState(0)

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
        
        // Calcular total y subtotal
        if (items && items.length > 0) {
          const calculatedSubtotal = items.reduce((acc, item) => acc + item.subTotal, 0)
          const calculatedTotal = items.reduce((acc, item) => acc + item.total, 0)
          setSubtotal(calculatedSubtotal)
          setTotal(calculatedTotal)
        } else {
          setSubtotal(0)
          setTotal(0)
        }
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

  const handleRemoveItem = async (itemId) => {
    try {
      setLoading(true)
      // Llamar al API para eliminar el ítem
      await CartService.removeItemFromCart(itemId)
      refreshCart() // Refrescar el carrito en el contexto global
      Swal.fire({
        title: 'Éxito',
        text: 'Ítem eliminado del carrito',
        icon: 'success',
        confirmButtonText: 'Entendido'
      })
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
    // Mostrar el modal de confirmación
    Swal.fire({
      title: '¿Confirmar reservación?',
      text: 'Estás a punto de crear una reservación con los vehículos en tu carrito',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#09A603',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        handleConfirmReservation();
      }
    });
  }

  const handleConfirmReservation = async () => {
    try {
      setLoading(true)
      console.log('Creando reservación...')
      
      const userData = authService.getCurrentUser()
      
      if (!userData || !userData.idUsuario) {
        throw new Error('No se encontró información del usuario')
      }

      // Crear la reservación
      console.log('Enviando solicitud con userId:', userData.idUsuario)
      const reservation = await reservationService.makeReservation(userData.idUsuario)
      console.log('Reservación creada:', reservation)
      
      Swal.fire({
        title: '¡Reservación creada!',
        text: 'Tu reservación ha sido creada exitosamente',
        icon: 'success',
        confirmButtonText: 'Ver mis reservaciones'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/historial')
        }
      })
    } catch (error) {
      console.error('Error creating reservation:', error)
      Swal.fire({
        title: 'Error',
        text: 'No se pudo crear la reservación. Por favor, intenta nuevamente.',
        icon: 'error',
        confirmButtonText: 'Entendido'
      })
    } finally {
      setLoading(false)
      setIsConfirmationModalOpen(false)
    }
  }

  const handleSuccessClose = async () => {
    setIsSuccessModalOpen(false)
    await handleEmptyCart()
    navigate('/historial')
  }

  const handleDateChange = async (itemId, field, newDate) => {
    try {
      setLoading(true)
      // Format the date to include time (set to 00:00:00 if not provided)
      const formattedDate = new Date(newDate)
      formattedDate.setHours(0, 0, 0, 0)
      const isoDate = formattedDate.toISOString()
      
      // Update the date
      if (field === 'fechaInicio') {
        await CartService.updateStartDate(itemId, isoDate)
      } else if (field === 'fechaFin') {
        await CartService.updateEndDate(itemId, isoDate)
      }
      
      // Fetch the updated cart items
      const userData = authService.getCurrentUser()
      if (!userData || !userData.idUsuario) {
        throw new Error('No se encontró información del usuario')
      }
      
      const updatedCart = await CartService.getUserCartItems(userData.idUsuario)
      setCartItems(updatedCart || [])
      refreshCart()
    } catch (error) {
      console.error('Error updating date:', error)
      Swal.fire({
        title: 'Error',
        text: 'No pudimos actualizar la fecha. Por favor, intenta nuevamente.',
        icon: 'error',
        confirmButtonText: 'Entendido'
      })
    } finally {
      setLoading(false)
    }
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
                    onDateChange={handleDateChange}
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
              subtotal={subtotal.toFixed(2)} 
              total={total.toFixed(2)} 
              onReserve={handleReserveClick}
              disabled={loading}
            />
          </div>
        )}
      </main>

      <ConfirmationModal 
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
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





