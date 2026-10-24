# Patigram — cihazdaki oyun sürümü

23 Ekim 2026. Kullanıcı tercihi: önce oyun içindeki sürümü tamamla. Ortak sunucu, gerçek oyuncu akışı veya hesap hizmeti kurulmadı; ağ isteği yapılmıyor.

## Oyuncu akışı

Sağ altta Eşyalar düğmesinin üstündeki çizilmiş albüm ikonlu Patigram düğmesi açılır. Akış, Profilim, Fotoğraf çek, Fotoğraflarım ve Kargolar aynı krem renkli oyun panelini kullanır. Yeni emoji kullanılmaz; mevcut çizilmiş ikon ve eşya atlasları kullanılır.

Profilim'de 3–20 karakterlik kullanıcı adı (a–z, 0–9, alt çizgi), 120 karakterlik açıklama ve değiştirilebilir profil resmi vardır. Kullanıcı adı bu cihaza aittir, çevrimiçi benzersizlik iddiası yoktur. Galeriden PNG/JPEG/WebP seçilebilir; en fazla 10 MB dosya, merkezden kare kesim, 256 px JPEG olarak IndexedDB'ye kaydedilir. Kedinin resmiyle geri değiştirilebilir. Profil formu HTML çalıştırmaz.

Açık oda, üç fotoğraf köşesinden biri ve poz seçilir. Kedi normal oda geçişini ve yüzey yönlendirmesini kullanarak köşeye gider. Poz hazır olunca oyuncu çekim yapar veya vazgeçer; 45 saniyelik zaman aşımı kilitli bakım bırakmaz. Aç, susuz, çok yorgun, uyuyan veya başka etkinlikteki kediye çekim başlatılmaz. Bu sürüm mevcut tüm görünüş/yaşlara ait bakış, sevgi, temizlik, uyku ve oyun animasyonlarını kullanır; yeni poz atlası üretilmedi.

Fotoğraflar düz bir kedi kartı değildir: odanın gerçek görüntüsü, kamera kırpımı, kedi karesi/yönü ve görünür yerleştirilmiş eşyaların o anda çizilmiş atlas karesi saklanır. 512 px kare canvas üzerinde yeniden çizilir. Büyük base64 bitmapler pet_state içine konmaz. Bu temsil file:// üzerindeki canvas dışa aktarma kısıtlamasına ihtiyaç duymaz. Fotoğraflar oyun varlıklarına bağımlıdır; telefona JPEG dışa aktarma bu sürümde yoktur. Albüm en fazla 24 kare tutar; kaldırılan karenin gönderisi de kaldırılır. Önceden kazanılmış paylaşım günü silinmez.

## Günlük sosyal simülasyon

- Yerel gerçek takvim gününün ilk gönderisi takipçi kazandırır. Diğer gönderiler aynı günlük ödülü yeniden üretmez. Günde en fazla üç paylaşım; aynı kare ikinci kez paylaşılamaz.
- İlk günlük kazanım 22 takipçidir; ilerledikçe günlük 46'ya kadar çıkar. Beğeniler ve dört kurgusal karakterin yorumu sekiz saat içinde zamanla açılır. Sekmeyi kapatıp açmak ödül üretmez.
- İki tam gün ara verme payı vardır. Sonraki günlerde takipçiler %1,5/gün azalır; tek dönüşte en fazla %10 kayıp. Eşyalar alınmaz. Tekrar açılış aynı kaybı yinelemez. Cihaz saati geri alınması ilerlemeyi geri sarmaya izin vermez; sunucu olmadığından cihazın ileri saatini bağımsız doğrulama yoktur.
- Sol altta yalnızca aktif gönderi veya gelmiş kargo olduğunda küçük bilgi görünür. Her karede yeni animasyon/timer kurulmaz; hesaplama HUD üzerinden dakikada en fazla bir kez yapılır. Patigram JavaScript dosyaları isteğe bağlı ve sıralı yüklenir.

## Sponsor kargoları

| Hediye | Paylaşım günü | Takipçi | Bakım koşulu |
|---|---:|---:|---|
| Üç premium mama numunesi | 3 | 50 | 3 farklı mama günü |
| Kumaş tünel | 7 | 150 | 7 farklı oyun günü |
| Otomatik mama kabı | 14 | 350 | 7 farklı mama günü |
| Otomatik su kabı | 21 | 600 | 7 farklı su günü |
| Elektrikli kum kabı gelişimi | 30 | 1000 | 7 farklı tuvalet kullanım günü |

Kargo iki saat sonra gelir, oyuncu düğmeyle bir kez teslim alır. Eşya mevcut canonical envantere girer; Yerleştir normal açık oda seçimini açar. Aynı eşya zaten varsa 20 altınlık sınırlı karşılık verilir. Otomatik kaplar gerçek kap aşamasını açıp seçer; hazne bedava ve sonsuz doldurulmaz. Elektrikli tuvalet mevcut kum bitme sistemini kullanır. Premium numune tek porsiyonluk ücretsiz gerçek besleme başlatır; mama kabı yerleştirilmiş olmalı. Başarımla gelişim yolu korunur.

Patigram gönderi ve kargo hatırlatmaları mevcut telefon bildirim planlayıcısına kalıcı kimliklerle girer; toplam günlük üç, 22.00–09.00 sessizlik ve izin tercihlerine tabidir. Tarayıcı sürümü telefona yerel bildirim gönderdiğini iddia etmez; cihaz teslimi mevcut native adaptöre bağlıdır.

## Doğrulama sınırı

