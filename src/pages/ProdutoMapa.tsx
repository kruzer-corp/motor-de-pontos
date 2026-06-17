import { Card, CardTitle } from "@kruzer-corp/ds";
import { LAYER_CONFIG } from "../layout/AppLayout";

type FeatureEntry = {
  label: string;
  route: string;
  note?: string;
};

type Section = {
  layer: keyof typeof LAYER_CONFIG;
  title: string;
  subtitle: string;
  features: FeatureEntry[];
};

const SECTIONS: Section[] = [
  {
    layer: "core",
    title: "Produto white-label core",
    subtitle: "Qualquer tenant Kruzer recebe isso por padrão.",
    features: [
      { label: "Dashboard operacional", route: "/" },
      { label: "Dashboard de Resultados (ROI, tier, canais)", route: "/dashboard-resultados" },
      { label: "Lista de membros", route: "/membros" },
      { label: "Estrutura de tiers", route: "/membros/tier" },
      { label: "Extrato de pontos por pedido", route: "/membros/extrato" },
      { label: "Ajuste manual + motivo + log", route: "/membros/ajuste" },
      { label: "Minha Conta — Dados + Resgates", route: "/minha-conta", note: "Tab Informes é custom BR" },
      { label: "Catálogo de produtos + PDP", route: "/catalogo" },
      { label: "Grupos de catálogo", route: "/catalogo/grupos" },
      { label: "Campanhas + 7 políticas + arquivamento", route: "/campanhas" },
      { label: "Motor de Resgate (pipeline)", route: "/recompensas" },
      { label: "Catálogo de resgate + checkout", route: "/recompensas/catalogo" },
      { label: "Comunicações transacionais", route: "/comunicacoes" },
      { label: "Histórico de comunicados", route: "/comunicados" },
      { label: "Usuários & Papéis (IAM + RBAC)", route: "/usuarios" },
      { label: "Audit logs de lançamento manual", route: "/logs" },
      { label: "Theming da tela de login", route: "/login-config", note: "Conteúdo (links Fast PRO) é custom" },
      { label: "Níveis", route: "/niveis" },
      { label: "Canais", route: "/canais" },
      { label: "Pedidos", route: "/pedidos", note: "Colunas GAN/coordenador são custom" },
      { label: "Configuração do programa", route: "/config" },
    ],
  },
  {
    layer: "module",
    title: "Módulos de produto",
    subtitle: "Opcionais. Kruzer mantém, tenant habilita.",
    features: [
      { label: "Ranking (gamificação)", route: "/ranking" },
      { label: "Segmentação de membros", route: "/membros/segmentos" },
      { label: "Afiliados (base)", route: "/afiliados", note: "GAN + coordenador são campos custom dentro" },
      { label: "Conteúdo editorial", route: "/conteudo" },
      { label: "Atualização de catálogo 3P", route: "/catalogo/atualizacao" },
      { label: "Indicações de venda", route: "/indicacoes" },
    ],
  },
  {
    layer: "custom",
    title: "Custom Fast PRO",
    subtitle: "Construído para Fast PRO. Não generaliza como está — requer refactor antes do próximo cliente.",
    features: [
      {
        label: "Fluxo documental RPA (PF) + NF (PJ)",
        route: "/recompensas/documental",
        note: "Fiscal/tributário BR de incentivo. Nenhum dos 16 players globais implementa isso.",
      },
      {
        label: "Informes de Rendimento (tab Minha Conta)",
        route: "/minha-conta",
        note: "Declaração IR pessoa física BR.",
      },
      {
        label: "Campos GAN + Coordenador",
        route: "/afiliados",
        note: "Atributos internos Fast PRO. No produto: campos custom configuráveis pelo tenant.",
      },
      {
        label: "Homepage gerenciável",
        route: "/homepage",
        note: "Estrutura e tipos de seção refletem o site Fast PRO. No white-label: theming por tenant.",
      },
      {
        label: "Banners rotativos (CMS)",
        route: "/banners",
        note: "Estrutura correta, dados hardcoded para Fast PRO. Refactor: CMS dinâmico por tenant.",
      },
      {
        label: "Links institucionais (Conformidade + Login)",
        route: "/conformidade",
        note: "URLs fastpro.com.br hardcoded. Deve vir de configuração por tenant.",
      },
    ],
  },
  {
    layer: "br",
    title: "Produto BR",
    subtitle: "Legítimo para o mercado brasileiro. Fraco no benchmark global — manter como módulo BR, não core.",
    features: [
      {
        label: "Conformidade — Regulamento + Termo de Adesão",
        route: "/conformidade",
        note: "Nenhum dos 16 players no benchmark exibiu isso. Produto para LGPD + contexto BR.",
      },
      {
        label: "Aceite por perfil",
        route: "/conformidade",
        note: "Decorre da Conformidade.",
      },
    ],
  },
];

