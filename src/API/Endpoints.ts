export const API_BASE_URL = (import.meta as any).env?.API_URL || 'http://localhost:5139/';

export const endpoints = {
    auth: {
        login: 'api/Auth/login',
        register: 'api/Auth/register',
    },
    vehicule: {
        listar: 'api/Vehicule',
        porCapacidad: (id: number) => `api/Vehicule/capacidad/${id}`,
        porMarca: (marca: string) => `api/Vehicule/marca/${marca}`,
        porModelo: (marca: string, modelo: string) => `api/Vehicule/modelo/${marca}/${modelo}`,
        porTipo: (tipo: string) => `api/Vehicule/tipo/${tipo}`,
        anos: (marca: string, modelo: string) => `api/Vehicule/anos/${marca}/${modelo}`,
        todasCapacidades: 'api/Vehicule/capacidades',
        marcas: 'api/Vehicule/marcas',
        modelos: (marca: string) => `api/Vehicule/modelos/${marca}`,
    },
    carrito: {
        getCart: (userId: number) => `api/Carrito/cart/${userId}`,
        userItems: (userId: number) => `api/Carrito/user-items/${userId}`,
        addItem: 'api/Carrito/add-item',
        removeItem: (itemId: number) => `api/Carrito/remove-item/${itemId}`,
        clearCart: (userId: number) => `api/Carrito/clear-cart/${userId}`,
        updateStartDate: (detalleId: number) => `api/Carrito/update-fecha-inicio/${detalleId}`,
        updateEndDate: (detalleId: number) => `api/Carrito/update-fecha-fin/${detalleId}`,
        increaseQuantity: (itemId: number) => `api/Carrito/increase-quantity/${itemId}`,
        decreaseQuantity: (itemId: number) => `api/Carrito/decrease-quantity/${itemId}`,
    },
    ciudad: {
        listar: 'api/Ciudad',
        porNombre: (nombre: string) => `api/Ciudad/nombre/${nombre}`,
    },
    reservaciones: {
        base: 'api/Reservaciones',
        misReservaciones: (userId: number) => `api/Reservaciones/MisReservaciones/${userId}`,
    },
    prefactura: {
        getPrefactura: (reservationId: number, userId: number) => `api/PreFactura/Prefactura/${reservationId}/${userId}`,
    }
} as const; 