const KEY = "motor_pontos_dimensoes";

export type DimensoesPrograma = {
  tierMembro: boolean;
  tierProduto: boolean;
};

const DEFAULTS: DimensoesPrograma = { tierMembro: true, tierProduto: true };

export function getDimensoes(): DimensoesPrograma {
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function saveDimensoes(d: DimensoesPrograma) {
  localStorage.setItem(KEY, JSON.stringify(d));
}
