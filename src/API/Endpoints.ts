export const API_BASE_URL = (import.meta as any).env?.API_URL || 'http://localhost:5139/';

export const endpoints = {
    auth: {
        login: 'api/Auth/login'
    },
    vehicule: {
        listar: 'api/Vehicule',
        porCapacidad: (id: number) => `api/Vehicule/capacidad/${id}`,
        porId: (id: number) => `api/Vehicule/${id}`,
        todasCapacidades: 'api/Vehicule/capacidades',
        marcas: 'api/Vehicule/marcas',
        modelos: (marca: string) => `api/Vehicule/modelos/${marca}`,
        anos : (marca: string, modelo:string) => `api/Vehicule/anos/${marca}/${modelo}`,
    }
} as const; 