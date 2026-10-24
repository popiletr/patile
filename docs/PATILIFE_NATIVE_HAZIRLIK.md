# PatiLife native kayıt ve reklam hazırlığı — 23 Ekim 2026

Oyun adı PatiLife, uygulama kimliği `com.patilife.app` olarak korundu. Kaynak değişikliklerinden önce `backups/native-services-before-20261023-225459/source.tar.gz` alındı. Önceki audit belgesi eski uygulamanın bulgularını anlatır; bu belge düzeltme sonrası durumu anlatır.

## Kayıt

- iOS: Game Center kimlik doğrulaması ve iCloud KVS. Game Center oturumu ile iCloud depolaması farklı hizmetlerdir. KVS `synchronize()` sonucu sunucuya kesin yükleme teyidi sayılmaz; arayüz aktarımın sistem tarafından sıraya alındığını belirtir.
- Android: Play Games v2 SDK, Saved Games/Snapshots native köprüsü eklendi. `games_app_id` artık `843057793938`: Play Games projesi, Saved Games, debug OAuth Android paket+imza ilişkisi ve geliştirici test hesabı yapılandırıldı. Gerçek cihazda giriş ve kayıt aktarımı testi henüz yapılmadı; üretim imzası ayrıca bağlanmalıdır.
- İlk yerel oyun başlangıcından önce bulut okunur. Farklı oyunlar zaman damgası karşılaştırılarak sessizce ezilmez; oyuncuya cihaz/bulut seçimi sunulur. Android iki bulut kopyası da seçilebilir. Seçilmeyen kayıtlar yerel kurtarma yedeğine alınır.
- Paket; ana oyun, yaşam verisi, dekor, profil, Patigram sosyal verisi, yüklenen avatar, Patile ilerlemesi ve aktif tahta, bildirim tercihlerini içerir. Yalnız izin verilen depolama anahtarları taşınır.
- Başarısız yazma başarılı kayıt zamanını ilerletmez. Bağlantı geri gelince yeniden denenir. iCloud hesap değişikliği ve kota bildirimi dinlenir. Profil resmi/depolama aktarımı başarısızsa önceki kayıt geri konur.
- Ayarlar → Oyun kaydı ve bulut: durum, hesap bağlantısı, JSON dışa/içe aktarma, kurtarma yedeği. iOS–Android arasında ortak hesap sunucusu yoktur; dosya yedeği ile geçiş sunulur. Tarayıcı kaydı ayrı origin’e aittir.
- iCloud KVS, tam sunucu işlemi/CAS garantisi sunmaz. Native revizyon kontrolü ve geri alma yedeği veri kaybı riskini azaltır; iki gerçek cihazda çevrimdışı/çevrimiçi çatışma testi yayın öncesi gereklidir.

## Reklam

AdMob panelinde iOS’ta eski `9509235028` birimi **ödüllü geçiş** türündeydi, uygulama ise normal ödüllü API kullanıyordu. Eski birim korunarak doğru türde yeni birimler oluşturuldu. Android uygulaması da AdMob’da PatiLife adıyla, henüz mağazada yayınlanmamış olarak oluşturuldu.

| Platform | Uygulama | Ödüllü | Bölüm arası |
| --- | --- | --- | --- |
| iOS | `ca-app-pub-2856135323536987~9216601303` | `ca-app-pub-2856135323536987/1896049832` | `ca-app-pub-2856135323536987/4657322426` |
| Android | `ca-app-pub-2856135323536987~3691639394` | `ca-app-pub-2856135323536987/3943006556` | `ca-app-pub-2856135323536987/9003761545` |

- `native-config.js` ortamı **development** kalır; resmi platforma uygun test birimleri kullanılır. Üretim kimlikleri kaydedildi ancak canlı reklam açılmadı. AdMob incelemesi, mağaza ilişkisi, hedef yaş kitlesi ve gizlilik mesajı ayarları tamamlanmalıdır.
- Ödül SDK’nın kazanım olayından/sonucundan sonra, kapanışta bir kez verilir. Reklamı kapatmak, hata, web tarayıcısı veya doldurulamayan reklam ödül sağlamaz. Dinleyiciler kapanış/hata sonrası kaldırılır; eşzamanlı ikinci reklam engellenir.
- Tam ekran reklamda oyun/Patile ve ses durur; kapanınca devam eder. Rıza durumu kontrol edilir. Kişiselleştirilmemiş reklam istenir; ayarlarda gizlilik tercihleri düğmesi vardır. Tarayıcıda sahte reklam/ödül yoktur.
- Bölüm arası: doğal Patile bölüm/çıkış/yeniden deneme, av ve mini oyun bitişlerinde; en az 5 dakika oturum, 4 dakika ara ve günde en çok 6 gösterim. Patile dört bölümde bir; tamamlanan mama/su bakımında dört etkinlikte bir uygunluk kontrol edilir. Aktif bakım, uyku veya oyun sürerken gösterilmez. Oda değişimi tek başına reklam başlatmaz. Banner otomatik gösterilmez.

