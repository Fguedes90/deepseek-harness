# Cloudflare OS — investigação

Investigação adversarial conduzida em **2026-08-15**, dez dias após o Cloudflare OS ser
aberto. O objetivo declarado às cinco frentes era **matar o projeto `personal_web_ui`** se a
evidência mandasse.

## Fatos verificados por mim, direto na fonte

| Fato | Valor | Fonte |
|---|---|---|
| Repositório | `github.com/cloudflare/cloudflare-os` | GitHub API |
| Licença | **Apache-2.0** | GitHub API |
| Estrelas | 8.335 | GitHub API, 2026-08-15 |
| Criado | 2026-04-15 (público em 2026-08-05) | GitHub API |
| Último push | 2026-08-15 (ativo hoje) | GitHub API |
| Versão | **v2, reescrita completa**; "early access", "many rough edges" | README |
| Gatekeepers prontos | **16** pacotes `gatekeeper-*` | `contents/packages`, recontado 2026-08-15 |
| `cloudflare/agents` | MIT, 5.442 estrelas | GitHub API |
| Code Mode | publicado **2025-09-26** (não é novo), revisado 2026-07-15 | JSON-LD do post |
| Facets no runtime aberto | `durableObjectClass @26` — *"This can be used to implement a facet"* | `workerd/src/workerd/server/workerd.capnp:380-382` |
| DO em disco próprio | `localDisk @12` — **"EXPERIMENTAL; SUBJECT TO BACKWARDS-INCOMPATIBLE CHANGE"** | `workerd.capnp:~722` |
| Deploy fora da CF | **"COMING SOON"** | README |
| Contribuição externa | recusada acima de ~12 linhas | README |

## O que o Cloudflare OS é — e não é

Não é um cliente de chat. É uma **suíte de escritório onde cada arquivo é uma aplicação
própria**. Pedir "faça slides" cria uma instância privada de software de slides — um
*Gadget* — que roda no seu próprio sandbox e que você pode reescrever pedindo ao agente.
A analogia que eles mesmos publicam:

| SO tradicional | Cloudflare OS |
|---|---|
| kernel | `packages/workshop-backend` |
| device drivers | `packages/gatekeeper-*` |
| shell | `packages/workshop-frontend` |
| processos | gadgets |
| executáveis | blueprints |
| ACLs | shared permissions |
| **???** | **agents** |

A última linha é deles, não minha. Eles próprios não sabem onde o agente encaixa.

## Veredito em cinco linhas

1. **O projeto não morre — mas encolheu.** O Cloudflare OS mira outra categoria de produto
   (workspace corporativo de produtividade), não cliente de chat pessoal multi-modelo.
2. **O §3 (code execution) está replicado quase literalmente**, e com produto real.
   E o §3.3 (exposição lazy) **fechou**: `codemode.search`/`describe` já entregam
   "o modelo paga exatamente pela informação de tipo que pediu".
3. **O §5 (isolate + container) virou convergência de mercado**, não diferencial —
   `@cloudflare/computer` unifica os dois exatamente como o §5 propõe.
4. **O §2 sobrevive.** Cloudflare OS tem **mais** categorias, não menos: Gadget,
   Gatekeeper, Blueprint, conta singleton, binding ambiente. Nenhum manifest unificado com
   campo de ativação comum.
5. **O §4.3 sobrevive intacto.** Ninguém — nem eles — grava `routing_reason` como campo
   estruturado.

## O que eles têm e o `ARCHITECTURE.md` não modela

Duas coisas boas o suficiente para roubar:

- **Aprovação assíncrona com simulação.** Quando uma ação precisa de aprovação humana, o
  Gatekeeper *simula* o resultado localmente e deixa o agente seguir enfileirando trabalho.
  O usuário aprova em lote depois. É a resposta deles ao `--dangerously-skip-permissions`,
  e resolve o problema real de human-in-the-loop síncrono travar o agente no primeiro passo.
- **Capability por "introdução", não por manifest estático.** O agente começa sem acesso a
  nada; você *apresenta* um recurso (colando um link, ou pela UI), e o agente pode pedir
  uma apresentação que você concede ou nega. O `grants = [...]` do §2 é estático e mais
  pobre: declara ambiente no empacotamento, não no momento do uso.

Uma terceira, mais estrutural: **Cap'n Web RPC como contrato único**. Cliente e servidor de
um Gadget são obrigados a conversar por RPC — e é por isso que "toda app construída ganha
API para agente automaticamente, sem escrever servidor MCP". A mesma interface serve humano
e modelo. O §2 não tem esse efeito colateral.

## Os dossiês

| # | Frente | Pergunta |
|---|---|---|
| 1 | Anatomia — quantos primitivos o Cloudflare OS tem | Dissecação de Gadget, Gatekeeper, Blueprint e agentes, lida no código-fonte. |
| 2 | Code Mode e o substrato de isolate | O que está GA, o que está em beta, e a lacuna de exposição lazy que fechou. |
| 3 | O placar das 8 irritações, revisado | O que o Cloudflare OS resolve, o que não toca, e as lacunas que sobram. |
| 4 | Economia, limites e custo de saída | Roda fora da Cloudflare? Quanto custa? Onde bate no teto? |
| 5 | A categoria "Agent OS" em ago/2026 | Quem mais vende isso, o padrão Agent Plugins, e o veredito de categoria. |

---

# 1. Anatomia — quantos primitivos o Cloudflare OS tem

> Dissecação de Gadget, Gatekeeper, Blueprint e agentes, lida no código-fonte.

### O repositório

- **URL:** `github.com/cloudflare/cloudflare-os`. Licença: **Apache License 2.0** (confirmado, arquivo `LICENSE` na raiz).
- **`created_at`** (GitHub, primeiro commit do repo público): `2026-04-15T22:22:53Z`. **`pushed_at`** mais recente: `2026-08-15T23:04:41Z` (hoje). Isso indica ~4 meses de desenvolvimento interno antes do open-source de 05/08/2026 — README confirma: "This repository is actually version 2, a complete rewrite".
- **Commits:** 672 (via paginação da API `/commits`). **Contribuidores:** 16 (API `/contributors`).
- **Estrelas:** 8.335. **Forks:** 910. **Issues abertas:** 83.
- **Linguagem:** TypeScript (100% do código de produto — Workers, RPC, frontend React).
- **Tamanho:** 9.442 KB reportado pela API (~9,4 MB de fontes, sem contar `node_modules`).
- **Estrutura de `packages/`:** `workshop-backend` (kernel/DO), `workshop-frontend` (shell React), `workshop-shared` (contrato RPC), `router` (roteamento por path prefix), `typed-storage`, `backend-utils`, `error-reporting`, `configurator-ui`, `mcp-shared`, `integration-tests`, e **16 pacotes `gatekeeper-*`**: `cloudflare`, `confluence`, `context`, `email`, `github`, `google`, `homeassistant`, `linear`, `mcp`, `mcp-portal`, `notion`, `scheduler`, `slack`, `spotify`, `supabase`, `zoominfo`.
- README confirma a analogia OS→código: kernel = `workshop-backend`, drivers = `gatekeeper-*`, shell = `workshop-frontend`, processos = *gadgets*, executáveis = *blueprints*, ACLs = *shared permissions*, "???" = *agents* (o autor admite que "agentes" não tem análogo em OS tradicional).
- **Correção de premissa da missão:** não existe um primitivo de extensão chamado **"Skill"** no runtime do Cloudflare OS. O único uso de "skill" no repo é `.agents/skills/write-gatekeeper/SKILL.md` — um *skill do próprio agente de codificação que constrói o Cloudflare OS* (documentação para a Claude/IA que trabalha no repo, no padrão Claude Code skills), não um primitivo executado dentro do produto. Não há `SkillRecord`, `interface Skill`, nem menção de "skill" como conceito de usuário final em `workshop-shared`, `overseer.ts`, ou nos docs de produto. Trato isso como achado, não suposição — não encontrei o símbolo em nenhuma busca no kernel.

---

### Dissecação por conceito

#### Gadget
- **Assinatura:** não é uma função com contrato tipado — é uma **aplicação completa** (código React/servidor gerado por IA ou escrito à mão) versionada como documento Yjs. O contrato de comunicação cliente↔servidor é fixo: **Cap'n Web RPC**. O "autor" (tipicamente o próprio modelo) escreve métodos numa classe de servidor; o cliente chama-os como RPC local.
- **Onde executa:** servidor num **Dynamic Worker / Durable Object Facet** sem acesso a internet (só bindings explícitos); cliente num **iframe sandboxado** que só fala com seu servidor via `postMessage` + Cap'n Web.
- **Quem invoca:** o usuário (UI), o agente (via `executeCode`, chamando a API RPC do Gadget como um import), ou outro Gadget/colaborador em tempo real (Durable Object dá multiplayer nativo).
- **O que pode mutar:** o próprio estado do Gadget (SQLite/DO storage) e, através de bindings explicitamente concedidos, gatekeepers vinculados.
- **Permissão:** *capability-based* — Gadget nasce sem acesso a nada; cada binding nomeado (`setGadgetBinding`) é uma concessão explícita a um gatekeeper, modelo de IA, ou agent spawner específico.
- **Empacotamento/versionamento/distribuição:** o código-fonte vive como snapshot Yjs; **não é empacotado como artefato independente** — é distribuído *como Blueprint* (ver abaixo) ou copiado via `.gadget`.

#### Blueprint
- **Assinatura:** **dado declarativo**, não código executável em si — é uma cópia/snapshot do código-fonte de um Gadget (Yjs V2, sem histórico) + metadados de binding (`BlueprintBinding`: tipo `gatekeeper`/`aiModel`/`agentSpawner`) + metadados de exibição (título, descrição, screenshot, `output` para aparecer como "New Doc"/"New Slides"). Fonte: `docs/blueprints.md`.
- **Onde executa:** não executa nada por si — é passivo. Ao ser "instanciado" (`newGadgetFromBlueprint`), gera um **novo Gadget** que aí sim executa no Dynamic Worker padrão.
- **Quem invoca:** o usuário (clicando num link `/blueprint/<id>` ou na página Explore) ou o agente (`createGadget` com `blueprintId`, via ferramenta `listBlueprints`).
- **O que pode mutar:** nada diretamente — cria um novo objeto (Gadget) com storage/histórico/credenciais próprios; nunca propaga updates de volta às instâncias existentes.
- **Permissão:** ID de 128 bits aleatório é a única barreira de descoberta (metadata é pública/não-autenticada; *criar* gadget requer login). Bindings **não são copiados** — o consumidor precisa reconectar suas próprias contas.
- **Empacotamento:** formato binário próprio `.gadget` (magic number, versão, JSON de metadados + bytes gzip do snapshot Yjs), armazenado em três lugares com propagação one-way: Gadget DO → User DO → Workers KV; conteúdo de código em R2. Versionado por inteiro incremental por blueprint; múltiplos blueprints por gadget são permitidos (ex.: "stable" vs "latest").

#### Gatekeeper
- **Assinatura:** hierarquia de **três classes TypeScript** definidas em `packages/workshop-shared/src/gatekeeper.ts`: `GatekeeperVendor` (`WorkerEntrypoint`, um por serviço), `GatekeeperUser` (`WorkerEntrypoint` com `ctx.props`, uma conta OAuth conectada), `Gatekeeper<Session>` (DO facet do Overseer, um por recurso+Gadget, expõe a "Session API" — a superfície RPC de fato chamada pelo agente/Gadget). Contrato **não é `manifest.toml`+`fn(T)->U`** — é uma classe RPC completa com sete responsabilidades obrigatórias (auth, design de API, granularidade de recurso, aprovações via `ApprovalQueue`/`submitAction`/`applyAction`/`authorizeObservation`, cache, simulação, verificação de observador).
- **Onde executa:** **Worker independente**, deployado separadamente do resto do OS, com service binding (`GATEKEEPER_<NOME>`) auto-descoberto pelo backend.
- **Quem invoca:** o agente (via `executeCode`, chamando `env.<BINDING>.metodo()`) ou o código do Gadget diretamente, nunca o usuário final diretamente (o usuário interage via UI que dispara chamadas de agente/gadget).
- **O que pode mutar:** o recurso externo (via `submitAction`/`applyAction`, com humano aprovando efeitos colaterais) e seu próprio storage de cache/log (DO). *Não muta* nada até `applyAction` — antes disso, a chamada só é **simulada**.
- **Permissão:** capability-based fino — o usuário "apresenta" um recurso específico (repo, doc, mailbox) via `getSupportedResources`/`urlPattern`; granularidade decidida pelo autor do gatekeeper (`grantable: true/false` por tipo de recurso).
- **Empacotamento/distribuição:** Worker Cloudflare deployado separadamente, registrado via `wrangler.jsonc` binding no `workshop-backend`; nenhum manifest declarativo central — é registro de binding + convenção de nome de classe.

#### Micro-app / Configurator UI (a UI de configuração de um gatekeeper)
- **Assinatura:** módulo React/TSX opcional (`src/configurator/*-ui.tsx`) compilado em `iframeHtml` por `@gadgets/configurator-ui` + `scripts/build-gatekeeper-configurator.mjs`.
- **Onde executa:** iframe sandboxado servido pelo próprio Worker do gatekeeper (`/gatekeeper/<name>/*` via `router`).
- **Quem invoca:** o usuário, ao conectar/escolher um recurso (`startResourceConfigurator`).
- **O que pode mutar:** nada por si — retorna a URL do recurso escolhido; a mutação real (criação do binding) é feita pelo Overseer.
- Não é um primitivo separado de execução de lógica de negócio — é UI estática compilada, parte do contrato do Gatekeeper (etapa 6 do skill `write-gatekeeper`).

