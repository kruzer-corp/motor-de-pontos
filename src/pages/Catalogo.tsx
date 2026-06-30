import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Badge, Button, Card, ConfirmDialog, DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
  FileUploadInput, FormDrawer, Input, Label,
  NumberInput, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Switch, Tabs, TabsContent, TabsList, TabsTrigger, toast,
  type UploadedFile,
} from "@kruzer/ds";
import { Archive, FileUp, MoreHorizontal, Package, ChevronDown, ChevronRight, Plus, Search } from "lucide-react";

type Product = { id: string; name: string; points: number; stock: number; active: boolean; archived?: boolean };

const CATALOG: Record<string, Product[]> = {
  "Eletrônicos": [
    { id: "P001", name: 'Smart TV 50"', points: 45000, stock: 12, active: true },
    { id: "P002", name: "Notebook Pro 14\"", points: 85000, stock: 5, active: true },
    { id: "P003", name: "Fone Bluetooth", points: 8500, stock: 48, active: true },
  ],
  "Casa & Cozinha": [
    { id: "P004", name: "Air Fryer XL", points: 18000, stock: 30, active: true },
    { id: "P005", name: "Cafeteira Premium", points: 12000, stock: 0, active: false },
    { id: "P006", name: "Liquidificador Pro", points: 9500, stock: 15, active: true },
  ],
  "Moda & Acessórios": [
    { id: "P007", name: "Tênis Runner", points: 22000, stock: 8, active: true },
    { id: "P008", name: "Bolsa Sport", points: 14000, stock: 3, active: true },
  ],
};

