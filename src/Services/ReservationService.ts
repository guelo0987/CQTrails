import axios from 'axios';
import { API_BASE_URL, endpoints } from '../API/Endpoints.ts';

class ReservationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async makeReservation(userId: number) {
    try {
      // Log the request details for debugging
      console.log('Making reservation request:', {
        url: `${this.baseUrl}${endpoints.reservaciones.base}/${userId}`,
        userId: userId
      });
      
      // Try sending the userId as a URL parameter instead of in the body
      const response = await axios.post(`${this.baseUrl}${endpoints.reservaciones.base}/${userId}`);
      
      console.log('Reservation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error making reservation:', error);
      throw error;
    }
  }

  async getUserReservations(userId: number) {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoints.reservaciones.misReservaciones(userId)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user reservations:', error);
      throw error;
    }
  }

  async getPrefactura(reservationId: number, userId: number) {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoints.prefactura.getPrefactura(reservationId, userId)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching prefactura:', error);
      throw error;
    }
  }
}

export const reservationService = new ReservationService(); 