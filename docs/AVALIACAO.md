# Guia de avaliação técnica

Este guia oferece um caminho curto para conhecer o RoomLab como produto e aprofundar a leitura do código. [Abrir demo](https://samuelsce.github.io/RoomLab/).

## Experimentar o produto

| Ação | O que observar |
| --- | --- |
| Abrir um ambiente e alternar a luz | Profundidade, materiais e feedback visual dos controles |
| Selecionar uma peça no 3D por clique/toque | Destaque, propriedades e seleção da lista acompanham a mesma peça |
| Arrastar a câmera começando sobre um móvel | O gesto gira a vista sem selecionar a peça ou criar histórico |
| Trocar para planta e arrastar com zoom | Correspondência entre ponteiro, peça e limites do quarto |
| Girar/redimensionar perto de uma parede | Limites geométricos continuam válidos após a rotação |
| Desfazer um arrasto completo | Um gesto produz uma ação de histórico |
| Ativar Mover com equipamentos nas propriedades da mesa | Monitor, PC, teclado e luminária acompanham posição e rotação; o conjunto pode ser desfeito |
| Escolher tinta e piso em Personalizar ambiente | Duas vistas, histórico, salvamento e compartilhamento preservam os acabamentos |
| Adicionar por toque em uma tela estreita | O quarto permanece visível acima das propriedades, que têm rolagem própria |
| Abrir Compartilhar e pressionar Delete ou Ctrl+D | O diálogo mantém a composição e o histórico do quarto intactos |
| Usar Pular para o conteúdo ou Os ambientes | A seção recebe foco, sem trocar de rota ou perder o rascunho |
| Editar, salvar e recarregar | Retorna a última versão salva, com nome e composição preservados |
| Sair com edições pendentes | O aviso permite cancelar e continuar a edição |
| Compartilhar e abrir em outra sessão | A composição abre sem a biblioteca local do autor |
| Editar uma cópia do link | A cópia pode mudar; o snapshot compartilhado permanece igual |
| Baixar PNG nas duas vistas | O arquivo contém a composição renderizada na vista escolhida |

Ative a preferência de movimento reduzido no sistema ou no navegador e repita os controles de câmera. Experimente também a navegação com Tab e os controles de propriedades pelo teclado.

## Ler o código por responsabilidade

| Tema | Arquivos de entrada | Evidência nos testes |
| --- | --- | --- |
| Estado e histórico | [editorModel.ts](../src/features/editor/editorModel.ts), [useRoomEditor.ts](../src/features/editor/useRoomEditor.ts) | [editor-model.test.ts](../tests/editor-model.test.ts) |
| Agrupamento e acabamentos | [grouping.ts](../src/features/editor/grouping.ts), [surfaces.ts](../src/features/editor/surfaces.ts), [appearance.ts](../src/features/editor/appearance.ts) | [composition.test.ts](../tests/composition.test.ts), [composition.spec.ts](../tests/composition.spec.ts), [composition-touch.spec.ts](../tests/composition-touch.spec.ts), [finishes.test.ts](../tests/finishes.test.ts) |
| Ponteiro e transformações | [RoomScene.tsx](../src/features/editor/RoomScene.tsx), [geometry.ts](../src/features/editor/geometry.ts) | [editor.spec.ts](../tests/editor.spec.ts) |
| Foco, diálogos e painel compacto | [SectionLink.tsx](../src/components/SectionLink.tsx), [Editor.tsx](../src/pages/Editor.tsx) | [dialog-shortcuts.spec.ts](../tests/dialog-shortcuts.spec.ts), [touch.spec.ts](../tests/touch.spec.ts), [pages.spec.ts](../tests/pages.spec.ts) |
| Persistência e recuperação | [storage.ts](../src/features/setups/storage.ts), [useSetupSave.ts](../src/features/setups/useSetupSave.ts) | [storage.test.ts](../tests/storage.test.ts), [setups.spec.ts](../tests/setups.spec.ts) |
| Compartilhamento e validação | [document.ts](../src/features/sharing/document.ts), [codec.ts](../src/features/sharing/codec.ts) | [sharing.test.ts](../tests/sharing.test.ts), [sharing.spec.ts](../tests/sharing.spec.ts) |
| Representação 3D e recursos | [projection.ts](../src/features/room3d/projection.ts), [RoomCanvas.tsx](../src/features/room3d/RoomCanvas.tsx) | [projection.test.ts](../tests/projection.test.ts), [studio.spec.ts](../tests/studio.spec.ts) |
| Seleção direta no 3D | [selection.ts](../src/features/room3d/selection.ts), [RoomPreview.tsx](../src/features/room3d/RoomPreview.tsx) | [selection.test.ts](../tests/selection.test.ts), [selection.spec.ts](../tests/selection.spec.ts) |
| Build e publicação estática | [main.tsx](../src/main.tsx), [workflow](../.github/workflows/pages.yml) | [pages.spec.ts](../tests/pages.spec.ts), [check-live.mjs](../scripts/check-live.mjs) |

## Perguntas para explorar as decisões

- Por que o documento guarda coordenadas do desenho, e não posições de pixels no DOM?
- Como o estado transitório de um gesto evita dezenas de entradas de desfazer?
- Como a rotação da mesa preserva as posições relativas dos equipamentos e os limites do conjunto?
- Por que paredes e piso participam do histórico, enquanto luz e câmera ficam fora do documento?
- Por que zoom, câmera e seleção não pertencem ao documento salvo?
- Como o parser impede que um backup ou link inválido substitua dados existentes?
- O que a comparação de revisões entre abas detecta, e por que ela não equivale a uma transação?
- Como um site estático abre um setup de outra pessoa sem banco de dados?
- O que deve ser limpo quando um componente que utiliza WebGL é desmontado?
- Quais medidas seriam necessárias antes de afirmar que o 3D mantém desempenho em aparelhos mais modestos?

As respostas e os limites estão em [ARQUITETURA.md](ARQUITETURA.md). Use os testes e os arquivos apontados para verificar os comportamentos e explorar as decisões.
