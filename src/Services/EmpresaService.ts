import axios from 'axios';
import { API_BASE_URL, endpoints } from '../API/Endpoints.ts';

class EmpresaService {
  private baseUrl: string;
  constructor() {
    this.baseUrl = API_BASE_URL;
  }
  
  async getEmpresaById(empresaId: number) {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoints.Empresa.porId(empresaId)}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener la empresa por ID:', error);
      throw error;
    }   
  }

  async getEmpresaByEmail(email: string) {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoints.Empresa.porEmail(email)}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener la empresa por email:', error);
      throw error;
    }   
  }
}

export const empresaService = new EmpresaService();