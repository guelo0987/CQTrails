import "./App.css"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from 'react-hot-toast'

import Home from "./Pages/Home"
import HomeAuthenticated from "./Pages/HomeAuthenticated"
import Reservar from "./Pages/Reservar"
import AgregarReserva from "./Pages/AgregarReserva"
import HistorialReservaciones from "./Pages/HistorialReservaciones"
import MiCarrito from "./Pages/MiCarrito"
import DetallesReservacion from "./Pages/DetallesReservacion"
import Contacto from "./Pages/Contacto"
import Perfil from "./Pages/Perfil"
import CambiarContrasena from "./Pages/CambiarContrasena"
import { Navigate } from "react-router-dom"

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("auth") === "true"
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }
  
  return children
}

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" />
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/reservar" element={<Reservar />} />
          
          {/* Rutas protegidas */}
          <Route 
            path="/home-auth" 
            element={
              <ProtectedRoute>
                <HomeAuthenticated />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/agregar-reserva/:id" 
            element={
              <ProtectedRoute>
                <AgregarReserva />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/historial" 
            element={
              <ProtectedRoute>
                <HistorialReservaciones />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/perfil" 
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cambiar-contrasena" 
            element={
              <ProtectedRoute>
                <CambiarContrasena />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/micarrito" 
            element={
              <ProtectedRoute>
                <MiCarrito />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/historial/:id" 
            element={
              <ProtectedRoute>
                <DetallesReservacion />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </div>
  )
}

export default App










