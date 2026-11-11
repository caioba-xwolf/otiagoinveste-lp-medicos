# Nova LP — O Tiago Investe · Consultoria de investimentos para médicos (Café Digital)

Pasta: `nova-lp/`. É uma página estática, sem framework e sem build. Para publicar, suba o conteúdo da pasta para a raiz do domínio.

```
nova-lp/
├── index.html              ← landing page
├── obrigado/index.html     ← confirmação pós-envio (único lugar onde o Lead dispara)
├── privacidade/index.html  ← Aviso de Privacidade (RASCUNHO, precisa de dados reais)
└── lp/
    ├── tracking.js         ← CONFIGURAÇÃO CENTRAL + Meta Pixel / GA4 / GTM + UTMs + modo prévia
    ├── app.js              ← formulário, eventos, CTA fixo, animações
    ├── simulador.js        ← simulador de investimentos + carteira ilustrativa (sem dependências)
    ├── styles.css
    ├── fonts/manrope-latin.woff2
    └── img/ (fotos reais do Tiago, reaproveitadas do site atual)
```

---

## Versão 6 — Café Digital (atual)

**Oferta de entrada:** Café Digital com Tiago Lopes, uma conversa individual e gratuita. Todos os CTAs principais levam ao formulário de solicitação (`#agendar`).

### Estrutura final
| # | Seção (id) | Headline | Função |
|---|---|---|---|
| 1 | Hero (`inicio`) | Você dedicou anos para cuidar de outras pessoas. E quem está cuidando dos seus investimentos? | Identificação + convite |
| 2 | Carreira e futuro (`futuro`) | Sua carreira foi construída com dedicação. Sua liberdade financeira também precisa de planejamento. | Conexão emocional |
| 3 | Problema (`problema`) | Ganhar bem não é a mesma coisa que investir bem. | Consciência |
| 4 | Simulador (`simulador`) | Quanto seus investimentos podem representar no futuro? (+ recado do Tiago e CTA) | Visualização |
| 5 | Não está sozinho (`sozinho`) | Você já tem uma profissão. Não precisa assumir outra para cuidar dos seus investimentos. | Diferenciação |
| 6 | Método (`metodo`) | Um plano para seus investimentos, construído a partir da sua realidade. | Mecanismo |
| 7 | Carteira (`carteira`) | Uma carteira de investimentos não deve ser uma coleção de aplicações sem direção. | Demonstração |
| 8 | Acompanhamento (`acompanhamento`) | Como eu ajudo você a organizar seus investimentos. (+ comparativo Café × Consultoria) | Clareza da entrega |
| 9 | Quem sou eu (`tiago`) | Prazer, eu sou Tiago Lopes. | Autoridade |
| 10 | Café Digital (`cafe-digital`) | Vamos tomar um Café Digital e conversar sobre seus investimentos? | Oferta |
| 11 | Formulário (`agendar`) | Vamos conversar sobre seus investimentos? | Conversão |
| 12 | FAQ (`duvidas`) | Antes do nosso Café Digital | Objeções |
| 13 | CTA final | Médico(a), você já dedica boa parte do seu tempo à medicina… | Conversão |

### Copy
- Narrativa em **primeira pessoa** (o Tiago falando com o médico). A terceira pessoa ficou só nas credenciais, nos avisos legais e no rodapé.
- **"Médico(a)"** aparece só no CTA final. O hero identifica o público pelo eyebrow ("consultoria de investimentos para médicos") e pelas situações da rotina (plantões, consultório, pacientes).
- Diferença explícita entre **Café Digital** (conversa inicial gratuita, diagnóstico e direcionamento) e **Consultoria** (acompanhamento contratado por cerca de 12 meses), na seção 8, na seção 10 e no FAQ.
- A página de obrigado diz "Recebi suas informações. Agora vamos organizar os próximos passos para o nosso Café Digital" e deixa claro que ele **ainda não está agendado** (o contato é feito pelo WhatsApp).
- Escopo: "Aqui o assunto é um só: investimentos. Não trabalho com holding, planejamento tributário, sucessório ou imobiliário."

### Formulário
Campos: nome, WhatsApp, e-mail, faixa de patrimônio e objetivo. **A especialidade saiu**, como pedido. O `app.js` continua enviando o campo `especialidade` vazio, para manter a compatibilidade com o PHP.

