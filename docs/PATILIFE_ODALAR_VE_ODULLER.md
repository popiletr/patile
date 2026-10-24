

### 2026-10-23 — Bildirimler, oda ikonları ve alınabilir ödüller

- Normal bildirimler ile ilk gün ipuçları üst durum paneli ve oda şeridinin altındaki ortak alana taşındı. Yeni bildirim eskisinin zamanlayıcısını iptal eder; geçici bildirim bitince rehber ipucu geri gelir.
- Bakım sol, oyun sağ kenarda açılır/kapanır. Kulakçıklar kendi kenarında kalır; açık menüde de adını korur. Konum, oda şeridinin ölçülen alt kenarına göre ve ekran boyutu değiştiğinde güncellenir.
- Sekiz oda düğmesi 64×58 CSS piksel ölçüsünü paylaşır. Üç yeni oda için şeffaf, 2172×724 atlas üretildi; her oda eşit kare hücre kullanır. Kilit koşulu erişilebilir ad ve açıklamada korunur.
- Alınabilir başarım, günlük görev ve olay ödülleri aynı yeşil düğme dili ve hafif halka animasyonunu kullanır. Azaltılmış hareket tercihi animasyonu kapatır. Günlük/Başarımlar sekmeleri ve başarım kategorileri yalnızca henüz alınmamış hazır ödülleri sayar. Ana üst panel sayacı da aynı kayıttan yenilenir.
- 106 JavaScript + 2 Python testi geçti. Yeni kontroller: görev/olay/başarım ödülü alındığında sayaç azalması; kategori toplamları; yeni bildirim zamanlayıcısının eskisini iptal etmesi; sol/sağ menü erişimi. Canlı tarayıcı ve gerçek telefon görsel kontrolü bu çalışmada yapılmadı.
- Geri dönüş yedeği: `backups/patilife-before-reward-chrome-20261023.tar.gz`.

Görsel üretimi: imagegen, `transparent_background: true`. Stil referansları: `sprite_preview/sahneler/btn_salon.png`, `sprite_preview/sahneler/btn_bahce.png`. Kaynak: `/Users/nazmi/.codex/generated_images/01a16550-2f4e-7f83-ac70-34ef2988a71d/exec-bc21e58d-0e84-470b-99d6-d0c24daea332.png`. Projedeki dosya: `sprite_preview/patilife_v2/assets/room-icons.png`. Kaynak görsel değiştirilmeden kopyalandı; hücreler CSS arka plan konumuyla seçiliyor.

Tam görsel promptu:

```text
Use case: game UI illustration. Create a transparent RGBA sprite atlas of EXACTLY THREE cozy mobile game ROOM BUTTON ICONS, arranged in ONE ROW of THREE equal SQUARE cells. No text, no numbers, no emoji, no padlock glyphs, no people, no cats. Match reference images' exact simple flat pastel cartoon style, soft warm muted outlines, rounded square enamel tile with double inset outline, gentle small highlights, centered object, no realistic textures, no external drop shadow. Each tile same outer size and equal generous transparent gutters; each complete rounded square fits fully within its own cell. Left icon SUNROOM: a small sage green arched greenhouse window with a tiny leafy plant on its sill, on pale mint rounded tile. Middle icon ATTIC PLAYROOM: a small peach wooden roof shape over a pink yarn ball and simple cat tunnel, on pale apricot rounded tile. Right icon READING ROOM: two stacked pastel books with a small soft sage cushion, on pale lavender rounded tile. Objects centered and similarly scaled to reference couch and sprout. Three distinct easily readable silhouettes at 24 pixels. Transparent outside each tile, no background behind the row. Use equal 1/3-width cells with no overlap. Reference1 couch tile and reference2 sprout tile are style references, not objects to copy.
```

