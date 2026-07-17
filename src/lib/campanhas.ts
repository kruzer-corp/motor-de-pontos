import { MOEDA } from "../config/programa";

// ── Tipos compartilhados entre a listagem (Minhas Campanhas) e o wizard ───────

export type CampStatus = "ativa" | "pausada" | "agendada" | "rascunho" | "encerrada" | "arquivada";

export type Classificacao = {
  id: string; nome: string; cor: string;
  pontosPorReal: string; temBonus: boolean; bonus: string;
};

export type Cluster = {
  id: string;
  nome: string;
  segmento: string;
  tiers: string[];
  fontes: string[];
  categoria: string;
  resultadoTipo: "taxa" | "multiplicador";
  resultadoValor: string;
};

export type Form = {
  codigo: string; nome: string; descricao: string; segmento: string;
  tiersElegiveis: string[];
  periodoInicio: string; periodoFim: string;
  fontes: Record<string, boolean>;
  pdvEscopo: "todas" | "especificas";
  pdvFiliais: string[];
  // Pontuação base da campanha
  moedaCampanha: string;
  taxaTipo: "taxa" | "fixo" | "multiplicador";
  taxaValor: string;
  arredondamento: "baixo" | "cima" | "proximo";
  statusConceder: Record<string, boolean>;
  diasCreditado: string;
  statusAnular: Record<string, boolean>;
  classificacoes: Classificacao[];
  moedas: Record<string, { ativo: boolean; valor: string }>;
  produtosElegiveis: string[];
  // Grupos de regras
  clusters: Cluster[];
  clustersEstrategia: "primeira" | "acumula" | "maior_valor";
  // Limites e vigência
  liberacaoTipo: "imediato" | "dias";
  liberacaoDias: string;
  expiracaoTipo: "herdar" | "meses" | "data_fixa";
  expiracaoMeses: string;
  expiracaoData: string;
  limiteAtivo: boolean;
  limitePts: string;
  limiteEscopo: "membro_campanha" | "membro_dia";
  tetoEmissaoAtivo: boolean;
  tetoEmissaoPts: string;
  cancelamentoPolicy: "estornar_tudo" | "estornar_proporcional" | "manter";
  aprovacaoTipo: "manual" | "automatica";
  aprovacaoTiposResgate: string[];
  aprovacaoValorMax: string;
  aprovacaoTiers: string[];
  multAlvo: "membro" | "produto";
  multBronze: string; multPrata: string; multOuro: string; multDiamante: string;
  multProdutos: Record<string, string>;
};

export const DEFAULTS: Form = {
  codigo: "CAMP01", nome: "", descricao: "", segmento: "todos",
  tiersElegiveis: [],
  periodoInicio: "", periodoFim: "",
  fontes: { portal: true, pdv: true, ecommerce: false, marketplace: false },
  pdvEscopo: "todas",
  pdvFiliais: [],
  moedaCampanha: MOEDA.nome, taxaTipo: "taxa", taxaValor: "", arredondamento: "baixo",
  statusConceder: { Aprovado: false, Faturado: false, "Em separação": false, Entregue: false, Concluído: false, Cancelado: false, Devolvido: false, Recusado: false },
  diasCreditado: "",
  statusAnular:   { Aprovado: false, Faturado: false, "Em separação": false, Entregue: false, Concluído: false, Cancelado: false, Devolvido: false, Recusado: false },
  classificacoes: [],
  produtosElegiveis: [],
  clusters: [],
  clustersEstrategia: "primeira",
  liberacaoTipo: "imediato",
  liberacaoDias: "7",
  expiracaoTipo: "herdar",
  expiracaoMeses: "12",
  expiracaoData: "",
  limiteAtivo: false,
  limitePts: "",
  limiteEscopo: "membro_campanha",
  tetoEmissaoAtivo: false,
  tetoEmissaoPts: "",
  cancelamentoPolicy: "estornar_tudo",
  aprovacaoTipo: "automatica",
  aprovacaoTiposResgate: ["voucher_digital"],
  aprovacaoValorMax: "",
  aprovacaoTiers: ["Bronze", "Prata", "Ouro", "Diamante"],
  moedas: {
    Pontos:   { ativo: true,  valor: "" },
    Cashback: { ativo: false, valor: "" },
    Milhas:   { ativo: false, valor: "" },
    Créditos: { ativo: false, valor: "" },
  },
  multAlvo: "membro",
  multBronze: "1", multPrata: "1.25", multOuro: "1.5", multDiamante: "2",
  multProdutos: {},
};

