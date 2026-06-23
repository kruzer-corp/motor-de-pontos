import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Switch } from "@kruzer/ds";
import { ArrowLeft, Package, Pencil } from "lucide-react";

type ProductData = {
  name: string;
  category: string;
  description: string;
  points: number;
  stock: number;
  active: boolean;
  sku: string;
  redemptions: number;
};

const PRODUCTS: Record<string, ProductData> = {
  P001: {
    name: 'Smart TV 50"',
    category: "Eletrônicos",
    description:
      "Smart TV com resolução 4K UHD, HDR10+ e sistema operacional Android TV. Conectividade Wi-Fi, Bluetooth e 4 portas HDMI. Perfeita para resgate de alto valor.",
    points: 45000,
    stock: 12,
    active: true,
    sku: "ELE-TV-50",
    redemptions: 38,
  },
  P002: {
    name: 'Notebook Pro 14"',
    category: "Eletrônicos",
    description:
      "Notebook com processador i7, 16 GB RAM, SSD 512 GB e tela Full HD IPS. Bateria de até 10h de uso. Ideal para resgates premium.",
    points: 85000,
    stock: 5,
    active: true,
    sku: "ELE-NB-14",
    redemptions: 12,
  },
  P003: {
    name: "Fone Bluetooth",
    category: "Eletrônicos",
    description: "Fone over-ear com cancelamento de ruído ativo, 30h de bateria e qualidade de som Hi-Fi.",
    points: 8500,
    stock: 48,
    active: true,
    sku: "ELE-FN-BT",
    redemptions: 154,
  },
  P004: {
    name: "Air Fryer XL",
    category: "Casa & Cozinha",
    description: "Fritadeira elétrica de 5L com 12 funções pré-programadas, timer digital e bandeja antiaderente removível.",
    points: 18000,
    stock: 30,
    active: true,
    sku: "CZ-AF-XL",
    redemptions: 87,
  },
  P005: {
    name: "Cafeteira Premium",
    category: "Casa & Cozinha",
    description: "Cafeteira espresso com bomba de 15 bar, vaporizador de leite e reservatório de 1,5 L. Produto fora de estoque.",
    points: 12000,
    stock: 0,
    active: false,
    sku: "CZ-CF-PR",
    redemptions: 45,
  },
};

export default function CatalogoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const product = id ? PRODUCTS[id] : undefined;
  const [active, setActive] = useState(product?.active ?? false);

  if (!product) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/catalogo">
            <ArrowLeft className="size-4 mr-1.5" />
            Voltar ao catálogo
          </Link>
        </Button>
        <p className="text-muted-foreground">Produto não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/catalogo">
          <ArrowLeft className="size-4 mr-1.5" />
          Voltar ao catálogo
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Image placeholder */}
        <div className="flex h-64 items-center justify-center rounded-3xl border-2 border-dashed border-border bg-muted/20">
          <div className="text-center">
            <Package className="mx-auto size-12 text-muted-foreground/30" />
            <p className="mt-2 text-xs text-muted-foreground">Imagem do produto</p>
          </div>
        </div>

        {/* Main info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge variant="outline" className="mb-2 text-xs">
                  {product.category}
                </Badge>
                <CardTitle className="text-xl">{product.name}</CardTitle>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">SKU: {product.sku}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm text-muted-foreground">{active ? "Ativo" : "Inativo"}</span>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-primary/5 p-4 text-center">
                <div className="text-xs text-muted-foreground">Valor em pontos</div>
                <div className="mt-1 text-2xl font-bold tabular-nums">
                  {product.points.toLocaleString("pt-BR")}
                </div>
                <div className="text-xs text-muted-foreground">pts</div>
              </div>
              <div className={`rounded-2xl p-4 text-center ${product.stock === 0 ? "bg-red-50" : "bg-muted/30"}`}>
                <div className="text-xs text-muted-foreground">Estoque</div>
                <div
                  className={`mt-1 text-2xl font-bold tabular-nums ${
                    product.stock === 0 ? "text-red-500" : ""
                  }`}
                >
                  {product.stock}
                </div>
                <div className="text-xs text-muted-foreground">unidades</div>
              </div>
              <div className="rounded-2xl bg-muted/30 p-4 text-center">
                <div className="text-xs text-muted-foreground">Resgates</div>
                <div className="mt-1 text-2xl font-bold tabular-nums">{product.redemptions}</div>
                <div className="text-xs text-muted-foreground">total</div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button size="sm">
                <Pencil className="size-3.5 mr-1.5" />
                Editar produto
              </Button>
              <Button variant="outline" size="sm">
                Histórico de resgates
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
