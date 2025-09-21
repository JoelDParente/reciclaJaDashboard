import { PointsConfig, PointsResult } from '@/models/points';
import { WasteRecord } from '@/models/wasteRecord';

export class PointsService {
  static calculatePoints(
    config: PointsConfig,
    quantidades: WasteRecord['quantidade'],
    totalKg: number
  ): PointsResult {
    let totalPoints = 0;
    const breakdown: Record<string, number> = {};

    switch (config.mode) {
      case 1:
        totalPoints = config.fixedPoints;
        break;
      case 2:
        totalPoints = config.fixedPoints + totalKg * config.pointsPerKg;
        break;
      case 3:
        totalPoints = config.fixedPoints;
        for (const mat in quantidades) {
          const fator = config.materialWeights[mat] || 0;
          const pontosMaterial = quantidades[mat as keyof typeof quantidades] * fator;
          breakdown[mat] = pontosMaterial;
          totalPoints += pontosMaterial;
        }
        break;
    }

    return { totalPoints, breakdown };
  }

  static somarPontos(records: { totalPoints: number }[]): number {
    return records.reduce((acc, r) => acc + r.totalPoints, 0);
  }
}