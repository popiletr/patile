# 24 Ekim 2026 — geniş başlangıç ve gece raporu

Web sürümü: `7054ea499a03`.

- Oyun başlangıcında sahne ölçeği 0.55; kedi, oda ve eşyalar aynı dönüşümle görüntülenir. Dikey merkezleme ve dokunma koordinatları bu başlangıca göre hesaplanır.
- Görünümü sıfırla düğmesi kaldırıldı. İlk uygun anda iki adımlı, animasyonlu iki parmak öğreticisi gösterilir. Tamamlanma cihazda `patilife_scene_guide_v1` anahtarında tutulur; açık modal veya bakım etkinliği üzerine açılmaz.
- Gece raporu krem ve adaçayı renkleriyle yenilendi. Sabit başlık ve kaydırılabilir gövde, gerçek sıfır ihtiyaç değerleri, toplam av/öğün etiketleri ve modal içinde hediye sonucu bulunur. Ölçülmeyen uyku süresi uydurulmaz. Günlük hediye cihazın yerel takvim gününü kullanır; 35 altın + 40 deneyim, olasılıklı hatıra verir.
- Native UMP güncelleme hatasında yalnız SDK `canRequestAds` izin veriyorsa SDK'nın mevcut izin sonucu korunur. Diğer hataların asıl SDK açıklaması iletilir. Kullanıcı fiziksel iPhone'da reklamın açıldığını ve tamamlandıktan sonra ödülün geldiğini doğruladı. Kaynak: https://developers.google.com/admob/ios/privacy

Doğrulama: 272 JavaScript + 4 Python testi başarılı; mobil paket kontrolü, iOS Simulator ve Android debug derlemeleri başarılı. Yerel tarayıcıda öğretici iki adımı, tekrar açılmaması, gece raporu kaydırması ve hediye sonucu kontrol edildi. HTTPS'teki dört dağıtım dosyasının SHA-256 değerleri yerel paketle eşleşti. Sunucu önceki dosya yedeği: `patilife-releases/camera-night-7054ea499a03/previous`.
