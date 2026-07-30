// Onboarding obrigatório do primeiro acesso — rota própria, fora do layout
// padrão do admin. Enquanto a versão for "Primeiro acesso" (V1), o guard em
// App.tsx redireciona qualquer rota do admin pra cá, com exceção das próprias
// páginas de destino dos passos (cadastro, canais, campanha nova).

import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Card, Button, NumberInput, Input,
} from "@kruzer/ds";
import {
  Sparkles, Sliders, UserPlus, Wallet, Building2, Unlock, Coins,
  ChevronRight, CheckCircle2, Lock,
} from "lucide-react";
import { MOEDA, type TipoResgate, TIPO_RESGATE_LABEL, saveMoeda } from "../config/programa";
import { getConversao, saveConversao } from "../lib/conversaoPontos";
import { type LiberacaoConfig, getLiberacao, saveLiberacao } from "../lib/liberacao";
import {
  type BonificaEntidade, type BonificaEscolha, getBonificaEscolha, saveBonificaEscolha,
  getOnboardingDone, marcarOnboardingFeito, onboardingCompleto,
} from "../lib/onboarding";
import { ehV1 } from "../lib/versao";
import { OnboardingScreenShell } from "../components/OnboardingScreenShell";

const BONIFICA_OPCOES: { value: BonificaEntidade; label: string; desc: string }[] = [
  { value: "produto", label: "Produto",  desc: "Pontua a compra de um produto ou conjunto/classe específico." },
  { value: "pedido",  label: "Pedido",   desc: "Pontua a compra em geral — qualquer pedido, sem exigir produto específico." },
  { value: "cliente", label: "Cliente",  desc: "Pontua por comportamento — cadastro, indicação, recorrência." },
];

function descCadastro(bonifica: BonificaEscolha): string {
  const temProduto = bonifica.includes("produto") || bonifica.includes("pedido");
  const temCliente = bonifica.includes("cliente");
  if (temProduto && temCliente) return "Cadastre e importe seus membros e produtos — um a um ou em massa por CSV.";
  if (temProduto) return "Cadastre e importe seus produtos — um a um ou em massa por CSV.";
  return "Cadastre e importe seus membros — um a um ou em massa por CSV.";
}

const SETUP_STEPS: {
  id: string; icon: typeof Sliders; title: string; desc: string; href: string; cta: string; iconColor: string;
  relevantFor: BonificaEntidade[] | null; // null = sempre relevante
  dependsOn: string[];
}[] = [
  { id: "mecanica",   icon: Sliders,    title: "Decida o que bonifica",                    desc: "Produto, pedido, cliente ou os dois — o gatilho da regra define isso.", href: "",                cta: "",                       iconColor: "text-sky-600 bg-sky-100",        relevantFor: null, dependsOn: [] },
  { id: "cadastro",   icon: UserPlus,   title: "Cadastre e importe",                        desc: "Escolha o que bonifica no passo 1 pra ver o que cadastrar aqui.", href: "/onboarding/cadastro", cta: "Cadastrar agora",       iconColor: "text-blue-600 bg-blue-100",      relevantFor: null, dependsOn: ["mecanica"] },
  { id: "conversao",  icon: Wallet,     title: "Defina o valor de 1 ponto",                 desc: "Quanto R$ vale 1 ponto — usado no cálculo de liability e resgate.", href: "",                    cta: "",                       iconColor: "text-fuchsia-600 bg-fuchsia-100",relevantFor: null, dependsOn: ["mecanica"] },
  { id: "canais",     icon: Building2,  title: "Cadastre canais e filiais",                 desc: "Defina onde as vendas e eventos do programa acontecem.",        href: "/canais-filiais",       cta: "Configurar canais",     iconColor: "text-indigo-600 bg-indigo-100",  relevantFor: null, dependsOn: ["mecanica"] },
  { id: "liberacao",  icon: Unlock,     title: "Defina a liberação do crédito",             desc: "Quando o ponto fica disponível — na hora do acúmulo ou após um prazo.", href: "",                cta: "",                       iconColor: "text-rose-600 bg-rose-100",      relevantFor: null, dependsOn: ["mecanica"] },
  { id: "moeda",      icon: Coins,      title: "Defina a moeda do resgate",                 desc: "Em que o ponto se converte no resgate, além de nome e sigla.",  href: "",                     cta: "",                       iconColor: "text-yellow-600 bg-yellow-100",  relevantFor: null, dependsOn: ["mecanica"] },
  { id: "campaign",   icon: Sparkles,   title: "Crie sua primeira campanha",                desc: "Escolha um modelo e configure em menos de 5 minutos.",          href: "/campanhas/nova",       cta: "Criar campanha",        iconColor: "text-violet-600 bg-violet-100",  relevantFor: null, dependsOn: ["cadastro"] },
];

