"use client"

import { useState, useEffect } from "react"
import "../Estilos/SideBar.css"

const Sidebar = ({
  selectedType,
  selectedCapacity,
  priceRange,
  onTypeChange,
  onCapacityChange,
  onPriceChange,
  vehicleTypes = [],
  capacities = [],
  vehicles = []
}) => {
  const [selectedTypes, setSelectedTypes] = useState([])
  const [selectedCapacities, setSelectedCapacities] = useState([])

  // Sync the parent selectedType with our local selectedTypes
  useEffect(() => {
    // Only update if there's a selectedType and it's not already in our array
    if (selectedType && !selectedTypes.includes(selectedType)) {
      setSelectedTypes([selectedType]) // Replace the array instead of modifying it
    }
    // If selectedType is null but we have items, clear the array
    else if (!selectedType && selectedTypes.length > 0) {
      setSelectedTypes([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType]) // Only depend on selectedType, not selectedTypes

  // Sync the parent selectedCapacity with our local selectedCapacities
  useEffect(() => {
    // Only update if there's a selectedCapacity and it's not already in our array
    if (selectedCapacity && !selectedCapacities.includes(selectedCapacity)) {
      setSelectedCapacities([selectedCapacity]) // Replace the array instead of modifying it
    }
    // If selectedCapacity is null but we have items, clear the array
    else if (!selectedCapacity && selectedCapacities.length > 0) {
      setSelectedCapacities([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCapacity]) // Only depend on selectedCapacity, not selectedCapacities

  // Calculate counts for each type from actual vehicle data
  const calculateTypeCounts = (type) => {
    return vehicles.filter(vehicle => vehicle.tipoVehiculo === type).length;
  }
  
  // Calculate counts for each capacity from actual vehicle data
  const calculateCapacityCounts = (capacity) => {
    return vehicles.filter(vehicle => vehicle.capacidad === parseInt(capacity)).length;
  }

  // Vehicle type objects with counts calculated from vehicle data
  const formattedVehicleTypes = vehicleTypes.length > 0 
    ? vehicleTypes.map(type => ({
        id: type,
        name: type.charAt(0).toUpperCase() + type.slice(1), // Capitalize first letter
        count: calculateTypeCounts(type)
      }))
    : [
        { id: "furgoneta", name: "Furgoneta", count: 90 },
        { id: "suv", name: "SUV", count: 10 },
        { id: "camion", name: "Camión", count: 15 },
        { id: "sedan", name: "Sedan", count: 20 },
        { id: "comerciales", name: "Comerciales", count: 14 },
        { id: "minibus", name: "Minibús", count: 12 },
        { id: "autobus", name: "Autobús", count: 10 },
        { id: "ambulancias", name: "Ambulancias", count: 14 },
        { id: "hibridos", name: "Híbridos y Eléctricos", count: 14 },
      ];

  // Capacity objects (convert from API format to UI format)
  const formattedCapacities = capacities.length > 0
    ? capacities.map(cap => ({
        id: cap.toString(),
        name: `${cap} Personas`,
        count: calculateCapacityCounts(cap)
      }))
    : [
        { id: "2", name: "2 Personas", count: 10 },
        { id: "4", name: "4 Personas", count: 14 },
        { id: "6", name: "6 Personas", count: 12 },
        { id: "8", name: "8 o más", count: 16 },
      ];

  const handleTypeClick = (typeId) => {
    let newSelectedTypes = [...selectedTypes]

    if (newSelectedTypes.includes(typeId)) {
      // Remove if already selected
      newSelectedTypes = newSelectedTypes.filter((id) => id !== typeId)
    } else {
      // Add if not selected
      newSelectedTypes.push(typeId)
    }

    setSelectedTypes(newSelectedTypes)
    // Update parent state with first selection or null
    onTypeChange(newSelectedTypes.length > 0 ? newSelectedTypes[0] : null)
  }

  const handleCapacityClick = (capacityId) => {
    let newSelectedCapacities = [...selectedCapacities]

    if (newSelectedCapacities.includes(capacityId)) {
      // Remove if already selected
      newSelectedCapacities = newSelectedCapacities.filter((id) => id !== capacityId)
    } else {
      // Add if not selected
      newSelectedCapacities.push(capacityId)
    }

    setSelectedCapacities(newSelectedCapacities)
    // Update parent state with first selection or null
    onCapacityChange(newSelectedCapacities.length > 0 ? newSelectedCapacities[0] : null)
  }

  return (
    <div className="sidebar">
      <div className="filter-section">
        <h3>TIPO</h3>
        <ul className="filter-list">
          {formattedVehicleTypes.map((type) => (
            <li
              key={type.id}
              className={`filter-item ${selectedType === type.id ? "selected" : ""}`}
              onClick={() => handleTypeClick(type.id)}
            >
              <div className="checkbox">
                <input
                  type="checkbox"
                  checked={selectedType === type.id}
                  onChange={() => {}}
                />
                <span className="checkmark"></span>
              </div>
              <span className="filter-name">{type.name}</span>
              <span className="filter-count">({type.count})</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="filter-section">
        <h3>CAPACIDAD</h3>
        <ul className="filter-list">
          {formattedCapacities.map((capacity) => (
            <li
              key={capacity.id}
              className={`filter-item ${selectedCapacity === capacity.id ? "selected" : ""}`}
              onClick={() => handleCapacityClick(capacity.id)}
            >
              <div className="checkbox">
                <input
                  type="checkbox"
                  checked={selectedCapacity === capacity.id}
                  onChange={() => {}}
                />
                <span className="checkmark"></span>
              </div>
              <span className="filter-name">{capacity.name}</span>
              <span className="filter-count">({capacity.count})</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="filter-section">
        <h3>PRECIO</h3>
        <div className="price-slider-container">
          <input
            type="range"
            min="0"
            max="500"
            value={priceRange}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            className="price-slider"
          />
          <div className="price-range">
            Max: ${priceRange.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar









