import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Badge,
} from "@kruzer/ds";
import {
  ArrowLeft,
  ShoppingCart,
  UserPlus,
  Gift,
  Calendar,
  Tag,
  Users,
  ChevronRight,
  ChevronDown,
  Eye,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Users2,
  TrendingUp,
} from "lucide-react";

// ── Templates ─────────────────────────────────────────────────────────

type Template = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trigger: string;
  defaultPoints: string;
  color: string;
  popular?: boolean;
};

const TEMPLATES: Template[] = [
  { id: "primeira-compra",  name: "Primeira compra",    description: "Recompensa quem faz a primeira transação elegível.",          icon: ShoppingCart, trigger: "compra",     defaultPoints: "500",  color: "bg-emerald-50 border-emerald-200 text-emerald-700", popular: true },
  { id: "boas-vindas",      name: "Boas-vindas",        description: "Pontos imediatos ao se cadastrar — acelera o primeiro engajamento.", icon: UserPlus, trigger: "cadastro",   defaultPoints: "200",  color: "bg-sky-50 border-sky-200 text-sky-700",             popular: true },
  { id: "aniversario",      name: "Aniversário",        description: "Multiplicador no mês de aniversário do membro.",               icon: Calendar,     trigger: "aniversário", defaultPoints: "2×",   color: "bg-violet-50 border-violet-200 text-violet-700",    popular: true },
  { id: "dobro-categoria",  name: "Dobro em categoria", description: "2× pontos em compras de uma categoria por tempo determinado.", icon: Tag,          trigger: "compra",     defaultPoints: "2×",   color: "bg-amber-50 border-amber-200 text-amber-700" },
  { id: "indicacao",        name: "Indicação de amigo", description: "Pontos para quem indica quando o amigo faz a primeira compra.", icon: Users,        trigger: "cadastro",   defaultPoints: "300",  color: "bg-pink-50 border-pink-200 text-pink-700" },
  { id: "compra-recorrente",name: "Compra recorrente",  description: "Bônus progressivo para membros que compram N vezes no mês.",   icon: Gift,         trigger: "compra",     defaultPoints: "100",  color: "bg-orange-50 border-orange-200 text-orange-700" },
];

// ── Rule form ─────────────────────────────────────────────────────────

type RuleForm = {
  name: string;
  trigger: string;
  eligTier: string;
  eligSegment: string;
  eligMinValue: string;
  eligCategory: string;
  eligChannel: string;
  pointsType: "fixed" | "percent" | "multiplier";
  pointsValue: string;
  releaseMode: "immediate" | "after_days" | "after_return_window";
  releaseDays: string;
  expiryMode: "never" | "days" | "end_of_year";
  expiryDays: string;
  limitPerMember: string;
  limitPerPeriod: string;
  cancelPolicy: "keep" | "reverse" | "partial";
  priority: "stack" | "first" | "highest";
};

const DEFAULTS: RuleForm = {
  name: "", trigger: "compra",
  eligTier: "todos", eligSegment: "todos", eligMinValue: "", eligCategory: "", eligChannel: "todos",
  pointsType: "fixed", pointsValue: "",
  releaseMode: "immediate", releaseDays: "7",
  expiryMode: "days", expiryDays: "365",
  limitPerMember: "", limitPerPeriod: "",
  cancelPolicy: "reverse",
  priority: "stack",
};

// ── Member + cost estimates ───────────────────────────────────────────

const TIER_COUNTS: Record<string, number> = {
  todos: 2490, Diamante: 228, Ouro: 352, Prata: 649, Bronze: 1261,
};
const SEG_COUNTS: Record<string, number> = {
  todos: 2490, Premium: 312, Fidelidade: 641, "Frete Grátis": 428, Básico: 872,
};

function estimateMembers(form: RuleForm): number {
  const byTier = TIER_COUNTS[form.eligTier] ?? 2490;
  const bySeg  = SEG_COUNTS[form.eligSegment] ?? 2490;
  return Math.min(byTier, bySeg);
}

