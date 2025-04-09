import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import "react-datepicker/dist/react-datepicker.css"
import HeaderAuthenticated from "../Componentes/HeaderAuthenticated"
import Footer from "../Componentes/Footer"
import CartItem from "../Componentes/CartItem"
import CartSummary from "../Componentes/CartSummary"
import ConfirmationModal from '../Componentes/ConfirmationModal'
import SuccessModal from '../Componentes/SuccessModal'
import "../Estilos/MiCarrito.css"

export default function MiCarrito() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart')) || []
    setCartItems(items)
  }, [])

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      let subtotal = 0;
      try {
        // Intentar convertir el subtotal a número, removiendo cualquier formato
        subtotal = parseFloat(String(item.subtotal).replace(/[^0-9.-]+/g, ''));
      } catch (error) {
        console.error('Error al procesar subtotal:', error);
      }
      return total + (isNaN(subtotal) ? 0 : subtotal);
    }, 0).toFixed(2);
  }

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const iva = subtotal * 0.13;
    return (subtotal + iva).toFixed(2);
  }

  const handleRemoveItem = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId)
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
  }

  const handleUpdateQuantity = (itemId, newQuantity) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === itemId) {
        let precio = 0;
        try {
          // Intentar convertir el precio a número, removiendo cualquier formato
          precio = parseFloat(String(item.precio).replace(/[^0-9.-]+/g, ''));
        } catch (error) {
          console.error('Error al procesar precio:', error);
        }
        
        return {
          ...item,
          cantidad: newQuantity,
          subtotal: (isNaN(precio) ? 0 : precio * newQuantity).toFixed(2)
        }
      }
      return item;
    });
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  }

  const handleEmptyCart = () => {
    setCartItems([])
    localStorage.removeItem('cart')
  }

  const handleDateChange = (id, field, date) => {
    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, [field]: date } : item)))
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

  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false)
    handleEmptyCart()
    navigate('/historial')
  }

  return (
    <div className="micarrito-container">
      <HeaderAuthenticated />

      <main className="mi-reservacion-content">
        <div className="title-bar">
          <h1>Mi Reservación</h1>
        </div>

        <div className="cart-container">
          <div className="cart-table">
            <CartItem isHeader={true} />
            <div className="cart-items-container">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={handleRemoveItem}
                  onUpdateQuantity={handleUpdateQuantity}
                  onDateChange={handleDateChange}
                />
              ))}
            </div>
            <div className="cart-actions">
              <Link to="/reservar" className="volver-btn">
                Volver
              </Link>
              <button className="vaciar-btn" onClick={handleEmptyCart} aria-label="Vaciar carrito">
                Vaciar
              </button>
            </div>
          </div>
          <CartSummary 
            subtotal={calculateSubtotal()} 
            total={calculateTotal()} 
            onReserve={handleReserveClick}
          />
        </div>
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





