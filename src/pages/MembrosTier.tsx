import { useState } from "react";
import { Card, CardContent, Button, Badge } from "@kruzer-corp/ds";
import { ShieldCheck, ChevronDown, ChevronRight, Pencil } from "lucide-react";

type Tier = {
  id: string;
  name: string;
  color: string;
  dotColor: string;
  minPoints: number;
  maxPoints: number | null;
  multiplier: number;
  benefits: string[];
  members: number;
};

const TIERS: Tier[] = [
  {
    id: "diamante",
    name: "Diamante",
    color: "bg-violet-50 border-violet-200",
    dotColor: "bg-violet-500",
    minPoints: 50000,
    maxPoints: null,
    multiplier: 3,
    benefits: [
      "Multiplicador 3× em todas as compras",
      "Acesso prioritário ao catálogo de resgate",
      "Suporte dedicado",
      "Frete grátis ilimitado",
      "Acesso antecipado a campanhas",
    ],
    members: 228,
  },
  {
    id: "ouro",
    name: "Ouro",
    color: "bg-amber-50 border-amber-200",
    dotColor: "bg-amber-400",
    minPoints: 20000,
    maxPoints: 49999,
    multiplier: 2,
    benefits: [
      "Multiplicador 2× em todas as compras",
      "Frete grátis em compras acima de R$ 150",
      "Acesso ao catálogo premium",
      "Suporte prioritário",
    ],
    members: 352,
  },
  {
    id: "prata",
    name: "Prata",
    color: "bg-slate-50 border-slate-200",
    dotColor: "bg-slate-400",
    minPoints: 5000,
    maxPoints: 19999,
    multiplier: 1.5,
    benefits: [
      "Multiplicador 1,5× em compras elegíveis",
      "Frete grátis em compras acima de R$ 250",
      "Acesso a ofertas exclusivas",
    ],
    members: 649,
  },
  {
    id: "bronze",
    name: "Bronze",
    color: "bg-orange-50 border-orange-200",
    dotColor: "bg-orange-400",
    minPoints: 0,
    maxPoints: 4999,
    multiplier: 1,
    benefits: [
      "Acúmulo base (1 ponto por R$ 1,00)",
      "Acesso ao catálogo padrão de resgate",
    ],
    members: 1261,
  },
];

export default function MembrosTier() {
  const [expanded, setExpanded] = useState<string | null>("diamante");

  const total = TIERS.reduce((a, t) => a + t.members, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">Estrutura de tiers</h2>
            <p className="text-sm text-muted-foreground">
              Níveis de fidelidade, limiares de pontos e benefícios por tier.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Pencil className="size-3.5 mr-1.5" />
          Editar limiares
        </Button>
      </div>

      {/* Distribution bar */}
      <Card className="p-4">
        <div className="text-xs text-muted-foreground mb-2">Distribuição atual — {total.toLocaleString("pt-BR")} membros</div>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {TIERS.map((t) => (
            <div
              key={t.id}
              className={t.dotColor}
              style={{ width: `${(t.members / total) * 100}%` }}
              title={`${t.name}: ${t.members}`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mt-3">
          {TIERS.map((t) => (
            <div key={t.id} className="flex items-center gap-1.5 text-xs">
              <span className={`h-2 w-2 rounded-full ${t.dotColor}`} />
              <span>{t.name}</span>
              <span className="text-muted-foreground">{Math.round((t.members / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Tier cards */}
      <div className="space-y-3">
        {TIERS.map((tier) => {
          const isOpen = expanded === tier.id;
          return (
            <Card key={tier.id} className={`overflow-hidden border ${tier.color}`}>
              <button
                className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-black/5 transition-colors"
                onClick={() => setExpanded(isOpen ? null : tier.id)}
              >
                <span className={`h-3 w-3 rounded-full shrink-0 ${tier.dotColor}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{tier.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {tier.minPoints.toLocaleString("pt-BR")} pts
                    {tier.maxPoints ? ` → ${tier.maxPoints.toLocaleString("pt-BR")} pts` : " em diante"}
                    {" · "}multiplicador {tier.multiplier}×
                  </div>
                </div>
                <Badge variant="secondary">{tier.members.toLocaleString("pt-BR")} membros</Badge>
                {isOpen
                  ? <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                  : <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                }
              </button>

              {isOpen && (
                <CardContent className="border-t border-border/50 pt-4 pb-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl bg-background/60 p-3 text-center">
                      <div className="text-xs text-muted-foreground">Limiar mínimo</div>
                      <div className="text-xl font-bold mt-0.5">
                        {tier.minPoints.toLocaleString("pt-BR")}
                      </div>
                      <div className="text-xs text-muted-foreground">pontos</div>
                    </div>
                    <div className="rounded-xl bg-background/60 p-3 text-center">
                      <div className="text-xs text-muted-foreground">Limiar máximo</div>
                      <div className="text-xl font-bold mt-0.5">
                        {tier.maxPoints ? tier.maxPoints.toLocaleString("pt-BR") : "∞"}
                      </div>
                      <div className="text-xs text-muted-foreground">pontos</div>
                    </div>
                    <div className="rounded-xl bg-background/60 p-3 text-center">
                      <div className="text-xs text-muted-foreground">Multiplicador</div>
                      <div className="text-xl font-bold mt-0.5">{tier.multiplier}×</div>
                      <div className="text-xs text-muted-foreground">sobre a base</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Benefícios
                    </div>
                    <ul className="space-y-1.5">
                      {tier.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm">
                          <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${tier.dotColor}`} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
