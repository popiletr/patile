import SwiftUI
import Combine

public enum TabSelection: String, CaseIterable {
    case studio = "Stüdyo"
    case games = "Oyunlar"
    case feed = "Geçmiş"
    case pair = "Arkadaşlar"
    case widgets = "Widgetlar"
    
    var iconName: String {
        switch self {
        case .studio: return "sparkles"
        case .games:  return "gamecontroller.fill"
        case .feed: return "clock.arrow.circlepath"
        case .pair: return "person.2.fill"
        case .widgets: return "square.grid.2x2.fill"
        }
    }
}

@MainActor
public final class AppState: ObservableObject {
    // MARK: - User Profile & Auth State
    @Published public var userProfile: UserProfile {
        didSet {
            SharedStorage.shared.saveUserProfile(userProfile)
        }
    }
    @Published public var isLoggedIn: Bool = false
    @Published public var selectedTab: TabSelection = .studio
    @Published public var friends: [Friend] = []
    @Published public var pendingRequests: [PairRequest] = []
    @Published public var selectedRecipientId: String = "all"
    @Published public var isServerConnected: Bool = false

    // MARK: - Studio Draft State (Note Only)
    @Published public var noteText: String = ""
    @Published public var noteBgStartHex: String = "#FF007F"
    @Published public var noteBgEndHex: String = "#7928CA"
    @Published public var noteTextColorHex: String = "#FFFFFF"
    @Published public var noteEmojiReaction: String = "sparkles"
    @Published public var noteStickers: [StickerItem] = []
    
    // Feed / History (Inbox & Outbox)
    @Published public var inboxHistory: [PopItem] = []
    @Published public var outboxHistory: [PopItem] = []
    @Published public var latestReceivedPop: PopItem?
    
    public var popHistory: [PopItem] {
        get { inboxHistory }
        set { inboxHistory = newValue }
    }
    
    // UI Feedback
    @Published public var isSending: Bool = false
    @Published public var showPopSentAlert: Bool = false
    @Published public var sentPopSummary: String = ""
    @Published public var requestFeedbackMessage: String?
    
    private var syncTimer: AnyCancellable?
    
    public init() {
        let saved = SharedStorage.shared.getUserProfile()
        self.userProfile = saved
        self.isLoggedIn = saved.isRegistered
        self.inboxHistory = SharedStorage.shared.getInboxHistory()
        self.outboxHistory = SharedStorage.shared.getOutboxHistory()
        self.latestReceivedPop = SharedStorage.shared.getLatestInboxPop()
        self.friends = saved.friends
        
        SharedStorage.shared.saveUserProfile(saved)
        startSilentLiveSync()
        Task { [weak self] in
            await self?.syncWithServer()
        }
    }
    
    // MARK: - Silent In-App Live Sync (3.0s Interval)
    public func startSilentLiveSync() {
        syncTimer?.cancel()
        syncTimer = Timer.publish(every: 3.0, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                Task { [weak self] in
                    await self?.syncWithServer()
                }
            }
    }
    
    // MARK: - Dedicated Inbox/Outbox REST Sync Engine
    public func syncWithServer() async {
        guard isLoggedIn, !userProfile.id.isEmpty else { return }
        self.isServerConnected = true
        
        // 1. Fetch Inbox Drops (Gelenler)
        let incomingFeed = await APIService.shared.fetchInboxFeed(userId: userProfile.id)
        self.inboxHistory = incomingFeed
        SharedStorage.shared.saveInboxHistory(incomingFeed)
        
        let newLatest = incomingFeed.first
        if self.latestReceivedPop?.id != newLatest?.id {
            self.latestReceivedPop = newLatest
            if let newLatest = newLatest {
                SharedStorage.shared.saveLatestInboxPop(newLatest)
            } else {
                SharedStorage.shared.clearLatestInboxPop()
            }
        }
        
        // 2. Fetch Outbox Drops (Gönderdiklerim)
        let outgoingFeed = await APIService.shared.fetchOutboxFeed(userId: userProfile.id)
        self.outboxHistory = outgoingFeed
        SharedStorage.shared.saveOutboxHistory(outgoingFeed)
        
        // 3. Fetch Incoming Requests
        let incomingReqs = await APIService.shared.fetchPendingRequests(userId: userProfile.id)
        self.pendingRequests = incomingReqs
    }
    
