import { useState } from "react";
import {
  Card, Button, Input, Avatar, AvatarFallback, InfoNotice, PageHeader,
  SearchInput, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@kruzer/ds";
import { Plus, CheckCheck, X, Download } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type IndicStatus = "pendente" | "convertida" | "expirada" | "cancelada";

type Indicacao = {
  id: string;
  dataIndicacao: string;
  dataVenda: string | null;
  filial: string;
  codigoTabela: string;
  numeroPedido: string | null;
  canal: string;
  nomeMembro: string;        // quem indicou
  membroInitials: string;
  cliente: string;           // quem foi indicado
  clienteInitials: string;
  documentoCliente: string;
  status: IndicStatus;
};

// ── Mock data ─────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<IndicStatus, string> = {
  pendente:   "Pendente",
  convertida: "Convertida",
  expirada:   "Expirada",
  cancelada:  "Cancelada",
};

const STATUS_COLOR: Record<IndicStatus, string> = {
  pendente:   "bg-amber-100 text-amber-700",
  convertida: "bg-emerald-100 text-emerald-700",
  expirada:   "bg-slate-100 text-slate-500",
  cancelada:  "bg-red-100 text-red-600",
};

const INDICACOES: Indicacao[] = [
  {
    id: "IND-021",
    dataIndicacao: "10/06/2025",
    dataVenda: null,
    filial: "SP - Centro",
    codigoTabela: "TAB-001",
    numeroPedido: null,
    canal: "App",
    nomeMembro: "Aline P.",
    membroInitials: "AP",
    cliente: "Rafael L.",
    clienteInitials: "RL",
    documentoCliente: "123.456.789-00",
    status: "pendente",
  },
  {
    id: "IND-020",
    dataIndicacao: "05/06/2025",
    dataVenda: "12/06/2025",
    filial: "SP - Sul",
    codigoTabela: "TAB-002",
    numeroPedido: "PED-98432",
    canal: "WhatsApp",
    nomeMembro: "Bruno C.",
    membroInitials: "BC",
    cliente: "Paula S.",
    clienteInitials: "PS",
    documentoCliente: "987.654.321-00",
    status: "convertida",
  },
  {
    id: "IND-019",
    dataIndicacao: "01/06/2025",
    dataVenda: "08/06/2025",
    filial: "RJ - Norte",
    codigoTabela: "TAB-001",
    numeroPedido: "PED-97801",
    canal: "Link compartilhado",
    nomeMembro: "Cecília M.",
    membroInitials: "CM",
    cliente: "Marcos A.",
    clienteInitials: "MA",
    documentoCliente: "456.789.123-00",
    status: "convertida",
  },
  {
    id: "IND-018",
    dataIndicacao: "15/05/2025",
    dataVenda: null,
    filial: "MG - Leste",
    codigoTabela: "TAB-003",
    numeroPedido: null,
    canal: "Presencial",
    nomeMembro: "Danilo R.",
    membroInitials: "DR",
    cliente: "Letícia F.",
    clienteInitials: "LF",
    documentoCliente: "321.654.987-00",
    status: "expirada",
  },
  {
    id: "IND-017",
    dataIndicacao: "20/05/2025",
    dataVenda: null,
    filial: "SP - Centro",
    codigoTabela: "TAB-002",
    numeroPedido: null,
    canal: "App",
    nomeMembro: "Aline P.",
    membroInitials: "AP",
    cliente: "Carlos B.",
    clienteInitials: "CB",
    documentoCliente: "654.321.098-00",
    status: "cancelada",
  },
];

// ── Form ──────────────────────────────────────────────────────────────────────

type NewForm = {
  nomeMembro: string;
  cliente: string;
  documentoCliente: string;
  filial: string;
  canal: string;
  codigoTabela: string;
};

