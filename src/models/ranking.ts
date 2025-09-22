export interface Ranking {
  id: string;        // userId
  nome: string;
  pontos: number;
  posicao?: number;
  updatedAt?: Date;  // posição no ranking
}
