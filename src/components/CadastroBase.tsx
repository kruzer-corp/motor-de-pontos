import { useState, useMemo } from "react";
import {
  Avatar, AvatarFallback, Button, EmptyState, Input, Label, NumberInput, Pill, SearchInput,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  toast,
} from "@kruzer/ds";
import { Archive, Ban, CheckCircle, Link2, Package, Pencil, Plus, RotateCcw, Upload, UserPlus, Users, X } from "lucide-react";
import { type MetodoBase } from "../lib/onboarding";
import { type Membro, type StatusMembro, type EventoBruto, getMembros, saveMembros } from "../lib/membros";
import {
  type ModeloVenda, type Produto, type ProdutoStatus,
  CATEGORIAS, PRODUTO_STATUS_PILL, PRODUTO_STATUS_LABEL, ORIGEM_CADASTRO_LABEL, getProdutos, saveProdutos,
} from "../lib/produtos";
import { getTiersMembro, ordenarPorLimiar } from "../lib/tiers";
import { getPapeisMembro } from "../lib/papeisMembro";
import { type TierProduto, getTiersProduto, tierProdutoPorPreco } from "../lib/tiersProduto";
import { getSegmentosMembro } from "../lib/segmentosMembro";
import { type Campanha, camposCampanhasAtivasPorProduto } from "../lib/campanhas";

// Cadastro de Produtos e Membros — usado tanto no Onboarding quanto na Biblioteca
// (mesmo componente, mesma fonte de dados — só muda onde ele é exibido).

export const METODO_OPCOES: { value: MetodoBase; label: string; desc: string; icon: typeof Upload; badge?: string }[] = [
  { value: "planilha",   label: "Já tenho uma planilha ou CSV",         desc: "Suba a lista de uma vez, com todos os dados.",                icon: Upload   },
  { value: "manual",     label: "Vou cadastrar do zero, manualmente",   desc: "Programa novo — adicione um a um conforme for precisando.",  icon: UserPlus },
  { value: "integracao", label: "Quero integrar com meu sistema",       desc: "Loja virtual, ERP ou CRM — sincroniza automaticamente.",      icon: Link2, badge: "Em breve" },
];

// ── Seletor de método (planilha / manual / integração) ───────────────────────

