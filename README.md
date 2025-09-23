# Analytics Studio – Angular 16

Workspace Angular focado em Page Builder para dashboards e modo runtime.

## Tecnologias
- Angular 16 + RxJS
- CDK DragDrop para builder
- DevExtreme DataGrid e ng-apexcharts
- State reativo com `BehaviorSubject`
- CSS Grid responsivo e tipografia com `clamp()`

## Estrutura
```
src/app
├── app-routing.module.ts
├── modules
│   ├── builder
│   ├── runtime
│   ├── components-library
│   ├── filters
│   ├── views
│   └── actions
├── shared
│   ├── models
│   ├── services
│   ├── interceptors
│   └── shared.module.ts
└── app.component.*
```

## Executar
```bash
npm install
npm start
```
A aplicação fica disponível em `http://localhost:4200`. A rota padrão abre o Builder (`/builder/pages/default-page`). O runtime está em `/runtime/default-page`.

## Testes
```bash
npm test
```

## Exemplos
Três páginas completas estão disponíveis em `examples/`. Consulte `examples/README.md` para detalhes.

## Boas práticas & segurança
- Interceptores adicionam `Authorization` e `X-Tenant-ID`.
- `BuilderApiService` mantém whitelist de `queryId` para VIEW SQL.
- `ActionService` aplica rate-limit e integra com `AuditService`.
- `ExportService` sanitiza dados antes de gerar arquivos.

## AI Compose mock
O serviço `AiComposeService` consome `/ai/compose` (mock). Há método `mock()` para simular sugestões.
