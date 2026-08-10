// Seed "caminho feliz" da Versão completa — aplicado uma única vez na primeira
// vez que alguém escolhe essa versão no VersaoSwitcher. Cobre o mínimo pra
// contar a história: programa configurado, 1 regra de acúmulo, 2 campanhas
// ativas, e os tiers/segmentos que os membros de exemplo (membros.ts) já
// referenciam pelo nome.

import { saveBonificaEscolha, saveOnboardingDone } from "./onboarding";
import { saveTiersMembro, novoIdTierMembro, type TierMembro } from "./tiers";
import { saveSegmentosMembro, novoIdSegmentoMembro, type SegmentoMembro } from "./segmentosMembro";
import { savePapeisMembro, novoIdPapelMembro, type PapelMembro } from "./papeisMembro";
import { saveRegras, novoIdRegra, novoIdFaixa, DEFAULTS_REGRA, type Regra } from "./regras";
import { saveCampanhas, novoIdCampanha, novoIdMultiplicador, DEFAULTS as DEFAULTS_CAMPANHA, type Campanha } from "./campanhas";
import { saveCoordenadores, novoIdCoordenador, type Coordenador } from "./coordenadores";
import { saveAfiliados, type Afiliado } from "./afiliados";
import { novoIdProdutoResgate, type ProdutoResgate } from "./campanhas";

// v3: Resgate deixou de ser uma tela separada (Catálogo de Resgate) e virou
// parte da própria campanha "Fidelidade Premium" — muda a chave pra reaplicar
// em quem já tinha o seed antigo, sem produto resgatável na campanha.
const SEED_KEY = "motor_pontos_v2_seed_aplicado_v3";

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
  const tierDiamanteId = tiers.find((t) => t.nome === "Diamante")!.id;

  const segmentos: SegmentoMembro[] = [
    { id: novoIdSegmentoMembro(), nome: "Básico",       descricao: "Segmento padrão de entrada." },
    { id: novoIdSegmentoMembro(), nome: "Fidelidade",   descricao: "Clientes recorrentes." },
    { id: novoIdSegmentoMembro(), nome: "Frete Grátis", descricao: "Benefício de frete grátis ativo." },
    { id: novoIdSegmentoMembro(), nome: "Premium",      descricao: "Clientes de alto valor." },
  ];
  saveSegmentosMembro(segmentos);
  const segmentoPremiumId = segmentos.find((s) => s.nome === "Premium")!.id;

  const papeis: PapelMembro[] = [
    { id: novoIdPapelMembro(), nome: "Vendedor Interno", descricao: "Faz a indicação — recebe parte da comissão." },
    { id: novoIdPapelMembro(), nome: "Cliente Final",    descricao: "Recebe a indicação — beneficiário principal." },
  ];
  savePapeisMembro(papeis);
  const papelVendedorId = papeis.find((p) => p.nome === "Vendedor Interno")!.id;
  const papelClienteId = papeis.find((p) => p.nome === "Cliente Final")!.id;

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

  const campanhaFidelidadePremium: Campanha = {
    ...DEFAULTS_CAMPANHA,
    id: novoIdCampanha(),
    status: "ativa",
    color: "bg-rose-500",
    codigo: "CAMP-FIDELIDADE-PREMIUM",
    nome: "Fidelidade Premium",
    descricao: "Campanha completa de exemplo — indicação com comissão dividida, elegibilidade por canal/segmento/tier, multiplicador, expiração, limite mensal e estorno proporcional.",
    gatilhoTipo: "compra_qualquer",

    atribuicaoAtiva: true,
    papelGeradoraId: papelVendedorId,
    papelBeneficiariaId: papelClienteId,
    mecanismoAtribuicao: "dividido",
    percentualDivisao: 30,

    valorMinimo: "150",
    canais: ["ecommerce", "portal"],
    segmentos: [segmentoPremiumId],
    tiers: [tierOuroId, tierDiamanteId],
    statusPedido: ["Concluído", "Entregue"],

    periodoInicio: "01/07/2026",
    periodoFim: "31/12/2026",

    pontosBase: 20,
    multiplicadores: [
      { id: novoIdMultiplicador(), tipo: "tier", alvoId: tierDiamanteId, fator: 2 },
      { id: novoIdMultiplicador(), tipo: "segmento", alvoId: segmentoPremiumId, fator: 1.5 },
    ],

    expiracaoTipo: "dias_sem_movimentacao",
    expiracaoDias: 180,

    limiteAtivo: true,
    limiteEscopo: "periodo",
    limiteValor: 3000,
    limitePeriodoGranularidade: "mes",

    timingTipo: "dias",
    timingDias: 7,
    estornoPolicy: "estornar_proporcional",
    conversaoParcialPermitida: false,

    // Resgate — produtos do catálogo (lib/produtos.ts, SEED) que essa campanha
    // libera pra resgate, com tier elegível e limite por membro.
    resgateAtivo: true,
    resgateTiersElegiveis: [tierOuroId, tierDiamanteId],
    resgateSaldoMinimo: "0",
    resgateLimitePorMembro: "3",
    resgateLimiteEscopo: "mes",
    resgateProdutos: [
      { id: novoIdProdutoResgate(), produtoId: "SKU-001", pontos: 45000, popular: true,  visivelNoPortal: true  }, // Smart TV 50"
      { id: novoIdProdutoResgate(), produtoId: "SKU-003", pontos: 8500,  popular: true,  visivelNoPortal: true  }, // Fone Bluetooth
      { id: novoIdProdutoResgate(), produtoId: "SKU-002", pontos: 18000, popular: true,  visivelNoPortal: true  }, // Air Fryer XL
      { id: novoIdProdutoResgate(), produtoId: "SKU-006", pontos: 9500,  popular: false, visivelNoPortal: false }, // Cafeteira Premium
      { id: novoIdProdutoResgate(), produtoId: "SKU-005", pontos: 22000, popular: false, visivelNoPortal: true  }, // Tênis Running
      { id: novoIdProdutoResgate(), produtoId: "SKU-007", pontos: 14000, popular: false, visivelNoPortal: false }, // Mochila Executiva
      { id: novoIdProdutoResgate(), produtoId: "SKU-009", pontos: 10000, popular: false, visivelNoPortal: true  }, // Voucher R$100
    ] as ProdutoResgate[],
  };

  saveCampanhas([campanhaBoasVindas, campanhaEletro, campanhaFidelidadePremium]);

  seedCarteiraAfiliadosSeNecessario();

  localStorage.setItem(SEED_KEY, "true");
}

