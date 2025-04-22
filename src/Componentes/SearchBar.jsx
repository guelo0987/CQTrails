"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import "../Estilos/SearchBar.css"
import VehiculeService from '../Services/VehiculeService.ts'

const SearchBar = ({ 
  filters, 
  onFilterChange, 
  initialSearchTerm = "", 
  searchAllFields = false,
  onClearFilters = null
}) => {
  const [models, setModels] = useState([])
  const [allModels, setAllModels] = useState([]) // New state for all models
  const [years, setYears] = useState([])
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [loading, setLoading] = useState({
    models: false,
    years: false,
    allModels: false
  })
  
  // Use refs to track last successful data to avoid UI flickering
  const lastSuccessfulYears = useRef([])
  const lastSuccessfulModels = useRef([])
  const vehicleService = useRef(VehiculeService)

  // Load all models on mount for better search functionality
  useEffect(() => {
    const loadAllModels = async () => {
      try {
        setLoading(prev => ({ ...prev, allModels: true }))
        const vehiclesData = await vehicleService.current.getAllVehicules()
        
        // Extract unique models
        const uniqueModels = Array.from(new Set(vehiclesData.map(v => v.modelo)))
          .filter(model => model && typeof model === 'string' && model.trim() !== '')
          .sort((a, b) => a.localeCompare(b))
        
        setAllModels(uniqueModels)
        // Also update lastSuccessfulModels for fallback
        lastSuccessfulModels.current = uniqueModels
      } catch (error) {
        console.error('Error loading all models:', error)
      } finally {
        setLoading(prev => ({ ...prev, allModels: false }))
      }
    }
    
    loadAllModels()
  }, [])

  // Initialize searchTerm from props when component mounts or changes
  useEffect(() => {
    // Only update if the values are different to avoid infinite loops
    if (initialSearchTerm !== searchTerm && initialSearchTerm !== undefined) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  // Synchronize the model selection with the searchTerm
  useEffect(() => {
    if (filters.model && 
        typeof filters.model === 'string' && 
        filters.model.trim() !== '' && 
        searchTerm === '') {
      // If there's a model selected but no search term, update search term
      setSearchTerm(filters.model);
    }
  }, [filters.model, searchTerm]);

  // Pre-select the model if provided in filters
  useEffect(() => {
    if (filters.model && 
        typeof filters.model === 'string' && 
        filters.model.trim() !== '' && 
        models.length > 0 && 
        !models.includes(filters.model)) {
      // If the provided model is not in the dropdown, add it
      setModels(prevModels => 
        Array.from(new Set([...prevModels, filters.model])).sort((a, b) => a.localeCompare(b))
      );
    }
  }, [filters.model, models]);

  // Fetch models when selected type changes
  useEffect(() => {
    const fetchModels = async () => {
      try {
        // Skip if already loading
        if (loading.models) return
        
        setLoading(prev => ({ ...prev, models: true }))
        
        if (!filters.type || filters.type === '') {
          // If no type is selected, show all models
          setModels(allModels)
          lastSuccessfulModels.current = allModels
        } else {
          // Otherwise filter by brand
          const modelsList = await vehicleService.current.getModelsByBrand(filters.type)
          if (modelsList && Array.isArray(modelsList) && modelsList.length > 0) {
            setModels(modelsList)
            lastSuccessfulModels.current = modelsList
            
            // If we have a model in the filters and it's in the model list, preload its years
            if (filters.model && modelsList.includes(filters.model)) {
              // Preload years for currently selected model
              try {
                setLoading(prev => ({ ...prev, years: true }))
                const yearsList = await vehicleService.current.getYearsByModelAndBrand(
                  filters.model,
                  filters.type
                )
                
                if (yearsList && Array.isArray(yearsList) && yearsList.length > 0) {
                  setYears(yearsList)
                  lastSuccessfulYears.current = yearsList
                }
              } catch (yearsError) {
                console.error('Error pre-loading years:', yearsError)
              } finally {
                setLoading(prev => ({ ...prev, years: false }))
              }
            }
          } else {
            // Use allModels as fallback if no models returned
            setModels(allModels)
          }
        }
      } catch (error) {
        console.error('Error fetching models:', error)
        // Use allModels as fallback if API fails
        setModels(allModels.length > 0 ? allModels : lastSuccessfulModels.current)
      } finally {
        setLoading(prev => ({ ...prev, models: false }))
      }
    }

    fetchModels()
  }, [filters.type, allModels, filters.model])

  // Fetch years when type and model change with debouncing to prevent race conditions
  const yearsFetchTimeout = useRef(null)
  const lastFetchedModelYears = useRef('') // Track the last model we fetched years for
  
  useEffect(() => {
    const fetchYears = async () => {
      // Clear any pending timeout
      if (yearsFetchTimeout.current) {
        clearTimeout(yearsFetchTimeout.current)
      }
      
      if (!filters.model) {
        setYears([])
        return
      }
      
      // Skip if we just fetched years for this model
      // This prevents redundant fetches and endless loading loops
      if (lastFetchedModelYears.current === filters.model) {
        return
      }

      // Add 200ms delay before fetching to prevent rapid requests
      yearsFetchTimeout.current = setTimeout(async () => {
        try {
          // Skip if already loading
          if (loading.years) return
          
          // Mark this model as being fetched
          lastFetchedModelYears.current = filters.model
          
          setLoading(prev => ({ ...prev, years: true }))
          // Use the type (brand) if specified, otherwise pass empty string
          const yearsList = await vehicleService.current.getYearsByModelAndBrand(
            filters.model, 
            filters.type || ''
          )
          
          if (yearsList && Array.isArray(yearsList) && yearsList.length > 0) {
            setYears(yearsList)
            lastSuccessfulYears.current = yearsList
            
            // If a year is selected but not in the list, clear it
            if (filters.year && !yearsList.map(y => y.toString()).includes(filters.year)) {
              onFilterChange('year', '')
            }
          } else {
            // Try to use cached years before falling back to defaults
            if (lastSuccessfulYears.current.length > 0) {
              setYears(lastSuccessfulYears.current)
            } else {
              // Use default years if no years returned
              const currentYear = new Date().getFullYear()
              const defaultYears = [currentYear, currentYear - 1, currentYear - 2]
              setYears(defaultYears)
            }
          }
        } catch (error) {
          console.error('Error fetching years:', error)
          // Check if we have previous successful years to use
          if (lastSuccessfulYears.current.length > 0) {
            setYears(lastSuccessfulYears.current)
          } else {
            // Set some default years if there's an error
            const currentYear = new Date().getFullYear()
            setYears([currentYear, currentYear - 1, currentYear - 2])
          }
        } finally {
          setLoading(prev => ({ ...prev, years: false }))
        }
      }, 200)
    }

    fetchYears()
    
    // Cleanup timeout on unmount
    return () => {
      if (yearsFetchTimeout.current) {
        clearTimeout(yearsFetchTimeout.current)
      }
    }
  }, [filters.type, filters.model, loading.years, filters.year, onFilterChange])

  // Reset the last fetched model when the model or type filter is cleared
  useEffect(() => {
    if (!filters.model || !filters.type) {
      lastFetchedModelYears.current = ''
    }
  }, [filters.model, filters.type])

  // Debounce search to avoid too many updates
  const debounce = (func, delay) => {
    let timeoutId
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        func(...args)
      }, delay)
    }
  }

  // Apply search filter as user types with debouncing
  const debouncedSearch = useCallback(
    debounce((term) => {
      // Ensure term is a string
      const termString = term !== null && term !== undefined ? String(term) : "";
      
      if (termString.trim()) {
        // Apply the search filter with model value
        onFilterChange('model', termString);
      } else if (termString === '') {
        // Clear the filter when search is empty
        onFilterChange('model', '');
        // Clear the year filter too
        onFilterChange('year', '');
      }
    }, 300),
    [onFilterChange]
  )

  // Handle search input changes with real-time filtering
  const handleSearchChange = (e) => {
    const value = e.target.value !== null && e.target.value !== undefined ? String(e.target.value) : "";
    setSearchTerm(value);
    
    // Apply the search filter with debouncing
    debouncedSearch(value);
  }

  const handleModelChange = (e) => {
    const model = e.target.value ? String(e.target.value) : "";
    onFilterChange('model', model);
    // Update search term when model is selected from dropdown
    setSearchTerm(model);
    // Reset year when model changes
    onFilterChange('year', '');
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Immediately apply the search term without debouncing on form submit
    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
      onFilterChange('model', searchTerm);
    }
  }

  // Manejador para el botón de limpiar filtros
  const handleClearFilters = () => {
    // Limpiar el término de búsqueda local
    setSearchTerm('');
    
    // Si se proporcionó una función de limpieza desde el componente padre, usarla
    if (typeof onClearFilters === 'function') {
      onClearFilters();
    } else {
      // Limpieza fallback si no se proporciona onClearFilters
      onFilterChange('model', '');
      onFilterChange('year', '');
      onFilterChange('type', '');
      onFilterChange('brand', '');
    }
  }

  return (
    <div className="search-bar">
      <form onSubmit={handleSearchSubmit} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={searchAllFields ? "Buscar por marca, modelo o año..." : "Buscar por modelo..."}
            className="search-input"
          />
          <button type="submit" className="search-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
          </button>
        </div>
      </form>
      
      <div className="search-dropdowns">
        <div className="search-dropdown">
          <label>Modelo</label>
          <select 
            value={filters.model} 
            onChange={handleModelChange}
            disabled={loading.models}
          >
            <option value="">Todos los modelos</option>
            {models.map((model, index) => (
              <option key={`model-${index}`} value={model}>{model}</option>
            ))}
          </select>
          {loading.models && <span className="loading-indicator">Cargando...</span>}
        </div>
        <div className="search-dropdown">
          <label>Año</label>
          <select 
            value={filters.year} 
            onChange={(e) => onFilterChange('year', e.target.value)}
            disabled={loading.years || !filters.model}
          >
            <option value="">Todos los años</option>
            {years.map((year, index) => (
              <option key={`year-${index}`} value={year.toString()}>{year}</option>
            ))}
          </select>
          {loading.years && <span className="loading-indicator">Cargando...</span>}
        </div>
        <div className="search-actions">
          <button 
            type="button" 
            className="clear-filters-button"
            onClick={handleClearFilters}
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  )
}

export default SearchBar





