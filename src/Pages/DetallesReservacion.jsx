import HeaderAuthenticated from "../Componentes/HeaderAuthenticated"
import Footer from "../Componentes/Footer"
import "../Estilos/DetallesReservacion.css"
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import TotalSummary from '../Componentes/TotalSummary'
import { PDFDownloadLink } from '@react-pdf/renderer'
import PreFacturaPDF from '../Componentes/PreFacturaPDF'
import { reservationService } from '../Services/ReservationService.ts'

// Importar imágenes de vehículos
import furgoneta1 from "../Imagenes/Furgoneta.png"
import furgoneta2 from "../Imagenes/Camioneta.png"
import furgoneta3 from "../Imagenes/Minibus.png"

// Mapeo de tipos de vehículos a imágenes
const vehicleImages = {
  "Sedan": furgoneta1,
  "SUV": furgoneta2,
  "Minivan": furgoneta3
}

// Función para formatear fecha y hora
const formatDateTime = (dateString) => {
  if (!dateString) return { date: "N/A", time: "N/A" };
  
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const formattedTime = date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return { date: formattedDate, time: formattedTime };
};

export default function DetallesReservacion() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [reservacionInfo, setReservacionInfo] = useState(null)
  const [vehiculosReservados, setVehiculosReservados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formUserIdInput, setFormUserIdInput] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  
  // Obtener el ID de usuario de diferentes fuentes
  const getUserId = () => {
    const checkStorage = (storage, name) => {
      try {
        const posiblesFuentes = [
          'idUsuario', 'userId', 'userInfo', 'user', 'userData', 'currentUser',
          'authUser', 'auth', 'usuario', 'datosUsuario', 'clienteData'
        ];
        
        for (const key of posiblesFuentes) {
          const valor = storage.getItem(key);
          if (valor) {
            // Si es un número directo
            if (!isNaN(parseInt(valor)) && parseInt(valor) > 0) {
              return parseInt(valor);
            }
            
            // Intenta parsearlo como JSON
            try {
              const objeto = JSON.parse(valor);
              
              // Buscar campos comunes de ID de usuario en el objeto
              const camposId = ['idUsuario', 'userId', 'id', 'usuarioId', 'user_id', 'ID'];
              for (const campo of camposId) {
                if (objeto[campo] && !isNaN(parseInt(objeto[campo])) && parseInt(objeto[campo]) > 0) {
                  return parseInt(objeto[campo]);
                }
              }
              
              // Si el objeto mismo es un número
              if (typeof objeto === 'number' && objeto > 0) {
                return objeto;
              }
            } catch (e) {
              // No es JSON, ignora y sigue
            }
          }
        }
        
        return null;
      } catch (error) {
        console.error(`Error al acceder a ${name}:`, error);
        return null;
      }
    };
    
    // Revisar localStorage
    const localStorageId = checkStorage(localStorage, 'localStorage');
    if (localStorageId) return localStorageId;
    
    // Revisar sessionStorage
    const sessionStorageId = checkStorage(sessionStorage, 'sessionStorage');
    if (sessionStorageId) return sessionStorageId;
    
    return null;
  };
  
  const userId = getUserId();

  useEffect(() => {
    const fetchReservationDetails = async () => {
      // Validar ID de reservación
      if (!id) {
        setError('ID de reservación no especificado en la URL');
        setLoading(false);
        return;
      }
      
      // Validar ID de usuario
      if (!userId) {
        setError('ID de usuario no disponible. Es posible que necesite iniciar sesión nuevamente o usar el formulario para ingresar el ID.');
        setLoading(false);
        return;
      }
      
      try {
        // Convertir el ID de la URL a número si es necesario
        const reservationId = parseInt(id);
        
        if (isNaN(reservationId)) {
          setError('ID de reservación inválido');
          setLoading(false);
          return;
        }
        
        // Obtener el detalle de la reservación específica directamente usando el endpoint dedicado
        console.log(`Obteniendo detalle de reservación: userId=${userId}, reservationId=${reservationId}`);
        const reservacion = await reservationService.getReservationDetail(userId, reservationId);
        
        if (reservacion) {
          console.log('Reservación encontrada:', reservacion);
          setReservacionInfo(reservacion);
          
          // Asignar imágenes a los vehículos
          const vehiculosConImagen = reservacion.vehiculos.map(vehiculo => ({
            ...vehiculo,
            imagen: vehicleImages[vehiculo.tipoVehiculo] || furgoneta1 // Imagen predeterminada si no hay coincidencia
          }));
          
          setVehiculosReservados(vehiculosConImagen);
        } else {
          setError(`No se encontró la reservación con ID: ${reservationId}`);
        }
      } catch (err) {
        console.error('Error al obtener detalles de reservación:', err);
        if (err.response) {
          // Error de respuesta del servidor
          setError(`Error del servidor: ${err.response.status} - ${err.response.data || 'Sin detalles'}`);
        } else if (err.request) {
          // No se recibió respuesta
          setError('No se pudo conectar con el servidor. Verifique su conexión a internet.');
        } else {
          // Error al configurar la solicitud
          setError(`Error al procesar la solicitud: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReservationDetails();
  }, [id, userId, navigate]);

  const handleVolverClick = () => {
    navigate('/historial');
  };

  const handleReintentarClick = () => {
    setLoading(true);
    setError(null);
    // Recargar la página para volver a intentar
    window.location.reload();
  };
  
  const handleMostrarFormulario = () => {
    setMostrarFormulario(true);
  };
  
  const handleSubmitFormulario = (e) => {
    e.preventDefault();
    const idIngresado = parseInt(formUserIdInput);
    
    if (!isNaN(idIngresado) && idIngresado > 0) {
      // Guardar temporalmente en localStorage para esta sesión
      localStorage.setItem('idUsuario', idIngresado.toString());
      setLoading(true);
      setError(null);
      window.location.reload();
    } else {
      alert('Por favor ingrese un ID de usuario válido (número mayor a 0)');
    }
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="detalles-reservacion-container">
        <HeaderAuthenticated />
        <main className="detalles-reservacion-content">
          <div className="loading-container">
            <p>Cargando detalles de la reservación...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Mostrar mensaje de error si ocurrió alguno
  if (error) {
    return (
      <div className="detalles-reservacion-container">
        <HeaderAuthenticated />
        <main className="detalles-reservacion-content">
          <div className="error-container">
            <h2>Error</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={handleReintentarClick} className="retry-button">
                Reintentar
              </button>
              <button onClick={handleVolverClick} className="back-button">
                Volver al Historial
              </button>
            </div>
            
            {!userId && (
              <div className="error-help">
                <p>Sugerencia: Parece que no hay información de sesión disponible.</p>
                
                {!mostrarFormulario ? (
                  <div className="error-options">
                    <button onClick={handleMostrarFormulario} className="option-button">
                      Ingresar ID de usuario manualmente
                    </button>
                    <button onClick={() => navigate('/login')} className="login-button">
                      Ir a Login
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitFormulario} className="user-id-form">
                    <label htmlFor="userId">ID de Usuario:</label>
                    <input 
                      type="number" 
                      id="userId" 
                      value={formUserIdInput} 
                      onChange={(e) => setFormUserIdInput(e.target.value)}
                      min="1"
                      required
                    />
                    <button type="submit">Confirmar</button>
                  </form>
                )}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Si no hay datos de reservación después de cargar
  if (!reservacionInfo) {
    return (
      <div className="detalles-reservacion-container">
        <HeaderAuthenticated />
        <main className="detalles-reservacion-content">
          <div className="error-container">
            <h2>No se encontró la reservación</h2>
            <p>La reservación con ID #{id} no existe o no pertenece a su cuenta.</p>
            <button onClick={handleVolverClick} className="back-button">
              Volver al Historial
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const subtotal = reservacionInfo.subTotal?.toFixed(2) || "0.00"
  const iva = (parseFloat(subtotal) * 0.13).toFixed(2)
  const total = reservacionInfo.total?.toFixed(2) || "0.00"
  
  // Formatear fechas
  const fechaInicio = formatDateTime(reservacionInfo.fechaInicio);
  const fechaFin = formatDateTime(reservacionInfo.fechaFin);
  const fechaReservacion = formatDateTime(reservacionInfo.fechaReservacion);

  return (
    <div className="detalles-reservacion-container">
      <HeaderAuthenticated />

      <main className="detalles-reservacion-content">
        <div className="reservacion-header">
          <div className="reservacion-info">
            <h1>Detalles de Reservación</h1>
            <span className="reservacion-id">#{reservacionInfo.idReservacion}</span>
          </div>
          <div className="header-actions">
            <span className={`estado-badge ${reservacionInfo.estado.toLowerCase()}`}>
              {reservacionInfo.estado}
            </span>
            {reservacionInfo.estado.toLowerCase() === 'aprobada' && (
              <PDFDownloadLink
                document={
                  <PreFacturaPDF
                    reservacionInfo={{
                      id: reservacionInfo.idReservacion,
                      fecha: fechaReservacion.date,
                      usuario: `${reservacionInfo.usuario.nombre} ${reservacionInfo.usuario.apellido || ''}`,
                      correo: reservacionInfo.usuario.email,
                      telefono: "N/A", // No disponible en el API
                      direccion: "N/A", // No disponible en el API
                      estado: reservacionInfo.estado
                    }}
                    vehiculos={vehiculosReservados}
                    subtotal={subtotal}
                    iva={iva}
                    total={total}
                  />
                }
                fileName={`pre-factura-${reservacionInfo.idReservacion}.pdf`}
                className="download-button download-button-filled"
              >
                {({ blob, url, loading, error }) =>
                  loading ? 'Generando PDF...' : 'Descargar Pre-Factura'
                }
              </PDFDownloadLink>
            )}
          </div>
        </div>

        {/* Sección de información en dos columnas */}
        <div className="info-columns">
          <div className="info-column">
            <div className="info-card">
              <h2>Información de Contacto</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Nombre</span>
                  <span className="info-value">{reservacionInfo.usuario.nombre} {reservacionInfo.usuario.apellido || ''}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Correo</span>
                  <span className="info-value">{reservacionInfo.usuario.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">ID Usuario</span>
                  <span className="info-value">{reservacionInfo.usuario.idUsuario}</span>
                </div>
                {reservacionInfo.requerimientosAdicionales && (
                  <div className="info-item">
                    <span className="info-label">Requerimientos Adicionales</span>
                    <span className="info-value">{reservacionInfo.requerimientosAdicionales}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="info-column">
            <div className="info-card">
              <h2>Información de Reservación</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Fecha de Reservación</span>
                  <span className="info-value">{fechaReservacion.date}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Hora de Reservación</span>
                  <span className="info-value">{fechaReservacion.time}</span>
                </div>
                {reservacionInfo.fechaConfirmacion && (
                  <div className="info-item">
                    <span className="info-label">Fecha de Confirmación</span>
                    <span className="info-value">{formatDateTime(reservacionInfo.fechaConfirmacion).date}</span>
                  </div>
                )}
                {reservacionInfo.rutaPersonalizada && (
                  <div className="info-item">
                    <span className="info-label">Ruta Personalizada</span>
                    <span className="info-value">{reservacionInfo.rutaPersonalizada}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="content-grid">
          <div className="main-content">
            <div className="vehiculos-section">
              <h2>Vehículos Reservados</h2>
              {vehiculosReservados.length > 0 ? (
                vehiculosReservados.map(vehiculo => (
                  <div key={vehiculo.idVehiculo} className="vehiculo-card">
                    <div className="vehiculo-info">
                      <div className="vehiculo-imagen">
                        <img src={vehiculo.imagen} alt={vehiculo.modelo} />
                      </div>
                      <div className="vehiculo-detalles">
                        <h3>{vehiculo.modelo}</h3>
                        <p className="vehiculo-tipo">{vehiculo.tipoVehiculo}</p>
                        <p className="vehiculo-placa">Placa: {vehiculo.placa}</p>
                        <p className="vehiculo-capacidad">Capacidad: {vehiculo.capacidad} pasajeros</p>
                        <p className="vehiculo-ano">Año: {vehiculo.ano}</p>
                        <div className="fechas-grid">
                          <div className="fecha-grupo">
                            <span className="fecha-label">Inicio</span>
                            <span className="fecha-valor">{fechaInicio.date}</span>
                            <span className="hora-valor">{fechaInicio.time}</span>
                          </div>
                          <div className="fecha-grupo">
                            <span className="fecha-label">Fin</span>
                            <span className="fecha-valor">{fechaFin.date}</span>
                            <span className="hora-valor">{fechaFin.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="vehiculo-estado">
                        <span className="estado-label">Estado</span>
                        <span className="estado-valor">{vehiculo.estadoAsignacion}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-vehiculos">No hay vehículos en esta reservación</p>
              )}
            </div>
          </div>

          <div className="side-content">
            <TotalSummary 
              subtotal={subtotal}
              total={total}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}





