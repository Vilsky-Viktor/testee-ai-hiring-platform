# The FAQ in nl; the {placeholders} are filled in by helpers/help.py (faq_values) with
# billing's prices and the number of languages. Questions not translated yet show in English
# (constants/faq/__init__.py).
FAQ = [
    {
        "key": "what",
        "question": "Wat is testee?",
        "answer": "Een meerkeuze-interview met tijdslimiet, gemaakt op basis van je functieomschrijving, voor elke functie. Gebruik het om kandidaten te screenen voordat je ze ontmoet, of als stap in de werving zelf: hoe dan ook zie je wie het vak echt kent.",
    },
    {
        "key": "roles",
        "question": "Voor welke functies kan ik werven?",
        "answer": "Elke functie waarin kennis telt: support, sales, financiën, zorg, technische vakken, engineering, marketing en meer. Als je de functie kunt beschrijven, kan testee er een interview voor maken.",
    },
    {
        "key": "hiring",
        "question": "Hoe werkt het?",
        "answer": "Plak een functieomschrijving op de startpagina, geef je bedrijf een naam en controleer de onderwerpen die testee voorstelt. Nodig daarna kandidaten uit: typ hun e-mailadressen, plak een lijst of upload een bestand. Kandidaten die na een paar dagen nog niet zijn begonnen, krijgen één herinnering. Elke kandidaat krijgt eigen vragen met een timer bij elke vraag, en je ziet hun score en elk antwoord zodra ze klaar zijn.",
    },
    {
        "key": "templates",
        "question": "Kan ik beginnen met een kant-en-klaar interview?",
        "answer": "Ja. Het tabblad Sjablonen van je bedrijf toont kant-en-klare interviews per functie, die je kunt doorzoeken en filteren op niveau en taal. Eigenaren en beheerders kunnen er meteen en gratis een naar het bedrijf kopiëren en het daarna wijzigen zoals elk interview; voor kandidaten betaal je zoals gewoonlijk.",
    },
    {
        "key": "link",
        "question": "Kan ik een interview in een vacature zetten?",
        "answer": "Ja. Zet de deelbare link van het interview aan op het tabblad Instellingen en plak hem in je vacature. Iedereen die hem opent, logt in en doet het interview, en je betaalt per persoon hetzelfde als voor een uitgenodigde kandidaat. Zonder credits neemt de link geen nieuwe mensen meer aan. De link gaat uit wanneer je het interview markeert als aangenomen.",
    },
    {
        "key": "preview",
        "question": "Kan ik een interview proberen voordat ik iemand uitnodig?",
        "answer": "Ja. Open je interview gratis als kandidaat vanaf de pagina ervan: voorbeelden verschijnen niet tussen je kandidaten of in de vraagstatistieken. Je kunt ook elk gratis oefeninterview doen.",
    },
    {
        "key": "question_quality",
        "question": "Hoe controleren jullie of de vragen kloppen?",
        "answer": "Voordat een interview klaar is, controleert een tweede AI een steekproef van de antwoordsleutels. Daarna wijzen antwoorden, stemmen en meldingen op zwakke vragen, die op de achtergrond worden gecorrigeerd of vervangen voor kandidaten die daarna beginnen; al gegeven scores veranderen niet. Op de pagina van een onderwerp kun je elke vraag lezen, en eigenaren en beheerders kunnen er een uitschakelen, opnieuw genereren of het antwoord ervan als fout markeren.",
    },
    {
        "key": "open-to-offers",
        "question": "Kunnen bedrijven me vinden via mijn oefeningen?",
        "answer": "Alleen als je daarvoor kiest. Zet Open voor nieuwe kansen aan na een oefenronde of in Instellingen, met het adres van je LinkedIn-profiel. Bedrijven die op testee hebben opgewaardeerd, zien dan je naam, je LinkedIn-profiel en je nieuwste oefenresultaat op elk onderwerp van hun interviews dat je hebt geoefend, en kunnen je uitnodigen voor een interview. testee rangschikt je niet en beveelt je niet aan. Zet het op elk moment uit in Instellingen, en je verdwijnt meteen uit de lijst van elk bedrijf; het stopt ook een jaar nadat je het voor het laatst hebt aangezet of je LinkedIn-profiel hebt opgeslagen.",
    },
    {
        "key": "cheating",
        "question": "Kunnen kandidaten AI gebruiken of de antwoorden opzoeken?",
        "answer": "Elke kandidaat krijgt vragen die willekeurig uit elk onderwerp zijn gekozen, in een eigen volgorde, met [een timer bij elke vraag](/guides/skills-test-timing-and-extra-time) die onze server bijhoudt, dus er is weinig tijd om antwoorden op te zoeken of het een AI te vragen. De resultaten laten ook zien wanneer een kandidaat de pagina verliet, tekst kopieerde of te snel antwoordde om de vraag te hebben gelezen. Zodra ze klaar zijn, wijst de pagina van de kandidaat ook op antwoordpatronen die vaak ontstaan als iemand de vragen aan een AI doorgeeft en de antwoorden overneemt, zoals ongeveer even lang bij elke vraag of moeilijke vragen goed terwijl makkelijke fout waren, en stelt vragen voor die de kandidaat goed had, om in een live gesprek op door te vragen. Een patroon is een reden om door te vragen, geen bewijs. Voordat ze beginnen, bevestigt elke kandidaat ook dat die de vragen zelf beantwoordt, zonder AI-tools of hulp van anderen, en de resultaten laten dat zien.",
    },
    {
        "key": "practice",
        "question": "Kan ik gratis oefenen?",
        "answer": "Ja. De [oefenpagina](/practice) heeft gratis interviews per functie: log in, kies standaardtijd, dubbele tijd of geen tijdslimiet, en zie aan het eind je score en elk goed antwoord. Je oefeningen zijn privé; bedrijven zien alleen een resultaat als je Open voor nieuwe kansen aanzet.",
    },
    {
        "key": "voice",
        "question": "Kunnen kandidaten met hun stem antwoorden?",
        "answer": "Ja, als het bedrijf een interview op spraakmodus zet, in elk van de 23 talen van testee; hoe goed die voorleest en verstaat, verschilt per taal (de gids 'Spraakmodus in 23 talen' laat het per taal zien). De vragen worden voorgelezen en kandidaten antwoorden hardop; wat ze zeggen, wordt omgezet in tekst en gekoppeld aan een optie. testee slaat het niet op; OpenAI, dat dit voor ons doet, mag het maximaal 30 dagen bewaren, alleen om op misbruik te controleren, tenzij de wet een langere termijn vereist. Stemmen worden niet geanalyseerd op toon of emotie, en kandidaten kunnen altijd in plaats daarvan tikken.",
    },
    {
        "key": "extra_time",
        "question": "Kan een kandidaat extra tijd krijgen?",
        "answer": "Ja. Voordat een kandidaat begint, kunnen eigenaren en beheerders op de pagina van de kandidaat 25%, 50% of 100% meer tijd per vraag geven; er wordt geen reden vastgelegd. Wie een deelbare link gebruikt, vraagt het bedrijf eerst om een persoonlijke uitnodiging. Zie [hoe je de tijd van een vaardigheidstest bepaalt](/guides/skills-test-timing-and-extra-time).",
    },
    {
        "key": "retake",
        "question": "Kan een kandidaat een interview opnieuw doen of teruggaan?",
        "answer": "Nee. Een interview doe je één keer, in één keer door: een kandidaat kan zijn keuze wijzigen tot hij op 'Volgende vraag' drukt, en dan is die definitief. Als hij klaar is, kan hij niet opnieuw voor dat interview worden uitgenodigd.",
    },
    {
        "key": "connection",
        "question": "Wat als de verbinding van een kandidaat wegvalt of hij de pagina sluit?",
        "answer": "Hij opent dezelfde link en gaat verder. De klok van onze server loopt ondertussen door: een vraag waarvan de tijd afloopt terwijl hij weg is, telt als fout, en de timer van de volgende vraag start wanneer die wordt getoond. Een onafgemaakt interview eindigt vanzelf zodra de totale tijd plus 10% is verstreken.",
    },
    {
        "key": "cost",
        "question": "Wat kost het?",
        "answer": "Interviews genereren is gratis. Elke kandidaat die minstens één vraag beantwoordt, kost {candidate} credits ({candidate_price}), en minder met credits uit grotere opwaarderingen, tot {cheapest_price}. Je eerste bedrijf krijgt {company} gratis credits, genoeg voor de eerste {company_candidates} kandidaten. Prijzen zijn exclusief btw en sales tax. De [prijzenpagina](/pricing) toont elke prijs.",
    },
    {
        "key": "charged",
        "question": "Wanneer wordt er voor een kandidaat betaald?",
        "answer": "Als hij minstens één vraag heeft beantwoord: wanneer zijn interview eindigt (hij rondt het af, of de tijd loopt af terwijl hij weg is), of wanneer je hem intrekt, waarmee ook zijn antwoorden definitief worden gewist. Een vraag waarvan de tijd afliep zonder dat er een antwoord is gekozen, telt niet mee. Zijn credits worden bij de uitnodiging gereserveerd (via een link: wanneer hij begint) en komen terug als je hem intrekt voordat hij iets beantwoordt, als hij nooit begint en de uitnodiging na 30 dagen verloopt, of als zijn interview eindigt zonder dat hij iets heeft beantwoord.",
    },
    {
        "key": "compare_hiring",
        "question": "Hoe verhoudt de prijs zich tot andere assessmenttools?",
        "answer": "Veel assessmenttools worden verkocht als maand- of jaarabonnement, dat je ook betaalt als je niemand test. Bij testee betaal je alleen per kandidaat, met vooraf gekochte credits: {candidate} credits ({candidate_price}), zonder contract, zonder kosten per gebruiker en zonder te betalen voor het maken van een interview. Een bedrijf dat {example_candidates} kandidaten per maand uitnodigt, betaalt ongeveer {example_year_price} per jaar exclusief belasting. Test je elke maand veel kandidaten, dan kan een abonnement goedkoper zijn, dus vergelijk met je eigen cijfers.",
    },
    {
        "key": "top_up",
        "question": "Hoe koop ik credits?",
        "answer": "Eigenaren en beheerders waarderen op via de opwaardeerpagina, in het accountmenu, voor {min_candidates} tot {max_candidates} kandidaten tegelijk. Paddle verwerkt de betaling, rekent eventuele btw of sales tax en maakt de kwitantie of factuur; de factuur van elke opwaardering staat ook op het tabblad Facturering van het bedrijf.",
    },
    {
        "key": "expire",
        "question": "Verlopen credits?",
        "answer": "Nee. Credits verlopen nooit, en er zijn geen betaalde abonnementen. Zet je het optionele automatisch opwaarderen aan, dan bewaart Paddle je kaart als abonnement van {zero_price}; je betaalt alleen de opwaarderingen die het doet.",
    },
    {
        "key": "auto_top_up",
        "question": "Kunnen credits automatisch worden opgewaardeerd?",
        "answer": "Ja, als een eigenaar of beheerder het aanzet op de opwaardeerpagina: kies een opwaardering en het saldo waaronder wordt aangevuld, en vink aan wat het afschrijft en wanneer. Telkens als het beschikbare saldo van het bedrijf onder dat niveau zakt, wordt de opgeslagen kaart belast, plus eventuele belasting, en krijgen de eigenaren en beheerders van het bedrijf een e-mail. Een geweigerde afschrijving wordt na 1, 3 en 7 dagen opnieuw geprobeerd; daarna pauzeert automatisch opwaarderen tot de kaart is bijgewerkt. Zet je het uit waar je het aanzette, dan stopt het meteen.",
    },
    {
        "key": "currency",
        "question": "In welke valuta betaal ik?",
        "answer": "Prijzen zijn in de lokale valuta in Canada, Australië, Israël, Polen, Zwitserland, Japan, Zuid-Korea, Taiwan, Hongkong, Thailand, Singapore en India; in euro in de rest van de EU en in IJsland, Liechtenstein en Noorwegen; in ponden in het Verenigd Koninkrijk; en elders in Amerikaanse dollars. Je account en elk bedrijf houden de valuta van het land waarin ze zijn aangemaakt of voor het eerst zijn gebruikt, waar je ook naartoe reist: wijzig de jouwe in Instellingen, en die van een bedrijf op de opwaardeerpagina (eigenaren en beheerders). De opwaarderingen van een bedrijf, ook de automatische, worden altijd in de valuta van het bedrijf in rekening gebracht.",
    },
    {
        "key": "referrals",
        "question": "Kan ik credits verdienen door een bedrijf door te verwijzen?",
        "answer": "Ja. Deel de link op het tabblad Doorverwijzingen van je bedrijf: wanneer een nieuw bedrijf dat via die link is aangemaakt voor het eerst opwaardeert, met welk bedrag dan ook, krijgen beide bedrijven {referral} credits, voor maximaal 25 doorverwijzingen per jaar. Alleen het eerste bedrijf van het e-mailadres van de eigenaar telt, en je eigen bedrijven tellen niet.",
    },
    {
        "key": "refunds",
        "question": "Kan ik mijn geld terugkrijgen?",
        "answer": "Ja, voor credits die je de afgelopen 14 dagen hebt gekocht en nog niet hebt besteed: via Paddle of door ons te schrijven. Gratis credits, zoals het welkomstcadeau, worden niet terugbetaald en tellen als eerst besteed. De [voorwaarden](/terms) geven de details.",
    },
    {
        "key": "scorecards",
        "question": "Wat laat een scorekaart zien?",
        "answer": "Elk antwoord, of het goed was en hoe lang het duurde. De score is het percentage behaalde punten: elke vraag is één punt waard, en een vraag waarbij je alle juiste opties aanvinkt levert een deel daarvan op voor elke aangevinkte juiste optie, en niets als er een foute is aangevinkt. Scores zijn groen of rood ten opzichte van de slaaggrens die je voor het interview hebt ingesteld. De scorekaart markeert ook antwoorden die te snel waren om de vraag te hebben gelezen, keren dat de kandidaat de pagina verliet, en kopieerpogingen.",
    },
    {
        "key": "reports",
        "question": "Kan ik resultaten delen met een hiring manager?",
        "answer": "Ja. Download een PDF-rapport voor één kandidaat of voor alle kandidaten van een interview, mail het rechtstreeks vanuit testee, of stuur een korte samenvatting via WhatsApp, Telegram, Viber of LINE.",
    },
    {
        "key": "action_log",
        "question": "Kan ik zien wie wat heeft gedaan in mijn bedrijf?",
        "answer": "Ja, als je eigenaar van het bedrijf bent. Het tabblad Actielog toont wat de leden hebben gedaan, nieuwste eerst: kandidaten uitnodigen of verwijderen, resultaten bekijken, en interviews, het team, de facturering en integraties wijzigen, met wie het deed, wanneer en of de assistent, een AI-app, de API of een ATS het namens diegene deed. Je kunt filteren op lid, soort actie en datums, en het downloaden als CSV-bestand. Acties worden 12 maanden bewaard. De acties van een API-sleutel staan onder de naam van de sleutel.",
    },
    {
        "key": "bias_audit",
        "question": "Kan ik resultaten exporteren voor een bias-audit?",
        "answer": "Ja, als je eigenaar van het bedrijf bent. Het tabblad Actielog heeft de 'Export voor bias-audit': een CSV-bestand met elke kandidaat die klaar is, voor alle interviews of één interview en tussen gekozen datums, met de score, de slaaggrens, of de kandidaat geslaagd is en of de score boven de mediaan van het interview ligt. testee heeft geen gegevens over geslacht, ras of etniciteit, dus je voegt de antwoorden toe die je kandidaten zelf hebben opgegeven, op basis van hun e-mailadres, en verwijdert de e-mailadressen voordat je het bestand aan je onafhankelijke auditor geeft.",
    },
    {
        "key": "notes",
        "question": "Kan mijn team notities bijhouden bij een interview?",
        "answer": "Ja. Elk interview heeft een tabblad Notities waar je team notities in platte tekst schrijft over de wervingsronde, zoals wie jullie hierna bellen of, voor een bureau, voor welke klant het interview is. Elk lid kan notities schrijven, kijkers ook, en de eigen notities bewerken; de schrijver, eigenaren en beheerders kunnen er een verwijderen. Eigenaren en beheerders kunnen één notitie vastzetten, die dan onder de naam van het interview staat. Kandidaten zien notities nooit.",
    },
    {
        "key": "team",
        "question": "Kan ik mijn team toevoegen?",
        "answer": "Ja, en leden kosten niets. Op het tabblad Team van het bedrijf nodigt de eigenaar elke persoon per e-mail uit als beheerder of kijker. Beheerders kunnen alles behalve het team beheren, de actielog bekijken en het bedrijf verwijderen. Kijkers zien interviews en resultaten, delen rapporten en schrijven notities, maar wijzigen verder niets en kunnen niet opwaarderen. Eén account kan meerdere bedrijven bezitten, elk met een eigen team en eigen credits.",
    },
    {
        "key": "integrations",
        "question": "Werkt testee met mijn ATS of andere tools?",
        "answer": "Ja, zonder extra kosten; voor kandidaten betaal je zoals gewoonlijk. Eigenaren en beheerders koppelen Workable, Greenhouse, Teamtailor, Recruitee of Breezy HR op het tabblad Integraties van het bedrijf met een sleutel uit het ATS, en koppelen daarna een vacature aan een interview en een fase: kandidaten die je naar die fase verplaatst, krijgen het interview, en hun resultaten gaan terug naar het ATS ([zo koppel je vaardigheidstests aan je ATS](/guides/ats-integration-skills-tests)). Slack kan de meldingen van je bedrijf in een kanaal plaatsen, en met de API kan je eigen platform interviews aanmaken, kandidaten uitnodigen en beheren en hun resultaten ontvangen, waarbij elke API-sleutel alleen mag wat je ervoor aanvinkt; zie de [API-documentatie](/api-docs).",
    },
    {
        "key": "slack",
        "question": "Hoe werkt de Slack-integratie?",
        "answer": "Een eigenaar of beheerder kiest 'Toevoegen aan Slack' op het tabblad Integraties van het bedrijf en selecteert één kanaal, en kiest daarna welke meldingen daarheen gaan, zoals een kandidaat die klaar is, een niet-bezorgde uitnodiging, een niet-uitgenodigde ATS-kandidaat of een nieuwe notitie. Het is gratis.",
    },
    {
        "key": "api_keys",
        "question": "Hoe werken API-sleutels?",
        "answer": "Eigenaren en beheerders maken ze op de API-pagina van het bedrijf, onder Integraties. Je vinkt aan wat elke sleutel mag, kiest wanneer hij verloopt (over 1, 3, 6 of 12 maanden, of nooit) en kunt hem beperken tot toegestane IP-adressen. Een sleutel wordt één keer getoond. Een bedrijf kan 60 verzoeken per minuut doen. De [ontwikkelaarsdocumentatie](/api-docs) beschrijft elke aanroep.",
    },
    {
        "key": "webhooks",
        "question": "Kan testee mijn systeem laten weten wanneer een kandidaat klaar is?",
        "answer": "Ja, met webhooks, die je instelt op de API-pagina van het bedrijf. testee roept je adres aan wanneer een kandidaat begint, klaar is (met de resultaten), niet wordt bereikt, verloopt of wordt verwijderd, en wanneer een interview klaar is, en ondertekent elke aanroep met je secret. Een mislukte aanroep wordt 3 dagen lang opnieuw geprobeerd; daarna pauzeert de webhook tot een testgebeurtenis lukt. Elke webhook heeft een log van de laatste verzendingen. Zie de [webhooks-documentatie](/api-docs?tab=webhooks).",
    },
    {
        "key": "embed",
        "question": "Kunnen kandidaten het interview op mijn eigen site doen?",
        "answer": "Ja, met de SDK van testee: een script dat het interview in je pagina toont, op de sites die je toestaat op de API-pagina van het bedrijf. Je server nodigt elke kandidaat uit via de API met inloggen uit, dus ze hebben geen testee-account nodig en testee stuurt hun geen e-mails. Het kost niets extra; voor kandidaten betaal je zoals gewoonlijk. Zie de [SDK-documentatie](/api-docs?tab=sdk).",
    },
    {
        "key": "ai_apps",
        "question": "Kan ik testee vanuit Claude, ChatGPT of mijn eigen AI-agent gebruiken?",
        "answer": "Ja. Voeg testee als connector toe aan Claude of ChatGPT (de stappen staan op het tabblad Integraties van je bedrijf) en sta het toe in testee, alleen om te lezen of ook om dingen te wijzigen. De app werkt dan namens jou en met jouw rechten met je bedrijven, interviews en de resultaten van kandidaten. Je account of een bedrijf verwijder je alleen in testee. Wat de app leest, gaat naar de aanbieder ervan, onder de voorwaarden van die app. Je kunt de app altijd ontkoppelen op hetzelfde tabblad, en eigenaren en beheerders kunnen AI-apps voor een bedrijf uitzetten. Ook andere AI-apps en agents die je zelf bouwt kunnen verbinden: het [MCP-tabblad](/api-docs?tab=mcp) van de ontwikkelaarsdocumentatie heeft de stappen en voorbeeldagents, en een agent op een server kan zich aanmelden met een API-sleutel die het recht voor AI-agents heeft, en doet dan alleen wat de andere rechten van de sleutel toestaan. De [gids over AI-agents, MCP en API's](/guides/ai-agents-mcp-and-api) legt uit waarvoor elk ervan dient.",
    },
    {
        "key": "candidates",
        "question": "Wat zien kandidaten?",
        "answer": "De naam en het logo van je bedrijf, in de kleuren en lettertypen van je bedrijf (ingesteld op het tabblad Merk), wat ze kunnen verwachten voordat ze beginnen, en daarna één vraag met tijdslimiet tegelijk. Het interview laat hun nooit hun score zien of of een antwoord goed was; alleen hun eigen gegevensdownload bevat hun score.",
    },
    {
        "key": "brand",
        "question": "Kunnen interviews het merk van mijn bedrijf dragen?",
        "answer": "Ja, zonder extra kosten. Op het tabblad Merk van het bedrijf stellen eigenaren en beheerders het logo, de kleuren voor het lichte en het donkere thema, de lettertypen en de afronding van hoeken in. Kandidaten zien ze tijdens het hele interview, zonder de koptekst of voettekst van testee, en het logo staat ook in e-mails en rapporten.",
    },
    {
        "key": "candidate_account",
        "question": "Hebben kandidaten een account nodig?",
        "answer": "Ja, en dat is gratis: ze loggen in met Google, LinkedIn of GitHub, met het geverifieerde e-mailadres dat je hebt uitgenodigd, dus een doorgestuurde uitnodiging heeft voor niemand anders nut. Via een deelbare link werkt elk geverifieerd e-mailadres. De uitzondering is een uitnodiging die je eigen platform via de API maakt, die het inloggen kan overslaan.",
    },
    {
        "key": "verified",
        "question": "Wat betekent het verificatievinkje?",
        "answer": "Dat een eigenaar of beheerder van het bedrijf heeft ingelogd met een zakelijk e-mailadres op de website van het bedrijf, zoals you@acme.com, en dat ons team het bedrijf daarna heeft beoordeeld. Voeg de website toe met Verifiëren in de kop van je bedrijf; gratis e-maildiensten tellen niet mee. Zolang de beoordeling loopt, ziet je team een klokje naast de naam, en een nieuwe bedrijfsnaam stuurt het opnieuw ter beoordeling. Het vinkje staat naast de naam van je bedrijf, ook in uitnodigingen.",
    },
    {
        "key": "languages",
        "question": "Welke talen worden ondersteund?",
        "answer": "{count} talen, voor de site, de interviews en de e-mails. Kies de taal waarin een interview wordt geschreven, in welke taal de functieomschrijving ook is.",
    },
    {
        "key": "mira",
        "question": "Wie is Mira?",
        "answer": "De AI-assistent van testee: een AI, geen persoon, en de antwoorden kunnen fout zijn. Open Mira met 'vraag Mira' in de koptekst. Bezoekers kunnen alles over testee vragen. Als je bent ingelogd, leest Mira ook je bedrijven met jouw toegang en voert de wijzigingen uit die je vraagt, elk pas nadat je het hebt bevestigd. Mira iets vragen kost geen credits, en kandidaten hebben Mira niet tijdens een interview.",
    },
    {
        "key": "search",
        "question": "Kan ik in testee zoeken?",
        "answer": "Ja. De zoekfunctie in de koptekst vindt terwijl je typt je bedrijven, interviews en kandidaten (op naam of e-mailadres), en de pagina's, gidsen, vergelijkingen, juridische teksten, FAQ-vragen en selectietests van de site. Als je niet bent ingelogd, vindt hij alleen wat openbaar is.",
    },
    {
        "key": "privacy",
        "question": "Wat gebeurt er met functieomschrijvingen en antwoorden?",
        "answer": "Functieomschrijvingen worden gebruikt om de interviews van jouw bedrijf te maken, en de antwoorden van kandidaten om ze voor jouw bedrijf te beoordelen. De vragen die testee genereert, kunnen ook worden hergebruikt in interviews en oefeninterviews van andere bedrijven, zonder iets wat jou, je bedrijf of iemand anders identificeert; je kunt de vragen van een interview hiervan uitsluiten in de instellingen van dat interview. testee leidt daarnaast uit hoe vragen worden beantwoord algemene, geanonimiseerde patronen in de kwaliteit van vragen af, om te verbeteren hoe vragen worden gegenereerd. Het [privacybeleid](/privacy) legt uit wat we bewaren, hoe lang en welke rechten iedereen heeft.",
    },
    {
        "key": "question_bank",
        "question": "Worden de vragen van mijn interview gedeeld met andere bedrijven?",
        "answer": "Standaard wel. Een vraag die testee heeft gegenereerd, kan in de gedeelde vragenbank komen zodra hij een paar keer is beantwoord en controles doorstaat dat hij geen organisatie, persoon of contactgegevens noemt; de kopie bevat niets wat je bedrijf identificeert. Eigenaren en beheerders kunnen de vragen van een interview buiten de bank houden op het tabblad Instellingen ervan; een instelling voor het hele bedrijf is er niet. Vragen die al zijn hergebruikt blijven, ook als je bedrijf wordt verwijderd.",
    },
    {
        "key": "ai_training",
        "question": "Worden onze gegevens gebruikt om AI-modellen te trainen?",
        "answer": "OpenAI, dat de AI van testee aandrijft, traint zijn modellen volgens zijn API-voorwaarden niet op wat wij sturen; het mag dit tot 30 dagen bewaren, alleen om misbruik op te sporen, tenzij de wet langer vereist. testee leert zelf algemene, geanonimiseerde patronen in de kwaliteit van vragen, om te verbeteren hoe vragen worden gegenereerd.",
    },
    {
        "key": "data_storage",
        "question": "Waar worden onze gegevens opgeslagen?",
        "answer": "Op Google Cloud, in België. Sommige aanbieders verwerken gegevens in de Verenigde Staten, zoals OpenAI en Resend, onder het EU-VS-kader voor gegevensbescherming of de standaardcontractbepalingen van de Europese Commissie. De [vertrouwenspagina](/trust) noemt ze allemaal.",
    },
    {
        "key": "eu_ai_law",
        "question": "Is het legaal om AI te gebruiken voor de preselectie van kandidaten in de EU?",
        "answer": "Ja, met regels. Onder de Europese AI-verordening (AI Act) zijn tools die kandidaten beoordelen zeer waarschijnlijk hoog risico, met verplichtingen vanaf 2 december 2027, en de AVG geldt nu al: een mens neemt het besluit om iemand aan te nemen, kandidaten horen dat er AI wordt gebruikt en alles wordt vastgelegd. testee werkt zo: AI schrijft de vragen, mensen in jouw bedrijf bekijken de resultaten en beslissen, en kandidaten worden geïnformeerd voordat ze beginnen. Dit is geen juridisch advies; [Is AI bij werving en selectie legaal in de EU?](/guides/is-ai-hiring-legal-in-the-eu) legt de regels en de data uit.",
    },
    {
        "key": "uk_us",
        "question": "Kunnen we testee gebruiken voor kandidaten in het Verenigd Koninkrijk en de VS?",
        "answer": "Ja. De verwerkersovereenkomst dekt het Britse en Amerikaanse recht, en de instructies voor bedrijven en de sjablonen voor kandidaatinformatie (met versies voor New York City, Illinois en Colorado) dekken wat je kandidaten moet vertellen. Voor vacatures in New York City gebruik je het pas als je hebt gedaan wat Local Law 144 van je vraagt: een onafhankelijke bias-audit binnen het jaar vóór het gebruik, de publicatie van een samenvatting daarvan, en een kennisgeving aan kandidaten 10 werkdagen vooraf. De export voor een bias-audit in de Actielog geeft je auditor de score en de uitslag van elke kandidaat die klaar is, om te koppelen aan de antwoorden die je kandidaten zelf gaven.",
    },
    {
        "key": "emails",
        "question": "Welke e-mails stuurt testee, en hoe stop ik ze?",
        "answer": "Service-e-mails, zoals uitnodigingen, rapporten, factuurmails en wijzigingen in onze voorwaarden, worden altijd verstuurd. De rest, zoals het dagelijkse activiteitenoverzicht, herinneringen, productupdates en aanbiedingen, kies je in Instellingen, onder E-mails, of stop je met de link 'Afmelden' in elke e-mail. Kandidaten kunnen de e-mails van je bedrijf, of de herinneringen voor een interview, stoppen met de links in hun uitnodigingen en herinneringen. Nieuws van testee staat bij je meldingen, de bel bovenaan; het belangrijkste nieuws komt ook per e-mail als productupdate, alleen zolang die instelling aan staat.",
    },
    {
        "key": "data_export",
        "question": "Kan ik mijn gegevens downloaden?",
        "answer": "Ja. 'Mijn gegevens downloaden' in Instellingen geeft je één JSON-bestand met wat testee over je bewaart; voor de interviews van een bedrijf bevat het je antwoorden en scores, maar niet welke antwoorden goed waren. Een export van een heel bedrijf is er niet: de eigenaar kan de actielog downloaden, en leden kunnen de pdf-rapporten van kandidaten downloaden.",
    },
    {
        "key": "candidate_data",
        "question": "Hoe kan een kandidaat zijn gegevens laten verwijderen?",
        "answer": "Door het te vragen aan het bedrijf dat hem heeft uitgenodigd: een kandidaat intrekken die is begonnen, wist hem en zijn resultaten definitief. Of door zijn testee-account te verwijderen in Instellingen, wat zijn resultaten verwijdert. Anders worden resultaten automatisch verwijderd 12 maanden nadat de uitnodiging voor het laatst is verstuurd.",
    },
    {
        "key": "delete",
        "question": "Kan ik mijn account verwijderen?",
        "answer": "Ja, in Instellingen, tenzij je eigenaar bent van een bedrijf waar anderen lid van zijn geworden: maak eerst een ander lid eigenaar, of verwijder het bedrijf. Je account en je gegevens worden verwijderd, met de bedrijven waarvan alleen jij lid bent en hun credits, dus vraag eerst een terugbetaling aan als je daar recht op hebt. Een bedrijf houdt de registratie van je uitnodiging zonder je e-mailadres, en aankoopgegevens blijven bewaard zoals de boekhoudwetgeving vereist. Vooraf kun je een kopie van je gegevens downloaden.",
    },
    {
        "key": "company_delete",
        "question": "Kan ik een bedrijf verwijderen?",
        "answer": "Ja, als je er eigenaar van bent. De interviews, kandidaten, resultaten en credits ervan verdwijnen definitief en het automatisch opwaarderen stopt, dus vraag eerst een terugbetaling aan als je daar recht op hebt. Kopieën van de vragen die al in de gedeelde vragenbank staan, blijven.",
    },
    {
        "key": "report",
        "question": "Hoe meld ik een probleem?",
        "answer": "Schrijf ons via de [contactpagina](/contact) en plak de ID van waar het om gaat: “id kopiëren” staat onder de naam van een bedrijf, een interview of een kandidaat, en die van je account in je accountmenu en in Instellingen. Met de ID vinden we het meteen.",
    },
]
