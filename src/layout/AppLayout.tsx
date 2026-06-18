import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
  Layers,
  Puzzle,
  Palette,
  Webhook,
  Wallet,
  SlidersHorizontal,
} from "lucide-react";

// ── Tenants ───────────────────────────────────────────────────────────

type TenantMode = "custom" | "product";

type Tenant = {
  id: string;
  name: string;
  mode: TenantMode;
  description: string;
};

const TENANTS: Tenant[] = [
  { id: "fastpro",    name: "FAST PRO",    mode: "custom",  description: "Configuração Fast PRO" },
  { id: "whitelabel", name: "Novo Tenant", mode: "product", description: "Produto white-label Kruzer" },
];

const MODE_CONFIG: Record<TenantMode, {
  tenantPill: string; tenantPillText: string;
  sidebarBorder: string; sidebarHeaderBg: string;
  topbarBg: string; topbarBorder: string;
  topbarTitle: string; topbarSub: string;
  modeBadge: string; modeBadgeText: string;
}> = {
  custom: {
    tenantPill:       "bg-violet-50 border border-violet-200 text-violet-700",
    tenantPillText:   "Custom",
    sidebarBorder:    "border-violet-300",
    sidebarHeaderBg:  "bg-violet-50",
    topbarBg:         "bg-violet-700",
    topbarBorder:     "border-violet-800",
    topbarTitle:      "Painel FAST PRO",
    topbarSub:        "Configuração personalizada",
    modeBadge:        "bg-violet-500 text-white",
    modeBadgeText:    "Fast PRO",
  },
  product: {
    tenantPill:       "bg-sky-50 border border-sky-200 text-sky-700",
    tenantPillText:   "Produto",
    sidebarBorder:    "border-sky-300",
    sidebarHeaderBg:  "bg-sky-50",
    topbarBg:         "bg-card",
    topbarBorder:     "border-border",
    topbarTitle:      "Painel do Programa",
    topbarSub:        "Produto white-label Kruzer",
    modeBadge:        "bg-sky-100 text-sky-700",
    modeBadgeText:    "White-label",
  },
};

// ── Layer system ──────────────────────────────────────────────────────

type Layer = "core" | "module" | "custom" | "br";

