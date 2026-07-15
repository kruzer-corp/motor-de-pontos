import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Badge, Button, PageHeader, Pill,
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@kruzer/ds";
import { Archive, Monitor, RotateCcw, ShoppingCart, Smartphone, Sparkles, Store } from "lucide-react";
import { renderCrumbLink } from "../lib/crumbLink";
import { MOEDA } from "../config/programa";

// ── Tipos alinhados com CampanhasNova Form ────────────────────────────────────

type CampStatus  = "ativa" | "pausada" | "rascunho" | "encerrada" | "arquivada";
type FonteKey    = "portal" | "pdv" | "ecommerce" | "marketplace";

type Campaign = {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  status: CampStatus;
  segmento: string;
  vigenciaInicio: string;
  vigenciaFim: string;
  fontes: Record<FonteKey, boolean>;
  taxaTipo: "taxa" | "fixo";
  taxaValor: string;
  moedaCampanha: string;
  multAlvo: "membro" | "produto";
  multBronze: string; multPrata: string; multOuro: string; multDiamante: string;
  limiteAtivo: boolean;
  limitePts: string;
  limiteEscopo: "membro_campanha" | "membro_dia";
  tetoEmissaoAtivo: boolean;
  tetoEmissaoPts: string;
  color: string;
};

// ── Mock data ─────────────────────────────────────────────────────────────────

const INITIAL: Campaign[] = [
  {
    id: "CMP-001", codigo: "BOAS-VINDAS", nome: "Bônus de Boas-vindas", status: "ativa",
    descricao: "Pontos na primeira compra de cada novo membro.",
    segmento: "todos", vigenciaInicio: "01/01/2026", vigenciaFim: "31/12/2026",
    fontes: { portal: true, pdv: false, ecommerce: true, marketplace: false },
    taxaTipo: "taxa", taxaValor: "1", moedaCampanha: "Pontos",
    multAlvo: "membro", multBronze: "1", multPrata: "1", multOuro: "1", multDiamante: "1",
    limiteAtivo: true, limitePts: "500", limiteEscopo: "membro_campanha",
    tetoEmissaoAtivo: false, tetoEmissaoPts: "",
    color: "bg-emerald-500",
  },
  {
    id: "CMP-002", codigo: "ANIVERSARIO", nome: "Dobro no Aniversário", status: "ativa",
    descricao: "2× pontos em todos os pedidos feitos no mês de aniversário do membro.",
    segmento: "todos", vigenciaInicio: "01/01/2026", vigenciaFim: "31/12/2026",
    fontes: { portal: true, pdv: true, ecommerce: true, marketplace: false },
    taxaTipo: "taxa", taxaValor: "2", moedaCampanha: "Pontos",
    multAlvo: "membro", multBronze: "1", multPrata: "1", multOuro: "1", multDiamante: "1",
    limiteAtivo: true, limitePts: "2000", limiteEscopo: "membro_campanha",
    tetoEmissaoAtivo: false, tetoEmissaoPts: "",
    color: "bg-violet-500",
  },
  {
    id: "CMP-003", codigo: "VERAO26", nome: "Lançamento Verão", status: "ativa",
    descricao: "Campanha sazonal com multiplicadores por tier e teto de emissão.",
    segmento: "todos", vigenciaInicio: "01/07/2026", vigenciaFim: "31/08/2026",
    fontes: { portal: true, pdv: false, ecommerce: true, marketplace: true },
    taxaTipo: "taxa", taxaValor: "1", moedaCampanha: "Pontos",
    multAlvo: "membro", multBronze: "1", multPrata: "1.25", multOuro: "1.5", multDiamante: "2",
    limiteAtivo: false, limitePts: "", limiteEscopo: "membro_campanha",
    tetoEmissaoAtivo: true, tetoEmissaoPts: "500000",
    color: "bg-sky-500",
  },
  {
    id: "CMP-004", codigo: "PARCEIRO-REC", nome: "Parceiro Recorrente", status: "rascunho",
    descricao: "Pontos extras para afiliados com compras recorrentes pelo PDV.",
    segmento: "arquiteto", vigenciaInicio: "", vigenciaFim: "",
    fontes: { portal: false, pdv: true, ecommerce: false, marketplace: false },
    taxaTipo: "taxa", taxaValor: "1.5", moedaCampanha: "Pontos",
    multAlvo: "membro", multBronze: "1", multPrata: "1.25", multOuro: "1.5", multDiamante: "2",
    limiteAtivo: true, limitePts: "3000", limiteEscopo: "membro_dia",
    tetoEmissaoAtivo: true, tetoEmissaoPts: "200000",
    color: "bg-blue-500",
  },
  {
    id: "CMP-005", codigo: "SUPER-JUN", nome: "Super Junho", status: "encerrada",
    descricao: "2× pontos em Eletrônicos durante todo o mês de junho.",
    segmento: "todos", vigenciaInicio: "01/06/2026", vigenciaFim: "30/06/2026",
    fontes: { portal: true, pdv: true, ecommerce: false, marketplace: false },
    taxaTipo: "taxa", taxaValor: "2", moedaCampanha: "Pontos",
    multAlvo: "membro", multBronze: "1", multPrata: "1.25", multOuro: "1.5", multDiamante: "2",
    limiteAtivo: true, limitePts: "5000", limiteEscopo: "membro_campanha",
    tetoEmissaoAtivo: true, tetoEmissaoPts: "300000",
    color: "bg-amber-500",
  },
  {
    id: "CMP-006", codigo: "MAE25", nome: "Dia das Mães 2025", status: "arquivada",
    descricao: "Pontos em dobro para compras de presente no Dia das Mães.",
    segmento: "todos", vigenciaInicio: "05/05/2025", vigenciaFim: "12/05/2025",
    fontes: { portal: true, pdv: false, ecommerce: true, marketplace: false },
    taxaTipo: "taxa", taxaValor: "2", moedaCampanha: "Pontos",
    multAlvo: "membro", multBronze: "1", multPrata: "1", multOuro: "1", multDiamante: "1",
    limiteAtivo: false, limitePts: "", limiteEscopo: "membro_campanha",
    tetoEmissaoAtivo: false, tetoEmissaoPts: "",
    color: "bg-pink-500",
  },
];

