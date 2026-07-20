import { useState, useMemo, useEffect } from "react";
import {
  Avatar, AvatarFallback, Button, EmptyState, FormDrawer,
  Input, Label, PageHeader, Pill, SearchInput,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  toast,
} from "@kruzer/ds";
import {
  AlertCircle, Archive, CheckCircle, Clock, Download, ExternalLink,
  LayoutGrid, List, Package, Pencil, Plus, RotateCcw, ShieldCheck, TrendingUp, Trash2, Upload, X, XCircle,
} from "lucide-react";
import { MOEDA } from "../config/programa";
import { getCampanhas } from "../lib/campanhas";
import {
  type Produto, type ProdutoStatus, type CampanhaParticipante, type HistoricoEvento,
  CATEGORIAS, getProdutos, saveProdutos,
} from "../lib/produtos";

// ── Detalhe do produto (panel lateral) ───────────────────────────────────────

const HIST_ICON: Record<HistoricoEvento["tipo"], { icon: typeof Clock; color: string }> = {
  criado:    { icon: Plus,        color: "text-emerald-600 bg-emerald-50" },
  editado:   { icon: Pencil,      color: "text-sky-600 bg-sky-50"         },
  arquivado: { icon: Archive,     color: "text-amber-600 bg-amber-50"     },
  reativado: { icon: RotateCcw,   color: "text-violet-600 bg-violet-50"   },
  campanha:  { icon: ExternalLink, color: "text-primary bg-primary/10"    },
};

const CAMP_STATUS_PILL: Record<CampanhaParticipante["status"], "success" | "muted" | "warning"> = {
  ativa: "success", encerrada: "muted", rascunho: "warning",
};

const PRODUTO_STATUS_PILL: Record<ProdutoStatus, "success" | "warning" | "muted"> = {
  ativo: "success", pendente: "warning", arquivado: "muted",
};
const PRODUTO_STATUS_LABEL: Record<ProdutoStatus, string> = {
  ativo: "Ativo", pendente: "Pendente", arquivado: "Arquivado",
};

