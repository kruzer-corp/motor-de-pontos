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
import { getMembro, MOEDA_COR, agruparSaldosPorMoeda, type Tier } from "../lib/membros";

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

  const member = getMembro(id) ?? getMembro("1")!;
  const transacoes = member.transacoes;
  const pedidos = member.pedidos;
  const ajustes = member.ajustes;
  const tierCfg = TIER_CONFIG[member.tier];
  const pontosTotal = member.saldos.filter(s => s.moeda === "Pontos").reduce((a, s) => a + s.valor, 0);

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
        <StatCard label="Saldo por carteira">
          {member.saldos.length === 0 ? (
            <span className="text-muted-foreground text-sm">Nenhum saldo</span>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5">
              {agruparSaldosPorMoeda(member.saldos).map(s => (
                <Pill key={s.moeda} color={MOEDA_COR[s.moeda] ?? "muted"} variant="soft" size="sm" dot>
                  {s.total.toLocaleString("pt-BR")} {s.abrev}
                </Pill>
              ))}
            </div>
          )}
        </StatCard>
        <StatCard label="Expiram em 30 dias">
          {member.expiram30d > 0 ? (
            <span className="tabular-nums text-amber-600">{member.expiram30d.toLocaleString("pt-BR")} pts</span>
          ) : (
            <span className="text-muted-foreground text-sm">Nenhum</span>
          )}
        </StatCard>
        <StatCard label="Tier atual">
          <Pill color={tierCfg.pill} variant="soft" size="sm">{member.tier}</Pill>
        </StatCard>
        <StatCard label="Status">
          <Badge variant={member.status === "ativo" ? "success" : "secondary"}>
            {member.status === "ativo" ? "Ativo" : member.status === "pendente" ? "Pendente" : member.status === "recusado" ? "Recusado" : "Inativo"}
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
                <TierProgress tier={member.tier} pontos={pontosTotal} />
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

          {member.expiram30d > 0 && (
            <InfoNotice variant="warning" title="Pontos próximos de expirar">
              {member.expiram30d.toLocaleString("pt-BR")} pontos expiram nos próximos 30 dias. Considere acionar uma campanha de reativação.
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