## Görseller ve paketler

Yeni opak 1024px iOS ikonu, Android ikon yoğunlukları/adaptive ikon, dört pozlu açılış görseli ve PatiLife açılış ekranı eklendi. Hareket azaltma ayarında sabit kare gösterilir. Açılış sonsuza kadar ekranı kapatmaz. Görsel promptları `PATILIFE_MARKA_GORSELLERI.md` içinde bulunur. `www` ve native web kopyaları güncellendi.

## Doğrulama ve kalan adımlar

- `npm test`: JavaScript ve Python testleri. Native servis testleri ilk okumadan önce yazmama, tam kayıt paketi, saat farkıyla çatışma, SDK yükleme hatası/erken kapanış, çift ödül önleme, dinleyici temizliği, medya geri alma ve iki bulut kaydının korunmasını kapsar.
- iOS: Xcode Debug / generic iOS Simulator / CODE_SIGNING_ALLOWED=NO derlemesi başarılı.
- Android: JDK 21 ile `./android/gradlew -p android :app:assembleDebug` başarılı. İlk kaynak birleştirme hatası uygulama clean sonrası çözüldü.
- Tarayıcıdaki mevcut oyun normal açıldı; ayarlardan kayıt/yedek ekranı ve gizlilik düğmesi görüldü. Konsolda AudioContext kullanıcı etkileşimi uyarıları vardı; başlangıcı durduran JS hatası görülmedi.
- İki fiziksel iPhone/Android arasında aynı hesapla kayıt aktarımı, uygulama yeniden kurulumu, hesap değiştirme, native reklam rıza/kapanış/ödül ve gerçek bildirim teslimi henüz cihaz üzerinde doğrulanmadı. Debug derlemesi bu doğrulamaların yerine geçmez.
- Google Play taslağı PatiLife / Türkçe / ücretsiz oyun / `com.patilife.app` olarak oluşturuldu. Geliştirici politikaları ve ABD ihracat beyanları kullanıcının açık onayıyla kabul edildi. Play Console uygulama kimliği: `4975185500484992613`. Uygulama mağazada yayınlanmadı. Kontrol paneli: https://play.google.com/console/u/0/developers/4669295158363554598/app/4975185500484992613/app-dashboard

## 24 Ekim — Bulut projesi

Google Cloud projesi: `PatiLife`, kimlik `patilife`, proje numarası `843057793938`. 24 Ekim 2026 tarihinde Play Console üzerinden bu projeye bağlı Play Games projesi oluşturuldu. Play Console da PGS proje kimliğini **843057793938** olarak doğruladı. Saved Games açıldı ve Google Drive API etkin görünüyor. Proje taslak; mağazada veya PGS'de yayın yapılmadı.

### Play Console hesabı erişimi

Projeye özel Owner yetkisi kullanıcının açık onayıyla `okbaznazmi@gmail.com` hesabına verildi. Kullanıcı daveti kabul etti; IAM'deki bekleyen davet uyarısı kalktı ve Play Console listesinde `PatiLife patilife` seçilebildi. `wodpacker@gmail.com` ve organizasyon yetkileri korundu.

### OAuth hazırlığı

Google Auth Platform sihirbazı hazırlandı: uygulama adı `PatiLife`, destek/iletişim `okbaznazmi@gmail.com`, dış kullanıcılar için test modu. Google API Services: User Data Policy kullanıcının açık onayıyla kabul edildi ve OAuth yapılandırması oluşturuldu. `games`, `games_lite`, `drive.appdata` kapsam tanımları kaydedildi; bunlar gelecekte oyuncunun onay ekranında istenecek kapsamları tanımlar, oyuncu hesabına tek başına erişim vermez. Kanıt: `scratch/patilife-oauth-olustu.png`. Android istemcisi kullanıcının açık onayıyla oluşturuldu ve Play Games Android kimlik bilgisine bağlandı. Ad `PatiLife Android Debug`, paket `com.patilife.app`, aşağıdaki debug SHA-1. OAuth istemci kimliği `843057793938-ap9p5nj8a20tdm1r5368d8v2a3cnavg6.apps.googleusercontent.com`; PGS kimlik kaydı `CgkIkpek0cQYEAIQAA`. Konsol Android uygulama kimliğini `843057793938` olarak doğruladı; `android/app/src/main/res/values/strings.xml` güncellendi. `okbaznazmi@gmail.com` OAuth ve PGS test listelerinde doğrulandı. OAuth test modu ve PGS taslak durumu korunur; yayın yapılmadı. Kanıtlar: `scratch/patilife-android-oauth-olustu.png`, `scratch/patilife-android-pgs-bagli.png`, `scratch/patilife-oauth-test-hesabi.png`, `scratch/patilife-pgs-test-hesabi.png`.

