# Escopo – Front do Financeiro (protótipo)

## Produto
Sistema que importa os extratos bancários do usuário, categoriza as transações e mostra para onde o dinheiro vai, com um assistente de IA para perguntas sobre os dados.
ESTE REPOSITÓRIO É SÓ O FRONT, UM PROTÓTIPO NAVEGÁVEL PARA TESTES COM CONHECIDOS. Não há backend: login, upload, categorização e IA são simulados com dados fixos (mocks) e persistidos em localStorage.

## Referência visual
Dashboard escuro e minimalista (imagem em docs/referencia-dashboard.png):
- fundo quase preto, cards com borda sutil e cantos levemente arredondados;
- cards de métrica no topo: título, ícone à direita, valor grande e variação percentual (verde se positivo, vermelho se negativo) com o texto "em relação ao mês passado";
- gráfico de linha à esquerda (cor de destaque violeta) com seletor de período;
- gráfico de rosca (donut) à direita, com borda grossa, centro vazio e rótulos por categoria.
Tema escuro é o padrão; o tema claro deve ter a mesma estrutura.

## Layout global (pós-login)
Sidebar fixa à esquerda com: logo; Início; Importar extrato; Dashboard geral; Assistente (fatia 5); e, fixado no rodapé da sidebar, Configurações. Item ativo destacado. Em telas < 768px a sidebar vira um menu recolhível.

## Fatias

### Fatia 0 – Fundação
- Setup do projeto, Tailwind, shadcn/ui, rotas, layout com sidebar (páginas vazias com título).
- Tema claro/escuro (padrão escuro, persistido).
- i18n com pt-BR (padrão), en e es; todos os textos via chaves de tradução desde já.
- Camada de mocks em src/mocks: 8 categorias com cor (Alimentação, Moradia, Transporte, Saúde, Lazer, Assinaturas, Educação, Não identificado), ~18 meses de transações fictícias (entradas e saídas) e algumas transações "Não identificado".
- Helpers de formatação: moeda sempre em BRL, mas no formato do idioma ativo (Intl).
- vercel.json com rewrite de SPA para o React Router funcionar no deploy.

### Fatia 1 – Login e Início
Login:
- Tela com nome, e-mail e senha. Qualquer valor válido entra (validação só de formato). Botão "Entrar" com loading curto simulado.
- Salvar em localStorage: nome, e-mail, loginCount, lastLoginAt.
- Logout em Configurações volta ao login sem apagar o histórico (loginCount continua).
Início:
- Saudação com o nome. Se loginCount === 1, sortear de uma lista de mensagens de primeiro acesso ("Que bom ter você aqui, {nome}!"...). Se > 1, sortear de uma lista de retorno ("Bem-vindo de volta, {nome}!"...). Mínimo de 5 mensagens por lista em cada idioma.
- A mensagem muda a cada novo login OU quando a página é reaberta depois de GREETING_TTL_MINUTES (constante, padrão 30) desde a última troca. Nunca repetir a mesma mensagem duas vezes seguidas.
- Cards do mês atual: Entradas, Saídas, Saldo (verde se positivo, vermelho se negativo) e, em cada um, a variação % em relação ao mês anterior. Texto de resumo do tipo "Você gastou 12% menos que em outubro".
- Lista curta das 5 maiores despesas do mês.

### Fatia 2 – Importar extrato
- Filtro de ano (do primeiro ano com dados até o atual; anos futuros não aparecem).
- Grade com os 12 meses do ano selecionado, cada um com um estado: "Importado", "Pendente" ou "Indisponível". Meses futuros (depois do mês atual, usando a data real do sistema) ficam desabilitados, com tooltip explicando o motivo. O mês atual é permitido.
- Ao clicar num mês pendente: área de upload (arrastar ou selecionar; aceita .csv, .ofx e .pdf). O "processamento" é simulado (2–3 s com feedback) e depois o mês passa a "Importado", usando dados do mock.
- Mês importado selecionado mostra:
  - donut (centro vazio, borda grossa) com gastos por categoria e, no centro, o total gasto no mês;
  - legenda com valor e %;
  - lista de transações do mês.
