import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button, Input, Label, PageHeader, Select, SelectContent,
  SelectItem, SelectTrigger, SelectValue, Switch, toast,
} from "@kruzer/ds";
import { CheckCircle2, Plus, Pencil, Trash2, Upload, X, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { MOEDA } from "../config/programa";
import { FILIAIS } from "../config/filiais";
import { renderCrumbLink } from "../lib/crumbLink";

// ── Steps ─────────────────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: "Detalhes" },
  { num: 2, label: "Fontes" },
  { num: 3, label: "Elegibilidade" },
  { num: 4, label: "Produtos" },
  { num: 5, label: "Limites" },
  { num: 6, label: "Multiplicadores" },
  { num: 7, label: "Revisão" },
];

// ── Form state ────────────────────────────────────────────────────────────────

// ── Classificação ────────────────────────────────────────────────────────────

type Classificacao = {
  id: string; nome: string; cor: string;
  pontosPorReal: string; temBonus: boolean; bonus: string;
};

const CLASSIF_DEFAULTS: Omit<Classificacao, "id"> = {
  nome: "", cor: "#6366f1", pontosPorReal: "", temBonus: true, bonus: "",
};

function ClassificacaoModal({
  initial, onSave, onClose,
}: {
  initial?: Classificacao;
  onSave: (c: Classificacao) => void;
  onClose: () => void;
}) {
  const [d, setD] = useState<Omit<Classificacao, "id">>(
    initial ? { nome: initial.nome, cor: initial.cor, pontosPorReal: initial.pontosPorReal, temBonus: initial.temBonus, bonus: initial.bonus }
            : { ...CLASSIF_DEFAULTS }
  );

  const upd = (k: keyof typeof d, v: string | boolean) =>
    setD((prev) => ({ ...prev, [k]: v }));

  const nomePrev  = d.nome  || "Sem nome";
  const ptosPrev  = d.pontosPorReal || "0";
  const bonusPrev = d.temBonus ? (d.bonus || "0%") : "0%";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-semibold leading-snug">Defina as características da sua classificação</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground mt-0.5 shrink-0">
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        {/* Nome */}
        <div className="space-y-1.5">
          <Label className="text-sm">Nome<span className="text-destructive">*</span></Label>
          <Input value={d.nome} onChange={(e) => upd("nome", e.target.value)} placeholder="Digite o nome para essa classificação" />
        </div>

        {/* Cor */}
        <div className="space-y-1.5">
          <Label className="text-sm">Cor<span className="text-destructive">*</span></Label>
          <div className="flex items-center gap-2 rounded-md border border-input px-3 py-2">
            <input
              type="color" value={d.cor}
              onChange={(e) => upd("cor", e.target.value)}
              className="h-6 w-6 rounded cursor-pointer border-0 bg-transparent p-0"
            />
            <span className="flex-1 text-sm text-muted-foreground">{d.cor}</span>
            <span className="text-muted-foreground text-xs">🎨</span>
          </div>
        </div>

        {/* Moeda por real gasto */}
        <div className="space-y-1.5">
          <Label className="text-sm">Quantidade de {MOEDA.nome.toLowerCase()} por real gasto<span className="text-destructive">*</span></Label>
          <div className="relative">
            <Input
              type="number" value={d.pontosPorReal}
              onChange={(e) => upd("pontosPorReal", e.target.value)}
              placeholder={`Digite a quantidade de ${MOEDA.nome.toLowerCase()}`}
              className="pr-9"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
          </div>
        </div>

        {/* Tem bônus */}
        <div className="space-y-2">
          <Label className="text-sm">Deseja que tenha bônus para essa campanha?<span className="text-muted-foreground ml-1 text-xs">**</span></Label>
          <div className="flex gap-6">
            {[true, false].map((v) => (
              <label key={String(v)} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio" name="temBonus"
                  checked={d.temBonus === v}
                  onChange={() => upd("temBonus", v)}
                  className="accent-foreground h-4 w-4"
                />
                {v ? "Sim" : "Não"}
              </label>
            ))}
          </div>
        </div>

        {/* Percentual de bônus */}
        {d.temBonus && (
          <div className="space-y-1.5">
            <Label className="text-sm">Porcentagem de bônus<span className="text-muted-foreground ml-1 text-xs">**</span></Label>
            <div className="relative">
              <Input
                type="number" value={d.bonus}
                onChange={(e) => upd("bonus", e.target.value)}
                placeholder="Digite o valor em bônus"
                className="pr-9"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          </div>
        )}

        {/* Exemplo prático */}
        <div className="rounded-lg bg-muted/40 px-4 py-3 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Exemplo prático</p>
          <p className="text-sm leading-relaxed">
            Para a classificação{" "}
            <span className="font-semibold text-primary">"{nomePrev}"</span>, serão concedidos{" "}
            <span className="font-semibold text-primary">"{ptosPrev}"</span> {MOEDA.abrev} por real gasto, com um bônus de{" "}
            <span className="font-semibold text-primary">"{d.temBonus ? bonusPrev : "0%"}"</span>{" "}
            sobre o valor de cada produto incentivado do pedido.
          </p>
        </div>

        <Button
          className="w-full"
          disabled={!d.nome || !d.pontosPorReal}
          onClick={() => onSave({ ...d, id: initial?.id ?? String(Date.now()) })}
        >
          Salvar classificação
        </Button>
      </div>
    </div>
  );
}

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

