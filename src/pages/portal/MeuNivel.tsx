import { EmptyState } from "@kruzer/ds";
import { Trophy } from "lucide-react";
import { MOEDA } from "../../config/programa";
import { getMembroLogado, agruparSaldosPorMoeda } from "../../lib/membros";
import { getTiersMembro, ordenarPorLimiar, proximoTier } from "../../lib/tiers";

export default function MeuNivel() {
  const membro = getMembroLogado();
  const tiers = ordenarPorLimiar(getTiersMembro());

  if (!membro) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Meu nível</h1>
          <p className="text-sm text-muted-foreground mt-1">Veja seus benefícios e o que te aguarda no próximo tier.</p>
        </div>
        <EmptyState icon={Trophy} title="Nenhum membro cadastrado ainda"
          description="Assim que houver um membro no programa, esta tela mostra o nível e os benefícios dele." />
      </div>
    );
  }

  const saldo = agruparSaldosPorMoeda(membro.saldos).find((s) => s.moeda === MOEDA.nome)?.total ?? 0;
  const tierAtual = tiers.find((t) => t.nome === membro.tier);
  const proximo = tierAtual ? proximoTier(tiers, tierAtual.nome) : null;
  const pct = tierAtual && proximo
    ? Math.min(100, Math.max(0, Math.round(((saldo - tierAtual.limiarMin) / (proximo.limiarMin - tierAtual.limiarMin)) * 100)))
    : 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meu nível</h1>
        <p className="text-sm text-muted-foreground mt-1">Veja seus benefícios e o que te aguarda no próximo tier.</p>
      </div>

      {tiers.length === 0 || !tierAtual ? (
        <EmptyState icon={Trophy} title="Nenhum tier configurado ainda"
          description="O programa ainda não tem níveis definidos — assim que houver, eles aparecem aqui." />
      ) : (
        <>
          {/* Tier atual */}
          <div className="rounded-2xl border-2 p-6 space-y-4" style={{ borderColor: `${tierAtual.cor}55` }}>
            <div className="flex items-center gap-3">
              <span className="rounded-full px-3 py-1 text-sm font-bold" style={{ backgroundColor: `${tierAtual.cor}22`, color: tierAtual.cor }}>
                {tierAtual.nome}
              </span>
              <span className="text-sm text-muted-foreground">Multiplicador {tierAtual.multiplicador}×</span>
            </div>
            {tierAtual.beneficios.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Seus benefícios</p>
                <ul className="space-y-1.5">
                  {tierAtual.beneficios.map((b) => (
                    <li key={b} className="text-sm flex items-center gap-2">
                      <span className="text-primary">✓</span>{b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {proximo && (
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Progresso para {proximo.nome}</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Faltam {Math.max(0, proximo.limiarMin - saldo).toLocaleString("pt-BR")} {MOEDA.abrev} para {proximo.nome}
                </p>
              </div>
            )}
            {!proximo && (
              <p className="text-xs text-muted-foreground">Você está no tier máximo do programa. 🎉</p>
            )}
          </div>

          {/* Todos os tiers */}
          <div>
            <h2 className="text-sm font-semibold mb-3">Todos os níveis do programa</h2>
            <div className="space-y-2">
              {tiers.map((t) => {
                const atingido = saldo >= t.limiarMin;
                return (
                  <div key={t.id} className={`rounded-xl border px-4 py-3.5 flex items-start gap-4 transition-opacity ${
                    !atingido ? "opacity-50" : ""
                  }`} style={{ borderColor: `${t.cor}55` }}>
                    <div className="shrink-0 mt-0.5">
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ backgroundColor: `${t.cor}22`, color: t.cor }}>
                        {t.nome}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">
                          {t.limiarMax ? `${t.limiarMin.toLocaleString("pt-BR")} – ${t.limiarMax.toLocaleString("pt-BR")} ${MOEDA.abrev}` : `${t.limiarMin.toLocaleString("pt-BR")}+ ${MOEDA.abrev}`}
                        </span>
                        <span className="text-xs font-semibold text-primary">{t.multiplicador}×</span>
                      </div>
                      {t.beneficios.length > 0 && (
                        <p className="text-xs text-muted-foreground">{t.beneficios[0]}{t.beneficios.length > 1 ? ` + ${t.beneficios.length - 1} mais` : ""}</p>
                      )}
                    </div>
                    {atingido && <span className="text-primary text-sm shrink-0">✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
