import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Switch } from "@kruzer/ds";
import { Webhook, Plus, Copy, RefreshCw } from "lucide-react";

type EventStatus = "ativo" | "inativo";

type WebhookEvent = {
  id: string;
  event: string;
  description: string;
  active: boolean;
  lastFired: string;
  deliveries: number;
};

type EndpointEntry = {
  id: string;
  url: string;
  status: EventStatus;
  secret: string;
  events: string[];
  lastDelivery: string;
};

const EVENTS: WebhookEvent[] = [
  { id: "EVT-WH-001", event: "member.created",          description: "Novo membro cadastrado no programa.",           active: true,  lastFired: "16/06/2025 14:05", deliveries: 1240 },
  { id: "EVT-WH-002", event: "member.tier_upgraded",    description: "Membro subiu de nível.",                       active: true,  lastFired: "12/06/2025 10:00", deliveries: 43 },
  { id: "EVT-WH-003", event: "points.credited",         description: "Pontos creditados na carteira do membro.",     active: true,  lastFired: "16/06/2025 14:03", deliveries: 4182 },
  { id: "EVT-WH-004", event: "points.expired",          description: "Pontos expirados por inatividade.",            active: true,  lastFired: "13/06/2025 02:00", deliveries: 87 },
  { id: "EVT-WH-005", event: "redemption.created",      description: "Pedido de resgate criado pelo membro.",        active: true,  lastFired: "16/06/2025 11:08", deliveries: 312 },
  { id: "EVT-WH-006", event: "redemption.approved",     description: "Resgate aprovado pela operação.",              active: true,  lastFired: "16/06/2025 11:10", deliveries: 289 },
  { id: "EVT-WH-007", event: "redemption.rejected",     description: "Resgate rejeitado.",                           active: true,  lastFired: "14/06/2025 09:00", deliveries: 18 },
  { id: "EVT-WH-008", event: "campaign.activated",      description: "Campanha ativada no programa.",                active: false, lastFired: "01/06/2025 00:00", deliveries: 6 },
  { id: "EVT-WH-009", event: "campaign.deactivated",    description: "Campanha desativada.",                         active: false, lastFired: "30/05/2025 23:59", deliveries: 4 },
];

const ENDPOINTS: EndpointEntry[] = [
  {
    id: "EP-001",
    url: "https://api.fastpro.com.br/kruzer/events",
    status: "ativo",
    secret: "whsec_••••••••••••••••",
    events: ["member.created", "points.credited", "redemption.created", "redemption.approved"],
    lastDelivery: "16/06/2025 14:05",
  },
];

export default function Webhooks() {
  const [events, setEvents] = useState(EVENTS);

  const toggleEvent = (id: string) =>
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, active: !e.active } : e)));

  const activeCount = events.filter((e) => e.active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Webhook className="size-5 text-muted-foreground" />
        <div>
          <h2 className="text-lg font-semibold">Webhooks / Eventos</h2>
          <p className="text-sm text-muted-foreground">
            Eventing é produto — configure endpoints para receber eventos do programa.
          </p>
        </div>
      </div>

      {/* Endpoints */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Endpoints configurados</CardTitle>
            <Button size="sm">
              <Plus className="size-3.5 mr-1.5" />
              Novo endpoint
            </Button>
          </div>
        </CardHeader>
        <div className="divide-y divide-border">
          {ENDPOINTS.map((ep) => (
            <div key={ep.id} className="px-5 py-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-sm font-medium truncate">{ep.url}</span>
                  <button className="shrink-0 text-muted-foreground hover:text-foreground">
                    <Copy className="size-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    ep.status === "ativo" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {ep.status}
                  </span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <RefreshCw className="size-3 mr-1" />
                    Testar
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-muted-foreground">Último envio: {ep.lastDelivery}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">Secret: <span className="font-mono">{ep.secret}</span></span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ep.events.map((ev) => (
                  <Badge key={ev} variant="outline" className="font-mono text-xs">{ev}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Event catalog */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Catálogo de eventos</CardTitle>
            <Badge variant="secondary">{activeCount} de {events.length} ativos</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">
            Ative os eventos que deseja receber no endpoint. O conector específico (ex: CRM Insider, GA) é configurado fora daqui — esses são os eventos genéricos do produto.
          </p>
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            {events.map((ev) => (
              <div key={ev.id} className={`flex items-center gap-4 px-4 py-3 ${!ev.active ? "opacity-60" : ""}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">{ev.event}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{ev.description}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Último disparo: {ev.lastFired} · {ev.deliveries.toLocaleString("pt-BR")} entregas
                  </div>
                </div>
                <Switch
                  checked={ev.active}
                  onCheckedChange={() => toggleEvent(ev.id)}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
