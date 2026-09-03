# 🐾 PatiLife (PurrPal): Kedi Büyütme & Yaşam Simülatörü
## 📄 Kapsamlı Oyun Tasarım Belgesi (Game Design Document - GDD) & Görsel İhtiyaç Haritası

---

## 🎯 1. Oyun Vizyonu ve Temel Konsept
**PatiLife**, oyuncunun sahiplendiği minik bir kedi yavrusunu (Kitten) bebeklikten yaşlılığa kadar günbegün büyüttüğü, beslediği, eğittiği, tedavi ettiği ve onunla bağ kurduğu **derinlikli bir sanal evcil hayvan simülasyonudur**.

Oyun hem **tam ekran zengin bir uygulama** olarak hem de **iOS İnteraktif Widget'lar** üzerinden kesintisiz bir yaşam döngüsü sunar. Oyuncu uygulamayı açmadan bile ana ekranındaki widget üzerinden kedisini odadan odaya geçirebilir, mamasını verebilir, sevebilir ve anlık durumunu izleyebilir.

---

## ⏳ 2. Kedinin 4 Yaşam Evresi (Büyüme Döngüsü)

Kedin gerçek zamanlı gün geçtikçe hem görsel olarak büyür hem de davranışları, ihtiyaçları ve animasyonları evrilir:

```
[ 0 - 10. Gün ]    ───>  [ 11 - 35. Gün ]   ───>  [ 36 - 90. Gün ]   ───>  [ 90+ Gün ]
  YAVRU (Kitten)           GENÇ (Junior)           YETİŞKİN (Adult)          YAŞLI (Senior)
- Minik kafa & patiler   - Uzayan bacaklar       - Tam oturmuş gövde       - Hafif kambur/yavaş
- Biberon & süt          - Enerji patlaması      - Asil, avcı tavırlar     - Sıcak köşe arayışı
- Sakar adımlar          - Koşma & zıplama       - Tüy dökümü & tarama     - Eklem vitaminleri
```

### 🍼 Evre 1: Yavru Kedi (0 - 10 Gün)
- **Görsel Özellik**: Kocaman parlak gözler, minik kulaklar, yuvarlak tombiş gövde, kısa bacaklar.
- **İhtiyaçlar**: 3-4 saatte bir biberonla ılık süt / yavru yaş maması, bol uyku (%80 uyur), sıcak battaniye.
- **Karakter**: Sakar yürüyüş, poposu üstüne düşme, parmak ısırma, minik miyavlamalar.

### 🎾 Evre 2: Genç Kedi (11 - 35 Gün)
- **Görsel Özellik**: Boyu uzar, kulakları belirginleşir, daha çevik ve ince yapılıdır.
- **İhtiyaçlar**: Kuru yavru maması, ilk aşılar (Karma 1, İç/Dış parazit), tırmalama tahtası, enerji atma oyunları.
- **Karakter**: Evin içinde çılgınca koşma (zoomies), perdelere tırmanma, sinek kovalama, terlik kaçırma.

### 👑 Evre 3: Yetişkin Kedi (36 - 90 Gün)
- **Görsel Özellik**: İri, parlak tüylü, kaslı veya sevimli göbekli, oturmuş asil kedi formu.
- **İhtiyaçlar**: Yetişkin maması, su pınarı, düzenli banyo/tarama, tırnak kesimi, kuduz/lösemi aşıları.
- **Karakter**: Lazer kovalamaca, camdan kuş izleme, kutu içine sıkışma, sahibine sürtünerek mırıldama.

### 🧣 Evre 4: Yaşlı Kedi (91+ Gün)
- **Görsel Özellik**: Bıyıklarında hafif beyazlıklar, daha bilge ve uykucu bakışlar, yumuşak tüyler.
- **İhtiyaçlar**: Yaşlı kedi maması, eklem takviyeleri, sık veteriner kontrolü, yumuşak ortopedik yatak.
- **Karakter**: Soba/kalorifer yanında derin uyku, yavaş ve temkinli adımlar, yoğun sevgi ve mırıltı.

---

## 🏡 3. Odalar ve Yaşam Alanları (Rooms & Environments)

Kedi tek bir yerde durmaz; ev içinde odalar arasında dolaşır. Her odanın kendine has etkileşimleri ve eşyaları vardır:

