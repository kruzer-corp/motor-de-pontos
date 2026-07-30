// Seed "caminho feliz" da Versão completa — aplicado uma única vez na primeira
// vez que alguém escolhe essa versão no VersaoSwitcher. Cobre o mínimo pra
// contar a história: programa configurado, 1 regra de acúmulo, 2 campanhas
// ativas, e os tiers/segmentos que os membros de exemplo (membros.ts) já
// referenciam pelo nome.

import { saveBonificaEscolha, saveOnboardingDone } from "./onboarding";
import { saveTiersMembro, novoIdTierMembro, type TierMembro } from "./tiers";
import { saveSegmentosMembro, novoIdSegmentoMembro, type SegmentoMembro } from "./segmentosMembro";
import { saveRegras, novoIdRegra, novoIdFaixa, DEFAULTS_REGRA, type Regra } from "./regras";
import { saveCampanhas, novoIdCampanha, novoIdMultiplicador, DEFAULTS as DEFAULTS_CAMPANHA, type Campanha } from "./campanhas";

const SEED_KEY = "motor_pontos_v2_seed_aplicado";

export function aplicarSeedV2SeNecessario() {
  if (localStorage.getItem(SEED_KEY)) return;

  saveBonificaEscolha(["produto", "cliente"]);
  saveOnboardingDone(["mecanica", "cadastro", "conversao", "canais", "liberacao", "moeda", "campaign"]);

  const tiers: TierMembro[] = [
    { id: novoIdTierMembro(), nome: "Bronze",   cor: "#B08D57", limiarMin: 0,     limiarMax: 2000,  multiplicador: 1,   beneficios: [] },
    { id: novoIdTierMembro(), nome: "Prata",    cor: "#9CA3AF", limiarMin: 2000,  limiarMax: 6000,  multiplicador: 1.2, beneficios: [] },
    { id: novoIdTierMembro(), nome: "Ouro",     cor: "#D4AF37", limiarMin: 6000,  limiarMax: 12000, multiplicador: 1.5, beneficios: [] },
    { id: novoIdTierMembro(), nome: "Diamante", cor: "#60A5FA", limiarMin: 12000, limiarMax: null,  multiplicador: 2,   beneficios: [] },
  ];
  saveTiersMembro(tiers);
  const tierOuroId = tiers.find((t) => t.nome === "Ouro")!.id;

  const segmentos: SegmentoMembro[] = [
    { id: novoIdSegmentoMembro(), nome: "Básico",       descricao: "Segmento padrão de entrada." },
    { id: novoIdSegmentoMembro(), nome: "Fidelidade",   descricao: "Clientes recorrentes." },
    { id: novoIdSegmentoMembro(), nome: "Frete Grátis", descricao: "Benefício de frete grátis ativo." },
    { id: novoIdSegmentoMembro(), nome: "Premium",      descricao: "Clientes de alto valor." },
  ];
  saveSegmentosMembro(segmentos);

  const regra: Regra = {
    ...DEFAULTS_REGRA,
    id: novoIdRegra(),
    ativa: true,
    nome: "Acúmulo padrão — compra concluída",
    categoriaRegra: "Acúmulo",
    modulo: "Vendas",
    gatilhoTipo: "compra_qualquer",
    eixoTipo: "valor_total",
    tabelaBeneficio: [{ id: novoIdFaixa(), de: 0, ate: null, valor: 1 }],
  };
  saveRegras([regra]);

  const campanhaBoasVindas: Campanha = {
    ...DEFAULTS_CAMPANHA,
    id: novoIdCampanha(),
    status: "ativa",
    color: "bg-emerald-500",
    codigo: "CAMP-BEMVINDO",
    nome: "Boas-vindas — primeira compra",
    descricao: "Pontuação extra na primeira compra de cada novo membro.",
    gatilhoTipo: "primeira_compra",
    pontosBase: 100,
    periodoInicio: "01/07/2026",
    periodoFim: "31/12/2026",
  };

  const campanhaEletro: Campanha = {
    ...DEFAULTS_CAMPANHA,
    id: novoIdCampanha(),
    status: "ativa",
    color: "bg-indigo-500",
    codigo: "CAMP-ELETRO",
    nome: "Eletrônicos em dobro",
    descricao: "Dobra os pontos em compras de produtos eletrônicos, com bônus extra pro tier Ouro.",
    gatilhoTipo: "compra_qualquer",
    pontosBase: 10,
    multiplicadores: [
      { id: novoIdMultiplicador(), tipo: "categoria", alvoId: "Eletrônicos", fator: 2 },
      { id: novoIdMultiplicador(), tipo: "tier", alvoId: tierOuroId, fator: 1.5 },
    ],
    periodoInicio: "01/07/2026",
    periodoFim: "31/12/2026",
  };

  saveCampanhas([campanhaBoasVindas, campanhaEletro]);

  localStorage.setItem(SEED_KEY, "true");
}