// ── Status ────────────────────────────────────────────────────────────────────

const STATUS_PILL: Record<CampStatus, { color: "success" | "warning" | "muted" | "danger" | "primary"; dot: boolean }> = {
  ativa:     { color: "success", dot: true  },
  pausada:   { color: "warning", dot: false },
  rascunho:  { color: "primary", dot: false },
  encerrada: { color: "danger",  dot: false },
  arquivada: { color: "muted",   dot: false },
};

const STATUS_LABEL: Record<CampStatus, string> = {
  ativa: "Ativa", pausada: "Pausada", rascunho: "Rascunho", encerrada: "Encerrada", arquivada: "Arquivada",
};

// ── Fontes ────────────────────────────────────────────────────────────────────

const FONTE_META: { key: FonteKey; label: string; icon: React.ElementType }[] = [
  { key: "portal",      label: "Portal",      icon: Monitor     },
  { key: "pdv",         label: "PDV",         icon: Store       },
  { key: "ecommerce",   label: "E-commerce",  icon: ShoppingCart},
  { key: "marketplace", label: "Marketplace", icon: Smartphone  },
];

// ── Campaign card ─────────────────────────────────────────────────────────────

function CampCard({ c, onArchive, onUnarchive, onDuplicate, onPublish }: {
  c: Campaign;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDuplicate: (c: Campaign) => void;
  onPublish: (id: string) => void;
}) {
  const sp = STATUS_PILL[c.status];
  const fontesAtivas = FONTE_META.filter(f => c.fontes[f.key]);

  const taxaLabel = c.taxaTipo === "taxa"
    ? `${c.taxaValor} ${MOEDA.abrev} / R$1`
    : `${c.taxaValor} ${MOEDA.abrev} fixos`;

  const multLabel = c.multAlvo === "membro"
    ? `${c.multBronze}×–${c.multDiamante}× por tier`
    : "por produto";

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
      <div className={`h-1.5 ${c.color}`} />

      <div className="px-5 pt-4 pb-3 flex-1 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm">{c.nome}</p>
              <Pill color={sp.color} variant="soft" size="sm" dot={sp.dot}>{STATUS_LABEL[c.status]}</Pill>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{c.descricao}</p>
          </div>
        </div>

        {/* Key metrics chips */}
        <div className="flex flex-wrap gap-1.5">
          {/* Período */}
          {c.vigenciaInicio && (
            <span className="text-xs border border-border rounded px-2 py-0.5 text-muted-foreground">
              {c.vigenciaInicio} – {c.vigenciaFim}
            </span>
          )}
          {/* Segmento */}
          {c.segmento !== "todos" && (
            <span className="text-xs border border-border rounded px-2 py-0.5 text-muted-foreground capitalize">
              {c.segmento}
            </span>
          )}
          {/* Taxa */}
          <span className="text-xs border border-border rounded px-2 py-0.5 text-muted-foreground">
            {taxaLabel}
          </span>
          {/* Mult */}
          {(c.multBronze !== c.multDiamante || c.multBronze !== "1") && (
            <span className="text-xs border border-border rounded px-2 py-0.5 text-muted-foreground">
              {multLabel}
            </span>
          )}
          {/* Limite por membro */}
          {c.limiteAtivo && c.limitePts && (
            <span className="text-xs border border-amber-200 bg-amber-50 rounded px-2 py-0.5 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
              Lim. {Number(c.limitePts).toLocaleString("pt-BR")} {MOEDA.abrev}
              {c.limiteEscopo === "membro_dia" ? "/dia" : ""}
            </span>
          )}
          {/* Teto de emissão */}
          {c.tetoEmissaoAtivo && c.tetoEmissaoPts && (
            <span className="text-xs border border-rose-200 bg-rose-50 rounded px-2 py-0.5 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400">
              Teto {Number(c.tetoEmissaoPts).toLocaleString("pt-BR")} {MOEDA.abrev}
            </span>
          )}
        </div>

        {/* Fontes */}
        {fontesAtivas.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Fontes:</span>
            {fontesAtivas.map(f => {
              const Icon = f.icon;
              return (
                <span key={f.key} className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">
                  <Icon className="size-3" />{f.label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-5 py-3 gap-2">
        <span className="text-xs text-muted-foreground font-mono">{c.codigo}</span>
        <div className="flex gap-2">
          {c.status === "rascunho" && (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onPublish(c.id)}>
              Publicar
            </Button>
          )}
          {c.status === "encerrada" && (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onArchive(c.id)}>
              <Archive className="size-3 mr-1" />Arquivar
            </Button>
          )}
          {c.status !== "arquivada" && c.status !== "rascunho" && (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onDuplicate(c)}>
              Duplicar
            </Button>
          )}
          {c.status === "arquivada" && (
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => onUnarchive(c.id)}>
              <RotateCcw className="size-3 mr-1" />Desarquivar
            </Button>
          )}
          <Button asChild variant="outline" size="sm" className="h-7 text-xs">
            <Link to={`/campanhas/${c.id}`}>
              {c.status === "rascunho" ? "Continuar editando" : "Ver detalhes"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Campanhas() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL);

  const ativas    = campaigns.filter(c => c.status === "ativa" || c.status === "pausada" || c.status === "encerrada");
  const rascunhos = campaigns.filter(c => c.status === "rascunho");
  const arquivadas = campaigns.filter(c => c.status === "arquivada");

  function archive(id: string) {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: "arquivada" } : c));
  }

  function unarchive(id: string) {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: "encerrada" } : c));
  }

  function publish(id: string) {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: "ativa" } : c));
  }

  function duplicate(orig: Campaign) {
    const id = `${orig.id}-copia`;
    const copy: Campaign = {
      ...orig,
      id,
      codigo: `${orig.codigo}-COPIA`,
      nome: `${orig.nome} (cópia)`,
      status: "rascunho",
      vigenciaInicio: "",
      vigenciaFim: "",
    };
    setCampaigns(prev => [...prev, copy]);
  }

  const shared = { onArchive: archive, onUnarchive: unarchive, onDuplicate: duplicate, onPublish: publish };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Campanhas"
        path={[{ label: "Operação" }]}
        renderCrumbLink={renderCrumbLink}
        description="Regras de acúmulo ativas, pausadas e encerradas."
        actions={
          <Button asChild size="sm">
            <Link to="/campanhas/nova">
              <Sparkles className="mr-1.5 h-4 w-4" />
              Nova campanha
            </Link>
          </Button>
        }
      />

      <Tabs defaultValue="ativas">
        <TabsList>
          <TabsTrigger value="ativas">
            Ativas / Encerradas
            <Badge variant="secondary" className="ml-1.5">{ativas.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rascunhos">
            Rascunhos
            {rascunhos.length > 0 && <Badge variant="secondary" className="ml-1.5">{rascunhos.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="arquivadas">
            <Archive className="size-3.5 mr-1.5" />
            Arquivadas ({arquivadas.length})
          </TabsTrigger>
        </TabsList>

        {/* Ativas */}
        <TabsContent value="ativas" className="mt-4">
          {ativas.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border py-16 text-center space-y-3">
              <Sparkles className="mx-auto size-10 text-muted-foreground/30" />
              <p className="text-sm font-medium">Nenhuma campanha ainda</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Crie sua primeira campanha usando o wizard — leva menos de 5 minutos.
              </p>
              <Button asChild size="sm" className="mt-2">
                <Link to="/campanhas/nova">
                  <Sparkles className="size-3.5 mr-1.5" />Criar primeira campanha
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {ativas.map(c => <CampCard key={c.id} c={c} {...shared} />)}
            </div>
          )}
        </TabsContent>

        {/* Rascunhos */}
        <TabsContent value="rascunhos" className="mt-4">
          {rascunhos.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border py-14 text-center space-y-2">
              <p className="text-sm font-medium">Nenhum rascunho salvo</p>
              <p className="text-xs text-muted-foreground">Salve uma campanha incompleta para ela aparecer aqui.</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {rascunhos.map(c => <CampCard key={c.id} c={c} {...shared} />)}
            </div>
          )}
        </TabsContent>

        {/* Arquivadas */}
        <TabsContent value="arquivadas" className="mt-4">
          {arquivadas.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Nenhuma campanha arquivada.</div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2 opacity-70">
              {arquivadas.map(c => <CampCard key={c.id} c={c} {...shared} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
