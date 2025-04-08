import axios from 'axios';
import { API_BASE_URL, endpoints } from '../API/Endpoints.ts';
import { Vehicule, VehiculeModel } from '../Models/Vehicule.ts';

export class VehiculeService {
  private baseUrl = API_BASE_URL;

  /**
   * Get all vehicles
   * @returns Promise with list of vehicles
   */
  async getAllVehicules(): Promise<VehiculeModel[]> {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoints.vehicule.listar}`);
      return response.data.map((item: any) => VehiculeModel.fromJSON(item));
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  }

  /**
   * Get vehicle by ID
   * @param id Vehicle ID
   * @returns Promise with vehicle data
   */
  async getVehiculeById(id: number): Promise<VehiculeModel> {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoints.vehicule.porId(id)}`);
      return VehiculeModel.fromJSON(response.data);
    } catch (error) {
      console.error(`Error fetching vehicle with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get vehicles by capacity
   * @param capacity Vehicle capacity
   * @returns Promise with list of vehicles with specified capacity
   */
  async getVehiculesByCapacity(capacity: number): Promise<VehiculeModel[]> {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoints.vehicule.porCapacidad(capacity)}`);
      return response.data.map((item: any) => VehiculeModel.fromJSON(item));
    } catch (error) {
      console.error(`Error fetching vehicles with capacity ${capacity}:`, error);
      throw error;
    }
  }

  /**
   * Get all available capacities
   * @returns Promise with list of capacities
   */
  async getAllCapacities(): Promise<number[]> {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoints.vehicule.todasCapacidades}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching capacities:', error);
      throw error;
    }
  }

  /**
   * Get all vehicle brands
   * @returns Promise with list of brands
   */
  async getAllBrands(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoints.vehicule.marcas}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  }

  /**
   * Get models by brand
   * @param brand Vehicle brand
   * @returns Promise with list of models for the specified brand
   */
  async getModelsByBrand(brand: string): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoints.vehicule.modelos(brand)}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching models for brand ${brand}:`, error);
      throw error;
    }
  }

  /**
   * Get years by model and brand
   * @param model Vehicle model
   * @param brand Vehicle brand
   * @returns Promise with list of years for the specified model and brand
   */
  async getYearsByModelAndBrand(model: string, brand: string): Promise<number[]> {
    try {
      // Fix the parameter order to match the API endpoint
      const response = await axios.get(`${this.baseUrl}${endpoints.vehicule.anos(brand, model)}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching years for model ${model} and brand ${brand}:`, error);
      throw error;
    }
  }

  /**
   * Get brands for a specific model
   * @param model Vehicle model
   * @returns Promise with list of brands for the specified model
   */
  async getBrandsForModel(model: string): Promise<string[]> {
    try {
      // Since the API doesn't have a direct endpoint for this operation,
      // we'll get all vehicles and filter them client-side
      const allVehicles = await this.getAllVehicules();
      
      // Filter vehicles that match the model and extract their brands (tipoVehiculo)
      const brandsForModel = allVehicles
        .filter(vehicle => vehicle.modelo === model)
        .map(vehicle => vehicle.tipoVehiculo)
        .filter((brand, index, self) => self.indexOf(brand) === index); // Remove duplicates
      
      return brandsForModel;
    } catch (error) {
      console.error(`Error fetching brands for model ${model}:`, error);
      throw error;
    }
  }
}

export default new VehiculeService();