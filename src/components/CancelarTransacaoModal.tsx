import { useState } from "react";
import { Button, toast } from "@kruzer/ds";
import { X } from "lucide-react";
import { type Transacao, cancelarTransacao } from "../lib/membros";

export function CancelarTransacaoModal({
  membroId, transacao, onClose, onCancelado,
}: {
  membroId: string;
  transacao: Transacao;
  onClose: () => void;
  onCancelado: () => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleConfirmar() {
    if (!motivo) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 350));
    const resultado = cancelarTransacao(membroId, transacao.id, motivo);
    setSaving(false);
    if (!resultado.ok) {
      toast.error(resultado.erro ?? "Não foi possível cancelar essa movimentação.");
      return;
    }
    toast.success("Movimentação cancelada — estorno registrado no extrato.");
    onCancelado();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Cancelar movimentação</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              O lançamento original é mantido no histórico; um estorno de {Math.abs(transacao.valor).toLocaleString("pt-BR")} {transacao.abrev} é criado automaticamente.
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground mt-0.5">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-lg bg-muted/40 px-4 py-3 space-y-0.5">
          <p className="text-sm font-medium">{transacao.descricao}</p>
          <p className="text-xs text-muted-foreground">
            {transacao.data} · {transacao.valor >= 0 ? "+" : ""}{transacao.valor.toLocaleString("pt-BR")} {transacao.abrev}
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Motivo do cancelamento <span className="text-destructive">*</span></label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ex: Lançamento duplicado por erro de integração."
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
          <p className="text-xs text-muted-foreground">Obrigatório — registrado no histórico para auditoria.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Voltar</Button>
          <Button variant="destructive" className="flex-1" disabled={!motivo || saving} onClick={handleConfirmar}>
            {saving ? "Cancelando…" : "Confirmar cancelamento"}
          </Button>
        </div>
      </div>
    </div>
  );
}
