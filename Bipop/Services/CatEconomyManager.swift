import Foundation
import SwiftUI

// MARK: - Market Eşyası Türü
public enum CatShopItemType: String, Codable, CaseIterable {
    case food = "food"
    case drink = "drink"
    case toy = "toy"
    case accessory = "accessory"
}

// MARK: - Market Eşya Modeli
public struct CatShopItem: Identifiable, Codable, Equatable {
    public let id: String
    public let name: String
    public let description: String
    public let icon: String
    public let type: CatShopItemType
    public let price: Int
    public let hungerBoost: Double
    public let thirstBoost: Double
    public let happinessBoost: Double
    public let energyBoost: Double
    public let isPremium: Bool // Reklamla veya coin ile alınabilir

    public init(
        id: String,
        name: String,
        description: String,
        icon: String,
        type: CatShopItemType,
        price: Int,
        hungerBoost: Double = 0,
        thirstBoost: Double = 0,
        happinessBoost: Double = 0,
        energyBoost: Double = 0,
        isPremium: Bool = false
    ) {
        self.id = id
        self.name = name
        self.description = description
        self.icon = icon
        self.type = type
        self.price = price
        self.hungerBoost = hungerBoost
        self.thirstBoost = thirstBoost
        self.happinessBoost = happinessBoost
        self.energyBoost = energyBoost
        self.isPremium = isPremium
    }
}

// MARK: - Market Kataloğu
public final class CatEconomyManager: ObservableObject {
    public static let shared = CatEconomyManager()

    public static let catalog: [CatShopItem] = [
        // MAMALAR
        CatShopItem(id: "food_basic", name: "Standart Kuru Mama", description: "Günlük çıtır kedi maması", icon: "fork.knife", type: .food, price: 15, hungerBoost: 25, happinessBoost: 10),
        CatShopItem(id: "food_salmon", name: "Taze Somon Balığı", description: "Omega-3 zengini leziz somon", icon: "fish.fill", type: .food, price: 40, hungerBoost: 50, happinessBoost: 35),
        CatShopItem(id: "food_gourmet", name: "Kral Karides Konservesi", description: "Gurme lüks ziyafet", icon: "star.fill", type: .food, price: 80, hungerBoost: 80, happinessBoost: 60, isPremium: true),

        // İÇECEKLER
        CatShopItem(id: "drink_water", name: "Pınar Suyu", description: "Taptaze dağ pınar suyu", icon: "drop.fill", type: .drink, price: 10, thirstBoost: 35),
        CatShopItem(id: "drink_milk", name: "Ilık Kedi Sütü", description: "Laktozsuz besleyici kedi sütü", icon: "cup.and.saucer.fill", type: .drink, price: 30, thirstBoost: 50, happinessBoost: 25),
        CatShopItem(id: "drink_fountain", name: "Filtreli Su Sebili", description: "Sürekli akan şifalı pınar", icon: "water.waves", type: .drink, price: 120, thirstBoost: 100, happinessBoost: 50, isPremium: true),

        // OYUNCAKLAR
        CatShopItem(id: "toy_mouse", name: "Kurmalı Oyuncak Fare", description: "Kedini neşelendirir", icon: "bolt.fill", type: .toy, price: 50, happinessBoost: 40, energyBoost: -10),
        CatShopItem(id: "toy_yarn", name: "Renkli Yün Yumağı", description: "Oynaması çok eğlenceli", icon: "circle.grid.cross.fill", type: .toy, price: 35, happinessBoost: 30),
        CatShopItem(id: "toy_laser", name: "Pro Lazer Kalemi", description: "Avcılık reflekslerini coşturur", icon: "laser.burst", type: .toy, price: 90, happinessBoost: 70, energyBoost: -20, isPremium: true),

        // AKSESUARLAR
        CatShopItem(id: "acc_gold_collar", name: "Altın Çanlı Tasma", description: "Asil ve şık kedi tasması", icon: "bell.fill", type: .accessory, price: 150, happinessBoost: 50),
        CatShopItem(id: "acc_crown", name: "Kraliyet Tacı", description: "Minik kral tacı", icon: "crown.fill", type: .accessory, price: 300, happinessBoost: 100, isPremium: true)
    ]

    private init() {}

    /// Eşya satın al ve kediye uygula
    public func buyItem(_ item: CatShopItem, for cat: inout PetCat) -> Bool {
        guard cat.coins >= item.price else { return false }
        cat.coins -= item.price

        if item.hungerBoost > 0 { cat.hunger = min(100, cat.hunger + item.hungerBoost) }
        if item.thirstBoost > 0 { cat.thirst = min(100, cat.thirst + item.thirstBoost) }
        if item.happinessBoost > 0 { cat.happiness = min(100, cat.happiness + item.happinessBoost) }
        if item.energyBoost != 0 { cat.energy = max(0, min(100, cat.energy + item.energyBoost)) }

        cat.lastSavedTimestamp = Date()
        cat.updatedAt = Date()
        return true
    }
}
