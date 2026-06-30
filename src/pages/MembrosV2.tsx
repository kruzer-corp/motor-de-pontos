import { useMemo, useState } from "react";
import { Pencil, SearchX, UserPlus, Users } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  Button,
  EmptyState,
  InfoNotice,
  PageHeader,
  Pill,
  SearchInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SortableTableHead,
  StatusBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TablePagination,
  TableRow,
} from "@kruzer/ds";

type Tier    = "Diamante" | "Ouro" | "Prata" | "Bronze";
type Segment = "Premium" | "Frete Grátis" | "Fidelidade" | "Básico";
type SortKey = "name" | "balance";
type SortDir = "asc" | "desc";

interface Member {
  id: string;
  name: string;
  initials: string;
  balance: number;
  tier: Tier;
  segment: Segment;
  joinedAt: string;
  active: boolean;
}

const MEMBERS: Member[] = [
  { id: "1",  name: "Aline P.",    initials: "AP", balance: 5200, tier: "Diamante", segment: "Premium",      joinedAt: "12/04/2025", active: true  },
  { id: "2",  name: "Bruno C.",    initials: "BC", balance: 3200, tier: "Ouro",     segment: "Frete Grátis", joinedAt: "22/01/2025", active: true  },
  { id: "3",  name: "Cecília M.",  initials: "CM", balance: 1800, tier: "Prata",    segment: "Fidelidade",   joinedAt: "03/08/2024", active: false },
  { id: "4",  name: "Danilo R.",   initials: "DR", balance:  760, tier: "Bronze",   segment: "Básico",       joinedAt: "17/03/2025", active: true  },
  { id: "5",  name: "Elisa T.",    initials: "ET", balance: 4800, tier: "Diamante", segment: "Premium",      joinedAt: "05/02/2025", active: true  },
  { id: "6",  name: "Felipe N.",   initials: "FN", balance: 2900, tier: "Ouro",     segment: "Fidelidade",   joinedAt: "11/11/2024", active: false },
  { id: "7",  name: "Gabriela S.", initials: "GS", balance: 1200, tier: "Prata",    segment: "Básico",       joinedAt: "29/06/2024", active: true  },
  { id: "8",  name: "Henrique L.", initials: "HL", balance:  450, tier: "Bronze",   segment: "Frete Grátis", joinedAt: "08/04/2025", active: false },
  { id: "9",  name: "Isabela F.",  initials: "IF", balance: 6100, tier: "Diamante", segment: "Premium",      joinedAt: "14/01/2025", active: true  },
  { id: "10", name: "Jorge M.",    initials: "JM", balance: 3700, tier: "Ouro",     segment: "Fidelidade",   joinedAt: "20/09/2024", active: true  },
  { id: "11", name: "Karla B.",    initials: "KB", balance: 1500, tier: "Prata",    segment: "Básico",       joinedAt: "02/05/2024", active: true  },
  { id: "12", name: "Lucas V.",    initials: "LV", balance:  890, tier: "Bronze",   segment: "Frete Grátis", joinedAt: "25/02/2025", active: false },
];

const TIER_PILL: Record<Tier, "primary" | "warning" | "secondary" | "muted"> = {
  Diamante: "primary",
  Ouro:     "warning",
  Prata:    "secondary",
  Bronze:   "muted",
};

const TIERS: Tier[]       = ["Diamante", "Ouro", "Prata", "Bronze"];
const SEGMENTS: Segment[] = ["Premium", "Frete Grátis", "Fidelidade", "Básico"];

export default function MembrosV2() {
  const [search, setSearch]     = useState("");
  const [tier, setTier]         = useState<Tier | "all">("all");
  const [segment, setSegment]   = useState<Segment | "all">("all");
  const [sort, setSort]         = useState<{ key: SortKey; direction: SortDir } | null>(null);
  const [page, setPage]         = useState(1);
  const [perPage, setPerPage]   = useState(10);

  const hasActiveFilter = !!search || tier !== "all" || segment !== "all";

  const rows = useMemo(() => {
    let result = MEMBERS;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.name.toLowerCase().includes(q));
    }
    if (tier !== "all")    result = result.filter((m) => m.tier === tier);
    if (segment !== "all") result = result.filter((m) => m.segment === segment);

    if (sort) {
      const dir = sort.direction === "asc" ? 1 : -1;
      result = [...result].sort((a, b) =>
        sort.key === "name"
          ? dir * a.name.localeCompare(b.name)
          : dir * (a.balance - b.balance)
      );
    }

    return result;
  }, [search, tier, segment, sort]);

  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const sliceStart = (page - 1) * perPage;
  const sliceEnd   = Math.min(sliceStart + perPage, rows.length);
  const pageRows   = rows.slice(sliceStart, sliceEnd);

  function handleSort(key: string) {
    setSort((prev) =>
      prev?.key === key
        ? { key: key as SortKey, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key: key as SortKey, direction: "asc" }
    );
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Membros"
        path={[{ label: "Operação" }]}
        description={`${MEMBERS.length} membros registrados no programa`}
        actions={
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Registrar membro
          </Button>
        }
      />

      <InfoNotice variant="info" title="Visão administrativa">
        Membros não acessam esta interface. Eles participam do programa pelo canal próprio (loja, app ou dispositivo). Aqui você consulta e gerencia os registros e transações deles.
      </InfoNotice>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {/* toolbar flat */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Buscar por nome…"
            className="w-64"
          />
          <div className="w-44 shrink-0">
            <Select value={tier} onValueChange={(v) => { setTier(v as Tier | "all"); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tiers</SelectItem>
                {TIERS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-48 shrink-0">
            <Select value={segment} onValueChange={(v) => { setSegment(v as Segment | "all"); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os segmentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os segmentos</SelectItem>
                {SEGMENTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={hasActiveFilter ? SearchX : Users}
              title={hasActiveFilter ? "Nenhum membro encontrado" : "Nenhum membro ainda"}
              description={
                hasActiveFilter
                  ? "Tente ajustar os filtros ou usar outro termo de busca."
                  : "Os membros aparecerão aqui assim que a integração estiver configurada."
              }
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead sortKey="name" currentSort={sort} onSort={handleSort} className="h-11">
                  Membro
                </SortableTableHead>
                <TableHead className="h-11">Tier</TableHead>
                <TableHead className="h-11">Segmento</TableHead>
                <SortableTableHead sortKey="balance" currentSort={sort} onSort={handleSort} className="h-11">
                  Saldo
                </SortableTableHead>
                <TableHead className="h-11">Status</TableHead>
                <TableHead className="h-11">Entrou em</TableHead>
                <TableHead className="h-11">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((member) => (
                <TableRow key={member.id} className="[&>td]:py-3.5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Pill color={TIER_PILL[member.tier]} variant="soft" size="sm">
                      {member.tier}
                    </Pill>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {member.segment}
                  </TableCell>
                  <TableCell className="tabular-nums font-medium text-sm">
                    {member.balance.toLocaleString("pt-BR")} pts
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      active={member.active}
                      activeLabel="Ativo"
                      inactiveLabel="Inativo"
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {member.joinedAt}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" aria-label="Editar membro">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {rows.length > 0 && (
          <TablePagination
            className="[border-top-color:hsl(var(--border))]"
            currentPage={page}
            totalPages={totalPages}
            totalItems={rows.length}
            itemsPerPage={perPage}
            startIndex={sliceStart + 1}
            endIndex={sliceEnd}
            onPageChange={setPage}
            onItemsPerPageChange={(v) => { setPerPage(v); setPage(1); }}
          />
        )}
      </div>
    </div>
  );
}
