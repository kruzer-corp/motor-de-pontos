import { useState } from "react";
import { Card, Button, Badge, Switch } from "@kruzer-corp/ds";
import { Users, Plus, Pencil } from "lucide-react";

type CriteriaOp = "gte" | "lte" | "eq" | "in";

type Criterion = {
  field: string;
  label: string;
  op: CriteriaOp;
  value: string;
};

type Segment = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  members: number;
  criteria: Criterion[];
  color: string;
};

const SEGMENTS: Segment[] = [
  {
    id: "SEG-001",
    name: "Premium",
    description: "Membros de alto valor com histórico de compras frequentes.",
    active: true,
    members: 312,
    color: "bg-violet-100 text-violet-700",
    criteria: [
      { field: "tier",            label: "Tier",               op: "in",  value: "Diamante, Ouro" },
      { field: "orders_last_90d", label: "Compras (últimos 90d)", op: "gte", value: "3" },
      { field: "total_spent",     label: "Gasto total (R$)",   op: "gte", value: "500" },
    ],
  },
  {
    id: "SEG-002",
    name: "Fidelidade",
    description: "Membros ativos com mais de 6 meses no programa.",
    active: true,
    members: 641,
    color: "bg-sky-100 text-sky-700",
    criteria: [
      { field: "days_in_program", label: "Dias no programa",    op: "gte", value: "180" },
      { field: "orders_total",    label: "Pedidos totais",      op: "gte", value: "5" },
    ],
  },
  {
    id: "SEG-003",
    name: "Frete Grátis",
    description: "Membros elegíveis para benefício de frete grátis por segmento.",
    active: true,
    members: 428,
    color: "bg-emerald-100 text-emerald-700",
    criteria: [
      { field: "tier",            label: "Tier",               op: "in",  value: "Ouro, Prata" },
      { field: "orders_last_30d", label: "Compras (últimos 30d)", op: "gte", value: "1" },
    ],
  },
  {
    id: "SEG-004",
    name: "Em Risco",
    description: "Membros que não compraram nos últimos 60 dias — alvo de reengajamento.",
    active: true,
    members: 187,
    color: "bg-red-100 text-red-700",
    criteria: [
      { field: "days_since_last_order", label: "Dias sem compra",  op: "gte", value: "60" },
      { field: "orders_total",          label: "Pedidos históricos", op: "gte", value: "1" },
    ],
  },
  {
    id: "SEG-005",
    name: "Básico",
    description: "Membros recentes ou com baixa atividade — segmento padrão.",
    active: true,
    members: 872,
    color: "bg-slate-100 text-slate-700",
    criteria: [
      { field: "tier",            label: "Tier",               op: "in",  value: "Bronze" },
    ],
  },
  {
    id: "SEG-006",
    name: "Novos (últimos 30d)",
    description: "Membros cadastrados nos últimos 30 dias — candidatos a boas-vindas.",
    active: false,
    members: 43,
    color: "bg-amber-100 text-amber-700",
    criteria: [
      { field: "days_in_program", label: "Dias no programa", op: "lte", value: "30" },
    ],
  },
];

const OP_LABEL: Record<CriteriaOp, string> = {
  gte: "≥",
  lte: "≤",
  eq:  "=",
  in:  "em",
};

export default function MembrosSegmentos() {
  const [segments, setSegments] = useState(SEGMENTS);

  const toggle = (id: string) =>
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );

  const total = segments.reduce((a, s) => a + s.members, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Users className="size-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">Segmentação de membros</h2>
            <p className="text-sm text-muted-foreground">
              Critérios de ativação e cobertura de cada segmento.
            </p>
          </div>
        </div>
        <Button size="sm">
          <Plus className="size-3.5 mr-1.5" />
          Novo segmento
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Segmentos ativos</div>
          <div className="mt-1 text-2xl font-bold">{segments.filter((s) => s.active).length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Membros segmentados</div>
          <div className="mt-1 text-2xl font-bold">{total.toLocaleString("pt-BR")}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Segmento maior</div>
          <div className="mt-1 text-2xl font-bold">
            {segments.reduce((a, s) => (s.members > a.members ? s : a), segments[0]).name}
          </div>
        </Card>
      </div>

      {/* Segment list */}
      <div className="space-y-3">
        {segments.map((seg) => (
          <Card key={seg.id} className={!seg.active ? "opacity-60" : ""}>
            <div className="flex items-start justify-between gap-4 px-5 py-4">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${seg.color}`}>
                    {seg.name}
                  </span>
                  <Badge variant="secondary">{seg.members.toLocaleString("pt-BR")} membros</Badge>
                  <span className="font-mono text-xs text-muted-foreground">{seg.id}</span>
                </div>
                <p className="text-sm text-muted-foreground">{seg.description}</p>

                {/* Criteria */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {seg.criteria.map((c, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs"
                    >
                      <span className="text-muted-foreground">{c.label}</span>
                      <span className="font-semibold">{OP_LABEL[c.op]}</span>
                      <span>{c.value}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-0.5">
                <Button variant="ghost" size="sm">
                  <Pencil className="size-3.5" />
                </Button>
                <Switch
                  checked={seg.active}
                  onCheckedChange={() => toggle(seg.id)}
                  size="sm"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
