import { useState } from "react";
import { Card, Button, Badge, Input, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Switch, Tabs, TabsList, TabsTrigger, TabsContent, toast } from "@kruzer/ds";
import { ShoppingCart, Package, Search, CheckCheck, Eye, EyeOff, Plus, X, CheckCircle2, Shield } from "lucide-react";
import { MOEDA } from "../config/programa";

// ── Tipos e dados de regras de resgate ────────────────────────────────────────

type Tier = "Bronze" | "Prata" | "Ouro" | "Diamante";

type RegraResgate = {
  id: string; nome: string; descricao: string;
  tiersElegiveis: Tier[]; segmento: string;
  saldoMinimo: string;
  limitePorMembro: string; limiteEscopo: "mes" | "campanha" | "ilimitado";
  vigenciaInicio: string; vigenciaFim: string;
  produtosVinculados: string[];
  ativa: boolean;
};

const TIERS_OPCOES: Tier[] = ["Bronze", "Prata", "Ouro", "Diamante"];

const TIER_COLOR: Record<Tier, string> = {
  Bronze: "bg-orange-100 text-orange-700",
  Prata:  "bg-slate-100 text-slate-700",
  Ouro:   "bg-amber-100 text-amber-700",
  Diamante: "bg-violet-100 text-violet-700",
};

const REGRAS_INICIAIS: RegraResgate[] = [
  {
    id: "RR-001", nome: "Acesso Diamante",
    descricao: "Recompensas premium — exclusivo para membros Diamante.",
    tiersElegiveis: ["Diamante"], segmento: "todos",
    saldoMinimo: "5000", limitePorMembro: "1", limiteEscopo: "mes",
    vigenciaInicio: "", vigenciaFim: "",
    produtosVinculados: ["P001", "P002"], ativa: true,
  },
  {
    id: "RR-002", nome: "Vouchers para todos",
    descricao: "Vouchers de desconto disponíveis para qualquer tier.",
    tiersElegiveis: ["Bronze", "Prata", "Ouro", "Diamante"], segmento: "todos",
    saldoMinimo: "0", limitePorMembro: "3", limiteEscopo: "mes",
    vigenciaInicio: "", vigenciaFim: "",
    produtosVinculados: ["P003", "P004"], ativa: true,
  },
];

const WIZARD_STEPS = [
  { num: 1, label: "Identificação" },
  { num: 2, label: "Elegibilidade" },
  { num: 3, label: "Limites" },
  { num: 4, label: "Produtos" },
  { num: 5, label: "Revisão" },
];

type WizardForm = {
  nome: string; descricao: string;
  tiersElegiveis: Tier[]; segmento: string; saldoMinimo: string;
  limitePorMembro: string; limiteEscopo: "mes" | "campanha" | "ilimitado";
  vigenciaInicio: string; vigenciaFim: string;
  produtosVinculados: string[];
};

const WIZARD_DEFAULTS: WizardForm = {
  nome: "", descricao: "",
  tiersElegiveis: ["Bronze", "Prata", "Ouro", "Diamante"], segmento: "todos",
  saldoMinimo: "0",
  limitePorMembro: "", limiteEscopo: "mes",
  vigenciaInicio: "", vigenciaFim: "",
  produtosVinculados: [],
};

type CatalogProduct = {
  id: string;
  name: string;
  category: string;
  points: number;
  stock: number;
  popular: boolean;
  visivelNoPortal: boolean;
};

const PRODUCTS: CatalogProduct[] = [
  { id: "P001", name: 'Smart TV 50"',    category: "Eletrônicos",   points: 45000, stock: 12, popular: true,  visivelNoPortal: true  },
  { id: "P002", name: "Notebook Pro 14\"", category: "Eletrônicos", points: 85000, stock: 5,  popular: false, visivelNoPortal: false },
  { id: "P003", name: "Fone Bluetooth",  category: "Eletrônicos",   points: 8500,  stock: 48, popular: true,  visivelNoPortal: true  },
  { id: "P004", name: "Air Fryer XL",    category: "Casa & Cozinha", points: 18000, stock: 30, popular: true, visivelNoPortal: true  },
  { id: "P006", name: "Liquidificador Pro", category: "Casa & Cozinha", points: 9500, stock: 15, popular: false, visivelNoPortal: false },
  { id: "P007", name: "Tênis Runner",    category: "Moda",          points: 22000, stock: 8,  popular: false, visivelNoPortal: true  },
  { id: "P008", name: "Bolsa Sport",     category: "Moda",          points: 14000, stock: 3,  popular: false, visivelNoPortal: false },
];

type CheckoutState = { product: CatalogProduct; member: string } | null;

