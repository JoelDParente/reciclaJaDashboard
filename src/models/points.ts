export type CalculationMode = 1 | 2 | 3;

/**
 * Configuração de pontuação que a administração escolhe
 */
export interface PointsConfig {
  id: string;
  mode: CalculationMode; // 1, 2 ou 3
  fixedPoints: number;   // usado no modo 1 e 2
  pointsPerKg: number;   // usado no modo 2
  materialWeights: Record<string, number>; // usado no modo 3
  updatedAt: Date;
}

/**
 * Resultado do cálculo de pontos
 */
export interface PointsResult {
  totalPoints: number;
  breakdown?: Record<string, number>;
}
