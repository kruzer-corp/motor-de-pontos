// ── Papel de membro — Biblioteca ─────────────────────────────────────────────
// Função do membro no programa (ex: Cliente final, Arquiteto, Vendedor) — uma
// 4ª dimensão do membro, independente de Tier e Segmento. Usado em Atribuição
// e Elegibilidade de uma Regra.

export type PapelMembro = {
  id: string;
  nome: string;
  descricao: string;
};

import { ehV1 } from "./versao";

const KEY = "motor_pontos_papeis_membro";

export function getPapeisMembro(): PapelMembro[] {
  if (ehV1()) return [];
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function savePapeisMembro(papeis: PapelMembro[]) {
  localStorage.setItem(KEY, JSON.stringify(papeis));
}

export function novoIdPapelMembro(): string {
  return `PAPEL-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
