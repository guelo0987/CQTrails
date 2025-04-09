import React from 'react'
import HeaderAuthenticated from '../Componentes/HeaderAuthenticated'
import HeroSection from '../Componentes/HeroSection'
import VehicleSection from '../Componentes/VehicleSection'
import CommercialVehicles from "../Componentes/CommercialVehicle"
import ServicesSection from "../Componentes/ServicesSection"
import WhyChooseUs from "../Componentes/WhyChooseUs"
import Footer from "../Componentes/Footer"
import "../Estilos/Home.css"
import { useNavigate } from 'react-router-dom'
import { authService } from '../Services/AuthService.ts'

function HomeAuthenticated() {
  const navigate = useNavigate()

  const handleLogout = () => {
    authService.handleLogout()
  }

  return (
    <div className="home-page">
      <HeaderAuthenticated onLogout={handleLogout} />
      <main>
        <HeroSection />
        <VehicleSection />
        <CommercialVehicles />
        <ServicesSection />
        <WhyChooseUs />
      </main>
      <Footer />
    </div>
  )
}

export default HomeAuthenticated

