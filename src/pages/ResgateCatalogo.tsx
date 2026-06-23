import { useState } from "react";
import { Card, Button, Badge, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@kruzer/ds";
import { ShoppingCart, Package, Search, CheckCheck } from "lucide-react";

type CatalogProduct = {
  id: string;
  name: string;
  category: string;
  points: number;
  stock: number;
  popular: boolean;
};

const PRODUCTS: CatalogProduct[] = [
  { id: "P001", name: 'Smart TV 50"', category: "Eletrônicos", points: 45000, stock: 12, popular: true },
  { id: "P002", name: "Notebook Pro 14\"", category: "Eletrônicos", points: 85000, stock: 5, popular: false },
  { id: "P003", name: "Fone Bluetooth", category: "Eletrônicos", points: 8500, stock: 48, popular: true },
  { id: "P004", name: "Air Fryer XL", category: "Casa & Cozinha", points: 18000, stock: 30, popular: true },
  { id: "P006", name: "Liquidificador Pro", category: "Casa & Cozinha", points: 9500, stock: 15, popular: false },
  { id: "P007", name: "Tênis Runner", category: "Moda", points: 22000, stock: 8, popular: false },
  { id: "P008", name: "Bolsa Sport", category: "Moda", points: 14000, stock: 3, popular: false },
];

type CheckoutState = { product: CatalogProduct; member: string } | null;

const MEMBERS = ["Aline P. (MBR-00312) — 5.200 pts", "Bruno C. (MBR-00210) — 3.200 pts", "Cecília M. (MBR-00445) — 1.800 pts"];

export default function ResgateCatalogo() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [checkout, setCheckout] = useState<CheckoutState>(null);
  const [confirmed, setConfirmed] = useState<string[]>([]);
  const [selectedMember, setSelectedMember] = useState("");

  const categories = ["Todos", ...Array.from(new Set(PRODUCTS.map((p) => p.category)))];

  const filtered = PRODUCTS.filter(
    (p) =>
      (category === "Todos" || p.category === category) &&
      (!query || p.name.toLowerCase().includes(query.toLowerCase()))
  );

  const handleConfirm = () => {
    if (!checkout) return;
    setConfirmed((prev) => [...prev, checkout.product.id]);
    setCheckout(null);
    setSelectedMember("");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ShoppingCart className="size-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">Catálogo de Resgate</h2>
            <p className="text-sm text-muted-foreground">Visualize e processe resgates de produtos.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-9 w-56"
              placeholder="Buscar produto..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Checkout panel */}
      {checkout && (
        <Card className="border-primary/30 bg-primary/5 p-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="text-sm font-semibold mb-1">
                Resgatando: {checkout.product.name}
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                Custo: {checkout.product.points.toLocaleString("pt-BR")} pts
              </div>
              <label className="block text-xs text-muted-foreground mb-1">Membro</label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o membro…" />
                </SelectTrigger>
                <SelectContent>
                  {MEMBERS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" onClick={handleConfirm} disabled={!selectedMember}>
                <CheckCheck className="size-4 mr-1.5" />
                Confirmar resgate
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCheckout(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Product grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((product) => {
          const isConfirmed = confirmed.includes(product.id);
          return (
            <Card key={product.id} className="overflow-hidden">
              {/* Image placeholder */}
              <div className="flex h-36 items-center justify-center bg-muted/20">
                <Package className="size-10 text-muted-foreground/30" />
              </div>

              <div className="p-4 space-y-3">
                <div>
                  {product.popular && (
                    <Badge variant="secondary" className="mb-1 text-xs">Popular</Badge>
                  )}
                  <div className="font-semibold leading-tight">{product.name}</div>
                  <div className="text-xs text-muted-foreground">{product.category}</div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xl font-bold tabular-nums text-primary">
                      {product.points.toLocaleString("pt-BR")}
                    </div>
                    <div className="text-xs text-muted-foreground">pts</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {product.stock === 0 ? (
                      <span className="text-red-500">Esgotado</span>
                    ) : (
                      `${product.stock} em estoque`
                    )}
                  </div>
                </div>

                {isConfirmed ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                    <CheckCheck className="size-4" />
                    Resgate criado
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={product.stock === 0}
                    onClick={() => setCheckout({ product, member: "" })}
                  >
                    <ShoppingCart className="size-3.5 mr-1.5" />
                    Resgatar
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
