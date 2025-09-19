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
      case 1: // Pontos fixos
        totalPoints = config.fixedPoints;
        break;

      case 2: // Fixo + por Kg
        totalPoints = config.fixedPoints + totalKg * config.pointsPerKg;
        break;

      case 3: // Fixo + por material
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

  static getTotalPoints(records: WasteRecord[]): number {
    return records.reduce((acc, r) => acc + (r.pontos || 0), 0);
  }

}