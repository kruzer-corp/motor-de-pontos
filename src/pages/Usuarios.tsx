import { useState } from "react";
import {
  Avatar, AvatarFallback, Badge, Button, FormDrawer,
  Input, Label, PageHeader, Pill,
  SearchInput, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Switch, Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Tabs, TabsContent, TabsList, TabsTrigger,
  toast,
} from "@kruzer/ds";
import { Pencil, Plus, Shield } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type UserStatus = "ativo" | "inativo" | "pendente";
type Role = "Administrador" | "Operador" | "Analista" | "Visualizador";

type User = {
  id: string; name: string; email: string;
  role: Role; status: UserStatus; lastLogin: string;
};

// ── Data ───────────────────────────────────────────────────────────────────────

const ROLES: Role[] = ["Administrador", "Operador", "Analista", "Visualizador"];

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Administrador: "Acesso total ao sistema",
  Operador:      "Aprova resgates e gerencia membros",
  Analista:      "Leitura de membros, campanhas e relatórios",
  Visualizador:  "Leitura básica de membros e campanhas",
};

const INITIAL_USERS: User[] = [
  { id: "USR-001", name: "Mariana Souza",   email: "mariana.souza@kruzer.ai",  role: "Administrador", status: "ativo",    lastLogin: "16/06/2025 14:22" },
  { id: "USR-002", name: "João Operações",  email: "joao.ops@cliente.com.br",  role: "Operador",      status: "ativo",    lastLogin: "15/06/2025 09:47" },
  { id: "USR-003", name: "Fernanda Atend.", email: "fernanda@cliente.com.br",  role: "Analista",      status: "ativo",    lastLogin: "14/06/2025 16:30" },
  { id: "USR-004", name: "Ricardo Lopes",   email: "ricardo@cliente.com.br",   role: "Visualizador",  status: "pendente", lastLogin: "—" },
  { id: "USR-005", name: "Camila Freitas",  email: "camila@cliente.com.br",    role: "Operador",      status: "inativo",  lastLogin: "01/04/2025 11:00" },
];

const PERMISSIONS = [
  "Ver membros",
  "Editar membros",
  "Ajuste manual de pontos",
  "Ver campanhas",
  "Criar / editar campanhas",
  "Ver resgates",
  "Aprovar resgates",
  "Ver relatórios",
  "Configuração do programa",
  "Gestão de usuários",
];

const DEFAULT_PERMS: Record<Role, string[]> = {
  Administrador: PERMISSIONS,
  Operador:      ["Ver membros", "Editar membros", "Ajuste manual de pontos", "Ver resgates", "Aprovar resgates"],
  Analista:      ["Ver membros", "Ver campanhas", "Ver resgates", "Ver relatórios"],
  Visualizador:  ["Ver membros", "Ver campanhas", "Ver resgates"],
};

type PermMatrix = Record<Role, Record<string, boolean>>;

function buildMatrix(): PermMatrix {
  return Object.fromEntries(
    ROLES.map((r) => [r, Object.fromEntries(PERMISSIONS.map((p) => [p, DEFAULT_PERMS[r].includes(p)]))])
  ) as PermMatrix;
}

// ── Status pill ────────────────────────────────────────────────────────────────

