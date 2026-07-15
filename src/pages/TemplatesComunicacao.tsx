import { useRef, useState } from "react";
import {
  Button, Input, Label, PageHeader, Pill, Switch, toast,
} from "@kruzer/ds";
import { ArrowLeft, Eye, Mail, MessageSquare, Pencil, Plus, RotateCcw, Save, Smartphone } from "lucide-react";
import { renderCrumbLink } from "../lib/crumbLink";
import { MOEDA } from "../config/programa";

type Canal  = "email" | "push" | "sms";
type Evento = "boas_vindas" | "pontos_creditados" | "pontos_expirando" | "nivel_atingido" | "resgate_aprovado" | "manual";

type Template = {
  id: string;
  nome: string;
  canal: Canal;
  evento: Evento;
  assunto: string;
  corpo: string;
  ativo: boolean;
  ultimaEdicao: string;
};

// ── Metadados ─────────────────────────────────────────────────────────────────

const CANAL_META: Record<Canal, { label: string; icon: React.ElementType; pill: "primary" | "success" | "warning" }> = {
  email: { label: "E-mail",        icon: Mail,          pill: "primary"  },
  push:  { label: "Push",          icon: Smartphone,    pill: "success"  },
  sms:   { label: "SMS",           icon: MessageSquare, pill: "warning"  },
};

const EVENTO_LABEL: Record<Evento, string> = {
  boas_vindas:       "Boas-vindas ao programa",
  pontos_creditados: `${MOEDA.nome} creditados`,
  pontos_expirando:  `${MOEDA.nome} expirando em breve`,
  nivel_atingido:    "Novo nível atingido",
  resgate_aprovado:  "Resgate aprovado",
  manual:            "Comunicação manual",
};

const VARIAVEIS = [
  { tag: "{{membro_nome}}",    label: "Nome do membro"    },
  { tag: "{{pontos}}",         label: `${MOEDA.nome} do evento`  },
  { tag: "{{saldo}}",          label: "Saldo atual"       },
  { tag: "{{tier}}",           label: "Nível do membro"   },
  { tag: "{{expiracao}}",      label: "Data de expiração" },
  { tag: "{{produto}}",        label: "Produto resgatado" },
  { tag: "{{programa_nome}}", label: "Nome do programa"  },
];

const AMOSTRA: Record<string, string> = {
  "{{membro_nome}}":   "Ana Paula",
  "{{pontos}}":        "1.200",
  "{{saldo}}":         "3.840",
  "{{tier}}":          "Ouro",
  "{{expiracao}}":     "31/08/2026",
  "{{produto}}":       "Air Fryer XL",
  "{{programa_nome}}": "Programa FastPro",
};

function renderPreview(texto: string): string {
  return Object.entries(AMOSTRA).reduce(
    (t, [tag, val]) => t.replaceAll(tag, `<strong>${val}</strong>`),
    texto
  );
}

// ── Mock ──────────────────────────────────────────────────────────────────────

const INITIAL: Template[] = [
  {
    id: "T-001",
    nome: "Boas-vindas ao programa",
    canal: "email",
    evento: "boas_vindas",
    assunto: "Bem-vindo ao {{programa_nome}}, {{membro_nome}}!",
    corpo: `Olá, {{membro_nome}}!

É um prazer ter você no {{programa_nome}}. A partir de agora, cada compra vai render pontos que você pode trocar por recompensas incríveis.

Seu nível atual é {{tier}}. Continue comprando para subir de nível e desbloquear benefícios exclusivos.

Boas compras!`,
    ativo: true,
    ultimaEdicao: "01/07/2026",
  },
  {
    id: "T-002",
    nome: `${MOEDA.nome} creditados`,
    canal: "push",
    evento: "pontos_creditados",
    assunto: "",
    corpo: "Você ganhou {{pontos}} pts! Seu saldo agora é {{saldo}} pts. Acesse o catálogo e troque por recompensas.",
    ativo: true,
    ultimaEdicao: "05/07/2026",
  },
  {
    id: "T-003",
    nome: "Alerta de expiração",
    canal: "email",
    evento: "pontos_expirando",
    assunto: "Seus pontos expiram em {{expiracao}} — use antes que seja tarde!",
    corpo: `Oi, {{membro_nome}}.

Você tem {{pontos}} pontos que vão expirar em {{expiracao}}.

Não deixe eles irem embora! Acesse o catálogo de resgates agora e troque por produtos que você vai amar.

Seu saldo total é {{saldo}} pts.`,
    ativo: true,
    ultimaEdicao: "10/06/2026",
  },
  {
    id: "T-004",
    nome: "Novo nível atingido",
    canal: "email",
    evento: "nivel_atingido",
    assunto: "Parabéns, {{membro_nome}}! Você chegou ao nível {{tier}} 🏅",
    corpo: `{{membro_nome}}, você subiu de nível!

Bem-vindo ao tier {{tier}}. A partir de agora você tem acesso a multiplicadores de pontos maiores e resgates exclusivos.

Continue acumulando para chegar ainda mais longe!`,
    ativo: true,
    ultimaEdicao: "15/05/2026",
  },
  {
    id: "T-005",
    nome: "Resgate aprovado",
    canal: "push",
    evento: "resgate_aprovado",
    assunto: "",
    corpo: "Boa notícia! Seu resgate de {{produto}} foi aprovado e está a caminho.",
    ativo: true,
    ultimaEdicao: "20/06/2026",
  },
  {
    id: "T-006",
    nome: "Boletim mensal",
    canal: "email",
    evento: "manual",
    assunto: "Seu resumo do programa — {{membro_nome}}",
    corpo: `Olá, {{membro_nome}}!

Aqui está o que aconteceu com seus pontos este mês:

• Saldo atual: {{saldo}} pts
• Seu tier: {{tier}}

Não se esqueça: use seus pontos antes de {{expiracao}}.

Até o próximo resumo!`,
    ativo: false,
    ultimaEdicao: "01/06/2026",
  },
];

