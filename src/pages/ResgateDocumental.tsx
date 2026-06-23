import { useState } from "react";
import {
  Card,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Avatar,
  AvatarFallback,
} from "@kruzer/ds";
import { FileCheck, FileCheck2, Upload, AlertTriangle, CheckCheck } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────

type DocStatus =
  | "aguardando_doc"
  | "em_analise"
  | "aprovado"
  | "credito_processado"
  | "pendencia";

type DocOrder = {
  id: string;
  member: string;
  initials: string;
  points: number;
  value: number;
  status: DocStatus;
  submittedAt: string;
  docRef: string | null;
};

// ── Mock data ────────────────────────────────────────────────────────

const PF_ORDERS: DocOrder[] = [
  {
    id: "REQ-510",
    member: "Aline P.",
    initials: "AP",
    points: 12000,
    value: 1200,
    status: "aguardando_doc",
    submittedAt: "14/06/2025",
    docRef: null,
  },
  {
    id: "REQ-498",
    member: "Paulo S.",
    initials: "PS",
    points: 8000,
    value: 800,
    status: "em_analise",
    submittedAt: "10/06/2025",
    docRef: "RPA-2025-0042",
  },
  {
    id: "REQ-489",
    member: "Marina A.",
    initials: "MA",
    points: 6500,
    value: 650,
    status: "aprovado",
    submittedAt: "05/06/2025",
    docRef: "RPA-2025-0038",
  },
  {
    id: "REQ-481",
    member: "Bruno C.",
    initials: "BC",
    points: 5000,
    value: 500,
    status: "credito_processado",
    submittedAt: "28/05/2025",
    docRef: "RPA-2025-0031",
  },
  {
    id: "REQ-472",
    member: "Cecília M.",
    initials: "CM",
    points: 3000,
    value: 300,
    status: "pendencia",
    submittedAt: "20/05/2025",
    docRef: "RPA-2025-0028",
  },
];

const PJ_ORDERS: DocOrder[] = [
  {
    id: "REQ-515",
    member: "FAST PRO Centro",
    initials: "FC",
    points: 48000,
    value: 4800,
    status: "aguardando_doc",
    submittedAt: "15/06/2025",
    docRef: null,
  },
  {
    id: "REQ-503",
    member: "FAST PRO Sul",
    initials: "FS",
    points: 32000,
    value: 3200,
    status: "em_analise",
    submittedAt: "08/06/2025",
    docRef: "NF-2025-00142",
  },
  {
    id: "REQ-491",
    member: "FAST PRO Leste",
    initials: "FL",
    points: 21000,
    value: 2100,
    status: "credito_processado",
    submittedAt: "01/06/2025",
    docRef: "NF-2025-00119",
  },
];

// ── Status config ────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  DocStatus,
  { label: string; color: string; step: number }
> = {
  aguardando_doc: { label: "Aguardando doc.", color: "bg-amber-100 text-amber-700", step: 1 },
  em_analise: { label: "Em análise", color: "bg-sky-100 text-sky-700", step: 2 },
  aprovado: { label: "Aprovado", color: "bg-violet-100 text-violet-700", step: 3 },
  credito_processado: { label: "Crédito processado", color: "bg-emerald-100 text-emerald-700", step: 4 },
  pendencia: { label: "Pendência", color: "bg-red-100 text-red-600", step: 0 },
};

const STEPS: DocStatus[] = ["aguardando_doc", "em_analise", "aprovado", "credito_processado"];

// ── Doc table ────────────────────────────────────────────────────────

