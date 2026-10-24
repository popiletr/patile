# PatiLife — Yapım planı ve bağlantılı oyun senaryosu

Bu dosya geliştirme için ana referanstır. Kullanıcının onayı: mobil öncelik, görsellerin geliştirici tarafından üretilmesi, mevcut oyunun yedeklenmesi ve sırayla uygulanması. Emojiler kullanılmayacak. Tamamlanmamış işler tamamlandı olarak işaretlenmeyecek.

## Güncel oynanış kararı — 23 Ekim 2026

Kullanıcının son talimatı: ana oynanışın temeli kendi ilk sürümü olacak. `sprite_preview/patilife_app.html` içindeki 2200 birim panoramik oda, mevcut mapping/poligonlar, kamera kaydırma, oda sınırından geçiş, yürüme/zıplama, bakım butonları ve bütün mini oyunlar referanstır. V2'nin bunların yerine kurduğu ayrı ev arayüzü geliştirme yönü olarak bırakıldı. Beğenilen yeni kedi çizimleri ilk motorun çizim katmanına taşınıyor. Yeni hikâye, büyüme, günlük ve eşya modülleri bu temelin üzerine parça parça entegre edilecek.

Aşağıdaki eski günlükler o tarihteki kapsamı anlatır. Son entegrasyonda 48 eşya, büyüme, bağ, günlük, albüm ve 60 başarım ana motora bağlandı. Ana oyundaki tek etkin para/ihtiyaç kaydı `pet_state`; yeni ilerleme bunun `lifeV2` alanında tutulur. Ayrı prototipin eski kaydı ana oyundaki yeni kazançları ezmez. Görsel kabul ve gerçek cihaz testleri hâlâ tamamlanmadı.

## 1. Hedef deneyim

Yağmurlu bir günde dört arkadaşın bulduğu dört yavrunun tamamı sahiplenilir. Oyuncu kendisiyle eve gelecek yavruyu seçer, isim verir, güven kazanır, büyümesine eşlik eder. Bakım, ev kurma, kısa oyunlar ve günlük hikâyeler aynı kediyle bağ kurmayı destekler. Öncelik iOS; Android aynı web çekirdeği üzerinden hazırlanır. Masaüstü bu sürümün kapsamı dışındadır.

Temel döngü: eve dön → kedinin yaptığını gör → ihtiyaçlarını anla → birlikte etkinlik yap → bağ ve kaynak kazan → işlevsel eşya edin → yeni davranış/hatıra aç → sonraki ziyarete anlam bırak.

## 2. Hikâye ve ilk oturum

1. Yağmur: dört arkadaş yürür; kısa, sessiz görsel paneller ve uygulamanın üstüne yerleştirdiği Türkçe metinler.
2. Ses: korunaklı bir köşedeki kutu fark edilir. Tehlike/terk edilme dramatize edilmez.
3. Tanışma: sarman, tekir, smokin, calico yavrular görülür. Hepsi ev bulacaktır; seçilmeyenler için suçluluk oluşturulmaz.
4. Seçim: her kart tüy deseni, sabit cinsiyet, karakter ve kısa davranış sunar. Ayrı huy/cinsiyet menüsü kaldırılır.
5. İsim: boş veya yalnızca boşluk içeren isim kabul edilmez; 1–20 karakter, HTML metni olarak güvenle gösterim. İsim sonradan değişebilir; kimlik değişmez.
6. Ayrılış: arkadaşların üç kediyi aldığı açıkça gösterilir. Sonraki haberlerde aynı kimlikler korunur.
7. İlk ev: taşıma çantası açılır. Kedi kendi hızında çıkar. Zorla sevme istenmez.
8. Güvenli köşe: su, küçük öğün, yatak ve kum alanı tanıtılır. Her adım gerçek etkileşimle tamamlanır; sadece ileri düğmesiyle geçilmez.
9. İlk oyun: kısa, düşük zorlukta oyuncak takibi. Patile ayrıca erişilebilir kalır.
10. İlk hatıra: isimle kişiselleştirilmiş eve geliş kaydı; ilk oturum biter. Sonraki ziyaretin amacı belirtilir.

Kedi taslakları: sarman erkek/cana yakın; tekir dişi/meraklı; smokin erkek/temkinli; calico dişi/oyuncu. Bunlar üretim varsayımıdır, biyolojik veya renk temelli kişilik iddiası değildir. Her biri eşit değerde, aynı içerik erişimine sahiptir. Arkadaş karakterleri ortak görsel kimlikle korunur; isimleri uygulama verisinde tutulur.

## 3. Büyüme ve ilişki

Yaş, deneyim ve bağ ayrı değerlerdir. Yavru → genç → yetişkin. İlk denge: en az 3 gerçek gün ve ilk ev adımları sonrası gençlik; en az 14 gün ve ilişki eşiği sonrası yetişkinlik. Süreler testle değişebilir. Geçiş oyuncu geri döndüğünde sahnelenir; uzun ayrılık yavruluk içeriğini atlatmaz. Ölüm, yaşlılık ve kalıcı ceza ilk sürümde yoktur.

Bağ seviyesi güvenli yaklaşma, düzenli bakım ve birlikte oyunla artar; tekrar eylemini spamlamak ödül üretmez. Aynı gün tekrarlanan katkıya sınır konur. Tercihler (oyuncak/uyku noktası) gözlemlenerek öğrenilir. Kişilik davranış ağırlıklarını etkiler; bir kediyi daha kazançlı yapmaz.

## 4. Davranış motoru

İhtiyaç, mevcut oda, kişilik, güven, yakın eşyalar ve son eylemler karar üretir. Durumlar: bekle, gözlemle, yürü, yaklaş, kokla, kullan, temizlen, oyna, uyu. Aynı anda tek ana eylem; giriş/çıkış kuralları ve iptal davranışı belirlenir. Animasyon ile hareket hızı eşleşir; kare hızına bağlı hareket kaldırılır. Eşyanın yaklaşma noktası, kullanım noktası, derinliği ve kapladığı alan tanımlıdır. Yolu olmayan eşya kullanılamaz; kedi duvarın veya diğer eşyanın içinden geçmez.

Her aşama için başlangıç animasyonları: bekleme, yürüme, oturma, koklama, yeme, içme, uyuma, temizlenme, sevilme tepkisi, oyuncak takibi. Dört desen ve üç yaşın hepsini üretmeden önce tek kedinin uçtan uca hareket seti doğrulanır. Baş oranı ve yürüyüş yaşla değişir; yalnızca ölçekleme büyüme sayılmaz.

## 5. Arayüz

İlk sürümün mobil oyun düzeni temel alınır: mevcut üst durum paneli, oda kontrolleri, bakım ve mini oyun butonları, panoramik kamera ve oda içi etkileşimler korunur. Kullanıcının alıştığı butonlar ve oyunlar kaybedilmez. Sadeleştirme bu akışı değiştirerek değil, taşan yazıları/kapanan alanları tek tek düzelterek yapılır. Uzun durum metinleri zeminde sürekli bir bant oluşturmaz. Yeni özellikler mevcut ekranlara ve kontrollü pencerelere bağlanır. Kediyle oda ana odaktır. Gerçek ekran kontrolleriyle mapping ve dokunma alanları doğrulanır.

## 6. Oyunlar ve ekonomi

Patile korunur; ortak ekonomiyle köprü sürdürülür. Av, doğal oyuncak takibi olarak yeniden dengelenir; ilk gün düşük zorluk. Yumak oyunu güven/tercihle ilişkilendirilir. Kum temizliği bakım etkinliğidir, sınırsız para kaynağı değildir. Yeni oyun sayısından önce mevcutların kontrolü, süreleri, ödülleri ve performansı doğrulanır.

Tek ana para; güven ve yaş satın alınmaz. Temel mama/su/kum oyuncuyu kilitlemeyecek ücretsiz güvenli seçeneklere sahip olur. Reklam temel bakımı veya ilerlemeyi zorunlu tutmaz; geliştirmede test modu kullanılır. Her kazanç, harcama ve ödül türü merkezi tabloda tanımlanır. Aynı ödül bir kez işlenir. Reklam sırasında tüm ilgili simülasyonlar güvenle durur ve hatada devam eder.

## 7. Günlük olaylar ve arkadaşlar

Yerel gün anahtarı cihazın takvimine göre hesaplanır; UTC tarihinden kaynaklanan gün kayması engellenir. Dönüş olayı kayda üretilir, ekran açılışında yeniden rastgele seçilmez. Olumlu, nötr ve hafif yaramazlık olayları çeşitlendirilir. Kırma olayı temel kaynağı tüketmez ve satın alınmış eşyayı silmez. Olaylar sahip olunan eşya/yaş/oda ile uyumlu olur.

Örnekler: düğme bulma, yeni yatakta uyuma, oyuncağı taşıma, saksı toprağını dağıtma, pencereyi keşfetme. Sonuçları küçük kaynak, hatıra, tercih keşfi veya kısa etkileşimdir. Arkadaşların diğer üç kedisinden kurgu haberler gelir; ağ bağlantısı veya gerçek kişilerle mesajlaşma gerekmez.

Günlük üç öneri: bakım, bağ, keşif. Aç olmayan kediye zorla mama vermek görev değildir. Başarımlar 60 anlamlı dönüm noktası: 12 bağ, 9 büyüme/ilkler, 12 keşif/olay, 12 ev/tercih, 9 oyun, 6 uzun vadeli rutin. Süreklilik kaçırıldığında ilerleme silinmez. Taslak sayılar; gerçek katalog ayrı veri olarak uygulanır.

## 8. İşlevsel eşya kataloğu — 48 ürün

Her ürünün fiyatı, açılma koşulu, oda, boyut, etkileşim noktası, davranış katkısı ve atlas karesi olacaktır. Aynı tür etkiler sınırsız toplanmaz. Ücretli güç zorunluluğu yoktur.

