# Exemplos de Páginas

A pasta contém layouts completos que podem ser importados via `BuilderApiService` ou carregados manualmente para testar o runtime.

## Metas e Vendas (`metas-vendas.json`)
- Barra de filtros com data inicial/final e vendedor.
- Cartão KPI, gráfico mensal e tabela de detalhes.
- Ações: clicar no KPI abre modal e o gráfico filtra a tabela.

## Cadastro de Produtos (`cadastro-produtos.json`)
- VIEW de Cadastro com suporte a CRUD.
- Duplo clique na linha abre modal de detalhes.
- Seleção aciona fluxo `createOrUpdate`.

## Relatório Formatado (`relatorio-formatado.json`)
- Cabeçalho estilizado e tabela SQL paginada.
- Botão de exportação utilizando `ExportService`.

Para importar, basta sobrescrever o layout atual no `BuilderApiService` ou estender a API mock.
