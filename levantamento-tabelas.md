# Levantamento de Tabelas — Migração para @kruzer/ds

> Estado capturado em: 18/06/2026  
> Referência de migração: `src/pages/MembrosV2.tsx`  
> Padrão alvo: `@kruzer/ds@2.0.0-alpha.6`

---

## Resumo executivo

| | |
|---|---|
| Páginas analisadas | 40 |
| Páginas com tabela | 16 |
| Já migradas | 1 (MembrosV2) |
| Pendentes | 15 |
| Padrão atual | Raw HTML `<table>` + Tailwind inline |
| Padrão alvo | `Table` + `TableToolbar` + `TablePagination` + `EmptyState` do DS |

---

## Referência: MembrosV2 (já migrada)

`src/pages/MembrosV2.tsx` → rota `/membros-v2`

Componentes DS utilizados:
- `PageHeader` — título + descrição + ação primária
- `SearchInput` dentro de toolbar flat (div `flex gap-3`)
- `Select` + container `div` com largura fixa para filtros
- `Table / TableHeader / TableBody / TableRow / TableHead / TableCell`
- `SortableTableHead` — colunas ordenáveis
- `EmptyState` — early return fora do `<Table>`, diferencia vazio real vs filtrado
- `Pill` — tags de tier (categoria/rank)
- `StatusBadge` — ativo/inativo
- `TablePagination` com `[border-top-color:hsl(var(--border))]` para corrigir token interno do DS
- `Avatar / AvatarFallback`
- `Button variant="ghost" size="icon"` — ação de linha

Padrão de toolbar (sem `TableToolbar` wrapper):
```tsx
<div className="flex items-center gap-3 px-4 py-3 border-b border-border">
  <SearchInput ... />
  <div className="w-44 shrink-0"><Select>...</Select></div>
  <div className="w-48 shrink-0"><Select>...</Select></div>
</div>
```

---

## Inventário de páginas pendentes

### Complexidade Baixa

#### Dashboard.tsx — `/`
| | |
|---|---|
| Tabela | Resgates recentes |
| Colunas | Pedido (ID), Membro, Status, Valor |
| Busca | Não |
| Filtro | Não |
| Paginação | Não |
| Ordenação | Não |
| Empty state | Não |
| Ações por linha | Não |
| DS parcial | Card, KpiCard, ChartContainer |
| Observação | Tabela mínima, decorativa; baixo esforço |

---

#### Ranking.tsx — `/ranking`
| | |
|---|---|
| Tabela | Ranking de membros |
| Colunas | # (posição), Membro (avatar + nome), Tier, Segmento, Pontos, Variação |
| Busca | Não |
| Filtro | Não |
| Paginação | Não |
| Ordenação | Não |
| Empty state | Não |
| Ações por linha | Não |
| DS parcial | Card, Avatar |
| Observação | Coluna de variação tem cor condicional (positivo/negativo); usar `text-success`/`text-destructive` |

---

#### CatalogoGrupos.tsx — `/catalogo/grupos`
| | |
|---|---|
| Tabela | Lista de grupos do catálogo |
| Colunas | Grupo (nome + ID), Descrição, Produtos (badge), Status, Ações (editar + deletar) |
| Busca | Não |
| Filtro | Não |
| Paginação | Não |
| Ordenação | Não |
| Empty state | Não |
| Ações por linha | Sim (editar + deletar) |
| DS parcial | Card, Button, Badge |
| Observação | Status é botão clicável que alterna; usar `StatusBadge` |

---

#### Membros.tsx — `/membros`
| | |
|---|---|
| Tabela | Lista de membros (v1) |
| Colunas | Membro (avatar + nome), Saldo, Tier (badge manual), Segmento, Entrou em |
| Busca | Sim (por nome ou segmento) |
| Filtro | Não |
| Paginação | Não |
| Ordenação | Não |
| Empty state | Sim (básico) |
| Ações por linha | Não |
| DS parcial | Card, Input, Avatar |
| Observação | MembrosV2 já é a versão migrada; manter ambas até cutover |