| Grup | Ürünler | Amaç |
|---|---|---|
| Beslenme (6) | seramik mama kabı, geniş su kabı, su pınarı, yavaş yeme kabı, mama bulmacası, zamanlı mama kabı | güvenli bakım, farklı yeme davranışı ve zihinsel etkinlik |
| Dinlenme (6) | yavru minderi, yuva yatak, keçe mağara, pencere minderi, hamak, serinleme minderi | uyku tercihi ve güvenli alan |
| Tırmalama (6) | karton tabla, dikey direk, eğimli tabla, duvar paneli, küçük kedi ağacı, çok katlı ağaç | tırmalama ihtiyacı ve tırmanma |
| Oyun (6) | kumaş fare, yumuşak top, yumak, olta oyuncak, top kanalı, ödül labirenti | birlikte oyun ve tercih keşfi |
| Keşif (6) | karton kutu, kumaş tünel, iki girişli tünel, alçak raf, basamak seti, saklanma küpü | koklama, saklanma, erişim noktaları |
| Temizlik (6) | açık kum kabı, geniş kum kabı, mahremiyet panelli kumluk, kum paspası, bakım fırçası, havlu köşesi | temizlik ve bakım etkileşimleri |
| Gözlem (6) | pencere platformu, kuş gözlem sehpası, güvenli sineklikli pencere köşesi, gölge perdesi, bahçe gözlem bankı, akşam ışığı | gözlem, sakinleşme, çevre olayları |
| Ortak yaşam (6) | hatıra kutusu, fotoğraf panosu, oyuncak sepeti, güvenli kedi çimi, sahibinin okuma minderi, taşıma çantası | albüm, oyuncak seçme, keşif, yakınlık ve ilk ev anlatısı |

## 9. Görsel üretim

Mevcut oyunun pastel 2D çizgi film dili korunur: sade yüz, yuvarlak oranlar, kahverengi kontur; gerçekçi kürk veya gerçekçi oda üretimi kullanılmaz. Tutarlı perspektif, kontur ve ölçek esas alınır. Yazılar görsele gömülmez. Fotoroman için ayrı paneller, seçim için dört kimliği koruyan portreler. Eşya atlasları yaklaşık 12 ürünlük dört sayfa; gerçek şeffaf alfa, eşit hücreler, kenar taşması payı. Hücre koordinatları dosyada tutulur; görsel gözle ve alfa/ölçü kontrolüyle doğrulanır. Kedi animasyonları atlaslardan ayrı düzenlenir. Üretilen dosyalar proje içine kopyalanır; promptları ve kullanım yerleri kaydedilir. Önce bir sahne ve bir kedi setiyle stil doğrulanır; sonra çoğaltılır.

## 10. Teknik yapı ve kayıt güvenliği

Mevcut tek HTML bir anda silinmez. Yeni modüller veri/arayüz/davranış/kayıt/görsel sorumluluklarıyla ayrılır. Sürüm numaralı kayıt: cat kimliği/deseni/cinsiyeti/kişiliği/isim; büyüme; bağ; ihtiyaçlar; ekonomi; envanter; yerleşim; hikâye; günlük olay; başarımlar; ayarlar; son işlenme zamanı. Eski kayıt önce ham olarak yedeklenir, sonra göç edilir. Mevcut oyuncu zorla sıfırlanmaz; yeni hikâye ayrı yeni oyun akışıdır. Bozuk kayıt sessizce yok edilmez.

Mobil paket betiği yalnızca dağıtım manifestindeki dosyaları kopyalayacak; yedekler/önizlemeler/geliştirme dökümleri dahil edilmeyecek. iOS özel servisleri adaptör üzerinden, Android desteği ayrı adaptörle çalışacak. Web önizlemede native servis eksikliği oyunu engellemeyecek.

## 11. Bağımlılık şeması

Yedek → dağıtım sınırı → kayıt şeması/göç → kedi kimliği → hikâye/seçim/isim → ilk ev → sade arayüz → davranış + tek kedi animasyonu → büyüme/bağ → eşya etkileşimi → 48 ürün → günlük olay/görev/başarım → ekonomi → diğer kedi görselleri → mobil doğrulama.

Patile koruma kontrolleri her ana entegrasyonda yapılır. Görsel üretim, görselin ölçü ve etkileşim sözleşmesi belirlendikten sonra yapılır.

## 12. Uygulama listesi ve bitiş ölçütleri

- [x] P00: Mevcut kaynaklar ve iOS özel kodlarının doğrulanmış yedeği. Geri yükleme yolu kayıtlı.
- [x] P01: Güvenli mobil dağıtım manifesti. Yedek/önizleme pakete girmez, gerekli tüm varlıklar korunur.
- [ ] P02: Sürümlü veri ve eski kayıt göçü. Kayıp/bozuk kayıt senaryoları testli.
- [x] P03: Dört kedi verisi ve sabit kimlikleri. Seçim isimlendirmeye taşınır.
- [ ] P04: Fotoroman görselleri ve açılış. Dört kedinin de sahiplenildiği görülür.
- [ ] P05: Seçim, isim ve ilk ev akışı. Kapatıp açınca doğru adımdan devam eder.
- [ ] P06: Sade mobil arayüz. Dar ekran ve güvenli alan kontrolleri tamam.
- [ ] P07: Davranış motoru ve tek kedinin tutarlı animasyon seti. Eşyaya yaklaşma/kullanma doğrulanır.
- [x] P08: Büyüme, bağ ve tercihler. Zaman/tekrar istismarı ve uzun ayrılık senaryoları testli.
- [x] P09: Eşya altyapısı ve ilk 12 ürün. Yerleştirme, kayıt ve işlev doğrulanır.
- [x] P10: Kalan 36 ürün ve atlaslar. Katalogda her ürünün gerçek katkısı var.
- [ ] P11: Günlük olaylar, arkadaş haberleri ve hatıra albümü. Aynı olay/ödül tekrarlanmaz.
- [x] P12: Günlük öneriler ve 60 başarım. Ulaşılabilirlik ve tek seferlik ödüller uygulama/veri testleriyle doğrulandı; cihaz ve ekonomi kabulü P14/P16/P17 içinde.
- [ ] P13: Patile entegrasyonu; av/yumak/bakım oyunlarının iyileştirilmesi.
- [ ] P14: Ekonomi ve isteğe bağlı reklamların dengesi. Temel bakım kilitlenmez.
- [x] P15: Dört desenin üç yaş görselleri ve geçişleri. Seçilen desen oyun boyunca korunur.
- [ ] P16: iOS cihaz doğrulaması, yaşam döngüsü, ses, bildirim ve performans.
- [ ] P17: Android projesi/adaptörleri ve gerçek cihaz doğrulaması.
- [ ] P18: Son içerik kontrolü, geri yükleme denemesi ve yayın adayının hazırlanması. Mağaza yayını ayrıca değerlendirilir.

## 13. Kontrol senaryoları

Yeni oyun; mevcut kayıt; yarım kalan seçim; isimde Türkçe karakter/HTML; uygulama kapanması; aynı gün tekrar giriş; gece yarısı ve saat değişimi; uzun ayrılık; ödül sırasında kapanma; envanter/yerleşim tutarlılığı; Patile kayıtlarının korunması; çevrimdışı başlangıç; native eklentisiz önizleme; reklam hatası; düşük bellek; küçük ekran; dokunma kaydırma çakışması. Kritik kayıt/ödül kuralları otomatik test, görsel ve cihaz hissi elle doğrulanır. Cihazda denenmeyen şey denenmiş olarak raporlanmaz.

## 14. Çalışma günlüğü

2026-10-22: Ana plan oluşturuldu. Önceki görseli kullanıcının üretmesi kuralı, kullanıcının son talimatıyla bu çalışma için değişti; görseller geliştirici tarafından üretilecek. Mevcut oyunun tamamlanmamış değişiklikleri korunacak. Yerel file URL tarayıcı erişimi önceki denemede engellendi; bu engel dolanılmayacak.

### İlk uygulama kaydı

- Yedek: `backups/patilife-before-renewal-20261022-235023.tar.gz` (347.850.042 bayt). Kaynak web klasörü, mobil betikler, iOS özel uygulama kodu ve paket yapılandırmaları içerir. `www` kaynaklardan tekrar üretilebilir; arşiv tam Xcode/Android ortam yedeği değildir.
- Yeni prototip: `sprite_preview/patilife_v2/index.html`. Üretimdeki giriş ekranına bağlanmadı.
- Yeni veri sözleşmesi: `sprite_preview/patilife_v2/model.js`. Eski kayıt ham yedekle korunur. Eski kediye desen uydurulmaz; kimlik eşleme tamamlanana kadar mevcut oyun bağlantısı gösterilir.
- İlk hikâye görseli üretildi ve incelendi: `sprite_preview/patilife_v2/assets/opening-rain.png`. Dört arkadaş ve dört farklı desenli yavru mevcut.
- Hikâye/seçim/isim/veda ve ilk ev anlatı akışı yazıldı. İlk ev eylemleri henüz sahne içi eylem değildir; ekranda açıkça yapım önizlemesi olarak belirtilir. P04/P05 tamamlanmış sayılmaz.
- Node sözdizimi kontrolü ve dört kayıt/kimlik testi geçti. Tarayıcı ve gerçek cihaz doğrulaması yapılmadı.
- Sonraki iş: dağıtım varlıklarını denetle (P01), kayıt göçü ve kimlik eşlemeyi tamamla (P02), sonra seçim görselleri ve gerçek ilk ev etkileşimlerini bağla.

### 2026-10-23 — Paketleme ve ilk ev etkileşimleri

