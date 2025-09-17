// src/services/BairroService.ts
import { BairroDAO } from "@/daos/bairrosDAO";
import { BairroDoc } from "@/models/bairros";

export class BairroService {
  private bairroDAO: BairroDAO;

  constructor() {
    this.bairroDAO = new BairroDAO();
  }

  async listarCidades(): Promise<BairroDoc[]> {
    return await this.bairroDAO.getAll();
  }

  async listarBairrosPorCidade(cidadeId: string): Promise<BairroDoc | null> {
    return await this.bairroDAO.getByCidade(cidadeId);
  }

  async adicionarBairro(cidadeId: string, bairro: string): Promise<void> {
    if (!bairro || bairro.trim().length < 2) {
      throw new Error("Nome do bairro inválido.");
    }
    await this.bairroDAO.addBairro(cidadeId, bairro);
  }

  async removerBairro(cidadeId: string, bairro: string): Promise<void> {
    await this.bairroDAO.removeBairro(cidadeId, bairro);
  }
}