---

#### Afiliados.tsx — `/afiliados`
| | |
|---|---|
| Tabela | Lista de afiliados |
| Colunas | Afiliado (avatar + nome + email), Coordenador, Código GAN, Status, Desde, Ações |
| Busca | Sim (por nome ou código GAN) |
| Filtro | Não |
| Paginação | Não |
| Ordenação | Não |
| Empty state | Não |
| Ações por linha | Sim (editar inline) |
| DS parcial | Card, Input, Button, Badge, Avatar, Select |
| Observação | Edição inline na própria linha; avaliar uso de `FormDrawer` no lugar |

---

### Complexidade Baixa-média

#### Logs.tsx — `/logs`
| | |
|---|---|
| Tabela | Log de auditoria |
| Colunas | ID, Data/Hora, Operador, Ação, Entidade (tipo + ID), Detalhe, Resultado |
| Busca | Sim (ID, operador, entityId) |
| Filtro | Sim (Select de ação) |
| Paginação | Não |
| Ordenação | Não |
| Empty state | Não |
| Ações por linha | Não |
| DS parcial | Card, Input, Badge, Select |
| Observação | Adicionar paginação; tabela pode ter muitos registros em produção |

---

#### Conformidade.tsx — `/conformidade`
| | |
|---|---|
| Tabelas | 2: Log de aceite + Status por perfil |
| Colunas T1 | Usuário, Perfil, Data/Hora, Versão |
| Colunas T2 | Perfil, Total usuários, Aceitaram, Pendentes, Cobertura (barra de progresso) |
| Busca | Não |
| Filtro | Não |
| Paginação | Não |
| Ordenação | Não |
| Empty state | Sim (T1 tem colSpan vazio) |
| DS parcial | Card, Badge, Tabs |
| Observação | T2 tem barra de progresso; usar `ProgressBarLabeled`; ambas dentro de `Tabs` |

---

#### MinhaConta.tsx — `/minha-conta`
| | |
|---|---|
| Tabelas | 2: Informes de rendimento + Meus resgates |
| Colunas T1 | Período, Total resgatado, Valor (R$), Tipo doc, Situação, Ações (download PDF) |
| Colunas T2 | Pedido, Recompensa, Status, Pontos, Data, Ações (detalhe) |
| Busca | Não |
| Filtro | Não |
| Paginação | Não |
| Ordenação | Não |
| Empty state | Não |
| DS parcial | Card, Badge, Button, Tabs, Avatar |
| Observação | Tabelas estáticas dentro de Tabs; adicionar empty states |

---

### Complexidade Média

#### Recompensas.tsx — `/recompensas`
| | |
|---|---|
| Tabela | Fila de resgates |
| Colunas | Pedido (ID), Membro (avatar), Recompensa, Status, Pontos, Solicitado, Ações |
| Busca | Não (filtrável via pipeline de status acima da tabela) |
| Filtro | Sim (clique em status do pipeline) |
| Paginação | Não |
| Ordenação | Não |
| Empty state | Não |
| Ações por linha | Sim (botões de transição de estado — condicionais por status) |
| DS parcial | Card, Button, Badge, Avatar |
| Observação | Ações por linha dependem do status atual; usar `ConfirmDialog` para ações destrutivas |

---

#### IndicacaoVenda.tsx — `/indicacoes`
| | |
|---|---|
| Tabela | Lista de indicações de venda |
| Colunas | ID, Membro (avatar), Responsável, Produto, Data, Validade, Status, Observação, Ações |
| Busca | Sim (por membro, responsável, ID) |
| Filtro | Não |
| Paginação | Não |
| Ordenação | Não |
| Empty state | Não |
| Ações por linha | Sim (botão Converter) |
| DS parcial | Card, Input, Button, Badge, Avatar, Select |
| Observação | Adicionar empty state; coluna Observação pode ter texto longo |