const MEMBERS = ["Aline P. (MBR-00312) — 5.200 pts", "Bruno C. (MBR-00210) — 3.200 pts", "Cecília M. (MBR-00445) — 1.800 pts"];

export default function ResgateCatalogo() {
  const [products, setProducts]   = useState<CatalogProduct[]>(PRODUCTS);
  const [regras, setRegras]       = useState<RegraResgate[]>(REGRAS_INICIAIS);
  const [query, setQuery]         = useState("");
  const [category, setCategory]   = useState("Todos");
  const [checkout, setCheckout]   = useState<CheckoutState>(null);
  const [confirmed, setConfirmed] = useState<string[]>([]);
  const [selectedMember, setSelectedMember] = useState("");

  // Wizard nova regra
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardForm, setWizardForm] = useState<WizardForm>(WIZARD_DEFAULTS);

  const wset = (k: keyof WizardForm, v: WizardForm[keyof WizardForm]) =>
    setWizardForm(p => ({ ...p, [k]: v }));

  function toggleTier(t: Tier) {
    const atual = wizardForm.tiersElegiveis;
    wset("tiersElegiveis", atual.includes(t) ? atual.filter(x => x !== t) : [...atual, t]);
  }

  function toggleProduto(id: string) {
    const atual = wizardForm.produtosVinculados;
    wset("produtosVinculados", atual.includes(id) ? atual.filter(x => x !== id) : [...atual, id]);
  }

  function salvarRegra() {
    const nova: RegraResgate = {
      id: `RR-${String(regras.length + 1).padStart(3, "0")}`,
      ...wizardForm, ativa: true,
    };
    setRegras(p => [...p, nova]);
    setWizardOpen(false);
    setWizardStep(1);
    setWizardForm(WIZARD_DEFAULTS);
    toast.success(`Regra "${nova.nome}" criada com sucesso`);
  }

  function canAdvance() {
    if (wizardStep === 1) return !!wizardForm.nome;
    if (wizardStep === 2) return wizardForm.tiersElegiveis.length > 0;
    return true;
  }

  function togglePortal(id: string) {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const novo = !p.visivelNoPortal;
      toast.success(novo ? `"${p.name}" visível no portal do membro` : `"${p.name}" ocultado do portal do membro`);
      return { ...p, visivelNoPortal: novo };
    }));
  }

  const categories = ["Todos", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter(
    (p) =>
      (category === "Todos" || p.category === category) &&
      (!query || p.name.toLowerCase().includes(query.toLowerCase()))
  );

  const handleConfirm = () => {
    if (!checkout) return;
    setConfirmed((prev) => [...prev, checkout.product.id]);
    setCheckout(null);
    setSelectedMember("");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <ShoppingCart className="size-5 text-muted-foreground" />
        <div>
          <h2 className="text-lg font-semibold">Catálogo de Resgate</h2>
          <p className="text-sm text-muted-foreground">Produtos e regras de elegibilidade para resgate.</p>
        </div>
      </div>

      <Tabs defaultValue="produtos">
        <TabsList>
          <TabsTrigger value="produtos">
            Produtos
            <span className="ml-1.5 text-[10px] text-muted-foreground">({products.filter(p => p.visivelNoPortal).length} visíveis)</span>
          </TabsTrigger>
          <TabsTrigger value="regras">
            Regras de resgate
            <Badge variant="secondary" className="ml-1.5 text-[10px]">{regras.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* ── Tab Produtos ── */}
        <TabsContent value="produtos" className="mt-4 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input className="pl-9 w-52" placeholder="Buscar produto..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="flex gap-1 flex-wrap">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    category === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}>{cat}</button>
              ))}
            </div>
          </div>

          {checkout && (
            <Card className="border-primary/30 bg-primary/5 p-5">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="text-sm font-semibold mb-1">Resgatando: {checkout.product.name}</div>
                  <div className="text-xs text-muted-foreground mb-3">Custo: {checkout.product.points.toLocaleString("pt-BR")} {MOEDA.abrev}</div>
                  <label className="block text-xs text-muted-foreground mb-1">Membro</label>
                  <Select value={selectedMember} onValueChange={setSelectedMember}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Selecione o membro…" /></SelectTrigger>
                    <SelectContent>{MEMBERS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" onClick={handleConfirm} disabled={!selectedMember}><CheckCheck className="size-4 mr-1.5" />Confirmar resgate</Button>
                  <Button variant="outline" size="sm" onClick={() => setCheckout(null)}>Cancelar</Button>
                </div>
              </div>
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => {
              const isConfirmed = confirmed.includes(product.id);
              const regrasDoP = regras.filter(r => r.produtosVinculados.includes(product.id) && r.ativa);
              return (
                <Card key={product.id} className="overflow-hidden">
                  <div className="flex h-32 items-center justify-center bg-muted/20">
                    <Package className="size-10 text-muted-foreground/30" />
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      {product.popular && <Badge variant="secondary" className="mb-1 text-xs">Popular</Badge>}
                      <div className="font-semibold leading-tight">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.category}</div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-xl font-bold tabular-nums text-primary">{product.points.toLocaleString("pt-BR")}</div>
                        <div className="text-xs text-muted-foreground">{MOEDA.abrev}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {product.stock === 0 ? <span className="text-red-500">Esgotado</span> : `${product.stock} em estoque`}
                      </div>
                    </div>
                    {/* Regras vinculadas */}
                    {regrasDoP.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {regrasDoP.map(r => (
                          <span key={r.id} className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-[10px] font-semibold px-2 py-0.5">
                            <Shield className="size-2.5" />{r.nome}
                          </span>
                        ))}
                      </div>
                    )}
                    {isConfirmed ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                        <CheckCheck className="size-4" />Resgate criado
                      </div>
                    ) : (
                      <Button size="sm" className="w-full" disabled={product.stock === 0} onClick={() => setCheckout({ product, member: "" })}>
                        <ShoppingCart className="size-3.5 mr-1.5" />Resgatar
                      </Button>
                    )}
                    <div className={`flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${product.visivelNoPortal ? "bg-primary/5 text-primary" : "bg-muted/40 text-muted-foreground"}`}>
                      <div className="flex items-center gap-1.5">
                        {product.visivelNoPortal ? <Eye className="size-3.5 shrink-0" /> : <EyeOff className="size-3.5 shrink-0" />}
                        Visível no portal
                      </div>
                      <Switch size="sm" checked={product.visivelNoPortal} onCheckedChange={() => togglePortal(product.id)} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Tab Regras de resgate ── */}
        <TabsContent value="regras" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Defina quem pode resgatar o quê — crie a regra e vincule os produtos.</p>
            <Button size="sm" onClick={() => { setWizardOpen(true); setWizardStep(1); setWizardForm(WIZARD_DEFAULTS); }}>
              <Plus className="size-3.5 mr-1.5" />Nova regra
            </Button>
          </div>

          {regras.map(r => {
            const prods = PRODUCTS.filter(p => r.produtosVinculados.includes(p.id));
            return (
              <div key={r.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-start justify-between gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm">{r.nome}</span>
                      <Badge variant={r.ativa ? "success" : "secondary"} className="text-[10px]">{r.ativa ? "Ativa" : "Inativa"}</Badge>
                    </div>
                    {r.descricao && <p className="text-xs text-muted-foreground">{r.descricao}</p>}
                    <div className="flex flex-wrap gap-2 text-[10px]">
                      <span className="rounded-full bg-muted px-2.5 py-1 font-medium">
                        Tiers: {r.tiersElegiveis.join(", ")}
                      </span>
                      {r.saldoMinimo !== "0" && (
                        <span className="rounded-full bg-muted px-2.5 py-1 font-medium">
                          Saldo mín.: {Number(r.saldoMinimo).toLocaleString("pt-BR")} {MOEDA.abrev}
                        </span>
                      )}
                      {r.limitePorMembro && (
                        <span className="rounded-full bg-muted px-2.5 py-1 font-medium">
                          Limite: {r.limitePorMembro}× por {r.limiteEscopo === "mes" ? "mês" : r.limiteEscopo === "campanha" ? "campanha" : "—"}
                        </span>
                      )}
                    </div>
                    {prods.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {prods.map(p => (
                          <span key={p.id} className="rounded-md bg-violet-50 border border-violet-200 text-violet-700 text-[10px] font-semibold px-2 py-0.5">{p.name}</span>
                        ))}
                      </div>
                    )}
                    {prods.length === 0 && (
                      <p className="text-[10px] text-amber-600">Nenhum produto vinculado ainda.</p>
                    )}
                  </div>
                  <Switch size="sm" checked={r.ativa} onCheckedChange={(v) => setRegras(prev => prev.map(x => x.id === r.id ? { ...x, ativa: v } : x))} />
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* ── Wizard nova regra ── */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6" onClick={() => setWizardOpen(false)}>
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div>
                <p className="text-sm font-bold">Nova regra de resgate</p>
                <p className="text-xs text-muted-foreground mt-0.5">Passo {wizardStep} de {WIZARD_STEPS.length}</p>
              </div>
              <button onClick={() => setWizardOpen(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            {/* Stepper */}
            <div className="flex gap-1 px-5 py-3 border-b border-border shrink-0">
              {WIZARD_STEPS.map(s => (
                <div key={s.num} className={`flex-1 h-1 rounded-full transition-colors ${s.num <= wizardStep ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <p className="text-sm font-semibold">{WIZARD_STEPS[wizardStep - 1].label}</p>

              {/* Step 1 — Identificação */}
              {wizardStep === 1 && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Nome da regra <span className="text-destructive">*</span></Label>
                    <Input value={wizardForm.nome} onChange={e => wset("nome", e.target.value)} placeholder="Ex: Resgate Diamante" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Descrição</Label>
                    <Input value={wizardForm.descricao} onChange={e => wset("descricao", e.target.value)} placeholder="Ex: Recompensas exclusivas para membros Diamante" />
                  </div>
                </div>
              )}

              {/* Step 2 — Elegibilidade */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Tiers elegíveis <span className="text-destructive">*</span></Label>
                    <div className="flex gap-2 flex-wrap">
                      {TIERS_OPCOES.map(t => (
                        <button key={t} onClick={() => toggleTier(t)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors border ${
                            wizardForm.tiersElegiveis.includes(t) ? `${TIER_COLOR[t]} border-current` : "border-border text-muted-foreground"
                          }`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Saldo mínimo exigido (além do custo)</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" value={wizardForm.saldoMinimo} onChange={e => wset("saldoMinimo", e.target.value)} className="w-28" min={0} />
                      <span className="text-sm text-muted-foreground">{MOEDA.abrev}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Saldo que o membro precisa TER além do custo do produto. 0 = sem exigência adicional.</p>
                  </div>
                </div>
              )}

              {/* Step 3 — Limites */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Limite de resgates por membro</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" value={wizardForm.limitePorMembro} onChange={e => wset("limitePorMembro", e.target.value)} placeholder="Sem limite" className="w-24" min={1} />
                      <Select value={wizardForm.limiteEscopo} onValueChange={v => wset("limiteEscopo", v)}>
                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mes">por mês</SelectItem>
                          <SelectItem value="campanha">por vigência</SelectItem>
                          <SelectItem value="ilimitado">ilimitado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Início da vigência</Label>
                      <Input type="date" value={wizardForm.vigenciaInicio} onChange={e => wset("vigenciaInicio", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Fim da vigência</Label>
                      <Input type="date" value={wizardForm.vigenciaFim} onChange={e => wset("vigenciaFim", e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4 — Produtos */}
              {wizardStep === 4 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Selecione os produtos do catálogo que seguem esta regra.</p>
                  <div className="rounded-md border border-input overflow-hidden">
                    {PRODUCTS.map(p => (
                      <label key={p.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 border-b border-border last:border-0">
                        <input type="checkbox" className="accent-primary h-4 w-4 shrink-0"
                          checked={wizardForm.produtosVinculados.includes(p.id)}
                          onChange={() => toggleProduto(p.id)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.category} · {p.points.toLocaleString("pt-BR")} {MOEDA.abrev}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {wizardForm.produtosVinculados.length > 0 && (
                    <p className="text-xs text-muted-foreground">{wizardForm.produtosVinculados.length} produto(s) selecionado(s)</p>
                  )}
                </div>
              )}

              {/* Step 5 — Revisão */}
              {wizardStep === 5 && (
                <div className="space-y-3">
                  {[
                    { label: "Nome", value: wizardForm.nome },
                    { label: "Tiers", value: wizardForm.tiersElegiveis.join(", ") },
                    { label: "Saldo mínimo", value: wizardForm.saldoMinimo === "0" ? "Sem exigência adicional" : `${wizardForm.saldoMinimo} ${MOEDA.abrev}` },
                    { label: "Limite", value: wizardForm.limitePorMembro ? `${wizardForm.limitePorMembro}× por ${wizardForm.limiteEscopo === "mes" ? "mês" : "vigência"}` : "Sem limite" },
                    { label: "Produtos", value: PRODUCTS.filter(p => wizardForm.produtosVinculados.includes(p.id)).map(p => p.name).join(", ") || "Nenhum" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-2.5 border-b border-border last:border-0 text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-right max-w-[60%]">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Footer */}
            <div className="flex gap-2 px-5 py-4 border-t border-border shrink-0">
              <Button variant="outline" className="flex-1"
                onClick={() => wizardStep > 1 ? setWizardStep(s => s - 1) : setWizardOpen(false)}>
                Voltar
              </Button>
              {wizardStep < 5 ? (
                <Button className="flex-1" disabled={!canAdvance()} onClick={() => setWizardStep(s => s + 1)}>
                  Continuar
                </Button>
              ) : (
                <Button className="flex-1" onClick={salvarRegra}>
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Criar regra
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
