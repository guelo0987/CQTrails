import axios from 'axios';
import { API_BASE_URL, endpoints } from '../API/Endpoints.ts';
import { Vehicule, VehiculeModel } from '../Models/Vehicule.ts';

class VehiculeService {
  private baseUrl = API_BASE_URL;
  private vehiclesCache: VehiculeModel[] | null = null;
  private lastFetchTime: number = 0;
  private cacheDuration: number = 5 * 60 * 1000; // 5 minutes cache
  
  // Cache for year requests to avoid repeated failed calls for the same model/brand
  private yearsRequestCache: Map<string, {timestamp: number, years: number[]}> = new Map();
  // Track failed API endpoint patterns to avoid hammering them
  private failedApiPatterns: Set<string> = new Set();

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
      // Using the proper endpoint from the API specification
      const response = await axios.get(`${this.baseUrl}api/Vehicule/${id}`);
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
      // Create a cache key using model and brand
      const cacheKey = `${model}|${brand}`;
      
      // Check if we have a cached result that is not too old (1 hour)
      const cachedResult = this.yearsRequestCache.get(cacheKey);
      if (cachedResult && (Date.now() - cachedResult.timestamp < 3600000)) {
        console.log(`Using cached years for model="${model}" and brand="${brand}": ${cachedResult.years}`);
        return cachedResult.years;
      }
      
      console.log(`Fetching years for model="${model}" and brand="${brand}"`);
      
      let apiSucceeded = false;
      
