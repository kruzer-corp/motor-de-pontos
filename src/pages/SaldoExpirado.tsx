import { useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, XAxis, YAxis,
} from "recharts";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
  PageHeader, Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@kruzer/ds";
import { renderCrumbLink } from "../lib/crumbLink";
import { MOEDA } from "../config/programa";

type Period = "3m" | "6m" | "12m";

type ExpiredRow = {
  mesKey: string;   // "2026-07" para ordenação
  mesLabel: string; // "Jul/2026"
  campanha: string;
  membros: number;
  pts: number;
};

const ALL_ROWS: ExpiredRow[] = [
  // Jul/2026
  { mesKey: "2026-07", mesLabel: "Jul/2026", campanha: "Fidelidade Bronze",   membros: 18, pts: 2100 },
  { mesKey: "2026-07", mesLabel: "Jul/2026", campanha: "Compra Recorrente",   membros:  7, pts: 2000 },
  // Jun/2026
  { mesKey: "2026-06", mesLabel: "Jun/2026", campanha: "Lançamento Verão",    membros: 24, pts: 4800 },
  { mesKey: "2026-06", mesLabel: "Jun/2026", campanha: "Fidelidade Platinum", membros: 15, pts: 3900 },
  { mesKey: "2026-06", mesLabel: "Jun/2026", campanha: "Fidelidade Bronze",   membros: 31, pts: 2500 },
  // Mai/2026
  { mesKey: "2026-05", mesLabel: "Mai/2026", campanha: "Fidelidade Platinum", membros: 28, pts: 7200 },
  { mesKey: "2026-05", mesLabel: "Mai/2026", campanha: "Lançamento Verão",    membros: 19, pts: 5400 },
  { mesKey: "2026-05", mesLabel: "Mai/2026", campanha: "Compra Recorrente",   membros: 22, pts: 4100 },
  { mesKey: "2026-05", mesLabel: "Mai/2026", campanha: "Fidelidade Bronze",   membros: 41, pts: 2200 },
  // Abr/2026
  { mesKey: "2026-04", mesLabel: "Abr/2026", campanha: "Compra Recorrente",   membros: 12, pts: 3800 },
  { mesKey: "2026-04", mesLabel: "Abr/2026", campanha: "Fidelidade Bronze",   membros: 22, pts: 2600 },
  // Mar/2026
  { mesKey: "2026-03", mesLabel: "Mar/2026", campanha: "Fidelidade Platinum", membros: 32, pts: 8300 },
  { mesKey: "2026-03", mesLabel: "Mar/2026", campanha: "Lançamento Verão",    membros: 28, pts: 4200 },
  { mesKey: "2026-03", mesLabel: "Mar/2026", campanha: "Compra Recorrente",   membros: 18, pts: 3300 },
  // Fev/2026
  { mesKey: "2026-02", mesLabel: "Fev/2026", campanha: "Fidelidade Bronze",   membros: 38, pts: 4900 },
  { mesKey: "2026-02", mesLabel: "Fev/2026", campanha: "Fidelidade Platinum", membros: 22, pts: 3300 },
  // Jan/2026
  { mesKey: "2026-01", mesLabel: "Jan/2026", campanha: "Lançamento Verão",    membros: 31, pts: 5600 },
  { mesKey: "2026-01", mesLabel: "Jan/2026", campanha: "Compra Recorrente",   membros: 25, pts: 4200 },
  { mesKey: "2026-01", mesLabel: "Jan/2026", campanha: "Fidelidade Platinum", membros: 18, pts: 2600 },
  // Dez/2025
  { mesKey: "2025-12", mesLabel: "Dez/2025", campanha: "Fidelidade Platinum", membros: 19, pts: 6100 },
  { mesKey: "2025-12", mesLabel: "Dez/2025", campanha: "Fidelidade Bronze",   membros: 44, pts: 3800 },
  { mesKey: "2025-12", mesLabel: "Dez/2025", campanha: "Compra Recorrente",   membros: 27, pts: 2900 },
  // Nov/2025
  { mesKey: "2025-11", mesLabel: "Nov/2025", campanha: "Lançamento Verão",    membros: 22, pts: 4400 },
  { mesKey: "2025-11", mesLabel: "Nov/2025", campanha: "Fidelidade Platinum", membros: 16, pts: 3200 },
  { mesKey: "2025-11", mesLabel: "Nov/2025", campanha: "Fidelidade Bronze",   membros: 35, pts: 2600 },
  // Out/2025
  { mesKey: "2025-10", mesLabel: "Out/2025", campanha: "Compra Recorrente",   membros: 31, pts: 5100 },
  { mesKey: "2025-10", mesLabel: "Out/2025", campanha: "Fidelidade Platinum", membros: 21, pts: 4300 },
  { mesKey: "2025-10", mesLabel: "Out/2025", campanha: "Fidelidade Bronze",   membros: 29, pts: 2800 },
  // Set/2025
  { mesKey: "2025-09", mesLabel: "Set/2025", campanha: "Fidelidade Platinum", membros: 26, pts: 7400 },
  { mesKey: "2025-09", mesLabel: "Set/2025", campanha: "Lançamento Verão",    membros: 17, pts: 3100 },
  { mesKey: "2025-09", mesLabel: "Set/2025", campanha: "Compra Recorrente",   membros: 19, pts: 2700 },
];

const PERIOD_MONTHS: Record<Period, number> = { "3m": 3, "6m": 6, "12m": 12 };

