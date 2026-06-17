import { useState } from "react";
import {
  Card,
  Input,
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Switch,
  Avatar,
  AvatarFallback,
} from "@kruzer-corp/ds";
import { Search, Plus, Pencil, Shield } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "ativo" | "inativo" | "pendente";
  lastLogin: string;
};

const USERS: User[] = [
  { id: "USR-001", name: "Mariana Souza", email: "mariana.souza@kruzer.ai", role: "Administrador", status: "ativo", lastLogin: "16/06/2025 14:22" },
  { id: "USR-002", name: "João Operações", email: "joao.ops@cliente.com.br", role: "Operador", status: "ativo", lastLogin: "15/06/2025 09:47" },
  { id: "USR-003", name: "Fernanda Atend.", email: "fernanda@cliente.com.br", role: "Analista", status: "ativo", lastLogin: "14/06/2025 16:30" },
  { id: "USR-004", name: "Ricardo Lopes", email: "ricardo@cliente.com.br", role: "Visualizador", status: "pendente", lastLogin: "—" },
  { id: "USR-005", name: "Camila Freitas", email: "camila@cliente.com.br", role: "Operador", status: "inativo", lastLogin: "01/04/2025 11:00" },
];

type Profile = {
  id: string;
  name: string;
  users: number;
  permissions: Record<string, boolean>;
};

const PERMISSIONS = [
  "Ver membros",
  "Editar membros",
  "Ajuste manual",
  "Ver campanhas",
  "Editar campanhas",
  "Ver recompensas",
  "Aprovar resgates",
  "Ver relatórios",
  "Configuração",
  "Gestão de usuários",
];

const PROFILES: Profile[] = [
  {
    id: "PRF-ADM",
    name: "Administrador",
    users: 1,
    permissions: Object.fromEntries(PERMISSIONS.map((p) => [p, true])),
  },
  {
    id: "PRF-OPR",
    name: "Operador",
    users: 2,
    permissions: Object.fromEntries(
      PERMISSIONS.map((p) => [
        p,
        ["Ver membros", "Editar membros", "Ajuste manual", "Ver recompensas", "Aprovar resgates"].includes(p),
      ])
    ),
  },
  {
    id: "PRF-ANA",
    name: "Analista",
    users: 1,
    permissions: Object.fromEntries(
      PERMISSIONS.map((p) => [
        p,
        ["Ver membros", "Ver campanhas", "Ver recompensas", "Ver relatórios"].includes(p),
      ])
    ),
  },
  {
    id: "PRF-VIS",
    name: "Visualizador",
    users: 1,
    permissions: Object.fromEntries(
      PERMISSIONS.map((p) => [p, ["Ver membros", "Ver campanhas", "Ver recompensas"].includes(p)])
    ),
  },
];

const statusColor: Record<User["status"], string> = {
  ativo: "bg-emerald-100 text-emerald-700",
  inativo: "bg-slate-100 text-slate-500",
  pendente: "bg-amber-100 text-amber-700",
};

export default function Usuarios() {
  const [query, setQuery] = useState("");

  const filtered = USERS.filter(
    (u) =>
      !query ||
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Usuários & Papéis</h2>
          <p className="text-sm text-muted-foreground">Gestão de acesso e permissões (IAM).</p>
        </div>
        <Button size="sm">
          <Plus className="size-4 mr-1.5" />
          Convidar usuário
        </Button>
      </div>

      <Tabs defaultValue="usuarios">
        <TabsList>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="perfis">Perfis RBAC</TabsTrigger>
        </TabsList>

        {/* ── Tab: Usuários ── */}
        <TabsContent value="usuarios" className="mt-4 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome ou e-mail..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-border bg-muted/20">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Usuário</th>
                    <th className="px-6 py-3 font-medium">Perfil</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Último acesso</th>
                    <th className="px-6 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/20">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                              {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Shield className="size-3.5 text-muted-foreground" />
                          <span>{user.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[user.status]}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 tabular-nums text-sm text-muted-foreground">
                        {user.lastLogin}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm">
                          <Pencil className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ── Tab: Perfis RBAC ── */}
        <TabsContent value="perfis" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Defina quais ações cada perfil pode executar.
            </p>
            <Button variant="outline" size="sm">
              <Plus className="size-4 mr-1.5" />
              Novo perfil
            </Button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-border bg-muted/20">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-6 py-3 font-medium sticky left-0 bg-muted/20 z-10 min-w-[180px]">
                      Permissão
                    </th>
                    {PROFILES.map((p) => (
                      <th key={p.id} className="px-6 py-3 font-medium text-center whitespace-nowrap">
                        <div>{p.name}</div>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {p.users} usuário{p.users !== 1 ? "s" : ""}
                        </Badge>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {PERMISSIONS.map((perm) => (
                    <tr key={perm} className="hover:bg-muted/20">
                      <td className="px-6 py-3 sticky left-0 bg-card font-medium">{perm}</td>
                      {PROFILES.map((profile) => (
                        <td key={profile.id} className="px-6 py-3 text-center">
                          <Switch
                            checked={profile.permissions[perm] ?? false}
                            size="sm"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
