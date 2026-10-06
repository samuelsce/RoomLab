# Pesquisa e direção visual

Pesquisa realizada em 5 de outubro de 2026. As referências são pontos de partida; a identidade e os assets do RoomLab serão próprios. A pesquisa consultou páginas públicas e documentação, sem avaliação prática dos editores autenticados.

## Referências profissionais

| Referência | O que estudar | Aplicação proposta no RoomLab |
| --- | --- | --- |
| [Planner 5D](https://planner5d.com/) | Fluxo de planejar, mobiliar e visualizar; catálogo de objetos | Categorias simples e inclusão rápida de móveis |
| [Spline](https://spline.design/) | Cenas interativas, materiais e apresentação de objetos | Quarto como protagonista e ilustrações com identidade consistente |
| [Linear](https://linear.app/) | Organização de um produto com navegação, áreas de trabalho e detalhes | Hierarquia clara entre catálogo, área de edição e propriedades |

As escolhas abaixo são propostas de design do RoomLab, não afirmações de que essas referências usam a mesma paleta, duração de animações ou tecnologia.

## Conceito: um pequeno estúdio criativo

Interface clara em tons de papel e carvão, acento laranja queimado e materiais de madeira, verde e grafite no quarto. Evitar excesso de efeitos que disputem atenção com a composição.

Paleta inicial para validar no protótipo: fundo `#F5F2EB`, superfície `#FFFFFF`, texto `#232521`, acento `#B94A24`, verde `#55745C`. Verificar contraste em cada combinação real antes de aprovar os componentes.

Tipografia proposta: Manrope nos títulos e interface; fonte de sistema como fallback. Números de medidas com algarismos tabulares. Usar fonte licenciada e registrar sua origem se for incluída no projeto.

Desktop: cabeçalho com nome e estado de salvamento; catálogo à esquerda; quarto no centro; propriedades à direita; ferramentas de zoom e histórico próximas à área de edição.

Mobile: quarto visível e painel inferior com abas de catálogo/propriedades. Adicionar por toque deve funcionar sem exigir arrastar da gaveta. Alvos de toque de pelo menos 44 px como meta do projeto.

Home: título “Seu espaço. Do seu jeito.”, uma composição demonstrativa e CTA “Montar meu setup”. Oferecer começar vazio ou usar um exemplo. Exemplos propostos: Foco, Criativo e Gamer.

## Animações pesquisadas

A documentação do [Motion sobre drag](https://motion.dev/docs/react-drag) cobre limites, elasticidade e momentum. Para posicionamento preciso, o RoomLab não deve usar momentum ao soltar. O motor do editor será responsável pelas coordenadas; Motion será usado nos elementos HTML da interface.

A documentação de [gestos](https://motion.dev/docs/react-gestures) apresenta hover, tap e foco. Hover é complemento: seleção e ações precisam continuar disponíveis em touch e teclado.

[useReducedMotion](https://motion.dev/docs/react-use-reduced-motion) permite adaptar animações à preferência do sistema. Substituir grandes deslocamentos por fades e evitar parallax quando a preferência estiver ativa.

| Interação | Comportamento proposto | Duração inicial |
| --- | --- | --- |
| Botões e cards | Cor, borda e pequeno feedback de pressão | 120–160 ms |
| Abrir catálogo/propriedades | Fade e deslocamento discreto | 180–220 ms |
| Adicionar item | Fade curto, sem mudar a posição final | 160–200 ms |
| Arrastar/redimensionar | Seguir ponteiro diretamente, sem easing | Contínuo |
| Soltar em grade | Ajuste curto para a posição válida | 80–120 ms |
| Salvar/copiar link | Indicador textual discreto, anunciado de forma acessível | 150 ms |

Esses tempos são hipóteses para testar, não regras extraídas das fontes. Não animar coordenadas com dois motores ao mesmo tempo. Evitar animações contínuas durante o trabalho e atualizações de layout custosas a cada frame.

## Decisão sobre a vista do quarto

Proposta para a primeira versão: editor 2D em vista superior, com objetos vetoriais ilustrados, cores de materiais e sombras leves. A vista facilita mover, girar, medir e testar limites. Itens sobre a mesa usam uma camada superior; quadros ficam associados às paredes.

O principal risco visual é ficar parecido com uma planta técnica. Antes de implementar o editor completo, aprovar uma composição com mesa, monitor, cadeira e planta em tamanho desktop e mobile. Se essa composição não tiver o impacto desejado, rever a vista nesse momento.

Uma vista isométrica pode aumentar o impacto, mas exige projeção de coordenadas, ordenação por profundidade e variantes de objetos ao girar. Não tratar uma rotação de imagem plana como uma rotação espacial correta. Fazer um protótipo dedicado se essa direção for escolhida.

Assets próprios em SVG; registrar licença e autoria de qualquer material externo. Não reutilizar imagens ou modelos dos sites de referência.

## Skill solicitada

A skill `frontend-design` não estava disponível no catálogo nem foi encontrada nas pastas locais de skills/plugins. Ela não foi aplicada. O planejamento usa a pesquisa acima e decisões explicitamente identificadas como propostas.
