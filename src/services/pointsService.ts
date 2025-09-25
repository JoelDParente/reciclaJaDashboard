// src/services/pointsService.ts
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
        // Pontos fixos
        totalPoints = config.fixedPoints;
        break;

      case 2:
        // Pontos fixos + por kg total
        totalPoints = config.fixedPoints + totalKg * (config.pointsPerKg || 0);
        breakdown['totalKg'] = totalKg * (config.pointsPerKg || 0);
        break;

      case 3:
        // Pontos fixos + por material
        totalPoints = config.fixedPoints;

        for (const mat of Object.keys(quantidades)) {
          const qtd = quantidades[mat as keyof typeof quantidades] || 0;
          const fator = config.materialWeights[mat] || 0;
          const pontosMaterial = qtd * fator;

          breakdown[mat] = pontosMaterial;
          totalPoints += pontosMaterial;
        }
        break;
    }

    return { totalPoints, breakdown };
  }
  static somarPontos(records: { totalPoints: number }[]): number {
    return records.reduce((acc, r) => acc + (r.totalPoints || 0), 0);
  }
}
