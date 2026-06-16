import { Button, Card, CardContent, CardHeader, CardTitle } from "@kruzer-corp/ds";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Motor de Pontos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Projeto inicializado do zero com React, TypeScript, Tailwind e @kruzer-corp/ds.
            </p>
            <Button>Começar</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
