# Desenvolvimento e aprendizado

## Acordo de trabalho

Antes de cada etapa, explicar em português o resultado esperado, os arquivos envolvidos e a decisão técnica principal. Durante o trabalho, comunicar descobertas e mudanças relevantes. Ao terminar, mostrar o que mudou, como experimentar, como foi verificado e quais commits foram criados.

Não transformar a entrega em uma aula sobre cada linha: concentrar explicações nos conceitos que permitem ao autor do portfólio entender, modificar e defender o projeto em entrevista.

## Branches e commits

O repositório começa com uma base mínima em `main`. O planejamento fica em `docs/project-planning`. Implementar cada etapa em sua branch e integrar apenas depois das verificações pertinentes. Separar commits por mudança compreensível, sem checkpoints quebrados ou commits artificiais por arquivo.

| Etapa | Branch sugerida | Exemplos de commits |
| --- | --- | --- |
| Fundação | `feat/app-foundation` | `chore: configure React and TypeScript`; `feat: add landing page and editor layout` |
| Catálogo e cena | `feat/room-editor` | `feat: add object catalog`; `feat: implement object selection and movement` |
| Transformações | `feat/editor-transforms` | `feat: add rotation and resize controls`; `feat: add undo and redo history` |
| Salvos | `feat/local-setups` | `feat: persist setups locally`; `feat: export setup image and document` |
| Links | `feat/setup-sharing` | `feat: publish setup snapshots`; `feat: add shared setup viewer` |
| Acabamento | `feat/portfolio-polish` | `fix: improve touch interactions`; `docs: add demo and architecture guide` |

Fluxo: criar branch → implementar uma responsabilidade → verificar → revisar diff → commit → concluir etapa → revisar entrega → integrar na main. Manter commits individuais ao integrar para preservar o histórico solicitado. Correções usam `fix/...` e não são feitas diretamente na main.

Branches isolam mudanças, mas não impedem todos os erros. No GitHub, configurar regra de proteção da main: exigir pull request e checks de lint, tipos, testes essenciais e build. A disponibilidade de regras depende do repositório e da conta. Essa proteção não está configurada só porque as branches locais existem.

Não há remoto configurado nesta fase. Quando for informado/criado o repositório GitHub, conectar, enviar as branches e configurar o fluxo de PRs. Nunca versionar `.env` com credenciais; manter apenas exemplo com nomes de variáveis.

## O que aprender em cada entrega

| Entrega | Conceitos | Exercício curto |
| --- | --- | --- |
| Fundação visual | Componentes, props, tokens, layout responsivo | Alterar um token e identificar quais componentes mudam |
| Catálogo | Tipagem de dados, listas e estado | Adicionar um novo objeto ao catálogo |
| Movimento | Eventos, coordenadas e conversão com zoom | Explicar por que posição não deve ser salva em pixels da tela |
| Transformações | Geometria, validação e comandos | Ajustar o limite mínimo de um tipo de objeto |
| Histórico | Estado transitório e persistente | Explicar por que um arrasto produz só uma ação de desfazer |
| Persistência | Serialização, versões e falhas | Exportar um setup e reconhecer os campos do documento |
| Compartilhamento | Cliente/servidor, snapshots e carregamento | Explicar por que localStorage não cria um link público |
| Acabamento | Testes, acessibilidade e desempenho | Executar o fluxo só com teclado e descrever o resultado |

Os exercícios acompanham entregas concretas, sem bloquear o desenvolvimento. Registrar decisões relevantes com motivo e tradeoff, para servir de material de entrevista.

## Situação desta entrega

Planejamento e pesquisa documentados. Aplicativo, dependências, testes, CI, hospedagem e serviço de compartilhamento ainda não foram implementados. A skill `frontend-design` não foi encontrada; nenhuma aplicação dessa skill é alegada.
