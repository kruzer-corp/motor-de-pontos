import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@kruzer/ds";
import { CheckCheck, ExternalLink, ScrollText, FileSignature } from "lucide-react";

// ── Mock document text ──────────────────────────────────────────────

const REGULAMENTO_TEXT = `REGULAMENTO DO PROGRAMA DE PONTOS — FAST PRO

1. OBJETO
O presente regulamento rege o Programa de Pontos FAST PRO ("Programa"), operado pela FAST PRO em parceria com a plataforma Kruzer.

2. ELEGIBILIDADE
Podem participar do Programa pessoas físicas ou jurídicas cadastradas como membros ativos da plataforma FAST PRO.

3. ACÚMULO DE PONTOS
3.1 A cada R$1,00 gasto em compras elegíveis, o membro acumula 1 (um) ponto.
3.2 Campanhas especiais podem conceder multiplicadores de 2× a 5× sobre o valor base.
3.3 Pontos de bônus por categorias específicas são definidos periodicamente.

4. EXPIRAÇÃO
4.1 Pontos acumulados expiram 12 (doze) meses após a data de emissão caso não haja movimentação.
4.2 Qualquer transação de acúmulo ou resgate reinicia o prazo de expiração da totalidade do saldo.

5. RESGATE
5.1 O resgate está disponível para membros com saldo mínimo de 500 pontos.
5.2 O processamento ocorre em até 5 dias úteis após aprovação.

6. DISPOSIÇÕES GERAIS
A FAST PRO reserva-se o direito de alterar este regulamento mediante aviso prévio de 30 dias.`;

const TERMO_TEXT = `TERMO DE ADESÃO AO PROGRAMA DE PONTOS — FAST PRO

Ao aderir ao Programa de Pontos FAST PRO, o participante declara:

I. Ter lido e compreendido o Regulamento do Programa em sua versão vigente;
II. Concordar com as condições de acúmulo, expiração e resgate de pontos;
III. Autorizar o tratamento de seus dados pessoais para fins de operação do Programa, conforme a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018);
IV. Estar ciente de que a participação no Programa não implica qualquer relação de consumo, emprego ou vínculo societário com a FAST PRO

O presente Termo é válido por tempo indeterminado e pode ser revogado pelo participante a qualquer momento mediante solicitação formal.`;

// ── Acceptance log ──────────────────────────────────────────────────

type AcceptEntry = { user: string; profile: string; date: string; version: string };

const REGULAMENTO_LOG: AcceptEntry[] = [
  { user: "Mariana Souza", profile: "Administrador", date: "03/01/2025 09:12", version: "v2.1" },
  { user: "João Operações", profile: "Operador", date: "05/01/2025 14:30", version: "v2.1" },
  { user: "Fernanda Atend.", profile: "Analista", date: "07/01/2025 11:05", version: "v2.1" },
];

const TERMO_LOG: AcceptEntry[] = [
  { user: "Mariana Souza", profile: "Administrador", date: "03/01/2025 09:15", version: "v1.0" },
  { user: "João Operações", profile: "Operador", date: "05/01/2025 14:33", version: "v1.0" },
];

// ── By-profile view ─────────────────────────────────────────────────

const PROFILES_STATUS = [
  { profile: "Administrador", totalUsers: 1, accepted: 1, pending: 0 },
  { profile: "Operador", totalUsers: 2, accepted: 1, pending: 1 },
  { profile: "Analista", totalUsers: 1, accepted: 1, pending: 0 },
  { profile: "Visualizador", totalUsers: 1, accepted: 0, pending: 1 },
];

// ── DocumentViewer ───────────────────────────────────────────────────

