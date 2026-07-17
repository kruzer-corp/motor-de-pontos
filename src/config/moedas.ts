const KEY = "motor_pontos_moedas";

export type Moeda = {
  id: string; nome: string; simbolo: string; taxa: string; ativo: boolean; base?: boolean;
};

const DEFAULTS: Moeda[] = [
  { id: "pontos",   nome: "Pontos",   simbolo: "pts", taxa: "1", ativo: true,  base: true },
  { id: "cashback", nome: "Cashback", simbolo: "R$",  taxa: "", ativo: false },
  { id: "milhas",   nome: "Milhas",   simbolo: "mi",  taxa: "", ativo: false },
  { id: "creditos", nome: "Créditos", simbolo: "cr",  taxa: "", ativo: false },
];

export function getMoedas(): Moeda[] {
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function saveMoedas(moedas: Moeda[]) {
  localStorage.setItem(KEY, JSON.stringify(moedas));
}

export function getMoedasAtivas(): Moeda[] {
  return getMoedas().filter((m) => m.ativo);
}
