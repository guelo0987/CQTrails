export interface Vehicule {
  idVehiculo: number;
  placa: string;
  modelo: string;
  tipoVehiculo: string;
  capacidad: number;
  ano: number;
  disponible: boolean;
  price: number;
  Image_url: string;
}

export class VehiculeModel implements Vehicule {
  idVehiculo: number;
  placa: string;
  modelo: string;
  tipoVehiculo: string;
  capacidad: number;
  ano: number;
  disponible: boolean;
  price: number;
  Image_url: string;

  constructor(data: Vehicule) {
    this.idVehiculo = data.idVehiculo;
    this.placa = data.placa;
    this.modelo = data.modelo;
    this.tipoVehiculo = data.tipoVehiculo;
    this.capacidad = data.capacidad;
    this.ano = data.ano;
    this.disponible = data.disponible;
    this.price = data.price;
    this.Image_url = data.Image_url;
  }

  static fromJSON(json: any): VehiculeModel {
    return new VehiculeModel({
      idVehiculo: json.idVehiculo,
      placa: json.placa,
      modelo: json.modelo,
      tipoVehiculo: json.tipoVehiculo,
      capacidad: json.capacidad,
      ano: json.ano,
      disponible: json.disponible,
      price: json.price,
      Image_url: json.Image_url
    });
  }

  toJSON(): Vehicule {
    return {
      idVehiculo: this.idVehiculo,
      placa: this.placa,
      modelo: this.modelo,
      tipoVehiculo: this.tipoVehiculo,
      capacidad: this.capacidad,
      ano: this.ano,
      disponible: this.disponible,
      price: this.price,
      Image_url: this.Image_url
    };
  }
}