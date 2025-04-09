import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { PDFDownloadLink } from '@react-pdf/renderer'
import PreFacturaPDF from '../Componentes/PreFacturaPDF'
import HeaderAuthenticated from "../Componentes/HeaderAuthenticated"
import Footer from "../Componentes/Footer"
import "../Estilos/HistorialReservaciones.css"

export default function HistorialReservaciones() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPeriod, setFilterPeriod] = useState("all")
  const navigate = useNavigate()

  const reservations = [
    {
      id: "RES-2025-001",
      fecha: "20 de Julio de 2022",
      reservadaA: "Marco Polo",
      total: "14.00",
      subtotal: "12.39",
      estado: "Aprobada",
      empresa: "Empresa A",
      correo: "empresa@example.com",
      telefono: "+506 1234-5678",
      direccion: "San José, Costa Rica",
      vehiculos: [
        {
          id: 1,
          nombre: "Toyota Hiace",
          tipo: "Furgoneta",
          fechaInicio: "20 de Julio de 2022",
          fechaFin: "22 de Julio 2022",
          cantidad: 1,
          subtotal: "12.39"
        }
      ]
    },
    {
      id: "RES-2025-002",
      fecha: "5 de Marzo de 2025",
      reservadaA: "Polo Marco",
      total: "14.00",
      estado: "Pendiente"
    },
    {
      id: "RES-2024-003",
      fecha: "30 de Mayo de 2023",
      reservadaA: "Polo Marco",
      total: "14.00",
      estado: "Denegada"
    },
  ]

  // Función auxiliar para convertir fecha de texto a objeto Date
  const parseDate = (dateString) => {
    const months = {
      'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
      'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    }
    
    const parts = dateString.toLowerCase().split(' de ')
    const day = parseInt(parts[0])
    const month = months[parts[1]]
    const year = parseInt(parts[2])
    
    return new Date(year, month, day)
  }

  // Función para filtrar por período
  const filterByPeriod = (reservations) => {
    const today = new Date()
    const days = parseInt(filterPeriod)
    
    if (filterPeriod === 'all') return reservations

    return reservations.filter(reservation => {
      const reservationDate = parseDate(reservation.fecha)
      const diffTime = Math.abs(today - reservationDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      return diffDays <= days
    })
  }

  // Aplicar ambos filtros: búsqueda y período
  const filteredReservations = filterByPeriod(reservations).filter(reservation => 
    reservation.reservadaA.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.fecha.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusClass = (estado) => {
    switch(estado.toLowerCase()) {
      case 'aprobada': return 'status-approved'
      case 'denegada': return 'status-denied'
      default: return 'status-pending'
    }
  }

  return (
    <div className="historial-container">
      <HeaderAuthenticated />

      <main className="historial-content">
        <h1 className="page-title">Historial de Reservaciones</h1>

        <div className="filter-search-container">
          <div className="search-container">
            <svg 
              className="search-icon"
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
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Buscar por nombre o fecha..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="select-container">
            <select 
              className="period-select"
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
            >
              <option value="all">Todo el historial</option>
              <option value="30">Últimos 30 días</option>
              <option value="60">Últimos 60 días</option>
              <option value="90">Últimos 90 días</option>
            </select>
            <svg 
              className="select-icon"
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
        
        <div className="reservations-table-container">
          <table className="reservationshistorial-table">
            <thead>
              <tr>
                <th>Fecha de Reservación</th>
                <th>Reservada a</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map(reservation => (
                <tr key={reservation.id}>
                  <td>{reservation.fecha}</td>
                  <td>{reservation.reservadaA}</td>
                  <td>${reservation.total}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(reservation.estado)}`}>
                      {reservation.estado}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      onClick={() => {
                        console.log("Navegando a detalles de reservación:", reservation.id);
                        const reservationId = String(reservation.id);
                        window.location.href = `/historial/${reservationId}`;
                      }}
                      className="action-button view-button"
                    >
                      Ver detalles
                    </button>
                    {reservation.estado.toLowerCase() === 'aprobada' && (
                      <PDFDownloadLink
                        document={
                          <PreFacturaPDF
                            reservacionInfo={{
                              id: `REV-${reservation.id}`,
                              fecha: reservation.fecha,
                              empresa: reservation.empresa,
                              correo: reservation.correo,
                              telefono: reservation.telefono,
                              direccion: reservation.direccion,
                              estado: reservation.estado
                            }}
                            vehiculos={reservation.vehiculos}
                            subtotal={reservation.subtotal}
                            iva={(parseFloat(reservation.subtotal) * 0.13).toFixed(2)}
                            total={reservation.total}
                          />
                        }
                        fileName={`pre-factura-${reservation.id}.pdf`}
                        className="action-button download-button-outline"
                      >
                        {({ blob, url, loading, error }) =>
                          loading ? 'Generando PDF...' : 'Descargar Pre-Factura'
                        }
                      </PDFDownloadLink>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}


