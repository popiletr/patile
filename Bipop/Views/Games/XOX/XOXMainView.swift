import SwiftUI

public struct XOXMainView: View {
    @EnvironmentObject var state: AppState
    @Environment(\.dismiss) var dismiss
    @State private var game: XOXGame? = nil
    @State private var showInvite: Bool = false
    @State private var winAnimation: Bool = false

    public var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(hex: "#1A0A2E"), Color(hex: "#0A0A0E")],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            if let game = game {
                gameView(game)
            } else {
                noGameView
            }
        }
        .sheet(isPresented: $showInvite) {
            XOXInviteView { friendId, friendName in
                createGame(friendId: friendId, friendName: friendName)
            }
            .environmentObject(state)
        }
    }

    // MARK: - No Game
    private var noGameView: some View {
        VStack(spacing: 24) {
            closeButton.padding(16)
            Spacer()

            ZStack {
                Circle()
                    .fill(Color(hex: "#7928CA").opacity(0.15))
                    .frame(width: 120, height: 120)

                HStack(spacing: 12) {
                    Text("X")
                        .font(.system(size: 36, weight: .black, design: .rounded))
                        .foregroundColor(Color(hex: "#FF5252"))
                    Text("O")
                        .font(.system(size: 36, weight: .black, design: .rounded))
                        .foregroundColor(Color(hex: "#2196F3"))
                }
            }

            Text("XOX Oyna!")
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .foregroundColor(.white)

            Text("Arkadaşını davet et ve oynayın")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.white.opacity(0.6))

            Button(action: { showInvite = true }) {
                HStack(spacing: 8) {
                    Image(systemName: "person.2.fill")
                    Text("Arkadaşını Davet Et")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(
                    LinearGradient(
                        colors: [Color(hex: "#7928CA"), Color(hex: "#FF0080")],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .shadow(color: Color(hex: "#7928CA").opacity(0.4), radius: 12, y: 6)
            }
            .padding(.horizontal, 40)

            Spacer()
        }
    }

    // MARK: - Game View
    private func gameView(_ game: XOXGame) -> some View {
        VStack(spacing: 20) {
            // Top bar
            HStack {
                closeButton
                Spacer()
                statusBadge(game)
            }
            .padding(.horizontal, 16)
            .padding(.top, 12)

            // Score Header
            scoreHeader(game)
                .padding(.horizontal, 16)

            Spacer()

            // Board
            boardView(game)
                .padding(.horizontal, 32)

            Spacer()

            // Game status message
            statusMessage(game)
                .padding(.horizontal, 16)

            // Action buttons
            if game.status.isFinished {
                HStack(spacing: 12) {
                    Button(action: {
                        self.game?.rematch()
                        saveGame()
                        HapticManager.shared.playSelection()
                    }) {
                        HStack(spacing: 6) {
                            Image(systemName: "arrow.counterclockwise")
                            Text("Rövanş")
                                .font(.system(size: 14, weight: .bold, design: .rounded))
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(
                            LinearGradient(
                                colors: [Color(hex: "#7928CA"), Color(hex: "#FF0080")],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                    }

                    Button(action: { dismiss() }) {
                        Text("Kapat")
                            .font(.system(size: 14, weight: .bold, design: .rounded))
                            .foregroundColor(.white.opacity(0.6))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(Color.white.opacity(0.08))
                            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                    }
                }
                .padding(.horizontal, 16)
            }

            Spacer(minLength: 30)
        }
    }

    // MARK: - Score Header
    private func scoreHeader(_ game: XOXGame) -> some View {
        HStack {
            playerScore(name: game.playerXName.isEmpty ? "Oyuncu X" : game.playerXName,
                        mark: "X", score: game.playerXScore,
                        isActive: game.status == .playerXTurn)

            VStack(spacing: 4) {
                Text("VS")
                    .font(.system(size: 14, weight: .black, design: .rounded))
                    .foregroundColor(Color(hex: "#7928CA"))
                Text("-")
                    .font(.system(size: 10))
                    .foregroundColor(.white.opacity(0.3))
            }

            playerScore(name: game.playerOName.isEmpty ? "Oyuncu O" : game.playerOName,
                        mark: "O", score: game.playerOScore,
                        isActive: game.status == .playerOTurn)
        }
    }

    private func playerScore(name: String, mark: String, score: Int, isActive: Bool) -> some View {
        VStack(spacing: 6) {
            Text(mark)
                .font(.system(size: 24, weight: .black, design: .rounded))
                .foregroundColor(mark == "X" ? Color(hex: "#FF5252") : Color(hex: "#2196F3"))
            Text(name)
                .font(.system(size: 12, weight: .bold, design: .rounded))
                .foregroundColor(.white)
                .lineLimit(1)
            Text("\(score)")
                .font(.system(size: 18, weight: .black, design: .rounded))
                .foregroundColor(isActive ? Color(hex: "#FFD700") : .white.opacity(0.4))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(isActive ? Color(hex: "#7928CA").opacity(0.2) : Color.white.opacity(0.04))
                .overlay(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .stroke(isActive ? Color(hex: "#7928CA") : Color.clear, lineWidth: 1.5)
                )
        )
    }

    // MARK: - Board View
    private func boardView(_ game: XOXGame) -> some View {
        let columns = Array(repeating: GridItem(.flexible(), spacing: 10), count: 3)

        return LazyVGrid(columns: columns, spacing: 10) {
            ForEach(0..<9) { index in
                cellView(at: index, game: game)
            }
        }
        .aspectRatio(1, contentMode: .fit)
    }

    private func cellView(at index: Int, game: XOXGame) -> some View {
        let cell = game.board[index]
        let isWinning = game.winningLine?.contains(index) ?? false

        return Button(action: {
            makeMove(at: index)
        }) {
            ZStack {
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(
                        isWinning
                            ? Color(hex: "#FFD700").opacity(0.3)
                            : (cell != .empty ? Color.white.opacity(0.08) : Color.white.opacity(0.04))
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .stroke(
                                isWinning
                                    ? Color(hex: "#FFD700")
                                    : Color.white.opacity(0.1),
                                lineWidth: isWinning ? 2 : 1
                            )
                    )

                if cell == .x {
                    Text("X")
                        .font(.system(size: 36, weight: .black, design: .rounded))
                        .foregroundColor(Color(hex: "#FF5252"))
                        .transition(.scale.combined(with: .opacity))
                } else if cell == .o {
                    Text("O")
                        .font(.system(size: 36, weight: .black, design: .rounded))
                        .foregroundColor(Color(hex: "#2196F3"))
                        .transition(.scale.combined(with: .opacity))
                }
            }
        }
        .aspectRatio(1, contentMode: .fit)
        .disabled(cell != .empty || game.status.isFinished)
    }

    // MARK: - Status
    private func statusBadge(_ game: XOXGame) -> some View {
        let text: String
        let color: String
        switch game.status {
        case .playerXTurn: text = "X Sırası"; color = "#FF5252"
        case .playerOTurn: text = "O Sırası"; color = "#2196F3"
        case .playerXWon:  text = "X Kazandı!"; color = "#FFD700"
        case .playerOWon:  text = "O Kazandı!"; color = "#FFD700"
        case .draw:        text = "Berabere"; color = "#9E9E9E"
        case .waiting:     text = "Bekleniyor"; color = "#FF9800"
        case .declined:    text = "Reddedildi"; color = "#F44336"
        }

        return Text(text)
            .font(.system(size: 11, weight: .bold, design: .rounded))
            .foregroundColor(Color(hex: color))
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(Color(hex: color).opacity(0.12))
            .clipShape(Capsule())
    }

    private func statusMessage(_ game: XOXGame) -> some View {
        let msg: String
        switch game.status {
        case .playerXTurn: msg = "\(game.playerXName.isEmpty ? "X" : game.playerXName)'in sırası"
        case .playerOTurn: msg = "\(game.playerOName.isEmpty ? "O" : game.playerOName)'nun sırası"
        case .playerXWon:  msg = "\(game.playerXName.isEmpty ? "X" : game.playerXName) kazandı!"
        case .playerOWon:  msg = "\(game.playerOName.isEmpty ? "O" : game.playerOName) kazandı!"
        case .draw:        msg = "Berabere! Tekrar deneyin"
        case .waiting:     msg = "Davet gönderildi..."
        case .declined:    msg = "Davet reddedildi"
        }

        return Text(msg)
            .font(.system(size: 14, weight: .bold, design: .rounded))
            .foregroundColor(.white.opacity(0.8))
            .padding(14)
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(Color.white.opacity(0.05))
            )
    }

    // MARK: - Helpers
    private var closeButton: some View {
        Button(action: { dismiss() }) {
            Image(systemName: "xmark.circle.fill")
                .font(.system(size: 26))
                .foregroundColor(.white.opacity(0.5))
        }
    }

    private func makeMove(at index: Int) {
        guard var g = game else { return }
        let userId = state.userProfile.id
        _ = g.makeMove(at: index, playerId: userId)
        game = g
        saveGame()

        if g.status.isFinished {
            HapticManager.shared.playSuccess()
        }
    }

    private func createGame(friendId: String, friendName: String) {
        var newGame = XOXGame(
            playerXId: state.userProfile.id,
            playerOId: friendId,
            playerXName: state.userProfile.name,
            playerOName: friendName
        )
        newGame.accept()
        game = newGame
        saveGame()
    }

    // MARK: - Persistence
    private func saveGame() {
        guard let game = game else { return }
        if let data = try? JSONEncoder().encode(game) {
            UserDefaults(suiteName: "group.com.bipop.app")?.set(data, forKey: "xox_game_\(state.userProfile.id)")
        }
    }
}

// MARK: - XOX Invite View
struct XOXInviteView: View {
    @EnvironmentObject var state: AppState
    @Environment(\.dismiss) var dismiss
    var onInvite: (String, String) -> Void

    var body: some View {
        ZStack {
            Color(hex: "#0A0A0E").ignoresSafeArea()

            VStack(spacing: 20) {
                Text("Rakip Seç")
                    .font(.system(size: 22, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .padding(.top, 20)

                if state.friends.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "person.crop.circle.badge.questionmark")
                            .font(.system(size: 36))
                            .foregroundColor(.white.opacity(0.4))
                        Text("Henüz arkadaşın yok")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.white.opacity(0.5))
                        Text("Önce Arkadaşlar sekmesinden eşleş")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.white.opacity(0.3))
                    }
                    .padding(.top, 40)
                } else {
                    ScrollView(showsIndicators: false) {
                        VStack(spacing: 10) {
                            ForEach(state.friends) { friend in
                                Button(action: {
                                    onInvite(friend.id, friend.name)
                                    HapticManager.shared.playSuccess()
                                    dismiss()
                                }) {
                                    HStack(spacing: 12) {
                                        ZStack {
                                            Circle()
                                                .fill(Color(hex: "#7928CA").opacity(0.2))
                                                .frame(width: 40, height: 40)
                                            Text(friend.emoji.isEmpty ? friend.initials : friend.emoji)
                                                .font(.system(size: friend.emoji.isEmpty ? 14 : 20, weight: .bold))
                                                .foregroundColor(.white)
                                        }
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(friend.name)
                                                .font(.system(size: 14, weight: .bold, design: .rounded))
                                                .foregroundColor(.white)
                                            Text("@\(friend.username)")
                                                .font(.system(size: 11, weight: .medium))
                                                .foregroundColor(.white.opacity(0.4))
                                        }
                                        Spacer()
                                        Text("Davet Et")
                                            .font(.system(size: 11, weight: .bold))
                                            .foregroundColor(Color(hex: "#7928CA"))
                                            .padding(.horizontal, 10)
                                            .padding(.vertical, 5)
                                            .background(Color(hex: "#7928CA").opacity(0.12))
                                            .clipShape(Capsule())
                                    }
                                    .padding(12)
                                    .background(
                                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                                            .fill(Color(hex: "#16161E"))
                                    )
                                }
                            }
                        }
                        .padding(.horizontal, 16)
                    }
                }

                Spacer()
            }
        }
    }
}
