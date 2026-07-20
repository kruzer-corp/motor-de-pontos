import { useState } from "react";
import { Download, CheckCheck, X, Share2 } from "lucide-react";
import {
  Avatar, AvatarFallback, Button, Card, InfoNotice, PageHeader,
  SearchInput, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  toast,
} from "@kruzer/ds";
import { CustomTag } from "../components/CustomTag";

// ── Status compartilhado ───────────────────────────────────────────────────────

type IndicStatus = "pendente" | "convertida" | "expirada" | "cancelada";

const STATUS_LABEL: Record<IndicStatus, string> = {
  pendente: "Pendente", convertida: "Convertida",
  expirada: "Expirada", cancelada: "Cancelada",
};

const STATUS_COLOR: Record<IndicStatus, string> = {
  pendente:   "bg-amber-100 text-amber-700",
  convertida: "bg-emerald-100 text-emerald-700",
  expirada:   "bg-slate-100 text-slate-500",
  cancelada:  "bg-red-100 text-red-600",
};

// ── Indicações de vendas ────────────────────────────────────────────────────────
// Membro (arquiteto/vendedor) indica uma venda a um cliente (B2B sales referral)

type IndicacaoVenda = {
  id: string;
  dataIndicacao: string;
  dataVenda: string | null;
  filial: string;
  codigoTabela: string;
  numeroPedido: string | null;
  canal: string;
  nomeArquiteto: string;
  arquitetoInitials: string;
  cliente: string;
  clienteInitials: string;
  documentoCliente: string;
  processadoMotor: string;
  status: IndicStatus;
};

