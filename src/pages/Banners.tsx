import { useState } from "react";
import { Card, CardHeader, CardTitle, Button, Badge, Switch, Input } from "@kruzer/ds";
import { Image, Plus, Pencil, Trash2, GripVertical, ExternalLink } from "lucide-react";

type BannerStatus = "ativo" | "agendado" | "expirado" | "rascunho";

type Banner = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaUrl: string;
  startDate: string;
  endDate: string;
  status: BannerStatus;
  active: boolean;
  order: number;
  bg: string;
};

const STATUS_COLOR: Record<BannerStatus, string> = {
  ativo: "bg-emerald-100 text-emerald-700",
  agendado: "bg-sky-100 text-sky-700",
  expirado: "bg-slate-100 text-slate-500",
  rascunho: "bg-amber-100 text-amber-700",
};

const BG_PALETTE = [
  "from-violet-600 to-indigo-700",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-sky-500 to-blue-600",
  "from-pink-500 to-rose-600",
];

const INITIAL_BANNERS: Banner[] = [
  {
    id: "BNR-001",
    title: "Junho Vale Mais",
    subtitle: "Ganhe pontos em dobro em Eletrônicos até 30/06.",
    cta: "Ver produtos",
    ctaUrl: "/catalogo",
    startDate: "01/06/2025",
    endDate: "30/06/2025",
    status: "ativo",
    active: true,
    order: 1,
    bg: BG_PALETTE[0],
  },
  {
    id: "BNR-002",
    title: "Seu Aniversário é Especial",
    subtitle: "3× de pontos no mês do seu aniversário.",
    cta: "Saiba mais",
    ctaUrl: "/campanhas",
    startDate: "01/01/2025",
    endDate: "31/12/2025",
    status: "ativo",
    active: true,
    order: 2,
    bg: BG_PALETTE[1],
  },
  {
    id: "BNR-003",
    title: "Resgate Agora",
    subtitle: "Mais de 80 produtos disponíveis para resgate.",
    cta: "Ver catálogo",
    ctaUrl: "/recompensas/catalogo",
    startDate: "15/06/2025",
    endDate: "15/07/2025",
    status: "ativo",
    active: true,
    order: 3,
    bg: BG_PALETTE[2],
  },
  {
    id: "BNR-004",
    title: "Black Friday em Julho",
    subtitle: "Campanhas especiais já a partir de 15/07.",
    cta: "Fique ligado",
    ctaUrl: "/campanhas",
    startDate: "15/07/2025",
    endDate: "31/07/2025",
    status: "agendado",
    active: false,
    order: 4,
    bg: BG_PALETTE[3],
  },
  {
    id: "BNR-005",
    title: "Dia das Mães",
    subtitle: "Pontos em dobro para compras de presente.",
    cta: "Ver mais",
    ctaUrl: "/campanhas",
    startDate: "01/05/2025",
    endDate: "12/05/2025",
    status: "expirado",
    active: false,
    order: 5,
    bg: BG_PALETTE[4],
  },
];

export default function Banners() {
  const [banners, setBanners] = useState(INITIAL_BANNERS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", subtitle: "", cta: "", ctaUrl: "" });

  const toggleActive = (id: string) =>
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b)));

  const remove = (id: string) =>
    setBanners((prev) => prev.filter((b) => b.id !== id));

  const openEdit = (b: Banner) => {
    setEditingId(b.id);
    setEditForm({ title: b.title, subtitle: b.subtitle, cta: b.cta, ctaUrl: b.ctaUrl });
  };

  const saveEdit = () => {
    setBanners((prev) =>
      prev.map((b) => (b.id === editingId ? { ...b, ...editForm } : b))
    );
    setEditingId(null);
  };

  const moveUp = (id: string) =>
    setBanners((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next.map((b, i) => ({ ...b, order: i + 1 }));
    });

  const moveDown = (id: string) =>
    setBanners((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next.map((b, i) => ({ ...b, order: i + 1 }));
    });

  const activeCount = banners.filter((b) => b.active).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Image className="size-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">Banners Rotativos</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie o carrossel de banners da homepage.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{activeCount} ativo{activeCount !== 1 ? "s" : ""}</Badge>
          <Button size="sm">
            <Plus className="size-3.5 mr-1.5" />
            Novo banner
          </Button>
        </div>
      </div>

      {/* Preview carousel */}
      <div className="grid gap-3 sm:grid-cols-3">
        {banners.filter((b) => b.active).slice(0, 3).map((banner) => (
          <div
            key={banner.id}
            className={`rounded-2xl bg-gradient-to-br ${banner.bg} p-5 text-white`}
          >
            <div className="font-bold text-lg leading-tight">{banner.title}</div>
            <div className="mt-1 text-sm text-white/80 leading-snug">{banner.subtitle}</div>
            <div className="mt-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              {banner.cta} →
            </div>
          </div>
        ))}
      </div>

      {/* Edit inline panel */}
      {editingId && (
        <Card className="border-primary/30 bg-primary/5 p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Título", key: "title" as const },
              { label: "Subtítulo", key: "subtitle" as const },
              { label: "Texto do botão", key: "cta" as const },
              { label: "URL do botão", key: "ctaUrl" as const },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-xs text-muted-foreground mb-1">{label}</label>
                <Input
                  value={editForm[key]}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={saveEdit}>Salvar</Button>
            <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancelar</Button>
          </div>
        </Card>
      )}

      {/* Banner list */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os banners</CardTitle>
        </CardHeader>
        <div className="divide-y divide-border">
          {banners.map((banner, idx) => (
            <div key={banner.id} className={`flex items-center gap-4 px-5 py-4 ${!banner.active ? "opacity-60" : ""}`}>
              {/* Order controls */}
              <div className="flex flex-col items-center gap-0.5 shrink-0 text-muted-foreground">
                <button onClick={() => moveUp(banner.id)} disabled={idx === 0} className="disabled:opacity-30 text-[10px]">▲</button>
                <GripVertical className="size-4" />
                <button onClick={() => moveDown(banner.id)} disabled={idx === banners.length - 1} className="disabled:opacity-30 text-[10px]">▼</button>
              </div>

              {/* Color swatch */}
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${banner.bg} shrink-0`} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{banner.title}</span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[banner.status]}`}>
                    {banner.status}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">{banner.subtitle}</div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{banner.startDate} → {banner.endDate}</span>
                  <span className="flex items-center gap-0.5">
                    <ExternalLink className="size-3" />
                    {banner.ctaUrl}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => openEdit(banner)}>
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => remove(banner.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
                <Switch checked={banner.active} onCheckedChange={() => toggleActive(banner.id)} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
