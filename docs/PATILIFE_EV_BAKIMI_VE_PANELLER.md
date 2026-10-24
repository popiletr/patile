# PatiLife — ev bakımı, eşya düzenleme ve ortak paneller

## Son geri bildirim: kürek oyunu ve çizilmiş modal ikonları

Manuel tuvalette anlık Temizle işlemi kaldırıldı. Açık/kapalı/büyük kapalı kaplarda mevcut kürek oyunu açılır: kürekle beş topak bulunur; hepsi toplanınca bir kez temizlik kaydı, 5 altın ve 25 XP uygulanır. Kapatmak sonuç üretmez, eski tamamlanma zamanlayıcısı kapatılmış oyunu ödüllendiremez. Kalan kum miktarı korunur; eski iki temizlikte zorunlu dolum modern kayıtta çalışmaz. Elektrikli model otomatik temizler, kürek oyununa girmez. Her açılışta pointer dinleyicisi biriktirme kaldırıldı; tek mevcut pointer olayı atanır. Canvas parçacıkları 70 ile sınırlı, kapanışta RAF iptal edilir.

Kum modalında mevcut modelin çizimi, kalan kullanım/kirlilik ve ikonlu eylem kartları var. `game-icons.js` ortak modal başlıkları, kategori/oda sekmeleri ve sonradan yüklenen oyun modallarına aynı 12 çizilmiş ikonu bağlar. Yeni görsel başlıklar ve kürek oyununun küçük ekran ölçüleri `game-icons.css` içindedir. Bu bir canlı cihaz görsel kabulü değildir.

### modal-icons

Araç: yerleşik image_gen.imagegen, şeffaf PNG.

Kaynak: `/Users/nazmi/.codex/generated_images/01a16550-2f4e-7f83-ac70-34ef2988a71d/exec-bba7f418-2cc6-43f8-8dff-d06e1fec828f.png`

Projede: `sprite_preview/patilife_v2/assets/modal-icons.png`

Tam prompt:

```text
Use case ui-mockup. Production transparent PNG game icon atlas for cozy cartoon cat game PatiLife. EXACTLY FOUR COLUMNS and THREE ROWS, twelve separate square cells with generous transparent gutters. Warm brown outlines, softly painted cream sage peach pink pastel, chunky hand drawn storybook mobile game icons readable at32px. No text, no letters, no emoji, no external card or background. Row1 left to right: friendly cream orange CAT PAW with little heart; rolled DAILY JOURNAL scroll with small pencil; PHOTO ALBUM with cat silhouette on cover; warm golden TROPHY with paw medallion. Row2: tiny cozy HOUSE with cat doorway; canvas SHOPPING BAG with tiny paw print; shallow FOOD BOWL with brown kibble; turquoise WATER DROP beside small dish. Row3: peach LITTER TRAY with sage slotted SCOOP leaning over it, no gross waste; brass SETTINGS GEAR; pink HEALTH HEART with small bandage; peach YARN BALL with sage feather wand. All twelve centered whole icons, consistent scale, no clipping. Real transparent alpha background.
```


23 Ekim 2026. Ana giriş: `sprite_preview/patilife_app.html`. Mevcut ev, kamera, oda anahtarları, kazanımlar ve para korunur.

## Uygulanan sistem

