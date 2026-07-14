import { useState } from "react";
import {
  Avatar, AvatarFallback, Badge, Button, CopyButton,
  FormDrawer, InfoNotice, PageHeader, Pill, SearchInput,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Input, Label,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Tabs, TabsList, TabsTrigger, TabsContent,
  TableEmpty,
  toast,
} from "@kruzer/ds";
import { HardHat, Pencil, Plus, ShoppingBag, UserCog } from "lucide-react";
import { renderCrumbLink } from "../lib/crumbLink";

type AffStatus = "ativo" | "inativo" | "pendente";
type AffType   = "arquiteto" | "vendedor";

type Affiliate = {
  id: string; name: string; initials: string; email: string;
  type: AffType;
  coordinator: string | null; ganCode: string | null;
  status: AffStatus; joinDate: string;
};

const AFFILIATES: Affiliate[] = [
  { id: "AFI-001", name: "FAST PRO Centro", initials: "FC", email: "centro@fastpro.com.br", type: "arquiteto", coordinator: "Marcos T.",    ganCode: "GAN-SP-001", status: "ativo",    joinDate: "12/01/2025" },
  { id: "AFI-002", name: "FAST PRO Sul",    initials: "FS", email: "sul@fastpro.com.br",    type: "arquiteto", coordinator: "Fernanda G.", ganCode: "GAN-SP-002", status: "ativo",    joinDate: "15/01/2025" },
  { id: "AFI-003", name: "FAST PRO Norte",  initials: "FN", email: "norte@fastpro.com.br",  type: "vendedor",  coordinator: null,          ganCode: null,         status: "pendente", joinDate: "02/06/2025" },
  { id: "AFI-004", name: "FAST PRO Leste",  initials: "FL", email: "leste@fastpro.com.br",  type: "vendedor",  coordinator: "Marcos T.",   ganCode: "GAN-SP-004", status: "ativo",    joinDate: "03/03/2025" },
  { id: "AFI-005", name: "FAST PRO Oeste",  initials: "FO", email: "oeste@fastpro.com.br",  type: "arquiteto", coordinator: null,          ganCode: "GAN-SP-005", status: "inativo",  joinDate: "20/09/2024" },
];

const COORDINATORS = ["Marcos T.", "Fernanda G.", "João Operações"];

const STATUS_PILL: Record<AffStatus, { color: "success" | "muted" | "warning"; dot: boolean }> = {
  ativo:    { color: "success", dot: true  },
  inativo:  { color: "muted",   dot: false },
  pendente: { color: "warning", dot: true  },
};

const TYPE_LABEL: Record<AffType, string> = {
  arquiteto: "Arquiteto",
  vendedor:  "Vendedor",
};

type EditState = { id: string; coordinator: string; ganCode: string } | null;

// ── Table de afiliados (reutilizado em ambas as abas) ─────────────────────────

