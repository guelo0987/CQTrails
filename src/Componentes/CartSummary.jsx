import React from 'react'
import "../Estilos/CartSummary.css"

function CartSummary({ subtotal, total, onReserve }) {
  const iva = (parseFloat(subtotal) * 0.13).toFixed(2) // 13% IVA

  return (
    <div className="cart-summary">
      <h2>Total de Vehículos</h2>
      
      <div className="summary-details">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>DOP {subtotal}</span>
        </div>
        <div className="summary-row">
          <span>IVA (13%)</span>
          <span>DOP {iva}</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>DOP {total}</span>
        </div>
      </div>

      <button 
        className="reservar-button"
        onClick={onReserve}
      >
        Reservar
      </button>
    </div>
  )
}

export default CartSummary



