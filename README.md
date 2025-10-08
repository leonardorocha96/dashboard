# Dashboard Builder – Angular 16 + DevExtreme 23.2

Aplicação Angular 16 pronta para Node 20 que demonstra um construtor de dashboards com drag and drop
utilizando componentes DevExtreme 23.2.

## Tecnologias

- Angular 16
- Angular CDK (base do projeto)
- DevExtreme 23.2 (`dxChart`, `dxPieChart`, `dxDraggable`, `dxResizable`, `dxSortable`, `dxButton`)
- SCSS com `ChangeDetectionStrategy.OnPush`

## Funcionalidades

- Paleta lateral de widgets com gráficos pré-configurados (linha, colunas, pizza e rosca).
- Canvas com suporte a drag & drop, ordenação e redimensionamento dos widgets.
- Drawer de configuração para editar título, cores (paletas DevExtreme) e legenda.
- Geração de dados mock atualizável para cada widget.
- Persistência automática do layout no `localStorage`.

## Estrutura

```
src/app
├── app-routing.module.ts
├── app.component.*
├── app.module.ts
└── features
    └── dashboard-builder
        ├── dashboard-builder.component.ts/html/scss
        ├── dashboard-builder.models.ts
        ├── dashboard-builder.module.ts
        ├── components
        │   ├── widget-card
        │   ├── widget-config-drawer
        │   └── widget-palette
        └── services
            ├── data.service.ts
            └── layout.service.ts
```

## Executar localmente

Requisitos: Node.js 20.x e npm 9+.

```bash
npm install
npm start
```

A aplicação ficará disponível em `http://localhost:4200`.

## Scripts adicionais

- `npm run build` – gera o build de produção com `ng build`.
- `npm test` – executa os testes unitários (Karma + Jasmine).

## Persistência do layout

Os widgets adicionados ou configurados são serializados em `localStorage` (chave
`devextreme-dashboard-layout`). Para limpar o estado, clique em **Redefinir** ou remova manualmente o item do
`localStorage` pelo navegador.

## Mock de dados

O `DataService` fornece dados aleatórios para cada tipo de widget. Use o botão **Gerar dados** no drawer para
atualizar as séries sem recarregar a página.
