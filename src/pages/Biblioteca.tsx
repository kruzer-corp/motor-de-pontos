import { useState } from "react";
import {
  Badge, Button, Card, EmptyState, Input, Label, PageHeader,
  Tabs, TabsContent, TabsList, TabsTrigger, toast,
} from "@kruzer/ds";
import { Package, Pencil, Plus, Tag, Trash2, Users, Award, Layers, X } from "lucide-react";
import {
  type ConjuntoProdutos, getConjuntosProdutos, saveConjuntosProdutos, novoIdConjuntoProdutos,
} from "../lib/conjuntosProdutos";
import {
  type ClasseProduto, type FonteClasse, getClassesProduto, saveClassesProduto, novoIdClasseProduto,
} from "../lib/classesProduto";
import {
  type PapelMembro, getPapeisMembro, savePapeisMembro, novoIdPapelMembro,
} from "../lib/papeisMembro";
import {
  type TierProduto, getTiersProduto, saveTiersProduto, novoIdTierProduto,
} from "../lib/tiersProduto";
import {
  type SegmentoMembro, getSegmentosMembro, saveSegmentosMembro, novoIdSegmentoMembro,
} from "../lib/segmentosMembro";
import { getProdutos } from "../lib/produtos";
import { SecaoMembros, SecaoProdutos } from "../components/CadastroBase";

// ── Modal: Conjunto de produtos ──────────────────────────────────────────────