// v4: mais exemplos na carteira do Marcos (lista mais cheia + um "Pendente
// (D+1)" antigo) — muda a chave pra reaplicar o seed em quem já tinha a
// carteira anterior.
const SEED_CARTEIRA_KEY = "motor_pontos_carteira_seed_aplicado_v4";

// Guard própria (em vez de depender do SEED_KEY geral) — assim quem já tinha
// ativado a Versão completa antes dessa funcionalidade existir também recebe
// os coordenadores/afiliados na próxima vez que abrir a Carteira, sem
// precisar resetar o primeiro acesso inteiro.
export function seedCarteiraAfiliadosSeNecessario() {
  if (localStorage.getItem(SEED_CARTEIRA_KEY)) return;

  // Coordenadores por região e uma base já em andamento (afiliados antigos
  // já aprovados + alguns novos aguardando contato), pra não abrir vazio.
  const coordMarcos: Coordenador = {
    id: "COORD-001", nome: "Marcos Teixeira", email: "marcos@fastpro.com.br",
    cidades: [{ cidade: "São Paulo", uf: "SP" }, { cidade: "Campinas", uf: "SP" }],
  };
  const coordFernanda: Coordenador = {
    id: novoIdCoordenador(), nome: "Fernanda Gomes", email: "fernanda@fastpro.com.br",
    cidades: [{ cidade: "Rio de Janeiro", uf: "RJ" }, { cidade: "Niterói", uf: "RJ" }],
  };
  const coordJoao: Coordenador = {
    id: novoIdCoordenador(), nome: "João Ferreira", email: "joao@fastpro.com.br",
    cidades: [{ cidade: "Belo Horizonte", uf: "MG" }],
  };
  saveCoordenadores([coordMarcos, coordFernanda, coordJoao]);

  const afiliadoBase = {
    ganCode: null, reprovadoEm: null, motivoReprovacao: null,
  };

  const afiliados: Afiliado[] = [
    // Antigos — já aprovados há um tempo
    { ...afiliadoBase, id: "AFI-001", nome: "Rafael Lima", email: "rafael.lima@exemplo.com", cidade: "São Paulo", uf: "SP", coordenadorId: coordMarcos.id, tipo: "arquiteto", status: "aprovado", criadoEm: "2026-04-02T10:00:00.000Z", contactadoEm: "2026-04-03T14:00:00.000Z", aprovadoEm: "2026-04-05T09:00:00.000Z" },
    { ...afiliadoBase, id: "AFI-002", nome: "Paula Souza", email: "paula.souza@exemplo.com", cidade: "Campinas", uf: "SP", coordenadorId: coordMarcos.id, tipo: "integrador", status: "aprovado", criadoEm: "2026-04-10T10:00:00.000Z", contactadoEm: "2026-04-11T11:00:00.000Z", aprovadoEm: "2026-04-12T16:00:00.000Z" },
    { ...afiliadoBase, id: "AFI-003", nome: "Carlos Andrade", email: "carlos.andrade@exemplo.com", cidade: "Rio de Janeiro", uf: "RJ", coordenadorId: coordFernanda.id, tipo: "planejador", status: "aprovado", criadoEm: "2026-03-20T10:00:00.000Z", contactadoEm: "2026-03-21T09:30:00.000Z", aprovadoEm: "2026-03-22T15:00:00.000Z" },
    { ...afiliadoBase, id: "AFI-004", nome: "Beatriz Nogueira", email: "beatriz.nogueira@exemplo.com", cidade: "Niterói", uf: "RJ", coordenadorId: coordFernanda.id, tipo: "engenheiro", status: "aprovado", criadoEm: "2026-05-02T10:00:00.000Z", contactadoEm: "2026-05-03T13:00:00.000Z", aprovadoEm: "2026-05-04T10:00:00.000Z" },
    { ...afiliadoBase, id: "AFI-005", nome: "Diego Martins", email: "diego.martins@exemplo.com", cidade: "Belo Horizonte", uf: "MG", coordenadorId: coordJoao.id, tipo: "arquiteto", status: "aprovado", criadoEm: "2026-04-25T10:00:00.000Z", contactadoEm: "2026-04-26T09:00:00.000Z", aprovadoEm: "2026-04-27T14:30:00.000Z" },
    // Novos — chegaram agora, ainda não contactados (aparecem com destaque)
    { ...afiliadoBase, id: "AFI-006", nome: "Juliana Ramos", email: "juliana.ramos@exemplo.com", cidade: "São Paulo", uf: "SP", coordenadorId: coordMarcos.id, tipo: null, status: "pendente", criadoEm: "2026-07-20T10:00:00.000Z", contactadoEm: null, aprovadoEm: null },
    { ...afiliadoBase, id: "AFI-007", nome: "Eduardo Pires", email: "eduardo.pires@exemplo.com", cidade: "Rio de Janeiro", uf: "RJ", coordenadorId: coordFernanda.id, tipo: null, status: "pendente", criadoEm: "2026-07-22T10:00:00.000Z", contactadoEm: null, aprovadoEm: null },
    // Já contactada, mas ainda aguardando validação pra aprovar/reprovar
    { ...afiliadoBase, id: "AFI-008", nome: "Camila Duarte", email: "camila.duarte@exemplo.com", cidade: "Belo Horizonte", uf: "MG", coordenadorId: coordJoao.id, tipo: null, status: "pendente", criadoEm: "2026-07-15T10:00:00.000Z", contactadoEm: "2026-07-16T11:00:00.000Z", aprovadoEm: null },
    { ...afiliadoBase, id: "AFI-010", nome: "Lucas Ferreira", email: "lucas.ferreira@exemplo.com", cidade: "São Paulo", uf: "SP", coordenadorId: coordMarcos.id, tipo: null, status: "pendente", criadoEm: "2026-07-17T10:00:00.000Z", contactadoEm: "2026-07-18T09:00:00.000Z", aprovadoEm: null },
    // Pendente há bastante tempo, ainda sem perfil — ilustra um caso parado
    { ...afiliadoBase, id: "AFI-011", nome: "Renata Cardoso", email: "renata.cardoso@exemplo.com", cidade: "São Paulo", uf: "SP", coordenadorId: coordMarcos.id, tipo: null, status: "pendente", criadoEm: "2026-07-05T10:00:00.000Z", contactadoEm: "2026-07-06T11:00:00.000Z", aprovadoEm: null },
    // Mais exemplos pra encorpar a carteira do Marcos
    { ...afiliadoBase, id: "AFI-012", nome: "Bruno Castro", email: "bruno.castro@exemplo.com", cidade: "Campinas", uf: "SP", coordenadorId: coordMarcos.id, tipo: "planejador", status: "aprovado", criadoEm: "2026-06-10T10:00:00.000Z", contactadoEm: "2026-06-11T09:00:00.000Z", aprovadoEm: "2026-06-12T14:00:00.000Z" },
    { ...afiliadoBase, id: "AFI-013", nome: "Fernanda Lopes", email: "fernanda.lopes@exemplo.com", cidade: "São Paulo", uf: "SP", coordenadorId: coordMarcos.id, tipo: null, status: "pendente", criadoEm: "2026-08-08T10:00:00.000Z", contactadoEm: null, aprovadoEm: null },
    { ...afiliadoBase, id: "AFI-014", nome: "Marcelo Tavares", email: "marcelo.tavares@exemplo.com", cidade: "Campinas", uf: "SP", coordenadorId: coordMarcos.id, tipo: "engenheiro", status: "aprovado", criadoEm: "2026-05-15T10:00:00.000Z", contactadoEm: "2026-05-16T09:00:00.000Z", aprovadoEm: "2026-05-17T10:00:00.000Z" },
    // Sem coordenador — cidade sem cobertura ainda, precisa atribuir na mão
    { ...afiliadoBase, id: "AFI-009", nome: "Thiago Alves", email: "thiago.alves@exemplo.com", cidade: "Salvador", uf: "BA", coordenadorId: null, tipo: null, status: "pendente", criadoEm: "2026-07-18T10:00:00.000Z", contactadoEm: null, aprovadoEm: null },
  ];
  saveAfiliados(afiliados);

  localStorage.setItem(SEED_CARTEIRA_KEY, "true");
}
