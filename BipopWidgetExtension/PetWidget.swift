import WidgetKit
import SwiftUI

// MARK: - Pet Widget Entry
public struct PetWidgetEntry: TimelineEntry {
    public let date: Date
    public let pet: PetCat?
    public let aquarium: Aquarium?
    public let tree: AppleTree?
    public let pose: CatPose  // Farklı timeline tick'lerinde farklı pozlar
    public let frameIndex: Int // 0..5 animasyon karesi

    public init(date: Date, pet: PetCat? = nil, aquarium: Aquarium? = nil, tree: AppleTree? = nil, pose: CatPose = .idle, frameIndex: Int = 0) {
        self.date = date
        self.pet = pet
        self.aquarium = aquarium
        self.tree = tree
        self.pose = pose
        self.frameIndex = frameIndex
    }
}

// MARK: - Kedi Pozları (widget'ta sprite animasyon efekti)
public enum CatPose: String, CaseIterable {
    case idle       // Oturuyor
    case walking    // Yürüyor
    case sleeping   // Uyuyor
    case eating     // Yiyor
    case crying     // Ağlıyor (acıkmış/susamış)
    case happy      // Mutlu (sevilmiş)
    case sick       // Hasta

    public var animation: CatAnimation {
        switch self {
        case .idle:     return .idle
        case .walking:  return .walk
        case .sleeping: return .sleep
        case .eating:   return .eat
        case .crying:   return .cry
        case .happy:    return .happy
        case .sick:     return .cry
        }
    }

    public var iconName: String {
        switch self {
        case .idle:     return "pawprint.fill"
        case .walking:  return "figure.walk"
        case .sleeping: return "moon.fill"
        case .eating:   return "fork.knife"
        case .crying:   return "exclamationmark.circle.fill"
        case .happy:    return "sparkles"
        case .sick:     return "cross.case.fill"
        }
    }

    /// Kedinin durumuna göre poz belirle
    public static func fromCat(_ cat: PetCat) -> CatPose {
        if cat.isSick { return .sick }
        if cat.hunger < 25 || cat.thirst < 25 { return .crying }
        if cat.happiness < 25 { return .crying }
        if cat.hunger > 85 && cat.thirst > 85 && cat.happiness > 70 { return .happy }

        // Gece uyku vakti
        let hour = Calendar.current.component(.hour, from: Date())
        if hour >= 23 || hour < 6 { return .sleeping }

        return [CatPose.idle, .walking, .idle, .walking, .happy].randomElement() ?? .idle
    }
}

// MARK: - Pet Timeline Provider
public struct PetTimelineProvider: TimelineProvider {
    public typealias Entry = PetWidgetEntry

    public init() {}

    public func placeholder(in context: Context) -> PetWidgetEntry {
        PetWidgetEntry(date: Date(), pose: .idle, frameIndex: 0)
    }

    public func getSnapshot(in context: Context, completion: @escaping (PetWidgetEntry) -> Void) {
        let entry = loadEntry(date: Date())
        completion(entry)
    }

    public func getTimeline(in context: Context, completion: @escaping (Timeline<PetWidgetEntry>) -> Void) {
        var entries: [PetWidgetEntry] = []
        let now = Date()

        // Her 15 dakikada bir entry oluştur (farklı pozlarla → widget'ta hareket hissi)
        for i in 0..<8 { // 2 saat'lik timeline
            let entryDate = now.addingTimeInterval(Double(i) * 15 * 60)
            var entry = loadEntry(date: entryDate)

            if let cat = entry.pet {
                let poses: [CatPose] = [.idle, .walking, .idle, .walking, .sleeping, .idle, .happy, .walking]
                let basePose = CatPose.fromCat(cat)
                let frameIndex = (i * 2) % 6

                if basePose == .happy || basePose == .idle {
                    entry = PetWidgetEntry(
                        date: entryDate,
                        pet: cat,
                        aquarium: entry.aquarium,
                        tree: entry.tree,
                        pose: poses[i % poses.count],
                        frameIndex: frameIndex
                    )
                } else {
                    entry = PetWidgetEntry(
                        date: entryDate,
                        pet: cat,
                        aquarium: entry.aquarium,
                        tree: entry.tree,
                        pose: basePose,
                        frameIndex: frameIndex
                    )
                }
            }

            entries.append(entry)
        }

        // 15 dakikada bir yenile
        let nextUpdate = now.addingTimeInterval(15 * 60)
        let timeline = Timeline(entries: entries, policy: .after(nextUpdate))
        completion(timeline)
    }

