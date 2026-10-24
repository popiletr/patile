# 23 Ekim 2026 — boş sahne ve açılış sırası hatası

Kullanıcının konsol görüntüsü asıl hatayı gösterdi: `household.js:13 Cannot read properties of undefined (reading lifeV2)`. Önceki önbellek açıklaması doğrulanmış neden değildi. Ana oyun `loadGameState` ve `ClassicLife.init` sırasında HUD'u yeniler. Yeni tuvalet rozeti `Household.status()` çağırdığı anda ev modülünün kendi game/manager/api değişkenleri henüz init edilmemişti. `ClassicLife.init` içindeki çağrı onload'u kestiğinden Chrome kulakçıkları, ikon hazırlama ve arka plan sahnesi kurulamıyordu. Sözdizimi kontrolü bu yaşam döngüsü hatasını yakalayamaz.

## Düzeltme

- Household.status artık açıkça verilen GameState ve DecorManager üzerinden salt okunur çalışır; ev modülü henüz init edilmemiş olsa da güvenlidir. Seçili kum kabı araması eksik modül bağlamını da kaldırır. HUD ve AI gerçek güncel bağlamı geçirir.
- Runtime.initChrome her yeni açılışta iki çekmeceyi kapatır. Eski açık çekmece tercihi otomatik açılışa neden olmaz. Kulakçıklar tıklanınca açılır; aynı anda iki çekmece açılmaz.
- Aynı `sprite_preview/patilife_app.html` yolu korunur. Kayıt dosya adı/anahtarları değiştirilmedi. Oyuncu verisi silinmedi.
- İkincil önlem: scripts/stamp_web_revision.py HTML ve JS/CSS/JSON içeriğinden sürüm üretir. 28 yerel script/stil bağlantısı aynı revision sorgusunu taşır. Runtime sonradan yüklenen script/stil/prefetch adreslerine de aynı sürümü ekler. Normal build/build:web bunu günceller, build:check güncelliğini kontrol eder. Ana HTML dosyasına farklı URL veya kopya isim verilmez.

## Doğrulama

157 JavaScript + 4 Python testi geçti. Yeni başlatma testi mevcut lifeV2.household kaydıyla gerçek onload, ClassicLife, Home, Household, Runtime ve HUD fonksiyonlarını birlikte yürütür. HUD ev modülünden önce yenilenir; ikon hazırlama çağrısı, sprite hazırlama, gerçek arka plan URL'si, oyun döngüsü ve lifecycle kurulumuna ulaşıldığı denetlenir. İki menünün kapalı başlaması ve tıklamayla karşılıklı açılması; para, isim, kalan kum/kirlilik korunması da kontrol edilir. Bu test sentetik DOM kullanır; bitmap I/O ve cihaz hizmetleri gerçek tarayıcı değildir.

Sürüm üretiminin kararlı olması, modül değişince güncellenmesi, aynı giriş ve kayıtların korunması, lazy script/stil adresi denetimleri eklendi. build:check geçti. Web paketi 392 dosya / 195.1 MiB; 89 kaynak dosyası www ile birebir aynı. Önceki dağıtım backups/www-before-build-cny4jc1u/www içinde. Bu paket revision: c3a27f6a28a1.

Canlı tarayıcı erişimi denenmedi; önceki erişim reddi alternatif araçla aşılmadı. Kullanıcının aynı mevcut sekmede sayfayı bir kez tam yenilemesi gerekir. Verilerin korunması için tarayıcı depolamasını temizleme yönlendirmesi yapılmaz.
