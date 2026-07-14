import { useMemo, useState } from "react";
import { Input, SearchInput, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@kruzer/ds";
import { MOEDA } from "../../config/programa";

// ── Types ─────────────────────────────────────────────────────────────────────

type TipoTx = "acumulo" | "resgate" | "ajuste" | "expiracao" | "estorno";

type Transacao = {
  id: string;
  data: string;
  descricao: string;
  tipo: TipoTx;
  valor: number;
  bonus: number;
  saldo: number;
  campanha: string | null;
  pedido: string | null;
  produto: string | null;
};

// ── Config ────────────────────────────────────────────────────────────────────

const TIPO_CONFIG: Record<TipoTx, { label: string; cor: string; bg: string }> = {
  acumulo:   { label: "Inclusão",  cor: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  resgate:   { label: "Resgate",   cor: "text-rose-700",    bg: "bg-rose-50 border-rose-200"       },
  ajuste:    { label: "Ajuste",    cor: "text-sky-700",     bg: "bg-sky-50 border-sky-200"         },
  expiracao: { label: "Expiração", cor: "text-slate-600",   bg: "bg-slate-50 border-slate-200"     },
  estorno:   { label: "Estorno",   cor: "text-amber-700",   bg: "bg-amber-50 border-amber-200"     },
};

// ── Mock data ─────────────────────────────────────────────────────────────────

const TRANSACOES: Transacao[] = [
  { id: "t01", data: "24/10/2025 · 12:42", descricao: `Crédito de ${MOEDA.nome.toLowerCase()} e bônus`, tipo: "acumulo",   valor: 320,  bonus: 16,  saldo: 5200, campanha: "BF2026",        pedido: "425234635534", produto: "Smart TV 50\" 4K UHD" },
  { id: "t02", data: "24/10/2025 · 12:42", descricao: `Crédito de ${MOEDA.nome.toLowerCase()} e bônus`, tipo: "acumulo",   valor: 180,  bonus: 9,   saldo: 4880, campanha: "BF2026",        pedido: "425234635534", produto: "Air Fryer XL" },
  { id: "t03", data: "24/10/2025 · 12:42", descricao: `Crédito de ${MOEDA.nome.toLowerCase()} e bônus`, tipo: "acumulo",   valor: 560,  bonus: 28,  saldo: 4700, campanha: "CAMP-2025-06",  pedido: "425234635534", produto: "Notebook Dell Inspiron 15" },
  { id: "t04", data: "24/10/2025 · 12:42", descricao: `Crédito de ${MOEDA.nome.toLowerCase()} e bônus`, tipo: "acumulo",   valor: 240,  bonus: 12,  saldo: 4140, campanha: "CAMP-2025-06",  pedido: "425234635534", produto: "Fone Bluetooth" },
  { id: "t05", data: "20/10/2025 · 09:12", descricao: `Expiração do saldo acumulado da campanha`,        tipo: "expiracao", valor: -120, bonus: 0,   saldo: 3900, campanha: "CAMP-2025-04",  pedido: null,           produto: "Ar-Condicionado Split LG" },
  { id: "t06", data: "19/10/2025 · 12:42", descricao: `Estorno de ${MOEDA.nome.toLowerCase()} e bônus`, tipo: "estorno",   valor: -500, bonus: -25, saldo: 4020, campanha: "CAMP-2025-05",  pedido: "915384726051", produto: "Smartphone iPhone 14 128GB" },
  { id: "t07", data: "18/10/2025 · 09:12", descricao: "Ajuste do saldo",                                 tipo: "ajuste",    valor: 200,  bonus: 0,   saldo: 4520, campanha: null,            pedido: null,           produto: "Geladeira Brastemp Frost Free 375L" },
  { id: "t08", data: "10/10/2025 · 16:32", descricao: `Resgate de bônus`,                                tipo: "resgate",   valor: -650, bonus: 0,   saldo: 4320, campanha: null,            pedido: "784102639558", produto: "PlayStation 5 825GB" },
  { id: "t09", data: "09/10/2025 · 11:17", descricao: `Estorno manual de bônus`,                         tipo: "estorno",   valor: -30,  bonus: 0,   saldo: 4970, campanha: "CAMP-2025-05",  pedido: "593847120964", produto: "Cafeteira Nespresso Essenza Mini" },
  { id: "t10", data: "05/10/2025 · 14:00", descricao: `Crédito de ${MOEDA.nome.toLowerCase()} e bônus`, tipo: "acumulo",   valor: 400,  bonus: 20,  saldo: 5000, campanha: "CAMP-2025-05",  pedido: "193847201933", produto: "Tênis Running" },
  { id: "t11", data: "01/10/2025 · 10:30", descricao: `Crédito de ${MOEDA.nome.toLowerCase()} e bônus`, tipo: "acumulo",   valor: 180,  bonus: 9,   saldo: 4600, campanha: "CAMP-2025-04",  pedido: "293847102844", produto: "Kit Skincare" },
  { id: "t12", data: "28/09/2025 · 08:15", descricao: `Crédito de ${MOEDA.nome.toLowerCase()} e bônus`, tipo: "acumulo",   valor: 220,  bonus: 11,  saldo: 4420, campanha: "CAMP-2025-04",  pedido: "183746291038", produto: "Mochila Executiva" },
];

const POR_PAGINA = 8;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Extrato() {
  const [search,      setSearch]      = useState("");
  const [filtroTipo,  setFiltroTipo]  = useState<TipoTx | "todos">("todos");
  const [periodoIni,  setPeriodoIni]  = useState("");
  const [periodoFim,  setPeriodoFim]  = useState("");
  const [pagina,      setPagina]      = useState(1);

  const saldoPontos = TRANSACOES[0].saldo;
  const saldoBonus  = TRANSACOES.filter(t => t.bonus > 0).reduce((a, t) => a + t.bonus, 0);

  const filtrados = useMemo(() => TRANSACOES.filter(t => {
    const matchSearch = !search ||
      t.descricao.toLowerCase().includes(search.toLowerCase()) ||
      (t.pedido ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (t.produto ?? "").toLowerCase().includes(search.toLowerCase());
    const matchTipo = filtroTipo === "todos" || t.tipo === filtroTipo;
    return matchSearch && matchTipo;
  }), [search, filtroTipo, periodoIni, periodoFim]);

  const totalPaginas = Math.ceil(filtrados.length / POR_PAGINA);
  const pagina_ = Math.min(pagina, Math.max(1, totalPaginas));
  const visiveis = filtrados.slice((pagina_ - 1) * POR_PAGINA, pagina_ * POR_PAGINA);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Extrato</h2>

      {/* ── Cards de saldo ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Saldo de {MOEDA.nome.toLowerCase()}</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">{saldoPontos.toLocaleString("pt-BR")}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{MOEDA.nome}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Saldo de bônus</p>
          <p className="text-2xl font-bold mt-1 tabular-nums text-primary">
            {saldoBonus.toLocaleString("pt-BR")}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{MOEDA.abrev} acumulados</p>
        </div>
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-1.5">Busca</p>
          <SearchInput value={search} onChange={setSearch} placeholder="Código do pedido ou nome do produto…" />
        </div>
        <div className="w-full sm:w-44">
          <p className="text-xs text-muted-foreground mb-1.5">Tipo de transação</p>
          <Select value={filtroTipo} onValueChange={v => { setFiltroTipo(v as TipoTx | "todos"); setPagina(1); }}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="acumulo">Inclusão</SelectItem>
              <SelectItem value="resgate">Resgate</SelectItem>
              <SelectItem value="ajuste">Ajuste</SelectItem>
              <SelectItem value="expiracao">Expiração</SelectItem>
              <SelectItem value="estorno">Estorno</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-auto">
          <p className="text-xs text-muted-foreground mb-1.5">Período</p>
          <div className="flex items-center gap-2">
            <Input type="date" value={periodoIni} onChange={e => { setPeriodoIni(e.target.value); setPagina(1); }} className="w-36 text-xs" />
            <span className="text-muted-foreground text-sm shrink-0">→</span>
            <Input type="date" value={periodoFim} onChange={e => { setPeriodoFim(e.target.value); setPagina(1); }} className="w-36 text-xs" />
          </div>
        </div>
      </div>

      {/* ── Tabela ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/20 border-b border-border">
              <tr className="text-left text-muted-foreground">
                {["Data do evento", "Descrição", "Tipo", "Campanha", "Pedido", "Produto", `${MOEDA.nome}`, "Bônus"].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visiveis.map(t => {
                const cfg = TIPO_CONFIG[t.tipo];
                return (
                  <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3.5 text-xs text-muted-foreground tabular-nums whitespace-nowrap">{t.data}</td>
                    <td className="px-4 py-3.5 text-sm max-w-[200px] truncate">{t.descricao}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.cor}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {t.campanha ?? <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {t.pedido ?? <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground max-w-[180px] truncate whitespace-nowrap">
                      {t.produto ?? <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className={`px-4 py-3.5 text-sm font-semibold tabular-nums whitespace-nowrap ${t.valor >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {t.valor > 0 ? "+" : ""}{t.valor.toLocaleString("pt-BR")}
                    </td>
                    <td className={`px-4 py-3.5 text-sm tabular-nums whitespace-nowrap ${t.bonus > 0 ? "text-emerald-600" : t.bonus < 0 ? "text-rose-600" : "text-muted-foreground/50"}`}>
                      {t.bonus !== 0 ? `${t.bonus > 0 ? "+" : ""}${t.bonus.toLocaleString("pt-BR")}` : "—"}
                    </td>
                  </tr>
                );
              })}
              {visiveis.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Nenhuma transação encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Resultado {(pagina_ - 1) * POR_PAGINA + 1}–{Math.min(pagina_ * POR_PAGINA, filtrados.length)} de {filtrados.length.toLocaleString("pt-BR")}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina_ === 1}
                className="h-7 w-7 rounded border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40 text-xs"
              >
                ‹
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPagina(n)}
                  className={`h-7 w-7 rounded border text-xs font-medium transition-colors ${
                    n === pagina_ ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                disabled={pagina_ === totalPaginas}
                className="h-7 w-7 rounded border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40 text-xs"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
