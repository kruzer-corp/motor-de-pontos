import { useState } from "react";
import {
  Button, InfoNotice, PageHeader, Pill,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Table, TableBody, TableHead, TableHeader, TableRow,
  toast,
} from "@kruzer/ds";
import { getCoordenadores, type Coordenador } from "../lib/coordenadores";
import { getAfiliados, atribuirCoordenadorManualmente, type Afiliado } from "../lib/afiliados";
import { AfiliadoRow } from "../components/AfiliadoCarteiraWidgets";
import { ehV1 } from "../lib/versao";
import { seedCarteiraAfiliadosSeNecessario } from "../lib/seedV2";

// ── Modal: atribuir coordenador manualmente (só existe aqui — resolução de
// exceção de dado, é tarefa do admin, não do coordenador) ───────────────────

function AtribuirCoordenadorModal({ afiliado, coordenadores, onClose, onAtribuir }: {
  afiliado: Afiliado; coordenadores: Coordenador[]; onClose: () => void; onAtribuir: (coordenadorId: string) => void;
}) {
  const [coordenadorId, setCoordenadorId] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-bold">Atribuir coordenador</h2>
          <button onClick={onClose}>✕</button>
        </div>
        <p className="text-sm text-muted-foreground">
          {afiliado.nome} — {afiliado.cidade}/{afiliado.uf} não bateu com a região de nenhum coordenador. Escolha manualmente.
        </p>
        <Select value={coordenadorId} onValueChange={setCoordenadorId}>
          <SelectTrigger><SelectValue placeholder="Selecione um coordenador" /></SelectTrigger>
          <SelectContent>
            {coordenadores.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Voltar</Button>
          <Button className="flex-1" disabled={!coordenadorId} onClick={() => onAtribuir(coordenadorId)}>Atribuir</Button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
// Visão do admin: uma fotografia de todas as carteiras. Só consulta — quem
// contata/aprova/reprova de verdade é o coordenador, na visão dele.

export default function CarteiraAfiliados() {
  if (!ehV1()) seedCarteiraAfiliadosSeNecessario();
  const [coordenadores] = useState<Coordenador[]>(getCoordenadores());
  const [afiliados, setAfiliados] = useState<Afiliado[]>(getAfiliados());
  const [atribuindo, setAtribuindo] = useState<Afiliado | null>(null);

  const refresh = () => setAfiliados(getAfiliados());

  const semCoordenador = afiliados.filter((a) => a.coordenadorId === null);

  function atribuir(coordId: string) {
    if (!atribuindo) return;
    const resultado = atribuirCoordenadorManualmente(atribuindo.id, coordId);
    if (!resultado.ok) { toast.error(resultado.erro ?? "Não foi possível atribuir esse afiliado."); return; }
    toast.success(`${atribuindo.nome} atribuído`);
    setAtribuindo(null);
    refresh();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Carteira de Membros"
        path={[{ label: "Operação" }]}
        description="Fotografia de todas as carteiras — contato e aprovação acontecem na visão de cada coordenador."
      />

      {coordenadores.length === 0 ? (
        <InfoNotice variant="info" title="Nenhum coordenador cadastrado">
          Cadastre coordenadores e as cidades que cada um atende pra começar a receber afiliados na carteira.
        </InfoNotice>
      ) : (
        <div className="space-y-8">
          {coordenadores.map((c) => {
            const carteira = afiliados.filter((a) => a.coordenadorId === c.id);
            const pendentes = carteira.filter((a) => a.status === "pendente").length;
            return (
              <div key={c.id} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold">{c.nome}</h2>
                    <p className="text-xs text-muted-foreground">
                      {c.cidades.map((ci) => `${ci.cidade}/${ci.uf}`).join(", ")}
                    </p>
                  </div>
                  {pendentes > 0 && (
                    <Pill color="warning" variant="soft" size="sm" dot>{pendentes} aguardando ação do coordenador</Pill>
                  )}
                </div>

                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  {carteira.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">Nenhum afiliado nessa carteira ainda.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Afiliado</TableHead>
                          <TableHead>Cidade</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Perfil</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {carteira.map((a) => <AfiliadoRow key={a.id} afiliado={a} />)}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {semCoordenador.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Sem coordenador ({semCoordenador.length})</h2>
          <p className="text-xs text-muted-foreground">
            Endereço não bateu com a região de nenhum coordenador — precisa atribuir na mão.
          </p>
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {semCoordenador.map((a) => (
                  <AfiliadoRow key={a.id} afiliado={a} onAtribuir={setAtribuindo} />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {atribuindo && (
        <AtribuirCoordenadorModal
          afiliado={atribuindo}
          coordenadores={coordenadores}
          onClose={() => setAtribuindo(null)}
          onAtribuir={atribuir}
        />
      )}
    </div>
  );
}
