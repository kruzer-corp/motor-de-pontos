// Versão de demonstração ativa — controla se as telas do admin mostram dado
// vazio (primeiro acesso) ou o seed de exemplo (versão completa). Lido pelo
// VersaoSwitcher e pelas funções getX() de cada módulo.

export type Versao = "v1" | "v2";

const KEY = "motor_pontos_versao";

export function getVersao(): Versao {
  try {
    return localStorage.getItem(KEY) === "v2" ? "v2" : "v1";
  } catch {
    return "v1";
  }
}

export function saveVersao(v: Versao) {
  localStorage.setItem(KEY, v);
}

export function ehV1(): boolean {
  return getVersao() === "v1";
}

// Chaves de setup/config que NÃO são forçadas a vazio na V1 (mostram o output
// real do onboarding). Resetar essas chaves é o único jeito de garantir um
// "primeiro acesso" genuinamente do zero, já que dado antigo de outras sessões
// de teste continua valendo pra elas.
const CHAVES_SETUP = [
  "motor_pontos_bonifica_escolha",
  "motor_pontos_metodo_base",
  "motor_pontos_onboarding_done",
  "motor_pontos_conversao",
  "motor_pontos_liberacao",
  "motor_pontos_regras",
  "motor_pontos_campanhas",
  "motor_pontos_moeda",
  "motor_pontos_produtos",
  "motor_pontos_grupos_produtos",
  "motor_pontos_coordenadores",
  "motor_pontos_afiliados",
  "motor_pontos_carteira_seed_aplicado_v2",
];

export function resetarPrimeiroAcesso() {
  for (const chave of CHAVES_SETUP) localStorage.removeItem(chave);
}
