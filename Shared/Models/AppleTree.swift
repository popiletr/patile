import Foundation

// MARK: - Mevsimler (Görsel Panel 4)
public enum TreeSeason: String, Codable, CaseIterable {
    case spring = "spring"   // İlkbahar — çiçeklenme
    case summer = "summer"   // Yaz — meyve olgunlaşma
    case autumn = "autumn"   // Sonbahar — hasat
    case winter = "winter"   // Kış — dinlenme

    public var displayName: String {
        switch self {
        case .spring: return "İlkbahar"
        case .summer: return "Yaz"
        case .autumn: return "Sonbahar"
        case .winter: return "Kış"
        }
    }

    public var iconName: String {
        switch self {
        case .spring: return "sun.max.fill"
        case .summer: return "sun.and.horizon.fill"
        case .autumn: return "leaf.fill"
        case .winter: return "snowflake"
        }
    }

    /// Haftaya göre mevsim: 13 hafta = 1 yıl döngüsü
    public static func season(forWeek week: Int) -> TreeSeason {
        let weekInYear = week % 52
        switch weekInYear {
        case 0..<13:  return .spring
        case 13..<26: return .summer
        case 26..<39: return .autumn
        default:      return .winter
        }
    }
}

// MARK: - Ağaç Büyüme Aşamaları (Görsel Panel 9)
public enum TreeGrowthStage: String, Codable {
    case seedling = "seedling"     // Hafta 1: Fidan
    case youngTree = "young_tree"  // Hafta 4-12: Genç ağaç
    case matureTree = "mature"     // Hafta 12-20: Olgun ağaç
    case fruitBearing = "fruit"    // Hafta 20+: İlk meyveler

    public var displayName: String {
        switch self {
        case .seedling:     return "Fidan"
        case .youngTree:    return "Genç Ağaç"
        case .matureTree:   return "Olgun Ağaç"
        case .fruitBearing: return "Meyve Veren"
        }
    }

    public var iconName: String {
        switch self {
        case .seedling:     return "leaf.fill"
        case .youngTree:    return "tree.fill"
        case .matureTree:   return "leaf.circle.fill"
        case .fruitBearing: return "circle.circle.fill"
        }
    }

    public static func stage(forWeek week: Int) -> TreeGrowthStage {
        switch week {
        case 0..<4:   return .seedling
        case 4..<12:  return .youngTree
        case 12..<20: return .matureTree
        default:      return .fruitBearing
        }
    }
}

// MARK: - Ana Ağaç Modeli
public struct AppleTree: Codable, Identifiable, Equatable {
    public var id: String
    public var ownerId: String

    // Stat'lar (0-100)
    public var waterLevel: Double        // 100 = iyi sulanmış
    public var soilHealth: Double         // 100 = sağlıklı toprak
    public var treeHealth: Double         // 100 = sağlıklı ağaç

    // Hasat & Üretim
    public var totalApplesHarvested: Int  // Toplam hasat edilen elma
    public var currentApples: Int         // Şu an ağaçta olan elma
    public var isPestInfected: Bool       // Zararlı var mı? (Görsel Panel 8)

    // Zaman
    public var plantedAt: Date            // Dikilme zamanı
    public var lastWateredAt: Date?       // Son sulama
    public var lastHoedAt: Date?          // Son çapa (Görsel Panel 3)
    public var lastPrunedAt: Date?        // Son budama (Görsel Panel 6)
    public var lastFertilizedAt: Date?    // Son gübreleme (Görsel Panel 7)
    public var lastHarvestedAt: Date?     // Son hasat
    public var pestDetectedAt: Date?      // Zararlı tespit zamanı

    public var createdAt: Date
    public var updatedAt: Date

    public init(
        id: String = UUID().uuidString,
        ownerId: String
    ) {
        self.id = id
        self.ownerId = ownerId
        self.waterLevel = 50
        self.soilHealth = 70
        self.treeHealth = 100
        self.totalApplesHarvested = 0
        self.currentApples = 0
        self.isPestInfected = false
        self.plantedAt = Date()
        self.createdAt = Date()
        self.updatedAt = Date()
    }

    // MARK: - Computed

