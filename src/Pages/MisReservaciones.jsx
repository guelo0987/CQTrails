import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderAuthenticated from '../Componentes/HeaderAuthenticated';
import Footer from '../Componentes/Footer';
import { authService } from '../Services/AuthService';
import { reservationService } from '../Services/ReservationService';
import '../Estilos/MisReservaciones.css';
import Swal from 'sweetalert2';

export default function MisReservaciones() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const userData = authService.getCurrentUser();
        
        if (!userData || !userData.idUsuario) {
          throw new Error('No se encontró información del usuario');
        }

        const data = await reservationService.getUserReservations(userData.idUsuario);
        console.log('Reservaciones obtenidas:', data);
        setReservations(data);
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

  if (loading) {
    return (
      <div className="mis-reservaciones-container">
        <HeaderAuthenticated />
        <main className="mis-reservaciones-content">
          <div className="loading-container">
            <div className="spinner large"></div>
            <p>Cargando reservaciones...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mis-reservaciones-container">
        <HeaderAuthenticated />
        <main className="mis-reservaciones-content">
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
    <div className="mis-reservaciones-container">
      <HeaderAuthenticated />
      
      <main className="mis-reservaciones-content">
        <div className="title-bar">
          <h1>Mis Reservaciones</h1>
        </div>

        {reservations.length === 0 ? (
          <div className="empty-reservations">
            <p>No tienes reservaciones activas</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/reservar')}
            >
              Hacer una reservación
            </button>
          </div>
        ) : (
          <div className="reservations-grid">
            {reservations.map((reservation) => (
              <div key={reservation.idReservacion} className="reservation-card">
                <div className="reservation-header">
                  <h3>Reservación #{reservation.idReservacion}</h3>
                  <span className={`status-badge ${reservation.estado.toLowerCase()}`}>
                    {reservation.estado}
                  </span>
                </div>

                <div className="reservation-details">
                  <div className="detail-item">
                    <span className="label">Fecha de inicio:</span>
                    <span className="value">{new Date(reservation.fechaInicio).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Fecha de fin:</span>
                    <span className="value">{new Date(reservation.fechaFin).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Total:</span>
                    <span className="value">${reservation.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="vehicles-list">
                  <h4>Vehículos:</h4>
                  <ul>
                    {reservation.vehiculos.map((vehicle) => (
                      <li key={vehicle.idVehiculo}>
                        {vehicle.modelo} - {vehicle.placa}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="reservation-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => handleViewPrefactura(reservation.idReservacion)}
                    disabled={reservation.estado !== 'Aceptada'}
                  >
                    Ver Prefactura
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
} 