| Oda | Fonksiyon & Aktiviteler | İnteraktif Objeler |
|---|---|---|
| 🛋️ **Salon (Living Room)** | Dinlenme, sosyalleşme, tırmalama, uyku | Tırmalama kulesi, kedi yatağı, TV, oyuncak fare, halı |
| 🥣 **Mutfak (Kitchen)** | Beslenme, su içme, ödül maması | Mama kabı, otomatik su pınarı, kedi çimi, buzdolabı |
| 🛁 **Banyo & Bakım (Bathroom)** | Yıkama, fırçalama, tırnak kesimi, tuvalet | Köpüklü küvet, kurutma makinesi, tarak, kum kabı |
| 🌿 **Bahçe & Balkon (Garden/Balcony)** | Doğa keşfi, böcek avlama, güneşlenme | Kedi filesi, saksı bitkileri, kelebekler, güneş minderi |
| 🏥 **Veteriner Kliniği (Clinic)** | Aşılar, muayene, ilaç/şurup, vitamin | Muayene masası, stetoskop, aşı enjektörü, tartı, röntgen |

---

## 🎬 4. Detaylı Animasyon & Sprite İhtiyaç Matrisi

Oyunun canlı hissettirmesi için her kedi ırkı ve her yaş evresi için aşağıdaki standart **6 Frame (veya 8 Frame)** animasyon setlerine ihtiyaç vardır:

### 📋 Animasyon Tablosu (Her Kedi İçin 12 Temel Hareket):

1. **`IDLE` (Oturma & Nefes Alma)**: Kedi oturur, kuyruğunu yavaşça sallar, etrafa bakınır, göz kırpar.
2. **`WALK` (Doğal Yürüme)**: 4 patinin koordineli adımlaması, yumuşak kedi salınımı.
3. **`RUN / ZOOMIES` (Hızlı Koşma)**: Kulaklar arkaya yatık, hızlı bacak döngüsü.
4. **`SLEEP` (Kıvrılıp Uyuma)**: Gözler kapalı, gövde inip kalkar, uyku baloncukları (`Zzz`).
5. **`EAT_DRINK` (Yeme & İçme)**: Başını kaba eğer, diliyle yalar/çiğner, bıyıklarını temizler.
6. **`CUDDLE / HAPPY` (Sevimlilik & Mırıltı)**: Sırtüstü yatar, göbüşünü açar, patilerini havaya kaldırıp mırıldanır (`💖`).
7. **`ATTACK / POUNCE` (Saldırı & Tırmalama)**: Popoyu sallar, öne atılır, patisiyle tırmalar veya tırnak biler.
8. **`BATH / GROOM` (Temizlik & Yıkanma)**: Patisini yalayıp yüzünü siler, köpükler içinde silkinir.
9. **`SICK / SHIVER` (Hastalık & Halsizlik)**: Büzüşmüş duruş, titreme, baş öne eğik, termometre / gözyaşı (`🤒`).
10. **`LITTER_BOX` (Kum Kabı)**: Kumu eşeler, işini görür ve kumu örter.
11. **`MEOW / CALL` (Miyavlama & İlgi İsteme)**: Ağzını açar, sahibine doğru başını kaldırıp seslenir.
12. **`SURPRISE / HISS` (Korkma / Tıslama)**: Sırtını kamburlaştırır, kuyruğunu kabartır, şaşkın zıplama.

---

## 💉 5. Sağlık, Aşı ve Bakım Mekaniği

Kedi sadece beslenmez; düzenli tıbbi ve hijyenik bakım ister:

### 💉 Aşı Takvimi Sistemi:
- **7. Gün**: İç & Dış Parazit Damlası
- **14. Gün**: Karma Aşı 1. Doz
- **28. Gün**: Karma Aşı 2. Doz & Lösemi
- **45. Gün**: Kuduz Aşısı
- **Yıllık**: Rutin kontrol & bağışıklık güçlendirici

### 🧼 Banyo & Tımar Mini-Oyunu:
- Kedi kirlenince (bahçede oynadıktan sonra) tüyleri çamurlanır.
- Banyo odasında su sıcaklığı ayarlanır, şampuan köpürtülür, suyla durulanır ve kurutulur.
- Fırça ile taranınca tüyleri parlar ve mutluluk barı %100 dolar.

---

## 📲 6. iOS 17+ İnteraktif Widget Mimarisi

Kullanıcı uygulamayı açmadan Ana Ekrandan (Home Screen) kedisini doğrudan yönetebilir:

