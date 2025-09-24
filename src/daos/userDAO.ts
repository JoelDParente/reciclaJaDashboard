import { db } from "@/firebase/firebaseConfig";
import { collection, addDoc, getDocs, getDoc, doc, updateDoc } from "firebase/firestore";
import { User } from "@/models/user";

const userCollection = collection(db, "users");

export class UserDAO {
  async create(user: Omit<User, "id">): Promise<string> {
    const docRef = await addDoc(userCollection, { 
      ...user, 
      createdAt: new Date(),
      isActive: user.isActive ?? true,
      points: user.points ?? 0
    });
    return docRef.id;
  }

  async findAll(): Promise<User[]> {
    const snapshot = await getDocs(userCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
  }

  async findById(id: string): Promise<User | null> {
    const snapshot = await getDoc(doc(db, "users", id));
    return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as User) : null;
  }

  async update(id: string, user: Partial<User>): Promise<void> {
    await updateDoc(doc(db, "users", id), user);
  }

  async toggleActive(id: string, isActive: boolean): Promise<void> {
    await updateDoc(doc(db, "users", id), { isActive });
  }

  async countAll(): Promise<number> {
    const snapshot = await getDocs(userCollection);
    return snapshot.size;
  }

  async sumAllPoints(): Promise<number> {
    const snapshot = await getDocs(userCollection);
    let total = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      total += (data.points ?? 0); // garante que undefined vira 0
    });

    return total;
  }
}