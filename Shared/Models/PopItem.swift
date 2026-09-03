import Foundation
import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

// MARK: - Pop Type (Note + Sticker Only)
public enum PopType: String, Codable, CaseIterable {
    case note = "note"

    public var title: String {
        return "B!Pop"
    }

    public var iconName: String {
        return "note.text"
    }
}

// MARK: - Sticker Item (Sürükle-bırak destekli)
public struct StickerItem: Codable, Identifiable, Equatable {
    public var id: String
    public var stickerKey: String   // örn: "cat_wink", "heart_sparkle"
    public var positionX: Double    // 0.0 - 1.0 oransal
    public var positionY: Double    // 0.0 - 1.0 oransal
    public var scale: Double        // 0.5 - 2.5
    public var rotation: Double     // derece -180 / +180

    public init(
        id: String = UUID().uuidString,
        stickerKey: String,
        positionX: Double = 0.5,
        positionY: Double = 0.5,
        scale: Double = 1.0,
        rotation: Double = 0
    ) {
        self.id = id
        self.stickerKey = stickerKey
        self.positionX = positionX
        self.positionY = positionY
        self.scale = scale
        self.rotation = rotation
    }
}

// MARK: - Sticker Catalog
public struct StickerCatalog {
    public struct StickerDef: Identifiable {
        public let id: String
        public let iconName: String
        public let category: String
    }

    public static let all: [StickerDef] = [
        // Sevgi / Romantik
        .init(id: "heart_red",       iconName: "heart.fill",           category: "Sevgi"),
        .init(id: "heart_sparkle",   iconName: "heart.circle.fill",    category: "Sevgi"),
        .init(id: "heart_pink",      iconName: "heart",                category: "Sevgi"),
        .init(id: "kiss",            iconName: "mouth.fill",           category: "Sevgi"),
        .init(id: "rose",            iconName: "leaf.fill",            category: "Sevgi"),
        .init(id: "sparkle",         iconName: "sparkles",             category: "Sevgi"),
        .init(id: "hug",             iconName: "person.2.fill",        category: "Sevgi"),
        .init(id: "couple",          iconName: "figure.walk",          category: "Sevgi"),

        // Hayvanlar
        .init(id: "cat_wink",        iconName: "pawprint.fill",        category: "Hayvanlar"),
        .init(id: "cat_love",        iconName: "pawprint",             category: "Hayvanlar"),
        .init(id: "dog",             iconName: "hare.fill",            category: "Hayvanlar"),
        .init(id: "bear",            iconName: "tortoise.fill",        category: "Hayvanlar"),
        .init(id: "fox",             iconName: "bird.fill",            category: "Hayvanlar"),
        .init(id: "panda",           iconName: "fish.fill",            category: "Hayvanlar"),
        .init(id: "bunny",           iconName: "hare",                 category: "Hayvanlar"),
        .init(id: "hamster",         iconName: "ladybug.fill",         category: "Hayvanlar"),

        // Duygular
        .init(id: "happy",           iconName: "face.smiling.inverse", category: "Duygular"),
        .init(id: "crying_happy",    iconName: "face.smiling",         category: "Duygular"),
        .init(id: "shy",             iconName: "eye.slash.fill",       category: "Duygular"),
        .init(id: "sulking",         iconName: "cloud.rain.fill",      category: "Duygular"),
        .init(id: "star_eyes",       iconName: "star.circle.fill",     category: "Duygular"),
        .init(id: "sleepy",          iconName: "moon.fill",            category: "Duygular"),
        .init(id: "cool",            iconName: "sun.max.fill",         category: "Duygular"),
        .init(id: "mind_blown",      iconName: "bolt.circle.fill",     category: "Duygular"),

        // Yiyecek
        .init(id: "cake",            iconName: "fork.knife",           category: "Yiyecek"),
        .init(id: "cupcake",         iconName: "cup.and.saucer.fill",  category: "Yiyecek"),
        .init(id: "icecream",        iconName: "takeoutbag.and.cup.and.straw.fill", category: "Yiyecek"),
        .init(id: "coffee",          iconName: "mug.fill",             category: "Yiyecek"),
        .init(id: "strawberry",      iconName: "circle.grid.2x2.fill", category: "Yiyecek"),
        .init(id: "bubble_tea",      iconName: "wineglass.fill",       category: "Yiyecek"),
        .init(id: "donut",           iconName: "circle.circle.fill",   category: "Yiyecek"),
        .init(id: "pizza",           iconName: "triangle.fill",        category: "Yiyecek"),

        // Özel B!Pop
        .init(id: "bipop_logo",      iconName: "bolt.fill",            category: "Özel"),
        .init(id: "banner_love",     iconName: "envelope.fill",        category: "Özel"),
        .init(id: "banner_miss",     iconName: "heart.text.square.fill", category: "Özel"),
        .init(id: "banner_gn",       iconName: "moon.stars.fill",      category: "Özel"),
        .init(id: "banner_gm",       iconName: "sun.and.horizon.fill", category: "Özel"),
        .init(id: "star",            iconName: "star.fill",            category: "Özel"),
        .init(id: "rainbow",         iconName: "cloud.sun.rain.fill",  category: "Özel"),
        .init(id: "confetti",        iconName: "party.popper.fill",    category: "Özel"),
    ]

