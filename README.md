# RoomLab — monte seu setup

Projeto de portfólio front-end: um editor visual para montar e personalizar um quarto com um setup de trabalho ou jogos.

Status: primeira entrega implementada — home e protótipo visual do editor. Desenvolvimento em `feat/app-foundation`.

![Home do RoomLab](docs/screenshots/home-desktop.png)

## O que já funciona

- Home responsiva e navegação para o editor.
- Três quartos demonstrativos e uma cena vazia.
- Catálogo de 12 peças, busca com ou sem acento e filtros por categoria.
- Seleção pela cena ou lista, detalhes dos objetos e zoom.
- Layout de três áreas no desktop e painéis alternáveis no mobile.

O editor é uma demonstração. Adicionar/mover objetos, personalizar, desfazer/refazer, persistir e compartilhar ainda não estão disponíveis. As dimensões são ilustrativas.

## Rodar localmente

Requer Node.js 22.12+ e npm. Node.js 24 foi utilizado na validação.

```sh
npm ci
npm run dev
```

Abra o endereço mostrado no terminal. As rotas principais são `/` e `/editor`. Os exemplos também podem ser abertos diretamente em `/editor?scene=study`, `dual`, `plants` ou `empty`.

## Verificar

```sh
npm run lint
npm run typecheck
npm run build
npm run format:check
npx playwright install chromium
npm run test:e2e -- --workers=2
```

Os testes usam Chromium em tamanhos de desktop, tablet e celular; isso não representa validação em dispositivos físicos ou em todos os navegadores. Para atualizar as capturas, mantenha o servidor local na porta 5173 e execute `npm run capture:preview`.

## Tecnologias

React, TypeScript, Vite, React Router, CSS com tokens, SVG, Lucide e Playwright. As fontes Barlow e Barlow Semi Condensed são servidas localmente pelo Fontsource. Versões reproduzíveis registradas no lockfile.

## Objetivo

Demonstrar interfaces responsivas, manipulação gráfica, estado complexo, acessibilidade, persistência e cuidado com experiência de uso. O desenvolvimento será incremental, com explicações e commits por responsabilidade.

## Documentação

- [Plano do projeto](docs/PLANO.md)
- [Referências e direção visual](docs/REFERENCIAS.md)
- [Fluxo de desenvolvimento e aprendizado](docs/DESENVOLVIMENTO.md)
- [Primeira entrega: decisões, verificação e guia de aprendizado](docs/ENTREGA-01.md)
- [Créditos dos assets](docs/CREDITOS.md)

## Versionamento

A `main` recebe entregas revisadas. Planejamento e implementação acontecem em branches específicas. A proteção automática da `main` será configurada quando houver um repositório no GitHub.

Repositório: [samuelsce/RoomLab](https://github.com/samuelsce/RoomLab). Ainda não há uma demo hospedada ou domínio contratado. Para hospedar esta SPA, configurar fallback das rotas para `index.html`.
