import { Card, CardContent, CardHeader, CardTitle } from "@kruzer-corp/ds";

export default function Niveis() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Níveis</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Configure a progressão de tiers e as regras de elegibilidade para cada nível.</p>
      </CardContent>
    </Card>
  );
}
