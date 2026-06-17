import { useState } from "react";
import { Card, CardHeader, CardTitle, Button, Badge, Input } from "@kruzer-corp/ds";
import { Search, Mail, MessageSquare, Bell, Eye, ChevronDown, ChevronRight } from "lucide-react";

type Channel = "email" | "sms" | "push";

type Comunicado = {
  id: string;
  subject: string;
  event: string;
  channel: Channel;
  sentAt: string;
  recipients: number;
  opened: number;
  status: "enviado" | "falha" | "parcial";
  preview: string;
};

const CHANNEL_ICON: Record<Channel, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  sms: MessageSquare,
  push: Bell,
};

const STATUS_COLOR: Record<string, string> = {
  enviado: "bg-emerald-100 text-emerald-700",
  falha: "bg-red-100 text-red-600",
  parcial: "bg-amber-100 text-amber-700",
};

const COMUNICADOS: Comunicado[] = [
  {
    id: "COM-0088",
    subject: "Seus pontos foram creditados!",
    event: "Pontos creditados",
    channel: "push",
    sentAt: "16/06/2025 14:05",
    recipients: 312,
    opened: 218,
    status: "enviado",
    preview: "Olá, {nome}! Você acabou de receber {pts} pontos pela sua compra de ontem. Acesse o app para ver seu saldo.",
  },
  {
    id: "COM-0087",
    subject: "Seu resgate foi aprovado ✓",
    event: "Resgate aprovado",
    channel: "email",
    sentAt: "16/06/2025 11:12",
    recipients: 7,
    opened: 5,
    status: "enviado",
    preview: "Oi {nome}, ótima notícia! Seu resgate de {produto} foi aprovado. Você receberá em até 5 dias úteis.",
  },
  {
    id: "COM-0086",
    subject: "Atualização: status do seu pedido",
    event: "Confirmação de resgate",
    channel: "sms",
    sentAt: "15/06/2025 18:30",
    recipients: 14,
    opened: 14,
    status: "enviado",
    preview: "FAST PRO: Seu pedido {id} foi recebido. Acompanhe em fastpro.com.br/pro",
  },
  {
    id: "COM-0085",
    subject: "⚠️ Seus pontos vencem em 30 dias",
    event: "Pontos prestes a expirar",
    channel: "email",
    sentAt: "10/06/2025 08:00",
    recipients: 87,
    opened: 61,
    status: "enviado",
    preview: "Atenção, {nome}! Você tem {pts} pontos que expiram em {data}. Não perca — resgate agora!",
  },
  {
    id: "COM-0084",
    subject: "Parabéns! Você subiu para o nível Ouro 🥇",
    event: "Upgrade de tier",
    channel: "email",
    sentAt: "12/06/2025 10:00",
    recipients: 11,
    opened: 9,
    status: "enviado",
    preview: "Incrível, {nome}! Você acumulou pontos suficientes e agora é um membro Ouro. Confira seus novos benefícios.",
  },
  {
    id: "COM-0083",
    subject: "Bem-vindo ao FAST PRO!",
    event: "Boas-vindas ao programa",
    channel: "email",
    sentAt: "08/06/2025 09:00",
    recipients: 43,
    opened: 31,
    status: "enviado",
    preview: "Olá, {nome}! É muito bom ter você no FAST PRO. Seu cadastro está completo e você já pode começar a acumular pontos.",
  },
  {
    id: "COM-0082",
    subject: "Alerta de push — falha no envio",
    event: "Pontos creditados",
    channel: "push",
    sentAt: "07/06/2025 14:00",
    recipients: 280,
    opened: 0,
    status: "falha",
    preview: "Erro 503 no provedor de push. Reenvio agendado.",
  },
];

export default function Comunicados() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const filtered = COMUNICADOS.filter(
    (c) =>
      !query ||
      c.subject.toLowerCase().includes(query.toLowerCase()) ||
      c.event.toLowerCase().includes(query.toLowerCase()) ||
      c.id.toLowerCase().includes(query.toLowerCase())
  );

  const totalSent = COMUNICADOS.reduce((a, c) => a + c.recipients, 0);
  const totalOpened = COMUNICADOS.reduce((a, c) => a + c.opened, 0);
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Histórico de Comunicados</h2>
          <p className="text-sm text-muted-foreground">
            Todos os envios transacionais registrados.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            className="pl-9 w-64"
            placeholder="Buscar por assunto, evento, ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total de envios", value: totalSent.toLocaleString("pt-BR"), sub: "registros" },
          { label: "Total abertos", value: totalOpened.toLocaleString("pt-BR"), sub: "leituras" },
          { label: "Taxa de abertura", value: `${openRate}%`, sub: "média geral" },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="mt-1 text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.sub}</div>
          </Card>
        ))}
      </div>

      {/* Log table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Envios ({filtered.length})</CardTitle>
          </div>
        </CardHeader>
        <div className="divide-y divide-border">
          {filtered.map((com) => {
            const Icon = CHANNEL_ICON[com.channel];
            const isOpen = expanded[com.id];
            const openPct = com.recipients > 0 ? Math.round((com.opened / com.recipients) * 100) : 0;

            return (
              <div key={com.id}>
                <button
                  onClick={() => toggle(com.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 hover:bg-muted/20 text-left transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="size-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sm truncate">{com.subject}</span>
                      <Badge variant="outline" className="font-mono text-xs shrink-0">{com.id}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {com.event} · {com.sentAt}
                    </div>
                  </div>
                  <div className="text-right shrink-0 space-y-0.5">
                    <div className="text-xs tabular-nums">
                      <span className="font-medium">{com.recipients}</span>
                      <span className="text-muted-foreground"> enviados</span>
                    </div>
                    <div className="text-xs tabular-nums text-muted-foreground">
                      {openPct}% abertos
                    </div>
                  </div>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 ${STATUS_COLOR[com.status]}`}>
                    {com.status}
                  </span>
                  {isOpen ? (
                    <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="border-t border-border bg-muted/10 px-5 py-4 space-y-3">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Prévia do conteúdo
                    </div>
                    <div className="rounded-xl border border-border bg-card p-3 text-sm leading-relaxed">
                      {com.preview}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        <Eye className="size-3 mr-1" />
                        Ver template completo
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        Reenviar para falhas
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
