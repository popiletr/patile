import SwiftUI

public struct GamesHubView: View {
    @EnvironmentObject var state: AppState
    @State private var selectedGame: GameType? = nil

    public var body: some View {
        NavigationView {
            ZStack {
                Color(hex: "#0A0A0E")
                    .ignoresSafeArea()

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 20) {
                        // Header
                        headerBar
                            .padding(.horizontal, 16)
                            .padding(.top, 8)

                        // Game Cards Grid
                        LazyVGrid(columns: [
                            GridItem(.flexible(), spacing: 14),
                            GridItem(.flexible(), spacing: 14)
                        ], spacing: 14) {
                            ForEach(GameType.allCases) { game in
                                gameCard(game)
                            }
                        }
                        .padding(.horizontal, 16)

                        Spacer(minLength: 120)
                    }
                }
            }
            .navigationBarHidden(true)
            .fullScreenCover(item: $selectedGame) { game in
                switch game {
                case .cat:
                    CatMainView()
                        .environmentObject(state)
                case .aquarium:
                    AquariumMainView()
                        .environmentObject(state)
                case .tree:
                    TreeMainView()
                        .environmentObject(state)
                case .xox:
                    XOXMainView()
                        .environmentObject(state)
                }
            }
        }
    }

    // MARK: - Header
    private var headerBar: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 0) {
                    Text("B")
                        .font(.system(size: 24, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                    Text("!")
                        .font(.system(size: 24, weight: .black, design: .rounded))
                        .foregroundColor(Color(hex: "#FF007F"))
                    Text("Games")
                        .font(.system(size: 24, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                }
                Text("Arkadaşınla birlikte oyna & büyüt")
                    .font(.system(size: 12, weight: .medium, design: .rounded))
                    .foregroundColor(.white.opacity(0.5))
            }
            Spacer()
        }
    }

    // MARK: - Game Card
    private func gameCard(_ game: GameType) -> some View {
        Button(action: {
            selectedGame = game
            HapticManager.shared.playSelection()
        }) {
            VStack(spacing: 12) {
                // Game Icon
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: game.gradientColors,
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 56, height: 56)
                        .shadow(color: game.gradientColors[0].opacity(0.4), radius: 8, y: 4)

                    if game == .cat {
                        CatSpriteImageView(breed: .britishShorthair, animation: .idle, frameIndex: 0)
                            .frame(width: 44, height: 44)
                    } else {
                        Image(systemName: game.iconName)
                            .font(.system(size: 24))
                            .foregroundColor(.white)
                    }
                }

                VStack(spacing: 4) {
                    Text(game.title)
                        .font(.system(size: 15, weight: .bold, design: .rounded))
                        .foregroundColor(.white)

                    Text(game.subtitle)
                        .font(.system(size: 10, weight: .medium, design: .rounded))
                        .foregroundColor(.white.opacity(0.5))
                        .multilineTextAlignment(.center)
                        .lineLimit(2)
                }

                // Status pill
                HStack(spacing: 4) {
                    Circle()
                        .fill(Color(hex: "#00FF66"))
                        .frame(width: 5, height: 5)
                    Text("Aktif")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(Color(hex: "#00FF66"))
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 3)
                .background(Color(hex: "#00FF66").opacity(0.12))
                .clipShape(Capsule())
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 20)
            .padding(.horizontal, 12)
            .background(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(Color(hex: "#16161E"))
                    .overlay(
                        RoundedRectangle(cornerRadius: 20, style: .continuous)
                            .stroke(
                                LinearGradient(
                                    colors: [game.gradientColors[0].opacity(0.3), Color.clear],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                lineWidth: 1
                            )
                    )
            )
        }
    }
}

// MARK: - Game Type Enum
public enum GameType: String, CaseIterable, Identifiable {
    case cat = "cat"
    case aquarium = "aquarium"
    case tree = "tree"
    case xox = "xox"

    public var id: String { rawValue }

    public var title: String {
        switch self {
        case .cat:      return "Kedim"
        case .aquarium: return "Akvaryum"
        case .tree:     return "Bahçem"
        case .xox:      return "XOX"
        }
    }

    public var subtitle: String {
        switch self {
        case .cat:      return "Kedini büyüt & sev"
        case .aquarium: return "Balıklarını besle"
        case .tree:     return "Ağacını yetiştir"
        case .xox:      return "Arkadaşınla oyna"
        }
    }

    public var iconName: String {
        switch self {
        case .cat:      return "pawprint.fill"
        case .aquarium: return "drop.fill"
        case .tree:     return "leaf.fill"
        case .xox:      return "grid"
        }
    }

    public var gradientColors: [Color] {
        switch self {
        case .cat:      return [Color(hex: "#FF6B9D"), Color(hex: "#C44569")]
        case .aquarium: return [Color(hex: "#00B4DB"), Color(hex: "#0083B0")]
        case .tree:     return [Color(hex: "#56AB2F"), Color(hex: "#A8E063")]
        case .xox:      return [Color(hex: "#7928CA"), Color(hex: "#FF0080")]
        }
    }
}
