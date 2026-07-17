# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Idioma

Sempre responda em português brasileiro, independentemente do idioma das perguntas.

## Comunicação

- Seja direto e objetivo. Vá direto ao ponto.
- Por padrão, respostas curtas. Quando for algo mais complexo, ofereça a opção: "Quer uma explicação mais detalhada?"
- Ao mostrar código, mostre apenas o trecho relevante — não o arquivo inteiro.
- O usuário é designer, não programador. Evite jargão técnico desnecessário. Prefira analogias visuais e explicações em linguagem simples.

## Workflow

- Sempre mostre o plano antes de executar e aguarde confirmação explícita antes de agir.
- Se algo falhar ou bloquear, consulte antes de tentar alternativa.
- Pode sugerir melhorias fora do escopo pedido, mas informe antes de aplicar e aguarde confirmação.
- Nunca instale pacotes ou dependências sem perguntar antes.
- Não faça commits automáticos. Só commite se explicitamente pedido.
- Prefira editar arquivos existentes a criar novos.
- Antes de executar tarefas, pergunte se o usuário prefere um plano detalhado (passo a passo) ou resumido (1-2 linhas).
- Ao realizar múltiplas buscas ou leituras em paralelo, informe quais operações serão feitas antes de executá-las.

## Comportamento Geral

- Tarefas grandes devem ser quebradas em etapas — execute uma de cada vez, aguardando confirmação entre elas.
- Agrupe todas as dúvidas em uma única mensagem, nunca uma por vez.
- Se identificar um padrão consistente no projeto, informe antes de adotá-lo automaticamente.
- Quando a conversa ficar longa e começar a desperdiçar contexto, sugira abrir uma nova sessão.
- Antes de compactar o contexto da conversa (compact), peça autorização explícita ao usuário.
- Aponte problemas diretamente, sem rodeios.
- Se houver uma solução melhor do que a pedida, avise e decida junto com o usuário antes de executar.

## Eficiência de Tokens

- Não releia arquivos que já foram lidos na sessão atual, a menos que o usuário indique que houve mudança.
- Evite repetir conteúdo já mencionado na conversa.
- Não explique o óbvio nem resuma o que acabou de fazer.
- Ao iniciar uma tarefa nova, pergunte sobre o contexto do projeto antes de explorar o código.
- Antes de ler múltiplos arquivos, liste quais pretende ler e aguarde confirmação.
- Em caso de erro, pode investigar autonomamente — mas informe o que está fazendo.
- Salve padrões e decisões relevantes do projeto na memória entre sessões, mas comunique antes de salvar.

## UI

- Nunca adicionar badge, watermark ou label de "protótipo pague menos" (ou variações) em nenhuma tela.
- O espaço de conteúdo central é dinâmico e exclusivo: nunca pode aparecer mais de um bloco de conteúdo ao mesmo tempo. Todo conteúdo que ocupa esse espaço deve ser mutuamente exclusivo.

## Stack

Projetos neste ambiente geralmente usam HTML, CSS e JavaScript vanilla — sem frameworks, sem build tools. Não sugira ou adicione dependências desnecessárias.

## Code to Design Integration
- Quando solicitado o fluxo de exportação de interfaces para o Figma, você deve seguir estritamente as diretrizes geométricas, de tokens e de responsividade contidas no arquivo `.claude/skills/code-to-design.md`.


