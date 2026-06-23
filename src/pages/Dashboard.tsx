import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  KpiCard,
  Card,
  CardHeader,
  CardTitle,
  Button,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
  Pill,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kruzer/ds";
import { Sparkles, ShieldCheck, Gift, X, ChevronRight, CheckCircle2 } from "lucide-react";

// ── Onboarding ────────────────────────────────────────────────────────

const SETUP_STEPS = [
  {
    id: "campaign",
    icon: Sparkles,
    title: "Crie sua primeira campanha",
    desc: "Escolha um modelo e configure em menos de 5 minutos.",
    href: "/campanhas/nova",
    cta: "Criar campanha",
    color: "bg-violet-50 border-violet-200",
    iconColor: "text-violet-600 bg-violet-100",
  },
  {
    id: "tiers",
    icon: ShieldCheck,
    title: "Configure os tiers",
    desc: "Defina limiares de pontos e benefícios por nível.",
    href: "/membros/tier",
    cta: "Configurar tiers",
    color: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-600 bg-amber-100",
  },
  {
    id: "catalog",
    icon: Gift,
    title: "Adicione recompensas ao catálogo",
    desc: "Cadastre os primeiros produtos para os membros resgatarem.",
    href: "/catalogo",
    cta: "Abrir catálogo",
    color: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-600 bg-emerald-100",
  },
];

function OnboardingCard({ onDismiss }: { onDismiss: () => void }) {
  const [done, setDone] = useState<string[]>([]);
  const allDone = done.length === SETUP_STEPS.length;

  return (
    <Card className="border-primary/20 bg-primary/5 overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
        <div>
          <div className="font-semibold">Boas-vindas ao programa 👋</div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Complete os 3 passos abaixo para colocar seu programa no ar.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Fechar"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>{done.length} de {SETUP_STEPS.length} concluídos</span>
          {allDone && <span className="text-emerald-600 font-semibold">Tudo pronto!</span>}
        </div>
        <div className="h-1.5 rounded-full bg-border">
          <div
            className="h-1.5 rounded-full bg-primary transition-all"
            style={{ width: `${(done.length / SETUP_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid gap-3 px-5 pb-5 sm:grid-cols-3">
        {SETUP_STEPS.map((step) => {
          const Icon = step.icon;
          const isDone = done.includes(step.id);
          return (
            <div key={step.id} className={`rounded-2xl border p-4 ${step.color} ${isDone ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${step.iconColor}`}>
                  {isDone ? <CheckCircle2 className="size-4" /> : <Icon className="size-4" />}
                </div>
                {isDone && (
                  <span className="text-[10px] font-semibold text-emerald-600">Feito</span>
                )}
              </div>
              <div className="font-medium text-sm mb-0.5">{step.title}</div>
              <div className="text-xs text-muted-foreground mb-3">{step.desc}</div>
              {!isDone && (
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" className="h-7 text-xs flex-1">
                    <Link to={step.href}>{step.cta} <ChevronRight className="size-3 ml-1" /></Link>
                  </Button>
                  <button
                    onClick={() => setDone((p) => [...p, step.id])}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    já fiz
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Dashboard data ────────────────────────────────────────────────────

const KPIS = [
  { label: "Pontos emitidos", value: "1.248.400", subtitle: "30d" },
  { label: "Pontos resgatados", value: "389.200", subtitle: "30d" },
  { label: "Crescimento de membros", value: "+14,2%", subtitle: "últimos 30d" },
  { label: "Níveis ativos", value: "4", subtitle: "Diamante a Bronze" },
];

const TIERS = [
  { tier: "Diamante", pct: 18, color: "bg-violet-500" },
  { tier: "Ouro",     pct: 26, color: "bg-amber-400" },
  { tier: "Prata",    pct: 36, color: "bg-slate-400" },
  { tier: "Bronze",   pct: 20, color: "bg-orange-400" },
];

const GROWTH_DATA = [
  { month: "Jan", members: 1200 },
  { month: "Fev", members: 1450 },
  { month: "Mar", members: 1680 },
  { month: "Abr", members: 1920 },
  { month: "Mai", members: 2180 },
  { month: "Jun", members: 2490 },
];

const GROWTH_CONFIG: ChartConfig = {
  members: { label: "Membros", color: "hsl(var(--primary))" },
};

const POINTS_DATA = [
  { month: "Jan", emitidos: 180, resgatados: 52 },
  { month: "Fev", emitidos: 210, resgatados: 64 },
  { month: "Mar", emitidos: 195, resgatados: 58 },
  { month: "Abr", emitidos: 230, resgatados: 71 },
  { month: "Mai", emitidos: 248, resgatados: 85 },
  { month: "Jun", emitidos: 220, resgatados: 78 },
];

const POINTS_CONFIG: ChartConfig = {
  emitidos:   { label: "Emitidos (k)",   color: "hsl(var(--primary))" },
  resgatados: { label: "Resgatados (k)", color: "hsl(var(--muted-foreground))" },
};

const RECENT_REDEMPTIONS = [
  { id: "REQ-321", member: "Lívia R.",  status: "Concluído",       value: "1.200 pts" },
  { id: "REQ-318", member: "Paulo S.",  status: "Em processamento",value: "2.400 pts" },
  { id: "REQ-317", member: "Marina A.", status: "Aprovado",         value: "800 pts" },
];

const statusPill: Record<string, "success" | "warning" | "primary"> = {
  Concluído:          "success",
  "Em processamento": "warning",
  Aprovado:           "primary",
};

// ── Component ─────────────────────────────────────────────────────────

export default function Dashboard() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  return (
    <div className="space-y-6">
      {/* Onboarding — dismissível */}
      {showOnboarding && (
        <OnboardingCard onDismiss={() => setShowOnboarding(false)} />
      )}

      {/* KPI row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} subtitle={kpi.subtitle} />
        ))}
      </div>

      {/* Growth chart + Tier distribution */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Crescimento de membros</CardTitle></CardHeader>
          <div className="px-6 pb-6">
            <ChartContainer config={GROWTH_CONFIG} className="h-64 w-full">
              <AreaChart data={GROWTH_DATA} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="membersFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-members)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-members)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="members" stroke="var(--color-members)" strokeWidth={2} fill="url(#membersFill)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ChartContainer>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Distribuição de tiers</CardTitle></CardHeader>
          <div className="space-y-4 px-6 pb-6">
            {TIERS.map((item) => (
              <div key={item.tier}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span>{item.tier}</span>
                  <span className="text-muted-foreground">{item.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-border">
                  <div className={`h-2 rounded-full transition-all ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Points flow + Recent redemptions */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Fluxo de pontos</CardTitle></CardHeader>
          <div className="px-6 pb-6">
            <ChartContainer config={POINTS_CONFIG} className="h-52 w-full">
              <BarChart data={POINTS_DATA} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="emitidos"   fill="var(--color-emitidos)"   radius={[4, 4, 0, 0]} />
                <Bar dataKey="resgatados" fill="var(--color-resgatados)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        </Card>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold">Resgates recentes</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Membro</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RECENT_REDEMPTIONS.map((row) => (
                <TableRow key={row.id} className="[&>td]:py-3.5">
                  <TableCell className="font-mono text-xs text-muted-foreground">{row.id}</TableCell>
                  <TableCell className="text-sm">{row.member}</TableCell>
                  <TableCell>
                    <Pill color={statusPill[row.status] ?? "muted"} variant="soft" size="sm">{row.status}</Pill>
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">{row.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
