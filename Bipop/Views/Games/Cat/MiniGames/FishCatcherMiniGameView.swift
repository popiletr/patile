import SwiftUI

public struct FishCatcherMiniGameView: View {
    @Environment(\.dismiss) var dismiss
    @Binding var cat: PetCat

    @State private var basketX: CGFloat = 0
    @State private var score: Int = 0
    @State private var timeLeft: Int = 25
    @State private var isPlaying: Bool = false
    @State private var isGameOver: Bool = false
    @State private var fallingItems: [FallingFishItem] = []
    @State private var gameTimer: Timer? = nil
    @State private var itemTimer: Timer? = nil
    @State private var earnedCoins: Int = 0

    struct FallingFishItem: Identifiable {
        let id = UUID()
        var x: CGFloat
        var y: CGFloat
        let icon: String
        let points: Int
        let speed: CGFloat
    }

    public init(cat: Binding<PetCat>) {
        self._cat = cat
    }

    public var body: some View {
        GeometryReader { geo in
            ZStack {
                LinearGradient(
                    colors: [Color(hex: "#0F2027"), Color(hex: "#203A43"), Color(hex: "#2C5364")],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()

                VStack(spacing: 12) {
                    // Header
                    HStack {
                        Button(action: { stopGame(); dismiss() }) {
                            Image(systemName: "xmark.circle.fill")
                                .font(.system(size: 26))
                                .foregroundColor(.white.opacity(0.7))
                        }
                        Spacer()
                        Text("Balık Yakalama")
                            .font(.system(size: 20, weight: .black, design: .rounded))
                            .foregroundColor(.white)
                        Spacer()
                        HStack(spacing: 5) {
                            Image(systemName: "circle.circle.fill")
                                .foregroundColor(Color(hex: "#FFC107"))
                            Text("\(cat.coins)")
                                .font(.system(size: 15, weight: .bold, design: .rounded))
                                .foregroundColor(Color(hex: "#FFC107"))
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(Color.white.opacity(0.1))
                        .clipShape(Capsule())
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 16)

                    // Skor & Süre
                    HStack {
                        Text("Skor: \(score)")
                            .font(.system(size: 18, weight: .heavy, design: .rounded))
                            .foregroundColor(Color(hex: "#4ECCA3"))
                        Spacer()
                        Text("Süre: \(timeLeft)s")
                            .font(.system(size: 18, weight: .bold, design: .monospaced))
                            .foregroundColor(.yellow)
                    }
                    .padding(.horizontal, 24)

                    // Oyun Alanı
                    if isPlaying {
                        ZStack {
                            // Düşen Balıklar
                            ForEach(fallingItems) { item in
                                Image(systemName: item.icon)
                                    .font(.system(size: 26))
                                    .foregroundColor(item.points > 20 ? Color(hex: "#FFC107") : Color(hex: "#4ECCA3"))
                                    .position(x: item.x, y: item.y)
                            }

                            // Kedi Sepeti (Altta Sürüklenen)
                            VStack(spacing: 2) {
                                Image(systemName: "pawprint.fill")
                                    .font(.system(size: 16))
                                    .foregroundColor(.white.opacity(0.7))
                                Image(systemName: "basket.fill")
                                    .font(.system(size: 38))
                                    .foregroundColor(Color(hex: "#FF6B9D"))
                            }
                            .position(x: min(max(40, basketX), geo.size.width - 40), y: geo.size.height - 180)
                            .gesture(
                                DragGesture()
                                    .onChanged { value in
                                        basketX = value.location.x
                                    }
                            )
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                    } else if isGameOver {
                        gameOverView
                    } else {
                        startPromptView
                    }

                    Spacer()
                }
            }
            .onAppear {
                basketX = geo.size.width / 2
            }
            .onDisappear {
                stopGame()
            }
        }
    }

    private var startPromptView: some View {
        VStack(spacing: 18) {
            Spacer()
            Image(systemName: "fish.fill")
                .font(.system(size: 54))
                .foregroundColor(Color(hex: "#4ECCA3"))

            Text("Yukarıdan düşen leziz balıkları yakala.\nSepeti parmağınla sağa sola sürükle.")
                .font(.system(size: 15, weight: .medium))
                .multilineTextAlignment(.center)
                .foregroundColor(.white.opacity(0.8))
                .padding(.horizontal, 30)

            Button(action: startGame) {
                Text("Balık Tutmaya Başla")
                    .font(.system(size: 17, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(Color(hex: "#4ECCA3"))
                    .clipShape(RoundedRectangle(cornerRadius: 18))
                    .shadow(color: Color(hex: "#4ECCA3").opacity(0.4), radius: 10, y: 5)
            }
            .padding(.horizontal, 40)
            Spacer()
        }
    }

    private var gameOverView: some View {
        VStack(spacing: 16) {
            Spacer()
            Text("Balık Kovası Doldu!")
                .font(.system(size: 24, weight: .black, design: .rounded))
                .foregroundColor(.white)

            Text("Toplam Skor: \(score)")
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(.white.opacity(0.8))

            HStack(spacing: 6) {
                Text("Kazanılan:")
                Image(systemName: "circle.circle.fill")
                    .foregroundColor(Color(hex: "#FFC107"))
                Text("+\(earnedCoins)")
                    .font(.system(size: 22, weight: .black, design: .rounded))
                    .foregroundColor(Color(hex: "#FFC107"))
            }
            .padding(.vertical, 8)
            .padding(.horizontal, 20)
            .background(Color.white.opacity(0.1))
            .clipShape(Capsule())

            HStack(spacing: 12) {
                Button(action: startGame) {
                    HStack(spacing: 6) {
                        Image(systemName: "arrow.clockwise")
                        Text("Tekrar Oyna")
                    }
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.white)
                    .padding(.vertical, 14)
                    .padding(.horizontal, 24)
                    .background(Color(hex: "#4ECCA3"))
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                }

                Button(action: {
                    AdMobManager.shared.showRewardedAd(rewardType: "coins") {
                        cat.addCoins(50)
                        earnedCoins += 50
                    }
                }) {
                    HStack(spacing: 6) {
                        Image(systemName: "play.rectangle.fill")
                        Text("2x Altın (Reklam)")
                    }
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.black)
                    .padding(.vertical, 14)
                    .padding(.horizontal, 18)
                    .background(Color(hex: "#FFC107"))
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                }
            }
            Spacer()
        }
    }

    private func startGame() {
        score = 0
        timeLeft = 25
        fallingItems = []
        earnedCoins = 0
        isPlaying = true
        isGameOver = false

        gameTimer?.invalidate()
        gameTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            if timeLeft > 0 {
                timeLeft -= 1
            } else {
                endGame()
            }
        }

        itemTimer?.invalidate()
        itemTimer = Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { _ in
            updatePhysics()
        }
    }

    private func updatePhysics() {
        // Spawn chance
        if Double.random(in: 0...1) < 0.08 {
            let icons = ["fish.fill", "star.fill", "sparkles"]
            let randomIcon = icons.randomElement() ?? "fish.fill"
            let randomX = CGFloat.random(in: 40...320)
            let item = FallingFishItem(
                x: randomX,
                y: 0,
                icon: randomIcon,
                points: randomIcon == "star.fill" ? 30 : 15,
                speed: CGFloat.random(in: 5...9)
            )
            fallingItems.append(item)
        }

        // Move items down
        for i in 0..<fallingItems.count {
            fallingItems[i].y += fallingItems[i].speed
        }

        // Check basket collision (y ~= 420)
        fallingItems.removeAll { item in
            if abs(item.x - basketX) < 45 && item.y >= 380 && item.y <= 430 {
                score += item.points
                return true
            }
            return item.y > 550
        }
    }

    private func endGame() {
        stopGame()
        isGameOver = true
        earnedCoins = max(10, score / 2)
        cat.addCoins(earnedCoins)
        cat.hunger = min(100, cat.hunger + 15) // Balık tuttuğu için doyar
        cat.happiness = min(100, cat.happiness + 20)
        AdMobManager.shared.showInterstitialAd()
    }

    private func stopGame() {
        isPlaying = false
        gameTimer?.invalidate()
        gameTimer = nil
        itemTimer?.invalidate()
        itemTimer = nil
    }
}
