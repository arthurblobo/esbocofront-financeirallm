# Revisão – Fatia 0

## Resumo
Pronto para seguir? **Não.** Setup, rotas, sidebar, tema, i18n e vercel.json atendem ao escopo; `npm ci`, `npm run build` e `npm run lint` passam.
Há 4 bloqueantes na camada de dados (datas fixas, sem `description`, categorias em união fixa, sem ponto único de acesso), que se repetiriam nas Fatias 1 a 3.
Corrigir os bloqueantes e os importantes antes da Fatia 1; as Sugestões também devem ser aplicadas, conforme o AGENTS.md.

## Itens

- [BLOQUEANTE] src/mocks/transactions.ts:43 – `Date.UTC(2025, 5 + month, day)` fixa a janela em 2025-06 a 2026-11. Hoje (nov/2026) ela coincide com o mês atual, então o defeito não aparece; com o relógio em 2027-03-10, o último mês com dados continua 2026-11 e o mês atual fica vazio – correção esperada:
  - gerar 18 meses relativos à data local do sistema, terminando no mês atual;
  - gerar cada mês por completo e só depois descartar as transações com data posterior a hoje;
  - derivar valores, quantidades e `id` do ano-mês (ex.: `mock-2026-11-03`), nunca da posição na janela, e não usar `Math.random()`. O `id` atual (`mock-${month + 1}-…`, linha 42) passaria a apontar para outra transação a cada virada de mês e corromperia as atribuições de categoria que a Fatia 2 vai persistir.

- [BLOQUEANTE] src/mocks/transactions.ts:7-11 – `Transaction` não tem `description`, necessária na lista das 5 maiores despesas (Fatia 1) e na lista do mês (Fatia 2) – correção esperada: adicionar `description: string` obrigatório, preenchido em todas as transações com nomes realistas por categoria (ex.: Alimentação "Supermercado BH"; Transporte "Uber"; Assinaturas "Netflix"; Não identificado "PIX 48213"; entradas "Salário", "Freelance"). É dado de extrato, não texto de interface: não passa por `t()`. Exportar o tipo `Transaction`, hoje privado do arquivo.

- [BLOQUEANTE] src/mocks/categories.ts:1-12 – `as const` mais `CategoryId` derivado criam uma união fixa; a Fatia 2 não consegue criar nem renomear categorias – correção esperada:
  - `type CategoryId = string`;
  - `type Category = { id: CategoryId; color: string } & ({ labelKey: DefaultCategoryLabelKey; name?: string } | { labelKey?: never; name: string })`, em que `DefaultCategoryLabelKey` é a união das 8 chaves `categories.*` (mantém o `t()` tipado);
  - helper único `getCategoryLabel(category, t)`, que devolve `name` se existir e, senão, `t(labelKey)`. Renomear uma categoria padrão grava `name`;
  - ler as categorias salvas via src/lib/storage.ts (chave `categories`), usando as padrão se a chave não existir ou o JSON for inválido. Só a leitura agora; a edição é da Fatia 2;
  - exportar a constante `UNCATEGORIZED_ID = 'uncategorized'` em vez de repetir a string.

