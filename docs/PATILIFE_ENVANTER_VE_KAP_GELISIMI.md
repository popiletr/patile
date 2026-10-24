# PatiLife — kademeli ilerleme, envanter ve kap animasyonları

23 Ekim 2026 tarihli kullanıcı geri bildirimi ve doluluk kareleri düzeltmesi birlikte uygulandı.

## Oynanış değişiklikleri

- 60 başarımın her birinde farklı aktif gün koşulu var. Yeni bir kayıtta yalnızca sahiplenme hazırdır; ilk günün bitirilmesi ayrı bir anı olabilir. Örneğin ilk yakınlık en az 2, birlikte rahatız 5, güvenli dostluk 7 aktif gün ister. Bağ değerini aynı gün artırmak gün koşulunu aşmaz. Eski alınmış ödüller ve para geri çekilmez.
- Ana başarım görünümü Tümü: hazır ve alınmamış ödüller ilk sırada, sonra devam edenler, alınmış hatıralar en sonda. Kategori içinde de aynı öncelik kullanılır. Gün ilerlemesi kartta ayrıca yazılır.
- Modern kayıtlarda gizli eski görev/başarım motorunun ikinci kez çalışıp anlık başarım bildirmesi durduruldu.
- Eşya alımı kanonik lifeV2 envanterine yazar, yalnız bir kez para düşürür ve otomatik yerleştirmez. Dükkanın başında Envanterim erişimi vardır. Ayrı ev erişimi oyun menüsünden çıkarılıp sağ alt köşeye taşındı.
- Yerleştir/Taşı açık ve uygun odaları sorar. Yerleşim doğrulaması para işleminden ayrıdır; oda doluysa eşya envanterde kalır. Oda seçilince oyuncu o odaya geçer, eşya tek kopya olarak yerleşir ve konum düzenlemesi açılır. Oda açılış ara sahnesinin anısı yerleştirme sırasında kaybolmaz.
- Başlangıç mama ve su kapları da gerçek envanter nesnesine dönüştürülür: dokunarak kullanılır, düzenlenir, kaldırılıp yeniden yerleştirilebilir. İlk su kabı salonun saksılara yakın arka zeminine x=660/bottom=145 konur; kullanıcı tarafından daha önce yerleştirilmiş nesneler korunur. Bakım işlemi eski sabit noktaya değil gerçek yerleştirilmiş kaba yürür. Kabın tamamı kaldırılmışsa ürün parası alınmadan yerleştirme istenir.
- Kap gelişimi: tabak → seramik → çelik → otomatik → akıllı. İlk seramik için ilgili ilk bakım ödülü ve 2 farklı bakım günü; çelik için Güvenli dostluk ödülü ve 7 bakım günü; otomatik için önceki aşamalar, 14 gün ödülü ve 14 bakım günü; akıllı için önceki aşamalar, 30 gün ödülü ve 30 bakım günü. Açılmış eski görünüşler de seçilebilir. Süre çarpanları 1/1.1/1.2/1.45/1.65, ek tokluk/su 0/3/5/8/10. Otomatik dolum ürünü ve otomatik besleyici satın alımı gelişim aşamasını kontrol eder.
- Mama ve su için ayrı 15 karelik atlaslar kullanılır: her birinin 5 görünüşünde boş/yarım/dolu kareleri var. Doldurma boş→yarım→dolu; yeme dolu→yarım→boş; içme sonrası su yarım kalır. İçerik her kap kimliği için ayrı miktar/zaman/süre olarak saklanır; yeni açılışta otomatik dolmaz ve geçen sürede azalır. Animasyon içi kayıtlar bulut isteği başlatmadan yerelde saklanır. Her aşamanın üç karesi ortak çizim kutusu ve taban çizgisine yerleşir.
- Rehber/bildirim alanının ölçülen alt kenarının altında menü kulakçıkları başlar; bakım solda, oyun sağda kalır. Genişleyen bildirim için ResizeObserver konumu günceller. Temizlik düğmesi ve işlem yazıları tüylerini temizleme davranışıyla tutarlı hale getirildi; temizlenmeden para üretilmez.
- Oyuncu 3.5 saniye dokunmadığında, etkinlik/düzenleme/av sırasında değilken kamera kediyi yumuşakça takip eder. Sürükleme her zaman önceliklidir. Envanter ve oda seçimi açıkken ev hareketi durur.
- Av/lazer: başlangıçta tek yavaş hedef; basılı tutulan hassas nişan halkası dolunca atlayış. Rastgele kısa dokunuş boş av kazandırmaz. Sıralı dalga zamanlayıcısı, tahmin edilebilir giriş hatları, hedef ömrü ve seans tamamlamayla artan hız/sayı var. En az 3 yakalamayla biten her 3 seans bir aşama artırır, en fazla 6 aşama ve 3 eşzamanlı hedef. Yakalanmış veya sahneden çıkmış hedef ikinci kez ödül vermez. Eski seansın gecikmiş spawn callback'leri kaldırıldı.

