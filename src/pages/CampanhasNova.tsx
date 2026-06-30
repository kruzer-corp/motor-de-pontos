import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button, Input, Label, PageHeader, Select, SelectContent,
  SelectItem, SelectTrigger, SelectValue, Switch, toast,
} from "@kruzer/ds";
import { CheckCircle2, Plus, Pencil, Trash2 } from "lucide-react";

// ── Steps ─────────────────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: "Detalhes e vigências" },
  { num: 2, label: "Canais de venda" },
  { num: 3, label: "Elegibilidade e pontos" },
  { num: 4, label: "Multiplicadores" },
  { num: 5, label: "Revisão" },
];

// ── Form state ────────────────────────────────────────────────────────────────

// ── Classificação ────────────────────────────────────────────────────────────

type Classificacao = {
  id: string; nome: string; cor: string;
  pontosPorReal: string; temBonus: boolean; bonus: string;
};

const CLASSIF_DEFAULTS: Omit<Classificacao, "id"> = {
  nome: "", cor: "#6366f1", pontosPorReal: "", temBonus: true, bonus: "",
};

function ClassificacaoModal({
  initial, onSave, onClose,
}: {
  initial?: Classificacao;
  onSave: (c: Classificacao) => void;
  onClose: () => void;
}) {
  const [d, setD] = useState<Omit<Classificacao, "id">>(
    initial ? { nome: initial.nome, cor: initial.cor, pontosPorReal: initial.pontosPorReal, temBonus: initial.temBonus, bonus: initial.bonus }
            : { ...CLASSIF_DEFAULTS }
  );

  const upd = (k: keyof typeof d, v: string | boolean) =>
    setD((prev) => ({ ...prev, [k]: v }));

  const nomePrev  = d.nome  || "Sem nome";
  const ptosPrev  = d.pontosPorReal || "0";
  const bonusPrev = d.temBonus ? (d.bonus || "0%") : "0%";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-semibold leading-snug">Defina as características da sua classificação</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground mt-0.5 shrink-0">
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        {/* Nome */}
        <div className="space-y-1.5">
          <Label className="text-sm">Nome<span className="text-destructive">*</span></Label>
          <Input value={d.nome} onChange={(e) => upd("nome", e.target.value)} placeholder="Digite o nome para essa classificação" />
        </div>

        {/* Cor */}
        <div className="space-y-1.5">
          <Label className="text-sm">Cor<span className="text-destructive">*</span></Label>
          <div className="flex items-center gap-2 rounded-md border border-input px-3 py-2">
            <input
              type="color" value={d.cor}
              onChange={(e) => upd("cor", e.target.value)}
              className="h-6 w-6 rounded cursor-pointer border-0 bg-transparent p-0"
            />
            <span className="flex-1 text-sm text-muted-foreground">{d.cor}</span>
            <span className="text-muted-foreground text-xs">🎨</span>
          </div>
        </div>

        {/* Pontos por real */}
        <div className="space-y-1.5">
          <Label className="text-sm">Quantidade de pontos por real gasto<span className="text-destructive">*</span></Label>
          <div className="relative">
            <Input
              type="number" value={d.pontosPorReal}
              onChange={(e) => upd("pontosPorReal", e.target.value)}
              placeholder="Digite a quantidade de pontos"
              className="pr-9"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
          </div>
        </div>

        {/* Tem bônus */}
        <div className="space-y-2">
          <Label className="text-sm">Deseja que tenha bônus para essa campanha?<span className="text-muted-foreground ml-1 text-xs">**</span></Label>
          <div className="flex gap-6">
            {[true, false].map((v) => (
              <label key={String(v)} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio" name="temBonus"
                  checked={d.temBonus === v}
                  onChange={() => upd("temBonus", v)}
                  className="accent-foreground h-4 w-4"
                />
                {v ? "Sim" : "Não"}
              </label>
            ))}
          </div>
        </div>

        {/* Percentual de bônus */}
        {d.temBonus && (
          <div className="space-y-1.5">
            <Label className="text-sm">Porcentagem de bônus<span className="text-muted-foreground ml-1 text-xs">**</span></Label>
            <div className="relative">
              <Input
                type="number" value={d.bonus}
                onChange={(e) => upd("bonus", e.target.value)}
                placeholder="Digite o valor em bônus"
                className="pr-9"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          </div>
        )}

        {/* Exemplo prático */}
        <div className="rounded-lg bg-muted/40 px-4 py-3 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Exemplo prático</p>
          <p className="text-sm leading-relaxed">
            Para a classificação{" "}
            <span className="font-semibold text-primary">"{nomePrev}"</span>, serão concedidos{" "}
            <span className="font-semibold text-primary">"{ptosPrev}"</span> pontos por real gasto, com um bônus de{" "}
            <span className="font-semibold text-primary">"{d.temBonus ? bonusPrev : "0%"}"</span>{" "}
            sobre o valor de cada produto incentivado do pedido.
          </p>
        </div>

        <Button
          className="w-full"
          disabled={!d.nome || !d.pontosPorReal}
          onClick={() => onSave({ ...d, id: initial?.id ?? String(Date.now()) })}
        >
          Salvar classificação
        </Button>
      </div>
    </div>
  );
}

