import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, Button, Badge, Avatar, AvatarFallback } from "@kruzer/ds";
import { ArrowRight, CheckCheck, X, ChevronRight, FileCheck, ShoppingCart } from "lucide-react";
import { MOEDA } from "../config/programa";
import { ehV1 } from "../lib/versao";

// ── Types ────────────────────────────────────────────────────────────

type PipelineStatus =
  | "Solicitado"
  | "Em Análise"
  | "Aprovado"
  | "Em Processamento"
  | "Concluído"
  | "Rejeitado"
  | "Cancelado";

type Order = {
  id: string;
  member: string;
  initials: string;
  reward: string;
  status: PipelineStatus;
  points: string;
  submittedAt: string;
};

// ── Valid transitions ────────────────────────────────────────────────

const TRANSITIONS: Partial<Record<PipelineStatus, { advance?: PipelineStatus; reject?: PipelineStatus; cancel?: PipelineStatus }>> = {
  Solicitado: { advance: "Em Análise", cancel: "Cancelado" },
  "Em Análise": { advance: "Aprovado", reject: "Rejeitado" },
  Aprovado: { advance: "Em Processamento", cancel: "Cancelado" },
  "Em Processamento": { advance: "Concluído", cancel: "Cancelado" },
};

// ── Mock orders ──────────────────────────────────────────────────────

const INITIAL_ORDERS: Order[] = [
  { id: "REQ-521", member: "Tais M.", initials: "TM", reward: "Voucher R$100", status: "Solicitado", points: "2.400", submittedAt: "16/06" },
  { id: "REQ-520", member: "Lucas F.", initials: "LF", reward: "Fone Bluetooth", status: "Solicitado", points: "8.500", submittedAt: "16/06" },
  { id: "REQ-519", member: "Renata P.", initials: "RP", reward: "Voucher R$50", status: "Em Análise", points: "1.200", submittedAt: "15/06" },
  { id: "REQ-515", member: "Diego C.", initials: "DC", reward: "Tênis Runner", status: "Em Análise", points: "22.000", submittedAt: "14/06" },
  { id: "REQ-510", member: "Aline P.", initials: "AP", reward: "Air Fryer XL", status: "Aprovado", points: "18.000", submittedAt: "13/06" },
  { id: "REQ-508", member: "Carla M.", initials: "CM", reward: "Cashback 5%", status: "Aprovado", points: "650", submittedAt: "12/06" },
  { id: "REQ-501", member: "Lívia R.", initials: "LR", reward: "Voucher R$50", status: "Em Processamento", points: "1.200", submittedAt: "10/06" },
  { id: "REQ-498", member: "Paulo S.", initials: "PS", reward: "Frete Grátis", status: "Concluído", points: "800", submittedAt: "08/06" },
  { id: "REQ-497", member: "Marina A.", initials: "MA", reward: "Cupom 10%", status: "Concluído", points: "650", submittedAt: "07/06" },
  { id: "REQ-493", member: "João B.", initials: "JB", reward: "Voucher R$100", status: "Rejeitado", points: "2.400", submittedAt: "05/06" },
  { id: "REQ-490", member: "Tais M.", initials: "TM", reward: "Cashback 5%", status: "Cancelado", points: "300", submittedAt: "03/06" },
];

// ── Pipeline config ──────────────────────────────────────────────────

const MAIN_PIPELINE: PipelineStatus[] = [
  "Solicitado",
  "Em Análise",
  "Aprovado",
  "Em Processamento",
  "Concluído",
];

const TERMINAL: PipelineStatus[] = ["Rejeitado", "Cancelado"];

const STATUS_COLOR: Record<PipelineStatus, string> = {
  Solicitado: "bg-sky-100 text-sky-700 border-sky-200",
  "Em Análise": "bg-amber-100 text-amber-700 border-amber-200",
  Aprovado: "bg-violet-100 text-violet-700 border-violet-200",
  "Em Processamento": "bg-blue-100 text-blue-700 border-blue-200",
  Concluído: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Rejeitado: "bg-red-50 text-red-600 border-red-200",
  Cancelado: "bg-slate-100 text-slate-500 border-slate-200",
};

const BADGE_COLOR: Record<PipelineStatus, string> = {
  Solicitado: "bg-sky-100 text-sky-700",
  "Em Análise": "bg-amber-100 text-amber-700",
  Aprovado: "bg-violet-100 text-violet-700",
  "Em Processamento": "bg-blue-100 text-blue-700",
  Concluído: "bg-emerald-100 text-emerald-700",
  Rejeitado: "bg-red-100 text-red-600",
  Cancelado: "bg-slate-100 text-slate-500",
};

