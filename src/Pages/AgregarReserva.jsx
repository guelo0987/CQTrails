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
import CartService from "../Services/CartService.ts"
import { authService } from "../Services/AuthService.ts"
import { useCart } from "../Context/CartContext"
import VehiculeService from "../Services/VehiculeService.ts"

export default function AgregarReserva() {
  const { vehicleId } = useParams()
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [vehicleDetails, setVehicleDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState(null)
  const [attemptedReload, setAttemptedReload] = useState(false)
  const navigate = useNavigate()
  const { addToCart } = useCart()

  // Load vehicle data
  useEffect(() => {
    const loadVehicleData = async () => {
      try {
        // Get the vehicle data from localStorage
        const storedVehicleData = JSON.parse(localStorage.getItem('selectedVehicle'));
        if (!storedVehicleData) return;
        
        
        
        // Try to fetch detailed vehicle data from API to get all images
        try {
          if (storedVehicleData.id) {
            const apiVehicleData = await VehiculeService.getVehiculeById(storedVehicleData.id);
            
            
            // Store the raw API data
            setVehicleDetails(apiVehicleData);
          }
        } catch (apiError) {
          console.error("Error fetching detailed vehicle data:", apiError);
          // Continue with localStorage data if API fails
        }
        
        // Create enhanced vehicle object with the data we have
        setSelectedVehicle({
          ...storedVehicleData,
          name: `${storedVehicleData.brand} ${storedVehicleData.model}`,
          description: `${storedVehicleData.brand} ${storedVehicleData.model} ${storedVehicleData.year} - ${storedVehicleData.type.charAt(0).toUpperCase() + storedVehicleData.type.slice(1)}`,
          // Include raw API data if available (for getting all images)
          rawData: vehicleDetails,
          specs: [
            { label: "Tipo Vehículo", value: storedVehicleData.type.charAt(0).toUpperCase() + storedVehicleData.type.slice(1) },
            { label: "Capacidad", value: `${storedVehicleData.seats} Personas` },
            { label: "Transmisión", value: storedVehicleData.transmision },
            { label: "Año", value: storedVehicleData.year },
            { label: "Disponibilidad", value: "20" },
          ]
        });
      } catch (error) {
        console.error("Error loading vehicle data:", error);
      }
    };
    
    loadVehicleData();
  }, [vehicleId, vehicleDetails]);

  // Check authentication and try to recover if needed
  useEffect(() => {
    const user = authService.getCurrentUser();
    
    // If user data is not available and we haven't tried to reload
    if ((!user || !user.idUsuario) && !attemptedReload) {
      // Try to reload the page once to see if that helps
      console.log("User data not found, attempting to reload...");
      setAttemptedReload(true);
      
      // Check if the auth token exists
      const token = localStorage.getItem('token');
      if (token) {
        // Wait a moment before reloading
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        // No token, redirect to login
        Swal.fire({
          title: 'Sesión no iniciada',
          text: 'Necesita iniciar sesión para continuar',
          icon: 'warning',
          confirmButtonText: 'Entendido'
        }).then(() => {
          navigate('/');
        });
      }
    } else {
      setUserData(user);
    }
  }, [attemptedReload, navigate]);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true)
      
      // Check user authentication and get current user data
      if (!authService.isAuthenticated()) {
        throw new Error('Necesita iniciar sesión para agregar ítems al carrito');
      }
      
      // Try to get user data
      const currentUser = userData || authService.getCurrentUser()
      console.log('Current user data for cart submission:', currentUser);
      
      // If we still don't have user data, check the token directly
      let userId = null;
      
      if (currentUser && currentUser.idUsuario) {
        userId = currentUser.idUsuario;
      } else {
        // No user data but we have a token - try to extract ID from token
        const token = localStorage.getItem('token');
        if (token) {
          try {
            // Decode JWT token to see if it contains the ID
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            
            if (payload.Id) {
              console.log('Extracted user ID from token for cart:', payload.Id);
              userId = parseInt(payload.Id);
            }
          } catch (tokenError) {
            console.error('Error extracting user ID from token for cart:', tokenError);
          }
        }
      }
      
      if (!userId) {
        throw new Error('No se encontró información del usuario. Por favor, inicie sesión nuevamente.');
      }
      
      // Preparar datos para el API
      const cartItem = {
        vehiculoId: parseInt(selectedVehicle.id),
        cantidad: parseInt(formData.quantity),
        fechaInicio: new Date(`${formData.startDate}T${formData.startTime}:00`).toISOString(),
        fechaFin: new Date(`${formData.endDate}T${formData.endTime}:00`).toISOString(),
        ciudadInicioId: parseInt(formData.cityStartId) || 1,
        ciudadFinId: parseInt(formData.cityEndId) || 1,
        usuarioId: parseInt(userId)
      }
      
      console.log('Sending cart item to service:', cartItem);
      console.log('Comparing with API expected format: { usuarioId: number, vehiculoId: number, cantidad: number, fechaInicio: ISO date string, fechaFin: ISO date string, ciudadInicioId: number, ciudadFinId: number }');
      
      // Try direct service call first
      let success = false;
      try {
        // Try direct service call
        await CartService.addItemToCart(cartItem);
        success = true;
      } catch (directError) {
        console.error("Error using direct cart service:", directError);
        
        // Fallback to cart context
        try {
          success = await addToCart(cartItem);
        } catch (contextError) {
          console.error("Error using cart context:", contextError);
          throw new Error("Error al agregar al carrito. Por favor, intente nuevamente.");
        }
      }
      
      if (success) {
        // Mostrar mensaje de éxito con SweetAlert
        Swal.fire({
          title: '¡Reserva Agregada!',
          text: 'Su reserva ha sido agregada al carrito exitosamente',
          icon: 'success',
          confirmButtonText: 'Ver Carrito',
          showCancelButton: true,
          cancelButtonText: 'Seguir Reservando',
          confirmButtonColor: '#09A603',
          cancelButtonColor: '#6c757d',
        }).then((result) => {
          if (result.isConfirmed) {
            // Si el usuario elige ver el carrito
            navigate('/micarrito')
          } else {
            // Si el usuario elige seguir reservando
            navigate('/reservar')
          }
        })
      }
    } catch (error) {
      console.error("Error al agregar al carrito:", error)
      
      // Mostrar mensaje de error al usuario
      Swal.fire({
        title: 'Error',
        text: error.message || 'Ocurrió un error al agregar la reserva al carrito',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#d33',
      })
    } finally {
      setLoading(false)
    }
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
        <ReservationForm 
          price={selectedVehicle.price} 
          onSubmit={handleSubmit} 
          isLoading={loading}
        />
      </main>
      <Footer />
    </div>
  )
}



