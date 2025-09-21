export interface PointsRecord {
  id?: string;
  userId: string;
  totalPoints: number;
  reason: string; // ex: "pesagem", "bônus"
  createdAt: Date;
}

export interface PointsConfig {
  id?: string;
  mode: 1 | 2 | 3; // 1 = fixo, 2 = fixo+kg, 3 = fixo+material
  fixedPoints: number;
  pointsPerKg: number;
  materialWeights: Record<string, number>;
  updatedAt: Date;
}

export interface PointsResult {
  totalPoints: number;
  breakdown?: Record<string, number>;
}