Objetivos, na ordem: renda passiva que pague as contas → diminuir a dependência dos plantões → organizar a carteira atual → começar a investir com orientação → aposentadoria → mais liberdade → outro.

### Integrações preservadas
- Meta Pixel (desligado fora do domínio oficial), GA4/GTM prontos e UTMs com primeira origem da sessão.
- Lead **só** em `/obrigado/` após POST bem-sucedido.
- Modo prévia, honeypot e endpoint `/enviar-lead.php`.
- `form_id` dos eventos renomeado de `diagnostico` para `cafe_digital`. Ajuste filtros no GTM/GA4, se existirem.
- Eventos do Meta: `PageView`, `ViewContent` (Método), `Lead`.
- **`Schedule` e `Contact` não foram implementados**: não há agenda integrada nem WhatsApp configurado (`agendaUrl` e `whatsappNumero` vazios em `lp/tracking.js`). Disparar `Schedule` exige confirmação real de horário.

### Testes executados (v6)
- **Simulador (Node):** 7/7 aprovados — fórmula × iteração mês a mês, taxa mensal, capital + rendimentos = VF, taxa 0, cenário B, cenário A, valores de hoje.
- **Navegador:**
  - Simulador recalcula: 100 mil + 5 mil/mês a 8% por 20 anos = R$ 3.311.091.
  - Carteira troca de classe.
  - Validação com 5 erros.
  - Modo prévia não envia dados.
  - Produção simulada: erro → sem Lead; sucesso → 1 `generate_lead` com `cafe_digital`.
  - 9 CTAs apontando para `#agendar` (mais o link do YouTube).
  - Sem erros no console.
- **Responsividade:** 1366 px e 375 px sem estouro horizontal. Botão do topo visível na primeira tela: termina em 776/820 px no desktop e em 694/812 px no mobile. Botões com 56 px de altura no mobile.
- **Lighthouse (versão publicada):**
  - Mobile: acessibilidade, boas práticas e SEO 100; LCP 1,1–1,2 s; CLS 0.
  - Desktop: LCP 1,2 s; CLS 0.
  - **TBT não conclusivo**: o índice de CPU da máquina caiu para 215–311 (sobrecarregada) nas rodadas da v6. Repetir em máquina livre ou no PageSpeed.
- O projeto não tem build, lint ou typecheck (HTML/CSS/JS estático).

### Pendências de validação
1. **Confirmar com o Tiago o que ele entrega no Café Digital.** A página promete olhar a carteira atual e desenhar um direcionamento inicial pelo M.A.P.A.
2. Confirmar se a conversa é por vídeo e se ele quer usar link de agenda (`agendaUrl`) e WhatsApp (`whatsappNumero`). Com isso dá para medir `Schedule` e `Contact`.
3. Registro na CVM ativo (categoria) e enquadramento como "investidor profissional" (ainda não publicado).
4. `enviar-lead.php`: aceitar os campos, fixar o destinatário no servidor e confirmar a entrega dos dados ao atendimento (condição para a frase "Recebi suas informações").
5. Aviso de Privacidade (dados reais) e revisão regulatória da copy.

### Testes A/B recomendados
1. Headline: atual × `?hv=a` "Você trabalha para construir sua renda. Eu ajudo você a construir seus investimentos."
2. Nome da oferta: "Café Digital" × "Conversa de diagnóstico" (medir a taxa de solicitação **e** o comparecimento).
3. Posição do formulário: depois da seção Café Digital (atual) × logo após o hero.
4. Com e sem o simulador acima da dobra no mobile.

---

## Versão 5 — otimização (posicionamento, simulador, carteira, acompanhamento)

### Estrutura final das seções
Todas as headlines principais começam com **"Médico(a),"**.

