# Quarta entrega: seu quarto em um link

Branch: `feat/setup-sharing`, criada a partir de `feat/local-setups`. A main não foi alterada. Nenhuma dependência nova foi adicionada.

## Mudança de direção

O plano inicial previa um servidor e banco para links curtos. O autor informou que não tinha hospedagem ou Supabase e preferia deixar o projeto no GitHub. A solução desta entrega usa GitHub Pages e uma composição compactada no próprio link.

O formato publicado é `/RoomLab/#/setup?data=v1...`. O endereço é maior que um ID curto, mas funciona em outro navegador sem cadastro, banco ou acesso aos setups locais do autor.

## Como experimentar

1. Monte ou abra um quarto no editor. Não é necessário salvar antes de compartilhar.
2. Clique em Compartilhar e confira o nome e a quantidade de peças.
3. Clique em Gerar link e depois Copiar link.
4. Abra o endereço inteiro em uma janela privada ou em outro dispositivo quando estiver no site publicado.
5. A página exibe a composição em modo de visualização. Editar uma cópia salva um novo documento no navegador do destinatário e abre o editor.
6. Alterar a edição original ou a cópia não muda o conteúdo do link já gerado. Para compartilhar novas alterações, gere outro endereço.

Na prévia local, o endereço começa com 127.0.0.1 e só funciona no mesmo computador. O diálogo comunica isso. No site publicado, os links usam o domínio github.io.

## Direção visual

Mantivemos Barlow, Barlow Semi Condensed, a bancada `#e8edf2`, papel `#ffffff`, tinta `#202b38`, azul `#2457d6`, madeira `#b78d60` e verde `#48705a`. A visualização compartilhada dá mais espaço ao desenho do quarto e mantém o nome à esquerda. A única ação principal é Editar uma cópia.

O diálogo apresenta a composição antes de gerar o link. O campo do endereço cabe no celular e permite seleção manual. A revisão descartou um painel de métricas ou decoração extra: o objeto desta página é o quarto. Não adicionamos animações de entrada; carregamento, erro e confirmação usam texto e controles acessíveis.

Capturas do diálogo e da página compartilhada em desktop e mobile estão em `docs/screenshots`. A largura de 320 pixels foi testada, incluindo foco e cópia manual.

## Documento e compactação

`src/features/sharing/document.ts` define um documento com `schemaVersion`, `name`, `scene` e `objects`. O validador reaproveita as regras da persistência e da geometria. ID local do setup, revisão, datas, seleção, histórico e campos desconhecidos não entram no link. IDs dos objetos permanecem para identificar as peças e preservar camadas.

`codec.ts` serializa JSON em UTF-8, compacta com gzip pela API CompressionStream e codifica bytes em base64url. O prefixo `v1.` identifica o formato do link. Ao abrir, a ordem é inversa: base64url, descompactação, leitura de JSON e validação.

Há dois limites: 12.000 caracteres no token e 64.000 bytes no documento descompactado. A leitura da stream encerra quando o limite é ultrapassado, inclusive para uma entrada pequena que expanda muito. Os limites de 100 peças e nome de 60 caracteres continuam ativos. Um teste verifica um quarto com 100 objetos distintos dentro do limite do link.

Compactação reduz endereços em relação ao documento codificado diretamente, mas tem custo fixo e não garante um token menor que o JSON original para cenas muito pequenas. Não há criptografia ou assinatura. Quem tem o link consegue ler o conteúdo e pode criar outro link com uma composição diferente; ele não comprova autoria.

## Estado e cópias

O diálogo recebe o documento do momento em que foi aberto. A composição permanece fixa enquanto o link é gerado. Compartilhar não altera o salvamento local nem o histórico do editor.

O visualizador usa o link como única fonte da cena, sem consultar localStorage. O carregamento assíncrono ignora resultados de uma rota abandonada. Um link vazio, truncado, inválido ou de versão futura mostra um erro com caminho para começar um quarto.

Editar uma cópia valida e salva um novo documento com ID, revisão e datas próprios. Se o armazenamento estiver cheio ou bloqueado, a visualização continua aberta e apresenta o erro. Exportar JSON oferece um backup mesmo nesse caso. Se o navegador não suportar as APIs de compressão, a interface explica o requisito de atualizar o navegador.

