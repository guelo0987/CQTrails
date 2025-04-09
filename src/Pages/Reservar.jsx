import { useState, useEffect, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
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
  const location = useLocation()
  const isAuthenticated = localStorage.getItem("auth") === "true"

  // Get filter parameters from navigation state if available
  const searchFilters = location.state?.filters || {}
  const fromHeroSection = location.state?.fromHeroSection || false

  const [vehicles, setVehicles] = useState([])
  const [filteredVehicles, setFilteredVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [capacities, setCapacities] = useState([])
  const [searchAllFields, setSearchAllFields] = useState(searchFilters.searchAllFields || false)
  const [initialLoad, setInitialLoad] = useState(true) // Track initial load
  const [filters, setFilters] = useState({
    type: searchFilters.brand ? String(searchFilters.brand) : "",
    capacity: null,
    priceRange: 500,
    brand: searchFilters.brand ? String(searchFilters.brand) : "",
    model: searchFilters.model ? String(searchFilters.model) : "",
    year: searchFilters.year ? String(searchFilters.year) : ""
  })
  
  // Set initial search term if provided
  const [searchTerm, setSearchTerm] = useState(
    searchFilters.searchTerm ? String(searchFilters.searchTerm) : 
    searchFilters.model ? String(searchFilters.model) : ""
  )

  // Fetch all vehicles when component mounts
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true)
        const vehiclesData = await VehiculeService.getAllVehicules()
        setVehicles(vehiclesData)
        
        // If we're coming from the hero section, we'll handle filters separately
        if (!fromHeroSection) {
          setFilteredVehicles(vehiclesData)
        }
        
        setLoading(false)
      } catch (error) {
        console.error("Error fetching vehicles:", error)
        setLoading(false)
        setFilteredVehicles([]) // Set empty array on error
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
  }, [fromHeroSection])

  // Function to apply filters - defined outside to be reusable
  const applyFiltersFn = useCallback((vehicleData = vehicles) => {
    let filtered = [...vehicleData]
    const hasModelFilter = filters.model && typeof filters.model === 'string' && filters.model.trim() !== '';
    const hasBrandFilter = filters.type && typeof filters.type === 'string' && filters.type.trim() !== '';
    const hasYearFilter = filters.year && (typeof filters.year === 'string' ? filters.year.trim() !== '' : true);
    const hasCapacityFilter = filters.capacity !== null && filters.capacity !== undefined;

    // Filtro por tipo (tipoVehiculo)
    if (hasBrandFilter) {
      filtered = filtered.filter(vehicle => 
        vehicle.tipoVehiculo.toLowerCase() === filters.type.toLowerCase()
      )
    }

    // Filtro por capacidad
    if (hasCapacityFilter) {
      const capacityValue = parseInt(filters.capacity)
      filtered = filtered.filter(vehicle => vehicle.capacidad === capacityValue)
    }

    // Filtro por precio
    filtered = filtered.filter(vehicle => vehicle.price <= filters.priceRange)

    // Filtros de búsqueda por modelo o searchTerm
    if (hasModelFilter) {
      if (searchAllFields) {
        // Search in all text fields if searchAllFields is true
        filtered = filtered.filter(vehicle => 
          vehicle.modelo.toLowerCase().includes(filters.model.toLowerCase()) ||
          vehicle.tipoVehiculo.toLowerCase().includes(filters.model.toLowerCase()) ||
          vehicle.ano.toString().includes(filters.model)
        )
      } else {
        // Standard model filter
        filtered = filtered.filter(vehicle => 
          vehicle.modelo.toLowerCase().includes(filters.model.toLowerCase())
        )
      }
    }

    // Filtro adicional por año específico
    if (hasYearFilter) {
      filtered = filtered.filter(vehicle => 
        vehicle.ano.toString() === (typeof filters.year === 'string' ? filters.year : filters.year.toString())
      )
    }

    setFilteredVehicles(filtered)
    return filtered;
  }, [filters, searchAllFields, vehicles])

  // Aplicar filtros cuando cambien, pero no en el primer renderizado si venimos de HeroSection
  useEffect(() => {
    if (initialLoad && fromHeroSection) {
      return; // Skip the first filter application if we're coming from HeroSection
    }
    applyFiltersFn();
  }, [filters, applyFiltersFn, initialLoad, fromHeroSection]);

  // Apply search term on initial load if provided
  useEffect(() => {
    // Only run this once when component mounts and when we have search filters
    if ((searchFilters.brand || searchFilters.model || searchFilters.year || searchFilters.searchTerm) && initialLoad) {
      setInitialLoad(false); // Mark initial load as complete
      
      // Get a copy of initial vehicles for filtering
      const applyInitialFilters = async () => {
        try {
          // If we don't have vehicles yet, fetch them
          let vehiclesToFilter = vehicles;
          if (vehicles.length === 0) {
            setLoading(true);
            vehiclesToFilter = await VehiculeService.getAllVehicules();
            setVehicles(vehiclesToFilter);
          }
          
          // Create a filters object with the values from URL
          const initialFilters = {
            type: searchFilters.brand ? String(searchFilters.brand) : "",
            capacity: null,
            priceRange: 500,
            brand: searchFilters.brand ? String(searchFilters.brand) : "",
            model: searchFilters.model ? String(searchFilters.model) : 
                  searchFilters.searchTerm ? String(searchFilters.searchTerm) : "",
            year: searchFilters.year ? String(searchFilters.year) : ""
          };
          
          // Update the filters state
          setFilters(initialFilters);
          
          // Update search term if provided
          if (searchFilters.searchTerm || searchFilters.model) {
            setSearchTerm(
              searchFilters.searchTerm ? String(searchFilters.searchTerm) : 
              searchFilters.model ? String(searchFilters.model) : ""
            );
          }
          
          // Apply filters to the vehicles directly
          let filtered = [...vehiclesToFilter];
          
          // Apply type/brand filter
          if (initialFilters.type && typeof initialFilters.type === 'string' && initialFilters.type.trim() !== '') {
            filtered = filtered.filter(vehicle => 
              vehicle.tipoVehiculo.toLowerCase() === initialFilters.type.toLowerCase()
            );
          }
          
          // Apply model or search term filter
          if (initialFilters.model && typeof initialFilters.model === 'string' && initialFilters.model.trim() !== '') {
            if (searchAllFields) {
              filtered = filtered.filter(vehicle => 
                vehicle.modelo.toLowerCase().includes(initialFilters.model.toLowerCase()) ||
                vehicle.tipoVehiculo.toLowerCase().includes(initialFilters.model.toLowerCase()) ||
                vehicle.ano.toString().includes(initialFilters.model)
              );
            } else {
              filtered = filtered.filter(vehicle => 
                vehicle.modelo.toLowerCase().includes(initialFilters.model.toLowerCase())
              );
            }
          }
          
          // Apply year filter
          if (initialFilters.year && (typeof initialFilters.year === 'string' ? initialFilters.year.trim() !== '' : true)) {
            filtered = filtered.filter(vehicle => 
              vehicle.ano.toString() === (typeof initialFilters.year === 'string' ? 
                initialFilters.year : initialFilters.year.toString())
            );
          }
          
          // Update the filtered vehicles
          setFilteredVehicles(filtered);
          setLoading(false);
        } catch (error) {
          console.error("Error applying initial filters:", error);
          setLoading(false);
        }
      };
      
      applyInitialFilters();
    }
  }, [searchFilters, searchAllFields, vehicles, initialLoad]); // Add dependencies to ensure filter is applied correctly

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
    
    // Update searchTerm state if model field changes
    if (filterType === 'model') {
      setSearchTerm(value)
    }
    
    // Also update type/brand if they should be kept in sync
    if (filterType === 'type') {
      setFilters(prev => ({
        ...prev,
        brand: value
      }))
    } else if (filterType === 'brand') {
      setFilters(prev => ({
        ...prev,
        type: value
      }))
    }
  }

  // Mapeo de vehículos para VehicleGrid - Now with fallback for missing properties
  const mappedVehicles = filteredVehicles.map(vehicle => ({
    id: vehicle.idVehiculo,
    brand: vehicle.tipoVehiculo || "Sin marca",
    type: vehicle.tipoVehiculo || "Sin tipo",
    model: vehicle.modelo || "Sin modelo",
    year: vehicle.ano ? vehicle.ano.toString() : "N/A",
    image: vehicle.Image_url || "https://placehold.co/300x200/CCCCCC/666666?text=No+Image",
    seats: vehicle.capacidad || 0,
    transmision: vehicle.transmision || "Manual",
    combustible: vehicle.combustible || "90L",
    price: vehicle.price || 0,
    placa: vehicle.placa || "Sin placa",
    disponible: vehicle.disponible !== undefined ? vehicle.disponible : true
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
                  initialSearchTerm={searchTerm}
                  searchAllFields={searchAllFields}
                />
                <div className="results-info">
                  <p>Mostrando {filteredVehicles.length} vehículos</p>
                </div>
                {filteredVehicles.length > 0 ? (
                  <VehicleGrid vehicles={mappedVehicles} />
                ) : (
                  <div className="no-results">
                    <p>No se encontraron vehículos que coincidan con los filtros seleccionados.</p>
                  </div>
                )}
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