| # | Seção | Headline |
|---|---|---|
| 1 | Hero (foto real do Tiago + cartão de carteira ilustrativa) | Médico(a), você ganha bem hoje. Mas seus investimentos estão preparados para o seu futuro? |
| 2 | Especialidade (classes de ativos, "o que não é", "o que a consultoria inclui") | Médico(a), esta é uma consultoria de investimentos. |
| 3 | Renda × horas (Hoje / Sem estratégia / Com estratégia) | Médico(a), na medicina a renda depende das suas horas. |
| 4 | **Simulador** | Médico(a), quanto você pode construir investindo todos os meses? |
| 5 | **Carteira ilustrativa interativa** + CTA "Quero analisar minha carteira" | Médico(a), investir não é escolher qualquer aplicação… |
| 6 | **Acompanhamento individual** (4 etapas + painel ilustrativo) | Médico(a), você não precisa investir sozinho. |
| 7 | Método M.A.P.A. (como roteiro da consultoria, não curso) | Médico(a), sua consultoria segue um método. |
| 8 | Liberdade (fotos 30–45 anos) | Médico(a), liberdade financeira é poder escolher como viver e trabalhar. |
| 9 | Histórias ilustrativas | Médico(a), você se reconhece em alguma destas situações? |
| 10 | Tiago (credenciais + link do YouTube) | Médico(a), conheça quem vai acompanhar seus investimentos. |
| 11 | Diagnóstico + formulário | Médico(a), descubra por onde começar ou o que pode melhorar nos seus investimentos. |
| 12 | FAQ (novo: "O Tiago faz as operações por mim?") | Médico(a), tire suas dúvidas antes do diagnóstico. |
| 13 | CTA final | Médico(a), você já construiu a sua carreira… |

### Simulador (`lp/simulador.js`)
- Campos: patrimônio inicial (padrão R$ 100 mil, limite R$ 20 mi), aporte mensal (R$ 3 mil, limite R$ 1 mi), prazo (20 anos, 1–40) e taxa anual hipotética (chips de 6/8/10%, editável de 0 a 30%). Opcionalmente, mostra valores descontados pela inflação.
- Fórmulas: `i = (1+a)^(1/12) − 1`; `VF = P(1+i)^n + A[((1+i)^n − 1)/i]`; com i = 0, `VF = P + A·n`. Capital aportado = `P + A·n` e rendimentos = `VF − capital`, sempre separados.
- Com inflação, os valores aparecem "em valores de hoje": usa a taxa real `(1+taxa)/(1+inflação) − 1`, com aportes reajustados pela inflação.
- Gráfico em SVG nativo, com 3 cenários (sem remuneração / inicial sem aportes / com aportes). Tem tooltip por toque ou mouse e navegação pelas setas do teclado.
- **Testes executados:**
  - Script Node: a fórmula bate com a iteração mês a mês (diferença de 5×10⁻¹⁰); a taxa mensal recompõe exatamente 8% ao ano; taxa 0 dá P + A·n; o cenário B dá P·1,08²⁰.
  - Navegador: valores-padrão (R$ 2.173.093), cenário 500 mil + 10 mil/mês a 10% por 30 anos (R$ 29,35 mi), campos vazios (R$ 0), limite de valor e inflação (R$ 1.286.251 em valores de hoje).

### Carteira ilustrativa
50% renda fixa, 25% ações, 15% FIIs, 10% internacional = 100%. Ao clicar em uma classe, aparece a explicação dela (textos do briefing). Está marcada como composição exclusivamente demonstrativa.

### Novos eventos (dataLayer / GA4, sem evento no Meta)
`simulator_interaction` (primeira interação com o simulador) e `portfolio_interaction` (primeira interação com a carteira). O Lead continua disparando **só em `/obrigado/` após POST bem-sucedido**. Retestado: erro do servidor → sem Lead; sucesso → 1 `generate_lead`.

### Credenciais
- "Investidor profissional" **não está publicado**. Fica em comentário até confirmar que o Tiago atende à definição da CVM e tem a documentação.
- "Consultor de valores mobiliários — registro na CVM" está publicado com base na informação do Tiago. **Confirmar se o registro está ativo** antes da publicação oficial.
- Link do YouTube adicionado (seção do Tiago e rodapé). Nenhum vídeo foi incorporado, porque não há um escolhido.
- Cripto **não** aparece nas classes de ativos.

### Performance — medida (Lighthouse 13.6 contra a versão publicada no GitHub Pages)
A API pública do PageSpeed estava sem cota, então rodei o Lighthouse localmente (Chrome headless). **Atenção:** o índice de CPU desta máquina variou de 542 a 1.043 entre rodadas. Isso deixa o TBT do mobile instável e inflado.

