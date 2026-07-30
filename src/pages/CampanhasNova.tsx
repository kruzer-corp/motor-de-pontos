import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button, Input, Label, NumberInput, PageHeader, Switch, toast,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@kruzer/ds";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { renderCrumbLink } from "../lib/crumbLink";
import {
  type Form, type Campanha, type Multiplicador, type MultiplicadorTipo, type ExpiracaoTipo,
  type LimiteEscopo, type LimitePeriodoGranularidade,
  DEFAULTS, getCampanha, upsertCampanha, novoIdCampanha, novoIdMultiplicador,
} from "../lib/campanhas";
import { type EstornoPolicy, GATILHO_LABEL, MECANISMO_LABEL, ESTORNO_LABEL, CANAIS } from "../lib/regras";
import { GatilhoFields, AtribuicaoFields, ElegibilidadeFields } from "../components/RegraFields";
import { getLiberacao } from "../lib/liberacao";
import { getSegmentosMembro } from "../lib/segmentosMembro";
import { getTiersMembro } from "../lib/tiers";
import { getPapeisMembro } from "../lib/papeisMembro";
import { getTiersProduto } from "../lib/tiersProduto";
import { CATEGORIAS } from "../lib/produtos";
import { getConjuntosProdutos } from "../lib/conjuntosProdutos";

// ── Steps ─────────────────────────────────────────────────────────────────────
// Campanha é autossuficiente — 6 dimensões próprias (Elegibilidade, Multiplicador,
// Expiração, Limite, Cancelamento/estorno, Prioridade), sem referenciar Regra da
// Mecânica. Elegibilidade já está completa; as demais chegam nas próximas etapas
// desta reconstrução — Multiplicador substitui a antiga tabela de Output.

const STEPS = [
  { num: 1, label: "Elegibilidade" },
  { num: 2, label: "Multiplicador" },
  { num: 3, label: "Expiração de pontos" },
  { num: 4, label: "Limite" },
  { num: 5, label: "Cancelamento/estorno" },
  { num: 6, label: "Prioridade" },
];

// ── Stepper ───────────────────────────────────────────────────────────────────

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((s, idx) => {
        const done   = s.num < current;
        const active = s.num === current;
        const isLast = idx === STEPS.length - 1;
        return (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors shrink-0 ${
                done || active ? "bg-foreground border-foreground text-background" : "bg-background border-border text-muted-foreground"
              }`}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
              </div>
              <span className={`text-[11px] whitespace-nowrap text-center max-w-[92px] leading-tight ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </div>
            {!isLast && <div className={`h-px w-8 mx-1.5 mb-5 shrink-0 ${s.num < current ? "bg-foreground" : "bg-border"}`} />}
          </div>
        );
      })}
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

function resumoElegibilidade(f: Form): string {
  const partes: string[] = [];
  if (f.valorMinimo) partes.push(`mín. R$${f.valorMinimo}`);
  if (f.produtoTiers.length > 0) partes.push(`tier de produto: ${f.produtoTiers.map((id) => getTiersProduto().find((x) => x.id === id)?.nome ?? id).join(", ")}`);
  partes.push(f.canais.length === 0 ? "todos os canais" : f.canais.map((id) => CANAIS.find((x) => x.id === id)?.nome ?? id).join(", "));
  partes.push(f.segmentos.length === 0 ? "todos os segmentos" : f.segmentos.map((id) => getSegmentosMembro().find((x) => x.id === id)?.nome ?? id).join(", "));
  partes.push(f.tiers.length === 0 ? "todos os tiers" : f.tiers.map((id) => getTiersMembro().find((x) => x.id === id)?.nome ?? id).join(", "));
  if (f.papeis.length > 0) partes.push(f.papeis.map((id) => getPapeisMembro().find((x) => x.id === id)?.nome ?? id).join(", "));
  partes.push(f.statusPedido.length === 0 ? "qualquer status" : f.statusPedido.join(", "));
  return partes.join(" · ");
}

// ── Multiplicador ─────────────────────────────────────────────────────────────
// Substitui a antiga tabela de Output — base sempre em pontos, multiplicada
// por categoria/produto (conjunto)/segmento/tier quando a transação bate.

const MULTIPLICADOR_TIPO_LABEL: Record<MultiplicadorTipo, string> = {
  categoria: "Categoria de produto",
  produto:   "Produto (conjunto)",
  segmento:  "Segmento de membro",
  tier:      "Tier de membro",
};

