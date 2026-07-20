import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis,
} from "recharts";
import {
  KpiCard, Card, CardHeader, CardTitle, Button, ChartContainer, ChartTooltip,
  ChartTooltipContent, type ChartConfig, Pill, Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@kruzer/ds";
import { Sparkles, ShieldCheck, Gift, Sliders, Building2, X, ChevronRight, CheckCircle2, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { MOEDA } from "../config/programa";

// ── Types ─────────────────────────────────────────────────────────────────────

type Period = "7d" | "30d" | "90d" | "12m";
type DrillKey = "emitidos" | "resgatados" | "crescimento";

// ── Onboarding ────────────────────────────────────────────────────────────────
// Ordem reflete a jornada real de configuração: mecânica → canais → tiers → catálogo → campanha.

const SETUP_STEPS = [
  { id: "mecanica", icon: Sliders,     title: "Configure a mecânica do programa",  desc: "Taxa de acúmulo, multiplicador por tier e regras de resgate.", href: "/mecanica",       cta: "Configurar mecânica", color: "bg-sky-50 border-sky-200",        iconColor: "text-sky-600 bg-sky-100"      },
  { id: "canais",   icon: Building2,   title: "Cadastre canais e filiais",         desc: "Defina onde as vendas e eventos do programa acontecem.",       href: "/canais-filiais", cta: "Configurar canais",   color: "bg-blue-50 border-blue-200",      iconColor: "text-blue-600 bg-blue-100"    },
  { id: "tiers",    icon: ShieldCheck, title: "Configure os tiers",                desc: "Defina limiares de pontos e benefícios por nível.",            href: "/membros/tier",   cta: "Configurar tiers",    color: "bg-amber-50 border-amber-200",    iconColor: "text-amber-600 bg-amber-100"  },
  { id: "produtos", icon: TrendingUp,  title: "Cadastre produtos incentivados",    desc: "Defina quais produtos geram pontos quando comprados.",        href: "/catalogo-produtos", cta: "Configurar produtos", color: "bg-teal-50 border-teal-200",      iconColor: "text-teal-600 bg-teal-100"    },
  { id: "catalog",  icon: Gift,        title: "Adicione recompensas ao catálogo",  desc: "Cadastre os primeiros produtos para os membros resgatarem.",  href: "/catalogo",       cta: "Abrir catálogo",      color: "bg-emerald-50 border-emerald-200",iconColor: "text-emerald-600 bg-emerald-100" },
  { id: "campaign", icon: Sparkles,    title: "Crie sua primeira campanha",        desc: "Escolha um modelo e configure em menos de 5 minutos.",         href: "/campanhas/nova", cta: "Criar campanha",      color: "bg-violet-50 border-violet-200",  iconColor: "text-violet-600 bg-violet-100" },
];

const ONBOARDING_KEY = "motor_pontos_onboarding_done";

function getOnboardingDone(): string[] {
  try {
    return JSON.parse(localStorage.getItem(ONBOARDING_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveOnboardingDone(ids: string[]) {
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(ids));
}

function OnboardingCard({ onDismiss }: { onDismiss: () => void }) {
  const [done, setDone] = useState<string[]>(() => getOnboardingDone());
  const allDone = done.length === SETUP_STEPS.length;
  return (
    <Card className="border-primary/20 bg-primary/5 overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
        <div>
          <div className="font-semibold">Boas-vindas ao programa 👋</div>
          <p className="text-sm text-muted-foreground mt-0.5">Complete os 3 passos abaixo para colocar seu programa no ar.</p>
        </div>
        <button onClick={onDismiss} className="shrink-0 text-muted-foreground hover:text-foreground" aria-label="Fechar"><X className="size-4" /></button>
      </div>
      <div className="px-5 pb-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>{done.length} de {SETUP_STEPS.length} concluídos</span>
          {allDone && <span className="text-emerald-600 font-semibold">Tudo pronto!</span>}
        </div>
        <div className="h-1.5 rounded-full bg-border">
          <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${(done.length / SETUP_STEPS.length) * 100}%` }} />
        </div>
      </div>
      <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {SETUP_STEPS.map((step) => {
          const Icon = step.icon;
          const isDone = done.includes(step.id);
          return (
            <div key={step.id} className={`rounded-2xl border p-4 ${step.color} ${isDone ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${step.iconColor}`}>
                  {isDone ? <CheckCircle2 className="size-4" /> : <Icon className="size-4" />}
                </div>
                {isDone && <span className="text-[10px] font-semibold text-emerald-600">Feito</span>}
              </div>
              <div className="font-medium text-sm mb-0.5">{step.title}</div>
              <div className="text-xs text-muted-foreground mb-3">{step.desc}</div>
              {!isDone && (
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" className="h-7 text-xs flex-1">
                    <Link to={step.href}>{step.cta} <ChevronRight className="size-3 ml-1" /></Link>
                  </Button>
                  <button onClick={() => setDone(p => { const next = [...p, step.id]; saveOnboardingDone(next); return next; })} className="text-xs text-muted-foreground hover:text-foreground underline">já fiz</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── KPI data por período ───────────────────────────────────────────────────────

type KpiDef = { label: string; value: string; subtitle: string; drillKey: DrillKey | null };

const KPIS_BY_PERIOD: Record<Period, KpiDef[]> = {
  "7d": [
    { label: `${MOEDA.nome} emitidos`,        value: "287.300",  subtitle: "últimos 7d",        drillKey: "emitidos"    },
    { label: `${MOEDA.nome} resgatados`,      value: "84.200",   subtitle: "últimos 7d",        drillKey: "resgatados"  },
    { label: "Crescimento de membros", value: "+3,1%",    subtitle: "últimos 7d",        drillKey: "crescimento" },
    { label: "Níveis ativos",          value: "4",        subtitle: "Diamante a Bronze", drillKey: null          },
  ],
  "30d": [
    { label: `${MOEDA.nome} emitidos`,        value: "1.248.400", subtitle: "últimos 30d",       drillKey: "emitidos"    },
    { label: `${MOEDA.nome} resgatados`,      value: "389.200",   subtitle: "últimos 30d",       drillKey: "resgatados"  },
    { label: "Crescimento de membros", value: "+14,2%",    subtitle: "últimos 30d",       drillKey: "crescimento" },
    { label: "Níveis ativos",          value: "4",         subtitle: "Diamante a Bronze", drillKey: null          },
  ],
  "90d": [
    { label: `${MOEDA.nome} emitidos`,        value: "3.820.100", subtitle: "últimos 90d",       drillKey: "emitidos"    },
    { label: `${MOEDA.nome} resgatados`,      value: "1.142.600", subtitle: "últimos 90d",       drillKey: "resgatados"  },
    { label: "Crescimento de membros", value: "+38,7%",    subtitle: "últimos 90d",       drillKey: "crescimento" },
    { label: "Níveis ativos",          value: "4",         subtitle: "Diamante a Bronze", drillKey: null          },
  ],
  "12m": [
    { label: `${MOEDA.nome} emitidos`,        value: "14.930.000", subtitle: "últimos 12m",       drillKey: "emitidos"    },
    { label: `${MOEDA.nome} resgatados`,      value: "4.280.000",  subtitle: "últimos 12m",       drillKey: "resgatados"  },
    { label: "Crescimento de membros", value: "+172%",       subtitle: "últimos 12m",       drillKey: "crescimento" },
    { label: "Níveis ativos",          value: "4",           subtitle: "Diamante a Bronze", drillKey: null          },
  ],
};

// ── Dados de gráfico por período ──────────────────────────────────────────────

const GROWTH_BY_PERIOD: Record<Period, { x: string; members: number }[]> = {
  "7d":  [
    { x: "Seg", members: 2490 }, { x: "Ter", members: 2512 }, { x: "Qua", members: 2498 },
    { x: "Qui", members: 2531 }, { x: "Sex", members: 2558 }, { x: "Sáb", members: 2571 }, { x: "Dom", members: 2583 },
  ],
  "30d": [
    { x: "Sem 1", members: 2280 }, { x: "Sem 2", members: 2360 },
    { x: "Sem 3", members: 2430 }, { x: "Sem 4", members: 2490 },
  ],
  "90d": [
    { x: "Abr", members: 1920 }, { x: "Mai", members: 2180 }, { x: "Jun", members: 2490 },
  ],
  "12m": [
    { x: "Jan", members: 1200 }, { x: "Fev", members: 1450 }, { x: "Mar", members: 1680 },
    { x: "Abr", members: 1920 }, { x: "Mai", members: 2180 }, { x: "Jun", members: 2490 },
    { x: "Jul", members: 2583 }, { x: "Ago", members: 2700 }, { x: "Set", members: 2830 },
    { x: "Out", members: 2980 }, { x: "Nov", members: 3150 }, { x: "Dez", members: 3320 },
  ],
};

const POINTS_BY_PERIOD: Record<Period, { x: string; emitidos: number; resgatados: number }[]> = {
  "7d": [
    { x: "Seg", emitidos: 38, resgatados: 11 }, { x: "Ter", emitidos: 42, resgatados: 14 },
    { x: "Qua", emitidos: 35, resgatados: 9  }, { x: "Qui", emitidos: 48, resgatados: 15 },
    { x: "Sex", emitidos: 52, resgatados: 18 }, { x: "Sáb", emitidos: 39, resgatados: 9  }, { x: "Dom", emitidos: 33, resgatados: 8 },
  ],
  "30d": [
    { x: "Sem 1", emitidos: 210, resgatados: 64 }, { x: "Sem 2", emitidos: 248, resgatados: 78 },
    { x: "Sem 3", emitidos: 195, resgatados: 58 }, { x: "Sem 4", emitidos: 220, resgatados: 71 },
  ],
  "90d": [
    { x: "Abr", emitidos: 750, resgatados: 218 }, { x: "Mai", emitidos: 830, resgatados: 245 }, { x: "Jun", emitidos: 880, resgatados: 268 },
  ],
  "12m": [
    { x: "Jan", emitidos: 180, resgatados: 52 }, { x: "Fev", emitidos: 210, resgatados: 64 },
    { x: "Mar", emitidos: 195, resgatados: 58 }, { x: "Abr", emitidos: 230, resgatados: 71 },
    { x: "Mai", emitidos: 248, resgatados: 85 }, { x: "Jun", emitidos: 220, resgatados: 78 },
    { x: "Jul", emitidos: 260, resgatados: 90 }, { x: "Ago", emitidos: 290, resgatados: 98 },
    { x: "Set", emitidos: 275, resgatados: 88 }, { x: "Out", emitidos: 310, resgatados: 105 },
    { x: "Nov", emitidos: 380, resgatados: 128 }, { x: "Dez", emitidos: 332, resgatados: 110 },
  ],
};

// ── Drill-down data ───────────────────────────────────────────────────────────

type CampanhaRow = { nome: string; valor: string; pct: number; delta: string; up: boolean };

const DRILL_CONFIG: Record<DrillKey, { title: string; unit: string; campanhas: CampanhaRow[]; trend: { x: string; y: number }[] }> = {
  emitidos: {
    title: `${MOEDA.nome} emitidos — por campanha`,
    unit: MOEDA.abrev,
    campanhas: [
      { nome: "FastPro Verão 2025",   valor: "412.000 pts", pct: 33, delta: "+12%", up: true  },
      { nome: "Double Points Junho",  valor: "318.400 pts", pct: 25, delta: "+8%",  up: true  },
      { nome: "Parceiro Recorrente",  valor: "248.600 pts", pct: 20, delta: "+3%",  up: true  },
      { nome: "Indicação de Amigos",  valor: "186.200 pts", pct: 15, delta: "-2%",  up: false },
      { nome: "Engajamento App",      valor: "83.200 pts",  pct: 7,  delta: "+1%",  up: true  },
    ],
    trend: [
      { x: "Jan", y: 180 }, { x: "Fev", y: 210 }, { x: "Mar", y: 195 },
      { x: "Abr", y: 230 }, { x: "Mai", y: 248 }, { x: "Jun", y: 220 },
    ],
  },
  resgatados: {
    title: `${MOEDA.nome} resgatados — por campanha`,
    unit: MOEDA.abrev,
    campanhas: [
      { nome: "Resgate Eletrodomésticos", valor: "124.800 pts", pct: 32, delta: "+18%", up: true  },
      { nome: "Resgate Viagens",          valor: "97.400 pts",  pct: 25, delta: "+5%",  up: true  },
      { nome: "Cashback Pro",             valor: "74.200 pts",  pct: 19, delta: "-1%",  up: false },
      { nome: "Resgate Gift Cards",       valor: "58.600 pts",  pct: 15, delta: "+7%",  up: true  },
      { nome: "Doação Solidária",         valor: "34.200 pts",  pct: 9,  delta: "+2%",  up: true  },
    ],
    trend: [
      { x: "Jan", y: 52 }, { x: "Fev", y: 64 }, { x: "Mar", y: 58 },
      { x: "Abr", y: 71 }, { x: "Mai", y: 85 }, { x: "Jun", y: 78 },
    ],
  },
  crescimento: {
    title: "Novos membros — por origem",
    unit: "membros",
    campanhas: [
      { nome: "Orgânico (busca/direto)", valor: "1.240 membros", pct: 40, delta: "+8%",  up: true  },
      { nome: "Indicação de membros",    valor: "744 membros",   pct: 24, delta: "+15%", up: true  },
      { nome: "Campanha Parceiros",      valor: "558 membros",   pct: 18, delta: "+3%",  up: true  },
      { nome: "Email marketing",         valor: "372 membros",   pct: 12, delta: "-4%",  up: false },
      { nome: "Redes sociais",           valor: "186 membros",   pct: 6,  delta: "+1%",  up: true  },
    ],
    trend: [
      { x: "Jan", y: 1200 }, { x: "Fev", y: 1450 }, { x: "Mar", y: 1680 },
      { x: "Abr", y: 1920 }, { x: "Mai", y: 2180 }, { x: "Jun", y: 2490 },
    ],
  },
};

// Breakdown por mês (barra clicada)
const MONTH_BREAKDOWN: Record<string, { campanha: string; emitidos: number; resgatados: number }[]> = {
  Jan: [{ campanha: "Parceiro Recorrente", emitidos: 80, resgatados: 22 }, { campanha: "Indicação de Amigos", emitidos: 60, resgatados: 18 }, { campanha: "Engajamento App", emitidos: 40, resgatados: 12 }],
  Fev: [{ campanha: "Double Points Fev",  emitidos: 95, resgatados: 28 }, { campanha: "Parceiro Recorrente", emitidos: 70, resgatados: 21 }, { campanha: "Indicação de Amigos", emitidos: 45, resgatados: 15 }],
  Mar: [{ campanha: "Parceiro Recorrente", emitidos: 88, resgatados: 25 }, { campanha: "Engajamento App", emitidos: 62, resgatados: 18 }, { campanha: "Indicação de Amigos", emitidos: 45, resgatados: 15 }],
  Abr: [{ campanha: "FastPro Verão 2025", emitidos: 105, resgatados: 32 }, { campanha: "Parceiro Recorrente", emitidos: 78, resgatados: 22 }, { campanha: "Engajamento App", emitidos: 47, resgatados: 17 }],
  Mai: [{ campanha: "FastPro Verão 2025", emitidos: 118, resgatados: 40 }, { campanha: "Double Points Maio", emitidos: 82, resgatados: 28 }, { campanha: "Parceiro Recorrente", emitidos: 48, resgatados: 17 }],
  Jun: [{ campanha: "Double Points Junho", emitidos: 102, resgatados: 35 }, { campanha: "FastPro Verão 2025", emitidos: 76, resgatados: 26 }, { campanha: "Parceiro Recorrente", emitidos: 42, resgatados: 17 }],
};

const RECENT_REDEMPTIONS = [
  { id: "REQ-321", member: "Lívia R.",  status: "Concluído",        value: "1.200 pts" },
  { id: "REQ-318", member: "Paulo S.",  status: "Em processamento", value: "2.400 pts" },
  { id: "REQ-317", member: "Marina A.", status: "Aprovado",          value: "800 pts"   },
];

const statusPill: Record<string, "success" | "warning" | "primary"> = {
  Concluído:          "success",
  "Em processamento": "warning",
  Aprovado:           "primary",
};

const TIERS = [
  { tier: "Diamante", pct: 18, color: "bg-violet-500" },
  { tier: "Ouro",     pct: 26, color: "bg-amber-400"  },
  { tier: "Prata",    pct: 36, color: "bg-slate-400"  },
  { tier: "Bronze",   pct: 20, color: "bg-orange-400" },
];

// ── Liability de pontos ───────────────────────────────────────────────────────

const COST_PER_PT = 0.01; // R$ por ponto
const OUTSTANDING_PTS = 12_483_000;
const LIABILITY_BRL = OUTSTANDING_PTS * COST_PER_PT; // R$ 124.830

const LIABILITY_DELTA: Record<Period, { pct: string; brl: string; up: boolean }> = {
  "7d":  { pct: "+2,3%",  brl: "+R$ 2.811",  up: true  },
  "30d": { pct: "+8,9%",  brl: "+R$ 10.228", up: true  },
  "90d": { pct: "+22,4%", brl: "+R$ 22.870", up: true  },
  "12m": { pct: "+67,2%", brl: "+R$ 50.040", up: true  },
};

const LIABILITY_CAMPANHAS = [
  { nome: "Fidelidade Platinum", pts: 4_200_000, pct: 33.6 },
  { nome: "Lançamento Verão",    pts: 3_100_000, pct: 24.8 },
  { nome: "Compra Recorrente",   pts: 2_800_000, pct: 22.4 },
  { nome: "Fidelidade Bronze",   pts: 2_383_000, pct: 19.1 },
];

// ── Chart configs ─────────────────────────────────────────────────────────────

const GROWTH_CONFIG: ChartConfig = { members: { label: "Membros", color: "hsl(var(--primary))" } };

const POINTS_CONFIG: ChartConfig = {
  emitidos:   { label: "Emitidos (k)",   color: "hsl(var(--primary))" },
  resgatados: { label: "Resgatados (k)", color: "hsl(var(--muted-foreground))" },
};

const TREND_CONFIG: ChartConfig = { y: { label: "Valor", color: "hsl(var(--primary))" } };

const MONTH_DRILL_CONFIG: ChartConfig = {
  emitidos:   { label: "Emitidos",   color: "hsl(var(--primary))" },
  resgatados: { label: "Resgatados", color: "hsl(var(--muted-foreground))" },
};

// ── Drill Panel ───────────────────────────────────────────────────────────────

function DrillPanel({ drillKey, onClose }: { drillKey: DrillKey; onClose: () => void }) {
  const cfg = DRILL_CONFIG[drillKey];

  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      {/* panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col bg-background border-l border-border shadow-2xl overflow-y-auto">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <span className="font-semibold text-sm">{cfg.title}</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
        </div>

        <div className="flex-1 p-5 space-y-6">
          {/* Trend mini-chart */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Tendência 6 meses</p>
            <div className="rounded-lg border border-border bg-card p-3">
              <ChartContainer config={TREND_CONFIG} className="h-36 w-full">
                <LineChart data={cfg.trend} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="x" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="y" stroke="var(--color-y)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                </LineChart>
              </ChartContainer>
            </div>
          </div>

          {/* Campaign breakdown */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Detalhamento</p>
            <div className="space-y-3">
              {cfg.campanhas.map((c, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate flex-1">{c.nome}</span>
                    <span className={`flex items-center gap-0.5 text-xs font-semibold shrink-0 ${c.up ? "text-emerald-600" : "text-red-500"}`}>
                      {c.up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                      {c.delta}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${c.pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-14 text-right tabular-nums">{c.valor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

const PERIODS: { value: Period; label: string }[] = [
  { value: "7d",  label: "7d"  },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
  { value: "12m", label: "12m" },
];

export default function Dashboard() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [period,         setPeriod]         = useState<Period>("30d");
  const [drillKey,       setDrillKey]       = useState<DrillKey | null>(null);
  const [selectedMonth,  setSelectedMonth]  = useState<string | null>(null);

  const kpis        = KPIS_BY_PERIOD[period];
  const growthData  = GROWTH_BY_PERIOD[period];
  const pointsData  = POINTS_BY_PERIOD[period];
  const monthData   = selectedMonth ? MONTH_BREAKDOWN[selectedMonth] : null;

  return (
    <div className="space-y-6">
      {showOnboarding && <OnboardingCard onDismiss={() => setShowOnboarding(false)} />}

      {/* Period selector */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground font-medium">Período</span>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => { setPeriod(p.value); setSelectedMonth(null); }}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                period === p.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map(kpi => (
          <div
            key={kpi.label}
            onClick={() => kpi.drillKey && setDrillKey(kpi.drillKey)}
            className={`rounded-lg overflow-hidden transition-all ${
              kpi.drillKey
                ? "cursor-pointer ring-1 ring-transparent hover:ring-primary/30 hover:shadow-sm"
                : ""
            }`}
          >
            <KpiCard label={kpi.label} value={kpi.value} subtitle={kpi.subtitle} />
            {kpi.drillKey && (
              <div className="px-4 pb-3 -mt-1 flex items-center gap-1 text-[11px] text-primary font-medium">
                <span>Ver detalhamento</span>
                <ChevronRight className="size-3" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Growth chart + Tier distribution */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Crescimento de membros</CardTitle></CardHeader>
          <div className="px-6 pb-6">
            <ChartContainer config={GROWTH_CONFIG} className="h-64 w-full">
              <AreaChart data={growthData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="membersFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-members)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-members)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="x" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
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
            {TIERS.map(item => (
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

      {/* Points flow + Resgates recentes */}
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Fluxo de pontos</CardTitle>
                <span className="text-xs text-muted-foreground">Clique numa barra para detalhar</span>
              </div>
            </CardHeader>
            <div className="px-6 pb-6">
              <ChartContainer config={POINTS_CONFIG} className="h-52 w-full">
                <BarChart data={pointsData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="x" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="emitidos"
                    fill="var(--color-emitidos)"
                    radius={[4, 4, 0, 0]}
                    className="cursor-pointer"
                    onClick={(data: { x: string }) => setSelectedMonth(prev => prev === data.x ? null : data.x)}
                  />
                  <Bar
                    dataKey="resgatados"
                    fill="var(--color-resgatados)"
                    radius={[4, 4, 0, 0]}
                    className="cursor-pointer"
                    onClick={(data: { x: string }) => setSelectedMonth(prev => prev === data.x ? null : data.x)}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </Card>

          {/* Month breakdown — aparece ao clicar barra */}
          {monthData && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-primary/15">
                <span className="text-sm font-semibold">{selectedMonth} — campanhas</span>
                <button onClick={() => setSelectedMonth(null)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
              </div>
              <ChartContainer config={MONTH_DRILL_CONFIG} className="h-40 w-full px-4 pt-3 pb-4">
                <BarChart data={monthData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis type="category" dataKey="campanha" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={130} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="emitidos"   fill="var(--color-emitidos)"   radius={[0, 4, 4, 0]} />
                  <Bar dataKey="resgatados" fill="var(--color-resgatados)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden h-fit">
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
              {RECENT_REDEMPTIONS.map(row => (
                <TableRow key={row.id} className="[&>td]:py-3.5">
                  <TableCell className="font-mono text-xs text-muted-foreground">{row.id}</TableCell>
                  <TableCell className="text-sm">{row.member}</TableCell>
                  <TableCell><Pill color={statusPill[row.status] ?? "muted"} variant="soft" size="sm">{row.status}</Pill></TableCell>
                  <TableCell className="tabular-nums text-sm">{row.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Liability de pontos */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-muted-foreground" />
            <CardTitle>Liability de {MOEDA.nome.toLowerCase()}</CardTitle>
            <span className="ml-auto text-xs text-muted-foreground">Snapshot atual · independente do período</span>
          </div>
        </CardHeader>
        <div className="px-6 pb-6 grid gap-6 md:grid-cols-2">
          {/* Left: métricas */}
          <div className="space-y-4">
            <div>
              <p className="text-3xl font-bold tabular-nums">
                {LIABILITY_BRL.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              <p className="text-xs text-muted-foreground mt-1 tabular-nums">
                {OUTSTANDING_PTS.toLocaleString("pt-BR")} {MOEDA.abrev} em circulação · R$ {COST_PER_PT.toFixed(2)}/{MOEDA.abrev}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-0.5 text-sm font-semibold ${LIABILITY_DELTA[period].up ? "text-amber-600" : "text-emerald-600"}`}>
                {LIABILITY_DELTA[period].up
                  ? <ArrowUpRight className="size-4" />
                  : <ArrowDownRight className="size-4" />
                }
                {LIABILITY_DELTA[period].pct}
              </span>
              <span className="text-xs text-muted-foreground">({LIABILITY_DELTA[period].brl}) no período selecionado</span>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground text-sm">Como interpretar</p>
              <p>Liability crescente indica que o programa está emitindo mais do que resgatando — é o passivo financeiro do programa. Monitore junto ao custo de resgate e GMV.</p>
            </div>
          </div>
          {/* Right: breakdown por campanha */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Por campanha</p>
            {LIABILITY_CAMPANHAS.map(c => (
              <div key={c.nome} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{c.nome}</span>
                  <span className="tabular-nums text-muted-foreground shrink-0">
                    {(c.pts * COST_PER_PT).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                    <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${c.pct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-9 text-right tabular-nums">{c.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Drill panel */}
      {drillKey && <DrillPanel drillKey={drillKey} onClose={() => setDrillKey(null)} />}
    </div>
  );
}
