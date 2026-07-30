// ── Regra — modelo único compartilhado entre Mecânica (permanente, sem data)
// e Campanha (mesma estrutura + período). 8 blocos: Identidade, Gatilho,
// Atribuição, Elegibilidade, Output, Fonte da classe, Políticas, Revisão.
// A única coisa que distingue uma campanha de uma regra permanente é a
// janela de datas.

// ── 1. Identidade ────────────────────────────────────────────────────────────

export const CATEGORIA_REGRA_OPCOES = ["Acúmulo", "Bônus", "Indicação/Comissão", "Boas-vindas"] as const;
export type CategoriaRegra = typeof CATEGORIA_REGRA_OPCOES[number];

export const MODULO_OPCOES = ["Vendas", "Cadastro", "Indicação", "Fidelização"] as const;
export type Modulo = typeof MODULO_OPCOES[number];

// ── 2. Gatilho ───────────────────────────────────────────────────────────────

export type GatilhoTipo =
  | "compra_qualquer"
  | "compra_conjunto"          // referencia um Conjunto de produtos (Biblioteca)
  | "compra_classe"            // referencia uma Classe de produto (Biblioteca)
  | "primeira_compra"
  | "marco_recorrencia"
  | "evento_nao_transacional";

export const GATILHO_LABEL: Record<GatilhoTipo, string> = {
  compra_qualquer:          "Compra concluída (qualquer)",
  compra_conjunto:          "Compra contendo produto de um Conjunto",
  compra_classe:            "Compra contendo produto de uma Classe",
  primeira_compra:          "Primeira compra",
  marco_recorrencia:        "Marco de recorrência (Nª compra)",
  evento_nao_transacional:  "Evento não-transacional",
};

export const GATILHO_DESC: Record<GatilhoTipo, string> = {
  compra_qualquer:          "Qualquer compra concluída dispara a avaliação.",
  compra_conjunto:          "Só dispara quando a compra contém um produto do Conjunto selecionado (Biblioteca).",
  compra_classe:            "Só dispara quando a compra contém um produto da Classe selecionada (Biblioteca).",
  primeira_compra:          "Dispara apenas na primeira compra do membro.",
  marco_recorrencia:        "Dispara quando a compra é a Nª compra do membro — estrutural, não é sazonal.",
  evento_nao_transacional:  "Dispara por um evento que não é uma compra — cadastro, indicação, avaliação…",
};

// Gatilhos transacionais são os que dependem de uma compra (envolvem produto/classe/conjunto).
export function gatilhoEhTransacional(tipo: GatilhoTipo): boolean {
  return tipo !== "evento_nao_transacional";
}

// ── 3. Atribuição ────────────────────────────────────────────────────────────

export type MecanismoAtribuicao = "mesma_pessoa" | "direto" | "dividido";

export const MECANISMO_LABEL: Record<MecanismoAtribuicao, string> = {
  mesma_pessoa: "Geradora e beneficiária são a mesma pessoa",
  direto:       "100% para a beneficiária",
  dividido:     "Dividido entre geradora e beneficiária",
};

// ── 4/5. Elegibilidade / Output ──────────────────────────────────────────────

export type EixoTipo = "valor_total" | "valor_linha" | "quantidade" | "flat";

export const EIXO_LABEL: Record<EixoTipo, string> = {
  valor_total:  "Valor total da compra (R$)",
  valor_linha:  "Valor da linha do produto/classe elegível (R$)",
  quantidade:   "Quantidade (unidades ou nº de itens)",
  flat:         "Flat (independe de valor)",
};

export type FaixaBeneficio = {
  id: string;
  de: number;          // início da faixa, no eixo escolhido
  ate: number | null;  // fim da faixa — null = sem teto superior
  valor: number;        // pontos por unidade do eixo dentro dessa faixa (ou pontos fixos, se eixo = flat)
};

export const CANAIS = [
  { id: "portal",      nome: "Portal / App" },
  { id: "pdv",         nome: "PDV (loja física)" },
  { id: "ecommerce",   nome: "E-commerce" },
  { id: "marketplace", nome: "Marketplace" },
];

export const STATUS_PEDIDO = ["Aprovado", "Faturado", "Em separação", "Entregue", "Concluído", "Cancelado", "Devolvido", "Recusado"];

// ── 7. Políticas ─────────────────────────────────────────────────────────────

export type EstornoPolicy = "estornar_tudo" | "estornar_proporcional" | "manter";

export const ESTORNO_LABEL: Record<EstornoPolicy, string> = {
  estornar_tudo:         "Estornar todos os pontos",
  estornar_proporcional: "Estorno proporcional ao valor cancelado",
  manter:                "Manter os pontos",
};

// ── Regra ────────────────────────────────────────────────────────────────────

export type Regra = {
  id: string;
  ativa: boolean;

  // 1. Identidade
  nome: string;
  categoriaRegra: CategoriaRegra;
  modulo: Modulo;

  // 2. Gatilho
  gatilhoTipo: GatilhoTipo;
  gatilhoConjuntoId: string;   // gatilhoTipo === "compra_conjunto"
  gatilhoClasseId: string;     // gatilhoTipo === "compra_classe"
  gatilhoMarcoN: number;       // gatilhoTipo === "marco_recorrencia"
  gatilhoEventoNome: string;   // gatilhoTipo === "evento_nao_transacional"

  // 3. Atribuição (opcional)
  atribuicaoAtiva: boolean;
  papelGeradoraId: string;
  papelBeneficiariaId: string;
  mecanismoAtribuicao: MecanismoAtribuicao;
  percentualDivisao: number;   // usado quando mecanismoAtribuicao === "dividido" — % pra beneficiária

  // 4. Elegibilidade
  conjuntoElegibilidadeId: string; // produto ∈ conjunto (pode ser diferente do conjunto do Gatilho)
  produtoTiers: string[];          // Tier de produto (Biblioteca) — ex: só produtos Ouro
  valorMinimo: string;
  canais: string[];
  segmentos: string[];
  tiers: string[];
  papeis: string[];
  statusPedido: string[];

  // 5. Output
  eixoTipo: EixoTipo;
  tabelaBeneficio: FaixaBeneficio[];

  // 7. Políticas
  timingTipo: "imediato" | "dias";
  timingDias: number;
  estornoPolicy: EstornoPolicy;
  conversaoParcialPermitida: boolean;
  tetoAtivo: boolean;
  tetoValor: number;
};

// Campos compartilhados por Mecânica (Regra permanente) e Campanha (Regra + período)
export type RegraCampos = Omit<Regra, "id" | "ativa">;

export const DEFAULTS_REGRA: Omit<Regra, "id" | "ativa"> = {
  nome: "",
  categoriaRegra: "Acúmulo",
  modulo: "Vendas",

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

  eixoTipo: "valor_total",
  tabelaBeneficio: [],

  timingTipo: "imediato",
  timingDias: 7,
  estornoPolicy: "estornar_tudo",
  conversaoParcialPermitida: true,
  tetoAtivo: false,
  tetoValor: 0,
};

const KEY = "motor_pontos_regras";

export function getRegras(): Regra[] {
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return [];
    const parsed: Partial<Regra>[] = JSON.parse(stored);
    return parsed.map((r) => ({ ...DEFAULTS_REGRA, ...r }) as Regra);
  } catch {
    return [];
  }
}

export function saveRegras(regras: Regra[]) {
  localStorage.setItem(KEY, JSON.stringify(regras));
}

export function novoIdRegra(): string {
  return `REGRA-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function novoIdFaixa(): string {
  return `FAIXA-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
