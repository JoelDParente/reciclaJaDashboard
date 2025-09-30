import { db } from '@/firebase/firebaseConfig';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { Card } from '@/models/cards';

const COLLECTION_NAME = 'cards';

export class CardDAO {
  static async create(card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...card,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });
    return docRef.id;
  }

  static async getAll(): Promise<Card[]> {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    return snap.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title,
        content: data.content,
        category: data.category,
        createdAt: data.createdAt?.toDate() ?? new Date(),
        updatedAt: data.updatedAt?.toDate() ?? new Date(),
      } as Card;
    });
  }

  static async getById(id: string): Promise<Card | null> {
    const ref = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;

    const data = snap.data();
    return {
      id: snap.id,
      title: data.title,
      content: data.content,
      category: data.category,
      createdAt: data.createdAt?.toDate() ?? new Date(),
      updatedAt: data.updatedAt?.toDate() ?? new Date(),
    } as Card;
  }

  static async update(id: string, card: Partial<Card>): Promise<void> {
    const ref = doc(db, COLLECTION_NAME, id);
    await updateDoc(ref, {
      ...card,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  }

  static async delete(id: string): Promise<void> {
    const ref = doc(db, COLLECTION_NAME, id);
    await deleteDoc(ref);
  }
}