- P01 tamamlandı: manifest tabanlı paketleyici; yalnızca izin verilen dosyalar kopyalanır. Yanlış önizleme index dosyasının oyun girişinin üzerine yazılması engellendi. `--check`, `--web-only`, ayrı boş `--output` desteklenir. Normal paketleme önceki www klasörünü backups altında korur.
- Geçici klasörde gerçek dağıtım üretildi: 310 dosya, 146.200.235 bayt. Mevcut www ve iOS paketi değiştirilmedi. Eski oyunun kaynakta mevcut tüm sabit varlık referansları manifestte bulunuyor. Kaynakta zaten olmayan 25 dekor PNG referansı eski SVG yedeğine düşmeye devam ediyor; bunlar yeni eşya üretimi sırasında ele alınacak.
- P03 tamamlandı: dört sabit kedi kartı ve seçim portreleri; isim seçilen kimliğe bağlanır. Diğer üç kedinin sahiplenildiği kaydedilir.
- P02 ilerledi: eski kayıt görünüş eşleme ekranı eklendi. Ad/cinsiyet/huy/para/ihtiyaçlar korunur; eski eşya/Patile/diğer alanlar ayrıca ham ve ayrıştırılmış olarak saklanır. Eski eşyalar yeni evde henüz çizilmez; iki sürüm arasında canlı ekonomi senkronizasyonu yok. Kayıtlar silinmez.
- P05 ilerledi: açılan çanta → su → mama → dinlenme alanı → üç hareketlik oyuncak oyunu → ilk hatıra. Artık sadece anlatı düğmeleri değil, sahnedeki bakım kontrolleri ihtiyaç değerlerini değiştiriyor. Görsel eşya sprite'ları ve kedi eylem animasyonları henüz bağlı değil; kontroller metinli. Kedi yaklaşması tek duruşun yatay geçişidir, gerçek yürüme animasyonu sayılmaz.
- P06 ilerledi: ilk ev ekranında kompakt ihtiyaç göstergeleri ve sahne içi bakım kontrolleri; dar ekran ve azaltılmış hareket CSS kuralları eklendi. Ekran görüntüsü/cihaz kontrolü yapılmadı.
- Yeni görseller: `kittens-atlas.png` (1261×1247, alfa kanallı, dört hücre CSS ile gösteriliyor); `first-home.png`. İkisi de image_gen ile üretildi, dosyaları projede, promptları görsel üretim kaydında. Yavru atlası tek duruştur, animasyon değildir.
- Doğrulama: 13 JavaScript + 2 Python testi geçti. Bunlar kayıt/kimlik/ödül kuralları, uygulama olay işleyicileriyle ilk gün akışı, oyun iptali ve mobil paketleme sınırını kapsar. Node sözdizimi kontrolleri geçti. DOM testleri sentetik test nesneleriyle çalışır; gerçek tarayıcı testi değildir.
- Önizleme: `sprite_preview/patilife_v2/index.html`. Üretimdeki oyun girişi korunuyor. Yeni bölüm henüz ana oyunun yerine geçmedi.
- Sıradaki işler: gerçek eşya sprite'ları ve etkileşim noktaları; tek kedinin animasyon seti; davranış durumları; ilk evle ana bakım akışının birleştirilmesi. P02/P04/P05/P06 henüz son kabulü almış değildir.

### 2026-10-23 — Kullanıcı düzeltmesi: çizgi film dili ve sprite animasyonu

Kullanıcı mevcut oyunun çizgi film estetiğini korumamızı açıkça istedi ve düzeltmeyi onayladı. Önceki gerçekçi görsel yön iptal edildi. Bu karar sonraki tüm görsel üretimlerin temelidir.

- Mevcut `sarman_transparan_2.png` ve `salon.jpg` gerçek görsel referans olarak incelendi.
- Sarman, tekir, smokin ve calico için aynı poz düzeninde sekizer kareli gerçek alfa atlasları üretildi. Dört bekleme/göz kırpma ve dört yürüme karesi, toplam 32 kare.
- `sprite-player.js` kaynak kare sınırlarını kullanarak ölçek ve zemin çizgisini ortaklaştırır. Eski CSS ile tek duruşu sağa/sola kaydırmanın yerine, hareket anında yürüme karelerini çizer. Sol hareket için yatay yansıtma, sahne değişiminde animasyon temizliği, azaltılmış hareket tercihi var.
- `audit_sprite_atlases.py` alfa sınırlarını analiz edip `sprite-atlases.js` üretir; bitmapleri düzenlemez. Dört atlasın gerçek şeffaflığı ve 32 dolu kare doğrulandı.
- İlk ev mevcut çizgi film salonuna döndü. Fotoroman için dört arkadaş/dört yavru içeren yeni çizgi film açılış görseli üretildi. Önceki gerçekçi üç dosya `backups/rejected-realistic-art/` içine taşındı. Yeni çalışma sürümünde referansları kalmadı.
- Ayrıntılı prompt ve dosya kaydı: `docs/PATILIFE_CIZGI_FILM_GORSELLERI.md`.
- 18 JavaScript + 2 Python testi geçti. Bunlara kare döngüleri, çizim koordinatları, hareket durumuna göre atlas satırı değiştirme, ayrılan sahnede animasyon iptali ve gerçek PNG/metaveri tutarlılığı dahil. Gerçek tarayıcı/cihaz görsel testi henüz yapılmadı; bu yüzden P07 tamamlandı olarak işaretlenmez.
- Eksik: yeme/içme/uyuma ve diğer eylem atlasları, gerçek eşya sprite'ları, davranış motorunun tamamı, büyüme ve diğer yapım adımları. Yeni animasyon sistemi yalnızca ayrı v2 geliştirme bölümündedir; eski ana oyunun sprite sistemi değiştirilmedi.

### 2026-10-23 — Bakım eylemleri, başlangıç eşyaları ve günlük yaşam

- Değişiklik öncesi v2 yedeği: `backups/patilife-v2-before-care-20261023-003359.tar.gz`.
- Dört kediye on ikişer bakım karesi eklendi: dört yeme, dört içme, dört kıvrılarak uyuma. Bekleme/yürüme dahil toplam 80 karakter karesi, sekiz karakter atlası. Kaynaklar `assets/*-kitten-care.png`. Görseller image_gen ile, önceki çizgi film atlasları referans alınarak üretildi.
- Sekiz nesnelik `starter-props.png` üretildi. Çanta, su kabı, mama kabı, yatak ve yumak yeni ev/oyun akışına çiziliyor. Kum kabı, tırmalama direği ve sığınak henüz işlevsel yeni eşya kataloğuna bağlı değil; sırf çizildiler diye tamamlanmış ürün sayılmıyor.
- Alfa denetimi eşit hücre sınırına taşan nesneleri buldu. Analiz, satırdaki şeffaf aralıklardan gerçek ayırma noktalarını çıkarıyor; belirsiz sayıda silüette hata veriyor. PNG'ler değiştirilmeden kaynak dikdörtgenleri metaveriye yazılıyor.
- Oynatıcı, yürüme → eylem → bekleme geçişinde ilgili atlası kullanıyor. Ortak zemin ve kaynak ölçeği var; hareket azaltma tercihi aktifken eylemin ilk karesi gösteriliyor.
- `care-session.js` bakım oturumunu iki aşamada yürütür: yaklaşma ve eylem. Yalnızca ikisi bittikten sonra model/kayıt güncellenir. Görünürlük değişimi/sayfadan ayrılma yarım işlemi iptal eder; yarım işlem kazanç veya ihtiyaç iyileşmesi üretmez. Tamamlanan konum kaydedilir.
- İlk evdeki kontroller gerçek nesne çizimleriyle gösteriliyor; hedeflerin yatay ve zemin konumları tanımlandı. Bu henüz bütün ev için engel algılayan yol bulma sistemi değildir. Açık çanta görselinin kapalı varyantı henüz yok; ilk adımda açık çanta illüstrasyonu kullanılıyor.
- `life.js`: ilk gün sonrasında yerel takvim gününe bağlı beş küçük dönüş olayı; olay ve arkadaş kimliği o gün için bir kez kaydedilir. Yeniden girişte olay değiştirilmez. Keşfi kaydetme +5 para ve bir hatıra verir; ikinci talep reddedilir. Olaylar şu an metinle anlatılır; evde ayrı olay animasyonu yok.
- Günlük üç öneri: su tazeleme, sakin yakınlık ve kısa oyuncak oyunu. Tamamlanan gerçek eylemler işaretler; her öneri +6 para, bir kez. Besleme tekrarına dayalı hedef yok. Arkadaş haberi kurgu oyun verisidir; dış mesajlaşma yapılmaz.
- Hatıralar ekranında ilk gün ve toplanan günlük keşifler tarihle okunur.
- Dönüşte ve tamamlanan eylemlerde geçen süre ihtiyaçlara uygulanır. Uzun ayrılıkta en fazla 12 saat işlenir; temel ihtiyaçlar 20'nin altına düşürülmez, para cezası yoktur. Geri giden saat enerji kazancı üretmez. Sürekli çalışan bir gerçek zamanlı ihtiyaç zamanlayıcısı henüz yok.
- Doğrulama: 34 JavaScript + 2 Python testi geçti. Bakım bitişi, iptal, arka plan, ilk gün uçtan uca olay işleyicileri, günlük olay/ödül kalıcılığı, saat geri gitmesi, uzun ayrılık ve 80 kare/8 eşya kaynak kontrolü dahil. Gerçek tarayıcı/cihaz görsel kontrolü yapılmadı.
- Geliştirici animasyon kontrolü: `sprite_preview/animation_lab_v2.html`. Dört kedinin beş hareketini ve sekiz eşyayı karşılaştırır; mobil pakete dahil edilmez.
- Görsel promptları ve dosyalar: `docs/PATILIFE_BAKIM_GORSELLERI.md`.
- P05/P07 ilerledi; P11/P12'nin ilk günlük yaşam/öneri bölümü uygulandı. Bu başlıklar tüm kapsam ve görsel/cihaz kabulü tamamlanmadığı için kapatılmadı.
- Sıradaki bağımlılıklar: davranış motorunu tamamlamak; büyüme ve yaşlara uygun görseller; işlevsel envanter/yerleştirme ve 48 ürün; uzun vadeli başarımlar; Patile ve ana mobil akışın birleşimi.

### 2026-10-23 — Büyüme, bağ ve işlevsel 48 eşya

