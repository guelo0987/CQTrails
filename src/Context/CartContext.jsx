import React, { createContext, useState, useEffect, useContext } from 'react';
import CartService from '../Services/CartService.ts';
import { authService } from '../Services/AuthService.ts';
import Swal from 'sweetalert2';

// Crear el contexto
export const CartContext = createContext(null);

// Hook personalizado para usar el contexto
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Comprobar autenticación y obtener usuario actual
  useEffect(() => {
    const user = authService.getCurrentUser();
    setIsAuthenticated(!!user);
    setCurrentUser(user);
  }, []);

  // Escuchar cambios en la autenticación
  useEffect(() => {
    const handleAuthChange = () => {
      const user = authService.getCurrentUser();
      setIsAuthenticated(!!user);
      setCurrentUser(user);
      
      // Si el usuario cambió, refrescar el carrito
      if (user) {
        fetchCartItems(user.idUsuario);
      } else {
        setCartItems([]);
      }
    };

    window.addEventListener('storage', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Cargar el carrito cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchCartItems(currentUser.idUsuario);
    }
  }, [isAuthenticated, currentUser]);

  // Función para obtener los items del carrito
  const fetchCartItems = async (userId) => {
    // Skip if there's no valid userId
    if (!userId) {
      console.warn('No hay un ID de usuario válido para obtener el carrito');
      return;
    }
    
    try {
      setLoading(true);
      const items = await CartService.getUserCartItems(userId);
      setCartItems(items);
    } catch (error) {
      console.error('Error al obtener el carrito:', error);
      Swal.fire({
        title: 'Error',
        text: 'No pudimos cargar tu carrito. Por favor, intenta nuevamente.',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    } finally {
      setLoading(false);
    }
  };

  // Añadir un ítem al carrito
  const addToCart = async (itemData) => {
    if (!isAuthenticated) {
      Swal.fire({
        title: 'Iniciar sesión',
        text: 'Debes iniciar sesión para añadir al carrito',
        icon: 'info',
        confirmButtonText: 'Entendido'
      });
      return false;
    }

    try {
      if (!currentUser || !currentUser.idUsuario) {
        console.error('User data is missing or incomplete:', currentUser);
        
        // Try to get fresh user data
        const freshUserData = authService.getCurrentUser();
        
        if (!freshUserData || !freshUserData.idUsuario) {
          console.error('Unable to retrieve user data for cart operation');
          Swal.fire({
            title: 'Error',
            text: 'No se puede identificar tu sesión. Por favor, inicia sesión nuevamente.',
            icon: 'error',
            confirmButtonText: 'Entendido'
          });
          return false;
        }
        
        // Update the current user in state
        setCurrentUser(freshUserData);
      }

      setLoading(true);
      
      // Make sure user ID is added to the item data
      const cartItemWithUserId = {
        ...itemData,
        usuarioId: parseInt(currentUser.idUsuario),
        // Ensure other fields are properly formatted
        vehiculoId: parseInt(itemData.vehiculoId),
        cantidad: parseInt(itemData.cantidad),
        // Format dates as ISO strings if they aren't already
        fechaInicio: itemData.fechaInicio instanceof Date ? 
          itemData.fechaInicio.toISOString() : 
          (typeof itemData.fechaInicio === 'string' && itemData.fechaInicio.includes('T') ? 
            itemData.fechaInicio : 
            new Date(itemData.fechaInicio).toISOString()),
        fechaFin: itemData.fechaFin instanceof Date ? 
          itemData.fechaFin.toISOString() : 
          (typeof itemData.fechaFin === 'string' && itemData.fechaFin.includes('T') ? 
            itemData.fechaFin : 
            new Date(itemData.fechaFin).toISOString()),
        ciudadInicioId: parseInt(itemData.ciudadInicioId) || 1,
        ciudadFinId: parseInt(itemData.ciudadFinId) || 1
      };
      
      console.log('Adding item to cart with data:', cartItemWithUserId);
      
      const updatedCart = await CartService.addItemToCart(cartItemWithUserId);
      setCartItems(updatedCart);
      
      Swal.fire({
        title: '¡Añadido!',
        text: 'El vehículo ha sido añadido a tu carrito',
        icon: 'success',
        confirmButtonText: 'Continuar'
      });
      
      return true;
    } catch (error) {
      console.error('Error al añadir al carrito:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'No pudimos añadir el ítem a tu carrito',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Incrementar la cantidad de un ítem
  const increaseQuantity = async (itemId) => {
    try {
      setLoading(true);
      const updatedCart = await CartService.increaseItemQuantity(itemId);
      setCartItems(updatedCart);
    } catch (error) {
      console.error('Error al aumentar cantidad:', error);
      Swal.fire({
        title: 'Error',
        text: 'No pudimos actualizar la cantidad',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    } finally {
      setLoading(false);
    }
  };

  // Decrementar la cantidad de un ítem
  const decreaseQuantity = async (itemId) => {
    try {
      setLoading(true);
      const updatedCart = await CartService.decreaseItemQuantity(itemId);
      setCartItems(updatedCart);
    } catch (error) {
      console.error('Error al disminuir cantidad:', error);
      Swal.fire({
        title: 'Error',
        text: 'No pudimos actualizar la cantidad',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un ítem del carrito
  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      const updatedCart = await CartService.removeItemFromCart(itemId);
      setCartItems(updatedCart);
    } catch (error) {
      console.error('Error al eliminar ítem:', error);
      Swal.fire({
        title: 'Error',
        text: 'No pudimos eliminar el ítem del carrito',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    } finally {
      setLoading(false);
    }
  };

  // Vaciar el carrito
  const clearCart = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      await CartService.clearCart(currentUser.idUsuario);
      setCartItems([]);
    } catch (error) {
      console.error('Error al vaciar el carrito:', error);
      Swal.fire({
        title: 'Error',
        text: 'No pudimos vaciar tu carrito',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calcular el subtotal del carrito
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.subTotal || 0);
    }, 0).toFixed(2);
  };

  // Calcular el total del carrito (subtotal + IVA)
  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const iva = subtotal * 0.13;
    return (subtotal + iva).toFixed(2);
  };

  // Valores y funciones proporcionados por el contexto
  const value = {
    cartItems,
    loading,
    isAuthenticated,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    calculateSubtotal,
    calculateTotal,
    refreshCart: () => currentUser && fetchCartItems(currentUser.idUsuario)
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 