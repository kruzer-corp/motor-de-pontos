import { useState } from "react";
import { Button, Input, Label } from "@kruzer/ds";
import { Trash2, X } from "lucide-react";
import { type Produto } from "../lib/produtos";
import { type GrupoProdutos, novoIdGrupoProdutos } from "../lib/gruposProdutos";

export function GrupoModal({ initial, produtos, onSave, onClose, onExcluir }: {
  initial?: GrupoProdutos; produtos: Produto[];
  onSave: (g: GrupoProdutos) => void; onClose: () => void; onExcluir?: () => void;
}) {
  const [d, setD] = useState<Omit<GrupoProdutos, "id">>(initial ?? { nome: "", descricao: "", produtosIds: [] });
  const upd = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((p) => ({ ...p, [k]: v }));

  function toggleProduto(id: string) {
    upd("produtosIds", d.produtosIds.includes(id) ? d.produtosIds.filter((x) => x !== id) : [...d.produtosIds, id]);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{initial ? "Editar grupo" : "Novo grupo de produtos"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Nome <span className="text-destructive">*</span></Label>
          <Input value={d.nome} onChange={(e) => upd("nome", e.target.value)} placeholder="Ex: Destaques da semana" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Descrição</Label>
          <Input value={d.descricao} onChange={(e) => upd("descricao", e.target.value)} placeholder="Ex: Vitrine principal, trocada semanalmente." />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Produtos</Label>
          {produtos.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhum produto cadastrado ainda — cadastre acima primeiro.</p>
          ) : (
            <>
              <div className="rounded-md border border-input overflow-hidden max-h-56 overflow-y-auto">
                {produtos.map((p) => {
                  const sel = d.produtosIds.includes(p.id);
                  return (
                    <label key={p.id} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/40 border-b border-border last:border-0">
                      <input type="checkbox" className="accent-primary h-4 w-4 shrink-0" checked={sel} onChange={() => toggleProduto(p.id)} />
                      <span className="text-sm flex-1 truncate">{p.nome}</span>
                      <span className="text-xs text-muted-foreground font-mono">{p.sku}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">{d.produtosIds.length} produto(s) selecionado(s)</p>
            </>
          )}
        </div>
        <div className="flex gap-2">
          {onExcluir && (
            <Button variant="outline" className="text-destructive hover:text-destructive" onClick={onExcluir}>
              <Trash2 className="size-3.5 mr-1.5" />Excluir
            </Button>
          )}
          <Button className="flex-1" disabled={!d.nome} onClick={() => onSave({ ...d, id: initial?.id ?? novoIdGrupoProdutos() })}>
            Salvar grupo
          </Button>
        </div>
      </div>
    </div>
  );
}
