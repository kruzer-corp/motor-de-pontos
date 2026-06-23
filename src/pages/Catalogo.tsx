import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Input, Badge, Button } from "@kruzer/ds";
import { Package, ChevronDown, ChevronRight, Search } from "lucide-react";

type Product = { id: string; name: string; points: number; stock: number; active: boolean };

const CATALOG: Record<string, Product[]> = {
  "Eletrônicos": [
    { id: "P001", name: 'Smart TV 50"', points: 45000, stock: 12, active: true },
    { id: "P002", name: "Notebook Pro 14\"", points: 85000, stock: 5, active: true },
    { id: "P003", name: "Fone Bluetooth", points: 8500, stock: 48, active: true },
  ],
  "Casa & Cozinha": [
    { id: "P004", name: "Air Fryer XL", points: 18000, stock: 30, active: true },
    { id: "P005", name: "Cafeteira Premium", points: 12000, stock: 0, active: false },
    { id: "P006", name: "Liquidificador Pro", points: 9500, stock: 15, active: true },
  ],
  "Moda & Acessórios": [
    { id: "P007", name: "Tênis Runner", points: 22000, stock: 8, active: true },
    { id: "P008", name: "Bolsa Sport", points: 14000, stock: 3, active: true },
  ],
};

export default function Catalogo() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.keys(CATALOG).map((k) => [k, true]))
  );

  const toggle = (group: string) =>
    setExpanded((prev) => ({ ...prev, [group]: !prev[group] }));

  const matchesQuery = (name: string) =>
    !query || name.toLowerCase().includes(query.toLowerCase());

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Catálogo de Produtos Incentivados</h2>
          <p className="text-sm text-muted-foreground">Produtos agrupados por categoria.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-9 w-64"
              placeholder="Buscar produto..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button size="sm">+ Novo produto</Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/catalogo/grupos">Grupos</Link>
          </Button>
        </div>
      </div>

      {Object.entries(CATALOG).map(([group, products]) => {
        const visible = products.filter((p) => matchesQuery(p.name));
        if (visible.length === 0) return null;
        const isOpen = expanded[group] ?? true;

        return (
          <Card key={group} className="overflow-hidden">
            <button
              onClick={() => toggle(group)}
              className="flex w-full items-center gap-3 px-6 py-4 hover:bg-muted/30 text-left transition-colors"
            >
              <Package className="size-4 text-muted-foreground shrink-0" />
              <span className="flex-1 font-semibold">{group}</span>
              <Badge variant="secondary">{visible.length} produto{visible.length !== 1 ? "s" : ""}</Badge>
              {isOpen ? (
                <ChevronDown className="size-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="size-4 text-muted-foreground" />
              )}
            </button>

            {isOpen && (
              <div className="overflow-x-auto border-t border-border">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/20">
                    <tr className="text-left text-muted-foreground">
                      <th className="px-6 py-3 font-medium">Produto</th>
                      <th className="px-6 py-3 font-medium">ID</th>
                      <th className="px-6 py-3 font-medium">Pontos</th>
                      <th className="px-6 py-3 font-medium">Estoque</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {visible.map((product) => (
                      <tr key={product.id} className="hover:bg-muted/20">
                        <td className="px-6 py-3 font-medium">{product.name}</td>
                        <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{product.id}</td>
                        <td className="px-6 py-3 tabular-nums">
                          {product.points.toLocaleString("pt-BR")} pts
                        </td>
                        <td className="px-6 py-3 tabular-nums">
                          <span className={product.stock === 0 ? "text-red-500 font-medium" : ""}>
                            {product.stock === 0 ? "Esgotado" : product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              product.active
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {product.active ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/catalogo/${product.id}`}>Detalhes</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