## Kontrol ve dosyalar

117 JavaScript ve 2 Python testi geçti. Gerçek dükkan yöntemleriyle satın alma/kayıt/oda seçimi/yerleştirme; bölüm anısının korunması; kalıcı sahiplik ve tek ücret; gün eşikleri; kap gelişim koşulları; 30 karenin sınırları ve sabit çizim boyutları; gerçek av yöneticisinin tek hedefle başlayıp kısa dokunuşu reddetmesi ve basılı nişanla hedef ayırması dahil.

Ana dosyalar: sprite_preview/patilife_app.html, patilife_v2/home-systems.js, hunt-rules.js, achievements.js, feeding-atlases.js, runtime.js ve classic-life.js. Kap metadata üretimi scripts/build_feeding_metadata.py ile alfa kanalının salt okunur analizi üzerinden yapılır; PNG'ler değiştirilmez. Gerçek telefon görsel kabulü ve FPS ölçümü yapılmadı. Önceki para/kayıtlar silinmedi.

Yedek: backups/patilife-before-progression-workshop-20261023.tar.gz.

Yeni mini oyun fikirleri ve ödül planı: docs/PATILIFE_MINI_OYUN_FIKIRLERI.md. Bu üç oyun öneridir, uygulanmış gibi sunulmaz.

## Görsel üretim kaydı

Üretim aracı: built-in imagegen. Üç görsel de transparent_background=true ile üretildi. İlk konseptten sonra 30 karelik tek atlas denemesi altı satırı doğru vermedi; oyuna alınmadı. Son uygulamada iki ayrı 5×3 atlas ve gerçek alfa sınırlarına dayalı metadata kullanılır.

Konsept kaynak: /Users/nazmi/.codex/generated_images/01a16550-2f4e-7f83-ac70-34ef2988a71d/exec-0ec40492-4100-4948-9d29-0f7fa3df2448.png
Proje: sprite_preview/patilife_v2/assets/feeding-evolution.png

```text
Create a transparent PNG sprite atlas for PatiLife, a warm cozy cartoon mobile cat care game. Exactly TEN separate placeable feeding objects in a precise grid of FIVE equal square columns and TWO equal square rows, transparent background. No words, letters, numbers, emoji, cats, floor or external backdrop. Same gentle hand-drawn cartoon style, rounded warm brown outlines, flat soft pastel cream, sage and apricot colors, subtle highlights, slight 3/4 top-down view, baseline consistent, isolated objects each centered entirely inside its cell with 12 percent transparent padding. TOP ROW food progression left to right: very simple shallow cream saucer with a few brown kibbles; wider peach ceramic food bowl with kibbles; brushed steel food bowl with sage rubber base and kibbles; cozy compact automatic kibble dispenser with cream hopper and peach dish; advanced rounded smart kibble feeder with sage hopper, little blank indicator lights and steel dish. BOTTOM ROW water progression left to right: very simple shallow pale blue water saucer; wider mint ceramic water bowl; brushed steel water bowl with sage rubber base; compact cream water bubbler fountain; advanced rounded sage smart filtered water fountain with small cascade and a blank indicator light. All are cute household objects, no photorealism, no glow, no dramatic shadows. Each cell contains one complete object, same visual scale for dishes, machines naturally taller but no more than 75 percent cell height. Use exactly five columns and two rows, equal cell dimensions and no separators.
```

Mama kareleri kaynak: /Users/nazmi/.codex/generated_images/01a16550-2f4e-7f83-ac70-34ef2988a71d/exec-a1c1d29c-8526-47ef-b4d6-be67bcb4286d.png
Proje: sprite_preview/patilife_v2/assets/feeding-food-states.png
Stil/tasarım referansı: sprite_preview/patilife_v2/assets/feeding-evolution.png

