"use client"

import React, { useState, useEffect } from 'react'
import "../Estilos/SearchBar.css"
import VehiculeService from '../Services/VehiculeService.ts'

const SearchBar = ({ filters, onFilterChange }) => {
  const [models, setModels] = useState([])
  const [years, setYears] = useState([])
  const [loading, setLoading] = useState({
    models: false,
    years: false
  })

  // Fetch models when selected type changes
  useEffect(() => {
    const fetchModels = async () => {
      if (!filters.type) {
        setModels([])
        return
      }

      try {
        setLoading(prev => ({ ...prev, models: true }))
        // Using type as brand since tipoVehiculo seems to contain the brand
        const modelsList = await VehiculeService.getModelsByBrand(filters.type)
        setModels(modelsList)
      } catch (error) {
        console.error('Error fetching models:', error)
        setModels([])
      } finally {
        setLoading(prev => ({ ...prev, models: false }))
      }
    }

    fetchModels()
  }, [filters.type])

  // Fetch years when type and model change
  useEffect(() => {
    const fetchYears = async () => {
      if (!filters.type || !filters.model) {
        setYears([])
        return
      }

      try {
        setLoading(prev => ({ ...prev, years: true }))
        const yearsList = await VehiculeService.getYearsByModelAndBrand(filters.model, filters.type)
        setYears(yearsList)
      } catch (error) {
        console.error('Error fetching years:', error)
        setYears([])
      } finally {
        setLoading(prev => ({ ...prev, years: false }))
      }
    }

    if (filters.model) {
      fetchYears()
    }
  }, [filters.type, filters.model])

  const handleModelChange = (e) => {
    const model = e.target.value
    onFilterChange('model', model)
    // Reset year when model changes
    onFilterChange('year', '')
  }

  return (
    <div className="search-bar">
      <div className="search-dropdowns">
        <div className="search-dropdown">
          <label>Modelo</label>
          <select 
            value={filters.model} 
            onChange={handleModelChange}
            disabled={loading.models || !filters.type}
          >
            <option value="">Todos los modelos</option>
            {models.map((model, index) => (
              <option key={index} value={model}>{model}</option>
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
              <option key={index} value={year.toString()}>{year}</option>
            ))}
          </select>
          {loading.years && <span className="loading-indicator">Cargando...</span>}
        </div>
      </div>
    </div>
  )
}

export default SearchBar





