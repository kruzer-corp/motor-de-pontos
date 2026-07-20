import { useState } from "react";
import {
  Badge, Button, Card, Input, Label, PageHeader,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Switch, Tabs, TabsContent, TabsList, TabsTrigger, toast,
} from "@kruzer/ds";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { getMoedas } from "../config/moedas";

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Tier = {
  id: string; nome: string; cor: string;
  limiarMin: string; limiarMax: string; multiplicador: string;
  beneficios: string[];
};

type TierProduto = {
  id: string; nome: string; cor: string; taxa: string; bonus: string; descricao: string;
};

type CriterioOp = "gte" | "lte" | "eq" | "in";
type Criterio = { campo: string; operador: CriterioOp; valor: string };
type Segmento = { id: string; nome: string; descricao: string; ativo: boolean; criterios: Criterio[] };

type SegmentoProduto = { id: string; nome: string; cor: string; taxa: string; bonus: string };

const OP_LABEL: Record<CriterioOp, string> = { gte: "≥", lte: "≤", eq: "=", in: "em" };
const CAMPOS_CRITERIO = [
  { value: "tier", label: "Tier" },
  { value: "dias_no_programa", label: "Dias no programa" },
  { value: "compras_90d", label: "Compras (90d)" },
  { value: "dias_sem_compra", label: "Dias sem compra" },
];

function novoId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

// ── Modal: Tier (Membros) ──────────────────────────────────────────────────────

function TierModal({ initial, onSave, onClose }: { initial?: Tier; onSave: (t: Tier) => void; onClose: () => void }) {
  const [d, setD] = useState<Omit<Tier, "id">>(initial ?? { nome: "", cor: "#6366f1", limiarMin: "", limiarMax: "", multiplicador: "1", beneficios: [] });
  const upd = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{initial ? "Editar tier" : "Novo tier"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Nome <span className="text-destructive">*</span></Label>
          <Input value={d.nome} onChange={(e) => upd("nome", e.target.value)} placeholder="Ex: Ouro" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Cor</Label>
          <div className="flex items-center gap-2 rounded-md border border-input px-3 py-2">
            <input type="color" value={d.cor} onChange={(e) => upd("cor", e.target.value)} className="h-6 w-6 rounded cursor-pointer border-0 bg-transparent p-0" />
            <span className="flex-1 text-sm text-muted-foreground">{d.cor}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm">Limiar mínimo <span className="text-destructive">*</span></Label>
            <Input type="number" value={d.limiarMin} onChange={(e) => upd("limiarMin", e.target.value)} placeholder="Ex: 0" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Limiar máximo</Label>
            <Input type="number" value={d.limiarMax} onChange={(e) => upd("limiarMax", e.target.value)} placeholder="Sem limite" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Multiplicador</Label>
          <Input type="number" step="0.1" value={d.multiplicador} onChange={(e) => upd("multiplicador", e.target.value)} placeholder="Ex: 1.5" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Benefícios</Label>
          <div className="space-y-1.5">
            {d.beneficios.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={b} onChange={(e) => upd("beneficios", d.beneficios.map((x, xi) => xi === i ? e.target.value : x))} placeholder="Ex: Frete grátis" />
                <button onClick={() => upd("beneficios", d.beneficios.filter((_, xi) => xi !== i))} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="size-3.5" /></button>
              </div>
            ))}
          </div>
          <button onClick={() => upd("beneficios", [...d.beneficios, ""])} className="text-xs text-primary hover:underline">+ adicionar benefício</button>
        </div>

        <Button className="w-full" disabled={!d.nome || !d.limiarMin} onClick={() => onSave({ ...d, id: initial?.id ?? novoId("TIER") })}>
          Salvar tier
        </Button>
      </div>
    </div>
  );
}

// ── Modal: Tier de Produto ─────────────────────────────────────────────────────