| Métrica | Antes das otimizações | Depois | Meta |
|---|---|---|---|
| LCP mobile | 3,0 s | **1,0 s** (uma rodada fora da curva com 4,6 s, logo após a publicação, por latência do CDN) | < 2,5 s ✅ |
| LCP desktop | 0,7 s | **0,6 s** | ✅ |
| CLS | 0 | **0** | < 0,1 ✅ |
| TBT mobile (aproxima o INP) | 1.270–2.110 ms | 790–2.930 ms (ruído da máquina) | < 200 ms ❌ no laboratório |
| TBT desktop | 390 ms | 210–260 ms | ⚠️ |
| Interação no simulador (INP real) | — | **~6 ms por atualização, 0 tarefas longas em 20 interações** | < 200 ms ✅ |
| Acessibilidade / SEO / Boas práticas | 100 / 100 / 100 | **100 / 100 / 100** | |

Otimizações aplicadas:
- Removido `text-wrap: pretty` dos parágrafos.
- Sem `backdrop-filter` no mobile.
- `tracking.js` com `defer`.
- Preload da foto do hero só no desktop.
- `content-visibility: auto` nas seções abaixo da dobra.
- Animações observando as seções, não cada elemento.
- Simulador calculado só perto da tela, ou na primeira interação, ou 3,5 s após o carregamento.

Pelo trace, o TBT restante vem de **layout do navegador antes da primeira pintura** (HTML longo chegando em partes e o redesenho com a fonte Manrope), não de JavaScript.

Próximos passos possíveis, se a meta de TBT em laboratório for obrigatória:
1. CSS crítico inline e o restante assíncrono.
2. `font-display: optional` (evita o segundo layout, mas pode mostrar a fonte do sistema na primeira visita).
3. Hospedar as fotos do Unsplash no próprio domínio.
4. Cabeçalhos de cache longos no servidor oficial (o GitHub Pages fixa 10 min).
5. Validar com o PageSpeed (com chave de API) e com dados reais do CrUX após a publicação no domínio oficial.

### Ainda não verificado
- Envio real ao `enviar-lead.php`, que só existe no domínio oficial.
- Core Web Vitals de campo (usuários reais): a página ainda não tem tráfego.
- O projeto não tem scripts de lint, build ou testes automatizados (HTML/CSS/JS estático). Os testes executados foram o script Node do simulador, os testes no navegador e o Lighthouse.

---

## Versão 3 — feedback do Tiago (11/11/2026)

| Feedback | O que mudou |
|---|---|
| Cabeçalho "muito colado"; marca deve ser "O Tiago Investe" | Header mais alto (76 px), mais espaço entre ícone, nome e subtítulo. Marca "O Tiago Investe" em todas as páginas e no título da aba. |
| Foto inicial (família) não conversa com médico | Hero com foto de uma **médica trabalhando no consultório**. |
| "Quando você para, ela para" | Trocado por "**Quando você para de trabalhar, o dinheiro para de entrar.**" |
| Fotos remetiam a público idoso | Galeria refeita com pessoas de 30 a 45 anos: família jovem, casa, viagem, filhos. Cards: *Trabalhar porque quer, não porque precisa*, *Renda que paga as suas contas*, *Férias*, *Filhos*, *Viajar/temporada fora*. |
| Parecia curso; não deixava claro que é consultoria de investimentos | Eyebrow do hero: "Consultoria de investimentos para médicos". Seção da consultoria: "Não é curso nem aula… o Tiago monta a sua carteira com você". FAQ novo: "É um curso?". |
| Acompanhamento = ajustar a carteira (comprar, vender, manter) | Etapas P e A reescritas: "O Tiago indica o que comprar, quanto e por quê — e vocês executam juntos" e "o que comprar, o que vender e o que manter". |
| "Pego na mão e faço junto" | Título: "Você não precisa entender de investimentos. O Tiago faz junto com você." Mesma ideia no FAQ. |
| Currículo: tirar Administração, colocar registro CVM e investidor profissional | Credenciais: Consultor de valores mobiliários (CVM), Investidor profissional, MBA em Investimentos, CEA. Saiu o bacharelado. O YouTube não entrou porque falta o link do canal. |
| Não gosta de "sem compromisso" | Removido de toda a página. |
| Criativos prometem diagnóstico da carteira | A oferta virou "**Diagnóstico gratuito da sua carteira**": o Tiago analisa os investimentos atuais e mostra o que pode melhorar. A frase "não é análise completa" foi removida. |
| Objetivo no formulário | Primeira opção: "**Ter uma renda passiva que pague minhas contas**". |

