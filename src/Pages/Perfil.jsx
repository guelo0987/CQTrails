"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import HeaderAuthenticated from "../Componentes/HeaderAuthenticated"
import Footer from "../Componentes/Footer"
import "../Estilos/Perfil.css"
import { User, Edit, Lock, LogOut, Trash2, ChevronRight, ArrowRight } from "lucide-react"
import ConfirmationModal from "../Componentes/ConfirmationModal"
import LoginPopUp from "../Componentes/LoginPopUp"
import { authService } from "../Services/AuthService.ts"
import { reservationService } from "../Services/ReservationService.ts"
import { empresaService } from "../Services/EmpresaService.ts"
import { notificationService } from "../Utils/notificationService.ts"
import getDirectGoogleDriveImageUrl, { getAllGoogleDriveImages } from "../Utils/HelperDriveGoogle.ts"

// Importar imágenes de vehículos
import furgoneta1 from "../Imagenes/Furgoneta.png"
import furgoneta2 from "../Imagenes/Camioneta.png"
import furgoneta3 from "../Imagenes/Minibus.png"

// Mapeo de tipos de vehículos a imágenes
const vehicleImages = {
  "Furgoneta": furgoneta1,
  "Camioneta": furgoneta2,
  "Minibus": furgoneta3,
  "SUV": furgoneta2
}