export const LAYER_CONFIG: Record<Layer, { label: string; dot: string; pill: string }> = {
  core:   { label: "Produto",  dot: "bg-sky-500",     pill: "bg-sky-50 text-sky-600 border-sky-200" },
  module: { label: "Módulo",   dot: "bg-amber-400",   pill: "bg-amber-50 text-amber-700 border-amber-200" },
  custom: { label: "Custom",   dot: "bg-violet-500",  pill: "bg-violet-50 text-violet-700 border-violet-200" },
  br:     { label: "BR",       dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const HIDDEN_IN_PRODUCT: Layer[] = ["custom"];

function LayerDot({ layer }: { layer?: Layer }) {
  if (!layer || layer === "core") return null;
  return (
    <span
      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${LAYER_CONFIG[layer].dot}`}
      title={LAYER_CONFIG[layer].label}
    />
  );
}

// ── Menu types ────────────────────────────────────────────────────────

type LucideIcon    = React.ComponentType<{ className?: string }>;
type SubItem       = { to: string; label: string; layer?: Layer };
type FlatMenuItem  = { to: string; label: string; icon: LucideIcon; layer?: Layer };
type GroupMenuItem = { label: string; icon: LucideIcon; badge?: string; layer?: Layer; group: SubItem[] };
type SectionHeader = { section: string };
type MenuItem      = FlatMenuItem | GroupMenuItem | SectionHeader;

function isSection(item: MenuItem): item is SectionHeader { return "section" in item; }
function isGroup(item: MenuItem): item is GroupMenuItem   { return "group" in item; }

// ── Menu ─────────────────────────────────────────────────────────────

const MENU: MenuItem[] = [
  // ── PROGRAMA ──────────────────────────────────────────────────────
  { section: "Programa" },

  { to: "/",                    label: "Dashboard",       icon: LayoutDashboard },
  { to: "/dashboard-resultados",label: "Resultados",      icon: BarChart2 },

  {
    label: "Membros", icon: Users, badge: "HUB",
    group: [
      { to: "/membros",           label: "Lista" },
      { to: "/membros/tier",      label: "Tier / Níveis" },
      { to: "/membros/segmentos", label: "Segmentos",        layer: "module" },
      { to: "/membros/extrato",   label: "Extrato de pontos" },
      { to: "/minha-conta",       label: "Minha Conta" },
    ],
  },

  {
    label: "Campanhas", icon: Sparkles,
    group: [
      { to: "/campanhas",      label: "Regras" },
      { to: "/campanhas/nova", label: "Nova campanha" },
    ],
  },

  { to: "/membros/ajuste", label: "Ajuste manual", icon: SlidersHorizontal },

  {
    label: "Recompensas", icon: Gift,
    group: [
      { to: "/recompensas",            label: "Pedidos" },
      { to: "/recompensas/catalogo",   label: "Catálogo de resgate" },
      { to: "/recompensas/documental", label: "Fluxo documental", layer: "custom" },
    ],
  },

  { to: "/niveis",    label: "Níveis",                  icon: ShieldCheck },
  { to: "/canais",    label: "Canais",                  icon: Boxes },
  { to: "/afiliados", label: "Afiliados",               icon: Briefcase, layer: "custom" },
  { to: "/pedidos",   label: "Pedidos especificados",   icon: ClipboardList, layer: "custom" },
  { to: "/carteiras", label: "Multi-moeda / Carteiras", icon: Wallet },

  // ── ENGAJAMENTO ───────────────────────────────────────────────────
  { section: "Engajamento" },

  { to: "/ranking",    label: "Ranking",            icon: Trophy,    layer: "module" },
  { to: "/indicacoes", label: "Indicações de Venda",icon: UserCheck, layer: "module" },

  {
    label: "Comunicações", icon: Bell,
    group: [
      { to: "/comunicacoes", label: "Eventos transacionais" },
      { to: "/comunicados",  label: "Histórico" },
    ],
  },

  { to: "/conteudo",    label: "Conteúdo editorial", icon: Newspaper, layer: "module" },
  { to: "/conformidade",label: "Conformidade",        icon: ScrollText },
  { to: "/webhooks",    label: "Webhooks / Eventos",  icon: Webhook },

  // ── CONFIGURAÇÃO ──────────────────────────────────────────────────
  { section: "Configuração" },

  { to: "/usuarios", label: "Usuários & Papéis", icon: User },

  {
    label: "Theming", icon: Palette,
    group: [
      { to: "/homepage",    label: "Homepage" },
      { to: "/banners",     label: "Banners" },
      { to: "/login-config",label: "Login" },
    ],
  },

  {
    label: "Catálogo", icon: Package,
    group: [
      { to: "/catalogo",            label: "Produtos" },
      { to: "/catalogo/grupos",     label: "Grupos" },
      { to: "/catalogo/atualizacao",label: "Atualização 3P", layer: "module" },
    ],
  },

  { to: "/logs",  label: "Logs de auditoria",  icon: History },
  { to: "/config",label: "Configuração geral", icon: Settings },

  // ── META ──────────────────────────────────────────────────────────
  { section: "" },
  { to: "/produto-mapa", label: "Mapa do Produto", icon: Layers },
];

function filterMenu(menu: MenuItem[], mode: TenantMode): MenuItem[] {
  if (mode === "custom") return menu;
  return menu
    .filter((item) => {
      if (isSection(item)) return true;
      const flat = item as FlatMenuItem;
      return !HIDDEN_IN_PRODUCT.includes(flat.layer as Layer);
    })
    .map((item) => {
      if (!isGroup(item)) return item;
      const filtered = item.group.filter((s) => !HIDDEN_IN_PRODUCT.includes(s.layer as Layer));
      return filtered.length > 0 ? { ...item, group: filtered } : null;
    })
    .filter(Boolean) as MenuItem[];
}

// ── Nav components ────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  if (!label) return <div className="mt-3" />;
  return (
    <div className="mt-4 mb-1 px-3">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        {label}
      </span>
    </div>
  );
}

function FlatItem({ item, collapsed }: { item: FlatMenuItem; collapsed: boolean }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
          isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        } ${collapsed ? "justify-center px-0" : ""}`
      }
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed && <><span className="flex-1">{item.label}</span><LayerDot layer={item.layer} /></>}
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
      <div className={`flex justify-center rounded-xl px-3 py-2 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
        <Icon className="size-4" />
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
            isActive && !open ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          <Icon className="size-4 shrink-0" />
          <span className="flex-1 text-left font-medium">{item.label}</span>
          {item.badge && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              {item.badge}
            </span>
          )}
          <LayerDot layer={item.layer} />
          <ChevronDown className={`size-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-7 mt-1 space-y-0.5 border-l border-border pl-3">
          {item.group.map((sub) => (
            <NavLink
              key={sub.to}
              to={sub.to}
              className={({ isActive: sa }) =>
                `flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  sa ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <span className="flex-1">{sub.label}</span>
              <LayerDot layer={sub.layer} />
            </NavLink>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ── Layout ────────────────────────────────────────────────────────────

export default function AppLayout() {
  const [tenant, setTenant] = useState<Tenant>(TENANTS[0]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const mode = tenant.mode;
  const cfg  = MODE_CONFIG[mode];
  const visibleMenu = filterMenu(MENU, mode);
  const widthClass    = sidebarCollapsed ? "w-16" : "w-72";
  const contentMargin = sidebarCollapsed ? "ml-16" : "ml-72";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside
        className={`fixed inset-y-0 left-0 border-r bg-card shadow-sm z-40 flex flex-col transition-all duration-300 overflow-hidden ${widthClass} ${cfg.sidebarBorder}`}
      >
        {/* Header */}
        <div className={`flex h-16 shrink-0 items-center border-b px-3 gap-2 ${cfg.sidebarHeaderBg} ${cfg.sidebarBorder} ${sidebarCollapsed ? "justify-center" : ""}`}>
          {!sidebarCollapsed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-1 min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors text-left">
                  <Building2 className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Kruzer</div>
                    <div className="truncate text-sm font-semibold">{tenant.name}</div>
                  </div>
                  <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${cfg.tenantPill}`}>
                    {cfg.tenantPillText}
                  </span>
                  <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-64 p-1.5 space-y-1">
                <div className="px-2 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Configuração Fast PRO
                </div>
                {TENANTS.filter((t) => t.mode === "custom").map((t) => (
                  <DropdownMenuItem
                    key={t.id} onSelect={() => setTenant(t)}
                    className={`rounded-xl flex items-center gap-3 px-3 py-2.5 cursor-pointer ${tenant.id === t.id ? "bg-violet-50" : ""}`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100">
                      <span className="text-sm font-bold text-violet-700">F</span>
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold ${tenant.id === t.id ? "text-violet-700" : ""}`}>{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.description}</div>
                    </div>
                    <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">Custom</span>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                <div className="px-2 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Produto white-label
                </div>
                {TENANTS.filter((t) => t.mode === "product").map((t) => (
                  <DropdownMenuItem
                    key={t.id} onSelect={() => setTenant(t)}
                    className={`rounded-xl flex items-center gap-3 px-3 py-2.5 cursor-pointer ${tenant.id === t.id ? "bg-sky-50" : ""}`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-100">
                      <Puzzle className="size-3.5 text-sky-600" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold ${tenant.id === t.id ? "text-sky-700" : ""}`}>{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.description}</div>
                    </div>
                    <span className="rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">Produto</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button size="icon" variant="ghost" className="shrink-0 size-8" onClick={() => setSidebarCollapsed((p) => !p)}>
            <PanelLeft className="size-4" />
          </Button>
        </div>

        {/* Layer legend */}
        {!sidebarCollapsed && (
          <div className={`flex items-center gap-3 border-b px-3 py-2 ${cfg.sidebarHeaderBg} ${cfg.sidebarBorder}`}>
            {(Object.entries(LAYER_CONFIG) as [Layer, typeof LAYER_CONFIG[Layer]][])
              .filter(([key]) => mode === "custom" || !HIDDEN_IN_PRODUCT.includes(key))
              .map(([key, lcfg]) => (
                <div key={key} className="flex items-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${lcfg.dot}`} />
                  <span className="text-[10px] text-muted-foreground">{lcfg.label}</span>
                </div>
              ))}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto space-y-0.5 px-2 py-2">
          {visibleMenu.map((item, i) => {
            if (isSection(item)) {
              return !sidebarCollapsed
                ? <SectionLabel key={`s-${i}`} label={item.section} />
                : <div key={`s-${i}`} className="my-2 mx-3 h-px bg-border" />;
            }
            if (isGroup(item)) return <GroupItem key={item.label} item={item} collapsed={sidebarCollapsed} />;
            return <FlatItem key={(item as FlatMenuItem).to} item={item as FlatMenuItem} collapsed={sidebarCollapsed} />;
          })}
        </nav>

        {!sidebarCollapsed && (
          <div className="shrink-0 border-t border-border px-4 py-3 text-xs text-muted-foreground">
            Painel de administração
          </div>
        )}
      </aside>

      {/* Main */}
      <main className={`${contentMargin} min-h-screen transition-all duration-300`}>
        <div className={`flex h-16 items-center justify-between border-b px-6 ${cfg.topbarBg} ${cfg.topbarBorder}`}>
          <div>
            <div className={`text-xs uppercase tracking-wide ${mode === "custom" ? "text-violet-200" : "text-muted-foreground"}`}>
              {cfg.topbarSub}
            </div>
            <div className={`text-base font-semibold ${mode === "custom" ? "text-white" : ""}`}>
              {cfg.topbarTitle}
            </div>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.modeBadge}`}>
            {cfg.modeBadgeText}
          </span>
        </div>

        {mode === "product" && (
          <div className="flex items-center justify-between gap-3 border-b border-sky-200 bg-sky-100 px-6 py-3">
            <div className="flex items-center gap-3">
              <Puzzle className="size-5 shrink-0 text-sky-600" />
              <div>
                <div className="text-sm font-semibold text-sky-800">Modo produto white-label</div>
                <div className="text-xs text-sky-700">
                  Afiliados, Pedidos especificados e Fluxo documental (Fast PRO custom) estão ocultos.
                </div>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-sky-200 px-3 py-1 text-xs font-bold text-sky-700">
              3 features ocultas
            </span>
          </div>
        )}

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
