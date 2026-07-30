// ── Tipos compartilhados entre a listagem (Minhas Campanhas) e o wizard ───────
// Campanha é autossuficiente — define sua própria Elegibilidade (Quem/Onde/O
// quê/Quando), sem referenciar uma Regra da Mecânica. Output e Políticas ainda
// estão no formato antigo (tabela/teto único) até migrarem pra Multiplicador,
// Expiração, Limite (3 escopos), Cancelamento e Prioridade.

import {
  type GatilhoTipo, type MecanismoAtribuicao, type EixoTipo, type EstornoPolicy, type FaixaBeneficio,
} from "./regras";

export type CampStatus = "ativa" | "pausada" | "agendada" | "rascunho" | "encerrada" | "arquivada";

// Multiplicador — substitui a antiga tabela de Output. Base sempre em pontos;
// cada multiplicador que bater na transação multiplica o resultado (em cascata).
export type MultiplicadorTipo = "categoria" | "produto" | "segmento" | "tier";

export type Multiplicador = {
  id: string;
  tipo: MultiplicadorTipo;
  alvoId: string; // categoria (string) | conjunto de produtos | segmento | tier de membro
  fator: number;  // ex: 2 = dobro
};

export function novoIdMultiplicador(): string {
  return `MULT-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

// Expiração de pontos — só a configuração por enquanto (decisão explícita: o
// motor ainda não expira saldo de verdade, isso fica pra uma etapa futura).
export type ExpiracaoTipo = "nao_expira" | "dias_sem_movimentacao" | "data_fixa";

// Limite — substitui o antigo teto único. Recalculado a cada avaliação a
// partir do histórico de eventos do membro (mesmo padrão já usado pra Primeira
// compra/Marco de recorrência) — não depende de tag de origem na transação.
export type LimiteEscopo = "transacao" | "periodo" | "membro";
export type LimitePeriodoGranularidade = "dia" | "semana" | "mes";

export type Form = {
  nome: string;
  codigo: string;
  descricao: string;

  // Elegibilidade — "o quê" (gatilho derivado da entidade: produto/pedido/cliente)
  gatilhoTipo: GatilhoTipo;
  gatilhoConjuntoId: string;
  gatilhoClasseId: string;
  gatilhoMarcoN: number;
  gatilhoEventoNome: string;

  // Elegibilidade — "quem" gera vs. quem recebe (indicação/comissão)
  atribuicaoAtiva: boolean;
  papelGeradoraId: string;
  papelBeneficiariaId: string;
  mecanismoAtribuicao: MecanismoAtribuicao;
  percentualDivisao: number;

  // Elegibilidade — "quem" e "onde"
  conjuntoElegibilidadeId: string;
  produtoTiers: string[];
  valorMinimo: string;
  canais: string[];
  segmentos: string[];
  tiers: string[];
  papeis: string[];
  statusPedido: string[];

  // Elegibilidade — "quando"
  periodoInicio: string;
  periodoFim: string;

  // Multiplicador — pontos base + multiplicadores por categoria/produto/segmento/tier
  pontosBase: number;
  multiplicadores: Multiplicador[];

  // Expiração de pontos — quando o saldo gerado por esta campanha vence
  expiracaoTipo: ExpiracaoTipo;
  expiracaoDias: number;    // dias sem movimentação, quando expiracaoTipo === "dias_sem_movimentacao"
  expiracaoData: string;    // data fixa, quando expiracaoTipo === "data_fixa"

  // Limite — teto de acúmulo, com escopo configurável
  limiteAtivo: boolean;
  limiteEscopo: LimiteEscopo;
  limiteValor: number;
  limitePeriodoGranularidade: LimitePeriodoGranularidade; // usado quando limiteEscopo === "periodo"

  // Output antigo — mantido só pra compatibilidade de dado, não editado no wizard novo
  eixoTipo: EixoTipo;
  tabelaBeneficio: FaixaBeneficio[];

  // Políticas — Cancelamento ainda não migrado pro novo mecanismo
  timingTipo: "imediato" | "dias";
  timingDias: number;
  estornoPolicy: EstornoPolicy;
  conversaoParcialPermitida: boolean;
};

export const DEFAULTS: Form = {
  nome: "",
  codigo: "CAMP01",
  descricao: "",

  gatilhoTipo: "compra_qualquer",
  gatilhoConjuntoId: "",
  gatilhoClasseId: "",
  gatilhoMarcoN: 2,
  gatilhoEventoNome: "cadastro",

  atribuicaoAtiva: false,
  papelGeradoraId: "",
  papelBeneficiariaId: "",
  mecanismoAtribuicao: "mesma_pessoa",
  percentualDivisao: 100,

  conjuntoElegibilidadeId: "",
  produtoTiers: [],
  valorMinimo: "",
  canais: [],
  segmentos: [],
  tiers: [],
  papeis: [],
  statusPedido: ["Concluído"],

  periodoInicio: "",
  periodoFim: "",

  pontosBase: 0,
  multiplicadores: [],

  expiracaoTipo: "nao_expira",
  expiracaoDias: 365,
  expiracaoData: "",

  limiteAtivo: false,
  limiteEscopo: "transacao",
  limiteValor: 0,
  limitePeriodoGranularidade: "mes",

  eixoTipo: "valor_total",
  tabelaBeneficio: [],

  timingTipo: "imediato",
  timingDias: 7,
  estornoPolicy: "estornar_tudo",
  conversaoParcialPermitida: true,
};

export type Campanha = Form & {
  id: string;
  status: CampStatus;
  color: string;
  agendadaPara?: string;
};

// ── Persistência (localStorage — sem back-end neste protótipo) ───────────────
// Campanha não é forçada a vazio na Versão 1 — é um dos "outputs" do setup
// que o primeiro acesso deve mostrar depois de configurado.

const KEY = "motor_pontos_campanhas";

export function getCampanhas(): Campanha[] {
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return [];
    const parsed: Partial<Campanha>[] = JSON.parse(stored);
    // preenche campos que não existiam ainda quando a campanha foi salva (evita crash/tela em branco)
    return parsed.map((c) => ({ ...DEFAULTS, ...c }) as Campanha);
  } catch {
    return [];
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