```text
Transparent PNG animation sprite atlas. Exactly FIFTEEN objects in FIVE COLUMNS and THREE ROWS, an overall landscape 5:3 rectangular grid with equal square cells. Use the TOP food containers from the reference only. Every column has one consistent container design: simple saucer, larger ceramic bowl, steel bowl with sage base, cream automatic kibble dispenser, sage smart kibble dispenser. Row 1 all five EMPTY containers. Row 2 SAME five containers HALF FULL of brown kibble (also half filled reservoir). Row 3 SAME five containers FULL of brown kibble (also full reservoir). For water empty basins have NO water and no flowing spout, half and full fountains have a flow. Critical: all THREE ROWS must be visible including full bottom row. Align same object outline, baseline, size and position exactly across rows, only content changes. Entire object inside its own square cell, 12 percent transparent padding on all sides. No text, no labels, no numbers, no grid lines, no background, no extra rows or columns. Warm brown outlines, cream peach sage pastel cartoon game style exactly like reference. Transparent alpha outside objects. All15 cells required.
```

Su kareleri kaynak: /Users/nazmi/.codex/generated_images/01a16550-2f4e-7f83-ac70-34ef2988a71d/exec-d69be432-e03e-4397-af12-c3a4bc38716c.png
Proje: sprite_preview/patilife_v2/assets/feeding-water-states.png
Stil/tasarım referansı: sprite_preview/patilife_v2/assets/feeding-evolution.png

```text
Transparent PNG animation sprite atlas. Exactly FIFTEEN objects in FIVE COLUMNS and THREE ROWS, an overall landscape 5:3 rectangular grid with equal square cells. Use the BOTTOM water containers from the reference only. Every column has one consistent container design: simple saucer, larger ceramic bowl, steel bowl with sage base, cream automatic water fountain, sage smart water fountain. Row 1 all five EMPTY containers. Row 2 SAME five containers HALF FULL of pale blue water. Row 3 SAME five containers FULL of pale blue water. For water empty basins have NO water and no flowing spout, half and full fountains have a flow. Critical: all THREE ROWS must be visible including full bottom row. Align same object outline, baseline, size and position exactly across rows, only content changes. Entire object inside its own square cell, 12 percent transparent padding on all sides. No text, no labels, no numbers, no grid lines, no background, no extra rows or columns. Warm brown outlines, cream peach sage pastel cartoon game style exactly like reference. Transparent alpha outside objects. All15 cells required.
```


## Son ekran geri bildirimi: kapla temas ve yeme/içme katmanları

- Kaplar fiziksel olarak yerinden oynamaz. Genel dekor konteynerinin zorunlu alt yığını kaldırıldı; etkin kabın ön kenarı ayrı, geçici ve tıklama engellemeyen bir katmanda kedinin önünde çizilir. Arka kısım ve otomatik kap haznesi arkada kalır. İşlem tamamlanınca geçici katman kaldırılır.
- Yaklaşma x/zemin derinliği; gerçek kedi karesinin ölçüsü, kap aşaması, eşyanın ölçeği ve ekran yüksekliği üzerinden ağız–yüzey temasına göre hesaplanır. Sol kenardaki kapta gerektiğinde kedi sağdan yaklaşır. Kap koordinatları değiştirilmez.
- Yeme ve içmeye küçük, azaltılmış hareket tercihini dikkate alan gövde hareketi; suya yüzey halkası, mamaya küçük kırıntı efekti eklendi. İçme için yemek çıtırtısı yerine ayrı yumuşak ses kullanılır. Mevcut çizgi film kedi sprite'ları korundu; bu düzeltmede yeni kedi görseli üretilmedi.
- İşlem sonunda kedi 90 dünya pikseli kadar geri yürüyerek kapla üst üste kalmaz. Haritada gerçekten zemin olan yüksek derinlikten çıkış yanlışlıkla platform atlayışı sayılmaz; bilinmeyen platform kenarındaki inme koruması korunur.
- 119 JavaScript + 2 Python testi geçti. Yeni kontrol 360 kombinasyonda (4 kedi × 3 yaş × 2 bakım × 5 kap × 3 ekran ölçeği) ağız/yüzey hizasını ve kap koordinatlarının korunmasını doğrular. Derin zemin üzerinde geri yürüyüş ve eski yüksek platformdan iniş kontrolü birlikte geçer. Canlı tarayıcı/telefon görsel kabulü yapılmadı.
- Bu düzeltme öncesi yedek: backups/patilife-before-care-contact-20261023.tar.gz.
