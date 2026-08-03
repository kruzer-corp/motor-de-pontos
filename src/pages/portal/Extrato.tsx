import { useMemo, useState } from "react";
import { EmptyState, Input, SearchInput, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@kruzer/ds";
import { ScrollText } from "lucide-react";
import { type Transacao, getMembroLogado, agruparSaldosPorMoeda } from "../../lib/membros";

// ── Tipo de exibição — trata estorno como categoria própria, sem expor o
// texto interno que o operador digitou ao cancelar (ver descricaoExibicao) ──

type TipoExibicao = "acumulo" | "resgate" | "ajuste" | "expiracao" | "estorno";

const TIPO_CONFIG: Record<TipoExibicao, { label: string; cor: string; bg: string }> = {
  acumulo:   { label: "Inclusão",  cor: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  resgate:   { label: "Resgate",   cor: "text-rose-700",    bg: "bg-rose-50 border-rose-200"       },
  ajuste:    { label: "Ajuste",    cor: "text-sky-700",     bg: "bg-sky-50 border-sky-200"         },
  expiracao: { label: "Expiração", cor: "text-slate-600",   bg: "bg-slate-50 border-slate-200"     },
  estorno:   { label: "Estorno",   cor: "text-amber-700",   bg: "bg-amber-50 border-amber-200"     },
};

function tipoExibicao(t: Transacao): TipoExibicao {
  return t.estornoDeId ? "estorno" : t.tipo;
}

// Nunca repete pro membro o texto que o operador digitou ao cancelar/estornar
// (motivo interno de auditoria) — só informa que houve um estorno.
function descricaoExibicao(t: Transacao): string {
  return t.estornoDeId ? "Estorno de uma movimentação anterior" : t.descricao;
}

const POR_PAGINA = 8;

export default function Extrato() {
  const membro = getMembroLogado();
  const [search,     setSearch]     = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoExibicao | "todos">("todos");
  const [periodoIni, setPeriodoIni] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");
  const [pagina,     setPagina]     = useState(1);

  const transacoes = membro?.transacoes ?? [];
  const saldosPorMoeda = useMemo(() => agruparSaldosPorMoeda(membro?.saldos ?? []), [membro]);

  const filtrados = useMemo(() => transacoes.filter((t) => {
    const descricao = descricaoExibicao(t);
    const matchSearch = !search || descricao.toLowerCase().includes(search.toLowerCase());
    const matchTipo = filtroTipo === "todos" || tipoExibicao(t) === filtroTipo;
    return matchSearch && matchTipo;
  }), [transacoes, search, filtroTipo, periodoIni, periodoFim]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const pagina_ = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((pagina_ - 1) * POR_PAGINA, pagina_ * POR_PAGINA);

  if (!membro) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold">Extrato</h2>
        <EmptyState icon={ScrollText} title="Nenhum membro cadastrado ainda"
          description="Assim que houver um membro no programa, esta tela mostra o extrato dele." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Extrato</h2>

      {/* ── Cards de saldo — um por moeda que o membro tem ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {saldosPorMoeda.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum saldo ainda.</p>
        ) : saldosPorMoeda.map((s) => (
          <div key={s.moeda} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Saldo de {s.moeda.toLowerCase()}</p>
            <p className="text-2xl font-bold mt-1 tabular-nums">{s.total.toLocaleString("pt-BR")}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.abrev}</p>
          </div>
        ))}
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-1.5">Busca</p>
          <SearchInput value={search} onChange={setSearch} placeholder="Descrição da movimentação…" />
        </div>
        <div className="w-full sm:w-44">
          <p className="text-xs text-muted-foreground mb-1.5">Tipo de transação</p>
          <Select value={filtroTipo} onValueChange={(v) => { setFiltroTipo(v as TipoExibicao | "todos"); setPagina(1); }}>
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
            <Input type="date" value={periodoIni} onChange={(e) => { setPeriodoIni(e.target.value); setPagina(1); }} className="w-36 text-xs" />
            <span className="text-muted-foreground text-sm shrink-0">→</span>
            <Input type="date" value={periodoFim} onChange={(e) => { setPeriodoFim(e.target.value); setPagina(1); }} className="w-36 text-xs" />
          </div>
        </div>
      </div>

      {/* ── Tabela ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/20 border-b border-border">
              <tr className="text-left text-muted-foreground">
                {["Data", "Descrição", "Tipo", "Valor", "Saldo"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visiveis.map((t) => {
                const cfg = TIPO_CONFIG[tipoExibicao(t)];
                return (
                  <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3.5 text-xs text-muted-foreground tabular-nums whitespace-nowrap">{t.data}</td>
                    <td className="px-4 py-3.5 text-sm max-w-[280px]">
                      <span className={`truncate block ${t.canceladaEm ? "line-through text-muted-foreground" : ""}`}>
                        {descricaoExibicao(t)}
                      </span>
                      {t.canceladaEm && (
                        <span className="inline-flex mt-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Cancelada</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.cor}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className={`px-4 py-3.5 text-sm font-semibold tabular-nums whitespace-nowrap ${t.valor >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {t.valor > 0 ? "+" : ""}{t.valor.toLocaleString("pt-BR")} {t.abrev}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground tabular-nums whitespace-nowrap">
                      {t.saldo.toLocaleString("pt-BR")} {t.abrev}
                    </td>
                  </tr>
                );
              })}
              {visiveis.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
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
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina_ === 1}
                className="h-7 w-7 rounded border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40 text-xs"
              >
                ‹
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPagina(n)}
                  className={`h-7 w-7 rounded border text-xs font-medium transition-colors ${
                    n === pagina_ ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
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
