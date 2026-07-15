import { useState } from "react";
import { Button, PageHeader, Tabs, TabsContent, TabsList, TabsTrigger, toast } from "@kruzer/ds";
import { Eye, RotateCcw, Save } from "lucide-react";

const REGULAMENTO_PF = `REGULAMENTO DO PROGRAMA DE FIDELIDADE — PESSOA FÍSICA (PF)

1. PARTICIPAÇÃO
1.1. Podem participar pessoas físicas maiores de 18 anos, cadastradas conforme as instruções do Programa.
1.2. O cadastro é gratuito, individual e intransferível.
1.3. Ao realizar o cadastro, o Participante declara ter lido e aceito integralmente este Regulamento.

2. ACÚMULO DE PONTOS
2.1. Os pontos são acumulados conforme as regras de cada campanha ativa.
2.2. A taxa base de acúmulo e os multiplicadores por nível estão descritos na Mecânica do Programa, disponível no portal.
2.3. Pontos não têm valor monetário e não podem ser transferidos, negociados ou convertidos em dinheiro.

3. EXPIRAÇÃO DE PONTOS
3.1. Os pontos expiram conforme a política configurada pelo Programa (por inatividade, data de emissão ou aniversário do cadastro).
3.2. O Participante será notificado com antecedência mínima de 30 dias sobre a expiração iminente.

4. RESGATE DE RECOMPENSAS
4.1. O resgate está disponível para Participantes com saldo mínimo conforme a Mecânica do Programa.
4.2. Resgates por PF podem exigir emissão de RPA (Recibo de Pagamento Autônomo) quando o valor acumulado atingir os limites legais aplicáveis.
4.3. Após a solicitação, o prazo de entrega é informado no catálogo para cada produto.
4.4. O resgate é definitivo — uma vez processado, não é possível cancelar ou estornar os pontos.

5. NIVELAMENTO
5.1. O nível (tier) é determinado automaticamente pelo volume de pontos acumulados, conforme tabela de tiers disponível no portal.

6. ALTERAÇÕES E ENCERRAMENTO
6.1. O Programa pode ser alterado, suspenso ou encerrado a qualquer momento, mediante comunicação prévia de 30 dias.
6.2. Alterações neste Regulamento serão comunicadas ao Participante, que precisará aceitar os novos termos para continuar participando.

7. PRIVACIDADE E DADOS
7.1. Os dados pessoais coletados são tratados conforme a Política de Privacidade do Programa, em conformidade com a LGPD (Lei 13.709/2018).
7.2. O Participante pode solicitar a exclusão de seus dados e o encerramento de sua participação a qualquer momento.

8. FORO
8.1. Fica eleito o foro da comarca de São Paulo/SP para dirimir eventuais controvérsias decorrentes deste Regulamento.`;

const REGULAMENTO_PJ = `REGULAMENTO DO PROGRAMA DE FIDELIDADE — PESSOA JURÍDICA (PJ)

1. PARTICIPAÇÃO
1.1. Podem participar pessoas jurídicas devidamente constituídas, cadastradas conforme as instruções do Programa.
1.2. O responsável pelo cadastro declara ter poderes para representar a empresa e aceitar este Regulamento em seu nome.
1.3. O cadastro é gratuito. Cada CNPJ pode ter apenas um cadastro ativo no Programa.

2. ACÚMULO DE PONTOS
2.1. Os pontos são acumulados conforme as regras de cada campanha ativa, salvo restrição expressa em campanha específica.
2.2. A taxa base de acúmulo e os multiplicadores por nível estão descritos na Mecânica do Programa, disponível no portal.
2.3. Pontos não têm valor monetário e não podem ser transferidos, negociados ou convertidos em dinheiro.

3. EXPIRAÇÃO DE PONTOS
3.1. Os pontos expiram conforme a política configurada pelo Programa (por inatividade, data de emissão ou aniversário do cadastro).
3.2. A empresa será notificada com antecedência mínima de 30 dias sobre a expiração iminente.

4. RESGATE DE RECOMPENSAS
4.1. O resgate está disponível para Participantes com saldo mínimo conforme a Mecânica do Programa.
4.2. Resgates por PJ estão sujeitos à emissão de Nota Fiscal (NF) conforme legislação tributária vigente. A empresa é responsável por fornecer os dados fiscais corretos no momento do resgate.
4.3. O não fornecimento de dados fiscais válidos pode bloquear o processamento do resgate.
4.4. Após a solicitação e validação fiscal, o prazo de entrega é informado no catálogo para cada produto.
4.5. O resgate é definitivo — uma vez processado, não é possível cancelar ou estornar os pontos.

5. NIVELAMENTO
5.1. O nível (tier) da empresa é determinado automaticamente pelo volume de pontos acumulados, conforme tabela de tiers disponível no portal.

6. ALTERAÇÕES E ENCERRAMENTO
6.1. O Programa pode ser alterado, suspenso ou encerrado a qualquer momento, mediante comunicação prévia de 30 dias.
6.2. Alterações neste Regulamento serão comunicadas ao responsável cadastrado, que precisará aceitar os novos termos para continuar participando.

7. PRIVACIDADE E DADOS
7.1. Os dados da empresa e do representante legal são tratados conforme a Política de Privacidade do Programa, em conformidade com a LGPD (Lei 13.709/2018).
7.2. Os dados são utilizados exclusivamente para fins do Programa, incluindo processamento de resgates e obrigações fiscais.
7.3. A empresa pode solicitar a exclusão de seus dados e o encerramento de sua participação a qualquer momento.

8. FORO
8.1. Fica eleito o foro da comarca de São Paulo/SP para dirimir eventuais controvérsias decorrentes deste Regulamento.`;

