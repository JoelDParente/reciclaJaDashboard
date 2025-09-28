import { db } from "@/firebase/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import { SolicitacaoColeta } from "@/models/solicitacao";

const solicitacaoCollection = collection(db, "collection_requests");

export class SolicitacaoDAO {
  private collectionRef = collection(db, "collection_requests");
  // Criar uma nova solicitação
  async create(solicitacao: Omit<SolicitacaoColeta, "id">): Promise<string> {
    const docRef = await addDoc(solicitacaoCollection, solicitacao);
    return docRef.id;
  }

  // Buscar todas as solicitações
  async findAll(): Promise<SolicitacaoColeta[]> {
    const snapshot = await getDocs(solicitacaoCollection);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SolicitacaoColeta[];
  }

  // Buscar uma solicitação pelo ID
  async findById(id: string): Promise<SolicitacaoColeta | null> {
    const docRef = doc(db, "collection_requests", id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as SolicitacaoColeta) : null;
  }

  // Buscar solicitações por usuário
  async findByUserId(userId: string): Promise<SolicitacaoColeta[]> {
    const q = query(solicitacaoCollection, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SolicitacaoColeta[];
  }

  // Atualizar uma solicitação
  async update(id: string, data: Partial<SolicitacaoColeta>): Promise<void> {
    const docRef = doc(db, "collection_requests", id);
    await updateDoc(docRef, data);
  }

  // Excluir uma solicitação
  async delete(id: string): Promise<void> {
    const docRef = doc(db, "collection_requests", id);
    await deleteDoc(docRef);
  }

  // Contar o total de solicitações
  async countAll(): Promise<number> {
    const snapshot = await getDocs(solicitacaoCollection);
    return snapshot.size;
  }
 
  async getAllRequests(): Promise<SolicitacaoColeta[]> {
    const snapshot = await getDocs(collection(db, 'collection_requests'));
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        date: data.date.toDate(),
        timestamp: data.timestamp.toDate(),
      } as SolicitacaoColeta;
    });
  }

  listenTotalRequests(callback: (count: number) => void): () => void {
    const unsubscribe = onSnapshot(this.collectionRef, (snapshot) => {
      callback(snapshot.size);
    });
    return unsubscribe;
  }

  listenAllRequests(callback: (requests: SolicitacaoColeta[]) => void) {
    const unsubscribe = onSnapshot(this.collectionRef, (snapshot) => {
      const allRequests: SolicitacaoColeta[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          date: data.date?.toDate?.() ?? new Date(),
        } as SolicitacaoColeta;
      });
      callback(allRequests);
    });

    return unsubscribe;
  }

  listenMonthlyEvolution(callback: (monthlyData: number[]) => void): () => void {
    const unsubscribe = onSnapshot(this.collectionRef, (snapshot) => {
      const months = Array(12).fill(0); // Jan a Dez

      snapshot.forEach((doc) => {
        const data = doc.data();
        const date: Date = data.date?.toDate?.() ?? new Date(); // usar data da solicitação
        const monthIndex = date.getMonth(); // 0 = Jan
        months[monthIndex] += 1;
      });

      callback(months);
    });

    return unsubscribe;
  }

  listenRequestsByBairro(callback: (data: { labels: string[]; chartSeries: number[] }) => void) {
    const unsubscribe = onSnapshot(this.collectionRef, (snapshot) => {
      const agrupado: Record<string, number> = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        const bairro = data.bairro ?? "Desconhecido";
        agrupado[bairro] = (agrupado[bairro] || 0) + 1;
      });

      callback({
        labels: Object.keys(agrupado),
        chartSeries: Object.values(agrupado),
      });
    });

    return unsubscribe;
  }
}
