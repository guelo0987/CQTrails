import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import "../Estilos/VehicleSection.css"

// Importar imágenes de vehículos
import van from "../Imagenes/Furgoneta.png"
import truck from "../Imagenes/CamionC.png"
import suv from "../Imagenes/Carro Rav4.png"
import minibus from "../Imagenes/Minibus.png"
import sedan from "../Imagenes/CarroKia.png"
import pickup from "../Imagenes/Camioneta.png"
import camion from "../Imagenes/CamionLarge.png"
import crossover from "../Imagenes/Autobus.png"

// Importar logos de marcas
import toyotaLogo from "../Imagenes/Logo Hyundai.png"
import lexusLogo from "../Imagenes/Logo Lexus.png"
import hyundaiLogo from "../Imagenes/Logo Toyota.png"
import rangeLogo from "../Imagenes/Logo Range Rover.png"

// Importar el servicio de vehículos
import  VehicleService from "../Services/VehiculeService.ts"

function VehicleSection() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Imágenes por defecto para usar
  const defaultImages = [van, truck, suv, minibus, crossover, sedan, camion, pickup];
  const defaultLogos = [lexusLogo, hyundaiLogo, toyotaLogo, toyotaLogo, rangeLogo, lexusLogo, toyotaLogo, toyotaLogo];
  
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        // Usar la función correcta del servicio
        const response = await VehicleService.getAllVehicules();
        
        // Tomar solo los primeros 8 vehículos
        const firstEightVehicles = response.slice(0, 8).map((vehicle, index) => ({
          id: vehicle.id || index + 1,
          name: vehicle.modelo || `Vehículo ${index + 1}`,
          price: `$${vehicle.price || '99.00'}/ dady`,
          image: crossover, // Usar Autobus.png para todos
          logo: defaultLogos[index % defaultLogos.length],
          bgClass: index % 2 === 0 ? "bg-white" : "bg-mint",
        }));
        
        setVehicles(firstEightVehicles);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicles();
  }, []);

  return (
    <section className="cq-vehicles">
      <div className="cq-vehicles__container">
        <div className="cq-vehicles__header">
          <h2 className="cq-vehicles__title">¡Explora nuestros vehículos disponibles!</h2>
          <Link to="/reservar" className="cq-vehicles__catalog-link">
            Ver todos los vehículos
          </Link>
        </div>

        <div className="cq-vehicles__grid">
          {loading ? (
            <p>Cargando vehículos...</p>
          ) : (
            vehicles.map((vehicle) => (
              <div 
                key={vehicle.id} 
                className={`cq-vehicles__card ${vehicle.bgClass === 'bg-mint' ? 'cq-vehicles__card--mint' : 'cq-vehicles__card--white'}`}
              >
                <div className="cq-vehicles__image-wrapper">
                  <img 
                    src={vehicle.image} 
                    alt={vehicle.name} 
                    className="cq-vehicles__image"
                  />
                </div>
                <div className="cq-vehicles__info">
                  <div className="cq-vehicles__brand">
                    <img 
                      src={vehicle.logo} 
                      alt="Logo marca" 
                      className="cq-vehicles__brand-logo"
                    />
                    <h3 className="cq-vehicles__name">{vehicle.name}</h3>
                  </div>
                  <p className="cq-vehicles__price">{vehicle.price}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

export default VehicleSection






