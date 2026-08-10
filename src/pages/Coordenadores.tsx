import { useState } from "react";
import {
  Badge, Button, FormDrawer, Input, Label, PageHeader,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  toast,
} from "@kruzer/ds";
import { Pencil, Plus, Trash2, MapPin } from "lucide-react";
import {
  getCoordenadores, salvarCoordenador, novoIdCoordenador, UFS,
  type Coordenador, type CidadeAtendida,
} from "../lib/coordenadores";
import { ehV1 } from "../lib/versao";
import { seedCarteiraAfiliadosSeNecessario } from "../lib/seedV2";

type FormState = {
  id: string;
  nome: string;
  email: string;
  cidades: CidadeAtendida[];
};

const FORM_VAZIO: FormState = { id: "", nome: "", email: "", cidades: [] };

export default function Coordenadores() {
  if (!ehV1()) seedCarteiraAfiliadosSeNecessario();
  const [coordenadores, setCoordenadores] = useState<Coordenador[]>(getCoordenadores());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(FORM_VAZIO);
  const [saving, setSaving] = useState(false);
  const [novaCidade, setNovaCidade] = useState("");
  const [novaUf, setNovaUf] = useState("");

  function abrirNovo() {
    setForm({ ...FORM_VAZIO, id: novoIdCoordenador() });
    setNovaCidade(""); setNovaUf("");
    setOpen(true);
  }

  function abrirEdicao(c: Coordenador) {
    setForm({ id: c.id, nome: c.nome, email: c.email, cidades: c.cidades });
    setNovaCidade(""); setNovaUf("");
    setOpen(true);
  }

  function adicionarCidade() {
    if (!novaCidade.trim() || !novaUf) return;
    setForm((f) => ({ ...f, cidades: [...f.cidades, { cidade: novaCidade.trim(), uf: novaUf }] }));
    setNovaCidade(""); setNovaUf("");
  }

  function removerCidade(idx: number) {
    setForm((f) => ({ ...f, cidades: f.cidades.filter((_, i) => i !== idx) }));
  }

  async function handleSave() {
    if (!form.nome || !form.email || form.cidades.length === 0) return;
    setSaving(true);
    const resultado = salvarCoordenador({ id: form.id, nome: form.nome, email: form.email, cidades: form.cidades });
    setSaving(false);
    if (!resultado.ok) {
      toast.error(resultado.erro ?? "Não foi possível salvar esse coordenador.");
      return;
    }
    setCoordenadores(getCoordenadores());
    setOpen(false);
    toast.success("Coordenador salvo");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coordenadores"
        path={[{ label: "Operação" }]}
        description="Cada coordenador atende uma ou mais cidades — uma cidade pertence a um único coordenador."
        actions={
          <Button size="sm" onClick={abrirNovo}>
            <Plus className="mr-2 h-4 w-4" />
            Novo coordenador
          </Button>
        }
      />

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {coordenadores.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Nenhum coordenador cadastrado ainda.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coordenador</TableHead>
                <TableHead>Cidades atendidas</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coordenadores.map((c) => (
                <TableRow key={c.id} className="[&>td]:py-3.5">
                  <TableCell>
                    <div className="font-medium text-sm">{c.nome}</div>
                    <div className="text-xs text-muted-foreground">{c.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {c.cidades.map((ci, i) => (
                        <Badge key={i} variant="outline" className="font-normal">
                          <MapPin className="size-3 mr-1" />{ci.cidade}/{ci.uf}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" aria-label="Editar coordenador" onClick={() => abrirEdicao(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <FormDrawer
        open={open}
        onOpenChange={setOpen}
        title={form.id && coordenadores.some((c) => c.id === form.id) ? "Editar coordenador" : "Novo coordenador"}
        description="As cidades atendidas definem pra quem os afiliados novos dessa região vão automaticamente."
        onSave={handleSave}
        saving={saving}
        saveLabel="Salvar coordenador"
        saveDisabled={!form.nome || !form.email || form.cidades.length === 0}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} placeholder="Nome completo" />
          </div>
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@empresa.com" />
          </div>

          <div className="space-y-1.5">
            <Label>Cidades atendidas</Label>
            {form.cidades.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.cidades.map((ci, i) => (
                  <Badge key={i} variant="outline" className="font-normal gap-1">
                    <MapPin className="size-3" />{ci.cidade}/{ci.uf}
                    <button onClick={() => removerCidade(i)} aria-label="Remover cidade">
                      <Trash2 className="size-3 ml-1 text-muted-foreground hover:text-destructive" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={novaCidade}
                onChange={(e) => setNovaCidade(e.target.value)}
                placeholder="Cidade"
                className="flex-1"
              />
              <Select value={novaUf} onValueChange={setNovaUf}>
                <SelectTrigger className="w-20"><SelectValue placeholder="UF" /></SelectTrigger>
                <SelectContent>
                  {UFS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" onClick={adicionarCidade} disabled={!novaCidade.trim() || !novaUf}>
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </FormDrawer>
    </div>
  );
}
