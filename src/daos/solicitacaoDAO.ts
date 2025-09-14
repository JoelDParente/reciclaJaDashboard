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
} from "firebase/firestore";
import { SolicitacaoColeta } from "@/models/solicitacao";

const solicitacaoCollection = collection(db, "collection_requests");

export class SolicitacaoDAO {
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
}
