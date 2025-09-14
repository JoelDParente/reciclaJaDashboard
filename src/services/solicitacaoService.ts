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
};