export function MetodoSelector({ metodo, onChange }: { metodo: MetodoBase | null; onChange: (v: MetodoBase) => void }) {
  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4 space-y-3">
      <div>
        <p className="text-sm font-semibold">Como você quer trazer sua base?</p>
        <p className="text-xs text-muted-foreground mt-0.5">Isso só organiza o que aparece abaixo — você pode trocar quando quiser.</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {METODO_OPCOES.map((opt) => {
          const Icon = opt.icon;
          return (
            <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
              className={`flex flex-col gap-1.5 rounded-lg border px-4 py-3 text-left transition-colors ${
                metodo === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
              }`}>
              <div className="flex items-center justify-between">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {opt.badge && <span className="text-[10px] font-semibold text-violet-600 bg-violet-100 rounded-full px-1.5 py-0.5">{opt.badge}</span>}
              </div>
              <span className="text-sm font-semibold">{opt.label}</span>
              <span className="text-xs text-muted-foreground">{opt.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Eventos não-transacionais gerados no momento do cadastro — entram no motor
// de cálculo igual um evento de compra (Elegibilidade, Atribuição, Políticas).
function eventosCadastro(canal: string, indicadoPorId?: string): EventoBruto[] {
  const hoje = new Date().toLocaleDateString("pt-BR");
  const eventos: EventoBruto[] = [
    { id: `EVT-CAD-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      data: hoje, fonteId: canal, fonte: canal, evento: "cadastro",
      descricao: "Cadastro no programa", statusPedido: "Concluído", valorCompra: 0 },
  ];
  if (indicadoPorId) {
    eventos.push({
      id: `EVT-IND-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      data: hoje, fonteId: canal, fonte: canal, evento: "indicacao",
      descricao: "Indicação de novo membro", statusPedido: "Concluído", valorCompra: 0,
      geradoPorMembroId: indicadoPorId,
    });
  }
  return eventos;
}

// ── Seção: Membros ───────────────────────────────────────────────────────────

type MembroDraft = { nome: string; email: string; tier: string; segmento: string; papel?: string };

export function SecaoMembros({ sempreVazio }: { sempreVazio?: boolean }) {
  const [membros, setMembros] = useState<Membro[]>(() => getMembros());
  const tiersMembro = getTiersMembro();
  const tierPadrao = ordenarPorLimiar(tiersMembro)[0]?.nome ?? "Bronze";
  const papeisMembro = getPapeisMembro();
  const segmentosMembro = getSegmentosMembro();
  const [importResult, setImportResult] = useState<{
    novos: { nome: string; email: string; tier: string; segmento: string }[];
    existentes: string[]; invalidos: string[];
  } | null>(null);

  // Filtros da tabela
  const [buscaTabela, setBuscaTabela] = useState("");
  const [filtroTier, setFiltroTier] = useState("todos");
  const [filtroSegmento, setFiltroSegmento] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState<StatusMembro | "todos">("todos");

  const [adicionando, setAdicionando] = useState(false);
  const [editando, setEditando] = useState<Membro | null>(null);
  const [importAberto, setImportAberto] = useState(false);

  function persist(next: Membro[]) {
    setMembros(next);
    saveMembros(next);
  }

  function salvarNovo(d: MembroDraft, indicadoPor?: string) {
    const today = new Date().toLocaleDateString("pt-BR");
    persist([
      ...membros,
      {
        id: String(membros.length + 1),
        nome: d.nome, initials: d.nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase(),
        cpf: "", email: d.email, telefone: "", canal: "App",
        saldos: [], tier: d.tier, segmento: d.segmento, papel: d.papel, status: "ativo", desde: today,
        expiram30d: 0, transacoes: [], pedidos: [], ajustes: [],
        eventos: eventosCadastro("App", indicadoPor),
      },
    ]);
    toast.success(`${d.nome} cadastrado`);
    setAdicionando(false);
  }

  function salvarEdicao(d: MembroDraft) {
    if (!editando) return;
    persist(membros.map((x) => (x.id === editando.id
      ? { ...x, nome: d.nome, initials: d.nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase(), email: d.email, tier: d.tier, segmento: d.segmento, papel: d.papel }
      : x)));
    toast.success(`${d.nome} atualizado`);
    setEditando(null);
  }

  function alternarBloqueio(id: string) {
    const m = membros.find((x) => x.id === id);
    const novoStatus: StatusMembro = m?.status === "ativo" ? "bloqueado" : "ativo";
    persist(membros.map((x) => (x.id === id ? { ...x, status: novoStatus, motivoBloqueio: novoStatus === "ativo" ? undefined : x.motivoBloqueio } : x)));
    toast.success(`Membro ${novoStatus === "bloqueado" ? "bloqueado" : "desbloqueado"}`);
  }

  function processarCSV(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const linhas = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const emailsExistentes = new Set(membros.map((m) => m.email.toLowerCase()));
      const novos: { nome: string; email: string; tier: string; segmento: string }[] = [];
      const existentes: string[] = []; const invalidos: string[] = [];
      for (const linha of linhas) {
        const cols = linha.split(/[;,]/).map((c) => c.trim().replace(/^["']|["']$/g, ""));
        if (cols[0]?.toLowerCase() === "nome") continue;
        const [n, em, tierRaw, segRaw] = cols;
        if (!n || !em || !em.includes("@")) { invalidos.push(linha); continue; }
        if (emailsExistentes.has(em.toLowerCase())) { existentes.push(em); continue; }
        const tierValido = tiersMembro.find((t) => t.nome.toLowerCase() === tierRaw?.toLowerCase());
        const segValido = segmentosMembro.find((s) => s.nome.toLowerCase() === segRaw?.toLowerCase());
        novos.push({ nome: n, email: em, tier: tierValido?.nome ?? tierPadrao, segmento: segValido?.nome ?? "" });
      }
      setImportResult({ novos, existentes, invalidos });
    };
    reader.readAsText(file);
  }

  function confirmarImport() {
    if (!importResult || importResult.novos.length === 0) return;
    const today = new Date().toLocaleDateString("pt-BR");
    const novosMembros: Membro[] = importResult.novos.map((n, i) => ({
      id: String(membros.length + i + 1),
      nome: n.nome, initials: n.nome.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase(),
      cpf: "", email: n.email, telefone: "", canal: "Importação",
      saldos: [], tier: n.tier, segmento: n.segmento, status: "ativo", desde: today,
      expiram30d: 0, transacoes: [], pedidos: [], ajustes: [],
      eventos: eventosCadastro("Importação"),
    }));
    persist([...membros, ...novosMembros]);
    toast.success(`${novosMembros.length} membro(s) importado(s)`);
    setImportResult(null);
    setImportAberto(false);
  }

  function fecharImport() {
    setImportAberto(false);
    setImportResult(null);
  }

  const ativos = membros.filter((m) => m.status === "ativo").length;
  const bloqueados = membros.filter((m) => m.status === "bloqueado").length;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border flex-wrap">
        <div className="flex items-center gap-2.5">
          <Users className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold">Membros</p>
            <p className="text-xs text-muted-foreground">
              {sempreVazio ? "0 cadastrado(s) hoje." : `${ativos} ativo(s) · ${bloqueados} bloqueado(s)`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={() => setImportAberto(true)}>
            <Upload className="mr-1.5 h-3.5 w-3.5" />Importar em lote
          </Button>
          <Button size="sm" onClick={() => setAdicionando(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />Adicionar membro
          </Button>
        </div>
      </div>

      <div className="p-5">
        {sempreVazio || membros.length === 0 ? (
          <EmptyState icon={Users} title="Nenhum membro cadastrado ainda"
            description='Clique em "Adicionar membro" ou "Importar em lote" acima.' />
        ) : (
          <MembrosTable membros={membros} tiersMembro={tiersMembro} segmentosMembro={segmentosMembro}
            busca={buscaTabela} onBusca={setBuscaTabela}
            filtroTier={filtroTier} onFiltroTier={setFiltroTier}
            filtroSegmento={filtroSegmento} onFiltroSegmento={setFiltroSegmento}
            filtroStatus={filtroStatus} onFiltroStatus={setFiltroStatus}
            onEditar={setEditando} onAlternarBloqueio={alternarBloqueio} />
        )}
      </div>

      {adicionando && (
        <MembroFormModal tiersMembro={tiersMembro} segmentosMembro={segmentosMembro} papeisMembro={papeisMembro}
          membros={membros} tierPadrao={tierPadrao}
          onClose={() => setAdicionando(false)} onSave={salvarNovo} />
      )}
      {editando && (
        <MembroFormModal initial={editando} tiersMembro={tiersMembro} segmentosMembro={segmentosMembro} papeisMembro={papeisMembro}
          membros={membros} tierPadrao={tierPadrao}
          onClose={() => setEditando(null)} onSave={salvarEdicao} />
      )}

      {importAberto && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={fecharImport}>
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">Importar membros em lote</h2>
              <button onClick={fecharImport} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
            </div>
            {!importResult ? (
              <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <p className="text-xs text-muted-foreground text-center">Arraste um CSV aqui ou clique para selecionar<br />Colunas: Nome;Email;Tier;Segmento (Tier/Segmento opcionais)</p>
                <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processarCSV(f); }} />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-emerald-700">{importResult.novos.length}</p>
                    <p className="text-[11px] text-emerald-600">Novos</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-center">
                    <p className="text-lg font-bold">{importResult.existentes.length}</p>
                    <p className="text-[11px] text-muted-foreground">Já existentes</p>
                  </div>
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-rose-700">{importResult.invalidos.length}</p>
                    <p className="text-[11px] text-rose-600">Inválidos</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setImportResult(null)}>Voltar</Button>
                  <Button size="sm" disabled={importResult.novos.length === 0} onClick={confirmarImport}>
                    Confirmar {importResult.novos.length > 0 ? `${importResult.novos.length} membro(s)` : ""}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tabela de membros ────────────────────────────────────────────────────────

function MembrosTable({
  membros, tiersMembro, segmentosMembro,
  busca, onBusca, filtroTier, onFiltroTier, filtroSegmento, onFiltroSegmento, filtroStatus, onFiltroStatus,
  onEditar, onAlternarBloqueio,
}: {
  membros: Membro[];
  tiersMembro: { id: string; nome: string }[];
  segmentosMembro: { id: string; nome: string }[];
  busca: string; onBusca: (v: string) => void;
  filtroTier: string; onFiltroTier: (v: string) => void;
  filtroSegmento: string; onFiltroSegmento: (v: string) => void;
  filtroStatus: StatusMembro | "todos"; onFiltroStatus: (v: StatusMembro | "todos") => void;
  onEditar: (m: Membro) => void; onAlternarBloqueio: (id: string) => void;
}) {
  const filtrados = useMemo(() => membros.filter((m) => {
    const termo = busca.toLowerCase();
    const matchBusca = !busca || m.nome.toLowerCase().includes(termo) || m.email.toLowerCase().includes(termo);
    const matchTier = filtroTier === "todos" || m.tier === filtroTier;
    const matchSegmento = filtroSegmento === "todos" || m.segmento === filtroSegmento;
    const matchStatus = filtroStatus === "todos" || m.status === filtroStatus;
    return matchBusca && matchTier && matchSegmento && matchStatus;
  }), [membros, busca, filtroTier, filtroSegmento, filtroStatus]);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border space-y-2.5">
        <SearchInput value={busca} onChange={onBusca} placeholder="Nome ou e-mail…" />
        <Select value={filtroTier} onValueChange={onFiltroTier}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tiers</SelectItem>
            {tiersMembro.map((t) => <SelectItem key={t.id} value={t.nome}>{t.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        {segmentosMembro.length > 0 && (
          <Select value={filtroSegmento} onValueChange={onFiltroSegmento}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os segmentos</SelectItem>
              {segmentosMembro.map((s) => <SelectItem key={s.id} value={s.nome}>{s.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Select value={filtroStatus} onValueChange={(v) => onFiltroStatus(v as StatusMembro | "todos")}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="bloqueado">Bloqueado</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-right text-xs text-muted-foreground">{filtrados.length} membro(s)</p>
      </div>

      {filtrados.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">Nenhum membro corresponde aos filtros.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/20 border-b border-border">
              <tr className="text-left text-muted-foreground">
                {["Nome", "E-mail", "Tier", "Segmento", "Papel", "Canal", "Desde", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-2.5 font-medium text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtrados.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 shrink-0"><AvatarFallback className="text-[10px] bg-primary/10 text-primary">{m.initials}</AvatarFallback></Avatar>
                      <span className="text-sm font-medium">{m.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-muted-foreground whitespace-nowrap">{m.email}</td>
                  <td className="px-4 py-2.5 text-sm whitespace-nowrap">{m.tier}</td>
                  <td className="px-4 py-2.5 text-sm text-muted-foreground whitespace-nowrap">{m.segmento || "—"}</td>
                  <td className="px-4 py-2.5 text-sm text-muted-foreground whitespace-nowrap">{m.papel || "—"}</td>
                  <td className="px-4 py-2.5 text-sm text-muted-foreground whitespace-nowrap">{m.canal}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{m.desde}</td>
                  <td className="px-4 py-2.5">
                    <Pill color={m.status === "ativo" ? "success" : "destructive"} variant="soft" size="sm">
                      {m.status === "ativo" ? "Ativo" : "Bloqueado"}
                    </Pill>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => onEditar(m)} title="Editar"
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => onAlternarBloqueio(m.id)}
                        title={m.status === "ativo" ? "Bloquear" : "Desbloquear"}
                        className={`p-1.5 rounded hover:bg-muted transition-colors ${m.status === "ativo" ? "text-muted-foreground hover:text-amber-600" : "text-muted-foreground hover:text-emerald-600"}`}>
                        {m.status === "ativo" ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Modal: adicionar/editar membro ────────────────────────────────────────────

function MembroFormModal({ initial, tiersMembro, segmentosMembro, papeisMembro, membros, tierPadrao, onClose, onSave }: {
  initial?: Membro;
  tiersMembro: { id: string; nome: string }[];
  segmentosMembro: { id: string; nome: string }[];
  papeisMembro: { id: string; nome: string }[];
  membros: Membro[];
  tierPadrao: string;
  onClose: () => void;
  onSave: (d: MembroDraft, indicadoPor?: string) => void;
}) {
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [tier, setTier] = useState(initial?.tier ?? tierPadrao);
  const [segmento, setSegmento] = useState(initial?.segmento ?? "");
  const [papel, setPapel] = useState(initial?.papel ?? "");
  const [indicadoPor, setIndicadoPor] = useState("");

  function salvar() {
    if (!nome || !email) return;
    onSave({ nome, email, tier, segmento, papel: papel || undefined }, initial ? undefined : (indicadoPor || undefined));
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{initial ? "Editar membro" : "Adicionar membro"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Ana Silva" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">E-mail</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ana@email.com" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tier</Label>
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{tiersMembro.map((t) => <SelectItem key={t.id} value={t.nome}>{t.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {segmentosMembro.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs">Segmento</Label>
              <Select value={segmento || "nenhum"} onValueChange={(v) => setSegmento(v === "nenhum" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Sem segmento" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Sem segmento</SelectItem>
                  {segmentosMembro.map((s) => <SelectItem key={s.id} value={s.nome}>{s.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {papeisMembro.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs">Papel (opcional)</Label>
            <Select value={papel || "nenhum"} onValueChange={(v) => setPapel(v === "nenhum" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Sem papel" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhum">Sem papel</SelectItem>
                {papeisMembro.map((p) => <SelectItem key={p.id} value={p.nome}>{p.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {!initial && membros.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs">Indicado por (opcional)</Label>
            <Select value={indicadoPor || "nenhum"} onValueChange={(v) => setIndicadoPor(v === "nenhum" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Ninguém indicou" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhum">Ninguém indicou</SelectItem>
                {membros.map((m) => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Habilita regras de Indicação/Comissão pra quem indicou.</p>
          </div>
        )}

        <Button className="w-full" disabled={!nome || !email} onClick={salvar}>
          {initial ? "Salvar alterações" : "Adicionar membro"}
        </Button>
      </div>
    </div>
  );
}

// ── Seção: Produtos ──────────────────────────────────────────────────────────

type ProdutoDraft = {
  sku: string; nome: string; categoria: string; preco: number;
  tierProdutoId?: string; modeloVenda?: ModeloVenda; estoque: number; seller?: string;
};

export function SecaoProdutos({ sempreVazio }: { sempreVazio?: boolean }) {
  const [produtos, setProdutos] = useState<Produto[]>(() => getProdutos());
  const tiersProduto = getTiersProduto();
  const [importResult, setImportResult] = useState<{
    novos: { sku: string; nome: string; categoria: string; preco: number; estoque: number; seller: string }[];
    existentes: string[]; invalidos: string[];
  } | null>(null);

  // Filtros da tabela de catálogo
  const [buscaTabela, setBuscaTabela] = useState("");
  const [filtroOrigem, setFiltroOrigem] = useState<ModeloVenda | "todas">("todas");
  const [filtroCategoriaTabela, setFiltroCategoriaTabela] = useState("todas");
  const [filtroStatusTabela, setFiltroStatusTabela] = useState<ProdutoStatus | "todos">("todos");

  const [adicionando, setAdicionando] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [importAberto, setImportAberto] = useState(false);

  function persist(next: Produto[]) {
    setProdutos(next);
    saveProdutos(next);
  }

  function salvarNovo(d: ProdutoDraft) {
    persist([
      {
        id: `SKU-${String(produtos.length + 1).padStart(3, "0")}`,
        ...d, origemCadastro: "manual",
        status: "ativo", campanhasVinculadas: [], criadoEm: new Date().toLocaleDateString("pt-BR"),
        campanhas: [], pedidos: [], historico: [{ data: new Date().toLocaleDateString("pt-BR"), evento: "Produto cadastrado", detalhe: "Adicionado ao catálogo", tipo: "criado" }],
      },
      ...produtos,
    ]);
    toast.success(`${d.nome} adicionado ao catálogo`);
    setAdicionando(false);
  }

  function salvarEdicao(d: ProdutoDraft) {
    if (!editando) return;
    persist(produtos.map((x) => (x.id === editando.id ? { ...x, ...d } : x)));
    toast.success(`${d.nome} atualizado`);
    setEditando(null);
  }

  function aprovar(id: string) {
    persist(produtos.map((x) => (x.id === id ? { ...x, status: "ativo" } : x)));
    toast.success("Produto aprovado e habilitado no catálogo");
  }

  function arquivar(id: string) {
    const p = produtos.find((x) => x.id === id);
    const novoStatus: ProdutoStatus = p?.status === "ativo" ? "arquivado" : "ativo";
    persist(produtos.map((x) => (x.id === id ? { ...x, status: novoStatus } : x)));
    toast.success(`Produto ${novoStatus === "arquivado" ? "arquivado" : "reativado"}`);
  }

  function processarCSV(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const linhas = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const skusExistentes = new Set(produtos.map((p) => p.sku.toUpperCase()));
      const novos: { sku: string; nome: string; categoria: string; preco: number; estoque: number; seller: string }[] = [];
      const existentes: string[] = []; const invalidos: string[] = [];
      for (const linha of linhas) {
        const cols = linha.split(/[;,]/).map((c) => c.trim().replace(/^["']|["']$/g, ""));
        if (cols[0]?.toLowerCase() === "sku") continue;
        const [s, n, cat, precoRaw, estoqueRaw, sellerRaw] = cols;
        if (!s || !n) { invalidos.push(linha); continue; }
        if (skusExistentes.has(s.toUpperCase())) { existentes.push(s); continue; }
        const catValida = CATEGORIAS.find((c) => c.toLowerCase() === cat?.toLowerCase());
        novos.push({
          sku: s, nome: n, categoria: catValida ?? CATEGORIAS[0], preco: Number((precoRaw ?? "0").replace(",", ".")) || 0,
          estoque: Number(estoqueRaw ?? "0") || 0, seller: sellerRaw ?? "",
        });
      }
      setImportResult({ novos, existentes, invalidos });
    };
    reader.readAsText(file);
  }

  function confirmarImport() {
    if (!importResult || importResult.novos.length === 0) return;
    const novosProdutos: Produto[] = importResult.novos.map((n, i) => ({
      id: `SKU-${String(produtos.length + i + 1).padStart(3, "0")}`,
      sku: n.sku, nome: n.nome, categoria: n.categoria, preco: n.preco,
      tierProdutoId: tierProdutoPorPreco(tiersProduto, n.preco)?.id,
      estoque: n.estoque, seller: n.seller || undefined, origemCadastro: "planilha",
      status: "processando", campanhasVinculadas: [], criadoEm: new Date().toLocaleDateString("pt-BR"),
      campanhas: [], pedidos: [], historico: [{ data: new Date().toLocaleDateString("pt-BR"), evento: "Produto cadastrado", detalhe: "Importado em lote — processando", tipo: "criado" }],
    }));
    persist([...novosProdutos, ...produtos]);
    toast.success(`${novosProdutos.length} produto(s) importado(s)`);
    setImportResult(null);
    setImportAberto(false);
  }

  function fecharImport() {
    setImportAberto(false);
    setImportResult(null);
  }

  const proprios = produtos.filter((p) => p.modeloVenda === "1P").length;
  const terceirosAtivos = produtos.filter((p) => p.modeloVenda === "3P" && p.status === "ativo").length;
  // Produto "incentivado" = está dentro de alguma campanha ativa agora — calculado
  // ao vivo (Gatilho + Elegibilidade da campanha), mesma fonte usada em Produtos incentivados.
  const campanhasPorProduto = useMemo(() => camposCampanhasAtivasPorProduto(), [produtos]);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border flex-wrap">
        <div className="flex items-center gap-2.5">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold">Produtos</p>
            <p className="text-xs text-muted-foreground">
              {sempreVazio ? "0 cadastrado(s) hoje." : `${proprios} próprio(s) · ${terceirosAtivos} de terceiros ativos`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={() => setImportAberto(true)}>
            <Upload className="mr-1.5 h-3.5 w-3.5" />Importar em lote
          </Button>
          <Button size="sm" onClick={() => setAdicionando(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />Adicionar produto
          </Button>
        </div>
      </div>

      <div className="p-5">
        {sempreVazio || produtos.length === 0 ? (
          <EmptyState icon={Package} title="Nenhum produto cadastrado ainda"
            description='Clique em "Adicionar produto" ou "Importar em lote" acima.' />
        ) : (
          <CatalogoTable produtos={produtos} tiersProduto={tiersProduto} campanhasPorProduto={campanhasPorProduto}
            busca={buscaTabela} onBusca={setBuscaTabela}
            filtroOrigem={filtroOrigem} onFiltroOrigem={setFiltroOrigem}
            filtroCategoria={filtroCategoriaTabela} onFiltroCategoria={setFiltroCategoriaTabela}
            filtroStatus={filtroStatusTabela} onFiltroStatus={setFiltroStatusTabela}
            onEditar={setEditando} onAprovar={aprovar} onArquivar={arquivar} />
        )}
      </div>

      {adicionando && (
        <ProdutoFormModal tiersProduto={tiersProduto} onClose={() => setAdicionando(false)} onSave={salvarNovo} />
      )}
      {editando && (
        <ProdutoFormModal initial={editando} tiersProduto={tiersProduto}
          onClose={() => setEditando(null)} onSave={salvarEdicao} />
      )}

      {importAberto && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={fecharImport}>
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">Importar produtos em lote</h2>
              <button onClick={fecharImport} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
            </div>
            {!importResult ? (
              <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <p className="text-xs text-muted-foreground text-center">Arraste um CSV aqui ou clique para selecionar<br />Colunas: SKU;Nome;Categoria;Preço;Estoque;Seller (Estoque/Seller opcionais)</p>
                <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processarCSV(f); }} />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-emerald-700">{importResult.novos.length}</p>
                    <p className="text-[11px] text-emerald-600">Novos</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-center">
                    <p className="text-lg font-bold">{importResult.existentes.length}</p>
                    <p className="text-[11px] text-muted-foreground">Já existentes</p>
                  </div>
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-rose-700">{importResult.invalidos.length}</p>
                    <p className="text-[11px] text-rose-600">Inválidos</p>
                  </div>
                </div>
                {importResult.novos.length > 0 && (
                  <div className="rounded-lg border border-border divide-y divide-border max-h-48 overflow-y-auto">
                    {importResult.novos.map((n) => {
                      const tier = tierProdutoPorPreco(tiersProduto, n.preco);
                      return (
                        <div key={n.sku} className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                          <div className="min-w-0">
                            <p className="font-medium truncate">{n.nome}</p>
                            <p className="text-muted-foreground">{n.categoria} · R$ {n.preco.toLocaleString("pt-BR")}</p>
                          </div>
                          {tiersProduto.length > 0 && (
                            tier ? (
                              <span className="flex items-center gap-1.5 shrink-0 font-medium">
                                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: tier.cor }} />
                                {tier.nome}
                              </span>
                            ) : (
                              <span className="text-amber-600 shrink-0">fora de faixa</span>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setImportResult(null)}>Voltar</Button>
                  <Button size="sm" disabled={importResult.novos.length === 0} onClick={confirmarImport}>
                    Confirmar {importResult.novos.length > 0 ? `${importResult.novos.length} produto(s)` : ""}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tabela de catálogo (Origem/Categoria/Tier/Seller/Estoque/Entrada/Status) ─

function CatalogoTable({
  produtos, tiersProduto, campanhasPorProduto, busca, onBusca, filtroOrigem, onFiltroOrigem, filtroCategoria, onFiltroCategoria, filtroStatus, onFiltroStatus,
  onEditar, onAprovar, onArquivar,
}: {
  produtos: Produto[];
  tiersProduto: { id: string; nome: string; cor: string }[];
  campanhasPorProduto: Map<string, Campanha[]>;
  busca: string; onBusca: (v: string) => void;
  filtroOrigem: ModeloVenda | "todas"; onFiltroOrigem: (v: ModeloVenda | "todas") => void;
  filtroCategoria: string; onFiltroCategoria: (v: string) => void;
  filtroStatus: ProdutoStatus | "todos"; onFiltroStatus: (v: ProdutoStatus | "todos") => void;
  onEditar: (p: Produto) => void; onAprovar: (id: string) => void; onArquivar: (id: string) => void;
}) {
  const filtrados = useMemo(() => produtos.filter((p) => {
    const termo = busca.toLowerCase();
    const matchBusca = !busca || p.nome.toLowerCase().includes(termo) || p.sku.toLowerCase().includes(termo) || (p.seller ?? "").toLowerCase().includes(termo);
    const matchOrigem = filtroOrigem === "todas" || p.modeloVenda === filtroOrigem;
    const matchCategoria = filtroCategoria === "todas" || p.categoria === filtroCategoria;
    const matchStatus = filtroStatus === "todos" || p.status === filtroStatus;
    return matchBusca && matchOrigem && matchCategoria && matchStatus;
  }), [produtos, busca, filtroOrigem, filtroCategoria, filtroStatus]);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border space-y-2.5">
        <SearchInput value={busca} onChange={onBusca} placeholder="Nome, SKU ou seller…" />
        <Select value={filtroOrigem} onValueChange={(v) => onFiltroOrigem(v as ModeloVenda | "todas")}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas origens</SelectItem>
            <SelectItem value="1P">1P</SelectItem>
            <SelectItem value="3P">3P</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroCategoria} onValueChange={onFiltroCategoria}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas categorias</SelectItem>
            {CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroStatus} onValueChange={(v) => onFiltroStatus(v as ProdutoStatus | "todos")}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="processando">Processando</SelectItem>
            <SelectItem value="arquivado">Arquivado</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-right text-xs text-muted-foreground">{filtrados.length} produto(s)</p>
      </div>

      {filtrados.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">Nenhum produto corresponde aos filtros.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/20 border-b border-border">
              <tr className="text-left text-muted-foreground">
                {["Origem", "SKU", "Nome", "Categoria", "Tier", "Seller/Plataforma", "Estoque", "Entrada", "Status", "Campanhas ativas", ""].map((h) => (
                  <th key={h} className="px-4 py-2.5 font-medium text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtrados.map((p) => {
                const tier = tiersProduto.find((t) => t.id === p.tierProdutoId);
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-2.5">
                      {p.modeloVenda ? (
                        <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold">{p.modeloVenda}</span>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground whitespace-nowrap">{p.sku}</td>
                    <td className="px-4 py-2.5 text-sm font-medium whitespace-nowrap">{p.nome}</td>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground whitespace-nowrap">{p.categoria}</td>
                    <td className="px-4 py-2.5 text-sm whitespace-nowrap">
                      {tier ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: tier.cor }} />
                          {tier.nome}
                        </span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground whitespace-nowrap">{p.seller || "—"}</td>
                    <td className="px-4 py-2.5 text-sm tabular-nums whitespace-nowrap">{p.estoque ?? "—"}</td>
                    <td className="px-4 py-2.5">
                      {p.origemCadastro ? (
                        <span className="inline-flex rounded-full bg-sky-50 text-sky-700 px-2 py-0.5 text-[10px] font-medium">{ORIGEM_CADASTRO_LABEL[p.origemCadastro]}</span>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <Pill color={PRODUTO_STATUS_PILL[p.status]} variant="soft" size="sm">{PRODUTO_STATUS_LABEL[p.status]}</Pill>
                    </td>
                    <td className="px-4 py-2.5">
                      {(() => {
                        const ativas = campanhasPorProduto.get(p.id) ?? [];
                        return ativas.length === 0 ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {ativas.map((c) => (
                              <span key={c.id} className="inline-flex rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-medium">{c.nome}</span>
                            ))}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => onEditar(p)} title="Editar"
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {(p.status === "pendente" || p.status === "processando") ? (
                          <button onClick={() => onAprovar(p.id)} title="Aprovar"
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-emerald-600 transition-colors">
                            <CheckCircle className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <button onClick={() => onArquivar(p.id)}
                            title={p.status === "ativo" ? "Arquivar" : "Reativar"}
                            className={`p-1.5 rounded hover:bg-muted transition-colors ${p.status === "ativo" ? "text-muted-foreground hover:text-amber-600" : "text-muted-foreground hover:text-emerald-600"}`}>
                            {p.status === "ativo" ? <Archive className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Modal: editar produto ─────────────────────────────────────────────────────

export function FormSectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{children}</p>;
}

function ProdutoFormModal({ initial, tiersProduto, onClose, onSave }: {
  initial?: Produto;
  tiersProduto: TierProduto[];
  onClose: () => void;
  onSave: (d: ProdutoDraft) => void;
}) {
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [categoria, setCategoria] = useState(initial?.categoria ?? CATEGORIAS[0]);
  const [preco, setPreco] = useState(initial?.preco ? String(initial.preco) : "");
  const [modeloVenda, setModeloVenda] = useState<ModeloVenda | "">(initial?.modeloVenda ?? "");
  const [estoque, setEstoque] = useState<number | null>(initial?.estoque ?? null);
  const [seller, setSeller] = useState(initial?.seller ?? "");

  const precoNumerico = Number(preco.replace(",", ".")) || 0;
  const tierCalculado = tierProdutoPorPreco(tiersProduto, precoNumerico);

  function salvar() {
    if (!sku || !nome) return;
    onSave({
      sku, nome, categoria, preco: precoNumerico,
      tierProdutoId: tierCalculado?.id,
      modeloVenda: modeloVenda || undefined,
      estoque: estoque ?? 0,
      seller: modeloVenda === "3P" ? seller || undefined : undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6 space-y-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{initial ? "Editar produto" : "Adicionar produto"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
        </div>

        {/* ── Informações do produto ── */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <FormSectionLabel>Informações do produto</FormSectionLabel>
            <span className="text-[10px] font-medium text-muted-foreground rounded-full bg-muted px-2 py-0.5">
              Origem: {ORIGEM_CADASTRO_LABEL[initial?.origemCadastro ?? "manual"]}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">SKU</Label>
              <Input value={sku} onChange={(e) => setSku(e.target.value)} className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nome</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Preço (R$)</Label>
              <Input value={preco} onChange={(e) => setPreco(e.target.value.replace(/[^0-9.,]/g, ""))} inputMode="decimal" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Estoque</Label>
              <NumberInput value={estoque} onChange={setEstoque} min={0} />
            </div>
          </div>
        </div>

        {/* ── Categoria ── */}
        <div className="space-y-2.5 border-t border-border pt-4">
          <FormSectionLabel>Categoria</FormSectionLabel>
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        {/* ── Tier do produto — calculado, não escolhido ── */}
        <div className="space-y-2 border-t border-border pt-4">
          <FormSectionLabel>Tier do produto</FormSectionLabel>
          {tiersProduto.length === 0 ? (
            <p className="text-xs text-muted-foreground rounded-lg border border-dashed border-border px-3 py-2.5">
              Nenhum tier de produto cadastrado ainda — crie faixas de preço na Biblioteca pra classificar automaticamente.
            </p>
          ) : tierCalculado ? (
            <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: tierCalculado.cor }} />
              <span className="text-sm font-semibold">{tierCalculado.nome}</span>
              <span className="text-xs text-muted-foreground ml-auto">calculado pelo preço</span>
            </div>
          ) : (
            <p className="text-xs text-amber-600 rounded-lg border border-dashed border-amber-300 px-3 py-2.5">
              Preço fora de qualquer faixa cadastrada — ajuste os tiers de produto na Biblioteca.
            </p>
          )}
        </div>

        <div className="space-y-1.5 border-t border-border pt-4">
          <Label className="text-xs">Modelo de venda</Label>
          <div className="grid grid-cols-3 gap-2">
            {([["", "Não informado"], ["1P", "1P"], ["3P", "3P"]] as const).map(([v, label]) => (
              <label key={v} className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                modeloVenda === v ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
              }`}>
                <input type="radio" name="modeloVendaEdit" checked={modeloVenda === v} onChange={() => setModeloVenda(v as ModeloVenda | "")} className="sr-only" />
                <span className="text-xs font-semibold">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {modeloVenda === "3P" && (
          <div className="space-y-1.5">
            <Label className="text-xs">Seller / Plataforma</Label>
            <Input value={seller} onChange={(e) => setSeller(e.target.value)} placeholder="Ex: TechStore BR" />
          </div>
        )}

        <Button className="w-full" disabled={!sku || !nome} onClick={salvar}>
          {initial ? "Salvar alterações" : "Adicionar produto"}
        </Button>
      </div>
    </div>
  );
}
