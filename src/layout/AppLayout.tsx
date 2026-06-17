import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kruzer-corp/ds";
import {
  LayoutDashboard,
  Users,
  User,
  ShieldCheck,
  Gift,
  Sparkles,
  Boxes,
  Settings,
  Briefcase,
  ChevronDown,
  PanelLeft,
  ChevronsUpDown,
  Building2,
  Package,
  Trophy,
  History,
  ScrollText,
  Bell,
  ClipboardList,
  BarChart2,
  UserCheck,
  Newspaper,
} from "lucide-react";

const TENANTS = ["FAST PRO", "FAST PRO — Sandbox"];

type LucideIcon = React.ComponentType<{ className?: string }>;
type SubItem = { to: string; label: string };

type FlatMenuItem = { to: string; label: string; icon: LucideIcon };
type GroupMenuItem = { label: string; icon: LucideIcon; badge?: string; group: SubItem[] };
type MenuItem = FlatMenuItem | GroupMenuItem;

function isGroup(item: MenuItem): item is GroupMenuItem {
  return "group" in item;
}

const MENU: MenuItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/config", label: "Configuração", icon: Settings },
  { to: "/usuarios", label: "Usuários & Papéis", icon: User },
  {
    label: "Membros",
    icon: Users,
    badge: "HUB",
    group: [
      { to: "/membros", label: "Lista" },
      { to: "/membros/tier", label: "Tier" },
      { to: "/membros/segmentos", label: "Segmentos" },
      { to: "/membros/ajuste", label: "Ajuste manual" },
      { to: "/membros/extrato", label: "Extrato de pontos" },
      { to: "/minha-conta", label: "Minha Conta" },
    ],
  },
  {
    label: "Catálogo",
    icon: Package,
    group: [
      { to: "/catalogo", label: "Produtos" },
      { to: "/catalogo/grupos", label: "Grupos" },
      { to: "/catalogo/atualizacao", label: "Atualização 3P" },
    ],
  },
  {
    label: "Campanhas",
    icon: Sparkles,
    group: [
      { to: "/campanhas", label: "Regras" },
      { to: "/campanhas/nova", label: "Nova campanha" },
    ],
  },
  {
    label: "Recompensas",
    icon: Gift,
    group: [
      { to: "/recompensas", label: "Pedidos" },
      { to: "/recompensas/catalogo", label: "Catálogo de resgate" },
      { to: "/recompensas/documental", label: "Fluxo documental" },
    ],
  },
  { to: "/conformidade", label: "Conformidade", icon: ScrollText },
  {
    label: "Comunicações",
    icon: Bell,
    group: [
      { to: "/comunicacoes", label: "Configuração" },
      { to: "/comunicados", label: "Histórico" },
    ],
  },
  { to: "/pedidos", label: "Pedidos", icon: ClipboardList },
  { to: "/dashboard-resultados", label: "Dashboard Resultados", icon: BarChart2 },
  { to: "/indicacoes", label: "Indicações de Venda", icon: UserCheck },
  {
    label: "Conteúdo",
    icon: Newspaper,
    group: [
      { to: "/homepage", label: "Homepage" },
      { to: "/banners", label: "Banners" },
      { to: "/conteudo", label: "Editorial" },
      { to: "/login-config", label: "Login" },
    ],
  },
  { to: "/ranking", label: "Ranking", icon: Trophy },
  { to: "/niveis", label: "Níveis", icon: ShieldCheck },
  { to: "/canais", label: "Canais", icon: Boxes },
  { to: "/afiliados", label: "Afiliados", icon: Briefcase },
  {
    label: "Auditoria",
    icon: History,
    group: [{ to: "/logs", label: "Logs manuais" }],
  },
];

function FlatItem({ item, collapsed }: { item: FlatMenuItem; collapsed: boolean }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        } ${collapsed ? "justify-center px-0" : ""}`
      }
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

function GroupItem({ item, collapsed }: { item: GroupMenuItem; collapsed: boolean }) {
  const location = useLocation();
  const Icon = item.icon;
  const isActive = item.group.some(
    (sub) => location.pathname === sub.to || location.pathname.startsWith(sub.to + "/")
  );
  const [open, setOpen] = useState(isActive);

  if (collapsed) {
    return (
      <div
        className={`flex justify-center rounded-xl px-3 py-2 ${
          isActive ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Icon className="size-4" />
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
            isActive && !open
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          <Icon className="size-4 shrink-0" />
          <span className="flex-1 text-left font-medium">{item.label}</span>
          {item.badge && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              {item.badge}
            </span>
          )}
          <ChevronDown
            className={`size-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-7 mt-1 space-y-0.5 border-l border-border pl-3">
          {item.group.map((sub) => (
            <NavLink
              key={sub.to}
              to={sub.to}
              className={({ isActive: subActive }) =>
                `block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  subActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {sub.label}
            </NavLink>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function AppLayout() {
  const [tenant, setTenant] = useState(TENANTS[0]);
  const [collapsed, setCollapsed] = useState(false);

  const widthClass = collapsed ? "w-16" : "w-72";
  const contentMargin = collapsed ? "ml-16" : "ml-72";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside
        className={`fixed inset-y-0 left-0 border-r border-border bg-card shadow-sm z-40 flex flex-col transition-all duration-300 overflow-hidden ${widthClass}`}
      >
        {/* Header: tenant selector + collapse toggle */}
        <div
          className={`flex h-16 shrink-0 items-center border-b border-border px-3 gap-2 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {!collapsed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-1 min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors text-left">
                  <Building2 className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Kruzer
                    </div>
                    <div className="truncate text-sm font-semibold text-foreground">{tenant}</div>
                  </div>
                  <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                {TENANTS.map((t) => (
                  <DropdownMenuItem
                    key={t}
                    onSelect={() => setTenant(t)}
                    className={t === tenant ? "font-semibold text-primary" : ""}
                  >
                    {t}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="shrink-0 size-8"
            onClick={() => setCollapsed((prev) => !prev)}
          >
            <PanelLeft className="size-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto space-y-0.5 px-2 py-3">
          {MENU.map((item) =>
            isGroup(item) ? (
              <GroupItem key={item.label} item={item} collapsed={collapsed} />
            ) : (
              <FlatItem key={(item as FlatMenuItem).to} item={item as FlatMenuItem} collapsed={collapsed} />
            )
          )}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="shrink-0 border-t border-border px-4 py-3 text-xs text-muted-foreground">
            Painel de administração
          </div>
        )}
      </aside>

      {/* Main */}
      <main className={`${contentMargin} min-h-screen transition-all duration-300`}>
        <div className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Programa de pontos</div>
            <div className="text-base font-semibold">Painel FAST PRO</div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">Online</Badge>
            <Button size="sm">Novo item</Button>
          </div>
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
