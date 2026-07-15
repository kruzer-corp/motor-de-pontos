import { useState } from "react";
import {
  Button, FormDrawer, Input, Label, PageHeader, Pill,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  toast,
} from "@kruzer/ds";
import { CalendarClock, Pencil, Plus, ShoppingCart, Target, Users, Zap, Star, ArchiveX } from "lucide-react";
import { renderCrumbLink } from "../lib/crumbLink";
import { MOEDA } from "../config/programa";

type MissaoStatus = "ativa" | "rascunho" | "encerrada";
type MissaoTipo   = "frequencia" | "volume" | "indicacao" | "engajamento";

type Missao = {
  id: string;
  nome: string;
  descricao: string;
  tipo: MissaoTipo;
  metaLabel: string;
  prazo: string;
  recompensa: number;
  status: MissaoStatus;
  elegiveis: number;
  participando: number;
  concluidos: number;
};

const TIPO_META: Record<MissaoTipo, { label: string; placeholder: string; suffix: string }> = {
  frequencia:  { label: "Nº de compras",          placeholder: "Ex: 3",    suffix: "compras"    },
  volume:      { label: "Volume mínimo (R$)",      placeholder: "Ex: 500",  suffix: "R$"         },
  indicacao:   { label: "Nº de indicações",        placeholder: "Ex: 2",    suffix: "indicações" },
  engajamento: { label: "Nº de acessos ao portal", placeholder: "Ex: 4",    suffix: "acessos"    },
};

const TIPO_ICON: Record<MissaoTipo, React.ElementType> = {
  frequencia:  ShoppingCart,
  volume:      Star,
  indicacao:   Users,
  engajamento: Zap,
};

const TIPO_LABEL: Record<MissaoTipo, string> = {
  frequencia:  "Frequência",
  volume:      "Volume",
  indicacao:   "Indicações",
  engajamento: "Engajamento",
};

const STATUS_PILL: Record<MissaoStatus, { color: "success" | "muted" | "warning"; label: string }> = {
  ativa:     { color: "success", label: "Ativa"     },
  rascunho:  { color: "warning", label: "Rascunho"  },
  encerrada: { color: "muted",   label: "Encerrada" },
};

const INITIAL: Missao[] = [
  {
    id: "M-001",
    nome: "Três em Julho",
    descricao: "Faça 3 compras durante o mês de julho e ganhe bônus exclusivos.",
    tipo: "frequencia",
    metaLabel: "3 compras",
    prazo: "31/07/2026",
    recompensa: 500,
    status: "ativa",
    elegiveis: 2483,
    participando: 872,
    concluidos: 341,
  },
  {
    id: "M-002",
    nome: "Mega Comprador",
    descricao: "Acumule R$ 1.000 em pedidos em um único mês e desbloqueie o bônus Mega.",
    tipo: "volume",
    metaLabel: "R$ 1.000",
    prazo: "31/07/2026",
    recompensa: 1200,
    status: "ativa",
    elegiveis: 1240,
    participando: 388,
    concluidos: 112,
  },
  {
    id: "M-003",
    nome: "Indica & Ganha",
    descricao: "Indique 2 amigos que se cadastrem e façam sua primeira compra.",
    tipo: "indicacao",
    metaLabel: "2 indicações",
    prazo: "15/08/2026",
    recompensa: 800,
    status: "ativa",
    elegiveis: 2483,
    participando: 214,
    concluidos: 58,
  },
  {
    id: "M-004",
    nome: "Check-in Semanal",
    descricao: "Acesse o portal do programa por 4 semanas consecutivas.",
    tipo: "engajamento",
    metaLabel: "4 acessos semanais",
    prazo: "31/08/2026",
    recompensa: 300,
    status: "rascunho",
    elegiveis: 0,
    participando: 0,
    concluidos: 0,
  },
  {
    id: "M-005",
    nome: "Volume Pro Q3",
    descricao: "Acumule R$ 5.000 em pedidos entre julho e setembro.",
    tipo: "volume",
    metaLabel: "R$ 5.000",
    prazo: "30/09/2026",
    recompensa: 2500,
    status: "rascunho",
    elegiveis: 0,
    participando: 0,
    concluidos: 0,
  },
  {
    id: "M-006",
    nome: "Missão Verão",
    descricao: "Complete 5 compras durante o verão.",
    tipo: "frequencia",
    metaLabel: "5 compras",
    prazo: "28/02/2026",
    recompensa: 600,
    status: "encerrada",
    elegiveis: 2180,
    participando: 1040,
    concluidos: 782,
  },
];

function progressPct(m: Missao) {
  if (m.elegiveis === 0) return 0;
  return Math.round((m.concluidos / m.elegiveis) * 100);
}

