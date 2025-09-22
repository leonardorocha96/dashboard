# Construtor de Dashboards Integrado à Plataforma

## Visão Geral
O construtor de dashboards deve replicar os conceitos centrais do Looker Studio (Google), mas traduzindo-os para a linguagem visual da plataforma Solução demonstrada na imagem fornecida. O objetivo é permitir que analistas e gestores montem painéis flexíveis, com múltiplas páginas e fontes de dados variadas, aproveitando a navegação superior, o menu lateral iconográfico e a identidade cromática já existente (azul-marinho predominante, ícones claros, cartões com cantos arredondados e leve sombra).

### Objetivos Principais
- Oferecer experiência de edição WYSIWYG com drag and drop.
- Permitir organização em projetos/pastas, páginas e seções.
- Habilitar criação e gerenciamento de fontes de dados reutilizáveis.
- Garantir responsividade multi-dispositivo (conceitos inspirados no Analytics Studio da Sankhya).
- Fornecer biblioteca rica de componentes (gráficos, tabelas, filtros, elementos visuais).

## Layout Geral do Construtor

| Região | Descrição |
| --- | --- |
| **Barra Superior (Header)** | Mantém o estilo já presente: fundo azul-marinho (#0D1B2A aprox.), logotipo à esquerda, breadcrumb central e ações à direita (Salvar, Publicar, Visualizar). Adiciona um seletor de "Projeto / Dashboard" e indicador de status (Rascunho, Publicado). |
| **Menu Lateral** | Reaproveita ícones existentes e adiciona novas seções: "Biblioteca de Componentes", "Fontes de Dados", "Modelos" e "Configurações". Ícones com estilo lineal branco sobre fundo azul, com tooltip ao passar o mouse. |
| **Painel Central (Canvas)** | Área de edição com fundo claro (#F5F7FA) e grid configurável (8px). Permite alternar entre visualizações Desktop, Tablet e Mobile (inspirado na aba Responsividade do Analytics Studio). |
| **Painel Lateral Direito (Inspector)** | Surge ao selecionar um componente. Tabs: Propriedades, Dados, Estilo e Interações. Utiliza cartões brancos com sombra suave, tipografia consistente com a plataforma. |

## Fluxos Essenciais

1. **Criação de Projeto**
   - Botão "Novo Dashboard" na home do módulo. Modal solicita nome, descrição, pasta/projeto e escolhe modelo em branco ou pré-configurado.
   - Ao confirmar, usuário é direcionado ao construtor com uma página em branco e grid ativado.

2. **Gestão de Páginas**
   - Sidebar horizontal abaixo do header exibe tabs de páginas (similar ao Looker Studio). Permite duplicar, reordenar, ocultar ou definir como inicial.
   - Suporta grupos de páginas para dashboards extensos.

3. **Inserção de Componentes**
   - Biblioteca apresenta blocos categorizados: Básicos (Texto, Imagem, Retângulo), Tabelas (Dinâmica, Resumo), Gráficos (Linha, Barra, Pizza, Séries temporais, Mapa), Filtros (Dropdown, Intervalo de datas, Segmentadores), Indicadores (KPI card, Gauge, Semáforo), Objetos avançados (Iframe, HTML customizado).
   - Elementos arrastáveis para o canvas. Snap inteligente ao grid e guias de alinhamento.

4. **Configuração de Dados**
   - Aba "Fontes de Dados" no menu lateral abre gerenciador sobreposto (drawer). Usuário adiciona conexões (Banco SQL, API REST, CSV, ERP Sankhya, Google Sheets). 
   - Cada fonte possui tela de autenticação, pré-visualização e definição de campos.
   - Permite criar Views combinando fontes via joins e fórmulas (semelhante a Data Blending do Looker Studio).

5. **Edição de Propriedades**
   - Painel direito com campos contextuais. Ex.: para um gráfico de barras: seleção de métricas, dimensões, filtros, estilo (cores, bordas, tipografia). 
   - Aba "Interações" permite criar ações de drill-down, navegar para outras páginas, aplicar filtros cruzados.

6. **Visualização e Publicação**
   - Botão "Visualizar" abre modo fullscreen sem ferramentas, mantendo header da plataforma.
   - No protótipo implementado, essa ação apresenta um overlay imersivo com troca de páginas e dispositivos, simulando a visão final do dashboard.
   - "Publicar" gera URL compartilhável interna, com controles de permissão (visualizador, editor, comentarista).

### Implementação atual (protótipo Angular)
- Fontes operacionais carregadas automaticamente (`ERP - Financeiro` e `CRM - Vendas`) com coleções de vendas e finanças mockadas em `src/app/data/operational-datasets.ts`.
- Cada componente renderiza dados reais no canvas e no modo preview por meio de um `VisualizationCard` alimentado pela biblioteca Apache ECharts (`ngx-echarts`).
- O inspector sugere coleções, métricas e dimensões válidas conforme a fonte escolhida, evitando combinações inválidas.
- KPIs exibem variação vs. período anterior com minigráficos, gráficos de linha/barras possuem tema customizado e tabelas destacam valores com barras de progresso.

## Regras de Responsividade
Inspirado nas diretrizes do Analytics Studio:
- Breakpoints principais: 1280px (desktop), 992px (tablet), 576px (mobile).
- Layout base utiliza grid fluido com rearranjo automático (componentes podem ter configurações específicas por breakpoint).
- Opção de "Auto Layout" para painéis: reorganiza componentes em colunas quando largura diminui.
- Visualização de prévias por dispositivo no topo do canvas (ícones Desktop/Tablet/Mobile).
- Propriedades responsivas: tamanhos percentuais, âncoras, comportamento de esconder/mostrar por dispositivo.

## Biblioteca de Componentes (Resumo)

| Categoria | Componentes |
| --- | --- |
| Indicadores | Cartão KPI, Cartão comparativo (variação vs período anterior), Indicador com faixa (min/máx). |
| Gráficos | Barras, Linhas, Área, Pizza/Donut, Coluna empilhada, Mapa de calor, Geográfico, Série temporal, Waterfall, Funil. |
| Tabelas | Tabela padrão, Tabela dinâmica (pivot), Tabela comparativa, Matriz. |
| Filtros | Dropdown, Multi-select, Intervalo de datas, Botões, Segmentador tipo chips. |
| Texto & Mídia | Texto rico, Títulos, Imagens, Ícones, Vídeo incorporado, Forma básica. |
| Avançados | Iframe, Código HTML, Parâmetro calculado, Botões de ação, Scorecard conectado a meta. |

## Gestão de Fontes de Dados
- **Catálogo Global**: painel dedicado (no menu lateral) para registrar, editar e versionar fontes.
- **Modelagem**: assistente de transformação com passos (Limpeza, Cálculo, Agrupamento). Suporta fórmulas semelhantes ao Looker Studio (funções agregadas, condicionais, manipulação de datas).
- **Agendamento**: definição de atualização (tempo real, sob demanda, agendado). Notificações de falha por e-mail/alerta in-app.
- **Governança**: permissões por perfil; logs de uso de cada fonte.

## Funcionalidades Adicionais
- **Histórico de versões**: timeline com restauração de estados anteriores.
- **Comentários in-line**: modo de comentários colaborativos (balões fixados a componentes).
- **Templates**: galeria com dashboards prontos (Financeiro, Comercial, Operacional) utilizando estética de cartões com sombras suaves, tipografia Montserrat/Roboto.
- **Tema visual**: paletas pré-definidas (Solução, Neutro, Dark) e opção de personalização.
- **Modo de Apresentação**: roda em fullscreen com navegação por setas, ocultando menus laterais.

## Diretrizes de UI e Identidade
- **Cores principais**: Azul-marinho (#0D1B2A), azul intermediário (#1B263B), cinza claro (#E0E6ED) e branco (#FFFFFF). Destaques em verde (#2EC4B6) para ações positivas e laranja (#FF9F1C) para alertas.
- **Tipografia**: Usar família sem serifa já aplicada (ex.: Montserrat). Títulos 18-24px, textos 14-16px.
- **Cartões**: Cantos arredondados (12px), sombra suave (0 4px 16px rgba(13, 27, 42, 0.08)).
- **Ícones**: estilo lineal preenchido, mantendo consistência com menu atual.
- **Feedbacks**: Toasts no canto superior direito (salvo com sucesso, erro de conexão).

## Jornadas de Usuário
1. **Analista monta dashboard do zero**: seleciona template em branco, conecta fonte ERP, adiciona gráficos, configura filtros e publica para diretoria.
2. **Gestor ajusta painel existente**: duplica página de vendas, altera métricas e salva como nova versão.
3. **Time financeiro cria modelo recorrente**: cadastra fonte de dados agendada, aplica transformações, salva como template reutilizável.

## Requisitos Técnicos (alto nível)
- Front-end em framework reativo (React/Vue) com suporte a canvas drag-and-drop (p. ex. GridLayout, InteractJS).
- Motor de dados com camada de abstração para múltiplos conectores (REST, SQL, arquivos, Sankhya).
- Armazenamento de metadados versionado (ex.: Firestore, Postgres) com JSON schema para layout.
- Camada de visualização baseada em biblioteca moderna (Apache ECharts via `ngx-echarts`) para customização profunda de estilos e interações.
- API de renderização para exportação (PDF, imagem) e incorporação em outras áreas da plataforma.

## Roadmap Inicial
1. **MVP**: criação de dashboards com componentes básicos, conexão a fontes internas, publicação interna.
2. **Iteração 2**: biblioteca ampliada, responsividade avançada, templates.
3. **Iteração 3**: colaboração em tempo real, comentários, controle granular de permissões.
4. **Iteração 4**: marketplace de componentes/templates, automações (alertas baseados em métricas).

