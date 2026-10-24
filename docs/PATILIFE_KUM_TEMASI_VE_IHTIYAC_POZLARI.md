# PatiLife — kum kabı teması ve ihtiyaç ifadeleri

23 Ekim 2026. Kullanıcının 17.00 ekran görüntüsündeki kap/karakter örtüşmesi ve açlık, susuzluk, düşük keyif geri bildirimi için uygulama.

## Oynanış ve çizim

- Kum kabının tamamını kedinin önüne çıkaran `.toilet-in-use` yükseltmesi kaldırıldı. Orijinal kap arkada kalır; açık kapta yalnız ön alt kenarın kopyası ayrı, etkileşimsiz ön katmandadır. Kap yer değiştirmez. Kapalı modellerde girişten sonra kedi içeride gizlenir ve tamamlanınca yeniden görünür.
- Kum yüzeyi hedefi, PNG'nin kaynak karesi, 160 piksellik çizim alanındaki boşluklar, yerleştirilen eşyanın yüksekliği/ölçeği ve ekran yüksekliğiyle hesaplanır. Kedinin çömelme karesinin alt yüzde sekizlik alfa bandından pati merkezi okunur. Kuyruğun kaydırdığı tam gövde merkezine güvenilmez. Bu yaklaşım dört desenin üç yaşına uygulanır.
- Açık kapta kullanırken ayak kum yüzeyine oturur; tamamlandıktan sonra kedi zemine yürüyerek çıkar. Ön kenar katmanı ve temas durumu işlem bitince veya başka odaya geçişin tamamlanma kontrolünde temizlenir. Kalan kum ve ödül kuralları korunur.
- Mama veya su 30 ve altındaysa: çökmüş gövde, düşük baş/kulak/kuyruk, yorgun gözler ve yavaş nefes/göz kırpma. Normal yürüyüş hızı yüzde 68'e iner; oyuncunun yürüme komutu korunur. Aç veya susuzken otonom neşeli dolaşma başlatılmaz.
- Keyif 30 ve altındaysa ve açlık/susuzluk yoksa: ayrı üzgün oturma, düşük baş ve kaşlar, küçük aşağı dönük ağız. İhtiyaç giderilince normal poza dönüş bir sonraki çizimde olur. Kalıcı ihtiyaç pozu kayıt alanı eklenmedi; mevcut yüzdelerden türetilir.
- Yürüme, mama yeme, su içme, tuvalet, uyku, sevme, zıplama ve diğer aktif hareketler durum pozu tarafından ezilmez. Açlık/susuzluk düşük keyfe göre önceliklidir. Böylece bakım sırasında bitkin pozda donma olmaz.
- Üstte durum metni gerekli bakımı belirtir; ilgili düşük ihtiyaç alanı belirginleşir. Yeni tekrarlanan toast veya emoji eklenmedi. Animasyon azaltma tercihi ilk ifadeyi sabit gösterir.

## Dosyalar ve kontroller

`household-rules.js`: saf kum yüzeyi/pati teması hesabı. `household.js`: açık kabın ön kenarı ve kullanım akışı. `classic-bridge.js`: ihtiyaç değerlendirmesi ve çizim hareketi seçimi. `sprite-player.js`: iki kareli ifade ritmi. `needs-atlases.js`: 48 ifade karesi, 12 kedi/yaş bileşimine bağlanır. `runtime.js` ve `game-chrome.css`: ihtiyaç vurgusu. Ana HTML yeni atlası yükler, yürüme/AI ve durum metnini bağlar.

138 JavaScript + 2 Python testi geçti. Yeni kontroller: 432 desen/yaş/kap/eşya ölçeği/ekran yüksekliği birleşiminde pati/kum noktası, gerçek kullanımda ön katman oluşturma/temizleme, kapalı kap görünürlüğü, ihtiyaç önceliği, aktif bakımı koruma, anında normale dönüş ve 48 PNG karesinin sınırları. İki inline ana script ve altı yeni/değişen modül sözdizimi kontrolünden geçti. Canlı tarayıcı/telefon görsel kabulü yapılmadı; önceki erişim reddi alternatif tarayıcıyla aşılmadı.

Yedek modüller: `backups/patilife-before-needs-contact-20261023/`. Web dağıtımı oluşturulurken önceki www ayrıca yedeklenir. Kaynak görseller değiştirilmeden kopyalandı. Python yalnız alfa okuma ve metaveri üretiminde kullanıldı; görseller üzerinde piksel düzenlemesi yapılmadı.

## Üretim kaydı

Araç: yerleşik `image_gen.imagegen`, şeffaf PNG. Her atlas dört sütun ve dört satırdır; ilk iki satır bitkin, son iki satır üzgün. Her sütun sarman/tekir/smokin/calico. Stil referansı (düzenleme hedefi değil): `/Users/nazmi/Widget Uygulaması/sprite_preview/patilife_v2/assets/sarman-kitten-cartoon.png`.

### kitten

Kaynak: `/Users/nazmi/.codex/generated_images/01a16550-2f4e-7f83-ac70-34ef2988a71d/exec-e71c3f47-fb9d-455d-94eb-1a0a658df7db.png`

