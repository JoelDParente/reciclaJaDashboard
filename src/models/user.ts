export type UserType = "comum" | "coletor" | "parceiro";

export interface Address {
  bairro: string;
  rua: string;
  numero: string;
}

export interface User {
  id?: string;
  nome: string;
  email: string;
  telefone?: string;
  endereco?: Address;
  fcmToken?: string;
  points?: number;
  isActive?: boolean;  // para controle de ativação/desativação
  createdAt: Date;
}