#### Hooks (push notification)
- **Assinatura:** `hookTsType` em `ResourceDescription` — a aplicação implementa um `WorkerEntrypoint` que satisfaz a interface nomeada. Distinto de qualquer coisa em `activation` do §2: é o **gatekeeper empurrando eventos assíncronos** para o Gadget (ex.: webhook do GitHub), não o runtime interceptando um ciclo request/response.
- **Quem invoca:** o serviço externo, através do gatekeeper.
- Achado relevante: `write-gatekeeper/SKILL.md` documenta hooks como responsabilidade explicitamente **fora** do escopo do MCP gatekeeper ("No hooks. `notifications/tools/list_changed` is session-scoped; a Gadget hook is durable").

#### `executeCode` (o "primitivo de invocação" do agente)
- Não é um conceito de extensão autoral — é o **único tool** que o agente do Cloudflare OS possui. Confirmado por busca no kernel (`overseer.ts`): zero ocorrências de `beforeRequest`, `afterResponse`, `onStreamChunk`, `interceptor`, `streamChunk` ou `Pipe` — só `executeCodeMode`, `executeCodeRestoreTarget`, o objeto mágico `self` passado ao código executado. O agente escreve **snippets de código** e todo binding (Gadget, Gatekeeper session, callback) vira um `import`/objeto no `env` desse código — exatamente a tese do "Code Mode" do §3 do ARCHITECTURE.md, aplicada de fato (Cloudflare cita seu próprio blog post `blog.cloudflare.com/code-mode/` como origem do padrão).

---

### Matriz de eixos

| Primitivo | Momento do ciclo | Direção do fluxo | Onde executa | O que muta | Quem invoca | Sínc/Assínc | Modelo precisa saber que existe? |
|---|---|---|---|---|---|---|---|
| **Gadget** | contínuo (app de longa duração) | bidirecional (RPC cliente↔servidor) | Dynamic Worker Facet (servidor) + iframe sandbox (cliente) | seu próprio storage; recursos externos via bindings | usuário, agente, outro colaborador (multiplayer) | ambos (RPC síncrono aparente + streaming real-time) | sim, se o agente for chamar sua API (import gerado) |
| **Blueprint** | fora do ciclo de execução — é *dado* consultado antes de criar um Gadget | unidirecional (leitura de metadado → instanciação) | nenhum (KV/R2/DO storage) | nada por si; cria um novo Gadget | usuário (link) ou agente (`createGadget(blueprintId)`) | síncrono (fetch de metadado) | sim, para listar/escolher (`listBlueprints`) |
| **Gatekeeper (Vendor/User/Instance)** | por chamada do agente/gadget, com etapa de aprovação assíncrona posterior | bidirecional (chamada → simulação imediata → aplicação real depois) | Worker independente (própria fleet) | o recurso externo (após aprovação); seu próprio cache/log DO (imediato) | agente (via `executeCode`) ou código de Gadget | **híbrido deliberado**: leitura=síncrona; ação=assíncrona com simulação (evita bloquear o agente esperando aprovação humana) | sim, schema RPC completo exposto como `.d.ts` gerado |
| **Hook (push)** | assíncrono, fora de qualquer turno do agente | unidirecional (serviço externo → gatekeeper → Gadget) | Worker do gatekeeper (recebe webhook) → invoca WorkerEntrypoint do Gadget | estado do Gadget (mensagem de chat/callback) | o serviço externo | assíncrono puro | não — o modelo só vê o resultado quando reativado |
| **Configurator UI** | um momento único (conectar recurso) | unidirecional (usuário → escolha de URL) | iframe do próprio Worker do gatekeeper | nada — devolve URL escolhida | usuário | síncrono (interação de UI) | não |
| **`executeCode`** (não é extensão, é o mecanismo de invocação) | todo turno do agente | bidirecional (código → env → RPC) | V8 isolate do harness do agente (Code Mode) | qualquer binding presente no `env` daquele turno | o modelo, escrevendo código | síncrono do ponto de vista do código, mas *awaits* podem ser longos (aprovação) | trivialmente sim — é o próprio veículo |

---

### Um primitivo ou seis?

**Reinventaram pelo menos três mecanismos genuinamente distintos, não um.** A matriz acima não colapsa em uma linha, porque **"quem invoca" e "qual é a assinatura de código" não são a mesma pergunta** aqui — ao contrário do que o §2 do ARCHITECTURE.md assume ao tratar as duas como consequência do mesmo campo.

1. **Gadget e Gatekeeper NÃO têm a mesma assinatura de código.** Um Gadget é uma aplicação com estado persistente, servidor+cliente, multiplayer, ciclo de vida próprio (Durable Object inteiro). Um Gatekeeper é uma **hierarquia de três classes RPC** (`Vendor`/`User`/`Instance`) com sete responsabilidades obrigatórias embutidas no contrato (auth, aprovação, simulação, cache, verificação de observador) — nenhuma dessas responsabilidades existe no contrato de um Gadget. São mecanismos de execução estruturalmente diferentes, não a mesma `async fn(T) -> U` com um campo `activation` mudando a origem de T/U. `async fn(T)->U` do §2 mapeia melhor a **um único método de uma Session** de Gatekeeper — não ao Gatekeeper inteiro.

2. **Blueprint é dado declarativo, não terceiro mecanismo de execução** — nisso o Cloudflare OS confirma a intuição do §2. Um Blueprint não executa nada; é puramente `BlueprintMetadata` + snapshot de código + descrição de bindings. Mas ele não é "instância do mesmo primitivo com um campo diferente" — ele é **metadado sobre outro primitivo** (o Gadget), num nível de abstração acima. Não há um `manifest.toml` unificado abrangendo Gadget+Gatekeeper+Blueprint com um campo de ativação comum.

3. **"Skill" não existe como primitivo do produto** — é uma premissa incorreta herdada da pesquisa anterior. O que existe sob esse nome é tooling interno de desenvolvimento do próprio repositório (`.agents/skills/`), nada que o usuário final do Cloudflare OS jamais toca. Isso **fortalece**, não enfraquece, a tese do §2.2, linha "Skill (prompt) → manifest sem main.* → dado, não código": o Cloudflare OS nem tentou generalizar "prompt reutilizável" como primitivo — não construiu isso.

**Veredito:** Cloudflare OS reinventou efetivamente **três primitivos de extensão com formas de código distintas** (Gadget, Gatekeeper, Blueprint-como-dado) mais um mecanismo de invocação único (Code Mode/`executeCode`) que efetivamente colapsa "tool/MCP/skill de prompt/modelo especialista" em "import" — essa parte específica do §3 do ARCHITECTURE.md está **replicada quase literalmente**, inclusive citando o mesmo blog post da Cloudflare como fonte. Mas o §2 ("um único primitivo com um campo `activation`") **não é o desenho do Cloudflare OS**: eles têm categorias de módulo genuinamente distintas por *tipo de contrato*, não por *quem invoca*. O eixo irredutível do Cloudflare OS não é "quem invoca" — é "isso é um app com estado (Gadget) ou uma ponte de capability para fora (Gatekeeper)?". Isso é mais próximo dos "2 primitivos (Capability e Interceptor)" que o RESEARCH.md original propôs e que o ARCHITECTURE.md rejeitou explicitamente, do que da tese vigente de "um só".

---

### Confronto com o §2 do ARCHITECTURE.md

| `activation` (§2) | Quem chama | Equivalente no Cloudflare OS | Existe? |
|---|---|---|---|
| `model` | modelo escrevendo código | qualquer binding (Gadget RPC, Gatekeeper Session) exposto no `env` de `executeCode` | **Sim**, e com a mesma filosofia de code-execution/schema tipado gerado |
| `before_request` | runtime, ponto fixo antes do request ao modelo | **nada encontrado.** Sem interceptor de pipeline de inferência | **Não** |
| `after_response` | runtime, ponto fixo após resposta do modelo | **nada encontrado** | **Não** |
| `on_stream_chunk` | runtime, por chunk de streaming | **nada encontrado**; nenhuma menção de hook por chunk de stream do modelo | **Não** |
| `ui:*` | usuário clicando | mais próximo: Configurator UI (ação única de conectar recurso) e a UI do Gadget em si (mas isso é a aplicação inteira, não um botão de ação pós-resposta como o `Action` do Open WebUI) | **Parcial** — existe interação de UI, mas não como *extensão registrável* com manifest análogo a `ui:message_action` |
| `provider` | usuário selecionando, substitui geração inteira | seleção de modelo/provedor de IA é suportada ("You can choose your LLM... many major providers"), mas **não há um mecanismo de extensão de terceiros para plugar um `provider` custom** — é configuração de conta, não um artefato distribuível como Gadget/Gatekeeper/Blueprint | **Não como primitivo de extensão** |
| *(sem equivalente no §2)* | serviço externo empurrando evento | **Hooks** (`hookTsType`, push notification) — mecanismo assíncrono que o §2 não cobre em nenhuma das 5 linhas de `activation` | **Cloudflare OS tem algo que o §2 não tem** |
| *(sem equivalente no §2)* | humano aprovando ação com efeito colateral | **`ApprovalQueue`/`submitAction`/`applyAction` + simulação** — controle de aprovação assíncrona com leitura simulada enquanto se aguarda aprovação | **Cloudflare OS tem algo que o §2 não tem, e é sofisticado — resolve exatamente a queixa do README sobre "--dangerously-skip-permissions"** |

**Leitura direta:** o Cloudflare OS cobre solidamente `activation = "model"` (é o cerne do produto) e tem uma versão fraca de `ui:*` (mas não como manifest/extensão de terceiros — é a própria aplicação Gadget). **Não cobre `before_request`/`after_response`/`on_stream_chunk` nem `provider` como mecanismos de extensão** — não há filtro de pipeline de inferência nem "Pipe" plugável no sentido do Open WebUI. Isso é uma lacuna real que sobrevive ao Cloudflare OS: interceptors de request/response e providers plugáveis continuam sem equivalente. Em compensação, o Cloudflare OS tem **dois mecanismos que o §2 do ARCHITECTURE.md simplesmente não modela**: hooks assíncronos empurrados por serviço externo, e um framework de aprovação com simulação que resolve o problema de UX do human-in-the-loop de forma mais madura que qualquer coisa no ARCHITECTURE.md atual.

---

### Gatekeepers

Gatekeepers são descritos no README como "like supercharged MCP servers" e no `write-gatekeeper/SKILL.md` como tendo **sete responsabilidades obrigatórias** — não são um proxy simples de capability, são um **primitivo de extensão completo com contrato rico**: auth (OAuth via `UserAccount` DO), design de API capability-based, granularidade fina de concessão, log+aprovação (`ApprovalQueue`), cache, **simulação de ações pendentes** (a parte mais sofisticada — leituras refletem ações ainda não aprovadas, para não travar o agente esperando humano), e verificação de observador em compartilhamento (`getVerifier`/`addObserver`/`removeObserver`, com quatro estratégias A–D documentadas conforme sensibilidade do recurso).

**Quantos vieram prontos:** **16 pacotes `gatekeeper-*`** no repositório: `cloudflare`, `confluence`, `context` (biblioteca de contexto interna), `email`, `github`, `google`, `homeassistant`, `linear`, `mcp`, `mcp-portal`, `notion`, `scheduler` (tarefas agendadas, não é bem um serviço externo), `slack`, `spotify`, `supabase`, `zoominfo`. Isso cobre um conjunto razoável de SaaS corporativos comuns (Google Workspace, GitHub, Slack, Notion, Confluence, Linear, Supabase), mais um caso doméstico (Home Assistant) e dois genéricos MCP.

**Escala como n8n/Home Assistant (milhares de integrações sob um contrato) ou é trabalho manual por serviço?** **É trabalho manual por serviço, com uma única válvula de escape genérica: o `gatekeeper-mcp`.** A evidência:

- O `write-gatekeeper/SKILL.md` é um guia de **7 etapas + 2 fases** para um engenheiro (ou agente sob supervisão) escrever um Gatekeeper novo do zero: desenhar a API TypeScript, **parar e pedir revisão humana do design** antes de prosseguir ("Do not proceed without operator approval" — duas vezes no processo), implementar auth/cache/simulação/observadores manualmente. Isso é o oposto de "milhares de integrações sob um contrato uniforme" — é curadoria artesanal por integração, deliberadamente lenta ("getting the API right is the most important and delicate part... means rebuilding").
- A única exceção real é `gatekeeper-mcp`: "**One Worker covers every MCP server**, so a server needs no Gadgets-specific work to be usable from a Gadget." Isso é o caminho de escala — qualquer servidor MCP existente vira automaticamente um Gatekeeper sem trabalho manual, gerando métodos tipados a partir do `inputSchema` de cada tool. Mas mesmo esse caminho tem limitações documentadas explicitamente: sem simulação ("MCP describes no way to predict a tool's effect"), sem revert, sem hooks, sem scoping abaixo do nome da tool, e trust tier `byo` (aprovação automática de escrita nunca acontece, ao contrário de um gatekeeper nativo bem desenhado).
- O `gatekeeper-mcp-portal` estende isso para um cenário empresarial (um portal MCP administrado central, com tokens pré-emitidos e anotações confiáveis — `vetted`), mas ainda dentro do mesmo modelo de "MCP genérico, sem trabalho por serviço".

**Conclusão sobre Gatekeepers:** é um **primitivo de extensão de verdade** (não um simples proxy fino), com contrato rico o suficiente para justificar 300+ linhas de skill de autoria. Escala em dois regimes distintos: (a) integrações **nativas de alta qualidade** (Google, GitHub, Slack etc.) são trabalho manual, um Gatekeeper por serviço, curado e revisado por humano — não escala como n8n; (b) integrações **via MCP** escalam automaticamente para qualquer servidor MCP existente, mas com uma superfície de segurança e recursos deliberadamente mais pobre (sem simulação, sem aprovação automática de escrita). O Cloudflare OS não fingiu resolver os dois regimes com o mesmo esforço — documentou a lacuna às claras.

