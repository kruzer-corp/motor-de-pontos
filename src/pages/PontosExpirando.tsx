import { useState } from "react";
import {
  Avatar, AvatarFallback, Button, PageHeader, Pill,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  TableEmpty, toast,
} from "@kruzer/ds";
import { AlarmClock, Bell, BellOff, CalendarX2 } from "lucide-react";
import { renderCrumbLink } from "../lib/crumbLink";
import { MOEDA } from "../config/programa";

type Threshold = 7 | 15 | 30 | 60;

type ExpiringEntry = {
  id: string;
  member: { name: string; initials: string; email: string };
  campanha: string;
  pts: number;
  expiresAt: string;
  daysLeft: number;
  notified: boolean;
};

const ALL_ENTRIES: ExpiringEntry[] = [
  { id: "1",  member: { name: "Ana Paula M.",   initials: "AM", email: "ana@fastpro.com.br"     }, campanha: "Lançamento Verão",     pts: 1200, expiresAt: "17/07/2026", daysLeft: 2,  notified: false },
  { id: "2",  member: { name: "Bruno Castilho", initials: "BC", email: "bruno@fastpro.com.br"   }, campanha: "Fidelidade Platinum",  pts:  850, expiresAt: "20/07/2026", daysLeft: 5,  notified: true  },
  { id: "3",  member: { name: "Carla Nunes",    initials: "CN", email: "carla@fastpro.com.br"   }, campanha: "Fidelidade Bronze",    pts:  300, expiresAt: "22/07/2026", daysLeft: 7,  notified: false },
  { id: "4",  member: { name: "Diego Ferreira", initials: "DF", email: "diego@fastpro.com.br"   }, campanha: "Compra Recorrente",    pts: 2100, expiresAt: "25/07/2026", daysLeft: 10, notified: false },
  { id: "5",  member: { name: "Elaine Torres",  initials: "ET", email: "elaine@fastpro.com.br"  }, campanha: "Fidelidade Platinum",  pts:  640, expiresAt: "28/07/2026", daysLeft: 13, notified: true  },
  { id: "6",  member: { name: "Felipe Lima",    initials: "FL", email: "felipe@fastpro.com.br"  }, campanha: "Lançamento Verão",     pts:  980, expiresAt: "30/07/2026", daysLeft: 15, notified: false },
  { id: "7",  member: { name: "Gabriela Souza", initials: "GS", email: "gabriela@fastpro.com.br"}, campanha: "Compra Recorrente",    pts: 1750, expiresAt: "04/08/2026", daysLeft: 20, notified: false },
  { id: "8",  member: { name: "Henrique Matos", initials: "HM", email: "henrique@fastpro.com.br"}, campanha: "Fidelidade Bronze",    pts:  420, expiresAt: "08/08/2026", daysLeft: 24, notified: true  },
  { id: "9",  member: { name: "Isabela Ramos",  initials: "IR", email: "isabela@fastpro.com.br" }, campanha: "Fidelidade Platinum",  pts: 3200, expiresAt: "12/08/2026", daysLeft: 28, notified: false },
  { id: "10", member: { name: "Jonas Pereira",  initials: "JP", email: "jonas@fastpro.com.br"   }, campanha: "Lançamento Verão",     pts:  560, expiresAt: "16/08/2026", daysLeft: 32, notified: false },
  { id: "11", member: { name: "Karen Oliveira", initials: "KO", email: "karen@fastpro.com.br"   }, campanha: "Compra Recorrente",    pts: 1100, expiresAt: "25/08/2026", daysLeft: 41, notified: false },
  { id: "12", member: { name: "Lucas Batista",  initials: "LB", email: "lucas@fastpro.com.br"   }, campanha: "Fidelidade Platinum",  pts:  790, expiresAt: "02/09/2026", daysLeft: 49, notified: true  },
  { id: "13", member: { name: "Mariana Costa",  initials: "MC", email: "mariana@fastpro.com.br" }, campanha: "Fidelidade Bronze",    pts: 2400, expiresAt: "12/09/2026", daysLeft: 59, notified: false },
];

function daysColor(days: number): string {
  if (days <= 7)  return "text-rose-600 font-semibold";
  if (days <= 15) return "text-amber-600 font-semibold";
  return "text-muted-foreground";
}

