# Entrega 05: um quarto com presença

## Direção antes de construir

O pedido é tornar o RoomLab mais criativo e próximo de um ambiente real. O foco visual será um pequeno quarto 3D, com espessura, materiais, mobiliário e luz. A interface ao redor precisa deixar o espaço respirar.

Paleta: papel frio `#f3f5f7`, azul de estúdio `#192639`, madeira `#deb988`, LED ciano `#59dcd6`, LED violeta `#927cf6` e texto secundário `#65758a`. Ciano e violeta aparecem nos equipamentos e na iluminação gamer, sem transformar toda a interface em neon.

Tipografia: manter Barlow para leitura e Barlow Semi Condensed para títulos grandes e compactos. O contraste virá de escala e espaço, sem letras decorativas ou etiquetas em maiúsculas.

Layout: apresentação alinhada à esquerda, com o quarto ocupando a maior parte da abertura; botões de ambientes permitem comparar composições no mesmo espaço.

```text
RoomLab                         Meus setups / Abrir editor

Seu quarto.            [ quarto 3D com materiais e sombras ]
Seu universo.          [ girar câmera / restaurar vista    ]
Texto + ação           [ natural | gamer | com plantas    ]

Escolha um ambiente          explicação curta de 2D e 3D
```

No editor, a planta continua sendo a ferramenta de posicionamento. A visualização 3D mostra a composição atual e permite girar a câmera. As duas vistas usam os mesmos objetos, cores, tamanhos e rotações.

## Crítica do plano

Só escurecer a interface e inserir brilhos continuaria parecendo um tema genérico de dashboard. A mudança é construir o quarto como protagonista: pernas das mesas, cadeira com encosto, monitores com conteúdo, vidro do gabinete, janela, rodapés e luz. A apresentação gamer terá materiais próprios e RGB localizado. Os outros ambientes continuam claros e naturais.

As animações respondem a mudanças de ambiente, vista e controles. Uma entrada curta apresenta a abertura; nenhuma rotação automática contínua. Respeitar a preferência por movimento reduzido e renderizar apenas quando necessário.

## Referências consultadas

