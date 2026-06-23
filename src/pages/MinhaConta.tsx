import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Textarea,
  Avatar,
  AvatarFallback,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@kruzer/ds";
import { Pencil, Download, CheckCheck, X, FileText, User } from "lucide-react";

// ── Mock member selector ─────────────────────────────────────────────

const MEMBERS = [
  { id: "MBR-00312", name: "Aline P.", email: "aline.p@email.com", phone: "(11) 98800-0001", cpf: "***.***.001-91", tier: "Diamante", balance: 5200 },
  { id: "MBR-00210", name: "Bruno C.", email: "bruno.c@email.com", phone: "(11) 98800-0002", cpf: "***.***.002-82", tier: "Ouro", balance: 3200 },
  { id: "MBR-00445", name: "Cecília M.", email: "cecilia.m@email.com", phone: "(11) 98800-0003", cpf: "***.***.003-73", tier: "Prata", balance: 1800 },
];

// ── Income reports mock ──────────────────────────────────────────────

const INFORMES = [
  { year: 2025, period: "Jan–Jun/2025", totalPts: 8400, totalValue: 840, docType: "RPA", status: "disponível" },
  { year: 2024, period: "2024", totalPts: 22300, totalValue: 2230, docType: "RPA", status: "disponível" },
  { year: 2023, period: "2023", totalPts: 14800, totalValue: 1480, docType: "RPA", status: "disponível" },
];

// ── Member redemptions ───────────────────────────────────────────────

const RESGATES = [
  { id: "REQ-510", reward: "Air Fryer XL", status: "Aprovado", points: "18.000", date: "13/06/2025" },
  { id: "REQ-489", reward: "Voucher R$50", status: "Concluído", points: "1.200", date: "05/06/2025" },
  { id: "REQ-421", reward: "Frete Grátis", status: "Concluído", points: "800", date: "10/04/2025" },
  { id: "REQ-380", reward: "Cupom 10%", status: "Cancelado", points: "650", date: "22/02/2025" },
];

const STATUS_COLOR: Record<string, string> = {
  Aprovado: "bg-violet-100 text-violet-700",
  Concluído: "bg-emerald-100 text-emerald-700",
  Cancelado: "bg-slate-100 text-slate-500",
  "Em Análise": "bg-amber-100 text-amber-700",
  Rejeitado: "bg-red-100 text-red-600",
};

const tierColor: Record<string, string> = {
  Diamante: "bg-violet-100 text-violet-700",
  Ouro: "bg-amber-100 text-amber-700",
  Prata: "bg-slate-100 text-slate-700",
  Bronze: "bg-orange-100 text-orange-700",
};

// ── Meus Dados ───────────────────────────────────────────────────────

function MeusDados({ member }: { member: typeof MEMBERS[0] }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: member.name, email: member.email, phone: member.phone, bio: "" });

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Dados pessoais</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
              {editing ? <><X className="size-3.5 mr-1.5" />Cancelar</> : <><Pencil className="size-3.5 mr-1.5" />Editar</>}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {member.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-base font-semibold">{member.name}</div>
              <div className="text-xs text-muted-foreground font-mono">{member.id}</div>
              <span className={`inline-flex mt-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tierColor[member.tier]}`}>
                {member.tier}
              </span>
            </div>
            <div className="ml-auto text-right">
              <div className="text-2xl font-bold tabular-nums text-primary">{member.balance.toLocaleString("pt-BR")}</div>
              <div className="text-xs text-muted-foreground">pts disponíveis</div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Nome completo", key: "name" as const },
              { label: "E-mail", key: "email" as const },
              { label: "Telefone", key: "phone" as const },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-xs text-muted-foreground mb-1">{label}</label>
                {editing ? (
                  <Input
                    value={form[key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  />
                ) : (
                  <div className="rounded-xl bg-muted/30 px-3 py-2 text-sm">{form[key]}</div>
                )}
              </div>
            ))}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">CPF (mascarado)</label>
              <div className="rounded-xl bg-muted/30 px-3 py-2 text-sm font-mono">{member.cpf}</div>
            </div>
          </div>

          {editing && (
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Observação interna</label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Anotações visíveis apenas para o admin…"
                rows={2}
              />
            </div>
          )}

          {editing && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setEditing(false)}>
                <CheckCheck className="size-3.5 mr-1.5" />
                Salvar alterações
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Informes de Rendimento ───────────────────────────────────────────

