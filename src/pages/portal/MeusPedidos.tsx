import { useState } from "react";
import { Badge, Button } from "@kruzer/ds";
import { Package, FileText, Upload, CheckCircle2, X, AlertCircle } from "lucide-react";
import { MOEDA } from "../../config/programa";

// ── Types ─────────────────────────────────────────────────────────────────────

type PedStatus = "solicitado" | "aguardando_doc" | "doc_enviado" | "aprovado" | "em_separacao" | "entregue" | "rejeitado";
type TipoPessoa = "PF" | "PJ";

type Pedido = {
  id: string;
  produto: string;
  categoria: string;
  custo: number;
  data: string;
  status: PedStatus;
  tipoPessoa: TipoPessoa;
  docRef: string | null;
};

// ── Mock ──────────────────────────────────────────────────────────────────────

const PEDIDOS: Pedido[] = [
  {
    id: "PED-001", produto: "Voucher R$50",     categoria: "Voucher",
    custo: 1200, data: "18/06/2025",
    status: "entregue", tipoPessoa: "PF", docRef: "RPA-2025-0038",
  },
  {
    id: "PED-002", produto: "Air Fryer XL",     categoria: "Produto físico",
    custo: 18000, data: "10/06/2025",
    status: "aguardando_doc", tipoPessoa: "PF", docRef: null,
  },
  {
    id: "PED-003", produto: "Notebook Pro 14\"", categoria: "Eletrônico",
    custo: 45000, data: "05/06/2025",
    status: "aguardando_doc", tipoPessoa: "PJ", docRef: null,
  },
  {
    id: "PED-004", produto: "Frete Grátis",     categoria: "Logística",
    custo: 800, data: "28/05/2025",
    status: "doc_enviado", tipoPessoa: "PF", docRef: "RPA-2025-0031",
  },
];

const STATUS_CONFIG: Record<PedStatus, { label: string; variant: "success" | "warning" | "secondary" | "destructive" | "default" }> = {
  solicitado:      { label: "Solicitado",        variant: "warning"     },
  aguardando_doc:  { label: "Aguardando doc.",   variant: "warning"     },
  doc_enviado:     { label: "Doc. enviado",      variant: "default"     },
  aprovado:        { label: "Aprovado",          variant: "default"     },
  em_separacao:    { label: "Em separação",      variant: "secondary"   },
  entregue:        { label: "Entregue",          variant: "success"     },
  rejeitado:       { label: "Rejeitado",         variant: "destructive" },
};

const STEPS: PedStatus[] = ["solicitado", "aguardando_doc", "doc_enviado", "aprovado", "em_separacao", "entregue"];

// ── Componente de modal de documento ─────────────────────────────────────────

