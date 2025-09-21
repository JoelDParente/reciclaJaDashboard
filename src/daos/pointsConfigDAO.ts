import { PointsConfig } from '@/models/points';
import { db } from '@/firebase/firebaseConfig';
import { collection, doc, getDocs, setDoc, query, orderBy, limit, Timestamp } from 'firebase/firestore';

export class PointsConfigDAO {
  private collectionRef = collection(db, 'pointsConfig');

  async getCurrentConfig(): Promise<PointsConfig | null> {
    const q = query(this.collectionRef, orderBy('updatedAt', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const data = snapshot.docs[0].data();
    return {
      id: snapshot.docs[0].id,
      ...data,
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    } as PointsConfig;
  }

  async updateConfig(config: PointsConfig): Promise<void> {
    const docRef = doc(this.collectionRef, config.id || 'default');
    await setDoc(docRef, { ...config, updatedAt: new Date() });
  }
}