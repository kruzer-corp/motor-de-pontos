import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Users, X, SlidersHorizontal, CheckCircle2, XCircle } from "lucide-react";
import {
  Avatar, AvatarFallback, Button, EmptyState,
  FormDrawer, InfoNotice, Input, Label, PageHeader, Pill,
  SearchInput, Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
  Table, TableBody, TableHead, TableHeader, TableRow,
  toast,
} from "@kruzer/ds";

// ── Membros ───────────────────────────────────────────────────────────────────

type Tier    = "Diamante" | "Ouro" | "Prata" | "Bronze";
type Segment = "Premium" | "Frete Grátis" | "Fidelidade" | "Básico";

type SaldoCampanha = {
  campanhaId: string;
  campanhaNome: string;
  moeda: string;
  abrev: string;
  valor: number;
};

type Status = "ativo" | "pendente" | "recusado";

type Member = {
  id: string; name: string; initials: string;
  saldos: SaldoCampanha[];
  tier: Tier; segment: Segment; joined: string;
  status: Status;
  motivoRecusa?: string;
};

const INITIAL_MEMBERS: Member[] = [
  { id: "1", name: "Aline P.",    initials: "AP", tier: "Diamante", segment: "Premium",      joined: "12/04/2025", status: "ativo",
    saldos: [
      { campanhaId: "BF2026",       campanhaNome: "Black Friday 2026", moeda: "Pontos",   abrev: "pts", valor: 5200 },
      { campanhaId: "CAMP-2025-06", campanhaNome: "Campanha Junho",    moeda: "Cashback", abrev: "R$",  valor: 320  },
    ]},
  { id: "2", name: "Bruno C.",    initials: "BC", tier: "Ouro",     segment: "Frete Grátis", joined: "22/01/2025", status: "ativo",
    saldos: [
      { campanhaId: "CAMP-2025-04", campanhaNome: "Campanha Abril",    moeda: "Pontos",   abrev: "pts", valor: 3200 },
    ]},
  { id: "3", name: "Cecília M.",  initials: "CM", tier: "Prata",    segment: "Fidelidade",   joined: "03/08/2024", status: "ativo",
    saldos: [
      { campanhaId: "CAMP-2025-05", campanhaNome: "Campanha Maio",     moeda: "Milhas",   abrev: "mi",  valor: 1800 },
    ]},
  { id: "4", name: "Danilo R.",   initials: "DR", tier: "Bronze",   segment: "Básico",       joined: "17/03/2025", status: "ativo",
    saldos: [
      { campanhaId: "CAMP-2025-05", campanhaNome: "Campanha Maio",     moeda: "Pontos",   abrev: "pts", valor: 760  },
    ]},
  { id: "5", name: "Eduardo F.",  initials: "EF", tier: "Bronze",   segment: "Básico",       joined: "08/07/2026", status: "pendente", saldos: [] },
  { id: "6", name: "Fernanda L.", initials: "FL", tier: "Bronze",   segment: "Básico",       joined: "10/07/2026", status: "pendente", saldos: [] },
  { id: "7", name: "Gustavo M.",  initials: "GM", tier: "Bronze",   segment: "Fidelidade",   joined: "14/07/2026", status: "pendente", saldos: [] },
];

const TIER_PILL: Record<Tier, "primary" | "warning" | "secondary" | "muted"> = {
  Diamante: "primary", Ouro: "warning", Prata: "secondary", Bronze: "muted",
};

const TIERS:    Tier[]    = ["Diamante", "Ouro", "Prata", "Bronze"];
const SEGMENTS: Segment[] = ["Premium", "Frete Grátis", "Fidelidade", "Básico"];