**Atenção — compliance:** a página agora afirma "consultor de investimentos registrado na CVM" e "investidor profissional". Antes de publicar no domínio oficial, confirmar a categoria exata do registro (consultor de valores mobiliários) e, se quiser exibir, o número ou o ato declaratório. A promessa de "diagnóstico da carteira" precisa corresponder ao que o Tiago faz na call.

## Versão 4 — áudios do Tiago

Os áudios foram transcritos localmente com faster-whisper. Resumo do que ele pediu:
- A página falava muito em "patrimônio" e pouco em "investimentos". O médico poderia achar que ele é advogado tributarista ou que trabalha com holding e imóveis.
- Ele sugeriu mostrar uma carteira montada, com % em renda fixa, % em renda variável etc.
- Analogia do cardiologista: deixar claro qual é a especialidade, para não atrair o caso errado.

O que mudou:
- Nova seção **"A especialidade do Tiago"**, logo após o topo: "Consultoria de investimentos. É exatamente isso que ele faz." Ela traz as classes de ativos (renda fixa, Tesouro, CDB/LCI/LCA, ações, FIIs, fundos, exterior) e um bloco **"O que a consultoria não é"** (advocacia, holding, tributário, sucessório, imobiliário).
- **Carteira de exemplo**: gráfico de rosca (40% renda fixa, 25% ações, 20% FIIs, 15% exterior) e a revisão "comprar / manter / vender". Tudo marcado como *exemplo ilustrativo, não é recomendação*.
- **Cartão de carteira sobre a foto do topo**, para o assunto ficar claro na primeira tela.
- "Patrimônio" foi trocado por "investimentos" ou "carteira" em quase todo o texto. Ficou apenas no rodapé legal.
- Menu com o novo item "Investimentos".
- **Cripto ficou de fora** das classes de ativos. Incluir se o Tiago trabalhar com isso.

---

## A. Diagnóstico da página atual

**Base analisada.** O diretório local é um espelho feito com HTTrack de `otiagoinveste.com`: um app React/Vite já compilado. O código-fonte não está aqui. A página tem as rotas `/`, `/medicos`, `/renda-passiva` e `/obrigado`.

| Área | Problema |
|---|---|
| **Copy / posicionamento** | A headline ataca o assessor ("o conflito de interesse está fazendo você perder dinheiro"). Isso contraria a Big Idea e não combina com anúncios de organização e tempo. A promessa principal é "gerar mais renda todos os meses" e "reduzir plantões", o que vende abandono da medicina e renda passiva. |
| **Compliance** | O FAQ afirma que, "por dentro da metodologia… não há como se perder dinheiro". Também diz que o cliente que segue o assessor "já está perdendo dinheiro". Há credenciais "CVM · CEA/ANBIMA" sem detalhamento. A bio tem uma narrativa de enriquecimento ("liberdade financeira aos 36", "terça-feira na praia"). Não há aviso de risco. |
| **Hierarquia** | São só 4 blocos (hero → lista → método → bio → FAQ). Faltam conexão com a rotina médica, problema, como funciona o acompanhamento, benefícios e a diferença entre a conversa gratuita e o programa pago. O método aparece em uma linha por etapa. |
| **Credibilidade** | Não há provas. O FAQ trata de temas genéricos (poupança, dólar) e não das objeções do médico (tempo, transferência de investimentos, custo). |
| **Mobile** | O hero junta H1, subtítulo e parágrafo, e o CTA fica longe. O formulário está em um modal, que é pior no mobile do que um formulário inline. |
| **Conversão** | Todos os CTAs abrem o mesmo modal. Só existem 4 faixas de patrimônio e nenhuma pergunta de objetivo, então a qualificação do lead é fraca. Também não fica claro o que acontece depois do envio. |
| **Performance** | O bundle JS tem 202 KB, mais 43 KB de CSS e 3 famílias de fontes (Fraunces, Bricolage, Manrope) em vários subsets. O React faz hidratação completa de uma página que é praticamente estática. |
| **Tracking** | **O Lead do Meta dispara em qualquer visita a `/obrigado`**, inclusive acesso direto, recarregamento e bots, o que gera conversões falsas. Não há GA4/GTM, nem `eventID` para deduplicação, nem eventos de clique ou de início de formulário. As UTMs só são lidas da URL no momento do envio. |
| **Segurança** | O front envia o e-mail de destino (`email_cliente`) no payload para o `enviar-lead.php`. Se o PHP usar esse campo como destinatário, qualquer pessoa pode usar o endpoint para disparar e-mails (*open relay*). |

