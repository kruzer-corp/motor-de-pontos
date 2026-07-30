import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from "@kruzer/ds";
import { RefreshCw, CheckCheck, AlertTriangle, Upload, Package } from "lucide-react";
import { ehV1 } from "../lib/versao";

type FeedStatus = "sincronizado" | "pendente" | "erro" | "sincronizando";

type Feed = {
  id: string;
  name: string;
  source: string;
  products: number;
  lastSync: string;
  status: FeedStatus;
  newItems: number;
  removedItems: number;
};

const STATUS_CONFIG: Record<FeedStatus, { label: string; color: string }> = {
  sincronizado: { label: "Sincronizado", color: "bg-emerald-100 text-emerald-700" },
  pendente: { label: "Pendente", color: "bg-amber-100 text-amber-700" },
  erro: { label: "Erro", color: "bg-red-100 text-red-600" },
  sincronizando: { label: "Sincronizando…", color: "bg-sky-100 text-sky-700" },
};

const INITIAL_FEEDS: Feed[] = [
  {
    id: "FEED-001",
    name: "FAST PRO — Catálogo Principal",
    source: "API REST v3",
    products: 1248,
    lastSync: "16/06/2025 02:00",
    status: "sincronizado",
    newItems: 0,
    removedItems: 0,
  },
  {
    id: "FEED-002",
    name: "Samsung — Produtos Incentivados",
    source: "SFTP / CSV",
    products: 87,
    lastSync: "14/06/2025 18:30",
    status: "pendente",
    newItems: 12,
    removedItems: 3,
  },
  {
    id: "FEED-003",
    name: "LG Electronics — 3P",
    source: "API REST v2",
    products: 54,
    lastSync: "10/06/2025 09:15",
    status: "erro",
    newItems: 0,
    removedItems: 0,
  },
  {
    id: "FEED-004",
    name: "Philips — Linha Domésticos",
    source: "Webhook",
    products: 32,
    lastSync: "15/06/2025 12:00",
    status: "sincronizado",
    newItems: 0,
    removedItems: 0,
  },
];

type DiffItem = {
  id: string;
  name: string;
  category: string;
  points: number;
  action: "add" | "remove" | "update";
};

const PENDING_DIFF: DiffItem[] = [
  { id: "3P-SM-001", name: "Galaxy S25 Ultra", category: "Eletrônicos", points: 95000, action: "add" },
  { id: "3P-SM-002", name: "Galaxy Tab S10", category: "Eletrônicos", points: 52000, action: "add" },
  { id: "3P-SM-003", name: "Galaxy Buds 3 Pro", category: "Eletrônicos", points: 11000, action: "add" },
  { id: "3P-SM-004", name: "Smart Monitor M8", category: "Eletrônicos", points: 38000, action: "update" },
  { id: "3P-SM-005", name: "Galaxy A35 (descontinuado)", category: "Eletrônicos", points: 28000, action: "remove" },
  { id: "3P-SM-006", name: "Galaxy Watch 6 (descontinuado)", category: "Wearables", points: 18000, action: "remove" },
  { id: "3P-SM-007", name: "Galaxy Watch 7 Classic", category: "Wearables", points: 22000, action: "add" },
  { id: "3P-SM-008", name: "Soundbar Q700D", category: "Áudio", points: 35000, action: "add" },
  { id: "3P-SM-009", name: "QLED 55\" Q80D (preço atualizado)", category: "Eletrônicos", points: 68000, action: "update" },
  { id: "3P-SM-010", name: "Galaxy Fold 6", category: "Eletrônicos", points: 120000, action: "add" },
  { id: "3P-SM-011", name: "Galaxy Z Flip 6", category: "Eletrônicos", points: 88000, action: "add" },
  { id: "3P-SM-012", name: "Galaxy A55 5G (descontinuado)", category: "Eletrônicos", points: 32000, action: "remove" },
];

const DIFF_CONFIG: Record<DiffItem["action"], { label: string; color: string; rowColor: string }> = {
  add: { label: "+ Adicionar", color: "text-emerald-600", rowColor: "bg-emerald-50/40" },
  remove: { label: "− Remover", color: "text-red-500", rowColor: "bg-red-50/40" },
  update: { label: "↻ Atualizar", color: "text-sky-600", rowColor: "bg-sky-50/40" },
};

