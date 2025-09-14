import { WasteRecordDAO } from "@/daos/wasteRecordDAO";
import { WasteRecord } from "@/models/wasteRecord";

export class WasteRecordService {
  private dao: WasteRecordDAO;

  constructor() {
    this.dao = new WasteRecordDAO();
  }

  /** Registrar pesagem */
  async registrar(record: Omit<WasteRecord, "id">): Promise<string> {
    return this.dao.create(record);
  }

  /** Total de lixo por bairro */
  async getTotalPorBairro(bairro: string): Promise<number> {
    const records = await this.dao.findByBairro(bairro);
    return records.reduce((acc, r) => acc + r.totalKg, 0);
  }

  /** Média de lixo por registro em um bairro */
  async getMediaPorBairro(bairro: string): Promise<number> {
    const records = await this.dao.findByBairro(bairro);
    if (records.length === 0) return 0;
    const total = records.reduce((acc, r) => acc + r.totalKg, 0);
    return total / records.length;
  }

  /** Totais por tipo em um bairro */
  async getTotaisPorTipoBairro(bairro: string): Promise<Record<string, number>> {
    const records = await this.dao.findByBairro(bairro);
    return this.calcularTotais(records);
  }

  /** Totais por tipo em uma cidade */
  async getTotaisPorTipoCidade(cidade: string): Promise<Record<string, number>> {
    const records = await this.dao.findByCidade(cidade);
    return this.calcularTotais(records);
  }

  /** Visão geral da cidade */
  async getVisaoGeralCidade(cidade: string) {
    const totais = await this.getTotaisPorTipoCidade(cidade);
    const totalKg = Object.values(totais).reduce((acc, v) => acc + v, 0);
    return { cidade, totais, totalKg };
  }

  /** 🔧 Função auxiliar para somar quantidades */
  private calcularTotais(records: WasteRecord[]): Record<string, number> {
    const totais: Record<string, number> = {
      plastico: 0,
      papel: 0,
      vidro: 0,
      metal: 0,
      organico: 0,
      outros: 0,
    };

    records.forEach(r => {
      Object.keys(r.quantidade).forEach(tipo => {
        totais[tipo] += r.quantidade[tipo as keyof typeof r.quantidade];
      });
    });

    return totais;
  }
}
