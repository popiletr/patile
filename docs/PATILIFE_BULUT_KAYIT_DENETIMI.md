# PatiLife / Patile bulut kayıt denetimi

23 Ekim 2026. Kapsam: mevcut Capacitor oyunu (`com.patilife.app`), iOS native köprüsü, güncel web kaynağı ve depodaki gömülü iOS web paketi. Başka projelerde veya mağazaya gönderilmiş eski sürümlerde farklı entegrasyonlar bulunabilir; bunlar bu denetimde doğrulanmadı.

## Sonuç

iOS Game Center oturumu ve iCloud key-value kayıt mekanizması mevcut. Ancak bütün ilerlemenin cihaz değiştirince taşınacağı doğrulanamıyor; somut veri kapsamı ve senkronizasyon hataları bulundu. Bu çalışma üretim kayıtlarını değiştirmeyen kod incelemesi ve izole bellek tabanlı native köprü testidir. Gerçek iCloud / Play Games hesabına bağlanılmadı.

| Alan | Bulgular |
|---|---|
| iOS | `ios/App/App/AppDelegate.swift:103` native GameCenterAndCloud eklentisi kayıtlı. Game Center oturum açıyor; oyun kaydı GameKit Saved Games yerine NSUbiquitousKeyValueStore ile iCloud'a yazılıyor. UserDefaults ayrıca cihaz içi yedek tutuyor. |
| Yetkiler | `ios/App/App/App.entitlements` Game Center ve ubiquity-kvstore kimliğini içeriyor; Xcode hedefi bu dosyayı kullanıyor. Gerçek imzalama profili, hesap erişimi ve uzak sunucuya ulaşan kayıt doğrulanmadı. |
| Android | Bu çalışma ağacında Android native proje klasörü, Google Play Games Saved Games köprüsü veya ilgili bağımlılık bulunamadı. JS yalnız GameCenterAndCloud adlı eklentiyi arıyor. Bu koddan Android bulut taşıması sağlanmış kabul edilemez. |
| Platformlar arası geçiş | Apple ve Google hesaplarını aynı oyun kaydına bağlayan ortak bir hesap/kayıt katmanı bu oyunun akışında bulunamadı. iOS–Android geçişi desteklenmiş kabul edilemez. |

## Öncelikli sorunlar

1. **Patile ilerlemesi ve tahta bulut paketinde yok.** `pages/patile-engine.js:344` bölüm, yıldız, joker ve ses ayarlarını `cat_suika_save_v2`; canlı tahtayı `cat_suika_active_board_v1` anahtarına yazıyor. `native-services.js:78` bulut paketi bunları içermiyor; geri yüklemede de bu anahtarlar yazılmıyor. Testte 37. bölüm ve mevcut tahta yerelde vardı; aynı paketten kurulan yeni cihazda ikisi de bulunmadı.
2. **Geri yükleme tamamlanmadan yazma eski kaydı silebilir.** `native-services.js:13` oturum girişini beklerken `saveToCloud` çağrısı engellenmiyor. Testte mevcut 9000 altınlı bulut kaydı, giriş beklerken yapılan 40 altınlı yeni cihaz kaydıyla değiştirilebildi. Ana oyunun saveGameState akışı bu yazma yolunu kullanıyor; hiçbir restore kilidi yok.
3. **Başarısız yazma sessiz kalıyor.** `native-services.js:77` yerel kayıt zamanını uzak yazmadan önce ilerletiyor; 93. satır hatayı yutuyor. Swift tarafı da `synchronize()` sonucunu değerlendirmeden başarı döndürüyor (`AppDelegate.swift:149`). Bu sonuç uzak iCloud yüklemesinin tamamlandığının kanıtı değildir.
4. **Gecikmiş iCloud kaydı ve eski kayıt çakışmaları eksik ele alınıyor.** Native köprü iCloud'dan gelen dış değişiklik bildirimini dinlemiyor. İlk yüklemede kaydı henüz gelmemiş yeni cihaz yeniden senkronize edilmeyebilir. Ayrıca Swift tarafı tarih karşılaştırması yapmadan iCloud kopyasını UserDefaults kopyasına tercih ediyor (`AppDelegate.swift:168`); yerel native yedek daha yeni olsa da seçilmeyebilir.
5. **Yüklenmiş Patigram profil fotoğrafı taşınmıyor.** Kullanıcı adı ve diğer Patigram/mini oyun verileri `pet_state.lifeV2` içindedir ve güncel pakete girer. Kullanıcının yüklediği avatarın dosyası ayrı IndexedDB `patilife-patigram-media` deposundadır; paket bu dosyayı almıyor. Avatarı tanımlayan `upload` işareti taşınsa da resmin kendisi taşınmaz. Oyun içinde oluşturulan fotoğrafların sahne bilgisi lifeV2 içinde saklandığından bununla karıştırılmamalıdır.
6. **Depodaki iOS gömülü web paketi güncel değil.** `www/index.html` güncel `79b678e4f2a1` revizyonundadır. `ios/App/App/public/index.html` eski tek dosyalı sürümdür, `lifeV2` kaydı içermez ve modüler native-services dosyası bu gömülü pakette yoktur. Son web-only yapıları iOS'a kopyalanmamıştır. Telefona gerçekten yüklenen mağaza/TestFlight sürümünün hangisi olduğu bu denetimde belirlenmedi.