function urgencyPill(days: number) {
  if (days <= 7)  return <Pill color="danger"  variant="soft" size="sm" dot>{days}d</Pill>;
  if (days <= 15) return <Pill color="warning" variant="soft" size="sm" dot>{days}d</Pill>;
  return <Pill color="muted" variant="soft" size="sm">{days}d</Pill>;
}

export default function PontosExpirando() {
  const [threshold, setThreshold] = useState<Threshold>(30);
  const [entries, setEntries]     = useState<ExpiringEntry[]>(ALL_ENTRIES);

  const visible    = entries.filter(e => e.daysLeft <= threshold);
  const notified   = visible.filter(e => e.notified).length;
  const totalPts   = visible.reduce((s, e) => s + e.pts, 0);
  const pendentes  = visible.filter(e => !e.notified);

  function notificar(id: string) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, notified: true } : e));
    const entry = entries.find(e => e.id === id);
    toast.success(`Notificação enviada para ${entry?.member.name}`);
  }

  function notificarTodos() {
    const ids = new Set(pendentes.map(e => e.id));
    setEntries(prev => prev.map(e => ids.has(e.id) ? { ...e, notified: true } : e));
    toast.success(`${pendentes.length} notificação(ões) enviada(s)`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${MOEDA.nome} expirando em breve`}
        path={[{ label: "Operação" }]}
        renderCrumbLink={renderCrumbLink}
        description="Membros com saldo prestes a expirar. Envie notificações para estimular o resgate antes da perda."
        actions={
          <Button size="sm" disabled={pendentes.length === 0} onClick={notificarTodos}>
            <Bell className="mr-1.5 h-3.5 w-3.5" />
            Notificar todos ({pendentes.length})
          </Button>
        }
      />

      {/* Threshold */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Expirando em até:</span>
        {([7, 15, 30, 60] as Threshold[]).map(t => (
          <button
            key={t}
            onClick={() => setThreshold(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              threshold === t
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {t} dias
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card px-5 py-4">
          <p className="text-xs text-muted-foreground">Membros afetados</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">{visible.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">nos próximos {threshold} dias</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-5 py-4">
          <p className="text-xs text-muted-foreground">{MOEDA.nome} em risco</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">{totalPts.toLocaleString("pt-BR")}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{MOEDA.abrev} acumulados</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-5 py-4">
          <p className="text-xs text-muted-foreground">Notificados</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">
            {visible.length > 0 ? Math.round((notified / visible.length) * 100) : 0}%
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{notified} de {visible.length} membros</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membro</TableHead>
              <TableHead>Campanha</TableHead>
              <TableHead className="text-right">{MOEDA.nome}</TableHead>
              <TableHead>Expira em</TableHead>
              <TableHead>Dias restantes</TableHead>
              <TableHead>Notificado</TableHead>
              <TableHead>Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableEmpty
                colSpan={7}
                icon={CalendarX2}
                title="Nenhum membro neste período"
                description={`Não há saldos expirando nos próximos ${threshold} dias.`}
              />
            ) : (
              visible
                .sort((a, b) => a.daysLeft - b.daysLeft)
                .map(entry => (
                  <TableRow key={entry.id} className="[&>td]:py-3.5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {entry.member.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{entry.member.name}</div>
                          <div className="text-xs text-muted-foreground">{entry.member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{entry.campanha}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium text-sm">
                      {entry.pts.toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell className={`text-sm tabular-nums ${daysColor(entry.daysLeft)}`}>
                      {entry.expiresAt}
                    </TableCell>
                    <TableCell>{urgencyPill(entry.daysLeft)}</TableCell>
                    <TableCell>
                      {entry.notified
                        ? <span className="flex items-center gap-1.5 text-xs text-emerald-600"><Bell className="h-3.5 w-3.5" /> Notificado</span>
                        : <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><BellOff className="h-3.5 w-3.5" /> Pendente</span>
                      }
                    </TableCell>
                    <TableCell>
                      {!entry.notified && (
                        <Button variant="outline" size="sm" onClick={() => notificar(entry.id)}>
                          <Bell className="mr-1.5 h-3.5 w-3.5" />
                          Notificar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      {visible.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 flex items-start gap-2">
          <AlarmClock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Membros marcados como "Notificado" recebem um e-mail ou push com o saldo restante e um link direto para o catálogo de resgates.
            A notificação é enviada apenas uma vez por ciclo de expiração.
          </p>
        </div>
      )}
    </div>
  );
}
