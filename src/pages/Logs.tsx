import { useState } from "react";
import { Card, CardHeader, CardTitle, Input, Badge, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@kruzer-corp/ds";
import { Search, Filter } from "lucide-react";

type LogEntry = {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  entity: string;
  entityId: string;
  detail: string;
  result: "sucesso" | "falha" | "pendente";
};

const LOGS: LogEntry[] = [
  {
    id: "LOG-0041",
    timestamp: "16/06/2025 14:23:11",
    operator: "mariana.souza",
    action: "Ajuste manual",
    entity: "Membro",
    entityId: "MBR-00312",
    detail: "+500 pts — Correção de erro de cálculo campanha Jun/25",
    result: "sucesso",
  },
  {
    id: "LOG-0040",
    timestamp: "16/06/2025 11:08:44",
    operator: "mariana.souza",
    action: "Aprovação resgate",
    entity: "Pedido",
    entityId: "REQ-501",
    detail: "Voucher R$50 aprovado para Lívia R.",
    result: "sucesso",
  },
  {
    id: "LOG-0039",
    timestamp: "15/06/2025 17:51:02",
    operator: "admin",
    action: "Criação campanha",
    entity: "Campanha",
    entityId: "CMP-004",
    detail: "Nova campanha 'Super Junho' criada",
    result: "sucesso",
  },
  {
    id: "LOG-0038",
    timestamp: "15/06/2025 16:30:19",
    operator: "joao.ops",
    action: "Ajuste manual",
    entity: "Membro",
    entityId: "MBR-00210",
    detail: "-200 pts — Estorno solicitado pelo membro",
    result: "sucesso",
  },
  {
    id: "LOG-0037",
    timestamp: "14/06/2025 09:12:55",
    operator: "mariana.souza",
    action: "Inativação produto",
    entity: "Produto",
    entityId: "P005",
    detail: "Cafeteira Premium inativada — estoque zerado",
    result: "sucesso",
  },
  {
    id: "LOG-0036",
    timestamp: "13/06/2025 18:44:33",
    operator: "sistema",
    action: "Expiração de pontos",
    entity: "Batch",
    entityId: "BTH-0023",
    detail: "4.200 pts expirados para 18 membros",
    result: "sucesso",
  },
  {
    id: "LOG-0035",
    timestamp: "12/06/2025 08:05:17",
    operator: "joao.ops",
    action: "Ajuste manual",
    entity: "Membro",
    entityId: "MBR-00445",
    detail: "+1.000 pts — Bônus de boas-vindas manual",
    result: "falha",
  },
];

const RESULT_COLOR: Record<LogEntry["result"], string> = {
  sucesso: "bg-emerald-100 text-emerald-700",
  falha: "bg-red-100 text-red-600",
  pendente: "bg-amber-100 text-amber-700",
};

const ACTIONS = ["Todos", "Ajuste manual", "Aprovação resgate", "Criação campanha", "Inativação produto", "Expiração de pontos"];

export default function Logs() {
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("Todos");

  const filtered = LOGS.filter(
    (log) =>
      (action === "Todos" || log.action === action) &&
      (!query ||
        log.id.toLowerCase().includes(query.toLowerCase()) ||
        log.operator.toLowerCase().includes(query.toLowerCase()) ||
        log.entityId.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Logs de Lançamento Manual</h2>
          <p className="text-sm text-muted-foreground">Auditoria de ações operacionais e ajustes.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-9 w-56"
              placeholder="Buscar por ID, operador..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="size-4 text-muted-foreground" />
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                {ACTIONS.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle>Histórico de eventos</CardTitle>
            <Badge variant="secondary">{filtered.length} registros</Badge>
          </div>
        </CardHeader>
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-sm">
            <thead className="border-t border-border bg-muted/20">
              <tr className="text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Data/Hora</th>
                <th className="px-5 py-3 font-medium">Operador</th>
                <th className="px-5 py-3 font-medium">Ação</th>
                <th className="px-5 py-3 font-medium">Entidade</th>
                <th className="px-5 py-3 font-medium">Detalhe</th>
                <th className="px-5 py-3 font-medium">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-muted/20">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{log.id}</td>
                  <td className="px-5 py-3 tabular-nums text-xs whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-5 py-3 font-mono text-xs">{log.operator}</td>
                  <td className="px-5 py-3 whitespace-nowrap">{log.action}</td>
                  <td className="px-5 py-3">
                    <div className="text-xs">
                      <div>{log.entity}</div>
                      <div className="font-mono text-muted-foreground">{log.entityId}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground max-w-xs text-xs">{log.detail}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        RESULT_COLOR[log.result]
                      }`}
                    >
                      {log.result}
                    </span>
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
