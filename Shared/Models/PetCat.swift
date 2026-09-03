import Foundation

// MARK: - Kedi Türleri (Görsel Panel 1)
public enum CatBreed: String, Codable, CaseIterable, Identifiable {
    case tabby = "tabby"
    case britishShorthair = "british_shorthair"
    case scottishFold = "scottish_fold"
    case blackCat = "black_cat"
    case orangeTabby = "orange_tabby"
    case whitePersian = "white_persian"
    case siamese = "siamese"
    case calico = "calico"

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .tabby:            return "Tekir"
        case .britishShorthair: return "British Shorthair"
        case .scottishFold:     return "Scottish Fold"
        case .blackCat:         return "Siyah Kedi"
        case .orangeTabby:      return "Turuncu Tekir"
        case .whitePersian:     return "White Persian"
        case .siamese:          return "Siyam"
        case .calico:           return "Calico"
        }
    }

    public var subtitle: String {
        switch self {
        case .tabby:            return "tekir"
        case .britishShorthair: return "gri, yuvarlak yüz"
        case .scottishFold:     return "katlanmış kulaklar"
        case .blackCat:         return "siyah kedi"
        case .orangeTabby:      return "turuncu"
        case .whitePersian:     return "beyaz uzun tüylü"
        case .siamese:          return "siyam"
        case .calico:           return "üç renkli"
        }
    }

    public var iconName: String {
        switch self {
        case .tabby:            return "pawprint.fill"
        case .britishShorthair: return "circle.fill"
        case .scottishFold:     return "heart.fill"
        case .blackCat:         return "moon.fill"
        case .orangeTabby:      return "sun.max.fill"
        case .whitePersian:     return "cloud.fill"
        case .siamese:          return "sparkles"
        case .calico:           return "paintpalette.fill"
        }
    }
}

// MARK: - Kedi Cinsiyeti
public enum CatGender: String, Codable {
    case female = "female"
    case male = "male"

    public var displayName: String {
        switch self {
        case .female: return "Dişi"
        case .male:   return "Erkek"
        }
    }

    public var symbol: String {
        switch self {
        case .female: return "D"
        case .male:   return "E"
        }
    }
}

// MARK: - Göz Rengi
public enum CatEyeColor: String, Codable, CaseIterable {
    case green = "green"
    case blue = "blue"
    case amber = "amber"
    case brown = "brown"
    case heterochromia = "heterochromia"

    public var hex: String {
        switch self {
        case .green:         return "#4CAF50"
        case .blue:          return "#2196F3"
        case .amber:         return "#FF9800"
        case .brown:         return "#795548"
        case .heterochromia: return "#9C27B0"
        }
    }
}

// MARK: - Tasma Rengi
public enum CollarColor: String, Codable, CaseIterable {
    case red = "red"
    case blue = "blue"
    case pink = "pink"
    case green = "green"
    case purple = "purple"
    case gold = "gold"

    public var hex: String {
        switch self {
        case .red:    return "#F44336"
        case .blue:   return "#2196F3"
        case .pink:   return "#E91E63"
        case .green:  return "#4CAF50"
        case .purple: return "#9C27B0"
        case .gold:   return "#FFC107"
        }
    }
}

// MARK: - Büyüme Aşamaları (Görsel Panel 9)
public enum CatLifeStage: String, Codable {
    case baby = "baby"         // 0-7 gün
    case young = "young"       // 7-21 gün
    case adult = "adult"       // 21-60 gün
    case senior = "senior"     // 60-90 gün

    public var displayName: String {
        switch self {
        case .baby:   return "Yavru"
        case .young:  return "Genç"
        case .adult:  return "Yetişkin"
        case .senior: return "Yaşlı"
        }
    }

    public var dayRange: String {
        switch self {
        case .baby:   return "0-7 gün"
        case .young:  return "7-21 gün"
        case .adult:  return "21-60 gün"
        case .senior: return "60-90 gün"
        }
    }

