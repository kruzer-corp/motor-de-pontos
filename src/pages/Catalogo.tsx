import { useState, useMemo, useEffect, useRef } from "react";
import {
  Button, FileUploadInput, FormDrawer, Input, Label, PageHeader, Pill,
  SearchInput, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Tabs, TabsList, TabsTrigger, toast, type UploadedFile,
} from "@kruzer/ds";
import { Archive, CheckCircle2, FileUp, Loader2, Pencil, Plus, RotateCcw, X } from "lucide-react";

type ImportJob = { status: "processing" | "done"; filename: string; total: number; current: number };

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Origem      = "1P" | "3P";
type TierProduto = "Bronze" | "Prata" | "Ouro" | "Especial";
type EntradaTipo = "manual" | "csv" | "api";
type StatusProd  = "ativo" | "arquivado";

type Produto = {
  id: string; sku: string; nome: string; categoria: string;
  origem: Origem; tier: TierProduto;
  seller: string; plataforma: string;
  estoque: number | null; entrada: EntradaTipo; status: StatusProd;
};

// ── Constantes ────────────────────────────────────────────────────────────────

const CATEGORIAS   = ["Eletrônicos", "Eletrodomésticos", "Beleza", "Esportes", "Acessórios", "Voucher"];
const TIERS_PROD: TierProduto[] = ["Bronze", "Prata", "Ouro", "Especial"];
const PLATAFORMAS  = ["VTEX", "Shopify", "Magento", "Nuvemshop", "Mercado Livre", "Amazon", "Outro"];

const TIER_COLOR: Record<TierProduto, string> = {
  Bronze:   "bg-orange-100 text-orange-700",
  Prata:    "bg-slate-100 text-slate-600",
  Ouro:     "bg-amber-100 text-amber-700",
  Especial: "bg-violet-100 text-violet-700",
};

