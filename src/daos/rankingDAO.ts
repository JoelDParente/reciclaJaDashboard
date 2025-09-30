import { db } from "@/firebase/firebaseConfig";
import { collection, query, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { Ranking } from "@/models/ranking";

export class RankingDAO {
  private usersCollection() {
    return collection(db, "users");
  }

  async getRanking(): Promise<Ranking[]> {
    const q = query(this.usersCollection(), orderBy("points", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      nome: doc.data().nome || "Sem nome",
      pontos: doc.data().points ?? 0
    })) as Ranking[];
  }

  listenRanking(callback: (ranking: Ranking[]) => void) {
    const q = query(this.usersCollection(), orderBy("points", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ranking: Ranking[] = snapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome || "Sem nome",
        pontos: doc.data().points ?? 0
      }));
      callback(ranking);
    });

    return unsubscribe; // permite cancelar o listener
  }
}
