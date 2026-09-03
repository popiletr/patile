import SwiftUI

public struct TreeMainView: View {
    @EnvironmentObject var state: AppState
    @Environment(\.dismiss) var dismiss
    @State private var tree: AppleTree? = nil
    @State private var showHarvestResult: Bool = false
    @State private var harvestedCount: Int = 0
    @State private var leafAnimation: Bool = false

    public var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(hex: "#0D1F12"), Color(hex: "#0A150A"), Color(hex: "#060D06")],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            if let tree = tree {
                treeView(tree)
            } else {
                emptyTreeView
            }
        }
        .onAppear { loadTree() }
        .alert("Hasat Sonucu", isPresented: $showHarvestResult) {
            Button("Tamam") {}
        } message: {
            Text("\(harvestedCount) elma hasat ettin! Toplam: \(tree?.totalApplesHarvested ?? 0)")
        }
    }

    // MARK: - Empty State
    private var emptyTreeView: some View {
        VStack(spacing: 24) {
            closeButton.padding(16)
            Spacer()

            ZStack {
                Circle()
                    .fill(Color(hex: "#56AB2F").opacity(0.12))
                    .frame(width: 120, height: 120)
                Image(systemName: "leaf.fill")
                    .font(.system(size: 54))
                    .foregroundColor(Color(hex: "#56AB2F"))
            }

            Text("Bahçen Boş!")
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .foregroundColor(.white)

            Text("Bir elma ağacı dik ve birlikte büyütün")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.white.opacity(0.6))

            Button(action: plantTree) {
                HStack(spacing: 8) {
                    Image(systemName: "leaf.fill")
                    Text("Ağaç Dik")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(
                    LinearGradient(
                        colors: [Color(hex: "#56AB2F"), Color(hex: "#A8E063")],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .shadow(color: Color(hex: "#56AB2F").opacity(0.4), radius: 12, y: 6)
            }
            .padding(.horizontal, 40)

            Spacer()
        }
    }

    // MARK: - Tree View
    private func treeView(_ tree: AppleTree) -> some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                // Top bar
                HStack {
                    closeButton
                    Spacer()
                    HStack(spacing: 6) {
                        Image(systemName: "sun.max.fill")
                            .font(.system(size: 12))
                            .foregroundColor(.yellow)
                        Text(tree.currentSeason.displayName)
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.white.opacity(0.7))
                        Text("• Hafta \(tree.ageInWeeks)")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.white.opacity(0.5))
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Color.white.opacity(0.1))
                    .clipShape(Capsule())
                }
                .padding(.horizontal, 16)
                .padding(.top, 12)

                // Tree Display
                treeDisplayCard(tree)
                    .padding(.horizontal, 16)

                // Stats
                VStack(spacing: 10) {
                    statBar(label: "Su Seviyesi", value: tree.waterLevel, color: "#2196F3", iconName: "drop.fill")
                    statBar(label: "Toprak", value: tree.soilHealth, color: "#795548", iconName: "leaf.fill")
                    statBar(label: "Sağlık", value: tree.treeHealth, color: "#4CAF50", iconName: "heart.fill")
                }
                .padding(.horizontal, 16)

                // Actions
                actionButtons(tree)
                    .padding(.horizontal, 16)

                // Alerts
                alertsSection(tree)
                    .padding(.horizontal, 16)

                // Harvest info
                HStack(spacing: 8) {
                    Image(systemName: "circle.circle.fill")
                        .foregroundColor(Color(hex: "#FF5252"))
                    Text("Toplam Hasat: \(tree.totalApplesHarvested) elma")
                        .font(.system(size: 13, weight: .medium, design: .rounded))
                        .foregroundColor(.white.opacity(0.8))
                    Spacer()
                    if tree.currentApples > 0 {
                        Text("Ağaçta: \(tree.currentApples)")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(Color(hex: "#A8E063"))
                    }
                }
                .padding(14)
                .background(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(Color.white.opacity(0.05))
                )
                .padding(.horizontal, 16)

                Spacer(minLength: 40)
            }
        }
    }

    // MARK: - Tree Display
    private func treeDisplayCard(_ tree: AppleTree) -> some View {
        ZStack {
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [Color(hex: "#1A3A1A"), Color(hex: "#0D1F12")],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                        .stroke(Color(hex: "#56AB2F").opacity(0.2), lineWidth: 1)
                )

            VStack(spacing: 12) {
                Image(systemName: "leaf.circle.fill")
                    .font(.system(size: 72))
                    .foregroundColor(Color(hex: "#56AB2F"))
                    .rotationEffect(.degrees(leafAnimation ? 2 : -2))
                    .animation(
                        Animation.easeInOut(duration: 2).repeatForever(autoreverses: true),
                        value: leafAnimation
                    )

                Text(tree.growthStage.displayName)
                    .font(.system(size: 18, weight: .bold, design: .rounded))
                    .foregroundColor(.white)

                if tree.currentApples > 0 {
                    HStack(spacing: 4) {
                        ForEach(0..<min(tree.currentApples, 5), id: \.self) { _ in
                            Image(systemName: "circle.circle.fill")
                                .font(.system(size: 14))
                                .foregroundColor(Color(hex: "#FF5252"))
                        }
                        if tree.currentApples > 5 {
                            Text("+\(tree.currentApples - 5)")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.white.opacity(0.6))
                        }
                    }
                }

                if tree.isPestInfected {
                    HStack(spacing: 4) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundColor(Color(hex: "#FF5252"))
                        Text("Zararlı tespit edildi!")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(Color(hex: "#FF5252"))
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color(hex: "#FF5252").opacity(0.15))
                    .clipShape(Capsule())
                }
            }
            .padding(.vertical, 24)
        }
        .frame(height: 240)
        .onAppear { leafAnimation = true }
    }

    // MARK: - Actions
    private func actionButtons(_ tree: AppleTree) -> some View {
        VStack(spacing: 10) {
            HStack(spacing: 12) {
                actionBtn(title: "Sula", iconName: "drop.fill", color: "#2196F3", alert: tree.needsWatering) {
                    self.tree?.water()
                    saveTree()
                }
                actionBtn(title: "Çapa", iconName: "hammer.fill", color: "#795548", alert: tree.needsHoeing) {
                    self.tree?.hoe()
                    saveTree()
                }
                actionBtn(title: "Budama", iconName: "scissors", color: "#4CAF50", alert: false) {
                    self.tree?.prune()
                    saveTree()
                }
            }
            HStack(spacing: 12) {
                actionBtn(title: "Gübrele", iconName: "sparkles", color: "#FF9800", alert: false) {
                    self.tree?.fertilize()
                    saveTree()
                }
                if tree.canHarvest {
                    actionBtn(title: "Hasat", iconName: "basket.fill", color: "#F44336", alert: true) {
                        let count = self.tree?.harvest() ?? 0
                        harvestedCount = count
                        showHarvestResult = true
                        saveTree()
                    }
                }
                if tree.isPestInfected {
                    actionBtn(title: "İlaçla", iconName: "cross.case.fill", color: "#9C27B0", alert: true) {
                        self.tree?.treatPest()
                        saveTree()
                    }
                }
            }
        }
    }

    private func actionBtn(title: String, iconName: String, color: String, alert: Bool, action: @escaping () -> Void) -> some View {
        Button(action: {
            action()
            HapticManager.shared.playSelection()
        }) {
            VStack(spacing: 6) {
                ZStack(alignment: .topTrailing) {
                    Image(systemName: iconName)
                        .font(.system(size: 20))
                        .foregroundColor(Color(hex: color))
                    if alert {
                        Circle()
                            .fill(Color(hex: "#FF5252"))
                            .frame(width: 8, height: 8)
                            .offset(x: 4, y: -4)
                    }
                }
                Text(title)
                    .font(.system(size: 10, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(Color(hex: color).opacity(0.15))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(Color(hex: color).opacity(0.3), lineWidth: 1)
                    )
            )
        }
    }

    // MARK: - Alerts Section
    private func alertsSection(_ tree: AppleTree) -> some View {
        VStack(spacing: 6) {
            if tree.needsWatering {
                alertBanner(text: "Ağacın sulanmayı bekliyor!", color: "#2196F3")
            }
            if tree.needsHoeing {
                alertBanner(text: "Toprak çapalanmalı", color: "#795548")
            }
        }
    }

    private func alertBanner(text: String, color: String) -> some View {
        HStack(spacing: 6) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundColor(Color(hex: color))
            Text(text)
                .font(.system(size: 12, weight: .bold, design: .rounded))
                .foregroundColor(Color(hex: color))
            Spacer()
        }
        .padding(10)
        .background(
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(Color(hex: color).opacity(0.1))
        )
    }

    // MARK: - Shared
    private func statBar(label: String, value: Double, color: String, iconName: String) -> some View {
        HStack(spacing: 10) {
            Image(systemName: iconName)
                .font(.system(size: 13))
                .foregroundColor(Color(hex: color))
                .frame(width: 24)
            Text(label)
                .font(.system(size: 12, weight: .bold, design: .rounded))
                .foregroundColor(.white.opacity(0.7))
                .frame(width: 80, alignment: .leading)
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 6).fill(Color.white.opacity(0.08))
                    RoundedRectangle(cornerRadius: 6)
                        .fill(Color(hex: color))
                        .frame(width: geo.size.width * CGFloat(value / 100))
                }
            }
            .frame(height: 10)
            Text("\(Int(value))%")
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .foregroundColor(Color(hex: color))
                .frame(width: 36)
        }
    }

    private var closeButton: some View {
        Button(action: { dismiss() }) {
            Image(systemName: "xmark.circle.fill")
                .font(.system(size: 26))
                .foregroundColor(.white.opacity(0.5))
        }
    }

    // MARK: - Persistence
    private func loadTree() {
        if let data = UserDefaults(suiteName: "group.com.bipop.app")?.data(forKey: "apple_tree_\(state.userProfile.id)"),
           let saved = try? JSONDecoder().decode(AppleTree.self, from: data) {
            var loaded = saved
            loaded.tick()
            self.tree = loaded
        }
    }

    private func saveTree() {
        guard let tree = tree else { return }
        if let data = try? JSONEncoder().encode(tree) {
            UserDefaults(suiteName: "group.com.bipop.app")?.set(data, forKey: "apple_tree_\(state.userProfile.id)")
            SharedStorage.shared.reloadWidgets()
        }
    }

    private func plantTree() {
        tree = AppleTree(ownerId: state.userProfile.id)
        saveTree()
    }
}