- Gestão de categorias (painel ou modal na mesma página): renomear categoria, alterar cor (paleta pré-definida de ~12 cores acessíveis) e criar categoria nova.
- Transações "Não identificado" ficam destacadas, com ação para atribuir a uma categoria. O gráfico atualiza na hora.
- Todas as alterações persistem em localStorage.

### Fatia 3 – Dashboard geral (visão de todo o histórico)
- Cards: Total de entradas, Total de saídas, Saldo acumulado, Nº de transações.
- Esquerda: gráfico de linha de entradas x saídas ao longo do tempo, com seletor de período (últimos 3, 6 ou 12 meses, ou tudo).
- Direita: donut de gastos por categoria no período selecionado, com o mesmo componente da Fatia 2.
- Layout fiel à referência visual.

### Fatia 4 – Configurações
- Perfil: nome, telefone e foto (avatar com iniciais) editáveis. E-mail, CPF e data de nascimento ficam bloqueados após o cadastro, com ícone de cadeado e texto explicando que isso protege contra golpes e que a alteração exige contato com o suporte.
- Idioma: pt-BR, en, es (troca imediata, persistida).
- Tema: claro, escuro (troca imediata, persistida).
- Botão Sair.

### Fatia 5 – Assistente (opcional)
Chat simulado: 4–6 perguntas sugeridas ("Com o que mais gastei este ano?") com respostas pré-calculadas a partir dos mocks, mais um efeito de digitação. Perguntas livres recebem uma resposta padrão dizendo que a IA real virá numa próxima versão.

### Fatia 6 – Ajustes de UX
- Início mostra o último mês importado enquanto o mês atual estiver pendente, com título “Resumo de {mês}”. O estado vazio aparece apenas sem importações.
- A data abaixo da saudação mostra dia, mês e ano no formato local.
- O componente Alert é reutilizável, tem variantes warning e info, ícone, texto e ação por link. Os tokens de aviso têm contraste AA nos dois temas.
- Alertas no Início permitem abrir o mês atual ou anterior já selecionado em Importar extrato.
- No Dashboard, cards e gráficos seguem o período selecionado. A variação compara com a janela anterior de mesma duração quando todos os meses das duas janelas têm extrato importado. Em Tudo, a variação fica oculta.
- O alerta do Dashboard nomeia os meses sem extrato e o link abre o mais recente deles.
- Os cards do Dashboard usam grade 2 × 2 no celular.
- A grade de importação diferencia Importado, Sem extrato importado, Indisponível e Sem dados. Cada estado tem estilo próprio, e meses futuros ou sem dados têm tooltip.
- O cabeçalho permanece fixo no topo, inclusive com o menu móvel aberto.
- Os cursores são definidos na base. Elementos clicáveis usam `cursor-pointer` e desabilitados usam `cursor-not-allowed`.
- No desktop, a sidebar recolhe para ícones com tooltip e `aria-label`. A preferência é persistida, a largura tem transição suave e o conteúdo acompanha a largura.
- Ao mudar de página, o conteúdo entra com fade e deslocamento de 8 px em cerca de 250 ms. Os cards entram em cascata.
- A troca de tema anima o ícone e as cores de fundo, texto e bordas. Hover e foco em botões, itens da sidebar e meses têm transição de cor.
- Os gráficos usam a animação de entrada do Recharts.
- As animações respeitam `prefers-reduced-motion` e evitam flash, salto de layout e atraso de foco.
- Os textos novos têm tradução em pt-BR, en e es.
- A fatia usa CSS e Tailwind com as dependências existentes.

## Fora do escopo
Backend, autenticação real, parsing real de extratos, IA real, multiusuário real.
