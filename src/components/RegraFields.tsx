import { useEffect } from "react";
import {
  Input, Label, NumberInput, Switch,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@kruzer/ds";
import { Plus, Trash2 } from "lucide-react";
import {
  type RegraCampos, type GatilhoTipo, type EixoTipo, type MecanismoAtribuicao, type EstornoPolicy, type FaixaBeneficio,
  type CategoriaRegra, type Modulo,
  GATILHO_LABEL, GATILHO_DESC, EIXO_LABEL, MECANISMO_LABEL, ESTORNO_LABEL,
  CATEGORIA_REGRA_OPCOES, MODULO_OPCOES, CANAIS, STATUS_PEDIDO, novoIdFaixa,
} from "../lib/regras";
import { getConjuntosProdutos } from "../lib/conjuntosProdutos";
import { getClassesProduto } from "../lib/classesProduto";
import { getPapeisMembro } from "../lib/papeisMembro";
import { getTiersProduto } from "../lib/tiersProduto";
import { getTiersMembro } from "../lib/tiers";
import { type BonificaEntidade, getBonificaEscolha } from "../lib/onboarding";
import { getSegmentosMembro } from "../lib/segmentosMembro";

const GATILHOS: GatilhoTipo[] = ["compra_qualquer", "compra_conjunto", "compra_classe", "primeira_compra", "marco_recorrencia", "evento_nao_transacional"];
const EIXOS: EixoTipo[] = ["valor_total", "valor_linha", "quantidade", "flat"];
const MECANISMOS: MecanismoAtribuicao[] = ["mesma_pessoa", "direto", "dividido"];
const ESTORNOS: EstornoPolicy[] = ["estornar_tudo", "estornar_proporcional", "manter"];

// Gatilhos relevantes por entidade de bonifica — a tela de Regra mostra a
// união de todas as entidades marcadas (1, 2 ou as 3).
const GATILHOS_POR_ENTIDADE: Record<BonificaEntidade, GatilhoTipo[]> = {
  produto: ["compra_conjunto", "compra_classe"],
  pedido:  ["compra_qualquer", "primeira_compra", "marco_recorrencia"],
  cliente: ["marco_recorrencia", "evento_nao_transacional"],
};

type Props = { value: RegraCampos; onChange: (patch: Partial<RegraCampos>) => void };

// Subconjuntos de campos — permitem reusar os mesmos componentes na Regra
// (Mecânica/Onboarding) e na Campanha, que hoje é autossuficiente (define sua
// própria Elegibilidade, sem referenciar uma Regra).
type PoliticasValue = Pick<RegraCampos, "timingTipo" | "timingDias" | "estornoPolicy" | "conversaoParcialPermitida" | "tetoAtivo" | "tetoValor">;
type PoliticasProps = { value: PoliticasValue; onChange: (patch: Partial<PoliticasValue>) => void };

type GatilhoValue = Pick<RegraCampos, "gatilhoTipo" | "gatilhoConjuntoId" | "gatilhoClasseId" | "gatilhoMarcoN" | "gatilhoEventoNome">;
type GatilhoProps = { value: GatilhoValue; onChange: (patch: Partial<GatilhoValue>) => void };

type AtribuicaoValue = Pick<RegraCampos, "atribuicaoAtiva" | "papelGeradoraId" | "papelBeneficiariaId" | "mecanismoAtribuicao" | "percentualDivisao">;
type AtribuicaoProps = { value: AtribuicaoValue; onChange: (patch: Partial<AtribuicaoValue>) => void };

type ElegibilidadeValue = Pick<RegraCampos, "conjuntoElegibilidadeId" | "produtoTiers" | "valorMinimo" | "canais" | "segmentos" | "tiers" | "papeis" | "statusPedido" | "gatilhoTipo">;
type ElegibilidadeProps = { value: ElegibilidadeValue; onChange: (patch: Partial<ElegibilidadeValue>) => void };

function RadioCards<T extends string>({ options, labels, descs, value, onChange, name }: {
  options: T[]; labels: Record<T, string>; descs?: Record<T, string>; value: T; onChange: (v: T) => void; name: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {options.map((v) => (
        <label key={v} className={`flex flex-col gap-1 rounded-lg border px-3.5 py-2.5 cursor-pointer transition-colors ${
          value === v ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
        }`}>
          <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} className="sr-only" />
          <span className="text-sm font-semibold">{labels[v]}</span>
          {descs && <span className="text-xs text-muted-foreground">{descs[v]}</span>}
        </label>
      ))}
    </div>
  );
}

