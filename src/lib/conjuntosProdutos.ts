// ── Conjunto de produtos — Biblioteca ────────────────────────────────────────
// Lista de produtos escolhidos à mão, reutilizável entre Regras (Gatilho e
// Elegibilidade referenciam o mesmo conjunto em vez de listas soltas).
// Só faz sentido pra Regras transacionais (baseadas em compra).

export type ConjuntoProdutos = {
  id: string;
  nome: string;
  descricao: string;
  produtosIds: string[];
};

import { ehV1 } from "./versao";

const KEY = "motor_pontos_conjuntos_produtos";

export function getConjuntosProdutos(): ConjuntoProdutos[] {
  if (ehV1()) return [];
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveConjuntosProdutos(conjuntos: ConjuntoProdutos[]) {
  localStorage.setItem(KEY, JSON.stringify(conjuntos));
}

export function novoIdConjuntoProdutos(): string {
  return `CONJ-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
