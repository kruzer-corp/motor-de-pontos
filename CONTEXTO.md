# Motor de Pontos — Pontos-chave para construir o produto (front + features)

> Documento de referência consolidando o discovery de mercado e as decisões de fronteira.
> **Escopo:** a camada de produto (telas, features, experiência) sobre o motor `rws-api`, que **já existe** e já faz a conta de pontos por baixo. Não cobre a engenharia do backend — cobre o que precisa ser desenhado e construído por cima dele.
> **Kruzer · Discovery Motor de Pontos · Junho 2026**

---

## 0. O princípio que orienta tudo

O motor é robusto, mas **opaco**: hoje toda regra é uma expressão técnica (CEL) escrita à mão pela engenharia. O produto existe para **tirar a Kruzer do meio** — dar ao cliente um painel onde ele opere o próprio programa.

Três coisas para não perder de vista:

- **A persona é não-técnica.** É o time de marketing/CRM do cliente — pensa em retenção, frequência e ticket, não em "expressão de regra". Cada tela é projetada para essa pessoa.
- **Provavelmente é "ferramenta + especialista", não autosserviço puro.** Quatro referências fortes (Bonifiq, Alloyal, Comarch, Annex) embutem consultoria. *Premissa a confirmar com o Felipe* — muda quanto o produto precisa segurar a mão do usuário.
- **Nem tudo é "só falta tela".** Parte das features só precisa de interface sobre o que o motor já faz; outra parte (cadastro de cliente, resgate, níveis) é **construção nova de verdade**. Separar os dois é o que define o tamanho do projeto.

---

## 1. As features, separadas por natureza

A decisão mais importante de planejamento: o que **já existe no motor e só precisa de tela** vs. o que é **feature nova** (produto, e geralmente algum backend também).

### 1a. Já existe no motor — só falta a interface
*Risco baixo, entrega rápida. O motor já expõe via API; falta o produto.*

- **Criar regra / campanha** — o coração do painel (ver seção 2 e 3).
- **Saldo, extrato e histórico** do cliente.
- **Ajuste manual** (creditar / debitar pontos).
- **Multi-moeda** (pontos / cashback / milhas — os "wallet clusters" já existem).

> ⚠️ *Confirmar com a engenharia o que o `rws-api` realmente entrega via interface antes de assumir "só falta tela".*

### 1b. Feature nova — construção de verdade (produto + eng)
*Maior esforço. Não dá para "ligar uma tela" porque a capacidade não existe.*

- **Cadastro de cliente (entidade de membro)** — hoje o cliente é só um código solto. É o **pré-requisito** de quase tudo (níveis, resgate, segmentação). *Ver seção 4.*
- **Fluxo de resgate** — trocar pontos por prêmio, do catálogo à entrega. O maior buraco funcional. *Ver seção 5.*
- **Níveis / tiers** — o motor não tem o conceito; precisa ser criado como feature de primeira classe.
- **Relatórios / dashboards** — os dados crus existem, mas a agregação e a visualização são novas.
- **Notificações / régua de comunicação** (e-mail, push, WhatsApp) — esperado no mercado BR.
- **Módulo de afiliados/comissão** — o "especificador". Grande o bastante para ser área própria. *Ver seção 6.*

---

## 2. As 7 políticas de uma regra (o miolo do construtor)

Toda regra de pontuação define sete coisas. Esta é a maior dor de UX: transformar isso numa interface que um não-técnico monte sozinho.

1. **Elegibilidade** — quem/o quê se qualifica (cliente, produto, categoria, canal, valor mínimo).
2. **Pontuação** — quanto ganha (fixo, % do valor, multiplicador).
3. **Liberação** — quando o ponto sai de "pendente" para "disponível" (ex.: após a janela de troca/devolução).
4. **Expiração** — quando o ponto vence.
5. **Limite** — teto por cliente, por período, por campanha.
6. **Cancelamento / estorno** — o que acontece se a compra for cancelada.
7. *(implícita)* **Prioridade / conflito** — qual regra vale quando duas se aplicam (empilha / a primeira / a de maior valor).

**Princípio de design:** não jogue as 7 numa tela só. A referência (Antavo) **divide por natureza** — a parte condicional (elegibilidade + pontuação) no construtor, e a "economia de pontos" (liberação, expiração, limite, estorno) em formulários separados, com bons defaults.

---

