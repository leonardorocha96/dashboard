# Dashboard Builder com Angular 16 e DevExtreme 23.2

Projeto exemplo que demonstra como montar dashboards personalizados com Angular 16 (Node 20) e os componentes do DevExtreme 23.2.
O usuário pode arrastar widgets de uma paleta, soltar no canvas, redimensionar, configurar dados e persistir o layout no `localStorage`.

## Pré-requisitos
- Node.js 20+
- npm 9+

## Instalação e execução
```bash
npm install
npm start
```

A aplicação ficará disponível em `http://localhost:4200`.

## Principais recursos
- Paleta lateral com widgets de gráficos (linha, barras, pizza e rosca) usando **DxDraggable**.
- Canvas interativo com **DxSortable** e **DxResizable** para arrastar, soltar e ajustar o tamanho dos gráficos.
- Cartões de widgets renderizados com **DxChart** e **DxPieChart**.
- Drawer de configuração com formulário reativo para editar título, fonte de dados, legenda e cores (com **DxButton** para ações).
- Persistência automática do layout via `localStorage` através do `LayoutService`.
- Dados mock centralizados no `DataService` com diferentes conjuntos para cada tipo de gráfico.
- Componentes com `ChangeDetectionStrategy.OnPush` e estilos em SCSS.

## Estrutura de pastas
```
src/app
├── app-routing.module.ts
├── app.component.{ts,html,scss}
├── app.module.ts
└── features
    └── dashboard-builder
        ├── dashboard-builder.component.{ts,html,scss}
        ├── dashboard-builder.module.ts
        ├── components
        │   ├── widget-card
        │   │   ├── widget-card.component.{ts,html,scss}
        │   ├── widget-config-drawer
        │   │   ├── widget-config-drawer.component.{ts,html,scss}
        │   └── widget-palette
        │       ├── widget-palette.component.{ts,html,scss}
        ├── models
        │   └── widget.model.ts
        └── services
            ├── data.service.ts
            └── layout.service.ts
```

## Personalização
- Para alterar os dados dos gráficos, edite `data.service.ts`.
- Para redefinir o layout salvo, utilize o botão **Resetar layout** no topo do canvas ou limpe o `localStorage` (chave `dashboard-builder-layout`).

## Scripts úteis
```bash
npm run build    # build de produção
npm test         # testes unitários (config padrão Angular)
```
