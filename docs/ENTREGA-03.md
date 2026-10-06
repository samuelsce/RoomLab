# Terceira entrega: seus setups guardados

Branch: `feat/local-setups`, criada a partir de `feat/room-editor`. A main não foi alterada. Não foram adicionadas dependências.

## O que experimentar

1. Abra o editor, adicione peças e personalize o quarto.
2. Edite o campo Nome do setup e clique em Salvar.
3. Recarregue a página: o mesmo documento será reaberto.
4. Abra Meus setups para ver a miniatura, duplicar ou excluir com confirmação.
5. Exporte JSON como backup. Importe esse arquivo na biblioteca para criar uma cópia independente.
6. Baixe PNG para obter uma imagem da composição atual, sem seleção, grade ou medidas ilustrativas.

O nome pode ter até 60 caracteres. A biblioteca aceita 30 setups, cada um com até 100 objetos. O histórico de desfazer é mantido depois de salvar, mas não depois de recarregar. Zoom, seleção e painel aberto não são gravados.

## Direção visual

Mantivemos a bancada fria `#e8edf2`, papel `#ffffff`, tinta `#202b38`, azul `#2457d6`, madeira `#b78d60` e verde `#48705a`. Barlow serve os controles e Barlow Semi Condensed os títulos. A biblioteca usa miniaturas da própria cena, nomes alinhados à esquerda e ações abaixo do desenho. A composição do quarto continua sendo o elemento principal.

Na revisão, evitamos adicionar um painel genérico de estatísticas. Quantidade e data ajudam a reconhecer cada documento, sem decorar a página. O estado vazio usa o quarto sem móveis como convite para começar. Não adicionamos animações automáticas. A confirmação usa um diálogo nativo com foco no botão Cancelar e fechamento por Escape.

Capturas revisadas: editor desktop/mobile, biblioteca vazia e biblioteca com setup desktop/mobile. A largura de 320 pixels também foi testada com nome de 60 caracteres. Um erro de quebra no cabeçalho foi corrigido dando uma linha inteira ao nome no celular.

## Como os dados funcionam

`src/features/setups/storage.ts` concentra leitura, validação, gravação e exclusão. A chave `roomlab.setups.v1` contém JSON com `version: 1` e uma lista de documentos. Cada documento guarda ID, nome, composição inicial, objetos, datas e uma revisão única.

TypeScript ajuda enquanto escrevemos o programa, mas não garante que um arquivo importado seja válido. Por isso o parser recebe `unknown` e verifica versão, tipos, limites, IDs duplicados, números finitos, tipos do catálogo e cores hexadecimais. Reconstrói somente os campos reconhecidos e usa a geometria existente para ajustar peças aos limites do quarto.

Dados inválidos no armazenamento não são apagados nem substituídos automaticamente. A interface explica o erro e permite atualizar a lista após recuperação. Falhas de leitura, bloqueio ou falta de espaço não derrubam o editor nem mudam o indicador para salvo.

Antes de atualizar um documento, comparamos a revisão carregada pelo editor com a revisão atual do armazenamento. Se outra aba salvou ou excluiu esse setup, a gravação é recusada e Salvar cópia preserva a edição local. A biblioteca acompanha eventos de armazenamento de outras abas e verifica os dados ao voltar a ficar visível.

Essa comparação detecta conflitos sequenciais; localStorage não oferece uma transação entre ler e escrever. Duas gravações exatamente simultâneas ainda podem competir. Sincronização transacional precisa de outra solução.

## Estado da edição e navegação

`useSetupSave.ts` compara nome e objetos atuais com o último snapshot salvo. Desfazer até esse snapshot remove o aviso de alterações pendentes. Salvar atualiza o baseline sem apagar o histórico do editor.

Adotamos salvamento manual nesta entrega, revisando a proposta inicial de automático. Isso mantém uma ação explícita para atualizar o documento e um fluxo claro para resolver conflitos com Salvar cópia. Ainda não há rascunho automático: alterações não salvas podem ser perdidas.

O roteador foi convertido para a API de dados do React Router para usar `useBlocker`. Navegação interna, inclusive o botão Voltar do navegador, abre um diálogo quando há mudanças pendentes. O evento `beforeunload` é registrado somente enquanto há alterações. O aviso ao fechar ou recarregar depende do navegador e não é garantido em todos os cenários, especialmente no celular.

Após o primeiro salvamento, a URL recebe `?setup=<id>`. Uma chave de sessão no estado da navegação mantém a mesma instância do editor durante esse ajuste, preservando a seleção e o histórico. Ao recarregar ou abrir pela biblioteca, o documento é carregado do armazenamento.

## Backups e imagem

JSON exporta um documento da edição atual, mesmo antes de salvar. Importação aceita um documento válido de até 200.000 bytes e cria novos ID, revisão e datas, preservando o original. Um arquivo inválido deixa os setups existentes intactos. Isso permite transferir uma composição entre dispositivos por arquivo.

PNG usa uma segunda renderização estática do componente RoomScene, sem interação ou seleção. Serializamos o SVG, desenhamos em canvas e baixamos uma imagem de 1520 × 1220 pixels, mantendo a proporção do desenho. A composição usa formas locais, sem imagens externas. Exportar não salva alterações no navegador.

## Verificação

- 11 testes de lógica aprovados, incluindo persistência, versão inválida, dados inseguros, quota, limite da biblioteca e conflitos.
- 51 testes de navegador aprovados em Chromium desktop, tablet e celular. Seis combinações de testes específicos de toque ou desktop são ignoradas nos perfis não aplicáveis.
- Fluxos de salvar/recarregar, renomear, copiar, excluir/cancelar, navegação pendente, conflito entre abas, importação repetida, PNG, nome vazio e armazenamento bloqueado.
- Testes anteriores de movimento, resize, camadas, histórico, zoom e toque continuam passando.
- Build com checagem de tipos, ESLint e formatação verificados.
- PNG exportado inspecionado visualmente, além da verificação de assinatura, dimensões e tamanho do arquivo.

Os testes usam emulação de viewport e toque. Safari, Firefox e aparelhos físicos ainda não foram validados.

## Exercício para aprender

Exporte um setup, abra o JSON e localize `objects`. Mude uma cor hex válida e importe o arquivo. Depois tente uma cor inválida e veja a validação recusar o documento. Explique por que importar cria uma cópia em vez de atualizar o ID original e por que o arquivo não contém o histórico de desfazer.

Em uma entrevista, a decisão central é separar o documento persistente do estado temporário da interface e validar os dados na entrada. Salvar não é apenas chamar setItem: envolve falhas, versão, feedback e continuidade da edição.

## Limites e próxima entrega

Os dados pertencem ao navegador e à origem do site, incluindo protocolo, host e porta. A prévia local e uma futura demo hospedada terão bibliotecas diferentes. Limpar dados do site ou encerrar navegação privada pode remover os setups. JSON é o backup portátil desta versão.

Uma URL local com ID não é um link público. Compartilhamento real precisa de um serviço que receba e disponibilize snapshots a outro navegador. Essa será a próxima entrega, com estados de carregamento, erro e link inexistente.

Referências consultadas: [localStorage no MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), [beforeunload no MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event) e [useBlocker no React Router](https://reactrouter.com/api/hooks/useBlocker).