export type Campanha = Form & {
  id: string;
  status: CampStatus;
  color: string;
  agendadaPara?: string;
};

// ── Dados iniciais (seed) ──────────────────────────────────────────────────────

const SEED: Campanha[] = [
  {
    ...DEFAULTS,
    id: "CMP-001", codigo: "BOAS-VINDAS", nome: "Bônus de Boas-vindas", status: "ativa",
    descricao: "Pontos na primeira compra de cada novo membro.",
    segmento: "todos", periodoInicio: "01/01/2026", periodoFim: "31/12/2026",
    fontes: { portal: true, pdv: false, ecommerce: true, marketplace: false },
    taxaTipo: "taxa", taxaValor: "1", moedaCampanha: "Pontos",
    multAlvo: "membro", multBronze: "1", multPrata: "1", multOuro: "1", multDiamante: "1",
    limiteAtivo: true, limitePts: "500", limiteEscopo: "membro_campanha",
    tetoEmissaoAtivo: false, tetoEmissaoPts: "",
    color: "bg-emerald-500",
  },
  {
    ...DEFAULTS,
    id: "CMP-002", codigo: "ANIVERSARIO", nome: "Dobro no Aniversário", status: "ativa",
    descricao: "2× pontos em todos os pedidos feitos no mês de aniversário do membro.",
    segmento: "todos", periodoInicio: "01/01/2026", periodoFim: "31/12/2026",
    fontes: { portal: true, pdv: true, ecommerce: true, marketplace: false },
    taxaTipo: "taxa", taxaValor: "2", moedaCampanha: "Pontos",
    multAlvo: "membro", multBronze: "1", multPrata: "1", multOuro: "1", multDiamante: "1",
    limiteAtivo: true, limitePts: "2000", limiteEscopo: "membro_campanha",
    tetoEmissaoAtivo: false, tetoEmissaoPts: "",
    color: "bg-violet-500",
  },
  {
    ...DEFAULTS,
    id: "CMP-003", codigo: "VERAO26", nome: "Lançamento Verão", status: "ativa",
    descricao: "Campanha sazonal com multiplicadores por tier e teto de emissão.",
    segmento: "todos", periodoInicio: "01/07/2026", periodoFim: "31/08/2026",
    fontes: { portal: true, pdv: false, ecommerce: true, marketplace: true },
    taxaTipo: "taxa", taxaValor: "1", moedaCampanha: "Pontos",
    multAlvo: "membro", multBronze: "1", multPrata: "1.25", multOuro: "1.5", multDiamante: "2",
    limiteAtivo: false, limitePts: "", limiteEscopo: "membro_campanha",
    tetoEmissaoAtivo: true, tetoEmissaoPts: "500000",
    color: "bg-sky-500",
  },
  {
    ...DEFAULTS,
    id: "CMP-007", codigo: "BLACKFRIDAY26", nome: "Black Friday 2026", status: "agendada",
    descricao: "Multiplicador de pontos para a semana da Black Friday.",
    segmento: "todos", periodoInicio: "27/11/2026", periodoFim: "30/11/2026",
    agendadaPara: "27/11/2026 00:00",
    fontes: { portal: true, pdv: true, ecommerce: true, marketplace: false },
    taxaTipo: "taxa", taxaValor: "3", moedaCampanha: "Pontos",
    multAlvo: "membro", multBronze: "1", multPrata: "1.25", multOuro: "1.5", multDiamante: "2",
    limiteAtivo: true, limitePts: "4000", limiteEscopo: "membro_campanha",
    tetoEmissaoAtivo: true, tetoEmissaoPts: "800000",
    color: "bg-indigo-500",
  },
  {
    ...DEFAULTS,
    id: "CMP-004", codigo: "PARCEIRO-REC", nome: "Parceiro Recorrente", status: "rascunho",
    descricao: "Pontos extras para afiliados com compras recorrentes pelo PDV.",
    segmento: "arquiteto", periodoInicio: "", periodoFim: "",
    fontes: { portal: false, pdv: true, ecommerce: false, marketplace: false },
    taxaTipo: "taxa", taxaValor: "1.5", moedaCampanha: "Pontos",
    multAlvo: "membro", multBronze: "1", multPrata: "1.25", multOuro: "1.5", multDiamante: "2",
    limiteAtivo: true, limitePts: "3000", limiteEscopo: "membro_dia",
    tetoEmissaoAtivo: true, tetoEmissaoPts: "200000",
    color: "bg-blue-500",
  },
  {
    ...DEFAULTS,
    id: "CMP-005", codigo: "SUPER-JUN", nome: "Super Junho", status: "encerrada",
    descricao: "2× pontos em Eletrônicos durante todo o mês de junho.",
    segmento: "todos", periodoInicio: "01/06/2026", periodoFim: "30/06/2026",
    fontes: { portal: true, pdv: true, ecommerce: false, marketplace: false },
    taxaTipo: "taxa", taxaValor: "2", moedaCampanha: "Pontos",
    multAlvo: "membro", multBronze: "1", multPrata: "1.25", multOuro: "1.5", multDiamante: "2",
    limiteAtivo: true, limitePts: "5000", limiteEscopo: "membro_campanha",
    tetoEmissaoAtivo: true, tetoEmissaoPts: "300000",
    color: "bg-amber-500",
  },
  {
    ...DEFAULTS,
    id: "CMP-006", codigo: "MAE25", nome: "Dia das Mães 2025", status: "arquivada",
    descricao: "Pontos em dobro para compras de presente no Dia das Mães.",
    segmento: "todos", periodoInicio: "05/05/2025", periodoFim: "12/05/2025",
    fontes: { portal: true, pdv: false, ecommerce: true, marketplace: false },
    taxaTipo: "taxa", taxaValor: "2", moedaCampanha: "Pontos",
    multAlvo: "membro", multBronze: "1", multPrata: "1", multOuro: "1", multDiamante: "1",
    limiteAtivo: false, limitePts: "", limiteEscopo: "membro_campanha",
    tetoEmissaoAtivo: false, tetoEmissaoPts: "",
    color: "bg-pink-500",
  },
];

// ── Persistência (localStorage — sem back-end neste protótipo) ───────────────

const KEY = "motor_pontos_campanhas";

export function getCampanhas(): Campanha[] {
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : SEED;
  } catch {
    return SEED;
  }
}

export function saveCampanhas(list: Campanha[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getCampanha(id: string): Campanha | undefined {
  return getCampanhas().find((c) => c.id === id);
}

export function upsertCampanha(c: Campanha): Campanha[] {
  const list = getCampanhas();
  const idx = list.findIndex((x) => x.id === c.id);
  const next = idx >= 0 ? list.map((x) => (x.id === c.id ? c : x)) : [...list, c];
  saveCampanhas(next);
  return next;
}

export function removeCampanha(id: string): Campanha[] {
  const next = getCampanhas().filter((c) => c.id !== id);
  saveCampanhas(next);
  return next;
}

export function novoIdCampanha(): string {
  return `CMP-${String(Date.now()).slice(-6)}`;
}
