import { RankingDAO } from "@/daos/rankingDAO";
import { Ranking } from "@/models/ranking";

const rankingDao = new RankingDAO();

export const RankingService = {
  async getRankingGlobal(topN?: number): Promise<Ranking[]> {
    const rankings = await rankingDao.getRanking();

    // Atribui posições sequenciais sem empates
    const ranked = rankings.map((r, index) => ({
      ...r,
      posicao: index + 1, // sempre sequencial
    }));

    if (topN) return ranked.slice(0, topN);
    return ranked;
  }
};