---

### Fontes

- `github.com/cloudflare/cloudflare-os` — README.md (raiz), `AGENTS.md` (raiz)
- `docs/blueprints.md`
- `docs/observers.md`
- `.agents/skills/write-gatekeeper/SKILL.md`
- `packages/workshop-shared/src/gatekeeper.ts` (interfaces `VendorDescription`, `AccountDescription`, `ResourceDescription`, `SupportedResource`, `AgentCatalog*`)
- `packages/workshop-backend/src/overseer.ts` (busca por `executeCode`, `bindHook`, ausência de `beforeRequest`/`afterResponse`/`onStreamChunk`/`interceptor`/`Pipe`)
- `packages/gatekeeper-mcp/README.md`
- GitHub REST API: `/repos/cloudflare/cloudflare-os` (metadados), `/repos/.../contributors`, `/repos/.../commits` (paginação)
- `blog.cloudflare.com/code-mode/` (citado pelo próprio README do Cloudflare OS como origem do padrão de invocação)

---

# 2. Code Mode e o substrato de isolate

> O que está GA, o que está em beta, e a lacuna de exposição lazy que fechou.

### Números

| Métrica | Valor | Fonte |
|---|---|---|
| Cold start de isolate dinâmico | "a handful of milliseconds" (qualitativo, sem número exato documentado) | blog.cloudflare.com/code-mode/ |
| Cold start (comparativo) | "~100x mais rápido... que um container típico" (qualitativo) | blog.cloudflare.com/dynamic-workers/ |
| Memória por isolate | 128 MB (heap+WASM), hard limit da plataforma Workers — não é o "few megabytes" citado no post (esse é o footprint típico de um isolate ocioso, não o teto) | developers.cloudflare.com/workers/platform/limits/ |
| CPU time (Worker Paid) | default 30s, ajustável até 5 min (300.000 ms); Dynamic Worker herda o limite do plano por padrão, mas aceita `limits.cpuMs` custom por invocação | idem + developers.cloudflare.com/dynamic-workers/usage/limits/ |
| Subrequests | 10.000/invocação (Paid), custom via `limits.subRequests` no Dynamic Worker | idem |
| Isolates simultâneos por conta | não confirmado — nenhum teto documentado; billing é por Dynamic Worker único criado/dia, não por concorrência |  |
| Preço Dynamic Workers — criação | 1.000 workers únicos/mês incluídos; $0,002 por worker adicional/dia | developers.cloudflare.com/dynamic-workers/pricing/ |
| Preço Dynamic Workers — requests | 10M/mês incluídas, +$0,30/milhão (tarifa Standard) | idem |
| Preço Dynamic Workers — CPU | 30M CPU-ms/mês incluídos, +$0,02/milhão CPU-ms; cobra **startup** (init do isolate + parse) separado de **execução** | idem |
| Plano exigido | Workers Paid (US$5/mês mínimo) — Free plan NÃO tem acesso | idem |
| Containers — instância `lite` | 1/16 vCPU, 256 MiB RAM, 2 GB disco | developers.cloudflare.com/containers/pricing/ |
| Containers — cold start | "2–3 segundos" (fonte secundária, comparativo de mercado) — não achei o número em doc oficial primária | blaxel.ai (citando dado Cloudflare não confirmado em página oficial) |
| Containers — preço CPU | $0,00002/vCPU-segundo, cobrado só por uso ativo (não provisionado) desde 21/11/2025 | developers.cloudflare.com/changelog/2025-11-21-new-cpu-pricing/ |
| Containers — incluído no plano Paid | 25 GiB-hora RAM, 375 vCPU-min, 200 GB-hora disco/mês | developers.cloudflare.com/containers/pricing/ |

### Estado de maturação

- **Worker Loader API → renomeada "Dynamic Workers".** A URL `developers.cloudflare.com/workers/runtime-apis/bindings/worker-loader/` hoje redireciona para `developers.cloudflare.com/dynamic-workers/`. Status: **open beta desde 24/03/2026** para todo usuário do Workers Paid plan (era closed beta na época do post, 26/09/2025). Não é GA. Precisa de plano pago — Free plan fica de fora. Local (workerd + Wrangler): disponível **desde o dia do post**, sem beta gate, porque roda fora da rede de produção da Cloudflare.
- **Code Mode / `@cloudflare/codemode`.** É pacote npm publicado (`agents/codemode`), documentado em 6 arquivos (`index.md`, `connectors.md`, `runtime.md`, `approvals.md`, `snippets.md`, `vite-plugin.md`) no repo `cloudflare/agents`. Não há rótulo formal GA/beta no pacote — é tratado como parte normal do Agents SDK, atualizado ativamente (a doc que citei já reflete uma API bem mais madura que a do post original, ver seção seguinte).
- **Containers + Sandbox SDK: GA desde 13/04/2026** (`developers.cloudflare.com/changelog/post/2026-04-13-containers-sandbox-ga/`), plano Paid.
- **`@cloudflare/computer`: preview aberto, anunciado 03/08/2026** — 12 dias antes da data de referência desta investigação (15/08/2026). Open-source (`github.com/cloudflare/computer`), `npm install @cloudflare/computer`. Estado: early preview, não GA.

### A lacuna de exposição lazy

**Fechada.** Isto é a descoberta mais importante do dossiê e contradiz a premissa de que a citação do post de 26/09/2025 ainda vale.

O post original (§3.3 do ARCHITECTURE.md se apoia nele) diz: *"Currently, the entire API is loaded, but future improvements could allow an agent to search and browse the API more dynamically."* Isso descrevia o codemode em setembro/2025.

Lendo `docs/codemode/index.md` e `docs/codemode/runtime.md` do repo `cloudflare/agents` **hoje**, a API mudou de forma incompatível com a citação:

- O modelo não recebe mais "a API TypeScript inteira" no prompt. Recebe **um** tool (`codemode({ code })`) e, dentro do sandbox, um SDK de 4 métodos: `codemode.search(query)`, `codemode.describe(target)`, `codemode.step(name, fn)`, `codemode.run(name, input?)`.
- Texto literal da doc atual: *"search and describe return results into the running code, not into the prompt — the model pays for exactly the type information it asks for."* — isto é exposição lazy, textualmente a mesma frase de intenção do §3.3 do ARCHITECTURE.md ("o stub tipado completo carrega sob demanda, quando o modelo importa").
- `codemode.search` faz ranking (path peso 12, method 10, connector 8, description 5, com bônus de match exato/prefixo/frase) e limita a 50 resultados, com `truncated: true` sinalizando ao modelo para refinar a busca.
- `OpenApiConnector` deriva tipos **host-side, uma vez**, "custando zero tokens de prompt" — reforça que a filosofia de custo de contexto já é tratada como requisito de design, não otimização futura.

**Conclusão sobre o §3.3:** a arquitetura escolhida (manifest declara existência; stub completo só entra no contexto sob demanda) **já é exatamente o que a Cloudflare implementou** em `codemode.search`/`describe`. Isso não invalida o design do ARCHITECTURE.md — na verdade o **confirma como correto** — mas invalida a alegação de "buraco defensável" que dependia do post de set/2025 estar desatualizado. Se o objetivo de `personal_web_ui` era simplesmente "expor lazy" como diferencial, **esse diferencial específico já não existe**: a Cloudflare chegou lá primeiro, com produto real (não protótipo de pesquisa).

Sobre a distinção pedida — ganho de **encadeamento** vs. ganho de **schema**: a doc atual do codemode preserva os dois argumentos do post original sem misturá-los:
1. Ganho de **encadeamento** (não passar resultado intermediário pelo modelo) — mantido, é o argumento central de "Real work needs durable state" e do exemplo `list_pull_requests` → processamento em código sem round-trip.
2. Ganho de **schema/composição** — os 98,7% da Anthropic (150k→2k tokens) são citados no ARCHITECTURE.md como medição separada (anthropic.com/engineering/code-execution-with-mcp), não como número da Cloudflare. A doc da Cloudflare não fornece medição de tokens brutos por servidor MCP típico — não há número quantificado publicado por eles para "custo da API TypeScript gerada" vs. "schema JSON cru". **Não confirmado**: nenhum dos dois posts/docs da Cloudflare lidos dá uma contagem de tokens específica para a API TypeScript de um MCP server. O ganho de token real que a Cloudflare reivindica é qualitativo ("save up to 80% em tokens de inferência", ver `developers.cloudflare.com/dynamic-workers/`) e mistura os dois efeitos (schema + encadeamento) numa única cifra, sem decompor — exatamente a confusão que o ARCHITECTURE.md pede para não fazer.

### Isolamento

- **Modelo de acesso: capability-based por binding, deny-by-default, não allowlist de rede.** `globalOutbound: null` bloqueia todo `fetch()`/`connect()` do sandbox — lança exceção. Acesso só via bindings explícitos passados em `env` no momento da criação do Worker dinâmico (`ctx.exports.MinhaClasse({props})`). Isso é literalmente o design do §5 do ARCHITECTURE.md ("capability" declarada, não rede geral com filtro).
- Alternativa documentada: interceptar via `WorkerEntrypoint` gateway (`globalOutbound: ctx.exports.HttpGateway()`) para logging/injeção de credenciais sem expor a secret ao código do modelo — API keys nunca chegam ao sandbox.
- **Spectre/side-channels em isolate compartilhado**: a Cloudflare **admite abertamente** que não pode confiar em patches de OS/hipervisor porque isolates compartilham processo. Mitigações documentadas (`blog.cloudflare.com/mitigating-spectre-and-other-security-threats...`, `blog.cloudflare.com/safe-in-the-sandbox...`):
  - `Date.now()` e timers de alta resolução são travados/reduzidos durante execução — mitiga timing attack.
  - `SharedArrayBuffer` desabilitado.
  - Memory Protection Keys (MPK) por isolate — chave aleatória protegendo heap V8 de cada isolate.
  - **Dynamic Process Isolation** — mecanismo próprio (paper acadêmico, arXiv:2110.04751) que reagenda scripts "suspeitos" para processo isolado com falso-positivo de 0,61%.
  - Memory shuffling periódico.
- **Caso documentado de escape**: não encontrado nenhum CVE ou incidente público de escape Spectre confirmado em produção Workers nas fontes lidas. A postura da Cloudflare é declaradamente "defesa em profundidade, não garantia de isolamento hermético" — o que bate com o risco assumido explicitamente no §9 do ARCHITECTURE.md ("Isolate tem isolamento fraco a nível de OS... mitigado como a Cloudflare mitiga").

### Fronteira do isolate e Containers

- Confirmado pela doc do sandbox de Code Mode: **zero acesso à Internet**, zero filesystem, zero binário nativo dentro do V8 isolate — só JS/TS puro + bindings RPC.
- **Resposta oficial da Cloudflare para o que não cabe no isolate é dupla, e mudou de forma relevante desde o post original**:
  1. **Containers + Sandbox SDK** (GA 13/04/2026) — Linux completo, deps nativas, PTY, filesystem persistente, snapshot/restore. Roda sobre um **scheduler runtime-agnostic que suporta gVisor, Firecracker microVM e QEMU** (`blog.cloudflare.com/container-platform-preview/`), avaliando adicionar `cloud-hypervisor` (rust-vmm). Ou seja: **não é um runtime único** — é um pool heterogêneo, escolhido conforme carga.
  2. **`@cloudflare/computer`** (preview, 03/08/2026) — camada de orquestração acima dos dois substratos: `Workspace` decide dinamicamente entre "Isolate runtime" (`just-bash` + Dynamic Workers, para manipulação de arquivo/dados) e "Container runtime" (Cloudflare Containers via FUSE, para binário nativo/gerenciador de pacotes/userland completo). Meta declarada pela Cloudflare: container necessário em **menos de 10% do trabalho do agente** (fonte secundária, nerdleveltech.com, citando a doc/blog oficial — não localizei essa cifra em página `developers.cloudflare.com` primária, então trato como não totalmente confirmado em fonte primária, embora citado consistentemente).
- Code Mode (o sandbox de execução de código do modelo) e Containers **são mundos hoje unificados por `@cloudflare/computer`**, mas essa unificação é preview de 12 dias — não GA, API pode mudar.

### Valida ou contradiz o §5

**Valida, ponto a ponto, com uma ressalva de nomenclatura.**

| §5 (ARCHITECTURE.md) | Cloudflare (Code Mode + Containers + `@cloudflare/computer`) |
|---|---|
| V8 isolate para orquestração escrita pelo modelo, <5ms cold start | Dynamic Workers = V8 isolate, "a handful of milliseconds", usado exatamente para código gerado pelo modelo |
| Container + gVisor para capacidade com deps nativas, 50–100ms | Containers, scheduler que **inclui gVisor** entre as opções (junto de Firecracker/QEMU) — a ressalva é que a Cloudflare não fixou gVisor como único runtime, é um dos três/quatro suportados |
| Dois substratos, nenhum WASM | Dois substratos (isolate / container), WASM não aparece em nenhuma doc de Code Mode, Dynamic Workers ou `@cloudflare/computer` lida |
| Isolamento capability-based por `grants` no manifest | `globalOutbound: null` + bindings explícitos — mesmo princípio, nomenclatura diferente |

A convergência é forte o bastante para ler como confirmação independente pós-hoc da decisão do §5, vinda do maior operador de isolates do mundo, e datada **depois** da decisão registrada no ARCHITECTURE.md (o `@cloudflare/computer` de agosto/2026 é posterior). Isso não é uma coincidência de pesquisa prévia — é o mercado convergindo para a mesma resposta, o que fortalece a tese e ao mesmo tempo mata qualquer alegação de que o par isolate/container fosse ideia autoral única.

### Impacto no `personal_web_ui`: o que sobra