---

#### Comunicados.tsx — `/comunicados`
| | |
|---|---|
| Tabela | Log de comunicados enviados |
| Colunas | ID, Data/Hora, Operador, Ação, Entidade, Detalhe, Resultado + linha expansível |
| Busca | Sim (por assunto, evento, ID) |
| Filtro | Não |
| Paginação | Não |
| Ordenação | Não |
| Empty state | Sim (quando filtrado) |
| Ações por linha | Sim (expandir prévia) |
| DS parcial | Card, Button, Badge, Input |
| Observação | Linha expansível mostra preview do conteúdo; usar `CollapsibleListItem` ou linha com `<details>` |

---

#### Catalogo.tsx — `/catalogo`
| | |
|---|---|
| Tabela | Produtos por categoria (múltiplas tabelas colapsáveis) |
| Colunas | Produto, ID, Pontos, Estoque, Status, Link |
| Busca | Sim (por nome de produto) |
| Filtro | Não |
| Paginação | Não |
| Ordenação | Não |
| Empty state | Sim (grupos somem ao filtrar) |
| Ações por linha | Sim (link para detalhe) |
| DS parcial | Card, Input, Badge, Button |
| Observação | Tabelas dentro de acordeons por categoria; uma tabela por grupo; usar `Collapsible` do DS |

---

#### CatalogoAtualizacao.tsx — `/catalogo/atualizacao`
| | |
|---|---|
| Tabelas | 2 interdependentes: Feeds + Diff de alterações |
| Colunas T1 | Feed, Origem, Produtos, Última sync, Status, Alterações, Ações |
| Colunas T2 | ID, Produto, Categoria, Pontos, Ação (add/remove/update) |
| Busca | Não |
| Filtro | Não (seleção por clique em linha da T1 exibe T2) |
| Paginação | Não |
| Ordenação | Não |
| Empty state | Não |
| Ações por linha | Sim (T1: sincronizar; T2: condicional por tipo de alteração) |
| DS parcial | Card, Badge, Button |
| Observação | T2 aparece condicionalmente ao selecionar linha da T1; cores por tipo de ação |

---

#### ResgateDocumental.tsx — `/recompensas/documental`
| | |
|---|---|
| Tabelas | 2 idênticas em Tabs (PF-RPA e PJ-NF) |
| Colunas | Pedido, Membro (avatar), Pontos, Valor, Documento (ref + upload), Status, Solicitado, Ações |
| Busca | Não |
| Filtro | Não |
| Paginação | Não |
| Ordenação | Não |
| Empty state | Não |
| Ações por linha | Sim (Avançar — condicional por status de documento) |
| DS parcial | Card, Button, Tabs, Avatar |
| Observação | Célula de documento tem botão de upload inline; usar `FileUploadInput` do DS |

---

### Complexidade Média-alta

#### Usuarios.tsx — `/usuarios`
| | |
|---|---|
| Tabelas | 2: Usuários + Matriz de permissões RBAC |
| Colunas T1 | Usuário (avatar + nome + email), Perfil, Status, Último acesso, Ações |
| Colunas T2 | Permissão (sticky left) × 4 perfis, cada célula com Switch |
| Busca | Sim (por nome ou e-mail, T1 apenas) |
| Filtro | Não |
| Paginação | Não |
| Ordenação | Não |
| Empty state | Não |
| Ações por linha | Sim (T1: editar) |
| DS parcial | Card, Input, Button, Badge, Tabs, Switch, Avatar |
| Observação | T2 é matriz com scroll horizontal; coluna esquerda sticky; cada célula tem `Switch` |

---

### Complexidade Alta

