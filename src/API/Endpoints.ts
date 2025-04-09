export const API_BASE_URL = (import.meta as any).env?.API_URL || 'http://localhost:5139/';

export const endpoints = {
    auth: {
        login: 'api/Auth/login',
        register: 'api/Auth/register',
    },
    vehicule: {
        listar: 'api/Vehicule',
        porCapacidad: (id: number) => `api/Vehicule/capacidad/${id}`,
        porId: (id: number) => `api/Vehicule/${id}`,
        todasCapacidades: 'api/Vehicule/capacidades',
        marcas: 'api/Vehicule/marcas',
        modelos: (marca: string) => `api/Vehicule/modelos/${marca}`,
        anos : (marca: string, modelo:string) => `api/Vehicule/anos/${marca}/${modelo}`,
    },
    carrito: {
        getCart: (userId: number) => `api/Carrito/cart/${userId}`,
        getItems: (userId: number) => `api/Carrito/user-items/${userId}`,
        addItem: 'api/Carrito/add-item',
        increaseQuantity: (detalleId: number) => `api/Carrito/increase-quantity/${detalleId}`,
        decreaseQuantity: (detalleId: number) => `api/Carrito/decrease-quantity/${detalleId}`,
        removeItem: (detalleId: number) => `api/Carrito/remove-item/${detalleId}`,
        clearCart: (userId: number) => `api/Carrito/clear-cart/${userId}`,
    },
    ciudad: {
        listar: 'api/Ciudades',
    }
} as const; 