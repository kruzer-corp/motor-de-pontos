// Liberação — padrão global de quando o crédito fica disponível pro membro.
// Toda Regra nova herda esse padrão em timingTipo/timingDias, mas pode
// sobrescrever individualmente em Políticas.

export type LiberacaoConfig = {
  timingTipo: "imediato" | "dias";
  timingDias: number;
};

const DEFAULTS_LIBERACAO: LiberacaoConfig = {
  timingTipo: "imediato",
  timingDias: 7,
};

const KEY = "motor_pontos_liberacao";

export function getLiberacao(): LiberacaoConfig {
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return DEFAULTS_LIBERACAO;
    return { ...DEFAULTS_LIBERACAO, ...JSON.parse(stored) };
  } catch {
    return DEFAULTS_LIBERACAO;
  }
}

export function saveLiberacao(c: LiberacaoConfig) {
  localStorage.setItem(KEY, JSON.stringify(c));
}
