// O que o programa bonifica — decisão do primeiro passo do onboarding, usada
// pra decidir quais telas de cadastro/importação e quais campos da Regra fazem
// sentido mostrar. Multi-seleção: pode ser 1, 2 ou as 3 entidades.
//
// Diferente de membros/produtos/campanhas de teste, a configuração do setup
// (bonifica, método, passos concluídos) NÃO é forçada a vazio na Versão 1 —
// é exatamente o que a Versão 1 existe pra mostrar: o programa configurado,
// só sem dado de transação ainda.

import { getCampanhas } from "./campanhas";

export type BonificaEntidade = "produto" | "pedido" | "cliente";
export type BonificaEscolha = BonificaEntidade[];

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