function DocTable({
  orders,
  docType,
}: {
  orders: DocOrder[];
  docType: "RPA" | "NF";
}) {
  const [list, setList] = useState(orders);

  const advance = (id: string) =>
    setList((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const steps: DocStatus[] = ["aguardando_doc", "em_analise", "aprovado", "credito_processado"];
        const idx = steps.indexOf(o.status);
        return idx < steps.length - 1 ? { ...o, status: steps[idx + 1] } : o;
      })
    );

  const counts = STEPS.map((s) => list.filter((o) => o.status === s).length);

  return (
    <div className="space-y-5">
      {/* Pipeline summary */}
      <div className="flex flex-wrap gap-3">
        {STEPS.map((step, i) => (
          <div
            key={step}
            className={`rounded-2xl border px-4 py-2.5 ${STATUS_CONFIG[step].color}`}
          >
            <div className="text-xl font-bold tabular-nums">{counts[i]}</div>
            <div className="text-xs font-medium">{STATUS_CONFIG[step].label}</div>
          </div>
        ))}
        <div className="rounded-2xl border px-4 py-2.5 bg-red-50 border-red-200 text-red-600">
          <div className="text-xl font-bold tabular-nums">
            {list.filter((o) => o.status === "pendencia").length}
          </div>
          <div className="text-xs font-medium">Pendência</div>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border bg-muted/20">
              <tr className="text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">Pedido</th>
                <th className="px-5 py-3 font-medium">Membro</th>
                <th className="px-5 py-3 font-medium">Pontos</th>
                <th className="px-5 py-3 font-medium">Valor</th>
                <th className="px-5 py-3 font-medium">Documento {docType}</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Solicitado em</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((order) => {
                const cfg = STATUS_CONFIG[order.status];
                const canAdvance =
                  order.status !== "credito_processado" && order.status !== "pendencia";
                return (
                  <tr key={order.id} className="hover:bg-muted/20">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {order.id}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                            {order.initials}
                          </AvatarFallback>
                        </Avatar>
                        {order.member}
                      </div>
                    </td>
                    <td className="px-5 py-3 tabular-nums">
                      {order.points.toLocaleString("pt-BR")} pts
                    </td>
                    <td className="px-5 py-3 tabular-nums">
                      {order.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="px-5 py-3">
                      {order.docRef ? (
                        <div className="flex items-center gap-1.5">
                          <FileCheck2 className="size-3.5 text-emerald-500 shrink-0" />
                          <span className="font-mono text-xs">{order.docRef}</span>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" className="text-xs h-7">
                          <Upload className="size-3 mr-1" />
                          Enviar {docType}
                        </Button>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}
                      >
                        {order.status === "pendencia" && (
                          <AlertTriangle className="size-3" />
                        )}
                        {order.status === "credito_processado" && (
                          <CheckCheck className="size-3" />
                        )}
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground tabular-nums text-xs">
                      {order.submittedAt}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {canAdvance && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => advance(order.id)}
                        >
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

// ── Main page ────────────────────────────────────────────────────────

export default function ResgateDocumental() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <FileCheck className="size-5 text-muted-foreground" />
        <div>
          <h2 className="text-lg font-semibold">Fluxo Documental de Resgate</h2>
          <p className="text-sm text-muted-foreground">
            Gestão de RPA (Pessoa Física) e Nota Fiscal (Pessoa Jurídica).
          </p>
        </div>
      </div>

      <Tabs defaultValue="pf">
        <TabsList>
          <TabsTrigger value="pf">PF — RPA</TabsTrigger>
          <TabsTrigger value="pj">PJ — Nota Fiscal</TabsTrigger>
        </TabsList>

        <TabsContent value="pf" className="mt-4">
          <div className="mb-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            <strong>RPA (Recibo de Pagamento Autônomo)</strong> — Obrigatório para resgates de
            crédito em conta de Pessoas Físicas acima de R$600,00.
          </div>
          <DocTable orders={PF_ORDERS} docType="RPA" />
        </TabsContent>

        <TabsContent value="pj" className="mt-4">
          <div className="mb-3 rounded-xl bg-sky-50 border border-sky-200 px-4 py-3 text-sm text-sky-800">
            <strong>Nota Fiscal de Serviços</strong> — Obrigatória para resgates de crédito em
            conta de Pessoas Jurídicas independente do valor.
          </div>
          <DocTable orders={PJ_ORDERS} docType="NF" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
