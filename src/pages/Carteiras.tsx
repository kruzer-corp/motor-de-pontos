import { Card, CardHeader, CardTitle, CardContent } from "@kruzer/ds";
import { Wallet, Construction } from "lucide-react";

export default function Carteiras() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Wallet className="size-5 text-muted-foreground" />
        <div>
          <h2 className="text-lg font-semibold">Múltiplas moedas</h2>
          <p className="text-sm text-muted-foreground">
            Gestão de múltiplas moedas e carteiras de pontos por membro.
          </p>
        </div>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Construction className="size-4 text-amber-600" />
            <CardTitle className="text-sm text-amber-800">Módulo em especificação</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-amber-800">
          <p>
            Multi-moeda é um item de produto core identificado no backlog, ainda não implementado.
            Prevê suporte a:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Múltiplas carteiras por membro (ex: pontos, cashback, milhas)</li>
            <li>Conversão entre moedas com taxa configurável por tenant</li>
            <li>Expiração independente por carteira</li>
            <li>Extrato unificado ou separado por moeda</li>
            <li>Regras de acúmulo e resgate por tipo de carteira</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
