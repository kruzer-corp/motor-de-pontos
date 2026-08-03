import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Avatar, AvatarFallback, Button, Card, CardContent, CardHeader, CardTitle,
  ConfirmDialog, InfoNotice, PageHeader, Pill, Separator, toast,
} from "@kruzer/ds";
import { ArrowLeft, CheckCircle2, Circle, Clock, XCircle, Package, FileText, Download, Banknote, Pencil, X } from "lucide-react";
import { ORDERS, aplicarAprovacaoAutomatica } from "./Pedidos";
import { renderCrumbLink } from "../lib/crumbLink";
import type { Order } from "./Pedidos";
import { LIFECYCLE_POR_TIPO, TIPO_RESGATE_LABEL, TIPO_RESGATE_ICON, proximoStatus, type OrderStatus } from "../config/resgateLifecycle";
import { registrarTransacaoSaldo } from "../lib/membros";
import { ehV1 } from "../lib/versao";

// ── Lifecycle definition ──────────────────────────────────────────────────────

const STEP_LABEL: Record<OrderStatus, string> = {
  solicitado:    "Solicitado",
  aguardando_doc:"Aguardando doc.",
  doc_recebido:  "Doc. recebido",
  aprovado:      "Aprovado",
  em_separacao:  "Em separação",
  entregue:      "Entregue",
  enviado:       "Enviado",
  creditado:     "Creditado",
  rejeitado:     "Rejeitado",
  cancelado:     "Cancelado",
};

const STEP_DESC: Record<OrderStatus, string> = {
  solicitado:    "Membro solicitou o resgate pelo canal.",
  aguardando_doc:"Aguardando envio de documento pelo membro.",
  doc_recebido:  "Documento recebido. Analista precisa revisar.",
  aprovado:      "Resgate aprovado. Saldo debitado da carteira.",
  em_separacao:  "Produto em preparação para entrega.",
  entregue:      "Entrega confirmada. Ciclo concluído.",
  enviado:       "Voucher enviado ao membro. Ciclo concluído.",
  creditado:     "Crédito processado na conta do membro. Ciclo concluído.",
  rejeitado:     "Resgate recusado pelo operador.",
  cancelado:     "Resgate cancelado.",
};

const STATUS_PILL: Record<OrderStatus, "warning" | "primary" | "secondary" | "success" | "destructive" | "muted"> = {
  solicitado:    "warning",
  aguardando_doc:"warning",
  doc_recebido:  "primary",
  aprovado:      "primary",
  em_separacao:  "secondary",
  entregue:      "success",
  enviado:       "success",
  creditado:     "success",
  rejeitado:     "destructive",
  cancelado:     "muted",
};

const TIER_COLOR: Record<string, string> = {
  Diamante: "bg-violet-100 text-violet-700",
  Ouro:     "bg-amber-100 text-amber-700",
  Prata:    "bg-slate-100 text-slate-600",
  Bronze:   "bg-orange-100 text-orange-700",
};

