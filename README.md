# 🫧 B!Pop (Couple & Friends Lock / Home Screen Widget)

B!Pop, çiftlerin ve yakın arkadaşların birbirlerinin iOS Kilit Ekranı (Lock Screen) ve Ana Ekran (Home Screen) widget'larına anlık olarak **Pixel Art çizimleri**, **notlar & mood emojileri** ve **Spotify şarkı önerileri** fırlatmasını sağlayan mikro-sosyal bir widget uygulamasıdır.

---

## 📱 Proje Mimarisi

```
Widget Uygulaması/
├── Bipop/                      # iOS Ana Uygulaması (SwiftUI)
│   ├── App/                   # BipopApp, AppState, AppDelegate (Push & Silent APNs)
│   ├── Services/              # APIService, HapticManager, SoundManager
│   └── Views/
│       ├── MainTabView.swift  # Glassmorphic Yüzen Tab Bar
│       ├── Studio/            # Pixel Art (16x16/32x32), Note Editor, Spotify Picker
│       ├── Feed/              # B!Pop Geçmişi & Memory Reel
│       ├── Onboarding/        # 6 Haneli PIN ile Eşleşme & Profil
│       ├── Settings/          # Widget Kurulum Rehberi
│       └── Components/        # Canlı Widget Önizleme Simülatörü
│
├── BipopWidgetExtension/       # WidgetKit Extension
│   ├── BipopWidget.swift      # Multi-family Widget (Small, Medium, Rectangular, Circular, Inline)
│   └── BipopWidgetBundle.swift
│
├── Shared/                    # Ortak Modeller, Depolama & Widget Görünümleri
│   ├── Models/                # PopItem, PixelGrid, NotePayload, SpotifyPayload
│   ├── Storage/               # SharedStorage (App Group "group.com.bipop.app")
│   └── WidgetViews/           # WidgetSmallView, WidgetMediumView, LockScreenWidgets
│
├── backend/                   # Node.js / TypeScript REST API + APNs Dispatcher
│   ├── src/index.ts           # Express Sunucusu
│   ├── src/database.ts        # SQLite Veritabanı
│   └── src/routes/api.ts      # Pair, Drops, APNs & Spotify Uç Noktaları
│
├── project.yml                # XcodeGen Proje Tanımı
└── Bipop.xcodeproj            # Üretilen Xcode Projesi
```

---

## 🚀 Hızlı Başlangıç

### 1. iOS Uygulamasını Xcode'da Açma ve Çalıştırma
Proje doğrudan Xcode ile açılıp Simulator veya gerçek cihazda çalıştırılabilir:

```bash
# Projeyi Xcode'da açın:
open Bipop.xcodeproj
```

* Hedef olarak `Bipop` şemasını ve bir iOS Simülatörünü (örn. iPhone 15 / 16) seçip **Cmd + R** tuşlarına basın.
* **Canlı Önizleme:** Stüdyo sekmesinde çizim yaparken veya şarkı seçerken üstteki canlı widget kutusu kilit ve ana ekran görünümünü anlık olarak yansıtır.
* **B!Pop Gönder Butonu:** Dokunduğunuzda titreşim ve ses efekti eşliğinde widget verisi güncellenir ve karşı tarafın kilit ekranına fırlatılır.

### 2. Backend Sunucusunu Başlatma (İsteğe Bağlı)
Lokal eşleşme ve push testleri için:

```bash
cd backend
npm start
```
Sunucu `http://localhost:3000` adresinde çalışmaya başlayacaktır.

---

## 🎨 Temel Özellikler
1. **Pixel Art Stüdyosu:** 16x16 ve 32x32 tuval, zengin neon renk paleti, silgi, kova doldurma ve kalp/yıldız/gülen yüz şablonları.
2. **Hızlı Not & Mood:** Özel gradyan arka planlar, font stilleri ve emoji reaksiyonları.
3. **Günün Şarkısı (Spotify):** Şarkı arama, kişisel not ekleme ve widget'tan tek tıkla doğrudan Spotify'da çalma (`spotify:track:...`).
4. **Çok Boyutlu WidgetKit Desteği:**
   - **Ana Ekran:** Küçük (2x2) ve Orta (4x2)
   - **Kilit Ekranı:** Dikdörtgen, Dairesel ve Satır İçi
