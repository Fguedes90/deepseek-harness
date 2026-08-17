# Catálogo de funcionalidades — ferramentas de chat/plataforma LLM

Levantamento de mercado consolidado em **2026-08-15**. 1242 funcionalidades atômicas
catalogadas em 12 domínios, varrendo produtos open source e proprietários.

Cada funcionalidade listada está atribuída a pelo menos um produto real que a possui.
Itens marcados `[INFERIDO]` não foram confirmados em fonte primária.

## Legenda

| Camada | Significado |
|---|---|
| `MESA` | Table stakes — a ausência é percebida como defeito |
| `DIFF` | Diferencial competitivo — motivo de escolha entre produtos |
| `FRONT` | Fronteira 2026 — poucos têm, define o topo do mercado |
| `MORTO` | Existiu, o mercado abandonou — registrado para não ser reconstruído |

| Custo | Esforço de implementação do zero |
|---|---|
| `S` | horas |
| `M` | dias |
| `L` | semanas |
| `XL` | meses |

## Sumário quantitativo

| Domínio | Código | Total | MESA | DIFF | FRONT | MORTO |
|---|---|---:|---:|---:|---:|---:|
| Conversa — núcleo da mensagem e sua UX | `CONV` | 103 | 33 | 48 | 21 | 1 |
| Modelos, provedores, parâmetros e economia | `MODEL` | 119 | 29 | 62 | 24 | 0 |
| Multimodal — visão, imagem, áudio, voz, arquivos, vídeo | `MODAL` | 87 | 29 | 40 | 17 | 1 |
| Conhecimento — retrieval, memória e conectores | `RAG` | 155 | 49 | 43 | 33 | 2 |
| Ferramentas, MCP, execução de código e agentes | `TOOL` | 98 | 28 | 51 | 17 | 2 |
| Artifacts, canvas e generative UI | `ART` | 90 | 22 | 43 | 25 | 0 |
| Prompts, personas, assistentes e marketplace | `PROMPT` | 83 | 30 | 37 | 16 | 0 |
| Multiusuário, auth, governança, compliance e billing | `ADMIN` | 115 | 35 | 53 | 20 | 1 |
| Extensibilidade, API pública, theming e deploy | `DEV` | 93 | 29 | 52 | 9 | 3 |
| Plataformas — web, desktop, mobile, extensão, CLI | `CLIENT` | 87 | 22 | 43 | 17 | 0 |
| Infraestrutura, confiabilidade e o encanamento invisível | `OPS` | 103 | 35 | 53 | 15 | 0 |
| Fronteira proprietária — o que os fechados têm | `CLOSED` | 109 | 20 | 52 | 37 | 0 |
| **Total** | | **1242** | **361** | **577** | **251** | **10** |

Distribuição de esforço: `S` 393 · `M` 506 · `L` 210 · `XL` 104

---

# 1. `CONV` — Conversa e UX da mensagem

Have enough grounding. Compiling the deliverable now.

## CONV — Núcleo da Conversa e UX

### 1. Ciclo da mensagem

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CONV-01|Streaming token-a-token|Renderiza a resposta incrementalmente via SSE/chunked conforme o modelo gera|universal|MESA|M|
|CONV-02|Parar geração|Botão "stop" cancela o stream em andamento, preservando o texto parcial|universal|MESA|S|
|CONV-03|Continuar resposta truncada|Botão "continue generating" retoma de onde parou (limite de tokens/corte)|ChatGPT, Claude.ai, Open WebUI, LibreChat|MESA|M|
|CONV-04|Regenerar resposta|Descarta a última resposta e gera outra com o mesmo prompt/modelo|universal|MESA|S|
|CONV-05|Regenerar com outro modelo|Regenera a resposta trocando o modelo, criando variante comparável|ChatGPT, LibreChat, Open WebUI, T3 Chat|DIFF|M|
|CONV-06|Editar mensagem do usuário|Permite reescrever um prompt já enviado, disparando novo turno|ChatGPT, Claude.ai, Gemini, LibreChat, Open WebUI|MESA|M|
|CONV-07|Editar resposta do assistente|Permite ao usuário corrigir/reescrever o texto da resposta gerada (não regenerar)|Open WebUI, LibreChat, LobeHub|DIFF|S|
|CONV-08|Deletar mensagem individual|Remove uma mensagem específica do histórico sem apagar a conversa inteira|universal|MESA|S|
|CONV-09|Copiar mensagem (texto/markdown)|Copia o conteúdo bruto ou renderizado para clipboard|universal|MESA|S|
|CONV-10|Citar trecho e responder (quote-reply)|Seleciona parte de uma mensagem e insere como citação no próximo prompt|Kagi Assistant, Notion AI, Msty|DIFF|M|
|CONV-11|Reações thumbs up/down|Feedback binário rápido por mensagem, usado para RLHF/telemetria|ChatGPT, Claude.ai, Gemini, Copilot, Poe|MESA|S|
|CONV-12|Feedback detalhado com categoria|Ao dar thumbs-down, abre formulário com motivo (impreciso, ofensivo, etc.)|ChatGPT, Gemini, Copilot|DIFF|S|
|CONV-13|Comentário/anotação em mensagem|Texto livre anexado a uma mensagem sem virar parte do prompt (nota pessoal)|Notion AI, Open Notebook|FRONT|M|
|CONV-14|Retry com backoff automático em erro de rede|Reenvia automaticamente a requisição do stream se a conexão cair|ChatGPT (app), Claude.ai|DIFF|M|
|CONV-15|Stream resumível pós-refresh|Recupera geração em andamento após reload de página/reconexão, sem reiniciar|T3 Chat, LibreChat (resumable streams)|FRONT|L|
|CONV-16|Envio com Enter vs Shift+Enter configurável|Alterna se Enter envia ou quebra linha|universal|MESA|S|
|CONV-17|Indicador de "digitando"/thinking antes do primeiro token|Mostra spinner/dots enquanto aguarda o primeiro token do modelo|universal|MESA|S|

### 2. Branching e versões

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CONV-18|Fork explícito de conversa em qualquer ponto|Menu de ação "Branch/Fork" cria nova conversa a partir de uma mensagem específica|ChatGPT, Open WebUI, LibreChat, Gemini (Deep Research forks)|DIFF|L|
|CONV-19|Branch implícito ao editar mensagem|Editar um prompt anterior cria ramo alternativo automaticamente, sem ação de "fork" dedicada|ChatGPT, Claude.ai, Kagi Assistant|MESA|M|
|CONV-20|Navegação entre versões irmãs (setas < / >)|Alterna entre respostas/branches alternativas geradas a partir do mesmo ponto|ChatGPT, Claude.ai, LibreChat, Open WebUI|MESA|M|
|CONV-21|Árvore de conversa visível/navegável|Visualização gráfica da estrutura de branches (não só setas lineares)|LibreChat (estrutura interna em árvore), ferramentas de terceiros para Claude (ClaudeKit)|FRONT|XL|
|CONV-22|Escopo de fork configurável (só caminho visível / com branches relacionados / tudo)|Ao forkar, escolhe quanto histórico/branches trafega para a nova conversa|LibreChat|FRONT|L|
|CONV-23|"Start fork here" (fork prospectivo)|Em vez de cortar no ponto selecionado, usa o ponto como origem e segue adiante|LibreChat|FRONT|M|
|CONV-24|Merge de branches|Combina duas linhas de conversa divergentes de volta em uma única thread coerente|nenhum produto mainstream nativo — apenas propostas/roadmap|MORTO|XL|
|CONV-25|Comparação lado a lado de respostas (mesmo prompt, modelos/branches diferentes)|Renderiza duas ou mais respostas concorrentes em colunas para julgamento direto|Poe (/compare), T3 Chat, Msty (split sync), LMSYS/Chatbot Arena (referência externa)|DIFF|L|
|CONV-26|Renomear/rotular branch individualmente|Dá nome à branch criada (em vez de "Branch 2")|ChatGPT|DIFF|S|
|CONV-27|Persistência de branch abandonada (não perder ramo ao trocar)|Garante que trocar de branch não descarta silenciosamente o ramo anterior no sidebar|LibreChat, Open WebUI|DIFF|M|

### 3. Organização

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CONV-28|Pastas de conversas|Agrupa chats em pastas arrastáveis na sidebar|Open WebUI, ChatGPT (projects como pasta), LobeHub, Chatbox|MESA|M|
|CONV-29|Tags/etiquetas livres|Marca conversas com palavras-chave arbitrárias, cross-cutting às pastas|Open WebUI, LibreChat, LobeHub|DIFF|S|
|CONV-30|Pin/fixar conversa|Fixa chats usados com frequência no topo da lista|ChatGPT, Open WebUI, Claude.ai, LobeHub|MESA|S|
|CONV-31|Arquivar conversa|Oculta chat da lista principal sem apagar, reversível|ChatGPT, Open WebUI, Claude.ai|MESA|S|
|CONV-32|Favoritos/estrela|Marcação separada de pin, para "melhores" conversas|Poe, Chatbox|DIFF|S|
|CONV-33|Projetos/workspaces de conversa|Container que agrupa chats + instruções de sistema + arquivos + conhecimento específico|ChatGPT (Projects), Claude.ai (Projects), Open WebUI (folders-as-projects), NotebookLM (notebooks)|DIFF|L|
|CONV-34|Cor/ícone customizado por pasta ou conversa|Personalização visual para reconhecimento rápido|LobeHub, Notion AI|FRONT|S|
|CONV-35|Ordenação de lista (recente, alfabética, manual)|Controla critério de ordenação da lista de conversas|Open WebUI, Chatbox, LibreChat|MESA|S|
|CONV-36|Bulk actions (seleção múltipla: apagar/arquivar/mover)|Aplica ação a várias conversas selecionadas de uma vez|ChatGPT, Open WebUI, Gemini|DIFF|M|
|CONV-37|Drag-and-drop entre pastas|Reorganiza conversas arrastando entre pastas na sidebar|Open WebUI, LobeHub|MESA|S|
|CONV-38|Duplicar conversa|Cria cópia independente de uma conversa existente para editar sem afetar original|Notion AI, Open WebUI|DIFF|S|

### 4. Histórico e busca

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CONV-39|Busca full-text em títulos e mensagens|Busca textual sobre todo o histórico de conversas|ChatGPT, Claude.ai, Open WebUI (Cmd+K), Gemini, LibreChat|MESA|M|
|CONV-40|Busca semântica sobre histórico|Recupera conversas por similaridade de significado, não só match literal|Khoj, Onyx, NotebookLM (indiretamente)|FRONT|L|
|CONV-41|Filtros de busca (modelo/data/tag)|Refina resultados de busca por metadados estruturados|Open WebUI (tag:), LibreChat, LobeHub|DIFF|M|
|CONV-42|Navegação por teclado na lista de resultados|Sobe/desce resultados de busca e no histórico sem mouse|Open WebUI, ChatGPT|DIFF|S|
|CONV-43|Scroll infinito no histórico de conversas|Carrega mais conversas antigas ao rolar, sem paginação explícita|ChatGPT, Claude.ai, maioria dos closed-source|MESA|S|
|CONV-44|Jump-to-message (dentro da conversa aberta)|Pula direto para uma mensagem específica a partir de busca ou índice|Claude.ai (chat search com contexto), Open WebUI|DIFF|M|
|CONV-45|Timeline/linha do tempo de atividade|Visualiza conversas agrupadas por data em vista cronológica dedicada|NotebookLM, Notion AI (histórico de página)|FRONT|M|
|CONV-46|Preview de trecho no resultado de busca|Mostra snippet do texto correspondente com highlight do termo buscado|ChatGPT, Open WebUI|DIFF|S|

### 5. Título e metadados

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CONV-47|Auto-título gerado por LLM|Chama o modelo (geralmente um menor/mais barato) para nomear a conversa após as primeiras mensagens|ChatGPT, Claude.ai, Open WebUI, LibreChat, todo closed-source|MESA|M|
|CONV-48|Renomear conversa manualmente|Edita o título gerado ou define um customizado|universal|MESA|S|
|CONV-49|Contagem de tokens por mensagem|Exibe tokens de input/output de cada turno individualmente|LM Studio, Open WebUI, LobeHub, AI Studio|DIFF|M|
|CONV-50|Custo estimado por mensagem/conversa|Calcula $ com base em tokens × preço do modelo usado|LibreChat, Msty (com API), OpenRouter (referência), Open WebUI (plugins)|DIFF|M|
|CONV-51|Badge de modelo usado por mensagem|Rotula visualmente qual modelo gerou aquela resposta específica (relevante com troca de modelo mid-thread)|ChatGPT, Poe, T3 Chat, Msty|DIFF|S|
|CONV-52|Timestamp por mensagem|Mostra hora/data de envio de cada mensagem (hover ou inline)|Open WebUI, Discord-like clients, Chatbox|MESA|S|
|CONV-53|Tempo de geração (latência total)|Mede e exibe quanto tempo levou para completar a resposta|LM Studio, Open WebUI, AI Studio|DIFF|S|
|CONV-54|Tokens por segundo (throughput)|Métrica de velocidade de geração exibida ao vivo ou pós-hoc|LM Studio, KoboldCpp, text-generation-webui, Open WebUI|DIFF|M|
|CONV-55|Metadados de parâmetros usados (temperature, top_p, etc.) por mensagem|Registra e exibe os parâmetros de sampling daquele turno específico|LM Studio, text-generation-webui, AI Studio|FRONT|M|

### 6. Compartilhamento e export

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CONV-56|Link público de conversa (read-only)|Gera URL compartilhável renderizando snapshot da conversa|ChatGPT, Claude.ai, Gemini, Grok, Perplexity, T3 Chat|MESA|M|
|CONV-57|Link com expiração/revogação|Compartilhamento com prazo de validade ou botão de revogar acesso|ChatGPT (unshare), Claude.ai|DIFF|S|
|CONV-58|Export para Markdown|Baixa a conversa como arquivo .md|Open WebUI, LibreChat, Chatbox, extensões (ChatGPT Exporter)|MESA|S|
|CONV-59|Export para JSON estruturado|Baixa histórico com metadados completos em JSON (para reimport/backup)|Open WebUI, LibreChat, ChatGPT (data export ZIP)|MESA|S|
|CONV-60|Export para PDF|Gera PDF formatado da conversa (nativo ou via print-to-PDF)|ChatGPT (via print), Notion AI, ferramentas terceiras (ChatGPT Exporter)|DIFF|M|
|CONV-61|Import de histórico de outro produto (ChatGPT export → X)|Faz parse do formato de export de outro chatbot e recria as conversas localmente|LibreChat (ChatGPT/Claude/ChatbotUI), Claude.ai (Import Memory de ChatGPT/Gemini/Copilot)|DIFF|L|
|CONV-62|Cópia/duplicação de conversa completa (não fork)|Clona a conversa inteira como novo item independente na lista|Open WebUI, Notion AI|DIFF|S|
|CONV-63|Embed de conversa em página externa (iframe/widget)|Insere uma conversa compartilhada renderizada dentro de outro site|Poe (compartilhamento embutido), Chainlit (embeddable widget)|FRONT|L|
|CONV-64|Export em massa de todo o histórico (bulk)|Solicita exportação de todas as conversas da conta de uma vez (data portability/GDPR)|ChatGPT, Claude.ai, Gemini (Google Takeout)|DIFF|M|

### 7. Modos de sessão

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CONV-65|Chat temporário/incógnito (não salvo, sem memória)|Sessão efêmera que não entra no histórico nem alimenta memória de longo prazo|ChatGPT (Temporary Chat), Claude.ai (Incognito), Gemini (Temporary Chats), DeepSeek|MESA|M|
|CONV-66|Modo focado/zen (esconde sidebar e chrome)|Interface minimalista que oculta navegação lateral para concentração na conversa atual|Notion AI, Msty, Cherry Studio|DIFF|S|
|CONV-67|Split view com duas conversas simultâneas|Painel dividido mostrando duas conversas distintas lado a lado, editáveis independentemente|Msty (split chat)|FRONT|L|
|CONV-68|Chat paralelo em múltiplos modelos com prompt sincronizado|Um único input dispara a mesma pergunta para N modelos simultaneamente, respostas em paralelo|Msty (split chat + sync), Poe (/compare, multi-bot), T3 Chat|FRONT|L|
|CONV-69|Modo "sync desligado" em split (inputs independentes)|Permite desacoplar os painéis do split para conversas totalmente distintas, não sincronizadas|Msty|FRONT|S|

### 8. Renderização

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CONV-70|Renderização Markdown completa|Interpreta headings, listas, negrito, blockquotes etc. na resposta|universal|MESA|M|
|CONV-71|LaTeX/KaTeX inline e em bloco|Renderiza fórmulas matemáticas via KaTeX/MathJax|ChatGPT, Claude.ai, Open WebUI, LobeHub, Gemini|MESA|M|
|CONV-72|Highlight de sintaxe de código com botão copiar|Colore blocos de código por linguagem e oferece cópia de um clique|universal|MESA|M|
|CONV-73|Renderização de tabelas Markdown|Converte sintaxe de tabela em tabela HTML estilizada|universal|MESA|S|
|CONV-74|Diagramas Mermaid renderizados inline|Detecta bloco ```mermaid e desenha o diagrama em vez de mostrar código bruto|Open WebUI, LobeHub, Cherry Studio, Claude.ai (via artifacts)|DIFF|M|
|CONV-75|Preview de link (rich embed/OG card)|Ao colar ou receber URL, mostra card com título/imagem/descrição da página|Perplexity, Notion AI, LobeHub|DIFF|M|
|CONV-76|Colapso de blocos de código/texto longos|Trunca automaticamente conteúdo extenso com botão "expandir"|ChatGPT, Claude.ai, Open WebUI|DIFF|S|
|CONV-77|Exibição colapsável de reasoning/thinking tokens|Mostra cadeia de raciocínio do modelo em seção recolhível, separada da resposta final|Claude.ai (extended thinking), ChatGPT (o-series), DeepSeek, Gemini (thinking), Grok|FRONT|L|
|CONV-78|Streaming de reasoning separado da resposta final|Transmite os tokens de raciocínio em tempo real, distinto do stream da resposta (2 fases visuais)|DeepSeek, Grok, ChatGPT, Open WebUI (com modelos reasoning)|FRONT|L|
|CONV-79|Badge/indicador de modelo com ícone|Mostra logo/nome do modelo ao lado de cada resposta na UI|Poe, T3 Chat, LobeHub, Msty|DIFF|S|
|CONV-80|Renderização de citações inline (referência numerada + hover)|Números/marcadores no texto ligam a fontes, com preview ao passar o mouse|Perplexity, ChatGPT (web search), Gemini, Kagi Assistant|DIFF|L|
|CONV-81|Renderização de HTML/SVG sandboxado inline|Executa/renderiza HTML ou SVG gerado diretamente no chat (fronteira com artifacts, mas versão simples inline)|Open WebUI, LobeHub|FRONT|M|

### 9. Composer/input

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CONV-82|Input multiline com auto-resize|Caixa de texto cresce verticalmente conforme o conteúdo|universal|MESA|S|
|CONV-83|Atalhos de composer (negrito, formatação rápida)|Markdown shortcuts (ex. **texto**) refletidos ao vivo no editor rich-text|LobeHub (Lobe Editor), Notion AI|DIFF|M|
|CONV-84|Upload via drag-and-drop|Arrasta arquivo/imagem direto para a área do composer|universal|MESA|S|
|CONV-85|Upload via paste (Ctrl+V de imagem/arquivo)|Cola screenshot ou arquivo do clipboard diretamente no input|ChatGPT, Claude.ai, Open WebUI, LobeHub|MESA|S|
|CONV-86|@-menção de modelo|Digitar @ abre menu para trocar/invocar modelo específico dentro do prompt|Poe, LibreChat|DIFF|M|
|CONV-87|@-menção de tool/agente|@ invoca uma ferramenta ou agente customizado especificamente naquele turno|Poe, Dify, LibreChat|DIFF|M|
|CONV-88|@-menção de arquivo/documento indexado|@ referencia arquivo já enviado/indexado sem re-upload|Cursor-like tools, Notion AI, AnythingLLM|DIFF|M|
|CONV-89|Slash commands|/ abre painel de comandos rápidos (templates, ferramentas, prompts salvos)|Poe (/compare), Cherry Studio, Dify, Chainlit|DIFF|M|
|CONV-90|Autocomplete de prompt/texto|Sugestão de continuação de texto enquanto o usuário digita no composer|Notion AI, GitHub Copilot Chat|FRONT|L|
|CONV-91|Rascunho persistido (draft)|Preserva texto não enviado no input ao navegar/fechar e voltar|ChatGPT, Claude.ai, Open WebUI|DIFF|S|
|CONV-92|Contador de tokens ao vivo no composer|Exibe estimativa de tokens do prompt sendo digitado, antes de enviar|LM Studio, AI Studio, LobeHub|DIFF|M|
|CONV-93|Histórico de prompts com seta ↑|Pressionar seta para cima recupera último(s) prompt(s) enviados, como terminal shell|LobeHub, T3 Chat|DIFF|S|
|CONV-94|Ditado por voz no input (speech-to-text)|Transcreve fala em texto diretamente no composer|ChatGPT (mobile/desktop), Gemini, Grok, Le Chat|DIFF|M|
|CONV-95|Envio agendado/scheduled|Programa envio de um prompt para horário futuro (tarefas recorrentes)|ChatGPT (Tasks)|FRONT|L|
|CONV-96|Restaurar mensagem anterior para o input ("edit as new")|Traz texto de uma mensagem já enviada de volta ao composer para reenvio ajustado|LobeHub|DIFF|S|

### 10. Atalhos e acessibilidade

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CONV-97|Mapa completo de atalhos de teclado (cheat sheet)|Painel de ajuda lista todos os atalhos disponíveis, geralmente via `?` ou Cmd+/|ChatGPT, Claude.ai, Cherry Studio, Notion AI|DIFF|M|
|CONV-98|Remapeamento de atalhos (customização)|Usuário redefine combinações de teclas por ação|Cherry Studio, LM Studio|FRONT|M|
|CONV-99|Command palette (Cmd+K) para navegação e ações|Busca universal de ações/conversas/configurações em painel único|Open WebUI, LobeHub, Notion AI, T3 Chat|DIFF|M|
|CONV-100|Navegação só por teclado (sem mouse) ponta a ponta|Todo fluxo (enviar, trocar conversa, abrir menu) alcançável via teclado|LobeHub, Open WebUI (parcial)|FRONT|L|
|CONV-101|Suporte a leitor de tela (ARIA labels, live regions)|Marca elementos semanticamente para NVDA/VoiceOver/JAWS, incl. anúncio de streaming|ChatGPT, Claude.ai (esforço declarado de compliance WCAG)|DIFF|L|
|CONV-102|Modo alto contraste|Tema de cores com contraste elevado para baixa visão|ChatGPT, Claude.ai, Gemini, Open WebUI (temas)|DIFF|S|
|CONV-103|Atalhos globais (funcionam com app minimizado)|Combinação de teclas ativa ação mesmo com a janela em background|Cherry Studio, Raycast-like integrations (LM Studio via OS)|FRONT|M|

**Total: 103 funcionalidades atômicas** (excede o mínimo de 70).

## Armadilhas

- **Branching mal modelado como lista, não árvore**: guardar `parent_id` só na última mensagem quebra quando duas edições concorrentes acontecem na mesma mensagem-pai — sem estrutura de árvore real (parent pointers em cada nó, não em "conversa"), navegação `<` `>` gera duplicatas ou perde ramos (bug real reportado no Kagi: "duplicate entries in branch picker").
- **Fork que copia texto em vez de referenciar histórico**: forking por cópia profunda de mensagens quebra em conversas longas (PR real no LibreChat: "forking a long conversation breaks chat structure"); prefira referência por ponteiro até o momento de materializar.
- **Streaming sem reconciliação de estado ao reconectar**: se o cliente não guarda um cursor/offset do stream, um refresh no meio da geração perde a resposta inteira — resumable streams exigem backend stateful (buffer server-side) além de UI otimista.
- **Editar mensagem sem versionamento explícito**: se "editar" sobrescreve em vez de criar branch, perde o histórico e quebra qualquer feature de comparação lateral depois.
- **Auto-título disparando 1 chamada de LLM por conversa nova sem debounce**: custo callback esquecido — sem cache/skip em conversas descartadas rapidamente, gera custo de API silencioso.
- **Export/import assumindo schema estável**: formatos de export do ChatGPT/Claude mudam entre versões sem aviso; parser de import quebra silenciosamente e perde mensagens (sempre validar contra schema versionado, não parsing otimista).
- **Contagem de tokens client-side aproximada**: usar heurística de 4 chars/token engana o usuário — tokenizer real (tiktoken/sentencepiece do modelo específico) é obrigatório se a claim é "contagem ao vivo".
- **Renderização de Markdown non-sandboxed**: markdown-it/remark sem sanitização permite XSS via HTML embutido na resposta do modelo — sempre sanitizar antes de `dangerouslySetInnerHTML`.
- **Colapsar reasoning sem persistir estado do usuário**: se todo reload reabre o "thinking" expandido, usuário releitura verbosidade 5-20x maior que a resposta útil — default deve ser collapsed e lembrado por sessão/global.
- **Compartilhamento público sem strip de PII/system prompt**: link público que vaza system prompt customizado ou anexos privados é o erro mais recorrente reportado por usuários (ChatGPT já teve indexação acidental de shares pelo Google).
- **Split view/multi-model sem isolamento de contexto**: sincronizar input entre painéis mas deixar histórico vazar entre modelos quebra comparação justa — cada painel precisa de contexto de mensagens independente.

## Ordem de construção

1. **Modelo de dados em árvore** (mensagens com `parent_id`, não lista linear) — tudo depende disso: branching, edição, regenerar, comparação.
2. **Ciclo de mensagem básico** (enviar → streaming → parar → regenerar) sobre esse modelo, com renderização Markdown/código já sanitizada.
3. **Editar/deletar mensagem** como caso especial de branching (edição = novo nó-filho do mesmo pai).
4. **Navegação entre versões irmãs** (setas `<` `>`) — trivial uma vez que a árvore existe.
5. **Título automático + metadados por mensagem** (tokens, custo, tempo) — pendura no mesmo pipeline de streaming, sem dependência de branching.
6. **Organização** (pastas/tags/pin/arquivo) — camada de metadados na conversa, independente do resto; pode entrar em paralelo com o passo 2.
7. **Busca full-text** sobre o que já existe salvo — depende de ter conversas persistidas (passo 2+6).
8. **Fork explícito + escopo de fork** — depende da árvore robusta (passo 1) e de UI de branch já estável (passo 4).
9. **Compartilhamento/export/import** — depende do modelo de dados estar congelado o suficiente para versionar o schema de export.
10. **Reasoning colapsável / streaming de thinking separado** — só depois do streaming básico (passo 2) suportar múltiplos content blocks por mensagem.
11. **Split view / multi-model paralelo / comparação lado a lado** — depende de composer e streaming já desacoplados por conversa (reusa passo 2 N vezes).
12. **Modos de sessão (temporário) e acessibilidade/atalhos** — camada final, cross-cutting, aplicada depois que o fluxo principal está estável (senão retrabalho constante).

## Fontes

- https://news.ycombinator.com/item?id=46394566
- https://knowledge.buka.sh/the-hidden-fork-how-editing-messages-in-chatgpt-lets-you-branch-conversations/
- https://tech.yahoo.com/ai/articles/chatgpt-just-quietly-rolled-game-082237765.html
- https://github.com/anthropics/claude-code/issues/59029
- https://nodea.ai/blog/branching-ai-chat-guide
- https://claudekit.app/blog/fork-claude-conversations
- https://support.claude.com/en/articles/12260368-use-incognito-chats
- https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context
- https://www.librechat.ai/docs/features/fork
- https://www.librechat.ai/docs/user_guides/fork
- https://deepwiki.com/LibreChat-AI/librechat.ai/3.6-message-forking
- https://github.com/danny-avila/LibreChat/pull/4777
- https://www.librechat.ai/docs/features/resumable_streams
- https://www.librechat.ai/docs/features/import_convos
- https://docs.openwebui.com/features/chat-conversations/chat-features/
- https://docs.openwebui.com/features/chat-conversations/chat-features/conversation-organization/
- https://zread.ai/open-webui/docs/5-chat-and-conversation-features
- https://docs.bswen.com/blog/2026-06-02-manage-chat-sessions/
- https://best-ai.org/tool/t3-chat
- https://feedback.t3.chat/p/branching-chats
- https://msty.ai/blog/split-chats/
- https://msty.ai/blog/multiverse-split-chats-conversations/
- https://docs.msty.ai/studio/conversations/split-chat
- https://tactiq.io/learn/export-chatgpt-conversation
- https://help.openai.com/en/articles/9106926-transfer-exported-conversations-between-chatgpt-accounts
- https://learn.chatgpt.com/docs/import
- https://www.pcworld.com/article/3076376/claude-can-now-import-chat-histories-from-chatgpt-and-other-ais.html
- https://poe.com/blog/multi-bot-chat-on-poe
- https://x.com/poe_platform/status/1961092249959505950
- https://poe.com/pages/demos/send-multiple-messages-at-the-same-time
- https://platform.claude.com/docs/en/build-with-claude/thinking
- https://platform.claude.com/docs/en/build-with-claude/extended-thinking
- https://beginnersinai.org/claude-extended-thinking-guide/
- https://docs.aws.amazon.com/bedrock/latest/userguide/claude-messages-extended-thinking.html
- https://lobehub.com/docs/usage/start
- https://lobehub.com/changelog
- https://docs.cherry-ai.com/docs/en-us/cherry-studio/preview/chat
- https://docs.cherry-ai.com/docs/en-us/pre-basic/settings/key-shortcut
- https://help.kagi.com/kagi/ai/assistant.html
- https://blog.kagi.com/assistant-for-all
- https://kagi.com/changelog
- https://blog.kagi.com/tips/kagi-lenses

---

# 2. `MODEL` — Modelos, provedores e economia

## 1. Provedores e Adaptação de API

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|MODEL-01|Adaptador por provedor nativo|Mapeia schema de request/response específico (Anthropic messages, Gemini contents, Bedrock invoke) para modelo interno único|LibreChat, Open WebUI, LobeHub, Big-AGI, Msty|MESA|L|
|MODEL-02|Endpoint OpenAI-compatible genérico|Um único cliente HTTP fala com qualquer backend que implemente `/v1/chat/completions`|Open WebUI, LibreChat, Chatbox, AnythingLLM, vLLM, LM Studio, Ollama (parcial), TGI|MESA|S|
|MODEL-03|Base URL customizada por provedor|Usuário aponta endpoint para proxy/self-host/gateway em vez do domínio oficial|universal (nas ferramentas OSS)|MESA|S|
|MODEL-04|Headers HTTP customizados por conexão|Injeta headers extra (org-id, auth alternativa, gateway key) em cada request|LibreChat, Open WebUI, OpenRouter (via SDK)|DIFF|S|
|MODEL-05|Suporte a proxy HTTP/SOCKS por provedor|Roteia chamadas de API através de proxy configurável, útil para regiões restritas|LibreChat, Open WebUI, text-generation-webui|DIFF|S|
|MODEL-06|Múltiplas contas do mesmo provedor|Permite mais de uma credencial/endpoint para o mesmo provedor simultaneamente (ex. 2 contas Azure)|LibreChat, Open WebUI|DIFF|M|
|MODEL-07|Suporte nativo Azure OpenAI (deployment vs model name)|Trata a indireção deployment-name↔model-name do Azure em vez do nome de modelo direto|LibreChat, Open WebUI, LangChain-based tools|MESA (para quem cobre enterprise)|M|
|MODEL-08|Suporte a AWS Bedrock (SigV4, cross-region inference profile)|Assina requests com credenciais AWS e resolve inference profile ARN em vez de model id simples|LibreChat, Open WebUI (via litellm), Bedrock console|DIFF|L|
|MODEL-09|Suporte a GCP Vertex AI (service account, projeto/região)|Autentica via service-account JSON e resolve projeto/região do modelo|LibreChat, Open WebUI (via litellm), Vertex Studio|DIFF|L|
|MODEL-10|Camada de agregação multi-provedor (LiteLLM-style)|Biblioteca única traduz +100 provedores para uma interface comum, usada como dependência interna|Open WebUI, LibreChat, RAGFlow|DIFF|M (se reusar lib) / XL (se reimplementar)|
|MODEL-11|OpenRouter como meta-provedor|Trata OpenRouter como um único provedor que já agrega dezenas de modelos/backends|Open WebUI, LibreChat, Msty, T3 Chat, Big-AGI, Chatbox|MESA|S|
|MODEL-12|Detecção automática de dialeto de API (OpenAI vs Ollama vs llama.cpp server)|Sonda o endpoint (`/v1/models`, `/api/tags`) para inferir qual protocolo o backend fala|Open WebUI, Jan, page-assist|DIFF|M|
|MODEL-13|Suporte a streaming SSE e non-stream por provedor|Alterna entre resposta em stream (chunked) e blocking conforme o que o provedor/endpoint aceita|universal|MESA|M|
|MODEL-14|Function/tool-calling schema translation entre provedores|Converte definição única de tool para o formato específico (OpenAI `tools`, Anthropic `tools`, Gemini `function_declarations`)|LibreChat, Open WebUI, LangChain/LiteLLM|DIFF|L|

## 2. Gestão de Credenciais

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|MODEL-15|Chave por instância (admin-only, compartilhada)|Uma chave de API configurada pelo admin, usada por todos os usuários|Open WebUI, LibreChat, Chatbox, KoboldCpp|MESA|S|
|MODEL-16|BYOK — chave por usuário|Cada usuário cola sua própria chave de API, armazenada e usada apenas para suas requisições|Open WebUI, LibreChat, Msty, T3 Chat, Poe, Big-AGI|MESA (para self-host)|M|
|MODEL-17|Chave por workspace/grupo|Credencial escopada a um workspace/team em vez de usuário individual ou instância inteira|LibreChat (grupos), Dify, Notion AI (workspace)|DIFF|M|
|MODEL-18|Chaves armazenadas em variável de ambiente|Configuração via `.env`/env vars lida no boot, sem persistência em banco|KoboldCpp, text-generation-webui, muitos self-host mínimos|MESA|S|
|MODEL-19|Chaves criptografadas em banco de dados|Persiste a chave cifrada (AES) em vez de plaintext, com chave mestra separada|Open WebUI, LibreChat, Dify|DIFF|M|
|MODEL-20|Vault externo (Hashicorp Vault, AWS Secrets Manager)|Delega custódia da chave a um secret manager externo em vez de armazenar localmente|Dify (enterprise), deployments enterprise de LibreChat/Open WebUI [INFERIDO via integrações comuns]|FRONT|L|
|MODEL-21|Validação de chave ao salvar (test call)|Faz uma chamada mínima (`/models` ou ping) para confirmar que a chave é válida antes de persistir|Open WebUI, LibreChat, LM Studio (remoto)|DIFF|S|
|MODEL-22|Rotação de chave com múltiplas chaves ativas|Mantém 2+ chaves para o mesmo provedor e alterna automaticamente (rate-limit spread)|OpenRouter (multi-key via usuário), LiteLLM proxy, Open WebUI (via litellm)|FRONT|M|
|MODEL-23|Mascaramento de chave na UI|Exibe só os últimos 4 caracteres da chave salva, nunca reexibe o valor completo|universal|MESA|S|
|MODEL-24|Limite de uso por chave (rate/budget cap)|Admin define teto de gasto ou requisições por chave individual|Open WebUI, LiteLLM proxy, OpenRouter (limites de conta)|DIFF|M|
|MODEL-25|Chave temporária/efêmera por sessão|Gera credencial de curta duração para uma sessão de front-end sem expor a chave real (ex. token efêmero de voz realtime da OpenAI)|ChatGPT (Realtime API), Claude.ai (server-side proxy)|FRONT|M|

## 3. Catálogo de Modelos

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|MODEL-26|Descoberta automática via `/v1/models` ou `/api/tags`|Consulta o endpoint do provedor para popular a lista de modelos disponíveis|Open WebUI, Jan, LM Studio, Ollama, page-assist, LobeHub|MESA|S|
|MODEL-27|Curadoria manual de lista de modelos permitidos|Admin habilita/desabilita modelos individualmente da lista descoberta, escondendo o resto|Open WebUI, LibreChat, Chatbox|MESA|S|
|MODEL-28|Apelido/alias de modelo|Renomeia o id técnico do modelo (`gpt-4o-2024-08-06`) para um nome amigável exibido ao usuário|LibreChat, Open WebUI, LM Studio|DIFF|S|
|MODEL-29|Agrupamento por família/provedor no seletor|Organiza o dropdown em seções (OpenAI, Anthropic, Local) em vez de lista plana|ChatGPT (picker), Claude.ai, Open WebUI, Big-AGI, T3 Chat|MESA|S|
|MODEL-30|Metadados de context window por modelo|Exibe/usa o tamanho máximo de contexto de cada modelo para truncamento e avisos|Open WebUI, LibreChat, OpenRouter, LiteLLM (model_prices_and_context_window.json)|MESA|S|
|MODEL-31|Metadados de preço por modelo (catálogo estático/atualizável)|Mantém tabela de preço por milhão de tokens de input/output/cache por modelo|OpenRouter, LiteLLM, Open WebUI (via litellm), LobeHub|DIFF|M|
|MODEL-32|Metadados de modalidades suportadas (texto/imagem/áudio/vídeo)|Marca quais inputs/outputs cada modelo aceita, usado para habilitar/desabilitar upload|OpenRouter, LobeHub, Open WebUI, Big-AGI|DIFF|M|
|MODEL-33|Metadados de suporte a tool-calling/structured output|Flag por modelo indicando se aceita function calling / JSON schema, usado para habilitar tools na UI|OpenRouter, LiteLLM, LibreChat|DIFF|M|
|MODEL-34|Ícone/badge do provedor no seletor|Mostra logo do provedor e badges ("novo", "reasoning", "vision") ao lado do nome do modelo|ChatGPT, Claude.ai, OpenRouter, LobeHub, T3 Chat|DIFF|S|
|MODEL-35|Favoritar/fixar modelos|Usuário marca modelos preferidos para topo da lista|LobeHub, Msty, Chatbox, Open WebUI|DIFF|S|
|MODEL-36|Ocultar modelos do seletor (por usuário)|Usuário esconde modelos que não usa sem afetar outros usuários|Open WebUI, LobeHub, T3 Chat|DIFF|S|
|MODEL-37|Ordenação customizável da lista de modelos|Reordena manualmente (drag) ou por critério (preço, recência) a lista exibida|LobeHub, Msty, Open WebUI|DIFF|S|
|MODEL-38|Busca/filtro no seletor de modelo|Campo de texto filtra por nome/família/capacidade dentro do picker|ChatGPT, Claude.ai, OpenRouter, Open WebUI, Big-AGI|MESA|S|
|MODEL-39|Modelo default por usuário|Cada usuário define seu modelo padrão para novas conversas, sobrepondo o default global|Open WebUI, LibreChat, LobeHub|MESA|S|
|MODEL-40|Modelo default por workspace/projeto|Define modelo padrão escopado a um workspace/projeto (ex. Claude Projects, Notion AI)|Claude.ai (Projects), Dify (app-level), LibreChat (Agents)|DIFF|M|
|MODEL-41|Preview/changelog de modelo novo|Notifica o usuário quando um modelo novo aparece no catálogo (banner "new")|ChatGPT, Claude.ai, Poe|DIFF|S|
|MODEL-42|Descontinuação/depreciação sinalizada no catálogo|Marca modelo antigo como deprecated com data de desligamento, sem removê-lo imediatamente|OpenAI (deprecations page), Azure OpenAI, Open WebUI (badge manual)|MESA|S|

## 4. Roteamento

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|MODEL-43|Fallback automático em erro/indisponibilidade|Se o provedor/modelo primário falha (5xx, timeout), reenvia a um modelo alternativo pré-configurado|OpenRouter, LibreChat, LiteLLM, Open WebUI (via litellm)|DIFF|M|
|MODEL-44|Retry com backoff exponencial|Reenvia requisição falha com espera crescente antes de desistir|OpenRouter, LiteLLM, quase todo SDK oficial (openai-python, anthropic-sdk)|MESA|S|
|MODEL-45|Load balancing entre múltiplas chaves do mesmo provedor|Distribui requisições entre N chaves para evitar rate-limit de uma única|LiteLLM proxy, OpenRouter (entre providers, não chaves do usuário)|DIFF|M|
|MODEL-46|Roteamento por preço ("floor"/cost-based)|Escolhe automaticamente o provedor mais barato disponível para o mesmo modelo|OpenRouter (`:floor`, price-weighted default), LiteLLM (routing_strategy=cost)|DIFF|M|
|MODEL-47|Roteamento por throughput/latência ("nitro")|Prioriza o provedor com maior taxa de tokens/s em vez do mais barato|OpenRouter (`:nitro`), LiteLLM (latency-based routing)|DIFF|M|
|MODEL-48|Load balancing com pesos ponderados (inverse-square por preço)|Distribui tráfego entre provedores saudáveis, favorecendo os baratos sem excluir os caros por completo|OpenRouter (default routing)|DIFF|M|
|MODEL-49|Roteamento com allow/ignore list de provedores|Usuário restringe quais provedores de backend podem servir um modelo (compliance, região, política de dados)|OpenRouter (`provider.only`/`provider.ignore`), Vertex (region pinning)|DIFF|M|
|MODEL-50|Modo "auto"/router de complexidade (modelo pequeno decide)|Um classificador (ou modelo leve) decide se a query precisa do modelo caro/thinking ou do rápido|ChatGPT (GPT-5 Auto), OpenRouter (Auto Router), HuggingChat Omni|FRONT|XL|
|MODEL-51|Roteamento semântico por tipo de tarefa|Classifica a intenção (código, criativo, matemática) e escolhe modelo especializado|OpenRouter Auto Router [INFERIDO parcial], HuggingChat Omni|FRONT|XL|
|MODEL-52|Roteamento por tamanho de contexto necessário|Escolhe variante do modelo com janela de contexto suficiente para o prompt (ex. long-context vs padrão)|Gemini (1.5 vs 2.0 context variants) [INFERIDO], LiteLLM (context-aware routing)|DIFF|M|
|MODEL-53|Failover cross-region (mesmo provedor, outra região)|Reenvia para outra região do mesmo provedor cloud em caso de outage regional|AWS Bedrock (cross-region inference profiles), Vertex AI (multi-region)|DIFF|L|
|MODEL-54|Circuit breaker por provedor|Marca provedor como "unhealthy" temporariamente após falhas repetidas e para de rotear a ele|OpenRouter (30s outage check), LiteLLM proxy|DIFF|M|

## 5. Parâmetros de Inferência

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|MODEL-55|Temperature ajustável na UI|Slider/campo numérico expõe o parâmetro de aleatoriedade da amostragem|universal|MESA|S|
|MODEL-56|Top-p (nucleus sampling)|Expõe parâmetro de corte por probabilidade cumulativa|Open WebUI, LibreChat, LM Studio, text-generation-webui, KoboldCpp|MESA|S|
|MODEL-57|Top-k|Expõe parâmetro de corte por N tokens mais prováveis (não suportado por todo provedor cloud)|LM Studio, KoboldCpp, text-generation-webui, Ollama|DIFF|S|
|MODEL-58|Min-p sampling|Expõe corte de probabilidade mínima relativa ao token mais provável (comum em backends locais)|KoboldCpp, text-generation-webui, LM Studio, llama.cpp|DIFF|S|
|MODEL-59|Frequency/presence penalty|Expõe penalidades de repetição de token (frequência e presença)|Open WebUI, LibreChat, LM Studio, OpenAI API|MESA|S|
|MODEL-60|Repetition penalty (estilo llama.cpp)|Penalidade multiplicativa alternativa às de frequency/presence, comum em backends GGUF|KoboldCpp, text-generation-webui, LM Studio, Ollama|DIFF|S|
|MODEL-61|Seed determinístico|Fixa a semente do gerador para reprodutibilidade da amostragem|LM Studio, text-generation-webui, OpenAI API (`seed`), KoboldCpp|DIFF|S|
|MODEL-62|Stop sequences customizadas|Define strings que encerram a geração ao serem produzidas|universal|MESA|S|
|MODEL-63|Max tokens de saída|Limita o tamanho máximo da resposta gerada|universal|MESA|S|
|MODEL-64|Logit bias|Ajusta probabilidade de tokens específicos via mapa token-id→bias|OpenAI API, text-generation-webui, KoboldCpp|FRONT|M|
|MODEL-65|JSON mode / structured output com JSON Schema|Força a saída a validar contra um schema declarado, com garantia de parsing|OpenAI (Structured Outputs), Anthropic (tool-forced JSON), Google (`responseSchema`), Mistral, Ollama (`format: json`)|DIFF|M|
|MODEL-66|Tool choice forçado/auto/none|Controla se o modelo é obrigado a chamar uma tool, pode escolher, ou está proibido de chamar|OpenAI API, Anthropic API, LibreChat, Dify|DIFF|S|
|MODEL-67|Reasoning effort (low/medium/high)|Seletor de esforço de raciocínio para modelos reasoning, trocando latência/custo por qualidade|OpenAI (o-series, GPT-5), ChatGPT UI, Open WebUI (passthrough), LibreChat|FRONT|M|
|MODEL-68|Thinking budget / extended thinking tokens|Define orçamento explícito de tokens de raciocínio interno ("thinking") antes da resposta final|Claude (extended thinking budget_tokens), Gemini (thinkingBudget), Claude.ai UI toggle|FRONT|M|
|MODEL-69|Verbosity control|Parâmetro dedicado que ajusta o tamanho/prolixidade da resposta independente de max_tokens|OpenAI (GPT-5 `verbosity`)|FRONT|S|
|MODEL-70|Safety settings por categoria (threshold de bloqueio)|Ajusta granularmente o filtro de conteúdo por categoria (violência, ódio, etc.)|Google Gemini/AI Studio (`safetySettings`), AWS Bedrock Guardrails|DIFF|M|
|MODEL-71|Presets salvos de parâmetros|Usuário salva/nomeia combinações de parâmetros para reaplicar depois (ex. "criativo", "preciso")|Open WebUI (model presets), LibreChat (presets), SillyTavern-adjacent tools, LM Studio|DIFF|M|
|MODEL-72|Parâmetros por modelo vs override global|Permite configurar parâmetro default por modelo individualmente, com override manual por conversa|Open WebUI, LibreChat, text-generation-webui|DIFF|M|
|MODEL-73|Exposição condicional de parâmetros por capability do modelo|Esconde/desabilita controles que o modelo selecionado não suporta (ex. temperature em modelo reasoning-only)|ChatGPT, Claude.ai, Open WebUI (parcial)|DIFF|M|

## 6. Gestão de Contexto

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|MODEL-74|Indicador visual de uso da janela de contexto|Barra/contador mostra quantos tokens já foram usados vs limite do modelo|Claude.ai, Cursor-like tools, LibreChat, LM Studio, Msty|MESA|S|
|MODEL-75|Aviso de estouro de contexto iminente|Alerta o usuário antes de a próxima mensagem ultrapassar o limite|Claude.ai, Open WebUI (parcial), LibreChat|DIFF|S|
|MODEL-76|Truncamento automático do histórico (drop mais antigo)|Remove mensagens mais antigas do payload enviado quando excede o limite, sem apagar do histórico salvo|Open WebUI, LibreChat, Ollama (via `num_ctx` truncation), Big-AGI|MESA|M|
|MODEL-77|Sliding window de mensagens recentes|Mantém sempre as últimas N mensagens/tokens no contexto, descartando o resto de forma previsível|LibreChat, text-generation-webui, KoboldCpp|DIFF|M|
|MODEL-78|Sumarização automática de histórico antigo|Substitui mensagens antigas por um resumo gerado pelo próprio modelo para economizar tokens|LibreChat (conversation summary), AutoGPT-style agents, Khoj [INFERIDO parcial]|FRONT|L|
|MODEL-79|Seleção manual de quais mensagens entram no contexto|Usuário marca/desmarca mensagens individuais da conversa a incluir na próxima chamada|Big-AGI, ChatGPT (edit/branch parcial), ChatGPT (memory toggle por mensagem)|FRONT|M|
|MODEL-80|Prompt caching explícito (cache_control breakpoints)|Usuário/app marca blocos do prompt como cacheáveis para reduzir custo/latência em chamadas repetidas|Anthropic API, Claude.ai (implícito), LibreChat (Anthropic caching), OpenRouter (passthrough)|FRONT|M|
|MODEL-81|Prompt caching automático (sem marcação)|Cacheia automaticamente o prefixo comum de prompts longos sem exigir configuração|OpenAI API (>1024 tokens), DeepSeek API, Google Gemini (implicit caching)|DIFF|S (consumidor) / M (implementar servidor)|
|MODEL-82|Cache hit/miss reporting no uso|Expõe nos metadados da resposta quantos tokens vieram de cache vs cache miss vs cache write|Anthropic (`cache_read_input_tokens`), OpenAI (`cached_tokens`), DeepSeek (`prompt_cache_hit_tokens`)|DIFF|S|
|MODEL-83|Cache TTL configurável (5min vs 1h)|Permite escolher tempo de vida do cache de prompt (ex. sessão longa vs curta)|Anthropic API (`ttl: 1h`)|FRONT|S|
|MODEL-84|Cache key manual para roteamento de cache|Permite fixar uma chave (`prompt_cache_key`) para forçar reuso de cache entre requisições do mesmo fluxo|OpenAI API|DIFF|S|
|MODEL-85|Compressão de contexto (compactação semântica, não sumarização textual)|Reduz tokens do histórico via técnica de compressão (ex. remoção de redundância, embeddings) preservando semântica|[INFERIDO — pesquisa/ferramentas experimentais tipo LLMLingua; não confirmado em produto de chat mainstream]|FRONT|XL|
|MODEL-86|Cache warming/pré-aquecimento de contexto do sistema|Envia prefixo fixo (system prompt/tools) antecipadamente para garantir cache hit na primeira mensagem real|Anthropic (padrão de uso recomendado), LibreChat (system prompt caching)|DIFF|S|

## 7. Custo e Uso

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|MODEL-87|Contagem de tokens com tokenizer correto por modelo|Usa o tokenizer específico (tiktoken, SentencePiece, etc.) em vez de estimativa genérica de caracteres|Open WebUI, LibreChat, LM Studio, OpenRouter|MESA|M|
|MODEL-88|Custo estimado pré-envio|Calcula e exibe custo previsto da mensagem antes de enviar, baseado em tokens de input estimados|LibreChat, OpenRouter (playground), Msty|DIFF|M|
|MODEL-89|Custo real pós-resposta|Exibe custo exato calculado a partir do `usage` retornado pela API após a resposta|OpenRouter, LibreChat, Open WebUI (via litellm), Msty|DIFF|S|
|MODEL-90|Acumulado de custo por conversa|Soma o custo de todas as trocas de uma conversa e exibe total corrente|LibreChat, OpenRouter, Msty|DIFF|M|
|MODEL-91|Acumulado de custo por usuário/período|Agrega uso e gasto por usuário em janelas de tempo (dia/mês) para dashboards de admin|Open WebUI (admin usage), LibreChat, Dify|DIFF|M|
|MODEL-92|Orçamento/limite de gasto configurável|Admin define teto de gasto por usuário/workspace/instância, bloqueando uso acima dele|LiteLLM proxy (budgets), Open WebUI (via litellm), OpenRouter (conta)|DIFF|M|
|MODEL-93|Alerta de proximidade de limite/orçamento|Notifica usuário/admin quando o uso se aproxima do teto configurado|LiteLLM proxy (alerts), OpenRouter (spend alerts)|DIFF|S|
|MODEL-94|Tabela de preços atualizada automaticamente|Sincroniza preços por modelo de uma fonte externa em vez de hardcode manual desatualizado|LiteLLM (`model_prices_and_context_window.json`), OpenRouter (API `/models` com pricing)|DIFF|M|
|MODEL-95|Cache local de preços com fallback|Mantém cópia local da tabela de preços para funcionar offline/degradado se a fonte remota falhar|LiteLLM, Open WebUI (via litellm)|DIFF|S|
|MODEL-96|Exportação de relatório de uso/custo|Gera CSV/relatório de uso e gasto para reconciliação externa|Open WebUI (admin), LibreChat, OpenRouter (activity export)|DIFF|M|
|MODEL-97|Diferenciação de custo cache write vs cache read vs miss no cálculo|Aplica multiplicadores distintos (ex. 1.25x write, 0.1x read) no cálculo de custo em vez de preço único de input|Anthropic-aware tools (LibreChat, LiteLLM), OpenRouter|FRONT|M|

## 8. Modelos Locais

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|MODEL-98|Download de modelo pela UI (catálogo integrado)|Busca e baixa modelo (GGUF/MLX) direto de um catálogo (HF, Ollama library) sem sair do app|LM Studio, Jan, Ollama (`ollama pull` + UIs que o envolvem), GPT4All|MESA (para apps locais)|M|
|MODEL-99|Barra de progresso e resumo de download|Mostra progresso, velocidade e permite pausar/retomar o download do peso do modelo|LM Studio, Jan, Ollama|MESA|S|
|MODEL-100|Gestão de variantes de quantização (GGUF Q4/Q5/Q8, AWQ, MLX)|Lista e permite escolher entre quantizações diferentes do mesmo modelo antes/depois do download|LM Studio, KoboldCpp, text-generation-webui, MLX (via LM Studio/mlx-lm)|DIFF|M|
|MODEL-101|Sugestão de quantização por RAM/VRAM disponível|Recomenda automaticamente qual quantização cabe no hardware detectado do usuário|LM Studio|FRONT|L|
|MODEL-102|Detecção automática de hardware (GPU, VRAM, RAM)|Identifica GPU/CPU/memória disponível para dimensionar carregamento do modelo|LM Studio, Jan, Ollama (auto GPU detect)|DIFF|M|
|MODEL-103|Controle de GPU offload / n_gpu_layers|Slider/campo define quantas camadas do modelo rodam na GPU vs CPU|LM Studio, KoboldCpp, text-generation-webui, llama.cpp server|MESA (para apps locais)|M|
|MODEL-104|Configuração de n_ctx (janela de contexto do modelo carregado)|Define o tamanho de contexto alocado em KV-cache ao carregar o modelo, trade-off memória vs alcance|LM Studio, KoboldCpp, text-generation-webui, Ollama (`num_ctx`)|MESA|S|
|MODEL-105|Split multi-GPU (tensor/layer splitting)|Distribui camadas ou tensores do modelo entre múltiplas GPUs físicas|LM Studio, text-generation-webui, llama.cpp (`--tensor-split`), vLLM (tensor parallel)|DIFF|L|
|MODEL-106|Hot-swap de modelo carregado|Troca o modelo ativo sem reiniciar o processo servidor|LM Studio, Ollama, KoboldCpp|MESA|M|
|MODEL-107|Descarregar modelo da memória (unload)|Libera VRAM/RAM explicitamente sem encerrar a aplicação|LM Studio, Ollama (`keep_alive: 0`), text-generation-webui|MESA|S|
|MODEL-108|TTL de auto-unload por inatividade|Descarrega modelo automaticamente após N minutos sem uso|Ollama (`keep_alive`), LM Studio (TTL)|DIFF|S|
|MODEL-109|Múltiplos modelos carregados simultaneamente|Mantém 2+ modelos residentes em memória ao mesmo tempo, servindo requisições distintas|LM Studio, Ollama (multi-model concurrentemente), vLLM (multi-model server)|DIFF|M|
|MODEL-110|Estimativa de uso de memória antes de carregar|Calcula RAM/VRAM necessária para um modelo+quantização+contexto antes do load, sem carregar de fato|LM Studio (`lms load --estimate`)|FRONT|M|
|MODEL-111|Modo servidor local expondo API OpenAI-compatible|Expõe o modelo local carregado como endpoint HTTP compatível para outras ferramentas consumirem|LM Studio, Ollama, KoboldCpp, text-generation-webui, vLLM, TGI|MESA|M|
|MODEL-112|Batch size / paralelismo de requisições configurável|Ajusta quantas sequências são processadas em paralelo no servidor local, afetando throughput|vLLM, TGI, llama.cpp server, text-generation-webui|DIFF|M|

## 9. Comparação de Modelos

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|MODEL-113|Envio do mesmo prompt a N modelos em paralelo|Dispara a mesma pergunta simultaneamente para vários modelos e mostra respostas lado a lado|Big-AGI (Beam), Poe (multi-bot), LibreChat (parcial), Msty (split chat), T3 Chat|FRONT|M|
|MODEL-114|Layout lado-a-lado (split view) de respostas|Renderiza as respostas de múltiplos modelos em colunas comparáveis visualmente|Big-AGI, Msty, Poe|FRONT|M|
|MODEL-115|Merge/síntese automática de respostas ("Beam")|Um modelo adicional funde/sintetiza as N respostas em uma resposta final consolidada|Big-AGI (Beam merge/fuse), LLM Council-style tools|FRONT|L|
|MODEL-116|Modo guiado de merge (usuário escolhe trechos a combinar)|Interface interativa onde o usuário seleciona partes de diferentes respostas para compor a final|Big-AGI (Beam "Guided" merge)|FRONT|L|
|MODEL-117|Arena/votação entre respostas anônimas|Apresenta duas respostas sem revelar o modelo e pede voto do usuário sobre qual é melhor|LMSYS Chatbot Arena (produto adjacente, não chat-tool per se) [INFERIDO — não é feature nativa de nenhuma ferramenta de chat listada, é produto separado]|FRONT|L|
|MODEL-118|Diff textual entre respostas de modelos distintos|Destaca diferenças palavra-a-palavra/estrutura entre duas respostas geradas para o mesmo prompt|[INFERIDO — nenhuma ferramenta da lista confirma diff textual nativo; Big-AGI mostra lado a lado mas não diff highlighted]|FRONT|M|
|MODEL-119|Ranking histórico de performance por modelo (Elo-like)|Acumula resultado das comparações/votos do usuário para ranquear modelos ao longo do tempo|[INFERIDO — não confirmado em produto de chat consumer; comum apenas em plataformas de benchmark dedicadas]|FRONT|L|

---

## Armadilhas

- **Tokenizer errado por modelo**: usar tiktoken para tudo super/subestima tokens de modelos não-OpenAI (Claude, Gemini, Llama usam tokenizers diferentes) — custo estimado e truncamento ficam errados silenciosamente.
- **Prompt caching quebra ao reordenar mensagens**: cache é por prefixo exato; injetar timestamp, contexto dinâmico ou reordenar system/tools no início do prompt invalida o cache a cada chamada sem aviso.
- **Context window ≠ max_output_tokens**: confundir os dois leva a truncamento incorreto ou erro de API; cada provedor define de forma diferente (alguns contam input+output no mesmo teto, outros separam).
- **Fallback silencioso mascara degradação de qualidade**: rotear para modelo mais barato/rápido em erro sem avisar o usuário produz respostas piores sem rastro do porquê.
- **Parâmetros não suportados por modelo causam erro 400 silencioso ou ignorado**: enviar `top_k` para OpenAI, ou `temperature` para modelo reasoning-only, sem checar capability table primeiro.
- **Preço hardcoded fica obsoleto em semanas**: provedores mudam preço com frequência (ex. subida de preço DeepSeek); tabela estática sem sync vira fonte de erro de billing.
- **Estimativa de VRAM ignora KV-cache**: dimensionar só pelos pesos do modelo sem contar o cache de contexto (n_ctx grande) causa OOM em runtime mesmo com "cálculo" prévio aprovado.
- **Roteamento por custo pode violar residência de dados**: escolher provedor mais barato automaticamente pode mandar dados para região/empresa fora de compliance exigido.
- **Retry ingênuo em erro 429 sem respeitar `Retry-After`** amplifica rate-limit em vez de aliviar.
- **Structured output "JSON mode" não garante schema válido em todo provedor**: alguns só garantem JSON bem-formado, não conformidade ao schema — validação client-side continua necessária.
- **Hot-swap de modelo local sem draining de requisições em voo** derruba respostas em progresso.
- **Merge/beam de respostas custa 2x-Nx tokens sem o usuário perceber**: N chamadas + 1 chamada de síntese multiplicam custo silenciosamente se não exibido antes de disparar.

## Ordem de construção

1. **Adaptador de provedor único (OpenAI-compatible) + BYOK básica** (MODEL-02, MODEL-15/16, MODEL-21) — fundação mínima para qualquer chamada funcionar.
2. **Catálogo de modelos com descoberta + curadoria manual** (MODEL-26/27/28/30) — depende do adaptador já falar com o provedor.
3. **Parâmetros de inferência básicos** (temperature, top_p, max_tokens, stop — MODEL-55/56/62/63) — acopla à UI de conversa, mas é independente do catálogo.
4. **Contagem de tokens correta + contexto visível** (MODEL-74/87) — pré-requisito de tudo que envolve custo e truncamento.
5. **Truncamento/sliding window de contexto** (MODEL-76/77) — depende de MODEL-87 (contagem correta) para não cortar errado.
6. **Custo estimado/real por chamada** (MODEL-88/89) — depende de MODEL-31 (preço por modelo) e MODEL-87 (tokens).
7. **Adaptadores multi-provedor (Anthropic, Bedrock, Vertex, Azure)** (MODEL-01, 07-09) — expande depois que o pipeline single-provider está sólido.
8. **Prompt caching por provedor** (MODEL-80/81/82) — só compensa depois que há volume real de chamadas repetidas; requer suporte específico por provedor.
9. **Roteamento (fallback, retry, custo, latência)** (MODEL-43-54) — depende de já ter 2+ provedores adaptados (passo 7).
10. **Modelos locais (download, quantização, offload)** (MODEL-98-112) — subsistema paralelo, pode ser construído independente do resto, mas reusa o mesmo endpoint OpenAI-compatible do passo 1.
11. **Comparação/Beam multi-modelo** (MODEL-113-119) — depende de ter múltiplos modelos/provedores já funcionando (passo 7) e de custo exposto (passo 6) para não surpreender o usuário.
12. **Roteamento auto/semântico e budget/alertas avançados** (MODEL-50/51, MODEL-92/93) — última camada, requer telemetria de uso já madura.

## Fontes

- https://openrouter.ai/blog/insights/model-routing/
- https://openrouter.ai/docs/guides/routing/provider-selection
- https://openrouter.ai/docs/guides/routing/routers/auto-router
- https://vorplabs.com/models/openrouter-provider-controls
- https://vorplabs.com/models/openrouter-routing-policy
- https://openrouter.zendesk.com/hc/en-us/articles/51691947905051-Why-did-OpenRouter-route-to-an-expensive-model-or-provider-and-how-do-I-control-routing-for-cost
- https://big-agi.com/docs/multi-model
- https://big-agi.com/beam
- https://deepwiki.com/enricoros/big-AGI/5.1-beam-multi-model-system
- https://github.com/enricoros/big-agi/issues/956
- https://techcrunch.com/2025/08/12/chatgpts-model-picker-is-back-and-its-complicated
- https://the-decoder.com/chatgpt-users-can-now-toggle-auto-fast-and-thinking-modes-for-more-control-over-gpt-5/
- https://developers.openai.com/api/docs/guides/reasoning
- https://developers.openai.com/api/docs/guides/prompt-caching
- https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- https://api-docs.deepseek.com/news/news0802/
- https://deepseek-usa.ai/docs/deepseek-context-caching/
- https://markaicode.com/lm-studio-gpu-layers-vram-optimization/
- https://multigrid.ai/learn/lmstudio-gpu-offload-settings
- https://lmstudio.ai/docs/cli/local-models/load
- https://markaicode.com/lm-studio-multi-gpu-split-large-models/
- https://bmdpat.com/blog/llama-cpp-n-gpu-layers-explained-2026
- Conhecimento prévio consolidado sobre Open WebUI, LibreChat, LM Studio, Ollama, KoboldCpp, text-generation-webui, vLLM, TGI, Big-AGI, LiteLLM.

Dossiê completo entregue acima (119 itens, 9 subáreas, Armadilhas, Ordem de construção, Fontes). Yield mínimo a seguir.

---

# 3. `MODAL` — Multimodal: visão, imagem, áudio, voz, vídeo

## 1. Visão (entrada de imagem)

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|MODAL-01|Upload de imagem por arquivo|Seleciona imagem do disco via input file|universal|MESA|S|
|MODAL-02|Paste de imagem (clipboard)|Cola imagem copiada direto na caixa de chat|ChatGPT, Claude.ai, Gemini, Open WebUI, LibreChat, T3 Chat|MESA|S|
|MODAL-03|Drag-and-drop de imagem|Arrasta arquivo de imagem para a janela de chat|ChatGPT, Claude.ai, Open WebUI, LibreChat, Big-AGI|MESA|S|
|MODAL-04|Múltiplas imagens por mensagem|Anexa 2+ imagens numa única mensagem, todas enviadas ao modelo|ChatGPT, Claude.ai, Gemini, Open WebUI|MESA|S|
|MODAL-05|Screenshot capture nativo|Captura tela do dispositivo diretamente do app sem ferramenta externa|Gemini (mobile), Microsoft Copilot (Windows)|DIFF|M|
|MODAL-06|Recorte/anotação pré-envio|Editor de crop, seta, círculo, texto sobre a imagem antes de mandar|Microsoft Copilot (Windows Snipping), ChatGPT (mobile markup via OS)|DIFF|M|
|MODAL-07|Controle de detail (low/high/auto)|Parâmetro que ajusta resolução/tokens processados da imagem via API|OpenAI API (`detail` param), consumido por Open WebUI, LibreChat|DIFF|S|
|MODAL-08|OCR local pré-envio|Extrai texto da imagem no cliente antes de mandar (economiza tokens, funciona offline)|Jan [INFERIDO — plugins], Chatbox (config avançada)|FRONT|M|
|MODAL-09|Imagem via URL|Cola link de imagem em vez de upload; app busca e envia ao modelo|ChatGPT, Claude.ai (API), Poe|DIFF|S|
|MODAL-10|Câmera ao vivo (captura pontual)|Abre webcam/câmera do celular, tira foto e anexa direto|ChatGPT (mobile), Gemini (mobile), Microsoft Copilot|MESA|M|
|MODAL-11|Preview/thumbnail com zoom antes de enviar|Miniatura clicável para conferir a imagem anexada antes do envio|universal|MESA|S|
|MODAL-12|Remoção seletiva de anexo|Remove uma imagem específica da fila de anexos sem apagar as outras|universal|MESA|S|
|MODAL-13|Paste de screenshot com PII redaction automática|Detecta e borra dados sensíveis (e-mail, cartão) em screenshot antes do envio|[INFERIDO — nenhum produto mainstream confirmado]|FRONT|L|

## 2. Geração de imagem

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|MODAL-14|Geração via API proprietária (DALL-E/gpt-image)|Chama modelo de geração de imagem hospedado do provedor|ChatGPT (gpt-image-2), Microsoft Copilot, Poe|MESA|M|
|MODAL-15|Geração via Imagen/Nano Banana|Chama modelo Imagen/Gemini 2.5 Flash Image do Google|Gemini/AI Studio, NotebookLM (capas)|MESA|M|
|MODAL-16|Geração via Aurora/Grok Imagine|Chama modelo autoregressivo da xAI, integrado ao chat|Grok|MESA|M|
|MODAL-17|Geração via Stable Diffusion local (A1111/ComfyUI)|Conecta a backend local SD via API REST, permite workflow de nós|Open WebUI (integração ComfyUI/A1111), SillyTavern-like OSS, Chatbox [INFERIDO]|DIFF|L|
|MODAL-18|Geração via Flux|Chama modelo Flux (via API própria ou self-host)|Grok Imagine (stack Flux), LM Studio [INFERIDO via plugin], plataformas self-host|DIFF|M|
|MODAL-19|Geração via Midjourney não oficial|Integra Midjourney via bot Discord/API de terceiros (não suportado oficialmente)|LibreChat (plugin comunidade), Poe [INFERIDO]|MORTO|M|
|MODAL-20|Prompt enhancement automático|LLM reescreve/expande prompt curto do usuário antes de gerar imagem|ChatGPT, Gemini, Grok Imagine|DIFF|S|
|MODAL-21|Escolha de aspect ratio/tamanho|Seletor de proporção (quadrado, retrato, paisagem, custom)|ChatGPT, Gemini, Grok, A1111/ComfyUI|MESA|S|
|MODAL-22|Número de variações por prompt|Gera N imagens simultâneas da mesma prompt para escolher|ChatGPT (grade), Grok Imagine, A1111/ComfyUI (batch)|MESA|S|
|MODAL-23|Controle de seed|Fixa/exibe seed numérico para reprodutibilidade entre gerações|A1111, ComfyUI, Stable Diffusion WebUI, Flux via API|DIFF|S|
|MODAL-24|Negative prompt|Campo separado descrevendo o que NÃO deve aparecer na imagem|A1111, ComfyUI, Stable Diffusion|DIFF|S|
|MODAL-25|Img2img|Usa imagem existente como ponto de partida, adiciona ruído controlado e regenera|A1111, ComfyUI, Grok Imagine, GPT Image 2 (edits API)|DIFF|M|
|MODAL-26|Inpainting com máscara|Desenha máscara sobre região específica e regenera só ali|A1111, ComfyUI, GPT Image 2, Imagen 2.0, Grok Aurora|DIFF|L|
|MODAL-27|Outpainting|Expande a imagem além da borda original mantendo coerência|GPT Image 2, Imagen 2.0, ComfyUI|DIFF|L|
|MODAL-28|Upscale de imagem gerada|Aumenta resolução da imagem pós-geração (ESRGAN, modelo dedicado)|A1111, ComfyUI, GPT Image 2 (4K beta)|DIFF|M|
|MODAL-29|Edição iterativa conversacional|Refina a imagem por instruções em linguagem natural em turnos sucessivos, mantendo contexto visual|ChatGPT, Grok, Gemini (Nano Banana)|FRONT|M|
|MODAL-30|Galeria de imagens geradas|Tela dedicada listando todo histórico de imagens criadas na conta|ChatGPT, Grok Imagine, Midjourney (referência)|DIFF|M|
|MODAL-31|Download de imagem gerada|Salva a imagem no dispositivo em formato de arquivo|universal|MESA|S|
|MODAL-32|Referência de estilo/composição multi-imagem|Usa 2-3 imagens de referência (estilo + sujeito) para compor uma nova|Grok Imagine (3-image compositing), GPT Image 2|FRONT|M|
|MODAL-33|Watermark/proveniência (C2PA/SynthID)|Marca d'água invisível identificando origem sintética da imagem|Imagen 2.0 (SynthID), GPT Image 2|MESA|M|
|MODAL-34|Style transfer com preset nomeado|Aplica estilos pré-definidos (ex: "anime", "3D render") por seleção em vez de prompt livre|Grok Imagine (6 style transfers)|DIFF|S|

## 3. Áudio de entrada (STT)

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|MODAL-35|Botão de ditado (mic icon)|Botão de microfone na caixa de texto que transcreve fala em texto editável antes de enviar|universal|MESA|S|
|MODAL-36|Whisper local|Roda modelo Whisper (whisper.cpp/faster-whisper) no dispositivo do usuário|Open WebUI, LibreChat (self-host), Jan, Chatbox, KoboldCpp (via extensão)|DIFF|M|
|MODAL-37|Whisper API|Envia áudio para API de transcrição hospedada da OpenAI|Open WebUI, LibreChat, T3 Chat|DIFF|S|
|MODAL-38|Deepgram STT|Integra Deepgram como provedor de transcrição em tempo real|Open WebUI (config custom), plataformas com STT plugável|DIFF|M|
|MODAL-39|Azure Speech STT|Integra Azure Cognitive Services Speech-to-Text|Open WebUI, Microsoft Copilot (nativo)|DIFF|M|
|MODAL-40|Browser Web Speech API|Usa reconhecimento de fala nativo do navegador (sem backend)|Open WebUI (STT Engine: Web API), Chatbox, page-assist|MESA|S|
|MODAL-41|VAD (detecção de fim de fala)|Detecta silêncio/pausa para encerrar automaticamente a captura de áudio|OpenAI Realtime API, Gemini Live, Open WebUI (voice call)|DIFF|M|
|MODAL-42|Push-to-talk|Segura botão para falar, solta para enviar (sem VAD automático)|Open WebUI, apps mobile diversos|MESA|S|
|MODAL-43|Transcrição de arquivo de áudio enviado|Upload de .mp3/.wav existente para transcrição em texto (não é ditado ao vivo)|ChatGPT, Claude.ai, Gemini, Open WebUI|DIFF|S|
|MODAL-44|Diarização de locutor|Identifica e rotula "quem falou o quê" em áudio multi-pessoa|Azure Speech, Deepgram (nativo do provedor, não do chat em si)|FRONT|L|
|MODAL-45|Detecção automática de idioma|Identifica idioma falado sem seleção manual antes de transcrever|Whisper (auto), Azure Speech, Deepgram|MESA|M|
|MODAL-46|Transcrição em streaming (parcial)|Exibe texto sendo transcrito progressivamente enquanto o usuário ainda fala|OpenAI Realtime API, Gemini Live, Deepgram streaming|DIFF|M|

## 4. Áudio de saída (TTS)

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|MODAL-47|Read-aloud da resposta (botão)|Botão único que lê em voz alta a resposta de texto já gerada|ChatGPT, Claude.ai, Gemini, Open WebUI, LibreChat, Perplexity|MESA|S|
|MODAL-48|Seleção de voz|Menu com múltiplas vozes nomeadas para escolher timbre do TTS|ChatGPT, Open WebUI, ElevenLabs-backed apps|MESA|S|
|MODAL-49|Controle de velocidade de fala|Slider/seletor de playback rate (0.5x–2x) do áudio TTS|ChatGPT, Open WebUI, NotebookLM (player)|MESA|S|
|MODAL-50|Streaming de TTS conforme geração|Sintetiza e reproduz áudio incrementalmente enquanto o texto ainda está sendo gerado (não espera resposta completa)|ChatGPT Advanced Voice, OpenAI Realtime API, Gemini Live|DIFF|L|
|MODAL-51|TTS via ElevenLabs|Integra vozes ElevenLabs (alta naturalidade, clonagem)|Open WebUI, LibreChat, Big-AGI (custom endpoints)|DIFF|M|
|MODAL-52|TTS via OpenAI API|Usa endpoint `audio/speech` da OpenAI para síntese|Open WebUI, LibreChat, T3 Chat|DIFF|S|
|MODAL-53|TTS via Azure Speech|Integra vozes neurais da Azure Cognitive Services|Open WebUI, Microsoft Copilot (nativo)|DIFF|M|
|MODAL-54|TTS local Kokoro|Roda modelo Kokoro-82M no dispositivo/servidor próprio, sem API paga|Open WebUI (Kokoro Web integration)|DIFF|M|
|MODAL-55|TTS local Piper|Motor neural leve rodando 100% offline (ex: Raspberry Pi)|Open WebUI, KoboldCpp (comunidade), Home Assistant-adjacent OSS|DIFF|M|
|MODAL-56|Highlight de palavra sendo falada|Destaca visualmente no texto a palavra que o TTS está pronunciando naquele instante (karaokê)|NotebookLM [INFERIDO parcial], apps de leitura acessível dedicados|FRONT|L|
|MODAL-57|Download de áudio gerado|Salva o arquivo de áudio (resposta lida ou audio overview) no dispositivo|NotebookLM (Audio Overview), Open WebUI|MESA|S|

## 5. Voz conversacional

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|MODAL-58|Modo de voz contínuo full-duplex|Conversa falada ida-e-volta sem precisar tocar em botão a cada turno|ChatGPT Advanced Voice Mode, Gemini Live, Grok Voice|FRONT|XL|
|MODAL-59|Interrupção/barge-in|Usuário fala por cima da resposta do modelo e ele para e escuta|OpenAI Realtime API, Gemini Live, ChatGPT Advanced Voice|FRONT|L|
|MODAL-60|API realtime dedicada (WebSocket/WebRTC)|Canal bidirecional de baixa latência para áudio streaming (não request/response)|OpenAI Realtime API, Gemini Live API|FRONT|XL|
|MODAL-61|Otimização de latência de primeira palavra|Pipeline overlapping STT/LLM/TTS para reduzir tempo até o primeiro áudio de resposta|OpenAI Realtime API (GPT-Realtime 2.1), Gemini Live (Astra)|FRONT|XL|
|MODAL-62|Indicador visual de escuta/fala|Animação/waveform mostrando se o sistema está ouvindo, pensando ou falando|ChatGPT, Gemini Live, Open WebUI (call UI)|MESA|S|
|MODAL-63|Modo hands-free (tela bloqueada/background)|Continua a conversa por voz com a tela desligada ou app em segundo plano|ChatGPT (mobile), Gemini Live (mobile)|DIFF|L|
|MODAL-64|Chamada de vídeo com o modelo|Câmera ao vivo contínua durante a conversa por voz, modelo "vê" o feed|ChatGPT Advanced Voice (visão), Gemini Live (câmera)|FRONT|XL|
|MODAL-65|Compartilhamento de tela em tempo real|Modelo recebe stream da tela do usuário durante a conversa por voz para orientar em tempo real|Gemini Live (screen sharing), Microsoft Copilot Vision|FRONT|XL|

## 6. Arquivos

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|MODAL-66|Upload de PDF|Anexa PDF para leitura/análise pelo modelo|universal|MESA|S|
|MODAL-67|Upload de Office (docx/xlsx/pptx)|Aceita documentos do Office como anexo, extraindo texto/estrutura|ChatGPT, Claude.ai, Gemini, Open WebUI, LibreChat|MESA|M|
|MODAL-68|Upload de CSV com análise tabular|Lê CSV e permite perguntas sobre linhas/colunas, não só texto bruto|ChatGPT (Code Interpreter), Claude.ai, Gemini|DIFF|M|
|MODAL-69|Upload de ZIP|Aceita arquivo compactado, extrai e lista conteúdo internamente|ChatGPT (Code Interpreter), Claude.ai (Code execution)|DIFF|M|
|MODAL-70|Upload de código-fonte com syntax highlight no preview|Reconhece extensão de código e exibe com destaque de sintaxe no preview do anexo|Claude.ai, ChatGPT, Cursor-adjacent, Open WebUI|MESA|S|
|MODAL-71|Limite de tamanho por arquivo/conta|Teto de MB por arquivo e teto agregado por usuário/plano|ChatGPT (512MB/arquivo), Claude.ai (30MB/arquivo free), Gemini|MESA|S|
|MODAL-72|Preview inline do arquivo|Renderiza o conteúdo do arquivo dentro da conversa sem precisar baixar|ChatGPT, Claude.ai, NotebookLM, Open WebUI|MESA|M|
|MODAL-73|Extração de texto vs envio nativo (Files API)|Escolhe entre parsear texto no cliente/servidor vs mandar o arquivo bruto para o modelo processar nativamente (PDF com imagens, por ex.)|Claude Files API (nativo), OpenAI Files API|DIFF|L|
|MODAL-74|Múltiplos arquivos por mensagem|Anexa vários arquivos de tipos diferentes numa única mensagem|ChatGPT, Claude.ai, Gemini|MESA|S|
|MODAL-75|Arquivo persistente em projeto/espaço|Arquivo fica disponível para todas as conversas dentro de um projeto, não só na mensagem que o subiu|Claude Projects, ChatGPT Projects, NotebookLM (fontes), Dify (knowledge base)|DIFF|L|
|MODAL-76|Download de arquivo gerado pelo modelo|Modelo produz um arquivo (relatório, planilha, código) baixável diretamente do chat|ChatGPT (Code Interpreter), Claude.ai (Code execution), Gemini|DIFF|M|

## 7. Vídeo

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|MODAL-77|Upload de arquivo de vídeo|Anexa vídeo local (.mp4 etc.) para análise pelo modelo|Gemini (nativo multimodal), Claude.ai [INFERIDO limitado]|DIFF|L|
|MODAL-78|Análise de frames extraídos|Decompõe o vídeo em frames-chave e envia como sequência de imagens ao modelo|Gemini API (nativo), plataformas OSS via pipeline custom (ffmpeg + vision)|DIFF|L|
|MODAL-79|Análise de vídeo por URL do YouTube|Aceita link do YouTube e processa conteúdo/transcrição sem download manual|Gemini/AI Studio (YouTube URL support), NotebookLM (fonte)|DIFF|M|
|MODAL-80|Geração de vídeo via Sora|Chama modelo Sora da OpenAI para text-to-video|ChatGPT (Sora), Sora app standalone|FRONT|XL|
|MODAL-81|Geração de vídeo via Veo|Chama modelo Veo do Google para text-to-video|Gemini, Flow (Google)|FRONT|XL|
|MODAL-82|Geração de vídeo via Grok Imagine|Gera vídeo curto a partir de imagem/prompt usando stack Aurora|Grok Imagine|FRONT|XL|
|MODAL-83|Transcrição de vídeo enviado|Extrai áudio do vídeo e transcreve para texto pesquisável|Gemini, pipelines OSS (Whisper + ffmpeg)|DIFF|M|

## 8. Outros

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|MODAL-84|Geração de música/áudio a partir de prompt|Cria trilha musical original por descrição textual|Grok Imagine (roadmap) [INFERIDO], integrações de terceiros (Suno) via plugin em LibreChat|FRONT|XL|
|MODAL-85|Podcast de dois locutores (audio overview)|Sintetiza diálogo entre duas vozes IA discutindo o conteúdo das fontes carregadas|NotebookLM (Audio Overview)|FRONT|XL|
|MODAL-86|Leitura de QR code em imagem|Detecta e decodifica QR code presente numa imagem enviada|[INFERIDO — capacidade emergente de vision, não feature dedicada nomeada em nenhum produto]|DIFF|S|
|MODAL-87|Análise de planilha com gráfico gerado|Lê dados tabulares e produz visualização gráfica (bar/line/pie) como saída|ChatGPT (Code Interpreter/Data Analysis), Claude.ai (Code execution + artifacts), Gemini|DIFF|M|

---

## Armadilhas

- **Tokens de imagem explodem custo silenciosamente.** `detail: high` no GPT-4o/gpt-image pode custar 10x+ tokens vs `low`; sem exposição desse controle na UI, o usuário não percebe até a fatura.
- **Paste de clipboard difere por SO/navegador.** Safari e Firefox tratam `clipboardData` de forma distinta de Chrome; testar paste de screenshot (formato PNG binário) separadamente de paste de texto.
- **VAD mal calibrado gera barge-in falso.** Silêncio curto demais corta o usuário no meio da frase; longo demais deixa a latência de resposta perceptível. Não existe valor universal — depende do ambiente acústico.
- **Streaming de TTS + interrupção exige buffer de áudio descartável.** Se o barge-in não invalidar o áudio já em fila no player, o usuário ouve a IA "atropelando" a própria fala anterior.
- **Whisper local tem custo de CPU/GPU não trivial em produção.** `large-v3` em CPU pode levar mais tempo que a duração do áudio; sem fallback para modelo menor, a UX trava.
- **Inpainting exige alinhamento pixel-perfeito de máscara com o modelo de difusão.** Máscaras com bordas serrilhadas (sem feather/blur) geram costura visível — armadilha clássica de implementação ingênua.
- **Seed não é garantia de reprodutibilidade cross-provider.** Mesmo seed + mesmo prompt em backends diferentes (ou até versões diferentes do mesmo modelo) produz imagens distintas; documentar isso evita bug report falso.
- **Files API nativo vs extração de texto têm caminhos de custo e qualidade opostos.** Extrair texto no servidor é barato mas perde layout/imagens embutidas em PDF; envio nativo preserva fidelidade mas multiplica tokens.
- **Diarização de locutor não é grátis: exige modelo separado do STT.** Confundir "transcrição multi-fala" com "quem disse o quê" é erro comum de escopo.
- **Vídeo por frames amostra demais ou de menos.** Extrair 1 frame/segundo em vídeo de 10min gera 600 imagens (estouro de contexto); extrair poucos perde eventos rápidos.
- **Câmera ao vivo/screen-share em tempo real exige WebRTC, não upload por HTTP.** Tentar simular com screenshots periódicos via polling HTTP produz latência inaceitável e não é "live" de fato.
- **Preview inline de arquivo grande trava a UI se renderizado sem virtualização** (ex: CSV de 100k linhas, PDF de 500 páginas).

## Ordem de construção

1. **Upload/paste/drag-drop de imagem única** (MODAL-01 a 04) — base de tudo, sem dependências.
2. **Preview + remoção seletiva de anexo** (MODAL-11, 12) — UI de staging antes de qualquer envio.
3. **Envio ao modelo com controle de detail** (MODAL-07) — depende do provider escolhido suportar vision.
4. **Upload de arquivo genérico (PDF, Office)** (MODAL-66, 67, 71, 72) — reusa a mesma infra de staging de anexos; extração de texto (MODAL-73) vem depois, é decisão de arquitetura (nativo vs parser).
5. **STT por botão de ditado com Web Speech API** (MODAL-35, 40) — mais barato, valida a UX antes de investir em Whisper.
6. **Whisper local/API** (MODAL-36, 37) — substitui Web Speech quando qualidade/privacidade importa.
7. **TTS read-aloud simples** (MODAL-47, 48, 49) — request/response, sem streaming.
8. **TTS streaming** (MODAL-50) — exige refatorar o pipeline para não esperar resposta completa.
9. **VAD + push-to-talk** (MODAL-41, 42) — pré-requisito de qualquer modo de voz contínuo.
10. **Voz conversacional full-duplex + interrupção** (MODAL-58 a 61) — o item mais caro do domínio; só faz sentido depois que STT, TTS streaming e VAD já funcionam isolados.
11. **Câmera ao vivo / screen-share em voz** (MODAL-64, 65) — build final sobre o pipeline realtime, exige WebRTC de vídeo além de áudio.
12. **Geração de imagem simples (texto→imagem, 1 provider)** (MODAL-14/15/16/18, 21, 22) — paralelo ao resto, começa por API hospedada antes de self-host.
13. **Controles avançados de geração** (seed, negative prompt, img2img, inpainting/outpainting, upscale) — MODAL-23 a 28 — exigem workflow tipo ComfyUI/A1111 ou API que exponha esses parâmetros; MJ e providers fechados frequentemente não expõem seed/negative prompt.
14. **Edição iterativa conversacional** (MODAL-29) — depende de img2img/inpainting já funcionando e de manter referência da imagem anterior no contexto.
15. **Vídeo (upload, frames, YouTube)** (MODAL-77 a 79) — depende de pipeline de imagem já maduro (frames = imagens); geração de vídeo (MODAL-80 a 82) é o item mais caro do domínio inteiro, deixar por último.
16. **Podcast de dois locutores** (MODAL-85) — depende de TTS multi-voz + orquestração de roteiro por LLM; construir por último, depois que TTS single-voice estiver sólido.

## Fontes

- https://developers.openai.com/api/docs/guides/voice-agents
- https://www.latent.space/p/realtime-api
- https://docs.workadventu.re/blog/realtime-api-interrupting-the-model/
- https://www.huuphan.com/2026/07/low-latency-voice-api-2-1.html
- https://www.android.com/articles/gemini-on-android/
- https://blog.google/products-and-platforms/products/gemini/gemini-live-android-tips/
- https://picsart.com/ai-models/gpt-2/
- https://www.mindstudio.ai/blog/chatgpt-images-2-review-use-cases
- https://wavespeed.ai/blog/posts/gpt-image-2-2026/
- https://www.perfectcorp.com/consumer/blog/generative-AI/grok-image-generator
- https://www.atlascloud.ai/blog/guides/grok-imagine
- https://www.shiori.ai/blog/grok-image-generation-guide-2026
- https://ai.google.dev/gemini-api/docs/imagen
- https://ai.google.dev/gemini-api/docs/image-generation
- https://android-developers.googleblog.com/2025/10/boost-user-engagement-with-ai-image.html
- https://www.datastudios.org/post/how-to-generate-images-with-google-gemini-tools-limits-api-access-and-pricing-explained
- https://www.rundiffusion.com/img2img-docs
- https://stable-diffusion-art.com/flux-img2img-inpainting/
- https://notebooklm.hk/en/blog/notebooklm-audio-overview-guide/
- https://support.google.com/notebooklm/answer/16212820?hl=en
- https://blog.google/technology/ai/notebooklm-audio-overviews/
- https://deepwiki.com/huntershen008/open-webui/5.2-call-and-voice-features
- https://docs.openwebui.com/features/chat-conversations/audio/text-to-speech/kokoro-web-integration/
- https://localaimaster.com/blog/best-local-tts-models
- https://github.com/mdmonsurali/Offline-Fast-CPU-PIPER-TTS

---

# 4. `RAG` — Conhecimento, retrieval e memória

Catálogo compilado a partir de 4 varreduras paralelas (Ingestão/Parsing/Chunking; Embeddings/Índice/Retrieval; Citações/Organização/Memória; Web Search/Conectores). 145 itens atômicos, IDs sequenciais `RAG-01`..`RAG-145`.

## 1. Ingestão

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|RAG-01|Upload de arquivo único/múltiplo|Sobe PDF/DOCX/TXT etc via UI ou API|universal (Open WebUI, LibreChat, AnythingLLM, Dify, RAGFlow, NotebookLM)|MESA|S|
|RAG-02|Upload de pasta / sync de diretório local|Aponta pasta local e sincroniza arquivos recursivamente|Khoj, AnythingLLM, Open WebUI [INFERIDO parcial]|DIFF|M|
|RAG-03|Ingestão de URL única|Cola link, sistema faz fetch + extrai conteúdo limpo|Open WebUI, AnythingLLM, Dify, RAGFlow, Khoj, NotebookLM, SurfSense|MESA|S|
|RAG-04|Crawl de site com profundidade configurável|Rastreia domínio a partir de URL seguindo links até N níveis|RAGFlow, Dify (Firecrawl/Jina), Onyx, SurfSense|DIFF|M-L|
|RAG-05|Ingestão via sitemap.xml|Lê sitemap e enfileira URLs listadas em lote|RAGFlow, Onyx, Dify [INFERIDO]|DIFF|S-M|
|RAG-06|YouTube transcript ingestion|Extrai legendas/transcript de vídeo como fonte de texto|AnythingLLM, NotebookLM, SurfSense, Msty|MESA|S (com legenda) / L (via ASR)|
|RAG-07|Ingestão de repositório Git|Clona repo e ingere código+docs preservando estrutura|Khoj, Langflow, SurfSense, AnythingLLM, Onyx|DIFF|M|
|RAG-08|Colar texto diretamente|Campo de texto livre vira fonte indexável sem upload|NotebookLM, Dify, Open WebUI, AnythingLLM, RAGFlow, LibreChat|MESA|S|
|RAG-09|Ingestão de e-mail (caixa/thread)|Conecta IMAP/Gmail API e indexa mensagens como documentos|SurfSense (Gmail), Onyx (Gmail nativo com ACL)|DIFF|L|
|RAG-10|API de ingestão programática|Endpoint REST para enviar docs/URLs fora da UI|Dify (Knowledge API), RAGFlow, Open Notebook, LibreChat, Onyx|MESA (dev/enterprise)|M|
|RAG-11|Agendamento de re-ingestão periódica|Define intervalo para reconsultar fonte e capturar itens novos|Onyx (Refresh Frequency), Dify [INFERIDO], RAGFlow [INFERIDO]|DIFF|M|
|RAG-12|Prune de dados obsoletos|Remove do índice itens que sumiram na fonte, em ciclo próprio|Onyx (Prune Frequency dedicada)|FRONT|M|
|RAG-13|Detecção de mudança/delta|Reindexa só documentos alterados via hash/timestamp/delta API|Onyx (Graph Delta API, parcial), NotebookLM (auto-sync Google Docs)|FRONT|XL|
|RAG-14|ACL/permission sync na ingestão|Sincroniza permissões da fonte original para o índice RAG|Onyx (Drive, SharePoint, Slack)|FRONT|XL|

## 2. Parsing

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|RAG-15|Extração de texto nativo de PDF|Extrai texto da camada de texto do PDF sem OCR|universal (Open WebUI, AnythingLLM, RAGFlow, LM Studio, Dify)|MESA|S|
|RAG-16|OCR para PDF escaneado/imagem|Roda OCR quando PDF é imagem sem camada de texto|RAGFlow (DeepDoc), Open WebUI (Tika/Docling/Mistral OCR/Marker/MinerU), Dify|MESA (RAG sério)/MORTO (apps simples)|L|
|RAG-17|Layout-aware parsing (tabela/coluna/cabeçalho)|Reconhece estrutura visual da página (Document Layout Recognition)|RAGFlow (DeepDoc), Docling, MinerU, LlamaParse|DIFF-FRONT|XL|
|RAG-18|Extração de tabela para markdown estruturado|Detecta tabela (inclusive células mescladas) e serializa como markdown coerente|RAGFlow (TSR), LlamaParse, Docling, MinerU|DIFF|XL|
|RAG-19|Descrição de imagens dentro do PDF via VLM|Gera legenda textual de figuras/gráficos embutidos, tornando-os buscáveis|RAGFlow (visual enhancement), LlamaParse|FRONT|XL|
|RAG-20|Parsing de DOCX/PPTX/XLSX nativo|Extrai texto/estrutura de arquivos Office sem converter para PDF|AnythingLLM, RAGFlow, Open WebUI (Tika/Docling), LM Studio|MESA|M|
|RAG-21|Remoção de boilerplate de HTML|Remove nav/sidebar/rodapé/ads ao ingerir página web, gera markdown limpo|SurfSense, Dify (Firecrawl/Jina), Onyx, AnythingLLM|MESA|M|
|RAG-22|Parsing de código-fonte com AST/estrutura|Entende funções/classes/imports em vez de tratar código como texto plano|Khoj [INFERIDO parcial] — nenhum produto confirma AST real granular|FRONT|XL|
|RAG-23|Transcrição de áudio para RAG|Converte áudio (podcast, nota de voz) em texto via ASR antes de indexar|AnythingLLM (Whisper), SurfSense, Open Notebook, NotebookLM|DIFF|M|
|RAG-24|Parsers plugáveis/integráveis (Docling, Unstructured, MinerU, LlamaParse, Tika)|Permite trocar o motor de extração por backend especializado externo|Open WebUI, RAGFlow, Langflow, Open Notebook|MESA (plataforma/dev)|M (integração)/XL (parser em si)|

## 3. Chunking

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|RAG-25|Chunking fixo por N tokens/caracteres|Corta texto em blocos de tamanho fixo, overlap opcional|LibreChat, AnythingLLM, Dify (General Mode), Langflow|MESA|S|
|RAG-26|Chunking recursivo|Tenta separadores hierárquicos (parágrafo→sentença→palavra) antes de cortar por tamanho|Open WebUI, Langflow, Open Notebook|MESA|S-M|
|RAG-27|Chunking por sentença|Quebra em unidades de sentença completa|[INFERIDO — subsumido no recursivo na maioria]; RAGFlow (merge via XGBoost)|MESA|S|
|RAG-28|Chunking semântico (por similaridade)|Gera embedding por sentença, corta quando similaridade cai abaixo de threshold|LlamaParse/LlamaIndex, Langflow (SemanticChunker); Dify pedido em issue aberta|FRONT|L|
|RAG-29|Chunking por layout/seção do documento|Usa estrutura reconhecida (headers, seções) como unidade de corte|Open WebUI (MarkdownHeaderTextSplitter), RAGFlow (DeepDoc), Open Notebook|DIFF|M-L|
|RAG-30|Late chunking (embed doc inteiro, depois split)|Gera embeddings a nível de token para o doc inteiro antes de particionar|nenhum produto de consumidor/plataforma confirma nativo — técnica de framework (Jina AI)|FRONT|XL|
|RAG-31|Overlap configurável entre chunks|Define tokens/caracteres repetidos entre chunk N e N+1|LibreChat, AnythingLLM, Open WebUI, Langflow|MESA|S|
|RAG-32|Chunk pai-filho / small-to-big retrieval|Busca por chunk pequeno mas injeta chunk pai maior na geração|Dify (Parent-child Mode, Paragraph/Full Doc)|DIFF-FRONT|L|
|RAG-33|Chunking Q&A (par pergunta-resposta como unidade)|Cada chunk é um par Q&A gerado (manual ou via LLM)|Dify (Q&A Mode, LLM Generated Q&A)|FRONT|L|
|RAG-34|Chunking "single chunk"|Trata arquivo inteiro como chunk indivisível|Msty (Knowledge Stacks)|FRONT|S|
|RAG-35|Preview de chunks na UI antes de indexar|Mostra como documento foi fragmentado antes de confirmar indexação|Dify, RAGFlow|DIFF|M|
|RAG-36|Edição manual de chunk pelo usuário|Permite editar conteúdo de chunk já gerado (corrigir OCR, ajustar texto)|Dify (parent/child, Q&A), RAGFlow|DIFF|M|
|RAG-37|Merge de chunks pequenos (min size target)|Funde fragmentos muito pequenos com vizinhos após split por header|Open WebUI (Chunk Min Size Target)|FRONT|S-M|

## 4. Embeddings e Índice

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|RAG-38|Escolha de modelo de embedding pelo usuário|Usuário seleciona qual modelo gera os vetores|Open WebUI, AnythingLLM, LibreChat, Khoj, RAGFlow, Dify|MESA|M|
|RAG-39|Embedding local vs via API|Roda embedding no device/self-host em vez de API paga|Open WebUI, AnythingLLM, LibreChat, Khoj, RAGFlow|MESA (OSS)/MORTO (closed)|M|
|RAG-40|Configuração de dimensão do vetor|Ajusta dimensionalidade do índice (Matryoshka truncation, schema do DB)|nenhum expõe na UI — herdado do modelo [INFERIDO]|FRONT|S-M|
|RAG-41|Normalização de vetor (L2)|Normaliza embeddings antes de indexar/comparar, geralmente automático|implementação implícita universal (cosine similarity)|MESA|S|
|RAG-42|Reindexação ao trocar modelo de embedding|Força/oferece reprocessar corpus ao trocar modelo (dimensões mudam)|AnythingLLM (manual), RAGFlow (manual), Dify (manual)|DIFF|L|
|RAG-43|Vector store: pgvector|Suporte nativo a pgvector como backend vetorial|LibreChat (padrão rag_api), Dify, Langflow|MESA|M|
|RAG-44|Vector store: Chroma|Suporte nativo a Chroma|AnythingLLM, Open WebUI (default), Langflow|MESA|M|
|RAG-45|Vector store: Qdrant|Suporte nativo a Qdrant|AnythingLLM, Dify, RAGFlow, Langflow, n8n|MESA|M|
|RAG-46|Vector store: Milvus|Suporte nativo a Milvus|AnythingLLM, Dify, RAGFlow, Langflow|MESA|M|
|RAG-47|Vector store: Weaviate|Suporte nativo a Weaviate|AnythingLLM, Dify, Langflow|MESA|M|
|RAG-48|Vector store: LanceDB|Suporte nativo a LanceDB (default local)|AnythingLLM|DIFF|M|
|RAG-49|Vector store: Elasticsearch|Suporte nativo a Elasticsearch|RAGFlow, Langflow|DIFF|M|
|RAG-50|Vector store: OpenSearch|Usa OpenSearch para hybrid search nativamente|Onyx|DIFF|M|
|RAG-51|Vector store: Pinecone|Suporte nativo a Pinecone|AnythingLLM, Langflow|DIFF|M|
|RAG-52|Vector store: Redis|Suporte nativo a Redis como vector store|Langflow/LangChain|DIFF|M|
|RAG-53|Vector store: SQLite-vec|Suporte nativo a SQLite-vec|nenhum produto do escopo confirma — nicho de projetos menores [INFERIDO ausência]|MORTO (no escopo pesquisado)|M|
|RAG-54|Índice híbrido BM25 + vetor|Combina busca lexical (BM25) e semântica (vetor) no mesmo índice|Open WebUI, RAGFlow, Dify, Onyx|MESA|M|
|RAG-55|Filtro de busca por metadado|Filtra retrieval por data/autor/tag além do texto|RAGFlow, Dify, Onyx; AnythingLLM só por workspace [INFERIDO parcial]|DIFF|M-L|

## 5. Retrieval

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|RAG-56|Top-k configurável|Define quantos chunks entram no contexto|Open WebUI, Dify (default 3), Onyx, RAGFlow, AnythingLLM, Khoj|MESA|S|
|RAG-57|Threshold de similaridade mínima|Descarta resultados abaixo de score de similaridade definido|Open WebUI (Relevance Threshold), Dify (Score Threshold, só ativo c/ rerank), Onyx|MESA|S|
|RAG-58|Busca híbrida com fusão RRF|Funde ranking de dois retrievers (BM25+vetor) via Reciprocal Rank Fusion|LangChain/Langflow (EnsembleRetriever), AnythingLLM (rank fusion); Onyx/RAGFlow combinam scores mas mecanismo exato [INFERIDO]|DIFF/FRONT|S-M|
|RAG-59|Reranking com cross-encoder|Rescora top-N resultados com modelo cross-encoder dedicado|Open WebUI (bge-reranker-v2-m3), RAGFlow, Dify, AnythingLLM (LanceDB), Khoj, Onyx|MESA (RAG-first)|M|
|RAG-60|Query rewriting/expansão automática|Reformula query do usuário antes do retrieval via LLM|Onyx, Perplexity (implícito), LangChain/Langflow (MultiQueryRetriever)|DIFF|M|
|RAG-61|HyDE (Hypothetical Document Embeddings)|Gera documento hipotético via LLM e embeda ele para buscar|LangChain/Langflow (HyDE retriever) — nenhum produto de chat-UI final expõe como toggle|FRONT|S-M|
|RAG-62|Multi-query retrieval|Gera múltiplas variações da query e agrega resultados|LangChain/Langflow (MultiQueryRetriever)|FRONT|M|
|RAG-63|Roteamento entre múltiplas coleções/índices|Direciona query para a coleção/dataset certo entre vários|RAGFlow, Dify (Knowledge Retrieval node N-to-1), AnythingLLM (manual), Onyx, Microsoft Copilot|DIFF|M-L|
|RAG-64|GraphRAG (grafo de conhecimento)|Extrai entidades/relações e usa grafo para QA multi-hop|RAGFlow (nativo, off by default), Onyx (LLM-based KG)|FRONT|XL|
|RAG-65|RAPTOR (árvore hierárquica de sumarização)|Sumariza recursivamente clusters de chunks em árvore para contexto de longo alcance|RAGFlow (único confirmado, off by default por custo)|FRONT|XL|
|RAG-66|Retrieval agentic (modelo decide quando/o que buscar)|LLM decide autonomamente disparar retrieval como tool|Dify (Agent node), Perplexity, Onyx, Microsoft Copilot, RAGFlow (Agent component)|DIFF→MESA (2026)|L|
|RAG-67|Auto-merge de chunks vizinhos recuperados|Funde/substitui chunks-filhos recuperados pelo chunk pai maior (AutoMergingRetriever)|LangChain/LlamaIndex (framework) — nenhum produto de chat-UI final expõe nomeado|FRONT|M-L|
|RAG-68|Contexto de janela ao redor do chunk retornado|Expande contexto com sentenças vizinhas ao chunk retornado (sentence-window)|LangChain/LlamaIndex (SentenceWindowNodeParser); RAGFlow parcial [INFERIDO]|FRONT|M|
|RAG-69|Templates de chunking por tipo de documento|Perfis de chunking pré-configurados por tipo (Paper/Manual/Q&A/etc.)|RAGFlow|DIFF|M|
|RAG-70|Retrieval sem vector DB tradicional (long-context grounding)|Usa contexto longuíssimo + embeddings proprietários em vez de pipeline RAG configurável|NotebookLM (único, ~25M palavras de contexto)|FRONT|XL|
|RAG-71|Semantic index híbrido léxico+vetor sobre grafo corporativo|Índice semântico corporativo unificado (e-mail/arquivos/Teams) respeitando permissões nativas|Microsoft Copilot|DIFF (enterprise)|XL|
|RAG-72|Retrieval sobre web ao vivo sem índice fixo|Crawling on-demand + índice cacheado próprio, sem base de conhecimento configurável|Perplexity (BM25+embedding→cross-encoder→ML reranker), Kagi Assistant, T3 Chat|MESA (web grounding)|XL|

## 6. Citações

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|RAG-73|Citação numerada inline|Resposta traz [1][2] mapeando frase→fonte|ChatGPT, Perplexity, NotebookLM, RAGFlow, Gemini, Notion AI|MESA|M|
|RAG-74|Citação como agregado de trecho (não claim-a-claim)|Uma citação cobre parágrafo/bloco inteiro, não frase isolada|Perplexity, ChatGPT (web search)|MESA|S|
|RAG-75|Click-to-jump até trecho exato na fonte|Clicar na citação abre documento na posição exata|NotebookLM, RAGFlow (PDF annotation)|DIFF|L|
|RAG-76|Highlight visual no documento original|Pinta/grifa a passagem citada no documento, não só navega até ela|NotebookLM, RAGFlow (deepdoc); Onyx sem confirmação pixel-level [INFERIDO]|DIFF|L|
|RAG-77|Preview em hover da citação|Tooltip mostra trecho citado ao passar o mouse, sem clicar|NotebookLM|FRONT|S|
|RAG-78|Visualizador de PDF embutido com deep-link|Abre PDF dentro do app na página/posição certa|NotebookLM, RAGFlow, Open Notebook|DIFF|L|
|RAG-79|Verificação de suporte da claim vs. fonte|Auto-checagem factual de que a frase gerada é sustentada pelo chunk citado|nenhum produto mainstream confirma nativo/ativo — lacuna de mercado [INFERIDO ausência]|FRONT|XL|
|RAG-80|Confidence score de citação exposto ao usuário|Score de confiança visível por citação para o usuário final|Dify expõe "matching degree" mas só em modo admin/debug|FRONT/MORTO (end-user)|L|
|RAG-81|Aviso de resposta não fundamentada em fonte|Banner explícito "não encontrei isso nas suas fontes"|nenhum produto emite ativamente; NotebookLM mitiga por restrição de comportamento, não warning explícito|FRONT|M|
|RAG-82|Citação composta multi-fonte por frase|Formato agregando mais de um chunk citado na mesma frase ([ID:i][ID:j])|RAGFlow (citation_prompt documentado), Perplexity|MESA/DIFF|S|
|RAG-83|Grounding com busca web ao vivo (corpus não fechado)|Citações apontam URLs vivas com ranking mutável no tempo|Gemini (groundingChunks/groundingSupports com start/end index), Perplexity, ChatGPT, Microsoft Copilot|MESA|M|
|RAG-84|Citações estruturadas com metadados semânticos (schema tipado)|Resposta de plugin/agente carrega objeto de citação tipado, não texto solto|Microsoft Copilot (Copilot Studio, MCP connectors)|FRONT|M|
|RAG-85|Citação sempre ativa por padrão (não opt-in)|Toda resposta baseada no workspace vem citada automaticamente|Notion AI (desde mar/2026)|DIFF→MESA|S|
|RAG-86|Toggle admin de citação/atribuição por app|Admin liga/desliga exibição de citação nas respostas RAG por aplicação|Dify (Retrieval Test, "Citation and Attribution")|MESA (plataformas builder)|S|

## 7. Organização do Conhecimento

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|RAG-87|Coleções/knowledge bases nomeadas reutilizáveis|Bases nomeadas, independentes de uma conversa específica|Open WebUI (Knowledge), AnythingLLM (Workspaces), Dify (Datasets), RAGFlow, Onyx (Document Sets)|MESA|M|
|RAG-88|Anexar coleção a um assistente/persona|Knowledge base vinculada a um bot específico|Dify, AnythingLLM (workspace=persona+docs), Khoj (custom agent), Onyx|MESA|M|
|RAG-89|Anexar documento/coleção a uma conversa específica|Upload vale só naquele chat, sem poluir base global|AnythingLLM (thread-scoped documents), Claude.ai (anexo avulso fora de Project)|MESA|S|
|RAG-90|Escopo de conhecimento por projeto/workspace|Isolamento cross-projeto sem vazamento de docs entre projetos|Claude.ai (Projects), AnythingLLM (workspaces isolados), ChatGPT (Projects)|MESA|M|
|RAG-91|Permissão de acesso por coleção (RBAC granular)|Controle fino por dataset (só eu / time todo / parcial)|Dify (3 níveis), AnythingLLM (Admin/Manager/Default), Onyx (basic/curator/admin + ACL)|DIFF|L|
|RAG-92|Herança de permissão do conector/fonte original|Sistema respeita quem já podia ver o doc na fonte, sem vazar acesso|Onyx (40+ conectores mirror ACL da fonte)|DIFF|XL|
|RAG-93|Deduplicação de documentos|Evita reprocessar/reembedar conteúdo repetido, economiza custo|AnythingLLM ("never pay to embed twice", até 70% economia de token)|DIFF|M|
|RAG-94|Sincronização automática/live de documento|Coleção se atualiza sozinha quando fonte externa muda|AnythingLLM (Automatic Document Sync, beta), Onyx (real-time syncs)|DIFF/FRONT|XL|
|RAG-95|Modo RAG (chunk+embed) vs. contexto completo (full-text)|Usuário escolhe se doc é indexado seletivamente ou jogado inteiro no prompt|AnythingLLM ("Embed" vs anexo bruto), Open Notebook (Chat vs Ask), Msty (Full Content Context)|DIFF|M|
|RAG-96|Filtragem de retrieval por metadados customizados|Busca semântica combinada com filtro estruturado (tags/campos)|Dify (v1.1.0, Filtering Knowledge Retrieval with Customized Metadata)|FRONT|L|
|RAG-97|Versionamento de documento indexado|Histórico de revisões da fonte mantido no índice|nenhum produto confirma implementação nativa — gap de mercado (pesquisa acadêmica VersionRAG trata como problema aberto) [INFERIDO ausência]|MORTO/FRONT|XL|
|RAG-98|Quota de armazenamento/tamanho por coleção|Teto configurável de storage por coleção/usuário exposto ao usuário final|nenhum produto expõe como feature de produto — tratado como infra de deploy [INFERIDO ausência]|MORTO (como feature de produto)|M|

## 8. Web Search

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|RAG-99|Provedor Tavily|Motor de busca otimizado para IA, resultados estruturados prontos para RAG|Open WebUI, LibreChat, AnythingLLM, Dify, Langflow, n8n|MESA (OSS self-host)|S|
|RAG-100|Provedor Brave Search API ("Data for AI")|Busca via índice próprio Brave, plano pago para uso por IA|Open WebUI, LibreChat, Khoj [INFERIDO]|MESA|S|
|RAG-101|Provedor SearXNG self-hosted|Metabuscador OSS agregando múltiplos motores sem tracking, self-host|Open WebUI, LibreChat, Khoj, AnythingLLM, n8n|DIFF|M|
|RAG-102|Provedor Google Programmable Search Engine (PSE/CSE)|Busca restrita ao índice Google via API paga|Open WebUI (fechando p/ novos usuários em 2026)|MORTO|S|
|RAG-103|Provedor Serper (Google SERP scraper)|Raspa resultados do Google Search via API de terceiros, mais barato|Open WebUI, LibreChat [INFERIDO], n8n|MESA|S|
|RAG-104|Provedor Exa (busca semântica/neural)|Busca por embeddings/semântica em vez de keyword matching|Open WebUI (prioridade #1 no modo agentic), LibreChat [INFERIDO]|DIFF|S|
|RAG-105|Provedor Bing Search API / Azure AI Search|Busca via índice Bing/Microsoft|Open WebUI, Microsoft Copilot (base nativa)|MESA|S|
|RAG-106|Perplexity API como provedor de busca em terceiros|Outros produtos chamam API sonar/perplexity para respostas já sintetizadas com citações|Open WebUI (provider "perplexity"), LibreChat [INFERIDO]|DIFF|S|
|RAG-107|Agregadores de SERP (SerpApi/SearchApi/Serply/serpstack)|Camada de abstração sobre SERPs de vários motores via um endpoint|Open WebUI (lista nativa)|MESA|S|
|RAG-108|Endpoint de busca externo customizado|Usuário aponta para sua própria API de busca self-built|Open WebUI (`Web Search Engine = external`)|DIFF|M|
|RAG-109|Busca web automática (modelo decide)|LLM detecta necessidade de dados atuais e dispara busca sem ação do usuário|ChatGPT, Perplexity (default), Kagi Assistant, Claude.ai, Gemini|MESA|L|
|RAG-110|Busca web manual (toggle do usuário)|Usuário liga explicitamente toggle "Search/Web" antes de perguntar|Open WebUI, Kagi Assistant, LibreChat, ChatGPT|MESA|S|
|RAG-111|Modo agentic search (multi-hop, segue links)|Modelo decide quais páginas específicas abrir e ler, iterando|Open WebUI (agentic), Perplexity (Deep Research), ChatGPT (Deep Research), Gemini Deep Research|FRONT|XL|
|RAG-112|Número de resultados configurável (top-K)|Admin/usuário define quantos resultados de busca entram no contexto|Open WebUI (env var), Dify|MESA|S|
|RAG-113|Concurrency/rate-limit configurável de busca|Controla nº de chamadas simultâneas ao provedor|Open WebUI (`WEB_SEARCH_CONCURRENT_REQUESTS`)|MESA (operacional)|S|
|RAG-114|Scraping de página completa (full-page fetch)|Baixa e extrai HTML da página inteira em vez de só o snippet|Open WebUI (agentic search), Perplexity, Firecrawl (usado por Dify/Open WebUI), SurfSense|DIFF|L|
|RAG-115|Apenas snippet/meta description|Usa só resumo retornado pela API de busca (título+snippet)|modo padrão de Serper/SerpApi/Google PSE quando full-page desligado|MESA|S|
|RAG-116|Citação de fonte web inline na resposta|Resposta traz links/números remetendo à fonte web exata usada|Perplexity, ChatGPT, Claude.ai, Gemini, Kagi Assistant, Open WebUI|MESA|M|
|RAG-117|Cache de resultados de busca|Evita rechamar mesma query ao provedor, reduz custo/latência|não documentado explicitamente nos produtos [INFERIDO]; Gemini Deep Research cita ~50-70% input tokens cached|DIFF|M|
|RAG-118|Deep Research — Perplexity|Decompõe pergunta em subtarefas, roteia a 20+ modelos, 3-5 buscas sequenciais, relatório com timeline/incerteza, export PDF|Perplexity (Deep Research, Pro/Enterprise)|FRONT|XL|
|RAG-119|Deep Research — Company Knowledge (ChatGPT)|Retrieval via apps conectados (Drive/Slack/GitHub/SharePoint) + web, síntese com citações|ChatGPT (Business/Enterprise/Edu)|FRONT|XL|
|RAG-120|Deep Research Agent (Gemini)|Loop autônomo planejar→buscar→ler→raciocinar, escala 80-160+ buscas, API exposta a devs|Gemini app, Google AI Studio (Interactions API)|FRONT|XL|
|RAG-121|Deep Research report export|Transforma relatório multi-etapa em artefato exportável/compartilhável|Perplexity (PDF/Page), SurfSense (podcasts/slide decks)|DIFF|M|
|RAG-122|Busca combinando fontes privadas + web na mesma consulta|Deep-research query cruza documentos do workspace com resultados web ao vivo sem trocar de modo|Perplexity Deep Research, Gemini Deep Research (Gmail/Drive+web), ChatGPT Company Knowledge|FRONT|XL|
|RAG-123|Research Assistant com benchmark próprio divulgado|Assistente com toggle de web powered by motor de busca próprio, benchmark divulgado (SimpleQA)|Kagi Assistant|DIFF|L|

## 9. Memória

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|RAG-124|Memória de longo prazo persistente entre conversas|Fatos permanecem sem precisar re-explicar em novas conversas|ChatGPT, Claude.ai, Gemini, Mistral Le Chat, Poe|MESA (2026)|XL|
|RAG-125|Extração automática de fatos sobre o usuário|Sistema infere e salva fato sozinho a partir da conversa, sem pedido explícito|ChatGPT (chat history insights), Gemini (automatic memory), Mistral Le Chat|MESA|L|
|RAG-126|Edição/deleção de memória individual pelo usuário|Lixeira por memória, granular, não só "apagar tudo"|ChatGPT (Manage Memory), Claude.ai, Gemini|MESA|M|
|RAG-127|Memória por projeto vs. memória global (isolada)|Dois espaços de memória que não se comunicam entre si|Claude.ai (único com esse isolamento documentado)|FRONT/DIFF|L|
|RAG-128|Referência/busca em conversas anteriores|Chat search que alimenta contexto da resposta atual|Claude.ai ("chat search and memory to build on previous context")|DIFF|M|
|RAG-129|Modo incógnito/temporário sem memória nem histórico|Conversa não grava memória nem aparece no histórico|ChatGPT (Temporary Chat), Claude.ai (Incognito), Gemini (Temporary Chats, retido 72h)|MESA|S|
|RAG-130|Exportação/portabilidade de memória entre produtos|Baixa memórias de um projeto e move para chatbot terceiro|Claude.ai (único caso confirmado no escopo)|FRONT|L|
|RAG-131|Perfil de usuário persistente estruturado ("memory bank")|Banco navegável de detalhes de vida/trabalho/preferências, não lista solta|Gemini (Saved Info), ChatGPT (Dreaming V3 reescreve memórias antigas)|DIFF/FRONT|XL|
|RAG-132|Instruções customizadas globais (system prompt persistente)|System prompt persistente do usuário, distinto de memória factual|ChatGPT (Custom Instructions), Gemini (Saved Info), Claude.ai (Custom Instructions/Styles)|MESA|S|
|RAG-133|Memória por agente customizado (não herda memória global)|Cada persona/gem tem contexto/conhecimento próprio, isolado|Gemini (Custom Gems), Khoj (agentes custom)|DIFF|M|
|RAG-134|Memória descontinuada/removida (sinal de mercado)|Feature de memória/knowledge base desligada por decisão de produto|Poe (Knowledge Base desligada mai/2026), T3 Chat (recusa implementar memória)|MORTO|N/A|

## 10. Conectores Empresariais

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|RAG-135|Conector Google Drive|OAuth individual, leitura de docs/sheets/slides|ChatGPT, Claude.ai (MCP), Microsoft Copilot, Notion AI, SurfSense, Onyx|MESA|M|
|RAG-136|Conector OneDrive/SharePoint (Microsoft Graph)|Indexa arquivos do 365 com metadados + ACL herdada via Graph|Microsoft Copilot (nativo), ChatGPT, Onyx [INFERIDO], Notion AI|MESA (ecossistema MS)|L|
|RAG-137|Conector Slack|Indexa histórico de canais/DMs|ChatGPT, Claude.ai (jan/2026), Onyx, Dify, SurfSense, Notion AI|MESA|M|
|RAG-138|Conector Notion|Indexa páginas/databases do Notion|ChatGPT, Claude.ai, Khoj, Onyx [INFERIDO], Dify, RAGFlow, SurfSense|MESA|M|
|RAG-139|Conector Confluence|Indexa espaços/páginas do Confluence|ChatGPT, Onyx, Dify, RAGFlow, SurfSense|MESA|M|
|RAG-140|Conector Jira|Indexa issues/projetos|Onyx, SurfSense, Notion AI, ChatGPT (Azure Boards análogo)|MESA|M|
|RAG-141|Conector GitHub|Indexa repos/PRs/issues|Claude.ai, ChatGPT, Onyx, Dify (via webhook), SurfSense, Notion AI|MESA|M|
|RAG-142|Conector Gmail|Indexa e-mails como fonte|ChatGPT, Claude.ai, Gemini Deep Research (nativo), SurfSense|MESA|M|
|RAG-143|Conector Salesforce|Indexa dados de CRM com ACL fina por Profile|ChatGPT (Company Knowledge), Onyx, Microsoft Copilot (Graph connector custom)|DIFF|L|
|RAG-144|Conector Zendesk|Indexa tickets/base de conhecimento de suporte|ChatGPT (Company Knowledge), Microsoft Copilot (external groups)|DIFF|M|
|RAG-145|Conector Amazon S3|Indexa objetos de bucket S3 como fonte|RAGFlow (sync online), Dify (Postgres/S3 out-of-the-box)|MESA (plataformas RAG técnicas)|M|
|RAG-146|Fonte "banco de dados SQL" direto (chat-with-database)|LLM gera/roda queries SQL contra banco relacional conectado, sem pré-indexação vetorial|AnythingLLM (SQL Connector agent), Dify (Postgres nativo)|DIFF|L|
|RAG-147|Sincronização incremental (delta sync)|Após ingestão inicial, busca só o que mudou/foi criado desde último sync|Microsoft Graph connectors, Onyx, SurfSense|MESA|L|
|RAG-148|ACL da fonte propagada ao índice (permission-aware retrieval)|Cada item indexado carrega ACL original; busca filtra automaticamente por quem pode ver o quê|Microsoft Copilot (ACL "stamped"), Onyx (Enterprise, Auto Sync Permissions), ChatGPT Enterprise (security trimming)|FRONT|XL|
|RAG-149|Limitação: ACL só atualiza em full crawl|Mudança de permissão na fonte só reflete no índice após full re-crawl, não no incremental|Microsoft Copilot (documentado oficialmente pela Microsoft)|FRONT (armadilha, não feature)|XL|
|RAG-150|Modos de acesso do conector (Private/Public/Auto-Sync)|Admin escolhe se conector é visível só a quem criou, a todos, ou herda ACL real da fonte|Onyx (3 modos documentados)|DIFF|L|
|RAG-151|External groups / mapeamento de grupos não-Entra|Para fontes sem identidade Microsoft Entra, admin mapeia grupos externos p/ security trimming|Microsoft Copilot (Graph connectors)|FRONT|XL|
|RAG-152|OAuth por usuário individual (não só service account)|Cada usuário final autentica sua própria conta na fonte, não um service account guarda-chuva|ChatGPT, Claude.ai, SurfSense|MESA (closed)/DIFF (OSS)|L|
|RAG-153|Diretório/marketplace de conectores|Catálogo pesquisável de integrações prontas, incluindo terceiros via protocolo aberto|Claude.ai (Connectors Directory, 200+ via MCP), Dify (Marketplace), RAGFlow (30+ plataformas)|FRONT|XL|
|RAG-154|Conector como plugin externo (MCP como padrão)|Conector é servidor MCP genérico em vez de integração hardcoded|Claude.ai (base MCP), ChatGPT (migrando)|FRONT|XL|
|RAG-155|Base de conhecimento externa via API (federação entre produtos RAG)|Um produto RAG conecta-se ao índice de outro via API padronizada, sem duplicar ingestão|Dify ↔ RAGFlow (endpoint `/api/v1/dify`)|DIFF|M|

## Armadilhas

- **Troca de embedding model sem reindexação = corrupção silenciosa.** Buscas comparam vetores de espaços incompatíveis sem erro visível. Qualquer produto que permita trocar modelo precisa bloquear até reindex completo ou versionar índices por modelo (AnythingLLM documenta o risco abertamente).
- **Top-K e Score Threshold "mudos" sem reranker ativo.** No Dify, esses campos só têm efeito com rerank ligado — parâmetro visível ≠ funcional. Auditar toda UI de retrieval perguntando "isso muda o resultado sem outra flag ligada?".
- **"Late chunking", "auto-merge de chunks" e "sentence-window" são hype de blog/framework, não feature de produto.** Zero dos 16+ produtos verificados expõem toggle de UI — existem em LlamaIndex/LangChain como componente, não como botão finalizado.
- **Tabela em PDF é o ponto de fricção universal.** Mesmo RAGFlow precisa OCR em 4 rotações + XGBoost para não quebrar tabela; AnythingLLM admite ser seu ponto fraco. Toda claim de "extração perfeita de tabela" merece teste com célula mesclada real.
- **Delta/change detection é meia-feature em quase todo produto.** "Reingestão periódica" ≠ "detecção de delta real" — maioria reprocessa o documento inteiro no ciclo. Só Onyx separa prune de refresh, e mesmo assim documentado como issue em andamento.
- **"Permission-aware retrieval" é o item mais fácil de fingir e mais caro de fazer certo.** Muitas ferramentas "têm conector Drive" mas ingerem tudo com um único service account sem propagar ACL por item — isso é vazamento de dados disfarçado de feature.
- **ACL fica desatualizada silenciosamente entre full crawls** (documentado oficialmente pela Microsoft): perda de acesso na fonte só reflete no índice no próximo full re-crawl — janela de exposição real.
- **Citação ≠ verificação de suporte.** Quase todo produto faz retrieval-then-cite (mostra de onde veio o chunk) mas nenhum verifica se a frase gerada é de fato sustentada pelo chunk citado — lacuna sistêmica de mercado inteiro, não de um produto isolado.
- **"Confidence score" de citação em marketing quase sempre é score de retrieval (similaridade vetorial), não score de suporte de claim.** Dify expõe "matching degree" só para admin/debug, não como UX de confiança ao usuário final.
- **Highlight visual pixel-level exige parsing posicional do PDF** (bounding box por token/linha), não só chunking de texto — por isso só NotebookLM e RAGFlow (deepdoc) entregam isso; a maioria para em "link para o documento".
- **RAPTOR e GraphRAG são desligados por padrão por custo de tokens** (RAGFlow explicita isso) — replicar "para ter no catálogo" sem alertar sobre custo de produção 10-50x maior é armadilha real.
- **BM25 weight mal calibrado = "hybrid" falso.** Peso 0 ou 1 desperdiça a infra de dois índices para resultado de um só; Open WebUI recomenda 0.4-0.6 mas poucos produtos explicam isso ao usuário.
- **Full-page web scraping infla custo de tokens dramaticamente.** Gemini Deep Research documenta 250k-900k tokens de input por consulta — produtos sem cache de contexto de pesquisa pagam isso a cada query repetida.
- **"Deep Research" é termo de marketing sem definição fixa** — Perplexity (3-5 buscas sequenciais), ChatGPT Company Knowledge (fontes internas+web), Gemini (agente com API própria) são arquiteturas categoricamente diferentes; comparar como a mesma feature é erro.
- **Memória por projeto isolada da memória global é raro** — só Claude.ai documenta essa arquitetura; ChatGPT/Gemini tendem a memória única global que vaza para todo contexto.
- **Quota de armazenamento e versionamento de documento são tratados como problema de infra de deploy, não feature de produto exposta ao usuário** — nenhum produto pesquisado expõe isso como UX; lacuna real de mercado.
- **SQLite-vec: alegar suporte sem fonte é erro comum.** Nenhum produto pesquisado documenta suporte nativo — resistir à tentação de marcar como suportado por popularidade em nichos adjacentes.

## Ordem de construção

1. **Ingestão básica** (upload de arquivo, colar texto, URL única) → pré-requisito de tudo.
2. **Parsing de texto nativo + DOCX/PPTX/XLSX** → antes de OCR/layout-aware (que são XL e podem ficar para depois).
3. **Chunking fixo/recursivo + overlap configurável** → mínimo viável antes de qualquer retrieval funcionar.
4. **Embedding local + 1 vector store (Chroma ou pgvector)** → depende de chunking pronto.
5. **Retrieval top-k + threshold** → depende de embeddings indexados.
6. **Citação numerada simples (chunk→fonte)** → depende de retrieval funcionando; é a MESA mínima de confiança do usuário.
7. **Coleções nomeadas + anexar a assistente/conversa** → organização é ortogonal, pode entrar em paralelo a partir do passo 4.
8. **BM25+vetor híbrido + reranking cross-encoder** → melhoria de qualidade sobre pipeline já funcional (não bloqueante).
9. **OCR + layout-aware + extração de tabela** → só depois que o pipeline de texto puro estiver estável; é o maior ralo de custo (XL) e afeta qualidade mais que qualquer retrieval tuning.
10. **Web search (1 provedor) + citação de fonte web** → módulo paralelo, não depende do pipeline de RAG de arquivo.
11. **Memória de longo prazo + extração automática de fatos** → módulo independente, mas se beneficia de ter "citação"/"edição de item" já resolvido para chunk, pois a UX de editar/deletar memória é o mesmo padrão.
12. **Conectores empresariais + ACL/permission-aware retrieval** → construir por último; depende de ingestão+parsing+chunking+retrieval maduros, e o ACL correto é o item mais caro (XL) e mais fácil de errar silenciosamente — nunca lançar conector sem esse design decidido primeiro.
13. **GraphRAG/RAPTOR/deep research multi-etapa/late chunking/HyDE/multi-query** → fronteira 2026, todos XL, avaliar caso a caso se valem o custo para o escopo do produto do usuário.

## Fontes

Ver lista consolidada de ~120 URLs efetivamente lidas pelos 4 scouts (docs oficiais Open WebUI, RAGFlow, Dify, AnythingLLM, Onyx, LibreChat, Khoj, Langflow, LlamaIndex/LangChain, SurfSense, Open Notebook, NotebookLM/Google, Perplexity, Microsoft Learn/Copilot, Anthropic/Claude, OpenAI/ChatGPT, Kagi, Notion AI, Msty, T3 Chat, Poe, Mistral) — transcritas integralmente nos 4 dossiês-fonte: `history://Knowledge.IngestParseChunk`, `history://Knowledge.EmbedRetrieval`, `history://Knowledge.CitesOrgMemoria`, `history://Knowledge.WebSearchConectores`.

---

# 5. `TOOL` — Ferramentas, MCP e agentes

## 1. Function Calling

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|TOOL-01|Tool schema JSON (function calling nativo)|Define nome/descrição/parâmetros de tool em JSON Schema que o modelo usa para decidir chamar|universal (ChatGPT, Claude.ai, Gemini, Mistral Le Chat, Open WebUI, LibreChat)|MESA|M|
|TOOL-02|Tool calling paralelo|Modelo emite múltiplas chamadas de tool no mesmo turno, executadas concorrentemente|ChatGPT, Claude.ai, Gemini, Open WebUI, LibreChat, Dify|DIFF|M|
|TOOL-03|Tool calling em série encadeado|Resultado de uma tool alimenta o argumento da próxima automaticamente, sem novo turno do usuário|Claude.ai, ChatGPT, LibreChat Agents, Dify|DIFF|M|
|TOOL-04|Streaming de argumentos de tool call|Argumentos JSON da chamada chegam incrementalmente via streaming, exibidos enquanto o modelo gera|ChatGPT API, Claude API, Open WebUI, assistant-ui|DIFF|M|
|TOOL-05|Validação de argumento contra JSON Schema|Client valida args recebidos do modelo contra o schema antes de executar, rejeitando inválidos|LibreChat, Dify, n8n, Langflow|MESA|S|
|TOOL-06|Retry automático em erro de tool|Reenvia erro da tool ao modelo para correção automática de argumento e nova tentativa|Claude Code, ChatGPT, LibreChat, Dify workflow retry|DIFF|M|
|TOOL-07|Exibição do call e do resultado na UI|Renderiza nome da tool, argumentos e resultado como bloco distinto na conversa|Open WebUI, LibreChat, Claude.ai, ChatGPT, Big-AGI|MESA|S|
|TOOL-08|Colapso/expansão do bloco de tool call|Bloco de chamada de tool minimizado por padrão, expansível por clique|ChatGPT, Claude.ai, Claude Code, Open WebUI|MESA|S|
|TOOL-09|Seleção manual de tool pelo usuário|Usuário escolhe explicitamente qual tool ativar/usar antes de enviar a mensagem (não delega ao modelo)|Open WebUI, LibreChat, AnythingLLM|DIFF|S|
|TOOL-10|tool_choice forçado (auto/none/required/específico)|Parâmetro de API força o modelo a sempre, nunca, ou obrigatoriamente chamar uma tool nomeada|OpenAI API, Anthropic API, Mistral API, LiteLLM (repassado por LibreChat/Dify)|DIFF|S|
|TOOL-11|Limite de iterações do loop de tool|Corta o loop de chamadas de tool após N iterações para evitar loop infinito/custo descontrolado|LibreChat Agents, Dify, n8n, Claude Code (max turns)|MESA|S|
|TOOL-12|Tool result como bloco estruturado tipado (imagem, tabela, erro)|Resultado de tool não é só texto — pode ser imagem, JSON estruturado, erro tipado renderizado distinto|Claude API (tool_result content blocks), OpenAI, Open WebUI|DIFF|M|
|TOOL-13|Cache de resultado de tool determinística|Evita rechamar a mesma tool com os mesmos argumentos na mesma sessão|[INFERIDO] LangGraph-based stacks, Dify (cache de nó)|FRONT|M|

## 2. MCP (Model Context Protocol)

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|TOOL-14|Cliente MCP|App conecta a servidores MCP externos e expõe as tools deles ao modelo|Claude.ai, Claude Code, ChatGPT (Apps/connectors), LibreChat, Open WebUI, LM Studio, Cherry Studio, Witsy, VS Code|MESA|L|
|TOOL-15|Transporte stdio|Conecta a servidor MCP local via processo filho e stdin/stdout|Claude Desktop, LibreChat, Open WebUI, LM Studio, Cherry Studio|MESA|M|
|TOOL-16|Transporte SSE (legado)|Conecta a servidor MCP remoto via Server-Sent Events (transporte HTTP+SSE pré-2025-03-26)|LibreChat, Open WebUI, versões antigas de vários clientes|MORTO|M|
|TOOL-17|Transporte Streamable HTTP|Transporte HTTP unificado (request/response + stream opcional) que substitui HTTP+SSE desde spec 2025-03-26|Claude.ai (remote MCP), ChatGPT connectors, LibreChat, Open WebUI|MESA|M|
|TOOL-18|Autorização OAuth de servidor MCP remoto (spec 2025-06-18)|Cliente descobre authorization server via Protected Resource Metadata (RFC9728) e negocia OAuth 2.1 com Resource Indicators (RFC8707)|Claude.ai remote connectors, ChatGPT connectors, LibreChat (MCPOAuthHandler)|FRONT|L|
|TOOL-19|Descoberta de servidor MCP via registry/marketplace|UI lista servidores MCP catalogados (mcp.so, marketplace oficial) para instalar com um clique|Claude.ai (Directory), ChatGPT (Apps), Open WebUI (community), Smithery-style registries|DIFF|M|
|TOOL-20|Instalação de servidor MCP pela UI (sem editar config)|Formulário na UI adiciona servidor MCP (comando, args, env, URL) sem editar JSON manualmente|Claude Desktop, LM Studio, Cherry Studio, Open WebUI, LibreChat|DIFF|M|
|TOOL-21|Toggle de servidor MCP inteiro (on/off)|Liga/desliga um servidor MCP completo por conversa ou globalmente sem removê-lo|Claude.ai, Open WebUI, LibreChat, LM Studio|MESA|S|
|TOOL-22|Toggle por tool individual dentro do servidor|Habilita/desabilita ferramentas específicas de um servidor MCP, não o servidor todo|LibreChat, Claude Code (`/permissions`), Cherry Studio|DIFF|S|
|TOOL-23|Escopo de servidor MCP por usuário vs global (multi-tenant)|Admin configura servidores globais para todos; usuário individual adiciona os seus próprios, isolados|LibreChat (MCPManager por usuário), Open WebUI (admin vs user)|DIFF|M|
|TOOL-24|Sandbox de servidor MCP stdio|Processo filho stdio roda isolado (container/microVM) em vez de acesso direto ao host|LibreChat Code Interpreter sandbox (NsJail/libkrun), Docker MCP Toolkit, Claude Code sandbox mode|FRONT|L|
|TOOL-25|MCP Resources (contexto anexável)|Servidor expõe recursos (arquivos, dados) que o cliente pode listar e anexar ao contexto sem ser uma tool call|Claude Desktop, VS Code MCP, mcp-inspector, clientes MCP completos|DIFF|M|
|TOOL-26|MCP Prompts (templates reutilizáveis do servidor)|Servidor expõe prompts pré-definidos parametrizáveis que o usuário invoca via slash-command|Claude Desktop, VS Code, poucos clientes de chat completam este primitivo|DIFF|M|
|TOOL-27|MCP Sampling|Servidor solicita ao cliente que rode uma completion do LLM em nome dele (fluxo reverso servidor→cliente)|Suporte parcial em Claude Desktop, VS Code; poucos hosts completam|FRONT|L|
|TOOL-28|MCP Elicitation|Servidor pede input estruturado adicional ao usuário no meio da execução da tool (form gerado dinamicamente)|Spec 2025-06-18; suporte em VS Code, clientes de referência (inspector); adoção ampla ainda rara|FRONT|L|
|TOOL-29|MCP Apps / mcp-ui (UI interativa embutida)|Tool retorna recurso `ui://` HTML renderizado em iframe sandboxed dentro da resposta (dashboards, forms)|ChatGPT (Apps SDK), Claude.ai/Claude Code, VS Code, Goose|FRONT|L|
|TOOL-30|Proxy MCP→OpenAPI (tipo mcpo)|Expõe servidores MCP como endpoints OpenAPI/REST padrão, permitindo consumo por qualquer cliente HTTP|Open WebUI (mcpo), ferramentas de terceiros|DIFF|M|
|TOOL-31|Servidor MCP próprio (expor a ferramenta do app para fora)|App roda seu próprio servidor MCP, expondo suas capacidades para outros clientes MCP consumirem|Claude Code (`claude mcp serve`), Dify (MCP server mode), n8n (MCP Server Trigger node)|DIFF|L|
|TOOL-32|MCP roots|Cliente informa ao servidor o(s) diretório(s)/URI(s) raiz aos quais tem acesso, limitando escopo de arquivo|Claude Desktop, VS Code, clientes de referência|DIFF|S|

## 3. OpenAPI/REST Tools

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|TOOL-33|Importar spec OpenAPI e gerar tools|Cola/upload de um `openapi.json`/YAML e cada operação vira uma tool disponível ao modelo|LibreChat (Actions), Open WebUI, ChatGPT GPTs (Actions), Dify (custom tools)|DIFF|M|
|TOOL-34|Auth por header estático (API key)|Tool importada carrega header fixo (Authorization/X-API-Key) configurado uma vez pelo admin|LibreChat, Open WebUI, Dify, ChatGPT Actions|MESA|S|
|TOOL-35|Auth OAuth2 para tool OpenAPI (per-user)|Cada usuário autoriza individualmente a ferramenta externa via OAuth2 antes do uso (token isolado por usuário)|ChatGPT Actions, LibreChat, Dify|DIFF|L|
|TOOL-36|Mapeamento de parâmetro OpenAPI→argumento LLM|Renomeia/filtra/injeta valores de parâmetros da spec para o schema que o modelo vê (esconder campos internos)|LibreChat, Dify, n8n (HTTP Request node com AI param mapping)|DIFF|M|
|TOOL-37|Teste manual da chamada na UI antes de ativar|Botão "testar" executa a operação com parâmetros de exemplo e mostra a resposta bruta, sem envolver o modelo|Dify (debug tool), LibreChat Actions setup, painéis internos tipo Postman|DIFF|S|
|TOOL-38|Import automático de plugin/GPT Actions manifest legado|Reaproveita `ai-plugin.json`/manifest de ChatGPT Plugins (descontinuado) como fonte de tool|ChatGPT Plugins (formato original)|MORTO|S|

## 4. Execução de Código

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|TOOL-39|Pyodide no browser (Python via WASM)|Executa Python inteiramente client-side via WebAssembly, sem servidor nem container|Open WebUI (code execution via Pyodide), JupyterLite-based tools|DIFF|M|
|TOOL-40|Container efêmero por execução (Docker/gVisor/Firecracker)|Cada execução (ou sessão) roda em container/microVM descartável isolado do host|ChatGPT Code Interpreter, Claude Code (bash tool sandbox), E2B, Daytona, LibreChat Code Interpreter API|MESA|L|
|TOOL-41|Jupyter kernel real conectado|Executa código contra um kernel Jupyter real (não simulado), preservando namespace entre células|Jan (Jupyter extension), Open WebUI (Jupyter integration), JupyterLab AI extensions, Chainlit|DIFF|M|
|TOOL-42|Persistência de estado entre execuções na mesma sessão|Variáveis, imports e arquivos definidos numa chamada continuam disponíveis na próxima, mesmo container|ChatGPT Code Interpreter (mesmo container até expirar), LibreChat Code Interpreter, Daytona workspaces|MESA|M|
|TOOL-43|Upload de arquivo para o sandbox|Usuário anexa arquivo que é montado no filesystem do sandbox (ex.: `/mnt/data`) para o código processar|ChatGPT, Claude.ai (Analysis/Code Execution), LibreChat, Open WebUI|MESA|M|
|TOOL-44|Download de artefato gerado pelo sandbox|Arquivo criado pela execução (CSV, imagem, zip) fica disponível como link de download na resposta|ChatGPT, Claude.ai, LibreChat, Open WebUI|MESA|M|
|TOOL-45|Gráfico matplotlib/plot renderizado inline|Saída gráfica do código (matplotlib, plotly) é capturada e exibida como imagem na conversa|ChatGPT, Claude.ai, LibreChat, Open WebUI, Jupyter-based tools|MESA|M|
|TOOL-46|Instalação de pacote dentro do sandbox|Código pode rodar `pip install`/`npm install` dentro do container efêmero antes de executar|ChatGPT Code Interpreter (rede desabilitada p/ pip externo, usa pré-instalados), Daytona, E2B, Claude Code|DIFF|M|
|TOOL-47|Limite de tempo de execução (timeout)|Execução é abortada após N segundos para evitar loop infinito consumindo recursos|universal em sandboxes sérios (ChatGPT ~60min sessão, E2B, Daytona, LibreChat)|MESA|S|
|TOOL-48|Limite de memória do container|Container tem teto de RAM fixo (ex.: 1GB) e é morto/erro ao exceder|ChatGPT Code Interpreter (1GB default), Azure Container Apps sessions, E2B, Daytona|MESA|S|
|TOOL-49|Isolamento de rede do sandbox (sem acesso à internet)|Sandbox roda sem rota de saída para internet, só acesso a arquivos locais e pacotes pré-instalados|ChatGPT Code Interpreter, muitos sandboxes E2B configuráveis|MESA|M|
|TOOL-50|Aprovação humana antes de executar código|UI pausa e pede confirmação explícita do usuário antes de rodar o código gerado pelo modelo|Claude Code (permission prompts), Cursor, Cline, Aider (auto-confirm off)|DIFF|S|
|TOOL-51|Execução de shell/comando de sistema arbitrário|Tool dedicada roda comandos de shell no sandbox/host, não restrita a um interpretador de linguagem|Claude Code (Bash tool), OpenAI Codex CLI, text-generation-webui (extensões), Open Interpreter|DIFF|M|
|TOOL-52|Execução de SQL contra banco de dados conectado|Tool roda query SQL diretamente contra um banco relacional configurado pelo usuário e retorna resultado tabular|Dify (SQL tool/plugin), n8n (Postgres/MySQL node com AI Agent), Onyx, integrações estilo Vanna|DIFF|M|
|TOOL-53|Execução programática de tools via código (orquestração no sandbox)|Modelo escreve código que chama stubs de tools MCP dentro do sandbox em loops/condicionais, em vez de 1 tool call por turno|LibreChat (Programmatic Tool Calling), padrão Anthropic "code execution with MCP"|FRONT|L|
|TOOL-54|Runtime multi-linguagem no mesmo sandbox|Sandbox suporta Python, Node.js, Go, Java, Rust, etc., não só Python|LibreChat Code Interpreter, E2B (multi-runtime), Daytona|DIFF|M|

## 5. Computer/Browser Use

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|TOOL-55|Browser headless controlado pelo modelo|Modelo dirige um browser Chromium headless via ferramenta dedicada (goto, click, extract)|ChatGPT (cloud browser/Atlas agent mode), Perplexity Comet, Claude (via MCP browser servers), agentes baseados em Browserbase|DIFF|L|
|TOOL-56|Loop navegação+screenshot ("Computer Use")|Loop screenshot→análise visual→ação de mouse/teclado→novo screenshot, repetido até objetivo|Claude computer-use tool, OpenAI CUA/Operator-derivado em ChatGPT Work|FRONT|XL|
|TOOL-57|Preenchimento de formulário web autônomo|Agente identifica campos de formulário na página e preenche com dados fornecidos ou inferidos|ChatGPT Work/Operator legado, Claude computer use, browser-use (lib OSS usada por vários agentes)|DIFF|L|
|TOOL-58|Extração estruturada de página web|Converte conteúdo de página em JSON estruturado conforme schema pedido (preço, tabela, lista)|Perplexity, ferramentas com Firecrawl, Claude com ferramenta de scraping, n8n (HTML Extract + AI)|DIFF|M|
|TOOL-59|Controle de desktop completo (não só browser)|Agente controla SO inteiro: abrir apps, mover janelas, clicar em qualquer elemento da tela, não só web|Claude computer-use (Docker ref. impl.), OpenAI CUA (benchmark OSWorld)|FRONT|XL|
|TOOL-60|Gravação e replay de sessão de automação|Sessão de ações do agente no browser/desktop é gravada e pode ser reexecutada deterministicamente depois|browser-use (session recording), ferramentas RPA adjacentes (n8n com trigger replay)|FRONT|L|
|TOOL-61|Aprovação humana por passo em ação sensível|Antes de cada ação potencialmente destrutiva (compra, envio, delete) o agente pausa pedindo confirmação|ChatGPT Operator/Work (ex.: checkout de compra), Claude computer use (classificador de ação sensível)|DIFF|M|
|TOOL-62|Classificador de prompt injection em screenshot|Sistema detecta texto malicioso embutido na página/tela renderizada e pede confirmação antes de agir|Claude computer use (classificadores automáticos)|FRONT|L|

## 6. Agentes

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|TOOL-63|Loop de iteração com critério de parada|Agente repete ciclo pensar→agir→observar até condição de sucesso, erro ou limite ser atingido|Claude Code, LibreChat Agents, Dify Agent node, Langflow, n8n AI Agent node|MESA|M|
|TOOL-64|Planejamento explícito antes de agir|Agente gera um plano em texto/estrutura antes de começar a executar tool calls|Claude Code (plan mode), ChatGPT Work, Cursor (plan mode), agentes tipo Devin|DIFF|M|
|TOOL-65|Todo list visível e atualizada em tempo real|Lista de subtarefas exibida na UI, com itens marcados concluídos conforme o agente avança|Claude Code (TodoWrite), Cursor, Windsurf, ChatGPT Work|DIFF|M|
|TOOL-66|Subagentes com contexto próprio (janela isolada)|Agente principal despacha subtarefa para um subagente com seu próprio context window, evitando poluir o principal|Claude Code (Task tool/subagents), LibreChat (Subagents), frameworks tipo Manus|FRONT|L|
|TOOL-67|Delegação explícita entre agentes (handoff)|Um agente transfere controle total da conversa/tarefa para outro agente especializado|OpenAI Swarm/Agents SDK handoffs, LibreChat Agent Plugins, Dify (multi-agent chatflow)|FRONT|L|
|TOOL-68|Agentes especializados por papel (roles pré-definidos)|Biblioteca de personas de agente com prompt/tools fixos por função (pesquisador, revisor, coder)|Dify, LibreChat (Agent Builder), integrações estilo CrewAI, Langflow|DIFF|M|
|TOOL-69|Agent Skills (instruções + scripts empacotados)|Pacote de markdown de instrução + scripts auxiliares que o agente carrega sob demanda por nome/gatilho|Claude (Agent Skills/Claude Code), LibreChat (Skills)|FRONT|L|
|TOOL-70|Memory do agente (persistente entre sessões)|Agente grava fatos/preferências relevantes e os recupera automaticamente em conversas futuras|ChatGPT (Memory), Claude.ai (Memory), LibreChat, integrações estilo Mem0|DIFF|L|
|TOOL-71|Conjunto de ferramentas por agente (tool scoping)|Cada agente/persona tem sua própria lista de tools habilitadas, não o conjunto global inteiro|LibreChat Agent Builder, Dify, Langflow, Claude Code subagents (`tools:` frontmatter)|DIFF|S|
|TOOL-72|Budget de tokens/passos por execução|Limite configurável de tokens gastos ou número de steps antes do agente ser forçado a parar|Claude Code (context/turn limits), Dify (max iterations), n8n AI Agent (max iterations)|MESA|S|
|TOOL-73|Cancelamento de execução de agente em curso|Usuário interrompe a execução do agente no meio de um loop multi-step, preservando progresso parcial|ChatGPT, Claude.ai, Claude Code (ESC/Ctrl-C), LibreChat|MESA|S|
|TOOL-74|Transcript/trace completo de raciocínio e ações do agente|Log auditável de cada passo do agente (pensamento, tool call, resultado) navegável após a execução|Claude Code, LibreChat, Langflow, Dify (log de execução)|DIFF|M|

## 7. Workflows

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|TOOL-75|Builder visual de DAG (drag-and-drop de nós)|Editor gráfico para montar pipeline conectando nós de LLM, tool, transformação, etc.|n8n, Dify Workflow, Langflow, Flowise|MESA|L|
|TOOL-76|Nó condicional (if/else, switch)|Roteia o fluxo para ramos diferentes com base em expressão avaliada sobre dados do nó anterior|n8n, Dify, Langflow|MESA|M|
|TOOL-77|Loop/iteração sobre lista dentro do workflow|Nó repete um subgrafo para cada item de uma coleção (map/for-each)|n8n (Loop node), Dify (Iteration node), Langflow|DIFF|M|
|TOOL-78|Execução paralela de ramos no workflow|Múltiplos nós independentes executam simultaneamente e sincronizam depois (fan-out/fan-in)|n8n, Dify (parallel branches), Langflow|DIFF|M|
|TOOL-79|Variáveis compartilhadas entre nós|Estado/valor definido num nó é referenciável por nome em qualquer nó posterior do grafo|n8n, Dify (conversation/user variables), Langflow|MESA|M|
|TOOL-80|Disparo por webhook|Workflow inicia ao receber requisição HTTP externa, com payload mapeado para variáveis de entrada|n8n, Dify (API trigger), Langflow|MESA|M|
|TOOL-81|Disparo agendado (cron)|Workflow roda automaticamente em horário/intervalo configurado, sem intervenção humana|n8n (Cron/Schedule Trigger), Dify (Trigger), ChatGPT Tasks (nível de app, não workflow)|MESA|S|
|TOOL-82|Human-in-the-loop com aprovação (pausa+resume)|Workflow suspende execução, notifica humano por canal configurado, e retoma só após aprovação/edição|n8n (Human-in-the-loop tool), Dify (Human Input node, pausas por semanas)|FRONT|L|
|TOOL-83|Retry configurável por nó|Cada nó individual pode ter política própria de retry (tentativas, backoff) em caso de falha|n8n (node retry settings), Dify, Langflow|DIFF|S|
|TOOL-84|Versionamento de workflow|Histórico de versões do workflow com possibilidade de reverter/comparar mudanças|Dify (workflow versions/publish), n8n (via git/source control), Langflow|DIFF|M|
|TOOL-85|Execução em background com notificação de conclusão|Workflow roda assincronamente e usuário é avisado (in-app/e-mail) quando termina, sem manter aba aberta|n8n, Dify (async execution), ChatGPT Tasks|DIFF|M|
|TOOL-86|Sub-workflow reutilizável (composição de fluxos)|Um workflow chama outro workflow inteiro como se fosse um nó, permitindo reuso modular|n8n (Execute Workflow node), Dify (Workflow-as-tool), Langflow|DIFF|M|

## 8. Automação e Background

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|TOOL-87|Tarefas agendadas em linguagem natural (ChatGPT Tasks)|Usuário pede "todo dia às 8h faça X" e o app cria e gerencia o agendamento sozinho, sem UI de cron|ChatGPT (Tasks), Claude.ai (scheduled tasks)|DIFF|M|
|TOOL-88|Agente de longa duração (horas, multi-sessão)|Agente continua trabalhando num projeto por horas, sobrevivendo a reconexões, entregando artefato final|ChatGPT Work, Claude Code (long-running sessions), agentes tipo Devin|FRONT|XL|
|TOOL-89|Fila de mensagens/tarefas para processamento assíncrono|Requisições enfileiradas e processadas por workers em background, desacoplado do request-response síncrono|n8n (queue mode), Dify (async worker), plataformas self-hosted com Redis/Celery|DIFF|M|
|TOOL-90|Notificação push/in-app quando tarefa termina|Alerta visual/push avisa o usuário assim que uma tarefa longa ou agendada é concluída|ChatGPT (mobile push), Claude.ai, n8n (via node de notificação)|DIFF|S|
|TOOL-91|Resultado entregue por e-mail|Sistema envia o resultado final da tarefa/agente por e-mail automaticamente ao concluir|ChatGPT Tasks (e-mail digest), n8n (email node), Dify (via plugin)|DIFF|S|
|TOOL-92|Execução persiste com o app/browser fechado|Tarefa continua rodando no servidor mesmo se o usuário fechar a aba/app, sem manter conexão ativa|ChatGPT Tasks/Work, n8n self-hosted, Dify|MESA|M|

## 9. Segurança de Tools

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|TOOL-93|Detecção de prompt injection via conteúdo de tool|Sistema varre resultado de tool (página web, doc, e-mail) por instruções injetadas antes de repassar ao modelo|Claude (injection classifiers em computer use/tools), ChatGPT (connector content filtering)|FRONT|L|
|TOOL-94|Allowlist de domínio para tools de rede/browser|Restringe quais domínios a tool de fetch/browser pode acessar, bloqueando o resto por padrão|Claude Code (permitted domains), deployments enterprise de LibreChat/Open WebUI|DIFF|S|
|TOOL-95|Confirmação obrigatória em ação destrutiva|Ações classificadas como destrutivas (delete, pagamento, envio) exigem clique explícito de confirmação, mesmo com auto-approve geral ligado|Claude Code, Cursor, ChatGPT Work (compras)|MESA|S|
|TOOL-96|Isolamento de credencial por servidor/tool|Token/API key de uma tool não é visível nem acessível a outras tools ou ao prompt do modelo diretamente|LibreChat (per-user OAuth tokens isolados), Dify (secret variables), Open WebUI|DIFF|M|
|TOOL-97|Auditoria/log de toda chamada de tool|Registro imutável de quem/quando/quais argumentos foram usados em cada chamada de tool, para revisão posterior|LibreChat (admin logs), Dify (execution logs), Claude/ChatGPT enterprise (admin audit log)|DIFF|M|
|TOOL-98|Limite de taxa (rate limit) por tool|Restringe quantas vezes uma tool específica pode ser chamada por usuário/período, evitando abuso ou custo explosivo|Dify (tool rate limiting), n8n (via node de controle), plataformas enterprise|DIFF|S|

---

## Armadilhas

- **Loop infinito de tool calling**: sem limite de iterações (TOOL-11/TOOL-72), um modelo que reinterpreta mal um erro de tool entra em loop retry→erro→retry infinito; sempre corte por contagem de passos E por budget de tokens, não só um dos dois.
- **Validação de argumento tratada como opcional**: modelos alucinam campos fora do enum ou tipos errados (string em vez de int); pular TOOL-05 propaga erro de runtime direto pro usuário em vez de dar ao modelo chance de se corrigir.
- **Streaming de argumentos parcial e JSON inválido**: renderizar argumentos de tool call enquanto ainda estão sendo streamados (TOOL-04) exige parser tolerante a JSON incompleto — parse ingênuo quebra a cada token.
- **MCP stdio sem sandbox = RCE de fato**: qualquer servidor MCP stdio instalado roda com os mesmos privilégios do processo host; sem TOOL-24, "instalar servidor MCP de terceiro" é execução arbitrária de código confiando cegamente no autor do servidor.
- **Confundir transporte SSE legado com Streamable HTTP**: muitos clientes ainda anunciam "suporte SSE" achando que é o transporte atual; a spec 2025-03-26 depreciou HTTP+SSE em favor de Streamable HTTP — implementar o errado quebra interoperabilidade com servidores novos.
- **OAuth de MCP tratado como OAuth de app comum**: a spec 2025-06-18 exige que o cliente descubra o authorization server via Protected Resource Metadata e use Resource Indicators (RFC 8707) — sem isso, um servidor MCP malicioso pode capturar tokens destinados a outro recurso (confused deputy).
- **Sandbox de código "efêmero" que na verdade persiste segredo**: reusar o mesmo container entre usuários/sessões para economizar cold-start (comum em implementações caseiras) vaza arquivos e variáveis de ambiente de uma sessão para outra.
- **Achar que limite de memória/tempo por si só = segurança**: container sem isolamento de rede (TOOL-49) ainda pode exfiltrar dados mesmo com timeout curto; rede e recursos são controles ortogonais.
- **Computer use sem classificador de injection**: qualquer texto na tela (incluindo conteúdo de terceiros, ex. anúncio numa página) é lido pelo modelo como se fosse instrução — sem TOOL-93/TOOL-62 a ação do agente pode ser sequestrada pela própria página que ele está navegando.
- **Human-in-the-loop sem timeout ou fallback**: pausar workflow esperando aprovação humana indefinidamente (sem branch de timeout, TOOL-82) trava a fila e nunca libera recursos alocados.
- **Subagentes que dividem o mesmo tool state**: dar a subagentes (TOOL-66) acesso às mesmas credenciais/tools do agente pai sem escopo próprio (TOOL-71) anula o isolamento que motivou usar subagentes.
- **OpenAPI import sem mapeamento de parâmetro**: expor a spec inteira ao modelo, incluindo parâmetros internos/sensíveis (ex. `user_id` que deveria vir do contexto de sessão, não ser adivinhado pelo modelo) é uma classe comum de bug de segurança e de alucinação de parâmetro.

## Ordem de construção

1. **Function calling básico** (TOOL-01, TOOL-05, TOOL-07): schema JSON + validação + exibição na UI. Tudo mais depende disso existir primeiro.
2. **Loop de tool calling com limite** (TOOL-11, TOOL-06, TOOL-08): loop de iteração, retry, colapso — transforma "uma tool call" em "conversa com ferramentas".
3. **tool_choice e paralelismo** (TOOL-02, TOOL-10): otimizações sobre o loop já funcionando; não bloqueiam nada abaixo.
4. **Execução de código local (Pyodide) antes de sandbox remoto**: Pyodide (TOOL-39) é ordem de grandeza mais barato que provisionar container/microVM (TOOL-40) e já ensina upload/download/gráfico (TOOL-43-45) sem infra de container.
5. **Sandbox remoto efêmero** (TOOL-40, TOOL-46-49) só depois de já saber o que o sandbox precisa suportar (linguagens, pacotes, timeouts) pelo protótipo Pyodide.
6. **MCP cliente stdio primeiro, remoto depois**: implementar TOOL-14/15 (cliente + stdio) é pré-requisito de tudo em MCP; SSE/Streamable HTTP (TOOL-16/17) e OAuth (TOOL-18) só fazem sentido depois que o cliente já fala o protocolo local corretamente.
7. **Sandbox de servidor MCP (TOOL-24) antes de UI de instalação com um clique (TOOL-20/TOOL-19)** — nunca abra "instalar servidor de terceiro" sem isolamento primeiro; a ordem inversa é a armadilha de RCE acima.
8. **Agentes simples (loop+parada, TOOL-63) antes de multi-agente (subagentes/handoff, TOOL-66/67)**: multi-agente sem um loop single-agent robusto e testado só multiplica a superfície de bugs.
9. **Workflows (builder visual) é o domínio mais caro (TOOL-75, custo L) — construir por último**, reaproveitando os primitivos de tool calling e agente já validados como "nós" do grafo, em vez de reimplementar execução do zero num motor de workflow.
10. **Segurança (seção 9) é transversal, não uma fase final**: allowlist de domínio, isolamento de credencial e auditoria devem entrar junto com cada camada (MCP, código, browser use), não como polimento depois de tudo pronto — mas confirmação de ação destrutiva (TOOL-95) e classificador de injection (TOOL-93) só ganham sentido depois que existir alguma ação real a confirmar (execução de código, browser use).
11. **Automação/background (seção 8) por último**: depende de workflows OU de agentes de longa duração já existirem; agendamento e fila são a camada de orquestração em cima, não a base.

## Fontes

- https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization
- https://modelcontextprotocol.info/specification/2025-06-18/changelog/
- https://modelcontextprotocol.io/specification/draft/client/elicitation
- https://stytch.com/blog/MCP-authentication-and-authorization-guide/
- https://blog.modelcontextprotocol.io/posts/2025-11-21-mcp-apps/
- https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/
- https://modelcontextprotocol.io/seps/1865-mcp-apps-interactive-user-interfaces-for-mcp
- https://mcpui.dev/guide/apps-sdk
- https://www.librechat.ai/docs/features/mcp
- https://www.librechat.ai/docs/features/agents
- https://www.librechat.ai/docs/features/code_interpreter
- https://deepwiki.com/danny-avila/LibreChat/5.6-mcp-integration
- https://github.com/danny-avila/librechat
- https://developers.openai.com/api/docs/guides/tools-code-interpreter
- https://fast.io/resources/code-interpreter-file-storage/
- https://whoismcafee.com/chatgpt-code-interpreter/
- https://en.wikipedia.org/wiki/OpenAI_Operator
- https://openai.com/index/computer-using-agent/
- https://help.openai.com/en/articles/10291617-scheduled-tasks-in-chatgpt
- https://help.openai.com/en/articles/11752874-chatgpt-agent
- https://thenextweb.com/news/openai-chatgpt-work-agent-launch
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool
- https://docs.claude.com/en/docs/agents-and-tools/tool-use/computer-use-tool
- https://www.digitalapplied.com/blog/anthropic-computer-use-api-guide
- https://whoisalfaz.me/blog/dify-ai-workflow-orchestration-vs-n8n-ai-agent-nodes/
- https://docs.n8n.io/advanced-ai/human-in-the-loop-tools/
- https://dify.ai/blog/the-human-input-node-bringing-human-judgment-into-automated-workflows
- https://docs.dify.ai/en/use-dify/nodes/human-input

---

# 6. `ART` — Artifacts, canvas e generative UI

## 1. Artifacts clássicos

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|ART-01|Painel lateral separado do chat|Renderiza conteúdo gerado num painel dedicado ao lado da conversa, não inline|Claude.ai, ChatGPT Canvas (retirado maio/2026), Gemini Canvas, Le Chat Canvas, Grok Studio, Open WebUI, LibreChat|MESA|M|
|ART-02|Detecção automática de "quando virar artifact"|Modelo decide heuristicamente que conteúdo >N linhas ou tipo (código/doc) merece painel em vez de bloco inline|Claude.ai, Gemini Canvas|DIFF|M|
|ART-03|Tipos de artifact: código com syntax highlight|Bloco de código com highlight por linguagem dentro do painel|universal|MESA|S|
|ART-04|Tipos de artifact: Markdown/documento|Render de markdown formatado (títulos, listas, tabelas) no painel|Claude.ai, ChatGPT, LibreChat|MESA|S|
|ART-05|Tipos de artifact: HTML renderizado|HTML+CSS+JS renderizado ao vivo em iframe|Claude.ai, Open WebUI, LibreChat, Le Chat|MESA|M|
|ART-06|Tipos de artifact: SVG renderizado|SVG cru virando imagem vetorial visível|Claude.ai, Open WebUI|DIFF|S|
|ART-07|Tipos de artifact: componente React|JSX/TSX compilado e montado no iframe com deps resolvidas|Claude.ai, Gemini Canvas/AI Studio, Le Chat|DIFF|L|
|ART-08|Tipos de artifact: diagrama Mermaid|Código mermaid virando diagrama SVG interativo|Claude.ai, Open WebUI, LibreChat, Notion AI|DIFF|S|
|ART-09|Versionamento com histórico completo|Cada regeneração do artifact cria versão nova navegável, não sobrescreve|Claude.ai|DIFF|M|
|ART-10|Diff visual entre versões|Comparação lado a lado ou inline destacando o que mudou entre duas versões do artifact|[INFERIDO] nenhum produto mainstream expõe diff visual nativo hoje — LibreChat/Open WebUI fazem overwrite simples|FRONT|M|
|ART-11|Restaurar versão anterior|Reverter artifact para uma versão específica do histórico, tornando-a a atual|Claude.ai|DIFF|S|
|ART-12|Republicar após edição|Nova publicação gera nova versão pública mantendo o link, só a versão selecionada fica visível|Claude.ai|DIFF|S|
|ART-13|Download do artifact|Exporta o conteúdo como arquivo (.html, .py, .md, .svg conforme tipo)|Claude.ai, ChatGPT, Gemini Canvas, Open WebUI, LibreChat|MESA|S|
|ART-14|Copiar conteúdo do artifact|Botão de copiar o código/texto puro para clipboard|universal|MESA|S|
|ART-15|Abrir artifact em nova aba/janela|Expande o artifact fora do painel para tela cheia em URL própria|Claude.ai, Open WebUI|DIFF|S|
|ART-16|Compartilhar artifact isoladamente (link público)|Gera URL pública do artifact sem expor o resto da conversa|Claude.ai, ChatGPT (antigo), Le Chat, Grok Studio|DIFF|M|
|ART-17|Remix de artifact publicado|Abre novo chat clonando o artifact de outra pessoa como ponto de partida editável|Claude.ai (via botão na página pública), Grok Studio|DIFF|M|
|ART-18|Biblioteca/galeria pessoal de artifacts|Lista todos os artifacts que o usuário já criou/publicou, buscável, fora do fluxo de conversa|Claude.ai ("Your artifacts")|DIFF|M|
|ART-19|Artifact com "inteligência embutida" (chama o modelo de dentro)|Artifact publicado pode invocar a API do modelo em runtime a partir de interação do usuário final (app real, não só estático)|Claude.ai (Artifacts com Claude embutido, jun/2025)|FRONT|XL|
|ART-20|Fechar/reabrir/minimizar painel sem perder estado|Painel pode ser recolhido e reaberto mantendo a versão atual e scroll|universal|MESA|S|

## 2. Preview ao vivo

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|ART-21|Sandbox iframe para HTML/JS|Executa HTML/CSS/JS arbitrário isolado do DOM principal via iframe|Claude.ai, Open WebUI, LibreChat, Le Chat, mcp-ui|MESA|M|
|ART-22|Preview React com deps via CDN ESM (esm.sh/importmap)|Resolve `import` de pacotes npm em runtime no browser sem build step, via `<script type="importmap">`|Claude.ai, Google AI Studio Build mode|DIFF|L|
|ART-23|Tailwind no preview sem build|Injeta Tailwind via CDN (play-cdn) ou JIT no iframe para estilizar sem pipeline|Claude.ai, Google AI Studio, muitos OSS (Open WebUI)|DIFF|S|
|ART-24|Console de erro do preview|Captura `console.error`/exceptions do iframe e exibe no painel para o usuário/modelo corrigir|Google AI Studio Build mode, [INFERIDO] Claude.ai exibe erro básico de render|DIFF|M|
|ART-25|Hot reload conforme o modelo edita|Preview atualiza automaticamente a cada novo trecho de código gerado, sem re-render completo|Claude.ai, Google AI Studio, Le Chat Canvas|DIFF|M|
|ART-26|Isolamento via `sandbox` attribute do iframe|Restringe `allow-scripts`/`allow-same-origin`/`allow-forms` seletivamente para impedir acesso ao parent|universal (implementação correta é o que varia)|MESA|S|
|ART-27|CSP dedicada ao preview|Content-Security-Policy própria do iframe bloqueando fetch para domínios não whitelisted e eval não sandboxed|Claude.ai, Google AI Studio (server-side proxy p/ apps full-stack)|DIFF|M|
|ART-28|Preview de SVG isolado|Renderiza SVG como imagem sem executar `<script>` embutido malicioso|Claude.ai|MESA|S|
|ART-29|Preview de diagrama Mermaid renderizado|Compila sintaxe mermaid client-side (mermaid.js) para SVG interativo com zoom/pan|Claude.ai, Open WebUI, LibreChat, Notion AI|DIFF|S|
|ART-30|Preview de vídeo/áudio gerado embutido no canvas|Player nativo tocando mídia (não gerada pelo LLM em si, mas anexada/linkada) direto no artifact|NotebookLM (Video/Audio Overview), Gemini|DIFF|M|
|ART-31|Preview full-stack com backend real (Node/DB)|Sobe runtime servidor (não só client) para apps com API keys e persistência, com deploy real|Google AI Studio Build mode (Cloud Run)|FRONT|XL|
|ART-32|Proxy de rede para chamadas externas do iframe sandboxado|Intercepta `fetch`/XHR do preview e roteia por proxy controlado pelo host (mcp-ui sandbox proxy)|mcp-ui (`AppRenderer` sandbox url)|FRONT|L|

## 3. Canvas/documento editável

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|ART-33|Edição direta pelo usuário no texto do artifact|Cursor editável, digitação livre dentro do painel como um editor de texto real|Claude.ai, ChatGPT Canvas (legado), Gemini Canvas, Le Chat|MESA|M|
|ART-34|Seleção de trecho + pedido de alteração localizada|Usuário seleciona um parágrafo/linha e pede ao modelo para reescrever só aquele trecho, sem regenerar tudo|ChatGPT Canvas, Claude.ai, Gemini Canvas|DIFF|M|
|ART-35|Comentário inline do modelo (estilo Google Docs)|IA insere comentários ancorados a um trecho específico, separados do texto|ChatGPT Canvas ("suggested edits")|DIFF|M|
|ART-36|Aceitar/rejeitar sugestão do modelo|Sugestões aparecem como diff proposto (like/dislike ou accept/reject por trecho) antes de aplicar|ChatGPT Canvas, GitHub Copilot (referência), Cursor (referência)|DIFF|M|
|ART-37|Atalho "encurtar"|Comando de um clique que pede reescrita mais curta do documento/trecho|ChatGPT Canvas|DIFF|S|
|ART-38|Atalho "alongar"|Comando de um clique para expandir o texto com mais detalhe|ChatGPT Canvas|DIFF|S|
|ART-39|Atalho "mudar tom"|Reescreve com tom diferente (formal, casual, persuasivo etc.) via menu pré-definido|ChatGPT Canvas|DIFF|S|
|ART-40|Atalho "mudar nível de leitura"|Ajusta complexidade de vocabulário/frase para público-alvo (ex.: nível 5ª série)|ChatGPT Canvas|DIFF|S|
|ART-41|Atalho "adicionar emoji/formatação final"|Aplica polimento de formatação (bullets, negrito, emoji) num clique|ChatGPT Canvas|DIFF|S|
|ART-42|Edição simultânea modelo+humano sem lock|Ambos podem alterar o mesmo documento em turnos alternados sem travar a sessão|Claude.ai, ChatGPT Canvas, Gemini Canvas|MESA|M|
|ART-43|Undo/redo dentro do canvas|Histórico de undo local do editor, independente do histórico de versões do artifact|ChatGPT Canvas, Claude.ai, Gemini Canvas|MESA|S|
|ART-44|Contagem de palavras/caracteres ao vivo|Contador exibido no rodapé do painel, atualizado por edição|ChatGPT Canvas|MESA|S|
|ART-45|Comparação de nível de leitura (readability score)|Exibe métrica tipo Flesch-Kincaid junto ao documento editado|[INFERIDO] não confirmado em produto nomeado — não incluir como confirmado; citado apenas como possível extensão do atalho de leitura|FRONT|S|

## 4. Canvas de código

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|ART-46|Edição de código com syntax highlight no canvas|Editor tipo CodeMirror/Monaco embutido, com highlight por linguagem, dentro do painel|Claude.ai, ChatGPT Canvas, Gemini Canvas, Open WebUI, LibreChat|MESA|M|
|ART-47|Revisão de código automática (code review)|Modelo analisa o código linha a linha e insere comentários de bug/melhoria como anotações, não reescreve direto|ChatGPT Canvas|DIFF|M|
|ART-48|Adicionar logs de debug|Insere `print`/`console.log` nos pontos que o modelo julga úteis para depuração|ChatGPT Canvas|DIFF|S|
|ART-49|Adicionar comentários explicativos ao código|Insere docstrings/comentários linha a linha sem alterar lógica|ChatGPT Canvas|MESA|S|
|ART-50|Corrigir bugs (fix)|Detecta e reescreve trechos problemáticos automaticamente a partir de erro relatado ou detectado|ChatGPT Canvas, Claude.ai (via chat)|MESA|M|
|ART-51|Portar código para outra linguagem|Traduz o artifact de código para JS/TS/Python/Java/C++/PHP mantendo lógica|ChatGPT Canvas|DIFF|M|
|ART-52|Executar código do canvas dentro do painel|Roda o código (Python/JS) e mostra output/stdout sem sair do painel — **nota: execução isolada em sandbox é domínio separado, aqui é só a superfície de apresentação do resultado**|ChatGPT Canvas (Python via sandbox), Claude.ai (via Analysis Tool JS), Open WebUI|DIFF|L|
|ART-53|Terminal embutido no canvas|Console interativo dentro do painel para rodar comandos livres, não só um botão "run"|LM Studio (dev tooling), text-generation-webui, [INFERIDO] parcial em IDEs (Cursor) não em chat-first products|FRONT|L|
|ART-54|Line-by-line diff de código proposto vs atual|Mostra diff estilo git (verde/vermelho) antes de aplicar edição de código no canvas|ChatGPT Canvas (parcial via suggested edits), Cursor/Copilot (referência externa ao domínio chat)|DIFF|M|

## 5. Saídas estruturadas renderizadas

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|ART-55|Tabela interativa com sort/filter|Renderiza dados tabulares com cabeçalho clicável para ordenar e filtro por coluna|Claude.ai (via React artifact), Dify, RAGFlow, Onyx|DIFF|M|
|ART-56|Gráfico a partir de dados (chart)|Gera visualização (barra/linha/pizza) a partir de dataset retornado, via lib tipo Recharts/Chart.js|Claude.ai (React artifact), Gemini, ChatGPT (Python+matplotlib no sandbox), NotebookLM|DIFF|M|
|ART-57|Mapa interativo renderizado|Exibe geolocalização/rota num componente de mapa embutido a partir de dados retornados por tool|Google AI Studio (AI Chip "Maps"), ChatGPT Apps SDK (map widget)|FRONT|L|
|ART-58|Timeline visual|Renderiza sequência de eventos cronológicos como componente interativo|[INFERIDO] via React artifact genérico (Claude.ai), não é widget nativo dedicado em nenhum produto|DIFF|M|
|ART-59|Kanban renderizado e editável|Board de colunas/cards drag-and-drop gerado a partir de tarefas, editável no painel|[INFERIDO] possível via React artifact custom; nenhum produto oferece kanban nativo dedicado hoje|FRONT|L|
|ART-60|Formulário gerado dinamicamente|Cria formulário de inputs (texto, select, checkbox) a partir de schema, para coletar dados do usuário e devolver ao modelo|ChatGPT Apps SDK (widget de confirmação/formulário), mcp-ui|FRONT|M|
|ART-61|Checklist interativo|Lista de tarefas com checkbox clicável renderizada como artifact, estado persiste na sessão|Claude.ai (via HTML/React artifact), Notion AI|DIFF|S|
|ART-62|Planilha editável (spreadsheet)|Grade tipo Excel com células editáveis, fórmulas básicas, dentro do canvas|NotebookLM (export para Sheets), [INFERIDO] demais produtos só exportam CSV, não editam grade nativamente|FRONT|L|
|ART-63|Slides/apresentação gerados e editáveis|Monta deck de slides a partir do conteúdo, com edição slide a slide (texto, layout, imagem) e regeneração do deck|NotebookLM (Slides via Nano Banana Pro), Gamma (referência externa), Google AI Studio|FRONT|L|
|ART-64|Diagrama editável (não só visualização estática)|Permite reposicionar nós/editar rótulos do diagrama gerado diretamente na UI, não só via re-prompt|Excalidraw (integração OSS), [INFERIDO] Claude/ChatGPT só regeram via código-fonte, não drag-and-drop nativo|FRONT|L|
|ART-65|Mapa mental interativo (mind map)|Visualiza relações conceituais como grafo navegável, nós expansíveis|NotebookLM (Mind Map)|DIFF|L|
|ART-66|Relatório estruturado formatado|Gera documento longo com seções, citações e formatação de "relatório" a partir das fontes, distinto de resposta de chat|NotebookLM (Report), Perplexity (Deep Research report), Onyx|DIFF|M|

## 6. Generative UI / MCP Apps

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|ART-67|Componente de UI retornado por tool call e renderizado inline|Resultado de uma tool call vem com `_meta.ui.resourceUri`/HTML embutido e o host renderiza no fluxo da conversa, não como texto|ChatGPT Apps SDK, mcp-ui / MCP Apps spec, Claude (MCP UI resources)|FRONT|L|
|ART-68|mcp-ui: recurso `ui://` com iframe + bridge JSON-RPC|Servidor MCP declara `createUIResource` (HTML) e cliente injeta `postMessage`/JSON-RPC bidirecional entre iframe e host|mcp-ui (`@mcp-ui/server`, `@mcp-ui/client`)|FRONT|L|
|ART-69|Widget interativo que devolve resposta/ação ao modelo|Clique num botão do widget dispara nova tool call ou envia mensagem de volta ao modelo (`onUIAction`)|mcp-ui, ChatGPT Apps SDK|FRONT|L|
|ART-70|Formulário de confirmação antes de ação sensível|UI renderizada pede confirmação explícita do usuário (ex. "confirmar compra") antes do tool executar de fato|ChatGPT Apps SDK (checkout), mcp-ui|FRONT|M|
|ART-71|Seletor/picker renderizado pelo tool|Tool retorna lista (ex. hotéis, produtos) como carrossel/lista clicável em vez de texto puro|ChatGPT Apps SDK, mcp-ui|FRONT|M|
|ART-72|SDK server-side multi-linguagem para criar UI resources|Bibliotecas oficiais em TS, Python e Ruby para gerar o payload de UI a partir do backend do tool|mcp-ui (`mcp-ui-server` py, `mcp_ui_server` ruby, `@mcp-ui/server` ts)|FRONT|M|
|ART-73|Renderer web component standalone (`<ui-resource-renderer>`)|Componente web reutilizável fora de React para hosts que não usam esse framework|mcp-ui|FRONT|S|
|ART-74|Deep link/intent disparado pela UI embutida|Widget pode abrir link externo (`onOpenLink`) ou disparar "intent" nomeado tratado pelo host|mcp-ui, ChatGPT Apps SDK|FRONT|S|
|ART-75|Skills + UI empacotados como plugin distribuível|Empacota MCP server + UI opcional + skills como plugin instalável e revisável pela plataforma|ChatGPT Apps/Plugins (submission flow)|FRONT|L|

## 7. Publicação

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|ART-76|Transformar artifact em app compartilhável com URL própria|Publica o artifact como página web autônoma acessível por link, fora da conversa original|Claude.ai, Grok Studio, Le Chat|DIFF|M|
|ART-77|Deploy com backend real em infra gerenciada (one-click)|Publica app full-stack (frontend+API+DB) direto em runtime de nuvem gerenciado, com URL de produção|Google AI Studio Build mode (Cloud Run)|FRONT|XL|
|ART-78|Export/push para repositório Git|Exporta o código gerado direto para um novo repo GitHub|Google AI Studio Build mode|DIFF|M|
|ART-79|Galeria pública de artifacts de terceiros|Página de descoberta onde qualquer usuário navega artifacts publicados por outros|Claude.ai ("madewithclaude"-style directory), Grok Studio|DIFF|M|
|ART-80|Incorporar (embed) artifact em outro site|Gera snippet `<iframe>` para embutir o artifact publicado em página externa|[INFERIDO] Claude.ai permite abrir/linkar mas embed via iframe explícito não é feature documentada de primeira classe hoje|FRONT|M|
|ART-81|Controle de permissão de acesso ao artifact publicado|Define se o link é público, só-leitura, ou restrito a workspace/organização|Claude.ai (Team/Enterprise), Le Chat (workspace)|DIFF|M|
|ART-82|Revogar/despublicar artifact|Remove o artifact do ar, invalidando o link público anterior|Claude.ai|MESA|S|

## 8. Diagramas e visualização

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|ART-83|Renderização Mermaid nativa|Interpreta sintaxe mermaid (flowchart, sequence, gantt, ER) para SVG no cliente|Claude.ai, Open WebUI, LibreChat, Notion AI, GitHub (referência)|MESA|S|
|ART-84|Renderização PlantUML|Compila sintaxe PlantUML (geralmente via serviço externo/kroki) para imagem de diagrama|[INFERIDO] suportado em alguns OSS via plugin (Open WebUI extensions), não nativo nos closed majors|DIFF|M|
|ART-85|Renderização Graphviz/DOT|Compila descrição DOT em grafo (nós/arestas) via viz.js ou serviço externo|[INFERIDO] presente em ferramentas de dev genéricas, não confirmado nativo em nenhum chat-LLM listado|FRONT|M|
|ART-86|Integração Excalidraw (diagrama à mão livre editável)|Abre canvas de desenho estilo hand-drawn onde nós/formas do diagrama podem ser arrastados e editados manualmente|Excalidraw (produto OSS dedicado, integrável), [INFERIDO] não nativo em nenhum chat-LLM da lista|FRONT|L|
<br>

|ART-87|Export de diagrama para PNG|Rasteriza o SVG do diagrama gerado para PNG para download/compartilhar|Claude.ai, Open WebUI, mermaid.live (referência)|MESA|S|
|ART-88|Export de diagrama para SVG vetorial|Baixa o diagrama como SVG editável em outra ferramenta (Figma, Illustrator)|Claude.ai, Open WebUI|MESA|S|
|ART-89|Zoom/pan interativo no diagrama renderizado|Permite navegar diagramas grandes sem re-renderizar, com controles de zoom|Claude.ai, Open WebUI (mermaid viewer)|MESA|S|
|ART-90|Edição textual do código-fonte do diagrama com preview ao vivo|Mostra o texto mermaid/DOT lado a lado com o preview, atualizando a cada tecla|Claude.ai (toggle código/preview), mermaid.live|DIFF|M|

---

## Armadilhas

- **XSS via HTML/SVG artifact sem sandbox correto**: SVG aceita `<script>` e `on*` event handlers — renderizar SVG "cru" no DOM principal (não em iframe `sandbox`) é RCE client-side trivial. SVG deve sempre passar por iframe sandboxado ou sanitizer (DOMPurify com `SVG_ALLOW_DATA_URI` desligado), nunca `dangerouslySetInnerHTML`/`v-html` direto.
- **`allow-same-origin` + `allow-scripts` juntos no mesmo iframe = sandbox inútil**: essa combinação permite ao conteúdo do iframe acessar `document.cookie`/`localStorage` do host se servido do mesmo origin. Servir cada preview de um origin isolado (subdomínio dedicado tipo `usercontent.example.com`) é obrigatório se ambos os flags forem necessários (ex. para `postMessage` funcionar com módulos ESM).
- **CSP do host vazando para o preview**: se o preview roda no mesmo documento (não iframe) via string interpolation, herda CSP e cookies do app — sempre isolar em iframe com `Content-Security-Policy` própria (`default-src 'none'; script-src 'unsafe-inline' https://esm.sh; ...`), nunca reusar a CSP da aplicação principal.
- **`postMessage` sem checar `event.origin`**: bridge JSON-RPC do mcp-ui/artifact que aceita mensagem de qualquer origin permite que uma página maliciosa em outra aba finja ser o iframe do artifact e injete tool calls falsas. Sempre validar `event.origin` contra o origin exato do iframe sandboxado.
- **Import de pacotes npm via CDN sem pin de versão**: `esm.sh/react` sem `@versão` quebra silenciosamente quando o pacote upstream publica breaking change; também é vetor de supply-chain se o CDN for comprometido — sempre pinar versão exata e considerar SRI/lockfile de resolução.
- **Preview React que trava a aba por loop infinito/erro de render**: sem timeout/watchdog no iframe, um `useEffect` sem dependência correta gerado pelo modelo trava o preview e pode travar a aba pai se não estiver em iframe (Web Worker para lógica pesada ajuda, mas o DOM continua no main thread do iframe).
- **Versionamento ingênuo = string overwrite**: guardar artifact como campo mutável único (sem histórico append-only) impede restore/diff depois; desenhar como sequência imutável de snapshots desde o dia 1, não como "adicionar depois".
- **Diff textual ruim em artifacts binários/estruturados (React/HTML)**: diff linha-a-linha de código gerado é ruidoso quando o modelo reformata tudo a cada edição; diffs úteis exigem ancorar em AST ou em blocos semânticos, não em string diff puro.
- **Detecção automática de "quando é artifact" gera falso positivo/negativo constante**: heurísticas de tamanho de código cortam respostas curtas úteis do painel e jogam respostas longas de texto normal pro painel sem necessidade — expor toggle manual do usuário é mais robusto que heurística pura do modelo.
- **Publicar artifact = vazamento de dado sensível do prompt**: se o publish reusa todo o contexto da conversa (não só o artifact isolado), pode vazar system prompt ou dados de outras mensagens — publish deve serializar SÓ o artifact, nunca a conversa inteira, mesmo que a origem seja um chat.
- **Rate limit ausente em preview server-side (Google AI Studio-style backend)**: apps full-stack publicados sem quota por usuário viram vetor de abuso de custo de infra (DB writes ilimitados, chamadas de API externa pagas).
- **mcp-ui/Apps SDK: tool UI confiando cegamente no `toolResult` para renderizar HTML**: se o host injeta HTML retornado por um MCP server de terceiro sem sandboxing, qualquer servidor MCP malicioso vira XSS stored — tratar toda UI de tool externo como conteúdo não confiável por padrão, mesmo com MCP "confiável" declarado.
- **Mermaid/PlantUML render usando `eval`-like parsers antigos**: versões antigas de mermaid.js tinham RCE via `click` directive executando JS arbitrário do diagrama — pinar versão patcheada e desabilitar `securityLevel: 'loose'`.

## Ordem de construção

1. **Detecção + painel básico**: parser que identifica blocos de código/markdown na resposta do modelo e os movepara painel lateral (ART-01, ART-03, ART-04, ART-13, ART-14) — sem isso nada mais faz sentido.
2. **Sandbox de preview seguro primeiro, antes de qualquer tipo rico**: iframe com `sandbox` attrs corretos, CSP isolada, origin dedicado, `postMessage` validado (ART-21, ART-26, ART-27) — é a fundação de segurança; adicionar tipos (SVG, HTML, React) depois disso é seguro, antes disso é dívida técnica perigosa.
3. **Tipos de conteúdo incrementais**: HTML → SVG → Mermaid (mais simples, sem deps externas) → React com ESM CDN (mais complexo, exige resolver import maps) (ART-05, ART-06, ART-08, ART-22).
4. **Versionamento**: modelar como lista imutável de snapshots desde o início (ART-09) — refatorar depois é caro. Diff e restore (ART-10, ART-11) vêm naturalmente uma vez que o modelo de dados é append-only.
5. **Edição humana no canvas**: undo/redo e edição de texto direta (ART-33, ART-43) antes de comentários/sugestões aceitar-rejeitar (ART-35, ART-36), que exigem um modelo de "patch proposto" mais complexo.
6. **Canvas de código**: reusa o editor de texto (Monaco/CodeMirror) do passo 5; adicionar ações (logs, comentários, port, fix) como prompts pré-formatados sobre o trecho selecionado (ART-46 → ART-48/49/50/51).
7. **Execução do código do canvas**: depende de sandbox de execução (fora do escopo ART, mas é pré-requisito de ART-52) — sequenciar depois que esse domínio existir.
8. **Publicação**: depende de versionamento (passo 4) e de um servidor que sirva o artifact isolado por URL própria com sua própria CSP (ART-76, ART-81, ART-82).
9. **Generative UI / MCP**: é o item de maior custo e maior risco de segurança — construir por último, reusando toda a infra de sandbox do passo 2, e tratando qualquer UI de tool externo como não confiável desde o design (ART-67 a ART-75).
10. **Saídas estruturadas ricas (tabela, gráfico, kanban, planilha, slides)**: construir como componentes React dentro do artifact tipo React (passo 3) — não é um sistema novo, é biblioteca de componentes rodando dentro do sandbox já existente.

## Fontes

- https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them
- https://support.claude.com/en/articles/9547008-publish-and-share-artifacts
- https://www.anthropic.com/news/artifacts
- https://www.eesel.ai/blog/what-are-claude-code-artifacts
- https://www.guideflow.com/tutorial/how-to-view-version-history-of-an-artifact-in-claudeai
- https://www.codecademy.com/article/how-to-use-claude-artifacts-create-share-and-remix-ai-content
- https://openai.com/index/introducing-canvas/
- https://www.coursera.org/articles/canvas-chatgpt
- https://perplexityaimagazine.com/perplexity-hub/chatgpt-canvas-feature-guide/
- https://instapods.com/blog/claude-artifacts-vs-chatgpt-canvas/ (retirada do Canvas em 2026)
- https://node-pad.com/blog/what-happened-to-chatgpt-canvas/
- https://gemini.google/overview/canvas/
- https://ai.google.dev/gemini-api/docs/aistudio-build-mode
- https://cloud.google.com/use-cases/how-to-build-an-app-with-ai
- https://github.com/ije/esm.sh
- https://github.com/idosal/mcp-ui (README, docs/src/guide/*)
- https://developers.openai.com/plugins (Apps SDK / Plugin UI docs)
- https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-video-overviews-studio-upgrades/
- https://www.eesel.ai/blog/notebooklm-slide-deck-feature
- https://getalai.com/blog/how-to-edit-notebooklm-slides
- https://www.shareduo.com/blog/grok-studio-vs-claude-artifacts
- https://www.shareduo.com/blog/claude-artifacts
- https://mistral.ai/news/mistral-chat/
- https://venturebeat.com/ai/mistral-unleashes-pixtral-large-and-upgrades-le-chat-into-full-on-chatgpt-competitor

---

# 7. `PROMPT` — Prompts, personas e assistentes

## 1. System Prompt

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|PROMPT-01|System prompt global|Instrução fixa aplicada a toda conversa nova do usuário, editável em settings|Open WebUI, LibreChat, ChatGPT (via custom instructions), Jan|MESA|S|
|PROMPT-02|System prompt por modelo|Cada modelo/entrada de catálogo carrega seu próprio bloco de instrução, sobrepondo o global|Open WebUI (Workspace > Models), LM Studio|DIFF|M|
|PROMPT-03|System prompt por conversa/chat|Override pontual dentro de uma conversa específica, sem alterar padrão|Open WebUI (per-chat params), Msty (per-chat persona)|DIFF|S|
|PROMPT-04|System prompt por assistente/persona|Bloco de instrução amarrado à definição do assistente (GPT/Gem/Agent), independente do system prompt global|ChatGPT (GPTs), Gemini (Gems), Le Chat (Agents), Poe (bots), Msty (Personas)|MESA|M|
|PROMPT-05|Precedência hierárquica documentada global→projeto→assistente→conversa|Ordem determinística de merge quando múltiplas camadas de instrução coexistem (mais específico vence, ou concatena)|Claude.ai (global < project instructions), ChatGPT (global < project < GPT), Open WebUI (per-account < per-model < per-chat)|DIFF|M|
|PROMPT-06|Variáveis dinâmicas de data/hora|Injeção automática de data atual, dia da semana no prompt montado|LibreChat ({{current_date}}), Open WebUI (system variables)|MESA|S|
|PROMPT-07|Variável de nome/perfil do usuário|Substituição automática de placeholder pelo nome/e-mail salvo do usuário|LibreChat ({{LIBRECHAT_USER_NAME}}, {{LIBRECHAT_USER_EMAIL}})|DIFF|S|
|PROMPT-08|Variável de timezone do usuário|Injeta fuso horário detectado/configurado no prompt para respostas com hora local corretas|[INFERIDO] presente em poucos produtos; Open WebUI (via system vars parciais)|FRONT|S|
|PROMPT-09|Variável de idioma preferido|Injeta idioma alvo de resposta como parâmetro de template, sem exigir reescrita manual do prompt|LibreChat (variáveis custom), Open WebUI (custom input vars)|DIFF|S|
|PROMPT-10|Preview do prompt final montado|Tela/painel que mostra o texto exato enviado ao modelo após merge de todas as camadas (global+projeto+persona+memória)|[INFERIDO parcial] LM Studio (inspeciona payload), ferramentas de debug de LibreChat/Open WebUI via logs; nenhum client mainstream expõe isso de forma nativa e polida|FRONT|M|
|PROMPT-11|Contagem de tokens do system prompt|Exibe quantos tokens o bloco de instrução consome, separado do restante do contexto|Claude.ai (orienta manter Custom Instructions <2000 tokens, mas não expõe contador nativo), LM Studio (token count geral), [INFERIDO] contadores nativos por-bloco são raros|FRONT|M|

## 2. Instruções customizadas do usuário

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|PROMPT-12|Campo "como me chamar"|Nome preferido do usuário, usado em toda resposta subsequente|ChatGPT ("What should ChatGPT call you?"), Claude.ai (custom instructions)|MESA|S|
|PROMPT-13|Campo "o que você faz" (ocupação/contexto)|Descrição livre de profissão/uso típico que contextualiza respostas|ChatGPT ("What do you do?"), Claude.ai, Gemini|MESA|S|
|PROMPT-14|Preferências de tom de resposta|Seletor/texto livre para tom (formal, casual, direto) aplicado globalmente|ChatGPT (Custom Instructions traits), Claude.ai (Styles), Le Chat (tone presets)|MESA|S|
|PROMPT-15|Traits de personalidade selecionáveis|Lista fixa de traços de personalidade (Witty, Chatty, Opinionated, Candid, Nerdy) aplicável com um clique|ChatGPT (personality presets: Default, Friendly, Efficient, Professional, Candid, Quirky, Cynical, Nerdy)|DIFF|M|
|PROMPT-16|Nível de detalhe/verbosidade configurável|Preferência persistente de resposta curta vs. longa/detalhada|ChatGPT, Claude.ai (Styles: Concise/Explanatory/Formal), Le Chat|MESA|S|
|PROMPT-17|Idioma de resposta preferido|Define idioma padrão de resposta independente do idioma da pergunta|ChatGPT, Gemini, quase universal|MESA|S|
|PROMPT-18|Regras/restrições livres ("o que evitar")|Campo de texto livre para proibições específicas (ex. "não usar emoji", "evitar determinada palavra")|ChatGPT Custom Instructions, Claude.ai|MESA|S|
|PROMPT-19|Aplicação automática em toda conversa nova|Instruções persistem sem reconfiguração a cada chat, carregadas automaticamente|universal (ChatGPT, Claude.ai, Gemini, Le Chat)|MESA|S|
|PROMPT-20|Override por conversa/projeto das instruções globais|Instrução mais específica (projeto/GPT) sobrepõe a global apenas dentro daquele escopo|ChatGPT (Project instructions > global custom instructions), Claude.ai (Project instructions > global)|DIFF|M|
|PROMPT-21|Estilos/Styles pré-definidos e customizáveis|Conjunto de "modos de escrita" salvos e alternáveis por conversa (ex. Claude Styles: Normal, Concise, Explanatory, Formal, custom)|Claude.ai (Styles)|DIFF|M|
|PROMPT-22|Geração automática de instruções a partir de amostra de escrita do usuário|Modelo analisa texto colado do usuário e deduz tom/vocabulário para replicar no estilo custom|[INFERIDO/prática recomendada] Claude.ai Styles permite criar estilo a partir de exemplo de texto|FRONT|M|

## 3. Biblioteca de prompts

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|PROMPT-23|Salvar prompt reutilizável|Armazena um texto de prompt nomeado para reuso posterior sem recolar|Open WebUI (Prompts workspace), LibreChat (Prompt Library), Notion AI (templates), Msty|MESA|S|
|PROMPT-24|Organização em pastas/categorias|Agrupa prompts salvos por pasta ou categoria definida pelo usuário|LibreChat (categorias de prompt group), Notion AI (databases)|DIFF|S|
|PROMPT-25|Tags/rótulos em prompts|Etiquetas livres para filtrar biblioteca de prompts por assunto|[INFERIDO comum em apps de terceiros tipo AI Prompts Organizer]; nativo em poucos clients mainstream|DIFF|S|
|PROMPT-26|Busca na biblioteca de prompts|Campo de busca textual sobre título/conteúdo dos prompts salvos|Open WebUI, LibreChat|MESA|S|
|PROMPT-27|Variáveis `{{placeholder}}` com formulário de preenchimento|Modal/form aparece antes de enviar, pedindo valor de cada `{{variavel}}` detectada no prompt|LibreChat, Open WebUI (Custom Input Variables)|DIFF|M|
|PROMPT-28|Detecção automática de variáveis no texto do prompt|Parser identifica `{{nome}}` no corpo do prompt e popula seção de variáveis sem configuração manual|LibreChat, Open WebUI|DIFF|S|
|PROMPT-29|Tipos de variável: texto simples|Campo de input de texto livre no formulário de preenchimento|LibreChat, Open WebUI|MESA|S|
|PROMPT-30|Tipos de variável: select/dropdown com opções custom|Variável renderizada como lista suspensa com valores pré-definidos pelo autor do prompt|LibreChat (Enhanced Placeholder Configuration), Open WebUI (dropdowns)|DIFF|M|
|PROMPT-31|Tipos de variável: multiline/textarea|Campo de texto expandido para variáveis de conteúdo longo|LibreChat (Enhanced Placeholder)|DIFF|S|
|PROMPT-32|Tipos de variável: data (date picker)|Seletor de data como tipo de campo no formulário de variável|Open WebUI (date pickers em custom input vars)|DIFF|S|
|PROMPT-33|Tipos de variável: arquivo anexado|Variável que aceita upload de arquivo como parte do preenchimento do template de prompt|[INFERIDO] não confirmado como padrão nativo; mais comum como anexo de conversa separado do sistema de variáveis|FRONT|L|
|PROMPT-34|Variável obrigatória (`:required`)|Marca campo como obrigatório, bloqueando envio até preenchimento|Open WebUI (`:required` modifier)|DIFF|S|
|PROMPT-35|Modificadores de contexto em variável (ex. truncamento de histórico)|Sintaxe avançada que controla quantas mensagens/quanto texto entra via variável (`{{MESSAGES:MIDDLETRUNCATE:6}}`)|Open WebUI|FRONT|M|
|PROMPT-36|Prompt encadeado (chain de prompts)|Sequência de prompts executados em ordem, saída de um alimentando entrada do próximo|Langflow, Dify (workflow app), n8n (chains de nós de prompt)|FRONT|L|
|PROMPT-37|Versionamento de prompt|Histórico de versões de um mesmo prompt, com uma marcada como produção|LibreChat (Prompt Groups: múltiplas versões + production version)|FRONT|M|
|PROMPT-38|Compartilhar prompt com o time/organização|Prompt salvo tem nível de acesso (privado/equipe/todos) configurável|Open WebUI (Access level em prompts), LibreChat (nível de acesso por prompt group)|DIFF|M|
|PROMPT-39|Importar prompt de arquivo|Upload de arquivo (JSON/texto/CSV) que popula a biblioteca de prompts em lote|LibreChat (import/export de presets como JSON)|DIFF|S|
|PROMPT-40|Exportar biblioteca de prompts|Download da biblioteca inteira ou de um prompt como arquivo portável|LibreChat (export de presets JSON)|DIFF|S|

## 4. Slash commands e atalhos

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|PROMPT-41|Slash command dispara prompt salvo|Digitar `/nome` no composer injeta instantaneamente o texto completo do prompt associado|Open WebUI (`/summarize`), LibreChat (backslash commands)|MESA|M|
|PROMPT-42|Comando customizado definido pelo usuário|Usuário atribui livremente o gatilho `/comando` a qualquer prompt próprio|Open WebUI, LibreChat|MESA|M|
|PROMPT-43|Autocomplete de comandos no composer|Lista suspensa de comandos disponíveis aparece ao digitar `/`, com filtro por texto digitado|Open WebUI, LibreChat ("select a command from the list")|MESA|M|
|PROMPT-44|Comando com argumento posicional|Sintaxe de comando aceita parâmetro após o nome (ex. `/traduzir pt-br`) que populam variáveis do prompt|[INFERIDO parcial] combinação de slash command + variáveis existe em LibreChat/Open WebUI mas args posicionais explícitos por sintaxe são raros; mais comum é abrir formulário após o comando|DIFF|M|
|PROMPT-45|Comando que troca modelo/assistente ativo|Slash command cujo efeito não é injetar texto, mas mudar o modelo/persona corrente da conversa|[INFERIDO] presente em CLIs de IA (ex. Claude Code `/model`) mas raro em UIs de chat de consumidor|FRONT|M|
|PROMPT-46|Comandos de sistema utilitários (limpar chat, exportar, etc.)|Slash commands nativos não ligados a prompt, mas a ações de UI (clear, regenerate, help)|Discord bots, [INFERIDO] presentes em vários self-hosted chat UIs como atalho de produtividade|DIFF|S|

## 5. Personas/Assistentes/GPTs

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|PROMPT-47|Criar assistente com nome, ícone e descrição|Formulário básico de identidade visual/textual do assistente customizado|ChatGPT (GPTs), Gemini (Gems), Poe (bots), Le Chat (Agents), Msty (Personas)|MESA|M|
|PROMPT-48|Campo de instruções/comportamento do assistente|Bloco de texto que define o system prompt específico do assistente|universal entre os acima|MESA|M|
|PROMPT-49|Anexar conhecimento/arquivos ao assistente|Upload de documentos que o assistente consulta como contexto fixo (ponto de contato com RAG, sem cobrir pipeline de retrieval)|ChatGPT (Knowledge), Gemini Gems (até 10 arquivos/100MB), Le Chat (Libraries), Claude Projects (project knowledge)|MESA|M|
|PROMPT-50|Anexar tools/capacidades ao assistente|Habilita ferramentas específicas (web search, code interpreter, geração de imagem, actions/API) por assistente|ChatGPT GPTs (Actions, DALL-E, Code Interpreter, web browsing), Le Chat Agents (web search, code exec, image gen, Gmail/Calendar)|DIFF|L|
|PROMPT-51|Escolher modelo e parâmetros por assistente|Seleção do modelo base (ex. GPT-5, o3, Claude) e ajuste de temperature/top_p amarrados ao assistente|ChatGPT GPTs (seleção entre GPT-4.1/4.5/o3/o4-mini), LibreChat (presets com model+params), Open WebUI (Models)|DIFF|M|
|PROMPT-52|Conversation starters|Botões de prompt de exemplo exibidos ao abrir novo chat com o assistente|ChatGPT GPTs, Gemini Gems (templates), Poe (bot greeting + prompts)|MESA|S|
|PROMPT-53|Builder conversacional (modelo ajuda a criar o assistente)|Chat guiado em que o próprio modelo entrevista o usuário e escreve a configuração do assistente|ChatGPT (GPT Builder conversational mode), Gemini (Magic Pencil expande instruções)|DIFF|L|
|PROMPT-54|Duplicar assistente existente|Clona um assistente/persona para editar uma variante sem afetar o original|[INFERIDO] comum em Poe (fork de bot), LibreChat (duplicar preset); prática padrão em builders no-code|DIFF|S|
|PROMPT-55|Exportar/importar definição de assistente|Serializa configuração do assistente (instruções+params+tools) como arquivo portável entre contas/instâncias|LibreChat (presets JSON export/import), Open WebUI (community sharing de modelos custom)|DIFF|M|
|PROMPT-56|Versionar assistente (histórico de configs)|Mantém histórico de alterações de um assistente permitindo reverter|[INFERIDO] não confirmado como recurso nativo amplamente disponível; ausência notável mesmo em ChatGPT GPTs|FRONT|L|
|PROMPT-57|Publicar interno (equipe/org) vs. público (todos)|Controle de visibilidade do assistente: privado, apenas link, org, ou marketplace público|ChatGPT (GPTs: only me / link / everyone / GPT Store), Le Chat (org sharing), Poe (public/private bot)|MESA|M|

## 6. Marketplace/discovery

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|PROMPT-58|Loja/diretório de assistentes públicos|Catálogo navegável de assistentes criados por terceiros, instaláveis/usáveis|ChatGPT (GPT Store), Poe (bot directory), Open WebUI Community (model/prompt sharing)|MESA|L|
|PROMPT-59|Categorias no marketplace|Assistentes organizados por categoria temática (produtividade, educação, escrita)|ChatGPT GPT Store, Poe|MESA|M|
|PROMPT-60|Busca e ranking no marketplace|Busca textual + ordenação por popularidade/engajamento dos assistentes listados|ChatGPT GPT Store, Poe|MESA|M|
|PROMPT-61|Instalação/uso com um clique|Adicionar assistente de terceiros à própria lista sem passos de configuração|ChatGPT (abrir GPT direto), Poe (usar bot direto)|MESA|S|
|PROMPT-62|Avaliação/feedback de assistentes (rating, thumbs)|Usuários avaliam qualidade do assistente publicado, sinal usado no ranking|[INFERIDO parcial] Poe tem sinais de engajamento; avaliação explícita por estrelas não confirmada em ChatGPT GPT Store|DIFF|M|
|PROMPT-63|Monetização do criador (revenue share/pricing)|Criador recebe pagamento por uso do seu assistente (por mensagem ou por assinante trazido)|Poe (per-message pricing até $10k/1000 msgs + revenue share por assinante), ChatGPT (revenue-sharing anunciado, ainda não pagamento direto por uso em 2025-2026)|DIFF|XL|
|PROMPT-64|Curadoria/moderação de submissões públicas|Processo de revisão antes de publicação pública (categoria, política de conteúdo, nome do builder)|ChatGPT GPT Store (revisão de categoria/nome ao publicar)|DIFF|L|
|PROMPT-65|Assistentes/bots em destaque (featured)|Seção curada de assistentes promovidos pela plataforma na home do marketplace|ChatGPT GPT Store, Poe (featured bots)|DIFF|S|
|PROMPT-66|Import de GPT do ChatGPT para outra plataforma|Reconstrução/migração de configuração de Custom GPT (instruções+knowledge) para outro produto|[INFERIDO] recurso de terceiros/plugins de migração; não é nativo de nenhum concorrente direto — lacuna de mercado|FRONT|L|

## 7. Projetos

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|PROMPT-67|Projeto agrupando conversas+arquivos+instruções|Espaço persistente que amarra múltiplos chats a um conjunto comum de arquivos e instrução|Claude.ai (Projects), ChatGPT (Projects), NotebookLM (notebooks)|MESA|L|
|PROMPT-68|Instruções específicas do projeto (override do global)|Bloco de instrução exclusivo do projeto, com precedência sobre custom instructions globais só dentro dele|Claude.ai (Project instructions), ChatGPT (Project instructions)|MESA|M|
|PROMPT-69|Memória escopada ao projeto|Registro automático de fatos/preferências aprendidos dentro do projeto, isolado de outros projetos/chats gerais|Claude Code (auto memory), ChatGPT (project-only memory toggle)|DIFF|L|
|PROMPT-70|Modelo default por projeto|Projeto fixa qual modelo é usado por padrão em novas conversas daquele projeto|[INFERIDO] parcialmente coberto por seleção de modelo persistente em Claude Projects/ChatGPT Projects; não documentado como campo dedicado explícito|DIFF|M|
|PROMPT-71|Limite/capacidade de arquivos por projeto|Teto de arquivos e tamanho de conhecimento anexável ao projeto (ex. tokens totais, MB por arquivo)|Claude.ai (200k tokens/projeto, 30MB/arquivo), ChatGPT (5/25/40 arquivos conforme plano)|MESA|S|
|PROMPT-72|Compartilhamento de projeto com o time|Projeto inteiro (chats+arquivos+instruções) compartilhado com outros membros da organização|ChatGPT Team/Enterprise (projetos compartilhados), Claude Team|DIFF|L|

## 8. Templates de tarefa

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|PROMPT-73|Fluxos pré-montados de tarefa comum (resumir, traduzir, revisar código)|Botões/prompts prontos para tarefas recorrentes, sem precisar escrever o prompt|Notion AI (templates de resumo/reescrita), Chatbox, Cherry Studio (prompt presets), NotebookLM (audio/study guide/quiz templates)|MESA|M|
|PROMPT-74|One-click action sobre a resposta gerada (reescrever, encurtar, expandir)|Botão pós-resposta que reprocessa o output com uma transformação padrão|Notion AI (rewrite/shorten/lengthen), ChatGPT (regenerate/edit variants)|MESA|M|
|PROMPT-75|Ação de contexto: selecionar texto → menu de ação|Seleção de trecho de texto na tela dispara menu contextual com ações de IA (explicar, traduzir, resumir aquele trecho)|Notion AI (selection toolbar), Kagi Assistant, browser extensions (page-assist)|DIFF|M|
|PROMPT-76|Quick actions configuráveis pelo usuário|Usuário define seu próprio conjunto de ações rápidas customizadas (para além das padrão do produto)|[INFERIDO] combinação de slash commands + prompt library cobre isso indiretamente em Open WebUI/LibreChat; ação rápida nativa e dedicada é rara|FRONT|M|
|PROMPT-77|Templates específicos de domínio (ex. gerar slide, quiz, estudo)|Fluxo de tarefa com saída estruturada específica (não é texto livre, é formato de saída fixo)|NotebookLM (Audio Overview, Study Guide, Quiz, Slide Deck templates)|DIFF|L|

## 9. A/B e iteração de prompt

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|PROMPT-78|Comparação lado a lado de duas versões de prompt|UI de split-view roda o mesmo input contra dois prompts diferentes e mostra outputs pareados|Anthropic Console (Evaluation tool - side-by-side comparison)|DIFF|L|
|PROMPT-79|Playground separado do chat principal|Ambiente dedicado a testar prompt+parâmetros sem poluir histórico de conversas reais|Anthropic Console, OpenAI Playground, Mistral La Plateforme|DIFF|L|
|PROMPT-80|Banco de casos de teste (test cases) para avaliação de prompt|Conjunto de inputs de referência salvos, reexecutados a cada iteração de prompt para medir regressão|Anthropic Console (Evaluation tool: add row manual, gerar via IA, importar CSV)|FRONT|L|
|PROMPT-81|Grading manual de qualidade de resposta (escala numérica)|Humano atribui nota (ex. 1-5) a cada output do teste, permitindo comparar versões objetivamente|Anthropic Console (5-point scale grading)|FRONT|M|
|PROMPT-82|Prompt optimizer automático (IA reescreve o prompt)|Modelo analisa e reescreve automaticamente um prompt aplicando técnicas de prompt engineering (CoT, exemplos)|Anthropic Console (Prompt Improver), Gemini (Magic Pencil, mais simples)|FRONT|L|
|PROMPT-83|Salvar resultado de teste/iteração como referência|Output aprovado de uma rodada de teste é persistido para comparação futura ou como golden example|[INFERIDO] parte do fluxo de Evaluation tool do Anthropic Console; não isolado como feature própria documentada|FRONT|M|

---

## Armadilhas

- **Precedência de camadas mal definida vira "por que ele ignorou minha instrução?"** — sem uma ordem determinística e documentada (global < projeto < assistente < conversa, ou concatenação com pesos), usuários acham o sistema quebrado. Decidir e testar a regra de merge antes de expor múltiplas camadas.
- **Token budget do system prompt comendo o contexto silenciosamente** — instruções longas + persona + conhecimento anexado podem consumir a maior parte da janela sem o usuário perceber; sem contador visível, debugging de "esqueceu o que eu disse" é às cegas.
- **Detecção de `{{variável}}` colidindo com JSON/código dentro do prompt** — se o prompt salvo contém `{{` como parte de um exemplo de código (ex. template Jinja, Handlebars), o parser de variáveis do sistema pode confundir isso com placeholder próprio. Precisa de delimitador de escape.
- **Autocomplete de slash command competindo com digitação normal** — se `/` for gatilho universal, mensagens legítimas que começam com barra (paths, comandos de shell colados) disparam o menu incorretamente; exigir `/` no início da linha vazia, não em qualquer ponto.
- **Assistente publicado publicamente vaza o system prompt via jailbreak** — instruções e conhecimento anexado de um GPT/bot público são extraíveis por prompt injection quase sempre; qualquer segredo/API key não deve ir no campo de instruções.
- **Duplicar/versionar sem congelar dependências externas** — se o assistente aponta para uma tool/API key ou base de conhecimento por referência, duplicar cria acoplamento oculto (edita o "clone" mas ainda usa o arquivo original).
- **Marketplace sem moderação vira spam de assistentes redundantes** — sem curadoria mínima (nome único, teste de funcionamento antes de publish), a busca por ranking se enche de clones idênticos ("Resume PDF Helper" x50).
- **A/B testing sem fixar seed/temperature=0 dá comparação ruidosa** — comparar prompt A vs B com sampling aleatório mistura variância de amostragem com diferença real de qualidade; testes precisam de temperatura controlada ou múltiplas execuções.
- **Custom instructions crescendo sem limite até quebrar o comportamento** — instruções longas e conflitantes (ex. "seja breve" + "sempre detalhe tudo") degradam a aderência do modelo; a maioria dos produtos recomenda limite de caracteres/tokens mas raramente aplica hard cap com aviso.

## Ordem de construção

1. **System prompt básico (global) → per-model → per-conversa** (PROMPT-01 a 03): fundação sem a qual nada mais no domínio faz sentido. Trivial de implementar (concatenação de string), mas define o contrato de merge que tudo depois depende.
2. **Precedência entre camadas + preview do prompt montado** (PROMPT-05, 10): antes de adicionar mais camadas (projeto, persona), decidir e expor a regra de merge — senão cada nova camada multiplica confusão.
3. **Instruções customizadas do usuário** (PROMPT-12 a 22): é basicamente um caso especial de system prompt global com UI estruturada (campos em vez de texto livre) — construir depois que 1-2 estiverem sólidos.
4. **Biblioteca de prompts + variáveis `{{}}`** (PROMPT-23 a 40): independente de personas; pode ser construído em paralelo a 3. Detecção de variável e formulário de preenchimento (27-32) é o núcleo técnico — fazer funcionar com texto simples antes de tipos avançados (file, date).
5. **Slash commands** (PROMPT-41 a 46): depende da biblioteca de prompts existir (41 injeta prompt salvo) — construir depois de 4.
6. **Personas/Assistentes** (PROMPT-47 a 57): consome o que foi construído em 1 (system prompt), pode reusar biblioteca de prompts como fonte de instruções. Ordem interna: identidade básica (47-48) → knowledge attach (49, único ponto de contato com RAG) → tools (50, mais caro) → model/params (51) → conversation starters (52, cosmético) → builder conversacional (53, o mais caro, deixar por último).
7. **Templates de tarefa e quick actions** (PROMPT-73 a 77): pode ser construído em paralelo desde o início — é essencialmente "prompt pré-preenchido com trigger de UI", reusa o motor de 4.
8. **Marketplace/discovery** (PROMPT-58 a 66): só faz sentido depois de 6 estar maduro (precisa ter assistentes para listar). É o item mais caro e mais opcional do domínio para um protótipo pessoal — considerar cortar.
9. **Projetos** (PROMPT-67 a 72): agregador de nível superior; depende de 1 (instruções), 3, biblioteca de arquivos/RAG (fora de escopo) e opcionalmente 6 (assistente default do projeto). Construir depois que conversas+arquivos já funcionam isoladamente.
10. **A/B e iteração de prompt** (PROMPT-78 a 83): é uma ferramenta de desenvolvedor, não de usuário final — só relevante depois que o resto do produto existe e você quer profissionalizar a escrita dos próprios system prompts/personas. Deixar por último; não é bloqueante para nenhum outro item.

## Fontes

- https://help.openai.com/en/articles/8554397-creating-and-editing-gpts
- https://help.openai.com/en/articles/8554407-gpts-in-chatgpt
- https://help.openai.com/en/articles/8798878-building-and-publishing-a-gpt
- https://openai.com/index/introducing-the-gpt-store/
- https://en.wikipedia.org/wiki/GPT_Store
- https://www.francescatabor.com/articles/2025/10/19/monetising-custom-gpts
- https://www.francescatabor.com/articles/2025/10/26/chatgpts-updated-custom-gpts-whats-new-and-how-they-work
- https://help.openai.com/en/articles/11899719-customizing-your-chatgpt-personality
- https://www.techradar.com/computing/artificial-intelligence/chatgpts-new-customization-options-are-exactly-what-ive-been-waiting-for-to-make-my-chats-more-personal
- https://help.openai.com/en/articles/10169521-projects-in-chatgpt
- https://www.unite.ai/how-to-use-chatgpts-project-memory/
- https://memx.app/glossary/chatgpt-projects/
- https://prismix.dev/guides/claude-projects-guide
- https://enterprisedna.co/resources/guides/guide-claude-system-prompts/
- https://understandingai.net/claude-master-prompt/
- https://thesignal.substack.com/p/how-to-setup-projects-in-claude
- https://code.claude.com/docs/en/memory
- https://claude.com/blog/prompt-improver
- https://claude.com/blog/evaluate-prompts
- https://platform.claude.com/docs/en/test-and-evaluate/eval-tool
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-tools
- https://danny-avila-librechat-89.mintlify.app/user-guide/prompts
- https://bowdoin.teamdynamix.com/TDClient/1814/Portal/KB/ArticleDet?ID=169029
- https://github.com/danny-avila/LibreChat/pull/3618
- https://www.librechat.ai/docs/user_guides/presets
- https://docs.openwebui.com/features/workspace/prompts/
- https://github.com/avnkhanh/open-webui-docs/blob/main/docs/features/workspace/prompts.md
- https://docs.openwebui.com/features/chat-conversations/chat-features/chat-params/
- https://docs.openwebui.com/features/workspace/models/
- https://docs.openwebui.com/features/extensibility/plugin/
- https://help.poe.com/hc/en-us/articles/21921312368020-Poe-Creator-Monetization-FAQs
- https://poe.com/pages/demos/creator-monetization
- https://creator.poe.com/docs/server-bots/poe-bot-monetization-api-documentation
- https://mistral.ai/products/vibe/
- https://mistral.ai/news/le-chat-enterprise/
- https://docs.mistral.ai/le-chat/knowledge-integrations/agents
- https://iamistral.com/agents/
- https://bootfile.ai/blog/how-to-use-gemini-gems-for-custom-ai-instructions-complete-2026-guide
- https://gemilab.net/en/articles/gemini-workspace/gemini-custom-instructions-gems-best-practices-guide
- https://thecentral.ai/p/create-custom-ai-agents-in-gemini
- https://blog.google/technology/google-labs/notebooklm-custom-personas-engine-upgrade/
- https://www.androidauthority.com/notebooklm-chat-customization-upgrade-3622570/
- https://www.xda-developers.com/notebooklm-personas-can-lie-about-sources/
- https://docs.msty.studio/features/personas
- https://grokipedia.com/page/T3_Chat
- https://best-ai.org/tool/t3-chat
- https://www.notion.com/templates/ai-prompts-organizer
- https://super.so/templates/notion-ai-prompt-templates
- https://eduwik.com/designing-a-custom-ai-workflow-in-notion/

---

# 8. `ADMIN` — Multiusuário, governança e billing

## 1. Autenticação

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|ADMIN-01|Login e-mail+senha|Autenticação local com hash bcrypt/argon2|universal|MESA|S|
|ADMIN-02|Magic link|Login sem senha via link enviado por e-mail com token de uso único|LibreChat, Poe, Notion AI|DIFF|S|
|ADMIN-03|OAuth social Google|Login via conta Google (OAuth2)|Open WebUI, LibreChat, Chatbox, T3 Chat, ChatGPT|MESA|S|
|ADMIN-04|OAuth social GitHub|Login via conta GitHub|LibreChat, T3 Chat, Open WebUI|DIFF|S|
|ADMIN-05|OAuth social Microsoft|Login via conta Microsoft/Azure AD pessoal|LibreChat, Open WebUI, Copilot|DIFF|S|
|ADMIN-06|OAuth social Apple|Login via Sign in with Apple|ChatGPT, Claude.ai|DIFF|S|
|ADMIN-07|OIDC genérico|Conecta a qualquer IdP compatível com OpenID Connect (Okta, Keycloak, Auth0)|Open WebUI, LibreChat, Claude Enterprise, Dify Enterprise|DIFF|M|
|ADMIN-08|SAML 2.0|SSO corporativo via protocolo SAML com IdP externo|Open WebUI, LibreChat, ChatGPT Enterprise, Claude Enterprise|DIFF|M|
|ADMIN-09|LDAP/Active Directory|Autenticação e busca de usuário contra servidor LDAP/AD corporativo|Open WebUI, LibreChat, RAGFlow, Onyx|DIFF|M|
|ADMIN-10|SCIM 2.0 provisioning|Provisionamento/desprovisionamento automático de usuários e grupos via protocolo SCIM a partir do IdP|Open WebUI (experimental), LibreChat, ChatGPT Enterprise, Claude Enterprise|FRONT|L|
|ADMIN-11|2FA TOTP|Segundo fator via código TOTP (RFC 6238), com QR code de setup e recovery codes|Open WebUI, ChatGPT, Claude.ai, Poe|DIFF|S|
|ADMIN-12|Passkeys/WebAuthn|Login sem senha via chave de segurança/biometria (FIDO2/WebAuthn)|ChatGPT, Claude.ai, Google/Gemini|FRONT|M|
|ADMIN-13|Sessão + refresh token|Access token de curta duração renovado por refresh token de longa duração|universal|MESA|S|
|ADMIN-14|Logout global / revogação de sessão|Admin ou usuário encerra todas as sessões ativas de uma conta remotamente|Open WebUI, ChatGPT Enterprise, Claude Enterprise|DIFF|S|
|ADMIN-15|Política de senha configurável|Regras de complexidade (regex), tamanho mínimo, expiração aplicadas no signup/troca|Open WebUI (ENABLE_PASSWORD_VALIDATION), LibreChat|MESA|S|
|ADMIN-16|Bloqueio por tentativa (rate limit de login)|Trava conta/IP após N tentativas falhas num intervalo (ex.: 5 em 3min)|Open WebUI (Redis rate limiter), LibreChat|MESA|S|
|ADMIN-17|Header-based auth atrás de proxy|Aceita identidade injetada por reverse proxy (X-Forwarded-User etc.) sem prompt de login|Open WebUI, LibreChat, Onyx|DIFF|S|
|ADMIN-18|Trusted header SSO|Variante do header-auth que confia cegamente em header assinado por gateway corporativo (ex. Cloudflare Access, oauth2-proxy)|Open WebUI, LibreChat|DIFF|M|
|ADMIN-19|API key de usuário|Usuário gera chave própria para acessar a API do produto programaticamente, revogável individualmente|Open WebUI, LibreChat, ChatGPT, Claude.ai, Dify|MESA|S|
|ADMIN-20|Vínculo de múltiplos provedores por conta|Uma conta pode linkar e alternar entre e-mail/senha, Google, GitHub etc.|Open WebUI, ChatGPT|DIFF|S|
|ADMIN-21|Auto-desabilitação mútua SAML/OIDC|Só um método federado ativo por vez para evitar ambiguidade de identidade|LibreChat|MORTO*|S|

*\*marcado MORTO no sentido de "limitação de design conhecida", não abandono — mantive como armadilha em vez de camada errada; ver Armadilhas.*

## 2. Autorização

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|ADMIN-22|Papéis fixos admin/user/pending|Três papéis: admin pleno, usuário padrão, pendente de aprovação|Open WebUI, LibreChat, Dify|MESA|S|
|ADMIN-23|Papéis customizados|Admin cria papéis além dos built-in com matriz de permissão própria|LibreChat (Admin Panel v0.8.5+)|FRONT|L|
|ADMIN-24|Grupos de usuários|Agrupa usuários para atribuição coletiva de permissão/acesso a recursos|Open WebUI, LibreChat, ChatGPT Enterprise (RBAC por grupo)|MESA|M|
|ADMIN-25|Permissão granular por feature|Flags finas tipo "pode deletar chat", "pode usar web search", "pode invocar code interpreter"|Open WebUI (feature permissions), LibreChat|DIFF|M|
|ADMIN-26|Permissão por modelo|Restringe quais modelos cada usuário/grupo pode invocar|Open WebUI, LibreChat, Dify, AnythingLLM|MESA|M|
|ADMIN-27|Permissão por tool|Restringe quais ferramentas/plugins/MCP servers um papel pode acionar|Open WebUI, LibreChat, Dify|DIFF|M|
|ADMIN-28|Permissão por knowledge base|Controla quais bases de conhecimento/coleções cada usuário ou grupo enxerga|Open WebUI, Dify, RAGFlow, Onyx, AnythingLLM|DIFF|M|
|ADMIN-29|Visibilidade de recurso Private/Public/Shared|Modelos, prompts, tools e KBs têm modo de compartilhamento configurável por item|Open WebUI, LibreChat|DIFF|M|
|ADMIN-30|Workspaces/organizações|Contêiner isolado de config, membros e recursos, separado de outros workspaces do mesmo servidor|Dify, LibreChat (multi-org), ChatGPT (workspaces), Claude (orgs)|MESA|L|
|ADMIN-31|Multi-tenancy real (SaaS)|Um deployment serve múltiplos clientes/organizações isoladas entre si logicamente|Dify Cloud, Poe, T3 Chat, Onyx Cloud|FRONT|XL|
|ADMIN-32|Isolamento de dados entre tenants|Garantia técnica (schema/tenant_id/DB separado) de que dado de um tenant nunca vaza pra outro|Dify, RAGFlow Enterprise, Onyx|FRONT|L|
|ADMIN-33|Delegação de admin (system grants)|Concede capacidades administrativas pontuais (manage:users, read:usage) sem tornar o usuário admin pleno|LibreChat (system grants)|FRONT|M|
|ADMIN-34|Modelo aditivo de permissão (sem "deny")|Permissões só somam (grant); não existe regra de negação explícita|Open WebUI|DIFF|S|
|ADMIN-35|Ownership único de workspace|Um único "owner" com controle total (billing, exclusão), não transferível|Dify|DIFF|S|
|ADMIN-36|RBAC com papel Admin sem billing|Papel intermediário administra recursos/membros mas não acessa billing/faturamento|Dify (Admin role), Claude Enterprise (Admin vs Primary Owner)|DIFF|M|

## 3. Onboarding e ciclo de vida

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|ADMIN-37|Registro aberto (self-signup)|Qualquer visitante cria conta sem convite|Open WebUI (config), Chatbox, Jan|MESA|S|
|ADMIN-38|Registro só por convite|Conta só é criada a partir de link/token de convite enviado por admin|LibreChat, Dify, Notion AI, T3 Chat (teams)|MESA|S|
|ADMIN-39|Aprovação manual de novo usuário (pending)|Novo cadastro fica em fila "pending" até admin aprovar|Open WebUI, LibreChat|DIFF|S|
|ADMIN-40|Domínio de e-mail permitido (allowlist)|Só e-mails de domínios corporativos configurados podem se cadastrar|Open WebUI, ChatGPT Enterprise (domain verification), Claude Enterprise|MESA|S|
|ADMIN-41|Desativar usuário sem deletar|Suspende acesso mantendo histórico e dados, reversível|Open WebUI, LibreChat, ChatGPT Enterprise|MESA|S|
|ADMIN-42|Transferir conversas entre usuários|Admin reatribui histórico de chat de uma conta para outra (ex. saída de funcionário)|LibreChat [INFERIDO parcial — via scripts admin], Notion AI (workspace transfer)|DIFF|M|
|ADMIN-43|Exclusão de conta com purga de dados|Remove conta e apaga dados associados (chats, embeddings, arquivos) de forma completa e auditável|Open WebUI, ChatGPT, Claude.ai (direito ao esquecimento)|MESA|M|
|ADMIN-44|Bulk member management|Admin importa/gerencia usuários em lote (CSV, API) em vez de um por um|ChatGPT Enterprise, Claude Enterprise, Dify Enterprise|DIFF|M|
|ADMIN-45|Desprovisionamento automático via SCIM|Remoção do IdP corporativo (ex. offboarding no Okta) revoga acesso automaticamente|ChatGPT Enterprise, Claude Enterprise, Open WebUI (SCIM)|FRONT|L|

## 4. Quotas e limites

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|ADMIN-46|Limite de mensagens por período|Teto de nº de mensagens/interações por usuário num intervalo (dia/mês)|Dify (message credits), Poe (points), T3 Chat|MESA|M|
|ADMIN-47|Limite de tokens por usuário|Teto de tokens de entrada+saída consumidos num período|LibreChat (token credits), Msty|DIFF|M|
|ADMIN-48|Limite de custo (budget cap)|Trava em $ gasto por usuário/grupo/workspace, não em tokens brutos|LibreChat (balance em $), Dify Enterprise|DIFF|M|
|ADMIN-49|Limite por modelo|Quota diferenciada conforme o modelo escolhido (modelo caro consome mais rápido a cota)|LibreChat (multiplicadores por modelo), Dify|DIFF|M|
|ADMIN-50|Rate limit por usuário/grupo (req/min)|Trava taxa de requisições concorrentes ou por minuto, não só volume total|Dify (KB actions/min), Open WebUI (via proxy/filter function)|MESA|S|
|ADMIN-51|Período de reset de quota configurável|Admin define se a cota reseta diário, semanal, mensal ou nunca (lifetime)|Dify (mensal vs lifetime no Sandbox), LibreChat|DIFF|S|
|ADMIN-52|Comportamento configurável ao estourar quota|Admin escolhe: bloquear, avisar, permitir déficit temporário, cobrar overage|LibreChat (permite déficit em completion tokens antes de bloquear), Dify (bloqueia/upgrade)|DIFF|M|
|ADMIN-53|Créditos pré-pagos / saldo manual|Admin adiciona/define saldo de créditos manualmente por usuário (scripts/CLI ou UI)|LibreChat (balance CLI/Docker), Poe (compute points)|DIFF|M|
|ADMIN-54|Falta de enforcement nativo de uso (gap conhecido)|Produto só rastreia consumo, não impõe teto — depende de proxy externo|Open WebUI (sem cap nativo até 2026)|MORTO|—|

## 5. Observabilidade administrativa

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|ADMIN-55|Dashboard de uso agregado|Painel com métricas gerais de uso da plataforma (chats, tokens, custo) por período|Open WebUI (analytics dashboard), ChatGPT Enterprise, Claude Enterprise, LibreChat, Dify|MESA|M|
|ADMIN-56|Usuários ativos (DAU/WAU/MAU)|Métrica de engajamento por janela de tempo|ChatGPT Enterprise, Claude Enterprise, Onyx|DIFF|M|
|ADMIN-57|Custo por usuário/modelo/período|Breakdown de gasto segmentado, essencial para chargeback interno|LibreChat, Open WebUI (v0.8+ per-message token tracking), Dify|DIFF|M|
|ADMIN-58|Top prompts / prompts mais usados|Ranking de prompts/templates mais acionados pela base de usuários|Onyx, Dify (analytics)|DIFF|M|
|ADMIN-59|Latência por modelo/rota|Métrica de tempo de resposta observada, segmentável por modelo/provedor|Onyx, LangSmith-integrado (LangChain), Dify|DIFF|M|
|ADMIN-60|Taxa de erro / falhas de request|Contagem e taxa de erro de chamadas a LLM/tools, por período|Dify, Onyx, LangFuse-integrado|DIFF|M|
|ADMIN-61|Export de relatório (CSV/JSON)|Extração de métricas/uso para análise externa ou faturamento|Claude Admin Console (JSON/CSV export), ChatGPT Enterprise (Compliance API)|DIFF|S|
|ADMIN-62|Audit log imutável de ações admin|Registro append-only de ações administrativas (criação de user, mudança de role, config) para auditoria|ChatGPT Enterprise (Admin Audit logs), Claude Enterprise (30 dias default), Open WebUI [INFERIDO parcial]|FRONT|L|
|ADMIN-63|Push de logs para SIEM|Exporta audit log direto para Splunk/Datadog/Elastic|Claude Enterprise, ChatGPT Enterprise (Compliance Logs Platform)|FRONT|L|
|ADMIN-64|Log de conversa acessível pelo admin|Admin pode visualizar conteúdo integral de chats de usuários (não só metadados)|ChatGPT Enterprise (Compliance API — chat data/file content), Claude Enterprise (Compliance API), LibreChat (admin panel)|DIFF|M|
|ADMIN-65|Retenção de log configurável|Admin define por quanto tempo audit logs/conversas ficam armazenados antes de purga automática|Claude Enterprise, ChatGPT Enterprise, Open WebUI (env var)|DIFF|M|
|ADMIN-66|Compliance API dedicada (separada de analytics)|Endpoint distinto e mais granular que o dashboard, voltado a eDiscovery/DLP, com key própria|ChatGPT Enterprise (Compliance API Key), Claude Enterprise (Compliance API)|FRONT|L|

## 6. Governança de conteúdo

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|ADMIN-67|Moderação de entrada (input)|Filtra prompt do usuário contra política de conteúdo antes de chegar ao modelo|ChatGPT (moderation endpoint), Dify (moderation plugin), Open WebUI (moderation filter)|MESA|M|
|ADMIN-68|Moderação de saída (output)|Filtra resposta do modelo antes de exibir ao usuário|ChatGPT, Claude (Constitutional Classifiers), Dify|MESA|M|
|ADMIN-69|Guardrails customizáveis|Admin define regras próprias de bloqueio/comportamento além do moderador padrão do provedor|Dify (moderation node), Langflow, RAGFlow|DIFF|L|
|ADMIN-70|Bloqueio de palavra-chave|Lista de termos proibidos que trava ou substitui a mensagem automaticamente|Dify (keyword moderation), Open WebUI (community filters)|DIFF|S|
|ADMIN-71|Detecção e redação de PII|Identifica e mascara dados pessoais (CPF, e-mail, cartão) em prompt/resposta/documento|Dify (PII plugin), RAGFlow, Microsoft Copilot (Purview integration)|FRONT|L|
|ADMIN-72|DLP (Data Loss Prevention) integrado|Integração com solução corporativa de DLP para bloquear vazamento de dado sensível fora do perímetro|Microsoft Copilot (Purview DLP), ChatGPT Enterprise (via terceiros)|FRONT|XL|
|ADMIN-73|Classificação de sensibilidade de documento|Etiqueta documentos/KBs por nível de confidencialidade, herdado no RAG|Microsoft Copilot (sensitivity labels), Onyx Enterprise [INFERIDO]|FRONT|L|
|ADMIN-74|Aprovação de uso de modelo externo|Admin precisa aprovar explicitamente antes de um usuário poder chamar provedor de modelo de terceiro (ex. modelo não hospedado internamente)|Dify (model provider config por workspace), LibreChat (endpoints habilitados por admin)|DIFF|M|
|ADMIN-75|Watermark de conteúdo gerado|Marca d'água (visível ou estatística/SynthID) em texto/imagem gerada para rastreabilidade|Gemini (SynthID), ChatGPT (imagens, C2PA metadata)|FRONT|L|
|ADMIN-76|Bloqueio de upload por tipo de arquivo|Admin restringe quais extensões/MIME types podem ser enviados como anexo|Open WebUI, LibreChat, ChatGPT Enterprise|MESA|S|

## 7. Compliance

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|ADMIN-77|Certificação SOC 2 Type II|Auditoria independente de controles de segurança do provedor|ChatGPT Enterprise, Claude Enterprise, Dify Cloud|MESA (para closed SaaS)|XL|
|ADMIN-78|Certificação ISO 27001|Certificação internacional de gestão de segurança da informação|Claude Enterprise, ChatGPT Enterprise, Onyx Enterprise|DIFF|XL|
|ADMIN-79|HIPAA/BAA disponível|Contrato de associado comercial para uso com dados de saúde protegidos (PHI)|ChatGPT Enterprise/Edu/Healthcare, Claude (HIPAA-ready plans)|DIFF|XL|
|ADMIN-80|GDPR — direito ao esquecimento|Mecanismo formal de exclusão completa de dado pessoal a pedido do titular|ChatGPT, Claude.ai, universal (obrigação legal EU)|MESA (para EU)|M|
|ADMIN-81|DPA (Data Processing Agreement)|Contrato padrão que rege o processamento de dado pessoal pelo provedor como operador|ChatGPT Enterprise, Claude Enterprise, Dify|MESA (B2B)|S (contratual)|
|ADMIN-82|Residência de dados configurável|Cliente escolhe região geográfica onde dado fica armazenado em repouso (US/EU/UK/JP etc.)|ChatGPT Enterprise (10 regiões), Claude (workspace geo)|FRONT|XL|
|ADMIN-83|Residência de inferência (processing geo)|Além do armazenamento, controla também onde a inferência (GPU) roda|ChatGPT (in-region GPU inference), Claude (inference_geo)|FRONT|XL|
|ADMIN-84|Conformidade com EU AI Act|Controles/documentação para atender obrigações do AI Act (transparência, avaliação de risco)|ChatGPT Enterprise, Claude Enterprise [INFERIDO — documentação de compliance em progresso]|FRONT|XL|
|ADMIN-85|Zero Data Retention (ZDR) com provedor|Prompt/resposta não são retidos após a resposta, exceto para casos de abuso/lei; requer elegibilidade especial|Claude (Enterprise + Claude Code, sob aprovação), ChatGPT (API, elegível)|FRONT|L (integração) / negociação comercial|
|ADMIN-86|Opt-out de treinamento com dado do usuário|Garante contratualmente que dado da conta não é usado para treinar modelos futuros|ChatGPT Team/Enterprise/API (default off), Claude (default off para API/Team/Enterprise)|MESA (para paid tiers)|S (contratual/config)|
|ADMIN-87|Criptografia em repouso|Dados armazenados criptografados (AES-256 ou equivalente) no storage do provedor|universal (closed SaaS enterprise)|MESA|M|
|ADMIN-88|KMS / chave gerenciada pelo cliente (BYOK)|Cliente traz/controla a própria chave de criptografia via KMS (AWS KMS, Azure Key Vault)|ChatGPT Enterprise, Claude Enterprise (customer-managed keys)|FRONT|L|
|ADMIN-89|Deploy air-gapped / on-prem isolado|Produto roda totalmente offline, sem saída de rede para o provedor, para ambientes classificados|Open WebUI, LibreChat, Onyx (self-hosted), RAGFlow, KoboldCpp, text-generation-webui|FRONT|XL|

## 8. Configuração

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|ADMIN-90|Painel admin GUI|Interface web para configuração administrativa sem editar arquivo|Open WebUI, LibreChat (Admin Panel), Dify, AnythingLLM|MESA|M|
|ADMIN-91|Configuração via YAML/arquivo|Config declarativa versionável em arquivo (docker-compose, librechat.yaml)|LibreChat (librechat.yaml), Langflow, n8n|MESA|S|
|ADMIN-92|Configuração via env vars|Parametrização por variável de ambiente, padrão em deploy containerizado|universal OSS|MESA|S|
|ADMIN-93|Hot reload de config sem restart|Mudança de config aplicada em runtime sem derrubar o serviço|LibreChat (parcial, algumas configs), Dify [INFERIDO parcial]|DIFF|M|
|ADMIN-94|Config as code (GitOps)|Config do produto versionada e aplicada via pipeline (CI/CD) em vez de UI manual|Langflow, n8n, Dify Enterprise self-host|DIFF|M|
|ADMIN-95|Feature flags|Habilita/desabilita funcionalidade específica por ambiente/tenant/usuário sem deploy|ChatGPT Enterprise (workspace policies), LibreChat (custom endpoints toggle)|DIFF|M|
|ADMIN-96|Banner/anúncio para usuários|Admin publica aviso (manutenção, política nova) visível no topo da UI de todos os usuários|Open WebUI (admin announcement), LibreChat|DIFF|S|
|ADMIN-97|Customização de branding (logo/cor/nome)|White-label parcial: troca de identidade visual da instância|Open WebUI, LibreChat, AnythingLLM, LobeHub|DIFF|S|
|ADMIN-98|Domínio customizado (custom domain)|Instância acessível via domínio próprio do cliente em vez do domínio do produto|Dify Cloud, Poe (bots), Notion AI (workspace domain)|DIFF|M|
|ADMIN-99|Termos de uso obrigatórios (forçar aceite)|Bloqueia acesso até usuário aceitar explicitamente ToS/política interna|ChatGPT Enterprise, Claude Enterprise, LibreChat [INFERIDO]|MESA (enterprise)|S|
|ADMIN-100|Idioma default configurável pelo admin|Define idioma padrão da interface para novos usuários, independente do browser|Open WebUI, LibreChat, LobeHub|DIFF|S|

## 9. Billing

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|ADMIN-101|Planos com tiers (free/pro/team/enterprise)|Múltiplos níveis de assinatura com limites e features crescentes|Dify (Sandbox/Professional/Team/Enterprise), ChatGPT (Free/Plus/Pro/Business/Enterprise), Claude (Free/Pro/Team/Enterprise), Poe|MESA|L|
|ADMIN-102|Assinatura recorrente (subscription)|Cobrança automática mensal/anual via cartão|Dify, ChatGPT, Claude, T3 Chat, Perplexity|MESA|M|
|ADMIN-103|Medição de uso (metering)|Rastreia consumo real (mensagens, tokens, chamadas) como base de cobrança|Dify (message credits), LibreChat (balance), OpenAI API (usage-based)|MESA|M|
|ADMIN-104|Cobrança por seat|Preço escala pelo nº de usuários licenciados, independente do uso|ChatGPT Business/Enterprise (per-seat), Claude Team/Enterprise, Notion AI|MESA|S|
|ADMIN-105|Cobrança por consumo (usage-based)|Preço escala pelo volume de tokens/créditos consumidos, não por assento|Dify (overage), OpenAI API, Anthropic API|DIFF|M|
|ADMIN-106|Modelo híbrido seat+consumo|Combina taxa fixa por assento com cobrança adicional por uso excedente|ChatGPT Enterprise (credit pooling), Dify (plano + overage)|DIFF|M|
|ADMIN-107|Integração Stripe (checkout/portal)|Usa Stripe para checkout, portal de auto-gestão de assinatura e webhooks de cobrança|T3 Chat, Dify Cloud [INFERIDO — padrão de mercado para SaaS pequeno], AnythingLLM Cloud|MESA|M|
|ADMIN-108|Trial gratuito com limite de tempo/uso|Período ou cota experimental antes de exigir cartão|Dify (Sandbox lifetime), ChatGPT Plus (trial regional), Perplexity Pro trial|MESA|S|
|ADMIN-109|Cupom / código promocional|Desconto aplicável no checkout via código|ChatGPT (promoções pontuais), Perplexity (partnerships), T3 Chat|DIFF|S|
|ADMIN-110|Invoice / nota fiscal automática|Gera e disponibiliza fatura formal para download após cada cobrança|Dify, ChatGPT Business/Enterprise, Claude Team/Enterprise|MESA|S|
|ADMIN-111|Upgrade/downgrade de plano self-serve|Usuário troca de plano sozinho, com proration automático|Dify, ChatGPT, Claude, Perplexity|MESA|M|
|ADMIN-112|Limite de plano bloqueando funcionalidade|Feature (SSO, SCIM, audit log) só liberada acima de certo tier, não é sobre volume|ChatGPT Enterprise-only (SCIM, RBAC, IP allowlist), Claude Enterprise-only (ZDR, custom retention)|MESA|S|
|ADMIN-113|Self-serve vs sales-led (enterprise sob consulta)|Tiers baixos compram direto no site; tier enterprise exige contato comercial e contrato customizado|Dify (Enterprise = "contact sales"), ChatGPT Enterprise, Claude Enterprise, Onyx Enterprise|MESA|—|
|ADMIN-114|Desconto anual (yearly billing)|Preço reduzido (~15-20%) para compromisso anual vs mensal|Dify (~17% off), ChatGPT Plus/Pro, Claude Pro|DIFF|S|
|ADMIN-115|Pool de créditos por workspace/organização|Créditos compartilhados entre todos os membros do workspace em vez de por-usuário|ChatGPT Enterprise (credit pooling), Dify (message credits por workspace)|DIFF|M|

---

## Armadilhas

- **SAML/OIDC mutuamente exclusivos**: LibreChat desativa SAML automaticamente se OIDC estiver ligado — implementação ingênua assume que múltiplos métodos federados coexistem livremente; testar a matriz de precedência antes de expor no admin panel.
- **SCIM antes de SSO testado**: provisionar via SCIM sem SSO validado no IdP causa falhas silenciosas de sincronização (visto em Claude Enterprise/WorkOS) — sequência obrigatória é SSO primeiro, SCIM depois.
- **bcrypt trunca em 72 bytes**: senhas longas (passphrases) são truncadas silenciosamente pelo bcrypt; sem validação explícita de tamanho máximo no frontend, o usuário acha que definiu uma senha mais forte do que realmente é.
- **Rastrear uso ≠ impor limite**: é comum construir dashboard de consumo e assumir que isso "resolve" quota — Open WebUI é o caso canônico: mede tokens por usuário mas não bloqueia nada; enforcement real exige hook síncrono antes da chamada ao modelo, não job assíncrono de agregação.
- **Modelo aditivo sem "deny"**: se o sistema de permissão só soma grants (nunca nega), é impossível revogar um acesso específico de um grupo maior sem remover o usuário do grupo inteiro — decidir isso na modelagem de dados desde o início, migração depois é dolorosa.
- **Audit log mutável por acidente**: log gravado na mesma tabela que dados operacionais (editável por delete/update comuns) não é "imutável" de fato — precisa ser append-only real (write-once storage, hash chain, ou tabela sem UPDATE/DELETE grant) para servir de evidência de compliance.
- **Confundir Analytics com Compliance API**: dashboard de engajamento e log de auditoria/eDiscovery são produtos diferentes com garantias diferentes (retenção, granularidade, formato) — ChatGPT/Claude os separam propositalmente; misturar os dois undermines a legal defensibility de ambos.
- **Multi-tenancy por filtro de query, não por isolamento físico/lógico forte**: usar só `WHERE tenant_id = ?` em toda query é frágil — um único endpoint esquecido vaza dado entre tenants; requer camada de enforcement centralizada (row-level security no DB, ou schema por tenant).
- **Rate limit só no login, não na API**: proteger só o formulário de senha e esquecer rate limit na rota de API key deixa a porta dos fundos aberta para brute-force/DoS.
- **Zero Data Retention como feature de toggle no self-serve**: ZDR não é um switch no admin panel em nenhum provedor grande — é elegibilidade negociada; documentar isso evita prometer algo que exige contrato à parte.
- **Billing por seat sem lidar com sazonal/temporário**: cobrar por seat fixo penaliza equipes com rotatividade alta; a maioria dos provedores maduros oferece pool de crédito ou proration diária para mitigar.
- **Confiar em header de proxy sem validar origem**: trusted-header SSO sem checar que o request vem da rede/gateway esperado é um bypass de auth trivial (qualquer request direto ao backend se autentica como quem quiser).

## Ordem de construção

1. **Auth local (e-mail+senha) + sessão/refresh token** — fundação; tudo mais assume identidade resolvida.
2. **Papéis fixos (admin/user/pending) + aprovação manual** — menor RBAC funcional antes de abrir cadastro.
3. **Rate limit de login + política de senha** — segurança mínima antes de expor publicamente.
4. **Grupos + permissão granular por feature/modelo/tool/KB** — depende dos papéis já existirem; é o motor de autorização real.
5. **Workspaces/organizações** — só faz sentido depois que grupos e permissões existem; workspace é o container que os agrupa.
6. **OAuth social → OIDC → SAML → LDAP → SCIM** — nessa ordem de complexidade crescente; SCIM sempre por último e só depois de SSO estável.
7. **2FA TOTP → passkeys** — TOTP é mais barato e cobre 90% do caso de uso; passkeys depois, como camada extra.
8. **Quotas e limites (mensagem/token/custo) com enforcement síncrono** — só depois que autorização por modelo/grupo existe, pois quota é aplicada por essas mesmas dimensões.
9. **Dashboard de uso → audit log imutável → export/Compliance API** — dashboard é read-model simples; audit log exige storage append-only; Compliance API é o polimento final para clientes enterprise.
10. **Moderação de entrada/saída → PII/DLP → classificação de sensibilidade** — moderação básica é barata (regex/API de terceiro); DLP e sensibilidade dependem de integração com sistemas externos, deixar por último.
11. **Certificações formais (SOC2/ISO) e residência de dados** — dependem de toda a infra anterior estar madura e auditável; não adianta buscar certificação antes disso.
12. **Config as code / feature flags / branding** — paralelo ao resto, mas hot reload só depois que a superfície de config estabilizar (senão retrabalho constante).
13. **Billing (planos → metering → Stripe → self-serve upgrade/downgrade)** — por último; billing sem quota/RBAC funcionando não tem o que medir nem o que limitar.

## Fontes

- https://docs.openwebui.com/features/authentication-access/
- https://docs.openwebui.com/features/authentication-access/auth/scim/
- https://docs.openwebui.com/features/authentication-access/auth/sso/
- https://docs.openwebui.com/features/authentication-access/rbac/
- https://docs.openwebui.com/features/authentication-access/rbac/groups/
- https://docs.openwebui.com/features/authentication-access/rbac/permissions/
- https://docs.openwebui.com/getting-started/advanced-topics/hardening/
- https://docs.openwebui.com/enterprise/security/
- https://github.com/open-webui/open-webui/discussions/16338
- https://github.com/open-webui/open-webui/issues/23323
- https://www.librechat.ai/docs/features/access_control
- https://www.librechat.ai/docs/features/admin_panel
- https://www.librechat.ai/docs/configuration/authentication/SAML
- https://www.librechat.ai/docs/configuration/authentication/ldap
- https://deepwiki.com/LibreChat-AI/librechat.ai/8-documented-user-management
- https://openai.com/index/new-tools-for-chatgpt-enterprise/
- https://openai.com/business-data/
- https://help.openai.com/en/articles/9903489-data-residency-and-inference-residency-for-chatgpt
- https://support.claude.com/en/articles/13015708-access-the-compliance-api
- https://support.claude.com/en/articles/13132885-set-up-single-sign-on-sso
- https://support.claude.com/en/articles/9970975-access-audit-logs
- https://platform.claude.com/docs/en/manage-claude/data-residency
- https://code.claude.com/docs/en/zero-data-retention
- https://claude.com/resources/tutorials/claude-enterprise-administrator-guide
- https://docs.dify.ai/en/use-dify/workspace/team-members-management
- https://dify.ai/pricing

Agora finalizo com yield mínimo.

---

# 9. `DEV` — Extensibilidade, API e deploy

## 1. Sistemas de plugin

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|DEV-01|Pipe Function (custom model)|Plugin Python in-process que aparece como modelo selecionável na UI, injeta lógica custom/proxy para API externa|Open WebUI|DIFF|M|
|DEV-02|Filter Function pre/post|Transforma inputs antes do LLM e outputs depois, aplicável globalmente ou por modelo, toggleable por chat|Open WebUI|DIFF|M|
|DEV-03|Action Function (botão custom na msg)|Adiciona botão custom na toolbar da mensagem, executa Python com acesso a event system|Open WebUI|DIFF|S|
|DEV-04|Event Function (hooks de sistema)|Roda Python custom em eventos do sistema (signup, delete de chat, start do server, mudança de config)|Open WebUI|DIFF|M|
|DEV-05|Pipelines framework (worker externo)|Framework OpenAI-compatible standalone (container separado) para plugins UI-agnostic; **legado**, substituído por Functions/Tools|Open WebUI (legacy)|MORTO|L|
|DEV-06|Valves (config declarativa de plugin)|Parâmetros declarativos em Tools/Functions geram GUI de config automaticamente para admin e usuário (UserValves)|Open WebUI|DIFF|S|
|DEV-07|Dependency injection de contexto no plugin|Injeta `__user__`, `__request__`, `__metadata__`, `__oauth_token__` como args especiais na função do plugin|Open WebUI|DIFF|S|
|DEV-08|Rich UI embedding via plugin (HTML/iframe)|Tools/Actions retornam HTML/iframe renderizado inline no chat (dashboards, charts, widgets interativos)|Open WebUI|FRONT|M|
|DEV-09|Custom endpoint config (YAML) apontando p/ API externa|Define endpoint OpenAI/Anthropic-compatible custom via arquivo de config (nome, baseURL, apiKey, headers dinâmicos)|LibreChat|MESA|S|
|DEV-10|Agent Plugins (pacote de skills+MCP+hooks)|Formato de pacote versionado (semver) carregado do filesystem, cada subpasta = 1 plugin, com dados persistentes isolados|LibreChat|DIFF|M|
|DEV-11|Custom params/headers dinâmicos por endpoint|Sobrescreve params default da API e injeta headers com variáveis de template (`{{LIBRECHAT_USER_ID}}`)|LibreChat|DIFF|S|
|DEV-12|API key "user_provided" por endpoint|Permite usuário inserir sua própria API key pela UI em vez de admin configurar globalmente|LibreChat, Open WebUI, ChatGPT (BYOK em alguns planos)|MESA|S|
|DEV-13|Plugin decoupled runtime (processo isolado)|Plugin roda como pacote/processo independente, versionado, sandboxed, com manifest de permissões|Dify|FRONT|XL|
|DEV-14|Marketplace de plugin com review de código|Loja pública de plugins (120+), cada um passa por code review e roda isolado com permissões declaradas|Dify|FRONT|XL|
|DEV-15|Tipos de plugin diferenciados (Tool/Model/Agent Strategy/Extension/Datasource/Trigger)|Taxonomia de plugin por papel funcional, cada tipo com contrato de interface próprio|Dify|FRONT|L|
|DEV-16|Remote debugging de plugin em IDE|Conecta ambiente local ao SaaS e encaminha execução do plugin para debug com IDE popular|Dify|DIFF|M|
|DEV-17|Plugin bundle (instalação em lote)|Instala conjunto curado de múltiplos plugins de uma vez|Dify|DIFF|S|
|DEV-18|Scaffolding CLI p/ novo plugin|Ferramenta de linha de comando gera esqueleto de projeto de plugin com YAML+Python|Dify|DIFF|S|
|DEV-19|OAuth support nativo em plugin|SDK de plugin oferece fluxo OAuth pronto para plugins que precisam autenticar em serviço externo|Dify|DIFF|M|
|DEV-20|Plugin index + manifest separados|Metadados de listagem (nome, autor, versão) separados do manifest funcional (schema server-side)|LobeHub|DIFF|S|
|DEV-21|Plugin gateway (backend proxy p/ plugin)|Serviço backend dedicado que roteia/executa chamadas de plugin fora do processo principal|LobeHub|DIFF|M|
|DEV-22|Instalação de plugin via UI (URL de manifest)|Usuário cola URL do manifest do plugin na UI e instala sem editar config/código|LobeHub, Open WebUI (Tools import), LibreChat (Agent Marketplace)|MESA|S|
|DEV-23|Custom UI injetada por plugin (component customizado)|Plugin registra componente de frontend próprio renderizado dentro da conversa|LobeHub, Open WebUI (Action HTML)|DIFF|L|
|DEV-24|Hook de ciclo de vida on-stream-chunk|Plugin/função intercepta e transforma cada chunk do streaming de resposta em tempo real|Open WebUI (Filter com stream events)|DIFF|M|
|DEV-25|Sandbox de execução de plugin (isolamento de processo)|Plugin roda em processo/container separado sem acesso direto ao processo principal, mitigando RCE|Dify (plugin runtime isolado); Open WebUI Tools/Functions rodam **sem** sandbox (aviso oficial: equivale a shell access)|DIFF|XL|

### Armadilhas — Plugins
- Open WebUI Tools/Functions executam Python arbitrário **sem sandbox** — dar permissão de criar Function equivale a dar shell no servidor.
- Confundir "Pipe" (aparece como modelo) com "Filter" (transforma dados) leva a plugin no lugar errado do pipeline.
- Versionamento de plugin sem lockfile de dependências quebra silenciosamente em upgrade do host (visto na migração Pipelines→Functions do Open WebUI).
- Hook de stream chunk mal implementado quebra backpressure e trava a UI em respostas longas.
- Marketplace sem review de permissão declarada vira vetor de supply-chain attack.

### Ordem de construção — Plugins
1. Definir contrato de invocação (assíncrono, timeout, args padrão tipo `user`/`request`).
2. Implementar 1 tipo de hook simples (filter pre-request) antes de suportar múltiplos.
3. Adicionar config declarativa (valves) só depois do hook funcionar hardcoded.
4. Sandbox/isolamento de processo — pré-requisito para permitir plugin de terceiros.
5. Marketplace/instalação via UI é o último passo, depende de sandbox + versionamento resolvidos.

---

## 2. API pública

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|DEV-26|Endpoint OpenAI-compatible exposto (`/v1/chat/completions`)|Expõe API própria no formato OpenAI para clientes externos consumirem os modelos do host|Open WebUI, LM Studio, KoboldCpp, text-generation-webui|MESA|M|
|DEV-27|REST API completa de conversas/mensagens/usuários|CRUD via API sobre chats, mensagens, folders e contas, autenticado por Bearer token/JWT|Open WebUI, LibreChat (parcial)|DIFF|L|
|DEV-28|Namespace de API dedicado p/ RAG/arquivos (`/api/v1`)|Endpoints próprios para upload de arquivo e knowledge-base RAG, separados do namespace de chat|Open WebUI|DIFF|M|
|DEV-29|Header alternativo de API key sob reverse proxy|Permite entregar API key via header custom (`x-api-key`, renomeável) quando `Authorization` já é usado pelo proxy|Open WebUI|DIFF|S|
|DEV-30|Swagger/OpenAPI gerado automaticamente|Documentação interativa da API gerada a partir do código (habilitada só em modo dev)|Open WebUI|DIFF|S|
|DEV-31|GPT Actions via schema OpenAPI 3.1|Custom GPT chama API externa a partir de schema OpenAPI colado pelo criador, com auth API-key ou OAuth|ChatGPT (GPT Store)|FRONT|M|
|DEV-32|Assistants API (threads, tools hospedados)|API hospedada com threads persistentes, code interpreter e file search — **deprecada, remoção ago/2026**|OpenAI (Assistants API)|MORTO|—|
|DEV-33|Responses API (sucessor do Assistants)|API unificada de nova geração para tools hospedadas (web search, file search, computer use) e agents|OpenAI|FRONT|L|
|DEV-34|API REST completa de terceiros (Claude API, Gemini API)|Endpoint de API própria para completions, usado por devs externos|Claude (Anthropic API), Gemini (Google AI Studio/Vertex), Mistral (La Plateforme), DeepSeek (Platform API), Grok (xAI API)|MESA|—|
|DEV-35|Webhooks de evento (mensagem criada, run concluído)|Notifica sistema externo via HTTP POST quando evento ocorre|n8n (nativo), Dify (workflow webhook trigger)|DIFF|M|
|DEV-36|SSE público para streaming de resposta|Expõe Server-Sent Events como parte da API pública para cliente externo consumir stream de tokens|Open WebUI (`/api/chat/completions` c/ stream), OpenAI-compatible APIs em geral|MESA|M|
|DEV-37|WebSocket público (updates em tempo real)|Canal WS para eventos de UI/collab em tempo real consumível por integração externa|Open WebUI (Socket.IO interno, uso público limitado) [INFERIDO parcial]|DIFF|L|
|DEV-38|SDK oficial (Python/JS) para a API do produto|Biblioteca cliente mantida pelo time do produto, cobre autenticação e chamadas tipadas|OpenAI, Anthropic, Mistral, DeepSeek (compatível SDK OpenAI)|MESA|—|
|DEV-39|Rate limit documentado por tier de API key|Limites de requisição/minuto e tokens/minuto documentados e escaláveis por plano pago|OpenAI, Anthropic, Mistral, DeepSeek|MESA|—|
|DEV-40|Versionamento de API (path ou header)|API pública versionada explicitamente (`/v1/`) permitindo evolução sem quebrar clientes antigos|OpenAI, Anthropic, Open WebUI (`/api/v1`, `/v1`, `/ollama` namespaces distintos)|MESA|S|

### Armadilhas — API pública
- Expor `/v1/chat/completions` sem separar API key de sessão de usuário da API key de app externo mistura escopos de permissão.
- Rate limit por usuário sem rate limit por API key permite 1 chave vazada esgotar cota de todos.
- SSE público sem heartbeat/keep-alive derruba conexões atrás de proxy/LB agressivo em timeout.
- Versionar API só depois de já ter clientes em produção força breaking change retroativo.
- Documentação OpenAPI auto-gerada sem exemplos de request real é insuficiente para integração.

### Ordem de construção — API pública
1. Endpoint OpenAI-compatible mínimo (`/v1/chat/completions`, `/v1/models`).
2. Autenticação por API key (não JWT de sessão).
3. Rate limiting por chave.
4. REST de conversas/mensagens (CRUD) — depende do modelo de dados estável.
5. Webhooks e SSE público — dependem do modelo de eventos interno já existir.
6. SDK oficial e OpenAPI doc gerada — por último.

---

## 3. Embedding em outro produto

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|DEV-41|Widget embutível via script tag|`<script>` + `mount()` injeta chat widget flutuante em qualquer página, adapta tamanho ao container|open-webui-embeddable-widget (comunidade), padrão de mercado de widgets de chat|DIFF|M|
|DEV-42|Embed via iframe com URL params|Chat completo embutido via iframe, configurado por query string (modelo, endpoint, api_key, tema)|LibreChat (iframe + query params), Open WebUI widget (`?api_key=&model=&endpoint=`)|DIFF|S|
|DEV-43|React component publicado em npm|Pacote de componentes React reutilizáveis do chat, instalável via `npm install`|LibreChat (`@librechat/client`), LobeHub (`@lobehub/chat` como lib), assistant-ui|DIFF|M|
|DEV-44|Web component custom element|Widget encapsulado como custom element HTML sem dependência de framework do host|padrão genérico de widgets comerciais [INFERIDO — não confirmado em produto específico da lista]|DIFF|M|
|DEV-45|Contexto do host passado ao widget (user info, page data)|Host injeta dados (usuário logado, página atual, produto) no widget para personalizar a conversa|padrão geral de widget embutível [INFERIDO parcial]|DIFF|M|
|DEV-46|Callbacks de evento do widget para o host (onMessage, onOpen)|Host escuta eventos JS emitidos pelo widget para reagir (analytics, badge de notificação)|assistant-ui (hooks/callbacks React) [INFERIDO parcial]|DIFF|S|
|DEV-47|Customização visual do widget embutido (cor, posição, avatar)|Props/params configuram aparência do widget sem tocar no código do host|open-webui-embeddable-widget, LibreChat (branding via config)|DIFF|S|

### Armadilhas — Embedding
- iframe sem `Content-Security-Policy` e sandbox attrs corretos vira vetor de clickjacking (LibreChat documenta CSP específico para Artifacts, aplicável ao embed).
- Passar API key na URL do iframe/widget vaza a chave em logs de proxy/analytics.
- Widget sem Shadow DOM herda estilos do host e quebra layout.
- Publicar componente React em npm sem tree-shaking correto infla bundle do host.

### Ordem de construção — Embedding
1. iframe simples com URL params.
2. Script tag + mount com Shadow DOM — depende de já ter build de widget standalone.
3. Callbacks/contexto bidirecional (`postMessage`) — depende do iframe/widget estável.
4. React/Vue component npm-publicado — variante de distribuição, não pré-requisito.

---

## 4. Theming e white-label

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|DEV-48|Tema claro/escuro/sistema|Alterna entre modo claro, escuro e segue preferência do OS automaticamente|universal (Open WebUI, LibreChat, LobeHub, ChatGPT, Claude.ai, Gemini, T3 Chat, Msty)|MESA|S|
|DEV-49|Paleta de cores custom pré-definida (múltiplas opções)|Conjunto de esquemas de cor curados selecionáveis (13 cores primárias + 6 tons neutros)|LobeHub|DIFF|S|
|DEV-50|CSS custom injetado pelo usuário/admin|Campo de configuração aceita CSS arbitrário aplicado por cima do tema padrão|Open WebUI (admin custom CSS)|DIFF|S|
|DEV-51|Design tokens documentados (variáveis de tema)|Sistema de variáveis (cor, espaçamento, radius) documentado para tema completo sem hack de CSS|LobeHub (Ant Design token system), Open WebUI (Tailwind CSS vars) [INFERIDO parcial]|DIFF|M|
|DEV-52|Logo e favicon customizáveis|Admin troca logo exibido na UI e favicon do navegador|Open WebUI, LibreChat, Dify (enterprise)|MESA|S|
|DEV-53|Nome do produto customizável (rebranding de app name)|Título da aba, splash screen e textos de marca substituíveis por nome próprio|Open WebUI (`WEBUI_NAME`), LibreChat (`APP_TITLE`)|MESA|S|
|DEV-54|Domínio próprio (custom domain)|Serve a aplicação sob domínio do cliente em vez do domínio do provedor SaaS|Dify Cloud (plano pago) [INFERIDO parcial]|DIFF|M|
|DEV-55|Remoção de branding upstream ("powered by")|Opção paga/enterprise remove menção ao produto original na UI final|Dify (enterprise), Chainlit (Cloud)|DIFF|S|
|DEV-56|Fontes customizáveis|Admin/usuário troca família tipográfica da interface|LobeHub [INFERIDO parcial]|FRONT|S|
|DEV-57|Densidade de UI ajustável (compact/comfortable)|Alterna espaçamento entre elementos para caber mais conteúdo na tela|Notion AI (herda do Notion) [INFERIDO parcial]|DIFF|S|
|DEV-58|Layout alternativo (bolha de conversa vs documento contínuo)|Alterna exibição da conversa entre bolhas de chat tradicionais e modo documento linear|LobeHub (conversation bubble / document mode)|FRONT|M|

### Armadilhas — Theming
- CSS custom injetado sem sanitização vira vetor de XSS se admin comum puder editá-lo.
- Design tokens espalhados em CSS hardcoded (não var()) tornam white-label caro depois.
- Remoção de branding sem revisar licença (AGPL de alguns forks) pode violar termos.
- Dark mode trocando só cor de fundo sem revisar contraste quebra acessibilidade (WCAG) silenciosamente.

### Ordem de construção — Theming
1. Design tokens (variáveis CSS) — pré-requisito de tudo mais.
2. Dark/light/system — usa os tokens.
3. Logo/nome/favicon — independente dos tokens, pode ir em paralelo.
4. CSS custom injetado — depende de sanitização/escopo de permissão resolvidos.
5. Domínio próprio e remoção de upstream branding — decisão de produto/licenciamento, não só técnica.

---

## 5. i18n

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|DEV-59|Dezenas de idiomas de UI suportados|Interface traduzida para dezenas de idiomas [INFERIDO contagem exata]|LobeHub, Open WebUI, LibreChat, ChatGPT, Claude.ai, Gemini|MESA|L|
|DEV-60|Detecção automática de idioma do navegador|Seleciona idioma da UI com base em Accept-Language sem ação do usuário|universal|MESA|S|
|DEV-61|Suporte RTL (right-to-left)|Layout espelhado para idiomas RTL (árabe, hebraico)|ChatGPT, Claude.ai, Gemini [INFERIDO parcial]|DIFF|M|
|DEV-62|Tradução contribuída pela comunidade (crowdsourced)|Arquivos de tradução mantidos via PR de contribuidores externos|Open WebUI, LibreChat, LobeHub|MESA|M|
|DEV-63|Pipeline de tradução automatizada (CLI/CI)|Ferramenta própria (`lobe-i18n`) gera/atualiza traduções automaticamente a partir do idioma-fonte|LobeHub|FRONT|L|
|DEV-64|Formato de data/número por locale|Datas, horas e números formatados conforme convenção do idioma/região selecionado|universal (via Intl API)|MESA|S|
|DEV-65|Tradução da resposta do modelo (não só da UI)|Ação que traduz a resposta do LLM para o idioma do usuário via chamada extra ao modelo|LobeHub (plugin translate) [INFERIDO parcial]|DIFF|S|

### Armadilhas — i18n
- String hardcoded furando extraction automático quebra tradução silenciosamente (fica em inglês em produção).
- RTL tratado só com `dir="rtl"` sem revisar ícones direcionais fica com UI invertida errada.
- Pluralização com `if count==1` não escala para idiomas com >2 formas plurais — usar ICU MessageFormat desde o início.
- Tradução automatizada por LLM sem revisão humana em strings curtas produz ambiguidade.

### Ordem de construção — i18n
1. Extrair toda string hardcoded para chave de tradução (arquitetura, não feature).
2. Formatação de data/número via `Intl`.
3. Idioma-fonte + 1-2 idiomas adicionais manuais para validar pipeline.
4. Automação de tradução (CLI/CI) — só compensa com escala de +5 idiomas.
5. RTL — tratar como layout mode separado.

---

## 6. Modelo de dados e portabilidade

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|DEV-66|Export completo de conversas em JSON|Baixa todas as conversas do usuário como JSON com estrutura de árvore de mensagens (branching)|Open WebUI, ChatGPT, Claude.ai, LibreChat|MESA|S|
|DEV-67|Import de export de outro produto (ex. ChatGPT→X)|Detecta e converte automaticamente formato de export de concorrente para o formato nativo|Open WebUI (auto-detecção de export do ChatGPT)|DIFF|M|
|DEV-68|Formato de dados aberto e documentado (schema publicado)|Estrutura do JSON/DB documentada publicamente, permitindo terceiros escreverem conversores próprios|Open WebUI|DIFF|S|
|DEV-69|Backup/restore de banco completo (arquivo único)|Cópia/restauração do arquivo de banco (SQLite) ou dump (Postgres) cobrindo toda a instância|Open WebUI (`webui.db` via docker cp), LibreChat (mongodump)|MESA|S|
|DEV-70|Migração entre engines de banco (SQLite→Postgres)|Caminho de migração documentado/tooling comunitário para trocar banco embutido para produção, preservando dados e tipos|Open WebUI (tooling comunitário; schema-first via Alembic)|DIFF|L|
|DEV-71|Acesso direto ao banco documentado (schema de tabelas)|Documentação oficial das tabelas/colunas do banco interno, permitindo query/BI direto sem passar pela API|Open WebUI (`database-schema` doc oficial, SQLAlchemy+Alembic)|DIFF|S|
|DEV-72|Sem versionamento de schema em export/restore entre versões do app (gap conhecido)|Restaurar backup de versão antiga em instância nova pode quebrar sem aviso — lacuna documentada em issue aberta|Open WebUI (issue #16642 em aberto)|MORTO|—|

### Armadilhas — Dados/portabilidade
- Export por usuário (JSON) não é backup de instância — confundir os dois deixa operador desprotegido (falta config, vectors, modelos custom).
- Migração SQLite→Postgres sem incremental commit em UPDATE massivo trava o SQLite de origem em bases grandes.
- Timestamps unix vs datetime nativo do Postgres é causa nº1 de erro silencioso de migração.
- Restaurar dump de versão N-2 em instância versão N sem rodar migrations incrementais corrompe schema.
- Formato de export "aberto" mas não versionado quebra parser de terceiro no primeiro breaking change.

### Ordem de construção — Dados/portabilidade
1. Schema de banco versionado com ferramenta de migration (Alembic/Prisma/Knex) desde o dia 1.
2. Export/import por usuário (JSON).
3. Backup/restore de instância inteira (dump).
4. Suporte a segundo engine de banco (Postgres além de SQLite) — só depois do schema estável.
5. Import de formato de concorrente — por último.

---

## 7. Deploy e distribuição

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|DEV-73|`docker run` single container|Sobe a aplicação inteira com um único comando docker run, sem compose|Open WebUI, KoboldCpp|MESA|S|
|DEV-74|Docker Compose multi-serviço|Orquestra app + banco + cache/vetor DB via `docker compose up`, modo recomendado oficialmente|Open WebUI, LibreChat, Dify, RAGFlow, Langflow, n8n|MESA|S|
|DEV-75|Helm chart oficial para Kubernetes|Chart mantido pelo projeto para deploy em qualquer distro K8s, com values.yaml para infra externa|Open WebUI (`open-webui/helm-charts`)|DIFF|M|
|DEV-76|One-click deploy em PaaS (Railway/Render/Fly/Vercel)|Template pronto que provisiona a stack completa (app+DB+volume) com HTTPS, sem CLI|Open WebUI (Railway template oficial, com/sem Postgres+Redis), Dify, n8n, Langflow|DIFF|S|
|DEV-77|Instalação via pip/npm|Instala e roda o app como pacote de linguagem em vez de container|Chainlit (`pip install chainlit`), n8n (`npx n8n`)|MESA|S|
|DEV-78|Binário estático standalone|Distribui executável único sem runtime externo|LM Studio, Jan, Msty, KoboldCpp|DIFF|L|
|DEV-79|Suporte multi-arquitetura ARM/x86|Imagem/binário publicado para ambas arquiteturas|Open WebUI (imagem multi-arch), LM Studio, Jan|MESA|M|
|DEV-80|GPU passthrough documentado (CUDA/ROCm/Metal)|Instruções e flags de container para expor GPU do host à inferência|Open WebUI (`--gpus all`, imagem `:cuda`), text-generation-webui, KoboldCpp|MESA|M|
|DEV-81|Reverse proxy e subpath documentado|Guia oficial para servir a app atrás de Nginx/Traefik/Caddy, inclusive em subpath|Open WebUI, LibreChat, Dify|DIFF|M|
|DEV-82|HTTPS automático (Let's Encrypt integrado)|Provisiona certificado TLS automaticamente sem configuração manual|Deploy PaaS (Railway/Render), Dokploy template|DIFF|S|
|DEV-83|Variáveis de ambiente documentadas exaustivamente|Lista oficial e completa de todas env vars suportadas, com default e efeito|Open WebUI, LibreChat|MESA|S|
|DEV-84|Health check endpoint|Endpoint HTTP dedicado para orquestrador verificar liveness/readiness|Open WebUI, LibreChat, Dify|MESA|S|
|DEV-85|Upgrade sem downtime (rolling update)|Suporta múltiplas réplicas atrás de LB com banco externo para trocar versão sem cortar serviço|Open WebUI (Helm com replicaCount>1 + Postgres/Redis), Dify (K8s multi-réplica)|DIFF|L|

### Armadilhas — Deploy
- SQLite com `replicaCount > 1` corrompe dados silenciosamente (Open WebUI Helm docs alertam explicitamente).
- GPU passthrough documentado só para Nvidia/CUDA deixa usuário AMD/Apple Silicon sem caminho.
- Subpath sem `X-Forwarded-Prefix`/base path configurável quebra assets estáticos e websocket.
- One-click deploy que não monta volume persistente perde todo dado no próximo redeploy.
- Healthcheck que só testa "processo vivo" e não "banco conectável" deixa LB rotear tráfego para instância quebrada.

### Ordem de construção — Deploy
1. `docker run` single container com SQLite embutido.
2. Docker Compose com banco externo opcional.
3. Env vars documentadas + health check.
4. Reverse proxy/subpath/HTTPS.
5. Helm chart e multi-réplica — depende do banco suportar concorrência (Postgres+Redis).
6. One-click PaaS templates — empacotamento final.

---

## 8. Developer experience do próprio projeto

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|DEV-86|Hot reload em dev (frontend+backend)|Rebuild/refresh automático ao salvar arquivo, sem reiniciar processo manualmente|Open WebUI (Vite HMR + uvicorn `--reload`), LibreChat, LobeHub (Next.js dev)|MESA|S|
|DEV-87|Seed de dados de desenvolvimento|Script/comando popula banco local com usuários/chats de exemplo|LibreChat, Dify [INFERIDO parcial]|DIFF|S|
|DEV-88|Ambiente de dev completo via Docker Compose|Compose dedicado a desenvolvimento sobe app+deps com bind mount do código-fonte|Open WebUI, LibreChat, Dify|MESA|S|
|DEV-89|Testes E2E automatizados|Suite de testes end-to-end (Playwright/Cypress) cobrindo fluxos de UI reais|Open WebUI (Cypress), LibreChat, LobeHub|DIFF|M|
|DEV-90|Storybook ou catálogo de componentes isolado|Ambiente isolado para desenvolver/documentar componentes de UI fora do app completo|LobeHub (`@lobehub/ui`), assistant-ui|DIFF|M|
|DEV-91|CI com lint+test+build em PR|Pipeline automatizado roda checks obrigatórios em cada pull request antes de merge|Open WebUI, LibreChat, LobeHub, Dify, n8n (GitHub Actions)|MESA|S|
|DEV-92|Guia de contribuição documentado (CONTRIBUTING)|Documento oficial cobrindo setup local, convenções de commit/PR, processo de review|Open WebUI, LibreChat, Dify, n8n, LobeHub|MESA|S|
|DEV-93|Monorepo com workspace tooling (pnpm/turbo)|Estrutura de monorepo com build cacheado e dependências compartilhadas entre pacotes internos|LibreChat (`@librechat/*`), LobeHub (turborepo)|DIFF|M|

### Armadilhas — DX do projeto
- Seed de dados com IDs fixos colide com dados reais se rodado contra banco não-vazio por engano.
- Hot reload com watcher recursivo sobre `node_modules`/`data/` degrada performance ou causa loop de rebuild infinito.
- CI que só faz build (sem rodar teste real) dá falso verde.
- Storybook desatualizado em relação ao design system real vira documentação mentirosa rapidamente.

### Ordem de construção — DX do projeto
1. Docker Compose de dev com hot reload.
2. CI básico (lint+build) desde o primeiro PR.
3. Seed de dados — depende do schema estar minimamente estável.
4. Testes E2E — depois que os fluxos de UI principais pararem de mudar toda semana.
5. Storybook/monorepo tooling — só compensa com múltiplos pacotes/componentes reutilizados.

---

## Fontes
- https://docs.openwebui.com/features/extensibility/pipelines/
- https://docs.openwebui.com/features/extensibility/plugin/
- https://docs.openwebui.com/features/extensibility/plugin/functions/
- https://docs.openwebui.com/features/extensibility/plugin/functions/filter/
- https://deepwiki.com/open-webui/docs/4-extension-system
- https://deepwiki.com/open-webui/docs/4.1-tools
- https://deepwiki.com/open-webui/docs/4.2-pipes
- https://deepwiki.com/open-webui/docs/4.3-valves-and-configuration
- https://deepwiki.com/open-webui/docs/4.5-pipelines-framework
- https://docs.openwebui.com/reference/
- https://docs.openwebui.com/reference/api-endpoints/
- https://github.com/open-webui/docs/blob/main/docs/reference/api-endpoints.md
- https://docs.openwebui.com/getting-started/quick-start/connect-a-provider/starting-with-openai-compatible/
- https://github.com/open-webui/docs/blob/main/docs/features/chat-conversations/data-controls/import-export.md
- https://docs.openwebui.com/features/chat-conversations/data-controls/import-export/
- https://github.com/open-webui/docs/blob/main/docs/tutorials/maintenance/database.mdx
- https://docs.openwebui.com/reference/database-schema/
- https://docs.openwebui.com/troubleshooting/manual-database-migration/
- https://github.com/open-webui/open-webui/discussions/21609
- https://github.com/open-webui/open-webui/issues/16642
- https://docs.openwebui.com/enterprise/deployment/kubernetes-helm/
- https://deepwiki.com/open-webui/helm-charts
- https://docs.openwebui.com/getting-started/quick-start/
- https://docs.railway.com/guides/open-webui
- https://railway.com/deploy/openwebui
- https://github.com/taylorwilsdon/open-webui-embeddable-widget
- https://www.librechat.ai/docs/configuration/librechat_yaml
- https://www.librechat.ai/docs/configuration/librechat_yaml/ai_endpoints
- https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/custom_endpoint
- https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/custom_params
- https://www.librechat.ai/docs/features/agents
- https://www.librechat.ai/docs/features/agent_plugins
- https://www.librechat.ai/docs/user_guides/plugins
- https://www.librechat.ai/docs/configuration/tools
- https://www.npmjs.com/package/@librechat/client
- https://github.com/danny-avila/LibreChat/discussions/9189
- https://dify.ai/blog/dify-v1-0-building-a-vibrant-plugin-ecosystem
- https://dify.ai/blog/introducing-dify-plugins
- https://dify.ai/blog/dify-plugin-system-design-and-implementation
- https://docs.dify.ai/en/develop-plugin/getting-started/getting-started-dify-plugin
- https://github.com/langgenius/dify-plugins
- https://github.com/langgenius/dify-official-plugins
- https://pypi.org/project/dify_plugin/
- https://chat-plugin-sdk.lobehub.com/quick-start/intro
- https://lobehub.com/docs/usage/features/theme
- https://lobehub.com/docs/development/internationalization/add-new-locale
- https://lobehub.com/docs/development/internationalization/internationalization-implementation
- https://github.com/lobehub/sd-webui-lobe-theme
- https://github.com/lobehub/lobehub
- https://platform.openai.com/docs/actions/introduction
- https://platform.openai.com/docs/actions/getting-started
- https://help.openai.com/en/articles/9442513-configuring-actions-in-gpts
- https://help.openai.com/en/articles/8550641-assistants-api-v2-faq
- https://developers.openai.com/api/docs/assistants/deep-dive

**Escopo**: MCP/tool-execution excluído (outro domínio). Admin/compliance (SSO, auditoria, RBAC) excluído (outro domínio). 93 itens DEV-01..DEV-93 (>60 requeridos).

---

# 10. `CLIENT` — Plataformas de cliente

## Web / PWA

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CLIENT-01|Layout responsivo mobile|UI web se adapta a telas pequenas sem app nativo|universal|MESA|S|
|CLIENT-02|PWA instalável|Manifest.json + ícone permite "adicionar à tela inicial" como app|ChatGPT, Claude.ai, Open WebUI, LibreChat, T3 Chat, Perplexity|MESA|S|
|CLIENT-03|Service worker com cache offline parcial|Assets estáticos e últimas conversas ficam disponíveis sem rede|Open WebUI, T3 Chat, LobeHub|DIFF|M|
|CLIENT-04|Notificação push web|Resposta de tarefa longa/agente notifica via Web Push API mesmo com aba fechada|ChatGPT (tasks), Perplexity|DIFF|M|
|CLIENT-05|Atalho de teclado global na página (cmd+K)|Busca de conversas/nova conversa via palette sem sair do teclado|ChatGPT, Claude.ai, T3 Chat, LibreChat, Open WebUI|MESA|S|
|CLIENT-06|Sincronização multi-aba em tempo real|Duas abas abertas do mesmo chat refletem stream de tokens/estado simultaneamente (BroadcastChannel/SW)|ChatGPT, Claude.ai|DIFF|M|
|CLIENT-07|Deep link direto para conversa (URL por chat ID)|Cada conversa tem URL própria compartilhável/roteável|universal|MESA|S|
|CLIENT-08|Web Share Target API|PWA aparece como destino no menu "compartilhar" do OS (compartilha texto/link para o chat)|Perplexity (Android PWA)[INFERIDO], Open WebUI[INFERIDO]|FRONT|M|
|CLIENT-09|Responsive split-view (sidebar colapsável, painel duplo)|Sidebar de histórico soma painel de artifact/código lado a lado em telas largas|ChatGPT (canvas), Claude.ai (artifacts), NotebookLM|DIFF|M|
|CLIENT-10|Retomada de stream após reload de página|Resposta em geração continua sendo montada mesmo se a aba recarregar (poll/reconnect ao job)|ChatGPT, Claude.ai|DIFF|M|
|CLIENT-11|Modo standalone sem chrome de navegador (display:standalone)|PWA abre em janela própria sem barra de URL|ChatGPT, Claude.ai, Open WebUI, T3 Chat|MESA|S|

## Desktop

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CLIENT-12|Framework Electron|App desktop empacota Chromium+Node; binário grande (~150-250MB)|ChatGPT desktop, Claude desktop, Cherry Studio, LibreChat (via terceiros), LobeHub desktop, Chatbox, LM Studio, Msty, Notion AI (desktop)|MESA|L|
|CLIENT-13|Framework Tauri|App desktop usa webview nativo do OS + Rust; binário pequeno (5-20MB)|Jan, Witsy[INFERIDO], parte do ecossistema OSS mais recente|DIFF|L|
|CLIENT-14|App nativo (Swift/C++ puro, sem webview embutido)|UI construída com toolkit nativo do OS, não Electron/Tauri|KoboldCpp (algumas builds), poucos concorrentes|FRONT|XL|
|CLIENT-15|Atalho global "quick ask" (spotlight-like)|Combinação de teclas de qualquer lugar do OS abre mini-janela de pergunta flutuante|Cherry Studio (Option+Space), Claude desktop, Raycast AI, ChatGPT desktop (Option+Space)|DIFF|M|
|CLIENT-16|Janela flutuante "always on top"|Janela de chat permanece sobre outras janelas mesmo com foco perdido|Cherry Studio, Msty[INFERIDO], LM Studio (chat overlay)[INFERIDO]|DIFF|M|
|CLIENT-17|Ícone na tray/menu bar|App fica residente na bandeja do sistema, minimizável sem fechar|ChatGPT desktop, Claude desktop, Cherry Studio, LM Studio, Jan|MESA|S|
|CLIENT-18|Iniciar com o sistema (launch at login)|Preferência para abrir automaticamente no boot do OS|ChatGPT desktop, Claude desktop, Cherry Studio, LM Studio|MESA|S|
|CLIENT-19|Auto-update em background|App baixa e aplica nova versão sem reinstalação manual (Squirrel/Sparkle/Tauri updater)|ChatGPT desktop, Claude desktop, Cherry Studio, LM Studio, Jan|MESA|M|
|CLIENT-20|Ação de IA sobre seleção de texto em qualquer app|Selecionar texto em qualquer aplicativo do OS e disparar ação de IA (traduzir/explicar/resumir) via toolbar flutuante ou atalho|Cherry Studio (Quick Assistant), Claude desktop (parcial), Raycast AI, Windows Copilot (seleção global)|FRONT|L|
|CLIENT-21|Captura de tela nativa integrada ao chat|Botão/atalho tira screenshot de tela/região e injeta direto no input de chat|ChatGPT desktop, Claude desktop, Cherry Studio, Windows Copilot|DIFF|M|
|CLIENT-22|Integração com clipboard (histórico/monitoramento)|App lê/observa clipboard para colar rapidamente ou detectar conteúdo copiado como contexto|Cherry Studio, Raycast AI|DIFF|S|
|CLIENT-23|Atalho por aplicativo (contexto ciente do app ativo)|Atalho de IA se comporta diferente dependendo de qual app está em foco (ex: código vs texto)|Cherry Studio[INFERIDO], Raycast AI|FRONT|L|
|CLIENT-24|Múltiplas janelas independentes|Abrir mais de uma janela de chat simultânea, cada uma com estado próprio|Claude desktop (redesign 2026, sessões paralelas), ChatGPT desktop, LM Studio|DIFF|M|
|CLIENT-25|Modo compacto/mini-janela persistente|Janela reduzida fixa num canto da tela, tipo widget flutuante|Cherry Studio (mini window), Msty[INFERIDO]|DIFF|M|
|CLIENT-26|Acesso a filesystem local (ler/escrever arquivos do usuário)|App lê pastas locais como contexto e escreve arquivos direto no disco (não apenas download)|Claude desktop (terminal + file editor integrados, 2026), Open WebUI (local), Cherry Studio, AnythingLLM|FRONT|L|
|CLIENT-27|Motor de modelo local embutido no app|Runtime de inferência (llama.cpp/MLX) roda dentro do próprio binário desktop, sem servidor externo|LM Studio, Jan, GPT4All, Msty, KoboldCpp, text-generation-webui|MESA (para categoria local)|XL|
|CLIENT-28|Terminal integrado na janela de chat|Terminal de shell embutido na UI desktop, com sessão persistente ligada ao contexto do agente|Claude desktop (redesign abril 2026)|FRONT|L|
|CLIENT-29|Diff viewer nativo para edições de código|Visualização lado a lado de mudanças propostas pelo agente antes de aplicar|Claude desktop, Cursor, Windsurf|FRONT|M|
|CLIENT-30|Instalador nativo por OS (dmg/exe/AppImage) sem loja|Distribuição direta via site, sem passar por App Store/Microsoft Store|Cherry Studio, LM Studio, Jan, Chatbox|MESA|S|

## Mobile

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CLIENT-31|App nativo iOS|Cliente publicado na App Store, com UI nativa SwiftUI/UIKit|ChatGPT, Claude, Gemini, Perplexity, Copilot, Grok, Le Chat, DeepSeek, Poe, T3 Chat[INFERIDO]|MESA|XL|
|CLIENT-32|App nativo Android|Cliente publicado na Play Store|ChatGPT, Claude, Gemini, Perplexity, Copilot, Grok, Le Chat, DeepSeek|MESA|XL|
|CLIENT-33|Sync automático de histórico com a versão web|Conversas iniciadas no mobile aparecem instantaneamente no web e vice-versa|ChatGPT, Claude, Gemini, Perplexity|MESA|M|
|CLIENT-34|Voz em movimento / voice mode contínuo|Modo de conversa por voz full-duplex, otimizado para uso sem olhar a tela|ChatGPT (Advanced Voice), Claude (voice mode, 5 vozes, 2026), Gemini Live, Grok|DIFF|L|
|CLIENT-35|Widget de home screen|Widget na tela inicial permite iniciar chat/voz sem abrir o app|ChatGPT (Android widget: texto/voz/foto/câmera/vídeo; iOS 26.4), Claude (Android)|DIFF|M|
|CLIENT-36|Share sheet (receber texto/imagem de outro app)|App aparece como destino no menu de compartilhamento do OS, recebendo conteúdo de outros apps|ChatGPT, Claude, Perplexity, Le Chat[INFERIDO]|MESA|M|
|CLIENT-37|Atalho Siri/Google Assistant|Comandos de voz do assistente do sistema disparam ações do app (ex: "pergunte ao Claude...")|Claude (Siri Shortcuts, Reminders, Artifacts), ChatGPT (Siri, iOS)|DIFF|M|
|CLIENT-38|Captura de câmera direta no chat|Botão de câmera abre captura de foto e envia direto como input multimodal|ChatGPT, Claude, Gemini, Perplexity|MESA|S|
|CLIENT-39|Notificação push de resposta pronta (tarefa assíncrona)|Push notification quando tarefa longa/agente/deep research termina em background|ChatGPT (Tasks/Deep Research), Perplexity (Computer/tasks), Claude (Cowork, jul 2026)|DIFF|M|
|CLIENT-40|Modelo local no dispositivo (offline real)|Inferência roda no hardware do celular sem rede, sem chamada a servidor|PocketPal AI, ChatterUI, Google AI Edge Gallery, MLC Chat — nenhum dos big players (ChatGPT/Claude/Gemini) oferece isso hoje|FRONT|XL|
|CLIENT-41|Biometria para abrir o app (Face ID/impressão digital)|Trava o app com autenticação biométrica do OS antes de exibir conversas|ChatGPT (app lock), Claude (app lock)[INFERIDO]|DIFF|S|
|CLIENT-42|Integração CarPlay/Android Auto|Interface de voz dedicada para uso no carro|ChatGPT (CarPlay, abr 2026)|FRONT|L|
|CLIENT-43|App companion de navegador agentivo mobile (browser IA completo)|Browser mobile dedicado com assistente embutido em toda página visitada|Perplexity Comet (iOS/Android)|FRONT|XL|
|CLIENT-44|Cross-device task handoff (iniciar no mobile, monitorar/continuar em outro device)|Tarefa de agente iniciada no celular pode ser acompanhada/gerenciada do desktop e vice-versa|Perplexity Computer, Claude Cowork|FRONT|L|

## Extensão de navegador

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CLIENT-45|Sidebar de chat em qualquer página|Painel lateral persistente com chat, acessível em qualquer aba sem sair da página|Page Assist, Sider AI, ChatGPT Sidebar (extensões terceiras), Witsy[INFERIDO]|MESA|M|
|CLIENT-46|Resumir página atual|Botão/atalho extrai conteúdo da página e gera resumo|Page Assist, Sider AI, Perplexity extension, Merlin|DIFF|M|
|CLIENT-47|Chat com a página (RAG sobre conteúdo aberto)|Perguntas respondidas com base no texto da página atualmente carregada|Page Assist, Sider AI, ChatGPT extension|DIFF|M|
|CLIENT-48|Seleção de texto → menu de ação rápida|Selecionar texto em qualquer site dispara popup com ações (traduzir/explicar/reescrever)|Sider AI, Merlin, ChatGPT for Google (extensão terceira)|MESA|M|
|CLIENT-49|Preenchimento automático de campo (autofill assistido por IA)|Extensão sugere/preenche formulários web usando IA a partir de contexto do usuário|Sider AI (autofill), Merlin[INFERIDO]|DIFF|L|
|CLIENT-50|Substituição de texto inline em qualquer input (rewrite in place)|Texto digitado em qualquer caixa de texto do navegador é reescrito no próprio lugar, sem copiar/colar|Grammarly (referência de padrão), Sider AI, Windows Copilot (rewrite)|FRONT|L|
|CLIENT-51|Captura de página para knowledge base|Salva página inteira (ou trecho) como documento indexado para RAG futuro|Page Assist (docs locais), Khoj (clipper), Notion AI Web Clipper|DIFF|M|
|CLIENT-52|Atalho de teclado dedicado da extensão|Combinação de teclas abre a extensão sem clicar no ícone|Page Assist, Sider AI, ChatGPT extensions|MESA|S|
|CLIENT-53|Item no menu de contexto (botão direito)|Ação de IA aparece ao clicar com botão direito sobre texto/imagem selecionada|Sider AI, Merlin, Page Assist|MESA|S|
|CLIENT-54|Suporte cross-browser (Chrome/Firefox/Safari/Edge) via WebExtensions|Mesma base de código publicada nas quatro lojas de extensão principais|Page Assist (Chrome/Firefox/Edge), Sider AI (Chrome/Firefox/Edge; Safari limitado)|DIFF|L|
|CLIENT-55|Modelo local via extensão (Ollama bridge)|Extensão conecta a um runtime local (Ollama) rodando na máquina, sem enviar dados à nuvem|Page Assist, Chrome built-in AI (Gemini Nano)|FRONT|M|

## CLI / terminal

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CLIENT-56|Cliente de chat interativo no terminal|Loop de conversa via linha de comando, sem UI gráfica|llm (Simon Willison), aichat, mods, Open WebUI (via API+curl scripts)[INFERIDO], KoboldCpp (modo CLI)|DIFF|S|
|CLIENT-57|Pipe de stdin como entrada|Comando aceita `cat file | tool "pergunta"` encadeando com outros programas Unix|llm, mods, aichat|DIFF|S|
|CLIENT-58|Saída estruturada em JSON|Flag de saída em JSON para consumo programático em scripts|llm (--json parcial via API raw), mods (-f json)[INFERIDO]|DIFF|S|
|CLIENT-59|Uso non-interativo em scripts/CI|Executável aceita todos os parâmetros via flags, sem prompt interativo, apto a rodar em pipeline|llm, aichat|DIFF|S|
|CLIENT-60|Sessão persistente/histórico de conversa entre invocações|Contexto de conversa é mantido entre chamadas separadas do CLI (não reseta a cada comando)|aichat (sessions), llm (--continue/-c, logs sqlite)|DIFF|M|
|CLIENT-61|TUI (interface de texto full-screen, navegação por teclado)|Interface de terminal rica com painéis, scroll, seleção — não apenas print/read line|aichat (REPL avançado), Aider (chat mode), text-generation-webui (não é TUI, é web)[note]|DIFF|M|

## Integrações de mensageria

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CLIENT-62|Bot de Slack nativo/oficial|App instalável no workspace Slack que responde a menções/DMs|Dify (via plugin Slack + LangBot), Claude for Slack (oficial Anthropic), Microsoft Copilot (Teams-first, Slack via terceiros)|DIFF|M|
|CLIENT-63|Bot de Discord|Bot conectável a servidor Discord, responde em canais/DMs|Dify (LangBot), qualquer OSS via LangBot/OpenClaw, muitos wrappers da comunidade para Ollama/Open WebUI|DIFF|M|
|CLIENT-64|Bot de Telegram|Bot Telegram nativo via Bot API oficial (setup mais simples da categoria)|Dify (LangBot), muitos wrappers OSS, n8n workflows|DIFF|S|
|CLIENT-65|Integração WhatsApp Business|Bot responde via WhatsApp Business API (janela de 24h, sem histórico completo)|Dify (LangBot), n8n, OpenClaw|DIFF|L|
|CLIENT-66|Integração Microsoft Teams|Bot/app nativo dentro do Teams, com comandos slash|Microsoft Copilot (nativo), Dify (via conectores)[INFERIDO]|DIFF|M|
|CLIENT-67|Assistente via e-mail (enviar prompt por e-mail, receber resposta)|Usuário envia e-mail para endereço dedicado e recebe resposta gerada por IA|Poucos players nativos; geralmente via automação n8n/Zapier[INFERIDO]|MORTO/nicho|M|
|CLIENT-68|Comandos slash em chat de mensageria|Bot reconhece comandos tipo `/reset`, `/model gpt-4` dentro da própria plataforma de chat|LangBot-based bots, Discord bots comunitários|DIFF|S|
|CLIENT-69|Resposta em thread (mantém contexto por thread, não canal inteiro)|Bot responde dentro da thread específica, preservando isolamento de contexto por conversa|Slack/Discord bots via LangBot, Claude for Slack|DIFF|M|
|CLIENT-70|Menção seletiva (@bot) vs. escuta passiva de canal|Bot só responde quando mencionado, evitando ruído em canais compartilhados|universal nos bots de Slack/Discord|MESA|S|

## Sincronização

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CLIENT-71|Sync de histórico entre dispositivos via conta na nuvem|Login com conta sincroniza automaticamente todas conversas entre web/desktop/mobile|ChatGPT, Claude, Gemini, Perplexity, Le Chat, T3 Chat|MESA|L|
|CLIENT-72|Sync self-hosted (servidor próprio, sem depender de nuvem do vendor)|Histórico sincroniza entre dispositivos apontando para instância própria (Postgres/SQLite compartilhado)|Open WebUI, LibreChat, LobeHub (self-host), AnythingLLM|DIFF|M|
|CLIENT-73|Sync criptografado ponta-a-ponta|Servidor não consegue ler o conteúdo das conversas sincronizadas (E2EE real)|Nenhum concorrente mainstream oferece isso hoje — lacuna de mercado|FRONT|XL|
|CLIENT-74|Resolução de conflito de edição concorrente (multi-device)|Duas edições simultâneas na mesma conversa em dispositivos diferentes são mescladas sem perda|[INFERIDO] tratado via last-write-wins na maioria; nenhum publica estratégia de merge explícita|FRONT|L|
|CLIENT-75|Uso sem conta (modo anônimo/local-only)|App funciona plenamente sem login, dados ficam só no dispositivo/browser local storage|ChatGPT (modo temporário/logged-out limitado), LM Studio, Jan, KoboldCpp, GPT4All|DIFF|M|
|CLIENT-76|Export/import de histórico entre instâncias|Baixa todas conversas em formato portátil (JSON) e reimporta em outra instância/produto|Open WebUI, LibreChat, ChatGPT (data export), Claude (data export)|MESA|S|

## Especificidades de OS

|ID|Funcionalidade|O que faz|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CLIENT-77|App de menu bar macOS (ícone permanente na barra superior)|Acesso rápido via ícone fixo no menu bar, distinto do Dock|ChatGPT desktop, Claude desktop, Cherry Studio, LM Studio|MESA (macOS)|S|
|CLIENT-78|Integração com Apple Shortcuts (macOS/iOS)|App expõe ações que podem ser encadeadas em automações do Shortcuts|Claude (iOS Shortcuts), ChatGPT (Shortcuts)|DIFF|M|
|CLIENT-79|Aceleração nativa Apple Silicon/MLX|Runtime local usa MLX (framework da Apple) em vez de apenas CPU/Metal genérico, ganho de performance em M-series|LM Studio (suporte MLX), Jan[INFERIDO parcial]|FRONT|L|
|CLIENT-80|Handoff entre dispositivos Apple|Continuar tarefa iniciada no Mac diretamente no iPhone/iPad via Handoff nativo do OS|Nenhum concorrente confirma suporte nativo a Handoff — lacuna|MORTO/inexistente|L|
|CLIENT-81|Integração com barra de tarefas Windows (jump list, progress overlay)|Ícone na taskbar mostra progresso de tarefa em andamento ou lista de ações rápidas ao clicar direito|ChatGPT desktop (Windows)[INFERIDO], Copilot (nativo do Windows 11, na taskbar por padrão)|DIFF|M|
|CLIENT-82|Distribuição via WinGet|Instalação/atualização via `winget install` no Windows|LM Studio, Jan, algumas ferramentas OSS[INFERIDO]|DIFF|S|
|CLIENT-83|Pacote AppImage (Linux)|Binário único portátil sem instalação de dependências no sistema|Cherry Studio, LM Studio, Jan, LMKit|MESA (Linux)|S|
|CLIENT-84|Pacote Flatpak (Linux)|Distribuição sandboxed via Flathub|Open WebUI (self-host, não aplicável)[nota], algumas ferramentas OSS via terceiros|DIFF|M|
|CLIENT-85|Pacote Snap (Linux)|Distribuição via Snap Store, canonical|Poucos apps de chat oferecem oficialmente — geralmente comunidade empacota|DIFF|M|
|CLIENT-86|Uso via Termux no Android|Ferramentas CLI (llm, aichat, servidores locais como Ollama) rodam dentro do ambiente Termux em Android, contornando a ausência de app nativo|Ollama (Termux community builds), llm/aichat (via pip/cargo em Termux)|FRONT|M|
|CLIENT-87|Integração com Siri Shortcuts no iOS (ação de app dedicada)|Atalho pré-configurado permite disparar prompt para o app direto da tela de Shortcuts/Siri|Claude (Siri Shortcuts oficial), ChatGPT|DIFF|M|

Total: **87 funcionalidades** (excede o mínimo de 60).

## Armadilhas

- **PWA "instalável" ≠ funcional offline**: manifest.json + ícone dá o prompt de instalação, mas sem service worker com estratégia de cache (stale-while-revalidate para assets, cache-first para histórico já carregado) o app "instalado" quebra assim que a rede cai — muita gente implementa só a casca.
- **Electron parece grátis, mas o binário de 200MB+ e o consumo de RAM (~150-300MB parado) são custo real de suporte**; decidir Electron vs Tauri no dia 1 é caro reverter depois porque toda a camada de IPC nativo (tray, atalho global, clipboard) é reescrita.
- **Atalho global do sistema é plataforma-específica e frágil**: macOS exige permissão de Accessibility explícita do usuário; Windows tem conflitos de hotkey com outros apps já instalados; falha silenciosa (atalho "registrado" mas não disparando) é o bug mais comum reportado nesses apps.
- **"Ação de IA sobre seleção de texto em qualquer app"** depende de APIs de acessibilidade do OS (macOS Accessibility API / Windows UI Automation) que variam por app-alvo — funciona bem em apps de texto padrão, quebra em Electron/Chromium de terceiros e em apps sandboxed.
- **WhatsApp Business API tem janela de 24h e não suporta histórico/edição/deleção de mensagem** — qualquer bot que assuma paridade com Telegram/Discord vai quebrar em produção.
- **Sync multi-dispositivo sem estratégia de conflito explícita degrada silenciosamente para last-write-wins**, perdendo mensagens quando duas abas/dispositivos editam a mesma conversa quase simultaneamente — nenhum concorrente grande resolve isso de forma visível ao usuário.
- **Extensão de navegador cross-browser via WebExtensions não é "escrever uma vez, rodar em 4"**: Safari exige empacotamento Xcode separado e tem APIs de content-script mais restritas; Manifest V3 do Chrome limita long-lived background scripts, forçando reescrita de arquitetura de service worker.
- **App mobile com "modelo local"** (PocketPal, MLC) é limitado por RAM/bateria do dispositivo — cair nessa armadilha de achar que dá para rodar modelo grande equivalente ao de nuvem é ilusório; ficar em modelos <4B quantizados é o teto realista hoje.
- **CLI "com sessão persistente" precisa decidir onde o estado mora** (SQLite local vs. arquivo de log) — implementação ingênua guarda tudo em memória do processo e perde contexto a cada invocação, o que anula a proposta de "sessão persistente".

## Ordem de construção

1. **Web responsivo** (base) → tudo mais deriva da mesma UI.
2. **PWA installable + service worker básico** → ganho barato antes de partir para apps nativos.
3. **CLI simples (stdin pipe + saída texto)** → reusa a mesma API de backend, valida contrato de streaming antes de investir em UI gráfica.
4. **Extensão de navegador (sidebar + seleção de texto)** → reusa componentes web já existentes via iframe/webview, não exige backend novo.
5. **Desktop (Tauri/Electron)** com tray + atalho global básico → decisão de framework primeiro (custo alto reverter), depois quick-ask, depois seleção-de-texto-global (mais caro, depende de permissões de OS).
6. **Sync entre dispositivos** só faz sentido depois de existir mais de uma plataforma cliente — construir cedo demais é trabalho perdido se web+CLI já bastam para o protótipo.
7. **Mobile nativo** — maior custo (XL), só compensa depois que o produto já provou valor nas plataformas mais baratas; widget/Siri Shortcuts vêm depois do app base funcionar.
8. **Integrações de mensageria (bots)** — independentes das outras camadas, mas exigem que a API de backend já esteja estável (webhook/streaming); construir por último evita retrabalho quando o contrato de API muda.
9. **Especificidades de OS (menu bar, WinGet, AppImage, Termux)** — polimento final sobre o desktop/CLI já existentes.

## Fontes

- https://docs.cherry-ai.com/docs/en-us/pre-basic/settings/key-shortcut
- https://docs.cherry-ai.com/docs/en-us/cherry-studio/preview
- https://codersera.com/blog/cherry-studio-complete-guide-2026/
- https://hyscaler.com/insights/chatgpt-widget-android/
- https://www.androidsage.com/2026/04/01/chatgpt-is-now-on-your-apple-carplay-dashboard/
- https://beginnersinai.org/claude-app-guide/
- https://www.clauder-navi.com/en/ai-claude-app
- https://coworkerai.io/claude-cowork-mobile
- https://www.perplexity.ai/changelog/what-we-shipped--march-27-2026
- https://gadgetbond.com/perplexity-computer-ios-iphone-mobile-app-update-availability/
- https://en.wikipedia.org/wiki/Comet_(browser)
- https://pageassist.xyz/
- https://docs.pageassist.xyz/sidebar/
- https://github.com/n4ze3m/page-assist
- https://sider.ai/apps/extension
- https://docs.dify.ai/en/learn-more/use-cases/connect-dify-to-various-im-platforms-by-using-langbot
- https://langbot.app/en/blog/dify-agent-discord-telegram-slack
- https://www.metabase.com/blog/librechat-self-hosted/
- https://github.com/LibreChat-AI/LibreChat-DiscordBot
- https://github.com/danny-avila/LibreChat/discussions/3549
- https://lumadock.com/tutorials/moltbot-multi-channel-setup

---

# 11. `OPS` — Infraestrutura e encanamento invisível

## 1. Streaming resiliente

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|OPS-01|SSE como transporte de streaming|Usa `text/event-stream` unidirecional sobre HTTP/1.1 keep-alive para tokens|ChatGPT, Claude.ai, Open WebUI, LibreChat, quase universal|MESA|S|
|OPS-02|WebSocket como transporte alternativo|Canal full-duplex; usado quando há eventos bidirecionais (voz, colaboração)|Poe, alguns backends realtime (voice mode)|DIFF|M|
|OPS-03|HTTP chunked transfer sem SSE|Stream bruto via `Transfer-Encoding: chunked` sem framing de evento|APIs de provedor (OpenAI/Anthropic raw), alguns proxies internos|DIFF|S|
|OPS-04|Reconexão automática de SSE nativa|`EventSource` reconecta sozinho após queda de rede, mas perde contexto de onde parou|invisível — comportamento nativo do browser, limitado|MESA|S|
|OPS-05|Resumo de stream (resumable stream) via buffer server-side|Servidor grava tokens num buffer (Redis) e cliente reconectado retoma do ponto salvo, sem perder texto já gerado|Vercel AI SDK (resumable-stream lib), T3 Chat|FRONT|L|
|OPS-06|Geração continua no servidor após fechamento da aba|O processo de geração é desacoplado da conexão HTTP; fechar a aba não aborta a chamada ao provedor|ChatGPT, Claude.ai, T3 Chat|DIFF|L|
|OPS-07|Múltiplas abas assistindo à mesma geração em paralelo|Broadcast do stream ativo para todas as sessões abertas da mesma conversa (via pub/sub ou polling do buffer)|ChatGPT, T3 Chat|FRONT|L|
|OPS-08|Cancelamento propagado até o provedor (abort real)|Clique em "stop" fecha o `AbortController` que se propaga até a chamada HTTP ao provedor, cortando billing de tokens não vistos|ChatGPT, Claude.ai, Open WebUI, LibreChat|MESA|S|
|OPS-09|Distinção entre abort do usuário e desconexão de rede|Sistema precisa diferenciar "usuário cancelou" (não retomar) de "conexão caiu" (retomar) — resumable-stream trata os dois como igual por padrão, é bug conhecido|invisível — exigência de engenharia|DIFF|M|
|OPS-10|Backpressure no pipe provedor→cliente|Quando o cliente lê mais devagar que o provedor emite, o servidor precisa pausar/bufferizar sem estourar memória (via `ReadableStream` com backpressure nativo ou filas limitadas)|invisível — exigência de engenharia|DIFF|M|
|OPS-11|Buffering vs flush imediato por token/chunk|Decisão de agregar N tokens antes de emitir vs. emitir cada delta assim que chega (afeta percepção de fluidez vs overhead de rede)|invisível — exigência de engenharia|MESA|S|
|OPS-12|Desabilitar buffering de proxy (nginx `X-Accel-Buffering`)|Proxies reversos (nginx, ALB, Cloudflare) bufferizam por padrão e quebram streaming em lotes; precisa `proxy_buffering off` + header `X-Accel-Buffering: no`|invisível — exigência de engenharia|MESA|S|
|OPS-13|Timeout de gateway configurado para streams longos|Timeouts default (60s Nginx, 30-60s ALB/Cloudflare) matam gerações longas silenciosas; precisa heartbeat/keep-alive ou timeout estendido por rota|invisível — exigência de engenharia|MESA|S|
|OPS-14|Heartbeat/keep-alive durante geração silenciosa|Envia comentário SSE vazio (`: ping`) periodicamente para evitar timeout de proxies intermediários durante "thinking" sem tokens visíveis|invisível — exigência de engenharia, OpenAI/Anthropic streaming API|DIFF|S|
|OPS-15|Streaming de "thinking"/reasoning separado do conteúdo final|Emite tokens de raciocínio (extended thinking/o-series) num canal/evento distinto do texto de resposta|ChatGPT (o-series), Claude.ai (extended thinking), Grok|FRONT|M|
|OPS-16|Streaming de tool calls parcial (function call incremental)|Argumentos de tool call chegam como JSON parcial/incremental antes de completos, exigindo parser tolerante a JSON incompleto|OpenAI API streaming, Claude.ai (tool use streaming)|FRONT|M|

## 2. Persistência

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|OPS-17|SQLite como storage default self-host|Banco de arquivo único, zero-config, adequado a single-user/small-team|Open WebUI, LibreChat (opcional), Jan, Chatbox, KoboldCpp|MESA|S|
|OPS-18|Postgres como storage de produção|Banco relacional multiusuário com concorrência real e extensões (pgvector para embeddings)|LibreChat, Open WebUI (opção), Dify, Langfuse self-host|MESA|M|
|OPS-19|MongoDB como storage de documentos|Schema flexível para mensagens/anexos sem migrações rígidas|LibreChat (default histórico)|DIFF|M|
|OPS-20|Schema de conversa/mensagem normalizado|Tabelas separadas `conversations`, `messages`, `attachments` com FKs em vez de JSON blob monolítico|invisível — exigência de engenharia|MESA|M|
|OPS-21|Árvore de mensagens (branching) em vez de lista linear|Cada mensagem referencia `parent_id`, permitindo múltiplos ramos de edição/regeneração no mesmo nó|ChatGPT, Claude.ai, Open WebUI, LibreChat|DIFF|M|
|OPS-22|Navegação entre branches na UI (setas ←→)|Interface para trocar de ramo ativo numa árvore de mensagens sem perder os outros ramos|ChatGPT, Claude.ai, Open WebUI|DIFF|M|
|OPS-23|Migrações de schema versionadas|Ferramenta (Alembic, Prisma Migrate, Drizzle Kit, golang-migrate) aplica mudanças de schema de forma incremental e reversível|invisível — exigência de engenharia|MESA|S|
|OPS-24|Soft delete de conversas/mensagens|Marca `deleted_at` em vez de `DELETE`, permitindo recuperação e auditoria|Open WebUI, LibreChat|DIFF|S|
|OPS-25|Índices para busca full-text em mensagens|Índice FTS5 (SQLite) / GIN tsvector (Postgres) / Atlas Search (Mongo) para busca de texto dentro de conversas|Open WebUI, LibreChat, ChatGPT (busca em histórico)|DIFF|M|
|OPS-26|Blob storage local para anexos|Arquivos salvos em disco local com referência de path no banco|Open WebUI, LibreChat, Jan|MESA|S|
|OPS-27|Blob storage S3-compatível para anexos|Upload para S3/MinIO/R2 com URL assinada, desacoplando arquivo do servidor de app|LibreChat, Open WebUI (opção), Dify|DIFF|M|
|OPS-28|Limpeza de anexos órfãos|Job periódico que remove blobs sem referência em nenhuma mensagem/conversa ativa (após soft-delete + retenção)|invisível — exigência de engenharia|DIFF|M|
|OPS-29|Compactação/VACUUM de banco ao longo do tempo|Rotina de manutenção para SQLite (`VACUUM`) ou Postgres (`autovacuum` tuning) evitando inchaço do arquivo/tabela|invisível — exigência de engenharia|DIFF|S|
|OPS-30|Exportação de conversa (JSON/Markdown/PDF)|Serializa conversa completa (incluindo branches) para formato portável|ChatGPT, Claude.ai, Open WebUI, LibreChat, NotebookLM|MESA|S|
|OPS-31|Paginação/cursor de histórico de conversas|Lista de conversas carregada com cursor-based pagination em vez de OFFSET, escalando com milhares de itens|invisível — exigência de engenharia|MESA|S|

## 3. Confiabilidade com provedores

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|OPS-32|Retry com backoff exponencial e jitter|Reenvia requisição falha com espera crescente + aleatoriedade para evitar thundering herd|invisível — exigência de engenharia (padrão em SDKs oficiais OpenAI/Anthropic)|MESA|S|
|OPS-33|Classificação de erro retryável vs fatal|Distingue 429/500/503/timeout (retry) de 400/401/403 (fatal, não retry) por código e corpo de erro|invisível — exigência de engenharia|MESA|S|
|OPS-34|Respeito ao header `Retry-After` em 429|Lê o header de rate limit do provedor e espera exatamente o tempo indicado em vez de backoff genérico|invisível — exigência de engenharia, OpenAI/Anthropic APIs enviam o header|MESA|S|
|OPS-35|Circuit breaker por provedor|Após N falhas consecutivas, para de tentar temporariamente e falha rápido, evitando cascata de timeouts|invisível — exigência de engenharia, LiteLLM proxy tem isso embutido|DIFF|M|
|OPS-36|Timeout configurável por provedor/modelo|Cada integração de provedor tem timeout próprio (modelos de raciocínio longo precisam de mais tempo que chat rápido)|invisível — exigência de engenharia|MESA|S|
|OPS-37|Salvamento de resposta parcial em erro de stream|Se a conexão cai no meio do stream, salva o texto já recebido como mensagem parcial marcada, em vez de perder tudo|ChatGPT, Claude.ai, T3 Chat|DIFF|M|
|OPS-38|Idempotência de envio (evitar duplicar mensagem)|Chave de idempotência (client-generated UUID) evita reenvio duplicado em retry de rede do lado do cliente|invisível — exigência de engenharia, algumas APIs de provedor suportam `Idempotency-Key`|DIFF|M|
|OPS-39|Fila para picos de requisição (queueing)|Requisições em excesso entram em fila com concorrência limitada em vez de sobrecarregar o provedor/API key|Poe (fila visível para usuários free), invisível em produtos self-host|DIFF|M|
|OPS-40|Failover automático entre múltiplos provedores/keys|Se um provedor falha ou está sob rate limit, roteia automaticamente para provedor alternativo equivalente|OpenRouter, LiteLLM proxy, Msty (multi-provider fallback)|FRONT|L|
|OPS-41|Multiplexação de múltiplas API keys do mesmo provedor|Roda round-robin entre várias chaves para aumentar throughput agregado sem violar rate limit de uma chave|invisível — exigência de engenharia, LiteLLM proxy suporta|DIFF|M|

## 4. Tokenização e contagem

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|OPS-42|Tokenizer exato por família de modelo|Usa o tokenizer real (tiktoken cl100k/o200k para OpenAI, tokenizer próprio Anthropic, SentencePiece para Gemini/Llama) em vez de aproximação|invisível — exigência de engenharia; bibliotecas: tiktoken, @anthropic-ai/tokenizer|MESA|M|
|OPS-43|Contagem de tokens client-side (browser)|Carrega tokenizer via WASM no browser (js-tiktoken, gpt-tokenizer) para mostrar contagem antes de enviar, sem round-trip ao servidor|token-counter.dev pattern, Open WebUI (parcial)|DIFF|M|
|OPS-44|Contagem de tokens server-side autoritativa|Servidor recalcula/usa contagem retornada pelo provedor na resposta como fonte de verdade para billing|invisível — exigência de engenharia, universal em produtos com billing|MESA|S|
|OPS-45|Fallback de aproximação por caractere quando não há tokenizer oficial|Para provedores sem tokenizer público (a maioria fora de OpenAI), estima por heurística de caracteres/palavra com erro de 5-15%|invisível — exigência de engenharia|DIFF|S|
|OPS-46|Custo de bundle do tokenizer WASM no frontend|Tokenizer completo (~1-2MB de tabelas BPE) adiciona peso relevante ao bundle; requer lazy-load sob demanda|invisível — exigência de engenharia|DIFF|S|
|OPS-47|Contagem de tokens de imagem/mídia|Calcula tokens equivalentes de imagens conforme fórmula do provedor (tiles, resolução) para orçamento de contexto|ChatGPT, Claude.ai, Gemini (implementam client-side no cálculo de custo exibido)|DIFF|M|
|OPS-48|Contagem de tokens de tool schema (function definitions)|Inclui overhead de tokens do JSON schema das ferramentas registradas no cálculo de contexto usado, frequentemente esquecido|invisível — exigência de engenharia|DIFF|S|
|OPS-49|Indicador de uso de contexto (barra/percentual)|Mostra visualmente quanto da janela de contexto do modelo já foi consumido pela conversa|Claude.ai (context window indicator), Cursor, Open WebUI|DIFF|S|

## 5. Observabilidade

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|OPS-50|Tracing distribuído via OpenTelemetry|Instrumenta chamadas ao provedor, DB e pipeline RAG com spans padronizados exportáveis a qualquer backend OTel|Langfuse (OTel GenAI nativo), Phoenix (OpenInference/OTel)|DIFF|M|
|OPS-51|Integração com Langfuse|Captura traces completos de LLM (prompt, resposta, custo, latência) via SDK, self-host Apache-2.0|Langfuse; adotado por Dify, LibreChat (integração), Langflow|DIFF|M|
|OPS-52|Integração com LangSmith|Tracing nativo para apps baseados em LangChain/LangGraph, cloud-only|LangSmith|DIFF|M|
|OPS-53|Integração com Helicone (proxy-based)|Intercepta chamadas ao provedor como proxy HTTP, log automático sem mudar SDK, com cache semântico embutido|Helicone|DIFF|S|
|OPS-54|Integração com Phoenix/Arize|Observabilidade open-source self-hostável baseada em OpenTelemetry/OpenInference|Phoenix (Arize)|DIFF|M|
|OPS-55|Integração com Braintrust|Plataforma focada em eval contínuo, transforma cada trace de produção em caso de teste para regressão|Braintrust|FRONT|L|
|OPS-56|Log estruturado (JSON) de requisições|Cada chamada a provedor loga campos estruturados (modelo, tokens, latência, erro) em vez de texto livre, permitindo query|invisível — exigência de engenharia|MESA|S|
|OPS-57|Correlação de trace ID com conversa/mensagem|Cada trace de observability carrega `conversation_id`/`message_id` para navegar de log a UI e vice-versa|Langfuse, LangSmith (via metadata tags)|DIFF|S|
|OPS-58|Métrica de TTFT (time-to-first-token)|Mede latência entre envio da requisição e chegada do primeiro token do stream, chave para percepção de responsividade|Langfuse, Helicone, LangSmith, OpenRouter (exibe TTFT por modelo)|DIFF|S|
|OPS-59|Métrica de tokens/segundo (throughput de geração)|Mede taxa de geração pós-primeiro-token, usada para comparar provedores/modelos|OpenRouter, Langfuse, LM Studio (exibe local)|DIFF|S|
|OPS-60|Latência p50/p95/p99 agregada|Dashboards com percentis de latência por rota/modelo/provedor para detectar degradação|Langfuse, LangSmith, Helicone, Phoenix|DIFF|M|
|OPS-61|Taxa de erro por provedor/modelo|Painel que segrega taxa de falha (429, 5xx, timeout) por provedor para decisão de failover|Helicone, Langfuse|DIFF|M|
|OPS-62|Health check de endpoints/provedores|Rota `/health` que verifica conectividade com DB e provedores configurados, usada por orquestradores (k8s liveness/readiness)|invisível — exigência de engenharia|MESA|S|
|OPS-63|Alertas configuráveis (erro, custo, latência)|Dispara notificação (Slack/email/webhook) quando métrica ultrapassa limiar definido|Langfuse (cloud), Helicone (alerts), Braintrust|DIFF|M|

## 6. Avaliação

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|OPS-64|Dataset de teste versionado|Conjunto de exemplos (input/output esperado) versionado para rodar eval reproduzível|Braintrust, LangSmith, Langfuse (datasets)|DIFF|M|
|OPS-65|Eval automatizado em pipeline (CI)|Roda dataset de avaliação a cada mudança de prompt/modelo e bloqueia regressão antes de deploy|Braintrust (CI regression gates), LangSmith|FRONT|L|
|OPS-66|LLM-as-judge|Usa um modelo (geralmente maior/mais caro) para pontuar qualidade da resposta de outro modelo segundo rubrica|Braintrust, LangSmith, Langfuse, Phoenix (via `evals` lib)|DIFF|M|
|OPS-67|Detecção de regressão de prompt|Compara métricas de eval entre versão antiga e nova de um prompt/modelo, sinalizando queda de qualidade|Braintrust, LangSmith (experiments)|FRONT|L|
|OPS-68|A/B de modelo em produção|Divide tráfego real entre dois modelos/prompts e mede diferença de métrica de negócio/qualidade|invisível — exigência de engenharia, suportado via LiteLLM router + Langfuse/Braintrust|FRONT|L|
|OPS-69|Coleta de feedback do usuário ligada ao trace (thumbs up/down)|Botão de avaliação na UI grava score vinculado ao trace_id, alimentando o eval|ChatGPT, Claude.ai, Open WebUI, LibreChat, Langfuse (user feedback API)|MESA|S|
|OPS-70|Anotação humana em fila de revisão|Interface para revisor humano rotular/corrigir respostas de produção, gerando dataset de treino/eval|Braintrust (review queues), LangSmith (annotation queues), Langfuse|DIFF|M|
|OPS-71|Métrica de groundedness (RAG)|Avalia se a resposta é sustentada pelos documentos recuperados (não alucinada em relação ao contexto)|RAGFlow, Phoenix (RAG evals), Braintrust, Ragas (lib usada por vários)|FRONT|M|
|OPS-72|Métrica de relevância de recuperação (retrieval relevance)|Avalia se os chunks recuperados são de fato relevantes à pergunta antes mesmo da geração|RAGFlow, Onyx, Phoenix|DIFF|M|
|OPS-73|Replay de traces de produção como casos de teste|Converte automaticamente interações reais logadas em novos casos de dataset de avaliação|Braintrust|FRONT|L|

## 7. Performance de frontend

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|OPS-74|Virtualização de lista de mensagens longa|Renderiza apenas mensagens visíveis na viewport (windowing) em conversas com centenas de turnos, evitando DOM gigante|ChatGPT, Claude.ai, Open WebUI (parcial)|DIFF|M|
|OPS-75|Controle de re-render durante streaming token-a-token|Evita re-render de toda a árvore React a cada token; isola atualização no nó de mensagem ativa (memoização/state local)|invisível — exigência de engenharia|MESA|M|
|OPS-76|Markdown parsing incremental sem bloquear a UI|Parseia markdown parcial/streaming sem re-parsear string inteira a cada token (parser incremental ou debounce)|ChatGPT, Claude.ai, assistant-ui, Open WebUI|DIFF|M|
|OPS-77|Highlight de código assíncrono/lazy|Syntax highlighting (Shiki/Prism/highlight.js) roda fora da thread principal ou é adiado até o bloco de código fechar|Claude.ai, Open WebUI, Chainlit|DIFF|M|
|OPS-78|Scroll automático que respeita interação do usuário|Auto-scroll para o fim durante streaming, mas para assim que o usuário rola manualmente para cima (sticky-to-bottom condicional)|ChatGPT, Claude.ai, Open WebUI, LibreChat|MESA|S|
|OPS-79|Memoização de componentes de mensagem estáticos|Mensagens já completas (não em streaming) são memoizadas e não recalculadas a cada render do stream ativo|invisível — exigência de engenharia|MESA|S|
|OPS-80|Code-splitting e lazy load de bibliotecas pesadas (KaTeX/Mermaid/Shiki)|Carrega bibliotecas de renderização de fórmula/diagrama/código somente quando o conteúdo correspondente aparece na resposta|Claude.ai, Open WebUI, LobeHub|DIFF|M|
|OPS-81|Orçamento de tamanho de bundle inicial|Mantém o bundle JS de carregamento inicial pequeno (tree-shaking, dynamic import) para TTI rápido|invisível — exigência de engenharia|DIFF|M|
|OPS-82|Debounce de persistência local (draft de input)|Salva rascunho do campo de texto no localStorage/IndexedDB com debounce, sem gravar a cada tecla|Open WebUI, LibreChat|DIFF|S|

## 8. Segurança de aplicação

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|OPS-83|Sanitização de HTML/Markdown gerado pelo modelo (anti-XSS)|Remove/escapa tags e atributos perigosos (`<script>`, `onerror=`) antes de renderizar markdown do modelo como HTML|invisível — exigência de engenharia (DOMPurify padrão), universal em produtos maduros|MESA|S|
|OPS-84|Content-Security-Policy restritiva|Header CSP que bloqueia execução de script inline não confiável e origens externas não autorizadas|invisível — exigência de engenharia|MESA|S|
|OPS-85|Proteção contra SSRF em fetch de URL solicitada pelo usuário (web browsing/tool)|Valida/bloqueia URLs apontando para IPs internos/metadata endpoints (169.254.169.254) antes de o servidor fazer fetch|invisível — exigência de engenharia crítica em ferramentas de browsing (ChatGPT, Perplexity implementam)|MESA|M|
|OPS-86|Validação de upload malicioso (magic bytes, tamanho, tipo)|Verifica o conteúdo real do arquivo (não só extensão/MIME declarado) e limita tamanho antes de aceitar upload|invisível — exigência de engenharia|MESA|S|
|OPS-87|Prevenção de path traversal em nomes de arquivo|Sanitiza nome de arquivo de upload/anexo para impedir `../` escapando do diretório de storage|invisível — exigência de engenharia|MESA|S|
|OPS-88|Redação de secrets em logs|Filtra API keys, tokens e PII antes de gravar em log estruturado ou enviar a observability|invisível — exigência de engenharia|MESA|S|
|OPS-89|Proteção CSRF em endpoints de mutação|Token/SameSite cookie para impedir requisição forjada de origem cruzada em rotas de estado (enviar mensagem, deletar conta)|invisível — exigência de engenharia|MESA|S|
|OPS-90|Isolamento de prompt injection vindo de conteúdo de ferramenta/documento|Marca conteúdo de fontes externas (web, RAG, tool output) como não-confiável e resistente a instruções embutidas nele|Claude.ai (instruction hierarchy), ChatGPT|FRONT|L|
|OPS-91|Sandbox isolado para execução de código (code interpreter)|Executa código gerado pelo modelo em container/VM isolado sem acesso à rede/filesystem do host|ChatGPT (Code Interpreter), Claude.ai (Analysis/Artifacts sandbox), Open WebUI (via jupyter opcional)|FRONT|XL|
|OPS-92|Rate limiting por usuário/IP em endpoints públicos|Limita requisições por identidade para mitigar abuso e ataque de negação de serviço em custo (LLM)|invisível — exigência de engenharia|MESA|M|

## 9. Custo de infraestrutura

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|OPS-93|Cache de resposta exata (mesmo prompt)|Reutiliza resposta salva para requisição idêntica byte-a-byte, evitando nova chamada ao provedor|Helicone (cache proxy), LiteLLM|DIFF|S|
|OPS-94|Cache semântico|Reutiliza resposta para prompts semanticamente similares (não idênticos) via embedding + threshold de similaridade|Helicone (semantic cache), GPTCache (lib usada por integrações)|FRONT|M|
|OPS-95|Dedupe de embeddings gerados|Evita reprocessar embedding do mesmo chunk de documento já indexado (hash de conteúdo como chave)|invisível — exigência de engenharia, Dify/RAGFlow implementam internamente|DIFF|S|
|OPS-96|Modelo barato para tarefas internas (auto-título, resumo curto)|Usa modelo pequeno/rápido para gerar título de conversa, resumo de branch ou classificação de intenção, poupando custo do modelo principal|ChatGPT, Claude.ai, Open WebUI, LibreChat (todos geram título com modelo leve)|MESA|S|
|OPS-97|Cache de prompt (prompt caching do provedor)|Usa o recurso nativo do provedor (Anthropic prompt caching, OpenAI cached input) para reduzir custo de prefixo repetido do sistema/contexto longo|Claude.ai/API (prompt caching), ChatGPT/API (automatic caching)|DIFF|M|

## 10. Escala

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|OPS-98|Backend stateless com estado externalizado|Nenhum estado de sessão vive na memória do processo; tudo em DB/Redis, permitindo qualquer réplica atender qualquer requisição|invisível — exigência de engenharia para escalar horizontalmente|MESA|M|
|OPS-99|Sticky session para streaming em curso|Quando streaming ativo depende de estado em memória de uma réplica específica, o load balancer precisa rotear a mesma sessão sempre à mesma instância|invisível — exigência de engenharia (paliativo até OPS-98 estar completo)|DIFF|M|
|OPS-100|Pub/sub entre réplicas para eventos de stream compartilhado|Redis Pub/Sub ou similar propaga tokens de uma geração ativa para todas as réplicas que servem abas conectadas àquela conversa (pré-requisito de OPS-07 em multi-réplica)|invisível — exigência de engenharia, Vercel AI SDK resumable-stream usa Redis|FRONT|L|
|OPS-101|Job queue para trabalho assíncrono (indexação, embeddings, exports)|Fila (BullMQ, Celery, Sidekiq-like) desacopla trabalho pesado da requisição HTTP síncrona|Dify, RAGFlow, Langflow, n8n (motor de fila nativo)|DIFF|M|
|OPS-102|Worker separado do processo web|Processo dedicado consome a fila (indexação de documentos, geração de embeddings) sem competir por recursos com requisições HTTP|Dify, RAGFlow, Onyx|DIFF|M|
|OPS-103|Deploy em Kubernetes com HPA|Manifests/Helm chart com autoscaling horizontal baseado em CPU/fila, health/readiness probes|Open WebUI (Helm chart oficial), Dify (k8s deployment), LibreChat (k8s manifests comunitários)|DIFF|L|

---

## Armadilhas

- **Resumable stream não é "resume de qualquer desconexão"**: a implementação de referência (Vercel `resumable-stream`) só cobre reload de página; troca de aba, background em mobile e troca de rede seguem derrubando a conexão sem recovery. Construir achando que resolve tudo é ilusão.
- **Abort do usuário confundido com desconexão**: se você reusar o mesmo mecanismo de "retomar stream" para tratar `stop()` do usuário, o sistema tenta continuar gerando depois que o usuário mandou parar — bug documentado no próprio `vercel/ai`.
- **Buffering de proxy é invisível até produção**: em dev local (sem nginx/ALB/Cloudflare na frente) o streaming parece perfeito; só quebra atrás de proxy real, e o sintoma (tokens chegando em lote) é fácil de confundir com bug no backend.
- **Gzip comprime e bufferiza streams**: compressão automática do proxy precisa de buffer mínimo antes de comprimir, reintroduzindo latência de lote mesmo com `proxy_buffering off` se gzip não for desabilitado na rota de streaming.
- **Timeout de gateway mata geração longa silenciosa**: modelos de raciocínio ficam minutos sem emitir token visível (thinking); sem heartbeat, o proxy fecha a conexão por "inatividade" mesmo com o backend vivo.
- **Árvore de mensagens sem índice em `parent_id` degrada rápido**: montar a árvore completa a cada leitura sem índice composto (`conversation_id, parent_id`) vira scan O(n) por render em conversas longas.
- **Soft delete sem TTL de retenção vira acúmulo infinito**: sem job de limpeza definitivo após período de retenção, o banco cresce indefinidamente e a "exclusão" nunca libera espaço nem cumpre GDPR/LGPD.
- **Retry ingênuo em erro 400 amplifica custo**: retry automático em erro de validação (payload malformado) não corrige nada, só multiplica chamadas cobradas — retry precisa distinguir classe de erro, não só status HTTP genérico.
- **Contagem de tokens aproximada usada para decisão de corte de contexto**: truncar histórico com estimativa de caracteres (não tokenizer real) pode subestimar e estourar o limite do provedor, causando erro 400 tardio em vez de corte preventivo.
- **Tokenizer carregado no bundle principal**: incluir tiktoken/js-tiktoken (~1-2MB) no bundle inicial em vez de lazy-load penaliza todo usuário mesmo quando a contagem de tokens é secundária.
- **Sanitização de markdown feita depois da renderização, não antes**: renderizar HTML bruto do modelo e sanitizar via CSS/display é insuficiente; sanitização precisa ocorrer na árvore DOM/AST antes do `dangerouslySetInnerHTML` equivalente.
- **SSRF esquecido em ferramentas de "buscar essa URL"**: qualquer feature de browsing/fetch de URL fornecida pelo usuário sem allowlist/blocklist de IP interno é uma porta aberta para acessar metadata endpoints de cloud (169.254.169.254) e roubar credenciais de infra.
- **Cache semântico com threshold mal calibrado retorna resposta errada com confiança**: cache semântico agressivo demais serve resposta de pergunta "parecida" mas semanticamente diferente, e o usuário não percebe porque a resposta parece plausível.
- **Sticky session mascara bug de estado, não escala de verdade**: depender de sticky session para streaming funcionar é atalho que quebra assim que uma réplica cai no meio de um stream ativo — todas as abas daquela sessão perdem a geração.
- **Observability sem correlação de trace_id vira log solto**: sem amarrar `trace_id` a `conversation_id`/`message_id` desde o dia um, debugar um caso de produção específico depois é arqueologia.
- **LLM-as-judge sem dataset de referência vira eval de aparência**: usar outro LLM para "julgar" sem rubrica explícita e casos de controle (golden set) mede fluência, não corretude — regressões reais passam despercebidas.

## Ordem de construção

1. **Persistência básica** (OPS-17, OPS-20, OPS-23) — schema de conversa/mensagem + migrações versionadas é a fundação; tudo mais grava nisso.
2. **Streaming SSE simples** (OPS-01, OPS-08, OPS-11) — stream funcional com cancelamento real antes de qualquer resiliência avançada.
3. **Log estruturado + correlação de trace** (OPS-56, OPS-57) — pré-requisito de qualquer observability posterior; sem isso, integrar Langfuse/Helicone depois é retrabalho.
4. **Retry/timeout/classificação de erro por provedor** (OPS-32 a OPS-36) — antes de multi-provedor, garanta que um provedor falha bem.
5. **Sanitização + CSP + SSRF guard** (OPS-83, OPS-84, OPS-85) — segurança de aplicação entra antes de qualquer feature que renderize conteúdo do modelo ou busque URL externa; retrofit é mais caro.
6. **Proxy reverso correto (nginx/timeouts/buffering)** (OPS-12, OPS-13, OPS-14) — necessário assim que sair de `localhost`; buffering de proxy é o bug clássico "funciona no meu dev, quebra em prod".
7. **Árvore de mensagens (branching)** (OPS-21, OPS-22) — muda o schema de mensagem; mais barato fazer antes de acumular dados em lista linear do que migrar depois.
8. **Tokenização real por família de modelo** (OPS-42, OPS-44) — pré-requisito de qualquer indicador de contexto/custo confiável.
9. **Performance de frontend** (OPS-74 a OPS-82) — só vira dor perceptível com histórico real; construir antes de ter dados é otimização prematura, mas adiar demais quebra UX em conversas longas.
10. **Resumable stream + multi-aba + geração pós-fechamento de aba** (OPS-05, OPS-06, OPS-07, OPS-100) — depende de storage externo (Redis) e de arquitetura já stateless (OPS-98); é o item mais caro do domínio, deixar por último.
11. **Observability completa (Langfuse/Helicone/OTel)** (OPS-50 a OPS-63) — plugar depois que o pipeline básico está estável; instrumentar cedo demais sem volume de tráfego real gera dashboards vazios.
12. **Avaliação/eval contínuo** (OPS-64 a OPS-73) — só faz sentido com observability e feedback de usuário (OPS-69) já coletando dados de produção.
13. **Custo de infra (cache, modelo barato para tarefas internas)** (OPS-93 a OPS-97) — otimização que só compensa depois de ter volume suficiente para o cache pagar sua complexidade.
14. **Escala horizontal real (k8s, pub/sub multi-réplica, job queue)** (OPS-98 a OPS-103) — último estágio; prematuro antes de ter tráfego que justifique múltiplas réplicas.

## Fontes

- https://ably.com/topic/ai-stack/vercel-ai-sdk-resumable-stream-what-it-covers-and-what-it-doesnt
- https://ably.com/blog/ai-chat-stream-resumption
- https://ably.com/blog/stop-vs-disconnect-canceling-ai-streaming
- https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-resume-streams
- https://ai-sdk.dev/docs/troubleshooting/abort-breaks-resumable-streams
- https://github.com/vercel/ai/issues/8390
- https://github.com/vercel/ai/issues/6502
- https://upstash.com/blog/realtime-ai-sdk
- https://blog.stackademic.com/net-10-sse-in-production-the-proxy-buffering-default-that-turns-real-time-into-batches-cbe49c45c3ad
- https://oneuptime.com/blog/post/2025-12-16-server-sent-events-nginx/view
- https://jvns.ca/blog/2021/01/12/day-36--server-sent-events-are-cool--and-a-fun-bug/
- https://www.getpagespeed.com/server-setup/nginx/fix-504-gateway-timeout-nginx
- https://www.edge-cases.com/react/rsc-streaming-reverse-proxy
- https://particula.tech/blog/helicone-vs-langfuse-vs-langsmith-llm-observability
- https://www.helicone.ai/blog/the-complete-guide-to-LLM-observability-platforms
- https://www.braintrust.dev/articles/arize-phoenix-vs-braintrust
- https://www.marktechpost.com/2026/08/09/top-llm-observability-and-evaluation-platforms-in-2026-langfuse-langsmith-braintrust-arize-and-more-compared/
- https://arize.com/docs/phoenix/resources/frequently-asked-questions/braintrust-open-source-alternative-llm-evaluation-platform-comparison
- https://token-counter.dev/
- https://www.pkgpulse.com/guides/gpt-tokenizer-vs-js-tiktoken-vs-xenova-transformers-llm-2026
- https://spoold.com/tools/token-calculator
- https://openreplay.com/tools/llm-token-counter/

---

# 12. `CLOSED` — Fronteira proprietária

## ChatGPT (OpenAI)

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CLOSED-01|Projects com Project Memory isolada|Agrupa chats/arquivos/instruções num contexto persistente; memória do projeto não vaza para o chat principal e vice-versa|ChatGPT|MESA|M|
|CLOSED-02|Memory automática ("Dreaming V3")|Sintetiza memória em background a partir do histórico de conversas sem comando explícito "lembre disso"; recall factual medido em 82.8%|ChatGPT|FRONT|XL|
|CLOSED-03|Referência a chats passados (cross-chat retrieval)|Busca e cita conteúdo de conversas antigas fora do projeto atual quando relevante|ChatGPT, Claude.ai (parcial)|DIFF|L|
|CLOSED-04|Tasks agendadas|Agenda tarefas recorrentes/pontuais (lembretes, relatórios) executadas mesmo sem o usuário ativo no app|ChatGPT, Gemini (Scheduled Actions), Perplexity (alerts)|DIFF|M|
|CLOSED-05|Custom GPTs + GPT Store|Cria assistente customizado (instruções, conhecimento, ações) e publica num marketplace descoberto por outros usuários|ChatGPT, Poe (bots)|DIFF|L|
|CLOSED-06|Deep Research (web multi-fonte)|Agente que navega dezenas/centenas de páginas, sintetiza e cita um relatório extenso|ChatGPT, Gemini, Perplexity, Grok, Le Chat|DIFF|XL|
|CLOSED-07|Canvas (documento colaborativo lado a lado)|Editor lado a lado onde saída do modelo vira documento editável, com exportação PDF/docx/md/código|ChatGPT, Gemini, Claude (Artifacts equivalente)|MESA|L|
|CLOSED-08|Advanced Voice Mode (áudio nativo)|Pipeline de áudio-para-áudio sem transcrição intermediária, latência de conversa real|ChatGPT, Grok, Gemini Live|FRONT|XL|
|CLOSED-09|Agent Mode / Operator (navegação web autônoma)|Executa ações multi-passo em sites reais (navegador visual) e sistemas empresariais via API segura|ChatGPT, Gemini (Agent Mode), Perplexity (Comet), Copilot|FRONT|XL|
|CLOSED-10|Connectors nativos (Drive/SharePoint/GitHub/Slack/Gmail)|Conecta apps corporativos para grounding automático sem upload manual|ChatGPT, Claude.ai, Copilot|DIFF|L|
|CLOSED-11|Apps SDK (apps de terceiros dentro do chat)|SDK sobre MCP que deixa empresas construírem apps com UI renderizada dentro da conversa|ChatGPT, Claude (MCP Apps)|FRONT|XL|
|CLOSED-12|AgentKit / Agent Builder visual|Ferramenta drag-and-drop para montar workflows de agentes sem código|ChatGPT (OpenAI platform), Copilot Studio, Le Chat (agents)|DIFF|XL|
|CLOSED-13|Code Interpreter / execução de código sandboxed|Roda Python num sandbox anexado ao chat, gera arquivos/gráficos inline|ChatGPT, Claude (code execution), Gemini|MESA|L|
|CLOSED-14|Sora (geração de vídeo integrada ao chat)|Gera vídeo a partir de texto/imagem diretamente no produto de chat|ChatGPT|FRONT|XL|
|CLOSED-15|Study Mode|Modo pedagógico que guia com perguntas socráticas e quizzes interativos em vez de dar resposta direta|ChatGPT|DIFF|M|
|CLOSED-16|Company Knowledge (grounding corporativo unificado)|Retrieval sobre todo o conhecimento conectado da empresa (Slack, Drive, SharePoint) num único índice para Work workspace|ChatGPT (Business/Enterprise)|FRONT|XL|
|CLOSED-17|Compartilhamento de Project com equipe|Compartilha projeto inteiro (arquivos, instruções, threads) com colegas em workspace|ChatGPT, Claude Projects (via org), Le Chat Projects|DIFF|M|
|CLOSED-18|Modo temporário (chat sem memória/histórico)|Conversa que não é salva no histórico nem alimenta memória, mas ainda usa infraestrutura completa|ChatGPT, Gemini (Temporary Chat), Claude (incognito)|MESA|S|
|CLOSED-19|Atlas (browser nativo com sidebar assistente)|Browser Chromium com ChatGPT embutido como sidebar, resume página, compara produtos, modo agente clica em sites|ChatGPT (Atlas), Perplexity (Comet)|FRONT|XL|
|CLOSED-20|Chat/Work split (2026)|Desktop app separa chats pessoais de conversas "Work" sincronizadas e com contexto de projeto corporativo|ChatGPT|DIFF|L|

## Claude.ai (Anthropic)

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CLOSED-21|Projects com Knowledge base persistente|Workspace com instruções, arquivos de referência e conversas compartilhando contexto fixo|Claude.ai, ChatGPT Projects, Le Chat Projects|MESA|M|
|CLOSED-22|Artifacts (saídas reutilizáveis com estado)|Painel separado para docs/apps/dashboards gerados, com storage persistente, chamadas diretas à API e conexão MCP em 2026|Claude.ai|FRONT|L|
|CLOSED-23|Skills (pacotes de workflow reutilizáveis)|Procedimentos reutilizáveis com scripts executáveis que Claude aplica consistentemente sem reescrever instruções ("Skills 2.0")|Claude.ai, Claude Code|FRONT|XL|
|CLOSED-24|Skills pré-fabricadas (Excel/PPT/Word/PDF)|Pacotes oficiais da Anthropic para manipular arquivos de escritório com fidelidade de formatação|Claude.ai|DIFF|L|
|CLOSED-25|MCP connectors directory (950+ servidores)|Diretório curado de conectores MCP prontos para uso sem configuração manual|Claude.ai|FRONT|L|
|CLOSED-26|MCP Apps (UI interativa embutida)|Servidores MCP renderizam UI diretamente na conversa; usuário interage inline sem trocar de aba|Claude.ai, ChatGPT (Apps SDK)|FRONT|XL|
|CLOSED-27|Research Mode com MCP estendido|Deep research que conecta a qualquer servidor MCP para dados empresariais sem plumbing de API custom|Claude.ai|DIFF|L|
|CLOSED-28|Code execution local com bridge criptografada|Execução de código roda na máquina local do usuário; só mensagens/resultados trafegam por bridge API criptografada|Claude.ai (via Claude Code integration)|FRONT|XL|
|CLOSED-29|Files API|API dedicada para upload/gestão de arquivos persistentes reutilizáveis entre chamadas|Claude (API), ChatGPT (Files API)|MESA|M|
|CLOSED-30|Analysis tool (execução JS sandboxed para dados)|Roda JavaScript num sandbox para analisar dados enviados e produzir visualizações inline|Claude.ai|MESA|M|
|CLOSED-31|Styles (tom de resposta customizável)|Perfis de estilo de escrita selecionáveis/persistentes por conversa (conciso, formal, explicativo)|Claude.ai|DIFF|S|
|CLOSED-32|Cowork (agente multi-superfície para trabalho)|Opera por arquivos, pastas, conectores, abas do navegador e apps desktop para completar trabalho multi-etapa|Claude.ai (Cowork)|FRONT|XL|
|CLOSED-33|Extended Thinking visível|Exibe cadeia de raciocínio do modelo antes da resposta final, inclusive em voz|Claude.ai, Grok ("Think"), DeepSeek|DIFF|M|
|CLOSED-34|Claude in Chrome (agente de navegador)|Extensão que navega, clica, preenche formulários e executa workflows enquanto o usuário observa|Claude.ai, ChatGPT Atlas, Perplexity Comet|FRONT|XL|

## Gemini / AI Studio / NotebookLM (Google)

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CLOSED-35|Gems (assistentes customizados persistentes)|Configura papel/instruções/até 10 arquivos de referência para um assistente reutilizável|Gemini, ChatGPT (Custom GPTs)|MESA|M|
|CLOSED-36|Deep Research Max (com MCP + visualizações)|Research profunda que integra Gmail/Drive/NotebookLM e gera visualizações nativas para tarefas de longo horizonte|Gemini|FRONT|XL|
|CLOSED-37|Canvas (docs/apps/slides/infográficos/quizzes)|Workspace editável que gera múltiplos formatos de saída incluindo Audio Overview embutido|Gemini|DIFF|L|
|CLOSED-38|Gemini Live com memória conversacional|Voz ao vivo que lembra detalhes-chave (preferências, datas) entre sessões|Gemini, ChatGPT Advanced Voice|FRONT|XL|
|CLOSED-39|Personal Context (aprendizado de conversas passadas)|Aprende preferências ao longo do tempo sem comando explícito, para respostas mais "colaborativas"|Gemini|DIFF|L|
|CLOSED-40|Integração nativa Workspace (side panel)|Painel lateral dentro de Gmail/Docs/Sheets/Slides que resume, reescreve, extrai dados no contexto do documento aberto|Gemini, Copilot (Office)|MESA|XL|
|CLOSED-41|Scheduled Actions|Converte prompt em ação recorrente ou pontual disparada automaticamente|Gemini (Pro/Ultra), ChatGPT Tasks|DIFF|M|
|CLOSED-42|Agent Mode / ex-Project Mariner (automação de browser)|Executa até 10 tarefas web paralelas com "Teach and Repeat" (demonstrar uma vez, replicar)|Gemini (Ultra)|FRONT|XL|
|CLOSED-43|NotebookLM Audio Overview (podcast com 2 hosts)|Converte fontes em podcast com dois "hosts" de IA que debatem e resumem, com modo interativo para participar ao vivo|NotebookLM|FRONT|XL|
|CLOSED-44|NotebookLM Video Overview cinemático|Gera vídeo deep-dive com animações fluidas a partir das fontes, com estilos visuais selecionáveis|NotebookLM|FRONT|XL|
|CLOSED-45|NotebookLM Mind Map interativo com rastreio de fonte|Diagrama visual clicável onde cada nó rastreia qual trecho da fonte o sustenta|NotebookLM|FRONT|L|
|CLOSED-46|NotebookLM Discover Sources|Busca e recomenda até 10 fontes externas relevantes ao tópico, com resumo de por que se conectam|NotebookLM|DIFF|L|
|CLOSED-47|Sync Gemini↔NotebookLM|Fontes, conversas e outputs do Studio Panel sincronizam automaticamente entre os dois produtos|Gemini, NotebookLM|DIFF|L|
|CLOSED-48|AI Studio: Grounding com Google Search (dynamic retrieval)|Ancora respostas em resultados de busca em tempo real com threshold ajustável de quando buscar|AI Studio (API)|DIFF|M|
|CLOSED-49|AI Studio: Structured Output / JSON schema forçado|Toggle que obriga o modelo a seguir schema JSON estrito|AI Studio, ChatGPT (structured outputs), Claude|MESA|S|
|CLOSED-50|AI Studio: Tuning (Parameter Efficient Tuning)|Fine-tuning gerenciado do modelo Gemini com técnica PET, sem infra própria|AI Studio|DIFF|L|

## Perplexity

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CLOSED-51|Spaces (pasta de projeto com instruções + colaboradores)|Ambiente de pesquisa colaborativo com instruções custom, upload de docs e convite de colaboradores|Perplexity|MESA|M|
|CLOSED-52|Focus Modes (6 fontes dedicadas)|Restringe busca a Web/Academic/Reddit/YouTube/News/Wolfram Alpha|Perplexity|DIFF|S|
|CLOSED-53|Pro Search (multi-step, 10-20 fontes)|Busca em múltiplos passos que lê dezenas de fontes antes de responder|Perplexity|MESA|M|
|CLOSED-54|Deep Research (100+ fontes, relatório estruturado)|Pesquisa exaustiva que visita mais de 100 fontes e produz relatório longo com deliverables (PPT, planilha, site)|Perplexity, ChatGPT, Gemini|FRONT|XL|
|CLOSED-55|Comet (browser agêntico)|Browser dedicado onde o assistente interage com abas abertas e executa tarefas multi-etapa|Perplexity (Comet), ChatGPT Atlas|FRONT|XL|
|CLOSED-56|Citação obrigatória inline em toda resposta|Cada afirmação vem acompanhada de link/nota de fonte, por design de produto (não opcional)|Perplexity, NotebookLM|MESA|M|
|CLOSED-57|Discover (feed personalizado + lugares map-first)|Página inicial de notícias/mercados/lugares com experiência visual de mapa|Perplexity|DIFF|L|
|CLOSED-58|Labs (geração de app/relatório/dashboard em minutos)|Cria relatórios, planilhas, gráficos e web apps funcionais a partir de um prompt, com execução de código|Perplexity, Claude (Artifacts), ChatGPT (Canvas)|FRONT|L|
|CLOSED-59|Shopping integrado com checkout assistido|Compara produtos e permite compra guiada dentro do chat|Perplexity|DIFF|L|
|CLOSED-60|Finance (Market Summary, Crypto, Earnings, heatmap)|Painel financeiro com análise IA de mercado, alertas de preço configuráveis por query|Perplexity|FRONT|L|
|CLOSED-61|Price Alerts com query customizável|Dispara email/push quando ativo atinge threshold, rodando query personalizada do usuário|Perplexity|DIFF|M|
|CLOSED-62|Seleção de modelo por usuário (GPT/Claude/Gemini)|Deixa o usuário escolher entre múltiplos modelos de fornecedores diferentes na mesma interface|Perplexity, Poe, T3 Chat, Msty|DIFF|M|

## Microsoft Copilot

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CLOSED-63|Agentic capabilities em Word/Excel/PowerPoint (GA)|Copilot planeja, executa e refina trabalho multi-etapa direto dentro do documento nativo do Office|Copilot|FRONT|XL|
|CLOSED-64|PowerPoint Agent Mode com Work IQ|Constrói apresentação inteira ancorada em arquivos/reuniões/emails do próprio usuário|Copilot|FRONT|XL|
|CLOSED-65|Copilot Chat em Outlook com raciocínio sobre inbox+calendário|Deixou de ser thread único e passa a raciocinar sobre toda a caixa de entrada e agenda|Copilot|DIFF|L|
|CLOSED-66|Multi-model routing (Claude Opus embutido no M365)|Roteia tarefas complexas para Claude dentro do Copilot corporativo, sem o usuário trocar de app|Copilot|FRONT|XL|
|CLOSED-67|Copilot Notebooks (docs→mind map, audio, study guide)|Transforma notas/fontes em documento, planilha, deck, mapa mental e guia de estudo automaticamente|Copilot, NotebookLM (equivalente)|DIFF|L|
|CLOSED-68|Copilot Studio Agent Builder (workflows visuais)|Designer visual unificado para orquestrar automação agêntica ponta a ponta com conectores empresariais|Copilot Studio|FRONT|XL|
|CLOSED-69|Graph grounding (SharePoint/OneDrive/Dynamics)|Ancora respostas em dados corporativos via Microsoft Graph com busca semântica no tenant|Copilot|FRONT|XL|
|CLOSED-70|Vision em sessões de voz|Compartilha tela/câmera e recebe explicação em tempo real combinando visual + dados de trabalho|Copilot, Grok (camera mode)|FRONT|XL|
|CLOSED-71|Agentes MCP embutidos no app nativo|Chama agente customizado/parceiro via MCP direto de dentro de Word/Excel/PPT/Outlook sem trocar de janela|Copilot|FRONT|XL|
|CLOSED-72|Relatórios de uso admin granulares por app|Painel admin com usuários ativos, prompts, interações por app (Word/Excel/Teams/etc) para governança|Copilot, ChatGPT Enterprise (admin)|MESA|L|
|CLOSED-73|Copilot Actions (Power Automate como tool)|Agente executa operações via Power Automate/conectores como ação concreta, não só sugestão|Copilot|DIFF|L|
|CLOSED-74|Copilot Pages (documento vivo colaborativo)|Canvas colaborativo persistente que agrega conteúdo de múltiplas conversas Copilot|Copilot|DIFF|M|

## Outros (Grok, Le Chat, DeepSeek, Poe, Kagi, T3 Chat, Notion AI, Msty, LM Studio)

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CLOSED-75|Acesso em tempo real ao stream de dados do X|Analisa eventos conforme se desenrolam usando acesso direto e privilegiado à rede social X|Grok|FRONT|XL — depende de dado proprietário|
|CLOSED-76|DeepSearch (busca profunda com citação)|Modo lento e exaustivo de busca multi-fonte citada, equivalente ao Deep Research de outros|Grok|DIFF|L|
|CLOSED-77|Grok Imagine (geração de imagem/vídeo com Agent Mode)|Canvas infinito que gera imagens, edita em lote e costura clipes de 6s em vídeos mais longos|Grok|FRONT|XL|
|CLOSED-78|Companheiros de voz com personalidade (Ani, Mika etc.)|Personas de voz distintas selecionáveis para interação por voz/câmera|Grok|DIFF|M|
|CLOSED-79|Ara / multi-agente com debate e peer review|Múltiplos agentes trabalham em paralelo, debatem achados e revisam uns aos outros antes da resposta final|Grok (Heavy mode)|FRONT|XL|
|CLOSED-80|Custom Voices (clonagem de voz curta)|Clona voz a partir de clipe de áudio curto para uso em TTS/voice agent|Grok|DIFF|L|
|CLOSED-81|Le Chat Libraries (base de conhecimento anexável a Agents)|Biblioteca de documentos reutilizável, consultável sem reler tudo, anexável a agentes especializados|Le Chat|DIFF|M|
|CLOSED-82|Flash Answers (inferência ultra-rápida via Cerebras)|Gera ~1000 palavras/segundo usando hardware Cerebras dedicado|Le Chat|FRONT|XL — depende de hardware parceiro|
|CLOSED-83|Le Chat Work Mode (execução agêntica multi-app)|Executa ações multi-etapa através de email, mensagens, calendário e ferramentas conectadas|Le Chat|DIFF|L|
|CLOSED-84|Thinking mode seletivo por chamada (DeepSeek V4)|Alterna entre modo raciocínio e modo direto por requisição individual, mesmo modelo|DeepSeek, Claude (extended thinking toggle)|MESA|M|
|CLOSED-85|Preço peak/off-peak dinâmico de API|Tarifa API varia por horário do dia (peak vs off-peak), metade do preço fora do pico|DeepSeek|DIFF|M|
|CLOSED-86|App de chat gratuito sem tier pago para consumidor|Experiência completa (modelo mais recente, busca web, upload de arquivo) sem assinatura consumer|DeepSeek|DIFF|S|
|CLOSED-87|Marketplace de bots com monetização para criadores|Mais de 1 milhão de bots custom; criadores monetizam por mensagem, assinatura ou paywall|Poe|FRONT|XL|
|CLOSED-88|Multi-bot chat com @-mention|Chama qualquer bot para dentro da mesma thread via @-menção, comparando respostas lado a lado|Poe|DIFF|M|
|CLOSED-89|Poe Canvas Apps com remix|Cria app web interativo dentro do chat e permite que outros usuários façam remix de apps elegíveis|Poe|DIFF|L|
|CLOSED-90|Garantia contratual de não-treino sobre dados do usuário|Compromisso explícito e auditável de que nem Kagi nem os provedores de LLM treinam com os dados/threads do usuário|Kagi Assistant|DIFF|S (política) / M (enforcement técnico)|
|CLOSED-91|Lenses aplicadas ao assistente (escopo de busca custom)|Restringe a busca do assistente a domínios/rankings personalizados definidos pelo usuário|Kagi Assistant, Perplexity (Focus, parcial)|DIFF|M|
|CLOSED-92|Expiração automática de threads|Threads de conversa expiram automaticamente conforme configuração de privacidade do usuário|Kagi Assistant|DIFF|S|
|CLOSED-93|T3 Chat: velocidade extrema local-first|Armazena dados no dispositivo para recuperação instantânea; resposta ~2x mais rápida que ChatGPT|T3 Chat|DIFF|L|
|CLOSED-94|T3 Chat: troca de modelo em tempo real na mesma conversa|Alterna entre Claude/GPT/DeepSeek dentro da mesma sessão sem perder contexto|T3 Chat, Poe|DIFF|M|
|CLOSED-95|Notion AI Autofill em propriedades de banco de dados|Popula propriedades de página automaticamente (resumo, tradução, info-chave) lendo o conteúdo da página|Notion AI|FRONT|L|
|CLOSED-96|Notion AI com contexto de todo o workspace escrito|Responde perguntas usando "tudo que você já escreveu" no workspace inteiro como memória de fundo|Notion AI|DIFF|L|
|CLOSED-97|Msty: engine local embutido (MLX + llama.cpp) sem instalação separada|Roda modelo offline com um clique, sem precisar instalar Ollama/LM Studio à parte|Msty|DIFF|M|
|CLOSED-98|Msty: conversas paralelas ("Crew Mode")|Roda o mesmo prompt contra múltiplos modelos simultaneamente e compara lado a lado|Msty|DIFF|M|
|CLOSED-99|LM Studio: servidor local API-compatível OpenAI|Expõe modelo local via servidor HTTP compatível com API OpenAI em localhost, sem código extra|LM Studio, Jan, Ollama (OSS já tem)|MESA|M|
|CLOSED-100|LM Studio: motor duplo GGUF/MLX com tensor-parallel|Roda llama.cpp (GGUF, qualquer GPU/CPU) e MLX (Apple Silicon) no mesmo app, com multi-GPU tensor-parallel|LM Studio|DIFF|L|
|CLOSED-101|LM Studio: companion app mobile ("Locally")|App mobile dedicado que acessa modelos rodando no LM Studio da máquina local|LM Studio|DIFF|M|

## Padrões comerciais

|ID|Funcionalidade|O que faz (1 linha)|Quem tem|Camada|Custo|
|---|---|---|---|---|---|
|CLOSED-102|Tiers escalonados com features gateadas (Free/Plus/Pro/Team/Enterprise)|Cada tier libera modelo mais forte, limites maiores, features exclusivas (agent mode, deep research ilimitado)|universal (closed)|MESA|L|
|CLOSED-103|Limite de mensagens/janela de tempo por tier|Cap numérico de mensagens ou "créditos" renovado diário/mensal, visível ao usuário|ChatGPT, Claude.ai, Perplexity, Grok|MESA|M|
|CLOSED-104|Créditos consumíveis por feature pesada (deep research, vídeo, agent)|Feature cara em compute consome pool de créditos separado do limite de mensagens normal|ChatGPT, Perplexity, Grok Imagine|DIFF|L|
|CLOSED-105|Precificação híbrida assinatura + overage por modelo caro|Assinatura fixa cobre modelo padrão; uso de modelo premium (ex: Claude) acima de X mensagens cobra à parte|T3 Chat|DIFF|M|
|CLOSED-106|Planos Enterprise/Edu com SSO, DLP, retenção de dados customizável|Camada de compliance (SSO, admin console, políticas de retenção) só disponível em tier corporativo|ChatGPT Enterprise, Claude Enterprise, Copilot, Gemini Workspace|MESA|XL|
|CLOSED-107|Paridade mobile quase completa com desktop (voz, agent, canvas)|App mobile replica quase toda a superfície de features do desktop, incluindo agent mode e canvas|ChatGPT, Claude.ai, Gemini, Perplexity|MESA|L|
|CLOSED-108|Billing por horário de pico/fora de pico (API)|Preço de API varia dinamicamente conforme demanda/horário UTC|DeepSeek|DIFF|M|
|CLOSED-109|Marketplace com revenue share para criadores terceiros|Plataforma paga parte da receita gerada por bots/GPTs/apps criados por usuários externos|Poe, ChatGPT (GPT Store, revenue sharing histórico)|DIFF|XL|

---

## O que o OSS ainda não tem (ago/2026)

- **Acesso privilegiado a dado proprietário em tempo real (Grok↔X)** — motivo: acesso de dados, não algoritmo; nenhum projeto OSS tem firehose de rede social equivalente para replicar.
- **Grounding sobre Microsoft Graph / Google Workspace nativo (Copilot, Gemini in Workspace)** — motivo: acesso a dados corporativos protegidos por API privada do fornecedor da suíte de produtividade; OSS não tem essa suíte para integrar.
- **Inferência ultra-rápida tipo Flash Answers (Cerebras)** — motivo: custo de infraestrutura de hardware dedicado (wafer-scale chips), inviável para self-host individual.
- **Geração de vídeo cinematográfico integrada ao chat (Sora, Grok Imagine, NotebookLM Video Overview)** — motivo: modelo proprietário fechado de altíssimo custo de treino/inferência; nenhum modelo OSS aberto chega perto em qualidade/custo.
- **Memória automática com síntese em background de alta precisão (ChatGPT Dreaming V3, Gemini Personal Context)** — motivo: acesso a volume massivo de histórico de usuários reais para calibrar; também custo de compute contínuo em background por usuário.
- **Deep Research com 100+ fontes e deliverables gerados (PPT/planilha/site) em um fluxo (Perplexity Labs, Comet)** — motivo: combinação de crawling em escala + agente de geração de documento + custo de compute por request, difícil de sustentar sem receita de assinatura em massa.
- **Browser agêntico nativo com modo agente full (Atlas, Comet, Claude in Chrome)** — motivo: custo de manter fork de Chromium + engenharia de segurança contra prompt injection em produção; superfície de ataque grande demais para projeto hobby manter atualizado.
- **Agentes multi-modelo orquestrados com debate/peer-review (Grok Ara Heavy)** — motivo: custo de compute (16 agentes em paralelo por request) inviável fora de provedor com margem de assinatura alta.
- **Garantia contratual auditável de não-treino sobre dados do usuário, inclusive perante provedores terceiros de LLM (Kagi)** — motivo: não é código, é acordo legal/comercial entre Kagi e OpenAI/Anthropic/Google; OSS self-host já resolve isso por padrão (dado nunca sai da máquina), mas não é "recurso" replicável, é ausência de necessidade.
- **App mobile companion dedicado para servidor local (LM Studio "Locally")** — motivo: custo de manter app mobile nativo (iOS/Android) com sync seguro até LAN/túnel; maioria dos projetos OSS não tem recurso de eng. mobile dedicada.
- **Tuning gerenciado sem infra própria (AI Studio PET tuning)** — motivo: acesso aos pesos e infraestrutura de treino do modelo fechado; OSS treina os próprios modelos abertos, mas não oferece "tuning as a service" sobre modelo de terceiro fechado.

## Armadilhas

- Confundir "Deep Research" com "web search simples": a diferença real está no *planejamento multi-passo* + *síntese com citação por trecho*, não no número de buscas — implementação ingênua vira busca+resumo raso e não convence usuário avançado.
- Memory/Personal Context sem escopo (projeto vs. global) cria vazamento de contexto entre tarefas não relacionadas — é a reclamação nº1 de usuários avançados de ChatGPT.
- Agent Mode/browser-use sem sandboxing forte é vetor de prompt injection via página web maliciosa — Atlas/Comet/Claude in Chrome tiveram CVEs documentados por isso; não é feature opcional, é pré-requisito de segurança.
- Citação obrigatória (Perplexity) parece trivial mas exige rastrear proveniência token-a-token do RAG até a resposta final — hackeada com regex de URL vira citação "decorativa" que não aponta pro trecho certo.
- Canvas/Artifacts sem versionamento explícito faz usuário perder edições ao regenerar — todo produto maduro guarda histórico de revisões do artifact.
- Créditos/tiers gateados sem telemetria de custo real por feature levam a subsidiar feature cara (deep research, vídeo) até o produto quebrar unit economics — replicar sem medir custo por chamada é armadilha financeira, não técnica.
- MCP connectors "genéricos" sem catálogo curado de segurança (permissões, escopo, revogação) viram superfície de exfiltração de dado corporativo.

## Ordem de construção

1. Chat core + Projects/knowledge base persistente (pré-requisito de tudo: sem contexto persistente, Memory/Agent/Deep Research não têm onde ancorar).
2. Memory (escopada por projeto primeiro, cross-chat depois — cross-chat exige indexação vetorial de todo histórico, mais caro).
3. Code execution sandboxed (Code Interpreter/Analysis tool) — pré-requisito técnico para Canvas/Artifacts avançados que rodam código gerado.
4. Canvas/Artifacts (documento vivo) — depende de (3) para features tipo apps interativos.
5. Connectors/MCP (Drive, GitHub, Slack) — depende de ter storage de credenciais e OAuth, é infraestrutura própria antes de qualquer "recurso de IA".
6. Deep Research (multi-step web + síntese citada) — depende de (5) para casos empresariais, mas versão web-only pode vir antes.
7. Agent Mode/browser-use — o mais caro e arriscado; só depois de sandboxing, rate-limiting e revisão de segurança madura nos itens anteriores.
8. Voice mode nativo (áudio-áudio) — subsistema separado (pipeline de áudio), pode ser paralelo desde o início mas não bloqueia os demais.
9. Marketplace/Custom bots (Store) — só faz sentido depois que Projects/Custom instructions já são sólidos internamente.
10. Billing/tiers/créditos — instrumentar desde o dia 1 (telemetria de custo por chamada), mas o *produto* de billing (paywalls, planos) só trava depois que se sabe o custo real de cada feature acima.

## Fontes

- https://windowsforum.com/threads/2026-chatgpt-cheat-sheet-multimodal-memory-and-tool-using-ai-for-work.409818/
- https://suprmind.ai/hub/chatgpt/features/
- https://www.datastudios.org/post/chatgpt-canvas-projects-update-export-options-deep-research-voice-mode-and-mobile-workflow
- https://help.openai.com/en/articles/11752874-chatgpt-agent
- https://openai.com/index/introducing-chatgpt-agent/
- https://openai.com/index/introducing-apps-in-chatgpt/
- https://the-decoder.com/developers-can-now-build-and-deploy-both-apps-and-agents-directly-on-the-chatgpt-platform/
- https://toolso.ai/blog/chatgpt-updates
- https://en.wikipedia.org/wiki/ChatGPT_Atlas
- https://emergingai.substack.com/p/claude-changed-the-july-2026-way
- https://suprmind.ai/hub/claude/features/
- https://claude.com/blog/bringing-mcp-2026-07-28-to-claude
- https://www.marktechpost.com/2026/06/14/claude-code-guide-2026-25-features-with-examples-demo/
- https://o-mega.ai/articles/claude-desktop-cowork-and-code-complete-guide
- https://graymatter.jamesgray.ai/p/claude-in-chrome
- https://www.itechguides.com/what-is-gemini-everything-you-need-to-know-about-googles-ai-chatbot-in-2026/
- https://suprmind.ai/hub/gemini/features/
- https://gemini.google/overview/gemini-live/
- https://9to5google.com/2025/08/13/gemini-personal-context/
- https://m.gsmarena.com/googles_gemini_now_supports_scheduled_actions-news-68154.php
- https://gagadget.com/en/708903-google-shut-down-project-mariner-and-folded-its-tech-into-gemini/
- https://www.digitalocean.com/resources/articles/what-is-notebooklm
- https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-studying-help/
- https://pasqualepillitteri.it/en/news/1697/notebooklm-april-2026-mobile-cinematic-video-gemini-sync
- https://www.analyticsvidhya.com/blog/2026/04/google-ai-studio-guide/
- https://www.testingcatalog.com/google-ai-studio-rolled-out-search-grounding-feature-for-real-time-response-accuracy-2/
- https://developers.googleblog.com/en/tune-gemini-pro-in-google-ai-studio-or-with-the-gemini-api/
- https://neuraplus-ai.github.io/blog/perplexity-ai-features-benefits-2026.html
- https://perplexityaimagazine.com/perplexity-hub/perplexity-ai-pricing-2026/
- https://beginnersinai.org/whats-new-perplexity-2026/
- https://seraphicsecurity.com/learn/ai-browser/perplexity-comet-browser-key-features-reviews-and-security-tips/
- https://www.perplexity.ai/changelog/what-we-shipped-july-18th
- https://www.gamsgo.com/blog/perplexity-labs-guide-for-fast-project-creation
- https://sidsaladi.substack.com/p/perplexity-finance-101-the-complete
- https://www.microsoft.com/en-us/microsoft-365/roadmap
- https://www.aguidetocloud.com/blog/microsoft-365-copilot-july-2026-updates/
- https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-notebooks--may-2026/4519838
- https://aufaittechnologies.com/blog/microsoft-copilot-agents/
- https://www.microsoft.com/en-us/microsoft-copilot/blog/copilot-studio/new-and-improved-computer-using-agents-a-new-workflows-experience-and-real-time-voice-experiences/
- https://www.microsoft.com/en-us/microsoft-365/blog/2026/04/22/copilots-agentic-capabilities-in-word-excel-and-powerpoint-are-generally-available/
- https://supersimple365.com/whats-new-in-microsoft-365-and-copilot-june-2026/
- https://mysummit.school/blog/en/grok-xai-review-2026/
- https://beginnersinai.org/whats-new-grok-2026/
- https://aibusinessweekly.net/p/grok-ai-capabilities
- https://aibusinessweekly.net/p/what-is-supergrok
- https://mistral.ai/news/le-chat-dives-deep/
- https://docs.mistral.ai/le-chat/knowledge-integrations/libraries
- https://techjacksolutions.com/ai-tools/mistral/how-to-use-mistral/
- https://en.wikipedia.org/wiki/Mistral_Vibe
- https://geotoolbox.ai/blog/deepseek-pricing
- https://chat-deep.ai/pricing/
- https://costgoat.com/pricing/deepseek-api
- https://aiwiki.ai/wiki/poe_ai_platform
- https://creator.poe.com/changelog?tag=canvas-apps
- https://perplexityaimagazine.com/ai-tools/poe-ai-review-2026/
- https://help.kagi.com/kagi/ai/assistant.html
- https://blog.kagi.com/assistant-for-all
- https://slashdot.org/software/p/T3-Chat/
- https://dotlane.ai/blog/dotlane-vs-t3-chat-comparison
- https://devstarsj.github.io/ai-tools/2026-06-10-Notion-AI-2026-Complete-Guide-AI-Powered-Workspace/
- https://www.kristian-larsen.com/info/notion-ai-guide/
- https://fazm.ai/blog/notion-automation-features-2026
- https://agentsai.fyi/agents/msty
- https://mljourney.com/msty-the-local-llm-app-that-lets-you-compare-models-side-by-side/
- https://codersera.com/blog/lm-studio-complete-guide-2026/
- https://convly.ai/lm-studio-complete-guide-2026/

---


---

# Anexo A — Linha de base `MESA`

As 361 funcionalidades cuja **ausência é percebida como defeito**. Não é o que diferencia sua ferramenta; é o que impede que ela pareça quebrada. Trate como orçamento mínimo antes de qualquer feature autoral.

## `CONV` — Conversa e UX da mensagem

| ID | Funcionalidade | Custo |
|---|---|---|
| CONV-01 | Streaming token-a-token | M |
| CONV-02 | Parar geração | S |
| CONV-03 | Continuar resposta truncada | M |
| CONV-04 | Regenerar resposta | S |
| CONV-06 | Editar mensagem do usuário | M |
| CONV-08 | Deletar mensagem individual | S |
| CONV-09 | Copiar mensagem (texto/markdown) | S |
| CONV-11 | Reações thumbs up/down | S |
| CONV-16 | Envio com Enter vs Shift+Enter configurável | S |
| CONV-17 | Indicador de "digitando"/thinking antes do primeiro token | S |
| CONV-19 | Branch implícito ao editar mensagem | M |
| CONV-20 | Navegação entre versões irmãs (setas < / >) | M |
| CONV-28 | Pastas de conversas | M |
| CONV-30 | Pin/fixar conversa | S |
| CONV-31 | Arquivar conversa | S |
| CONV-35 | Ordenação de lista (recente, alfabética, manual) | S |
| CONV-37 | Drag-and-drop entre pastas | S |
| CONV-39 | Busca full-text em títulos e mensagens | M |
| CONV-43 | Scroll infinito no histórico de conversas | S |
| CONV-47 | Auto-título gerado por LLM | M |
| CONV-48 | Renomear conversa manualmente | S |
| CONV-52 | Timestamp por mensagem | S |
| CONV-56 | Link público de conversa (read-only) | M |
| CONV-58 | Export para Markdown | S |
| CONV-59 | Export para JSON estruturado | S |
| CONV-65 | Chat temporário/incógnito (não salvo, sem memória) | M |
| CONV-70 | Renderização Markdown completa | M |
| CONV-71 | LaTeX/KaTeX inline e em bloco | M |
| CONV-72 | Highlight de sintaxe de código com botão copiar | M |
| CONV-73 | Renderização de tabelas Markdown | S |
| CONV-82 | Input multiline com auto-resize | S |
| CONV-84 | Upload via drag-and-drop | S |
| CONV-85 | Upload via paste (Ctrl+V de imagem/arquivo) | S |

## `MODEL` — Modelos, provedores e economia

| ID | Funcionalidade | Custo |
|---|---|---|
| MODEL-01 | Adaptador por provedor nativo | L |
| MODEL-02 | Endpoint OpenAI-compatible genérico | S |
| MODEL-03 | Base URL customizada por provedor | S |
| MODEL-11 | OpenRouter como meta-provedor | S |
| MODEL-13 | Suporte a streaming SSE e non-stream por provedor | M |
| MODEL-15 | Chave por instância (admin-only, compartilhada) | S |
| MODEL-18 | Chaves armazenadas em variável de ambiente | S |
| MODEL-23 | Mascaramento de chave na UI | S |
| MODEL-26 | Descoberta automática via `/v1/models` ou `/api/tags` | S |
| MODEL-27 | Curadoria manual de lista de modelos permitidos | S |
| MODEL-29 | Agrupamento por família/provedor no seletor | S |
| MODEL-30 | Metadados de context window por modelo | S |
| MODEL-38 | Busca/filtro no seletor de modelo | S |
| MODEL-39 | Modelo default por usuário | S |
| MODEL-42 | Descontinuação/depreciação sinalizada no catálogo | S |
| MODEL-44 | Retry com backoff exponencial | S |
| MODEL-55 | Temperature ajustável na UI | S |
| MODEL-56 | Top-p (nucleus sampling) | S |
| MODEL-59 | Frequency/presence penalty | S |
| MODEL-62 | Stop sequences customizadas | S |
| MODEL-63 | Max tokens de saída | S |
| MODEL-74 | Indicador visual de uso da janela de contexto | S |
| MODEL-76 | Truncamento automático do histórico (drop mais antigo) | M |
| MODEL-87 | Contagem de tokens com tokenizer correto por modelo | M |
| MODEL-99 | Barra de progresso e resumo de download | S |
| MODEL-104 | Configuração de n_ctx (janela de contexto do modelo carregado) | S |
| MODEL-106 | Hot-swap de modelo carregado | M |
| MODEL-107 | Descarregar modelo da memória (unload) | S |
| MODEL-111 | Modo servidor local expondo API OpenAI-compatible | M |

## `MODAL` — Multimodal: visão, imagem, áudio, voz, vídeo

| ID | Funcionalidade | Custo |
|---|---|---|
| MODAL-01 | Upload de imagem por arquivo | S |
| MODAL-02 | Paste de imagem (clipboard) | S |
| MODAL-03 | Drag-and-drop de imagem | S |
| MODAL-04 | Múltiplas imagens por mensagem | S |
| MODAL-10 | Câmera ao vivo (captura pontual) | M |
| MODAL-11 | Preview/thumbnail com zoom antes de enviar | S |
| MODAL-12 | Remoção seletiva de anexo | S |
| MODAL-14 | Geração via API proprietária (DALL-E/gpt-image) | M |
| MODAL-15 | Geração via Imagen/Nano Banana | M |
| MODAL-16 | Geração via Aurora/Grok Imagine | M |
| MODAL-21 | Escolha de aspect ratio/tamanho | S |
| MODAL-22 | Número de variações por prompt | S |
| MODAL-31 | Download de imagem gerada | S |
| MODAL-33 | Watermark/proveniência (C2PA/SynthID) | M |
| MODAL-35 | Botão de ditado (mic icon) | S |
| MODAL-40 | Browser Web Speech API | S |
| MODAL-42 | Push-to-talk | S |
| MODAL-45 | Detecção automática de idioma | M |
| MODAL-47 | Read-aloud da resposta (botão) | S |
| MODAL-48 | Seleção de voz | S |
| MODAL-49 | Controle de velocidade de fala | S |
| MODAL-57 | Download de áudio gerado | S |
| MODAL-62 | Indicador visual de escuta/fala | S |
| MODAL-66 | Upload de PDF | S |
| MODAL-67 | Upload de Office (docx/xlsx/pptx) | M |
| MODAL-70 | Upload de código-fonte com syntax highlight no preview | S |
| MODAL-71 | Limite de tamanho por arquivo/conta | S |
| MODAL-72 | Preview inline do arquivo | M |
| MODAL-74 | Múltiplos arquivos por mensagem | S |

## `RAG` — Conhecimento, retrieval e memória

| ID | Funcionalidade | Custo |
|---|---|---|
| RAG-01 | Upload de arquivo único/múltiplo | S |
| RAG-03 | Ingestão de URL única | S |
| RAG-06 | YouTube transcript ingestion | ? |
| RAG-08 | Colar texto diretamente | S |
| RAG-15 | Extração de texto nativo de PDF | S |
| RAG-20 | Parsing de DOCX/PPTX/XLSX nativo | M |
| RAG-21 | Remoção de boilerplate de HTML | M |
| RAG-25 | Chunking fixo por N tokens/caracteres | S |
| RAG-26 | Chunking recursivo | ? |
| RAG-27 | Chunking por sentença | S |
| RAG-31 | Overlap configurável entre chunks | S |
| RAG-38 | Escolha de modelo de embedding pelo usuário | M |
| RAG-41 | Normalização de vetor (L2) | S |
| RAG-43 | Vector store: pgvector | M |
| RAG-44 | Vector store: Chroma | M |
| RAG-45 | Vector store: Qdrant | M |
| RAG-46 | Vector store: Milvus | M |
| RAG-47 | Vector store: Weaviate | M |
| RAG-54 | Índice híbrido BM25 + vetor | M |
| RAG-56 | Top-k configurável | S |
| RAG-57 | Threshold de similaridade mínima | S |
| RAG-73 | Citação numerada inline | M |
| RAG-74 | Citação como agregado de trecho (não claim-a-claim) | S |
| RAG-83 | Grounding com busca web ao vivo (corpus não fechado) | M |
| RAG-87 | Coleções/knowledge bases nomeadas reutilizáveis | M |
| RAG-88 | Anexar coleção a um assistente/persona | M |
| RAG-89 | Anexar documento/coleção a uma conversa específica | S |
| RAG-90 | Escopo de conhecimento por projeto/workspace | M |
| RAG-100 | Provedor Brave Search API ("Data for AI") | S |
| RAG-103 | Provedor Serper (Google SERP scraper) | S |
| RAG-105 | Provedor Bing Search API / Azure AI Search | S |
| RAG-107 | Agregadores de SERP (SerpApi/SearchApi/Serply/serpstack) | S |
| RAG-109 | Busca web automática (modelo decide) | L |
| RAG-110 | Busca web manual (toggle do usuário) | S |
| RAG-112 | Número de resultados configurável (top-K) | S |
| RAG-115 | Apenas snippet/meta description | S |
| RAG-116 | Citação de fonte web inline na resposta | M |
| RAG-125 | Extração automática de fatos sobre o usuário | L |
| RAG-126 | Edição/deleção de memória individual pelo usuário | M |
| RAG-129 | Modo incógnito/temporário sem memória nem histórico | S |
| RAG-132 | Instruções customizadas globais (system prompt persistente) | S |
| RAG-135 | Conector Google Drive | M |
| RAG-137 | Conector Slack | M |
| RAG-138 | Conector Notion | M |
| RAG-139 | Conector Confluence | M |
| RAG-140 | Conector Jira | M |
| RAG-141 | Conector GitHub | M |
| RAG-142 | Conector Gmail | M |
| RAG-147 | Sincronização incremental (delta sync) | L |

## `TOOL` — Ferramentas, MCP e agentes

| ID | Funcionalidade | Custo |
|---|---|---|
| TOOL-01 | Tool schema JSON (function calling nativo) | M |
| TOOL-05 | Validação de argumento contra JSON Schema | S |
| TOOL-07 | Exibição do call e do resultado na UI | S |
| TOOL-08 | Colapso/expansão do bloco de tool call | S |
| TOOL-11 | Limite de iterações do loop de tool | S |
| TOOL-14 | Cliente MCP | L |
| TOOL-15 | Transporte stdio | M |
| TOOL-17 | Transporte Streamable HTTP | M |
| TOOL-21 | Toggle de servidor MCP inteiro (on/off) | S |
| TOOL-34 | Auth por header estático (API key) | S |
| TOOL-40 | Container efêmero por execução (Docker/gVisor/Firecracker) | L |
| TOOL-42 | Persistência de estado entre execuções na mesma sessão | M |
| TOOL-43 | Upload de arquivo para o sandbox | M |
| TOOL-44 | Download de artefato gerado pelo sandbox | M |
| TOOL-45 | Gráfico matplotlib/plot renderizado inline | M |
| TOOL-47 | Limite de tempo de execução (timeout) | S |
| TOOL-48 | Limite de memória do container | S |
| TOOL-49 | Isolamento de rede do sandbox (sem acesso à internet) | M |
| TOOL-63 | Loop de iteração com critério de parada | M |
| TOOL-72 | Budget de tokens/passos por execução | S |
| TOOL-73 | Cancelamento de execução de agente em curso | S |
| TOOL-75 | Builder visual de DAG (drag-and-drop de nós) | L |
| TOOL-76 | Nó condicional (if/else, switch) | M |
| TOOL-79 | Variáveis compartilhadas entre nós | M |
| TOOL-80 | Disparo por webhook | M |
| TOOL-81 | Disparo agendado (cron) | S |
| TOOL-92 | Execução persiste com o app/browser fechado | M |
| TOOL-95 | Confirmação obrigatória em ação destrutiva | S |

## `ART` — Artifacts, canvas e generative UI

| ID | Funcionalidade | Custo |
|---|---|---|
| ART-01 | Painel lateral separado do chat | M |
| ART-03 | Tipos de artifact: código com syntax highlight | S |
| ART-04 | Tipos de artifact: Markdown/documento | S |
| ART-05 | Tipos de artifact: HTML renderizado | M |
| ART-13 | Download do artifact | S |
| ART-14 | Copiar conteúdo do artifact | S |
| ART-20 | Fechar/reabrir/minimizar painel sem perder estado | S |
| ART-21 | Sandbox iframe para HTML/JS | M |
| ART-26 | Isolamento via `sandbox` attribute do iframe | S |
| ART-28 | Preview de SVG isolado | S |
| ART-33 | Edição direta pelo usuário no texto do artifact | M |
| ART-42 | Edição simultânea modelo+humano sem lock | M |
| ART-43 | Undo/redo dentro do canvas | S |
| ART-44 | Contagem de palavras/caracteres ao vivo | S |
| ART-46 | Edição de código com syntax highlight no canvas | M |
| ART-49 | Adicionar comentários explicativos ao código | S |
| ART-50 | Corrigir bugs (fix) | M |
| ART-82 | Revogar/despublicar artifact | S |
| ART-83 | Renderização Mermaid nativa | S |
| ART-87 | Export de diagrama para PNG | S |
| ART-88 | Export de diagrama para SVG vetorial | S |
| ART-89 | Zoom/pan interativo no diagrama renderizado | S |

## `PROMPT` — Prompts, personas e assistentes

| ID | Funcionalidade | Custo |
|---|---|---|
| PROMPT-01 | System prompt global | S |
| PROMPT-04 | System prompt por assistente/persona | M |
| PROMPT-06 | Variáveis dinâmicas de data/hora | S |
| PROMPT-12 | Campo "como me chamar" | S |
| PROMPT-13 | Campo "o que você faz" (ocupação/contexto) | S |
| PROMPT-14 | Preferências de tom de resposta | S |
| PROMPT-16 | Nível de detalhe/verbosidade configurável | S |
| PROMPT-17 | Idioma de resposta preferido | S |
| PROMPT-18 | Regras/restrições livres ("o que evitar") | S |
| PROMPT-19 | Aplicação automática em toda conversa nova | S |
| PROMPT-23 | Salvar prompt reutilizável | S |
| PROMPT-26 | Busca na biblioteca de prompts | S |
| PROMPT-29 | Tipos de variável: texto simples | S |
| PROMPT-41 | Slash command dispara prompt salvo | M |
| PROMPT-42 | Comando customizado definido pelo usuário | M |
| PROMPT-43 | Autocomplete de comandos no composer | M |
| PROMPT-47 | Criar assistente com nome, ícone e descrição | M |
| PROMPT-48 | Campo de instruções/comportamento do assistente | M |
| PROMPT-49 | Anexar conhecimento/arquivos ao assistente | M |
| PROMPT-52 | Conversation starters | S |
| PROMPT-57 | Publicar interno (equipe/org) vs. público (todos) | M |
| PROMPT-58 | Loja/diretório de assistentes públicos | L |
| PROMPT-59 | Categorias no marketplace | M |
| PROMPT-60 | Busca e ranking no marketplace | M |
| PROMPT-61 | Instalação/uso com um clique | S |
| PROMPT-67 | Projeto agrupando conversas+arquivos+instruções | L |
| PROMPT-68 | Instruções específicas do projeto (override do global) | M |
| PROMPT-71 | Limite/capacidade de arquivos por projeto | S |
| PROMPT-73 | Fluxos pré-montados de tarefa comum (resumir, traduzir, revisar código) | M |
| PROMPT-74 | One-click action sobre a resposta gerada (reescrever, encurtar, expandir) | M |

## `ADMIN` — Multiusuário, governança e billing

| ID | Funcionalidade | Custo |
|---|---|---|
| ADMIN-01 | Login e-mail+senha | S |
| ADMIN-03 | OAuth social Google | S |
| ADMIN-13 | Sessão + refresh token | S |
| ADMIN-15 | Política de senha configurável | S |
| ADMIN-16 | Bloqueio por tentativa (rate limit de login) | S |
| ADMIN-19 | API key de usuário | S |
| ADMIN-22 | Papéis fixos admin/user/pending | S |
| ADMIN-24 | Grupos de usuários | M |
| ADMIN-26 | Permissão por modelo | M |
| ADMIN-30 | Workspaces/organizações | L |
| ADMIN-37 | Registro aberto (self-signup) | S |
| ADMIN-38 | Registro só por convite | S |
| ADMIN-40 | Domínio de e-mail permitido (allowlist) | S |
| ADMIN-41 | Desativar usuário sem deletar | S |
| ADMIN-43 | Exclusão de conta com purga de dados | M |
| ADMIN-46 | Limite de mensagens por período | M |
| ADMIN-50 | Rate limit por usuário/grupo (req/min) | S |
| ADMIN-55 | Dashboard de uso agregado | M |
| ADMIN-67 | Moderação de entrada (input) | M |
| ADMIN-68 | Moderação de saída (output) | M |
| ADMIN-76 | Bloqueio de upload por tipo de arquivo | S |
| ADMIN-87 | Criptografia em repouso | M |
| ADMIN-90 | Painel admin GUI | M |
| ADMIN-91 | Configuração via YAML/arquivo | S |
| ADMIN-92 | Configuração via env vars | S |
| ADMIN-101 | Planos com tiers (free/pro/team/enterprise) | L |
| ADMIN-102 | Assinatura recorrente (subscription) | M |
| ADMIN-103 | Medição de uso (metering) | M |
| ADMIN-104 | Cobrança por seat | S |
| ADMIN-107 | Integração Stripe (checkout/portal) | M |
| ADMIN-108 | Trial gratuito com limite de tempo/uso | S |
| ADMIN-110 | Invoice / nota fiscal automática | S |
| ADMIN-111 | Upgrade/downgrade de plano self-serve | M |
| ADMIN-112 | Limite de plano bloqueando funcionalidade | S |
| ADMIN-113 | Self-serve vs sales-led (enterprise sob consulta) | ? |

## `DEV` — Extensibilidade, API e deploy

| ID | Funcionalidade | Custo |
|---|---|---|
| DEV-09 | Custom endpoint config (YAML) apontando p/ API externa | S |
| DEV-12 | API key "user_provided" por endpoint | S |
| DEV-22 | Instalação de plugin via UI (URL de manifest) | S |
| DEV-26 | Endpoint OpenAI-compatible exposto (`/v1/chat/completions`) | M |
| DEV-34 | API REST completa de terceiros (Claude API, Gemini API) | ? |
| DEV-36 | SSE público para streaming de resposta | M |
| DEV-38 | SDK oficial (Python/JS) para a API do produto | ? |
| DEV-39 | Rate limit documentado por tier de API key | ? |
| DEV-40 | Versionamento de API (path ou header) | S |
| DEV-48 | Tema claro/escuro/sistema | S |
| DEV-52 | Logo e favicon customizáveis | S |
| DEV-53 | Nome do produto customizável (rebranding de app name) | S |
| DEV-59 | Dezenas de idiomas de UI suportados | L |
| DEV-60 | Detecção automática de idioma do navegador | S |
| DEV-62 | Tradução contribuída pela comunidade (crowdsourced) | M |
| DEV-64 | Formato de data/número por locale | S |
| DEV-66 | Export completo de conversas em JSON | S |
| DEV-69 | Backup/restore de banco completo (arquivo único) | S |
| DEV-73 | `docker run` single container | S |
| DEV-74 | Docker Compose multi-serviço | S |
| DEV-77 | Instalação via pip/npm | S |
| DEV-79 | Suporte multi-arquitetura ARM/x86 | M |
| DEV-80 | GPU passthrough documentado (CUDA/ROCm/Metal) | M |
| DEV-83 | Variáveis de ambiente documentadas exaustivamente | S |
| DEV-84 | Health check endpoint | S |
| DEV-86 | Hot reload em dev (frontend+backend) | S |
| DEV-88 | Ambiente de dev completo via Docker Compose | S |
| DEV-91 | CI com lint+test+build em PR | S |
| DEV-92 | Guia de contribuição documentado (CONTRIBUTING) | S |

## `CLIENT` — Plataformas de cliente

| ID | Funcionalidade | Custo |
|---|---|---|
| CLIENT-01 | Layout responsivo mobile | S |
| CLIENT-02 | PWA instalável | S |
| CLIENT-05 | Atalho de teclado global na página (cmd+K) | S |
| CLIENT-07 | Deep link direto para conversa (URL por chat ID) | S |
| CLIENT-11 | Modo standalone sem chrome de navegador (display:standalone) | S |
| CLIENT-12 | Framework Electron | L |
| CLIENT-17 | Ícone na tray/menu bar | S |
| CLIENT-18 | Iniciar com o sistema (launch at login) | S |
| CLIENT-19 | Auto-update em background | M |
| CLIENT-30 | Instalador nativo por OS (dmg/exe/AppImage) sem loja | S |
| CLIENT-31 | App nativo iOS | XL |
| CLIENT-32 | App nativo Android | XL |
| CLIENT-33 | Sync automático de histórico com a versão web | M |
| CLIENT-36 | Share sheet (receber texto/imagem de outro app) | M |
| CLIENT-38 | Captura de câmera direta no chat | S |
| CLIENT-45 | Sidebar de chat em qualquer página | M |
| CLIENT-48 | Seleção de texto → menu de ação rápida | M |
| CLIENT-52 | Atalho de teclado dedicado da extensão | S |
| CLIENT-53 | Item no menu de contexto (botão direito) | S |
| CLIENT-70 | Menção seletiva (@bot) vs. escuta passiva de canal | S |
| CLIENT-71 | Sync de histórico entre dispositivos via conta na nuvem | L |
| CLIENT-76 | Export/import de histórico entre instâncias | S |

## `OPS` — Infraestrutura e encanamento invisível

| ID | Funcionalidade | Custo |
|---|---|---|
| OPS-01 | SSE como transporte de streaming | S |
| OPS-04 | Reconexão automática de SSE nativa | S |
| OPS-08 | Cancelamento propagado até o provedor (abort real) | S |
| OPS-11 | Buffering vs flush imediato por token/chunk | S |
| OPS-12 | Desabilitar buffering de proxy (nginx `X-Accel-Buffering`) | S |
| OPS-13 | Timeout de gateway configurado para streams longos | S |
| OPS-17 | SQLite como storage default self-host | S |
| OPS-18 | Postgres como storage de produção | M |
| OPS-20 | Schema de conversa/mensagem normalizado | M |
| OPS-23 | Migrações de schema versionadas | S |
| OPS-26 | Blob storage local para anexos | S |
| OPS-30 | Exportação de conversa (JSON/Markdown/PDF) | S |
| OPS-31 | Paginação/cursor de histórico de conversas | S |
| OPS-32 | Retry com backoff exponencial e jitter | S |
| OPS-33 | Classificação de erro retryável vs fatal | S |
| OPS-34 | Respeito ao header `Retry-After` em 429 | S |
| OPS-36 | Timeout configurável por provedor/modelo | S |
| OPS-42 | Tokenizer exato por família de modelo | M |
| OPS-44 | Contagem de tokens server-side autoritativa | S |
| OPS-56 | Log estruturado (JSON) de requisições | S |
| OPS-62 | Health check de endpoints/provedores | S |
| OPS-69 | Coleta de feedback do usuário ligada ao trace (thumbs up/down) | S |
| OPS-75 | Controle de re-render durante streaming token-a-token | M |
| OPS-78 | Scroll automático que respeita interação do usuário | S |
| OPS-79 | Memoização de componentes de mensagem estáticos | S |
| OPS-83 | Sanitização de HTML/Markdown gerado pelo modelo (anti-XSS) | S |
| OPS-84 | Content-Security-Policy restritiva | S |
| OPS-85 | Proteção contra SSRF em fetch de URL solicitada pelo usuário (web browsing/tool) | M |
| OPS-86 | Validação de upload malicioso (magic bytes, tamanho, tipo) | S |
| OPS-87 | Prevenção de path traversal em nomes de arquivo | S |
| OPS-88 | Redação de secrets em logs | S |
| OPS-89 | Proteção CSRF em endpoints de mutação | S |
| OPS-92 | Rate limiting por usuário/IP em endpoints públicos | M |
| OPS-96 | Modelo barato para tarefas internas (auto-título, resumo curto) | S |
| OPS-98 | Backend stateless com estado externalizado | M |

## `CLOSED` — Fronteira proprietária

| ID | Funcionalidade | Custo |
|---|---|---|
| CLOSED-01 | Projects com Project Memory isolada | M |
| CLOSED-07 | Canvas (documento colaborativo lado a lado) | L |
| CLOSED-13 | Code Interpreter / execução de código sandboxed | L |
| CLOSED-18 | Modo temporário (chat sem memória/histórico) | S |
| CLOSED-21 | Projects com Knowledge base persistente | M |
| CLOSED-29 | Files API | M |
| CLOSED-30 | Analysis tool (execução JS sandboxed para dados) | M |
| CLOSED-35 | Gems (assistentes customizados persistentes) | M |
| CLOSED-40 | Integração nativa Workspace (side panel) | XL |
| CLOSED-49 | AI Studio: Structured Output / JSON schema forçado | S |
| CLOSED-51 | Spaces (pasta de projeto com instruções + colaboradores) | M |
| CLOSED-53 | Pro Search (multi-step, 10-20 fontes) | M |
| CLOSED-56 | Citação obrigatória inline em toda resposta | M |
| CLOSED-72 | Relatórios de uso admin granulares por app | L |
| CLOSED-84 | Thinking mode seletivo por chamada (DeepSeek V4) | M |
| CLOSED-99 | LM Studio: servidor local API-compatível OpenAI | M |
| CLOSED-102 | Tiers escalonados com features gateadas (Free/Plus/Pro/Team/Enterprise) | L |
| CLOSED-103 | Limite de mensagens/janela de tempo por tier | M |
| CLOSED-106 | Planos Enterprise/Edu com SSO, DLP, retenção de dados customizável | XL |
| CLOSED-107 | Paridade mobile quase completa com desktop (voz, agent, canvas) | L |

---

# Anexo B — Fronteira `FRONT`

As 251 funcionalidades que poucos produtos têm em ago/2026. É aqui que mora diferenciação real — e a maior parte do custo `L`/`XL`. Escolher 2 ou 3 destas e executá-las bem vale mais que cobrir cinquenta `DIFF`.

## `CONV` — Conversa e UX da mensagem

| ID | Funcionalidade | Custo |
|---|---|---|
| CONV-13 | Comentário/anotação em mensagem | M |
| CONV-15 | Stream resumível pós-refresh | L |
| CONV-21 | Árvore de conversa visível/navegável | XL |
| CONV-22 | Escopo de fork configurável (só caminho visível / com branches relacionados / tudo) | L |
| CONV-23 | "Start fork here" (fork prospectivo) | M |
| CONV-34 | Cor/ícone customizado por pasta ou conversa | S |
| CONV-40 | Busca semântica sobre histórico | L |
| CONV-45 | Timeline/linha do tempo de atividade | M |
| CONV-55 | Metadados de parâmetros usados (temperature, top_p, etc.) por mensagem | M |
| CONV-63 | Embed de conversa em página externa (iframe/widget) | L |
| CONV-67 | Split view com duas conversas simultâneas | L |
| CONV-68 | Chat paralelo em múltiplos modelos com prompt sincronizado | L |
| CONV-69 | Modo "sync desligado" em split (inputs independentes) | S |
| CONV-77 | Exibição colapsável de reasoning/thinking tokens | L |
| CONV-78 | Streaming de reasoning separado da resposta final | L |
| CONV-81 | Renderização de HTML/SVG sandboxado inline | M |
| CONV-90 | Autocomplete de prompt/texto | L |
| CONV-95 | Envio agendado/scheduled | L |
| CONV-98 | Remapeamento de atalhos (customização) | M |
| CONV-100 | Navegação só por teclado (sem mouse) ponta a ponta | L |
| CONV-103 | Atalhos globais (funcionam com app minimizado) | M |

## `MODEL` — Modelos, provedores e economia

| ID | Funcionalidade | Custo |
|---|---|---|
| MODEL-20 | Vault externo (Hashicorp Vault, AWS Secrets Manager) | L |
| MODEL-22 | Rotação de chave com múltiplas chaves ativas | M |
| MODEL-25 | Chave temporária/efêmera por sessão | M |
| MODEL-50 | Modo "auto"/router de complexidade (modelo pequeno decide) | XL |
| MODEL-51 | Roteamento semântico por tipo de tarefa | XL |
| MODEL-64 | Logit bias | M |
| MODEL-67 | Reasoning effort (low/medium/high) | M |
| MODEL-68 | Thinking budget / extended thinking tokens | M |
| MODEL-69 | Verbosity control | S |
| MODEL-78 | Sumarização automática de histórico antigo | L |
| MODEL-79 | Seleção manual de quais mensagens entram no contexto | M |
| MODEL-80 | Prompt caching explícito (cache_control breakpoints) | M |
| MODEL-83 | Cache TTL configurável (5min vs 1h) | S |
| MODEL-85 | Compressão de contexto (compactação semântica, não sumarização textual) | XL |
| MODEL-97 | Diferenciação de custo cache write vs cache read vs miss no cálculo | M |
| MODEL-101 | Sugestão de quantização por RAM/VRAM disponível | L |
| MODEL-110 | Estimativa de uso de memória antes de carregar | M |
| MODEL-113 | Envio do mesmo prompt a N modelos em paralelo | M |
| MODEL-114 | Layout lado-a-lado (split view) de respostas | M |
| MODEL-115 | Merge/síntese automática de respostas ("Beam") | L |
| MODEL-116 | Modo guiado de merge (usuário escolhe trechos a combinar) | L |
| MODEL-117 | Arena/votação entre respostas anônimas | L |
| MODEL-118 | Diff textual entre respostas de modelos distintos | M |
| MODEL-119 | Ranking histórico de performance por modelo (Elo-like) | L |

## `MODAL` — Multimodal: visão, imagem, áudio, voz, vídeo

| ID | Funcionalidade | Custo |
|---|---|---|
| MODAL-08 | OCR local pré-envio | M |
| MODAL-13 | Paste de screenshot com PII redaction automática | L |
| MODAL-29 | Edição iterativa conversacional | M |
| MODAL-32 | Referência de estilo/composição multi-imagem | M |
| MODAL-44 | Diarização de locutor | L |
| MODAL-56 | Highlight de palavra sendo falada | L |
| MODAL-58 | Modo de voz contínuo full-duplex | XL |
| MODAL-59 | Interrupção/barge-in | L |
| MODAL-60 | API realtime dedicada (WebSocket/WebRTC) | XL |
| MODAL-61 | Otimização de latência de primeira palavra | XL |
| MODAL-64 | Chamada de vídeo com o modelo | XL |
| MODAL-65 | Compartilhamento de tela em tempo real | XL |
| MODAL-80 | Geração de vídeo via Sora | XL |
| MODAL-81 | Geração de vídeo via Veo | XL |
| MODAL-82 | Geração de vídeo via Grok Imagine | XL |
| MODAL-84 | Geração de música/áudio a partir de prompt | XL |
| MODAL-85 | Podcast de dois locutores (audio overview) | XL |

## `RAG` — Conhecimento, retrieval e memória

| ID | Funcionalidade | Custo |
|---|---|---|
| RAG-12 | Prune de dados obsoletos | M |
| RAG-13 | Detecção de mudança/delta | XL |
| RAG-14 | ACL/permission sync na ingestão | XL |
| RAG-19 | Descrição de imagens dentro do PDF via VLM | XL |
| RAG-22 | Parsing de código-fonte com AST/estrutura | XL |
| RAG-28 | Chunking semântico (por similaridade) | L |
| RAG-30 | Late chunking (embed doc inteiro, depois split) | XL |
| RAG-33 | Chunking Q&A (par pergunta-resposta como unidade) | L |
| RAG-34 | Chunking "single chunk" | S |
| RAG-37 | Merge de chunks pequenos (min size target) | ? |
| RAG-40 | Configuração de dimensão do vetor | ? |
| RAG-61 | HyDE (Hypothetical Document Embeddings) | ? |
| RAG-62 | Multi-query retrieval | M |
| RAG-64 | GraphRAG (grafo de conhecimento) | XL |
| RAG-65 | RAPTOR (árvore hierárquica de sumarização) | XL |
| RAG-67 | Auto-merge de chunks vizinhos recuperados | ? |
| RAG-68 | Contexto de janela ao redor do chunk retornado | M |
| RAG-70 | Retrieval sem vector DB tradicional (long-context grounding) | XL |
| RAG-77 | Preview em hover da citação | S |
| RAG-79 | Verificação de suporte da claim vs. fonte | XL |
| RAG-81 | Aviso de resposta não fundamentada em fonte | M |
| RAG-84 | Citações estruturadas com metadados semânticos (schema tipado) | M |
| RAG-96 | Filtragem de retrieval por metadados customizados | L |
| RAG-111 | Modo agentic search (multi-hop, segue links) | XL |
| RAG-118 | Deep Research — Perplexity | XL |
| RAG-119 | Deep Research — Company Knowledge (ChatGPT) | XL |
| RAG-120 | Deep Research Agent (Gemini) | XL |
| RAG-122 | Busca combinando fontes privadas + web na mesma consulta | XL |
| RAG-130 | Exportação/portabilidade de memória entre produtos | L |
| RAG-148 | ACL da fonte propagada ao índice (permission-aware retrieval) | XL |
| RAG-151 | External groups / mapeamento de grupos não-Entra | XL |
| RAG-153 | Diretório/marketplace de conectores | XL |
| RAG-154 | Conector como plugin externo (MCP como padrão) | XL |

## `TOOL` — Ferramentas, MCP e agentes

| ID | Funcionalidade | Custo |
|---|---|---|
| TOOL-13 | Cache de resultado de tool determinística | M |
| TOOL-18 | Autorização OAuth de servidor MCP remoto (spec 2025-06-18) | L |
| TOOL-24 | Sandbox de servidor MCP stdio | L |
| TOOL-27 | MCP Sampling | L |
| TOOL-28 | MCP Elicitation | L |
| TOOL-29 | MCP Apps / mcp-ui (UI interativa embutida) | L |
| TOOL-53 | Execução programática de tools via código (orquestração no sandbox) | L |
| TOOL-56 | Loop navegação+screenshot ("Computer Use") | XL |
| TOOL-59 | Controle de desktop completo (não só browser) | XL |
| TOOL-60 | Gravação e replay de sessão de automação | L |
| TOOL-62 | Classificador de prompt injection em screenshot | L |
| TOOL-66 | Subagentes com contexto próprio (janela isolada) | L |
| TOOL-67 | Delegação explícita entre agentes (handoff) | L |
| TOOL-69 | Agent Skills (instruções + scripts empacotados) | L |
| TOOL-82 | Human-in-the-loop com aprovação (pausa+resume) | L |
| TOOL-88 | Agente de longa duração (horas, multi-sessão) | XL |
| TOOL-93 | Detecção de prompt injection via conteúdo de tool | L |

## `ART` — Artifacts, canvas e generative UI

| ID | Funcionalidade | Custo |
|---|---|---|
| ART-10 | Diff visual entre versões | M |
| ART-19 | Artifact com "inteligência embutida" (chama o modelo de dentro) | XL |
| ART-31 | Preview full-stack com backend real (Node/DB) | XL |
| ART-32 | Proxy de rede para chamadas externas do iframe sandboxado | L |
| ART-45 | Comparação de nível de leitura (readability score) | S |
| ART-53 | Terminal embutido no canvas | L |
| ART-57 | Mapa interativo renderizado | L |
| ART-59 | Kanban renderizado e editável | L |
| ART-60 | Formulário gerado dinamicamente | M |
| ART-62 | Planilha editável (spreadsheet) | L |
| ART-63 | Slides/apresentação gerados e editáveis | L |
| ART-64 | Diagrama editável (não só visualização estática) | L |
| ART-67 | Componente de UI retornado por tool call e renderizado inline | L |
| ART-68 | mcp-ui: recurso `ui://` com iframe + bridge JSON-RPC | L |
| ART-69 | Widget interativo que devolve resposta/ação ao modelo | L |
| ART-70 | Formulário de confirmação antes de ação sensível | M |
| ART-71 | Seletor/picker renderizado pelo tool | M |
| ART-72 | SDK server-side multi-linguagem para criar UI resources | M |
| ART-73 | Renderer web component standalone (`<ui-resource-renderer>`) | S |
| ART-74 | Deep link/intent disparado pela UI embutida | S |
| ART-75 | Skills + UI empacotados como plugin distribuível | L |
| ART-77 | Deploy com backend real em infra gerenciada (one-click) | XL |
| ART-80 | Incorporar (embed) artifact em outro site | M |
| ART-85 | Renderização Graphviz/DOT | M |
| ART-86 | Integração Excalidraw (diagrama à mão livre editável) | L |

## `PROMPT` — Prompts, personas e assistentes

| ID | Funcionalidade | Custo |
|---|---|---|
| PROMPT-08 | Variável de timezone do usuário | S |
| PROMPT-10 | Preview do prompt final montado | M |
| PROMPT-11 | Contagem de tokens do system prompt | M |
| PROMPT-22 | Geração automática de instruções a partir de amostra de escrita do usuário | M |
| PROMPT-33 | Tipos de variável: arquivo anexado | L |
| PROMPT-35 | Modificadores de contexto em variável (ex. truncamento de histórico) | M |
| PROMPT-36 | Prompt encadeado (chain de prompts) | L |
| PROMPT-37 | Versionamento de prompt | M |
| PROMPT-45 | Comando que troca modelo/assistente ativo | M |
| PROMPT-56 | Versionar assistente (histórico de configs) | L |
| PROMPT-66 | Import de GPT do ChatGPT para outra plataforma | L |
| PROMPT-76 | Quick actions configuráveis pelo usuário | M |
| PROMPT-80 | Banco de casos de teste (test cases) para avaliação de prompt | L |
| PROMPT-81 | Grading manual de qualidade de resposta (escala numérica) | M |
| PROMPT-82 | Prompt optimizer automático (IA reescreve o prompt) | L |
| PROMPT-83 | Salvar resultado de teste/iteração como referência | M |

## `ADMIN` — Multiusuário, governança e billing

| ID | Funcionalidade | Custo |
|---|---|---|
| ADMIN-10 | SCIM 2.0 provisioning | L |
| ADMIN-12 | Passkeys/WebAuthn | M |
| ADMIN-23 | Papéis customizados | L |
| ADMIN-31 | Multi-tenancy real (SaaS) | XL |
| ADMIN-32 | Isolamento de dados entre tenants | L |
| ADMIN-33 | Delegação de admin (system grants) | M |
| ADMIN-45 | Desprovisionamento automático via SCIM | L |
| ADMIN-62 | Audit log imutável de ações admin | L |
| ADMIN-63 | Push de logs para SIEM | L |
| ADMIN-66 | Compliance API dedicada (separada de analytics) | L |
| ADMIN-71 | Detecção e redação de PII | L |
| ADMIN-72 | DLP (Data Loss Prevention) integrado | XL |
| ADMIN-73 | Classificação de sensibilidade de documento | L |
| ADMIN-75 | Watermark de conteúdo gerado | L |
| ADMIN-82 | Residência de dados configurável | XL |
| ADMIN-83 | Residência de inferência (processing geo) | XL |
| ADMIN-84 | Conformidade com EU AI Act | XL |
| ADMIN-85 | Zero Data Retention (ZDR) com provedor | ? |
| ADMIN-88 | KMS / chave gerenciada pelo cliente (BYOK) | L |
| ADMIN-89 | Deploy air-gapped / on-prem isolado | XL |

## `DEV` — Extensibilidade, API e deploy

| ID | Funcionalidade | Custo |
|---|---|---|
| DEV-08 | Rich UI embedding via plugin (HTML/iframe) | M |
| DEV-13 | Plugin decoupled runtime (processo isolado) | XL |
| DEV-14 | Marketplace de plugin com review de código | XL |
| DEV-15 | Tipos de plugin diferenciados (Tool/Model/Agent Strategy/Extension/Datasource/Trigger) | L |
| DEV-31 | GPT Actions via schema OpenAPI 3.1 | M |
| DEV-33 | Responses API (sucessor do Assistants) | L |
| DEV-56 | Fontes customizáveis | S |
| DEV-58 | Layout alternativo (bolha de conversa vs documento contínuo) | M |
| DEV-63 | Pipeline de tradução automatizada (CLI/CI) | L |

## `CLIENT` — Plataformas de cliente

| ID | Funcionalidade | Custo |
|---|---|---|
| CLIENT-08 | Web Share Target API | M |
| CLIENT-14 | App nativo (Swift/C++ puro, sem webview embutido) | XL |
| CLIENT-20 | Ação de IA sobre seleção de texto em qualquer app | L |
| CLIENT-23 | Atalho por aplicativo (contexto ciente do app ativo) | L |
| CLIENT-26 | Acesso a filesystem local (ler/escrever arquivos do usuário) | L |
| CLIENT-28 | Terminal integrado na janela de chat | L |
| CLIENT-29 | Diff viewer nativo para edições de código | M |
| CLIENT-40 | Modelo local no dispositivo (offline real) | XL |
| CLIENT-42 | Integração CarPlay/Android Auto | L |
| CLIENT-43 | App companion de navegador agentivo mobile (browser IA completo) | XL |
| CLIENT-44 | Cross-device task handoff (iniciar no mobile, monitorar/continuar em outro device) | L |
| CLIENT-50 | Substituição de texto inline em qualquer input (rewrite in place) | L |
| CLIENT-55 | Modelo local via extensão (Ollama bridge) | M |
| CLIENT-73 | Sync criptografado ponta-a-ponta | XL |
| CLIENT-74 | Resolução de conflito de edição concorrente (multi-device) | L |
| CLIENT-79 | Aceleração nativa Apple Silicon/MLX | L |
| CLIENT-86 | Uso via Termux no Android | M |

## `OPS` — Infraestrutura e encanamento invisível

| ID | Funcionalidade | Custo |
|---|---|---|
| OPS-05 | Resumo de stream (resumable stream) via buffer server-side | L |
| OPS-07 | Múltiplas abas assistindo à mesma geração em paralelo | L |
| OPS-15 | Streaming de "thinking"/reasoning separado do conteúdo final | M |
| OPS-16 | Streaming de tool calls parcial (function call incremental) | M |
| OPS-40 | Failover automático entre múltiplos provedores/keys | L |
| OPS-55 | Integração com Braintrust | L |
| OPS-65 | Eval automatizado em pipeline (CI) | L |
| OPS-67 | Detecção de regressão de prompt | L |
| OPS-68 | A/B de modelo em produção | L |
| OPS-71 | Métrica de groundedness (RAG) | M |
| OPS-73 | Replay de traces de produção como casos de teste | L |
| OPS-90 | Isolamento de prompt injection vindo de conteúdo de ferramenta/documento | L |
| OPS-91 | Sandbox isolado para execução de código (code interpreter) | XL |
| OPS-94 | Cache semântico | M |
| OPS-100 | Pub/sub entre réplicas para eventos de stream compartilhado | L |

## `CLOSED` — Fronteira proprietária

| ID | Funcionalidade | Custo |
|---|---|---|
| CLOSED-02 | Memory automática ("Dreaming V3") | XL |
| CLOSED-08 | Advanced Voice Mode (áudio nativo) | XL |
| CLOSED-09 | Agent Mode / Operator (navegação web autônoma) | XL |
| CLOSED-11 | Apps SDK (apps de terceiros dentro do chat) | XL |
| CLOSED-14 | Sora (geração de vídeo integrada ao chat) | XL |
| CLOSED-16 | Company Knowledge (grounding corporativo unificado) | XL |
| CLOSED-19 | Atlas (browser nativo com sidebar assistente) | XL |
| CLOSED-22 | Artifacts (saídas reutilizáveis com estado) | L |
| CLOSED-23 | Skills (pacotes de workflow reutilizáveis) | XL |
| CLOSED-25 | MCP connectors directory (950+ servidores) | L |
| CLOSED-26 | MCP Apps (UI interativa embutida) | XL |
| CLOSED-28 | Code execution local com bridge criptografada | XL |
| CLOSED-32 | Cowork (agente multi-superfície para trabalho) | XL |
| CLOSED-34 | Claude in Chrome (agente de navegador) | XL |
| CLOSED-36 | Deep Research Max (com MCP + visualizações) | XL |
| CLOSED-38 | Gemini Live com memória conversacional | XL |
| CLOSED-42 | Agent Mode / ex-Project Mariner (automação de browser) | XL |
| CLOSED-43 | NotebookLM Audio Overview (podcast com 2 hosts) | XL |
| CLOSED-44 | NotebookLM Video Overview cinemático | XL |
| CLOSED-45 | NotebookLM Mind Map interativo com rastreio de fonte | L |
| CLOSED-54 | Deep Research (100+ fontes, relatório estruturado) | XL |
| CLOSED-55 | Comet (browser agêntico) | XL |
| CLOSED-58 | Labs (geração de app/relatório/dashboard em minutos) | L |
| CLOSED-60 | Finance (Market Summary, Crypto, Earnings, heatmap) | L |
| CLOSED-63 | Agentic capabilities em Word/Excel/PowerPoint (GA) | XL |
| CLOSED-64 | PowerPoint Agent Mode com Work IQ | XL |
| CLOSED-66 | Multi-model routing (Claude Opus embutido no M365) | XL |
| CLOSED-68 | Copilot Studio Agent Builder (workflows visuais) | XL |
| CLOSED-69 | Graph grounding (SharePoint/OneDrive/Dynamics) | XL |
| CLOSED-70 | Vision em sessões de voz | XL |
| CLOSED-71 | Agentes MCP embutidos no app nativo | XL |
| CLOSED-75 | Acesso em tempo real ao stream de dados do X | ? |
| CLOSED-77 | Grok Imagine (geração de imagem/vídeo com Agent Mode) | XL |
| CLOSED-79 | Ara / multi-agente com debate e peer review | XL |
| CLOSED-82 | Flash Answers (inferência ultra-rápida via Cerebras) | ? |
| CLOSED-87 | Marketplace de bots com monetização para criadores | XL |
| CLOSED-95 | Notion AI Autofill em propriedades de banco de dados | L |

---

# Anexo C — Cemitério `MORTO`

As 10 funcionalidades que existiram e o mercado abandonou. Registradas para que não sejam reconstruídas por engano.

## `CONV` — Conversa e UX da mensagem

| ID | Funcionalidade | Custo |
|---|---|---|
| CONV-24 | Merge de branches | XL |

## `MODAL` — Multimodal: visão, imagem, áudio, voz, vídeo

| ID | Funcionalidade | Custo |
|---|---|---|
| MODAL-19 | Geração via Midjourney não oficial | M |

## `RAG` — Conhecimento, retrieval e memória

| ID | Funcionalidade | Custo |
|---|---|---|
| RAG-102 | Provedor Google Programmable Search Engine (PSE/CSE) | S |
| RAG-134 | Memória descontinuada/removida (sinal de mercado) | ? |

## `TOOL` — Ferramentas, MCP e agentes

| ID | Funcionalidade | Custo |
|---|---|---|
| TOOL-16 | Transporte SSE (legado) | M |
| TOOL-38 | Import automático de plugin/GPT Actions manifest legado | S |

## `ADMIN` — Multiusuário, governança e billing

| ID | Funcionalidade | Custo |
|---|---|---|
| ADMIN-54 | Falta de enforcement nativo de uso (gap conhecido) | ? |

## `DEV` — Extensibilidade, API e deploy

| ID | Funcionalidade | Custo |
|---|---|---|
| DEV-05 | Pipelines framework (worker externo) | L |
| DEV-32 | Assistants API (threads, tools hospedados) | ? |
| DEV-72 | Sem versionamento de schema em export/restore entre versões do app (gap conhecido) | ? |

---

# Anexo D — Os 104 itens `XL`

Cada um destes é um projeto de meses por conta própria. Se algum entrar no escopo inicial, ele **é** o produto — não um acessório dele.

| ID | Funcionalidade | Camada |
|---|---|---|
| ADMIN-31 | Multi-tenancy real (SaaS) | FRONT |
| ADMIN-72 | DLP (Data Loss Prevention) integrado | FRONT |
| ADMIN-77 | Certificação SOC 2 Type II | ? |
| ADMIN-78 | Certificação ISO 27001 | DIFF |
| ADMIN-79 | HIPAA/BAA disponível | DIFF |
| ADMIN-82 | Residência de dados configurável | FRONT |
| ADMIN-83 | Residência de inferência (processing geo) | FRONT |
| ADMIN-84 | Conformidade com EU AI Act | FRONT |
| ADMIN-89 | Deploy air-gapped / on-prem isolado | FRONT |
| ART-19 | Artifact com "inteligência embutida" (chama o modelo de dentro) | FRONT |
| ART-31 | Preview full-stack com backend real (Node/DB) | FRONT |
| ART-77 | Deploy com backend real em infra gerenciada (one-click) | FRONT |
| CLIENT-14 | App nativo (Swift/C++ puro, sem webview embutido) | FRONT |
| CLIENT-27 | Motor de modelo local embutido no app | ? |
| CLIENT-31 | App nativo iOS | MESA |
| CLIENT-32 | App nativo Android | MESA |
| CLIENT-40 | Modelo local no dispositivo (offline real) | FRONT |
| CLIENT-43 | App companion de navegador agentivo mobile (browser IA completo) | FRONT |
| CLIENT-73 | Sync criptografado ponta-a-ponta | FRONT |
| CLOSED-02 | Memory automática ("Dreaming V3") | FRONT |
| CLOSED-06 | Deep Research (web multi-fonte) | DIFF |
| CLOSED-08 | Advanced Voice Mode (áudio nativo) | FRONT |
| CLOSED-09 | Agent Mode / Operator (navegação web autônoma) | FRONT |
| CLOSED-11 | Apps SDK (apps de terceiros dentro do chat) | FRONT |
| CLOSED-12 | AgentKit / Agent Builder visual | DIFF |
| CLOSED-14 | Sora (geração de vídeo integrada ao chat) | FRONT |
| CLOSED-16 | Company Knowledge (grounding corporativo unificado) | FRONT |
| CLOSED-19 | Atlas (browser nativo com sidebar assistente) | FRONT |
| CLOSED-23 | Skills (pacotes de workflow reutilizáveis) | FRONT |
| CLOSED-26 | MCP Apps (UI interativa embutida) | FRONT |
| CLOSED-28 | Code execution local com bridge criptografada | FRONT |
| CLOSED-32 | Cowork (agente multi-superfície para trabalho) | FRONT |
| CLOSED-34 | Claude in Chrome (agente de navegador) | FRONT |
| CLOSED-36 | Deep Research Max (com MCP + visualizações) | FRONT |
| CLOSED-38 | Gemini Live com memória conversacional | FRONT |
| CLOSED-40 | Integração nativa Workspace (side panel) | MESA |
| CLOSED-42 | Agent Mode / ex-Project Mariner (automação de browser) | FRONT |
| CLOSED-43 | NotebookLM Audio Overview (podcast com 2 hosts) | FRONT |
| CLOSED-44 | NotebookLM Video Overview cinemático | FRONT |
| CLOSED-54 | Deep Research (100+ fontes, relatório estruturado) | FRONT |
| CLOSED-55 | Comet (browser agêntico) | FRONT |
| CLOSED-63 | Agentic capabilities em Word/Excel/PowerPoint (GA) | FRONT |
| CLOSED-64 | PowerPoint Agent Mode com Work IQ | FRONT |
| CLOSED-66 | Multi-model routing (Claude Opus embutido no M365) | FRONT |
| CLOSED-68 | Copilot Studio Agent Builder (workflows visuais) | FRONT |
| CLOSED-69 | Graph grounding (SharePoint/OneDrive/Dynamics) | FRONT |
| CLOSED-70 | Vision em sessões de voz | FRONT |
| CLOSED-71 | Agentes MCP embutidos no app nativo | FRONT |
| CLOSED-77 | Grok Imagine (geração de imagem/vídeo com Agent Mode) | FRONT |
| CLOSED-79 | Ara / multi-agente com debate e peer review | FRONT |
| CLOSED-87 | Marketplace de bots com monetização para criadores | FRONT |
| CLOSED-106 | Planos Enterprise/Edu com SSO, DLP, retenção de dados customizável | MESA |
| CLOSED-109 | Marketplace com revenue share para criadores terceiros | DIFF |
| CONV-21 | Árvore de conversa visível/navegável | FRONT |
| CONV-24 | Merge de branches | MORTO |
| DEV-13 | Plugin decoupled runtime (processo isolado) | FRONT |
| DEV-14 | Marketplace de plugin com review de código | FRONT |
| DEV-25 | Sandbox de execução de plugin (isolamento de processo) | DIFF |
| MODAL-58 | Modo de voz contínuo full-duplex | FRONT |
| MODAL-60 | API realtime dedicada (WebSocket/WebRTC) | FRONT |
| MODAL-61 | Otimização de latência de primeira palavra | FRONT |
| MODAL-64 | Chamada de vídeo com o modelo | FRONT |
| MODAL-65 | Compartilhamento de tela em tempo real | FRONT |
| MODAL-80 | Geração de vídeo via Sora | FRONT |
| MODAL-81 | Geração de vídeo via Veo | FRONT |
| MODAL-82 | Geração de vídeo via Grok Imagine | FRONT |
| MODAL-84 | Geração de música/áudio a partir de prompt | FRONT |
| MODAL-85 | Podcast de dois locutores (audio overview) | FRONT |
| MODEL-50 | Modo "auto"/router de complexidade (modelo pequeno decide) | FRONT |
| MODEL-51 | Roteamento semântico por tipo de tarefa | FRONT |
| MODEL-85 | Compressão de contexto (compactação semântica, não sumarização textual) | FRONT |
| OPS-91 | Sandbox isolado para execução de código (code interpreter) | FRONT |
| PROMPT-63 | Monetização do criador (revenue share/pricing) | DIFF |
| RAG-13 | Detecção de mudança/delta | FRONT |
| RAG-14 | ACL/permission sync na ingestão | FRONT |
| RAG-17 | Layout-aware parsing (tabela/coluna/cabeçalho) | ? |
| RAG-18 | Extração de tabela para markdown estruturado | DIFF |
| RAG-19 | Descrição de imagens dentro do PDF via VLM | FRONT |
| RAG-22 | Parsing de código-fonte com AST/estrutura | FRONT |
| RAG-30 | Late chunking (embed doc inteiro, depois split) | FRONT |
| RAG-64 | GraphRAG (grafo de conhecimento) | FRONT |
| RAG-65 | RAPTOR (árvore hierárquica de sumarização) | FRONT |
| RAG-70 | Retrieval sem vector DB tradicional (long-context grounding) | FRONT |
| RAG-71 | Semantic index híbrido léxico+vetor sobre grafo corporativo | ? |
| RAG-72 | Retrieval sobre web ao vivo sem índice fixo | ? |
| RAG-79 | Verificação de suporte da claim vs. fonte | FRONT |
| RAG-92 | Herança de permissão do conector/fonte original | DIFF |
| RAG-94 | Sincronização automática/live de documento | ? |
| RAG-97 | Versionamento de documento indexado | ? |
| RAG-111 | Modo agentic search (multi-hop, segue links) | FRONT |
| RAG-118 | Deep Research — Perplexity | FRONT |
| RAG-119 | Deep Research — Company Knowledge (ChatGPT) | FRONT |
| RAG-120 | Deep Research Agent (Gemini) | FRONT |
| RAG-122 | Busca combinando fontes privadas + web na mesma consulta | FRONT |
| RAG-124 | Memória de longo prazo persistente entre conversas | ? |
| RAG-131 | Perfil de usuário persistente estruturado ("memory bank") | ? |
| RAG-148 | ACL da fonte propagada ao índice (permission-aware retrieval) | FRONT |
| RAG-149 | Limitação: ACL só atualiza em full crawl | ? |
| RAG-151 | External groups / mapeamento de grupos não-Entra | FRONT |
| RAG-153 | Diretório/marketplace de conectores | FRONT |
| RAG-154 | Conector como plugin externo (MCP como padrão) | FRONT |
| TOOL-56 | Loop navegação+screenshot ("Computer Use") | FRONT |
| TOOL-59 | Controle de desktop completo (não só browser) | FRONT |
| TOOL-88 | Agente de longa duração (horas, multi-sessão) | FRONT |
