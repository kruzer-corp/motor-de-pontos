import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar, AvatarFallback, PageHeader, Pill,
  SearchInput, Table, TableBody, TableHead, TableHeader, TableRow,
} from "@kruzer/ds";
import { Package } from "lucide-react";

export type OrderStatus = "solicitado" | "aprovado" | "em_separacao" | "entregue" | "rejeitado" | "cancelado";

export type TimelineEntry = {
  status: OrderStatus; date: string; operator?: string;
};

export type Order = {
  id: string; memberId: string; memberName: string; memberInitials: string;
  memberTier: string; memberBalance: number;
  product: string; category: string; channel: string; points: number;
  status: OrderStatus; createdAt: string; timeline: TimelineEntry[];
  rejectReason?: string;
};

export const ORDERS: Order[] = [
  {
    id: "REQ-521", memberId: "1", memberName: "Aline P.", memberInitials: "AP",
    memberTier: "Diamante", memberBalance: 5200,
    product: "Voucher R$100", category: "Voucher", channel: "App Mobile",
    points: 2400, status: "solicitado", createdAt: "16/06/2025",
    timeline: [{ status: "solicitado", date: "16/06/2025 14:32" }],
  },
  {
    id: "REQ-498", memberId: "2", memberName: "Bruno C.", memberInitials: "BC",
    memberTier: "Ouro", memberBalance: 3200,
    product: "Frete Grátis", category: "Logística", channel: "App Mobile",
    points: 800, status: "aprovado", createdAt: "10/06/2025",
    timeline: [
      { status: "solicitado",  date: "10/06/2025 09:15" },
      { status: "aprovado",    date: "10/06/2025 11:40", operator: "Maria Admin" },
    ],
  },
  {
    id: "REQ-497", memberId: "3", memberName: "Cecília M.", memberInitials: "CM",
    memberTier: "Prata", memberBalance: 1800,
    product: "Cupom 10%", category: "Desconto", channel: "App Mobile",
    points: 650, status: "em_separacao", createdAt: "07/06/2025",
    timeline: [
      { status: "solicitado",   date: "07/06/2025 16:20" },
      { status: "aprovado",     date: "08/06/2025 10:05", operator: "João Ops" },
      { status: "em_separacao", date: "08/06/2025 14:30", operator: "João Ops" },
    ],
  },
  {
    id: "REQ-489", memberId: "2", memberName: "Bruno C.", memberInitials: "BC",
    memberTier: "Ouro", memberBalance: 3200,
    product: "Air Fryer XL", category: "Produto físico", channel: "Loja física",
    points: 18000, status: "entregue", createdAt: "28/05/2025",
    timeline: [
      { status: "solicitado",   date: "28/05/2025 10:00" },
      { status: "aprovado",     date: "29/05/2025 09:00", operator: "Maria Admin" },
      { status: "em_separacao", date: "30/05/2025 11:00", operator: "Maria Admin" },
      { status: "entregue",     date: "02/06/2025 15:45", operator: "João Ops" },
    ],
  },
  {
    id: "REQ-481", memberId: "4", memberName: "Danilo R.", memberInitials: "DR",
    memberTier: "Bronze", memberBalance: 760,
    product: "Cashback 5%", category: "Cashback", channel: "App Mobile",
    points: 300, status: "rejeitado", createdAt: "20/05/2025",
    rejectReason: "Saldo insuficiente no momento da solicitação.",
    timeline: [
      { status: "solicitado", date: "20/05/2025 08:55" },
      { status: "rejeitado",  date: "20/05/2025 09:10", operator: "Maria Admin" },
    ],
  },
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  solicitado:   "Solicitado",
  aprovado:     "Aprovado",
  em_separacao: "Em separação",
  entregue:     "Entregue",
  rejeitado:    "Rejeitado",
  cancelado:    "Cancelado",
};

const STATUS_PILL: Record<OrderStatus, "warning" | "primary" | "secondary" | "success" | "destructive" | "muted"> = {
  solicitado:   "warning",
  aprovado:     "primary",
  em_separacao: "secondary",
  entregue:     "success",
  rejeitado:    "destructive",
  cancelado:    "muted",
};

const TIER_COLOR: Record<string, string> = {
  Diamante: "bg-violet-100 text-violet-700",
  Ouro:     "bg-amber-100 text-amber-700",
  Prata:    "bg-slate-100 text-slate-600",
  Bronze:   "bg-orange-100 text-orange-700",
};

const TABS = [
  { key: "todos",       label: "Todos" },
  { key: "pendentes",   label: "Pendentes" },
  { key: "andamento",   label: "Em andamento" },
  { key: "concluidos",  label: "Concluídos" },
];

function matchTab(status: OrderStatus, tab: string) {
  if (tab === "todos")      return true;
  if (tab === "pendentes")  return status === "solicitado";
  if (tab === "andamento")  return status === "aprovado" || status === "em_separacao";
  if (tab === "concluidos") return status === "entregue" || status === "rejeitado" || status === "cancelado";
  return true;
}

export default function Pedidos() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [tab,    setTab]    = useState("todos");

  const filtered = useMemo(() =>
    ORDERS.filter((o) =>
      matchTab(o.status, tab) &&
      (!search || o.memberName.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()))
    ), [search, tab]
  );

  const counts = useMemo(() => ({
    pendentes:  ORDERS.filter((o) => o.status === "solicitado").length,
    andamento:  ORDERS.filter((o) => o.status === "aprovado" || o.status === "em_separacao").length,
  }), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        path={[{ label: "Operação" }]}
        description="Fila de resgates solicitados pelos membros via canal."
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {t.key === "pendentes" && counts.pendentes > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-100 text-amber-700 px-1.5 py-0.5 text-[10px] font-semibold">
                {counts.pendentes}
              </span>
            )}
            {t.key === "andamento" && counts.andamento > 0 && (
              <span className="ml-1.5 rounded-full bg-sky-100 text-sky-700 px-1.5 py-0.5 text-[10px] font-semibold">
                {counts.andamento}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por membro ou nº pedido…"
            className="w-64"
          />
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} pedidos</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2">
            <Package className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nenhum pedido encontrado.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Membro</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead className="text-right">Pontos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Solicitado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => navigate(`/pedidos/${order.id}`)}
                >
                  <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{order.id}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                          {order.memberInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{order.memberName}</p>
                        <span className={`inline-flex rounded-full px-1.5 py-0 text-[10px] font-semibold ${TIER_COLOR[order.memberTier]}`}>
                          {order.memberTier}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-medium">{order.product}</p>
                    <p className="text-xs text-muted-foreground">{order.category}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground">{order.channel}</td>
                  <td className="px-4 py-3.5 text-right tabular-nums font-semibold text-sm">
                    {order.points.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3.5">
                    <Pill color={STATUS_PILL[order.status]} variant="soft" size="sm">
                      {STATUS_LABEL[order.status]}
                    </Pill>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground tabular-nums">{order.createdAt}</td>
                </tr>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
