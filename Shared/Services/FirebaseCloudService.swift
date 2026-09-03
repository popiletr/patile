import Foundation

// MARK: - Firebase Cloud Service (Production-Grade Serverless Firestore Inbox/Outbox Architecture)
public final class FirebaseCloudService {
    public static let shared = FirebaseCloudService()
    
    private let projectId = "bipop-c79ca"
    private let apiKey = "AIzaSyAtCociJutjb4EhMMBVThF3MupgJUwm_-I"
    private let session: URLSession
    private let jsonEncoder = JSONEncoder()
    private let jsonDecoder = JSONDecoder()
    
    private var firestoreBaseURL: String {
        "https://firestore.googleapis.com/v1/projects/\(projectId)/databases/(default)/documents"
    }
    
    private init() {
        let config = URLSessionConfiguration.ephemeral
        config.urlCache = nil
        config.requestCachePolicy = .reloadIgnoringLocalAndRemoteCacheData
        config.timeoutIntervalForRequest = 4.0
        config.timeoutIntervalForResource = 8.0
        self.session = URLSession(configuration: config)
        
        jsonEncoder.dateEncodingStrategy = .iso8601
        jsonDecoder.dateDecodingStrategy = .iso8601
    }
    
    // MARK: - Health / Connection Test
    public func testConnection() async -> Bool {
        guard let url = URL(string: "\(firestoreBaseURL)/users?pageSize=1&key=\(apiKey)") else { return false }
        var request = URLRequest(url: url)
        request.timeoutInterval = 3.0
        do {
            let (_, response) = try await session.data(for: request)
            return (response as? HTTPURLResponse)?.statusCode == 200
        } catch {
            return false
        }
    }
    
    // MARK: - 1. User Profile Management (Register / Sync)
    public func saveUserProfile(_ user: UserProfile) async throws -> UserProfile {
        let cleanId = user.id.isEmpty ? "usr_\(UUID().uuidString.prefix(8).lowercased())" : user.id
        guard let url = URL(string: "\(firestoreBaseURL)/users/\(cleanId)?key=\(apiKey)") else {
            throw URLError(.badURL)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: Any] = [
            "fields": [
                "id": ["stringValue": cleanId],
                "email": ["stringValue": user.email],
                "username": ["stringValue": user.username.lowercased().replacingOccurrences(of: "@", with: "").trimmingCharacters(in: .whitespacesAndNewlines)],
                "name": ["stringValue": user.name.trimmingCharacters(in: .whitespacesAndNewlines)],
                "emoji": ["stringValue": user.emoji],
                "pairCode": ["stringValue": user.pairCode],
                "updatedAt": ["stringValue": ISO8601DateFormatter().string(from: Date())]
            ]
        ]
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        let (_, response) = try await session.data(for: request)
        
        if (response as? HTTPURLResponse)?.statusCode == 200 {
            var updatedUser = user
            updatedUser.id = cleanId
            SharedStorage.shared.saveUserProfile(updatedUser)
            return updatedUser
        }
        
        throw URLError(.badServerResponse)
    }
    
