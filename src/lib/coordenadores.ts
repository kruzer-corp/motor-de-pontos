// ── Coordenador — Gestão de carteira de afiliados ────────────────────────────
// Cada coordenador atende uma ou mais cidades. Uma cidade pertence inteira a
// um único coordenador (sem sobreposição) — usado pra atribuir automaticamente
// um afiliado novo ao coordenador certo, a partir da cidade do endereço dele.

import { ehV1 } from "./versao";

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export type CidadeAtendida = {
  cidade: string;
  uf: string;
};

export type Coordenador = {
  id: string;
  nome: string;
  email: string;
  cidades: CidadeAtendida[];
};

const KEY = "motor_pontos_coordenadores";

function normalizar(v: string): string {
  return v.trim().toLowerCase();
}

function lerCoordenadoresArmazenados(): Coordenador[] {
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Visão do admin — some em "Primeiro acesso" igual ao resto do painel.
export function getCoordenadores(): Coordenador[] {
  if (ehV1()) return [];
  return lerCoordenadoresArmazenados();
}

export function saveCoordenadores(coordenadores: Coordenador[]) {
  localStorage.setItem(KEY, JSON.stringify(coordenadores));
}

// Coordenador "logado" na Visão do coordenador — id fixo, igual ao padrão já
// usado pro membro logado no portal. Independe de "Primeiro acesso" x
// "Programa funcionando": pro coordenador, a carteira dele sempre existe,
// mesmo que o admin ainda não tenha terminado a configuração do programa.
const COORDENADOR_LOGADO_ID = "COORD-001";

export function getCoordenadorLogado(): Coordenador | undefined {
  return lerCoordenadoresArmazenados().find((c) => c.id === COORDENADOR_LOGADO_ID);
}

export function novoIdCoordenador(): string {
  return `COORD-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

// Valida que nenhuma cidade do coordenador já pertence a outro (regra: uma
// cidade inteira é sempre de um único coordenador) antes de gravar.
export function salvarCoordenador(coordenador: Coordenador): { ok: boolean; erro?: string } {
  const existentes = lerCoordenadoresArmazenados();
  for (const cidade of coordenador.cidades) {
    const dono = existentes.find(
      (c) =>
        c.id !== coordenador.id &&
        c.cidades.some((ci) => normalizar(ci.cidade) === normalizar(cidade.cidade) && normalizar(ci.uf) === normalizar(cidade.uf))
    );
    if (dono) return { ok: false, erro: `${cidade.cidade}/${cidade.uf} já pertence a ${dono.nome}.` };
  }
  const jaExiste = existentes.some((c) => c.id === coordenador.id);
  saveCoordenadores(
    jaExiste ? existentes.map((c) => (c.id === coordenador.id ? coordenador : c)) : [...existentes, coordenador]
  );
  return { ok: true };
}

// Cada cidade pertence a um único coordenador — o primeiro match já é o certo.
export function encontrarCoordenadorPorCidade(cidade: string, uf: string): Coordenador | undefined {
  const cidadeNorm = normalizar(cidade);
  const ufNorm = normalizar(uf);
  return lerCoordenadoresArmazenados().find((c) =>
    c.cidades.some((ci) => normalizar(ci.cidade) === cidadeNorm && normalizar(ci.uf) === ufNorm)
  );
}