// ── Form state ────────────────────────────────────────────────────────────────

type Form = {
  codigo: string; nome: string; descricao: string; segmento: string;
  periodoInicio: string; periodoFim: string;
  vigenciaInicio: string; vigenciaFim: string;
  canais: Record<string, boolean>;
  statusConceder: Record<string, boolean>;
  diasCreditado: string;
  statusAnular: Record<string, boolean>;
  classificacoes: Classificacao[];
  moedas: Record<string, { ativo: boolean; valor: string }>;
  multBronze: string; multPrata: string; multOuro: string; multDiamante: string;
};

const STATUS_PEDIDO = [
  "Aprovado", "Faturado", "Em separação", "Entregue",
  "Concluído", "Cancelado", "Devolvido", "Recusado",
];

const DEFAULTS: Form = {
  codigo: "CAMP01", nome: "", descricao: "", segmento: "todos",
  periodoInicio: "", periodoFim: "",
  vigenciaInicio: "", vigenciaFim: "",
  canais: { app: true, loja: true, pdv: false, web: false },
  statusConceder: { Aprovado: false, Faturado: false, "Em separação": false, Entregue: false, Concluído: false, Cancelado: false, Devolvido: false, Recusado: false },
  diasCreditado: "",
  statusAnular:   { Aprovado: false, Faturado: false, "Em separação": false, Entregue: false, Concluído: false, Cancelado: false, Devolvido: false, Recusado: false },
  classificacoes: [],
  moedas: {
    Pontos:   { ativo: true,  valor: "" },
    Cashback: { ativo: false, valor: "" },
    Milhas:   { ativo: false, valor: "" },
    Créditos: { ativo: false, valor: "" },
  },
  multBronze: "1", multPrata: "1.25", multOuro: "1.5", multDiamante: "2",
};

