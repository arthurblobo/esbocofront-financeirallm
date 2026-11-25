# Revisão – Fatia 2

## Resumo
Pronto para seguir? **Não**, por 2 bloqueantes no DonutChart, que a Fatia 3 vai reutilizar: ele quebra em coluna estreita e coloca foco de teclado dentro de uma área escondida de leitores de tela.
Os critérios da Fatia 2 e as 4 decisões combinadas estão implementados (calendário, upload, persistência e duas abas testados), com ressalvas em Itens; `npm ci`, build e lint passam.
Corrigir bloqueantes e importantes antes da Fatia 3; as Sugestões também devem ser aplicadas, conforme o AGENTS.md.

## Itens

- [BLOQUEANTE] src/components/shared/donut-chart.tsx:25 – as duas colunas dependem da largura da tela (`xl:`), não do espaço do componente. Num card de 330px em tela de 1280px, como a coluna direita da Fatia 3, a legenda fica com 48px, o texto quebra letra a letra (linha de 237px) e os valores saem 14px do card – correção esperada: container query: `@container` no elemento externo do componente e `@xl:grid-cols-[minmax(14rem,1fr)_minmax(0,1fr)]` no grid interno, com uma coluna como padrão. Conferir em cards de 290px, 330px e 950px.

- [BLOQUEANTE] src/components/shared/donut-chart.tsx:27-40 – o `Pie` do Recharts cria um `<g tabindex="0">` dentro do `div aria-hidden="true"`. Confirmado: depois de "Gerenciar categorias", o Tab para nesse `g`, sem nome anunciado – correção esperada: `rootTabIndex={-1}` no `Pie`. Manter figcaption e legenda como alternativa textual e conferir que o Tab vai do painel direto para o próximo controle. Vale também para o LineChart da Fatia 3: nenhum elemento focável dentro de `aria-hidden`.

- [IMPORTANTE] src/pages/import-page.tsx:67-82 – a soma por categoria, com fallback para "Não identificado" e ordenação, está dentro da página; a Fatia 3 precisa da mesma conta – correção esperada: extrair src/lib/category-totals.ts com `getCategoryTotals(transactions, categories, t): DonutSegment[]` (o tipo continua exportado pelo DonutChart) e usar na página.

- [IMPORTANTE] src/lib/data.ts:196-214 – `saveCategory` aceita nomes repetidos. Confirmado: criar "Alimentação" e "  lazer ", e renomear Transporte para "Saúde", gera opções indistinguíveis – correção esperada: comparar com o rótulo exibido das outras categorias, sem espaços nas pontas e sem diferenciar maiúsculas (`toLocaleLowerCase`). `saveCategory` passa a devolver `{ ok: true, id } | { ok: false, reason: 'empty' | 'duplicate' }`, recebendo os rótulos atuais ou `t`. Nova chave `statement.categories.duplicate` ("Já existe uma categoria com esse nome.") nos 3 idiomas. Com erro, focar o campo de nome (hoje o foco fica no botão).

- [IMPORTANTE] src/lib/data.ts:64-66 – um único item inválido descarta todas as categorias salvas e o próximo salvamento apaga as boas (confirmado: "Pets" some quando outra gravação acontece). Já `[]` ou uma lista sem as padrão é aceita: com `[]`, tudo vira "Não identificado" – correção esperada: filtrar item a item; categoria com cor inválida recebe `categoryPalette.slate` em vez de ser descartada; remover ids repetidos; completar com as padrão que faltarem, na ordem original.

- [IMPORTANTE] src/lib/data.ts:155-160 – atribuição para categoria inexistente deixa a linha sem categoria, sem destaque e sem ação, embora o donut a some em "Não identificado" (confirmado com `custom-x`) – correção esperada: em `getTransactionsSnapshot`, aplicar a atribuição só se a categoria existir em `categories.getSnapshot()`; incluir esse snapshot na checagem de cache e `categories.subscribe` em `subscribeTransactions`.

- [IMPORTANTE] src/pages/import-page.tsx:84-93 – ao concluir a importação, o foco vai para "Gastos por categoria" mesmo se a pessoa estiver usando outro campo. Confirmado: digitando "Pets" no nome da categoria, só entrou "Pe" – correção esperada: mover o foco apenas se `document.activeElement` for o `detailsHeading` ou o `body`; o anúncio por `role="status"` continua.

- [IMPORTANTE] src/pages/home-page.tsx:39-40 – com outubro pendente, o Início diz "Não há gastos em outubro para comparar", o que é falso: o extrato não foi importado. É o estado padrão de quem importa só o mês atual – correção esperada: se `getStatementMonthStatus(calendar, calendar.previousMonth)` não for `imported`, usar `home.summary.previousPending` ("Importe o extrato de {{month}} para comparar."), nos 3 idiomas.

