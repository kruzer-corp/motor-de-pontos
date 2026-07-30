// ── Tiers de membro — fonte única, real e persistida ─────────────────────────
// Usada no cadastro/edição de membro (Extrato, Onboarding), na progressão
// (MembroDetalhe) e nas Condições de Regra (Mecânica/Campanha).

export type TierMembro = {
  id: string;
  nome: string;
  cor: string; // hex — usado em dots/badges
  limiarMin: number;
  limiarMax: number | null; // null = sem teto (tier mais alto)
  multiplicador: number;
  beneficios: string[];
};

// Começa vazio de propósito — o analista define os tiers do zero.
const SEED: TierMembro[] = [];

import { ehV1 } from "./versao";

const KEY = "motor_pontos_tiers_membro";

export function getTiersMembro(): TierMembro[] {
  if (ehV1()) return [];
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return SEED;
    const parsed: TierMembro[] = JSON.parse(stored);
    return parsed.length > 0 ? parsed : SEED;
  } catch {
    return SEED;
  }
}

export function saveTiersMembro(tiers: TierMembro[]) {
  localStorage.setItem(KEY, JSON.stringify(tiers));
}

export function ordenarPorLimiar(tiers: TierMembro[]): TierMembro[] {
  return [...tiers].sort((a, b) => a.limiarMin - b.limiarMin);
}

// Próximo tier na progressão (pelo limiar), ou null se já é o mais alto.
export function proximoTier(tiers: TierMembro[], tierAtualNome: string): TierMembro | null {
  const ordenados = ordenarPorLimiar(tiers);
  const idx = ordenados.findIndex((t) => t.nome === tierAtualNome);
  if (idx === -1 || idx === ordenados.length - 1) return null;
  return ordenados[idx + 1];
}

export function novoIdTierMembro(): string {
  return `TIERM-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
