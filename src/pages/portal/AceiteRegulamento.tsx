import { useState, useRef } from "react";
import { Button } from "@kruzer/ds";
import { ScrollText, CheckCircle2 } from "lucide-react";

const REGULAMENTO = `REGULAMENTO DO PROGRAMA DE FIDELIDADE — MOTOR DE PONTOS

1. PARTICIPAÇÃO
1.1. Podem participar do Programa pessoas físicas (PF) maiores de 18 anos e pessoas jurídicas (PJ) devidamente constituídas, cadastradas conforme as instruções do Programa.
1.2. O cadastro é gratuito. Para PF, é individual e intransferível. Para PJ, o responsável pelo cadastro declara ter poderes para representar a empresa.
1.3. Ao realizar o cadastro, o Participante declara ter lido e aceito integralmente este Regulamento.

2. ACÚMULO DE PONTOS
2.1. Os pontos são acumulados conforme as regras de cada campanha ativa.
2.2. A taxa base de acúmulo e os multiplicadores por nível estão descritos na Mecânica do Programa, disponível no portal.
2.3. Pontos são creditados conforme o status do pedido definido em cada campanha.
2.4. Pontos não têm valor monetário e não podem ser transferidos ou convertidos em dinheiro.

3. EXPIRAÇÃO DE PONTOS
3.1. Os pontos expiram conforme a política configurada pelo programa (por inatividade, data de emissão ou aniversário do cadastro).
3.2. O Participante será notificado com antecedência mínima de 30 dias sobre a expiração iminente.

4. RESGATE DE RECOMPENSAS
4.1. O resgate está disponível para Participantes com saldo mínimo conforme definido na Mecânica do Programa.
4.2. As recompensas disponíveis são as listadas no catálogo vigente, sujeitas a disponibilidade de estoque.
4.3. Após a solicitação de resgate, o prazo de entrega é informado no catálogo para cada produto.
4.4. O resgate é definitivo — uma vez processado, não é possível cancelar ou estornar os pontos.

5. NIVELAMENTO
5.1. O nível (tier) do Participante é determinado automaticamente pelo volume de pontos acumulados.
5.2. A progressão e os critérios de manutenção de nível estão descritos na tabela de tiers disponível no portal.

6. ALTERAÇÕES E ENCERRAMENTO
6.1. O Programa pode ser alterado, suspenso ou encerrado a qualquer momento, mediante comunicação prévia de 30 dias.
6.2. Este Regulamento pode ser alterado a qualquer momento. O Participante será notificado e precisará aceitar os novos termos para continuar participando.

7. PRIVACIDADE E DADOS PESSOAIS
7.1. Os dados pessoais coletados são tratados conforme a Política de Privacidade disponível no portal, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).
7.2. O Participante pode solicitar a exclusão de seus dados e o encerramento de sua participação a qualquer momento.

8. FORO
8.1. Fica eleito o foro da comarca de São Paulo/SP para dirimir eventuais controvérsias decorrentes deste Regulamento.`;

interface Props {
  onAceitar: () => void;
}

export default function AceiteRegulamento({ onAceitar }: Props) {
  const [lido, setLido]     = useState(false);
  const [aceito, setAceito] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      setLido(true);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <ScrollText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-bold text-base">Regulamento do Programa</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Leia antes de participar · Obrigatório</p>
        </div>
      </div>

      {/* Texto */}
      <div className="flex-1 min-h-0 px-6 py-4">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto rounded-xl border border-border bg-muted/20 px-6 py-5 text-sm text-muted-foreground leading-7 whitespace-pre-line font-mono text-xs"
        >
          {REGULAMENTO}
          <div className="h-8" /> {/* espaço extra no final */}
        </div>
      </div>

      {/* Rodapé */}
      <div className="px-6 py-5 border-t border-border space-y-4">
        {!lido && (
          <p className="text-xs text-muted-foreground text-center">
            Role até o final para habilitar o aceite.
          </p>
        )}

        {lido && (
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={aceito}
              onChange={(e) => setAceito(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary shrink-0"
            />
            <span className="text-sm text-foreground leading-snug">
              Li e aceito os termos do Regulamento do Programa de Fidelidade, incluindo as regras de acúmulo, expiração e resgate, aplicáveis a Pessoa Física e Pessoa Jurídica, e a Política de Privacidade (LGPD — Lei 13.709/2018).
            </span>
          </label>
        )}

        <Button
          className="w-full"
          disabled={!aceito}
          onClick={onAceitar}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Aceitar e entrar no programa
        </Button>
      </div>
    </div>
  );
}