const FORM_DEFAULTS: NewForm = {
  nomeMembro: "", cliente: "", documentoCliente: "",
  filial: "", canal: "", codigoTabela: "",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function IndicacaoVenda() {
  const [indicacoes, setIndicacoes] = useState(INDICACOES);
  const [query,      setQuery]      = useState("");
  const [statusFiltro, setStatusFiltro] = useState<IndicStatus | "todos">("todos");
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState<NewForm>(FORM_DEFAULTS);

  const upd = (k: keyof NewForm, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const filtered = indicacoes.filter((i) => {
    const matchStatus = statusFiltro === "todos" || i.status === statusFiltro;
    const matchQuery  = !query ||
      i.cliente.toLowerCase().includes(query.toLowerCase()) ||
      i.nomeMembro.toLowerCase().includes(query.toLowerCase()) ||
      i.id.toLowerCase().includes(query.toLowerCase()) ||
      (i.numeroPedido ?? "").toLowerCase().includes(query.toLowerCase()) ||
      i.documentoCliente.includes(query);
    return matchStatus && matchQuery;
  });

  const exportarCSV = () => {
    const headers = [
      "ID indicação", "Data indicação", "Data da venda", "Filial",
      "Cód. tabela", "Nº pedido", "Canal", "Nome do membro",
      "Cliente", "Documento", "Status",
    ];
    const rows = filtered.map((i) => [
      i.id, i.dataIndicacao, i.dataVenda ?? "", i.filial,
      i.codigoTabela, i.numeroPedido ?? "", i.canal, i.nomeMembro,
      i.cliente, i.documentoCliente, STATUS_LABEL[i.status],
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "indicacoes-de-membros.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const reprovar = (id: string) =>
    setIndicacoes((prev) =>
      prev.map((i) => i.id === id ? { ...i, status: "cancelada" as IndicStatus } : i)
    );

  const converter = (id: string) => {
    const today = new Date();
    const fmt = (d: Date) =>
      `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    setIndicacoes((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: "convertida" as IndicStatus, dataVenda: fmt(today), numeroPedido: `PED-${Math.floor(Math.random() * 90000 + 10000)}` }
          : i
      )
    );
  };

  const addIndicacao = () => {
    if (!form.nomeMembro || !form.cliente) return;
    const today = new Date();
    const fmt = (d: Date) =>
      `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    setIndicacoes((prev) => [
      {
        id: `IND-${String(prev.length + 22).padStart(3, "0")}`,
        dataIndicacao: fmt(today),
        dataVenda: null,
        filial: form.filial || "—",
        codigoTabela: form.codigoTabela || "—",
        numeroPedido: null,
        canal: form.canal || "—",
        nomeMembro: form.nomeMembro,
        membroInitials: form.nomeMembro.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase(),
        cliente: form.cliente,
        clienteInitials: form.cliente.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase(),
        documentoCliente: form.documentoCliente || "—",
        status: "pendente",
      },
      ...prev,
    ]);
    setForm(FORM_DEFAULTS);
    setShowForm(false);
  };

  const counts = {
    pendente:   indicacoes.filter((i) => i.status === "pendente").length,
    convertida: indicacoes.filter((i) => i.status === "convertida").length,
    expirada:   indicacoes.filter((i) => i.status === "expirada").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Indicações de Membros"
        path={[{ label: "Operação" }]}
        description="Membros que indicaram outros membros para o programa."
        actions={
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="size-3.5 mr-1.5" />
            Registrar indicação
          </Button>
        }
      />

      <InfoNotice variant="info" title="Como funciona">
        Quando um membro indica outro e o indicado realiza a primeira conversão elegível, o indicador recebe bônus conforme a regra da campanha de indicação ativa.
        Membros participam pelo canal próprio — aqui você acompanha e gerencia o histórico.
      </InfoNotice>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Pendentes",   value: counts.pendente,   color: "text-amber-600"  },
          { label: "Convertidas", value: counts.convertida, color: "text-emerald-600" },
          { label: "Expiradas",   value: counts.expirada,   color: "text-slate-500"  },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-primary/30 bg-primary/5 p-5">
          <p className="text-sm font-medium mb-3">Nova indicação manual</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Nome do membro <span className="text-destructive">*</span></label>
              <Input value={form.nomeMembro} onChange={(e) => upd("nomeMembro", e.target.value)} placeholder="Membro que indicou" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Cliente <span className="text-destructive">*</span></label>
              <Input value={form.cliente} onChange={(e) => upd("cliente", e.target.value)} placeholder="Quem foi indicado" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Documento do cliente</label>
              <Input value={form.documentoCliente} onChange={(e) => upd("documentoCliente", e.target.value)} placeholder="CPF ou CNPJ" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Filial</label>
              <Input value={form.filial} onChange={(e) => upd("filial", e.target.value)} placeholder="Ex: SP - Centro" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Canal</label>
              <Select value={form.canal} onValueChange={(v) => upd("canal", v)}>
                <SelectTrigger><SelectValue placeholder="Canal de origem" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="App">App</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Link compartilhado">Link compartilhado</SelectItem>
                  <SelectItem value="Presencial">Presencial</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Código da tabela</label>
              <Input value={form.codigoTabela} onChange={(e) => upd("codigoTabela", e.target.value)} placeholder="Ex: TAB-001" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm" onClick={addIndicacao} disabled={!form.nomeMembro || !form.cliente}>Registrar</Button>
            <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setForm(FORM_DEFAULTS); }}>Cancelar</Button>
          </div>
        </Card>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <div className="w-36 shrink-0">
            <Select value={statusFiltro} onValueChange={(v) => setStatusFiltro(v as IndicStatus | "todos")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="convertida">Convertida</SelectItem>
                <SelectItem value="expirada">Expirada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-72 shrink-0">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Cliente, membro, pedido…"
            />
          </div>
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} indicações</span>
          <Button variant="outline" size="sm" onClick={exportarCSV}>
            <Download className="size-3.5 mr-1.5" />
            Exportar
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/20">
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="px-4 py-3 font-medium text-xs whitespace-nowrap">ID indicação</th>
                <th className="px-4 py-3 font-medium text-xs whitespace-nowrap">Data indicação</th>
                <th className="px-4 py-3 font-medium text-xs whitespace-nowrap">Data da venda</th>
                <th className="px-4 py-3 font-medium text-xs whitespace-nowrap">Filial</th>
                <th className="px-4 py-3 font-medium text-xs whitespace-nowrap">Cód. tabela</th>
                <th className="px-4 py-3 font-medium text-xs whitespace-nowrap">Nº pedido</th>
                <th className="px-4 py-3 font-medium text-xs whitespace-nowrap">Canal</th>
                <th className="px-4 py-3 font-medium text-xs whitespace-nowrap">Nome do membro</th>
                <th className="px-4 py-3 font-medium text-xs whitespace-nowrap">Cliente</th>
                <th className="px-4 py-3 font-medium text-xs whitespace-nowrap">Documento</th>
                <th className="px-4 py-3 font-medium text-xs whitespace-nowrap">Status</th>
                <th className="px-4 py-3 font-medium text-xs whitespace-nowrap">Ação</th>
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
                  <td className="px-4 py-3.5 text-sm whitespace-nowrap">{ind.filial}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground whitespace-nowrap">{ind.codigoTabela}</td>
                  <td className="px-4 py-3.5 font-mono text-xs whitespace-nowrap">
                    {ind.numeroPedido ?? <span className="text-muted-foreground">—</span>}
                  </td>
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
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">{ind.clienteInitials}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{ind.cliente}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground whitespace-nowrap">{ind.documentoCliente}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${STATUS_COLOR[ind.status]}`}>
                      {STATUS_LABEL[ind.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {ind.status === "pendente" && (
                      <div className="flex items-center gap-1.5">
                        <Button size="sm" className="h-7 text-xs whitespace-nowrap" onClick={() => converter(ind.id)}>
                          <CheckCheck className="size-3 mr-1" />
                          Aprovar
                        </Button>
                        <Button size="sm" variant="destructive" className="h-7 text-xs whitespace-nowrap" onClick={() => reprovar(ind.id)}>
                          <X className="size-3 mr-1" />
                          Reprovar
                        </Button>
                      </div>
                    )}
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
