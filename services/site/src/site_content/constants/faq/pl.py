# The FAQ in pl; the {placeholders} are filled in by helpers/help.py (faq_values) with
# billing's prices and the number of languages. Questions not translated yet show in English
# (constants/faq/__init__.py).
FAQ = [
    {
        "key": "what",
        "question": "Czym jest testee?",
        "answer": "To rozmowa na czas z pytaniami wielokrotnego wyboru, stworzona z Twojego opisu stanowiska, dla dowolnej roli. Użyj jej do wstępnej selekcji kandydatów, zanim się z nimi spotkasz, albo jako etapu samej rekrutacji: tak czy inaczej zobaczysz, kto naprawdę zna się na rzeczy.",
    },
    {
        "key": "roles",
        "question": "Na jakie role mogę rekrutować?",
        "answer": "Na każdą rolę, w której liczy się wiedza: wsparcie klienta, sprzedaż, finanse, ochrona zdrowia, zawody techniczne, inżynieria, marketing i wiele innych. Jeśli potrafisz opisać stanowisko, testee zbuduje do niego rozmowę.",
    },
    {
        "key": "hiring",
        "question": "Jak to działa?",
        "answer": "Wklej opis stanowiska na stronie głównej, podaj nazwę firmy i sprawdź tematy proponowane przez testee. Potem zaproś kandydatów: wpisz ich adresy e-mail, wklej listę lub prześlij plik. Kandydaci, którzy po kilku dniach nie zaczęli, dostają jedno przypomnienie. Każdy kandydat dostaje własne pytania z limitem czasu na każde z nich, a Ty widzisz jego wynik i każdą odpowiedź, gdy tylko skończy.",
    },
    {
        "key": "templates",
        "question": "Czy mogę zacząć od gotowej rozmowy?",
        "answer": "Tak. Zakładka Szablony Twojej firmy zawiera gotowe rozmowy według ról, które możesz wyszukiwać i filtrować według poziomu i języka. Właściciele i administratorzy mogą od razu i bezpłatnie skopiować jedną do firmy, a potem zmieniać ją jak każdą rozmowę; za kandydatów płacisz jak zwykle.",
    },
    {
        "key": "link",
        "question": "Czy mogę umieścić rozmowę w ogłoszeniu o pracę?",
        "answer": "Tak. Włącz link do udostępnienia rozmowy na jej karcie ustawień i wklej go do ogłoszenia. Każdy, kto go otworzy, loguje się i bierze udział w rozmowie, a za każdą osobę płacisz jak za zaproszonego kandydata. Gdy skończą się kredyty, link nie przyjmuje nowych osób. Link wyłącza się, gdy oznaczysz w rozmowie, że ktoś został zatrudniony.",
    },
    {
        "key": "preview",
        "question": "Czy mogę wypróbować rozmowę, zanim kogoś zaproszę?",
        "answer": "Tak. Otwórz swoją rozmowę jako kandydat z jej strony, bezpłatnie: podglądy nie pojawiają się wśród Twoich kandydatów ani w statystykach pytań. Możesz też odbyć dowolną z darmowych próbnych rozmów.",
    },
    {
        "key": "question_quality",
        "question": "Jak sprawdzacie, czy pytania są poprawne?",
        "answer": "Zanim rozmowa będzie gotowa, druga AI sprawdza próbkę jej kluczy odpowiedzi. Potem odpowiedzi, głosy i zgłoszenia wskazują słabe pytania, które są poprawiane lub zastępowane w tle dla kandydatów rozpoczynających później; wyniki już wystawione się nie zmieniają. Na stronie tematu możesz przeczytać każde pytanie, a właściciele i administratorzy mogą je wyłączyć, wygenerować od nowa lub oznaczyć jego odpowiedź jako błędną.",
    },
    {
        "key": "open-to-offers",
        "question": "Czy firmy mogą mnie znaleźć dzięki moim ćwiczeniom?",
        "answer": "Tylko jeśli tego chcesz. Włącz „Rozważam oferty pracy” po rundzie ćwiczeń lub w Ustawieniach, podając adres swojego profilu LinkedIn. Firmy, które doładowały kredyty w testee, zobaczą wtedy Twoje imię i nazwisko, profil LinkedIn i najnowszy wynik ćwiczeń na czas z każdego tematu ich rozmów, który ćwiczyłeś, i mogą zaprosić Cię na rozmowę. testee nie tworzy rankingu ani Cię nie poleca. Możesz to wyłączyć w każdej chwili w Ustawieniach, a wtedy od razu znikasz z list wszystkich firm; wyłącza się to też samo rok po tym, jak ostatnio to włączyłeś lub zapisałeś profil LinkedIn.",
    },
    {
        "key": "cheating",
        "question": "Czy kandydaci mogą korzystać z AI albo szukać odpowiedzi?",
        "answer": "Każdy kandydat dostaje pytania losowane z każdego tematu, we własnej kolejności, z [limitem czasu na każde pytanie](/guides/skills-test-timing-and-extra-time) pilnowanym przez nasz serwer, więc zostaje niewiele czasu na szukanie odpowiedzi czy pytanie AI. Wyniki pokazują też, kiedy kandydat opuścił stronę, skopiował tekst albo odpowiedział zbyt szybko, by przeczytać pytanie. Gdy kandydat skończy, jego strona wskazuje też wzorce odpowiedzi, jakie zwykle zostawia przekazywanie pytań AI, np. mniej więcej tyle samo czasu przy każdym pytaniu albo poprawne odpowiedzi na trudne pytania przy błędnych na łatwe, i podsuwa pytania, na które odpowiedział poprawnie, by dopytać o nie na rozmowie na żywo. Wzorzec to powód, by zapytać, a nie dowód. Przed startem każdy kandydat potwierdza też, że odpowie samodzielnie, bez narzędzi AI i pomocy innych osób, a jego wyniki to pokazują.",
    },
    {
        "key": "practice",
        "question": "Czy mogę ćwiczyć za darmo?",
        "answer": "Tak. [Strona ćwiczeń](/practice) ma darmowe rozmowy według ról: zaloguj się, wybierz standardowy czas, podwójny czas lub bez limitu czasu, a na końcu zobaczysz swój wynik i każdą poprawną odpowiedź. Twoje ćwiczenia są prywatne; firmy widzą wynik tylko wtedy, gdy włączysz „Rozważam oferty pracy”.",
    },
    {
        "key": "voice",
        "question": "Czy kandydaci mogą odpowiadać głosem?",
        "answer": "Tak, jeśli firma ustawi rozmowę w trybie głosowym, w dowolnym z 23 języków testee; to, jak dobrze Mira czyta i słyszy, zależy od języka (pokazuje to poradnik „Rozmowy głosowe w 23 językach”). Pytania są czytane na głos, a kandydaci odpowiadają na głos; to, co mówią, jest zamieniane na tekst i dopasowywane do odpowiedzi. testee tego nie przechowuje; OpenAI, które robi to dla nas, może to przechowywać maksymalnie 30 dni, wyłącznie w celu kontroli nadużyć, chyba że prawo wymaga dłuższego okresu. Głosy nie są analizowane pod kątem tonu ani emocji, a kandydaci zawsze mogą zamiast tego dotknąć odpowiedzi.",
    },
    {
        "key": "extra_time",
        "question": "Czy kandydat może dostać dodatkowy czas?",
        "answer": "Tak. Zanim kandydat zacznie, właściciele i administratorzy mogą na jego stronie dać mu 25%, 50% lub 100% więcej czasu na każde pytanie; powód nie jest zapisywany. Osoba korzystająca z linku do udostępnienia najpierw prosi firmę o osobiste zaproszenie. Zobacz, [jak ustawić czas testu umiejętności](/guides/skills-test-timing-and-extra-time).",
    },
    {
        "key": "retake",
        "question": "Czy kandydat może powtórzyć rozmowę lub się cofnąć?",
        "answer": "Nie. Rozmowę odbywa się raz, za jednym podejściem: kandydat może zmienić wybór, dopóki nie naciśnie „Następne pytanie”, a potem jest on ostateczny. Po zakończeniu nie można go ponownie zaprosić na tę rozmowę.",
    },
    {
        "key": "connection",
        "question": "Co się stanie, gdy kandydatowi zerwie się połączenie lub zamknie on stronę?",
        "answer": "Otwiera ten sam link i kontynuuje. Zegar naszego serwera w tym czasie biegnie: pytanie, którego czas minie, gdy kandydata nie ma, liczy się jako błędne, a limit czasu następnego pytania startuje, gdy się ono wyświetli. Nieukończona rozmowa kończy się sama, gdy minie jej łączny czas plus 10%.",
    },
    {
        "key": "cost",
        "question": "Ile to kosztuje?",
        "answer": "Generowanie rozmów jest darmowe. Każdy kandydat, który odpowie na co najmniej jedno pytanie, kosztuje {candidate} kredytów ({candidate_price}), a mniej z kredytami z większych doładowań, nawet {cheapest_price}. Twoja pierwsza firma dostaje {company} darmowych kredytów, co wystarczy na pierwszych {company_candidates} kandydatów. Ceny nie obejmują VAT ani podatku od sprzedaży. Wszystkie ceny są na [stronie cennika](/pricing).",
    },
    {
        "key": "charged",
        "question": "Kiedy płacę za kandydata?",
        "answer": "Jeśli odpowiedział na co najmniej jedno pytanie: gdy jego rozmowa się zakończy (sam ją zakończy albo skończy się czas, gdy go nie ma), albo gdy go wycofasz, co także trwale usuwa jego odpowiedzi. Pytanie, którego czas minął bez wybranej odpowiedzi, się nie liczy. Jego kredyty są rezerwowane przy zaproszeniu (przy linku: gdy zacznie) i wracają, jeśli wycofasz go, zanim na cokolwiek odpowie, jeśli nigdy nie zacznie i zaproszenie wygaśnie po 30 dniach, albo jeśli jego rozmowa zakończy się bez żadnej odpowiedzi.",
    },
    {
        "key": "compare_hiring",
        "question": "Jak cena wypada na tle innych narzędzi do oceny kandydatów?",
        "answer": "Wiele narzędzi do oceny kandydatów sprzedaje się w abonamencie miesięcznym lub rocznym, płatnym nawet wtedy, gdy nikogo nie testujesz. W testee płacisz tylko za kandydatów, kredytami kupionymi z góry: {candidate} kredytów ({candidate_price}) za kandydata, bez umowy, bez opłat za użytkowników i bez płacenia za wygenerowanie rozmowy. Firma, która zaprasza {example_candidates} kandydatów miesięcznie, płaci około {example_year_price} rocznie netto. Jeśli co miesiąc testujesz wielu kandydatów, abonament może wyjść taniej, więc porównaj to ze swoimi liczbami.",
    },
    {
        "key": "top_up",
        "question": "Jak kupić kredyty?",
        "answer": "Właściciele i administratorzy doładowują kredyty na stronie doładowania, w menu konta, dla {min_candidates} do {max_candidates} kandydatów naraz. Paddle przyjmuje płatność, dolicza ewentualny VAT lub podatek od sprzedaży i wystawia paragon lub fakturę; faktura każdego doładowania jest też w zakładce Rozliczenia firmy.",
    },
    {
        "key": "expire",
        "question": "Czy kredyty wygasają?",
        "answer": "Nie. Kredyty nigdy nie wygasają i nie ma płatnego abonamentu. Jeśli włączysz opcjonalne automatyczne doładowanie, Paddle zapisze Twoją kartę jako subskrypcję za {zero_price}; płacisz tylko za wykonane doładowania.",
    },
    {
        "key": "auto_top_up",
        "question": "Czy kredyty mogą doładowywać się automatycznie?",
        "answer": "Tak, jeśli właściciel lub administrator włączy to na stronie doładowania: wybierz doładowanie i saldo, poniżej którego ma nastąpić uzupełnienie, i zaznacz, ile i kiedy jest pobierane. Za każdym razem, gdy dostępne saldo firmy spadnie poniżej tego poziomu, zapisana karta zostaje obciążona, wraz z ewentualnym podatkiem, a właściciele i administratorzy firmy dostają e-mail. Odrzucone obciążenie jest ponawiane po 1, 3 i 7 dniach; potem automatyczne doładowanie zostaje wstrzymane do czasu aktualizacji karty. Wyłączenie go tam, gdzie je włączono, zatrzymuje je od razu.",
    },
    {
        "key": "currency",
        "question": "W jakiej walucie płacę?",
        "answer": "Ceny są w walucie lokalnej w Kanadzie, Australii, Izraelu, Polsce, Szwajcarii, Japonii, Korei Południowej, na Tajwanie, w Hongkongu, Tajlandii, Singapurze i Indiach; w euro w pozostałych krajach UE oraz w Islandii, Liechtensteinie i Norwegii; w funtach w Wielkiej Brytanii; a gdzie indziej w dolarach amerykańskich. Twoje konto i każda firma zachowują walutę kraju, w którym zostały utworzone lub po raz pierwszy użyte, niezależnie od tego, dokąd podróżujesz: swoją zmienisz w Ustawieniach, a walutę firmy na stronie doładowania (właściciele i administratorzy). Doładowania firmy, także automatyczne, są zawsze pobierane w walucie firmy. Jeśli zmienisz walutę firmy, gdy działa automatyczne doładowanie, najpierw zobaczysz obie kwoty do potwierdzenia, a właściciele i administratorzy firmy dostaną e-mail.",
    },
    {
        "key": "referrals",
        "question": "Czy mogę zarobić kredyty, polecając firmę?",
        "answer": "Tak. Udostępnij link z zakładki Polecenia swojej firmy: gdy nowa firma utworzona przez ten link po raz pierwszy doładuje kredyty, dowolną kwotą, obie firmy dostają {referral} kredytów, maksymalnie za 25 poleceń rocznie. Liczy się tylko pierwsza firma danego adresu e-mail właściciela, a Twoje własne firmy się nie liczą.",
    },
    {
        "key": "refunds",
        "question": "Czy mogę dostać zwrot?",
        "answer": "Tak, za kredyty kupione w ciągu ostatnich 14 dni i jeszcze niewydane: na stronie rozliczeń Twojej firmy, przez Paddle lub pisząc do nas. Kredytów zarezerwowanych na kandydatów nie można zwrócić, dopóki są zarezerwowane; te zarezerwowane w ciągu tych 14 dni można zwrócić w ciągu 7 dni od ich powrotu. Darmowe kredyty, takie jak prezent powitalny, nie podlegają zwrotowi i są wydawane jako pierwsze. Szczegóły są w [regulaminie](/terms).",
    },
    {
        "key": "scorecards",
        "question": "Co pokazują karty wyników?",
        "answer": "Każdą odpowiedź, czy była poprawna i ile trwała. Wynik to odsetek zdobytych punktów: każde pytanie jest warte jeden punkt, a pytanie wielokrotnego wyboru („zaznacz wszystkie poprawne”) daje jego część za każdą zaznaczoną poprawną odpowiedź i nic, jeśli zaznaczono błędną. Wyniki są oznaczone na zielono lub na czerwono względem progu zaliczenia ustawionego dla rozmowy. Karty wyników oznaczają też odpowiedzi zbyt szybkie, by przeczytać pytanie, opuszczenia strony i próby kopiowania.",
    },
    {
        "key": "reports",
        "question": "Czy mogę udostępnić wyniki menedżerowi rekrutującemu?",
        "answer": "Tak. Pobierz raport PDF dla jednego kandydata lub dla wszystkich kandydatów rozmowy, wyślij go e-mailem prosto z testee albo prześlij krótkie podsumowanie przez WhatsApp, Telegram, Viber lub LINE.",
    },
    {
        "key": "action_log",
        "question": "Czy mogę zobaczyć, kto co zrobił w mojej firmie?",
        "answer": "Tak, jeśli jesteś właścicielem firmy. Zakładka Dziennik działań firmy pokazuje, co zrobili członkowie zespołu, od najnowszych: zapraszanie lub usuwanie kandydatów, przeglądanie wyników oraz zmiany w rozmowach, zespole, rozliczeniach i integracjach, wraz z tym, kto i kiedy to zrobił oraz czy zrobił to w jego imieniu asystent, aplikacja AI, API czy ATS. Możesz go filtrować według członka zespołu, rodzaju działania i dat oraz pobrać jako plik CSV. Działania są przechowywane przez 12 miesięcy. Działania klucza API są widoczne pod nazwą klucza.",
    },
    {
        "key": "bias_audit",
        "question": "Czy mogę wyeksportować wyniki do audytu stronniczości?",
        "answer": "Tak, jeśli jesteś właścicielem firmy. W zakładce Dziennik działań jest „Eksport do audytu stronniczości”: plik CSV z każdym kandydatem, który skończył, ze wszystkich rozmów lub jednej i z wybranych dat, z jego wynikiem, progiem zaliczenia, informacją, czy zaliczył i czy uzyskał wynik powyżej mediany rozmowy. testee nie przechowuje danych o płci, rasie ani pochodzeniu etnicznym, więc dodajesz odpowiedzi, które kandydaci podali sami, według ich adresów e-mail, i usuwasz adresy e-mail, zanim przekażesz plik niezależnemu audytorowi.",
    },
    {
        "key": "notes",
        "question": "Czy mój zespół może prowadzić notatki do rozmowy?",
        "answer": "Tak. Każda rozmowa ma zakładkę Notatki, w której Twój zespół pisze notatki zwykłym tekstem o rekrutacji, np. do kogo zadzwonić w następnej kolejności albo, w agencji rekrutacyjnej, dla którego klienta jest rozmowa. Każdy członek zespołu może pisać notatki, także obserwatorzy, i edytować swoje; usunąć notatkę mogą jej autor, właściciele i administratorzy. Właściciele i administratorzy mogą przypiąć jedną notatkę, która wtedy wyświetla się pod nazwą rozmowy. Kandydaci nigdy nie widzą notatek.",
    },
    {
        "key": "team",
        "question": "Czy mogę dodać swój zespół?",
        "answer": "Tak, a członkowie nic nie kosztują. W zakładce Zespół firmy właściciel zaprasza każdą osobę e-mailem jako administratora lub obserwatora. Administratorzy mogą wszystko oprócz zarządzania zespołem, oglądania dziennika działań i usuwania firmy. Obserwatorzy widzą rozmowy i wyniki, udostępniają raporty i piszą notatki, ale niczego więcej nie zmieniają i nie mogą doładowywać. Jedno konto może być właścicielem kilku firm, z których każda ma własny zespół i kredyty.",
    },
    {
        "key": "integrations",
        "question": "Czy testee działa z moim ATS lub innymi narzędziami?",
        "answer": "Tak, bez dodatkowych opłat; za kandydatów płacisz jak zwykle. Właściciele i administratorzy łączą Workable, Greenhouse, Teamtailor, Recruitee lub Breezy HR w zakładce Integracje firmy za pomocą klucza z ATS, a potem wiążą ofertę pracy z rozmową i etapem: kandydaci, których przeniesiesz na ten etap, dostają rozmowę, a ich wyniki wracają do ATS ([jak połączyć testy umiejętności z ATS](/guides/ats-integration-skills-tests)). Slack może publikować powiadomienia firmy na kanale, a API pozwala Twojej własnej platformie tworzyć rozmowy, zapraszać kandydatów i zarządzać nimi oraz odbierać ich wyniki, a każdy klucz API może tylko to, co dla niego zaznaczysz; zobacz: [Dokumentacja API](/api-docs).",
    },
    {
        "key": "slack",
        "question": "Jak działa integracja ze Slackiem?",
        "answer": "Właściciel lub administrator wybiera „Dodaj do Slacka” w zakładce Integracje firmy i wskazuje jeden kanał, a potem wybiera, które powiadomienia tam trafiają, np. kandydat skończył, niedostarczone zaproszenie, niezaproszony kandydat z ATS lub nowa notatka. To bezpłatne.",
    },
    {
        "key": "api_keys",
        "question": "Jak działają klucze API?",
        "answer": "Właściciele i administratorzy tworzą je na stronie API firmy, w sekcji Integracje. Zaznaczasz, co może każdy klucz, wybierasz, kiedy wygasa (za 1, 3, 6 lub 12 miesięcy albo nigdy), i możesz ograniczyć go do dozwolonych adresów IP. Klucz jest pokazywany raz. Firma może wysyłać 60 żądań na minutę. [Dokumentacja dla deweloperów](/api-docs) opisuje każde wywołanie.",
    },
    {
        "key": "webhooks",
        "question": "Czy testee może powiadomić mój system, gdy kandydat skończy?",
        "answer": "Tak, przez webhooki, które ustawiasz na stronie API firmy. testee wywołuje Twój adres, gdy kandydat zaczyna, kończy (z wynikami), nie udaje się z nim skontaktować, wygasa lub zostaje usunięty oraz gdy rozmowa jest gotowa, i podpisuje każde wywołanie Twoim sekretem. Nieudane wywołanie jest ponawiane przez 3 dni; potem webhook zostaje wstrzymany, aż przejdzie zdarzenie testowe. Każdy webhook ma dziennik ostatnich wysyłek. Zobacz [dokumentację webhooków](/api-docs?tab=webhooks).",
    },
    {
        "key": "embed",
        "question": "Czy kandydaci mogą odbyć rozmowę na mojej stronie?",
        "answer": "Tak, dzięki SDK testee: skryptowi, który wyświetla rozmowę na Twojej stronie, w serwisach dozwolonych na stronie API firmy. Twój serwer zaprasza każdego kandydata przez API z wyłączonym logowaniem, więc nie potrzebuje on konta testee, a testee nie wysyła mu e-maili. Nic to dodatkowo nie kosztuje; za kandydatów płacisz jak zwykle. Zobacz [dokumentację SDK](/api-docs?tab=sdk).",
    },
    {
        "key": "ai_apps",
        "question": "Czy mogę korzystać z testee w Claude, ChatGPT lub we własnym agencie AI?",
        "answer": "Tak. Dodaj testee do Claude lub ChatGPT jako konektor (kroki znajdziesz w zakładce Integracje swojej firmy) i zezwól na dostęp w testee, tylko do odczytu albo także do wprowadzania zmian. Aplikacja działa wtedy w Twoim imieniu i z Twoimi uprawnieniami na Twoich firmach, rozmowach i wynikach kandydatów. Konto lub firmę usuniesz tylko w testee. To, co aplikacja odczyta, trafia do jej dostawcy na warunkach tej aplikacji. Możesz ją odłączyć w każdej chwili w tej samej zakładce, a właściciele i administratorzy mogą wyłączyć aplikacje AI dla firmy. Połączyć można też inne aplikacje AI i agentów, których tworzysz samodzielnie: [zakładka MCP](/api-docs?tab=mcp) w dokumentacji dla deweloperów zawiera kroki i przykłady agentów, a agent na serwerze może się logować kluczem API z uprawnieniem do agentów AI i robi tylko to, na co pozwalają pozostałe uprawnienia klucza. [Przewodnik po agentach AI, MCP i API](/guides/ai-agents-mcp-and-api) wyjaśnia, do czego służy każde z nich.",
    },
    {
        "key": "candidates",
        "question": "Co widzą kandydaci?",
        "answer": "Nazwę i logo Twojej firmy, w kolorach i czcionkach Twojej firmy (ustawionych na jej karcie Marka), przed startem informację, czego się spodziewać, a potem po jednym pytaniu z limitem czasu. Rozmowa nigdy nie pokazuje im wyniku ani tego, czy odpowiedź była poprawna; wynik zawiera tylko pobrana przez nich kopia ich własnych danych.",
    },
    {
        "key": "brand",
        "question": "Czy rozmowy mogą mieć markę mojej firmy?",
        "answer": "Tak, bez dodatkowych opłat. W zakładce Marka firmy właściciele i administratorzy ustawiają logo, kolory jasnego i ciemnego motywu, czcionki i zaokrąglenie rogów. Kandydaci widzą je przez całą rozmowę, bez nagłówka i stopki testee, a logo pojawia się też w e-mailach i raportach.",
    },
    {
        "key": "candidate_account",
        "question": "Czy kandydaci potrzebują konta?",
        "answer": "Tak, i jest ono bezpłatne: logują się przez Google, LinkedIn lub GitHub, z użyciem zweryfikowanego adresu e-mail, na który wysłałeś zaproszenie, więc przekazane zaproszenie nie przyda się nikomu innemu. Przez link do udostępnienia działa każdy zweryfikowany adres e-mail. Wyjątkiem jest zaproszenie utworzone przez Twoją platformę przez API, które może pominąć logowanie.",
    },
    {
        "key": "verified",
        "question": "Co oznacza znaczek weryfikacji?",
        "answer": "Że właściciel lub administrator firmy zalogował się służbowym e-mailem w domenie strony firmy, np. you@acme.com, a potem nasz zespół sprawdził firmę. Dodaj stronę przyciskiem Zweryfikuj w nagłówku firmy; darmowe usługi e-mail się nie liczą. Dopóki sprawdzenie trwa, Twój zespół widzi zegar obok nazwy, a zmiana nazwy firmy wysyła ją do ponownego sprawdzenia. Znaczek widać obok nazwy Twojej firmy, także w zaproszeniach.",
    },
    {
        "key": "languages",
        "question": "Jakie języki są obsługiwane?",
        "answer": "Liczba obsługiwanych języków: {count}, dla strony, rozmów i e-maili. Wybierz język, w którym ma być napisana rozmowa, niezależnie od języka opisu stanowiska.",
    },
    {
        "key": "mira",
        "question": "Kim jest Mira?",
        "answer": "To asystent AI testee: sztuczna inteligencja, nie człowiek, a jej odpowiedzi mogą być błędne. Otworzysz ją przyciskiem „zapytaj Mirę” w nagłówku. Odwiedzający mogą zapytać o wszystko, co dotyczy testee. Po zalogowaniu Mira odczytuje też Twoje firmy z Twoim dostępem i wprowadza zmiany, o które poprosisz, każdą dopiero po Twoim potwierdzeniu. Zadawanie pytań Mirze nie zużywa kredytów, a kandydaci nie mają do niej dostępu podczas rozmowy.",
    },
    {
        "key": "search",
        "question": "Czy mogę przeszukiwać testee?",
        "answer": "Tak. Wyszukiwarka w nagłówku już podczas pisania znajduje Twoje firmy, rozmowy i kandydatów (po nazwie lub adresie e-mail) oraz strony, poradniki, porównania, dokumenty prawne, pytania z FAQ i testy umiejętności w serwisie. Bez logowania znajduje tylko to, co publiczne.",
    },
    {
        "key": "privacy",
        "question": "Co dzieje się z opisami stanowisk i odpowiedziami?",
        "answer": "Opisy stanowisk służą do tworzenia rozmów Twojej firmy, a odpowiedzi kandydatów do ich oceny na potrzeby Twojej firmy. Pytania generowane przez testee mogą być też ponownie wykorzystywane w rozmowach i rozmowach ćwiczeniowych innych firm, bez niczego, co identyfikuje Ciebie, Twoją firmę lub kogokolwiek innego; możesz wyłączyć z tego pytania danej rozmowy w jej ustawieniach. testee wyodrębnia także z odpowiedzi na pytania ogólne, zanonimizowane wzorce jakości pytań, aby ulepszać sposób ich generowania. [Polityka prywatności](/privacy) wyjaśnia, co przechowujemy, jak długo i jakie prawa przysługują każdemu.",
    },
    {
        "key": "question_bank",
        "question": "Czy pytania z mojej rozmowy są udostępniane innym firmom?",
        "answer": "Domyślnie tak. Pytanie wygenerowane przez testee może trafić do wspólnej bazy pytań, gdy kandydaci kilka razy na nie odpowiedzą i przejdzie ono kontrole, że nie wymienia żadnej organizacji, osoby ani danych kontaktowych; kopia nie zawiera niczego, co identyfikuje Twoją firmę. Właściciele i administratorzy mogą wyłączyć pytania danej rozmowy w jej zakładce Ustawienia; nie ma ustawienia dla całej firmy. Pytania już wykorzystane ponownie zostają, nawet jeśli Twoja firma zostanie usunięta.",
    },
    {
        "key": "ai_training",
        "question": "Czy nasze dane służą do trenowania modeli AI?",
        "answer": "OpenAI, na którym opiera się AI w testee, zgodnie ze swoimi warunkami API nie trenuje modeli na tym, co mu wysyłamy; może to przechowywać do 30 dni, wyłącznie w celu wykrywania nadużyć, chyba że prawo wymaga dłużej. Samo testee uczy się ogólnych, zanonimizowanych wzorców jakości pytań, aby ulepszać sposób ich generowania.",
    },
    {
        "key": "data_storage",
        "question": "Gdzie są przechowywane nasze dane?",
        "answer": "W Google Cloud, w Belgii. Niektórzy dostawcy przetwarzają dane w Stanach Zjednoczonych, np. OpenAI i Resend, na podstawie Ram ochrony danych UE-USA lub standardowych klauzul umownych Komisji Europejskiej. [Strona zaufania](/trust) wymienia ich wszystkich.",
    },
    {
        "key": "eu_ai_law",
        "question": "Czy w UE można legalnie używać AI do wstępnej selekcji kandydatów?",
        "answer": "Tak, na określonych zasadach. Zgodnie z unijnym AI Act narzędzia, które oceniają kandydatów, najpewniej należą do kategorii wysokiego ryzyka, z obowiązkami od 2 grudnia 2027, a RODO obowiązuje już teraz: decyzję o zatrudnieniu podejmuje człowiek, kandydaci wiedzą, że używana jest AI, a dokumentacja jest przechowywana. testee działa właśnie tak: AI pisze pytania, osoby z Twojej firmy przeglądają wyniki i decydują, a kandydaci są informowani przed rozpoczęciem. To nie jest porada prawna; [Czy rekrutacja z AI jest legalna w UE?](/guides/is-ai-hiring-legal-in-the-eu) wyjaśnia zasady i terminy.",
    },
    {
        "key": "uk_us",
        "question": "Czy możemy używać testee do kandydatów z Wielkiej Brytanii i USA?",
        "answer": "Tak. Umowa powierzenia przetwarzania danych obejmuje prawo Wielkiej Brytanii i USA, a instrukcje dla firm i wzory informacji dla kandydatów (z wersjami dla Nowego Jorku, Illinois, Kolorado i Connecticut) opisują, co musisz przekazać kandydatom. Do rekrutacji na stanowiska w Nowym Jorku używaj jej dopiero wtedy, gdy wykonasz to, czego wymaga od Ciebie Local Law 144: niezależny audyt pod kątem stronniczości w ciągu roku przed użyciem, opublikowanie jego podsumowania i powiadomienie kandydatów 10 dni roboczych wcześniej. Eksport do audytu stronniczości w Dzienniku działań daje Twojemu audytorowi wynik i rezultat każdego kandydata, który skończył, do połączenia z odpowiedziami, które Twoi kandydaci podali sami.",
    },
    {
        "key": "emails",
        "question": "Jakie e-maile wysyła testee i jak je wyłączyć?",
        "answer": "E-maili serwisowych, takich jak zaproszenia, raporty, e-maile dotyczące rozliczeń i zmiany naszego regulaminu, nie da się wyłączyć; przestaje je otrzymywać tylko adres, na który e-mail został trwale odrzucony lub który oznaczył jeden z naszych e-maili jako spam. Resztę, na przykład codzienne podsumowanie aktywności, przypomnienia, nowości o produkcie i oferty, wybierasz w Ustawieniach, w sekcji E-maile, albo wyłączasz linkiem „Wypisz się” w każdym e-mailu. Kandydaci mogą wyłączyć e-maile od Twojej firmy lub przypomnienia o danej rozmowie linkami w zaproszeniach i przypomnieniach. Aktualności testee pojawiają się w Twoich powiadomieniach, pod dzwonkiem u góry; najważniejsze przychodzą też e-mailem jako nowości o produkcie, ale tylko wtedy, gdy to ustawienie jest włączone.",
    },
    {
        "key": "data_export",
        "question": "Czy mogę pobrać swoje dane?",
        "answer": "Tak. „Pobierz moje dane” w Ustawieniach daje Ci jeden plik JSON z tym, co testee przechowuje na Twój temat; w przypadku rozmów firmy zawiera Twoje odpowiedzi i wyniki, ale nie informację, które odpowiedzi były poprawne. Nie ma eksportu całej firmy: jej właściciel może pobrać dziennik działań, a członkowie mogą pobrać raporty PDF kandydatów.",
    },
    {
        "key": "candidate_data",
        "question": "Jak kandydat może usunąć swoje dane?",
        "answer": "Prosząc firmę, która go zaprosiła: wycofanie kandydata, który zaczął, trwale usuwa jego i jego wyniki. Albo usuwając swoje konto testee w Ustawieniach, co usuwa jego wyniki. W przeciwnym razie wyniki są usuwane automatycznie 12 miesięcy po ostatnim wysłaniu zaproszenia.",
    },
    {
        "key": "delete",
        "question": "Czy mogę usunąć konto?",
        "answer": "Tak, w Ustawieniach, chyba że jesteś właścicielem firmy, do której dołączyli inni: najpierw przekaż jej własność innemu członkowi albo ją usuń. Twoje konto i dane zostają usunięte wraz z firmami, których jesteś jedynym członkiem, i ich kredytami, więc najpierw poproś o należny Ci zwrot. Firma zachowuje zapis Twojego zaproszenia bez Twojego adresu e-mail, a dokumenty zakupu pozostają, jak wymaga tego prawo rachunkowe. Wcześniej możesz pobrać kopię swoich danych.",
    },
    {
        "key": "company_delete",
        "question": "Czy mogę usunąć firmę?",
        "answer": "Tak, jeśli jesteś jej właścicielem. Jej rozmowy, kandydaci, wyniki i kredyty znikają na zawsze, a automatyczne doładowanie się zatrzymuje, więc najpierw poproś o należny Ci zwrot. Kopie jej pytań, które są już we wspólnej bazie pytań, zostają.",
    },
    {
        "key": "report",
        "question": "Jak zgłosić problem?",
        "answer": "Napisz do nas na [stronie kontaktowej](/contact) i wklej ID tego, czego dotyczy sprawa: „kopiuj id” jest pod nazwą firmy, rozmowy lub kandydata, a ID Twojego konta — w menu konta i w Ustawieniach. Dzięki ID od razu to znajdziemy.",
    },
]
