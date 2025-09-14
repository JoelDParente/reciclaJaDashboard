import { UserDAO } from "@/daos/userDAO";
import { User } from "@/models/user";

const userDao = new UserDAO();



export const UserService = {
  async createUser(data: Omit<User, "id" | "createdAt" | "isActive" | "points">) {
    return userDao.create({
      ...data,
      createdAt: new Date(),
      isActive: true,
      points: 0,
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
  }
};