    public static var categories: [String] {
        Array(Set(all.map { $0.category })).sorted()
    }

    public static func stickers(for category: String) -> [StickerDef] {
        all.filter { $0.category == category }
    }
}

// MARK: - Note Payload (Sticker desteği eklendi)
public struct NotePayload: Codable, Equatable {
    public var text: String
    public var fontStyle: String
    public var bgGradientStart: String
    public var bgGradientEnd: String
    public var textColor: String
    public var iconSymbol: String
    public var stickers: [StickerItem]   // 🆕 Sticker desteği

    public init(
        text: String,
        fontStyle: String = "rounded",
        bgGradientStart: String = "#FF007F",
        bgGradientEnd: String = "#7928CA",
        textColor: String = "#FFFFFF",
        iconSymbol: String = "sparkles",
        stickers: [StickerItem] = []
    ) {
        self.text = text
        self.fontStyle = fontStyle
        self.bgGradientStart = bgGradientStart
        self.bgGradientEnd = bgGradientEnd
        self.textColor = textColor
        self.iconSymbol = iconSymbol
        self.stickers = stickers
    }

    enum CodingKeys: String, CodingKey {
        case text, fontStyle, bgGradientStart, bgGradientEnd, textColor, iconSymbol, stickers
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.text = try container.decodeIfPresent(String.self, forKey: .text) ?? ""
        self.fontStyle = try container.decodeIfPresent(String.self, forKey: .fontStyle) ?? "rounded"
        self.bgGradientStart = try container.decodeIfPresent(String.self, forKey: .bgGradientStart) ?? "#FF007F"
        self.bgGradientEnd = try container.decodeIfPresent(String.self, forKey: .bgGradientEnd) ?? "#7928CA"
        self.textColor = try container.decodeIfPresent(String.self, forKey: .textColor) ?? "#FFFFFF"
        self.iconSymbol = try container.decodeIfPresent(String.self, forKey: .iconSymbol) ?? "sparkles"
        self.stickers = (try? container.decodeIfPresent([StickerItem].self, forKey: .stickers)) ?? []
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(text, forKey: .text)
        try container.encode(fontStyle, forKey: .fontStyle)
        try container.encode(bgGradientStart, forKey: .bgGradientStart)
        try container.encode(bgGradientEnd, forKey: .bgGradientEnd)
        try container.encode(textColor, forKey: .textColor)
        try container.encode(iconSymbol, forKey: .iconSymbol)
        try container.encode(stickers, forKey: .stickers)
    }
}

// MARK: - Friend Model
public struct Friend: Identifiable, Codable, Equatable {
    public let id: String
    public var username: String
    public var name: String
    public var emoji: String
    public var pairCode: String
    public var connectedAt: Date

    public init(
        id: String,
        username: String = "",
        name: String,
        emoji: String = "",
        pairCode: String = "",
        connectedAt: Date = Date()
    ) {
        self.id = id
        self.username = username
        self.name = name
        self.emoji = emoji
        self.pairCode = pairCode
        self.connectedAt = connectedAt
    }

