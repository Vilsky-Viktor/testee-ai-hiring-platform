# The FAQ in fil; the {placeholders} are filled in by helpers/help.py (faq_values) with
# billing's prices and the number of languages. Questions not translated yet show in English
# (constants/faq/__init__.py).
FAQ = [
    {
        "key": "what",
        "question": "Ano ang testee?",
        "answer": "Isang timed multiple-choice interview mula sa iyong job description, para sa kahit anong role. Gamitin ito para i-screen ang mga aplikante bago mo sila makilala, o bilang mismong hakbang ng hiring: alinman dito, makikita mo kung sino ang talagang marunong sa trabaho.",
    },
    {
        "key": "roles",
        "question": "Para sa aling mga role ako puwedeng mag-hire?",
        "answer": "Kahit anong role kung saan mahalaga ang kaalaman: support, sales, finance, healthcare, trades, engineering, marketing at iba pa. Kung kaya mong ilarawan ang trabaho, kayang gumawa ng testee ng interview para dito.",
    },
    {
        "key": "hiring",
        "question": "Paano ito gumagana?",
        "answer": "Mag-paste ng job description sa home page, pangalanan ang iyong kumpanya at tingnan ang mga topic na iminumungkahi ng testee. Pagkatapos ay mag-imbita ng mga aplikante: i-type ang kanilang mga email, mag-paste ng listahan o mag-upload ng file. Ang mga aplikanteng hindi pa nagsisimula pagkalipas ng ilang araw ay makakatanggap ng isang paalala. Bawat aplikante ay may sariling mga tanong at timer sa bawat isa, at makikita mo ang kanilang score at bawat sagot sa sandaling matapos sila.",
    },
    {
        "key": "templates",
        "question": "Puwede ba akong magsimula sa isang handang interview?",
        "answer": "Oo. Nakalista sa tab na Mga template ng iyong kumpanya ang mga handang interview ayon sa role, na puwede mong hanapin at i-filter ayon sa antas at wika. Puwedeng kopyahin ng mga may-ari at admin ang isa papunta sa kumpanya agad, nang libre, at pagkatapos ay baguhin ito tulad ng anumang interview; sinisingil ang mga aplikante gaya ng dati.",
    },
    {
        "key": "link",
        "question": "Puwede ko bang ilagay ang interview sa isang job ad?",
        "answer": "Oo. I-on ang shareable link ng interview sa tab nitong Mga setting at i-paste ito sa iyong ad. Ang sinumang magbukas nito ay magsa-sign in at sasagot sa interview, at sinisingil ang bawat tao tulad ng isang inimbitahang aplikante. Kapag wala nang credits, hindi na tatanggap ng bagong tao ang link. Mag-o-off ang link kapag minarkahan mo ang interview bilang na-hire.",
    },
    {
        "key": "preview",
        "question": "Puwede ko bang subukan ang interview bago mag-imbita ng kahit sino?",
        "answer": "Oo. Buksan ang iyong interview bilang aplikante mula sa page nito, nang libre: hindi lumalabas ang mga preview sa iyong mga aplikante o sa statistics ng mga tanong. Puwede mo ring sagutan ang alinman sa mga libreng practice interview.",
    },
    {
        "key": "question_quality",
        "question": "Paano ninyo sinusuri na tama ang mga tanong?",
        "answer": "Bago maging handa ang isang interview, sinusuri ng pangalawang AI ang sample ng mga answer key nito. Pagkatapos, tinutukoy ng mga sagot, boto at report ang mahihinang tanong, na itinatama o pinapalitan sa background para sa mga aplikanteng magsisimula pagkatapos; hindi nagbabago ang mga naibigay nang grade. Sa page ng isang topic, mababasa mo ang bawat tanong, at puwedeng i-disable ito ng mga may-ari at admin, i-regenerate ito o markahang mali ang sagot nito.",
    },
    {
        "key": "open-to-offers",
        "question": "Puwede ba akong mahanap ng mga kumpanya sa pamamagitan ng practice ko?",
        "answer": "Kung pipiliin mo lang. I-on ang Open to offers pagkatapos ng isang practice round o sa Settings, kasama ang address ng iyong LinkedIn profile. Makikita na ng mga kumpanyang nag-top up na sa testee ang pangalan mo, LinkedIn profile at pinakabagong resulta ng practice mo sa bawat topic ng kanilang mga interview na pinag-practice-an mo, at puwede ka nilang imbitahan sa isang interview. Hindi ka nira-rank o inirerekomenda ng testee. I-off ito kahit kailan sa Settings, at agad kang mawawala sa listahan ng bawat kumpanya; natatapos din ito isang taon matapos mo itong huling i-on o i-save ang iyong LinkedIn profile.",
    },
    {
        "key": "cheating",
        "question": "Puwede bang gumamit ng AI ang mga aplikante o hanapin ang mga sagot?",
        "answer": "Bawat aplikante ay nakakakuha ng mga tanong na random na pinili mula sa bawat topic, sa sarili nilang pagkakasunod-sunod, may [timer sa bawat tanong](/guides/skills-test-timing-and-extra-time) na binabantayan ng aming server, kaya kaunti lang ang oras para maghanap ng sagot o magtanong sa AI. Ipinapakita rin ng scorecard ng aplikante kung kailan siya umalis sa page, kumopya ng text, o sumagot nang masyadong mabilis para nabasa ang tanong. Kapag tapos na siya, itinuturo rin ng kanyang page ang mga pattern ng sagot na kadalasang naiiwan kapag ipinapasa ang mga tanong sa AI, gaya ng halos parehong oras sa bawat tanong o tama ang mahihirap na tanong habang mali ang madadali, at nagmumungkahi ng mga tanong na tama ang sagot niya para itanong sa isang live na interview. Ang pattern ay dahilan para magtanong, hindi patunay. Bago magsimula, kinukumpirma rin ng bawat aplikante na sasagot siya nang mag-isa, nang walang AI tool o tulong ng ibang tao, at ipinapakita ito ng kanyang scorecard.",
    },
    {
        "key": "practice",
        "question": "Puwede ba akong mag-practice nang libre?",
        "answer": "Oo. May mga libreng interview ayon sa role ang [practice page](/practice): mag-sign in, pumili ng standard na oras, dobleng oras o walang time limit, at makikita mo ang grade mo at bawat tamang sagot sa dulo. Pribado ang practice mo; makakakita lang ng resulta ang mga kumpanya kung i-on mo ang Open to offers.",
    },
    {
        "key": "voice",
        "question": "Puwede bang sumagot gamit ang boses ang mga aplikante?",
        "answer": 'Oo, kung itinakda ng kumpanya ang interview sa voice mode, sa alinman sa 23 wika ng testee; nag-iiba-iba sa bawat wika kung gaano ito kahusay magbasa at makinig (ipinapakita ng gabay na "Voice interview sa 23 wika" ang kalidad sa bawat isa). Binabasa nang malakas ang mga tanong at sumasagot nang pasalita ang mga aplikante; ginagawang text ang sinasabi nila at itinutugma sa isang opsyon. Hindi ito sine-save ng testee; maaari itong itago ng OpenAI, na gumagawa nito para sa amin, nang hanggang 30 araw, para lang suriin kung may pang-aabuso maliban kung mas matagal ang hinihingi ng batas. Hindi sinusuri ang boses para sa tono o emosyon, at puwedeng mag-tap na lang palagi ang mga aplikante.',
    },
    {
        "key": "extra_time",
        "question": "Puwede bang bigyan ng dagdag na oras ang isang aplikante?",
        "answer": "Oo. Bago magsimula ang aplikante, puwede siyang bigyan ng mga may-ari at admin ng 25%, 50% o 100% na dagdag na oras sa bawat tanong, sa page ng aplikante; walang itinatalang dahilan. Ang gumagamit ng shareable link ay hihingi muna ng personal na imbitasyon sa kumpanya. Tingnan ang [paano itakda ang oras ng skills test](/guides/skills-test-timing-and-extra-time).",
    },
    {
        "key": "retake",
        "question": "Puwede bang ulitin ng aplikante ang interview o bumalik?",
        "answer": "Hindi. Isang beses lang sinasagutan ang interview, nang tuloy-tuloy: puwedeng baguhin ng aplikante ang pinili niya hanggang pindutin niya ang Susunod na tanong, at pagkatapos ay pinal na ito. Kapag tapos na siya, hindi na siya maiimbitahan ulit sa interview na iyon.",
    },
    {
        "key": "connection",
        "question": "Paano kung maputol ang koneksyon ng aplikante o isara niya ang page?",
        "answer": "Bubuksan niya ang parehong link at magpapatuloy. Tumatakbo pa rin ang orasan ng aming server samantala: mali ang bilang sa tanong na naubusan ng oras habang wala siya, at magsisimula ang timer ng susunod na tanong kapag ipinakita ito. Kusang natatapos ang hindi natapos na interview kapag lumipas na ang kabuuang oras nito, dagdag ang 10%.",
    },
    {
        "key": "cost",
        "question": "Magkano ito?",
        "answer": "Libre ang paggawa ng interview. Bawat aplikanteng sumagot ng kahit isang tanong ay {candidate} credits ({candidate_price}), at mas mura gamit ang credits mula sa mas malalaking top-up, hanggang {cheapest_price}. Makakatanggap ang iyong unang kumpanya ng {company} libreng credits, sapat para sa unang {company_candidates} aplikante nito. Hindi kasama sa mga presyo ang VAT o sales tax. Nakalista sa [pricing page](/pricing) ang bawat presyo.",
    },
    {
        "key": "charged",
        "question": "Kailan sinisingil ang isang aplikante?",
        "answer": "Kapag may nasagot na siyang kahit isang tanong: kapag natapos ang interview niya (tinapos niya ito, o naubos ang oras nito habang wala siya), o kapag binawi mo siya, na permanenteng nagbubura rin ng mga sagot niya. Hindi binibilang ang tanong na naubusan ng oras nang walang napiling sagot. Itinatabi ang credits niya kapag inimbitahan mo siya (sa link, kapag nagsimula siya), at ibinabalik kung bawiin mo siya bago siya makasagot ng anuman, kung hindi siya kailanman magsimula at mag-expire ang imbitasyon pagkalipas ng 30 araw, o kung matapos ang interview niya nang wala siyang nasagot.",
    },
    {
        "key": "compare_hiring",
        "question": "Paano maihahambing ang presyo sa ibang assessment tool?",
        "answer": "Maraming assessment tool ang ibinebenta bilang buwanan o taunang subscription na binabayaran kahit wala kang tine-test. Sa testee, nagbabayad ka lang kada aplikante, gamit ang credits na binili nang maaga: {candidate} credits ({candidate_price}), walang kontrata, walang bayad kada user, at walang bayad sa paggawa ng interview. Ang kumpanyang nag-iimbita ng {example_candidates} aplikante kada buwan ay nagbabayad ng mga {example_year_price} kada taon bago ang buwis. Kung maraming aplikante ang tine-test mo buwan-buwan, maaaring mas mura ang subscription, kaya ihambing sa sarili mong mga numero.",
    },
    {
        "key": "top_up",
        "question": "Paano ako bibili ng credits?",
        "answer": "Nagto-top up ang mga may-ari at admin sa top-up page, sa account menu, para sa {min_candidates} hanggang {max_candidates} aplikante sa bawat pagkakataon. Ang Paddle ang tumatanggap ng bayad, nagdaragdag ng anumang VAT o sales tax at nag-iisyu ng resibo o invoice; nasa tab na Billing ng kumpanya rin ang invoice ng bawat top-up.",
    },
    {
        "key": "expire",
        "question": "Nag-e-expire ba ang credits?",
        "answer": "Hindi. Hindi kailanman nag-e-expire ang credits, at walang bayad na subscription. Kung bubuksan mo ang opsyonal na awtomatikong top-up, ise-save ng Paddle ang card mo bilang {zero_price} na subscription; ang mga top-up lang na ginagawa nito ang babayaran mo.",
    },
    {
        "key": "auto_top_up",
        "question": "Puwede bang awtomatikong mag-top up ang credits?",
        "answer": "Oo, kung i-on ito ng may-ari o admin sa top-up page: pumili ng top-up at ng balanse kung saan ito magre-refill, at i-tick ang sinisingil nito at kung kailan. Sa tuwing bababa sa antas na iyon ang available na balanse ng kumpanya, sisingilin ang naka-save na card, kasama ang anumang buwis, at makakatanggap ng email ang mga may-ari at admin ng kumpanya. Sinusubukan ulit ang tinanggihang singil pagkalipas ng 1, 3 at 7 araw; pagkatapos ay nagpa-pause ang awtomatikong top-up hanggang ma-update ang card. Kapag in-off mo ito, kung saan mo ito in-on, titigil ito agad.",
    },
    {
        "key": "currency",
        "question": "Anong currency ang ibabayad ko?",
        "answer": "Nasa lokal na currency ang mga presyo sa Canada, Australia, Israel, Poland, Switzerland, Japan, South Korea, Taiwan, Hong Kong, Thailand, Singapore at India; sa euro sa iba pang bahagi ng EU at sa Iceland, Liechtenstein at Norway; sa pound sa UK; at sa US dollars sa ibang lugar. Pinananatili ng account mo at ng bawat kumpanya ang currency ng bansa kung saan sila ginawa o unang ginamit, saan ka man bumiyahe: palitan ang sa iyo sa Mga setting, at ang sa isang kumpanya sa top-up page (mga owner at admin). Ang mga top-up ng isang kumpanya, pati ang mga awtomatiko, ay laging sinisingil sa currency ng kumpanya. Kapag pinalitan mo ang currency ng kumpanya habang naka-on ang awtomatikong top-up, makikita mo muna ang dalawang halaga para kumpirmahin, at makakatanggap ng email ang mga may-ari at admin ng kumpanya.",
    },
    {
        "key": "referrals",
        "question": "Puwede ba akong kumita ng credits sa pag-refer ng kumpanya?",
        "answer": "Oo. I-share ang link sa tab na Referrals ng iyong kumpanya: kapag nag-top up sa unang pagkakataon ang bagong kumpanyang ginawa gamit ito, anumang halaga, makakatanggap ang dalawang kumpanya ng tig-{referral} credits, para sa hanggang 25 referral kada taon. Ang unang kumpanya lang ng email ng may-ari nito ang binibilang, at hindi binibilang ang sarili mong mga kumpanya.",
    },
    {
        "key": "refunds",
        "question": "Puwede ba akong ma-refund?",
        "answer": "Oo, para sa credits na binili mo sa nakaraang 14 na araw at hindi pa nagagastos: sa billing page ng kumpanya mo, sa Paddle o sa pagsulat sa amin. Hindi mare-refund ang credits na naka-reserve para sa mga aplikante habang naka-reserve; ang mga inilaan sa loob ng 14 na araw na iyon ay mare-refund sa loob ng 7 araw pagkabalik nila. Hindi nire-refund ang libreng credits, gaya ng welcome gift, at ang mga ito ang unang binibilang na nagastos. Nasa [terms](/terms) ang mga detalye.",
    },
    {
        "key": "scorecards",
        "question": "Ano ang ipinapakita ng scorecard ng aplikante?",
        "answer": 'Bawat sagot, kung tama ito at gaano katagal ito. Ang grade ay ang porsiyento ng puntos na nakuha: bawat tanong ay isang puntos, at ang tanong na "piliin ang lahat ng tama" ay nagbibigay ng bahagi nito sa bawat tamang opsyong na-check, at wala kung may na-check na mali. Berde o pula ang mga grade batay sa passing grade na itinakda mo para sa interview. Nagfa-flag din ang scorecard ng mga sagot na masyadong mabilis para nabasa ang tanong, mga pagkakataong umalis ang aplikante sa page, at mga pagtatangkang mangopya.',
    },
    {
        "key": "reports",
        "question": "Puwede ko bang i-share ang mga resulta sa isang hiring manager?",
        "answer": "Oo. Mag-download ng PDF report para sa isang aplikante o para sa lahat ng aplikante ng isang interview, i-email ito direkta mula sa testee, o magpadala ng maikling buod sa WhatsApp, Telegram, Viber o LINE.",
    },
    {
        "key": "action_log",
        "question": "Puwede ko bang makita kung sino ang gumawa ng ano sa kumpanya ko?",
        "answer": "Oo, kung ikaw ang may-ari ng kumpanya. Nakalista sa tab na Log ng aksyon nito ang mga ginawa ng mga miyembro nito, simula sa pinakabago: pag-imbita o pag-alis ng mga aplikante, pagtingin sa mga resulta, at pagbabago sa mga interview, sa team, sa billing at sa mga integration, kasama kung sino ang gumawa, kailan, at kung ang assistant, isang AI app, ang API o isang ATS ang gumawa nito para sa kanila. Puwede mo itong i-filter ayon sa miyembro, uri ng aksyon at petsa, at i-download bilang CSV file. Itinatago ang mga aksyon nang 12 buwan. Ang mga aksyon ng isang API key ay ipinapakita sa pangalan ng key.",
    },
    {
        "key": "bias_audit",
        "question": "Puwede ko bang i-export ang mga resulta para sa bias audit?",
        "answer": "Oo, kung ikaw ang may-ari ng kumpanya. May Bias audit export ang tab na Log ng aksyon: isang CSV file ng bawat aplikanteng natapos, para sa lahat ng interview o isa at sa pagitan ng mga napiling petsa, kasama ang grade nila, ang passing grade, kung pumasa sila at kung lampas sila sa median ng interview. Walang hawak na data ang testee tungkol sa kasarian, lahi o etnisidad, kaya ikaw ang magdaragdag ng mga self-reported na sagot ng iyong mga aplikante ayon sa email, at aalisin mo ang mga email bago ibigay ang file sa iyong independiyenteng auditor.",
    },
    {
        "key": "notes",
        "question": "Puwede bang magtala ng mga note ang team ko tungkol sa isang interview?",
        "answer": "Oo. May tab na Mga note ang bawat interview kung saan nagsusulat ang team mo ng mga plain-text na note tungkol sa hiring, gaya ng kung sino ang susunod na tatawagan o, para sa isang recruitment agency, kung para saang kliyente ang interview. Puwedeng magsulat ng note ang bawat miyembro, pati ang mga viewer, at i-edit ang sarili nilang note; puwede itong i-delete ng sumulat, ng mga may-ari at ng mga admin. Puwedeng mag-pin ng isang note ang mga may-ari at admin, na lalabas sa ilalim ng pangalan ng interview. Hindi kailanman nakikita ng mga aplikante ang mga note.",
    },
    {
        "key": "team",
        "question": "Puwede ko bang idagdag ang team ko?",
        "answer": "Oo, at walang bayad ang mga miyembro. Sa tab na Team ng kumpanya, iniimbitahan ng may-ari ang bawat tao sa email bilang admin o viewer. Nagagawa ng mga admin ang lahat maliban sa pamamahala ng team, pagtingin sa log ng aksyon at pagbura ng kumpanya. Nakikita ng mga viewer ang mga interview at resulta, nagsa-share ng mga report at nagsusulat ng mga note, pero wala nang ibang binabago at hindi makakapag-top up. Puwedeng magmay-ari ang isang account ng ilang kumpanya, bawat isa ay may sariling team at credits.",
    },
    {
        "key": "integrations",
        "question": "Gumagana ba ang testee sa ATS ko o sa iba pang tool?",
        "answer": "Oo, nang walang dagdag na bayad; sinisingil ang mga aplikante gaya ng dati. Iko-connect ng mga may-ari at admin ang Workable, Greenhouse, Teamtailor, Recruitee o Breezy HR sa tab na Mga integration ng kumpanya gamit ang key mula sa ATS, pagkatapos ay ili-link ang isang job sa isang interview at stage: makukuha ng mga aplikanteng ililipat mo sa stage na iyon ang interview, at babalik sa ATS ang mga resulta nila ([paano ikonekta ang skills tests sa iyong ATS](/guides/ats-integration-skills-tests)). Kayang i-post ng Slack ang mga notification ng iyong kumpanya sa isang channel, at sa pamamagitan ng API, makakagawa ang sarili mong platform ng mga interview, makakapag-imbita at makakapamahala ng mga aplikante, at makakatanggap ng mga resulta nila, at limitado ang bawat API key sa kung ano ang i-check mo para rito; tingnan ang [Dokumentasyon ng API](/api-docs).",
    },
    {
        "key": "slack",
        "question": "Paano gumagana ang Slack integration?",
        "answer": 'Pinipili ng may-ari o admin ang "Idagdag sa Slack" sa tab na Mga integration ng kumpanya at pumipili ng isang channel, pagkatapos ay pinipili kung aling mga notification ang mapupunta roon, gaya ng natapos ang aplikante, hindi naihatid na imbitasyon, hindi naimbitahang aplikante mula sa ATS o bagong note. Libre ito.',
    },
    {
        "key": "api_keys",
        "question": "Paano gumagana ang mga API key?",
        "answer": "Ginagawa ito ng mga may-ari at admin sa API page ng kumpanya, sa ilalim ng Mga integration. Ikaw ang nagti-tick kung ano ang puwedeng gawin ng bawat key, pumipili kung kailan ito mag-e-expire (sa loob ng 1, 3, 6 o 12 buwan, o hindi kailanman) at puwede mo itong limitahan sa mga pinapayagang IP address. Isang beses lang ipinapakita ang key. Puwedeng gumawa ang kumpanya ng 60 request kada minuto. Inilalarawan ng [dokumentasyon para sa mga developer](/api-docs) ang bawat call.",
    },
    {
        "key": "webhooks",
        "question": "Puwede bang sabihin ng testee sa system ko kapag natapos ang aplikante?",
        "answer": "Oo, gamit ang mga webhook, na sine-set up sa API page ng kumpanya. Tinatawagan ng testee ang iyong address kapag nagsimula ang aplikante, natapos (kasama ang mga resulta niya), hindi naabot, nag-expire o inalis, at kapag handa na ang interview, at pinipirmahan ang bawat call gamit ang iyong secret. Sinusubukan ulit ang pumalyang call sa loob ng 3 araw; pagkatapos ay nagpa-pause ang webhook hanggang pumasa ang isang test event. May log ng mga pinakabagong padala ang bawat webhook. Tingnan ang [dokumentasyon ng mga webhook](/api-docs?tab=webhooks).",
    },
    {
        "key": "embed",
        "question": "Puwede bang sagutan ng mga aplikante ang interview sa sarili kong site?",
        "answer": "Oo, gamit ang SDK ng testee: isang script na nagpapakita ng interview sa loob ng iyong page, sa mga site na pinapayagan mo sa API page ng kumpanya. Iniimbitahan ng iyong server ang bawat aplikante sa pamamagitan ng API nang naka-off ang pag-sign in, kaya hindi nila kailangan ng testee account at walang ini-email sa kanila ang testee. Walang dagdag na bayad; sinisingil ang mga aplikante gaya ng dati. Tingnan ang [dokumentasyon ng SDK](/api-docs?tab=sdk).",
    },
    {
        "key": "ai_apps",
        "question": "Puwede ko bang gamitin ang testee mula sa Claude, ChatGPT o sarili kong AI agent?",
        "answer": "Oo. Idagdag ang testee sa Claude o ChatGPT bilang connector (nasa tab na Mga integration ng iyong kumpanya ang mga hakbang) at payagan ito sa testee, para magbasa lang o para gumawa rin ng mga pagbabago. Pagkatapos, gagamitin ng app ang iyong mga kumpanya, interview at resulta ng mga aplikante bilang ikaw, gamit ang mga pahintulot mo. Sa testee lang mabubura ang account mo o ang isang kumpanya. Ang nababasa ng app ay napupunta sa provider nito, ayon sa mga tuntunin ng app na iyon. Puwede mo itong i-disconnect anumang oras sa parehong tab, at puwedeng i-off ng mga may-ari at admin ang mga AI app para sa isang kumpanya. Puwede ring kumonekta ang ibang AI app at mga agent na ikaw mismo ang gumawa: nasa [tab na MCP](/api-docs?tab=mcp) ng dokumentasyon para sa mga developer ang mga hakbang at mga halimbawang agent, at puwedeng mag-sign in ang agent sa server gamit ang API key na may pahintulot para sa mga AI agent, at gagawin lang nito ang pinapayagan ng iba pang pahintulot ng key. Ipinapaliwanag ng [gabay sa AI agents, MCP at APIs](/guides/ai-agents-mcp-and-api) kung para saan ang bawat isa.",
    },
    {
        "key": "candidates",
        "question": "Ano ang nakikita ng mga aplikante?",
        "answer": "Ang pangalan at logo ng iyong kumpanya, sa mga kulay at mga font ng iyong kumpanya (itinakda sa tab nitong Brand), kung ano ang aasahan bago sila magsimula, pagkatapos ay isang timed na tanong sa bawat pagkakataon. Hindi kailanman ipinapakita sa kanila ng interview ang kanilang score o kung tama ang isang sagot; sa sarili lang nilang data download makikita ang grade nila.",
    },
    {
        "key": "brand",
        "question": "Puwede bang dalhin ng mga interview ang brand ng kumpanya ko?",
        "answer": "Oo, nang walang dagdag na bayad. Sa tab na Brand ng kumpanya, itinatakda ng mga may-ari at admin ang logo nito, mga kulay para sa maliwanag at madilim na tema, mga font at pag-ikot ng mga sulok. Nakikita ito ng mga aplikante sa buong interview, nang walang header o footer ng testee, at lumalabas din ang logo sa mga email at report.",
    },
    {
        "key": "candidate_account",
        "question": "Kailangan ba ng account ng mga aplikante?",
        "answer": "Oo, at libre ito: nagsa-sign in sila gamit ang Google, LinkedIn o GitHub, sa verified email na inimbitahan mo, kaya walang silbi sa iba ang na-forward na imbitasyon. Sa shareable link, puwede ang anumang verified email. Ang eksepsyon ay imbitasyong ginawa ng sarili mong platform sa pamamagitan ng API, na puwedeng laktawan ang pag-sign in.",
    },
    {
        "key": "verified",
        "question": "Ano ang ibig sabihin ng verified check?",
        "answer": "Na nag-sign in ang isang may-ari o admin ng kumpanya gamit ang work email sa website ng kumpanya, gaya ng you@acme.com, at sinuri ng aming team ang kumpanya pagkatapos. Idagdag ang website gamit ang I-verify sa header ng iyong kumpanya; hindi binibilang ang mga libreng email service. Habang naghihintay ng review, may orasan sa tabi ng pangalan na nakikita ng iyong team, at ang pagpapalit ng pangalan ng kumpanya ay nagpapadala ulit nito para sa review. Lumalabas ang check sa tabi ng pangalan ng iyong kumpanya, pati sa mga invite.",
    },
    {
        "key": "languages",
        "question": "Aling mga wika ang suportado?",
        "answer": "{count} wika, para sa site, sa mga interview at sa mga email. Piliin ang wika ng interview, anuman ang wika ng job description.",
    },
    {
        "key": "mira",
        "question": "Sino si Mira?",
        "answer": 'Ang AI assistant ng testee: isang AI, hindi tao, at puwedeng mali ang mga sagot nito. Buksan ito gamit ang "magtanong kay Mira" sa header. Puwedeng magtanong ang mga bisita ng kahit ano tungkol sa testee. Kapag naka-sign in ka, binabasa rin ni Mira ang iyong mga kumpanya gamit ang access mo at ginagawa ang mga pagbabagong hihilingin mo, bawat isa pagkatapos mo lang itong kumpirmahin. Walang nagagastos na credits sa pagtatanong kay Mira, at hindi ito magagamit ng mga aplikante habang nasa interview.',
    },
    {
        "key": "search",
        "question": "Puwede ba akong maghanap sa testee?",
        "answer": "Oo. Habang nagta-type ka, hinahanap ng search sa header ang iyong mga kumpanya, interview at aplikante (ayon sa pangalan o email), at ang mga page, gabay, paghahambing, legal na teksto, tanong sa FAQ at skills test ng site. Kapag hindi naka-sign in, ang pampubliko lang ang nahahanap nito.",
    },
    {
        "key": "privacy",
        "question": "Ano ang nangyayari sa mga job description at mga sagot?",
        "answer": "Ginagamit ang mga job description para buuin ang mga interview ng iyong kumpanya, at ang mga sagot ng aplikante para i-score ang mga ito para sa iyong kumpanya. Maaari ding muling gamitin ang mga tanong na ginagawa ng testee sa mga interview at practice ng ibang mga kumpanya, nang walang anumang tumutukoy sa iyo, sa iyong kumpanya o sa sinumang iba; maaari mong hindi isama rito ang mga tanong ng isang interview sa mga setting nito. Natututo rin ang testee ng mga pangkalahatan at anonymized na pattern ng kalidad ng tanong mula sa kung paano sinasagot ang mga tanong, para pahusayin kung paano ginagawa ang mga tanong. Ipinapaliwanag ng [privacy policy](/privacy) kung ano ang itinatago namin, gaano katagal, at ang mga karapatan ng lahat.",
    },
    {
        "key": "question_bank",
        "question": "Ibinabahagi ba sa ibang kumpanya ang mga tanong ng interview ko?",
        "answer": "Bilang default, oo. Puwedeng mapasama sa shared question bank ang tanong na ginawa ng testee kapag ilang beses na itong nasagot at pumasa sa mga pagsusuri na wala itong binabanggit na organisasyon, tao o contact details; walang anumang tumutukoy sa iyong kumpanya ang kopya. Puwedeng hindi isama ng mga may-ari at admin ang mga tanong ng isang interview sa tab nitong Mga setting; walang setting para sa buong kumpanya. Nananatili ang mga tanong na muling nagamit na, kahit burahin ang iyong kumpanya.",
    },
    {
        "key": "ai_training",
        "question": "Ginagamit ba ang data namin para i-train ang mga AI model?",
        "answer": "Ang OpenAI, na nagpapagana sa AI ng testee, ay hindi nagti-train ng mga model nito sa ipinapadala namin, ayon sa mga tuntunin ng API nito; maaari itong itago nang hanggang 30 araw, para lang suriin kung may pang-aabuso maliban kung mas matagal ang hinihingi ng batas. Ang testee mismo ay natututo ng mga pangkalahatan at anonymized na pattern ng kalidad ng tanong, para pahusayin kung paano ginagawa ang mga tanong.",
    },
    {
        "key": "data_storage",
        "question": "Saan nakaimbak ang data namin?",
        "answer": "Sa Google Cloud, sa Belgium. May ilang provider na humahawak ng data sa United States, gaya ng OpenAI at Resend, sa ilalim ng EU-US Data Privacy Framework o ng standard contractual clauses ng European Commission. Nakalista silang lahat sa [trust page](/trust).",
    },
    {
        "key": "eu_ai_law",
        "question": "Legal ba ang paggamit ng AI sa pag-screen ng mga aplikante sa EU?",
        "answer": "Oo, basta may sinusunod na patakaran. Sa ilalim ng EU AI Act, malaki ang posibilidad na high-risk ang mga tool na nag-i-score ng mga aplikante, na may mga obligasyon simula 2 Disyembre 2027, at umiiral na ang GDPR: tao ang gumagawa ng desisyon sa pag-hire, sinasabihan ang mga aplikante na ginagamit ang AI, at may itinatagong mga record. Ganito gumagana ang testee: AI ang sumusulat ng mga tanong, ang mga tao sa iyong kumpanya ang nagre-review ng mga resulta at nagdedesisyon, at sinasabihan ang mga aplikante bago sila magsimula. Hindi ito legal advice; ipinapaliwanag ng [Legal ba ang AI hiring sa EU?](/guides/is-ai-hiring-legal-in-the-eu) ang mga patakaran at petsa.",
    },
    {
        "key": "uk_us",
        "question": "Puwede ba naming gamitin ang testee para sa mga aplikante sa UK at US?",
        "answer": "Oo. Sakop ng data processing agreement ang batas ng UK at US, at sakop ng mga tagubilin para sa mga kumpanya at ng mga template ng abiso sa aplikante (may bersyon para sa New York City, Illinois, Colorado at Connecticut) ang dapat mong sabihin sa mga aplikante. Para sa mga trabaho sa New York City, gamitin lang ito kapag nagawa mo na ang hinihingi sa iyo ng Local Law 144: isang independiyenteng bias audit sa loob ng isang taon bago ang paggamit, ang paglalathala ng buod nito, at abiso sa mga aplikante 10 business day bago nito. Ibinibigay ng bias-audit export sa Log ng aksyon sa auditor mo ang grade at resulta ng bawat aplikanteng natapos, para itugma sa sariling sagot ng mga aplikante mo.",
    },
    {
        "key": "emails",
        "question": "Anong mga email ang ipinapadala ng testee, at paano ko ito ihihinto?",
        "answer": 'Laging ipinapadala ang mga email ng serbisyo, gaya ng mga imbitasyon, report, email tungkol sa billing at pagbabago sa aming mga tuntunin. Ang iba, gaya ng araw-araw na buod ng aktibidad, mga paalala, mga update tungkol sa produkto at mga alok, ay pinipili mo sa Mga setting, sa ilalim ng Mga email, o inihihinto gamit ang link na "Mag-unsubscribe" sa bawat email. Puwedeng ihinto ng mga aplikante ang mga email ng iyong kumpanya, o ang mga paalala ng isang interview, gamit ang mga link sa kanilang mga imbitasyon at paalala. Lumalabas ang mga balita ng testee sa iyong mga notification, ang kampana sa itaas; ipinapadala rin sa email ang mahahalagang balita bilang update tungkol sa produkto, habang naka-on lang ang setting na iyon.',
    },
    {
        "key": "data_export",
        "question": "Puwede ko bang i-download ang data ko?",
        "answer": 'Oo. Ang "I-download ang aking data" sa Mga setting ay nagbibigay sa iyo ng isang JSON file ng hawak ng testee tungkol sa iyo; para sa mga interview ng kumpanya, nandoon ang mga sagot at grade mo, pero hindi kung aling mga sagot ang tama. Walang export ng buong kumpanya: puwedeng i-download ng may-ari nito ang log ng aksyon, at puwedeng i-download ng mga miyembro ang mga PDF report ng mga aplikante.',
    },
    {
        "key": "candidate_data",
        "question": "Paano mabubura ng aplikante ang data niya?",
        "answer": "Sa paghingi sa kumpanyang nag-imbita sa kanya: ang pagbawi sa aplikanteng nagsimula na ay permanenteng nagbubura sa kanya at sa mga resulta niya. O sa pagbura ng kanyang testee account sa Mga setting, na nagbubura ng mga resulta niya. Kung hindi, awtomatikong binubura ang mga resulta 12 buwan matapos huling ipadala ang imbitasyon.",
    },
    {
        "key": "delete",
        "question": "Puwede ko bang burahin ang account ko?",
        "answer": "Oo, sa Settings, maliban kung ikaw ang may-ari ng kumpanyang may iba nang sumali: gawin munang may-ari nito ang ibang miyembro, o burahin ito. Buburahin ang account at data mo, kasama ang mga kumpanyang ikaw lang ang miyembro at ang credits ng mga ito, kaya humiling muna ng anumang refund na para sa iyo. Itinatago ng kumpanya ang tala ng imbitasyon mo nang wala ang email mo, at nananatili ang mga tala ng pagbili ayon sa hinihingi ng batas sa accounting. Puwede mo munang i-download ang kopya ng data mo.",
    },
    {
        "key": "company_delete",
        "question": "Puwede ko bang burahin ang isang kumpanya?",
        "answer": "Oo, kung ikaw ang may-ari nito. Permanenteng mabubura ang mga interview, aplikante, resulta at credits nito at titigil ang awtomatikong top-up nito, kaya humiling muna ng anumang refund na para sa iyo. Nananatili ang mga kopya ng mga tanong nito na nasa shared question bank na.",
    },
    {
        "key": "report",
        "question": "Paano ako mag-uulat ng problema?",
        "answer": "Sumulat sa amin sa [page na Makipag-ugnayan](/contact) at i-paste ang ID ng tinutukoy mo: nasa ilalim ng pangalan ng kumpanya, interview o aplikante ang “kopyahin ang id”, at nasa menu ng account mo at sa Mga setting ang ID ng iyong account. Sa ID, agad namin itong mahahanap.",
    },
]
