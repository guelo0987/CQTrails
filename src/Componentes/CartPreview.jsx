import React from 'react'
import { Link } from 'react-router-dom'
import "../Estilos/CartPreview.css"
import getDirectGoogleDriveImageUrl from '../Utils/HelperDriveGoogle.ts'

const CartPreview = ({ items = [], isVisible }) => {
  // Calculate total based on subtotal property
  const calculateTotal = () => {
    return items.reduce((total, item) => total + parseFloat(item.subTotal || 0), 0).toFixed(2)
  }

  if (!isVisible) return null

  // Return empty state if no items
  if (!items || items.length === 0) {
    return (
      <div className="cart-preview">
        <div className="cart-preview-header">
          <span>Carrito (0)</span>
        </div>
        <div className="cart-preview-empty">
          <p>Tu carrito está vacío</p>
        </div>
        <div className="cart-preview-footer">
          <Link to="/reservar" className="view-cart-button">
            Reservar Ahora
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-preview">
      <div className="cart-preview-header">
        <span>Carrito ({items.length})</span>
      </div>
      <div className="cart-preview-items">
        {items.map((item) => (
          <div key={item.id} className="preview-item">
            <img 
              src={getDirectGoogleDriveImageUrl(
                item.vehiculo?.imagenUrl || 
                item.vehiculo?.imageUrl || 
                item.vehiculo?.image_url || 
                item.vehiculo?.Image_url || 
                item.vehiculo?.imagen, 
                'https://placehold.co/300x200/CCCCCC/666666?text=Sin+Imagen'
              )} 
              alt={item.vehiculo?.modelo || 'Vehículo'} 
              className="preview-item-image"
              onError={(e) => {
                console.log("CartPreview image failed to load:", e.target.src);
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/300x200/CCCCCC/666666?text=Sin+Imagen';
              }}
            />
            <div className="preview-item-details">
              <h4>{item.vehiculo?.modelo || 'Vehículo no disponible'}</h4>
              <p className="preview-item-type">{item.vehiculo?.tipoVehiculo || 'Tipo no disponible'}</p>
              <div className="preview-item-date">
                <span>
                  {new Date(item.fechaInicio).toLocaleDateString()} - {new Date(item.fechaFin).toLocaleDateString()}
                </span>
              </div>
              <div className="preview-item-price">
                <span>${item.price || 0}</span>
                <span className="preview-item-quantity">Cantidad: {item.cantidad}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-preview-footer">
        <div className="preview-subtotal">
          <span>Subtotal</span>
          <span>${calculateTotal()}</span>
        </div>
        <Link to="/mi-carrito" className="view-cart-button">
          Ver Carrito
        </Link>
      </div>
    </div>
  )
}

export default CartPreview 