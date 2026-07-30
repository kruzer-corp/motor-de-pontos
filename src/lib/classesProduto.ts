// ── Classe de produto — Biblioteca ───────────────────────────────────────────
// Taxonomia de produtos (ex: Eletrônicos, Beleza), com origem declarada —
// mapeada de um PIM externo ou definida internamente. Substitui a lista fixa
// de categorias por um recurso reutilizável e editável.

export type FonteClasse = "pim" | "interno";

export type ClasseProduto = {
  id: string;
  nome: string;
  fonte: FonteClasse;
  codigoExterno?: string; // preenchido quando fonte === "pim"
};

// Seed a partir das categorias que já existiam em produtos.ts — evita quebrar
// produtos já cadastrados, que referenciam essas categorias pelo nome.
const SEED: ClasseProduto[] = [
  "Eletrônicos", "Eletrodomésticos", "Beleza", "Esportes", "Livros", "Acessórios", "Logística", "Voucher", "Desconto",
].map((nome, i) => ({ id: `classe-${i + 1}`, nome, fonte: "interno" as FonteClasse }));

import { ehV1 } from "./versao";

const KEY = "motor_pontos_classes_produto";

export function getClassesProduto(): ClasseProduto[] {
  if (ehV1()) return [];
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return SEED;
    const parsed: ClasseProduto[] = JSON.parse(stored);
    return parsed.length > 0 ? parsed : SEED;
  } catch {
    return SEED;
  }
}

export function saveClassesProduto(classes: ClasseProduto[]) {
  localStorage.setItem(KEY, JSON.stringify(classes));
}

export function novoIdClasseProduto(): string {
  return `CLASSE-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
