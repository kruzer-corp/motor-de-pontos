import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Badge, Button, ConfirmDialog, FormDrawer, Input, Label, PageHeader,
  SearchInput, toast,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableEmpty,
} from "@kruzer/ds";
import { ArrowLeft, Layers, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { renderCrumbLink } from "../lib/crumbLink";

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Group = { id: string; name: string; description: string; productIds: string[]; active: boolean };

type ProdutoCatalogo = { id: string; sku: string; nome: string; origem: "1P" | "3P" };

// ── Mock data ─────────────────────────────────────────────────────────────────

const CATALOGO_PRODUTOS: ProdutoCatalogo[] = [
  { id: "1P-001", sku: "TV-50-4K",    nome: 'Smart TV 50"',      origem: "1P" },
  { id: "1P-002", sku: "AIRFRY-XL",   nome: "Air Fryer XL",      origem: "1P" },
  { id: "1P-003", sku: "FONE-BT-02",  nome: "Fone Bluetooth",    origem: "1P" },
  { id: "1P-004", sku: "KIT-SKIN-01", nome: "Kit Skincare",      origem: "1P" },
  { id: "3P-001", sku: "ML-TV-9921",  nome: 'Smart TV 55" 4K',   origem: "3P" },
  { id: "3P-002", sku: "AMZ-FONE-03", nome: "Fone ANC Pro",      origem: "3P" },
  { id: "3P-003", sku: "VTX-CREME-1", nome: "Creme Facial SPF",  origem: "3P" },
  { id: "3P-004", sku: "ML-TENIS-42", nome: "Tênis Running Pro", origem: "3P" },
];

const GROUPS: Group[] = [
  { id: "GRP-01", name: "Eletrônicos",       description: "Dispositivos eletrônicos e acessórios tecnológicos.", productIds: ["1P-001", "1P-003", "3P-001"], active: true  },
  { id: "GRP-02", name: "Casa & Cozinha",    description: "Eletrodomésticos e itens para o lar.",               productIds: ["1P-002", "3P-002", "3P-003"], active: true  },
  { id: "GRP-03", name: "Moda & Acessórios", description: "Vestuário, calçados e acessórios de moda.",          productIds: ["1P-004", "3P-004"],            active: true  },
  { id: "GRP-04", name: "Esporte & Lazer",   description: "Equipamentos esportivos e artigos de lazer.",        productIds: [],                              active: false },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function OrigemBadge({ origem }: { origem: "1P" | "3P" }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${
      origem === "1P" ? "bg-primary/10 text-primary" : "bg-violet-100 text-violet-700"
    }`}>{origem}</span>
  );
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function CatalogoGrupos() {
  const [groups, setGroups] = useState(GROUPS);

  // ── Drawer criar/editar ───────────────────────────────────────────────────
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [editandoId,  setEditandoId]  = useState<string | null>(null);
  const [fNome,       setFNome]       = useState("");
  const [fDescricao,  setFDescricao]  = useState("");

  function abrirNovo() {
    setEditandoId(null); setFNome(""); setFDescricao(""); setDrawerOpen(true);
  }

  function abrirEditar(g: Group) {
    setEditandoId(g.id); setFNome(g.name); setFDescricao(g.description); setDrawerOpen(true);
  }

  async function handleSave() {
    if (!fNome) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    if (editandoId) {
      setGroups(prev => prev.map(g => g.id === editandoId ? { ...g, name: fNome, description: fDescricao } : g));
      toast.success("Grupo atualizado");
    } else {
      const novo: Group = {
        id: `GRP-${String(groups.length + 1).padStart(2, "0")}`,
        name: fNome, description: fDescricao, productIds: [], active: true,
      };
      setGroups(prev => [novo, ...prev]);
      toast.success(`Grupo "${fNome}" criado`);
    }
    setSaving(false); setDrawerOpen(false);
  }

  // ── Drawer gerenciar produtos ─────────────────────────────────────────────
  const [prodDrawerOpen,  setProdDrawerOpen]  = useState(false);
  const [prodDrawerGroup, setProdDrawerGroup] = useState<Group | null>(null);
  const [prodSearch,      setProdSearch]      = useState("");
  const [selectedIds,     setSelectedIds]     = useState<Set<string>>(new Set());
  const [savingProds,     setSavingProds]     = useState(false);

  function abrirGerenciar(g: Group) {
    setProdDrawerGroup(g);
    setSelectedIds(new Set(g.productIds));
    setProdSearch("");
    setProdDrawerOpen(true);
  }

  function toggleProduto(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleSaveProds() {
    if (!prodDrawerGroup) return;
    setSavingProds(true);
    await new Promise(r => setTimeout(r, 400));
    const newIds = Array.from(selectedIds);
    setGroups(prev => prev.map(g => g.id === prodDrawerGroup.id ? { ...g, productIds: newIds } : g));
    toast.success(`${newIds.length} produto(s) em "${prodDrawerGroup.name}"`);
    setSavingProds(false); setProdDrawerOpen(false);
  }

  const filteredProdutos = useMemo(() =>
    CATALOGO_PRODUTOS.filter(p =>
      !prodSearch ||
      p.nome.toLowerCase().includes(prodSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(prodSearch.toLowerCase())
    ),
  [prodSearch]);

  // ── Confirmar exclusão ────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null);

  function handleDelete() {
    if (!deleteTarget) return;
    setGroups(prev => prev.filter(g => g.id !== deleteTarget.id));
    toast.success(`Grupo "${deleteTarget.name}" removido`);
    setDeleteTarget(null);
  }

  const toggleActive = (id: string) =>
    setGroups(prev => prev.map(g => g.id === id ? { ...g, active: !g.active } : g));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grupos de Produtos"
        path={[{ label: "Configuração" }, { label: "Catálogo", to: "/catalogo" }]}
        renderCrumbLink={renderCrumbLink}
        description={`${groups.length} grupos cadastrados`}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/catalogo">
                <ArrowLeft className="mr-1.5 h-4 w-4" />Catálogo
              </Link>
            </Button>
            <Button size="sm" onClick={abrirNovo}>
              <Plus className="mr-1.5 h-4 w-4" />Novo grupo
            </Button>
          </div>
        }
      />

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Grupo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Produtos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.length === 0 ? (
              <TableEmpty colSpan={5} icon={Layers} title="Nenhum grupo cadastrado" />
            ) : (
              groups.map(group => (
                <TableRow key={group.id} className="[&>td]:py-3.5">
                  <TableCell>
                    <div className="font-medium text-sm">{group.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{group.id}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">{group.description}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => abrirGerenciar(group)}
                      className="inline-flex items-center gap-1.5 hover:underline"
                    >
                      <Badge variant="secondary">{group.productIds.length}</Badge>
                    </button>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleActive(group.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors cursor-pointer ${
                        group.active
                          ? "bg-success/10 text-success hover:bg-success/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {group.active && <span className="h-1.5 w-1.5 rounded-full bg-success" />}
                      {group.active ? "Ativo" : "Inativo"}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" aria-label="Gerenciar produtos" onClick={() => abrirGerenciar(group)}>
                        <Package className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Editar grupo" onClick={() => abrirEditar(group)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Excluir grupo" onClick={() => setDeleteTarget(group)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── DRAWER: criar / editar grupo ── */}
      <FormDrawer
        open={drawerOpen}
        onOpenChange={v => { if (!v) setDrawerOpen(false); }}
        title={editandoId ? "Editar grupo" : "Novo grupo"}
        description="Defina o nome e a descrição. Produtos são associados após a criação."
        onSave={handleSave}
        saving={saving}
        saveLabel={editandoId ? "Salvar alterações" : "Criar grupo"}
        saveDisabled={!fNome}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome <span className="text-destructive">*</span></Label>
            <Input value={fNome} onChange={e => setFNome(e.target.value)} placeholder="Ex: Eletrônicos" />
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Input value={fDescricao} onChange={e => setFDescricao(e.target.value)} placeholder="Descreva o grupo de produtos" />
          </div>
        </div>
      </FormDrawer>

      {/* ── DRAWER: gerenciar produtos ── */}
      <FormDrawer
        open={prodDrawerOpen}
        onOpenChange={v => { if (!v) setProdDrawerOpen(false); }}
        title={`Produtos — ${prodDrawerGroup?.name ?? ""}`}
        description="Selecione os produtos que pertencem a este grupo. Um produto pode estar em mais de um grupo."
        onSave={handleSaveProds}
        saving={savingProds}
        saveLabel="Salvar seleção"
      >
        <div className="space-y-3">
          <SearchInput value={prodSearch} onChange={setProdSearch} placeholder="Buscar por nome ou SKU…" />

          <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
            {filteredProdutos.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum produto encontrado</p>
            ) : (
              filteredProdutos.map(p => (
                <label key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(p.id)}
                    onChange={() => toggleProduto(p.id)}
                    className="h-4 w-4 rounded accent-primary shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.nome}</p>
                    <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                  </div>
                  <OrigemBadge origem={p.origem} />
                </label>
              ))
            )}
          </div>

          {selectedIds.size > 0 && (
            <p className="text-xs text-muted-foreground">{selectedIds.size} produto(s) selecionado(s)</p>
          )}
        </div>
      </FormDrawer>

      {/* ── CONFIRM: excluir grupo ── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={v => { if (!v) setDeleteTarget(null); }}
        title={`Excluir "${deleteTarget?.name}"?`}
        description={
          deleteTarget?.productIds.length
            ? `Este grupo tem ${deleteTarget.productIds.length} produto(s) associado(s). A exclusão não remove os produtos do catálogo.`
            : "Esta ação não pode ser desfeita."
        }
        onConfirm={handleDelete}
        confirmLabel="Excluir"
        variant="destructive"
      />
    </div>
  );
}
