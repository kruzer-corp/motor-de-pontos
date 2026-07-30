// ── Grupo de Produtos — agrupamento de produtos incentivados pra vitrine ─────
// Diferente do Conjunto de Produtos (Biblioteca, usado em Gatilho/Elegibilidade
// de Regra), o Grupo de Produtos é sobre como o catálogo é exibido/organizado
// — não afeta cálculo de pontos.

import { ehV1 } from "./versao";

export type GrupoProdutos = {
  id: string;
  nome: string;
  descricao: string;
  produtosIds: string[];
};

const KEY = "motor_pontos_grupos_produtos";

export function getGruposProdutos(): GrupoProdutos[] {
  if (ehV1()) return [];
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveGruposProdutos(grupos: GrupoProdutos[]) {
  localStorage.setItem(KEY, JSON.stringify(grupos));
}

export function novoIdGrupoProdutos(): string {
  return `GRUPO-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
