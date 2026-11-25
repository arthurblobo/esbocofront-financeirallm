# AGENTS.md

Leia docs/ESCOPO.md antes de qualquer tarefa. Implemente SOMENTE a fatia pedida.

## Stack
React + Vite + TypeScript (strict), Tailwind, shadcn/ui, Recharts, React Router, react-i18next, lucide-react. Não adicione outras dependências sem justificar no resumo final.

## Convenções
- Estrutura: src/pages, src/components (ui/ = shadcn; shared/ = componentes reutilizáveis do app), src/mocks, src/lib (formatação, storage, datas), src/i18n/locales/{pt-BR,en,es}.json.
- Nenhum texto visível hardcoded: tudo via t('chave'), com as 3 traduções.
- Cores só por tokens/variáveis CSS do tema; nada de hex solto em componentes (exceção: paleta de categorias, definida em um único arquivo).
- Moeda e datas só pelos helpers de src/lib/format.ts.
- Acesso a localStorage só por src/lib/storage.ts (com try/catch).
- Componentes de gráfico reutilizáveis (um único DonutChart e um único LineChart).
- Acessibilidade: botões e ícones com aria-label, foco visível, contraste AA nos dois temas.
- Responsivo a partir de 360px.

## Fluxo de trabalho
- Uma branch por fatia: feat/fatia-N.
- Antes de concluir: npm run build e npm run lint sem erros.
- Se existir review/fatia-N.md, aplique TODOS os itens antes de começar a fatia seguinte.
- Termine com um resumo: o que foi feito, decisões tomadas e o que ficou pendente.