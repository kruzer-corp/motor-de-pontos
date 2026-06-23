import { useState } from "react";
import { Card, Input } from "@kruzer/ds";
import { ArrowUpCircle, ArrowDownCircle, ChevronDown, ChevronRight, Search } from "lucide-react";

type LineItem = { description: string; type: "credit" | "debit"; points: number };
type Order = {
  orderId: string;
  date: string;
  channel: string;
  items: LineItem[];
};

const ORDERS: Order[] = [
  {
    orderId: "PED-2025-00421",
    date: "10/06/2025",
    channel: "FAST PRO",
    items: [
      { description: "Acúmulo base da compra", type: "credit", points: 2400 },
      { description: "Bônus Multiplicador Ouro (2×)", type: "credit", points: 2400 },
    ],
  },
  {
    orderId: "PED-2025-00398",
    date: "28/05/2025",
    channel: "App Mobile",
    items: [
      { description: "Acúmulo base da compra", type: "credit", points: 1800 },
      { description: "Bônus categoria Eletrônicos (+20%)", type: "credit", points: 360 },
      { description: "Resgate — Voucher R$50", type: "debit", points: -1200 },
    ],
  },
  {
    orderId: "PED-2025-00345",
    date: "14/05/2025",
    channel: "FAST PRO",
    items: [
      { description: "Acúmulo base da compra", type: "credit", points: 950 },
      { description: "Bônus aniversário (3×)", type: "credit", points: 1900 },
    ],
  },
  {
    orderId: "AJT-2025-00012",
    date: "02/05/2025",
    channel: "Ajuste manual",
    items: [
      { description: "Correção — erro de cálculo (ref. PED-345)", type: "credit", points: 120 },
    ],
  },
];

function orderTotal(order: Order) {
  return order.items.reduce((acc, item) => acc + item.points, 0);
}

export default function Extrato() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ "PED-2025-00421": true });

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const visible = ORDERS.filter(
    (o) => !query || o.orderId.toLowerCase().includes(query.toLowerCase())
  );

  let running = 0;
  const ordersWithBalance = visible.map((o) => {
    const total = orderTotal(o);
    running += total;
    return { ...o, total, balance: running };
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Extrato de Pontos / Bônus</h2>
          <p className="text-sm text-muted-foreground">Histórico agrupado por pedido.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-9 w-56"
              placeholder="Buscar pedido..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Balance summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Saldo atual",
            value: ordersWithBalance[ordersWithBalance.length - 1]?.balance ?? 0,
            color: "text-primary",
          },
          {
            label: "Total creditado",
            value: ORDERS.flatMap((o) => o.items)
              .filter((i) => i.type === "credit")
              .reduce((a, i) => a + i.points, 0),
            color: "text-emerald-600",
          },
          {
            label: "Total debitado",
            value: Math.abs(
              ORDERS.flatMap((o) => o.items)
                .filter((i) => i.type === "debit")
                .reduce((a, i) => a + i.points, 0)
            ),
            color: "text-red-500",
          },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className={`mt-1 text-2xl font-bold tabular-nums ${stat.color}`}>
              {stat.value.toLocaleString("pt-BR")}
            </div>
            <div className="text-xs text-muted-foreground">pts</div>
          </Card>
        ))}
      </div>

      {/* Order list */}
      <div className="space-y-2">
        {ordersWithBalance.map((order) => {
          const isOpen = expanded[order.orderId] ?? false;
          return (
            <Card key={order.orderId} className="overflow-hidden">
              <button
                onClick={() => toggle(order.orderId)}
                className="flex w-full items-center gap-4 px-5 py-4 hover:bg-muted/20 text-left transition-colors"
              >
                {order.total >= 0 ? (
                  <ArrowUpCircle className="size-5 shrink-0 text-emerald-500" />
                ) : (
                  <ArrowDownCircle className="size-5 shrink-0 text-red-500" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium font-mono text-sm">{order.orderId}</div>
                  <div className="text-xs text-muted-foreground">{order.channel} · {order.date}</div>
                </div>
                <div className="text-right shrink-0">
                  <div
                    className={`font-semibold tabular-nums ${
                      order.total >= 0 ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {order.total >= 0 ? "+" : ""}
                    {order.total.toLocaleString("pt-BR")} pts
                  </div>
                  <div className="text-xs text-muted-foreground">
                    saldo: {order.balance.toLocaleString("pt-BR")} pts
                  </div>
                </div>
                {isOpen ? (
                  <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="border-t border-border bg-muted/10">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-4 px-5 py-2.5 text-sm border-b last:border-0 border-border/50"
                    >
                      <span className="text-muted-foreground">{item.description}</span>
                      <span
                        className={`tabular-nums font-medium shrink-0 ${
                          item.type === "credit" ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {item.points >= 0 ? "+" : ""}
                        {item.points.toLocaleString("pt-BR")} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