    // MARK: - 2. Fast Login (by Username or Email)
    public func loginUser(identifier: String) async throws -> UserProfile {
        let clean = identifier.lowercased().replacingOccurrences(of: "@", with: "").trimmingCharacters(in: .whitespacesAndNewlines)
        
        guard let url = URL(string: "\(firestoreBaseURL)/users?pageSize=100&key=\(apiKey)") else {
            throw URLError(.badURL)
        }
        
        let (data, response) = try await session.data(for: URLRequest(url: url))
        guard (response as? HTTPURLResponse)?.statusCode == 200,
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let documents = json["documents"] as? [[String: Any]] else {
            throw NSError(domain: "AuthError", code: 404, userInfo: [NSLocalizedDescriptionKey: "Kullanıcı bulunamadı."])
        }
        
        for doc in documents {
            if let fields = doc["fields"] as? [String: Any],
               let username = (fields["username"] as? [String: Any])?["stringValue"] as? String,
               let name = (fields["name"] as? [String: Any])?["stringValue"] as? String,
               let id = (fields["id"] as? [String: Any])?["stringValue"] as? String {
                
                let email = (fields["email"] as? [String: Any])?["stringValue"] as? String ?? ""
                let pairCode = (fields["pairCode"] as? [String: Any])?["stringValue"] as? String ?? ""
                
                if username == clean || email.lowercased() == clean || pairCode.uppercased() == clean.uppercased() {
                    let user = UserProfile(
                        id: id,
                        email: email,
                        username: username,
                        name: name,
                        emoji: "",
                        pairCode: pairCode
                    )
                    SharedStorage.shared.saveUserProfile(user)
                    return user
                }
            }
        }
        
        throw NSError(domain: "AuthError", code: 404, userInfo: [NSLocalizedDescriptionKey: "Kullanıcı bulunamadı."])
    }
    
    // MARK: - Search Users
    public func searchUsers(query: String) async -> [SearchUserResult] {
        let clean = query.lowercased().replacingOccurrences(of: "@", with: "").trimmingCharacters(in: .whitespacesAndNewlines)
        guard !clean.isEmpty, let url = URL(string: "\(firestoreBaseURL)/users?pageSize=100&key=\(apiKey)") else { return [] }
        
        do {
            let (data, response) = try await session.data(for: URLRequest(url: url))
            guard (response as? HTTPURLResponse)?.statusCode == 200,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let documents = json["documents"] as? [[String: Any]] else { return [] }
            
            var results: [SearchUserResult] = []
            for doc in documents {
                if let fields = doc["fields"] as? [String: Any],
                   let username = (fields["username"] as? [String: Any])?["stringValue"] as? String,
                   let name = (fields["name"] as? [String: Any])?["stringValue"] as? String,
                   let id = (fields["id"] as? [String: Any])?["stringValue"] as? String {
                    
                    let pairCode = (fields["pairCode"] as? [String: Any])?["stringValue"] as? String ?? ""
                    let email = (fields["email"] as? [String: Any])?["stringValue"] as? String ?? ""
                    
                    if username.lowercased().contains(clean) || name.lowercased().contains(clean) || email.lowercased().contains(clean) || pairCode.lowercased().contains(clean) {
                        results.append(SearchUserResult(id: id, username: username, name: name, emoji: "", pairCode: pairCode))
                    }
                }
            }
            return results
        } catch {
            return []
        }
    }
    
