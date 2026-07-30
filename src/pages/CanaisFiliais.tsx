import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button, EmptyState, FormDrawer, Input, Label, PageHeader, Pill,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, toast,
} from "@kruzer/ds";
import { Building2, Plus, Pencil, Monitor, AlertCircle, CheckCircle2 } from "lucide-react";
import { FILIAIS as MOCK, type Canal, type Filial } from "../config/filiais";
import { ehV1 } from "../lib/versao";
import { onboardingCompleto, marcarOnboardingFeito } from "../lib/onboarding";
import { OnboardingScreenShell } from "../components/OnboardingScreenShell";

const REGIOES = ["Sudeste", "Sul", "Nordeste", "Norte", "Centro-Oeste"];

type TipoDigital = "E-commerce" | "App" | "Marketplace";
type StatusIntegracao = "conectado" | "sem-integracao";

type CanalDigital = {
  id: string;
  nome: string;
  tipo: TipoDigital;
  plataforma: string;
  url: string;
  status: StatusIntegracao;
  ativo: boolean;
};

const TIPOS_DIGITAL: TipoDigital[] = ["E-commerce", "App", "Marketplace"];

const PLATAFORMAS: Record<TipoDigital, string[]> = {
  "E-commerce":  ["VTEX", "Shopify", "Magento", "Nuvemshop", "Loja Integrada", "Outro"],
  "App":         ["iOS", "Android", "iOS + Android", "Outro"],
  "Marketplace": ["Mercado Livre", "Amazon", "Shopee", "Magazine Luiza", "Outro"],
};

const MOCK_DIGITAIS: CanalDigital[] = [];