- Değişiklik öncesi yedek: `backups/patilife-v2-before-growth-20261023-010105.tar.gz`.
- Büyüme kuralları `growth.js`: gençlik için en az 3 gün, 3 aktif takvim günü ve 24 bağ; yetişkinlik için en az 14 gün, 7 aktif gün ve 80 bağ. Yetişkinlikten önce gençlikte en az bir gün geçirilir. Eşikler sağlandığında evde bildirim ve Kedim panelinde geçiş düğmesi görünür. Geçiş açıkça uygulanır, bir kez hatıra oluşturur; uzun ayrılık iki dönemi atlatmaz.
- Bağ aşamaları ve gerçek kullanım sonrası keşfedilen eşya tercihleri Kedim panelinde gösterilir. Her eylemin bağ katkısı mevcut günlük sınırdan geçer.
- Dört kedinin genç ve yetişkin sürümleri ayrı oranlarla çizildi; yalnızca ölçekleme yapılmadı. Sekiz yeni atlasın her biri 20 kare (bekleme/yürüme/yeme/içme/uyuma). Yavru atlasları dahil 240 karakter karesi. Seçilen desen, isim ve kişilik korunur. Canvas oynatıcı yaşa uygun atlası seçer. Aynı PNG'deki farklı eylem satırlarında azaltılmış hareketin yanlış pozu tutmasına neden olan çizim önbelleği hatası giderildi.
- `catalog.json` içinde sekiz grupta 48 ürün. Yeni 40 ürün üç şeffaf atlas (16+16+8), başlangıç sekiz ürünle tamamı çizilebilir. Her ürünün fiyatı, uygun odaları, açılma aşaması, yerleşim alanı ve kullanım etkisi var. Altı temel eşya ücretsiz başlangıç envanteridir; diğerleri bir kez satın alınır.
- `inventory.js`: satın alma, yetersiz para/yaş denetimi, sahiplik, uygun oda, üst üste koyma denetimi, envantere kaldırma ve kullanım. Odada en fazla altı eşya. Tekrar satın alma ikinci ücret kesmez. Eşyalar sürüklenerek taşınır; başarısız yerleşim eski konumu korur. Bu, zemin yerleşim alanı denetimidir; tam piksel çarpışma veya kedi yol bulma sistemi değildir.
- Salon, mutfak, yatak odası, banyo ve bahçe mevcut çizgi film arka planlarıyla erişilebilir. İlk gün tek odadaki eğitim yerleşimini korur; sonrasında kayıtlı oda yerleşimleri kullanılır. İlk envanter düzeni temel mama/suyu mutfağa, yatağı salona, kum alanını banyoya ayırır. Eski sürümün eşyaları hâlâ legacy verisinde korunur; 48 yeni kimliğe otomatik eşlenmez.
- Eşyalar kullanıldığında bakım/oyun katkısı verir. Üç tamamlanmış kullanım sonrası o eylem için ilk sevilen eşya keşfedilir. Tekrarlama beklemesi ve günlük bağ sınırı korunur. Hatıra kutusu ve fotoğraf panosu albümü açar.
- Zamanlı mama kabı yerleştirilmişken günde bir kez düşük tokluğu 55'e tamamlar; manuel bakım görevi/bağ ödülü üretmez. Su pınarı susuzluk azalma hızını, kum paspası ve mahremiyetli kumluk temizlik azalma hızını, perde/ışık mutluluk azalma hızını etkiler. Aynı tür pasif katkılar üst üste çarpılmaz; en güçlü değer kullanılır. Oyuncak sepeti yalnızca yerleştirildiğinde oyun enerji maliyetini iki azaltır.
- Özel tırmalama/tırmanma/saklanma animasyonları henüz yok: bu etkileşimler mevcut bekleme/keşif duruşuyla ve durum metniyle gösterilir. Bu sınırlama nedeniyle P07 hâlâ açıktır.
- P08/P09/P10/P15 uygulama ve veri denetimi açısından tamamlandı olarak işaretlendi. Bunlar yayın veya gerçek cihaz görsel onayı değildir. Büyüme süreleri ve eşya ekonomisi oyuncu testiyle ayrıca dengelenecek.
- Geliştirici animasyon kontrolü (`animation_lab_v2.html`) üç yaşın beş hareketini ve 48 eşyayı gösterecek şekilde güncellendi; mobil dağıtıma girmez.
- Doğrulama: 50 JavaScript + 2 Python testi geçti. Büyüme gereksinimleri, uzun ayrılık, ardışık geçiş engeli, satın alma/oda/yerleşim/kullanım ve sürükleme olay akışı, tercih keşfi, otomatik besleme ve pasif katkılar, 240 karakter karesi ve 48 eşyanın kaynak sınırları kapsanır. Gerçek tarayıcı veya cihazda görsel test yapılmadı.
- Görsel promptları, referanslar ve dosyalar: `docs/PATILIFE_BUYUME_ESYA_GORSELLERI.md`. Araç built-in image_gen; Python yalnızca alfa analizi ve metaveri için kullanıldı. Uzun eşyaların satır sınırında kesilmemesi için bağımsız bağlı silüetler okunur; bitmapler değiştirilmez.
- Sonraki işler: tam davranış motoru ve yol bulma; uzun vadeli başarımlar; Patile/ana mobil akışla birleştirme; görsel/cihaz performansı ve ekonomi kabulü.


### 2026-10-23 — Evde davranış, yol bulma ve 60 uzun vadeli başarım

- Değişiklik öncesi yedek: `backups/patilife-v2-before-behavior-20261023.tar.gz` (v2, scripts, tests, docs). Ana oyun ve mevcut www dağıtımı değiştirilmedi.
- `behavior.js`: oda içindeki zemin eşyalarının genişlik/derinlik alanlarından görünürlük grafiği çıkarıp en kısa erişilebilir güzergâhı bulur. Kontrol yalnızca hedef noktaya değil bütün yol parçalarına uygulanır. Duvar eşyaları zemin engeli sayılmaz; başka odanın eşyası yolu kapatmaz. Kullanılan eşyanın alanına yaklaşılabilir; yatağında duran kedi o alandan çıkabilir. Yürünebilir zemin x=8–92, y=8–58; bu normalize alan denetimidir, görselin her pikseliyle fizik simülasyonu değildir.
- Bakım yaklaşması ve oyuncak takibi yeni güzergâhları kullanır. Tamamen kapalı yolda işlem başlamaz ve açıklama gösterilir. Eğitimdeki sabit ilk ev yerleşimi kendi tanımlı yaklaşma noktalarını korur. Yol uzunluğu hareket süresini belirler. Oyuncak oyununun son hareketi bitmeden ödül yazılmaz.
- Hareket oturumu ara noktalarda ilerler. İptalde geçen süreye göre aradaki konumu hesaplar; kalan yol ve eski zamanlayıcı iptal edilir. Kullanıcı bakıma başlayınca otomatik hareket bırakılır; bakım sırasında ikinci işlem başlamaz. Sahne/oda değişimi ve uygulamanın arka plana geçmesi bekleyen otomatik hareketleri durdurur. Geri dönüldüğünde yeni sahne oturumu başlar.
- Ev açıkken 7–12 saniyelik aralıklarla erişilebilir küçük davranış seçilir: cana yakın kedi oyuncuya yaklaşmaya, temkinli kedi güvenli köşeye, meraklı kedi keşif/gözlem alanlarına, oyuncu kedi oyuncaklarına daha çok yönelir. Düşük enerji dinlenme seçimini artırır. Miras kalan uykucu/enerjik karakterler için de ağırlıklar var. Bunlar çizgi film yürüyüşü, bekleme ve uyku atlaslarını kullanır. Kendiliğinden dolaşma ihtiyaç, bağ, para, günlük görev veya başarım ilerlemesi yazmaz.
- `achievements.js`: 12 dostluk, 9 ilkler/büyüme, 12 keşif, 12 ev/tercih, 9 birlikte oyun, 6 uzun vadeli yaşam hedefi; toplam 60 benzersiz hedef. Kedim panelinde kategori filtresi, ilerleme ve tek seferlik ödül kontrolleri var. Son rutin hedefi 180 ayrı aktif gün; ardışıklık şartı ve gün kaçırma cezası yok.
- Tamamlanmış eylem sayıları, eylem yapılan farklı günler, kullanılmış odalar ve oyun oynanmış yaşlar kalıcı istatistiklere yazılır. Yarım bakım ve iptal edilmiş oyun sayılmaz. Yerleştirilmiş eşyanın gerçek kullanımı odasını kaydeder; günlük olaylar yalnızca keşif kaydedildiğinde hedefe sayılır. Eski sürümde tutulmamış sayaçlara geçmiş değer uydurulmaz; legacy verisi korunur. Bozuk sayaçlar veya yinelenmiş ödül kimlikleri sessizce sıfırlanmaz.
- Birlikte oyun başarımları şu an v2 oyuncak takibiyle ilerler. Patile'nin skor ve ödül köprüsü hâlâ P13 kapsamındadır; bağlanmış gibi gösterilmez.
- Doğrulama: 65 JavaScript + 2 Python testi geçti (67 toplam). Yolun bütün parçalarında engel denetimi, tamamen kapanmış geçit, yataktan çıkış, kişilik ağırlıkları, hareket kesintisi, otomatik davranışta kazanç olmaması, tekrar ödül talebi ve bozuk sayaçlar dahil. Tamamlanan bakım/oyun, gerçek eşya satın alma-yerleştirme-kullanma, büyüme ve günlük keşif kurallarıyla 180 günlük simülasyonda 60 hedefin tamamı ulaşılabilir bulundu. Simülasyonda eşya edinimi için yüksek başlangıç bütçesi kullanıldı; bu ekonomi dengesi veya oyuncu testi değildir.
- P12 uygulama/veri açısından kapatıldı. P07 özel koklama, tırmanma, tırmalama, temizlenme ve sevilme tepkisi atlasları ile gerçek sahne kabulü beklediği için açık. Tarayıcı/gerçek cihaz görsel testi yapılmadı; DOM testleri sentetik ortamda çalışır.
- Sonraki bağımlılıklar: Patile'yi yeni kayıt/ekonomiye güvenli biçimde bağlama (suika_game/index.html ayrı eski oyundur; gerçek Patile ana HTML içinde gömülüdür), fotoromanı ayrı panellere tamamlama, özel hareketler, ana giriş entegrasyonu ve mobil cihaz/performans/ekonomi kabulü.


### 2026-10-23 — Kullanıcı düzeltmesi: tam ekran mobil oyun arayüzü