## 3. Como expressar uma regra (a decisão de UX central)

Três caminhos possíveis — **formulário**, **fluxograma**, **linguagem natural**. O benchmark aponta claro:

- **Formulário estruturado vence.** Stripe prova que dá para ter regra rica só com campos bem pensados; Bonifiq e Talon.One usam condição → efeito. Só a Antavo é canvas — e reserva o fluxograma para jornada com vários passos, não para a regra de pontos.
- **Modelo mental "gatilho → condição → ação"** (estilo Zapier/HubSpot) é o que o não-técnico entende: *a compra é o gatilho, dar pontos é a ação, a elegibilidade é o filtro.*
- **Templates derrotam a tela em branco.** A porta de entrada não é um editor vazio — é um **catálogo de modelos de campanha prontos** (Bonifiq "Objetivos", Antavo "blueprints"): criar conta, fazer compra, indicar amigo, aniversário, pontos em dobro numa categoria. A pessoa escolhe e ajusta.
- **Preview / simulação é o diferencial.** Testar a regra antes de publicar ("se um cliente comprar R$ 100, ganha X"). O motor já roda expressões, então isso é viável — e Talon.One só oferece via código, então é chance de sair na frente.

**Em uma frase:** formulário + biblioteca de templates + preview. O construtor livre existe como *escape* para a cauda longa, não como porta de entrada.

---

## 4. O cadastro de cliente (entidade de membro) — o alicerce

Todas as 12 referências de fidelidade tratam o membro como **entidade de primeira classe**. É o hub: identidade, saldo, nível, segmento e histórico orbitam a ficha do cliente.

Por que vem primeiro: **níveis, resgate e segmentação dependem dele existir.** Não dá para mostrar "os pontos do João" nem dizer "o João é Ouro" se o "João" não existe como ficha.

O que a feature precisa:
- Ficha do cliente (identidade + saldo + nível + segmento + extrato num lugar só).
- Busca e filtro de clientes (base para segmentação).
- Vínculo com as outras entidades (regras aplicadas, resgates, tier).

> ⚠️ **Decisão em aberto (com a engenharia):** de onde vem a identidade (nome, CPF, segmento)? Criada e dona no motor, ou referenciada do sistema do cliente? Uma tela de *consulta* funciona puxando o dado emprestado; mas como alicerce de níveis/resgate, provavelmente precisa de entidade própria. **Não improvisar.**

---

## 5. O fluxo de resgate (a maior feature nova)

O maior buraco funcional, e greenfield de produto + engenharia. O ciclo do programa só fecha quando o cliente consegue **trocar** os pontos — sem isso, acumular não tem sentido.

O fluxo mínimo a desenhar:

```
Catálogo de prêmios  →  Pedido  →  Débito no saldo  →  Entrega  →  (Estado/estorno)
```

- **Catálogo** — lista de recompensas (produto, voucher, desconto, frete).
- **Pedido** — o cliente escolhe e confirma.
- **Débito** — baixa idempotente no saldo (não pode debitar duas vezes).
- **Entrega** — pode começar manual ou por voucher num MVP.
- **Máquina de estados** — solicitado → aprovado → entregue → estornado.

Modelos de mercado a considerar: marketplace de parceiros (Alloyal, Rock — "comprar com pontos" no checkout) e app do consumidor (Dotz, Stix).

> 💡 **Insight provocativo:** o primeiro resgate precisa ser produto próprio, ou uma **integração** (gift card / marketplace de terceiro) para fechar o ciclo antes e validar a demanda? Decisão de build-vs-buy a discutir com o Felipe + eng.
> ⚠️ **Escopo do MVP ainda em aberto** — depende do dimensionamento da engenharia.

---

## 6. A fronteira: config no produto vs módulo vs custom

De tudo que foi feito sob medida (custom) para o cliente Fast, o que vira produto e o que continua específico. **A régua:**

- O que é **parâmetro** (muda um número/data entre clientes) → **config no produto**.
- O que é **coeso e grande** → **módulo próprio** (área separada).
- O que é **dado ou integração do cliente** → **custom por cliente**.

Aplicada aos cinco itens do Fast:

