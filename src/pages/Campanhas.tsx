import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Button, ConfirmDialog, PageHeader, Pill, SearchInput,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@kruzer/ds";
import {
  Archive, Copy, Monitor, MoreHorizontal, Pause, Play,
  RotateCcw, Rocket, ShoppingCart, Smartphone, Sparkles, Store, Trash2,
} from "lucide-react";
import { renderCrumbLink } from "../lib/crumbLink";
import { type Campanha, type CampStatus, getCampanhas, saveCampanhas } from "../lib/campanhas";

// ── Tipos ──────────────────────────────────────────────────────────────────────

type Campaign = Campanha;
type FonteKey  = "portal" | "pdv" | "ecommerce" | "marketplace";

// ── Status ────────────────────────────────────────────────────────────────────

const STATUS_PILL: Record<CampStatus, { color: "success" | "warning" | "muted" | "destructive" | "primary"; dot: boolean }> = {
  ativa:     { color: "success",     dot: true  },
  pausada:   { color: "warning",     dot: false },
  agendada:  { color: "primary",     dot: true  },
  rascunho:  { color: "primary",     dot: false },
  encerrada: { color: "destructive", dot: false },
  arquivada: { color: "muted",       dot: false },
};

const STATUS_LABEL: Record<CampStatus, string> = {
  ativa: "Ativa", pausada: "Pausada", agendada: "Agendada", rascunho: "Rascunho", encerrada: "Encerrada", arquivada: "Arquivada",
};

const STATUS_FILTRO_OPCOES: ("todos" | CampStatus)[] = ["todos", "ativa", "pausada", "agendada", "rascunho", "encerrada", "arquivada"];

// ── Fontes ────────────────────────────────────────────────────────────────────

const FONTE_META: { key: FonteKey; label: string; icon: React.ElementType }[] = [
  { key: "portal",      label: "Portal",      icon: Monitor     },
  { key: "pdv",         label: "PDV",         icon: Store       },
  { key: "ecommerce",   label: "E-commerce",  icon: ShoppingCart},
  { key: "marketplace", label: "Marketplace", icon: Smartphone  },
];

// ── Campaign row ──────────────────────────────────────────────────────────────

