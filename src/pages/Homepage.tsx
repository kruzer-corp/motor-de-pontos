import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Switch, Badge } from "@kruzer/ds";
import { PanelTop, GripVertical, Pencil, Eye } from "lucide-react";

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

export default function Homepage() {
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [saved, setSaved] = useState(false);

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
            <h2 className="text-lg font-semibold">Layout da Homepage — FAST PRO</h2>
            <p className="text-sm text-muted-foreground">Gerencie seções e ordem de exibição.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
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
    </div>
  );
}
