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
} from 'firebase/firestore';

export class WasteRecordDAO {
  private collectionRef = collection(db, 'waste_records');

  /** Cria um novo registro de pesagem */
  async create(record: Omit<WasteRecord, 'id'>): Promise<string> {
    const docRef = await addDoc(this.collectionRef, {
      ...record,
      dataRegistro: Timestamp.fromDate(record.dataRegistro), // Salva como Timestamp
    });
    return docRef.id;
  }

  /** Busca registros por usuário */
  async findByUser(userId: string): Promise<WasteRecord[]> {
    const q = query(
      this.collectionRef,
      where('userId', '==', userId),
      orderBy('dataRegistro', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => this.docToRecord(doc.id, doc.data()));
  }

  /** Busca todos os registros */
  async findAll(): Promise<WasteRecord[]> {
    const q = query(this.collectionRef, orderBy('dataRegistro', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => this.docToRecord(doc.id, doc.data()));
  }

  /** Busca registros por bairro */
  async findByBairro(bairro: string): Promise<WasteRecord[]> {
    const q = query(
      this.collectionRef,
      where('bairro', '==', bairro),
      orderBy('dataRegistro', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => this.docToRecord(doc.id, doc.data()));
  }

  /** Busca registros por cidade */
  async findByCidade(cidade: string): Promise<WasteRecord[]> {
    const q = query(
      this.collectionRef,
      where('cidade', '==', cidade),
      orderBy('dataRegistro', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => this.docToRecord(doc.id, doc.data()));
  }

  /** Converte dados do Firestore para WasteRecord com Date */
  private docToRecord(id: string, data: any): WasteRecord {
    return {
      id,
      ...data,
      dataRegistro: data.dataRegistro instanceof Timestamp
        ? data.dataRegistro.toDate()
        : new Date(data.dataRegistro),
    };
  }
}