    private func loadEntry(date: Date) -> PetWidgetEntry {
        let profile = SharedStorage.shared.getUserProfile()
        let userId = profile.id
        let defaults = UserDefaults(suiteName: "group.com.bipop.app")

        // Kedi yükle ve gerçek zamanlı offline ilerlemeyi hesapla
        var cat: PetCat? = nil
        if let data = defaults?.data(forKey: "pet_cat_\(userId)"),
           var loaded = try? JSONDecoder().decode(PetCat.self, from: data) {
            loaded.applyOfflineProgress(to: date)
            cat = loaded
            // Güncellenmiş haliyle kaydet
            if let saveData = try? JSONEncoder().encode(loaded) {
                defaults?.set(saveData, forKey: "pet_cat_\(userId)")
            }
        }

        // Akvaryum yükle
        var aquarium: Aquarium? = nil
        if let data = defaults?.data(forKey: "aquarium_\(userId)"),
           var loaded = try? JSONDecoder().decode(Aquarium.self, from: data) {
            loaded.tick()
            aquarium = loaded
            if let saveData = try? JSONEncoder().encode(loaded) {
                defaults?.set(saveData, forKey: "aquarium_\(userId)")
            }
        }

        // Ağaç yükle
        var tree: AppleTree? = nil
        if let data = defaults?.data(forKey: "apple_tree_\(userId)"),
           var loaded = try? JSONDecoder().decode(AppleTree.self, from: data) {
            loaded.tick()
            tree = loaded
            if let saveData = try? JSONEncoder().encode(loaded) {
                defaults?.set(saveData, forKey: "apple_tree_\(userId)")
            }
        }

        let pose: CatPose = cat.map { CatPose.fromCat($0) } ?? .idle
        return PetWidgetEntry(date: date, pet: cat, aquarium: aquarium, tree: tree, pose: pose, frameIndex: 0)
    }
}

// MARK: - iOS 17+ İnteraktif Widget AppIntents (Doğrudan Ana Ekrandan Besleme)
#if canImport(AppIntents)
import AppIntents

@available(iOS 17.0, *)
public struct FeedPetAppIntent: AppIntent {
    public static var title: LocalizedStringResource = "Kediyi Besle"
    public static var description = IntentDescription("Widget üzerinden kedine anında mama verir.")

    public init() {}

    public func perform() async throws -> some IntentResult {
        let profile = SharedStorage.shared.getUserProfile()
        let defaults = UserDefaults(suiteName: "group.com.bipop.app")
        if let data = defaults?.data(forKey: "pet_cat_\(profile.id)"),
           var cat = try? JSONDecoder().decode(PetCat.self, from: data) {
            cat.feed()
            if let saved = try? JSONEncoder().encode(cat) {
                defaults?.set(saved, forKey: "pet_cat_\(profile.id)")
                WidgetCenter.shared.reloadAllTimelines()
            }
        }
        return .result()
    }
}

@available(iOS 17.0, *)
public struct WaterPetAppIntent: AppIntent {
    public static var title: LocalizedStringResource = "Su Ver"
    public static var description = IntentDescription("Widget üzerinden kedine taze su verir.")

    public init() {}

    public func perform() async throws -> some IntentResult {
        let profile = SharedStorage.shared.getUserProfile()
        let defaults = UserDefaults(suiteName: "group.com.bipop.app")
        if let data = defaults?.data(forKey: "pet_cat_\(profile.id)"),
           var cat = try? JSONDecoder().decode(PetCat.self, from: data) {
            cat.giveWater()
            if let saved = try? JSONEncoder().encode(cat) {
                defaults?.set(saved, forKey: "pet_cat_\(profile.id)")
                WidgetCenter.shared.reloadAllTimelines()
            }
        }
        return .result()
    }
}

@available(iOS 17.0, *)
public struct PetCatAppIntent: AppIntent {
    public static var title: LocalizedStringResource = "Kediyi Sev"
    public static var description = IntentDescription("Widget üzerinden kedini sever ve mutlu edersin.")

    public init() {}

    public func perform() async throws -> some IntentResult {
        let profile = SharedStorage.shared.getUserProfile()
        let defaults = UserDefaults(suiteName: "group.com.bipop.app")
        if let data = defaults?.data(forKey: "pet_cat_\(profile.id)"),
           var cat = try? JSONDecoder().decode(PetCat.self, from: data) {
            cat.pet()
            if let saved = try? JSONEncoder().encode(cat) {
                defaults?.set(saved, forKey: "pet_cat_\(profile.id)")
                WidgetCenter.shared.reloadAllTimelines()
            }
        }
        return .result()
    }
}
#endif
