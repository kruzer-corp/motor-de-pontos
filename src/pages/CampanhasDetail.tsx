import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "@kruzer/ds";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

// ── 7 dimensões de uma regra (conforme discovery, seção 2) ─────────────

type DimensionState = {
  id: string;
  num: number;
  label: string;
  desc: string;
  configured: boolean;
  value: string;
};

const CAMPAIGN_DIMENSIONS: Record<string, DimensionState[]> = {
  "CMP-001": [
    { id: "eligibility",  num: 1, label: "Elegibilidade",         configured: true,  value: "Todos os membros · primeira compra · qualquer canal",           desc: "Quem e o quê se qualifica." },
    { id: "points",       num: 2, label: "Pontuação",             configured: true,  value: "500 pontos fixos por transação elegível",                       desc: "Quanto o membro ganha." },
    { id: "release",      num: 3, label: "Liberação",             configured: true,  value: "Imediata após confirmação do pedido",                           desc: "Quando os pontos ficam disponíveis." },
    { id: "expiry",       num: 4, label: "Expiração",             configured: true,  value: "365 dias sem movimentação",                                    desc: "Quando os pontos vencem." },
    { id: "limit",        num: 5, label: "Limite",                configured: true,  value: "1 vez por membro · sem limite de período",                     desc: "Teto por membro ou período." },
    { id: "cancellation", num: 6, label: "Cancelamento",          configured: true,  value: "Estorno total se a compra for cancelada",                      desc: "O que acontece se a compra for cancelada." },
    { id: "priority",     num: 7, label: "Prioridade / Conflito", configured: true,  value: "Acumula com outras regras ativas",                             desc: "Qual regra prevalece quando duas se aplicam." },
  ],
  "CMP-002": [
    { id: "eligibility",  num: 1, label: "Elegibilidade",         configured: true,  value: "Todos os membros · mês do aniversário · qualquer compra",      desc: "Quem e o quê se qualifica." },
    { id: "points",       num: 2, label: "Pontuação",             configured: true,  value: "Multiplicador 2× sobre a regra base",                          desc: "Quanto o membro ganha." },
    { id: "release",      num: 3, label: "Liberação",             configured: true,  value: "Após 7 dias (janela de troca)",                                desc: "Quando os pontos ficam disponíveis." },
    { id: "expiry",       num: 4, label: "Expiração",             configured: true,  value: "365 dias sem movimentação",                                    desc: "Quando os pontos vencem." },
    { id: "limit",        num: 5, label: "Limite",                configured: false, value: "Não configurado",                                              desc: "Teto por membro ou período." },
    { id: "cancellation", num: 6, label: "Cancelamento",          configured: true,  value: "Estorno proporcional ao valor cancelado",                      desc: "O que acontece se a compra for cancelada." },
    { id: "priority",     num: 7, label: "Prioridade / Conflito", configured: true,  value: "A de maior valor vence quando há conflito",                    desc: "Qual regra prevalece quando duas se aplicam." },
  ],
  "CMP-003": [
    { id: "eligibility",  num: 1, label: "Elegibilidade",         configured: true,  value: "Todos os membros · compras acima de R$ 300",                   desc: "Quem e o quê se qualifica." },
    { id: "points",       num: 2, label: "Pontuação",             configured: false, value: "Não configurado",                                              desc: "Quanto o membro ganha." },
    { id: "release",      num: 3, label: "Liberação",             configured: false, value: "Não configurado",                                              desc: "Quando os pontos ficam disponíveis." },
    { id: "expiry",       num: 4, label: "Expiração",             configured: false, value: "Não configurado",                                              desc: "Quando os pontos vencem." },
    { id: "limit",        num: 5, label: "Limite",                configured: false, value: "Não configurado",                                              desc: "Teto por membro ou período." },
    { id: "cancellation", num: 6, label: "Cancelamento",          configured: false, value: "Não configurado",                                              desc: "O que acontece se a compra for cancelada." },
    { id: "priority",     num: 7, label: "Prioridade / Conflito", configured: false, value: "Não configurado",                                              desc: "Qual regra prevalece quando duas se aplicam." },
  ],
};

const FALLBACK: DimensionState[] = CAMPAIGN_DIMENSIONS["CMP-001"].map((d) => ({
  ...d, configured: false, value: "Não configurado",
}));

const STATUS_LABEL: Record<string, string> = {
  Ativa:   "bg-emerald-100 text-emerald-700",
  Pausa:   "bg-amber-100 text-amber-700",
  Rascunho:"bg-slate-100 text-slate-700",
};

const CAMPAIGN_META: Record<string, { title: string; status: string }> = {
  "CMP-001": { title: "Bônus de boas-vindas", status: "Ativa" },
  "CMP-002": { title: "Dobro no aniversário",  status: "Pausa" },
  "CMP-003": { title: "Super compra",          status: "Rascunho" },
};

export default function CampanhasDetail() {
  const { id } = useParams<{ id: string }>();
  const dimensions = (id && CAMPAIGN_DIMENSIONS[id]) ? CAMPAIGN_DIMENSIONS[id] : FALLBACK;
  const meta = (id && CAMPAIGN_META[id]) ? CAMPAIGN_META[id] : { title: id ?? "Campanha", status: "Rascunho" };
  const [selected, setSelected] = useState<string | null>(null);

  const configured = dimensions.filter((d) => d.configured).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/campanhas"><ArrowLeft className="size-4 mr-1.5" />Campanhas</Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{meta.title}</h1>
              <Badge className={STATUS_LABEL[meta.status] ?? "bg-muted"}>{meta.status}</Badge>
              <span className="font-mono text-xs text-muted-foreground">{id}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {configured}/7 dimensões configuradas
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/campanhas/nova">Editar regra</Link>
        </Button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-border">
        <div
          className="h-1.5 rounded-full bg-primary transition-all"
          style={{ width: `${(configured / 7) * 100}%` }}
        />
      </div>

      {/* Dimensions */}
      <Card>
        <CardHeader>
          <CardTitle>As 7 dimensões da regra</CardTitle>
        </CardHeader>
        <div className="divide-y divide-border">
          {dimensions.map((dim) => (
            <button
              key={dim.id}
              onClick={() => setSelected(selected === dim.id ? null : dim.id)}
              className="flex w-full items-center gap-4 px-5 py-4 hover:bg-muted/20 text-left transition-colors"
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                dim.configured ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {dim.num}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{dim.label}</span>
                  {dim.configured ? (
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="size-3.5 text-muted-foreground/40 shrink-0" />
                  )}
                </div>
                <div className={`text-xs mt-0.5 ${dim.configured ? "text-foreground" : "text-muted-foreground italic"}`}>
                  {selected === dim.id ? dim.desc : dim.value}
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Context note */}
      <Card className="border-sky-200 bg-sky-50 p-4">
        <CardContent className="p-0 text-xs text-sky-800 space-y-1">
          <div className="font-semibold mb-1">Por que 7 dimensões?</div>
          <p>Toda regra de pontuação tem estas 7 decisões: <strong>quem</strong> se qualifica (elegibilidade), <strong>quanto</strong> ganha (pontuação), <strong>quando</strong> fica disponível (liberação), <strong>quando</strong> vence (expiração), <strong>até quanto</strong> (limite), <strong>o que</strong> acontece no cancelamento, e qual regra vence em caso de conflito (prioridade).</p>
        </CardContent>
      </Card>
    </div>
  );
}
