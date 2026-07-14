import { useState } from "react";
import { Badge, Button, Card, CardContent, PageHeader, Pill, Switch, Tabs, TabsContent, TabsList, TabsTrigger, toast } from "@kruzer/ds";
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { MOEDA } from "../config/programa";

const MOEDAS_OPCOES = ["Pontos", "Cashback", "Milhas", "Créditos"] as const;
type MoedaOpcao = typeof MOEDAS_OPCOES[number];

const MOEDA_ABREV: Record<MoedaOpcao, string> = {
  Pontos:   "pts",
  Cashback: "R$",
  Milhas:   "mi",
  Créditos: "cr",
};

type CriteriaOp = "gte" | "lte" | "eq" | "in";
type Criterion  = { field: string; label: string; op: CriteriaOp; value: string };
type Segment    = { id: string; name: string; description: string; active: boolean; members: number; criteria: Criterion[]; color: string };
type Tier       = { id: string; name: string; color: string; dotColor: string; minUnidade: number; maxUnidade: number | null; multiplier: number; benefits: string[]; members: number };

// ── Dados ─────────────────────────────────────────────────────────────────────

const TIERS_MEMBRO: Tier[] = [
  { id: "diamante", name: "Diamante", color: "bg-violet-50 border-violet-200", dotColor: "bg-violet-500", minUnidade: 50000, maxUnidade: null,  multiplier: 3,   members: 228,  benefits: ["Multiplicador 3× em todas as compras", "Acesso prioritário ao catálogo de resgate", "Suporte dedicado", "Frete grátis ilimitado", "Acesso antecipado a campanhas"] },
  { id: "ouro",     name: "Ouro",     color: "bg-amber-50  border-amber-200",  dotColor: "bg-amber-400",  minUnidade: 20000, maxUnidade: 49999, multiplier: 2,   members: 352,  benefits: ["Multiplicador 2× em todas as compras", "Frete grátis em compras acima de R$ 150", "Acesso ao catálogo premium", "Suporte prioritário"] },
  { id: "prata",    name: "Prata",    color: "bg-slate-50  border-slate-200",  dotColor: "bg-slate-400",  minUnidade: 5000,  maxUnidade: 19999, multiplier: 1.5, members: 649,  benefits: ["Multiplicador 1,5× em compras elegíveis", "Frete grátis em compras acima de R$ 250", "Acesso a ofertas exclusivas"] },
  { id: "bronze",   name: "Bronze",   color: "bg-orange-50 border-orange-200", dotColor: "bg-orange-400", minUnidade: 0,     maxUnidade: 4999,  multiplier: 1,   members: 1261, benefits: ["Acúmulo base da campanha ativa", "Acesso ao catálogo padrão de resgate"] },
];

const TIERS_PRODUTO = [
  { tier: "Especial", color: "bg-violet-50 border-violet-200", dot: "bg-violet-500", taxa: "15", bonus: "5",  descricao: "Produtos estratégicos com incentivo máximo." },
  { tier: "Ouro",     color: "bg-amber-50  border-amber-200",  dot: "bg-amber-400",  taxa: "10", bonus: "3",  descricao: "Produtos de alto valor com bom incentivo." },
  { tier: "Prata",    color: "bg-slate-50  border-slate-200",  dot: "bg-slate-400",  taxa: "5",  bonus: "2",  descricao: "Produtos com incentivo moderado." },
  { tier: "Bronze",   color: "bg-orange-50 border-orange-200", dot: "bg-orange-400", taxa: "1",  bonus: null, descricao: "Produtos com incentivo base." },
];

const SEGMENTS_MEMBRO: Segment[] = [
  { id: "SEG-001", name: "Premium",            color: "bg-violet-100 text-violet-700",   active: true,  members: 312, description: "Membros de alto valor com histórico de compras frequentes.",    criteria: [{ field: "tier", label: "Tier", op: "in", value: "Diamante, Ouro" }, { field: "orders_last_90d", label: "Compras (90d)", op: "gte", value: "3" }] },
  { id: "SEG-002", name: "Fidelidade",          color: "bg-sky-100 text-sky-700",         active: true,  members: 641, description: "Membros ativos com mais de 6 meses no programa.",              criteria: [{ field: "days_in_program", label: "Dias no programa", op: "gte", value: "180" }] },
  { id: "SEG-003", name: "Frete Grátis",        color: "bg-emerald-100 text-emerald-700", active: true,  members: 428, description: "Membros elegíveis para benefício de frete grátis por segmento.", criteria: [{ field: "tier", label: "Tier", op: "in", value: "Ouro, Prata" }] },
  { id: "SEG-004", name: "Em Risco",            color: "bg-red-100 text-red-700",         active: true,  members: 187, description: "Membros que não compraram nos últimos 60 dias.",                criteria: [{ field: "days_since_last_order", label: "Dias sem compra", op: "gte", value: "60" }] },
  { id: "SEG-005", name: "Básico",              color: "bg-slate-100 text-slate-700",     active: true,  members: 872, description: "Membros recentes ou com baixa atividade.",                      criteria: [{ field: "tier", label: "Tier", op: "in", value: "Bronze" }] },
  { id: "SEG-006", name: "Novos (últimos 30d)", color: "bg-amber-100 text-amber-700",     active: false, members: 43,  description: "Membros cadastrados nos últimos 30 dias.",                      criteria: [{ field: "days_in_program", label: "Dias no programa", op: "lte", value: "30" }] },
];

