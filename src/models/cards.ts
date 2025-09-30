export interface Card {
  id?: string; // opcional porque o Firestore gera
  title: string;
  content: string;
  category: 'materiais' | 'separar' | 'reuso' | 'consumo' | 'impacto';
  createdAt: Date;
  updatedAt: Date;
}
