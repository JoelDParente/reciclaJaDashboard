import { Card } from '@/models/cards';
import { CardDAO } from '@/daos/cardDAO';

export class CardService {
  static async createCard(data: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return await CardDAO.create(data);
  }

  static async listCards(): Promise<Card[]> {
    return await CardDAO.getAll();
  }

  static async getCard(id: string): Promise<Card | null> {
    return await CardDAO.getById(id);
  }

  static async updateCard(id: string, data: Partial<Card>): Promise<void> {
    await CardDAO.update(id, data);
  }

  static async deleteCard(id: string): Promise<void> {
    await CardDAO.delete(id);
  }
}
