// ── Catálogo de produtos — fonte única usada pela tela "Produtos elegíveis" e pelo wizard de campanhas ───────

export type ProdutoStatus = "ativo" | "pendente" | "arquivado";

export type CampanhaParticipante = {
  id: string; nome: string; periodo: string;
  status: "ativa" | "encerrada" | "rascunho";
  moedaGerada: number;
};

export type PedidoProduto = {
  id: string; data: string; membro: string; valor: number; moedaGerada: number;
};

export type HistoricoEvento = {
  data: string; evento: string; detalhe: string;
  tipo: "criado" | "editado" | "arquivado" | "reativado" | "campanha";
};

export type Produto = {
  id: string; sku: string; nome: string; categoria: string; preco: number;
  status: ProdutoStatus; campanhasVinculadas: string[];
  criadoEm: string;
  campanhas: CampanhaParticipante[];
  pedidos: PedidoProduto[];
  historico: HistoricoEvento[];
};

export const CATEGORIAS = ["Eletrônicos", "Eletrodomésticos", "Beleza", "Esportes", "Livros", "Acessórios", "Logística", "Voucher", "Desconto"];

const SEED: Produto[] = [
  {
    id: "SKU-001", sku: "TV-50-4K", nome: 'Smart TV 50"', categoria: "Eletrônicos", preco: 2899,
    status: "ativo", campanhasVinculadas: ["BF2026", "CAMP-2025-06"], criadoEm: "12/01/2025",
    campanhas: [
      { id: "BF2026",       nome: "Black Friday 2026", periodo: "28/11 → 30/11/2026", status: "rascunho",  moedaGerada: 0     },
      { id: "CAMP-2025-06", nome: "Campanha Junho",    periodo: "01/06 → 30/06/2025", status: "encerrada", moedaGerada: 4800  },
    ],
    pedidos: [
      { id: "REQ-521", data: "16/06/2025", membro: "Aline P.",  valor: 3200, moedaGerada: 3200 },
      { id: "REQ-489", data: "01/06/2025", membro: "Bruno C.",  valor: 3200, moedaGerada: 3200 },
    ],
    historico: [
      { data: "12/01/2025 · 09:00", evento: "Produto cadastrado",              detalhe: "Adicionado ao catálogo por Maria Admin",        tipo: "criado"   },
      { data: "01/06/2025 · 10:00", evento: "Vinculado à campanha",            detalhe: "CAMP-2025-06 — Campanha Junho",                  tipo: "campanha" },
      { data: "15/10/2025 · 14:30", evento: "Vinculado à campanha",            detalhe: "BF2026 — Black Friday 2026",                     tipo: "campanha" },
    ],
  },
  {
    id: "SKU-002", sku: "AIRFRY-XL", nome: "Air Fryer XL", categoria: "Eletrodomésticos", preco: 599,
    status: "ativo", campanhasVinculadas: ["CAMP-2025-04"], criadoEm: "05/02/2025",
    campanhas: [
      { id: "CAMP-2025-04", nome: "Campanha Abril", periodo: "01/04 → 30/04/2025", status: "encerrada", moedaGerada: 1200 },
    ],
    pedidos: [
      { id: "REQ-489", data: "08/04/2025", membro: "Bruno C.", valor: 800, moedaGerada: 800 },
    ],
    historico: [
      { data: "05/02/2025 · 11:00", evento: "Produto cadastrado",   detalhe: "Adicionado ao catálogo por João Ops",   tipo: "criado"   },
      { data: "01/04/2025 · 09:00", evento: "Vinculado à campanha", detalhe: "CAMP-2025-04 — Campanha Abril",         tipo: "campanha" },
    ],
  },
  {
    id: "SKU-003", sku: "FONE-BT-02", nome: "Fone Bluetooth", categoria: "Eletrônicos", preco: 249,
    status: "ativo", campanhasVinculadas: ["BF2026"], criadoEm: "20/03/2025",
    campanhas: [
      { id: "BF2026", nome: "Black Friday 2026", periodo: "28/11 → 30/11/2026", status: "rascunho", moedaGerada: 0 },
    ],
    pedidos: [],
    historico: [
      { data: "20/03/2025 · 15:00", evento: "Produto cadastrado",   detalhe: "Adicionado ao catálogo por Maria Admin", tipo: "criado"   },
      { data: "15/10/2025 · 14:30", evento: "Vinculado à campanha", detalhe: "BF2026 — Black Friday 2026",             tipo: "campanha" },
    ],
  },
  { id: "SKU-004", sku: "KIT-SKIN-01", nome: "Kit Skincare",      categoria: "Beleza",           preco: 149, status: "ativo",    campanhasVinculadas: [], criadoEm: "10/04/2025", campanhas: [], pedidos: [], historico: [{ data: "10/04/2025 · 10:00", evento: "Produto cadastrado", detalhe: "Adicionado ao catálogo por Maria Admin", tipo: "criado" }] },
  { id: "SKU-005", sku: "TEN-RUN-42",  nome: "Tênis Running",     categoria: "Esportes",         preco: 399, status: "ativo",    campanhasVinculadas: ["CAMP-2025-05"], criadoEm: "01/03/2025", campanhas: [{ id: "CAMP-2025-05", nome: "Campanha Maio", periodo: "01/05 → 31/05/2025", status: "encerrada", moedaGerada: 650 }], pedidos: [{ id: "REQ-497", data: "07/05/2025", membro: "Cecília M.", valor: 650, moedaGerada: 650 }], historico: [{ data: "01/03/2025 · 09:00", evento: "Produto cadastrado", detalhe: "Adicionado ao catálogo", tipo: "criado" }, { data: "01/05/2025 · 09:00", evento: "Vinculado à campanha", detalhe: "CAMP-2025-05", tipo: "campanha" }] },
  { id: "SKU-006", sku: "CAFE-PRE-01", nome: "Cafeteira Premium", categoria: "Eletrodomésticos", preco: 449, status: "ativo",    campanhasVinculadas: [], criadoEm: "15/02/2025", campanhas: [], pedidos: [], historico: [{ data: "15/02/2025 · 11:00", evento: "Produto cadastrado", detalhe: "Adicionado ao catálogo", tipo: "criado" }] },
  { id: "SKU-007", sku: "MOCH-EXE-01", nome: "Mochila Executiva", categoria: "Acessórios",       preco: 199, status: "ativo",    campanhasVinculadas: [], criadoEm: "20/02/2025", campanhas: [], pedidos: [], historico: [{ data: "20/02/2025 · 14:00", evento: "Produto cadastrado", detalhe: "Adicionado ao catálogo", tipo: "criado" }] },
  { id: "SKU-008", sku: "LIV-REC-01",  nome: "Livro de Receitas", categoria: "Livros",           preco: 59,  status: "arquivado",campanhasVinculadas: [], criadoEm: "05/01/2025", campanhas: [], pedidos: [], historico: [{ data: "05/01/2025 · 09:00", evento: "Produto cadastrado", detalhe: "Adicionado ao catálogo", tipo: "criado" }, { data: "01/05/2025 · 16:00", evento: "Produto arquivado", detalhe: "Arquivado por Maria Admin — sem demanda", tipo: "arquivado" }] },
  { id: "SKU-009", sku: "VCH-100-BR",  nome: "Voucher R$100",     categoria: "Voucher",          preco: 100, status: "ativo",    campanhasVinculadas: ["CAMP-2025-06"], criadoEm: "01/06/2025", campanhas: [{ id: "CAMP-2025-06", nome: "Campanha Junho", periodo: "01/06 → 30/06/2025", status: "encerrada", moedaGerada: 2400 }], pedidos: [{ id: "REQ-521", data: "16/06/2025", membro: "Aline P.", valor: 2400, moedaGerada: 2400 }], historico: [{ data: "01/06/2025 · 08:00", evento: "Produto cadastrado", detalhe: "Adicionado ao catálogo", tipo: "criado" }, { data: "01/06/2025 · 09:00", evento: "Vinculado à campanha", detalhe: "CAMP-2025-06", tipo: "campanha" }] },
];

const KEY = "motor_pontos_produtos";

export function getProdutos(): Produto[] {
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return SEED;
    const parsed: Partial<Produto>[] = JSON.parse(stored);
    return parsed.map((p) => ({ preco: 0, campanhasVinculadas: [], campanhas: [], pedidos: [], historico: [], ...p }) as Produto);
  } catch {
    return SEED;
  }
}

export function saveProdutos(produtos: Produto[]) {
  localStorage.setItem(KEY, JSON.stringify(produtos));
}
