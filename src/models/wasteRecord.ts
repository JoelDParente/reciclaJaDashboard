export type Quantidades = {
  plastico: number;
  papel: number;
  vidro: number;
  metal: number;
  outros: number;
};

export interface WasteRecord {
  id?: string;
  userId: string;
  bairro: string;
  cidade: string;
  quantidade: Quantidades;
  totalKg: number;
  pontos: number;
  co2Evited: number;
  dataRegistro: Date;
}