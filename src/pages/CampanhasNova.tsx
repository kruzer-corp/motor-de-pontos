import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button, Input, Label, PageHeader, Select, SelectContent,
  SelectItem, SelectTrigger, SelectValue, Switch, toast,
} from "@kruzer/ds";
import { CheckCircle2, Upload, X, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { MOEDA } from "../config/programa";
import { FILIAIS } from "../config/filiais";
import { TIERS } from "../config/segmentacao";
import { renderCrumbLink } from "../lib/crumbLink";
import {
  type Form, type Campanha,
  DEFAULTS, getCampanha, upsertCampanha, novoIdCampanha,
} from "../lib/campanhas";
import { getProdutos } from "../lib/produtos";

// ── Steps ─────────────────────────────────────────────────────────────────────
// Acúmulo, resgate e multiplicadores são sempre definidos na Mecânica do Programa —
// a campanha só decide elegibilidade (quem/o quê/quando participa).

const STEPS = [
  { num: 1, label: "Detalhes" },
  { num: 2, label: "Fontes" },
  { num: 3, label: "Elegibilidade" },
  { num: 4, label: "Produtos" },
  { num: 5, label: "Limites" },
  { num: 6, label: "Revisão" },
];

// ── Form state ────────────────────────────────────────────────────────────────

// ── Fontes de integração disponíveis ─────────────────────────────────────────

const FONTES_DISPONIVEIS = [
  {
    id: "portal",
    nome: "Portal B2C",
    canal: "App Mobile",
    sistema: "Motor de Pontos · Portal do membro",
    conectado: true,
    eventoConcessao: "order.confirmed",
    eventoAnulacao: "order.cancelled",
    icon: "📱",
  },
  {
    id: "pdv",
    nome: "PDV / Loja física",
    canal: "Loja física",
    sistema: "TOTVS Retail",
    conectado: true,
    eventoConcessao: "sale.completed",
    eventoAnulacao: "sale.refunded",
    icon: "🏪",
  },
  {
    id: "ecommerce",
    nome: "E-commerce",
    canal: "Web",
    sistema: "VTEX",
    conectado: false,
    eventoConcessao: "order.invoiced",
    eventoAnulacao: "order.returned",
    icon: "🌐",
  },
  {
    id: "marketplace",
    nome: "Marketplace",
    canal: "Web",
    sistema: "Não configurado",
    conectado: false,
    eventoConcessao: "—",
    eventoAnulacao: "—",
    icon: "🛒",
  },
];

// ── Form state ────────────────────────────────────────────────────────────────

const STATUS_PEDIDO = [
  "Aprovado", "Faturado", "Em separação", "Entregue",
  "Concluído", "Cancelado", "Devolvido", "Recusado",
];

// ── Stepper ───────────────────────────────────────────────────────────────────

function Stepper({ current, steps }: { current: number; steps: typeof STEPS }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, idx) => {
        const done    = s.num < current;
        const active  = s.num === current;
        const isLast  = idx === steps.length - 1;
        return (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                done   ? "bg-foreground border-foreground text-background"
                : active ? "bg-foreground border-foreground text-background"
                : "bg-background border-border text-muted-foreground"
              }`}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
              </div>
              <span className={`text-xs whitespace-nowrap text-center max-w-[100px] leading-tight ${
                active ? "font-semibold text-foreground" : "text-muted-foreground"
              }`}>
                {s.label}
              </span>
            </div>
            {!isLast && (
              <div className={`h-px w-12 mx-2 mb-5 shrink-0 ${s.num < current ? "bg-foreground" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Steps 2 (Fontes) e 4 (Produtos) só existem pra campanha por pedido —
// não fazem sentido quando a campanha pontua por evento (sem compra/venda envolvida).
function stepsVisiveis(gatilhoTipo: "pedido" | "evento") {
  return gatilhoTipo === "evento" ? STEPS.filter((s) => ![2, 4].includes(s.num)) : STEPS;
}

function proximoStep(atual: number, direcao: 1 | -1, gatilhoTipo: "pedido" | "evento"): number {
  const visiveis = stepsVisiveis(gatilhoTipo).map((s) => s.num);
  const idx = visiveis.indexOf(atual);
  const novoIdx = idx + direcao;
  return novoIdx < 0 || novoIdx >= visiveis.length ? atual : visiveis[novoIdx];
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {hint && <p className="text-xs text-muted-foreground -mt-0.5">{hint}</p>}
      {children}
    </div>
  );
}

// ── Review row ────────────────────────────────────────────────────────────────

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CampanhasNova() {
  const navigate  = useNavigate();
  const { id } = useParams<{ id: string }>();
  const existente = id ? getCampanha(id) : undefined;
  const editando = !!existente;
  const jaPublicada = editando && existente!.status !== "rascunho" && existente!.status !== "agendada";
  const [campanhaId] = useState(() => existente?.id ?? novoIdCampanha());
  const PRODUTOS_CATALOGO = getProdutos().filter((p) => p.status === "ativo");

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>(existente ?? DEFAULTS);
  const [published, setPublished] = useState(false);
  const [publicarModo, setPublicarModo] = useState<"agora" | "agendar">("agora");
  const [dataAgendada, setDataAgendada] = useState("");
  const [agendado, setAgendado] = useState(false);
  const [importOpen,   setImportOpen]   = useState(false);
  const [importStep,   setImportStep]   = useState<"upload" | "status">("upload");
  const [importFile,   setImportFile]   = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    encontrados: { id: string; nome: string; sku: string; categoria: string }[];
    naoEncontrados: string[];
  } | null>(null);

  function processarArquivo(file: File) {
    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // Extrai SKUs: pega todas as células que parecem SKUs (letras, números, hifens)
      const tokens = text.split(/[\n\r,;\t]+/).map(s => s.trim().replace(/['"]/g, "").toUpperCase()).filter(Boolean);
      const encontrados = PRODUTOS_CATALOGO.filter(p => tokens.includes(p.sku.toUpperCase()));
      const skusEncontrados = new Set(encontrados.map(p => p.sku.toUpperCase()));
      const naoEncontrados = tokens.filter(t => t.length > 2 && !skusEncontrados.has(t));
      setImportResult({ encontrados, naoEncontrados: Array.from(new Set(naoEncontrados)) });
      setImportStep("status");
    };
    reader.readAsText(file);
  }

  function confirmarImport() {
    if (!importResult) return;
    const ids = importResult.encontrados.map(p => p.id);
    set("produtosElegiveis", Array.from(new Set([...form.produtosElegiveis, ...ids])));
    toast.success(`${importResult.encontrados.length} produto(s) importado(s) com sucesso`);
    resetImport();
  }

  function resetImport() {
    setImportOpen(false);
    setImportStep("upload");
    setImportFile(null);
    setImportResult(null);
  }

  const set = (key: keyof Form, value: Form[keyof Form]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canContinue = () => {
    if (step === 1) return !!form.nome;
    return true;
  };

  function persistir(status: Campanha["status"], agendadaPara?: string) {
    const campanha: Campanha = {
      ...form,
      id: campanhaId,
      status,
      color: existente?.color ?? "bg-slate-500",
      agendadaPara,
    };
    upsertCampanha(campanha);
  }

  function salvarComoRascunho() {
    if (jaPublicada) {
      persistir(existente!.status, existente!.agendadaPara);
      toast.success("Alterações salvas");
    } else {
      persistir("rascunho");
      toast.success("Rascunho salvo");
    }
    navigate("/campanhas");
  }

  function handlePublish() {
    if (publicarModo === "agendar" && dataAgendada) {
      const agendadaParaFmt = new Date(dataAgendada).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
      persistir("agendada", agendadaParaFmt);
      setAgendado(true);
      setPublished(true);
      toast.success(`Campanha "${form.nome}" agendada com sucesso`);
    } else {
      persistir("ativa");
      setAgendado(false);
      setPublished(true);
      toast.success(`Campanha "${form.nome}" publicada com sucesso`);
    }
  }

  if (published) {
    const dataAgendadaFmt = dataAgendada
      ? new Date(dataAgendada).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
      : "";
    return (
      <div className="max-w-md mx-auto text-center pt-16 space-y-5">
        <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{agendado ? "Campanha agendada!" : "Campanha publicada!"}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {agendado ? `${form.nome} entrará em vigência em ${dataAgendadaFmt}.` : `${form.nome} está ativa agora.`}
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate("/campanhas")}>Ver campanhas</Button>
          <Button variant="outline" onClick={() => { setForm(DEFAULTS); setStep(1); setPublished(false); setAgendado(false); setDataAgendada(""); setPublicarModo("agora"); }}>
            Criar outra
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <PageHeader
        title={editando ? `Editar campanha — ${form.nome || existente?.nome}` : "Nova campanha"}
        path={[{ label: "Operação" }, { label: "Minhas Campanhas", to: "/campanhas" }]}
        renderCrumbLink={renderCrumbLink}
      />

      <div className="max-w-2xl mx-auto pt-6">
        <Stepper current={step} steps={stepsVisiveis(form.gatilhoTipo)} />

        {/* ── Step 1: Detalhes e vigências ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold">Defina as características da sua nova campanha</h3>
            </div>

            <Field label="Código">
              <Input value={form.codigo} onChange={(e) => set("codigo", e.target.value)} />
            </Field>

            <Field label="Nome" required>
              <Input
                value={form.nome}
                onChange={(e) => set("nome", e.target.value)}
                placeholder="Digite o nome para essa campanha"
              />
            </Field>

            <Field label="Descrição">
              <textarea
                value={form.descricao}
                onChange={(e) => set("descricao", e.target.value)}
                placeholder="Caso desejar, você pode acrescentar uma breve descrição aqui"
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </Field>

            <Field label="Quando esta campanha pontua?" hint="Muda o que aparece nos próximos passos.">
              <div className="grid grid-cols-2 gap-3">
                {([
                  ["pedido", "Em pedidos elegíveis", "Pontua a cada compra/venda que bater com as regras desta campanha."],
                  ["evento", "Na entrada no programa", "Pontua quando o membro se cadastra no programa (boas-vindas) — sem depender de compra/venda."],
                ] as const).map(([value, label, desc]) => (
                  <label key={value} className={`flex flex-col gap-1 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                    form.gatilhoTipo === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  }`}>
                    <input type="radio" name="gatilhoTipo" value={value} checked={form.gatilhoTipo === value}
                      onChange={() => set("gatilhoTipo", value)} className="sr-only" />
                    <span className="text-sm font-semibold">{label}</span>
                    <span className="text-xs text-muted-foreground">{desc}</span>
                  </label>
                ))}
              </div>
            </Field>

            {form.gatilhoTipo === "evento" && (
              <div className="rounded-md bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                Único evento possível hoje além de pedido: entrada do membro no programa (boas-vindas).
              </div>
            )}

            <Field label="Tier elegível" hint="Deixe sem seleção para valer para todos os tiers.">
              <div className="flex flex-wrap gap-2">
                {TIERS.map((t) => {
                  const sel = form.tiersElegiveis.includes(t.id);
                  return (
                    <button key={t.id} type="button"
                      onClick={() => set("tiersElegiveis", sel
                        ? form.tiersElegiveis.filter((id) => id !== t.id)
                        : [...form.tiersElegiveis, t.id]
                      )}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                        sel ? t.corChip + " ring-1 ring-offset-1 ring-primary/40" : "border-border text-muted-foreground bg-background hover:border-primary/40"
                      }`}>
                      {t.nome}
                    </button>
                  );
                })}
              </div>
            </Field>

          </div>
        )}

        {/* ── Step 2: Fontes de eventos ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="mb-6">
              <h3 className="text-lg font-semibold">De quais fontes esta campanha escuta eventos?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Selecione os sistemas conectados que alimentam esta campanha. Cada fonte envia eventos que disparam o acúmulo de {MOEDA.nome.toLowerCase()}.
              </p>
            </div>

            <div className="space-y-3">
              {FONTES_DISPONIVEIS.map((fonte) => {
                const ativa = (form.fontes as Record<string, boolean>)[fonte.id] ?? false;
                return (
                  <div key={fonte.id} className={`rounded-lg border px-4 py-4 transition-colors ${
                    !fonte.conectado ? "border-border opacity-60" :
                    ativa ? "border-primary/40 bg-primary/5" : "border-border"
                  }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">{fonte.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{fonte.nome}</p>
                            {fonte.conectado ? (
                              <span className="rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5">Conectado</span>
                            ) : (
                              <span className="rounded-full bg-muted text-muted-foreground text-[10px] font-semibold px-2 py-0.5">Não configurado</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{fonte.sistema} · Canal: {fonte.canal}</p>
                          {fonte.conectado && (
                            <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground font-mono">
                              <span>concessão: <strong className="text-foreground">{fonte.eventoConcessao}</strong></span>
                              <span>anulação: <strong className="text-foreground">{fonte.eventoAnulacao}</strong></span>
                            </div>
                          )}
                          {!fonte.conectado && (
                            <button className="text-[10px] text-primary hover:underline mt-1">
                              Configurar integração →
                            </button>
                          )}
                        </div>
                      </div>
                      <Switch
                        size="sm"
                        disabled={!fonte.conectado}
                        checked={ativa && fonte.conectado}
                        onCheckedChange={(v) => set("fontes", { ...(form.fontes as Record<string, boolean>), [fonte.id]: v })}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sub-seleção de filiais PDV */}
            {(form.fontes as Record<string, boolean>)["pdv"] && (
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b border-border">
                  <p className="text-sm font-semibold">Filiais PDV desta campanha</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Escolha se a campanha vale para todas as lojas ou apenas filiais específicas.</p>
                </div>
                <div className="px-4 py-4 space-y-3">
                  <div className="flex gap-4">
                    {([["todas", "Todas as filiais"], ["especificas", "Filiais específicas"]] as const).map(([v, label]) => (
                      <label key={v} className={`flex items-center gap-2 cursor-pointer rounded-lg border px-4 py-2.5 flex-1 transition-colors ${
                        form.pdvEscopo === v ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}>
                        <input type="radio" name="pdvEscopo" value={v} checked={form.pdvEscopo === v}
                          onChange={() => set("pdvEscopo", v)} className="accent-primary" />
                        <span className="text-sm font-medium">{label}</span>
                      </label>
                    ))}
                  </div>

                  {form.pdvEscopo === "especificas" && (
                    <div className="rounded-md border border-input overflow-hidden">
                      {FILIAIS.filter(f => f.canal === "PDV").map(f => {
                        const sel = (form.pdvFiliais as string[]).includes(f.id);
                        return (
                          <label key={f.id} className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 border-b border-border last:border-0 ${!f.ativa ? "opacity-50 pointer-events-none" : ""}`}>
                            <input type="checkbox" className="accent-primary h-4 w-4 shrink-0" checked={sel}
                              disabled={!f.ativa}
                              onChange={() => set("pdvFiliais", sel
                                ? (form.pdvFiliais as string[]).filter(id => id !== f.id)
                                : [...(form.pdvFiliais as string[]), f.id]
                              )} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{f.nome}</p>
                              <p className="text-xs text-muted-foreground font-mono">{f.codigo} · {f.regiao}</p>
                            </div>
                            {!f.ativa && (
                              <span className="text-[10px] text-muted-foreground border border-border rounded-full px-2 py-0.5">Inativa</span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {form.pdvEscopo === "especificas" && (form.pdvFiliais as string[]).length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {(form.pdvFiliais as string[]).length} filial(is) selecionada(s)
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Fontes ativas */}
            {Object.values(form.fontes as Record<string, boolean>).some(Boolean) && (
              <p className="text-xs text-muted-foreground">
                {Object.entries(form.fontes as Record<string, boolean>).filter(([, v]) => v).length} fonte(s) ativa(s) nesta campanha.
              </p>
            )}
          </div>
        )}

        {/* ── Step 3: Elegibilidade e pontos ── */}
        {step === 3 && (
          <div className="space-y-7">
            <div className="mb-6">
              <h3 className="text-lg font-semibold">Elegibilidade</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {form.gatilhoTipo === "pedido"
                  ? "Defina quando esta campanha concede e quando anula — a taxa de acúmulo é sempre a da Mecânica do Programa."
                  : "Defina o bônus fixo concedido quando o evento acontece."}
              </p>
            </div>

            {form.gatilhoTipo === "evento" && (
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b border-border">
                  <p className="text-sm font-semibold">Bônus do evento <span className="text-xs text-muted-foreground font-normal ml-1">valor fixo — única exceção à regra de acúmulo do programa</span></p>
                </div>
                <div className="px-4 py-4 space-y-3">
                  <div className="space-y-1 max-w-xs">
                    <Label className="text-xs">{MOEDA.nome} por evento</Label>
                    <Input type="number" value={form.taxaValor} onChange={(e) => set("taxaValor", e.target.value)}
                      placeholder="Ex: 50" />
                  </div>
                  {form.taxaValor && (
                    <div className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                      Cada ocorrência do evento credita {Number(form.taxaValor).toLocaleString("pt-BR")} {MOEDA.nome.toLowerCase()} ao membro.
                    </div>
                  )}
                </div>
              </div>
            )}

            {form.gatilhoTipo === "pedido" ? (
              <>
                {/* Status para conceder */}
                <div className="space-y-2">
                  <Label className="text-sm">
                    Status de pedido para <strong>conceder</strong> {MOEDA.nome.toLowerCase()}
                    <span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Marque quando você deseja disponibilizar os {MOEDA.nome.toLowerCase()}/bônus ao membro.
                  </p>
                  <div className="rounded-md border border-input overflow-hidden">
                    {STATUS_PEDIDO.map((s) => (
                      <label
                        key={s}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 border-b border-border last:border-0"
                      >
                        <input
                          type="checkbox"
                          className="accent-primary h-4 w-4 shrink-0"
                          checked={(form.statusConceder as Record<string, boolean>)[s] ?? false}
                          onChange={(e) => set("statusConceder", { ...(form.statusConceder as Record<string, boolean>), [s]: e.target.checked })}
                        />
                        <span className="text-sm">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status para anular */}
                <div className="space-y-2">
                  <Label className="text-sm">
                    Status de pedido para <strong>anular</strong> {MOEDA.nome.toLowerCase()}
                    <span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Marque quais casos você deseja estornar os {MOEDA.nome.toLowerCase()}/bônus.
                  </p>
                  <div className="rounded-md border border-input overflow-hidden">
                    {STATUS_PEDIDO.map((s) => (
                      <label
                        key={s}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 border-b border-border last:border-0"
                      >
                        <input
                          type="checkbox"
                          className="accent-primary h-4 w-4 shrink-0"
                          checked={(form.statusAnular as Record<string, boolean>)[s] ?? false}
                          onChange={(e) => set("statusAnular", { ...(form.statusAnular as Record<string, boolean>), [s]: e.target.checked })}
                        />
                        <span className="text-sm">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-md bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                Gatilho por evento concede os pontos quando o evento selecionado acima acontece — não depende de status de pedido.
              </div>
            )}

          </div>
        )}

        {/* ── Step 4: Produtos da campanha ── */}
        {step === 4 && (
          <div className="space-y-7">
            <div className="mb-6">
              <h3 className="text-lg font-semibold">Produtos da campanha</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Selecione quais itens participam desta campanha.
              </p>
            </div>

            {/* Produtos elegíveis */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Produtos elegíveis</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Selecione individualmente ou importe uma lista de SKUs em lote.</p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0" onClick={() => setImportOpen(true)}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />Importar SKUs
                </Button>
              </div>
              <div className="px-4 py-4 space-y-3">
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Marcar todos de uma categoria:</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(PRODUTOS_CATALOGO.map((p) => p.categoria))).map((cat) => {
                      const idsCategoria = PRODUTOS_CATALOGO.filter((p) => p.categoria === cat).map((p) => p.id);
                      const todosSelecionados = idsCategoria.every((id) => form.produtosElegiveis.includes(id));
                      return (
                        <button key={cat} type="button"
                          onClick={() => set("produtosElegiveis", todosSelecionados
                            ? form.produtosElegiveis.filter((id) => !idsCategoria.includes(id))
                            : Array.from(new Set([...form.produtosElegiveis, ...idsCategoria])))}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                            todosSelecionados ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                          }`}>
                          {cat} ({idsCategoria.length})
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="rounded-md border border-input overflow-hidden">
                  {PRODUTOS_CATALOGO.map((p) => {
                    const selecionado = form.produtosElegiveis.includes(p.id);
                    return (
                      <label key={p.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 border-b border-border last:border-0">
                        <input type="checkbox" className="accent-primary h-4 w-4 shrink-0" checked={selecionado}
                          onChange={() => set("produtosElegiveis", selecionado ? form.produtosElegiveis.filter((id) => id !== p.id) : [...form.produtosElegiveis, p.id])} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{p.nome}</p>
                          <p className="text-xs text-muted-foreground">{p.categoria} · {p.sku}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
                {form.produtosElegiveis.length > 0 && (
                  <p className="text-xs text-muted-foreground">{form.produtosElegiveis.length} produto(s) selecionado(s)</p>
                )}
              </div>
            </div>

            {/* Exceções de categoria */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <p className="text-sm font-semibold">Exceções de categoria</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Categorias marcadas aqui não geram {MOEDA.nome.toLowerCase()} nesta campanha, mesmo se o produto estiver no catálogo.
                </p>
              </div>
              <div className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(PRODUTOS_CATALOGO.map((p) => p.categoria))).map((cat) => {
                    const sel = form.categoriasExcluidas.includes(cat);
                    return (
                      <button key={cat} type="button"
                        onClick={() => set("categoriasExcluidas", sel
                          ? form.categoriasExcluidas.filter((c) => c !== cat)
                          : [...form.categoriasExcluidas, cat])}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                          sel ? "bg-rose-100 text-rose-700 border-rose-200 ring-1 ring-offset-1 ring-primary/40" : "border-border text-muted-foreground bg-background hover:border-primary/40"
                        }`}>
                        {cat}
                      </button>
                    );
                  })}
                </div>
                {form.categoriasExcluidas.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-3">{form.categoriasExcluidas.length} categoria(s) excluída(s)</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 5: Limites e vigência ── */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold">Limites e vigência</h3>
              <p className="text-sm text-muted-foreground mt-1">Configure o período de vigência da campanha, quando os {MOEDA.nome.toLowerCase()} ficam disponíveis, quando expiram, teto de acúmulo e o que acontece em caso de cancelamento.</p>
            </div>

            {/* Vigência da campanha */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <p className="text-sm font-semibold">Vigência da campanha <span className="text-xs text-muted-foreground font-normal ml-1">período em que a campanha fica ativa</span></p>
              </div>
              <div className="px-4 py-4">
                <div className="flex items-center gap-2 max-w-sm">
                  <Input
                    type="date" value={form.periodoInicio}
                    onChange={(e) => set("periodoInicio", e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-muted-foreground text-sm shrink-0">→</span>
                  <Input
                    type="date" value={form.periodoFim}
                    onChange={(e) => set("periodoFim", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Liberação */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <p className="text-sm font-semibold">Liberação <span className="text-xs text-muted-foreground font-normal ml-1">quando os {MOEDA.nome.toLowerCase()} ficam disponíveis para resgate</span></p>
              </div>
              <div className="px-4 py-4 space-y-3">
                {[
                  { value: "imediato", label: "Imediatamente após o status de concessão", desc: "{`${MOEDA.nome} entram na carteira assim que o status é atingido.`}" },
                  { value: "dias",     label: "Após N dias do status de concessão",       desc: "Janela de segurança antes da liberação — evita acúmulo prematuro." },
                ].map(({ value, label, desc }) => (
                  <label key={value} className="flex items-start gap-3 cursor-pointer">
                    <input type="radio" name="liberacaoTipo" value={value} checked={form.liberacaoTipo === value}
                      onChange={() => set("liberacaoTipo", value)} className="mt-1 accent-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                      {value === "dias" && form.liberacaoTipo === "dias" && (
                        <div className="flex items-center gap-2 mt-2">
                          <Input type="number" value={form.liberacaoDias} onChange={(e) => set("liberacaoDias", e.target.value)} className="w-20" min={1} />
                          <span className="text-sm text-muted-foreground">dias</span>
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Expiração por campanha */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <p className="text-sm font-semibold">Expiração <span className="text-xs text-muted-foreground font-normal ml-1">quando os {MOEDA.nome.toLowerCase()} desta campanha expiram</span></p>
              </div>
              <div className="px-4 py-4 space-y-3">
                {[
                  { value: "herdar",     label: "Herdar da Mecânica do Programa",   desc: "Usa a política global de expiração configurada em Configuração → Mecânica." },
                  { value: "meses",      label: "N meses após o crédito",           desc: "Expiração específica desta campanha, independente da política global." },
                  { value: "data_fixa",  label: "Data fixa",                        desc: `Todos os ${MOEDA.nome.toLowerCase()} desta campanha expiram na mesma data.` },
                ].map(({ value, label, desc }) => (
                  <label key={value} className="flex items-start gap-3 cursor-pointer">
                    <input type="radio" name="expiracaoTipo" value={value} checked={form.expiracaoTipo === value}
                      onChange={() => set("expiracaoTipo", value)} className="mt-1 accent-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                      {value === "meses" && form.expiracaoTipo === "meses" && (
                        <div className="flex items-center gap-2 mt-2">
                          <Input type="number" value={form.expiracaoMeses} onChange={(e) => set("expiracaoMeses", e.target.value)} className="w-20" min={1} />
                          <span className="text-sm text-muted-foreground">meses após o crédito</span>
                        </div>
                      )}
                      {value === "data_fixa" && form.expiracaoTipo === "data_fixa" && (
                        <div className="mt-2">
                          <Input type="date" value={form.expiracaoData} onChange={(e) => set("expiracaoData", e.target.value)} className="w-48" />
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Limite */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
                <p className="text-sm font-semibold">Limite de acúmulo <span className="text-xs text-muted-foreground font-normal ml-1">teto de {MOEDA.nome.toLowerCase()} por membro</span></p>
                <Switch size="sm" checked={form.limiteAtivo} onCheckedChange={(v) => set("limiteAtivo", v)} />
              </div>
              {form.limiteAtivo && (
                <div className="px-4 py-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Input type="number" value={form.limitePts} onChange={(e) => set("limitePts", e.target.value)} placeholder="Ex: 1000" className="w-32" />
                    <span className="text-sm text-muted-foreground">{MOEDA.abrev}</span>
                    <Select value={form.limiteEscopo} onValueChange={(v) => set("limiteEscopo", v)}>
                      <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="membro_campanha">por membro / por campanha</SelectItem>
                        <SelectItem value="membro_dia">por membro / por dia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">O membro para de acumular nesta campanha ao atingir o teto. Compras adicionais não geram {MOEDA.nome.toLowerCase()}.</p>
                </div>
              )}
              {!form.limiteAtivo && (
                <div className="px-4 py-3 text-xs text-muted-foreground">Sem limite — o membro acumula {MOEDA.nome.toLowerCase()} sem teto nesta campanha.</div>
              )}
            </div>

            {/* Teto de emissão */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Teto de emissão <span className="text-xs text-muted-foreground font-normal ml-1">orçamento total da campanha</span></p>
                </div>
                <Switch size="sm" checked={form.tetoEmissaoAtivo} onCheckedChange={(v) => set("tetoEmissaoAtivo", v)} />
              </div>
              {form.tetoEmissaoAtivo && (
                <div className="px-4 py-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Input type="number" value={form.tetoEmissaoPts} onChange={(e) => set("tetoEmissaoPts", e.target.value)} placeholder="Ex: 500000" className="w-40" />
                    <span className="text-sm text-muted-foreground">{MOEDA.abrev} no total</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Quando a campanha atingir esse volume acumulado entre todos os membros, novos acúmulos são bloqueados automaticamente — independente do limite individual por membro.</p>
                </div>
              )}
              {!form.tetoEmissaoAtivo && (
                <div className="px-4 py-3 text-xs text-muted-foreground">Sem teto — a campanha emite {MOEDA.nome.toLowerCase()} sem limite de orçamento total.</div>
              )}
            </div>

            {/* Cancelamento / estorno — só existe pedido no gatilho "pedido" */}
            {form.gatilhoTipo === "pedido" && (
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b border-border">
                  <p className="text-sm font-semibold">Cancelamento / estorno <span className="text-xs text-muted-foreground font-normal ml-1">o que acontece quando o pedido é cancelado</span></p>
                </div>
                <div className="px-4 py-4 space-y-3">
                  {[
                    { value: "estornar_tudo",        label: "Estornar todos os pontos",       desc: "Política padrão — todos os pontos acumulados são devolvidos ao pool." },
                    { value: "estornar_proporcional", label: "Estorno proporcional ao valor",  desc: "Se o cancelamento é parcial, estorna apenas os pontos do valor cancelado." },
                    { value: "manter",               label: "Manter os pontos",               desc: "Exceção — o membro mantém os pontos mesmo com cancelamento. Use com cautela." },
                  ].map(({ value, label, desc }) => (
                    <label key={value} className={`flex items-start gap-3 cursor-pointer rounded-lg border px-3 py-2.5 transition-colors ${
                      form.cancelamentoPolicy === value ? "border-primary/40 bg-primary/5" : "border-transparent"
                    }`}>
                      <input type="radio" name="cancelamento" value={value} checked={form.cancelamentoPolicy === value}
                        onChange={() => set("cancelamentoPolicy", value)} className="mt-1 accent-primary" />
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ── Step 6: Revisão ── */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold">Revise antes de publicar</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Confirme as configurações da campanha.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Detalhes</p>
              </div>
              <div className="px-5">
                <ReviewRow label="Código"   value={form.codigo} />
                <ReviewRow label="Nome"     value={form.nome || "—"} />
                <ReviewRow label="Descrição" value={form.descricao || "—"} />
                <ReviewRow label="Tier elegível" value={
                  form.tiersElegiveis.length === 0
                    ? "Todos os tiers"
                    : TIERS.filter((t) => form.tiersElegiveis.includes(t.id)).map((t) => t.nome).join(", ")
                } />
              </div>
            </div>

            {form.gatilhoTipo === "pedido" && (
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-muted/30">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Canais</p>
                </div>
                <div className="px-5">
                  <ReviewRow
                    label="Fontes ativas"
                    value={Object.entries(form.fontes as Record<string,boolean>).filter(([, v]) => v)
                      .map(([k]) => FONTES_DISPONIVEIS.find(f => f.id === k)?.nome ?? k)
                      .join(", ") || "—"}
                  />
                </div>
              </div>
            )}

            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Elegibilidade</p>
              </div>
              <div className="px-5">
                <ReviewRow
                  label="Pontuação"
                  value={
                    form.gatilhoTipo === "evento"
                      ? (form.taxaValor ? `${form.taxaValor} ${MOEDA.nome.toLowerCase()} por evento (bônus fixo)` : "—")
                      : "Definida pela Mecânica do Programa"
                  }
                />
                {form.gatilhoTipo === "pedido" && (
                  <>
                    <ReviewRow
                      label="Conceder em"
                      value={Object.entries(form.statusConceder).filter(([, v]) => v).map(([k]) => k).join(", ") || "—"}
                    />
                    <ReviewRow
                      label="Anular em"
                      value={Object.entries(form.statusAnular).filter(([, v]) => v).map(([k]) => k).join(", ") || "—"}
                    />
                  </>
                )}
              </div>
            </div>

            {form.gatilhoTipo === "pedido" && (
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-muted/30">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Produtos da campanha</p>
                </div>
                <div className="px-5">
                  <ReviewRow
                    label="Produtos elegíveis"
                    value={
                      form.produtosElegiveis.length === 0
                        ? "Todos os produtos"
                        : PRODUTOS_CATALOGO.filter((p) => form.produtosElegiveis.includes(p.id)).map((p) => p.nome).join(", ")
                    }
                  />
                  {form.categoriasExcluidas.length > 0 && (
                    <ReviewRow label="Exceções de categoria" value={form.categoriasExcluidas.join(", ")} />
                  )}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Limites e vigência</p>
              </div>
              <div className="px-5">
                <ReviewRow label="Período"   value={form.periodoInicio && form.periodoFim ? `${form.periodoInicio} → ${form.periodoFim}` : "—"} />
                <ReviewRow label="Liberação" value={form.liberacaoTipo === "imediato" ? "Imediatamente" : `Após ${form.liberacaoDias} dias`} />
                <ReviewRow label="Expiração" value={
                  form.expiracaoTipo === "herdar" ? "Herdar da Mecânica" :
                  form.expiracaoTipo === "meses" ? `${form.expiracaoMeses} meses após crédito` :
                  form.expiracaoData || "—"
                } />
                <ReviewRow label="Limite por membro" value={form.limiteAtivo && form.limitePts ? `${form.limitePts} pts · ${form.limiteEscopo === "membro_campanha" ? "por membro / campanha" : "por membro / dia"}` : "Sem limite"} />
                <ReviewRow label="Teto de emissão" value={form.tetoEmissaoAtivo && form.tetoEmissaoPts ? `${Number(form.tetoEmissaoPts).toLocaleString("pt-BR")} ${MOEDA.abrev} no total` : "Sem teto"} />
                {form.gatilhoTipo === "pedido" && (
                  <ReviewRow label="Cancelamento" value={{ estornar_tudo: "Estornar tudo", estornar_proporcional: "Estorno proporcional", manter: "Manter pontos" }[form.cancelamentoPolicy]} />
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/20 px-5 py-3.5">
              <p className="text-xs text-muted-foreground">
                Regras de acúmulo e resgate (taxa, multiplicador por tier, aprovação) são sempre as definidas em Configuração → Mecânica do Programa — esta campanha só decide elegibilidade.
              </p>
            </div>

            {!jaPublicada && (
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b border-border">
                  <p className="text-sm font-semibold">Quando publicar?</p>
                </div>
                <div className="px-4 py-4 space-y-3">
                  {[
                    { value: "agora",   label: "Publicar agora",              desc: "A campanha fica ativa imediatamente." },
                    { value: "agendar", label: "Agendar para uma data e hora", desc: "A campanha só entra em vigência na data e hora escolhidas." },
                  ].map(({ value, label, desc }) => (
                    <label key={value} className="flex items-start gap-3 cursor-pointer">
                      <input type="radio" name="publicarModo" value={value} checked={publicarModo === value}
                        onChange={() => setPublicarModo(value as "agora" | "agendar")} className="mt-1 accent-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                        {value === "agendar" && publicarModo === "agendar" && (
                          <div className="mt-2">
                            <Input type="datetime-local" value={dataAgendada} onChange={(e) => setDataAgendada(e.target.value)} className="w-56" />
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Modal de importação de produtos ── */}
        {importOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6" onClick={resetImport}>
            <div className="bg-background rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[85vh]" onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                <div>
                  <p className="text-sm font-bold">Importar produtos em lote</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {importStep === "upload" ? "Faça upload de um arquivo Excel ou CSV com os SKUs" : `Status da importação · ${importFile?.name}`}
                  </p>
                </div>
                <button onClick={resetImport} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1">
                {importStep === "upload" && (
                  <div className="p-5 space-y-4">
                    {/* Drop zone */}
                    <label className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-10 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <div className="text-center">
                        <p className="text-sm font-medium">Arraste o arquivo aqui ou clique para selecionar</p>
                        <p className="text-xs text-muted-foreground mt-1">Excel (.xlsx, .xls) ou CSV — coluna com os SKUs dos produtos</p>
                      </div>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls,.txt"
                        className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) processarArquivo(f); }}
                      />
                    </label>

                    {/* Formato esperado */}
                    <div className="rounded-lg bg-muted/40 px-4 py-3 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Formato esperado</p>
                      <div className="font-mono text-xs bg-background border border-border rounded px-3 py-2 space-y-0.5">
                        <p className="text-muted-foreground">SKU</p>
                        <p>AIRFRY-XL-02</p>
                        <p>FONE-BT-02</p>
                        <p>KIT-SKIN-01</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Uma coluna com os SKUs, uma por linha. O Excel pode ter outras colunas — o sistema localiza os SKUs automaticamente.</p>
                    </div>
                  </div>
                )}

                {importStep === "status" && importResult && (
                  <div className="p-5 space-y-4">
                    {/* Resumo */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
                        <p className="text-xl font-bold text-emerald-700">{importResult.encontrados.length}</p>
                        <p className="text-xs text-emerald-600 mt-0.5">Encontrados</p>
                      </div>
                      <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-center">
                        <p className="text-xl font-bold text-rose-700">{importResult.naoEncontrados.length}</p>
                        <p className="text-xs text-rose-600 mt-0.5">Não encontrados</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-center">
                        <p className="text-xl font-bold">{importResult.encontrados.length + importResult.naoEncontrados.length}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Total no arquivo</p>
                      </div>
                    </div>

                    {/* Encontrados */}
                    {importResult.encontrados.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5" /> Produtos encontrados no catálogo
                        </p>
                        <div className="rounded-lg border border-emerald-200 overflow-hidden">
                          {importResult.encontrados.map((p, i) => (
                            <div key={p.id} className={`flex items-center gap-3 px-3 py-2.5 text-xs ${i < importResult.encontrados.length - 1 ? "border-b border-emerald-100" : ""}`}>
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              <span className="flex-1 font-medium">{p.nome}</span>
                              <span className="font-mono text-muted-foreground">{p.sku}</span>
                              <span className="text-muted-foreground">{p.categoria}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Não encontrados */}
                    {importResult.naoEncontrados.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
                          <XCircle className="h-3.5 w-3.5" /> SKUs não encontrados no catálogo
                        </p>
                        <div className="rounded-lg border border-rose-200 overflow-hidden">
                          {importResult.naoEncontrados.map((sku, i) => (
                            <div key={sku} className={`flex items-center gap-3 px-3 py-2.5 text-xs ${i < importResult.naoEncontrados.length - 1 ? "border-b border-rose-100" : ""}`}>
                              <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                              <span className="font-mono text-rose-700">{sku}</span>
                              <span className="text-rose-400 ml-auto">Não cadastrado no catálogo</span>
                            </div>
                          ))}
                        </div>
                        {importResult.encontrados.length > 0 && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Apenas os produtos encontrados serão importados.
                          </p>
                        )}
                      </div>
                    )}

                    {importResult.encontrados.length === 0 && (
                      <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-6 text-center">
                        <XCircle className="h-8 w-8 text-rose-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-rose-700">Nenhum SKU encontrado no catálogo</p>
                        <p className="text-xs text-rose-500 mt-1">Verifique se os SKUs do arquivo correspondem aos cadastrados.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-2 px-5 py-4 border-t border-border shrink-0">
                {importStep === "upload" && (
                  <Button variant="outline" className="flex-1" onClick={resetImport}>Cancelar</Button>
                )}
                {importStep === "status" && (
                  <>
                    <Button variant="outline" onClick={() => setImportStep("upload")}>
                      Voltar
                    </Button>
                    <Button
                      className="flex-1"
                      disabled={importResult?.encontrados.length === 0}
                      onClick={confirmarImport}
                    >
                      Confirmar {importResult && importResult.encontrados.length > 0 ? `${importResult.encontrados.length} produto(s)` : ""}
                    </Button>
                  </>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex gap-3 mt-10 pt-6 border-t border-border">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => step > 1 ? setStep(proximoStep(step, -1, form.gatilhoTipo)) : navigate("/campanhas")}
          >
            Voltar
          </Button>
          {step < 6 ? (
            <Button
              className="flex-1"
              disabled={!canContinue()}
              onClick={() => setStep(proximoStep(step, 1, form.gatilhoTipo))}
            >
              Continuar
            </Button>
          ) : jaPublicada ? (
            <Button className="flex-1" onClick={salvarComoRascunho}>
              Salvar alterações
            </Button>
          ) : (
            <Button
              className="flex-1"
              disabled={publicarModo === "agendar" && !dataAgendada}
              onClick={handlePublish}
            >
              {publicarModo === "agendar" ? "Agendar campanha" : "Publicar campanha"}
            </Button>
          )}
        </div>
        {step < 6 && (
          <p className="text-center mt-3">
            <button
              className="text-xs text-muted-foreground hover:text-foreground underline"
              onClick={salvarComoRascunho}
            >
              {jaPublicada ? "Salvar alterações e voltar" : "Salvar como rascunho"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
