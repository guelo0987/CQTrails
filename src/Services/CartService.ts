import axios from 'axios';
import { API_BASE_URL, endpoints } from '../API/Endpoints.ts';

// Interfaces para el servicio de carrito
export interface DetalleCarritoDTO {
  usuarioId: number;
  vehiculoId: number;
  cantidad: number;
  fechaInicio: string; // formato ISO
  fechaFin: string; // formato ISO
  ciudadInicioId: number;
  ciudadFinId: number;
}

export interface CartItemResponse {
  id: number;
  carritoId: number;
  vehiculoId: number;
  price: number;
  cantidad: number;
  fechaInicio: string;
  fechaFin: string;
  subTotal: number;
  total: number;
  ciudadInicioId: number;
  ciudadFinId: number;
  vehiculo: {
    idVehiculo: number;
    placa: string;
    modelo: string;
    tipoVehiculo: string;
    capacidad: number;
    ano: number;
    price: number;
  };
  ciudadInicio: {
    idCiudad: number;
    nombre: string;
    estado: string;
  };
  ciudadFin: {
    idCiudad: number;
    nombre: string;
    estado: string;
  };
}

class CartService {
  private baseUrl = API_BASE_URL;

  /**
   * Obtener el carrito del usuario
   * @param userId ID del usuario
   * @returns Promise con los items del carrito
   */
  async getUserCartItems(userId: number) {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoints.carrito.userItems(userId)}`);
      if (response.data.notFound) {
        return [];
      }
      return response.data;
    } catch (error) {
      return [];
    }
  }

  /**
   * Añadir un ítem al carrito
   * @param cartItem Datos del ítem a añadir
   * @returns Promise con la respuesta del servidor
   */
  async addItemToCart(cartItem: DetalleCarritoDTO): Promise<CartItemResponse[]> {
    try {
      // Make sure all fields have the proper type
      const validatedItem: DetalleCarritoDTO = {
        usuarioId: Number(cartItem.usuarioId),
        vehiculoId: Number(cartItem.vehiculoId),
        cantidad: Number(cartItem.cantidad),
        fechaInicio: typeof cartItem.fechaInicio === 'string' ? cartItem.fechaInicio : new Date(cartItem.fechaInicio).toISOString(),
        fechaFin: typeof cartItem.fechaFin === 'string' ? cartItem.fechaFin : new Date(cartItem.fechaFin).toISOString(),
        ciudadInicioId: Number(cartItem.ciudadInicioId),
        ciudadFinId: Number(cartItem.ciudadFinId)
      };
      
      const response = await axios.post(`${this.baseUrl}${endpoints.carrito.addItem}`, validatedItem, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al añadir ítem al carrito:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * Incrementar la cantidad de un ítem en el carrito
   * @param detalleId ID del detalle del carrito
   * @returns Promise con la respuesta del servidor
   */
  async increaseItemQuantity(detalleId: number): Promise<CartItemResponse[]> {
    try {
      const response = await axios.put(`${this.baseUrl}${endpoints.carrito.increaseQuantity(detalleId)}`);
      return response.data;
    } catch (error) {
      console.error('Error al incrementar cantidad:', error);
      throw error;
    }
  }

  /**
   * Decrementar la cantidad de un ítem en el carrito
   * @param detalleId ID del detalle del carrito
   * @returns Promise con la respuesta del servidor
   */
  async decreaseItemQuantity(detalleId: number): Promise<CartItemResponse[]> {
    try {
      const response = await axios.put(`${this.baseUrl}${endpoints.carrito.decreaseQuantity(detalleId)}`);
      return response.data;
    } catch (error) {
      console.error('Error al decrementar cantidad:', error);
      throw error;
    }
  }

  /**
   * Eliminar un ítem del carrito
   * @param detalleId ID del detalle del carrito
   * @returns Promise con la respuesta del servidor
   */
  async removeItemFromCart(detalleId: number): Promise<CartItemResponse[]> {
    try {
      const response = await axios.delete(`${this.baseUrl}${endpoints.carrito.removeItem(detalleId)}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar ítem del carrito:', error);
      throw error;
    }
  }

  /**
   * Vaciar el carrito del usuario
   * @param userId ID del usuario
   * @returns Promise con la respuesta del servidor
   */
  async clearCart(userId: number): Promise<string> {
    try {
      const response = await axios.delete(`${this.baseUrl}${endpoints.carrito.clearCart(userId)}`);
      return response.data;
    } catch (error) {
      console.error('Error al vaciar el carrito:', error);
      throw error;
    }
  }

  /**
   * Actualizar la fecha de inicio de un ítem del carrito
   * @param detalleId ID del detalle del carrito
   * @param newDate Nueva fecha en formato ISO string
   * @returns Promise con la respuesta del servidor
   */
  async updateStartDate(detalleId: number, newDate: string): Promise<CartItemResponse[]> {
    try {
      const response = await axios.put(`${this.baseUrl}${endpoints.carrito.updateStartDate(detalleId)}`, {
        newFecha: newDate
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar fecha de inicio:', error);
      throw error;
    }
  }

  /**
   * Actualizar la fecha de fin de un ítem del carrito
   * @param detalleId ID del detalle del carrito
   * @param newDate Nueva fecha en formato ISO string
   * @returns Promise con la respuesta del servidor
   */
  async updateEndDate(detalleId: number, newDate: string): Promise<CartItemResponse[]> {
    try {
      const response = await axios.put(`${this.baseUrl}${endpoints.carrito.updateEndDate(detalleId)}`, {
        newFecha: newDate
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar fecha de fin:', error);
      throw error;
    }
  }
}

export default new CartService();