type Form = {
  codigo: string; nome: string; descricao: string; segmento: string;
  periodoInicio: string; periodoFim: string;
  vigenciaInicio: string; vigenciaFim: string;
  fontes: Record<string, boolean>;
  pdvEscopo: "todas" | "especificas";
  pdvFiliais: string[];
  // Pontuação base da campanha
  moedaCampanha: string;
  taxaTipo: "taxa" | "fixo" | "multiplicador";
  taxaValor: string;
  arredondamento: "baixo" | "cima" | "proximo";
  statusConceder: Record<string, boolean>;
  diasCreditado: string;
  statusAnular: Record<string, boolean>;
  classificacoes: Classificacao[];
  moedas: Record<string, { ativo: boolean; valor: string }>;
  produtosElegiveis: string[];
  // Step 4 · Limites e vigência
  liberacaoTipo: "imediato" | "dias";
  liberacaoDias: string;
  expiracaoTipo: "herdar" | "meses" | "data_fixa";
  expiracaoMeses: string;
  expiracaoData: string;
  limiteAtivo: boolean;
  limitePts: string;
  limiteEscopo: "membro_campanha" | "membro_dia";
  cancelamentoPolicy: "estornar_tudo" | "estornar_proporcional" | "manter";
  aprovacaoTipo: "manual" | "automatica";
  aprovacaoTiposResgate: string[];
  aprovacaoValorMax: string;
  aprovacaoTiers: string[];
  multAlvo: "membro" | "produto";
  multBronze: string; multPrata: string; multOuro: string; multDiamante: string;
  multProdutos: Record<string, string>;
};

const PRODUTOS_CATALOGO = [
  { id: "SKU-001", nome: "Smart TV 50\"",     categoria: "Eletrônicos",  sku: "TV-50-4K"    },
  { id: "SKU-002", nome: "Air Fryer XL",      categoria: "Eletrodomésticos", sku: "AIRFRY-XL" },
  { id: "SKU-003", nome: "Fone Bluetooth",    categoria: "Eletrônicos",  sku: "FONE-BT-02"  },
  { id: "SKU-004", nome: "Kit Skincare",      categoria: "Beleza",       sku: "KIT-SKIN-01" },
  { id: "SKU-005", nome: "Tênis Running",     categoria: "Esportes",     sku: "TEN-RUN-42"  },
  { id: "SKU-006", nome: "Cafeteira Premium", categoria: "Eletrodomésticos", sku: "CAFE-PRE-01" },
  { id: "SKU-007", nome: "Mochila Executiva", categoria: "Acessórios",   sku: "MOCH-EXE-01" },
  { id: "SKU-008", nome: "Livro de Receitas", categoria: "Livros",       sku: "LIV-REC-01"  },
];

const STATUS_PEDIDO = [
  "Aprovado", "Faturado", "Em separação", "Entregue",
  "Concluído", "Cancelado", "Devolvido", "Recusado",
];