- [Planner 5D: game room design](https://planner5d.com/use/game-room-design): alternância entre planta e perspectiva, composição e iluminação gamer.
- [Spline: soluções](https://spline.design/solutions): cena 3D como experiência interativa dentro do site.
- [Three.js: WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html) e [OrbitControls](https://threejs.org/docs/pages/OrbitControls.html): renderização e navegação da câmera.
- [Motion: movimento reduzido](https://motion.dev/docs/react-use-reduced-motion): adaptar movimentos à preferência do visitante. A implementação usará CSS e a consulta nativa de mídia, sem outra biblioteca de animação.

Os modelos serão construídos no próprio projeto. Não dependem de contas, serviços de renderização ou modelos externos.

## O que foi entregue

- Nova home com quarto 3D interativo como protagonista e quatro ambientes selecionáveis. A ação principal abre o ambiente que está sendo mostrado.
- Composição gamer com cama, cadeira, dois monitores, gabinete com vidro e três fans RGB, teclado, luminária, tapete, quadro e estante.
- Catálogo com 13 peças. A cama participa da seleção, transformações, cores, histórico, backup e compartilhamento.
- Modelos volumétricos de todas as peças, piso com tábuas, janela com abertura, rodapés, materiais, telas com textura e sombras reais do renderizador.
- Alternância entre planta e 3D no editor. O ambiente gamer abre em 3D; os demais mantêm a planta como vista inicial.
- Quarto compartilhado abre em 3D, com opção de planta e cópia editável.
- Luz natural/noturna e câmera por mouse, gesto horizontal ou botões acessíveis pelo teclado. A rolagem vertical continua disponível no celular.
- PNG acompanha a vista atual: desenho em planta ou renderização 3D com o ângulo e a luz escolhidos.
- Entrada curta, troca de ambiente/luz, movimento de câmera, aparição de peças e abertura de diálogos. Movimento reduzido remove as animações espaciais.

## Como o desenho vira um quarto

O estado continua sendo a lista de objetos existente. `projection.ts` transforma o centro, o tamanho e a rotação de cada peça em coordenadas do modelo 3D. Não existem dois documentos divergentes para manter sincronizados.

No desenho, X e Y são as coordenadas do piso. No modelo, X e Z ocupam esse piso e Y representa altura. Monitor, teclado, PC, luminária e planta recebem altura de bancada quando seu centro está sobre uma mesa. Essa verificação considera mesas giradas. Fora dela, a peça volta ao piso.

`models.ts` monta volumes por categoria, com materiais e detalhes próprios. O tamanho do móvel vem do documento e sua altura usa uma convenção por tipo. Esses modelos são estilizados, com mais presença e profundidade; não são produtos comerciais escaneados ou uma simulação arquitetônica. Objetos podem se sobrepor, como já era possível na planta. O quadro tem altura de exposição fixa e precisa ser posicionado junto à parede para parecer pendurado.

`RoomCanvas.tsx` administra o renderizador, câmera, luzes e controles. `RoomPreview.tsx` cuida das ações visíveis, carregamento e alternativa em planta caso o 3D esteja indisponível. A interface de propriedades e a lista continuam em HTML para teclado e leitores de tela.

## Decisões de desempenho e compatibilidade

O motor 3D é carregado em um arquivo separado, apenas quando a visualização aparece. O build local produz um módulo de aproximadamente 143 KB comprimidos para esse motor. O Vite informa que ele excede 500 KB sem compressão; o aviso não foi ocultado. A planta do editor e a biblioteca não precisam carregar o motor por conta própria.

A cena renderiza quando os objetos, a luz, a câmera ou o tamanho mudam. A animação da câmera dura 320 ms; não há loop permanente de rotação. A densidade de pixels é limitada a 1,7 para reduzir o trabalho gráfico em telas de alta densidade. Geometrias, materiais, texturas, controles, observadores e contexto gráfico são liberados ao sair da vista.

O PNG força uma renderização e copia os pixels imediatamente, antes de o navegador limpar o buffer WebGL. Isso evita baixar uma imagem vazia sem manter o buffer gráfico permanentemente em memória.

Os documentos continuam na versão 1. O aplicativo atual lê os setups e links anteriores. Cama e ambiente gamer passam pela mesma validação dos objetos existentes; uma versão antiga do aplicativo não reconhece esses novos valores. Luz e câmera são preferências de visualização temporárias. Não alteram o documento salvo nem a versão fixa de um link.

## Verificação

Lint, formatação, tipos e build passaram. Os 21 testes unitários passaram. Os 72 casos aplicáveis de navegação no Chromium passaram, com seis casos ignorados por serem específicos de outro tipo de dispositivo. Dois casos inicialmente tiveram erro ao gravar traces porque executei suites com a mesma pasta de saída; separei a saída dos testes de Pages e ambos passaram na repetição. Os dois testes do build para Pages também passaram.

Os novos testes verificam mudanças visíveis de câmera e cor, restauração da vista, preferência por movimento reduzido, persistência da cama, alternância de vistas, pixels reais no PNG e edição/salvamento sem suporte a WebGL. As screenshots da nova home e do editor foram revisadas em 1440 e 390 pixels, e o fluxo de falha gráfica em 320 pixels. Isso não equivale a testes em aparelhos físicos ou em todos os navegadores.

## Para aprender com esta entrega

1. Abra `projection.ts` e acompanhe como o centro de uma peça no desenho vira uma posição no piso 3D. Mude uma mesa para 90 graus e observe o monitor que está sobre ela.
2. Em `models.ts`, compare mesa e cadeira. As duas são grupos de formas, mas têm estruturas e materiais diferentes. Experimente alterar só a altura do encosto.
3. Compare o estado do editor com o estado da câmera. Mudar a câmera não deve entrar no histórico de móveis nem deixar o setup com alterações pendentes.
4. Observe a limpeza dos efeitos em `RoomCanvas.tsx`. React pode montar e desmontar componentes várias vezes; recursos gráficos precisam acompanhar esse ciclo.
5. Na página, troque para 3D, escolha outra luz e baixe PNG. Volte à planta e baixe novamente. O documento é o mesmo; a representação muda.

## Versionamento

Branch: `feat/immersive-room-design`, criada a partir da entrega anterior. Commits separados para modelos/dados, interface/visualização, testes/publicação e documentação. A main continua preservada. O workflow e o ambiente de Pages permitem publicar esta branch após as verificações.

## Publicação verificada

O [workflow desta entrega](https://github.com/samuelsce/RoomLab/actions/runs/37417938419) terminou com sucesso, incluindo validação, testes e publicação do código `f6f8034`. A [demo pública](https://samuelsce.github.io/RoomLab/) foi verificada com HTTP 200, quarto gamer 3D renderizado, compartilhamento aberto em uma sessão sem dados locais, cópia editável e recarregamento. Os commits posteriores de documentação não alteram a aplicação publicada.

Commits da implementação: `42d6532` (modelos e dados), `96d8497` (interface e renderização), `68c6636` (testes e publicação), `c665c16` (documentação) e `f6f8034` (revisão de materiais e títulos). A main permanece em `df622aa`.
