import { useState } from "react";
import { Card, CardHeader, CardTitle, Input, Button, Badge, Avatar, AvatarFallback } from "@kruzer-corp/ds";
import { Search, SlidersHorizontal, Download } from "lucide-react";

type OrderStatus = "Concluído" | "Em Processamento" | "Aprovado" | "Em Análise" | "Rejeitado" | "Cancelado";

type Order = {
  id: string;
  member: string;
  initials: string;
  tier: string;
  segment: string;
  reward: string;
  category: string;
  channel: string;
  ganCode: string | null;
  coordinator: string | null;
  fiscalDoc: string | null;
  points: number;
  value: number;
  status: OrderStatus;
  date: string;
  processedDate: string | null;
};

const ORDERS: Order[] = [
  {
    id: "REQ-521",
    member: "Tais M.",
    initials: "TM",
    tier: "Ouro",
    segment: "Fidelidade",
    reward: "Voucher R$100",
    category: "Voucher",
    channel: "App Mobile",
    ganCode: "GAN-SP-001",
    coordinator: "Marcos T.",
    fiscalDoc: null,
    points: 2400,
    value: 240,
    status: "Em Análise",
    date: "16/06/2025",
    processedDate: null,
  },
  {
    id: "REQ-498",
    member: "Paulo S.",
    initials: "PS",
    tier: "Prata",
    segment: "Básico",
    reward: "Frete Grátis",
    category: "Logística",
    channel: "FAST PRO",
    ganCode: "GAN-SP-002",
    coordinator: "Fernanda G.",
    fiscalDoc: null,
    points: 800,
    value: 80,
    status: "Em Processamento",
    date: "10/06/2025",
    processedDate: null,
  },
  {
    id: "REQ-497",
    member: "Marina A.",
    initials: "MA",
    tier: "Diamante",
    segment: "Premium",
    reward: "Cupom 10%",
    category: "Desconto",
    channel: "FAST PRO",
    ganCode: null,
    coordinator: null,
    fiscalDoc: null,
    points: 650,
    value: 65,
    status: "Concluído",
    date: "07/06/2025",
    processedDate: "09/06/2025",
  },
  {
    id: "REQ-489",
    member: "Bruno C.",
    initials: "BC",
    tier: "Ouro",
    segment: "Frete Grátis",
    reward: "Voucher R$50",
    category: "Voucher",
    channel: "App Mobile",
    ganCode: "GAN-SP-004",
    coordinator: "Marcos T.",
    fiscalDoc: "RPA-2025-0038",
    points: 1200,
    value: 120,
    status: "Concluído",
    date: "05/06/2025",
    processedDate: "07/06/2025",
  },
  {
    id: "REQ-481",
    member: "Cecília M.",
    initials: "CM",
    tier: "Prata",
    segment: "Fidelidade",
    reward: "Air Fryer XL",
    category: "Produto",
    channel: "FAST PRO",
    ganCode: null,
    coordinator: null,
    fiscalDoc: "RPA-2025-0031",
    points: 18000,
    value: 1800,
    status: "Concluído",
    date: "28/05/2025",
    processedDate: "02/06/2025",
  },
  {
    id: "REQ-472",
    member: "Danilo R.",
    initials: "DR",
    tier: "Bronze",
    segment: "Básico",
    reward: "Cashback 5%",
    category: "Cashback",
    channel: "App Mobile",
    ganCode: "GAN-SP-005",
    coordinator: "Marcos T.",
    fiscalDoc: null,
    points: 300,
    value: 30,
    status: "Rejeitado",
    date: "20/05/2025",
    processedDate: null,
  },
];

const STATUS_COLOR: Record<OrderStatus, string> = {
  Concluído: "bg-emerald-100 text-emerald-700",
  "Em Processamento": "bg-blue-100 text-blue-700",
  Aprovado: "bg-violet-100 text-violet-700",
  "Em Análise": "bg-amber-100 text-amber-700",
  Rejeitado: "bg-red-100 text-red-600",
  Cancelado: "bg-slate-100 text-slate-500",
};

const TIER_COLOR: Record<string, string> = {
  Diamante: "bg-violet-100 text-violet-700",
  Ouro: "bg-amber-100 text-amber-700",
  Prata: "bg-slate-100 text-slate-600",
  Bronze: "bg-orange-100 text-orange-700",
};

const ALL_COLUMNS = [
  { key: "id", label: "Pedido", always: true },
  { key: "member", label: "Membro", always: true },
  { key: "tier", label: "Tier" },
  { key: "segment", label: "Segmento" },
  { key: "reward", label: "Recompensa", always: true },
  { key: "category", label: "Categoria" },
  { key: "channel", label: "Canal" },
  { key: "ganCode", label: "Código GAN" },
  { key: "coordinator", label: "Coordenador" },
  { key: "fiscalDoc", label: "Doc. Fiscal" },
  { key: "points", label: "Pontos", always: true },
  { key: "value", label: "Valor R$" },
  { key: "status", label: "Status", always: true },
  { key: "date", label: "Data" },
  { key: "processedDate", label: "Processado em" },
];

