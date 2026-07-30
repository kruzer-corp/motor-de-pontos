import { useState } from "react";
import {
  Button, PageHeader, Pill, SearchInput,
} from "@kruzer/ds";
import { FileText, Package } from "lucide-react";
import { MOEDA } from "../config/programa";

function gerarPDF(o: Orcamento) {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>Orçamento ${o.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; color: #111; padding: 40px; max-width: 680px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #111; }
    .logo { font-size: 20px; font-weight: 800; }
    .meta { text-align: right; color: #6b7280; font-size: 12px; line-height: 1.8; }
    .section { margin-bottom: 24px; }
    .label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 8px; }
    .box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
    .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
    .row:last-child { border: none; }
    .total { font-weight: 700; font-size: 15px; padding-top: 12px; margin-top: 8px; border-top: 1px solid #e5e7eb !important; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; background: #d1fae5; color: #065f46; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 11px; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Programa de Fidelidade</div>
      <div style="color:#6b7280;font-size:12px;margin-top:4px">Orçamento de Resgate</div>
    </div>
    <div class="meta">
      <div><strong>${o.id}</strong></div>
      <div>Emitido em ${new Date().toLocaleDateString("pt-BR")}</div>
      <div>Válido até ${o.validoAte}</div>
      <div><span class="badge">${{ rascunho: "Rascunho", vigente: "Vigente", expirado: "Expirado", convertido: "Convertido" }[o.status]}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="label">Membro</div>
    <div class="box" style="font-size:15px;font-weight:700">${o.membro}</div>
  </div>

  <div class="section">
    <div class="label">Resumo do orçamento</div>
    <div class="box">
      <div class="row"><span>Itens selecionados</span><span>${o.itens} item(ns)</span></div>
      <div class="row"><span>Total em ${MOEDA.nome.toLowerCase()}</span><span><strong>${o.totalCusto.toLocaleString("pt-BR")} ${MOEDA.abrev}</strong></span></div>
      <div class="row"><span>Equivalente em R$</span><span>${o.totalReais.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span></div>
      <div class="row"><span>Criado em</span><span>${o.criadoEm}</span></div>
      <div class="row total"><span>Válido até</span><span>${o.validoAte}</span></div>
    </div>
  </div>

  <div class="footer">
    <div>Código de rastreio: <strong>${o.id}</strong></div>
    <div>Este orçamento é informativo e não constitui compromisso de resgate.</div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const w    = window.open(url, "_blank");
  if (w) { w.focus(); setTimeout(() => URL.revokeObjectURL(url), 5000); }
}

// ── Types ─────────────────────────────────────────────────────────────────────

type OrcStatus = "rascunho" | "vigente" | "expirado" | "convertido";

type Orcamento = {
  id: string;
  membro: string;
  membroId: string;
  itens: number;
  totalCusto: number;
  totalReais: number;
  status: OrcStatus;
  criadoEm: string;
  validoAte: string;
};

// ── Mock ──────────────────────────────────────────────────────────────────────

const MOCK: Orcamento[] = [
  { id: "ORC-004", membro: "Aline P.",   membroId: "1", itens: 2, totalCusto: 3200,  totalReais: 320,  status: "vigente",    criadoEm: "18/06/2025", validoAte: "25/06/2025" },
  { id: "ORC-003", membro: "Bruno C.",   membroId: "2", itens: 1, totalCusto: 800,   totalReais: 80,   status: "convertido", criadoEm: "10/06/2025", validoAte: "17/06/2025" },
  { id: "ORC-002", membro: "Cecília M.", membroId: "3", itens: 3, totalCusto: 5500,  totalReais: 550,  status: "expirado",   criadoEm: "01/06/2025", validoAte: "08/06/2025" },
  { id: "ORC-001", membro: "Danilo R.",  membroId: "4", itens: 1, totalCusto: 300,   totalReais: 30,   status: "rascunho",   criadoEm: "20/05/2025", validoAte: "27/05/2025" },
];

const STATUS_PILL: Record<OrcStatus, "warning" | "success" | "muted" | "primary"> = {
  rascunho:   "warning",
  vigente:    "success",
  expirado:   "muted",
  convertido: "primary",
};

const STATUS_LABEL: Record<OrcStatus, string> = {
  rascunho:   "Rascunho",
  vigente:    "Vigente",
  expirado:   "Expirado",
  convertido: "Convertido em pedido",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Orcamentos() {
  const [search, setSearch] = useState("");

  const filtered = MOCK.filter((o) =>
    !search ||
    o.membro.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orçamentos"
        path={[{ label: "Operação" }]}
        description="Orçamentos de resgate solicitados pelos membros via portal."
      />

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <div className="w-64 shrink-0">
            <SearchInput value={search} onChange={setSearch} placeholder="Membro ou nº orçamento…" />
          </div>
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} orçamentos</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2">
            <Package className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nenhum orçamento encontrado.</p>
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-muted/20 border-b border-border">
              <tr className="text-left text-muted-foreground">
                {["Nº orçamento", "Membro", "Itens", `Total ${MOEDA.nome}`, "Equiv. R$", "Status", "Criado em", "Válido até", ""].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{o.id}</td>
                  <td className="px-4 py-3.5 font-medium text-sm">{o.membro}</td>
                  <td className="px-4 py-3.5 text-sm text-center">{o.itens}</td>
                  <td className="px-4 py-3.5 tabular-nums font-semibold text-sm text-primary">
                    {o.totalCusto.toLocaleString("pt-BR")} {MOEDA.abrev}
                  </td>
                  <td className="px-4 py-3.5 tabular-nums text-sm">
                    {o.totalReais.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className="px-4 py-3.5">
                    <Pill color={STATUS_PILL[o.status]} variant="soft" size="sm">
                      {STATUS_LABEL[o.status]}
                    </Pill>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground tabular-nums">{o.criadoEm}</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground tabular-nums">{o.validoAte}</td>
                  <td className="px-4 py-3.5">
                    <Button
                      variant="ghost" size="sm" className="h-7 text-xs gap-1.5"
                      onClick={() => gerarPDF(o)}
                    >
                      <FileText className="size-3.5" />
                      Ver PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
