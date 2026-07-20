import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Switch, FormDrawer, Input, Label, ConfirmDialog } from "@kruzer/ds";
import { Webhook, Plus, Copy, RefreshCw, Key, ArrowDownToLine, ArrowUpFromLine, CheckCircle2, XCircle, Check } from "lucide-react";

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

type InboundLog = {
  id: string;
  status: 200 | 422 | 500;
  event: string;
  member: string;
  receivedAt: string;
  source: string;
};

const EVENTS: WebhookEvent[] = [
  { id: "EVT-WH-001", event: "member.created",       description: "Novo membro cadastrado no programa.",        active: true,  lastFired: "16/06/2025 14:05", deliveries: 1240 },
  { id: "EVT-WH-002", event: "member.tier_upgraded",  description: "Membro subiu de nível.",                    active: true,  lastFired: "12/06/2025 10:00", deliveries: 43 },
  { id: "EVT-WH-003", event: "points.credited",       description: "Pontos creditados na carteira do membro.",  active: true,  lastFired: "16/06/2025 14:03", deliveries: 4182 },
  { id: "EVT-WH-004", event: "points.expired",        description: "Pontos expirados por inatividade.",         active: true,  lastFired: "13/06/2025 02:00", deliveries: 87 },
  { id: "EVT-WH-005", event: "redemption.created",    description: "Pedido de resgate criado pelo membro.",     active: true,  lastFired: "16/06/2025 11:08", deliveries: 312 },
  { id: "EVT-WH-006", event: "redemption.approved",   description: "Resgate aprovado pela operação.",           active: true,  lastFired: "16/06/2025 11:10", deliveries: 289 },
  { id: "EVT-WH-007", event: "redemption.rejected",   description: "Resgate rejeitado.",                        active: true,  lastFired: "14/06/2025 09:00", deliveries: 18 },
  { id: "EVT-WH-008", event: "campaign.activated",    description: "Campanha ativada no programa.",             active: false, lastFired: "01/06/2025 00:00", deliveries: 6 },
  { id: "EVT-WH-009", event: "campaign.deactivated",  description: "Campanha desativada.",                      active: false, lastFired: "30/05/2025 23:59", deliveries: 4 },
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

const INBOUND_LOG: InboundLog[] = [
  { id: "IN-001", status: 200, event: "purchase.completed", member: "Aline Pereira",  receivedAt: "13/07 14:32", source: "VTEX" },
  { id: "IN-002", status: 200, event: "member.registered",  member: "Bruno Cardoso",  receivedAt: "13/07 11:08", source: "VTEX" },
  { id: "IN-003", status: 422, event: "purchase.completed", member: "—",              receivedAt: "12/07 09:15", source: "Shopify" },
  { id: "IN-004", status: 200, event: "purchase.cancelled", member: "Danilo Ramos",   receivedAt: "11/07 18:40", source: "VTEX" },
];

const PLATFORMS = ["VTEX", "Shopify", "Magento", "Nuvemshop", "TOTVS", "Loja Integrada", "Qualquer REST"];

type IntegrationStatus = "configurado" | "disponível" | "em breve";
type IntegrationDirection = "entrada" | "saída" | "bidirecional";

type Integration = {
  id: string;
  name: string;
  description: string;
  direction: IntegrationDirection;
  enables: string;
  platforms: string[];
  status: IntegrationStatus;
};

const INTEGRATIONS: Integration[] = [
  {
    id: "INT-001",
    name: "Ecommerce",
    description: "Recebe eventos de compra, cadastro e cancelamento. Devolve cupons e créditos como resgate.",
    direction: "bidirecional",
    enables: "Pontos por compra · Cupom · Crédito em loja",
    platforms: ["VTEX", "Shopify", "Magento", "Nuvemshop", "Loja Integrada"],
    status: "configurado",
  },
  {
    id: "INT-002",
    name: "Comunicação (ESP)",
    description: "Envia eventos do programa para ferramentas de e-mail, SMS e push acionarem comunicações automáticas.",
    direction: "saída",
    enables: "Régua de comunicação por evento de loyalty",
    platforms: ["Klaviyo", "RD Station", "Braze", "Insider", "Salesforce Marketing"],
    status: "configurado",
  },
  {
    id: "INT-003",
    name: "CRM",
    description: "Sincroniza saldo, tier e histórico do membro com o CRM para que o time de vendas tenha visibilidade completa.",
    direction: "bidirecional",
    enables: "Loyalty visível no contexto de vendas B2B",
    platforms: ["Salesforce", "HubSpot", "Dynamics", "Pipedrive"],
    status: "configurado",
  },
  {
    id: "INT-004",
    name: "Ponto de venda (POS)",
    description: "Identifica o membro no caixa, registra compras em loja física e processa resgates presenciais.",
    direction: "entrada",
    enables: "Acúmulo e resgate omnichannel",
    platforms: ["Linx", "TOTVS PDV", "Stone", "Rede"],
    status: "disponível",
  },
  {
    id: "INT-005",
    name: "Gateway de pagamento",
    description: "Deposita cashback diretamente como crédito, Pix ou saldo em carteira digital após resgate aprovado.",
    direction: "saída",
    enables: "Cashback · Pix · Carteira digital como moeda de resgate",
    platforms: ["Cielo", "Stone", "PagSeguro", "Mercado Pago", "Pix"],
    status: "disponível",
  },
  {
    id: "INT-006",
    name: "CDP / Analytics",
    description: "Exporta eventos e scores de loyalty para plataformas de audiência e análise comportamental.",
    direction: "saída",
    enables: "Segmentação por comportamento de loyalty",
    platforms: ["Segment", "Amplitude", "GA4", "Mixpanel", "mParticle"],
    status: "disponível",
  },
  {
    id: "INT-007",
    name: "Identity / SSO",
    description: "Autentica o membro no portal B2C usando o login existente da plataforma de ecommerce — sem nova senha.",
    direction: "entrada",
    enables: "Login único para o portal do membro",
    platforms: ["OAuth 2.0", "OIDC", "VTEX ID", "Shopify Multipass"],
    status: "em breve",
  },
];

function generateSecret() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return "whsec_" + Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function Webhooks() {
  const [events, setEvents] = useState(EVENTS);
  const [endpoints, setEndpoints] = useState(ENDPOINTS);

  // Confirm inactivate endpoint
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);

  // Confirm deactivate event
  const [confirmEventId, setConfirmEventId] = useState<string | null>(null);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const toggleEvent = (id: string) => {
    const ev = events.find((e) => e.id === id);
    if (!ev) return;
    if (ev.active) {
      setConfirmEventId(id); // exige confirmação para desativar
    } else {
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, active: true } : e)));
    }
  };

  const confirmDeactivateEvent = () => {
    if (!confirmEventId) return;
    setEvents((prev) => prev.map((e) => (e.id === confirmEventId ? { ...e, active: false } : e)));
    setConfirmEventId(null);
  };

  const toggleEndpointStatus = (id: string) => {
    const ep = endpoints.find((e) => e.id === id);
    if (!ep) return;
    if (ep.status === "ativo") {
      setConfirmTarget(id); // exige confirmação para inativar
    } else {
      setEndpoints((prev) => prev.map((e) => (e.id === id ? { ...e, status: "ativo" } : e)));
    }
  };

  const confirmInactivate = () => {
    if (!confirmTarget) return;
    setEndpoints((prev) => prev.map((e) => (e.id === confirmTarget ? { ...e, status: "inativo" } : e)));
    setConfirmTarget(null);
  };

  const toggleSelectedEvent = (eventName: string) =>
    setSelectedEvents((prev) =>
      prev.includes(eventName) ? prev.filter((e) => e !== eventName) : [...prev, eventName]
    );

  const resetDrawer = () => {
    setNewUrl("");
    setNewDescription("");
    setSelectedEvents([]);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      const newEndpoint: EndpointEntry = {
        id: `EP-${String(endpoints.length + 1).padStart(3, "0")}`,
        url: newUrl,
        status: "ativo",
        secret: generateSecret(),
        events: selectedEvents,
        lastDelivery: "—",
      };
      setEndpoints((prev) => [...prev, newEndpoint]);
      setSaving(false);
      setDrawerOpen(false);
      resetDrawer();
    }, 800);
  };

  const activeCount = events.filter((e) => e.active).length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Webhook className="size-5 text-muted-foreground" />
        <div>
          <h2 className="text-lg font-semibold">Conectividade</h2>
          <p className="text-sm text-muted-foreground">
            Entrada: credenciais para plataformas enviarem eventos ao Motor. Saída: webhooks para ESPs e ferramentas receberem eventos do programa.
          </p>
        </div>
      </div>

      {/* ── MAPA DE INTEGRAÇÕES ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mapa de integrações</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Todas as categorias de integração do Motor — configure cada uma para habilitar os tipos de moeda e benefício correspondentes.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {INTEGRATIONS.map((intg) => (
              <div key={intg.id} className="flex items-start gap-4 px-5 py-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">{intg.name}</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      intg.direction === "entrada"
                        ? "bg-sky-50 text-sky-700"
                        : intg.direction === "saída"
                        ? "bg-violet-50 text-violet-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}>
                      {intg.direction === "entrada" ? "← entrada" : intg.direction === "saída" ? "→ saída" : "⇄ bidirecional"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{intg.description}</p>
                  <p className="text-xs font-medium text-foreground/70">{intg.enables}</p>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {intg.platforms.map((p) => (
                      <Badge key={p} variant="outline" className="text-xs font-normal">{p}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                  {intg.status === "configurado" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="size-3" /> Configurado
                    </span>
                  ) : intg.status === "em breve" ? (
                    <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                      Em breve
                    </span>
                  ) : (
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      Configurar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── ENTRADA ── */}
      <div className="flex items-center gap-3">
        <ArrowDownToLine className="size-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Entrada</span>
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">Plataformas de ecommerce → Motor</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credenciais de entrada</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Use a API Key e o endpoint abaixo para autenticar chamadas de qualquer plataforma que envia eventos ao Motor.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* API Key + Endpoint */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Key className="size-3" /> API Key do programa
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs font-mono text-muted-foreground truncate">
                  mk_live_••••••••••••••••••••••••••
                </code>
                <Button variant="outline" size="sm" className="h-8 shrink-0">
                  <Copy className="size-3 mr-1" /> Copiar
                </Button>
                <Button variant="outline" size="sm" className="h-8 shrink-0">
                  <RefreshCw className="size-3" />
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Endpoint de recebimento
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs font-mono text-foreground truncate">
                  https://api.kruzer.io/v1/events
                </code>
                <Button variant="outline" size="sm" className="h-8 shrink-0">
                  <Copy className="size-3 mr-1" /> Copiar
                </Button>
              </div>
            </div>
          </div>

          {/* Platforms */}
          <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Compatível com</p>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map((p) => (
                <Badge key={p} variant="outline" className="text-xs font-medium">{p}</Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              A plataforma envia eventos (compra, cadastro, cancelamento) usando a API Key no header{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">X-Kruzer-Key</code>.{" "}
              <a href="#" className="text-primary font-medium hover:underline">Ver payloads esperados ↗</a>
            </p>
          </div>

          {/* Inbound log */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Últimos eventos recebidos</p>
            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
              {INBOUND_LOG.map((log) => (
                <div key={log.id} className="flex items-center gap-3 px-3 py-2.5">
                  {log.status === 200 ? (
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="size-3.5 text-red-500 shrink-0" />
                  )}
                  <span className={`text-xs font-bold w-8 shrink-0 ${log.status === 200 ? "text-emerald-600" : "text-red-600"}`}>
                    {log.status}
                  </span>
                  <Badge variant="outline" className="font-mono text-xs shrink-0">{log.event}</Badge>
                  <span className="text-xs text-foreground flex-1 truncate">{log.member}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{log.source}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{log.receivedAt}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── SAÍDA ── */}
      <div className="flex items-center gap-3">
        <ArrowUpFromLine className="size-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Saída</span>
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">Motor → ESP · plataformas · ferramentas</span>
      </div>

      {/* Endpoints */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Endpoints configurados</CardTitle>
            <Button size="sm" onClick={() => setDrawerOpen(true)}>
              <Plus className="size-3.5 mr-1.5" />
              Novo endpoint
            </Button>
          </div>
        </CardHeader>
        <div className="divide-y divide-border">
          {endpoints.map((ep) => (
            <div key={ep.id} className="px-5 py-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-sm font-medium truncate">{ep.url}</span>
                  <button className="shrink-0 text-muted-foreground hover:text-foreground">
                    <Copy className="size-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <RefreshCw className="size-3 mr-1" />
                    Testar
                  </Button>
                  <Switch
                    checked={ep.status === "ativo"}
                    onCheckedChange={() => toggleEndpointStatus(ep.id)}
                    size="sm"
                  />
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
      {/* ConfirmDialog — Inativar endpoint */}
      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(o) => { if (!o) setConfirmTarget(null); }}
        title="Inativar endpoint?"
        description="Eventos emitidos enquanto o endpoint estiver inativo serão descartados permanentemente — não há reenvio retroativo. Ative novamente quando quiser retomar as entregas."
        confirmLabel="Inativar"
        variant="destructive"
        onConfirm={confirmInactivate}
      />

      {/* ConfirmDialog — Desativar evento */}
      <ConfirmDialog
        open={!!confirmEventId}
        onOpenChange={(o) => { if (!o) setConfirmEventId(null); }}
        title="Desativar evento?"
        description="Enquanto desativado, nenhuma entrega será feita para este evento em nenhum endpoint. Ocorrências durante o período inativo são descartadas — não há reenvio retroativo."
        confirmLabel="Desativar"
        variant="destructive"
        onConfirm={confirmDeactivateEvent}
      />

      {/* FormDrawer — Novo endpoint */}
      <FormDrawer
        open={drawerOpen}
        onOpenChange={(o) => { setDrawerOpen(o); if (!o) resetDrawer(); }}
        title="Novo endpoint"
        description="Configure um destino para receber eventos do Motor. O secret é gerado automaticamente."
        onSave={handleSave}
        saving={saving}
        saveLabel="Criar endpoint"
        saveDisabled={!newUrl || selectedEvents.length === 0}
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label>URL do endpoint <span className="text-destructive">*</span></Label>
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://hooks.klaviyo.com/api/..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Descrição <span className="text-muted-foreground text-xs font-normal">(opcional)</span></Label>
            <Input
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Ex: Klaviyo — comunicação de pontos"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Eventos a enviar <span className="text-destructive">*</span>
              {selectedEvents.length > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {selectedEvents.length} selecionado{selectedEvents.length > 1 ? "s" : ""}
                </span>
              )}
            </Label>
            <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
              {EVENTS.map((ev) => {
                const selected = selectedEvents.includes(ev.event);
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => toggleSelectedEvent(ev.event)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      selected ? "bg-primary/5" : "hover:bg-muted/40"
                    }`}
                  >
                    <div className={`size-4 rounded flex items-center justify-center border shrink-0 transition-colors ${
                      selected ? "bg-primary border-primary" : "border-border"
                    }`}>
                      {selected && <Check className="size-2.5 text-primary-foreground" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold">{ev.event}</span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{ev.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </FormDrawer>
    </div>
  );
}