export default function CanaisFiliais() {
  const navigate = useNavigate();

  // ── Lojas físicas ──────────────────────────────────────────────────────────
  const [filiais, setFiliais] = useState<Filial[]>(MOCK);
  const [openFisico,    setOpenFisico]    = useState(false);
  const [savingFisico,  setSavingFisico]  = useState(false);
  const [editandoId,    setEditandoId]    = useState<string | null>(null);
  const [fNome,         setFNome]         = useState("");
  const [fCodigo,       setFCodigo]       = useState("");
  const [fRegiao,       setFRegiao]       = useState("");

  function abrirNovaLoja() {
    setEditandoId(null); setFNome(""); setFCodigo(""); setFRegiao("");
    setOpenFisico(true);
  }

  function abrirEditarLoja(f: Filial) {
    setEditandoId(f.id); setFNome(f.nome); setFCodigo(f.codigo); setFRegiao(f.regiao);
    setOpenFisico(true);
  }

  function fecharFisico() { setOpenFisico(false); setEditandoId(null); }

  async function handleSaveLoja() {
    if (!fNome || !fCodigo) return;
    setSavingFisico(true);
    await new Promise(r => setTimeout(r, 400));
    if (editandoId) {
      setFiliais(prev => prev.map(f => f.id === editandoId ? { ...f, nome: fNome, codigo: fCodigo, regiao: fRegiao } : f));
      toast.success("Loja atualizada");
    } else {
      const nova: Filial = { id: `f${String(filiais.length + 1).padStart(2, "0")}`, nome: fNome, codigo: fCodigo, canal: "PDV" as Canal, regiao: fRegiao, ativa: true };
      setFiliais(prev => [nova, ...prev]);
      toast.success(`${fNome} adicionada`);
    }
    setSavingFisico(false);
    fecharFisico();
  }

  function toggleLojaAtiva(id: string) {
    setFiliais(prev => prev.map(f => f.id === id ? { ...f, ativa: !f.ativa } : f));
  }

  // ── Canais digitais ────────────────────────────────────────────────────────
  const [digitais,      setDigitais]      = useState<CanalDigital[]>(MOCK_DIGITAIS);
  const [openDigital,   setOpenDigital]   = useState(false);
  const [savingDigital, setSavingDigital] = useState(false);
  const [dNome,         setDNome]         = useState("");
  const [dTipo,         setDTipo]         = useState<TipoDigital>("E-commerce");
  const [dPlataforma,   setDPlataforma]   = useState("");
  const [dUrl,          setDUrl]          = useState("");

  function abrirNovoDigital() {
    setDNome(""); setDTipo("E-commerce"); setDPlataforma(""); setDUrl("");
    setOpenDigital(true);
  }

  function fecharDigital() { setOpenDigital(false); }

  async function handleSaveDigital() {
    if (!dNome || !dTipo) return;
    setSavingDigital(true);
    await new Promise(r => setTimeout(r, 400));
    const novo: CanalDigital = {
      id: `d${String(digitais.length + 1).padStart(2, "0")}`,
      nome: dNome, tipo: dTipo, plataforma: dPlataforma, url: dUrl,
      status: "sem-integracao",
      ativo: true,
    };
    setDigitais(prev => [novo, ...prev]);
    toast.success(`${dNome} adicionado — configure a integração em Conectividade`);
    setSavingDigital(false);
    fecharDigital();
  }

  function toggleDigitalAtivo(id: string) {
    setDigitais(prev => prev.map(d => d.id === id ? { ...d, ativo: !d.ativo } : d));
  }

  const modoOnboarding = ehV1() && !onboardingCompleto();

  function concluir() {
    marcarOnboardingFeito("canais");
    toast.success("Passo concluído");
    navigate("/onboarding");
  }

  const conteudo = (
    <>
      {/* ── LOJAS FÍSICAS ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Lojas físicas</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Pontos de venda físicos habilitados por campanha.</p>
          </div>
          <Button size="sm" onClick={abrirNovaLoja}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />Adicionar loja
          </Button>
        </div>

        {filiais.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-10">
            <EmptyState icon={Building2} title="Nenhuma loja cadastrada"
              description="Adicione lojas físicas para habilitá-las nas campanhas."
              action={{ label: "Adicionar loja", onClick: abrirNovaLoja }} />
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/20 border-b border-border">
                <tr className="text-left text-muted-foreground">
                  {["Nome", "Código", "Região", "Status", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filiais.map(f => (
                  <tr key={f.id} className={`hover:bg-muted/20 transition-colors ${!f.ativa ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3.5 font-medium">{f.nome}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{f.codigo}</td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground">{f.regiao || "—"}</td>
                    <td className="px-4 py-3.5">
                      <Pill color={f.ativa ? "success" : "muted"} variant="soft" size="sm">
                        {f.ativa ? "Ativo" : "Inativo"}
                      </Pill>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3 justify-end">
                        <button onClick={() => abrirEditarLoja(f)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <Switch size="sm" checked={f.ativa} onCheckedChange={() => toggleLojaAtiva(f.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── CANAIS DIGITAIS ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Canais digitais</h2>
            <p className="text-xs text-muted-foreground mt-0.5">E-commerce, App e Marketplace habilitados por campanha. Requer integração ativa em Conectividade.</p>
          </div>
          <Button size="sm" onClick={abrirNovoDigital}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />Adicionar canal
          </Button>
        </div>

        {digitais.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-10">
            <EmptyState icon={Monitor} title="Nenhum canal digital cadastrado"
              description="Adicione canais digitais e configure a integração em Conectividade para habilitá-los nas campanhas."
              action={{ label: "Adicionar canal", onClick: abrirNovoDigital }} />
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/20 border-b border-border">
                <tr className="text-left text-muted-foreground">
                  {["Nome", "Tipo", "Plataforma", "URL", "Integração", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {digitais.map(d => (
                  <tr key={d.id} className={`hover:bg-muted/20 transition-colors ${!d.ativo ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3.5 font-medium">{d.nome}</td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground">{d.tipo}</td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground">{d.plataforma || "—"}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{d.url || "—"}</td>
                    <td className="px-4 py-3.5">
                      {d.status === "conectado" ? (
                        <Pill color="success" variant="soft" size="sm">Conectado</Pill>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-xs text-amber-600 font-medium">Sem integração</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3 justify-end">
                        <Switch size="sm" checked={d.ativo} onCheckedChange={() => toggleDigitalAtivo(d.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── DRAWER: Loja física ── */}
      <FormDrawer
        open={openFisico}
        onOpenChange={v => { if (!v) fecharFisico(); }}
        title={editandoId ? "Editar loja" : "Adicionar loja"}
        description="Configure um ponto de venda físico para uso nas campanhas."
        onSave={handleSaveLoja}
        saving={savingFisico}
        saveLabel={editandoId ? "Salvar alterações" : "Adicionar loja"}
        saveDisabled={!fNome || !fCodigo}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome <span className="text-destructive">*</span></Label>
            <Input value={fNome} onChange={e => setFNome(e.target.value)} placeholder="Ex: SP - Centro" />
          </div>
          <div className="space-y-1.5">
            <Label>Código <span className="text-destructive">*</span></Label>
            <Input value={fCodigo} onChange={e => setFCodigo(e.target.value)} placeholder="Ex: SP01" className="font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label>Região</Label>
            <Select value={fRegiao} onValueChange={setFRegiao}>
              <SelectTrigger><SelectValue placeholder="Selecione a região" /></SelectTrigger>
              <SelectContent>
                {REGIOES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormDrawer>

      {/* ── DRAWER: Canal digital ── */}
      <FormDrawer
        open={openDigital}
        onOpenChange={v => { if (!v) fecharDigital(); }}
        title="Adicionar canal digital"
        description="O canal ficará com status 'Sem integração' até ser configurado em Conectividade."
        onSave={handleSaveDigital}
        saving={savingDigital}
        saveLabel="Adicionar canal"
        saveDisabled={!dNome || !dTipo}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome <span className="text-destructive">*</span></Label>
            <Input value={dNome} onChange={e => setDNome(e.target.value)} placeholder="Ex: Loja Online Principal" />
          </div>
          <div className="space-y-1.5">
            <Label>Tipo <span className="text-destructive">*</span></Label>
            <Select value={dTipo} onValueChange={v => { setDTipo(v as TipoDigital); setDPlataforma(""); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIPOS_DIGITAL.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Plataforma</Label>
            <Select value={dPlataforma} onValueChange={setDPlataforma}>
              <SelectTrigger><SelectValue placeholder="Selecione a plataforma" /></SelectTrigger>
              <SelectContent>
                {PLATAFORMAS[dTipo].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>URL</Label>
            <Input value={dUrl} onChange={e => setDUrl(e.target.value)} placeholder="Ex: https://loja.exemplo.com.br" />
          </div>
        </div>
      </FormDrawer>
    </>
  );

  if (modoOnboarding) {
    return (
      <OnboardingScreenShell
        title="Cadastre canais e filiais"
        subtitle="Defina onde as vendas e eventos do programa acontecem."
        maxWidth="max-w-3xl"
      >
        <div className="space-y-8">
          {conteudo}
          <div className="flex justify-between items-center pt-2">
            <Button variant="outline" onClick={() => navigate("/onboarding")}>Voltar</Button>
            <Button onClick={concluir}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Concluir e voltar ao onboarding
            </Button>
          </div>
        </div>
      </OnboardingScreenShell>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Canais e Filiais"
        path={[{ label: "Configuração" }]}
        description="Cadastre os canais físicos e digitais que podem ser habilitados por campanha."
      />
      {conteudo}
    </div>
  );
}
