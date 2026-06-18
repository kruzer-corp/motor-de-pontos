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
} from "@kruzer-corp/ds";
import {
  ArrowLeft,
  ShoppingCart,
  UserPlus,
  Gift,
  Calendar,
  Tag,
  Users,
  ChevronRight,
  Eye,
  Sparkles,
} from "lucide-react";

// ── Template library ──────────────────────────────────────────────────

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
  {
    id: "primeira-compra",
    name: "Primeira compra",
    description: "Recompensa quem faz a primeira transação elegível no programa.",
    icon: ShoppingCart,
    trigger: "compra",
    defaultPoints: "500",
    color: "bg-emerald-50 border-emerald-200 text-emerald-700",
    popular: true,
  },
  {
    id: "boas-vindas",
    name: "Boas-vindas",
    description: "Pontos imediatos ao se cadastrar no programa — reduz o tempo até o primeiro engajamento.",
    icon: UserPlus,
    trigger: "cadastro",
    defaultPoints: "200",
    color: "bg-sky-50 border-sky-200 text-sky-700",
    popular: true,
  },
  {
    id: "aniversario",
    name: "Aniversário",
    description: "Multiplicador de pontos durante o mês de aniversário do membro.",
    icon: Calendar,
    trigger: "aniversário",
    defaultPoints: "2×",
    color: "bg-violet-50 border-violet-200 text-violet-700",
    popular: true,
  },
  {
    id: "dobro-categoria",
    name: "Dobro em categoria",
    description: "2× pontos em compras de uma categoria específica por tempo determinado.",
    icon: Tag,
    trigger: "compra",
    defaultPoints: "2×",
    color: "bg-amber-50 border-amber-200 text-amber-700",
  },
  {
    id: "indicacao",
    name: "Indicação de amigo",
    description: "Pontos para quem indica quando o amigo realiza a primeira compra.",
    icon: Users,
    trigger: "cadastro",
    defaultPoints: "300",
    color: "bg-pink-50 border-pink-200 text-pink-700",
  },
  {
    id: "compra-recorrente",
    name: "Compra recorrente",
    description: "Bônus progressivo para membros que compram N vezes no mês.",
    icon: Gift,
    trigger: "compra",
    defaultPoints: "100",
    color: "bg-orange-50 border-orange-200 text-orange-700",
  },
];

// ── Rule form (7 dimensões) ───────────────────────────────────────────

type RuleForm = {
  name: string;
  trigger: string;
  // 1. Elegibilidade
  eligTier: string;
  eligSegment: string;
  eligMinValue: string;
  eligCategory: string;
  eligChannel: string;
  // 2. Pontuação
  pointsType: "fixed" | "percent" | "multiplier";
  pointsValue: string;
  // 3. Liberação
  releaseMode: "immediate" | "after_days" | "after_return_window";
  releaseDays: string;
  // 4. Expiração
  expiryMode: "never" | "days" | "end_of_year";
  expiryDays: string;
  // 5. Limite
  limitPerMember: string;
  limitPerPeriod: string;
  // 6. Cancelamento
  cancelPolicy: "keep" | "reverse" | "partial";
  // 7. Prioridade
  priority: "stack" | "first" | "highest";
};

const EMPTY_FORM: RuleForm = {
  name: "",
  trigger: "compra",
  eligTier: "todos",
  eligSegment: "todos",
  eligMinValue: "",
  eligCategory: "",
  eligChannel: "todos",
  pointsType: "fixed",
  pointsValue: "",
  releaseMode: "immediate",
  releaseDays: "7",
  expiryMode: "days",
  expiryDays: "365",
  limitPerMember: "",
  limitPerPeriod: "",
  cancelPolicy: "reverse",
  priority: "stack",
};

const DIMENSIONS = [
  { id: "eligibility",   num: 1, label: "Elegibilidade",        desc: "Quem e o quê se qualifica para ganhar pontos" },
  { id: "points",        num: 2, label: "Pontuação",            desc: "Quanto o membro ganha por transação elegível" },
  { id: "release",       num: 3, label: "Liberação",            desc: "Quando os pontos ficam disponíveis para resgate" },
  { id: "expiry",        num: 4, label: "Expiração",            desc: "Quando os pontos vencem se não forem usados" },
  { id: "limit",         num: 5, label: "Limite",               desc: "Teto de pontos por membro ou período" },
  { id: "cancellation",  num: 6, label: "Cancelamento",         desc: "O que acontece se a compra for cancelada" },
  { id: "priority",      num: 7, label: "Prioridade / Conflito",desc: "Qual regra prevalece quando duas se aplicam" },
];

