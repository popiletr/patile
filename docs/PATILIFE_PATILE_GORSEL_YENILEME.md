# Patile — suluboya görsel yenileme

23 Ekim 2026.

Tam önceki sürüm yedeği: [original-design.tar.gz](/Users/nazmi/Widget Uygulaması/backups/patile-visual-before-20261023-214912/original-design.tar.gz). Arşiv; ana giriş, Patile kaynakları, eski CSS, çalışma zamanı ve suika_game içindeki tüm eski görselleri içerir. Eski varlıklar yerlerinde de korunur.

Oyun menüsündeki altı kart aynı 76 × 88 piksel ölçüyü ve 40 piksel ikon alanını kullanır. Patile ilk sıradadır ve Önerilen alt yazısı taşır. Menü açıldığında son 24 saatte Patile oynanmamışsa en fazla 24 saatte bir kısa öneri gösterilir; oyun kendiliğinden açılmaz. Öneriler mevcut bildirim/balon alanını kullanır. Menünün yatay kaydırması açılışta başa alınır.

Görsel katman: `sprite_preview/patilife_v2/patile-theme.css` ve `patile-theme.js`. Patile açılırken yüklenir. Yeni arka plan, 12 normal parça ve 12 donmuş görünüm, kontrol/joker ikonları, HUD, kavanoz, sonraki parça askısı, evrim şeridi, yıldızlar, harita ve tüm sonuç/onay/ayar pencereleri krem, şeftali, adaçayı ve sıcak kahverengi palete uyarlandı. Donmuş parçalarda buz rengi, çerçeve ve kristal çizgileri yalnız çizim aşamasında eklenir.

Önceki Patile DOM parçası ve classic-shell.css içindeki Patile yerleşim kuralları değişmedi. Ana oyundaki artık kullanılmayan dikey menü kuralları sonraki temizlikte kaldırıldı. Motorun tek farkı resim yollarının görsel eşleyiciden geçmesidir; bu eşleyiciyi çıkartınca eski motorun SHA-256 değeri birebir elde edilir. Fizik yarıçapları, ölçekler, skorlar, hedefler, seviyeler, joker işlevleri, tıklama alanları ve kayıt anahtarları korunur. Yeni parçalar önceki PNG'lerin ölçüleri ve alfa sınırları içine ortalanarak sığdırılır. Görsel değişikliği için ödül ekonomisine dokunulmadı.

Kontroller: motorun metin özdeşliği, eski Patile DOM/yerleşim kurallarının özdeşliği, tüm görsel eşlemeler, kaynak ölçülerine oturma, kontrol konumlarını değiştiren CSS bulunmaması, ilk sıra ve önerinin günlük sınırı test edilir. Canlı tarayıcı erişimi önceki aşamada reddedildiği için gerçek tarayıcı/cihazda görsel kontrol yapılmadı; üretilen üç resim ayrıca incelendi.

## Üretilen varlıklar

Yerleşik image_gen kullanıldı; atlaslar çalışma anında çizilir, üretilen kaynak PNG'ler değiştirilmedi.

- `sprite_preview/patilife_v2/assets/patile-room-watercolor.png`
- `sprite_preview/patilife_v2/assets/patile-control-icons.png`
- `sprite_preview/patilife_v2/assets/patile-piece-sprites.png`

## Tam üretim tanımları

### background

Portrait 9:16 background illustration for a cozy hand painted watercolor cat puzzle game. Warm cream room, pale sage and blush paw pattern wallpaper, wooden floor at bottom 20%, linen curtained window at far left edge, small leaves at far right edge. Main central 75 percent of image is very pale nearly blank cream wall, extremely low contrast, for overlaying a transparent game jar. No characters, no game pieces, no interface, no words, no frames. Match a soft storybook watercolor virtual pet game with warm fine brown outlines, matte paper texture, pastel peach cream sage. Full opaque background.

### controls

ONE transparent square game icon atlas, exactly FOUR equal columns by THREE equal rows. Every individual icon MUST be entirely inside the central 55 percent of its own grid cell, separated by broad transparent gutters. Match cozy storybook watercolor cat game, matte cream peach sage, warm fine brown ink outlines. No glossy plastic, no text, no emoji, no labels, no cell outlines. Row1 left to right: a tiny cottage home; a curved wooden restart arrow; a wooden gear; a golden paw coin. Row2: a cream cat paw pointing down; a wooden X close button; a gold five pointed star; a sleepy disappointed calico kitten face. Row3: a soft peach cat paw slap powerup; a sage swirling leaf tornado powerup; two opposing curved wooden arrows for swapping; a little silver drop token falling with two small motion lines. Fully transparent background outside objects. Consistent visual size. Twelve distinct game interface icons.

### pieces

ONE transparent square sprite atlas, exactly FOUR equal columns by THREE equal rows, equal square cells. Each object entirely inside central 65 percent of its cell with large transparent gutters. These are twelve merging puzzle game pieces, a readable roughly circular compact silhouette for each. Soft hand painted watercolor storybook virtual cat game, warm dark brown ink outline, cream peach sage soft golden palette, matte paper texture, no glossy 3D. Row1 left to right: a peach yarn ball with tiny short tail; a golden cat collar bell with sage bow; a small cream milk bottle with peach cap; a curled pale blue fish toy. Row2: a curled sage cloth toy mouse with short tail; a compact round salmon cat food tin with no words; a round roast chicken drumstick; a round seated cute calico king kitten with small golden crown. Row3: a compact small cat scratching tree with cream round platform and sage base; a compact plush peach royal armchair; a round seated cream princess kitten with tiny peach tiara; a round seated regal charcoal calico cosmic emperor kitten with small sage gold celestial crown. No text, no numbers, no emoji, no frames, no ground shadow beyond each object, no overlaps. All twelve objects visually distinct. Actual transparent background.


## Yerel dosya açılışı ve ilk çizim düzeltmesi

Patile atlasları `file://` üzerinden Image ile yüklenip canvas.toDataURL çağrıldığında tarayıcının kaynak güvenliği engeline takılabiliyordu. Atlasların PNG baytları `patile-art-data.js` içinde veri adresi olarak paketlendi; yalnız Patile açılırken yüklenir. Böylece çizim kaynakları dosya kökenine bağlı kalmaz. Kaynak PNG değişince `python3 scripts/bundle_patile_art.py` çalıştırılır; `--check` paket ile PNG baytlarının eşleşmesini doğrular.

Bakım ve Oyun menüleri statik HTML içinde hidden/inert olarak başlar. Başlıktaki küçük ilk çizim kuralı harici stiller ve JavaScript yüklenmeden menüleri kapalı tutar. Açılıp kapanma artık hidden, aria-hidden, inert ve is-open üzerinden birlikte yönetilir. Eski dikey menü CSS katmanları, kenar konumu yazan JavaScript ve kullanılmayan menü durumunu saklama kodu kaldırıldı. Menü tasarımı tek CSS bölümünde bulunur.

Yumak seçimi kabul edildiğinde Oyun menüsü kapanır; kedinin mobilyadan yere inmesi gerekiyorsa bekleme sırasında da menü kapalı kalır. Patile başarıyla açıldığında da menü kapatılır.

Kontroller; dosya protokolünde gömülü kaynak yükleme, PNG baytlarının eşitliği, ilk HTML'de kapalı menüler, aç/kapat erişilebilirliği ve gerçek Yumak fonksiyonuyla menü kapanışını kapsar. Canlı tarayıcıda test yapılmış olduğu iddia edilmez.
