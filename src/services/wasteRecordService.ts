import { WasteRecordDAO } from '@/daos/wasteRecordDAO';
import { WasteRecord } from '@/models/wasteRecord';

export type Quantidades = {
  plastico: number;
  papel: number;
  vidro: number;
  metal: number;
  organico: number;
  outros: number;
};

export class WasteRecordService {
  private dao: WasteRecordDAO;

  constructor() {
    this.dao = new WasteRecordDAO();
  }

  /** Retorna todos os registros publicamente */
  async getAllRecords(): Promise<WasteRecord[]> {
    return this.dao.findAll();
  }

  /** Totais por tipo (Quantidades) */
  async getTotais(records: WasteRecord[]): Promise<Quantidades> {
    return this.calcularTotais(records);
  }

  /** Registrar pesagem */
  async registrar(record: Omit<WasteRecord, 'id'>): Promise<void> {
    await this.dao.create(record);
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
    return records.reduce((acc, r) => acc + r.totalKg, 0) / records.length;
  }

  /** Totais por tipo em um bairro */
  async getTotaisPorTipoBairro(bairro: string): Promise<Quantidades> {
    const records = await this.dao.findByBairro(bairro);
    return this.calcularTotais(records);
  }

  /** Totais por tipo em uma cidade */
  async getTotaisPorTipoCidade(cidade: string): Promise<Quantidades> {
    const records = await this.dao.findByCidade(cidade);
    return this.calcularTotais(records);
  }

  /** Visão geral da cidade */
  async getVisaoGeralCidade(cidade: string) {
    const totais = await this.getTotaisPorTipoCidade(cidade);
    const totalKg = Object.values(totais).reduce((acc, v) => acc + v, 0);
    return { cidade, totais, totalKg };
  }

  /** Função auxiliar para somar quantidades */
  private calcularTotais(records: WasteRecord[]): Quantidades {
    const totais: Quantidades = {
      plastico: 0,
      papel: 0,
      vidro: 0,
      metal: 0,
      organico: 0,
      outros: 0,
    };

    records.forEach((r) => {
      Object.entries(r.quantidade).forEach(([tipo, valor]) => {
        // ✅ garante que só as chaves de Quantidades sejam somadas
        if (tipo in totais) {
          totais[tipo as keyof Quantidades] += valor;
        }
      });
    });

    return totais;
  }
}