// ── Preview ───────────────────────────────────────────────────────────

function Preview({ form }: { form: RuleForm }) {
  const sampleValue = 100;
  let earned = 0;
  if (form.pointsType === "fixed") {
    earned = Number(form.pointsValue) || 0;
  } else if (form.pointsType === "percent") {
    earned = Math.round(sampleValue * (Number(form.pointsValue) || 0) / 100);
  } else {
    earned = sampleValue * (Number(form.pointsValue) || 1);
  }

  const releaseText =
    form.releaseMode === "immediate" ? "imediatamente" :
    form.releaseMode === "after_days" ? `após ${form.releaseDays} dias` :
    "após janela de troca/devolução";

  const expiryText =
    form.expiryMode === "never" ? "nunca expiram" :
    form.expiryMode === "days" ? `expiram em ${form.expiryDays} dias` :
    "expiram no fim do ano";

  return (
    <Card className="border-emerald-200 bg-emerald-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Eye className="size-4 text-emerald-600" />
          <CardTitle className="text-sm text-emerald-800">Prévia da regra</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-emerald-900">
        {form.name && (
          <p><strong>{form.name}</strong></p>
        )}
        {earned > 0 ? (
          <p>
            Se um membro{form.eligTier !== "todos" ? ` ${form.eligTier}` : ""} fizer{" "}
            uma compra de <strong>R$ {sampleValue.toFixed(2)}</strong>
            {form.eligMinValue ? ` (mínimo R$ ${form.eligMinValue})` : ""}
            {form.eligCategory ? ` em ${form.eligCategory}` : ""},
            ele ganha <strong>{earned.toLocaleString("pt-BR")} pontos</strong>.
          </p>
        ) : (
          <p className="text-emerald-600 italic">Preencha os campos de pontuação para ver a prévia.</p>
        )}
        {earned > 0 && (
          <ul className="text-xs space-y-1 text-emerald-700 list-disc list-inside">
            <li>Pontos disponíveis {releaseText}</li>
            <li>Pontos {expiryText}</li>
            {form.limitPerMember && <li>Limite de {form.limitPerMember} pts por membro</li>}
            <li>
              Conflito: {
                form.priority === "stack" ? "acumula com outras regras" :
                form.priority === "first" ? "a primeira regra aplicada vence" :
                "a regra de maior valor vence"
              }
            </li>
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────

type Step = "templates" | "form";

export default function CampanhasNova() {
  const [step, setStep] = useState<Step>("templates");
  const [form, setForm] = useState<RuleForm>(EMPTY_FORM);
  const [openDimension, setOpenDimension] = useState<string>("eligibility");

  const set = (key: keyof RuleForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const applyTemplate = (t: Template) => {
    setForm({
      ...EMPTY_FORM,
      name: t.name,
      trigger: t.trigger,
      pointsValue: t.defaultPoints.replace("×", ""),
      pointsType: t.defaultPoints.includes("×") ? "multiplier" : "fixed",
    });
    setStep("form");
  };

  // ── Step 1: Template gallery ──────────────────────────────────────
  if (step === "templates") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/campanhas"><ArrowLeft className="size-4 mr-1.5" />Campanhas</Link>
          </Button>
          <div>
            <h2 className="text-lg font-semibold">Nova campanha</h2>
            <p className="text-sm text-muted-foreground">Escolha um modelo ou comece do zero.</p>
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
                  {t.popular && (
                    <Badge variant="secondary" className="text-[10px]">Popular</Badge>
                  )}
                </div>
                <div className="font-semibold mb-1">{t.name}</div>
                <div className="text-xs opacity-80 leading-relaxed">{t.description}</div>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium opacity-70">
                  Usar modelo <ChevronRight className="size-3" />
                </div>
              </button>
            );
          })}

          {/* Blank start */}
          <button
            onClick={() => setStep("form")}
            className="rounded-2xl border-2 border-dashed border-border p-5 text-left hover:border-primary/40 hover:bg-muted/20 transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted mb-3">
              <Sparkles className="size-4 text-muted-foreground" />
            </div>
            <div className="font-semibold mb-1 text-muted-foreground">Começar do zero</div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              Crie uma regra personalizada definindo cada uma das 7 dimensões.
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ── Step 2: Rule form (7 dimensões) ──────────────────────────────
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setStep("templates")}>
          <ArrowLeft className="size-4 mr-1.5" />Modelos
        </Button>
        <div>
          <h2 className="text-lg font-semibold">Construtor de regra</h2>
          <p className="text-sm text-muted-foreground">Defina as 7 dimensões da campanha.</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {/* Campaign name */}
          <Card>
            <CardContent className="pt-5">
              <label className="block text-xs text-muted-foreground mb-1">Nome da campanha</label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="ex: Pontos em dobro — junho"
              />
            </CardContent>
          </Card>

          {/* 7 dimensions accordion */}
          {DIMENSIONS.map((dim) => {
            const isOpen = openDimension === dim.id;
            return (
              <Card key={dim.id} className={isOpen ? "ring-1 ring-primary/30" : ""}>
                <button
                  className="flex w-full items-center gap-3 px-5 py-4 text-left"
                  onClick={() => setOpenDimension(isOpen ? "" : dim.id)}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isOpen ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {dim.num}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{dim.label}</div>
                    {!isOpen && <div className="text-xs text-muted-foreground">{dim.desc}</div>}
                  </div>
                  <ChevronRight className={`size-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                </button>

                {isOpen && (
                  <CardContent className="pt-0 pb-5 space-y-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">{dim.desc}</p>

                    {dim.id === "eligibility" && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Tier elegível</label>
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
                          <Input value={form.eligMinValue} onChange={(e) => set("eligMinValue", e.target.value)} placeholder="ex: 50" type="number" />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Categoria de produto</label>
                          <Input value={form.eligCategory} onChange={(e) => set("eligCategory", e.target.value)} placeholder="ex: Eletrônicos" />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Canal</label>
                          <Select value={form.eligChannel} onValueChange={(v) => set("eligChannel", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["todos", "Fast Shop PRO", "App Mobile", "API Externa"].map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {dim.id === "points" && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Tipo de pontuação</label>
                          <Select value={form.pointsType} onValueChange={(v) => set("pointsType", v as RuleForm["pointsType"])}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">Fixo (X pontos por transação)</SelectItem>
                              <SelectItem value="percent">Percentual (X% do valor em pontos)</SelectItem>
                              <SelectItem value="multiplier">Multiplicador (X× a regra base)</SelectItem>
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
                          <label className="block text-xs text-muted-foreground mb-1">Quando liberar</label>
                          <Select value={form.releaseMode} onValueChange={(v) => set("releaseMode", v as RuleForm["releaseMode"])}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Imediatamente</SelectItem>
                              <SelectItem value="after_days">Após N dias</SelectItem>
                              <SelectItem value="after_return_window">Após janela de troca/devolução</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {form.releaseMode === "after_days" && (
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">Dias para liberar</label>
                            <Input value={form.releaseDays} onChange={(e) => set("releaseDays", e.target.value)} type="number" />
                          </div>
                        )}
                      </div>
                    )}

                    {dim.id === "expiry" && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Política de expiração</label>
                          <Select value={form.expiryMode} onValueChange={(v) => set("expiryMode", v as RuleForm["expiryMode"])}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="never">Não expiram</SelectItem>
                              <SelectItem value="days">Após N dias sem movimento</SelectItem>
                              <SelectItem value="end_of_year">Fim do ano calendário</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {form.expiryMode === "days" && (
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">Dias</label>
                            <Input value={form.expiryDays} onChange={(e) => set("expiryDays", e.target.value)} type="number" />
                          </div>
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
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Se a compra for cancelada</label>
                        <Select value={form.cancelPolicy} onValueChange={(v) => set("cancelPolicy", v as RuleForm["cancelPolicy"])}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="reverse">Estornar todos os pontos</SelectItem>
                            <SelectItem value="keep">Manter os pontos</SelectItem>
                            <SelectItem value="partial">Estorno proporcional ao valor cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {dim.id === "priority" && (
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Quando duas regras se aplicam</label>
                        <Select value={form.priority} onValueChange={(v) => set("priority", v as RuleForm["priority"])}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="stack">Acumular (aplica todas)</SelectItem>
                            <SelectItem value="first">A primeira regra cadastrada vence</SelectItem>
                            <SelectItem value="highest">A regra de maior valor vence</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}

          <div className="flex gap-3 pt-2">
            <Button className="flex-1">Publicar campanha</Button>
            <Button variant="outline">Salvar rascunho</Button>
          </div>
        </div>

        {/* Preview sidebar */}
        <div className="space-y-4">
          <Preview form={form} />
          <Card className="p-4 text-xs text-muted-foreground space-y-1">
            <div className="font-semibold text-foreground mb-2">7 dimensões</div>
            {DIMENSIONS.map((d) => (
              <div key={d.id} className={`flex items-center gap-1.5 ${openDimension === d.id ? "text-primary font-medium" : ""}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${openDimension === d.id ? "bg-primary" : "bg-muted-foreground/40"}`} />
                {d.num}. {d.label}
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
