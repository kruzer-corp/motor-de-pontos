import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Avatar, AvatarFallback, Button, Card, CardContent, CardHeader, CardTitle,
  ConfirmDialog, InfoNotice, PageHeader, Pill, Separator, toast,
} from "@kruzer/ds";
import { ArrowLeft, CheckCircle2, Circle, Clock, XCircle, Package } from "lucide-react";
import { ORDERS } from "./Pedidos";
import type { OrderStatus, Order } from "./Pedidos";

// ── Lifecycle definition ──────────────────────────────────────────────────────

const LIFECYCLE: OrderStatus[] = ["solicitado", "aprovado", "em_separacao", "entregue"];

const STEP_LABEL: Record<OrderStatus, string> = {
  solicitado:   "Solicitado",
  aprovado:     "Aprovado",
  em_separacao: "Em separação",
  entregue:     "Entregue",
  rejeitado:    "Rejeitado",
  cancelado:    "Cancelado",
};

const STEP_DESC: Record<OrderStatus, string> = {
  solicitado:   "Membro solicitou o resgate pelo canal.",
  aprovado:     "Pedido aprovado. Pontos debitados do saldo.",
  em_separacao: "Produto em preparação para entrega.",
  entregue:     "Entrega confirmada. Ciclo concluído.",
  rejeitado:    "Pedido recusado pelo operador.",
  cancelado:    "Pedido cancelado.",
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

function nextStatus(current: OrderStatus): OrderStatus | null {
  const idx = LIFECYCLE.indexOf(current);
  if (idx === -1 || idx === LIFECYCLE.length - 1) return null;
  return LIFECYCLE[idx + 1];
}

function isTerminal(status: OrderStatus) {
  return status === "entregue" || status === "rejeitado" || status === "cancelado";
}

// ── Timeline step ─────────────────────────────────────────────────────────────

function TimelineStep({
  step, active, done, entry,
}: {
  step: OrderStatus;
  active: boolean;
  done: boolean;
  entry?: { date: string; operator?: string };
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
          done   ? "border-primary bg-primary"
          : active ? "border-primary bg-background"
          : "border-border bg-background"
        }`}>
          {done
            ? <CheckCircle2 className="h-4 w-4 text-white" />
            : active
              ? <Clock className="h-3.5 w-3.5 text-primary" />
              : <Circle className="h-3.5 w-3.5 text-muted-foreground/40" />
          }
        </div>
        <div className={`w-0.5 flex-1 mt-1 min-h-[2rem] ${done ? "bg-primary/30" : "bg-border"}`} />
      </div>
      <div className="pb-6">
        <p className={`text-sm font-semibold leading-7 ${done || active ? "text-foreground" : "text-muted-foreground"}`}>
          {STEP_LABEL[step]}
        </p>
        <p className="text-xs text-muted-foreground">{STEP_DESC[step]}</p>
        {entry && (
          <p className="text-xs text-muted-foreground mt-1 tabular-nums">
            {entry.date}{entry.operator ? ` — ${entry.operator}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PedidoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Local state copy so we can mutate status in the prototype
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmAdvance, setConfirmAdvance] = useState(false);
  const [confirmReject,  setConfirmReject]  = useState(false);

  const orderFound = orders.find((o) => o.id === id);
  if (!orderFound) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        Pedido não encontrado.
        <button className="ml-2 text-primary underline" onClick={() => navigate("/pedidos")}>
          Voltar
        </button>
      </div>
    );
  }

  const order = orderFound;
  const next = nextStatus(order.status);
  const terminal = isTerminal(order.status);

  function advance(toStatus: OrderStatus, operator = "Maria Admin") {
    const now = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).replace(",", "");

    setOrders((prev) => prev.map((o) =>
      o.id !== order.id ? o : {
        ...o,
        status: toStatus,
        timeline: [...o.timeline, { status: toStatus, date: now, operator }],
      }
    ));
  }

  function handleApprove() {
    setConfirmApprove(false);
    advance("aprovado");
    toast.success(`${order.points.toLocaleString("pt-BR")} pts debitados do saldo de ${order.memberName}`);
  }

  function handleAdvance() {
    setConfirmAdvance(false);
    if (!next) return;
    advance(next);
    const msg = next === "em_separacao" ? "Pedido em separação" : "Entrega confirmada — pedido concluído";
    toast.success(msg);
  }

  function handleReject() {
    setConfirmReject(false);
    advance("rejeitado");
    toast.error(`Pedido ${order.id} rejeitado`);
  }

  // Which step index is current
  const currentIdx = LIFECYCLE.indexOf(order.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Pedido ${order.id}`}
        path={[{ label: "Operação" }, { label: "Pedidos" }]}
        description={`${order.product} · Solicitado em ${order.createdAt}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/pedidos")}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Voltar
            </Button>
            <Pill color={STATUS_PILL[order.status]} variant="soft" size="sm">
              {STEP_LABEL[order.status]}
            </Pill>
          </div>
        }
      />

      <div className="grid grid-cols-[1fr_320px] gap-6 items-start">

        {/* ── Left: timeline + actions ── */}
        <div className="space-y-5">

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm">Lifecycle do pedido</CardTitle>
            </CardHeader>
            <CardContent>
              {order.status === "rejeitado" || order.status === "cancelado" ? (
                <div className="flex gap-3">
                  <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 bg-destructive/10 border-2 border-destructive">
                    <XCircle className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-destructive leading-7">{STEP_LABEL[order.status]}</p>
                    {order.rejectReason && (
                      <p className="text-xs text-muted-foreground">{order.rejectReason}</p>
                    )}
                    {order.timeline.at(-1) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {order.timeline.at(-1)!.date}
                        {order.timeline.at(-1)!.operator ? ` — ${order.timeline.at(-1)!.operator}` : ""}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  {LIFECYCLE.map((step, idx) => {
                    const done   = idx < currentIdx;
                    const active = idx === currentIdx;
                    const entry  = order.timeline.find((t) => t.status === step);
                    const isLast = idx === LIFECYCLE.length - 1;
                    return (
                      <div key={step} className={isLast ? "[&_.timeline-line]:hidden" : ""}>
                        <TimelineStep step={step} active={active} done={done} entry={entry} />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {!terminal && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Ação necessária</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.status === "solicitado" && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Revise o pedido e aprove ou rejeite. A aprovação debita os pontos imediatamente.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => setConfirmApprove(true)}>
                        Aprovar pedido
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setConfirmReject(true)}>
                        Rejeitar
                      </Button>
                    </div>
                  </>
                )}
                {order.status === "aprovado" && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Pontos já debitados. Confirme quando o produto entrar em separação.
                    </p>
                    <Button size="sm" className="w-full" onClick={() => setConfirmAdvance(true)}>
                      Confirmar separação
                    </Button>
                  </>
                )}
                {order.status === "em_separacao" && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Confirme a entrega ao membro para fechar o ciclo.
                    </p>
                    <Button size="sm" className="w-full" onClick={() => setConfirmAdvance(true)}>
                      Confirmar entrega
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {order.status === "entregue" && (
            <InfoNotice variant="success" title="Ciclo concluído">
              Pedido entregue e pontos debitados. Nenhuma ação necessária.
            </InfoNotice>
          )}

          {order.status === "rejeitado" && (
            <InfoNotice variant="warning" title="Pedido rejeitado">
              Os pontos não foram debitados. O saldo do membro permanece inalterado.
            </InfoNotice>
          )}
        </div>

        {/* ── Right: member + product ── */}
        <div className="space-y-4">

          {/* Membro */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Membro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {order.memberInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{order.memberName}</p>
                  <span className={`inline-flex rounded-full px-1.5 py-0 text-[10px] font-semibold ${TIER_COLOR[order.memberTier]}`}>
                    {order.memberTier}
                  </span>
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saldo atual</span>
                  <span className="font-semibold tabular-nums">
                    {order.memberBalance.toLocaleString("pt-BR")} pts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pontos do resgate</span>
                  <span className="font-semibold tabular-nums text-rose-600">
                    −{order.points.toLocaleString("pt-BR")} pts
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saldo após aprovação</span>
                  <span className={`font-bold tabular-nums ${(order.memberBalance - order.points) < 0 ? "text-destructive" : ""}`}>
                    {(order.memberBalance - order.points).toLocaleString("pt-BR")} pts
                  </span>
                </div>
              </div>
              <button
                className="w-full text-xs text-primary hover:underline text-left mt-1"
                onClick={() => navigate(`/membros/${order.memberId}`)}
              >
                Ver ficha do membro →
              </button>
            </CardContent>
          </Card>

          {/* Produto */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Produto solicitado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold">{order.product}</p>
                  <p className="text-xs text-muted-foreground">{order.category}</p>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Canal</span>
                <span>{order.channel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Custo em pontos</span>
                <span className="font-semibold tabular-nums">{order.points.toLocaleString("pt-BR")} pts</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Dialogs ── */}
      <ConfirmDialog
        open={confirmApprove}
        onOpenChange={setConfirmApprove}
        title="Aprovar pedido"
        description={`${order.points.toLocaleString("pt-BR")} pontos serão debitados do saldo de ${order.memberName} imediatamente. Confirmar aprovação?`}
        confirmLabel="Sim, aprovar e debitar"
        onConfirm={handleApprove}
      />

      <ConfirmDialog
        open={confirmAdvance}
        onOpenChange={setConfirmAdvance}
        title={next === "em_separacao" ? "Confirmar separação" : "Confirmar entrega"}
        description={
          next === "em_separacao"
            ? "O pedido será movido para separação. O operador responsável pela logística será notificado."
            : `Confirme que ${order.memberName} recebeu o produto. Essa ação encerra o ciclo do pedido.`
        }
        confirmLabel={next === "em_separacao" ? "Confirmar separação" : "Confirmar entrega"}
        onConfirm={handleAdvance}
      />

      <ConfirmDialog
        open={confirmReject}
        onOpenChange={setConfirmReject}
        title="Rejeitar pedido"
        description={`O pedido de ${order.memberName} será recusado. Nenhum ponto será debitado. Confirmar rejeição?`}
        confirmLabel="Sim, rejeitar pedido"
        onConfirm={handleReject}
      />
    </div>
  );
}