// ── Component ────────────────────────────────────────────────────────

export default function Recompensas() {
  const [orders, setOrders] = useState(() => (ehV1() ? [] : INITIAL_ORDERS));
  const [selectedStatus, setSelectedStatus] = useState<PipelineStatus | null>("Em Análise");

  const countFor = (status: PipelineStatus) => orders.filter((o) => o.status === status).length;

  const transition = (id: string, to: PipelineStatus) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: to } : o)));

  const visibleOrders = selectedStatus
    ? orders.filter((o) => o.status === selectedStatus)
    : orders;

  return (
    <div className="space-y-5">
      {/* Quick links */}
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/campanhas">
            <ShoppingCart className="size-3.5 mr-1.5" />
            Produtos de resgate (nas campanhas)
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/recompensas/documental">
            <FileCheck className="size-3.5 mr-1.5" />
            Fluxo documental (RPA / NF)
          </Link>
        </Button>
      </div>

      {/* Pipeline — interactive */}
      <Card>
        <CardHeader>
          <CardTitle>Motor de Resgate</CardTitle>
        </CardHeader>
        <div className="px-6 pb-5 space-y-4">
          {/* Main flow */}
          <div className="flex flex-wrap items-center gap-2">
            {MAIN_PIPELINE.map((status, i) => {
              const count = countFor(status);
              const isSelected = selectedStatus === status;
              return (
                <div key={status} className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedStatus(isSelected ? null : status)}
                    className={`flex flex-col items-center rounded-2xl border px-4 py-3 min-w-[7rem] transition-all ${
                      STATUS_COLOR[status]
                    } ${isSelected ? "ring-2 ring-offset-1 ring-current shadow-sm" : "hover:opacity-80"}`}
                  >
                    <span className="text-2xl font-bold tabular-nums">{count}</span>
                    <span className="mt-0.5 text-xs font-medium text-center leading-tight">
                      {status}
                    </span>
                  </button>
                  {i < MAIN_PIPELINE.length - 1 && (
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Terminal states */}
          <div className="flex flex-wrap items-center gap-3 pt-0.5">
            <span className="text-xs text-muted-foreground">Terminais:</span>
            {TERMINAL.map((status) => (
              <button
                key={status}
                onClick={() =>
                  setSelectedStatus(selectedStatus === status ? null : status)
                }
                className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 transition-all ${
                  STATUS_COLOR[status]
                } ${selectedStatus === status ? "ring-2 ring-offset-1 ring-current" : "hover:opacity-80"}`}
              >
                <span className="text-sm font-bold tabular-nums">{countFor(status)}</span>
                <span className="text-xs font-medium">{status}</span>
              </button>
            ))}
            {selectedStatus && (
              <button
                onClick={() => setSelectedStatus(null)}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <X className="size-3" />
                Limpar filtro
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Orders table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>
              {selectedStatus ? `Pedidos — ${selectedStatus}` : "Todos os pedidos"}
            </CardTitle>
            <Badge variant="secondary">{visibleOrders.length}</Badge>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-t border-border bg-muted/20">
              <tr className="text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">Pedido</th>
                <th className="px-5 py-3 font-medium">Membro</th>
                <th className="px-5 py-3 font-medium">Resgate</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Pontos</th>
                <th className="px-5 py-3 font-medium">Solicitado</th>
                <th className="px-5 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleOrders.map((order) => {
                const trans = TRANSITIONS[order.status];
                return (
                  <tr key={order.id} className="hover:bg-muted/20">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{order.id}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                            {order.initials}
                          </AvatarFallback>
                        </Avatar>
                        {order.member}
                      </div>
                    </td>
                    <td className="px-5 py-3">{order.reward}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          BADGE_COLOR[order.status]
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{order.points} {MOEDA.abrev}</td>
                    <td className="px-5 py-3 text-muted-foreground tabular-nums text-xs">
                      {order.submittedAt}
                    </td>
                    <td className="px-5 py-3">
                      {trans ? (
                        <div className="flex items-center gap-1.5">
                          {trans.advance && (
                            <Button
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => transition(order.id, trans.advance!)}
                            >
                              <ChevronRight className="size-3 mr-0.5" />
                              {trans.advance}
                            </Button>
                          )}
                          {trans.reject && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => transition(order.id, trans.reject!)}
                            >
                              <X className="size-3 mr-0.5" />
                              Rejeitar
                            </Button>
                          )}
                          {trans.cancel && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-muted-foreground"
                              onClick={() => transition(order.id, trans.cancel!)}
                            >
                              Cancelar
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                          <CheckCheck className="size-3.5" />
                          {order.status}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
