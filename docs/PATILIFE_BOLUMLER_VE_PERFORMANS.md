# PatiLife — Bölümler, çizgi roman ve yükleme düzeni

23 Ekim 2026. Ana oynanış hâlâ kullanıcının ilk panoramik oyunudur. Bu çalışma onun kamera, mapping, bakım ve mini oyunlarını koruyarak yapılmıştır.

## Oyun akışı

Yeni oyuncu yağmurlu yürüyüş, dört yavruyla karşılaşma ve hepsinin sahiplenilmesini ayrı çizgi roman karelerinde görür. Dört kedi kartından birini seçer, adını verir, diğer üçünün arkadaşlarla gittiğini görür. Ardından ilk motorun evine yönlenir. Eski oyuncunun kimliği veya birikimi bu hikâyeyi göstermek için sıfırlanmaz; kedi profilindeki Hikâyemiz altı sahnenin tamamını yeniden açar.

İlk gün yedi adımdır: taşıma çantasını açıp bekleme; ücretsiz normal suyu seçme ve gerçek içişin tamamlanması; mama seçimi ve gerçek yeme; yatağını tanıtıp dinlenme; sevme; yumakla tamamlanmış oyun; kamera/odalar/iki menünün tanıtımı. Rehber su, mama, dinlenme, sevme ve oyun kaydını bekler. Uyurken sonraki sahneye atlamaz. Daha sonra ile bırakılınca ödül verilmez; profilden kaldığı adıma dönülebilir. Tamamlandığında ilk gün anısı bir kez yazılır. Daha önce tamamlanan rehber yeniden izlenebilir; anı çoğalmaz.

Kedim sayfası seçilen kedinin çizimini, bağ notunu ve üç dönemli büyüme yolunu gösterir. Günlük olay kartpostalı ve üç küçük görev kartıdır; tamamlanan görevler boş, gri düğmelere dönüşmez. Albüm tarihli resimli anı kartlarıdır. Başarımlar mevcut dört kartlık koleksiyon düzenini korur.

## Yeni odalar

| Oda | Açan başarım | Giriş hikâyesi |
| --- | --- | --- |
| Kış bahçesi | Birlikte rahatız, 24 bağ; başarım ödülü alınmalı | Pencere önündeki sakin alışkanlıktan yeni güneşli köşeye |
| Oyun tavanı | Üç farklı günde oyun; başarım ödülü alınmalı | Birlikte oyun için eski kutuların toplandığı tavan arası |
| Okuma odası | Yedi farklı günde yan yana; başarım ödülü alınmalı | Okurken de yanında olan dost için sessiz bir köşe |

İlk girişte kısa oda hikâyesi gösterilir ve bir kez albüme eklenir. Odalar aynı 2200 birim panoramik kamerayı kullanır. Geniş açık zeminleri mapping'e eklendi. Taşınabilir 44 katalog eşyası bu odalara da yerleştirilebilir; dört kum/tuvalet eşyası banyo düzeninde kalır. Kilit, envanterin yerleştirme işleminde de denetlenir. Mevcut beş oda ve eski eşyalar korunur; önceki bahçe ilerleme koşulu devam eder.

## Arayüz

Bakım ve Oyun artık sağdaki iki kulakçıkla ayrı ayrı açılır; aynı anda yalnız biri açıktır. İkisi de sağa kayarak kapanır. Son tercih saklanır; kapalı denetimler pointer ve klavye odağından çıkarılır. Eski mama, su, banyo, uyku, sevme, tırmalama, kum ve mini oyun düğmeleri bu çekmecelerde kalır.

Üst panel seçilen kedinin çizimini, adını, gerçek büyüme dönemini ve bağını gösterir. Ana ekranda cinsiyet/kişilik rozet yığını kaldırıldı; ayrıntılar profildedir. Tokluk, Su, Keyif, Enerji ve Tuvalet göstergeleri okunabilir yüzdeyle sunulur; dokununca ilgili bakım açılır. Günlük ve Ayarlar düğmelerinin açıklama yazısı var. Yeni simge veya emoji kullanılmadı.

