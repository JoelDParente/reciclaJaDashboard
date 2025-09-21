import { db } from '@/firebase/firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { WasteRecord } from '@/models/wasteRecord';

export class GlobalWasteRecordDAO {
  private collectionRef = collection(db, 'registro_descarte_global');

  async create(record: Omit<WasteRecord, 'id'>): Promise<string> {
    const docRef = await addDoc(this.collectionRef, {
      ...record,
      dataRegistro: Timestamp.fromDate(record.dataRegistro),
    });
    return docRef.id;
  }
}