function TierProdutoModal({ initial, onSave, onClose }: { initial?: TierProduto; onSave: (t: TierProduto) => void; onClose: () => void }) {
  const [d, setD] = useState<Omit<TierProduto, "id">>(initial ?? { nome: "", cor: "#6366f1", taxa: "", bonus: "", descricao: "" });
  const upd = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{initial ? "Editar tier de produto" : "Novo tier de produto"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Nome <span className="text-destructive">*</span></Label>
          <Input value={d.nome} onChange={(e) => upd("nome", e.target.value)} placeholder="Ex: Especial" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Cor</Label>
          <div className="flex items-center gap-2 rounded-md border border-input px-3 py-2">
            <input type="color" value={d.cor} onChange={(e) => upd("cor", e.target.value)} className="h-6 w-6 rounded cursor-pointer border-0 bg-transparent p-0" />
            <span className="flex-1 text-sm text-muted-foreground">{d.cor}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm">Taxa base <span className="text-destructive">*</span></Label>
            <Input type="number" value={d.taxa} onChange={(e) => upd("taxa", e.target.value)} placeholder="Ex: 5" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Bônus (%)</Label>
            <Input type="number" value={d.bonus} onChange={(e) => upd("bonus", e.target.value)} placeholder="Opcional" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Descrição</Label>
          <Input value={d.descricao} onChange={(e) => upd("descricao", e.target.value)} placeholder="Ex: Produtos estratégicos com incentivo máximo." />
        </div>
        <Button className="w-full" disabled={!d.nome || !d.taxa} onClick={() => onSave({ ...d, id: initial?.id ?? novoId("TPROD") })}>
          Salvar tier de produto
        </Button>
      </div>
    </div>
  );
}

// ── Modal: Segmento (Membros) ──────────────────────────────────────────────────

function SegmentoModal({ initial, onSave, onClose }: { initial?: Segmento; onSave: (s: Segmento) => void; onClose: () => void }) {
  const [d, setD] = useState<Omit<Segmento, "id">>(initial ?? { nome: "", descricao: "", ativo: true, criterios: [] });
  const upd = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((p) => ({ ...p, [k]: v }));

  function updCriterio(i: number, patch: Partial<Criterio>) {
    upd("criterios", d.criterios.map((c, ci) => ci === i ? { ...c, ...patch } : c));
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{initial ? "Editar segmento" : "Novo segmento"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Nome <span className="text-destructive">*</span></Label>
          <Input value={d.nome} onChange={(e) => upd("nome", e.target.value)} placeholder="Ex: Em Risco" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Descrição</Label>
          <Input value={d.descricao} onChange={(e) => upd("descricao", e.target.value)} placeholder="Ex: Membros sem compra nos últimos 60 dias." />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm">Ativo</Label>
          <Switch checked={d.ativo} onCheckedChange={(v) => upd("ativo", v)} size="sm" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Critérios</Label>
          <div className="space-y-2">
            {d.criterios.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <Select value={c.campo} onValueChange={(v) => updCriterio(i, { campo: v })}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Campo" /></SelectTrigger>
                  <SelectContent>
                    {CAMPOS_CRITERIO.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={c.operador} onValueChange={(v) => updCriterio(i, { operador: v as CriterioOp })}>
                  <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(OP_LABEL) as CriterioOp[]).map((op) => <SelectItem key={op} value={op}>{OP_LABEL[op]}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input className="flex-1" value={c.valor} onChange={(e) => updCriterio(i, { valor: e.target.value })} placeholder="Valor" />
                <button onClick={() => upd("criterios", d.criterios.filter((_, ci) => ci !== i))} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="size-3.5" /></button>
              </div>
            ))}
          </div>
          <button onClick={() => upd("criterios", [...d.criterios, { campo: CAMPOS_CRITERIO[0].value, operador: "gte", valor: "" }])} className="text-xs text-primary hover:underline">
            + adicionar critério
          </button>
        </div>
        <Button className="w-full" disabled={!d.nome} onClick={() => onSave({ ...d, id: initial?.id ?? novoId("SEG") })}>
          Salvar segmento
        </Button>
      </div>
    </div>
  );
}

// ── Modal: Segmentação de Produto ───────────────────────────────────────────────

function SegmentoProdutoModal({ initial, onSave, onClose }: { initial?: SegmentoProduto; onSave: (s: SegmentoProduto) => void; onClose: () => void }) {
  const [d, setD] = useState<Omit<SegmentoProduto, "id">>(initial ?? { nome: "", cor: "#6366f1", taxa: "", bonus: "" });
  const upd = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{initial ? "Editar segmentação" : "Nova segmentação"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Nome <span className="text-destructive">*</span></Label>
          <Input value={d.nome} onChange={(e) => upd("nome", e.target.value)} placeholder="Ex: Eletrônicos" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Cor</Label>
          <div className="flex items-center gap-2 rounded-md border border-input px-3 py-2">
            <input type="color" value={d.cor} onChange={(e) => upd("cor", e.target.value)} className="h-6 w-6 rounded cursor-pointer border-0 bg-transparent p-0" />
            <span className="flex-1 text-sm text-muted-foreground">{d.cor}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm">Taxa <span className="text-destructive">*</span></Label>
            <Input type="number" value={d.taxa} onChange={(e) => upd("taxa", e.target.value)} placeholder="Ex: 3" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Bônus (%)</Label>
            <Input type="number" value={d.bonus} onChange={(e) => upd("bonus", e.target.value)} placeholder="Opcional" />
          </div>
        </div>
        <Button className="w-full" disabled={!d.nome || !d.taxa} onClick={() => onSave({ ...d, id: initial?.id ?? novoId("SEGP") })}>
          Salvar segmentação
        </Button>
      </div>
    </div>
  );
}

