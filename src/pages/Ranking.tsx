import { Avatar, AvatarFallback, PageHeader, Pill, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Card, CardContent } from "@kruzer/ds";
import { Medal } from "lucide-react";

type RankEntry = { position: number; name: string; initials: string; points: number; tier: string; segment: string; variation: number };

const RANKING: RankEntry[] = [
  { position: 1, name: "Aline P.",    initials: "AP", points: 98400, tier: "Diamante", segment: "Premium",      variation: +3200 },
  { position: 2, name: "Roberto C.", initials: "RC", points: 87200, tier: "Diamante", segment: "Premium",      variation:  -800 },
  { position: 3, name: "Fernanda G.",initials: "FG", points: 74500, tier: "Ouro",     segment: "Fidelidade",   variation: +1200 },
  { position: 4, name: "Marcos T.",  initials: "MT", points: 62100, tier: "Ouro",     segment: "Fidelidade",   variation:  +500 },
  { position: 5, name: "Juliana M.", initials: "JM", points: 55800, tier: "Ouro",     segment: "Básico",       variation:  -200 },
  { position: 6, name: "Bruno C.",   initials: "BC", points: 43200, tier: "Prata",    segment: "Frete Grátis", variation:  +100 },
  { position: 7, name: "Cecília M.", initials: "CM", points: 38600, tier: "Prata",    segment: "Fidelidade",   variation:  +600 },
  { position: 8, name: "Danilo R.",  initials: "DR", points: 31400, tier: "Bronze",   segment: "Básico",       variation:   -50 },
];

type Tier = "Diamante" | "Ouro" | "Prata" | "Bronze";
const TIER_PILL: Record<Tier, "primary" | "warning" | "secondary" | "muted"> = {
  Diamante: "primary", Ouro: "warning", Prata: "secondary", Bronze: "muted",
};

const podiumColor = ["text-amber-400", "text-slate-400", "text-orange-400"];

const CONFIG = {
  Período:             "01/06/2025 – 30/06/2025",
  Cálculo:             "Pontos acumulados no período",
  "Atualização":       "Diária (02h00)",
  "Critério de empate":"Data de entrada no programa",
};

export default function Ranking() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Ranking"
        path={[{ label: "Análise" }]}
        description={`Período: ${CONFIG["Período"]}`}
      />

      {/* Top 3 podium */}
      <div className="grid gap-4 sm:grid-cols-3">
        {RANKING.slice(0, 3).map((entry) => (
          <Card key={entry.position} className="text-center p-5">
            <div className={`text-3xl font-black ${podiumColor[entry.position - 1]}`}>
              #{entry.position}
            </div>
            <Avatar className="mx-auto mt-3 h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">{entry.initials}</AvatarFallback>
            </Avatar>
            <div className="mt-2 font-semibold text-sm">{entry.name}</div>
            <div className="tabular-nums text-xl font-bold mt-1">{entry.points.toLocaleString("pt-BR")}</div>
            <div className="text-xs text-muted-foreground">pts</div>
            <div className="mt-2 flex justify-center">
              <Pill color={TIER_PILL[entry.tier as Tier]} variant="soft" size="sm">{entry.tier}</Pill>
            </div>
          </Card>
        ))}
      </div>

      {/* Full ranking table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">#</TableHead>
              <TableHead>Membro</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Segmento</TableHead>
              <TableHead className="text-right">Pontos</TableHead>
              <TableHead className="text-right">Variação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {RANKING.map((entry) => (
              <TableRow key={entry.position} className="[&>td]:py-3.5">
                <TableCell>
                  {entry.position <= 3
                    ? <Medal className={`size-4 ${podiumColor[entry.position - 1]}`} />
                    : <span className="text-muted-foreground font-medium text-sm">{entry.position}</span>
                  }
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{entry.initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{entry.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Pill color={TIER_PILL[entry.tier as Tier]} variant="soft" size="sm">{entry.tier}</Pill>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{entry.segment}</TableCell>
                <TableCell className="text-right tabular-nums font-semibold text-sm">
                  {entry.points.toLocaleString("pt-BR")} pts
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm">
                  <span className={entry.variation >= 0 ? "text-success" : "text-destructive"}>
                    {entry.variation >= 0 ? "+" : ""}{entry.variation.toLocaleString("pt-BR")}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Config */}
      <Card>
        <CardContent className="pt-5">
          <dl className="grid gap-3 sm:grid-cols-2">
            {Object.entries(CONFIG).map(([key, value]) => (
              <div key={key} className="rounded-lg bg-muted/30 px-4 py-3">
                <dt className="text-xs text-muted-foreground">{key}</dt>
                <dd className="mt-0.5 text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
