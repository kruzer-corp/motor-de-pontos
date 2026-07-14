import { useState } from "react";
import { Button, PageHeader, toast } from "@kruzer/ds";
import { Save, Eye, RotateCcw } from "lucide-react";

const REGULAMENTO_INICIAL = `REGULAMENTO DO PROGRAMA DE FIDELIDADE — MOTOR DE PONTOS

1. PARTICIPAÇÃO
1.1. Podem participar do Programa pessoas físicas (PF) maiores de 18 anos e pessoas jurídicas (PJ) devidamente constituídas, cadastradas conforme as instruções do Programa.
1.2. O cadastro é gratuito. Para PF, é individual e intransferível. Para PJ, o responsável pelo cadastro declara ter poderes para representar a empresa.
1.3. Ao realizar o cadastro, o Participante declara ter lido e aceito integralmente este Regulamento.

2. ACÚMULO DE PONTOS
2.1. Os pontos são acumulados conforme as regras de cada campanha ativa, aplicáveis tanto a PF quanto a PJ, salvo restrição expressa em campanha específica.
2.2. A taxa base de acúmulo e os multiplicadores por nível estão descritos na Mecânica do Programa, disponível no portal.
2.3. Pontos não têm valor monetário e não podem ser transferidos, negociados ou convertidos em dinheiro.

3. EXPIRAÇÃO DE PONTOS
3.1. Os pontos expiram conforme a política configurada pelo Programa (por inatividade, data de emissão ou aniversário do cadastro).
3.2. O Participante será notificado com antecedência mínima de 30 dias sobre a expiração iminente.

4. RESGATE DE RECOMPENSAS
4.1. O resgate está disponível para Participantes com saldo mínimo conforme a Mecânica do Programa.
4.2. Resgates por PJ podem estar sujeitos à emissão de documentação fiscal (NF), conforme legislação vigente.
4.3. Resgates por PF podem exigir emissão de RPA quando aplicável.
4.4. Após a solicitação, o prazo de entrega é informado no catálogo para cada produto.
4.5. O resgate é definitivo — uma vez processado, não é possível cancelar ou estornar os pontos.

5. NIVELAMENTO
5.1. O nível (tier) do Participante — PF ou PJ — é determinado automaticamente pelo volume de pontos acumulados, conforme tabela de tiers disponível no portal.

6. ALTERAÇÕES E ENCERRAMENTO
6.1. O Programa pode ser alterado, suspenso ou encerrado a qualquer momento, mediante comunicação prévia de 30 dias.
6.2. Alterações neste Regulamento serão comunicadas ao Participante, que precisará aceitar os novos termos para continuar participando.

7. PRIVACIDADE E DADOS
7.1. Os dados pessoais e empresariais coletados são tratados conforme a Política de Privacidade do Programa, em conformidade com a LGPD (Lei 13.709/2018).
7.2. Para PJ, o tratamento envolve dados do representante legal e da empresa, utilizados exclusivamente para fins do Programa.
7.3. O Participante pode solicitar a exclusão de seus dados e o encerramento de sua participação a qualquer momento.

8. FORO
8.1. Fica eleito o foro da comarca de São Paulo/SP para dirimir eventuais controvérsias decorrentes deste Regulamento.`;

export default function Regulamento() {
  const [texto, setTexto] = useState(REGULAMENTO_INICIAL);
  const [salvo, setSalvo]   = useState(REGULAMENTO_INICIAL);
  const [preview, setPreview] = useState(false);
  const dirty = texto !== salvo;

  function handleSalvar() {
    setSalvo(texto);
    toast.success("Regulamento salvo. Membros que acessarem o portal pela primeira vez verão a versão atualizada.");
  }

  function handleDescartar() {
    setTexto(salvo);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Regulamento do programa"
        path={[{ label: "Configuração" }]}
        description="Texto exibido ao membro no primeiro acesso ao portal. Obrigatório para aceite (LGPD)."
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
          <span className="font-semibold">Alterações não salvas.</span>
          Salve para que o novo texto apareça no portal do membro.
        </div>
      )}

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {preview ? "Prévia · como o membro verá" : "Editor"}
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
            onChange={(e) => setTexto(e.target.value)}
            className="w-full min-h-[60vh] px-6 py-5 text-xs font-mono text-foreground leading-7 bg-background resize-none focus:outline-none"
            placeholder="Digite o regulamento do programa…"
            spellCheck={false}
          />
        )}
      </div>

      <div className="rounded-lg border border-border bg-card px-5 py-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Como funciona</p>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li className="flex gap-2"><span className="text-primary">→</span> Na primeira vez que o membro acessa o portal, este texto é exibido para leitura e aceite obrigatório.</li>
          <li className="flex gap-2"><span className="text-primary">→</span> O membro só pode entrar no portal após rolar até o final e marcar a caixa de confirmação.</li>
          <li className="flex gap-2"><span className="text-primary">→</span> Ao salvar uma nova versão, membros que já aceitaram continuam no portal normalmente. Novas versões pedem reaceite automaticamente.</li>
          <li className="flex gap-2"><span className="text-primary">→</span> O aceite é registrado com data e horário conforme exigência da LGPD.</li>
        </ul>
      </div>
    </div>
  );
}