// ── Editor ────────────────────────────────────────────────────────────────────

function Editor({ template, onSave, onCancel }: {
  template: Template;
  onSave: (t: Template) => void;
  onCancel: () => void;
}) {
  const [t,       setT]       = useState<Template>(template);
  const [preview, setPreview] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const dirty = JSON.stringify(t) !== JSON.stringify(template);

  function insertVar(tag: string) {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const next  = t.corpo.slice(0, start) + tag + t.corpo.slice(end);
    setT(p => ({ ...p, corpo: next }));
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.nome || "Novo template"}
        path={[
          { label: "Conteúdo & Aparência" },
          { label: "Templates", to: "#" },
        ]}
        renderCrumbLink={renderCrumbLink}
        description={`${CANAL_META[t.canal].label} · ${EVENTO_LABEL[t.evento]}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Voltar
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPreview(p => !p)}>
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              {preview ? "Editar" : "Prévia"}
            </Button>
            {dirty && (
              <Button variant="ghost" size="sm" onClick={() => setT(template)}>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Descartar
              </Button>
            )}
            <Button size="sm" disabled={!dirty} onClick={() => onSave(t)}>
              <Save className="mr-1.5 h-3.5 w-3.5" />
              Salvar
            </Button>
          </div>
        }
      />

      {dirty && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 flex items-center gap-2">
          <span className="font-semibold">Alterações não salvas.</span>
          Salve para que o novo template entre em uso.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Main editor col */}
        <div className="xl:col-span-2 space-y-4">
          {/* Assunto (email only) */}
          {t.canal === "email" && (
            <div className="space-y-1.5">
              <Label>Assunto do e-mail</Label>
              {preview ? (
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm"
                  dangerouslySetInnerHTML={{ __html: renderPreview(t.assunto) }} />
              ) : (
                <Input
                  value={t.assunto}
                  onChange={e => setT(p => ({ ...p, assunto: e.target.value }))}
                  placeholder="Ex: Bem-vindo ao {{programa_nome}}, {{membro_nome}}!"
                />
              )}
            </div>
          )}

          {/* Corpo */}
          <div className="space-y-1.5">
            <Label>Corpo da mensagem</Label>
            {preview ? (
              <div
                className="rounded-lg border border-border bg-card px-5 py-5 text-sm leading-7 whitespace-pre-line min-h-64 font-mono text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: renderPreview(t.corpo) }}
              />
            ) : (
              <textarea
                ref={bodyRef}
                value={t.corpo}
                onChange={e => setT(p => ({ ...p, corpo: e.target.value }))}
                className="w-full min-h-64 px-4 py-3 text-sm font-mono text-foreground leading-7 bg-background border border-border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Escreva a mensagem aqui. Use as variáveis ao lado para personalizar."
                spellCheck={false}
              />
            )}
          </div>

          {/* Preview note */}
          {preview && (
            <p className="text-xs text-muted-foreground">
              Prévia com dados de exemplo — <strong>{{"{{"}}membro_nome{{"}}"}}</strong> substituto por <strong>Ana Paula</strong>, etc.
            </p>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Variables */}
          {!preview && (
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Variáveis disponíveis</p>
              <p className="text-xs text-muted-foreground">Clique para inserir no cursor</p>
              <div className="flex flex-wrap gap-1.5">
                {VARIAVEIS.map(v => (
                  <button
                    key={v.tag}
                    onClick={() => insertVar(v.tag)}
                    title={v.label}
                    className="font-mono text-xs px-2 py-1 rounded border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                  >
                    {v.tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Configurações</p>
            <div className="space-y-1.5">
              <Label className="text-xs">Nome interno</Label>
              <Input value={t.nome} onChange={e => setT(p => ({ ...p, nome: e.target.value }))} placeholder="Nome para identificação interna" />
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium">Ativo</p>
                <p className="text-xs text-muted-foreground">Envia automaticamente ao disparar o evento</p>
              </div>
              <Switch size="sm" checked={t.ativo} onCheckedChange={v => setT(p => ({ ...p, ativo: v }))} />
            </div>
            <div className="pt-1 space-y-1">
              <p className="text-xs text-muted-foreground">Canal</p>
              <Pill color={CANAL_META[t.canal].pill} variant="soft" size="sm">{CANAL_META[t.canal].label}</Pill>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Evento disparador</p>
              <p className="text-xs font-medium">{EVENTO_LABEL[t.evento]}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Template card ─────────────────────────────────────────────────────────────

function TemplateCard({ t, onEdit, onToggle }: {
  t: Template;
  onEdit: (t: Template) => void;
  onToggle: (id: string) => void;
}) {
  const canal = CANAL_META[t.canal];
  const CanalIcon = canal.icon;

  return (
    <div className={`rounded-xl border bg-card flex flex-col overflow-hidden transition-opacity ${t.ativo ? "border-border" : "border-border opacity-60"}`}>
      <div className="px-5 pt-5 pb-4 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <CanalIcon className="size-3.5 text-primary" />
            </div>
            <Pill color={canal.pill} variant="soft" size="sm">{canal.label}</Pill>
          </div>
          <Switch size="sm" checked={t.ativo} onCheckedChange={() => onToggle(t.id)} />
        </div>
        <p className="font-semibold text-sm">{t.nome}</p>
        <p className="text-xs text-muted-foreground">{EVENTO_LABEL[t.evento]}</p>
        {t.assunto && (
          <p className="text-xs text-muted-foreground italic truncate">"{t.assunto}"</p>
        )}
      </div>
      <div className="px-5 py-3 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Editado {t.ultimaEdicao}</span>
        <Button variant="ghost" size="sm" onClick={() => onEdit(t)}>
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Editar
        </Button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const NEW_TEMPLATE: Template = {
  id: "", nome: "", canal: "email", evento: "manual",
  assunto: "", corpo: "", ativo: false, ultimaEdicao: "",
};

export default function TemplatesComunicacao() {
  const [templates, setTemplates] = useState<Template[]>(INITIAL);
  const [editing,   setEditing]   = useState<Template | null>(null);

  function handleSave(t: Template) {
    if (!t.id) {
      const id = `T-${String(templates.length + 1).padStart(3, "0")}`;
      const hoje = new Date().toLocaleDateString("pt-BR");
      setTemplates(prev => [...prev, { ...t, id, ultimaEdicao: hoje }]);
      toast.success("Template criado");
    } else {
      const hoje = new Date().toLocaleDateString("pt-BR");
      setTemplates(prev => prev.map(x => x.id === t.id ? { ...t, ultimaEdicao: hoje } : x));
      toast.success("Template salvo");
    }
    setEditing(null);
  }

  function handleToggle(id: string) {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ativo: !t.ativo } : t));
  }

  if (editing) {
    return <Editor template={editing} onSave={handleSave} onCancel={() => setEditing(null)} />;
  }

  const ativos    = templates.filter(t => t.ativo);
  const inativos  = templates.filter(t => !t.ativo);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Templates de comunicação"
        path={[{ label: "Conteúdo & Aparência" }]}
        renderCrumbLink={renderCrumbLink}
        description="Modelos de e-mail, push e SMS enviados automaticamente pelos eventos do programa."
        actions={
          <Button size="sm" onClick={() => setEditing(NEW_TEMPLATE)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Novo template
          </Button>
        }
      />

      {/* Ativos */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ativos</p>
          <span className="text-xs bg-primary/10 text-primary font-semibold px-1.5 py-0.5 rounded-full">{ativos.length}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ativos.map(t => (
            <TemplateCard key={t.id} t={t} onEdit={setEditing} onToggle={handleToggle} />
          ))}
        </div>
      </section>

      {/* Inativos */}
      {inativos.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Inativos</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {inativos.map(t => (
              <TemplateCard key={t.id} t={t} onEdit={setEditing} onToggle={handleToggle} />
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <div className="rounded-lg border border-border bg-card px-5 py-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Como funciona</p>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li className="flex gap-2"><span className="text-primary">→</span> Cada evento do programa (crédito de pontos, novo nível, etc.) dispara o template ativo correspondente.</li>
          <li className="flex gap-2"><span className="text-primary">→</span> Use variáveis como <code className="font-mono bg-muted px-1 rounded">{"{{membro_nome}}"}</code> para personalizar a mensagem. Elas são substituídas automaticamente no envio.</li>
          <li className="flex gap-2"><span className="text-primary">→</span> Templates inativos não são enviados — útil para pausar comunicações sem excluir o conteúdo.</li>
        </ul>
      </div>
    </div>
  );
}
