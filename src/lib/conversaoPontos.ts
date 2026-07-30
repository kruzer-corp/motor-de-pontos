// ── Conversão de pontos — valor monetário de 1 ponto ─────────────────────────
// Usado pra calcular liability (passivo financeiro) e, futuramente, resgate.
// É uma configuração permanente do programa, sem data — por isso mora junto
// da Mecânica, mas fora do conceito de Regra (não é acúmulo nem gatilho).

export type ConversaoConfig = {
  valorPorPonto: number; // R$ que 1 ponto representa
};

const DEFAULTS_CONVERSAO: ConversaoConfig = {
  valorPorPonto: 0.01,
};

const KEY = "motor_pontos_conversao";

export function getConversao(): ConversaoConfig {
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return DEFAULTS_CONVERSAO;
    return { ...DEFAULTS_CONVERSAO, ...JSON.parse(stored) };
  } catch {
    return DEFAULTS_CONVERSAO;
  }
}

export function saveConversao(c: ConversaoConfig) {
  localStorage.setItem(KEY, JSON.stringify(c));
}
