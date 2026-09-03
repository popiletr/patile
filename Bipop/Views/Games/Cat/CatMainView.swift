import SwiftUI

public struct CatMainView: View {
    @EnvironmentObject var state: AppState
    @Environment(\.dismiss) var dismiss
    @State private var cat: PetCat? = nil
    @State private var showAdoption: Bool = false
    @State private var currentAnimation: CatAnimation = .idle
    @State private var isFacingLeft: Bool = false
    @State private var catPositionX: CGFloat = 0 // -110 to +110 px oda içi gezinti
    @State private var petAnimation: Bool = false
    @State private var actionFeedbackText: String? = nil
    @State private var showFoodBowl: Bool = false
    @State private var showWaterBowl: Bool = false
    @State private var aiTimer: Timer? = nil

    public var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [Color(hex: "#1A1220"), Color(hex: "#0A0A0E")],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            if let cat = cat {
                catCareView(cat)
            } else {
                noCatView
            }
        }
        .onAppear {
            loadCat()
            startAutonomousAI()
        }
        .onDisappear {
            aiTimer?.invalidate()
            aiTimer = nil
        }
        .sheet(isPresented: $showAdoption) {
            CatAdoptionView { newCat in
                self.cat = newCat
                saveCat()
                updateBaseAnimation()
            }
            .environmentObject(state)
        }
    }

    // MARK: - No Cat Yet
    private var noCatView: some View {
        VStack(spacing: 24) {
            closeButton

            Spacer()

            ZStack {
                Circle()
                    .fill(Color(hex: "#FF6B9D").opacity(0.15))
                    .frame(width: 150, height: 150)

                CatSpriteAnimatedView(breed: .britishShorthair, animation: .idle, interval: 0.25)
                    .frame(width: 130, height: 130)
            }

            Text("Henüz Kedin Yok!")
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .foregroundColor(.white)

            Text("Bir kedi sahiplen ve odasında dolaşmasını izle")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.white.opacity(0.6))

            Button(action: { showAdoption = true }) {
                HStack(spacing: 8) {
                    Image(systemName: "plus.circle.fill")
                    Text("Kedi Sahiplen")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                }
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
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .shadow(color: Color(hex: "#FF6B9D").opacity(0.4), radius: 12, y: 6)
            }
            .padding(.horizontal, 40)

            Spacer()
        }
    }

    // MARK: - Cat Care View
    private func catCareView(_ cat: PetCat) -> some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 16) {
                // Top bar
                HStack {
                    closeButton
                    Spacer()

                    // Coin Bakiyesi & Market Butonu
                    Button(action: { showShop = true }) {
                        HStack(spacing: 5) {
                            Image(systemName: "circle.circle.fill")
                                .foregroundColor(Color(hex: "#FFC107"))
                            Text("\(cat.coins)")
                                .font(.system(size: 14, weight: .black, design: .rounded))
                                .foregroundColor(Color(hex: "#FFC107"))
                            Image(systemName: "plus.circle.fill")
                                .font(.system(size: 12))
                                .foregroundColor(Color(hex: "#FFC107"))
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(Color.white.opacity(0.12))
                        .clipShape(Capsule())
                    }

                    // Life stage badge
                    HStack(spacing: 4) {
                        Text(cat.lifeStage.displayName)
                            .font(.system(size: 11, weight: .bold))
                        Text("• Gün \(cat.ageInDays)")
                            .font(.system(size: 11, weight: .medium))
                    }
                    .foregroundColor(.white.opacity(0.7))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Color.white.opacity(0.1))
                    .clipShape(Capsule())
                }
                .padding(.horizontal, 16)
                .padding(.top, 12)

                // Living Room Environment Card (Canlı Dolaşma & Yaşam Alanı)
                livingRoomCard(cat)
                    .padding(.horizontal, 16)

                // Quick Activity Switcher (Etkinlik Butonları)
                activitySwitcher(cat)
                    .padding(.horizontal, 16)

                // Mini Oyunlar & Market Kartı
                miniGamesAndShopRow(cat)
                    .padding(.horizontal, 16)

                // Stat Bars
                statsSection(cat)
                    .padding(.horizontal, 16)

                // Action Buttons
                actionButtons(cat)
                    .padding(.horizontal, 16)

                // Health status message
                statusMessage(cat)
                    .padding(.horizontal, 16)

                Spacer(minLength: 40)
            }
        }
    }

    // MARK: - Mini Oyunlar & Market Satırı
    private func miniGamesAndShopRow(_ cat: PetCat) -> some View {
        HStack(spacing: 10) {
            Button(action: { showMouseGame = true }) {
                HStack(spacing: 6) {
                    Image(systemName: "target")
                        .font(.system(size: 16))
                        .foregroundColor(Color(hex: "#FF6B9D"))
                    VStack(alignment: .leading, spacing: 1) {
                        Text("Fare Avı")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.white)
                        Text("+Altın Kazan")
                            .font(.system(size: 9, weight: .semibold))
                            .foregroundColor(Color(hex: "#FF6B9D"))
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(Color.white.opacity(0.08))
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color(hex: "#FF6B9D").opacity(0.3), lineWidth: 1))
            }

            Button(action: { showFishGame = true }) {
                HStack(spacing: 6) {
                    Image(systemName: "fish.fill")
                        .font(.system(size: 16))
                        .foregroundColor(Color(hex: "#4ECCA3"))
                    VStack(alignment: .leading, spacing: 1) {
                        Text("Balık Tut")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.white)
                        Text("+Mama & Altın")
                            .font(.system(size: 9, weight: .semibold))
                            .foregroundColor(Color(hex: "#4ECCA3"))
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(Color.white.opacity(0.08))
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color(hex: "#4ECCA3").opacity(0.3), lineWidth: 1))
            }

            Button(action: { showShop = true }) {
                HStack(spacing: 6) {
                    Image(systemName: "bag.fill")
                        .font(.system(size: 16))
                        .foregroundColor(Color(hex: "#FFC107"))
                    VStack(alignment: .leading, spacing: 1) {
                        Text("Market")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.white)
                        Text("Gurme & Eşya")
                            .font(.system(size: 9, weight: .semibold))
                            .foregroundColor(Color(hex: "#FFC107"))
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(Color.white.opacity(0.08))
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color(hex: "#FFC107").opacity(0.3), lineWidth: 1))
            }
        }
    }

    // MARK: - Canlı Yaşam Alanı (Living Room Card)
    private func livingRoomCard(_ cat: PetCat) -> some View {
        ZStack {
            // Oda arka planı
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [Color(hex: "#241838"), Color(hex: "#140E20")],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                        .stroke(Color(hex: "#FF6B9D").opacity(0.25), lineWidth: 1)
                )

            VStack(spacing: 0) {
                // Üst Kısım: İsim ve durum
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: 6) {
                            Text(cat.name)
                                .font(.system(size: 20, weight: .black, design: .rounded))
                                .foregroundColor(.white)
                            Text(cat.gender.symbol)
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(cat.gender == .female ? Color(hex: "#FF6B9D") : Color(hex: "#4FC3F7"))
                        }
                        Text("\(cat.breed.displayName) • \(currentAnimation.title)")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(.white.opacity(0.5))
                    }
                    Spacer()

                    // Konuşma balonu / Durum bildirimi
                    if let feedback = actionFeedbackText {
                        Text(feedback)
                            .font(.system(size: 11, weight: .bold, design: .rounded))
                            .foregroundColor(Color(hex: "#FF6B9D"))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(Color.white.opacity(0.12))
                            .clipShape(Capsule())
                    } else if cat.healthStatus != .healthy {
                        HStack(spacing: 4) {
                            Image(systemName: cat.healthStatus.iconName)
                                .font(.system(size: 10))
                                .foregroundColor(.white)
                            Text(cat.healthStatus.message)
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(.white)
                        }
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.black.opacity(0.3))
                        .clipShape(Capsule())
                    }
                }
                .padding(.horizontal, 16)
                .padding(.top, 14)

                Spacer()

                // ODA ORTAMI (Zemin, Minder, Mama Kabı ve Dolaşan Kedi)
                ZStack(alignment: .bottom) {
                    // Zemin / Halı
                    RoundedRectangle(cornerRadius: 16)
                        .fill(
                            LinearGradient(
                                colors: [Color.white.opacity(0.04), Color.white.opacity(0.08)],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .frame(height: 50)
                        .padding(.horizontal, 10)

                    // Sol Köşe: Kedi Yatağı / Minderi
                    HStack {
                        ZStack {
                            Ellipse()
                                .fill(Color(hex: "#7928CA").opacity(0.4))
                                .frame(width: 80, height: 26)
                            Image(systemName: "bed.double.fill")
                                .font(.system(size: 16))
                                .foregroundColor(.white.opacity(0.8))
                                .offset(y: -4)
                        }
                        .padding(.leading, 18)
                        Spacer()
                    }

                    // Sağ Köşe: Mama & Su Kabı
                    HStack {
                        Spacer()
                        HStack(spacing: 8) {
                            // Mama kabı
                            VStack(spacing: 2) {
                                if showFoodBowl {
                                    Image(systemName: "sparkles")
                                        .font(.system(size: 10))
                                        .foregroundColor(.yellow)
                                }
                                Image(systemName: "fork.knife.circle.fill")
                                    .font(.system(size: 18))
                                    .foregroundColor(.orange)
                            }

                            // Su kabı
                            Image(systemName: "drop.circle.fill")
                                .font(.system(size: 18))
                                .foregroundColor(.blue)
                        }
                        .padding(.trailing, 20)
                    }

                    // DOLAŞAN KEDİ (Animasyonlu Sprite)
                    ZStack {
                        // Kedi arkasındaki yumuşak ışık
                        Circle()
                            .fill(glowColor(for: currentAnimation).opacity(0.25))
                            .frame(width: 100, height: 100)
                            .blur(radius: 16)

                        CatSpriteAnimatedView(
                            breed: cat.breed,
                            animation: currentAnimation,
                            interval: currentAnimation == .walk ? 0.18 : 0.25
                        )
                        .frame(width: 130, height: 130)
                        .scaleEffect(x: isFacingLeft ? -1.0 : 1.0, y: 1.0)
                        .scaleEffect(petAnimation ? 1.12 : 1.0)
                        .offset(x: catPositionX, y: -4)
                        .animation(.easeInOut(duration: currentAnimation == .walk ? 1.4 : 0.3), value: catPositionX)
                        .onTapGesture {
                            triggerPetAction()
                        }

                        // Uyku "Zzz" efekti
                        if currentAnimation == .sleep {
                            VStack(spacing: 2) {
                                Text("z").font(.system(size: 12, weight: .bold)).offset(x: 10, y: -10)
                                Text("Z").font(.system(size: 16, weight: .bold)).offset(x: 18, y: -18)
                                Text("Z").font(.system(size: 20, weight: .bold)).offset(x: 26, y: -26)
                            }
                            .foregroundColor(Color(hex: "#7928CA"))
                            .offset(x: catPositionX, y: -20)
                        }

                        // Mutluluk efekti
                        if currentAnimation == .happy {
                            HStack(spacing: 16) {
                                Image(systemName: "heart.fill").font(.system(size: 14)).foregroundColor(Color(hex: "#FF6B9D")).offset(y: -40)
                                Image(systemName: "sparkles").font(.system(size: 18)).foregroundColor(Color(hex: "#FFC107")).offset(y: -55)
                                Image(systemName: "heart.fill").font(.system(size: 14)).foregroundColor(Color(hex: "#FF6B9D")).offset(y: -45)
                            }
                            .offset(x: catPositionX)
                            .transition(.opacity.combined(with: .scale))
                        }
                    }
                }
                .frame(height: 170)
                .contentShape(Rectangle())
                .onTapGesture { location in
                    let screenWidth = UIScreen.main.bounds.width - 32
                    let targetX = location.x - (screenWidth / 2)
                    walkTo(targetX: max(-90, min(90, targetX)))
                }

                Text("Odaya dokunarak kedini gezdirebilir, üstüne basarak sevebilirsin")
                    .font(.system(size: 9, weight: .medium))
                    .foregroundColor(.white.opacity(0.35))
                    .padding(.bottom, 10)
            }
        }
        .frame(height: 270)
    }

    // MARK: - Activity Switcher (Dolaş, Uyu, Otur, Mutlu)
    private func activitySwitcher(_ cat: PetCat) -> some View {
        HStack(spacing: 8) {
            activityButton(title: "Dolaş", iconName: "pawprint.fill", animation: .walk) {
                let targetX = (catPositionX > 0) ? CGFloat(-80) : CGFloat(80)
                walkTo(targetX: targetX)
            }

            activityButton(title: "Uyu", iconName: "moon.fill", animation: .sleep) {
                walkTo(targetX: -80) {
                    currentAnimation = .sleep
                    showFeedback("Mışıl mışıl uyuyor")
                }
            }

            activityButton(title: "Otur", iconName: "circle.fill", animation: .idle) {
                currentAnimation = .idle
                showFeedback("Etrafı izliyor")
            }

            activityButton(title: "Oyna", iconName: "sparkles", animation: .happy) {
                triggerPetAction()
            }
        }
    }

    private func activityButton(title: String, iconName: String, animation: CatAnimation, action: @escaping () -> Void) -> some View {
        let isActive = currentAnimation == animation
        return Button(action: {
            HapticManager.shared.playSelection()
            action()
        }) {
            HStack(spacing: 4) {
                Image(systemName: iconName)
                    .font(.system(size: 11))
                Text(title)
                    .font(.system(size: 11, weight: .bold, design: .rounded))
            }
            .foregroundColor(isActive ? .white : .white.opacity(0.6))
            .padding(.horizontal, 10)
            .padding(.vertical, 8)
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(isActive ? Color(hex: "#7928CA").opacity(0.3) : Color.white.opacity(0.05))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .stroke(isActive ? Color(hex: "#7928CA") : Color.white.opacity(0.08), lineWidth: 1)
                    )
            )
        }
    }

    // MARK: - Autonomous AI Wandering Logic
    private func startAutonomousAI() {
        aiTimer?.invalidate()
        aiTimer = Timer.scheduledTimer(withTimeInterval: 9.0, repeats: true) { _ in
            guard cat != nil, actionFeedbackText == nil else { return }

            let randomChoice = Int.random(in: 0...10)
            if randomChoice < 4 {
                let randomTarget = CGFloat.random(in: -80...80)
                walkTo(targetX: randomTarget)
            } else if randomChoice < 7 {
                currentAnimation = .idle
            } else if randomChoice == 7 {
                walkTo(targetX: -80) {
                    currentAnimation = .sleep
                }
            } else {
                currentAnimation = .happy
                DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
                    updateBaseAnimation()
                }
            }
        }
    }

    private func walkTo(targetX: CGFloat, completion: (() -> Void)? = nil) {
        let diff = targetX - catPositionX
        if abs(diff) < 5 {
            completion?()
            return
        }

        isFacingLeft = diff < 0
        currentAnimation = .walk

        withAnimation(.easeInOut(duration: 1.5)) {
            catPositionX = targetX
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 1.55) {
            if let completion = completion {
                completion()
            } else {
                currentAnimation = .idle
            }
        }
    }

    private func glowColor(for animation: CatAnimation) -> Color {
        switch animation {
        case .happy: return Color(hex: "#FF6B9D")
        case .eat:   return Color(hex: "#FF9800")
        case .cry:   return Color(hex: "#FF5252")
        case .sleep: return Color(hex: "#7928CA")
        case .walk:  return Color(hex: "#4CAF50")
        case .idle:  return Color(hex: "#2196F3")
        }
    }

    // MARK: - Stats Section
    private func statsSection(_ cat: PetCat) -> some View {
        VStack(spacing: 8) {
            statBar(label: "Açlık", value: cat.hunger, color: "#FF9800", iconName: "fork.knife")
            statBar(label: "Su", value: cat.thirst, color: "#2196F3", iconName: "drop.fill")
            statBar(label: "Sevgi", value: cat.happiness, color: "#E91E63", iconName: "heart.fill")
            statBar(label: "Sağlık", value: cat.health, color: "#4CAF50", iconName: "cross.case.fill")
        }
    }

    private func statBar(label: String, value: Double, color: String, iconName: String) -> some View {
        HStack(spacing: 10) {
            Image(systemName: iconName)
                .font(.system(size: 13))
                .foregroundColor(Color(hex: color))
                .frame(width: 22)

            Text(label)
                .font(.system(size: 12, weight: .bold, design: .rounded))
                .foregroundColor(.white.opacity(0.7))
                .frame(width: 58, alignment: .leading)

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 6)
                        .fill(Color.white.opacity(0.08))

                    RoundedRectangle(cornerRadius: 6)
                        .fill(
                            LinearGradient(
                                colors: [Color(hex: color), Color(hex: color).opacity(0.6)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: geo.size.width * CGFloat(value / 100))
                }
            }
            .frame(height: 8)

            Text("\(Int(value))%")
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .foregroundColor(Color(hex: color))
                .frame(width: 36)
        }
    }

    // MARK: - Action Buttons (Mama, Su, Sev, İlaç)
    private func actionButtons(_ cat: PetCat) -> some View {
        HStack(spacing: 10) {
            actionButton(
                title: "Mama",
                iconName: "fork.knife",
                color: "#FF9800",
                disabled: cat.hunger > 90
            ) {
                triggerFeedAction()
            }

            actionButton(
                title: "Su",
                iconName: "drop.fill",
                color: "#2196F3",
                disabled: cat.thirst > 90
            ) {
                triggerWaterAction()
            }

            actionButton(
                title: "Sev",
                iconName: "hand.tap.fill",
                color: "#E91E63",
                disabled: cat.happiness > 95
            ) {
                triggerPetAction()
            }

            if cat.isSick {
                actionButton(
                    title: "İlaç",
                    iconName: "pills.fill",
                    color: "#4CAF50",
                    disabled: cat.lastMedicineAt != nil
                ) {
                    triggerMedicineAction()
                }
            }
        }
    }

    private func actionButton(title: String, iconName: String, color: String, disabled: Bool, action: @escaping () -> Void) -> some View {
        Button(action: {
            action()
            HapticManager.shared.playSelection()
        }) {
            VStack(spacing: 4) {
                Image(systemName: iconName)
                    .font(.system(size: 18))
                    .foregroundColor(disabled ? .white.opacity(0.3) : Color(hex: color))
                Text(title)
                    .font(.system(size: 10, weight: .bold, design: .rounded))
                    .foregroundColor(disabled ? .white.opacity(0.3) : .white)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(disabled ? Color.white.opacity(0.05) : Color(hex: color).opacity(0.2))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(Color(hex: color).opacity(disabled ? 0.1 : 0.4), lineWidth: 1)
                    )
            )
        }
        .disabled(disabled)
    }

    // MARK: - Action Triggers
    private func triggerFeedAction() {
        self.cat?.feed()
        saveCat()
        showFoodBowl = true
        showFeedback("Mama kabına koşuyor")

        // Mama kabının olduğu sağ köşeye koş
        walkTo(targetX: 65) {
            currentAnimation = .eat
            DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
                showFoodBowl = false
                showFeedback("Karnım doydu")
                updateBaseAnimation()
            }
        }
    }

    private func triggerWaterAction() {
        self.cat?.giveWater()
        saveCat()
        showWaterBowl = true
        showFeedback("Su kabına koşuyor")

        walkTo(targetX: 75) {
            currentAnimation = .eat
            DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
                showWaterBowl = false
                showFeedback("Çok lezzetli ve ferah")
                updateBaseAnimation()
            }
        }
    }

    private func triggerPetAction() {
        self.cat?.pet()
        saveCat()
        petAnimation = true
        currentAnimation = .happy
        showFeedback("Mırıltı... Çok mutluyum")
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
            petAnimation = false
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.5) {
            updateBaseAnimation()
        }
    }

    private func triggerMedicineAction() {
        self.cat?.giveMedicine()
        saveCat()
        showFeedback("İlaç içti, yatağına gidiyor")

        walkTo(targetX: -80) {
            currentAnimation = .sleep
            DispatchQueue.main.asyncAfter(deadline: .now() + 4.0) {
                updateBaseAnimation()
            }
        }
    }

    private func showFeedback(_ text: String) {
        withAnimation(.spring(response: 0.3)) {
            actionFeedbackText = text
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
            withAnimation(.easeOut) {
                if actionFeedbackText == text {
                    actionFeedbackText = nil
                }
            }
        }
    }

    private func updateBaseAnimation() {
        guard let cat = cat else {
            currentAnimation = .idle
            return
        }

        if cat.isSick {
            currentAnimation = .cry
        } else if cat.hunger < 25 || cat.thirst < 25 {
            currentAnimation = .cry
        } else if cat.happiness < 25 {
            currentAnimation = .cry
        } else {
            currentAnimation = .idle
        }
    }

    // MARK: - Status Message
    private func statusMessage(_ cat: PetCat) -> some View {
        HStack(spacing: 8) {
            Text(cat.healthStatus.emoji)
                .font(.system(size: 16))
            Text(cat.healthStatus.message)
                .font(.system(size: 12, weight: .medium, design: .rounded))
                .foregroundColor(.white.opacity(0.8))
            Spacer()
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Color.white.opacity(0.05))
        )
    }

    // MARK: - Close Button
    private var closeButton: some View {
        Button(action: { dismiss() }) {
            Image(systemName: "xmark.circle.fill")
                .font(.system(size: 26))
                .foregroundColor(.white.opacity(0.5))
        }
    }

    // MARK: - Persistence
    private func loadCat() {
        if let data = UserDefaults(suiteName: "group.com.bipop.app")?.data(forKey: "pet_cat_\(state.userProfile.id)"),
           let saved = try? JSONDecoder().decode(PetCat.self, from: data) {
            var loaded = saved
            loaded.applyOfflineProgress() // Gerçek zamanlı çevrimdışı metabolizma
            self.cat = loaded
            saveCat()
            updateBaseAnimation()
        }
    }

    private func saveCat() {
        guard var cat = cat else { return }
        cat.lastSavedTimestamp = Date()
        if let data = try? JSONEncoder().encode(cat) {
            UserDefaults(suiteName: "group.com.bipop.app")?.set(data, forKey: "pet_cat_\(state.userProfile.id)")
            SharedStorage.shared.reloadWidgets()
        }
    }
}
