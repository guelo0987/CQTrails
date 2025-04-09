import "../Estilos/HeroSection.css"
import heroCar from "../Imagenes/hero-car.png"
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import VehiculeService from '../Services/VehiculeService.ts'

const HeroSection = ({ vehicles = [] }) => {
  const navigate = useNavigate()
  const [brands, setBrands] = useState([])
  const [allModels, setAllModels] = useState([])
  const [models, setModels] = useState([])
  const [years, setYears] = useState([])
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)

  // Load all vehicles on component mount to have a complete dataset
  useEffect(() => {
    const loadAllVehicles = async () => {
      try {
        setIsLoading(true)
        const vehiclesData = await VehiculeService.getAllVehicules()
        
        // Extract unique models from all vehicles
        const uniqueModels = Array.from(new Set(vehiclesData.map(v => v.modelo)))
          .sort((a, b) => a.localeCompare(b))
        
        setAllModels(uniqueModels)
      } catch (error) {
        console.error('Error loading all vehicles:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadAllVehicles()
  }, [])

  // Load all brands when component mounts
  useEffect(() => {
    const loadBrands = async () => {
      try {
        setIsLoading(true)
        const brandsData = await VehiculeService.getAllBrands()
        setBrands(brandsData)
        if (brandsData.length > 0) {
          setSelectedBrand(brandsData[0])
        }
      } catch (error) {
        console.error('Error loading brands:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadBrands()
  }, [])

  // Load models when brand changes or show all models if no brand is selected
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true)
        if (!selectedBrand || selectedBrand === '') {
          // If no brand selected, use all models
          setModels(allModels)
        } else {
          // Otherwise filter by brand
          const modelsData = await VehiculeService.getModelsByBrand(selectedBrand)
          setModels(modelsData)
        }
      } catch (error) {
        console.error('Error loading models:', error)
        // Use allModels as fallback if API fails
        setModels(allModels)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadModels()
  }, [selectedBrand, allModels])

  // Load years when model changes
  useEffect(() => {
    const loadYears = async () => {
      if (!selectedModel) return
      
      try {
        setIsLoading(true)
        // Try to get years for the model, using the brand if available
        const yearsData = await VehiculeService.getYearsByModelAndBrand(
          selectedModel, 
          selectedBrand || '' // Pass empty string if no brand selected
        )
        setYears(yearsData)
        if (yearsData.length > 0) {
          setSelectedYear(yearsData[0])
        } else {
          setSelectedYear('')
        }
      } catch (error) {
        console.error('Error loading years:', error)
        // Set some default years if there's an error
        const currentYear = new Date().getFullYear()
        setYears([currentYear, currentYear - 1, currentYear - 2])
        setSelectedYear(currentYear.toString())
      } finally {
        setIsLoading(false)
      }
    }
    
    loadYears()
  }, [selectedBrand, selectedModel])

  // Handle search input changes and generate suggestions from all available data
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    
    if (value.length > 1) {
      // Create suggestions from models, brands, and years
      
      // Include all models that match the search term
      const modelSuggestions = allModels
        .filter(model => model.toLowerCase().includes(value.toLowerCase()))
        .map(model => ({ type: 'model', value: model }))
      
      // Add brand suggestions
      const brandSuggestions = brands
        .filter(brand => brand.toLowerCase().includes(value.toLowerCase()))
        .map(brand => ({ type: 'brand', value: brand }))
      
      // Add year suggestions
      const yearSuggestions = years
        .filter(year => year.toString().includes(value))
        .map(year => ({ type: 'year', value: year.toString() }))
      
      // Combine all suggestions with models first
      const allSuggestions = [...modelSuggestions, ...brandSuggestions, ...yearSuggestions]
      
      // Limit to 10 suggestions
      setSuggestions(allSuggestions.slice(0, 10))
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Handle suggestion selection
  const handleSuggestionClick = async (suggestion) => {
    setShowSuggestions(false)
    setIsLoading(true)
    
    try {
      // Apply the selected filter
      if (suggestion.type === 'model') {
        setSelectedModel(suggestion.value)
        
        // Find the brand for this model
        const brandsForModel = await VehiculeService.getBrandsForModel(suggestion.value)
        if (brandsForModel && brandsForModel.length > 0) {
          setSelectedBrand(brandsForModel[0])
        }
      } else if (suggestion.type === 'brand') {
        setSelectedBrand(suggestion.value)
      } else if (suggestion.type === 'year') {
        setSelectedYear(suggestion.value)
      }
    } catch (error) {
      console.error('Error applying filters:', error)
    } finally {
      setIsLoading(false)
    }
    
    // Clear search term
    setSearchTerm('')
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle submit by navigating to reservation page with all search parameters
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Prepare filter parameters, ensuring they have valid values
    const searchTermValue = searchTerm.trim();
    const modelValue = selectedModel || '';
    const brandValue = selectedBrand || '';
    const yearValue = selectedYear || '';
    
    // Special handling for search term: use it as model if no model is selected
    const modelToUse = modelValue || searchTermValue;
    
    const filters = {
      brand: brandValue,
      model: modelToUse,
      year: yearValue,
      searchTerm: searchTermValue,
      searchAllFields: true
    }
    
    // Only include non-empty values to prevent unnecessary filtering
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '')
    );
    
    // Add searchAllFields back if it was removed
    if (!cleanFilters.searchAllFields) {
      cleanFilters.searchAllFields = true;
    }
    
    // Navigate to the reservar page with the search parameters
    navigate('/reservar', {
      state: {
        filters: cleanFilters,
        fromHeroSection: true // Flag to indicate this navigation came from HeroSection
      }
    })
  }

  return (
    <section className="cq-hero">
      <div className="cq-hero__container">
        <div className="cq-hero__content">
          <h1 className="cq-hero__title">
            Movilidad
            <br />
            <span className="cq-hero__title-highlight">eficiente y segura</span>
            <br />
            para tu empresa
          </h1>
          <button className="cq-hero__cta-button" onClick={() => navigate('/reservar')}>¡Reserva ya!</button>
        </div>
        
        <div className="cq-hero__image-wrapper">
          <img src={heroCar} alt="Vehículo de lujo" className="cq-hero__image" />
        </div>
      </div>

      <div className="cq-hero__search">
        <form className="cq-hero__search-form" onSubmit={handleSubmit}>
          <div className="cq-hero__search-field">
            <label className="cq-hero__search-label">Marca</label>
            <div className="cq-hero__select-wrapper">
              <select 
                className="cq-hero__select" 
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                disabled={isLoading || brands.length === 0}
              >
                {brands.length === 0 && <option value="">Cargando...</option>}
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
              <svg
                className="cq-hero__select-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <div className="cq-hero__search-field">
            <label className="cq-hero__search-label">Modelo</label>
            <div className="cq-hero__select-wrapper">
              <select 
                className="cq-hero__select" 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={isLoading || models.length === 0}
              >
                {models.length === 0 && <option value="">Seleccione marca primero</option>}
                {models.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
              <svg
                className="cq-hero__select-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <div className="cq-hero__search-field">
            <label className="cq-hero__search-label">Año</label>
            <div className="cq-hero__select-wrapper">
              <select 
                className="cq-hero__select" 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                disabled={isLoading || years.length === 0}
              >
                {years.length === 0 && <option value="">Seleccione modelo primero</option>}
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <svg
                className="cq-hero__select-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <div className="cq-hero__search-field cq-hero__search-field--with-button" ref={searchRef}>
            <input 
              type="text" 
              placeholder="Buscar marca, modelo o año" 
              className="cq-hero__search-input"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="cq-hero__suggestions">
                {suggestions.map((suggestion, index) => (
                  <div 
                    key={`${suggestion.type}-${suggestion.value}-${index}`}
                    className="cq-hero__suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <span className="cq-hero__suggestion-type">
                      {suggestion.type === 'brand' ? 'Marca: ' : 
                       suggestion.type === 'model' ? 'Modelo: ' : 'Año: '}
                    </span>
                    {suggestion.value}
                  </div>
                ))}
              </div>
            )}
            <button type="submit" className="cq-hero__search-button" disabled={isLoading}>
              {isLoading ? (
                <span className="cq-hero__loading-spinner"></span>
              ) : (
                <>
                  <span className="cq-hero__search-button-text">Buscar</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {hasSearched && (
        <div className="cq-hero__search-results">
          <h2 className="cq-hero__results-title">Resultados de búsqueda</h2>
          {isLoading ? (
            <div className="cq-hero__loading">Cargando resultados...</div>
          ) : searchResults.length > 0 ? (
            <div className="cq-hero__results-grid">
              {searchResults.map(vehicle => (
                <div key={vehicle.idVehiculo} className="cq-hero__result-card">
                  <img 
                    src={vehicle.Image_url} 
                    alt={vehicle.modelo} 
                    className="cq-hero__result-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300x200?text=No+Image+Available";
                    }}
                  />
                  <div className="cq-hero__result-details">
                    <h3 className="cq-hero__result-title">{vehicle.modelo}</h3>
                    <p className="cq-hero__result-info">Año: {vehicle.ano}</p>
                    <p className="cq-hero__result-info">Tipo: {vehicle.tipoVehiculo}</p>
                    <p className="cq-hero__result-info">Capacidad: {vehicle.capacidad} personas</p>
                    <p className="cq-hero__result-price">${vehicle.price}/día</p>
                    <button 
                      className="cq-hero__result-button"
                      onClick={() => navigate(`/vehiculo/${vehicle.idVehiculo}`)}
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="cq-hero__no-results">
              No se encontraron vehículos que coincidan con tu búsqueda.
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default HeroSection









