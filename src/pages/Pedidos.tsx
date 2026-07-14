import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar, AvatarFallback, Button, Card,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
  PageHeader, Pill, SearchInput,
  Tabs, TabsContent, TabsList, TabsTrigger,
  toast,
} from "@kruzer/ds";
import { AlertTriangle, Ban, FileCheck, FileCheck2, MoreHorizontal, Package, Pencil, RotateCcw, Upload, CheckCheck, UserCircle } from "lucide-react";
import { CustomTag } from "../components/CustomTag";
import { TIPO_RESGATE_LABEL, TIPO_RESGATE_ICON } from "../config/resgateLifecycle";

// ── Fluxo Documental ──────────────────────────────────────────────────────────

type DocStatus = "aguardando_doc" | "em_analise" | "aprovado" | "credito_processado" | "pendencia";

type DocOrder = {
  id: string; member: string; initials: string;
  points: number; value: number; status: DocStatus;
  submittedAt: string; docRef: string | null;
};

const DOC_STATUS_CONFIG: Record<DocStatus, { label: string; color: string }> = {
  aguardando_doc:    { label: "Aguard. do membro",  color: "bg-amber-100 text-amber-700"    },
  em_analise:        { label: "Aguard. analista",   color: "bg-sky-100 text-sky-700"        },
  aprovado:          { label: "Aprovado",           color: "bg-violet-100 text-violet-700"  },
  credito_processado:{ label: "Crédito processado", color: "bg-emerald-100 text-emerald-700"},
  pendencia:         { label: "Pendência",          color: "bg-red-100 text-red-600"        },
};

const DOC_STEPS: DocStatus[] = ["aguardando_doc", "em_analise", "aprovado", "credito_processado"];

const PF_ORDERS: DocOrder[] = [
  { id: "REQ-510", member: "Aline P.",   initials: "AP", points: 12000, value: 1200, status: "aguardando_doc",    submittedAt: "14/06/2025", docRef: null              },
  { id: "REQ-498", member: "Paulo S.",   initials: "PS", points:  8000, value:  800, status: "em_analise",        submittedAt: "10/06/2025", docRef: "RPA-2025-0042"   },
  { id: "REQ-489", member: "Marina A.",  initials: "MA", points:  6500, value:  650, status: "aprovado",          submittedAt: "05/06/2025", docRef: "RPA-2025-0038"   },
  { id: "REQ-481", member: "Bruno C.",   initials: "BC", points:  5000, value:  500, status: "credito_processado",submittedAt: "28/05/2025", docRef: "RPA-2025-0031"   },
  { id: "REQ-472", member: "Cecília M.", initials: "CM", points:  3000, value:  300, status: "pendencia",         submittedAt: "20/05/2025", docRef: "RPA-2025-0028"   },
];

const PJ_ORDERS: DocOrder[] = [
  { id: "REQ-515", member: "FAST PRO Centro", initials: "FC", points: 48000, value: 4800, status: "aguardando_doc",    submittedAt: "15/06/2025", docRef: null            },
  { id: "REQ-503", member: "FAST PRO Sul",    initials: "FS", points: 32000, value: 3200, status: "em_analise",        submittedAt: "08/06/2025", docRef: "NF-2025-00142" },
  { id: "REQ-491", member: "FAST PRO Leste",  initials: "FL", points: 21000, value: 2100, status: "credito_processado",submittedAt: "01/06/2025", docRef: "NF-2025-00119" },
];

