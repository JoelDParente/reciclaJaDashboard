import { PointsConfig } from '@/models/points';
import { db } from '@/firebase/firebaseConfig'; // seu Firebase Admin SDK
import { collection, doc, getDocs, query, orderBy, limit, setDoc, Timestamp } from 'firebase/firestore';

export class PointsConfigDAO {
  private collectionRef = collection(db, 'pointsConfig');

  // Buscar a configuração mais recente
async getCurrentConfig(): Promise<PointsConfig | null> {
  const q = query(this.collectionRef, orderBy('updatedAt', 'desc'), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const docData = snapshot.docs[0].data();

  // Converter updatedAt corretamente
  const updatedAt =
    docData.updatedAt instanceof Timestamp
      ? docData.updatedAt.toDate()
      : docData.updatedAt;

  return {
    id: docData.id,
    mode: docData.mode,
    fixedPoints: docData.fixedPoints,
    pointsPerKg: docData.pointsPerKg,
    materialWeights: docData.materialWeights,
    updatedAt,
  } as PointsConfig;
}

  // Salvar ou atualizar configuração
  async updateConfig(config: PointsConfig): Promise<void> {
    const docRef = doc(this.collectionRef, config.id || 'default');
    await setDoc(docRef, { ...config, updatedAt: new Date() });
  }
}
