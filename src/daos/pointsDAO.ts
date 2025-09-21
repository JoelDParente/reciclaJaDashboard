import { PointsRecord } from '@/models/points';
import { db } from '@/firebase/firebaseConfig';
import { collection, addDoc, getDocs, orderBy, Timestamp, query } from 'firebase/firestore';

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

  async findByUser(userId: string): Promise<PointsRecord[]> {
    const snapshot = await getDocs(
      query(this.collectionRef(userId), orderBy('createdAt', 'desc'))
    );
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp).toDate(),
    } as PointsRecord));
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