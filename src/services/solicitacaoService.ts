// service
import { SolicitacaoDAO } from "@/daos/solicitacaoDAO";
import { SolicitacaoColeta } from "@/models/solicitacao";

const solicitacaoDao = new SolicitacaoDAO();

export const SolicitacaoService = {
  async createSolicitacao(data: Omit<SolicitacaoColeta, "id">) {
    return solicitacaoDao.create(data);
  },
 
  async getAllSolicitacoes() {
    return solicitacaoDao.findAll();
  },

  async getSolicitacaoById(id: string) {
    return solicitacaoDao.findById(id);
  },

  async getSolicitacoesByUser(userId: string) {
    return solicitacaoDao.findByUserId(userId);
  },

  async updateSolicitacao(id: string, data: Partial<SolicitacaoColeta>) {
    return solicitacaoDao.update(id, data);
  },

  async deleteSolicitacao(id: string) {
    return solicitacaoDao.delete(id);
  },

  async countSolicitacoes() {
    return solicitacaoDao.countAll();
  },

  async fetchMonthlyEvolution(): Promise<number[]> {
    const requests = await solicitacaoDao.getAllRequests();

    const monthlyCounts = Array(12).fill(0);
    requests.forEach((req) => {
      const month = req.date.getMonth(); // 0-11
      monthlyCounts[month]++;
    });

    return monthlyCounts;
  },

  // 🔹 Novo método: Agrupado por bairro
  async getSolicitacoesByBairro(): Promise<{ labels: string[]; chartSeries: number[] }> {
    const requests = await solicitacaoDao.getAllRequests();

    const agrupado: Record<string, number> = {};
    requests.forEach((req) => {
      agrupado[req.bairro] = (agrupado[req.bairro] || 0) + 1;
    });

    return {
      labels: Object.keys(agrupado),
      chartSeries: Object.values(agrupado),
    };
  },
};
