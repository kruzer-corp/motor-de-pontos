import { useState } from "react";
import {
  Button, FormDrawer, Input, Label, PageHeader, Pill, toast,
} from "@kruzer/ds";
import {
  AlertTriangle, Ban, CheckCircle2, ChevronDown, ChevronUp,
  Clock, Repeat2, Settings2, ShieldAlert, ShieldOff, TrendingUp,
  UserX, Zap,
} from "lucide-react";
import { renderCrumbLink } from "../lib/crumbLink";
import { ehV1 } from "../lib/versao";

type AlertTipo      = "acumulo_atipico" | "cancelamento_pos" | "multiplas_contas" | "resgate_imediato" | "indicacao_abuso" | "velocidade";
type AlertSev       = "alta" | "media" | "baixa";
type AlertStatus    = "novo" | "em_analise" | "resolvido" | "bloqueado";

type Alerta = {
  id: string;
  tipo: AlertTipo;
  severidade: AlertSev;
  status: AlertStatus;
  membro: { name: string; initials: string; email: string };
  descricao: string;
  detalhe: string;
  detectado: string;
};

// ── Configuração visual ────────────────────────────────────────────────────────

const TIPO_META: Record<AlertTipo, { label: string; icon: React.ElementType }> = {
  acumulo_atipico:  { label: "Acúmulo atípico",          icon: TrendingUp    },
  cancelamento_pos: { label: "Cancelamento pós-crédito", icon: Repeat2       },
  multiplas_contas: { label: "Múltiplas contas",          icon: UserX         },
  resgate_imediato: { label: "Resgate imediato",          icon: Zap           },
  indicacao_abuso:  { label: "Abuso de indicação",        icon: ShieldOff     },
  velocidade:       { label: "Velocidade suspeita",       icon: Clock         },
};

const SEV_STYLE: Record<AlertSev, { bar: string; bg: string; pill: "destructive" | "warning" | "muted"; label: string }> = {
  alta:  { bar: "bg-rose-500",  bg: "bg-rose-50 dark:bg-rose-950/20",  pill: "destructive",  label: "Alta"  },
  media: { bar: "bg-amber-400", bg: "bg-amber-50 dark:bg-amber-950/20",pill: "warning", label: "Média" },
  baixa: { bar: "bg-slate-300", bg: "",                                  pill: "muted",   label: "Baixa" },
};

const STATUS_META: Record<AlertStatus, { label: string; color: "destructive" | "warning" | "success" | "muted" }> = {
  novo:       { label: "Novo",       color: "destructive"  },
  em_analise: { label: "Em análise", color: "warning" },
  resolvido:  { label: "Resolvido",  color: "success" },
  bloqueado:  { label: "Bloqueado",  color: "muted"   },
};

// ── Mock ──────────────────────────────────────────────────────────────────────

