import { useState, useEffect } from "react"
import "../Estilos/VehicleGallery.css"
import getDirectGoogleDriveImageUrl, { getAllGoogleDriveImages } from "../Utils/HelperDriveGoogle.ts"

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
      
      
      // Get the vehicle's image_url from API or the image property from the vehicle object
      // On the detail page, the image_url property should be available directly or nested in raw data
      const imageUrlData = vehicleData.image_url || vehicleData.rawData?.image_url || vehicleData.image || '';
      
      // Get all images from the Google Drive JSON
      let allVehicleImages = [];
      
      if (imageUrlData) {
        
        allVehicleImages = getAllGoogleDriveImages(imageUrlData, defaultVehicleImage);
        
      }
      
      // If no images were found in the API data, use default images based on vehicle type
      if (allVehicleImages.length === 0 || (allVehicleImages.length === 1 && allVehicleImages[0] === defaultVehicleImage)) {
        console.log("No API images found, using type-based defaults");
        
        let interiorImage, lateralImage;
        let vehicleType = vehicleData.type?.toLowerCase() || '';
        let mainImage = defaultVehicleImage;
        
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
            interiorImage = mainImage;
            lateralImage = mainImage;
        }

        // Create image objects for the gallery
        setVehicleImages([
          { id: 1, src: mainImage, alt: "Vista frontal" },
          { id: 2, src: interiorImage, alt: "Vista interior" },
          { id: 3, src: lateralImage, alt: "Vista lateral" }
        ]);
      } else {
        // Use the API images
        
        const galleryImages = allVehicleImages.map((src, index) => ({
          id: index + 1,
          src,
          alt: `Vista ${index + 1}`
        }));
        
        setVehicleImages(galleryImages);
      }
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
        {vehicleImages.length > 1 && (
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
        )}
      </div>
    </div>
  )
}

export default VehicleGallery