export default function Catalogo() {
  const [catalog, setCatalog] = useState(CATALOG);
  const [query,   setQuery]   = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.keys(CATALOG).map((k) => [k, true]))
  );

  // Novo produto
  const [open,       setOpen]       = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [newName,    setNewName]    = useState("");
  const [newGroup,   setNewGroup]   = useState("");
  const [newPoints,  setNewPoints]  = useState<number | null>(null);
  const [newStock,   setNewStock]   = useState<number | null>(null);
  const [newActive,  setNewActive]  = useState(true);
  const [uploadMode,       setUploadMode]       = useState<"manual" | "arquivo">("manual");
  const [files,            setFiles]            = useState<UploadedFile[]>([]);
  const [archiveTarget,    setArchiveTarget]    = useState<Product | null>(null);

  function resetForm() {
    setNewName(""); setNewGroup(""); setNewPoints(null); setNewStock(null);
    setNewActive(true); setUploadMode("manual"); setFiles([]);
  }

  function archiveProduct(product: Product) {
    setCatalog((prev) => {
      const updated: typeof prev = {};
      for (const [g, prods] of Object.entries(prev)) {
        updated[g] = prods.map((p) => p.id === product.id ? { ...p, archived: true } : p);
      }
      return updated;
    });
    setArchiveTarget(null);
    toast.success(`${product.name} arquivado`);
  }

  async function handleSave() {
    const isManualValid = uploadMode === "manual" && !!newName && !!newGroup && !!newPoints;
    const isFileValid   = uploadMode === "arquivo" && files.length > 0;
    if (!isManualValid && !isFileValid) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    if (uploadMode === "manual") {
      const allIds = Object.values(catalog).flat().map((p) => parseInt(p.id.replace("P", "")));
      const nextId = `P${String(Math.max(0, ...allIds) + 1).padStart(3, "0")}`;
      const product: Product = { id: nextId, name: newName, points: newPoints!, stock: newStock ?? 0, active: newActive };
      setCatalog((prev) => ({ ...prev, [newGroup]: [...(prev[newGroup] ?? []), product] }));
      toast.success(`${newName} adicionado ao catálogo`);
    } else {
      toast.success(`${files[0].name} importado — produtos serão processados em breve`);
    }
    setOpen(false);
    resetForm();
    setSaving(false);
  }

  const toggle = (group: string) =>
    setExpanded((prev) => ({ ...prev, [group]: !prev[group] }));

  const matchesQuery = (name: string) =>
    !query || name.toLowerCase().includes(query.toLowerCase());

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Catálogo de Produtos Incentivados</h2>
          <p className="text-sm text-muted-foreground">Produtos agrupados por categoria.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-9 w-64"
              placeholder="Buscar produto..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Novo produto
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/catalogo/grupos">Grupos</Link>
          </Button>
        </div>
      </div>

      {Object.entries(catalog).map(([group, products]) => {
        const visible = products.filter((p) => !p.archived && matchesQuery(p.name));
        if (visible.length === 0) return null;
        const isOpen = expanded[group] ?? true;

        return (
          <Card key={group} className="overflow-hidden">
            <button
              onClick={() => toggle(group)}
              className="flex w-full items-center gap-3 px-6 py-4 hover:bg-muted/30 text-left transition-colors"
            >
              <Package className="size-4 text-muted-foreground shrink-0" />
              <span className="flex-1 font-semibold">{group}</span>
              <Badge variant="secondary">{visible.length} produto{visible.length !== 1 ? "s" : ""}</Badge>
              {isOpen ? (
                <ChevronDown className="size-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="size-4 text-muted-foreground" />
              )}
            </button>

            {isOpen && (
              <div className="overflow-x-auto border-t border-border">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/20">
                    <tr className="text-left text-muted-foreground">
                      <th className="px-6 py-3 font-medium">Produto</th>
                      <th className="px-6 py-3 font-medium">ID</th>
                      <th className="px-6 py-3 font-medium">Pontos</th>
                      <th className="px-6 py-3 font-medium">Estoque</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {visible.map((product) => (
                      <tr key={product.id} className="hover:bg-muted/20">
                        <td className="px-6 py-3 font-medium">{product.name}</td>
                        <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{product.id}</td>
                        <td className="px-6 py-3 tabular-nums">
                          {product.points.toLocaleString("pt-BR")} pts
                        </td>
                        <td className="px-6 py-3 tabular-nums">
                          <span className={product.stock === 0 ? "text-red-500 font-medium" : ""}>
                            {product.stock === 0 ? "Esgotado" : product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              product.active
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {product.active ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Ações do produto">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/catalogo/${product.id}`}>Detalhes</Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-muted-foreground"
                                onSelect={() => setArchiveTarget(product)}
                              >
                                <Archive className="mr-2 h-4 w-4" />
                                Arquivar produto
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        );
      })}

      <ConfirmDialog
        open={!!archiveTarget}
        onOpenChange={(o) => { if (!o) setArchiveTarget(null); }}
        title={`Arquivar "${archiveTarget?.name}"?`}
        description="O produto será removido do catálogo de resgate e não ficará mais disponível para os membros. Você poderá reativá-lo a qualquer momento."
        confirmLabel="Arquivar"
        variant="destructive"
        onConfirm={() => archiveTarget && archiveProduct(archiveTarget)}
      />

      <FormDrawer
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}
        title="Novo produto"
        description="Adicione um produto ao catálogo de resgate."
        onSave={handleSave}
        saving={saving}
        saveLabel={uploadMode === "arquivo" ? "Importar arquivo" : "Adicionar produto"}
        saveDisabled={
          uploadMode === "manual"
            ? !newName || !newGroup || !newPoints
            : files.length === 0
        }
      >
        <div className="space-y-4">
          <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as "manual" | "arquivo")}>
            <TabsList className="w-full">
              <TabsTrigger value="manual" className="flex-1">Preenchimento manual</TabsTrigger>
              <TabsTrigger value="arquivo" className="flex-1">
                <FileUp className="mr-1.5 h-3.5 w-3.5" />
                Importar arquivo
              </TabsTrigger>
            </TabsList>

            {/* Manual */}
            <TabsContent value="manual" className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label>Nome do produto <span className="text-destructive">*</span></Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder='Ex: Smart TV 50"' />
              </div>
              <div className="space-y-1.5">
                <Label>Categoria <span className="text-destructive">*</span></Label>
                <Select value={newGroup} onValueChange={setNewGroup}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(catalog).map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Pontos necessários <span className="text-destructive">*</span></Label>
                  <NumberInput value={newPoints} onChange={setNewPoints} min={1} placeholder="Ex: 10000" />
                </div>
                <div className="space-y-1.5">
                  <Label>Estoque inicial</Label>
                  <NumberInput value={newStock} onChange={setNewStock} min={0} placeholder="Ex: 50" />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <div className="text-sm font-medium">Produto ativo</div>
                  <div className="text-xs text-muted-foreground">Disponível para resgate imediato</div>
                </div>
                <Switch checked={newActive} onCheckedChange={setNewActive} size="sm" />
              </div>
            </TabsContent>

            {/* Importar arquivo */}
            <TabsContent value="arquivo" className="mt-4 space-y-4">
              <FileUploadInput
                value={files}
                onChange={setFiles}
                maxFiles={1}
                accept=".csv,.xlsx,.xls"
                maxSizeMB={10}
              />
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Formato esperado</p>
                <p className="text-xs text-muted-foreground">
                  CSV ou Excel com colunas: <span className="font-mono">nome, categoria, pontos, estoque, ativo</span>
                </p>
                <a href="#" className="text-xs text-primary underline-offset-2 hover:underline" onClick={(e) => e.preventDefault()}>
                  Baixar planilha modelo
                </a>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </FormDrawer>
    </div>
  );
}
