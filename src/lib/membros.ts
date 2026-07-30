import { getCampanhas, type Multiplicador, type LimiteEscopo, type LimitePeriodoGranularidade } from "./campanhas";
import { getRegras, type RegraCampos } from "./regras";
import { getProdutos, type Produto } from "./produtos";
import { getTiersMembro } from "./tiers";
import { getPapeisMembro } from "./papeisMembro";
import { getConjuntosProdutos, type ConjuntoProdutos } from "./conjuntosProdutos";
import { getClassesProduto, type ClasseProduto } from "./classesProduto";
import { getSegmentosMembro } from "./segmentosMembro";
import { MOEDA } from "../config/programa";
import { ehV1 } from "./versao";

// ── Fonte única de dados de membro — usada pela listagem e pelo detalhe ──────

// Nome de um tier de membro — a lista real e editável vive em ./tiers (getTiersMembro).
export type Tier     = string;
export type Segmento = "Premium" | "Frete Grátis" | "Fidelidade" | "Básico" | string;
export type StatusMembro = "ativo" | "bloqueado";

export type SaldoCampanha = {
  campanhaId: string; campanhaNome: string; moeda: string; abrev: string; valor: number;
};

export type Transacao = {
  id: string; data: string; descricao: string;
  tipo: "acumulo" | "resgate" | "ajuste" | "expiracao";
  moeda: string; abrev: string;
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

// Produto dentro de um pedido — usado pelas Regras com gatilho/base por produto ou categoria.
export type ProdutoEvento = { produtoId: string; produtoNome: string; valor: number };

// Evento bruto — o que a fonte reportou, ainda sem avaliação de campanha.
export type EventoBruto = {
  id: string; data: string; fonteId: string; fonte: string; evento: string; descricao: string;
  statusPedido: string; valorCompra: number;
  produtos?: ProdutoEvento[];
  geradoPorMembroId?: string; // membro que gerou/indicou esta transação (Atribuição) — ex: o Arquiteto vinculado à venda
};

// Evento já avaliado contra as campanhas ativas — usado pra exibição/diagnóstico.
export type EventoDiagnostico = EventoBruto & {
  resultado: "pontuado" | "rejeitado";
  motivo: string;
  campanhaNome?: string;
  pontosGerados?: number; moedaGerada?: string; abrevGerado?: string;
  beneficiarioMembroId?: string; mecanismoAplicado?: string; percentualAplicado?: number;
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
  papel?: string; // Papel de membro (Biblioteca) — ex: Arquiteto. 4ª dimensão, independente de tier/segmento.
  status: StatusMembro;
  motivoBloqueio?: string;
  desde: string;
  saldos: SaldoCampanha[];
  expiram30d: number;
  transacoes: Transacao[];
  pedidos: PedidoResgate[];
  ajustes: AjusteManual[];
  eventos: EventoBruto[];
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
      { id: "t1", data: "18/06/2025", descricao: "Compra na loja — R$ 320,00", tipo: "acumulo", moeda: "Pontos", abrev: "pts", valor: 320, saldo: 5200 },
      { id: "t2", data: "15/06/2025", descricao: "Resgate — Cupom 10% desconto", tipo: "resgate", moeda: "Pontos", abrev: "pts", valor: -500, saldo: 4880 },
      { id: "t3", data: "10/06/2025", descricao: "Compra na loja — R$ 180,00", tipo: "acumulo", moeda: "Pontos", abrev: "pts", valor: 180, saldo: 5380 },
      { id: "t4", data: "05/06/2025", descricao: "Ajuste manual — Campanha Dia das Mães", tipo: "ajuste", moeda: "Pontos", abrev: "pts", valor: 200, saldo: 5200 },
      { id: "t5", data: "01/06/2025", descricao: "Compra na loja — R$ 560,00", tipo: "acumulo", moeda: "Pontos", abrev: "pts", valor: 560, saldo: 5000 },
      { id: "t6", data: "28/05/2025", descricao: "Expiração por inatividade", tipo: "expiracao", moeda: "Pontos", abrev: "pts", valor: -120, saldo: 4440 },
      { id: "t7", data: "22/05/2025", descricao: "Compra na loja — R$ 240,00", tipo: "acumulo", moeda: "Pontos", abrev: "pts", valor: 240, saldo: 4560 },
    ],
    pedidos: [
      { id: "PED-001", data: "15/06/2025", produto: "Cupom 10% desconto", status: "entregue", pontos: 500 },
      { id: "PED-002", data: "28/04/2025", produto: "Kit presente premium", status: "entregue", pontos: 1200 },
    ],
    ajustes: [
      { id: "AJ-001", data: "05/06/2025", operador: "Maria Admin", motivo: "Campanha Dia das Mães — bônus manual", valor: 200, saldoAntes: 5000 },
      { id: "AJ-002", data: "14/03/2025", operador: "João Ops", motivo: "Correção de transação duplicada", valor: -150, saldoAntes: 4200 },
    ],
    eventos: [
      { id: "EVT-101", data: "18/06/2025", fonteId: "pdv", fonte: "Loja física", evento: "order.confirmed", descricao: "Compra na loja — R$ 320,00", statusPedido: "Concluído", valorCompra: 320, produtos: [{ produtoId: "SKU-003", produtoNome: "Fone Bluetooth", valor: 320 }] },
      { id: "EVT-100", data: "16/06/2025", fonteId: "pdv", fonte: "Loja física", evento: "order.confirmed", descricao: "Compra na loja — R$ 45,00", statusPedido: "Em separação", valorCompra: 45, produtos: [{ produtoId: "SKU-004", produtoNome: "Kit Skincare", valor: 45 }] },
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
      { id: "t1", data: "17/06/2025", descricao: "Compra no app — R$ 210,00", tipo: "acumulo", moeda: "Pontos", abrev: "pts", valor: 263, saldo: 3200 },
      { id: "t2", data: "12/06/2025", descricao: "Resgate — Frete grátis", tipo: "resgate", moeda: "Pontos", abrev: "pts", valor: -300, saldo: 2937 },
      { id: "t3", data: "08/06/2025", descricao: "Compra no app — R$ 95,00", tipo: "acumulo", moeda: "Pontos", abrev: "pts", valor: 119, saldo: 3237 },
      { id: "t4", data: "03/06/2025", descricao: "Ajuste manual — Erro de processamento", tipo: "ajuste", moeda: "Pontos", abrev: "pts", valor: 150, saldo: 3118 },
      { id: "t5", data: "25/05/2025", descricao: "Compra no app — R$ 420,00", tipo: "acumulo", moeda: "Pontos", abrev: "pts", valor: 525, saldo: 2968 },
    ],
    pedidos: [
      { id: "PED-003", data: "12/06/2025", produto: "Frete grátis (voucher)", status: "processando", pontos: 300 },
    ],
    ajustes: [
      { id: "AJ-003", data: "03/06/2025", operador: "Maria Admin", motivo: "Erro de processamento — reembolso em pontos", valor: 150, saldoAntes: 2968 },
    ],
    eventos: [
      { id: "EVT-201", data: "17/06/2025", fonteId: "portal", fonte: "App Mobile", evento: "order.confirmed", descricao: "Compra no app — R$ 210,00", statusPedido: "Entregue", valorCompra: 210, produtos: [{ produtoId: "SKU-002", produtoNome: "Air Fryer XL", valor: 210 }] },
      { id: "EVT-200", data: "14/06/2025", fonteId: "portal", fonte: "App Mobile", evento: "order.confirmed", descricao: "Compra no app — R$ 50,00", statusPedido: "Em separação", valorCompra: 50, produtos: [{ produtoId: "SKU-007", produtoNome: "Mochila Executiva", valor: 50 }] },
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
      { id: "t1", data: "16/06/2025", descricao: "Compra no app — R$ 88,00", tipo: "acumulo", moeda: "Milhas", abrev: "mi", valor: 110, saldo: 1800 },
      { id: "t2", data: "10/06/2025", descricao: "Expiração de saldo inativo", tipo: "expiracao", moeda: "Milhas", abrev: "mi", valor: -240, saldo: 1690 },
      { id: "t3", data: "02/06/2025", descricao: "Compra no app — R$ 130,00", tipo: "acumulo", moeda: "Milhas", abrev: "mi", valor: 163, saldo: 1930 },
    ],
    pedidos: [],
    ajustes: [],
    eventos: [
      { id: "EVT-301", data: "16/06/2025", fonteId: "portal", fonte: "App Mobile", evento: "order.confirmed", descricao: "Compra no app — R$ 88,00", statusPedido: "Concluído", valorCompra: 88, produtos: [{ produtoId: "SKU-005", produtoNome: "Tênis Running", valor: 88 }] },
      { id: "EVT-300", data: "05/06/2025", fonteId: "portal", fonte: "App Mobile", evento: "order.confirmed", descricao: "Compra no app — R$ 40,00", statusPedido: "Em separação", valorCompra: 40, produtos: [{ produtoId: "SKU-008", produtoNome: "Livro de Receitas", valor: 40 }] },
    ],
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
      { id: "t1", data: "15/06/2025", descricao: "Compra no PDV — R$ 45,00", tipo: "acumulo", moeda: "Pontos", abrev: "pts", valor: 45, saldo: 760 },
      { id: "t2", data: "08/06/2025", descricao: "Compra no PDV — R$ 120,00", tipo: "acumulo", moeda: "Pontos", abrev: "pts", valor: 120, saldo: 715 },
      { id: "t3", data: "01/06/2025", descricao: "Compra no PDV — R$ 75,00", tipo: "acumulo", moeda: "Pontos", abrev: "pts", valor: 75, saldo: 595 },
    ],
    pedidos: [],
    ajustes: [],
    eventos: [
      { id: "EVT-401", data: "15/06/2025", fonteId: "pdv", fonte: "Dispositivo (PDV)", evento: "sale.completed", descricao: "Compra no PDV — R$ 45,00", statusPedido: "Concluído", valorCompra: 45, produtos: [{ produtoId: "SKU-006", produtoNome: "Cafeteira Premium", valor: 45 }] },
      { id: "EVT-400", data: "10/06/2025", fonteId: "pdv", fonte: "Dispositivo (PDV)", evento: "sale.completed", descricao: "Compra no PDV — R$ 20,00", statusPedido: "Em separação", valorCompra: 20, produtos: [{ produtoId: "SKU-004", produtoNome: "Kit Skincare", valor: 20 }] },
    ],
  },
  {
    id: "5", nome: "Eduardo F.", initials: "EF",
    cpf: "", email: "", telefone: "", canal: "App",
    tier: "Bronze", segmento: "Básico", status: "ativo", desde: "08/07/2026",
    saldos: [], expiram30d: 0, transacoes: [], pedidos: [], ajustes: [], eventos: [],
  },
  {
    id: "6", nome: "Fernanda L.", initials: "FL",
    cpf: "", email: "", telefone: "", canal: "App",
    tier: "Bronze", segmento: "Básico", status: "ativo", desde: "10/07/2026",
    saldos: [], expiram30d: 0, transacoes: [], pedidos: [], ajustes: [], eventos: [],
  },
  {
    id: "7", nome: "Gustavo M.", initials: "GM",
    cpf: "", email: "", telefone: "", canal: "App",
    tier: "Bronze", segmento: "Fidelidade", status: "bloqueado", desde: "14/07/2026",
    motivoBloqueio: "Padrão de acúmulo atípico identificado — aguardando validação de identidade.",
    saldos: [], expiram30d: 0, transacoes: [], pedidos: [], ajustes: [], eventos: [],
  },
];