function estimateCost(form: RuleForm, members: number): number {
  const avgTransactions = 2;        // per member per month (mock)
  const avgValue        = 200;      // R$ per transaction (mock)
  const v = Number(form.pointsValue) || 0;
  if (!v) return 0;
  if (form.pointsType === "fixed")      return v * members * avgTransactions;
  if (form.pointsType === "percent")    return Math.round(avgValue * (v / 100)) * members * avgTransactions;
  if (form.pointsType === "multiplier") return Math.round(avgValue * v) * members * avgTransactions;
  return 0;
}

// ── Basic dimensions (always visible) ────────────────────────────────

type BasicDim = {
  id: string;
  question: string;
  hint: string;
};

const BASIC: BasicDim[] = [
  { id: "eligibility", question: "Quem ganha?",       hint: "Defina quais membros e compras se qualificam." },
  { id: "points",      question: "Quanto ganha?",     hint: "Quanto cada transação elegível rende em pontos." },
  { id: "release",     question: "Quando recebe?",    hint: "Quando os pontos ficam disponíveis para resgate." },
];

// ── Preview ───────────────────────────────────────────────────────────

function Preview({ form }: { form: RuleForm }) {
  const sampleValue = 100;
  const v = Number(form.pointsValue) || 0;
  let earned = 0;
  if (form.pointsType === "fixed")      earned = v;
  else if (form.pointsType === "percent") earned = Math.round(sampleValue * v / 100);
  else if (form.pointsType === "multiplier") earned = sampleValue * v;

  const members  = estimateMembers(form);
  const cost     = estimateCost(form, members);
  const hasPoints = earned > 0;

  const releaseText =
    form.releaseMode === "immediate" ? "imediatamente" :
    form.releaseMode === "after_days" ? `após ${form.releaseDays || "?"} dias` :
    "após janela de troca/devolução";

  return (
    <Card className="border-emerald-200 bg-emerald-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Eye className="size-4 text-emerald-600" />
          <CardTitle className="text-sm text-emerald-800">Prévia em tempo real</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-emerald-900">
        {hasPoints ? (
          <>
            <p className="leading-relaxed">
              Uma compra de <strong>R$ {sampleValue},00</strong>
              {form.eligCategory ? ` em ${form.eligCategory}` : ""}
              {form.eligMinValue ? ` (mínimo R$ ${form.eligMinValue})` : ""}
              {" rende "}
              <strong className="text-lg">{earned.toLocaleString("pt-BR")} pontos</strong>,
              disponíveis {releaseText}.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/60 p-3 text-center">
                <Users2 className="size-4 mx-auto mb-1 text-emerald-600" />
                <div className="text-xl font-bold">{members.toLocaleString("pt-BR")}</div>
                <div className="text-xs text-emerald-700">membros elegíveis</div>
              </div>
              <div className="rounded-xl bg-white/60 p-3 text-center">
                <TrendingUp className="size-4 mx-auto mb-1 text-emerald-600" />
                <div className="text-xl font-bold">
                  {cost > 0 ? `~${(cost / 1000).toFixed(0)}k` : "—"}
                </div>
                <div className="text-xs text-emerald-700">pts/mês estimados</div>
              </div>
            </div>

            {cost > 100000 && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-100 border border-amber-300 px-3 py-2 text-xs text-amber-800">
                <AlertTriangle className="size-3.5 shrink-0" />
                Custo acima de 100k pts/mês — revise o limite por membro.
              </div>
            )}
          </>
        ) : (
          <p className="text-emerald-600 italic text-xs">
            Preencha "Quanto ganha?" para ver a prévia.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main ──────────────────────────────────────────────────────────────

type Step = "templates" | "form" | "confirm";

export default function CampanhasNova() {
  const [step, setStep]               = useState<Step>("templates");
  const [form, setForm]               = useState<RuleForm>(DEFAULTS);
  const [openDim, setOpenDim]         = useState<string>("eligibility");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [published, setPublished]     = useState(false);

  const set = (key: keyof RuleForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const applyTemplate = (t: Template) => {
    setForm({
      ...DEFAULTS,
      name: t.name,
      trigger: t.trigger,
      pointsValue: t.defaultPoints.replace("×", ""),
      pointsType: t.defaultPoints.includes("×") ? "multiplier" : "fixed",
    });
    setStep("form");
  };

  const members = estimateMembers(form);
  const cost    = estimateCost(form, members);

  // ── Step 1: templates ──────────────────────────────────────────
  if (step === "templates") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/campanhas"><ArrowLeft className="size-4 mr-1.5" />Campanhas</Link>
          </Button>
          <div>
            <h2 className="text-lg font-semibold">Nova campanha</h2>
            <p className="text-sm text-muted-foreground">Escolha um modelo para começar mais rápido.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => applyTemplate(t)}
                className={`rounded-2xl border-2 p-5 text-left transition-all hover:shadow-md hover:-translate-y-0.5 ${t.color}`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${t.color}`}>
                    <Icon className="size-4" />
                  </div>
                  {t.popular && <Badge variant="secondary" className="text-[10px]">Popular</Badge>}
                </div>
                <div className="font-semibold mb-1">{t.name}</div>
                <div className="text-xs opacity-80 leading-relaxed">{t.description}</div>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium opacity-70">
                  Usar modelo <ChevronRight className="size-3" />
                </div>
              </button>
            );
          })}

          <button
            onClick={() => setStep("form")}
            className="rounded-2xl border-2 border-dashed border-border p-5 text-left hover:border-primary/40 hover:bg-muted/20 transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted mb-3">
              <Sparkles className="size-4 text-muted-foreground" />
            </div>
            <div className="font-semibold mb-1 text-muted-foreground">Do zero</div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              Configure cada detalhe manualmente.
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ── Step 3: confirmation ───────────────────────────────────────
  if (step === "confirm") {
    if (published) {
      return (
        <div className="max-w-lg mx-auto text-center space-y-5 pt-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mx-auto">
            <CheckCircle2 className="size-8 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Campanha publicada!</h2>
            <p className="text-sm text-muted-foreground mt-1">
              <strong>{form.name}</strong> está ativa agora para {members.toLocaleString("pt-BR")} membros elegíveis.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button asChild>
              <Link to="/campanhas">Ver campanhas</Link>
            </Button>
            <Button variant="outline" onClick={() => { setForm(DEFAULTS); setStep("templates"); setPublished(false); }}>
              Criar outra
            </Button>
          </div>
        </div>
      );
    }

    const pointsLabel =
      form.pointsType === "fixed"      ? `${form.pointsValue} pontos por transação` :
      form.pointsType === "percent"    ? `${form.pointsValue}% do valor em pontos` :
      `${form.pointsValue}× a pontuação base`;

    const releaseLabel =
      form.releaseMode === "immediate"          ? "imediatamente" :
      form.releaseMode === "after_days"         ? `após ${form.releaseDays} dias` :
      "após janela de troca/devolução";

    return (
      <div className="space-y-5 max-w-xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setStep("form")}>
            <ArrowLeft className="size-4 mr-1.5" />Ajustar
          </Button>
          <div>
            <h2 className="text-lg font-semibold">Confirmar publicação</h2>
            <p className="text-sm text-muted-foreground">Revise antes de ativar.</p>
          </div>
        </div>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle>{form.name || "Nova campanha"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-muted/30 p-4 text-sm space-y-2">
              <p>
                Membros <strong>{form.eligTier !== "todos" ? form.eligTier : "de qualquer tier"}</strong>
                {form.eligSegment !== "todos" ? ` do segmento ${form.eligSegment}` : ""}
                {form.eligMinValue ? ` que comprarem acima de R$ ${form.eligMinValue}` : " que comprarem"}
                {form.eligCategory ? ` em ${form.eligCategory}` : ""}
                {" ganharão "}
                <strong>{pointsLabel}</strong>,
                disponíveis {releaseLabel}.
              </p>
              {form.limitPerMember && (
                <p>Limite de <strong>{form.limitPerMember} pts</strong> por membro.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-sky-50 border border-sky-200 p-3 text-center">
                <div className="text-xl font-bold text-sky-700">{members.toLocaleString("pt-BR")}</div>
                <div className="text-xs text-sky-600">membros elegíveis</div>
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-center">
                <div className="text-xl font-bold text-amber-700">
                  ~{cost > 0 ? `${(cost / 1000).toFixed(0)}k` : "0"} pts
                </div>
                <div className="text-xs text-amber-600">estimativa mensal</div>
              </div>
            </div>

            {cost > 100000 && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                <AlertTriangle className="size-3.5 shrink-0" />
                Custo estimado alto. Considere definir um limite por membro antes de publicar.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button className="flex-1" onClick={() => setPublished(true)}>
            Publicar campanha
          </Button>
          <Button variant="outline" onClick={() => setStep("form")}>
            Voltar e ajustar
          </Button>
          <Button variant="ghost" onClick={() => setStep("templates")}>
            Salvar rascunho
          </Button>
        </div>
      </div>
    );
  }

  // ── Step 2: form ───────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setStep("templates")}>
          <ArrowLeft className="size-4 mr-1.5" />Modelos
        </Button>
        <div>
          <h2 className="text-lg font-semibold">Configurar campanha</h2>
          <p className="text-sm text-muted-foreground">Responda as perguntas abaixo.</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {/* Name */}
          <Card>
            <CardContent className="pt-5">
              <label className="block text-xs text-muted-foreground mb-1">Nome da campanha</label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="ex: Junho vale mais — Dobro em Eletrônicos"
              />
            </CardContent>
          </Card>

          {/* Basic dimensions */}
          {BASIC.map((dim) => {
            const isOpen = openDim === dim.id;
            return (
              <Card key={dim.id} className={isOpen ? "ring-1 ring-primary/30" : ""}>
                <button
                  className="flex w-full items-center gap-3 px-5 py-4 text-left"
                  onClick={() => setOpenDim(isOpen ? "" : dim.id)}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isOpen ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {BASIC.findIndex((d) => d.id === dim.id) + 1}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{dim.question}</div>
                    {!isOpen && <div className="text-xs text-muted-foreground">{dim.hint}</div>}
                  </div>
                  <ChevronRight className={`size-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                </button>

                {isOpen && (
                  <CardContent className="pt-0 pb-5 border-t border-border space-y-3">
                    <p className="text-xs text-muted-foreground">{dim.hint}</p>

                    {dim.id === "eligibility" && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Tier</label>
                          <Select value={form.eligTier} onValueChange={(v) => set("eligTier", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["todos", "Diamante", "Ouro", "Prata", "Bronze"].map((t) => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Segmento</label>
                          <Select value={form.eligSegment} onValueChange={(v) => set("eligSegment", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["todos", "Premium", "Fidelidade", "Básico"].map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Valor mínimo (R$)</label>
                          <Input value={form.eligMinValue} onChange={(e) => set("eligMinValue", e.target.value)} placeholder="sem mínimo" type="number" />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Categoria de produto</label>
                          <Input value={form.eligCategory} onChange={(e) => set("eligCategory", e.target.value)} placeholder="qualquer categoria" />
                        </div>
                      </div>
                    )}

                    {dim.id === "points" && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Como calcular</label>
                          <Select value={form.pointsType} onValueChange={(v) => set("pointsType", v as RuleForm["pointsType"])}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">Valor fixo por compra</SelectItem>
                              <SelectItem value="percent">Percentual do valor da compra</SelectItem>
                              <SelectItem value="multiplier">Multiplicador da regra base</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">
                            {form.pointsType === "fixed" ? "Pontos" : form.pointsType === "percent" ? "Percentual (%)" : "Multiplicador (×)"}
                          </label>
                          <Input value={form.pointsValue} onChange={(e) => set("pointsValue", e.target.value)} placeholder={form.pointsType === "multiplier" ? "ex: 2" : "ex: 100"} type="number" />
                        </div>
                      </div>
                    )}

                    {dim.id === "release" && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Disponível</label>
                          <Select value={form.releaseMode} onValueChange={(v) => set("releaseMode", v as RuleForm["releaseMode"])}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Imediatamente após a compra</SelectItem>
                              <SelectItem value="after_days">Após N dias</SelectItem>
                              <SelectItem value="after_return_window">Após janela de troca/devolução</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {form.releaseMode === "after_days" && (
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">Quantos dias</label>
                            <Input value={form.releaseDays} onChange={(e) => set("releaseDays", e.target.value)} type="number" />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}

          {/* Advanced toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
          >
            <ChevronDown className={`size-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            {showAdvanced ? "Ocultar configurações avançadas" : "Configurações avançadas"}&nbsp;
            <span className="text-xs">(expiração, limite, cancelamento, prioridade — com bons defaults)</span>
          </button>

          {showAdvanced && (
            <div className="space-y-3">
              {[
                {
                  id: "expiry", num: 4, question: "Quando vence?",
                  hint: "Quando os pontos expiram se não forem usados.",
                  defaultNote: `Padrão: ${form.expiryDays} dias sem movimento`,
                },
                {
                  id: "limit", num: 5, question: "Até quanto por pessoa?",
                  hint: "Teto de pontos por membro ou por período.",
                  defaultNote: "Padrão: sem limite",
                },
                {
                  id: "cancellation", num: 6, question: "E se devolver?",
                  hint: "O que acontece com os pontos se a compra for cancelada.",
                  defaultNote: "Padrão: estorno total",
                },
                {
                  id: "priority", num: 7, question: "Se duas regras se aplicarem, qual vale?",
                  hint: "Qual regra prevalece quando mais de uma se aplica à mesma transação.",
                  defaultNote: "Padrão: acumula todas",
                },
              ].map((dim) => {
                const isOpen = openDim === dim.id;
                return (
                  <Card key={dim.id} className={`border-dashed ${isOpen ? "ring-1 ring-primary/30 border-solid" : ""}`}>
                    <button
                      className="flex w-full items-center gap-3 px-5 py-4 text-left"
                      onClick={() => setOpenDim(isOpen ? "" : dim.id)}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold bg-muted text-muted-foreground">
                        {dim.num}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{dim.question}</div>
                        <div className="text-xs text-muted-foreground">{isOpen ? dim.hint : dim.defaultNote}</div>
                      </div>
                      <ChevronRight className={`size-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                    </button>

                    {isOpen && (
                      <CardContent className="pt-0 pb-5 border-t border-border space-y-3">
                        <p className="text-xs text-muted-foreground">{dim.hint}</p>

                        {dim.id === "expiry" && (
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Select value={form.expiryMode} onValueChange={(v) => set("expiryMode", v as RuleForm["expiryMode"])}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="days">Após N dias sem movimento</SelectItem>
                                <SelectItem value="end_of_year">Fim do ano calendário</SelectItem>
                                <SelectItem value="never">Nunca expiram</SelectItem>
                              </SelectContent>
                            </Select>
                            {form.expiryMode === "days" && (
                              <Input value={form.expiryDays} onChange={(e) => set("expiryDays", e.target.value)} type="number" placeholder="365" />
                            )}
                          </div>
                        )}

                        {dim.id === "limit" && (
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Limite por membro (pts)</label>
                              <Input value={form.limitPerMember} onChange={(e) => set("limitPerMember", e.target.value)} placeholder="sem limite" type="number" />
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Limite por período (pts)</label>
                              <Input value={form.limitPerPeriod} onChange={(e) => set("limitPerPeriod", e.target.value)} placeholder="sem limite" type="number" />
                            </div>
                          </div>
                        )}

                        {dim.id === "cancellation" && (
                          <Select value={form.cancelPolicy} onValueChange={(v) => set("cancelPolicy", v as RuleForm["cancelPolicy"])}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="reverse">Estornar todos os pontos</SelectItem>
                              <SelectItem value="partial">Estorno proporcional ao valor cancelado</SelectItem>
                              <SelectItem value="keep">Manter os pontos</SelectItem>
                            </SelectContent>
                          </Select>
                        )}

                        {dim.id === "priority" && (
                          <Select value={form.priority} onValueChange={(v) => set("priority", v as RuleForm["priority"])}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="stack">Acumular — aplica todas as regras</SelectItem>
                              <SelectItem value="highest">A de maior valor vence</SelectItem>
                              <SelectItem value="first">A primeira cadastrada vence</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1"
              disabled={!form.name || !form.pointsValue}
              onClick={() => setStep("confirm")}
            >
              Revisar e publicar →
            </Button>
            <Button variant="outline">Salvar rascunho</Button>
          </div>
          {(!form.name || !form.pointsValue) && (
            <p className="text-xs text-muted-foreground text-center">
              Preencha o nome e "Quanto ganha?" para continuar.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Preview form={form} />
        </div>
      </div>
    </div>
  );
}
