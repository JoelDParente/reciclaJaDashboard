// src/models/Bairro.ts

export interface BairroDoc {
  id: string;            // ID do documento (ex: "SP")
  cidade: string;        // Nome da cidade (ex: "sp")
  bairros: string[];     // Lista de bairros da cidade
}
