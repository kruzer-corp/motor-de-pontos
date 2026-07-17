# Skill: Code to Design (Figma Blueprint Engine)

Sempre que a Product Designer solicitar a exportação de uma tela, componente ou fluxo para o Figma, você deve ativar esta skill. Ela garante 100% de compatibilidade matemática com o interpretador de Auto Layout do Figma, consistência com o Design System da empresa e fidelidade com as regras de negócio locais.

## 1. Arquitetura Geométrica (Garantia de Auto Layout Perfeito)
- TERMINANTEMENTE PROIBIDO o uso de CSS Grid (`grid`, `grid-cols-*`). Substitua SEMPRE por estruturas baseadas em Flexbox (`flex`, `flex-row`, `flex-col`) para que o conversor do Figma interprete os frames nativamente.
- Todo elemento de texto (`<h1>`, `<p>`, `<span>`, `<a>`, `<label>`) deve estar envelopado por um contêiner pai com propriedade `flex`. Textos soltos geram lixo visual e desalinhamentos no canvas.
- Proibido o uso de propriedades de posicionamento dinâmico ou flutuante complexo (`position: absolute`, margens negativas ou `translate`), garantindo que nenhuma camada seja importada sobreposta.
- Dimensões previsíveis: Elementos estruturais fixos (como Sidebars e Menus de navegação) devem ter larguras travadas usando largura mínima fixa (ex: `w-64 min-w-[256px]`).

## 2. Assets e Mídias em Ambiente Offline (Privacidade Local)
- PROIBIDO o uso de tags `<img>` apontando para caminhos de arquivos locais (ex: `src="/assets/logo.png"`). Navegadores bloqueiam o carregamento dessas mídias por segurança em visualizações locais offline (`file:///`).
- Todo e qualquer logotipo (como o logo da Kruzer) ou ícone de interface deve ser renderizado obrigatoriamente como **SVG Inline** (código XML `<svg>` injetado direto no documento HTML).
- Se o vetor exato do logotipo de um produto não estiver disponível no escopo do repositório, você deve gerar um placeholder elegante combinando um ícone geométrico minimalista em SVG e texto estilizado com Tailwind (ex: `<span class="font-bold tracking-tight">Kruzer</span>`).

## 3. Governança e Cobertura Rígida do Design System (DS)
- PROIBIDO inventar ou injetar valores hexadecimais puros (ex: `#4f46e5`) ou valores de pixel arbitrários fora da escala (ex: `margin: 17px`).
- Você deve utilizar estritamente a arquitetura de Design Tokens do repositório, mapeando as classes utilitárias equivalentes do Tailwind:
  * Cores Semânticas: Use os tokens oficiais (ex: `bg-brand-primary`, `text-content-subtle`, `border-border-muted`).
  * Grade de Espaçamento: Use apenas os passos oficiais da escala (ex: `space-y-4`, `p-6`, `gap-3`).
  * Tipografia: Respeite a escala de cabeçalhos e pesos (ex: `text-heading-lg font-bold`, `text-body-sm`).
- Elementos que possuem estados interativos (Hover, Focus, Disabled) devem ser gerados com o HTML aplicando os tokens correspondentes de estado mapeados no DS.

## 4. Diretrizes de Responsividade (Breakpoints Isolados)
- PROIBIDO misturar classes utilitárias responsivas de ocultação complexa (ex: `hidden md:block`) no mesmo arquivo de visualização, pois isso polui o canvas do Figma com elementos invisíveis/fantasmas.
- O produto deve manter sua responsividade através da geração de **arquivos físicos separados para cada viewport principal** solicitada:
  * Desktop (Computador): `[nome-da-tela]-desktop.html` (Largura fixa recomendada de visualização: 1440px).
  * Mobile (Celular): `[nome-da-tela]-mobile.html` (Largura fixa recomendada de visualização: 375px).
- Na versão Mobile, adapte o comportamento do layout de forma nativa (ex: colapsar sidebars em menus hambúrgueres em SVG e empilhar elementos horizontalmente usando `flex-col`).

## 5. Fidelidade de Conteúdo e Regras de Negócio (Anti-Lorem Ipsum)
- Antes de estruturar o código da interface, leia obrigatoriamente os arquivos de especificação local na raiz do projeto (ex: `CONTEXTO.md`, `levantamento-tabelas.md` ou documentações de jornadas de usuário).
- Utilize os nomes exatos de colunas, os tipos de dados reais do sistema e os fluxos descritos no escopo. É terminantemente proibido inventar dados fictícios ou usar textos genéricos como "Lorem Ipsum".
- Remova comportamentos dinâmicos de JavaScript. Modais, dropdowns e menus flutuantes devem ser renderizados em seu estado inicial **ABERTO e ESTÁTICO** para que o interpretador capture o componente por inteiro.

## 6. Rotina de Autoverificação (Linter de Adesão)
Ao finalizar a escrita de qualquer arquivo de exportação, você deve apresentar um resumo no chat contendo:
1. Uma lista de todos os tokens do Design System que foram aplicados.
2. A confirmação de que o arquivo foi testado localmente sob a estrutura puramente Flexbox e SVG inline.
3. Se houve alguma limitação no repositório que exigiu a criação de um estilo customizado fora do DS.