## Yükleme ve çalışma sınırları

- Patile ekranı `pages/patile.html` kaynağı ve bundan derlenen `pages/patile-page.js` olarak ayrıldı. Yerel file:// ve paketli WebView içinde fetch zorunlu olmadan bölüm yüklemek için JS içinde inert HTML taşınır. Motor `pages/patile-engine.js` dosyasındadır. DOM ve fizik yalnız oyuna girince başlar; özgün tahta ve puan kayıtları korunur.
- Runtime hafif çizgi roman, günlük ve sayfa tanımlarını boş zamanlarda tek tek hazırlar. Fizik motoru için ön indirme ipucu verir; fizik başlamaz. Desteklenmeyen tarayıcıda ön indirme zorunlu değildir, isteğe bağlı yükleme yine çalışır. Ağ yükü gecikse de kuyruk aynı anda birçok sayfa başlatmaz.
- Matter ve yüksek seviye/donmuş Patile dokuları ilk ev açılışında yüklenmez. İlk Patile başlangıcında üç temel doku istenir; diğerleri sahnede ihtiyaç olduğunda alınır. İlk motorun kullanılmayan eski kedi sprite sayfaları topluca ön yüklenmez; modern çizici seçilen kedinin gerekli atlasını açar.
- Aktif olmayan oda arka planları açılış CSS'inden çıkarıldı. Odaya girildiğinde arka plan atanır. Gizli menü ve sayfa img etiketleri async/lazy işaretlidir.
- Eve dönünce Patile'nin fizik ve parçacık RAF döngüleri iptal edilir, tahta kaydı istenir. Tekrar girişte aynı motor devam eder; ikinci bir fizik motoru kurulmaz. Gizli belge, başka oyun veya günlük/çizgi roman açıkken ev sahnesi çizilmez ve kedi AI dolaşmaz. Dekorlar her RAF karesinde yeniden çizilmez; animasyon adımında güncellenir.
- Yerleşik reklam ve bulut hizmetleri mini oyunun yüklenmesine bağlanmadı; `native-services.js` ayrıdır. Buluta ana kaydın tamamı, lifeV2 ve yeni oda/rehber ilerlemesi dahil gönderilir. Yeni alanı bulunmayan eski bulut kaydı mevcut lifeV2'yi silmez.

Bu değişiklikler gerçek cihazda sabit FPS garantisi değildir. 104 JavaScript + 2 Python kontrolü geçti. Gerçek yerel Matter motorunu kullanan DOM benzetimi başlatmanın bir kez yapılmasını, yalnız üç başlangıç dokusunu ve çıkışta iki RAF döngüsünün iptalini doğruladı. Ayrı kontroller gerçek bakım kayıtlarıyla öğretimin ilerlemesini, uyku beklemesini, tek anıyı, oda/yerleştirme kilidini, menülerin kapanmasını ve ortak kaydın korunmasını kapsar. Canlı tarayıcı/telefon yerleşim kabulü ve FPS ölçümü yapılmadı. Native iOS senkronizasyonu ve Android derlemesi yapılmadı.

## Görseller ve tam üretim promptları

Araç: built-in image_gen; iki çağrıda da `transparent_background: false`. Referanslar üretimden önce görüntülendi. PNG'ler kopyalandı; kodla görüntü kesme, yeniden çizim veya resim düzenleme yapılmadı. CSS, atlasın ilgili bölümünü gösterir.

Çizgi roman son dosyası: `/Users/nazmi/Widget Uygulaması/sprite_preview/patilife_v2/assets/comic-chapters.png` (1024 × 1536, 2 sütun × 3 satır). Kaynak: `/Users/nazmi/.codex/generated_images/01a16550-2f4e-7f83-ac70-34ef2988a71d/exec-59d39035-df1e-4494-8e37-df19858c23ee.png`. Referanslar: `assets/opening-cartoon.png` (karakter/çizgi dili), `sprite_preview/sahneler/salon.jpg` (mekân stili).

