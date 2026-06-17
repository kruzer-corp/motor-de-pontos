import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@kruzer-corp/ds";
import { Archive, RotateCcw } from "lucide-react";

type CampaignStatus = "Ativa" | "Pausa" | "Rascunho" | "Encerrada" | "Arquivada";

type Campaign = {
  id: string;
  title: string;
  status: CampaignStatus;
  description: string;
  color: string;
  endDate?: string;
};

const STATUS_COLOR: Record<CampaignStatus, string> = {
  Ativa: "bg-emerald-100 text-emerald-700",
  Pausa: "bg-amber-100 text-amber-700",
  Rascunho: "bg-slate-100 text-slate-700",
  Encerrada: "bg-red-100 text-red-600",
  Arquivada: "bg-slate-100 text-slate-400",
};

const INITIAL_CAMPAIGNS: Campaign[] = [
  { id: "CMP-001", title: "Bônus de boas-vindas", status: "Ativa", description: "Pontos na primeira compra.", color: "bg-emerald-500" },
  { id: "CMP-002", title: "Dobro no aniversário", status: "Pausa", description: "2× pontos no mês de aniversário.", color: "bg-violet-500" },
  { id: "CMP-003", title: "Super compra", status: "Rascunho", description: "Pontos extras para compras acima de R$300.", color: "bg-blue-500" },
  { id: "CMP-004", title: "Super Junho", status: "Encerrada", description: "2× pontos em Eletrônicos durante junho.", color: "bg-sky-500", endDate: "30/06/2025" },
  { id: "CMP-005", title: "Dia das Mães 2025", status: "Arquivada", description: "Pontos em dobro para compras de presente.", color: "bg-pink-500", endDate: "12/05/2025" },
  { id: "CMP-006", title: "Carnaval Premiado", status: "Arquivada", description: "3× pontos nos dias de Carnaval.", color: "bg-orange-500", endDate: "04/03/2025" },
];

export default function Campanhas() {
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);

  const archive = (id: string) =>
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Arquivada" as CampaignStatus } : c))
    );

  const unarchive = (id: string) =>
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Encerrada" as CampaignStatus } : c))
    );

  const active = campaigns.filter((c) => c.status !== "Arquivada");
  const archived = campaigns.filter((c) => c.status === "Arquivada");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Campanhas</h2>
          <p className="text-sm text-muted-foreground">Regras e status do programa.</p>
        </div>
        <Button asChild size="sm">
          <Link to="/campanhas/nova">+ Nova campanha</Link>
        </Button>
      </div>

      <Tabs defaultValue="ativas">
        <TabsList>
          <TabsTrigger value="ativas">Ativas / Pausadas ({active.length})</TabsTrigger>
          <TabsTrigger value="arquivadas">
            <Archive className="size-3.5 mr-1.5" />
            Arquivadas ({archived.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Active campaigns ── */}
        <TabsContent value="ativas" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {active.map((camp) => (
              <Card key={camp.id} className="overflow-hidden">
                <div className={`h-2 ${camp.color}`} />
                <CardHeader className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>{camp.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{camp.description}</p>
                    {camp.endDate && (
                      <p className="text-xs text-muted-foreground mt-1">Encerrada em {camp.endDate}</p>
                    )}
                  </div>
                  <Badge className={STATUS_COLOR[camp.status]}>{camp.status}</Badge>
                </CardHeader>
                <div className="flex items-center justify-between border-t border-border px-6 py-3 gap-2">
                  <div className="text-xs text-muted-foreground font-mono">{camp.id}</div>
                  <div className="flex gap-2">
                    {camp.status === "Encerrada" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => archive(camp.id)}
                      >
                        <Archive className="size-3 mr-1" />
                        Arquivar
                      </Button>
                    )}
                    <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                      <Link to={`/campanhas/${camp.id}`}>Ver detalhes</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Archived campaigns ── */}
        <TabsContent value="arquivadas" className="mt-4">
          {archived.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhuma campanha arquivada.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {archived.map((camp) => (
                <Card key={camp.id} className="overflow-hidden opacity-80">
                  <div className={`h-1 ${camp.color}`} />
                  <CardHeader className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base text-muted-foreground">{camp.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{camp.description}</p>
                      {camp.endDate && (
                        <p className="text-xs text-muted-foreground mt-1">Encerrada em {camp.endDate}</p>
                      )}
                    </div>
                    <Badge className={STATUS_COLOR[camp.status]}>{camp.status}</Badge>
                  </CardHeader>
                  <div className="flex items-center justify-between border-t border-border px-6 py-3 gap-2">
                    <div className="text-xs text-muted-foreground font-mono">{camp.id}</div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 text-muted-foreground"
                        onClick={() => unarchive(camp.id)}
                      >
                        <RotateCcw className="size-3 mr-1" />
                        Desarquivar
                      </Button>
                      <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                        <Link to={`/campanhas/${camp.id}`}>Ver detalhes</Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