#### Pedidos.tsx — `/pedidos`
| | |
|---|---|
| Tabela | Lista de pedidos/resgates |
| Colunas (configuráveis) | ID, Membro, Tier, Segmento, Recompensa, Categoria, Canal, Código GAN, Coordenador, Doc. Fiscal, Pontos, Valor, Status, Data, Processado em |
| Busca | Sim (por pedido, membro, GAN) |
| Filtro | Não |
| Paginação | Não |
| Ordenação | Não |
| Empty state | Não |
| Ações por linha | Não |
| DS parcial | Card, Input, Button, Badge, Avatar |
| Observação | Picker de colunas visíveis (dropdown com checkboxes); usar `DataTableColumnsToggle` do DS |

---

## Ordem sugerida de migração

### Fase 1 — Baixa complexidade (warmup)
1. `Dashboard.tsx` — tabela decorativa, sem interatividade
2. `Ranking.tsx` — tabela estática, apenas cores condicionais
3. `CatalogoGrupos.tsx` — tabela simples com ações de linha
4. `Membros.tsx` — MembrosV2 já é a referência; alinhamento cosmético

### Fase 2 — Baixa-média (padrão estabelecido)
5. `MinhaConta.tsx` — 2 tabelas estáticas em Tabs
6. `Conformidade.tsx` — 2 tabelas + ProgressBarLabeled
7. `Logs.tsx` — múltiplos filtros, candidata a paginação

### Fase 3 — Média (features completas)
8. `Afiliados.tsx` — edição inline → FormDrawer
9. `IndicacaoVenda.tsx` — ações condicionais por linha
10. `Recompensas.tsx` — máquina de estados nas ações
11. `ResgateDocumental.tsx` — upload de documento inline
12. `CatalogoAtualizacao.tsx` — tabelas interdependentes
13. `Comunicados.tsx` — linhas expansíveis
14. `Catalogo.tsx` — múltiplas tabelas em acordeon

### Fase 4 — Alta complexidade (casos especiais)
15. `Usuarios.tsx` — matriz RBAC com sticky column
16. `Pedidos.tsx` — colunas dinâmicas com `DataTableColumnsToggle`

---

## Notas técnicas

### Correções necessárias no setup do projeto
- `@theme inline` em `src/index.css` mapeando tokens shadcn → Tailwind v4 (já aplicado)
- `TablePagination` precisa de `className="[border-top-color:hsl(var(--border))]"` para corrigir token interno do DS (já aplicado em MembrosV2)
- `SelectTrigger` ignora `w-*` passado via `className`; envolver `Select` em `<div className="w-XX shrink-0">` (já aplicado em MembrosV2)

### Padrões repetidos
- **Busca local**: todos usam `useState("") + .filter()` — manter o mesmo padrão
- **Avatar**: `Avatar > AvatarFallback` com iniciais — padrão consistente, manter
- **Badges de status**: substituir `<span className="...">` por `StatusBadge` (ativo/inativo) ou `Pill` (categoria/tag)
- **Ações destrutivas**: wrapping em `ConfirmDialog` com `variant="destructive"`
- **Sem paginação**: nenhuma página tem paginação hoje; MembrosV2 é a referência de como adicionar

### Componentes DS prioritários para aprender
| Componente | Usado em |
|---|---|
| `SortableTableHead` | Qualquer coluna ordenável |
| `TablePagination` | Todas as listas longas |
| `EmptyState` | Toda tabela (vazio real + vazio filtrado) |
| `StatusBadge` | Ativo/inativo em qualquer entidade |
| `Pill` | Tier, categoria, canal, tipo (tags genéricas) |
| `ConfirmDialog` | Ações destrutivas por linha |
| `FormDrawer` | Edição/criação inline que hoje é in-row |
| `DataTableColumnsToggle` | Pedidos (colunas dinâmicas) |
| `CollapsibleListItem` | Comunicados (linhas expansíveis) |
| `ProgressBarLabeled` | Conformidade (cobertura %) |
| `FileUploadInput` | ResgateDocumental (upload inline) |