---

## B/C. Nova landing page — estrutura final (v2: mais simples, vendendo futuro)

Na v2, a página passou de 13 para 9 seções. A pergunta central agora é: **para que serve construir patrimônio?** A resposta da página é liberdade, família, aposentadoria no seu tempo e dormir tranquilo.

| # | Seção | Etapa psicológica |
|---|---|---|
| — | Header fixo (Seu futuro · Como funciona · Quem é Tiago · Dúvidas · CTA) | — |
| 1 | **Hero**: "**Médico(a)**, você ganha bem hoje. Mas o que vai sustentar a sua vida quando você parar?", com foto de pai e filho na praia e selo do Tiago | Identificação |
| 2 | "Na medicina, a renda depende das suas horas. Quando você para, ela para." Comparação Hoje → Sem um plano → Com um plano | Reconhecimento |
| 3 | **O futuro**: galeria com 5 fotos (aposentar quando decidir, férias com a família, presença com os filhos, morar fora, dormir tranquilo) | Desejo |
| 4 | Método M.A.P.A. em linguagem simples ("Você não precisa virar especialista") | Oportunidade |
| 5 | **Histórias de médicos**, sinalizadas como ilustrativas (Dr. R. 52, Dra. C. 38, Dr. M. 45) e o que um plano muda em cada caso | Identificação / confiança |
| 6 | Tiago Lopes: bio curta e credenciais | Confiança |
| 7 | Conversa gratuita + formulário (objetivos novos: aposentadoria, reduzir ritmo, família, morar fora…) | Ação |
| 8 | FAQ enxuto (5 perguntas) | Confiança |
| 9 | CTA final com foto de família ao pôr do sol: "Você já construiu a sua carreira. Agora, construa a sua liberdade." | Ação |

**Regra de copy:** toda headline abre com **"Médico(a)"**, inclusive as variantes A/B.

**Depoimentos.** Não há depoimentos inventados. A seção 5 usa personas **explicitamente sinalizadas** como ilustrativas, na página e no rodapé, porque depoimento fictício apresentado como real é publicidade enganosa (CDC/CONAR). Também aumenta o risco de reprovação dos anúncios no Meta. O modelo de bloco `.testimonial` para depoimentos **reais e autorizados** está comentado no HTML. Coletar 2–3 depoimentos com o Tiago é o próximo passo de maior impacto em conversão.

**Imagens.** As fotos de estilo de vida vêm do Unsplash (licença gratuita para uso comercial) e são carregadas direto do CDN `images.unsplash.com`, já em formato otimizado (`auto=format`). Para produção, recomendo baixá-las e servi-las do próprio domínio, em WebP, o que melhora o LCP do hero no mobile. As fotos do Tiago são as reais do site atual.

**Ajustes visuais**
- Paleta navy `#101D30`, `#263D58`, off-white, grafite e dourado `#B69B69`. Para texto pequeno sobre fundo claro, a variante `#7D6539` tem contraste AA.
- Fontes: Manrope (self-hosted, já existia no site) nos títulos e Inter/fonte do sistema no corpo, sem download extra.
- Seções alternando claro e escuro, ícones de traço consistentes (sprite SVG inline), cards discretos e animações de entrada suaves que respeitam `prefers-reduced-motion`.
- Hero: a foto do Tiago no escritório (navy, luz natural) fica no hero. O retrato em estúdio fica na seção de autoridade.

---

## D. Integrações

| Item | Status | O que é necessário |
|---|---|---|
| Formulário → `/enviar-lead.php` | **Preservado** (mesmo endpoint e mesmos campos-base) | Validar que o PHP aceita os campos novos (abaixo) e responde JSON `{status: "ok"}` ou `{status:"erro", mensagem}`. |
| Meta Pixel `1028082333350113` | **Preservado** (o `src` do snippet foi corrigido para `https://connect.facebook.net/...`) | — |
| GA4 | Pronto, desligado | Informar `ga4Id` em `lp/tracking.js`. |
| GTM | Pronto, desligado | Informar `gtmId`. Se o GA4 for configurado via GTM, deixe `ga4Id` vazio. |
| WhatsApp | Pronto, desligado | `whatsappNumero` (só dígitos, com 55). O botão aparece em `/obrigado/`. |
| Agenda (Calendly etc.) | Pronta, desligada | `agendaUrl`. O botão "Escolher um horário agora" aparece em `/obrigado/`. |
| CRM | Não existe hoje | Pode ser plugado no próprio `enviar-lead.php` ou via GTM. Todos os dados de atribuição já vão no payload. |

