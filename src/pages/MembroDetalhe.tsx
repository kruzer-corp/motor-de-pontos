import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Avatar, AvatarFallback, Badge, Button, Card, CardContent, CardHeader, CardTitle,
  InfoNotice, PageHeader, Pill,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Tabs, TabsContent, TabsList, TabsTrigger,
  toast,
} from "@kruzer/ds";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Clock, Plus } from "lucide-react";
import { renderCrumbLink } from "../lib/crumbLink";

// ── Types ────────────────────────────────────────────────────────────────────

type Tier = "Bronze" | "Prata" | "Ouro" | "Diamante";

type MemberFull = {
  id: string; initials: string; nome: string; cpf: string;
  email: string; telefone: string; canal: string; status: "ativo" | "inativo";
  tier: Tier; segmento: string; pontos: number; expiram: number; desde: string;
};

type Transacao = {
  id: string; data: string; descricao: string;
  tipo: "acumulo" | "resgate" | "ajuste" | "expiracao";
  valor: number; saldo: number;
};

type Pedido = {
  id: string; data: string; produto: string;
  status: "entregue" | "processando" | "cancelado"; pontos: number;
};

type Ajuste = {
  id: string; data: string; operador: string;
  motivo: string; valor: number; saldoAntes: number;
};

// ── Mock data ─────────────────────────────────────────────────────────────────

const MEMBERS: Record<string, MemberFull> = {
  "1": { id: "1", initials: "AP", nome: "Aline P.", cpf: "123.456.789-00", email: "aline.p@email.com", telefone: "(11) 99876-5432", canal: "Loja física", status: "ativo", tier: "Diamante", segmento: "Premium", pontos: 5200, expiram: 0, desde: "Abr 2025" },
  "2": { id: "2", initials: "BC", nome: "Bruno C.", cpf: "987.654.321-00", email: "bruno.c@email.com", telefone: "(21) 98765-4321", canal: "App", status: "ativo", tier: "Ouro", segmento: "Frete Grátis", pontos: 3200, expiram: 340, desde: "Jan 2025" },
  "3": { id: "3", initials: "CM", nome: "Cecília M.", cpf: "456.789.123-00", email: "cecilia.m@email.com", telefone: "(31) 97654-3210", canal: "App", status: "ativo", tier: "Prata", segmento: "Fidelidade", pontos: 1800, expiram: 120, desde: "Ago 2024" },
  "4": { id: "4", initials: "DR", nome: "Danilo R.", cpf: "321.654.987-00", email: "danilo.r@email.com", telefone: "(41) 96543-2109", canal: "Dispositivo (PDV)", status: "ativo", tier: "Bronze", segmento: "Básico", pontos: 760, expiram: 760, desde: "Mar 2025" },
};

