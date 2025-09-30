import { PointsRecord } from '@/models/points';
import { db } from '@/firebase/firebaseConfig';
import { collection, addDoc, getDocs, orderBy, Timestamp, query, DocumentData } from 'firebase/firestore';

export class PointsDAO {
  private collectionRef(userId: string) {
    return collection(db, `users/${userId}/pontos`);
  }

  async create(userId: string, record: Omit<PointsRecord, 'id'>): Promise<string> {
    const docRef = await addDoc(this.collectionRef(userId), {
      ...record,
      createdAt: Timestamp.fromDate(record.createdAt),
    });
    return docRef.id;
  }

  // Função auxiliar para conversão de DocumentData para PointsRecord
  private mapDocToPointsRecord(doc: DocumentData): PointsRecord {
    const data = doc.data();
    
    const createdAt = data.createdAt instanceof Timestamp 
      ? data.createdAt.toDate() 
      : new Date();
      
    return {
      id: doc.id,
      userId: data.userId,
      totalPoints: data.totalPoints,
      reason: data.reason,
      createdAt: createdAt,
    } as PointsRecord;
  }

  async findByUser(userId: string): Promise<PointsRecord[]> {
    const snapshot = await getDocs(
      query(this.collectionRef(userId), orderBy('createdAt', 'desc'))
    );
    
    return snapshot.docs.map(doc => this.mapDocToPointsRecord(doc));
  }

  async addUserPoints(userId: string, pontos: number, reason: string) {
    await this.create(userId, {
      userId,
      totalPoints: pontos,
      reason,
      createdAt: new Date(),
    });
  }
}