# The FAQ in tr; the {placeholders} are filled in by helpers/help.py (faq_values) with
# billing's prices and the number of languages. Questions not translated yet show in English
# (constants/faq/__init__.py).
FAQ = [
    {
        "key": "what",
        "question": "testee nedir?",
        "answer": "İş tanımınızdan hazırlanan, her pozisyon için süreli, çoktan seçmeli bir mülakat. Adayları onlarla tanışmadan önce elemek için ya da işe alımın bir adımı olarak kullanın: her iki durumda da işi gerçekten kimin bildiğini görürsünüz.",
    },
    {
        "key": "roles",
        "question": "Hangi pozisyonlar için işe alım yapabilirim?",
        "answer": "Bilginin önemli olduğu her pozisyon için: destek, satış, finans, sağlık, zanaat ve teknik meslekler, mühendislik, pazarlama ve daha fazlası. İşi tarif edebiliyorsanız testee onun için bir mülakat hazırlayabilir.",
    },
    {
        "key": "hiring",
        "question": "Nasıl çalışır?",
        "answer": "Ana sayfaya bir iş tanımı yapıştırın, şirketinize ad verin ve testee'nin önerdiği konuları kontrol edin. Ardından adayları davet edin: e-postalarını yazın, bir liste yapıştırın ya da dosya yükleyin. Birkaç gün içinde başlamayan adaylara bir hatırlatma gider. Her aday kendi sorularını alır ve her sorunun bir süresi vardır; adaylar bitirir bitirmez puanlarını ve tüm cevaplarını görürsünüz.",
    },
    {
        "key": "templates",
        "question": "Hazır bir mülakatla başlayabilir miyim?",
        "answer": "Evet. Şirketinizin Şablonlar sekmesi, pozisyonlara göre hazır mülakatları listeler; bunları arayabilir, seviyeye ve dile göre filtreleyebilirsiniz. Sahipler ve yöneticiler bir şablonu şirkete hemen ve ücretsiz olarak kopyalayabilir, ardından her mülakat gibi değiştirebilir; adaylar her zamanki gibi ücretlendirilir.",
    },
    {
        "key": "link",
        "question": "Bir mülakatı iş ilanına koyabilir miyim?",
        "answer": "Evet. Mülakatın Ayarlar sekmesinden paylaşılabilir bağlantısını açın ve ilanınıza yapıştırın. Bağlantıyı açan herkes giriş yapar ve mülakata girer; her kişi, davet edilen bir aday gibi ücretlendirilir. Kredi kalmadığında bağlantı yeni kişi kabul etmez. Mülakatı İşe alındı olarak işaretlediğinizde bağlantı kapanır.",
    },
    {
        "key": "preview",
        "question": "Kimseyi davet etmeden önce bir mülakatı deneyebilir miyim?",
        "answer": "Evet. Mülakatınızı kendi sayfasından ücretsiz olarak aday gibi açın: önizlemeler adaylarınız arasında ya da soru istatistiklerinde görünmez. Ücretsiz pratik mülakatlardan herhangi birine de girebilirsiniz.",
    },
    {
        "key": "question_quality",
        "question": "Soruların doğru olduğunu nasıl kontrol ediyorsunuz?",
        "answer": "Bir mülakat hazır olmadan önce ikinci bir yapay zekâ, cevap anahtarlarından bir örneği kontrol eder. Sonrasında cevaplar, oylar ve bildirimler zayıf soruları işaretler; bu sorular daha sonra başlayan adaylar için arka planda düzeltilir veya değiştirilir, verilmiş notlar değişmez. Bir konunun sayfasında her soruyu okuyabilirsiniz; sahipler ve yöneticiler bir soruyu devre dışı bırakabilir, yeniden oluşturabilir veya cevabını yanlış olarak işaretleyebilir.",
    },
    {
        "key": "open-to-offers",
        "question": "Şirketler beni pratiklerim üzerinden bulabilir mi?",
        "answer": "Yalnızca siz isterseniz. Bir pratik turundan sonra veya Ayarlar'da, LinkedIn profilinizin adresiyle \"İş tekliflerine açık\" seçeneğini açın. Bunun ardından testee'de kredi yüklemiş şirketler adınızı, LinkedIn profilinizi ve mülakatlarındaki konulardan pratik yaptığınız her birindeki en son pratik sonucunuzu görür ve sizi bir mülakata davet edebilir. testee sizi sıralamaz veya önermez. İstediğiniz zaman Ayarlar'dan kapatabilirsiniz; o anda tüm şirketlerin listesinden kaybolursunuz. Ayrıca bu seçenek, en son açtığınız veya LinkedIn profilinizi kaydettiğiniz tarihten bir yıl sonra kendiliğinden kapanır.",
    },
    {
        "key": "cheating",
        "question": "Adaylar yapay zekâ kullanabilir ya da cevapları arayabilir mi?",
        "answer": "Her aday, her konudan rastgele seçilen soruları kendi sırasında alır ve her sorunun sunucumuzun tuttuğu [bir süre sınırı](/guides/skills-test-timing-and-extra-time) vardır, bu yüzden cevapları aramaya ya da yapay zekâya sormaya pek zaman kalmaz. Değerlendirme kartı ayrıca adayın sayfadan ne zaman ayrıldığını, metin kopyaladığını ya da soruyu okumuş olamayacak kadar hızlı cevap verdiğini gösterir. Aday bitirdiğinde sayfası, soruları bir yapay zekâya aktarmanın genellikle bıraktığı cevap örüntülerini de gösterir, örneğin her soruda yaklaşık aynı süre veya kolay sorular yanlışken zor soruların doğru olması; ayrıca canlı bir mülakatta sormak için adayın doğru cevapladığı soruları önerir. Örüntü, sormak için bir nedendir, kanıt değildir. Başlamadan önce her aday ayrıca soruları yapay zekâ araçları veya başkalarının yardımı olmadan kendisinin yanıtlayacağını onaylar ve değerlendirme kartı bunu gösterir.",
    },
    {
        "key": "practice",
        "question": "Ücretsiz pratik yapabilir miyim?",
        "answer": 'Evet. [Pratik sayfasında](/practice) pozisyonlara göre ücretsiz mülakatlar vardır: giriş yapın, standart süre, iki kat süre veya süre sınırı yok seçeneklerinden birini seçin; sonunda notunuzu ve tüm doğru cevapları görün. Pratikleriniz size özeldir; şirketler bir sonucu yalnızca siz "İş tekliflerine açık" seçeneğini açarsanız görür.',
    },
    {
        "key": "voice",
        "question": "Adaylar sesle cevap verebilir mi?",
        "answer": 'Evet, şirket bir mülakatı sesli moda ayarlarsa, testee\'nin 23 dilinden herhangi birinde; ne kadar iyi okuyup duyduğu dile göre değişir ("23 dilde sesli mülakatlar" rehberi her birini gösterir). Sorular sesli okunur ve adaylar sesli cevap verir; söyledikleri metne dönüştürülüp bir seçenekle eşleştirilir. testee bunu saklamaz; bu işi bizim için yapan OpenAI, kanun daha uzun bir süre gerektirmedikçe yalnızca kötüye kullanımı denetlemek için 30 güne kadar saklayabilir. Sesler ton veya duygu açısından analiz edilmez ve adaylar her zaman bunun yerine dokunarak cevap verebilir.',
    },
    {
        "key": "extra_time",
        "question": "Bir adaya ek süre verilebilir mi?",
        "answer": "Evet. Aday başlamadan önce sahipler ve yöneticiler, adayın sayfasından her soru için ona %25, %50 veya %100 daha fazla süre verebilir; bir neden kaydedilmez. Paylaşılabilir bağlantı kullanan kişi önce şirketten kişisel bir davet ister. Ayrıntılar için [bir beceri testinin süresini belirleme](/guides/skills-test-timing-and-extra-time) rehberine bakın.",
    },
    {
        "key": "retake",
        "question": "Aday bir mülakata yeniden girebilir veya geri dönebilir mi?",
        "answer": "Hayır. Mülakata bir kez, tek seferde girilir: aday Sonraki soru düğmesine basana kadar seçimini değiştirebilir, sonrasında seçim kesinleşir. Bitirdikten sonra aynı mülakata yeniden davet edilemez.",
    },
    {
        "key": "connection",
        "question": "Adayın bağlantısı koparsa veya sayfayı kapatırsa ne olur?",
        "answer": "Aynı bağlantıyı açar ve devam eder. Sunucumuzun saati bu sırada işlemeye devam eder: aday yokken süresi dolan soru yanlış sayılır, sonraki sorunun sayacı ise soru gösterildiğinde başlar. Bitirilmemiş bir mülakat, toplam süresi artı %10 geçtiğinde kendiliğinden sona erer.",
    },
    {
        "key": "cost",
        "question": "Ücreti ne kadar?",
        "answer": "Mülakat oluşturmak ücretsizdir. En az bir soruyu cevaplayan her aday {candidate} kredi ({candidate_price}) tutar; daha büyük yüklemelerden gelen kredilerle daha az, {cheapest_price} seviyesine kadar. İlk şirketiniz {company} ücretsiz kredi alır; bu, ilk {company_candidates} adayı için yeterlidir. Fiyatlara KDV veya satış vergisi dahil değildir. [Fiyatlar sayfasında](/pricing) tüm fiyatlar yer alır.",
    },
    {
        "key": "charged",
        "question": "Bir aday için ne zaman ücret alınır?",
        "answer": "Aday en az bir soruyu yanıtlamışsa: mülakatı sona erdiğinde (kendisi bitirdiğinde ya da o yokken süresi dolduğunda) veya onu iptal ettiğinizde; iptal, yanıtlarını da kalıcı olarak siler. Bir yanıt seçilmeden süresi dolan soru sayılmaz. Kredileri davet ettiğinizde (bağlantıyla gelen adaylarda başladığında) ayrılır; hiçbir şeyi yanıtlamadan önce onu iptal ederseniz, hiç başlamaz ve davetin süresi 30 gün sonra dolarsa ya da mülakatı hiçbir şey yanıtlanmadan sona ererse geri gelir.",
    },
    {
        "key": "compare_hiring",
        "question": "Fiyat, diğer değerlendirme araçlarıyla nasıl karşılaştırılır?",
        "answer": "Birçok değerlendirme aracı, kimseyi test etmeseniz bile ödediğiniz aylık veya yıllık abonelikle satılır. testee'de yalnızca aday başına, önceden satın alınan kredilerle ödersiniz: {candidate} kredi ({candidate_price}); sözleşme, kullanıcı başı ücret ve mülakat oluşturma ücreti yoktur. Ayda {example_candidates} aday davet eden bir şirket yılda vergiler hariç yaklaşık {example_year_price} öder. Her ay çok sayıda aday test ediyorsanız bir abonelik daha ucuz olabilir; kendi rakamlarınızla karşılaştırın.",
    },
    {
        "key": "top_up",
        "question": "Kredi nasıl satın alırım?",
        "answer": "Sahipler ve yöneticiler, hesap menüsündeki kredi yükleme sayfasından tek seferde {min_candidates} ile {max_candidates} aday arası yükleme yapar. Ödemeyi Paddle alır, varsa KDV veya satış vergisini ekler ve makbuzu ya da faturayı düzenler; her yüklemenin faturası şirketin Faturalandırma sekmesinde de yer alır.",
    },
    {
        "key": "expire",
        "question": "Kredilerin süresi dolar mı?",
        "answer": "Hayır. Kredilerin süresi asla dolmaz; ücretli abonelik yoktur. İsteğe bağlı otomatik yüklemeyi açarsanız Paddle kartınızı {zero_price} tutarında bir abonelik olarak kaydeder; yalnızca yapılan yüklemeler için ödersiniz.",
    },
    {
        "key": "auto_top_up",
        "question": "Krediler otomatik yüklenebilir mi?",
        "answer": "Evet, bir sahip veya yönetici bunu kredi yükleme sayfasından açarsa: bir yükleme ve bakiyenin altına düştüğünde yeniden doldurulacağı seviyeyi seçin, neyin ne zaman tahsil edileceğini işaretleyin. Şirketin kullanılabilir bakiyesi bu seviyenin altına her düştüğünde kayıtlı karttan, varsa vergiyle birlikte tahsilat yapılır ve şirketin sahipleri ile yöneticileri e-posta alır. Reddedilen bir tahsilat 1, 3 ve 7 gün sonra yeniden denenir; ardından otomatik yükleme kart güncellenene kadar duraklar. Açtığınız yerden kapattığınızda hemen durur.",
    },
    {
        "key": "currency",
        "question": "Hangi para biriminde öderim?",
        "answer": "Fiyatlar Kanada, Avustralya, İsrail, Polonya, İsviçre, Japonya, Güney Kore, Tayvan, Hong Kong, Tayland, Singapur ve Hindistan'da yerel para birimi; AB'nin geri kalanında ve İzlanda, Lihtenştayn ve Norveç'te avro; Birleşik Krallık'ta sterlin; diğer yerlerde ise ABD doları cinsindendir. Hesabınız ve her şirket, nereye seyahat ederseniz edin, oluşturuldukları veya ilk kullanıldıkları ülkenin para birimini korur: kendinizinkini Ayarlar'da, bir şirketinkini ise kredi yükleme sayfasında değiştirebilirsiniz (sahipler ve yöneticiler). Bir şirketin yüklemeleri, otomatik olanlar da, her zaman şirketin para biriminde tahsil edilir.",
    },
    {
        "key": "referrals",
        "question": "Bir şirket önererek kredi kazanabilir miyim?",
        "answer": "Evet. Şirketinizin Davetler sekmesindeki bağlantıyı paylaşın: bu bağlantıyla oluşturulan yeni bir şirket, tutarı ne olursa olsun ilk kez kredi yüklediğinde iki şirket de {referral} kredi alır; yılda en fazla 25 davet için. Yalnızca sahibinin e-postasına ait ilk şirket sayılır, kendi şirketleriniz sayılmaz.",
    },
    {
        "key": "refunds",
        "question": "Para iadesi alabilir miyim?",
        "answer": "Evet, son 14 gün içinde satın aldığınız ve harcamadığınız krediler için: Paddle üzerinden veya bize yazarak. Hoş geldin hediyesi gibi ücretsiz krediler iade edilmez ve ilk olarak bunlar harcanmış sayılır. Ayrıntılar [koşullarda](/terms) yer alır.",
    },
    {
        "key": "scorecards",
        "question": "Değerlendirme kartları neleri gösterir?",
        "answer": 'Her cevabı, doğru olup olmadığını ve ne kadar sürdüğünü. Not, kazanılan puanların yüzdesidir: her soru bir puan değerindedir; "doğru olanların hepsini seçin" sorusu işaretlenen her doğru seçenek için bu puanın bir kısmını verir, yanlış bir seçenek işaretlenirse hiç puan vermez. Notlar, mülakat için belirlediğiniz geçme notuna göre yeşil ya da kırmızı görünür. Değerlendirme kartı ayrıca okunamayacak kadar hızlı verilen cevapları, adayın sayfadan ayrıldığı anları ve kopyalama girişimlerini işaretler.',
    },
    {
        "key": "reports",
        "question": "Sonuçları işe alım yöneticisiyle paylaşabilir miyim?",
        "answer": "Evet. Tek bir aday ya da bir mülakatın tüm adayları için PDF raporu indirin, doğrudan testee'den e-postayla gönderin ya da WhatsApp, Telegram, Viber veya LINE'da kısa bir özet gönderin.",
    },
    {
        "key": "action_log",
        "question": "Şirketimde kimin ne yaptığını görebilir miyim?",
        "answer": "Evet, şirketin sahibiyseniz. Şirketin İşlem kaydı sekmesi, üyelerinin yaptıklarını en yeniden başlayarak listeler: aday davet etme veya kaldırma, sonuçları görüntüleme ve mülakatlarda, ekipte, faturalandırmada ve entegrasyonlarda yapılan değişiklikler; bunu kimin, ne zaman yaptığı ve asistanın, bir yapay zekâ uygulamasının, API'nin veya bir ATS'nin onun adına yapıp yapmadığıyla birlikte. Kaydı üyeye, işlem türüne ve tarihlere göre filtreleyebilir ve CSV dosyası olarak indirebilirsiniz. İşlemler 12 ay saklanır. Bir API anahtarının işlemleri anahtarın adıyla görünür.",
    },
    {
        "key": "bias_audit",
        "question": "Sonuçları yanlılık denetimi için dışa aktarabilir miyim?",
        "answer": "Evet, şirketin sahibiyseniz. İşlem kaydı sekmesinde bir yanlılık denetimi dışa aktarımı vardır: tüm mülakatlar veya tek bir mülakat için, seçilen tarihler arasında mülakatı bitiren her adayın notunu, geçme notunu, geçip geçmediğini ve mülakatın medyanının üzerinde olup olmadığını içeren bir CSV dosyası. testee cinsiyet, ırk veya etnik kökenle ilgili veri tutmaz; bu yüzden adaylarınızın kendi beyan ettiği cevapları e-postaya göre siz eklersiniz ve dosyayı bağımsız denetçinize vermeden önce e-postaları çıkarırsınız.",
    },
    {
        "key": "notes",
        "question": "Ekibim bir mülakata yorum yazabilir mi?",
        "answer": "Evet. Her mülakatın, ekibinizin işe alım süreciyle ilgili düz metin yorumlar yazdığı bir Yorumlar sekmesi vardır; örneğin sırada kimin aranacağı ya da bir ajanssanız mülakatın hangi müşteri için olduğu. Görüntüleyiciler dahil her üye yorum yazabilir ve kendi yorumlarını düzenleyebilir; bir yorumu yazarı, sahipler ve yöneticiler silebilir. Sahipler ve yöneticiler bir yorumu sabitleyebilir; bu yorum mülakatın adının altında görünür. Adaylar yorumları asla görmez.",
    },
    {
        "key": "team",
        "question": "Ekibimi ekleyebilir miyim?",
        "answer": "Evet, üyeler ücretsizdir. Şirketin Ekip sekmesinde sahip, her kişiyi e-postayla yönetici veya görüntüleyici olarak davet eder. Yöneticiler ekibi yönetmek, işlem kaydını görmek ve şirketi silmek dışında her şeyi yapabilir. Görüntüleyiciler mülakatları ve sonuçları görür, rapor paylaşır ve yorum yazar, ancak başka hiçbir şeyi değiştiremez ve kredi yükleyemez. Bir hesap, her birinin kendi ekibi ve kredileri olan birden çok şirkete sahip olabilir.",
    },
    {
        "key": "integrations",
        "question": "testee, ATS'imle veya diğer araçlarla çalışır mı?",
        "answer": "Evet, ek ücret olmadan; adaylar her zamanki gibi ücretlendirilir. Sahipler ve yöneticiler Workable, Greenhouse, Teamtailor, Recruitee veya Breezy HR'ı şirketin Entegrasyonlar sekmesinden ATS'den alınan bir anahtarla bağlar, ardından bir iş ilanını bir mülakatla ve bir aşamayla eşleştirir: o aşamaya taşıdığınız adaylar mülakatı alır ve sonuçları ATS'ye geri gönderilir ([beceri testlerini ATS'nize nasıl bağlarsınız](/guides/ats-integration-skills-tests)). Slack, şirketinizin bildirimlerini bir kanala gönderebilir; API ise kendi platformunuzun mülakat oluşturmasını, adayları davet edip yönetmesini ve sonuçlarını almasını sağlar; her API anahtarı yalnızca onun için işaretlediğiniz işlemleri yapabilir. Ayrıntılar için [API belgeleri](/api-docs) sayfasına bakın.",
    },
    {
        "key": "slack",
        "question": "Slack entegrasyonu nasıl çalışır?",
        "answer": 'Bir sahip veya yönetici, şirketin Entegrasyonlar sekmesinde "Slack\'e ekle"yi seçer ve bir kanal belirler; ardından oraya hangi bildirimlerin gideceğini seçer, örneğin aday bitirdi, davet iletilemedi, ATS adayı davet edilmedi veya yeni yorum var. Ücretsizdir.',
    },
    {
        "key": "api_keys",
        "question": "API anahtarları nasıl çalışır?",
        "answer": "Sahipler ve yöneticiler bunları şirketin Entegrasyonlar altındaki API sayfasında oluşturur. Her anahtarın neler yapabileceğini işaretler, ne zaman sona ereceğini seçer (1, 3, 6 veya 12 ay sonra ya da hiçbir zaman) ve izin verilen IP adresleriyle sınırlayabilirsiniz. Anahtar bir kez gösterilir. Bir şirket dakikada 60 istek yapabilir. [Geliştirici belgeleri](/api-docs) her çağrıyı açıklar.",
    },
    {
        "key": "webhooks",
        "question": "testee bir aday bitirdiğinde sistemime haber verebilir mi?",
        "answer": "Evet, şirketin API sayfasında ayarlanan webhook'larla. testee, bir aday başladığında, bitirdiğinde (sonuçlarıyla birlikte), ulaşılamadığında, süresi dolduğunda veya kaldırıldığında ve bir mülakat hazır olduğunda adresinizi çağırır ve her çağrıyı gizli anahtarınızla imzalar. Başarısız bir çağrı 3 gün boyunca yeniden denenir; ardından webhook, bir test olayı başarılı olana kadar duraklar. Her webhook'un son gönderimlerini gösteren bir kaydı vardır. [Webhook belgelerine](/api-docs?tab=webhooks) bakın.",
    },
    {
        "key": "embed",
        "question": "Adaylar mülakata kendi sitemde girebilir mi?",
        "answer": "Evet, testee'nin SDK'sıyla: şirketin API sayfasında izin verdiğiniz sitelerde mülakatı sayfanızın içinde gösteren bir betik. Sunucunuz her adayı API üzerinden girişi kapalı olarak davet eder; böylece adayların testee hesabına ihtiyacı olmaz ve testee onlara e-posta göndermez. Ek ücreti yoktur; adaylar her zamanki gibi ücretlendirilir. [SDK belgelerine](/api-docs?tab=sdk) bakın.",
    },
    {
        "key": "ai_apps",
        "question": "testee'yi Claude, ChatGPT veya kendi yapay zekâ ajanımdan kullanabilir miyim?",
        "answer": "Evet. testee'yi Claude veya ChatGPT'ye bağlayıcı olarak ekleyin (adımlar şirketinizin Entegrasyonlar sekmesinde) ve testee'de yalnızca okuması ya da değişiklik de yapması için izin verin. Uygulama bundan sonra sizin adınıza ve sizin yetkilerinizle şirketleriniz, mülakatlarınız ve adayların sonuçlarıyla çalışır. Hesabınızı veya bir şirketi yalnızca testee'de silebilirsiniz. Uygulamanın okuduğu veriler, o uygulamanın koşullarına göre sağlayıcısına ulaşır. Bağlantıyı istediğiniz zaman aynı sekmeden kesebilirsiniz; sahipler ve yöneticiler de bir şirket için yapay zekâ uygulamalarını kapatabilir. Diğer yapay zekâ uygulamaları ve kendi geliştirdiğiniz ajanlar da bağlanabilir: geliştirici belgelerindeki [MCP sekmesinde](/api-docs?tab=mcp) adımlar ve örnek ajanlar vardır; sunucuda çalışan bir ajan, yapay zekâ ajanları yetkisine sahip bir API anahtarıyla oturum açabilir ve yalnızca anahtarın diğer yetkilerinin izin verdiklerini yapar. [Yapay zekâ ajanları, MCP ve API'ler rehberi](/guides/ai-agents-mcp-and-api) her birinin ne işe yaradığını açıklar.",
    },
    {
        "key": "candidates",
        "question": "Adaylar ne görür?",
        "answer": "Şirketinizin adını ve logosunu, şirketinizin renkleri ve yazı tipleriyle (Marka sekmesinde ayarlanır), başlamadan önce neyle karşılaşacaklarını, ardından her seferinde bir süreli soru. Mülakat onlara puanlarını ya da bir cevabın doğru olup olmadığını asla göstermez; notları yalnızca kendi veri indirmelerinde yer alır.",
    },
    {
        "key": "brand",
        "question": "Mülakatlar şirketimin markasını taşıyabilir mi?",
        "answer": "Evet, ek ücret olmadan. Şirketin Marka sekmesinde sahipler ve yöneticiler logosunu, açık ve koyu tema renklerini, yazı tiplerini ve köşe yuvarlaklığını ayarlar. Adaylar bunları mülakat boyunca, testee'nin üst ve alt bilgisi olmadan görür; logo e-postalarda ve raporlarda da görünür.",
    },
    {
        "key": "candidate_account",
        "question": "Adayların hesabı olması gerekir mi?",
        "answer": "Evet, ücretsizdir: adaylar Google, LinkedIn veya GitHub ile, davet ettiğiniz doğrulanmış e-postayla giriş yapar, bu yüzden iletilen bir davet başka kimsenin işine yaramaz. Paylaşılabilir bağlantıda her doğrulanmış e-posta geçerlidir. İstisna, kendi platformunuzun API üzerinden oluşturduğu davettir; bu davette giriş atlanabilir.",
    },
    {
        "key": "verified",
        "question": "Doğrulandı işareti ne anlama gelir?",
        "answer": "Şirketin bir sahibinin ya da yöneticisinin, şirketin web sitesine ait bir iş e-postasıyla (ör. you@acme.com) giriş yaptığı ve ardından ekibimizin şirketi incelediği anlamına gelir. Web sitesini şirketinizin başlığındaki Doğrula ile ekleyin; ücretsiz e-posta servisleri sayılmaz. İnceleme beklerken ekibiniz adın yanında bir saat görür; şirketin adını değiştirmek onu yeniden incelemeye gönderir. İşaret, davetler dahil şirketinizin adının yanında görünür.",
    },
    {
        "key": "languages",
        "question": "Hangi diller destekleniyor?",
        "answer": "Site, mülakatlar ve e-postalar için {count} dil. İş tanımı hangi dilde olursa olsun, mülakatın hangi dilde yazılacağını siz seçersiniz.",
    },
    {
        "key": "mira",
        "question": "Mira kim?",
        "answer": "testee'nin yapay zekâ asistanı: bir insan değil, bir yapay zekâdır ve cevapları yanlış olabilir. Üst menüdeki \"Mira'ya sor\" ile açın. Ziyaretçiler testee hakkında her şeyi sorabilir. Giriş yaptığınızda Mira şirketlerinizi sizin erişiminizle okur ve istediğiniz değişiklikleri, her birini ancak siz onayladıktan sonra yapar. Mira'ya sormak kredi harcamaz ve adaylar mülakat sırasında Mira'yı kullanamaz.",
    },
    {
        "key": "search",
        "question": "testee'de arama yapabilir miyim?",
        "answer": "Evet. Üst menüdeki arama, siz yazarken şirketlerinizi, mülakatlarınızı ve adaylarınızı (ada veya e-postaya göre), ayrıca sitenin sayfalarını, rehberlerini, karşılaştırmalarını, yasal metinlerini, SSS sorularını ve beceri testlerini bulur. Giriş yapmadan yalnızca herkese açık içerikleri bulur.",
    },
    {
        "key": "privacy",
        "question": "İş tanımları ve cevaplara ne olur?",
        "answer": "İş tanımları şirketinizin mülakatlarını hazırlamak, adayların cevapları ise onları şirketiniz adına puanlamak için kullanılır. testee'nin oluşturduğu sorular, sizi, şirketinizi veya başka birini tanımlayan hiçbir bilgi olmadan diğer şirketlerin mülakatlarında ve pratiklerinde de yeniden kullanılabilir; bir mülakatın sorularını mülakatın ayarlarından bunun dışında tutabilirsiniz. testee ayrıca soruların oluşturulma şeklini iyileştirmek için, soruların nasıl cevaplandığından soru kalitesine ilişkin genel, anonimleştirilmiş örüntüler çıkarır. [Gizlilik politikası](/privacy) neleri, ne kadar süre sakladığımızı ve herkesin haklarını açıklar.",
    },
    {
        "key": "question_bank",
        "question": "Mülakatımın soruları diğer şirketlerle paylaşılır mı?",
        "answer": "Varsayılan olarak evet. testee'nin oluşturduğu bir soru, birkaç kez cevaplandıktan ve kurum, kişi adı veya iletişim bilgisi içermediğine dair kontrollerden geçtikten sonra ortak soru bankasına girebilir; kopyada şirketinizi tanımlayan hiçbir şey bulunmaz. Sahipler ve yöneticiler bir mülakatın sorularını Ayarlar sekmesinden bunun dışında tutabilir; şirket genelinde bir ayar yoktur. Yeniden kullanılmış sorular, şirketiniz silinse bile kalır.",
    },
    {
        "key": "ai_training",
        "question": "Verilerimiz yapay zekâ modellerini eğitmek için kullanılıyor mu?",
        "answer": "testee'nin yapay zekâsını sağlayan OpenAI, API koşulları uyarınca kendisine gönderdiklerimizle modellerini eğitmez; kanun daha uzun bir süre gerektirmedikçe yalnızca kötüye kullanımı denetlemek için 30 güne kadar saklayabilir. testee ise soruların oluşturulma şeklini iyileştirmek için soru kalitesine ilişkin genel, anonimleştirilmiş örüntüler öğrenir.",
    },
    {
        "key": "data_storage",
        "question": "Verilerimiz nerede saklanıyor?",
        "answer": "Google Cloud'da, Belçika'da. OpenAI ve Resend gibi bazı sağlayıcılar verileri, AB-ABD Veri Gizliliği Çerçevesi veya Avrupa Komisyonu'nun standart sözleşme maddeleri kapsamında Amerika Birleşik Devletleri'nde işler. [Güven sayfası](/trust) hepsini listeler.",
    },
    {
        "key": "eu_ai_law",
        "question": "AB'de adayları ön elemek için yapay zekâ kullanmak yasal mı?",
        "answer": "Evet, kurallara uyarak. AB Yapay Zekâ Yasası'na (AI Act) göre adayları puanlayan araçlar büyük olasılıkla yüksek risklidir ve yükümlülükler 2 Aralık 2027'den itibaren başlar; GDPR ise zaten geçerlidir: işe alım kararını bir insan verir, adaylara yapay zekâ kullanıldığı söylenir ve kayıt tutulur. testee da böyle çalışır: soruları yapay zekâ yazar, şirketinizdeki kişiler sonuçları inceleyip karar verir ve adaylar başlamadan önce bilgilendirilir. Bu bir hukuki tavsiye değildir; [AB'de yapay zekâ ile işe alım yasal mı?](/guides/is-ai-hiring-legal-in-the-eu) kuralları ve tarihleri açıklar.",
    },
    {
        "key": "uk_us",
        "question": "testee'yi Birleşik Krallık ve ABD'deki adaylar için kullanabilir miyiz?",
        "answer": "Evet. Veri işleme sözleşmesi Birleşik Krallık ve ABD hukukunu kapsar; şirketlere yönelik talimatlar ve aday bilgilendirme şablonları (New York City, Illinois ve Colorado sürümleriyle) adaylara neleri söylemeniz gerektiğini açıklar. New York City'deki işler için onu ancak Local Law 144'ün sizden istediklerini yerine getirdikten sonra kullanın: kullanımdan önceki bir yıl içinde bağımsız bir yanlılık denetimi, özetinin yayımlanması ve adayların 10 iş günü önceden bilgilendirilmesi. İşlem kaydındaki yanlılık denetimi dışa aktarımı, denetçinize mülakatı bitiren her adayın notunu ve sonucunu verir; bunlar adaylarınızın kendi beyan ettiği yanıtlarla eşleştirilir.",
    },
    {
        "key": "emails",
        "question": "testee hangi e-postaları gönderir ve bunları nasıl durdururum?",
        "answer": "Davetler, raporlar, faturalandırma e-postaları ve koşullarımızdaki değişiklikler gibi hizmet e-postaları her zaman gönderilir. Günlük etkinlik özeti, hatırlatmalar, ürün güncellemeleri ve teklifler gibi diğerlerini Ayarlar'da, E-postalar bölümünde seçebilir ya da her e-postadaki \"Abonelikten çık\" bağlantısıyla durdurabilirsiniz. Adaylar, davet ve hatırlatma e-postalarındaki bağlantılarla şirketinizin e-postalarını ya da bir mülakatın hatırlatmalarını durdurabilir. testee'nin haberleri, üstteki zil simgesinde, yani bildirimlerinizde görünür; önemli haberler ayrıca ürün güncellemesi olarak e-postayla da gelir, ancak yalnızca bu ayar açıkken.",
    },
    {
        "key": "data_export",
        "question": "Verilerimi indirebilir miyim?",
        "answer": "Evet. Ayarlar'daki \"Verilerimi indir\", testee'nin sizin hakkınızda tuttuklarını içeren tek bir JSON dosyası verir; şirketlerin mülakatları için cevaplarınız ve notlarınız bulunur, ancak hangi cevapların doğru olduğu bulunmaz. Şirketin tamamı için dışa aktarma yoktur: sahibi işlem kaydını, üyeler ise adayların PDF raporlarını indirebilir.",
    },
    {
        "key": "candidate_data",
        "question": "Bir aday verilerini nasıl sildirebilir?",
        "answer": "Kendisini davet eden şirketten isteyerek: başlamış bir adayı iptal etmek, adayı ve sonuçlarını kalıcı olarak siler. Ya da Ayarlar'dan testee hesabını silerek; bu da sonuçlarını siler. Aksi halde sonuçlar, davetin son gönderiminden 12 ay sonra otomatik olarak silinir.",
    },
    {
        "key": "delete",
        "question": "Hesabımı silebilir miyim?",
        "answer": "Evet, Ayarlar'dan; ancak başkalarının katıldığı bir şirketin sahibiyseniz önce başka bir üyeyi şirketin sahibi yapın veya şirketi silin. Hesabınız ve verileriniz, tek üyesi olduğunuz şirketlerle ve onların kredileriyle birlikte silinir; bu yüzden hakkınız olan iadeyi önce isteyin. Şirket, davetinizin kaydını e-postanız olmadan tutar ve satın alma kayıtları muhasebe mevzuatının gerektirdiği şekilde saklanır. Öncesinde verilerinizin bir kopyasını indirebilirsiniz.",
    },
    {
        "key": "company_delete",
        "question": "Bir şirketi silebilir miyim?",
        "answer": "Evet, sahibiyseniz. Şirketin mülakatları, adayları, sonuçları ve kredileri kalıcı olarak silinir ve otomatik yüklemesi durur; bu yüzden hakkınız olan iadeyi önce isteyin. Sorularının ortak soru bankasına girmiş kopyaları kalır.",
    },
    {
        "key": "report",
        "question": "Bir sorunu nasıl bildiririm?",
        "answer": "[İletişim sayfasından](/contact) bize yazın ve konu olan şeyin ID'sini yapıştırın: “id'yi kopyala” bir şirketin, mülakatın veya adayın adının altında, hesabınızınki ise hesap menüsünde ve Ayarlar'da. ID sayesinde onu hemen buluruz.",
    },
]
