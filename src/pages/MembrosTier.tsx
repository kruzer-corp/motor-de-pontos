import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Button, Card, Input, Label, PageHeader,
  Tabs, TabsContent, TabsList, TabsTrigger, toast,
} from "@kruzer/ds";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { MOEDA } from "../config/programa";
import { type TierMembro, getTiersMembro, saveTiersMembro, novoIdTierMembro } from "../lib/tiers";

// ── Tipos ─────────────────────────────────────────────────────────────────────

type TierMembroForm = {
  nome: string; cor: string;
  limiarMin: string; limiarMax: string; multiplicador: string;
  beneficios: string[];
};

type SegmentoProduto = { id: string; nome: string; cor: string; taxa: string; bonus: string };

function novoId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

// ── Modal: Tier (Membros) ──────────────────────────────────────────────────────

function TierModal({ initial, onSave, onClose }: { initial?: TierMembro; onSave: (t: TierMembro) => void; onClose: () => void }) {
  const [d, setD] = useState<TierMembroForm>(initial ? {
    nome: initial.nome, cor: initial.cor,
    limiarMin: String(initial.limiarMin),
    limiarMax: initial.limiarMax !== null ? String(initial.limiarMax) : "",
    multiplicador: String(initial.multiplicador),
    beneficios: initial.beneficios,
  } : { nome: "", cor: "#6366f1", limiarMin: "", limiarMax: "", multiplicador: "1", beneficios: [] });
  const upd = <K extends keyof TierMembroForm>(k: K, v: TierMembroForm[K]) => setD((p) => ({ ...p, [k]: v }));

  function salvar() {
    onSave({
      id: initial?.id ?? novoIdTierMembro(),
      nome: d.nome, cor: d.cor,
      limiarMin: Number(d.limiarMin) || 0,
      limiarMax: d.limiarMax ? Number(d.limiarMax) : null,
      multiplicador: Number(d.multiplicador) || 1,
      beneficios: d.beneficios,
    });
  }

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

        <Button className="w-full" disabled={!d.nome || !d.limiarMin} onClick={salvar}>
          Salvar tier
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
  const moedaAtiva = { nome: MOEDA.nome, simbolo: MOEDA.abrev };

  const [tiers, setTiers] = useState<TierMembro[]>(() => getTiersMembro());
  const [tierModal, setTierModal] = useState<TierMembro | null | "new">(null);

  function persistirTiers(next: TierMembro[]) {
    setTiers(next);
    saveTiersMembro(next);
  }

  const [segmentosProduto, setSegmentosProduto] = useState<SegmentoProduto[]>([]);
  const [segmentoProdutoModal, setSegmentoProdutoModal] = useState<SegmentoProduto | null | "new">(null);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tier e Segmentação"
        path={[{ label: "Configuração" }]}
        description="Tiers de membro já vêm com 4 níveis padrão (edite como quiser) — o resto você define do zero. Usados em elegibilidade de campanha."
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
                          {tier.limiarMin.toLocaleString("pt-BR")} {moedaAtiva.simbolo}
                          {tier.limiarMax !== null ? ` → ${tier.limiarMax.toLocaleString("pt-BR")} ${moedaAtiva.simbolo}` : " em diante"}
                          {" · "}multiplicador {tier.multiplicador}×
                          {tier.beneficios.length > 0 ? ` · ${tier.beneficios.length} benefício(s)` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => setTierModal(tier)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="size-3.5" /></button>
                        <button onClick={() => { persistirTiers(tiers.filter((t) => t.id !== tier.id)); toast.success(`${tier.nome} removido`); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
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

          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            Segmento de membro (Premium, Fidelidade etc.) agora é gerenciado na <Link to="/biblioteca" className="underline font-medium text-foreground">Biblioteca</Link> — junto dos outros recursos que a Regra consome.
          </div>

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
            persistirTiers(tierModal === "new" ? [...tiers, t] : tiers.map((x) => x.id === t.id ? t : x));
            setTierModal(null);
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
