import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, PageHeader } from "@kruzer/ds";
import { CheckCircle2 } from "lucide-react";
import { renderCrumbLink } from "../lib/crumbLink";
import {
  IdentidadeFields, GatilhoFields, AtribuicaoFields, ElegibilidadeFields,
  OutputFields, FonteClasseFields, PoliticasFields,
} from "../components/RegraFields";
import {
  type RegraCampos, DEFAULTS_REGRA,
  GATILHO_LABEL, EIXO_LABEL, CANAIS,
  getRegras, saveRegras, novoIdRegra,
} from "../lib/regras";
import { getConjuntosProdutos } from "../lib/conjuntosProdutos";
import { getTiersMembro } from "../lib/tiers";
import { getPapeisMembro } from "../lib/papeisMembro";
import { getTiersProduto } from "../lib/tiersProduto";
import { getSegmentosMembro } from "../lib/segmentosMembro";
import { marcarOnboardingFeito } from "../lib/onboarding";
import { getLiberacao } from "../lib/liberacao";

// ── Resumos textuais (revisão) ───────────────────────────────────────────────

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
    <div className="flex items-center justify-center gap-0 flex-wrap mb-10">
      {REGRA_STEPS.map((s, idx) => {
        const done = s.num < current;
        const active = s.num === current;
        const isLast = idx === REGRA_STEPS.length - 1;
        return (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                done || active ? "bg-foreground border-foreground text-background" : "bg-background border-border text-muted-foreground"
              }`}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
              </div>
              <span className={`text-xs whitespace-nowrap text-center max-w-[90px] leading-tight ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </div>
            {!isLast && <div className={`h-px w-8 mx-2 mb-5 shrink-0 ${s.num < current ? "bg-foreground" : "bg-border"}`} />}
          </div>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OnboardingRegra() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [campos, setCampos] = useState<RegraCampos>({ ...DEFAULTS_REGRA, ...getLiberacao() });
  const [criada, setCriada] = useState(false);

  function patch(p: Partial<RegraCampos>) {
    setCampos((prev) => ({ ...prev, ...p }));
  }

  const canContinue = step !== 1 || !!campos.nome;
  const conjuntos = getConjuntosProdutos();

  function salvar() {
    const regras = getRegras();
    saveRegras([...regras, { ...campos, ativa: true, id: novoIdRegra() }]);
    marcarOnboardingFeito("mecanica");
    setCriada(true);
  }

  if (criada) {
    return (
      <div className="max-w-md mx-auto text-center pt-16 space-y-5">
        <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Regra criada!</h2>
          <p className="text-sm text-muted-foreground mt-1">"{campos.nome}" já está ativa e valendo pra qualquer compra que bater com ela.</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate("/")}>Voltar ao Dashboard</Button>
          <Button variant="outline" onClick={() => navigate("/mecanica")}>Ver Mecânica do Programa</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <PageHeader
        title="Crie sua primeira regra"
        path={[{ label: "Início", to: "/" }]}
        renderCrumbLink={renderCrumbLink}
      />

      <div className="max-w-2xl mx-auto pt-6">
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
            <div className="text-center mb-2">
              <h3 className="text-lg font-semibold">Revise antes de publicar</h3>
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

        <div className="flex gap-3 mt-10 pt-6 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={() => (step > 1 ? setStep(step - 1) : navigate("/"))}>
            Voltar
          </Button>
          {step < 5 ? (
            <Button className="flex-1" disabled={!canContinue} onClick={() => setStep(step + 1)}>
              Continuar
            </Button>
          ) : (
            <Button className="flex-1" disabled={!campos.nome} onClick={salvar}>
              Publicar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
