import { useNavigate } from "react-router-dom";
import { Button, EmptyState } from "@kruzer/ds";
import { Gift, AlertCircle, ChevronRight, UserCircle } from "lucide-react";
import { MOEDA } from "../../config/programa";
import { getMembroLogado, agruparSaldosPorMoeda } from "../../lib/membros";
import { getTiersMembro, ordenarPorLimiar, proximoTier } from "../../lib/tiers";

export default function Carteira() {
  const navigate = useNavigate();
  const membro = getMembroLogado();

  if (!membro) {
    return (
      <EmptyState icon={UserCircle} title="Nenhum membro cadastrado ainda"
        description="Assim que houver um membro no programa, esta tela mostra o saldo e os benefícios dele." />
    );
  }

  const saldo = agruparSaldosPorMoeda(membro.saldos).find((s) => s.moeda === MOEDA.nome)?.total ?? 0;
  const tiers = ordenarPorLimiar(getTiersMembro());
  const tierAtual = tiers.find((t) => t.nome === membro.tier);
  const proximo = tierAtual ? proximoTier(tiers, tierAtual.nome) : null;
  const ultimas = membro.transacoes.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Olá, {membro.nome.split(" ")[0]}!</h1>
        <p className="text-sm text-muted-foreground mt-1">Veja seu saldo e acompanhe seus benefícios.</p>
      </div>

      {/* Saldo principal */}
      <div className="rounded-2xl bg-primary p-6 text-primary-foreground">
        <p className="text-sm opacity-70 mb-1">Seu saldo atual</p>
        <p className="text-4xl font-bold tabular-nums">{saldo.toLocaleString("pt-BR")}</p>
        <p className="text-sm opacity-70 mt-1">{MOEDA.nome}</p>
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/20">
          {tierAtual ? (
            <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: `${tierAtual.cor}33`, color: tierAtual.cor }}>
              {tierAtual.nome}
            </span>
          ) : (
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{membro.tier}</span>
          )}
          {proximo && (
            <span className="text-xs opacity-60">Faltam {(proximo.limiarMin - saldo).toLocaleString("pt-BR")} {MOEDA.abrev} para {proximo.nome}</span>
          )}
          {tierAtual && !proximo && (
            <span className="text-xs opacity-60">Tier máximo atingido ✓</span>
          )}
        </div>
      </div>

      {/* Alerta de expiração */}
      {membro.expiram30d > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {membro.expiram30d.toLocaleString("pt-BR")} {MOEDA.abrev} expiram em 30 dias
            </p>
            <p className="text-xs text-amber-700 mt-0.5">Resgate antes de perder seus {MOEDA.nome.toLowerCase()}.</p>
          </div>
          <Button size="sm" variant="outline" className="ml-auto shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100"
            onClick={() => navigate("/portal/catalogo")}>
            Resgatar
          </Button>
        </div>
      )}

      {/* Atalhos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button onClick={() => navigate("/portal/catalogo")}
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-4 hover:bg-muted/40 transition-colors text-left">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Gift className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Catálogo</p>
            <p className="text-xs text-muted-foreground">Ver recompensas disponíveis</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
        </button>
        <button onClick={() => navigate("/portal/nivel")}
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-4 hover:bg-muted/40 transition-colors text-left">
          <div className="h-9 w-9 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
            <span className="text-violet-700 font-bold text-sm">👑</span>
          </div>
          <div>
            <p className="text-sm font-semibold">Meu nível</p>
            <p className="text-xs text-muted-foreground">Benefícios e progresso</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
        </button>
      </div>

      {/* Últimas transações */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Últimas movimentações</h2>
          <button className="text-xs text-primary hover:underline" onClick={() => navigate("/portal/extrato")}>
            Ver extrato completo
          </button>
        </div>
        {ultimas.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6 rounded-xl border border-border bg-card">Nenhuma movimentação ainda.</p>
        ) : (
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {ultimas.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold
                  ${t.valor >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"}`}>
                  {t.valor >= 0 ? "+" : "−"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.descricao}</p>
                  <p className="text-xs text-muted-foreground">{t.data}</p>
                </div>
                <span className={`text-sm font-semibold tabular-nums shrink-0
                  ${t.valor >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {t.valor > 0 ? "+" : ""}{t.valor.toLocaleString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
