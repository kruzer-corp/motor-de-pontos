export type TierId = "bronze" | "prata" | "ouro" | "diamante";

export type Tier = {
  id: TierId;
  nome: string;
  corChip: string;
  corDot: string;
};

export const TIERS: Tier[] = [
  { id: "bronze",   nome: "Bronze",   corChip: "bg-orange-100 text-orange-700 border-orange-200", corDot: "bg-orange-400" },
  { id: "prata",    nome: "Prata",    corChip: "bg-slate-100 text-slate-600 border-slate-200",     corDot: "bg-slate-400"  },
  { id: "ouro",     nome: "Ouro",     corChip: "bg-amber-100 text-amber-700 border-amber-200",     corDot: "bg-amber-400"  },
  { id: "diamante", nome: "Diamante", corChip: "bg-violet-100 text-violet-700 border-violet-200",  corDot: "bg-violet-500" },
];

export type Segmento = {
  id: string;
  nome: string;
};

export const SEGMENTOS: Segmento[] = [
  { id: "SEG-001", nome: "Premium" },
  { id: "SEG-002", nome: "Fidelidade" },
  { id: "SEG-003", nome: "Frete Grátis" },
  { id: "SEG-004", nome: "Em Risco" },
  { id: "SEG-005", nome: "Básico" },
  { id: "SEG-006", nome: "Novos (últimos 30d)" },
];
