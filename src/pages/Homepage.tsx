import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Switch, Badge } from "@kruzer/ds";
import { PanelTop, GripVertical, Pencil, Eye, X, ShoppingBag, Star, ChevronDown } from "lucide-react";

type SectionType = "hero" | "banners" | "featured" | "ranking" | "editorial" | "cta" | "faq";

type Section = {
  id: string;
  type: SectionType;
  label: string;
  description: string;
  active: boolean;
  order: number;
};

const TYPE_COLOR: Record<SectionType, string> = {
  hero: "bg-violet-100 text-violet-700",
  banners: "bg-sky-100 text-sky-700",
  featured: "bg-amber-100 text-amber-700",
  ranking: "bg-emerald-100 text-emerald-700",
  editorial: "bg-slate-100 text-slate-700",
  cta: "bg-orange-100 text-orange-700",
  faq: "bg-pink-100 text-pink-700",
};

const INITIAL_SECTIONS: Section[] = [
  { id: "s1", type: "hero", label: "Hero Principal", description: "Banner em tela cheia com chamada para ação principal do programa.", active: true, order: 1 },
  { id: "s2", type: "banners", label: "Banners Rotativos", description: "Carrossel de até 5 banners de campanhas ativas.", active: true, order: 2 },
  { id: "s3", type: "featured", label: "Produtos em Destaque", description: "Grid de produtos mais resgatados no período.", active: true, order: 3 },
  { id: "s4", type: "ranking", label: "Ranking de Membros", description: "Top 5 membros do mês com pontuação.", active: true, order: 4 },
  { id: "s5", type: "editorial", label: "Conteúdo Editorial", description: "Artigos e dicas sobre o programa FAST PRO.", active: false, order: 5 },
  { id: "s6", type: "cta", label: "Convite para Cadastro", description: "Bloco de CTA para membros não cadastrados.", active: true, order: 6 },
  { id: "s7", type: "faq", label: "Perguntas Frequentes", description: "Accordion com as principais dúvidas sobre o programa.", active: false, order: 7 },
];

// ── Wireframe sections ────────────────────────────────────────────────────────