    public var initials: String {
        let words = name.split(separator: " ")
        if words.count >= 2, let first = words[0].first, let second = words[1].first {
            return "\(first)\(second)".uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }

    enum CodingKeys: String, CodingKey {
        case id, username, name, emoji, pairCode, connectedAt
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decodeIfPresent(String.self, forKey: .id) ?? UUID().uuidString
        self.username = try container.decodeIfPresent(String.self, forKey: .username) ?? ""
        self.name = try container.decodeIfPresent(String.self, forKey: .name) ?? "Arkadaş"
        self.emoji = try container.decodeIfPresent(String.self, forKey: .emoji) ?? ""
        self.pairCode = try container.decodeIfPresent(String.self, forKey: .pairCode) ?? ""
        self.connectedAt = (try? container.decodeIfPresent(Date.self, forKey: .connectedAt)) ?? Date()
    }
}

// MARK: - Pair Request
public struct PairRequest: Identifiable, Codable, Equatable {
    public let id: String
    public let fromUserId: String
    public let fromUsername: String
    public let fromUserName: String
    public let fromUserEmoji: String
    public let toUserId: String
    public var status: String
    public let createdAt: Date

    public init(
        id: String = UUID().uuidString,
        fromUserId: String,
        fromUsername: String = "",
        fromUserName: String,
        fromUserEmoji: String = "",
        toUserId: String,
        status: String = "pending",
        createdAt: Date = Date()
    ) {
        self.id = id
        self.fromUserId = fromUserId
        self.fromUsername = fromUsername
        self.fromUserName = fromUserName
        self.fromUserEmoji = fromUserEmoji
        self.toUserId = toUserId
        self.status = status
        self.createdAt = createdAt
    }

    public var initials: String {
        let words = fromUserName.split(separator: " ")
        if words.count >= 2, let first = words[0].first, let second = words[1].first {
            return "\(first)\(second)".uppercased()
        }
        return String(fromUserName.prefix(2)).uppercased()
    }

    public static func == (lhs: PairRequest, rhs: PairRequest) -> Bool {
        return lhs.id == rhs.id && lhs.status == rhs.status
    }

    enum CodingKeys: String, CodingKey {
        case id, fromUserId, fromUsername, fromUserName, fromUserEmoji, toUserId, status, createdAt
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decodeIfPresent(String.self, forKey: .id) ?? UUID().uuidString
        self.fromUserId = try container.decodeIfPresent(String.self, forKey: .fromUserId) ?? ""
        self.fromUsername = try container.decodeIfPresent(String.self, forKey: .fromUsername) ?? ""
        self.fromUserName = try container.decodeIfPresent(String.self, forKey: .fromUserName) ?? "Kullanıcı"
        self.fromUserEmoji = try container.decodeIfPresent(String.self, forKey: .fromUserEmoji) ?? ""
        self.toUserId = try container.decodeIfPresent(String.self, forKey: .toUserId) ?? ""
        self.status = try container.decodeIfPresent(String.self, forKey: .status) ?? "pending"
        self.createdAt = (try? container.decodeIfPresent(Date.self, forKey: .createdAt)) ?? Date()
    }
}

// MARK: - Pair Target User
public struct PairTargetUser: Codable, Equatable {
    public let id: String
    public let username: String?
    public let name: String
    public let emoji: String

    public init(id: String, username: String? = nil, name: String, emoji: String = "") {
        self.id = id
        self.username = username
        self.name = name
        self.emoji = emoji
    }
}

// MARK: - Search User Result
public struct SearchUserResult: Identifiable, Codable, Equatable {
    public let id: String
    public let username: String
    public let name: String
    public let emoji: String
    public let pairCode: String

    public init(id: String, username: String, name: String, emoji: String = "", pairCode: String = "") {
        self.id = id
        self.username = username
        self.name = name
        self.emoji = emoji
        self.pairCode = pairCode
    }
}

// MARK: - Group Model
public struct BipopGroup: Identifiable, Codable, Equatable {
    public let id: String
    public var name: String
    public var emoji: String
    public var memberIds: [String]