- [BLOQUEANTE] src/lib/data.ts (não existe) – nenhuma página lê os mocks hoje, mas não há ponto único de acesso, e as Fatias 1 a 3 tenderiam a importar `src/mocks` direto – correção esperada:
  - criar src/lib/data.ts com os hooks `useTransactions()` e `useCategories()`, sobre um store com `useSyncExternalStore`, para que uma mudança de categoria atualize todos os gráficos na hora. O snapshot precisa ter referência estável entre renders;
  - em eslint.config.js, regra `no-restricted-imports` com os padrões `@/mocks/*` e `**/mocks/*` para `src/**`, com exceção de src/lib/data.ts e src/mocks/**.

- [IMPORTANTE] src/lib/format.ts:10 – `formatDate` só aceita `Date | number`, mas as transações guardam `YYYY-MM-DD`. O caminho óbvio, `formatDate(new Date('2026-11-01'))`, mostra "31/10/2026" e "outubro de 2026" em America/Sao_Paulo – correção esperada: criar src/lib/dates.ts com `parseLocalDate(iso: string): Date` (usa `new Date(ano, mês - 1, dia)`) e fazer `formatDate` aceitar a string `YYYY-MM-DD`, passando por esse helper.

- [IMPORTANTE] src/lib/format.ts:3 – os mocks guardam `amountInCents`, mas `formatCurrency` espera reais; `formatCurrency(tx.amountInCents)` compila e mostra um valor 100 vezes maior – correção esperada: renomear para `formatCents(amountInCents: number)`, dividir por 100 dentro do helper e não exportar versão em reais.

- [IMPORTANTE] src/i18n/locales/{pt-BR,en,es}.json:3, package.json:29, package-lock.json:2 e 8, src/lib/theme.ts:4 – nome e prefixo ainda com "Financeiro Familiar", fora do escopo atualizado – correção esperada: `app.name` = "Financeiro" nos 3 locales; `"name": "financeiro"` no package.json, com o package-lock.json regenerado por `npm install`; em src/lib/storage.ts, `const STORAGE_PREFIX = 'financeiro:'` aplicado dentro de `readStorage`/`writeStorage`; src/lib/theme.ts passa só a chave `theme`. Não precisa migrar a chave antiga.

- [IMPORTANTE] src/components/ui/button.tsx:7-15 e 24 – `size-11` está na classe base, então todo botão é um quadrado de 44px e não comporta texto ("Entrar", Fatia 1); também falta a variante `primary` – correção esperada: tirar `size-11` da base; criar `size: { default: 'h-11 gap-2 px-4 text-sm font-medium', icon: 'size-11' }` com padrão `default`; criar `primary: 'bg-primary text-primary-foreground hover:bg-primary/90'`; tipar as props com `VariantProps<typeof buttonVariants>`; usar `size="icon"` nos dois botões de src/components/shared/app-layout.tsx:68 e 81.

- [IMPORTANTE] src/index.css:3-41 – faltam `--positive`/`--negative` e os tokens padrão do shadcn, que os próximos componentes vão exigir – correção esperada: adicionar nos dois temas e mapear no `@theme inline`. Os valores abaixo foram calculados e passam em AA:

  | Token | Escuro | Claro |
  |---|---|---|
  | `--positive` | `#4ade80` (10,73 no card) | `#15803d` (5,02 no card; 4,69 no fundo) |
  | `--negative` | `#f87171` (6,76 no card) | `#b91c1c` (6,47 no card; 6,05 no fundo) |
  | `--muted` (com o `--muted-foreground` atual) | `#1c1b21` (7,82) | `#f0eff4` (6,60) |
  | `--secondary` / `--secondary-foreground` | `#1f1e25` / `#f5f4f7` (15,08) | `#f0eff4` / `#18171d` (15,57) |
  | `--destructive` / `--destructive-foreground` | `#f87171` / `#1a0b0b` (6,92) | `#b91c1c` / `#ffffff` (6,47) |
  | `--input` (borda de campo, mínimo 3:1) | `#6f6c7a` (3,65 no card) | `#85808f` (3,83 no card) |
  | `--popover` / `--popover-foreground` | igual a `--card` / `--foreground` | igual a `--card` / `--foreground` |

- [IMPORTANTE] src/mocks/transactions.ts:19-28 e 37-45 – cada mês tem só 8 ou 9 transações, uma por categoria e uma entrada; as saídas ficam entre R$ 3.536,90 e R$ 3.978,70 e as entradas entre R$ 6.500 e R$ 6.750, o que deixa os gráficos planos – correção esperada: 2 a 6 transações por categoria por mês (exceto "Não identificado"), com variação determinística pelo ano-mês; entradas extras em parte dos meses (freelance, 13º, reembolso); pelo menos um mês com saldo negativo; pelo menos 1 "Não identificado" nos 3 meses mais recentes (o mês atual hoje não tem nenhum), datado nos primeiros dias do mês.

- [IMPORTANTE] src/components/shared/app-layout.tsx:46 e src/lib/theme.ts – o tema é estado local do `AppLayout`; quando a Fatia 4 trocar o tema em Configurações, o ícone e o aria-label do cabeçalho ficarão desatualizados – correção esperada: criar o hook `useTheme()` em src/lib/theme.ts, com store único via `useSyncExternalStore`, e usá-lo no `AppLayout`.

- [IMPORTANTE] src/components/shared/app-layout.tsx:68-92, menu em 360px – Escape não fecha o menu; ao navegar por teclado o menu fecha e o foco cai no `body`; com o menu aberto, o voltar do navegador troca a rota e o menu continua aberto – correção esperada: fechar com Escape e devolver o foco ao botão do menu; fechar quando `useLocation().pathname` mudar; após navegar pelo menu, mover o foco para `<main tabIndex={-1}>`, com foco visível.

- [SUGESTÃO] src/i18n/index.ts:31 – `lng` é sempre `pt-BR`, o idioma salvo é ignorado – correção esperada: `lng: readStorage('language') ?? defaultLanguage`, usando o valor só se estiver entre as chaves de `resources`. A gravação fica para a Fatia 4.

- [SUGESTÃO] src/mocks/categories.ts:2-9 – no tema claro, as 8 cores ficam abaixo de 3:1 sobre o card branco (de 1,51 em Educação a 2,72 em Alimentação); no escuro todas passam – correção esperada, com contraste (card escuro / card claro): food `#8b5cf6` (4,42 / 4,23), housing `#3b82f6` (5,08 / 3,68), transport `#0d9488` (4,99 / 3,74), health `#e11d48` (3,98 / 4,70), leisure `#d97706` (5,87 / 3,19), subscriptions `#db2777` (4,07 / 4,60), education `#65a30d` (6,05 / 3,09), uncategorized `#64748b` (3,93 / 4,76).

- [SUGESTÃO] index.html:3-7 e src/main.tsx:9 – com tema claro salvo, a tela aparece escura até o JS carregar (medido com o JS atrasado: fundo `rgb(11, 11, 13)`), e o `<title>` fica vazio nesse intervalo – correção esperada: script inline curto no `<head>`, com try/catch, que lê `financeiro:theme` e define `data-theme`; adicionar `<title>Financeiro</title>`. Esse script é a única exceção à regra de acesso via storage.ts; registrar o motivo em comentário.

- [SUGESTÃO] src/lib/format.ts:4-7 – em espanhol o valor sai "1234,50 BRL" – correção esperada: `currencyDisplay: 'narrowSymbol'` e `useGrouping: 'always'`, que dão "1.234,50 R$". Se o TypeScript recusar `'always'`, incluir `ES2023.Intl` em `lib` no tsconfig.json.

- [SUGESTÃO] index.html – não há favicon e `/favicon.ico` responde 404, o único erro no console – correção esperada: adicionar public/favicon.svg e `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`.

- [SUGESTÃO] src/components/shared/app-layout.tsx:21 – o item em hover fica com a mesma cor e o mesmo fundo do item ativo – correção esperada: hover com `hover:bg-muted hover:text-foreground`; manter `accent` só no ativo.

## Fora do escopo notado (não corrigir agora)
- "Assistente" não está na sidebar: correto, é da Fatia 5.
- A troca de idioma ainda não tem interface (Fatia 4). Chamando `changeLanguage` por código, título, `lang` e textos mudaram nos 3 idiomas.
- docs/referencia-dashboard.png mostra só parte do donut e do 4º card; convém uma imagem completa antes da Fatia 3.
- O rewrite do vercel.json foi conferido por leitura; o F5 em rota interna foi testado no dev e no preview do Vite, não num deploy da Vercel.
- Conferido sem problemas no Chrome via Playwright: as 4 rotas por link, por URL direta e com F5; rota desconhecida volta ao Início; tema escuro padrão e tema trocado persistindo após recarregar; app funcional com localStorage bloqueado; sem rolagem horizontal em 360px; corte em 767/768px; menu abre com Enter e Espaço; foco visível em todos os controles.