// Función para formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export default function Perfil() {
  const navigate = useNavigate();
  
  // Estado para manejar el modo de edición
  const [editMode, setEditMode] = useState(false)
  
  // Estado para el modal de confirmación de eliminar cuenta
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  
  // Estado para el modal de confirmación de cerrar sesión
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  // Estado para el modal de login
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  // Estado para los datos del usuario
  const [userData, setUserData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    
  })

  // Estado para los datos de la empresa
  const [empresaData, setEmpresaData] = useState(null)
  
  // Estado para almacenar los datos temporales durante la edición
  const [tempData, setTempData] = useState({ ...userData })
  
  // Estado para las reservaciones recientes
  const [recentReservations, setRecentReservations] = useState([])
  const [loadingReservations, setLoadingReservations] = useState(true)
  const [reservationError, setReservationError] = useState(null)
  
  // Estado para manejar errores y carga durante la actualización
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateError, setUpdateError] = useState(null)

  // Obtener los datos del usuario y empresa al cargar el componente
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Obtener datos del usuario del localStorage
        const user = authService.getCurrentUser();
        
        if (user) {
          const userData = {
            nombre: user.nombre || "",
            apellido: user.apellido || "",
            email: user.email || "",
            telefono: user.telefono || ""
          };
          
          setUserData(userData);
          setTempData({...userData});
          
          // Obtener datos de la empresa asociada al usuario
          if (user.email) {
            try {
              const empresa = await empresaService.getEmpresaByEmail(user.email);
              setEmpresaData(empresa);
              
              // Añadir los datos de la empresa al estado temporal para el formulario
              setTempData(prev => ({
                ...prev,
                nombreEmpresa: empresa.nombre,
                telefonoEmpresa: empresa.contactoTelefono
              }));
            } catch (error) {
              console.error("Error al obtener datos de la empresa:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };
    
    fetchUserData();
  }, []);

  // Obtener las reservaciones recientes al cargar el componente
  useEffect(() => {
    const fetchRecentReservations = async () => {
      try {
        setLoadingReservations(true);
        const user = authService.getCurrentUser();
        
        if (!user || !user.idUsuario) {
          throw new Error('No se encontró información del usuario');
        }

        const reservations = await reservationService.getUserReservations(user.idUsuario);
        
        // Log the raw reservations data in development mode to help troubleshoot
        if (process.env.NODE_ENV === 'development') {
          console.log('Raw reservations data:', reservations);
        }
        
        // Tomar solo las 3 más recientes
        const recentOnes = Array.isArray(reservations) ? 
          reservations.slice(0, 3) : 
          [];
        
        // Process reservations to extract and normalize vehicle data
        const processedReservations = recentOnes.map(reservation => {
          // Get first vehicle from the vehicles array (if exists)
          const firstVehicle = reservation.vehiculos && reservation.vehiculos.length > 0 
            ? reservation.vehiculos[0] 
            : null;
            
          // Add vehicle image properties directly to the reservation for easier access
          return {
            ...reservation,
            // Keep the vehicle data properties needed for display
            vehiculo: firstVehicle?.modelo || "Vehículo",
            tipoVehiculo: firstVehicle?.tipoVehiculo || "Tipo de vehículo",
            // Extract image URL from the vehicle - keep raw value for processing later
            imageUrl: firstVehicle?.imageUrl,
            image_url: firstVehicle?.image_url,
            Image_url: firstVehicle?.Image_url,
            imagenUrl: firstVehicle?.imagenUrl,
            imagen: firstVehicle?.imagen,
            // Store original vehicle for direct access
            firstVehicleData: firstVehicle
          };
        });
          
        // Log processed reservations with image data
        if (process.env.NODE_ENV === 'development' && processedReservations.length > 0) {
          processedReservations.forEach(reservation => {
            console.log(`Processed reservation ${reservation.id || reservation.idReservacion} vehicle image properties:`, {
              vehiculo: reservation.vehiculo,
              tipoVehiculo: reservation.tipoVehiculo,
              imageUrl: reservation.imageUrl,
              image_url: reservation.image_url,
              Image_url: reservation.Image_url,
              imagenUrl: reservation.imagenUrl,
              imagen: reservation.imagen,
              // Log the raw vehicle data for debugging
              rawVehiculo: reservation.vehiculos && reservation.vehiculos.length > 0 ? reservation.vehiculos[0] : null
            });
          });
        }
          
        setRecentReservations(processedReservations);
      } catch (error) {
        console.error('Error al obtener reservaciones recientes:', error);
        setReservationError(error.message);
      } finally {
        setLoadingReservations(false);
      }
    };

    fetchRecentReservations();
  }, []);

  // Función para navegar a la página de detalles de reservación
  const handleViewReservationDetail = (reservationId) => {
    navigate(`/historial/${reservationId}`);
  };

  // Función para manejar el cambio en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setTempData({
      ...tempData,
      [name]: value,
    })
  }



  // Función para guardar los cambios
  const handleSaveChanges = async () => {
    try {
      setUpdateLoading(true);
      setUpdateError(null);
      
      // Preparar datos para la actualización
      const updateData = {
        currentEmail: userData.email,
        newNombre: tempData.nombre,
        newApellido: tempData.apellido,
        newEmail: tempData.email,
        // Añadir datos de la empresa si existen
        newNombreEmpresa: tempData.nombreEmpresa || (empresaData ? empresaData.nombre : null),
        newTelefonoEmpresa: tempData.telefonoEmpresa || (empresaData ? empresaData.contactoTelefono : null)
      };
      
      // Llamar al servicio para actualizar usuario y empresa
      await authService.updateUserAndEmpresa(updateData);
      
      // Actualizar el estado local con los nuevos datos
      setUserData({
        ...tempData,
        // Eliminar los campos específicos de la empresa del userData
        nombreEmpresa: undefined,
        telefonoEmpresa: undefined
      });
      
      // Actualizar los datos de la empresa en el estado
      if (empresaData) {
        setEmpresaData({
          ...empresaData,
          nombre: tempData.nombreEmpresa || empresaData.nombre,
          contactoTelefono: tempData.telefonoEmpresa || empresaData.contactoTelefono
        });
      }
      
      // Si el email cambió, actualizar los datos de la empresa
      if (userData.email !== tempData.email) {
        try {
          const empresa = await empresaService.getEmpresaByEmail(tempData.email);
          setEmpresaData(empresa);
        } catch (error) {
          console.error("Error al obtener datos actualizados de la empresa:", error);
        }
      }
      
      setEditMode(false);
      
      // Reemplazar el alert con una notificación más atractiva
      notificationService.showSuccess("Información actualizada correctamente");
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      setUpdateError("Error al actualizar la información. Por favor, intente de nuevo.");
      notificationService.showError("Error al actualizar la información. Por favor, intente de nuevo.");
    } finally {
      setUpdateLoading(false);
    }
  }

  // Función para cancelar la edición
  const handleCancelEdit = () => {
    // Restablecer todos los campos, incluidos los de la empresa
    setTempData({
      ...userData,
      // Si hay datos de empresa, añadirlos al estado temporal
      nombreEmpresa: empresaData ? empresaData.nombre : '',
      telefonoEmpresa: empresaData ? empresaData.contactoTelefono : ''
    });
    setEditMode(false);
  }

  // Función para abrir el modal de eliminación de cuenta
  const handleDeleteClick = (e) => {
    e.preventDefault()
    setIsDeleteModalOpen(true)
  }
  
  // Función para abrir el modal de cierre de sesión
  const handleLogoutClick = (e) => {
    e.preventDefault()
    setIsLogoutModalOpen(true)
  }

  // Función para manejar el cierre de sesión
  const handleConfirmLogout = () => {
    // Eliminar el estado de autenticación del localStorage
    localStorage.removeItem("auth")
    // Redirigir a la página principal
    window.location.href = "/"
  }
  
  // Función para cancelar el cierre de sesión
  const handleCancelLogout = () => {
    setIsLogoutModalOpen(false)
  }

  // Función para confirmar la eliminación de cuenta
  const handleConfirmDelete = () => {
    // Cerrar el modal de confirmación y abrir el modal de login
    setIsDeleteModalOpen(false)
    setIsLoginModalOpen(true)
  }

  // Función para manejar el cierre del modal de login
  const handleLoginClose = () => {
    setIsLoginModalOpen(false)
  }

  // Función para manejar el login exitoso antes de eliminar la cuenta
  const handleLoginSuccess = () => {
    // Aquí iría la lógica para eliminar la cuenta después de verificar la identidad
    console.log("Identidad verificada, cuenta eliminada")
    setIsLoginModalOpen(false)
    // Redirigir al usuario a la página de inicio (o donde corresponda)
    window.location.href = "/"
  }

  // Función para manejar la recuperación de contraseña
  const handleForgotPassword = () => {
    setIsLoginModalOpen(false)
    // Aquí podría redirigir a una página de recuperación de contraseña
    console.log("Redirigir a recuperación de contraseña")
  }

  // Función para cancelar la eliminación de cuenta
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
  }

  // Renderizar la sección de reservaciones recientes
  const renderRecentReservations = () => {
    if (loadingReservations) {
      return <div className="loading-message">Cargando reservaciones recientes...</div>;
    }

    if (reservationError) {
      return <div className="error-message">Error al cargar reservaciones: {reservationError}</div>;
    }

    if (recentReservations.length === 0) {
      return (
        <div className="empty-reservations">
          <p>No tienes reservaciones recientes</p>
          <Link to="/reservar" className="cta-button">Reservar ahora</Link>
        </div>
      );
    }

    return (
      <div className="reservations-table">
        {recentReservations.map((reservacion) => {
          // Get all possible image URL properties and process image to get direct URL
          let vehicleImageSource;
          
          // Check if we have a vehicle with imageUrl in JSON format
          if (reservacion.vehiculos && reservacion.vehiculos.length > 0 && reservacion.vehiculos[0].imageUrl) {
            vehicleImageSource = reservacion.vehiculos[0].imageUrl;
          } else if (reservacion.firstVehicleData?.imageUrl) {
            vehicleImageSource = reservacion.firstVehicleData.imageUrl;
          } else {
            // Use normalized properties we added earlier
            vehicleImageSource = reservacion.imageUrl || 
                               reservacion.Image_url || 
                               reservacion.image_url || 
                               reservacion.imagenUrl ||
                               reservacion.imagen;
          }
          
          // Debug logging for image URLs
          if (process.env.NODE_ENV === 'development') {
            console.log(`Reservation ID ${reservacion.id || reservacion.idReservacion} image sources:`, {
              vehiculosArray: reservacion.vehiculos,
              firstVehicleImageUrl: reservacion.vehiculos && reservacion.vehiculos.length > 0 ? reservacion.vehiculos[0].imageUrl : null,
              firstVehicleData: reservacion.firstVehicleData,
              image_url: reservacion.image_url,
              Image_url: reservacion.Image_url,
              imageUrl: reservacion.imageUrl,
              imagenUrl: reservacion.imagenUrl,
              imagen: reservacion.imagen,
              selected: vehicleImageSource
            });
          }
                                    
          const vehicleImg = vehicleImageSource
            ? getDirectGoogleDriveImageUrl(vehicleImageSource, vehicleImages[reservacion.tipoVehiculo] || furgoneta1) 
            : vehicleImages[reservacion.tipoVehiculo] || furgoneta1;
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`Processed vehicle image for reservation ${reservacion.id || reservacion.idReservacion}:`, vehicleImg);
          }
          
          return (
            <div 
              key={reservacion.id || reservacion.idReservacion} 
              className="reservacion-item"
              onClick={() => handleViewReservationDetail(reservacion.id || reservacion.idReservacion)}
            >
              <div className="reservacion-info">
                <div className="vehicle-cell">
                  <div className="vehicle-img-container">
                    <img 
                      src={vehicleImg} 
                      alt={reservacion.tipoVehiculo || "Vehículo"} 
                      className="vehicle-thumbnail"
                      onError={(e) => {
                        console.log("Profile vehicle image failed to load:", e.target.src);
                        e.target.onerror = null;
                        e.target.src = vehicleImages[reservacion.tipoVehiculo] || furgoneta1;
                      }}
                    />
                  </div>
                  <div className="vehicleperfil-info">
                    <div className="vehicle-name">{reservacion.vehiculo || reservacion.nombreVehiculo || "Vehículo"}</div>
                    <div className="vehicle-type">{reservacion.tipoVehiculo || "Tipo de vehículo"}</div>
                  </div>
                </div>
                
                <div className="reservacion-fecha">
                  {formatDate(reservacion.fecha || reservacion.fechaReservacion)}
                </div>
                
                <div className="reservacion-detalles">
                  <div className={`status-badge ${reservacion.estado?.toLowerCase() || 'pendiente'}`}>
                    {reservacion.estado || "Pendiente"}
                  </div>
                  
                  <div className="reservacion-total">
                    ${reservacion.total || reservacion.montoTotal || "0.00"}
                  </div>
                  
                  <div className="reservacion-arrow">
                    <ChevronRight size={20} color="#09A603" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="perfil-container">
      <HeaderAuthenticated />

      <div className="perfil-content">
        {/* Barra lateral */}
        <aside className="perfil-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-header">
              <User size={20} />
              <span>Gestionar Cuenta</span>
            </div>

            <div className="sidebar-menu">
              <Link to="/perfil" className="sidebar-item active">
                <Edit size={18} />
                <span>Editar Información Personal</span>
              </Link>
              <Link to="/cambiar-contrasena" className="sidebar-item">
                <Lock size={18} />
                <span>Cambiar Contraseña</span>
              </Link>
            </div>
          </div>

          <div className="sidebar-section">
            <Link to="#" onClick={(e) => { e.preventDefault(); setIsLogoutModalOpen(true); }} className="sidebar-item">
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </Link>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="perfil-main">
          {/* Banner del perfil */}
          <div className="perfil-hero">
            <div className="hero-content">
              <h1>{userData.nombre} {userData.apellido}</h1>
              <p>{userData.email}</p>
              {empresaData && (
                <p className="empresa-info">Empresa: {empresaData.nombre}</p>
              )}
            </div>
          </div>

          {/* Secciones del perfil */}
          <div className="perfil-sections">
            {/* Información personal */}
            <section className="perfil-section">
              <div className="sectionperfil-header">
                <h2>Información personal</h2>
                {!editMode ? (
                  <button className="edit-button" onClick={() => setEditMode(true)}>
                    <Edit size={18} />
                    <span>Editar</span>
                  </button>
                ) : null}
              </div>
              <div className="section-content">
                {editMode ? (
                  <div className="edit-form">
                    <div className="form-group">
                      <label htmlFor="nombre">Nombre</label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={tempData.nombre}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="apellido">Apellido</label>
                      <input
                        type="text"
                        id="apellido"
                        name="apellido"
                        value={tempData.apellido}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Correo Electrónico</label>
                      <input type="email" id="email" name="email" value={tempData.email} onChange={handleInputChange} />
                    </div>
                    
                    {/* Campos para editar información de la empresa */}
                    {empresaData && (
                      <>
                        <div className="form-group">
                          <label htmlFor="nombreEmpresa">Nombre de Empresa</label>
                          <input
                            type="text"
                            id="nombreEmpresa"
                            name="nombreEmpresa"
                            value={tempData.nombreEmpresa || empresaData.nombre}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="telefonoEmpresa">Teléfono de Empresa</label>
                          <input
                            type="text"
                            id="telefonoEmpresa"
                            name="telefonoEmpresa"
                            value={tempData.telefonoEmpresa || empresaData.contactoTelefono}
                            onChange={handleInputChange}
                          />
                        </div>
                      </>
                    )}
                    
                    {updateError && <div className="error-message">{updateError}</div>}
                    <div className="form-actions">
                      <button className="cancel-button" onClick={handleCancelEdit} disabled={updateLoading}>
                        Cancelar
                      </button>
                      <button className="save-button" onClick={handleSaveChanges} disabled={updateLoading}>
                        {updateLoading ? "Guardando..." : "Guardar Cambios"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="info-grid">
                    <div className="info-row">
                      <div className="info-label">Nombre:</div>
                      <div className="info-value">{userData.nombre}</div>
                    </div>
                    <div className="info-row">
                      <div className="info-label">Apellido:</div>
                      <div className="info-value">{userData.apellido}</div>
                    </div>
                    <div className="info-row">
                      <div className="info-label">Correo Electrónico:</div>
                      <div className="info-value">{userData.email}</div>
                    </div>
                    {empresaData && (
                      <>
                        <div className="info-row">
                          <div className="info-label">Empresa:</div>
                          <div className="info-value">{empresaData.nombre}</div>
                        </div>
                        <div className="info-row">
                          <div className="info-label">Teléfono Empresa:</div>
                          <div className="info-value">{empresaData.contactoTelefono}</div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Sección de reservaciones recientes */}
            <section className="perfil-section">
              <div className="sectionperfil-header">
                <h2>Reservaciones Recientes</h2>
                <Link to="/historial" className="edit-button">
                  <span>Ver todas</span>
                  <ChevronRight size={18} />
                </Link>
              </div>
              <div className="section-content">
                {renderRecentReservations()}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Modal de confirmación para eliminar cuenta */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          setIsDeleteModalOpen(false);
          setIsLoginModalOpen(true);
        }}
        title="¿Estás seguro de que quiere eliminar su cuenta?"
        message="Esta acción no se puede deshacer. Todos sus datos serán eliminados permanentemente."
        confirmText="Estoy seguro"
        cancelText="No estoy seguro"
      />
      
      {/* Modal de confirmación para cerrar sesión */}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          localStorage.removeItem("auth");
          window.location.href = "/";
        }}
        title="¿Estás seguro de que desea cerrar sesión?"
        message="Tendrás que volver a iniciar sesión para acceder a tu cuenta."
        confirmText="Estoy seguro"
        cancelText="No estoy seguro"
      />

      {/* Modal de login para verificar identidad */}
      <LoginPopUp 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => {
          console.log("Identidad verificada, cuenta eliminada");
          setIsLoginModalOpen(false);
          window.location.href = "/";
        }} 
        onForgotPassword={() => {
          setIsLoginModalOpen(false);
          console.log("Redirigir a recuperación de contraseña");
        }}
      />

      <Footer />
    </div>
  );
}