      // Try the API if the endpoint exists and pattern hasn't repeatedly failed
      if (endpoints.vehicule.anos && !this.failedApiPatterns.has(model)) {
        // Only try API if we haven't marked this pattern as consistently failing
        try {
          // Try API call first - IMPORTANT: The endpoint expects (marca, modelo) order
          // Note we're switching brand and model order to match API expectations
          const url = `${this.baseUrl}${endpoints.vehicule.anos(brand, model)}`;
          console.log(`Trying API call to: ${url}`);
          
          const response = await axios.get(url, { timeout: 2000 });
          
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            const years = response.data.sort((a: number, b: number) => b - a);
            console.log(`API returned ${years.length} years for model="${model}" and brand="${brand}"`);
            
            // Cache the result
            this.yearsRequestCache.set(cacheKey, {
              timestamp: Date.now(),
              years: years
            });
            
            apiSucceeded = true;
            return years;
          }
        } catch (apiError) {
          // No need to try the reverse order if the brand is empty
          if (brand && brand.trim() !== '') {
            try {
              console.log('First API call for years failed, trying reversed parameter order');
              const reverseUrl = `${this.baseUrl}${endpoints.vehicule.anos(model, brand)}`;
              console.log(`Trying API call to: ${reverseUrl}`);
              
              const reverseResponse = await axios.get(reverseUrl, { timeout: 2000 });
              
              if (reverseResponse.data && Array.isArray(reverseResponse.data) && reverseResponse.data.length > 0) {
                const years = reverseResponse.data.sort((a: number, b: number) => b - a);
                console.log(`API with reversed params returned ${years.length} years`);
                
                // Cache the result
                this.yearsRequestCache.set(cacheKey, {
                  timestamp: Date.now(),
                  years: years
                });
                
                apiSucceeded = true;
                return years;
              }
            } catch (reverseError) {
              // Both attempts failed, continue to fallback
            }
          }
          
          console.log('Both API call attempts for years failed, falling back to local filtering');
          
          // Mark this model as a failing pattern to avoid future API calls
          this.failedApiPatterns.add(model);
        }
      }
      
      // Skip API call completely and use local data instead
      // This eliminates 404 errors and makes the app more reliable
      
      // Get vehicles from cache or fetch them if not available
      const vehicles = await this.getVehiclesForFallback();
      
      if (vehicles.length === 0) {
        console.error('No vehicles available for filtering years');
        const currentYear = new Date().getFullYear();
        const defaultYears = [currentYear, currentYear - 1, currentYear - 2];
        
        // Cache the result even though it's default
        this.yearsRequestCache.set(cacheKey, {
          timestamp: Date.now(),
          years: defaultYears
        });
        
        return defaultYears;
      }
      
      if (!apiSucceeded) {
        console.log(`Found ${vehicles.length} total vehicles to filter from`);
        
        // Define filter functions for different search strategies
        const exactModelAndBrand = (v: VehiculeModel) => 
          v.modelo === model && v.tipoVehiculo === brand;
          
        const exactModelWithAnyBrand = (v: VehiculeModel) => 
          v.modelo === model;
          
        const containsModelAndBrand = (v: VehiculeModel) => 
          v.modelo.toLowerCase().includes(model.toLowerCase()) && 
          (brand ? v.tipoVehiculo.toLowerCase().includes(brand.toLowerCase()) : true);
          
        const containsModelWithAnyBrand = (v: VehiculeModel) => 
          v.modelo.toLowerCase().includes(model.toLowerCase());
        
        // Try different filtering strategies from most specific to least specific
        let filteredVehicles: VehiculeModel[] = [];
        
        // 1. Try exact match on both model and brand if brand is provided
        if (brand && brand.trim() !== '') {
          filteredVehicles = vehicles.filter(exactModelAndBrand);
          console.log(`Strategy 1 (exact model+brand match): ${filteredVehicles.length} vehicles`);
        }
        
        // 2. If no results, try exact model match with any brand
        if (filteredVehicles.length === 0) {
          filteredVehicles = vehicles.filter(exactModelWithAnyBrand);
          console.log(`Strategy 2 (exact model match): ${filteredVehicles.length} vehicles`);
        }
        
        // 3. If still no results, try contains match on both model and brand if brand provided
        if (filteredVehicles.length === 0 && brand && brand.trim() !== '') {
          filteredVehicles = vehicles.filter(containsModelAndBrand);
          console.log(`Strategy 3 (contains model+brand): ${filteredVehicles.length} vehicles`);
        }
        
        // 4. If still no results, try contains match on model with any brand
        if (filteredVehicles.length === 0) {
          filteredVehicles = vehicles.filter(containsModelWithAnyBrand);
          console.log(`Strategy 4 (contains model): ${filteredVehicles.length} vehicles`);
        }
        
        // Extract years from the filtered vehicles
        const years = filteredVehicles
          .map(v => v.ano)
          .filter((year, index, self) => self.indexOf(year) === index) // Remove duplicates
          .sort((a, b) => b - a); // Sort in descending order
        
        console.log(`Found ${years.length} unique years:`, years);
        
        // Return years if we found any
        if (years.length > 0) {
          // Cache the result
          this.yearsRequestCache.set(cacheKey, {
            timestamp: Date.now(),
            years: years
          });
          
          return years;
        }
      }
      
      // Default years as last resort
      const currentYear = new Date().getFullYear();
      const defaultYears = [currentYear, currentYear - 1, currentYear - 2];
      console.log(`No years found, returning default years:`, defaultYears);
      
      // Cache the default result
      this.yearsRequestCache.set(cacheKey, {
        timestamp: Date.now(),
        years: defaultYears
      });
      
      return defaultYears;
    } catch (error) {
      // Handle any unexpected errors
      console.error(`Error in getYearsByModelAndBrand for model=${model}, brand=${brand}:`, error);
      
      // Default years as fallback
      const currentYear = new Date().getFullYear();
      const defaultYears = [currentYear, currentYear - 1, currentYear - 2];
      
      // Cache the error result to avoid repeated failures
      this.yearsRequestCache.set(`${model}|${brand}`, {
        timestamp: Date.now(),
        years: defaultYears
      });
      
      return defaultYears;
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
    const currentTime = Date.now();
    
    try {
      // Use cache if available and not expired
      if (this.vehiclesCache && this.vehiclesCache.length > 0 && 
          currentTime - this.lastFetchTime < this.cacheDuration) {
        console.log(`Using cached vehicles data (${this.vehiclesCache.length} vehicles)`);
        return this.vehiclesCache;
      }
      
      console.log('Cache expired or not available, fetching vehicles from API');
      
      // If cache is expired, fetch new data
      const response = await axios.get(`${this.baseUrl}${endpoints.vehicule.listar}`, {
        // Add a timeout to prevent long-waiting requests
        timeout: 5000
      });
      
      // Process and transform the data
      const vehicles = response.data
        .map((item: any) => VehiculeModel.fromJSON(item))
        // Filter out any malformed or invalid vehicles
        .filter((vehicle: VehiculeModel) => 
          vehicle && 
          vehicle.modelo && 
          vehicle.tipoVehiculo &&
          vehicle.ano
        );
      
      // Only update cache if we got data
      if (vehicles && vehicles.length > 0) {
        console.log(`Updated cache with ${vehicles.length} vehicles`);
        this.vehiclesCache = vehicles;
        this.lastFetchTime = currentTime;
        return vehicles;
      } else if (this.vehiclesCache) {
        // If API returned no data but we have cache, use that instead
        console.log(`API returned no vehicles, using cached data (${this.vehiclesCache.length} vehicles)`);
        return this.vehiclesCache;
      }
      
      // As a last resort, return an empty array
      console.error('No vehicles data available');
      return [];
    } catch (error) {
      console.error('Error in getVehiclesForFallback:', error);
      
      // If there's an error but we have cached data, use it
      if (this.vehiclesCache) {
        console.log(`Error fetching vehicles, using cached data (${this.vehiclesCache.length} vehicles)`);
        return this.vehiclesCache;
      }
      
      // As a last resort, return an empty array
      return [];
    }
  }
  
  /**
   * Clear the cache for a specific year request - useful if data changes
   * @param model The model to clear cache for
   * @param brand The brand to clear cache for
   */
  clearYearsCache(model?: string, brand?: string): void {
    if (model && brand) {
      this.yearsRequestCache.delete(`${model}|${brand}`);
    } else {
      // Clear all years cache if no specific model/brand provided
      this.yearsRequestCache.clear();
      this.failedApiPatterns.clear();
    }
  }
}

// Create a singleton instance for export
const vehiculeServiceInstance = new VehiculeService();

// Export the instance as default
export default vehiculeServiceInstance;