- Envanter, yeni eşya satın alma ve ev bakım ekranları aynı krem renkli sheet ailesindedir. Eski ayarlar, market, profil ve oyun modal kartları da ortak başlık/Kapat, yüzey, kenarlık ve boyut kurallarını kullanır. Yeni market odaya göre filtrelenir ve on eşyalık sayfalara ayrılır.
- Düzenleme çubuğu dar ekranda sarılır; onay düğmesi tam genişliktedir. Başlangıç minderi ve kum kabı gerçek envanter nesnelerine bir kez taşınır. Taşı, Kaldır ve yeniden Yerleştir kullanılabilir. Minder kaldırılınca görünmez yatağa uyuma engellenir; gerçek taşınmış yatak seçilir.
- Bakım solda, Oyun sağda; etiketler kenardan ayrılmaz, dikey harfli ve çizilmiş iki küçük ikonludur. Panel açılınca içerik etiketten içeri açılır. İhtiyaç satırında ikon tekrarları kaldırıldı, eşit beş sütun ve ayrı yüzde alanları var. Okuma alanının görünen adı Kütüphane oldu, kayıt anahtarı `reading` kaldı.
- Haritadaki yüksek yüzeylerde merkez/yaklaşık yükseklik yerine kedinin ayak x koordinatındaki ön kenar hesaplanır. Eğim boyunca yürüyüşte temas güncellenir. Dar yüksek direkler basılabilir platform sayılmaz. Gerçek oda görsellerinin tamamında cihaz kabulü yapılmış değildir.
- Dört görünüşün üç yaşı için koklama, çömelme ve iki örtme karesi: 48 yeni kedi karesi. Açık kapta kedi görünür; kapalı kapta içeri girip çıkar. İşlem 5,5 saniye sonra tamamlanır, oda değişirse sonuç yazılmaz. Elektrikli modelin iç tamburu için dört ayrı temizlik karesi vardır.
- Açık, kapalı, büyük kapalı ve elektrikli tuvalet: temiz/kirli sekiz kare. Üç yükseltme sırasıyla 3 kullanım/3 aktif gün, 12 kullanım/7 gün, 30 kullanım/14 gün ve alınmış başarım ödülü ister. Manuel kap dört kirli kullanımdan sonra temizlenir. Kum toplam sekiz kullanım, elektriklide dolum başına on iki kullanım sürer; 20 altınla yenilenir. Otomatik temizlik kum üretmez.
- Mama dört kalite: ekonomik 3 altın/+40/4 saat, dengeli 8/+60/6 saat, kaliteli 18/+85/12 saat, özel bakım 35/+100/24 saat. Keyif/sağlık etkileri ayrı tanımlıdır. Ücretsiz musluk suyu, 8 altın filtreli su, 20 altın uzun tazelik suyu korunur. Bunlar gerçek hayvan sağlığı önerileri değil oyun kurallarıdır.
- Oyun içi mide hassasiyeti tek öğünden olmaz: en az üç farklı tarihte tekrarlı ekonomik mama, en az beş birikmiş öğün ve 80 altında sağlık gerekir. Veteriner desteği 35 altın; iyileşme dengeli bakım ile devam eder. Durum profilde ve ruh hâlinde görünür.
- Otomatik kaplarda altı, akıllı kaplarda on porsiyon hazne var. Dolumda ücret bir kez ödenir, servis ücret almaz. İhtiyaç 50 altına inince uygun zamanda bir porsiyon kullanılır; dolum zamanları kaliteyle değişir. Çevrimdışı hesap yalnız kalan porsiyonlar kadar ilerler, yeniden yüklemede aynı porsiyonlar tekrar harcanmaz. Eski ücretli otomatik yemleme kalan zamanı sınırlı porsiyona çevrilir. Hazne bitince Mama ekle/Su ekle uyarısı, kum bitince Yeni kum ekle uyarısı çıkar.
- Katalog 56 eşya: sekiz odaya özel birer yeni etkileşimli eşya. Dört oyuncak ailesinin dört hareket karesi toplam 16 kare; yalnız etkileşim sırasında çalışır. Tüm oda varyantları ayrı özgün çizim değildir; aynı dört atlas ailesini kullanır. Ev eşyaları kullanım, keyif, dinlenme, temizlik, gözlem veya bağ kayıtlarına bağlıdır.

## Sınırlar ve doğrulama

Sentetik DOM ve saf kurallar testleri gerçek işlem fonksiyonlarını çağırır: taşınmış minder/kum kabı, açık-kapalı tuvalet, yarım kesilen işlem, envanter satın alma/oda seçimi, tek ücret, ücretsiz su, sonlu stok/çevrimdışı tekrar koruması, zamana yayılan sağlık ve yükseltme. PNG metaverisi 76 yeni oyun karesinin sınırlarını denetler. Canlı tarayıcı erişimi önceden reddedildiği için bu çalışma gerçek cihaz görsel kabulü veya FPS ölçümü içermez. Petsgram ve önerilen üç yeni mikro oyun bu pakette uygulanmış değildir.

## Görsel üretim kaydı

Araç: yerleşik `image_gen.imagegen`; şeffaf arka plan. Kaynak PNG'ler düzenlenmeden kopyalandı. Python yalnız alfa bileşenlerini okuyup kare koordinatlarını çıkardı; görsel üretmedi veya değiştirmedi. İkonlar önceki doğrudan kullanıcı çizim talebi kapsamında üretildi; arayüze emoji eklenmedi.

### edge-tabs

Kaynak: `/Users/nazmi/.codex/generated_images/01a16550-2f4e-7f83-ac70-34ef2988a71d/exec-3085eff2-5c0e-4179-9c4d-169afc444028.png`