function AffiliateTable({
  rows, search, emptyType, onEdit,
}: {
  rows: Affiliate[];
  search: string;
  emptyType: AffType;
  onEdit: (a: Affiliate) => void;
}) {
  const filtered = rows.filter(
    (a) => !search || a.name.toLowerCase().includes(search.toLowerCase()) || (a.ganCode ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Afiliado</TableHead>
          <TableHead>Coordenador</TableHead>
          <TableHead>Código GAN</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Desde</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.length === 0 ? (
          <TableEmpty
            colSpan={6}
            icon={emptyType === "arquiteto" ? HardHat : ShoppingBag}
            title={search ? "Nenhum resultado" : `Nenhum ${TYPE_LABEL[emptyType].toLowerCase()} cadastrado`}
            description={search ? "Tente outro termo de busca." : undefined}
          />
        ) : (
          filtered.map((aff) => {
            const sp = STATUS_PILL[aff.status];
            return (
              <TableRow key={aff.id} className="[&>td]:py-3.5">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{aff.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{aff.name}</div>
                      <div className="text-xs text-muted-foreground">{aff.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {aff.coordinator
                    ? <div className="flex items-center gap-1.5"><UserCog className="size-3.5 text-muted-foreground" />{aff.coordinator}</div>
                    : <span className="text-muted-foreground italic text-xs">Não atribuído</span>
                  }
                </TableCell>
                <TableCell>
                  {aff.ganCode
                    ? <div className="flex items-center gap-1"><Badge variant="outline" className="font-mono text-xs">{aff.ganCode}</Badge><CopyButton text={aff.ganCode} size="sm" /></div>
                    : <span className="text-muted-foreground italic text-xs">Sem código</span>
                  }
                </TableCell>
                <TableCell>
                  <Pill color={sp.color} variant="soft" size="sm" dot={sp.dot}>
                    {aff.status.charAt(0).toUpperCase() + aff.status.slice(1)}
                  </Pill>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground tabular-nums">{aff.joinDate}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => onEdit(aff)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Afiliados() {
  const [affiliates, setAffiliates] = useState(AFFILIATES);
  const [search, setSearch]         = useState("");
  const [editing, setEditing]       = useState<EditState>(null);

  const arquitetos = affiliates.filter((a) => a.type === "arquiteto");
  const vendedores = affiliates.filter((a) => a.type === "vendedor");

  // Edit
  const openEdit = (aff: Affiliate) =>
    setEditing({ id: aff.id, coordinator: aff.coordinator ?? "", ganCode: aff.ganCode ?? "" });

  const saveEdit = () => {
    if (!editing) return;
    setAffiliates((prev) =>
      prev.map((a) => a.id === editing.id ? { ...a, coordinator: editing.coordinator || null, ganCode: editing.ganCode || null } : a)
    );
    setEditing(null);
    toast.success("Afiliado atualizado");
  };

  // Novo afiliado
  const [activeTab,      setActiveTab]      = useState<AffType>("arquiteto");
  const [newOpen,        setNewOpen]        = useState(false);
  const [newType,        setNewType]        = useState<AffType>("arquiteto");
  const [newName,        setNewName]        = useState("");
  const [newEmail,       setNewEmail]       = useState("");
  const [newCoordinator, setNewCoordinator] = useState("");
  const [newGanCode,     setNewGanCode]     = useState("");
  const [newSaving,      setNewSaving]      = useState(false);

  const resetNew = () => { setNewName(""); setNewEmail(""); setNewCoordinator(""); setNewGanCode(""); };

  function openNew(type: AffType) { setNewType(type); setNewOpen(true); }

  async function handleNewAffiliate() {
    if (!newName || !newEmail) return;
    setNewSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    const initials = newName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
    const newId = `AFI-${String(affiliates.length + 1).padStart(3, "0")}`;
    setAffiliates((prev) => [...prev, {
      id: newId, name: newName, initials, email: newEmail,
      type: newType,
      coordinator: newCoordinator || null,
      ganCode: newGanCode || null,
      status: "pendente",
      joinDate: new Date().toLocaleDateString("pt-BR"),
    }]);
    setNewOpen(false);
    resetNew();
    setNewSaving(false);
    toast.success(`${TYPE_LABEL[newType]} ${newName} cadastrado com sucesso`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Afiliados"
        path={[{ label: "Operação" }, { label: "Membros", to: "/membros" }]}
        renderCrumbLink={renderCrumbLink}
        description="Consulta e gestão dos arquitetos e vendedores cadastrados no programa."
      />

      <InfoNotice variant="info" title="Visão administrativa">
        Arquitetos e vendedores não acessam esta interface. Eles participam do programa pelo canal próprio (loja, app ou dispositivo). Aqui você consulta e gerencia o cadastro e as transações deles.
      </InfoNotice>

      {/* Edit panel */}
      {editing && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2 mr-2">
              <UserCog className="size-4 text-primary" />
              <span className="font-medium text-sm">
                Editando: {affiliates.find((a) => a.id === editing.id)?.name}
              </span>
            </div>
            <div className="flex-1 min-w-[200px] space-y-1">
              <Label className="text-xs text-muted-foreground">Coordenador</Label>
              <div className="w-full">
                <Select value={editing.coordinator} onValueChange={(v) => setEditing((p) => p && { ...p, coordinator: v })}>
                  <SelectTrigger><SelectValue placeholder="— sem coordenador —" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— sem coordenador —</SelectItem>
                    {COORDINATORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex-1 min-w-[160px] space-y-1">
              <Label className="text-xs text-muted-foreground">Código GAN</Label>
              <Input value={editing.ganCode} onChange={(e) => setEditing((p) => p && { ...p, ganCode: e.target.value })} placeholder="ex: GAN-SP-001" />
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" onClick={saveEdit}>Salvar</Button>
              <Button variant="outline" size="sm" onClick={() => setEditing(null)}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar nome ou código GAN…" className="w-64" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="arquitetos" onValueChange={(v) => setActiveTab(v as AffType)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="arquitetos">
              <HardHat className="mr-1.5 h-3.5 w-3.5" />
              Arquitetos
              <Badge variant="secondary" className="ml-2">{arquitetos.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="vendedores">
              <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
              Vendedores
              <Badge variant="secondary" className="ml-2">{vendedores.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <Button size="sm" onClick={() => openNew(activeTab)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo {TYPE_LABEL[activeTab].toLowerCase()}
          </Button>
        </div>

        <TabsContent value="arquitetos" className="mt-4">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <AffiliateTable rows={arquitetos} search={search} emptyType="arquiteto" onEdit={openEdit} />
          </div>
        </TabsContent>

        <TabsContent value="vendedores" className="mt-4">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <AffiliateTable rows={vendedores} search={search} emptyType="vendedor" onEdit={openEdit} />
          </div>
        </TabsContent>
      </Tabs>

      {/* FormDrawer */}
      <FormDrawer
        open={newOpen}
        onOpenChange={(o) => { setNewOpen(o); if (!o) resetNew(); }}
        title={`Novo ${TYPE_LABEL[newType].toLowerCase()}`}
        description={newType === "arquiteto"
          ? "Registre um arquiteto no programa. As especificações e pontuações dele serão rastreadas automaticamente pelo canal."
          : "Registre um vendedor no programa. As indicações e conversões dele serão rastreadas automaticamente pelo canal."}
        onSave={handleNewAffiliate}
        saving={newSaving}
        saveLabel={`Cadastrar ${TYPE_LABEL[newType].toLowerCase()}`}
        saveDisabled={!newName || !newEmail}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
            {newType === "arquiteto"
              ? <HardHat className="size-4 text-primary" />
              : <ShoppingBag className="size-4 text-primary" />
            }
            <span className="text-sm font-medium">{TYPE_LABEL[newType]}</span>
          </div>
          <div className="space-y-1.5">
            <Label>Nome <span className="text-destructive">*</span></Label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome completo" />
          </div>
          <div className="space-y-1.5">
            <Label>E-mail <span className="text-destructive">*</span></Label>
            <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@empresa.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Coordenador</Label>
            <Select value={newCoordinator} onValueChange={setNewCoordinator}>
              <SelectTrigger><SelectValue placeholder="— sem coordenador —" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">— sem coordenador —</SelectItem>
                {COORDINATORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Código GAN</Label>
            <Input value={newGanCode} onChange={(e) => setNewGanCode(e.target.value)} placeholder="ex: GAN-SP-006" />
          </div>
        </div>
      </FormDrawer>
    </div>
  );
}
