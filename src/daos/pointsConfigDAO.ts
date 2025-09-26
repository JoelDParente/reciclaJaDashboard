// src/daos/pointsConfigDAO.ts
import { db } from '@/firebase/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { PointsConfig } from '@/models/points';

export class PointsConfigDAO {
  private configDocRef = doc(db, 'config', 'points'); // path: config/points

  async getCurrentConfig(): Promise<PointsConfig | null> {
    const snap = await getDoc(this.configDocRef);
    if (!snap.exists()) return null;
    const data = snap.data() as any;
    // normalize updatedAt caso venha como Timestamp
    const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt || new Date();
    return {
      id: snap.id,
      mode: data.mode,
      fixedPoints: data.fixedPoints ?? 0,
      pointsPerKg: data.pointsPerKg ?? 0,
      materialWeights: data.materialWeights ?? {},
      updatedAt,
    } as PointsConfig;
  }

  async saveConfig(cfg: PointsConfig): Promise<void> {
    const payload = {
      mode: cfg.mode,
      fixedPoints: Number(cfg.fixedPoints) || 0,
      pointsPerKg: Number(cfg.pointsPerKg) || 0,
      materialWeights: cfg.materialWeights || {},
      updatedAt: new Date(),
    };
    await setDoc(this.configDocRef, payload);
  }
}