const MONTH_ORDER = [
  "2026-07","2026-06","2026-05","2026-04","2026-03","2026-02",
  "2026-01","2025-12","2025-11","2025-10","2025-09",
];

const CHART_CONFIG: ChartConfig = {
  pts: { label: `${MOEDA.abrev} expirados`, color: "hsl(var(--chart-1))" },
};

export default function SaldoExpirado() {
  const [period, setPeriod] = useState<Period>("6m");

  const mesesVisiveis = useMemo(() => {
    return MONTH_ORDER.slice(0, PERIOD_MONTHS[period]);
  }, [period]);

  const rows = useMemo(
    () => ALL_ROWS.filter(r => mesesVisiveis.includes(r.mesKey))
           .sort((a, b) => b.mesKey.localeCompare(a.mesKey)),
    [mesesVisiveis]
  );

  // Chart data — aggregate by month, ascending
  const chartData = useMemo(() => {
    const map: Record<string, { mes: string; pts: number }> = {};
    rows.forEach(r => {
      if (!map[r.mesKey]) map[r.mesKey] = { mes: r.mesLabel.replace("/20", "/"), pts: 0 };
      map[r.mesKey].pts += r.pts;
    });
    return Object.values(map).sort((a, b) => a.mes.localeCompare(b.mes));
  }, [rows]);

  // Summary
  const totalPts    = rows.reduce((s, r) => s + r.pts, 0);
  const totalMembros = rows.reduce((s, r) => s + r.membros, 0);

  const campanhaMap: Record<string, number> = {};
  rows.forEach(r => { campanhaMap[r.campanha] = (campanhaMap[r.campanha] ?? 0) + r.pts; });
  const topCampanha = Object.entries(campanhaMap).sort((a, b) => b[1] - a[1])[0];

  // Group rows by month for table
  const grouped = useMemo(() => {
    const order = [...mesesVisiveis].sort((a, b) => b.localeCompare(a));
    return order.map(key => ({
      key,
      label: rows.find(r => r.mesKey === key)?.mesLabel ?? key,
      campanhas: rows.filter(r => r.mesKey === key),
      totalPts: rows.filter(r => r.mesKey === key).reduce((s, r) => s + r.pts, 0),
      totalMembros: rows.filter(r => r.mesKey === key).reduce((s, r) => s + r.membros, 0),
    }));
  }, [rows, mesesVisiveis]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saldo expirado"
        path={[{ label: "Operação" }]}
        renderCrumbLink={renderCrumbLink}
        description={`Histórico de ${MOEDA.nome.toLowerCase()} vencidos por período e campanha.`}
      />

      {/* Period selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Período:</span>
        {(["3m", "6m", "12m"] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              period === p
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {p === "3m" ? "3 meses" : p === "6m" ? "6 meses" : "12 meses"}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card px-5 py-4">
          <p className="text-xs text-muted-foreground">{MOEDA.nome} expirados</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">{totalPts.toLocaleString("pt-BR")}</p>
          <p className="text-xs text-muted-foreground mt-0.5">no período selecionado</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-5 py-4">
          <p className="text-xs text-muted-foreground">Membros afetados</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">{totalMembros.toLocaleString("pt-BR")}</p>
          <p className="text-xs text-muted-foreground mt-0.5">ocorrências de expiração</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-5 py-4">
          <p className="text-xs text-muted-foreground">Maior expiração</p>
          <p className="text-lg font-bold mt-1 leading-tight">{topCampanha?.[0] ?? "—"}</p>
          <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">{topCampanha?.[1]?.toLocaleString("pt-BR")} {MOEDA.abrev} expirados</p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm font-semibold mb-4">Expiração mensal</p>
        <ChartContainer config={CHART_CONFIG} className="h-48 w-full">
          <BarChart data={chartData} barSize={28}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="pts" fill="var(--color-pts)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>

      {/* Table grouped by month */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mês / Campanha</TableHead>
              <TableHead className="text-right">Membros</TableHead>
              <TableHead className="text-right">{MOEDA.abrev} expirados</TableHead>
              <TableHead className="text-right">% do período</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grouped.map(({ key, label, campanhas, totalPts: mTotalPts, totalMembros: mTotalMembros }) => (
              <>
                {/* Month header row */}
                <TableRow key={`header-${key}`} className="bg-muted/40 hover:bg-muted/40">
                  <TableCell colSpan={1} className="py-2.5">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
                  </TableCell>
                  <TableCell className="py-2.5 text-right tabular-nums text-xs text-muted-foreground font-medium">{mTotalMembros}</TableCell>
                  <TableCell className="py-2.5 text-right tabular-nums text-sm font-semibold">{mTotalPts.toLocaleString("pt-BR")}</TableCell>
                  <TableCell className="py-2.5 text-right tabular-nums text-xs text-muted-foreground">
                    {totalPts > 0 ? `${((mTotalPts / totalPts) * 100).toFixed(1)}%` : "—"}
                  </TableCell>
                </TableRow>
                {/* Campaign rows */}
                {campanhas
                  .sort((a, b) => b.pts - a.pts)
                  .map(row => (
                    <TableRow key={`${key}-${row.campanha}`} className="[&>td]:py-2.5">
                      <TableCell className="pl-8 text-sm text-muted-foreground">{row.campanha}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm text-muted-foreground">{row.membros}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{row.pts.toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="text-right tabular-nums text-xs text-muted-foreground">
                        {totalPts > 0 ? `${((row.pts / totalPts) * 100).toFixed(1)}%` : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
