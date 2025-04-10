import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Registro from './Pages/Registro';
import HomeAuth from './Pages/HomeAuth';
import ReservarPage from './Pages/Reservar';
import AddReservation from './Pages/AddReservation';
import MiCarrito from './Pages/MiCarrito';
import MisReservaciones from './Pages/MisReservaciones';
import HistorialReservaciones from './Pages/HistorialReservaciones';
import { CartProvider } from './Context/CartContext';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/home-auth" element={<HomeAuth />} />
          <Route path="/reservar" element={<ReservarPage />} />
          <Route path="/agregar-reserva/:vehiculoId" element={<AddReservation />} />
          <Route path="/micarrito" element={<MiCarrito />} />
          <Route path="/mis-reservaciones" element={<MisReservaciones />} />
          <Route path="/historial" element={<HistorialReservaciones />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App; 