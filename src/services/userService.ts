import { UserDAO } from "@/daos/userDAO";
import { User } from "@/models/user";
import { getFirestore, doc, updateDoc, increment } from "firebase/firestore";

const userDao = new UserDAO();
const db = getFirestore();

export const UserService = {

   async incrementUserTotals(userId: string, totalKg: number, pontos: number,co2Evited: number) {
    const userRef = doc(db, 'users', userId);

    await updateDoc(userRef, {
      totalKg: increment(totalKg),
      points: increment(pontos),
      co2Evited: increment(co2Evited),
    });
  },

  async createUser(
    data: Omit<User, "id" | "createdAt" | "isActive" | "points">
  ) {
    return userDao.create({
      ...data,
      createdAt: new Date(),
      isActive: true,
      points: 0,
    });
  },

  async updateUserPoints(userId: string, pontos: number) {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      points: increment(pontos), // 👈 use o mesmo nome do modelo User
    });
  },

  async getAllUsers() {
    return userDao.findAll();
  },

  async getUser(id: string) {
    return userDao.findById(id);
  },

  async updateUser(id: string, data: Partial<User>) {
    return userDao.update(id, data);
  },

  async toggleUserActive(id: string, isActive: boolean) {
    return userDao.toggleActive(id, isActive);
  },

  async getTotalUsers() {
    return userDao.countAll();
  },
};