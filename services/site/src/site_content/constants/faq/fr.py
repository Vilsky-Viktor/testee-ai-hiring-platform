# The FAQ in fr; the {placeholders} are filled in by helpers/help.py (faq_values) with
# billing's prices and the number of languages. Questions not translated yet show in English
# (constants/faq/__init__.py).
FAQ = [
    {
        "key": "what",
        "question": "Qu'est-ce que testee ?",
        "answer": "Un entretien à choix multiples chronométré créé à partir de votre fiche de poste, pour n'importe quel poste. Utilisez-le pour présélectionner les candidats avant de les rencontrer, ou comme une étape à part entière du recrutement : dans les deux cas, vous voyez qui maîtrise vraiment le poste.",
    },
    {
        "key": "roles",
        "question": "Pour quels postes puis-je recruter ?",
        "answer": "Tout poste où les connaissances comptent : support, vente, finance, santé, métiers manuels, ingénierie, marketing et plus encore. Si vous pouvez décrire le poste, testee peut créer un entretien pour lui.",
    },
    {
        "key": "hiring",
        "question": "Comment ça marche ?",
        "answer": "Collez une fiche de poste sur la page d'accueil, indiquez le nom de votre entreprise et vérifiez les thèmes que propose testee. Invitez ensuite des candidats : saisissez leurs e-mails, collez une liste ou importez un fichier. Les candidats qui n'ont pas commencé après quelques jours reçoivent un rappel. Chaque candidat reçoit ses propres questions, chacune chronométrée, et vous voyez son score et chaque réponse dès qu'il a terminé.",
    },
    {
        "key": "templates",
        "question": "Puis-je partir d'un entretien tout prêt ?",
        "answer": "Oui. L'onglet Modèles de votre entreprise liste des entretiens tout prêts par poste, que vous pouvez rechercher et filtrer par niveau et par langue. Les propriétaires et les administrateurs peuvent en copier un dans l'entreprise immédiatement, gratuitement, puis le modifier comme n'importe quel entretien ; les candidats sont facturés comme d'habitude.",
    },
    {
        "key": "link",
        "question": "Puis-je mettre un entretien dans une offre d'emploi ?",
        "answer": "Oui. Activez le lien de partage de l'entretien dans son onglet Paramètres et collez-le dans votre offre. Toute personne qui l'ouvre se connecte et passe l'entretien, et chacune est facturée comme un candidat invité. Sans crédits restants, le lien n'accepte plus de nouvelles personnes. Le lien se désactive quand vous marquez l'entretien comme recruté.",
    },
    {
        "key": "preview",
        "question": "Puis-je essayer un entretien avant d'inviter qui que ce soit ?",
        "answer": "Oui. Ouvrez votre entretien en tant que candidat depuis sa page, gratuitement : les aperçus n'apparaissent ni parmi vos candidats ni dans les statistiques des questions. Vous pouvez aussi passer n'importe lequel des entretiens d'entraînement gratuits.",
    },
    {
        "key": "question_quality",
        "question": "Comment vérifiez-vous que les questions sont justes ?",
        "answer": "Avant qu'un entretien soit prêt, une deuxième IA vérifie un échantillon de ses corrigés. Ensuite, les réponses, les votes et les signalements font ressortir les questions faibles, qui sont corrigées ou remplacées en arrière-plan pour les candidats qui commencent après ; les notes déjà attribuées ne changent pas. Sur la page d'un thème, vous pouvez lire chaque question, et les propriétaires et les administrateurs peuvent en désactiver une, la régénérer ou marquer sa réponse comme fausse.",
    },
    {
        "key": "open-to-offers",
        "question": "Les entreprises peuvent-elles me trouver grâce à mon entraînement ?",
        "answer": "Seulement si vous le choisissez. Activez Ouvert aux opportunités après une session d'entraînement ou dans les Paramètres, avec l'adresse de votre profil LinkedIn. Les entreprises qui ont rechargé sur testee voient alors votre nom, votre profil LinkedIn et votre dernier résultat d'entraînement sur chaque sujet de leurs entretiens sur lequel vous vous êtes entraîné, et peuvent vous inviter à un entretien. testee ne vous classe pas et ne vous recommande pas. Désactivez-le à tout moment dans les Paramètres : vous disparaissez aussitôt de la liste de toutes les entreprises. Il prend aussi fin un an après la dernière fois que vous l'avez activé ou avez enregistré votre profil LinkedIn.",
    },
    {
        "key": "cheating",
        "question": "Les candidats peuvent-ils utiliser une IA ou chercher les réponses ?",
        "answer": "Chaque candidat reçoit des questions tirées au hasard dans chaque thème, dans son propre ordre, avec [un minuteur sur chaque question](/guides/skills-test-timing-and-extra-time) contrôlé par notre serveur, il a donc peu de temps pour chercher les réponses ou demander à une IA. Les résultats montrent aussi quand un candidat a quitté la page, copié du texte ou répondu trop vite pour avoir lu la question. Une fois qu'il a terminé, sa page relève aussi les schémas de réponse que laisse souvent le fait de soumettre les questions à une IA, comme à peu près le même temps sur chaque question ou des questions difficiles réussies alors que des faciles sont ratées, et suggère des questions auxquelles il a bien répondu, à aborder lors d'un entretien en direct. Un schéma est une raison de poser des questions, pas une preuve. Avant de commencer, chaque candidat confirme aussi qu'il répondra par lui-même, sans outils d'IA ni l'aide d'autres personnes, et ses résultats l'indiquent.",
    },
    {
        "key": "practice",
        "question": "Puis-je m'entraîner gratuitement ?",
        "answer": "Oui. La [page d'entraînement](/practice) propose des entretiens gratuits par poste : connectez-vous, choisissez le temps standard, le temps doublé ou sans limite de temps, et voyez votre note et chaque bonne réponse à la fin. Votre entraînement est privé ; les entreprises ne voient un résultat que si vous activez Ouvert aux opportunités.",
    },
    {
        "key": "voice",
        "question": "Les candidats peuvent-ils répondre à l'oral ?",
        "answer": "Oui, si l'entreprise passe un entretien en mode vocal, dans n'importe laquelle des 23 langues de testee ; la qualité de lecture et d'écoute varie selon la langue (le guide « Le mode vocal en 23 langues » la détaille pour chacune). Les questions sont lues à voix haute et les candidats répondent à l'oral ; ce qu'ils disent est transcrit en texte et rapproché d'une réponse. testee ne le conserve pas ; OpenAI, qui s'en charge pour nous, peut le conserver jusqu'à 30 jours, uniquement pour détecter les abus, sauf si la loi exige une durée plus longue. Les voix ne sont pas analysées pour le ton ou les émotions, et les candidats peuvent toujours toucher une réponse à la place.",
    },
    {
        "key": "extra_time",
        "question": "Un candidat peut-il obtenir du temps supplémentaire ?",
        "answer": "Oui. Avant qu'un candidat commence, les propriétaires et les administrateurs peuvent lui donner 25 %, 50 % ou 100 % de temps en plus sur chaque question, sur la page du candidat ; aucun motif n'est enregistré. Une personne qui utilise un lien de partage demande d'abord une invitation personnelle à l'entreprise. Voir [comment chronométrer un test de compétences](/guides/skills-test-timing-and-extra-time).",
    },
    {
        "key": "retake",
        "question": "Un candidat peut-il repasser un entretien ou revenir en arrière ?",
        "answer": "Non. Un entretien se passe une seule fois, d'une traite : un candidat peut changer son choix jusqu'à ce qu'il appuie sur « Question suivante », et il devient alors définitif. Une fois qu'il a terminé, il ne peut plus être invité à cet entretien.",
    },
    {
        "key": "connection",
        "question": "Que se passe-t-il si la connexion d'un candidat coupe ou s'il ferme la page ?",
        "answer": "Il ouvre le même lien et continue. L'horloge de notre serveur tourne entre-temps : une question dont le temps s'écoule pendant son absence compte comme fausse, et le minuteur de la question suivante démarre quand elle s'affiche. Un entretien laissé inachevé prend fin de lui-même une fois sa durée totale écoulée, plus 10 %.",
    },
    {
        "key": "cost",
        "question": "Combien ça coûte ?",
        "answer": "La génération d'entretiens est gratuite. Chaque candidat qui répond à au moins une question coûte {candidate} crédits ({candidate_price}), et moins avec les crédits de recharges plus importantes, jusqu'à {cheapest_price}. Votre première entreprise reçoit {company} crédits gratuits, de quoi couvrir ses {company_candidates} premiers candidats. Les prix n'incluent pas la TVA ni la taxe de vente. La [page des tarifs](/pricing) indique tous les prix.",
    },
    {
        "key": "charged",
        "question": "Quand un candidat est-il facturé ?",
        "answer": "À condition qu'il ait répondu à au moins une question : quand son entretien prend fin (il le termine, ou le temps s'écoule pendant son absence), ou quand vous le révoquez, ce qui efface aussi ses réponses définitivement. Une question dont le temps s'est écoulé sans réponse choisie ne compte pas. Ses crédits sont mis de côté lorsque vous l'invitez (par un lien, quand il commence) et reviennent si vous le révoquez avant qu'il ait répondu à quoi que ce soit, s'il ne commence jamais et que l'invitation expire au bout de 30 jours, ou si son entretien prend fin sans aucune réponse.",
    },
    {
        "key": "compare_hiring",
        "question": "Comment le prix se compare-t-il à celui d'autres outils d'évaluation ?",
        "answer": "Beaucoup d'outils d'évaluation sont vendus sous forme d'abonnement mensuel ou annuel, payé même si vous n'évaluez personne. Avec testee, vous payez uniquement par candidat, avec des crédits achetés à l'avance : {candidate} crédits ({candidate_price}), sans contrat, sans frais par utilisateur et sans rien à payer pour générer un entretien. Une entreprise qui invite {example_candidates} candidats par mois paie environ {example_year_price} par an hors taxes. Si vous évaluez beaucoup de candidats chaque mois, un abonnement peut coûter moins cher : comparez avec vos propres chiffres.",
    },
    {
        "key": "top_up",
        "question": "Comment acheter des crédits ?",
        "answer": "Les propriétaires et les administrateurs rechargent sur la page de recharge, dans le menu du compte, pour {min_candidates} à {max_candidates} candidats à la fois. Paddle encaisse le paiement, ajoute la TVA ou la taxe de vente éventuelle et émet le reçu ou la facture ; la facture de chaque recharge est aussi dans l'onglet Facturation de l'entreprise.",
    },
    {
        "key": "expire",
        "question": "Les crédits expirent-ils ?",
        "answer": "Non. Les crédits n'expirent jamais, et il n'y a aucun abonnement payant. Si vous activez la recharge automatique facultative, Paddle enregistre votre carte sous forme d'abonnement à {zero_price} ; vous ne payez que les recharges qu'elle effectue.",
    },
    {
        "key": "auto_top_up",
        "question": "Les crédits peuvent-ils se recharger automatiquement ?",
        "answer": "Oui, si un propriétaire ou un administrateur l'active sur la page de recharge : choisissez une recharge et le solde sous lequel recharger, puis cochez ce qu'elle débite et quand. Chaque fois que le solde disponible de l'entreprise passe sous ce niveau, la carte enregistrée est débitée, taxes éventuelles en plus, et les propriétaires et administrateurs de l'entreprise reçoivent un e-mail. Un débit refusé est retenté après 1, 3 et 7 jours ; la recharge automatique se met ensuite en pause jusqu'à la mise à jour de la carte. La désactiver là où vous l'avez activée l'arrête immédiatement.",
    },
    {
        "key": "currency",
        "question": "Dans quelle devise est-ce que je paie ?",
        "answer": "Les prix sont dans la devise locale au Canada, en Australie, en Israël, en Pologne, en Suisse, au Japon, en Corée du Sud, à Taïwan, à Hong Kong, en Thaïlande, à Singapour et en Inde ; en euros dans le reste de l'UE ainsi qu'en Islande, au Liechtenstein et en Norvège ; en livres au Royaume-Uni ; et en dollars américains ailleurs. Votre compte et chaque entreprise gardent la devise du pays où ils ont été créés ou utilisés pour la première fois, où que vous voyagiez : changez la vôtre dans les Paramètres, et celle d'une entreprise sur la page de recharge (propriétaires et administrateurs). Les recharges d'une entreprise, automatiques comprises, sont toujours facturées dans la devise de l'entreprise.",
    },
    {
        "key": "referrals",
        "question": "Puis-je gagner des crédits en parrainant une entreprise ?",
        "answer": "Oui. Partagez le lien de l'onglet Parrainage de votre entreprise : quand une nouvelle entreprise créée grâce à lui recharge pour la première fois, quel que soit le montant, les deux entreprises reçoivent {referral} crédits, dans la limite de 25 parrainages par an. Seule la première entreprise associée à l'e-mail de son propriétaire compte, et vos propres entreprises ne comptent pas.",
    },
    {
        "key": "refunds",
        "question": "Puis-je être remboursé ?",
        "answer": "Oui, pour les crédits achetés au cours des 14 derniers jours et non dépensés : sur la page Facturation de votre entreprise, via Paddle ou en nous écrivant. Les crédits réservés à des candidats ne peuvent pas être remboursés tant qu'ils sont réservés ; ceux réservés pendant les 14 jours peuvent être remboursés pendant 7 jours après leur retour. Les crédits offerts, comme le cadeau de bienvenue, ne sont pas remboursés et sont dépensés en premier. Les [conditions](/terms) donnent les détails.",
    },
    {
        "key": "scorecards",
        "question": "Que montrent les fiches d'évaluation des candidats ?",
        "answer": "Chaque réponse, si elle était juste et le temps qu'elle a pris. La note est le pourcentage de points obtenus : chaque question vaut un point, et une question où il faut cocher toutes les bonnes réponses en rapporte une part pour chaque bonne réponse cochée, et rien si une mauvaise est cochée. Les notes s'affichent en vert ou en rouge par rapport au seuil de réussite que vous avez fixé pour l'entretien. Les fiches signalent aussi les réponses trop rapides pour avoir lu la question, les sorties de la page et les tentatives de copie.",
    },
    {
        "key": "reports",
        "question": "Puis-je partager les résultats avec un responsable du recrutement ?",
        "answer": "Oui. Téléchargez un rapport PDF pour un candidat ou pour tous les candidats d'un entretien, envoyez-le par e-mail directement depuis testee, ou envoyez un court résumé sur WhatsApp, Telegram, Viber ou LINE.",
    },
    {
        "key": "action_log",
        "question": "Puis-je voir qui a fait quoi dans mon entreprise ?",
        "answer": "Oui, si vous êtes propriétaire de l'entreprise. Son onglet Journal des actions liste ce que ses membres ont fait, du plus récent au plus ancien : inviter ou retirer des candidats, consulter des résultats, modifier les entretiens, l'équipe, la facturation et les intégrations, avec qui l'a fait, quand, et si l'assistant, une application d'IA, l'API ou un ATS l'a fait en son nom. Vous pouvez le filtrer par membre, type d'action et dates, et le télécharger sous forme de fichier CSV. Les actions sont conservées 12 mois. Les actions d'une clé API apparaissent sous le nom de la clé.",
    },
    {
        "key": "bias_audit",
        "question": "Puis-je exporter les résultats pour un audit des biais ?",
        "answer": "Oui, si vous êtes propriétaire de l'entreprise. L'onglet Journal des actions propose un « Export pour audit des biais » : un fichier CSV de chaque candidat qui a terminé, pour tous les entretiens ou un seul et entre les dates choisies, avec sa note, le seuil de réussite, s'il a réussi et s'il a obtenu un score supérieur à la médiane de l'entretien. testee ne détient aucune donnée sur le sexe, la race ou l'origine ethnique : vous ajoutez donc les réponses déclarées par vos candidats eux-mêmes à l'aide de leur e-mail, et vous supprimez les e-mails avant de remettre le fichier à votre auditeur indépendant.",
    },
    {
        "key": "notes",
        "question": "Mon équipe peut-elle laisser des commentaires sur un entretien ?",
        "answer": "Oui. Chaque entretien a un onglet Commentaires où votre équipe écrit des commentaires en texte brut sur le recrutement, par exemple qui appeler ensuite ou, pour un cabinet de recrutement, pour quel client est l'entretien. Tout membre peut écrire des commentaires, les lecteurs aussi, et modifier les siens ; l'auteur, les propriétaires et les admins peuvent en supprimer un. Les propriétaires et les admins peuvent épingler un commentaire, qui s'affiche alors sous le nom de l'entretien. Les candidats ne voient jamais les commentaires.",
    },
    {
        "key": "team",
        "question": "Puis-je ajouter mon équipe ?",
        "answer": "Oui, et les membres ne coûtent rien. Dans l'onglet Équipe de l'entreprise, le propriétaire invite chaque personne par e-mail comme administrateur ou lecteur. Les administrateurs font tout, sauf gérer l'équipe, voir le journal des actions et supprimer l'entreprise. Les lecteurs voient les entretiens et les résultats, partagent les rapports et écrivent des commentaires, mais ne changent rien d'autre et ne peuvent pas recharger. Un même compte peut posséder plusieurs entreprises, chacune avec son équipe et ses crédits.",
    },
    {
        "key": "integrations",
        "question": "testee fonctionne-t-il avec mon ATS ou d'autres outils ?",
        "answer": "Oui, sans frais supplémentaires ; les candidats sont facturés comme d'habitude. Les propriétaires et les administrateurs connectent Workable, Greenhouse, Teamtailor, Recruitee ou Breezy HR dans l'onglet Intégrations de l'entreprise avec une clé issue de l'ATS, puis associent une offre à un entretien et à une étape : les candidats que vous déplacez vers cette étape reçoivent l'entretien, et leurs résultats reviennent dans l'ATS ([comment connecter vos tests de compétences à votre ATS](/guides/ats-integration-skills-tests)). Slack peut publier les notifications de votre entreprise dans un canal, et l'API permet à votre propre plateforme de créer des entretiens, d'inviter et de gérer des candidats et de recevoir leurs résultats, chaque clé API étant limitée à ce que vous cochez pour elle ; consultez la [Documentation de l'API](/api-docs).",
    },
    {
        "key": "slack",
        "question": "Comment fonctionne l'intégration Slack ?",
        "answer": "Un propriétaire ou un administrateur choisit « Ajouter à Slack » dans l'onglet Intégrations de l'entreprise et sélectionne un canal, puis choisit les notifications qui y arrivent, par exemple un candidat a terminé, une invitation non remise, un candidat de l'ATS non invité ou un nouveau commentaire. C'est gratuit.",
    },
    {
        "key": "api_keys",
        "question": "Comment fonctionnent les clés API ?",
        "answer": "Les propriétaires et les administrateurs les créent sur la page API de l'entreprise, dans Intégrations. Vous cochez ce que chaque clé peut faire, choisissez quand elle expire (dans 1, 3, 6 ou 12 mois, ou jamais) et pouvez la limiter à des adresses IP autorisées. Une clé n'est affichée qu'une fois. Une entreprise peut faire 60 requêtes par minute. La [documentation développeurs](/api-docs) décrit chaque appel.",
    },
    {
        "key": "webhooks",
        "question": "testee peut-il prévenir mon système quand un candidat termine ?",
        "answer": "Oui, avec des webhooks, configurés sur la page API de l'entreprise. testee appelle votre adresse quand un candidat commence, termine (avec ses résultats), n'est pas joignable, expire ou est retiré, et quand un entretien est prêt, et signe chaque appel avec votre secret. Un appel qui échoue est retenté pendant 3 jours ; le webhook se met ensuite en pause jusqu'à ce qu'un événement de test aboutisse. Chaque webhook a un journal de ses derniers envois. Voir la [documentation des webhooks](/api-docs?tab=webhooks).",
    },
    {
        "key": "embed",
        "question": "Les candidats peuvent-ils passer l'entretien sur mon propre site ?",
        "answer": "Oui, avec le SDK de testee : un script qui affiche l'entretien dans votre page, sur les sites que vous autorisez sur la page API de l'entreprise. Votre serveur invite chaque candidat via l'API avec la connexion désactivée : il n'a donc pas besoin de compte testee et testee ne lui envoie aucun e-mail. Cela ne coûte rien de plus ; les candidats sont facturés comme d'habitude. Voir la [documentation du SDK](/api-docs?tab=sdk).",
    },
    {
        "key": "ai_apps",
        "question": "Puis-je utiliser testee depuis Claude, ChatGPT ou mon propre agent IA ?",
        "answer": "Oui. Ajoutez testee à Claude ou ChatGPT comme connecteur (les étapes sont dans l'onglet Intégrations de votre entreprise) et autorisez-le sur testee, en lecture seule ou aussi pour faire des modifications. L'application travaille alors avec vos entreprises, vos entretiens et les résultats des candidats en votre nom, avec vos droits. La suppression de votre compte ou d'une entreprise se fait uniquement dans testee. Ce que l'application lit parvient à son fournisseur, selon les conditions de cette application. Vous pouvez la déconnecter à tout moment dans le même onglet, et les propriétaires et administrateurs peuvent désactiver les applications d'IA pour une entreprise. D'autres applications d'IA et les agents que vous créez vous-même peuvent aussi se connecter : l'[onglet MCP](/api-docs?tab=mcp) de la documentation développeurs donne les étapes et des exemples d'agents, et un agent sur un serveur peut se connecter avec une clé API dotée de l'autorisation pour les agents IA, en ne faisant que ce que les autres autorisations de la clé permettent. Le [guide des agents IA, du MCP et des API](/guides/ai-agents-mcp-and-api) explique à quoi sert chacun.",
    },
    {
        "key": "candidates",
        "question": "Que voient les candidats ?",
        "answer": "Le nom et le logo de votre entreprise, aux couleurs et dans les polices de votre entreprise (définies dans son onglet Marque), ce qui les attend avant de commencer, puis une question chronométrée à la fois. L'entretien ne leur montre jamais leur score ni si une réponse était juste ; seul le téléchargement de leurs propres données contient leur note.",
    },
    {
        "key": "brand",
        "question": "Les entretiens peuvent-ils porter la marque de mon entreprise ?",
        "answer": "Oui, sans frais supplémentaires. Dans l'onglet Marque de l'entreprise, les propriétaires et les administrateurs définissent son logo, les couleurs des thèmes clair et sombre, les polices et l'arrondi des coins. Les candidats les voient pendant tout l'entretien, sans l'en-tête ni le pied de page de testee, et le logo apparaît aussi dans les e-mails et les rapports.",
    },
    {
        "key": "candidate_account",
        "question": "Les candidats ont-ils besoin d'un compte ?",
        "answer": "Oui, et il est gratuit : ils se connectent avec Google, LinkedIn ou GitHub, avec l'e-mail vérifié que vous avez invité, si bien qu'une invitation transférée ne sert à personne d'autre. Avec un lien de partage, n'importe quel e-mail vérifié fonctionne. Seule exception : une invitation créée par votre propre plateforme via l'API, qui peut se passer de connexion.",
    },
    {
        "key": "verified",
        "question": "Que signifie la coche de vérification ?",
        "answer": "Qu'un propriétaire ou un administrateur de l'entreprise s'est connecté avec un e-mail professionnel sur le site de l'entreprise, comme vous@acme.com, puis que notre équipe a examiné l'entreprise. Ajoutez le site avec Vérifier dans l'en-tête de votre entreprise ; les services d'e-mail gratuits ne comptent pas. Tant que l'examen est en attente, votre équipe voit une horloge à côté du nom, et renommer l'entreprise la renvoie en examen. La coche s'affiche à côté du nom de votre entreprise, y compris dans les invitations.",
    },
    {
        "key": "languages",
        "question": "Quelles langues sont prises en charge ?",
        "answer": "{count} langues, pour le site, les entretiens et les e-mails. Choisissez la langue dans laquelle un entretien est rédigé, quelle que soit la langue de la fiche de poste.",
    },
    {
        "key": "mira",
        "question": "Qui est Mira ?",
        "answer": "L'assistant IA de testee : une IA, pas une personne, et ses réponses peuvent être fausses. Ouvrez-la avec « demander à Mira » dans l'en-tête. Les visiteurs peuvent poser n'importe quelle question sur testee. Si vous êtes connecté, Mira lit aussi vos entreprises avec vos accès et fait les modifications que vous demandez, chacune seulement après votre confirmation. Demander à Mira ne consomme aucun crédit, et les candidats n'y ont pas accès pendant un entretien.",
    },
    {
        "key": "search",
        "question": "Puis-je faire une recherche sur testee ?",
        "answer": "Oui. La recherche dans l'en-tête trouve, pendant que vous tapez, vos entreprises, entretiens et candidats (par nom ou e-mail), ainsi que les pages, guides, comparatifs, textes juridiques, questions de la FAQ et tests de compétences du site. Sans connexion, elle ne trouve que ce qui est public.",
    },
    {
        "key": "privacy",
        "question": "Que deviennent les fiches de poste et les réponses ?",
        "answer": "Les fiches de poste servent à créer les entretiens de votre entreprise, et les réponses des candidats à les noter pour votre entreprise. Les questions générées par testee peuvent aussi être réutilisées dans les entretiens et l'entraînement d'autres entreprises, sans rien qui vous identifie, vous, votre entreprise ou toute autre personne ; vous pouvez exclure de cette réutilisation les questions d'un entretien dans ses paramètres. testee tire aussi des réponses données aux questions des tendances générales et anonymisées sur leur qualité, afin d'améliorer la façon dont les questions sont générées. La [politique de confidentialité](/privacy) explique ce que nous conservons, pendant combien de temps, et les droits de chacun.",
    },
    {
        "key": "question_bank",
        "question": "Les questions de mon entretien sont-elles partagées avec d'autres entreprises ?",
        "answer": "Par défaut, oui. Une question générée par testee peut rejoindre sa banque de questions partagée une fois qu'elle a reçu quelques réponses et qu'elle a passé des contrôles vérifiant qu'elle ne cite aucune organisation, personne ni coordonnée ; la copie ne contient rien qui identifie votre entreprise. Les propriétaires et les administrateurs peuvent exclure les questions d'un entretien dans son onglet Paramètres ; il n'existe pas de réglage pour toute l'entreprise. Les questions déjà réutilisées restent, même si votre entreprise est supprimée.",
    },
    {
        "key": "ai_training",
        "question": "Nos données servent-elles à entraîner des modèles d'IA ?",
        "answer": "OpenAI, qui fait fonctionner l'IA de testee, n'entraîne pas ses modèles sur ce que nous lui envoyons, selon ses conditions d'API ; il peut le conserver jusqu'à 30 jours, uniquement pour détecter les abus, sauf si la loi exige plus longtemps. testee apprend lui-même des tendances générales et anonymisées sur la qualité des questions, afin d'améliorer la façon dont elles sont générées.",
    },
    {
        "key": "data_storage",
        "question": "Où nos données sont-elles stockées ?",
        "answer": "Sur Google Cloud, en Belgique. Certains prestataires traitent des données aux États-Unis, comme OpenAI et Resend, sous le cadre de protection des données UE-États-Unis ou les clauses contractuelles types de la Commission européenne. La [page de confiance](/trust) les liste tous.",
    },
    {
        "key": "eu_ai_law",
        "question": "Est-il légal d'utiliser l'IA pour présélectionner des candidats dans l'UE ?",
        "answer": "Oui, avec des règles. Selon le règlement européen sur l'IA (AI Act), les outils qui notent des candidats sont très probablement à haut risque, avec des obligations à partir du 2 décembre 2027, et le RGPD s'applique déjà : une personne prend la décision d'embauche, les candidats sont informés de l'usage de l'IA et des traces sont conservées. testee fonctionne ainsi : l'IA rédige les questions, des personnes de votre entreprise examinent les résultats et décident, et les candidats sont informés avant de commencer. Ceci n'est pas un conseil juridique ; [L'IA dans le recrutement est-elle légale dans l'UE ?](/guides/is-ai-hiring-legal-in-the-eu) explique les règles et les dates.",
    },
    {
        "key": "uk_us",
        "question": "Pouvons-nous utiliser testee pour des candidats au Royaume-Uni et aux États-Unis ?",
        "answer": "Oui. L'accord de traitement des données couvre le droit britannique et américain, et les instructions pour les entreprises ainsi que les modèles d'information des candidats (avec des versions pour la ville de New York, l'Illinois et le Colorado) couvrent ce que vous devez dire aux candidats. Pour des postes dans la ville de New York, ne l'utilisez qu'une fois que vous avez fait ce que la Local Law 144 exige de vous : un audit de biais indépendant dans l'année précédant l'utilisation, la publication de son résumé et une information des candidats 10 jours ouvrables avant. L'export pour audit de biais du Journal des actions donne à votre auditeur la note et le résultat de chaque candidat qui a terminé, à rapprocher des réponses que vos candidats ont eux-mêmes déclarées.",
    },
    {
        "key": "emails",
        "question": "Quels e-mails testee envoie-t-il, et comment les arrêter ?",
        "answer": "Les e-mails de service, comme les invitations, les rapports, les e-mails de facturation et les modifications de nos conditions, sont toujours envoyés. Les autres, comme le récapitulatif d'activité quotidien, les rappels, les nouveautés du produit et les offres, se choisissent dans les Paramètres, sous E-mails, ou s'arrêtent avec le lien « Se désabonner » de chaque e-mail. Les candidats peuvent arrêter les e-mails de votre entreprise, ou les rappels d'un entretien, avec les liens de leurs invitations et rappels. Les actualités de testee s'affichent dans vos notifications, la cloche en haut ; les plus importantes arrivent aussi par e-mail comme nouveauté du produit, uniquement tant que ce réglage est activé.",
    },
    {
        "key": "data_export",
        "question": "Puis-je télécharger mes données ?",
        "answer": "Oui. « Télécharger mes données » dans les Paramètres vous donne un fichier JSON avec ce que testee détient sur vous ; pour les entretiens d'une entreprise, il contient vos réponses et vos notes, mais pas quelles réponses étaient justes. Il n'y a pas d'export d'une entreprise entière : son propriétaire peut télécharger le journal des actions, et les membres peuvent télécharger les rapports PDF des candidats.",
    },
    {
        "key": "candidate_data",
        "question": "Comment un candidat peut-il faire supprimer ses données ?",
        "answer": "En le demandant à l'entreprise qui l'a invité : révoquer un candidat qui a commencé l'efface définitivement, avec ses résultats. Ou en supprimant son compte testee dans les Paramètres, ce qui supprime ses résultats. Sinon, les résultats sont supprimés automatiquement 12 mois après le dernier envoi de l'invitation.",
    },
    {
        "key": "delete",
        "question": "Puis-je supprimer mon compte ?",
        "answer": "Oui, dans les Paramètres, sauf si vous êtes propriétaire d'une entreprise que d'autres ont rejointe : faites d'abord d'un autre membre son propriétaire, ou supprimez-la. Votre compte et vos données sont supprimés, avec les entreprises dont vous êtes le seul membre et leurs crédits : demandez donc d'abord tout remboursement auquel vous avez droit. Une entreprise garde la trace de votre invitation sans votre e-mail, et les justificatifs d'achat sont conservés comme l'exige le droit comptable. Vous pouvez d'abord télécharger une copie de vos données.",
    },
    {
        "key": "company_delete",
        "question": "Puis-je supprimer une entreprise ?",
        "answer": "Oui, si vous en êtes propriétaire. Ses entretiens, candidats, résultats et crédits disparaissent définitivement et sa recharge automatique s'arrête : demandez donc d'abord tout remboursement auquel vous avez droit. Les copies de ses questions déjà présentes dans la banque de questions partagée restent.",
    },
    {
        "key": "report",
        "question": "Comment signaler un problème ?",
        "answer": "Écrivez-nous depuis la [page de contact](/contact) et collez l'ID de ce qui est concerné : « copier l'id » se trouve sous le nom d'une entreprise, d'un entretien ou d'un candidat, et celui de votre compte dans le menu de votre compte et dans les Paramètres. Avec l'ID, nous le retrouvons aussitôt.",
    },
]
