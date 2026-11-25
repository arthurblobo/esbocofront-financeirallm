# Revisão – Fatia 3

## Resumo
Pronto para seguir? **Não**, por 1 bloqueante: a variação dos cards não se refere ao valor exibido (o saldo acumulado subiu e aparece "-37,4%" em vermelho).
Cards, gráfico de linha, donut compartilhado e seletor de período estão implementados; todos os totais conferem com a soma das transações importadas; `npm ci`, build e lint passam.
Corrigir bloqueante e importantes antes da Fatia 4; as Sugestões também devem ser aplicadas, conforme o AGENTS.md. Revisado só o diff contra `origin/feat/fatia-2`.

## Itens

- [BLOQUEANTE] src/pages/dashboard-page.tsx:54 – os cards mostram totais de todo o histórico, mas a variação compara o movimento de novembro com o de outubro. Com os dois meses importados, o Saldo acumulado é R$ 36.692,87 (era R$ 34.779,30 no fim de outubro, +5,5%) e o card mostra "-37,4% em relação ao mês passado", em vermelho – correção esperada: comparar o total exibido com o total até o fim do mês anterior: `getVariation(totals[field], totals[field] - current[field], true)`; sem dados do mês atual ou sem nenhum mês antes dele, `null`. Aplicar nos 4 cards e mover a conta para src/lib/dashboard.ts, que passa a devolver `variations`.

- [IMPORTANTE] src/pages/dashboard-page.tsx:60 – os dois cards têm alturas diferentes (507px e 769px em 1440px), com cerca de 260px vazios sob o gráfico de linha; na referência têm a mesma altura – correção esperada: remover `items-start`; card da linha em `flex flex-col`; no LineChart, raiz `flex flex-1 flex-col` e área do gráfico `relative min-h-64 flex-1 sm:min-h-80`, com um `div` `absolute inset-0` envolvendo o `ResponsiveContainer`. No DonutChart, pôr valor e % na mesma linha da legenda quando houver uma coluna, para reduzir a altura.

- [IMPORTANTE] src/pages/dashboard-page.tsx:46 – em 1024px, com 4 colunas, o valor quebra no meio do número ("R$ 126.908,0" / "0") – correção esperada: trocar `lg:grid-cols-4` por `xl:grid-cols-4`, mantendo 2 colunas abaixo de 1280px.

- [IMPORTANTE] src/pages/dashboard-page.tsx:98-101 – o seletor fica no card da linha e nada indica que ele também controla o donut; em 360px os dois nem aparecem juntos – correção esperada: subtítulo nos dois cards (a referência tem subtítulo no da linha) com o intervalo, por `t('dashboard.period.range', { start, end })` ("{{start}} a {{end}}"), usando `formatDate` com mês curto e ano, nos 3 idiomas.

- [IMPORTANTE] src/components/shared/line-chart.tsx:44-49 – no tooltip: (a) o título usa o rótulo curto do eixo; em inglês "Sep 26" parece dia 26; (b) mês sem importação não mostra nada; (c) a ordem é alfabética, então em en e es sai Saídas antes de Entradas – correção esperada: componente de tooltip próprio, com `point.label` ("setembro de 2026"), séries na ordem de `series` e `labels.missing` quando todas forem nulas.

- [IMPORTANTE] src/components/shared/donut-chart.tsx:25-34 – mesmo problema do item 2 da revisão 2 (bloqueante lá): no dashboard, o Tab também para no `g.recharts-pie`, dentro de `aria-hidden`. O LineChart não tem esse problema – correção esperada: a da revisão 2.

- [IMPORTANTE] src/pages/dashboard-page.tsx:66-75 – mesmo problema do item 11 da revisão 2: classe de `<select>` repetida – correção esperada: usar src/components/ui/select.tsx.

- [SUGESTÃO] src/components/shared/line-chart.tsx:42 e src/pages/dashboard-page.tsx:39 – com 12 meses ou mais, os rótulos do eixo saltam de forma irregular ("jun.", "ago.", "nov."), e em inglês "Nov 26" é ambíguo – correção esperada: `interval="equidistantPreserveStart"` e `year: 'numeric'` no rótulo curto.

- [SUGESTÃO] src/components/shared/line-chart.tsx:30-71 – deixar lacuna nos meses sem importação está certo (zero seria falso), mas o gráfico não explica o vazio; com 3 meses e out/nov pendentes sobra um ponto – correção esperada: abaixo do gráfico, `t('dashboard.trend.missingCount', { count })` ("2 meses sem extrato importado", com plural) e link para Importar extrato.

- [SUGESTÃO] src/lib/dashboard.ts:30 e 50 – com período maior que os dados, o gráfico ganha meses vazios no início: 2 meses de dados e período 12 dão 10 meses vazios (os mocks atuais não chegam a isso) – correção esperada: começar em `max(início do período, primeiro mês com dados)`.

- [SUGESTÃO] src/pages/dashboard-page.tsx:53-55 – (a) o valor de Total de saídas é vermelho, mas no Início é neutro; (b) mais transações aparece em verde e menos em vermelho, embora a quantidade não seja boa nem ruim – correção esperada: (a) valor neutro, mantendo a inversão só na variação; (b) `variationTone: 'neutral'` no MetricCard, usado em Nº de transações.

- [SUGESTÃO] src/components/shared/line-chart.tsx:58 – os pontos da linha tracejada herdam o tracejado na borda e ficam irregulares – correção esperada: `strokeDasharray: 'none'` em `dot` e `activeDot`.

- [SUGESTÃO] src/app.tsx:14 – mesmo problema do item 18 da revisão 2 (chunk lazy sem ErrorBoundary), agora também no dashboard – correção esperada: a da revisão 2.

## Fora do escopo notado (não corrigir agora)
- Integração: esta branch já traz a container query no DonutChart (item 1 da revisão 2) e src/lib/expense-segments.ts, que resolve o item 3 no lugar de category-totals.ts. A feat/fatia-2 entra primeiro, com a revisão 2 aplicada: ao trazê-la para cá, manter o DonutChart e o category-totals.ts dela, remover expense-segments.ts e ajustar os imports do dashboard e da importação. O merge com `origin/feat/fatia-2` em 5112779 não conflita; com a revisão 2 aplicada, é provável que conflite nesses arquivos, nos locales e em format.ts.
- Rótulos do donut: a referência mostra rótulos em volta do anel; a legenda com nome, valor e % atende à descrição do escopo.
- O mês atual, parcial, entra no gráfico como os demais.
- O período escolhido não sincroniza entre abas já abertas; é preferência local e vale após recarregar.
- A referência é cortada no 4º card e no donut; a comparação usou a descrição do escopo nesses pontos.
- Conferido sem problemas, executando os módulos e no Chrome via Playwright: totais dos 4 cards com 16 e 18 meses; donut igual à soma das saídas em 3, 6, 12 e tudo (18 meses); "últimos N" inclui o mês atual; virada de ano em 01/01 e 10/01; dia 31; sem dados; período inválido no storage volta a 6; período mantido após F5; storage bloqueado; importar e atribuir categoria atualizam o dashboard em outra aba sem F5; seletor por teclado; tabela alternativa ao gráfico; textos, eixos e tooltip traduzidos em en e es; linhas com contraste de 6,47 ou mais nos dois temas e tracejado além da cor; donut abaixo da linha em 1023px e ao lado em 1024px; 360, 768, 1023, 1024, 1280 e 1440px sem rolagem horizontal nos dois temas; rótulos do eixo sem sobreposição; mesmas chaves nos 3 idiomas; sem hex solto; um único DonutChart e um único LineChart; MetricCard reaproveitado.
