import { Card, CardHeader, CardTitle, CardContent, Avatar, AvatarFallback } from "@kruzer-corp/ds";
import { Trophy, Medal } from "lucide-react";

type RankEntry = {
  position: number;
  name: string;
  initials: string;
  points: number;
  tier: string;
  segment: string;
  variation: number;
};

const RANKING: RankEntry[] = [
  { position: 1, name: "Aline P.", initials: "AP", points: 98400, tier: "Diamante", segment: "Premium", variation: +3200 },
  { position: 2, name: "Roberto C.", initials: "RC", points: 87200, tier: "Diamante", segment: "Premium", variation: -800 },
  { position: 3, name: "Fernanda G.", initials: "FG", points: 74500, tier: "Ouro", segment: "Fidelidade", variation: +1200 },
  { position: 4, name: "Marcos T.", initials: "MT", points: 62100, tier: "Ouro", segment: "Fidelidade", variation: +500 },
  { position: 5, name: "Juliana M.", initials: "JM", points: 55800, tier: "Ouro", segment: "Básico", variation: -200 },
  { position: 6, name: "Bruno C.", initials: "BC", points: 43200, tier: "Prata", segment: "Frete Grátis", variation: +100 },
  { position: 7, name: "Cecília M.", initials: "CM", points: 38600, tier: "Prata", segment: "Fidelidade", variation: +600 },
  { position: 8, name: "Danilo R.", initials: "DR", points: 31400, tier: "Bronze", segment: "Básico", variation: -50 },
];

const tierColor: Record<string, string> = {
  Diamante: "bg-violet-100 text-violet-700",
  Ouro: "bg-amber-100 text-amber-700",
  Prata: "bg-slate-100 text-slate-700",
  Bronze: "bg-orange-100 text-orange-700",
};

const podiumColor = ["text-amber-400", "text-slate-400", "text-orange-400"];

const CONFIG = {
  period: "01/06/2025 – 30/06/2025",
  calculation: "Pontos acumulados no período",
  updateFrequency: "Diária (02h00)",
  tieBreaker: "Data de entrada no programa",
};

export default function Ranking() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="size-6 text-amber-400" />
        <div>
          <h2 className="text-lg font-semibold">Ranking de Membros</h2>
          <p className="text-sm text-muted-foreground">Período: {CONFIG.period}</p>
        </div>
      </div>

      {/* Top 3 podium */}
      <div className="grid gap-4 sm:grid-cols-3">
        {RANKING.slice(0, 3).map((entry) => (
          <Card key={entry.position} className="text-center p-5">
            <div className={`text-3xl font-black ${podiumColor[entry.position - 1]}`}>
              #{entry.position}
            </div>
            <Avatar className="mx-auto mt-3 h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {entry.initials}
              </AvatarFallback>
            </Avatar>
            <div className="mt-2 font-semibold">{entry.name}</div>
            <div className="tabular-nums text-xl font-bold mt-1">
              {entry.points.toLocaleString("pt-BR")}
            </div>
            <div className="text-xs text-muted-foreground">pts</div>
            <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${tierColor[entry.tier]}`}>
              {entry.tier}
            </span>
          </Card>
        ))}
      </div>

      {/* Full ranking table */}
      <Card>
        <CardHeader>
          <CardTitle>Classificação completa</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-t border-border bg-muted/20">
              <tr className="text-left text-muted-foreground">
                <th className="px-6 py-3 font-medium w-16">#</th>
                <th className="px-6 py-3 font-medium">Membro</th>
                <th className="px-6 py-3 font-medium">Tier</th>
                <th className="px-6 py-3 font-medium">Segmento</th>
                <th className="px-6 py-3 font-medium text-right">Pontos</th>
                <th className="px-6 py-3 font-medium text-right">Variação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {RANKING.map((entry) => (
                <tr key={entry.position} className="hover:bg-muted/20">
                  <td className="px-6 py-3">
                    {entry.position <= 3 ? (
                      <Medal className={`size-4 ${podiumColor[entry.position - 1]}`} />
                    ) : (
                      <span className="text-muted-foreground font-medium">{entry.position}</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {entry.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{entry.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tierColor[entry.tier]}`}>
                      {entry.tier}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{entry.segment}</td>
                  <td className="px-6 py-3 text-right tabular-nums font-semibold">
                    {entry.points.toLocaleString("pt-BR")} pts
                  </td>
                  <td className="px-6 py-3 text-right tabular-nums">
                    <span className={entry.variation >= 0 ? "text-emerald-600" : "text-red-500"}>
                      {entry.variation >= 0 ? "+" : ""}
                      {entry.variation.toLocaleString("pt-BR")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Config card */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração do ranking</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2">
            {Object.entries(CONFIG).map(([key, value]) => (
              <div key={key} className="rounded-xl bg-muted/30 px-4 py-3">
                <dt className="text-xs text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </dt>
                <dd className="mt-0.5 text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
