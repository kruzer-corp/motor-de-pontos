// O que o programa bonifica — decisão do primeiro passo do onboarding, usada
// pra decidir quais telas de cadastro/importação e quais campos da Regra fazem
// sentido mostrar. Multi-seleção: pode ser 1, 2 ou as 3 entidades.
//
// Diferente de membros/produtos/campanhas de teste, a configuração do setup
// (bonifica, método, passos concluídos) NÃO é forçada a vazio na Versão 1 —
// é exatamente o que a Versão 1 existe pra mostrar: o programa configurado,
// só sem dado de transação ainda.

import { getCampanhas } from "./campanhas";
import type { GatilhoTipo } from "./regras";

export type BonificaEntidade = "produto" | "pedido" | "cliente";
export type BonificaEscolha = BonificaEntidade[];

export const BONIFICA_OPCOES: { value: BonificaEntidade; label: string; desc: string }[] = [
  { value: "produto", label: "Produto",  desc: "Pontua a compra de um produto ou conjunto/classe específico." },
  { value: "pedido",  label: "Pedido",   desc: "Pontua a compra em geral — qualquer pedido, sem exigir produto específico." },
  { value: "cliente", label: "Cliente",  desc: "Pontua por comportamento — cadastro, indicação, recorrência." },
];

// Gatilhos relevantes por entidade de bonifica — fonte única, usada tanto pro
// wizard de Regra (filtra as opções de Gatilho pela união das entidades
// marcadas) quanto pro aviso na Mecânica do Programa (ao desmarcar uma
// entidade, avisa se já existe regra com gatilho daquele tipo).
export const GATILHOS_POR_ENTIDADE: Record<BonificaEntidade, GatilhoTipo[]> = {
  produto: ["compra_conjunto", "compra_classe"],
  pedido:  ["compra_qualquer", "primeira_compra", "marco_recorrencia"],
  cliente: ["marco_recorrencia", "evento_nao_transacional"],
};

// Entidades de bonifica associadas a um tipo de Gatilho — inverso de
// GATILHOS_POR_ENTIDADE. Um gatilho pode pertencer a mais de uma entidade
// (ex: marco de recorrência conta pra Pedido e pra Cliente).
export function entidadesDoGatilho(tipo: GatilhoTipo): BonificaEntidade[] {
  return (Object.keys(GATILHOS_POR_ENTIDADE) as BonificaEntidade[]).filter(
    (e) => GATILHOS_POR_ENTIDADE[e].includes(tipo)
  );
}

const BONIFICA_KEY = "motor_pontos_bonifica_escolha";

export function getBonificaEscolha(): BonificaEscolha {
  try {
    const stored = localStorage.getItem(BONIFICA_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveBonificaEscolha(v: BonificaEscolha) {
  localStorage.setItem(BONIFICA_KEY, JSON.stringify(v));
}

// Como o cliente quer trazer a base (membros/produtos) — passo "Cadastre e importe".
export type MetodoBase = "planilha" | "manual" | "integracao";

const METODO_BASE_KEY = "motor_pontos_metodo_base";

export function getMetodoBase(): MetodoBase | null {
  try {
    return (localStorage.getItem(METODO_BASE_KEY) as MetodoBase) || null;
  } catch {
    return null;
  }
}

export function saveMetodoBase(v: MetodoBase) {
  localStorage.setItem(METODO_BASE_KEY, v);
}

const ONBOARDING_KEY = "motor_pontos_onboarding_done";

export function getOnboardingDone(): string[] {
  try {
    return JSON.parse(localStorage.getItem(ONBOARDING_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveOnboardingDone(ids: string[]) {
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(ids));
}

export function marcarOnboardingFeito(id: string) {
  const atual = getOnboardingDone();
  if (atual.includes(id)) return;
  saveOnboardingDone([...atual, id]);
}

// Sinal mínimo de "programa configurado" — usado pelo guard de rotas do admin
// (RequireVersaoCompleta) pra liberar a navegação na Versão 1: decidiu o que
// bonifica e já criou pelo menos uma campanha. Os demais passos (conversão,
// liberação, moeda, canais) têm valor padrão e não bloqueiam o uso do painel.
export function onboardingCompleto(): boolean {
  return getBonificaEscolha().length > 0 && getCampanhas().length > 0;
}
