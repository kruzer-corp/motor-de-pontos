import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, Badge } from "@kruzer-corp/ds";

const policyItems = [
  { label: "Acúmulo por compra", active: true },
  { label: "Acúmulo por categoria", active: false },
  { label: "Multiplicador de nível", active: true },
  { label: "Boas-vindas", active: true },
  { label: "Aniversário", active: false },
  { label: "Expiração", active: true },
  { label: "Taxa de resgate", active: false },
];

export default function CampanhasDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Detalhe da campanha</h1>
          <p className="text-sm text-muted-foreground">Veja as 7 políticas de regra e o estado de cada uma.</p>
        </div>
        <Badge variant="secondary">{id}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Políticas de regra</CardTitle>
        </CardHeader>
        <div className="grid gap-3 p-6 sm:grid-cols-2">
          {policyItems.map((policy) => (
            <div key={policy.label} className="rounded-3xl border border-border p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold">{policy.label}</div>
                  <div className="text-sm text-muted-foreground">Estado atual da política</div>
                </div>
                <Badge variant={policy.active ? "success" : "destructive"}>
                  {policy.active ? "Ativa" : "Inativa"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
