import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, EmptyState, PageHeader, Switch, toast } from "@kruzer/ds";
import { CheckCircle2, ChevronRight, Library, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  IdentidadeFields, GatilhoFields, AtribuicaoFields, ElegibilidadeFields,
  OutputFields, FonteClasseFields, PoliticasFields,
} from "../components/RegraFields";
import {
  type Regra, type RegraCampos, DEFAULTS_REGRA,
  GATILHO_LABEL, EIXO_LABEL, CANAIS,
  getRegras, saveRegras, novoIdRegra,
} from "../lib/regras";
import { getConjuntosProdutos } from "../lib/conjuntosProdutos";
import { getClassesProduto } from "../lib/classesProduto";
import { getTiersMembro } from "../lib/tiers";
import { getPapeisMembro } from "../lib/papeisMembro";
import { getTiersProduto } from "../lib/tiersProduto";
import { getSegmentosMembro } from "../lib/segmentosMembro";
import { getConversao, saveConversao } from "../lib/conversaoPontos";
import { type LiberacaoConfig, getLiberacao, saveLiberacao } from "../lib/liberacao";
import {
  type BonificaEntidade, type BonificaEscolha, BONIFICA_OPCOES,
  entidadesDoGatilho, getBonificaEscolha, saveBonificaEscolha, getOnboardingDone,
} from "../lib/onboarding";

// ── Resumos textuais (listagem e revisão) ───────────────────────────────────

function resumoOutput(r: RegraCampos): string {
  if (r.tabelaBeneficio.length === 0) return "sem faixas definidas";
  return r.tabelaBeneficio
    .map((f) => `${f.de}${f.ate !== null ? `–${f.ate}` : "+"} → ${f.valor}pt${r.eixoTipo !== "flat" ? "/unid." : ""}`)
    .join(" · ");
}

