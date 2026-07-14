import { useState } from "react";
import { Download, Plus, CheckCheck, X, Share2 } from "lucide-react";
import {
  Avatar, AvatarFallback, Button, Card, InfoNotice, Input, PageHeader,
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

// ── Tab: De membros ────────────────────────────────────────────────────────────
// Membro indica outro membro para aderir ao programa (B2C referral)

type IndicacaoMembro = {
  id: string;
  data: string;
  canal: string;
  nomeMembro: string;
  membroInitials: string;
  indicado: string;
  indicadoInitials: string;
  status: IndicStatus;
};

const MEMBROS_MOCK: IndicacaoMembro[] = [
  { id: "MBR-008", data: "12/06/2025", canal: "App",                nomeMembro: "Aline P.",   membroInitials: "AP", indicado: "Rafael L.",   indicadoInitials: "RL", status: "pendente"   },
  { id: "MBR-007", data: "05/06/2025", canal: "WhatsApp",           nomeMembro: "Bruno C.",   membroInitials: "BC", indicado: "Paula S.",    indicadoInitials: "PS", status: "convertida" },
  { id: "MBR-006", data: "01/06/2025", canal: "Link compartilhado", nomeMembro: "Cecília M.", membroInitials: "CM", indicado: "Marcos A.",   indicadoInitials: "MA", status: "convertida" },
  { id: "MBR-005", data: "15/05/2025", canal: "Presencial",         nomeMembro: "Danilo R.",  membroInitials: "DR", indicado: "Letícia F.", indicadoInitials: "LF",  status: "expirada"   },
  { id: "MBR-004", data: "20/05/2025", canal: "App",                nomeMembro: "Aline P.",   membroInitials: "AP", indicado: "Carlos B.",  indicadoInitials: "CB",  status: "cancelada"  },
];

// ── Tab: De vendas ─────────────────────────────────────────────────────────────
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

// ── Tab De membros ─────────────────────────────────────────────────────────────

function TabMembros() {
  const [indicacoes, setIndicacoes] = useState<IndicacaoMembro[]>(MEMBROS_MOCK);
  const [query,      setQuery]      = useState("");
  const [filtroStatus, setFiltroStatus] = useState<IndicStatus | "todos">("todos");
  const [showForm,   setShowForm]   = useState(false);
  const [form, setForm] = useState({ nomeMembro: "", indicado: "", canal: "" });

  const filtered = indicacoes.filter((i) => {
    const matchStatus = filtroStatus === "todos" || i.status === filtroStatus;
    const matchQuery  = !query ||
      i.nomeMembro.toLowerCase().includes(query.toLowerCase()) ||
      i.indicado.toLowerCase().includes(query.toLowerCase()) ||
      i.id.toLowerCase().includes(query.toLowerCase());
    return matchStatus && matchQuery;
  });

  const counts = {
    pendente:   indicacoes.filter((i) => i.status === "pendente").length,
    convertida: indicacoes.filter((i) => i.status === "convertida").length,
    expirada:   indicacoes.filter((i) => i.status === "expirada").length,
  };

  function aprovar(id: string) {
    setIndicacoes((prev) => prev.map((i) => i.id === id ? { ...i, status: "convertida" as IndicStatus } : i));
    toast.success("Indicação aprovada");
  }

  function reprovar(id: string) {
    setIndicacoes((prev) => prev.map((i) => i.id === id ? { ...i, status: "cancelada" as IndicStatus } : i));
  }

  function exportarCSV() {
    const headers = ["ID", "Data", "Canal", "Membro que indicou", "Indicado", "Status"];
    const rows = filtered.map((i) => [i.id, i.data, i.canal, i.nomeMembro, i.indicado, STATUS_LABEL[i.status]]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "indicacoes-membros.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  function addIndicacao() {
    if (!form.nomeMembro || !form.indicado) return;
    const hoje = new Date();
    const fmt = (d: Date) => `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
    setIndicacoes((prev) => [{
      id: `MBR-${String(prev.length + 9).padStart(3,"0")}`,
      data: fmt(hoje),
      canal: form.canal || "—",
      nomeMembro: form.nomeMembro,
      membroInitials: form.nomeMembro.split(" ").map((n) => n[0]).slice(0,2).join("").toUpperCase(),
      indicado: form.indicado,
      indicadoInitials: form.indicado.split(" ").map((n) => n[0]).slice(0,2).join("").toUpperCase(),
      status: "pendente",
    }, ...prev]);
    setForm({ nomeMembro: "", indicado: "", canal: "" });
    setShowForm(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <InfoNotice variant="info" title="Como funciona" className="flex-1">
          Quando um membro indica outro e o indicado realiza a primeira conversão elegível, o indicador recebe bônus conforme a regra da campanha ativa.
        </InfoNotice>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={exportarCSV}><Download className="size-3.5 mr-1.5" />Exportar</Button>
          <Button size="sm" onClick={() => setShowForm((v) => !v)}><Plus className="size-3.5 mr-1.5" />Registrar indicação</Button>
        </div>
      </div>

      <SummaryCards counts={counts} />

      {showForm && (
        <Card className="border-primary/30 bg-primary/5 p-5">
          <p className="text-sm font-medium mb-3">Nova indicação manual</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Membro que indicou <span className="text-destructive">*</span></label>
              <Input value={form.nomeMembro} onChange={(e) => setForm((p) => ({ ...p, nomeMembro: e.target.value }))} placeholder="Nome do membro" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Pessoa indicada <span className="text-destructive">*</span></label>
              <Input value={form.indicado} onChange={(e) => setForm((p) => ({ ...p, indicado: e.target.value }))} placeholder="Nome de quem foi indicado" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Canal</label>
              <Select value={form.canal} onValueChange={(v) => setForm((p) => ({ ...p, canal: v }))}>
                <SelectTrigger><SelectValue placeholder="Canal de origem" /></SelectTrigger>
                <SelectContent>
                  {["App", "WhatsApp", "Link compartilhado", "Presencial", "Outro"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm" onClick={addIndicacao} disabled={!form.nomeMembro || !form.indicado}>Registrar</Button>
            <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setForm({ nomeMembro: "", indicado: "", canal: "" }); }}>Cancelar</Button>
          </div>
        </Card>
      )}

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
          <SearchInput value={query} onChange={setQuery} placeholder="Membro ou indicado…" className="w-64" />
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} indicações</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/20">
              <tr className="text-left text-muted-foreground border-b border-border">
                {["ID", "Data", "Canal", "Membro que indicou", "Pessoa indicada", "Status", "Ação"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((ind) => (
                <tr key={ind.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{ind.id}</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground tabular-nums whitespace-nowrap">{ind.data}</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{ind.canal}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-bold">{ind.membroInitials}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{ind.nomeMembro}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">{ind.indicadoInitials}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{ind.indicado}</span>
                    </div>
                  </td>
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

// ── Tab De vendas ──────────────────────────────────────────────────────────────

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

type TabKey = "membros" | "vendas";

const TABS: { key: TabKey; label: string }[] = [
  { key: "membros", label: "De membros" },
  { key: "vendas",  label: "De vendas"  },
];

export default function Indicacoes() {
  const [activeTab, setActiveTab] = useState<TabKey>("membros");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Indicações"
        path={[{ label: "Operação" }]}
        description={activeTab === "membros"
          ? "Membros que indicaram outros membros para o programa"
          : "Arquitetos e vendedores que indicaram vendas a clientes"}
        actions={
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </div>
        }
      />

      <div className="flex gap-1 border-b border-border">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "membros" && <TabMembros />}
      {activeTab === "vendas"  && <TabVendas />}
    </div>
  );
}