function DocumentViewer({
  content,
  version,
  log,
  onAccept,
  accepted,
}: {
  content: string;
  version: string;
  log: AcceptEntry[];
  onAccept: () => void;
  accepted: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Badge variant="secondary">Versão {version}</Badge>
        {accepted ? (
          <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
            <CheckCheck className="size-4" />
            Aceito por este perfil
          </div>
        ) : (
          <Button size="sm" onClick={onAccept}>
            <CheckCheck className="size-4 mr-1.5" />
            Registrar aceite
          </Button>
        )}
      </div>

      {/* Document content */}
      <div className="rounded-2xl border border-border bg-muted/10 p-5 max-h-64 overflow-y-auto">
        <pre className="whitespace-pre-wrap text-xs leading-relaxed font-sans text-foreground">
          {content}
        </pre>
      </div>

      {/* Acceptance log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Log de aceite</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-t border-border bg-muted/20">
              <tr className="text-left text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Usuário</th>
                <th className="px-5 py-2.5 font-medium">Perfil</th>
                <th className="px-5 py-2.5 font-medium">Data/Hora</th>
                <th className="px-5 py-2.5 font-medium">Versão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {log.map((entry, i) => (
                <tr key={i} className="hover:bg-muted/20">
                  <td className="px-5 py-2.5 font-medium">{entry.user}</td>
                  <td className="px-5 py-2.5 text-muted-foreground">{entry.profile}</td>
                  <td className="px-5 py-2.5 tabular-nums text-xs">{entry.date}</td>
                  <td className="px-5 py-2.5">
                    <Badge variant="outline" className="font-mono text-xs">{entry.version}</Badge>
                  </td>
                </tr>
              ))}
              {log.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-4 text-center text-sm text-muted-foreground">
                    Nenhum aceite registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────

export default function Conformidade() {
  const [regAccepted, setRegAccepted] = useState(true);
  const [termoAccepted, setTermoAccepted] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <ScrollText className="size-5 text-muted-foreground" />
        <div>
          <h2 className="text-lg font-semibold">Conformidade</h2>
          <p className="text-sm text-muted-foreground">
            Regulamentos, termos e política comercial do programa.
          </p>
        </div>
      </div>

      <Tabs defaultValue="regulamento">
        <TabsList>
          <TabsTrigger value="regulamento">Regulamento</TabsTrigger>
          <TabsTrigger value="termo">Termo de Adesão</TabsTrigger>
          <TabsTrigger value="politica">Política Comercial</TabsTrigger>
          <TabsTrigger value="por-perfil">Por Perfil</TabsTrigger>
        </TabsList>

        {/* ── Regulamento (items 15 + parte do 18) ── */}
        <TabsContent value="regulamento" className="mt-4">
          <DocumentViewer
            content={REGULAMENTO_TEXT}
            version="v2.1"
            log={REGULAMENTO_LOG}
            accepted={regAccepted}
            onAccept={() => setRegAccepted(true)}
          />
        </TabsContent>

        {/* ── Termo de Adesão (item 16) ── */}
        <TabsContent value="termo" className="mt-4">
          <DocumentViewer
            content={TERMO_TEXT}
            version="v1.0"
            log={TERMO_LOG}
            accepted={termoAccepted}
            onAccept={() => setTermoAccepted(true)}
          />
        </TabsContent>

        {/* ── Política Comercial (item 17) ── */}
        <TabsContent value="politica" className="mt-4">
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>Política Comercial — FAST PRO</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Documento completo de regras comerciais e condições de parceria.
                    </p>
                  </div>
                  <Badge variant="secondary">Vigente</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "Versão vigente", value: "2025-06" },
                    { label: "Data de publicação", value: "01/01/2025" },
                    { label: "Revisão programada", value: "01/01/2026" },
                    { label: "Responsável", value: "Diretoria Comercial" },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl bg-muted/30 px-4 py-3">
                      <div className="text-xs text-muted-foreground">{label}</div>
                      <div className="mt-0.5 text-sm font-medium">{value}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <Button asChild>
                    <a
                      href="https://www.fastpro.com.br/web/c/politicas"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-4 mr-1.5" />
                      Abrir no site FAST PRO
                    </a>
                  </Button>
                  <Button variant="outline">
                    <FileSignature className="size-4 mr-1.5" />
                    Baixar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Por Perfil (item 18) ── */}
        <TabsContent value="por-perfil" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Status de aceite por perfil</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-t border-border bg-muted/20">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Perfil</th>
                    <th className="px-6 py-3 font-medium text-center">Total de usuários</th>
                    <th className="px-6 py-3 font-medium text-center">Aceitaram</th>
                    <th className="px-6 py-3 font-medium text-center">Pendentes</th>
                    <th className="px-6 py-3 font-medium">Cobertura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {PROFILES_STATUS.map((row) => {
                    const pct = row.totalUsers > 0 ? Math.round((row.accepted / row.totalUsers) * 100) : 0;
                    return (
                      <tr key={row.profile} className="hover:bg-muted/20">
                        <td className="px-6 py-4 font-medium">{row.profile}</td>
                        <td className="px-6 py-4 text-center tabular-nums">{row.totalUsers}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700">
                            {row.accepted}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {row.pending > 0 ? (
                            <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700">
                              {row.pending}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-border max-w-[120px]">
                              <div
                                className="h-1.5 rounded-full bg-emerald-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs tabular-nums text-muted-foreground">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
