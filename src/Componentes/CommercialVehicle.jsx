import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import "../Estilos/CommercialVehicles.css"
import VehiculeService from "../Services/VehiculeService.ts"

// Importamos las imágenes de los vehículos
import camionDefault from "../Imagenes/Camionp.png"

// Importamos los logos de las marcas
import renaultLogo from "../Imagenes/Logo Renault.png" 
import volvoLogo from "../Imagenes/Logo Volvo.png" 

function CommercialVehicles() {
  const [trucks, setTrucks] = useState([]);

  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        const allVehicles = await VehiculeService.getAllVehicules();
        const truckVehicles = allVehicles
          .filter(vehicle => vehicle.tipoVehiculo === "Truck")
          .slice(0, 2); // Solo tomamos los primeros 2 vehículos tipo truck
        setTrucks(truckVehicles);
      } catch (error) {
        console.error("Error fetching truck vehicles:", error);
      }
    };

    fetchTrucks();
  }, []);

  // Función para obtener el logo según la marca
  const getBrandLogo = (brand) => {
    // Por defecto usamos el logo de Volvo
    return volvoLogo;
  };

  return (
    <section className="commercial-section">
      <div className="commercial-container">
        <div className="section-header">
          <h2 className="commercialVehicle-title">Vehículos Comerciales</h2>
          <Link to="/reservar" className="view-more">
            Ver más{" "}
            <svg
              className="arrow-icon"
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
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </Link>
        </div>

        <div className="commercial-grid">
          {trucks.map((truck, index) => (
            <div className="commercial-card" key={truck.id || index}>
              <div className="card-content">
                <img src={getBrandLogo(truck.marca)} alt={truck.marca || "Marca"} className="brand-logo" />
                <h3 className="commercial-brand">
                  {truck.tipoVehiculo || "Marca"}
                  <br />
                  {truck.modelo || "Modelo"}
                </h3>
                <div className="price-badge">$ {truck.price || "0"}</div>
              </div>
              <div className="commercial-image">
                <img src={camionDefault} alt={`${truck.marca || "Marca"} ${truck.modelo || "Modelo"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CommercialVehicles



