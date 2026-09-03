import Foundation

// MARK: - XOX (Tic-Tac-Toe) Oyun Durumu
public enum XOXMark: String, Codable {
    case x = "X"
    case o = "O"
    case empty = ""

    public var symbol: String {
        switch self {
        case .x:     return "X"
        case .o:     return "O"
        case .empty: return ""
        }
    }
}

public enum XOXGameStatus: String, Codable {
    case waiting = "waiting"           // Davet gönderildi, yanıt bekleniyor
    case playerXTurn = "player_x_turn" // X'in sırası
    case playerOTurn = "player_o_turn" // O'nun sırası
    case playerXWon = "player_x_won"
    case playerOWon = "player_o_won"
    case draw = "draw"
    case declined = "declined"

    public var isActive: Bool {
        self == .playerXTurn || self == .playerOTurn
    }

    public var isFinished: Bool {
        self == .playerXWon || self == .playerOWon || self == .draw || self == .declined
    }
}

// MARK: - XOX Oyun Modeli
public struct XOXGame: Codable, Identifiable, Equatable {
    public var id: String
    public var playerXId: String        // Daveti gönderen (X)
    public var playerOId: String        // Daveti kabul eden (O)
    public var playerXName: String
    public var playerOName: String
    public var board: [XOXMark]         // 9 hücrelik düz dizi (3x3)
    public var status: XOXGameStatus
    public var turnTimeLimit: Int       // Saniye (30 sn)
    public var lastMoveAt: Date?
    public var createdAt: Date
    public var updatedAt: Date

    // Skor Geçmişi
    public var playerXScore: Int
    public var playerOScore: Int

    public init(
        id: String = UUID().uuidString,
        playerXId: String,
        playerOId: String,
        playerXName: String = "",
        playerOName: String = ""
    ) {
        self.id = id
        self.playerXId = playerXId
        self.playerOId = playerOId
        self.playerXName = playerXName
        self.playerOName = playerOName
        self.board = Array(repeating: .empty, count: 9)
        self.status = .waiting
        self.turnTimeLimit = 30
        self.createdAt = Date()
        self.updatedAt = Date()
        self.playerXScore = 0
        self.playerOScore = 0
    }

    // MARK: - Computed

    /// Kimin sırası?
    public var currentPlayerId: String? {
        switch status {
        case .playerXTurn: return playerXId
        case .playerOTurn: return playerOId
        default: return nil
        }
    }

    /// Belirli bir kullanıcının işareti
    public func mark(for userId: String) -> XOXMark {
        if userId == playerXId { return .x }
        if userId == playerOId { return .o }
        return .empty
    }

    /// Board'u 3x3 grid olarak döndür
    public var grid: [[XOXMark]] {
        return stride(from: 0, to: 9, by: 3).map { Array(board[$0..<$0+3]) }
    }

    // MARK: - Actions

    /// Hamle yap
    public mutating func makeMove(at index: Int, playerId: String) -> Bool {
        guard index >= 0 && index < 9 else { return false }
        guard board[index] == .empty else { return false }
        guard currentPlayerId == playerId else { return false }

        let playerMark = mark(for: playerId)
        board[index] = playerMark
        lastMoveAt = Date()
        updatedAt = Date()

        // Kazanma kontrolü
        if checkWin(for: playerMark) {
            status = playerMark == .x ? .playerXWon : .playerOWon
            if playerMark == .x { playerXScore += 1 }
            else { playerOScore += 1 }
            return true
        }

        // Beraberlik kontrolü
        if !board.contains(.empty) {
            status = .draw
            return true
        }

        // Sıra değiştir
        status = status == .playerXTurn ? .playerOTurn : .playerXTurn
        return true
    }

    /// Oyunu kabul et
    public mutating func accept() {
        guard status == .waiting else { return }
        status = .playerXTurn
        updatedAt = Date()
    }

    /// Oyunu reddet
    public mutating func decline() {
        guard status == .waiting else { return }
        status = .declined
        updatedAt = Date()
    }

    /// Rövanş (board sıfırla, skor kalsın)
    public mutating func rematch() {
        board = Array(repeating: .empty, count: 9)
        status = .playerXTurn
        lastMoveAt = nil
        updatedAt = Date()
    }

    // MARK: - Win Check
    private func checkWin(for mark: XOXMark) -> Bool {
        let winPatterns: [[Int]] = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Satırlar
            [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Sütunlar
            [0, 4, 8], [2, 4, 6]               // Çaprazlar
        ]

        return winPatterns.contains { pattern in
            pattern.allSatisfy { board[$0] == mark }
        }
    }

    /// Kazanan çizgisi (UI'da vurgulamak için)
    public var winningLine: [Int]? {
        let winPatterns: [[Int]] = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ]

        for pattern in winPatterns {
            let marks = pattern.map { board[$0] }
            if marks.allSatisfy({ $0 == .x }) || marks.allSatisfy({ $0 == .o }) {
                return pattern
            }
        }
        return nil
    }
}

// MARK: - XOX Skor Geçmişi (Görsel Panel 5)
public struct XOXScoreHistory: Codable, Equatable {
    public var totalGamesPlayed: Int
    public var playerAWins: Int
    public var playerBWins: Int
    public var draws: Int
    public var currentWinStreak: Int
    public var streakHolder: String      // Kimde streak?
    public var lastResults: [String]     // "W", "L", "D" son 5 oyun

    public init() {
        self.totalGamesPlayed = 0
        self.playerAWins = 0
        self.playerBWins = 0
        self.draws = 0
        self.currentWinStreak = 0
        self.streakHolder = ""
        self.lastResults = []
    }

    public mutating func recordResult(winnerId: String?, playerAId: String) {
        totalGamesPlayed += 1
        if let winner = winnerId {
            if winner == playerAId {
                playerAWins += 1
                lastResults.append("W")
                if streakHolder == playerAId { currentWinStreak += 1 }
                else { currentWinStreak = 1; streakHolder = playerAId }
            } else {
                playerBWins += 1
                lastResults.append("L")
                if streakHolder != playerAId && !streakHolder.isEmpty { currentWinStreak += 1 }
                else { currentWinStreak = 1; streakHolder = winner }
            }
        } else {
            draws += 1
            lastResults.append("D")
            currentWinStreak = 0
            streakHolder = ""
        }
        // Son 5 sonucu tut
        if lastResults.count > 5 { lastResults.removeFirst() }
    }
}