    // MARK: - 3. Send Pop Drop (Inbox / Outbox Model)
    public func sendPop(pop: PopItem) async throws -> Bool {
        let payloadString: String
        if let encoded = try? jsonEncoder.encode(pop), let str = String(data: encoded, encoding: .utf8) {
            payloadString = str
        } else {
            payloadString = "{}"
        }
        
        let docBody: [String: Any] = [
            "fields": [
                "id": ["stringValue": pop.id],
                "senderId": ["stringValue": pop.senderId],
                "senderUsername": ["stringValue": pop.senderUsername],
                "senderName": ["stringValue": pop.senderName],
                "recipientId": ["stringValue": pop.recipientId],
                "type": ["stringValue": pop.type.rawValue],
                "payload": ["stringValue": payloadString],
                "createdAt": ["stringValue": ISO8601DateFormatter().string(from: pop.createdAt)]
            ]
        ]
        guard let jsonData = try? JSONSerialization.data(withJSONObject: docBody) else { return false }
        
        // 1. Write to Sender's Outbox: /users/{senderId}/outbox/{dropId}
        if !pop.senderId.isEmpty {
            if let outboxURL = URL(string: "\(firestoreBaseURL)/users/\(pop.senderId)/outbox/\(pop.id)?key=\(apiKey)") {
                var outboxReq = URLRequest(url: outboxURL)
                outboxReq.httpMethod = "PATCH"
                outboxReq.setValue("application/json", forHTTPHeaderField: "Content-Type")
                outboxReq.httpBody = jsonData
                _ = try? await session.data(for: outboxReq)
            }
        }
        
        // 2. Determine target recipient IDs
        var targetRecipientIds: Set<String> = []
        
        if pop.recipientId != "all" && !pop.recipientId.isEmpty {
            // Explicit recipient specified
            targetRecipientIds.insert(pop.recipientId)
        } else {
            // Discover recipients: friends list or other registered users
            let profile = SharedStorage.shared.getUserProfile()
            for friend in profile.friends where !friend.id.isEmpty && friend.id != pop.senderId {
                targetRecipientIds.insert(friend.id)
            }
            
            // If friends list is not populated yet, discover all other users from /users
            if targetRecipientIds.isEmpty {
                if let allUsers = try? await fetchAllUserIds(), !allUsers.isEmpty {
                    for uId in allUsers where uId != pop.senderId {
                        targetRecipientIds.insert(uId)
                    }
                }
            }
        }
        
        // 3. Write to each Recipient's Inbox: /users/{recipientId}/inbox/{dropId}
        // (CRITICAL: SENDER'S INBOX IS NEVER WRITTEN TO)
        var successCount = 0
        for recipientId in targetRecipientIds where recipientId != pop.senderId {
            guard let inboxURL = URL(string: "\(firestoreBaseURL)/users/\(recipientId)/inbox/\(pop.id)?key=\(apiKey)") else { continue }
            var inboxReq = URLRequest(url: inboxURL)
            inboxReq.httpMethod = "PATCH"
            inboxReq.setValue("application/json", forHTTPHeaderField: "Content-Type")
            inboxReq.httpBody = jsonData
            
            if let (_, res) = try? await session.data(for: inboxReq), (res as? HTTPURLResponse)?.statusCode == 200 {
                successCount += 1
            }
        }
        
        return true
    }
    
    // Helper to find other users when no explicit friend list is cached
    private func fetchAllUserIds() async throws -> [String] {
        guard let url = URL(string: "\(firestoreBaseURL)/users?pageSize=100&key=\(apiKey)") else { return [] }
        let (data, response) = try await session.data(for: URLRequest(url: url))
        guard (response as? HTTPURLResponse)?.statusCode == 200,
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let documents = json["documents"] as? [[String: Any]] else { return [] }
        
        var ids: [String] = []
        for doc in documents {
            if let fields = doc["fields"] as? [String: Any],
               let id = (fields["id"] as? [String: Any])?["stringValue"] as? String, !id.isEmpty {
                ids.append(id)
            } else if let name = doc["name"] as? String, let last = name.split(separator: "/").last {
                ids.append(String(last))
            }
        }
        return ids
    }
    
    // MARK: - 4. Fetch Latest Inbox Drop (For Widget & Real-time Check)
    public func fetchLatestInboxDrop(userId: String) async -> PopItem? {
        guard !userId.isEmpty,
              let url = URL(string: "\(firestoreBaseURL)/users/\(userId)/inbox?pageSize=10&key=\(apiKey)") else { return nil }
        
        var request = URLRequest(url: url)
        request.timeoutInterval = 3.5
        request.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData
        let deletedIds = SharedStorage.shared.getDeletedDropIds()
        
        do {
            let (data, response) = try await session.data(for: request)
            guard (response as? HTTPURLResponse)?.statusCode == 200,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let documents = json["documents"] as? [[String: Any]] else { return nil }
            
            var drops: [PopItem] = []
            for doc in documents {
                guard let fields = doc["fields"] as? [String: Any],
                      let payloadStr = (fields["payload"] as? [String: Any])?["stringValue"] as? String else { continue }
                
                let docId = (fields["id"] as? [String: Any])?["stringValue"] as? String ?? ""
                if deletedIds.contains(docId) { continue }
                
                if let payloadData = payloadStr.data(using: .utf8),
                   let pop = try? jsonDecoder.decode(PopItem.self, from: payloadData) {
                    if !deletedIds.contains(pop.id) {
                        drops.append(pop)
                    }
                }
            }
            
            return drops.sorted(by: { $0.createdAt > $1.createdAt }).first
        } catch {
            return nil
        }
    }
    