- Kullanıcı yeni sürümün mobil oyun görünümünden uzaklaştığını belirtti. Metin ağırlıklı, aşağı uzayan ana ekran terk edildi; bundan sonraki arayüz çalışmaları oda/kedi merkezli tek oyun ekranını koruyacak.
- Önceki sürümün yedeği: `backups/patilife-v2-before-mobile-ui-20261023.tar.gz`.
- `mobile-ui.css` ile ana oyun alanı dinamik ekran yüksekliğini doldurur. Üstte küçük profil, birikim ve beş ihtiyaç göstergesi; altta sabit Bakım/Oyun/Ev/Günlük menüsü var. Kedim profili üstteki kedi kartından, hatıralar profil içinden açılır. Büyük sayfa başlıkları ve ana ekrandaki uzun ilerleme listeleri kaldırıldı.
- Mağaza, günlük, profil, başarımlar ve bakım kontrolleri oda üzerinde alttan açılan panelde. Yalnızca panel içeriği kayar. Panel açıkken oda kontrolleri inert olur; odak panelde kalır, Kapat/arka alan/Escape ile dönülür. İlk gün rehberi oyun alanının üzerinde kısa bir karttır. Mevcut çizgi film arka planları, kedi atlasları ve eşya görselleri korunur; emoji eklenmedi.
- Bakım menüsünden mama/su/uyku/temizlik seçilince mevcut eşyanın odasına gidilir, panel kapanır ve yaklaşma/eylem başlar. Eksik eşya seçeneği devre dışıdır. Oyun menüsündeki oyuncak takibi de panel kapandıktan sonra oda üzerinde çalışır.
- Ev düzenlemesine geçince panel çekilir; sürükleme alanı açık kalır. Düzenlemeyi bitir kontrolü mağazayı geri açar. Sahnedeki eşya isimleri sürekli etiket kalabalığı yaratmaz; eğitimde etkin nesne, düzenlemede veya odaklanmada görünür.
- Güvenli alan, dar/kısa ekran, dokunma hedefleri ve azaltılmış hareket CSS kuralları eklendi. Masaüstünde yine dikey oyun alanı korunur; geniş bir yönetim sayfasına dönüşmez.
- 68 JavaScript + 2 Python testi (70 toplam) geçti. Yeni kontroller bakım panelinden doğru odaya geçiş ve gecikmeli kazanç, düzenleme sırasında panelin kapanması/geri gelmesi ve panelin oda etkileşimlerini yalıtıp Escape ile kapanmasını kapsar. Mobil manifest 341 dosyayı doğruladı. Bunlar sentetik DOM/veri testleridir; tarayıcı ve gerçek cihazda yerleşim/görsel kabulü henüz yapılmadı. P06 bu nedenle açık kalır.


### 2026-10-23 — Kullanıcı düzeltmesi: ilk oynanış sistemi temel alındı

- Kullanıcı yalnızca konum düzeltmesi değil, kendi ilk oyununun oynanışını temel almamızı açıkça istedi. Yeni bir kamera/zemin sistemi üretme işi durduruldu. O an yalnızca kaynak incelemesi yapılmıştı; alternatif kamera kodu projeye eklenmedi.
- Önceki kaynakların yedeği: `backups/patilife-before-classic-return-20261023.tar.gz`.
- V2 girişinde sahiplenmesi/ilk günü tamamlanmış oyuncu `../patilife_app.html` sayfasına yönlenir. Yeni oyuncunun hikâye, seçim ve isim akışı korunur. Ana ev artık ilk sürümün ekranıdır; v2'nin durum yazısı bandı ve yeni alt çekmece düzeni ana oynanışta gösterilmez.
- Ana HTML'e yalnızca üç script, çizim kancası ve başlangıç kancası eklendi. Yedekle otomatik karşılaştırma bunlar çıkarıldığında dosyanın bütünüyle aynı olduğunu doğruladı. İlk sürümün 2200 birim panoraması, oda mapping'i/poligonları, kamera sürüklemesi ve kenardan oda geçişi, yürüme/zıplama/otonom gezinme, bakım butonları, av/yumak/kum temizliği/Patile uygulamaları korunur. Bu, eski kodun korunma doğrulamasıdır; tarayıcıda canlı oynama testi değildir.
- `classic-bridge.js` seçilen desen ve yaşın atlasından eski `catActor` canvas'ına çizer. Eski motorun x/y, yön, derinlik ölçeği ve yüzey konumu korunur. Bekleme, yürüme, yeme, içme ve uyku kareleri bağlıdır. Diğer özel durumlarda aynı kedinin bekleme pozu kullanılır; zıplama/av/tırmalama/banyo için yeni özel atlaslar henüz yoktur. Mevcut hareket/mekanik çalışması, yeni özel animasyon setinin tamamlandığı anlamına gelmez.
- Kimlik geçişi bir kez yapılır. Mevcut ana oyun parası, istatistikleri, eşya kaydı ve Patile tahtası korunur. Ana oyun kaydı yoksa v2 adı/kimliği/ihtiyaçları ve parası başlangıç olarak alınır. Etkilenen eski localStorage değerleri işlemden önce ham olarak `patilife_before_classic_return_v1` altında yedeklenir. Kısmi yazma hatasında geri alma denenir; ham yedek korunur. Daha sonraki ana oyun kazançları v2'deki eski değerlerle ezilmez. V2 kaydı silinmez ve canlı ekonomi köprüsü varmış gibi değiştirilmez.
- Yeni modüller kaybedilmedi; 48 eşya, büyüme ve 60 başarımın ana motorla birleşmesi sonraki entegrasyon işidir. Bu alanlardaki eski v2 uygulama testleri çekirdek kurallar için korunur; aktif ana oyunda var olduklarını kanıtlamaz.
- Sıradaki iş: ilk motor üzerindeki gerçek ekran/mapping denetimi; ardından yeni kedi için özel eylem atlasları ve mevcut profile bağlı büyüme. Yeni özellikler her seferinde ilk oynanışın butonları, odaları ve mini oyunları korunarak eklenir.

- Bu aşamanın doğrulaması: 76 JavaScript + 2 Python testi (78 toplam) geçti. Yeni testler kimlik/birikim aktarımının bir kez yapılmasını, mevcut Patile/dekor kaydının değişmemesini, kısmi yazma hatasında geri almayı, atlasın desen/yaş/eylem seçimini, eski mapping zeminine çizimi ve tarayıcı giriş yönlendirmesini kapsar. Ana HTML içindeki scriptler Node sözdizimi kontrolünden geçti. 342 dosyalık geçici mobil paket üretildi; ana giriş ile yeni köprü varlıkları doğrulandı. Mevcut www ve iOS paketi değiştirilmedi. Gerçek tarayıcı/cihaz oynanış ve görsel kontrolü yapılmadı.


### 2026-10-23 — Sevme, zıplama, tırmalama ve hareket/kadraj düzeltmeleri

- Kullanıcı eksik sevme/zıplama/tırmalama animasyonlarını, zemine tıklamada ve otonom hareketlerde oturur pozda yer değiştirmeyi ve su içme sprite'ının kesilmesini bildirdi. Hepsi aynı çalışma kapsamında ele alındı.
- Yedek: `backups/patilife-before-special-animations-20261023.tar.gz`.
- Dört kedi × üç yaş × üç yeni hareket × dört kare = 144 özel hareket karesi. Üç 48'lik atlas ve renk kimliği kaymış üç sevme grubu için ayrı 12 karelik düzeltme. Kullanılan toplam 144, düzeltmeler aynı karelerin yerini alır. Mevcut 240 temel/bakım karesiyle toplam 384 kedi karesi. Artık sevme, zıplama ve tırmalama bekleme pozuna düşmez. `classic-bridge.js` mevcut happy/jump/scratch durumlarını uygun desene ve yaşa bağlar. Jump/pounce/jump_joy aynı zıplama grubunu kullanır. Banyo/dans/yumak özel tepkileri gibi diğer eksik pozlar hâlâ ayrıca hazırlanacak.
- Zıplama kareleri mevcut parabolün ilerlemesine bağlandı. Sevme, gözleri kapama ve başı yana yatırma/çeneyi kaldırma hareketi; tırmalama, arka patiler üzerinde ön patileri uzatma/çekme hareketidir. Direk görseli atlas içine gömülmez; odadaki nesne kullanılır. Aynı kediyi tekrar sevince animasyonun zamanı yenilenir.
- Gerçek yönlendirme hatası: `findPolygonAt` her seferinde yeni kopya döndürürken `navigateTo` nesne eşitliğiyle yüzey karşılaştırıyordu. Aynı zemin farklı yüzey sanılıyordu. Sabit `surfaceId` eklendi; zemin içindeki derinlik farkları ve aynı platform içi hareketler yürüyüştür. Yalnızca farklı yüksek yüzeye geçişte zıplanır. Uzak yüksek yüzeyden ayrılırken önce yere inilir, sonra yürünür; havada uzun yaklaşma yürüyüşü yapılmaz. Otonom hedef mevcut yüksek yüzeyin dışına taşıyorsa hedef zemin olur.
- Yeni yürüyüş önceki zıplama callback'ini iptal eder, ilk yürüme karesini hemen çizer. Hareket güncellemesi yürüyüş pozunu korur, varışta beklemeye döner. Eski sevme zamanlayıcısı devam eden yürüyüş/zıplamayı oturmaya çeviremez; yeni sevme oturumunu eski oturum bitirmez. Bakım/uyku/av sırasında sevme başka eylemi bozmaz. AI iki saniyelik sevme tepkisini kesmez.
- Su içmenin kesilme nedeni: bakım atlasının ölçek birimi bazı yatay karelerin genişliğinden küçüktü. Klasik çizici artık aynı atlasın en büyük kare boyutunu da hesaba katar. Paylaşılan çizicide de hedef canvas'ın genişlik/yüksekliği ile güvenli ölçek sınırı var. Kaynak kareler tam alınır; bitmape kırpma işlemi yapılmadı. Tüm desen/yaşlarda bakım ve özel karelerin çizim sınırları test edildi.
- Görsellerin tam promptları, referansları, üretim aracı ve kaynak yolları `docs/PATILIFE_OZEL_ANIMASYON_GORSELLERI.md` içinde. Python yalnızca alfa incelemesi/metaveri için kullanıldı.
- Doğrulama: 85 JavaScript + 2 Python testi (87 toplam) geçti. İlk motorun gerçek yönlendirme/yürüme fonksiyonlarıyla zemin, platform, yüksek yüzeyden inme, eski zıplamayı iptal ve yürüyüş pozu testleri; tüm 12 desen/yaş birleşiminde çizim alanına sığma; 144 özel karenin varlığı, PNG ve koordinat denetimi dahil. Bunlar canlı tarayıcı/cihaz görsel kabulü değildir.

- Son paket kontrolü: 346 dosya, 166.0 MiB; dört yeni PNG ve güncel metadata geçici pakette doğrulandı. Ana HTML scriptleri Node sözdizimi kontrolünden geçti. `animation_lab_v2.html` sevme/zıplama/tırmalama seçenekleriyle güncellendi; geliştirme sayfası mobil pakete dahil değildir. Mevcut www ve iOS dağıtımı değiştirilmedi.

### 2026-10-23 — Ana oyunda bakım, eşya ve yaşam entegrasyonu

