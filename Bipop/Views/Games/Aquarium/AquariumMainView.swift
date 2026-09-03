import SwiftUI

public struct AquariumMainView: View {
    @EnvironmentObject var state: AppState
    @Environment(\.dismiss) var dismiss
    @State private var aquarium: Aquarium? = nil
    @State private var showAddFish: Bool = false
    @State private var bubbleAnimation: Bool = false

    public var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(hex: "#001B3A"), Color(hex: "#002855"), Color(hex: "#001225")],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            if let aquarium = aquarium {
                aquariumView(aquarium)
            } else {
                emptyAquariumView
            }
        }
        .onAppear { loadAquarium() }
        .sheet(isPresented: $showAddFish) {
            AddFishView { species, name in
                self.aquarium?.addFish(species, name: name)
                saveAquarium()
            }
        }
    }

    // MARK: - Empty State
    private var emptyAquariumView: some View {
        VStack(spacing: 24) {
            closeButton.padding(16)
            Spacer()

            ZStack {
                Circle()
                    .fill(Color(hex: "#00B4DB").opacity(0.12))
                    .frame(width: 120, height: 120)
                Image(systemName: "fish.fill")
                    .font(.system(size: 54))
                    .foregroundColor(Color(hex: "#00B4DB"))
            }

            Text("Akvaryumun Boş!")
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .foregroundColor(.white)

            Text("Akvaryumunu kur ve balık ekle")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.white.opacity(0.6))

            Button(action: createAquarium) {
                HStack(spacing: 8) {
                    Image(systemName: "plus.circle.fill")
                    Text("Akvaryum Kur")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(
                    LinearGradient(
                        colors: [Color(hex: "#00B4DB"), Color(hex: "#0083B0")],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .shadow(color: Color(hex: "#00B4DB").opacity(0.4), radius: 12, y: 6)
            }
            .padding(.horizontal, 40)

            Spacer()
        }
    }

    // MARK: - Aquarium View
    private func aquariumView(_ aq: Aquarium) -> some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                // Top bar
                HStack {
                    closeButton
                    Spacer()
                    HStack(spacing: 4) {
                        Image(systemName: "fish.fill")
                            .font(.system(size: 11))
                        Text("\(aq.fishCount) Balık")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.white.opacity(0.7))
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Color.white.opacity(0.1))
                    .clipShape(Capsule())
                }
                .padding(.horizontal, 16)
                .padding(.top, 12)

                // Tank View
                tankDisplay(aq)
                    .padding(.horizontal, 16)

                // Stats
                VStack(spacing: 10) {
                    statBar(label: "Su Kalitesi", value: aq.waterQuality, color: "#2196F3", iconName: "drop.fill")
                    statBar(label: "Yem", value: aq.foodLevel, color: "#FF9800", iconName: "fork.knife")
                }
                .padding(.horizontal, 16)

                // Actions
                HStack(spacing: 12) {
                    actionButton(title: "Yem Ver", iconName: "fork.knife", color: "#FF9800") {
                        self.aquarium?.feedFish()
                        saveAquarium()
                        HapticManager.shared.playSelection()
                    }

                    actionButton(title: "Su Değiştir", iconName: "drop.fill", color: "#2196F3") {
                        self.aquarium?.changeWater()
                        saveAquarium()
                        HapticManager.shared.playSelection()
                    }

                    actionButton(title: "Balık Ekle", iconName: "plus", color: "#00E676") {
                        showAddFish = true
                    }
                }
                .padding(.horizontal, 16)

                // Fish List
                if !aq.fish.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Balıklarım")
                            .font(.system(size: 14, weight: .bold, design: .rounded))
                            .foregroundColor(.white.opacity(0.6))
                            .padding(.horizontal, 16)

                        ForEach(aq.fish) { fish in
                            fishRow(fish)
                                .padding(.horizontal, 16)
                        }
                    }
                }

                // Status
                HStack(spacing: 8) {
                    Image(systemName: aq.isClean ? "checkmark.circle.fill" : "exclamationmark.triangle.fill")
                        .foregroundColor(aq.isClean ? .green : .yellow)
                    Text(aq.healthStatus)
                        .font(.system(size: 13, weight: .medium, design: .rounded))
                        .foregroundColor(.white.opacity(0.8))
                    Spacer()

                    if aq.needsWaterChange {
                        Text("Su değişimi gerekli!")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(Color(hex: "#FFC107"))
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

    // MARK: - Tank Display
    private func tankDisplay(_ aq: Aquarium) -> some View {
        ZStack {
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [
                            Color(hex: "#003366").opacity(0.5),
                            Color(hex: "#001B3A").opacity(0.8)
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                        .stroke(Color(hex: "#00B4DB").opacity(0.2), lineWidth: 1)
                )

            VStack {
                HStack(spacing: 16) {
                    ForEach(aq.fish.prefix(5)) { fish in
                        Image(systemName: "fish.fill")
                            .font(.system(size: 28))
                            .foregroundColor(Color(hex: "#00E5FF"))
                            .offset(y: bubbleAnimation ? -6 : 6)
                            .animation(
                                Animation.easeInOut(duration: 1.5 + Double.random(in: 0...0.8))
                                    .repeatForever(autoreverses: true),
                                value: bubbleAnimation
                            )
                    }
                }

                if aq.fish.count > 5 {
                    Text("+\(aq.fish.count - 5) balık daha")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.white.opacity(0.4))
                }

                if !aq.decorations.isEmpty {
                    HStack(spacing: 8) {
                        ForEach(aq.decorations) { deco in
                            Image(systemName: "leaf.fill")
                                .font(.system(size: 16))
                                .foregroundColor(.green)
                        }
                    }
                    .padding(.top, 8)
                }
            }
        }
        .frame(height: 200)
        .onAppear { bubbleAnimation = true }
    }

    // MARK: - Fish Row
    private func fishRow(_ fish: AquariumFish) -> some View {
        HStack(spacing: 12) {
            Image(systemName: "fish.fill")
                .font(.system(size: 20))
                .foregroundColor(Color(hex: "#00E5FF"))
            VStack(alignment: .leading, spacing: 2) {
                Text(fish.name)
                    .font(.system(size: 13, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                Text("\(fish.ageInDays) günlük")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.white.opacity(0.5))
            }
            Spacer()
            if fish.isSick {
                Image(systemName: "cross.case.fill")
                    .font(.system(size: 14))
                    .foregroundColor(.red)
            }
        }
        .padding(10)
        .background(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(Color.white.opacity(0.05))
        )
    }

    // MARK: - Shared Components
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
                    RoundedRectangle(cornerRadius: 6)
                        .fill(Color.white.opacity(0.08))
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

    private func actionButton(title: String, iconName: String, color: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 6) {
                Image(systemName: iconName)
                    .font(.system(size: 20))
                    .foregroundColor(Color(hex: color))
                Text(title)
                    .font(.system(size: 10, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
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

    private var closeButton: some View {
        Button(action: { dismiss() }) {
            Image(systemName: "xmark.circle.fill")
                .font(.system(size: 26))
                .foregroundColor(.white.opacity(0.5))
        }
    }

    // MARK: - Persistence
    private func loadAquarium() {
        if let data = UserDefaults(suiteName: "group.com.bipop.app")?.data(forKey: "aquarium_\(state.userProfile.id)"),
           let saved = try? JSONDecoder().decode(Aquarium.self, from: data) {
            var loaded = saved
            loaded.tick()
            self.aquarium = loaded
        }
    }

    private func saveAquarium() {
        guard let aq = aquarium else { return }
        if let data = try? JSONEncoder().encode(aq) {
            UserDefaults(suiteName: "group.com.bipop.app")?.set(data, forKey: "aquarium_\(state.userProfile.id)")
            SharedStorage.shared.reloadWidgets()
        }
    }

    private func createAquarium() {
        aquarium = Aquarium(ownerId: state.userProfile.id)
        saveAquarium()
    }
}

// MARK: - Add Fish Sheet
struct AddFishView: View {
    @Environment(\.dismiss) var dismiss
    @State private var selectedSpecies: FishSpecies = .goldfish
    @State private var fishName: String = ""
    var onAdd: (FishSpecies, String) -> Void

    var body: some View {
        ZStack {
            Color(hex: "#0A0A0E").ignoresSafeArea()

            VStack(spacing: 24) {
                Text("Balık Ekle")
                    .font(.system(size: 22, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .padding(.top, 20)

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 12) {
                        ForEach(FishSpecies.allCases) { species in
                            fishOption(species)
                        }
                    }
                    .padding(.horizontal, 16)
                }

                TextField("", text: $fishName, prompt: Text("Balığın adı...").foregroundColor(.white.opacity(0.3)))
                    .font(.system(size: 16, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .padding(14)
                    .background(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .fill(Color(hex: "#16161E"))
                    )
                    .padding(.horizontal, 16)

                Button(action: {
                    onAdd(selectedSpecies, fishName)
                    HapticManager.shared.playSuccess()
                    dismiss()
                }) {
                    Text("Ekle")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(
                            LinearGradient(
                                colors: [Color(hex: "#00B4DB"), Color(hex: "#0083B0")],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 30)
            }
        }
    }

    private func fishOption(_ species: FishSpecies) -> some View {
        let isSelected = selectedSpecies == species
        return Button(action: {
            selectedSpecies = species
            HapticManager.shared.playSelection()
        }) {
            HStack(spacing: 12) {
                Text(species.emoji)
                    .font(.system(size: 28))
                VStack(alignment: .leading, spacing: 2) {
                    Text(species.displayName)
                        .font(.system(size: 14, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text(species.subtitle)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.white.opacity(0.5))
                }
                Spacer()
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(Color(hex: "#00B4DB"))
                }
            }
            .padding(12)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(isSelected ? Color(hex: "#00B4DB").opacity(0.12) : Color(hex: "#16161E"))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(isSelected ? Color(hex: "#00B4DB") : Color.clear, lineWidth: 1.5)
                    )
            )
        }
    }
}