Use case: illustration-story. PatiLife cozy cartoon mobile game comic atlas, portrait image, EXACTLY 2 columns and 3 rows of SIX equally sized SQUARE panels touching edge to edge, no gutters, no panel frames, no text, no letters, no speech balloons, no emoji. Match reference pastel children's cartoon and warm brown contours, the same four young adult friends in beige sweater, green coat, pink sweater with hair bun, and blue hoodie. Read left to right, top to bottom. Panel1: four friends walking under umbrellas on rainy village street, hearing something, no kittens visible. Panel2: close view under dry shop awning, a cardboard box containing exactly FOUR cute tiny kittens orange cream tabby, brown tabby, black-white tuxedo, orange-black-white calico, curious but safe. Panel3: all four friends each gently carrying ONE different kitten wrapped safely in blanket under umbrellas, empty cardboard box visible behind them, every kitten is adopted. Panel4: cozy home entrance, hands gently setting down closed beige pet carrier on a mat, no visible cat, rain behind window. Panel5: close hands placing ceramic food bowl and a separate water bowl on clean wooden floor, no cat, no litter box. Panel6: calm warmly lit safe sleeping corner with soft sage bed, scratch post and yarn toy, no cat, plenty of floor space. The panels must have distinct staging and camera angles, narrative visual action, NOT six copies of one scene. Panels4-6 deliberately have no visible cat so selected animated game cat can be overlaid. Reference image1 character and illustration style, reference2 room style. Complete artwork to each cell edge, no white margins.

Oda atlası son dosyası: `/Users/nazmi/Widget Uygulaması/sprite_preview/patilife_v2/assets/room-chapters.png` (1254 × 1254, üç yatay panorama). Kaynak: `/Users/nazmi/.codex/generated_images/01a16550-2f4e-7f83-ac70-34ef2988a71d/exec-e13c6a19-d465-48bd-b763-c4268a060e69.png`. Referans: `sprite_preview/sahneler/salon.jpg` (mekân stili).

Use case: stylized-concept. A game background atlas for PatiLife cozy cartoon mobile cat home, EXACTLY ONE column and THREE equally tall horizontal PANORAMIC scenes stacked vertically edge to edge, each scene 3:1 very wide panorama. Overall square image. Each scene must span the entire width with continuous wall-floor perspective, NO gutters, no frame, no words, no logos, no emoji, no cats or people. Match reference pastel watercolor-flat cartoon, warm brown outlines, sage cream peach palette. Top third: SUNROOM, enclosed safe glass veranda, soft morning light, green window frames, plants safely on shelves at far sides, low woven chair on far right, cream rug, entire bottom 28 percent clear warm plank floor for game cat and player furniture, wide central open space. Middle third: ATTIC PLAY LOFT, cozy sloping wooden ceiling with skylight and soft garland lights, a few built-in low shelves at edges, peach walls, wide clear central room, bottom28percent clear warm plank floor, no loose toys or cat furniture as player places own. Bottom third: READING ROOM, warm small library with bookshelves at far left and right, bay window center, small sage armchair at far right, amber afternoon light, bottom28percent clear wooden floor, empty central zone for player furniture. Three distinct rooms in same house, gentle flat game perspective, floor line height and image scale identical in all three. No blocked walkways, no stairs, no trapdoors. These are final usable room backgrounds, not thumbnails or UI mockups.

Yedek: `backups/patilife-before-chapters-20261023.tar.gz`. Önceki www dağıtımı ayrıca `backups/www-before-build-qvks_ggs/www` içinde. Güncel web paketi 365 dosya / 175.0 MiB; bu dosyaların tamamı ilk açılışta indirilen veya decode edilen kaynak anlamına gelmez.
