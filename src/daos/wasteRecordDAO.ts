import { db } from "@/firebase/firebaseConfig";
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, query, where } from "firebase/firestore";
import { WasteRecord } from "@/models/wasteRecord";

const wasteCollection = collection(db, "waste_records");

export class WasteRecordDAO {
  /** Criar um novo registro de pesagem */
  async create(record: Omit<WasteRecord, "id">): Promise<string> {
    const docRef = await addDoc(wasteCollection, {
      ...record,
      dataRegistro: record.dataRegistro ?? new Date(),
    });
    return docRef.id;
  }

  /** Buscar todos os registros */
  async findAll(): Promise<WasteRecord[]> {
    const snapshot = await getDocs(wasteCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as WasteRecord[];
  }

  /** Buscar por ID */
  async findById(id: string): Promise<WasteRecord | null> {
    const snapshot = await getDoc(doc(db, "waste_records", id));
    return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as WasteRecord) : null;
  }

  /** Atualizar registro */
  async update(id: string, data: Partial<WasteRecord>): Promise<void> {
    await updateDoc(doc(db, "waste_records", id), data);
  }

  /** Buscar registros de um bairro */
  async findByBairro(bairro: string): Promise<WasteRecord[]> {
    const q = query(wasteCollection, where("bairro", "==", bairro));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WasteRecord[];
  }

  /** Buscar registros de uma cidade */
  async findByCidade(cidade: string): Promise<WasteRecord[]> {
    const q = query(wasteCollection, where("cidade", "==", cidade));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WasteRecord[];
  }
}
