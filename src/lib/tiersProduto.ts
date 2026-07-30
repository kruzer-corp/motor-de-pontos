// Tier de produto — classificação/agrupamento de produtos, sem cálculo próprio.
// Recurso da Biblioteca: usado no cadastro de produto e na Elegibilidade de uma Regra.

export type TierProduto = { id: string; nome: string; cor: string; descricao: string };

import { ehV1 } from "./versao";

const KEY = "motor_pontos_tiers_produto";

export function getTiersProduto(): TierProduto[] {
  if (ehV1()) return [];
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveTiersProduto(tiers: TierProduto[]) {
  localStorage.setItem(KEY, JSON.stringify(tiers));
}

export function novoIdTierProduto(): string {
  return `TPROD-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