const ENTRADA_LABEL: Record<EntradaTipo, { label: string; color: string }> = {
  manual: { label: "Manual", color: "bg-muted text-muted-foreground" },
  csv:    { label: "CSV",    color: "bg-sky-100 text-sky-700" },
  api:    { label: "API",    color: "bg-emerald-100 text-emerald-700" },
};

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK: Produto[] = [
  { id: "1P-001", sku: "TV-50-4K",    nome: 'Smart TV 50"',      categoria: "Eletrônicos",      origem: "1P", tier: "Especial", seller: "",             plataforma: "",              estoque: 12,   entrada: "manual", status: "ativo" },
  { id: "1P-002", sku: "AIRFRY-XL",   nome: "Air Fryer XL",      categoria: "Eletrodomésticos", origem: "1P", tier: "Ouro",     seller: "",             plataforma: "",              estoque: 30,   entrada: "csv",    status: "ativo" },
  { id: "1P-003", sku: "FONE-BT-02",  nome: "Fone Bluetooth",    categoria: "Eletrônicos",      origem: "1P", tier: "Prata",    seller: "",             plataforma: "",              estoque: 48,   entrada: "api",    status: "ativo" },
  { id: "1P-004", sku: "KIT-SKIN-01", nome: "Kit Skincare",      categoria: "Beleza",           origem: "1P", tier: "Bronze",   seller: "",             plataforma: "",              estoque: 0,    entrada: "manual", status: "ativo" },
  { id: "3P-001", sku: "ML-TV-9921",  nome: 'Smart TV 55" 4K',   categoria: "Eletrônicos",      origem: "3P", tier: "Especial", seller: "Tech Store BR", plataforma: "Mercado Livre", estoque: null, entrada: "api",    status: "ativo" },
  { id: "3P-002", sku: "AMZ-FONE-03", nome: "Fone ANC Pro",      categoria: "Eletrônicos",      origem: "3P", tier: "Ouro",     seller: "AudioMax",     plataforma: "Amazon",        estoque: null, entrada: "api",    status: "ativo" },
  { id: "3P-003", sku: "VTX-CREME-1", nome: "Creme Facial SPF",  categoria: "Beleza",           origem: "3P", tier: "Prata",    seller: "Beleza Total", plataforma: "VTEX",          estoque: null, entrada: "csv",    status: "ativo" },
  { id: "3P-004", sku: "ML-TENIS-42", nome: "Tênis Running Pro", categoria: "Esportes",         origem: "3P", tier: "Bronze",   seller: "Sport Zone",   plataforma: "Mercado Livre", estoque: null, entrada: "manual", status: "arquivado" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function EntradaBadge({ tipo }: { tipo: EntradaTipo }) {
  const { label, color } = ENTRADA_LABEL[tipo];
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${color}`}>{label}</span>;
}

function TierBadge({ tier }: { tier: TierProduto }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${TIER_COLOR[tier]}`}>{tier}</span>;
}

function OrigemBadge({ origem }: { origem: Origem }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${
      origem === "1P" ? "bg-primary/10 text-primary" : "bg-violet-100 text-violet-700"
    }`}>{origem}</span>
  );
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function Catalogo() {
  const [produtos, setProdutos] = useState<Produto[]>(MOCK);
  const [search,          setSearch]          = useState("");
  const [filtroOrigem,    setFiltroOrigem]    = useState<Origem | "todos">("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroStatus,    setFiltroStatus]    = useState<StatusProd | "todos">("todos");

  // ── Drawer: produto unitário ──────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [fOrigem,    setFOrigem]    = useState<Origem>("1P");
  const [fSku,       setFSku]       = useState("");
  const [fNome,      setFNome]      = useState("");
  const [fCat,       setFCat]       = useState("");
  const [fTier,      setFTier]      = useState<TierProduto>("Bronze");
  const [fSeller,    setFSeller]    = useState("");
  const [fPlat,      setFPlat]      = useState("");
  const [fEstoque,   setFEstoque]   = useState("");

  function resetForm() {
    setFOrigem("1P"); setFSku(""); setFNome(""); setFCat(""); setFTier("Bronze");
    setFSeller(""); setFPlat(""); setFEstoque("");
  }

  function abrirDrawer() { resetForm(); setDrawerOpen(true); }

  const isSaveDisabled = !fNome || !fCat || (fOrigem === "3P" && !fSeller);

  async function handleSave() {
    if (isSaveDisabled) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    const novo: Produto = {
      id: `${fOrigem}-${String(produtos.length + 1).padStart(3, "0")}`,
      sku: fSku, nome: fNome, categoria: fCat, origem: fOrigem, tier: fTier,
      seller: fSeller, plataforma: fPlat,
      estoque: fOrigem === "1P" && fEstoque ? parseInt(fEstoque) : null,
      entrada: "manual", status: "ativo",
    };
    setProdutos(prev => [novo, ...prev]);
    toast.success(`${fNome} adicionado ao catálogo`);
    setSaving(false); setDrawerOpen(false); resetForm();
  }

  // ── Drawer: importar em lote ──────────────────────────────────────────────
  const [csvOpen,    setCsvOpen]    = useState(false);
  const [csvSaving,  setCsvSaving]  = useState(false);
  const [csvFiles,   setCsvFiles]   = useState<UploadedFile[]>([]);
  const [importJob,  setImportJob]  = useState<ImportJob | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!importJob || importJob.status === "done") return;
    intervalRef.current = setInterval(() => {
      setImportJob(prev => {
        if (!prev) return null;
        const next = Math.min(prev.current + Math.ceil(prev.total / 12), prev.total);
        if (next >= prev.total) {
          clearInterval(intervalRef.current!);
          return { ...prev, current: prev.total, status: "done" };
        }
        return { ...prev, current: next };
      });
    }, 400);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [importJob?.status]);

  async function handleSaveCSV() {
    if (csvFiles.length === 0) return;
    setCsvSaving(true);
    await new Promise(r => setTimeout(r, 400));
    const total = Math.floor(Math.random() * 80) + 20;
    setImportJob({ status: "processing", filename: csvFiles[0].name, total, current: 0 });
    setCsvSaving(false); setCsvOpen(false); setCsvFiles([]);
  }

  // ── Ações da tabela ───────────────────────────────────────────────────────
  function toggleStatus(id: string) {
    setProdutos(prev => prev.map(p =>
      p.id === id ? { ...p, status: p.status === "ativo" ? "arquivado" : "ativo" } : p
    ));
  }

  const filtered = useMemo(() => produtos.filter(p => {
    const matchSearch    = !search || p.nome.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.seller.toLowerCase().includes(search.toLowerCase());
    const matchOrigem    = filtroOrigem === "todos" || p.origem === filtroOrigem;
    const matchCategoria = filtroCategoria === "todas" || p.categoria === filtroCategoria;
    const matchStatus    = filtroStatus === "todos" || p.status === filtroStatus;
    return matchSearch && matchOrigem && matchCategoria && matchStatus;
  }), [produtos, search, filtroOrigem, filtroCategoria, filtroStatus]);

  const total1P = produtos.filter(p => p.origem === "1P" && p.status === "ativo").length;
  const total3P = produtos.filter(p => p.origem === "3P" && p.status === "ativo").length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Catálogo de produtos"
        path={[{ label: "Configuração" }]}
        description={`${total1P} próprios · ${total3P} de terceiros ativos`}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { setCsvFiles([]); setCsvOpen(true); }}>
              <FileUp className="mr-1.5 h-3.5 w-3.5" />Importar em lote
            </Button>
            <Button size="sm" onClick={abrirDrawer}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />Adicionar produto
            </Button>
          </div>
        }
      />

      {/* ── Banner de importação ── */}
      {importJob && (
        <div className={`rounded-lg border px-4 py-3 flex items-center gap-3 ${
          importJob.status === "done"
            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
            : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30"
        }`}>
          {importJob.status === "processing"
            ? <Loader2 className="h-4 w-4 text-blue-500 shrink-0 animate-spin" />
            : <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          }
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium truncate">
                {importJob.status === "processing"
                  ? `Importando ${importJob.filename}…`
                  : `${importJob.filename} importado com sucesso`
                }
              </p>
              <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                {importJob.current} de {importJob.total} produtos
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  importJob.status === "done" ? "bg-emerald-500" : "bg-blue-500"
                }`}
                style={{ width: `${(importJob.current / importJob.total) * 100}%` }}
              />
            </div>
          </div>
          {importJob.status === "done" && (
            <button onClick={() => setImportJob(null)}
              className="p-1 rounded hover:bg-black/10 text-muted-foreground transition-colors shrink-0">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-wrap">
          <div className="w-56 shrink-0">
            <SearchInput value={search} onChange={setSearch} placeholder="Nome, SKU ou seller…" />
          </div>
          <Select value={filtroOrigem} onValueChange={v => setFiltroOrigem(v as Origem | "todos")}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas origens</SelectItem>
              <SelectItem value="1P">1P — Próprio</SelectItem>
              <SelectItem value="3P">3P — Terceiro</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas categorias</SelectItem>
              {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filtroStatus} onValueChange={v => setFiltroStatus(v as StatusProd | "todos")}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="arquivado">Arquivados</SelectItem>
            </SelectContent>
          </Select>
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} produto(s)</span>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/20 border-b border-border">
              <tr className="text-left text-muted-foreground">
                {["Origem", "SKU", "Nome", "Categoria", "Tier", "Seller / Plataforma", "Estoque", "Entrada", "Status", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(p => (
                <tr key={p.id} className={`hover:bg-muted/20 transition-colors ${p.status === "arquivado" ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3.5"><OrigemBadge origem={p.origem} /></td>
                  <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{p.sku || "—"}</td>
                  <td className="px-4 py-3.5 font-medium whitespace-nowrap">{p.nome}</td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground">{p.categoria}</td>
                  <td className="px-4 py-3.5"><TierBadge tier={p.tier} /></td>
                  <td className="px-4 py-3.5">
                    {p.origem === "3P" ? (
                      <div>
                        <p className="text-sm font-medium">{p.seller}</p>
                        <p className="text-[10px] text-muted-foreground">{p.plataforma}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 tabular-nums text-sm">
                    {p.origem === "3P" || p.estoque === null
                      ? <span className="text-muted-foreground">—</span>
                      : p.estoque === 0
                        ? <span className="text-destructive font-medium">Esgotado</span>
                        : p.estoque}
                  </td>
                  <td className="px-4 py-3.5"><EntradaBadge tipo={p.entrada} /></td>
                  <td className="px-4 py-3.5">
                    <Pill color={p.status === "ativo" ? "success" : "muted"} variant="soft" size="sm">
                      {p.status === "ativo" ? "Ativo" : "Arquivado"}
                    </Pill>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => toggleStatus(p.id)}
                        className={`p-1.5 rounded hover:bg-muted transition-colors ${p.status === "ativo" ? "text-muted-foreground hover:text-amber-600" : "text-muted-foreground hover:text-emerald-600"}`}>
                        {p.status === "ativo" ? <Archive className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── DRAWER: produto unitário ── */}
      <FormDrawer
        open={drawerOpen}
        onOpenChange={v => { if (!v) { setDrawerOpen(false); resetForm(); } }}
        title="Adicionar produto"
        description="Selecione a origem e preencha os dados do produto."
        onSave={handleSave}
        saving={saving}
        saveLabel="Adicionar produto"
        saveDisabled={isSaveDisabled}
      >
        <div className="space-y-5">
          {/* Origem */}
          <Tabs value={fOrigem} onValueChange={v => { setFOrigem(v as Origem); setFSeller(""); setFPlat(""); }}>
            <TabsList className="w-full">
              <TabsTrigger value="1P" className="flex-1">1P — Próprio</TabsTrigger>
              <TabsTrigger value="3P" className="flex-1">3P — Terceiro</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Campos exclusivos 3P */}
          {fOrigem === "3P" && (
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
              <div className="space-y-1.5">
                <Label>Seller <span className="text-destructive">*</span></Label>
                <Input value={fSeller} onChange={e => setFSeller(e.target.value)} placeholder="Nome do seller" />
              </div>
              <div className="space-y-1.5">
                <Label>Plataforma</Label>
                <Select value={fPlat} onValueChange={setFPlat}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{PLATAFORMAS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Campos comuns */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>SKU</Label>
              <Input value={fSku} onChange={e => setFSku(e.target.value)} placeholder="Ex: TV-50-4K" className="font-mono" />
            </div>
            {fOrigem === "1P" && (
              <div className="space-y-1.5">
                <Label>Estoque inicial</Label>
                <Input value={fEstoque} onChange={e => setFEstoque(e.target.value)} type="number" min="0" placeholder="Ex: 50" />
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Nome do produto <span className="text-destructive">*</span></Label>
            <Input value={fNome} onChange={e => setFNome(e.target.value)} placeholder='Ex: Smart TV 50"' />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Categoria <span className="text-destructive">*</span></Label>
              <Select value={fCat} onValueChange={setFCat}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tier</Label>
              <Select value={fTier} onValueChange={v => setFTier(v as TierProduto)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TIERS_PROD.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </FormDrawer>

      {/* ── DRAWER: importar em lote ── */}
      <FormDrawer
        open={csvOpen}
        onOpenChange={v => { if (!v) { setCsvOpen(false); setCsvFiles([]); } }}
        title="Importar em lote"
        description="Importe múltiplos produtos via CSV. Funciona para produtos 1P e 3P — inclua a coluna origem no arquivo."
        onSave={handleSaveCSV}
        saving={csvSaving}
        saveLabel="Importar arquivo"
        saveDisabled={csvFiles.length === 0}
      >
        <div className="space-y-4">
          <FileUploadInput value={csvFiles} onChange={setCsvFiles} maxFiles={1} accept=".csv,.xlsx,.xls" maxSizeMB={10} />
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Colunas esperadas</p>
            <p className="font-mono text-xs text-muted-foreground">sku, nome, categoria, origem, tier, seller, plataforma, estoque</p>
          </div>
        </div>
      </FormDrawer>
    </div>
  );
}
