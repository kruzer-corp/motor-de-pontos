import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Badge, Button, PageHeader,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  TableEmpty,
} from "@kruzer/ds";
import { ArrowLeft, Layers, Pencil, Plus, Trash2 } from "lucide-react";

type Group = { id: string; name: string; description: string; products: number; active: boolean };

const GROUPS: Group[] = [
  { id: "GRP-01", name: "Eletrônicos",      description: "Dispositivos eletrônicos e acessórios tecnológicos.", products: 3, active: true  },
  { id: "GRP-02", name: "Casa & Cozinha",   description: "Eletrodomésticos e itens para o lar.",               products: 3, active: true  },
  { id: "GRP-03", name: "Moda & Acessórios",description: "Vestuário, calçados e acessórios de moda.",          products: 2, active: true  },
  { id: "GRP-04", name: "Esporte & Lazer",  description: "Equipamentos esportivos e artigos de lazer.",        products: 0, active: false },
];

export default function CatalogoGrupos() {
  const [groups, setGroups] = useState(GROUPS);

  const toggleActive = (id: string) =>
    setGroups((prev) => prev.map((g) => g.id === id ? { ...g, active: !g.active } : g));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grupos de Produtos"
        description={`${groups.length} grupos cadastrados`}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/catalogo">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Catálogo
              </Link>
            </Button>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Novo grupo
            </Button>
          </div>
        }
      />

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Grupo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Produtos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.length === 0 ? (
              <TableEmpty colSpan={5} icon={Layers} title="Nenhum grupo cadastrado" />
            ) : (
              groups.map((group) => (
                <TableRow key={group.id} className="[&>td]:py-3.5">
                  <TableCell>
                    <div className="font-medium text-sm">{group.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{group.id}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">{group.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{group.products}</Badge>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleActive(group.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors cursor-pointer ${
                        group.active
                          ? "bg-success/10 text-success hover:bg-success/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {group.active && <span className="h-1.5 w-1.5 rounded-full bg-success" />}
                      {group.active ? "Ativo" : "Inativo"}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" aria-label="Editar grupo">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Excluir grupo">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
