# The FAQ in it; the {placeholders} are filled in by helpers/help.py (faq_values) with
# billing's prices and the number of languages. Questions not translated yet show in English
# (constants/faq/__init__.py).
FAQ = [
    {
        "key": "what",
        "question": "Cos'è testee?",
        "answer": "Un colloquio a scelta multipla a tempo creato dalla tua descrizione del ruolo, per qualsiasi ruolo. Usalo per selezionare i candidati prima di incontrarli, o come fase vera e propria dell'assunzione: in entrambi i casi vedi chi conosce davvero il lavoro.",
    },
    {
        "key": "roles",
        "question": "Per quali ruoli posso assumere?",
        "answer": "Qualsiasi ruolo in cui contano le conoscenze: assistenza, vendite, finanza, sanità, mestieri tecnici, ingegneria, marketing e altro. Se puoi descrivere il lavoro, testee può creare un colloquio per esso.",
    },
    {
        "key": "hiring",
        "question": "Come funziona?",
        "answer": "Incolla una descrizione del ruolo nella home page, indica il nome della tua azienda e controlla gli argomenti che propone testee. Poi invita i candidati: scrivi le loro email, incolla un elenco o carica un file. I candidati che non hanno iniziato dopo qualche giorno ricevono un promemoria. Ogni candidato riceve domande tutte sue, ciascuna con un timer, e vedi il suo punteggio e ogni risposta appena finisce.",
    },
    {
        "key": "templates",
        "question": "Posso partire da un colloquio già pronto?",
        "answer": "Sì. La scheda Modelli della tua azienda elenca colloqui già pronti per ruolo, che puoi cercare e filtrare per livello e lingua. Proprietari e amministratori possono copiarne uno nell'azienda subito, gratis, e poi modificarlo come qualsiasi colloquio; i candidati vengono addebitati come di consueto.",
    },
    {
        "key": "link",
        "question": "Posso mettere un colloquio in un annuncio di lavoro?",
        "answer": "Sì. Attiva il link condivisibile del colloquio nella sua scheda Impostazioni e incollalo nel tuo annuncio. Chiunque lo apra accede e svolge il colloquio, e ogni persona ti costa quanto un candidato invitato. Senza crediti rimasti, il link non accetta nuove persone. Il link si disattiva quando segni il colloquio come «Assunto».",
    },
    {
        "key": "preview",
        "question": "Posso provare un colloquio prima di invitare qualcuno?",
        "answer": "Sì. Apri il tuo colloquio come candidato dalla sua pagina, gratis: le anteprime non compaiono tra i tuoi candidati né nelle statistiche delle domande. Puoi anche fare una qualsiasi delle simulazioni di colloquio gratuite.",
    },
    {
        "key": "question_quality",
        "question": "Come controllate che le domande siano corrette?",
        "answer": "Prima che un colloquio sia pronto, una seconda IA controlla un campione delle sue risposte corrette. Dopo, risposte, voti e segnalazioni evidenziano le domande deboli, che vengono corrette o sostituite in background per i candidati che iniziano in seguito; i punteggi già assegnati non cambiano. Nella pagina di un argomento puoi leggere ogni domanda, e proprietari e amministratori possono disattivarne una, rigenerarla o segnare la sua risposta come sbagliata.",
    },
    {
        "key": "open-to-offers",
        "question": "Le aziende possono trovarmi attraverso le mie simulazioni?",
        "answer": "Solo se lo scegli tu. Attiva Aperto a nuove opportunità dopo una simulazione o nelle Impostazioni, indicando l'indirizzo del tuo profilo LinkedIn. Le aziende che hanno effettuato una ricarica su testee vedranno allora il tuo nome, il tuo profilo LinkedIn e il tuo ultimo risultato in ogni argomento dei loro colloqui su cui ti sei esercitato, e potranno invitarti a un colloquio. testee non ti classifica né ti raccomanda. Puoi disattivarlo in qualsiasi momento nelle Impostazioni e sparisci subito dall'elenco di ogni azienda; si disattiva anche un anno dopo l'ultima volta che l'hai attivato o hai salvato il tuo profilo LinkedIn.",
    },
    {
        "key": "cheating",
        "question": "I candidati possono usare l'IA o cercare le risposte?",
        "answer": "Ogni candidato riceve domande estratte a caso da ogni argomento, in un ordine tutto suo, con [un timer su ogni domanda](/guides/skills-test-timing-and-extra-time) gestito dal nostro server, quindi c'è poco tempo per cercare le risposte o chiedere a un'IA. Le schede di valutazione mostrano anche quando un candidato ha lasciato la pagina, copiato del testo o risposto troppo in fretta per aver letto la domanda. Quando ha finito, la sua pagina indica anche gli andamenti delle risposte che di solito lascia chi passa le domande a un'IA, come più o meno lo stesso tempo per ogni domanda o domande difficili giuste e facili sbagliate, e suggerisce domande a cui ha risposto correttamente da approfondire in un colloquio dal vivo. Un andamento è un motivo per fare domande, non una prova. Prima di iniziare, ogni candidato conferma anche che risponderà in autonomia, senza strumenti di IA né l'aiuto di altre persone, e la sua scheda di valutazione lo mostra.",
    },
    {
        "key": "practice",
        "question": "Posso esercitarmi gratis?",
        "answer": "Sì. La [pagina delle simulazioni](/practice) ha colloqui gratuiti per ruolo: accedi, scegli tempo standard, tempo doppio o senza limite di tempo, e alla fine vedi il tuo punteggio e ogni risposta giusta. Le tue simulazioni sono private; le aziende vedono un risultato solo se attivi Aperto a nuove opportunità.",
    },
    {
        "key": "voice",
        "question": "I candidati possono rispondere a voce?",
        "answer": "Sì, se l'azienda imposta un colloquio in modalità vocale, in una qualsiasi delle 23 lingue di testee; quanto bene legge e capisce dipende dalla lingua (la guida «Colloqui vocali in 23 lingue» lo mostra per ciascuna). Le domande vengono lette ad alta voce e i candidati rispondono a voce; ciò che dicono viene trasformato in testo e abbinato a un'opzione. testee non lo conserva; OpenAI, che lo fa per noi, può conservarlo per un massimo di 30 giorni, solo per controllare gli abusi salvo che la legge richieda un periodo più lungo. Le voci non vengono analizzate per tono o emozioni, e i candidati possono sempre toccare un'opzione.",
    },
    {
        "key": "extra_time",
        "question": "Un candidato può avere tempo extra?",
        "answer": "Sì. Prima che un candidato inizi, proprietari e amministratori possono dargli il 25%, il 50% o il 100% di tempo in più su ogni domanda, nella pagina del candidato; non viene registrato alcun motivo. Chi usa un link condivisibile chiede prima all'azienda un invito personale. Vedi [come impostare i tempi di un test di competenze](/guides/skills-test-timing-and-extra-time).",
    },
    {
        "key": "retake",
        "question": "Un candidato può ripetere un colloquio o tornare indietro?",
        "answer": "No. Un colloquio si svolge una sola volta, in un unico passaggio: un candidato può cambiare la sua scelta finché non preme «Domanda successiva», e a quel punto è definitiva. Una volta finito, non può essere invitato di nuovo a quel colloquio.",
    },
    {
        "key": "connection",
        "question": "Cosa succede se la connessione di un candidato cade o se chiude la pagina?",
        "answer": "Apre lo stesso link e continua. Nel frattempo l'orologio del nostro server continua a correre: una domanda il cui tempo scade mentre è assente conta come sbagliata, e il timer della domanda successiva parte quando viene mostrata. Un colloquio lasciato a metà termina da solo una volta trascorso il tempo totale più il 10%.",
    },
    {
        "key": "cost",
        "question": "Quanto costa?",
        "answer": "Generare colloqui è gratis. Ogni candidato che risponde ad almeno una domanda costa {candidate} crediti ({candidate_price}), e meno con i crediti di ricariche più grandi, fino a {cheapest_price}. La tua prima azienda riceve {company} crediti gratuiti, sufficienti per i suoi primi {company_candidates} candidati. I prezzi non includono IVA o imposte sulle vendite. La [pagina dei prezzi](/pricing) elenca ogni prezzo.",
    },
    {
        "key": "charged",
        "question": "Quando viene addebitato un candidato?",
        "answer": "Purché abbia risposto ad almeno una domanda: quando il suo colloquio termina (lo conclude lui, o il tempo scade mentre è assente), oppure quando lo revochi, il che cancella anche le sue risposte per sempre. Una domanda il cui tempo è scaduto senza una risposta scelta non conta. I suoi crediti vengono messi da parte quando lo inviti (con un link, quando inizia) e tornano se lo revochi prima che risponda a qualcosa, se non inizia mai e l'invito scade dopo 30 giorni, o se il suo colloquio termina senza alcuna risposta.",
    },
    {
        "key": "compare_hiring",
        "question": "Come si confronta il prezzo con altri strumenti di valutazione?",
        "answer": "Molti strumenti di valutazione sono venduti in abbonamento mensile o annuale, che paghi anche se non valuti nessuno. Con testee paghi solo per candidato, con crediti acquistati in anticipo: {candidate} crediti ({candidate_price}), senza contratto, senza costi per utente e senza pagare per generare un colloquio. Un’azienda che invita {example_candidates} candidati al mese paga circa {example_year_price} all’anno, tasse escluse. Se valuti molti candidati ogni mese, un abbonamento può costare meno, quindi confronta con i tuoi numeri.",
    },
    {
        "key": "top_up",
        "question": "Come acquisto i crediti?",
        "answer": "Proprietari e amministratori effettuano la ricarica nella pagina di ricarica, nel menu dell'account, da {min_candidates} a {max_candidates} candidati alla volta. Paddle gestisce il pagamento, aggiunge l'eventuale IVA o imposta sulle vendite ed emette la ricevuta o la fattura; la fattura di ogni ricarica si trova anche nella scheda Fatturazione dell'azienda.",
    },
    {
        "key": "expire",
        "question": "I crediti scadono?",
        "answer": "No. I crediti non scadono mai, e non ci sono abbonamenti a pagamento. Se attivi la ricarica automatica facoltativa, Paddle salva la tua carta come abbonamento da {zero_price}; paghi solo le ricariche che effettua.",
    },
    {
        "key": "auto_top_up",
        "question": "I crediti possono ricaricarsi automaticamente?",
        "answer": "Sì, se un proprietario o un amministratore la attiva nella pagina di ricarica: scegli una ricarica e il saldo sotto il quale ricaricare, e spunta cosa addebita e quando. Ogni volta che il saldo disponibile dell'azienda scende sotto quel livello, la carta salvata viene addebitata, più le eventuali imposte, e i proprietari e gli amministratori dell'azienda ricevono un'email. Un addebito rifiutato viene ritentato dopo 1, 3 e 7 giorni; poi la ricarica automatica va in pausa finché la carta non viene aggiornata. Disattivarla dove l'hai attivata la interrompe subito.",
    },
    {
        "key": "currency",
        "question": "In che valuta pago?",
        "answer": "I prezzi sono nella valuta locale in Canada, Australia, Israele, Polonia, Svizzera, Giappone, Corea del Sud, Taiwan, Hong Kong, Thailandia, Singapore e India; in euro nel resto dell'UE e in Islanda, nel Liechtenstein e in Norvegia; in sterline nel Regno Unito; e in dollari statunitensi altrove. Il tuo account e ogni azienda mantengono la valuta del paese in cui sono stati creati o usati per la prima volta, ovunque tu viaggi: cambia la tua nelle Impostazioni e quella di un'azienda nella pagina di ricarica (proprietari e amministratori). Le ricariche di un'azienda, anche quelle automatiche, vengono sempre addebitate nella valuta dell'azienda.",
    },
    {
        "key": "referrals",
        "question": "Posso guadagnare crediti segnalando un'azienda?",
        "answer": "Sì. Condividi il link della scheda Referral della tua azienda: quando una nuova azienda creata tramite il link effettua la prima ricarica, di qualsiasi importo, entrambe le aziende ricevono {referral} crediti, fino a 25 segnalazioni all'anno. Conta solo la prima azienda dell'email del suo proprietario, e le tue aziende non contano.",
    },
    {
        "key": "refunds",
        "question": "Posso avere un rimborso?",
        "answer": "Sì, per i crediti acquistati negli ultimi 14 giorni e non ancora spesi: tramite Paddle o scrivendoci. I crediti gratuiti, come il regalo di benvenuto, non sono rimborsabili e contano come spesi per primi. I [termini](/terms) riportano i dettagli.",
    },
    {
        "key": "scorecards",
        "question": "Cosa mostrano le schede di valutazione?",
        "answer": "Ogni risposta, se era giusta e quanto tempo ha richiesto. Il punteggio è la percentuale di punti ottenuti: ogni domanda vale un punto, e una domanda in cui selezionare tutte le risposte corrette ne dà una parte per ogni opzione corretta selezionata, e niente se ne è selezionata una sbagliata. I punteggi compaiono in verde o in rosso rispetto alla soglia di superamento che hai impostato per il colloquio. Le schede segnalano anche risposte troppo veloci per aver letto la domanda, le uscite dalla pagina e i tentativi di copia.",
    },
    {
        "key": "reports",
        "question": "Posso condividere i risultati con un responsabile delle assunzioni?",
        "answer": "Sì. Scarica un report PDF per un candidato o per tutti i candidati di un colloquio, invialo via email direttamente da testee, oppure manda un breve riepilogo su WhatsApp, Telegram, Viber o LINE.",
    },
    {
        "key": "action_log",
        "question": "Posso vedere chi ha fatto cosa nella mia azienda?",
        "answer": "Sì, se sei il proprietario dell'azienda. La sua scheda Registro attività elenca ciò che hanno fatto i membri, dal più recente: invitare o rimuovere candidati, vedere i risultati, modificare colloqui, team, fatturazione e integrazioni, con chi l'ha fatto, quando e se l'ha fatto per suo conto l'assistente, un'app di IA, l'API o un ATS. Puoi filtrarlo per membro, tipo di azione e date, e scaricarlo come file CSV. Le attività vengono conservate per 12 mesi. Le azioni di una chiave API compaiono con il nome della chiave.",
    },
    {
        "key": "bias_audit",
        "question": "Posso esportare i risultati per un audit sui bias?",
        "answer": "Sì, se sei il proprietario dell'azienda. La scheda Registro attività ha una «Esportazione per audit sui bias»: un file CSV di ogni candidato che ha finito, per tutti i colloqui o uno solo e tra le date scelte, con il punteggio, la soglia di superamento, se l'ha superata e se ha ottenuto più della mediana del colloquio. testee non ha dati su sesso, razza o etnia, quindi aggiungi le risposte che i tuoi candidati hanno fornito su sé stessi in base alla loro email, e rimuovi le email prima di dare il file al tuo auditor indipendente.",
    },
    {
        "key": "notes",
        "question": "Il mio team può prendere note su un colloquio?",
        "answer": "Sì. Ogni colloquio ha una scheda Note in cui il tuo team scrive note in testo semplice sulla selezione, ad esempio chi chiamare dopo o, per un'agenzia, per quale cliente è il colloquio. Ogni membro può scrivere note, anche i visualizzatori, e modificare le proprie; possono eliminarne una l'autore, i proprietari e gli amministratori. Proprietari e amministratori possono fissare una nota, che compare poi sotto il nome del colloquio. I candidati non vedono mai le note.",
    },
    {
        "key": "team",
        "question": "Posso aggiungere il mio team?",
        "answer": "Sì, e i membri non costano nulla. Nella scheda Team dell'azienda, il proprietario invita ogni persona via email come amministratore o visualizzatore. Gli amministratori fanno tutto tranne gestire il team, vedere il registro attività ed eliminare l'azienda. I visualizzatori vedono colloqui e risultati, condividono i report e scrivono note, ma non cambiano altro e non possono ricaricare. Un account può possedere più aziende, ciascuna con il proprio team e i propri crediti.",
    },
    {
        "key": "integrations",
        "question": "testee funziona con il mio ATS o con altri strumenti?",
        "answer": "Sì, senza costi aggiuntivi; i candidati vengono addebitati come di consueto. Proprietari e amministratori collegano Workable, Greenhouse, Teamtailor, Recruitee o Breezy HR nella scheda Integrazioni dell'azienda con una chiave dell'ATS, poi associano un'offerta di lavoro a un colloquio e a una fase: i candidati che sposti in quella fase ricevono il colloquio, e i loro risultati tornano nell'ATS ([come collegare i test di competenze al tuo ATS](/guides/ats-integration-skills-tests)). Slack può pubblicare le notifiche della tua azienda in un canale, e l'API permette alla tua piattaforma di creare colloqui, invitare e gestire candidati e ricevere i loro risultati, con ogni chiave API limitata a ciò che spunti per lei; consulta la [Documentazione API](/api-docs).",
    },
    {
        "key": "slack",
        "question": "Come funziona l'integrazione con Slack?",
        "answer": "Un proprietario o un amministratore sceglie «Aggiungi a Slack» nella scheda Integrazioni dell'azienda e seleziona un canale, poi sceglie quali notifiche arrivano lì, ad esempio un candidato ha finito, un invito non consegnato, un candidato dell'ATS non invitato o una nuova nota. È gratis.",
    },
    {
        "key": "api_keys",
        "question": "Come funzionano le chiavi API?",
        "answer": "Proprietari e amministratori le creano nella pagina API dell'azienda, in Integrazioni. Spunti cosa può fare ogni chiave, scegli quando scade (tra 1, 3, 6 o 12 mesi, o mai) e puoi limitarla agli indirizzi IP consentiti. Una chiave viene mostrata una sola volta. Un'azienda può fare 60 richieste al minuto. La [documentazione per sviluppatori](/api-docs) descrive ogni chiamata.",
    },
    {
        "key": "webhooks",
        "question": "testee può avvisare il mio sistema quando un candidato finisce?",
        "answer": "Sì, con i webhook, configurati nella pagina API dell'azienda. testee chiama il tuo indirizzo quando un candidato inizia, finisce (con i suoi risultati), non viene raggiunto, scade o viene rimosso, e quando un colloquio è pronto, e firma ogni chiamata con il tuo secret. Una chiamata non riuscita viene ritentata per 3 giorni; poi il webhook va in pausa finché un evento di test non va a buon fine. Ogni webhook ha un log dei suoi ultimi invii. Vedi la [documentazione dei webhook](/api-docs?tab=webhooks).",
    },
    {
        "key": "embed",
        "question": "I candidati possono svolgere il colloquio sul mio sito?",
        "answer": "Sì, con l'SDK di testee: uno script che mostra il colloquio dentro la tua pagina, sui siti che consenti nella pagina API dell'azienda. Il tuo server invita ogni candidato tramite l'API con l'accesso disattivato, così non serve un account testee e testee non gli invia email. Non costa nulla in più; i candidati vengono addebitati come di consueto. Vedi la [documentazione dell'SDK](/api-docs?tab=sdk).",
    },
    {
        "key": "ai_apps",
        "question": "Posso usare testee da Claude, ChatGPT o da un mio agente IA?",
        "answer": "Sì. Aggiungi testee a Claude o ChatGPT come connettore (i passaggi sono nella scheda Integrazioni della tua azienda) e consenti l'accesso su testee, in sola lettura o anche per apportare modifiche. L'app lavora quindi con le tue aziende, i colloqui e i risultati dei candidati a tuo nome, con i tuoi permessi. L'account o un'azienda si eliminano solo in testee. Ciò che l'app legge arriva al suo fornitore, secondo i termini di quell'app. Puoi scollegarla in qualsiasi momento nella stessa scheda, e proprietari e amministratori possono disattivare le app di IA per un'azienda. Si collegano anche altre app di IA e gli agenti che crei tu: la [scheda MCP](/api-docs?tab=mcp) della documentazione per sviluppatori ha i passaggi e agenti di esempio, e un agente su un server può accedere con una chiave API che ha il permesso per gli agenti IA, facendo solo ciò che consentono gli altri permessi della chiave. La [guida ad agenti IA, MCP e API](/guides/ai-agents-mcp-and-api) spiega a cosa serve ciascuno.",
    },
    {
        "key": "candidates",
        "question": "Cosa vedono i candidati?",
        "answer": "Il nome e il logo della tua azienda, con i colori e i caratteri della tua azienda (impostati nella sua scheda Brand), cosa aspettarsi prima di iniziare, poi una domanda a tempo alla volta. Il colloquio non mostra mai loro il punteggio né se una risposta era giusta; solo il download dei propri dati contiene il punteggio.",
    },
    {
        "key": "brand",
        "question": "I colloqui possono avere il brand della mia azienda?",
        "answer": "Sì, senza costi aggiuntivi. Nella scheda Brand dell'azienda, proprietari e amministratori impostano il logo, i colori per il tema chiaro e scuro, i caratteri e l'arrotondamento degli angoli. I candidati li vedono per tutto il colloquio, senza l'intestazione e il piè di pagina di testee, e il logo compare anche nelle email e nei report.",
    },
    {
        "key": "candidate_account",
        "question": "I candidati hanno bisogno di un account?",
        "answer": "Sì, ed è gratuito: accedono con Google, LinkedIn o GitHub, con l'email verificata che hai invitato, così un invito inoltrato non serve a nessun altro. Con un link condivisibile va bene qualsiasi email verificata. L'eccezione è un invito creato dalla tua piattaforma tramite l'API, che può saltare l'accesso.",
    },
    {
        "key": "verified",
        "question": "Cosa significa la spunta di verifica?",
        "answer": "Che un proprietario o un amministratore dell'azienda ha effettuato l'accesso con un'email di lavoro sul sito dell'azienda, ad esempio nome@acme.com, e che poi il nostro team ha esaminato l'azienda. Aggiungi il sito con Verifica nell'intestazione della tua azienda; i servizi email gratuiti non contano. Finché la revisione è in attesa, il tuo team vede un orologio accanto al nome, e rinominare l'azienda la rimanda in revisione. La spunta compare accanto al nome della tua azienda, anche negli inviti.",
    },
    {
        "key": "languages",
        "question": "Quali lingue sono supportate?",
        "answer": "{count} lingue, per il sito, i colloqui e le email. Scegli la lingua in cui è scritto un colloquio, qualunque sia la lingua della descrizione del ruolo.",
    },
    {
        "key": "mira",
        "question": "Chi è Mira?",
        "answer": "L'assistente IA di testee: un'IA, non una persona, e le sue risposte possono essere sbagliate. Aprila con «chiedi a Mira» nell'intestazione. I visitatori possono chiedere qualsiasi cosa su testee. Dopo l'accesso, Mira legge anche le tue aziende con i tuoi permessi e fa le modifiche che chiedi, ciascuna solo dopo la tua conferma. Chiedere a Mira non consuma crediti, e i candidati non possono usarla durante un colloquio.",
    },
    {
        "key": "search",
        "question": "Posso fare ricerche su testee?",
        "answer": "Sì. La ricerca nell'intestazione trova, mentre scrivi, le tue aziende, i colloqui e i candidati (per nome o email), e le pagine, le guide, i confronti, le note legali, le domande delle FAQ e i test di competenze del sito. Senza accesso, trova solo ciò che è pubblico.",
    },
    {
        "key": "privacy",
        "question": "Cosa succede alle descrizioni dei ruoli e alle risposte?",
        "answer": "Le descrizioni dei ruoli servono a creare i colloqui della tua azienda, e le risposte dei candidati a valutarli per la tua azienda. Le domande generate da testee possono anche essere riutilizzate nei colloqui e nelle simulazioni di altre aziende, senza nulla che identifichi te, la tua azienda o chiunque altro; puoi escludere da questo riutilizzo le domande di un colloquio nelle sue impostazioni. testee ricava inoltre dalle risposte date alle domande tendenze generali e anonimizzate sulla loro qualità, per migliorare il modo in cui le domande vengono generate. L'[informativa sulla privacy](/privacy) spiega cosa conserviamo, per quanto tempo e i diritti di ciascuno.",
    },
    {
        "key": "question_bank",
        "question": "Le domande del mio colloquio vengono condivise con altre aziende?",
        "answer": "Per impostazione predefinita, sì. Una domanda generata da testee può entrare nella sua banca domande condivisa dopo aver ricevuto alcune risposte e aver superato i controlli che non nomini organizzazioni, persone o recapiti; la copia non contiene nulla che identifichi la tua azienda. Proprietari e amministratori possono escludere le domande di un colloquio nella sua scheda Impostazioni; non esiste un'impostazione per tutta l'azienda. Le domande già riutilizzate restano, anche se la tua azienda viene eliminata.",
    },
    {
        "key": "ai_training",
        "question": "I nostri dati vengono usati per addestrare modelli di IA?",
        "answer": "OpenAI, su cui si basa l'IA di testee, non addestra i suoi modelli su ciò che le inviamo, secondo i suoi termini API; può conservarlo fino a 30 giorni, solo per controllare gli abusi, a meno che la legge non richieda di più. testee ricava da sé tendenze generali e anonimizzate sulla qualità delle domande, per migliorare il modo in cui vengono generate.",
    },
    {
        "key": "data_storage",
        "question": "Dove sono conservati i nostri dati?",
        "answer": "Su Google Cloud, in Belgio. Alcuni fornitori trattano dati negli Stati Uniti, come OpenAI e Resend, in base al quadro UE-USA per la protezione dei dati personali o alle clausole contrattuali tipo della Commissione europea. La pagina [Fiducia e sicurezza](/trust) li elenca tutti.",
    },
    {
        "key": "eu_ai_law",
        "question": "È legale usare l'IA per la preselezione dei candidati nell'UE?",
        "answer": "Sì, con delle regole. Secondo il regolamento europeo sull'IA (AI Act), gli strumenti che valutano i candidati sono molto probabilmente ad alto rischio, con obblighi dal 2 dicembre 2027, e il GDPR si applica già: una persona prende la decisione di assunzione, i candidati vengono informati che si usa l'IA e si conserva una documentazione. testee funziona così: l'IA scrive le domande, le persone della tua azienda esaminano i risultati e decidono, e i candidati vengono informati prima di iniziare. Questa non è una consulenza legale; [Usare l'IA nella selezione del personale è legale nell'UE?](/guides/is-ai-hiring-legal-in-the-eu) spiega le regole e le date.",
    },
    {
        "key": "uk_us",
        "question": "Possiamo usare testee per candidati nel Regno Unito e negli Stati Uniti?",
        "answer": "Sì. L'accordo sul trattamento dei dati copre la legge del Regno Unito e degli Stati Uniti, e le istruzioni per le aziende e i modelli di informativa per i candidati (con versioni per New York City, l'Illinois e il Colorado) coprono ciò che devi comunicare ai candidati. Per posizioni a New York City, usalo solo dopo aver fatto ciò che la Local Law 144 ti richiede: un audit indipendente sui bias nell'anno precedente all'utilizzo, la pubblicazione della sua sintesi e un avviso ai candidati 10 giorni lavorativi prima. L'export per l'audit dei bias del Registro attività dà al tuo auditor il punteggio e l'esito di ogni candidato che ha finito, da abbinare alle risposte che i tuoi candidati hanno dichiarato loro stessi.",
    },
    {
        "key": "emails",
        "question": "Quali email invia testee e come posso interromperle?",
        "answer": "Le email di servizio, come inviti, report, email di fatturazione e modifiche ai nostri termini, vengono sempre inviate. Le altre, come il riepilogo attività giornaliero, i promemoria, le novità sul prodotto e le offerte, le scegli nelle Impostazioni, alla voce Email, oppure le interrompi con il link \"Annulla l'iscrizione\" in ogni email. I candidati possono interrompere le email della tua azienda, o i promemoria di un colloquio, con i link nei loro inviti e promemoria. Le novità di testee compaiono nelle tue notifiche, la campanella in alto; quelle più importanti arrivano anche via email come novità sul prodotto, solo finché quell'impostazione è attiva.",
    },
    {
        "key": "data_export",
        "question": "Posso scaricare i miei dati?",
        "answer": "Sì. «Scarica i miei dati» nelle Impostazioni ti dà un file JSON con ciò che testee conserva su di te; per i colloqui di un'azienda contiene le tue risposte e i tuoi punteggi, ma non quali risposte erano giuste. Non esiste un'esportazione di un'intera azienda: il proprietario può scaricare il registro attività e i membri possono scaricare i report PDF dei candidati.",
    },
    {
        "key": "candidate_data",
        "question": "Come può un candidato far eliminare i suoi dati?",
        "answer": "Chiedendolo all'azienda che lo ha invitato: revocare un candidato che ha iniziato cancella lui e i suoi risultati per sempre. Oppure eliminando il suo account testee nelle Impostazioni, il che elimina i suoi risultati. Altrimenti i risultati vengono eliminati automaticamente 12 mesi dopo l'ultimo invio dell'invito.",
    },
    {
        "key": "delete",
        "question": "Posso eliminare il mio account?",
        "answer": "Sì, nelle Impostazioni, a meno che tu non sia proprietario di un'azienda a cui si sono uniti altri: prima rendi proprietario un altro membro, oppure eliminala. Il tuo account e i tuoi dati vengono eliminati, con le aziende di cui sei l'unico membro e i loro crediti, quindi prima chiedi eventuali rimborsi che ti spettano. Un'azienda conserva la registrazione del tuo invito senza la tua email, e i dati degli acquisti restano come richiesto dalla normativa contabile. Prima puoi scaricare una copia dei tuoi dati.",
    },
    {
        "key": "company_delete",
        "question": "Posso eliminare un'azienda?",
        "answer": "Sì, se ne sei il proprietario. I suoi colloqui, candidati, risultati e crediti spariscono per sempre e la sua ricarica automatica si ferma, quindi prima chiedi eventuali rimborsi che ti spettano. Le copie delle sue domande già nella banca domande condivisa restano.",
    },
    {
        "key": "report",
        "question": "Come segnalo un problema?",
        "answer": "Scrivici dalla [pagina dei contatti](/contact) e incolla l'ID di ciò di cui si tratta: «copia id» è sotto il nome di un'azienda, di un colloquio o di un candidato, e quello del tuo account è nel menu dell'account e nelle Impostazioni. Con l'ID lo troviamo subito.",
    },
]
