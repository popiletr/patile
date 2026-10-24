# Tuvalet bakımının anlaşılır akışı

23 Ekim 2026. Ana girişteki mevcut kum kabı, sprite ve kürek oyunu korunarak açıklayıcı durum ve işlem sırası eklendi.

## Kullanıcının gördüğü ekran

Üstte mevcut tuvaletin çizimi var. Kedinin tuvalet ihtiyacı, kapta kalan kullanım ve kirli kullanım sayısı üç ayrı gösterge. Büyük Şimdi yapılacak kartı durumdan türetilen tek ana işlemi gösterir. Altındaki resimli üç adım: Kabı hazırla → Tuvalete götür → Topakları temizle (elektrikli modelde Otomatik temizlik).

| Gerçek durum | Öncelikli işlem | Sonrasında |
| --- | --- | --- |
| Kum kabı yerleştirilmemiş | Kum kabını yerleştir | Uygun oda seçimi |
| Kum kalmamış | Yeni kum ekle · 20 altın | Kirli kum da yenilenir; ihtiyaç varsa Tuvalete götür açılır |
| Dört kirli kullanım, kum hâlâ var | Kürekle temizle | Kalan kum korunur, kedi tekrar kullanabilir |
| Kullanılabilir kap ve ihtiyaç en az yüzde 40 | Tuvalete götür | Gerçek yaklaşma/kullanma animasyonu tamamlanır |
| İhtiyaç yok, biraz kir var | Kürekle temizle | Sonraki kullanıma hazır |
| İhtiyaç yok, kap temiz | Şu an işlem gerekmiyor | İhtiyaç eşiği ekranda yazılı |
| Başka bakım devam ediyor | Mevcut bakımı bekle | İşlem düğmesi sunulmaz |

Fiyat yanında yetersiz altın gerekçesi gösterilir. Ücretli tüm kum yenileme ve tercihe bağlı temizlik Diğer bakım seçenekleri altında, gelişimler ayrı açılır bölümde. Yalnız topak temizlemek için yeni kum satın almak gerekmediği açıkça yazılı. Elektrikli tuvalette kürek adımı sunulmaz; kum tükendiğinde yine dolum gerekir.

Kürek turu bitince durum ekranı yeniden açılır ve sıradaki işlemi gösterir. Turun tek seferlik ödülü, iptal koruması ve kalan kum korunur. Kullanım sonrası kısa sonuç mesajı, manual/electric bakım farkını belirtir.

## Aynı bilgi rozet ve bildirimlerde

Sol rozet eski kirlilik yüzdesi/ESKİ etiketini göstermez: Götür, Temizle, Kum ekle, Yerleştir, Hazır veya Bekle yazar. Üst yüzde kedinin ihtiyacı olarak kalır; kabın kirli olmasıyla karıştırılmaz. Eski litterCleanCount modern kaydın rozetini değiştirmez.

Telefon bildirimleri ortak toiletStatus kuralından doğru eylemi seçer: temiz kap ve ihtiyaç için Tuvalete götür, dolu kap için Kürekle temizle, tükenmiş kum için fiyatıyla Yeni kum ekle, yerleştirilmemiş kap için envanterden yerleştirme. Önceden seçilen günlük üç sınırı, üç saat aralık ve 22.00–09.00 sessiz saatler korunur.

Kap dolu/boş/yerleştirilmemişken otonom kedi gideceğini söyleyip başarısız kullanım başlatmaz. Modern çevrimdışı hesap, hiçbir gerçek kum kullanımı kaydetmeden eski sistemdeki gibi ihtiyacı giderilmiş saymaz. Otomatik başarısız kullanım modalı kendiliğinden açmaz.

## Uygulama ve doğrulama

household-rules.js içindeki toiletStatus saf ortak durum kaynağıdır. household.js durum kartları ve adımları üretir. Ana HTML modern rozeti ve otomatik kullanım korumalarını uygular. notification-policy.js aynı durumdan bildirim metni çıkarır. Yeni ikon üretilmedi; mevcut çizilmiş kedi/kum atlası kullanılır, emoji eklenmedi.

154 JavaScript + 2 Python testi geçti. Yeni testler: işlem önceliği, dolu → kürek → hazır → kullanım → sonraki temizlik, gerçek modal düğmeleri, yetersiz altın ve 20 altınla dolum, otomatik başarısız girişin modal açmaması, eski yüzde/kirlilik/temizlik sayısının rozet karıştırmaması ve telefon bildirimi eylemleri. İki inline script ve üç değişmiş modül sözdizimi kontrolünden geçti.

392 dosya / 195.1 MiB web paketi üretildi. 89 kaynak dosyası www ile birebir doğrulandı. Önceki dağıtım backups/www-before-build-_aj7v42i/www içinde korundu. Canlı tarayıcı/telefon görsel kabulü, OS bildirim teslimatı ve native derleme yapılmadı.
