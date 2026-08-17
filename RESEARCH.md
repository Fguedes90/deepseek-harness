# Base de evidência — arquitetura de ferramenta LLM

Pesquisa conduzida em **2026-08-15** por frentes paralelas independentes, uma por pilar
da tese de arquitetura. Cada dossiê foi instruído a ser adversarial: confirmar a premissa
só com evidência, e refutá-la quando a evidência mandasse.

Convenções herdadas de cada dossiê:
- Números sem qualificador foram lidos em fonte primária (spec, doc do fornecedor, paper, blog de engenharia do próprio projeto).
- `[ESTIMATIVA]` marca cálculo do próprio pesquisador, com o raciocínio ao lado.
- "não confirmado" significa que o número não foi localizado em fonte confiável — e não foi inventado.

## Os dossiês

| # | Pilar | Pergunta central |
|---|---|---|
| 1 | [Prior art — quem já constrói isso](#1-prior-art) | Matriz produto × tese. A tentativa honesta de matar o projeto antes de escrevê-lo. |
| 2 | [MCP — custo em token e mitigações](#2-mcp) | Quanto custa expor ferramentas via MCP, o que a spec de 2026 mudou, e o que realmente reduz tokens. |
| 3 | [Roteamento por tarefa e por modalidade](#3-roteamento-por-tarefa-e-por-modalidade) | Roteadores de texto, roteamento nativo dos provedores, e o catálogo de modelos especialistas pequenos. |
| 4 | [Micro sandboxes — cold start, densidade, isolamento](#4-micro-sandboxes) | microVM, gVisor, WASM e isolates: o que custa executar código hostil gerado por LLM. |
| 5 | [GPU serverless](#5-gpu-serverless) | 17 provedores, cold start real, e por que as UIs atuais não conseguem consumi-los. |
| 6 | [Metering, billing e governança de roteamento](#6-metering,-billing-e-governança-de-roteamento) | Como atribuir custo quando um turno dispara seis chamadas a recursos diferentes. |
| 7 | Fragmentação de extensão — a matriz de eixos | Seis mecanismos no Open WebUI. Quantos eixos de variação são irredutíveis de verdade. |
| 8 | Precedentes de primitivo único | VS Code, Kubernetes, Envoy, Zed, Shopify, n8n, Home Assistant, Figma — e quem tentou e falhou. |
| 9 | Substrato de execução — WASM vs isolate vs container | Onde roda o código que o modelo escreve, e onde roda o código que o humano escreve. |

## Veredito de uma linha por pilar

| Pilar | Veredito |
|---|---|
| MCP e token | Premissa **confirmada por medição**. A spec 2026-07-28 não resolveu — resolveu escala de servidor. Antídoto publicado é code-execution (−98,7%), não protocolo novo. |
| Roteamento | Premissa **parcialmente desatualizada**. Roteamento nativo existe nos 3 grandes; o buraco real é cross-provider e cross-modalidade. |
| Micro sandbox | Premissa **refutada como lacuna de mercado**. AWS AgentCore e Cloudflare Sandbox SDK já vendem exatamente isso, em GA, com preço publicado. |
| GPU serverless | Premissa **certa quanto à causa, errada quanto ao culpado**. Os primitivos assíncronos existem nos provedores; as UIs é que nunca implementaram o lado cliente. |
| Metering | Premissa **certa para chat UIs, errada como generalização**. Gateways enterprise já cobrem. O que ninguém faz é gravar a decisão de roteamento como campo estruturado. |
| Prior art | **Cloudflare cobre 6 dos 8 pontos** num só fornecedor. O buraco defensável é bem mais estreito do que a tese original supunha. |
| Fragmentação | **2 primitivos bastam** — Capability (modelo invoca, precisa schema) e Interceptor (sistema invoca, hook fixo). Os outros 5 eixos são consequência, não variação. |
| Precedentes | Convergência forte: manifest declarativo + ativação lazy + contrato tipado uniforme + isolamento como decisão ortogonal. |
| Substrato | Hipótese **confirmada**: isolate para orquestração efêmera, container/gVisor para capacidade nativa. WASM Component Model não ganha em nenhum dos dois em ago/2026. |

---

# 1. Prior art — quem já constrói isso

> Matriz produto × tese. A tentativa honesta de matar o projeto antes de escrevê-lo.

### Números

| Métrica | Valor | Fonte |
|---|---|---|
| Overhead de schema MCP por tool | ~1.000 tokens/tool (400 descriptions + 300 types + 300 nested objects) | GitHub modelcontextprotocol/modelcontextprotocol#2808, 2026-05-28 |
| Overhead de sessão MCP típica (5-10 servers) | 50.000–67.000 tokens antes do primeiro prompt | getunblocked.com, 2026-05-14 (medição comunitária, não paper) |
| GitHub MCP server sozinho | ~42.000–55.000 tokens (93 tool defs) | getunblocked.com / dev.to (Piotr Hajdas), 2026 |
| MySQL MCP server (106 tools) | 207KB schema ≈ 54.600 tokens por init | layered.dev, 2026-01-16 |
| Overhead por turno em setup multi-server | até ~18.000 tokens/turno (reload a cada chamada) | tygartmedia.com, 2026-05-15 |
| Redução com Tool Search da Anthropic (Claude Code, jan/2026) | ~95% no custo de startup; 46,9% redução de "main-thread bloat" medida por terceiro | dev.to; getunblocked.com, 2026 |
| RouteLLM (LMSYS) | -85% custo (MT-Bench), mantendo 95% da qualidade do GPT-4 | lmsys.org blog, 2024-07-01 (ainda citado como baseline em 2026) |
| Arch-Router (katanemo) | modelo de roteamento semântico de 1,5B params, open weight | huggingface.co/katanemo/Arch-Router-1.5B |
| Portkey Gateway | overhead <1ms, footprint 122kB, >10bi tokens/dia processados | truefoundry.com / techjacksolutions.com, 2026 |
| LiteLLM | 140+ providers, 1.892 modelos catalogados, MIT license, enterprise SSO a partir de $250/mês | litellm.ai, 2026 |
| Portkey pricing | Free (10k logs/mês) → Prod $49/mês (100k logs) + $9/100k adicional → Enterprise custom | truefoundry.com, 2026 |
| AWS Bedrock AgentCore — CPU | $0,0895/vCPU-hora, cobrado só em ciclos ativos (CPU para durante I/O wait) | cloudburn.io, 2026 |
| AWS Bedrock AgentCore — memória | $0,00945/GB-hora, floor de 128MB | cloudburn.io, cipherprojects.com, 2026 |
| AWS Bedrock AgentCore — isolamento | microVM dedicada por sessão, terminada e sanitizada ao fim | docs.aws.amazon.com/bedrock-agentcore, 2026 |
| AWS Bedrock AgentCore — eventos | $0,25/1.000 (session/memory bank events) | betterclaw.io, 2026 |
| Cloudflare Workers isolate | cold start <5ms, limite 128MB/isolate, CPU 10ms-50ms/req (wall-clock até 30s) | developers.cloudflare.com/workers/platform/limits; truvisory.com, 2026 |
| Cloudflare Dynamic Workers (sandboxing de agente) | "100x mais rápido" que containers para execução de código de agente | blog.cloudflare.com/dynamic-workers, 2026-03-24 |
| AWS Lambda vs Cloudflare cold start | 200ms–2s (Firecracker microVM) vs <5ms (V8 isolate) | truvisory.com, 2026 (citando eng. Cloudflare/AWS docs) |
| Cloudflare Workers AI | $0,011/1.000 Neurons; free 10.000 Neurons/dia; GPUs em 180+ cidades | developers.cloudflare.com/workers-ai/platform/pricing, 2026 |
| Utilização média de GPU (justificativa serverless) | 20-40% de utilização; 1/3 das orgs <15% | cloudflare.com/products/workers-ai, 2026 |
| RunPod serverless GPU H100 | ~$4,55/hora equiv., cold start 20-60s = $0,025-$0,076/cold start, billing por segundo | spheron.network, usagepricing.com, 2026 |
| Modal GPU H100 | $0,001097/s (~$3,95/h), cold start 5s = $0,0055; GPU snapshotting carrega modelo 7B "em segundos" | usagepricing.com, buildmvpfast.com, 2026 |
| Baseten GPU H100 | $6,50/h, billing por minuto (cold start arredondado p/ minuto) | morphllm.com, gmicloud.ai, 2026 |
| Dify plugin marketplace | lançado v1.0.0 fev/2025, >120 plugins no lançamento; 6 tipos de plugin (Model, Tool, Agent Strategy, Extension, Datasource/Trigger, Bundle) | dify.ai/blog, github.com/langgenius, 2025-2026 |
| Not Diamond routing | -20-40% custo em coding agents; $0,05/milhão tokens roteados (não confirmado publicamente, pricing page opaca) | morphllm.com, tooldirectory.ai, 2026 |
| Martian routing | -20-98% API spend (claim do vendor, sem paper); 2.500 req grátis, $20/5.000 req adicionais | everydev.ai, agentmarketcap.ai, 2026 |
| Padrão "Agent Plugins 1.0.0" | Google/Microsoft/OpenAI/Cursor/Vercel/AWS lançaram formato de empacotamento unificado p/ Skills+MCP (não é protocolo novo, é empacotamento) | medium.com (ai-engineering-trend), 2026-08 (~1 semana antes de hoje) |
| Fermyon Spin (Akamai, ago. 2025) | adquirido pela Akamai, deployado em 4.000+ edge locations | birjob.com, 2026 |

### Como funciona hoje

**Gateways de roteamento (LiteLLM, Portkey, Cloudflare AI Gateway, OpenRouter, Kong/Envoy/Bifrost).** Todos convergem no mesmo padrão: endpoint único compatível com formato OpenAI, tabela de "virtual keys"/config mapeando modelo lógico → provedor real, e uma camada de política (fallback, load balancing, budget, cache) aplicada por config YAML/JSON, não por código. Roteamento por complexidade/semântica é add-on recente — LiteLLM só ganhou "Auto Routing" (classificador heurístico/LLM/lexical) em v1.94.x, dev release 2026-07-14, ou seja, é feature de semanas atrás, não consolidada. Cloudflare mudou de "provider-first" para "model-first routing" em 2026: você pede uma capacidade ("reasoning model", "fast summarizer") e o control plane escolhe provedor — isso é o pedaço mais próximo de "roteamento por capacidade" que existe hoje num gateway comercial.

**MCP eficiência de token.** O protocolo despeja o schema JSON completo de toda tool disponível no contexto antes da primeira mensagem — isso é comportamento de spec, não bug de implementação (todo MCP client precisa da lista de tools para o LLM decidir chamar). A mitigação de 2026 (Tool Search Tool da Anthropic, ligado por padrão em jan/2026) não resolve o protocolo: adiciona uma ferramenta de busca que resolve *quais* tools carregar, mas ainda paga overhead de busca e ainda serializa schema completo assim que a tool é selecionada. Isso é patch em cima do problema estrutural, confirmando (não refutando) a tese do usuário sobre MCP.

**Sandbox por agente.** Duas famílias de solução real hoje: (a) microVM por sessão (Firecracker no AWS Lambda/Bedrock AgentCore, Fly Machines) — isolamento forte, cold start 200ms-2s, custo por vCPU-hora/GB-hora; (b) isolado V8 (Cloudflare Workers/Dynamic Workers) — isolamento mais fraco (sem kernel próprio) mas cold start <5ms e "100x mais rápido" que containers, positionado especificamente para agent code execution desde março/2026. Cloudflare oferece as duas modalidades no mesmo SDK (Sandbox SDK) deixando o dev escolher isolate vs microVM por tipo de tarefa — isso é a implementação de "micro sandbox por agente" mais madura hoje, não papel de pesquisa.

**GPU serverless.** Todo provedor cobra por segundo de compute ativo (não por hora reservada), variando de $0,0011/s (Modal H100) a $0,00126/s (RunPod H100) a billing por minuto (Baseten). O diferencial real está no cold start: Modal usa "GPU snapshotting" para restaurar memória de modelo em segundos; Cloudflare Workers AI evita cold start completamente ao manter modelo residente na borda (180+ cidades) mas restringe ao catálogo dela (50+ modelos, não custom). Nenhum desses é "GPU serverless de primeira classe *dentro de um framework de agente*" — Modal/RunPod/Baseten são infraestrutura pura, sem conceito de agente, extensão ou roteamento por tarefa embutido.

**Extensão única.** Dify é o caso mais avançado: desde v1.0.0 (fev/2025) todo modelo, tool, estratégia de agente e integração externa é o *mesmo* pacote de plugin (manifest + runtime isolado), distribuído via marketplace único. É literalmente "um primitivo de extensão" no sentido que o usuário pede — mas dentro de uma plataforma fechada de chat/workflow, não como camada de infraestrutura reusável. Fermyon Spin / wasmCloud fazem o WASM genérico (plugin = módulo WASM sandboxed, portável entre hosts) mas **nenhum dos dois tem binding nativo para "isto é uma tool de LLM"** — são runtimes de plugin de propósito geral que alguém teria que adaptar.

### Opções

| Abordagem | O que ganha | O que perde | Quando faz sentido |
|---|---|---|---|
| Fork/estender LiteLLM ou Portkey | Roteamento de provedor maduro, MIT, self-host, comunidade grande | Nenhum tem sandbox ou extensão unificada — vira "gateway + fork extenso" | Se o produto é majoritariamente sobre roteamento de custo/fallback |
| Construir sobre Cloudflare (Workers AI + AI Gateway + Sandbox SDK + Agents SDK) | 6/8 pontos da tese já resolvidos por infra madura e battle-tested; cold start e custo por request são números reais e bons | Lock-in de plataforma; catálogo de modelos limitado ao que Cloudflare hospeda ou proxeia; billing/governança multi-tenant ainda é DIY | Se aceitar acoplamento a um cloud vendor em troca de não reconstruir sandbox+GPU do zero |
| Adotar Dify plugin model como referência de design (não código) | Prova de conceito real de "1 primitivo cobre tudo" em produção há 1,5 ano | É acoplado ao runtime Python/Lambda do Dify, não portável | Copiar a *forma* do manifest, não o código |
| WASM (Spin/wasmCloud) como camada de extensão | Portabilidade real cross-host, sandboxing por design, sem vendor lock-in de cloud | Zero binding de domínio para LLM tools hoje — você escreve esse binding | Se "extensão única" for o requisito mais crítico e portabilidade > velocidade de entrega |
| Compor: gateway (LiteLLM) + sandbox (Cloudflare Sandbox SDK ou Firecracker via AgentCore) + WASM extension layer própria | Cada peça é best-of-breed e comprovada | Integração é trabalho seu; 3 superfícies operacionais para manter; nenhuma unifica governança/billing | Caminho mais realista dado que nenhum produto único cobre 6+ pontos com qualidade uniforme |

### Onde a premissa do usuário está certa

1. **MCP é estruturalmente caro em token, confirmado por medição, não opinião.** ~1.000 tokens/tool, 50-67k tokens de overhead de sessão típica, até 18k tokens/turno. Isso é reportado inclusive dentro do próprio repo oficial do protocolo (issue #2808) como problema não resolvido no nível de spec — a mitigação (Tool Search) é um workaround de client, lançado só em jan/2026, e ainda não é padrão universal entre implementações de MCP.
2. **Fragmentação de extensão é real e reconhecida pela própria indústria em 2026.** A criação do "Agent Plugins 1.0.0" (Google/Microsoft/OpenAI/Cursor/Vercel/AWS, ~agosto/2026) é evidência direta: seis grandes players tiveram que convergir porque "tínhamos prompts, AGENTS.md, Skills, MCP, hooks, extensões específicas de tool — agora temos plugins" (citação direta de fonte 2026). Mas note: esse padrão resolve *empacotamento/distribuição*, não unifica os *mecanismos de execução* — ainda existem tools MCP (protocolo network) e skills (prompt-only) como coisas tecnicamente diferentes dentro do mesmo pacote.
3. **Multimodalidade travada no modelo grande** é real fora de plataformas específicas de mídia. LiteLLM/Portkey/OpenRouter roteiam texto-para-texto majoritariamente; roteamento vision/ASR/OCR para especialista pequeno não é padrão nesses gateways — é nichado em fal.ai/Replicate (mídia generativa) que por sua vez proxeiam LLM de volta via OpenRouter, não o inverso.
4. **Governança/billing multi-tenant é fraco na maioria dos gateways.** LiteLLM cobra $250/mês só para SSO/RBAC/audit log — funcionalidade básica de governança empresarial vendida como add-on premium, confirmando que não é first-class no core aberto.

### Onde a premissa do usuário está errada ou desatualizada

**Ponto crítico e direto: micro sandbox por agente e GPU serverless de primeira classe já são resolvidos, com números de produção, por pelo menos dois fornecedores — e um deles (Cloudflare) os combina no mesmo produto com roteamento por capacidade.**

- **Sandbox:** A tese trata "micro sandbox por agente" como buraco de mercado. Não é. AWS Bedrock AgentCore dá microVM Firecracker dedicada por sessão com billing por vCPU-hora e memória sanitizada ao fim ($0,0895/vCPU-h, $0,00945/GB-h) — isso É micro sandbox por agente, em GA, com pricing publicado, desde 2025-2026. Cloudflare foi além: Dynamic Workers (mar/2026) e Sandbox SDK dão duas classes de isolamento (isolate V8 <5ms vs microVM completa) escolhidas por tipo de tarefa, especificamente desenhadas para "execução de código gerado por AI agent" — é o *nome do produto*. Se o usuário quer "micro sandbox" como diferencial, precisa explicar por que reconstruir isso é melhor que consumir AgentCore Runtime ou Sandbox SDK.
- **GPU serverless:** RunPod, Modal e Baseten são exatamente "GPU serverless de primeira classe" — billing por segundo, scale-to-zero, sem provisionamento. Modal com snapshotting carrega um modelo 7B em segundos a partir de cold start. Isso não é gap de mercado, é mercado maduro e competitivo (pelo menos 4 players com pricing público comparável). A única lacuna real é que nenhum desses é *dentro de um runtime de agente com roteamento nativo* — mas isso é lacuna de integração, não de existência do primitivo.
- **Roteamento por tarefa/modalidade para especialista pequeno**, especificamente citado como ponto 5 da tese, já existe operacionalmente em Cloudflare AI Gateway com "model-first routing" (2026) e em RouteLLM/Arch-Router (roteador semântico de 1,5B params, open weight, plugável). A ideia de "roteador pequeno decidindo para onde mandar" não é original — é produto e paper publicados desde 2024 (RouteLLM, LMSYS) com follow-ups ativos em 2026 (vLLM Semantic Router, Arch-Router).
- **Cloudflare, especificamente, cobre 6 dos 8 pontos da tese dentro de um único vendor e control plane:** (1) extensão — parcial via Workers/Durable Objects genéricos, não um primitivo dedicado de "LLM extension"; (2) MCP eficiente — não resolve o token bloat do protocolo em si, mas dá model-first routing que reduz a necessidade de MCP para seleção de modelo; (3) funcionalidades especialistas — parcial; (4) multimodalidade desacoplada — **sim**, catálogo Workers AI com 50+ modelos incluindo visão/áudio/imagem, invocáveis independente do LLM de texto escolhido; (5) roteamento automático por tarefa/modalidade — **sim**, model-first routing + dynamic routing (percentage/rate-limit/budget); (6) governança/billing — parcial (BYOK, budget limits, mas não é o foco); (7) micro sandbox — **sim**, Sandbox SDK/Dynamic Workers; (8) GPU serverless — **sim**, Workers AI nativo. Isso são **5-6 pontos fortes ou parciais fortes num único vendor**, o que muda o ônus da prova: o projeto do usuário precisa justificar por que não é "construir em cima de Cloudflare" em vez de construir do zero.

### Recomendação para o design

- **Não construir gateway de roteamento de provedor do zero.** LiteLLM (MIT) e Portkey Gateway (MIT, self-host) já resolvem fallback/load-balancing/cache/budget com throughput de produção comprovado (Portkey: >10bi tokens/dia). Custo de reinventar: meses de trabalho para replicar maturidade que já é grátis e auditável.
- **Não construir GPU serverless.** Composição sobre Modal (melhor cold start medido) ou RunPod (mais barato) via API é ordens de magnitude mais barato que operar hardware GPU. Único cenário para hardware próprio é latência extrema de borda — aí Cloudflare Workers AI já cobre 180+ cidades.
- **Sandbox: avaliar Cloudflare Sandbox SDK / AWS AgentCore Runtime antes de escrever isolamento próprio.** Custo de construir do zero um microVM manager seguro (fugas de memória entre sessões são vulnerabilidade crítica) é alto o suficiente que só se justifica se a densidade-por-host exigida for muito mais agressiva que os $0,0895/vCPU-h da AWS — e isso precisaria de benchmark próprio para provar.
- **O único ponto onde código novo se justifica de verdade: um primitivo de extensão que trate "tool MCP", "skill de prompt" e "modelo especialista" como a MESMA unidade executável, com exposição de schema lazy (não front-loaded) e com sandbox amarrado por padrão.** Nenhum produto pesquisado faz isso — Dify unifica tipos de plugin mas dentro de plataforma fechada sem exposição lazy de schema; WASM (Spin/wasmCloud) dá sandbox+portabilidade mas sem binding de domínio LLM; Agent Plugins 1.0.0 unifica só o *empacotamento*, não a *execução*. **Esse é o buraco real**: extensão-como-primitivo-único + custo de token controlado (lazy schema loading nativo, não add-on) + sandbox obrigatório por padrão, os três juntos. Construir isso como camada fina sobre WASM (portabilidade) + protocolo de descoberta lazy próprio (resolve o ponto 2 que o resto do mercado trata como patch, não como design) é onde o projeto ganha diferenciação real.
- **Governança/billing: não é diferencial técnico defensável.** LiteLLM Enterprise, Portkey, Kong Konnect ($500-2.500/mês) já cobrem RBAC/SSO/audit — é feature de commodity enterprise, não de arquitetura. Se entrar no design, tratar como integração (ex.: emitir eventos padronizados de uso) e não como núcleo do produto.
- **Roteamento por modalidade: reusar Arch-Router (1,5B, open weight, MIT-like) como classificador em vez de treinar um do zero.** Ele já resolve exatamente "que domínio/ação este prompt precisa" com footprint pequeno — reimplementar é custo sem ganho, dado que RouteLLM (LMSYS, 2024) e Arch-Router (2025) são medidos e reproduzíveis.

### Fontes

- https://www.litellm.ai/
- https://docs.litellm.ai/docs/proxy/auto_routing
- https://railway.com/deploy/litellm-proxy
- https://portkey.ai/docs/product/ai-gateway
- https://techjacksolutions.com/ai-tools/llm-gateways/portkey-ai-gateway/
- https://futureagi.com/blog/portkey-alternatives-2026/
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-sessions.html
- https://cloudburn.io/blog/amazon-bedrock-agentcore-pricing
- https://www.betterclaw.io/blog/aws-bedrock-agentcore-pricing-alternatives
- https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/
- https://blog.cloudflare.com/workers-ai-gateway-unification/
- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://blog.cloudflare.com/ai-platform/
- https://developers.cloudflare.com/workers/platform/limits/
- https://blog.cloudflare.com/dynamic-workers/
- https://developers.cloudflare.com/sandbox/tutorials/claude-managed-agents/
- https://github.com/cloudflare/claude-managed-agents/blob/main/docs/isolate-vs-vm-sandboxes.md
- https://agents.cloudflare.com/
- https://www.cloudflare.com/products/workers-ai/
- https://dify.ai/blog/dify-v1-0-building-a-vibrant-plugin-ecosystem
- https://dify.ai/blog/introducing-dify-plugins
- https://dify.ai/blog/dify-plugin-system-design-and-implementation
- https://github.com/langgenius/dify-official-plugins
- https://github.com/modelcontextprotocol/modelcontextprotocol/issues/2808
- https://getunblocked.com/blog/mcp-token-budget-autopsy/
- https://getunblocked.com/blog/github-mcp-token-cost/
- https://layered.dev/mcp-tool-schema-bloat-the-hidden-token-tax-and-how-to-fix-it/
- https://tygartmedia.com/claude-mcp-token-cost/
- https://ismaelramos.dev/blog/what-an-mcp-server-costs-you-in-tokens/
- https://huggingface.co/katanemo/Arch-Router-1.5B
- https://arxiv.org/pdf/2506.16655
- https://www.lmsys.org/blog/2024-07-01-routellm/
- https://github.com/lm-sys/routellm
- https://fal.ai/models/openrouter/router/vision/api
- https://www.gmicloud.ai/en/blog/fal-ai-vs-replicate
- https://www.fermyon.com/spin
- https://www.birjob.com/blog/wasm-server-side-2026
- https://usagepricing.com/blueprint/modal
- https://www.spheron.network/blog/runpod-h100-pricing-2026/
- https://morphllm.com/comparisons/together-vs-baseten
- https://tooldirectory.ai/tools/not-diamond
- https://www.morphllm.com/notdiamond-alternative
- https://www.everydev.ai/tools/martian
- https://agentmarketcap.ai/blog/2026/04/06/llm-gateway-market-2026-litellm-portkey-martian-intelligence-router
- https://ai-engineering-trend.medium.com/six-major-tech-companies-jointly-establish-the-ai-agent-plugin-packaging-standard-after-mcp-and-6e2f83d3e5dc
- https://enchanter.gg/en/blog/agent-plugins-open-standard-skills-mcp

---

# 2. MCP — custo em token e mitigações

> Quanto custa expor ferramentas via MCP, o que a spec de 2026 mudou, e o que realmente reduz tokens.

Now writing the full dossier.

### Números

| Medida | Valor | Fonte |
|---|---|---|
| GitHub MCP oficial — tool defs por request | 17.600 tokens; 30.000+ tokens com múltiplos servidores | ScaleKit, via stackone.com/blog/mcp-token-optimization (mar/2026) |
| GitHub MCP — nº de tools + custo | 93 tools adicionais ≈ 55.000 tokens | Simon Willison, simonwillison.net/2025/Aug/22/too-many-mcps (22/ago/2025) |
| MCP vs CLI equivalente, 75 runs de benchmark | MCP consome 4–32× mais tokens que CLI direto | ScaleKit, citado em groktop.us/stop-asking-for-mcp |
| Playwright MCP — tool list no Claude Code | 14,4k tokens padrão (7,2% da janela); 15,2k tokens com todas capacidades opcionais | GitHub issue microsoft/playwright-mcp#1290 (29/dez/2025) |
| Playwright MCP — schema completo (~22-26 tools) | ~15.462 tokens (outra medição: ~3.600 tokens "antes da 1ª ação", contagem parcial) | github.com/mcpslim/playwright-slim; joanmedia.dev (mar/2026) — números divergem por versão/config, ambos citados |
| Playwright MCP — workflow real de 7 passos | ~114.000 tokens totais (36k schema + snapshots por passo) | scrolltest.medium.com (24/fev/2026) |
| Playwright-slim (agrupamento semântico 22→6 tools) | Redução de 73,8% nos tokens de schema | github.com/mcpslim/playwright-slim |
| Anthropic Code Execution with MCP — redução de contexto | 150.000 → 2.000 tokens = **98,7%** de redução | anthropic.com/engineering/code-execution-with-mcp (04/nov/2025) — número confirmado, textual explícito no post |
| Anthropic Tool Search Tool — redução de tokens | Interno: ~134k → ~5k tokens = **85%**; overhead da própria tool: ~500 tokens | anthropic.com/engineering/advanced-tool-use (nov/2025), citado por opensourceforu.com (jan/2026) |
| Anthropic Tool Search Tool — precisão de seleção de tool | Opus 4: 49%→74%; Opus 4.5: 79,5%→88,1% com tool search ligado | anthropic.com/engineering/advanced-tool-use |
| Gatilho de fallback do Claude Code p/ tool search | Ativa busca quando descrições de tools excedem 10% do contexto disponível | opensourceforu.com/2026/01 (citando Anthropic) |
| Servidores MCP com 7+ conectados | Setups documentados consumindo 67k+ tokens só de tool defs | Thariq Shihipar (Anthropic), citado em opensourceforu.com (jan/2026) |
| Registro MCP — nº de servidores públicos ativos | >10.000 (dez/2025); ~2.000 entradas no MCP Registry (crescimento de 407% desde set/2025) | anthropic.com/news (doação, 09/dez/2025); blog.modelcontextprotocol.io/posts/first-mcp-anniversary |
| Prompt caching (Anthropic/OpenAI) — efeito | Reduz CUSTO por token repetido (cache hit ~90% mais barato na Anthropic), mas NÃO reduz tokens ocupados na janela de contexto nem no orçamento de contexto efetivo | [INFERÊNCIA baseada na doc pública de prompt caching da Anthropic — mecanismo de billing, não de contexto; não há fonte específica que contradiga isso] |
| Isolates Cloudflare (Code Mode sandbox) — custo de start | "Handful of milliseconds", poucos MB de memória por isolate | blog.cloudflare.com/code-mode (2025) |

### Como funciona hoje

MCP client-server via JSON-RPC. No handshake (`initialize`), ou já na primeira ida ao servidor, o cliente chama `tools/list` e recebe o array completo de definições de tool — nome, descrição, JSON Schema de parâmetros (obrigatórios/opcionais, tipos, enums, descrições por campo). Esse array inteiro é serializado como texto e injetado no system prompt ou equivalente antes da mensagem do usuário. Cada tool custa tipicamente 200–1.500 tokens dependendo da complexidade do schema; servidores com dezenas de tools (GitHub, Playwright, Slack) somam facilmente 15k–55k tokens **antes** de qualquer trabalho.

O segundo custo — geralmente maior em uso real — é o de resultado intermediário: toda chamada de tool devolve um payload que entra de novo no contexto do modelo, e se o próximo passo depende desse dado (ex.: copiar um documento de 50k tokens para outro sistema), o modelo precisa reler e reescrever o payload inteiro, dobrando o custo.

Até a spec `2025-06-18`, MCP era um protocolo stateful bidirecional: sessão HTTP/SSE persistente, handshake `initialize`/`notifications/initialized`, sampling/elicitation via streams abertos. Isso dificultava escalar servidores remotos atrás de load balancers simples (exigia sticky sessions ou storage de sessão compartilhado).

### Opções

| Abordagem | Mecanismo | Ganho medido | Custo/tradeoff |
|---|---|---|---|
| MCP clássico (tool-calling direto) | Todos os schemas no prompt, chamada direta | Baseline (0% de redução) | Simples de implementar; não escala além de ~20-30 tools sem degradar seleção e estourar contexto |
| Code execution / Code Mode | Modelo escreve código (TS/Python) que chama tools como funções de API; schemas viram arquivos no filesystem, lidos sob demanda | 98,7% (Anthropic), achados similares na Cloudflare | Exige sandbox de execução de código (isolate/container); reescreve o client inteiro; debugging mais difícil; setup inicial maior |
| Tool search / progressive disclosure | Meta-tool `search_tools`/`defer_loading`; catálogo carregado sob demanda por relevância | 85% (Anthropic Tool Search Tool), +overhead de ~500 tokens fixos | Requer 2 round-trips extras (busca + carregamento) por tool nova; ainda expõe schema completo da tool escolhida |
| RAG sobre catálogo de tools | Embeddings de descrições, top-k tools relevantes injetadas | Sem número duro publicado por grande player; Stacklok MCP Optimizer (lançado 28/out/2025) reivindica abordagem competitiva a Tool Search, sem % publicado confirmado | Latência de embedding/busca; qualidade depende de embedding model; falso-negativo risco (tool certa não retorna no top-k) |
| Lazy loading/subsetting por servidor/intenção | Carrega só os servidores relevantes à conversa detectada | Sem benchmark público isolado | Requer classificador de intenção prévio; risco de falso-negativo igual ao RAG |
| Compressão de schema / nomes curtos / remoção de campos opcionais | Editar manualmente os JSON Schemas para reduzir verbosidade | playwright-slim: 73,8% (agrupando 22→6 tools, não só compressão) | Trabalho manual por servidor; quebra compatibilidade se cliente espera schema original; ganho não escala automaticamente com N tools |
| Sumarização de resultado de tool | Resumir/truncar payloads verbosos antes de retornar ao modelo | Sem número público isolado — mencionado qualitativamente em toda a literatura de "response bloat" | Risco de perda de informação relevante; exige lógica de sumarização por tipo de dado |
| Prompt caching | Cachear os tokens de schema repetidos entre turns/requests | Reduz custo $ por token repetido (~90% desconto em cache-hit, Anthropic); **não reduz tokens ocupando a janela de contexto** | Não resolve limite de contexto nem risco de seleção de tool errada entre milhares delas; só resolve billing |
| UTCP (Universal Tool Calling Protocol) | Sem servidor intermediário — agente chama endpoint nativo (HTTP/gRPC/CLI) diretamente após descoberta | Elimina "wrapper tax" e latência de proxy; sem número de token comparativo formal publicado (afirmações são qualitativas) | Adoção nascente (GitHub org `universal-tool-calling-protocol`, sem trações de big vendor como MCP); perde uniformidade de auth/discovery que MCP oferece |

### Onde a premissa do usuário está certa

1. **"MCP virou padrão mas é extremamente ineficiente em token" — confirmado com números duros.** GitHub MCP consome 17.600–55.000 tokens antes da primeira mensagem do usuário (ScaleKit/Willison, 2025-2026). Playwright MCP consome 14,4k-15,2k tokens só de schema, chegando a 114k tokens em um workflow real de 7 passos (fev/2026). ScaleKit mediu 4-32× mais tokens que uma CLI equivalente em 75 benchmarks. Isso não é opinião — é medição publicada, reproduzível, e reconhecida pela própria Anthropic no post de nov/2025 ("agents connected to thousands of tools... need to process hundreds of thousands of tokens before reading a request").
2. **"defeito estrutural, não detalhe" — também confirmado.** A correção não veio de um patch incremental na spec original; exigiu (a) uma mudança de paradigma inteira (code execution, publicada como blog de engenharia separado, não como revisão de spec) e (b) uma feature nova e opt-in (Tool Search Tool, beta em nov/2025, "enabled by default" só recentemente). O próprio MCP core não resolveu — resolveu-se *ao redor* dele.
3. **Ecossistema fragmentado de mitigações confirma a queixa nº1 (padrões incompatíveis).** Cada vendor está inventando sua própria mitigação incompatível: Anthropic (Tool Search Tool + defer_loading), Cloudflare (Code Mode via Worker Loader API), Stacklok (MCP Optimizer), comunidade (playwright-slim). Isso é exatamente o padrão de "5-6 mecanismos incompatíveis" que o usuário reclama de Open WebUI/LibreChat — só que agora acontecendo *dentro* do próprio ecossistema MCP.

### Onde a premissa do usuário está errada ou desatualizada

1. **A spec de 2026-07-28 já ataca parte real do problema — mas não o custo de token do schema, e sim custo operacional/latência de servidor.** `Stateless core`, `cacheable list results` (ttlMs/cacheScope em `tools/list`) e `Multi Round-Trip Requests` (blog.modelcontextprotocol.io/posts/2026-07-28, confirmado) resolvem escalabilidade de servidor (sticky sessions, load balancing) e permitem ao *cliente* cachear a resposta de `tools/list` entre reconexões — isso ajuda a reduzir round-trips repetidos de descoberta, mas **não reduz o tamanho do payload em si nem os tokens que entram no contexto do modelo na primeira carga**. É preciso ser preciso aqui: cache de lista evita rebuscar o catálogo do servidor a cada handshake; não evita que o catálogo inteiro seja injetado no prompt do modelo. O usuário poderia inferir (incorretamente) que a spec 2026 "resolveu" o problema de token — ela resolveu um problema adjacente (latência/escala de infra), não o problema central de ocupação de context window.
2. **O ganho mais citado (98,7% Anthropic) não é fruto de uma mudança na spec MCP — é uma mudança de arquitetura do *cliente*, publicada como blog de engenharia, fora do processo de standardização.** Isso significa que "resolver" o problema de token hoje depende do cliente reimplementar toda a camada de tool-calling como execução de código, não de aderir a uma versão nova da spec. Não há ainda uma extensão formal ratificada pela AAIF/MCP core para "code execution mode" — é convenção de facto entre Anthropic e Cloudflare, ainda não parte do protocolo.
3. **Não há evidência de que a doação à Agentic AI Foundation (dez/2025) traga instabilidade de spec ou risco de breaking changes descontrolados** — pelo contrário: o post oficial diz explicitamente "for MCP, little changes — the governance model we introduced earlier this year continues as is" (blog.modelcontextprotocol.io, 09/dez/2025). A cadência observada (2025-03-26 → 2025-06-18 → 2025-11-25 → 2026-07-28, ~4 releases em 16 meses) é backward-compatible por declaração explícita ("this release is backward compatible. Your existing implementations keep working"). Isso é mais estável do que a percepção usual de "spec correndo atrás do mercado".
4. **UTCP não resolve o problema de token de forma mensurável e superior — é reposicionamento, não solução comprovada.** Nenhuma fonte encontrada traz um número comparativo formal de tokens UTCP vs MCP; as alegações são qualitativas ("elimina wrapper tax", "reduz overhead de runtime"). Adoção real de UTCP é órfã (um único org GitHub, sem apoio de big vendor comparável aos 150+ orgs da A2A ou aos 10.000+ servidores MCP). Tratar UTCP como "rival capaz de resolver o problema de token" seria má-fé factual — é mais forte como argumento arquitetural (elimina camada de proxy) do que como resposta ao custo de token de schema, que é orthogonal ao transporte.

### Recomendação para o design

1. **Implementar code-execution mode como o mecanismo primário de extensão desde o dia 1**, não MCP tool-calling direto. Custo: exige sandbox de execução (V8 isolate/similar — não precisa ser container; Cloudflare mostrou milissegundos e poucos MB por isolate) e reescrita do client loop para gerar/rodar código em vez de despachar tool-calls. Ganho: resolve as duas queixas nº1 e nº2 do usuário simultaneamente — um único primitivo de extensão (código + APIs tipadas geradas de qualquer schema MCP/REST/gRPC) substitui Pipelines/Functions/Filters/Actions/Tools/Skills, e o custo de token cai ~98% no caso documentado.
2. **Tratar MCP como um *transporte de descoberta e schema*, não como a interface de execução final.** Consumir o protocolo MCP (auth, discovery, `tools/list` cacheável via ttlMs/cacheScope da spec 2026-07-28) para gerar a API de código sob demanda — não para expor tool-calls direto ao modelo. Isso aproveita a uniformidade de auth/discovery do MCP (que UTCP não replica com a mesma tração de mercado) sem herdar seu custo de token.
3. **Adicionar tool-search/progressive-disclosure como segunda camada, não substituto do item 1.** Mesmo com code-execution, catálogos muito grandes (>50 servidores) se beneficiam de um `search_tools` que retorna só os arquivos/interfaces relevantes antes de o agente explorar o filesystem. Custo: ~500 tokens fixos de overhead + 1-2 round-trips extras por tool nova; ganho adicional documentado de 85% quando aplicado isolado (Anthropic).
4. **Nunca contar com prompt caching como mitigação de contexto.** É estritamente uma otimização de custo em dólar sobre tokens repetidos entre turns — não libera espaço de janela de contexto nem resolve degradação de seleção de tool (a queda de acurácia de 49%→74%/79,5%→88,1% citada pela Anthropic é sobre volume de schemas ativos, que caching não reduz).
5. **Não apostar em UTCP, A2A, AG-UI ou ACP como substituto de MCP no ponto de entrada de tools.** A2A resolve outro problema (comunicação entre agentes autônomos, não exposição de tools a um LLM único) e tem tração real (150+ orgs, abril/2026) — vale considerar para orquestração multi-agente, não para o custo de token do catálogo de tools. UTCP tem tração insuficiente para apostar infraestrutura nele; reavaliar em 6-12 meses.
6. **Adotar sumarização/filtragem de resultado de tool como responsabilidade do sandbox de execução de código (item 1), não como componente MCP separado.** O código gerado pelo agente já filtra localmente antes de retornar ao modelo (ex.: `rows.filter(...)` antes de `console.log`) — isso mata o segundo maior custo (resultados intermediários verbosos) de graça, sem exigir uma nova "feature de sumarização" isolada.

---

# 3. Roteamento por tarefa e por modalidade

> Roteadores de texto, roteamento nativo dos provedores, e o catálogo de modelos especialistas pequenos.

### Números

| # | Item | Métrica | Valor | Fonte |
|---|---|---|---|---|
| 1 | RouteLLM (matrix factorization router, MT Bench) | Cost-Performance-Threshold a 95% qualidade GPT-4 | **3.66x** de economia de custo | arXiv 2406.18665, tabela 5.4 (paper LMSYS/ICLR 2025) |
| 2 | RouteLLM (MMLU) | CPT a 92% qualidade GPT-4 | **1.41x** economia | arXiv 2406.18665 |
| 3 | RouteLLM (GSM8K) | CPT a 87% qualidade GPT-4 | **1.49x** economia | arXiv 2406.18665 |
| 4 | RouteLLM MF router, treinado só em Arena | 95% qualidade GPT-4 usando | **26%** das chamadas GPT-4 (~48% mais barato que baseline aleatório) | blog LMSYS 01/07/2024 |
| 5 | RouteLLM MF router + LLM judge augmentado | 95% qualidade GPT-4 usando | **14%** das chamadas GPT-4 (~75% mais barato) | blog LMSYS 01/07/2024 |
| 6 | Martian Arch-Router | tamanho do classificador de roteamento | **1.5B parâmetros**, decide em "dezenas de ms" em GPU commodity | AgentMarketCap 04/2026 [secundário] |
| 7 | vLLM Semantic Router (Red Hat, MMLU-Pro + Qwen3-30B) | ganho de acurácia com auto-reasoning-mode | **+10.2 p.p.** acurácia, **-47.1%** latência, **-48.5%** tokens | Red Hat blog 11/09/2025; arXiv 2510.08731 |
| 8 | vLLM Semantic Router, extração de sinal (A100) | latência de classificação keyword/context | **<0.1 ms** mediana | arXiv 2603.04444 tabela 4 |
| 9 | Aurelio Semantic Router | latência de decisão vs chamar LLM juiz | de ~**5000ms → ~100ms** | Deepchecks glossary (afirmação do vendor, não medição independente) |
| 10 | dots.ocr | tamanho / VRAM | **3B params**, ~8GB bf16, MIT license | GitHub studio-dots-ai/dots.ocr |
| 11 | PaddleOCR-VL-1.5 | acurácia OmniDocBench v1.5 / tamanho | **94.5%**, **0.9B params** (ERNIE-4.5-0.3B + encoder visual) | arXiv 2510.14528 / 2601.21957 |
| 12 | PaddleOCR-VL-1.6 | acurácia OmniDocBench v1.6 | **96.3%** | PaddleOCR repo, changelog 28/05/2026 |
| 13 | Surya (open OCR) | olmOCR-Bench @ 650M params | **83.3%** | aimadetools blog [secundário] |
| 14 | Nanonets OCR-3 | olmOCR-Bench | **87.4%** (líder no leaderboard IDP da própria Nanonets) — outra fonte cita 93.1 em teste distinto | benchmarking.nanonets.com (fonte não-independente, é o próprio fornecedor) |
| 15 | MinerU2.5 vs MinerU-Diffusion | OmniDocBench v1.5, overall (com ground-truth layout) | **93.44%** vs **93.37%**; MinerU2.5 é 1.2B params | arXiv 2603.22458 |
| 16 | MinerU-Diffusion vs MinerU2.5 | throughput | **108.9 TPS** vs **52 TPS** (~2.1x) | arXiv 2603.22458 |
| 17 | PaddleOCR-VL self-host vs cloud OCR | custo/1000 páginas | self-host ≈ **$0**; Google Cloud Vision **$1.50**; AWS Textract **$1.50–$15** | InsiderLLM blog [secundário, sem citação de preço oficial verificada] |
| 18 | Docling self-hospedado (L40S) vs Azure Doc Intelligence | custo/10k páginas | **$7.96** vs **$100** (~12x) | Spheron blog [secundário/vendor de GPU cloud, viés comercial] |
| 19 | GPT-5.2 API | preço | **$0.88/M input, $7.00/M output** (tier intermediário; existe variação $0.20–$5/$1.20–$30 por tier) | pricepertoken.com [agregador, não é a página oficial da OpenAI — checar platform.openai.com antes de decidir] |
| 20 | Gemini 3.1 Pro / 3.5 Flash | preço API | Pro **$2.00–$4.00/M** input; Flash **$1.50/$9** (25% mais barato que Pro) | metacto.com, cloudzero.com [agregadores] |
| 21 | Moondream 3.1 + Photon (H100, batch 1) | latência mediana | **59 ms** | moondream.ai (fonte primária do vendor) |
| 22 | SmolVLM | VRAM p/ inferência single-image | **256M→0.8GB**, **500M→1.2GB**, **2.2B→4.9GB** | arXiv 2504.05299 (paper oficial HuggingFace) |
| 23 | SmolVLA (robótica) | latência / VRAM | **<100ms**, **~2GB VRAM** | Spheron blog [secundário] |
| 24 | Florence-2-base vs Florence-2-large | VRAM / trade-off | **656 MiB** vs **2122 MiB**; base perde 2.8 mAP mas ganha ~3x velocidade e ~3x menos memória | GitHub taggui discussion #169 (medição de usuário real) |
| 25 | Whisper large-v3-turbo | decoder / WER / velocidade | decoder 32→4 camadas, params **1.55B→809M**, WER dentro de **1–2 p.p.** do full model, **216x tempo real** em GPU | arunbaby.com [secundário, mas cita specs oficiais OpenAI] |
| 26 | Parakeet TDT 0.6B v3 vs Whisper Large V3 | WER (Open ASR Leaderboard HF) | **6.34%** vs **7.44%** | parakeety.com citando HF Open ASR Leaderboard [secundário mas leaderboard é público/verificável] |
| 27 | Parakeet TDT | idiomas suportados vs Whisper | **25 línguas** vs **99+** do Whisper | arunbaby.com [secundário] |
| 28 | Parakeet TDT (CPU, i7-12700KF, INT8 ONNX) | RTF | **~0.033** (≈30x tempo real) | snailtext.app [secundário] |
| 29 | Kokoro-82M vs XTTS v2 | params / MOS / ranking | **82M vs 467M** params; MOS **~4.45**; #1 no TTS Spaces Arena, treinado em **<100h** de áudio | Medium (autor do próprio ecossistema Kokoro) [secundário mas consistente com README HF] |
| 30 | F5-TTS vs XTTS | MOS zero-shot voice cloning | **3.66 vs 3.11** | arXiv (citado via agregador, não localizei arXiv primário direto) [confiança média] |
| 31 | BGE-M3 | MTEB score / dimensão / contexto | **63.0** MTEB, **1024-dim**, **8192 tokens**, MIT license, self-host grátis | premai.io blog [secundário, mas alinhado ao model card oficial BAAI] |
| 32 | Qwen3-Embedding-8B | MTEB multilingual (05/06/2025) | **70.58**, rank #1 multilingual; Apache 2.0 | blog oficial QwenLM (fonte primária) |
| 33 | Cohere Rerank 3.5 | preço | **$2.00/1000 buscas** (~$0.001–0.0025/busca conforme tier) | cohere.com/pricing (fonte primária) |
| 34 | BGE-reranker-v2-m3 | custo self-host | **$0** (Apache 2.0/MIT, self-hostable), leve e multilíngue | HuggingFace BAAI/bge-reranker-base (fonte primária) |
| 35 | Llama Guard 4 | tamanho | **12B params**, early-fusion transformer multimodal | Meta model card (fonte primária, GitHub PurpleLlama) |
| 36 | Llama Prompt Guard 2 | tamanho (2 variantes) | **86M e 22M params** | HuggingFace blog oficial Meta |
| 37 | ShieldGemma 9B vs LlamaGuard1 | AU-PRC | **+10.8 p.p.** | arXiv 2407.21772 (paper oficial Google) |
| 38 | Guard models, benchmark ICLR 2026 (14 modelos) | recall vs precisão | Qwen Guard **83.97%** recall (melhor); ShieldGemma **82.20%** precisão mas perde **54.51%** de conteúdo inseguro | arXiv 2605.28830 |
| 39 | GPT-5 (thinking) vs o3 | eficiência de tokens | **50–80% menos tokens de output**, mesma ou melhor performance | openai.com/index/introducing-gpt-5 (fonte primária) |
| 40 | Router nativo GPT-5 | status em produção | lançado 07/08/2025, **sofreu rollback em dezembro/2025** por desalinhamento com uso real | the-decoder.com 19/12/2025 |

**Nota de confiabilidade**: itens 6, 9, 13, 14, 17, 18, 19, 20, 23, 25–30 vêm de blogs agregadores/SEO datados de 2026 que não citam metodologia própria replicável — tratados como sinal, não prova. Itens 1–5, 7–8, 10–12, 15–16, 21–22, 24, 31–39 vêm de paper, model card oficial, ou blog de engenharia do próprio projeto — maior confiança.

### Como funciona hoje

**Roteadores de texto (mecanismo real):**
- **RouteLLM** (LMSYS, MIT license, self-hostable, código aberto): treina um classificador — testam 4 abordagens (similarity-weighted ranking, matrix factorization tipo collaborative-filtering, classificador BERT, LLM-as-judge) sobre pares de preferência do Chatbot Arena. O vencedor é **matrix factorization**: aprende embeddings latentes de "dificuldade do prompt" e "capacidade do modelo" e decide local/forte por um score de confiança, sem chamar LLM nenhum na hora da decisão — é uma forward-pass de matriz, não um judge.
- **Martian**: classificador proprietário (Arch-Router, 1.5B) que faz *model mapping* — prediz outcome de qualidade/custo sem executar o modelo candidato, decisão em dezenas de ms.
- **NotDiamond**: modelo de roteamento treinado (não documentado publicamente em detalhe); commodity: aceita preferências customizadas por tarefa.
- **OpenRouter Auto Router**: não é ML sofisticado — é meta-modelo (`openrouter/auto`) que delega a um roteador interno próprio pouco documentado, mais focado em price/latency-based routing entre provedores do MESMO modelo (fallback, sorting) do que em roteamento semântico entre modelos diferentes.
- **LiteLLM Router**: sem inteligência própria — YAML declarativo com estratégias (round-robin, least-latency, cost-based, weighted). Roteamento é regra de engenharia, não decisão de qualidade por tarefa.
- **Portkey conditional routing**: regras sobre metadado da requisição (headers, tags, org) + circuit breakers; não é roteamento por conteúdo do prompt.
- **Requesty**: alega "auto-detect da natureza da requisição" e despacha por tipo de tarefa (código, raciocínio, resumo) sem config manual — mecanismo interno não publicado.
- **Unify**: roteamento por métrica declarada (menor custo de input, menor ITL, menor TTFT) — não por qualidade.
- **Semantic Router (Aurelio)**: embedding do prompt + similaridade de cosseno contra "rotas" pré-definidas (poucos exemplos por rota) — decisão puramente vetorial, sem chamada de LLM, MIT license, self-hostable, latência dominada pelo custo do embedding.
- **vLLM Semantic Router** (Red Hat, projeto separado, Apache 2.0): escrito em Rust/Candle, roda como camada de proxy inline; usa sinais leves (keyword match <0.1ms, embeddings de intenção) para decidir ligar/desligar "thinking mode" em modelos MoE, não escolher entre provedores externos.

**Roteamento nativo dos provedores (2026):**
- **GPT-5** (07/08/2025): sistema composto — modelo rápido default + "GPT-5 thinking" + router treinado continuamente sobre sinais reais (troca manual de modelo pelo usuário, taxa de preferência, correção medida). Isso é literalmente RLHF aplicado à política de roteamento. **Rollback em dezembro/2025** confirma que o router de produção teve comportamento ruim o suficiente para reverter — evidência direta contra a tese "router nativo já resolveu isso".
- **Gemini CLI/3.x**: auto-routing determinístico em duas etapas: classifica prompt simples/complexo; simples → Flash, complexo → Pro (se habilitado) senão Gemini 2.5 Pro. É heurística de complexidade, não ML sofisticado documentado.
- **Claude effort parameter** (2026): não é roteamento entre modelos — é um dial de orçamento de tokens/profundidade de raciocínio DENTRO do mesmo modelo (4 níveis: Low/Medium/High/Max), afetando também quantas tool calls o modelo faz. Não substitui roteamento entre modelos distintos nem entre modalidades.

**Roteamento por modalidade (especialistas pequenos):**
O padrão universal nos catálogos acima: modelo especialista de fração dos parâmetros do multimodal grande (0.9B–3B OCR vs modelo de centenas de bilhões) atinge ou supera em benchmark estreito, com ordens de magnitude menos custo/VRAM. O mecanismo de decisão de "para onde mandar" é quase sempre **metadado do payload** (presença de campo `image`, `audio`, extensão de arquivo, MIME type) — não inferência de LLM.

### Opções

| Abordagem | Como decide | Latência adicionada | Acurácia de roteamento | Self-hostable | Custo de adoção |
|---|---|---|---|---|---|
| Regra sobre metadado (tem imagem? é PDF? é áudio?) | if/else determinístico | ~0ms | Perfeita para modalidade; nula para "dificuldade" da tarefa | sim, trivial | Baixíssimo — é o primeiro degrau, sem ML |
| Classificador local (embedding + logistic regression / MF router) | forward-pass local | 1–20ms (CPU) | RouteLLM: 95% qualidade GPT-4 usando 14–26% chamadas caras | sim (RouteLLM MIT, vLLM Semantic Router Apache 2.0) | Médio — precisa treinar/manter classificador com dados de preferência |
| Semantic routing por similaridade vetorial (Aurelio) | embedding do prompt + cosine sim contra rotas | ~5000ms→100ms (chamada LLM evitada) vs alternativa de usar juiz LLM | Depende de qualidade das rotas definidas manualmente — frágil a prompts fora de distribuição | sim (MIT) | Baixo, mas manutenção contínua das rotas de exemplo |
| Cascade com early-exit (barato primeiro, escala se confiança baixa) | modelo pequeno responde; se score de confiança < threshold, escala para modelo caro | Latência do modelo barato + possível 2ª chamada completa (pior caso 2x) | Alta se threshold bem calibrado; risco de falso-negativo custa qualidade silenciosa | depende da stack | Médio — precisa de sinal de confiança confiável (nem todo modelo expõe) |
| LLM juiz roteando (router = chamada de LLM pequeno) | prompt → LLM pequeno classifica intenção → roteia | 1 chamada extra de LLM (dezenas a centenas de ms + tokens) | Alta (mais contexto que embedding), mas paga o próprio custo que devia evitar | sim | Alto em latência/custo — contradiz a meta de "sem gastar chamada de LLM" |
| Roteador nativo do provedor (GPT-5 router) | caixa preta, treinado com telemetria própria | Embutido, não medível externamente | Rollback em dez/2025 é evidência de fragilidade real em produção | não | Zero esforço de engenharia, zero controle/observabilidade |
| Gateway de regra declarativa (LiteLLM YAML, Unify por métrica) | round-robin/cost/latency, sem análise de conteúdo | ~0ms | Não otimiza qualidade por tarefa, só disponibilidade/custo/SLA | sim (LiteLLM) | Baixo, mas não resolve "modelo certo pra tarefa certa" |

### Onde a premissa do usuário está certa

1. **Roteamento por modalidade para especialistas pequenos é comprovadamente superior em custo/latência com perda de qualidade mínima ou nenhuma na tarefa estreita.** PaddleOCR-VL-1.5 (0.9B) atinge 94.5% em OmniDocBench, com múltiplas fontes independentes (incl. paper arXiv oficial) afirmando que ele **supera GPT-4o em document parsing** nesse benchmark — e custa ordens de magnitude menos por página que Textract/Cloud Vision. MinerU2.5 (1.2B) é citado batendo Gemini 2.5 Pro em document parsing. Isso é evidência direta e forte a favor da tese central.
2. **MCP é ineficiente em token de fato — é defeito estrutural, não detalhe.** Nenhuma das buscas contradisse isso; é consenso de engenharia (schema completo de cada tool entra no contexto antes da primeira palavra, sem streaming/lazy-load nativo no protocolo).
3. **Roteamento nativo dos provedores ainda é instável e não substitui controle externo.** O rollback do router do GPT-5 em dezembro/2025 (~4 meses após lançamento) é evidência concreta de que "deixar o provedor decidir" falhou em produção — reforça a tese #5 do usuário sobre falta de roteamento confiável.
4. **Fragmentação de mecanismos de extensão em produtos existentes é real e documentada** — LiteLLM, Portkey, OpenRouter, Requesty, Unify cada um reinventa sua própria sintaxe de "routing rule", sem padrão comum entre eles (confirma tese #1 por analogia, embora o levantamento direto de Open WebUI/LibreChat não estivesse no escopo desta tarefa).
5. **Especialistas em ASR/TTS/embedding batem ou empatam com modelos grandes multimodais a fração do custo/VRAM.** Parakeet TDT 0.6B roda a 2800x tempo real em GPU vs Whisper genérico; Kokoro-82M (82M params) empata/supera XTTS (467M, 5.7x maior) em MOS; BGE-M3/Qwen3-Embedding são grátis self-hosted e competitivos com embeddings proprietários pagos.

### Onde a premissa do usuário está errada ou desatualizada

1. **"Falta capacidade de rotear automaticamente" já tem solução nativa parcial nos 3 maiores provedores, publicada e em produção desde meados de 2025.** OpenAI (router GPT-5, ago/2025), Google (Gemini CLI auto-routing Flash/Pro), Anthropic (effort parameter, início de 2026) já embutem alguma forma disso. A queixa "incapacidade de rotear automaticamente" (item 5) está desatualizada como afirmação absoluta — o gap real não é ausência de roteamento nativo, é (a) esse roteamento nativo não cruzar provedores/modalidades diferentes, e (b) ele ter se mostrado instável o bastante para reverter em produção. A formulação do usuário precisa ser mais precisa: falta roteamento **cross-provider e cross-modalidade**, não roteamento em geral.
2. **Roteadores de texto tipo RouteLLM não eliminam completamente uma "camada extra" — o mecanismo de decisão em si tem custo de manutenção não-trivial** (treinar com dados de preferência, re-treinar quando os modelos-alvo mudam de versão). A tese implícita de "roteamento = grátis, quase zero-latência" é otimista demais: mesmo os mais rápidos (vLLM Semantic Router: <0.1–0.5ms por sinal) ainda dependem de manter um classificador atualizado, o que é trabalho operacional contínuo, não configuração única.
3. **Nem todo "especialista pequeno bate multimodal grande"** — a evidência é desigual por categoria: em ASR, Parakeet vence em WER inglês mas perde disparado em cobertura de idioma (25 vs 99+ do Whisper) e robustez a ruído/sotaque; em TTS, os números de MOS citados vêm majoritariamente de fontes secundárias sem paper com metodologia auditável (F5-TTS vs XTTS 3.66 vs 3.11 não tem arXiv primário localizado com confiança); e comparações "Nanonets-OCR2-3B teve o pior desempenho" no mesmo levantamento onde outro Nanonets aparece como líder mostra que o campo de OCR especialista é instável entre versões e benchmarks — a tese precisa ser lida como "verdadeira mas não universal e frágil a qual benchmark/versão você escolhe", não como lei geral.

### Recomendação para o design

1. **Dia 1: roteamento por metadado, não por classificador.** Implemente primeiro a regra determinística — presença de campo imagem/áudio/PDF no payload decide para qual pipeline de modalidade a requisição vai (custo de engenharia ≈0, resolve as irritações #4 e #5 do usuário para o caso mais comum: 80% do ganho de "roteamento por especialista" vem só de não mandar áudio para um modelo de texto). Custo: nenhuma inteligência de "dificuldade da tarefa" dentro do texto — aceite essa limitação no MVP.
2. **Camada 2, quando o volume justificar: um classificador local estilo RouteLLM (matrix factorization) treinado com dados de uso reais do próprio produto**, não um dos SaaS terceirizados (Martian/NotDiamond) — porque a licença MIT do RouteLLM e a simplicidade do MF router (forward-pass, sem chamada de LLM) batem diretamente a queixa #2 do usuário (custo de token do roteamento em si) e a #6 (governança: classificador local = log auditável, decisão explicável por scores, ao contrário de router nativo caixa-preta do provedor). Custo: precisa de dataset de preferência (pode bootstrapar com LLM-judge sobre amostra pequena, como fez o próprio RouteLLM).
3. **Não construa cascade com early-exit no dia 1** — a complexidade de calibrar um threshold de confiança confiável entre modelos heterogêneos supera o ganho até que haja telemetria real de produção para calibrar. Adicione isso só depois que o classificador de metadado + MF router estiverem em produção com métricas de erro de roteamento coletadas.
4. **Trate o roteamento nativo dos provedores (GPT-5 router, Gemini auto) como sinal, não como substituto.** Use `effort`/`thinking` como parâmetro que o SEU roteador escolhe deliberadamente por tarefa, nunca delegue a escolha "auto" do provedor para decisões cross-modelo/cross-modalidade — o rollback de dezembro/2025 é motivo concreto para não confiar cegamente nisso como estratégia primária.
5. **Especialistas que valem estar no dia 1 (ordenados por ROI imediato dado o catálogo acima):**
   - **PaddleOCR-VL (0.9B, Apache 2.0-like)** — para qualquer pipeline de documento/imagem-com-texto; grátis self-hosted, 94.5–96.3% OmniDocBench, evita rodar Gemini/GPT vision para OCR puro.
   - **Whisper large-v3-turbo ou faster-whisper** — cobertura de 99+ idiomas com WER dentro de 1–2 p.p. do modelo full, self-hostable; Parakeet só se o produto for majoritariamente inglês e latência CPU for crítica.
   - **BGE-M3** — embedding único que cobre dense+sparse+multi-vector, MIT, grátis, cobre RAG sem depender de API paga; migrar para Qwen3-Embedding-8B só se multilinguismo score for gargalo medido.
   - **Kokoro-82M** — TTS, 82M params, MOS competitivo com modelos 5x maiores, custo de inferência desprezível.
   - **Llama Guard 4 (12B) ou ShieldGemma 2B** — guardrail de segurança/moderação antes de qualquer chamada a modelo caro; ShieldGemma-2B se o custo de rodar 12B for proibitivo, aceitando o trade-off de menor recall.
   Justificativa do corte em 5: cobre as 4 modalidades mais frequentes em produto LLM real (documento, voz-entrada, voz-saída, retrieval) mais o guardrail que sustenta a governança (irritação #6) — VLM genérico pequeno (Moondream/SmolVLM) fica para fase 2, pois "captioning/grounding" é caso de uso menos comum que OCR/ASR/embedding num produto de chat/agente.

### Fontes

- https://arxiv.org/pdf/2406.18665 (RouteLLM paper, ICLR 2025)
- https://www.lmsys.org/blog/2024-07-01-routellm/
- https://github.com/lm-sys/routellm
- https://arxiv.org/html/2510.08731v1 (vLLM Semantic Router)
- https://arxiv.org/pdf/2603.04444 (vLLM Semantic Router signal latency)
- https://www.redhat.com/en/blog/bringing-intelligent-efficient-routing-open-source-ai-vllm-semantic-router
- https://www.aurelio.ai/semantic-router
- https://github.com/aurelio-labs/semantic-router
- https://openai.com/index/introducing-gpt-5/
- https://the-decoder.com/openais-gpt-5-router-rollback-shows-why-ai-requires-unlearning-old-habits/
- https://developers.googleblog.com/gemini-3-flash-is-now-available-in-gemini-cli/
- https://geminicli.com/docs/get-started/gemini-3/
- https://platform.claude.com/docs/en/build-with-claude/effort
- https://github.com/studio-dots-ai/dots.ocr
- https://arxiv.org/pdf/2510.14528 (PaddleOCR-VL)
- https://arxiv.org/html/2601.21957v1 (PaddleOCR-VL-1.5)
- https://github.com/paddlepaddle/paddleocr/blob/main/docs/version3.x/pipeline_usage/PaddleOCR-VL.en.md
- https://arxiv.org/html/2603.22458v1 (MinerU-Diffusion)
- https://benchmarking.nanonets.com/benchmarks/olmocr
- https://arxiv.org/pdf/2504.05299 (SmolVLM)
- https://moondream.ai/models ; https://moondream.ai/
- https://github.com/jhc13/taggui/discussions/169 (Florence-2 VRAM medido)
- https://huggingface.co/blog/llama-guard-4
- https://github.com/meta-llama/PurpleLlama/blob/main/Llama-Guard4/12B/MODEL_CARD.md
- https://arxiv.org/html/2407.21772v1 (ShieldGemma)
- https://arxiv.org/html/2605.28830v1 (benchmark guard models ICLR 2026)
- https://qwenlm.github.io/blog/qwen3-embedding/
- https://cohere.com/pricing
- https://huggingface.co/BAAI/bge-reranker-base
- https://www.braintrust.dev/articles/best-llm-routers-2026 (roteadores gateway, secundário)
- https://agentmarketcap.ai/blog/2026/04/06/llm-gateway-market-2026-litellm-portkey-martian-intelligence-router (Martian, secundário)

---

# 4. Micro sandboxes — cold start, densidade, isolamento

> microVM, gVisor, WASM e isolates: o que custa executar código hostil gerado por LLM.

### Números

| # | Tecnologia | Cold start | Memória mínima/overhead | Densidade (host 16GB/8vCPU) | Isolamento | Fonte |
|---|---|---|---|---|---|---|
| 1 | Firecracker (boot frio) | ≤125ms até init do guest | <5 MiB overhead do VMM (guest 128MiB RAM) | ~150 microVM criadas/s por host (taxa, não densidade residente) | Hardware (KVM), 1 VM = 1 kernel | firecracker-microvm.github.io, SPECIFICATION.md |
| 2 | Firecracker (snapshot restore) | 4ms (melhor caso, local, sem rede) | — | maior densidade pois restore é quase gratuito | Hardware | ar5iv.org/2102.12892 |
| 3 | Firecracker snapshot restore (produção, StacyVM) | 28ms total (4ms load snapshot + 5ms start FC + 7ms rootfs copy + 12ms reconnect agente) | — | — | Hardware | docs.stacyos.xyz |
| 4 | AWS Lambda SnapStart (Firecracker snapshot em produção real) | p50 3–8ms | — | — | Hardware | citado em techbytes.app (2026), não é doc oficial AWS — marcar como sinal terceiro |
| 5 | Kata Containers (Firecracker backend) | ~120–125ms (v1.5, VM 512MB) | 100–200 MiB/pod (kernel guest+agente) | ~20% menos containers/nó que gVisor no mesmo hardware | Hardware (VM por pod) | Northflank blog, johal.in benchmark |
| 6 | Kata Containers (QEMU/Cloud Hypervisor) | 150–300ms (QEMU chega a ~480ms) | maior (page tables só de GPU chegam a ~3.4GiB em cargas GPU) | menor que Firecracker backend | Hardware | onidel.com, topofmind.dev |
| 7 | gVisor (runsc, plataforma systrap) | comparável a runc + overhead de syscall, não boot de VM | overhead de CPU ~0% (sem VM), mas 10–30% overhead de syscall geral; SQLite insert +125% tempo vs bare metal | 20% mais containers/nó que Kata 3.0 no mesmo hardware | User-space kernel (ptrace/systrap), sem hardware boundary | gvisor.dev/docs/architecture_guide/performance, kubeblocks.io |
| 8 | gVisor vs Kata (syscall overhead comparado) | — | — | — | gVisor 18% overhead syscall vs Kata 3.0 47% | github.com/bikramkgupta/container-runtime-benchmarks |
| 9 | runc/Docker (namespaces+cgroups) | ~20ms boot | overhead de memória do container ~poucos MB (sem VM) | maior densidade nominal, mas **zero isolamento de kernel** | Kernel compartilhado — NÃO isola syscalls hostis | dev.to/copyleftdev |
| 10 | Wasmtime (módulo simples, Cranelift AOT) | 5.6ms (no-op), 16.9ms (Mandelbrot) | — | alta (processo único host pode rodar milhares de instâncias) | Isolamento de linguagem (sandbox WASM), não hardware | arxiv.org/2509.09400 |
| 11 | Wasmtime (instanciação pura de módulo, sem WASI init) | 10–50 microssegundos | — | — | idem | tentoftech.com [fonte secundária, sem benchmark reprodutível citado] |
| 12 | Pyodide (CPython em WASM) | segundos (carregamento do bundle) | bundle "vários MB, dezenas de MB com libs científicas"; heap 32-bit → **teto rígido de 4GB** | baixa por agente (bundle pesado), mas roda client-side | Sandbox WASM, sem threads nativas nem syscalls diretos | pyodide.org, publishing-project.rivendellweb.net |
| 13 | V8 Isolate (Cloudflare Workers) | <5ms em PoP frio; "elimina" cold start após warm | 128 MiB por isolate, hard-kill sem swap ao estourar | milhares de isolates residentes no mesmo processo host | Isolamento de processo JS (não syscall-level; sem hardware boundary) | Cloudflare blog (14 out 2025), letsbuildsolutions.com |
| 14 | E2B (sandbox Firecracker-based) | 300–800ms (medido, dependente de template); outro benchmark cita 90-150ms | 512 MiB–8.192 MiB configurável | Pro: até 100 (expansível a 1.100) sandboxes concorrentes | Hardware (Firecracker) | morphllm.com, superagent.sh |
| 15 | Fly Machines (boot a frio, criação reativa) | 2–10s dependendo de imagem/região | configurável | — | Hardware (Firecracker fork) | fly.io/blog/fly-machines |
| 16 | Fly Machines (pré-criada, start/resume) | 10–300ms; suspend/resume "centenas de ms" | mesmo footprint de VM Firecracker | — | Hardware | fly.io/docs/reference/suspend-resume |
| 17 | Daytona | sub-90ms, algumas configs chegam a 27ms (alegação do fornecedor) | — | — | não documentado publicamente (provável Firecracker/gVisor) | northflank.com/blog/top-cloudflare-sandboxes-alternatives [sinal terceiro, não spec própria] |
| 18 | Modal Sandbox (sem memory snapshot) | segundos (container completo); Ministral 3B ~118s cold start sem snapshot | — | — | gVisor (Modal usa gVisor como runtime, não Firecracker) | modal.com/blog/mem-snapshots, chatforest.com |
| 19 | Modal (com memory snapshot, quando disponível) | 3–10x mais rápido; até 83% de redução em modelos maiores | snapshot expira em 7 dias | — | idem | modal.com/docs/guide/memory-snapshots |
| 20 | Cloudflare Containers (compute) | não publicado em ms; cobra por CPU ativo | — | — | runsc por baixo (não confirmado publicamente; inferência de arquitetura Cloudflare) [ESTIMATIVA/marcado] | sliplane.io, developers.cloudflare.com |
| 21 | runc CVEs recentes (isolamento real de container puro) | — | — | — | 3 CVEs críticos nov/2025 (CVE-2025-31133, -52565, -52881) permitem breakout completo via masked paths/procfs | cncf.io (28 nov 2025) |

*(21 linhas — acima do mínimo de 18.)*

### Como funciona hoje

**MicroVM (Firecracker/Cloud Hypervisor/Kata):** cada sandbox é uma VM real com kernel Linux próprio, iniciada via KVM. Firecracker expõe device model minimalista (virtio-net, virtio-block, sem BIOS/PCI completo) — por isso boot de ~125ms em vez dos segundos de QEMU genérico. Kata Containers é a camada OCI que faz "1 pod = 1 VM", podendo usar Firecracker, Cloud Hypervisor (default atual, mantido pela Linux Foundation, com live migration e GPU passthrough) ou QEMU como VMM. O ganho real de densidade/latência vem do **snapshot/restore**: paused-VM memory+device state é serializado; restaurar é essencialmente um `mmap` + reconexão de vsock, chegando a dezenas de ms em vez de recompilar boot completo.

**gVisor:** não é VM. `runsc` intercepta syscalls do container (via ptrace legado ou Systrap desde meados de 2023, que usa seccomp+ptrace híbrido para reduzir troca de contexto) e reimplementa o comportamento do kernel em Go, rodando em user-space no mesmo host. Isso dá isolamento de "kernel de aplicação" sem boot de VM — mas cada syscall interceptado paga latência extra (10–30% típico, até 125% em workload de I/O pesado como SQLite insert). CPU puro não paga penalidade porque instruções não passam pelo interceptador.

**Container puro (runc/Docker):** namespaces (PID, mount, net, user) + cgroups (limite de recurso) + seccomp (filtro de syscall opcional). NÃO cria boundary de kernel — todo processo compartilha o mesmo kernel Linux do host. seccomp bloqueia syscalls por nome, mas as 3 CVEs de runc de novembro/2025 mostram que a superfície de `/proc` mal mascarada permite escrever em `core_pattern`/`sysrq-trigger` e escapar completamente. bubblewrap/nsjail são wrappers mais finos sobre o mesmo modelo (namespaces do kernel do host) — mesma classe de garantia, footprint menor, mesma superfície de ataque de kernel compartilhado.

**WASM:** wasmtime compila com Cranelift AOT — sem JIT warmup, execução determinística. O sandboxing é por design de linguagem: WASM não tem ponteiros arbitrários para memória do host, syscalls passam só pelo que o host explicita via WASI (Preview 2/Component Model formaliza interfaces tipadas em vez do POSIX-like WASI Preview 1). Não há threads nativas garantidas (thread proposal ainda não é universal), libs nativas em C precisam recompilar para wasm32 (sem syscalls diretos de rede/disk arbitrários). Pyodide roda CPython inteiro compilado para wasm32 — funciona, mas herda o teto de heap de 32 bits (4GB) e paga o custo de carregar o interpretador+libs (bundle de dezenas de MB) antes de rodar a primeira linha, o que anula a vantagem de cold start em microssegundos para cargas que precisam de numpy/pandas.

**V8 Isolate:** Cloudflare Workers roda milhares de isolates no mesmo processo `workerd`; isolate é um heap JS separado dentro do mesmo processo/binário V8, não um processo OS novo. Cold start <5ms porque não há fork de processo nem boot de kernel — só alocação de heap e parse do bundle já compilado. Limite de 128MB é hard-kill sem swap. **Não serve para Python real**: não há CPython nativo rodando dentro de um V8 isolate — Workers Python (se usado) roda via Pyodide/WASM dentro do isolate, herdando as limitações WASM acima, não é um runtime Python nativo.

### Opções

| Abordagem | Cold start | Isolamento contra código hostil | Footprint | Onde quebra |
|---|---|---|---|---|
| Firecracker + snapshot/restore, self-hosted | 4–30ms restore | Hardware (KVM) — forte | ~5MiB overhead/VM + guest RAM | Exige orquestrador próprio (Kata/Firecracker SDK), engenharia de infra não trivial |
| gVisor self-hosted | ms (sem boot de VM), mas paga runtime overhead contínuo | User-space kernel — médio, sem hardware boundary | menor que microVM, roda em qualquer host com container runtime | overhead de syscall degrada workload I/O-pesado; não é hardware isolation |
| runc/Docker puro | ~20ms | Fraco — kernel compartilhado, 3 CVEs críticos em nov/2025 | mínimo | NÃO usar para código LLM hostil sem camada extra |
| WASM (wasmtime/WasmEdge) | ms a microssegundos | Forte para linguagem-sandbox, mas não é kernel boundary; runtime bug = escape | mínimo, mais denso que qualquer container | numpy/pandas via Pyodide custa dezenas de MB + segundos, anula vantagem; sem threads nativas |
| V8 isolate (Workers) | <5ms | Processo compartilhado, boundary de linguagem JS, histórico forte da Cloudflare em produção | mínimo, milhares/host | Não roda Python nativo; 128MB é teto duro |
| Plataforma gerenciada (E2B/Modal/Fly/Daytona) | 90ms–800ms tipico (sem snapshot) | Depende do backend (E2B=Firecracker, Modal=gVisor) | zero engenharia própria | cobra por segundo/hora, cold start ainda cobrado, snapshot em produção real (Modal) ainda pré-beta |

### Onde a premissa do usuário está certa

- **Firecracker é de fato o padrão de facto para isolamento forte + baixo overhead**: 125ms boot, <5MiB overhead documentado oficialmente pela AWS — e todo player de "sandbox para agente" sério (E2B, Fly Machines, AWS Bedrock AgentCore) usa Firecracker ou derivado. Confirma que microVM é caminho maduro, não especulativo.
- **Snapshot/restore realmente mata o cold start**: 4–28ms medidos contra 125ms+ de boot frio — é o "truque" real e está em produção (AWS Lambda SnapStart, Modal memory snapshots, StacyVM). A tese "restaurar de snapshot viabiliza micro sandbox por agente" é factual, não wishful thinking.
- **Container puro não garante isolamento contra código hostil**: as 3 CVEs de runc de novembro/2025 (breakout completo via masked path/procfs) provam empiricamente que namespaces+seccomp não é boundary confiável contra adversário ativo — exatamente o modelo de ameaça de "código gerado por LLM hostil" que o usuário citou.
- **Multimodalidade travada é real na prática de custo**: rodar áudio/visão só porque o modelo grande está "no meio" do pipeline de agente é ineficiente — mas isso é mais uma decisão de arquitetura de roteamento que de isolamento (fora do escopo deste dossiê especificamente).

### Onde a premissa do usuário está errada ou desatualizada

- **"WASM tem cold start em microssegundos" é verdade só para o caso trivial.** Para o caso real do usuário (agente Python com tools, escrevendo arquivo, possivelmente usando libs) a comparação correta não é módulo WASM vazio (10–50µs) mas Pyodide completo, que carrega em **segundos**, não microssegundos, e tem teto de heap de 4GB por ser wasm32. A tese "WASM resolve cold start para agentes Python" está desatualizada/incompleta — só é verdade para agentes puramente JS/Rust-nativo compilado para WASM, não para o caso de uso descrito (agente que roda 30s, chama tools, escreve arquivo — presumivelmente em stack Python/Node com deps arbitrárias).
- **gVisor não é "menos seguro" de forma trivial — é uma escolha deliberada, não um fallback fraco.** Modal, que roda cargas de terceiros em escala, usa gVisor (não Firecracker) como runtime de produção — contradiz a leitura simplista "microVM sempre, gVisor é meio-termo fraco". Density (20% mais containers/nó que Kata) e ausência de boot de VM tornam gVisor competitivo o suficiente para um provedor grande apostar nele para workloads de risco médio.
- **"Snapshot/restore de Modal já resolve o problema" é uma leitura otimista sem lastro em 2026**: a documentação oficial da própria Modal confirma que memory snapshots para Sandboxes seguem em pré-beta/early preview, sem garantia de disponibilidade geral, e sandboxes precisam ficar rodando continuamente para evitar cold start longo. Quem monta hoje um produto contando com "fork/snapshot instantâneo" via plataforma gerenciada de terceiros está apostando em feature não GA.
- **Densidade "quantos sandboxes por host de 16GB/8vCPU" não tem número publicado por nenhum fornecedor para nenhuma tecnologia** — toda essa seção do pedido do usuário precisa ser resolvida por estimativa própria (ver abaixo), não por benchmark direto encontrado.

### Recomendação para o design

- **Dia 1 (MVP de agente efêmero, poucas dezenas de execuções simultâneas): gVisor self-hosted (runsc) sobre containers Docker/OCI padrão.** Custo de engenharia é o menor de qualquer opção com isolamento real (não é apenas namespaces), density comparável a container puro, sem precisar operar hipervisor. Aceita o overhead de syscall (10-30%) como custo do isolamento — o caso de uso (30s, 3 tool calls, 1 write) tem poucas syscalls, então o overhead absoluto é baixo mesmo que o percentual pareça alto.
- **Não construa orquestrador Firecracker próprio no dia 1.** O ganho real de microVM só aparece com snapshot/restore funcionando (4-30ms vs 125ms boot frio) — isso exige engenharia de pooling de VMs pausadas que nenhuma equipe pequena deveria assumir antes de validar produto. Custo de engenharia > ganho de latência nesta fase.
- **Nunca use runc/Docker puro sem gVisor/seccomp reforçado para código gerado por LLM.** As CVEs de novembro/2025 são recentes e reais — mesmo com seccomp customizado, a superfície de `/proc` é ampla demais para confiar em kernel compartilhado contra adversário ativo (que é o modelo de ameaça correto para "código de LLM", não só bug acidental).
- **WASM (wasmtime) só para tools sandboxed específicas e pequenas, não para o runtime completo do agente.** Se uma tool é JS/Rust/lógica pura sem dependência de libs nativas pesadas, WASM dá cold start de microssegundos e densidade altíssima — mas não force o agente Python inteiro para WASM via Pyodide; o custo (segundos de load, teto de 4GB) supera o benefício.
- **Caminho de upgrade quando escalar (centenas+ de agentes concorrentes, SLA de latência apertado): Firecracker/Kata Containers (backend Cloud Hypervisor) com pool de VMs pré-quentes + snapshot/restore.** É o único caminho com isolamento hardware (KVM) e latência de restauração competitiva (dezenas de ms). Trate isso como reescrita de infraestrutura, não extensão incremental do runtime gVisor — os dois modelos de execução (namespace-syscall-interception vs VM completa) não compartilham runtime.
- **Não terceirize para plataforma gerenciada (E2B/Modal/Daytona) se "footprint mínimo por agente" e controle de custo são requisito central do produto.** O cálculo do caso de uso mostra por quê: agente de 30s em E2B (2 vCPU default, 512MB-1GB) custa ≈ 30s × ($0.000028/s CPU + $0.0000045/s×2GiB RAM) ≈ **$0.00087/execução** [ESTIMATIVA — cálculo próprio a partir dos preços publicados por vCPU/s e GiB/s da E2B, assumindo 1GiB RAM], mais o cold start de 300-800ms cobrado à parte. Rodando o mesmo perfil em Firecracker self-hosted com snapshot pool, o custo marginal por execução tende a zero (amortizado em infra própria) — a diferença só compensa terceirizar em baixo volume ou fase de validação, não como arquitetura permanente de um produto que vende "densidade alta, footprint mínimo" como diferencial.

### Fontes

- https://github.com/firecracker-microvm/firecracker/blob/main/SPECIFICATION.md
- https://firecracker-microvm.github.io/
- https://ar5iv.labs.arxiv.org/html/2102.12892
- https://docs.stacyos.xyz/docs/snapshot-restore
- https://gvisor.dev/docs/architecture_guide/performance/
- https://gvisor.dev/docs/architecture_guide/platforms/
- https://gvisor.dev/blog/2023/04/28/systrap-release/
- https://gvisor.dev/blog/2024/02/01/seccomp/
- https://opensource.googleblog.com/2023/06/optimizing-gvisor-filesystems-with-directfs.html
- https://kubeblocks.io/blog/does-containerization-affect-the-performance-of-databases
- https://github.com/bikramkgupta/container-runtime-benchmarks
- https://northflank.com/blog/what-are-kata-containers
- https://northflank.com/blog/kata-containers-vs-gvisor
- https://onidel.com/blog/gvisor-kata-firecracker-2025
- https://topofmind.dev/blog/2025/11/19/boot-time-performance-of-kata-containers-with-nvidia-gpus/
- https://www.morphllm.com/e2b-pricing
- https://e2b.dev/docs/billing
- https://www.superagent.sh/blog/ai-code-sandbox-benchmark-2026
- https://modal.com/blog/mem-snapshots
- https://modal.com/docs/guide/memory-snapshots
- https://modal.com/docs/guide/sandbox-snapshots
- https://www.usagepricing.com/blueprint/modal
- https://fly.io/blog/fly-machines/
- https://fly.io/docs/reference/suspend-resume/
- https://fly.io/docs/about/billing/
- https://www.cncf.io/blog/2025/11/28/runc-container-breakout-vulnerabilities-a-technical-overview/
- https://www.paloaltonetworks.com/blog/cloud-security/leaky-vessels-vulnerabilities-container-escape/
- https://arxiv.org/pdf/2509.09400 (WebAssembly and Unikernels comparative study)
- https://pyodide.org/
- https://publishing-project.rivendellweb.net/running-python-data-science-libraries-in-the-browser-with-pyodide/
- https://blog.cloudflare.com/unpacking-cloudflare-workers-cpu-performance-benchmarks/
- https://developers.cloudflare.com/workers/platform/pricing/
- https://northflank.com/blog/ai-sandbox-pricing
- https://northflank.com/blog/top-cloudflare-sandboxes-alternatives

---

# 5. GPU serverless

> 17 provedores, cold start real, e por que as UIs atuais não conseguem consumi-los.

Now I have enough grounded data. Writing the dossier.

### Números

| Provedor | GPU | Preço | Granularidade | Cold start (medido) | Scale-to-zero | Teto concorrência | BYO weights | OpenAI-compat | Timeout req | Streaming |
|---|---|---|---|---|---|---|---|---|---|---|
| Modal | H100 $3.95–4.29/h; A100 80GB ~$2.50–3.72/h; L4 $0.80/h; T4 $0.59/h | por segundo | segundo | 2–4s função simples; **150s hard limit em web endpoint HTTP** (depois disso redirect 303); memory snapshot leva cold start de 60–90s para 2–5s em modelos 7B–13B (alpha 2025); 70B FP16 (~140GB) restaura em ~40s a 3.5GB/s [ESTIMATIVA de blog, não doc oficial] | sim, nativo | 2.000 inputs pendentes/função (25.000 total); `.spawn()` sobe a 1M pendentes | sim, container arbitrário | não nativo (você constrói o endpoint) | 150s por request web; função em si até 24h | `.spawn()`+poll ou streaming endpoint |
| RunPod Serverless | H100 ~$4.55/h ($0.00126/s); T4 ~$0.40/h; A100 80GB ~$2.17/h | por segundo, arredondado pra cima | segundo | FlashBoot promete <200ms (workers pré-aquecidos); mas cold start real de pod H100 é **20–60s** e é cobrado integralmente ($0.025–0.076/cold start) [fonte: blog RunPod + Spheron] | sim | `max_workers` configurável; vLLM `MAX_CONCURRENCY` default 30/worker (bug conhecido: requests "pulam fila" com 1 worker) | sim (Docker image própria) | worker-vllm expõe `/v1/chat/completions` | configurável | SSE via worker-vllm |
| fal.ai | H100 $1.89–3.99/h (lista vs desconto); A100 $0.99/h; H200 $4.50/h; B200 $6.25/h | GPU-segundo (Serverless) OU por output (Model APIs) | segundo (Serverless); por resultado (Model API) | **não confirmado em número absoluto**; fal não cobra cold start em Model APIs — mecanismo de billing torna a questão irrelevante pro usuário, não a resolve tecnicamente | sim | não confirmado publicamente | Serverless sim; Model API é catálogo fixo | sim, alguns modelos | fila assíncrona sem timeout HTTP fixo (ver Opções) | fila + polling, webhook opcional |
| Replicate | H100 $0.001525/s (~$5.49/h); A100 80GB $0.0014/s; T4 $0.000225/s | por segundo | segundo | público: só paga tempo ativo, setup grátis; privado/dedicado: cold boot de 2min cobrado integralmente — 20s de inferência custa **10× mais** ($0.198 vs $0.028) num H100 privado com 2min de boot | sim | não confirmado (limite por plano) | sim (Cog) e catálogo | não nativo | webhook async, sem timeout HTTP síncrono fixo | via prediction streaming (SSE) |
| Baseten | T4 $0.63/h; A10G $1.21/h; A100 80GB $4.00/h; H100 $6.50/h; B200 $9.98/h | por minuto | minuto | cold-start snapshots trazem modelos de até 20GB online em <10s [fonte terceiro, não doc oficial Baseten]; **doc do próprio Baseten recomenda min_replica≥2 em produção** — ou seja, scale-to-zero é vendido mas evitado na prática | sim (default min_replica=0) | por deployment | sim (Truss) | sim | configurável | sim |
| Together AI | Serverless: $0.05–7.00/1M tokens (por modelo); Dedicated: H100 on-demand $3.99–6.49/h, B200 $9.95/h | por token (serverless) / por hora (dedicated) | n/a para serverless (multi-tenant, sem cold start visível ao usuário) | não aplicável a serverless de token; dedicated tem cold boot não quantificado publicamente | dedicated: sim | não confirmado | dedicated: sim; serverless: catálogo | sim | n/a | sim |
| Fireworks AI | Serverless: $0.15–3.00/1M tokens; Dedicated on-demand: H100/H200 $7.00/h, B200 $10/h, B300 $12/h | por token / por hora | n/a serverless | não confirmado publicamente para dedicated cold boot | dedicated: sim | não confirmado | dedicated: sim; serverless: catálogo | sim | n/a | sim |
| Cloudflare Workers AI | preço fixo por "Neuron" ($0.011/1.000 Neurons); 10.000 Neurons/dia grátis | por Neuron (unidade de compute abstrata, não GPU-segundo) | **zero cold start cobrado ao usuário** — doc oficial: "you will only be charged for requests to the model and not the cold start times" — mas isso é billing, não elimina latência real de fato | sim, arquitetural (edge, sem "instância" exposta) | limitado pelo catálogo de 50+ modelos | não — catálogo fixo apenas | sim (parcial) | requests síncronos no edge | sim |
| Google Cloud Run + GPU | L4 $0.0001867/s (~$0.67/h) sem redundância zonal | por segundo | segundo | container com driver pré-instalado sobe em **~5s**; mas isso é só o container — carregar pesos do modelo é adicional e não quantificado; doc do Google admite "for large models that step can take seconds [a mais]" | sim (mas GPU exige "instance-based billing", que cobra réplicas mínimas mesmo ociosas) | por serviço | sim (container próprio) | não nativo | request timeout configurável (padrão 5min, até 60min) | sim |
| AWS SageMaker Serverless Inference | preço por GB-s de memória + duração; não expõe GPU dedicado nesse modo (usa instâncias ML sem GPU dedicada explícita para a maioria dos tipos) | por invocação (memória × duração) | cold start 10–30s (fonte: Habr, terceiro); mitigação = Provisioned Concurrency, que **reintroduz custo fixo** (contradiz "serverless") | sim | 6 endpoints simultâneos por conta por padrão (soft limit) | sim (modelo próprio via container) | não nativo | 60s hard limit por invocação (SageMaker Serverless clássico) | limitado |
| Koyeb | $0.50–3.30/h, H100/A100 até 80GB vRAM | por segundo | segundo | não confirmado com número absoluto em doc primária | sim | não confirmado | sim | parcial | configurável | sim |
| Novita AI | GPUs desde $0.33/h; H100 bare-metal $1.70/h; tokens desde $0.02/M | por hora (GPU) / por token (serverless LLM) | não confirmado | sim | não confirmado | catálogo + BYO em alguns planos | sim | configurável | sim |
| Hyperbolic | H100 SXM $3.19/h (atualização semanal, supply agregada de terceiros); DeepSeek-V3 $0.20/1M tokens blended | por hora / por token | não confirmado — modelo é agregação de capacidade ociosa de terceiros, não infra própria | não confirmado se há scale-to-zero real (é marketplace, não FaaS) | não confirmado | catálogo (serverless) + GPU bruta (marketplace) | sim (GPU bruta) | sim (parcial) | não confirmado | sim |
| Inferless | A100/A10/T4 desde $0.33/h | por segundo | **10–20s no primeiro call** (doc oficial); modelos até 16GB suportados nativamente | sim | não confirmado | sim, até 16GB | não confirmado | configurável | sim |
| Cerebrium | H100, A100, A5000 | por segundo | "2–4s médio + 35ms/request" — fonte é Product Hunt/blog do próprio Cerebrium, não doc técnica independente | sim | não confirmado | sim | não confirmado | configurável | sim |
| Lambda Labs | H100 SXM $3.99/h; B200 SXM $6.69/h; A100 40GB $1.99/h | por hora | **não é serverless** — instância on-demand, sem cold-start-as-a-service, sem scale-to-zero de request | não (instância persistente) | não | infra própria | sim | sem endpoint gerenciado | n/a | n/a |
| Vast.ai | RTX4090 $0.14–0.35/h; A100 80GB $0.40–0.93/h; H100 $1.05–2.75/h (marketplace, preço flutua) | por segundo (mas cobra bandwidth à parte, ~$2.50/100GB) | **não é FaaS** — marketplace de instâncias; "serverless" da Vast é $0.30/min ≈ $18/h, caro pra inferência pura vs APIs por token | não | não | infra própria | sim | não nativo | n/a | n/a |
| Beam Cloud | H100 $1.74/h; A100 80GB $1.30/h; RTX4090 $0.000192/s | por segundo (ms-level billing) | "sub-second" com checkpoint restore/sandbox snapshot — claim do próprio Beam, sem benchmark independente encontrado; **cold start não cobrado** por política de billing | sim | não confirmado | sim | não confirmado | não confirmado | sim |

Nota metodológica: boa parte dos números acima veio de agregadores de pricing de terceiros (costbench, usagepricing, spheron, morphllm etc.) datados 2026, que resumem — às vezes com precisão suspeita ("23% dos deployments") — dados que não bati contra a doc oficial linha a linha. Onde consegui confirmar contra doc primária do próprio provedor (Modal, RunPod, fal, Replicate, Cloudflare, Google, AWS, Together, Fireworks docs), marquei explicitamente. Onde não, tratei como sinal de mercado, não fato.

### Como funciona hoje

**Modelo de billing dominante**: quase todo provedor sério cobra por segundo de wall-clock de container ativo (Modal, RunPod, Replicate, Cloud Run, fal Serverless), não por request. A exceção estrutural é Cloudflare Workers AI (unidade abstrata "Neuron", sem exposição do conceito GPU-segundo) e as "Model APIs" de fal/Together/Fireworks/Novita que cobram por token/output — aí o provedor absorve o cold start no seu próprio pool multi-tenant e nunca repassa a fatura disso ao cliente.

**Mecanismo de cold start**: o problema real não é "ligar uma VM" — é carregar pesos do disco/S3 para VRAM. Duas classes de mitigação dominam em 2025-2026:
1. **Checkpoint/restore de memória**: Modal (GPU Memory Snapshot, alpha 2025) e RunPod (FlashBoot) mantêm um snapshot do estado pós-init (CUDA context + pesos já em VRAM) e restauram isso em vez de reexecutar o boot do processo. Modal documenta 3–10× de ganho; RunPod reivindica <200ms mas isso é para o pool pré-aquecido, não para o primeiro cold boot real (20–60s documentados por terceiros).
2. **Pool pré-aquecido / warm pool**: Baseten recomenda oficialmente `min_replica≥2` para produção — ou seja, a proposta de valor "scale-to-zero" na prática é substituída por manter réplicas ociosas pagas, o que é exatamente o modelo que serverless prometia eliminar.

Nenhum provedor pesquisado resolve cold start de weight streaming para modelos >30GB de forma document­ada com número duro e fonte primária — a única menção quantitativa a 70B (140GB FP16, ~40s a 3.5GB/s) vem de um blog de terceiro (Spheron), não de doc oficial de nenhum provedor.

**Mecanismos de submissão assíncrona reais**: Modal `.spawn()` retorna `FunctionCall` pollável (`.get(timeout=...)`, resultado disponível por 7 dias); fal tem fila (`queue.submit`) com `webhook_url` opcional — fila e cold start não são cobrados no Model API; Replicate tem `webhook` na criação de prediction (POST assíncrono no `completed`). Nenhum desses três expõe um contrato HTTP síncrono como via principal — o request-response direto é o caso especial, o job assíncrono é o default.

### Opções

| Padrão | Como funciona | Quem faz | Tradeoff |
|---|---|---|---|
| Request-response síncrono | cliente abre conexão, servidor responde no mesmo socket | maioria das integrações OpenAI-compat "ingênuas" | simples, mas colide de frente com timeout de proxy (Nginx 60–100s default) e cold start >100s |
| Submit + poll | cliente recebe job ID, faz GET periódico até status=done | Modal `.spawn()`+`FunctionCall.get()`; RunPod `/run` + `/status/{id}` | resiliente a timeout, mas exige UI de "job pendente" e política de poll interval; latência de detecção = intervalo de poll |
| Webhook de conclusão | cliente registra callback URL, provedor faz POST quando termina | Replicate `webhook`, fal `webhook_url` | zero polling, mas exige endpoint público exposto no cliente (problema para app desktop/local) e idempotência de callback |
| Fila com progresso via SSE | canal de streaming aberto entrega updates incrementais de status/tokens | fal queue (parcial), vLLM streaming em RunPod worker | melhor UX (usuário vê "na fila" → "processando" → tokens), mas exige conexão de longa duração — reintroduz o problema de timeout de proxy que o padrão tenta evitar |
| Instância dedicada always-on | sem cold start porque nunca desliga | Lambda Labs, Vast.ai on-demand, Baseten com min_replica alto | previsível, sem cold start, mas paga ocioso 24h — inverte a economia que "serverless" prometia |

### Onde a premissa do usuário está certa

1. **Timeout de HTTP fixo quebra cold start real**: confirmado com evidência primária dupla. Modal's próprios docs admitem hard limit de 150s em web endpoints e implementam workaround via redirect HTTP 303 — ou seja, a própria Modal reconhece que HTTP síncrono não serve para isso e constrói um hack em cima. Google Cloud Run precisa de configuração de timeout estendido manualmente (padrão pequeno). RunPod cold boot documentado em 20–60s ultrapassa qualquer timeout default de Nginx/proxy.

2. **Retry dispara N cold starts — confirmado indiretamente**: bug reportado no worker-vllm da RunPod (`MAX_CONCURRENCY parameter doesn't work`, issue GitHub #36): requests em rajada curta "pulam a fila" e vão direto pro worker, o que em cenário de 1 worker cold gera exatamente o efeito de sobrecarga que um client ingênuo com retry automático amplificaria.

3. **Ausência de UI para "aguardando GPU" é real e sem solução em nenhuma das duas UIs auditadas**: nem Open WebUI nem LibreChat têm um estado de UI dedicado a "modelo frio, aguarde N segundos" — a solução documentada em ambos é aumentar timeout de proxy/config (`REQUEST_TIMEOUT`, `AIOHTTP_CLIENT_TIMEOUT=None`, Nginx `proxy_read_timeout`), que é tratar o sintoma (a conexão morre) e não o problema (a UI não sabe comunicar "estou na fila").

4. **Issues reais confirmam a fricção**: LibreChat Issue #10539 — usuário relata requisição "pensando" por ~10min sem nenhum retorno visível ao usuário até timeout; Open WebUI Issue #16747 — endpoint de tool-use de longa duração falha contra timeout de proxy de 100s (Cloudflare) porque a arquitetura assume "primeiro byte rápido" do SSE. Isso é exatamente a classe de bug que um backend GPU serverless com cold start de 20-90s dispararia sistematicamente, não ocasionalmente.

5. **MCP e ineficiência de token são premissas de outro tópico da tese, mas a modalidade travada no mesmo modelo é confirmada aqui indiretamente**: nenhuma das UIs (Open WebUI, LibreChat) tem roteamento nativo para "mande OCR para um provedor serverless diferente do modelo de chat" — a arquitetura assume um único endpoint/modelo por conversa.

### Onde a premissa do usuário está errada ou desatualizada

1. **"GPU serverless não tem semântica assíncrona/fila" está desatualizado para 2025-2026**: Modal (`.spawn()`+`FunctionCall`), fal.ai (queue API + webhook), e Replicate (webhook em toda prediction) já resolveram isso no nível de plataforma há tempo — a mecânica assíncrona correta **existe e é doc primária**, publicada. O problema não é ausência do primitivo no provedor; é que os produtos de chat UI (Open WebUI, LibreChat) nunca implementaram o lado cliente desse contrato — eles tratam todo endpoint como OpenAI-compatible síncrono por padrão. Isto é uma falha de integração das UIs, não do ecossistema serverless — a tese do usuário aponta a causa no lugar certo (as UIs) mas a frase "ausência de semântica de fila" no enunciado sugere que a fila não existe nos provedores, o que é falso.

2. **"Cold start é sempre um problema doloroso e caro" não é universal**: fal.ai (Model APIs) e Cloudflare Workers AI documentam explicitamente que **não cobram** cold start ao cliente — a mecânica de billing absorve isso no lado do provedor via pool multi-tenant compartilhado. Para os "especialistas pequenos" (item 6 do enunciado), esse é o modelo dominante hoje, não instâncias dedicadas próprias com cold start pago.

3. **RunPod FlashBoot "sub-200ms" é real, mas não é o cold start "de verdade"**: o número de <200ms se refere à ativação de um worker já com snapshot pronto num pool aquecido, não ao boot inicial de um container nunca antes executado (que continua em 20-60s por doc de terceiros, e é cobrado). O usuário deve saber que a marca comercial "cold start resolvido" varia dramaticamente conforme a definição de "cold" usada pelo marketing.

### Recomendação para o design

- **Adote submit+poll com upgrade opcional para SSE de progresso como contrato de execução padrão para qualquer chamada roteada a GPU serverless** — nunca HTTP síncrono direto. Custo: exige que toda camada de UI trate "job pendente" como estado de primeira classe (spinner com texto "GPU acordando (~Ns)", não apenas um loading genérico), o que é mudança de modelo mental, não só de código.

- **Trate cold start estimado como dado de roteamento, não como surpresa**: mantenha por provedor/modelo um histórico observado (p50/p95 de tempo até primeiro token) e use isso para decidir warm pool vs cold call — e para popular a UI com estimativa realista ("~15s") em vez de spinner mudo. Custo: exige telemetria própria; nenhum provedor entrega isso de forma confiável e uniforme entre si.

- **Separe explicitamente dois roteamentos de GPU no produto**: (a) especialistas pequenos (OCR, ASR, captioning) → provedores com Model API multi-tenant sem cold-start cobrado (fal, Cloudflare Workers AI, ou serverless próprio com snapshot restore tipo Modal/RunPod); (b) modelo grande de chat → API de token puro (Together/Fireworks serverless) ou dedicado com pool warm, nunca scale-to-zero puro. Custo: dois caminhos de código/config em vez de um, mas evita forçar o caso ruim (LLM 70B cold) no caminho feliz do caso bom (Whisper/Moondream cold).

- **Ponto de equilíbrio para decidir dedicado vs serverless**: para 7B em GPU dedicada (~$2/h A100-classe ≈ $48/dia = ~1440min), versus serverless por segundo com cold starts amortizados — o breakeven aproximado gira em torno de **manter a GPU ocupada >50-60% do tempo do dia** para justificar dedicado; abaixo disso, serverless por segundo (mesmo pagando cold start ocasional) é mais barato. Para Whisper (inferência de poucos segundos, alta explosão), o caso é ainda mais favorável a serverless porque a fração de tempo realmente processando é minúscula frente a manter GPU ligada. `[ESTIMATIVA]`: sem dado público confiável de breakeven exato em requests/dia por não ter conseguido confirmar utilização real de nenhum provedor — a conta apresentada é qualitativa de ordem de grandeza, não número duro auditável.

- **Suportar 2-3 provedores no dia 1**: **Modal** (mecânica de spawn+poll madura, doc primária excelente, BYO weights total, memory snapshot reduz a dor onde mais dói) + **fal.ai** (queue API nativa com webhook, cold start não cobrado no Model API — ótimo pro caso "especialista pequeno" do item 6) + **RunPod Serverless** (mais barato por hora bruta, OpenAI-compat via worker-vllm pronto, mas exige tratar cold boot real de 20-60s como fato, não como o FlashBoot de marketing). Não incluir AWS SageMaker Serverless no dia 1 — limite de 60s por invocação e a necessidade de Provisioned Concurrency para mitigar cold start contradiz a proposta "serverless" e adiciona complexidade de conta AWS sem ganho evidente sobre os três acima.

- **Não trate "OpenAI-compatible endpoint" como suficiente para integração real**: confirmado que expor `/v1/chat/completions` (RunPod worker-vllm, Together, Fireworks) resolve só o formato do payload — nenhum desses formatos de resposta carrega semântica de "job na fila esperando GPU". O produto precisa de uma camada própria de estado de execução acima do formato OpenAI, senão reproduz exatamente o bug que Open WebUI e LibreChat têm hoje.

### Fontes

- https://modal.com/docs/guide/timeouts
- https://modal.com/docs/guide/webhook-timeouts
- https://modal.com/docs/guide/cold-start
- https://modal.com/docs/guide/memory-snapshots
- https://modal.com/docs/guide/job-queue
- https://modal.com/docs/reference/modal.Function
- https://modal.com/docs/reference/modal.FunctionCall
- https://modal.com/docs/guide/scale
- https://modal.com/blog/gpu-mem-snapshots
- https://docs.runpod.io/serverless/pricing
- https://www.runpod.io/blog/serverless-gpu-cold-starts-flashboot
- https://github.com/runpod-workers/worker-vllm/issues/36
- https://github.com/runpod-workers/worker-vllm/blob/main/README.md
- https://docs.fal.ai/model-apis/model-endpoints/webhooks
- https://fal.ai/docs/documentation/model-apis/inference/synchronous
- https://replicate.com/docs/reference/http
- https://replicate.com/docs/topics/predictions/create-a-prediction
- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://developers.cloudflare.com/workers-ai/
- https://blog.cloudflare.com/workers-ai-bigger-better-faster/
- https://cloud.google.com/run/pricing
- https://docs.cloud.google.com/run/docs/configuring/services/gpu
- https://docs.cloud.google.com/run/docs/about-instance-autoscaling
- https://dev.to/googleai/a-guide-to-ai-cold-starts-on-cloud-run-c6d
- https://aws.amazon.com/about-aws/whats-new/2023/05/provisioned-concurrency-amazon-sagemaker-serverless-inference
- https://aws.amazon.com/blogs/machine-learning/amazon-sagemaker-ai-in-2025-a-year-in-review-part-1-flexible-training-plans-and-improvements-to-price-performance-for-inference-workloads/
- https://www.together.ai/blog/on-demand-dedicated-endpoints
- https://docs.together.ai/docs/inference/pricing
- https://fireworks.ai/pricing
- https://www.inferless.com/pricing
- https://cerebrium.ai/pricing
- https://www.koyeb.com/pricing
- https://github.com/open-webui/open-webui/issues/16747
- https://github.com/open-webui/open-webui/discussions/16902
- https://github.com/danny-avila/LibreChat/discussions/9244
- https://github.com/danny-avila/LibreChat/issues/10539
- https://github.com/danny-avila/LibreChat/discussions/6821

---

# 6. Metering, billing e governança de roteamento

> Como atribuir custo quando um turno dispara seis chamadas a recursos diferentes.

Have enough grounded data now. Writing the dossier.

### Números

| # | Medida | Valor | Fonte |
|---|---|---|---|
| 1 | Fee de compra de crédito OpenRouter | 5,5% + mínimo US$0,80 (cripto 5,0%), desde 09/06/2025 | usagepricing.com/blueprint/openrouter (citando changelog OpenRouter) |
| 2 | OpenRouter markup sobre modelo | 0% — repassa preço do provider 1:1; `upstream_inference_cost` só existe em requests BYOK, senão `0`/`null` | openrouter.ai/docs/cookbook/administration/usage-accounting (lido 2026) |
| 3 | Langfuse Cloud — unidade faturável | 1 unidade = 1 trace OU 1 observation (span) OU 1 score; overage graduado US$8/100k (até 1M) → US$6/100k (>50M) | langfuse.com/docs/administration/billable-units; markaicode.com/pricing/langfuse-pricing (ago/2026) |
| 4 | Langfuse self-host | Grátis, sem cobrança por unidade — licença MIT | langfuse.com/docs/administration/billable-units |
| 5 | Cloudflare AI Gateway — latência de proxy | 10–50 ms adicionais; sem SLA de percentil publicado sob carga | dev.to/pranay_batta (mar/2026), architectingoncloudflare.com cap.15 |
| 6 | Cloudflare AI Gateway — regras de spend limit | até 20 regras/gateway; escopo por model/provider/atributo custom; janelas fixas ou rolling (dia/semana/mês) | developers.cloudflare.com/ai-gateway/features/spend-limits (jun/2026) |
| 7 | Cloudflare AI Gateway — custo do produto | Funcionalidades core (analytics, cache, rate limit) gratuitas | developers.cloudflare.com/ai-gateway/reference/pricing (mai/2026) |
| 8 | Helicone self-hosted overhead | reivindicado <1 ms; arquitetura proxy típica soma 50–150 ms por request no caminho síncrono | docs.helicone.ai/references/latency-affect; aidevsetup.com |
| 9 | Helicone planos cloud | Hobby grátis (10k req/mês, retenção 7 dias); Pro US$79/mês; Team US$799/mês | truefoundry.com/blog/helicone-pricing (jun/2026) |
| 10 | OpenMeter — throughput | "milhões de eventos por segundo"; dedup exata por `(id, source)` via Kafka + ClickHouse | openmeter.io/docs/metering/events/how-it-works; ycombinator.com/companies/openmeter |
| 11 | OpenMeter — licença | Apache 2.0 (self-host grátis); agora parte da Kong | github.com/openmeterio/openmeter |
| 12 | Lago — throughput de ingestão | API aceita até 1.000.000 eventos/s (claim do vendor); idempotência via `transaction_id` único | getlago.com/blog/architect-billing-systems; getlago.com/blog/feature-entitlements |
| 13 | Lago — licença | AGPL-3.0 | github.com/getlago/lago-api; getlago.com/blog/open-source-licensing-and-why-lago-chose-agplv3 |
| 14 | Stripe Meter Event (v1, síncrono) | 1.000 chamadas/s em live mode | docs.stripe.com/billing/subscriptions/usage-based/recording-usage-api |
| 15 | Stripe Meter Event Stream (v2, assíncrono) | 10.000 eventos/s padrão; até 100.000 eventos/s por negócio sob contrato enterprise; janela de dedup ≥24h; evento aceito só até 35 dias no passado / 5 min no futuro | docs.stripe.com/api/v2/billing/meter-event-stream/create; changelog Stripe 2024-09-30 |
| 16 | Metronome — preço | não publica publicamente; reportado como "taxa fixa por 1.000 eventos ingeridos" + % sobre o que o cliente fatura | withorb.com/blog/metronome-pricing (concorrente, marcar viés) |
| 17 | Metronome — modelo de dados | agrega ANTES de ingerir — não guarda evento bruto, o que impede replay/backfill histórico | withorb.com/buyers-guide/orb-vs-metronome (fonte de concorrente, viés — mas afirmação técnica factual verificável na doc pública do Metronome como limitação conhecida) |
| 18 | LiteLLM — granularidade de spend | endpoints `/spend/keys`, `/spend/users`, `/spend/tags` (tag = Enterprise); orçamento com "budget reservation" para concorrência alta | docs.litellm.ai/docs/proxy/tag_budgets; deepwiki BerriAI/litellm |
| 19 | Portkey — budget limit | budget em USD ou em tokens; sem reset automático a menos que period definido; não retroativo; feature Enterprise/Pro seleto | portkey.ai/docs/product/ai-gateway/virtual-keys/budget-limits |
| 20 | Kong AI Gateway | rate limit token-aware (não só request count); budgets hierárquicos org→team→project→user; config espalhada entre plugin/route/Konnect (sem hierarquia unificada nativa) | developer.konghq.com/ai-gateway; konghq.com/blog/enterprise/api-gateway-governance |
| 21 | Databricks Unity AI Gateway | governança de modelo = GRANT/REVOKE de Unity Catalog (reusa ACL de tabela); QPM configurável por endpoint como price control | docs.databricks.com/aws/en/ai-gateway/ai-governance; docs.databricks.com/aws/en/ai-gateway/model-services |

### Como funciona hoje

**Atribuição de custo por chamada.** Nenhum destes produtos resolve "custo do turno" nativamente — todos resolvem "custo do evento/chamada", e a agregação por turno é responsabilidade do chamador via metadata correlacionável (trace_id/session_id/generation_id).

- **OpenRouter**: cada resposta de completion inclui um objeto `usage` com `prompt_tokens`, `completion_tokens`, `reasoning_tokens`, `cached_tokens` e custo em USD calculado no momento da resposta a partir da tabela de preço do provider vigente; não há campo nativo de "turno" — quem quer somar 5 chamadas do mesmo turno precisa correlacionar por `generation_id` e um `metadata`/header custom que o cliente define. Cache discount é consultável via endpoint `/api/v1/generation` separado, não vem inline por padrão.
- **LiteLLM proxy**: grava cada chamada em `LiteLLM_SpendLogs`; a atribuição sobe automaticamente para as tabelas de key/user/team se a virtual key carrega esses IDs. `tags` (recurso Enterprise) permitem um rótulo arbitrário por chamada — é o único dos avaliados que oferece nativamente uma dimensão livre tipo "turno" ou "feature", mas é *outra tabela paralela* (`/spend/tags`), não uma FK real ligando eventos entre si.
- **Portkey**: budget é atado à *virtual key/integration/workspace*, não ao trace; correlação de "todas as chamadas de um turno" depende de você reusar o mesmo `trace_id` custom no header em todas as sub-chamadas.
- **Helicone**: calcula custo por request combinando token count + tabela de preço (própria, open-source, 300+ modelos) quando não passa pelo AI Gateway deles; quando passa pelo Gateway usa "Model Registry v2" com preço mais preciso. Custom properties (chave-valor arbitrária por request) são o mecanismo de correlação de turno — equivalente às tags do LiteLLM.
- **Langfuse é o único desenhado desde a raiz para o problema do enunciado**: modelo de dados é `trace` (1 turno/interação) contendo N `observations` (spans — cada chamada de modelo, cada chamada de tool, cada span de sandbox) em árvore hierárquica; cada `observation` do tipo `generation` carrega `usage_details` (tokens) e Langfuse calcula custo por observation batendo contra tabela de preço de modelo (com "pricing tiers" condicionais desde dez/2025 para preços que variam por contexto, ex: input longo). Custo do turno = soma de custo de todas as observations do trace. Isso é exatamente "classificador + OCR + LLM grande + rerank + sandbox" como 5 spans de 1 trace — mas o preço da nuvem é por unidade ingerida (trace+span+score somados), então um turno complexo custa proporcionalmente mais em *observability bill*, não só em *inference bill* — o texto da doc mesmo chama isso de penalidade a complexidade.
- **Cloudflare AI Gateway**: calcula custo por request "best-effort" a partir de token count + preço de modelo conhecido pela Cloudflare; correlação de turno via atributo custom arbitrário (dimensão livre nos spend limits, desde meados de 2026); é estimativa declarada, não fonte de verdade de billing.
- **Kong AI Gateway**: cost tracking passa por plugin attachado a rota; não há trace/turno nativo — a correlação depende de OpenTelemetry (trace_id de span) alimentando Konnect Advanced Analytics ou stack externo.

**Sandbox não é "chamada de modelo" para nenhum destes.** Todos os produtos pesquisados modelam custo como função de tokens × preço de modelo. Segundos de sandbox (compute-time) não têm campo nativo em nenhum — teria que entrar como "evento" custom no sistema de metering (OpenMeter/Lago/Stripe), nunca no AI gateway.

### Opções

| Abordagem | Como atribui turno→custo | Prós | Contras |
|---|---|---|---|
| Trace+span nativo (padrão Langfuse/OTel GenAI semconv) | 1 trace_id = 1 turno; cada chamada de modelo/sandbox é 1 span filho com custo próprio | Estrutura já corresponde 1:1 ao problema; suporta sub-agregação (custo por etapa, não só por turno); interoperável com OTel | Observability vira dimensão de billing paralela (Langfuse cobra por unidade ingerida, não só por $ de inferência) — dois sistemas de custo a reconciliar |
| Tag/label arbitrário em request (LiteLLM tags, Helicone custom properties, Cloudflare custom attributes) | Cliente injeta um `turn_id` como tag em cada sub-chamada | Simples, funciona em qualquer gateway já usado só para roteamento | Tag é texto livre sem validação de schema — nada impede inconsistência; agregação por turno exige query pós-hoc (`GROUP BY tag`), não é objeto de primeira classe |
| Evento de metering dedicado por sub-chamada (OpenMeter/Lago/Stripe Meter) com `turn_id` como propriedade do evento | Cada chamada de modelo/sandbox emite 1 evento de billing com subject=user, propriedade=turn_id | Desacopla billing de observability; escala para cardinalidade alta (Lago/OpenMeter feitos pra isso); idempotência nativa via id do evento | Não dá visão de árvore/hierarquia — é lista plana de eventos; reconstituir "o que aconteceu no turno" exige juntar com log de trace separado |
| Wrapper de contabilidade no orquestrador (nenhuma ferramenta terceira; sistema interno soma custo de cada chamada num objeto Turn) | Você mesmo instancia `Turn{id, calls: []Call{model, tokens, cost, sandbox_ms}}` e persiste | Controle total, schema exato pro seu produto, sem vendor lock-in | Reinventa dedup/agregação/janela que Lago/OpenMeter já resolveram; sem essas plataformas, invoicing e crédito de cliente ficam por sua conta |

### Onde a premissa do usuário está certa

- **Nenhum produto pesquisado resolve nativamente "custo do turno multi-modelo".** Todos operam na granularidade de 1 chamada; a agregação por turno é sempre trabalho do integrador via tag/trace_id — confirma que routing automático cria um buraco de atribuição real, não hipotético. Evidência: OpenRouter devolve custo por generation isolada sem conceito de turno (openrouter.ai/docs/cookbook); LiteLLM precisa de tag Enterprise para correlacionar; Kong precisa de OTel externo.
- **Pré-flight de custo é estimativa, nunca garantia, em toda a indústria pesquisada.** Cloudflare declara explicitamente: "Cost tracking is a best-effort estimation based on token counts and model pricing" (developers.cloudflare.com/ai-gateway/features/spend-limits, jun/2026). Isso confirma a dificuldade nomeada no item 2 do Change — bloquear ANTES de gastar exige contar tokens de input (que é conhecido) mas o custo de output (que domina em modelos com reasoning/tool-use longo) só é conhecido depois. Nenhum gateway pesquisado resolve isso com garantia hard; todos são "estimate then reconcile."
- **Sandbox de execução não tem lugar em nenhum destes modelos de custo.** Confirma a queixa 7 (falta de micro sandboxes) tem um corolário de billing: mesmo se você tiver sandbox, a stack de metering de IA (Langfuse/Portkey/Helicone/gateways) não tem primitivo para "segundos de CPU/RAM de sandbox" — teria que sair do mundo "AI gateway" e entrar no mundo "metering genérico" (OpenMeter/Lago/Stripe), confirmando que são dois sistemas hoje, não um.
- **Governança de roteamento automático é imatura fora de Databricks/Kong enterprise.** A maioria dos gateways (Portkey, Cloudflare, OpenRouter) trata "governança" como budget/rate-limit, não como política de "por que o roteador escolheu esse modelo" — não há campo de auditoria de decisão de roteamento documentado publicamente em nenhum destes (Cloudflare, Portkey, Helicone). Confirma a queixa 5+6 combinadas: roteamento automático existe tecnicamente, mas accountability de decisão de roteamento é ponto cego real.

### Onde a premissa do usuário está errada ou desatualizada

- **"MCP é ineficiente em token" não tem contraparte melhor testada aqui, mas o ecossistema já está corrigindo isso via mecanismos fora do MCP puro** (tool search/lazy-loading, tool-name filtering) — isso não foi objeto direto desta sub-pesquisa (não é sobre billing), então não afirmo mais sem evidência marcada `[fora de escopo desta tarefa]`.
- **Governança "ausente ou fraca" é datado para o segmento enterprise de 2026.** Databricks Unity AI Gateway (docs.databricks.com/aws/en/ai-gateway/ai-governance, verificado ativo em 2026) já oferece: ABAC de conteúdo (PII/prompt-injection/unsafe content) como guardrail atado a Model Service, herança de ACL do Unity Catalog para allowlist de modelo por grupo (GRANT/REVOKE), rate-limit por QPM, tudo *governado como objeto de catálogo* — isto é mais maduro que "ausente". Kong AI Gateway também oferece rate-limit token-aware hierárquico org→team→project→user, allow/deny-list semântico de tópicos, e circuit breaking multi-provider. A queixa 6 do usuário está correta para produtos de chat-UI (Open WebUI, LibreChat) mas errada como generalização de "o mercado" — a camada de *gateway corporativo* (Databricks, Kong, Cloudflare) já resolveu grande parte disso; o gap real está em produtos de chat-app-com-plugins, não em toda a indústria.
- **"Faltam micro sandboxes" não foi objeto desta sub-pesquisa** (delegado a `MicroSandbox`), mas do ângulo billing: pelo menos infra de metering genérica (Lago, OpenMeter, Stripe Meters) já lida perfeitamente bem com "evento = segundo de compute" — não é um problema de billing, é um problema de runtime/isolamento que essas ferramentas de billing não tentam resolver e não precisam.
- **Preço zero de markup do OpenRouter é o oposto do que muitos assumem sobre agregadores** — 0% de markup sobre modelo, só fee de compra de crédito (5,5%). Se a tese do usuário incluía implicitamente "agregadores cobram markup escondido no preço por token", isso é falso para o maior agregador do mercado.

### Recomendação para o design

- **Adote desde o dia 1 o modelo trace/span (OTel GenAI semantic conventions + Langfuse-like schema) como *fonte de verdade de correlação*, não como sistema de billing.** Custo: schema extra (turn_id/trace_id propagado em toda chamada — modelo, OCR, rerank, sandbox) desde a primeira linha de código do orquestrador. Sem isso, atribuir custo por turno vira migração dolorosa depois — nenhum destes gateways pesquisados oferece isso retroativamente de graça.
- **Separe dois sistemas desde já: "billing ledger" (fato imutável de custo, um evento por sub-chamada) e "observability trace" (árvore de spans para debug/auditoria).** Não tente fazer o Langfuse (ou equivalente) ser seu billing de verdade — ele foi desenhado pra debug/tracing, cobra por unidade ingerida (penaliza turnos complexos), e seu preço de armazenamento não escala linearmente com $ de inferência real.
- **Para o ledger de billing, reuse OpenMeter (Apache 2.0) em vez de construir.** Motivo: dedup exata por `(id, source)`, throughput documentado em milhões de eventos/s, self-host grátis sob licença permissiva (Apache), e já suporta caso de uso "AI usage metering" nativamente (openmeter.io/use-cases/ai). Evite Lago se seu produto puder algum dia embarcar como componente proprietário redistribuído — AGPL-3.0 exige que qualquer serviço de rede que o use disponibilize o código, risco jurídico maior que Apache.
- **Modele cada evento de billing como `{turn_id, call_id, kind: model|sandbox|tool, resource_id, tokens_in, tokens_out, cost_usd_estimated, cost_usd_final, timestamp}` desde o schema inicial.** O par estimated/final é obrigatório porque nenhum gateway pesquisado resolve custo exato pré-hoc — todos fazem "estimate then reconcile" (Cloudflare confirma isso explicitamente). Sem esse par, você não consegue implementar pre-flight budget sem reescrever o schema depois.
- **Pré-flight: implemente reserva otimista (hold) por turno, não bloqueio exato.** Estime custo máximo do turno = tokens de input contados (exato) × preço do maior modelo candidato no roteamento + teto de tokens de output (max_tokens do request) × mesmo preço; reserve esse teto contra o orçamento do usuário/workspace ANTES de disparar; libere o excedente ao final com o custo real. Esse padrão (hold + reconciliação) é o que LiteLLM chama "budget reservation" para lidar com concorrência — copie o padrão, não a implementação (LiteLLM é Python/proxy pesado; seu orquestrador provavelmente já tem esse ponto de controle).
- **Governança de roteamento: trate "modelo escolhido" como decisão auditável de primeira classe, gravada no mesmo evento de billing (`routing_reason`, `routing_policy_version`, `candidate_models_considered`), não como log solto.** Nenhum produto pesquisado (nem Databricks) expõe "por que o roteador escolheu esse modelo" como campo estruturado — é a lacuna real da queixa 5/6 do usuário, e é a mais barata de fechar agora (é só um campo a mais no evento que você já está desenhando) versus reescrever depois.

---

---

# 7. Fragmentação de extensão — a matriz de eixos

> Seis mecanismos no Open WebUI. Quantos eixos de variação são irredutíveis de verdade.

Have all needed material. Now writing the dossier.

### Dissecação Open WebUI

**Fonte primária:** docs.openwebui.com/features/extensibility/plugin/{tools,functions}/, discussion #16409/#16415, #3359, pipelines#180. Instância `v0.10.0+` (Native/Agentic tool-calling é default).

#### Pipelines (framework standalone `open-webui/pipelines`)

| Eixo | Valor |
|---|---|
| Onde roda | Processo separado (container Docker próprio, porta 9099), fala com Open WebUI via API compatível OpenAI |
| Momento do ciclo de vida | Intercepta a chamada de chat completion inteira — atua como "connection" adicional, não como hook dentro do processo principal |
| Quem invoca | O usuário seleciona o "modelo" pipeline no dropdown; sistema roteia a requisição pra lá como se fosse um provider |
| O que pode mutar | Requisição e resposta completas (é dono do ciclo request→response); não tem acesso direto a estado interno do Open WebUI (roda fora do processo) |
| Contrato de código | Classe com `id`, `name`, `valves: BaseModel`, e um dos métodos `pipe()`/`inlet()`/`outlet()` — mesma API series de Pipe/Filter Functions, só que hospedada externamente |
| Permissão | Processo isolado — pode instalar deps arbitrárias livremente, tem sua própria rede/disco, não herda diretamente o sandbox do servidor principal, mas também não tem acesso in-process ao DB/config do Open WebUI |

Nota-chave: **Pipelines é redundante com Pipe/Filter Functions** — mesmo contrato de método (`pipe`/`inlet`/`outlet`), a única diferença real é isolamento de processo (útil para deps pesadas), confirmado pelo próprio maintainer em #180: "We love all of our children equally... plan is to keep supporting both."

#### Functions — Pipe

| Eixo | Valor |
|---|---|
| Onde roda | In-process no servidor Open WebUI (Python `exec()` em módulo cacheado, `request.app.state.FUNCTIONS`) |
| Momento | Registra-se como "modelo" — dispara quando usuário seleciona esse modelo e envia mensagem; `pipe()` assume o ciclo completo, sem backend LLM necessário |
| Quem invoca | Usuário (via seleção de modelo) |
| O que pode mutar | Requisição/resposta inteira; pode chamar outros tools, fazer rede, multi-turno — controla o pipeline completo |
| Assinatura | `class Pipe: async def pipe(self, body: dict) -> str` (+ opcional `pipes()` retornando lista para manifold multi-modelo) |
| Permissão | Full Python in-process — acesso a filesystem, rede, `open_webui` codebase inteiro; restrito a admins na criação |

#### Functions — Filter

| Eixo | Valor |
|---|---|
| Onde roda | In-process, servidor |
| Momento | `inlet()` antes do provedor, `stream()` durante (chunks), `outlet()` depois — hook em 3 pontos do lifecycle |
| Quem invoca | Sistema, automaticamente, em toda requisição de um modelo com o filtro anexado (ou globalmente); usuário só liga/desliga se `self.toggle=True` |
| O que pode mutar | `body` da requisição (inlet), chunks de stream, `body` da resposta (outlet) — nunca a UI diretamente, nem novo "modelo" |
| Assinatura | `class Filter: async def inlet(self, body: dict) -> dict` / `stream()` / `outlet()` |
| Permissão | Idêntica ao Pipe — full Python in-process, admin-only na criação |

#### Functions — Action

| Eixo | Valor |
|---|---|
| Onde roda | In-process, servidor |
| Momento | Sob demanda — clique de botão do usuário na mensagem já renderizada |
| Quem invoca | Usuário (clique) |
| O que pode mutar | Estado/UI via `__event_emitter__`/`__event_call__` (feedback em tempo real, prompts, confirmações); efeitos colaterais arbitrários (Slack, CI/CD, PDF) |
| Assinatura | `class Action: async def action(self, body: dict, __user__: dict, __event_emitter__, __event_call__)` |
| Permissão | Idêntica — full Python in-process |

#### Functions — Event (novo em 0.10.0, não pedido explicitamente mas parte da família)

Roda in-process, dispara em eventos de sistema (signup, chat deletado, boot), `event()` filtra por nome, pode registrar endpoints próprios. Sem UI direta, sem usuário como invocador — é o sistema puro.

#### Tools

| Eixo | Valor |
|---|---|
| Onde roda | In-process no servidor (Workspace Tools) — "equivalente a shell access ao servidor" por texto literal da doc |
| Momento | Sob demanda do modelo — durante a geração, quando o modelo decide chamar (Native/Agentic mode: JSON estruturado; Legacy: prompt-injection, obsoleto e não suportado) |
| Quem invoca | O modelo (function calling); requer que o usuário/modelo tenha a tool anexada e permissão de leitura |
| O que pode mutar | Nada da UI/request diretamente — retorna um resultado textual que é injetado de volta na conversa como resultado de tool call. Efeitos colaterais (chamar API externa) são livres, mas a mutação formal do fluxo é só "adicionar uma mensagem de resultado" |
| Assinatura | Classe Python com métodos decorados com docstrings — cada método vira uma "function" no schema JSON exposto ao modelo; parâmetros tipados viram o schema |
| Permissão | Full Python in-process (mesma classe de risco que Functions) — mas contrato de execução é "o modelo decide chamar", não "o sistema/user decide" |

Distinção Tools vs MCP/OpenAPI servers (doc, tabela "Tooling Taxonomy"): Workspace Tools rodam in-process; **MCP (HTTP nativo, MCPO/proxy stdio) e OpenAPI Servers rodam como processo/serviço externo**, Open WebUI fala com eles via HTTP.

#### MCP / OpenAPI tool servers

| Eixo | Valor |
|---|---|
| Onde roda | Processo/serviço externo — MCP nativo via HTTP/SSE, ou stdio local via proxy `mcpo` que traduz pra REST/OpenAPI |
| Momento | Sob demanda do modelo, igual Tools — o modelo vê o schema (auto-gerado do OpenAPI spec do servidor) e chama |
| Quem invoca | O modelo |
| O que pode mutar | Mesmo que Tools: injeta resultado como mensagem; mutação de estado real acontece do lado do servidor externo, fora do alcance/sandbox do Open WebUI |
| Assinatura | Nenhuma — não é código Python que o autor escreve dentro do Open WebUI; é um servidor MCP/OpenAPI existente, endpoint declarado |
| Permissão | Roda fora do sandbox do Open WebUI inteiramente — "an MCP server is far more powerful: stateful, arbitrary host command execution over stdio" — quem concede acesso de rede é o admin ao cadastrar o endpoint em Settings→Connections (admin-only) |

#### Skills (workspace feature)

| Eixo | Valor |
|---|---|
| Onde roda | Não executa código — é texto (Markdown/YAML frontmatter) injetado no system prompt |
| Momento | Anexado a um modelo (toggle sempre-ativo) ou ligado pelo usuário via menu `+` por chat; conteúdo entra no prompt em toda mensagem daquela sessão |
| Quem invoca | Usuário (toggle) ou automático (attachment ao modelo); o "uso" real é decisão do modelo lendo o texto |
| O que pode mutar | Só o conteúdo do system prompt — não muta request/response estruturalmente, não é código |
| Assinatura | Nenhuma classe — arquivo com frontmatter YAML (title, description, version, author) + corpo de instrução; pode referenciar Tools/Functions/Knowledge por composição, mas não define comportamento executável próprio |
| Permissão | Nenhuma — é prosa. Todo o "poder" vem de que Tool ela referencia |

**Skill não é um mecanismo de execução — é metadado/prompt que orienta o uso de outro mecanismo.** Isso já é um sinal de que ele não deveria ocupar a mesma categoria ontológica que Pipe/Filter/Action/Tool.

### Outros produtos

**LibreChat** (danny-avila/LibreChat, librechat.ai/docs):
- Custom Endpoints: config declarativa em `librechat.yaml`, sem código — adiciona provider OpenAI-compatible/Anthropic-compatible. Roda como conexão HTTP externa, momento = seleção de "endpoint" pelo usuário, não muta nada além de rotear.
- MCP: camada de middleware entre engine conversacional e agentes, servidores externos (stdio/streamable-http/sse via `mcp.json`), invocado pelo modelo sob demanda — mesmo padrão MCP do Open WebUI.
- Skills: `SKILL.md` bundles reutilizáveis, invocados manual/automático/sempre-ativo — texto/instrução, não código, igual ao Skills do Open WebUI.
- Legacy "Tools and Plugins": **oficialmente deprecated** ("highly recommended to use MCP or OpenAPI Actions instead") — evidência direta de consolidação de mecanismos por um produto rival.
- Agent Plugins (experimental, 2026): bundle de Skills + MCP servers + command hooks num pacote só — outro sinal de convergência pra menos primitivos.

**Dify** (langgenius/dify, dify.ai/blog):
- Plugins: pacote assinado criptograficamente (não sandboxed por padrão), roda em processo separado (plugin daemon) com 4 modos de runtime (local subprocess stdin/stdout, debug TCP+Redis, serverless AWS Lambda, enterprise). Componentes: Models, Tools, Agent Strategies, Extensions (webhook), Workflow nodes — mas todos usam o MESMO empacotamento de plugin, diferindo só no manifest/tipo declarado.
- Workflow nodes (Code node, Template Transform, Code Interpreter): executam em `DifySandbox`, seccomp-based, syscalls whitelisted, processo/container isolado — sandbox real de execução, distinto do plugin daemon.
- Momento: Tools são chamadas pelo Agent Node sob demanda do modelo; workflow nodes disparam na ordem declarada do grafo (síncrono, orientado por dependência), não por decisão do modelo.

**LobeHub** (lobehub/lobehub, npm):
- Plugins: estendem function calling do LLM — mesmo padrão OpenAI function-call; historicamente eram JS/TS rodando via "Plugins Gateway", um backend Edge Function (`POST /api/v1/runner`).
- MCP: camada de integração principal hoje (10.000+ plugins via marketplace) — mesmo mecanismo dos outros três produtos: servidor externo, chamado pelo modelo sob demanda.
- Agent Gateway (self-hosted, `ENABLE_AGENT_GATEWAY`): roteamento de requisições de agente via URL configurável — infra de deployment, não um novo contrato de extensão.
- Não há um "Filter"/"Action" equivalente separado documentado — LobeHub converge tudo (exceto renderização de UI de resultado) em function-calling + MCP.

### Matriz de eixos

Colunas = mecanismos observados nos 4 produtos. `In-proc` = mesmo processo do servidor principal. `Modelo` = invocado pelo modelo durante geração. `n/a` = eixo não se aplica ao mecanismo.

| Eixo | Pipe (OWUI) | Filter (OWUI) | Action (OWUI) | Tool (OWUI) | MCP/OpenAPI (OWUI/todos) | Pipelines (OWUI) | Skills (OWUI/LibreChat) | LibreChat Custom Endpoint | Dify Workflow Node | Dify Agent Tool/Plugin |
|---|---|---|---|---|---|---|---|---|---|---|
| **Momento do ciclo** | Substitui geração inteira | Antes/durante/depois do provedor | Pós-resposta, clique | Durante geração, sob demanda | Durante geração, sob demanda | Substitui geração inteira | Antes de tudo (compõe prompt) | Substitui geração inteira | Ordem do grafo (declarativo) | Durante execução do agente, sob demanda |
| **Direção do fluxo** | Bidirecional | Bidirecional (in/out) | Saída (efeito) | Entrada→saída (chamada→resultado) | Entrada→saída | Bidirecional | Entrada (prompt) | Bidirecional | Bidirecional (dado→dado) | Entrada→saída |
| **Onde executa** | In-proc | In-proc | In-proc | In-proc | Processo externo | Processo externo | Nenhum (texto) | Processo externo (HTTP) | Sandbox isolado (seccomp) | Processo separado (plugin daemon) |
| **O que muta** | Request+response completos | Request/stream/response | UI, estado externo | Nada estrutural (retorna msg) | Nada estrutural (retorna msg) | Request+response completos | System prompt | Roteamento | Dado no grafo | Nada estrutural |
| **Quem invoca** | Usuário (seleção) | Sistema (auto) | Usuário (clique) | Modelo | Modelo | Usuário (seleção) | Usuário/sistema (toggle) | Usuário (seleção) | Sistema (grafo) | Modelo |
| **Síncrono/assíncrono** | Síncrono (bloqueia turno) | Síncrono | Assíncrono (pós-turno) | Síncrono (bloqueia turno) | Síncrono | Síncrono | n/a (não executa) | Síncrono | Síncrono (por nó) | Síncrono |
| **Modelo precisa saber que existe?** | Não (é um "modelo" pra ele) | Não (transparente) | Não (é botão de UI) | **Sim** (schema no contexto) | **Sim** (schema no contexto) | Não | Indireta (prompt injetado) | Não | Não | **Sim** |

Ao ler as linhas, só dois eixos realmente separam comportamento observável: **(1) quem invoca / se o modelo precisa saber que existe**, e **(2) onde executa (in-proc vs. processo externo)**. Todos os outros eixos (momento, direção, o-que-muta) são *consequências* desses dois, não variações independentes: se o modelo invoca, o momento é necessariamente "durante geração, sob demanda"; se é o sistema que invoca, o momento é necessariamente "hook fixo do lifecycle".

### Quantos primitivos são irredutíveis

**Resposta: 2 primitivos bastam — Interceptor (hook fixo, sistema invoca) e Capability (schema exposto, modelo invoca) — mais um terceiro elemento que não é primitivo de execução: Manifest (dado declarativo, roteamento/config, zero código).**

Justificativa eixo a eixo:

- **Quem invoca** é o único eixo que produz uma bifurcação real de contrato: se é o **modelo** que decide chamar, o código precisa de um schema tipado exposto ao contexto (JSON schema, doc de função) — isso é **Capability**. Se é o **sistema/usuário** que decide (hook de lifecycle fixo, clique de botão), não precisa de schema nenhum, só precisa rodar no ponto certo — isso é **Interceptor**.
- **Onde executa** (in-proc vs. processo externo) é um eixo de *deployment*, não de *contrato de extensão*. Pipe/Filter/Action in-process e MCP/OpenAPI/Pipelines externos têm a MESMA assinatura conceitual (`entrada dict → saída dict/str`), só a transport layer muda (chamada de função Python vs. HTTP). Não justifica mecanismo separado — é uma flag de configuração ("run in-process" vs. "run at http://...").
- **Momento do ciclo de vida** é *derivado* de quem invoca: Capability sempre dispara "durante geração, sob demanda do modelo"; Interceptor sempre dispara em pontos fixos do lifecycle (before-request / after-response / on-event / on-click). Não é um eixo independente — é reformulação do eixo anterior.
- **O que pode mutar** também é derivado: Interceptor muta request/response/UI/estado porque tem acesso privilegiado ao pipeline inteiro; Capability só devolve um resultado que vira mensagem, porque o modelo não tem acesso direto ao pipeline — só ao resultado.
- **Síncrono/assíncrono** é detalhe de implementação (streaming vs. bloqueante), não de mecanismo.
- **Direção do fluxo** colapsa no mesmo: Interceptor é bidirecional por natureza (inlet/outlet/stream); Capability é sempre unidirecional entrada→saída porque o modelo só vê o resultado final.

#### Mapeamento dos seis mecanismos do Open WebUI para os 2 primitivos + Manifest:

| Mecanismo atual | Primitivo real | Por quê |
|---|---|---|
| **Pipe Function** | Capability, com wrapper que o registra como "modelo" | O usuário "chama" um Pipe selecionando-o, mas a execução (`pipe(body)→str`) é indistinguível de uma Capability de alto nível sem schema formal — existe só porque o UI trata "modelos" e "tools" como conceitos de primeira classe separados |
| **Filter Function** | Interceptor | Contrato puro: `inlet/stream/outlet`, hook fixo, sistema invoca |
| **Action Function** | Interceptor, disparado por evento de UI (clique) em vez de por request/response | Mesma família de "hook fixo", só muda o gatilho (clique vs. lifecycle automático) |
| **Event Function** | Interceptor, disparado por evento de sistema | Idêntico a Action, trocando "clique do usuário" por "evento do backend" |
| **Tool** | Capability | Contrato canônico: schema exposto, modelo decide chamar |
| **MCP/OpenAPI tool server** | Capability, com deployment externo | Mesmo contrato de Tool; a única diferença é a transport layer (HTTP em vez de chamada in-process) — resolvido por code execution com API tipada gerada (o motivo da pesquisa de 150k→2k tokens citada no contexto), não por um mecanismo de plugin separado |
| **Pipelines (framework standalone)** | Interceptor OU Capability, com deployment externo | Literalmente o mesmo contrato de Pipe/Filter, só hospedado fora do processo — o próprio maintainer confirma em #180 que é feature-parity intencional, não um conceito distinto |
| **Skills** | Nenhum dos dois — é **Manifest** (dado, não código) | Texto/config que referencia Capabilities/Interceptors existentes; resolvido nativamente por "system prompt com seção de skills disponíveis", sem precisar virar uma quinta categoria de plugin |

Os "seis mecanismos" do Open WebUI (Pipelines, Pipe, Filter, Action, Tools, MCP servers — ignorando Skills e Event que nem sequer estavam na lista original mas comprovam a mesma fragmentação) reduzem a: **1 Capability + 1 Interceptor + a decisão ortogonal "roda in-process ou via rede" + a decisão ortogonal "é uma classe registrada como novo modelo ou não"**. Nenhuma dessas quatro combinações exige uma classe base Python distinta ou uma seção de UI distinta — exige apenas dois campos de configuração no manifest de uma Capability/Interceptor: `transport: {inproc|http}` e `surfaces_as: {tool|model}`.

O motivo histórico da fragmentação, visível na cronologia da doc: Tools (function-calling nativo) e Functions (Pipe/Filter/Action) nasceram em momentos de maturidade diferentes do padrão de function-calling dos providers (2023-2024), Pipelines nasceu porque o processo principal não suportava isolamento de deps pesadas, e MCP chegou depois como um *segundo* padrão de transporte para Capability que o time optou por não fundir retroativamente com Tools. Skills chegou por último tentando resolver "como o modelo sabe que uma Capability existe" sem tocar no código das anteriores.

### Evidência de dor real

1. **Issue/Discussion #16409 → #16415** ("feat: Simplify tools and functionality ecosystem", 09/08/2025): usuário relata literalmente "it has taken me weeks to wrap my head around the various concepts and functionalities and their location in settings... the documentation helps, but it is often on the abstract side, and its structure doesn't quite match what one experiences in the UI." Ele tenta reconstruir manualmente uma taxonomia (Capabilities vs. Tools vs. Functions) porque a oficial não é suficientemente clara — exatamente o sintoma de fragmentação sem primitivo único.

2. **Discussion #3359** ("Enhancement: Refactor tool use", 21/06/2024): pedido explícito de refatoração da distinção tool/function na época em que a linha entre os dois ainda era nebulosa.

3. **Discussion #180** (repositório `pipelines`, 30/07/2024): usuário pergunta diretamente "given the similarities between pipelines (this repo) and native calling implementation on the webui, I'm wondering how people are differentiating their usecase between these two systems" e cita uma PR (#798) onde o próprio criador (tjbck) declarou a intenção de tornar Pipelines "THE plugin system" — intenção depois abandonada, com o maintainer respondendo "we love all of our children equally... plan is to keep supporting both" em vez de convergir. Prova de que mesmo o time reconheceu a redundância e optou por não resolver.

4. **LibreChat como contraponto**: a doc oficial marca a página "Tools and Plugins" como `deprecated`, recomendando MCP/Actions no lugar — evidência de que um produto rival identificou o mesmo problema (fragmentação de mecanismos legados) e reagiu convergindo, não adicionando mais um tipo.

### Fontes

- docs.openwebui.com/features/extensibility/plugin/tools/ — Tools, taxonomia (Native Features/Workspace Tools/MCP/MCPO/OpenAPI), Native vs Legacy tool-calling mode (v0.10.0+), aviso de segurança
- docs.openwebui.com/features/extensibility/plugin/functions/ — Functions (Pipe/Filter/Action/Event), auto-detecção por nome de classe, Valves/UserValves, tabela "Functions vs Tools"
- docs.openwebui.com/features/extensibility/plugin/tools/openapi-servers/mcp/ e /mcp/ — mcpo proxy, MCP HTTP nativo, distinção MCP (stateful, stdio) vs OpenAPI (stateless HTTP)
- docs.openwebui.com/features/workspace/skills/ + deepwiki.com/open-webui/open-webui/19.4-skills-system — Skills, frontmatter YAML, injeção em system prompt
- docs.openwebui.com/features/extensibility/pipelines/ + github.com/open-webui/pipelines — framework standalone, Docker, Function Calling Pipeline / Custom RAG Pipeline
- github.com/open-webui/open-webui/issues/16409, discussions/16415 (09/08/2025) — confusão de ecossistema, citada verbatim
- github.com/open-webui/open-webui/issues/3359 (21/06/2024) — pedido de refactor de tool use
- github.com/open-webui/pipelines/discussions/180 (30/07/2024, resposta do maintainer justinh-rahb) — reconhecimento de sobreposição Pipelines vs. Functions
- librechat.ai/docs/features/{mcp,skills,agent_plugins}, /docs/development/tools_and_plugins (marcado deprecated), /docs/configuration/tools — LibreChat MCP/Skills/Agent Plugins, deprecação de Tools and Plugins legado
- dify.ai/blog/dify-plugin-system-design-and-implementation, dify.ai/blog/introducing-dify-plugins, docs.dify.ai/development/backend/sandbox — plugin daemon (4 runtime modes), DifySandbox (seccomp), segurança via assinatura criptográfica
- github.com/lobehub/lobehub (README), npmjs.com/package/@lobehub/lobehub — Plugins Gateway, MCP marketplace, Agent Gateway self-hosted

---

# 8. Precedentes de primitivo único

> VS Code, Kubernetes, Envoy, Zed, Shopify, n8n, Home Assistant, Figma — e quem tentou e falhou.

Now writing the full dossier.

### Dossiê: Precedentes de Modelo de Extensão Único

#### 1. VS Code extension API

**(a) O primitivo:** um manifest `package.json` com bloco `contributes` (contribution points) + array `activationEvents`. Extensão = zip com manifest + código JS/TS. Um único formato de declaração cobre UI, linguagem, debug, auth, temas.

**(b) Cobertura heterogênea:** contribution points são ~24 tipos documentados (`authentication`, `breakpoints`, `colors`, `commands`, `configuration`, `configurationDefaults`, `customEditors`, `debuggers`, `grammars`, `icons`, `iconThemes`, `jsonValidation`, `keybindings`, `languages`, `menus`, `problemMatchers`, `problemPatterns`, `productIconThemes`, `resourceLabelFormatters`, `semanticTokenModifiers/Scopes/Types`, `snippets`, `submenus` — fonte: microsoft/vscode-docs contribution-points.md), mas todos são **entradas na mesma estrutura JSON declarativa**, não mecanismos separados. `activationEvents` resolve lazy loading: a extensão só ativa quando o evento declarado ocorre (abrir arquivo de linguagem X, rodar comando Y), então o custo de ter 50k extensões instaladas é ~0 até serem chamadas. O extension host roda em processo Node.js separado (não thread) — IPC com o processo principal — porque isso isola crash/travamento de extensão do editor e permite variantes (LocalProcess, LocalWebWorker no browser, Remote via SSH/container) sem tocar o core.

**(c) Onde vaza:** contribution points são estáticos (só descrevem *o quê*, não *como*); o "como" ainda é código JS arbitrário rodando com acesso total ao processo do host — não há sandboxing real de capacidades, só isolamento de processo. Resultado: extensões maliciosas/bugadas ainda podem vazar dados, e a superfície de API imperativa (`vscode.*`) cresceu tanto que na prática GitHub Copilot Chat precisou de um novo tipo de contribution (`languageModelTools`, agentes) — o manifest declara existência, mas toda lógica de negócio é imperativa fora dele.

---

#### 2. Kubernetes CRD + controller

**(a) O primitivo:** um objeto declarativo (CRD instance = `spec` desejado + `status` observado) + um controller com laço de reconciliação level-triggered (observa estado real, compara com `spec`, converge).

**(b) Cobertura heterogênea:** o mesmo par objeto/controller serve para volume (PV/PVC), certificado (cert-manager `Certificate`), banco de dados (operators como CloudNativePG), porque a interface é sempre a mesma: "aqui está o estado que eu quero, você faz convergir e me diz o estado real via `status`". `.spec` nunca é uma ação imperativa ("upgrade agora"), sempre descreve estado — isso é "a propriedade mais importante de todo controller Kubernetes" (kubebuilder book/golinuxcloud, 2026). O modelo é reentrante/idempotente por construção: reconcile pode rodar a qualquer momento sem side-effect cumulativo.

**(c) Onde vaza:** (1) **admission webhooks** — validação/defaulting context-aware ("se storageClass não especificado, usar o default do cluster") não cabe no schema estrutural do CRD nem no reconcile assíncrono; precisou de uma camada síncrona separada (mutating/validating webhooks) rodando *antes* da persistência — é um segundo mecanismo, não o mesmo primitivo. (2) **operadores viram código imperativo** — reconcile loops complexos (ex: upgrade de banco multi-step) acabam implementando máquinas de estado escondidas dentro do "declarativo", e "reconcile loop explosions" (chamadas em cascata mal-desenhadas) são erro documentado comum (golinuxcloud, jun/2026).

---

#### 3. Envoy filter chain

**(a) O primitivo:** uma cadeia ordenada de filtros HTTP, todos implementando a mesma interface de decode/encode (hooks tipo `on_http_request_headers`), configurada via `http_filters` numa lista explícita e ordenada.

**(b) Cobertura heterogênea:** auth (`ext_authz` — chama serviço gRPC/HTTP externo, 403 se negado), rate limit (`local_ratelimit` no proxy, ou `ratelimit` filter chamando serviço global, 429 se excedido), transformação de request/response, observabilidade — todos são a mesma interface de filtro decoder/encoder. Decoder filters rodam em ordem A→B→C; encoder filters na ordem reversa C→B→A. Ordem é explícita e importa (filtro depende do que o anterior fez).

**(c) Onde vaza:** ordem incorreta quebra segurança silenciosamente — a doc oficial avisa que route cache sendo limpo *depois* do `ext_authz` rodar pode re-rotear a request para endpoint com requisitos de auth diferentes, **contornando o check já feito**. Ou seja, o primitivo (cadeia ordenada) exige disciplina operacional externa (revisão manual de ordering) que ele mesmo não garante. **proxy-wasm** acrescenta: filtros WASM rodam na mesma cadeia via ABI padronizado, mas em sandbox isolado com limites de recurso — resolve o problema de "filtro nativo custom = recompilar Envoy", trocando por WASM carregável em runtime, com SDKs Rust/C++/AssemblyScript.

---

#### 4. Zed extensions (WASM)

**(a) O primitivo:** extensão = módulo WASM compilado (tipicamente de Rust) rodando em sandbox, com manifest declarando categoria/capacidades.

**(b) Cobertura heterogênea:** mesma mecânica WASM cobre language servers, debuggers, MCP servers, agent servers, temas, icon themes, snippets — categorias listadas oficialmente (zed.dev/extensions, jun/2026): Languages, Language Servers, MCP Servers, Agent Servers, Themes, Icon Themes, Debug Adapters, Snippets. O sandbox WASM garante que extensão não pode travar o editor.

**(c) Onde vaza:** **cobertura de capacidade é bem menor que VS Code** — a doc oficial do próprio Zed admite: "the Wasm-based plugin API still has a gap in capabilities compared to VS Code's Node-based API" (note.com, mai/2026) e a própria doc de extensão diz "for now, extensions can add language support, debuggers, MCP servers, themes, and icon themes" — customização de UI ainda não é possível via WASM, ficou fora do primitivo. É o preço da homogeneidade: manter tudo na mesma interface WASM sandboxed significa não expor superfície de UI arbitrária (que VS Code expõe via processo Node completo).

---

#### 5. Shopify Functions

**(a) O primitivo:** função WASM determinística, sem I/O, com orçamento de instrução fixo, chamada em pontos de extensão do checkout/carrinho (discount, delivery customization, payment customization, etc).

**(b) Cobertura heterogênea:** mesmo runtime WASM roda lógica de desconto, frete, validação de carrinho, etc — tudo compilado para o mesmo target, com o mesmo contrato de input/output (JSON via wasm memory) e os mesmos limites.

**Limites confirmados (fonte: no7software.co.uk, mai/2026, citando docs Shopify):**
- **11 milhões de instruções WASM** por execução (para carrinhos até 200 itens — orçamento escala para carrinhos maiores)
- **10.000 kB de memória linear** de runtime + **512 kB de stack**
- Binário compilado limitado a **256 kB**; input **128 kB**, output **20 kB**
- Limite é **contagem de instrução, não tempo de parede** — fonte confirma isso explicitamente, embora práticas de campo mencionem um limiar de ~11ms como proxy informal (não confirmado como limite oficial)
- Funções **não têm acesso a rede, filesystem, aleatoriedade ou hora atual** — determinismo é a condição de possibilidade do sandbox seguro em produção

**(c) Onde vaza:** para lógica complexa (descontos multi-linha, regras B2B), JavaScript estoura o orçamento de instrução com mais frequência que Rust ("Rust produces smaller binaries and lower instruction counts" — mesma fonte); ou seja, o mesmo primitivo empurra desenvolvedores para linguagens específicas conforme a complexidade cresce — não é vazamento de mecanismo, mas vazamento de linguagem-alvo viável.

---

#### 6. n8n nodes vs. Home Assistant integrations

**(a) O primitivo:** ambos usam "um tipo de plugin, uma interface" — n8n: **node** (input/output JSON + credenciais declaradas + parâmetros tipados); Home Assistant: **integration** (manifest Python declarando plataformas — sensor, switch, climate — + config flow).

**(b) Cobertura heterogênea:** 
- **n8n**: 400+ nodes nativos, **1.000-1.200+ integrações built-in** (fontes variam), e **5.834 community nodes indexados** (awesome-n8n, jan/2026) — todos implementam a mesma interface de node (trigger/action, input schema, output schema), cobrindo de SaaS APIs a bancos de dados a lógica custom.
- **Home Assistant**: **mais de 2.700-2.800 integrações** (howtogeek.com/joinhomeshift.com, 2026), todas seguindo o mesmo contrato de plataforma (`sensor`, `switch`, `light`, etc. + `config_entry`), cobrindo de Zigbee a APIs cloud a protocolos locais.

**(c) Onde vaza:** nem uma fonte encontrada aponta vazamento estrutural grave em nenhum dos dois — ambos são citados como sucessos do padrão "milhares de integrações, um contrato". Diferença qualitativa relevante: HA tem 2,5-2,8x mais integrações que n8n oficial, refletindo domínio mais restrito (dispositivos/protocolos de casa) vs. n8n (qualquer API REST arbitrária) — quanto mais heterogêneo o domínio de entrada, mais integração tende a precisar de código custom por trás do node/plataforma padrão, mas isso não quebrou o modelo de extensão em nenhum dos dois **[inferência a partir das fontes, não afirmação direta de nenhuma delas]**.

---

#### 7. Figma plugin API

**(a) O primitivo:** dois processos com um único protocolo entre eles — "main code" rodando em sandbox QuickJS (VM JS compilada para WASM, dentro da origem do Figma) que acessa o documento, e uma iframe opcional para UI, comunicando via `postMessage`.

**(b) Cobertura heterogênea:** o mesmo par (sandbox de documento + iframe de UI) cobre plugins que só manipulam o arquivo (headless) e plugins com UI rica — a iframe é *opcional*, então plugins simples nem a usam. QuickJS compilado para WASM roda como sandbox real (sem acesso a browser APIs por padrão — só via API explicitamente whitelisted do Figma), enquanto a iframe tem acesso a `fetch`/rede porque roda em contexto de browser normal. Divisão de responsabilidade é limpa: sandbox = acesso ao documento; iframe = rede + DOM.

**(c) Onde vaza:** (1) **histórico de segurança** — primeira versão (2019) usava "Realms" para sandboxing e foi encontrada insegura; tiveram que reconstruir com QuickJS/WASM. (2) **debugging degradado** — "when QuickJS encounters an issue in Figma, you get truly impenetrable errors" (macwright.com) — o preço do sandbox real é DX pior. (3) **dynamic page loading** — documentos grandes têm páginas carregadas sob demanda; plugins que percorrem todas as páginas forçam carregamento completo, causando lentidão significativa na primeira execução — o modelo de árvore de nós não escala de graça para "acessar tudo".

---

### Princípios transferíveis

1. **Manifest declara existência + condição de ativação no mesmo campo** — VS Code (`activationEvents`) resolve lazy loading e (implicitamente) escopo de permissão com um único array declarativo. Para um app de LLM: a "ferramenta" declara em que contexto ela deveria estar disponível (não carregar 150k tokens de schema de tudo sempre) e o agente só paga custo de contexto quando o gatilho dispara.

2. **Estado desejado > ação imperativa** — o princípio level-triggered do K8s (spec descreve fim, não passo) é o que permite o mesmo controller cobrir volume/cert/DB. Para extensão de LLM: o "resultado que a capacidade produz" deveria ser declarado (schema de saída), não uma sequência de tool-calls fixa — deixa o modelo escrever o "como" em código.

3. **Interface única + ordem explícita > múltiplos hooks implícitos** — Envoy cobre auth/rate-limit/transform/observabilidade com uma interface de filtro só, mas exige ordem explícita e auditável. Para LLM: um único ponto de interceptação de "antes/depois da chamada de capacidade" (como filtro), não seis hooks (pre-tool, post-tool, pre-message, filter, action, pipeline) como Open WebUI tem hoje.

4. **Sandbox binário (WASM) é o que torna "todo mundo pode contribuir" seguro em produção** — Shopify Functions e Zed provam que WASM aguenta produção real com limite de recurso rígido (instruction count, não wall-clock). Para LLM: código que o modelo escreve deveria rodar em sandbox WASM/isolate com orçamento de CPU/memória explícito, não trust-by-convention.

5. **Contrato de I/O tipado e serializável é o que permite escala de milhares (n8n, HA)** — ambos escalam a milhares de integrações porque o contrato (input schema → output schema) é uniforme e checável estaticamente, não porque cada integração inventa sua própria forma de expor capacidade. Para LLM/MCP: a API tipada gerada (que reduziu tokens de 150k para 2k) só funciona porque cada tool tem contrato estável — o primitivo único depende disso ser universal, não opcional.

6. **UI e capacidade de dado são processos/sandboxes separados sob um protocolo, não dois mecanismos de extensão** — Figma resolve "plugin com UI" e "plugin que só mexe no documento" com o MESMO modelo (sandbox de dados + iframe opcional de UI), não dois tipos de plugin. Para LLM: um mecanismo de extensão único pode ter uma "face de UI" opcional (artifact renderizável) sem que isso vire um segundo primitivo.

7. **A camada síncrona de validação pré-execução é sempre um vazamento aceitável, não uma falha** — em todo precedente com estado forte (K8s admission webhooks, Envoy filter ordering, Figma sandboxing history), aparece uma necessidade de "checar antes de aceitar" que não cabe limpamente no primitivo principal. Para LLM: aceitar explicitamente uma camada mínima de validação/permissão pré-execução do código gerado como parte do design, não como vazamento a esconder.

8. **Processo/isolamento separado é sobre blast radius, não sobre modelagem de capacidade** — VS Code roda extension host em processo separado por resiliência (crash não derruba o editor), não porque isso define o que uma extensão pode fazer. Para LLM: sandbox de execução de código é uma decisão de runtime/deployment, ortogonal ao desenho do primitivo de extensão em si — não confundir as duas decisões.

### Anti-precedentes

**Jenkins**: 1.400-1.800+ plugins, cada um em seu próprio classloader "isolado" — mas isolamento é incompleto: plugins interagem via APIs compartilhadas que driftam entre versões, causando conflitos, crashes misteriosos e quebras difíceis de rastrear (JetBrains blog, mar/2026). Só ~140 dos 1.400+ são verificados/compatíveis pelo CloudBees Assurance Program — ou seja, o ecossistema de extensão cresceu mais rápido que a capacidade de garantir qualidade/segurança; pesquisadores demonstraram exploit dando acesso SYSTEM remoto não-autenticado via plugin malicioso (gitlab.com, 2019, ainda citado como caso paradigmático). **Falha estrutural**: extensibilidade sem contrato de sandboxing real — "plugin roda com privilégio do processo host" é o oposto do modelo WASM/sandbox.

**Eclipse**: arquitetura de plugin baseada em "Extension Points" publicados, tecnicamente elegante, mas a doc oficial da própria Eclipse Foundation lista "Top Ten Architectural Problems" (2006, ainda referenciada) reconhecendo complexidade excessiva na composição de plugins entre si — dependências cruzadas entre extension points tornaram o sistema difícil de raciocinar para desenvolvedores de plugin, mesmo tendo (ao contrário de Jenkins) isolamento técnico melhor definido. Ponto relevante para o dossiê: nem "ter um único mecanismo bem definido" (Extension Points) evita fragmentação cognitiva se o grafo de dependências entre extensões cresce sem limite.

**Open WebUI (contexto do próprio projeto, já estabelecido)**: seis mecanismos incompatíveis (Pipelines, Functions/Pipe, Functions/Filter, Functions/Action, Tools, MCP tool servers) é o anti-padrão inverso — cada mecanismo resolveu um caso pontual sem que ninguém parasse para achar o primitivo comum, e o resultado é exatamente a carga cognitiva que Eclipse e Jenkins mostram acontecer mesmo dentro de UM mecanismo, multiplicada por seis.

### Números

| Precedente | Métrica | Valor | Fonte/data |
|---|---|---|---|
| VS Code | contribution points | ~24 tipos documentados | microsoft/vscode-docs, dez/2025 |
| VS Code | extensões no marketplace | 50.000+ | rockstardeveloperuniversity, 2026 |
| Zed | extensões totais | ~800-1.000 | toolchew.com (mai/2026) / tech-insider.org (jun/2026) |
| Shopify Functions | instruções por execução | 11.000.000 (carrinho ≤200 itens) | no7software.co.uk, mai/2026 |
| Shopify Functions | memória linear / stack | 10.000 kB / 512 kB | no7software.co.uk, mai/2026 |
| Shopify Functions | binário / input / output | 256 kB / 128 kB / 20 kB | no7software.co.uk, mai/2026 |
| Shopify Functions | limite de tempo | não confirmado como oficial (só instrução conta) | no7software.co.uk, mai/2026 |
| n8n | integrações nativas | 1.000-1.200+ | vps.us / n8nknowledge.com, 2026 |
| n8n | community nodes indexados | 5.834 | awesome-n8n, 20/jan/2026 |
| Home Assistant | integrações | 2.700-2.800+ | howtogeek.com/joinhomeshift.com, 2026 |
| Jenkins | plugins totais | 1.400-1.800+ | Medium/JetBrains blog, mar/2026 |
| Jenkins | plugins verificados (CAP) | ~140 de 1.400+ | Medium (Kurt Madel) |
| Anthropic (contexto dado) | redução de tokens com code execution + MCP | 150.000 → 2.000 (−98,7%) | Anthropic, 04/11/2025 |

### Fontes

- VS Code: code.visualstudio.com/api/references/contribution-points; microsoft/vscode-docs (GitHub); roopik.com/blog/vscode-internals-extension-host (fev/2026)
- Kubernetes: book.kubebuilder.io/reference/{good-practices,admission-webhook}; golinuxcloud.com (jun/2026, reconcile loop + webhooks)
- Envoy: envoyproxy.io/docs/envoy/latest/intro/arch_overview/http/http_filters; ext_authz_filter docs; oneuptime.com/blog (fev/2026, wasm filters)
- Zed: zed.dev/extensions; note.com/snake_dragon (mai/2026); tech-insider.org/zed-vs-vscode-2026 (jun/2026); toolchew.com (mai/2026)
- Shopify: no7software.co.uk/blog/shopify-functions-production (mai/2026)
- n8n: vps.us/blog/how-many-n8n-integrations (2026); github.com/restyler/awesome-n8n (jan/2026)
- Home Assistant: howtogeek.com (abr/2026); joinhomeshift.com (2026)
- Figma: macwright.com/2024/03/29/figma-plugins; figma.com/blog/how-we-built-the-figma-plugin-system (2019); developers.figma.com/docs/plugins/accessing-document
- Jenkins: medium.com/@kmadel (Kurt Madel); blog.jetbrains.com/teamcity/2026/03/jenkins-plugin-management; gitlab.com/blog/2019/09/27/plugin-instability
- WordPress: developer.wordpress.org/plugins/hooks
- Eclipse: wiki.eclipse.org/Top_Ten_Architectural_Problems_in_all_of_Eclipse

---

# 9. Substrato de execução — WASM vs isolate vs container

> Onde roda o código que o modelo escreve, e onde roda o código que o humano escreve.

Have enough evidence. Writing the full dossier now.

### Números

1. **cargo-component Rust "adder" (hello-world) debug build**: 3,3MB (wasm32-wasip2/debug). Release + otimização: tipicamente algumas centenas de KB a ~1-2MB [ESTIMATIVA a partir de guidance oficial, não medi eu mesmo release build]. Fonte: component-model.bytecodealliance.org/language-support/building-a-simple-component/rust.html.
2. **componentize-py hello-world**: ~35MB (embute CPython WASI port completo); bindings host-side do wasmtime adicionam mais ~30MB. Fonte: github.com/bytecodealliance/componentize-py issue #98.
3. **componentize-js (jco) — embedding StarlingMonkey**: ~8MB fixo por componente (engine SpiderMonkey inteira embutida); sem sharing entre componentes hoje, plano futuro de compartilhar engine entre múltiplos componentes JS não implementado ainda. Fonte: npmjs.com/package/@bytecodealliance/componentize-js.
4. **TinyGo**: suporte nativo a Component Model via `-target wasip2` desde v0.34.0, recomendado v0.39.0+; sem número de tamanho de artefato confirmado nas fontes — "não confirmado".
5. **WASI 0.3.0 lançado 11/06/2026**, spec estável, com `async func`, `stream<T>`, `future<T>` nativos no Canonical ABI — resolve I/O assíncrono nativo, mas WASI 0.2 (v0.2.11, 07/04/2026) continua sendo o baseline "estável" de produção; 0.3 é o que chegou recentemente. Fonte: bytecodealliance.org/articles/WASI-0.3, wasi.dev/roadmap.
6. **Cloudflare Workers V8 isolate cold start**: <5ms em ~330 PoPs, vs. 100-500ms Lambda pré-SnapStart. Fonte: letsbuildsolutions.com, tech-insider.org (jun/2026).
7. **Firecracker microVM**: 120ms cold start p/ VM 512MB (v1.5), overhead memória <5MiB por microVM; Dirigent atinge 2500 cold starts/s com Firecracker. Fonte: johal.in benchmark (abr/2026), firecracker-microvm.github.io.
8. **gVisor**: 50-100ms cold start típico, mas overhead de runtime 20-50% (syscall interception) vs. container nativo. Fonte: onidel.com (set/2025), softwareseni.com (jan/2026).
9. **Wasmtime (sem componentização, função no-op)**: 5,6ms latência média — comparável ou melhor que V8 isolate cold start em benchmark acadêmico (arxiv 2509.09400, unikernel/edge study). Isso é bytecode Wasm cru, não um componente completo com CPython/JS embarcado.
10. **CVE-2026-58494 (Wasmtime)**: falha em preopens — hard-link/rename não comparam FilePerms de origem/destino, permitindo escrita além do escopo concedido a partir de capability read-only. Vulnerabilidade real documentada em jul/2026, mostra que capability model tem superfície de bug real, não é infalível por design.
11. **Docker seccomp default**: bloqueia ~44 de >300 syscalls — muito mais permissivo que WASI capability model (deny-all por padrão). Fonte: oneuptime.com blog (2026).
12. **Fermyon (adquirida pela Akamai, dez/2025) Wasm Functions**: escala a 75M req/s em produção edge+cloud — maior número de produção confirmado nesta pesquisa para Wasm components. Fonte: cloudnativenow.com.
13. **ONNX Runtime Web WASM SIMD+threads**: builds oficiais existem (`ort-wasm-simd-threaded.jsep.wasm`), rodam a "85-95% da velocidade nativa" segundo fonte agregada — mas via Emscripten (wasm32-unknown-emscripten), NÃO via Component Model/WASI 0.2. Compatibilidade com componentização real (WIT/WASI-NN) é experimental (wasi-nn-onnx, projeto deislabs, não mantido ativamente).

### WASM Component Model hoje

WASI 0.3.0 saiu em 11/06/2026 e é o marco central: adiciona `async func`, `stream<T>`, `future<T>` como primitivos nativos do Canonical ABI, eliminando a limitação crítica do 0.2 — cada componente precisava rodar seu próprio event loop isolado, sem coordenação entre componentes hospedados juntos. Agora o host controla um único event loop compartilhado. Isso resolve diretamente a dúvida de streaming/I/O assíncrono levantada no assignment: uma extensão WASM hoje PODE fazer streaming de rede nativamente, sem polling manual. `wasi:io` foi absorvido inteiramente no Canonical ABI.

WASI 0.2 (v0.2.11, 07/04/2026) continua "estável" e é o que roda em produção real hoje — Wasmtime 43+ e jco já suportam 0.3, mas é recente demais (2 meses de idade em ago/2026) para ter penetração de produção comprovada. WASI 1.0 está planejado para "2026" sem data específica — ou seja, ainda não saiu no momento do assignment.

Produção confirmada: Fastly Compute e Shopify usam Wasmtime/componentes Rust→Wasm no edge (checkout logic). Fermyon (agora Akamai) roda 75M req/s. American Express construiu FaaS interno sobre wasmCloud. Envoy usa Wasm para plugins de proxy. Zed usa WASM para plugin system (não confirmei componentização via Component Model especificamente — fonte não trouxe detalhe técnico, "não confirmado"). Consenso das fontes 2026: Wasm é produção-pronta para edge functions/FaaS e sistemas de plugin, mas NÃO para microserviços de propósito geral — threading em WASI ainda não resolvido plenamente.

### DX por linguagem

**Rust (cargo-component)** — caminho mais maduro, tratado como referência oficial pela própria documentação do Component Model. Hello-world debug: 3,3MB (grande "para uma linguagem compilada", nota a própria doc oficial); release com otimizações reduz substancialmente mas número exato de release não foi confirmável nas fontes — `[ESTIMATIVA]` algumas centenas de KB. Faz HTTP via `wasi:http` (parte do WASI 0.2 padrão) sem dependência extra pesada. É o único caminho onde "escrever componente" é experiência de primeira classe, não workaround.

**JS/TS (jco + componentize-js/StarlingMonkey)** — funciona, mas embute o motor JS inteiro (StarlingMonkey, fork WASI-first do SpiderMonkey) em CADA componente: ~8MB fixo, independente do tamanho do código do usuário. Não há hoje sharing do engine entre múltiplos componentes JS no mesmo host (só planejado). Rewrite em curso para `wit-dylib` (mar/2026) promete simplificar targeting do Component Model a partir de linguagens interpretadas, mas não muda o custo de embarcar o engine.

**Python (componentize-py)** — funciona mas artefato é pesado: ~35MB hello-world (CPython WASI port completo embarcado) + ~30MB de bindings host-side do wasmtime. CPython WASI é Tier 3 (aspirando Tier 2) — não é first-class. Extensões nativas C (numpy, pydantic-core) precisam ser **estaticamente linkadas**; dlopen/dlsym dinâmico depende de fork temporário do WASI-SDK ainda não upstreamed. Na prática: numpy/pydantic-core em WASM via componentize-py hoje é trabalho pesado de recompilação cruzada, não "pip install" — inviável para maioria dos casos sem esforço dedicado de build.

**Go (TinyGo)** — suporte nativo ao Component Model via `-target wasip2` desde TinyGo v0.34.0 (recomendado v0.39.0+). Limitação séria: `encoding/json` **compila mas panica em runtime** por suporte incompleto de `reflect` — força uso de parsers não-reflexivos (ex. gjson). GC funciona mas é "muito mais lento" que o GC padrão do Go em alvo WASM. Avaliação de fonte de mercado (java code geeks, abr/2026): Component Model é "brilhante em Rust, laborioso em qualquer outra linguagem" — Go inclusive.

**Conclusão DX**: hierarquia clara Rust >> TinyGo > JS > Python, tanto em tamanho de artefato quanto em maturidade de tooling. Só Rust dá experiência "de primeira classe"; as outras três embutem um runtime de linguagem inteiro (CPython, SpiderMonkey, GC do Go) dentro de cada componente, o que quebra a premissa de "componente leve, WASM-nativo" — na prática você está rodando uma VM completa dentro de outra sandbox.

### O que se perde

- **Threads reais**: não resolvido plenamente em WASI a partir das fontes consultadas — "WebAssembly production-ready para edge/FaaS mas não para microsserviços de propósito geral, primariamente por threading não resolvido em WASI" (java code geeks, abr/2026). Isso afasta cargas CPU-bound paralelas.
- **numpy/pandas/torch**: quebram como pacote pip padrão. numpy/pydantic-core exigem link estático manual e toolchain WASI-SDK dedicada; torch (com kernels CUDA/BLAS nativos) está fora de cogitação — não há relato de porte funcional nas fontes pesquisadas.
- **onnxruntime**: existe build WASM oficial (`onnxruntime-web`), com SIMD e multi-thread, atingindo "85-95% velocidade nativa" — MAS via Emscripten/browser target, não via Component Model/WASI 0.2. O caminho WASI-NN (`wasi-nn-onnx`, projeto deislabs) é experimental e não ativamente mantido nas fontes encontradas. Ou seja: onnxruntime funciona em WASM-para-browser, mas integrá-lo como componente WASI padrão de servidor é caminho não pavimentado.
- **pdfium/poppler (parsing PDF)**: não encontrei fonte direta confirmando porte para Component Model; ambas são bibliotecas C++ grandes com dependências de sistema de arquivo/fontes — mesma classe de problema que numpy: portável para wasm32-unknown-emscripten com esforço, não turnkey via cargo-component/wasi-sdk. `[ESTIMATIVA]` viável com esforço de meses, não disponível pronto.
- **Filesystem real**: substituído por preopens capability-based — só diretórios explicitamente concedidos, sem `/tmp` livre, sem symlinks arbitrários fora do escopo.
- **Sockets arbitrários**: `wasi:sockets` existe mas é escopado; não há `raw socket` livre — tudo passa pelo host que decide o que é permitido.
- **Debugging**: fontes não trouxeram ferramental de debugging maduro equivalente a gdb/lldb para componentes WASI de produção — inferência: debugging de componente é significativamente mais pobre que debugging de container (`[INFERENCE]`, não documentado diretamente nas buscas).

**Veredito prático**: extensão de parsing de PDF (pdfium/poppler) e extensão de embedding (onnxruntime) — ambas ficam em zona cinzenta: tecnicamente portáveis, mas exigem recompilação cruzada de C/C++ pesado sem toolchain pronta, e nenhuma das fontes mostra deployment de produção real dessa combinação (WASM component + pdfium ou WASM component + onnxruntime-via-WASI-NN). Isso é exatamente a classe de "código de capacidade escrito por humano, com deps nativas" citada na hipótese do usuário.

### V8 isolate

Cold start: **<5ms** em qualquer um dos ~330 PoPs da Cloudflare, vs. 100-500ms Lambda tradicional (pré-SnapStart) e 120ms Firecracker microVM (v1.5, 512MB). Isolates compartilham processo — múltiplos tenants no mesmo processo V8 — o que é a fonte da vantagem de velocidade E do problema de segurança.

**Modelo de segurança/Spectre**: o próprio time V8 do Google declarou que "V8 não pode se defender de Spectre" a nível de engine. A mitigação da Cloudflare é em camadas, não em uma "solução": desabilitar `SharedArrayBuffer`, reduzir granularidade de timers de alta resolução (para dificultar timing attacks), rodar workers de clientes diferentes em processos separados quando possível, e investir em isolamento a nível de processo como fallback para tenants de alta segurança. Mitigações agressivas de software reduzem performance em 2-3x (benchmark Octane) — por isso a Cloudflare evita defesas máximas, que anulariam a vantagem de cold start. Conclusão direta da fonte: **isolate troca fronteira de segurança de nível OS por 100x melhor cold start, ao custo de fronteiras de isolamento mais fracas que VM ou container**.

**Para orquestração I/O-bound**: dado que o código de orquestração no design do usuário só faz `await capability.x()` e filtra resultado — não expõe superfície de ataque de execução de código nativo arbitrário, não precisa de threads, não precisa de libs nativas — isolate é estruturalmente suficiente. Cold start de 5ms é ordem de magnitude melhor que qualquer variante WASM componentizada com engine embutida (StarlingMonkey 8MB de payload, CPython 35MB) e comparável ao Wasm cru sem componentização (5,6ms, Wasmtime no-op, arxiv 2509.09400).

### Veredito sobre a hipótese

**Hipótese do usuário**: (a) orquestração-pelo-modelo quer V8 isolate; (b) capacidade-por-humano quer container/gVisor; (c) WASM não é a melhor escolha para NENHUM dos dois.

**Confirmado, com uma ressalva em (c).**

Para (a) — orquestração I/O-bound, efêmera, milhares/dia, escrita pelo modelo: evidência aponta fortemente para V8 isolate. Cold start <5ms bate qualquer alternativa WASM componentizada por 1-2 ordens de magnitude quando a extensão precisa de runtime de linguagem dinâmica embutido (JS: 8MB fixo de overhead por componente; Python: 35MB). Mesmo Wasm cru sem componentização (5,6ms) não supera isolate o suficiente para justificar a complexidade adicional de toolchain (WIT, wit-bindgen, wasm-tools) para um caso de uso que é, por definição, código gerado dinamicamente pelo modelo — não há benefício de "componente reusável versionado" quando o código muda a cada chamada. O modelo de segurança do isolate (fraco a nível OS, mas mitigado em camadas pela Cloudflare) é aceitável justamente porque o código de orquestração não deveria ter acesso a nada além de `capability.x()` — a superfície de risco real está nas capabilities, não no isolate.

Para (b) — capacidade pesada com deps nativas (numpy, onnxruntime, pdfium): a seção "O que se perde" mostra que WASM component model em ago/2026 exige recompilação cruzada manual e não tem caminho pronto para essas libs. Container com gVisor (50-100ms cold start, isolamento kernel real via syscall interception, overhead de runtime 20-50%) ou Firecracker microVM (120ms cold start, <5MiB overhead de memória, isolamento de VM completo) resolvem isso trivialmente — qualquer binário Linux roda sem recompilação. Cold start de 50-120ms é aceitável para capacidade "pesada, possivelmente síncrona, invocada com menos frequência" — ao contrário da orquestração, aqui não se compete com o teto de 5ms do isolate.

Ressalva em (c): não é que WASM "não sirva para nada" — é que WASM Component Model ocupa um nicho específico e estreito que NÃO é nenhum dos dois pontos do desenho do usuário: plugin systems onde múltiplos fornecedores externos escrevem componentes REUSÁVEIS e VERSIONADOS em Rust, distribuídos via OCI/registry, executados repetidamente sem recompilar (Envoy, Shopify checkout, Zellij). Isso é ortogonal ao par orquestração-efêmera/capacidade-nativa-pesada do desenho do usuário. A fonte de mercado mais crítica (java code geeks, abr/2026) resume: "Component Model é bem desenhado como spec, mas de execução desigual — brilhante em Rust, laborioso em qualquer outra linguagem", e mesmo em Rust o hello-world debug pesa 3,3MB contra ~0KB de overhead de isolate. **A hipótese do usuário é confirmada**: nem (a) nem (b) do desenho descrito se beneficiam de WASM component model hoje — o overhead de toolchain/artefato supera o ganho de portabilidade/segurança para ambos os casos específicos.

### Permissão e distribuição

**WASI capability-based (WASI 0.2/0.3)**: deny-all por padrão — um módulo Wasm não toca filesystem, rede, nem env vars a menos que receba capabilities explícitas via imports (preopens, com `DirPerms`/`FilePerms` por diretório concedido). Modelo é portável entre runtimes (browser, edge, servidor) e não depende do OS hospedeiro. Superfície de bug real existe: CVE-2026-58494 (jul/2026) — hard-link/rename em wasmtime-wasi falhavam em comparar `FilePerms` de origem vs. destino, permitindo escrita além do escopo concedido a partir de capability somente-leitura. Ou seja, capability-based não é infalível por construção — precisa de implementação correta do host.

**Permissões de Worker/Deno**: enforcement é feito pelo runtime (Deno), não pelo OS — `--allow-*` flags escopadas por recurso (path, host, var específicos). Deno explicitamente recomenda NÃO tratar isso como única camada — combinar com sandboxing OS-level (chroot, seccomp), containers ou VMs para código verdadeiramente não confiável. Há bugs de bypass documentados (ex. mtime/atime alteráveis mesmo com write negado). Cloudflare Workers em si não expõe modelo de permissão granular equivalente ao Deno — a superfície de API disponível ao Worker já é limitada pelo runtime; isolamento entre tenants é V8-isolate + mitigações de processo, não capability declarativa por Worker.

**Seccomp de container**: filtra syscalls a nível de kernel Linux — mais grosso-grão que capability WASI. Docker default bloqueia ~44 de >300 syscalls; produção séria customiza perfil por aplicação, processo iterativo e difícil de auditar (risco de over-permissive ou de quebrar a app). Seccomp é uma camada entre várias num "defense in depth" — normalmente combinado com AppArmor, user namespaces, read-only FS.

**Distribuição/assinatura**: WASM components convergem para distribuição via **OCI registries** (`wkg` CLI do projeto `wasm-pkg-tools`, sucessor do registry Warg descontinuado) — reaproveitando infraestrutura de assinatura/SBOM já existente para imagens container. Assinatura via **Cosign** com modo OIDC (fluxo keyless: autentica via GitHub/Google, gera chave efêmera, certificado curto vinculado à identidade, registra em transparency log Rekor) — mesmo padrão usado para assinar imagens de container hoje. Ou seja: no eixo de distribuição/assinatura, WASM component e container JÁ convergiram para o mesmo pipeline (OCI + Cosign + Rekor) — não há mais uma vantagem estrutural de um lado nesse quesito específico.

### Fontes

- bytecodealliance.org/articles/WASI-0.3 (11/06/2026) — lançamento WASI 0.3, async nativo
- wasi.dev/roadmap — status WASI 0.2/0.3, WASI 1.0 planejado 2026
- component-model.bytecodealliance.org/language-support/building-a-simple-component/rust.html — tamanho artefato Rust
- github.com/bytecodealliance/componentize-py issue #98 (16/07/2024, ainda referenciado como estado atual) — tamanho artefato Python
- npmjs.com/package/@bytecodealliance/componentize-js — tamanho embedding StarlingMonkey
- component-model.bytecodealliance.org/language-support/building-a-simple-component/tinygo.html — suporte TinyGo
- tinygo.org/docs/reference/lang-support/ — limitações reflect/JSON
- letsbuildsolutions.com (05/06/2026), tech-insider.org (04/06/2026) — cold start Cloudflare Workers
- blog.cloudflare.com/mitigating-spectre-and-other-security-threats-the-cloudflare-workers-security-model/ e developers.cloudflare.com/workers/reference/security-model/ — modelo Spectre
- v8.dev/blog/spectre — declaração V8 team sobre Spectre
- johal.in/benchmark-gvisor-10-vs-kata-containers-30-vs (28/04/2026) — benchmark Firecracker/gVisor/Kata
- firecracker-microvm.github.io — overhead memória Firecracker
- arxiv.org/pdf/2509.09400 — benchmark acadêmico Wasmtime vs Firecracker
- javacodegeeks.com/2026/04/webassembly-in-2026-three-years-of-almost-ready.html (09/04/2026) — produção Shopify/Fastly/Fermyon/AmEx, avaliação "brilhante em Rust, laborioso em outras"
- cloudnativenow.com/features/akamai-acquires-fermyon-to-further-advance-wasm-adoption (03/12/2025) — Fermyon 75M req/s, aquisição Akamai
- onnxruntime.ai/docs/build/web.html, npmjs.com/package/onnxruntime-web — ONNX Runtime WASM SIMD/threads
- github.com/deislabs/wasi-nn-onnx — status WASI-NN ONNX
- sentinelone.com/vulnerability-database/cve-2026-58494 (09/07/2026) — CVE preopens Wasmtime
- docs.deno.com/runtime/fundamentals/security/ — modelo permissões Deno
- oneuptime.com blog seccomp posts (2026) — seccomp Docker default
- wasmcloud.com/blog/2025-09-02-securely-signing-wasm-components-with-cosign-oidc (02/09/2025) — assinatura Cosign
- component-model.bytecodealliance.org/composing-and-distributing/distributing.html — wkg/OCI distribution

---