function isTerminal(status: OrderStatus) {
  return ["entregue", "enviado", "creditado", "rejeitado", "cancelado"].includes(status);
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
  const [orders, setOrders] = useState<Order[]>(() => (ehV1() ? [] : aplicarAprovacaoAutomatica(ORDERS)));
  const [confirmApprove,  setConfirmApprove]  = useState(false);
  const [confirmAdvance,  setConfirmAdvance]  = useState(false);
  const [confirmReject,   setConfirmReject]   = useState(false);
  const [confirmCreditar, setConfirmCreditar] = useState(false);
  const [comprovante,     setComprovante]     = useState("");
  const [editOpen,   setEditOpen]   = useState(false);
  const [editPontos, setEditPontos] = useState("");
  const [editMotivo, setEditMotivo] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const orderFound = orders.find((o) => o.id === id);
  if (!orderFound) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        Resgate não encontrado.
        <button className="ml-2 text-primary underline" onClick={() => navigate("/resgates")}>
          Voltar
        </button>
      </div>
    );
  }

  const order = orderFound;
  const lifecycle = LIFECYCLE_POR_TIPO[order.tipoResgate];
  const next = proximoStatus(order.tipoResgate, order.status);
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
    registrarTransacaoSaldo(order.memberId, {
      moeda: order.moedaCampanha, abrev: order.moedaAbrev, delta: -order.points,
      descricao: `Resgate ${order.id} — ${order.product}`, tipo: "resgate",
    });
    toast.success(`${order.points.toLocaleString("pt-BR")} ${order.moedaAbrev} debitados do saldo de ${order.memberName}`);
  }

  function handleAdvance() {
    setConfirmAdvance(false);
    if (!next) return;
    advance(next);
    const msg = next === "em_separacao" ? "Resgate em separação" : "Entrega confirmada — resgate concluído";
    toast.success(msg);
  }

  function handleReject() {
    setConfirmReject(false);
    advance("rejeitado");
    toast.error(`Resgate ${order.id} rejeitado`);
  }

  function handleCreditar() {
    setConfirmCreditar(false);
    advance("creditado");
    toast.success(`Crédito processado — comprovante registrado`);
  }

  function abrirEdicaoPontos() {
    setEditPontos(String(order.points));
    setEditMotivo("");
    setEditOpen(true);
  }

  async function handleEditarPontos() {
    if (!editPontos || !editMotivo) return;
    setEditSaving(true);
    await new Promise((r) => setTimeout(r, 350));
    const novo = Number(editPontos);
    const delta = order.points - novo; // reduzir pontos do resgate = crédito de volta pro membro
    const now = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    }).replace(",", "");

    const jaDebitado = ["aprovado", "em_separacao", "entregue", "enviado", "creditado"].includes(order.status);
    if (jaDebitado && delta !== 0) {
      registrarTransacaoSaldo(order.memberId, {
        moeda: order.moedaCampanha, abrev: order.moedaAbrev, delta,
        descricao: `Ajuste manual no resgate ${order.id}: ${editMotivo}`, tipo: "ajuste",
      });
    }

    setOrders((prev) => prev.map((o) => o.id !== order.id ? o : {
      ...o,
      points: novo,
      ajustes: [
        ...(o.ajustes ?? []),
        { id: `AJR-${o.ajustes?.length ?? 0}`, data: now, operador: "Maria Admin", motivo: editMotivo, pontosAntes: o.points, pontosDepois: novo },
      ],
    }));
    toast.success(`Pontos do resgate ${order.id} ajustados para ${novo.toLocaleString("pt-BR")} ${order.moedaAbrev}`);
    setEditSaving(false);
    setEditOpen(false);
  }

  const currentIdx = lifecycle.indexOf(order.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Resgate ${order.id}`}
        path={[{ label: "Operação" }, { label: "Aprovações de Resgate", to: "/resgates" }]}
        renderCrumbLink={renderCrumbLink}
        description={`${order.product} · Solicitado em ${order.createdAt}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/resgates")}>
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
              <CardTitle className="text-sm flex items-center gap-2">
                Lifecycle do resgate
                <span className="text-xs font-normal text-muted-foreground border border-border rounded-full px-2 py-0.5">
                  {TIPO_RESGATE_ICON[order.tipoResgate]} {TIPO_RESGATE_LABEL[order.tipoResgate]}
                </span>
              </CardTitle>
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
                  {lifecycle.map((step, idx) => {
                    const done   = idx < currentIdx;
                    const active = idx === currentIdx;
                    const entry  = order.timeline.find((t) => t.status === step);
                    const isLast = idx === lifecycle.length - 1;
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
                      Revise e aprove ou rejeite. A aprovação debita o saldo imediatamente.
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

          {/* Aviso documental para crédito em conta */}
          {order.tipoResgate === "credito_conta" && order.status === "aguardando_doc" && (
            <InfoNotice variant="warning"
              title={order.tipoPessoa === "PF" ? "Aguardando RPA do membro (PF)" : "Aguardando Nota Fiscal do membro (PJ)"}>
              {order.tipoPessoa === "PF"
                ? "O membro precisa assinar o RPA (Recibo de Pagamento Autônomo) pelo portal antes que o pagamento seja processado."
                : "O membro PJ precisa emitir e enviar a Nota Fiscal de Serviços pelo portal antes que o pagamento seja processado."}
            </InfoNotice>
          )}

          {order.tipoResgate === "credito_conta" && order.status === "doc_recebido" && (
            <InfoNotice variant="info"
              title={order.tipoPessoa === "PF" ? "RPA recebido — revisar e aprovar" : "Nota Fiscal recebida — revisar e aprovar"}>
              {order.tipoPessoa === "PF"
                ? "O membro enviou o RPA assinado. Revise o documento e aprove para liberar o pagamento via PIX/transferência."
                : "O membro PJ enviou a Nota Fiscal. Revise e aprove para que o financeiro processe a transferência."}
            </InfoNotice>
          )}

          {order.tipoResgate === "credito_conta" && order.status === "creditado" && (
            <InfoNotice variant="success" title="Crédito processado">
              {order.tipoPessoa === "PF"
                ? "Pagamento via PIX/transferência processado. RPA arquivado."
                : "Transferência para a conta PJ processada. NF arquivada."}
            </InfoNotice>
          )}

          {order.status === "entregue" && (
            <InfoNotice variant="success" title="Ciclo concluído">
              Resgate concluído e saldo debitado. Nenhuma ação necessária.
            </InfoNotice>
          )}

          {order.status === "rejeitado" && (
            <InfoNotice variant="warning" title="Resgate rejeitado">
              Nenhum saldo foi debitado. A carteira do membro permanece inalterada.
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
                    {order.memberBalance.toLocaleString("pt-BR")} <span className="text-xs text-muted-foreground">{order.moedaAbrev}</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custo do resgate</span>
                  <span className="font-semibold tabular-nums text-rose-600">
                    −{order.points.toLocaleString("pt-BR")} <span className="text-xs">{order.moedaAbrev}</span>
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saldo após aprovação</span>
                  <span className={`font-bold tabular-nums ${(order.memberBalance - order.points) < 0 ? "text-destructive" : ""}`}>
                    {(order.memberBalance - order.points).toLocaleString("pt-BR")} <span className="text-xs text-muted-foreground">{order.moedaAbrev}</span>
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-muted-foreground">Moeda da campanha</span>
                  <span className="text-xs font-semibold rounded-full border border-border px-2 py-0.5">{order.moedaCampanha}</span>
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

          {/* ── Cards exclusivos de crédito em conta ── */}
          {order.tipoResgate === "credito_conta" && (
            <>
              {/* 1. Dados bancários do membro */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                    Dados para pagamento · {order.tipoPessoa}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {order.tipoPessoa === "PF" ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Chave PIX</span>
                        <span className="font-mono text-xs">123.456.789-00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Banco</span>
                        <span>Bradesco</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Agência / CC</span>
                        <span className="font-mono text-xs">1234 / 56789-0</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CNPJ</span>
                        <span className="font-mono text-xs">12.345.678/0001-90</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Razão social</span>
                        <span className="text-xs">{order.clienteName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Banco</span>
                        <span>Itaú</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Agência / CC</span>
                        <span className="font-mono text-xs">5678 / 12345-6</span>
                      </div>
                    </>
                  )}
                  <div className="pt-1">
                    <p className="text-[10px] text-muted-foreground">
                      Dados cadastrados pelo membro em Minha conta → Dados para recebimento.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Documento recebido (RPA / NF) */}
              {["doc_recebido", "aprovado", "creditado"].includes(order.status) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {order.tipoPessoa === "PF" ? "RPA recebido" : "Nota Fiscal recebida"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs font-medium">
                            {order.tipoPessoa === "PF" ? `RPA-${order.id}.pdf` : `NF-${order.id}.xml`}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Enviado em {order.timeline.find(t => t.status === "doc_recebido")?.date ?? "—"}</p>
                        </div>
                      </div>
                      <button className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0">
                        <Download className="h-3 w-3" />
                        Baixar
                      </button>
                    </div>
                    {order.status === "doc_recebido" && (
                      <p className="text-[10px] text-muted-foreground">
                        Revise o documento antes de aprovar. Após aprovação o pagamento será liberado.
                      </p>
                    )}
                    {order.status === "creditado" && (
                      <div className="flex items-center gap-2 text-xs text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Documento aprovado e arquivado
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 3. Comprovante de pagamento */}
              {["aprovado", "creditado"].includes(order.status) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      Comprovante de pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {order.status === "aprovado" ? (
                      <>
                        <p className="text-xs text-muted-foreground">
                          Após realizar a transferência, registre o comprovante aqui antes de marcar como creditado.
                        </p>
                        <input
                          value={comprovante}
                          onChange={e => setComprovante(e.target.value)}
                          placeholder="Ex: E00000000202406121430... ou número do comprovante"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        <button
                          disabled={!comprovante}
                          onClick={() => setConfirmCreditar(true)}
                          className="w-full rounded-lg bg-primary text-primary-foreground py-2 text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Confirmar crédito na conta
                        </button>
                      </>
                    ) : (
                      <div className="rounded-lg bg-muted/40 px-3 py-2.5 space-y-1">
                        <p className="text-xs text-muted-foreground">Comprovante registrado</p>
                        <p className="text-xs font-mono text-foreground break-all">
                          {comprovante || "E00000000202406121430abc123def456"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}

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
                <div className="flex justify-between py-2.5 border-b border-border last:border-0 text-sm">
                <span className="text-muted-foreground">Origem</span>
                {order.origem === "portal" ? (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-sky-100 text-sky-700">📱 Portal do membro</span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600">🖥 Criado pelo operador</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Saldo debitado ({order.moedaCampanha})</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold tabular-nums">{order.points.toLocaleString("pt-BR")} <span className="text-xs text-muted-foreground">{order.moedaAbrev}</span></span>
                  {!["cancelado", "rejeitado"].includes(order.status) && (
                    <button onClick={abrirEdicaoPontos} title="Editar pontos do resgate" className="text-muted-foreground hover:text-primary">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              {order.ajustes && order.ajustes.length > 0 && (
                <div className="pt-2 mt-2 border-t border-border space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground">Histórico de ajustes manuais</p>
                  {order.ajustes.map((a) => (
                    <div key={a.id} className="text-xs text-muted-foreground">
                      <span className="tabular-nums">{a.pontosAntes.toLocaleString("pt-BR")} → {a.pontosDepois.toLocaleString("pt-BR")}</span>
                      {" · "}{a.motivo} · {a.operador} · {a.data}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Dialogs ── */}
      <ConfirmDialog
        open={confirmApprove}
        onOpenChange={setConfirmApprove}
        title="Aprovar pedido"
        description={`${order.points.toLocaleString("pt-BR")} ${order.moedaCampanha.toLowerCase()} serão debitados do saldo de ${order.memberName} imediatamente. Confirmar aprovação?`}
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
        title="Rejeitar resgate"
        description={`O resgate de ${order.memberName} será recusado. Nenhum saldo será debitado. Confirmar rejeição?`}
        confirmLabel="Sim, rejeitar"
        onConfirm={handleReject}
      />

      <ConfirmDialog
        open={confirmCreditar}
        onOpenChange={setConfirmCreditar}
        title="Confirmar crédito na conta"
        description={`O comprovante ${comprovante} será registrado e o resgate marcado como Creditado. Confirmar?`}
        confirmLabel="Confirmar crédito"
        onConfirm={handleCreditar}
      />

      {/* Modal — Editar pontos do resgate */}
      {editOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditOpen(false)}>
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Editar pontos do resgate</h2>
                <p className="text-xs text-muted-foreground mt-0.5">O ajuste será registrado no histórico deste resgate.</p>
              </div>
              <button onClick={() => setEditOpen(false)} className="text-muted-foreground hover:text-foreground mt-0.5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-lg bg-muted/40 px-4 py-3 text-sm flex justify-between">
              <span className="text-muted-foreground">Valor atual</span>
              <span className="font-semibold tabular-nums">{order.points.toLocaleString("pt-BR")} {order.moedaAbrev}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Novo valor ({order.moedaAbrev}) <span className="text-destructive">*</span></label>
              <input
                type="number" min={0} value={editPontos}
                onChange={(e) => setEditPontos(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Motivo <span className="text-destructive">*</span></label>
              <textarea
                value={editMotivo}
                onChange={(e) => setEditMotivo(e.target.value)}
                placeholder="Descreva o motivo do ajuste. Ex: Correção de pontos calculados incorretamente na aprovação automática."
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
              <p className="text-xs text-muted-foreground">Obrigatório — registrado no histórico para auditoria.</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="flex-1"
                disabled={!editPontos || !editMotivo || editSaving}
                onClick={handleEditarPontos}
              >
                {editSaving ? "Salvando…" : "Confirmar ajuste"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
