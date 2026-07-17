import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar, AvatarFallback, Button, EmptyState,
  FormDrawer, InfoNotice, Input, Label, PageHeader, Pill, SearchInput,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Tabs, TabsContent, TabsList, TabsTrigger,
  toast,
} from "@kruzer/ds";
import { ArrowUpRight, ArrowDownLeft, SlidersHorizontal, Clock, CheckCircle2, Ban, UserPlus, Users, X } from "lucide-react";
import {
  type Tier, type Segmento, type StatusMembro, type SaldoCampanha, type Membro, type Transacao,
  MOEDA_COR, agruparSaldosPorMoeda, getMembros, saveMembros, registrarTransacaoSaldo,
} from "../lib/membros";

// ── Config visual por tipo de movimentação (aba Movimentações) ───────────────

const TIPO_CONFIG: Record<Transacao["tipo"], { label: string; icon: React.ElementType; color: string; bg: string }> = {
  acumulo:   { label: "Acúmulo",   icon: ArrowUpRight,     color: "text-emerald-600", bg: "bg-emerald-50" },
  resgate:   { label: "Resgate",   icon: ArrowDownLeft,    color: "text-rose-600",    bg: "bg-rose-50"    },
  ajuste:    { label: "Ajuste",    icon: SlidersHorizontal,color: "text-sky-600",     bg: "bg-sky-50"     },
  expiracao: { label: "Expiração", icon: Clock,            color: "text-slate-500",   bg: "bg-slate-50"   },
};

const TIPO_FILTRO_OPCOES: ("todos" | Transacao["tipo"])[] = ["todos", "acumulo", "resgate", "ajuste", "expiracao"];

type LinhaExtrato = Transacao & { membroId: string; membroNome: string; membroInitials: string };

function parseData(d: string): number {
  const [dia, mes, ano] = d.split("/").map(Number);
  return new Date(ano ?? 0, (mes ?? 1) - 1, dia ?? 1).getTime();
}

// ── Aba Membros — saldo por moeda e ações de correção ─────────────────────────

type Member = Membro;
type Segment = Segmento;
type Status = StatusMembro;

const TIER_PILL: Record<Tier, "primary" | "warning" | "secondary" | "muted"> = {
  Diamante: "primary", Ouro: "warning", Prata: "secondary", Bronze: "muted",
};

const TIERS:    Tier[]    = ["Diamante", "Ouro", "Prata", "Bronze"];
const SEGMENTS: Segment[] = ["Premium", "Frete Grátis", "Fidelidade", "Básico"];

