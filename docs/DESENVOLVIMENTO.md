# Desenvolvimento do RoomLab

A versão atual está em `main`. O [README](../README.md) apresenta instalação e demo; a [arquitetura](ARQUITETURA.md) descreve decisões e limites. O [índice de entregas](README.md) preserva os registros de aprendizado de cada etapa.

## Ambiente

Use Node.js 22.12+ e npm. O workflow utiliza Node.js 24. Instale as dependências com `npm ci` para respeitar o lockfile e inicie `npm run dev`. O endereço padrão é `http://127.0.0.1:5173`; o Vite informa outra porta se ela estiver ocupada.

Sem variáveis adicionais, o desenvolvimento usa caminhos normais. `.env.example` documenta as configurações opcionais. Credenciais, banco e serviços externos não são necessários.

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Servidor local com atualização durante a edição |
| `npm run build` | Verificação de tipos e build em `dist` |
| `npm run preview` | Servir o build localmente |
| `npm run lint` | Regras de TypeScript, React e hooks |
| `npm run typecheck` | Verificação de tipos sem gerar arquivos |
| `npm run format:check` / `npm run format` | Conferir / aplicar formatação do código e configurações |
| `npm run test:unit` | Regras de geometria, histórico, projeção, armazenamento e links |
| `npm run test:e2e -- --workers=2` | Fluxos Chromium nos três perfis responsivos |
| `npm run test:pages -- --workers=2` | Build com base `/RoomLab/` e rotas hash |
| `npm run test:live` | Verificar a demo pública e compartilhamento entre sessões |

Antes dos testes de navegador, execute `npx playwright install chromium`. Os testes locais de aplicação e Pages utilizam portas 4173 e 4174. A saída regular fica em `test-results`; a de Pages fica em `test-results-pages`. Ambas são ignoradas pelo Git.

## Capturas

O script `npm run capture:preview` usa o servidor na porta 5173 e cobre o fluxo geral. Para a nova home e o editor gamer, mantenha um servidor na porta 5174 e execute `node scripts/capture-studio.mjs`. O endereço desse script pode ser alterado pela variável `ROOMLAB_PREVIEW_URL`.

Revise capturas antes de versioná-las. As imagens em `docs/screenshots` servem como evidência visual e apresentação do README; não são builds da aplicação.

`node scripts/capture-composition.mjs` registra o painel de acabamentos e o agrupamento nos perfis desktop, tablet e celular. Também aceita `ROOMLAB_PREVIEW_URL` e utiliza a porta 5174 por padrão.

## Branches, commits e publicação

1. Atualize `main` e crie uma branch com escopo claro, como `feat/...`, `fix/...` ou `docs/...`.
2. Implemente mudanças por responsabilidade e faça commits compreensíveis. Preserve compatibilidade com documentos salvos e compartilhados.
3. Verifique o comportamento afetado, revise o diff e abra um pull request para `main`.
4. Aguarde os checks e revise problema, resultado, validação e limites antes de integrar.

O workflow roda em pull requests para `main` e valida antes de publicar pushes habilitados. O Pages utiliza `VITE_BASE_PATH=/RoomLab/` e `VITE_ROUTER_MODE=hash`. A publicação recebe os arquivos de `dist`. Alterações limitadas a `README.md` e `docs/**` não disparam publicação no push; os checks do pull request continuam aplicáveis.

A configuração de checks no workflow não equivale a uma regra de proteção de branch. Consulte as regras do repositório no GitHub para saber quais checks são obrigatórios para integração.

## Aprendizado e comunicação

O projeto foi construído por entregas, com decisões e exercícios registrados. O objetivo é conseguir modificar e explicar o código, além de demonstrar o produto. Exemplos de estudo:

- Ajustar um limite de tamanho em `geometry.ts` e testar objetos girados perto das paredes.
- Identificar o começo, previews, confirmação e cancelamento de um gesto no reducer.
- Acompanhar a transformação do centro da peça em `projection.ts`.
- Exportar um documento e comparar os campos locais com os campos do snapshot público.
- Navegar apenas com teclado e repetir a câmera com movimento reduzido.

Descreva mudanças pelo efeito no produto e pelas decisões que o sustentam. Evite travessões em novos textos da interface e documentação, conforme preferência do autor. Os [guias de cada entrega](README.md) aprofundam esses exercícios.
