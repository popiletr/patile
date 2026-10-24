# PatiLife: mağaza sınırları içinde canlı içerik

Bu mekanizma **veri güncellemesidir**. Uygulama internetten JavaScript, HTML, CSS, native kod, yeni özellik, mini oyun veya izin indirmez. Mevcut oyun motoru, reklam, bildirim, Game Center ve Play Games kodu uygulama paketinde kalır. Kod hataları için mağaza sürümü gerekir. Bu tasarım mağaza onayını garanti etmez; inceleme notlarında açıkça belirtilmelidir.

## İlk desteklenen alanlar

Yalnız mevcut mama/su seçeneklerinin `detail` düz metni (en çok 180 karakter) ve şu altın fiyatları değişebilir:

| Seçenek | İzin verilen fiyat |
| --- | --- |
| Ekonomik mama | 1–6 |
| Dengeli mama | 4–12 |
| Kaliteli mama | 12–27 |
| Özel bakım maması | 25–50 |
| Filtrelenmiş su | 4–12 |
| Uzun tazelik suyu | 12–30 |

Musluk suyu ücretsiz kalır. Yeni seçenek/nesne kimliği eklenemez. Tokluk, sağlık, süre, ödül, reklam sıklığı, satın alma, izinler veya kişisel veriler uzaktan değişmez. HTML, URL, kontrol karakteri ve emoji reddedilir. Diğer alanlar bütün paketi geçersiz kılar. Sonraki içerik türleri önce yeni mağaza sürümünün doğrulayıcısına eklenmelidir.

## Çalışma

- Sabit adres: `https://nazmi.tr/oyun/content/live.json`.
- Açılışta cihazdaki imzalı önbellek tekrar doğrulanır. Geçerli değilse paketteki varsayılanlar kullanılır.
- Ağ kontrolü oyun açılışını bekletmez. İstek anonimdir: çerez, Google/Apple kimliği veya oyun kaydı gönderilmez. Hosting olağan erişim loglarında IP adresini görebilir.
- HTTPS, JSON içerik türü, yönlendirme yasağı, 24 KB akış sınırı ve 6 saniye zaman aşımı uygulanır.
- ECDSA P-256 / SHA-256 imzası uygulamada gömülü açık anahtarla doğrulanır. Sunucuya yalnız imzalı JSON konur; özel anahtar gönderilmez.
- Artan tamsayı sürümü, sabit `store-data-v1` kanalı, şema 1 ve en fazla 90 gün geçerlilik gerekir. Paket süresi dolunca sonraki açılışta varsayılanlara dönülür.
- Yeni paket tamamıyla doğrulandıktan sonra tek önbellek kaydıyla saklanır. Etkin oturumda fiyat değiştirilmez; sonraki açılışta uygulanır.
- Ağ/depolama/imza hatası mevcut paketi ve oyuncu kaydını değiştirmez. İçerik önbelleği bulut oyun kaydına dahil edilmez.
- Eski sürüm kabul edilmez. Geri almak için önceki değerlerle **daha yüksek sürüm numaralı** yeni paket imzalanır. Varsayılanlara dönüş için `food: {}, water: {}` yeterlidir.

## Yayınlama

1. `release/remote-content/source.json` dosyasında sürümü artır, `issuedAt` ve `expiresAt` değerlerini milisaniye olarak güncelle. İlk paket boş değişiklik içerir, oyun dengesi aynı kalır.
2. `node scripts/content-release.cjs sign release/remote-content/source.json release/remote-content/live.json`
3. `live.json` dosyasını sunucudaki `/oyun/content/live.json` adresine atomik değiştirerek yükle. `Content-Type: application/json`, `Cache-Control: no-store`, `Access-Control-Allow-Origin: *`, `X-Content-Type-Options: nosniff` başlıkları gerekir. Çerez yetkisi verilmez.
4. Canlı dosyayı indirip gömülü anahtarla doğrula; iOS ve Android WebView'da sonraki açılışı kontrol et.

Özel anahtar `.content-signing/private.pem` içindedir, yalnız yerel imzalayıcı okur; Git tarafından dışlanır ve paket manifestine dahil edilmez. Güvenli çevrimdışı yedeği tutulmalıdır. Anahtar kaybolursa uygulamadaki açık anahtarı değiştirmek için mağaza sürümü gerekir. Anahtarın tekrar üretilmesi engellenir. `init` mevcut anahtarı değiştirmez.

## Mağaza inceleme notu taslağı

> PatiLife bundles all executable web and native code. An optional anonymous HTTPS request fetches a signed JSON document containing only bounded virtual-currency prices and plain-text descriptions for existing food and water items. The app rejects executable code, HTML, CSS, remote URLs, new item IDs, new features and unknown fields. Cached content works offline. Invalid or expired content falls back to bundled defaults. No player save data is uploaded by this service.

Apple: https://developer.apple.com/app-store/review/guidelines/ (2.5.2 ve 4.7). Google: https://support.google.com/googleplay/android-developer/answer/16559646?hl=en . Yeni özellikleri incelemeden kaçırmak için kullanılmaz.

## Doğrulama

Yedi anlamlı test: sahte imza, geçersiz/sona ermiş şema, kod/HTML/URL alanları, fiyat sınırları/ücretsiz su, çevrimdışı önbellek, oturum sonunda etkinleşme, eski sürüm reddi, büyük/HTML/yönlendirilmiş yanıt, disk hatası ve tek ağ isteği. Tüm proje testleri: 244 JavaScript + 4 Python başarılı. Native gerçek cihaz CORS ve çevrimdışı açılış kontrolü ayrıca gerekir.

## 24 Ekim 2026 canlı yayın

- Güncel web oyunu `https://nazmi.tr/oyun/` adresine yüklendi; web revizyonu `7f51db1395cc`.
- Sunucudaki önceki oyun `/var/www/nazmi_tr_usr/data/patilife-releases/oyun-before-content-v1-20261024` altında, web kökünün dışında korundu. Yeni sürüm ayrı klasörde hazırlanıp klasör değişimiyle yayına alındı.
- `https://nazmi.tr/oyun/content/live.json`: HTTP 200, application/json, CORS `*`, no-store ve nosniff başlıkları doğrulandı. Canlı yanıtın ECDSA imzası gömülü açık anahtarla tekrar doğrulandı; sürüm 1, boş değişiklik.
- Tarayıcıda güncel PatiLife açıldı; eski profil için kayıtları koruyan görünüş tamamlama ekranı görüldü. Kullanıcının profil seçimi değiştirilmedi. Kanıt `scratch/patilife-canli-yayin.png`.
- iOS ve Android web kopyaları kaynakla aynı SHA-1 değerinde doğrulandı. `npm run build:check` başarılı. Mevcut kurulmuş native uygulamalara bu altyapıyı getirmek için bir yeni uygulama sürümü yüklenmesi gerekir.