```
┌─────────────────────────────────────────────────────────┐
│  🐾 Pamuk (Genç • 18 Günlük)               [🛋️ Salon] ▼ │
│                                                         │
│     [🛏️]               🐱 (Dolaşıyor)          [🥣]    │
│    ═════════════════════════════════════════════════    │
│  🍽️ %85    💧 %70    💕 %90    ❤️ %100                   │
│  [🥣 Mama Ver]    [💧 Su Ver]    [💕 Sev]    [💉 Aşı]    │
└─────────────────────────────────────────────────────────┘
```

- **App Intents ile Canlı Butonlar**: Widget'taki "Mama Ver"e basınca uygulama açılmadan animasyon tetiklenir ve stat barı güncellenir.
- **Oda Değiştirici Butonları**: Widget üzerinden `[🛋️ Salon]`, `[🥣 Mutfak]`, `[🌿 Bahçe]` butonlarıyla kedinin bulunduğu mekan değiştirilir.
- **Dinamik Arka Planlar**: Gündüz güneşli oda, gece yıldızlı ve loş oda ışıkları.

---

## 🎨 7. Yapay Zeka Görsel Üretim Formülleri & Prompt Şablonları

Görselleri Midjourney, FLUX veya DALL-E 3 ile üretirken kusursuz stil tutarlılığı yakalamak için kullanılacak prompt mimarisi:

### 📌 Evrensel Stil Promptu (Ana Şablon):
> **Style Modifier**: `in Duolingo 2D flat vector art style, clean outlines, vibrant pastel colors, adorable kawaii proportions, minimalist shading, transparent background, sprite sheet format, game asset, 4k resolution, no background, isolated PNG`

### 🐱 Örnek Sprite Sheet Promptları:

#### 1. Yavru British Shorthair (Yürüme & Koşma):
```text
Sprite sheet of a tiny cute baby British Shorthair kitten walking and running, 6 frames animation sequence from left to right, chubby cheeks, big emerald eyes, short stubby legs, adorable Duolingo flat vector style, vibrant colors, clean vector lines, transparent background, isolated game asset --v 6.0 --ar 1:1
```

#### 2. Genç Tekir Kedi (Oyun & Saldırı):
```text
Sprite sheet of an energetic young Tabby cat pouncing and playing with a red yarn ball, 6 frames animation sequence, striped fur, playful dynamic poses, flat minimalist vector art, Duolingo cartoon style, transparent background --v 6.0 --ar 1:1
```

#### 3. Yetişkin İran Kedisi (Banyo & Taranma):
```text
Sprite sheet of a fluffy adult white Persian cat taking a soapy bubble bath and grooming itself with its paw, 6 frames animation sequence, luxurious fluffy fur, cute expressions, flat vector game asset, transparent background --v 6.0 --ar 1:1
```

#### 4. 5 Oda Arka Planı (Mutfak, Salon, Banyo, Bahçe, Klinik):
```text
2D cozy cartoon cat living room interior background, flat vector Duolingo game style, warm pastel lighting, cute scratching post, soft cat bed, wooden floor, minimalist aesthetic, side-view horizontal game stage, 16:9 aspect ratio --v 6.0
```

---

## 📁 8. Yeni Proje Klasör Yapısı (`CatSimulator/`)

```
CatSimulator/
├── GAME_DESIGN_DOCUMENT.md      <-- Bu detaylı tasarım rehberi
├── Assets/                      <-- Ham görseller, arka planlar, sprite'lar
│   ├── Sprites/                 <-- 4 Evre kedi sprite sheet'leri
│   │   ├── Baby/
│   │   ├── Junior/
│   │   ├── Adult/
│   │   └── Senior/
│   ├── Rooms/                   <-- Salon, Mutfak, Banyo, Bahçe, Klinik
│   ├── Items/                   <-- Biberon, mama, aşı, tarak, oyuncaklar
│   └── Audio/                   <-- Miyavlama, mırıltı, yeme, su sesleri
├── Tools/                       <-- Sprite dilimleyici ve test araçları
│   └── sprite_studio.html       <-- Çoklu oda & animasyon test arayüzü
├── Engine/                      <-- Swift Simülatör Çekirdeği
│   ├── CatLifeCycle.swift       <-- Büyüme, yaş, metabolizma motoru
│   ├── MedicalSystem.swift      <-- Aşı, hastalık, tedavi motoru
│   └── RoomManager.swift        <-- Oda geçişleri ve nesne etkileşimi
└── Widgets/                     <-- iOS 17 İnteraktif Widget mimarisi
```

---
*Bu doküman projenin ana omurgasını oluşturur. Adım adım tüm varlıkları üreterek ve motoru kodlayarak ilerlenecektir.*
