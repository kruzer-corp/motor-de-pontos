// ── Fonte única de dados de membro — usada pela listagem e pelo detalhe ──────

export type Tier     = "Bronze" | "Prata" | "Ouro" | "Diamante";
export type Segmento = "Premium" | "Frete Grátis" | "Fidelidade" | "Básico" | string;
export type StatusMembro = "ativo" | "pendente" | "recusado" | "inativo";

export type SaldoCampanha = {
  campanhaId: string; campanhaNome: string; moeda: string; abrev: string; valor: number;
};

export type Transacao = {
  id: string; data: string; descricao: string;
  tipo: "acumulo" | "resgate" | "ajuste" | "expiracao";
  valor: number; saldo: number;
};

export type PedidoResgate = {
  id: string; data: string; produto: string;
  status: "entregue" | "processando" | "cancelado"; pontos: number;
};

export type AjusteManual = {
  id: string; data: string; operador: string;
  motivo: string; valor: number; saldoAntes: number;
};

export type Membro = {
  id: string;
  nome: string;
  initials: string;
  cpf: string;
  email: string;
  telefone: string;
  canal: string;
  tier: Tier;
  segmento: Segmento;
  status: StatusMembro;
  motivoRecusa?: string;
  desde: string;
  saldos: SaldoCampanha[];
  expiram30d: number;
  transacoes: Transacao[];
  pedidos: PedidoResgate[];
  ajustes: AjusteManual[];
};

// ── Cores por moeda — usadas nos chips de saldo ───────────────────────────────

export const MOEDA_COR: Record<string, "primary" | "success" | "warning" | "secondary" | "muted"> = {
  Pontos: "primary", Cashback: "success", Milhas: "warning", Créditos: "secondary",
};

export function agruparSaldosPorMoeda(saldos: SaldoCampanha[]) {
  const porMoeda = new Map<string, { moeda: string; abrev: string; total: number }>();
  for (const s of saldos) {
    const atual = porMoeda.get(s.moeda);
    if (atual) atual.total += s.valor;
    else porMoeda.set(s.moeda, { moeda: s.moeda, abrev: s.abrev, total: s.valor });
  }
  return Array.from(porMoeda.values());
}

// ── Dados iniciais (seed) ──────────────────────────────────────────────────────