    public init(id: String = UUID().uuidString, name: String, emoji: String = "", memberIds: [String] = []) {
        self.id = id
        self.name = name
        self.emoji = emoji
        self.memberIds = memberIds
    }

    enum CodingKeys: String, CodingKey {
        case id, name, emoji, memberIds
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decodeIfPresent(String.self, forKey: .id) ?? UUID().uuidString
        self.name = try container.decodeIfPresent(String.self, forKey: .name) ?? "Grup"
        self.emoji = try container.decodeIfPresent(String.self, forKey: .emoji) ?? ""
        self.memberIds = try container.decodeIfPresent([String].self, forKey: .memberIds) ?? []
    }
}

// MARK: - Main Pop Item
public struct PopItem: Identifiable, Codable, Equatable {
    public let id: String
    public let senderId: String
    public let senderUsername: String
    public let senderName: String
    public let senderEmoji: String
    public var recipientId: String
    public let type: PopType
    public var notePayload: NotePayload?
    public let createdAt: Date
    public var reactions: [String]

    public init(
        id: String = UUID().uuidString,
        senderId: String,
        senderUsername: String = "",
        senderName: String,
        senderEmoji: String = "",
        recipientId: String = "all",
        type: PopType = .note,
        notePayload: NotePayload? = nil,
        createdAt: Date = Date(),
        reactions: [String] = []
    ) {
        self.id = id
        self.senderId = senderId
        self.senderUsername = senderUsername
        self.senderName = senderName
        self.senderEmoji = senderEmoji
        self.recipientId = recipientId
        self.type = type
        self.notePayload = notePayload
        self.createdAt = createdAt
        self.reactions = reactions
    }

    public var senderInitials: String {
        let words = senderName.split(separator: " ")
        if words.count >= 2, let first = words[0].first, let second = words[1].first {
            return "\(first)\(second)".uppercased()
        }
        return String(senderName.prefix(2)).uppercased()
    }

    enum CodingKeys: String, CodingKey {
        case id, senderId, senderUsername, senderName, senderEmoji, recipientId, type, notePayload, createdAt, reactions
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decodeIfPresent(String.self, forKey: .id) ?? UUID().uuidString
        self.senderId = try container.decodeIfPresent(String.self, forKey: .senderId) ?? ""
        self.senderUsername = try container.decodeIfPresent(String.self, forKey: .senderUsername) ?? ""
        self.senderName = try container.decodeIfPresent(String.self, forKey: .senderName) ?? "B!Pop"
        self.senderEmoji = try container.decodeIfPresent(String.self, forKey: .senderEmoji) ?? ""
        self.recipientId = try container.decodeIfPresent(String.self, forKey: .recipientId) ?? "all"
        self.type = (try? container.decodeIfPresent(PopType.self, forKey: .type)) ?? .note
        self.notePayload = try? container.decodeIfPresent(NotePayload.self, forKey: .notePayload)

        // Robust date decoding — ISO8601, Date, Double
        if let dateStr = try? container.decodeIfPresent(String.self, forKey: .createdAt) {
            let iso = ISO8601DateFormatter()
            iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let d = iso.date(from: dateStr) {
                self.createdAt = d
            } else {
                iso.formatOptions = [.withInternetDateTime]
                if let d = iso.date(from: dateStr) {
                    self.createdAt = d
                } else {
                    let sql = DateFormatter()
                    sql.dateFormat = "yyyy-MM-dd HH:mm:ss"
                    self.createdAt = sql.date(from: dateStr) ?? Date()
                }
            }
        } else if let dateVal = try? container.decodeIfPresent(Date.self, forKey: .createdAt) {
            self.createdAt = dateVal
        } else if let doubleVal = try? container.decodeIfPresent(Double.self, forKey: .createdAt) {
            self.createdAt = Date(timeIntervalSince1970: doubleVal)
        } else {
            self.createdAt = Date()
        }

        self.reactions = (try? container.decodeIfPresent([String].self, forKey: .reactions)) ?? []
    }