function InformesRendimento() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-sky-50 border border-sky-200 px-4 py-3 text-sm text-sky-800">
        <strong>Informe de Rendimentos</strong> — Documento fiscal exigido pela Receita Federal para
        declaração de imposto de renda. Inclui créditos recebidos via RPA.
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Documentos disponíveis</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-t border-border bg-muted/20">
              <tr className="text-left text-muted-foreground">
                <th className="px-6 py-3 font-medium">Período</th>
                <th className="px-6 py-3 font-medium">Total resgatado</th>
                <th className="px-6 py-3 font-medium">Valor (R$)</th>
                <th className="px-6 py-3 font-medium">Tipo doc.</th>
                <th className="px-6 py-3 font-medium">Situação</th>
                <th className="px-6 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {INFORMES.map((inf) => (
                <tr key={inf.year} className="hover:bg-muted/20">
                  <td className="px-6 py-3 font-medium">{inf.period}</td>
                  <td className="px-6 py-3 tabular-nums">{inf.totalPts.toLocaleString("pt-BR")} pts</td>
                  <td className="px-6 py-3 tabular-nums">
                    {inf.totalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant="outline" className="font-mono text-xs">{inf.docType}</Badge>
                  </td>
                  <td className="px-6 py-3">
                    <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700">
                      {inf.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      <Download className="size-3 mr-1" />
                      Baixar PDF
                    </Button>
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

// ── Meus Resgates ────────────────────────────────────────────────────

function MeusResgates() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de resgates do membro</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-t border-border bg-muted/20">
            <tr className="text-left text-muted-foreground">
              <th className="px-6 py-3 font-medium">Pedido</th>
              <th className="px-6 py-3 font-medium">Resgate</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Pontos</th>
              <th className="px-6 py-3 font-medium">Data</th>
              <th className="px-6 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {RESGATES.map((r) => (
              <tr key={r.id} className="hover:bg-muted/20">
                <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{r.id}</td>
                <td className="px-6 py-3 font-medium">{r.reward}</td>
                <td className="px-6 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[r.status] || "bg-muted"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-right tabular-nums">{r.points} pts</td>
                <td className="px-6 py-3 text-muted-foreground tabular-nums">{r.date}</td>
                <td className="px-6 py-3 text-right">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <FileText className="size-3 mr-1" />
                    Detalhe
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ── Main page ────────────────────────────────────────────────────────

export default function MinhaConta() {
  const [memberId, setMemberId] = useState(MEMBERS[0].id);
  const member = MEMBERS.find((m) => m.id === memberId) ?? MEMBERS[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <User className="size-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">Minha Conta</h2>
            <p className="text-sm text-muted-foreground">Dados, informes e resgates do membro.</p>
          </div>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Visualizando membro</label>
          <Select value={memberId} onValueChange={setMemberId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione…" />
            </SelectTrigger>
            <SelectContent>
              {MEMBERS.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name} ({m.id})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="dados">
        <TabsList>
          <TabsTrigger value="dados">Meus Dados</TabsTrigger>
          <TabsTrigger value="informes">Informes de Rendimento</TabsTrigger>
          <TabsTrigger value="resgates">Meus Resgates</TabsTrigger>
        </TabsList>
        <TabsContent value="dados" className="mt-4">
          <MeusDados member={member} />
        </TabsContent>
        <TabsContent value="informes" className="mt-4">
          <InformesRendimento />
        </TabsContent>
        <TabsContent value="resgates" className="mt-4">
          <MeusResgates />
        </TabsContent>
      </Tabs>
    </div>
  );
}