    /// Kaç haftalık
    public var ageInWeeks: Int {
        let days = Calendar.current.dateComponents([.day], from: plantedAt, to: Date()).day ?? 0
        return days / 7
    }

    /// Büyüme aşaması
    public var growthStage: TreeGrowthStage {
        TreeGrowthStage.stage(forWeek: ageInWeeks)
    }

    /// Mevcut mevsim
    public var currentSeason: TreeSeason {
        TreeSeason.season(forWeek: ageInWeeks)
    }

    /// Hasat zamanı mı?
    public var canHarvest: Bool {
        growthStage == .fruitBearing && currentApples > 0 && currentSeason == .autumn
    }

    /// Sulama gerekiyor mu? (Her gün)
    public var needsWatering: Bool {
        guard let lastWater = lastWateredAt else { return true }
        let hours = Calendar.current.dateComponents([.hour], from: lastWater, to: Date()).hour ?? 0
        return hours >= 20
    }

    /// Çapa gerekiyor mu? (Haftalık)
    public var needsHoeing: Bool {
        guard let lastHoe = lastHoedAt else { return true }
        let days = Calendar.current.dateComponents([.day], from: lastHoe, to: Date()).day ?? 0
        return days >= 7
    }

    // MARK: - Actions

    /// Sula (Görsel Panel 2)
    public mutating func water() {
        waterLevel = min(100, waterLevel + 40)
        lastWateredAt = Date()
        updatedAt = Date()
    }

    /// Çapa yap (Görsel Panel 3)
    public mutating func hoe() {
        soilHealth = min(100, soilHealth + 25)
        lastHoedAt = Date()
        updatedAt = Date()
    }

    /// Budama (Görsel Panel 6)
    public mutating func prune() {
        treeHealth = min(100, treeHealth + 15)
        lastPrunedAt = Date()
        updatedAt = Date()
        // Budama sonrası +%20 daha fazla elma üretir
    }

    /// Gübrele (Görsel Panel 7)
    public mutating func fertilize() {
        soilHealth = min(100, soilHealth + 30)
        treeHealth = min(100, treeHealth + 10)
        lastFertilizedAt = Date()
        updatedAt = Date()
    }

    /// Hasat et (Görsel Panel 5)
    public mutating func harvest() -> Int {
        guard canHarvest else { return 0 }
        let harvested = currentApples
        totalApplesHarvested += harvested
        currentApples = 0
        lastHarvestedAt = Date()
        updatedAt = Date()
        return harvested
    }

    /// Zararlı tedavisi (Görsel Panel 8)
    public mutating func treatPest() {
        guard isPestInfected else { return }
        isPestInfected = false
        pestDetectedAt = nil
        treeHealth = min(100, treeHealth + 20)
        updatedAt = Date()
        // Tedavi 3 gün sürer gibi yapılabilir
    }

    // MARK: - Time Tick
    public mutating func tick() {
        // Su: saatte ~2 birim azalır
        waterLevel = max(0, waterLevel - 2)

        // Toprak: saatte ~0.5 birim azalır
        soilHealth = max(0, soilHealth - 0.5)

        // Meyve üretimi (sadece yaz ve sonbahar, olgun ağaçlarda)
        if growthStage == .fruitBearing && (currentSeason == .summer || currentSeason == .autumn) {
            if waterLevel > 30 && soilHealth > 30 && !isPestInfected {
                // Saatte düşük olasılıkla elma üretir
                if Double.random(in: 0...1) < 0.05 {
                    currentApples += 1
                }
            }
        }

        // Zararlı: düşük toprak sağlığında %5 şans
        if !isPestInfected && soilHealth < 25 {
            if Double.random(in: 0...1) < 0.05 {
                isPestInfected = true
                pestDetectedAt = Date()
            }
        }

        // Zararlı hasar: ağaç sağlığını düşürür
        if isPestInfected {
            treeHealth = max(0, treeHealth - 2)
        }

        // Kış: ağaç dinlenir, su ihtiyacı azalır
        if currentSeason == .winter {
            waterLevel = max(0, waterLevel + 0.5) // Kışta daha az su ihtiyacı
        }

        updatedAt = Date()
    }
}
