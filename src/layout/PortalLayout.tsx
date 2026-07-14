import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { MOEDA } from "../config/programa";
import { Wallet, ScrollText, Gift, Package, Trophy, ArrowLeftRight, UserCircle, Tag } from "lucide-react";
import AceiteRegulamento from "../pages/portal/AceiteRegulamento";
import { CustomTag } from "../components/CustomTag";

const ACEITE_KEY = "motor_pontos_regulamento_aceito";

const NAV = [
  { to: "/portal",          label: "Carteira",  icon: Wallet,     end: true  },
  { to: "/portal/extrato",  label: "Extrato",   icon: ScrollText, end: false },
  { to: "/portal/produtos",  label: "Produtos",  icon: Tag,        end: false },
  { to: "/portal/catalogo", label: "Catálogo",  icon: Gift,       end: false },
  { to: "/portal/pedidos",  label: "Pedidos",   icon: Package,    end: false },
  { to: "/portal/nivel",    label: "Meu nível",  icon: Trophy,      end: false },
  { to: "/portal/conta",   label: "Minha conta", icon: UserCircle, end: false },
];

const MEMBRO = { nome: "Aline P.", saldo: 5200, tier: "Diamante", abrev: "AP" };

export default function PortalLayout() {
  const navigate = useNavigate();
  const [aceito, setAceito] = useState(() => localStorage.getItem(ACEITE_KEY) === "true");

  function handleAceitar() {
    localStorage.setItem(ACEITE_KEY, "true");
    setAceito(true);
  }

  if (!aceito) {
    return <AceiteRegulamento onAceitar={handleAceitar} />;
  }

  return (
    <div className="flex h-svh overflow-hidden bg-background">

      {/* ── Sidebar · visível só em md+ ── */}
      <aside className="hidden md:flex w-56 flex-shrink-0 flex-col border-r border-border bg-[hsl(var(--sidebar-background))]">
        <div className="px-5 py-5 border-b border-border">
          <div className="font-bold text-sm text-foreground">Programa de Fidelidade</div>
          <div className="text-xs text-muted-foreground mt-0.5">Beneficiário</div>
          <div className="mt-2"><CustomTag /></div>
        </div>

        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
              {MEMBRO.abrev}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{MEMBRO.nome}</p>
              <p className="text-[10px] text-muted-foreground">{MEMBRO.saldo.toLocaleString("pt-BR")} {MOEDA.abrev} · {MEMBRO.tier}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ── Conteúdo ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header mobile */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-background">
          <div>
            <div className="font-bold text-sm">Programa de Fidelidade - Beneficiário</div>
            <div className="mt-1"><CustomTag /></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
              {MEMBRO.abrev}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </div>
        </main>

        {/* ── Bottom nav · mobile only ── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border">
          <div className="flex items-stretch">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>

      {/* Floating CTA — shift de papel */}
      <button
        onClick={() => navigate("/resgates")}
        className="hidden md:flex fixed bottom-5 right-5 z-50 items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground shadow-lg transition-all hover:bg-muted hover:text-foreground hover:shadow-xl"
      >
        <ArrowLeftRight className="h-3 w-3 shrink-0" />
        Ver como analista
      </button>
    </div>
  );
}