export default function Membros() {
  const navigate = useNavigate();

  // ── Lista state ───────────────────────────────────────────────────────────
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [search,  setSearch]  = useState("");
  const [tab,     setTab]     = useState<"todos" | "ativos" | "pendentes">("todos");

  const pendingCount = members.filter(m => m.status === "pendente").length;

  // ── Aprovação/Recusa ──────────────────────────────────────────────────────
  const [recusaOpen,   setRecusaOpen]   = useState(false);
  const [recusaMembro, setRecusaMembro] = useState<Member | null>(null);
  const [recusaMotivo, setRecusaMotivo] = useState("");
  const [recusaSaving, setRecusaSaving] = useState(false);

  function handleAprovar(m: Member) {
    setMembers(prev => prev.map(x => x.id === m.id ? { ...x, status: "ativo" as Status } : x));
    toast.success(`${m.name} aprovado no programa`);
  }

  function abrirRecusa(m: Member) {
    setRecusaMembro(m); setRecusaMotivo(""); setRecusaOpen(true);
  }

  async function handleRecusar() {
    if (!recusaMembro || !recusaMotivo) return;
    setRecusaSaving(true);
    await new Promise(r => setTimeout(r, 350));
    setMembers(prev => prev.map(x =>
      x.id === recusaMembro.id ? { ...x, status: "recusado" as Status, motivoRecusa: recusaMotivo } : x
    ));
    toast.success(`Cadastro de ${recusaMembro.name} recusado`);
    setRecusaSaving(false); setRecusaOpen(false);
  }

  // Drawer state
  const [open,       setOpen]       = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState<"PF" | "PJ">("PF");
  const [name,       setName]       = useState("");
  const [razaoSocial,setRazaoSocial]= useState("");
  const [email,      setEmail]      = useState("");
  const [documento,  setDocumento]  = useState("");
  const [phone,      setPhone]      = useState("");
  const [tier,       setTier]       = useState<Tier | "">("");
  const [segment,    setSegment]    = useState<Segment | "">();

  const filtered = useMemo(() => {
    const byTab = tab === "todos"     ? members
                : tab === "ativos"    ? members.filter(m => m.status === "ativo")
                :                      members.filter(m => m.status === "pendente");
    return byTab.filter(m =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.segment.toLowerCase().includes(search.toLowerCase())
    );
  }, [members, search, tab]);

  // ── Ajuste de saldo ───────────────────────────────────────────────────────
  const [ajusteOpen,      setAjusteOpen]      = useState(false);
  const [ajusteMembro,    setAjusteMembro]    = useState<Member | null>(null);
  const [ajusteCampanha,  setAjusteCampanha]  = useState<SaldoCampanha | null>(null);
  const [ajusteTipo,      setAjusteTipo]      = useState<"credito" | "debito">("credito");
  const [ajusteValor,     setAjusteValor]     = useState("");
  const [ajusteMotivo,    setAjusteMotivo]    = useState("");
  const [ajusteSaving,    setAjusteSaving]    = useState(false);

  function abrirAjuste(m: Member) {
    setAjusteMembro(m);
    setAjusteCampanha(m.saldos[0] ?? null);
    setAjusteTipo("credito"); setAjusteValor(""); setAjusteMotivo("");
    setAjusteOpen(true);
  }

  async function handleAjuste() {
    if (!ajusteMembro || !ajusteCampanha || !ajusteValor || !ajusteMotivo) return;
    setAjusteSaving(true);
    await new Promise(r => setTimeout(r, 400));
    const delta = ajusteTipo === "credito" ? Number(ajusteValor) : -Number(ajusteValor);
    setMembers(prev => prev.map(m => {
      if (m.id !== ajusteMembro.id) return m;
      return {
        ...m,
        saldos: m.saldos.map(s =>
          s.campanhaId === ajusteCampanha.campanhaId
            ? { ...s, valor: Math.max(0, s.valor + delta) }
            : s
        ),
      };
    }));
    toast.success(`${ajusteMembro.name} · ${ajusteCampanha.campanhaNome}: ${ajusteTipo === "credito" ? "+" : "−"}${Number(ajusteValor).toLocaleString("pt-BR")} ${ajusteCampanha.abrev}`);
    setAjusteOpen(false);
    setAjusteSaving(false);
  }

  function resetForm() {
    setTipoPessoa("PF"); setName(""); setRazaoSocial(""); setEmail("");
    setDocumento(""); setPhone(""); setTier(""); setSegment("");
  }

  async function handleSave() {
    if (!name || !email) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));

    const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
    const today = new Date().toLocaleDateString("pt-BR");

    setMembers((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        name,
        initials,
        saldos: [],
        tier: (tier || "Bronze") as Tier,
        segment: (segment || "Básico") as Segment,
        joined: today,
      },
    ]);

    setOpen(false);
    resetForm();
    setSaving(false);
    toast.success(`${name} cadastrado como membro`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saldo dos membros"
        path={[{ label: "Operação" }]}
        description={`${members.length} membros registrados no programa`}
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Registrar membro
          </Button>
        }
      />

      <>
      <InfoNotice variant="info" title="Visão administrativa">
        Membros não acessam esta interface. Eles participam do programa pelo canal próprio (loja, app ou dispositivo). Aqui você consulta e gerencia os registros e transações deles.
      </InfoNotice>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          {/* Tabs */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-0.5 shrink-0">
            {([
              ["todos",     "Todos",    members.length],
              ["ativos",    "Ativos",   members.filter(m => m.status === "ativo").length],
              ["pendentes", "Pendentes", pendingCount],
            ] as const).map(([v, label, count]) => (
              <button key={v} onClick={() => setTab(v)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  tab === v ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}>
                {label}
                {v === "pendentes" && count > 0 && (
                  <span className="rounded-full bg-amber-500 text-white px-1.5 py-0.5 text-[10px] font-bold leading-none">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar membro ou segmento…"
            className="w-64"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title={search ? "Nenhum membro encontrado" : "Nenhum membro ainda"}
              description={
                search
                  ? "Tente buscar por outro nome ou segmento."
                  : "Clique em \"Novo membro\" para cadastrar o primeiro."
              }
              action={!search ? { label: "Novo membro", onClick: () => setOpen(true) } : undefined}
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membro</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead>Solicitou em</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((member) => (
                <tr key={member.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3.5">
                    <button
                      className="flex items-center gap-3 hover:underline text-left"
                      onClick={() => member.status === "ativo" && navigate(`/membros/${member.id}`)}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className={`text-xs font-semibold ${
                          member.status === "pendente" ? "bg-amber-100 text-amber-700" :
                          member.status === "recusado" ? "bg-muted text-muted-foreground" :
                          "bg-primary/10 text-primary"
                        }`}>
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className={`font-medium text-sm ${member.status !== "ativo" ? "text-muted-foreground" : ""}`}>
                        {member.name}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    {member.status === "ativo" && (
                      <Pill color="success" variant="soft" size="sm">Ativo</Pill>
                    )}
                    {member.status === "pendente" && (
                      <Pill color="warning" variant="soft" size="sm">Pendente</Pill>
                    )}
                    {member.status === "recusado" && (
                      <div className="space-y-0.5">
                        <Pill color="danger" variant="soft" size="sm">Recusado</Pill>
                        {member.motivoRecusa && (
                          <p className="text-[11px] text-muted-foreground max-w-[160px] leading-tight">{member.motivoRecusa}</p>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {member.saldos.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        {member.saldos.map(s => (
                          <div key={s.campanhaId} className="flex items-center gap-1.5">
                            <span className="tabular-nums text-sm font-semibold">{s.valor.toLocaleString("pt-BR")}</span>
                            <span className="text-xs text-muted-foreground">{s.abrev}</span>
                            <span className="text-[10px] text-muted-foreground font-mono bg-muted rounded px-1">{s.campanhaId}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <Pill color={TIER_PILL[member.tier]} variant="soft" size="sm">{member.tier}</Pill>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground text-sm">{member.segment}</td>
                  <td className="px-4 py-3.5 text-muted-foreground tabular-nums text-sm">{member.joined}</td>
                  <td className="px-4 py-3.5">
                    {member.status === "ativo" && (
                      <button
                        onClick={() => abrirAjuste(member)}
                        className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors whitespace-nowrap"
                      >
                        <SlidersHorizontal className="h-3 w-3" />
                        Ajustar saldo
                      </button>
                    )}
                    {member.status === "pendente" && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAprovar(member)}
                          className="flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors whitespace-nowrap"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Aprovar
                        </button>
                        <button
                          onClick={() => abrirRecusa(member)}
                          className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors whitespace-nowrap"
                        >
                          <XCircle className="h-3 w-3" />
                          Recusar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modal — Ajuste de saldo */}
      {ajusteOpen && ajusteMembro && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setAjusteOpen(false)}>
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6 space-y-5"
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Ajuste manual de saldo</h2>
                <p className="text-xs text-muted-foreground mt-0.5">O ajuste será registrado no extrato do membro.</p>
              </div>
              <button onClick={() => setAjusteOpen(false)} className="text-muted-foreground hover:text-foreground mt-0.5">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Membro */}
            <div className="flex items-center gap-3 rounded-lg bg-muted/40 px-4 py-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {ajusteMembro.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{ajusteMembro.name}</p>
                <p className="text-xs text-muted-foreground">{ajusteMembro.tier} · {ajusteMembro.segment}</p>
              </div>
            </div>

            {/* Campanha / Moeda */}
            <div className="space-y-1.5">
              <Label>Campanha e moeda <span className="text-destructive">*</span></Label>
              {ajusteMembro.saldos.length === 0 ? (
                <p className="text-xs text-muted-foreground rounded-lg border border-border px-3 py-2">
                  Este membro não está vinculado a nenhuma campanha ativa.
                </p>
              ) : (
                <div className="space-y-2">
                  {ajusteMembro.saldos.map(s => (
                    <label key={s.campanhaId}
                      className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                        ajusteCampanha?.campanhaId === s.campanhaId
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}>
                      <div className="flex items-center gap-2">
                        <input type="radio" name="ajusteCampanha" checked={ajusteCampanha?.campanhaId === s.campanhaId}
                          onChange={() => setAjusteCampanha(s)} className="accent-primary" />
                        <div>
                          <p className="text-sm font-medium">{s.campanhaNome}</p>
                          <p className="text-xs text-muted-foreground font-mono">{s.campanhaId} · moeda: {s.moeda}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">Saldo atual</p>
                        <p className="text-sm font-semibold tabular-nums">{s.valor.toLocaleString("pt-BR")} <span className="text-muted-foreground text-xs">{s.abrev}</span></p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Tipo */}
            <div className="space-y-1.5">
              <Label>Tipo de ajuste</Label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  ["credito", `Crédito (+${ajusteCampanha?.abrev ?? ""})`, "border-emerald-300 bg-emerald-50 text-emerald-700"],
                  ["debito",  `Débito (−${ajusteCampanha?.abrev ?? ""})`,  "border-rose-300 bg-rose-50 text-rose-700"],
                ] as const).map(([v, label, activeClass]) => (
                  <label key={v} className={`flex items-center gap-2 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                    ajusteTipo === v ? activeClass : "border-border text-muted-foreground hover:border-primary/40"
                  }`}>
                    <input type="radio" name="ajusteTipo" value={v} checked={ajusteTipo === v}
                      onChange={() => setAjusteTipo(v)} className="sr-only" />
                    <span className="text-sm font-semibold">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Valor */}
            <div className="space-y-1.5">
              <Label>Valor {ajusteCampanha ? `(${ajusteCampanha.abrev})` : ""} <span className="text-destructive">*</span></Label>
              <Input
                type="number" min={1}
                value={ajusteValor}
                onChange={e => setAjusteValor(e.target.value)}
                placeholder="Ex: 500"
                disabled={!ajusteCampanha}
              />
              {ajusteValor && ajusteCampanha && (
                <p className="text-xs text-muted-foreground">
                  Novo saldo: <strong className="text-foreground tabular-nums">
                    {Math.max(0, ajusteCampanha.valor + (ajusteTipo === "credito" ? Number(ajusteValor) : -Number(ajusteValor))).toLocaleString("pt-BR")} {ajusteCampanha.abrev}
                  </strong>
                </p>
              )}
            </div>

            {/* Motivo */}
            <div className="space-y-1.5">
              <Label>Motivo <span className="text-destructive">*</span></Label>
              <textarea
                value={ajusteMotivo}
                onChange={e => setAjusteMotivo(e.target.value)}
                placeholder="Descreva o motivo do ajuste. Ex: Correção de saldo não creditado na campanha de junho."
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
              <p className="text-xs text-muted-foreground">Obrigatório — registrado no histórico para auditoria.</p>
            </div>

            {/* Ações */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setAjusteOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="flex-1"
                disabled={!ajusteCampanha || !ajusteValor || !ajusteMotivo || ajusteSaving}
                onClick={handleAjuste}
              >
                {ajusteSaving ? "Salvando…" : "Confirmar ajuste"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal — Recusar cadastro */}
      {recusaOpen && recusaMembro && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setRecusaOpen(false)}>
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6 space-y-5"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Recusar cadastro</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  O motivo será enviado ao solicitante por e-mail e registrado para auditoria.
                </p>
              </div>
              <button onClick={() => setRecusaOpen(false)} className="text-muted-foreground hover:text-foreground mt-0.5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-rose-50 border border-rose-100 px-4 py-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-rose-100 text-rose-600 text-xs font-semibold">
                  {recusaMembro.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-rose-800">{recusaMembro.name}</p>
                <p className="text-xs text-rose-500">Solicitação de {recusaMembro.joined}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Motivo da recusa <span className="text-destructive">*</span></Label>
              <textarea
                value={recusaMotivo}
                onChange={e => setRecusaMotivo(e.target.value)}
                placeholder="Ex: Documentação incompleta — CPF não confere com os dados cadastrais informados."
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
              <p className="text-xs text-muted-foreground">Campo obrigatório — enviado ao solicitante e registrado no log.</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setRecusaOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={!recusaMotivo.trim() || recusaSaving}
                onClick={handleRecusar}
              >
                {recusaSaving ? "Recusando…" : "Confirmar recusa"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* FormDrawer — Novo membro */}
      <FormDrawer
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}
        title="Registrar membro"
        description="Registre um participante no programa. As transações dele serão rastreadas automaticamente pelo canal."
        onSave={handleSave}
        saving={saving}
        saveLabel="Cadastrar membro"
        saveDisabled={!name || !email}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tipo de pessoa <span className="text-destructive">*</span></Label>
            <div className="flex gap-2">
              {(["PF", "PJ"] as const).map((tipo) => (
                <button key={tipo} type="button"
                  onClick={() => { setTipoPessoa(tipo); setDocumento(""); setRazaoSocial(""); }}
                  className={`flex-1 rounded-md border py-2 text-sm font-semibold transition-colors ${
                    tipoPessoa === tipo ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                  }`}>
                  {tipo === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
                </button>
              ))}
            </div>
          </div>
          {tipoPessoa === "PF" ? (
            <div className="space-y-1.5">
              <Label>Nome completo <span className="text-destructive">*</span></Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Ana Silva" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Razão social <span className="text-destructive">*</span></Label>
                <Input value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} placeholder="Ex: Empresa LTDA" />
              </div>
              <div className="space-y-1.5">
                <Label>Nome do responsável <span className="text-destructive">*</span></Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Ana Silva" />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>E-mail <span className="text-destructive">*</span></Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder={tipoPessoa === "PF" ? "ana@email.com" : "contato@empresa.com"} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{tipoPessoa === "PF" ? "CPF" : "CNPJ"}</Label>
              <Input value={documento} onChange={(e) => setDocumento(e.target.value)}
                placeholder={tipoPessoa === "PF" ? "000.000.000-00" : "00.000.000/0001-00"} />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-0000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tier inicial</Label>
              <Select value={tier} onValueChange={(v) => setTier(v as Tier)}>
                <SelectTrigger><SelectValue placeholder="Bronze" /></SelectTrigger>
                <SelectContent>{TIERS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Segmento</Label>
              <Select value={segment} onValueChange={(v) => setSegment(v as Segment)}>
                <SelectTrigger><SelectValue placeholder="Básico" /></SelectTrigger>
                <SelectContent>{SEGMENTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </FormDrawer>
      </>

    </div>
  );
}
