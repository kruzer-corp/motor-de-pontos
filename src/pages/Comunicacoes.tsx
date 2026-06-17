import { useState } from "react";
import { Card, CardHeader, CardTitle, Button, Badge, Switch } from "@kruzer-corp/ds";
import { Bell, Mail, MessageSquare, Send, MailCheck } from "lucide-react";

type Channel = "email" | "sms" | "push";
type CommEvent = {
  id: string;
  trigger: string;
  description: string;
  channels: Channel[];
  template: string;
  active: boolean;
  lastSent: string;
  totalSent: number;
};

const CHANNEL_LABEL: Record<Channel, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  email: { label: "E-mail", icon: Mail },
  sms: { label: "SMS", icon: MessageSquare },
  push: { label: "Push", icon: Bell },
};

const EVENTS: CommEvent[] = [
  {
    id: "EVT-001",
    trigger: "Boas-vindas ao programa",
    description: "Enviada imediatamente após o membro completar o cadastro e aderir ao programa.",
    channels: ["email", "push"],
    template: "boas-vindas-v2",
    active: true,
    lastSent: "16/06/2025",
    totalSent: 1240,
  },
  {
    id: "EVT-002",
    trigger: "Confirmação de resgate",
    description: "Enviada quando um pedido de resgate é criado pelo membro.",
    channels: ["email", "sms"],
    template: "resgate-confirmacao-v1",
    active: true,
    lastSent: "16/06/2025",
    totalSent: 312,
  },
  {
    id: "EVT-003",
    trigger: "Resgate aprovado",
    description: "Notificação quando o resgate é aprovado pela operação.",
    channels: ["email", "push"],
    template: "resgate-aprovado-v1",
    active: true,
    lastSent: "15/06/2025",
    totalSent: 289,
  },
  {
    id: "EVT-004",
    trigger: "Pontos prestes a expirar",
    description: "Alerta enviado 30 dias antes da expiração de pontos do membro.",
    channels: ["email", "push"],
    template: "expiracao-alerta-v3",
    active: true,
    lastSent: "10/06/2025",
    totalSent: 87,
  },
  {
    id: "EVT-005",
    trigger: "Upgrade de tier",
    description: "Parabeniza o membro ao subir de nível (ex: Bronze → Prata).",
    channels: ["email", "push"],
    template: "tier-upgrade-v2",
    active: true,
    lastSent: "12/06/2025",
    totalSent: 43,
  },
  {
    id: "EVT-006",
    trigger: "Pontos creditados",
    description: "Confirma o crédito de pontos após uma compra elegível.",
    channels: ["push"],
    template: "pontos-creditados-v1",
    active: true,
    lastSent: "16/06/2025",
    totalSent: 4182,
  },
  {
    id: "EVT-007",
    trigger: "Resgate rejeitado",
    description: "Informa o membro sobre a rejeição do pedido de resgate com o motivo.",
    channels: ["email"],
    template: "resgate-rejeitado-v1",
    active: true,
    lastSent: "14/06/2025",
    totalSent: 18,
  },
  {
    id: "EVT-008",
    trigger: "Aniversário do membro",
    description: "Mensagem de aniversário com destaque dos benefícios do mês.",
    channels: ["email", "push"],
    template: "aniversario-v2",
    active: false,
    lastSent: "01/05/2025",
    totalSent: 156,
  },
];

export default function Comunicacoes() {
  const [events, setEvents] = useState(EVENTS);

  const toggleEvent = (id: string) =>
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, active: !e.active } : e))
    );

  const activeCount = events.filter((e) => e.active).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <MailCheck className="size-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">Comunicações Transacionais</h2>
            <p className="text-sm text-muted-foreground">
              Eventos que disparam notificações automáticas aos membros.
            </p>
          </div>
        </div>
        <Badge variant="secondary">{activeCount} de {events.length} ativos</Badge>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {(["email", "sms", "push"] as Channel[]).map((ch) => {
          const Icon = CHANNEL_LABEL[ch].icon;
          const count = events.filter((e) => e.active && e.channels.includes(ch)).length;
          return (
            <Card key={ch} className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="size-5 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{CHANNEL_LABEL[ch].label}</div>
                <div className="text-xl font-bold">{count} evento{count !== 1 ? "s" : ""}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Event list */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos configurados</CardTitle>
        </CardHeader>
        <div className="divide-y divide-border">
          {events.map((event) => (
            <div key={event.id} className={`px-6 py-4 ${!event.active ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Send className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="font-semibold">{event.trigger}</span>
                    <Badge variant="outline" className="font-mono text-xs">{event.id}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <div className="flex gap-1.5">
                      {event.channels.map((ch) => {
                        const Icon = CHANNEL_LABEL[ch].icon;
                        return (
                          <span
                            key={ch}
                            className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
                          >
                            <Icon className="size-3" />
                            {CHANNEL_LABEL[ch].label}
                          </span>
                        );
                      })}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      template: {event.template}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Último envio: {event.lastSent} · {event.totalSent.toLocaleString("pt-BR")} total
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Editar template
                  </Button>
                  <Switch
                    checked={event.active}
                    onCheckedChange={() => toggleEvent(event.id)}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
