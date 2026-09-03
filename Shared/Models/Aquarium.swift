import Foundation

// MARK: - Balık Türleri (Görsel: 5 Fish Species Selection)
public enum FishSpecies: String, Codable, CaseIterable, Identifiable {
    case goldfish = "goldfish"
    case neonTetra = "neon_tetra"
    case bettaFish = "betta_fish"
    case clownfish = "clownfish"
    case angelfish = "angelfish"

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .goldfish:  return "Japon Balığı"
        case .neonTetra: return "Neon Tetra"
        case .bettaFish: return "Betta Balığı"
        case .clownfish: return "Palyaço Balığı"
        case .angelfish: return "Melek Balığı"
        }
    }

    public var subtitle: String {
        switch self {
        case .goldfish:  return "starter, common"
        case .neonTetra: return "küçük, blue-colored fish"
        case .bettaFish: return "renkli, yaprak kuyruklu"
        case .clownfish: return "turuncu, çizgili"
        case .angelfish: return "tall, elegant silver fish"
        }
    }

    public var iconName: String {
        switch self {
        case .goldfish:  return "fish.fill"
        case .neonTetra: return "fish.fill"
        case .bettaFish: return "fish.fill"
        case .clownfish: return "fish.fill"
        case .angelfish: return "fish.fill"
        }
    }

    /// Kilit açma: bazı türler zaman ile açılır
    public var unlockDayRequirement: Int {
        switch self {
        case .goldfish:  return 0   // Başlangıç
        case .neonTetra: return 0   // Başlangıç
        case .bettaFish: return 7   // 7 gün sonra
        case .clownfish: return 14  // 14 gün sonra
        case .angelfish: return 30  // 30 gün sonra
        }
    }
}

// MARK: - Tank Dekorasyonları
public enum TankDecoration: String, Codable, CaseIterable, Identifiable {
    case coralReef = "coral_reef"
    case treasureChest = "treasure_chest"
    case coloredGravel = "colored_gravel"
    case underwaterCastle = "underwater_castle"
    case livePlants = "live_plants"

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .coralReef:        return "Mercan Resif"
        case .treasureChest:    return "Hazine Sandığı"
        case .coloredGravel:    return "Renkli Çakıl"
        case .underwaterCastle: return "Su Altı Kalesi"
        case .livePlants:       return "Canlı Bitkiler"
        }
    }

    public var iconName: String {
        switch self {
        case .coralReef:        return "leaf.fill"
        case .treasureChest:    return "archivebox.fill"
        case .coloredGravel:    return "circle.grid.2x2.fill"
        case .underwaterCastle: return "building.columns.fill"
        case .livePlants:       return "leaf.arrow.triangle.circlepath"
        }
    }
}

// MARK: - Tekil Balık
public struct AquariumFish: Codable, Identifiable, Equatable {
    public var id: String
    public var species: FishSpecies
    public var name: String
    public var ageInDays: Int
    public var isSick: Bool
    public var createdAt: Date

    public init(
        id: String = UUID().uuidString,
        species: FishSpecies,
        name: String,
        ageInDays: Int = 1,
        isSick: Bool = false,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.species = species
        self.name = name
        self.ageInDays = ageInDays
        self.isSick = isSick
        self.createdAt = createdAt
    }
}

// MARK: - Akvaryum Modeli
public struct Aquarium: Codable, Identifiable, Equatable {
    public var id: String
    public var ownerId: String
    public var fish: [AquariumFish]
    public var decorations: [TankDecoration]
    public var waterQuality: Double
    public var foodLevel: Double
    public var lastWaterChangedAt: Date?
    public var lastFedAt: Date?
    public var createdAt: Date

    public init(
        id: String = UUID().uuidString,
        ownerId: String,
        fish: [AquariumFish] = [
            AquariumFish(species: .goldfish, name: "Baloncuk"),
            AquariumFish(species: .neonTetra, name: "Maviş")
        ],
        decorations: [TankDecoration] = [.livePlants],
        waterQuality: Double = 100.0,
        foodLevel: Double = 100.0,
        lastWaterChangedAt: Date? = Date(),
        lastFedAt: Date? = Date(),
        createdAt: Date = Date()
    ) {
        self.id = id
        self.ownerId = ownerId
        self.fish = fish
        self.decorations = decorations
        self.waterQuality = waterQuality
        self.foodLevel = foodLevel
        self.lastWaterChangedAt = lastWaterChangedAt
        self.lastFedAt = lastFedAt
        self.createdAt = createdAt
    }

    // MARK: - Computed

    public var fishCount: Int { fish.count }

    public var healthStatus: String {
        if waterQuality < 20 { return "Kritik! Su değişimi gerekiyor" }
        if waterQuality < 50 { return "Su kalitesi düşük" }
        if foodLevel < 20 { return "Balıklar aç!" }
        return "İyi durumda"
    }

    public var isClean: Bool {
        return waterQuality >= 50
    }

    public var healthIcon: String {
        if waterQuality < 20 { return "exclamationmark.triangle.fill" }
        if waterQuality < 50 { return "exclamationmark.triangle" }
        return "checkmark.circle.fill"
    }

    /// Su değişimi gerekiyor mu? (3-4 günde bir)
    public var needsWaterChange: Bool {
        guard let lastChange = lastWaterChangedAt else { return true }
        let days = Calendar.current.dateComponents([.day], from: lastChange, to: Date()).day ?? 0
        return days >= 3
    }

    // MARK: - Actions

    /// Balıkları besle
    public mutating func feedFish() {
        foodLevel = min(100, foodLevel + 40)
        lastFedAt = Date()
        updatedAt = Date()
    }

    /// Su değiştir
    public mutating func changeWater() {
        waterQuality = 100
        lastWaterChangedAt = Date()
        updatedAt = Date()
        // Hasta balıkları iyileştirme şansı
        for i in fish.indices where fish[i].isSick {
            if Double.random(in: 0...1) < 0.5 {
                fish[i].isSick = false
            }
        }
    }

    /// Yeni balık ekle
    public mutating func addFish(_ species: FishSpecies, name: String = "") {
        let newFish = AquariumFish(species: species, name: name)
        fish.append(newFish)
        updatedAt = Date()
    }

    /// Dekorasyon ekle
    public mutating func addDecoration(_ decoration: TankDecoration) {
        if !decorations.contains(decoration) {
            decorations.append(decoration)
            updatedAt = Date()
        }
    }

    // MARK: - Time Tick
    public mutating func tick() {
        // Su kalitesi: saatte ~1.5 birim azalır (balık sayısına bağlı)
        let degradeRate = 1.5 + Double(fish.count) * 0.3
        waterQuality = max(0, waterQuality - degradeRate)

        // Yem: saatte ~2 birim azalır
        foodLevel = max(0, foodLevel - 2)

        // Düşük su kalitesinde hastalık
        if waterQuality < 20 {
            for i in fish.indices where !fish[i].isSick {
                if Double.random(in: 0...1) < 0.15 {
                    fish[i].isSick = true
                }
            }
        }

        updatedAt = Date()
    }
}
