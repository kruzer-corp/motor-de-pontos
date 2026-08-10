// Tier de produto — classificação por faixa de preço, mesma lógica do Tier de
// Membro (lib/tiers.ts): você define os limiares uma vez aqui, e o cadastro de
// produto calcula o tier sozinho a partir do preço — não é escolhido na mão.

export type TierProduto = {
  id: string;
  nome: string;
  cor: string;
  descricao: string;
  limiarMin: number;
  limiarMax: number | null; // null = sem teto (tier mais alto)
};

import { ehV1 } from "./versao";

const KEY = "motor_pontos_tiers_produto";

export function getTiersProduto(): TierProduto[] {
  if (ehV1()) return [];
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return [];
    const parsed: Partial<TierProduto>[] = JSON.parse(stored);
    // preenche limiarMin/limiarMax pra quem cadastrou tier antes desse campo existir
    return parsed.map((t) => ({ limiarMin: 0, limiarMax: null, ...t }) as TierProduto);
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

export function ordenarTiersProdutoPorLimiar(tiers: TierProduto[]): TierProduto[] {
  return [...tiers].sort((a, b) => a.limiarMin - b.limiarMin);
}

// Tier calculado a partir do preço — fonte única usada no cadastro de produto,
// pra ninguém escolher tier na mão e desalinhar do valor real.
export function tierProdutoPorPreco(tiers: TierProduto[], preco: number): TierProduto | undefined {
  return ordenarTiersProdutoPorLimiar(tiers).find(
    (t) => preco >= t.limiarMin && (t.limiarMax === null || preco < t.limiarMax)
  );
}
