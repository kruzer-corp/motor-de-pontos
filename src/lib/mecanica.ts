// ── Mecânica do Programa — fonte única das regras de acúmulo e resgate ───────
// Campanhas nunca definem taxa, multiplicador ou aprovação de resgate — só elegibilidade.
// Exceção: campanhas por evento (cadastro, aniversário etc.) têm seu próprio valor fixo de bônus.

export type MecanicaConfig = {
  pontosPorReal: number;
  arredondamento: "baixo" | "cima" | "proximo";
  multBronze: number; multPrata: number; multOuro: number; multDiamante: number;
  expiracaoAtiva: boolean;
  expiracaoTipo: "inatividade" | "emissao" | "aniversario";
  expiracaoMeses: number;
  resgateSaldoMinimo: number;
  resgatePrazoEntrega: number;
  resgateTipoValor: "parcial" | "total";
  resgateLimiteAtivo: boolean;
  resgateLimiteQtd: number;
  resgateLimiteEscopo: "mes" | "ano" | "ilimitado";
  tiposResgateHabilitados: string[];
  aprovacaoTipo: "manual" | "automatica";
  aprovacaoValorMax: string;
  aprovacaoTiers: string[];
};

export const DEFAULTS_MECANICA: MecanicaConfig = {
  pontosPorReal: 1,
  arredondamento: "baixo",
  multBronze: 1, multPrata: 1.25, multOuro: 1.5, multDiamante: 2,
  expiracaoAtiva: true,
  expiracaoTipo: "inatividade",
  expiracaoMeses: 12,
  resgateSaldoMinimo: 500,
  resgatePrazoEntrega: 5,
  resgateTipoValor: "parcial",
  resgateLimiteAtivo: false,
  resgateLimiteQtd: 1,
  resgateLimiteEscopo: "mes",
  tiposResgateHabilitados: ["produto_fisico", "voucher_digital", "credito_conta"],
  aprovacaoTipo: "automatica",
  aprovacaoValorMax: "",
  aprovacaoTiers: ["Bronze", "Prata", "Ouro", "Diamante"],
};

const KEY = "motor_pontos_mecanica";

export function getMecanica(): MecanicaConfig {
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return DEFAULTS_MECANICA;
    return { ...DEFAULTS_MECANICA, ...JSON.parse(stored) };
  } catch {
    return DEFAULTS_MECANICA;
  }
}

export function saveMecanica(config: MecanicaConfig) {
  localStorage.setItem(KEY, JSON.stringify(config));
}
