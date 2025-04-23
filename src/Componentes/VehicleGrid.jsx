import { useNavigate } from "react-router-dom"
import "../Estilos/VehicleGrid.css"
import { Fuel, Users, Settings } from "lucide-react"
import { useState, useEffect } from "react"
import LoginPopUp from "./LoginPopUp"
import Pagination from "./Pagination"
import getDirectGoogleDriveImageUrl from "../Utils/HelperDriveGoogle.ts"

const VehicleGrid = ({ vehicles }) => {
  const navigate = useNavigate()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const isAuthenticated = localStorage.getItem("auth") === "true"
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [totalPages, setTotalPages] = useState(1)
  const [displayedVehicles, setDisplayedVehicles] = useState([])

  // Calculate pagination when vehicles change
  useEffect(() => {
    if (!vehicles || vehicles.length === 0) {
      setTotalPages(1)
      setDisplayedVehicles([])
      return
    }
    
    const totalPagesCount = Math.ceil(vehicles.length / itemsPerPage)
    setTotalPages(totalPagesCount)
    
    // Reset to page 1 if current page is now invalid
    if (currentPage > totalPagesCount) {
      setCurrentPage(1)
    }
    
    // Update displayed vehicles
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, vehicles.length)
    setDisplayedVehicles(vehicles.slice(startIndex, endIndex))
  }, [vehicles, currentPage, itemsPerPage])

  // Add a useEffect to log the image URLs for each vehicle
  useEffect(() => {
    if (displayedVehicles && displayedVehicles.length > 0) {
      
      displayedVehicles.forEach(vehicle => {
        
      });
    }
  }, [displayedVehicles]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    // Scroll to top of grid
    window.scrollTo({ top: document.querySelector('.vehicle-grid').offsetTop - 100, behavior: 'smooth' })
  }

  const handleReserveClick = (vehicle) => {
    if (!isAuthenticated) {
      // Guardar el vehículo seleccionado en localStorage
      localStorage.setItem('selectedVehicle', JSON.stringify(vehicle))
      // Guardar el vehículo seleccionado en el estado
      setSelectedVehicle(vehicle)
      // Abrir el popup de login
      setIsLoginOpen(true)
      return
    }
    
    // Si está autenticado, proceder con la acción de agregar al carrito
    localStorage.setItem('selectedVehicle', JSON.stringify(vehicle))
    navigate(`/agregar-reserva/${vehicle.id}`)
  }

  const handleLoginSuccess = () => {
    setIsLoginOpen(false)
    // Si hay un vehículo seleccionado, navegar a la página de agregar reserva
    if (selectedVehicle) {
      navigate(`/agregar-reserva/${selectedVehicle.id}`)
    }
  }

  // Si no hay vehículos, mostrar mensaje
  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="vehicle-grid empty">
        <p>No se encontraron vehículos con los filtros seleccionados.</p>
      </div>
    )
  }

  return (
    <>
      <div className="vehicle-grid">
        {displayedVehicles.map((vehicle) => (
          <div key={vehicle.id} className="vehicle-card">
            <div className="vehicle-info">
              <div className="vehicle-header">
                <h3>{vehicle.brand}</h3>
                <span className="vehicle-year">{vehicle.year}</span>
              </div>
              <p className="vehicle-type">{vehicle.model}</p>
              {!vehicle.disponible && (
                <p className="vehicle-not-available">No Disponible</p>
              )}
            </div>

            <div className="vehicle-image-container">
              <img 
                src={getDirectGoogleDriveImageUrl(
                  vehicle.image || vehicle.Image_url || vehicle.image_url || vehicle.imagen || vehicle.imagenUrl, 
                  "https://placehold.co/300x200/CCCCCC/666666?text=No+Image"
                )} 
                alt={`${vehicle.brand} ${vehicle.model}`} 
                onLoad={(e) => {
                  
                }}
                onError={(e) => {
                  console.log("Image failed to load:", vehicle.image);
                  console.log(`Error details for vehicle ${vehicle.id}:`, e);
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/300x200/CCCCCC/666666?text=No+Image";
                  console.log("Using fallback image");
                }}
                className="vehicle-image"
              />
            </div>

            <div className="vehicle-details">
              <div className="detail-item">
                <Users size={18} />
                <span>{vehicle.seats} {vehicle.seats === 1 ? "Persona" : "Personas"}</span>
              </div>
              <div className="detail-item">
                <Settings size={18} />
                <span className="transmission-badge">{vehicle.transmision}</span>
              </div>
              <div className="detail-item">
                <Fuel size={18} />
                <span>{vehicle.combustible}</span>
              </div>
            </div>

            <div className="vehicle-footer">
              <div className="price">
                <span className="amount">DOP {vehicle.price.toFixed(2)}</span>
                <span className="period">/día</span>
              </div>
              <button 
                className={`reserve-button ${!vehicle.disponible ? "disabled" : ""}`}
                onClick={() => vehicle.disponible && handleReserveClick(vehicle)}
                disabled={!vehicle.disponible}
              >
                {vehicle.disponible ? "Reservar" : "No Disponible"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <LoginPopUp 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  )
}

export default VehicleGrid