const TRANSACOES: Record<string, Transacao[]> = {
  "1": [
    { id: "t1", data: "18/06/2025", descricao: "Compra na loja — R$ 320,00", tipo: "acumulo", valor: 320, saldo: 5200 },
    { id: "t2", data: "15/06/2025", descricao: "Resgate — Cupom 10% desconto", tipo: "resgate", valor: -500, saldo: 4880 },
    { id: "t3", data: "10/06/2025", descricao: "Compra na loja — R$ 180,00", tipo: "acumulo", valor: 180, saldo: 5380 },
    { id: "t4", data: "05/06/2025", descricao: "Ajuste manual — Campanha Dia das Mães", tipo: "ajuste", valor: 200, saldo: 5200 },
    { id: "t5", data: "01/06/2025", descricao: "Compra na loja — R$ 560,00", tipo: "acumulo", valor: 560, saldo: 5000 },
    { id: "t6", data: "28/05/2025", descricao: "Expiração por inatividade", tipo: "expiracao", valor: -120, saldo: 4440 },
    { id: "t7", data: "22/05/2025", descricao: "Compra na loja — R$ 240,00", tipo: "acumulo", valor: 240, saldo: 4560 },
  ],
  "2": [
    { id: "t1", data: "17/06/2025", descricao: "Compra no app — R$ 210,00", tipo: "acumulo", valor: 263, saldo: 3200 },
    { id: "t2", data: "12/06/2025", descricao: "Resgate — Frete grátis", tipo: "resgate", valor: -300, saldo: 2937 },
    { id: "t3", data: "08/06/2025", descricao: "Compra no app — R$ 95,00", tipo: "acumulo", valor: 119, saldo: 3237 },
    { id: "t4", data: "03/06/2025", descricao: "Ajuste manual — Erro de processamento", tipo: "ajuste", valor: 150, saldo: 3118 },
    { id: "t5", data: "25/05/2025", descricao: "Compra no app — R$ 420,00", tipo: "acumulo", valor: 525, saldo: 2968 },
  ],
  "3": [
    { id: "t1", data: "16/06/2025", descricao: "Compra no app — R$ 88,00", tipo: "acumulo", valor: 110, saldo: 1800 },
    { id: "t2", data: "10/06/2025", descricao: "Expiração de saldo inativo", tipo: "expiracao", valor: -240, saldo: 1690 },
    { id: "t3", data: "02/06/2025", descricao: "Compra no app — R$ 130,00", tipo: "acumulo", valor: 163, saldo: 1930 },
  ],
  "4": [
    { id: "t1", data: "15/06/2025", descricao: "Compra no PDV — R$ 45,00", tipo: "acumulo", valor: 45, saldo: 760 },
    { id: "t2", data: "08/06/2025", descricao: "Compra no PDV — R$ 120,00", tipo: "acumulo", valor: 120, saldo: 715 },
    { id: "t3", data: "01/06/2025", descricao: "Compra no PDV — R$ 75,00", tipo: "acumulo", valor: 75, saldo: 595 },
  ],
};

const PEDIDOS: Record<string, Pedido[]> = {
  "1": [
    { id: "PED-001", data: "15/06/2025", produto: "Cupom 10% desconto", status: "entregue", pontos: 500 },
    { id: "PED-002", data: "28/04/2025", produto: "Kit presente premium", status: "entregue", pontos: 1200 },
  ],
  "2": [
    { id: "PED-003", data: "12/06/2025", produto: "Frete grátis (voucher)", status: "processando", pontos: 300 },
  ],
  "3": [], "4": [],
};

const AJUSTES: Record<string, Ajuste[]> = {
  "1": [
    { id: "AJ-001", data: "05/06/2025", operador: "Maria Admin", motivo: "Campanha Dia das Mães — bônus manual", valor: 200, saldoAntes: 5000 },
    { id: "AJ-002", data: "14/03/2025", operador: "João Ops", motivo: "Correção de transação duplicada", valor: -150, saldoAntes: 4200 },
  ],
  "2": [
    { id: "AJ-003", data: "03/06/2025", operador: "Maria Admin", motivo: "Erro de processamento — reembolso em pontos", valor: 150, saldoAntes: 2968 },
  ],
  "3": [], "4": [],
};

// ── Tier config ───────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<Tier, { color: string; pill: "primary" | "warning" | "secondary" | "muted"; next: Tier | null; meta: number }> = {
  Bronze:   { color: "bg-orange-100 text-orange-700", pill: "muted",      next: "Prata",    meta: 1000 },
  Prata:    { color: "bg-slate-100 text-slate-700",   pill: "secondary",  next: "Ouro",     meta: 3000 },
  Ouro:     { color: "bg-amber-100 text-amber-700",   pill: "warning",    next: "Diamante", meta: 7000 },
  Diamante: { color: "bg-violet-100 text-violet-700", pill: "primary",    next: null,       meta: 0 },
};

