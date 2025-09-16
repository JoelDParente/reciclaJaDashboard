import { PointsConfig, PointsResult } from '@/models/points';

export class PointsService {
  static calculatePoints(
    config: PointsConfig,
    quantidade: Record<string, number>,
    totalKg: number
  ): PointsResult {
    let totalPoints = 0;
    let breakdown: Record<string, number> = {};

    switch (config.mode) {
      case 1:
        totalPoints = config.fixedPoints;
        break;

      case 2:
        totalPoints = config.fixedPoints + totalKg * config.pointsPerKg;
        break;

      case 3:
        totalPoints = config.fixedPoints;
        Object.entries(quantidade).forEach(([tipo, kg]) => {
          const pts = kg * (config.materialWeights[tipo] ?? 0);
          breakdown[tipo] = pts;
          totalPoints += pts;
        });
        break;
    }

    return { totalPoints, breakdown };
  }
}