import { useState, useEffect } from "react"
import "../Estilos/VehicleGallery.css"
import getDirectGoogleDriveImageUrl from "../Utils/HelperDriveGoogle.ts"

// Importar imágenes adicionales para cada tipo de vehículo
import interiorFurgoneta from "../Imagenes/FurgonetaInterior.jpg"
import lateralFurgoneta from "../Imagenes/Furgoneta2.png"
import interiorSuv from "../Imagenes/Rav4Interior.png"
import lateralSuv from "../Imagenes/Rav4Lateral.png"
import interiorCamion from "../Imagenes/CamionetaCargaInterior.png"
import lateralCamion from "../Imagenes/CamionetaCargaLateral.png"
import interiorBus from "../Imagenes/Autobus 2.png"
import lateralBus from "../Imagenes/autobus-lujo-interior.jpg"
import interiorAmbulancia from "../Imagenes/AmbulanciaInterior.png"
import lateralAmbulancia from "../Imagenes/AmbulanciaLateral.png"
import defaultVehicleImage from "../Imagenes/Autobus.png"

function VehicleGallery({ vehicle }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [vehicleImages, setVehicleImages] = useState([])

  useEffect(() => {
    // Usar vehicle prop si está disponible, de lo contrario, buscar en localStorage
    const vehicleData = vehicle || JSON.parse(localStorage.getItem('selectedVehicle'))
    
    if (vehicleData) {
      console.log("VehicleGallery received vehicle data:", vehicleData);
      
      // Determinar qué conjunto de imágenes usar basado en el tipo de vehículo
      let interiorImage, lateralImage;
      let vehicleType = vehicleData.type?.toLowerCase() || '';
      
      // Procesar imagen principal del vehículo desde Google Drive si existe
      let vehicleImage = vehicleData.image || '';
      console.log("Original vehicle image:", vehicleImage);
      
      // Si la imagen es una cadena JSON, procesarla con el helper
      if (typeof vehicleImage === 'string' && (vehicleImage.includes('drive.google.com') || vehicleImage.includes('{"image1"'))) {
        vehicleImage = getDirectGoogleDriveImageUrl(vehicleImage, defaultVehicleImage);
        console.log("Processed vehicle image with helper:", vehicleImage);
      }
      
      switch(vehicleType) {
        case 'furgoneta':
          interiorImage = interiorFurgoneta;
          lateralImage = lateralFurgoneta;
          break;
        case 'suv':
          interiorImage = interiorSuv;
          lateralImage = lateralSuv;
          break;
        case 'camion':
          interiorImage = interiorCamion;
          lateralImage = lateralCamion;
          break;
        case 'autobus':
          interiorImage = interiorBus;
          lateralImage = lateralBus;
          break;
        case 'ambulancias':
          interiorImage = interiorAmbulancia;
          lateralImage = lateralAmbulancia;
          break;
        default:
          interiorImage = vehicleImage;
          lateralImage = vehicleImage;
      }

      console.log("Tipo de vehículo:", vehicleType);
      console.log("Imágenes seleccionadas:", [vehicleImage, interiorImage, lateralImage]);

      setVehicleImages([
        { id: 1, src: vehicleImage, alt: "Vista frontal" },
        { id: 2, src: interiorImage, alt: "Vista interior" },
        { id: 3, src: lateralImage, alt: "Vista lateral" }
      ])
    }
  }, [vehicle])

  return (
    <div className="vehicle-gallery">
      <div className="gallery-container">
        <div className="main-image-container">
          <img
            src={vehicleImages[selectedImage]?.src}
            alt={vehicleImages[selectedImage]?.alt}
            className="main-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/600x400/CCCCCC/666666?text=No+Image";
            }}
          />
        </div>
        <div className="thumbnails-container">
          {vehicleImages.map((image, index) => (
            <div
              key={image.id}
              className={`thumbnail ${selectedImage === index ? "active" : ""}`}
              onClick={() => setSelectedImage(index)}
            >
              <img 
                src={image.src} 
                alt={image.alt} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/150x100/CCCCCC/666666?text=No+Image";
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VehicleGallery