function ehRelevante(step: typeof SETUP_STEPS[number], bonifica: BonificaEscolha): boolean {
  if (!step.relevantFor) return true;
  if (bonifica.length === 0) return true; // ainda não decidido — mostra tudo até a escolha
  return step.relevantFor.some((e) => bonifica.includes(e));
}

export default function OnboardingSetup() {
  const [done, setDone] = useState<string[]>(() => getOnboardingDone());
  const [bonifica, setBonifica] = useState<BonificaEscolha>(() => getBonificaEscolha());
  const [valorPorPonto, setValorPorPonto] = useState<number | null>(() => getConversao().valorPorPonto);
  const [liberacao, setLiberacao] = useState<LiberacaoConfig>(() => getLiberacao());
  const [moeda, setMoeda] = useState<{ nome: string; abrev: string; tipoResgate: TipoResgate }>(() => ({ nome: MOEDA.nome, abrev: MOEDA.abrev, tipoResgate: MOEDA.tipoResgate }));

  if (!ehV1() || onboardingCompleto()) return <Navigate to="/dashboard" replace />;

  function alternarBonifica(v: BonificaEntidade) {
    setBonifica((prev) => {
      const next = prev.includes(v) ? prev.filter((e) => e !== v) : [...prev, v];
      saveBonificaEscolha(next);
      if (next.length > 0) {
        marcarOnboardingFeito("mecanica");
        setDone(getOnboardingDone());
      }
      return next;
    });
  }

  function alterarValorPorPonto(v: number | null) {
    setValorPorPonto(v);
    saveConversao({ valorPorPonto: v ?? 0 });
    marcarOnboardingFeito("conversao");
    setDone(getOnboardingDone());
  }

  function alterarLiberacao(patch: Partial<LiberacaoConfig>) {
    setLiberacao((prev) => {
      const next = { ...prev, ...patch };
      saveLiberacao(next);
      return next;
    });
    marcarOnboardingFeito("liberacao");
    setDone(getOnboardingDone());
  }

  function alterarMoeda(patch: Partial<{ nome: string; abrev: string; tipoResgate: TipoResgate }>) {
    setMoeda((prev) => {
      const next = { ...prev, ...patch };
      saveMoeda(next);
      return next;
    });
    marcarOnboardingFeito("moeda");
    setDone(getOnboardingDone());
  }

  const visiveis = SETUP_STEPS.filter((s) => ehRelevante(s, bonifica));
  const allDone = visiveis.every((s) => done.includes(s.id));

  return (
    <OnboardingScreenShell title="Configure seu programa" subtitle="Complete os passos abaixo, em ordem, pra liberar o resto do painel.">
        <Card className="border-primary/20 bg-primary/5 overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <div className="font-semibold">Boas-vindas ao programa 👋</div>
          </div>
          <div className="px-5 pb-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>{visiveis.filter((s) => done.includes(s.id)).length} de {visiveis.length} concluídos</span>
              {allDone && <span className="text-emerald-600 font-semibold">Tudo pronto!</span>}
            </div>
            <div className="h-1.5 rounded-full bg-border">
              <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${(visiveis.filter((s) => done.includes(s.id)).length / visiveis.length) * 100}%` }} />
            </div>
          </div>
          <div className="px-5 pb-5">
            {visiveis.map((step, idx) => {
              const Icon = step.icon;
              const isDone = done.includes(step.id);
              const deps = step.dependsOn;
              const isLocked = !isDone && deps.some((d) => !done.includes(d));
              const isLast = idx === visiveis.length - 1;
              const depsLabels = deps.filter((d) => !done.includes(d)).map((d) => SETUP_STEPS.find((s) => s.id === d)?.title ?? d);

              return (
                <div key={step.id} className="flex gap-3">
                  {/* Coluna do conector */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      isDone ? "bg-emerald-100 text-emerald-600" : isLocked ? "bg-muted text-muted-foreground" : step.iconColor
                    }`}>
                      {isDone ? <CheckCircle2 className="size-4" /> : isLocked ? <Lock className="size-3.5" /> : <Icon className="size-4" />}
                    </div>
                    {!isLast && <div className={`w-px flex-1 my-1 ${isDone ? "bg-emerald-300" : "bg-border"}`} />}
                  </div>

                  {/* Conteúdo */}
                  <div className={`flex-1 pb-5 ${isLocked ? "opacity-50" : ""}`}>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{step.title}</p>
                      {isDone && <span className="text-[10px] font-semibold text-emerald-600">Feito</span>}
                    </div>

                    {step.id === "mecanica" ? (
                      <div className="mt-1.5 space-y-1.5 max-w-sm">
                        <div className="grid grid-cols-3 gap-1.5">
                          {BONIFICA_OPCOES.map((opt) => (
                            <button key={opt.value} type="button" title={opt.desc}
                              onClick={() => alternarBonifica(opt.value)}
                              className={`rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                                bonifica.includes(opt.value) ? "border-primary bg-primary/10 text-primary" : "border-border/70 bg-background text-muted-foreground hover:border-primary/40"
                              }`}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {bonifica.length > 0
                            ? bonifica.map((v) => BONIFICA_OPCOES.find((o) => o.value === v)?.label).join(" + ")
                            : "Escolha 1, 2 ou as 3 entidades que este programa vai bonificar."}
                        </p>
                      </div>
                    ) : step.id === "cadastro" && bonifica.length > 0 ? (
                      <p className="text-xs text-muted-foreground mt-0.5">{descCadastro(bonifica)}</p>
                    ) : step.id === "conversao" ? (
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">R$</span>
                        <NumberInput value={valorPorPonto} onChange={alterarValorPorPonto} min={0.001} step={0.001} className="w-24 h-7 text-xs" />
                        <span className="text-xs text-muted-foreground">por ponto</span>
                      </div>
                    ) : step.id === "liberacao" ? (
                      <div className="mt-1.5 space-y-1.5 max-w-sm">
                        <div className="grid grid-cols-2 gap-1.5">
                          {([
                            { value: "imediato" as const, label: "Imediato" },
                            { value: "dias" as const,     label: "Após X dias" },
                          ]).map((opt) => (
                            <button key={opt.value} type="button"
                              onClick={() => alterarLiberacao({ timingTipo: opt.value })}
                              className={`rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                                liberacao.timingTipo === opt.value ? "border-primary bg-primary/10 text-primary" : "border-border/70 bg-background text-muted-foreground hover:border-primary/40"
                              }`}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        {liberacao.timingTipo === "dias" && (
                          <div className="flex items-center gap-2">
                            <NumberInput value={liberacao.timingDias} onChange={(v) => alterarLiberacao({ timingDias: v ?? 7 })} min={1} className="w-20 h-7 text-xs" />
                            <span className="text-xs text-muted-foreground">dias após o acúmulo</span>
                          </div>
                        )}
                      </div>
                    ) : step.id === "moeda" ? (
                      <div className="mt-1.5 space-y-2 max-w-sm">
                        <div className="grid grid-cols-3 gap-1.5">
                          {(["catalogo", "cashback", "ambos"] as TipoResgate[]).map((v) => (
                            <button key={v} type="button"
                              onClick={() => alterarMoeda({ tipoResgate: v })}
                              className={`rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                                moeda.tipoResgate === v ? "border-primary bg-primary/10 text-primary" : "border-border/70 bg-background text-muted-foreground hover:border-primary/40"
                              }`}>
                              {TIPO_RESGATE_LABEL[v]}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <Input value={moeda.nome} onChange={(e) => alterarMoeda({ nome: e.target.value })} placeholder="Nome" className="h-7 text-xs" />
                          <Input value={moeda.abrev} onChange={(e) => alterarMoeda({ abrev: e.target.value })} placeholder="Sigla" className="h-7 text-xs w-20" />
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                    )}

                    {isLocked && (
                      <p className="text-[11px] text-muted-foreground mt-1.5">Depende de: {depsLabels.join(", ")}</p>
                    )}

                    {!isDone && !isLocked && step.href && (
                      <div className="flex items-center gap-2 mt-2">
                        <Button asChild size="sm" className="h-7 text-xs">
                          <Link to={step.href}>{step.cta} <ChevronRight className="size-3 ml-1" /></Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
    </OnboardingScreenShell>
  );
}
