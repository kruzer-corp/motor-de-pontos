// Moeda do programa — editável no onboarding, persistida em localStorage.

// Em que o ponto se converte no resgate — define o que aparece pro membro final.
export type TipoResgate = "catalogo" | "cashback" | "ambos";

export const TIPO_RESGATE_LABEL: Record<TipoResgate, string> = {
  catalogo: "Catálogo de produtos",
  cashback: "Cashback (R$)",
  ambos:    "Catálogo + Cashback",
};

const MOEDA_KEY = "motor_pontos_moeda";

function carregarMoeda() {
  try {
    const stored = localStorage.getItem(MOEDA_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export const MOEDA: { nome: string; abrev: string; tipoResgate: TipoResgate } = {
  nome: "Pontos",
  abrev: "pts",
  tipoResgate: "catalogo",
  ...carregarMoeda(),
};

export function saveMoeda(m: { nome: string; abrev: string; tipoResgate: TipoResgate }) {
  MOEDA.nome = m.nome;
  MOEDA.abrev = m.abrev;
  MOEDA.tipoResgate = m.tipoResgate;
  localStorage.setItem(MOEDA_KEY, JSON.stringify(m));
}
