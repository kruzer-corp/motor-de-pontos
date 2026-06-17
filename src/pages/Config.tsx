import { Card, CardContent, CardHeader, CardTitle } from "@kruzer-corp/ds";

export default function Config() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Ajuste parâmetros do programa, moedas, expiração e integrações.</p>
      </CardContent>
    </Card>
  );
}