const COUNTS = {
  core: SECTIONS.find((s) => s.layer === "core")!.features.length,
  module: SECTIONS.find((s) => s.layer === "module")!.features.length,
  custom: SECTIONS.find((s) => s.layer === "custom")!.features.length,
  br: SECTIONS.find((s) => s.layer === "br")!.features.length,
};

export default function ProdutoMapa() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Mapa do Produto</h2>
        <p className="text-sm text-muted-foreground">
          Classificação de cada feature: produto white-label Kruzer vs. customização Fast PRO.
        </p>
      </div>

      {/* Summary bar */}
      <div className="grid gap-3 sm:grid-cols-4">
        {(Object.keys(LAYER_CONFIG) as (keyof typeof LAYER_CONFIG)[]).map((key) => {
          const cfg = LAYER_CONFIG[key];
          return (
            <div
              key={key}
              className={`rounded-2xl border px-4 py-3 ${cfg.pill}`}
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                <span className="text-xs font-semibold uppercase tracking-wide">{cfg.label}</span>
              </div>
              <div className="mt-1 text-2xl font-bold">{COUNTS[key]}</div>
              <div className="text-xs opacity-70">
                {key === "core" && "features core"}
                {key === "module" && "módulos opcionais"}
                {key === "custom" && "itens custom"}
                {key === "br" && "específicos BR"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sections */}
      {SECTIONS.map((section) => {
        const cfg = LAYER_CONFIG[section.layer];
        return (
          <Card key={section.layer} className="overflow-hidden">
            {/* Section header */}
            <div className={`border-b border-border px-5 py-4 ${cfg.pill}`}>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${cfg.dot}`} />
                <CardTitle className="text-sm">{section.title}</CardTitle>
              </div>
              <p className="mt-0.5 text-xs opacity-80 ml-[18px]">{section.subtitle}</p>
            </div>

            {/* Feature list */}
            <div className="divide-y divide-border">
              {section.features.map((feature) => (
                <div key={feature.label + feature.route} className="flex items-start gap-4 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{feature.label}</div>
                    {feature.note && (
                      <div className="mt-0.5 text-xs text-muted-foreground">{feature.note}</div>
                    )}
                  </div>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {feature.route}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      {/* Refactor notes */}
      <Card className="border-amber-200 bg-amber-50 p-5">
        <div className="text-sm font-semibold text-amber-800 mb-3">
          O que precisa acontecer antes do próximo cliente
        </div>
        <ol className="space-y-2 text-sm text-amber-800 list-decimal list-inside">
          <li>
            <strong>GAN + coordenador</strong> → transformar em campos custom configuráveis por tenant no módulo de afiliados
          </li>
          <li>
            <strong>Fluxo documental + Informes de Rendimento</strong> → isolar como módulo <code className="bg-amber-100 px-1 rounded text-xs">fiscal-br</code>, desabilitado fora do Brasil
          </li>
          <li>
            <strong>Homepage + Banners</strong> → dados devem vir de API de theming por tenant, não hardcoded para Fast PRO
          </li>
          <li>
            <strong>Links institucionais (Conformidade + Login)</strong> → campo configurável por tenant (<code className="bg-amber-100 px-1 rounded text-xs">institutionalUrl</code>)
          </li>
          <li>
            <strong>Conformidade</strong> → mover para módulo <code className="bg-amber-100 px-1 rounded text-xs">compliance-br</code>, desabilitado por padrão globalmente
          </li>
        </ol>
      </Card>
    </div>
  );
}