1. **§3.3 (exposição lazy) deixa de ser diferencial técnico.** A Cloudflare já entrega isso, em produto real, hoje. O que resta autoral aqui não é "ter exposição lazy" — é **o escopo do primitivo que a expõe**: o codemode da Cloudflare só cobre `activation = "model"` (conectores MCP/OpenAPI/AI SDK toolset). Ele não tem `before_request`/`after_response`/`on_stream_chunk`/`ui:*`/`provider` como o mesmo primitivo com o mesmo manifest — isso continua sendo território não ocupado.
2. **§5 (substrato duplo) é confirmado, não diferenciado.** Construir isso do zero seria redundante frente a Dynamic Workers + Containers + `@cloudflare/computer`, que já fazem exatamente essa orquestração, com scheduler mais sofisticado (3-4 runtimes de container) do que a decisão simples "container+gVisor" do ARCHITECTURE.md.
3. **O que continua sem resposta da Cloudflare**: skill de prompt, tool MCP e modelo especialista tratados como **o mesmo primitivo de manifest único** com roteamento por capacidade declarada (`requires = {modality, class}`) e billing ledger + routing_reason como campos estruturados de primeira classe. Nada no material lido (Code Mode, Dynamic Workers, Containers, `@cloudflare/computer`) toca roteamento por metadado declarado ou o par billing/observability do §6. O buraco do §1 ("ninguém trata tool MCP, skill de prompt e modelo especialista como o mesmo primitivo executável") **encolheu** (a metade "exposição lazy" fechou) mas **não fechou**: a outra metade, "mesmo primitivo com `activation` colapsando os 6 mecanismos + roteamento por capacidade + routing_reason estruturado", continua sem equivalente Cloudflare documentado.

### Fontes

- blog.cloudflare.com/code-mode/ (26/09/2025, `dateModified` 15/07/2026)
- github.com/cloudflare/agents/blob/main/docs/codemode/index.md, connectors.md, runtime.md (lidos via raw.githubusercontent.com — o link do post para `docs/codemode.md` está morto/movido para `docs/codemode/index.md`)
- developers.cloudflare.com/dynamic-workers/ (worker-loader redireciona para cá), /pricing/, /usage/limits/, /usage/egress-control/
- developers.cloudflare.com/workers/platform/limits/
- developers.cloudflare.com/changelog/post/2026-03-24-dynamic-workers-open-beta/ (via citação de busca)
- developers.cloudflare.com/changelog/post/2026-04-13-containers-sandbox-ga/
- developers.cloudflare.com/changelog/2025-11-21-new-cpu-pricing/
- developers.cloudflare.com/containers/pricing/
- developers.cloudflare.com/changelog/post/2026-08-03-cloudflare-computer/ (+ blog.cloudflare.com/cloudflare-computer/, não lido linha a linha, só changelog)
- blog.cloudflare.com/container-platform-preview/ (gVisor/Firecracker/QEMU scheduler)
- blog.cloudflare.com/dynamic-workers/ (post "Sandboxing AI agents, 100x faster")
- blog.cloudflare.com/mitigating-spectre-and-other-security-threats-the-cloudflare-workers-security-model/ e blog.cloudflare.com/safe-in-the-sandbox-security-hardening-for-cloudflare-workers/ (via citações de busca — conteúdo não lido diretamente linha a linha, reportado com ressalva)
- github.com/cloudflare/cloudflare-os, README.md (via busca — repo confirma existência, não li código-fonte de `packages/workshop-backend`/`gatekeeper-*` por não terem relação direta com Code Mode/Worker Loader, escopo desta tarefa)

---

# 3. O placar das 8 irritações, revisado

> O que o Cloudflare OS resolve, o que não toca, e as lacunas que sobram.

### Placar das 8 irritações — pós-Cloudflare-OS

| # | Irritação | Resolve? | Evidência | O que sobra |
|---|---|---|---|---|
| 1 | Extensão despadronizada | **Parcial** | Cloudflare OS tem primitivo único de "Gatekeeper" (driver de recurso externo) + "Gadget" (app sandboxed) — mas são **dois** conceitos distintos, não um só como no §2 do ARCHITECTURE.md. MCP vira `gatekeeper-mcp`/`gatekeeper-mcp-portal`, mas convive como categoria separada de "Context Library" (`gatekeeper-context`) e "Scheduled Tasks" (`gatekeeper-scheduler`) — mecanismos plurais, não um campo `activation` unificador. | O primitivo único com `activation` como único campo decisor (§2.1) não existe lá. Cloudflare tem *mais* tipos de coisa (Gatekeeper, Gadget, Blueprint, singleton account, ambient binding), não menos. |
| 2 | MCP token-ineficiente | **Sim, via Code Mode** | README confirma: "The Cloudflare OS agent is a [Code Mode] agent — it performs tasks by writing and immediately executing snippets of code." AGENTS.md: agente lê `getSession`/`getAgentCatalog` via `executeCode`, cada leitura vira "observation". Mesma tese do §3 do ARCHITECTURE.md (code execution > tool-calling), publicada pela própria Cloudflare em blog.cloudflare.com/code-mode/ (04/11/2025, mesma fonte já citada no RESEARCH.md). | Nada — a tese estava certa e a Cloudflare a implementou primeiro. A exposição lazy (§3.3) parece equivalente: `getAgentCatalog()` é descoberta sob demanda, ambient bindings só entram quando o admin/usuário "introduz" o recurso. |
| 3 | Falta de funcionalidades especialistas | **Não confirmável no Cloudflare OS; parcial na plataforma Cloudflare** | Não encontrei, em README/AGENTS.md/docs lidos, nenhum roteamento automático do Cloudflare OS para modelo especialista pequeno por tipo de tarefa. O catálogo Workers AI **tem** modelos especialistas (Whisper ASR, EmbeddingGemma-300M, BGE embeddings, reranker, Moondream 3 para OCR/visão) — mas nada no repo do Cloudflare OS liga um Gadget a esses modelos automaticamente por metadado de tarefa. | Roteamento por `requires = { modality, class }` (§4.1) não tem equivalente achado. Ninguém expõe "Gadget declara modalidade → sistema escolhe modelo especialista" como mecanismo de primeira classe no Cloudflare OS. |
| 4 | Multimodalidade travada no mesmo modelo | **Não confirmado** | Provedor de LLM é escolhido pelo usuário via `pi-agent-core` ("You can choose your LLM… works with many major AI model providers and self-hosted models") — escolha é de **provedor**, não roteamento automático por modalidade dentro de um turno. Nenhuma menção a pipeline separando texto/imagem/áudio para modelos distintos. | A lacuna persiste: nada visto trata "há uma imagem no payload → rotear para modelo de visão" como decisão automática do sistema. |
| 5 | Falta de roteamento automático por tarefa | **Não confirmado / provavelmente ausente** | Mesmo achado do item 4: escolha de modelo é de usuário/config, não classificador de tarefa. `pi-agent-core` unifica *chamar* qualquer provedor, não decide *qual* usar por dificuldade/classe. | Camada 1 (§4.1, metadado determinístico) e Camada 2 (§4.2, classificador local tipo RouteLLM) seguem sem equivalente achado no Cloudflare OS. |
| 6 | Governança e billing | **Parcial, e mais fraco que o ARCHITECTURE.md previa** | `docs/ai-gateway-billing.md`: contador diário de chamadas por `UserDurableObject` + saldo lido ao vivo do AI Gateway (cache 5 min) + gate de `$2` mínimo. **Não há `turn_id`/`call_id` por sub-chamada, nem ledger imutável separado do trace** — é um contador + verificação de saldo pré-turno, não um evento de custo por chamada. Governança corporativa (Access, admin panel, RBAC de gatekeepers) **existe e é forte** — mas é o oposto do "não construir governança enterprise" do §6/§7: a Cloudflare construiu exatamente isso. | O ledger `turn_id`+`call_id` (§6) não existe. `routing_reason`/`routing_policy_version`/`candidates_considered` (§4.3) não existem — ver seção dedicada abaixo. |
| 7 | Falta de micro sandboxes | **Sim, e mais forte que o previsto** | Cada Gadget roda em Dynamic Worker Facet, servidor sem acesso à internet exceto Workers Bindings explícitos; cliente roda em iframe sandboxed com CSP. Isso é sandbox por *aplicação*, não por *chamada de tool* — mais amplo que o TOOL-24 (sandbox de servidor MCP stdio) do corte v0. | Nada aqui contradiz o RESEARCH.md original (§7: "refutada como lacuna de mercado" — Sandbox SDK/Dynamic Workers já eram a evidência-base). Cloudflare OS é prova adicional de que o mercado já resolveu isso — reforça a decisão de não construir. |
| 8 | GPU serverless / provedores externos com fila | **Não confirmado — sem evidência de contrato submit+poll** | Nenhuma menção a Modal, RunPod, Replicate, fal, nem a padrão "job pendente como estado de primeira classe" em README/AGENTS.md/docs lidos. Cloudflare OS chama LLMs via AI Gateway/Workers AI (síncrono, dentro do limite de request de Worker) — nada indica suporte nativo a chamada de GPU serverless de terceiro com poll assíncrono de 60s+. | O contrato do §5.1 (submit+poll, SSE de progresso, "GPU acordando (~Ns)") segue sem equivalente achado. Se um Gadget tentasse chamar Modal/RunPod síncrono, bateria no limite de duração de Worker do mesmo jeito que bateria em qualquer outra UI — a menos que use Cloudflare Workflows (não verificado no repo, apenas citado como possibilidade genérica da plataforma). |

---

### Roteamento

Achado central: **o Cloudflare OS não tem roteador de modelo por capacidade declarada.** O que existe:

- Escolha de LLM é do **usuário/config**, via `pi-agent-core` — abstração de "uma API para todo provedor", não um roteador de decisão. Citação do README: "You can choose your LLM. Cloudflare OS works with many major AI model providers and self-hosted models."
- Não há, em nenhum arquivo lido (README, AGENTS.md, docs/ai-gateway-billing.md), um schema de manifest de Gadget com campo `requires = { modality, class }` equivalente ao §4.1. O AGENTS.md descreve a arquitetura de Gatekeepers/contas/bindings em detalhe extremo — se existisse um mecanismo de roteamento por metadado, é o tipo de coisa que apareceria nesse documento (ele documenta até nuances de `no-floating-promises` no lint). A ausência é evidência, não silêncio.
- O catálogo Workers AI **tem** os ingredientes: Whisper (ASR), EmbeddingGemma-300M e BGE (embedding), um modelo reranker dedicado, Moondream 3 (9B MoE, 2B ativos — OCR/visão/detecção). Preço por Neuron (~$0,011/1k Neurons no plano pago, 10k Neurons/dia grátis); Llama 3.1 8B fp8-fast a $0,045/M tokens de entrada. Isso confirma a irritação nº 3 do ARCHITECTURE.md ("modelos de 0,9–1,2B batem modelos frontier em parsing de documento") continua real e disponível — mas **nada no Cloudflare OS conecta um Gadget a esses modelos automaticamente por declaração de modalidade/classe**. É capacidade de plataforma (Workers AI), não decisão de produto (Cloudflare OS).
- `CF_AI_GATEWAY_PROVIDERS=anthropic,openai,google` mostra que o AI Gateway aceita provedor externo — então "amarrado a Workers AI" é falso quanto a **acesso**, mas verdadeiro quanto a **roteamento automático entre eles por tarefa**: não há evidência de tal roteamento.

Conclusão: item 4 e 5 das 8 irritações **seguem abertos** no Cloudflare OS especificamente, mesmo a plataforma Cloudflare (Workers AI) tendo os componentes brutos.

---

### A lacuna do §4.3 morreu?

**Não. Segue viva — e a busca ativa a confirma.**

Verificação dirigida no schema de log do AI Gateway (`developers.cloudflare.com/ai-gateway/observability/logging/`): campos documentados são `ID, Cached, CreatedAt, Duration, Model, Path, Provider, Success, TokensIn, TokensOut, Cost, CustomCost, Metadata, ModelType, RequestContentType, RequestHead, RequestHeadComplete, RequestSize, RequestType, ResponseContentType, ResponseHead, ResponseHeadComplete, StatusCode, Step`. Não há `routing_reason`, `routing_policy_version`, nem `candidates_considered`.

Existe um campo `Metadata` — até 5 entradas custom por request (`cf-aig-metadata`) — que **poderia** carregar `routing_reason` manualmente, se o chamador o escrever. Mas isso é o mesmo ponto que o ARCHITECTURE.md já previa como decisão própria ("campos de primeira classe... desde a primeira linha de código"): a Cloudflare oferece o slot genérico, não o campo semântico. É a diferença entre "dá para você construir isso em cima" e "o produto já expõe isso". `cf.user_id` (identity-aware, changelog 2026-08-05) é o único metadado *sistêmico* que a Cloudflare passou a injetar automaticamente — e é sobre identidade, não sobre decisão de roteamento.

Nenhuma evidência equivalente encontrada no Cloudflare OS: não há schema de Gadget/turno que grave por que um modelo foi escolhido, porque — como visto acima — não há roteamento automático de modelo no Cloudflare OS para começo de conversa.

**Veredito: a lacuna nº 1 mais barata de fechar do ARCHITECTURE.md (§4.3) continua sendo escopo autoral legítimo.**

### Metering

O modelo real (`docs/ai-gateway-billing.md`) é mais simples do que o §6 do ARCHITECTURE.md endereça, e confirma a premissa "best-effort" sem resolvê-la:

