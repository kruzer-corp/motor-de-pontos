import { useState, useMemo } from "react";
import { SearchInput, toast } from "@kruzer/ds";
import { ShoppingCart, SlidersHorizontal, X } from "lucide-react";
import { MOEDA } from "../../config/programa";

// ── Types ─────────────────────────────────────────────────────────────────────

type Tier = "Especial" | "Ouro" | "Prata" | "Bronze";

type ProdutoIncentivado = {
  id: string;
  sku: string;
  nome: string;
  categoria: string;
  tier: Tier;
  pontosPerReal: number;
  bonus: number | null;
  imagem?: string;
};

// ── Config de tier ────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<Tier, { cor: string; badge: string; dot: string }> = {
  Especial: { cor: "bg-violet-100 text-violet-700 border-violet-200", badge: "bg-violet-600", dot: "bg-violet-500" },
  Ouro:     { cor: "bg-amber-100  text-amber-700  border-amber-200",  badge: "bg-amber-500",  dot: "bg-amber-400"  },
  Prata:    { cor: "bg-slate-100  text-slate-600  border-slate-200",  badge: "bg-slate-500",  dot: "bg-slate-400"  },
  Bronze:   { cor: "bg-orange-100 text-orange-700 border-orange-200", badge: "bg-orange-500", dot: "bg-orange-400" },
};

// ── Mock data ─────────────────────────────────────────────────────────────────

const PRODUTOS: ProdutoIncentivado[] = [
  { id: "1",  sku: "TV-50-4K",    nome: 'Smart TV 50"',          categoria: "Eletrônicos",      tier: "Especial", pontosPerReal: 15, bonus: 5  },
  { id: "2",  sku: "AIRFRY-XL",   nome: "Air Fryer XL",          categoria: "Eletrodomésticos", tier: "Ouro",     pontosPerReal: 10, bonus: 3  },
  { id: "3",  sku: "FONE-BT-02",  nome: "Fone Bluetooth",        categoria: "Eletrônicos",      tier: "Prata",    pontosPerReal: 5,  bonus: 2  },
  { id: "4",  sku: "KIT-SKIN-01", nome: "Kit Skincare",          categoria: "Beleza",           tier: "Bronze",   pontosPerReal: 1,  bonus: null },
  { id: "5",  sku: "TEN-RUN-42",  nome: "Tênis Running",         categoria: "Esportes",         tier: "Especial", pontosPerReal: 15, bonus: 5  },
  { id: "6",  sku: "CAFE-PRE-01", nome: "Cafeteira Premium",     categoria: "Eletrodomésticos", tier: "Ouro",     pontosPerReal: 10, bonus: 3  },
  { id: "7",  sku: "MOCH-EXE-01", nome: "Mochila Executiva",     categoria: "Acessórios",       tier: "Prata",    pontosPerReal: 5,  bonus: null },
  { id: "8",  sku: "MON-27-4K",   nome: 'Monitor 27" 4K',        categoria: "Eletrônicos",      tier: "Especial", pontosPerReal: 15, bonus: 5  },
  { id: "9",  sku: "ASPI-ROB-01", nome: "Aspirador Robô",        categoria: "Eletrodomésticos", tier: "Ouro",     pontosPerReal: 10, bonus: 3  },
  { id: "10", sku: "CADG-EXE-01", nome: "Cadeira Gamer Pro",     categoria: "Móveis",           tier: "Prata",    pontosPerReal: 5,  bonus: 2  },
  { id: "11", sku: "GEIG-PORT-01",nome: "Geladeira Frost Free",  categoria: "Eletrodomésticos", tier: "Especial", pontosPerReal: 15, bonus: 5  },
  { id: "12", sku: "BOLS-COURO",  nome: "Bolsa de Couro",        categoria: "Acessórios",       tier: "Bronze",   pontosPerReal: 1,  bonus: null },
];

const CATEGORIAS = [...new Set(PRODUTOS.map(p => p.categoria))].sort();
const TIERS: Tier[] = ["Especial", "Ouro", "Prata", "Bronze"];

// ── Cores de gradiente por tier para simulação de imagem ──────────────────────

const TIER_GRADIENT: Record<Tier, string> = {
  Especial: "from-violet-400 to-violet-600",
  Ouro:     "from-amber-300  to-amber-500",
  Prata:    "from-slate-300  to-slate-500",
  Bronze:   "from-orange-300 to-orange-500",
};

// ── Card ──────────────────────────────────────────────────────────────────────

