# The FAQ in id; the {placeholders} are filled in by helpers/help.py (faq_values) with
# billing's prices and the number of languages. Questions not translated yet show in English
# (constants/faq/__init__.py).
FAQ = [
    {
        "key": "what",
        "question": "Apa itu testee?",
        "answer": "Wawancara pilihan ganda berbatas waktu yang dibuat dari deskripsi pekerjaanmu, untuk posisi apa pun. Gunakan untuk menyaring kandidat sebelum kamu bertemu mereka, atau sebagai salah satu tahap rekrutmen itu sendiri: dengan cara mana pun, kamu melihat siapa yang benar-benar menguasai pekerjaannya.",
    },
    {
        "key": "roles",
        "question": "Untuk posisi apa saja aku bisa merekrut?",
        "answer": "Posisi apa pun yang membutuhkan pengetahuan: customer support, sales, keuangan, kesehatan, teknisi lapangan, engineering, pemasaran, dan lainnya. Jika kamu bisa menjelaskan pekerjaannya, testee bisa membuat wawancara untuknya.",
    },
    {
        "key": "hiring",
        "question": "Bagaimana cara kerjanya?",
        "answer": "Tempel deskripsi pekerjaan di beranda, beri nama perusahaanmu, dan periksa topik yang diusulkan testee. Lalu undang kandidat: ketik email mereka, tempel daftar, atau unggah file. Kandidat yang belum mulai setelah beberapa hari mendapat satu pengingat. Setiap kandidat mendapat soalnya sendiri dengan batas waktu di tiap soal, dan kamu melihat skor serta setiap jawabannya begitu mereka selesai.",
    },
    {
        "key": "templates",
        "question": "Bisakah aku mulai dari wawancara siap pakai?",
        "answer": "Bisa. Tab Templat perusahaanmu mencantumkan wawancara siap pakai per posisi, yang bisa kamu cari dan filter menurut level dan bahasa. Pemilik dan admin bisa langsung menyalin satu templat ke perusahaan, gratis, lalu mengubahnya seperti wawancara lain; kandidat dikenai biaya seperti biasa.",
    },
    {
        "key": "link",
        "question": "Bisakah aku memasang wawancara di iklan lowongan?",
        "answer": "Bisa. Aktifkan tautan wawancara yang bisa dibagikan di tab pengaturannya, lalu tempel di iklanmu. Siapa pun yang membukanya masuk dan mengikuti wawancara, dan setiap orang dikenai biaya seperti kandidat yang diundang. Jika kredit habis, tautan tidak menerima orang baru. Tautan nonaktif saat kamu menandai wawancara dengan status Diterima.",
    },
    {
        "key": "preview",
        "question": "Bisakah aku mencoba wawancara sebelum mengundang siapa pun?",
        "answer": "Bisa. Buka wawancaramu sebagai kandidat dari halamannya, gratis: pratinjau tidak muncul di antara kandidatmu atau di statistik soal. Kamu juga bisa mengikuti wawancara latihan gratis mana pun.",
    },
    {
        "key": "question_quality",
        "question": "Bagaimana kalian memeriksa bahwa soalnya benar?",
        "answer": "Sebelum wawancara siap, AI kedua memeriksa sampel kunci jawabannya. Setelah itu, jawaban, voting, dan laporan menandai soal yang lemah, yang diperbaiki atau diganti di latar belakang untuk kandidat yang mulai sesudahnya; nilai yang sudah diberikan tidak berubah. Di halaman topik kamu bisa membaca setiap soal, dan pemilik serta admin bisa menonaktifkannya, membuatnya ulang, atau menandai jawabannya salah.",
    },
    {
        "key": "open-to-offers",
        "question": "Bisakah perusahaan menemukanku lewat latihanku?",
        "answer": "Hanya jika kamu memilihnya. Aktifkan Terbuka untuk tawaran kerja setelah sesi latihan atau di Pengaturan, dengan alamat profil LinkedIn-mu. Perusahaan yang sudah isi ulang di testee lalu melihat nama, profil LinkedIn, dan hasil latihan berwaktu terbarumu di setiap topik wawancara mereka yang pernah kamu latih, dan bisa mengundangmu ke wawancara. testee tidak memeringkat atau merekomendasikanmu. Matikan kapan saja di Pengaturan, dan kamu langsung hilang dari daftar setiap perusahaan; fitur ini juga berakhir setahun setelah terakhir kali kamu mengaktifkannya atau menyimpan profil LinkedIn-mu.",
    },
    {
        "key": "cheating",
        "question": "Bisakah kandidat memakai AI atau mencari jawabannya?",
        "answer": "Setiap kandidat mendapat soal yang diambil acak dari setiap topik, dengan urutan sendiri, dengan [batas waktu di tiap soal](/guides/skills-test-timing-and-extra-time) yang dijaga server kami, jadi hanya ada sedikit waktu untuk mencari jawaban atau bertanya ke AI. Scorecard juga menunjukkan saat kandidat meninggalkan halaman, menyalin teks, atau menjawab terlalu cepat untuk sempat membaca soal. Setelah selesai, halamannya juga menunjukkan pola jawaban yang biasanya muncul saat soal diteruskan ke AI, seperti waktu yang kira-kira sama di setiap soal atau soal sulit benar sementara soal mudah salah, dan menyarankan soal yang dijawab benar oleh kandidat untuk ditanyakan dalam wawancara langsung. Pola adalah alasan untuk bertanya, bukan bukti. Sebelum mulai, setiap kandidat juga mengonfirmasi akan menjawab sendiri, tanpa alat AI atau bantuan orang lain, dan scorecard-nya menunjukkan hal itu.",
    },
    {
        "key": "practice",
        "question": "Bisakah aku berlatih gratis?",
        "answer": "Bisa. [Halaman latihan](/practice) punya wawancara gratis per posisi: masuk, pilih waktu standar, waktu ganda, atau tanpa batas waktu, dan lihat nilaimu serta semua jawaban benar di akhir. Latihanmu bersifat pribadi; perusahaan hanya melihat hasil jika kamu mengaktifkan Terbuka untuk tawaran kerja.",
    },
    {
        "key": "voice",
        "question": "Bisakah kandidat menjawab dengan suara?",
        "answer": 'Bisa, jika perusahaan mengatur wawancara ke mode suara, dalam bahasa mana pun dari 23 bahasa testee; seberapa baik mode ini membaca dan mendengar berbeda-beda menurut bahasa (panduan "Wawancara suara dalam 23 bahasa" menunjukkan kualitas tiap bahasa). Soal dibacakan dan kandidat menjawab secara lisan; ucapan mereka diubah menjadi teks dan dicocokkan dengan salah satu opsi. testee tidak menyimpannya; OpenAI, yang melakukan ini untuk kami, dapat menyimpannya paling lama 30 hari, hanya untuk memeriksa penyalahgunaan kecuali hukum mewajibkan lebih lama. Suara tidak dianalisis untuk nada atau emosi, dan kandidat selalu bisa mengetuk opsi sebagai gantinya.',
    },
    {
        "key": "extra_time",
        "question": "Bisakah kandidat mendapat waktu tambahan?",
        "answer": "Bisa. Sebelum kandidat mulai, pemilik dan admin bisa memberinya waktu 25%, 50%, atau 100% lebih banyak di tiap soal, di halaman kandidat; alasannya tidak dicatat. Orang yang memakai tautan yang bisa dibagikan meminta undangan pribadi ke perusahaan lebih dulu. Lihat [cara mengatur waktu tes keterampilan](/guides/skills-test-timing-and-extra-time).",
    },
    {
        "key": "retake",
        "question": "Bisakah kandidat mengulang wawancara atau kembali ke soal sebelumnya?",
        "answer": "Tidak. Wawancara diikuti sekali, dalam satu kali jalan: kandidat bisa mengubah pilihannya sampai menekan Soal berikutnya, lalu pilihan itu final. Setelah selesai, ia tidak bisa diundang lagi ke wawancara itu.",
    },
    {
        "key": "connection",
        "question": "Bagaimana jika koneksi kandidat terputus atau ia menutup halaman?",
        "answer": "Ia membuka tautan yang sama dan melanjutkan. Sementara itu, jam server kami tetap berjalan: soal yang waktunya habis saat ia tidak ada dihitung salah, dan timer soal berikutnya mulai saat soal itu ditampilkan. Wawancara yang belum selesai berakhir sendiri setelah total waktunya, ditambah 10%, terlewati.",
    },
    {
        "key": "cost",
        "question": "Berapa biayanya?",
        "answer": "Membuat wawancara gratis. Setiap kandidat yang menjawab setidaknya satu soal seharga {candidate} kredit ({candidate_price}), dan lebih murah dengan kredit dari isi ulang yang lebih besar, hingga {cheapest_price}. Perusahaan pertamamu mendapat {company} kredit gratis, cukup untuk {company_candidates} kandidat pertamanya. Harga belum termasuk PPN atau pajak penjualan. [Halaman harga](/pricing) mencantumkan semua harga.",
    },
    {
        "key": "charged",
        "question": "Kapan kandidat dikenai biaya?",
        "answer": "Asalkan ia sudah menjawab setidaknya satu pertanyaan: saat wawancaranya berakhir (ia menyelesaikannya, atau waktunya habis saat ia tidak ada), atau saat kamu mencabutnya, yang juga menghapus jawabannya secara permanen. Pertanyaan yang waktunya habis tanpa jawaban yang dipilih tidak dihitung. Kreditnya disisihkan saat kamu mengundangnya (lewat tautan, saat ia mulai), dan kembali jika kamu mencabutnya sebelum ia menjawab apa pun, jika ia tidak pernah mulai dan undangannya kedaluwarsa setelah 30 hari, atau jika wawancaranya berakhir tanpa ada yang dijawab.",
    },
    {
        "key": "compare_hiring",
        "question": "Bagaimana harganya dibanding alat asesmen lain?",
        "answer": "Banyak alat asesmen dijual sebagai langganan bulanan atau tahunan yang tetap dibayar meski kamu tidak menguji siapa pun. Di testee kamu hanya membayar per kandidat, dengan kredit yang dibeli di muka: {candidate} kredit ({candidate_price}), tanpa kontrak, tanpa biaya per pengguna, dan tanpa biaya untuk membuat wawancara. Perusahaan yang mengundang {example_candidates} kandidat per bulan membayar sekitar {example_year_price} per tahun sebelum pajak. Jika kamu menguji banyak kandidat setiap bulan, langganan bisa lebih murah, jadi bandingkan dengan angkamu sendiri.",
    },
    {
        "key": "top_up",
        "question": "Bagaimana cara membeli kredit?",
        "answer": "Pemilik dan admin mengisi ulang di halaman isi ulang, di menu akun, untuk {min_candidates} hingga {max_candidates} kandidat sekaligus. Paddle menerima pembayaran, menambahkan PPN atau pajak penjualan jika ada, dan menerbitkan tanda terima atau faktur; faktur tiap isi ulang juga ada di tab Tagihan perusahaan.",
    },
    {
        "key": "expire",
        "question": "Apakah kredit bisa kedaluwarsa?",
        "answer": "Tidak. Kredit tidak pernah kedaluwarsa, dan tidak ada langganan berbayar. Jika Anda menyalakan isi ulang otomatis yang opsional, Paddle menyimpan kartu Anda sebagai langganan {zero_price}; Anda hanya membayar isi ulang yang dilakukannya.",
    },
    {
        "key": "auto_top_up",
        "question": "Bisakah kredit terisi ulang otomatis?",
        "answer": "Bisa, jika pemilik atau admin menyalakannya di halaman isi ulang: pilih isi ulang dan saldo batas pengisiannya, lalu centang apa yang ditagih dan kapan. Setiap kali saldo perusahaan yang tersedia turun di bawah batas itu, kartu yang tersimpan ditagih, ditambah pajak jika ada, dan pemilik serta admin perusahaan menerima email. Tagihan yang ditolak dicoba lagi setelah 1, 3, dan 7 hari; lalu isi ulang otomatis dijeda sampai kartu diperbarui. Mematikannya, di tempat kamu menyalakannya, langsung menghentikannya.",
    },
    {
        "key": "currency",
        "question": "Saya membayar dalam mata uang apa?",
        "answer": "Harga dalam mata uang lokal di Kanada, Australia, Israel, Polandia, Swiss, Jepang, Korea Selatan, Taiwan, Hong Kong, Thailand, Singapura, dan India; dalam euro di negara UE lainnya serta di Islandia, Liechtenstein, dan Norwegia; dalam pound di Inggris; dan dalam dolar AS di tempat lain. Akunmu dan setiap perusahaan tetap memakai mata uang negara tempat mereka dibuat atau pertama kali digunakan, ke mana pun kamu bepergian: ubah mata uangmu di Pengaturan, dan mata uang perusahaan di halaman isi ulang (pemilik dan admin). Isi ulang sebuah perusahaan, termasuk yang otomatis, selalu ditagih dalam mata uang perusahaan itu. Jika kamu mengubah mata uang perusahaan saat isi ulang otomatis menyala, kamu akan melihat kedua jumlah untuk dikonfirmasi lebih dulu, dan pemilik serta admin perusahaan menerima email.",
    },
    {
        "key": "referrals",
        "question": "Bisakah aku mendapat kredit dengan mereferensikan perusahaan?",
        "answer": "Bisa. Bagikan tautan di tab Referal perusahaanmu: saat perusahaan baru yang dibuat lewat tautan itu melakukan isi ulang pertamanya, berapa pun jumlahnya, kedua perusahaan mendapat {referral} kredit, hingga 25 referal per tahun. Hanya perusahaan pertama dari email pemiliknya yang dihitung, dan perusahaanmu sendiri tidak dihitung.",
    },
    {
        "key": "refunds",
        "question": "Bisakah aku mendapat pengembalian dana?",
        "answer": "Bisa, untuk kredit yang kamu beli dalam 14 hari terakhir dan belum dipakai: di halaman tagihan perusahaanmu, lewat Paddle, atau dengan menulis kepada kami. Kredit yang dicadangkan untuk kandidat tidak bisa dikembalikan selama masih dicadangkan; kredit yang disisihkan dalam 14 hari itu bisa dikembalikan selama 7 hari setelah kembali. Kredit gratis, seperti hadiah sambutan, tidak dikembalikan, dan dihitung terpakai lebih dulu. Rinciannya ada di [ketentuan](/terms).",
    },
    {
        "key": "scorecards",
        "question": "Apa yang ditampilkan scorecard?",
        "answer": 'Setiap jawaban, apakah benar, dan berapa lama waktunya. Nilai adalah persentase poin yang diperoleh: setiap soal bernilai satu poin, dan soal "pilih semua yang benar" memberi sebagian poinnya untuk setiap opsi benar yang dicentang, dan nol jika ada opsi salah yang dicentang. Nilai tampil hijau atau merah dibanding nilai lulus yang kamu tetapkan untuk wawancara. Scorecard juga menandai jawaban yang terlalu cepat untuk sempat membaca soal, saat kandidat meninggalkan halaman, dan upaya menyalin.',
    },
    {
        "key": "reports",
        "question": "Bisakah aku membagikan hasil ke hiring manager?",
        "answer": "Bisa. Unduh laporan PDF untuk satu kandidat atau semua kandidat sebuah wawancara, kirim lewat email langsung dari testee, atau kirim ringkasan singkat di WhatsApp, Telegram, Viber, atau LINE.",
    },
    {
        "key": "action_log",
        "question": "Bisakah aku melihat siapa melakukan apa di perusahaanku?",
        "answer": "Bisa, jika kamu pemilik perusahaan. Tab Log tindakan perusahaan itu mencantumkan apa yang dilakukan anggotanya, dari yang terbaru: mengundang atau menghapus kandidat, melihat hasil, serta mengubah wawancara, tim, tagihan, dan integrasi, lengkap dengan siapa yang melakukannya, kapan, dan apakah asisten, aplikasi AI, API, atau ATS yang melakukannya atas nama mereka. Kamu bisa memfilternya berdasarkan anggota, jenis tindakan, dan tanggal, serta mengunduhnya sebagai file CSV. Tindakan disimpan selama 12 bulan. Tindakan kunci API tampil dengan nama kunci.",
    },
    {
        "key": "bias_audit",
        "question": "Bisakah aku mengekspor hasil untuk audit bias?",
        "answer": "Bisa, jika kamu pemilik perusahaan. Tab Log tindakan punya Ekspor audit bias: file CSV berisi setiap kandidat yang sudah selesai, untuk semua wawancara atau satu wawancara dan di antara tanggal yang dipilih, dengan nilai mereka, nilai lulus, apakah mereka lulus, dan apakah skor mereka di atas median wawancara. testee tidak menyimpan data jenis kelamin, ras, atau etnis, jadi kamu menambahkan sendiri jawaban yang dilaporkan kandidat menurut email, lalu menghapus emailnya sebelum memberikan file itu ke auditor independenmu.",
    },
    {
        "key": "notes",
        "question": "Bisakah timku menyimpan catatan tentang wawancara?",
        "answer": "Bisa. Setiap wawancara punya tab Catatan tempat timmu menulis catatan teks biasa tentang rekrutmennya, misalnya siapa yang dihubungi berikutnya atau, bagi agensi rekrutmen, untuk klien mana wawancara itu. Setiap anggota bisa menulis catatan, termasuk pelihat, dan mengedit catatannya sendiri; penulis, pemilik, dan admin bisa menghapus catatan. Pemilik dan admin bisa menyematkan satu catatan, yang lalu tampil di bawah nama wawancara. Kandidat tidak pernah melihat catatan.",
    },
    {
        "key": "team",
        "question": "Bisakah aku menambahkan timku?",
        "answer": "Bisa, dan anggota tidak dikenai biaya. Di tab Tim perusahaan, pemilik mengundang tiap orang lewat email sebagai admin atau pelihat. Admin bisa melakukan semuanya kecuali mengelola tim, melihat log tindakan, dan menghapus perusahaan. Pelihat melihat wawancara dan hasil, membagikan laporan, dan menulis catatan, tetapi tidak mengubah hal lain dan tidak bisa isi ulang. Satu akun bisa memiliki beberapa perusahaan, masing-masing dengan tim dan kreditnya sendiri.",
    },
    {
        "key": "integrations",
        "question": "Apakah testee bisa dipakai dengan ATS atau tools lain yang saya gunakan?",
        "answer": "Bisa, tanpa biaya tambahan; kandidat dikenai biaya seperti biasa. Pemilik dan admin menghubungkan Workable, Greenhouse, Teamtailor, Recruitee, atau Breezy HR di tab Integrasi perusahaan dengan kunci dari ATS, lalu menautkan lowongan ke wawancara dan tahap: kandidat yang kamu pindahkan ke tahap itu mendapat wawancara, dan hasilnya dikirim kembali ke ATS ([cara menghubungkan tes keterampilan ke ATS-mu](/guides/ats-integration-skills-tests)). Slack bisa memposting notifikasi perusahaanmu ke sebuah channel, dan API memungkinkan platformmu sendiri membuat wawancara, mengundang dan mengelola kandidat, serta menerima hasil mereka, dengan setiap kunci API terbatas pada yang kamu centang untuknya; lihat [Dokumentasi API](/api-docs).",
    },
    {
        "key": "slack",
        "question": "Bagaimana integrasi Slack bekerja?",
        "answer": 'Pemilik atau admin memilih "Tambahkan ke Slack" di tab Integrasi perusahaan dan memilih satu channel, lalu memilih notifikasi mana yang masuk ke sana, seperti kandidat selesai, undangan tidak terkirim, kandidat ATS tidak diundang, atau catatan baru. Gratis.',
    },
    {
        "key": "api_keys",
        "question": "Bagaimana cara kerja kunci API?",
        "answer": "Pemilik dan admin membuatnya di halaman API perusahaan, di bawah Integrasi. Kamu mencentang apa yang boleh dilakukan tiap kunci, memilih kapan kedaluwarsa (dalam 1, 3, 6, atau 12 bulan, atau tidak pernah), dan bisa membatasinya ke alamat IP yang diizinkan. Kunci ditampilkan sekali. Perusahaan bisa membuat 60 permintaan per menit. [Dokumentasi pengembang](/api-docs) menjelaskan setiap panggilan.",
    },
    {
        "key": "webhooks",
        "question": "Bisakah testee memberi tahu sistemku saat kandidat selesai?",
        "answer": "Bisa, dengan webhook yang diatur di halaman API perusahaan. testee memanggil alamatmu saat kandidat mulai, selesai (dengan hasilnya), tidak terjangkau, kedaluwarsa, atau dihapus, dan saat wawancara siap, serta menandatangani setiap panggilan dengan secret-mu. Panggilan yang gagal dicoba lagi selama 3 hari; lalu webhook dijeda sampai satu event uji berhasil. Setiap webhook punya log pengiriman terbarunya. Lihat [dokumentasi webhook](/api-docs?tab=webhooks).",
    },
    {
        "key": "embed",
        "question": "Bisakah kandidat mengikuti wawancara di situsku sendiri?",
        "answer": "Bisa, dengan SDK testee: skrip yang menampilkan wawancara di dalam halamanmu, di situs yang kamu izinkan di halaman API perusahaan. Servermu mengundang setiap kandidat lewat API dengan proses masuk dimatikan, jadi mereka tidak perlu akun testee dan testee tidak mengirimi mereka email. Tidak ada biaya tambahan; kandidat dikenai biaya seperti biasa. Lihat [dokumentasi SDK](/api-docs?tab=sdk).",
    },
    {
        "key": "ai_apps",
        "question": "Bisakah saya memakai testee dari Claude, ChatGPT, atau agen AI saya sendiri?",
        "answer": "Bisa. Tambahkan testee ke Claude atau ChatGPT sebagai konektor (langkah-langkahnya ada di tab Integrasi perusahaanmu), lalu izinkan di testee, hanya untuk membaca atau juga untuk membuat perubahan. Setelah itu, aplikasi bekerja dengan perusahaan, wawancara, dan hasil kandidatmu atas namamu, dengan hak aksesmu. Akun atau perusahaan hanya bisa dihapus di testee. Apa yang dibaca aplikasi sampai ke penyedianya sesuai ketentuan aplikasi tersebut. Kamu bisa memutuskan sambungannya kapan saja di tab yang sama, dan pemilik serta admin bisa mematikan aplikasi AI untuk sebuah perusahaan. Aplikasi AI lain dan agen yang kamu buat sendiri juga bisa terhubung: [tab MCP](/api-docs?tab=mcp) di dokumentasi pengembang berisi langkah-langkah dan contoh agen, dan agen di server bisa masuk dengan kunci API yang punya hak akses agen AI, dan hanya melakukan apa yang diizinkan hak akses lain pada kunci itu. [Panduan tentang agen AI, MCP, dan API](/guides/ai-agents-mcp-and-api) menjelaskan kegunaan masing-masing.",
    },
    {
        "key": "candidates",
        "question": "Apa yang dilihat kandidat?",
        "answer": "Nama dan logo perusahaanmu, dengan warna dan font perusahaanmu (diatur di tab Merek-nya), apa yang bisa diharapkan sebelum mulai, lalu satu soal berbatas waktu setiap kalinya. Wawancara tidak pernah menunjukkan skor mereka atau apakah jawabannya benar; nilai mereka hanya ada di unduhan data mereka sendiri.",
    },
    {
        "key": "brand",
        "question": "Bisakah wawancara memakai merek perusahaanku?",
        "answer": "Bisa, tanpa biaya tambahan. Di tab Merek perusahaan, pemilik dan admin mengatur logo, warna untuk tema terang dan gelap, font, dan kelengkungan sudut. Kandidat melihatnya sepanjang wawancara, tanpa header atau footer testee, dan logonya juga tampil di email dan laporan.",
    },
    {
        "key": "candidate_account",
        "question": "Apakah kandidat perlu akun?",
        "answer": "Ya, dan gratis: mereka masuk dengan Google, LinkedIn, atau GitHub, memakai email terverifikasi yang kamu undang, jadi undangan yang diteruskan tidak berguna bagi orang lain. Lewat tautan yang bisa dibagikan, email terverifikasi apa pun bisa dipakai. Pengecualiannya adalah undangan yang dibuat platformmu sendiri lewat API, yang bisa melewati proses masuk.",
    },
    {
        "key": "verified",
        "question": "Apa arti tanda centang terverifikasi?",
        "answer": "Artinya pemilik atau admin perusahaan masuk dengan email kerja di domain situs perusahaan, misalnya you@acme.com, lalu tim kami meninjau perusahaan tersebut. Tambahkan situsnya lewat Verifikasi di header perusahaanmu; layanan email gratis tidak dihitung. Selama masih menunggu peninjauan, timmu melihat ikon jam di samping nama, dan mengganti nama perusahaan mengirimnya untuk ditinjau lagi. Tanda centang tampil di samping nama perusahaanmu, termasuk di undangan.",
    },
    {
        "key": "languages",
        "question": "Bahasa apa saja yang didukung?",
        "answer": "{count} bahasa, untuk situs, wawancara, dan email. Pilih bahasa penulisan wawancara, apa pun bahasa deskripsi pekerjaannya.",
    },
    {
        "key": "mira",
        "question": "Siapa Mira?",
        "answer": 'Asisten AI testee: AI, bukan orang, dan jawabannya bisa salah. Buka lewat "tanya Mira" di header. Pengunjung bisa bertanya apa saja tentang testee. Saat kamu sudah masuk, Mira juga membaca perusahaanmu dengan aksesmu dan membuat perubahan yang kamu minta, masing-masing hanya setelah kamu mengonfirmasinya. Bertanya ke Mira tidak memakai kredit, dan kandidat tidak mendapatkannya selama wawancara.',
    },
    {
        "key": "search",
        "question": "Bisakah aku mencari di testee?",
        "answer": "Bisa. Pencarian di header menemukan, selagi kamu mengetik, perusahaan, wawancara, dan kandidatmu (menurut nama atau email), serta halaman situs, panduan, perbandingan, teks hukum, pertanyaan FAQ, dan tes keterampilan. Jika belum masuk, pencarian hanya menemukan yang bersifat publik.",
    },
    {
        "key": "privacy",
        "question": "Apa yang terjadi pada deskripsi pekerjaan dan jawaban?",
        "answer": "Deskripsi pekerjaan dipakai untuk membuat wawancara perusahaanmu, dan jawaban kandidat untuk menilainya bagi perusahaanmu. Soal yang dibuat testee juga dapat digunakan kembali dalam wawancara dan latihan perusahaan lain, tanpa apa pun yang mengidentifikasi kamu, perusahaanmu, atau orang lain; kamu bisa mengecualikan soal suatu wawancara dari hal ini di pengaturannya. testee juga mempelajari pola umum kualitas soal yang dianonimkan dari cara soal dijawab, untuk meningkatkan cara soal dibuat. [Kebijakan privasi](/privacy) menjelaskan apa yang kami simpan, berapa lama, dan hak setiap orang.",
    },
    {
        "key": "question_bank",
        "question": "Apakah soal wawancaraku dibagikan ke perusahaan lain?",
        "answer": "Secara default, ya. Soal yang dibuat testee bisa masuk ke bank soal bersama setelah dijawab beberapa kali dan lolos pemeriksaan bahwa soal itu tidak menyebut organisasi, orang, atau detail kontak; salinannya tidak memuat apa pun yang mengidentifikasi perusahaanmu. Pemilik dan admin bisa mengecualikan soal sebuah wawancara di tab Pengaturannya; tidak ada pengaturan untuk seluruh perusahaan. Soal yang sudah digunakan kembali tetap ada, meski perusahaanmu dihapus.",
    },
    {
        "key": "ai_training",
        "question": "Apakah data kami dipakai untuk melatih model AI?",
        "answer": "OpenAI, yang menjalankan AI testee, tidak melatih modelnya dengan apa yang kami kirim, sesuai ketentuan API-nya; OpenAI dapat menyimpannya paling lama 30 hari, hanya untuk memeriksa penyalahgunaan kecuali hukum mewajibkan lebih lama. testee sendiri mempelajari pola umum kualitas soal yang dianonimkan, untuk meningkatkan cara soal dibuat.",
    },
    {
        "key": "data_storage",
        "question": "Di mana data kami disimpan?",
        "answer": "Di Google Cloud, di Belgia. Beberapa penyedia menangani data di Amerika Serikat, seperti OpenAI dan Resend, berdasarkan Kerangka Privasi Data UE-AS atau klausul kontrak standar Komisi Eropa. [Halaman kepercayaan](/trust) mencantumkan semuanya.",
    },
    {
        "key": "eu_ai_law",
        "question": "Apakah legal memakai AI untuk menyaring kandidat di UE?",
        "answer": "Ya, dengan aturan. Menurut EU AI Act, alat yang menilai kandidat sangat mungkin tergolong berisiko tinggi, dengan kewajiban mulai 2 Desember 2027, dan GDPR sudah berlaku: keputusan perekrutan diambil oleh manusia, kandidat diberi tahu bahwa AI digunakan, dan catatan disimpan. testee bekerja seperti itu: AI menulis soal, orang-orang di perusahaanmu meninjau hasilnya dan memutuskan, dan kandidat diberi tahu sebelum mulai. Ini bukan nasihat hukum; [Apakah rekrutmen dengan AI legal di UE?](/guides/is-ai-hiring-legal-in-the-eu) menjelaskan aturan dan tanggalnya.",
    },
    {
        "key": "uk_us",
        "question": "Bisakah kami memakai testee untuk kandidat di Inggris dan AS?",
        "answer": "Bisa. Perjanjian pemrosesan data mencakup hukum Inggris dan AS, dan petunjuk untuk perusahaan serta templat pemberitahuan kandidat (dengan versi untuk New York City, Illinois, Colorado, dan Connecticut) mencakup apa yang wajib kamu sampaikan kepada kandidat. Untuk lowongan di New York City, gunakan hanya setelah kamu memenuhi apa yang diwajibkan Local Law 144 kepadamu: audit bias independen dalam satu tahun sebelum penggunaan, publikasi ringkasannya, dan pemberitahuan kepada kandidat 10 hari kerja sebelumnya. Ekspor audit bias di Log tindakan memberi auditormu nilai dan hasil setiap kandidat yang sudah selesai, untuk dicocokkan dengan jawaban yang diisi sendiri oleh kandidatmu.",
    },
    {
        "key": "emails",
        "question": "Email apa saja yang dikirim testee, dan bagaimana cara menghentikannya?",
        "answer": 'Email layanan, seperti undangan, laporan, email tagihan, dan perubahan ketentuan kami, tidak dapat dimatikan; hanya alamat yang emailnya terpental secara permanen atau yang menandai salah satu email kami sebagai spam yang berhenti menerimanya. Sisanya, seperti ringkasan aktivitas harian, pengingat, pembaruan produk, dan penawaran, kamu pilih di Pengaturan, bagian Email, atau hentikan dengan tautan "Berhenti berlangganan" di setiap email. Kandidat bisa menghentikan email dari perusahaanmu, atau pengingat sebuah wawancara, lewat tautan di undangan dan pengingat mereka. Berita testee muncul di notifikasimu, ikon lonceng di bagian atas; berita penting juga dikirim lewat email sebagai pembaruan produk, hanya selama pengaturan itu aktif.',
    },
    {
        "key": "data_export",
        "question": "Bisakah aku mengunduh dataku?",
        "answer": 'Bisa. "Unduh dataku" di Pengaturan memberimu satu file JSON berisi apa yang disimpan testee tentangmu; untuk wawancara perusahaan, file itu memuat jawaban dan nilaimu, tetapi tidak memuat jawaban mana yang benar. Tidak ada ekspor seluruh perusahaan: pemiliknya bisa mengunduh log tindakan, dan anggota bisa mengunduh laporan PDF kandidat.',
    },
    {
        "key": "candidate_data",
        "question": "Bagaimana kandidat bisa menghapus datanya?",
        "answer": "Dengan meminta ke perusahaan yang mengundangnya: mencabut kandidat yang sudah mulai menghapus dirinya dan hasilnya secara permanen. Atau dengan menghapus akun testee-nya di Pengaturan, yang menghapus hasilnya. Selain itu, hasil dihapus otomatis 12 bulan setelah undangan terakhir dikirim.",
    },
    {
        "key": "delete",
        "question": "Bisakah aku menghapus akunku?",
        "answer": "Bisa, di Pengaturan, kecuali jika kamu memiliki perusahaan yang sudah diikuti orang lain: jadikan dulu anggota lain sebagai pemiliknya, atau hapus perusahaan itu. Akun dan datamu dihapus, bersama perusahaan yang hanya beranggotakan kamu dan kreditnya, jadi minta dulu pengembalian dana yang menjadi hakmu. Perusahaan menyimpan catatan undanganmu tanpa emailmu, dan catatan pembelian tetap disimpan sesuai ketentuan hukum akuntansi. Sebelumnya kamu bisa mengunduh salinan datamu.",
    },
    {
        "key": "company_delete",
        "question": "Bisakah aku menghapus perusahaan?",
        "answer": "Bisa, jika kamu pemiliknya. Wawancara, kandidat, hasil, dan kreditnya hilang secara permanen dan isi ulang otomatisnya berhenti, jadi minta dulu pengembalian dana yang menjadi hakmu. Salinan soalnya yang sudah ada di bank soal bersama tetap ada.",
    },
    {
        "key": "report",
        "question": "Bagaimana cara melaporkan masalah?",
        "answer": "Tulis pesan kepada kami di [halaman kontak](/contact) dan tempelkan ID hal yang kamu maksud: “salin id” ada di bawah nama perusahaan, wawancara, atau kandidat, dan ID akunmu ada di menu akun serta di Pengaturan. Dengan ID itu, kami langsung menemukannya.",
    },
]
