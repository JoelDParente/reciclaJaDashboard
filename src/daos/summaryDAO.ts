import { db } from '@/firebase/firebaseConfig';
import { doc, setDoc, getDoc, increment } from 'firebase/firestore';

export class SummaryDAO {
  private docRef = doc(db, 'estatisticas', 'global');

  async incrementTotals(totalKg: number, pontos: number) {
    await setDoc(this.docRef, {
      totalKg: increment(totalKg),
      totalPoints: increment(pontos),
      totalRegistros: increment(1),
    }, { merge: true });
  }

  async getSummary() {
    const snap = await getDoc(this.docRef);
    return snap.exists() ? snap.data() : { totalKg: 0, totalPoints: 0, totalRegistros: 0 };
  }
}
