# Dashboard Builder

Aplicação Angular que materializa o construtor de dashboards solicitado, com layout inspirado no Looker Studio e identidade visual da plataforma Solução.

## Requisitos
- Node.js 20+
- npm 9+
- Angular CLI (opcional para rodar comandos `ng` globalmente)

## Como executar
```bash
npm install
npm start
```
O comando `npm start` inicia o servidor de desenvolvimento em `http://localhost:4200/`.

Para gerar uma build de produção utilize:
```bash
npm run build
```

## Estrutura de pastas
- `src/app` – componentes, serviços e modelos do construtor.
- `src/assets` – arquivos estáticos.
- `docs/dashboard-builder.md` – documentação conceitual original.

## Principais componentes
- `app.component` – shell principal com painel, canvas e inspector.
- `builder-state.service` – gerencia estado de páginas, componentes e fontes de dados.
- `component-library` – catálogo drag and drop de componentes.
- `canvas` – área de edição responsiva com suporte a drag-and-drop e prévias alimentadas por dados reais.
- `inspector` – formulário dinâmico para edição de propriedades.
- `data-source-drawer` – gestão de fontes de dados em overlay lateral.
- `preview-overlay` – pré-visualização em tela cheia com troca de página e dispositivo.
- `visualization-card` – componente reutilizável que renderiza KPIs, gráficos e tabelas via Apache ECharts.

## Dados operacionais e gráficos

- As fontes de dados iniciais (`ERP - Financeiro` e `CRM - Vendas`) são carregadas de `src/app/data/operational-datasets.ts` com coleções de vendas e finanças já higienizadas.
- A biblioteca [`ngx-echarts`](https://github.com/xieziyu/ngx-echarts) foi integrada para renderizar gráficos modernos e totalmente customizados (linhas, barras, pizza, cartões KPI e tabelas com barras de progresso).
- Cada componente do canvas e da pré-visualização consulta automaticamente o conjunto e as métricas selecionadas no inspector, garantindo que a fonte permaneça operacional.
- O inspector passou a sugerir coleções, métricas e dimensões válidas com base na fonte escolhida, evitando configurações inválidas.