const TIPO_CONFIG = {
  acumulo:   { label: "Acúmulo",   icon: ArrowUpRight,   color: "text-emerald-600", bg: "bg-emerald-50" },
  resgate:   { label: "Resgate",   icon: ArrowDownLeft,  color: "text-rose-600",    bg: "bg-rose-50" },
  ajuste:    { label: "Ajuste",    icon: Plus,           color: "text-sky-600",     bg: "bg-sky-50" },
  expiracao: { label: "Expiração", icon: Clock,          color: "text-slate-500",   bg: "bg-slate-50" },
};

const STATUS_CONFIG = {
  entregue:    { label: "Entregue",    variant: "success" as const },
  processando: { label: "Processando", variant: "warning" as const },
  cancelado:   { label: "Cancelado",   variant: "destructive" as const },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
        <div className="text-lg font-semibold">{children}</div>
      </CardContent>
    </Card>
  );
}

function TierProgress({ tier, pontos }: { tier: Tier; pontos: number }) {
  const cfg = TIER_CONFIG[tier];
  if (!cfg.next) {
    return (
      <div className="text-xs text-muted-foreground mt-1">
        Tier máximo atingido
      </div>
    );
  }
  const pct = Math.min(100, Math.round((pontos / cfg.meta) * 100));
  const faltam = Math.max(0, cfg.meta - pontos);
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Progresso para {cfg.next}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">Faltam {faltam.toLocaleString("pt-BR")} pts para {cfg.next}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MembroDetalhe() {
  const { id = "1" } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("visao-geral");

  const member = MEMBERS[id] ?? MEMBERS["1"];
  const transacoes = TRANSACOES[member.id] ?? [];
  const pedidos = PEDIDOS[member.id] ?? [];
  const ajustes = AJUSTES[member.id] ?? [];
  const tierCfg = TIER_CONFIG[member.tier];

  return (
    <div className="space-y-6">
      <PageHeader
        title={member.nome}
        path={[{ label: "Operação" }, { label: "Saldo dos membros", to: "/membros" }]}
        renderCrumbLink={renderCrumbLink}
        description={`CPF ${member.cpf} · ${member.canal} · Membro desde ${member.desde}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/membros")}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Voltar
            </Button>
            <Button size="sm" onClick={() => toast.info("Ajuste manual em desenvolvimento")}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Ajuste manual
            </Button>
          </div>
        }
      />

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Saldo total">
          <span className="tabular-nums">{member.pontos.toLocaleString("pt-BR")} pts</span>
        </StatCard>
        <StatCard label="Expiram em 30 dias">
          {member.expiram > 0 ? (
            <span className="tabular-nums text-amber-600">{member.expiram.toLocaleString("pt-BR")} pts</span>
          ) : (
            <span className="text-muted-foreground text-sm">Nenhum</span>
          )}
        </StatCard>
        <StatCard label="Tier atual">
          <Pill color={tierCfg.pill} variant="soft" size="sm">{member.tier}</Pill>
        </StatCard>
        <StatCard label="Status">
          <Badge variant={member.status === "ativo" ? "success" : "secondary"}>
            {member.status === "ativo" ? "Ativo" : "Inativo"}
          </Badge>
        </StatCard>
      </div>

      {/* ── Tabs ── */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
          <TabsTrigger value="extrato">Extrato ({transacoes.length})</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos ({pedidos.length})</TabsTrigger>
          <TabsTrigger value="ajustes">Ajustes ({ajustes.length})</TabsTrigger>
        </TabsList>

        {/* ── Visão geral ── */}
        <TabsContent value="visao-geral" className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Identidade */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  { label: "CPF",    value: member.cpf },
                  { label: "E-mail", value: member.email },
                  { label: "Fone",   value: member.telefone },
                  { label: "Canal",  value: member.canal },
                  { label: "Segmento", value: member.segmento },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground shrink-0">{label}</span>
                    <span className="font-medium text-right truncate">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tier */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Tier e progressão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className={`text-sm font-bold ${tierCfg.color}`}>
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{member.nome}</p>
                    <Pill color={tierCfg.pill} variant="soft" size="sm">{member.tier}</Pill>
                  </div>
                </div>
                <TierProgress tier={member.tier} pontos={member.pontos} />
              </CardContent>
            </Card>
          </div>

          {/* Últimas transações inline */}
          {transacoes.length > 0 && (
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Últimas transações</CardTitle>
                <button
                  className="text-xs text-primary hover:underline"
                  onClick={() => setTab("extrato")}
                >
                  Ver extrato completo
                </button>
              </CardHeader>
              <div className="divide-y divide-border">
                {transacoes.slice(0, 4).map((t) => {
                  const cfg = TIPO_CONFIG[t.tipo];
                  const Icon = cfg.icon;
                  return (
                    <div key={t.id} className="flex items-center gap-3 px-6 py-3.5">
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${cfg.bg}`}>
                        <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{t.descricao}</p>
                        <p className="text-xs text-muted-foreground">{t.data}</p>
                      </div>
                      <span className={`text-sm font-semibold tabular-nums shrink-0 ${t.valor >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {t.valor >= 0 ? "+" : ""}{t.valor.toLocaleString("pt-BR")} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {member.expiram > 0 && (
            <InfoNotice variant="warning" title="Pontos próximos de expirar">
              {member.expiram.toLocaleString("pt-BR")} pontos expiram nos próximos 30 dias. Considere acionar uma campanha de reativação.
            </InfoNotice>
          )}
        </TabsContent>

        {/* ── Extrato ── */}
        <TabsContent value="extrato" className="mt-5">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transacoes.map((t) => {
                  const cfg = TIPO_CONFIG[t.tipo];
                  const Icon = cfg.icon;
                  return (
                    <TableRow key={t.id} className="[&>td]:py-3.5">
                      <TableCell className="text-muted-foreground tabular-nums text-sm">{t.data}</TableCell>
                      <TableCell className="font-medium text-sm">{t.descricao}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
                          <Icon className="h-3 w-3" />{cfg.label}
                        </span>
                      </TableCell>
                      <TableCell className={`text-right tabular-nums font-semibold text-sm ${t.valor >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {t.valor >= 0 ? "+" : ""}{t.valor.toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                        {t.saldo.toLocaleString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── Pedidos ── */}
        <TabsContent value="pedidos" className="mt-5">
          {pedidos.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <p className="text-sm text-muted-foreground">Nenhum pedido de resgate ainda.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Produto / recompensa</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Pts utilizados</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidos.map((p) => (
                    <TableRow key={p.id} className="[&>td]:py-3.5">
                      <TableCell className="font-mono text-xs text-muted-foreground">{p.id}</TableCell>
                      <TableCell className="font-medium text-sm">{p.produto}</TableCell>
                      <TableCell className="text-muted-foreground text-sm tabular-nums">{p.data}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_CONFIG[p.status].variant} className="text-xs">
                          {STATUS_CONFIG[p.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-semibold text-sm text-rose-600">
                        -{p.pontos.toLocaleString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ── Ajustes ── */}
        <TabsContent value="ajustes" className="mt-5 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={() => toast.info("Ajuste manual em desenvolvimento")}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Novo ajuste
            </Button>
          </div>

          {ajustes.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <p className="text-sm text-muted-foreground">Nenhum ajuste manual registrado.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Operador</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead className="text-right">Saldo antes</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ajustes.map((a) => (
                    <TableRow key={a.id} className="[&>td]:py-3.5">
                      <TableCell className="text-muted-foreground tabular-nums text-sm">{a.data}</TableCell>
                      <TableCell className="text-sm">{a.operador}</TableCell>
                      <TableCell className="text-sm max-w-xs truncate">{a.motivo}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground text-sm">
                        {a.saldoAntes.toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell className={`text-right tabular-nums font-semibold text-sm ${a.valor >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {a.valor >= 0 ? "+" : ""}{a.valor.toLocaleString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
