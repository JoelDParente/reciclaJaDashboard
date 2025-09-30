import { WasteRecord, Quantidades } from '@/models/wasteRecord';
import { WasteRecordDAO } from '@/daos/wasteRecordDAO';
import { Timestamp, getDocs, collectionGroup, doc, updateDoc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { GlobalWasteRecordDAO } from '@/daos/globalWasteRecordDAO';
import { SummaryDAO } from '@/daos/summaryDAO';
import { UserService } from './userService';

export class WasteRecordService {
  private dao = new WasteRecordDAO();
  private globalDAO = new GlobalWasteRecordDAO();
  private summaryDAO = new SummaryDAO();

  // fatores médios de CO₂ evitado (kg CO₂e / kg reciclado)
  private static FACTORS: Record<keyof Quantidades, number> = {
    plastico: 1.5,
    papel: 1.3,
    vidro: 0.3,
    metal: 4.0,
    outros: 0.2,
  };

  // Calcula CO₂ evitado
  static calcularCO2(quantidade: Quantidades): number {
    return Object.keys(WasteRecordService.FACTORS).reduce((acc, key) => {
      const tipo = key as keyof Quantidades;
      return acc + quantidade[tipo] * WasteRecordService.FACTORS[tipo];
    }, 0);
  }

  // Registra um novo descarte, sempre salvando co2Evited
  async registrar(userId: string, record: Omit<WasteRecord, 'id'>): Promise<string> {
    const recordWithCO2: Omit<WasteRecord, 'id'> = {
      ...record,
      co2Evited: WasteRecordService.calcularCO2(record.quantidade),
    };

    const docId = await this.dao.create(userId, recordWithCO2);
    await UserService.incrementUserTotals(userId, record.totalKg, record.pontos, recordWithCO2.co2Evited);
    await this.globalDAO.create(recordWithCO2);
    await this.summaryDAO.incrementTotals(record.totalKg, record.pontos);

    return docId;
  }

  async getHistorico(userId: string): Promise<WasteRecord[]> {
    return this.dao.findByUser(userId);
  }

  async calcularTotais(records: WasteRecord[]): Promise<Quantidades> {
    return records.reduce((totais, r) => {
      for (const tipo of Object.keys(r.quantidade) as (keyof Quantidades)[]) {
        totais[tipo] += r.quantidade[tipo];
      }
      return totais;
    }, { plastico: 0, papel: 0, vidro: 0, metal: 0, outros: 0 } as Quantidades);
  }

  async getAllRecords(): Promise<WasteRecord[]> {
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

  async getTotais(records: WasteRecord[]): Promise<Quantidades> {
    return records.reduce((totais, r) => {
      for (const tipo of Object.keys(totais) as (keyof Quantidades)[]) {
        totais[tipo] += r.quantidade[tipo];
      }
      return totais;
    }, { plastico: 0, papel: 0, vidro: 0, metal: 0, outros: 0 } as Quantidades);
  }

  // Soma total de CO₂ evitado de todos os registros
  async getCO2Total(records: WasteRecord[]): Promise<number> {
    return records.reduce((acc, r) => acc + (r.co2Evited || 0), 0);
  }

  async atualizarUserNameEmRegistros() {
    try {
      const query = collectionGroup(db, 'registro_descarte_global');
      const snapshot = await getDocs(query);
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data() as WasteRecord;

        // Se o registro já tiver userName, ignora
        if (data.userName) continue;

        // Busca o usuário pelo ID
        const user = await UserService.getUser(data.userId);
        if (user?.nome) {
          // Atualiza o documento com o userName
          await updateDoc(doc(db, docSnap.ref.path), { userName: user.nome });
          console.log(`Registro ${docSnap.id} atualizado com userName: ${user.nome}`);
        }
      }
      console.log('Todos os registros foram verificados e atualizados.');
    } catch (err) {
      console.error('Erro ao atualizar registros com userName:', err);
    }
  }
}