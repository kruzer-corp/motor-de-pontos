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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@kruzer-corp/ds";

const KPIS = [
  { label: "Pontos emitidos", value: "1.248.400", subtitle: "30d" },
  { label: "Pontos resgatados", value: "389.200", subtitle: "30d" },
  { label: "Crescimento de membros", value: "+14,2%", subtitle: "últimos 30d" },
  { label: "Níveis ativos", value: "4", subtitle: "Diamante a Bronze" },
];

const TIERS = [
  { tier: "Diamante", pct: 18, color: "bg-violet-500" },
  { tier: "Ouro", pct: 26, color: "bg-amber-400" },
  { tier: "Prata", pct: 36, color: "bg-slate-400" },
  { tier: "Bronze", pct: 20, color: "bg-orange-400" },
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
  emitidos: { label: "Emitidos (k)", color: "hsl(var(--primary))" },
  resgatados: { label: "Resgatados (k)", color: "hsl(var(--muted-foreground))" },
};

const RECENT_REDEMPTIONS = [
  { id: "REQ-321", member: "Lívia R.", status: "Concluído", value: "1.200 pts" },
  { id: "REQ-318", member: "Paulo S.", status: "Em processamento", value: "2.400 pts" },
  { id: "REQ-317", member: "Marina A.", status: "Aprovado", value: "800 pts" },
];

const statusColor: Record<string, string> = {
  Concluído: "bg-emerald-100 text-emerald-700",
  "Em processamento": "bg-amber-100 text-amber-700",
  Aprovado: "bg-sky-100 text-sky-700",
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} subtitle={kpi.subtitle} />
        ))}
      </div>

      {/* Growth chart + Tier distribution */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Crescimento de membros</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <ChartContainer config={GROWTH_CONFIG} className="h-64 w-full">
              <AreaChart data={GROWTH_DATA} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="membersFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-members)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-members)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="members"
                  stroke="var(--color-members)"
                  strokeWidth={2}
                  fill="url(#membersFill)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de tiers</CardTitle>
          </CardHeader>
          <div className="space-y-4 px-6 pb-6">
            {TIERS.map((item) => (
              <div key={item.tier}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-foreground">{item.tier}</span>
                  <span className="text-muted-foreground">{item.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-border">
                  <div
                    className={`h-2 rounded-full transition-all ${item.color}`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Points flow + Recent redemptions */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de pontos</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <ChartContainer config={POINTS_CONFIG} className="h-52 w-full">
              <BarChart data={POINTS_DATA} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="emitidos" fill="var(--color-emitidos)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resgatados" fill="var(--color-resgatados)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resgates recentes</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto px-6 pb-6">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Pedido</th>
                  <th className="pb-3 font-medium">Membro</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border border-t border-border">
                {RECENT_REDEMPTIONS.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/30">
                    <td className="py-3 font-mono text-xs text-muted-foreground">{row.id}</td>
                    <td className="py-3">{row.member}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          statusColor[row.status] || "bg-muted text-foreground"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 tabular-nums">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