- [IMPORTANTE] src/components/shared/transaction-row.tsx:31 – entradas e saídas aparecem iguais na lista do mês ("Salário R$ 6.560,00" e "Uber R$ 60,04") – correção esperada: adicionar `signDisplay` opcional a `formatCents`; na linha, entrada com `+` e `text-positive`, saída com `−` e cor neutra. O sinal garante a distinção sem depender da cor.

- [IMPORTANTE] src/pages/import-page.tsx:146 – no tema claro, "Importado" no mês selecionado (12px, `text-positive` sobre `bg-accent`) tem contraste 4,21, abaixo de 4,5 – correção esperada: quando `active`, usar `text-accent-foreground` no estado (9,09 no claro, 10,63 no escuro).

- [IMPORTANTE] src/pages/import-page.tsx:20 e src/components/shared/category-manager.tsx:90 – classe de `<select>` repetida em vez de um componente; as Fatias 3 (período) e 4 (idioma) repetiriam – correção esperada: src/components/ui/select.tsx com o `<select>` nativo e as mesmas classes de foco e erro do Input; usar nos 3 pontos.

- [SUGESTÃO] src/components/shared/statement-upload.tsx:22-37 – soltar o arquivo fora da área não é bloqueado, e o navegador pode abrir o arquivo no lugar do app – correção esperada: enquanto o componente estiver montado, cancelar `dragover` e `drop` em `window`.

- [SUGESTÃO] src/pages/import-page.tsx:56 e 84-93 – se a pessoa sai da página durante o processamento e volta, a importação conclui sem anúncio – correção esperada: guardar os meses iniciados no store de data.ts, e não em `useRef`.

- [SUGESTÃO] src/pages/import-page.tsx:150-158 – o tooltip aparece em foco, hover e toque, mas Escape não o fecha e `pointer-events-none` impede apontar para ele (WCAG 1.4.13) – correção esperada: fechar com Escape até perder foco ou hover e remover `pointer-events-none` quando visível.

- [SUGESTÃO] src/components/shared/category-manager.tsx:15-16 e 21 – (a) nova categoria já vem com violeta, a cor de Alimentação; (b) voltar ao nome padrão grava `name: "Moradia"` e a categoria deixa de ser traduzida; (c) com o formulário aberto em duas abas, salvar só a cor em uma desfaz o nome salvo na outra (confirmado) – correção esperada: (a) primeira cor livre da paleta; (b) se o nome for igual a `t(labelKey)`, remover `name`; (c) enviar só os campos alterados em relação ao valor inicial do formulário.

- [SUGESTÃO] src/components/shared/category-manager.tsx:105 – "Categoria salva." continua visível durante novas edições e não é anunciada de novo – correção esperada: limpar ao alterar qualquer campo.

- [SUGESTÃO] src/lib/category-palette.ts:13 – índigo e violeta são os dois tons mais próximos da paleta (diferença 14,5 em CIE76) e se confundem no donut – correção esperada: trocar `indigo` por `fuchsia: '#c026d3'` (contraste 3,97 no card escuro e 4,71 no claro; diferença mínima 28,5 para as demais), ajustando `statement.colors` nos 3 idiomas.

- [SUGESTÃO] src/app.tsx:13 e 29-33 – sem ErrorBoundary, uma falha ao baixar o chunk de Importar (rede ou deploy novo) derruba a tela; por leitura, não reproduzido – correção esperada: ErrorBoundary em volta das rotas, com mensagem traduzida e botão de recarregar.

## Fora do escopo notado (não corrigir agora)
- Decisão de produto: um mês pendente vira "Importado" sozinho quando deixa de ser o anterior (outubro, pendente em novembro, fica importado em 01/12). Segue a regra combinada.
- Decisão de produto: depois de atribuída, a categoria não pode ser trocada nem desfeita. O escopo só pede atribuir.
- Decisão de produto: "Não identificado" pode ser renomeada (testado com "Outros").
- A gestão de categorias é um painel (`<details>`), permitido pelo escopo; por isso não há foco preso nem Escape a exigir.
- Conferido sem problemas, no Chrome via Playwright: anos e meses em 25/11, 05/12, 31/12, 01/01, 03/01 e 29/02; futuro e indisponível não selecionam por clique (futuro também por Enter) e têm tooltips próprios; grade percorrida por Tab; arquivos .txt, .xlsx, sem extensão, .csv.exe e dois arquivos recusados com mensagem; upload por seletor e por arrastar (.OFX maiúsculo), concluído em 2,5 s; F5 no meio volta a pendente; atribuição atualiza donut, legenda e persiste; nome vazio; criar, renomear e mudar cor; sincronização entre abas; JSON inválido e tipos errados não quebram a tela; storage bloqueado; atribuição preservada em 30/11, 01/12 e 15/01; Início com estado vazio e link; 360px e 1280px sem rolagem horizontal nos dois temas; nome de 120 caracteres; mesmas chaves nos 3 idiomas; 12 cores com pelo menos 3:1 nos dois temas; console sem erros.