- Çalışma öncesi yedek: `backups/patilife-before-main-integration-20261023.tar.gz`. Mobil web dağıtımı yenilenmeden önceki www ayrıca `backups/www-before-build-c9eyeu7c/www` içinde korundu. Kullanıcının tarayıcı localStorage verisine doğrudan erişilmedi.
- `classic-life.js` yeni modülleri mevcut GameState, kayıt, mağaza ve bakım butonlarına bağlar. Ana kayıt artık `lifeV2` ilerlemesini de saklar. Eski para/ihtiyaçlar işlem sırasında iki kere artırılmaz. Günlük görev düğmesi yeni Günlük panelini açar; profil üzerinden bağ, üç yaşın şartlı geçişi, albüm, hikâye özeti ve 60 başarım erişilir. O günkü olay yenilemeyle değişmez, ödüller bir kere alınır. Yeni yaşam kaydı olan oyuncuda eski rastgele masraf cezası çalıştırılmaz.
- Yeni kayıtta hikâye–dört kedi–isim–ilk gün akışı artık ana girişten açılır. Eski kayıt silinmez; kimliği eksik eski oyuncu yalnızca görünüşünü tamamlar. Bu oyuncu hikâye özetini profilden açabilir. Açılışta üç metin adımı aynı mevcut açılış çizimini kullanır; ayrı ayrı çizilmiş yeni fotoroman panelleri tamamlanmış değildir.
- Mevcut yüksek yüzeyin poligonu kenarda bulunamasa da yükseklikten zemine geçiş zıplayarak iner. Bakım ve oda çıkışlarının doğrudan `walkTo` çağrıları da bu korumadan geçer. Tırmalama eski didPanMove bayrağıyla bloke olmaz. Gerçek ekran mapping kabulü henüz yoktur.
- Dört desen × üç yaş için 48 temizlenme karesi eklendi. Banyo durumunda oynar. Yeni kedi atlaslarında toplam 432 kullanılan kare var. Yumak pati hareketi ve lazer atlayışı mevcut özel grupları paylaşır; özgün yumak/lazer atlasları varmış gibi sayılmadı.
- Yeni 48 cozy eşya mevcut dükkânda atlas PNG'leriyle görünür. Kısa dokunuş etkileşim, basılı tutma düzenleme içindir. Aynı eşyanın sınırsız kopyası çıkarılmaz; yanlış odaya envanterden yerleştirme reddedilir. Yeni yerde duran eşyalar sürüklemede 15–110 taban bandında, duvar eşyaları 200–490 bandında kalır. Eski yerleşimler korunur. Dinlenme, temizlik, tırmalama, gözlem ve oyun etkileri ortak kuralları uygular; kullanım ve tercihler kaydedilir. Mama/su eşyası ürün seçimini açar; satın alımdan sonra kedi seçilen eşyanın konumuna yaklaşır. Mama dolma/boşalma çizimi hâlâ eski ana kabın görsel sistemidir; bütün yeni kaplara özgü doluluk kareleri yoktur.
- Mama ürünleri: 8/18/35/150 altın; +60/+85/+100/+100 tokluk; 6/12/24/120 saatlik tüketim ayarı; seviye 1/3/5/7. Otomatik yemleme 5 günle sınırlı. Su: 0/8/20 altın, 4/8/16 saatlik tüketim ayarı, seviye 1/2/4. Ürün seviye/para ve meşgullük koşulları işlem fonksiyonunda da denetlenir. İhtiyaç kazancı yeme/içme sonunda olur. Ürünler şimdilik anlık servis satın alımıdır, ayrı stok deposu yoktur.
- Salonda ve bahçede temel su erişimi var. Eşyaların susuzluk/temizlik/keyif tüketimi, dinlenme hızı, oyuncak enerji iadesi gibi pasifleri ana sisteme bağlandı; aynı tür etki sınırsız üst üste eklenmez. Günlük otomatik mama etkisi kayıtlı günde bir uygulanır.
- Lazer avında bedava enerji yükleme kaldırıldı; başlangıçta 20 enerji gerekir. Normal takip yürür, atlayış özel pozla ilerler, yön ve ekran genişliği sınırı düzeltildi. Tamamlanan ve yakalama yapılan av oturumu bağ/günlük oyun ilerlemesini kaydeder. Yumak çizimi mevcut oyuncak atlasından gelir; 30 saniyede en az üç pati teması tamamlanmış oyun sayılır; enerji maliyeti ve ilerleme oturum sonunda uygulanır. Bakım/lazer/yumak aynı anda başlatılamaz. Yüksekte başlayan oyuncak oyununda önce zemine inilir.
- Yalnız yeni yaşam kaydı olan yeni evlerde bahçe 24 bağ veya gençlikte açılır. Diğer odalar açık kalır; eski oyuncunun oda erişimi geri alınmaz. Kısa konuşmaların genişliği ve kamera içindeki yatay konumu sınırlandı.
- 96 JavaScript + 2 Python testi (98 toplam) geçti. Yeni kontroller ana kayıt/günlük/bağ bağlantısını, 48 öğenin kurulmasını, profil panellerini, tek seferlik günlük ödülü, eşya bakım etkisini, eski para korumasını, yüksekten doğrudan yürüyüş çağrısını, ürün seviyesi/kazanç zamanı/ücret/süre ve seçilen kabın konumunu kapsar. 15 inline script sözdizimi kontrolünden geçti. 351 dosya / 170.2 MiB web paketi www içine üretildi. Native iOS senkronizasyonu, Android derlemesi ve gerçek cihaz/tarayıcı oynanış-görsel kabulü yapılmadı.
- Açık işler: ayrı fotoroman sahnelerinin görselleri; eşyalara özgü tam otonom keşif ve çarpışma güzergâhları; her kap için doluluk animasyonları; lazer/yumak için ayrı kapsamlı hareket atlasları; kısa/dar ekran ve bütün oda mapping'lerinin gerçek oynanış kabulü. Bu nedenle bütün yol haritası bitmiş olarak işaretlenmez.

### 2026-10-23 — Salon sebili ve cozy başarım koleksiyonu

- Kullanıcının iki ekran görseline göre salondaki sebil kanepe/tırmalama ağacı önünden pencere önü bank ve saksı yanındaki boş zemine alındı: x=520, bottom=24. Bahçenin mevcut x=1320, bottom=88 konumu ayrı tutuldu. Sahne yerleşimi ile su içmeye yaklaşma aynı oda bazlı mapping'den okunur; salonda kedi x=375, bottom=28 hedefine yürür.
- Başarımlar için eski HTML details/summary ve tek sütun büyük sayı düğmeleri kaldırıldı. İki sütunlu, sayfa başına dört kartlık koleksiyon; altı yatay kategori sekmesi; mevcut cozy eşya atlaslarından küçük çizimler; ilerleme göstergeleri; ayrı altın ödülü düğmesi ve albümde durumu var. Yeni simge veya emoji üretilmedi. Kategori sayfaları arasında ve ödül alınca ilerleme korunur; ödül bir kez alınır.
- Panel başlığı ve Kapat üstte, dört ana sekme küçük bir bölümde. Kartlarda sıcak kâğıt tonları, toplananlarda adaçayı yeşili, alınabilir ödüllerde bal rengi kullanılır. Klavye odağı görünür sıcak bir çerçeveyle korunur; native mavi summary görünümü yoktur.
- Önceki kaynaklar: `backups/patilife-before-fountain-achievements-20261023.tar.gz`.
- 96 JavaScript + 2 Python kontrolü geçti. Mevcut entegrasyon testi yeni dört kartlık sayfalama ve ödül alımını, bakım testi salonun yeni içme noktasını ve bahçenin korunmasını kapsar. Ana HTML sözdizimi geçerli; www web paketi güncellendi. Canlı tarayıcı/telefon görsel kabulü yapılmadı.

### 2026-10-23 — Çizgi roman, gerçek ilk gün, ortak cozy paneller ve bölüm yükleme

- Kullanıcının ekran ekran aynı arayüz sorununu bildirmek zorunda kalmaması için Kedim/Günlük/Albüm birlikte ele alındı: resimli bağ notu ve büyüme yolu, olay kartpostalı/görev kartları ve fotoğraf tarzı anılar. Üst panel gerçek kedi/desen/yaş, bağ ve anlaşılır ihtiyaç yüzdelerine dönüştü. İki yan menü sağdan açılıp kapanan, durumunu saklayan Bakım/Oyun çekmeceleridir.
- Altı farklı çizgi roman paneli ve üç yeni panoramik oda görseli üretildi. Yeni sahiplenme ana motora devreder. Ana evde yedi adımlık ilk gün rehberi gerçek bakım kayıtlarını bekler, uyuyan kediyi bölmez, kaldığı yerden sürer ve ilk gün anısını bir kez oluşturur. Eski oyuncunun kaydı hikâye için sıfırlanmaz; profilden hikâye ve rehber açılır.
- Kış bahçesi, oyun tavanı ve okuma odası belirli alınmış başarımlarla açılır. İlk girişte hikâyesi ve albüm anısı var; normal kamera, zemin mapping ve eşya yerleştirme bu odalarda da çalışır. Uygun katalog eşyaları genişletildi; işlem seviyesinde kilit kontrolü var.
- Patile sayfası ve motoru ayrıldı. Hafif bölümler sırayla boş zamanda hazırlanır; fizik ve DOM ihtiyaçta başlar. Çıkışta fizik/parçacık RAF iptali, tekrar girişte tek motor, gizli ev sahnesini durdurma, eski sprite'ları toplu yüklememe, aktif oda bitmapi ve ihtiyaçta doku yükleme bağlandı. Ortak native hizmetler ayrı tutuldu; bulut kaydı modern ilerlemeyi kapsar.
- 104 JavaScript + 2 Python kontrolü geçti. Gerçek Matter ile motorun bir kez kurulması, üç başlangıç dokusu ve durdurma/devam; gerçek bakım kayıtlarıyla öğretim ve uyku bekleme; oda/eşya kilidi; tek seferlik anı; çekmece erişimi; tam kayıt taşıma kontrolleri dahil. Bu, gerçek cihaz FPS veya canlı görsel kabul değildir. 365 dosya / 175.0 MiB web paketi www içine üretildi; iOS senkronizasyonu/Android derlemesi yapılmadı.
- Tam akış, modül dosyaları, sınırlar ve görsellerin tam prompt/kaynakları: `docs/PATILIFE_BOLUMLER_VE_PERFORMANS.md`. Yedek: `backups/patilife-before-chapters-20261023.tar.gz`.
- Önceki günlükte açık sayılan ayrı çizgi roman kareleri ve yeni hikâyeli oda uygulaması bu çalışma ile eklendi. Açık kalan görsel kabul, her eski/new oda mapping'inin telefonda denenmesi, kaplara özgü doluluk kareleri ve geniş otonom eşya/çarpışma davranışları tamamlandı olarak işaretlenmez.

