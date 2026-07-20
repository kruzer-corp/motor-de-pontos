import { useState } from "react";
import {
  Button, ConfirmDialog, InfoNotice, Input, Label, NumberInput, PageHeader,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Switch, Separator, toast,
} from "@kruzer/ds";
import { Save } from "lucide-react";
import { type Moeda, getMoedas, saveMoedas } from "../config/moedas";
import { getMecanica, saveMecanica } from "../lib/mecanica";
import { type TipoResgate, TIPO_RESGATE_LABEL, TIPO_RESGATE_ICON } from "../config/resgateLifecycle";

const TIPOS_RESGATE: TipoResgate[] = ["voucher_digital", "produto_fisico", "credito_conta"];

// ── Seção wrapper ──────────────────────────────────────────────────────────────

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="px-6 py-5 space-y-5">
        {children}
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-start gap-8">
      <div className="space-y-1">
        <Label className="text-sm font-medium">{label}</Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="min-w-[240px]">
        {children}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MecanicaPrograma() {
  const [dirty,       setDirty]       = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [mecanicaInicial] = useState(() => getMecanica());

  // Acúmulo
  const [pontosPorReal,     setPontosPorReal]     = useState<number | null>(mecanicaInicial.pontosPorReal);
  const [acumuloArredonda,  setAcumuloArredonda]  = useState<string>(mecanicaInicial.arredondamento);

  // Expiração
  const [expiracaoAtiva,    setExpiracaoAtiva]    = useState(mecanicaInicial.expiracaoAtiva);
  const [expiracaoMeses,    setExpiracaoMeses]    = useState<number | null>(mecanicaInicial.expiracaoMeses);
  const [expiracaoTipo,     setExpiracaoTipo]     = useState<string>(mecanicaInicial.expiracaoTipo);

  // Resgate
  const [saldoMinimo,       setSaldoMinimo]       = useState<number | null>(mecanicaInicial.resgateSaldoMinimo);
  const [prazoEntrega,      setPrazoEntrega]      = useState<number | null>(mecanicaInicial.resgatePrazoEntrega);
  const [tipoValor,         setTipoValor]         = useState<"parcial" | "total">(mecanicaInicial.resgateTipoValor);
  const [limiteAtivo,       setLimiteAtivo]       = useState(mecanicaInicial.resgateLimiteAtivo);
  const [limiteQtd,         setLimiteQtd]         = useState<number | null>(mecanicaInicial.resgateLimiteQtd);
  const [limiteEscopo,      setLimiteEscopo]      = useState<string>(mecanicaInicial.resgateLimiteEscopo);
  const [tiposHabilitados,  setTiposHabilitados]  = useState<string[]>(mecanicaInicial.tiposResgateHabilitados);

  // Aprovação de resgates
  const [aprovacaoTipo,     setAprovacaoTipo]     = useState<"manual" | "automatica">(mecanicaInicial.aprovacaoTipo);
  const [aprovacaoValorMax, setAprovacaoValorMax] = useState(mecanicaInicial.aprovacaoValorMax);
  const [aprovacaoTiers,    setAprovacaoTiers]    = useState<string[]>(mecanicaInicial.aprovacaoTiers);

  function toggleTipoHabilitado(tipo: string) {
    setTiposHabilitados(tiposHabilitados.includes(tipo)
      ? tiposHabilitados.filter((t) => t !== tipo)
      : [...tiposHabilitados, tipo]);
    setDirty(true);
  }

  // Multiplicadores por tier
  const [multBronze,   setMultBronze]   = useState<number | null>(mecanicaInicial.multBronze);
  const [multPrata,    setMultPrata]    = useState<number | null>(mecanicaInicial.multPrata);
  const [multOuro,     setMultOuro]     = useState<number | null>(mecanicaInicial.multOuro);
  const [multDiamante, setMultDiamante] = useState<number | null>(mecanicaInicial.multDiamante);

  // Múltiplas moedas
  const [moedas, setMoedas] = useState<Moeda[]>(() => getMoedas());
  const moedaAtiva = moedas.find((m) => m.ativo) ?? moedas[0];

  const updateMoeda = (id: string, field: keyof Moeda, value: string | boolean) => {
    setMoedas((prev) => prev.map((m) => {
      // só uma moeda pode estar ativa por vez — ela é a que define acúmulo e resgate
      if (field === "ativo" && value === true) {
        return { ...m, ativo: m.id === id };
      }
      return m.id === id ? { ...m, [field]: value } : m;
    }));
    setDirty(true);
  };

  function handleChange(setter: (v: any) => void) {
    return (v: any) => { setter(v); setDirty(true); };
  }

  function handleSave() {
    saveMoedas(moedas);
    saveMecanica({
      pontosPorReal: pontosPorReal ?? 0,
      arredondamento: acumuloArredonda as "baixo" | "cima" | "proximo",
      multBronze: multBronze ?? 1, multPrata: multPrata ?? 1, multOuro: multOuro ?? 1, multDiamante: multDiamante ?? 1,
      expiracaoAtiva,
      expiracaoTipo: expiracaoTipo as "inatividade" | "emissao" | "aniversario",
      expiracaoMeses: expiracaoMeses ?? 12,
      resgateSaldoMinimo: saldoMinimo ?? 0,
      resgatePrazoEntrega: prazoEntrega ?? 1,
      resgateTipoValor: tipoValor,
      resgateLimiteAtivo: limiteAtivo,
      resgateLimiteQtd: limiteQtd ?? 1,
      resgateLimiteEscopo: limiteEscopo as "mes" | "ano" | "ilimitado",
      tiposResgateHabilitados: tiposHabilitados,
      aprovacaoTipo, aprovacaoValorMax, aprovacaoTiers,
    });
    setConfirmOpen(false);
    setDirty(false);
    toast.success("Mecânica do programa salva com sucesso");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mecânica do Programa"
        path={[{ label: "Configuração" }]}
        description="Programa base — regras aplicadas quando nenhuma campanha está ativa. Cada campanha define suas próprias regras e sobrescreve o programa base."
        actions={
          <Button size="sm" disabled={!dirty} onClick={() => setConfirmOpen(true)}>
            <Save className="mr-2 h-4 w-4" />
            Salvar alterações
          </Button>
        }
      />

      <InfoNotice variant="warning" title="Impacto das alterações">
        Mudar a taxa de acúmulo ou os multiplicadores de tier afeta todos os participantes retroativamente.
        Revise com cuidado antes de salvar — essas regras são a base do programa.
      </InfoNotice>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirmar alterações na mecânica"
        description="Mudar a taxa de acúmulo ou os multiplicadores de tier afeta todos os participantes retroativamente. Tem certeza que deseja salvar?"
        confirmLabel="Sim, salvar alterações"
        onConfirm={handleSave}
      />

      {/* ── Múltiplas moedas ── */}
      <Section
        title="Múltiplas moedas"
        description="Escolha qual moeda está ativa no programa — só uma pode estar ativa por vez, e ela define as regras de acúmulo e resgate abaixo."
      >
        <div className="space-y-3">
          {moedas.map((m) => (
            <div key={m.id} className={`rounded-lg border px-4 py-3.5 transition-colors ${m.ativo ? "border-primary/30 bg-primary/5" : "border-border"}`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{m.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.ativo ? "Moeda ativa do programa" : "Desabilitada"}{m.base ? " · moeda base" : ""}
                  </p>
                </div>
                <Switch
                  size="sm"
                  checked={m.ativo}
                  disabled={m.ativo}
                  onCheckedChange={(v) => updateMoeda(m.id, "ativo", v)}
                />
              </div>

              {m.ativo && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Nome</Label>
                    <Input
                      value={m.nome}
                      onChange={(e) => updateMoeda(m.id, "nome", e.target.value)}
                      placeholder="Ex: Milhas"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Símbolo / abreviação</Label>
                    <Input
                      value={m.simbolo}
                      onChange={(e) => updateMoeda(m.id, "simbolo", e.target.value)}
                      placeholder="Ex: mi"
                    />
                  </div>
                  {!m.base && (
                    <div className="space-y-1">
                      <Label className="text-xs">Taxa em relação à moeda base</Label>
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          value={m.taxa}
                          onChange={(e) => updateMoeda(m.id, "taxa", e.target.value)}
                          placeholder="Ex: 0.5"
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">× base</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ── Acúmulo ── */}
      <Section
        title="Acúmulo de pontos"
        description={`Define como ${moedaAtiva.nome.toLowerCase()} são gerados a partir de transações elegíveis.`}
      >
        <Field
          label="Taxa de acúmulo base"
          hint={`Quantos ${moedaAtiva.nome.toLowerCase()} são gerados por R$1,00 gasto em transação elegível.`}
        >
          <div className="flex items-center gap-2">
            <NumberInput
              value={pontosPorReal}
              onChange={handleChange(setPontosPorReal)}
              min={0.1}
              step={0.1}
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">{moedaAtiva.simbolo} / R$1</span>
          </div>
        </Field>

        <Field
          label="Arredondamento de fração"
          hint={`Como lidar com valores fracionados (ex: R$3,50 × 1 ${moedaAtiva.simbolo} = 3,5 ${moedaAtiva.simbolo}).`}
        >
          <Select value={acumuloArredonda} onValueChange={handleChange(setAcumuloArredonda)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="baixo">Arredondar para baixo (3 {moedaAtiva.simbolo})</SelectItem>
              <SelectItem value="cima">Arredondar para cima (4 {moedaAtiva.simbolo})</SelectItem>
              <SelectItem value="proximo">Arredondar para o mais próximo</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </Section>

      {/* ── Multiplicadores por tier ── */}
      <Section
        title="Multiplicadores por tier"
        description="Fator aplicado sobre a taxa base conforme o tier do participante."
      >
        <div className="space-y-3">
          {[
            { tier: "Bronze",   color: "bg-orange-100 text-orange-700", value: multBronze,   set: setMultBronze   },
            { tier: "Prata",    color: "bg-slate-100 text-slate-700",   value: multPrata,    set: setMultPrata    },
            { tier: "Ouro",     color: "bg-amber-100 text-amber-700",   value: multOuro,     set: setMultOuro     },
            { tier: "Diamante", color: "bg-violet-100 text-violet-700", value: multDiamante, set: setMultDiamante },
          ].map(({ tier, color, value, set }) => (
            <div key={tier} className="flex items-center justify-between gap-4">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>{tier}</span>
              <div className="w-40">
                <NumberInput
                  value={value}
                  onChange={handleChange(set)}
                  min={1}
                  step={0.25}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Expiração ── */}
      <Section
        title="Expiração do benefício"
        description="Define se e quando o benefício acumulado expira."
      >
        <Field label="Ativar expiração do benefício">
          <Switch
            checked={expiracaoAtiva}
            onCheckedChange={handleChange(setExpiracaoAtiva)}
            size="sm"
          />
        </Field>

        {expiracaoAtiva && (
          <>
            <Separator />
            <Field
              label="Critério de expiração"
              hint="Quando o contador de expiração é reiniciado."
            >
              <Select value={expiracaoTipo} onValueChange={handleChange(setExpiracaoTipo)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="inatividade">Por inatividade (sem movimentação)</SelectItem>
                  <SelectItem value="emissao">Por data de emissão de cada lote</SelectItem>
                  <SelectItem value="aniversario">Por aniversário do cadastro</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field
              label="Prazo de expiração"
              hint="Meses até o benefício expirar conforme o critério acima."
            >
              <div className="flex items-center gap-2">
                <NumberInput
                  value={expiracaoMeses}
                  onChange={handleChange(setExpiracaoMeses)}
                  min={1}
                />
                <span className="text-sm text-muted-foreground">meses</span>
              </div>
            </Field>
          </>
        )}
      </Section>

      {/* ── Tipos de resgate ── */}
      <Section
        title="Tipos de resgate"
        description="Quais formas de resgate existem no programa — as regras e a aprovação abaixo se aplicam a esses tipos."
      >
        <div className="flex flex-col gap-1.5">
          {TIPOS_RESGATE.map((tipo) => (
            <label key={tipo} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-primary h-4 w-4"
                checked={tiposHabilitados.includes(tipo)}
                onChange={() => toggleTipoHabilitado(tipo)} />
              <span className="text-sm">{TIPO_RESGATE_ICON[tipo]} {TIPO_RESGATE_LABEL[tipo]}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* ── Resgate ── */}
      <Section
        title="Regras de resgate"
        description="Condições mínimas para que um participante possa resgatar, nos tipos habilitados acima."
      >
        <Field
          label="Saldo mínimo para resgate"
          hint="Participante precisa ter ao menos este saldo para solicitar um resgate."
        >
          <div className="flex items-center gap-2">
            <NumberInput
              value={saldoMinimo}
              onChange={handleChange(setSaldoMinimo)}
              min={0}
            />
            <span className="text-sm text-muted-foreground">{moedaAtiva.simbolo}</span>
          </div>
        </Field>

        <Separator />

        <Field
          label="Prazo de processamento"
          hint="Dias úteis para processar e entregar após aprovação do resgate."
        >
          <div className="flex items-center gap-2">
            <NumberInput
              value={prazoEntrega}
              onChange={handleChange(setPrazoEntrega)}
              min={1}
            />
            <span className="text-sm text-muted-foreground">dias úteis</span>
          </div>
        </Field>

        <Separator />

        <p className="text-sm font-medium">Resgate parcial ou total do saldo</p>
        <div className="grid grid-cols-2 gap-3">
          {([
            ["parcial", "Parcial", "O participante pode resgatar qualquer valor acima do mínimo."],
            ["total",   "Total",   "O participante precisa resgatar todo o saldo disponível de uma vez."],
          ] as const).map(([v, label, desc]) => (
            <label key={v} className={`flex flex-col gap-1 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
              tipoValor === v ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            }`}>
              <input type="radio" name="tipoValor" value={v} checked={tipoValor === v}
                onChange={() => handleChange(setTipoValor)(v)} className="sr-only" />
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-xs text-muted-foreground">{desc}</span>
            </label>
          ))}
        </div>

        <Separator />

        <Field
          label="Limite de resgates por membro"
          hint="Quantas vezes um membro pode resgatar dentro do período escolhido."
        >
          <Switch
            checked={limiteAtivo}
            onCheckedChange={handleChange(setLimiteAtivo)}
            size="sm"
          />
        </Field>
        {limiteAtivo && (
          <div className="flex items-center gap-3">
            <NumberInput value={limiteQtd} onChange={handleChange(setLimiteQtd)} min={1} />
            <span className="text-sm text-muted-foreground shrink-0">vezes por</span>
            <Select value={limiteEscopo} onValueChange={handleChange(setLimiteEscopo)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mes">Mês</SelectItem>
                <SelectItem value="ano">Ano</SelectItem>
                <SelectItem value="ilimitado">Ilimitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </Section>

      {/* ── Aprovação de resgates ── */}
      <Section
        title="Aprovação de resgates"
        description="Define se os resgates dos tipos habilitados precisam de revisão manual ou são aprovados automaticamente — vale para toda campanha, sem exceção."
      >
        <div className="grid grid-cols-2 gap-3">
          {([
            ["manual",     "Manual",     "Analista revisa e aprova cada solicitação individualmente."],
            ["automatica", "Automática", "Aprovação imediata ao atingir as condições abaixo."],
          ] as const).map(([v, label, desc]) => (
            <label key={v} className={`flex flex-col gap-1 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
              aprovacaoTipo === v ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            }`}>
              <input type="radio" name="aprovacaoTipo" value={v} checked={aprovacaoTipo === v}
                onChange={() => handleChange(setAprovacaoTipo)(v)} className="sr-only" />
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-xs text-muted-foreground">{desc}</span>
            </label>
          ))}
        </div>

        {aprovacaoTipo === "automatica" && (
          <>
            <Separator />

            <Field
              label="Valor máximo do resgate"
              hint="Resgates acima desse valor vão para aprovação manual. Deixe em branco para sem limite."
            >
              <Input type="number" value={aprovacaoValorMax}
                onChange={(e) => handleChange(setAprovacaoValorMax)(e.target.value)}
                placeholder="Ex: 500" />
            </Field>

            <div className="space-y-2">
              <p className="text-sm font-medium">Tiers elegíveis para aprovação automática</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { tier: "Bronze",   color: "bg-orange-100 text-orange-700 border-orange-200" },
                  { tier: "Prata",    color: "bg-slate-100 text-slate-600 border-slate-200"   },
                  { tier: "Ouro",     color: "bg-amber-100 text-amber-700 border-amber-200"   },
                  { tier: "Diamante", color: "bg-violet-100 text-violet-700 border-violet-200"},
                ].map(({ tier, color }) => {
                  const sel = aprovacaoTiers.includes(tier);
                  return (
                    <button key={tier} type="button"
                      onClick={() => handleChange(setAprovacaoTiers)(
                        sel ? aprovacaoTiers.filter(x => x !== tier) : [...aprovacaoTiers, tier]
                      )}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                        sel ? color + " ring-1 ring-offset-1 ring-primary/40" : "border-border text-muted-foreground bg-background hover:border-primary/40"
                      }`}>
                      {tier}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </Section>


    </div>
  );
}