| Item | Destino | Por quê |
|---|---|---|
| Tipos de campanha | **Config (templates)** | Padrão de mercado; vira biblioteca de modelos |
| Indicação simples | **Config (regra)** | Comum; é só gatilho + recompensa |
| Afiliados / comissão (o "especificador") | **Módulo próprio** | Grande, com entidades próprias; o mercado produtizou (Bonifiq Affiliates) |
| Canais de venda | **Híbrido** | Conceito genérico (campo de elegibilidade) + lista específica por cliente |
| Importação de catálogo | **Custom / integração** | Vem do sistema de loja de cada cliente |

> ⚠️ Tudo isso é **proposta** — ratificar num workshop com Felipe + engenharia (sobretudo o que o motor já sabe sobre "canal" e catálogo).

---

## 7. Vocabulário do painel

O vocabulário técnico interno **não pode vazar** para a interface. O cliente nunca vê "wallet cluster", "carteira", "rule", "CEL", "lançamento".

Proposta de termos de produto (PT-BR):

| Conceito | No painel |
|---|---|
| A moeda | **Pontos** (ou o nome do programa do cliente) |
| Quem participa | **Cliente / Membro** |
| O guarda-chuva | **Campanha** |
| A mecânica | **Regra de pontuação** |
| A troca | **Recompensas / Resgate** |

Lição do CRMBonus: nomear **pelo benefício**, não pela mecânica ("seus pontos vão expirar" em vez de "expiração"; "Last Chance" em vez de "regra de vencimento").

---

## 8. A jornada que o produto precisa suportar

O gerente vive um **ciclo que se repete** — e passa mais tempo nas voltas (operação e campanhas) do que no setup inicial. Cada fase pede uma feature:

| Fase | Feature que sustenta |
|---|---|
| Estratégia / economia | (oportunidade) simulação de custo do programa |
| Setup inicial | Construtor de regra + templates |
| Lançamento | Publicar + segmentar + preview |
| Operação diária | Ficha do membro + ajuste manual + moderação de pendentes |
| Campanhas / iteração | Duplicar/editar campanha + versionamento |
| Resgate | Catálogo + fluxo de resgate |
| Análise | Relatórios / dashboards |
| Expiração / passivo | Política de expiração + notificação "Last Chance" |

**Implicação de design:** o admin tem que ser leve no que se **repete** (operação, iteração), não só no que se faz uma vez (setup).

---

## 9. Os momentos que fazem ou quebram o produto

Onde o design precisa ganhar:

1. **O primeiro setup** — a tela em branco. Onde a pessoa decide se confia na ferramenta. → templates.
2. **A velocidade de subir uma campanha** — a promessa de autonomia. → publicar sozinho, sem chamado.
3. **Provar resultado** — o que sustenta a renovação do contrato. → relatórios.

Arco emocional do usuário: ansiedade (setup) → urgência (lançar a tempo) → frustração (resolver caso de cliente, esperar relatório) → validação (provar ROI).

---

## 10. O que ainda precisa ser fechado antes de desenhar

- **Métricas de sucesso** — a North Star + árvore de input (tempo para subir campanha, % de regras feitas sem chamado). Sem isso, não há alvo de design.
- **Validação primária** — ouvir um gerente real e a engenharia. Todo o discovery até aqui foi pesquisa secundária (benchmark).
- **Decisões técnicas** — origem do dado do membro (seção 4) e escopo do resgate (seção 5).
- **Premissa de modelo** — autosserviço puro vs. "ferramenta + especialista".

---

## 11. Sequência sugerida de construção

Respeitando as dependências:

1. **Cadastro de cliente (membro)** — pré-requisito de tudo.
2. **Construtor de regra + templates + preview** — o coração e a maior dor.
3. **Saldo / extrato / ajuste manual** — barato (já existe no motor), alto valor na operação.
4. **Fluxo de resgate** — fecha o ciclo do programa; greenfield, dimensionar com eng.
5. **Níveis / segmentos** — depois que o membro existe.
6. **Relatórios** — para provar valor.
7. **Em paralelo:** vocabulário, notificações, e ratificar a fronteira (módulo de afiliados entra quando o escopo permitir).

---

## Resumo de uma linha

Construir o produto do Motor de Pontos é, no fundo, **desenhar a jornada do gerente** sobre um motor que já calcula pontos: dar uma **tela de regra** (formulário + templates + preview) ao que já existe, e **construir de verdade** as três peças que faltam — **cadastro de cliente, resgate e níveis** — sem deixar o vocabulário técnico vazar e sem assumir autosserviço puro antes de validar.