function ChipMultiSelect({ options, selected, onToggle }: { options: { id: string; nome: string }[]; selected: string[]; onToggle: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const sel = selected.includes(o.id);
        return (
          <button key={o.id} type="button" onClick={() => onToggle(o.id)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              sel ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
            }`}>
            {o.nome}
          </button>
        );
      })}
    </div>
  );
}

function toggleIn(value: ElegibilidadeValue, onChange: ElegibilidadeProps["onChange"], field: "canais" | "segmentos" | "tiers" | "papeis" | "statusPedido" | "produtoTiers", id: string) {
  const atual = value[field];
  onChange({ [field]: atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id] } as Partial<ElegibilidadeValue>);
}

// ── 1. Identidade ─────────────────────────────────────────────────────────────

export function IdentidadeFields({ value, onChange }: Props) {
  const bonifica = getBonificaEscolha();
  // Só restringe se todas as entidades marcadas forem transacionais (Produto/Pedido) — Cliente
  // no meio da seleção libera tudo, porque comportamento usa Boas-vindas/Cadastro/Indicação.
  const apenasTransacional = bonifica.length > 0 && bonifica.every((e) => e === "produto" || e === "pedido");
  const categoriasVisiveis = apenasTransacional
    ? CATEGORIA_REGRA_OPCOES.filter((c) => c === "Acúmulo" || c === "Bônus")
    : CATEGORIA_REGRA_OPCOES;
  const modulosVisiveis = apenasTransacional
    ? MODULO_OPCOES.filter((m) => m === "Vendas" || m === "Fidelização")
    : MODULO_OPCOES;

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold">Identidade</h4>
        <p className="text-xs text-muted-foreground mt-0.5">Nome, categoria e módulo desta regra.</p>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Nome da regra <span className="text-destructive">*</span></Label>
        <Input value={value.nome} onChange={(e) => onChange({ nome: e.target.value })} placeholder="Ex: 1 ponto por real em qualquer compra" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Categoria</Label>
          <Select value={value.categoriaRegra} onValueChange={(v) => onChange({ categoriaRegra: v as CategoriaRegra })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{categoriasVisiveis.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Módulo</Label>
          <Select value={value.modulo} onValueChange={(v) => onChange({ modulo: v as Modulo })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{modulosVisiveis.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// ── 2. Gatilho ───────────────────────────────────────────────────────────────

export function GatilhoFields({ value, onChange }: GatilhoProps) {
  const conjuntos = getConjuntosProdutos();
  const classes = getClassesProduto();
  const bonifica = getBonificaEscolha();
  // Mostra a união dos gatilhos de todas as entidades marcadas — nada marcado ainda = mostra tudo.
  const uniaoGatilhos = new Set(bonifica.flatMap((e) => GATILHOS_POR_ENTIDADE[e]));
  const gatilhosVisiveis = bonifica.length === 0 ? GATILHOS : GATILHOS.filter((g) => uniaoGatilhos.has(g));

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold">Gatilho</h4>
        <p className="text-xs text-muted-foreground mt-0.5">O evento que aciona a avaliação — a tela se reconfigura conforme a escolha.</p>
      </div>
      <RadioCards options={gatilhosVisiveis} labels={GATILHO_LABEL} descs={GATILHO_DESC} value={value.gatilhoTipo} name="gatilhoTipo"
        onChange={(v) => onChange({ gatilhoTipo: v })} />

      {value.gatilhoTipo === "compra_conjunto" && (
        <div className="space-y-1.5">
          <Label className="text-xs">Conjunto de produtos</Label>
          <Select value={value.gatilhoConjuntoId} onValueChange={(v) => onChange({ gatilhoConjuntoId: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione um conjunto" /></SelectTrigger>
            <SelectContent>{conjuntos.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
          </Select>
          {conjuntos.length === 0 && <p className="text-xs text-muted-foreground">Nenhum conjunto cadastrado — crie um em Biblioteca.</p>}
        </div>
      )}
      {value.gatilhoTipo === "compra_classe" && (
        <div className="space-y-1.5">
          <Label className="text-xs">Classe de produto</Label>
          <Select value={value.gatilhoClasseId} onValueChange={(v) => onChange({ gatilhoClasseId: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione uma classe" /></SelectTrigger>
            <SelectContent>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}
      {value.gatilhoTipo === "marco_recorrencia" && (
        <div className="space-y-1.5">
          <Label className="text-xs">Qual compra (Nª)</Label>
          <div className="flex items-center gap-2 w-40">
            <NumberInput value={value.gatilhoMarcoN} onChange={(v) => onChange({ gatilhoMarcoN: v ?? 2 })} min={2} />
            <span className="text-xs text-muted-foreground whitespace-nowrap">ª compra</span>
          </div>
        </div>
      )}
      {value.gatilhoTipo === "evento_nao_transacional" && (
        <div className="space-y-1.5">
          <Label className="text-xs">Evento</Label>
          <Select value={value.gatilhoEventoNome} onValueChange={(v) => onChange({ gatilhoEventoNome: v })}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cadastro">Cadastro no programa</SelectItem>
              <SelectItem value="indicacao">Indicação de novo membro</SelectItem>
              <SelectItem value="avaliacao">Avaliação de produto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

// ── 3. Atribuição ────────────────────────────────────────────────────────────

export function AtribuicaoFields({ value, onChange }: AtribuicaoProps) {
  const papeis = getPapeisMembro();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold">Atribuição <span className="text-xs text-muted-foreground font-normal">(se aplicável)</span></h4>
          <p className="text-xs text-muted-foreground mt-0.5">Quando quem gera a ação é diferente de quem recebe o benefício.</p>
        </div>
        <Switch checked={value.atribuicaoAtiva} onCheckedChange={(v) => onChange({ atribuicaoAtiva: v })} size="sm" />
      </div>

      {!value.atribuicaoAtiva ? (
        <p className="text-xs text-muted-foreground rounded-lg border border-border px-3 py-2">Não se aplica — o próprio membro que realizou a ação recebe o benefício.</p>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Papel geradora</Label>
              <Select value={value.papelGeradoraId} onValueChange={(v) => onChange({ papelGeradoraId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione um papel" /></SelectTrigger>
                <SelectContent>{papeis.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Papel beneficiária</Label>
              <Select value={value.papelBeneficiariaId} onValueChange={(v) => onChange({ papelBeneficiariaId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione um papel" /></SelectTrigger>
                <SelectContent>{papeis.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          {papeis.length === 0 && <p className="text-xs text-muted-foreground">Nenhum papel cadastrado ainda — crie em Biblioteca (ex: Arquiteto).</p>}

          <div className="space-y-1.5">
            <Label className="text-xs">Mecanismo</Label>
            <div className="grid grid-cols-3 gap-2">
              {MECANISMOS.map((m) => (
                <label key={m} className={`flex flex-col gap-1 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                  value.mecanismoAtribuicao === m ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                }`}>
                  <input type="radio" name="mecanismoAtribuicao" checked={value.mecanismoAtribuicao === m} onChange={() => onChange({ mecanismoAtribuicao: m })} className="sr-only" />
                  <span className="text-xs font-semibold">{MECANISMO_LABEL[m]}</span>
                </label>
              ))}
            </div>
          </div>

          {value.mecanismoAtribuicao === "dividido" && (
            <div className="space-y-1.5">
              <Label className="text-xs">% para a beneficiária</Label>
              <div className="flex items-center gap-2 w-40">
                <NumberInput value={value.percentualDivisao} onChange={(v) => onChange({ percentualDivisao: v ?? 50 })} min={0} max={100} />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground">O restante ({100 - value.percentualDivisao}%) vai para a geradora.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── 4. Elegibilidade ──────────────────────────────────────────────────────────

export function ElegibilidadeFields({ value, onChange }: ElegibilidadeProps) {
  const conjuntos = getConjuntosProdutos();
  const tiersMembro = getTiersMembro();
  const tiersProduto = getTiersProduto();
  const papeis = getPapeisMembro();
  const segmentosMembro = getSegmentosMembro();
  const bonifica = getBonificaEscolha();
  const transacional = value.gatilhoTipo !== "evento_nao_transacional";
  // Só mostra filtro por produto se "Produto" estiver entre as entidades marcadas (ou nada marcado ainda).
  const mostrarFiltroProduto = (bonifica.length === 0 || bonifica.includes("produto")) && transacional;

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold">Elegibilidade</h4>
        <p className="text-xs text-muted-foreground mt-0.5">Produto ∈ conjunto (se transacional) e/ou filtros de membro/ação — permanentes, sem data.</p>
      </div>

      {mostrarFiltroProduto && (
        <div className="space-y-1.5">
          <Label className="text-xs">Produto pertence ao conjunto</Label>
          <Select value={value.conjuntoElegibilidadeId || "nenhum"} onValueChange={(v) => onChange({ conjuntoElegibilidadeId: v === "nenhum" ? "" : v })}>
            <SelectTrigger><SelectValue placeholder="Qualquer produto" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="nenhum">Qualquer produto</SelectItem>
              {conjuntos.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {mostrarFiltroProduto && (
        <div className="space-y-1.5">
          <Label className="text-xs">Tier de produto</Label>
          <ChipMultiSelect options={tiersProduto.map((t) => ({ id: t.id, nome: t.nome }))} selected={value.produtoTiers} onToggle={(id) => toggleIn(value, onChange, "produtoTiers", id)} />
          {value.produtoTiers.length === 0 && <p className="text-xs text-muted-foreground">Nenhum selecionado = todos os tiers de produto.</p>}
        </div>
      )}

      {transacional && (
        <div className="space-y-1.5">
          <Label className="text-xs">Valor mínimo (R$)</Label>
          <Input className="w-40" type="number" value={value.valorMinimo}
            onChange={(e) => onChange({ valorMinimo: e.target.value })} placeholder="Opcional" />
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-xs">Canal</Label>
        <ChipMultiSelect options={CANAIS} selected={value.canais} onToggle={(id) => toggleIn(value, onChange, "canais", id)} />
        {value.canais.length === 0 && <p className="text-xs text-muted-foreground">Nenhum selecionado = todos os canais.</p>}
      </div>

      {segmentosMembro.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs">Segmento</Label>
          <ChipMultiSelect options={segmentosMembro.map((s) => ({ id: s.id, nome: s.nome }))} selected={value.segmentos} onToggle={(id) => toggleIn(value, onChange, "segmentos", id)} />
          {value.segmentos.length === 0 && <p className="text-xs text-muted-foreground">Nenhum selecionado = todos os segmentos.</p>}
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-xs">Tier</Label>
        <ChipMultiSelect options={tiersMembro.map((t) => ({ id: t.id, nome: t.nome }))} selected={value.tiers} onToggle={(id) => toggleIn(value, onChange, "tiers", id)} />
        {value.tiers.length === 0 && <p className="text-xs text-muted-foreground">Nenhum selecionado = todos os tiers.</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Papel de membro</Label>
        <ChipMultiSelect options={papeis.map((p) => ({ id: p.id, nome: p.nome }))} selected={value.papeis} onToggle={(id) => toggleIn(value, onChange, "papeis", id)} />
        {value.papeis.length === 0 && <p className="text-xs text-muted-foreground">Nenhum selecionado = todos os papéis.</p>}
      </div>

      {transacional && (
        <div className="space-y-1.5">
          <Label className="text-xs">Status do pedido que concede pontos</Label>
          <ChipMultiSelect options={STATUS_PEDIDO.map((s) => ({ id: s, nome: s }))} selected={value.statusPedido} onToggle={(id) => toggleIn(value, onChange, "statusPedido", id)} />
        </div>
      )}
    </div>
  );
}

// ── 5. Output ────────────────────────────────────────────────────────────────

function resumoBeneficiario(value: RegraCampos): string {
  if (!value.atribuicaoAtiva) return "O próprio membro que realizou a ação";
  if (value.mecanismoAtribuicao === "mesma_pessoa") return "Geradora e beneficiária (mesma pessoa)";
  if (value.mecanismoAtribuicao === "dividido") return `Dividido — ${value.percentualDivisao}% beneficiária, ${100 - value.percentualDivisao}% geradora`;
  return "Beneficiária (100%)";
}

// Editor da tabela de faixas — usado tanto no Output da Regra quanto no
// Output da Campanha (que só edita os valores, com o eixo já herdado da Regra).
function FaixaBeneficioEditor({ tabela, eixoTipo, onChange }: {
  tabela: FaixaBeneficio[]; eixoTipo: EixoTipo; onChange: (next: FaixaBeneficio[]) => void;
}) {
  function addFaixa() {
    const ultima = tabela[tabela.length - 1];
    onChange([...tabela, { id: novoIdFaixa(), de: ultima ? (ultima.ate ?? ultima.de + 100) : 0, ate: null, valor: 1 }]);
  }
  function updFaixa(id: string, patch: Partial<FaixaBeneficio>) {
    onChange(tabela.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }
  function removerFaixa(id: string) {
    onChange(tabela.filter((f) => f.id !== id));
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Tabela de benefício</Label>
        <button type="button" onClick={addFaixa} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="size-3" />adicionar faixa</button>
      </div>
      {tabela.length === 0 ? (
        <p className="text-xs text-muted-foreground rounded-lg border border-dashed border-border px-3 py-3 text-center">Nenhuma faixa definida — adicione ao menos uma pra gerar benefício.</p>
      ) : (
        <div className="space-y-2">
          {tabela.map((f) => (
            <div key={f.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
              <span className="text-xs text-muted-foreground shrink-0">De</span>
              <Input type="number" className="w-24" value={f.de} onChange={(e) => updFaixa(f.id, { de: Number(e.target.value) || 0 })} />
              <span className="text-xs text-muted-foreground shrink-0">até</span>
              <Input type="number" className="w-24" value={f.ate ?? ""} placeholder="sem teto" onChange={(e) => updFaixa(f.id, { ate: e.target.value ? Number(e.target.value) : null })} />
              <span className="text-xs text-muted-foreground shrink-0">→</span>
              <Input type="number" className="w-24" value={f.valor} onChange={(e) => updFaixa(f.id, { valor: Number(e.target.value) || 0 })} />
              <span className="text-xs text-muted-foreground shrink-0">pt{eixoTipo !== "flat" ? "/unid." : ""}</span>
              <button onClick={() => removerFaixa(f.id)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive shrink-0 ml-auto"><Trash2 className="size-3.5" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function OutputFields({ value, onChange }: Props) {
  const transacional = value.gatilhoTipo !== "evento_nao_transacional";
  const eixosVisiveis: EixoTipo[] = transacional ? EIXOS : ["flat"];

  // Sem transação não há valor/linha/quantidade — trava o eixo em "flat" pra não gerar 0 ponto sem querer.
  useEffect(() => {
    if (!transacional && value.eixoTipo !== "flat") onChange({ eixoTipo: "flat" });
  }, [transacional, value.eixoTipo]);

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold">Output</h4>
        <p className="text-xs text-muted-foreground mt-0.5">O que sai desta regra — beneficiário, eixo e tabela de benefício.</p>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
        <p className="text-xs text-muted-foreground">Beneficiário</p>
        <p className="text-sm font-medium">{resumoBeneficiario(value)}</p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Eixo (base de cálculo)</Label>
        <RadioCards options={eixosVisiveis} labels={EIXO_LABEL} value={value.eixoTipo} name="eixoTipo" onChange={(v) => onChange({ eixoTipo: v })} />
        {!transacional && <p className="text-xs text-muted-foreground">Evento não-transacional não tem valor de compra — o benefício é sempre um valor fixo (flat).</p>}
      </div>

      <FaixaBeneficioEditor tabela={value.tabelaBeneficio} eixoTipo={value.eixoTipo} onChange={(tabelaBeneficio) => onChange({ tabelaBeneficio })} />
    </div>
  );
}

// Output da Campanha — eixo vem herdado da Regra referenciada (só leitura), a
// campanha edita apenas os valores da tabela pro período.
export function TabelaBeneficioFields({ eixoTipo, tabela, onChange }: {
  eixoTipo: EixoTipo; tabela: FaixaBeneficio[]; onChange: (next: FaixaBeneficio[]) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold">Output da campanha</h4>
        <p className="text-xs text-muted-foreground mt-0.5">Eixo herdado da Regra — <strong>{EIXO_LABEL[eixoTipo]}</strong>. Defina só os valores desta campanha.</p>
      </div>
      <FaixaBeneficioEditor tabela={tabela} eixoTipo={eixoTipo} onChange={onChange} />
    </div>
  );
}

// ── 6. Fonte da classe (só transacional) ─────────────────────────────────────

export function FonteClasseFields({ value }: { value: RegraCampos }) {
  const classes = getClassesProduto();
  const classe = value.gatilhoTipo === "compra_classe" ? classes.find((c) => c.id === value.gatilhoClasseId) : undefined;

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold">Fonte da classe</h4>
        <p className="text-xs text-muted-foreground mt-0.5">De onde vem a classificação usada no Gatilho — só relevante pra regras transacionais por classe.</p>
      </div>
      {classe ? (
        <div className="rounded-lg border border-border px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{classe.nome}</p>
            {classe.fonte === "pim" && classe.codigoExterno && <p className="text-xs text-muted-foreground font-mono mt-0.5">{classe.codigoExterno}</p>}
          </div>
          <span className="text-xs font-semibold rounded-full bg-muted px-2.5 py-1">{classe.fonte === "pim" ? "PIM" : "Interno"}</span>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground rounded-lg border border-border px-3 py-2">Não se aplica — o Gatilho desta regra não usa uma Classe de produto.</p>
      )}
    </div>
  );
}

// ── 7. Políticas ─────────────────────────────────────────────────────────────

export function PoliticasFields({ value, onChange }: PoliticasProps) {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold">Políticas</h4>
        <p className="text-xs text-muted-foreground mt-0.5">Timing, estorno, conversão parcial e teto.</p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Timing — quando o benefício libera</Label>
        <div className="grid grid-cols-2 gap-2">
          {([["imediato", "Imediato"], ["dias", "Após N dias"]] as const).map(([v, label]) => (
            <label key={v} className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 cursor-pointer transition-colors ${
              value.timingTipo === v ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
            }`}>
              <input type="radio" name="timingTipo" checked={value.timingTipo === v} onChange={() => onChange({ timingTipo: v })} className="sr-only" />
              <span className="text-sm font-semibold">{label}</span>
            </label>
          ))}
        </div>
        {value.timingTipo === "dias" && (
          <div className="flex items-center gap-2 mt-1.5 w-40">
            <NumberInput value={value.timingDias} onChange={(v) => onChange({ timingDias: v ?? 7 })} min={1} />
            <span className="text-xs text-muted-foreground">dias</span>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Estorno — se a compra for cancelada</Label>
        <div className="space-y-1.5">
          {ESTORNOS.map((v) => (
            <label key={v} className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
              value.estornoPolicy === v ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            }`}>
              <input type="radio" name="estornoPolicy" checked={value.estornoPolicy === v} onChange={() => onChange({ estornoPolicy: v })} className="accent-primary" />
              <span className="text-xs font-medium">{ESTORNO_LABEL[v]}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
        <div>
          <p className="text-xs font-medium">Conversão parcial do saldo</p>
          <p className="text-[11px] text-muted-foreground">Permite resgatar parte do saldo gerado por esta regra, não só o total.</p>
        </div>
        <Switch checked={value.conversaoParcialPermitida} onCheckedChange={(v) => onChange({ conversaoParcialPermitida: v })} size="sm" />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Teto de emissão</Label>
          <Switch checked={value.tetoAtivo} onCheckedChange={(v) => onChange({ tetoAtivo: v })} size="sm" />
        </div>
        {value.tetoAtivo && (
          <div className="flex items-center gap-2 w-40">
            <NumberInput value={value.tetoValor} onChange={(v) => onChange({ tetoValor: v ?? 0 })} min={0} />
            <span className="text-xs text-muted-foreground">pts por membro</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tudo junto — usado quando não há wizard passo a passo ────────────────────

export function RegraFields({ value, onChange }: Props) {
  return (
    <div className="space-y-6">
      <IdentidadeFields value={value} onChange={onChange} />
      <GatilhoFields value={value} onChange={onChange} />
      <AtribuicaoFields value={value} onChange={onChange} />
      <ElegibilidadeFields value={value} onChange={onChange} />
      <OutputFields value={value} onChange={onChange} />
      <FonteClasseFields value={value} />
      <PoliticasFields value={value} onChange={onChange} />
    </div>
  );
}
