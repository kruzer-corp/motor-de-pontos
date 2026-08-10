import { useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, Button, EmptyState, PageHeader, Pill } from "@kruzer/ds";
import { ArrowLeft, FileQuestion, Users } from "lucide-react";
import { getAfiliadosDaCarteiraDoCoordenador, type Afiliado } from "../../lib/afiliados";
import { getCoordenadorLogado } from "../../lib/coordenadores";
import { TIPO_LABEL, ehNovo } from "../../components/AfiliadoCarteiraWidgets";

function formatarData(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function CampoInfo({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium mt-0.5">{valor}</div>
    </div>
  );
}

function PlaceholderCard({ titulo }: { titulo: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-5 flex items-start gap-3">
      <FileQuestion className="size-4 text-muted-foreground shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium">{titulo}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Em definição — ainda não temos esse dado modelado.</p>
      </div>
    </div>
  );
}

export default function AfiliadoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const coordenador = getCoordenadorLogado();
  const afiliado: Afiliado | undefined = coordenador
    ? getAfiliadosDaCarteiraDoCoordenador(coordenador.id).find((a) => a.id === id)
    : undefined;

  if (!afiliado) {
    return (
      <div className="space-y-6">
        <PageHeader title="Afiliado" path={[{ label: "Operação" }, { label: "Minha Carteira", to: "/coordenador" }]} />
        <EmptyState icon={Users} title="Afiliado não encontrado"
          description="Ele pode não estar mais na sua carteira." />
      </div>
    );
  }

  const novo = ehNovo(afiliado);
  const initials = afiliado.nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-6">
      <PageHeader
        title={afiliado.nome}
        path={[{ label: "Operação" }, { label: "Minha Carteira", to: "/coordenador" }]}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/coordenador")}>
            <ArrowLeft className="size-3.5 mr-1.5" />Voltar pra carteira
          </Button>
        }
      />

      <div className="rounded-lg border border-border bg-card p-5 flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold">{afiliado.nome}</p>
          <p className="text-sm text-muted-foreground">{afiliado.email}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {afiliado.status === "pendente" && (
            <Pill color={novo ? "warning" : "muted"} variant="soft" size="sm" dot>{novo ? "Novo" : "Pendente"}</Pill>
          )}
          {afiliado.status === "aprovado" && <Pill color="success" variant="soft" size="sm">Aprovado</Pill>}
          {afiliado.status === "reprovado" && <Pill color="destructive" variant="soft" size="sm">Reprovado</Pill>}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm font-semibold mb-4">Dados</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <CampoInfo label="Cidade" valor={`${afiliado.cidade}/${afiliado.uf}`} />
          <CampoInfo label="Perfil" valor={afiliado.tipo ? TIPO_LABEL[afiliado.tipo] : "—"} />
          <CampoInfo label="Cadastrado em" valor={formatarData(afiliado.criadoEm)} />
          <CampoInfo label="Contactado em" valor={formatarData(afiliado.contactadoEm)} />
          <CampoInfo label="Aprovado em" valor={formatarData(afiliado.aprovadoEm)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PlaceholderCard titulo="Documentos" />
        <PlaceholderCard titulo="Comissionamento" />
      </div>
    </div>
  );
}