    // MARK: - Send Pop (Note + Sticker)
    public func sendCurrentPop() {
        guard !isSending else { return }
        let trimmed = noteText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        isSending = true
        HapticManager.shared.playPopBurst()
        SoundManager.shared.playPopSound()

        let payload = NotePayload(
            text: trimmed,
            fontStyle: "rounded",
            bgGradientStart: noteBgStartHex,
            bgGradientEnd: noteBgEndHex,
            textColor: noteTextColorHex,
            iconSymbol: noteEmojiReaction,
            stickers: noteStickers
        )
        let popItem = PopItem(
            senderId: userProfile.id,
            senderUsername: userProfile.username,
            senderName: userProfile.name,
            senderEmoji: "",
            recipientId: selectedRecipientId,
            type: .note,
            notePayload: payload
        )
        sentPopSummary = "Notun arkadaşının widget'ına ulaştı!"

        SharedStorage.shared.addOutboxPop(popItem)
        self.outboxHistory = SharedStorage.shared.getOutboxHistory()

        Task {
            _ = try? await APIService.shared.sendPop(pop: popItem)
            await MainActor.run {
                self.noteText = ""
                self.noteStickers = []
                self.isSending = false
                self.showPopSentAlert = true
                SoundManager.shared.playSuccessSound()
                HapticManager.shared.playSuccess()
            }
        }
    }
    
    // MARK: - Send Pair Request (by @username or code)
    public func sendPairRequest(toIdentifier: String) async -> Bool {
        do {
            let target = try await APIService.shared.sendPairRequest(fromUser: userProfile, targetIdentifier: toIdentifier)
            requestFeedbackMessage = "\(target.name) (@\(target.username ?? toIdentifier)) kullanıcısına eşleşme isteği gönderildi."
            HapticManager.shared.playSuccess()
            return true
        } catch {
            requestFeedbackMessage = error.localizedDescription
            HapticManager.shared.playError()
            return false
        }
    }
    
    // MARK: - Respond to Request (Accept / Reject)
    public func respondToRequest(requestId: String, accept: Bool, fromUserId: String = "") async {
        _ = try? await APIService.shared.respondToPairRequest(requestId: requestId, accept: accept, fromUserId: fromUserId, toUserId: userProfile.id)
        HapticManager.shared.playSuccess()
        await syncWithServer()
    }
    
    // MARK: - Remove Friend
    public func removeFriend(friendId: String) async {
        self.friends.removeAll(where: { $0.id == friendId })
        self.userProfile.friends.removeAll(where: { $0.id == friendId })
        SharedStorage.shared.saveUserProfile(self.userProfile)
        await syncWithServer()
    }
    
    // MARK: - History Management
    public func deletePopFromHistory(id: String) {
        SharedStorage.shared.deletePopFromHistory(id: id)
        self.inboxHistory = SharedStorage.shared.getInboxHistory()
        self.outboxHistory = SharedStorage.shared.getOutboxHistory()
        if self.latestReceivedPop?.id == id {
            self.latestReceivedPop = SharedStorage.shared.getLatestInboxPop()
        }
        HapticManager.shared.playSelection()
        
        Task {
            _ = await APIService.shared.deleteDrop(id: id, userId: userProfile.id)
        }
    }
    
    public func clearHistory() {
        let toDelete = self.inboxHistory.map { $0.id } + self.outboxHistory.map { $0.id }
        SharedStorage.shared.clearAllHistory()
        self.inboxHistory = []
        self.outboxHistory = []
        self.latestReceivedPop = nil
        HapticManager.shared.playSelection()
        
        Task {
            for dropId in toDelete {
                _ = await APIService.shared.deleteDrop(id: dropId, userId: userProfile.id)
            }
        }
    }
    
    // MARK: - Logout
    public func logout() {
        SharedStorage.shared.logout()
        self.userProfile = UserProfile()
        self.isLoggedIn = false
        self.friends = []
        self.inboxHistory = []
        self.outboxHistory = []
        self.latestReceivedPop = nil
    }
}