## Olumlu doğrulama

Güncel JS servisinin `pet_state`, lifeV2 ve mini oyun/Patigram metaverisini yazıp yeni bir bellek deposuna geri getirdiği doğrulandı. Kedi profili ve yerleştirilmiş/sahip olunan eski dekor listeleri için de paket alanları mevcut. Bu doğrulama gerçek Apple sunucusuna yazma veya iki fiziksel cihazla taşıma testi değildir.

Tekrar çalıştırılabilir denetim: `node scratch/patilife-cloud-audit.cjs`. Sonuçlar: `scratch/patilife-cloud-audit-results.json`. Script gerçek native servis kodunu çalıştırır; native eklenti ve localStorage izole bellek nesneleridir. Canlı kullanıcı kaydı okunmaz veya yazılmaz.

## Düzeltme ve cihaz doğrulaması için gerekenler

- Tüm oyun kayıt anahtarlarını ve gerekli medya dosyalarını sürümlü bir kayıt paketine dahil etmek; eski paketler için geçiş sağlamak.
- İlk geri yükleme ve hesap kontrolü tamamlanmadan yeni kaydın mevcut bulut kaydını ezmesini engellemek. Çakışmalarda yerel ve uzak yedekleri koruyarak açık bir seçim/çözüm akışı kurmak.
- iCloud dış değişiklik, hesap değişimi ve kota olaylarını dinlemek; çevrimdışı kayıt ve tekrar denemeyi doğru durum bilgisiyle göstermek.
- Android projesi ve gerçek Play Games Saved Games entegrasyonunu eklemek; iOS–Android geçişi istenirse ayrıca ortak hesap/bulut hizmeti seçmek.
- Güncel web paketini native projeye senkronize edip imzalı uygulamayı derlemek. Aynı hesapla iki fiziksel cihazda yeni kurulum, çevrimdışı oynama, gecikmiş kayıt, eski-yeni sürüm, hesap değiştirme, Patile ilerlemesi ve avatar taşıma senaryolarını doğrulamak.

## Resmi kaynaklar

- [Apple: synchronize()](https://developer.apple.com/documentation/foundation/nsubiquitouskeyvaluestore/synchronize%28%29): çağrı diğer cihazda anında bulunmayı veya uzak yazmayı zorlamaz; aktarımları sistem zamanlar.
- [Apple: dış değişiklik bildirimi](https://developer.apple.com/documentation/foundation/nsubiquitouskeyvaluestore/didchangeexternallynotification): uzak değişiklik, ilk eşitleme, hesap ve kota olayları.
- [Apple: key-value tasarımı ve sınırlar](https://developer.apple.com/library/archive/documentation/General/Conceptual/iCloudDesignGuide/Chapters/DesigningForKey-ValueDataIniCloud.html): kullanıcı başına 1 MB; medya eklenirken mevcut depolama türünün boyut sınırı dikkate alınmalıdır.
- [Google: Cloud save / Saved Games](https://developer.android.com/games/pgs/savedgames): gerçek kayıt yükleme/yazma entegrasyonu ve çakışma çözümü gerekir; platform adı veya SDK'nın bulunması kendiliğinden yedekleme sağlamaz.
