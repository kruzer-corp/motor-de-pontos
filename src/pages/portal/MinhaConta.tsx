import { useState } from "react";
import { Button, Input, Label, Tabs, TabsList, TabsTrigger, TabsContent, toast } from "@kruzer/ds";
import { User, CreditCard, CheckCircle2, AlertCircle, Building2 } from "lucide-react";
import { CustomTag } from "../../components/CustomTag";

// ── Mock do membro logado ─────────────────────────────────────────────────────

const MEMBRO = {
  nome: "Aline Paula Silva",
  email: "aline.silva@email.com",
  telefone: "(11) 99876-5432",
  tipoPessoa: "PF" as "PF" | "PJ",
  cpf: "123.456.789-00",
  cnpj: "",
  razaoSocial: "",
};

type ChavePix = "cpf" | "email" | "telefone" | "aleatoria";
type TipoConta = "corrente" | "poupanca";

type DadosBancariosPF = {
  chavePix: ChavePix;
  valorChave: string;
  banco: string;
  agencia: string;
  conta: string;
  tipoConta: TipoConta;
  nomeCompleto: string;
  cpf: string;
};

type DadosBancariosPJ = {
  cnpj: string;
  razaoSocial: string;
  banco: string;
  agencia: string;
  conta: string;
  tipoConta: TipoConta;
  responsavel: string;
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MinhaConta() {
  // Dados pessoais
  const [nome, setNome]     = useState(MEMBRO.nome);
  const [email, setEmail]   = useState(MEMBRO.email);
  const [tel, setTel]       = useState(MEMBRO.telefone);
  const [savingDados, setSavingDados] = useState(false);

  // Dados bancários PF
  const [pf, setPF] = useState<DadosBancariosPF>({
    chavePix: "cpf",
    valorChave: MEMBRO.cpf,
    banco: "",
    agencia: "",
    conta: "",
    tipoConta: "corrente",
    nomeCompleto: MEMBRO.nome,
    cpf: MEMBRO.cpf,
  });
  const [savingPF, setSavingPF] = useState(false);
  const [savedPF, setSavedPF] = useState(false);

  // Dados bancários PJ
  const [pj, setPJ] = useState<DadosBancariosPJ>({
    cnpj: MEMBRO.cnpj,
    razaoSocial: MEMBRO.razaoSocial,
    banco: "",
    agencia: "",
    conta: "",
    tipoConta: "corrente",
    responsavel: MEMBRO.nome,
  });

  const isPF = MEMBRO.tipoPessoa === "PF";

  async function salvarDados() {
    setSavingDados(true);
    await new Promise(r => setTimeout(r, 600));
    setSavingDados(false);
    toast.success("Dados atualizados com sucesso");
  }

  async function salvarBancoPF() {
    setSavingPF(true);
    await new Promise(r => setTimeout(r, 600));
    setSavingPF(false);
    setSavedPF(true);
    toast.success("Dados bancários salvos. Seus resgates serão creditados nesta conta.");
  }

  async function salvarBancoPJ() {
    setSavingPF(true);
    await new Promise(r => setTimeout(r, 600));
    setSavingPF(false);
    setSavedPF(true);
    toast.success("Dados de recebimento PJ salvos.");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Minha conta</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie seus dados e configure como receber créditos de resgate.</p>
      </div>

      <Tabs defaultValue="dados">
        <TabsList>
          <TabsTrigger value="dados">
            <User className="h-3.5 w-3.5 mr-1.5" />
            Meus dados
          </TabsTrigger>
          <TabsTrigger value="credito" className="gap-1.5">
            <CreditCard className="h-3.5 w-3.5 mr-1.5" />
            Dados para recebimento
            <CustomTag className="text-[9px] px-1.5 py-0" />
            {!savedPF && (
              <span className="ml-1.5 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Meus dados ── */}
        <TabsContent value="dados" className="mt-5 space-y-5">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                {nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div>
                <p className="text-sm font-semibold">{nome}</p>
                <span className="text-xs text-muted-foreground">{isPF ? "Pessoa Física" : "Pessoa Jurídica"}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nome completo</Label>
                <Input value={nome} onChange={e => setNome(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>E-mail</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Telefone</Label>
                <Input value={tel} onChange={e => setTel(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>{isPF ? "CPF" : "CNPJ"}</Label>
                <Input value={isPF ? MEMBRO.cpf : MEMBRO.cnpj} disabled className="bg-muted/40" />
                <p className="text-[10px] text-muted-foreground">Campo não editável — entre em contato com o suporte.</p>
              </div>
            </div>

            <Button size="sm" onClick={salvarDados} disabled={savingDados}>
              {savingDados ? "Salvando…" : "Salvar alterações"}
            </Button>
          </div>
        </TabsContent>

        {/* ── Dados para recebimento ── */}
        <TabsContent value="credito" className="mt-5 space-y-5">

          {/* Contexto */}
          <div className={`rounded-xl border px-4 py-3 text-sm flex items-start gap-3 ${savedPF ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
            {savedPF
              ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            }
            <div>
              <p className="font-semibold">
                {savedPF ? "Dados configurados" : "Configure seus dados de recebimento"}
              </p>
              <p className="text-xs mt-0.5">
                {isPF
                  ? savedPF
                    ? "Seus resgates serão creditados via PIX ou transferência bancária. Um RPA será gerado automaticamente para cada crédito."
                    : "Para receber créditos de resgate na sua conta, configure sua chave PIX ou dados bancários. Um RPA (Recibo de Pagamento Autônomo) será gerado automaticamente."
                  : savedPF
                    ? "Seus resgates serão processados após a emissão da Nota Fiscal pelos dados cadastrados."
                    : "Para receber créditos, sua empresa precisa emitir uma NF para a Kruzer. Configure os dados bancários para recebimento."
                }
              </p>
            </div>
          </div>

          {isPF ? (
            /* ── PF — PIX + Conta bancária ── */
            <div className="rounded-xl border border-border bg-card p-5 space-y-5">
              <div>
                <h3 className="text-sm font-semibold mb-1">Chave PIX <span className="text-xs text-muted-foreground font-normal">(preferencial)</span></h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Tipo de chave</Label>
                    <select
                      value={pf.chavePix}
                      onChange={e => setPF(p => ({ ...p, chavePix: e.target.value as ChavePix, valorChave: "" }))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="cpf">CPF</option>
                      <option value="email">E-mail</option>
                      <option value="telefone">Telefone</option>
                      <option value="aleatoria">Chave aleatória</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Chave</Label>
                    <Input
                      value={pf.chavePix === "cpf" ? MEMBRO.cpf : pf.valorChave}
                      onChange={e => setPF(p => ({ ...p, valorChave: e.target.value }))}
                      disabled={pf.chavePix === "cpf"}
                      placeholder={
                        pf.chavePix === "email" ? "seu@email.com" :
                        pf.chavePix === "telefone" ? "(11) 99999-0000" : "Cole a chave aleatória"
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold mb-3">Conta bancária <span className="text-xs text-muted-foreground font-normal">(alternativa ao PIX)</span></h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label>Banco</Label>
                    <Input value={pf.banco} onChange={e => setPF(p => ({ ...p, banco: e.target.value }))} placeholder="Ex: Banco do Brasil" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Agência</Label>
                    <Input value={pf.agencia} onChange={e => setPF(p => ({ ...p, agencia: e.target.value }))} placeholder="0001" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Conta</Label>
                    <Input value={pf.conta} onChange={e => setPF(p => ({ ...p, conta: e.target.value }))} placeholder="12345-6" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tipo</Label>
                    <select
                      value={pf.tipoConta}
                      onChange={e => setPF(p => ({ ...p, tipoConta: e.target.value as TipoConta }))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="corrente">Corrente</option>
                      <option value="poupanca">Poupança</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nome completo (titular)</Label>
                    <Input value={pf.nomeCompleto} onChange={e => setPF(p => ({ ...p, nomeCompleto: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
                <strong className="text-foreground">RPA gerado automaticamente:</strong> ao aprovar o crédito, o sistema emite um Recibo de Pagamento Autônomo vinculado ao seu CPF. Você receberá uma cópia por e-mail.
              </div>

              <Button size="sm" onClick={salvarBancoPF} disabled={savingPF}>
                {savingPF ? "Salvando…" : "Salvar dados de recebimento"}
              </Button>
            </div>

          ) : (
            /* ── PJ — NF + Conta bancária ── */
            <div className="rounded-xl border border-border bg-card p-5 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Dados da empresa para emissão de NF</h3>
              </div>

              <div className="rounded-lg bg-sky-50 border border-sky-200 px-4 py-3 text-xs text-sky-800">
                <strong>Dados para tomador da NF:</strong><br/>
                Razão Social: <strong>Kruzer Tecnologia LTDA</strong><br/>
                CNPJ: <strong>00.000.000/0001-00</strong><br/>
                Serviço: <strong>Bonificação de incentivo — programa de fidelidade</strong>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>CNPJ da empresa</Label>
                  <Input value={pj.cnpj} onChange={e => setPJ(p => ({ ...p, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" />
                </div>
                <div className="space-y-1.5">
                  <Label>Razão Social</Label>
                  <Input value={pj.razaoSocial} onChange={e => setPJ(p => ({ ...p, razaoSocial: e.target.value }))} placeholder="Nome da empresa LTDA" />
                </div>
                <div className="space-y-1.5">
                  <Label>Banco</Label>
                  <Input value={pj.banco} onChange={e => setPJ(p => ({ ...p, banco: e.target.value }))} placeholder="Ex: Itaú" />
                </div>
                <div className="space-y-1.5">
                  <Label>Agência</Label>
                  <Input value={pj.agencia} onChange={e => setPJ(p => ({ ...p, agencia: e.target.value }))} placeholder="0001" />
                </div>
                <div className="space-y-1.5">
                  <Label>Conta</Label>
                  <Input value={pj.conta} onChange={e => setPJ(p => ({ ...p, conta: e.target.value }))} placeholder="12345-6" />
                </div>
                <div className="space-y-1.5">
                  <Label>Responsável pela NF</Label>
                  <Input value={pj.responsavel} onChange={e => setPJ(p => ({ ...p, responsavel: e.target.value }))} />
                </div>
              </div>

              <div className="rounded-lg bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
                <strong className="text-foreground">Fluxo PJ:</strong> ao solicitar resgate de crédito em conta, você receberá as instruções para emissão da NF. Após o upload e validação, o crédito é liberado no prazo definido pelo programa.
              </div>

              <Button size="sm" onClick={salvarBancoPJ} disabled={savingPF}>
                {savingPF ? "Salvando…" : "Salvar dados de recebimento"}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