// ── Empty state genérico ────────────────────────────────────────────────────────

function AddCard({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full rounded-lg border border-dashed border-border py-6 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors">
      {label}
    </button>
  );
}

// ── Página ──────────────────────────────────────────────────────────────────────

export default function MembrosTier() {
  const moedaAtiva = getMoedas().find((m) => m.ativo) ?? getMoedas()[0];

  const [tiers, setTiers] = useState<Tier[]>([]);
  const [tierModal, setTierModal] = useState<Tier | null | "new">(null);

  const [tiersProduto, setTiersProduto] = useState<TierProduto[]>([]);
  const [tierProdutoModal, setTierProdutoModal] = useState<TierProduto | null | "new">(null);

  const [segmentos, setSegmentos] = useState<Segmento[]>([]);
  const [segmentoModal, setSegmentoModal] = useState<Segmento | null | "new">(null);

  const [segmentosProduto, setSegmentosProduto] = useState<SegmentoProduto[]>([]);
  const [segmentoProdutoModal, setSegmentoProdutoModal] = useState<SegmentoProduto | null | "new">(null);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tier e Segmentação"
        path={[{ label: "Configuração" }]}
        description="Defina os níveis e grupos do zero — usados em elegibilidade de campanha."
      />

      <Tabs defaultValue="tiers">
        <TabsList>
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
          <TabsTrigger value="segmentacoes">Segmentações</TabsTrigger>
        </TabsList>

        {/* ── ABA: TIERS ── */}
        <TabsContent value="tiers" className="mt-5 space-y-8">

          {/* Tiers · Membros */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Membros</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Níveis de progressão com base no saldo acumulado, em {moedaAtiva.nome.toLowerCase()}.</p>
              </div>
              <Button size="sm" onClick={() => setTierModal("new")}><Plus className="size-3.5 mr-1.5" />Novo tier</Button>
            </div>
            {tiers.length === 0 ? (
              <AddCard label="Nenhum tier cadastrado — clique para adicionar" onClick={() => setTierModal("new")} />
            ) : (
              <div className="space-y-2">
                {tiers.map((tier) => (
                  <Card key={tier.id} className="overflow-hidden">
                    <div className="flex items-center gap-4 px-5 py-4">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: tier.cor }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{tier.nome}</div>
                        <div className="text-xs text-muted-foreground">
                          {Number(tier.limiarMin).toLocaleString("pt-BR")} {moedaAtiva.simbolo}
                          {tier.limiarMax ? ` → ${Number(tier.limiarMax).toLocaleString("pt-BR")} ${moedaAtiva.simbolo}` : " em diante"}
                          {" · "}multiplicador {tier.multiplicador}×
                          {tier.beneficios.length > 0 ? ` · ${tier.beneficios.length} benefício(s)` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => setTierModal(tier)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="size-3.5" /></button>
                        <button onClick={() => { setTiers((p) => p.filter((t) => t.id !== tier.id)); toast.success(`${tier.nome} removido`); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border" />

          {/* Tiers · Produtos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Produtos</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Níveis de incentivo que definem taxa base e bônus por categoria de produto.</p>
              </div>
              <Button size="sm" onClick={() => setTierProdutoModal("new")}><Plus className="size-3.5 mr-1.5" />Novo tier de produto</Button>
            </div>
            {tiersProduto.length === 0 ? (
              <AddCard label="Nenhum tier de produto cadastrado — clique para adicionar" onClick={() => setTierProdutoModal("new")} />
            ) : (
              <div className="space-y-2">
                {tiersProduto.map((tier) => (
                  <Card key={tier.id} className="overflow-hidden">
                    <div className="flex items-center gap-4 px-5 py-4">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: tier.cor }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{tier.nome}</p>
                        {tier.descricao && <p className="text-xs text-muted-foreground mt-0.5">{tier.descricao}</p>}
                      </div>
                      <div className="flex items-center gap-6 shrink-0 text-sm">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Taxa base</p>
                          <p className="font-semibold tabular-nums">{tier.taxa} / R$1</p>
                        </div>
                        {tier.bonus && (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Bônus</p>
                            <p className="font-semibold text-emerald-600 tabular-nums">+{tier.bonus}%</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => setTierProdutoModal(tier)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="size-3.5" /></button>
                        <button onClick={() => { setTiersProduto((p) => p.filter((t) => t.id !== tier.id)); toast.success(`${tier.nome} removido`); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
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
              <Button size="sm" onClick={() => setSegmentoModal("new")}><Plus className="size-3.5 mr-1.5" />Novo segmento</Button>
            </div>
            {segmentos.length === 0 ? (
              <AddCard label="Nenhum segmento cadastrado — clique para adicionar" onClick={() => setSegmentoModal("new")} />
            ) : (
              segmentos.map((seg) => (
                <Card key={seg.id} className={!seg.ativo ? "opacity-60" : ""}>
                  <div className="flex items-start justify-between gap-4 px-5 py-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{seg.nome}</Badge>
                        {!seg.ativo && <span className="text-xs text-muted-foreground">Inativo</span>}
                      </div>
                      {seg.descricao && <p className="text-sm text-muted-foreground">{seg.descricao}</p>}
                      {seg.criterios.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {seg.criterios.map((c, i) => (
                            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
                              <span className="text-muted-foreground">{CAMPOS_CRITERIO.find((f) => f.value === c.campo)?.label ?? c.campo}</span>
                              <span className="font-semibold">{OP_LABEL[c.operador]}</span>
                              <span>{c.valor}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 pt-0.5">
                      <button onClick={() => setSegmentoModal(seg)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="size-3.5" /></button>
                      <Switch checked={seg.ativo} onCheckedChange={(v) => setSegmentos((p) => p.map((s) => s.id === seg.id ? { ...s, ativo: v } : s))} size="sm" />
                      <button onClick={() => { setSegmentos((p) => p.filter((s) => s.id !== seg.id)); toast.success(`${seg.nome} removido`); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="border-t border-border" />

          {/* Segmentações · Produtos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Produtos</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Grupos de produtos reutilizáveis entre campanhas.</p>
              </div>
              <Button size="sm" onClick={() => setSegmentoProdutoModal("new")}><Plus className="size-3.5 mr-1.5" />Nova segmentação</Button>
            </div>
            {segmentosProduto.length === 0 ? (
              <AddCard label="Nenhuma segmentação cadastrada — clique para adicionar" onClick={() => setSegmentoProdutoModal("new")} />
            ) : (
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/20 border-b border-border">
                    <tr className="text-left text-muted-foreground">
                      {["Segmentação", "Taxa", "Bônus", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {segmentosProduto.map((sp) => (
                      <tr key={sp.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: sp.cor }} />
                            <span className="font-medium">{sp.nome}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 tabular-nums">{sp.taxa} / R$1</td>
                        <td className="px-4 py-3.5 tabular-nums text-emerald-600">{sp.bonus ? `+${sp.bonus}%` : <span className="text-muted-foreground">—</span>}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => setSegmentoProdutoModal(sp)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="size-3.5" /></button>
                            <button onClick={() => { setSegmentosProduto((p) => p.filter((s) => s.id !== sp.id)); toast.success(`${sp.nome} removida`); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </TabsContent>
      </Tabs>

      {tierModal !== null && (
        <TierModal
          initial={tierModal === "new" ? undefined : tierModal}
          onClose={() => setTierModal(null)}
          onSave={(t) => {
            setTiers((p) => tierModal === "new" ? [...p, t] : p.map((x) => x.id === t.id ? t : x));
            setTierModal(null);
          }}
        />
      )}

      {tierProdutoModal !== null && (
        <TierProdutoModal
          initial={tierProdutoModal === "new" ? undefined : tierProdutoModal}
          onClose={() => setTierProdutoModal(null)}
          onSave={(t) => {
            setTiersProduto((p) => tierProdutoModal === "new" ? [...p, t] : p.map((x) => x.id === t.id ? t : x));
            setTierProdutoModal(null);
          }}
        />
      )}

      {segmentoModal !== null && (
        <SegmentoModal
          initial={segmentoModal === "new" ? undefined : segmentoModal}
          onClose={() => setSegmentoModal(null)}
          onSave={(s) => {
            setSegmentos((p) => segmentoModal === "new" ? [...p, s] : p.map((x) => x.id === s.id ? s : x));
            setSegmentoModal(null);
          }}
        />
      )}

      {segmentoProdutoModal !== null && (
        <SegmentoProdutoModal
          initial={segmentoProdutoModal === "new" ? undefined : segmentoProdutoModal}
          onClose={() => setSegmentoProdutoModal(null)}
          onSave={(s) => {
            setSegmentosProduto((p) => segmentoProdutoModal === "new" ? [...p, s] : p.map((x) => x.id === s.id ? s : x));
            setSegmentoProdutoModal(null);
          }}
        />
      )}
    </div>
  );
}
