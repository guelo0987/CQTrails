import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { PDFDownloadLink } from '@react-pdf/renderer'
import PreFacturaPDF from '../Componentes/PreFacturaPDF'
import HeaderAuthenticated from "../Componentes/HeaderAuthenticated"
import Footer from "../Componentes/Footer"
import "../Estilos/HistorialReservaciones.css"
import { authService } from '../Services/AuthService.ts'
import { reservationService } from '../Services/ReservationService.ts'
import Swal from 'sweetalert2'

export default function HistorialReservaciones() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPeriod, setFilterPeriod] = useState("all")
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const userData = authService.getCurrentUser();
        
        if (!userData || !userData.idUsuario) {
          throw new Error('No se encontró información del usuario');
        }

        const data = await reservationService.getUserReservations(userData.idUsuario);
        setReservations(data || []);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        setError(error.message);
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar las reservaciones',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#09A603'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const handleViewPrefactura = async (reservationId) => {
    try {
      setLoading(true);
      const userData = authService.getCurrentUser();
      
      if (!userData || !userData.idUsuario) {
        throw new Error('No se encontró información del usuario');
      }

      const prefactura = await reservationService.getPrefactura(reservationId, userData.idUsuario);
      
      if (prefactura.archivoPdf) {
        // Open PDF in new tab
        window.open(prefactura.archivoPdf, '_blank');
      } else {
        Swal.fire({
          title: 'Información',
          text: 'La prefactura aún no está disponible',
          icon: 'info',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#09A603'
        });
      }
    } catch (error) {
      console.error('Error fetching prefactura:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar la prefactura. ' + (error.response?.data || error.message),
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#09A603'
      });
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para convertir fecha de texto a objeto Date
  const parseDate = (dateString) => {
    if (!dateString) return new Date();
    return new Date(dateString);
  }

  // Función para filtrar por período
  const filterByPeriod = (reservationsList) => {
    const today = new Date()
    const days = parseInt(filterPeriod)
    
    if (filterPeriod === 'all') return reservationsList;

    return reservationsList.filter(reservation => {
      const reservationDate = parseDate(reservation.fechaReservacion);
      const diffTime = Math.abs(today - reservationDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays <= days;
    });
  }

  // Aplicar ambos filtros: búsqueda y período
  const filteredReservations = filterByPeriod(reservations).filter(reservation => 
    !searchTerm || 
    (reservation.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (new Date(reservation.fechaReservacion).toLocaleDateString().includes(searchTerm))
  );

  const getStatusClass = (estado) => {
    if (!estado) return 'status-pending';
    
    switch(estado.toLowerCase()) {
      case 'aceptada': return 'status-approved';
      case 'aprobada': return 'status-approved';
      case 'denegada': return 'status-denied';
      default: return 'status-pending';
    }
  }

  if (loading) {
    return (
      <div className="historial-container">
        <HeaderAuthenticated />
        <main className="historial-content">
          <div className="loading-container">
            <div className="spinner large"></div>
            <p>Cargando historial de reservaciones...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="historial-container">
        <HeaderAuthenticated />
        <main className="historial-content">
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button 
              className="retry-button" 
              onClick={() => window.location.reload()}
            >
              Intentar de nuevo
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
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
        
        {reservations.length === 0 ? (
          <div className="empty-reservations">
            <p>No tienes reservaciones en tu historial</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/reservar')}
            >
              Hacer una reservación
            </button>
          </div>
        ) : (
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
                  <tr key={reservation.idReservacion}>
                    <td>{new Date(reservation.fechaReservacion).toLocaleDateString()}</td>
                    <td>{`${reservation.usuario?.nombre || ''} ${reservation.usuario?.apellido || ''}`}</td>
                    <td>${reservation.total.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(reservation.estado)}`}>
                        {reservation.estado || 'Pendiente'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        onClick={() => {
                          navigate(`/historial/${reservation.idReservacion}`);
                        }}
                        className="action-button view-button"
                      >
                        Ver detalles
                      </button>
                      {(reservation.estado === 'Aceptada' || reservation.estado === 'Aprobada') && (
                        <button
                          onClick={() => handleViewPrefactura(reservation.idReservacion)}
                          className="action-button download-button-outline"
                        >
                          Ver Pre-Factura
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  )
}