const SEED: Membro[] = [
  {
    id: "1", nome: "Aline P.", initials: "AP",
    cpf: "123.456.789-00", email: "aline.p@email.com", telefone: "(11) 99876-5432", canal: "Loja física",
    tier: "Diamante", segmento: "Premium", status: "ativo", desde: "12/04/2025",
    saldos: [
      { campanhaId: "BF2026",       campanhaNome: "Black Friday 2026", moeda: "Pontos",   abrev: "pts", valor: 5200 },
      { campanhaId: "CAMP-2025-06", campanhaNome: "Campanha Junho",    moeda: "Cashback", abrev: "R$",  valor: 320  },
    ],
    expiram30d: 0,
    transacoes: [
      { id: "t1", data: "18/06/2025", descricao: "Compra na loja — R$ 320,00", tipo: "acumulo", valor: 320, saldo: 5200 },
      { id: "t2", data: "15/06/2025", descricao: "Resgate — Cupom 10% desconto", tipo: "resgate", valor: -500, saldo: 4880 },
      { id: "t3", data: "10/06/2025", descricao: "Compra na loja — R$ 180,00", tipo: "acumulo", valor: 180, saldo: 5380 },
      { id: "t4", data: "05/06/2025", descricao: "Ajuste manual — Campanha Dia das Mães", tipo: "ajuste", valor: 200, saldo: 5200 },
      { id: "t5", data: "01/06/2025", descricao: "Compra na loja — R$ 560,00", tipo: "acumulo", valor: 560, saldo: 5000 },
      { id: "t6", data: "28/05/2025", descricao: "Expiração por inatividade", tipo: "expiracao", valor: -120, saldo: 4440 },
      { id: "t7", data: "22/05/2025", descricao: "Compra na loja — R$ 240,00", tipo: "acumulo", valor: 240, saldo: 4560 },
    ],
    pedidos: [
      { id: "PED-001", data: "15/06/2025", produto: "Cupom 10% desconto", status: "entregue", pontos: 500 },
      { id: "PED-002", data: "28/04/2025", produto: "Kit presente premium", status: "entregue", pontos: 1200 },
    ],
    ajustes: [
      { id: "AJ-001", data: "05/06/2025", operador: "Maria Admin", motivo: "Campanha Dia das Mães — bônus manual", valor: 200, saldoAntes: 5000 },
      { id: "AJ-002", data: "14/03/2025", operador: "João Ops", motivo: "Correção de transação duplicada", valor: -150, saldoAntes: 4200 },
    ],
  },
  {
    id: "2", nome: "Bruno C.", initials: "BC",
    cpf: "987.654.321-00", email: "bruno.c@email.com", telefone: "(21) 98765-4321", canal: "App",
    tier: "Ouro", segmento: "Frete Grátis", status: "ativo", desde: "22/01/2025",
    saldos: [
      { campanhaId: "CAMP-2025-04", campanhaNome: "Campanha Abril", moeda: "Pontos", abrev: "pts", valor: 3200 },
    ],
    expiram30d: 340,
    transacoes: [
      { id: "t1", data: "17/06/2025", descricao: "Compra no app — R$ 210,00", tipo: "acumulo", valor: 263, saldo: 3200 },
      { id: "t2", data: "12/06/2025", descricao: "Resgate — Frete grátis", tipo: "resgate", valor: -300, saldo: 2937 },
      { id: "t3", data: "08/06/2025", descricao: "Compra no app — R$ 95,00", tipo: "acumulo", valor: 119, saldo: 3237 },
      { id: "t4", data: "03/06/2025", descricao: "Ajuste manual — Erro de processamento", tipo: "ajuste", valor: 150, saldo: 3118 },
      { id: "t5", data: "25/05/2025", descricao: "Compra no app — R$ 420,00", tipo: "acumulo", valor: 525, saldo: 2968 },
    ],
    pedidos: [
      { id: "PED-003", data: "12/06/2025", produto: "Frete grátis (voucher)", status: "processando", pontos: 300 },
    ],
    ajustes: [
      { id: "AJ-003", data: "03/06/2025", operador: "Maria Admin", motivo: "Erro de processamento — reembolso em pontos", valor: 150, saldoAntes: 2968 },
    ],
  },
  {
    id: "3", nome: "Cecília M.", initials: "CM",
    cpf: "456.789.123-00", email: "cecilia.m@email.com", telefone: "(31) 97654-3210", canal: "App",
    tier: "Prata", segmento: "Fidelidade", status: "ativo", desde: "03/08/2024",
    saldos: [
      { campanhaId: "CAMP-2025-05", campanhaNome: "Campanha Maio", moeda: "Milhas", abrev: "mi", valor: 1800 },
    ],
    expiram30d: 120,
    transacoes: [
      { id: "t1", data: "16/06/2025", descricao: "Compra no app — R$ 88,00", tipo: "acumulo", valor: 110, saldo: 1800 },
      { id: "t2", data: "10/06/2025", descricao: "Expiração de saldo inativo", tipo: "expiracao", valor: -240, saldo: 1690 },
      { id: "t3", data: "02/06/2025", descricao: "Compra no app — R$ 130,00", tipo: "acumulo", valor: 163, saldo: 1930 },
    ],
    pedidos: [],
    ajustes: [],
  },
  {
    id: "4", nome: "Danilo R.", initials: "DR",
    cpf: "321.654.987-00", email: "danilo.r@email.com", telefone: "(41) 96543-2109", canal: "Dispositivo (PDV)",
    tier: "Bronze", segmento: "Básico", status: "ativo", desde: "17/03/2025",
    saldos: [
      { campanhaId: "CAMP-2025-05", campanhaNome: "Campanha Maio", moeda: "Pontos", abrev: "pts", valor: 760 },
    ],
    expiram30d: 760,
    transacoes: [
      { id: "t1", data: "15/06/2025", descricao: "Compra no PDV — R$ 45,00", tipo: "acumulo", valor: 45, saldo: 760 },
      { id: "t2", data: "08/06/2025", descricao: "Compra no PDV — R$ 120,00", tipo: "acumulo", valor: 120, saldo: 715 },
      { id: "t3", data: "01/06/2025", descricao: "Compra no PDV — R$ 75,00", tipo: "acumulo", valor: 75, saldo: 595 },
    ],
    pedidos: [],
    ajustes: [],
  },
  {
    id: "5", nome: "Eduardo F.", initials: "EF",
    cpf: "", email: "", telefone: "", canal: "App",
    tier: "Bronze", segmento: "Básico", status: "pendente", desde: "08/07/2026",
    saldos: [], expiram30d: 0, transacoes: [], pedidos: [], ajustes: [],
  },
  {
    id: "6", nome: "Fernanda L.", initials: "FL",
    cpf: "", email: "", telefone: "", canal: "App",
    tier: "Bronze", segmento: "Básico", status: "pendente", desde: "10/07/2026",
    saldos: [], expiram30d: 0, transacoes: [], pedidos: [], ajustes: [],
  },
  {
    id: "7", nome: "Gustavo M.", initials: "GM",
    cpf: "", email: "", telefone: "", canal: "App",
    tier: "Bronze", segmento: "Fidelidade", status: "pendente", desde: "14/07/2026",
    saldos: [], expiram30d: 0, transacoes: [], pedidos: [], ajustes: [],
  },
];

// ── Persistência (localStorage — sem back-end neste protótipo) ───────────────

const KEY = "motor_pontos_membros";

export function getMembros(): Membro[] {
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : SEED;
  } catch {
    return SEED;
  }
}

export function saveMembros(list: Membro[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getMembro(id: string): Membro | undefined {
  return getMembros().find((m) => m.id === id);
}

export function upsertMembro(m: Membro): Membro[] {
  const list = getMembros();
  const idx = list.findIndex((x) => x.id === m.id);
  const next = idx >= 0 ? list.map((x) => (x.id === m.id ? m : x)) : [...list, m];
  saveMembros(next);
  return next;
}
