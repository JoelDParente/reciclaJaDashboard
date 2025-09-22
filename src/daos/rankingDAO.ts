import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
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
}