const DEFAULTS: Form = {
  codigo: "CAMP01", nome: "", descricao: "", segmento: "todos",
  periodoInicio: "", periodoFim: "",
  vigenciaInicio: "", vigenciaFim: "",
  fontes: { portal: true, pdv: true, ecommerce: false, marketplace: false },
  pdvEscopo: "todas",
  pdvFiliais: [],
  moedaCampanha: MOEDA.nome, taxaTipo: "taxa", taxaValor: "", arredondamento: "baixo",
  statusConceder: { Aprovado: false, Faturado: false, "Em separação": false, Entregue: false, Concluído: false, Cancelado: false, Devolvido: false, Recusado: false },
  diasCreditado: "",
  statusAnular:   { Aprovado: false, Faturado: false, "Em separação": false, Entregue: false, Concluído: false, Cancelado: false, Devolvido: false, Recusado: false },
  classificacoes: [],
  produtosElegiveis: [],
  liberacaoTipo: "imediato",
  liberacaoDias: "7",
  expiracaoTipo: "herdar",
  expiracaoMeses: "12",
  expiracaoData: "",
  limiteAtivo: false,
  limitePts: "",
  limiteEscopo: "membro_campanha",
  cancelamentoPolicy: "estornar_tudo",
  aprovacaoTipo: "manual",
  aprovacaoTiposResgate: ["voucher_digital"],
  aprovacaoValorMax: "",
  aprovacaoTiers: ["Ouro", "Diamante"],
  moedas: {
    Pontos:   { ativo: true,  valor: "" },
    Cashback: { ativo: false, valor: "" },
    Milhas:   { ativo: false, valor: "" },
    Créditos: { ativo: false, valor: "" },
  },
  multAlvo: "membro",
  multBronze: "1", multPrata: "1.25", multOuro: "1.5", multDiamante: "2",
  multProdutos: {},
};

