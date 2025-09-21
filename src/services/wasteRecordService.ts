import { WasteRecord, Quantidades } from '@/models/wasteRecord';
import { WasteRecordDAO } from '@/daos/wasteRecordDAO';
import { Timestamp, getDocs, collectionGroup } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { GlobalWasteRecordDAO } from '@/daos/globalWasteRecordDAO';
import { SummaryDAO } from '@/daos/summaryDAO';
import { UserService } from './userService';  

export class WasteRecordService {
  private dao = new WasteRecordDAO();
  private globalDAO = new GlobalWasteRecordDAO();
  private summaryDAO = new SummaryDAO();

  async registrar(userId: string, record: Omit<WasteRecord, 'id'>): Promise<string> {
    // 1. Registro individual do usuário
    const docId = await this.dao.create(userId, record);
    await UserService.incrementUserTotals(userId, record.totalKg, record.pontos);
    await this.globalDAO.create(record);
    await this.summaryDAO.incrementTotals(record.totalKg, record.pontos);

    return docId;
  }

  async getHistorico(userId: string): Promise<WasteRecord[]> {
    return this.dao.findByUser(userId);
  }

  async calcularTotais(records: WasteRecord[]): Promise<Quantidades> {
    const totais: Quantidades = { plastico: 0, papel: 0, vidro: 0, metal: 0, outros: 0 };
    records.forEach(r => {
      for (const [tipo, valor] of Object.entries(r.quantidade)) {
        if (tipo in totais) {
          totais[tipo as keyof Quantidades] += valor;
        }
      }
    });
    return totais;
  }

  async getAllRecords(): Promise<WasteRecord[]> {
    // se admin, consulta todos os usuários
    const snapshot = await getDocs(collectionGroup(db, 'registro_descarte_global'));
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        dataRegistro: (data.dataRegistro as Timestamp).toDate(),
      } as WasteRecord;
    });
  }

  async getTotais(records: WasteRecord[]) {
    const totais: Quantidades = { plastico: 0, papel: 0, vidro: 0, metal: 0, outros: 0 };
    records.forEach(r => {
      for (const tipo of Object.keys(totais)) {
        totais[tipo as keyof Quantidades] += r.quantidade[tipo as keyof Quantidades];
      }
    });
    return totais;
  }

}