    public static func stage(forDay day: Int) -> CatLifeStage {
        switch day {
        case 0..<7:   return .baby
        case 7..<21:  return .young
        case 21..<60: return .adult
        default:      return .senior
        }
    }
}

// MARK: - Sağlık Durumu
public enum CatHealthStatus: String, Codable {
    case healthy = "healthy"
    case hungry = "hungry"
    case thirsty = "thirsty"
    case sick = "sick"
    case recovering = "recovering"
    case needsLove = "needs_love"

    public var iconName: String {
        switch self {
        case .healthy:    return "heart.fill"
        case .hungry:     return "fork.knife"
        case .thirsty:    return "drop.fill"
        case .sick:       return "cross.case.fill"
        case .recovering: return "pills.fill"
        case .needsLove:  return "hand.tap.fill"
        }
    }

    public var message: String {
        switch self {
        case .healthy:    return "Sağlıklı ve mutlu"
        case .hungry:     return "Acıktı"
        case .thirsty:    return "Susadı"
        case .sick:       return "Hasta hissediyor"
        case .recovering: return "İyileşiyor"
        case .needsLove:  return "İlgi bekliyor"
        }
    }
}

// MARK: - Ana Kedi Modeli
public struct PetCat: Codable, Identifiable, Equatable {
    public var id: String
    public var name: String
    public var breed: CatBreed
    public var gender: CatGender
    public var eyeColor: CatEyeColor
    public var collarColor: CollarColor
    public var ownerId: String           // Hangi kullanıcının kedisi

    // Stat'lar (0-100)
    public var hunger: Double            // 100 = tok, 0 = çok aç
    public var thirst: Double            // 100 = suya doymuş, 0 = susuz
    public var happiness: Double         // 100 = çok mutlu, 0 = mutsuz
    public var health: Double            // 100 = sağlıklı, 0 = hasta
    public var energy: Double            // 100 = zinde, 0 = çok yorgun / uyuması lazım
    public var coins: Int                // Mini oyunlardan kazanılan toplam coin
    public var isSleeping: Bool          // Uyku durumu

    // Zaman bilgileri
    public var bornAt: Date              // Doğum anı
    public var lastSavedTimestamp: Date  // En son durum kayıt zamanı (Delta time için)
    public var lastFedAt: Date?          // Son beslenme
    public var lastWateredAt: Date?      // Son su verilme
    public var lastPettedAt: Date?       // Son sevilme
    public var lastMedicineAt: Date?     // Son ilaç

    // Büyüme & Sağlık
    public var isSick: Bool
    public var sickSince: Date?
    public var isPregnant: Bool
    public var pregnantSince: Date?

    // Meta
    public var createdAt: Date
    public var updatedAt: Date

    public init(
        id: String = UUID().uuidString,
        name: String,
        breed: CatBreed,
        gender: CatGender,
        eyeColor: CatEyeColor = .green,
        collarColor: CollarColor = .red,
        ownerId: String
    ) {
        self.id = id
        self.name = name
        self.breed = breed
        self.gender = gender
        self.eyeColor = eyeColor
        self.collarColor = collarColor
        self.ownerId = ownerId
        self.hunger = 85
        self.thirst = 75
        self.happiness = 80
        self.health = 100
        self.energy = 90
        self.coins = 250
        self.isSleeping = false
        self.bornAt = Date()
        self.lastSavedTimestamp = Date()
        self.isSick = false
        self.isPregnant = false
        self.createdAt = Date()
        self.updatedAt = Date()
    }

    // MARK: - Computed Properties

    /// Kaç günlük
    public var ageInDays: Int {
        Calendar.current.dateComponents([.day], from: bornAt, to: Date()).day ?? 0
    }

    /// Yaşam aşaması
    public var lifeStage: CatLifeStage {
        CatLifeStage.stage(forDay: ageInDays)
    }

    /// Genel durum
    public var healthStatus: CatHealthStatus {
        if isSick { return .sick }
        if let _ = lastMedicineAt, isSick { return .recovering }
        if hunger < 25 { return .hungry }
        if thirst < 25 { return .thirsty }
        if happiness < 25 { return .needsLove }
        return .healthy
    }

