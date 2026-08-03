export type OrderStatus = "solicitado" | "aguardando_doc" | "doc_recebido" | "aprovado" | "em_separacao" | "entregue" | "enviado" | "creditado" | "rejeitado" | "cancelado";

// Rótulo do status — fonte única (admin e portal do membro leem daqui, cada
// um decide sua própria cor/variante de exibição em cima do mesmo texto).
export const STATUS_LABEL: Record<OrderStatus, string> = {
  solicitado:     "Solicitado",
  aguardando_doc: "Aguardando doc.",
  doc_recebido:   "Doc. recebido",
  aprovado:       "Aprovado",
  em_separacao:   "Em separação",
  entregue:       "Entregue",
  enviado:        "Enviado",
  creditado:      "Creditado",
  rejeitado:      "Rejeitado",
  cancelado:      "Cancelado",
};

export type TipoResgate = "produto_fisico" | "voucher_digital" | "credito_conta";

export const TIPO_RESGATE_LABEL: Record<TipoResgate, string> = {
  produto_fisico:  "Produto físico",
  voucher_digital: "Voucher digital",
  credito_conta:   "Crédito em conta",
};

export const TIPO_RESGATE_ICON: Record<TipoResgate, string> = {
  produto_fisico:  "📦",
  voucher_digital: "🎟️",
  credito_conta:   "💳",
};

// Lifecycle de cada tipo — define a sequência de estados possíveis
export const LIFECYCLE_POR_TIPO: Record<TipoResgate, OrderStatus[]> = {
  produto_fisico:  ["solicitado", "aprovado", "em_separacao", "entregue"],
  voucher_digital: ["solicitado", "aprovado", "enviado"],
  credito_conta:   ["solicitado", "aguardando_doc", "doc_recebido", "aprovado", "creditado"],
};

// Retorna o próximo status para um dado tipo e status atual
export function proximoStatus(
  tipo: TipoResgate,
  statusAtual: OrderStatus
): OrderStatus | null {
  const lc = LIFECYCLE_POR_TIPO[tipo];
  const idx = lc.indexOf(statusAtual);
  return idx >= 0 && idx < lc.length - 1 ? lc[idx + 1] : null;
}
