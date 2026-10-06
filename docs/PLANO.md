# Plano do RoomLab

## Produto e escopo

Construir um editor de quarto para quem quer experimentar a disposição e o estilo do próprio setup. O visitante deve conseguir entender o produto, adicionar uma mesa e personalizá-la sem cadastro ou tutorial obrigatório.

Proposta visual e pesquisa: [REFERENCIAS.md](REFERENCIAS.md). Processo de trabalho: [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md).

## Entregas

### 1. Fundação e protótipo visual

React + TypeScript + Vite; roteamento, estilos, lint e componentes básicos. Home, estrutura do editor e uma cena demonstrativa. Catálogo inicial com cerca de 12 objetos: mesas, cadeira, monitor, PC, teclado, luminária, planta, tapete, quadro e prateleira.

Critério de conclusão: home e editor compreensíveis em desktop e mobile; objetos legíveis; navegação por teclado; nenhuma ação apresentada como funcional quando ainda for apenas demonstração. Validar a direção 2D antes de construir as interações completas.

### 2. Editor funcional

Adicionar por clique/toque e arrasto; selecionar; mover; girar; redimensionar dentro de limites por tipo; mudar cores; duplicar; excluir; ordenar camadas. Grade opcional, zoom, ajuste da cena à tela e desfazer/refazer.

Critério de conclusão: montar uma cena com 20 objetos; transformações corretas com zoom; manter o quarto dentro dos limites; arrastar fora da área e soltar sem travar; um arrasto equivale a uma ação de histórico. Os campos de propriedades e a lista de objetos oferecem alternativas acessíveis ao canvas.

### 3. Persistência local

Salvar automaticamente, nomear setup, listar salvos, reabrir, importar/exportar JSON validado e exportar PNG. Cena inicial vazia e exemplos prontos. Indicadores “Salvando”, “Salvo neste navegador” e falha de salvamento.

Critério de conclusão: recarregar preserva a cena; dados inválidos não derrubam o aplicativo; falhas de armazenamento são comunicadas; exportação não inclui alças de seleção. Salvamento local não promete disponibilidade em outros dispositivos.

### 4. Compartilhamento real

Publicar snapshot imutável e abrir `/setup/:id` em modo de visualização. “Editar uma cópia” cria um documento independente. Tratar link inexistente, carregamento e indisponibilidade do serviço.

Um caminho curto como `/setup/a8f29` precisa de armazenamento acessível ao destinatário: localStorage não atende a esse requisito. Proposta: função de servidor com validação + banco gerenciado (Supabase é um candidato a avaliar nesta etapa). Limitar tamanho, quantidade de objetos e frequência de criação; manter segredos apenas no servidor. Sem login no escopo inicial, setups publicados serão acessíveis a quem tiver o link; avisar isso na publicação.

Critério de conclusão: abrir o link em outro navegador/dispositivo mostra o snapshot publicado; alterações locais posteriores não o modificam. URL e domínio finais dependem da hospedagem, sem promessa de disponibilidade de `roomlab.app`.

### 5. Acabamento e portfólio

Revisar acessibilidade, desempenho, estados vazios/erros e mobile. CI com lint, checagem de tipos, testes essenciais e build. README com screenshots, demo, decisões, limitações e instruções de execução; descrição de arquitetura e vídeo curto demonstrando o fluxo completo.

Critério de conclusão: fluxo principal testado em desktop e touch, sem erros no console; revisão visual dos estados principais; deploy validado; main protegida por checks e revisão no GitHub, conforme recursos disponíveis.

## Stack proposta e justificativas

