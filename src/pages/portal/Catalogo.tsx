import { useState } from "react";
import { Button, EmptyState, SearchInput, toast } from "@kruzer/ds";
import { ShoppingBag, Gift } from "lucide-react";
import { MOEDA } from "../../config/programa";
import { type Membro, getMembroLogado, agruparSaldosPorMoeda, criarPedidoResgate } from "../../lib/membros";
import { type TipoResgate } from "../../config/resgateLifecycle";

type ProdutoResgate = { id: string; nome: string; categoria: string; custo: number; imagem: string; tipo: TipoResgate };

const PRODUTOS: ProdutoResgate[] = [
  { id: "p1", nome: "Voucher R$50",    categoria: "Voucher",          custo: 1200,  imagem: "🎫", tipo: "voucher_digital" },
  { id: "p2", nome: "Voucher R$100",   categoria: "Voucher",          custo: 2400,  imagem: "🎫", tipo: "voucher_digital" },
  { id: "p3", nome: "Frete Grátis",    categoria: "Logística",        custo:  800,  imagem: "📦", tipo: "voucher_digital" },
  { id: "p4", nome: "Cupom 10%",       categoria: "Desconto",         custo:  650,  imagem: "🏷️", tipo: "voucher_digital" },
  { id: "p5", nome: "Air Fryer XL",    categoria: "Produto físico",   custo: 18000, imagem: "🍳", tipo: "produto_fisico"  },
  { id: "p6", nome: "Kit Skincare",    categoria: "Beleza",           custo: 3500,  imagem: "💆", tipo: "produto_fisico"  },
  { id: "p7", nome: "Fone Bluetooth",  categoria: "Eletrônico",       custo: 4200,  imagem: "🎧", tipo: "produto_fisico"  },
  { id: "p8", nome: "Cashback 5%",     categoria: "Cashback",         custo:  300,  imagem: "💰", tipo: "credito_conta"   },
];

const CATEGORIAS = ["Todos", ...Array.from(new Set(PRODUTOS.map(p => p.categoria)))];

function ConfirmModal({ produto, saldo, onConfirm, onCancel, confirmando }: {
  produto: ProdutoResgate;
  saldo: number;
  onConfirm: () => void;
  onCancel: () => void;
  confirmando: boolean;
}) {
  const suficiente = saldo >= produto.custo;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6" onClick={onCancel}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-base font-bold">Confirmar resgate</h2>
        <div className="rounded-lg bg-muted/40 px-4 py-3 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Produto</span><span className="font-medium">{produto.nome}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Custo</span><span className="font-semibold text-rose-600">−{produto.custo.toLocaleString("pt-BR")} {MOEDA.abrev}</span></div>
          <div className="flex justify-between border-t border-border pt-2"><span className="text-muted-foreground">Saldo após</span>
            <span className={`font-bold ${suficiente ? "text-emerald-600" : "text-rose-600"}`}>
              {(saldo - produto.custo).toLocaleString("pt-BR")} {MOEDA.abrev}
            </span>
          </div>
        </div>
        {produto.tipo === "credito_conta" && (
          <p className="text-xs text-muted-foreground">Um documento fiscal (RPA/NF, conforme seu cadastro) será emitido automaticamente pra esse crédito.</p>
        )}
        {!suficiente && (
          <p className="text-xs text-rose-600">Saldo insuficiente para este resgate.</p>
        )}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={confirmando}>Cancelar</Button>
          <Button className="flex-1" disabled={!suficiente || confirmando} onClick={onConfirm}>
            {confirmando ? "Confirmando…" : "Confirmar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PortalCatalogo() {
  const [membro, setMembro] = useState<Membro | undefined>(() => getMembroLogado());
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Todos");
  const [confirmando, setConfirmando] = useState<ProdutoResgate | null>(null);
  const [salvando, setSalvando] = useState(false);

  if (!membro) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Catálogo de resgate</h1>
        <EmptyState icon={Gift} title="Nenhum membro cadastrado ainda"
          description="Assim que houver um membro no programa, esta tela mostra o catálogo pra ele resgatar." />
      </div>
    );
  }

  const saldo = agruparSaldosPorMoeda(membro.saldos).find((s) => s.moeda === MOEDA.nome)?.total ?? 0;

  const filtered = PRODUTOS.filter(p =>
    (cat === "Todos" || p.categoria === cat) &&
    (!search || p.nome.toLowerCase().includes(search.toLowerCase()))
  );

  async function handleConfirmar() {
    if (!confirmando || !membro) return;
    setSalvando(true);
    await new Promise((r) => setTimeout(r, 400));
    const resultado = criarPedidoResgate(membro.id, {
      produto: confirmando.nome, tipo: confirmando.tipo, pontos: confirmando.custo,
      moeda: MOEDA.nome, abrev: MOEDA.abrev,
    });
    setSalvando(false);
    if (!resultado.ok) {
      toast.error(resultado.erro ?? "Não foi possível concluir o resgate.");
      return;
    }
    setMembro(getMembroLogado());
    toast.success(`Resgate de "${confirmando.nome}" solicitado com sucesso!`);
    setConfirmando(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Catálogo de resgate</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Seu saldo: <span className="font-semibold text-primary">{saldo.toLocaleString("pt-BR")} {MOEDA.abrev}</span>
        </p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar recompensa…" />
        </div>
      </div>

      {/* Filtro por categoria */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIAS.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              cat === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}>
            {c}
          </button>
        ))}
      </div>

      {/* Grid de produtos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map(p => {
          const suficiente = saldo >= p.custo;
          return (
            <div key={p.id} className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
              <div className="h-24 bg-muted/30 flex items-center justify-center text-4xl">
                {p.imagem}
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <div>
                  <p className="text-sm font-semibold">{p.nome}</p>
                  <p className="text-xs text-muted-foreground">{p.categoria}</p>
                </div>
                <div className="mt-auto flex items-center justify-between gap-2">
                  <span className={`text-sm font-bold tabular-nums ${suficiente ? "text-primary" : "text-muted-foreground"}`}>
                    {p.custo.toLocaleString("pt-BR")} {MOEDA.abrev}
                  </span>
                  <Button size="sm" disabled={!suficiente} onClick={() => setConfirmando(p)}>
                    <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                    Resgatar
                  </Button>
                </div>
                {!suficiente && (
                  <p className="text-[10px] text-muted-foreground">
                    Faltam {(p.custo - saldo).toLocaleString("pt-BR")} {MOEDA.abrev}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">Nenhum produto encontrado.</div>
      )}

      {confirmando && (
        <ConfirmModal produto={confirmando} saldo={saldo} confirmando={salvando}
          onConfirm={handleConfirmar} onCancel={() => setConfirmando(null)} />
      )}
    </div>
  );
}
