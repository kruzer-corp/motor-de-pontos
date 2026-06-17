import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, Button, Badge } from "@kruzer-corp/ds";
import { ArrowLeft, Pencil, Trash2, Plus } from "lucide-react";

type Group = { id: string; name: string; description: string; products: number; active: boolean };

const GROUPS: Group[] = [
  { id: "GRP-01", name: "Eletrônicos", description: "Dispositivos eletrônicos e acessórios tecnológicos.", products: 3, active: true },
  { id: "GRP-02", name: "Casa & Cozinha", description: "Eletrodomésticos e itens para o lar.", products: 3, active: true },
  { id: "GRP-03", name: "Moda & Acessórios", description: "Vestuário, calçados e acessórios de moda.", products: 2, active: true },
  { id: "GRP-04", name: "Esporte & Lazer", description: "Equipamentos esportivos e artigos de lazer.", products: 0, active: false },
];

export default function CatalogoGrupos() {
  const [groups, setGroups] = useState(GROUPS);

  const toggleActive = (id: string) =>
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, active: !g.active } : g))
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/catalogo">
              <ArrowLeft className="size-4 mr-1.5" />
              Catálogo
            </Link>
          </Button>
          <div>
            <h2 className="text-lg font-semibold">Grupos de Produtos</h2>
            <p className="text-sm text-muted-foreground">Gerencie as categorias do catálogo.</p>
          </div>
        </div>
        <Button size="sm">
          <Plus className="size-4 mr-1.5" />
          Novo grupo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grupos cadastrados</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-t border-border bg-muted/20">
              <tr className="text-left text-muted-foreground">
                <th className="px-6 py-3 font-medium">Grupo</th>
                <th className="px-6 py-3 font-medium">Descrição</th>
                <th className="px-6 py-3 font-medium">Produtos</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {groups.map((group) => (
                <tr key={group.id} className="hover:bg-muted/20">
                  <td className="px-6 py-4">
                    <div className="font-medium">{group.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{group.id}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground max-w-xs">{group.description}</td>
                  <td className="px-6 py-4 tabular-nums">
                    <Badge variant="secondary">{group.products}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(group.id)}
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors cursor-pointer ${
                        group.active
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {group.active ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
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
