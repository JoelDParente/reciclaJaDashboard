// src/daos/BairroDAO.ts
import { db } from '@/firebase/firebaseConfig';
import { collection, doc, getDoc, getDocs, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { BairroDoc } from '@/models/bairros';

export class BairroDAO {
  private collectionRef = collection(db, 'bairros');

  // Buscar todas as cidades com seus bairros
  async getAll(): Promise<BairroDoc[]> {
    const snapshot = await getDocs(this.collectionRef);
    return snapshot.docs.map((d) => {
      const data = d.data();
      const cidadeKey = Object.keys(data)[0]; // cada doc tem só uma chave
      return {
        id: d.id,
        cidade: cidadeKey,
        bairros: data[cidadeKey] as string[],
      };
    });
  }

  // Buscar bairros de uma cidade
  async getByCidade(cidadeId: string): Promise<BairroDoc | null> {
    const docRef = doc(this.collectionRef, cidadeId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    const cidadeKey = Object.keys(data)[0];

    return {
      id: docSnap.id,
      cidade: cidadeKey,
      bairros: data[cidadeKey] as string[],
    };
  }

  // Adicionar bairro ao array da cidade
 async addBairro(cidadeId: string, bairro: string): Promise<void> {
    const docRef = doc(this.collectionRef, cidadeId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Cidade não encontrada');

    const data = docSnap.data();
    const cidadeKey = Object.keys(data)[0]; // exemplo: "Morada Nova"

    await updateDoc(docRef, {
      [cidadeKey]: arrayUnion(bairro),
    });
  }

  // Remover bairro do array da cidade
  async removeBairro(cidadeId: string, bairro: string): Promise<void> {
    const docRef = doc(this.collectionRef, cidadeId);
    await updateDoc(docRef, {
      [cidadeId]: arrayRemove(bairro),
    });
  }
}