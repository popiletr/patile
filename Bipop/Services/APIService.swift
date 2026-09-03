import Foundation

public final class APIService {
    public static let shared = APIService()
    
    private let firebaseCloud = FirebaseCloudService.shared
    
    private init() {}
    
    // MARK: - Check Server Health
    public func checkServerHealth() async -> Bool {
        return await firebaseCloud.testConnection()
    }
    
    // MARK: - Register / Update User Profile
    public func saveUserProfile(_ user: UserProfile) async throws -> UserProfile {
        return try await firebaseCloud.saveUserProfile(user)
    }
    
    // MARK: - Login User
    public func loginUser(identifier: String) async throws -> UserProfile {
        return try await firebaseCloud.loginUser(identifier: identifier)
    }
    
    // MARK: - Send Pop
    public func sendPop(pop: PopItem) async throws -> Bool {
        return try await firebaseCloud.sendPop(pop: pop)
    }
    
    // MARK: - Search Users
    public func searchUsers(query: String) async -> [SearchUserResult] {
        return await firebaseCloud.searchUsers(query: query)
    }
    
    // MARK: - Send Pair Request
    public func sendPairRequest(fromUser: UserProfile, targetIdentifier: String) async throws -> PairTargetUser {
        return try await firebaseCloud.sendPairRequest(fromUser: fromUser, targetIdentifier: targetIdentifier)
    }
    
    // MARK: - Fetch Pending Pair Requests
    public func fetchPendingRequests(userId: String) async -> [PairRequest] {
        return await firebaseCloud.fetchPendingRequests(userId: userId)
    }
    
    // MARK: - Respond to Pair Request (Accept / Reject)
    public func respondToPairRequest(requestId: String, accept: Bool, fromUserId: String, toUserId: String) async throws {
        try await firebaseCloud.respondToPairRequest(requestId: requestId, accept: accept, fromUserId: fromUserId, toUserId: toUserId)
    }
    
    // MARK: - Delete Drop
    public func deleteDrop(id: String, userId: String) async -> Bool {
        return await firebaseCloud.deleteDrop(id: id, userId: userId)
    }
    
    // MARK: - Fetch Inbox Feed
    public func fetchInboxFeed(userId: String) async -> [PopItem] {
        return await firebaseCloud.fetchInboxFeed(userId: userId)
    }
    
    // MARK: - Fetch Outbox Feed
    public func fetchOutboxFeed(userId: String) async -> [PopItem] {
        return await firebaseCloud.fetchOutboxFeed(userId: userId)
    }
}
