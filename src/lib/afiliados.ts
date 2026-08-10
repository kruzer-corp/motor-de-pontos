// ── Afiliado — participante do programa gerido por um Coordenador ───────────
// Afiliado nunca acessa o painel admin (perfil próprio: arquiteto, integrador,
// planejador, engenheiro). Ele chega por um formulário externo, fora deste
// sistema, já com endereço, e é atribuído automaticamente ao coordenador da
// cidade dele. O tipo só é definido no momento da aprovação — é ele que
// define o regulamento e os benefícios (comissionamento) daquele afiliado.

import { ehV1 } from "./versao";
import { encontrarCoordenadorPorCidade } from "./coordenadores";

export type AfiliadoTipo = "arquiteto" | "integrador" | "planejador" | "engenheiro";

export type AfiliadoStatus = "pendente" | "aprovado" | "reprovado";

export type Afiliado = {
  id: string;
  nome: string;
  email: string;
  cidade: string;
  uf: string;
  coordenadorId: string | null;
  tipo: AfiliadoTipo | null;
  ganCode: string | null;
  status: AfiliadoStatus;
  criadoEm: string;
  contactadoEm: string | null;
  aprovadoEm: string | null;
  reprovadoEm: string | null;
  motivoReprovacao: string | null;
};

const KEY = "motor_pontos_afiliados";

function lerAfiliadosArmazenados(): Afiliado[] {
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Visão do admin — some em "Primeiro acesso" igual ao resto do painel.
export function getAfiliados(): Afiliado[] {
  if (ehV1()) return [];
  return lerAfiliadosArmazenados();
}

// Visão do coordenador — independe de "Primeiro acesso" x "Programa
// funcionando", igual ao coordenador logado: a carteira dele é dele, não do
// estágio de configuração do admin.
export function getAfiliadosDaCarteiraDoCoordenador(coordenadorId: string): Afiliado[] {
  return lerAfiliadosArmazenados().filter((a) => a.coordenadorId === coordenadorId);
}

export function saveAfiliados(afiliados: Afiliado[]) {
  localStorage.setItem(KEY, JSON.stringify(afiliados));
}

function novoIdAfiliado(): string {
  return `AFI-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

// Simula a chegada de um cadastro pelo formulário externo (fora deste
// sistema) — já entra atribuído ao coordenador da cidade dele, se existir um.
export function simularNovoAfiliado(dados: { nome: string; email: string; cidade: string; uf: string }): Afiliado {
  const coordenador = encontrarCoordenadorPorCidade(dados.cidade, dados.uf);
  const afiliado: Afiliado = {
    id: novoIdAfiliado(),
    nome: dados.nome,
    email: dados.email,
    cidade: dados.cidade,
    uf: dados.uf,
    coordenadorId: coordenador?.id ?? null,
    tipo: null,
    ganCode: null,
    status: "pendente",
    criadoEm: new Date().toISOString(),
    contactadoEm: null,
    aprovadoEm: null,
    reprovadoEm: null,
    motivoReprovacao: null,
  };
  saveAfiliados([...lerAfiliadosArmazenados(), afiliado]);
  return afiliado;
}

export function marcarContactado(afiliadoId: string) {
  saveAfiliados(
    lerAfiliadosArmazenados().map((a) => (a.id === afiliadoId ? { ...a, contactadoEm: new Date().toISOString() } : a))
  );
}

export function aprovarAfiliado(afiliadoId: string, tipo: AfiliadoTipo): { ok: boolean; erro?: string } {
  const afiliados = lerAfiliadosArmazenados();
  const afiliado = afiliados.find((a) => a.id === afiliadoId);
  if (!afiliado) return { ok: false, erro: "Afiliado não encontrado." };
  if (afiliado.status !== "pendente") return { ok: false, erro: "Esse afiliado já foi avaliado." };
  saveAfiliados(
    afiliados.map((a) =>
      a.id === afiliadoId ? { ...a, status: "aprovado" as const, tipo, aprovadoEm: new Date().toISOString() } : a
    )
  );
  return { ok: true };
}

export function reprovarAfiliado(afiliadoId: string, motivo: string): { ok: boolean; erro?: string } {
  const afiliados = lerAfiliadosArmazenados();
  const afiliado = afiliados.find((a) => a.id === afiliadoId);
  if (!afiliado) return { ok: false, erro: "Afiliado não encontrado." };
  if (afiliado.status !== "pendente") return { ok: false, erro: "Esse afiliado já foi avaliado." };
  saveAfiliados(
    afiliados.map((a) =>
      a.id === afiliadoId
        ? { ...a, status: "reprovado" as const, reprovadoEm: new Date().toISOString(), motivoReprovacao: motivo }
        : a
    )
  );
  return { ok: true };
}

// Atribui (ou corrige) o perfil sem mexer no status — diferente de aprovar,
// que muda status e perfil juntos. Útil pra já deixar registrado o perfil
// antes de decidir aprovar, ou corrigir depois de aprovado.
export function atribuirPerfilAfiliado(afiliadoId: string, tipo: AfiliadoTipo): { ok: boolean; erro?: string } {
  const afiliados = lerAfiliadosArmazenados();
  const afiliado = afiliados.find((a) => a.id === afiliadoId);
  if (!afiliado) return { ok: false, erro: "Afiliado não encontrado." };
  if (afiliado.status === "reprovado") return { ok: false, erro: "Esse afiliado foi reprovado." };
  saveAfiliados(afiliados.map((a) => (a.id === afiliadoId ? { ...a, tipo } : a)));
  return { ok: true };
}

// Resolve na mão um afiliado que ficou "sem coordenador" (cidade sem match) —
// única forma de sair dessa lista, já que a entrada é sempre automática.
export function atribuirCoordenadorManualmente(afiliadoId: string, coordenadorId: string): { ok: boolean; erro?: string } {
  const afiliados = lerAfiliadosArmazenados();
  const afiliado = afiliados.find((a) => a.id === afiliadoId);
  if (!afiliado) return { ok: false, erro: "Afiliado não encontrado." };
  if (afiliado.coordenadorId) return { ok: false, erro: "Esse afiliado já tem coordenador." };
  saveAfiliados(afiliados.map((a) => (a.id === afiliadoId ? { ...a, coordenadorId } : a)));
  return { ok: true };
}

