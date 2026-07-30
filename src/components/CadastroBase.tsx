import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Avatar, AvatarFallback, Button, EmptyState, Input, Label,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  toast,
} from "@kruzer/ds";
import { Link2, Package, Upload, UserPlus, Users } from "lucide-react";
import { type MetodoBase } from "../lib/onboarding";
import { type Membro, type EventoBruto, getMembros, saveMembros } from "../lib/membros";
import { type ModeloVenda, type Produto, CATEGORIAS, getProdutos, saveProdutos } from "../lib/produtos";
import { getTiersMembro, ordenarPorLimiar } from "../lib/tiers";
import { getPapeisMembro } from "../lib/papeisMembro";
import { getTiersProduto } from "../lib/tiersProduto";
import { getSegmentosMembro } from "../lib/segmentosMembro";

// Cadastro de Produtos e Membros — usado tanto no Onboarding quanto na Biblioteca
// (mesmo componente, mesma fonte de dados — só muda onde ele é exibido).

export const METODO_OPCOES: { value: MetodoBase; label: string; desc: string; icon: typeof Upload; badge?: string }[] = [
  { value: "planilha",   label: "Já tenho uma planilha ou CSV",         desc: "Suba a lista de uma vez, com todos os dados.",                icon: Upload   },
  { value: "manual",     label: "Vou cadastrar do zero, manualmente",   desc: "Programa novo — adicione um a um conforme for precisando.",  icon: UserPlus },
  { value: "integracao", label: "Quero integrar com meu sistema",       desc: "Loja virtual, ERP ou CRM — sincroniza automaticamente.",      icon: Link2, badge: "Em breve" },
];

// ── Seletor de método (planilha / manual / integração) ───────────────────────

