import { RankingDAO } from "@/daos/rankingDAO";
import { Ranking } from "@/models/ranking";

const rankingDao = new RankingDAO();

export const RankingService = {
  async getRankingGlobal(topN?: number): Promise<Ranking[]> {
    const rankings = await rankingDao.getRanking();

    // Calcula posições
    let pos = 1;
    let lastPoints: number | null = null;
    let sameRankCount = 0;

    const ranked = rankings.map(r => {
      const pontos = r.pontos ?? 0;

      if (lastPoints === pontos) {
        sameRankCount++;
      } else {
        pos += sameRankCount;
        sameRankCount = 1;
      }
      lastPoints = pontos;

      return { ...r, posicao: pos }; // posicao sempre definido
    });

    if (topN) return ranked.slice(0, topN);
    return ranked;
  }
};