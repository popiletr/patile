# Petsgram — PatiLife günlük fotoğraf ve sponsor tasarımı

Durum: 23 Ekim 2026 oyun içi Patigram uygulandı. Güncel kapsam ve doğrulama: [Patigram uygulaması](PATILIFE_PATIGRAM_UYGULAMA.md). Aşağıdaki metin ilk tasarımdır; yeni poz atlasları ve sunucu akışı gelecekteki kapsamdır. Mama İzini Bul, Pencere Nöbeti ve Kutu Kaşifi de onaylanan fikirlerdir; ayrı uygulama işleri olarak durur.

## Ana döngü

Kediyle ilgilen → açık odada fotoğraf köşesi seç → kedi oraya yürüsün → poz/gerçek davranış sırasında fotoğraf çek → Petsgram'a paylaş → zaman içinde beğeni ve yorum gelsin → düzenli üretimle takipçi ve sponsor ilişkisi gelişsin → kargo envantere girsin → oda seçerek yerleştir.

Petsgram oyun içindeki kurgusal uygulamadır. Gerçek bir sosyal ağa yayın, gerçek kullanıcı yorumu veya gerçek marka anlaşması olarak sunulmaz. İlk sürüm çevrimdışı da çalışabilir; yorumlar oyun karakterlerinden gelir. Gerçek servis hedeflenirse ayrıca sunucu ve gizlilik kapsamı gerekir.

## Fotoğraf modu

- Kamera düğmesi kedi, açık oda ve yerleştirilmiş eşyalardan fotoğraf köşeleri gösterir. Kapalı odayı atlayarak açmaz. Odayı seçince normal geçiş ve yürüyüşle gidilir; kedi fotoğraf için ışınlanmaz.
- Örnek köşeler: salon pencere önü, yatak minderi, mutfak öğün köşesi, bahçede yaprak, kış bahçesi çiçek önü, tavan odasında oyuncak ve Kütüphane minderi.
- Pozlar: meraklı bakış, pati selamı, yan yatış, esneme, oyuncağı tutma, pencereyi izleme. Her görünüşün üç yaşıyla tutarlı poz atlasları gerekir; bu görseller henüz üretilmedi. Uyuyan/yoğun bakımda olan kediye zorla poz başlatılmaz.
- Çekilen kare o anki kedi, yaş, oda, eşyalar, poz ve tarihle birlikte saklanır. Fotoğraf gerçek PNG/Blob olarak üretilirse düşük çözünürlüklü küçük resim ve sınırlı albüm kapasitesi kullanılır; base64 fotoğraf dizileri ana localStorage kaydına eklenmez. IndexedDB ve kota hatası ele alınır.
- Farklı oda ve davranışları keşfetmek çeşitlilik verir; pahalı dekoru olmayan oyuncu temel günlük ilerlemeyi kaybetmez.

## Gerçek gün ve etkileşim

İlk denge önerisi: yerel gerçek takvim gününde bir gönderi takipçi ilerlemesine sayılır. Aynı gün başka fotoğraf çekip albüme koymak veya paylaşmak mümkündür; takipçi/altın ödülü tekrar üretilmez. Bir sonraki ödüllü paylaşım zamanı açıkça gösterilir. Gün anahtarı, gönderi kimliği, etkileşim dönemi ve ödül kaydı tek işlemde saklanır.

Beğeniler ilk saniyede topluca verilmez. Paylaşım sonrasında örneğin 6–12 gerçek saatlik bir dönem boyunca aralıklı gelir; yorumlar bunun daha seyrek parçalarıdır. Sol kenarda en fazla iki kısa etkileşim satırı görünür; bakım etiketi/çekmecesi, toast veya kediyle üst üste gelmez. Panel kapalıyken her beğeni DOM üretmez; toplu sayaç güncellenir. Gizli sayfada animasyon durur. Dönüşte yalnız hesaplanmamış zaman dilimi kadar etkileşim yazılır.

Takipçi artışında farklı aktif paylaşım günleri ana etkendir. Aynı kareyi peş peşe göndererek büyüme yoktur. Başlangıç için iki günlük tolerans, sonra paylaşım yapılmayan gün başına küçük ve sınırlı takipçi azalışı önerilir. Örneğin yüzde 1–2 ve çevrimdışı tek dönüşte en çok yüzde 10; kesin değerler oyuncu testiyle ayarlanır. Kazanılmış sponsor eşyaları veya kedinin temel ihtiyaçları geri alınmaz. Uyarılar seyrektir: yeni yorum özeti, paylaşılabilir yeni gün ve gelen kargo. İşletim sistemi bildirimi mevcut izinlere bağlıdır; bu tasarım bildirim göndermeye yönelik onay değildir.

## Sponsor kargoları

Sadece takipçi sayısı yetmez: farklı gerçek günlerde paylaşım ve ilgili bakım alışkanlığı birlikte aranır. Örnek kademeler (taslak):

| Aşama | Koşul örneği | Kargo |
| --- | --- | --- |
| İlk işbirliği | 3 paylaşım günü ve 50 takipçi | Kaliteli mama deneme paketi |
| Güvenilen ev | 7 gün ve 150 takipçi | Özel oyuncak / poz aksesuarı |
| Düzenli üretici | 14 gün ve 350 takipçi, mama bakımı | Otomatik mama kabı |
| Ferah köşe | 21 gün ve 600 takipçi, su bakımı | Otomatik su kabı |
| Yaşayan ev | 30 gün ve 1000 takipçi, kum bakımı | Elektrikli tuvalet |

Mevcut başarım yolu korunabilir; Petsgram aynı yükseltmeyi ikinci kez ücretlendirmeden açan alternatif bir yol olur. Kargo yalnız bir kez teslim edilir, bekleyen paket kaydı kalıcıdır. Açıldığında gerçek envantere yazılır; Yerleştir açık/uygun odayı sorar. Eşya zaten varsa yeniden kopya üretmek yerine sınırlı sarf malzemesi karşılığı verilir. Otomatik kaplar sınırsız mama/su sağlamaz; mevcut sonlu hazne ve kum döngüsünü kullanır.

## Uygulama sırası ve kabul

1. Tek odada çalışan kamera, gerçek kareyi saklama, albüm, bir günlük tek paylaşım ve bir poz.
2. Dört desen/üç yaşa tutarlı pozlar, açık odalarda köşeler, kaldığı yerden süren sınırlı etkileşim akışı.
3. Takipçi gün dengesi, yorum karakterleri ve kargo → envanter → oda seçimi akışı.
4. Sponsor kademeleri, üç yeni mini oyunun günlük sonuçları ve fotoğraflanabilir oyun anları.

Kontroller: aynı gün tekrar ve yeniden açma ödül çoğaltmamalı; uzun çevrimdışı dönüş sınırsız etkileşim üretmemeli; saat geriye alınırsa o gün ikinci ödül verilmemeli; saat ileri sıçraması tek başına sponsor gün şartı oluşturmamalı; albüm ve kargo kayıtları yeniden yüklemede korunmalı; seçilmemiş/kilitli odaların varlığı fotoğrafı bozmamalı; fotoğraf paneli kapanınca zamanlayıcı ve büyük bitmapler serbest bırakılmalı. FPS ve mobil ekran görsel kabulü ayrıca yapılmalıdır.

