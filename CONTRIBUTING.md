# Contribuir com o RoomLab

O RoomLab é um projeto de portfólio em evolução. Para conhecer o escopo e evitar propor uma funcionalidade que já existe, consulte o [README](README.md) e a [arquitetura](docs/ARQUITETURA.md).

## Reportar um problema

Abra uma [issue](https://github.com/samuelsce/RoomLab/issues) com os passos para reproduzir, resultado esperado, resultado observado e navegador/dispositivo utilizados. Inclua uma captura quando o problema for visual. Se houver dados pessoais no nome ou no conteúdo do quarto, remova-os antes de compartilhar um backup ou link.

## Preparar uma mudança

1. Parta de `main` atualizada e crie uma branch, por exemplo `fix/touch-selection` ou `feat/new-object`.
2. Mantenha o escopo pequeno e commits por responsabilidade. Não inclua builds, dependências instaladas, credenciais ou dados do seu navegador.
3. Execute as verificações descritas no README. Ajuste os testes quando mudar regras ou comportamentos relevantes.
4. Para mudanças visuais, revise desktop e uma tela estreita, foco do teclado e movimento reduzido. Inclua antes/depois no pull request.
5. Descreva o problema, a mudança e a validação. Informe limitações conhecidas e alterações no formato de documentos.

## Cuidado com compatibilidade

- Novos tipos de objeto precisam de catálogo, desenho, limites, tamanho inicial e representação 3D coerentes.
- Documentos importados, salvos e compartilhados passam pelo parser. Não remova validações para aceitar entradas incompatíveis.
- Mudanças de formato precisam explicar como arquivos, links e setups anteriores serão tratados.
- Recursos gráficos e listeners precisam de limpeza ao desmontar.
- Preserve controles HTML e a alternativa em planta, mesmo quando o 3D for o destaque visual.

Os créditos e licenças das dependências estão em [CREDITOS.md](docs/CREDITOS.md). O código do projeto ainda não tem uma licença geral definida.
