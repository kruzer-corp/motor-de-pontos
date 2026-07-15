import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@kruzer/ds";
import { TrendingUp, BarChart2, Users, ShoppingCart, Coins } from "lucide-react";

// ── Data ─────────────────────────────────────────────────────────────

const MONTHLY = [
  { month: "Jan", emitidos: 180, resgatados: 52, membros: 1200, roi: 2.4 },
  { month: "Fev", emitidos: 210, resgatados: 64, membros: 1450, roi: 2.7 },
  { month: "Mar", emitidos: 195, resgatados: 58, membros: 1680, roi: 2.5 },
  { month: "Abr", emitidos: 230, resgatados: 71, membros: 1920, roi: 3.1 },
  { month: "Mai", emitidos: 248, resgatados: 85, membros: 2180, roi: 3.4 },
  { month: "Jun", emitidos: 220, resgatados: 78, membros: 2490, roi: 3.0 },
];

const CHANNEL_DATA = [
  { channel: "FAST PRO", pedidos: 234, pontos: 840 },
  { channel: "App Mobile", pedidos: 189, pontos: 621 },
  { channel: "API Externa", pedidos: 87, pontos: 310 },
  { channel: "Backoffice", pedidos: 42, pontos: 98 },
];

const TIER_EVOLUTION = [
  { month: "Jan", Diamante: 120, Ouro: 210, Prata: 420, Bronze: 450 },
  { month: "Fev", Diamante: 145, Ouro: 248, Prata: 490, Bronze: 567 },
  { month: "Mar", Diamante: 162, Ouro: 270, Prata: 530, Bronze: 718 },
  { month: "Abr", Diamante: 181, Ouro: 298, Prata: 578, Bronze: 863 },
  { month: "Mai", Diamante: 204, Ouro: 321, Prata: 610, Bronze: 1045 },
  { month: "Jun", Diamante: 228, Ouro: 352, Prata: 649, Bronze: 1261 },
];

// ── Retenção, Uplift, Custo por resgate ────────────────────────────────

const RETENCAO_COORTE = [
  { mes: "M+0", pct: 100 },
  { mes: "M+1", pct: 84  },
  { mes: "M+2", pct: 71  },
  { mes: "M+3", pct: 63  },
  { mes: "M+4", pct: 57  },
  { mes: "M+5", pct: 54  },
];

const UPLIFT_DATA = [
  { grupo: "Sem programa", ticket: 168, frequencia: 2.8, receita: 470 },
  { grupo: "Com pontos",   ticket: 248, frequencia: 4.2, receita: 1042 },
];

const ROI_METRICS = [
  {
    icon: Users,
    label: "Retenção 90 dias",
    value: "63%",
    desc: "dos membros captados ainda ativos no 3° mês",
    delta: "+5pp vs. coorte anterior",
    positive: true,
  },
  {
    icon: ShoppingCart,
    label: "Uplift de receita",
    value: "+47%",
    desc: "ticket médio incentivado vs. sem programa",
    delta: "R$ 248 vs. R$ 168",
    positive: true,
  },
  {
    icon: Coins,
    label: "Custo por ponto resgatado",
    value: "R$ 0,022",
    desc: "custo médio por pt entregue como recompensa",
    delta: "-R$ 0,003 vs. período anterior",
    positive: true,
  },
];

const RETENCAO_CONFIG: ChartConfig = {
  pct: { label: "% ativos", color: "hsl(var(--primary))" },
};

const UPLIFT_CONFIG: ChartConfig = {
  receita: { label: "Receita anual / membro (R$)", color: "hsl(var(--primary))" },
};

// ── Chart configs ─────────────────────────────────────────────────────

const FLOW_CONFIG: ChartConfig = {
  emitidos: { label: "Emitidos (k pts)", color: "hsl(var(--primary))" },
  resgatados: { label: "Resgatados (k pts)", color: "hsl(var(--muted-foreground))" },
};

const ROI_CONFIG: ChartConfig = {
  roi: { label: "ROI (×)", color: "hsl(var(--primary))" },
};

const TIER_CONFIG: ChartConfig = {
  Diamante: { label: "Diamante", color: "#7c3aed" },
  Ouro: { label: "Ouro", color: "#d97706" },
  Prata: { label: "Prata", color: "#64748b" },
  Bronze: { label: "Bronze", color: "#ea580c" },
};


// ── KPIs ──────────────────────────────────────────────────────────────

const KPIS = [
  { label: "Pontos emitidos (acum.)", value: "1.283 k", delta: "+12%", positive: true },
  { label: "Pontos resgatados (acum.)", value: "408 k", delta: "+18%", positive: true },
  { label: "Taxa de resgate", value: "31,8%", delta: "+2,1pp", positive: true },
  { label: "ROI médio do programa", value: "2,85×", delta: "+0,4×", positive: true },
  { label: "Membros ativos", value: "2.490", delta: "+107%", positive: true },
  { label: "Ticket médio incentivado", value: "R$ 248", delta: "+8%", positive: true },
];

