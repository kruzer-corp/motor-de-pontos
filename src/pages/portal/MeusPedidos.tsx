import { useState } from "react";
import { Badge, Button, EmptyState, toast } from "@kruzer/ds";
import { Package, FileText, Ban, RotateCcw, Clock, X } from "lucide-react";
import { type Membro, getMembroLogado, cancelarPedidoResgate, solicitarEstornoPedido, type PedidoResgate } from "../../lib/membros";
import { LIFECYCLE_POR_TIPO, TIPO_RESGATE_LABEL, STATUS_LABEL, type OrderStatus } from "../../config/resgateLifecycle";

const STATUS_VARIANT: Record<OrderStatus, "success" | "warning" | "destructive" | "secondary"> = {
  solicitado:     "warning",
  aguardando_doc: "warning",
  doc_recebido:   "secondary",
  aprovado:       "secondary",
  em_separacao:   "secondary",
  entregue:       "success",
  enviado:        "success",
  creditado:      "success",
  rejeitado:      "destructive",
  cancelado:      "destructive",
};

// ── Cancelar pedido ────────────────────────────────────────────────────────────

function CancelarPedidoModal({ membroId, pedido, onClose, onCancelado }: {
  membroId: string; pedido: PedidoResgate; onClose: () => void; onCancelado: () => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleConfirmar() {
    if (!motivo.trim()) return;
    setSalvando(true);
    await new Promise((r) => setTimeout(r, 350));
    const resultado = cancelarPedidoResgate(membroId, pedido.id, motivo);
    setSalvando(false);
    if (!resultado.ok) {
      toast.error(resultado.erro ?? "Não foi possível cancelar esse pedido.");
      return;
    }
    onCancelado();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-bold">Cancelar pedido</h2>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="rounded-lg bg-muted/40 px-4 py-3 text-sm">
          <p className="font-medium">{pedido.produto}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {pedido.pontos.toLocaleString("pt-BR")} {pedido.abrev} serão devolvidos ao seu saldo.
          </p>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Motivo <span className="text-destructive">*</span></label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Por que você quer cancelar esse pedido?"
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Voltar</Button>
          <Button variant="destructive" className="flex-1" disabled={!motivo.trim() || salvando} onClick={handleConfirmar}>
            {salvando ? "Cancelando…" : "Confirmar cancelamento"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Solicitar estorno (pedido já finalizado) ───────────────────────────────────

function SolicitarEstornoModal({ membroId, pedido, onClose, onSolicitado }: {
  membroId: string; pedido: PedidoResgate; onClose: () => void; onSolicitado: () => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleConfirmar() {
    if (!motivo.trim()) return;
    setSalvando(true);
    await new Promise((r) => setTimeout(r, 350));
    const resultado = solicitarEstornoPedido(membroId, pedido.id, motivo);
    setSalvando(false);
    if (!resultado.ok) {
      toast.error(resultado.erro ?? "Não foi possível enviar a solicitação.");
      return;
    }
    onSolicitado();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-bold">Solicitar estorno</h2>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="rounded-lg bg-muted/40 px-4 py-3 text-sm">
          <p className="font-medium">{pedido.produto}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Esse resgate já foi {STATUS_LABEL[pedido.status].toLowerCase()} — um analista vai avaliar seu pedido antes de estornar {pedido.pontos.toLocaleString("pt-BR")} {pedido.abrev}.
          </p>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Motivo <span className="text-destructive">*</span></label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Por que você quer o estorno desse resgate?"
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Voltar</Button>
          <Button className="flex-1" disabled={!motivo.trim() || salvando} onClick={handleConfirmar}>
            {salvando ? "Enviando…" : "Enviar solicitação"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Timeline de status — segue o lifecycle real do tipo do pedido ─────────────

function StatusTimeline({ pedido }: { pedido: PedidoResgate }) {
  if (pedido.status === "cancelado" || pedido.status === "rejeitado") {
    return <div className="text-xs text-rose-600 font-medium mt-2">Pedido {STATUS_LABEL[pedido.status].toLowerCase()}.</div>;
  }
  const steps = LIFECYCLE_POR_TIPO[pedido.tipo];
  const idx = steps.indexOf(pedido.status);
  return (
    <div className="space-y-1.5 mt-3">
      <div className="flex items-center gap-1">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1 last:flex-none">
            <div className={`h-2 w-2 rounded-full flex-shrink-0 ${i <= idx ? "bg-primary" : "bg-muted"}`} />
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < idx ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        {steps.map((s) => <span key={s}>{STATUS_LABEL[s]}</span>)}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MeusPedidos() {
  const [membro, setMembro] = useState<Membro | undefined>(() => getMembroLogado());
  const [cancelando, setCancelando] = useState<PedidoResgate | null>(null);
  const [solicitandoEstorno, setSolicitandoEstorno] = useState<PedidoResgate | null>(null);

  if (!membro) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Meus pedidos</h1>
          <p className="text-sm text-muted-foreground mt-1">Acompanhe seus resgates.</p>
        </div>
        <EmptyState icon={Package} title="Nenhum membro cadastrado ainda"
          description="Assim que houver um membro no programa, esta tela mostra os pedidos dele." />
      </div>
    );
  }

  const pedidos = membro.pedidos;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meus pedidos</h1>
        <p className="text-sm text-muted-foreground mt-1">Acompanhe seus resgates.</p>
      </div>

      {pedidos.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-3 text-center">
          <Package className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Você ainda não fez nenhum resgate.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((p) => {
            const finalizado = p.status === "entregue" || p.status === "enviado" || p.status === "creditado";
            const podeCancel = !p.canceladoEm && !finalizado && p.status !== "cancelado" && p.status !== "rejeitado";
            const estornoEmAnalise = !!p.estornoSolicitadoEm && !p.estornoRecusadoEm;
            const podeSolicitarEstorno = finalizado && !p.canceladoEm && !estornoEmAnalise;
            return (
              <div key={p.id} className="rounded-xl border border-border bg-card px-5 py-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{p.produto}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {TIPO_RESGATE_LABEL[p.tipo]} · {p.data}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Badge variant={STATUS_VARIANT[p.status]} className="text-xs">{STATUS_LABEL[p.status]}</Badge>
                    <span className="text-xs font-semibold text-rose-600 tabular-nums">
                      −{p.pontos.toLocaleString("pt-BR")} {p.abrev}
                    </span>
                  </div>
                </div>

                {p.tipo === "credito_conta" && !p.canceladoEm && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span>Um documento fiscal (RPA/NF, conforme seu cadastro) é emitido automaticamente pra esse crédito.</span>
                  </div>
                )}

                <StatusTimeline pedido={p} />

                {estornoEmAnalise && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>Estorno solicitado em {p.estornoSolicitadoEm} — em análise pelo time.</span>
                  </div>
                )}

                {p.estornoRecusadoEm && (
                  <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                    Solicitação de estorno recusada em {p.estornoRecusadoEm}: {p.motivoRecusaEstorno}
                  </div>
                )}

                <div className="flex items-center justify-between pt-0.5">
                  <p className="text-[10px] font-mono text-muted-foreground">{p.id}</p>
                  {podeCancel && (
                    <button onClick={() => setCancelando(p)}
                      className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-rose-600 transition-colors">
                      <Ban className="h-3 w-3" />
                      Cancelar pedido
                    </button>
                  )}
                  {podeSolicitarEstorno && (
                    <button onClick={() => setSolicitandoEstorno(p)}
                      className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors">
                      <RotateCcw className="h-3 w-3" />
                      Solicitar estorno
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {cancelando && (
        <CancelarPedidoModal
          membroId={membro.id}
          pedido={cancelando}
          onClose={() => setCancelando(null)}
          onCancelado={() => setMembro(getMembroLogado())}
        />
      )}

      {solicitandoEstorno && (
        <SolicitarEstornoModal
          membroId={membro.id}
          pedido={solicitandoEstorno}
          onClose={() => setSolicitandoEstorno(null)}
          onSolicitado={() => setMembro(getMembroLogado())}
        />
      )}
    </div>
  );
}