// ── Persistência (localStorage — sem back-end neste protótipo) ───────────────

const KEY = "motor_pontos_membros";

export function getMembros(): Membro[] {
  if (ehV1()) return [];
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return SEED;
    const parsed: Partial<Membro>[] = JSON.parse(stored);
    // preenche campos que não existiam ainda quando o dado foi salvo (evita tela em branco por dado antigo)
    return parsed.map((m) => {
      const membro = { saldos: [], transacoes: [], pedidos: [], ajustes: [], eventos: [], ...m } as Membro;
      // migra status antigos ("pendente"/"recusado") — modelo atual não tem mais gate de aprovação de cadastro
      if (membro.status !== "ativo" && membro.status !== "bloqueado") membro.status = "ativo";
      return membro;
    });
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

// ── Ledger — todo débito/crédito de saldo (resgate, ajuste, estorno) passa por aqui ──

export function registrarTransacaoSaldo(
  membroId: string,
  args: { moeda: string; abrev: string; delta: number; descricao: string; tipo: Transacao["tipo"]; refId?: string }
): void {
  const membros = getMembros();
  const idx = membros.findIndex((m) => m.id === membroId);
  if (idx === -1) return;
  const m = membros[idx];

  // idempotência: evita débito duplicado quando a mesma origem (ex: aprovação automática) roda de novo
  if (args.refId && m.transacoes.some((t) => t.id === args.refId)) return;

  const saldos = [...m.saldos];
  const sIdx = saldos.findIndex((s) => s.moeda === args.moeda);
  if (sIdx === -1) {
    saldos.push({ campanhaId: "AJUSTES", campanhaNome: "Ajustes e resgates", moeda: args.moeda, abrev: args.abrev, valor: Math.max(0, args.delta) });
  } else {
    saldos[sIdx] = { ...saldos[sIdx], valor: Math.max(0, saldos[sIdx].valor + args.delta) };
  }
  const saldoMoeda = saldos.filter((s) => s.moeda === args.moeda).reduce((a, s) => a + s.valor, 0);

  const transacao: Transacao = {
    id: args.refId ?? `TRX-${m.id}-${m.transacoes.length + 1}`,
    data: new Date().toLocaleDateString("pt-BR"),
    descricao: args.descricao,
    tipo: args.tipo,
    moeda: args.moeda,
    abrev: args.abrev,
    valor: args.delta,
    saldo: saldoMoeda,
  };

  const next = [...membros];
  next[idx] = { ...m, saldos, transacoes: [transacao, ...m.transacoes] };
  saveMembros(next);
}

// ── Motor de acúmulo — avalia eventos brutos contra as Regras ativas ────────
// Regra permanente (Mecânica) e Campanha (Regra + período) usam a mesma
// estrutura de 8 blocos — Identidade, Gatilho, Atribuição, Elegibilidade,
// Output, Fonte da classe, Políticas, Revisão. A única diferença é que
// campanha só entra na avaliação dentro do seu período.

const ABREV_MOEDA: Record<string, string> = { Pontos: "pts", Cashback: "R$", Milhas: "mi", Créditos: "cr" };

function dataParaTimestamp(d: string): number {
  const [dia, mes, ano] = d.split("/").map(Number);
  return new Date(ano ?? 0, (mes ?? 1) - 1, dia ?? 1).getTime();
}

type RegraEfetiva = {
  origem: "Mecânica" | "Campanha"; id: string; nome: string; campos: RegraCampos;
  // Só existe pra origem "Campanha" — Multiplicador substitui a tabela de Output,
  // e Limite (3 escopos) substitui o antigo teto único.
  pontosBase?: number; multiplicadores?: Multiplicador[];
  limiteAtivo?: boolean; limiteEscopo?: LimiteEscopo; limiteValor?: number; limitePeriodoGranularidade?: LimitePeriodoGranularidade;
};

function regrasEfetivasAtivas(): RegraEfetiva[] {
  const agora = Date.now();
  const regras = getRegras();
  const permanentes: RegraEfetiva[] = regras
    .filter((r) => r.ativa)
    .map((r) => ({ origem: "Mecânica" as const, id: r.id, nome: r.nome, campos: r }));

  // Campanha é autossuficiente — define sua própria Elegibilidade, sem referenciar Regra.
  // categoriaRegra/modulo não existem na Campanha (são só Identidade da Mecânica, não
  // usados em nenhum cálculo) — preenchidos com valor neutro só pra bater o tipo.
  const campanhas: RegraEfetiva[] = getCampanhas()
    .filter((c) => {
      if (c.status !== "ativa" || !c.periodoInicio || !c.periodoFim) return false;
      const inicio = dataParaTimestamp(c.periodoInicio);
      const fim = dataParaTimestamp(c.periodoFim);
      return agora >= inicio && agora <= fim;
    })
    .map((c) => ({
      origem: "Campanha" as const, id: c.id, nome: c.nome,
      campos: { ...c, categoriaRegra: "Acúmulo", modulo: "Vendas", tetoAtivo: false, tetoValor: 0 } as RegraCampos,
      pontosBase: c.pontosBase, multiplicadores: c.multiplicadores,
      limiteAtivo: c.limiteAtivo, limiteEscopo: c.limiteEscopo, limiteValor: c.limiteValor, limitePeriodoGranularidade: c.limitePeriodoGranularidade,
    }));

  return [...permanentes, ...campanhas];
}

// Multiplicador — pontos base × fatores que baterem na transação/membro (em cascata).
function contribuicaoMultiplicador(
  base: number, multiplicadores: Multiplicador[], ev: EventoBruto, membro: Membro, catalogo: Produto[], conjuntos: ConjuntoProdutos[]
): number {
  const produtosEvento = ev.produtos ?? [];
  let fator = 1;
  for (const m of multiplicadores) {
    let bate = false;
    switch (m.tipo) {
      case "categoria":
        bate = produtosEvento.some((p) => catalogo.find((c) => c.id === p.produtoId)?.categoria === m.alvoId);
        break;
      case "produto": {
        const conjunto = conjuntos.find((c) => c.id === m.alvoId);
        bate = conjunto ? produtosEvento.some((p) => conjunto.produtosIds.includes(p.produtoId)) : false;
        break;
      }
      case "segmento":
        bate = membro.segmento === getSegmentosMembro().find((s) => s.id === m.alvoId)?.nome;
        break;
      case "tier":
        bate = membro.tier === getTiersMembro().find((t) => t.id === m.alvoId)?.nome;
        break;
    }
    if (bate) fator *= m.fator;
  }
  return base * fator;
}

// Chave de agrupamento pro Limite com escopo "período" — reseta o teto por dia/semana/mês.
function periodoChave(granularidade: LimitePeriodoGranularidade, ts: number): string {
  const d = new Date(ts);
  if (granularidade === "dia") return d.toISOString().slice(0, 10);
  if (granularidade === "mes") return `${d.getFullYear()}-${d.getMonth()}`;
  const inicioAno = new Date(d.getFullYear(), 0, 1).getTime();
  const semana = Math.floor((ts - inicioAno) / (7 * 24 * 60 * 60 * 1000));
  return `${d.getFullYear()}-S${semana}`;
}

// Eventos não-transacionais não contam como "compra" pra Primeira compra/Marco de recorrência.
const EVENTOS_NAO_TRANSACIONAIS = ["cadastro", "indicacao", "avaliacao"];

function numerarEventosPorOrdem(eventos: EventoBruto[]): Map<string, number> {
  const compras = eventos.filter((ev) => !EVENTOS_NAO_TRANSACIONAIS.includes(ev.evento));
  const ordenados = [...compras].sort((a, b) => dataParaTimestamp(a.data) - dataParaTimestamp(b.data));
  const map = new Map<string, number>();
  ordenados.forEach((ev, i) => map.set(ev.id, i + 1));
  return map;
}

function classeIdDoProduto(produtoId: string, catalogo: Produto[], classes: ClasseProduto[]): string | undefined {
  const produto = catalogo.find((p) => p.id === produtoId);
  if (!produto) return undefined;
  return classes.find((c) => c.nome === produto.categoria)?.id;
}

function gatilhoBate(
  campos: RegraCampos, ev: EventoBruto, numeroCompra: number,
  catalogo: Produto[], conjuntos: ConjuntoProdutos[], classes: ClasseProduto[]
): boolean {
  const produtosEvento = ev.produtos ?? [];
  switch (campos.gatilhoTipo) {
    case "compra_qualquer": return true;
    case "compra_conjunto": {
      const conjunto = conjuntos.find((c) => c.id === campos.gatilhoConjuntoId);
      return conjunto ? produtosEvento.some((p) => conjunto.produtosIds.includes(p.produtoId)) : false;
    }
    case "compra_classe":
      return produtosEvento.some((p) => classeIdDoProduto(p.produtoId, catalogo, classes) === campos.gatilhoClasseId);
    case "primeira_compra":         return numeroCompra === 1;
    case "marco_recorrencia":       return numeroCompra === campos.gatilhoMarcoN;
    case "evento_nao_transacional": return ev.evento === campos.gatilhoEventoNome;
  }
}

// Status que representam cancelamento/devolução do pedido — sempre deixados passar pela
// Elegibilidade (mesmo fora da whitelist de statusPedido) pra que o Cancelamento/estorno
// decida o que fazer, em vez de o evento simplesmente nunca mais bater.
const STATUS_CANCELAMENTO = ["Cancelado", "Devolvido", "Recusado"];

function elegibilidadeBate(
  campos: RegraCampos, ev: EventoBruto, membro: Membro, conjuntos: ConjuntoProdutos[], catalogo: Produto[]
): boolean {
  // Indicação cancelada — se o membro indicado foi bloqueado (fraude), a indicação
  // deixa de bater e o bônus já creditado a quem indicou é estornado automaticamente.
  if (ev.evento === "indicacao" && membro.status === "bloqueado") return false;
  if (campos.valorMinimo && ev.valorCompra < Number(campos.valorMinimo)) return false;
  if (campos.conjuntoElegibilidadeId) {
    const conjunto = conjuntos.find((c) => c.id === campos.conjuntoElegibilidadeId);
    const produtosEvento = ev.produtos ?? [];
    if (!conjunto || !produtosEvento.some((p) => conjunto.produtosIds.includes(p.produtoId))) return false;
  }
  if (campos.produtoTiers.length > 0) {
    const produtosEvento = ev.produtos ?? [];
    const bate = produtosEvento.some((p) => {
      const produto = catalogo.find((c) => c.id === p.produtoId);
      return produto?.tierProdutoId ? campos.produtoTiers.includes(produto.tierProdutoId) : false;
    });
    if (!bate) return false;
  }
  if (campos.canais.length > 0 && !campos.canais.includes(ev.fonteId)) return false;
  if (campos.segmentos.length > 0) {
    const segmentosMembro = getSegmentosMembro();
    const nomes = campos.segmentos.map((id) => segmentosMembro.find((s) => s.id === id)?.nome);
    if (!nomes.includes(membro.segmento)) return false;
  }
  if (campos.tiers.length > 0) {
    const tiersMembro = getTiersMembro();
    const nomes = campos.tiers.map((id) => tiersMembro.find((t) => t.id === id)?.nome);
    if (!nomes.includes(membro.tier)) return false;
  }
  if (campos.papeis.length > 0) {
    const papeisLib = getPapeisMembro();
    const nomes = campos.papeis.map((id) => papeisLib.find((p) => p.id === id)?.nome);
    if (!membro.papel || !nomes.includes(membro.papel)) return false;
  }
  if (campos.statusPedido.length > 0 && !STATUS_CANCELAMENTO.includes(ev.statusPedido) && !campos.statusPedido.includes(ev.statusPedido)) return false;
  return true;
}

function valorEixo(
  campos: RegraCampos, ev: EventoBruto, catalogo: Produto[], conjuntos: ConjuntoProdutos[], classes: ClasseProduto[]
): number {
  const produtosEvento = ev.produtos ?? [];
  switch (campos.eixoTipo) {
    case "valor_total": return ev.valorCompra;
    case "valor_linha": {
      if (campos.gatilhoTipo === "compra_conjunto") {
        const conjunto = conjuntos.find((c) => c.id === campos.gatilhoConjuntoId);
        if (conjunto) return produtosEvento.filter((p) => conjunto.produtosIds.includes(p.produtoId)).reduce((a, p) => a + p.valor, 0);
      }
      if (campos.gatilhoTipo === "compra_classe") {
        return produtosEvento
          .filter((p) => classeIdDoProduto(p.produtoId, catalogo, classes) === campos.gatilhoClasseId)
          .reduce((a, p) => a + p.valor, 0);
      }
      return produtosEvento.reduce((a, p) => a + p.valor, 0) || ev.valorCompra;
    }
    case "quantidade": return produtosEvento.length || 1;
    case "flat": return 1;
  }
}

// Tabela de benefício — encontra a faixa que contém o valor do eixo e aplica.
function contribuicaoTabela(campos: RegraCampos, eixoValor: number): number {
  const faixa = campos.tabelaBeneficio.find((f) => eixoValor >= f.de && (f.ate === null || eixoValor <= f.ate));
  if (!faixa) return 0;
  return campos.eixoTipo === "flat" ? faixa.valor : eixoValor * faixa.valor;
}

export function avaliarEventosMembro(membro: Membro): EventoDiagnostico[] {
  const regras = regrasEfetivasAtivas();
  const catalogo = getProdutos();
  const conjuntos = getConjuntosProdutos();
  const classes = getClassesProduto();
  const numeroPorEvento = numerarEventosPorOrdem(membro.eventos);

  // Teto de emissão (Mecânica, legado) — soma dentro deste lote de avaliação.
  const acumuladoPorRegra = new Map<string, number>();
  // Limite (Campanha, 3 escopos) — recalcula a partir do histórico completo de eventos
  // do membro a cada avaliação, igual já se faz pra Primeira compra/Marco de recorrência.
  const acumuladoPorLimite = new Map<string, number>();

  return membro.eventos.map((ev) => {
    const numeroCompra = numeroPorEvento.get(ev.id) ?? 1;
    const matches = regras.filter((r) =>
      gatilhoBate(r.campos, ev, numeroCompra, catalogo, conjuntos, classes) &&
      elegibilidadeBate(r.campos, ev, membro, conjuntos, catalogo)
    );

    if (matches.length === 0) {
      return {
        ...ev,
        resultado: "rejeitado" as const,
        motivo: "Nenhuma regra ativa (Mecânica ou campanha) bate com este evento — confira gatilho, elegibilidade ou vigência.",
      };
    }

    let pontosFinal = 0;
    let beneficiarioMembroId: string | undefined;
    let mecanismoAplicado: string | undefined;
    let percentualAplicado: number | undefined;
    const detalhes: string[] = [];

    for (const r of matches) {
      let pontos: number;
      if (r.origem === "Campanha" && r.multiplicadores !== undefined) {
        pontos = contribuicaoMultiplicador(r.pontosBase ?? 0, r.multiplicadores, ev, membro, catalogo, conjuntos);
      } else {
        const eixoValor = valorEixo(r.campos, ev, catalogo, conjuntos, classes);
        pontos = contribuicaoTabela(r.campos, eixoValor);
      }

      // Cancelamento/estorno — "estornar_tudo" zera; "manter" e "estornar_proporcional"
      // seguem recalculando normalmente contra os dados atuais do evento (ex: valor já
      // reduzido por devolução parcial já gera o proporcional sem lógica extra).
      if (STATUS_CANCELAMENTO.includes(ev.statusPedido) && r.campos.estornoPolicy === "estornar_tudo") {
        pontos = 0;
      }

      if (r.campos.tetoAtivo) {
        const jaAcumulado = acumuladoPorRegra.get(r.id) ?? 0;
        const restante = Math.max(0, r.campos.tetoValor - jaAcumulado);
        pontos = Math.min(pontos, restante);
        acumuladoPorRegra.set(r.id, jaAcumulado + pontos);
      }

      if (r.limiteAtivo && r.limiteValor !== undefined) {
        const chave = r.limiteEscopo === "transacao" ? `${r.id}-${ev.id}`
          : r.limiteEscopo === "periodo" ? `${r.id}-${periodoChave(r.limitePeriodoGranularidade ?? "mes", dataParaTimestamp(ev.data))}`
          : r.id; // "membro" — vitalício
        const jaAcumulado = acumuladoPorLimite.get(chave) ?? 0;
        const restante = Math.max(0, r.limiteValor - jaAcumulado);
        pontos = Math.min(pontos, restante);
        acumuladoPorLimite.set(chave, jaAcumulado + pontos);
      }

      pontosFinal += pontos;
      detalhes.push(`${r.nome} (${r.origem}) — +${Math.floor(pontos)}pt`);

      if (r.campos.atribuicaoAtiva && ev.geradoPorMembroId) {
        beneficiarioMembroId = ev.geradoPorMembroId;
        mecanismoAplicado = r.campos.mecanismoAtribuicao;
        percentualAplicado = r.campos.percentualDivisao;
      }
    }

    pontosFinal = Math.floor(pontosFinal);
    const moeda = MOEDA.nome;
    const abrev = ABREV_MOEDA[moeda] ?? MOEDA.abrev;

    if (pontosFinal <= 0) {
      return {
        ...ev,
        resultado: "rejeitado" as const,
        motivo: `Regra(s) bateram mas geraram 0 ponto (confira a tabela de benefício ou o teto) — ${detalhes.join(", ")}`,
      };
    }

    return {
      ...ev,
      resultado: "pontuado" as const,
      motivo: `${detalhes.join(" · ")}${beneficiarioMembroId ? ` · atribuído (${mecanismoAplicado})` : ""}`,
      campanhaNome: matches.find((m) => m.origem === "Campanha")?.nome,
      pontosGerados: pontosFinal, moedaGerada: moeda, abrevGerado: abrev,
      beneficiarioMembroId, mecanismoAplicado, percentualAplicado,
    };
  });
}

// Credita a diferença pra cima (primeira vez) ou estorna a diferença pra baixo (evento
// recalculado — ex: pedido cancelado) — idempotente por refId, igual ao resto do ledger.
function creditarOuEstornar(membroId: string, refId: string, pontosDevidos: number, moeda: string, abrev: string, descricao: string) {
  const transacoes = getMembros().find((m) => m.id === membroId)?.transacoes ?? [];
  const original = transacoes.find((t) => t.id === refId);

  // Primeira vez pra este refId — crédito normal, na chave original.
  if (!original) {
    if (pontosDevidos > 0) {
      registrarTransacaoSaldo(membroId, { moeda, abrev, delta: pontosDevidos, descricao, tipo: "acumulo", refId });
    }
    return;
  }

  // Já creditado antes — qualquer diferença vira ajuste numa chave própria (nunca reusa
  // o refId original, que já está com idempotência travada pela primeira escrita).
  const diferenca = pontosDevidos - original.valor;
  if (diferenca !== 0) {
    registrarTransacaoSaldo(membroId, {
      moeda, abrev, delta: diferenca,
      descricao: diferenca < 0 ? `${descricao} (estorno)` : `${descricao} (ajuste)`,
      tipo: "ajuste", refId: `${refId}-AJ`,
    });
  }
}

export function creditarEventosAcumulo(membroId: string, resultados: EventoDiagnostico[]): void {
  for (const r of resultados) {
    const pontosDevidos = r.resultado === "pontuado" ? (r.pontosGerados ?? 0) : 0;
    const moeda = r.moedaGerada ?? MOEDA.nome;
    const abrev = r.abrevGerado ?? ABREV_MOEDA[moeda] ?? "pts";

    // Sem atribuição — credita/estorna normalmente pro membro que gerou o evento.
    if (!r.beneficiarioMembroId || r.beneficiarioMembroId === membroId) {
      creditarOuEstornar(membroId, `EVT-${r.id}`, pontosDevidos, moeda, abrev, r.descricao);
      continue;
    }

    // Atribuição ativa — redireciona (ou divide) o crédito/estorno pra geradora/beneficiária.
    if (r.mecanismoAplicado === "dividido" && r.percentualAplicado !== undefined) {
      const paraBeneficiaria = Math.floor(pontosDevidos * (r.percentualAplicado / 100));
      const paraTransactor = pontosDevidos - paraBeneficiaria;
      creditarOuEstornar(r.beneficiarioMembroId, `EVT-${r.id}-GERADORA`, paraBeneficiaria, moeda, abrev, `${r.descricao} (atribuição — parte da geradora)`);
      creditarOuEstornar(membroId, `EVT-${r.id}-TRANSACTOR`, paraTransactor, moeda, abrev, `${r.descricao} (atribuição — parte de quem comprou)`);
    } else {
      creditarOuEstornar(r.beneficiarioMembroId, `EVT-${r.id}-GERADORA`, pontosDevidos, moeda, abrev, `${r.descricao} (atribuição — geradora)`);
    }
  }

  // Indicação cancelada — se ESTE membro foi bloqueado (fraude), estorna o bônus que ele
  // gerou pra quem o indicou. Vínculo fixo do evento, independente de regra/campanha —
  // por isso não passa pelo pipeline de avaliarEventosMembro acima.
  const membro = getMembros().find((m) => m.id === membroId);
  if (membro?.status === "bloqueado") {
    for (const ev of membro.eventos) {
      if (ev.evento !== "indicacao" || !ev.geradoPorMembroId) continue;
      const moeda = MOEDA.nome;
      const abrev = ABREV_MOEDA[moeda] ?? MOEDA.abrev;
      creditarOuEstornar(ev.geradoPorMembroId, `EVT-${ev.id}-GERADORA`, 0, moeda, abrev, `${ev.descricao} (indicado bloqueado)`);
      creditarOuEstornar(membroId, `EVT-${ev.id}-TRANSACTOR`, 0, moeda, abrev, `${ev.descricao} (indicado bloqueado)`);
    }
  }
}

// Eventos "cadastro"/"indicacao" (gerados no momento do cadastro do membro, ver
// components/CadastroBase.tsx) entram em membro.eventos e passam pelo mesmo
// pipeline de avaliarEventosMembro/creditarEventosAcumulo abaixo — Elegibilidade,
// Atribuição e Políticas valem pra eles igual valem pra compra.