const STATUS_PILL: Record<UserStatus, { color: "success" | "muted" | "warning"; dot: boolean }> = {
  ativo:    { color: "success", dot: true  },
  inativo:  { color: "muted",   dot: false },
  pendente: { color: "warning", dot: true  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Usuarios() {
  const [users, setUsers]       = useState<User[]>(INITIAL_USERS);
  const [matrix, setMatrix]     = useState<PermMatrix>(buildMatrix());
  const [search, setSearch]     = useState("");
  const [matrixDirty, setMatrixDirty] = useState(false);

  // Invite drawer
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName,  setInviteName]  = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole,  setInviteRole]  = useState<Role | "">("");
  const [inviteSaving, setInviteSaving] = useState(false);

  // Edit drawer
  const [editOpen,   setEditOpen]   = useState(false);
  const [editUser,   setEditUser]   = useState<User | null>(null);
  const [editRole,   setEditRole]   = useState<Role | "">("");
  const [editStatus, setEditStatus] = useState<UserStatus>("ativo");
  const [editSaving, setEditSaving] = useState(false);

  const filtered = users.filter(
    (u) => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  // ── Invite flow ───────────────────────────────────────────────────────────

  function openInvite() {
    setInviteName(""); setInviteEmail(""); setInviteRole(""); setInviteOpen(true);
  }

  async function handleInvite() {
    if (!inviteName || !inviteEmail || !inviteRole) return;
    setInviteSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    const newUser: User = {
      id: `USR-00${users.length + 1}`,
      name: inviteName, email: inviteEmail,
      role: inviteRole as Role, status: "pendente", lastLogin: "—",
    };
    setUsers((prev) => [...prev, newUser]);
    setInviteOpen(false);
    setInviteSaving(false);
    toast.success(`Convite enviado para ${inviteEmail}`);
  }

  // ── Edit flow ─────────────────────────────────────────────────────────────

  function openEdit(user: User) {
    setEditUser(user); setEditRole(user.role); setEditStatus(user.status); setEditOpen(true);
  }

  async function handleEdit() {
    if (!editUser || !editRole) return;
    setEditSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setUsers((prev) => prev.map((u) =>
      u.id === editUser.id ? { ...u, role: editRole as Role, status: editStatus } : u
    ));
    setEditOpen(false);
    setEditSaving(false);
    toast.success("Usuário atualizado");
  }

  // ── RBAC matrix ───────────────────────────────────────────────────────────

  function togglePerm(role: Role, perm: string) {
    setMatrix((prev) => ({
      ...prev,
      [role]: { ...prev[role], [perm]: !prev[role][perm] },
    }));
    setMatrixDirty(true);
  }

  function saveMatrix() {
    setMatrixDirty(false);
    toast.success("Permissões salvas");
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários & Papéis"
        description="Gestão de acesso e permissões (IAM)."
        actions={
          <Button size="sm" onClick={openInvite}>
            <Plus className="mr-2 h-4 w-4" />
            Convidar usuário
          </Button>
        }
      />

      <Tabs defaultValue="usuarios">
        <TabsList>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="perfis">Perfis & Permissões</TabsTrigger>
        </TabsList>

        {/* ── Usuários ── */}
        <TabsContent value="usuarios" className="mt-4">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Buscar por nome ou e-mail…"
                className="w-64"
              />
            </div>
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Nenhum usuário encontrado.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último acesso</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((user) => {
                    const sp = STATUS_PILL[user.status];
                    const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("");
                    return (
                      <TableRow key={user.id} className="[&>td]:py-3.5">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{user.name}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm">
                            <Shield className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            {user.role}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{ROLE_DESCRIPTIONS[user.role]}</div>
                        </TableCell>
                        <TableCell>
                          <Pill color={sp.color} variant="soft" size="sm" dot={sp.dot}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </Pill>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground tabular-nums">{user.lastLogin}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" aria-label="Editar usuário" onClick={() => openEdit(user)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* ── Perfis & Permissões ── */}
        <TabsContent value="perfis" className="mt-4">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {matrixDirty && (
              <div className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-5 py-2.5">
                <span className="text-sm text-amber-800">Você tem alterações não salvas.</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setMatrix(buildMatrix()); setMatrixDirty(false); }}>
                    Descartar
                  </Button>
                  <Button size="sm" onClick={saveMatrix}>Salvar permissões</Button>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="h-11 px-5 text-left align-middle text-[11px] font-medium uppercase tracking-wide text-muted-foreground sticky left-0 bg-card min-w-[220px] border-b border-border">
                      Permissão
                    </th>
                    {ROLES.map((role) => {
                      const count = users.filter((u) => u.role === role).length;
                      return (
                        <th key={role} className="h-11 px-4 text-center align-middle border-b border-border">
                          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap">{role}</div>
                          <Badge variant="secondary" className="mt-0.5 text-[10px]">
                            {count} usuário{count !== 1 ? "s" : ""}
                          </Badge>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {PERMISSIONS.map((perm) => (
                    <tr key={perm} className="hover:bg-muted/20">
                      <td className="px-5 py-3 sticky left-0 bg-card font-medium">{perm}</td>
                      {ROLES.map((role) => (
                        <td key={role} className="px-4 py-3 text-center">
                          <Switch
                            checked={matrix[role][perm] ?? false}
                            onCheckedChange={() => togglePerm(role, perm)}
                            size="sm"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Invite FormDrawer ── */}
      <FormDrawer
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        title="Convidar usuário"
        description="O usuário receberá um e-mail para configurar sua senha."
        onSave={handleInvite}
        saving={inviteSaving}
        saveLabel="Enviar convite"
        saveDisabled={!inviteName || !inviteEmail || !inviteRole}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Nome completo" />
          </div>
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@empresa.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Perfil de acesso</Label>
            <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
              <SelectTrigger><SelectValue placeholder="Selecione um perfil" /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    <div>
                      <div className="font-medium">{r}</div>
                      <div className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[r]}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {inviteRole && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Permissões do perfil</p>
              <ul className="space-y-0.5">
                {PERMISSIONS.map((perm) => (
                  <li key={perm} className={`flex items-center gap-2 text-xs ${matrix[inviteRole as Role][perm] ? "text-foreground" : "text-muted-foreground/40 line-through"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${matrix[inviteRole as Role][perm] ? "bg-success" : "bg-border"}`} />
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </FormDrawer>

      {/* ── Edit FormDrawer ── */}
      <FormDrawer
        open={editOpen}
        onOpenChange={setEditOpen}
        title={`Editar — ${editUser?.name ?? ""}`}
        description="Altere o perfil de acesso ou o status do usuário."
        onSave={handleEdit}
        saving={editSaving}
        saveLabel="Salvar alterações"
        saveDisabled={!editRole}
      >
        <div className="space-y-4">
          {editUser && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {editUser.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium">{editUser.name}</div>
                <div className="text-xs text-muted-foreground">{editUser.email}</div>
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Perfil de acesso</Label>
            <Select value={editRole} onValueChange={(v) => setEditRole(v as Role)}>
              <SelectTrigger><SelectValue placeholder="Selecione um perfil" /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    <div>
                      <div className="font-medium">{r}</div>
                      <div className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[r]}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={editStatus} onValueChange={(v) => setEditStatus(v as UserStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {editRole && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Permissões do perfil</p>
              <ul className="space-y-0.5">
                {PERMISSIONS.map((perm) => (
                  <li key={perm} className={`flex items-center gap-2 text-xs ${matrix[editRole as Role][perm] ? "text-foreground" : "text-muted-foreground/40 line-through"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${matrix[editRole as Role][perm] ? "bg-success" : "bg-border"}`} />
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </FormDrawer>
    </div>
  );
}