Yeni oyun kimliğiyle Android Debug derlemesi başarılı (`scratch/patilife-pgs-android-build.log`, BUILD SUCCESSFUL). APK: `android/app/build/outputs/apk/debug/app-debug.apk`. Gerçek Android cihazda aynı Google hesabıyla giriş, ilk kayıt, yeniden kurulum ve ikinci cihaza aktarım testleri henüz yapılmadı. Google ayarlarının yayılması zaman alabilir. Play App Signing üretim SHA-1 için ayrı Android OAuth istemcisi/PGS ilişkisi hâlâ gereklidir; debug kimliği mağaza sürümünü kapsamaz.

Android geliştirme paketinin herkese açık sertifika parmak izleri:

- SHA-1: `E6:89:4B:BD:6A:D9:E3:7A:8C:E1:67:24:27:18:22:70:71:73:92:A2`
- SHA-256: `DA:DE:9E:5D:87:89:06:47:FC:4F:43:8A:FC:1C:49:16:ED:89:D6:C2:B9:CD:35:25:1C:28:BF:8A:B5:C1:BB:DA`

Bu parmak izleri yalnız debug kurulumu içindir; Play App Signing üretim imzası ayrıca konsoldan bağlanmalıdır. Parola veya özel anahtar bu belgeye eklenmedi.

## 24 Ekim — Veriyle sınırlı canlı içerik

`PATILIFE_CANLI_ICERIK.md` içindeki sınırlı JSON güncelleyici eklendi ve `https://nazmi.tr/oyun/content/live.json` yayına alındı. Çalıştırılabilir kod uzaktan indirilmez. İmzalı mevcut mama/su açıklamaları ve sınırlı fiyat değişiklikleri sonraki açılışta uygulanabilir; native/web kod değişiklikleri mağaza paketindedir. iOS ve Android web kaynakları senkronize. Testler 244 JavaScript + 4 Python başarılı. Cihazda HTTPS/CORS/çevrimdışı içerik kontrolü ayrıca yapılmalıdır.

## 24 Ekim — Reklam erişimlerinin geri bağlanması

Yeni bakım modalları eski HTML sponsor kartlarını atladığı için ödüllü reklam seçenekleri görünmüyordu. Sponsor görevleri Günlük ekranına; sponsorlu mama/su ilgili dolum ekranlarına, sponsorlu kum uygun kum yenileme durumuna eklendi. Var olan çizilmiş ikonlar kullanılır. Kartlar ödülü ve reklam gerektirdiğini açıkça söyler; tıklayınca işlem boyunca devre dışı kalır. Callback yöntemleri gerçek SDK sonucunu döndürür. Ödül almadan kapatmak veya yükleme hatası kazanç sağlamaz; doğrulanmış kazanım olayı ve reklam kapanışı sonrası bir defa ödenir. Normal bakım ve günlük görev ödülleri kendi kurallarıyla korunur; sponsor görevlerinin ödülü reklam tamamlamaya bağlıdır.

Daha önce filtrelenen GameOver Retry/Map, av bitişi ve mini oyun çıkışı doğal geçiş reklamlarına yeniden bağlandı. Dört tamamlanan mama/su bakımında da sıklık kontrolü yapılır; bekleme süresi dolmadıysa bir sonraki doğal bitiş beklenir. Oturum 5 dakika, aralık 4 dakika, günlük 6 sınırı korunur. Fiziksel cihaz reklam teslimi henüz doğrulanmadı; ortam development, resmi iOS/Android test reklamları kullanılır.

### 24 Ekim 2026 — Reklam rıza formu düzeltmesi
Geliştirme/test reklam modu açık kalır. AdMob 8.1.0 iOS eklentisi consentExecutor sunucusunu initialize sırasında bağlıyordu; uygulama UMP rızasını initialize öncesi istediği için gerekli form “No ViewController” ile başarısız olabiliyordu. scripts/patch-admob-consent.cjs postinstall adımı, requestConsentInfo ve showPrivacyOptionsForm girişlerinde plugin sunucusunu önceden bağlar. Reklam SDK başlatma sırası rızadan sonra kalır. SDK sürümü değiştiğinde yöntem imzaları değişmişse yama açık hata vererek inceleme ister. iOS Simulator derlemesi bu Swift değişikliğiyle doğrulandı; gerçek cihaz reklam sunumu henüz doğrulanmadı.

Son doğrulama: 264 JavaScript ve 4 Python testi geçti. iOS Simulator unsigned derlemesi ve Android debug APK derlemesi başarılı. Web revizyonu 21fb8fdbf9ba, seçili 14 canlı dosya HTTPS üzerinden yerel paketle SHA-256 eşitliğiyle doğrulandı. Dağıtım öncesi canlı dosyalar sunucudaki patilife-releases/audit-21fb8fdbf9ba/previous altında korundu. Mobilde yeni web paketinin yüklenmesi için güncel native derlemenin çalıştırılması gerekir; gerçek cihazda pinch hissi ve reklam sunumu hâlâ cihaz testi gerektirir.
