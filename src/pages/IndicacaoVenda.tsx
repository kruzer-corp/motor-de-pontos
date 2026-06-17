import { useState } from "react";
import { Card, CardHeader, CardTitle, Button, Input, Avatar, AvatarFallback, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@kruzer-corp/ds";
import { UserCheck, Plus, Search, CheckCheck } from "lucide-react";

type IndicStatus = "pendente" | "convertida" | "expirada" | "cancelada";

type Indicacao = {
  id: string;
  member: string;
  initials: string;
  responsible: string;
  date: string;
  expiryDate: string;
  product: string;
  estimatedValue: number;
  status: IndicStatus;
  notes: string;
};

const STATUS_COLOR: Record<IndicStatus, string> = {
  pendente: "bg-amber-100 text-amber-700",
  convertida: "bg-emerald-100 text-emerald-700",
  expirada: "bg-slate-100 text-slate-500",
  cancelada: "bg-red-100 text-red-600",
};

const INDICACOES: Indicacao[] = [
  {
    id: "IND-021",
    member: "Aline P.",
    initials: "AP",
    responsible: "Marcos T.",
    date: "10/06/2025",
    expiryDate: "10/09/2025",
    product: 'Smart TV 50"',
    estimatedValue: 3200,
    status: "pendente",
    notes: "Membro interessado, aguardando decisão do cônjuge.",
  },
  {
    id: "IND-020",
    member: "Bruno C.",
    initials: "BC",
    responsible: "Fernanda G.",
    date: "05/06/2025",
    expiryDate: "05/09/2025",
    product: "Notebook Pro 14\"",
    estimatedValue: 5800,
    status: "convertida",
    notes: "Compra realizada em 12/06/2025.",
  },
  {
    id: "IND-019",
    member: "Cecília M.",
    initials: "CM",
    responsible: "Marcos T.",
    date: "01/06/2025",
    expiryDate: "01/09/2025",
    product: "Air Fryer XL",
    estimatedValue: 890,
    status: "convertida",
    notes: "Convertida via app.",
  },
  {
    id: "IND-018",
    member: "Danilo R.",
    initials: "DR",
    responsible: "João Operações",
    date: "15/05/2025",
    expiryDate: "15/08/2025",
    product: "Fone Bluetooth",
    estimatedValue: 420,
    status: "expirada",
    notes: "Sem retorno após 3 contatos.",
  },
  {
    id: "IND-017",
    member: "Tais M.",
    initials: "TM",
    responsible: "Fernanda G.",
    date: "20/05/2025",
    expiryDate: "20/08/2025",
    product: "Cafeteira Premium",
    estimatedValue: 680,
    status: "cancelada",
    notes: "Membro desistiu por indisponibilidade de estoque.",
  },
];

const RESPONSAVEIS = ["Marcos T.", "Fernanda G.", "João Operações"];

type NewForm = { member: string; responsible: string; product: string; notes: string };

export default function IndicacaoVenda() {
  const [indicacoes, setIndicacoes] = useState(INDICACOES);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewForm>({ member: "", responsible: "", product: "", notes: "" });

  const filtered = indicacoes.filter(
    (i) =>
      !query ||
      i.member.toLowerCase().includes(query.toLowerCase()) ||
      i.responsible.toLowerCase().includes(query.toLowerCase()) ||
      i.id.toLowerCase().includes(query.toLowerCase())
  );

  const convertir = (id: string) =>
    setIndicacoes((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "convertida" as IndicStatus } : i))
    );

  const addIndicacao = () => {
    if (!form.member || !form.responsible || !form.product) return;
    const today = new Date();
    const expiry = new Date(today);
    expiry.setMonth(expiry.getMonth() + 3);
    const fmt = (d: Date) =>
      `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

    setIndicacoes((prev) => [
      {
        id: `IND-${String(prev.length + 22).padStart(3, "0")}`,
        member: form.member,
        initials: form.member.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase(),
        responsible: form.responsible,
        date: fmt(today),
        expiryDate: fmt(expiry),
        product: form.product,
        estimatedValue: 0,
        status: "pendente",
        notes: form.notes,
      },
      ...prev,
    ]);
    setForm({ member: "", responsible: "", product: "", notes: "" });
    setShowForm(false);
  };

  const counts = {
    pendente: indicacoes.filter((i) => i.status === "pendente").length,
    convertida: indicacoes.filter((i) => i.status === "convertida").length,
    expirada: indicacoes.filter((i) => i.status === "expirada").length,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <UserCheck className="size-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">Indicação de Venda</h2>
            <p className="text-sm text-muted-foreground">Responsável, produto e data de cada indicação.</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="size-3.5 mr-1.5" />
          Nova indicação
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Pendentes", value: counts.pendente, color: "text-amber-600" },
          { label: "Convertidas", value: counts.convertida, color: "text-emerald-600" },
          { label: "Expiradas", value: counts.expirada, color: "text-slate-500" },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* New form */}
      {showForm && (
        <Card className="border-primary/30 bg-primary/5 p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Membro</label>
              <Input value={form.member} onChange={(e) => setForm((p) => ({ ...p, member: e.target.value }))} placeholder="Nome do membro" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Responsável</label>
              <Select value={form.responsible} onValueChange={(val) => setForm((p) => ({ ...p, responsible: val }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar…" />
                </SelectTrigger>
                <SelectContent>
                  {RESPONSAVEIS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Produto indicado</label>
              <Input value={form.product} onChange={(e) => setForm((p) => ({ ...p, product: e.target.value }))} placeholder="Nome do produto" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Observação</label>
              <Input value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Notas opcionais" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={addIndicacao}>Registrar</Button>
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Indicações ({filtered.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input className="pl-9 w-52" placeholder="Membro, responsável…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-t border-border bg-muted/20">
              <tr className="text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Membro</th>
                <th className="px-5 py-3 font-medium">Responsável</th>
                <th className="px-5 py-3 font-medium">Produto</th>
                <th className="px-5 py-3 font-medium">Data</th>
                <th className="px-5 py-3 font-medium">Validade</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Observação</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((ind) => (
                <tr key={ind.id} className="hover:bg-muted/20">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{ind.id}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                          {ind.initials}
                        </AvatarFallback>
                      </Avatar>
                      {ind.member}
                    </div>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">{ind.responsible}</td>
                  <td className="px-5 py-3 whitespace-nowrap">{ind.product}</td>
                  <td className="px-5 py-3 tabular-nums text-xs text-muted-foreground">{ind.date}</td>
                  <td className="px-5 py-3 tabular-nums text-xs text-muted-foreground">{ind.expiryDate}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[ind.status]}`}>
                      {ind.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{ind.notes}</td>
                  <td className="px-5 py-3">
                    {ind.status === "pendente" && (
                      <Button size="sm" className="h-7 text-xs" onClick={() => convertir(ind.id)}>
                        <CheckCheck className="size-3 mr-1" />
                        Converter
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