    // MARK: - 4.1 Fetch Inbox Feed (Gelenler)
    public func fetchInboxFeed(userId: String) async -> [PopItem] {
        guard !userId.isEmpty,
              let url = URL(string: "\(firestoreBaseURL)/users/\(userId)/inbox?pageSize=50&key=\(apiKey)") else { return [] }
        
        var request = URLRequest(url: url)
        request.timeoutInterval = 4.0
        request.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData
        let deletedIds = SharedStorage.shared.getDeletedDropIds()
        
        do {
            let (data, response) = try await session.data(for: request)
            guard (response as? HTTPURLResponse)?.statusCode == 200,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let documents = json["documents"] as? [[String: Any]] else { return [] }
            
            var drops: [PopItem] = []
            for doc in documents {
                guard let fields = doc["fields"] as? [String: Any],
                      let payloadStr = (fields["payload"] as? [String: Any])?["stringValue"] as? String else { continue }
                
                let docId = (fields["id"] as? [String: Any])?["stringValue"] as? String ?? ""
                if deletedIds.contains(docId) { continue }
                
                if let payloadData = payloadStr.data(using: .utf8),
                   let pop = try? jsonDecoder.decode(PopItem.self, from: payloadData) {
                    if !deletedIds.contains(pop.id) {
                        drops.append(pop)
                    }
                }
            }
            return drops.sorted(by: { $0.createdAt > $1.createdAt })
        } catch {
            return []
        }
    }
    
    // MARK: - 4.2 Fetch Outbox Feed (Gönderdiklerim)
    public func fetchOutboxFeed(userId: String) async -> [PopItem] {
        guard !userId.isEmpty,
              let url = URL(string: "\(firestoreBaseURL)/users/\(userId)/outbox?pageSize=50&key=\(apiKey)") else { return [] }
        
        var request = URLRequest(url: url)
        request.timeoutInterval = 4.0
        request.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData
        let deletedIds = SharedStorage.shared.getDeletedDropIds()
        
        do {
            let (data, response) = try await session.data(for: request)
            guard (response as? HTTPURLResponse)?.statusCode == 200,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let documents = json["documents"] as? [[String: Any]] else { return [] }
            
            var drops: [PopItem] = []
            for doc in documents {
                guard let fields = doc["fields"] as? [String: Any],
                      let payloadStr = (fields["payload"] as? [String: Any])?["stringValue"] as? String else { continue }
                
                let docId = (fields["id"] as? [String: Any])?["stringValue"] as? String ?? ""
                if deletedIds.contains(docId) { continue }
                
                if let payloadData = payloadStr.data(using: .utf8),
                   let pop = try? jsonDecoder.decode(PopItem.self, from: payloadData) {
                    if !deletedIds.contains(pop.id) {
                        drops.append(pop)
                    }
                }
            }
            return drops.sorted(by: { $0.createdAt > $1.createdAt })
        } catch {
            return []
        }
    }
    
    // MARK: - 5. Delete Drop (From Inbox / Outbox)
    public func deleteDrop(id: String, userId: String) async -> Bool {
        guard !userId.isEmpty else { return false }
        
        // Delete from Inbox if present
        if let inboxURL = URL(string: "\(firestoreBaseURL)/users/\(userId)/inbox/\(id)?key=\(apiKey)") {
            var req = URLRequest(url: inboxURL)
            req.httpMethod = "DELETE"
            _ = try? await session.data(for: req)
        }
        
        // Delete from Outbox if present
        if let outboxURL = URL(string: "\(firestoreBaseURL)/users/\(userId)/outbox/\(id)?key=\(apiKey)") {
            var req = URLRequest(url: outboxURL)
            req.httpMethod = "DELETE"
            _ = try? await session.data(for: req)
        }
        
        return true
    }
    
