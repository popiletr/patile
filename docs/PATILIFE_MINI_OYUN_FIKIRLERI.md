# PatiLife — üç yeni mini oyun

23 Ekim 2026: üç oyun da uygulandı. Oyun alt çubuğunda Oyun açıldığında Sinek, Yumak ve Patile yanında üç oyun ayrı resimli düğmelerle görünür; arada oyun seçme modalı yoktur. Dosyalar ve pencere sembol atlası yalnız ihtiyaç olduğunda yüklenir.

| Oyun | Güncel oynanış | Ödül ve ilerleme |
|---|---|---|
| Mama İzini Bul | Oyuncağın yeri önce gösterilir; aynı kaplar animasyonla yer değiştirir. Sonra doğru kap seçilir. İlerledikçe üçten dört kaba ve daha uzun karıştırmaya geçilir. | Günün ilk üç başarısı 8 / 5 / 3 altın. Başarı +4 keyif, −5 enerji. Sonraki başarılar altın vermeden pratik olarak sürer. |
| Pencere Nöbeti | Kuş, yaprak, kelebek ve güneşin görünme sırası izlenir; sonra aynı sırayla dokunulur. Dizi üçten on iki ziyarete kadar büyür. Seçilmiş kedinin görünüşü oyun içinde tepki verir. | Günün ilk iki başarısı 10'ar altın. Başarı +5 keyif, −5 enerji. Üç farklı başarılı günde mevcut etkileşimli kelebek oyuncağı (`sleep_mobile`) hediye edilir. |
| Kutu Kaşifi | 5 × 5, ardından 7 × 7 ve 9 × 9 karton labirentlerde yan yana hücrelere dokunarak veya sürükleyerek çıkış yolu çizilir. Geri izleyerek düzeltilebilir; kedi çizilen rotayı yürür. Yön tuşları da desteklenir. | Yeni bölüm ilk bitirişte 12–20 altın, bir kez. Tekrarlarda günlük toplam 15 altın. Başarı +4 keyif, −5 enerji. Üç farklı başarılı günde kumaş tünel hediye edilir. |

Hediyeler canonical envantere bir kez eklenir; Eşyalar üzerinden yerleştirilir. Başarı mevcut günlük birlikte oyun görevine kaydolur. Başarısız tur altın veya eşya vermez; keyif ve enerjiyi azaltmaz.

Oyun girişinde tur kimliği kaydedilir. Yarım bırakılan tur iptal olur ve ödül vermez; kapanışta zamanlayıcılar, rota pointer yakalaması ve isBusy temizlenir. Kazanılan tur ödülüyle birlikte kaydedilip aktif tur kapatılır; yeniden yükleme aynı ödülü ikinci kez vermez. Sayfa gizliyken izleme/karıştırma ve yürüyüş zamanlayıcıları ilerlemez.

Tasarımda geçen fiziksel odada pencereye yürüme ve hareketli labirent kapakları bu sürümde yoktur; pencere oyunu kendi panelinde, kutu oyunu çıkmazları olan üretilmiş karton yollarla çalışır. Yeni görsellerin kaynağı ve tam tanımı PATILIFE_PENCERE_OYUNU_GORSELLERI.md dosyasındadır.

Saf kurallar ve sentetik DOM ile üç gerçek oyun akışı, günlük sınırlar, kayıt/yükleme, hediye tekilliği, iptal, sekme gizleme ve labirent erişilebilirliği test edilir. Canlı tarayıcı erişimi daha önce reddedildiği için bu turda canlı görsel veya cihaz testi yapılmadı.

## Kesintisiz bölüm akışı

Her başarı bir sonraki bölümü açar. Eski dokuz bölüm sınırı kaldırıldı; bölüm numarası başarı sayısı + 1 olur. Kazanılan bölümden 1,8 saniye sonra otomatik devam edilir; istenirse Sonraki bölüm düğmesiyle hemen geçilir. Kaybedince aynı bölüm tekrar denenir. Oyunu bitir veya Kapat ile çıkılır. Yeniden girişte kaydedilmiş başarı sayısından devam edilir; yarım bırakılan bölüm ödül vermez.

İlk giriş 10 enerji gerektirir; devam eden oturum düşük enerji yüzünden kesilmez. Başarı başına enerji sıfırın altına inmez. Mama oyununda karıştırma adımları ve hız artar; pencere oyununda sıra uzar; kutu yolları 5/7/9 hücrelik ölçülerde yeniden üretilir. Fiziksel tahta boyutu, karıştırma hızı ve sıra uzunluğu okunabilirlik için üst sınır taşır; bölüm numarası ilerlemeye devam eder.

Testlere 30 ardışık bölüm, enerji sıfırda devam, aynı bölümde yeniden deneme, bölüm geçişinde çıkış ve üç doğrudan ikonlu başlatıcı kontrolü eklendi. İkon kaynağı: PATILIFE_MINI_OYUN_IKONLARI.md.
