import { MOEDA } from "../../config/programa";

const MEMBRO_SALDO = 5200;
const MEMBRO_TIER  = "Diamante";

const TIERS = [
  {
    id: "bronze", nome: "Bronze", cor: "bg-orange-100 text-orange-700", borda: "border-orange-200",
    min: 0, max: 4999, mult: "1×",
    beneficios: [`Acúmulo padrão de ${MOEDA.nome.toLowerCase()}`, "Acesso ao catálogo de resgate"],
  },
  {
    id: "prata", nome: "Prata", cor: "bg-slate-100 text-slate-700", borda: "border-slate-200",
    min: 5000, max: 19999, mult: "1.25×",
    beneficios: ["Multiplicador 1.25× em compras", "Frete grátis em compras acima de R$150"],
  },
  {
    id: "ouro", nome: "Ouro", cor: "bg-amber-100 text-amber-700", borda: "border-amber-200",
    min: 20000, max: 49999, mult: "2×",
    beneficios: ["Multiplicador 2× em compras", "Frete grátis ilimitado", "Acesso ao catálogo premium"],
  },
  {
    id: "diamante", nome: "Diamante", cor: "bg-violet-100 text-violet-700", borda: "border-violet-200",
    min: 50000, max: null, mult: "3×",
    beneficios: ["Multiplicador 3× em todas as compras", "Suporte dedicado", "Acesso antecipado a campanhas", "Frete grátis ilimitado"],
  },
];

export default function MeuNivel() {
  const tierAtual = TIERS.find(t => t.nome === MEMBRO_TIER)!;
  const idxAtual  = TIERS.indexOf(tierAtual);
  const proximo   = TIERS[idxAtual + 1] ?? null;
  const pct       = proximo
    ? Math.min(100, Math.round(((MEMBRO_SALDO - tierAtual.min) / (tierAtual.max! - tierAtual.min)) * 100))
    : 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meu nível</h1>
        <p className="text-sm text-muted-foreground mt-1">Veja seus benefícios e o que te aguarda no próximo tier.</p>
      </div>

      {/* Tier atual */}
      <div className={`rounded-2xl border-2 ${tierAtual.borda} p-6 space-y-4`}>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${tierAtual.cor}`}>{tierAtual.nome}</span>
          <span className="text-sm text-muted-foreground">Multiplicador {tierAtual.mult}</span>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Seus benefícios</p>
          <ul className="space-y-1.5">
            {tierAtual.beneficios.map(b => (
              <li key={b} className="text-sm flex items-center gap-2">
                <span className="text-primary">✓</span>{b}
              </li>
            ))}
          </ul>
        </div>
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
              Faltam {(proximo.min - MEMBRO_SALDO).toLocaleString("pt-BR")} {MOEDA.abrev} para {proximo.nome}
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
          {TIERS.map((t, i) => {
            const atingido = i <= idxAtual;
            return (
              <div key={t.id} className={`rounded-xl border px-4 py-3.5 flex items-start gap-4 transition-opacity ${
                !atingido ? "opacity-50" : ""
              } ${t.borda}`}>
                <div className="shrink-0 mt-0.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${t.cor}`}>{t.nome}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">
                      {t.max ? `${t.min.toLocaleString("pt-BR")} – ${t.max.toLocaleString("pt-BR")} ${MOEDA.abrev}` : `${t.min.toLocaleString("pt-BR")}+ ${MOEDA.abrev}`}
                    </span>
                    <span className="text-xs font-semibold text-primary">{t.mult}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.beneficios[0]}{t.beneficios.length > 1 ? ` + ${t.beneficios.length - 1} mais` : ""}</p>
                </div>
                {atingido && <span className="text-primary text-sm shrink-0">✓</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
