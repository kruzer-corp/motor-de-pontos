import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, EmptyState, toast } from "@kruzer/ds";
import { CheckCircle2, Layers, Plus, Sliders } from "lucide-react";
import { getBonificaEscolha, marcarOnboardingFeito } from "../lib/onboarding";
import { getProdutos } from "../lib/produtos";
import {
  type GrupoProdutos, getGruposProdutos, saveGruposProdutos,
} from "../lib/gruposProdutos";
import { GrupoModal } from "../components/GrupoModal";
import { SecaoMembros, SecaoProdutos } from "../components/CadastroBase";
import { OnboardingScreenShell } from "../components/OnboardingScreenShell";

export default function OnboardingCadastro() {
  const navigate = useNavigate();
  const bonifica = getBonificaEscolha();
  const mostrarMembros = bonifica.includes("cliente");
  const mostrarProdutos = bonifica.includes("produto") || bonifica.includes("pedido");

  const [produtos, setProdutos] = useState(() => getProdutos());
  const [grupos, setGrupos] = useState<GrupoProdutos[]>(() => getGruposProdutos());
  useEffect(() => { saveGruposProdutos(grupos); }, [grupos]);
  const [grupoModal, setGrupoModal] = useState<GrupoProdutos | null | "new">(null);

  // reflete produtos recém-importados na seção de cadastro logo abaixo
  useEffect(() => {
    const id = setInterval(() => setProdutos(getProdutos()), 800);
    return () => clearInterval(id);
  }, []);

  function salvarGrupo(g: GrupoProdutos) {
    setGrupos((prev) => (grupoModal === "new" ? [...prev, g] : prev.map((x) => (x.id === g.id ? g : x))));
    setGrupoModal(null);
  }

  function excluirGrupo(id: string) {
    setGrupos((prev) => prev.filter((g) => g.id !== id));
    toast.success("Grupo removido");
    setGrupoModal(null);
  }

  function concluir() {
    marcarOnboardingFeito("cadastro");
    toast.success("Passo concluído");
    navigate("/onboarding");
  }

  return (
    <OnboardingScreenShell
      title="Cadastre sua base"
      subtitle={bonifica.length > 0 ? "Suba uma planilha com toda a sua base de uma vez." : undefined}
      maxWidth="max-w-3xl"
    >
      {bonifica.length === 0 ? (
        <EmptyState icon={Sliders} title="Escolha o que bonifica primeiro"
          description="O que aparece aqui pra cadastrar depende da escolha do passo 1 — produto, pedido, cliente ou os dois."
          action={{ label: "Voltar ao onboarding", onClick: () => navigate("/onboarding") }} />
      ) : (
        <div className="space-y-5">
          <div className={`grid gap-4 ${mostrarMembros && mostrarProdutos ? "lg:grid-cols-2" : ""}`}>
            {mostrarMembros && <SecaoMembros sempreVazio />}
            {mostrarProdutos && <SecaoProdutos sempreVazio />}
          </div>

          {mostrarProdutos && (
            <div className="rounded-lg border border-border bg-card px-4 py-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">Grupos de Produtos</h2>
                  <p className="text-xs text-muted-foreground">— agrupamento pra vitrine, não afeta regras.</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setGrupoModal("new")}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />Novo grupo
                </Button>
              </div>
              {produtos.length === 0 ? (
                <p className="text-xs text-muted-foreground">Importe produtos acima pra poder agrupá-los.</p>
              ) : grupos.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhum grupo criado ainda.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {grupos.map((g) => (
                    <button key={g.id} onClick={() => setGrupoModal(g)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/30 hover:bg-muted px-3 py-1 text-xs font-medium transition-colors">
                      {g.nome}
                      <span className="text-muted-foreground/70">· {g.produtosIds.length}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <Button variant="outline" onClick={() => navigate("/onboarding")}>Voltar</Button>
            <Button onClick={concluir}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Concluir e voltar ao onboarding
            </Button>
          </div>
        </div>
      )}

      {grupoModal !== null && (
        <GrupoModal
          initial={grupoModal === "new" ? undefined : grupoModal}
          produtos={produtos}
          onClose={() => setGrupoModal(null)}
          onSave={salvarGrupo}
          onExcluir={grupoModal !== "new" ? () => excluirGrupo(grupoModal.id) : undefined}
        />
      )}
    </OnboardingScreenShell>
  );
}
