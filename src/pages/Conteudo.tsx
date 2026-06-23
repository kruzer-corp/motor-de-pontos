import { useState } from "react";
import { Card, CardHeader, CardTitle, Button, Badge, Input } from "@kruzer/ds";
import { Newspaper, Plus, Pencil, Eye, Search, Archive } from "lucide-react";

type ContentStatus = "publicado" | "rascunho" | "agendado" | "arquivado";
type ContentCategory = "Dicas" | "Novidades" | "Regulamento" | "Campanhas" | "Benefícios";

type Article = {
  id: string;
  title: string;
  category: ContentCategory;
  author: string;
  publishDate: string;
  status: ContentStatus;
  views: number;
  excerpt: string;
};

const STATUS_COLOR: Record<ContentStatus, string> = {
  publicado: "bg-emerald-100 text-emerald-700",
  rascunho: "bg-amber-100 text-amber-700",
  agendado: "bg-sky-100 text-sky-700",
  arquivado: "bg-slate-100 text-slate-500",
};

const ARTICLES: Article[] = [
  {
    id: "ART-012",
    title: "Como maximizar seus pontos nas compras de junho",
    category: "Dicas",
    author: "Equipe FAST PRO",
    publishDate: "01/06/2025",
    status: "publicado",
    views: 2340,
    excerpt: "Confira nossas dicas exclusivas para aproveitar ao máximo as campanhas de junho e turbinar seu saldo de pontos.",
  },
  {
    id: "ART-011",
    title: "Novo nível Diamante: conheça os benefícios",
    category: "Novidades",
    author: "Time de Produto",
    publishDate: "15/05/2025",
    status: "publicado",
    views: 1890,
    excerpt: "O nível Diamante chegou com benefícios exclusivos: multiplicador 3× e acesso prioritário ao catálogo de resgate.",
  },
  {
    id: "ART-010",
    title: "Regulamento atualizado — versão 2.1",
    category: "Regulamento",
    author: "Jurídico",
    publishDate: "01/01/2025",
    status: "publicado",
    views: 780,
    excerpt: "Publicamos a versão 2.1 do regulamento com ajustes nas regras de expiração de pontos e novos canais elegíveis.",
  },
  {
    id: "ART-013",
    title: "Black Friday em Julho: prepare-se!",
    category: "Campanhas",
    author: "Marketing",
    publishDate: "15/07/2025",
    status: "agendado",
    views: 0,
    excerpt: "Em julho teremos uma campanha especial com pontos em dobro em todas as categorias por 72 horas.",
  },
  {
    id: "ART-009",
    title: "5 formas de usar seus pontos para economizar",
    category: "Benefícios",
    author: "Equipe FAST PRO",
    publishDate: "10/04/2025",
    status: "publicado",
    views: 3120,
    excerpt: "Descubra as melhores formas de resgatar seus pontos: vouchers, frete grátis, cashback e mais.",
  },
  {
    id: "ART-008",
    title: "Dia das Mães — resultados da campanha",
    category: "Campanhas",
    author: "Marketing",
    publishDate: "15/05/2025",
    status: "arquivado",
    views: 540,
    excerpt: "Confira os resultados da campanha Dia das Mães: mais de 400 resgates e R$280k em pontos emitidos.",
  },
  {
    id: "ART-007",
    title: "Guia de primeiros passos no FAST PRO",
    category: "Dicas",
    author: "Equipe FAST PRO",
    publishDate: "",
    status: "rascunho",
    views: 0,
    excerpt: "Rascunho em elaboração sobre como novos membros podem começar a acumular pontos.",
  },
];

const CATEGORIES: ContentCategory[] = ["Dicas", "Novidades", "Regulamento", "Campanhas", "Benefícios"];

export default function Conteudo() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "todos">("todos");

  const filtered = ARTICLES.filter((a) => {
    const matchesQuery = !query || a.title.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "todos" || a.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const counts: Record<ContentStatus | "todos", number> = {
    todos: ARTICLES.length,
    publicado: ARTICLES.filter((a) => a.status === "publicado").length,
    rascunho: ARTICLES.filter((a) => a.status === "rascunho").length,
    agendado: ARTICLES.filter((a) => a.status === "agendado").length,
    arquivado: ARTICLES.filter((a) => a.status === "arquivado").length,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Newspaper className="size-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">Conteúdo Editorial</h2>
            <p className="text-sm text-muted-foreground">Artigos, guias e páginas do programa.</p>
          </div>
        </div>
        <Button size="sm">
          <Plus className="size-3.5 mr-1.5" />
          Novo artigo
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {(["todos", "publicado", "rascunho", "agendado", "arquivado"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s} ({counts[s]})
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-8 text-xs w-52"
            placeholder="Buscar título ou categoria…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Article list */}
      <Card>
        <div className="divide-y divide-border">
          {filtered.map((article) => (
            <div key={article.id} className="px-5 py-4 space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{article.title}</span>
                    <Badge variant="outline" className="text-xs">{article.category}</Badge>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[article.status]}`}>
                      {article.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{article.excerpt}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>{article.author}</span>
                    {article.publishDate && <span>{article.publishDate}</span>}
                    {article.views > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye className="size-3" />
                        {article.views.toLocaleString("pt-BR")} visualizações
                      </span>
                    )}
                    <span className="font-mono">{article.id}</span>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {article.status === "publicado" && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      <Eye className="size-3 mr-1" />
                      Ver
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <Pencil className="size-3 mr-1" />
                    Editar
                  </Button>
                  {article.status !== "arquivado" && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                      <Archive className="size-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Category breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Por categoria</CardTitle>
        </CardHeader>
        <div className="grid gap-3 px-5 pb-5 sm:grid-cols-5">
          {CATEGORIES.map((cat) => {
            const count = ARTICLES.filter((a) => a.category === cat).length;
            return (
              <div key={cat} className="rounded-xl bg-muted/30 px-4 py-3 text-center">
                <div className="text-xl font-bold">{count}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{cat}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