const INITIAL: Alerta[] = [
  {
    id: "ALT-001",
    tipo: "acumulo_atipico",
    severidade: "alta",
    status: "novo",
    membro: { name: "Carlos Mendonça", initials: "CM", email: "carlos@email.com" },
    descricao: "8.400 pts acumulados em 6 horas — limiar: 5.000 pts/24h",
    detalhe: "Pedidos: #9182 (3.200 pts), #9195 (2.800 pts), #9201 (2.400 pts) — todos no mesmo endereço IP · 3 SKUs diferentes · todos com status Concluído em sequência rápida.",
    detectado: "15/07/2026 09:14",
  },
  {
    id: "ALT-002",
    tipo: "cancelamento_pos",
    severidade: "alta",
    status: "novo",
    membro: { name: "Roberta Figueiredo", initials: "RF", email: "roberta@email.com" },
    descricao: "Cancelou pedido #8822 após 1.600 pts creditados e resgate já solicitado",
    detalhe: "Padrão detectado 3× nos últimos 45 dias. Pedidos anteriores: #8611 (cancelado, 920 pts), #8403 (cancelado, 1.100 pts). Regra de estorno configurada como 'Manter pontos'.",
    detectado: "14/07/2026 17:38",
  },
  {
    id: "ALT-003",
    tipo: "indicacao_abuso",
    severidade: "alta",
    status: "em_analise",
    membro: { name: "Diego Sampaio", initials: "DS", email: "diego@email.com" },
    descricao: "12 indicações com e-mails variando por +1 caractere (diego+01@..., diego+02@...)",
    detalhe: "Todos os indicados compartilham o mesmo IP e nunca realizaram uma segunda compra. 9 de 12 indicações convertidas, totalizando 720 pts de bônus de indicação.",
    detectado: "13/07/2026 11:02",
  },
  {
    id: "ALT-004",
    tipo: "multiplas_contas",
    severidade: "media",
    status: "novo",
    membro: { name: "Ana Lima", initials: "AL", email: "ana.lima@email.com" },
    descricao: "Possível duplicata: ana_lima@email.com criada 2h depois com mesmo CPF mascarado",
    detalhe: "Conta secundária acumulou 480 pts antes de ser detectada. Mesmo dispositivo (fingerprint), mesmo CEP de entrega.",
    detectado: "14/07/2026 14:55",
  },
  {
    id: "ALT-005",
    tipo: "resgate_imediato",
    severidade: "media",
    status: "em_analise",
    membro: { name: "Bruno Tavares", initials: "BT", email: "bruno@email.com" },
    descricao: "Resgate de 4.200 pts solicitado 3 min após crédito de campanha sazonal",
    detalhe: "Campanha 'Double Points Julho' creditou 4.200 pts às 08:31. Resgate para vale-presente R$ 42 solicitado às 08:34. Primeiro resgate da conta.",
    detectado: "12/07/2026 08:34",
  },
  {
    id: "ALT-006",
    tipo: "velocidade",
    severidade: "baixa",
    status: "resolvido",
    membro: { name: "Fernanda Rocha", initials: "FR", email: "fernanda@email.com" },
    descricao: "14 transações em 2h — acima do limiar de 10 transações/2h",
    detalhe: "Investigado: trata-se de um evento de vendas presencial legítimo (confirmado pelo coordenador Marcos T.). Nenhuma ação necessária.",
    detectado: "10/07/2026 16:20",
  },
  {
    id: "ALT-007",
    tipo: "acumulo_atipico",
    severidade: "baixa",
    status: "bloqueado",
    membro: { name: "Paulo Esteves", initials: "PE", email: "paulo.e@email.com" },
    descricao: "6.100 pts em 18h — conta bloqueada preventivamente",
    detalhe: "Conta suspensa em 11/07/2026. Aguardando contato do membro para validação de identidade. Pontos congelados.",
    detectado: "11/07/2026 07:48",
  },
];

// ── Regras padrão ─────────────────────────────────────────────────────────────

type Regra = { id: string; label: string; desc: string; limiar: string };

const REGRAS_DEFAULTS: Regra[] = [
  { id: "r1", label: "Acúmulo atípico",         desc: "Alerta quando um membro acumula acima do limiar em 24h",    limiar: "5000" },
  { id: "r2", label: "Velocidade de transações",desc: "Alerta quando há mais de N transações em 2h",               limiar: "10"   },
  { id: "r3", label: "Resgate imediato",         desc: "Alerta quando resgate ocorre em menos de N minutos após crédito", limiar: "10" },
  { id: "r4", label: "Cancelamento pós-crédito",desc: "Alerta após N cancelamentos com pontos já creditados no mês", limiar: "2"  },
  { id: "r5", label: "Indicações suspeitas",     desc: "Alerta quando N indicações usam o mesmo IP ou padrão de e-mail", limiar: "5" },
];

