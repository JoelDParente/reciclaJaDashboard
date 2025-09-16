export interface WasteRecord {
  id?: string;
  userId: string; // UID do usuário (Firebase Auth)
  bairro: string;
  cidade: string;
  dataRegistro: Date;
  quantidade: {
    plastico: number;
    papel: number;
    vidro: number;
    metal: number;
    organico: number;
    outros: number;
  };
  totalKg: number;
  pontos: number; // pontos calculados
}