- **Free tier**: contador diário de chamadas LLM por usuário (`DAILY_LLM_CALL_LIMIT`, default 100), em `UserDurableObject` — contagem, não custo.
- **BYOK**: usuário conecta a própria conta Cloudflare; saldo lido ao vivo do endpoint `/ai-gateway-billing/credit_balance`, **cacheado por 5 minutos** — ou seja, pode autorizar gasto acima do saldo real dentro dessa janela. Gate de saldo mínimo (`MINIMUM_CLOUDFLARE_BALANCE`, default $2) antes de liberar.
- **Sem ledger imutável por sub-chamada.** Não há `turn_id`/`call_id` propagado por chamada de modelo/OCR/rerank/sandbox como o §6 exige. O que existe é: (a) contador de chamadas por dia, (b) leitura de saldo cacheada, (c) o log nativo do AI Gateway (que tem `Cost`/`CustomCost` por request individual, mas sem agregação por turno multi-modelo).
- **"Best-effort" confirmado, não resolvido.** A doc não afirma precisão: o cache de 5 min é uma admissão implícita de que o saldo consultado pode estar desatualizado — exatamente o padrão "hold otimista" que o §6 já previa como solução, mas a Cloudflare não implementou reconciliação pós-fato nem `hold`/estorno explícito documentado.
- **Sem noção de orçamento por agente ou por turno**, só por usuário/dia — mais grosseiro que o `turn_id` proposto.

### Multi-tenant e ACL

A premissa do Change ("é desenhado para empresa, assume identidade corporativa") está **parcialmente errada** — a doc `docs/public-server.md` é explícita:

> "By default the Workshop uses built-in username/password accounts (or Cloudflare Access) and gives every user unlimited AI usage — **ideal for self-hosting**."

Ou seja: modo padrão é **username/password local, sem SSO/Zero Trust obrigatório**, uso de IA ilimitado (sem cobrança) — literalmente o caso de uso pessoal/pequeno do projeto ameaçado. `pnpm run-local` sobe tudo localmente sem nenhuma configuração de Access/OAuth corporativo. Cloudflare Access/Zero Trust é **opcional**, uma camada a mais para quem quer empresa.

O que É corporativo por padrão: o *modelo de compartilhamento* (Gatekeepers, collaborators com roles `build`/`use`, share links, grafo de permissão transitiva revogável — tudo documentado em `docs/sharing.md` com sofisticação de sistema operacional real) — mas isso é **opcional**: um usuário solo nunca cria collaborators, nunca vê a máquina de revogação.

**Veredito: fricção, não bloqueio.** Rodar single-user é o caminho documentado de primeira classe, não um workaround. O peso real está em outro lugar: a superfície de deploy (Durable Objects, Dynamic Workers, Workers Bindings, `wrangler`, pipeline de release com R2 content-addressed) exige conta Cloudflare paga e conhecimento de Workers — não é "baixe e rode" como um app desktop. Isso é custo de operação, não de modelo de permissão.

### GPU serverless

**Nenhuma evidência encontrada de contrato submit+poll para GPU serverless de terceiro.** Buscas em README, AGENTS.md, `docs/ai-gateway-billing.md`, `docs/public-server.md` não retornaram menção a Modal, RunPod, Replicate, fal, nem a "job pendente" como estado de primeira classe, nem a Cloudflare Workflows como mecanismo usado pelo Cloudflare OS.

O que existe é chamada de LLM via AI Gateway/Workers AI — request HTTP com token, dentro do ciclo de vida normal de um Worker. Nada no material lido indica que um Gadget consiga invocar um provedor de GPU serverless externo e aguardar 60s+ de cold boot sem bater no limite de duração do Worker. **[INFERÊNCIA]** dado que Gadgets rodam em Dynamic Worker Facets (mesmas restrições de CPU/duração de qualquer Worker), uma chamada síncrona longa a um provedor de GPU externo provavelmente bateria no mesmo teto que já derruba Open WebUI/LibreChat — não há evidência de que o Cloudflare OS tenha resolvido esse problema especificamente, embora Cloudflare Workflows (produto separado da plataforma, não confirmado como integrado ao Cloudflare OS) seja o mecanismo óbvio candidato caso a Cloudflare venha a cobrir isso.

**A lacuna nº 8 do ARCHITECTURE.md segue de pé** quanto ao Cloudflare OS especificamente.

### Multimodalidade