function ConjuntoModal({ initial, onSave, onClose }: { initial?: ConjuntoProdutos; onSave: (c: ConjuntoProdutos) => void; onClose: () => void }) {
  const produtos = getProdutos().filter((p) => p.status === "ativo");
  const [d, setD] = useState<Omit<ConjuntoProdutos, "id">>(initial ?? { nome: "", descricao: "", produtosIds: [] });
  const upd = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((p) => ({ ...p, [k]: v }));

  function toggleProduto(id: string) {
    upd("produtosIds", d.produtosIds.includes(id) ? d.produtosIds.filter((x) => x !== id) : [...d.produtosIds, id]);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{initial ? "Editar conjunto" : "Novo conjunto de produtos"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Nome <span className="text-destructive">*</span></Label>
          <Input value={d.nome} onChange={(e) => upd("nome", e.target.value)} placeholder="Ex: Linha Premium" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Descrição</Label>
          <Input value={d.descricao} onChange={(e) => upd("descricao", e.target.value)} placeholder="Ex: Produtos de ticket alto, foco de campanhas." />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Produtos</Label>
          <div className="rounded-md border border-input overflow-hidden max-h-56 overflow-y-auto">
            {produtos.map((p) => {
              const sel = d.produtosIds.includes(p.id);
              return (
                <label key={p.id} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/40 border-b border-border last:border-0">
                  <input type="checkbox" className="accent-primary h-4 w-4 shrink-0" checked={sel} onChange={() => toggleProduto(p.id)} />
                  <span className="text-sm flex-1 truncate">{p.nome}</span>
                  <span className="text-xs text-muted-foreground font-mono">{p.sku}</span>
                </label>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">{d.produtosIds.length} produto(s) selecionado(s)</p>
        </div>
        <Button className="w-full" disabled={!d.nome} onClick={() => onSave({ ...d, id: initial?.id ?? novoIdConjuntoProdutos() })}>
          Salvar conjunto
        </Button>
      </div>
    </div>
  );
}

// ── Modal: Classe de produto ─────────────────────────────────────────────────

function ClasseModal({ initial, onSave, onClose }: { initial?: ClasseProduto; onSave: (c: ClasseProduto) => void; onClose: () => void }) {
  const [d, setD] = useState<Omit<ClasseProduto, "id">>(initial ?? { nome: "", fonte: "interno", codigoExterno: "" });
  const upd = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{initial ? "Editar classe" : "Nova classe de produto"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Nome <span className="text-destructive">*</span></Label>
          <Input value={d.nome} onChange={(e) => upd("nome", e.target.value)} placeholder="Ex: Eletrônicos" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Origem</Label>
          <div className="grid grid-cols-2 gap-2">
            {([["interno", "Interno"], ["pim", "PIM"]] as const).map(([v, label]) => (
              <label key={v} className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 cursor-pointer transition-colors ${
                d.fonte === v ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
              }`}>
                <input type="radio" name="fonte" value={v} checked={d.fonte === v} onChange={() => upd("fonte", v as FonteClasse)} className="sr-only" />
                <span className="text-sm font-semibold">{label}</span>
              </label>
            ))}
          </div>
        </div>
        {d.fonte === "pim" && (
          <div className="space-y-1.5">
            <Label className="text-sm">Código no PIM</Label>
            <Input value={d.codigoExterno} onChange={(e) => upd("codigoExterno", e.target.value)} placeholder="Ex: CAT-2201" />
          </div>
        )}
        <Button className="w-full" disabled={!d.nome} onClick={() => onSave({ ...d, id: initial?.id ?? novoIdClasseProduto() })}>
          Salvar classe
        </Button>
      </div>
    </div>
  );
}

// ── Modal: Papel de membro ───────────────────────────────────────────────────

function PapelModal({ initial, onSave, onClose }: { initial?: PapelMembro; onSave: (p: PapelMembro) => void; onClose: () => void }) {
  const [d, setD] = useState<Omit<PapelMembro, "id">>(initial ?? { nome: "", descricao: "" });
  const upd = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{initial ? "Editar papel" : "Novo papel de membro"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Nome <span className="text-destructive">*</span></Label>
          <Input value={d.nome} onChange={(e) => upd("nome", e.target.value)} placeholder="Ex: Arquiteto" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Descrição</Label>
          <Input value={d.descricao} onChange={(e) => upd("descricao", e.target.value)} placeholder="Ex: Profissional parceiro que indica vendas." />
        </div>
        <Button className="w-full" disabled={!d.nome} onClick={() => onSave({ ...d, id: initial?.id ?? novoIdPapelMembro() })}>
          Salvar papel
        </Button>
      </div>
    </div>
  );
}

// ── Modal: Segmento de membro ─────────────────────────────────────────────────

function SegmentoModal({ initial, onSave, onClose }: { initial?: SegmentoMembro; onSave: (s: SegmentoMembro) => void; onClose: () => void }) {
  const [d, setD] = useState<Omit<SegmentoMembro, "id">>(initial ?? { nome: "", descricao: "" });
  const upd = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{initial ? "Editar segmento" : "Novo segmento de membro"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Nome <span className="text-destructive">*</span></Label>
          <Input value={d.nome} onChange={(e) => upd("nome", e.target.value)} placeholder="Ex: Premium" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Descrição</Label>
          <Input value={d.descricao} onChange={(e) => upd("descricao", e.target.value)} placeholder="Ex: Membros de alto valor, histórico de compras frequentes." />
        </div>
        <Button className="w-full" disabled={!d.nome} onClick={() => onSave({ ...d, id: initial?.id ?? novoIdSegmentoMembro() })}>
          Salvar segmento
        </Button>
      </div>
    </div>
  );
}

// ── Modal: Tier de produto ───────────────────────────────────────────────────

function TierProdutoModal({ initial, onSave, onClose }: { initial?: TierProduto; onSave: (t: TierProduto) => void; onClose: () => void }) {
  const [d, setD] = useState<Omit<TierProduto, "id">>(initial ?? { nome: "", cor: "#6366f1", descricao: "", limiarMin: 0, limiarMax: null });
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
            <Label className="text-sm">Preço de <span className="text-destructive">*</span></Label>
            <Input type="number" min={0} value={d.limiarMin} onChange={(e) => upd("limiarMin", Number(e.target.value) || 0)} placeholder="Ex: 0" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Até</Label>
            <Input type="number" min={0} value={d.limiarMax ?? ""} onChange={(e) => upd("limiarMax", e.target.value ? Number(e.target.value) : null)} placeholder="Sem teto" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">Todo produto com preço nessa faixa entra automaticamente neste tier — não precisa escolher na mão.</p>
        <div className="space-y-1.5">
          <Label className="text-sm">Descrição</Label>
          <Input value={d.descricao} onChange={(e) => upd("descricao", e.target.value)} placeholder="Ex: Produtos de ticket alto, foco de campanhas." />
        </div>
        <Button className="w-full" disabled={!d.nome} onClick={() => onSave({ ...d, id: initial?.id ?? novoIdTierProduto() })}>
          Salvar tier de produto
        </Button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Biblioteca() {
  const [conjuntos, setConjuntos] = useState<ConjuntoProdutos[]>(() => getConjuntosProdutos());
  const [conjuntoModal, setConjuntoModal] = useState<ConjuntoProdutos | null | "new">(null);

  const [classes, setClasses] = useState<ClasseProduto[]>(() => getClassesProduto());
  const [classeModal, setClasseModal] = useState<ClasseProduto | null | "new">(null);

  const [papeis, setPapeis] = useState<PapelMembro[]>(() => getPapeisMembro());
  const [papelModal, setPapelModal] = useState<PapelMembro | null | "new">(null);

  const [tiersProduto, setTiersProduto] = useState<TierProduto[]>(() => getTiersProduto());
  const [tierProdutoModal, setTierProdutoModal] = useState<TierProduto | null | "new">(null);

  const [segmentosMembro, setSegmentosMembro] = useState<SegmentoMembro[]>(() => getSegmentosMembro());
  const [segmentoModal, setSegmentoModal] = useState<SegmentoMembro | null | "new">(null);

  function persistirConjuntos(next: ConjuntoProdutos[]) { setConjuntos(next); saveConjuntosProdutos(next); }
  function persistirClasses(next: ClasseProduto[]) { setClasses(next); saveClassesProduto(next); }
  function persistirPapeis(next: PapelMembro[]) { setPapeis(next); savePapeisMembro(next); }
  function persistirTiersProduto(next: TierProduto[]) { setTiersProduto(next); saveTiersProduto(next); }
  function persistirSegmentosMembro(next: SegmentoMembro[]) { setSegmentosMembro(next); saveSegmentosMembro(next); }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Cadastro de produtos e membros"
        path={[{ label: "Configuração" }]}
        description="Ponto único de entrada de qualquer elemento do programa — produtos, membros, conjuntos, classes, tiers, papéis e segmentos."
      />

      <Tabs defaultValue="produtos">
        <TabsList>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="membros">Membros</TabsTrigger>
        </TabsList>

        {/* ── ABA: Produtos (+ sub-itens) ── */}
        <TabsContent value="produtos" className="mt-5">
          <Tabs defaultValue="cadastro">
            <TabsList>
              <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
              <TabsTrigger value="conjuntos">Conjuntos de produtos</TabsTrigger>
              <TabsTrigger value="classes">Classes de produto</TabsTrigger>
              <TabsTrigger value="tiers-produto">Tiers de produto</TabsTrigger>
            </TabsList>

            <TabsContent value="cadastro" className="mt-5 space-y-4">
              <SecaoProdutos />
            </TabsContent>

            <TabsContent value="conjuntos" className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold flex items-center gap-1.5"><Package className="size-3.5" />Conjuntos de produtos</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Listas de produtos escolhidos à mão, reutilizáveis em Gatilho e Elegibilidade — só faz sentido pra regras transacionais.</p>
                </div>
                <Button size="sm" onClick={() => setConjuntoModal("new")}><Plus className="size-3.5 mr-1.5" />Novo conjunto</Button>
              </div>
              {conjuntos.length === 0 ? (
                <EmptyState icon={Package} title="Nenhum conjunto cadastrado"
                  description="Agrupe produtos escolhidos à mão pra usar no Gatilho e na Elegibilidade das suas Regras."
                  action={{ label: "Novo conjunto", onClick: () => setConjuntoModal("new") }} />
              ) : (
                <div className="space-y-2">
                  {conjuntos.map((c) => (
                    <Card key={c.id} className="overflow-hidden">
                      <div className="flex items-center gap-4 px-5 py-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{c.nome}</p>
                          {c.descricao && <p className="text-xs text-muted-foreground mt-0.5">{c.descricao}</p>}
                          <p className="text-xs text-muted-foreground mt-1">{c.produtosIds.length} produto(s)</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => setConjuntoModal(c)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="size-3.5" /></button>
                          <button onClick={() => { persistirConjuntos(conjuntos.filter((x) => x.id !== c.id)); toast.success(`${c.nome} removido`); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="classes" className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold flex items-center gap-1.5"><Tag className="size-3.5" />Classes de produto</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Taxonomia dos produtos, mapeada de um PIM externo ou definida internamente.</p>
                </div>
                <Button size="sm" onClick={() => setClasseModal("new")}><Plus className="size-3.5 mr-1.5" />Nova classe</Button>
              </div>
              {classes.length === 0 ? (
                <EmptyState icon={Tag} title="Nenhuma classe cadastrada"
                  description="Mapeie a taxonomia dos seus produtos, vinda de um PIM externo ou definida internamente."
                  action={{ label: "Nova classe", onClick: () => setClasseModal("new") }} />
              ) : (
                <div className="space-y-2">
                  {classes.map((c) => (
                    <Card key={c.id} className="overflow-hidden">
                      <div className="flex items-center gap-4 px-5 py-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{c.nome}</p>
                            <Badge variant="secondary">{c.fonte === "pim" ? "PIM" : "Interno"}</Badge>
                          </div>
                          {c.fonte === "pim" && c.codigoExterno && <p className="text-xs text-muted-foreground mt-0.5 font-mono">{c.codigoExterno}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => setClasseModal(c)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="size-3.5" /></button>
                          <button onClick={() => { persistirClasses(classes.filter((x) => x.id !== c.id)); toast.success(`${c.nome} removida`); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="tiers-produto" className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold flex items-center gap-1.5"><Award className="size-3.5" />Tiers de produto</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Classificação de valor/qualidade do produto (ex: iPhone 17 = Ouro, iPhone 12 = Bronze) — usada no cadastro em Produtos incentivados e na Elegibilidade de uma Regra.</p>
                </div>
                <Button size="sm" onClick={() => setTierProdutoModal("new")}><Plus className="size-3.5 mr-1.5" />Novo tier de produto</Button>
              </div>
              {tiersProduto.length === 0 ? (
                <EmptyState icon={Award} title="Nenhum tier de produto cadastrado"
                  description="Classifique o valor/qualidade dos seus produtos (ex: Ouro, Bronze) pra usar no cadastro e na Elegibilidade das Regras."
                  action={{ label: "Novo tier de produto", onClick: () => setTierProdutoModal("new") }} />
              ) : (
                <div className="space-y-2">
                  {tiersProduto.map((tier) => (
                    <Card key={tier.id} className="overflow-hidden">
                      <div className="flex items-center gap-4 px-5 py-4">
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: tier.cor }} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{tier.nome}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            R$ {tier.limiarMin.toLocaleString("pt-BR")} {tier.limiarMax !== null ? `→ R$ ${tier.limiarMax.toLocaleString("pt-BR")}` : "em diante"}
                            {tier.descricao ? ` · ${tier.descricao}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => setTierProdutoModal(tier)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="size-3.5" /></button>
                          <button onClick={() => { persistirTiersProduto(tiersProduto.filter((x) => x.id !== tier.id)); toast.success(`${tier.nome} removido`); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ── ABA: Membros (+ sub-itens) ── */}
        <TabsContent value="membros" className="mt-5">
          <Tabs defaultValue="cadastro">
            <TabsList>
              <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
              <TabsTrigger value="papeis">Papéis de membro</TabsTrigger>
              <TabsTrigger value="segmentos">Segmentos de membro</TabsTrigger>
            </TabsList>

            <TabsContent value="cadastro" className="mt-5 space-y-4">
              <SecaoMembros />
            </TabsContent>

            <TabsContent value="papeis" className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold flex items-center gap-1.5"><Users className="size-3.5" />Papéis de membro</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Função do membro no programa (ex: Arquiteto) — independente de Tier e Segmento. Usado em Atribuição e Elegibilidade.</p>
                </div>
                <Button size="sm" onClick={() => setPapelModal("new")}><Plus className="size-3.5 mr-1.5" />Novo papel</Button>
              </div>
              {papeis.length === 0 ? (
                <EmptyState icon={Users} title="Nenhum papel cadastrado"
                  description="Defina funções do membro no programa (ex: Arquiteto) pra usar em Atribuição e Elegibilidade."
                  action={{ label: "Novo papel", onClick: () => setPapelModal("new") }} />
              ) : (
                <div className="space-y-2">
                  {papeis.map((p) => (
                    <Card key={p.id} className="overflow-hidden">
                      <div className="flex items-center gap-4 px-5 py-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{p.nome}</p>
                          {p.descricao && <p className="text-xs text-muted-foreground mt-0.5">{p.descricao}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => setPapelModal(p)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="size-3.5" /></button>
                          <button onClick={() => { persistirPapeis(papeis.filter((x) => x.id !== p.id)); toast.success(`${p.nome} removido`); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="segmentos" className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold flex items-center gap-1.5"><Layers className="size-3.5" />Segmentos de membro</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Categoria comercial do membro (ex: Premium, Fidelidade) — usada no cadastro e na Elegibilidade de uma Regra.</p>
                </div>
                <Button size="sm" onClick={() => setSegmentoModal("new")}><Plus className="size-3.5 mr-1.5" />Novo segmento</Button>
              </div>
              {segmentosMembro.length === 0 ? (
                <EmptyState icon={Layers} title="Nenhum segmento cadastrado"
                  description="Defina os segmentos comerciais do programa (ex: Premium, Fidelidade) pra usar no cadastro de membro e na Elegibilidade."
                  action={{ label: "Novo segmento", onClick: () => setSegmentoModal("new") }} />
              ) : (
                <div className="space-y-2">
                  {segmentosMembro.map((s) => (
                    <Card key={s.id} className="overflow-hidden">
                      <div className="flex items-center gap-4 px-5 py-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{s.nome}</p>
                          {s.descricao && <p className="text-xs text-muted-foreground mt-0.5">{s.descricao}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => setSegmentoModal(s)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="size-3.5" /></button>
                          <button onClick={() => { persistirSegmentosMembro(segmentosMembro.filter((x) => x.id !== s.id)); toast.success(`${s.nome} removido`); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {conjuntoModal !== null && (
        <ConjuntoModal
          initial={conjuntoModal === "new" ? undefined : conjuntoModal}
          onClose={() => setConjuntoModal(null)}
          onSave={(c) => {
            persistirConjuntos(conjuntoModal === "new" ? [...conjuntos, c] : conjuntos.map((x) => (x.id === c.id ? c : x)));
            setConjuntoModal(null);
          }}
        />
      )}
      {classeModal !== null && (
        <ClasseModal
          initial={classeModal === "new" ? undefined : classeModal}
          onClose={() => setClasseModal(null)}
          onSave={(c) => {
            persistirClasses(classeModal === "new" ? [...classes, c] : classes.map((x) => (x.id === c.id ? c : x)));
            setClasseModal(null);
          }}
        />
      )}
      {papelModal !== null && (
        <PapelModal
          initial={papelModal === "new" ? undefined : papelModal}
          onClose={() => setPapelModal(null)}
          onSave={(p) => {
            persistirPapeis(papelModal === "new" ? [...papeis, p] : papeis.map((x) => (x.id === p.id ? p : x)));
            setPapelModal(null);
          }}
        />
      )}
      {tierProdutoModal !== null && (
        <TierProdutoModal
          initial={tierProdutoModal === "new" ? undefined : tierProdutoModal}
          onClose={() => setTierProdutoModal(null)}
          onSave={(t) => {
            persistirTiersProduto(tierProdutoModal === "new" ? [...tiersProduto, t] : tiersProduto.map((x) => (x.id === t.id ? t : x)));
            setTierProdutoModal(null);
          }}
        />
      )}
      {segmentoModal !== null && (
        <SegmentoModal
          initial={segmentoModal === "new" ? undefined : segmentoModal}
          onClose={() => setSegmentoModal(null)}
          onSave={(s) => {
            persistirSegmentosMembro(segmentoModal === "new" ? [...segmentosMembro, s] : segmentosMembro.map((x) => (x.id === s.id ? s : x)));
            setSegmentoModal(null);
          }}
        />
      )}
    </div>
  );
}
