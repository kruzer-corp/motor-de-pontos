export type Canal = "PDV" | "E-commerce" | "App";

export type Filial = {
  id: string;
  nome: string;
  codigo: string;
  canal: Canal;
  regiao: string;
  ativa: boolean;
};

// Começa vazio de propósito — cadastre as lojas do zero.
export const FILIAIS: Filial[] = [];