Projede: `sprite_preview/patilife_v2/assets/edge-tabs.png`

Tam prompt:

```text
Use case ui-mockup game icon asset. Transparent PNG sprite atlas with EXACTLY TWO equal square cells in ONE row, wide 2:1 image. Left a tiny soft peach cat paw gently holding a sage grooming brush, representing CARE. Right a pink yarn ball with a tiny peach feather wand, representing PLAY. Cozy flat hand drawn mobile game style, warm brown clean outlines, pastel cream sage peach, centered easily readable at 20 pixels, no external tile background or shadow, each isolated complete drawing with generous transparent padding. No text, no letters, no numbers, no emoji.
```

### toilet-upgrades

Kaynak: `/Users/nazmi/.codex/generated_images/01a16550-2f4e-7f83-ac70-34ef2988a71d/exec-599761b6-c2e3-4517-aee8-4612c3397c76.png`

Projede: `sprite_preview/patilife_v2/assets/toilet-upgrades.png`

Tam prompt:

```text
Transparent RGBA game sprite atlas, exactly FOUR columns and TWO rows, EIGHT isolated objects, no text or backgrounds. Same cozy PatiLife pastel cream sage peach cartoon style with warm brown outlines, simple rounded shapes and 3/4 top view. Top row four cat litter toilets left to right: shallow OPEN peach litter tray with clean beige litter and NO lid; compact sage covered cat toilet with arched entrance; LARGE cream covered toilet with roomy doorway; rounded sage ELECTRIC self-cleaning cat toilet with drum opening and small blank indicator. Bottom row same four designs and same exact outlines/scale, with a few subtle brown litter clumps inside or by the entrance (no gross waste). Equal square cells with at least12 percent transparent gutters. No cats, people, writing, grid lines or floors. All8 cells fully visible.
```

### room-toys

Kaynak: `/Users/nazmi/.codex/generated_images/01a16550-2f4e-7f83-ac70-34ef2988a71d/exec-8792aabd-4f30-40bf-8808-76ea8f6dbf9f.png`

Projede: `sprite_preview/patilife_v2/assets/room-toys.png`

Tam prompt:

```text
Transparent PNG GAME ANIMATION atlas with exactly FOUR columns and FOUR rows, sixteen isolated objects total, equal square cells. Each COLUMN is one cozy interactive cat furnishing in four animation frames arranged top to bottom: column1 sage butterfly mobile toy on a small warm wooden stand, wings/resting angle change gently across rows; column2 apricot spring-mounted fabric mouse on round cream base, bends left/upright/right/upright; column3 pastel cardboard rolling treat puzzle with sage ball at different positions in its track, identical housing; column4 tiny cream automatic feather toy with sage spinning top and peach feather at four angles, identical base. Warm brown outlines, soft flat pastel cozy cartoon style, no cats, no people, no words, no numbers, no floor/background. Same size and baseline within each column. At least12 percent transparent spacing around every object, ALL16 distinct cells must be visible.
```

### toilet-kitten

Kaynak: `/Users/nazmi/.codex/generated_images/01a16550-2f4e-7f83-ac70-34ef2988a71d/exec-bed80b7d-2283-48df-9b6a-25e1674dc493.png`

Projede: `sprite_preview/patilife_v2/assets/toilet-kitten.png`

Tam prompt:

```text
Transparent PNG cat ANIMATION sprite atlas for PatiLife. EXACTLY FOUR equal square columns by FOUR equal square rows:16 cats, no extra rows, each full isolated cat with12 percent transparent gutter, no text, no grid or background. Match the reference character's simple chibi cartoon warm brown outline, flat cream and pastel shading, avoid realism. ALL CATS ARE TINY KITTENS with large heads and small round bodies. Every column is a consistent coat across all4 rows: column1 ORANGE TABBY sarman with cream chest; column2 GRAY TABBY tekir with cream chest; column3 BLACK WHITE TUXEDO smokin; column4 CALICO cream with orange and dark patches. Every cat faces 3/4 RIGHT. ROW1 sniffing floor with head lowered and front paw raised; ROW2 natural litter toilet squat with hind legs bent, tail held slightly aside, neutral calm face; ROW3 digging and covering litter with one FRONT paw reaching forward and head watching paw; ROW4 same digging pose with other FRONT paw extended as alternating motion. No litter box or props drawn; the game supplies the litter tray. No visible waste, no anatomy detail, no accessories. Keep a consistent feet baseline and coat markings within each column. Every full cat fits completely within its cell. Same cartoon art as reference.
```

