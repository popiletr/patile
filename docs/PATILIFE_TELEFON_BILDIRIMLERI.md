# Telefon bildirim tercihleri ve planlama

23 Ekim 2026. Kullanıcı seçimi: Dengeli, günde en fazla üç bildirim, 22.00–09.00 sessizlik. Oyun adı için Mırıl/Pati Günleri/Pati Masalı/Minik Yuva/YuvaPati/Kutudan Yuvaya önerildi; isim seçimi henüz yapılmadı.

## Oyundaki ayarlar

Ayarlar → Saatler ve bildirim türleri. Telefon hatırlatmaları, bakım, günlük ve gelecekteki Petsgram/kargo ayrı anahtarlardır. Günlük üst sınır 1/2/3, en az aralık 1/3/6 saat, sessiz başlangıç/bitiş saati ve günlük hatırlatma saati değiştirilebilir. Varsayılan aralık üç saat, günlük saat 09.30. Saatler plan kurulurken telefonun yerel takvimine göre hesaplanır.

İlk açılışta otomatik OS izin penceresi kaldırıldı. Var olan İzin Ver düğmesi izin ister; tercih değiştirmek izin istemez. Tarayıcıdaki dosya önizlemesinde telefon servisi varmış gibi gösterilmez. Açık 10 saniyelik test düğmesi kullanıcı tarafından seçilen ayrı denemedir; normal sessiz saat/sıklık politikasının dışındadır.

## Planlama

- Bakım zamanları gerçek tokluk/su oranı, mevcut ürün süresi ve pasif tüketimden hesaplanır. İhtiyaç zaten düşükse hemen çıkış anında gönderilmez; 90 dakika sonra aday olur.
- Otomatik kapta porsiyon varken acıkma yerine sınırlı haznenin tahmini bitişi için kontrol hatırlatması planlanır. Kum dolu veya tükenmişse ilgili hatırlatma aday olur; elektrikli tuvalette yalnız kirli kullanım sayısı nedeniyle kürek bildirimi çıkmaz.
- Sabit altı saatlik özlem bildirimi kaldırıldı. Gereksiz sosyal etkileşim veya sponsor kargosu uydurulmaz. Petsgram henüz uygulanmadığından sosyal bildirim oluşmaz; gelecekte kalıcı olay listesi bağlanabilir.
- Adaylar sessiz saatin bitişine ötelenir, üç saat ara ve günlük en fazla üç sınırı uygulanır. Günlük limit bir doldurma hedefi değildir. Yedi günlük sınırlı, tek seferlik plan kurulur; sonsuz tekrar kullanılmaz.
- Önceki geçerli plan geçmişinde geçmiş zamanlı adaylar o günün sınırına sayılır. Gelecek iptal edilmiş adaylar sayılmaz. Bozuk kayıt sessizce sıfırlanmaz; işlem hata verir ve ham kayıt korunur. İşletim sisteminin gerçekten teslim ettiği zamana ilişkin sunucu makbuzu tutulmaz.
- Oyun öndeyken bekleyen bakım planı iptal edilir. Arka plana giderken son duruma göre yeniden kurulur. İzin kontrolü sırasında uygulama öne dönerse eski arka plan isteği yeniden bildirim kuramaz.
- Yeniden planlama işlemleri sıraya alınır. Önce hem NativeNotification hem Capacitor üzerindeki uygulamaya ait bakım kimlikleri iptal edilir. Native kısmi kurulum hatasında önce iptal, ardından Capacitor alternatifi denenir; aynı plan iki kanala birden bırakılmaz.

## Modüller ve kayıt

- `sprite_preview/patilife_v2/notification-policy.js`: saf tarih/sessizlik/sınır/olay planlayıcısı.
- `sprite_preview/patilife_v2/notification-settings.js`: ortak cozy modal, doğrulama ve cihaz tercihleri.
- Ana `NotificationManager`: mevcut Swift NativeNotification ve yüklü Capacitor LocalNotifications API'lerine adaptasyon; mevcut izin/test/rozet API'leri korunur.
- `patilife_notification_preferences_v1` ve `patilife_notification_ledger_v1`: cihaz yerel kaydı. Bildirim tercihleri oyuncunun altınını, eşya veya kedi ilerlemesini değiştirmez.
- Bildirim başlıkları için mevcut çizilmiş ayar ikonu kullanılır, emoji eklenmez. Nihai oyun adı seçilene kadar mevcut ad korunur; bakım başlıkları kedinin adıyla çalışır.

## Doğrulama ve sınırlar

148 JavaScript + 2 Python testi geçti. Son tercih veri tipi korumasından sonra ilgili 10 bildirim testi tekrar geçti. Saat dilimine bağlı yerel sessizlik, günlük sınır, aralık, geçmişe göre tekrar koruması, sonlu hazne, gerçek olmayan sosyal olay üretmeme, Native→Capacitor iptal/alternatif sırası, ön plana dönüş yarışı, hızlı tercih değişimi ve gerçek formdan kaydetme kapsanır. İki inline script ve üç modül sözdizimi kontrolünden geçti.

Web paketi 392 dosya / 195.1 MiB. Önceki dağıtım `backups/www-before-build-fr20zue0/www` içinde. Native Swift dosyaları bu işte değiştirilmedi. Native derleme/senkronizasyon ve gerçek telefonda izin, kilit ekranı, arka plan, ses ve teslimat kabulü yapılmadı. Planlanan saat OS güç/odak ayarları nedeniyle gerçek teslim saati garantisi değildir. Uygulama kapalıyken saat dilimi değişirse mevcut tek seferlik plan sonraki açılışta yerel saate göre yenilenir.
