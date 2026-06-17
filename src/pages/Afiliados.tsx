import { useState } from "react";
import { Card, CardHeader, CardTitle, Input, Button, Badge, Avatar, AvatarFallback, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@kruzer-corp/ds";
import { Search, Plus, Pencil, UserCog } from "lucide-react";

type Affiliate = {
  id: string;
  name: string;
  initials: string;
  email: string;
  coordinator: string | null;
  ganCode: string | null;
  status: "ativo" | "inativo" | "pendente";
  joinDate: string;
};

const AFFILIATES: Affiliate[] = [
  {
    id: "AFI-001",
    name: "FAST PRO Centro",
    initials: "FC",
    email: "centro@fastpro.com.br",
    coordinator: "Marcos T.",
    ganCode: "GAN-SP-001",
    status: "ativo",
    joinDate: "12/01/2025",
  },
  {
    id: "AFI-002",
    name: "FAST PRO Sul",
    initials: "FS",
    email: "sul@fastpro.com.br",
    coordinator: "Fernanda G.",
    ganCode: "GAN-SP-002",
    status: "ativo",
    joinDate: "15/01/2025",
  },
  {
    id: "AFI-003",
    name: "FAST PRO Norte",
    initials: "FN",
    email: "norte@fastpro.com.br",
    coordinator: null,
    ganCode: null,
    status: "pendente",
    joinDate: "02/06/2025",
  },
  {
    id: "AFI-004",
    name: "FAST PRO Leste",
    initials: "FL",
    email: "leste@fastpro.com.br",
    coordinator: "Marcos T.",
    ganCode: "GAN-SP-004",
    status: "ativo",
    joinDate: "03/03/2025",
  },
  {
    id: "AFI-005",
    name: "FAST PRO Oeste",
    initials: "FO",
    email: "oeste@fastpro.com.br",
    coordinator: null,
    ganCode: "GAN-SP-005",
    status: "inativo",
    joinDate: "20/09/2024",
  },
];

const COORDINATORS = ["Marcos T.", "Fernanda G.", "João Operações"];

const statusColor: Record<Affiliate["status"], string> = {
  ativo: "bg-emerald-100 text-emerald-700",
  inativo: "bg-slate-100 text-slate-500",
  pendente: "bg-amber-100 text-amber-700",
};

type EditState = {
  id: string;
  coordinator: string;
  ganCode: string;
} | null;

export default function Afiliados() {
  const [affiliates, setAffiliates] = useState(AFFILIATES);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<EditState>(null);

  const filtered = affiliates.filter(
    (a) =>
      !query ||
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      (a.ganCode ?? "").toLowerCase().includes(query.toLowerCase())
  );

  const openEdit = (aff: Affiliate) =>
    setEditing({ id: aff.id, coordinator: aff.coordinator ?? "", ganCode: aff.ganCode ?? "" });

  const saveEdit = () => {
    if (!editing) return;
    setAffiliates((prev) =>
      prev.map((a) =>
        a.id === editing.id
          ? {
              ...a,
              coordinator: editing.coordinator || null,
              ganCode: editing.ganCode || null,
            }
          : a
      )
    );
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Afiliados</h2>
          <p className="text-sm text-muted-foreground">Gestão de afiliados, coordenadores e códigos GAN.</p>
        </div>
        <Button size="sm">
          <Plus className="size-4 mr-1.5" />
          Novo afiliado
        </Button>
      </div>

      {/* Edit panel */}
      {editing && (
        <Card className="border-primary/30 bg-primary/5 p-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2 mr-2">
              <UserCog className="size-4 text-primary" />
              <span className="font-medium text-sm">
                Editando: {affiliates.find((a) => a.id === editing.id)?.name}
              </span>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-muted-foreground mb-1">Coordenador</label>
              <Select value={editing.coordinator} onValueChange={(val) => setEditing((prev) => prev && { ...prev, coordinator: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="— sem coordenador —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">— sem coordenador —</SelectItem>
                  {COORDINATORS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs text-muted-foreground mb-1">Código GAN</label>
              <Input
                value={editing.ganCode}
                onChange={(e) => setEditing((prev) => prev && { ...prev, ganCode: e.target.value })}
                placeholder="ex: GAN-SP-001"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" onClick={saveEdit}>Salvar</Button>
              <Button variant="outline" size="sm" onClick={() => setEditing(null)}>Cancelar</Button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Lista de afiliados</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                className="pl-9 w-56"
                placeholder="Buscar nome ou GAN..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-t border-border bg-muted/20">
              <tr className="text-left text-muted-foreground">
                <th className="px-6 py-3 font-medium">Afiliado</th>
                <th className="px-6 py-3 font-medium">Coordenador</th>
                <th className="px-6 py-3 font-medium">Código GAN</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Desde</th>
                <th className="px-6 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((aff) => (
                <tr
                  key={aff.id}
                  className={`hover:bg-muted/20 ${editing?.id === aff.id ? "bg-primary/5" : ""}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {aff.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{aff.name}</div>
                        <div className="text-xs text-muted-foreground">{aff.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {aff.coordinator ? (
                      <div className="flex items-center gap-1.5">
                        <UserCog className="size-3.5 text-muted-foreground" />
                        <span>{aff.coordinator}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">Não atribuído</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {aff.ganCode ? (
                      <Badge variant="outline" className="font-mono text-xs">
                        {aff.ganCode}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">Sem código</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[aff.status]}`}>
                      {aff.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground tabular-nums">{aff.joinDate}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(aff)}>
                      <Pencil className="size-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