**Payload enviado** (os campos novos estão em negrito):
`nome, email, telefone, `**`whatsapp, especialidade, objetivo`**`, patrimonio_investido, pagina, `**`variante_hero, data_hora_conversao, data_hora_local, event_id`**`, utm_source, utm_medium, utm_campaign, utm_content, utm_term, `**`utm_id, fbclid, gclid, ad_id, adset_id, campaign_id, landing_page, referrer`**`, email_cliente, assunto_email, from_name`.

> As faixas de patrimônio mudaram de 4 para 7 opções, com novos textos. Se o PHP ou alguma planilha filtra por valor exato, ajuste esse filtro.

---

## E. Verificações realizadas (servidor local, Chrome)

- **Responsividade:** sem rolagem horizontal em 375 px e 1366 px. No mobile, o H1 e o CTA do hero ficam acima da dobra. O CTA fixo aparece depois do hero e some quando o formulário está visível.
- **Formulário (v2):** se o visitante enviar antes de o JS carregar, os dados não vão mais para a URL (corrigido com `method=post` e bloqueio até o script assumir).
- **Formulário:** com campos vazios, aparecem 5 mensagens e o foco vai para o primeiro erro. A máscara de telefone funciona (`(48) 9 9999-8888`). Erro do servidor gera alerta, reativa o botão e não grava a marca de Lead. Envio com sucesso redireciona para `/obrigado/`.
- **Tracking:**
  - Com envio válido, `/obrigado/` disparou **1 Lead** com `eventID` igual ao `event_id` do payload.
  - Recarregar `/obrigado/` disparou **apenas PageView**.
  - `?hv=b` trocou a headline e gravou `variante_hero: "b"` no payload, junto com as UTMs.
  - ⚠️ Esse teste enviou **1 evento Lead real** ao Pixel, com origem `localhost`. Ele pode aparecer no Gerenciador de Eventos.
- **Peso:** HTML + CSS + JS somam cerca de 23 KB comprimidos (gzip), contra cerca de 245 KB sem compressão no site atual. Há uma fonte de 25 KB e a imagem do hero tem 37 KB. Não há framework, autoplay ou biblioteca externa além do Pixel.
- **Acessibilidade:** skip link, foco visível, labels em todos os campos, `aria-invalid` e mensagens com `aria-live`, FAQ nativo e contraste AA nos textos.
- **SEO:** title e description novos, canonical, Open Graph, JSON-LD `ProfessionalService`. `/obrigado/` e `/privacidade/` estão com `noindex`.
- **Não verificado:** Core Web Vitals em produção (LCP, INP, CLS). Medir com PageSpeed Insights depois de publicar. O envio real ao PHP também não foi testado, porque o PHP não está no espelho.

---

## F. Eventos de tracking implementados

| Evento | Onde dispara | Meta | GA4/dataLayer |
|---|---|---|---|
| PageView | carregamento de qualquer página | `PageView` | page_view (automático do GA4) |
| Visualizou o Método | seção `#metodo` 35% visível, uma vez | `ViewContent` | `view_metodo` |
| Clique em CTA | qualquer `[data-cta]` (header, hero, abordagem_metodo, autoridade, final, sticky_mobile) | — | `cta_click` |
| Início de formulário | primeiro foco no formulário | — | `form_start` |
| Erro de validação | envio com campo inválido | — | `form_error` |
| Tentativa de envio | antes do POST | — | `form_submit_attempt` |
| Falha no envio | resposta de erro ou timeout de 15 s | — | `form_submit_error` |
| **Lead** | **só em `/obrigado/`, só se houve POST com sucesso na mesma sessão, uma única vez, com a marca válida por até 10 min** | `Lead` + `eventID` | `generate_lead` |
| Abrir agenda | clique em "Escolher um horário" (se configurado) | — | `agenda_open` |
| Clique no WhatsApp | clique em "Falar pelo WhatsApp" (se configurado) | `WhatsAppClick` (custom) | `whatsapp_click` |