### 2026-10-23 — Son arayüz geri bildirimleri

Bildirimler üst barın altına taşındı; yeni odalara aynı ölçüde pastel atlas ikonları eklendi. Bakım solda, oyun sağda açılır. Alınabilir ödüller yeşil ve hareket tercihini dikkate alan animasyonla gösterilir; Günlük, Başarımlar ve kategori sekmeleri kalan ödül sayısını gösterir. 106 JavaScript + 2 Python kontrolü geçti. Görsel kaynakları, tam prompt ve sınırlar: `docs/PATILIFE_ODALAR_VE_ODULLER.md`.

### 2026-10-23 — Günlere yayılan başarımlar, gerçek envanter, gelişen ve dolan kaplar

- Başarım eşikleri farklı aktif gün koşullarıyla kademelendi; yeni kayıtta sahiplenme dışında hazır başarım çıkmaz. Hazır ödüller Tümü ve kategori listelerinde öne taşınır. Modern kayıt için eski anlık başarım bildirimi motoru kapatıldı; alınmış ödüller korundu.
- Satın alma kalıcı envantere yazıyor; Yerleştir/Taşı oda soruyor, uygun açık odaya geçirip tek nesneyi düzenlemeye açıyor. Ev/Envanter erişimi oyun rayından ayrıldı. Başlangıç kapları da taşınabilir, dokunarak kullanılan nesnelere dönüştü.
- Beş mama ve beş su kabının her biri boş/yarım/dolu karelere sahip. İki 15 karelik atlas, sabit çizim kutusu ve taban, kap başına saklanan içerik/zaman ve beş aşamalı başarım gelişimi bağlandı. Su başlangıç yerleşimi salonun saksılara yakın arka zemininde. Temizlik metni ve davranışı eşleştirildi.
- Bildirim ile kulakçıklar ayrı ölçülen satırlara alındı. Boşta kamera takibi ve lazerde basılı hassas nişan/halka, sıralı dalga sistemi ve tamamlanan seanslarla zorluk artışı eklendi.
- 117 JavaScript + 2 Python testi geçti. Gerçek dükkan/oda seçimi ve av yöneticisi de testlere dahil. Telefon görsel kabulü/FPS ölçümü yapılmadı.
- Ayrıntılar, görsel kaynakları ve tam üretim promptları: `docs/PATILIFE_ENVANTER_VE_KAP_GELISIMI.md`. Yeni üç mini oyun ve ödül önerileri: `docs/PATILIFE_MINI_OYUN_FIKIRLERI.md`; bu fikirler henüz uygulanmadı.

### 2026-10-23 — Kapların kedinin altında kaybolması ve temas düzeltmesi

Ön/arka kap katmanları, kediye ve kap aşamasına göre ağız temas noktası, su halkası/mama kırıntısı, ayrı içme sesi ve işlem sonu geri yürüyüş eklendi. Kap yerinden taşınmıyor. Gerçek zemin derinliği yanlış platform atlaması sayılmıyor. 119 JavaScript + 2 Python testi geçti; 360 bakım hizası kombinasyonu dahil. Ayrıntı ve sınırlar `docs/PATILIFE_ENVANTER_VE_KAP_GELISIMI.md` içinde.

### Devam eden paket — 23 Ekim 2026 kullanıcı geri bildirimleri

Yeni istekler önceki işleri iptal etmez. Sıra: taşan düzenleme çubuğu ve taşınabilir minder; ortak modal dili ve ihtiyaç barı hizası; gerçek yüzey temas çizgileri; kenara yapışık ikonlu dikey Bakım/Oyun etiketleri; taşınabilir ve gelişen kum kabı/tuvalet animasyonları; sınırlı otomatik stok ve dolum; oyun içi sağlık/mama dengesi; odaya özgü etkileşimli eşyalar ve hareket kareleri. Bu satır bir bitiş kaydı değildir; her bölüm test edilip paketlendiğinde sonuç aşağıya yazılacaktır.

### 2026-10-23 — Ev bakımı, kürek oyunu ve resimli ortak modallar

Yukarıdaki paket kodlandı ve web dağıtımına alındı. Taşınabilir/kaldırılabilir başlangıç minderi ve kum kabı, ön kenardan ayak teması, ortak krem modal ailesi, dikey ikonlu kenar etiketleri, ihtiyaç hizası ve Kütüphane adı bağlandı. Tuvalet dört aşamada gelişir; dört desenin üç yaşı için 48 tuvalet karesi, sekiz temiz/kirli kap karesi ve dört elektrikli temizlik karesi var. Mama/su hazneleri sonlu; farklı kalite/fiyat/süre/keyif/oyun içi sağlık ve kum dolumu kuralları kalıcı kayda bağlı. Sekiz odaya özel sekiz yeni etkileşimli eşya dört hareketli oyuncak ailesini paylaşır; katalog 56, başarım 64 oldu.

Son kullanıcı geri bildirimiyle manuel tuvaletlerde anlık temizleme yerine mevcut kürek mini oyunu geri getirildi. Tüm topaklar toplanmadan temizleme veya ödül yok; kapatılan oyunun eski callback'i ödül vermez. Elektrikli model otomatik temizler; kalan kum sınırlıdır. Ortak modal başlıkları ve sekmeler için 12 yeni çizilmiş ikon üretildi; kum ekranında model çizimi ve ikonlu eylem kartları kullanılır. Eski stiller yeni stillerden önce yüklenir.

134 JavaScript + 2 Python testi geçti; son oda değişimi görünürlük korumasından sonra ilgili 13 ev bakımı testi tekrar geçti. İki ana inline script ve 13 değişmiş modül sözdizimi kontrolünden geçti. Web paketi 386 dosya / 191.3 MiB; 83 kaynak dosyasının www karşılığı birebir doğrulandı. Önceki web dağıtımı `backups/www-before-build-sm_ux86y/www` içinde korundu. Native senkronizasyon ve canlı tarayıcı/telefon görsel kabulü yapılmadı; erişim reddini aşmak için başka tarayıcı kullanılmadı.

Tam görsel promptları, kaynaklar, modüller, davranışlar ve sınırlar: `docs/PATILIFE_EV_BAKIMI_VE_PANELLER.md`. Petsgram günlük paylaşım/etkileşim/sponsor önerisi `docs/PATILIFE_PETSGRAM_TASARIMI.md` içinde; Petsgram ve önerilen üç yeni mini oyun henüz uygulanmadı. Cihazda bütün yüzeyler, eşya boyutları, modal kırılımları ve FPS ölçümü açık kabul işidir.

### 2026-10-23 — Kumun içinde temas ve ihtiyaçlara göre kedi ifadesi

Kum kullanımında tüm kabı öne çıkarma kaldırıldı; açık kabın yalnız ön alt kenarı ayrı katmanda. Gerçek kaynak çizimindeki kum yüzeyi, nesne ölçeği, ekran yüksekliği ve çömelme karesindeki alfa pati merkeziyle temas hesaplanır. İşlem sonunda zemine geri yürür. Açlık veya susuzluk 30 ve altındayken bitkin iki kare ve yüzde 68 yürüyüş hızı; keyif 30 ve altındayken ayrı üzgün iki kare uygulanır. Aktif bakım/oyun/uyku hareketleri korunur, bakım sonrası ifade hemen normale döner. Üç yeni şeffaf atlas tüm dört görünüş/üç yaş için 48 kare içerir.

138 JavaScript + 2 Python testi geçti. Son ön katman çizim uyumundan sonra ilgili 17 test tekrar geçti. Kum temasında 432 ölçek/desen/yaş/kap birleşimi; gerçek ön katman ve işlem bitişi; yeni PNG sınırları, ihtiyaç önceliği ve bakım sırasında hareket koruması kontrol edildi. 390 dosya / 195.1 MiB web paketi üretildi, 87 kaynak dosyası www ile birebir doğrulandı. Önceki dağıtım `backups/www-before-build-i6s4j6rd/www` içinde. Canlı cihaz/tarayıcı görsel kabulü yapılmadı.

Tam promptlar, yerleşik imagegen kaynakları ve uygulama notları: `docs/PATILIFE_KUM_TEMASI_VE_IHTIYAC_POZLARI.md`.

### 2026-10-23 — Ayarlanabilir telefon hatırlatmaları

Kullanıcı Dengeli seçti: günde en fazla üç, 22.00–09.00 sessiz. Ayarlara tür, günlük sınır, en az aralık, sessiz saat ve günlük saat tercihleri eklendi. Mama/su son durumu ve otomatik hazne stoğu dikkate alınır. Eski özlem bildirimi ve ilk açılışta otomatik izin isteme kaldırıldı. Öne dönüşte bakım planı iptali, sırayla yeniden kurma, Native/Capacitor çift kurulumunu önleme ve günlük kayıt sınırı bağlandı. Petsgram için yalnız gelecekteki kayıtlı olay giriş noktası var; sahte kargo veya etkileşim planlanmaz.

148 JavaScript + 2 Python testi geçti; son veri tipi kontrolünden sonra ilgili 10 test tekrar geçti. 392 dosya / 195.1 MiB web paketi güncellendi. Telefon teslimatı/native derleme denenmedi. Tam ayarlar, dosyalar, sınırlar ve yedek: `docs/PATILIFE_TELEFON_BILDIRIMLERI.md`. Yeni oyun adı henüz seçilmedi.

### 2026-10-23 — Tuvalet işlemini anlatan durum ve adım ekranı

Kedi ihtiyacı, kalan kum ve kabın kirliliği ayrıldı. Ortak toiletStatus kuralı yerleştirme, kum ekleme, kürekle temizleme, kullanma veya bekleme önceliğini belirler. Modalda tek belirgin sonraki işlem ve çizilmiş ikonlu üç adım; fiyat/yetersiz altın, kullanım eşiği ve otomatik temizleme açıklamaları var. Sol rozet aynı eylemi gösterir; telefon bildirim metni aynı kuralla eşleşir. Kürek turu sonrası ekran yeni sırayı gösterir. Kap kullanılamazken yanlış otomatik gidiş duyurusu ve modern çevrimdışı hesapta kayıtsız tuvalet giderme kaldırıldı.

