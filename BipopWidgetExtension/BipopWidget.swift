import WidgetKit
import SwiftUI

// MARK: - Pop Timeline Entry
public struct PopEntry: TimelineEntry {
    public let date: Date
    public let pop: PopItem
    
    public init(date: Date, pop: PopItem) {
        self.date = date
        self.pop = pop
    }
}

// MARK: - Bipop Widget Timeline Provider (Dedicated Inbox Architecture)
public struct BipopTimelineProvider: TimelineProvider {
    public typealias Entry = PopEntry
    
    private let projectId = "bipop-c79ca"
    private let apiKey = "AIzaSyAtCociJutjb4EhMMBVThF3MupgJUwm_-I"
    
    public init() {}
    
    public func placeholder(in context: Context) -> PopEntry {
        PopEntry(date: Date(), pop: PopItem.waitingForPartner())
    }
    
    public func getSnapshot(in context: Context, completion: @escaping (PopEntry) -> Void) {
        if context.isPreview {
            completion(PopEntry(date: Date(), pop: PopItem.waitingForPartner()))
            return
        }
        
        if let local = SharedStorage.shared.getLatestInboxPop() {
            completion(PopEntry(date: Date(), pop: local))
            return
        }
        
        fetchLatestInboxDropFromFirestore { cloudPop in
            completion(PopEntry(date: Date(), pop: cloudPop ?? PopItem.waitingForPartner()))
        }
    }
    
    public func getTimeline(in context: Context, completion: @escaping (Timeline<PopEntry>) -> Void) {
        // Deterministically fetch latest drop from User's Dedicated Inbox
        fetchLatestInboxDropFromFirestore { cloudPop in
            let finalPop: PopItem
            if let networkPop = cloudPop {
                finalPop = networkPop
                SharedStorage.shared.saveLatestInboxPop(networkPop)
            } else if let localPop = SharedStorage.shared.getLatestInboxPop() {
                finalPop = localPop
            } else {
                finalPop = PopItem.waitingForPartner()
            }
            
            let currentDate = Date()
            let entry = PopEntry(date: currentDate, pop: finalPop)
            // Schedule next automatic widget refresh in 5 minutes
            let nextUpdate = currentDate.addingTimeInterval(300)
            let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
            completion(timeline)
        }
    }
    
    // MARK: - Direct Native Cloud Firestore Inbox Fetch
    private func fetchLatestInboxDropFromFirestore(completion: @escaping (PopItem?) -> Void) {
        let profile = SharedStorage.shared.getUserProfile()
        let effectiveUserId = profile.id
        
        // If profile is not yet initialized in widget container, read local storage
        guard !effectiveUserId.isEmpty else {
            completion(SharedStorage.shared.getLatestInboxPop())
            return
        }
        
        fetchInboxForUserId(effectiveUserId, completion: completion)
    }
    
    private func fetchInboxForUserId(_ userId: String, completion: @escaping (PopItem?) -> Void) {
        let urlString = "https://firestore.googleapis.com/v1/projects/\(projectId)/databases/(default)/documents/users/\(userId)/inbox?pageSize=10&key=\(apiKey)"
        guard let url = URL(string: urlString) else {
            completion(nil)
            return
        }
        
        var request = URLRequest(url: url)
        request.timeoutInterval = 3.5
        request.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData
        let deletedIds = SharedStorage.shared.getDeletedDropIds()
        
        let task = URLSession.shared.dataTask(with: request) { data, response, _ in
            guard let httpRes = response as? HTTPURLResponse,
                  httpRes.statusCode == 200,
                  let data = data,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let documents = json["documents"] as? [[String: Any]] else {
                completion(nil)
                return
            }
            
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .custom { decoder -> Date in
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
            
            var drops: [PopItem] = []
            for doc in documents {
                guard let fields = doc["fields"] as? [String: Any],
                      let payloadStr = (fields["payload"] as? [String: Any])?["stringValue"] as? String else { continue }
                
                let docId = (fields["id"] as? [String: Any])?["stringValue"] as? String ?? ""
                if deletedIds.contains(docId) { continue }
                
                if let payloadData = payloadStr.data(using: .utf8),
                   let pop = try? decoder.decode(PopItem.self, from: payloadData) {
                    if !deletedIds.contains(pop.id) {
                        drops.append(pop)
                    }
                }
            }
            
            let latest = drops.sorted(by: { $0.createdAt > $1.createdAt }).first
            completion(latest)
        }
        
        task.resume()
    }
}

// MARK: - Main Widget View Dispatcher
public struct BipopWidgetEntryView: View {
    var entry: BipopTimelineProvider.Entry
    @Environment(\.widgetFamily) var family
    
    public var body: some View {
        Group {
            switch family {
            case .systemSmall:
                WidgetSmallView(pop: entry.pop)
            case .systemMedium:
                WidgetMediumView(pop: entry.pop)
            default:
                WidgetSmallView(pop: entry.pop)
            }
        }
        .widgetURL(URL(string: "bipop://pop/\(entry.pop.id)"))
        .widgetBackgroundCompat {
            Color.black
        }
    }
}

// MARK: - Main Widget Definition
public struct BipopWidget: Widget {
    public let kind: String = "BipopWidget"
    
    public init() {}
    
    public var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: BipopTimelineProvider()) { entry in
            BipopWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("B!Pop Canlı Widget")
        .description("Partnerinin ve arkadaşlarının sana gönderdiği anlık B!Pop'ları doğrudan ana ekranında gör.")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}
