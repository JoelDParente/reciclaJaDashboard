export interface WasteRecord {
  id?: string;
  bairro: string;
  cidade: string;
  pontoColeta?: string;
  dataRegistro: Date; // vamos trabalhar com Date no front
  quantidade: {
    plastico: number;
    papel: number;
    vidro: number;
    metal: number;
    organico: number;
    outros: number;
  };
  totalKg: number;
}
