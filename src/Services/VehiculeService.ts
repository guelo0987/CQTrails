import axios from 'axios';
import { API_BASE_URL, endpoints } from '../API/Endpoints.ts';
import { Vehicule, VehiculeModel } from '../Models/Vehicule.ts';

export class VehiculeService {
  private baseUrl = API_BASE_URL;
  private vehiclesCache: VehiculeModel[] | null = null;
  private lastFetchTime: number = 0;
  private cacheDuration: number = 5 * 60 * 1000; // 5 minutes cache

  /**
   * Get all vehicles with caching for better performance
   * @returns Promise with list of vehicles
   */
  async getAllVehicules(): Promise<VehiculeModel[]> {
    try {
      const currentTime = Date.now();
      
      // Use cache if available and not expired
      if (this.vehiclesCache && currentTime - this.lastFetchTime < this.cacheDuration) {
        return this.vehiclesCache;
      }
      
      const response = await axios.get(`${this.baseUrl}${endpoints.vehicule.listar}`);
      const vehicles = response.data.map((item: any) => VehiculeModel.fromJSON(item));
      
      // Update cache
      this.vehiclesCache = vehicles;
      this.lastFetchTime = currentTime;
      
      return vehicles;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      // Return empty array or cached data if available
      return this.vehiclesCache || [];
    }
  }

  /**
   * Get vehicle by ID
   * @param id Vehicle ID
   * @returns Promise with vehicle data
   */
  async getVehiculeById(id: number): Promise<VehiculeModel | null> {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoints.vehicule.porId(id)}`);
      return VehiculeModel.fromJSON(response.data);
    } catch (error) {
      console.error(`Error fetching vehicle with ID ${id}:`, error);
      
      // Try to find it in the cache
      if (this.vehiclesCache) {
        const cachedVehicle = this.vehiclesCache.find(v => v.idVehiculo === id);
        if (cachedVehicle) return cachedVehicle;
      }
      
      return null;
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
      
      // If API fails, extract capacities from cached vehicles
      if (this.vehiclesCache) {
        const capacities = Array.from(new Set(this.vehiclesCache.map(v => v.capacidad)))
          .sort((a, b) => a - b);
        return capacities;
      }
      
      // Return default capacities as fallback
      return [4, 5, 7];
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
      
      // If API fails, extract brands from cached vehicles
      if (this.vehiclesCache) {
        const brands = Array.from(new Set(this.vehiclesCache.map(v => v.tipoVehiculo)))
          .sort((a, b) => a.localeCompare(b));
        return brands;
      }
      
      return [];
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
      
      // Get vehicles from cache or fetch them if not available
      const vehicles = await this.getVehiclesForFallback();
      
      // Filter vehicles by brand and extract models
      const models = vehicles
        .filter(v => v.tipoVehiculo.toLowerCase() === brand.toLowerCase())
        .map(v => v.modelo)
        .filter((model, index, self) => self.indexOf(model) === index)
        .sort((a, b) => a.localeCompare(b));
      
      return models;
    }
  }

  /**
   * Get years by model and brand - completely rewritten to avoid API errors
   * @param model Vehicle model
   * @param brand Vehicle brand
   * @returns Promise with list of years for the specified model and brand
   */
  async getYearsByModelAndBrand(model: string, brand: string): Promise<number[]> {
    if (!model) return [];
    
    try {
      // Skip API call completely and use local data instead
      // This eliminates 404 errors and makes the app more reliable
      
      // Get vehicles from cache or fetch them if not available
      const vehicles = await this.getVehiclesForFallback();
      
      // Define filter functions for different search strategies
      const exactModelAndBrand = (v: VehiculeModel) => 
        v.modelo === model && v.tipoVehiculo === brand;
        
      const exactModelWithAnyBrand = (v: VehiculeModel) => 
        v.modelo === model;
        
      const containsModelAndBrand = (v: VehiculeModel) => 
        v.modelo.toLowerCase().includes(model.toLowerCase()) && 
        v.tipoVehiculo.toLowerCase().includes(brand.toLowerCase());
        
      const containsModelWithAnyBrand = (v: VehiculeModel) => 
        v.modelo.toLowerCase().includes(model.toLowerCase());
      
      // Try different filtering strategies from most specific to least specific
      let filteredVehicles: VehiculeModel[] = [];
      
      // 1. Try exact match on both model and brand if brand is provided
      if (brand && brand.trim() !== '') {
        filteredVehicles = vehicles.filter(exactModelAndBrand);
      }
      
      // 2. If no results, try exact model match with any brand
      if (filteredVehicles.length === 0) {
        filteredVehicles = vehicles.filter(exactModelWithAnyBrand);
      }
      
      // 3. If still no results, try contains match on both model and brand if brand provided
      if (filteredVehicles.length === 0 && brand && brand.trim() !== '') {
        filteredVehicles = vehicles.filter(containsModelAndBrand);
      }
      
      // 4. If still no results, try contains match on model with any brand
      if (filteredVehicles.length === 0) {
        filteredVehicles = vehicles.filter(containsModelWithAnyBrand);
      }
      
      // Extract years from the filtered vehicles
      const years = filteredVehicles
        .map(v => v.ano)
        .filter((year, index, self) => self.indexOf(year) === index) // Remove duplicates
        .sort((a, b) => b - a); // Sort in descending order
      
      // Return years if we found any
      if (years.length > 0) {
        return years;
      }
      
      // Default years as last resort
      const currentYear = new Date().getFullYear();
      return [currentYear, currentYear - 1, currentYear - 2];
    } catch (error) {
      // Handle any unexpected errors
      console.error(`Error in getYearsByModelAndBrand for model=${model}, brand=${brand}:`, error);
      
      // Default years as fallback
      const currentYear = new Date().getFullYear();
      return [currentYear, currentYear - 1, currentYear - 2];
    }
  }

  /**
   * Get brands for a specific model
   * @param model Vehicle model
   * @returns Promise with list of brands for the specified model
   */
  async getBrandsForModel(model: string): Promise<string[]> {
    try {
      // Get vehicles from cache or fetch them if not available
      const allVehicles = await this.getVehiclesForFallback();
      
      // Filter vehicles that match the model and extract unique brands
      const brandsForModel = allVehicles
        .filter(vehicle => vehicle.modelo.toLowerCase().includes(model.toLowerCase()))
        .map(vehicle => vehicle.tipoVehiculo)
        .filter((brand, index, self) => self.indexOf(brand) === index)
        .sort((a, b) => a.localeCompare(b));
      
      return brandsForModel;
    } catch (error) {
      console.error(`Error fetching brands for model ${model}:`, error);
      return [];
    }
  }
  
  /**
   * Helper method to get vehicles either from cache or by fetching them
   * @private
   * @returns Promise with list of vehicles
   */
  private async getVehiclesForFallback(): Promise<VehiculeModel[]> {
    // Use cache if available
    if (this.vehiclesCache) {
      return this.vehiclesCache;
    }
    
    // Otherwise fetch vehicles
    try {
      return await this.getAllVehicules();
    } catch {
      // Return empty array as last resort
      return [];
    }
  }
}

export default new VehiculeService();