export function MetodoSelector({ metodo, onChange }: { metodo: MetodoBase | null; onChange: (v: MetodoBase) => void }) {
  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4 space-y-3">
      <div>
        <p className="text-sm font-semibold">Como você quer trazer sua base?</p>
        <p className="text-xs text-muted-foreground mt-0.5">Isso só organiza o que aparece abaixo — você pode trocar quando quiser.</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {METODO_OPCOES.map((opt) => {
          const Icon = opt.icon;
          return (
            <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
              className={`flex flex-col gap-1.5 rounded-lg border px-4 py-3 text-left transition-colors ${
                metodo === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
              }`}>
              <div className="flex items-center justify-between">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {opt.badge && <span className="text-[10px] font-semibold text-violet-600 bg-violet-100 rounded-full px-1.5 py-0.5">{opt.badge}</span>}
              </div>
              <span className="text-sm font-semibold">{opt.label}</span>
              <span className="text-xs text-muted-foreground">{opt.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Eventos não-transacionais gerados no momento do cadastro — entram no motor
// de cálculo igual um evento de compra (Elegibilidade, Atribuição, Políticas).
function eventosCadastro(canal: string, indicadoPorId?: string): EventoBruto[] {
  const hoje = new Date().toLocaleDateString("pt-BR");
  const eventos: EventoBruto[] = [
    { id: `EVT-CAD-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      data: hoje, fonteId: canal, fonte: canal, evento: "cadastro",
      descricao: "Cadastro no programa", statusPedido: "Concluído", valorCompra: 0 },
  ];
  if (indicadoPorId) {
    eventos.push({
      id: `EVT-IND-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      data: hoje, fonteId: canal, fonte: canal, evento: "indicacao",
      descricao: "Indicação de novo membro", statusPedido: "Concluído", valorCompra: 0,
      geradoPorMembroId: indicadoPorId,
    });
  }
  return eventos;
}

// ── Seção: Membros ───────────────────────────────────────────────────────────

export function SecaoMembros({ metodo, sempreVazio }: { metodo: MetodoBase | null; sempreVazio?: boolean }) {
  const mostrarManual = metodo !== "planilha";
  const mostrarImport = metodo !== "manual";
  const [membros, setMembros] = useState<Membro[]>(() => getMembros());
  const tiersMembro = getTiersMembro();
  const tierPadrao = ordenarPorLimiar(tiersMembro)[0]?.nome ?? "Bronze";
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState(tierPadrao);
  const [segmento, setSegmento] = useState("");
  const [papel, setPapel] = useState("");
  const [indicadoPor, setIndicadoPor] = useState("");
  const papeisMembro = getPapeisMembro();
  const segmentosMembro = getSegmentosMembro();
  const [importResult, setImportResult] = useState<{
    novos: { nome: string; email: string; tier: string; segmento: string }[];
    existentes: string[]; invalidos: string[];
  } | null>(null);

  function persist(next: Membro[]) {
    setMembros(next);
    saveMembros(next);
  }

  function adicionar() {
    if (!nome || !email) return;
    const today = new Date().toLocaleDateString("pt-BR");
    persist([
      ...membros,
      {
        id: String(membros.length + 1),
        nome, initials: nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase(),
        cpf: "", email, telefone: "", canal: "App",
        saldos: [], tier, segmento, papel: papel || undefined, status: "ativo", desde: today,
        expiram30d: 0, transacoes: [], pedidos: [], ajustes: [],
        eventos: eventosCadastro("App", indicadoPor || undefined),
      },
    ]);
    toast.success(`${nome} cadastrado`);
    setNome(""); setEmail(""); setTier(tierPadrao); setSegmento(""); setPapel(""); setIndicadoPor("");
  }

  function processarCSV(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const linhas = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const emailsExistentes = new Set(membros.map((m) => m.email.toLowerCase()));
      const novos: { nome: string; email: string; tier: string; segmento: string }[] = [];
      const existentes: string[] = []; const invalidos: string[] = [];
      for (const linha of linhas) {
        const cols = linha.split(/[;,]/).map((c) => c.trim().replace(/^["']|["']$/g, ""));
        if (cols[0]?.toLowerCase() === "nome") continue;
        const [n, em, tierRaw, segRaw] = cols;
        if (!n || !em || !em.includes("@")) { invalidos.push(linha); continue; }
        if (emailsExistentes.has(em.toLowerCase())) { existentes.push(em); continue; }
        const tierValido = tiersMembro.find((t) => t.nome.toLowerCase() === tierRaw?.toLowerCase());
        const segValido = segmentosMembro.find((s) => s.nome.toLowerCase() === segRaw?.toLowerCase());
        novos.push({ nome: n, email: em, tier: tierValido?.nome ?? tierPadrao, segmento: segValido?.nome ?? "" });
      }
      setImportResult({ novos, existentes, invalidos });
    };
    reader.readAsText(file);
  }

  function confirmarImport() {
    if (!importResult || importResult.novos.length === 0) return;
    const today = new Date().toLocaleDateString("pt-BR");
    const novosMembros: Membro[] = importResult.novos.map((n, i) => ({
      id: String(membros.length + i + 1),
      nome: n.nome, initials: n.nome.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase(),
      cpf: "", email: n.email, telefone: "", canal: "Importação",
      saldos: [], tier: n.tier, segmento: n.segmento, status: "ativo", desde: today,
      expiram30d: 0, transacoes: [], pedidos: [], ajustes: [],
      eventos: eventosCadastro("Importação"),
    }));
    persist([...membros, ...novosMembros]);
    toast.success(`${novosMembros.length} membro(s) importado(s)`);
    setImportResult(null);
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
        <Users className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-semibold">Membros</p>
          <p className="text-xs text-muted-foreground">{sempreVazio ? 0 : membros.length} cadastrado(s) hoje.</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {metodo === "integracao" && (
          <div className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 text-xs text-violet-800">
            Integração automática com sistemas externos ainda não está disponível — em breve. Por enquanto, cadastre um a um ou importe uma planilha abaixo.
          </div>
        )}

        {/* Cadastro individual */}
        {mostrarManual && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cadastrar um a um</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nome</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Ana Silva" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">E-mail</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ana@email.com" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tier</Label>
                <Select value={tier} onValueChange={setTier}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{tiersMembro.map((t) => <SelectItem key={t.id} value={t.nome}>{t.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {segmentosMembro.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Segmento</Label>
                  <Select value={segmento || "nenhum"} onValueChange={(v) => setSegmento(v === "nenhum" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Sem segmento" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nenhum">Sem segmento</SelectItem>
                      {segmentosMembro.map((s) => <SelectItem key={s.id} value={s.nome}>{s.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            {papeisMembro.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs">Papel (opcional)</Label>
                <Select value={papel || "nenhum"} onValueChange={(v) => setPapel(v === "nenhum" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Sem papel" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Sem papel</SelectItem>
                    {papeisMembro.map((p) => <SelectItem key={p.id} value={p.nome}>{p.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {membros.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs">Indicado por (opcional)</Label>
                <Select value={indicadoPor || "nenhum"} onValueChange={(v) => setIndicadoPor(v === "nenhum" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Ninguém indicou" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Ninguém indicou</SelectItem>
                    {membros.map((m) => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Habilita regras de Indicação/Comissão pra quem indicou.</p>
              </div>
            )}
            <Button size="sm" disabled={!nome || !email} onClick={adicionar}>
              <UserPlus className="mr-2 h-3.5 w-3.5" />Adicionar membro
            </Button>
          </div>
        )}

        {mostrarManual && mostrarImport && <div className="border-t border-border" />}

        {/* Importação em massa */}
        {mostrarImport && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{mostrarManual ? "Ou importar em massa" : "Importar em massa"}</p>
            {!importResult ? (
              <>
                <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground text-center">Arraste um CSV aqui ou clique para selecionar<br />Colunas: Nome;Email;Tier;Segmento (Tier/Segmento opcionais)</p>
                  <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processarCSV(f); }} />
                </label>
              </>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-emerald-700">{importResult.novos.length}</p>
                    <p className="text-[11px] text-emerald-600">Novos</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-center">
                    <p className="text-lg font-bold">{importResult.existentes.length}</p>
                    <p className="text-[11px] text-muted-foreground">Já existentes</p>
                  </div>
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-rose-700">{importResult.invalidos.length}</p>
                    <p className="text-[11px] text-rose-600">Inválidos</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setImportResult(null)}>Voltar</Button>
                  <Button size="sm" disabled={importResult.novos.length === 0} onClick={confirmarImport}>
                    Confirmar {importResult.novos.length > 0 ? `${importResult.novos.length} membro(s)` : ""}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Últimos cadastrados</p>
          {sempreVazio || membros.length === 0 ? (
            <EmptyState icon={Users} title="Nenhum membro cadastrado ainda"
              description="Cadastre um a um ou importe uma planilha acima." />
          ) : (
            <>
              <div className="rounded-lg border border-border overflow-hidden divide-y divide-border">
                {membros.slice(-5).reverse().map((m) => (
                  <div key={m.id} className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="h-6 w-6 shrink-0"><AvatarFallback className="text-[10px] bg-primary/10 text-primary">{m.initials}</AvatarFallback></Avatar>
                    <span className="text-xs font-medium flex-1 truncate">{m.nome}</span>
                    <span className="text-xs text-muted-foreground">{m.tier}</span>
                  </div>
                ))}
              </div>
              <Link to="/membros/extrato" className="text-xs text-primary hover:underline">Ver todos os membros →</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Seção: Produtos ──────────────────────────────────────────────────────────

export function SecaoProdutos({ metodo, sempreVazio }: { metodo: MetodoBase | null; sempreVazio?: boolean }) {
  const mostrarManual = metodo !== "planilha";
  const mostrarImport = metodo !== "manual";
  const [produtos, setProdutos] = useState<Produto[]>(() => getProdutos());
  const [sku, setSku] = useState("");
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [preco, setPreco] = useState("");
  const [tierProdutoId, setTierProdutoId] = useState("");
  const [modeloVenda, setModeloVenda] = useState<ModeloVenda | "">("");
  const tiersProduto = getTiersProduto();
  const [importResult, setImportResult] = useState<{
    novos: { sku: string; nome: string; categoria: string; preco: number }[];
    existentes: string[]; invalidos: string[];
  } | null>(null);

  function persist(next: Produto[]) {
    setProdutos(next);
    saveProdutos(next);
  }

  function adicionar() {
    if (!sku || !nome) return;
    persist([
      {
        id: `SKU-${String(produtos.length + 1).padStart(3, "0")}`,
        sku, nome, categoria, preco: Number(preco.replace(",", ".")) || 0,
        tierProdutoId: tierProdutoId || undefined,
        modeloVenda: modeloVenda || undefined,
        status: "ativo", campanhasVinculadas: [], criadoEm: new Date().toLocaleDateString("pt-BR"),
        campanhas: [], pedidos: [], historico: [{ data: new Date().toLocaleDateString("pt-BR"), evento: "Produto cadastrado", detalhe: "Adicionado ao catálogo", tipo: "criado" }],
      },
      ...produtos,
    ]);
    toast.success(`${nome} adicionado ao catálogo`);
    setSku(""); setNome(""); setCategoria(CATEGORIAS[0]); setPreco(""); setTierProdutoId(""); setModeloVenda("");
  }

  function processarCSV(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const linhas = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const skusExistentes = new Set(produtos.map((p) => p.sku.toUpperCase()));
      const novos: { sku: string; nome: string; categoria: string; preco: number }[] = [];
      const existentes: string[] = []; const invalidos: string[] = [];
      for (const linha of linhas) {
        const cols = linha.split(/[;,]/).map((c) => c.trim().replace(/^["']|["']$/g, ""));
        if (cols[0]?.toLowerCase() === "sku") continue;
        const [s, n, cat, precoRaw] = cols;
        if (!s || !n) { invalidos.push(linha); continue; }
        if (skusExistentes.has(s.toUpperCase())) { existentes.push(s); continue; }
        const catValida = CATEGORIAS.find((c) => c.toLowerCase() === cat?.toLowerCase());
        novos.push({ sku: s, nome: n, categoria: catValida ?? CATEGORIAS[0], preco: Number((precoRaw ?? "0").replace(",", ".")) || 0 });
      }
      setImportResult({ novos, existentes, invalidos });
    };
    reader.readAsText(file);
  }

  function confirmarImport() {
    if (!importResult || importResult.novos.length === 0) return;
    const novosProdutos: Produto[] = importResult.novos.map((n, i) => ({
      id: `SKU-${String(produtos.length + i + 1).padStart(3, "0")}`,
      sku: n.sku, nome: n.nome, categoria: n.categoria, preco: n.preco,
      status: "processando", campanhasVinculadas: [], criadoEm: new Date().toLocaleDateString("pt-BR"),
      campanhas: [], pedidos: [], historico: [{ data: new Date().toLocaleDateString("pt-BR"), evento: "Produto cadastrado", detalhe: "Importado em lote — processando", tipo: "criado" }],
    }));
    persist([...novosProdutos, ...produtos]);
    toast.success(`${novosProdutos.length} produto(s) importado(s)`);
    setImportResult(null);
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
        <Package className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-semibold">Produtos</p>
          <p className="text-xs text-muted-foreground">{sempreVazio ? 0 : produtos.length} cadastrado(s) hoje.</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {metodo === "integracao" && (
          <div className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 text-xs text-violet-800">
            Integração automática com sistemas externos ainda não está disponível — em breve. Por enquanto, cadastre um a um ou importe uma planilha abaixo.
          </div>
        )}

        {/* Cadastro individual */}
        {mostrarManual && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cadastrar um a um</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">SKU</Label>
                <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Ex: TV-50-4K" className="font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Nome</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder='Ex: Smart TV 50"' />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Categoria</Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Preço (R$)</Label>
                <Input value={preco} onChange={(e) => setPreco(e.target.value.replace(/[^0-9.,]/g, ""))} placeholder="Ex: 199,90" inputMode="decimal" />
              </div>
            </div>
            {tiersProduto.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs">Tier do produto (opcional — Biblioteca)</Label>
                <Select value={tierProdutoId || "nenhum"} onValueChange={(v) => setTierProdutoId(v === "nenhum" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Sem tier" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Sem tier</SelectItem>
                    {tiersProduto.map((t) => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">Modelo de venda (opcional)</Label>
              <div className="grid grid-cols-3 gap-2">
                {([["", "Não informado"], ["1P", "1P"], ["3P", "3P"]] as const).map(([v, label]) => (
                  <label key={v} className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                    modeloVenda === v ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                  }`}>
                    <input type="radio" name="modeloVenda" checked={modeloVenda === v} onChange={() => setModeloVenda(v as ModeloVenda | "")} className="sr-only" />
                    <span className="text-xs font-semibold">{label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">1P = venda própria · 3P = seller/marketplace.</p>
            </div>
            <Button size="sm" disabled={!sku || !nome} onClick={adicionar}>
              <Package className="mr-2 h-3.5 w-3.5" />Adicionar produto
            </Button>
          </div>
        )}

        {mostrarManual && mostrarImport && <div className="border-t border-border" />}

        {/* Importação em massa */}
        {mostrarImport && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{mostrarManual ? "Ou importar em massa" : "Importar em massa"}</p>
            {!importResult ? (
              <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <p className="text-xs text-muted-foreground text-center">Arraste um CSV aqui ou clique para selecionar<br />Colunas: SKU;Nome;Categoria;Preço</p>
                <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processarCSV(f); }} />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-emerald-700">{importResult.novos.length}</p>
                    <p className="text-[11px] text-emerald-600">Novos</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-center">
                    <p className="text-lg font-bold">{importResult.existentes.length}</p>
                    <p className="text-[11px] text-muted-foreground">Já existentes</p>
                  </div>
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-rose-700">{importResult.invalidos.length}</p>
                    <p className="text-[11px] text-rose-600">Inválidos</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setImportResult(null)}>Voltar</Button>
                  <Button size="sm" disabled={importResult.novos.length === 0} onClick={confirmarImport}>
                    Confirmar {importResult.novos.length > 0 ? `${importResult.novos.length} produto(s)` : ""}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Últimos cadastrados</p>
          {sempreVazio || produtos.length === 0 ? (
            <EmptyState icon={Package} title="Nenhum produto cadastrado ainda"
              description="Cadastre um a um ou importe uma planilha acima." />
          ) : (
            <>
              <div className="rounded-lg border border-border overflow-hidden divide-y divide-border">
                {produtos.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-3 py-2">
                    <span className="text-xs font-mono text-muted-foreground w-24 shrink-0 truncate">{p.sku}</span>
                    <span className="text-xs font-medium flex-1 truncate">{p.nome}</span>
                    {p.modeloVenda && <span className="text-xs rounded-full bg-muted px-2 py-0.5 shrink-0">{p.modeloVenda}</span>}
                    <span className="text-xs text-muted-foreground">{p.categoria}</span>
                  </div>
                ))}
              </div>
              <Link to="/catalogo-produtos" className="text-xs text-primary hover:underline">Ver todos os produtos →</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