export default function Pedidos() {
  const [query, setQuery] = useState("");
  const [showColPicker, setShowColPicker] = useState(false);
  const [visibleCols, setVisibleCols] = useState<Set<string>>(
    new Set(["id", "member", "tier", "reward", "ganCode", "coordinator", "fiscalDoc", "points", "status", "date"])
  );

  const toggleCol = (key: string) =>
    setVisibleCols((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const filtered = ORDERS.filter(
    (o) =>
      !query ||
      o.member.toLowerCase().includes(query.toLowerCase()) ||
      o.id.toLowerCase().includes(query.toLowerCase()) ||
      (o.ganCode ?? "").toLowerCase().includes(query.toLowerCase())
  );

  const activeCols = ALL_COLUMNS.filter(
    (c) => c.always || visibleCols.has(c.key)
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Pedidos Especificados</h2>
          <p className="text-sm text-muted-foreground">
            Visualização de pedidos com colunas adicionais configuráveis.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-9 w-56"
              placeholder="Pedido, membro, GAN…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColPicker(!showColPicker)}
            >
              <SlidersHorizontal className="size-3.5 mr-1.5" />
              Colunas ({visibleCols.size})
            </Button>
            {showColPicker && (
              <div className="absolute right-0 top-full mt-1 z-20 w-52 rounded-2xl border border-border bg-card shadow-lg p-3 space-y-1">
                {ALL_COLUMNS.filter((c) => !c.always).map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-muted/40 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={visibleCols.has(col.key)}
                      onChange={() => toggleCol(col.key)}
                      className="accent-primary"
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            )}
          </div>
          <Button variant="outline" size="sm">
            <Download className="size-3.5 mr-1.5" />
            Exportar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pedidos ({filtered.length})</CardTitle>
            <Badge variant="secondary">{activeCols.length} colunas ativas</Badge>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-t border-border bg-muted/20">
              <tr className="text-left text-muted-foreground">
                {activeCols.map((col) => (
                  <th key={col.key} className="px-4 py-3 font-medium whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-muted/20">
                  {activeCols.map((col) => {
                    switch (col.key) {
                      case "id":
                        return (
                          <td key="id" className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                            {order.id}
                          </td>
                        );
                      case "member":
                        return (
                          <td key="member" className="px-4 py-3">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <Avatar className="h-7 w-7 shrink-0">
                                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                                  {order.initials}
                                </AvatarFallback>
                              </Avatar>
                              {order.member}
                            </div>
                          </td>
                        );
                      case "tier":
                        return (
                          <td key="tier" className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${TIER_COLOR[order.tier]}`}>
                              {order.tier}
                            </span>
                          </td>
                        );
                      case "segment":
                        return <td key="segment" className="px-4 py-3 text-muted-foreground whitespace-nowrap">{order.segment}</td>;
                      case "reward":
                        return <td key="reward" className="px-4 py-3 whitespace-nowrap">{order.reward}</td>;
                      case "category":
                        return <td key="category" className="px-4 py-3 text-muted-foreground">{order.category}</td>;
                      case "channel":
                        return <td key="channel" className="px-4 py-3 text-muted-foreground whitespace-nowrap">{order.channel}</td>;
                      case "ganCode":
                        return (
                          <td key="ganCode" className="px-4 py-3">
                            {order.ganCode ? (
                              <Badge variant="outline" className="font-mono text-xs">{order.ganCode}</Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                        );
                      case "coordinator":
                        return (
                          <td key="coordinator" className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                            {order.coordinator ?? <span className="text-xs">—</span>}
                          </td>
                        );
                      case "fiscalDoc":
                        return (
                          <td key="fiscalDoc" className="px-4 py-3">
                            {order.fiscalDoc ? (
                              <span className="font-mono text-xs text-emerald-600">{order.fiscalDoc}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                        );
                      case "points":
                        return <td key="points" className="px-4 py-3 tabular-nums text-right">{order.points.toLocaleString("pt-BR")} pts</td>;
                      case "value":
                        return (
                          <td key="value" className="px-4 py-3 tabular-nums">
                            {order.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </td>
                        );
                      case "status":
                        return (
                          <td key="status" className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[order.status]}`}>
                              {order.status}
                            </span>
                          </td>
                        );
                      case "date":
                        return <td key="date" className="px-4 py-3 tabular-nums text-xs text-muted-foreground">{order.date}</td>;
                      case "processedDate":
                        return (
                          <td key="processedDate" className="px-4 py-3 tabular-nums text-xs text-muted-foreground">
                            {order.processedDate ?? "—"}
                          </td>
                        );
                      default:
                        return null;
                    }
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
