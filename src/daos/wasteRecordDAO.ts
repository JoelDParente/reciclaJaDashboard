import { WasteRecord } from '@/models/wasteRecord';
import { db } from '@/firebase/firebaseConfig';
import { collection, doc, getDocs, addDoc, query, orderBy, where } from 'firebase/firestore';

export class WasteRecordDAO {
  private collectionRef = collection(db, 'waste_records');

  async create(record: WasteRecord): Promise<void> {
    await addDoc(this.collectionRef, { ...record, dataRegistro: record.dataRegistro });
  }

  async findByUser(userId: string): Promise<WasteRecord[]> {
    const q = query(this.collectionRef, where('userId', '==', userId), orderBy('dataRegistro', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as WasteRecord) }));
  }

  async findAll(): Promise<WasteRecord[]> {
    const q = query(this.collectionRef, orderBy('dataRegistro', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as WasteRecord) }));
  }
}