export interface SolicitacaoColeta {
  id?: string;          // ID do documento no Firestore
  userId: string;
  userName: string;
  email: string;
  bairro: string;
  date: Date;           // data da coleta 
  date_string: string;  // string da data (YYYY-MM-DD)
  timestamp: Date;      // timestamp de criação da solicitação
  status: boolean; //status da solicitação
}