    /// Büyüme yüzdesi (0-100)
    public var growthPercent: Double {
        switch lifeStage {
        case .baby:   return Double(ageInDays) / 7.0 * 100
        case .young:  return Double(ageInDays - 7) / 14.0 * 100
        case .adult:  return Double(ageInDays - 21) / 39.0 * 100
        case .senior: return 100
        }
    }

    // MARK: - Actions

    /// Mama ver (+30 açlık)
    public mutating func feed() {
        hunger = min(100, hunger + 30)
        lastFedAt = Date()
        lastSavedTimestamp = Date()
        updatedAt = Date()
        checkHealth()
    }

    /// Su ver (+35 susuzluk)
    public mutating func giveWater() {
        thirst = min(100, thirst + 35)
        lastWateredAt = Date()
        lastSavedTimestamp = Date()
        updatedAt = Date()
        checkHealth()
    }

    /// Sev (+25 mutluluk)
    public mutating func pet() {
        happiness = min(100, happiness + 25)
        lastPettedAt = Date()
        lastSavedTimestamp = Date()
        updatedAt = Date()
    }

    /// Uyut / Uyandır
    public mutating func toggleSleep() {
        isSleeping.toggle()
        lastSavedTimestamp = Date()
        updatedAt = Date()
    }

    /// Mini oyundan coin kazan
    public mutating func addCoins(_ amount: Int) {
        coins = max(0, coins + amount)
        lastSavedTimestamp = Date()
        updatedAt = Date()
    }

    /// İlaç ver
    public mutating func giveMedicine() {
        guard isSick else { return }
        lastMedicineAt = Date()
        isSick = false
        health = min(100, health + 40)
        lastSavedTimestamp = Date()
        updatedAt = Date()
    }

    // MARK: - Gerçek Zamanlı Çevrimdışı (Offline) Metabolizma Motoru
    /// Uygulama kapalıyken veya arka plandayken geçen gerçek süreyi hesaplayıp stat'ları düşürür
    public mutating func applyOfflineProgress(to date: Date = Date()) {
        let elapsedSeconds = max(0, date.timeIntervalSince(lastSavedTimestamp))
        guard elapsedSeconds > 1 else { return }

        // 1. Açlık: 12 saatte %100 -> %0 (saatte %8.33)
        let hungerDecay = elapsedSeconds * (100.0 / (12.0 * 3600.0))
        hunger = max(0, hunger - hungerDecay)

        // 2. Susuzluk: 8 saatte %100 -> %0 (saatte %12.50)
        let thirstDecay = elapsedSeconds * (100.0 / (8.0 * 3600.0))
        thirst = max(0, thirst - thirstDecay)

        // 3. Sevgi / Mutluluk: 16 saatte %100 -> %0
        let happyDecay = elapsedSeconds * (100.0 / (16.0 * 3600.0))
        happiness = max(0, happiness - happyDecay)

        // 4. Enerji: Uykudaysa şarj olur (dakikada +%1.2), uyanıksa 8 saatte biter
        if isSleeping {
            let energyGain = elapsedSeconds * (1.2 / 60.0)
            energy = min(100, energy + energyGain)
            if energy >= 100 {
                isSleeping = false // Otomatik uyanır
            }
        } else {
            let energyDecay = elapsedSeconds * (100.0 / (8.0 * 3600.0))
            energy = max(0, energy - energyDecay)
            if energy <= 0 {
                isSleeping = true // Yorgunluktan olduğu yerde uyur
            }
        }

        // 5. Sağlık ve Hastalık Kontrolü
        checkHealth()

        lastSavedTimestamp = date
        updatedAt = date
    }

    private mutating func checkHealth() {
        if hunger < 15 || thirst < 15 {
            isSick = true
            health = max(0, health - 10)
        } else if hunger > 50 && thirst > 50 && !isSick {
            health = min(100, health + 5)
        }
    }
}
