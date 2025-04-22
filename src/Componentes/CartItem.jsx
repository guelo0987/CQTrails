"use client"

import React from 'react'
import DatePicker from 'react-datepicker'
import { BsCalendar } from 'react-icons/bs'
import "react-datepicker/dist/react-datepicker.css"
import "../Estilos/CartItem.css"
import getDirectGoogleDriveImageUrl from "../Utils/HelperDriveGoogle.ts"

function CartItem({ item, onRemove, onUpdateQuantity, onDateChange, isHeader }) {
  if (isHeader) {
    return (
      <div className="cart-item header">
        <div className="column column-vehicle">VEHÍCULO</div>
        <div className="column column-price">PRECIO/DÍA</div>
        <div className="column column-dates">FECHAS</div>
        <div className="column column-quantity">CANTIDAD</div>
        <div className="column column-subtotal">SUBTOTAL</div>
        <div className="column column-actions"></div>
      </div>
    )
  }

  if (!item) return null

  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, item.cantidad + change)
    onUpdateQuantity(item.id, newQuantity)
  }

  // Log available image data for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`CartItem ID ${item.id} image data:`, {
      imagen: item.imagen,
      image_url: item.image_url
    });
  }

  // Process vehicle image to get direct Google Drive URL if needed
  const processedImage = item.imagen || (
    item.image_url ? getDirectGoogleDriveImageUrl(item.image_url, "https://placehold.co/300x200/CCCCCC/666666?text=No+Image") : 
    "https://placehold.co/300x200/CCCCCC/666666?text=No+Image"
  );

  if (process.env.NODE_ENV === 'development') {
    console.log(`CartItem ID ${item.id} processed image:`, processedImage);
  }

  // Solo calculamos el subtotal si no es header
  const subtotal = item.precio * item.cantidad

  return (
    <div className="cart-item">
      <div className="column column-vehicle">
        <div className="cart-item-image-container">
          <img 
            src={processedImage} 
            alt={item.vehiculo} 
            className="cart-item-image" 
            onError={(e) => {
              console.log("Image failed to load:", e.target.src);
              console.log("Original image sources:", {
                imagen: item.imagen,
                image_url: item.image_url
              });
              e.target.onerror = null;
              // Try to use the default placeholder
              e.target.src = "https://placehold.co/300x200/CCCCCC/666666?text=No+Image";
            }}
          />
        </div>
        <div className="cart-item-details">
          <h3 className="cart-item-title">{item.vehiculo}</h3>
          <p className="cart-item-type">{item.tipo}</p>
        </div>
      </div>

      <div className="column column-price">
        ${item.precio}/día
      </div>

      <div className="column column-dates">
        <div className="date-picker-container">
          <DatePicker
            selected={new Date(item.fechaInicio)}
            onChange={(date) => onDateChange(item.id, 'fechaInicio', date)}
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
          />
          <BsCalendar className="calendar-icon" />
        </div>
        <div className="date-picker-container">
          <DatePicker
            selected={new Date(item.fechaFin)}
            onChange={(date) => onDateChange(item.id, 'fechaFin', date)}
            dateFormat="dd/MM/yyyy"
            minDate={new Date(item.fechaInicio)}
          />
          <BsCalendar className="calendar-icon" />
        </div>
      </div>

      <div className="column column-quantity">
        <button 
          className="quantity-btn"
          onClick={() => handleQuantityChange(-1)}
          disabled={item.cantidad <= 1}
        >
          -
        </button>
        <span>{item.cantidad}</span>
        <button 
          className="quantity-btn"
          onClick={() => handleQuantityChange(1)}
        >
          +
        </button>
      </div>

      <div className="column column-subtotal">
        ${subtotal}
      </div>

      <div className="column column-actions">
        <button 
          className="remove-button"
          onClick={() => onRemove(item.id)}
          aria-label="Eliminar item"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default CartItem








