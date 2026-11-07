# The FAQ in pt; the {placeholders} are filled in by helpers/help.py (faq_values) with
# billing's prices and the number of languages. Questions not translated yet show in English
# (constants/faq/__init__.py).
FAQ = [
    {
        "key": "what",
        "question": "O que é a testee?",
        "answer": "Uma entrevista cronometrada de múltipla escolha criada a partir da sua descrição de vaga, para qualquer cargo. Use-a para fazer a triagem de candidatos antes de conhecê-los ou como uma etapa da própria contratação: de qualquer forma, você vê quem realmente conhece o trabalho.",
    },
    {
        "key": "roles",
        "question": "Para quais cargos posso contratar?",
        "answer": "Qualquer cargo em que o conhecimento importa: suporte, vendas, finanças, saúde, ofícios técnicos, engenharia, marketing e muito mais. Se você consegue descrever o trabalho, a testee consegue criar uma entrevista para ele.",
    },
    {
        "key": "hiring",
        "question": "Como funciona?",
        "answer": "Cole uma descrição de vaga na página inicial, informe o nome da sua empresa e confira os tópicos que a testee propõe. Depois, convide candidatos: digite os e-mails, cole uma lista ou envie um arquivo. Candidatos que não começaram depois de alguns dias recebem um lembrete. Cada candidato recebe suas próprias questões, com um cronômetro em cada uma, e você vê a pontuação e todas as respostas assim que ele termina.",
    },
    {
        "key": "templates",
        "question": "Posso começar a partir de uma entrevista pronta?",
        "answer": "Sim. A aba Modelos da sua empresa lista entrevistas prontas por cargo, que você pode buscar e filtrar por nível e idioma. Proprietários e administradores podem copiar uma para a empresa na hora, de graça, e depois alterá-la como qualquer entrevista; os candidatos são cobrados normalmente.",
    },
    {
        "key": "link",
        "question": "Posso colocar uma entrevista em um anúncio de vaga?",
        "answer": "Sim. Ative o link compartilhável da entrevista na aba Configurações e cole-o no seu anúncio. Quem o abre entra na conta e faz a entrevista, e cada pessoa é cobrada como um candidato convidado. Sem créditos restantes, o link não aceita novas pessoas. O link é desativado quando você marca a entrevista como “Contratado”.",
    },
    {
        "key": "preview",
        "question": "Posso experimentar uma entrevista antes de convidar alguém?",
        "answer": "Sim. Abra sua entrevista como candidato na página dela, sem custo: as prévias não aparecem entre seus candidatos nem nas estatísticas das questões. Você também pode fazer qualquer uma das simulações de entrevista gratuitas.",
    },
    {
        "key": "question_quality",
        "question": "Como vocês verificam se as questões estão certas?",
        "answer": "Antes de uma entrevista ficar pronta, uma segunda IA confere uma amostra dos seus gabaritos. Depois, respostas, votos e relatos de problemas apontam as questões fracas, que são corrigidas ou substituídas em segundo plano para os candidatos que começarem depois; as notas já dadas não mudam. Na página de um tema você pode ler cada questão, e proprietários e administradores podem desativar uma, gerá-la de novo ou marcar a resposta dela como errada.",
    },
    {
        "key": "open-to-offers",
        "question": "As empresas podem me encontrar pela minha prática?",
        "answer": "Só se você quiser. Ative Aberto a propostas depois de uma rodada de prática ou em Configurações, com o endereço do seu perfil do LinkedIn. As empresas que já recarregaram na testee passam a ver seu nome, seu perfil do LinkedIn e seu resultado de prática mais recente em cada tema das entrevistas delas que você praticou, e podem convidar você para uma entrevista. A testee não classifica nem recomenda você. Desative quando quiser em Configurações, e você some na hora da lista de todas as empresas; a opção também termina um ano depois da última vez que você a ativou ou salvou seu perfil do LinkedIn.",
    },
    {
        "key": "cheating",
        "question": "Os candidatos podem usar IA ou procurar as respostas?",
        "answer": "Cada candidato recebe questões sorteadas de cada tema, em sua própria ordem, com [um cronômetro em cada questão](/guides/skills-test-timing-and-extra-time) controlado pelo nosso servidor, então sobra pouco tempo para procurar respostas ou perguntar a uma IA. Os resultados também mostram quando um candidato saiu da página, copiou texto ou respondeu rápido demais para ter lido a questão. Quando ele termina, a página do candidato também aponta padrões de resposta que costumam aparecer quando alguém repassa as questões a uma IA, como mais ou menos o mesmo tempo em cada questão ou questões difíceis certas enquanto as fáceis estavam erradas, e sugere questões que ele acertou para explorar em uma entrevista ao vivo. Um padrão é um motivo para perguntar, não uma prova. Antes de começar, cada candidato também confirma que vai responder por conta própria, sem ferramentas de IA nem ajuda de outras pessoas, e os resultados mostram isso.",
    },
    {
        "key": "practice",
        "question": "Posso praticar de graça?",
        "answer": "Sim. A [página de prática](/practice) tem entrevistas grátis por cargo: entre, escolha tempo padrão, tempo dobrado ou sem limite de tempo, e veja sua nota e cada resposta certa no final. Sua prática é privada; as empresas só veem um resultado se você ativar Aberto a propostas.",
    },
    {
        "key": "voice",
        "question": "Os candidatos podem responder por voz?",
        "answer": 'Sim, se a empresa definir uma entrevista no modo de voz, em qualquer um dos 23 idiomas da testee; o quanto ele lê e entende bem depende do idioma (o guia "Entrevistas por voz em 23 idiomas" mostra cada um). As questões são lidas em voz alta e os candidatos respondem falando; o que eles dizem é convertido em texto e associado a uma opção. A testee não o armazena; a OpenAI, que faz isso para nós, pode guardá-lo por até 30 dias, apenas para verificar abusos, salvo se a lei exigir um prazo maior. As vozes não são analisadas quanto a tom ou emoção, e os candidatos sempre podem tocar em uma opção.',
    },
    {
        "key": "extra_time",
        "question": "Um candidato pode ter tempo extra?",
        "answer": "Sim. Antes de um candidato começar, proprietários e administradores podem dar a ele 25%, 50% ou 100% mais tempo em cada questão, na página do candidato; nenhum motivo é registrado. Quem usa um link compartilhável pede antes um convite pessoal à empresa. Veja [como cronometrar um teste de habilidades](/guides/skills-test-timing-and-extra-time).",
    },
    {
        "key": "retake",
        "question": "Um candidato pode refazer uma entrevista ou voltar atrás?",
        "answer": "Não. Uma entrevista é feita uma vez, de uma vez só: o candidato pode mudar a escolha até apertar “Próxima questão”, e então ela é definitiva. Depois que ele termina, não pode ser convidado de novo para essa entrevista.",
    },
    {
        "key": "connection",
        "question": "E se a conexão de um candidato cair ou ele fechar a página?",
        "answer": "Ele abre o mesmo link e continua. O relógio do nosso servidor segue correndo nesse meio-tempo: uma questão cujo tempo acaba enquanto ele está ausente conta como errada, e o cronômetro da próxima começa quando ela aparece. Uma entrevista deixada pela metade termina sozinha quando passa seu tempo total mais 10%.",
    },
    {
        "key": "cost",
        "question": "Quanto custa?",
        "answer": "Gerar entrevistas é grátis. Cada candidato que responde pelo menos uma questão custa {candidate} créditos ({candidate_price}), e menos com créditos de recargas maiores, até {cheapest_price}. Sua primeira empresa recebe {company} créditos grátis, o suficiente para os primeiros {company_candidates} candidatos. Os preços não incluem IVA nem imposto sobre vendas. A [página de preços](/pricing) lista todos os valores.",
    },
    {
        "key": "charged",
        "question": "Quando um candidato é cobrado?",
        "answer": "Desde que ele tenha respondido a pelo menos uma pergunta: quando a entrevista dele termina (ele a conclui ou o tempo acaba enquanto ele está ausente) ou quando você o revoga, o que também apaga as respostas dele para sempre. Uma pergunta cujo tempo acabou sem resposta escolhida não conta. Os créditos dele são reservados quando você o convida (por um link, quando ele começa) e voltam se você o revogar antes que ele responda a qualquer coisa, se ele nunca começar e o convite expirar após 30 dias, ou se a entrevista dele terminar sem nenhuma resposta.",
    },
    {
        "key": "compare_hiring",
        "question": "Como o preço se compara a outras ferramentas de avaliação?",
        "answer": "Muitas ferramentas de avaliação são vendidas como assinatura mensal ou anual, paga mesmo que você não avalie ninguém. Na testee você paga só por candidato, com créditos comprados antecipadamente: {candidate} créditos ({candidate_price}), sem contrato, sem taxa por usuário e sem pagar para gerar uma entrevista. Uma empresa que convida {example_candidates} candidatos por mês paga cerca de {example_year_price} por ano, antes de impostos. Se você avalia muitos candidatos todo mês, uma assinatura pode custar menos, então compare com os seus números.",
    },
    {
        "key": "top_up",
        "question": "Como compro créditos?",
        "answer": "Proprietários e administradores recarregam na página de recarga, no menu da conta, para {min_candidates} a {max_candidates} candidatos por vez. A Paddle recebe o pagamento, adiciona IVA ou imposto sobre vendas, se houver, e emite o recibo ou a fatura; a fatura de cada recarga também fica na aba Faturamento da empresa.",
    },
    {
        "key": "expire",
        "question": "Os créditos expiram?",
        "answer": "Não. Os créditos nunca expiram, e não há assinaturas pagas. Se você ativar a recarga automática opcional, a Paddle salva seu cartão como uma assinatura de {zero_price}; você paga só pelas recargas que ela fizer.",
    },
    {
        "key": "auto_top_up",
        "question": "Os créditos podem ser recarregados automaticamente?",
        "answer": "Sim, se um proprietário ou administrador ativar isso na página de recarga: escolha uma recarga e o saldo abaixo do qual recarregar, e marque o que ela cobra e quando. Sempre que o saldo disponível da empresa cai abaixo desse nível, o cartão salvo é cobrado, mais impostos, se houver, e os proprietários e administradores da empresa recebem um e-mail. Uma cobrança recusada é tentada de novo após 1, 3 e 7 dias; depois, a recarga automática fica pausada até o cartão ser atualizado. Desativá-la onde você a ativou a interrompe na hora.",
    },
    {
        "key": "currency",
        "question": "Em que moeda eu pago?",
        "answer": "Os preços são na moeda local no Canadá, na Austrália, em Israel, na Polônia, na Suíça, no Japão, na Coreia do Sul, em Taiwan, em Hong Kong, na Tailândia, em Singapura e na Índia; em euros no restante da UE e na Islândia, em Liechtenstein e na Noruega; em libras no Reino Unido; e em dólares americanos nos demais lugares. Sua conta e cada empresa mantêm a moeda do país em que foram criadas ou usadas pela primeira vez, para onde quer que você viaje: altere a sua em Configurações, e a de uma empresa na página de recarga (proprietários e administradores). As recargas de uma empresa, inclusive as automáticas, são sempre cobradas na moeda da empresa. Se você a alterar enquanto a recarga automática estiver ativa, verá primeiro os dois valores para confirmar, e os proprietários e administradores da empresa receberão um e-mail.",
    },
    {
        "key": "referrals",
        "question": "Posso ganhar créditos indicando uma empresa?",
        "answer": "Sim. Compartilhe o link da aba Indicações da sua empresa: quando uma nova empresa criada por ele fizer a primeira recarga, de qualquer valor, as duas empresas recebem {referral} créditos, até 25 indicações por ano. Só conta a primeira empresa do e-mail do proprietário, e suas próprias empresas não contam.",
    },
    {
        "key": "refunds",
        "question": "Posso pedir reembolso?",
        "answer": "Sim, dos créditos que você comprou nos últimos 14 dias e ainda não gastou: na página de faturamento da sua empresa, pelo Paddle ou escrevendo para nós. Créditos reservados para candidatos não podem ser reembolsados enquanto estiverem reservados; os reservados dentro dos 14 dias podem ser reembolsados por 7 dias após a volta. Créditos grátis, como o presente de boas-vindas, não são reembolsados e são considerados gastos primeiro. Os [termos](/terms) têm os detalhes.",
    },
    {
        "key": "scorecards",
        "question": "O que as fichas de avaliação mostram?",
        "answer": 'Cada resposta, se estava certa e quanto tempo levou. A nota é a porcentagem de pontos obtidos: cada pergunta vale um ponto, e uma de "selecionar todas as corretas" dá uma parte dele por opção correta marcada, e nada se uma errada for marcada. As notas aparecem em verde ou vermelho de acordo com a nota de aprovação que você definiu para a entrevista. As fichas também sinalizam respostas rápidas demais para a questão ter sido lida, as vezes que o candidato saiu da página e tentativas de cópia.',
    },
    {
        "key": "reports",
        "question": "Posso compartilhar os resultados com um gestor contratante?",
        "answer": "Sim. Baixe um relatório em PDF de um candidato ou de todos os candidatos de uma entrevista, envie-o por e-mail direto da testee ou mande um resumo curto pelo WhatsApp, Telegram, Viber ou LINE.",
    },
    {
        "key": "action_log",
        "question": "Posso ver quem fez o quê na minha empresa?",
        "answer": "Sim, se você for o proprietário da empresa. A aba Registro de ações dela lista o que os membros fizeram, do mais recente ao mais antigo: convidar ou remover candidatos, ver resultados e alterar as entrevistas, a equipe, o faturamento e as integrações, com quem fez, quando e se o assistente, um app de IA, a API ou um ATS fez isso em nome da pessoa. Você pode filtrar por membro, tipo de ação e datas, e baixar como arquivo CSV. As ações ficam guardadas por 12 meses. As ações de uma chave de API aparecem com o nome da chave.",
    },
    {
        "key": "bias_audit",
        "question": "Posso exportar resultados para uma auditoria de viés?",
        "answer": "Sim, se você for o proprietário da empresa. A aba Registro de ações tem uma “Exportação para auditoria de viés”: um arquivo CSV com cada candidato que terminou, de todas as entrevistas ou de uma e entre datas escolhidas, com a nota, a nota de aprovação, se foi aprovado e se ficou acima da mediana da entrevista. A testee não tem dados sobre sexo, raça ou etnia, então você adiciona as respostas autodeclaradas dos seus candidatos pelo e-mail deles e remove os e-mails antes de entregar o arquivo ao seu auditor independente.",
    },
    {
        "key": "notes",
        "question": "Minha equipe pode fazer anotações sobre uma entrevista?",
        "answer": "Sim. Cada entrevista tem uma aba Anotações onde sua equipe escreve anotações em texto simples sobre o processo seletivo, como quem chamar em seguida ou, para uma agência, para qual cliente é a entrevista. Qualquer membro pode escrever anotações, inclusive visualizadores, e editar as suas; o autor, os proprietários e os administradores podem excluir uma. Proprietários e administradores podem fixar uma anotação, que então aparece abaixo do nome da entrevista. Os candidatos nunca veem as anotações.",
    },
    {
        "key": "team",
        "question": "Posso adicionar minha equipe?",
        "answer": "Sim, e os membros não custam nada. Na aba Equipe da empresa, o proprietário convida cada pessoa por e-mail como administrador ou visualizador. Administradores fazem tudo, exceto gerenciar a equipe, ver o registro de ações e excluir a empresa. Visualizadores veem entrevistas e resultados, compartilham relatórios e escrevem anotações, mas não alteram mais nada e não podem recarregar. Uma conta pode ser proprietária de várias empresas, cada uma com sua equipe e seus créditos.",
    },
    {
        "key": "integrations",
        "question": "A testee funciona com meu ATS ou outras ferramentas?",
        "answer": "Sim, sem custo extra; os candidatos são cobrados normalmente. Proprietários e administradores conectam Workable, Greenhouse, Teamtailor, Recruitee ou Breezy HR na aba Integrações da empresa com uma chave do ATS e depois vinculam uma vaga a uma entrevista e a uma etapa: os candidatos que você move para essa etapa recebem a entrevista, e os resultados voltam para o ATS ([como integrar testes de habilidades ao seu ATS](/guides/ats-integration-skills-tests)). O Slack pode publicar as notificações da sua empresa em um canal, e a API permite que sua própria plataforma crie entrevistas, convide e gerencie candidatos e receba os resultados deles, com cada chave de API limitada ao que você marcar para ela; veja a [Documentação da API](/api-docs).",
    },
    {
        "key": "slack",
        "question": "Como funciona a integração com o Slack?",
        "answer": "Um proprietário ou administrador escolhe “Adicionar ao Slack” na aba Integrações da empresa e seleciona um canal, depois escolhe quais notificações vão para lá, como um candidato terminou, um convite não entregue, um candidato do ATS não convidado ou uma nova anotação. É grátis.",
    },
    {
        "key": "api_keys",
        "question": "Como funcionam as chaves de API?",
        "answer": "Proprietários e administradores as criam na página API da empresa, em Integrações. Você marca o que cada chave pode fazer, escolhe quando ela expira (em 1, 3, 6 ou 12 meses, ou nunca) e pode limitá-la a endereços IP permitidos. Uma chave é mostrada uma vez. Uma empresa pode fazer 60 solicitações por minuto. A [documentação para desenvolvedores](/api-docs) descreve cada chamada.",
    },
    {
        "key": "webhooks",
        "question": "A testee pode avisar meu sistema quando um candidato termina?",
        "answer": "Sim, com webhooks, configurados na página API da empresa. A testee chama o seu endereço quando um candidato começa, termina (com os resultados), não pode ser contatado, expira ou é removido, e quando uma entrevista fica pronta, e assina cada chamada com o seu segredo. Uma chamada que falha é tentada de novo por 3 dias; depois, o webhook fica pausado até um evento de teste passar. Cada webhook tem um log dos últimos envios. Veja a [documentação de webhooks](/api-docs?tab=webhooks).",
    },
    {
        "key": "embed",
        "question": "Os candidatos podem fazer a entrevista no meu próprio site?",
        "answer": "Sim, com o SDK da testee: um script que mostra a entrevista dentro da sua página, nos sites que você permitir na página API da empresa. Seu servidor convida cada candidato pela API com o login desativado, então ele não precisa de conta na testee e a testee não envia e-mails a ele. Não custa nada a mais; os candidatos são cobrados normalmente. Veja a [documentação do SDK](/api-docs?tab=sdk).",
    },
    {
        "key": "ai_apps",
        "question": "Posso usar a testee pelo Claude, pelo ChatGPT ou pelo meu próprio agente de IA?",
        "answer": "Sim. Adicione a testee ao Claude ou ao ChatGPT como conector (os passos estão na aba Integrações da sua empresa) e permita o acesso na testee, só para ler ou também para fazer alterações. O app passa a trabalhar com suas empresas, entrevistas e os resultados dos candidatos em seu nome, com suas permissões. Sua conta ou uma empresa só podem ser excluídas na testee. O que o app lê chega ao fornecedor dele, de acordo com os termos desse app. Você pode desconectá-lo a qualquer momento na mesma aba, e proprietários e administradores podem desativar os apps de IA para uma empresa. Outros apps de IA e agentes que você mesmo cria também se conectam: a [aba MCP](/api-docs?tab=mcp) da documentação para desenvolvedores traz os passos e agentes de exemplo, e um agente em um servidor pode entrar com uma chave de API que tenha a permissão para agentes de IA, fazendo só o que as outras permissões da chave permitem. O [guia sobre agentes de IA, MCP e APIs](/guides/ai-agents-mcp-and-api) explica para que serve cada um.",
    },
    {
        "key": "candidates",
        "question": "O que os candidatos veem?",
        "answer": "O nome e o logotipo da sua empresa, nas cores e nas fontes da sua empresa (definidas na aba Marca), o que esperar antes de começar e depois uma questão cronometrada por vez. A entrevista nunca mostra a eles a própria pontuação nem se uma resposta estava certa; só o download dos próprios dados traz a nota.",
    },
    {
        "key": "brand",
        "question": "As entrevistas podem levar a marca da minha empresa?",
        "answer": "Sim, sem custo extra. Na aba Marca da empresa, proprietários e administradores definem o logotipo, as cores dos temas claro e escuro, as fontes e o arredondamento dos cantos. Os candidatos os veem durante toda a entrevista, sem o cabeçalho nem o rodapé da testee, e o logotipo também aparece em e-mails e relatórios.",
    },
    {
        "key": "candidate_account",
        "question": "Os candidatos precisam de uma conta?",
        "answer": "Sim, e é grátis: eles entram com Google, LinkedIn ou GitHub, com o e-mail verificado que você convidou, então um convite encaminhado não serve para mais ninguém. Por um link compartilhável, qualquer e-mail verificado funciona. A exceção é um convite que sua própria plataforma faz pela API, que pode dispensar o login.",
    },
    {
        "key": "verified",
        "question": "O que significa o selo de verificação?",
        "answer": "Que um proprietário ou administrador da empresa entrou com um e-mail corporativo do site da empresa, como you@acme.com, e que depois a nossa equipe analisou a empresa. Adicione o site em Verificar, no cabeçalho da sua empresa; serviços de e-mail gratuitos não contam. Enquanto a análise está pendente, sua equipe vê um relógio ao lado do nome, e mudar o nome da empresa a envia para análise de novo. O selo aparece ao lado do nome da sua empresa, inclusive nos convites.",
    },
    {
        "key": "languages",
        "question": "Quais idiomas são suportados?",
        "answer": "{count} idiomas, para o site, as entrevistas e os e-mails. Escolha o idioma em que uma entrevista é escrita, seja qual for o idioma da descrição da vaga.",
    },
    {
        "key": "mira",
        "question": "Quem é a Mira?",
        "answer": "A assistente de IA da testee: uma IA, não uma pessoa, e as respostas dela podem estar erradas. Abra com “perguntar à Mira” no cabeçalho. Visitantes podem perguntar qualquer coisa sobre a testee. Com login feito, a Mira também lê suas empresas com o seu acesso e faz as alterações que você pedir, cada uma só depois da sua confirmação. Perguntar à Mira não gasta créditos, e os candidatos não têm acesso a ela durante uma entrevista.",
    },
    {
        "key": "search",
        "question": "Posso fazer buscas na testee?",
        "answer": "Sim. A busca no cabeçalho encontra, enquanto você digita, suas empresas, entrevistas e candidatos (por nome ou e-mail), além das páginas, guias, comparações, textos jurídicos, perguntas do FAQ e testes de habilidades do site. Sem login, ela encontra só o que é público.",
    },
    {
        "key": "privacy",
        "question": "O que acontece com as descrições de vaga e as respostas?",
        "answer": "As descrições de vaga são usadas para criar as entrevistas da sua empresa, e as respostas dos candidatos para avaliá-las para a sua empresa. As perguntas que a testee gera também podem ser reutilizadas em entrevistas e na prática de outras empresas, sem nada que identifique você, a sua empresa ou qualquer outra pessoa; você pode excluir disso as perguntas de uma entrevista nas configurações dela. A testee também extrai, da forma como as perguntas são respondidas, padrões gerais e anonimizados de qualidade das perguntas, para melhorar a forma como elas são geradas. A [política de privacidade](/privacy) explica o que guardamos, por quanto tempo e os direitos de cada pessoa.",
    },
    {
        "key": "question_bank",
        "question": "As questões da minha entrevista são compartilhadas com outras empresas?",
        "answer": "Por padrão, sim. Uma questão gerada pela testee pode entrar no banco de perguntas compartilhado depois de ser respondida algumas vezes e passar por verificações de que não cita organização, pessoa nem dados de contato; a cópia não traz nada que identifique sua empresa. Proprietários e administradores podem deixar de fora as questões de uma entrevista na aba Configurações dela; não há uma configuração para a empresa toda. As questões já reutilizadas ficam, mesmo que sua empresa seja excluída.",
    },
    {
        "key": "ai_training",
        "question": "Nossos dados são usados para treinar modelos de IA?",
        "answer": "A OpenAI, que está por trás da IA da testee, não treina seus modelos com o que enviamos, segundo os termos da API dela; ela pode guardar esses dados por até 30 dias, só para verificar abusos, a menos que a lei exija mais tempo. A própria testee aprende padrões gerais e anonimizados de qualidade das questões, para melhorar a forma como elas são geradas.",
    },
    {
        "key": "data_storage",
        "question": "Onde nossos dados ficam armazenados?",
        "answer": "No Google Cloud, na Bélgica. Alguns fornecedores tratam dados nos Estados Unidos, como a OpenAI e a Resend, com base no Quadro de Privacidade de Dados UE-EUA ou nas cláusulas contratuais-tipo da Comissão Europeia. A [página de confiança](/trust) lista todos eles.",
    },
    {
        "key": "eu_ai_law",
        "question": "É legal usar IA na triagem de candidatos na UE?",
        "answer": "Sim, com regras. Pelo Regulamento de IA da UE (AI Act), ferramentas que avaliam candidatos muito provavelmente são de alto risco, com obrigações a partir de 2 de dezembro de 2027, e o GDPR já se aplica: uma pessoa toma a decisão de contratação, os candidatos são informados de que a IA é usada e são mantidos registros. A testee funciona assim: a IA escreve as perguntas, pessoas da sua empresa revisam os resultados e decidem, e os candidatos são informados antes de começar. Isso não é aconselhamento jurídico; [O uso de IA no recrutamento é legal na UE?](/guides/is-ai-hiring-legal-in-the-eu) explica as regras e as datas.",
    },
    {
        "key": "uk_us",
        "question": "Podemos usar a testee para candidatos no Reino Unido e nos Estados Unidos?",
        "answer": "Sim. O acordo de tratamento de dados cobre a legislação do Reino Unido e dos Estados Unidos, e as instruções para empresas e os modelos de aviso aos candidatos (com versões para a cidade de Nova York, Illinois e Colorado) cobrem o que você deve informar aos candidatos. Para vagas na cidade de Nova York, use-a só depois de cumprir o que a Local Law 144 exige de você: uma auditoria de viés independente no ano anterior ao uso, a publicação do seu resumo e um aviso aos candidatos com 10 dias úteis de antecedência. A exportação para auditoria de viés do Registro de ações dá ao seu auditor a nota e o resultado de cada candidato que terminou, para cruzar com as respostas que seus candidatos declararam eles mesmos.",
    },
    {
        "key": "emails",
        "question": "Quais e-mails a testee envia, e como faço para pará-los?",
        "answer": 'E-mails de serviço, como convites, relatórios, e-mails de cobrança e mudanças nos nossos termos, são sempre enviados. Os demais, como o resumo de atividades diário, os lembretes, as novidades do produto e as ofertas, você escolhe em Configurações, na seção E-mails, ou cancela pelo link "Cancelar inscrição" em cada e-mail. Os candidatos podem parar de receber os e-mails da sua empresa, ou os lembretes de uma entrevista, pelos links nos convites e lembretes. As novidades da testee aparecem nas suas notificações, o sino no topo; as mais importantes também chegam por e-mail como novidade do produto, só enquanto essa configuração estiver ativada.',
    },
    {
        "key": "data_export",
        "question": "Posso baixar meus dados?",
        "answer": "Sim. “Baixar meus dados” em Configurações gera um arquivo JSON com o que a testee tem sobre você; das entrevistas de uma empresa, ele traz suas respostas e notas, mas não quais respostas estavam certas. Não há exportação de uma empresa inteira: o proprietário pode baixar o registro de ações, e os membros podem baixar os relatórios em PDF dos candidatos.",
    },
    {
        "key": "candidate_data",
        "question": "Como um candidato pode pedir a exclusão dos seus dados?",
        "answer": "Pedindo à empresa que o convidou: revogar um candidato que começou apaga ele e os resultados dele para sempre. Ou excluindo a própria conta da testee em Configurações, o que exclui os resultados dele. Caso contrário, os resultados são excluídos automaticamente 12 meses depois do último envio do convite.",
    },
    {
        "key": "delete",
        "question": "Posso excluir minha conta?",
        "answer": "Sim, nas Configurações, a menos que você seja proprietário de uma empresa à qual outras pessoas tenham se juntado: primeiro torne outro membro proprietário dela ou exclua-a. Sua conta e seus dados são excluídos, com as empresas das quais você é o único membro e os créditos delas, então peça antes qualquer reembolso a que você tenha direito. Uma empresa mantém o registro do seu convite sem o seu e-mail, e os registros de compra ficam guardados como exige a lei contábil. Antes você pode baixar uma cópia dos seus dados.",
    },
    {
        "key": "company_delete",
        "question": "Posso excluir uma empresa?",
        "answer": "Sim, se você for o proprietário. As entrevistas, candidatos, resultados e créditos dela são perdidos para sempre e a recarga automática dela para, então peça antes qualquer reembolso a que você tenha direito. As cópias das questões dela que já estão no banco de perguntas compartilhado ficam.",
    },
    {
        "key": "report",
        "question": "Como relato um problema?",
        "answer": "Escreva para nós pela [página de contato](/contact) e cole o ID do que se trata: “copiar id” fica abaixo do nome de uma empresa, entrevista ou candidato, e o da sua conta, no menu da conta e em Configurações. Com o ID, encontramos na hora.",
    },
]