function opcoesAlvo(tipo: MultiplicadorTipo): { id: string; nome: string }[] {
  switch (tipo) {
    case "categoria": return CATEGORIAS.map((c) => ({ id: c, nome: c }));
    case "produto":   return getConjuntosProdutos().map((c) => ({ id: c.id, nome: c.nome }));
    case "segmento":  return getSegmentosMembro().map((s) => ({ id: s.id, nome: s.nome }));
    case "tier":      return getTiersMembro().map((t) => ({ id: t.id, nome: t.nome }));
  }
}

function MultiplicadorFields({ pontosBase, multiplicadores, onChangeBase, onChangeMultiplicadores }: {
  pontosBase: number; multiplicadores: Multiplicador[];
  onChangeBase: (v: number) => void; onChangeMultiplicadores: (next: Multiplicador[]) => void;
}) {
  function addMult() {
    onChangeMultiplicadores([...multiplicadores, { id: novoIdMultiplicador(), tipo: "categoria", alvoId: "", fator: 2 }]);
  }
  function updMult(id: string, patch: Partial<Multiplicador>) {
    onChangeMultiplicadores(multiplicadores.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }
  function removerMult(id: string) {
    onChangeMultiplicadores(multiplicadores.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold">Quantos pontos, e o que multiplica</h3>
        <p className="text-sm text-muted-foreground mt-1">Sempre em pontos — defina a base e o que aumenta ela.</p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Pontos base <span className="text-destructive">*</span></Label>
        <div className="flex items-center gap-2 w-48">
          <NumberInput value={pontosBase} onChange={(v) => onChangeBase(v ?? 0)} min={0} />
          <span className="text-xs text-muted-foreground whitespace-nowrap">pts por ação elegível</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Multiplicadores</Label>
          <button type="button" onClick={addMult} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="size-3" />adicionar</button>
        </div>
        {multiplicadores.length === 0 ? (
          <p className="text-xs text-muted-foreground rounded-lg border border-dashed border-border px-3 py-3 text-center">Nenhum multiplicador — a campanha credita só os pontos base.</p>
        ) : (
          <div className="space-y-2">
            {multiplicadores.map((m) => (
              <div key={m.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                <Select value={m.tipo} onValueChange={(v) => updMult(m.id, { tipo: v as MultiplicadorTipo, alvoId: "" })}>
                  <SelectTrigger className="w-44 shrink-0"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(MULTIPLICADOR_TIPO_LABEL) as MultiplicadorTipo[]).map((t) => <SelectItem key={t} value={t}>{MULTIPLICADOR_TIPO_LABEL[t]}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={m.alvoId} onValueChange={(v) => updMult(m.id, { alvoId: v })}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {opcoesAlvo(m.tipo).map((o) => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1 shrink-0">
                  <NumberInput value={m.fator} onChange={(v) => updMult(m.id, { fator: v ?? 1 })} min={0} step={0.1} className="w-20" />
                  <span className="text-xs text-muted-foreground">x</span>
                </div>
                <button onClick={() => removerMult(m.id)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="size-3.5" /></button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">Os fatores se multiplicam entre si quando mais de um bate na mesma transação.</p>
      </div>
    </div>
  );
}

// ── Expiração de pontos ──────────────────────────────────────────────────────
// Só a configuração por enquanto — o motor ainda não expira saldo de verdade
// (decisão explícita: ficou de fora da implementação real desta etapa).

const EXPIRACAO_OPCOES: { value: ExpiracaoTipo; label: string }[] = [
  { value: "nao_expira",             label: "Não expira" },
  { value: "dias_sem_movimentacao",  label: "Após N dias sem movimentação" },
  { value: "data_fixa",              label: "Em data fixa" },
];

function ExpiracaoFields({ value, onChange }: { value: Form; onChange: (patch: Partial<Form>) => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold">Quando os pontos vencem</h3>
        <p className="text-sm text-muted-foreground mt-1">Configuração apenas — o motor ainda não expira saldo automaticamente.</p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Regra de expiração</Label>
        <div className="grid grid-cols-3 gap-2">
          {EXPIRACAO_OPCOES.map((opt) => (
            <label key={opt.value} className={`flex items-center justify-center text-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
              value.expiracaoTipo === opt.value ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
            }`}>
              <input type="radio" name="expiracaoTipo" checked={value.expiracaoTipo === opt.value} onChange={() => onChange({ expiracaoTipo: opt.value })} className="sr-only" />
              <span className="text-sm font-semibold">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {value.expiracaoTipo === "dias_sem_movimentacao" && (
        <div className="space-y-1.5">
          <Label className="text-sm">Dias sem movimentação</Label>
          <div className="flex items-center gap-2 w-48">
            <NumberInput value={value.expiracaoDias} onChange={(v) => onChange({ expiracaoDias: v ?? 365 })} min={1} />
            <span className="text-xs text-muted-foreground">dias</span>
          </div>
          <p className="text-xs text-muted-foreground">O saldo desta campanha expira se o membro ficar esse tempo sem gerar ou resgatar pontos.</p>
        </div>
      )}

      {value.expiracaoTipo === "data_fixa" && (
        <div className="space-y-1.5">
          <Label className="text-sm">Data de expiração</Label>
          <Input type="date" className="w-48" value={value.expiracaoData} onChange={(e) => onChange({ expiracaoData: e.target.value })} />
          <p className="text-xs text-muted-foreground">Todo saldo gerado por esta campanha vence nessa data, independente de quando foi creditado.</p>
        </div>
      )}
    </div>
  );
}

// ── Limite ────────────────────────────────────────────────────────────────────
// Teto de acúmulo com escopo configurável — já funciona de verdade no motor,
// recalculado a partir do histórico de eventos do membro a cada avaliação.

const LIMITE_ESCOPO_OPCOES: { value: LimiteEscopo; label: string; desc: string }[] = [
  { value: "transacao", label: "Por transação", desc: "Teto se reaplica em cada evento, independente." },
  { value: "periodo",   label: "Por período",   desc: "Teto soma dentro de uma janela (dia/semana/mês) e reseta." },
  { value: "membro",    label: "Por membro",    desc: "Teto vitalício — soma tudo que essa campanha já deu a esse membro." },
];

const GRANULARIDADE_LABEL: Record<LimitePeriodoGranularidade, string> = {
  dia: "Por dia", semana: "Por semana", mes: "Por mês",
};

function LimiteFields({ value, onChange }: { value: Form; onChange: (patch: Partial<Form>) => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold">Até quanto esta campanha credita</h3>
        <p className="text-sm text-muted-foreground mt-1">Teto de acúmulo — escolha o escopo em que ele se aplica.</p>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
        <div>
          <p className="text-sm font-medium">Limite ativo</p>
          <p className="text-xs text-muted-foreground">Sem limite, a campanha credita livremente.</p>
        </div>
        <Switch checked={value.limiteAtivo} onCheckedChange={(v) => onChange({ limiteAtivo: v })} />
      </div>

      {value.limiteAtivo && (
        <>
          <div className="space-y-1.5">
            <Label className="text-sm">Escopo</Label>
            <div className="grid grid-cols-3 gap-2">
              {LIMITE_ESCOPO_OPCOES.map((opt) => (
                <label key={opt.value} title={opt.desc} className={`flex flex-col gap-1 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                  value.limiteEscopo === opt.value ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                }`}>
                  <input type="radio" name="limiteEscopo" checked={value.limiteEscopo === opt.value} onChange={() => onChange({ limiteEscopo: opt.value })} className="sr-only" />
                  <span className="text-sm font-semibold">{opt.label}</span>
                  <span className="text-xs">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {value.limiteEscopo === "periodo" && (
            <div className="space-y-1.5">
              <Label className="text-sm">Granularidade do período</Label>
              <Select value={value.limitePeriodoGranularidade} onValueChange={(v) => onChange({ limitePeriodoGranularidade: v as LimitePeriodoGranularidade })}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(GRANULARIDADE_LABEL) as LimitePeriodoGranularidade[]).map((g) => <SelectItem key={g} value={g}>{GRANULARIDADE_LABEL[g]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm">Valor do teto</Label>
            <div className="flex items-center gap-2 w-48">
              <NumberInput value={value.limiteValor} onChange={(v) => onChange({ limiteValor: v ?? 0 })} min={0} />
              <span className="text-xs text-muted-foreground">pts</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Cancelamento/estorno ─────────────────────────────────────────────────────
// Pedido: já funciona de verdade — cancelamento/devolução gera transação negativa
// no motor, seguindo a política escolhida aqui. Indicação: também já funciona —
// se o membro indicado for bloqueado por fraude, o bônus de quem indicou é
// estornado automaticamente (não depende de política, é sempre revertido).

function CancelamentoFields({ value, onChange }: { value: Form; onChange: (patch: Partial<Form>) => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold">O que acontece no cancelamento</h3>
        <p className="text-sm text-muted-foreground mt-1">Pedido cancelado/devolvido — o motor já aplica isso de verdade.</p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Se o pedido for cancelado, devolvido ou recusado</Label>
        <div className="space-y-1.5">
          {(Object.keys(ESTORNO_LABEL) as EstornoPolicy[]).map((v) => (
            <label key={v} className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
              value.estornoPolicy === v ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            }`}>
              <input type="radio" name="estornoPolicy" checked={value.estornoPolicy === v} onChange={() => onChange({ estornoPolicy: v })} className="accent-primary" />
              <span className="text-sm font-medium">{ESTORNO_LABEL[v]}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">"Manter" e "Estorno proporcional" só têm efeito se o status Cancelado/Devolvido/Recusado também estiver marcado em Elegibilidade → Status do pedido — senão o evento simplesmente para de bater.</p>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 space-y-1">
        <p className="text-sm font-medium">Indicação cancelada</p>
        <p className="text-xs text-muted-foreground">Se o membro indicado for bloqueado por fraude, o bônus já dado a quem indicou é estornado automaticamente — não depende de configuração, vale pra qualquer campanha com Atribuição.</p>
      </div>
    </div>
  );
}

// Passo ainda não reconstruído nesta etapa da conversa — sem efeito no cálculo.
function PlaceholderStep({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center space-y-1.5">
      <p className="text-sm font-medium text-muted-foreground">{label} ainda não foi reconstruído</p>
      <p className="text-xs text-muted-foreground">Chega numa próxima etapa desta reconstrução do wizard — por enquanto, sem efeito no cálculo da campanha.</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CampanhasNova() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const existente = id ? getCampanha(id) : undefined;
  const editando = !!existente;
  const jaPublicada = editando && existente!.status !== "rascunho" && existente!.status !== "agendada";
  const [campanhaId] = useState(() => existente?.id ?? novoIdCampanha());

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>(existente ?? { ...DEFAULTS, ...getLiberacao() });
  const [published, setPublished] = useState(false);
  const [publicarModo, setPublicarModo] = useState<"agora" | "agendar">("agora");
  const [dataAgendada, setDataAgendada] = useState("");
  const [agendado, setAgendado] = useState(false);

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
          <Button variant="outline" onClick={() => { setForm({ ...DEFAULTS, ...getLiberacao() }); setStep(1); setPublished(false); setAgendado(false); setDataAgendada(""); setPublicarModo("agora"); }}>
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

      <div className="max-w-3xl mx-auto pt-6">
        <Stepper current={step} />

        {/* ── Step 1: Elegibilidade ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <h3 className="text-lg font-semibold">Quem, onde, o quê e quando</h3>
              <p className="text-sm text-muted-foreground mt-1">Elegibilidade é a base da campanha — quem participa, em que condição, e por quanto tempo.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Código</Label>
                <Input value={form.codigo} onChange={(e) => set("codigo", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Nome da campanha <span className="text-destructive">*</span></Label>
                <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Ex: Black Friday 2026" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Descrição</Label>
                <textarea
                  value={form.descricao}
                  onChange={(e) => set("descricao", e.target.value)}
                  placeholder="Caso desejar, você pode acrescentar uma breve descrição aqui"
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
              </div>
            </div>

            <div className="border-t border-border pt-5 space-y-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">O quê</p>
                <GatilhoFields value={form} onChange={(p) => setForm((prev) => ({ ...prev, ...p }))} />
              </div>

              <div className="border-t border-border pt-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quem gera vs. quem recebe</p>
                <AtribuicaoFields value={form} onChange={(p) => setForm((prev) => ({ ...prev, ...p }))} />
              </div>

              <div className="border-t border-border pt-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quem e onde</p>
                <ElegibilidadeFields value={form} onChange={(p) => setForm((prev) => ({ ...prev, ...p }))} />
              </div>

              <div className="border-t border-border pt-5 space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Quando</p>
                <Label className="text-sm">Vigência da campanha</Label>
                <div className="flex items-center gap-2 max-w-sm">
                  <Input type="date" value={form.periodoInicio} onChange={(e) => set("periodoInicio", e.target.value)} className="flex-1" />
                  <span className="text-muted-foreground text-sm shrink-0">→</span>
                  <Input type="date" value={form.periodoFim} onChange={(e) => set("periodoFim", e.target.value)} className="flex-1" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Multiplicador ── */}
        {step === 2 && (
          <MultiplicadorFields
            pontosBase={form.pontosBase}
            multiplicadores={form.multiplicadores}
            onChangeBase={(v) => set("pontosBase", v)}
            onChangeMultiplicadores={(v) => set("multiplicadores", v)}
          />
        )}

        {/* ── Step 3: Expiração de pontos ── */}
        {step === 3 && (
          <ExpiracaoFields value={form} onChange={(p) => setForm((prev) => ({ ...prev, ...p }))} />
        )}

        {/* ── Step 4: Limite ── */}
        {step === 4 && (
          <LimiteFields value={form} onChange={(p) => setForm((prev) => ({ ...prev, ...p }))} />
        )}

        {/* ── Step 5: Cancelamento/estorno ── */}
        {step === 5 && (
          <CancelamentoFields value={form} onChange={(p) => setForm((prev) => ({ ...prev, ...p }))} />
        )}

        {/* ── Step 6: Prioridade + revisão + publicação ── */}
        {step === 6 && (
          <div className="space-y-6">
            <PlaceholderStep label="Prioridade" />

            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Revisão</p>
              </div>
              <div className="px-5">
                <ReviewRow label="Código" value={form.codigo} />
                <ReviewRow label="Nome" value={form.nome || "—"} />
                <ReviewRow label="Gatilho" value={GATILHO_LABEL[form.gatilhoTipo]} />
                <ReviewRow label="Atribuição" value={form.atribuicaoAtiva ? MECANISMO_LABEL[form.mecanismoAtribuicao] : "não se aplica"} />
                <ReviewRow label="Elegibilidade" value={resumoElegibilidade(form)} />
                <ReviewRow label="Multiplicador" value={`${form.pontosBase}pt base${form.multiplicadores.length > 0 ? ` · ${form.multiplicadores.length} multiplicador(es)` : ""}`} />
                <ReviewRow label="Expiração" value={
                  form.expiracaoTipo === "nao_expira" ? "Não expira" :
                  form.expiracaoTipo === "dias_sem_movimentacao" ? `${form.expiracaoDias} dias sem movimentação` :
                  form.expiracaoData ? `Fixa em ${form.expiracaoData}` : "Data fixa — não definida"
                } />
                <ReviewRow label="Limite" value={
                  !form.limiteAtivo ? "Sem limite" :
                  `${form.limiteValor}pt ${form.limiteEscopo === "transacao" ? "por transação" : form.limiteEscopo === "periodo" ? `por ${GRANULARIDADE_LABEL[form.limitePeriodoGranularidade].toLowerCase()}` : "por membro (vitalício)"}`
                } />
                <ReviewRow label="Cancelamento" value={ESTORNO_LABEL[form.estornoPolicy]} />
                <ReviewRow label="Período" value={form.periodoInicio && form.periodoFim ? `${form.periodoInicio} → ${form.periodoFim}` : "—"} />
              </div>
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

        {/* ── Navigation ── */}
        <div className="flex gap-3 mt-10 pt-6 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={() => (step > 1 ? setStep(step - 1) : navigate("/campanhas"))}>
            Voltar
          </Button>
          {step < 6 ? (
            <Button className="flex-1" disabled={!canContinue()} onClick={() => setStep(step + 1)}>
              Continuar
            </Button>
          ) : jaPublicada ? (
            <Button className="flex-1" onClick={salvarComoRascunho}>
              Salvar alterações
            </Button>
          ) : (
            <Button className="flex-1" disabled={publicarModo === "agendar" && !dataAgendada} onClick={handlePublish}>
              {publicarModo === "agendar" ? "Agendar campanha" : "Publicar campanha"}
            </Button>
          )}
        </div>
        {step < 6 && (
          <p className="text-center mt-3">
            <button className="text-xs text-muted-foreground hover:text-foreground underline" onClick={salvarComoRascunho}>
              {jaPublicada ? "Salvar alterações e voltar" : "Salvar como rascunho"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