Saf model ve sentetik DOM entegrasyon testleri; canonical kayıt yükleme, günlük sınırlar, zaman atlama, çevrimdışı artış, takipçi kaybı, kargo tekilliği, katalog kimlikleri, otomatik kap bağlantısı, fotoğraf kırpımı ve çizimi denetlenir. Canlı tarayıcı erişimi daha önce reddedildiğinden canlı görsel veya fiziksel cihaz testi yapılmadı. Sunucu sürümüne geçişte gerçek oturum, profil kimliği, görsel depolama ve ortak akış ayrı uygulama işi olacaktır.

Doğrulama sonucu: 176 JavaScript + 4 Python testi geçti; 19 Patigram testi kapsamı dahil. Web manifesti 395 dosya; kaynak ile paketlenen 44 JS/CSS/JSON dosyası birebir eşleşti. Orijinal giriş yolu değiştirilmedi.

## 23 Ekim — fotoğraf uygulaması görünümü

Patigram kendi sabit uygulama başlığı ve altta beş ikonlu gezinme düğmesiyle açılır. İçerik kendi içinde kayar; başlık ve gezinme görünür kalır. Akışta küçük profil satırı, tam genişlik fotoğraf ve altında beğeni/yorumlar bulunur. Profilde sayaçlar, açıklama ve üç sütunlu paylaşım ızgarası vardır; düzenleme formu ayrı açılır bölümdedir. Galeride küçük karelerden seçilen tek fotoğrafın paylaşımı hazırlanır. Kamera ekranındaki tarayıcıya ait select tamamen kaldırıldı; oda düğmeleri, ikonlu poz seçenekleri ve üç ikonlu köşe kartı kullanılır. İlerleme, kayıt ve sponsor kuralları korunur.

## 23 Ekim — çekim ve paylaşım akışı düzeltmesi

Çekim sırasında kontrol kutusu kedinin önündeki alt alandan çıkarılıp üst HUD içinde tek satırlı çubuğa taşındı. Çekim bitene, iptal edilene veya zaman aşımına kadar oda sekmeleri, yan menüler, eşya ve Patigram giriş düğmeleri gizlenir; sonrasında geri görünür. Fotoğraf kaydında bu kontroller zaten sahneye dahil edilmez.

Kullanıcı adı eksik paylaşım artık arkadaki oyun toast'ıyla durmaz. Fotoğraf ve açıklama korunup kullanıcı adı ekranı açılır; açıkça Kaydet ve paylaş seçeneğiyle profil ve gönderi birlikte kaydedilir. Doğrulama/kota hataları panelin içinde görünür, başarılı paylaşım akıştaki gönderi ve durum mesajıyla doğrulanır. Normal kullanıcı adıyla paylaşım, kullanıcı adı yokken devam etme, geçersiz ad sonrası tekrar deneme, gerçek ana oyun saveGameState işleviyle kalıcı kayıt ve yeniden yükleme test edilir.

## 23 Ekim — aralıklı sosyal etkileşim

Yeni gönderinin kimliğinden türetilen rastgele takvim bir kez üretilip kaydedilir. İlk 1–3 beğeni 15–45 saniyede; ilk yorum 90–240 saniyede planlanır. Sonraki küçük beğeni grupları ve 1–4 farklı yorum sekiz saate düzensiz dağılır. Her gönderinin zamanları, toplam tepkisi ve yorumcuları değişebilir. On iki kurgusal profil/yorum vardır. Erişimin tamamı zorunlu beğeniye dönüşmez; büyük hesaplarda tek gönderi için bu sürümde en fazla 120 yeni beğeni planlanır.

Takvim kayıtla korunur; tekrar açma veya sık bakma yeni çekiliş yapmaz. Çevrimdışı geçen sürede zamanı gelen aynı olaylar uygulanır; önceki sürümün kazanılmış sayıları düşürülmez. Aktif oyunda 10 saniyede bir kontrol yapılır, olay yokken yalnız saat değişti diye kayıt yazılmaz. Açık akışta sayaç ve yorumlar yerinde güncellenir; fotoğraflar yeniden yüklenmez, kaydırma konumu korunur. Takipçi kazanımı ve sponsor koşulları değişmedi.

## 23 Ekim — bildirim kutusu ve okunmamış rozet

Oda/alt gezinme üzerindeki beğeni-yorum durum yazısı kaldırıldı. Patigram uygulama başlığındaki bildirim düğmesi, zaman sıralı beğeni grupları, yorumlar ve teslim edilmiş kargoları gösterir. Patigram girişinde okunmamış bildirim adedi rozete yansır (99 üzeri görsel olarak 99+); erişilebilir etikette tam adet okunur. Bildirim kutusu açıldığında son okuma zamanı kalıcı kayda yazılır; yalnız uygulamayı veya akışı açmak bildirimleri silmez. Sonradan gelen olaylar yeniden rozet oluşturur. Kargo bildirimini okumak hediyeyi teslim almaz. Mevcut telefon bildirim izin ve sessiz saat kuralları korunur.

## 23 Ekim — yenilemede okunmamış rozeti koruma

Başlangıç rozeti artık isteğe bağlı Patigram panelinin yüklenmesine veya yeni bir etkileşim gelmesine bağlı değildir. Hafif bildirim kuralları ana sayfayla yüklenir; navbar oluşturulduğunda kayıtlı olaylar ve activityReadAt üzerinden okunmamış sayı hemen çizilir. HUD yenilemesi de bu salt okunur hesabı kullanır. Ana Patigram düğmesi her zaman akışı açar; önceki oturumda bildirim sayfasında kalmış olmak yeni mesajları otomatik okundu yapmaz. Açılış veya rozet çizimi activityReadAt yazmaz. Entegrasyon testi panel modülü yüklenmeden art arda iki açılışta aynı okunmamış rozeti doğrular.