const VENDAS_MOCK: IndicacaoVenda[] = [
  { id: "IND-021", dataIndicacao: "19/05/2026", dataVenda: "14/04/2026", filial: "FAST SHOP S.A. ZAKI NARCHI", codigoTabela: "i7", numeroPedido: "1624874650722-01",canal: "Vtex", nomeArquiteto: "Isabela Meirelles", arquitetoInitials: "IM", cliente: "MAURICIO GARCIA CARVALHO", clienteInitials: "MG", documentoCliente: "16800217883", processadoMotor: "Pendente de Processamento", status: "pendente"   },
  { id: "IND-020", dataIndicacao: "02/04/2026", dataVenda: "27/03/2026", filial: "FAST SHOP S.A. ZAKI NARCHI", codigoTabela: "91", numeroPedido: "1_33_1712532_91",  canal: "GAN",  nomeArquiteto: "Matheus Marthins",  arquitetoInitials: "MM", cliente: "AURELIA BORBA CARTAXO",    clienteInitials: "AB", documentoCliente: "17089273873", processadoMotor: "Processado",               status: "convertida" },
  { id: "IND-019", dataIndicacao: "02/04/2026", dataVenda: "01/04/2026", filial: "FAST SHOP S.A. ZAKI NARCHI", codigoTabela: "91", numeroPedido: "1_33_1712544_91",  canal: "GAN",  nomeArquiteto: "Matheus Marthins",  arquitetoInitials: "MM", cliente: "AURELIA BORBA CARTAXO",    clienteInitials: "AB", documentoCliente: "17089273873", processadoMotor: "Pendente de Processamento", status: "convertida" },
  { id: "IND-018", dataIndicacao: "01/04/2026", dataVenda: null,         filial: "FAST SHOP S.A. ZAKI NARCHI", codigoTabela: "91", numeroPedido: null,               canal: "GAN",  nomeArquiteto: "Rodolfo Cavarzam",  arquitetoInitials: "RC", cliente: "AURELIA BORBA CARTAXO",    clienteInitials: "AB", documentoCliente: "17089273873", processadoMotor: "Pendente de Processamento", status: "pendente"   },
  { id: "IND-017", dataIndicacao: "31/03/2026", dataVenda: "31/03/2026", filial: "FAST SHOP S.A. ZAKI NARCHI", codigoTabela: "91", numeroPedido: "1_33_1712528_91",  canal: "GAN",  nomeArquiteto: "Rodolfo Cavarzam",  arquitetoInitials: "RC", cliente: "IVELIZE CARTAXO",         clienteInitials: "IC", documentoCliente: "01040771823", processadoMotor: "Processado",               status: "convertida" },
  { id: "IND-016", dataIndicacao: "30/03/2026", dataVenda: null,         filial: "FAST SHOP S.A. ZAKI NARCHI", codigoTabela: "91", numeroPedido: null,               canal: "GAN",  nomeArquiteto: "Rodolfo Cavarzam",  arquitetoInitials: "RC", cliente: "IVELIZE CARTAXO",         clienteInitials: "IC", documentoCliente: "01040771823", processadoMotor: "Pendente de Processamento", status: "expirada"   },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function SummaryCards({ counts }: { counts: { pendente: number; convertida: number; expirada: number } }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {[
        { label: "Pendentes",   value: counts.pendente,   color: "text-amber-600"   },
        { label: "Convertidas", value: counts.convertida, color: "text-emerald-600" },
        { label: "Expiradas",   value: counts.expirada,   color: "text-slate-500"   },
      ].map((s) => (
        <Card key={s.label} className="p-4">
          <div className="text-xs text-muted-foreground">{s.label}</div>
          <div className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</div>
        </Card>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: IndicStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${STATUS_COLOR[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function AcoesCell({ status, onAprovar, onReprovar }: { status: IndicStatus; onAprovar: () => void; onReprovar: () => void }) {
  if (status !== "pendente") return null;
  return (
    <div className="flex items-center gap-1.5">
      <Button size="sm" className="h-7 text-xs whitespace-nowrap" onClick={onAprovar}>
        <CheckCheck className="size-3 mr-1" />Aprovar
      </Button>
      <Button size="sm" variant="destructive" className="h-7 text-xs whitespace-nowrap" onClick={onReprovar}>
        <X className="size-3 mr-1" />Reprovar
      </Button>
    </div>
  );
}


function TabVendas() {
  const [indicacoes, setIndicacoes] = useState<IndicacaoVenda[]>(VENDAS_MOCK);
  const [query,      setQuery]      = useState("");
  const [filtroStatus, setFiltroStatus] = useState<IndicStatus | "todos">("todos");

  const filtered = indicacoes.filter((i) => {
    const matchStatus = filtroStatus === "todos" || i.status === filtroStatus;
    const matchQuery  = !query ||
      i.nomeArquiteto.toLowerCase().includes(query.toLowerCase()) ||
      i.cliente.toLowerCase().includes(query.toLowerCase()) ||
      i.id.toLowerCase().includes(query.toLowerCase()) ||
      (i.numeroPedido ?? "").toLowerCase().includes(query.toLowerCase()) ||
      i.documentoCliente.includes(query);
    return matchStatus && matchQuery;
  });

  const counts = {
    pendente:   indicacoes.filter((i) => i.status === "pendente").length,
    convertida: indicacoes.filter((i) => i.status === "convertida").length,
    expirada:   indicacoes.filter((i) => i.status === "expirada").length,
  };

  function aprovar(id: string) {
    setIndicacoes((prev) => prev.map((i) => i.id === id ? { ...i, status: "convertida" as IndicStatus, processadoMotor: "Processado" } : i));
    toast.success("Indicação de venda aprovada");
  }

  function reprovar(id: string) {
    setIndicacoes((prev) => prev.map((i) => i.id === id ? { ...i, status: "cancelada" as IndicStatus } : i));
  }

  function exportarCSV() {
    const headers = ["ID", "Data indicação", "Data venda", "Filial", "Cód. tabela", "Nº pedido", "Canal", "Nome do arquiteto", "Cliente", "Documento", "Processado pelo Motor", "Status"];
    const rows = filtered.map((i) => [i.id, i.dataIndicacao, i.dataVenda ?? "", i.filial, i.codigoTabela, i.numeroPedido ?? "", i.canal, i.nomeArquiteto, i.cliente, i.documentoCliente, i.processadoMotor, STATUS_LABEL[i.status]]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "indicacoes-de-vendas.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <InfoNotice variant="warning" title={<span className="flex items-center gap-2">Consulta de Indicação de Vendas <CustomTag /></span>}>
          Funcionalidade específica do programa Fast PRO — arquitetos e vendedores que indicam vendas a clientes e recebem comissão ou pontos por conversão.
        </InfoNotice>
        <Button size="sm" variant="outline" className="shrink-0" onClick={exportarCSV}>
          <Download className="size-3.5 mr-1.5" />Exportar planilha
        </Button>
      </div>

      <SummaryCards counts={counts} />

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <div className="w-36 shrink-0">
            <Select value={filtroStatus} onValueChange={(v) => setFiltroStatus(v as IndicStatus | "todos")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="convertida">Convertida</SelectItem>
                <SelectItem value="expirada">Expirada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SearchInput value={query} onChange={setQuery} placeholder="Arquiteto, cliente, pedido…" className="w-72" />
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} indicações</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/20">
              <tr className="text-left text-muted-foreground border-b border-border">
                {["ID da indicação", "Data indicação", "Data da venda", "Filial", "Cód. tabela", "Nº pedido", "Canal", "Nome do arquiteto", "Cliente", "Documento", "Processado pelo Motor", "Status", "Ação"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((ind) => (
                <tr key={ind.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground whitespace-nowrap">{ind.id}</td>
                  <td className="px-4 py-3.5 tabular-nums text-xs text-muted-foreground whitespace-nowrap">{ind.dataIndicacao}</td>
                  <td className="px-4 py-3.5 tabular-nums text-xs whitespace-nowrap">
                    {ind.dataVenda ?? <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-xs whitespace-nowrap">{ind.filial}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground whitespace-nowrap">{ind.codigoTabela}</td>
                  <td className="px-4 py-3.5 font-mono text-xs whitespace-nowrap">
                    {ind.numeroPedido ?? <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{ind.canal}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-bold">{ind.arquitetoInitials}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{ind.nomeArquiteto}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">{ind.clienteInitials}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{ind.cliente}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground whitespace-nowrap">{ind.documentoCliente}</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{ind.processadoMotor}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={ind.status} /></td>
                  <td className="px-4 py-3.5">
                    <AcoesCell status={ind.status} onAprovar={() => aprovar(ind.id)} onReprovar={() => reprovar(ind.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function Indicacoes() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Indicações"
        path={[{ label: "Operação" }]}
        description="Arquitetos e vendedores que indicaram vendas a clientes"
        actions={
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </div>
        }
      />

      <TabVendas />
    </div>
  );
}