O diálogo usa showModal, foco inicial no botão Fechar, Escape e restauração de foco no botão Compartilhar. Falhas da área de transferência deixam o campo selecionado para copiar manualmente.

## GitHub Pages e rotas

`vite.config.ts` aceita a base `/RoomLab/`. No build do Pages, `VITE_ROUTER_MODE=hash` seleciona createHashRouter. Assim, editor e links compartilhados acessam o mesmo arquivo inicial no servidor, sem depender de um fallback para URLs como `/editor`.

O documento fica no fragmento, depois de `#`. O navegador não envia esse fragmento na requisição HTTP ao servidor de hospedagem. O endereço completo ainda aparece no histórico e nas mensagens em que for compartilhado. Não há segredo configurado no build.

O desenvolvimento mantém as rotas normais. `.env.example` documenta as duas opções. `scripts/preview-pages.mjs` constrói uma versão em `dist-pages` com a mesma base e modo de rotas, para testar recarregamento e compartilhamento antes da publicação.

`.github/workflows/pages.yml` instala dependências, executa lint, formatação, testes de lógica, testes de navegador e testes do build do Pages. Só depois publica o artefato. Ações estão fixadas por SHA. PRs para main são verificados sem publicar. Pushes em main ou feat/setup-sharing podem publicar; commits que alteram apenas documentação não publicam novamente.

Pages foi configurado para GitHub Actions, com permissão de publicação para main e feat/setup-sharing. A branch da entrega pode publicar sem merge. A proteção automática da main continua sem configuração, e o workflow ainda não existe na main inicial até a futura integração.

## Verificação

- 18 testes de lógica aprovados, incluindo round trip, Unicode, remoção de campos locais, versão desconhecida, token truncado, limites de bytes e 100 objetos.
- 63 testes de navegador aprovados nos perfis de desktop, tablet e celular. Seis combinações específicas de toque ou desktop são ignoradas nos perfis não aplicáveis.
- Dois testes do build preparado para Pages aprovados em desktop e celular, com recarregamento das rotas e abertura em contexto independente.
- A sessão do destinatário começa sem dados locais; abrir o link mostra a mesma composição e Editar uma cópia cria um documento independente.
- Falha de cópia automática, foco, Escape, dados inválidos, navegador sem descompactação e quota local tratados.
- Build com tipos, lint, formatação e revisão visual concluídos.
- [Workflow no GitHub Actions](https://github.com/samuelsce/RoomLab/actions/runs/37413959090) concluído com sucesso, incluindo validação e deploy.
- [Demo publicada](https://samuelsce.github.io/RoomLab/) verificada no endereço real: resposta HTTP 200, visualização em sessão independente, edição de cópia e recarregamento. O comando `npm run test:live` reproduz essa conferência sem publicar documentos no servidor.

Os testes usam Chromium e emulação de viewport/toque. Não representam validação em Safari, Firefox ou todos os dispositivos físicos.

## Limites desta escolha

Links longos podem ser cortados por aplicativos de mensagem; copie o endereço completo. Não existe revogação central, encurtamento, autenticação ou galeria pública. O link continua dependendo da disponibilidade do site e de um leitor compatível com a versão do formato. Excluir o documento local não invalida um link compartilhado.

O site publicado terá armazenamento local diferente da prévia em 127.0.0.1. Para transferir seus setups, use exportação/importação JSON ou abra um link e edite uma cópia.

## Exercício para aprender

Abra o mesmo link em janela normal e privada. Edite uma cópia e compare o ID local com o quarto original. Explique por que o link funciona na janela privada, mesmo sem localStorage, e por que seu conteúdo não pode ser revogado sem um serviço central.

Na entrevista, mostre a decisão baseada na restrição do projeto: hospedagem estática, formato versionado, validação na entrada e testes em contexto independente. O formato curto do plano inicial exigiria um backend; esta solução usa um documento portátil.

Referências: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [publicação do Vite no Pages](https://vite.dev/guide/static-deploy.html#github-pages), [CompressionStream](https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream) e [DecompressionStream](https://developer.mozilla.org/en-US/docs/Web/API/DecompressionStream).
