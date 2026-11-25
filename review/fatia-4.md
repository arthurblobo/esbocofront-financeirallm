# Revisão – Fatia 4

## Resumo
Pronto para seguir? **Sim, com ressalvas**: não há bloqueantes; perfil, foto, idioma, tema e Sair estão implementados e `npm ci`, build e lint passam.
Há 5 importantes que quem for testar pode encontrar: foto apagada sem aviso, nascimento sem máscara, nome perdido no novo login, telefone com +55 e fotos .jfif recusadas.
Corrigir os importantes antes do merge na main; as Sugestões também devem ser aplicadas, conforme o AGENTS.md. Revisado o diff contra `origin/main`, que já contém a Fatia 3.

## Itens

- [IMPORTANTE] src/lib/profile.ts:53-62 – quando a troca de foto falha por falta de espaço, a foto antiga some só da memória. Reproduzido: com foto salva e storage cheio, a nova falha e o avatar vira iniciais, mas outra aba ou F5 ainda mostra a antiga; depois de liberar espaço, salvar o telefone grava `photo: null` e apaga a foto antiga sem aviso – correção esperada: em caso de falha, não alterar o snapshot (manter a foto salva) e só devolver `false`. Na tela, mensagem conforme o caso: com foto anterior, `settings.errors.photoStorageKept` ("Não foi possível salvar a nova foto. A foto atual foi mantida."), nos 3 idiomas; sem foto anterior, a atual.

- [IMPORTANTE] src/mocks/profile.ts:3 e src/components/shared/profile-settings.tsx:95-99 – o nascimento aparece completo ("12/03/1998"); a decisão era CPF e nascimento mascarados. Os dois valores são iguais para todos e nada diz que são fictícios, o que pode assustar quem testa – correção esperada: mostrar `**/**/1998` (guardar só `maskedBirthDate` no mock, sem passar por `formatDate`); acrescentar ao bloco `t('settings.locked.demo')` ("CPF e data de nascimento são fictícios, apenas para demonstração."), nos 3 idiomas; em cada valor mascarado, texto `sr-only` `t('settings.locked.masked')` ("parcialmente oculto").

- [IMPORTANTE] src/lib/session.ts:66-77 e 79-89 – o nome editado se perde no novo login. Reproduzido: editar para "Maria Nova", sair e entrar com o mesmo e-mail digitando "Ana" volta a "Ana"; telefone e foto são preservados – correção esperada: guardar `name` no perfil do e-mail (src/lib/profile.ts) ao editar em Configurações; em `login`, usar esse nome se existir e, senão, o digitado. Sessão e perfil devem ser gravados na mesma ação; se um falhar, mostrar o erro do campo nome.

- [IMPORTANTE] src/lib/phone.ts:1-15 e src/components/shared/profile-settings.tsx:49 – colar "+55 31 99999-8888" vira "(55) 31999-998888" com erro; não há limite de dígitos; "(00) 00000-0000" e "(31) 11111-2222" são aceitos – correção esperada: em `phoneDigits`, remover o 55 inicial quando sobrarem 12 ou 13 dígitos e limitar a 11; validar com `/^[1-9]{2}(?:9\d{8}|[2-5]\d{7})$/` (celular com 9 dígitos começando em 9; fixo com 8 dígitos começando de 2 a 5), na tela e em `parseProfile`.

- [IMPORTANTE] src/lib/avatar-image.ts:13-18 – o formato é exigido pela extensão e pelo conteúdo. Um .jfif (JPEG salvo pelo Chrome no Windows) e um WebP com nome .jpg são recusados com "Escolha uma imagem JPG, PNG ou WebP" – correção esperada: decidir só pelos bytes iniciais, ignorando a extensão; o `accept` continua como está. O .gif renomeado para .png deve continuar recusado.

- [SUGESTÃO] src/lib/avatar-image.ts:1 – o limite é 5.000.000 bytes; um arquivo de 5.100.000, que o Windows mostra como 4,86 MB, é recusado com "até 5 MB" – correção esperada: `5 * 1024 * 1024`.

- [SUGESTÃO] src/lib/avatar-image.ts:28-30 – redução direta para 128px sem definir a qualidade – correção esperada: `context.imageSmoothingQuality = 'high'` antes do `drawImage`.

- [SUGESTÃO] src/components/shared/profile-avatar.tsx:20 – foto com base64 que não decodifica (testado com `data:image/webp;base64,AAAA`) deixa o avatar vazio – correção esperada: no `onError` do `img`, mostrar as iniciais.

- [SUGESTÃO] src/components/shared/profile-settings.tsx:42-64 e 178 – (a) salvar de novo sem alterar não muda o texto do status, então não há novo anúncio (0 mutações medidas); (b) "Foto salva." e "Preparando foto…" aparecem 295px abaixo do avatar, depois do formulário – correção esperada: (a) limpar o status e preenchê-lo na atualização seguinte; (b) `role="status"` próprio ao lado dos botões da foto, deixando o atual só para o perfil.

- [SUGESTÃO] src/lib/session.ts:79-89 – com localStorage bloqueado, o login e o tema funcionam em memória, mas o nome não muda – correção esperada: atualizar o snapshot em memória, avisar os ouvintes e devolver `false`, mantendo o aviso de que não foi salvo.

- [SUGESTÃO] src/lib/theme.ts e src/i18n/index.ts – tema e idioma trocados em uma aba não chegam a outra já aberta (só após F5), ao contrário do nome e da foto – correção esperada: usar `subscribeStorage('theme', …)` e `subscribeStorage('language', …)` para reler o valor, aplicar o tema e chamar `changeLanguage`.

- [SUGESTÃO] src/components/shared/profile-avatar.tsx:10-13 – as iniciais usam o primeiro código do texto e separam emojis compostos ("👩‍👧 élan" vira "👩É") – correção esperada: usar `Intl.Segmenter` por grafema e considerar só palavras que começam com letra (`\p{L}`), com a primeira letra do nome como reserva.

## Fora do escopo notado (não corrigir agora)
- O texto manda falar com o suporte, mas não há canal de contato; o escopo só pede o texto.
- Os botões Salvar perfil e Sair seguem as variantes existentes; não há variante destrutiva no projeto.
- Os dados bloqueados são uma lista de termos, não campos desabilitados: leem bem em leitor de tela, e o cadeado é decorativo.
- Conferido sem problemas, no Chrome via Playwright: nome vazio e só com espaços; nome editado aparece no Início e no avatar do header sem F5 e em outra aba, sem alterar `loginCount`; nome de 150 caracteres em 360px; máscara de fixo e celular, apagar do fim e no meio, telefone vazio e incompleto; upload por teclado; PNG, JPG, JPEG e WebP reduzidos a 128x128; .gif, .gif renomeado, 6 MB, vazio, corrompido e truncado recusados com mensagem; remover foto devolve as iniciais e o foco ao botão; storage cheio e bloqueado com aviso; perfil inválido no storage não quebra a tela; idioma muda textos, moeda, data e `lang`, e persiste; tema sincronizado entre Select e header nos dois sentidos e após F5; telefone, foto, idioma e tema preservados após sair e entrar; perfil separado por e-mail; erros ligados aos campos e foco no primeiro inválido; ordem do Tab; 360, 768 e 1280px nos dois temas e nos 3 idiomas sem rolagem horizontal; console sem erros; mesmas chaves nos 3 idiomas; sem hex solto; reuso de FormField, Input, Select e Button.