154 JavaScript + 2 Python testi geçti. 392 dosya / 195.1 MiB web paketi, 89 kaynak eşliği doğrulandı. Canlı telefon/görsel kabul yapılmadı. Ayrıntılar ve yedek: docs/PATILIFE_TUVALET_REHBERI.md.

### 2026-10-23 — Gerçek açılış sırası hatası

Konsol ekranı household.status'ın modül init edilmeden lifeV2 okuduğunu gösterdi. Bu önceki önbellek varsayımından farklı gerçek bir TypeError idi; onload kesildiği için sahne ve çekmece kurulumları tamamlanmıyordu. Durum sorgusu açık GameState/DecorManager ile başlangıçta güvenli hâle getirildi; iki menü her açılışta kapalı başlar. Aynı giriş yolu/kayıt anahtarları korundu. Kod/stil sürüm damgaları ve lazy loader revision desteği de eklendi.

Gerçek onload akışını kapsayan sentetik DOM regresyonu dahil 157 JavaScript + 4 Python testi geçti. build:check ve 89 kaynak/www eşliği doğrulandı. Canlı tarayıcı testi yapılmadı. Teknik neden ve sınırlar: docs/PATILIFE_BASLATMA_HATASI_VE_SURUM.md.


## 23 Ekim — Patigram oyun içi sürüm

Kullanıcı adı, açıklama, IndexedDB profil resmi, açık odada yürüyerek poz/çekim, sahne ve eşyalarla donmuş fotoğraf kaydı, albüm ve kurgusal akış eklendi. Gerçek takvim günü üzerinden takipçi kazanımı, sekiz saatlik etkileşim, ara verme payı, sınırlı takipçi kaybı ve bakım koşullu sponsor kargoları canonical envanter/kap gelişimleriyle bağlandı. Telefon sosyal bildirim adaptörü etkinleştirildi. Kullanıcı önce yerel sürümü seçti; sunucu ve gerçek oyuncu yayını kurulmadı. Ayrıntılar: PATILIFE_PATIGRAM_UYGULAMA.md.


## 23 Ekim — sahneden ayrılmış alt gezinme çubuğu

Bakım ve Oyun kenar etiketleri, Eşyalar ve Patigram girişleri dört düğmeli alt çubuğa taşındı. Gerçek oda viewport yüksekliğinden 88 px ve cihaz alt güvenli alanı ayrılır; panorama, catBottom ve yüzey/pointer koordinatları mevcut getStageScaleY üzerinden yeni yüksekliği kullanır. Kayıtlardaki eşya konumlarına sabit piksel kaydırması uygulanmaz. Bakım/Oyun seçenekleri çubuğun üzerinde yatay ve kaydırılabilir raf olarak açılır; ilk açılışta kapalı ve birbirini dışlayan davranış korunur. Patigram küçük sayaç bilgisi çubuğun altında ayrılan durum satırına geçer. Çekim, lazer ve dekor düzenlemesinde gereksiz gezinme gizlenir, oda alanı değişmez. Mevcut çizilmiş ikonlar kullanılır; yeni emoji/görsel eklenmez. Başlatma entegrasyon testi dört gerçek düğmenin aynı çubukta bulunduğunu ve menülerin kapalı başladığını denetler.


## 23 Ekim — av hedefleme, büyük yumak ve menü ikonları

Bakım yazısındaki eski kimlik seçicili 180 derece dönüş kaldırıldı. Alt çubuk düğmelerine ayrı kenarlık ve alt gölgeli kartlar eklendi. Eşyalar, Sinek/Böcek avı, Yumak ve Patile için yeni şeffaf 2 × 2 suluboya atlası oluşturulup eski parlak ikonların yerine bağlandı. Kaynak ve tam tanım: PATILIFE_YUMUSAK_OYUN_IKONLARI.md.

Avın çizim merkezi artık p.x/p.bottom hedef koordinatıyla aynı ekran pikseline denk gelir; 70 px canvas yarı yüksekliği sahne ölçeğinin içine yanlışlıkla katılmaz. Kilit mesafesi ekran pikseliyle hesaplanır. Avın üstüne dokunmak o avı seçer; parmak kalksa da kısa hedef takibi ve dolan halka sonrasında sıçrama başlar. Boş zemin seçmez; sürükleme ile hedeflemek de korunur. Hareket iptalinde seçim temizlenir. Av modunda touch-action:none mobil dikey sürüklemenin tarayıcı tarafından kaydırmaya çevrilmesini engeller. Hareket gerçek dt ile ölçeklenir. Kedinin yatay sıçrama merkezi avın merkezine hizalanır; taret kısaltılan viewport tabanına taşınır.

Yumak 46 px'den 84 px'e büyütüldü. Sürükleme yarıçapı gerçek eleman genişliğinden alınır; pati teması büyüyen yumağın merkeziyle hizalanır. Av entegrasyon testi küçülen viewport'ta çizilen sineğe gerçek pointerdown/pointerup, hedef rezervasyonu, sıçrama, tek yakalama, boş zemin reddi ve pointercancel senaryolarını çalıştırır. Canlı tarayıcı ve cihaz testi yapılmadı.


## 23 Ekim — üç mini oyun ve kaydırma/giriş koruması

Mama İzini Bul, Pencere Nöbeti ve Kutu Kaşifi oynanabilir olarak eklendi. Oyun menüsündeki Mini oyunlar düğmesinden isteğe bağlı yüklenir. Ayrıntılar ve ödül dengesi PATILIFE_MINI_OYUN_FIKIRLERI.md içindedir.

Paylaşılan modal açılışında önceki pointer yakalamaları bırakılır ve sahne/yumak/lazer sürükleme bayrakları sıfırlanır. Eşya ve yumak lostpointercapture olayları da artık sürükleme durumunu temizler. Paneller gerçek oyun yüksekliğiyle sınırlı açık bir scroll viewport kullanır; tekerlek olayı en yakın kaydırılabilir alana yönelir. İç içe panelin kaydırılması sahneye taşınmaz. Kullanıcının yenilemeyle düzelen kilidi canlı yeniden üretilemediği için tetikleyicinin kesin nedeni doğrulanmadı; olası eski giriş durumu ve olay yönlendirmesi için korumalar eklendi. Sentetik testler yakalanmış pointer bırakmayı, bayrak sıfırlamayı, iç içe scroll alanlarını ve panel sonundaki sınırları denetler.

## 24 Ekim — Tüm odalar kalıcı açık

Kullanıcı isteğiyle Bahçe, Kış bahçesi, Oyun tavanı ve Kütüphane dahil sekiz odanın tamamı oyun başlangıcından itibaren kullanılabilir. Geçici `previewRooms` ayarı, `progressiveRooms` üretimi, başarım/bağ kontrolü, kilitli oda mesajları, oda açılış modalı ve kullanılmayan stili kaldırıldı. Eşya odası seçimi, envantere yerleştirme, günlük oda kartları ve Patigram kamera seçimi aynı kurala geçirildi. Eşyanın hangi odaya uygun olduğu ve odadaki fiziksel yerleşim sınırları korunur. İlk ziyaret anısı bir kez kaydedilir; oda erişiminden bağımsız başarımlar ve eski kayıtlar korunur. Eski kayıttaki kullanılmayan `progressiveRooms` alanı artık erişimi etkilemez. Yeni kayıt, eski bayraklı kayıt, tüm odalarda uygun eşya yerleştirme ve tekrar ziyaret/yeniden yükleme test edildi.

### 24 Ekim 2026 — Sahne kadrajı ve oyun akışı düzeltmeleri
- Sahne ilk açılışta %100 ölçekte kalır. İki dokunuşla %55–180 arası yakınlaştırma ve kadraj taşıma; arka plan, kedi ve eşyalar aynı sahne dönüşümünü kullanır. HUD ve alt menü sabittir. Manuel kadraj otomatik takiple geri alınmaz; “Görünümü sıfırla” eski kamerayı geri getirir. Ayar oturumluk, kayıt verisini değiştirmez.
- Zemin, kanepe, lazer ve yumak girdileri sahne koordinatlarına çevrilir. Eşya sürükleme yakınlaştırma oranını hesaba katar; alt şerit sınırlaması kaldırılır. İkinci parmak geldiğinde eşya sürükleme/tarama girdisi iptal edilir.
- Mağazada onar eşyalık aşağı kaydırma yüklemesi; satın alma sonrası modal içi envantere ekleme onayı ve güncellenen düğme. Liste/kaydırma başa sarmaz.
- Patile fiziği ekran yenileme hızından bağımsız sabit 60 Hz adımlarla ilerler; mevcut yerçekimi, birleşme ve çarpışma ayarları korunur. Arka plandan dönüşte biriken süre çalıştırılmaz.
- Tekirin tuvalet atlası çizim sırasında normal sıcak kahverengi/krem paletine eşlenir; kaynak kare geometrisi ve alfa korunur. Modern evde eski gece raporu açılışta kendiliğinden gösterilmez.
- Oyuncuya gösterilen geçiş reklamı test düğmesi ve platform açıklamaları kaldırıldı.
- Otomatik kontroller: sahne dönüşümü/girdi iptali, fizik zamanı, mağaza yükleme/onay ve reklam olayları dahil testler. Gerçek telefonda çoklu dokunuş hissi ve reklam SDK sunumu ayrıca cihaz doğrulaması gerektirir.

Kadraj ek düzeltmesi: sekiz oda için üst ve alt alanlar yeni bitmap çizimlerle genişletildi; sahne yüksekliğini esneten geçici çözüm kaldırıldı. Varsayılan orta kadraj özgün görselle korunur, manuel kadraj boyalı üst/alt sınırlar içinde kalır. Yakınlaştırma tamamlandıktan sonraki dokunma kaynaklı hayalet tıklama kısa süre yutulur. Gerçek bakım hareketi sırasında bir panel açılması artık yürüyüşü ve bitiş geri çağrısını durdurmaz; reklam/arka plan duraklatması korunur. Eğri yüzeylere yürüyüşün tamamlanma yüksekliği gerçek yüzey temasından hesaplanır. Bu yollar için gerçek oyun işlevlerini çalıştıran gerileme testleri eklendi.
