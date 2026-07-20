import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn, TooltipProvider } from "@kruzer/ds";
import {
  LayoutDashboard, Users, User, ShieldCheck, Sparkles, Boxes, Building2,
  ChevronDown, ChevronsLeft, ChevronsRight,
  Trophy, History, ScrollText, Share2,
  Palette, Webhook, Sliders,
} from "lucide-react";

// ── Tenants ───────────────────────────────────────────────────────────────────

type TenantMode = "custom" | "product";

const BRAND_NAME: Record<TenantMode, string> = {
  custom:  "Programa de Fidelidade - Admin",
  product: "Motor de Pontos",
};

// ── Layer system ──────────────────────────────────────────────────────────────

type Layer = "core" | "module" | "custom" | "br";

export const LAYER_CONFIG: Record<Layer, { label: string; dot: string; pill: string }> = {
  core:   { label: "Produto",  dot: "bg-sky-500",     pill: "bg-sky-50 text-sky-600 border-sky-200"          },
  module: { label: "Módulo",   dot: "bg-amber-400",   pill: "bg-amber-50 text-amber-700 border-amber-200"    },
  custom: { label: "Custom",   dot: "bg-violet-500",  pill: "bg-violet-50 text-violet-700 border-violet-200" },
  br:     { label: "BR",       dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const HIDDEN_IN_PRODUCT: Layer[] = ["custom"];

function LayerDot(_: { layer?: Layer }) { return null; }

// ── Menu types ────────────────────────────────────────────────────────────────

type LucideIcon    = React.ComponentType<{ className?: string; strokeWidth?: number }>;
type SubItem       = { to: string; label: string; layer?: Layer };
type FlatMenuItem  = { to: string; label: string; icon: LucideIcon; layer?: Layer; badge?: string };
type GroupMenuItem = { label: string; icon: LucideIcon; badge?: string; layer?: Layer; group: SubItem[] };
type SectionHeader = { section: string };
type MenuItem      = FlatMenuItem | GroupMenuItem | SectionHeader;

function isSection(item: MenuItem): item is SectionHeader { return "section" in item; }
function isGroup(item: MenuItem): item is GroupMenuItem   { return "group" in item; }

const MENU: MenuItem[] = [

  // ── ANÁLISE ────────────────────────────────────────────────────────────────
  { section: "Análise" },
  {
    label: "Dashboard", icon: LayoutDashboard,
    group: [
      { to: "/dashboard",            label: "Visão geral" },
      { to: "/dashboard-resultados", label: "Resultados" },
    ],
  },
  { to: "/ranking", label: "Ranking", icon: Trophy, layer: "module" },

  // ── OPERAÇÃO ───────────────────────────────────────────────────────────────
  { section: "Operação" },
  { to: "/campanhas", label: "Minhas Campanhas", icon: Sparkles },
  { to: "/membros/extrato", label: "Membros e Extratos", icon: Users },
  { to: "/indicacoes", label: "Indicações", icon: Share2 },
  {
    label: "Catálogos e produtos", icon: Boxes,
    group: [
      { to: "/catalogo-produtos",    label: "Produtos incentivados" },
      { to: "/catalogo",             label: "Produtos (1P/3P)" },
      { to: "/catalogo/grupos",      label: "Grupos" },
      { to: "/catalogo/atualizacao", label: "Atualização" },
    ],
  },

  // ── CONFIGURAÇÃO DO PROGRAMA ───────────────────────────────────────────────
  { section: "Configuração do Programa" },
  { to: "/mecanica",       label: "Mecânica do Programa", icon: Sliders },
  { to: "/canais-filiais", label: "Canais e Filiais",   icon: Building2 },
  { to: "/usuarios",       label: "Usuários & Papéis",  icon: User      },
  { to: "/membros/tier", label: "Tier e Segmentação", icon: ShieldCheck },

  // ── CONFIGURAÇÃO — MARCA, COMUNICAÇÃO E JURÍDICO ──────────────────────────
  { section: "Marca, Comunicação e Jurídico" },
  { to: "/webhooks", label: "Conectividade",       icon: Webhook },
  {
    label: "Conteúdo & Aparência", icon: Palette,
    group: [
      { to: "/homepage",     label: "Homepage" },
      { to: "/banners",      label: "Banners" },
      { to: "/login-config", label: "Login" },
      { to: "/conteudo",     label: "Conteúdo editorial", layer: "module" },
      { to: "/templates-comunicacao", label: "Templates"                  },
      { to: "/comunicacoes",          label: "Eventos transacionais"       },
      { to: "/comunicados",           label: "Histórico de comunicações"   },
    ],
  },
  { to: "/regulamento", label: "Regulamento",       icon: ScrollText },
  { to: "/logs",        label: "Logs de auditoria", icon: History    },

];

// Itens de configuração — fora do sidebar principal, acessíveis pelo painel lateral

function filterMenu(menu: MenuItem[], mode: TenantMode): MenuItem[] {
  if (mode === "custom") return menu;
  return menu
    .filter((item) => {
      if (isSection(item)) return true;
      return !HIDDEN_IN_PRODUCT.includes((item as FlatMenuItem).layer as Layer);
    })
    .map((item) => {
      if (!isGroup(item)) return item;
      const filtered = item.group.filter((s) => !HIDDEN_IN_PRODUCT.includes(s.layer as Layer));
      return filtered.length > 0 ? { ...item, group: filtered } : null;
    })
    .filter(Boolean) as MenuItem[];
}

// ── Nav item (OMS style) ──────────────────────────────────────────────────────

type NavItemProps = { item: FlatMenuItem | GroupMenuItem; expanded: boolean; level?: number; onNavigate?: () => void };

function NavItem({ item, expanded, level = 1, onNavigate }: NavItemProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isSub = level > 1;
  const isGroup_ = isGroup(item);

  const active = !isGroup_ && (
    (item as FlatMenuItem).to === "/" ? pathname === "/" : pathname === (item as FlatMenuItem).to || pathname.startsWith((item as FlatMenuItem).to + "/")
  );
  const childActive = isGroup_ && (item as GroupMenuItem).group.some(
    (s) => pathname === s.to || pathname.startsWith(s.to + "/")
  );

  const [openSub, setOpenSub] = useState(childActive);
  const Icon = item.icon;

  const handleClick = () => {
    if (isGroup_) { setOpenSub((p) => !p); return; }
    navigate((item as FlatMenuItem).to);
  };

  const isActive = active || (childActive && !expanded);

  return (
    <div className="flex flex-col">
      <NavLink
        to={!isGroup_ ? (item as FlatMenuItem).to : "#"}
        end={!isGroup_ && (item as FlatMenuItem).to === "/"}
        onClick={isGroup_ ? (e) => { e.preventDefault(); handleClick(); } : onNavigate}
        className={cn(
          "flex cursor-pointer select-none items-center rounded-md py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          expanded ? "gap-2.5 px-3" : "mx-auto h-8 w-8 justify-center",
          isActive && "bg-muted font-medium text-foreground",
        )}
        style={{ fontSize: 13, ...(expanded ? {} : { paddingLeft: 0, paddingRight: 0 }) }}
      >
        {Icon && (
          <Icon
            strokeWidth={1.75}
            className={cn("shrink-0", isSub ? "h-3.5 w-3.5 text-foreground" : "h-4 w-4")}
          />
        )}
        {expanded && (
          <>
            <span className="flex-1 truncate whitespace-nowrap">{item.label}</span>
            {(item as GroupMenuItem).badge && (
              <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                {(item as GroupMenuItem).badge}
              </span>
            )}
            <LayerDot layer={(item as FlatMenuItem).layer} />
            {isGroup_ && (
              <ChevronDown
                className="ml-auto h-3.5 w-3.5 shrink-0 transition-transform"
                style={{ transform: openSub ? "rotate(180deg)" : undefined }}
              />
            )}
          </>
        )}
      </NavLink>

      {isGroup_ && (
        <div
          className="flex flex-col gap-1"
          style={{
            marginLeft: 22,
            paddingLeft: 8,
            borderLeft: "1px solid hsl(var(--border))",
            marginTop: expanded && openSub ? 4 : 0,
            maxHeight: expanded && openSub ? 2000 : 0,
            overflow: "hidden",
            transition: "max-height 200ms",
          }}
        >
          {(item as GroupMenuItem).group.map((sub) => {
            const subActive = pathname === sub.to || pathname.startsWith(sub.to + "/");
            return (
              <NavLink
                key={sub.to}
                to={sub.to}
                onClick={onNavigate}
                className={cn(
                  "flex cursor-pointer select-none items-center gap-2.5 rounded-md py-1.5 px-3 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  subActive && "bg-muted font-medium text-foreground",
                )}
                style={{ fontSize: 13 }}
              >
                <span className="flex-1 truncate">{sub.label}</span>
                <LayerDot layer={sub.layer} />
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Nav group section (OMS style) ─────────────────────────────────────────────

type Section = { header: string; items: (FlatMenuItem | GroupMenuItem)[] };

function NavSection({ section, expanded, index }: { section: Section; expanded: boolean; index: number }) {
  const [open, setOpen] = useState(true);

  if (!expanded) {
    return (
      <div className={cn("flex flex-col gap-1 pb-2", index === 0 ? "pt-3" : "pt-2 mt-3 border-t border-border")}>
        {section.items.map((item) => (
          <NavItem key={isGroup(item) ? item.label : (item as FlatMenuItem).to} item={item} expanded={false} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn("flex flex-col", index === 0 ? "pt-2" : "pt-2 mt-3")}
      style={{ paddingLeft: 8, paddingRight: 8 }}
    >
      {section.header ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex cursor-pointer select-none items-center rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <span className="flex-1 truncate text-left font-medium uppercase" style={{ fontSize: 11, letterSpacing: "0.06em" }}>
            {section.header}
          </span>
          <ChevronDown
            className="ml-auto h-3.5 w-3.5 shrink-0 transition-transform"
            style={{ transform: open ? "rotate(180deg)" : undefined }}
          />
        </button>
      ) : null}

      <div
        className="flex flex-col gap-1"
        style={{
          paddingLeft: section.header ? 8 : 0,
          marginTop: !section.header || open ? 4 : 0,
          maxHeight: !section.header || open ? 2000 : 0,
          overflow: "hidden",
          transition: "max-height 200ms",
        }}
      >
        {section.items.map((item) => (
          <NavItem key={isGroup(item) ? item.label : (item as FlatMenuItem).to} item={item} expanded={expanded} />
        ))}
      </div>
    </div>
  );
}

// ── App Sidebar (OMS style) ───────────────────────────────────────────────────

const HOVER_DELAY = 200;

type AppSidebarProps = {
  visibleMenu: MenuItem[];
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  onHoverChange: (h: boolean) => void;
};

function AppSidebar({ visibleMenu, collapsed, setCollapsed, onHoverChange }: AppSidebarProps) {
  const [hover, setHover]         = useState(false);
  const [pinned, setPinned]       = useState(true);
  const { pathname } = useLocation();
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const expanded = !collapsed || hover;

  const handleMouseEnter = useCallback(() => {
    if (!hover && collapsed) {
      hoverTimeout.current = setTimeout(() => { setHover(true); onHoverChange(true); hoverTimeout.current = null; }, HOVER_DELAY);
    }
  }, [hover, collapsed]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeout.current) { clearTimeout(hoverTimeout.current); hoverTimeout.current = null; }
    setHover(false);
    onHoverChange(false);
  }, [onHoverChange]);

  const prevPath = useRef(pathname);
  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      if (!pinned) setCollapsed(true);
    }
  }, [pathname, pinned]);

  // Split menu into sections
  const sections: Section[] = [];
  let current: Section = { header: "", items: [] };
  for (const item of visibleMenu) {
    if (isSection(item)) {
      if (current.items.length > 0 || sections.length > 0) sections.push(current);
      current = { header: item.section, items: [] };
    } else {
      current.items.push(item as FlatMenuItem | GroupMenuItem);
    }
  }
  if (current.items.length > 0) sections.push(current);

  return (
    <nav
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group flex h-full flex-col border-r border-border transition-[width] duration-200"
      style={{
        backgroundColor: "#F4F4F8",
        transitionTimingFunction: "cubic-bezier(0.2,0,0,1)",
        width: expanded ? 256 : 48,
        position: collapsed ? "absolute" : "relative",
        ...(collapsed
          ? { top: 0, bottom: 0, left: 0, zIndex: 40, boxShadow: hover ? "rgba(0,0,0,0.1) -4px 9px 25px -6px" : "none" }
          : { minWidth: 256 }),
      }}
    >
      {/* Anchor edge button */}
      <button
        type="button"
        aria-label={collapsed ? "Ancorar menu" : "Soltar menu"}
        onClick={() => { const next = !collapsed; setCollapsed(next); setPinned(!next); }}
        className="absolute z-20 flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background text-muted-foreground shadow opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-foreground"
        style={{ right: -12, top: 12 }}
      >
        {collapsed
          ? <ChevronsRight className="h-3.5 w-3.5" strokeWidth={2} />
          : <ChevronsLeft  className="h-3.5 w-3.5" strokeWidth={2} />
        }
      </button>

      {/* Nav groups */}
      <div className="flex grow flex-col overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: "none" }}>
        {sections.map((section, si) => (
          <NavSection key={`${section.header}-${si}`} section={section} expanded={expanded} index={si} />
        ))}
      </div>

      {/* Kruzer brand footer — mesma estrutura do OMS */}
      <div
        className={cn("flex shrink-0 items-center overflow-hidden border-t border-border", expanded ? "justify-start" : "justify-center")}
        style={{ height: 46, minHeight: 46, ...(expanded ? { paddingLeft: 21, paddingRight: 16 } : {}) }}
      >
        <img
          src={expanded ? "/assets/logo-kruzer-expanded.svg" : "/assets/logo-kruzer-collapsed.svg"}
          alt="Kruzer"
          style={{ height: 20, width: expanded ? "auto" : 20 }}
        />
      </div>

    </nav>
  );
}

// ── Platform Header ───────────────────────────────────────────────────────────

function PlatformHeader({ mode, collapsed, hover }: { mode: TenantMode; collapsed: boolean; hover: boolean }) {
  const expanded = !collapsed || hover;
  return (
    <header
      className="flex shrink-0 items-center bg-card"
      style={{ height: 48, zIndex: 10 }}
    >
      {/* Logo-box — acompanha a largura do sidebar (igual ao OMS) */}
      <div
        className="flex h-full shrink-0 items-center overflow-hidden border-r border-border transition-[width] duration-200"
        style={{
          width: expanded ? 256 : 48,
          backgroundColor: "#F4F4F8",
          transitionTimingFunction: "cubic-bezier(0.2,0,0,1)",
          justifyContent: expanded ? "flex-start" : "center",
          paddingLeft: expanded ? 16 : 0,
        }}
      >
        {expanded && (
          <span className="truncate text-sm font-bold tracking-tight text-foreground">
            {BRAND_NAME[mode]}
          </span>
        )}
      </div>

      {/* Breadcrumb portal target — PageHeader portala aqui */}
      <div id="main-nav" className="flex h-full flex-1 items-center border-b border-border px-6" />
    </header>
  );
}

// ── App Layout ────────────────────────────────────────────────────────────────

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHover,     setSidebarHover]     = useState(false);
  const mode: TenantMode = "custom"; // admin sempre mostra tudo
  const visibleMenu = filterMenu(MENU, mode);

  return (
    <TooltipProvider>
    <div className="flex h-svh flex-col bg-background">
      <PlatformHeader mode={mode} collapsed={sidebarCollapsed} hover={sidebarHover} />

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <AppSidebar
          visibleMenu={visibleMenu}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          onHoverChange={setSidebarHover}
        />

        <main
          className="flex flex-1 flex-col overflow-auto"
          style={{ marginLeft: sidebarCollapsed ? 48 : 0 }}
        >
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
    </TooltipProvider>
  );
}