| Ferramenta | Papel e motivo |
| --- | --- |
| [React + TypeScript + Vite](https://vite.dev/guide/) | Componentes, contratos de dados e ambiente de desenvolvimento |
| CSS com tokens e módulos | Identidade própria e estilos previsíveis |
| [react-konva / Konva](https://konvajs.org/docs/react/index.html) | Canvas 2D, eventos, camadas e transformações; validar em um pequeno protótipo |
| Zustand | Estado compartilhado do editor; confirmar API e versão ao instalar |
| [Motion](https://motion.dev/docs/react-gestures) | Transições da interface HTML e feedback de interação |
| React Router | Home, editor, biblioteca local e visualização compartilhada |
| Vitest + Testing Library + Playwright | Lógica de cena, controles acessíveis e fluxo principal |

Usar uma única solução de manipulação de objetos no canvas. Não adicionar uma segunda biblioteca de drag-and-drop sem uma necessidade comprovada. Registrar versões efetivamente instaladas no lockfile.

## Arquitetura inicial

Separar `features/editor`, `features/catalog`, `features/setups`, `components/ui` e `lib/storage`. Extrair geometria, validação e comandos para funções independentes do desenho. Evitar infraestrutura antes de surgir uma necessidade concreta.

Modelo de documento: `schemaVersion`, `id`, `name`, dimensões e cores do quarto, `objects`, `createdAt`, `updatedAt`. Cada objeto contém identificador, tipo de catálogo, posição em coordenadas do quarto, largura, altura, rotação, cores e ordem de camada. Tipos de catálogo podem declarar superfície permitida: chão, mesa ou parede.

Separar documento persistente de seleção, zoom, painéis abertos e gesto em andamento. Coordenadas do quarto não dependem da resolução da tela. Converter ponteiro para coordenadas locais considerando zoom e deslocamento.

Durante um gesto, atualizar a representação visual; ao concluir, gravar uma única alteração no histórico. Começar com histórico de snapshots limitado a 50 ações e medir custo. Limitar a cena inicialmente a 100 objetos. Mudanças de zoom/seleção não entram no histórico do documento.

SVGs ilustram os objetos, renderizados pelo canvas; manter propriedades e lista de objetos em HTML semântico. Acessibilidade não pode depender de o leitor de tela interpretar desenhos do canvas.

## Validação que demonstra competência

- Geometria: transformação com zoom, limites de objetos girados e tamanhos mínimos.
- Histórico: desfazer/refazer adicionar, transformar e excluir; gesto único; nova edição limpa refazer.
- Persistência: round-trip de documento e tratamento de versão/dados inválidos.
- Fluxo: adicionar mesa e monitor, personalizar, salvar, recarregar e compartilhar.
- Teclado: foco visível, seleção pela lista, mover com setas, excluir e sair de painéis; atalhos não interferem com inputs.
- Touch: adicionar por toque, arrastar sem rolar acidentalmente o editor; permitir rolagem normal fora dele.
- Movimento reduzido, contraste, rótulos e mensagens de salvamento acessíveis.

Antes de declarar desempenho, medir com uma cena de 50 objetos e registrar dispositivo/navegador. Meta inicial de arrasto fluido próxima de 60 fps no dispositivo de referência, sem garantia universal. Investigar renderizações desnecessárias quando houver evidência de lentidão.

## Fora do primeiro lançamento

3D real, colaboração simultânea, IA, checkout, orçamento de móveis, catálogo infinito, login obrigatório e editor arquitetônico de plantas. Podem ser avaliados depois de concluir o fluxo principal.

## Próxima etapa

A primeira entrega foi implementada em `feat/app-foundation`, com home, estrutura do editor, composições e catálogo. Ver [ENTREGA-01.md](ENTREGA-01.md). A validação visual foi feita por screenshots; a avaliação do autor do projeto pode orientar ajustes antes da próxima etapa.

A segunda entrega está implementada em `feat/room-editor`, com adição, manipulação, cores, camadas e histórico. Foram mantidos SVG nativo e `useReducer`, conforme a decisão e as limitações em [ENTREGA-02.md](ENTREGA-02.md).

Próximo passo: `feat/local-setups`, com persistência local, nomes, biblioteca de salvos e exportação. Links públicos serão implementados depois dessa etapa.