// ── Stepper ───────────────────────────────────────────────────────────────────

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((s, idx) => {
        const done    = s.num < current;
        const active  = s.num === current;
        const isLast  = idx === STEPS.length - 1;
        return (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                done   ? "bg-foreground border-foreground text-background"
                : active ? "bg-foreground border-foreground text-background"
                : "bg-background border-border text-muted-foreground"
              }`}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : s.num}
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
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>(DEFAULTS);
  const [published, setPublished] = useState(false);
  const [classifModal,   setClassifModal]   = useState<Classificacao | null | "new">(null);
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

  function handlePublish() {
    setPublished(true);
    toast.success(`Campanha "${form.nome}" publicada com sucesso`);
  }

  if (published) {
    return (
      <div className="max-w-md mx-auto text-center pt-16 space-y-5">
        <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Campanha publicada!</h2>
          <p className="text-sm text-muted-foreground mt-1">{form.nome} está ativa agora.</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate("/campanhas")}>Ver campanhas</Button>
          <Button variant="outline" onClick={() => { setForm(DEFAULTS); setStep(1); setPublished(false); }}>
            Criar outra
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <PageHeader
        title="Nova campanha"
        path={[{ label: "Operação" }, { label: "Campanhas", to: "/campanhas" }]}
        renderCrumbLink={renderCrumbLink}
      />

      <div className="max-w-2xl mx-auto pt-6">
        <Stepper current={step} />

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

            <Field label="Segmento de membros elegíveis">
              <Select value={form.segmento} onValueChange={(v) => set("segmento", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um segmento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os membros</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Fidelidade">Fidelidade</SelectItem>
                  <SelectItem value="Frete Grátis">Frete Grátis</SelectItem>
                  <SelectItem value="Básico">Básico</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Período da campanha">
              <div className="flex items-center gap-2">
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
            </Field>

            <Field label={`Vigência de ${MOEDA.nome.toLowerCase()} e bônus`} hint={`Janela em que os ${MOEDA.nome.toLowerCase()} acumulados nesta campanha ficam disponíveis para resgate.`}>
              <div className="flex items-center gap-2">
                <Input
                  type="date" value={form.vigenciaInicio}
                  onChange={(e) => set("vigenciaInicio", e.target.value)}
                  className="flex-1"
                />
                <span className="text-muted-foreground text-sm shrink-0">→</span>
                <Input
                  type="date" value={form.vigenciaFim}
                  onChange={(e) => set("vigenciaFim", e.target.value)}
                  className="flex-1"
                />
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
              <h3 className="text-lg font-semibold">Elegibilidade e moeda</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Defina como esta campanha pontua — taxa base, quando concede e quando anula.
              </p>
            </div>

            {/* ── Pontuação base ── */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <p className="text-sm font-semibold">Pontuação base <span className="text-xs text-muted-foreground font-normal ml-1">quanto o membro ganha por ação elegível</span></p>
              </div>
              <div className="px-4 py-4 space-y-4">
                {/* Moeda da campanha */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Moeda desta campanha</Label>
                  <div className="flex gap-2 flex-wrap">
                    {["Pontos", "Cashback", "Milhas", "Créditos"].map((m) => (
                      <button key={m} type="button"
                        onClick={() => set("moedaCampanha", m)}
                        className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                          form.moedaCampanha === m
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Selecione qual moeda esta campanha credita ao membro ao completar uma ação elegível.</p>
                </div>

                {/* Tipo */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tipo de cálculo</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "taxa",         label: `Taxa por R$1`,         hint: `Ex: 1 ${MOEDA.abrev}/R$1` },
                      { value: "fixo",         label: `Valor fixo`,           hint: `Ex: 500 ${MOEDA.abrev} por ação` },
                      { value: "multiplicador",label: `Multiplicador`,        hint: `Ex: 2× a taxa do programa base` },
                    ].map(({ value, label, hint }) => (
                      <label key={value} className={`flex flex-col gap-0.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                        form.taxaTipo === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}>
                        <input type="radio" name="taxaTipo" value={value} checked={form.taxaTipo === value}
                          onChange={() => set("taxaTipo", value)} className="sr-only" />
                        <span className="text-xs font-semibold">{label}</span>
                        <span className="text-[10px] text-muted-foreground">{hint}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* Valor */}
                <div className="flex items-center gap-3">
                  <div className="space-y-1 flex-1 max-w-xs">
                    <Label className="text-xs">
                      {form.taxaTipo === "taxa" ? `${form.moedaCampanha} por R$1` :
                       form.taxaTipo === "fixo" ? `${form.moedaCampanha} por ação` : "Multiplicador (×)"}
                    </Label>
                    <Input type="number" value={form.taxaValor} onChange={(e) => set("taxaValor", e.target.value)}
                      placeholder={form.taxaTipo === "multiplicador" ? "Ex: 2" : "Ex: 1"} />
                  </div>
                  {form.taxaTipo === "taxa" && (
                    <div className="space-y-1 flex-1 max-w-xs">
                      <Label className="text-xs">Arredondamento de fração</Label>
                      <Select value={form.arredondamento} onValueChange={(v) => set("arredondamento", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixo">Para baixo (conservador)</SelectItem>
                          <SelectItem value="cima">Para cima (favorável ao membro)</SelectItem>
                          <SelectItem value="proximo">Mais próximo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                {form.taxaValor && (
                  <div className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    {form.taxaTipo === "taxa" && `Compra de R$100 → ${(Number(form.taxaValor) * 100).toLocaleString("pt-BR")} ${form.moedaCampanha}`}
                    {form.taxaTipo === "fixo" && `Cada ação elegível credita ${Number(form.taxaValor).toLocaleString("pt-BR")} ${form.moedaCampanha} independente do valor`}
                    {form.taxaTipo === "multiplicador" && `Aplica ${form.taxaValor}× sobre a taxa definida no Programa Base`}
                  </div>
                )}
              </div>
            </div>

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

            {/* Dias para crédito — movido para Step 4 */}

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

          </div>
        )}

        {/* ── Step 4: Produtos da campanha ── */}
        {step === 4 && (
          <div className="space-y-7">
            <div className="mb-6">
              <h3 className="text-lg font-semibold">Produtos da campanha</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Defina as categorias de produtos e selecione quais itens participam desta campanha.
              </p>
            </div>

            {/* Classificações */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Classificações</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Categorias com taxas de {MOEDA.nome.toLowerCase()} específicas por grupo de produto.
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setClassifModal("new")}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />Adicionar
                </Button>
              </div>
              <div className="px-4 py-4">
                {form.classificacoes.length === 0 ? (
                  <button onClick={() => setClassifModal("new")}
                    className="w-full rounded-lg border border-dashed border-border py-5 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors">
                    Nenhuma classificação — clique para adicionar
                  </button>
                ) : (
                  <div className="space-y-2">
                    {form.classificacoes.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                        <div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: c.cor }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{c.nome}</p>
                          <p className="text-xs text-muted-foreground">{c.pontosPorReal} {MOEDA.abrev}/R$1{c.temBonus && c.bonus ? ` · bônus ${c.bonus}%` : ""}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => setClassifModal(c)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => set("classificacoes", form.classificacoes.filter((x) => x.id !== c.id))} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
          </div>
        )}

        {/* ── Step 5: Limites e vigência ── (previously step 4) */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold">Limites e vigência</h3>
              <p className="text-sm text-muted-foreground mt-1">Configure quando os {MOEDA.nome.toLowerCase()} ficam disponíveis, quando expiram, teto de acúmulo e o que acontece em caso de cancelamento.</p>
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

            {/* Cancelamento / estorno */}
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

            {/* Aprovação de resgates */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <p className="text-sm font-semibold">Aprovação de resgates</p>
                <p className="text-xs text-muted-foreground mt-0.5">Define se os resgates desta campanha precisam de revisão manual ou são aprovados automaticamente.</p>
              </div>
              <div className="px-4 py-4 space-y-4">
                {/* Manual vs Automática */}
                <div className="grid grid-cols-2 gap-3">
                  {([
                    ["manual",     "Manual",     "Analista revisa e aprova cada solicitação individualmente."],
                    ["automatica", "Automática", "Aprovação imediata ao atingir as condições abaixo."],
                  ] as const).map(([v, label, desc]) => (
                    <label key={v} className={`flex flex-col gap-1 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                      form.aprovacaoTipo === v ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}>
                      <input type="radio" name="aprovacaoTipo" value={v}
                        checked={form.aprovacaoTipo === v}
                        onChange={() => set("aprovacaoTipo", v)} className="sr-only" />
                      <span className="text-sm font-semibold">{label}</span>
                      <span className="text-xs text-muted-foreground">{desc}</span>
                    </label>
                  ))}
                </div>

                {/* Condições — só visíveis se automática */}
                {form.aprovacaoTipo === "automatica" && (
                  <div className="rounded-lg border border-border bg-muted/20 px-4 py-4 space-y-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Condições para aprovação automática</p>

                    {/* Tipo de resgate */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Tipo de resgate elegível</p>
                      <div className="flex flex-col gap-1.5">
                        {[
                          ["voucher_digital", "🎟️ Voucher digital"],
                          ["produto_fisico",  "📦 Produto físico"],
                          ["credito_conta",   "💳 Crédito em conta"],
                        ].map(([val, label]) => (
                          <label key={val} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="accent-primary h-4 w-4"
                              checked={(form.aprovacaoTiposResgate as string[]).includes(val)}
                              onChange={() => {
                                const atual = form.aprovacaoTiposResgate as string[];
                                set("aprovacaoTiposResgate", atual.includes(val)
                                  ? atual.filter(x => x !== val)
                                  : [...atual, val]);
                              }} />
                            <span className="text-sm">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Valor máximo */}
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium">Valor máximo do resgate</p>
                      <p className="text-xs text-muted-foreground">Resgates acima desse valor vão para aprovação manual. Deixe em branco para sem limite.</p>
                      <div className="flex items-center gap-2 max-w-xs">
                        <Input type="number" value={form.aprovacaoValorMax}
                          onChange={e => set("aprovacaoValorMax", e.target.value)}
                          placeholder="Ex: 500" />
                        <span className="text-sm text-muted-foreground shrink-0">{form.moedaCampanha}</span>
                      </div>
                    </div>

                    {/* Tiers */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Tiers elegíveis para aprovação automática</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { tier: "Bronze",   color: "bg-orange-100 text-orange-700 border-orange-200" },
                          { tier: "Prata",    color: "bg-slate-100 text-slate-600 border-slate-200"   },
                          { tier: "Ouro",     color: "bg-amber-100 text-amber-700 border-amber-200"   },
                          { tier: "Diamante", color: "bg-violet-100 text-violet-700 border-violet-200"},
                        ].map(({ tier, color }) => {
                          const sel = (form.aprovacaoTiers as string[]).includes(tier);
                          return (
                            <button key={tier} type="button"
                              onClick={() => {
                                const atual = form.aprovacaoTiers as string[];
                                set("aprovacaoTiers", sel ? atual.filter(x => x !== tier) : [...atual, tier]);
                              }}
                              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                                sel ? color + " ring-1 ring-offset-1 ring-primary/40" : "border-border text-muted-foreground bg-background hover:border-primary/40"
                              }`}>
                              {tier}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ── Step 6: Multiplicadores ── */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold">Multiplicadores</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Aplique um fator extra sobre os {MOEDA.nome.toLowerCase()} desta campanha.
              </p>
            </div>

            {/* Alvo do multiplicador */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Este fator se aplica a</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "membro",  label: "Membro",  desc: "Fator por tier — Bronze, Prata, Ouro, Diamante" },
                  { value: "produto", label: "Produto", desc: "Fator por produto ou categoria elegível" },
                ].map(({ value, label, desc }) => (
                  <label key={value} className={`flex flex-col gap-1 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                    form.multAlvo === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  }`}>
                    <input type="radio" name="multAlvo" value={value} checked={form.multAlvo === value}
                      onChange={() => set("multAlvo", value)} className="sr-only" />
                    <span className="text-sm font-semibold">{label}</span>
                    <span className="text-xs text-muted-foreground">{desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Multiplicadores por tier */}
            {form.multAlvo === "membro" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Os valores abaixo sobrescrevem os multiplicadores globais da Mecânica do Programa para esta campanha.</p>
                {[
                  { key: "multBronze",   tier: "Bronze",   color: "bg-orange-100 text-orange-700" },
                  { key: "multPrata",    tier: "Prata",    color: "bg-slate-100 text-slate-700" },
                  { key: "multOuro",     tier: "Ouro",     color: "bg-amber-100 text-amber-700" },
                  { key: "multDiamante", tier: "Diamante", color: "bg-violet-100 text-violet-700" },
                ].map(({ key, tier, color }) => (
                  <div key={key} className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>{tier}</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="w-28 text-right"
                        value={(form as unknown as Record<string, string>)[key]}
                        onChange={(e) => set(key as keyof Form, e.target.value)}
                        min={1} step={0.25}
                      />
                      <span className="text-sm text-muted-foreground shrink-0">×</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Multiplicadores por produto */}
            {form.multAlvo === "produto" && (() => {
              const lista = form.produtosElegiveis.length > 0
                ? PRODUTOS_CATALOGO.filter((p) => form.produtosElegiveis.includes(p.id))
                : PRODUTOS_CATALOGO;
              return (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    {form.produtosElegiveis.length > 0
                      ? "Defina o fator para cada produto elegível selecionado na campanha."
                      : "Nenhum produto específico selecionado — exibindo todos os produtos do catálogo."}
                  </p>
                  {lista.map((p) => {
                    const val = (form.multProdutos as Record<string, string>)[p.id] ?? "1";
                    return (
                      <div key={p.id} className="flex items-center gap-4 rounded-lg border border-border px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{p.nome}</p>
                          <p className="text-xs text-muted-foreground">{p.categoria} · {p.sku}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Input
                            type="number"
                            className="w-24 text-right"
                            value={val}
                            onChange={(e) => set("multProdutos", { ...(form.multProdutos as Record<string, string>), [p.id]: e.target.value })}
                            min={1} step={0.25}
                          />
                          <span className="text-sm text-muted-foreground">×</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── Step 7: Revisão ── */}
        {step === 7 && (
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
                <ReviewRow label="Segmento" value={form.segmento} />
                <ReviewRow label="Período"  value={form.periodoInicio && form.periodoFim ? `${form.periodoInicio} → ${form.periodoFim}` : "—"} />
                <ReviewRow label="Vigência" value={form.vigenciaInicio && form.vigenciaFim ? `${form.vigenciaInicio} → ${form.vigenciaFim}` : "—"} />
              </div>
            </div>

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

            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Elegibilidade e moeda</p>
              </div>
              <div className="px-5">
                <ReviewRow
                  label="Pontuação base"
                  value={
                    !form.taxaValor ? "—" :
                    form.taxaTipo === "taxa" ? `${form.taxaValor} ${form.moedaCampanha}/R$1` :
                    form.taxaTipo === "fixo" ? `${form.taxaValor} ${form.moedaCampanha} por ação` :
                    `${form.taxaValor}× a taxa do programa base`
                  }
                />
                <ReviewRow
                  label="Conceder em"
                  value={Object.entries(form.statusConceder).filter(([, v]) => v).map(([k]) => k).join(", ") || "—"}
                />
                <ReviewRow
                  label="Anular em"
                  value={Object.entries(form.statusAnular).filter(([, v]) => v).map(([k]) => k).join(", ") || "—"}
                />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Produtos da campanha</p>
              </div>
              <div className="px-5">
                {form.classificacoes.length > 0 && (
                  <ReviewRow
                    label="Classificações"
                    value={form.classificacoes.map((c) => c.nome).join(", ")}
                  />
                )}
                <ReviewRow
                  label="Produtos elegíveis"
                  value={
                    form.produtosElegiveis.length === 0
                      ? "Todos os produtos"
                      : PRODUTOS_CATALOGO.filter((p) => form.produtosElegiveis.includes(p.id)).map((p) => p.nome).join(", ")
                  }
                />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Limites e vigência</p>
              </div>
              <div className="px-5">
                <ReviewRow label="Liberação" value={form.liberacaoTipo === "imediato" ? "Imediatamente" : `Após ${form.liberacaoDias} dias`} />
                <ReviewRow label="Expiração" value={
                  form.expiracaoTipo === "herdar" ? "Herdar da Mecânica" :
                  form.expiracaoTipo === "meses" ? `${form.expiracaoMeses} meses após crédito` :
                  form.expiracaoData || "—"
                } />
                <ReviewRow label="Limite" value={form.limiteAtivo && form.limitePts ? `${form.limitePts} pts · ${form.limiteEscopo === "membro_campanha" ? "por membro / campanha" : "por membro / dia"}` : "Sem limite"} />
                <ReviewRow label="Cancelamento" value={{ estornar_tudo: "Estornar tudo", estornar_proporcional: "Estorno proporcional", manter: "Manter pontos" }[form.cancelamentoPolicy]} />
                <ReviewRow label="Aprovação de resgates" value={
                  form.aprovacaoTipo === "manual"
                    ? "Manual"
                    : `Automática — ${(form.aprovacaoTiposResgate as string[]).length} tipo(s)${form.aprovacaoValorMax ? ` · até ${form.aprovacaoValorMax} ${form.moedaCampanha}` : ""} · tiers: ${(form.aprovacaoTiers as string[]).join(", ") || "nenhum"}`
                } />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Multiplicadores</p>
              </div>
              <div className="px-5">
                <ReviewRow label="Alvo" value={form.multAlvo === "membro" ? "Membro (por tier)" : "Produto (por categoria)"} />
                {form.multAlvo === "membro" && (
                  [["Bronze", form.multBronze], ["Prata", form.multPrata], ["Ouro", form.multOuro], ["Diamante", form.multDiamante]].map(([tier, v]) => (
                    <ReviewRow key={tier} label={tier} value={`${v}×`} />
                  ))
                )}
                {form.multAlvo === "produto" && (() => {
                  const lista = form.produtosElegiveis.length > 0
                    ? PRODUTOS_CATALOGO.filter((p) => form.produtosElegiveis.includes(p.id))
                    : PRODUTOS_CATALOGO;
                  return lista.map((p) => (
                    <ReviewRow key={p.id} label={p.nome}
                      value={`${(form.multProdutos as Record<string, string>)[p.id] ?? "1"}×`} />
                  ));
                })()}
              </div>
            </div>
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

        {/* ── Modal de classificação ── */}
        {classifModal !== null && (
          <ClassificacaoModal
            initial={classifModal === "new" ? undefined : classifModal}
            onClose={() => setClassifModal(null)}
            onSave={(c) => {
              set("classificacoes",
                classifModal === "new"
                  ? [...form.classificacoes, c]
                  : form.classificacoes.map((x) => x.id === c.id ? c : x)
              );
              setClassifModal(null);
            }}
          />
        )}

        {/* ── Navigation ── */}
        <div className="flex gap-3 mt-10 pt-6 border-t border-border">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => step > 1 ? setStep(step - 1) : navigate("/campanhas")}
          >
            Voltar
          </Button>
          {step < 7 ? (
            <Button
              className="flex-1"
              disabled={!canContinue()}
              onClick={() => setStep(step + 1)}
            >
              Continuar
            </Button>
          ) : (
            <Button className="flex-1" onClick={handlePublish}>
              Publicar campanha
            </Button>
          )}
        </div>
        {step < 6 && (
          <p className="text-center mt-3">
            <button
              className="text-xs text-muted-foreground hover:text-foreground underline"
              onClick={() => { toast.success("Rascunho salvo"); navigate("/campanhas"); }}
            >
              Salvar como rascunho
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
