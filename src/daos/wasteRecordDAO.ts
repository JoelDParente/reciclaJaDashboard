import { WasteRecord } from '@/models/wasteRecord';
import { db } from '@/firebase/firebaseConfig';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  orderBy,
  where,
  Timestamp,
  collectionGroup,
} from 'firebase/firestore';

export class WasteRecordDAO {
  /** Subcoleção de histórico de registros de um usuário */
  private collectionRef(userId: string) {
    return collection(db, `users/${userId}/historico_registro`);
  }

  /** Cria um novo registro de pesagem para o usuário */
  async create(userId: string, record: Omit<WasteRecord, 'id'>): Promise<string> {
    const docRef = await addDoc(this.collectionRef(userId), {
      ...record,
      dataRegistro: Timestamp.fromDate(record.dataRegistro),
    });
    return docRef.id;
  }

  /** Busca registros de um usuário */
  async findByUser(userId: string): Promise<WasteRecord[]> {
    const q = query(this.collectionRef(userId), orderBy('dataRegistro', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (docSnap) =>
        ({
          id: docSnap.id,
          ...docSnap.data(),
          dataRegistro: (docSnap.data().dataRegistro as Timestamp).toDate(),
        } as WasteRecord)
    );
  }

  /** Busca todos os registros de todos os usuários */
  async findAll(): Promise<WasteRecord[]> {
    const q = query(collectionGroup(db, 'historico_registro'), orderBy('dataRegistro', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (docSnap) =>
        ({
          id: docSnap.id,
          ...docSnap.data(),
          dataRegistro: (docSnap.data().dataRegistro as Timestamp).toDate(),
        } as WasteRecord)
    );
  }

  /** Busca registros filtrando por bairro */
  async findByBairro(bairro: string): Promise<WasteRecord[]> {
    const q = query(
      collectionGroup(db, 'historico_registro'),
      where('bairro', '==', bairro),
      orderBy('dataRegistro', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (docSnap) =>
        ({
          id: docSnap.id,
          ...docSnap.data(),
          dataRegistro: (docSnap.data().dataRegistro as Timestamp).toDate(),
        } as WasteRecord)
    );
  }

  /** Busca registros filtrando por cidade */
  async findByCidade(cidade: string): Promise<WasteRecord[]> {
    const q = query(
      collectionGroup(db, 'historico_registro'),
      where('cidade', '==', cidade),
      orderBy('dataRegistro', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (docSnap) =>
        ({
          id: docSnap.id,
          ...docSnap.data(),
          dataRegistro: (docSnap.data().dataRegistro as Timestamp).toDate(),
        } as WasteRecord)
    );
  }
}