function WFNav() {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-24 h-5 bg-slate-800 rounded" />
        <div className="hidden sm:flex gap-4">
          {["Programa", "Produtos", "Ranking", "FAQ"].map(l => (
            <div key={l} className="text-[11px] text-slate-400">{l}</div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-16 h-7 rounded-full bg-slate-100 border border-slate-200" />
        <div className="w-20 h-7 rounded-full bg-slate-800" />
      </div>
    </div>
  );
}

function WFLabel({ label }: { label: string }) {
  return (
    <div className="absolute top-2 right-2 bg-violet-600 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded z-10 opacity-80">
      {label}
    </div>
  );
}

function WFHero() {
  return (
    <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 px-8 py-12">
      <WFLabel label="hero" />
      <div className="max-w-lg">
        <div className="w-32 h-3 bg-white/20 rounded mb-4" />
        <div className="w-72 h-7 bg-white/40 rounded mb-2" />
        <div className="w-56 h-7 bg-white/30 rounded mb-5" />
        <div className="w-48 h-4 bg-white/20 rounded mb-1" />
        <div className="w-40 h-4 bg-white/15 rounded mb-8" />
        <div className="flex gap-3">
          <div className="w-32 h-9 rounded-full bg-amber-400/80" />
          <div className="w-24 h-9 rounded-full border border-white/30" />
        </div>
      </div>
      <div className="absolute right-8 top-1/2 -translate-y-1/2 w-40 h-32 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
        <ShoppingBag className="text-white/30 size-10" />
      </div>
    </div>
  );
}

function WFBanners() {
  return (
    <div className="relative bg-white px-6 py-6">
      <WFLabel label="banners" />
      <div className="w-24 h-3 bg-slate-200 rounded mb-4" />
      <div className="flex gap-3">
        {[0,1,2].map(i => (
          <div key={i} className={`flex-1 h-24 rounded-xl ${i === 0 ? "bg-amber-100" : "bg-slate-100"} border border-slate-200 flex items-center justify-center`}>
            <div className="space-y-2 w-full px-4">
              <div className="w-16 h-2.5 bg-slate-300 rounded" />
              <div className="w-12 h-2 bg-slate-200 rounded" />
              <div className="w-10 h-5 rounded-full bg-slate-300" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {[0,1,2].map(i => <div key={i} className={`rounded-full ${i === 0 ? "w-4 h-1.5 bg-slate-700" : "w-1.5 h-1.5 bg-slate-300"}`} />)}
      </div>
    </div>
  );
}

function WFFeatured() {
  return (
    <div className="relative bg-slate-50 px-6 py-6">
      <WFLabel label="featured" />
      <div className="flex items-center justify-between mb-4">
        <div className="w-32 h-3 bg-slate-300 rounded" />
        <div className="w-16 h-3 bg-slate-200 rounded" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[0,1,2].map(i => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="h-20 bg-slate-100 flex items-center justify-center">
              <ShoppingBag className="text-slate-300 size-6" />
            </div>
            <div className="p-3 space-y-1.5">
              <div className="w-full h-2.5 bg-slate-200 rounded" />
              <div className="w-2/3 h-2 bg-slate-100 rounded" />
              <div className="w-12 h-5 bg-amber-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WFRanking() {
  const names = ["A. Silva", "B. Costa", "C. Mendes", "D. Rocha", "E. Lima"];
  const pts = [4820, 3910, 3540, 2970, 2410];
  return (
    <div className="relative bg-white px-6 py-6">
      <WFLabel label="ranking" />
      <div className="w-32 h-3 bg-slate-200 rounded mb-4" />
      <div className="space-y-2">
        {names.map((n, i) => (
          <div key={n} className="flex items-center gap-3 py-2 border-b border-slate-100">
            <span className={`text-xs font-bold w-5 text-center ${i === 0 ? "text-amber-500" : "text-slate-400"}`}>{i + 1}</span>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${i === 0 ? "bg-amber-400" : "bg-slate-300"}`}>
              {n[0]}
            </div>
            <div className="flex-1">
              <div className="w-20 h-2.5 bg-slate-200 rounded mb-1" />
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-300 rounded-full" style={{ width: `${(pts[i] / 5000) * 100}%` }} />
              </div>
            </div>
            <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-0.5">
              <Star className="size-3 text-amber-400 fill-amber-400" />
              {pts[i].toLocaleString("pt-BR")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WFEditorial() {
  return (
    <div className="relative bg-slate-50 px-6 py-6">
      <WFLabel label="editorial" />
      <div className="w-32 h-3 bg-slate-300 rounded mb-4" />
      <div className="grid grid-cols-2 gap-3">
        {[0,1].map(i => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="h-20 bg-slate-100" />
            <div className="p-3 space-y-1.5 flex-1">
              <div className="w-12 h-4 bg-violet-100 rounded-full" />
              <div className="w-full h-2.5 bg-slate-200 rounded" />
              <div className="w-3/4 h-2.5 bg-slate-200 rounded" />
              <div className="w-16 h-2 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WFCTA() {
  return (
    <div className="relative bg-gradient-to-r from-violet-700 to-violet-900 px-6 py-10 text-center">
      <WFLabel label="cta" />
      <div className="flex flex-col items-center gap-3">
        <div className="w-48 h-5 bg-white/30 rounded mx-auto" />
        <div className="w-64 h-3 bg-white/20 rounded mx-auto" />
        <div className="w-40 h-3 bg-white/15 rounded mx-auto" />
        <div className="w-36 h-9 rounded-full bg-amber-400/80 mt-3" />
      </div>
    </div>
  );
}

function WFFAQ() {
  return (
    <div className="relative bg-white px-6 py-6">
      <WFLabel label="faq" />
      <div className="w-32 h-3 bg-slate-200 rounded mb-4" />
      <div className="space-y-2">
        {[0,1,2,3].map(i => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100">
            <div className={`h-2.5 bg-slate-200 rounded ${i === 0 ? "w-56" : i === 1 ? "w-48" : i === 2 ? "w-52" : "w-44"}`} />
            <ChevronDown className="size-4 text-slate-300 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

const WIREFRAMES: Record<SectionType, () => React.ReactElement> = {
  hero: WFHero,
  banners: WFBanners,
  featured: WFFeatured,
  ranking: WFRanking,
  editorial: WFEditorial,
  cta: WFCTA,
  faq: WFFAQ,
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Homepage() {
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [saved, setSaved] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const toggleSection = (id: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
    setSaved(false);
  };

  const moveUp = (id: string) => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx === 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
    setSaved(false);
  };

  const moveDown = (id: string) => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
    setSaved(false);
  };

  const handleSave = () => setSaved(true);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <PanelTop className="size-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">Layout da Homepage</h2>
            <p className="text-sm text-muted-foreground">Gerencie seções e ordem de exibição.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
            <Eye className="size-3.5 mr-1.5" />
            Prévia
          </Button>
          <Button size="sm" onClick={handleSave}>
            {saved ? "✓ Salvo" : "Publicar alterações"}
          </Button>
        </div>
      </div>

      {/* Live preview sketch */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm">Prévia estrutural</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 bg-muted/40 px-4 py-2.5 border-b border-border">
              <div className="flex gap-1.5">
                {["bg-red-400", "bg-amber-400", "bg-emerald-400"].map((c) => (
                  <div key={c} className={`h-3 w-3 rounded-full ${c}`} />
                ))}
              </div>
              <div className="flex-1 mx-2 rounded-full bg-background border border-border px-3 py-1 text-xs text-muted-foreground">
                fastpro.com.br/pro
              </div>
            </div>
            {/* Page sections */}
            <div className="divide-y divide-border/50">
              {sections
                .filter((s) => s.active)
                .map((section) => (
                  <div
                    key={section.id}
                    className={`flex items-center gap-3 px-4 py-3 text-xs font-medium ${TYPE_COLOR[section.type]}`}
                  >
                    <div className="flex-1">{section.label}</div>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      seção {section.order}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section manager */}
      <Card>
        <CardHeader>
          <CardTitle>Seções da página</CardTitle>
        </CardHeader>
        <div className="divide-y divide-border">
          {sections.map((section, idx) => (
            <div
              key={section.id}
              className={`flex items-center gap-4 px-5 py-4 ${!section.active ? "opacity-50" : ""}`}
            >
              {/* Drag handle (visual only) */}
              <div className="flex flex-col gap-0.5 shrink-0 text-muted-foreground">
                <button
                  onClick={() => moveUp(section.id)}
                  disabled={idx === 0}
                  className="disabled:opacity-30 hover:text-foreground transition-colors text-[10px] leading-none"
                >
                  ▲
                </button>
                <GripVertical className="size-4" />
                <button
                  onClick={() => moveDown(section.id)}
                  disabled={idx === sections.length - 1}
                  className="disabled:opacity-30 hover:text-foreground transition-colors text-[10px] leading-none"
                >
                  ▼
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${TYPE_COLOR[section.type]}`}
                  >
                    {section.type}
                  </span>
                  <span className="font-medium">{section.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  <Pencil className="size-3 mr-1" />
                  Editar
                </Button>
                <Switch
                  checked={section.active}
                  onCheckedChange={() => toggleSection(section.id)}
                  size="sm"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Hotsite preview overlay ── */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6" onClick={() => setPreviewOpen(false)}>
          <div
            className="bg-background rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <span className="text-sm font-medium text-foreground">Prévia — FastShop PRO</span>
              <button onClick={() => setPreviewOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="size-4" />
              </button>
            </div>
            {/* Browser chrome */}
            <div className="flex items-center gap-2 bg-muted/40 px-4 py-2 border-b border-border shrink-0">
              <div className="flex gap-1.5">
                {["bg-red-400","bg-amber-400","bg-emerald-400"].map(c => (
                  <div key={c} className={`h-2.5 w-2.5 rounded-full ${c}`} />
                ))}
              </div>
              <div className="flex-1 mx-2 rounded-full bg-background border border-border px-3 py-1 text-xs text-muted-foreground">
                fastpro.com.br/programa
              </div>
            </div>
            {/* Wireframe content */}
            <div className="overflow-y-auto flex-1 bg-white">
              <WFNav />
              {sections
                .filter(s => s.active)
                .map(section => {
                  const Comp = WIREFRAMES[section.type];
                  return <div key={section.id} className="relative"><Comp /></div>;
                })}
              <div className="bg-slate-800 px-6 py-5 flex items-center justify-between">
                <div className="w-20 h-3 bg-white/20 rounded" />
                <div className="flex gap-4">
                  {[0,1,2].map(i => <div key={i} className="w-14 h-2 bg-white/15 rounded" />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
