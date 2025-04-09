import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import HeaderAuthenticated from "../Componentes/HeaderAuthenticated"
import Footer from "../Componentes/Footer"
import VehicleGallery from "../Componentes/VehicleGallery"
import VehicleSpecs from "../Componentes/VehicleSpecs"
import ReservationForm from "../Componentes/ReservationForm"
import "../Estilos/AgregarReserva.css"
import Swal from 'sweetalert2/dist/sweetalert2.js'
import 'sweetalert2/dist/sweetalert2.css'

export default function AgregarReserva() {
  const { vehicleId } = useParams()
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const vehicleData = JSON.parse(localStorage.getItem('selectedVehicle'))
    if (vehicleData) {
      // Mantener la estructura original del vehículo y añadir propiedades adicionales
      setSelectedVehicle({
        ...vehicleData,
        name: `${vehicleData.brand} ${vehicleData.model}`,
        description: `${vehicleData.brand} ${vehicleData.model} ${vehicleData.year} - ${vehicleData.type.charAt(0).toUpperCase() + vehicleData.type.slice(1)}`,
        specs: [
          { label: "Tipo Vehículo", value: vehicleData.type.charAt(0).toUpperCase() + vehicleData.type.slice(1) },
          { label: "Capacidad", value: `${vehicleData.seats} Personas` },
          { label: "Transmisión", value: vehicleData.transmission },
          { label: "Año", value: vehicleData.year },
          { label: "Disponibilidad", value: "20" },
        ]
      })
    }
  }, [vehicleId])

  const handleSubmit = (formData) => {
    const currentCart = JSON.parse(localStorage.getItem('cart')) || []
    
    // Asegurarse de que el precio sea un número
    const precio = typeof selectedVehicle.price === 'string' 
      ? parseFloat(selectedVehicle.price.replace(/[$,]/g, ''))
      : selectedVehicle.price
    
    const subtotal = (precio * formData.quantity).toFixed(2)
    
    const newReservation = {
      id: Date.now(),
      vehiculo: selectedVehicle.name,
      tipo: selectedVehicle.type,
      imagen: selectedVehicle.image,
      fechaInicio: formData.startDate,
      horaInicio: formData.startTime,
      fechaFin: formData.endDate,
      horaFin: formData.endTime,
      cantidad: formData.quantity,
      precio: precio.toFixed(2),
      subtotal: subtotal
    }
    
    localStorage.setItem('cart', JSON.stringify([...currentCart, newReservation]))

    // Mostrar mensaje de éxito con SweetAlert
    Swal.fire({
      title: '¡Reserva Agregada!',
      text: 'Su reserva ha sido agregada al carrito exitosamente',
      icon: 'success',
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#09A603',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/reservar')
      }
    })
  }

  if (!selectedVehicle) {
    return <div>Cargando...</div>
  }

  return (
    <div className="agregar-reserva-container">
      <HeaderAuthenticated />
      <main className="agregar-reserva-content">
        <div className="vehicle-details-container">
          <VehicleGallery vehicle={selectedVehicle} />
          <VehicleSpecs vehicle={selectedVehicle} />
        </div>
        <ReservationForm price={selectedVehicle.price} onSubmit={handleSubmit} />
      </main>
      <Footer />
    </div>
  )
}