function ProdutoCard({ produto, onAdicionar }: { produto: ProdutoIncentivado; onAdicionar: () => void }) {
  const [qtd, setQtd] = useState(1);
  const tier = TIER_CONFIG[produto.tier];

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Imagem / placeholder */}
      <div className={`relative bg-gradient-to-br ${TIER_GRADIENT[produto.tier]} aspect-[4/3] flex items-center justify-center`}>
        {/* Badge de bônus */}
        {produto.bonus && (
          <span className="absolute top-2 left-2 rounded-full bg-white/90 text-[10px] font-bold px-2 py-0.5 text-foreground shadow-sm">
            +{produto.bonus}% de bônus
          </span>
        )}
        {/* Ícone placeholder */}
        <div className="text-white/30 text-5xl select-none">
          {produto.categoria === "Eletrônicos" ? "📺"
            : produto.categoria === "Eletrodomésticos" ? "🏠"
            : produto.categoria === "Beleza" ? "✨"
            : produto.categoria === "Esportes" ? "👟"
            : produto.categoria === "Acessórios" ? "👜"
            : produto.categoria === "Móveis" ? "🪑"
            : "📦"}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        {/* Tier badge */}
        <span className={`self-start inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tier.cor}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${tier.dot}`} />
          {produto.tier}
        </span>

        {/* Nome */}
        <p className="text-sm font-semibold leading-snug line-clamp-2">{produto.nome}</p>

        {/* Pontuação */}
        <div className="rounded-lg bg-muted/40 px-3 py-2 space-y-0.5">
          <p className="text-xs text-muted-foreground">
            1 real = <strong className="text-foreground">{produto.pontosPerReal} {MOEDA.nome}</strong>
          </p>
          {produto.bonus && (
            <p className="text-xs text-muted-foreground">
              Bônus: <strong className="text-emerald-600">+{produto.bonus}%</strong>
            </p>
          )}
        </div>

        <div className="mt-auto space-y-2">
          {/* Contador de quantidade */}
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-1.5">
            <button
              onClick={() => setQtd(q => Math.max(1, q - 1))}
              className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-base leading-none"
            >
              −
            </button>
            <span className="text-sm font-semibold tabular-nums">{String(qtd).padStart(2, "0")}</span>
            <button
              onClick={() => setQtd(q => q + 1)}
              className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-base leading-none"
            >
              +
            </button>
          </div>

          {/* Botão adicionar */}
          <button
            onClick={onAdicionar}
            className="w-full rounded-lg bg-primary text-primary-foreground py-2 text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PortalProdutos() {
  const [search, setSearch] = useState("");
  const [tiersSel, setTiersSel] = useState<Set<Tier>>(new Set());
  const [categoriaSel, setCategoriaSel] = useState<Set<string>>(new Set());
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [orcamento, setOrcamento] = useState<string[]>([]);

  function toggleTier(t: Tier) {
    setTiersSel(prev => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  }

  function toggleCategoria(c: string) {
    setCategoriaSel(prev => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  }

  function limparFiltros() {
    setTiersSel(new Set());
    setCategoriaSel(new Set());
    setSearch("");
  }

  function adicionarAoOrcamento(produto: ProdutoIncentivado) {
    setOrcamento(prev => [...prev, produto.id]);
    toast.success(`${produto.nome} adicionado ao orçamento`);
  }

  const filtrados = useMemo(() => PRODUTOS.filter(p => {
    const matchSearch = !search || p.nome.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchTier = tiersSel.size === 0 || tiersSel.has(p.tier);
    const matchCat = categoriaSel.size === 0 || categoriaSel.has(p.categoria);
    return matchSearch && matchTier && matchCat;
  }), [search, tiersSel, categoriaSel]);

  const temFiltroAtivo = tiersSel.size > 0 || categoriaSel.size > 0 || search;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Produtos incentivados</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Veja quantos {MOEDA.nome.toLowerCase()} você ganha em cada produto da campanha ativa.
          </p>
        </div>
        {orcamento.length > 0 && (
          <button className="flex items-center gap-2 rounded-lg border border-primary bg-primary/5 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors shrink-0">
            <ShoppingCart className="h-3.5 w-3.5" />
            Orçamento ({orcamento.length})
          </button>
        )}
      </div>

      {/* Busca + filtros mobile */}
      <div className="flex gap-2">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Procure por um produto…" />
        </div>
        <button
          onClick={() => setFiltrosAbertos(v => !v)}
          className={`md:hidden flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            filtrosAbertos || temFiltroAtivo ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {(tiersSel.size + categoriaSel.size) > 0 && (
            <span className="rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1.5">{tiersSel.size + categoriaSel.size}</span>
          )}
        </button>
      </div>

      <div className="flex gap-6">
        {/* ── Sidebar de filtros ── */}
        <aside className={`shrink-0 w-44 space-y-5 ${filtrosAbertos ? "block" : "hidden md:block"}`}>

          {/* Limpar filtros */}
          {temFiltroAtivo && (
            <button onClick={limparFiltros} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-3 w-3" /> Limpar filtros
            </button>
          )}

          {/* Incentivo / Tier */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Incentivo</p>
            <div className="space-y-1.5">
              {TIERS.map(t => {
                const cfg = TIER_CONFIG[t];
                return (
                  <label key={t} className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={tiersSel.has(t)} onChange={() => toggleTier(t)}
                      className="accent-primary h-3.5 w-3.5 rounded" />
                    <span className="flex items-center gap-1.5 text-sm text-foreground">
                      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                      {t}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Categoria</p>
            <div className="space-y-1.5">
              {CATEGORIAS.map(c => (
                <label key={c} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={categoriaSel.has(c)} onChange={() => toggleCategoria(c)}
                    className="accent-primary h-3.5 w-3.5 rounded" />
                  <span className="text-sm text-foreground">{c}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Grid de produtos ── */}
        <div className="flex-1 min-w-0">
          {filtrados.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <p className="text-muted-foreground text-sm">Nenhum produto encontrado.</p>
              {temFiltroAtivo && (
                <button onClick={limparFiltros} className="text-xs text-primary hover:underline">
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-4">{filtrados.length} produto(s) encontrado(s)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filtrados.map(p => (
                  <ProdutoCard key={p.id} produto={p} onAdicionar={() => adicionarAoOrcamento(p)} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