function CampRow({ c, onArchive, onUnarchive, onDuplicate, onPublish, onPause, onReactivate, onDelete }: {
  c: Campaign;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDuplicate: (c: Campaign) => void;
  onPublish: (id: string) => void;
  onPause: (id: string) => void;
  onReactivate: (id: string) => void;
  onDelete: (c: Campaign) => void;
}) {
  const sp = STATUS_PILL[c.status];
  const fontesAtivas = FONTE_META.filter(f => c.fontes[f.key]);

  return (
    <TableRow className={`[&>td]:py-3.5 ${c.status === "arquivada" ? "opacity-60" : ""}`}>
      <TableCell>
        <span className={`inline-block h-2 w-2 rounded-full shrink-0 ${c.color}`} />
      </TableCell>
      <TableCell className="max-w-xs">
        <p className="font-medium text-sm">{c.nome}</p>
        <p className="text-xs text-muted-foreground font-mono">{c.codigo}</p>
      </TableCell>
      <TableCell>
        <Pill color={sp.color} variant="soft" size="sm" dot={sp.dot}>{STATUS_LABEL[c.status]}</Pill>
        {c.status === "agendada" && c.agendadaPara && (
          <p className="text-xs text-muted-foreground mt-1 whitespace-nowrap">Para {c.agendadaPara}</p>
        )}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
        {c.periodoInicio ? `${c.periodoInicio} – ${c.periodoFim}` : "—"}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground capitalize">
        {c.segmento !== "todos" ? c.segmento : "Todos"}
      </TableCell>
      <TableCell>
        {fontesAtivas.length > 0 ? (
          <div className="flex items-center gap-1">
            {fontesAtivas.map(f => {
              const Icon = f.icon;
              return <Icon key={f.key} className="size-3.5 text-muted-foreground" aria-label={f.label} />;
            })}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1.5">
          <Button asChild variant="outline" size="sm" className="h-7 text-xs">
            <Link to={`/campanhas/${c.id}`}>
              {c.status === "rascunho" ? "Continuar editando" : "Ver detalhes"}
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {c.status === "rascunho" && (
                <DropdownMenuItem onClick={() => onPublish(c.id)}>
                  <Rocket className="size-3.5 mr-2" />Publicar
                </DropdownMenuItem>
              )}
              {c.status === "agendada" && (
                <DropdownMenuItem onClick={() => onPublish(c.id)}>
                  <Rocket className="size-3.5 mr-2" />Publicar agora
                </DropdownMenuItem>
              )}
              {c.status === "ativa" && (
                <DropdownMenuItem onClick={() => onPause(c.id)}>
                  <Pause className="size-3.5 mr-2" />Pausar
                </DropdownMenuItem>
              )}
              {c.status === "pausada" && (
                <DropdownMenuItem onClick={() => onReactivate(c.id)}>
                  <Play className="size-3.5 mr-2" />Reativar
                </DropdownMenuItem>
              )}
              {c.status === "encerrada" && (
                <DropdownMenuItem onClick={() => onArchive(c.id)}>
                  <Archive className="size-3.5 mr-2" />Arquivar
                </DropdownMenuItem>
              )}
              {c.status !== "arquivada" && c.status !== "rascunho" && (
                <DropdownMenuItem onClick={() => onDuplicate(c)}>
                  <Copy className="size-3.5 mr-2" />Duplicar
                </DropdownMenuItem>
              )}
              {c.status === "arquivada" && (
                <DropdownMenuItem onClick={() => onUnarchive(c.id)}>
                  <RotateCcw className="size-3.5 mr-2" />Desarquivar
                </DropdownMenuItem>
              )}
              {c.status === "rascunho" && (
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(c)}>
                  <Trash2 className="size-3.5 mr-2" />Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Campanhas() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => getCampanhas());
  const [query, setQuery] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<"todos" | CampStatus>("todos");
  const [aExcluir, setAExcluir] = useState<Campaign | null>(null);

  function persist(next: Campaign[]) {
    setCampaigns(next);
    saveCampanhas(next);
  }

  function archive(id: string) {
    persist(campaigns.map(c => c.id === id ? { ...c, status: "arquivada" } : c));
  }

  function unarchive(id: string) {
    persist(campaigns.map(c => c.id === id ? { ...c, status: "encerrada" } : c));
  }

  function publish(id: string) {
    persist(campaigns.map(c => c.id === id ? { ...c, status: "ativa", agendadaPara: undefined } : c));
  }

  function pause(id: string) {
    persist(campaigns.map(c => c.id === id ? { ...c, status: "pausada" } : c));
  }

  function reactivate(id: string) {
    persist(campaigns.map(c => c.id === id ? { ...c, status: "ativa" } : c));
  }

  function confirmarExclusao() {
    if (!aExcluir) return;
    persist(campaigns.filter(c => c.id !== aExcluir.id));
    setAExcluir(null);
  }

  function duplicate(orig: Campaign) {
    const id = `${orig.id}-copia`;
    const copy: Campaign = {
      ...orig,
      id,
      codigo: `${orig.codigo}-COPIA`,
      nome: `${orig.nome} (cópia)`,
      status: "rascunho",
      periodoInicio: "",
      periodoFim: "",
      agendadaPara: undefined,
    };
    persist([...campaigns, copy]);
  }

  const shared = { onArchive: archive, onUnarchive: unarchive, onDuplicate: duplicate, onPublish: publish, onPause: pause, onReactivate: reactivate, onDelete: setAExcluir };

  const filtradas = campaigns.filter(c =>
    (statusFiltro === "todos" || c.status === statusFiltro) &&
    (!query ||
      c.nome.toLowerCase().includes(query.toLowerCase()) ||
      c.codigo.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Minhas Campanhas"
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

      {campaigns.length === 0 ? (
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
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border">
            <SearchInput value={query} onChange={setQuery} placeholder="Buscar campanha ou código…" className="w-64" />
            <div className="w-48">
              <Select value={statusFiltro} onValueChange={(v) => setStatusFiltro(v as "todos" | CampStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_FILTRO_OPCOES.map((s) => (
                    <SelectItem key={s} value={s}>{s === "todos" ? "Todos os status" : STATUS_LABEL[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="text-xs text-muted-foreground ml-auto">
              {filtradas.length} de {campaigns.length} campanha{campaigns.length > 1 ? "s" : ""}
            </span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Campanha</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vigência</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead>Fontes</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10">
                    Nenhuma campanha encontrada para esse filtro.
                  </TableCell>
                </TableRow>
              ) : (
                filtradas.map(c => <CampRow key={c.id} c={c} {...shared} />)
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={aExcluir !== null}
        onOpenChange={(open) => { if (!open) setAExcluir(null); }}
        title={`Excluir rascunho "${aExcluir?.nome}"?`}
        description="Essa ação não pode ser desfeita. O rascunho será removido permanentemente da lista."
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={confirmarExclusao}
      />
    </div>
  );
}
