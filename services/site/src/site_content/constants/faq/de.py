# The FAQ in de; the {placeholders} are filled in by helpers/help.py (faq_values) with
# billing's prices and the number of languages. Questions not translated yet show in English
# (constants/faq/__init__.py).
FAQ = [
    {
        "key": "what",
        "question": "Was ist testee?",
        "answer": "Ein Multiple-Choice-Interview mit Zeitlimit, erstellt aus deiner Stellenbeschreibung, für jede Rolle. Nutze es, um Kandidaten zu prüfen, bevor du sie triffst, oder als eigenen Schritt im Einstellungsprozess: So oder so siehst du, wer den Job wirklich beherrscht.",
    },
    {
        "key": "roles",
        "question": "Für welche Rollen kann ich einstellen?",
        "answer": "Für jede Rolle, in der Wissen zählt: Support, Vertrieb, Finanzen, Gesundheitswesen, Handwerk, Technik, Marketing und mehr. Wenn du den Job beschreiben kannst, kann testee ein Interview dafür erstellen.",
    },
    {
        "key": "hiring",
        "question": "Wie funktioniert es?",
        "answer": "Füge auf der Startseite eine Stellenbeschreibung ein, gib den Namen deines Unternehmens an und prüfe die Themen, die testee vorschlägt. Dann lade Kandidaten ein: Tippe ihre E-Mail-Adressen ein, füge eine Liste ein oder lade eine Datei hoch. Kandidaten, die nach ein paar Tagen noch nicht angefangen haben, bekommen eine Erinnerung. Jeder Kandidat bekommt eigene Fragen mit einem Zeitlimit für jede, und du siehst sein Ergebnis und jede Antwort, sobald er fertig ist.",
    },
    {
        "key": "templates",
        "question": "Kann ich mit einem fertigen Interview starten?",
        "answer": "Ja. Der Tab Vorlagen deines Unternehmens listet fertige Interviews nach Rolle auf, die du durchsuchen und nach Level und Sprache filtern kannst. Inhaber und Admins können eines sofort und kostenlos in das Unternehmen kopieren und es dann wie jedes Interview ändern; Kandidaten werden wie üblich berechnet.",
    },
    {
        "key": "link",
        "question": "Kann ich ein Interview in eine Stellenanzeige setzen?",
        "answer": "Ja. Schalte den Link zum Teilen des Interviews im Tab Einstellungen ein und füge ihn in deine Anzeige ein. Jeder, der ihn öffnet, meldet sich an und macht das Interview, und jede Person wird wie ein eingeladener Kandidat berechnet. Ohne verbleibende Credits nimmt der Link keine neuen Personen mehr an. Der Link wird abgeschaltet, wenn du das Interview als eingestellt markierst.",
    },
    {
        "key": "preview",
        "question": "Kann ich ein Interview ausprobieren, bevor ich jemanden einlade?",
        "answer": "Ja. Öffne dein Interview über seine Seite als Kandidat, kostenlos: Vorschauen erscheinen weder bei deinen Kandidaten noch in der Fragenstatistik. Du kannst auch jedes der kostenlosen Übungsinterviews machen.",
    },
    {
        "key": "question_quality",
        "question": "Wie prüft ihr, ob die Fragen richtig sind?",
        "answer": "Bevor ein Interview bereit ist, prüft eine zweite KI eine Stichprobe seiner Lösungen. Danach machen Antworten, Bewertungen und Meldungen auf schwache Fragen aufmerksam, die im Hintergrund korrigiert oder ersetzt werden, und zwar für Kandidaten, die danach anfangen; bereits vergebene Ergebnisse ändern sich nicht. Auf der Seite eines Themas kannst du jede Frage lesen, und Inhaber und Admins können eine deaktivieren, neu generieren oder ihre Antwort als falsch markieren.",
    },
    {
        "key": "open-to-offers",
        "question": "Können Unternehmen mich über meine Übungen finden?",
        "answer": "Nur wenn du das willst. Schalte „Offen für Angebote“ nach einer Übungsrunde oder in den Einstellungen ein und gib dabei die Adresse deines LinkedIn-Profils an. Unternehmen, die auf testee Credits aufgeladen haben, sehen dann deinen Namen, dein LinkedIn-Profil und dein neuestes Ergebnis einer Übung mit Zeitlimit in jedem Thema ihrer Interviews, das du geübt hast, und können dich zu einem Interview einladen. testee erstellt keine Rangliste und empfiehlt dich nicht. Du kannst es jederzeit in den Einstellungen ausschalten und verschwindest dann sofort aus der Liste jedes Unternehmens; außerdem endet es ein Jahr, nachdem du es zuletzt eingeschaltet oder dein LinkedIn-Profil gespeichert hast.",
    },
    {
        "key": "cheating",
        "question": "Können Kandidaten KI nutzen oder die Antworten nachschlagen?",
        "answer": "Jeder Kandidat bekommt Fragen, die zufällig aus jedem Thema gezogen werden, in eigener Reihenfolge, mit [einem Zeitlimit für jede Frage](/guides/skills-test-timing-and-extra-time), das unser Server überwacht, also bleibt wenig Zeit, Antworten nachzuschlagen oder eine KI zu fragen. Die Auswertung zeigt außerdem, wann ein Kandidat die Seite verlassen, Text kopiert oder zu schnell geantwortet hat, um die Frage gelesen zu haben. Sobald er fertig ist, weist seine Seite zudem auf Antwortmuster hin, die das Weitergeben von Fragen an eine KI oft hinterlässt, etwa ungefähr gleich viel Zeit bei jeder Frage oder schwere Fragen richtig, während leichte falsch waren, und schlägt richtig beantwortete Fragen vor, nach denen man in einem Live-Gespräch fragen kann. Ein Muster ist ein Grund nachzufragen, kein Beweis. Vor dem Start bestätigt außerdem jeder Kandidat, dass er die Fragen selbst beantwortet, ohne KI-Tools oder andere Personen, und die Auswertung zeigt das.",
    },
    {
        "key": "practice",
        "question": "Kann ich kostenlos üben?",
        "answer": "Ja. Die [Übungsseite](/practice) hat kostenlose Interviews nach Rolle: Melde dich an, wähle normale Zeit, doppelte Zeit oder ohne Zeitlimit, und sieh am Ende dein Ergebnis und jede richtige Antwort. Deine Übungen sind privat; Unternehmen sehen ein Ergebnis nur, wenn du „Offen für Angebote“ einschaltest.",
    },
    {
        "key": "voice",
        "question": "Können Kandidaten per Sprache antworten?",
        "answer": "Ja, wenn das Unternehmen ein Interview auf den Sprachmodus stellt, in jeder der 23 Sprachen von testee; wie gut Mira vorliest und versteht, hängt von der Sprache ab (der Leitfaden „Sprachmodus in 23 Sprachen“ zeigt es für jede). Die Fragen werden vorgelesen und Kandidaten antworten laut; was sie sagen, wird in Text umgewandelt und einer Option zugeordnet. testee speichert es nicht; OpenAI, das dies für uns erledigt, darf es bis zu 30 Tage speichern, nur zur Missbrauchsprüfung, sofern das Gesetz nicht eine längere Speicherung verlangt. Stimmen werden nicht auf Tonfall oder Emotionen analysiert, und Kandidaten können jederzeit stattdessen antippen.",
    },
    {
        "key": "extra_time",
        "question": "Kann ein Kandidat zusätzliche Zeit bekommen?",
        "answer": "Ja. Bevor ein Kandidat anfängt, können Inhaber und Admins ihm auf seiner Seite 25 %, 50 % oder 100 % mehr Zeit für jede Frage geben; ein Grund wird nicht gespeichert. Wer einen Link zum Teilen nutzt, bittet das Unternehmen zuerst um eine persönliche Einladung. Siehe [so legst du die Zeit für einen Fachtest fest](/guides/skills-test-timing-and-extra-time).",
    },
    {
        "key": "retake",
        "question": "Kann ein Kandidat ein Interview wiederholen oder zurückgehen?",
        "answer": "Nein. Ein Interview wird einmal gemacht, in einem Durchgang: Ein Kandidat kann seine Wahl ändern, bis er auf „Nächste Frage“ drückt, danach ist sie endgültig. Wenn er fertig ist, kann er nicht erneut zu diesem Interview eingeladen werden.",
    },
    {
        "key": "connection",
        "question": "Was passiert, wenn die Verbindung eines Kandidaten abbricht oder er die Seite schließt?",
        "answer": "Er öffnet denselben Link und macht weiter. Die Uhr unseres Servers läuft inzwischen weiter: Eine Frage, deren Zeit abläuft, während er weg ist, zählt als falsch, und das Zeitlimit der nächsten Frage beginnt, wenn sie angezeigt wird. Ein unfertiges Interview endet von selbst, sobald seine Gesamtzeit plus 10 % vergangen ist.",
    },
    {
        "key": "cost",
        "question": "Was kostet es?",
        "answer": "Interviews zu generieren ist kostenlos. Jeder Kandidat, der mindestens eine Frage beantwortet, kostet {candidate} Credits ({candidate_price}), mit Credits aus größeren Aufladungen weniger, bis hinunter auf {cheapest_price}. Dein erstes Unternehmen bekommt {company} kostenlose Credits, genug für seine ersten {company_candidates} Kandidaten. Die Preise enthalten keine Mehrwert- oder Umsatzsteuer. Auf der [Preisseite](/pricing) stehen alle Preise.",
    },
    {
        "key": "charged",
        "question": "Wann wird ein Kandidat berechnet?",
        "answer": "Sobald er mindestens eine Frage beantwortet hat: wenn sein Interview endet (er beendet es, oder die Zeit läuft ab, während er weg ist), oder wenn du ihn widerrufst, was auch seine Antworten endgültig löscht. Eine Frage, deren Zeit ohne gewählte Antwort abgelaufen ist, zählt nicht. Seine Credits werden bei der Einladung zurückgelegt (bei einem Link, wenn er anfängt) und kommen zurück, wenn du ihn widerrufst, bevor er etwas beantwortet, wenn er nie anfängt und die Einladung nach 30 Tagen abläuft oder wenn sein Interview endet, ohne dass er etwas beantwortet hat.",
    },
    {
        "key": "compare_hiring",
        "question": "Wie ist der Preis im Vergleich zu anderen Bewertungstools?",
        "answer": "Viele Tools für Eignungstests werden als Monats- oder Jahresabo verkauft, das du zahlst, auch wenn du niemanden testest. Bei testee zahlst du nur pro Kandidat, mit im Voraus gekauften Credits: {candidate} Credits ({candidate_price}), ohne Vertrag, ohne Gebühren pro Nutzer und ohne Kosten für das Generieren eines Interviews. Ein Unternehmen, das {example_candidates} Kandidaten im Monat einlädt, zahlt etwa {example_year_price} im Jahr vor Steuern. Wenn du jeden Monat viele Kandidaten testest, kann ein Abo günstiger sein, also vergleiche mit deinen eigenen Zahlen.",
    },
    {
        "key": "top_up",
        "question": "Wie kaufe ich Credits?",
        "answer": "Inhaber und Admins laden auf der Seite zum Aufladen im Kontomenü auf, für {min_candidates} bis {max_candidates} Kandidaten auf einmal. Paddle nimmt die Zahlung entgegen, fügt eine eventuelle Mehrwert- oder Umsatzsteuer hinzu und stellt die Quittung oder Rechnung aus; die Rechnung jeder Aufladung steht auch im Tab Abrechnung des Unternehmens.",
    },
    {
        "key": "expire",
        "question": "Verfallen Credits?",
        "answer": "Nein. Credits verfallen nie, und es gibt keine kostenpflichtigen Abos. Wenn du das optionale automatische Aufladen einschaltest, speichert Paddle deine Karte als Abo für {zero_price}; du zahlst nur die Aufladungen, die es vornimmt.",
    },
    {
        "key": "auto_top_up",
        "question": "Können Credits automatisch aufgeladen werden?",
        "answer": "Ja, wenn ein Inhaber oder Admin es auf der Seite zum Aufladen einschaltet: Wähle eine Aufladung und das Guthaben, unter dem aufgefüllt wird, und hake an, was es wann abbucht. Jedes Mal, wenn das verfügbare Guthaben des Unternehmens unter diesen Wert fällt, wird die gespeicherte Karte belastet, zuzüglich eventueller Steuern, und die Inhaber und Admins des Unternehmens bekommen eine E-Mail. Eine abgelehnte Abbuchung wird nach 1, 3 und 7 Tagen erneut versucht; danach pausiert das automatische Aufladen, bis die Karte aktualisiert ist. Wenn du es dort ausschaltest, wo du es eingeschaltet hast, stoppt es sofort.",
    },
    {
        "key": "currency",
        "question": "In welcher Währung zahle ich?",
        "answer": "Die Preise sind in Kanada, Australien, Israel, Polen, der Schweiz, Japan, Südkorea, Taiwan, Hongkong, Thailand, Singapur und Indien in der Landeswährung; in der übrigen EU sowie in Island, Liechtenstein und Norwegen in Euro; im Vereinigten Königreich in Pfund; und anderswo in US-Dollar. Dein Konto und jedes Unternehmen behalten die Währung des Landes, in dem sie angelegt oder zuerst genutzt wurden, egal wohin du reist: Deine änderst du in den Einstellungen, die eines Unternehmens auf der Seite zum Aufladen (Inhaber und Admins). Die Aufladungen eines Unternehmens, auch die automatischen, werden immer in seiner Währung berechnet. Änderst du sie, während das automatische Aufladen läuft, siehst du zuerst beide Beträge zur Bestätigung, und die Inhaber und Admins des Unternehmens erhalten eine E-Mail.",
    },
    {
        "key": "referrals",
        "question": "Kann ich Credits verdienen, indem ich ein Unternehmen empfehle?",
        "answer": "Ja. Teile den Link aus dem Tab Empfehlungen deines Unternehmens: Wenn ein neues Unternehmen, das darüber angelegt wurde, zum ersten Mal auflädt, mit einem beliebigen Betrag, bekommen beide Unternehmen {referral} Credits, für bis zu 25 Empfehlungen im Jahr. Es zählt nur das erste Unternehmen zur E-Mail-Adresse seines Inhabers, und deine eigenen Unternehmen zählen nicht.",
    },
    {
        "key": "refunds",
        "question": "Kann ich mein Geld zurückbekommen?",
        "answer": "Ja, für Credits, die du in den letzten 14 Tagen gekauft und noch nicht ausgegeben hast: auf der Abrechnungsseite deines Unternehmens, über Paddle oder indem du uns schreibst. Für Kandidaten reservierte Credits können nicht erstattet werden, solange sie reserviert sind; innerhalb der 14 Tage reservierte Credits können noch 7 Tage nach ihrer Rückkehr erstattet werden. Gratis-Credits wie das Willkommensgeschenk werden nicht erstattet und gelten als zuerst ausgegeben. Details stehen in den [Bedingungen](/terms).",
    },
    {
        "key": "scorecards",
        "question": "Was zeigen die Auswertungen?",
        "answer": "Jede Antwort, ob sie richtig war und wie lange sie gedauert hat. Das Ergebnis ist der Anteil der erreichten Punkte: Jede Frage zählt einen Punkt, und eine Frage mit Mehrfachauswahl bringt einen Teil davon für jede angekreuzte richtige Option, aber nichts, wenn eine falsche angekreuzt ist. Ergebnisse erscheinen grün oder rot, gemessen an der Bestehensgrenze, die du für das Interview festgelegt hast. Außerdem markieren die Auswertungen Antworten, die zu schnell waren, um die Frage gelesen zu haben, wann der Kandidat die Seite verlassen hat und Kopierversuche.",
    },
    {
        "key": "reports",
        "question": "Kann ich Ergebnisse mit einem Hiring Manager teilen?",
        "answer": "Ja. Lade einen PDF-Bericht für einen Kandidaten oder für alle Kandidaten eines Interviews herunter, sende ihn direkt aus testee per E-Mail oder schick eine kurze Zusammenfassung über WhatsApp, Telegram, Viber oder LINE.",
    },
    {
        "key": "action_log",
        "question": "Kann ich sehen, wer in meinem Unternehmen was gemacht hat?",
        "answer": "Ja, wenn du Inhaber des Unternehmens bist. Sein Tab Aktionsprotokoll listet, was seine Mitglieder getan haben, das Neueste zuerst: Kandidaten einladen oder entfernen, Ergebnisse ansehen und Interviews, das Team, die Abrechnung und Integrationen ändern, jeweils damit, wer es getan hat, wann und ob der Assistent, eine KI-App, die API oder ein ATS es in seinem Namen getan hat. Du kannst es nach Mitglied, Art der Aktion und Datum filtern und es als CSV-Datei herunterladen. Aktionen werden 12 Monate lang aufbewahrt. Die Aktionen eines API-Schlüssels stehen unter dem Namen des Schlüssels.",
    },
    {
        "key": "bias_audit",
        "question": "Kann ich Ergebnisse für ein Bias-Audit exportieren?",
        "answer": "Ja, wenn du Inhaber des Unternehmens bist. Im Tab Aktionsprotokoll gibt es den „Export für Bias-Audit“: eine CSV-Datei mit jedem Kandidaten, der fertig ist, für alle Interviews oder eines und zwischen gewählten Daten, mit seinem Ergebnis, der Bestehensgrenze, ob er bestanden hat und ob er über dem Median des Interviews lag. testee hat keine Daten zu Geschlecht, Rasse oder ethnischer Zugehörigkeit, also ergänzt du die Selbstauskünfte deiner Kandidaten anhand ihrer E-Mail-Adresse und entfernst die E-Mail-Adressen, bevor du die Datei deinem unabhängigen Auditor gibst.",
    },
    {
        "key": "notes",
        "question": "Kann mein Team Notizen zu einem Interview festhalten?",
        "answer": "Ja. Jedes Interview hat einen Tab Notizen, in dem dein Team Notizen als reinen Text zum Einstellungsverfahren schreibt, etwa wen ihr als Nächstes anruft oder, bei einer Agentur, für welchen Kunden das Interview ist. Jedes Mitglied kann Notizen schreiben, auch Betrachter, und seine eigenen bearbeiten; löschen können die Person, die sie geschrieben hat, Inhaber und Admins. Inhaber und Admins können eine Notiz oben anheften, die dann unter dem Namen des Interviews erscheint. Kandidaten sehen Notizen nie.",
    },
    {
        "key": "team",
        "question": "Kann ich mein Team hinzufügen?",
        "answer": "Ja, und Mitglieder kosten nichts. Im Tab Team des Unternehmens lädt der Inhaber jede Person per E-Mail als Admin oder Betrachter ein. Admins können alles außer das Team verwalten, das Aktionsprotokoll sehen und das Unternehmen löschen. Betrachter sehen Interviews und Ergebnisse, teilen Berichte und schreiben Notizen, ändern aber sonst nichts und können nicht aufladen. Ein Konto kann mehrere Unternehmen besitzen, jedes mit eigenem Team und eigenen Credits.",
    },
    {
        "key": "integrations",
        "question": "Funktioniert testee mit meinem ATS oder anderen Tools?",
        "answer": "Ja, ohne Aufpreis; Kandidaten werden wie üblich berechnet. Inhaber und Admins verbinden Workable, Greenhouse, Teamtailor, Recruitee oder Breezy HR im Tab Integrationen des Unternehmens mit einem Schlüssel aus dem ATS und verknüpfen dann eine Stelle mit einem Interview und einer Phase: Kandidaten, die du in diese Phase verschiebst, bekommen das Interview, und ihre Ergebnisse gehen zurück an das ATS ([so verbindest du Fachtests mit deinem ATS](/guides/ats-integration-skills-tests)). Slack kann die Benachrichtigungen deines Unternehmens in einem Kanal posten, und über die API kann deine eigene Plattform Interviews erstellen, Kandidaten einladen und verwalten und ihre Ergebnisse empfangen, wobei jeder API-Schlüssel nur darf, was du für ihn ankreuzt; siehe [API-Dokumentation](/api-docs).",
    },
    {
        "key": "slack",
        "question": "Wie funktioniert die Slack-Integration?",
        "answer": "Ein Inhaber oder Admin wählt „Zu Slack hinzufügen“ im Tab Integrationen des Unternehmens und sucht einen Kanal aus, dann wählt er, welche Benachrichtigungen dorthin gehen, etwa ein Kandidat ist fertig, eine nicht zugestellte Einladung, ein nicht eingeladener ATS-Kandidat oder eine neue Notiz. Es ist kostenlos.",
    },
    {
        "key": "api_keys",
        "question": "Wie funktionieren API-Schlüssel?",
        "answer": "Inhaber und Admins erstellen sie auf der API-Seite des Unternehmens unter Integrationen. Du hakst an, was jeder Schlüssel darf, wählst, wann er abläuft (in 1, 3, 6 oder 12 Monaten oder nie), und kannst ihn auf erlaubte IP-Adressen beschränken. Ein Schlüssel wird einmal angezeigt. Ein Unternehmen kann 60 Anfragen pro Minute stellen. Die [Entwicklerdokumentation](/api-docs) beschreibt jeden Aufruf.",
    },
    {
        "key": "webhooks",
        "question": "Kann testee meinem System mitteilen, wenn ein Kandidat fertig ist?",
        "answer": "Ja, mit Webhooks, die du auf der API-Seite des Unternehmens einrichtest. testee ruft deine Adresse auf, wenn ein Kandidat anfängt, fertig wird (mit seinen Ergebnissen), nicht erreicht wird, abläuft oder entfernt wird und wenn ein Interview bereit ist, und signiert jeden Aufruf mit deinem Secret. Ein fehlgeschlagener Aufruf wird 3 Tage lang wiederholt; danach pausiert der Webhook, bis ein Testereignis durchgeht. Jeder Webhook hat ein Protokoll seiner letzten Sendungen. Siehe die [Webhooks-Dokumentation](/api-docs?tab=webhooks).",
    },
    {
        "key": "embed",
        "question": "Können Kandidaten das Interview auf meiner eigenen Website machen?",
        "answer": "Ja, mit dem SDK von testee: einem Skript, das das Interview in deiner Seite anzeigt, auf den Websites, die du auf der API-Seite des Unternehmens erlaubst. Dein Server lädt jeden Kandidaten über die API mit ausgeschalteter Anmeldung ein, sodass er kein testee-Konto braucht und testee ihm keine E-Mails schickt. Es kostet nichts extra; Kandidaten werden wie üblich berechnet. Siehe die [SDK-Dokumentation](/api-docs?tab=sdk).",
    },
    {
        "key": "ai_apps",
        "question": "Kann ich testee aus Claude, ChatGPT oder meinem eigenen KI-Agenten heraus nutzen?",
        "answer": "Ja. Füge testee in Claude oder ChatGPT als Connector hinzu (die Schritte stehen im Tab Integrationen deines Unternehmens) und lass es in testee zu, nur zum Lesen oder auch für Änderungen. Die App arbeitet dann in deinem Namen und mit deinen Berechtigungen mit deinen Unternehmen, Interviews und den Ergebnissen der Kandidaten. Dein Konto oder ein Unternehmen löschst du nur in testee. Was die App liest, geht nach den Bedingungen dieser App an ihren Anbieter. Du kannst sie jederzeit im selben Tab trennen, und Inhaber und Admins können KI-Apps für ein Unternehmen abschalten. Auch andere KI-Apps und selbst gebaute Agenten lassen sich verbinden: Im [MCP-Tab](/api-docs?tab=mcp) der Entwicklerdokumentation stehen die Schritte und Beispiel-Agenten, und ein Agent auf einem Server kann sich mit einem API-Schlüssel anmelden, der die Berechtigung für KI-Agenten hat, und tut nur, was die übrigen Berechtigungen des Schlüssels erlauben. Der [Leitfaden zu KI-Agenten, MCP und APIs](/guides/ai-agents-mcp-and-api) erklärt, wofür jedes davon gedacht ist.",
    },
    {
        "key": "candidates",
        "question": "Was sehen Kandidaten?",
        "answer": "Den Namen und das Logo deines Unternehmens, in den Farben und Schriftarten deines Unternehmens (festgelegt im Tab Marke), vor dem Start, was sie erwartet, dann jeweils eine Frage mit Zeitlimit. Das Interview zeigt ihnen nie ihr Ergebnis oder ob eine Antwort richtig war; nur der Download ihrer eigenen Daten enthält ihr Ergebnis.",
    },
    {
        "key": "brand",
        "question": "Können Interviews die Marke meines Unternehmens tragen?",
        "answer": "Ja, ohne Aufpreis. Im Tab Marke des Unternehmens legen Inhaber und Admins sein Logo, Farben für das helle und das dunkle Design, Schriftarten und die Eckenrundung fest. Kandidaten sehen sie während des gesamten Interviews, ohne die Kopf- und Fußzeile von testee, und das Logo erscheint auch in E-Mails und Berichten.",
    },
    {
        "key": "candidate_account",
        "question": "Brauchen Kandidaten ein Konto?",
        "answer": "Ja, und es ist kostenlos: Sie melden sich mit Google, LinkedIn oder GitHub an, mit der verifizierten E-Mail-Adresse, die du eingeladen hast, sodass eine weitergeleitete Einladung für niemand anderen nutzbar ist. Über einen Link zum Teilen funktioniert jede verifizierte E-Mail-Adresse. Die Ausnahme ist eine Einladung, die deine eigene Plattform über die API erstellt: Sie kann die Anmeldung überspringen.",
    },
    {
        "key": "verified",
        "question": "Was bedeutet das Verifiziert-Häkchen?",
        "answer": "Dass sich ein Inhaber oder Admin des Unternehmens mit einer geschäftlichen E-Mail-Adresse auf der Domain des Unternehmens angemeldet hat, etwa du@acme.com, und unser Team das Unternehmen danach geprüft hat. Füge die Website über Verifizieren im Kopfbereich deines Unternehmens hinzu; kostenlose E-Mail-Dienste zählen nicht. Solange die Prüfung aussteht, sieht dein Team eine Uhr neben dem Namen, und eine Umbenennung schickt das Unternehmen erneut zur Prüfung. Das Häkchen erscheint neben dem Namen deines Unternehmens, auch in Einladungen.",
    },
    {
        "key": "languages",
        "question": "Welche Sprachen werden unterstützt?",
        "answer": "{count} Sprachen, für die Website, die Interviews und die E-Mails. Wähle die Sprache, in der ein Interview geschrieben wird, egal in welcher Sprache die Stellenbeschreibung ist.",
    },
    {
        "key": "mira",
        "question": "Wer ist Mira?",
        "answer": "Der KI-Assistent von testee: eine KI, kein Mensch, und ihre Antworten können falsch sein. Du öffnest sie mit „Mira fragen“ in der Kopfzeile. Besucher können alles über testee fragen. Wenn du angemeldet bist, liest Mira außerdem deine Unternehmen mit deinen Zugriffsrechten und nimmt die Änderungen vor, um die du bittest, jede erst nach deiner Bestätigung. Mira zu fragen kostet keine Credits, und Kandidaten haben sie während eines Interviews nicht.",
    },
    {
        "key": "search",
        "question": "Kann ich testee durchsuchen?",
        "answer": "Ja. Die Suche in der Kopfzeile findet schon beim Tippen deine Unternehmen, Interviews und Kandidaten (nach Name oder E-Mail-Adresse) sowie die Seiten, Ratgeber, Vergleiche, Rechtstexte, FAQ-Fragen und Fachtests der Website. Ohne Anmeldung findet sie nur Öffentliches.",
    },
    {
        "key": "privacy",
        "question": "Was passiert mit Stellenbeschreibungen und Antworten?",
        "answer": "Stellenbeschreibungen werden genutzt, um die Interviews deines Unternehmens zu erstellen, und die Antworten der Kandidaten, um sie für dein Unternehmen zu bewerten. Die Fragen, die testee generiert, können außerdem in Interviews und Übungsinterviews anderer Unternehmen wiederverwendet werden, ohne etwas, das dich, dein Unternehmen oder andere Personen identifiziert; du kannst die Fragen eines Interviews in dessen Einstellungen davon ausnehmen. Zudem leitet testee daraus, wie Fragen beantwortet werden, allgemeine, anonymisierte Muster der Fragenqualität ab, um die Generierung von Fragen zu verbessern. Die [Datenschutzerklärung](/privacy) erklärt, was wir speichern, wie lange und welche Rechte alle haben.",
    },
    {
        "key": "question_bank",
        "question": "Werden die Fragen meines Interviews mit anderen Unternehmen geteilt?",
        "answer": "Standardmäßig ja. Eine von testee generierte Frage kann in den gemeinsamen Fragenpool aufgenommen werden, sobald sie einige Male beantwortet wurde und Prüfungen besteht, dass sie keine Organisation, Person oder Kontaktdaten nennt; die Kopie enthält nichts, was dein Unternehmen identifiziert. Inhaber und Admins können die Fragen eines Interviews in dessen Tab Einstellungen heraushalten; eine unternehmensweite Einstellung gibt es nicht. Bereits wiederverwendete Fragen bleiben, auch wenn dein Unternehmen gelöscht wird.",
    },
    {
        "key": "ai_training",
        "question": "Werden unsere Daten zum Training von KI-Modellen genutzt?",
        "answer": "OpenAI, das die KI von testee antreibt, trainiert seine Modelle laut seinen API-Bedingungen nicht mit dem, was wir ihm senden; es kann die Daten bis zu 30 Tage aufbewahren, nur um Missbrauch zu prüfen, sofern das Gesetz nicht länger verlangt. testee selbst lernt allgemeine, anonymisierte Muster der Fragenqualität, um die Generierung von Fragen zu verbessern.",
    },
    {
        "key": "data_storage",
        "question": "Wo werden unsere Daten gespeichert?",
        "answer": "In Google Cloud, in Belgien. Einige Anbieter verarbeiten Daten in den USA, etwa OpenAI und Resend, gestützt auf den Datenschutzrahmen EU-USA oder die Standardvertragsklauseln der Europäischen Kommission. Die [Vertrauensseite](/trust) nennt sie alle.",
    },
    {
        "key": "eu_ai_law",
        "question": "Darf man in der EU KI für die Vorauswahl von Kandidaten nutzen?",
        "answer": "Ja, mit Regeln. Nach der KI-Verordnung der EU (AI Act) gelten Tools, die Kandidaten bewerten, sehr wahrscheinlich als Hochrisiko-Systeme, mit Pflichten ab dem 2. Dezember 2027, und die DSGVO gilt schon heute: Ein Mensch trifft die Einstellungsentscheidung, Kandidaten erfahren, dass KI eingesetzt wird, und alles wird dokumentiert. testee arbeitet genau so: KI schreibt die Fragen, Menschen in deinem Unternehmen prüfen die Ergebnisse und entscheiden, und Kandidaten werden informiert, bevor sie beginnen. Das ist keine Rechtsberatung; [Ist KI im Recruiting in der EU erlaubt?](/guides/is-ai-hiring-legal-in-the-eu) erklärt die Regeln und Fristen.",
    },
    {
        "key": "uk_us",
        "question": "Können wir testee für Kandidaten in Großbritannien und den USA nutzen?",
        "answer": "Ja. Der Auftragsverarbeitungsvertrag deckt britisches und US-amerikanisches Recht ab, und die Hinweise für Unternehmen sowie die Vorlagen für die Kandidateninformation (mit Fassungen für New York City, Illinois, Colorado und Connecticut) decken ab, was du Kandidaten mitteilen musst. Für Stellen in New York City nutze es erst, wenn du erfüllt hast, was Local Law 144 von dir verlangt: ein unabhängiges Bias-Audit innerhalb des Jahres vor der Nutzung, die Veröffentlichung seiner Zusammenfassung und eine Information der Kandidaten 10 Arbeitstage vorher. Der Export für ein Bias-Audit im Aktionsprotokoll gibt deinem Auditor das Ergebnis jedes Kandidaten, der fertig ist, und ob er bestanden hat, zum Abgleich mit den selbst angegebenen Antworten deiner Kandidaten.",
    },
    {
        "key": "emails",
        "question": "Welche E-Mails sendet testee und wie stelle ich sie ab?",
        "answer": "Service-E-Mails wie Einladungen, Berichte, Abrechnungs-E-Mails und Änderungen unserer Bedingungen werden immer gesendet. Alles andere, etwa die tägliche Aktivitätsübersicht, Erinnerungen, Produkt-Updates und Angebote, wählst du in den Einstellungen unter E-Mails oder stellst es mit dem Link „Abmelden“ in jeder E-Mail ab. Kandidaten können die E-Mails deines Unternehmens oder die Erinnerungen zu einem Interview mit den Links in ihren Einladungen und Erinnerungen abstellen. Neuigkeiten von testee erscheinen in deinen Benachrichtigungen, der Glocke oben; die wichtigsten kommen außerdem als Produkt-Update per E-Mail, aber nur, solange diese Einstellung an ist.",
    },
    {
        "key": "data_export",
        "question": "Kann ich meine Daten herunterladen?",
        "answer": "Ja. „Meine Daten herunterladen“ in den Einstellungen gibt dir eine JSON-Datei mit dem, was testee über dich gespeichert hat; zu den Interviews eines Unternehmens enthält sie deine Antworten und Ergebnisse, aber nicht, welche Antworten richtig waren. Einen Export eines ganzen Unternehmens gibt es nicht: Sein Inhaber kann das Aktionsprotokoll herunterladen, und Mitglieder können die PDF-Berichte der Kandidaten herunterladen.",
    },
    {
        "key": "candidate_data",
        "question": "Wie kann ein Kandidat seine Daten löschen lassen?",
        "answer": "Indem er das Unternehmen bittet, das ihn eingeladen hat: Einen Kandidaten zu widerrufen, der angefangen hat, löscht ihn und seine Ergebnisse endgültig. Oder indem er sein testee-Konto in den Einstellungen löscht, was seine Ergebnisse löscht. Sonst werden Ergebnisse automatisch 12 Monate nach dem letzten Versand der Einladung gelöscht.",
    },
    {
        "key": "delete",
        "question": "Kann ich mein Konto löschen?",
        "answer": "Ja, in den Einstellungen, es sei denn, du bist Inhaber eines Unternehmens, dem andere beigetreten sind: Mach zuerst ein anderes Mitglied zum Inhaber oder lösche es. Dein Konto und deine Daten werden gelöscht, samt den Unternehmen, denen nur du angehörst, und ihren Credits, fordere also vorher jede dir zustehende Erstattung an. Ein Unternehmen behält den Eintrag deiner Einladung ohne deine E-Mail-Adresse, und Kaufbelege bleiben erhalten, wie es das Buchhaltungsrecht verlangt. Vorher kannst du eine Kopie deiner Daten herunterladen.",
    },
    {
        "key": "company_delete",
        "question": "Kann ich ein Unternehmen löschen?",
        "answer": "Ja, wenn du sein Inhaber bist. Seine Interviews, Kandidaten, Ergebnisse und Credits gehen endgültig verloren und sein automatisches Aufladen stoppt, fordere also vorher jede dir zustehende Erstattung an. Kopien seiner Fragen, die schon im gemeinsamen Fragenpool sind, bleiben.",
    },
    {
        "key": "report",
        "question": "Wie melde ich ein Problem?",
        "answer": "Schreib uns über die [Kontaktseite](/contact) und füge die ID dessen ein, worum es geht: „id kopieren“ steht unter dem Namen eines Unternehmens, eines Interviews oder eines Kandidaten, die ID deines Kontos im Kontomenü und in den Einstellungen. Mit der ID finden wir es sofort.",
    },
]