**Não implementados de propósito:** `Schedule`, porque só deve vir de uma integração da agenda que confirme o horário (webhook do Calendly ou CAPI). `Contact`, porque clicar no wa.me não comprova contato. O `event_id` do payload permite enviar o mesmo Lead pela API de Conversões (CAPI) com deduplicação.

---

## G. Pendências de validação (bloqueiam a publicação)

1. **Credenciais.** O site atual diz "Consultor de investimentos certificado (CVM, CEA/ANBIMA)". A nova LP mostra só **"Certificação CEA · ANBIMA"** no hero e na seção de autoridade, marcada com `<!-- VALIDAR -->`. Confirmar se a certificação está ativa e se existe registro na CVM, com categoria e número. Só depois disso mencionar a CVM. A CEA não autoriza consultoria de valores mobiliários.
2. **Natureza do serviço.** Definir se é consultoria, educação financeira ou mentoria e ajustar termos como "recomendações" (seção 6 e FAQ). A página evita falar em gestão e diz que o cliente executa as próprias decisões.
3. **Entregas do acompanhamento.** A página cita só "aproximadamente 12 meses" e "revisões e orientações ao longo do período". Confirmar com o Tiago antes de detalhar frequência e canais.
4. **`enviar-lead.php`.**
   - (a) Aceitar e repassar os campos novos.
   - (b) **Fixar o destinatário no servidor e ignorar `email_cliente`**, por segurança.
   - (c) Validar e limitar a taxa de envios no servidor.
   - (d) Rejeitar envios com o campo `website` preenchido (honeypot).
5. **Aviso de Privacidade.** Preencher os trechos em amarelo (controlador, CNPJ, e-mail de contato, prazo de retenção) e passar por revisão jurídica.
6. **Revisão regulatória** de toda a copy e do aviso de risco no rodapé.
7. **Rotas antigas.** `/medicos` e `/renda-passiva` dependem do bundle React antigo (`assets/`). Se a nova `index.html` substituir a raiz e o servidor tiver fallback de SPA, essas rotas passam a mostrar a nova página. Decidir entre redirecionar (301 para `/`) ou manter os arquivos antigos.
8. **Provas reais.** Coletar depoimentos autorizados (modelo `.testimonial` comentado na seção 5) e gravar o vídeo de 60–90 s.
10. **Fotos.** Baixar as imagens do Unsplash e servir do próprio domínio (performance).
9. Preencher `ga4Id`/`gtmId`, `whatsappNumero` e `agendaUrl`, se existirem.

---

## H. Recomendações de testes A/B

Use `?hv=` na URL de cada anúncio. A variante fica salva na sessão e vai no payload (`variante_hero`), então dá para cruzar com a qualidade do lead.

| Anúncio | URL | Headline |
|---|---|---|
| Controle — Futuro | `/` | "Médico(a), você ganha bem hoje. Mas o que vai sustentar a sua vida quando você parar?" |
| A — Carreira | `/?hv=a` | "Médico(a), você cuida da saúde dos seus pacientes. Quem está cuidando do seu futuro?" |
| B — Tempo | `/?hv=b` | "Médico(a), sua agenda já é cheia. Seu futuro não precisa ser mais uma preocupação." |
| C — Liberdade | `/?hv=c` | "Médico(a), até quando a sua vida vai depender do próximo plantão?" |
| D — Planejamento | `/?hv=d` | "Médico(a), ganhar bem é importante. Transformar renda em liberdade exige um plano." |

Ordem sugerida, um teste por vez, até ter volume suficiente:
1. Headline: controle × A (mesmo anúncio de carreira).
2. Rótulo do CTA: "Quero planejar meu futuro" × "Quero minha conversa gratuita".
3. Formulário: 6 campos × 4 campos (sem especialidade e objetivo). Medir **taxa de comparecimento e de venda**, não só cadastros.
4. Prova: histórias ilustrativas × depoimentos reais, quando existirem, e o vídeo do Tiago.
5. Foto do hero: família (atual) × Tiago no escritório.

Métrica principal: **custo por reunião realizada** e taxa de venda por faixa de patrimônio, não o custo por lead.
