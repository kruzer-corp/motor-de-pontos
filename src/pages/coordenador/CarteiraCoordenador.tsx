import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EmptyState, PageHeader, Pill, Table, TableBody, TableHead, TableHeader, TableRow, toast,
} from "@kruzer/ds";
import { Users } from "lucide-react";
import {
  getAfiliadosDaCarteiraDoCoordenador, marcarContactado, aprovarAfiliado, atribuirPerfilAfiliado,
  type Afiliado, type AfiliadoTipo,
} from "../../lib/afiliados";
import { getCoordenadorLogado } from "../../lib/coordenadores";
import { AfiliadoRow, PerfilModal, TIPO_LABEL } from "../../components/AfiliadoCarteiraWidgets";
import { seedCarteiraAfiliadosSeNecessario } from "../../lib/seedV2";

// Prioridade de exibição: novo e não contactado primeiro (mais urgente),
// depois pendente já contactado, depois aprovado, depois reprovado.
function prioridade(a: Afiliado): number {
  if (a.status === "pendente" && !a.contactadoEm) return 0;
  if (a.status === "pendente") return 1;
  if (a.status === "aprovado") return 2;
  return 3;
}

export default function CarteiraCoordenador() {
  // A carteira do coordenador independe do estágio de configuração do admin —
  // ele já vê o próprio trabalho funcionando, mesmo em "Primeiro acesso".
  seedCarteiraAfiliadosSeNecessario();
  const navigate = useNavigate();
  const coordenador = getCoordenadorLogado();
  const [afiliados, setAfiliados] = useState<Afiliado[]>(
    coordenador ? getAfiliadosDaCarteiraDoCoordenador(coordenador.id) : []
  );
  const [aprovando, setAprovando] = useState<Afiliado | null>(null);
  const [atribuindoPerfil, setAtribuindoPerfil] = useState<Afiliado | null>(null);

  if (!coordenador) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Minha Carteira"
          path={[{ label: "Operação" }]}
          description="Visão do coordenador."
        />
        <EmptyState icon={Users} title="Nenhum coordenador cadastrado ainda"
          description="Assim que houver um coordenador cadastrado, a carteira dele aparece aqui." />
      </div>
    );
  }

  const novos = afiliados.filter((a) => a.status === "pendente" && !a.contactadoEm).length;
  const ordenados = [...afiliados].sort((a, b) => prioridade(a) - prioridade(b));

  const refresh = () => setAfiliados(getAfiliadosDaCarteiraDoCoordenador(coordenador.id));

  function contactar(a: Afiliado) {
    marcarContactado(a.id);
    refresh();
  }

  function aprovar(tipo: AfiliadoTipo) {
    if (!aprovando) return;
    const resultado = aprovarAfiliado(aprovando.id, tipo);
    if (!resultado.ok) { toast.error(resultado.erro ?? "Não foi possível aprovar esse afiliado."); return; }
    toast.success(`${aprovando.nome} aprovado como ${TIPO_LABEL[tipo]}`);
    setAprovando(null);
    refresh();
  }

  function atribuirPerfil(tipo: AfiliadoTipo) {
    if (!atribuindoPerfil) return;
    const resultado = atribuirPerfilAfiliado(atribuindoPerfil.id, tipo);
    if (!resultado.ok) { toast.error(resultado.erro ?? "Não foi possível atribuir o perfil."); return; }
    toast.success(`${atribuindoPerfil.nome} agora é ${TIPO_LABEL[tipo]}`);
    setAtribuindoPerfil(null);
    refresh();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Minha Carteira"
        path={[{ label: "Operação" }]}
        description={`Afiliados atribuídos a ${coordenador.nome} — contate e aprove cada cadastro novo.`}
      />

      {novos > 0 && (
        <Pill color="warning" variant="soft" dot>{novos} novo{novos > 1 ? "s" : ""} aguardando contato</Pill>
      )}

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {ordenados.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Você ainda não tem afiliados na carteira.</div>
        ) : (
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
              {ordenados.map((a) => (
                <AfiliadoRow
                  key={a.id}
                  afiliado={a}
                  onContactar={contactar}
                  onAprovar={setAprovando}
                  onAtribuirPerfil={setAtribuindoPerfil}
                  onAbrirDetalhe={(af) => navigate(`/coordenador/afiliados/${af.id}`)}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {aprovando && (
        <PerfilModal afiliado={aprovando} titulo="Aprovar" textoBotao="Aprovar" onClose={() => setAprovando(null)} onConfirmar={aprovar} />
      )}
      {atribuindoPerfil && (
        <PerfilModal
          afiliado={atribuindoPerfil}
          titulo="Atribuir perfil —"
          textoBotao="Salvar perfil"
          onClose={() => setAtribuindoPerfil(null)}
          onConfirmar={atribuirPerfil}
        />
      )}
    </div>
  );
}
