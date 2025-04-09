import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import DatePicker, { registerLocale } from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import "../Estilos/ReservationForm.css"
import es from 'date-fns/locale/es'
import axios from 'axios'
import { API_BASE_URL } from '../API/Endpoints.ts'

registerLocale('es', es)

export default function ReservationForm({ price, onSubmit, isLoading = false }) {
  /* eslint-disable-next-line no-unused-vars */
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    startDate: new Date(),
    startTime: "08:00",
    endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    endTime: "08:00",
    quantity: 1,
    cityStartId: 1,
    cityEndId: 1
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [startCity, setStartCity] = useState("1")
  const [endCity, setEndCity] = useState("1")
  const [cities, setCities] = useState([])
  const [loadingCities, setLoadingCities] = useState(false)

  // Cargar las ciudades al montar el componente
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true)
        const response = await axios.get(`${API_BASE_URL}api/Ciudades`)
        setCities(response.data)
        
        // Si hay ciudades disponibles, establecer las predeterminadas
        if (response.data && response.data.length > 0) {
          setStartCity(response.data[0].idCiudad.toString())
          setEndCity(response.data[0].idCiudad.toString())
          setFormData(prev => ({
            ...prev,
            cityStartId: response.data[0].idCiudad,
            cityEndId: response.data[0].idCiudad
          }))
        }
      } catch (error) {
        console.error("Error al cargar ciudades:", error)
        // Establecer ciudades predeterminadas en caso de error
        setCities([
          { idCiudad: 1, nombre: "San José" },
          { idCiudad: 2, nombre: "Alajuela" },
          { idCiudad: 3, nombre: "Cartago" },
          { idCiudad: 4, nombre: "Heredia" }
        ])
      } finally {
        setLoadingCities(false)
      }
    }
    
    fetchCities()
  }, [])

  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }))
  }

  const handleTimeChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name === "startTime" ? "startTime" : "endTime"]: value
    }))
  }

  const handleQuantityChange = (increment) => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + increment)
    }))
  }

  const handleCityChange = (e, isStart) => {
    const cityId = parseInt(e.target.value)
    
    if (isStart) {
      setStartCity(e.target.value)
      setFormData(prev => ({
        ...prev,
        cityStartId: cityId
      }))
    } else {
      setEndCity(e.target.value)
      setFormData(prev => ({
        ...prev,
        cityEndId: cityId
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Formatear los datos antes de enviarlos
    const formattedData = {
      startDate: formatDate(formData.startDate),
      startTime: formData.startTime,
      endDate: formatDate(formData.endDate),
      endTime: formData.endTime,
      quantity: parseInt(formData.quantity, 10),
      cityStartId: parseInt(formData.cityStartId, 10),
      cityEndId: parseInt(formData.cityEndId, 10)
    }

    // Log the formatted data to verify values
    console.log('Reservation form data (formatted):', formattedData);
    console.log('Raw form data for debugging:', {
      startDate: formData.startDate, 
      endDate: formData.endDate,
      cityStartId: formData.cityStartId,
      cityEndId: formData.cityEndId
    });

    // Llamar a la función onSubmit que contiene la lógica del SweetAlert
    onSubmit(formattedData)
  }

  // Función para formatear la fecha en formato YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Time options
  const timeOptions = [
    { value: "08:00", label: "08:00 AM" },
    { value: "09:00", label: "09:00 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "11:00", label: "11:00 AM" },
    { value: "12:00", label: "12:00 PM" },
    { value: "13:00", label: "01:00 PM" },
    { value: "14:00", label: "02:00 PM" },
    { value: "15:00", label: "03:00 PM" },
    { value: "16:00", label: "04:00 PM" },
    { value: "17:00", label: "05:00 PM" },
  ]

  return (
    <form className="reservation-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <div className="date-section">
          <div className="date-column">
            <h3 className="section-title">Inicio</h3>
            <div className="date-time-inputs">
              {/* City Dropdown */}
              <div className="selector-container">
                <label className="selector-label">Ciudad</label>
                <div className="selector-wrapper">
                  <select 
                    className="selector-input" 
                    value={startCity} 
                    onChange={(e) => handleCityChange(e, true)}
                    disabled={loadingCities || isLoading}
                  >
                    {cities.map((city) => (
                      <option key={city.idCiudad} value={city.idCiudad.toString()}>
                        {city.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="selector-icon">
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
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="date-time-row">
                <div className="selector-container">
                  <label className="selector-label">Fecha Inicio</label>
                  <div className="date-picker-wrapper">
                    <DatePicker
                      selected={formData.startDate}
                      onChange={(date) => handleDateChange(date, 'startDate')}
                      dateFormat="dd/MM/yyyy"
                      minDate={new Date()}
                      locale="es"
                      className="selector-input date-input"
                      popperClassName="date-picker-popper"
                      popperPlacement="bottom-start"
                      disabled={isLoading}
                    />
                    <div className="selector-icon">
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
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Start Time Selector */}
                <div className="selector-container">
                  <label className="selector-label">Hora Inicio</label>
                  <div className="selector-wrapper">
                    <select 
                      name="startTime"
                      className="selector-input" 
                      value={formData.startTime} 
                      onChange={handleTimeChange}
                      disabled={isLoading}
                    >
                      {timeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="selector-icon">
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
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="date-column">
            <h3 className="section-title">Fin</h3>
            <div className="date-time-inputs">
              {/* End City Dropdown */}
              <div className="selector-container">
                <label className="selector-label">Ciudad</label>
                <div className="selector-wrapper">
                  <select 
                    className="selector-input" 
                    value={endCity} 
                    onChange={(e) => handleCityChange(e, false)}
                    disabled={loadingCities || isLoading}
                  >
                    {cities.map((city) => (
                      <option key={city.idCiudad} value={city.idCiudad.toString()}>
                        {city.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="selector-icon">
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
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="date-time-row">
                <div className="selector-container">
                  <label className="selector-label">Fecha Final</label>
                  <div className="date-picker-wrapper">
                    <DatePicker
                      selected={formData.endDate}
                      onChange={(date) => handleDateChange(date, 'endDate')}
                      dateFormat="dd/MM/yyyy"
                      minDate={formData.startDate}
                      locale="es"
                      className="selector-input date-input"
                      popperClassName="date-picker-popper"
                      popperPlacement="bottom-start"
                      disabled={isLoading}
                    />
                    <div className="selector-icon">
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
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* End Time Selector */}
                <div className="selector-container">
                  <label className="selector-label">Hora Final</label>
                  <div className="selector-wrapper">
                    <select 
                      name="endTime"
                      className="selector-input" 
                      value={formData.endTime} 
                      onChange={handleTimeChange}
                      disabled={isLoading}
                    >
                      {timeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="selector-icon">
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
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="quantity-section">
          <h3 className="section-title">Cantidad de Vehículos</h3>
          <div className="quantity-control-container">
            <div className="quantity-control">
              <button
                type="button"
                className="quantity-button decrease"
                onClick={() => handleQuantityChange(-1)}
                disabled={formData.quantity <= 1 || isLoading}
                aria-label="Disminuir cantidad"
              >
                -
              </button>
              <span className="quantity-value">{formData.quantity}</span>
              <button
                type="button"
                className="quantity-button increase"
                onClick={() => handleQuantityChange(1)}
                disabled={isLoading}
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="price-section">
        <div className="price-display">
          <span className="price-amount">${price.toFixed(2)}</span>
          <span className="price-period">/ día</span>
        </div>
        <button 
          type="submit" 
          className={`agregar-button ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              <span>Procesando...</span>
            </>
          ) : (
            'Agregar a Carrito'
          )}
        </button>
      </div>

      {showSuccess && (
        <div className="success-message">
          ¡Vehículo agregado al carrito exitosamente!
        </div>
      )}
    </form>
  )
}













