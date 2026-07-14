import { useNavigate } from "react-router-dom";
import { Button } from "@kruzer/ds";
import { Gift, AlertCircle, ChevronRight } from "lucide-react";
import { MOEDA } from "../../config/programa";

const MEMBRO = {
  nome: "Aline P.", saldo: 5200, expiram: 240, tier: "Diamante",
  tierColor: "bg-violet-100 text-violet-700", progresso: 100, proximoTier: null,
};

const ULTIMAS = [
  { id: "t1", data: "18/06/2025", desc: "Compra na loja — R$ 320,00", valor: +320, tipo: "acumulo" },
  { id: "t2", data: "15/06/2025", desc: "Resgate — Cupom 10% desconto", valor: -500, tipo: "resgate" },
  { id: "t3", data: "10/06/2025", desc: "Compra na loja — R$ 180,00", valor: +180, tipo: "acumulo" },
];

export default function Carteira() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Olá, {MEMBRO.nome.split(" ")[0]}!</h1>
        <p className="text-sm text-muted-foreground mt-1">Veja seu saldo e acompanhe seus benefícios.</p>
      </div>

      {/* Saldo principal */}
      <div className="rounded-2xl bg-primary p-6 text-primary-foreground">
        <p className="text-sm opacity-70 mb-1">Seu saldo atual</p>
        <p className="text-4xl font-bold tabular-nums">{MEMBRO.saldo.toLocaleString("pt-BR")}</p>
        <p className="text-sm opacity-70 mt-1">{MOEDA.nome}</p>
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/20">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${MEMBRO.tierColor}`}>{MEMBRO.tier}</span>
          {MEMBRO.proximoTier && (
            <span className="text-xs opacity-60">Faltam X {MOEDA.abrev} para {MEMBRO.proximoTier}</span>
          )}
          {!MEMBRO.proximoTier && (
            <span className="text-xs opacity-60">Tier máximo atingido ✓</span>
          )}
        </div>
      </div>

      {/* Alerta de expiração */}
      {MEMBRO.expiram > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {MEMBRO.expiram.toLocaleString("pt-BR")} {MOEDA.abrev} expiram em 30 dias
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
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {ULTIMAS.map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3.5">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold
                ${t.tipo === "acumulo" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"}`}>
                {t.tipo === "acumulo" ? "+" : "−"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.desc}</p>
                <p className="text-xs text-muted-foreground">{t.data}</p>
              </div>
              <span className={`text-sm font-semibold tabular-nums shrink-0
                ${t.tipo === "acumulo" ? "text-emerald-600" : "text-rose-600"}`}>
                {t.valor > 0 ? "+" : ""}{t.valor.toLocaleString("pt-BR")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