function AbaMembros() {
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>(() => getMembros());
  const [search,  setSearch]  = useState("");
  const [tab,     setTab]     = useState<"todos" | "ativos" | "bloqueados">("todos");

  function persist(next: Member[]) {
    setMembers(next);
    saveMembros(next);
  }

  const blockedCount = members.filter((m) => m.status === "bloqueado").length;

  // ── Bloqueio/Desbloqueio por fraude ─────────────────────────────────────────
  const [bloqueioOpen,   setBloqueioOpen]   = useState(false);
  const [bloqueioMembro, setBloqueioMembro] = useState<Member | null>(null);
  const [bloqueioMotivo, setBloqueioMotivo] = useState("");
  const [bloqueioSaving, setBloqueioSaving] = useState(false);

  function abrirBloqueio(m: Member) {
    setBloqueioMembro(m); setBloqueioMotivo(""); setBloqueioOpen(true);
  }

  async function handleBloquear() {
    if (!bloqueioMembro || !bloqueioMotivo) return;
    setBloqueioSaving(true);
    await new Promise((r) => setTimeout(r, 350));
    persist(members.map((x) =>
      x.id === bloqueioMembro.id ? { ...x, status: "bloqueado" as Status, motivoBloqueio: bloqueioMotivo } : x
    ));
    toast.error(`${bloqueioMembro.nome} bloqueado`);
    setBloqueioSaving(false); setBloqueioOpen(false);
  }

  function handleDesbloquear(m: Member) {
    persist(members.map((x) => (x.id === m.id ? { ...x, status: "ativo" as Status, motivoBloqueio: undefined } : x)));
    toast.success(`${m.nome} desbloqueado`);
  }

  // ── Registrar membro ────────────────────────────────────────────────────────
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
    const byTab = tab === "todos" ? members
                : tab === "ativos" ? members.filter((m) => m.status === "ativo")
                : members.filter((m) => m.status === "bloqueado");
    return byTab.filter((m) =>
      m.nome.toLowerCase().includes(search.toLowerCase()) ||
      m.segmento.toLowerCase().includes(search.toLowerCase())
    );
  }, [members, search, tab]);

  // ── Ajuste de saldo — grava direto no ledger único ─────────────────────────
  const [ajusteOpen,     setAjusteOpen]     = useState(false);
  const [ajusteMembro,   setAjusteMembro]   = useState<Member | null>(null);
  const [ajusteCampanha, setAjusteCampanha] = useState<SaldoCampanha | null>(null);
  const [ajusteTipo,     setAjusteTipo]     = useState<"credito" | "debito">("credito");
  const [ajusteValor,    setAjusteValor]    = useState("");
  const [ajusteMotivo,   setAjusteMotivo]   = useState("");
  const [ajusteSaving,   setAjusteSaving]   = useState(false);

  function abrirAjuste(m: Member) {
    setAjusteMembro(m);
    setAjusteCampanha(m.saldos[0] ?? null);
    setAjusteTipo("credito"); setAjusteValor(""); setAjusteMotivo("");
    setAjusteOpen(true);
  }

  async function handleAjuste() {
    if (!ajusteMembro || !ajusteCampanha || !ajusteValor || !ajusteMotivo) return;
    setAjusteSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    const delta = ajusteTipo === "credito" ? Number(ajusteValor) : -Number(ajusteValor);
    registrarTransacaoSaldo(ajusteMembro.id, {
      moeda: ajusteCampanha.moeda, abrev: ajusteCampanha.abrev, delta,
      descricao: `Ajuste manual — ${ajusteMotivo}`, tipo: "ajuste",
    });
    setMembers(getMembros());
    toast.success(`${ajusteMembro.nome} · ${ajusteCampanha.campanhaNome}: ${ajusteTipo === "credito" ? "+" : "−"}${Number(ajusteValor).toLocaleString("pt-BR")} ${ajusteCampanha.abrev}`);
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

    persist([
      ...members,
      {
        id: String(members.length + 1),
        nome: name,
        initials,
        cpf: documento,
        email,
        telefone: phone,
        canal: "App",
        saldos: [],
        tier: (tier || "Bronze") as Tier,
        segmento: (segment || "Básico") as Segment,
        status: "ativo",
        desde: today,
        expiram30d: 0,
        transacoes: [],
        pedidos: [],
        ajustes: [],
      },
    ]);

    setOpen(false);
    resetForm();
    setSaving(false);
    toast.success(`${name} cadastrado como membro`);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Registrar membro
        </Button>
      </div>

      <InfoNotice variant="info" title="Visão administrativa">
        Membros não acessam esta interface. Eles participam do programa pelo canal próprio (loja, app ou dispositivo). Aqui você consulta e corrige o saldo (carteira) deles.
      </InfoNotice>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-0.5 shrink-0">
            {([
              ["todos", "Todos", members.length],
              ["ativos", "Ativos", members.filter((m) => m.status === "ativo").length],
              ["bloqueados", "Bloqueados", blockedCount],
            ] as const).map(([v, label, count]) => (
              <button key={v} onClick={() => setTab(v)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  tab === v ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}>
                {label}
                {v === "bloqueados" && count > 0 && (
                  <span className="rounded-full bg-rose-500 text-white px-1.5 py-0.5 text-[10px] font-bold leading-none">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar membro ou segmento…" className="w-64" />
        </div>

        {filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title={search ? "Nenhum membro encontrado" : "Nenhum membro ainda"}
              description={search ? "Tente buscar por outro nome ou segmento." : "Clique em \"Registrar membro\" para cadastrar o primeiro."}
              action={!search ? { label: "Registrar membro", onClick: () => setOpen(true) } : undefined}
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membro</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Saldo (carteira)</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead>Membro desde</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((member) => (
                <tr key={member.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3.5">
                    <button
                      className="flex items-center gap-3 hover:underline text-left"
                      onClick={() => navigate(`/membros/${member.id}`)}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className={`text-xs font-semibold ${
                          member.status === "bloqueado" ? "bg-rose-100 text-rose-700" : "bg-primary/10 text-primary"
                        }`}>
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className={`font-medium text-sm ${member.status !== "ativo" ? "text-muted-foreground" : ""}`}>
                        {member.nome}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    {member.status === "ativo" && <Pill color="success" variant="soft" size="sm">Ativo</Pill>}
                    {member.status === "bloqueado" && (
                      <div className="space-y-0.5">
                        <Pill color="destructive" variant="soft" size="sm">Bloqueado</Pill>
                        {member.motivoBloqueio && (
                          <p className="text-[11px] text-muted-foreground max-w-[160px] leading-tight">{member.motivoBloqueio}</p>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {member.saldos.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {agruparSaldosPorMoeda(member.saldos).map((s) => (
                          <Pill key={s.moeda} color={MOEDA_COR[s.moeda] ?? "muted"} variant="soft" size="sm" dot>
                            {s.total.toLocaleString("pt-BR")} {s.abrev}
                          </Pill>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <Pill color={TIER_PILL[member.tier]} variant="soft" size="sm">{member.tier}</Pill>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground text-sm">{member.segmento}</td>
                  <td className="px-4 py-3.5 text-muted-foreground tabular-nums text-sm">{member.desde}</td>
                  <td className="px-4 py-3.5">
                    {member.status === "ativo" && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => abrirAjuste(member)}
                          className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors whitespace-nowrap"
                        >
                          <SlidersHorizontal className="h-3 w-3" />
                          Ajustar saldo
                        </button>
                        <button
                          onClick={() => abrirBloqueio(member)}
                          className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors whitespace-nowrap"
                        >
                          <Ban className="h-3 w-3" />
                          Bloquear
                        </button>
                      </div>
                    )}
                    {member.status === "bloqueado" && (
                      <button
                        onClick={() => handleDesbloquear(member)}
                        className="flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors whitespace-nowrap"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Desbloquear
                      </button>
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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setAjusteOpen(false)}>
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Ajuste manual de saldo</h2>
                <p className="text-xs text-muted-foreground mt-0.5">O ajuste será registrado no extrato do membro.</p>
              </div>
              <button onClick={() => setAjusteOpen(false)} className="text-muted-foreground hover:text-foreground mt-0.5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-muted/40 px-4 py-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{ajusteMembro.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{ajusteMembro.nome}</p>
                <p className="text-xs text-muted-foreground">{ajusteMembro.tier} · {ajusteMembro.segmento}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Campanha e moeda <span className="text-destructive">*</span></Label>
              {ajusteMembro.saldos.length === 0 ? (
                <p className="text-xs text-muted-foreground rounded-lg border border-border px-3 py-2">
                  Este membro não está vinculado a nenhuma campanha ativa.
                </p>
              ) : (
                <div className="space-y-2">
                  {ajusteMembro.saldos.map((s) => (
                    <label key={s.campanhaId}
                      className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                        ajusteCampanha?.campanhaId === s.campanhaId ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
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

            <div className="space-y-1.5">
              <Label>Tipo de ajuste</Label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  ["credito", `Crédito (+${ajusteCampanha?.abrev ?? ""})`, "border-emerald-300 bg-emerald-50 text-emerald-700"],
                  ["debito", `Débito (−${ajusteCampanha?.abrev ?? ""})`, "border-rose-300 bg-rose-50 text-rose-700"],
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

            <div className="space-y-1.5">
              <Label>Valor {ajusteCampanha ? `(${ajusteCampanha.abrev})` : ""} <span className="text-destructive">*</span></Label>
              <Input type="number" min={1} value={ajusteValor} onChange={(e) => setAjusteValor(e.target.value)} placeholder="Ex: 500" disabled={!ajusteCampanha} />
              {ajusteValor && ajusteCampanha && (
                <p className="text-xs text-muted-foreground">
                  Novo saldo: <strong className="text-foreground tabular-nums">
                    {Math.max(0, ajusteCampanha.valor + (ajusteTipo === "credito" ? Number(ajusteValor) : -Number(ajusteValor))).toLocaleString("pt-BR")} {ajusteCampanha.abrev}
                  </strong>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Motivo <span className="text-destructive">*</span></Label>
              <textarea
                value={ajusteMotivo}
                onChange={(e) => setAjusteMotivo(e.target.value)}
                placeholder="Descreva o motivo do ajuste. Ex: Correção de saldo não creditado na campanha de junho."
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
              <p className="text-xs text-muted-foreground">Obrigatório — registrado no histórico para auditoria.</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setAjusteOpen(false)}>Cancelar</Button>
              <Button className="flex-1" disabled={!ajusteCampanha || !ajusteValor || !ajusteMotivo || ajusteSaving} onClick={handleAjuste}>
                {ajusteSaving ? "Salvando…" : "Confirmar ajuste"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal — Bloquear membro por fraude */}
      {bloqueioOpen && bloqueioMembro && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setBloqueioOpen(false)}>
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Bloquear membro</h2>
                <p className="text-xs text-muted-foreground mt-0.5">O membro para de acumular e resgatar imediatamente. O motivo é registrado para auditoria.</p>
              </div>
              <button onClick={() => setBloqueioOpen(false)} className="text-muted-foreground hover:text-foreground mt-0.5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-rose-50 border border-rose-100 px-4 py-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-rose-100 text-rose-600 text-xs font-semibold">{bloqueioMembro.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-rose-800">{bloqueioMembro.nome}</p>
                <p className="text-xs text-rose-500">Membro desde {bloqueioMembro.desde}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Motivo do bloqueio <span className="text-destructive">*</span></Label>
              <textarea
                value={bloqueioMotivo}
                onChange={(e) => setBloqueioMotivo(e.target.value)}
                placeholder="Ex: Padrão de acúmulo atípico identificado — aguardando validação de identidade."
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
              <p className="text-xs text-muted-foreground">Campo obrigatório — registrado no log de auditoria.</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setBloqueioOpen(false)}>Cancelar</Button>
              <Button variant="destructive" className="flex-1" disabled={!bloqueioMotivo.trim() || bloqueioSaving} onClick={handleBloquear}>
                {bloqueioSaving ? "Bloqueando…" : "Confirmar bloqueio"}
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
    </div>
  );
}

// ── Aba Movimentações — extrato consolidado de todos os membros ──────────────

function AbaMovimentacoes() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | Transacao["tipo"]>("todos");

  const linhas: LinhaExtrato[] = useMemo(() => {
    const todas = getMembros().flatMap((m) =>
      m.transacoes.map((t) => ({ ...t, membroId: m.id, membroNome: m.nome, membroInitials: m.initials }))
    );
    return todas.sort((a, b) => parseData(b.data) - parseData(a.data));
  }, []);

  const filtradas = linhas.filter((l) =>
    (tipoFiltro === "todos" || l.tipo === tipoFiltro) &&
    (!query || l.membroNome.toLowerCase().includes(query.toLowerCase()) || l.descricao.toLowerCase().includes(query.toLowerCase()))
  );

  const totalCreditado = linhas.filter((l) => l.valor > 0).reduce((a, l) => a + l.valor, 0);
  const totalDebitado = Math.abs(linhas.filter((l) => l.valor < 0).reduce((a, l) => a + l.valor, 0));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Movimentações</div>
          <div className="mt-1 text-2xl font-bold tabular-nums">{linhas.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Total creditado</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-emerald-600">+{totalCreditado.toLocaleString("pt-BR")}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Total debitado</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-rose-600">−{totalDebitado.toLocaleString("pt-BR")}</div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border">
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar membro ou descrição…" className="w-64" />
          <div className="w-44">
            <Select value={tipoFiltro} onValueChange={(v) => setTipoFiltro(v as "todos" | Transacao["tipo"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIPO_FILTRO_OPCOES.map((t) => (
                  <SelectItem key={t} value={t}>{t === "todos" ? "Todos os tipos" : TIPO_CONFIG[t].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-xs text-muted-foreground ml-auto">{filtradas.length} de {linhas.length} movimentações</span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Membro</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-10">
                  Nenhuma movimentação encontrada para esse filtro.
                </TableCell>
              </TableRow>
            ) : (
              filtradas.map((l) => {
                const cfg = TIPO_CONFIG[l.tipo];
                const Icon = cfg.icon;
                return (
                  <TableRow
                    key={`${l.membroId}-${l.id}`}
                    className="[&>td]:py-3 cursor-pointer hover:bg-muted/30"
                    onClick={() => navigate(`/membros/${l.membroId}`)}
                  >
                    <TableCell className="text-muted-foreground tabular-nums text-sm whitespace-nowrap">{l.data}</TableCell>
                    <TableCell className="text-sm font-medium whitespace-nowrap">{l.membroNome}</TableCell>
                    <TableCell>
                      <Pill color="muted" variant="soft" size="sm">
                        <span className={`inline-flex items-center gap-1 ${cfg.color}`}>
                          <Icon className="h-3 w-3" />{cfg.label}
                        </span>
                      </Pill>
                    </TableCell>
                    <TableCell className="text-sm max-w-sm truncate">{l.descricao}</TableCell>
                    <TableCell className={`text-right tabular-nums font-semibold text-sm whitespace-nowrap ${l.valor >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {l.valor >= 0 ? "+" : ""}{l.valor.toLocaleString("pt-BR")} {l.abrev}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm text-muted-foreground whitespace-nowrap">
                      {l.saldo.toLocaleString("pt-BR")} {l.abrev}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Extrato() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Membros e movimentações"
        path={[{ label: "Operação" }]}
        description="Saldo (carteira) de cada membro, correções manuais e o extrato consolidado de movimentações do programa."
      />

      <Tabs defaultValue="movimentacoes">
        <TabsList>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
          <TabsTrigger value="membros">Membros</TabsTrigger>
        </TabsList>
        <TabsContent value="movimentacoes" className="mt-4">
          <AbaMovimentacoes />
        </TabsContent>
        <TabsContent value="membros" className="mt-4">
          <AbaMembros />
        </TabsContent>
      </Tabs>
    </div>
  );
}