    public static var previewDefault: PopItem {
        PopItem(
            id: "waiting-pop",
            senderId: "system",
            senderUsername: "",
            senderName: "B!Pop",
            senderEmoji: "",
            type: .note,
            notePayload: NotePayload(
                text: "Henüz bir B!Pop gelmedi. Arkadaşına ilk sürprizi gönder!",
                fontStyle: "rounded",
                bgGradientStart: "#121218",
                bgGradientEnd: "#1A1A24",
                textColor: "#FFFFFF",
                iconSymbol: "paperplane.fill"
            )
        )
    }

    public static func waitingForPartner() -> PopItem {
        PopItem(
            id: "waiting-pop",
            senderId: "system",
            senderUsername: "",
            senderName: "B!Pop",
            senderEmoji: "",
            type: .note,
            notePayload: NotePayload(
                text: "Henüz bir B!Pop gelmedi. Arkadaşına ilk sürprizi gönder!",
                fontStyle: "rounded",
                bgGradientStart: "#121218",
                bgGradientEnd: "#1A1A24",
                textColor: "#FFFFFF",
                iconSymbol: "paperplane.fill"
            )
        )
    }
}

// MARK: - User Profile
public struct UserProfile: Codable, Equatable {
    public var id: String
    public var email: String
    public var username: String
    public var name: String
    public var emoji: String
    public var pairCode: String
    public var friends: [Friend]
    public var groups: [BipopGroup]
    public var apnsToken: String?
    public var idToken: String?

    public init(
        id: String = "",
        email: String = "",
        username: String = "",
        name: String = "",
        emoji: String = "",
        pairCode: String = UserProfile.generatePairCode(),
        friends: [Friend] = [],
        groups: [BipopGroup] = [],
        apnsToken: String? = nil,
        idToken: String? = nil
    ) {
        self.id = id
        self.email = email
        self.username = username
        self.name = name
        self.emoji = emoji
        self.pairCode = pairCode
        self.friends = friends
        self.groups = groups
        self.apnsToken = apnsToken
        self.idToken = idToken
    }

    enum CodingKeys: String, CodingKey {
        case id, email, username, name, emoji, pairCode, friends, groups, apnsToken, idToken
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decodeIfPresent(String.self, forKey: .id) ?? ""
        self.email = try container.decodeIfPresent(String.self, forKey: .email) ?? ""
        self.username = try container.decodeIfPresent(String.self, forKey: .username) ?? ""
        self.name = try container.decodeIfPresent(String.self, forKey: .name) ?? ""
        self.emoji = try container.decodeIfPresent(String.self, forKey: .emoji) ?? ""
        self.pairCode = try container.decodeIfPresent(String.self, forKey: .pairCode) ?? ""
        self.friends = (try? container.decodeIfPresent([Friend].self, forKey: .friends)) ?? []
        self.groups = (try? container.decodeIfPresent([BipopGroup].self, forKey: .groups)) ?? []
        self.apnsToken = try? container.decodeIfPresent(String.self, forKey: .apnsToken)
        self.idToken = try? container.decodeIfPresent(String.self, forKey: .idToken)
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(email, forKey: .email)
        try container.encode(username, forKey: .username)
        try container.encode(name, forKey: .name)
        try container.encode(emoji, forKey: .emoji)
        try container.encode(pairCode, forKey: .pairCode)
        try container.encode(friends, forKey: .friends)
        try container.encode(groups, forKey: .groups)
        try container.encodeIfPresent(apnsToken, forKey: .apnsToken)
        try container.encodeIfPresent(idToken, forKey: .idToken)
    }

    public var isRegistered: Bool {
        return !id.isEmpty && !username.isEmpty
    }

    public var initials: String {
        let words = name.split(separator: " ")
        if words.count >= 2, let first = words[0].first, let second = words[1].first {
            return "\(first)\(second)".uppercased()
        }
        if !username.isEmpty {
            return String(username.prefix(2)).uppercased()
        }
        return "BP"
    }

    public static func generatePairCode() -> String {
        let chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        return String((0..<6).map { _ in chars.randomElement()! })
    }
}