Não encontrei, nos arquivos lidos (README, AGENTS.md, docs/*), qualquer menção a pipeline de imagem/áudio/vídeo/PDF de entrada específico do Cloudflare OS. O que existe é herdado da escolha de modelo — se o usuário escolhe um modelo multimodal (ex. Claude, GPT-4o) via `pi-agent-core`, a multimodalidade vem do provedor, não de infraestrutura própria do Cloudflare OS. Não há evidência de STT/TTS embutido, de upload de imagem com preview dedicado, nem de qualquer um dos 87 itens do domínio `MODAL` do `FEATURES.md` (visão, geração de imagem, STT, TTS, voz conversacional, arquivos, vídeo).

**Isso é lacuna estrutural, não imaturidade de 10 dias.** A razão: o Cloudflare OS não é um produto de chat multimodal — é um workspace de criação de apps. Multimodalidade de *chat* (colar screenshot, gravar áudio, anexar PDF numa conversa) não é o eixo do produto; o eixo é "peça um app e o agente escreve código". Não há sinal de que isso esteja no roadmap declarado (README não menciona).

### É a mesma categoria de produto?

**Não.** Evidência direta do próprio README, seção "Overview: What is Cloudflare OS really?": a tabela OS-normal/Cloudflare-OS mapeia `gadgets` a `processes`, `blueprints` a `executables` — o produto central é **criar e rodar mini-aplicativos sandboxed** ("Gadgets"), não conversar com um LLM. Chat é a *interface de comando* para o agente construtor, análogo a um shell, não o produto em si.

Cobertura dos domínios do `FEATURES.md`:
- **`CONV`** (103 itens — ciclo de mensagem, branching, streaming, edição): há um "agent chat UI", mas nenhuma evidência de branching de conversa, edição/regeneração de mensagem, comparação de respostas — funcionalidades centrais de um chat UI como Open WebUI/ChatGPT. O chat do Cloudflare OS é o loop de instrução ao agente construtor, não um produto de conversação rico.
- **`RAG`** (155 itens — ingestão, chunking, embeddings, retrieval, citações, memória): a "Context Library" (`gatekeeper-context`) é o único análogo achado — coleções de documentos que o agente lê como "observations". Isso cobre uma fração pequena de ingestão/organização; não há evidência de chunking configurável, escolha de embedding model, reranking, ou citação por trecho.
- **`ART`** (90 itens — artifacts, preview ao vivo, canvas): o conceito mais próximo é o **Gadget inteiro** — não um artifact leve dentro de uma conversa, mas um app completo com Durable Object, sandbox, RPC. É "artifact" levado ao extremo oposto de peso: onde Claude/ChatGPT geram um componente efêmero, o Cloudflare OS gera um processo persistente e multiplayer. Categoria adjacente, não equivalente.
- **`PROMPT`** (83 itens — system prompt, biblioteca de prompts, personas, templates): não encontrado. `AdminConfig` tem "agent instructions" (nível deployment, admin-config.ts) — é system prompt de admin, não biblioteca de prompts do usuário, nem personas, nem slash commands.

**Veredito direto: Cloudflare OS não substitui um Open WebUI.** É outra categoria — mais perto de "Replit/v0 com segurança corporativa embutida" do que de "cliente de chat multi-modelo". Um usuário que quer só conversar com um LLM, anexar PDFs, gerenciar prompts salvos e comparar respostas não encontra esse produto ali; encontra a máquina de construir apps que, incidentalmente, também aceita prompts em linguagem natural.

### As lacunas reais que sobram

Priorizadas por quão diretamente ferem a tese do `personal_web_ui`:

1. **`routing_reason`/`routing_policy_version`/`candidates_considered` como campo estruturado de primeira classe (§4.3).** Confirmado ainda inexistente — nem no AI Gateway nativo, nem no Cloudflare OS. Mais barato de construir agora do que nunca.
2. **Roteamento automático por modalidade/classe de tarefa para modelo especialista pequeno (§4.1/§4.2).** Os ingredientes existem na plataforma Cloudflare (Whisper, EmbeddingGemma, reranker, Moondream 3 no catálogo Workers AI) mas **nenhum produto encontrado** — nem Cloudflare OS — conecta a declaração de modalidade de uma capability ao modelo certo automaticamente. É a lacuna mais robusta que sobrou: a Cloudflare tem as peças e não montou o roteador.
3. **Primitivo único de extensão com um campo `activation` (§2).** Cloudflare OS tem *mais* categorias (Gatekeeper, Gadget, Blueprint, singleton account, ambient binding), não uma abstração unificadora comparável. A tese do §2 continua diferenciada.
4. **Ledger imutável `turn_id`+`call_id` por sub-chamada (§6).** O que a Cloudflare tem é contador diário + saldo cacheado — mais grosseiro. Segue autoral.
5. **Contrato submit+poll para GPU serverless externo (§5.1).** Sem evidência de que exista no Cloudflare OS. Continua sendo peça sem dono.
6. **Multimodalidade de chat (upload/paste de imagem, gravação de áudio, PDF anexado numa conversa) como produto de primeira classe.** Ausente — porque o produto não é de chat.
7. **Todo o domínio `CONV`/`RAG`(consumer)/`ART`(leve)/`PROMPT`** — a categoria de produto "cliente de chat pessoal multi-modelo com biblioteca de prompts e RAG leve" simplesmente não é o que o Cloudflare OS tenta ser. Isso não é uma lacuna técnica a fechar — é a confirmação de que o projeto ameaçado mira um alvo de produto diferente, o que **enfraquece a urgência de "matar o projeto"**, mas não valida automaticamente construí-lo: a pergunta que fica de pé é se vale a pena construir um cliente de chat pessoal quando ChatGPT/Claude/Gemini já cobrem a maior parte do domínio `MESA`+`DIFF` (971 dos 1.242 itens do `FEATURES.md`, por decisão já registrada no próprio `ARCHITECTURE.md` §8).

**Nota honesta sobre o exercício adversarial**: tentei ativamente encontrar evidência de que o Cloudflare OS fecha as lacunas 1–5. Não encontrei — mas a ausência de evidência num repositório de 10 dias, com "docs incompletas" declaradas no próprio README ("many rough edges"), não é prova definitiva de ausência de feature. Marco isso como risco residual: se a Cloudflare adicionar roteamento por capacidade ou o campo `routing_reason` nas próximas semanas, a lacuna nº 1–2 desta lista fecha rápido, porque a Cloudflare já tem tração, orçamento e motivo (dogfooding interno) para fazer exatamente isso.

### Fontes

- github.com/cloudflare/cloudflare-os — README.md (lido integralmente via API GitHub, 2 chamadas)
- github.com/cloudflare/cloudflare-os — `AGENTS.md` (raw.githubusercontent.com, lido integralmente)
- github.com/cloudflare/cloudflare-os — `docs/ai-gateway-billing.md` (raw.githubusercontent.com, lido integralmente)
- github.com/cloudflare/cloudflare-os — `docs/public-server.md` (raw.githubusercontent.com, lido integralmente)
- github.com/cloudflare/cloudflare-os — `docs/sharing.md` (raw.githubusercontent.com, lido integralmente)
- developers.cloudflare.com/ai-gateway/observability/logging/ — schema de log do AI Gateway (via busca web)
- developers.cloudflare.com/ai-gateway/observability/custom-metadata/ — limite de 5 metadados custom por request
- developers.cloudflare.com/changelog/post/2026-08-05-access-user-id-metadata/ — `cf.user_id` injetado automaticamente (05/08/2026)
- developers.cloudflare.com/workers-ai/models/ — catálogo de modelos (Whisper, EmbeddingGemma-300M, BGE, reranker, Moondream 3) via busca web agregada
- `/Users/francisgoncalves/dev/personal_web_ui/ARCHITECTURE.md` — documento de decisão confrontado
- `/Users/francisgoncalves/dev/personal_web_ui/FEATURES.md` — estrutura de domínios (`CONV`, `MODAL`, `RAG`, `TOOL`, `ART`, `PROMPT`, `ADMIN`, `DEV`, `CLIENT`, `OPS`, `CLOSED`) usada para medir cobertura

Limitação declarada: não consegui full-text-search dentro dos ~908 arquivos do repositório (o leitor de repo GitHub só expõe README + árvore de diretórios; leitura teria exigido clonar ou buscar arquivo por arquivo). Os achados de ausência ("não encontrado") são sobre os arquivos efetivamente lidos (README, AGENTS.md, 3 docs de billing/sharing/public-server) — não uma prova exaustiva sobre as ~900 fontes do monorepo. Marcado onde relevante.

---

# 4. Economia, limites e custo de saída

> Roda fora da Cloudflare? Quanto custa? Onde bate no teto?

Agora escrevo o dossiê completo.

### Roda fora da Cloudflare?

**Veredito: tecnicamente sim, hoje na prática não — sem trabalho de engenharia substancial.**

O próprio README do repositório é direto: *"Being built on Workers does not mean that Cloudflare OS can only run on Cloudflare... `workerd` is itself open source, and Cloudflare OS can run entirely on top of it on your own servers."* Isso é verdade em sentido estrito — `pnpm run-local` roda o stack inteiro em `wrangler`/`workerd` local, sem tocar a nuvem da Cloudflare (dados ficam em `.wrangler/`). Mas a seção "Deploy to your own server using `workerd`" traz literalmente **"COMING SOON"**: não existe hoje tooling/documentação de deploy de produção fora da Cloudflare — só a promessa de "leia o `workerd.capnp` de baixo nível e vire-se" (`packages/gatekeeper-cloudflare/wrangler.jsonc` mostra migração para Durable Object SQLite `UserAccount`, típica de produção real, não de dev local).

Bindings/serviços proprietários da Cloudflare identificados no repo e no README:

| Serviço | Uso declarado | Portável fora da CF? |
|---|---|---|
| **Durable Objects** (SQLite backend) | "Every workspace is its own Durable Object" — modelo de concorrência central | Não — é primitivo proprietário sem equivalente 1:1; `workerd` open-source implementa DO localmente, mas não há serviço DO gerenciado fora da CF |
| **Dynamic Workers / Worker Loader API** | "Every Gadget runs in a Dynamic Worker Facet" — sandbox de execução de código do agente | Não — API nova (anunciada no blog `dynamic-workers`, mar/2026), sem porte conhecido para outro runtime |
| **Facets** | Gatekeepers instalam facets em cada workspace | Não — feature do `workerd`/DO adicionada especificamente para este produto ("Dynamic Workers, Facets, and several other features were added to the runtime specifically to support Cloudflare OS") |
| **Workers KV / D1 / R2** | Não enumerados explicitamente nos trechos lidos, mas o padrão de app CF-native os torna prováveis para storage de blueprints/assets | D1/KV sem equivalente direto; R2 é S3-compatível (portável) |
| **AI Gateway / Workers AI** | Modelo plugável ("You can choose your LLM... self-hosted models"), mas a orquestração via `pi-agent-core` presumivelmente usa AI Gateway para roteamento/observability | Parcial — Workers AI é proprietário; se só usado como *um* provider entre vários, a dependência é opcional |
| **Cap'n Web RPC** | Protocolo de comunicação cliente-servidor de cada Gadget | Portável — é open source (`github.com/cloudflare/capnweb`), roda em qualquer runtime JS |

**Conclusão direta:** o núcleo do produto — isolamento por Durable Object + sandboxing por Dynamic Worker/Facet — usa duas APIs que **não existem fora do runtime `workerd`/rede Cloudflare**, uma delas (Facets) construída *especificamente* para este projeto. "Self-hostable" aqui significa "self-hostable dentro do ecossistema Workers", não "portável para AWS/GCP/bare metal". Migrar para outro provedor exigiria reescrever a camada de isolamento (DO → algo como processos/containers gerenciados por você) e o sandbox de execução de código (Dynamic Worker → V8 isolate custom ou gVisor, que é exatamente o que o `personal_web_ui` já propõe em §5). Isso não é "trabalho de porte", é reescrever a espinha dorsal do projeto.

---

### Números

Fontes: `developers.cloudflare.com/workers/platform/pricing`, `/workers-ai/platform/pricing`, `/ai-gateway/reference/pricing`, `/durable-objects/platform/pricing` (embutido na página de Workers), acesso em 2026-08-15.

| Item | Free | Paid ($5/mês inclui) | Excedente |
|---|---|---|---|
| Workers requests | 100k/dia | 10M/mês | $0,30/milhão |
| Workers CPU time | 10ms/invocação | 30M CPU-ms/mês | $0,02/milhão CPU-ms |
| Durable Objects requests | 100k/dia | 1M/mês | $0,15/milhão |
| Durable Objects duration | 13.000 GB-s/dia | 400.000 GB-s/mês | $12,50/milhão GB-s |
| DO storage (SQLite) rows read | 5M/dia | 25 bilhões/mês | $0,001/milhão |
| DO storage rows written | 100k/dia | 50M/mês | $1,00/milhão |
| DO SQL stored data | 5GB total | 5GB-mês | $0,20/GB-mês |
| Workers AI (Neurons) | 10.000/dia | — | $0,011/1.000 neurons |
| Vectorize dimensões consultadas | 30M/mês | 50M/mês | $0,01/milhão |
| Vectorize dimensões armazenadas | 5M | 10M | $0,05/100M |
| R2 storage | 10GB-mês | — | $0,015/GB-mês (Standard) |
| R2 Class A ops | 1M/mês | — | $4,50/milhão |
| R2 Class B ops | 10M/mês | — | $0,36/milhão |
| R2 egress | grátis | grátis | grátis (sem cobrança) |
| Containers CPU | — | 375 vCPU-min/mês | $0,000020/vCPU-s |
| Containers memória | — | 25 GiB-h/mês | $0,0000025/GiB-s |
| Workflows steps | 3.000/dia | 500.000/mês | $0,80/100.000 |
| Assinatura Workers Paid | — | $5/mês (mínimo) | — |
| AI Gateway core (cache/logs/rate limit) | grátis | grátis | grátis |

Modelo usado para os cálculos abaixo: `@cf/meta/llama-3.3-70b-instruct-fp8-fast` como proxy do "modelo de agente" médio ($0,293/M tokens input, $2,253/M tokens output) — um modelo de porte comparável ao que um agente de code-execution real usaria; e `@cf/openai/gpt-oss-120b` como alternativa mais barata ($0,35/$0,75 por M). Uso `[ESTIMATIVA]` explicitamente.

---

### Fatura estimada

#### Cenário A — 1 usuário, 200 turnos/dia, 3 execuções sandbox + 2 chamadas de modelo por turno

Premissas `[ESTIMATIVA]`:
- 200 turnos/dia × 30 dias = 6.000 turnos/mês
- Cada turno: 1 request de chat (UI→backend) + 3 execuções de código (cada uma = 1 Dynamic Worker + ~1 DO facet request) + 2 chamadas LLM
- CPU por execução de sandbox: ~200ms `[ESTIMATIVA]` (razoável para snippet de code-mode, não é build pesado)
- CPU por request de chat/orquestração: ~50ms `[ESTIMATIVA]`
- Tokens por chamada de modelo: 3.000 input / 800 output `[ESTIMATIVA]` (contexto de agente com histórico)
- Durable Object: cada turno mantém o workspace DO ativo por ~5s de wall-clock (streaming + orquestração) `[ESTIMATIVA]`

Cálculo:

| Item | Volume mensal | Custo |
|---|---|---|
| Workers requests (chat + 3 sandbox execs) | 6.000 × 4 = 24.000 | dentro do free tier de 10M — **$0** |
| Workers CPU time | 6.000 × (50ms + 3×200ms) = 6.000×650ms = 3,9M ms | dentro de 30M incluído — **$0** |
| DO requests | 24.000 (mesma ordem de grandeza) | dentro de 1M incluído — **$0** |
| DO duration | 6.000 turnos × 5s × 128MB(0,125GB) = 3.750 GB-s | dentro de 400.000 GB-s incluído — **$0** |
| DO storage (rows) | trivial para 1 usuário | **$0** |
| Workers AI (se usar modelo CF nativo) | 6.000×2 chamadas × (3.000 in + 800 out) tokens, llama-3.3-70b: input 6.000×2×3.000×$0,293/1M=$10,55; output 6.000×2×800×$2,253/1M=$21,63 | **~$32,18** `[ESTIMATIVA]` |
| Vectorize (se usado p/ RAG) | assume 6.000 buscas × 768 dim + 1.000 docs armazenados | dentro do free tier — **$0** |
| R2 (assets de gadgets) | poucos GB | dentro do free tier — **$0** |
| Containers (se algum sandbox precisar de deps nativas) | uso leve | provavelmente dentro dos 375 vCPU-min/25GiB-h incluídos — **$0** |
| **Assinatura Workers Paid** | — | **$5,00** |
| **Total Cenário A** | | **≈ $37/mês** `[ESTIMATIVA]`, dominado pelo custo de inferência LLM, não pela infra CF |

Se o usuário traz sua própria chave de API externa (Anthropic/OpenAI via AI Gateway como proxy, e não Workers AI), o custo de inferência sai da fatura CF e vai para o provedor de modelo — a fatura CF cai para **~$5–8/mês** (dentro do Paid, talvez com pequeno excedente de CPU se as execuções de sandbox forem mais pesadas do que a estimativa).

#### Cenário B — 50 usuários, 20 turnos/dia cada = 1.000 turnos/dia = 30.000 turnos/mês

Escala linear os mesmos parâmetros × 5 (30.000/6.000):

| Item | Volume mensal | Custo |
|---|---|---|
| Workers requests | 120.000 | dentro do free tier incluído — **$0** |
| Workers CPU time | 19,5M ms | dentro de 30M — **$0** |
| DO requests | 120.000 | dentro de 1M — **$0** |
| DO duration | 18.750 GB-s | dentro de 400.000 — **$0** |
| Workers AI (llama-3.3-70b) | 5× o cenário A | **~$160,90** `[ESTIMATIVA]` |
| Vectorize | 5× volume, ainda pequeno | provavelmente dentro do incluído ou poucos centavos — **~$0–1** |
| R2 | dezenas de GB, 50 usuários | **~$1–3** `[ESTIMATIVA]` |
| Containers | uso moderado, 50 usuários concorrentes podem estourar os 375 vCPU-min | possível excedente pequeno, **$1–5** `[ESTIMATIVA]` |
| **Assinatura Workers Paid** | | **$5,00** |
| **Total Cenário B** | | **≈ $170–175/mês** `[ESTIMATIVA]`, novamente dominado por inferência LLM |

**Conclusão dos dois cenários:** a infraestrutura Cloudflare propriamente dita (Workers, DO, R2, Vectorize) é **essencially gratuita** nesses dois volumes — fica quase toda dentro do Workers Paid de $5. O item que realmente custa é **inferência de modelo**, e isso é verdade independente de rodar em Workers AI, AI Gateway com provider externo, ou fora da Cloudflare — é o custo do LLM, não um custo específico da plataforma. Isso enfraquece a narrativa de "vendor lock-in caro": o preço de infraestrutura CF é irrelevante nesta escala pessoal/pequena.

---

### O free tier e o Workers Paid de $5

Cenário A **cabe folgado** no Workers Paid ($5/mês) para a parte de infraestrutura CF — CPU, requests, DO duration ficam todos abaixo de 15% dos limites incluídos, mesmo com margem de erro grande nas estimativas de CPU por execução sandbox. Onde estoura primeiro, se estourar: **Workers AI Neurons**, porque o free tier de 10.000 Neurons/dia é consumido em minutos com um modelo de 70B — uma única chamada de ~3.800 tokens totais consome ordem de 15-20k Neurons (excedendo o free diário isoladamente). Isso empurra qualquer uso real de LLM nativo para o billing pago do Workers AI, não porque a infra Cloudflare é cara, mas porque LLM é caro em qualquer lugar.

**Não caberia no free tier puro** (sem Workers Paid) pois Vectorize e o backend de DO SQLite em produção seriam limitados; mas o Paid de $5 cobre a infraestrutura de sobra até escala de dezenas de usuários.

---

### Limites duros

Fonte: `developers.cloudflare.com/workers/platform/limits`, seções CPU time / Memory / Duration / Subrequests / Worker size, mais busca sobre Worker Loader.

| Limite | Valor (Free / Paid) | O desenho do ARCHITECTURE.md bate no teto? |
|---|---|---|
| CPU time por HTTP request | 10ms / 5min (default 30s, configurável) | **Não bate** — §5 propõe V8 isolate para orquestração; 30s default já é folgado para chamadas de LLM (que são I/O-bound, não CPU-bound: streaming de tokens não conta como CPU time) |
| Duração de request (wall-clock) | sem limite (HTTP) | **Não bate** — favorável ao streaming longo do §3 |
| Subrequests por invocação | 50 / 10.000 | **Não bate** para uso normal, mas §3 (code execution com API tipada gerada) pode gerar muitas subrequests em loops de ferramentas — 10.000 é folga real |
| Tamanho de bundle Worker | 3MB / 10MB (comprimido) | **Risco real** — stub tipado gerado dinamicamente (§3, "exposição lazy é requisito") pode inflar bundle se não for realmente lazy; é exatamente a razão pela qual o ARCHITECTURE.md já exige lazy exposure — o teto de 10MB *valida* essa decisão de design, não a invalida |
| Memória por isolate | 128MB (igual Free/Paid) | **Bate potencialmente** — é o teto mais apertado do sistema. Um V8 isolate rodando orquestração + parsing de schema tipado grande pode chegar perto disso; §5 (V8 isolate para orquestração, container p/ capacidade nativa) é exatamente a mitigação correta — CF já separa por esse motivo |
| Storage por Durable Object (SQLite) | 5GB total (Free) / ilimitado com $0,20/GB-mês (Paid) | **Não bate** para uso pessoal/pequeno, mas cresce linear com histórico — sem compactação, um workspace ativo por anos pode aproximar-se do teto |
| Tamanho de valor em KV | não coberto nos trechos lidos — [não confirmado, mas historicamente 25MB por valor] | não avaliável sem confirmação |
| Tamanho de banco D1 | não coberto nos trechos lidos — [não confirmado; D1 documenta 10GB por database historicamente] | não avaliável sem confirmação |
| Worker Loader API — nº de Workers dinâmicos | **Sem limite documentado** — busca confirma "Dynamic Worker Loader has no such limits... it is simply an API to the same technology that has powered our platform" (blog.cloudflare.com/dynamic-workers) | **Não bate** — é o ponto de design mais favorável ao Cloudflare OS: bypassa o teto de 100/500 Workers por conta que afetaria um desenho com 1 Worker por Gadget/tool |
| Startup time do Worker | 1 segundo | **Risco moderado** — se o §3 gera e carrega stub tipado grande dinamicamente a cada invocação de Dynamic Worker, cold start pode aproximar-se do teto; não confirmável sem medir |

Conclusão desta seção: os limites duros do Workers/DO **não invalidam** o desenho do `personal_web_ui`; eles, na verdade, **corroboram** decisões específicas do ARCHITECTURE.md (lazy schema exposure por causa do teto de bundle; separação V8-isolate/container por causa do teto de 128MB de memória por isolate). Isso é evidência de que a filosofia de design do projeto está alinhada com a mesma física de restrições que levou a Cloudflare a construir Dynamic Workers/Facets — o que é esperado, já que ambos endereçam o mesmo problema.

---

### Custo de saída

**Portável (código TypeScript padrão):**
- Lógica de negócio das Gatekeepers/gadgets em si — funções, handlers, tipos — é TS comum, roda em qualquer runtime JS/Node/Bun/Deno com pequenas adaptações de API.
- Cap'n Web RPC é open source e runtime-agnóstico.
- R2 é S3-compatível: migração para S3/MinIO/Backblaze é troca de endpoint + credenciais, sem reescrita de lógica; **egress zero é vantagem só enquanto você fica**, mas dados saem sem taxa de saída (R2 não cobra egress) — ponto realmente forte a favor da CF para quem quer *sair* com os dados, não trancado.
- Lógica de agente via `pi-agent-core` (abstração multi-provider) é desacoplada de LLM específico.

**Reescrita obrigatória (não portável 1:1):**
- **Durable Objects como modelo de concorrência**: cada workspace = 1 DO. Fora da CF isso vira reimplementar um modelo de ator com estado persistente e concorrência serializada por chave (ex: Temporal, Actor model em Akka/Orleans, ou um serviço próprio sobre Postgres+locks). Não é troca de biblioteca, é redesenho de camada de estado.
- **Dynamic Workers / Facets**: sandbox de execução de código do agente. Fora da CF, precisa virar V8 isolate custom (isolated-vm) ou container+gVisor — que é, coincidentemente, exatamente o que o §5 do ARCHITECTURE.md já planeja construir. Ou seja: o custo de saída do Cloudflare OS é reescrever a parte que o `personal_web_ui` já pretendia escrever de qualquer forma.
- **Vectorize** como índice: API proprietária; migração para pgvector/Qdrant/Weaviate exige reindexar tudo e reescrever queries — não há camada de compatibilidade de terceiros confirmada. Não confirmado se existe adapter open-source para Vectorize→padrão comum; nenhuma busca dedicada foi feita aqui, mas nenhuma menção surgiu nas fontes lidas.
- **D1/KV**: schema SQL do D1 é SQLite padrão (portável para SQLite local), mas a API de binding e o comportamento de replicação são proprietários.
- **Workers AI**: troca de provider é trivial *se* a app já for multi-provider (como o `pi-agent-core` sugere ser); não é lock-in real.

**Camada de compatibilidade de terceiros:** nenhuma confirmada nas fontes lidas para DO, Dynamic Workers ou Vectorize — `[não confirmado]`.

**Síntese:** o custo de saída de "construir sobre Cloudflare OS" concentra-se exatamente nos dois pontos que o `personal_web_ui` já havia identificado como decisões arquiteturais centrais e não-triviais (substrato de execução dual, roteamento e billing). Sair da Cloudflare não é portar um app — é reconstruir a metade mais difícil do sistema, a mesma metade que o `personal_web_ui` propõe construir do zero de qualquer forma. Isso reduz o argumento de "lock-in é grátis porque nunca vamos sair" e reforça que **a decisão de adotar Cloudflare OS é uma aposta em nunca precisar sair**, não uma opção reversível.

---

### Confiabilidade

Post-mortems confirmados em `blog.cloudflare.com`:
- **18 nov 2025** — outage causado por bug na geração de um "feature file" do Bot Management (mudança de permissões em sistema de banco causou duplicação de entradas, arquivo dobrou de tamanho, propagou para toda a rede) — derrubou X, ChatGPT e outros clientes de alto perfil. Sem ataque malicioso envolvido. (`blog.cloudflare.com/18-november-2025-outage/`)
- **5 dez 2025** — outage de ~25 minutos (08:47–09:12 UTC), ~28% do tráfego HTTP afetado, causado por mudança de configuração aplicada para mitigar vulnerabilidade de React Server Components na indústria.
- **20 fev 2026** — outage em clientes BYOIP (Bring Your Own IP): rotas retiradas via BGP.
- Resposta institucional: **"Code Orange: Fail Small"** (`blog.cloudflare.com/fail-small-resilience-plan/`, 19 dez 2025) — plano de resiliência declarado publicamente após a sequência de incidentes.

**SLA publicado:**
- SLA de Workers com garantia de 99,99% de Monthly Uptime Percentage é **exclusivo do plano Enterprise** (`cloudflare.com/workers-service-level-agreement`). Créditos: 10x multiplicador padrão, até 25x no "Premium Success Offering".
- Plano Business tem SLA próprio e mais restrito (`cloudflare.com/business-sla`).
- **Free e Workers Paid ($5/mês) não têm SLA contratual** — sem garantia de uptime, sem créditos por downtime. Isso é relevante direto para os Cenários A e B deste dossiê: ambos rodam no Paid, não no Enterprise.

**O que acontece com um produto pessoal quando a Cloudflare cai:** dado que Cenário A/B ficam no Workers Paid (sem SLA), o usuário não tem remédio contratual — apenas o histórico observado de disponibilidade (que inclui pelo menos 3 incidentes de escala global em ~10 meses, um deles afetando ~28% do tráfego HTTP global por 25min, outro derrubando serviços de alto perfil por período mais longo). Para um app pessoal single-tenant, isso significa: indisponibilidade total do assistente durante o outage, sem fallback local possível (dado que DO/Dynamic Workers não existem fora da CF, per a seção "Roda fora da Cloudflare?"). Isto é diferente de um app self-hosted local, que continuaria funcionando independente de qualquer outage de terceiro. Não há alarmismo necessário — os outages são registrados e publicamente auditados, o que é positivo comparado a provedores que escondem incidentes — mas a ausência de SLA no plano relevante (Paid) é um fato, não uma opinião.

---

### Fontes

- `github.com/cloudflare/cloudflare-os` (README.md, `packages/gatekeeper-cloudflare/wrangler.jsonc`) — acesso 2026-08-15
- `developers.cloudflare.com/workers/platform/pricing/` (última atualização 7 jul 2026)
- `developers.cloudflare.com/workers/platform/limits/` (última atualização 28 jul 2026)
- `developers.cloudflare.com/workers-ai/platform/pricing/` (última atualização 14 ago 2026)
- `developers.cloudflare.com/ai-gateway/reference/pricing/` (última atualização 19 mai 2026)
- `blog.cloudflare.com/dynamic-workers/` — confirma ausência de limite de nº de Dynamic Workers
- `blog.cloudflare.com/18-november-2025-outage/`
- `blog.cloudflare.com/fail-small-resilience-plan/` (19 dez 2025)
- Post-mortem de 5 dez 2025 e 20 fev 2026 — via `blog.cloudflare.com/tag/outage/` (conteúdo consolidado por busca; não lido diretamente página a página)
- `cloudflare.com/workers-service-level-agreement` — SLA Enterprise 99,99%, créditos 10x/25x

---

# 5. A categoria "Agent OS" em ago/2026

> Quem mais vende isso, o padrão Agent Plugins, e o veredito de categoria.

Tenho evidência suficiente. Vou escrever o dossiê completo agora.

### O mapa

Critério de leitura da tabela: "primitivo de extensão" conta *mecanismos distintos*, não features. "Exposição lazy" = schema tipado só carrega quando o modelo importa, não front-loaded. Datas são as mais recentes que encontrei com fonte — "não confirmado" onde não achei changelog datado.

| Produto | O que é | Licença | Self-host? | Sandbox de código? | Extensão própria | Fala MCP? | Roteamento multi-provedor? | Status | Última release |
|---|---|---|---|---|---|---|---|---|---|
| **Cloudflare OS** | Workspace de agentes + runtime de apps ("gadgets") sobre Workers | Apache 2.0 (repo `cloudflare/cloudflare-os`) | Sim — roda sobre `workerd` (OSS) fora da nuvem Cloudflare | Sim, por padrão — Dynamic Worker Facet por Gadget, sem acesso à internet salvo binding explícito | **2 mecanismos**: Gadget (app com API Cap'n Web) e Gatekeeper ("MCP server turbinado" — wrapper de serviço externo com auth, log, aprovação assíncrona). Não trata *modelo especialista* como o mesmo primitivo — escolha de LLM é seleção manual de provedor, não roteamento por capacidade | Sim — Gatekeeper explicitamente descrito como substituto/superset de MCP; agente usa Code Mode para invocar | Não no sentido do ARCHITECTURE.md §4 (sem `requires={modality,class}` nem `routing_reason` estruturado) — só escolha de provedor pelo usuário, via AI Gateway | Early access ("v2, ainda com arestas") | 2026-08 (lançamento OSS) |
| **OpenAI** | AgentKit (Agent Builder visual + ChatKit + Agents SDK) | Agents SDK MIT-like (`openai-agents-python`, OSS); Agent Builder é SaaS fechado | Parcial — SDK sim, Agent Builder não (e está sendo descontinuado a partir de 30/11/2026) | Não nativo — depende de sandbox externo (Code Interpreter roda em infra da OpenAI, fechada) | 1 mecanismo de código (Agent + tools via function-calling clássico), sem manifest declarativo unificado tipo capability/skill/provider | Sim, cliente MCP suportado no Agent Builder/SDK | Parcial — roteamento nativo entre modelos GPT desde meados 2025, sem cross-provider | GA (SDK); Agent Builder em sunset | Abr/2026 (Agents SDK "next evolution") |
| **Anthropic** | Claude Agent SDK + Skills + MCP + Claude Code | SDK OSS (licença permissiva); Claude Code é produto fechado que expõe camadas (hooks/skills/subagents/plugins/MCP) | SDK sim, roda local; Claude Code CLI não é "servidor" auto-hospedável no sentido de plataforma multiusuário | Não vem com sandbox de execução própria embutida — code-execution-with-mcp é padrão de arquitetura, a sandbox é escolha do integrador (isolate/container externo) | **5+ mecanismos distintos** ainda separados: hooks, skills, subagents, plugins, MCP — não colapsados num só primitivo com campo de ativação | Sim — origem do MCP; publicou code-execution-with-mcp (nov/2025) rebaixando MCP a transporte | Não — single-vendor (modelos Claude); não roteia para outros provedores | GA | Ago/2026 (Claude Code updates contínuos) |
| **Google** | Gemini Enterprise Agent Platform (ex-Vertex AI + Agentspace) + ADK + A2A | ADK OSS (Apache 2.0, `google/adk`); Agent Platform runtime é SaaS gerenciado fechado | ADK sim (framework); plataforma de runtime gerenciado não | Sim — Agent Platform Runtime hospeda agentes com endpoints seguros, mas é gerenciado, não "seu" sandbox | ADK dá "agent meshes" — múltiplos padrões de composição, não um primitivo único declarativo | Sim, A2A + suporte MCP no ADK | Sim, parcial — Agent Platform roteia entre modelos Gemini/terceiros dentro do runtime gerenciado | GA (ADK v1.0 4 linguagens; Agent Platform GA) | Jun/2026 (ADK cross-language) |
| **Microsoft** | Copilot Studio (low-code) + Agent Framework (SDK OSS) + Foundry (PaaS) | Agent Framework OSS; Copilot Studio e Foundry Agent Service são SaaS Azure fechado | Parcial — só o SDK; Foundry/Copilot Studio são serviço gerenciado Azure | Sim, dentro do Foundry Agent Service (containers geridos, endpoint dedicado) — não self-host | Toolboxes + Skills (adicionado Build 2026) + plugins Power Platform — múltiplos mecanismos por camada (Copilot Studio ≠ Foundry ≠ Agent Framework) | Sim | Sim, dentro do Foundry (múltiplos modelos, não necessariamente cross-cloud) | GA (com features em preview contínuo) | Jul/2026 (Build 2026 Agent Service) |
| **AWS** | Bedrock AgentCore | Proprietário (serviço AWS gerenciado); alguns SDKs clientes OSS | Não — é serviço gerenciado AWS | Sim — microVM Firecracker dedicada por sessão, GA, preço publicado (`$0,0895`/vCPU-h) | Runtime + Memory + Identity + Gateway como serviços separados, sem um manifest único de "extensão" | Sim (Gateway expõe MCP) | Parcial via Gateway | GA | 2025–2026 (conforme dossiê anterior) |
| **Vercel** | AI SDK 6 (lib) + AI Elements (UI) + Workflow + Sandbox | AI SDK OSS (Apache 2.0/MIT), AI Elements OSS; Workflow/Sandbox são produto Vercel Cloud | SDK/Elements sim; Workflow/Sandbox rodam na nuvem Vercel (Sandbox tem modo Docker mas atrelado à plataforma) | Sim — Sandbox GA (ago beta→GA 2026), execução de código não confiável, storage persistente | Não tem manifest declarativo de extensão — é biblioteca de composição de código (tool-calling padrão do AI SDK) | Sim, integração MCP no AI SDK | Sim — unified provider API (troca de modelo por string), sem roteamento automático por capacidade | GA (Sandbox); SDK 6 estável | 2026 (Sandbox GA, Workflow novo) |
| **Deno** | Deploy + Subhosting (plataforma de hosting multi-tenant de código de terceiros) | Deno runtime OSS (MIT); Deploy/Subhosting são serviço comercial | Não — SaaS; migração de API v1→v2 em curso (v1 desligado 20/07/2026) | Sim — é o produto central (isolar código não confiável de clientes SaaS) | Não tem conceito de "extensão de agente" — é infraestrutura genérica de hosting, sem noção de tool/skill/model | Não nativamente — não é um produto voltado a LLM | Não aplicável | GA | Jul/2026 (v2 migration) |
| **E2B** | Sandbox de execução (microVM Firecracker) como serviço | SDK cliente OSS; infraestrutura é SaaS | Não — SaaS (self-host não documentado publicamente) | Sim — é o produto inteiro; 1B+ sandboxes iniciados, boot <500ms | Não tem — é infraestrutura pura, sem primitivo de extensão de agente | Não nativamente | Não aplicável | GA | Jun/2026 (métricas reportadas) |
| **Modal** | Plataforma serverless de compute (inclui sandboxes gVisor) | SDK cliente OSS; infraestrutura SaaS | Não — SaaS | Sim — sandboxes gVisor, até 100k+ concorrentes | Não — infraestrutura de compute genérica (decorators Python), sem conceito de tool/skill de LLM | Não nativamente | Não aplicável | GA | 2026 (contínuo) |
| **LangChain / LangGraph** | Framework de orquestração + LangSmith Deployment (ex-LangGraph Platform, GA) | LangChain/LangGraph OSS (MIT); LangSmith Deployment é SaaS gerenciado | Framework sim; Deployment gerenciado não (self-host enterprise existe mas não documentado como padrão) | Não nativo — depende de integração externa (E2B, Modal, etc. via tool) | Middleware composável (hooks) — não manifest declarativo, é código Python/TS | Sim, integração MCP | Sim, 1000+ integrações de provedor, roteamento manual via config | GA (LangSmith Deployment, abr/2026) | Ago/2026 (releases contínuos) |
| **Dify** | Plataforma de app-building/workflow com marketplace de plugin | Community Edition OSS (licença própria, não OSI-padrão puro — "Dify Open Source License", restrição de revenda como SaaS competidor); Cloud é SaaS fechado | Sim (Community Edition, self-host) | Sim — runtime de plugin isolado | **6 tipos de plugin unificados** desde v1.0.0 (fev/2025): Model, Tool, Agent Strategy, Extension, Datasource/Trigger, Bundle — sob um só manifest+marketplace | Sim, cliente E servidor MCP (bidirecional) desde 2026 | Sim, catálogo de provedores de modelo plugável | GA | 2026 (MCP bidirecional, contínuo) |
| **n8n** | Automação/workflow com nós de agente IA | Fair-code (Sustainable Use License — **não OSI-approved**, restringe revenda hospedada) | Sim, self-host | Não nativo — execução de código roda dentro dos nós, sem isolamento forte documentado como padrão | Modelo de nó (400+ conectores) — não manifest de "capability" unificado; nó de IA é só mais um tipo de nó | Sim, suporte MCP desde n8n 2.0 | Sim, por config de credencial por nó | GA | 2026 (n8n 2.0) |
| **Val Town** | Plataforma de "vals" (funções serverless via chat, com agente Townie) | Plataforma fechada (vals individuais podem ser públicos); não é OSS de infraestrutura | Não — SaaS | Sim — cada val roda isolado | Suporta convenção AGENTS.md via ".config val"; MCP server/client | Sim | Não é o foco (é IDE de função, não gateway) | GA | 06/08/2026 (changelog) |
| **AAIF (Agentic AI Foundation)** | Fundação de governança sob Linux Foundation — não é produto, é guarda-chuva de padrões (MCP, A2A, doado dez/2025) | N/A — governança, não software | N/A | N/A | N/A — hospeda especificações, não runtime | É o lar do MCP | N/A | Ativa | Contínuo desde dez/2025 |

**Leitura da tabela:** nenhum concorrente listado combina as três propriedades do ARCHITECTURE.md §2 (um só primitivo com campo `activation`), §3 (code execution com exposição lazy do stub tipado) e §5 (sandbox obrigatório por padrão) **ao mesmo tempo**, exceto Cloudflare OS — que chega perto mas com **2 mecanismos** (Gadget/Gatekeeper), não 1, e sem tratar modelo especialista como o mesmo objeto.

Continuando o dossiê — seção "O mapa" já entregue acima. Seguem as demais seções.

### Agent Plugins 1.0.0

**Existe, confirmado, li a spec primária** (`github.com/agentplugins/agent-plugins-spec`, `spec/1.0.0.md`, status "Published", publicado 2026-08-06).

**Quem está dentro:** Technical Steering Committee inicial = Core Maintainers de **AWS, Cursor (Anysphere), Microsoft, OpenAI, Vercel** (Vercel iniciou a proposta). **Google** entrou como Core Maintainer no mesmo dia do anúncio (representada por Kevin Hou), com adoção day-one em dois produtos (Agents CLI, Data Agent Kit). **GitHub Copilot** (VS Code, Copilot CLI, Copilot app) já suporta desde 12/08/2026. Governança: nenhum vendor pode deter maioria de assentos; cadeiras são de indivíduos, não empresas.

**O que a spec REALMENTE unifica — só empacotamento, não execução, confirmado lendo o texto normativo:**

- Um plugin é um diretório com `plugin.json` (manifest fechado: só `$schema`, `name`, `version`, `description`, `author`, `homepage`, `repository`, `license`, `keywords`, `extensions`).
- Define exatamente **2 tipos de componente**: Skills (`skills/*/SKILL.md`, delegando ao Agent Skills spec externo) e MCP servers (`mcp.json`, delegando ao protocolo MCP externo). "Outros tipos de componente — comandos, hooks, agentes, regras, servidores LSP — permanecem fora do formato v1 até que seus formatos convirjam" (texto literal da spec, §7).
- **v1.0.0 explicitamente não define:** modelo de permissão, sandboxing, verificação de assinatura, mecanismo de segredos — tudo listado como trabalho futuro (confirmado por três fontes independentes: eesel.ai, AWS blog, spec §11 sobre client conformance mínima).
- Contenção de path (§4.1) é só anti-directory-traversal dentro do pacote — não é sandbox de execução do processo do agente.

**Resposta direta à pergunta do assignment:** o padrão empacota Skills+MCP num diretório portável com manifest comum. Ele **não toca em execução** — não define quem chama o quê, quando, com que schema exposto ao modelo, nem come nada do espaço de "modelo especialista como capability" ou "roteamento por metadado". É estritamente um `.zip` com regras de layout e um manifest — mais próximo de "todo mundo concorda no formato do arquivo tar.gz" do que de "todo mundo concorda em como o runtime invoca". Fora isso, ainda existem tantos runtimes de execução quanto clientes (ChatGPT, Codex, Cursor, Copilot, Kiro, VS Code cada um com seu próprio agent loop).

**Cloudflare aderiu?** Não encontrei evidência de que a Cloudflare (nem `cloudflare-os` nem `cloudflare/agents`) seja Core Maintainer, adotante-dia-1, ou tenha anunciado suporte ao Agent Plugins 1.0.0. Busquei diretamente ("Cloudflare Agent Plugins 1.0.0") e não apareceu em nenhuma das fontes primárias (Vercel blog, AWS blog, Google blog, GitHub changelog) nem nos resultados de pesquisa geral — apenas material genérico do marketplace de plugins Claude/Cloudflare, sem relação com este padrão. **Não confirmado que a Cloudflare aderiu**; tratando como ausência até prova em contrário, dado que a lista de "launch clients" é fechada e explícita (ChatGPT, Codex, Cursor, GitHub Copilot, Kiro, VS Code) e não a inclui.

**Avaliação honesta do risco para o §2 do ARCHITECTURE.md:** o risco é **real mas parcial**, e a distinção importa muito para a tese.

- Se "Agent Plugins" pegasse tratando execução, o §2 inteiro (activation, `[promises]`, colapso dos 6 mecanismos do Open WebUI num só primitivo) seria reimplementação atrasada de um padrão que 6 fornecedores já ratificaram — e nesse cenário construir isso do zero seria claramente (b), não (a).
- Mas a spec, por design, se recusa a normalizar execução — ela até nomeia explicitamente "hooks", "agents", "commands" como formatos "ainda não convergidos" e deixa de fora. Isso é o oposto de fechar o buraco identificado no RESEARCH.md: "ninguém trata tool MCP, skill de prompt e modelo especialista como o MESMO primitivo executável, com exposição de schema lazy e sandbox obrigatório por padrão". Agent Plugins 1.0 não resolve isso — ele padroniza a *caixa* que carrega Skills e MCP configs, deixando intocado o *como o modelo invoca* e *quando o schema entra em contexto*, que são exatamente os dois pontos autorais do §2/§3.
- **Mas há um risco real de outra natureza**: se a v2/v3 do Agent Plugins (que a própria spec já sinaliza como território de convergência futura — "hooks, agents, rules... até que formatos convirjam") absorver execução, ela absorveria primeiro do lado de *empacotamento cross-client*, não do lado de *ativação unificada dentro de um runtime único* como o §2 propõe. São problemas adjacentes, não idênticos: Agent Plugins resolve "um plugin roda em 6 clientes diferentes"; o §2 resolve "dentro de UM runtime, 6 mecanismos viram 1". Mesmo numa v2.0 mais ambiciosa, о §2 continuaria sendo uma decisão de arquitetura interna de runtime, não uma escolha de formato de distribuição — são camadas diferentes do stack, coexistentes, não substitutas.

Conclusão desta seção: **o risco de virar "reimplementação de padrão de indústria" é baixo hoje e moderado no horizonte de 12-18 meses** apenas se a convergência de "hooks/agents/rules" citada como trabalho futuro vier a normalizar semântica de ativação — o que a spec atual explicitamente recusa fazer.

### Code execution virou consenso?

Quem publica a técnica além de Anthropic (code-execution-with-mcp, nov/2025) e Cloudflare (Code Mode): **Cloudflare OS confirma o padrão internamente** — o README diz que o agente "performs tasks by writing and immediately executing snippets of code" e que "The AI Agent harness uses Code Mode for tool calling". O concorrente que ameaça o projeto já usa exatamente essa técnica como mecanismo real de invocação.

Não encontrei OpenAI, Google, Microsoft ou AWS declarando code-execution como modo PRIMÁRIO de invocação — todos mantêm function-calling clássico como via padrão, com sandbox de execução (Code Interpreter, Foundry Agent Service, Bedrock AgentCore) como *uma* tool entre outras, não substituto do tool-calling. Vercel Sandbox (GA 2026) é infraestrutura consumida como ferramenta, não substrato de invocação do AI SDK.

**Veredito: minoria qualificada, não consenso amplo.** Dois players tecnicamente influentes (Anthropic, Cloudflare) adotaram com números publicados; a maioria enterprise não trocou o modo primário. Um paper (arXiv 2602.15945, fev/2026) trata o tema como corrente de pesquisa ativa, não decidida.

**Alguém contradisse o número?** Não achei paper/post medindo e refutando diretamente a redução de token. A crítica existente é de custo estrutural diferente (segurança/nondeterminismo), não do número.

### Críticas sérias à abordagem

1. **Segurança — MCP STDIO é RCE por design, admitido pela própria Anthropic.** Falha divulgada por OX Security (abr/2026): STDIO executa comandos de SO sem sanitização, ~200 mil instâncias vulneráveis numa cadeia de 150M+ downloads. A Anthropic confirmou que é comportamento intencional e **recusou alterar a arquitetura**, deixando mitigação para o downstream. (labs.cloudsecurityalliance.org, csa-research-note-mcp-security-crisis-20260504)
2. **Nondeterminismo como vetor de injeção.** arXiv 2602.15945 (fev/2026, "From Tool Orchestration to Code Execution: A Study of MCP Design Choices") mostra que agentes CE-MCP realimentam mensagens de exceção no contexto de replanejamento — metadado/nome de arquivo controlado por atacante corrompe a próxima geração de código. Uma consulta benigna pode sofrer inversão semântica silenciosa sem disparar defesa da camada de execução.
3. **Debugabilidade — cliente MCP vira "conduíte cego".** A fronteira entre "o que o usuário pediu" e "o que dado malicioso instruiu" colapsa, sem rastro sintático de erro.
4. **Superfície multi-camada sem controle único.** "State of MCP Security 2026" (PipeLab, abr/2026): ataques atingem registro de pacote, descrição de tool, resposta de tool, argumento de tool, config MCP e biblioteca cliente — nenhum controle único cobre todos.

**Avaliação:** a crítica não invalida o ganho de token, mas mostra que ele vem acoplado a superfície de ataque maior e mais difícil de auditar. Valida a decisão do §2.3 de tratar validação pré-execução como núcleo — e prova que "fazer code execution direito" é trabalho de segurança que nem a Anthropic resolveu na própria superfície.

### Veredito de categoria

**(c) — aposta contrária defensável, e só nesse ponto específico.**

Não é (a): "Agent OS" é categoria ativa e concorrida — Cloudflare OS (Apache 2.0, self-host real via workerd), Google Gemini Enterprise, Microsoft Foundry, Dify (6 tipos de plugin unificados desde fev/2025), e o consórcio Agent Plugins mostram que não há vácuo.

Não é (b) completo: nenhum concorrente do mapa — incluindo o mais próximo, Cloudflare OS — combina as 3 propriedades do §2/§3/§5 simultaneamente. Cloudflare OS usa 2 mecanismos (Gadget + Gatekeeper), não 1; a própria tabela do README trata agentes como categoria não resolvida (`??? → agents`); roteamento de modelo é escolha manual, sem `requires={modality,class}` nem `routing_reason`. Agent Plugins 1.0.0 resolve empacotamento cross-cliente e explicitamente recusa tocar execução — os 6 fornecedores concordaram em NÃO entrar no espaço autoral do projeto.

É (c) porque a indústria em peso resolve "portabilidade entre clientes" (Agent Plugins) e "workspace corporativo com governança" (Cloudflare OS, Foundry) — problemas de distribuição/administração — enquanto o ARCHITECTURE.md aposta no oposto: unificação do primitivo de execução dentro de UM runtime. É defensável porque a recusa dos 6 vendors é estrutural (nenhum cede controle do próprio agent loop a um padrão multi-vendor), não circunstancial.

**Ressalva sem diplomacia:** o escopo autoral encolheu desde o RESEARCH.md. Cloudflare OS já cobre code-execution-como-invocação (§3) e sandbox-por-padrão (§5) no mesmo runtime, Apache 2.0, self-hostável. O que sobra estritamente autoral: (1) 1 campo `activation` em vez de 2 objetos; (2) modelo especialista como o mesmo objeto que tool/skill — ninguém faz isso; (3) campos estruturados de roteamento auditável — ninguém expõe isso. É fatia real, não oceano — e o produto final vai parecer, de fora, uma "Cloudflare OS pessoal com um campo a menos".

---

