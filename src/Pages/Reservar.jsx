import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import HeaderAuthenticated from "../Componentes/HeaderAuthenticated"
import Header from "../Componentes/Header"
import Sidebar from "../Componentes/SideBar"
import VehicleGrid from "../Componentes/VehicleGrid"
import SearchBar from "../Componentes/SearchBar"
import Footer from "../Componentes/Footer"
import "../Estilos/Reservar.css"
import VehiculeService from "../Services/VehiculeService.ts"

function Reservar() {
  const navigate = useNavigate()
  const isAuthenticated = localStorage.getItem("auth") === "true"

  const [vehicles, setVehicles] = useState([])
  const [filteredVehicles, setFilteredVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [capacities, setCapacities] = useState([])
  const [filters, setFilters] = useState({
    type: null,
    capacity: null,
    priceRange: 500,
    brand: "",
    model: "",
    year: ""
  })

  // Fetch all vehicles when component mounts
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true)
        const vehiclesData = await VehiculeService.getAllVehicules()
        setVehicles(vehiclesData)
        setFilteredVehicles(vehiclesData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching vehicles:", error)
        setLoading(false)
      }
    }
    
    const fetchCapacities = async () => {
      try {
        const capacitiesData = await VehiculeService.getAllCapacities()
        setCapacities(capacitiesData)
      } catch (error) {
        console.error("Error fetching capacities:", error)
      }
    }
    
    fetchVehicles()
    fetchCapacities()
  }, [])

  // Función para aplicar todos los filtros
  const applyFilters = () => {
    let filtered = [...vehicles]

    // Filtro por tipo (tipoVehiculo)
    if (filters.type) {
      filtered = filtered.filter(vehicle => vehicle.tipoVehiculo === filters.type)
    }

    // Filtro por capacidad
    if (filters.capacity) {
      const capacityValue = parseInt(filters.capacity)
      filtered = filtered.filter(vehicle => vehicle.capacidad === capacityValue)
    }

    // Filtro por precio
    filtered = filtered.filter(vehicle => vehicle.price <= filters.priceRange)

    // Filtros de búsqueda
    if (filters.model) {
      filtered = filtered.filter(vehicle => 
        vehicle.modelo.toLowerCase().includes(filters.model.toLowerCase())
      )
    }
    if (filters.year) {
      filtered = filtered.filter(vehicle => 
        vehicle.ano.toString() === filters.year
      )
    }

    setFilteredVehicles(filtered)
  }

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters()
  }, [filters, vehicles])

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  // Mapeo de vehículos para VehicleGrid
  const mappedVehicles = filteredVehicles.map(vehicle => ({
    id: vehicle.idVehiculo,
    brand: vehicle.tipoVehiculo, // El campo tipoVehiculo parece contener la marca
    type: vehicle.tipoVehiculo,
    model: vehicle.modelo,
    year: vehicle.ano.toString(),
    image: vehicle.Image_url,
    seats: vehicle.capacidad,
    transmision: vehicle.transmision || "Manual", // Valor por defecto ya que no viene del API
    combustible: vehicle.combustible || "90L", // Valor por defecto ya que no viene del API
    price: vehicle.price,
    placa: vehicle.placa,
    disponible: vehicle.disponible
  }))

  return (
    <div className="page-container">
      {isAuthenticated ? <HeaderAuthenticated /> : <Header />}
      <div className="vehicle-rental">
        <div className="container">
          {loading ? (
            <div className="loading">Cargando vehículos...</div>
          ) : (
            <div className="vehicle-content">
              <Sidebar
                selectedType={filters.type}
                selectedCapacity={filters.capacity}
                priceRange={filters.priceRange}
                onTypeChange={(type) => handleFilterChange('type', type)}
                onCapacityChange={(capacity) => handleFilterChange('capacity', capacity)}
                onPriceChange={(price) => handleFilterChange('priceRange', price)}
                vehicleTypes={Array.from(new Set(vehicles.map(v => v.tipoVehiculo)))}
                capacities={capacities}
                vehicles={vehicles}
              />
              <div className="main-content">
                <SearchBar 
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
                <div className="results-info">
                  <p>Mostrando {filteredVehicles.length} vehículos</p>
                </div>
                <VehicleGrid vehicles={mappedVehicles} />
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Reservar