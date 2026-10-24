# PatiLife sahne genişletme

Sekiz oda için yerleşik image_gen aracıyla gerçek üst/alt çizim alanları üretildi. Son bitmap dosyaları sprite_preview/patilife_v2/assets/rooms-expanded/ klasöründedir. Kullanılan eksiksiz prompt seti PATILIFE_SAHNE_GENISLETME_PROMPTLARI.json dosyasındadır. Orijinallerin kopyaları backups/room-outpaint-originals/ altında saklandı; kaynak oda görselleri değiştirilmedi.

Arka plan katmanı özgün sahnenin iki katı yüksekliğinde boyalı alan sağlar. Özgün görsel orta alanda ayrı katman olarak aynı konum ve ölçekte tutulur. Birleşim yerleri oda başına hizalanır; manuel kadrajda dar bir alfa geçişi vardır. Varsayılan kadrajda özgün görsel korunur. Kedi ve eşyalar aynı sabit yükseklikteki sahnede tek uniform CSS ölçeğiyle hareket eder. Önceki sahne yüksekliğini zoom oranına göre esnetme kaldırıldı.

Kamera, tüm oda hizalamaları için güvenli boyalı üst/alt sınırlar içinde kalır. Boyalı görsel yüklenmeden pinch başlatılmaz. Patigram fotoğrafları genişletilmiş fonla birlikte özgün orta katmanı ve atlas kırpmasını kaydeder; önceki fotoğraflar okunabilir.

Kontroller: 267 JavaScript ve 4 Python testi geçti. Sekiz oda %55 kadrajda tarayıcıda görsel olarak incelendi. Gerçek telefondaki çoklu dokunuş hissi ayrıca cihaz testi gerektirir.

Dağıtım: 557c67204242 sürümü nazmi.tr/oyun adresine aktarıldı. Sekiz PNG ve beş kod dosyası HTTPS üzerinden yerel paketle SHA-256 eşitliğiyle doğrulandı. Önceki canlı kodlar sunucudaki patilife-releases/rooms-557c67204242/previous altında korunur. iOS Simulator unsigned derlemesi ve Android debug APK derlemesi başarılı; her iki native projeye yeni görseller kopyalandı.