function DocTable({ orders, docType }: { orders: DocOrder[]; docType: "RPA" | "NF" }) {
  const [list, setList] = useState(orders);

  const advance = (id: string) =>
    setList((prev) => prev.map((o) => {
      if (o.id !== id) return o;
      const idx = DOC_STEPS.indexOf(o.status);
      return idx < DOC_STEPS.length - 1 ? { ...o, status: DOC_STEPS[idx + 1] } : o;
    }));

  const counts = DOC_STEPS.map((s) => list.filter((o) => o.status === s).length);
  const aguardandoMembro   = list.filter((o) => o.status === "aguardando_doc");
  const aguardandoAnalista = list.filter((o) => o.status === "em_analise");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        {DOC_STEPS.map((step, i) => (
          <div key={step} className={`rounded-2xl border px-4 py-2.5 ${DOC_STATUS_CONFIG[step].color}`}>
            <div className="text-xl font-bold tabular-nums">{counts[i]}</div>
            <div className="text-xs font-medium">{DOC_STATUS_CONFIG[step].label}</div>
          </div>
        ))}
        <div className="rounded-2xl border px-4 py-2.5 bg-red-50 border-red-200 text-red-600">
          <div className="text-xl font-bold tabular-nums">{list.filter((o) => o.status === "pendencia").length}</div>
          <div className="text-xs font-medium">Pendência</div>
        </div>
      </div>

      {aguardandoMembro.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">{aguardandoMembro.length} aguardando documento do membro</p>
            <p className="text-xs text-amber-700 mt-0.5">O membro ainda não enviou o {docType === "RPA" ? "RPA assinado" : "arquivo de NF"}. Nenhuma ação necessária agora.</p>
          </div>
        </div>
      )}

      {aguardandoAnalista.length > 0 && (
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 flex items-start gap-3">
          <FileCheck className="size-4 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-sky-800">{aguardandoAnalista.length} documento{aguardandoAnalista.length > 1 ? "s" : ""} recebido{aguardandoAnalista.length > 1 ? "s" : ""} — aguardando revisão</p>
            <p className="text-xs text-sky-700 mt-0.5">O membro enviou o documento. Revise e avance o resgate.</p>
          </div>
        </div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border bg-muted/20">
              <tr className="text-left text-muted-foreground">
                {["Resgate", "Membro", "Saldo", "Valor", `Documento ${docType}`, "Status", "Solicitado em", ""].map((h) => (
                  <th key={h} className="px-5 py-3 font-medium text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((order) => {
                const cfg = DOC_STATUS_CONFIG[order.status];
                const canAdvance = order.status !== "credito_processado" && order.status !== "pendencia";
                return (
                  <tr key={order.id} className="hover:bg-muted/20">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{order.id}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">{order.initials}</AvatarFallback>
                        </Avatar>
                        {order.member}
                      </div>
                    </td>
                    <td className="px-5 py-3 tabular-nums">{order.points.toLocaleString("pt-BR")}</td>
                    <td className="px-5 py-3 tabular-nums">{order.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    <td className="px-5 py-3">
                      {order.docRef ? (
                        <div className="flex items-center gap-1.5">
                          <FileCheck2 className="size-3.5 text-emerald-500 shrink-0" />
                          <span className="font-mono text-xs">{order.docRef}</span>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" className="text-xs h-7">
                          <Upload className="size-3 mr-1" />Enviar {docType}
                        </Button>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}>
                        {order.status === "pendencia" && <AlertTriangle className="size-3" />}
                        {order.status === "credito_processado" && <CheckCheck className="size-3" />}
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground tabular-nums text-xs">{order.submittedAt}</td>
                    <td className="px-5 py-3 text-right">
                      {canAdvance && (
                        <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => advance(order.id)}>
                          Avançar →
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type OrderStatus = "solicitado" | "aguardando_doc" | "doc_recebido" | "aprovado" | "em_separacao" | "entregue" | "enviado" | "creditado" | "rejeitado" | "cancelado";

export type TimelineEntry = {
  status: OrderStatus; date: string; operator?: string;
};

export type Order = {
  id: string; memberId: string; memberName: string; memberInitials: string;
  memberTier: string; memberBalance: number;
  clienteName: string;
  campanhaId: string;
  classificacao: string;
  product: string; category: string; channel: string;
  origem: "portal" | "operador";
  tipoResgate: "produto_fisico" | "voucher_digital" | "credito_conta";
  tipoPessoa: "PF" | "PJ";
  moedaCampanha: string;
  moedaAbrev: string;
  codigoSku: string;
  quantidade: number;
  valorUnitario: number;
  precoPedido: number;
  valorTotal: number;
  points: number;
  dataEmissaoNF: string | null;
  status: OrderStatus; createdAt: string; timeline: TimelineEntry[];
  rejectReason?: string;
};

// ── Mock data ─────────────────────────────────────────────────────────────────

export const ORDERS: Order[] = [
  {
    id: "REQ-521", memberId: "1", memberName: "Aline P.", memberInitials: "AP",
    memberTier: "Diamante", memberBalance: 5200, clienteName: "Aline Paula Silva",
    campanhaId: "CAMP-2025-06", classificacao: "Ouro",
    product: "Voucher R$100", category: "Voucher", channel: "App Mobile", origem: "portal", tipoResgate: "voucher_digital", tipoPessoa: "PF", moedaCampanha: "Pontos", moedaAbrev: "pts",
    codigoSku: "VCH-100-BR", quantidade: 1, valorUnitario: 100, precoPedido: 100, valorTotal: 100,
    points: 2400, dataEmissaoNF: null,
    status: "solicitado", createdAt: "16/06/2025",
    timeline: [{ status: "solicitado", date: "16/06/2025 14:32" }],
  },
  {
    id: "REQ-498", memberId: "2", memberName: "Bruno C.", memberInitials: "BC",
    memberTier: "Ouro", memberBalance: 3200, clienteName: "Bruno Costa",
    campanhaId: "CAMP-2025-05", classificacao: "Prata",
    product: "Frete Grátis", category: "Logística", channel: "App Mobile", origem: "portal", tipoResgate: "voucher_digital", tipoPessoa: "PF", moedaCampanha: "Pontos", moedaAbrev: "pts",
    codigoSku: "FRET-001", quantidade: 1, valorUnitario: 30, precoPedido: 30, valorTotal: 30,
    points: 800, dataEmissaoNF: null,
    status: "aprovado", createdAt: "10/06/2025",
    timeline: [
      { status: "solicitado", date: "10/06/2025 09:15" },
      { status: "aprovado",   date: "10/06/2025 11:40", operator: "Maria Admin" },
    ],
  },
  {
    id: "REQ-497", memberId: "3", memberName: "Cecília M.", memberInitials: "CM",
    memberTier: "Prata", memberBalance: 1800, clienteName: "Cecília Mendes",
    campanhaId: "CAMP-2025-05", classificacao: "Bronze",
    product: "Cupom 10%", category: "Desconto", channel: "App Mobile", origem: "operador", tipoResgate: "voucher_digital", tipoPessoa: "PF", moedaCampanha: "Pontos", moedaAbrev: "pts",
    codigoSku: "CUP-10PCT", quantidade: 1, valorUnitario: 50, precoPedido: 50, valorTotal: 50,
    points: 650, dataEmissaoNF: null,
    status: "em_separacao", createdAt: "07/06/2025",
    timeline: [
      { status: "solicitado",   date: "07/06/2025 16:20" },
      { status: "aprovado",     date: "08/06/2025 10:05", operator: "João Ops" },
      { status: "em_separacao", date: "08/06/2025 14:30", operator: "João Ops" },
    ],
  },
  {
    id: "REQ-489", memberId: "2", memberName: "Bruno C.", memberInitials: "BC",
    memberTier: "Ouro", memberBalance: 3200, clienteName: "Bruno Costa",
    campanhaId: "CAMP-2025-04", classificacao: "Ouro",
    product: "Air Fryer XL", category: "Produto físico", channel: "Loja física", origem: "operador", tipoResgate: "produto_fisico", tipoPessoa: "PF", moedaCampanha: "Pontos", moedaAbrev: "pts",
    codigoSku: "AIRFRY-XL-02", quantidade: 1, valorUnitario: 1800, precoPedido: 1800, valorTotal: 1800,
    points: 18000, dataEmissaoNF: "02/06/2025",
    status: "entregue", createdAt: "28/05/2025",
    timeline: [
      { status: "solicitado",   date: "28/05/2025 10:00" },
      { status: "aprovado",     date: "29/05/2025 09:00", operator: "Maria Admin" },
      { status: "em_separacao", date: "30/05/2025 11:00", operator: "Maria Admin" },
      { status: "entregue",     date: "02/06/2025 15:45", operator: "João Ops" },
    ],
  },
  {
    id: "REQ-510", memberId: "1", memberName: "Aline P.", memberInitials: "AP",
    memberTier: "Diamante", memberBalance: 480, clienteName: "Aline Paula Silva",
    campanhaId: "CAMP-2025-06", classificacao: "Ouro",
    product: "Air Fryer XL", category: "Produto físico", channel: "Portal",
    codigoSku: "AIRFRY-XL-02", quantidade: 1, valorUnitario: 1800, precoPedido: 1800, valorTotal: 1800,
    points: 320, dataEmissaoNF: null, origem: "portal", tipoResgate: "credito_conta", tipoPessoa: "PF", moedaCampanha: "Cashback", moedaAbrev: "R$",
    status: "doc_recebido", createdAt: "10/06/2025",
    timeline: [
      { status: "solicitado",    date: "10/06/2025 09:00" },
      { status: "aguardando_doc", date: "10/06/2025 09:05", operator: "Sistema" },
      { status: "doc_recebido",  date: "11/06/2025 14:22", operator: "Membro" },
    ],
  },
  {
    id: "REQ-515", memberId: "3", memberName: "Cecília M.", memberInitials: "CM",
    memberTier: "Prata", memberBalance: 9200, clienteName: "Cecília Mendes",
    campanhaId: "CAMP-2025-05", classificacao: "Prata",
    product: "Notebook Pro 14\"", category: "Eletrônico", channel: "Portal",
    codigoSku: "NOTE-PRO-14", quantidade: 1, valorUnitario: 4800, precoPedido: 4800, valorTotal: 4800,
    points: 4500, dataEmissaoNF: null, origem: "portal", tipoResgate: "credito_conta", tipoPessoa: "PJ", moedaCampanha: "Milhas", moedaAbrev: "mi",
    status: "aguardando_doc", createdAt: "14/06/2025",
    timeline: [
      { status: "solicitado",     date: "14/06/2025 11:30" },
      { status: "aguardando_doc", date: "14/06/2025 11:32", operator: "Sistema" },
    ],
  },
  {
    id: "REQ-481", memberId: "4", memberName: "Danilo R.", memberInitials: "DR",
    memberTier: "Bronze", memberBalance: 45, clienteName: "Danilo Rocha",
    campanhaId: "CAMP-2025-04", classificacao: "Bronze",
    product: "Cashback 5%", category: "Cashback", channel: "App Mobile", origem: "portal", tipoResgate: "credito_conta", tipoPessoa: "PF", moedaCampanha: "Cashback", moedaAbrev: "R$",
    codigoSku: "CASH-5PCT", quantidade: 1, valorUnitario: 30, precoPedido: 30, valorTotal: 30,
    points: 80, dataEmissaoNF: null,
    status: "rejeitado", createdAt: "20/05/2025",
    rejectReason: "Saldo insuficiente no momento da solicitação.",
    timeline: [
      { status: "solicitado", date: "20/05/2025 08:55" },
      { status: "rejeitado",  date: "20/05/2025 09:10", operator: "Maria Admin" },
    ],
  },
];

// ── Config ────────────────────────────────────────────────────────────────────

export const STATUS_LABEL: Record<OrderStatus, string> = {
  solicitado:    "Solicitado",
  aguardando_doc:"Aguardando doc.",
  doc_recebido:  "Doc. recebido",
  aprovado:      "Aprovado",
  em_separacao:  "Em separação",
  entregue:      "Entregue",
  enviado:       "Enviado",
  creditado:     "Creditado",
  rejeitado:     "Rejeitado",
  cancelado:     "Cancelado",
};

const STATUS_PILL: Record<OrderStatus, "warning" | "primary" | "secondary" | "success" | "destructive" | "muted"> = {
  solicitado:    "warning",
  aguardando_doc:"warning",
  doc_recebido:  "primary",
  aprovado:      "primary",
  em_separacao:  "secondary",
  entregue:      "success",
  enviado:       "success",
  creditado:     "success",
  rejeitado:     "destructive",
  cancelado:     "muted",
};

const TIER_COLOR: Record<string, string> = {
  Diamante: "bg-violet-100 text-violet-700",
  Ouro:     "bg-amber-100 text-amber-700",
  Prata:    "bg-slate-100 text-slate-600",
  Bronze:   "bg-orange-100 text-orange-700",
};

const TABS = [
  { key: "todos",      label: "Todos" },
  { key: "pendentes",  label: "Pendentes" },
  { key: "andamento",  label: "Em andamento" },
  { key: "concluidos", label: "Concluídos" },
];

function matchTab(status: OrderStatus, tab: string) {
  if (tab === "todos")      return true;
  if (tab === "pendentes")  return status === "solicitado" || status === "aguardando_doc" || status === "doc_recebido";
  if (tab === "andamento")  return status === "aprovado" || status === "em_separacao";
  if (tab === "concluidos") return status === "entregue" || status === "rejeitado" || status === "cancelado";
  return true;
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Pedidos() {
  const navigate = useNavigate();
  const [pageView, setPageView] = useState<"pedidos" | "documental">("pedidos");
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [search, setSearch] = useState("");
  const [tab,    setTab]    = useState("todos");

  const filtered = useMemo(() =>
    orders.filter((o) =>
      matchTab(o.status, tab) &&
      (!search ||
        o.memberName.toLowerCase().includes(search.toLowerCase()) ||
        o.clienteName.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.codigoSku.toLowerCase().includes(search.toLowerCase()) ||
        o.campanhaId.toLowerCase().includes(search.toLowerCase())
      )
    ), [orders, search, tab]
  );

  const counts = useMemo(() => ({
    pendentes: orders.filter((o) => ["solicitado","aguardando_doc","doc_recebido"].includes(o.status)).length,
    andamento: orders.filter((o) => o.status === "aprovado" || o.status === "em_separacao").length,
  }), [orders]);

  const updateStatus = (id: string, status: OrderStatus) =>
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aprovações de Resgate"
        path={[{ label: "Operação" }]}
        description={pageView === "pedidos" ? "Fila de resgates solicitados pelos membros via canal." : "Documentos enviados pelos membros via portal."}
      />

      {/* View switcher */}
      <div className="flex gap-1 border-b border-border">
        {([["pedidos", "Fila de resgates"], ["documental", "Fluxo documental"]] as const).map(([view, label]) => (
          <button
            key={view}
            onClick={() => setPageView(view)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              pageView === view
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
            {view === "documental" && <CustomTag className="scale-90" />}
          </button>
        ))}
      </div>

      {/* ── Fila de pedidos ── */}
      {pageView === "pedidos" && (<>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {t.key === "pendentes" && counts.pendentes > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-100 text-amber-700 px-1.5 py-0.5 text-[10px] font-semibold">
                {counts.pendentes}
              </span>
            )}
            {t.key === "andamento" && counts.andamento > 0 && (
              <span className="ml-1.5 rounded-full bg-sky-100 text-sky-700 px-1.5 py-0.5 text-[10px] font-semibold">
                {counts.andamento}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <div className="w-72 shrink-0">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Membro, cliente, SKU, campanha…"
            />
          </div>
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} resgates</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2">
            <Package className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nenhum resgate encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/20 border-b border-border">
                <tr className="text-left text-muted-foreground">
                  {[
                    "ID do resgate", "Tipo", "ID campanha", "Classificação", "Status",
                    "Origem", "Data criação", "Nome membro", "Nome cliente",
                    "SKU", "Qtd.", "Valor unit.", "Valor", "Total",
                    "Saldo debitado", "Emissão NF", "Ações",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium text-xs whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/resgates/${order.id}`)}
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground whitespace-nowrap">{order.id}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {TIPO_RESGATE_ICON[order.tipoResgate]} {TIPO_RESGATE_LABEL[order.tipoResgate]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground whitespace-nowrap">{order.campanhaId}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${TIER_COLOR[order.classificacao] ?? "bg-slate-100 text-slate-600"}`}>
                        {order.classificacao}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <Pill color={STATUS_PILL[order.status]} variant="soft" size="sm">
                          {STATUS_LABEL[order.status]}
                        </Pill>
                        {order.tipoResgate === "credito_conta" && (order.status === "aguardando_doc" || order.status === "doc_recebido") && (
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            order.status === "doc_recebido"
                              ? "bg-sky-100 text-sky-700"
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {order.tipoPessoa === "PF" ? "📄 RPA" : "🧾 NF"} · {order.tipoPessoa}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {order.origem === "portal" ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-sky-100 text-sky-700">
                          📱 Portal
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600">
                          🖥 Operador
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground tabular-nums whitespace-nowrap">{order.createdAt}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                            {order.memberInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{order.memberName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm whitespace-nowrap">{order.clienteName}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground whitespace-nowrap">{order.codigoSku}</td>
                    <td className="px-4 py-3.5 tabular-nums text-sm text-center whitespace-nowrap">{order.quantidade}</td>
                    <td className="px-4 py-3.5 tabular-nums text-sm whitespace-nowrap">{fmt(order.valorUnitario)}</td>
                    <td className="px-4 py-3.5 tabular-nums text-sm whitespace-nowrap">{fmt(order.precoPedido)}</td>
                    <td className="px-4 py-3.5 tabular-nums font-semibold text-sm whitespace-nowrap">{fmt(order.valorTotal)}</td>
                    <td className="px-4 py-3.5 tabular-nums text-sm text-primary font-semibold whitespace-nowrap">
                      {order.points.toLocaleString("pt-BR")} {order.moedaAbrev}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                      {order.dataEmissaoNF ?? "—"}
                    </td>
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="size-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* Ver detalhe — sempre disponível */}
                          <DropdownMenuItem onClick={() => navigate(`/resgates/${order.id}`)}>
                            <Pencil className="size-3.5 mr-2" />
                            Ver detalhe
                          </DropdownMenuItem>

                          {/* Ver membro — sempre disponível */}
                          <DropdownMenuItem onClick={() => navigate(`/membros/${order.memberId}`)}>
                            <UserCircle className="size-3.5 mr-2" />
                            Ver membro
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {/* Estornar — só após aprovação */}
                          {["aprovado", "em_separacao", "enviado", "creditado"].includes(order.status) && (
                            <DropdownMenuItem onClick={() => {
                              updateStatus(order.id, "solicitado");
                              toast.info(`Resgate ${order.id} estornado`);
                            }}>
                              <RotateCcw className="size-3.5 mr-2" />
                              Estornar
                            </DropdownMenuItem>
                          )}

                          {/* Anular — só quando ainda não é terminal */}
                          {!["cancelado", "rejeitado", "entregue", "enviado", "creditado"].includes(order.status) && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                updateStatus(order.id, "cancelado");
                                toast.error(`Registro de venda ${order.id} anulado`);
                              }}
                            >
                              <Ban className="size-3.5 mr-2" />
                              Anular registro de venda
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>)}

      {/* ── Fluxo documental ── */}
      {pageView === "documental" && (
        <div className="space-y-5">
          <Tabs defaultValue="pf">
            <TabsList>
              <TabsTrigger value="pf">PF — RPA</TabsTrigger>
              <TabsTrigger value="pj">PJ — Nota Fiscal</TabsTrigger>
            </TabsList>
            <TabsContent value="pf" className="mt-4">
              <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                <strong>RPA (Recibo de Pagamento Autônomo)</strong> — Obrigatório para resgates de crédito em conta de Pessoas Físicas acima de R$600,00.
              </div>
              <DocTable orders={PF_ORDERS} docType="RPA" />
            </TabsContent>
            <TabsContent value="pj" className="mt-4">
              <div className="mb-4 rounded-xl bg-sky-50 border border-sky-200 px-4 py-3 text-sm text-sky-800">
                <strong>Nota Fiscal de Serviços</strong> — Obrigatória para resgates de crédito em conta de Pessoas Jurídicas independente do valor.
              </div>
              <DocTable orders={PJ_ORDERS} docType="NF" />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
