// Segmento de membro — recurso da Biblioteca, usado no cadastro de membro e na
// Elegibilidade de uma Regra. Começa vazio: só aparece em tela depois de criado.

export type SegmentoMembro = { id: string; nome: string; descricao: string };

import { ehV1 } from "./versao";

const KEY = "motor_pontos_segmentos_membro";

export function getSegmentosMembro(): SegmentoMembro[] {
  if (ehV1()) return [];
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveSegmentosMembro(segmentos: SegmentoMembro[]) {
  localStorage.setItem(KEY, JSON.stringify(segmentos));
}

export function novoIdSegmentoMembro(): string {
  return `SEG-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