    // MARK: - 6. Send Friend / Pair Request
    public func sendPairRequest(fromUser: UserProfile, targetIdentifier: String) async throws -> PairTargetUser {
        let cleanTarget = targetIdentifier.lowercased().replacingOccurrences(of: "@", with: "").trimmingCharacters(in: .whitespacesAndNewlines)
        
        // Find target user
        let target = try await loginUser(identifier: cleanTarget)
        guard target.id != fromUser.id else {
            throw NSError(domain: "PairError", code: 400, userInfo: [NSLocalizedDescriptionKey: "Kendi kendinize eşleşme gönderemezsiniz."])
        }
        
        let reqId = "req_\(UUID().uuidString.prefix(8))"
        guard let url = URL(string: "\(firestoreBaseURL)/pair_requests/\(reqId)?key=\(apiKey)") else {
            throw URLError(.badURL)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: Any] = [
            "fields": [
                "id": ["stringValue": reqId],
                "fromUserId": ["stringValue": fromUser.id],
                "fromUsername": ["stringValue": fromUser.username],
                "fromUserName": ["stringValue": fromUser.name],
                "toUserId": ["stringValue": target.id],
                "status": ["stringValue": "pending"],
                "createdAt": ["stringValue": ISO8601DateFormatter().string(from: Date())]
            ]
        ]
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        let (_, response) = try await session.data(for: request)
        
        if (response as? HTTPURLResponse)?.statusCode == 200 {
            return PairTargetUser(id: target.id, username: target.username, name: target.name, emoji: "")
        }
        
        throw URLError(.badServerResponse)
    }
    
    // MARK: - 7. Fetch Pending Pair Requests
    public func fetchPendingRequests(userId: String) async -> [PairRequest] {
        guard let url = URL(string: "\(firestoreBaseURL)/pair_requests?pageSize=50&key=\(apiKey)") else { return [] }
        
        do {
            let (data, response) = try await session.data(for: URLRequest(url: url))
            guard (response as? HTTPURLResponse)?.statusCode == 200,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let documents = json["documents"] as? [[String: Any]] else { return [] }
            
            var requests: [PairRequest] = []
            for doc in documents {
                if let fields = doc["fields"] as? [String: Any],
                   let toUserId = (fields["toUserId"] as? [String: Any])?["stringValue"] as? String,
                   let status = (fields["status"] as? [String: Any])?["stringValue"] as? String,
                   toUserId == userId, status == "pending" {
                    
                    let id = (fields["id"] as? [String: Any])?["stringValue"] as? String ?? ""
                    let fromUserId = (fields["fromUserId"] as? [String: Any])?["stringValue"] as? String ?? ""
                    let fromUsername = (fields["fromUsername"] as? [String: Any])?["stringValue"] as? String ?? ""
                    let fromUserName = (fields["fromUserName"] as? [String: Any])?["stringValue"] as? String ?? ""
                    
                    requests.append(PairRequest(
                        id: id,
                        fromUserId: fromUserId,
                        fromUsername: fromUsername,
                        fromUserName: fromUserName,
                        fromUserEmoji: "",
                        toUserId: toUserId,
                        status: "pending",
                        createdAt: Date()
                    ))
                }
            }
            return requests
        } catch {
            return []
        }
    }
    
    // MARK: - 8. Accept / Reject Pair Request
    public func respondToPairRequest(requestId: String, accept: Bool, fromUserId: String, toUserId: String) async throws {
        guard let url = URL(string: "\(firestoreBaseURL)/pair_requests/\(requestId)?key=\(apiKey)") else {
            throw URLError(.badURL)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let status = accept ? "accepted" : "rejected"
        let body: [String: Any] = [
            "fields": [
                "status": ["stringValue": status],
                "updatedAt": ["stringValue": ISO8601DateFormatter().string(from: Date())]
            ]
        ]
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        _ = try await session.data(for: request)
    }
}