type TabFilter = "todos" | "novo" | "em_analise" | "resolvido" | "bloqueado";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AlertasFraude() {
  const [alertas,   setAlertas]   = useState<Alerta[]>(() => (ehV1() ? [] : INITIAL));
  const [tab,       setTab]       = useState<TabFilter>("todos");
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [configOpen,setConfigOpen]= useState(false);
  const [regras,    setRegras]    = useState<Regra[]>(REGRAS_DEFAULTS);

  const visible = tab === "todos" ? alertas : alertas.filter(a => a.status === tab);

  const novos      = alertas.filter(a => a.status === "novo").length;
  const emAnalise  = alertas.filter(a => a.status === "em_analise").length;
  const bloqueados = alertas.filter(a => a.status === "bloqueado").length;

  function setStatus(id: string, status: AlertStatus) {
    setAlertas(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    const labels: Record<AlertStatus, string> = {
      em_analise: "Marcado como em análise",
      resolvido:  "Alerta resolvido — sem fraude confirmada",
      bloqueado:  "Membro bloqueado preventivamente",
      novo:       "",
    };
    if (labels[status]) toast.success(labels[status]);
  }

  const TABS: { value: TabFilter; label: string }[] = [
    { value: "todos",      label: "Todos"       },
    { value: "novo",       label: `Novos (${novos})`  },
    { value: "em_analise", label: "Em análise"  },
    { value: "resolvido",  label: "Resolvidos"  },
    { value: "bloqueado",  label: "Bloqueados"  },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertas de fraude e abuso"
        path={[{ label: "Operação" }]}
        renderCrumbLink={renderCrumbLink}
        description="Monitoramento automático de padrões suspeitos de acúmulo, resgate e indicação."
        actions={
          <Button variant="outline" size="sm" onClick={() => setConfigOpen(true)}>
            <Settings2 className="mr-1.5 h-3.5 w-3.5" />
            Configurar regras
          </Button>
        }
      />

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/20 px-5 py-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
          <div>
            <p className="text-2xl font-bold tabular-nums text-rose-600">{novos}</p>
            <p className="text-xs text-rose-600/80">alertas novos</p>
          </div>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20 px-5 py-4 flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
          <div>
            <p className="text-2xl font-bold tabular-nums text-amber-600">{emAnalise}</p>
            <p className="text-xs text-amber-600/80">em análise</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card px-5 py-4 flex items-center gap-3">
          <Ban className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-2xl font-bold tabular-nums">{bloqueados}</p>
            <p className="text-xs text-muted-foreground">membros bloqueados</p>
          </div>
        </div>
      </div>

      {/* Tab filter */}
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.value
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {visible.length === 0 ? (
          <div className="rounded-lg border border-border bg-card px-6 py-12 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-medium text-sm">Nenhum alerta nesta categoria</p>
            <p className="text-xs text-muted-foreground mt-1">Tudo tranquilo por aqui.</p>
          </div>
        ) : (
          visible.map(alerta => {
            const sev   = SEV_STYLE[alerta.severidade];
            const sm    = STATUS_META[alerta.status];
            const TipoIcon = TIPO_META[alerta.tipo].icon;
            const isOpen = expanded === alerta.id;

            return (
              <div key={alerta.id} className={`rounded-lg border border-border bg-card overflow-hidden flex ${sev.bg}`}>
                {/* Severity stripe */}
                <div className={`w-1 shrink-0 ${sev.bar}`} />

                <div className="flex-1 min-w-0">
                  {/* Main row */}
                  <div className="flex items-start gap-3 px-4 py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-border shrink-0 mt-0.5">
                      <TipoIcon className="size-4 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{alerta.membro.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{alerta.id}</span>
                        <Pill color={sev.pill} variant="soft" size="sm">{sev.label}</Pill>
                        <Pill color={sm.color}  variant="soft" size="sm">{sm.label}</Pill>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{TIPO_META[alerta.tipo].label}</p>
                      <p className="text-sm mt-1.5">{alerta.descricao}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alerta.membro.email} · Detectado {alerta.detectado}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Actions */}
                      {alerta.status === "novo" && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => setStatus(alerta.id, "em_analise")}>
                            Analisar
                          </Button>
                          <Button variant="ghost" size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setStatus(alerta.id, "bloqueado")}>
                            <Ban className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {alerta.status === "em_analise" && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => setStatus(alerta.id, "resolvido")}>
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            Resolver
                          </Button>
                          <Button variant="ghost" size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setStatus(alerta.id, "bloqueado")}>
                            <Ban className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {/* Expand toggle */}
                      <button
                        onClick={() => setExpanded(isOpen ? null : alerta.id)}
                        className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors ml-1"
                      >
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Detalhe expandido */}
                  {isOpen && (
                    <div className="px-4 pb-4 pt-0">
                      <div className="rounded-lg border border-border bg-background/60 px-4 py-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Detalhes do alerta</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{alerta.detalhe}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Config drawer */}
      <FormDrawer
        open={configOpen}
        onOpenChange={v => { if (!v) setConfigOpen(false); }}
        title="Configurar regras de detecção"
        description="Ajuste os limiares que disparam alertas automáticos. Mudanças se aplicam a novos eventos — alertas existentes não são afetados."
        onSave={() => { setConfigOpen(false); toast.success("Regras salvas"); }}
        saveLabel="Salvar regras"
      >
        <div className="space-y-5">
          {regras.map(r => (
            <div key={r.id} className="space-y-1.5">
              <Label className="text-sm font-medium">{r.label}</Label>
              <p className="text-xs text-muted-foreground">{r.desc}</p>
              <Input
                type="number"
                value={r.limiar}
                onChange={e => setRegras(prev => prev.map(x => x.id === r.id ? { ...x, limiar: e.target.value } : x))}
                className="w-32"
              />
            </div>
          ))}

          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Como funciona</p>
            <p>O motor verifica cada evento de acúmulo, resgate e indicação em tempo real. Quando um limiar é ultrapassado, um alerta é criado automaticamente e o analista é notificado.</p>
          </div>
        </div>
      </FormDrawer>
    </div>
  );
}
