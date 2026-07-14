export type Canal = "PDV" | "E-commerce" | "App";

export type Filial = {
  id: string;
  nome: string;
  codigo: string;
  canal: Canal;
  regiao: string;
  ativa: boolean;
};

export const FILIAIS: Filial[] = [
  { id: "f01", nome: "SP - Centro",      codigo: "SP01", canal: "PDV",       regiao: "Sudeste", ativa: true  },
  { id: "f02", nome: "SP - Sul",         codigo: "SP02", canal: "PDV",       regiao: "Sudeste", ativa: true  },
  { id: "f03", nome: "SP - Leste",       codigo: "SP03", canal: "PDV",       regiao: "Sudeste", ativa: true  },
  { id: "f04", nome: "RJ - Norte",       codigo: "RJ01", canal: "PDV",       regiao: "Sudeste", ativa: true  },
  { id: "f05", nome: "RJ - Barra",       codigo: "RJ02", canal: "PDV",       regiao: "Sudeste", ativa: false },
  { id: "f06", nome: "MG - Leste",       codigo: "MG01", canal: "PDV",       regiao: "Sudeste", ativa: true  },
  { id: "f07", nome: "RS - Centro",      codigo: "RS01", canal: "PDV",       regiao: "Sul",     ativa: true  },
  { id: "f08", nome: "BA - Salvador",    codigo: "BA01", canal: "PDV",       regiao: "Nordeste",ativa: false },
];