function DocModal({
  pedido,
  onClose,
  onSubmit,
}: {
  pedido: Pedido;
  onClose: () => void;
  onSubmit: (id: string) => void;
}) {
  const isPF = pedido.tipoPessoa === "PF";
  const [assinado, setAssinado] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [nome, setNome] = useState("");

  const canSubmit = isPF ? (assinado && nome.trim()) : !!arquivo;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-bold">
                {isPF ? "Assinar RPA" : "Enviar Nota Fiscal"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{pedido.produto} · {pedido.id}</p>
            </div>
          </div>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Contextualização */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            {isPF ? (
              <><strong>RPA — Recibo de Pagamento Autônomo</strong><br/>
              Obrigatório para resgates de crédito em conta de Pessoa Física acima de R$600,00. Ao assinar você confirma o recebimento do valor em {MOEDA.nome.toLowerCase()}.</>
            ) : (
              <><strong>Nota Fiscal de Serviços</strong><br/>
              Obrigatória para resgates de crédito em conta de Pessoa Jurídica. Emita a NF para a Kruzer e faça o upload aqui.</>
            )}
          </div>

          {/* Resumo do pedido */}
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Produto</span><span className="font-medium">{pedido.produto}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Valor em {MOEDA.nome.toLowerCase()}</span><span className="font-semibold text-rose-600">−{pedido.custo.toLocaleString("pt-BR")} {MOEDA.abrev}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tipo</span><span>{pedido.tipoPessoa === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}</span></div>
          </div>

          {isPF ? (
            /* PF — Assinatura do RPA */
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Documento RPA</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Declaro que recebi da Kruzer a quantia de{" "}
                  <strong>{pedido.custo.toLocaleString("pt-BR")} {MOEDA.abrev}</strong>{" "}
                  referente ao resgate do item <strong>{pedido.produto}</strong> (Pedido {pedido.id}),
                  conforme regulamento do programa de fidelidade. Declaro ainda estar em conformidade com
                  as obrigações fiscais aplicáveis.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nome completo <span className="text-destructive">*</span></label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Digite seu nome completo para assinar"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={assinado} onChange={e => setAssinado(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
                <span className="text-sm text-foreground leading-snug">
                  Li o documento acima, confirmo os dados e assino o RPA eletronicamente.
                </span>
              </label>
            </div>
          ) : (
            /* PJ — Upload da NF */
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 space-y-1 text-sm">
                <p className="font-medium">Dados para emissão da NF:</p>
                <p className="text-muted-foreground">Razão Social: <strong className="text-foreground">Kruzer Tecnologia LTDA</strong></p>
                <p className="text-muted-foreground">CNPJ: <strong className="text-foreground">00.000.000/0001-00</strong></p>
                <p className="text-muted-foreground">Serviço: <strong className="text-foreground">Bonificação de incentivo</strong></p>
                <p className="text-muted-foreground">Valor: <strong className="text-foreground">{(pedido.custo / 100 * 10).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Upload da Nota Fiscal <span className="text-destructive">*</span></label>
                <label className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 px-4 py-6 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">{arquivo ? arquivo.name : "Clique para selecionar o arquivo"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">PDF, máx. 5MB</p>
                  </div>
                  <input type="file" accept=".pdf" className="hidden"
                    onChange={e => setArquivo(e.target.files?.[0] ?? null)} />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" disabled={!canSubmit} onClick={() => onSubmit(pedido.id)}>
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            {isPF ? "Assinar e enviar" : "Enviar NF"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Timeline de status ────────────────────────────────────────────────────────

function StatusTimeline({ status }: { status: PedStatus }) {
  if (status === "rejeitado") return (
    <div className="text-xs text-rose-600 font-medium mt-2">Pedido rejeitado.</div>
  );
  const idx = STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-1 mt-3">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-1 flex-1 last:flex-none">
          <div className={`h-2 w-2 rounded-full flex-shrink-0 ${i <= idx ? "bg-primary" : "bg-muted"}`} />
          {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < idx ? "bg-primary" : "bg-muted"}`} />}
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MeusPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>(PEDIDOS);
  const [docModal, setDocModal] = useState<Pedido | null>(null);

  const pendentesDoc = pedidos.filter(p => p.status === "aguardando_doc");

  function handleSubmitDoc(id: string) {
    setPedidos(prev => prev.map(p =>
      p.id === id ? { ...p, status: "doc_enviado", docRef: p.tipoPessoa === "PF" ? `RPA-2025-${Date.now().toString().slice(-4)}` : `NF-2025-${Date.now().toString().slice(-4)}` } : p
    ));
    setDocModal(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meus pedidos</h1>
        <p className="text-sm text-muted-foreground mt-1">Acompanhe seus resgates.</p>
      </div>

      {/* Alerta — documentos pendentes */}
      {pendentesDoc.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              {pendentesDoc.length} pedido{pendentesDoc.length > 1 ? "s" : ""} aguardando documento
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Envie o documento necessário para continuar o processamento do resgate.
            </p>
          </div>
        </div>
      )}

      {pedidos.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-3 text-center">
          <Package className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Você ainda não fez nenhum resgate.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map(p => {
            const cfg = STATUS_CONFIG[p.status];
            const aguardandoDoc = p.status === "aguardando_doc";
            return (
              <div key={p.id} className={`rounded-xl border bg-card px-5 py-4 space-y-3 ${aguardandoDoc ? "border-amber-300 bg-amber-50/50" : "border-border"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{p.produto}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.categoria} · {p.data} · {p.tipoPessoa}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                    <span className="text-xs font-semibold text-rose-600 tabular-nums">
                      −{p.custo.toLocaleString("pt-BR")} {MOEDA.abrev}
                    </span>
                  </div>
                </div>

                {/* Documento */}
                {aguardandoDoc && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-amber-600 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-amber-800 mb-0.5">
                          {p.tipoPessoa === "PF" ? "RPA necessário" : "Nota Fiscal necessária"}
                        </p>
                        <p className="text-[10px] text-amber-700">
                          {p.tipoPessoa === "PF"
                            ? "Assine o Recibo de Pagamento Autônomo para liberar o crédito"
                            : "Emita e envie a Nota Fiscal para continuar o resgate"}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={() => setDocModal(p)}>
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      {p.tipoPessoa === "PF" ? "Assinar RPA" : "Enviar NF"}
                    </Button>
                  </div>
                )}

                {/* Documento enviado */}
                {(p.status === "doc_enviado" || p.status === "aprovado" || p.status === "em_separacao" || p.status === "entregue") && p.docRef && (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>Documento enviado: <strong className="font-mono">{p.docRef}</strong></span>
                  </div>
                )}

                <StatusTimeline status={p.status} />

                <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5">
                  <span>Solicitado</span>
                  <span>Aguardando doc.</span>
                  <span>Doc. enviado</span>
                  <span>Aprovado</span>
                  <span>Separação</span>
                  <span>Entregue</span>
                </div>

                <p className="text-[10px] font-mono text-muted-foreground">{p.id}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de documento */}
      {docModal && (
        <DocModal
          pedido={docModal}
          onClose={() => setDocModal(null)}
          onSubmit={handleSubmitDoc}
        />
      )}
    </div>
  );
}