// ── Stepper ───────────────────────────────────────────────────────────────────

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((s, idx) => {
        const done    = s.num < current;
        const active  = s.num === current;
        const isLast  = idx === STEPS.length - 1;
        return (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                done   ? "bg-foreground border-foreground text-background"
                : active ? "bg-foreground border-foreground text-background"
                : "bg-background border-border text-muted-foreground"
              }`}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : s.num}
              </div>
              <span className={`text-xs whitespace-nowrap text-center max-w-[100px] leading-tight ${
                active ? "font-semibold text-foreground" : "text-muted-foreground"
              }`}>
                {s.label}
              </span>
            </div>
            {!isLast && (
              <div className={`h-px w-12 mx-2 mb-5 shrink-0 ${s.num < current ? "bg-foreground" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {hint && <p className="text-xs text-muted-foreground -mt-0.5">{hint}</p>}
      {children}
    </div>
  );
}

// ── Review row ────────────────────────────────────────────────────────────────

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CampanhasNova() {
  const navigate  = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>(DEFAULTS);
  const [published, setPublished] = useState(false);
  const [classifModal, setClassifModal] = useState<Classificacao | null | "new">(null);

  const set = (key: keyof Form, value: Form[keyof Form]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canContinue = () => {
    if (step === 1) return !!form.nome;
    if (step === 3) return !!form.diasCreditado;
    return true;
  };

  function handlePublish() {
    setPublished(true);
    toast.success(`Campanha "${form.nome}" publicada com sucesso`);
  }

  if (published) {
    return (
      <div className="max-w-md mx-auto text-center pt-16 space-y-5">
        <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Campanha publicada!</h2>
          <p className="text-sm text-muted-foreground mt-1">{form.nome} está ativa agora.</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate("/campanhas")}>Ver campanhas</Button>
          <Button variant="outline" onClick={() => { setForm(DEFAULTS); setStep(1); setPublished(false); }}>
            Criar outra
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <PageHeader
        title="Nova campanha"
        path={[{ label: "Operação" }, { label: "Campanhas" }]}
      />

      <div className="max-w-2xl mx-auto pt-6">
        <Stepper current={step} />

        {/* ── Step 1: Detalhes e vigências ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold">Defina as características da sua nova campanha</h3>
            </div>

            <Field label="Código">
              <Input value={form.codigo} onChange={(e) => set("codigo", e.target.value)} />
            </Field>

            <Field label="Nome" required>
              <Input
                value={form.nome}
                onChange={(e) => set("nome", e.target.value)}
                placeholder="Digite o nome para essa campanha"
              />
            </Field>

            <Field label="Descrição">
              <textarea
                value={form.descricao}
                onChange={(e) => set("descricao", e.target.value)}
                placeholder="Caso desejar, você pode acrescentar uma breve descrição aqui"
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </Field>

            <Field label="Segmento de membros elegíveis">
              <Select value={form.segmento} onValueChange={(v) => set("segmento", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um segmento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os membros</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Fidelidade">Fidelidade</SelectItem>
                  <SelectItem value="Frete Grátis">Frete Grátis</SelectItem>
                  <SelectItem value="Básico">Básico</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Período da campanha">
              <div className="flex items-center gap-2">
                <Input
                  type="date" value={form.periodoInicio}
                  onChange={(e) => set("periodoInicio", e.target.value)}
                  className="flex-1"
                />
                <span className="text-muted-foreground text-sm shrink-0">→</span>
                <Input
                  type="date" value={form.periodoFim}
                  onChange={(e) => set("periodoFim", e.target.value)}
                  className="flex-1"
                />
              </div>
            </Field>

            <Field label="Vigência de pontos e bônus" hint="Janela em que os pontos acumulados nesta campanha ficam disponíveis para resgate.">
              <div className="flex items-center gap-2">
                <Input
                  type="date" value={form.vigenciaInicio}
                  onChange={(e) => set("vigenciaInicio", e.target.value)}
                  className="flex-1"
                />
                <span className="text-muted-foreground text-sm shrink-0">→</span>
                <Input
                  type="date" value={form.vigenciaFim}
                  onChange={(e) => set("vigenciaFim", e.target.value)}
                  className="flex-1"
                />
              </div>
            </Field>
          </div>
        )}

        {/* ── Step 2: Canais de venda ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold">Em quais canais esta campanha se aplica?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Selecione os canais pelos quais os membros podem acumular pontos nesta campanha.
              </p>
            </div>

            {[
              { key: "app",  label: "App Mobile",          desc: "Compras realizadas pelo aplicativo do programa." },
              { key: "loja", label: "Loja física",         desc: "Compras registradas nos terminais de loja." },
              { key: "pdv",  label: "Dispositivo (PDV)",   desc: "Compras via dispositivo fixo ou portátil de PDV." },
              { key: "web",  label: "Web / e-commerce",    desc: "Compras realizadas pelo site ou loja virtual." },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-4">
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch
                  size="sm"
                  checked={(form.canais as Record<string, boolean>)[key]}
                  onCheckedChange={(v) => set("canais", { ...(form.canais as Record<string, boolean>), [key]: v })}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Step 3: Elegibilidade e pontos ── */}
        {step === 3 && (
          <div className="space-y-7">
            <div className="mb-8">
              <h3 className="text-xl font-semibold leading-snug">
                Defina como você deseja gerenciar a elegibilidade de pontos/bônus na carteira dos usuários
              </h3>
            </div>

            {/* Status para conceder */}
            <div className="space-y-2">
              <Label className="text-sm">
                Status de pedido para <strong>conceder</strong> pontos
                <span className="text-destructive ml-0.5">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Marque quando você deseja disponibilizar os pontos/bônus ao membro.
              </p>
              <div className="rounded-md border border-input overflow-hidden">
                {STATUS_PEDIDO.map((s) => (
                  <label
                    key={s}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 border-b border-border last:border-0"
                  >
                    <input
                      type="checkbox"
                      className="accent-primary h-4 w-4 shrink-0"
                      checked={(form.statusConceder as Record<string, boolean>)[s] ?? false}
                      onChange={(e) => set("statusConceder", { ...(form.statusConceder as Record<string, boolean>), [s]: e.target.checked })}
                    />
                    <span className="text-sm">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dias para crédito */}
            <div className="space-y-2">
              <Label className="text-sm">
                Após quantos dias do status escolhido do pedido será creditado na carteira?
                <span className="text-destructive ml-0.5">*</span>
              </Label>
              <Select value={form.diasCreditado} onValueChange={(v) => set("diasCreditado", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma quantidade de dias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Imediatamente</SelectItem>
                  <SelectItem value="1">1 dia</SelectItem>
                  <SelectItem value="2">2 dias</SelectItem>
                  <SelectItem value="3">3 dias</SelectItem>
                  <SelectItem value="5">5 dias</SelectItem>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="14">14 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status para anular */}
            <div className="space-y-2">
              <Label className="text-sm">
                Status de pedido para <strong>anular</strong> pontos
                <span className="text-destructive ml-0.5">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Marque quais casos você deseja estornar os pontos/bônus.
              </p>
              <div className="rounded-md border border-input overflow-hidden">
                {STATUS_PEDIDO.map((s) => (
                  <label
                    key={s}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 border-b border-border last:border-0"
                  >
                    <input
                      type="checkbox"
                      className="accent-primary h-4 w-4 shrink-0"
                      checked={(form.statusAnular as Record<string, boolean>)[s] ?? false}
                      onChange={(e) => set("statusAnular", { ...(form.statusAnular as Record<string, boolean>), [s]: e.target.checked })}
                    />
                    <span className="text-sm">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Classificações */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Classificações</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Defina categorias de produtos com taxas de pontos específicas.
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setClassifModal("new")}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Adicionar
                </Button>
              </div>

              {form.classificacoes.length === 0 ? (
                <button
                  onClick={() => setClassifModal("new")}
                  className="w-full rounded-lg border border-dashed border-border py-6 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                >
                  Nenhuma classificação adicionada — clique para adicionar
                </button>
              ) : (
                <div className="space-y-2">
                  {form.classificacoes.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                      <div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: c.cor }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{c.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.pontosPorReal} pts/R$1{c.temBonus && c.bonus ? ` · bônus ${c.bonus}%` : ""}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => setClassifModal(c)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => set("classificacoes", form.classificacoes.filter((x) => x.id !== c.id))}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>


            {/* Múltiplas moedas */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Múltiplas moedas</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Selecione quais carteiras recebem créditos nesta campanha e defina a taxa por R$1 gasto.
                </p>
              </div>

              {["Pontos", "Cashback", "Milhas", "Créditos"].map((moeda) => {
                const m = (form.moedas as Record<string, { ativo: boolean; valor: string }>)[moeda];
                return (
                  <div key={moeda} className={`rounded-lg border px-4 py-3.5 transition-colors ${m.ativo ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                    <div className="flex items-center justify-between gap-4 mb-0">
                      <div>
                        <p className="text-sm font-medium">{moeda}</p>
                        {!m.ativo && <p className="text-xs text-muted-foreground">Desabilitado para esta campanha</p>}
                      </div>
                      <Switch
                        size="sm"
                        checked={m.ativo}
                        onCheckedChange={(v) =>
                          set("moedas", { ...(form.moedas as Record<string, { ativo: boolean; valor: string }>), [moeda]: { ...m, ativo: v } })
                        }
                      />
                    </div>
                    {m.ativo && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="relative flex-1">
                          <Input
                            type="number"
                            value={m.valor}
                            onChange={(e) =>
                              set("moedas", { ...(form.moedas as Record<string, { ativo: boolean; valor: string }>), [moeda]: { ...m, valor: e.target.value } })
                            }
                            placeholder="Taxa por R$1"
                            className="pr-16"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground whitespace-nowrap">
                            / R$1
                          </span>
                        </div>
                        {m.valor && (
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            = {m.valor} {moeda.toLowerCase()} por real
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 4: Multiplicadores por tier ── */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold">Multiplicadores por tier</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Aplique um fator extra sobre os pontos desta campanha por tier do membro.
                Os valores abaixo sobrescrevem os multiplicadores globais da Mecânica do Programa para esta campanha.
              </p>
            </div>

            {[
              { key: "multBronze",   tier: "Bronze",   color: "bg-orange-100 text-orange-700" },
              { key: "multPrata",    tier: "Prata",    color: "bg-slate-100 text-slate-700" },
              { key: "multOuro",     tier: "Ouro",     color: "bg-amber-100 text-amber-700" },
              { key: "multDiamante", tier: "Diamante", color: "bg-violet-100 text-violet-700" },
            ].map(({ key, tier, color }) => (
              <div key={key} className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3.5">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>{tier}</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    className="w-28 text-right"
                    value={(form as unknown as Record<string, string>)[key]}
                    onChange={(e) => set(key as keyof Form, e.target.value)}
                    min={1} step={0.25}
                  />
                  <span className="text-sm text-muted-foreground shrink-0">×</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Step 5: Revisão ── */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold">Revise antes de publicar</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Confirme as configurações da campanha.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Detalhes</p>
              </div>
              <div className="px-5">
                <ReviewRow label="Código"   value={form.codigo} />
                <ReviewRow label="Nome"     value={form.nome || "—"} />
                <ReviewRow label="Descrição" value={form.descricao || "—"} />
                <ReviewRow label="Segmento" value={form.segmento} />
                <ReviewRow label="Período"  value={form.periodoInicio && form.periodoFim ? `${form.periodoInicio} → ${form.periodoFim}` : "—"} />
                <ReviewRow label="Vigência" value={form.vigenciaInicio && form.vigenciaFim ? `${form.vigenciaInicio} → ${form.vigenciaFim}` : "—"} />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Canais</p>
              </div>
              <div className="px-5">
                <ReviewRow
                  label="Canais ativos"
                  value={Object.entries(form.canais).filter(([, v]) => v).map(([k]) =>
                    ({ app: "App", loja: "Loja física", pdv: "PDV", web: "Web" }[k])
                  ).join(", ") || "—"}
                />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Elegibilidade de pontos</p>
              </div>
              <div className="px-5">
                <ReviewRow
                  label="Conceder em"
                  value={Object.entries(form.statusConceder).filter(([, v]) => v).map(([k]) => k).join(", ") || "—"}
                />
                <ReviewRow
                  label="Crédito após"
                  value={form.diasCreditado === "0" ? "Imediatamente" : form.diasCreditado ? `${form.diasCreditado} dias` : "—"}
                />
                <ReviewRow
                  label="Anular em"
                  value={Object.entries(form.statusAnular).filter(([, v]) => v).map(([k]) => k).join(", ") || "—"}
                />
                <ReviewRow
                  label="Moedas ativas"
                  value={Object.entries(form.moedas).filter(([, m]) => m.ativo)
                    .map(([k, m]) => `${k}${m.valor ? ` (${m.valor}/R$1)` : ""}`).join(", ") || "—"}
                />
                {form.classificacoes.length > 0 && (
                  <ReviewRow
                    label="Classificações"
                    value={form.classificacoes.map((c) => c.nome).join(", ")}
                  />
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Multiplicadores</p>
              </div>
              <div className="px-5">
                {[["Bronze", form.multBronze], ["Prata", form.multPrata], ["Ouro", form.multOuro], ["Diamante", form.multDiamante]].map(([tier, v]) => (
                  <ReviewRow key={tier} label={tier} value={`${v}×`} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Modal de classificação ── */}
        {classifModal !== null && (
          <ClassificacaoModal
            initial={classifModal === "new" ? undefined : classifModal}
            onClose={() => setClassifModal(null)}
            onSave={(c) => {
              set("classificacoes",
                classifModal === "new"
                  ? [...form.classificacoes, c]
                  : form.classificacoes.map((x) => x.id === c.id ? c : x)
              );
              setClassifModal(null);
            }}
          />
        )}

        {/* ── Navigation ── */}
        <div className="flex gap-3 mt-10 pt-6 border-t border-border">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => step > 1 ? setStep(step - 1) : navigate("/campanhas")}
          >
            Voltar
          </Button>
          {step < 5 ? (
            <Button
              className="flex-1"
              disabled={!canContinue()}
              onClick={() => setStep(step + 1)}
            >
              Continuar
            </Button>
          ) : (
            <Button className="flex-1" onClick={handlePublish}>
              Publicar campanha
            </Button>
          )}
        </div>
        {step < 5 && (
          <p className="text-center mt-3">
            <button
              className="text-xs text-muted-foreground hover:text-foreground underline"
              onClick={() => { toast.success("Rascunho salvo"); navigate("/campanhas"); }}
            >
              Salvar como rascunho
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