Projede: `/Users/nazmi/Widget Uygulaması/sprite_preview/patilife_v2/assets/needs-kitten.png`

Tam prompt:

```text
Use case illustration-story. Transparent PNG production cat game ANIMATION atlas, EXACTLY FOUR columns by FOUR rows, sixteen isolated full cats, all16cells visible, generous transparent margins. Match reference PatiLife cat's warm brown outlines, flat cream and pastel cartoon coloring, simple chibi faces. Every COLUMN has one coat consistent across its four rows: column1 cream ORANGE TABBY, column2 cream GRAY TABBY, column3 BLACK WHITE TUXEDO, column4 cream ORANGE BLACK CALICO. Age: tiny KITTENS with large round heads and short legs. Every cat faces 3/4 RIGHT. ROW1 EXHAUSTED hungry thirsty pose: crouched slumped body, drooping ears, half-closed weary eyes, lowered head, tail resting low, clearly tired but awake; no smile. ROW2 SAME tired pose with subtle chest breathing and eyes blinking, matching proportions and baseline. ROW3 UNHAPPY seated pose: shoulders droop, ears slightly to sides, sad eyebrows and downturned tiny mouth, lowered tail, visibly sad but not sick. ROW4 SAME sad seated pose with slight downward head movement and blink. Keep markings consistent within columns, consistent full feet baseline, same body size in both frames of each motion. No props, no symbols, no tears, no sweat drops, no words, no numbers, no background, no cell grid. Do not draw happy smiling faces. All four coats must be recognizable. Reference image is style reference only.
```

### young

Kaynak: `/Users/nazmi/.codex/generated_images/01a16550-2f4e-7f83-ac70-34ef2988a71d/exec-25f788d5-6d7d-4513-bdee-d59cf342cb70.png`

Projede: `/Users/nazmi/Widget Uygulaması/sprite_preview/patilife_v2/assets/needs-young.png`

Tam prompt:

```text
Use case illustration-story. Transparent PNG production cat game ANIMATION atlas, EXACTLY FOUR columns by FOUR rows, sixteen isolated full cats, all16cells visible, generous transparent margins. Match reference PatiLife cat's warm brown outlines, flat cream and pastel cartoon coloring, simple chibi faces. Every COLUMN has one coat consistent across its four rows: column1 cream ORANGE TABBY, column2 cream GRAY TABBY, column3 BLACK WHITE TUXEDO, column4 cream ORANGE BLACK CALICO. Age: YOUNG cats with medium head and longer little bodies. Every cat faces 3/4 RIGHT. ROW1 EXHAUSTED hungry thirsty pose: crouched slumped body, drooping ears, half-closed weary eyes, lowered head, tail resting low, clearly tired but awake; no smile. ROW2 SAME tired pose with subtle chest breathing and eyes blinking, matching proportions and baseline. ROW3 UNHAPPY seated pose: shoulders droop, ears slightly to sides, sad eyebrows and downturned tiny mouth, lowered tail, visibly sad but not sick. ROW4 SAME sad seated pose with slight downward head movement and blink. Keep markings consistent within columns, consistent full feet baseline, same body size in both frames of each motion. No props, no symbols, no tears, no sweat drops, no words, no numbers, no background, no cell grid. Do not draw happy smiling faces. All four coats must be recognizable. Reference image is style reference only.
```

### adult

Kaynak: `/Users/nazmi/.codex/generated_images/01a16550-2f4e-7f83-ac70-34ef2988a71d/exec-da40fc9f-490f-403e-bd82-e757eaedb3f4.png`

Projede: `/Users/nazmi/Widget Uygulaması/sprite_preview/patilife_v2/assets/needs-adult.png`

Tam prompt:

```text
Use case illustration-story. Transparent PNG production cat game ANIMATION atlas, EXACTLY FOUR columns by FOUR rows, sixteen isolated full cats, all16cells visible, generous transparent margins. Match reference PatiLife cat's warm brown outlines, flat cream and pastel cartoon coloring, simple chibi faces. Every COLUMN has one coat consistent across its four rows: column1 cream ORANGE TABBY, column2 cream GRAY TABBY, column3 BLACK WHITE TUXEDO, column4 cream ORANGE BLACK CALICO. Age: ADULT cats with full slightly longer bodies and smaller head to body proportions. Every cat faces 3/4 RIGHT. ROW1 EXHAUSTED hungry thirsty pose: crouched slumped body, drooping ears, half-closed weary eyes, lowered head, tail resting low, clearly tired but awake; no smile. ROW2 SAME tired pose with subtle chest breathing and eyes blinking, matching proportions and baseline. ROW3 UNHAPPY seated pose: shoulders droop, ears slightly to sides, sad eyebrows and downturned tiny mouth, lowered tail, visibly sad but not sick. ROW4 SAME sad seated pose with slight downward head movement and blink. Keep markings consistent within columns, consistent full feet baseline, same body size in both frames of each motion. No props, no symbols, no tears, no sweat drops, no words, no numbers, no background, no cell grid. Do not draw happy smiling faces. All four coats must be recognizable. Reference image is style reference only.
```