### toilet-young

Kaynak: `/Users/nazmi/.codex/generated_images/01a16550-2f4e-7f83-ac70-34ef2988a71d/exec-11a3e5ad-ffff-420e-a972-d4408b94311e.png`

Projede: `sprite_preview/patilife_v2/assets/toilet-young.png`

Tam prompt:

```text
Transparent PNG cat ANIMATION sprite atlas for PatiLife. EXACTLY FOUR equal square columns by FOUR equal square rows:16 cats, no extra rows, each full isolated cat with12 percent transparent gutter, no text, no grid or background. Match the reference character's simple chibi cartoon warm brown outline, flat cream and pastel shading, avoid realism. ALL CATS ARE YOUNG cats with medium head to body proportions. Every column is a consistent coat across all4 rows: column1 ORANGE TABBY sarman with cream chest; column2 GRAY TABBY tekir with cream chest; column3 BLACK WHITE TUXEDO smokin; column4 CALICO cream with orange and dark patches. Every cat faces 3/4 RIGHT. ROW1 sniffing floor with head lowered and front paw raised; ROW2 natural litter toilet squat with hind legs bent, tail held slightly aside, neutral calm face; ROW3 digging and covering litter with one FRONT paw reaching forward and head watching paw; ROW4 same digging pose with other FRONT paw extended as alternating motion. No litter box or props drawn; the game supplies the litter tray. No visible waste, no anatomy detail, no accessories. Keep a consistent feet baseline and coat markings within each column. Every full cat fits completely within its cell. Same cartoon art as reference.
```

### toilet-adult

Kaynak: `/Users/nazmi/.codex/generated_images/01a16550-2f4e-7f83-ac70-34ef2988a71d/exec-8be1b8d5-4333-452d-83f3-fd1b7fe633fb.png`

Projede: `sprite_preview/patilife_v2/assets/toilet-adult.png`

Tam prompt:

```text
Transparent PNG cat ANIMATION sprite atlas for PatiLife. EXACTLY FOUR equal square columns by FOUR equal square rows:16 cats, no extra rows, each full isolated cat with12 percent transparent gutter, no text, no grid or background. Match the reference character's simple chibi cartoon warm brown outline, flat cream and pastel shading, avoid realism. ALL CATS ARE ADULT cats with fuller slightly longer bodies and smaller head proportions. Every column is a consistent coat across all4 rows: column1 ORANGE TABBY sarman with cream chest; column2 GRAY TABBY tekir with cream chest; column3 BLACK WHITE TUXEDO smokin; column4 CALICO cream with orange and dark patches. Every cat faces 3/4 RIGHT. ROW1 sniffing floor with head lowered and front paw raised; ROW2 natural litter toilet squat with hind legs bent, tail held slightly aside, neutral calm face; ROW3 digging and covering litter with one FRONT paw reaching forward and head watching paw; ROW4 same digging pose with other FRONT paw extended as alternating motion. No litter box or props drawn; the game supplies the litter tray. No visible waste, no anatomy detail, no accessories. Keep a consistent feet baseline and coat markings within each column. Every full cat fits completely within its cell. Same cartoon art as reference.
```

### toilet-cleaning

Kaynak: `/Users/nazmi/.codex/generated_images/01a16550-2f4e-7f83-ac70-34ef2988a71d/exec-3f37afaf-d40e-4012-a73a-dee2a305dfcf.png`

Projede: `sprite_preview/patilife_v2/assets/toilet-cleaning.png`

Tam prompt:

```text
Transparent RGBA game animation atlas with exactly FOUR equal square cells in ONE row, a4:1 horizontal image. Reference is the rounded sage electric self-cleaning litter toilet in the RIGHTMOST column of the supplied image. Draw ONLY that same electric toilet in each cell, same full outer shell, dimensions, perspective and feet baseline. Four cleaning animation frames: inner drum/rake starts at0degrees, rotating grate at45degrees, at90degrees, and returns to clean upright0degrees with tidy beige litter. The outer casing must not rotate; only the inner circular grate and sand shift. Warm brown outlines, cream sage pastel cozy cartoon style exactly like reference. No cats, no waste closeups, no lettering, no numbers, no background or floor.12percent transparent margins per cell, all four complete appliances entirely visible and separate.
```