type Perfil = "PF" | "PJ";

export default function Regulamento() {
  const [perfil,  setPerfil]  = useState<Perfil>("PF");
  const [textos,  setTextos]  = useState({ PF: REGULAMENTO_PF, PJ: REGULAMENTO_PJ });
  const [salvos,  setSalvos]  = useState({ PF: REGULAMENTO_PF, PJ: REGULAMENTO_PJ });
  const [preview, setPreview] = useState(false);

  const texto = textos[perfil];
  const salvo = salvos[perfil];
  const dirty  = texto !== salvo;

  function setTexto(v: string) {
    setTextos(prev => ({ ...prev, [perfil]: v }));
  }

  function handleSalvar() {
    setSalvos(prev => ({ ...prev, [perfil]: textos[perfil] }));
    toast.success(`Regulamento ${perfil} salvo. Membros ${perfil} verão a versão atualizada no próximo acesso.`);
  }

  function handleDescartar() {
    setTextos(prev => ({ ...prev, [perfil]: salvos[perfil] }));
  }

  const dirtyPF = textos.PF !== salvos.PF;
  const dirtyPJ = textos.PJ !== salvos.PJ;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Regulamento do programa"
        path={[{ label: "Configuração" }]}
        description="Textos exibidos ao membro no primeiro acesso ao portal, por tipo de pessoa. Obrigatório para aceite (LGPD)."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPreview(!preview)}>
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              {preview ? "Editar" : "Prévia"}
            </Button>
            {dirty && (
              <Button variant="ghost" size="sm" onClick={handleDescartar}>
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Descartar
              </Button>
            )}
            <Button size="sm" disabled={!dirty} onClick={handleSalvar}>
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Salvar
            </Button>
          </div>
        }
      />

      {dirty && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 flex items-center gap-2">
          <span className="font-semibold">Alterações não salvas no regulamento {perfil}.</span>
          Salve para que o novo texto apareça no portal.
        </div>
      )}

      <Tabs value={perfil} onValueChange={v => { setPerfil(v as Perfil); setPreview(false); }}>
        <TabsList>
          <TabsTrigger value="PF" className="gap-2">
            Pessoa Física
            {dirtyPF && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
          </TabsTrigger>
          <TabsTrigger value="PJ" className="gap-2">
            Pessoa Jurídica
            {dirtyPJ && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
          </TabsTrigger>
        </TabsList>

        {(["PF", "PJ"] as Perfil[]).map(p => (
          <TabsContent key={p} value={p} className="mt-4">
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {preview ? `Prévia · como o membro ${p} verá` : `Editor — ${p}`}
                </span>
                <span className="text-xs text-muted-foreground">{texto.length} caracteres</span>
              </div>

              {preview ? (
                <div className="px-6 py-5 text-xs font-mono text-muted-foreground leading-7 whitespace-pre-line max-h-[60vh] overflow-y-auto">
                  {texto}
                </div>
              ) : (
                <textarea
                  value={texto}
                  onChange={e => setTexto(e.target.value)}
                  className="w-full min-h-[60vh] px-6 py-5 text-xs font-mono text-foreground leading-7 bg-background resize-none focus:outline-none"
                  placeholder={`Digite o regulamento para ${p}…`}
                  spellCheck={false}
                />
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="rounded-lg border border-border bg-card px-5 py-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Como funciona</p>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li className="flex gap-2"><span className="text-primary">→</span> Membros PF veem o regulamento da aba "Pessoa Física". Membros PJ veem o da aba "Pessoa Jurídica".</li>
          <li className="flex gap-2"><span className="text-primary">→</span> No primeiro acesso ao portal, o regulamento correspondente ao perfil é exibido para leitura e aceite obrigatório.</li>
          <li className="flex gap-2"><span className="text-primary">→</span> Ao salvar uma nova versão, membros que já aceitaram continuam no portal. Novas versões pedem reaceite automaticamente.</li>
          <li className="flex gap-2"><span className="text-primary">→</span> O aceite é registrado com data, horário e perfil conforme exigência da LGPD.</li>
        </ul>
      </div>
    </div>
  );
}
