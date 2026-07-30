import { useLocation, useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@kruzer/ds";
import { ArrowLeftRight, Sparkles, CheckCircle2, UserCircle, ShieldCheck, RotateCcw } from "lucide-react";
import { getVersao, saveVersao, resetarPrimeiroAcesso } from "../lib/versao";
import { aplicarSeedV2SeNecessario } from "../lib/seedV2";

const VERSAO_LABEL: Record<"v1" | "v2", string> = {
  v1: "Primeiro acesso",
  v2: "Versão completa",
};

const VERSAO_DOT: Record<"v1" | "v2", string> = {
  v1: "bg-amber-500",
  v2: "bg-emerald-500",
};

export default function VersaoSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const versao = getVersao();
  const emPortal = location.pathname.startsWith("/portal");
  const rotuloBotao = emPortal ? `Visão do membro · ${VERSAO_LABEL[versao]}` : VERSAO_LABEL[versao];

  function irPara(v: "v1" | "v2") {
    if (v === "v2") aplicarSeedV2SeNecessario();
    saveVersao(v);
    navigate(emPortal ? "/portal" : "/dashboard");
    window.location.reload();
  }

  function resetarEIrParaOnboarding() {
    resetarPrimeiroAcesso();
    saveVersao("v1");
    navigate("/onboarding");
    window.location.reload();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="hidden md:flex fixed bottom-5 right-5 z-50 items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground shadow-lg transition-all hover:bg-muted hover:shadow-xl"
        >
          <span className={`h-2 w-2 rounded-full shrink-0 ${VERSAO_DOT[versao]}`} />
          {rotuloBotao}
          <ArrowLeftRight className="h-3 w-3 shrink-0 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => irPara("v1")}>
          <Sparkles className="size-3.5 mr-2" />
          Primeiro acesso{versao === "v1" ? " · atual" : ""}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => irPara("v2")}>
          <CheckCircle2 className="size-3.5 mr-2" />
          Versão completa{versao === "v2" ? " · atual" : ""}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={resetarEIrParaOnboarding}>
          <RotateCcw className="size-3.5 mr-2" />
          Resetar primeiro acesso
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {emPortal ? (
          <DropdownMenuItem onClick={() => navigate("/dashboard")}>
            <ShieldCheck className="size-3.5 mr-2" />
            Ver como analista
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => navigate("/portal")}>
            <UserCircle className="size-3.5 mr-2" />
            Visão do membro
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