function resumoElegibilidade(c: RegraCampos): string {
  const partes: string[] = [];
  if (c.valorMinimo) partes.push(`mín. R$${c.valorMinimo}`);
  if (c.produtoTiers.length > 0) partes.push(`tier de produto: ${c.produtoTiers.map((id) => getTiersProduto().find((x) => x.id === id)?.nome ?? id).join(", ")}`);
  partes.push(c.canais.length === 0 ? "todos os canais" : c.canais.map((id) => CANAIS.find((x) => x.id === id)?.nome ?? id).join(", "));
  partes.push(c.segmentos.length === 0 ? "todos os segmentos" : c.segmentos.map((id) => getSegmentosMembro().find((x) => x.id === id)?.nome ?? id).join(", "));
  partes.push(c.tiers.length === 0 ? "todos os tiers" : c.tiers.map((id) => getTiersMembro().find((x) => x.id === id)?.nome ?? id).join(", "));
  if (c.papeis.length > 0) partes.push(c.papeis.map((id) => getPapeisMembro().find((x) => x.id === id)?.nome ?? id).join(", "));
  partes.push(c.statusPedido.length === 0 ? "qualquer status" : c.statusPedido.join(", "));
  return partes.join(" · ");
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

// ── Stepper ───────────────────────────────────────────────────────────────────

const REGRA_STEPS = [
  { num: 1, label: "Identidade" },
  { num: 2, label: "Gatilho" },
  { num: 3, label: "Elegibilidade" },
  { num: 4, label: "Output" },
  { num: 5, label: "Revisão" },
];

function RegraStepper({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 flex-wrap">
      {REGRA_STEPS.map((s, idx) => {
        const done = s.num < current;
        const active = s.num === current;
        const isLast = idx === REGRA_STEPS.length - 1;
        return (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-colors ${
                done || active ? "bg-foreground border-foreground text-background" : "bg-background border-border text-muted-foreground"
              }`}>
                {done ? <CheckCircle2 className="h-3 w-3" /> : idx + 1}
              </div>
              <span className={`text-[10px] whitespace-nowrap text-center max-w-[76px] leading-tight ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </div>
            {!isLast && <div className={`h-px w-4 mx-1 mb-4 shrink-0 ${s.num < current ? "bg-foreground" : "bg-border"}`} />}
          </div>
        );
      })}
    </div>
  );
}

// ── Modal: Regra (wizard de 8 passos) ───────────────────────────────────────────

function RegraModal({ initial, onSave, onClose }: { initial?: Regra; onSave: (r: Regra) => void; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [campos, setCampos] = useState<RegraCampos>(initial ?? { ...DEFAULTS_REGRA, ...getLiberacao() });

  function patch(p: Partial<RegraCampos>) {
    setCampos((prev) => ({ ...prev, ...p }));
  }

  const canContinue = step !== 1 || !!campos.nome;
  const conjuntos = getConjuntosProdutos();

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{initial ? "Editar regra" : "Nova regra"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
        </div>

        <RegraStepper current={step} />

        {step === 1 && <IdentidadeFields value={campos} onChange={patch} />}
        {step === 2 && (
          <div className="space-y-5">
            <GatilhoFields value={campos} onChange={patch} />
            <div className="border-t border-border pt-5">
              <AtribuicaoFields value={campos} onChange={patch} />
            </div>
          </div>
        )}
        {step === 3 && <ElegibilidadeFields value={campos} onChange={patch} />}
        {step === 4 && (
          <div className="space-y-5">
            <OutputFields value={campos} onChange={patch} />
            <div className="border-t border-border pt-5">
              <FonteClasseFields value={campos} />
            </div>
          </div>
        )}
        {step === 5 && (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold">Revisão</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Confirme antes de publicar.</p>
            </div>
            <div className="rounded-lg border border-border overflow-hidden px-4">
              <ReviewRow label="Nome" value={campos.nome || "—"} />
              <ReviewRow label="Categoria / Módulo" value={`${campos.categoriaRegra} / ${campos.modulo}`} />
              <ReviewRow label="Gatilho" value={GATILHO_LABEL[campos.gatilhoTipo]} />
              <ReviewRow label="Atribuição" value={campos.atribuicaoAtiva ? campos.mecanismoAtribuicao : "não se aplica"} />
              <ReviewRow label="Elegibilidade" value={resumoElegibilidade(campos)} />
              <ReviewRow label="Output" value={`${EIXO_LABEL[campos.eixoTipo]} — ${resumoOutput(campos)}`} />
              {campos.gatilhoTipo === "compra_conjunto" && (
                <ReviewRow label="Conjunto (Gatilho)" value={conjuntos.find((c) => c.id === campos.gatilhoConjuntoId)?.nome ?? "—"} />
              )}
            </div>
            <details className="rounded-lg border border-border overflow-hidden group">
              <summary className="cursor-pointer list-none px-4 py-2.5 text-sm font-medium flex items-center justify-between">
                Avançado — Políticas
                <span className="text-xs text-muted-foreground group-open:hidden">timing, estorno, teto…</span>
              </summary>
              <div className="px-4 pb-4 pt-1 border-t border-border">
                <PoliticasFields value={campos} onChange={patch} />
              </div>
            </details>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => (step > 1 ? setStep(step - 1) : onClose())}>
            {step > 1 ? "Voltar" : "Cancelar"}
          </Button>
          {step < 5 ? (
            <Button className="flex-1" disabled={!canContinue} onClick={() => setStep(step + 1)}>
              Continuar
            </Button>
          ) : (
            <Button className="flex-1" disabled={!campos.nome}
              onClick={() => onSave({ ...campos, ativa: initial?.ativa ?? true, id: initial?.id ?? novoIdRegra() })}>
              Publicar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── O que bonifica ────────────────────────────────────────────────────────────

function BonificaMecanica() {
  const [bonifica, setBonifica] = useState<BonificaEscolha>(() => getBonificaEscolha());
  const [confirmar, setConfirmar] = useState<{ entidade: BonificaEntidade; count: number } | null>(null);
  const bonificaConfigurada = getOnboardingDone().includes("mecanica");

  function aplicar(v: BonificaEntidade) {
    const next = bonifica.includes(v) ? bonifica.filter((e) => e !== v) : [...bonifica, v];
    setBonifica(next);
    saveBonificaEscolha(next);
  }

  function alternar(v: BonificaEntidade) {
    if (bonifica.includes(v)) {
      const count = getRegras().filter((r) => entidadesDoGatilho(r.gatilhoTipo).includes(v)).length;
      if (count > 0) {
        setConfirmar({ entidade: v, count });
        return;
      }
    }
    aplicar(v);
  }

  if (!bonificaConfigurada) return null;

  const label = confirmar ? BONIFICA_OPCOES.find((o) => o.value === confirmar.entidade)?.label : "";

  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <p className="text-sm font-semibold">O que bonifica</p>
        <p className="text-xs text-muted-foreground mt-0.5">Define o que o programa recompensa — usado pelo Gatilho de cada regra.</p>
      </div>
      <div className="flex items-center gap-1.5">
        {BONIFICA_OPCOES.map((opt) => (
          <button key={opt.value} type="button" title={opt.desc} onClick={() => alternar(opt.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              bonifica.includes(opt.value) ? "border-primary bg-primary/10 text-primary" : "border-border/70 bg-background text-muted-foreground hover:border-primary/40"
            }`}>
            {opt.label}
          </button>
        ))}
      </div>

      {confirmar && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setConfirmar(null)}>
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">Remover "{label}"?</h2>
            <p className="text-sm text-muted-foreground">
              {confirmar.count} regra{confirmar.count > 1 ? "s" : ""} já {confirmar.count > 1 ? "usam" : "usa"} esse tipo de gatilho — {confirmar.count > 1 ? "elas continuam ativas" : "ela continua ativa"}, o programa só deixa de indicar que bonifica {label}.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmar(null)}>Cancelar</Button>
              <Button variant="destructive" className="flex-1" onClick={() => { aplicar(confirmar.entidade); setConfirmar(null); }}>Remover mesmo assim</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Bases de produto (Biblioteca) ────────────────────────────────────────────

function BasesProduto() {
  const bonifica = getBonificaEscolha();
  if (!bonifica.includes("produto")) return null;

  const conjuntos = getConjuntosProdutos().length;
  const classes = getClassesProduto().length;
  const tiers = getTiersProduto().length;
  const nenhumaBase = conjuntos === 0 && classes === 0 && tiers === 0;

  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600 shrink-0">
          <Library className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">Bases de produto</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {nenhumaBase
              ? "Nenhum Conjunto, Classe ou Tier de produto criado ainda — usados pelo Gatilho e pela Elegibilidade das regras."
              : `${conjuntos} conjunto${conjuntos !== 1 ? "s" : ""} · ${classes} classe${classes !== 1 ? "s" : ""} · ${tiers} tier${tiers !== 1 ? "s" : ""} de produto`}
          </p>
        </div>
      </div>
      <Button asChild size="sm" variant="outline">
        <Link to="/biblioteca">Gerenciar no Cadastro <ChevronRight className="ml-1.5 h-3.5 w-3.5" /></Link>
      </Button>
    </div>
  );
}

// ── Liberação padrão ─────────────────────────────────────────────────────────

function LiberacaoPadrao() {
  const [liberacao, setLiberacao] = useState<LiberacaoConfig>(() => getLiberacao());
  const liberacaoConfigurada = getOnboardingDone().includes("liberacao");

  function alterar(patch: Partial<LiberacaoConfig>) {
    setLiberacao((prev) => {
      const next = { ...prev, ...patch };
      saveLiberacao(next);
      return next;
    });
  }

  if (!liberacaoConfigurada) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <p className="text-sm font-semibold">Liberação padrão</p>
        <p className="text-xs text-muted-foreground mt-0.5">Timing inicial de toda regra nova — mudar aqui não afeta regra já criada.</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5">
          {([{ value: "imediato" as const, label: "Imediato" }, { value: "dias" as const, label: "Após X dias" }]).map((opt) => (
            <button key={opt.value} type="button" onClick={() => alterar({ timingTipo: opt.value })}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                liberacao.timingTipo === opt.value ? "border-primary bg-primary/10 text-primary" : "border-border/70 bg-background text-muted-foreground hover:border-primary/40"
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
        {liberacao.timingTipo === "dias" && (
          <div className="flex items-center gap-1.5">
            <input type="number" min={1} value={liberacao.timingDias}
              onChange={(e) => alterar({ timingDias: e.target.value ? Number(e.target.value) : 1 })}
              className="w-16 rounded-md border border-input bg-background px-2 py-1.5 text-xs" />
            <span className="text-xs text-muted-foreground">dias</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Conversão de pontos ──────────────────────────────────────────────────────

function ConversaoPontos() {
  const [valorPorPonto, setValorPorPonto] = useState<number | null>(() => getConversao().valorPorPonto);
  const conversaoConfigurada = getOnboardingDone().includes("conversao");

  function salvarConversao(v: number | null) {
    setValorPorPonto(v);
    saveConversao({ valorPorPonto: v ?? 0 });
  }

  if (!conversaoConfigurada) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <p className="text-sm font-semibold">Conversão de pontos</p>
        <p className="text-xs text-muted-foreground mt-0.5">Valor monetário de 1 ponto — usado no cálculo de liability (Dashboard) e, no futuro, no resgate.</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">R$</span>
        <input type="number" value={valorPorPonto ?? ""} min={0.001} step={0.001}
          onChange={(e) => salvarConversao(e.target.value ? Number(e.target.value) : null)}
          className="w-28 rounded-md border border-input bg-background px-3 py-1.5 text-sm" />
        <span className="text-sm text-muted-foreground">por ponto</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MecanicaPrograma() {
  const [regras, setRegras] = useState<Regra[]>(() => getRegras());
  const [modal, setModal] = useState<Regra | "new" | null>(null);
  const [excluirId, setExcluirId] = useState<string | null>(null);

  function persistir(next: Regra[]) {
    setRegras(next);
    saveRegras(next);
  }

  function salvar(r: Regra) {
    const next = modal === "new" ? [...regras, r] : regras.map((x) => (x.id === r.id ? r : x));
    persistir(next);
    setModal(null);
    toast.success("Regra publicada");
  }

  function excluir(id: string) {
    persistir(regras.filter((r) => r.id !== id));
    setExcluirId(null);
    toast.success("Regra removida");
  }

  function toggleAtiva(id: string) {
    persistir(regras.map((r) => (r.id === id ? { ...r, ativa: !r.ativa } : r)));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mecânica do Programa"
        path={[{ label: "Configuração" }]}
        description="Regras permanentes — sem janela de data. Uma regra com período vira campanha."
        actions={
          <Button size="sm" onClick={() => setModal("new")}>
            <Plus className="mr-2 h-4 w-4" />
            Nova regra
          </Button>
        }
      />

      <BonificaMecanica />
      <BasesProduto />
      <ConversaoPontos />
      <LiberacaoPadrao />

      {regras.length === 0 ? (
        <EmptyState icon={Plus} title="Nenhuma regra cadastrada"
          description="Crie a primeira regra do programa — sem regra, nenhuma compra gera pontos." />
      ) : (
        <div className="space-y-2">
          {regras.map((r) => (
            <div key={r.id} className={`rounded-lg border border-border bg-card px-5 py-4 ${!r.ativa ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{r.nome}</p>
                    <Badge variant="secondary">{r.categoriaRegra}</Badge>
                    {!r.ativa && <Badge variant="secondary">Inativa</Badge>}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground">
                    <span className="rounded-full bg-muted px-2 py-0.5">{GATILHO_LABEL[r.gatilhoTipo]}</span>
                    <span>·</span>
                    <span className="rounded-full bg-muted px-2 py-0.5">{r.modulo}</span>
                    <span>·</span>
                    <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 font-semibold">{resumoOutput(r)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Switch size="sm" checked={r.ativa} onCheckedChange={() => toggleAtiva(r.id)} />
                  <button onClick={() => setModal(r)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => setExcluirId(r.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <RegraModal
          initial={modal === "new" ? undefined : modal}
          onClose={() => setModal(null)}
          onSave={salvar}
        />
      )}

      {excluirId !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setExcluirId(null)}>
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">Remover regra?</h2>
            <p className="text-sm text-muted-foreground">Compras que dependiam só desta regra deixam de gerar pontos.</p>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setExcluirId(null)}>Cancelar</Button>
              <Button variant="destructive" className="flex-1" onClick={() => excluir(excluirId)}>Remover</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