function ProdutoDetalhe({ produto, onClose, onEditar, onArquivar, onAprovar }: {
  produto: Produto;
  onClose: () => void;
  onEditar: () => void;
  onArquivar: () => void;
  onAprovar: () => void;
}) {
  const [aba, setAba] = useState<"campanhas" | "pedidos" | "historico">("campanhas");

  const totalMoeda = produto.campanhas.reduce((a, c) => a + c.moedaGerada, 0);

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-lg bg-background border-l border-border shadow-2xl flex flex-col h-full overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                {produto.nome.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{produto.nome}</p>
              <p className="text-xs text-muted-foreground font-mono">{produto.sku} · {produto.categoria}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button size="sm" variant="outline" onClick={onEditar}>
              <Pencil className="h-3.5 w-3.5 mr-1" />Editar
            </Button>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-muted text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-border border-b border-border shrink-0">
          {[
            { label: "Status",      value: PRODUTO_STATUS_LABEL[produto.status] },
            { label: "Campanhas",   value: `${produto.campanhas.length}` },
            { label: `${MOEDA.nome} gerado`, value: totalMoeda.toLocaleString("pt-BR") },
          ].map(({ label, value }) => (
            <div key={label} className="px-4 py-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
              <p className="text-base font-bold mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Abas */}
        <div className="flex border-b border-border shrink-0">
          {([["campanhas", "Campanhas"], ["pedidos", "Pedidos"], ["historico", "Histórico"]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setAba(k)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                aba === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              {label}
              {k === "campanhas" && produto.campanhas.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-muted text-muted-foreground rounded-full px-1.5">{produto.campanhas.length}</span>
              )}
              {k === "pedidos" && produto.pedidos.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-muted text-muted-foreground rounded-full px-1.5">{produto.pedidos.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">

          {/* Campanhas */}
          {aba === "campanhas" && (
            produto.campanhas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Produto ainda não vinculado a nenhuma campanha.</p>
            ) : produto.campanhas.map(c => (
              <div key={c.id} className="rounded-lg border border-border p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{c.nome}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{c.id}</p>
                  </div>
                  <Pill color={CAMP_STATUS_PILL[c.status]} variant="soft" size="sm">
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </Pill>
                </div>
                <p className="text-xs text-muted-foreground">{c.periodo}</p>
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="text-xs text-muted-foreground">{MOEDA.nome} gerado</span>
                  <span className="text-sm font-semibold text-primary tabular-nums">
                    {c.moedaGerada > 0 ? c.moedaGerada.toLocaleString("pt-BR") : "—"}
                  </span>
                </div>
              </div>
            ))
          )}

          {/* Pedidos */}
          {aba === "pedidos" && (
            produto.pedidos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum pedido registrado para este produto.</p>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/20 border-b border-border">
                    <tr className="text-left text-muted-foreground text-xs">
                      <th className="px-4 py-2.5 font-medium">Pedido</th>
                      <th className="px-4 py-2.5 font-medium">Data</th>
                      <th className="px-4 py-2.5 font-medium">Membro</th>
                      <th className="px-4 py-2.5 font-medium text-right">{MOEDA.abrev}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {produto.pedidos.map(p => (
                      <tr key={p.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.id}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{p.data}</td>
                        <td className="px-4 py-3 text-sm">{p.membro}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-primary text-right tabular-nums">
                          +{p.moedaGerada.toLocaleString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Histórico */}
          {aba === "historico" && (
            <div className="space-y-0">
              {produto.historico.map((h, i) => {
                const { icon: Icon, color } = HIST_ICON[h.tipo];
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      {i < produto.historico.length - 1 && (
                        <div className="w-px flex-1 bg-border my-1" />
                      )}
                    </div>
                    <div className="pb-5 flex-1">
                      <p className="text-sm font-medium">{h.evento}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{h.detalhe}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1 font-mono">{h.data}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border shrink-0 flex justify-between items-center">
          <p className="text-xs text-muted-foreground">Cadastrado em {produto.criadoEm}</p>
          <div className="flex items-center gap-2">
            {produto.status === "pendente" && (
              <button onClick={onAprovar}
                className="flex items-center gap-1.5 text-xs font-medium rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 transition-colors">
                <CheckCircle className="h-3.5 w-3.5" />Aprovar produto
              </button>
            )}
            {produto.status !== "pendente" && (
              <button onClick={onArquivar}
                className={`flex items-center gap-1.5 text-xs font-medium rounded-lg border px-3 py-1.5 transition-colors ${
                  produto.status === "ativo"
                    ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                    : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                }`}>
                {produto.status === "ativo" ? <Archive className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
                {produto.status === "ativo" ? "Arquivar produto" : "Reativar produto"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Import modal ──────────────────────────────────────────────────────────────

function ImportModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (produtos: Produto[]) => void }) {
  const [step, setStep] = useState<"upload" | "processando" | "status">("upload");
  const [progresso, setProgresso] = useState(0);
  const [result, setResult] = useState<{
    encontrados: Produto[]; naoEncontrados: string[];
    excecoes: { produto: Produto; campanhas: string[] }[];
  } | null>(null);

  function processarArquivo(file: File) {
    setStep("processando");
    setProgresso(0);
    const avanco = setInterval(() => {
      setProgresso(p => Math.min(p + 8 + Math.random() * 10, 90));
    }, 150);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const tokens = text.split(/[\n\r,;\t]+/).map(s => s.trim().replace(/['"]/g, "").toUpperCase()).filter(Boolean);
      const encontrados = getProdutos().filter(p => tokens.includes(p.sku.toUpperCase()));
      const skusEncontrados = new Set(encontrados.map(p => p.sku.toUpperCase()));
      const naoEncontrados = tokens.filter(t => t.length > 2 && !skusEncontrados.has(t));

      const campanhasAtivas = getCampanhas().filter(c => c.status === "ativa");
      const excecoes = encontrados
        .map(p => ({
          produto: p,
          campanhas: campanhasAtivas.filter(c => c.categoriasExcluidas.includes(p.categoria)).map(c => c.nome),
        }))
        .filter(x => x.campanhas.length > 0);

      clearInterval(avanco);
      setProgresso(100);
      setTimeout(() => {
        setResult({ encontrados, naoEncontrados: Array.from(new Set(naoEncontrados)), excecoes });
        setStep("status");
      }, 400);
    };
    reader.readAsText(file);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[85vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <p className="text-sm font-bold">Importar produtos em lote</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {step === "upload" ? "Faça upload de um arquivo Excel ou CSV com os SKUs"
                : step === "processando" ? "Processando arquivo…" : "Status da importação"}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="overflow-y-auto flex-1">
          {step === "upload" && (
            <div className="p-5 space-y-4">
              <label className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-10 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">Arraste o arquivo aqui ou clique para selecionar</p>
                  <p className="text-xs text-muted-foreground mt-1">Excel (.xlsx, .xls) ou CSV — coluna com os SKUs</p>
                </div>
                <input type="file" accept=".csv,.xlsx,.xls,.txt" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) processarArquivo(f); }} />
              </label>
              <div className="rounded-lg bg-muted/40 px-4 py-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Formato esperado</p>
                <div className="font-mono text-xs bg-background border border-border rounded px-3 py-2 space-y-0.5">
                  <p className="text-muted-foreground">SKU</p><p>TV-50-4K</p><p>FONE-BT-02</p>
                </div>
              </div>
            </div>
          )}
          {step === "processando" && (
            <div className="p-5 py-12 flex flex-col items-center gap-4">
              <Upload className="h-8 w-8 text-muted-foreground animate-pulse" />
              <div className="w-full space-y-1.5">
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-150" style={{ width: `${progresso}%` }} />
                </div>
                <p className="text-xs text-center text-muted-foreground">{Math.round(progresso)}%</p>
              </div>
            </div>
          )}
          {step === "status" && result && (
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
                  <p className="text-xl font-bold text-emerald-700">{result.encontrados.length}</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Encontrados</p>
                </div>
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-center">
                  <p className="text-xl font-bold text-rose-700">{result.naoEncontrados.length}</p>
                  <p className="text-xs text-rose-600 mt-0.5">Não encontrados</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-center">
                  <p className="text-xl font-bold">{result.encontrados.length + result.naoEncontrados.length}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Total</p>
                </div>
              </div>
              {result.excecoes.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 space-y-1.5">
                  <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />Exceção de categoria encontrada
                  </p>
                  {result.excecoes.map(({ produto, campanhas }) => (
                    <p key={produto.id} className="text-xs text-amber-700">
                      <span className="font-medium">{produto.nome}</span> ({produto.categoria}) — categoria excluída em: {campanhas.join(", ")}
                    </p>
                  ))}
                  <p className="text-[11px] text-amber-700/80">Esses produtos ainda serão importados como Pendente, para revisão manual antes de aprovar.</p>
                </div>
              )}
              {result.encontrados.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5" />Encontrados</p>
                  <div className="rounded-lg border border-emerald-200 overflow-hidden">
                    {result.encontrados.map((p, i) => (
                      <div key={p.id} className={`flex items-center gap-3 px-3 py-2.5 text-xs ${i < result.encontrados.length - 1 ? "border-b border-emerald-100" : ""}`}>
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="flex-1 font-medium">{p.nome}</span>
                        <span className="font-mono text-muted-foreground">{p.sku}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {result.naoEncontrados.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-rose-700 flex items-center gap-1.5"><XCircle className="h-3.5 w-3.5" />Não encontrados</p>
                  <div className="rounded-lg border border-rose-200 overflow-hidden">
                    {result.naoEncontrados.map((sku, i) => (
                      <div key={sku} className={`flex items-center gap-3 px-3 py-2.5 text-xs ${i < result.naoEncontrados.length - 1 ? "border-b border-rose-100" : ""}`}>
                        <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                        <span className="font-mono text-rose-700">{sku}</span>
                      </div>
                    ))}
                  </div>
                  {result.encontrados.length > 0 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />Apenas os produtos encontrados serão adicionados.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2 px-5 py-4 border-t border-border shrink-0">
          {step === "upload" && <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>}
          {step === "status" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>Voltar</Button>
              <Button className="flex-1" disabled={!result || result.encontrados.length === 0}
                onClick={() => { if (result) { onConfirm(result.encontrados); onClose(); } }}>
                Confirmar {result && result.encontrados.length > 0 ? `${result.encontrados.length} produto(s)` : ""}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CatalogoProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>(() => getProdutos());
  useEffect(() => { saveProdutos(produtos); }, [produtos]);
  const [search, setSearch]     = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroStatus,    setFiltroStatus]    = useState<ProdutoStatus | "todos">("todos");
  const [importOpen,  setImportOpen]  = useState(false);
  const [detalheId,   setDetalheId]   = useState<string | null>(null);
  const [excluirId,   setExcluirId]   = useState<string | null>(null);
  const [visualizacao, setVisualizacao] = useState<"lista" | "agrupado">("lista");

  // Drawer — novo/editar
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [editandoId,  setEditandoId]  = useState<string | null>(null);
  const [formSku,     setFormSku]     = useState("");
  const [formNome,    setFormNome]    = useState("");
  const [formCategoria, setFormCategoria] = useState("");
  const [formPreco,   setFormPreco]   = useState("");

  const filtered = useMemo(() => produtos.filter(p => {
    const matchSearch    = !search || p.nome.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategoria = filtroCategoria === "todas" || p.categoria === filtroCategoria;
    const matchStatus    = filtroStatus === "todos" || p.status === filtroStatus;
    return matchSearch && matchCategoria && matchStatus;
  }), [produtos, search, filtroCategoria, filtroStatus]);

  const produtoDetalhe = detalheId ? produtos.find(p => p.id === detalheId) ?? null : null;

  const agrupados = useMemo(() => {
    const grupos = new Map<string, Produto[]>();
    for (const p of filtered) {
      const lista = grupos.get(p.categoria) ?? [];
      lista.push(p);
      grupos.set(p.categoria, lista);
    }
    return CATEGORIAS
      .filter(c => grupos.has(c))
      .map(c => ({ categoria: c, produtos: grupos.get(c)! }));
  }, [filtered]);

  function exportarCSV() {
    const headers = ["SKU", "Nome", "Categoria", "Preço", "Status", "Criado em", "Campanhas vinculadas", `${MOEDA.nome} total gerado`];
    const rows = filtered.map(p => [
      p.sku, p.nome, p.categoria,
      p.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
      PRODUTO_STATUS_LABEL[p.status],
      p.criadoEm,
      p.campanhasVinculadas.join(", "),
      p.campanhas.reduce((a, c) => a + c.moedaGerada, 0).toString(),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "catalogo-produtos.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Planilha exportada");
  }

  function abrirNovo() { setEditandoId(null); setFormSku(""); setFormNome(""); setFormCategoria(""); setFormPreco(""); setDrawerOpen(true); }
  function abrirEditar(p: Produto) { setEditandoId(p.id); setFormSku(p.sku); setFormNome(p.nome); setFormCategoria(p.categoria); setFormPreco(String(p.preco || "")); setDrawerOpen(true); }
  function fecharDrawer() { setDrawerOpen(false); setEditandoId(null); setFormSku(""); setFormNome(""); setFormCategoria(""); setFormPreco(""); }

  async function handleSave() {
    if (!formSku || !formNome || !formCategoria) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    if (editandoId) {
      setProdutos(prev => prev.map(p => p.id === editandoId ? { ...p, sku: formSku, nome: formNome, categoria: formCategoria, preco: Number(formPreco.replace(",", ".")) || 0 } : p));
      toast.success("Produto atualizado");
    } else {
      const novo: Produto = { id: `SKU-${String(produtos.length + 1).padStart(3, "0")}`, sku: formSku, nome: formNome, categoria: formCategoria, preco: Number(formPreco.replace(",", ".")) || 0, status: "ativo", campanhasVinculadas: [], criadoEm: new Date().toLocaleDateString("pt-BR"), campanhas: [], pedidos: [], historico: [{ data: new Date().toLocaleDateString("pt-BR"), evento: "Produto cadastrado", detalhe: "Adicionado ao catálogo", tipo: "criado" }] };
      setProdutos(prev => [novo, ...prev]);
      toast.success(`${formNome} adicionado ao catálogo`);
    }
    setSaving(false);
    fecharDrawer();
  }

  function excluir(id: string) {
    setProdutos(prev => prev.filter(p => p.id !== id));
    const p = produtos.find(x => x.id === id);
    toast.success(`${p?.nome ?? "Produto"} excluído do catálogo`);
    setExcluirId(null);
    if (detalheId === id) setDetalheId(null);
  }

  function arquivar(id: string) {
    const p = produtos.find(x => x.id === id);
    const novoStatus: ProdutoStatus = p?.status === "ativo" ? "arquivado" : "ativo";
    setProdutos(prev => prev.map(x => x.id === id ? { ...x, status: novoStatus } : x));
    toast.success(`Produto ${novoStatus === "arquivado" ? "arquivado" : "reativado"}`);
  }

  function aprovar(id: string) {
    setProdutos(prev => prev.map(x => x.id === id ? { ...x, status: "ativo" } : x));
    toast.success("Produto aprovado e habilitado no catálogo");
  }

  function handleImportConfirm(importados: Produto[]) {
    const novos = importados.filter(imp => !produtos.find(p => p.sku === imp.sku));
    if (novos.length > 0) setProdutos(prev => [...novos.map(p => ({ ...p, status: "pendente" as ProdutoStatus, campanhasVinculadas: [] })), ...prev]);
    toast.success(`${importados.length} produto(s) importado(s)`);
  }

  function renderRow(p: Produto) {
    const totalMoeda = p.campanhas.reduce((a, c) => a + c.moedaGerada, 0);
    return (
      <tr key={p.id}
        className={`hover:bg-muted/20 transition-colors cursor-pointer ${p.status === "arquivado" ? "opacity-60" : ""}`}
        onClick={() => setDetalheId(p.id)}>
        <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground whitespace-nowrap">{p.sku}</td>
        <td className="px-4 py-3.5 font-medium text-sm whitespace-nowrap">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-bold">
                {p.nome.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {p.nome}
          </div>
        </td>
        <td className="px-4 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{p.categoria}</td>
        <td className="px-4 py-3.5 text-sm whitespace-nowrap">
          {p.preco > 0 ? `R$ ${p.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : <span className="text-muted-foreground">—</span>}
        </td>
        <td className="px-4 py-3.5">
          <Pill color={PRODUTO_STATUS_PILL[p.status]} variant="soft" size="sm">
            {PRODUTO_STATUS_LABEL[p.status]}
          </Pill>
        </td>
        <td className="px-4 py-3.5">
          {p.campanhasVinculadas.length === 0 ? (
            <span className="text-xs text-muted-foreground">—</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {p.campanhasVinculadas.map(c => (
                <span key={c} className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">{c}</span>
              ))}
            </div>
          )}
        </td>
        <td className="px-4 py-3.5 tabular-nums text-sm font-semibold text-primary">
          {totalMoeda > 0 ? totalMoeda.toLocaleString("pt-BR") : <span className="text-muted-foreground font-normal">—</span>}
        </td>
        <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-1 justify-end">
            <button onClick={() => abrirEditar(p)} title="Editar"
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            {p.status === "pendente" && (
              <button onClick={() => aprovar(p.id)} title="Aprovar"
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-emerald-600 transition-colors">
                <CheckCircle className="h-3.5 w-3.5" />
              </button>
            )}
            {p.status !== "pendente" && (
              <button onClick={() => arquivar(p.id)}
                title={p.status === "ativo" ? "Arquivar" : "Reativar"}
                className={`p-1.5 rounded hover:bg-muted transition-colors ${p.status === "ativo" ? "text-muted-foreground hover:text-amber-600" : "text-muted-foreground hover:text-emerald-600"}`}>
                {p.status === "ativo" ? <Archive className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
              </button>
            )}
            {p.campanhasVinculadas.length === 0 && p.pedidos.length === 0 && (
              <button onClick={() => setExcluirId(p.id)} title="Excluir permanentemente"
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos incentivados"
        path={[{ label: "Operação" }]}
        description={`${produtos.filter(p => p.status === "ativo").length} produtos ativos${
            produtos.some(p => p.status === "pendente") ? ` · ${produtos.filter(p => p.status === "pendente").length} pendente(s)` : ""
          } · ${produtos.length} no total`}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={exportarCSV}>
              <Download className="mr-1.5 h-3.5 w-3.5" />Exportar planilha
            </Button>
            <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="mr-1.5 h-3.5 w-3.5" />Importar SKUs
            </Button>
            <Button size="sm" onClick={abrirNovo}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />Adicionar produto
            </Button>
          </div>
        }
      />

      {/* Explicação do conceito */}
      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
        <TrendingUp className="h-4 w-4 text-primary shrink-0" />
        <p className="text-xs text-foreground">
          Produto incentivado não é uma recompensa — é o item que <strong>gera pontos quando comprado</strong>. Ex: membro compra o produto X → acumula mais benefícios. Recompensas (o que o membro troca por pontos) ficam no Catálogo.
        </p>
      </div>

      {/* Role badge */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-2.5">
        <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground">
          Acesso restrito a <strong className="text-foreground">Analista</strong> e <strong className="text-foreground">Master</strong> — visualize e administre todos os produtos incentivados do programa.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-wrap">
          <div className="w-64 shrink-0">
            <SearchInput value={search} onChange={setSearch} placeholder="Nome ou SKU…" />
          </div>
          <div className="w-40 shrink-0">
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas categorias</SelectItem>
                {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-36 shrink-0">
            <Select value={filtroStatus} onValueChange={v => setFiltroStatus(v as ProdutoStatus | "todos")}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="arquivado">Arquivados</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} produto(s)</span>
          <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5 shrink-0">
            <button onClick={() => setVisualizacao("lista")} title="Lista"
              className={`p-1.5 rounded ${visualizacao === "lista" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <List className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setVisualizacao("agrupado")} title="Agrupado por categoria"
              className={`p-1.5 rounded ${visualizacao === "agrupado" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10">
            <EmptyState icon={Package} title="Nenhum produto encontrado"
              description="Ajuste os filtros ou adicione um novo produto ao catálogo." />
          </div>
        ) : visualizacao === "lista" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/20 border-b border-border">
                <tr className="text-left text-muted-foreground">
                  {["SKU", "Nome", "Categoria", "Preço", "Status", "Campanhas", `${MOEDA.nome} gerado`, ""].map(h => (
                    <th key={h} className="px-4 py-3 font-medium text-xs whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(renderRow)}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {agrupados.map(({ categoria, produtos: produtosGrupo }) => (
              <div key={categoria} className="overflow-x-auto">
                <div className="px-4 py-2.5 bg-muted/10 text-xs font-medium text-muted-foreground flex items-center gap-2">
                  {categoria}
                  <span className="text-muted-foreground/70">· {produtosGrupo.length} produto(s)</span>
                </div>
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/20 border-b border-border">
                    <tr className="text-left text-muted-foreground">
                      {["SKU", "Nome", "Categoria", "Preço", "Status", "Campanhas", `${MOEDA.nome} gerado`, ""].map(h => (
                        <th key={h} className="px-4 py-3 font-medium text-xs whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {produtosGrupo.map(renderRow)}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panel de detalhe */}
      {produtoDetalhe && (
        <ProdutoDetalhe
          produto={produtoDetalhe}
          onClose={() => setDetalheId(null)}
          onEditar={() => { setDetalheId(null); abrirEditar(produtoDetalhe); }}
          onArquivar={() => { arquivar(produtoDetalhe.id); setDetalheId(null); }}
          onAprovar={() => { aprovar(produtoDetalhe.id); setDetalheId(null); }}
        />
      )}

      {/* Confirm exclusão */}
      {excluirId && (() => {
        const p = produtos.find(x => x.id === excluirId);
        return (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setExcluirId(null)}>
            <div className="bg-background rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Excluir produto?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <strong>{p?.nome}</strong> ({p?.sku}) será removido permanentemente do catálogo. Esta ação não pode ser desfeita.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setExcluirId(null)}>Cancelar</Button>
                <Button variant="destructive" className="flex-1" onClick={() => excluir(excluirId)}>
                  Excluir permanentemente
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal de importação */}
      {importOpen && (
        <ImportModal onClose={() => setImportOpen(false)} onConfirm={handleImportConfirm} />
      )}

      {/* Drawer — adicionar / editar */}
      <FormDrawer
        open={drawerOpen}
        onOpenChange={v => { if (!v) fecharDrawer(); }}
        title={editandoId ? "Editar produto" : "Adicionar produto"}
        description={editandoId ? "Atualize os dados do produto no catálogo." : "Cadastre um novo produto elegível para acúmulo de moeda nas campanhas."}
        onSave={handleSave}
        saving={saving}
        saveLabel={editandoId ? "Salvar alterações" : "Adicionar ao catálogo"}
        saveDisabled={!formSku || !formNome || !formCategoria}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>SKU <span className="text-destructive">*</span></Label>
            <Input value={formSku} onChange={e => setFormSku(e.target.value)} placeholder="Ex: TV-50-4K" className="font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label>Nome do produto <span className="text-destructive">*</span></Label>
            <Input value={formNome} onChange={e => setFormNome(e.target.value)} placeholder='Ex: Smart TV 50"' />
          </div>
          <div className="space-y-1.5">
            <Label>Categoria <span className="text-destructive">*</span></Label>
            <Select value={formCategoria} onValueChange={setFormCategoria}>
              <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Preço de referência (R$)</Label>
            <Input value={formPreco} onChange={e => setFormPreco(e.target.value.replace(/[^0-9.,]/g, ""))} placeholder="Ex: 199,90" inputMode="decimal" />
          </div>
        </div>
      </FormDrawer>
    </div>
  );
}
