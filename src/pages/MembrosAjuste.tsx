import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Button,
  Progress,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@kruzer/ds";
import { CheckCircle2, AlertCircle } from "lucide-react";

const MEMBERS = [
  { id: "MBR-00312", name: "Aline P.", balance: 5200 },
  { id: "MBR-00210", name: "Bruno C.", balance: 3200 },
  { id: "MBR-00445", name: "Cecília M.", balance: 1800 },
  { id: "MBR-00189", name: "Danilo R.", balance: 760 },
];

const REASONS = [
  "Correção de erro de cálculo",
  "Bônus de boas-vindas manual",
  "Estorno solicitado pelo membro",
  "Ajuste campanha retroativa",
  "Reprocessamento de pedido",
  "Outros",
];

type Status = "idle" | "processing" | "done" | "error";

export default function MembrosAjuste() {
  const [memberId, setMemberId] = useState("");
  const [type, setType] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);

  const selectedMember = MEMBERS.find((m) => m.id === memberId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !amount || !reason) return;

    setStatus("processing");
    setProgress(0);

    const steps = [20, 50, 80, 100];
    steps.forEach((val, i) => {
      setTimeout(() => {
        setProgress(val);
        if (val === 100) setStatus("done");
      }, (i + 1) * 600);
    });
  };

  const handleReset = () => {
    setMemberId("");
    setType("credit");
    setAmount("");
    setReason("");
    setNotes("");
    setStatus("idle");
    setProgress(0);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Ajuste Manual de Saldo</h2>
        <p className="text-sm text-muted-foreground">
          Crédite ou debite pontos com registro de motivo para auditoria.
        </p>
      </div>

      {/* Processing feedback — item 5 */}
      {status === "processing" && (
        <Card className="border-amber-200 bg-amber-50 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-amber-800">Processando ajuste…</span>
            <span className="tabular-nums text-amber-700">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </Card>
      )}

      {status === "done" && (
        <Card className="border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="size-5 shrink-0" />
            <div>
              <p className="font-medium text-sm">Ajuste processado com sucesso.</p>
              <p className="text-xs">
                {type === "credit" ? "+" : "-"}
                {amount} pts para {selectedMember?.name} · Motivo: {reason}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="mt-3" onClick={handleReset}>
            Novo ajuste
          </Button>
        </Card>
      )}

      {status === "error" && (
        <Card className="border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="size-5 shrink-0" />
            <p className="text-sm font-medium">Falha ao processar. Tente novamente.</p>
          </div>
        </Card>
      )}

      {/* Form */}
      {status !== "done" && (
        <Card>
          <CardHeader>
            <CardTitle>Dados do ajuste</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Member select */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Membro</label>
                <Select value={memberId} onValueChange={setMemberId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o membro…" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMBERS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} ({m.id}) — {m.balance.toLocaleString("pt-BR")} pts
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedMember && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Saldo atual:{" "}
                    <span className="font-semibold tabular-nums">
                      {selectedMember.balance.toLocaleString("pt-BR")} pts
                    </span>
                  </p>
                )}
              </div>

              {/* Type + Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Tipo</label>
                  <div className="flex rounded-xl overflow-hidden border border-border">
                    {(["credit", "debit"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`flex-1 py-2 text-sm font-medium transition-colors ${
                          type === t
                            ? t === "credit"
                              ? "bg-emerald-600 text-white"
                              : "bg-red-500 text-white"
                            : "bg-background text-muted-foreground hover:bg-muted/40"
                        }`}
                      >
                        {t === "credit" ? "+ Crédito" : "− Débito"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Quantidade (pts)</label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="ex: 500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Reason — item 14 */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Motivo do ajuste</label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o motivo…" />
                  </SelectTrigger>
                  <SelectContent>
                    {REASONS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Observação{" "}
                  <span className="font-normal text-muted-foreground">(opcional)</span>
                </label>
                <Textarea
                  placeholder="Detalhes adicionais para o log de auditoria…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  type="submit"
                  disabled={status === "processing"}
                  className="min-w-[140px]"
                >
                  {status === "processing" ? "Processando…" : "Confirmar ajuste"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={status === "processing"}
                >
                  Limpar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
