import { useMemo, useState } from "react";
import { UserPlus, Users } from "lucide-react";
import {
  Avatar, AvatarFallback, Button, EmptyState,
  FormDrawer, Input, Label, PageHeader, Pill,
  SearchInput, Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  toast,
} from "@kruzer/ds";

type Tier    = "Diamante" | "Ouro" | "Prata" | "Bronze";
type Segment = "Premium" | "Frete Grátis" | "Fidelidade" | "Básico";

type Member = {
  name: string; initials: string; balance: number;
  tier: Tier; segment: Segment; joined: string;
};

const INITIAL_MEMBERS: Member[] = [
  { name: "Aline P.",   initials: "AP", balance: 5200, tier: "Diamante", segment: "Premium",      joined: "12/04/2025" },
  { name: "Bruno C.",   initials: "BC", balance: 3200, tier: "Ouro",     segment: "Frete Grátis", joined: "22/01/2025" },
  { name: "Cecília M.", initials: "CM", balance: 1800, tier: "Prata",    segment: "Fidelidade",   joined: "03/08/2024" },
  { name: "Danilo R.",  initials: "DR", balance:  760, tier: "Bronze",   segment: "Básico",       joined: "17/03/2025" },
];

const TIER_PILL: Record<Tier, "primary" | "warning" | "secondary" | "muted"> = {
  Diamante: "primary", Ouro: "warning", Prata: "secondary", Bronze: "muted",
};

const TIERS:    Tier[]    = ["Diamante", "Ouro", "Prata", "Bronze"];
const SEGMENTS: Segment[] = ["Premium", "Frete Grátis", "Fidelidade", "Básico"];

export default function Membros() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [search, setSearch]   = useState("");

  // Drawer state
  const [open,    setOpen]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [cpf,     setCpf]     = useState("");
  const [phone,   setPhone]   = useState("");
  const [tier,    setTier]    = useState<Tier | "">("");
  const [segment, setSegment] = useState<Segment | "">("");

  const filtered = useMemo(
    () => members.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.segment.toLowerCase().includes(search.toLowerCase())
    ),
    [members, search]
  );

  function resetForm() {
    setName(""); setEmail(""); setCpf(""); setPhone("");
    setTier(""); setSegment("");
  }

  async function handleSave() {
    if (!name || !email) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));

    const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
    const today = new Date().toLocaleDateString("pt-BR");

    setMembers((prev) => [
      ...prev,
      {
        name,
        initials,
        balance: 0,
        tier: (tier || "Bronze") as Tier,
        segment: (segment || "Básico") as Segment,
        joined: today,
      },
    ]);

    setOpen(false);
    resetForm();
    setSaving(false);
    toast.success(`${name} cadastrado como membro`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Membros"
        description={`${members.length} membros cadastrados`}
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Novo membro
          </Button>
        }
      />

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar membro ou segmento…"
            className="w-64"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title={search ? "Nenhum membro encontrado" : "Nenhum membro ainda"}
              description={
                search
                  ? "Tente buscar por outro nome ou segmento."
                  : "Clique em \"Novo membro\" para cadastrar o primeiro."
              }
              action={!search ? { label: "Novo membro", onClick: () => setOpen(true) } : undefined}
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membro</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead>Entrou em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((member) => (
                <TableRow key={member.name} className="[&>td]:py-3.5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums font-medium text-sm">
                    {member.balance.toLocaleString("pt-BR")} pts
                  </TableCell>
                  <TableCell>
                    <Pill color={TIER_PILL[member.tier]} variant="soft" size="sm">
                      {member.tier}
                    </Pill>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{member.segment}</TableCell>
                  <TableCell className="text-muted-foreground tabular-nums text-sm">{member.joined}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* FormDrawer — Novo membro */}
      <FormDrawer
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}
        title="Novo membro"
        description="Cadastre um novo participante no programa de fidelidade."
        onSave={handleSave}
        saving={saving}
        saveLabel="Cadastrar membro"
        saveDisabled={!name || !email}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome completo <span className="text-destructive">*</span></Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Ana Silva" />
          </div>

          <div className="space-y-1.5">
            <Label>E-mail <span className="text-destructive">*</span></Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ana@email.com" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>CPF</Label>
              <Input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-0000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tier inicial</Label>
              <Select value={tier} onValueChange={(v) => setTier(v as Tier)}>
                <SelectTrigger><SelectValue placeholder="Bronze" /></SelectTrigger>
                <SelectContent>
                  {TIERS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Segmento</Label>
              <Select value={segment} onValueChange={(v) => setSegment(v as Segment)}>
                <SelectTrigger><SelectValue placeholder="Básico" /></SelectTrigger>
                <SelectContent>
                  {SEGMENTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </FormDrawer>
    </div>
  );
}