const SEGMENTS_PRODUTO = [
  { id: "CL-001", nome: "Eletrônicos",      cor: "#6366f1", taxa: "3", bonus: "20", campanhas: 2 },
  { id: "CL-002", nome: "Eletrodomésticos", cor: "#f59e0b", taxa: "2", bonus: "10", campanhas: 1 },
  { id: "CL-003", nome: "Beleza",           cor: "#ec4899", taxa: "1", bonus: "5",  campanhas: 0 },
  { id: "CL-004", nome: "Esportes",         cor: "#10b981", taxa: "2", bonus: "15", campanhas: 1 },
];

const OP_LABEL: Record<CriteriaOp, string> = { gte: "≥", lte: "≤", eq: "=", in: "em" };

// ── Componente ────────────────────────────────────────────────────────────────

export default function MembrosTier() {
  const [expanded, setExpanded] = useState<string | null>("diamante");
  const [moedaRef, setMoedaRef] = useState<MoedaOpcao>(MOEDA.nome as MoedaOpcao ?? "Pontos");
  const [segments, setSegments] = useState(SEGMENTS_MEMBRO);

  const toggleSeg = (id: string) =>
    setSegments(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));

  const total = TIERS_MEMBRO.reduce((a, t) => a + t.members, 0);
  const abrev = MOEDA_ABREV[moedaRef] ?? moedaRef.toLowerCase().slice(0, 3);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tier e Segmentação"
        path={[{ label: "Configuração" }]}
        description="Configure níveis e grupos para membros e produtos — usados em campanhas e no catálogo."
      />

      <Tabs defaultValue="tiers">
        <TabsList>
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
          <TabsTrigger value="segmentacoes">Segmentações</TabsTrigger>
        </TabsList>

        {/* ── ABA: TIERS ── */}
        <TabsContent value="tiers" className="mt-5 space-y-8">

          {/* Tiers · Membros */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Membros</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Níveis de progressão com base no saldo acumulado.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Moeda:</span>
                  <div className="flex gap-1">
                    {MOEDAS_OPCOES.map(m => (
                      <button key={m} type="button" onClick={() => setMoedaRef(m)}
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                          moedaRef === m
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        }`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Pencil className="size-3.5 mr-1.5" />Editar limiares
                </Button>
              </div>
            </div>

            <Card className="p-4">
              <div className="text-xs text-muted-foreground mb-2">Distribuição atual — {total.toLocaleString("pt-BR")} membros</div>
              <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
                {TIERS_MEMBRO.map(t => (
                  <div key={t.id} className={t.dotColor} style={{ width: `${(t.members / total) * 100}%` }} title={`${t.name}: ${t.members}`} />
                ))}
              </div>
              <div className="flex flex-wrap gap-4 mt-3">
                {TIERS_MEMBRO.map(t => (
                  <div key={t.id} className="flex items-center gap-1.5 text-xs">
                    <span className={`h-2 w-2 rounded-full ${t.dotColor}`} />
                    <span>{t.name}</span>
                    <span className="text-muted-foreground">{Math.round((t.members / total) * 100)}%</span>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-2">
              {TIERS_MEMBRO.map(tier => {
                const isOpen = expanded === tier.id;
                return (
                  <Card key={tier.id} className={`overflow-hidden border ${tier.color}`}>
                    <button
                      className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-black/5 transition-colors"
                      onClick={() => setExpanded(isOpen ? null : tier.id)}
                    >
                      <span className={`h-3 w-3 rounded-full shrink-0 ${tier.dotColor}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{tier.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {tier.minUnidade.toLocaleString("pt-BR")} {abrev}
                          {tier.maxUnidade ? ` → ${tier.maxUnidade.toLocaleString("pt-BR")} ${abrev}` : " em diante"}
                          {" · "}multiplicador {tier.multiplier}×
                        </div>
                      </div>
                      <Badge variant="secondary">{tier.members.toLocaleString("pt-BR")} membros</Badge>
                      {isOpen
                        ? <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                        : <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                      }
                    </button>
                    {isOpen && (
                      <CardContent className="border-t border-border/50 pt-4 pb-5 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="rounded-xl bg-background/60 p-3 text-center">
                            <div className="text-xs text-muted-foreground">Limiar mínimo</div>
                            <div className="text-xl font-bold mt-0.5">{tier.minUnidade.toLocaleString("pt-BR")}</div>
                            <div className="text-xs text-muted-foreground">{moedaRef.toLowerCase()}</div>
                          </div>
                          <div className="rounded-xl bg-background/60 p-3 text-center">
                            <div className="text-xs text-muted-foreground">Limiar máximo</div>
                            <div className="text-xl font-bold mt-0.5">{tier.maxUnidade ? tier.maxUnidade.toLocaleString("pt-BR") : "∞"}</div>
                            <div className="text-xs text-muted-foreground">{moedaRef.toLowerCase()}</div>
                          </div>
                          <div className="rounded-xl bg-background/60 p-3 text-center">
                            <div className="text-xs text-muted-foreground">Multiplicador</div>
                            <div className="text-xl font-bold mt-0.5">{tier.multiplier}×</div>
                            <div className="text-xs text-muted-foreground">sobre a base</div>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Benefícios</div>
                          <ul className="space-y-1.5">
                            {tier.benefits.map(b => (
                              <li key={b} className="flex items-start gap-2 text-sm">
                                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${tier.dotColor}`} />
                                {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Tiers · Produtos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Produtos</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Níveis de incentivo que definem a taxa base e bônus por categoria de produto.</p>
              </div>
              <Button variant="outline" size="sm">
                <Pencil className="size-3.5 mr-1.5" />Editar taxas
              </Button>
            </div>
            <div className="space-y-2">
              {TIERS_PRODUTO.map(({ tier, color, dot, taxa, bonus, descricao }) => (
                <Card key={tier} className={`overflow-hidden border ${color}`}>
                  <div className="flex items-center gap-4 px-5 py-4">
                    <span className={`h-3 w-3 rounded-full shrink-0 ${dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{tier}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{descricao}</p>
                    </div>
                    <div className="flex items-center gap-6 shrink-0 text-sm">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Taxa base</p>
                        <p className="font-semibold tabular-nums">{taxa} / R$1</p>
                      </div>
                      {bonus && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Bônus</p>
                          <p className="font-semibold text-emerald-600 tabular-nums">+{bonus}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Cada campanha pode sobrescrever a taxa e bônus individualmente no wizard.
            </p>
          </div>

        </TabsContent>

        {/* ── ABA: SEGMENTAÇÕES ── */}
        <TabsContent value="segmentacoes" className="mt-5 space-y-8">

          {/* Segmentações · Membros */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Membros</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Grupos de membros definidos por critérios — usados em campanhas e comunicações.</p>
              </div>
              <Button size="sm"><Plus className="size-3.5 mr-1.5" />Novo segmento</Button>
            </div>
            {segments.map(seg => (
              <Card key={seg.id} className={!seg.active ? "opacity-60" : ""}>
                <div className="flex items-start justify-between gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${seg.color}`}>{seg.name}</span>
                      <Badge variant="secondary">{seg.members.toLocaleString("pt-BR")} membros</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{seg.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {seg.criteria.map((c, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
                          <span className="text-muted-foreground">{c.label}</span>
                          <span className="font-semibold">{OP_LABEL[c.op]}</span>
                          <span>{c.value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    <Button variant="ghost" size="sm"><Pencil className="size-3.5" /></Button>
                    <Switch checked={seg.active} onCheckedChange={() => toggleSeg(seg.id)} size="sm" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="border-t border-border" />

          {/* Segmentações · Produtos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Produtos</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Grupos de produtos reutilizáveis entre campanhas.</p>
              </div>
              <Button size="sm"><Plus className="size-3.5 mr-1.5" />Nova segmentação</Button>
            </div>
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/20 border-b border-border">
                  <tr className="text-left text-muted-foreground">
                    {["Segmentação", "Taxa base", "Bônus", "Campanhas usando", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-xs font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {SEGMENTS_PRODUTO.map(cl => (
                    <tr key={cl.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cl.cor }} />
                          <span className="font-medium">{cl.nome}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 tabular-nums">{cl.taxa} / R$1</td>
                      <td className="px-4 py-3.5 tabular-nums text-emerald-600">+{cl.bonus}%</td>
                      <td className="px-4 py-3.5">
                        {cl.campanhas > 0
                          ? <Pill color="muted" variant="soft" size="sm">{cl.campanhas} campanha{cl.campanhas > 1 ? "s" : ""}</Pill>
                          : <span className="text-xs text-muted-foreground">Nenhuma</span>
                        }
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 justify-end">
                          <Button variant="ghost" size="sm"><Pencil className="size-3.5" /></Button>
                          {cl.campanhas === 0 && (
                            <button
                              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                              onClick={() => toast.success(`${cl.nome} removida`)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </TabsContent>
      </Tabs>
    </div>
  );
}
