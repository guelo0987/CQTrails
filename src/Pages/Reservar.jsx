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
import { useCart } from '../Context/CartContext'
import getDirectGoogleDriveImageUrl from "../Utils/HelperDriveGoogle.ts"

// Importar imágenes por defecto
import defaultVehicleImage from "../Imagenes/Autobus.png"

function Reservar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = localStorage.getItem("auth") === "true"
  const { addToCart } = useCart()

  // Get filter parameters from navigation state if available
  const searchFilters = location.state?.filters || {}
  const fromHeroSection = location.state?.fromHeroSection || false

  // Date and location variables
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState("")
  const [returnCity, setReturnCity] = useState("")
  const [searchApplied, setSearchApplied] = useState(false)

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

    // Set searchApplied to true when any filter is applied
    if (hasModelFilter || hasBrandFilter || hasYearFilter || hasCapacityFilter) {
      setSearchApplied(true);
    }

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
      
      // Handle any date and location data from search filters
      if (searchFilters.startDate) {
        setStartDate(new Date(searchFilters.startDate));
      }
      
      if (searchFilters.endDate) {
        setEndDate(new Date(searchFilters.endDate));
      }
      
      if (searchFilters.locationId) {
        setSelectedLocation(searchFilters.locationId.toString());
      }
      
      if (searchFilters.returnCityId) {
        setReturnCity(searchFilters.returnCityId.toString());
      }
      
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

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    // Restablecer los filtros a sus valores iniciales
    setFilters({
      type: "",
      capacity: null,
      priceRange: 500, // Valor por defecto
      brand: "",
      model: "",
      year: ""
    });
    
    // Limpiar el término de búsqueda
    setSearchTerm("");
    
    // Reset search date and location fields
    setStartDate(null);
    setEndDate(null);
    setSelectedLocation("");
    setReturnCity("");
    
    // Reset search applied flag
    setSearchApplied(false);
    
    // Obtener todos los vehículos sin filtrar
    if (vehicles.length > 0) {
      setFilteredVehicles(vehicles);
    }
  }

  // Mapeo de vehículos para VehicleGrid - Now with fallback for missing properties
  const mappedVehicles = filteredVehicles.map(vehicle => {
    console.log("Processing vehicle:", vehicle.idVehiculo, vehicle.modelo);
    console.log("Raw image_url:", vehicle.image_url);
    
    // Intentar usar el helper para obtener la URL directa
    const imageUrl = getDirectGoogleDriveImageUrl(vehicle.image_url, "https://placehold.co/300x200/CCCCCC/666666?text=No+Image");
    console.log("Processed image URL:", imageUrl);
    
    return {
      id: vehicle.idVehiculo,
      brand: vehicle.tipoVehiculo || "Sin marca",
      type: vehicle.tipoVehiculo || "Sin tipo",
      model: vehicle.modelo || "Sin modelo",
      year: vehicle.ano ? vehicle.ano.toString() : "N/A",
      image: imageUrl,
      seats: vehicle.capacidad || 0,
      transmision: vehicle.transmision || "Manual",
      combustible: vehicle.combustible || "Gasolina",
      price: vehicle.price || 0,
      placa: vehicle.placa || "Sin placa",
      disponible: vehicle.disponible !== undefined ? vehicle.disponible : true
    };
  });

  // Función para agregar al carrito
  const handleAddToCart = async (vehicle) => {
    let errorMessage = '';
    
    if (!startDate) {
      errorMessage = 'Por favor seleccione una fecha de inicio';
    } else if (!endDate) {
      errorMessage = 'Por favor seleccione una fecha de finalización';
    } else if (!selectedLocation) {
      errorMessage = 'Por favor seleccione una ciudad de recogida';
    } else if (!returnCity) {
      errorMessage = 'Por favor seleccione una ciudad de devolución';
    }
    
    if (errorMessage) {
      alert(errorMessage);
      return;
    }

    const cartItem = {
      vehiculoId: vehicle.idVehiculo,
      cantidad: 1,
      fechaInicio: startDate.toISOString(),
      fechaFin: endDate.toISOString(),
      ciudadInicioId: parseInt(selectedLocation),
      ciudadFinId: parseInt(returnCity)
    };

    const success = await addToCart(cartItem);
    if (success) {
      console.log('Vehículo agregado al carrito con éxito');
    }
  };

  // Renderizar los vehículos
  const renderVehicles = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando vehículos...</p>
        </div>
      )
    }

    if (vehicles.length === 0 && searchApplied) {
      return (
        <div className="no-results">
          <p>No se encontraron vehículos con los criterios seleccionados.</p>
        </div>
      )
    }

    return (
      <div className="vehicle-list">
        {vehicles.map((vehicle) => (
          <div key={vehicle.idVehiculo} className="vehicle-card">
            <div className="vehicle-image-container">
              <img
                src={vehicle.imagenUrl || 'https://via.placeholder.com/300x200?text=Sin+Imagen'}
                alt={`${vehicle.marca} ${vehicle.modelo}`}
                className="vehicle-image"
              />
            </div>
            <div className="vehicle-details">
              <h3>{vehicle.marca} {vehicle.modelo}</h3>
              <div className="vehicle-specs">
                <span><i className="fas fa-user"></i> {vehicle.capacidad}</span>
                <span><i className="fas fa-cog"></i> {vehicle.transmision}</span>
                <span><i className="fas fa-gas-pump"></i> {vehicle.combustible}</span>
              </div>
              <div className="vehicle-price-container">
                <span className="vehicle-price">${vehicle.precio} / día</span>
                <div className="vehicle-buttons">
                  <button
                    className="btn-reservar"
                    onClick={() => handleAddToCart(vehicle)}
                    disabled={!isAuthenticated}
                  >
                    {isAuthenticated ? 'Agregar al carrito' : 'Inicia sesión para reservar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

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
                  onClearFilters={clearAllFilters}
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