export default function DashboardResultados() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart2 className="size-5 text-muted-foreground" />
        <div>
          <h2 className="text-lg font-semibold">Dashboard de Resultados</h2>
          <p className="text-sm text-muted-foreground">Jan – Jun 2025 · atualizado diariamente</p>
        </div>
        <Badge variant="secondary" className="ml-auto">Jan–Jun/2025</Badge>
      </div>

      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {KPIS.map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <div className="text-xs text-muted-foreground">{kpi.label}</div>
            <div className="mt-1 text-2xl font-bold">{kpi.value}</div>
            <div className={`mt-0.5 flex items-center gap-1 text-xs font-medium ${kpi.positive ? "text-emerald-600" : "text-red-500"}`}>
              <TrendingUp className="size-3" />
              {kpi.delta} vs. ano anterior
            </div>
          </Card>
        ))}
      </div>

      {/* Pontos flow + ROI */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de pontos (k pts / mês)</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <ChartContainer config={FLOW_CONFIG} className="h-52 w-full">
              <BarChart data={MONTHLY} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="emitidos" fill="var(--color-emitidos)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="resgatados" fill="var(--color-resgatados)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ROI do programa (×)</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <ChartContainer config={ROI_CONFIG} className="h-52 w-full">
              <LineChart data={MONTHLY} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[2, 4]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line dataKey="roi" stroke="var(--color-roi)" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: "var(--color-roi)" }} />
              </LineChart>
            </ChartContainer>
          </div>
        </Card>
      </div>

      {/* ── Retenção, Uplift, Custo por resgate ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">ROI e Retenção</h3>
          <span className="text-xs text-muted-foreground">Coorte Jan/2026</span>
        </div>

        {/* Métricas */}
        <div className="grid gap-4 sm:grid-cols-3 mb-4">
          {ROI_METRICS.map(m => {
            const Icon = m.icon;
            return (
              <Card key={m.label} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="size-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </div>
                <div className="text-2xl font-bold tabular-nums">{m.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{m.desc}</div>
                <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${m.positive ? "text-emerald-600" : "text-red-500"}`}>
                  <TrendingUp className="size-3" />
                  {m.delta}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Curva de retenção + Uplift */}
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Curva de retenção por coorte</CardTitle>
            </CardHeader>
            <div className="px-6 pb-6">
              <ChartContainer config={RETENCAO_CONFIG} className="h-52 w-full">
                <LineChart data={RETENCAO_COORTE} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                  <ReferenceLine y={63} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 2" label={{ value: "63% (M+3)", fontSize: 10, fill: "hsl(var(--muted-foreground))", position: "right" }} />
                  <ChartTooltip content={<ChartTooltipContent formatter={(v) => [`${v}%`, "Ativos"]} />} />
                  <Line type="monotone" dataKey="pct" stroke="var(--color-pct)" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 0, fill: "var(--color-pct)" }} />
                </LineChart>
              </ChartContainer>
              <p className="text-xs text-muted-foreground mt-2">% de membros da coorte Jan/2026 ainda ativos a cada mês subsequente.</p>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Receita anual por membro</CardTitle>
            </CardHeader>
            <div className="px-6 pb-6">
              <ChartContainer config={UPLIFT_CONFIG} className="h-52 w-full">
                <BarChart data={UPLIFT_DATA} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barSize={56}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="grupo" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `R$ ${v}`} />
                  <ChartTooltip content={<ChartTooltipContent formatter={(v) => [`R$ ${v}`, "Receita/membro"]} />} />
                  <Bar dataKey="receita" fill="var(--color-receita)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
              <p className="text-xs text-muted-foreground mt-2">Estimativa: ticket médio × frequência anual de compra por tipo de membro.</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Tier evolution + Channel breakdown */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolução por tier</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <ChartContainer config={TIER_CONFIG} className="h-52 w-full">
              <AreaChart data={TIER_EVOLUTION} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                {(["Bronze", "Prata", "Ouro", "Diamante"] as const).map((tier) => (
                  <Area
                    key={tier}
                    type="monotone"
                    dataKey={tier}
                    stroke={`var(--color-${tier})`}
                    fill={`var(--color-${tier})`}
                    fillOpacity={0.15}
                    strokeWidth={1.5}
                    dot={false}
                    stackId="tiers"
                  />
                ))}
              </AreaChart>
            </ChartContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos por canal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {CHANNEL_DATA.map((row) => {
              const maxPedidos = Math.max(...CHANNEL_DATA.map((r) => r.pedidos));
              const pct = Math.round((row.pedidos / maxPedidos) * 100);
              return (
                <div key={row.channel}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{row.channel}</span>
                    <span className="tabular-nums text-muted-foreground">{row.pedidos} pedidos · {row.pontos}k pts</span>
                  </div>
                  <div className="h-2 rounded-full bg-border">
                    <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