function diasRestantes(prazo: string): number | null {
  const [d, mo, y] = prazo.split("/").map(Number);
  const target = new Date(y, mo - 1, d).getTime();
  const diff = Math.ceil((target - Date.now()) / 86400000);
  return diff > 0 ? diff : null;
}

// ── Card de missão ─────────────────────────────────────────────────────────────

function MissaoCard({ m, onEdit, onToggleStatus }: {
  m: Missao;
  onEdit: (m: Missao) => void;
  onToggleStatus: (id: string) => void;
}) {
  const Icon = TIPO_ICON[m.tipo];
  const sp   = STATUS_PILL[m.status];
  const pct  = progressPct(m);
  const dias = diasRestantes(m.prazo);

  return (
    <div className="rounded-xl border border-border bg-card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 space-y-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="size-4 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{TIPO_LABEL[m.tipo]}</span>
          </div>
          <Pill color={sp.color} variant="soft" size="sm" dot={m.status === "ativa"}>{sp.label}</Pill>
        </div>

        <div>
          <p className="font-semibold text-sm">{m.nome}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{m.descricao}</p>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1"><Target className="size-3" />{m.metaLabel}</span>
          <span className="flex items-center gap-1"><Star className="size-3 text-amber-500" />{m.recompensa.toLocaleString("pt-BR")} {MOEDA.abrev}</span>
          {dias !== null
            ? <span className="flex items-center gap-1"><CalendarClock className="size-3" />{dias}d restantes</span>
            : <span className="flex items-center gap-1 text-muted-foreground/50"><CalendarClock className="size-3" />{m.prazo}</span>
          }
        </div>
      </div>

      {/* Progress */}
      {m.status !== "rascunho" && (
        <div className="px-5 py-3 border-t border-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{m.concluidos.toLocaleString("pt-BR")} concluíram</span>
            <span className="font-semibold tabular-nums">{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${m.status === "encerrada" ? "bg-muted-foreground/40" : "bg-emerald-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{m.participando.toLocaleString("pt-BR")} participando</span>
            <span>{m.elegiveis.toLocaleString("pt-BR")} elegíveis</span>
          </div>
        </div>
      )}

      {/* Actions */}
      {m.status !== "encerrada" && (
        <div className="px-5 py-3 border-t border-border flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(m)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Editar
          </Button>
          {m.status === "ativa" && (
            <Button variant="ghost" size="sm" onClick={() => onToggleStatus(m.id)}
              className="text-muted-foreground hover:text-destructive">
              <ArchiveX className="h-4 w-4" />
            </Button>
          )}
          {m.status === "rascunho" && (
            <Button size="sm" className="flex-1" onClick={() => onToggleStatus(m.id)}>
              Publicar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Form state ─────────────────────────────────────────────────────────────────

type FormState = {
  nome: string; descricao: string; tipo: MissaoTipo;
  meta: string; prazo: string; recompensa: string; segmento: string;
};

const FORM_DEFAULTS: FormState = {
  nome: "", descricao: "", tipo: "frequencia",
  meta: "", prazo: "", recompensa: "", segmento: "todos",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Missoes() {
  const [missoes,  setMissoes]  = useState<Missao[]>(INITIAL);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [editId,     setEditId]     = useState<string | null>(null);
  const [form,       setForm]       = useState<FormState>(FORM_DEFAULTS);

  const ativas    = missoes.filter(m => m.status === "ativa");
  const rascunhos = missoes.filter(m => m.status === "rascunho");
  const encerradas = missoes.filter(m => m.status === "encerrada");

  function setF<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(p => ({ ...p, [k]: v }));
  }

  function openNew() {
    setEditId(null); setForm(FORM_DEFAULTS); setDrawerOpen(true);
  }

  function openEdit(m: Missao) {
    setEditId(m.id);
    setForm({ nome: m.nome, descricao: m.descricao, tipo: m.tipo, meta: m.metaLabel, prazo: "", recompensa: String(m.recompensa), segmento: "todos" });
    setDrawerOpen(true);
  }

  async function handleSave() {
    if (!form.nome || !form.meta || !form.prazo || !form.recompensa) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));

    if (editId) {
      setMissoes(prev => prev.map(m => m.id === editId
        ? { ...m, nome: form.nome, descricao: form.descricao, tipo: form.tipo, metaLabel: `${form.meta} ${TIPO_META[form.tipo].suffix}`, recompensa: Number(form.recompensa) }
        : m
      ));
      toast.success("Missão atualizada");
    } else {
      const id = `M-${String(missoes.length + 1).padStart(3, "0")}`;
      setMissoes(prev => [...prev, {
        id, nome: form.nome, descricao: form.descricao, tipo: form.tipo,
        metaLabel: `${form.meta} ${TIPO_META[form.tipo].suffix}`,
        prazo: form.prazo, recompensa: Number(form.recompensa),
        status: "rascunho", elegiveis: 0, participando: 0, concluidos: 0,
      }]);
      toast.success("Missão criada como rascunho");
    }
    setSaving(false); setDrawerOpen(false);
  }

  function toggleStatus(id: string) {
    setMissoes(prev => prev.map(m => {
      if (m.id !== id) return m;
      if (m.status === "ativa")    { toast.success("Missão encerrada"); return { ...m, status: "encerrada" }; }
      if (m.status === "rascunho") { toast.success("Missão publicada");  return { ...m, status: "ativa", elegiveis: 2483 }; }
      return m;
    }));
  }

  const metaCfg = TIPO_META[form.tipo];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Missões e desafios"
        path={[{ label: "Campanhas" }]}
        renderCrumbLink={renderCrumbLink}
        description="Crie desafios com objetivos mensuráveis e recompense membros que os concluem."
        actions={
          <Button size="sm" onClick={openNew}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nova missão
          </Button>
        }
      />

      {/* Ativas */}
      {ativas.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ativas</p>
            <span className="text-xs bg-primary/10 text-primary font-semibold px-1.5 py-0.5 rounded-full">{ativas.length}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ativas.map(m => <MissaoCard key={m.id} m={m} onEdit={openEdit} onToggleStatus={toggleStatus} />)}
          </div>
        </section>
      )}

      {/* Rascunhos */}
      {rascunhos.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rascunhos</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rascunhos.map(m => <MissaoCard key={m.id} m={m} onEdit={openEdit} onToggleStatus={toggleStatus} />)}
          </div>
        </section>
      )}

      {/* Encerradas */}
      {encerradas.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Encerradas</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 opacity-70">
            {encerradas.map(m => <MissaoCard key={m.id} m={m} onEdit={openEdit} onToggleStatus={toggleStatus} />)}
          </div>
        </section>
      )}

      {/* FormDrawer */}
      <FormDrawer
        open={drawerOpen}
        onOpenChange={v => { if (!v) setDrawerOpen(false); }}
        title={editId ? "Editar missão" : "Nova missão"}
        description={editId ? "Ajuste os parâmetros da missão. Membros já participando continuam no progresso atual." : "Crie um desafio com objetivo claro e recompensa. A missão começa como rascunho — publique quando estiver pronta."}
        onSave={handleSave}
        saving={saving}
        saveLabel={editId ? "Salvar alterações" : "Criar missão"}
        saveDisabled={!form.nome || !form.meta || !form.prazo || !form.recompensa}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome <span className="text-destructive">*</span></Label>
            <Input value={form.nome} onChange={e => setF("nome", e.target.value)} placeholder="Ex: Três em Julho" />
          </div>

          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Input value={form.descricao} onChange={e => setF("descricao", e.target.value)} placeholder="Explique o desafio ao membro" />
          </div>

          <div className="space-y-1.5">
            <Label>Tipo de desafio</Label>
            <Select value={form.tipo} onValueChange={v => setF("tipo", v as MissaoTipo)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="frequencia">Frequência de compras</SelectItem>
                <SelectItem value="volume">Volume de pedidos (R$)</SelectItem>
                <SelectItem value="indicacao">Indicações confirmadas</SelectItem>
                <SelectItem value="engajamento">Engajamento no portal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>{metaCfg.label} <span className="text-destructive">*</span></Label>
            <div className="flex items-center gap-2">
              <Input type="number" value={form.meta} onChange={e => setF("meta", e.target.value)} placeholder={metaCfg.placeholder} className="flex-1" />
              <span className="text-sm text-muted-foreground shrink-0">{metaCfg.suffix}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Prazo <span className="text-destructive">*</span></Label>
            <Input type="date" value={form.prazo} onChange={e => setF("prazo", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Recompensa em pontos <span className="text-destructive">*</span></Label>
            <div className="flex items-center gap-2">
              <Input type="number" value={form.recompensa} onChange={e => setF("recompensa", e.target.value)} placeholder="Ex: 500" className="flex-1" />
              <span className="text-sm text-muted-foreground shrink-0">pts bônus</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Segmento elegível</Label>
            <Select value={form.segmento} onValueChange={v => setF("segmento", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os membros</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="prata">Prata</SelectItem>
                <SelectItem value="ouro">Ouro</SelectItem>
                <SelectItem value="diamante">Diamante</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormDrawer>
    </div>
  );
}
