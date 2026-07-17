import { useState } from "react";
import {
  Badge, Button, Card, CardContent, CardHeader, CardTitle,
  PageHeader, Pill, SearchInput,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@kruzer/ds";
import { CheckCheck, ExternalLink, FileSignature, Filter, ScrollText } from "lucide-react";

// ── Logs data ──────────────────────────────────────────────────────────────────

type LogResult = "sucesso" | "falha" | "pendente";
type LogEntry = { id: string; timestamp: string; operator: string; action: string; entity: string; entityId: string; detail: string; result: LogResult };

const LOGS: LogEntry[] = [
  { id: "LOG-0043", timestamp: "17/06/2025 10:02:37", operator: "mariana.souza", action: "Exclusão campanha",   entity: "Campanha", entityId: "CMP-008",   detail: "Rascunho 'Teste interno' excluído antes da publicação",  result: "sucesso" },
  { id: "LOG-0042", timestamp: "16/06/2025 16:47:05", operator: "mariana.souza", action: "Edição campanha",     entity: "Campanha", entityId: "CMP-002",   detail: "Ajuste no período de vigência e no teto de emissão",     result: "sucesso" },
  { id: "LOG-0041", timestamp: "16/06/2025 14:23:11", operator: "mariana.souza", action: "Ajuste manual",       entity: "Membro",   entityId: "MBR-00312", detail: "+500 pts — Correção de erro de cálculo campanha Jun/25", result: "sucesso" },
  { id: "LOG-0040", timestamp: "16/06/2025 11:08:44", operator: "mariana.souza", action: "Aprovação resgate",   entity: "Pedido",   entityId: "REQ-501",   detail: "Voucher R$50 aprovado para Lívia R.",                    result: "sucesso" },
  { id: "LOG-0039", timestamp: "15/06/2025 17:51:02", operator: "admin",         action: "Criação campanha",    entity: "Campanha", entityId: "CMP-004",   detail: "Nova campanha 'Super Junho' criada",                     result: "sucesso" },
  { id: "LOG-0038", timestamp: "15/06/2025 16:30:19", operator: "joao.ops",      action: "Ajuste manual",       entity: "Membro",   entityId: "MBR-00210", detail: "-200 pts — Estorno solicitado pelo membro",             result: "sucesso" },
  { id: "LOG-0037", timestamp: "14/06/2025 09:12:55", operator: "mariana.souza", action: "Inativação produto",  entity: "Produto",  entityId: "P005",      detail: "Cafeteira Premium inativada — estoque zerado",           result: "sucesso" },
  { id: "LOG-0036", timestamp: "13/06/2025 18:44:33", operator: "sistema",       action: "Expiração de pontos", entity: "Batch",    entityId: "BTH-0023",  detail: "4.200 pts expirados para 18 membros",                    result: "sucesso" },
  { id: "LOG-0035", timestamp: "12/06/2025 08:05:17", operator: "joao.ops",      action: "Ajuste manual",       entity: "Membro",   entityId: "MBR-00445", detail: "+1.000 pts — Bônus de boas-vindas manual",              result: "falha"   },
];

const RESULT_PILL: Record<LogResult, "success" | "destructive" | "warning"> = {
  sucesso: "success", falha: "destructive", pendente: "warning",
};

const ACTIONS = ["Todos", "Ajuste manual", "Aprovação resgate", "Criação campanha", "Edição campanha", "Exclusão campanha", "Inativação produto", "Expiração de pontos"];

// ── Conformidade data ──────────────────────────────────────────────────────────

const REGULAMENTO_TEXT = `REGULAMENTO DO PROGRAMA DE PONTOS — Programa de Fidelidade

1. OBJETO
O presente regulamento rege o Programa de Pontos Programa de Fidelidade ("Programa"), operado pela Programa de Fidelidade em parceria com a plataforma Kruzer.

2. ELEGIBILIDADE
Podem participar do Programa pessoas físicas ou jurídicas cadastradas como membros ativos da plataforma Programa de Fidelidade.

3. ACÚMULO DE PONTOS
3.1 A cada R$1,00 gasto em compras elegíveis, o membro acumula 1 (um) ponto.
3.2 Campanhas especiais podem conceder multiplicadores de 2× a 5× sobre o valor base.

4. EXPIRAÇÃO
4.1 Pontos acumulados expiram 12 meses após a data de emissão caso não haja movimentação.
4.2 Qualquer transação reinicia o prazo de expiração da totalidade do saldo.

5. RESGATE
5.1 O resgate está disponível para membros com saldo mínimo de 500 pontos.
5.2 O processamento ocorre em até 5 dias úteis após aprovação.

6. DISPOSIÇÕES GERAIS
A Programa de Fidelidade reserva-se o direito de alterar este regulamento mediante aviso prévio de 30 dias.`;

const TERMO_TEXT = `TERMO DE ADESÃO AO PROGRAMA DE PONTOS — Programa de Fidelidade

Ao aderir ao Programa, o participante declara:

I. Ter lido e compreendido o Regulamento do Programa em sua versão vigente;
II. Concordar com as condições de acúmulo, expiração e resgate de pontos;
III. Autorizar o tratamento de seus dados pessoais para fins de operação do Programa, conforme a LGPD (Lei 13.709/2018);
IV. Estar ciente de que a participação não implica qualquer relação de consumo, emprego ou vínculo societário.

O presente Termo é válido por tempo indeterminado e pode ser revogado a qualquer momento.`;

type AcceptEntry = { user: string; profile: string; date: string; version: string };

const REGULAMENTO_LOG: AcceptEntry[] = [
  { user: "Mariana Souza",   profile: "Administrador", date: "03/01/2025 09:12", version: "v2.1" },
  { user: "João Operações",  profile: "Operador",      date: "05/01/2025 14:30", version: "v2.1" },
  { user: "Fernanda Atend.", profile: "Analista",      date: "07/01/2025 11:05", version: "v2.1" },
];

const TERMO_LOG: AcceptEntry[] = [
  { user: "Mariana Souza",  profile: "Administrador", date: "03/01/2025 09:15", version: "v1.0" },
  { user: "João Operações", profile: "Operador",      date: "05/01/2025 14:33", version: "v1.0" },
];

const PROFILES_STATUS = [
  { profile: "Administrador", totalUsers: 1, accepted: 1, pending: 0 },
  { profile: "Operador",      totalUsers: 2, accepted: 1, pending: 1 },
  { profile: "Analista",      totalUsers: 1, accepted: 1, pending: 0 },
  { profile: "Visualizador",  totalUsers: 1, accepted: 0, pending: 1 },
];

function AcceptanceTable({ log }: { log: AcceptEntry[] }) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Versão</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {log.length === 0 ? (
            <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">Nenhum aceite registrado.</TableCell></TableRow>
          ) : log.map((e, i) => (
            <TableRow key={i} className="[&>td]:py-3">
              <TableCell className="font-medium text-sm">{e.user}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{e.profile}</TableCell>
              <TableCell className="tabular-nums text-xs text-muted-foreground">{e.date}</TableCell>
              <TableCell><Badge variant="outline" className="font-mono text-xs">{e.version}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Logs() {
  // Logs state
  const [query,  setQuery]  = useState("");
  const [action, setAction] = useState("Todos");

  // Conformidade state
  const [regAccepted,   setRegAccepted]   = useState(true);
  const [termoAccepted, setTermoAccepted] = useState(false);

  const filteredLogs = LOGS.filter(
    (log) =>
      (action === "Todos" || log.action === action) &&
      (!query ||
        log.id.toLowerCase().includes(query.toLowerCase()) ||
        log.operator.toLowerCase().includes(query.toLowerCase()) ||
        log.entityId.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Logs de auditoria" path={[{ label: "Configuração" }]} description="Auditoria de ações operacionais e conformidade do programa." />

      <Tabs defaultValue="logs">
        <TabsList>
          <TabsTrigger value="logs">Registros</TabsTrigger>
          <TabsTrigger value="conformidade">
            <ScrollText className="mr-1.5 h-3.5 w-3.5" />
            Conformidade
          </TabsTrigger>
        </TabsList>

        {/* ── Registros ── */}
        <TabsContent value="logs" className="mt-4">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border">
              <SearchInput value={query} onChange={setQuery} placeholder="Buscar ID, operador…" className="w-56" />
              <div className="flex items-center gap-1.5">
                <Filter className="size-4 text-muted-foreground" />
                <div className="w-52">
                  <Select value={action} onValueChange={setAction}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ACTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Operador</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Detalhe</TableHead>
                  <TableHead>Resultado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="[&>td]:py-3">
                    <TableCell className="font-mono text-xs text-muted-foreground">{log.id}</TableCell>
                    <TableCell className="tabular-nums text-xs whitespace-nowrap">{log.timestamp}</TableCell>
                    <TableCell className="font-mono text-xs">{log.operator}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{log.action}</TableCell>
                    <TableCell>
                      <div className="text-xs"><div>{log.entity}</div><div className="font-mono text-muted-foreground">{log.entityId}</div></div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs">{log.detail}</TableCell>
                    <TableCell>
                      <Pill color={RESULT_PILL[log.result]} variant="soft" size="sm">{log.result}</Pill>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── Conformidade ── */}
        <TabsContent value="conformidade" className="mt-4">
          <Tabs defaultValue="regulamento">
            <TabsList>
              <TabsTrigger value="regulamento">Regulamento</TabsTrigger>
              <TabsTrigger value="termo">Termo de Adesão</TabsTrigger>
              <TabsTrigger value="politica">Política Comercial</TabsTrigger>
              <TabsTrigger value="por-perfil">Por Perfil</TabsTrigger>
            </TabsList>

            {/* Regulamento */}
            <TabsContent value="regulamento" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Versão v2.1</Badge>
                {regAccepted
                  ? <div className="flex items-center gap-1.5 text-success text-sm font-medium"><CheckCheck className="size-4" />Aceito por este perfil</div>
                  : <Button size="sm" onClick={() => setRegAccepted(true)}><CheckCheck className="size-4 mr-1.5" />Registrar aceite</Button>
                }
              </div>
              <div className="rounded-lg border border-border bg-muted/10 p-5 max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-xs leading-relaxed font-sans text-foreground">{REGULAMENTO_TEXT}</pre>
              </div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Log de aceite</div>
              <AcceptanceTable log={REGULAMENTO_LOG} />
            </TabsContent>

            {/* Termo */}
            <TabsContent value="termo" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Versão v1.0</Badge>
                {termoAccepted
                  ? <div className="flex items-center gap-1.5 text-success text-sm font-medium"><CheckCheck className="size-4" />Aceito por este perfil</div>
                  : <Button size="sm" onClick={() => setTermoAccepted(true)}><CheckCheck className="size-4 mr-1.5" />Registrar aceite</Button>
                }
              </div>
              <div className="rounded-lg border border-border bg-muted/10 p-5 max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-xs leading-relaxed font-sans text-foreground">{TERMO_TEXT}</pre>
              </div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Log de aceite</div>
              <AcceptanceTable log={TERMO_LOG} />
            </TabsContent>

            {/* Política Comercial */}
            <TabsContent value="politica" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>Política Comercial — Programa de Fidelidade</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">Documento completo de regras comerciais e condições de parceria.</p>
                    </div>
                    <Badge variant="secondary">Vigente</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[["Versão vigente","2025-06"],["Data de publicação","01/01/2025"],["Revisão programada","01/01/2026"],["Responsável","Diretoria Comercial"]].map(([label, value]) => (
                      <div key={label} className="rounded-lg bg-muted/30 px-4 py-3">
                        <div className="text-xs text-muted-foreground">{label}</div>
                        <div className="mt-0.5 text-sm font-medium">{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button asChild><a href="https://www.fastpro.com.br/web/c/politicas" target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4 mr-1.5" />Abrir no site</a></Button>
                    <Button variant="outline"><FileSignature className="size-4 mr-1.5" />Baixar PDF</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Por Perfil */}
            <TabsContent value="por-perfil" className="mt-4">
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Perfil</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Aceitaram</TableHead>
                      <TableHead className="text-center">Pendentes</TableHead>
                      <TableHead>Cobertura</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PROFILES_STATUS.map((row) => {
                      const pct = row.totalUsers > 0 ? Math.round((row.accepted / row.totalUsers) * 100) : 0;
                      return (
                        <TableRow key={row.profile} className="[&>td]:py-3.5">
                          <TableCell className="font-medium text-sm">{row.profile}</TableCell>
                          <TableCell className="text-center tabular-nums text-sm">{row.totalUsers}</TableCell>
                          <TableCell className="text-center"><Pill color="success" variant="soft" size="sm">{row.accepted}</Pill></TableCell>
                          <TableCell className="text-center">
                            {row.pending > 0 ? <Pill color="warning" variant="soft" size="sm">{row.pending}</Pill> : <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full bg-border max-w-[120px]">
                                <div className="h-1.5 rounded-full bg-success" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs tabular-nums text-muted-foreground">{pct}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
