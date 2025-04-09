"use client"

import React, { useState, useEffect, useCallback } from 'react'
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

  // Load all models on mount for better search functionality
  useEffect(() => {
    const loadAllModels = async () => {
      try {
        setLoading(prev => ({ ...prev, allModels: true }))
        const vehiclesData = await VehiculeService.getAllVehicules()
        
        // Extract unique models
        const uniqueModels = Array.from(new Set(vehiclesData.map(v => v.modelo)))
          .sort((a, b) => a.localeCompare(b))
        
        setAllModels(uniqueModels)
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
        setLoading(prev => ({ ...prev, models: true }))
        
        if (!filters.type || filters.type === '') {
          // If no type is selected, show all models
          setModels(allModels)
        } else {
          // Otherwise filter by brand
          const modelsList = await VehiculeService.getModelsByBrand(filters.type)
          setModels(modelsList.length > 0 ? modelsList : allModels)
        }
      } catch (error) {
        console.error('Error fetching models:', error)
        // Use allModels as fallback if API fails
        setModels(allModels)
      } finally {
        setLoading(prev => ({ ...prev, models: false }))
      }
    }

    fetchModels()
  }, [filters.type, allModels])

  // Fetch years when type and model change
  useEffect(() => {
    const fetchYears = async () => {
      if (!filters.model) {
        setYears([])
        return
      }

      try {
        setLoading(prev => ({ ...prev, years: true }))
        // Use the type (brand) if specified, otherwise pass empty string
        const yearsList = await VehiculeService.getYearsByModelAndBrand(
          filters.model, 
          filters.type || ''
        )
        setYears(yearsList)
      } catch (error) {
        console.error('Error fetching years:', error)
        // Set some default years if there's an error
        const currentYear = new Date().getFullYear()
        setYears([currentYear, currentYear - 1, currentYear - 2])
      } finally {
        setLoading(prev => ({ ...prev, years: false }))
      }
    }

    fetchYears()
  }, [filters.type, filters.model])

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





