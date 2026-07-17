import { useState } from "react";
import {
  Button, ConfirmDialog, InfoNotice, Input, Label, NumberInput, PageHeader,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Switch, Separator, toast,
} from "@kruzer/ds";
import { Save } from "lucide-react";
import { type Moeda, getMoedas, saveMoedas } from "../config/moedas";

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

  // Acúmulo
  const [pontosPorReal,     setPontosPorReal]     = useState<number | null>(1);
  const [moedaNome,         setMoedaNome]         = useState("Pontos");
  const [acumuloArredonda,  setAcumuloArredonda]  = useState<string>("baixo");

  // Expiração
  const [expiracaoAtiva,    setExpiracaoAtiva]    = useState(true);
  const [expiracaoMeses,    setExpiracaoMeses]    = useState<number | null>(12);
  const [expiracaoTipo,     setExpiracaoTipo]     = useState<string>("inatividade");

  // Resgate
  const [saldoMinimo,       setSaldoMinimo]       = useState<number | null>(500);
  const [prazoEntrega,      setPrazoEntrega]      = useState<number | null>(5);

  // Multiplicadores por tier
  const [multBronze,   setMultBronze]   = useState<number | null>(1);
  const [multPrata,    setMultPrata]    = useState<number | null>(1.25);
  const [multOuro,     setMultOuro]     = useState<number | null>(1.5);
  const [multDiamante, setMultDiamante] = useState<number | null>(2);

  // Múltiplas moedas
  const [moedas, setMoedas] = useState<Moeda[]>(() => getMoedas());

  const updateMoeda = (id: string, field: keyof Moeda, value: string | boolean) => {
    setMoedas((prev) => prev.map((m) => {
      if (field === "ativo" && value === true && !m.base) {
        // ao habilitar uma moeda, desabilita todas as outras não-base
        return { ...m, ativo: m.id === id ? true : (m.base ? m.ativo : false) };
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

      {/* ── Acúmulo ── */}
      <Section
        title="Acúmulo de pontos"
        description="Define como os pontos são gerados a partir de transações elegíveis."
      >
        <Field
          label="Nome da moeda"
          hint="Como os pontos são chamados para o participante."
        >
          <Input
            value={moedaNome}
            onChange={(e) => { setMoedaNome(e.target.value); setDirty(true); }}
            placeholder="Ex: Pontos, Créditos, Estrelas"
          />
        </Field>

        <Separator />

        <Field
          label="Taxa de acúmulo base"
          hint="Quantos pontos são gerados por R$1,00 gasto em transação elegível."
        >
          <div className="flex items-center gap-2">
            <NumberInput
              value={pontosPorReal}
              onChange={handleChange(setPontosPorReal)}
              min={0.1}
              step={0.1}
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">pts / R$1</span>
          </div>
        </Field>

        <Field
          label="Arredondamento de fração"
          hint="Como lidar com valores fracionados (ex: R$3,50 × 1 pt = 3,5 pts)."
        >
          <Select value={acumuloArredonda} onValueChange={handleChange(setAcumuloArredonda)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="baixo">Arredondar para baixo (3 pts)</SelectItem>
              <SelectItem value="cima">Arredondar para cima (4 pts)</SelectItem>
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
        title="Expiração de pontos"
        description="Define se e quando os pontos acumulados expiram."
      >
        <Field label="Ativar expiração de pontos">
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
              hint="Meses até os pontos expirarem conforme o critério acima."
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

      {/* ── Resgate ── */}
      <Section
        title="Regras de resgate"
        description="Condições mínimas para que um participante possa resgatar."
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
            <span className="text-sm text-muted-foreground">pts</span>
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
      </Section>

      {/* ── Múltiplas moedas ── */}
      <Section
        title="Múltiplas moedas"
        description="Habilite uma carteira adicional além da moeda base. Apenas um tipo de moeda secundária pode estar ativo por vez."
      >
        <div className="space-y-3">
          {moedas.map((m) => (
            <div key={m.id} className={`rounded-lg border px-4 py-3.5 transition-colors ${m.ativo ? "border-primary/30 bg-primary/5" : "border-border"}`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{m.nome}</p>
                  {m.base
                    ? <p className="text-xs text-muted-foreground">Moeda base do programa — sempre ativa</p>
                    : <p className="text-xs text-muted-foreground">{m.ativo ? "Carteira habilitada" : "Desabilitada"}</p>
                  }
                </div>
                <Switch
                  size="sm"
                  checked={m.ativo}
                  disabled={!!m.base}
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
                      disabled={!!m.base}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Símbolo / abreviação</Label>
                    <Input
                      value={m.simbolo}
                      onChange={(e) => updateMoeda(m.id, "simbolo", e.target.value)}
                      placeholder="Ex: mi"
                      disabled={!!m.base}
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

    </div>
  );
}