export default function CatalogoAtualizacao() {
  const [feeds, setFeeds] = useState(() => (ehV1() ? [] : INITIAL_FEEDS));
  const [selectedFeed, setSelectedFeed] = useState<string | null>("FEED-002");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const syncFeed = (id: string) => {
    setFeeds((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: "sincronizando" as FeedStatus } : f
      )
    );
    setTimeout(() => {
      setFeeds((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, status: "sincronizado" as FeedStatus, lastSync: "agora", newItems: 0, removedItems: 0 }
            : f
        )
      );
    }, 2000);
  };

  const applyDiff = () => {
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      setApplied(true);
      setFeeds((prev) =>
        prev.map((f) =>
          f.id === "FEED-002"
            ? { ...f, status: "sincronizado" as FeedStatus, products: f.products + 9, lastSync: "agora", newItems: 0, removedItems: 0 }
            : f
        )
      );
    }, 1800);
  };

  const pending = feeds.find((f) => f.id === "FEED-002");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Package className="size-5 text-muted-foreground" />
        <div>
          <h2 className="text-lg font-semibold">Atualização de Catálogo — Produtos 3P</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie feeds de terceiros e aplique atualizações ao catálogo.
          </p>
        </div>
      </div>

      {/* Feed list */}
      <Card>
        <CardHeader>
          <CardTitle>Feeds de catálogo</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-t border-border bg-muted/20">
              <tr className="text-left text-muted-foreground">
                <th className="px-6 py-3 font-medium">Feed</th>
                <th className="px-6 py-3 font-medium">Origem</th>
                <th className="px-6 py-3 font-medium text-center">Produtos</th>
                <th className="px-6 py-3 font-medium">Última sync</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Alterações</th>
                <th className="px-6 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {feeds.map((feed) => {
                const cfg = STATUS_CONFIG[feed.status];
                return (
                  <tr
                    key={feed.id}
                    className={`hover:bg-muted/20 cursor-pointer ${selectedFeed === feed.id ? "bg-primary/5" : ""}`}
                    onClick={() => setSelectedFeed(feed.id === selectedFeed ? null : feed.id)}
                  >
                    <td className="px-6 py-3">
                      <div className="font-medium">{feed.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">{feed.id}</div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{feed.source}</td>
                    <td className="px-6 py-3 text-center tabular-nums">
                      <Badge variant="secondary">{feed.products.toLocaleString("pt-BR")}</Badge>
                    </td>
                    <td className="px-6 py-3 tabular-nums text-xs text-muted-foreground">{feed.lastSync}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}>
                        {feed.status === "erro" && <AlertTriangle className="size-3" />}
                        {feed.status === "sincronizado" && <CheckCheck className="size-3" />}
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {feed.newItems > 0 || feed.removedItems > 0 ? (
                        <div className="flex gap-2 text-xs">
                          {feed.newItems > 0 && (
                            <span className="text-emerald-600">+{feed.newItems}</span>
                          )}
                          {feed.removedItems > 0 && (
                            <span className="text-red-500">−{feed.removedItems}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={(e) => { e.stopPropagation(); syncFeed(feed.id); }}
                      >
                        <RefreshCw className={`size-3 mr-1 ${feed.status === "sincronizando" ? "animate-spin" : ""}`} />
                        Sync
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Diff panel — Samsung feed */}
      {selectedFeed === "FEED-002" && pending && !applied && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>
                Alterações pendentes — {pending.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {PENDING_DIFF.filter((d) => d.action === "add").length} adições ·{" "}
                  {PENDING_DIFF.filter((d) => d.action === "remove").length} remoções ·{" "}
                  {PENDING_DIFF.filter((d) => d.action === "update").length} atualizações
                </span>
                <Button size="sm" onClick={applyDiff} disabled={applying}>
                  <Upload className={`size-3.5 mr-1.5 ${applying ? "animate-bounce" : ""}`} />
                  {applying ? "Aplicando…" : "Aplicar ao catálogo"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/20">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">ID</th>
                    <th className="px-4 py-2.5 font-medium">Produto</th>
                    <th className="px-4 py-2.5 font-medium">Categoria</th>
                    <th className="px-4 py-2.5 font-medium text-right">Pontos</th>
                    <th className="px-4 py-2.5 font-medium">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {PENDING_DIFF.map((item) => {
                    const dcfg = DIFF_CONFIG[item.action];
                    return (
                      <tr key={item.id} className={`${dcfg.rowColor}`}>
                        <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{item.id}</td>
                        <td className="px-4 py-2.5 font-medium">{item.name}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{item.category}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums">{item.points.toLocaleString("pt-BR")} pts</td>
                        <td className={`px-4 py-2.5 font-semibold text-xs ${dcfg.color}`}>{dcfg.label}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {applied && (
        <Card className="border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCheck className="size-5 shrink-0" />
            <p className="font-medium text-sm">
              {PENDING_DIFF.length} alterações aplicadas ao catálogo com sucesso.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
