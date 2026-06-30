import { useState } from "react";
import { Card, Button, Input, Avatar, AvatarFallback, InfoNotice, PageHeader, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@kruzer/ds";
import { Plus, Search, CheckCheck } from "lucide-react";

type IndicStatus = "pendente" | "convertida" | "expirada" | "cancelada";

type Indicacao = {
  id: string;
  indicado: string;
  initials: string;
  indicadoPor: string;
  indicadoPorInitials: string;
  date: string;
  expiryDate: string;
  status: IndicStatus;
  notes: string;
};

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
  { id: "IND-021", indicado: "Rafael L.",  initials: "RL", indicadoPor: "Aline P.",   indicadoPorInitials: "AP", date: "10/06/2025", expiryDate: "10/09/2025", status: "pendente",   notes: "Convidado pela Aline via link do app." },
  { id: "IND-020", indicado: "Paula S.",   initials: "PS", indicadoPor: "Bruno C.",   indicadoPorInitials: "BC", date: "05/06/2025", expiryDate: "05/09/2025", status: "convertida", notes: "Primeira compra realizada em 12/06/2025." },
  { id: "IND-019", indicado: "Marcos A.",  initials: "MA", indicadoPor: "Cecília M.", indicadoPorInitials: "CM", date: "01/06/2025", expiryDate: "01/09/2025", status: "convertida", notes: "Cadastro e compra via app." },
  { id: "IND-018", indicado: "Letícia F.", initials: "LF", indicadoPor: "Danilo R.",  indicadoPorInitials: "DR", date: "15/05/2025", expiryDate: "15/08/2025", status: "expirada",   notes: "Sem cadastro após 3 meses." },
  { id: "IND-017", indicado: "Carlos B.",  initials: "CB", indicadoPor: "Aline P.",   indicadoPorInitials: "AP", date: "20/05/2025", expiryDate: "20/08/2025", status: "cancelada",  notes: "Indicado cancelou o interesse." },
];

type NewForm = {
  indicado: string; indicadoPor: string;
  email: string; telefone: string; canal: string; notes: string;
};

export default function IndicacaoVenda() {
  const [indicacoes, setIndicacoes] = useState(INDICACOES);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewForm>({ indicado: "", indicadoPor: "", email: "", telefone: "", canal: "", notes: "" });

  const filtered = indicacoes.filter(
    (i) =>
      !query ||
      i.indicado.toLowerCase().includes(query.toLowerCase()) ||
      i.indicadoPor.toLowerCase().includes(query.toLowerCase()) ||
      i.id.toLowerCase().includes(query.toLowerCase())
  );

  const converter = (id: string) =>
    setIndicacoes((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "convertida" as IndicStatus } : i))
    );

  const addIndicacao = () => {
    if (!form.indicado || !form.indicadoPor) return;
    const today = new Date();
    const expiry = new Date(today);
    expiry.setMonth(expiry.getMonth() + 3);
    const fmt = (d: Date) =>
      `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

    setIndicacoes((prev) => [
      {
        id: `IND-${String(prev.length + 22).padStart(3, "0")}`,
        indicado: form.indicado,
        initials: form.indicado.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase(),
        indicadoPor: form.indicadoPor,
        indicadoPorInitials: form.indicadoPor.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase(),
        date: fmt(today),
        expiryDate: fmt(expiry),
        status: "pendente",
        notes: form.notes,
      },
      ...prev,
    ]);
    setForm({ indicado: "", indicadoPor: "", email: "", telefone: "", canal: "", notes: "" });
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
        Quando um membro indica outro e o indicado faz a primeira compra, o indicador recebe pontos de bônus conforme a regra da campanha de indicação ativa.
        Membros participam pelo canal próprio — aqui você acompanha e gerencia o histórico.
      </InfoNotice>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Pendentes",   value: counts.pendente,   color: "text-amber-600" },
          { label: "Convertidas", value: counts.convertida, color: "text-emerald-600" },
          { label: "Expiradas",   value: counts.expirada,   color: "text-slate-500" },
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
          <p className="text-sm font-medium mb-3">Nova indicação manual</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Membro indicado <span className="text-destructive">*</span></label>
              <Input value={form.indicado} onChange={(e) => setForm((p) => ({ ...p, indicado: e.target.value }))} placeholder="Nome do novo membro" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Indicado por <span className="text-destructive">*</span></label>
              <Input value={form.indicadoPor} onChange={(e) => setForm((p) => ({ ...p, indicadoPor: e.target.value }))} placeholder="Nome do membro indicador" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">E-mail do indicado</label>
              <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="email@exemplo.com" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Telefone</label>
              <Input value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))} placeholder="(11) 99999-0000" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Canal de origem</label>
              <Select value={form.canal} onValueChange={(v) => setForm((p) => ({ ...p, canal: v }))}>
                <SelectTrigger><SelectValue placeholder="Como foi indicado?" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="app">App</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="link">Link compartilhado</SelectItem>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Observação</label>
              <Input value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Notas opcionais" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={addIndicacao} disabled={!form.indicado || !form.indicadoPor}>Registrar</Button>
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </Card>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
          <span className="text-sm font-medium">Indicações ({filtered.length})</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input className="pl-8 w-52 h-8 text-sm" placeholder="Membro ou indicador…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-muted/20">
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="px-4 py-3 font-medium text-xs">ID</th>
              <th className="px-4 py-3 font-medium text-xs">Membro indicado</th>
              <th className="px-4 py-3 font-medium text-xs">Indicado por</th>
              <th className="px-4 py-3 font-medium text-xs">Data</th>
              <th className="px-4 py-3 font-medium text-xs">Validade</th>
              <th className="px-4 py-3 font-medium text-xs">Status</th>
              <th className="px-4 py-3 font-medium text-xs">Observação</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((ind) => (
              <tr key={ind.id} className="hover:bg-muted/20">
                <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{ind.id}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">{ind.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{ind.indicado}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-bold">{ind.indicadoPorInitials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{ind.indicadoPor}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 tabular-nums text-xs text-muted-foreground">{ind.date}</td>
                <td className="px-4 py-3.5 tabular-nums text-xs text-muted-foreground">{ind.expiryDate}</td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[ind.status]}`}>
                    {STATUS_LABEL[ind.status]}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-xs text-muted-foreground max-w-[180px] truncate">{ind.notes}</td>
                <td className="px-4 py-3.5">
                  {ind.status === "pendente" && (
                    <Button size="sm" className="h-7 text-xs" onClick={() => converter(ind.id)}>
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
    </div>
  );
}
