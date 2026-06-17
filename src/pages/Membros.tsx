import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, Input, Avatar, AvatarFallback } from "@kruzer-corp/ds";

const MEMBERS = [
  { name: "Aline P.", initials: "AP", balance: 5200, tier: "Diamante", segment: "Premium", joined: "12/04/2025" },
  { name: "Bruno C.", initials: "BC", balance: 3200, tier: "Ouro", segment: "Frete Grátis", joined: "22/01/2025" },
  { name: "Cecília M.", initials: "CM", balance: 1800, tier: "Prata", segment: "Fidelidade", joined: "03/08/2024" },
  { name: "Danilo R.", initials: "DR", balance: 760, tier: "Bronze", segment: "Básico", joined: "17/03/2025" },
];

const tierColor: Record<string, string> = {
  Diamante: "bg-violet-100 text-violet-700",
  Ouro: "bg-amber-100 text-amber-700",
  Prata: "bg-slate-100 text-slate-800",
  Bronze: "bg-orange-100 text-orange-800",
};

export default function Membros() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => MEMBERS.filter((member) => member.name.toLowerCase().includes(query.toLowerCase()) || member.segment.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Membros</CardTitle>
            <Input placeholder="Buscar membro, segmento..." value={query} onChange={(event) => setQuery(event.target.value)} className="max-w-sm" />
          </div>
        </CardHeader>
      </Card>

      <div className="overflow-x-auto rounded-3xl border border-border bg-card">
        <table className="min-w-full divide-y divide-border text-left text-sm">
          <thead className="bg-background text-muted-foreground">
            <tr>
              <th className="px-6 py-4">Membro</th>
              <th className="px-6 py-4">Saldo</th>
              <th className="px-6 py-4">Tier</th>
              <th className="px-6 py-4">Segmento</th>
              <th className="px-6 py-4">Entrou em</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((member) => (
              <tr key={member.name} className="hover:bg-muted/50">
                <td className="px-6 py-4 flex items-center gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-foreground font-medium">{member.balance} pts</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tierColor[member.tier]}`}>
                    {member.tier}
                  </span>
                </td>
                <td className="px-6 py-4">{member.segment}</td>
                <td className="px-6 py-4">{member.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
