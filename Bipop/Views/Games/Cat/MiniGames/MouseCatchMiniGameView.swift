import SwiftUI

public struct MouseCatchMiniGameView: View {
    @Environment(\.dismiss) var dismiss
    @Binding var cat: PetCat

    @State private var score: Int = 0
    @State private var timeLeft: Int = 30
    @State private var isPlaying: Bool = false
    @State private var isGameOver: Bool = false
    @State private var activeHoles: [Bool] = Array(repeating: false, count: 9)
    @State private var isGoldenMouse: [Bool] = Array(repeating: false, count: 9)
    @State private var gameTimer: Timer? = nil
    @State private var spawnTimer: Timer? = nil
    @State private var earnedCoins: Int = 0

    public init(cat: Binding<PetCat>) {
        self._cat = cat
    }

    public var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(hex: "#1F112E"), Color(hex: "#0E071A")],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 16) {
                // Header Bar
                HStack {
                    Button(action: { stopGame(); dismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 26))
                            .foregroundColor(.white.opacity(0.7))
                    }

                    Spacer()

                    Text("Fare Avı")
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

                // HUD: Skor ve Süre
                HStack(spacing: 20) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("SKOR")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.white.opacity(0.6))
                        Text("\(score)")
                            .font(.system(size: 26, weight: .heavy, design: .rounded))
                            .foregroundColor(Color(hex: "#FF6B9D"))
                    }

                    Spacer()

                    VStack(alignment: .trailing, spacing: 2) {
                        Text("KALAN SÜRE")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.white.opacity(0.6))
                        Text("\(timeLeft)s")
                            .font(.system(size: 26, weight: .heavy, design: .monospaced))
                            .foregroundColor(timeLeft <= 5 ? .red : .yellow)
                    }
                }
                .padding(.horizontal, 24)
                .padding(.vertical, 12)
                .background(Color.white.opacity(0.06))
                .clipShape(RoundedRectangle(cornerRadius: 16))
                .padding(.horizontal, 16)

                Spacer()

                // 3x3 Delik Izgarası
                if isPlaying {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 14), count: 3), spacing: 14) {
                        ForEach(0..<9) { index in
                            holeView(index: index)
                        }
                    }
                    .padding(.horizontal, 20)
                } else if isGameOver {
                    gameOverView
                } else {
                    startPromptView
                }

                Spacer()
            }
        }
        .onDisappear {
            stopGame()
        }
    }

    // MARK: - Delik Görünümü
    private func holeView(index: Int) -> some View {
        Button(action: { hitHole(index) }) {
            ZStack {
                // Delik Zemin
                Circle()
                    .fill(Color(hex: "#10091A"))
                    .overlay(Circle().stroke(Color.white.opacity(0.12), lineWidth: 2))
                    .shadow(color: .black.opacity(0.5), radius: 6, y: 4)

                // Çıkan Hedef İkonu
                if activeHoles[index] {
                    Image(systemName: isGoldenMouse[index] ? "star.circle.fill" : "target")
                        .font(.system(size: 34, weight: .bold))
                        .foregroundColor(isGoldenMouse[index] ? Color(hex: "#FFC107") : Color(hex: "#FF6B9D"))
                        .transition(.scale.combined(with: .opacity))
                }
            }
            .frame(height: 95)
        }
        .buttonStyle(.plain)
    }

    // MARK: - Başlangıç Ekranı
    private var startPromptView: some View {
        VStack(spacing: 20) {
            Image(systemName: "pawprint.fill")
                .font(.system(size: 54))
                .foregroundColor(Color(hex: "#FF6B9D"))

            Text("Deliklerden çıkan hedefleri patile.\nAltın hedefler ekstra puan kazandırır.")
                .font(.system(size: 15, weight: .medium))
                .multilineTextAlignment(.center)
                .foregroundColor(.white.opacity(0.8))
                .padding(.horizontal, 30)

            Button(action: startGame) {
                Text("Oyunu Başlat")
                    .font(.system(size: 17, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(
                        LinearGradient(
                            colors: [Color(hex: "#FF6B9D"), Color(hex: "#C44569")],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 18))
                    .shadow(color: Color(hex: "#FF6B9D").opacity(0.4), radius: 10, y: 5)
            }
            .padding(.horizontal, 40)
        }
    }

    // MARK: - Oyun Bitiş Ekranı
    private var gameOverView: some View {
        VStack(spacing: 16) {
            Text("Harika Skor!")
                .font(.system(size: 26, weight: .black, design: .rounded))
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
            .padding(.horizontal, 16)
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
                    .background(Color(hex: "#FF6B9D"))
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
                    .padding(.horizontal, 20)
                    .background(Color(hex: "#FFC107"))
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                }
            }
            .padding(.top, 10)
        }
        .padding(.horizontal, 24)
    }

    // MARK: - Oyun Mantığı
    private func startGame() {
        score = 0
        timeLeft = 30
        earnedCoins = 0
        isPlaying = true
        isGameOver = false
        activeHoles = Array(repeating: false, count: 9)

        gameTimer?.invalidate()
        gameTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            if timeLeft > 0 {
                timeLeft -= 1
            } else {
                endGame()
            }
        }

        spawnTimer?.invalidate()
        spawnTimer = Timer.scheduledTimer(withTimeInterval: 0.65, repeats: true) { _ in
            spawnMouse()
        }
    }

    private func spawnMouse() {
        let randomHole = Int.random(in: 0..<9)
        let isGold = Double.random(in: 0...1) < 0.25

        activeHoles[randomHole] = true
        isGoldenMouse[randomHole] = isGold

        DispatchQueue.main.asyncAfter(deadline: .now() + Double.random(in: 0.7...1.1)) {
            if activeHoles[randomHole] {
                activeHoles[randomHole] = false
            }
        }
    }

    private func hitHole(_ index: Int) {
        guard activeHoles[index] else { return }
        let isGold = isGoldenMouse[index]
        activeHoles[index] = false

        let pts = isGold ? 30 : 10
        score += pts
    }

    private func endGame() {
        stopGame()
        isGameOver = true
        earnedCoins = max(10, score / 2)
        cat.addCoins(earnedCoins)
        cat.happiness = min(100, cat.happiness + 20)
        cat.energy = max(0, cat.energy - 15)

        AdMobManager.shared.showInterstitialAd()
    }

    private func stopGame() {
        isPlaying = false
        gameTimer?.invalidate()
        gameTimer = nil
        spawnTimer?.invalidate()
        spawnTimer = nil
    }
}
