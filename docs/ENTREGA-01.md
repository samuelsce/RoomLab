# Primeira entrega: fundação e protótipo visual

## Resultado

Home, estrutura do editor, 12 peças ilustradas e três composições. A navegação, os filtros, a busca, a seleção e o zoom são funcionais. A cena vazia permite avaliar o quarto sem móveis. Movimentação, inclusão de objetos, personalização, histórico, salvamento e compartilhamento pertencem às próximas entregas.

![Editor no desktop](screenshots/editor-desktop.png)

## Como experimentar

1. Execute `npm ci` e `npm run dev`; abra o endereço local.
2. Na home, escolha um exemplo ou abra o editor.
3. Busque “luminaria” para verificar que a busca também aceita texto sem acento.
4. Selecione uma peça do catálogo: o painel mostra uma prévia, sem adicioná-la ao quarto.
5. Selecione um objeto no quarto ou na lista: o contorno azul identifica a seleção.
6. Experimente zoom e restauração. Abra em uma janela estreita para alternar Catálogo/Propriedades.
7. Use Tab e Enter para navegar e selecionar; o primeiro link permite pular para o conteúdo.

## Conceitos para aprender no código

**Componentes e props.** `ObjectArt` desenha cada tipo de objeto recebendo `kind` e `color`. `ObjectThumbnail` reaproveita o desenho no catálogo. `RoomScene` monta as mesmas peças com posições e tamanhos. Mudar um desenho atualiza todas as apresentações do objeto.

**Dados e apresentação.** `catalog.ts` descreve nomes, categorias e dimensões. `scenes.ts` descreve as composições. Eles não desenham a interface. `RoomScene.tsx` usa esses dados para renderizar SVG. Essa separação prepara o projeto para substituir as cenas fixas por documentos editáveis.

**Estado.** `Editor.tsx` usa `useState` para busca, categoria, painel, seleção, prévia e zoom. A prévia do catálogo é diferente da seleção de um objeto no quarto. Ainda não existe estado persistente; recarregar volta à composição demonstrativa escolhida pela URL.

**Coordenadas.** O SVG tem `viewBox="0 0 760 610"`. Isso mantém as posições em um espaço lógico enquanto o CSS muda o tamanho exibido. O zoom é uma transformação visual. Quando implementarmos arrasto, será preciso converter a posição do ponteiro para esse espaço.

**Responsividade.** CSS Grid mantém três áreas no desktop. Abaixo de 900 px, a cena ocupa a primeira área e os painéis alternam abaixo dela. No desktop os painéis rolam dentro da janela; no mobile a página rola normalmente. Tokens de cor estão em `:root` de `styles.css`.

**Acessibilidade.** Controles HTML têm rótulos e estados de seleção. Os objetos SVG podem ser selecionados por teclado e há uma lista HTML alternativa. Ao abrir detalhes no mobile, o foco vai para o título do painel, evitando que fique em um botão que foi ocultado. Foco visível e preferência de movimento reduzido estão nos estilos.

Exercícios: adicione um nome alternativo a um objeto do catálogo, altere um token de cor e modifique a posição de uma planta em `scenes.ts`. Observe o que muda e explique por que catálogo e cena são arquivos diferentes.

## Decisões e revisão visual

Aplicada a skill `frontend-design` carregada na etapa de planejamento. Mantidos a bancada cinza frio, azul para interação, Barlow e materiais quentes dentro do quarto. Removido um rótulo introdutório da home que repetia a intenção do título.

O SVG é uma composição ilustrada de cima, com detalhes frontais nos monitores e quadros para facilitar reconhecimento. Não é uma projeção arquitetônica rigorosa ou um modelo 3D. A representação precisa ser revista antes de prometer medidas físicas ou rotação espacial.

Não foi introduzido Konva ou um segundo motor de movimento nesta etapa. A próxima entrega deve validar a manipulação de um único objeto antes de migrar o desenho completo para um canvas. Movimento autônomo foi evitado; as transições discretas respondem a ações de interface.

Revisadas capturas em 1440 px e 390 px, além dos testes em 768 e 320 px. Ajustados altura do editor e ocultação visual do link de pular conteúdo em capturas completas. As capturas finais estão em `docs/screenshots` e podem ser regeneradas pelo script de prévia.

## Verificação

- Build de produção e checagem TypeScript aprovados.
- Lint sem erros ou avisos; formatação conferida.
- 12 testes Playwright aprovados: quatro fluxos em três perfis de viewport.
- Cobertura de navegação, busca, filtros, seleção por teclado, zoom, rotas diretas/reload, cena vazia, recuperação de busca sem resultado e movimento reduzido.
- Sem erro de execução nos fluxos monitorados; sem rolagem horizontal nos tamanhos testados.

Os testes são em Chromium com emulação de viewport/touch, não em Safari, Firefox ou aparelhos reais. A revisão não constitui uma auditoria completa de acessibilidade. Nesta etapa não há CI ou hospedagem configurados.

## Próxima entrega

Adicionar um objeto de verdade, mover e selecionar com mouse/touch, converter coordenadas com zoom e respeitar os limites do quarto. Evoluir a partir da composição validada, com commits separados em `feat/room-editor`.
