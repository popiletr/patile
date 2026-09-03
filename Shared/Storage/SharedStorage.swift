import Foundation
import SwiftUI
#if canImport(UIKit)
import UIKit
#endif
#if canImport(WidgetKit)
import WidgetKit
#endif

// MARK: - Color Extension for Hex Support
public extension Color {
    init(hex: String) {
        let cleanHex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: cleanHex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch cleanHex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Shared Storage (Production-Grade Inbox/Outbox AppGroup Storage)
public final class SharedStorage {
    public static let shared = SharedStorage()
    
    private let defaults: UserDefaults
    private let jsonEncoder = JSONEncoder()
    private let jsonDecoder = JSONDecoder()
    
    private var sharedContainerURL: URL? {
        FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: AppGroupConstants.appGroupId)
    }
    
    private var fileInboxPopURL: URL? {
        sharedContainerURL?.appendingPathComponent("inbox_latest.json")
    }
    
    private var fileProfileURL: URL? {
        sharedContainerURL?.appendingPathComponent("user_profile.json")
    }
    
    private init() {
        if let groupDefaults = UserDefaults(suiteName: AppGroupConstants.appGroupId) {
            self.defaults = groupDefaults
        } else {
            self.defaults = .standard
        }
        
        jsonEncoder.dateEncodingStrategy = .iso8601
        
        jsonDecoder.dateDecodingStrategy = .custom { decoder -> Date in
            let container = try decoder.singleValueContainer()
            let dateStr = try container.decode(String.self)
            let iso = ISO8601DateFormatter()
            iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let d = iso.date(from: dateStr) { return d }
            iso.formatOptions = [.withInternetDateTime]
            if let d = iso.date(from: dateStr) { return d }
            let sql = DateFormatter()
            sql.dateFormat = "yyyy-MM-dd HH:mm:ss"
            return sql.date(from: dateStr) ?? Date()
        }
    }
    
    // MARK: - Current User Info
    public func getCurrentUserId() -> String {
        return getUserProfile().id
    }
    
    public func getCurrentUsername() -> String {
        return getUserProfile().username.lowercased().replacingOccurrences(of: "@", with: "").trimmingCharacters(in: .whitespacesAndNewlines)
    }
    
    // MARK: - 1. INBOX: Latest Received Pop (For Widget & Feed)
    public func saveLatestPop(_ pop: PopItem) {
        saveLatestInboxPop(pop)
    }
    
    public func saveLatestInboxPop(_ pop: PopItem) {
        if let encoded = try? jsonEncoder.encode(pop) {
            defaults.set(encoded, forKey: AppGroupConstants.keyLatestPop)
            defaults.synchronize()
            UserDefaults.standard.set(encoded, forKey: AppGroupConstants.keyLatestPop)
            UserDefaults.standard.synchronize()
            if let fileURL = fileInboxPopURL {
                try? encoded.write(to: fileURL, options: .atomic)
            }
            addInboxPop(pop)
            reloadWidgets()
        }
    }
    
    public func clearLatestInboxPop() {
        defaults.removeObject(forKey: AppGroupConstants.keyLatestPop)
        defaults.synchronize()
        UserDefaults.standard.removeObject(forKey: AppGroupConstants.keyLatestPop)
        UserDefaults.standard.synchronize()
        if let fileURL = fileInboxPopURL { try? FileManager.default.removeItem(at: fileURL) }
        reloadWidgets()
    }
    
    public func getLatestPop() -> PopItem? {
        return getLatestInboxPop()
    }
    
    public func getLatestInboxPop() -> PopItem? {
        // 1. Suite UserDefaults
        if let data = defaults.data(forKey: AppGroupConstants.keyLatestPop),
           let pop = try? jsonDecoder.decode(PopItem.self, from: data) {
            return pop
        }
        
        // 2. File container
        if let fileURL = fileInboxPopURL,
           let data = try? Data(contentsOf: fileURL),
           let pop = try? jsonDecoder.decode(PopItem.self, from: data) {
            return pop
        }
        
        // 3. Standard UserDefaults
        if let data = UserDefaults.standard.data(forKey: AppGroupConstants.keyLatestPop),
           let pop = try? jsonDecoder.decode(PopItem.self, from: data) {
            return pop
        }
        
        return nil
    }
    
    // MARK: - 2. INBOX History (Gelen Kutusu)
    public func getPopHistory() -> [PopItem] {
        return getInboxHistory()
    }
    
    public func getInboxHistory() -> [PopItem] {
        var rawList: [PopItem] = []
        if let data = defaults.data(forKey: AppGroupConstants.keyPopHistory),
           let history = try? jsonDecoder.decode([PopItem].self, from: data) {
            rawList = history
        } else if let data = UserDefaults.standard.data(forKey: AppGroupConstants.keyPopHistory),
                  let history = try? jsonDecoder.decode([PopItem].self, from: data) {
            rawList = history
        }
        
        return rawList.filter { pop in
            if pop.senderName == "B!Pop" || pop.senderUsername == "bipop" || pop.senderId == "system" || pop.senderId == "partner-1" || pop.id.contains("waiting") || pop.id.contains("test") {
                return false
            }
            if pop.type == .note, let text = pop.notePayload?.text, text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || text == "B!Pop" || text == "Not" {
                return false
            }
            return true
        }
    }
    
    public func addPopToHistory(_ pop: PopItem) {
        addInboxPop(pop)
    }
    
    public func addInboxPop(_ pop: PopItem) {
        if pop.senderName == "B!Pop" || pop.senderId == "system" || pop.senderId == "partner-1" { return }
        
        var current = getInboxHistory()
        if !current.contains(where: { $0.id == pop.id }) {
            current.insert(pop, at: 0)
            if current.count > 50 {
                current = Array(current.prefix(50))
            }
            if let encoded = try? jsonEncoder.encode(current) {
                defaults.set(encoded, forKey: AppGroupConstants.keyPopHistory)
                defaults.synchronize()
                UserDefaults.standard.set(encoded, forKey: AppGroupConstants.keyPopHistory)
                UserDefaults.standard.synchronize()
            }
        }
    }
    
    public func saveInboxHistory(_ list: [PopItem]) {
        if let encoded = try? jsonEncoder.encode(list) {
            defaults.set(encoded, forKey: AppGroupConstants.keyPopHistory)
            defaults.synchronize()
            UserDefaults.standard.set(encoded, forKey: AppGroupConstants.keyPopHistory)
            UserDefaults.standard.synchronize()
        }
    }
    
    // MARK: - 3. OUTBOX History (Gönderdiklerim)
    public func getOutboxHistory() -> [PopItem] {
        if let data = defaults.data(forKey: AppGroupConstants.keyOutboxHistory),
           let history = try? jsonDecoder.decode([PopItem].self, from: data) {
            return history
        } else if let data = UserDefaults.standard.data(forKey: AppGroupConstants.keyOutboxHistory),
                  let history = try? jsonDecoder.decode([PopItem].self, from: data) {
            return history
        }
        return []
    }
    
    public func saveOutboxHistory(_ list: [PopItem]) {
        if let encoded = try? jsonEncoder.encode(list) {
            defaults.set(encoded, forKey: AppGroupConstants.keyOutboxHistory)
            defaults.synchronize()
            UserDefaults.standard.set(encoded, forKey: AppGroupConstants.keyOutboxHistory)
            UserDefaults.standard.synchronize()
        }
    }
    
    public func addOutboxPop(_ pop: PopItem) {
        var current = getOutboxHistory()
        if !current.contains(where: { $0.id == pop.id }) {
            current.insert(pop, at: 0)
            if current.count > 50 {
                current = Array(current.prefix(50))
            }
            if let encoded = try? jsonEncoder.encode(current) {
                defaults.set(encoded, forKey: AppGroupConstants.keyOutboxHistory)
                defaults.synchronize()
                UserDefaults.standard.set(encoded, forKey: AppGroupConstants.keyOutboxHistory)
                UserDefaults.standard.synchronize()
            }
        }
    }
    
    // MARK: - 4. Deleted Items Blocklist
    private let keyDeletedDrops = "bipop_deleted_drop_ids"
    
    public func getDeletedDropIds() -> Set<String> {
        let arr = defaults.stringArray(forKey: keyDeletedDrops) ?? UserDefaults.standard.stringArray(forKey: keyDeletedDrops) ?? []
        return Set(arr)
    }
    
    public func markDropAsDeleted(id: String) {
        var set = getDeletedDropIds()
        set.insert(id)
        let arr = Array(set)
        defaults.set(arr, forKey: keyDeletedDrops)
        defaults.synchronize()
        UserDefaults.standard.set(arr, forKey: keyDeletedDrops)
        UserDefaults.standard.synchronize()
    }
    
    public func deletePopFromHistory(id: String) {
        markDropAsDeleted(id: id)
        
        // Remove from Inbox
        var inbox = getInboxHistory()
        inbox.removeAll(where: { $0.id == id })
        if let encoded = try? jsonEncoder.encode(inbox) {
            defaults.set(encoded, forKey: AppGroupConstants.keyPopHistory)
            defaults.synchronize()
            UserDefaults.standard.set(encoded, forKey: AppGroupConstants.keyPopHistory)
            UserDefaults.standard.synchronize()
        }
        
        // Remove from Outbox
        var outbox = getOutboxHistory()
        outbox.removeAll(where: { $0.id == id })
        if let encoded = try? jsonEncoder.encode(outbox) {
            defaults.set(encoded, forKey: AppGroupConstants.keyOutboxHistory)
            defaults.synchronize()
            UserDefaults.standard.set(encoded, forKey: AppGroupConstants.keyOutboxHistory)
            UserDefaults.standard.synchronize()
        }
        
        // Clear latest pop if matching
        if let latest = getLatestInboxPop(), latest.id == id {
            defaults.removeObject(forKey: AppGroupConstants.keyLatestPop)
            defaults.synchronize()
            UserDefaults.standard.removeObject(forKey: AppGroupConstants.keyLatestPop)
            UserDefaults.standard.synchronize()
            if let fileURL = fileInboxPopURL { try? FileManager.default.removeItem(at: fileURL) }
            reloadWidgets()
        }
    }
    
    public func clearAllHistory() {
        for p in getInboxHistory() { markDropAsDeleted(id: p.id) }
        for p in getOutboxHistory() { markDropAsDeleted(id: p.id) }
        
        defaults.removeObject(forKey: AppGroupConstants.keyPopHistory)
        defaults.removeObject(forKey: AppGroupConstants.keyOutboxHistory)
        defaults.removeObject(forKey: AppGroupConstants.keyLatestPop)
        defaults.synchronize()
        UserDefaults.standard.removeObject(forKey: AppGroupConstants.keyPopHistory)
        UserDefaults.standard.removeObject(forKey: AppGroupConstants.keyOutboxHistory)
        UserDefaults.standard.removeObject(forKey: AppGroupConstants.keyLatestPop)
        UserDefaults.standard.synchronize()
        if let fileURL = fileInboxPopURL { try? FileManager.default.removeItem(at: fileURL) }
        reloadWidgets()
    }
    
    // MARK: - 5. User Profile
    public func saveUserProfile(_ profile: UserProfile) {
        if let encoded = try? jsonEncoder.encode(profile) {
            defaults.set(encoded, forKey: AppGroupConstants.keyUserProfile)
            defaults.synchronize()
            UserDefaults.standard.set(encoded, forKey: AppGroupConstants.keyUserProfile)
            UserDefaults.standard.synchronize()
            if let fileURL = fileProfileURL {
                try? encoded.write(to: fileURL, options: .atomic)
            }
            reloadWidgets()
        }
    }
    
    public func getUserProfile() -> UserProfile {
        if let data = defaults.data(forKey: AppGroupConstants.keyUserProfile),
           let profile = try? jsonDecoder.decode(UserProfile.self, from: data) {
            return profile
        }
        if let fileURL = fileProfileURL,
           let data = try? Data(contentsOf: fileURL),
           let profile = try? jsonDecoder.decode(UserProfile.self, from: data) {
            return profile
        }
        if let data = UserDefaults.standard.data(forKey: AppGroupConstants.keyUserProfile),
           let profile = try? jsonDecoder.decode(UserProfile.self, from: data) {
            return profile
        }
        return UserProfile()
    }
    
    public func logout() {
        defaults.removeObject(forKey: AppGroupConstants.keyUserProfile)
        defaults.removeObject(forKey: AppGroupConstants.keyLatestPop)
        defaults.removeObject(forKey: AppGroupConstants.keyPopHistory)
        defaults.removeObject(forKey: AppGroupConstants.keyOutboxHistory)
        defaults.synchronize()
        UserDefaults.standard.removeObject(forKey: AppGroupConstants.keyUserProfile)
        UserDefaults.standard.removeObject(forKey: AppGroupConstants.keyLatestPop)
        UserDefaults.standard.removeObject(forKey: AppGroupConstants.keyPopHistory)
        UserDefaults.standard.removeObject(forKey: AppGroupConstants.keyOutboxHistory)
        UserDefaults.standard.synchronize()
        if let fileURL = fileProfileURL { try? FileManager.default.removeItem(at: fileURL) }
        if let fileURL = fileInboxPopURL { try? FileManager.default.removeItem(at: fileURL) }
        reloadWidgets()
    }
    
    // MARK: - Widget Center Reload
    public func reloadWidgets() {
        #if canImport(WidgetKit)
        WidgetCenter.shared.reloadAllTimelines()
        WidgetCenter.shared.reloadTimelines(ofKind: "BipopWidget")
        WidgetCenter.shared.reloadTimelines(ofKind: "PetWidget")
        #endif
    }
}
