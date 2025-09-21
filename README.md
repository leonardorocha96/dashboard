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
- `canvas` – área de edição responsiva com suporte a drag-and-drop.
- `inspector` – formulário dinâmico para edição de propriedades.
- `data-source-drawer` – gestão de fontes de dados em overlay lateral.
- `preview-overlay` – pré-visualização em tela cheia com troca de página e dispositivo.
