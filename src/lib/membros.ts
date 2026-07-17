import { getCampanhas } from "./campanhas";

// ── Fonte única de dados de membro — usada pela listagem e pelo detalhe ──────

export type Tier     = "Bronze" | "Prata" | "Ouro" | "Diamante";
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

// Evento bruto — o que a fonte reportou, ainda sem avaliação de campanha.
export type EventoBruto = {
  id: string; data: string; fonteId: string; fonte: string; evento: string; descricao: string;
  statusPedido: string; valorCompra: number;
};

// Evento já avaliado contra as campanhas ativas — usado pra exibição/diagnóstico.
export type EventoDiagnostico = EventoBruto & {
  resultado: "pontuado" | "rejeitado";
  motivo: string;
  campanhaNome?: string;
  pontosGerados?: number; moedaGerada?: string; abrevGerado?: string;
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
      { id: "EVT-101", data: "18/06/2025", fonteId: "pdv", fonte: "Loja física", evento: "order.confirmed", descricao: "Compra na loja — R$ 320,00", statusPedido: "Concluído", valorCompra: 320 },
      { id: "EVT-100", data: "16/06/2025", fonteId: "pdv", fonte: "Loja física", evento: "order.confirmed", descricao: "Compra na loja — R$ 45,00", statusPedido: "Em separação", valorCompra: 45 },
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
      { id: "EVT-201", data: "17/06/2025", fonteId: "portal", fonte: "App Mobile", evento: "order.confirmed", descricao: "Compra no app — R$ 210,00", statusPedido: "Entregue", valorCompra: 210 },
      { id: "EVT-200", data: "14/06/2025", fonteId: "portal", fonte: "App Mobile", evento: "order.confirmed", descricao: "Compra no app — R$ 50,00", statusPedido: "Em separação", valorCompra: 50 },
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
      { id: "EVT-301", data: "16/06/2025", fonteId: "portal", fonte: "App Mobile", evento: "order.confirmed", descricao: "Compra no app — R$ 88,00", statusPedido: "Concluído", valorCompra: 88 },
      { id: "EVT-300", data: "05/06/2025", fonteId: "portal", fonte: "App Mobile", evento: "order.confirmed", descricao: "Compra no app — R$ 40,00", statusPedido: "Em separação", valorCompra: 40 },
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
      { id: "EVT-401", data: "15/06/2025", fonteId: "pdv", fonte: "Dispositivo (PDV)", evento: "sale.completed", descricao: "Compra no PDV — R$ 45,00", statusPedido: "Concluído", valorCompra: 45 },
      { id: "EVT-400", data: "10/06/2025", fonteId: "pdv", fonte: "Dispositivo (PDV)", evento: "sale.completed", descricao: "Compra no PDV — R$ 20,00", statusPedido: "Em separação", valorCompra: 20 },
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

// ── Motor de acúmulo — avalia eventos brutos contra as campanhas ativas ──────

const ABREV_MOEDA: Record<string, string> = { Pontos: "pts", Cashback: "R$", Milhas: "mi", Créditos: "cr" };

function dataParaTimestamp(d: string): number {
  const [dia, mes, ano] = d.split("/").map(Number);
  return new Date(ano ?? 0, (mes ?? 1) - 1, dia ?? 1).getTime();
}

export function avaliarEventosMembro(membro: Membro): EventoDiagnostico[] {
  const agora = Date.now();
  const campanhasAtivas = getCampanhas().filter((c) => c.status === "ativa");

  return membro.eventos.map((ev) => {
    for (const c of campanhasAtivas) {
      if (c.periodoInicio && c.periodoFim) {
        const inicio = dataParaTimestamp(c.periodoInicio);
        const fim = dataParaTimestamp(c.periodoFim);
        if (agora < inicio || agora > fim) continue;
      }
      if (!c.fontes[ev.fonteId]) continue;
      if (c.segmento !== "todos" && c.segmento !== membro.segmento) continue;
      if (c.tiersElegiveis.length > 0 && !c.tiersElegiveis.includes(membro.tier.toLowerCase())) continue;
      if (!c.statusConceder[ev.statusPedido]) continue;

      const taxa = Number(c.taxaValor) || 0;
      const pontos = c.taxaTipo === "fixo" ? Math.round(taxa) : Math.round(ev.valorCompra * taxa);
      const abrev = ABREV_MOEDA[c.moedaCampanha] ?? "pts";
      return {
        ...ev,
        resultado: "pontuado" as const,
        motivo: `Elegível — campanha "${c.nome}" ativa · status "${ev.statusPedido}" concede pontos · taxa ${c.taxaTipo === "fixo" ? `${taxa} fixo` : `${taxa}pt/R$1`}`,
        campanhaNome: c.nome, pontosGerados: pontos, moedaGerada: c.moedaCampanha, abrevGerado: abrev,
      };
    }
    return {
      ...ev,
      resultado: "rejeitado" as const,
      motivo: `Nenhuma campanha ativa elegível para este evento — status "${ev.statusPedido}" não está entre os que concedem pontos em nenhuma campanha ativa (ou fonte/segmento/tier não batem).`,
    };
  });
}

export function creditarEventosAcumulo(membroId: string, resultados: EventoDiagnostico[]): void {
  for (const r of resultados) {
    if (r.resultado === "pontuado" && r.pontosGerados && r.moedaGerada) {
      registrarTransacaoSaldo(membroId, {
        moeda: r.moedaGerada, abrev: r.abrevGerado ?? "pts", delta: r.pontosGerados,
        descricao: r.descricao, tipo: "acumulo", refId: `EVT-${r.id}`,
      });
    }
  }
}

// Campanhas com gatilho por evento (não por pedido) — cadastro, aniversário, indicação, avaliação etc.
// Hoje só "cadastro" tem a origem do evento de fato conectada neste protótipo; os demais ficam
// configuráveis na campanha, mas ainda dependem de uma fonte de evento real (ex: data de aniversário,
// confirmação de indicação) que não existe ainda no cadastro do membro.
export function creditarBonusEventos(membro: Membro): void {
  const campanhas = getCampanhas().filter((c) => c.status === "ativa" && c.gatilhoTipo === "evento");
  for (const c of campanhas) {
    if (c.gatilhoEvento !== "cadastro") continue; // demais eventos: sem fonte real ainda, não credita
    const pontos = Number(c.taxaValor) || 0;
    if (pontos <= 0) continue;
    registrarTransacaoSaldo(membro.id, {
      moeda: c.moedaCampanha, abrev: ABREV_MOEDA[c.moedaCampanha] ?? "pts", delta: pontos,
      descricao: `Bônus de cadastro — campanha "${c.nome}"`, tipo: "acumulo",
      refId: `EVT-CADASTRO-${c.id}-${membro.id}`,
    });
  }
}
