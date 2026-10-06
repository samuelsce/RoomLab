# Pesquisa e direção visual

Pesquisa realizada em 5 de outubro de 2026. As referências são pontos de partida; a identidade e os assets do RoomLab serão próprios. A pesquisa consultou páginas públicas e documentação, sem avaliação prática dos editores autenticados.

## Referências profissionais

| Referência | O que estudar | Aplicação proposta no RoomLab |
| --- | --- | --- |
| [Planner 5D](https://planner5d.com/) | Fluxo de planejar, mobiliar e visualizar; catálogo de objetos | Categorias simples e inclusão rápida de móveis |
| [Spline](https://spline.design/) | Cenas interativas, materiais e apresentação de objetos | Quarto como protagonista e ilustrações com identidade consistente |
| [Linear](https://linear.app/) | Organização de um produto com navegação, áreas de trabalho e detalhes | Hierarquia clara entre catálogo, área de edição e propriedades |

As escolhas abaixo são propostas de design do RoomLab, não afirmações de que essas referências usam a mesma paleta, duração de animações ou tecnologia.

## Conceito revisado: bancada de montagem

O RoomLab é um espaço para experimentar a disposição de objetos reais de um setup. A identidade vem de uma bancada de montagem: área de trabalho ampla, peças reconhecíveis no catálogo e seleção precisa. A composição do quarto concentra a personalidade; os controles permanecem discretos.

Primeira passagem — tokens propostos:

| Token | Cor | Uso |
| --- | --- | --- |
| Bancada | `#E8EDF2` | Fundo da área de edição |
| Superfície | `#FFFFFF` | Catálogo e propriedades |
| Tinta | `#202B38` | Texto e ícones |
| Seleção | `#2457D6` | Foco, alças de seleção e ação principal |
| Madeira | `#B78D60` | Material de mesas e piso; não cor de texto |
| Folhagem | `#48705A` | Plantas e materiais da cena |

Verificar contraste em cada combinação real antes de aprovar os componentes. Cores de material não substituem os tokens de texto e foco. A cena pode receber outras cores escolhidas pelo usuário.

Tipografia proposta: Barlow Semi Condensed, peso 600, para título e marca, remetendo ao espaço compacto de um setup; Barlow, pesos 400 e 500, para controles e leitura. Validar legibilidade em português e registrar licença/origem antes de incorporar arquivos. Fallback de sistema. Escala inicial: 14, 16, 20, 28, 40 e 56 px; título mobile de 40 px e desktop de 56 px. Corpo de 16 px com entrelinha 1,5 e até 65 caracteres por linha. Medidas usam algarismos tabulares da mesma família, sem monospace decorativo.

Desktop: cabeçalho com nome e estado de salvamento; catálogo à esquerda; quarto no centro; propriedades à direita; ferramentas de zoom e histórico próximas à área de edição.

Mobile: quarto visível e painel inferior com abas de catálogo/propriedades. Adicionar por toque deve funcionar sem exigir arrastar da gaveta. Alvos de toque de pelo menos 44 px como meta do projeto.

Home: abrir com um quarto de exemplo grande e reconhecível, acompanhado de “Monte um quarto que combina com seu setup.” e CTA “Montar meu setup”. Apoio: “Escolha os móveis, ajuste as cores e encontre espaço para tudo.” Oferecer começar vazio ou usar um exemplo. Exemplos: Mesa para estudar, Setup com dois monitores e Cantinho com plantas. Evitar nomes de estilos que não expliquem o conteúdo.

Alinhamento: texto e controles à esquerda; cena centralizada no espaço disponível. Comparar duas estruturas antes de construir:

```text
A — apresentação com cena dominante (preferida para a home)
+----------------------------------------------------------+
| RoomLab                                  Meus setups     |
| Texto + ação          |                                  |
|                       | Quarto de exemplo amplo          |
| Começar vazio         | Mesa, monitor, cadeira e planta   |
| Usar este exemplo     |                                  |
+----------------------------------------------------------+

B — entrada direta no editor (rota /editor)
+----------------------------------------------------------+
| RoomLab | Nome do setup | Salvo neste navegador | Link    |
| Catálogo       | Quarto editável       | Propriedades     |
| Busca          |                      | Item selecionado |
| Categorias     |                      | Cor e dimensões  |
| Objetos        | Histórico e zoom     | Lista de objetos |
+----------------------------------------------------------+

Mobile — mesma tarefa, painéis sob a cena
+---------------------------+
| RoomLab | Nome | Salvo     |
|                           |
| Quarto editável           |
|                           |
| Histórico | Zoom          |
| Catálogo | Propriedades   |
| Painel da aba ativa       |
+---------------------------+
```

A apresenta o propósito antes de pedir trabalho; B reduz passos para quem volta ao editor. A home não deve repetir os três painéis em miniatura. No mobile, os controles permanecem acessíveis sem cobrir toda a cena.

Princípios: a cena é o único elemento de destaque; objetos no catálogo aparecem como peças, sem cards promocionais idênticos; bordas delimitam áreas editáveis e grupos de controle; sombras sugerem material e profundidade na cena, não decoram todos os painéis. Cantos variam por função: campos e botões discretamente arredondados, peças com sua própria geometria.

## Segunda passagem: revisão contra o briefing

- A paleta anterior de creme e terracota era uma escolha pouco específica para montagem de setups. Foi substituída por uma bancada fria, com azul reservado à interação e materiais quentes dentro do quarto.
- O título anterior “Seu espaço. Do seu jeito.” poderia servir a muitos produtos. O novo texto descreve a tarefa de montar um quarto e o catálogo usa exemplos concretos.
- A estrutura de catálogo/cena/propriedades é convencional, mas se justifica pela tarefa. A identidade virá dos objetos e da composição, sem forçar uma navegação diferente que prejudique o uso.
- A tipografia proposta usa proporções condensadas apenas onde ajudam a marca e os títulos. Campos e instruções mantêm largura confortável para leitura.
- Nada de palavras isoladas em outra cor no título, rótulos em caixa alta, numeração decorativa ou entradas animadas em todas as seções.
- O risco restante é a vista superior parecer uma planta técnica. A primeira composição precisa mostrar que mesa, monitor e plantas são reconhecíveis e que personalizar muda visivelmente o resultado. Se isso falhar, revisar a representação antes das interações completas.

Esta revisão concluiu a fase de planejamento da skill. A primeira entrega foi construída e revisada com screenshots de desktop/mobile; resultados e limitações em [ENTREGA-01.md](ENTREGA-01.md). A avaliação visual continua aberta ao autor do projeto antes da manipulação completa.

## Vocabulário da interface

Usar nomes constantes: “Adicionar mesa”, “Duplicar”, “Excluir”, “Desfazer”, “Refazer”, “Compartilhar” e “Copiar link”. Exibir “Link copiado” após copiar, sem alternar o nome da ação. Para cena vazia: “Comece adicionando uma mesa.” Para falha local: “Não foi possível salvar neste navegador. Exporte seu setup para guardar uma cópia.” Confirmar a causa real antes de sugerir uma solução específica.

## Animações pesquisadas

A documentação do [Motion sobre drag](https://motion.dev/docs/react-drag) cobre limites, elasticidade e momentum. Para posicionamento preciso, o RoomLab não deve usar momentum ao soltar. O motor do editor será responsável pelas coordenadas; Motion será usado nos elementos HTML da interface.

A documentação de [gestos](https://motion.dev/docs/react-gestures) apresenta hover, tap e foco. Hover é complemento: seleção e ações precisam continuar disponíveis em touch e teclado.

[useReducedMotion](https://motion.dev/docs/react-use-reduced-motion) permite adaptar animações à preferência do sistema. Substituir grandes deslocamentos por fades e evitar parallax quando a preferência estiver ativa.

| Interação | Comportamento proposto | Duração inicial |
| --- | --- | --- |
| Controles acionados | Cor, borda e feedback discreto de pressão | 120–160 ms |
| Abrir catálogo/propriedades | Fade e deslocamento discreto | 180–220 ms |
| Adicionar item | Fade curto, sem mudar a posição final | 160–200 ms |
| Arrastar/redimensionar | Seguir ponteiro diretamente, sem easing | Contínuo |
| Soltar em grade | Ajuste curto para a posição válida | 80–120 ms |
| Salvar/copiar link | Indicador textual discreto, anunciado de forma acessível | 150 ms |

Esses tempos são hipóteses para testar, não regras extraídas das fontes. Não animar coordenadas com dois motores ao mesmo tempo. Evitar animações contínuas durante o trabalho e atualizações de layout custosas a cada frame.

A apresentação inicial será estática até existir uma razão clara para animá-la. Priorizar movimento que responde à pessoa: abrir painel, adicionar objeto e confirmar uma ação. Não usar flutuação constante da cena, reveal repetido por seção ou aumento de escala em todo item do catálogo.

## Decisão sobre a vista do quarto

Proposta para a primeira versão: editor 2D em vista superior, com objetos vetoriais ilustrados, cores de materiais e sombras leves. A vista facilita mover, girar, medir e testar limites. Itens sobre a mesa usam uma camada superior; quadros ficam associados às paredes.

O principal risco visual é ficar parecido com uma planta técnica. Antes de implementar o editor completo, aprovar uma composição com mesa, monitor, cadeira e planta em tamanho desktop e mobile. Se essa composição não tiver o impacto desejado, rever a vista nesse momento.

Uma vista isométrica pode aumentar o impacto, mas exige projeção de coordenadas, ordenação por profundidade e variantes de objetos ao girar. Não tratar uma rotação de imagem plana como uma rotação espacial correta. Fazer um protótipo dedicado se essa direção for escolhida.

Assets próprios em SVG; registrar licença e autoria de qualquer material externo. Não reutilizar imagens ou modelos dos sites de referência.

## Skill solicitada

A skill `frontend-design` foi carregada pelo comando solicitado pelo usuário: `npx skills use "https://github.com/anthropics/skills" --skill "frontend-design"`. A saída completa foi lida e suas instruções foram aplicadas ao planejamento em duas passagens: tokens/layout/princípios e revisão contra o briefing.

Origem: [anthropics/skills](https://github.com/anthropics/skills). Diretório de apoio retornado nesta execução: `C:\Users\samue\AppData\Local\Temp\skills-use-adybS1\frontend-design`. Referências relativas dessa skill devem ser resolvidas a partir desse diretório. Esse caminho é temporário e não é uma dependência do aplicativo.

## Revisão do painel de acabamentos, 6 de outubro de 2026

A skill `frontend-design-references` orientou a consulta ao [painel inferior do Recollect no 60fps](https://60fps.design/shots/recollect-pro-bottom-sheet-to-page-interaction). A inspeção dos frames do vídeo confirmou a composição com tela de origem visível acima do painel e ação principal no rodapé. No RoomLab, esse princípio foi adaptado ao painel móvel de acabamentos, com altura limitada, amostras roláveis e controles de fechar/concluir sempre acessíveis. A identidade existente foi preservada. O [guia de agrupamento e ambiente](AGRUPAMENTO-AMBIENTE.md) registra a implementação e as capturas em três tamanhos.
