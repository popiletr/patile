import SwiftUI
import WidgetKit

// MARK: - Pet Widget Small View (Kedi Yaşam Alanı - SMALL)
public struct PetWidgetSmallView: View {
    let entry: PetWidgetEntry

    public var body: some View {
        if let cat = entry.pet {
            catLivingRoomWidget(cat)
        } else {
            emptyPetWidget
        }
    }

    // MARK: - Kedi Canlı Ortam Widget (SMALL)
    private func catLivingRoomWidget(_ cat: PetCat) -> some View {
        ZStack {
            // Arka plan — duruma göre dinamik renk
            LinearGradient(
                colors: backgroundColors(for: cat),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(spacing: 0) {
                // Üst Bar: Kedi Adı & Durum Bildirimi
                HStack {
                    HStack(spacing: 3) {
                        Text(cat.name)
                            .font(.system(size: 11, weight: .black, design: .rounded))
                            .foregroundColor(.white)
                        Image(systemName: cat.gender == .female ? "heart.fill" : "star.fill")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(cat.gender == .female ? Color(hex: "#FF6B9D") : Color(hex: "#4FC3F7"))
                    }

                    Spacer()

                    // Durum / Eylem Etiketi
                    Text(poseStatusText(for: entry.pose, cat: cat))
                        .font(.system(size: 8, weight: .bold, design: .rounded))
                        .foregroundColor(poseStatusColor(for: entry.pose, cat: cat))
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.black.opacity(0.4))
                        .clipShape(Capsule())
                }
                .padding(.horizontal, 10)
                .padding(.top, 8)

                Spacer(minLength: 0)

                // CANLI ODA SAHNESİ (Minder, Mama Kabı ve Hareket Eden Kedi)
                ZStack(alignment: .bottom) {
                    // Halı / Zemin Çizgisi
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.white.opacity(0.06))
                        .frame(height: 18)
                        .padding(.horizontal, 6)

                    // Sol Köşe Yatak / Sağ Köşe Mama Kabı
                    HStack {
                        if entry.pose == .sleeping {
                            Image(systemName: "bed.double.fill")
                                .font(.system(size: 12))
                                .foregroundColor(.white.opacity(0.7))
                        }
                        Spacer()
                        if entry.pose == .eating {
                            Image(systemName: "fork.knife.circle.fill")
                                .font(.system(size: 12))
                                .foregroundColor(.orange)
                        }
                    }
                    .padding(.horizontal, 10)
                    .offset(y: -2)

                    // Kedi Sprite'ı (Konuma ve poza göre)
                    ZStack {
                        CatSpriteImageView(
                            breed: cat.breed,
                            animation: entry.pose.animation,
                            frameIndex: entry.frameIndex
                        )
                        .frame(width: 68, height: 68)
                        .scaleEffect(x: isFacingLeft(for: entry.pose) ? -1.0 : 1.0, y: 1.0)
                        .offset(x: catPositionX(for: entry.pose), y: -2)

                        // Uyku "Zzz" efekti
                        if entry.pose == .sleeping {
                            Text("z")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(Color(hex: "#B388FF"))
                                .offset(x: catPositionX(for: entry.pose) + 16, y: -22)
                        }

                        // Mutlu efekti
                        if entry.pose == .happy {
                            Image(systemName: "heart.fill")
                                .font(.system(size: 10))
                                .foregroundColor(Color(hex: "#FF6B9D"))
                                .offset(x: catPositionX(for: entry.pose) + 16, y: -24)
                        }

                        // Ağlama Gözyaşı
                        if entry.pose == .crying || entry.pose == .sick {
                            Image(systemName: "drop.fill")
                                .font(.system(size: 10))
                                .foregroundColor(Color(hex: "#2196F3"))
                                .offset(x: catPositionX(for: entry.pose) + 16, y: -20)
                        }
                    }
                }
                .frame(height: 72)

                Spacer(minLength: 0)

                // Alt Kısım: Mini Stat Barları
                HStack(spacing: 5) {
                    miniStat(value: cat.hunger, iconName: "fork.knife", color: "#FF9800")
                    miniStat(value: cat.thirst, iconName: "drop.fill", color: "#2196F3")
                    miniStat(value: cat.happiness, iconName: "heart.fill", color: "#E91E63")
                    miniStat(value: cat.health, iconName: "cross.case.fill", color: "#4CAF50")
                }
                .padding(.horizontal, 10)
                .padding(.bottom, 7)
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
    }

    // MARK: - Boş Durum Widget
    private var emptyPetWidget: some View {
        ZStack {
            Color(hex: "#16101F")
            VStack(spacing: 6) {
                Image(systemName: "pawprint.fill")
                    .font(.system(size: 28))
                    .foregroundColor(Color(hex: "#FF6B9D"))
                Text("Kedin Seni Bekliyor")
                    .font(.system(size: 11, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                Text("Uygulamadan sahiplen")
                    .font(.system(size: 9, weight: .medium))
                    .foregroundColor(.white.opacity(0.5))
            }
            .padding()
        }
    }

    // MARK: - Mini Stat Bar (Dikey ince bar)
    private func miniStat(value: Double, iconName: String, color: String) -> some View {
        VStack(spacing: 2) {
            Image(systemName: iconName)
                .font(.system(size: 6))
                .foregroundColor(statColor(value: value, baseColor: color))

            GeometryReader { geo in
                ZStack(alignment: .bottom) {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color.white.opacity(0.15))

                    RoundedRectangle(cornerRadius: 2)
                        .fill(statColor(value: value, baseColor: color))
                        .frame(height: geo.size.height * CGFloat(value / 100))
                }
            }
            .frame(width: 10, height: 16)
        }
    }

    // MARK: - Position & Facing Helpers
    private func catPositionX(for pose: CatPose) -> CGFloat {
        switch pose {
        case .walking:  return 14  // Yürürken sağa doğru adım
        case .sleeping: return -22 // Yatağında solda
        case .eating:   return 24  // Mama kabında sağda
        case .crying:   return -4  // Ortada üzgün
        case .happy:    return 0   // Ortada sevinçli
        case .sick:     return -16 // Dinlenme alanında
        case .idle:     return 0   // Ortada
        }
    }

    private func isFacingLeft(for pose: CatPose) -> Bool {
        switch pose {
        case .sleeping, .sick: return true
        default: return false
        }
    }

    private func poseStatusText(for pose: CatPose, cat: PetCat) -> String {
        if cat.isSick { return "Hasta" }
        if cat.hunger < 25 { return "Acıktı" }
        if cat.thirst < 25 { return "Susadı" }
        switch pose {
        case .sleeping: return "Uyuyor"
        case .walking:  return "Dolaşıyor"
        case .eating:   return "Yemekte"
        case .happy:    return "Mutlu"
        case .crying:   return "Üzgün"
        case .sick:     return "Hasta"
        case .idle:     return "Oturuyor"
        }
    }

    private func poseStatusColor(for pose: CatPose, cat: PetCat) -> Color {
        if cat.isSick || cat.hunger < 25 || cat.thirst < 25 { return Color(hex: "#FF5252") }
        switch pose {
        case .sleeping: return Color(hex: "#B388FF")
        case .happy:    return Color(hex: "#FF6B9D")
        case .walking:  return Color(hex: "#00E676")
        default:        return Color.white.opacity(0.8)
        }
    }

    private func backgroundColors(for cat: PetCat) -> [Color] {
        if cat.isSick {
            return [Color(hex: "#2D1B4E"), Color(hex: "#1A0E2E")]
        }
        if cat.hunger < 20 || cat.thirst < 20 {
            return [Color(hex: "#4A1A1A"), Color(hex: "#2D0A0A")]
        }
        if cat.happiness < 25 {
            return [Color(hex: "#1A2A4A"), Color(hex: "#0A1A2D")]
        }
        return [Color(hex: "#241838"), Color(hex: "#120B1C")]
    }

    private func statColor(value: Double, baseColor: String) -> Color {
        if value < 20 { return Color(hex: "#FF5252") }
        if value < 50 { return Color(hex: "#FFC107") }
        return Color(hex: baseColor)
    }
}

// MARK: - Pet Widget Medium View (Kedi + Akvaryum + Ağaç birlikte)
public struct PetWidgetMediumView: View {
    let entry: PetWidgetEntry

    public var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(hex: "#14101F"), Color(hex: "#0A0A0E")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            HStack(spacing: 0) {
                // Sol: Kedi
                if let cat = entry.pet {
                    catPanel(cat)
                        .frame(maxWidth: .infinity)
                } else {
                    emptyPanel(iconName: "pawprint.fill", text: "Kedi Yok")
                        .frame(maxWidth: .infinity)
                }

                // Ayırıcı
                Rectangle()
                    .fill(Color.white.opacity(0.08))
                    .frame(width: 1)

                // Orta: Akvaryum
                if let aquarium = entry.aquarium {
                    aquariumPanel(aquarium)
                        .frame(maxWidth: .infinity)
                } else {
                    emptyPanel(iconName: "drop.fill", text: "Akvaryum Yok")
                        .frame(maxWidth: .infinity)
                }

                // Ayırıcı
                Rectangle()
                    .fill(Color.white.opacity(0.08))
                    .frame(width: 1)

                // Sağ: Ağaç
                if let tree = entry.tree {
                    treePanel(tree)
                        .frame(maxWidth: .infinity)
                } else {
                    emptyPanel(iconName: "leaf.fill", text: "Ağaç Yok")
                        .frame(maxWidth: .infinity)
                }
            }
            .padding(.horizontal, 4)
            .padding(.vertical, 8)
        }
        .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
    }

    // MARK: - Kedi Paneli
    private func catPanel(_ cat: PetCat) -> some View {
        VStack(spacing: 3) {
            Text(cat.name)
                .font(.system(size: 10, weight: .bold, design: .rounded))
                .foregroundColor(.white)
                .lineLimit(1)

            CatSpriteImageView(
                breed: cat.breed,
                animation: entry.pose.animation,
                frameIndex: entry.frameIndex
            )
            .frame(width: 44, height: 44)

            Text(shortMessage(for: entry.pose, cat: cat))
                .font(.system(size: 8, weight: .medium, design: .rounded))
                .foregroundColor(.white.opacity(0.7))
                .lineLimit(1)

            HStack(spacing: 2) {
                verticalStat(value: cat.hunger, color: "#FF9800")
                verticalStat(value: cat.thirst, color: "#2196F3")
                verticalStat(value: cat.happiness, color: "#E91E63")
            }
        }
    }

    // MARK: - Akvaryum Paneli
    private func aquariumPanel(_ aquarium: Aquarium) -> some View {
        VStack(spacing: 3) {
            Text(aquarium.name)
                .font(.system(size: 10, weight: .bold, design: .rounded))
                .foregroundColor(.white)
                .lineLimit(1)

            Image(systemName: "fish.fill")
                .font(.system(size: 26))
                .foregroundColor(Color(hex: "#00E5FF"))
                .frame(width: 44, height: 44)

            Text(aquarium.isClean ? "Temiz" : "Kirli")
                .font(.system(size: 8, weight: .medium, design: .rounded))
                .foregroundColor(aquarium.isClean ? Color(hex: "#00E5FF") : Color(hex: "#FF5252"))
                .lineLimit(1)

            HStack(spacing: 2) {
                verticalStat(value: aquarium.waterCleanliness, color: "#00E5FF")
                verticalStat(value: aquarium.fishFoodLevel, color: "#FF9800")
            }
        }
    }

    // MARK: - Ağaç Paneli
    private func treePanel(_ tree: AppleTree) -> some View {
        VStack(spacing: 3) {
            Text(tree.name)
                .font(.system(size: 10, weight: .bold, design: .rounded))
                .foregroundColor(.white)
                .lineLimit(1)

            Image(systemName: "leaf.fill")
                .font(.system(size: 26))
                .foregroundColor(Color(hex: "#00E676"))
                .frame(width: 44, height: 44)

            Text("\(tree.applesReady) Elma")
                .font(.system(size: 8, weight: .medium, design: .rounded))
                .foregroundColor(Color(hex: "#FF5252"))
                .lineLimit(1)

            HStack(spacing: 2) {
                verticalStat(value: tree.waterLevel, color: "#2196F3")
                verticalStat(value: tree.growthPercent, color: "#00E676")
            }
        }
    }

    // MARK: - Boş Panel
    private func emptyPanel(iconName: String, text: String) -> some View {
        VStack(spacing: 4) {
            Image(systemName: iconName)
                .font(.system(size: 18))
                .foregroundColor(.white.opacity(0.3))
            Text(text)
                .font(.system(size: 9, weight: .medium))
                .foregroundColor(.white.opacity(0.3))
        }
    }

    // MARK: - Shared
    private func verticalStat(value: Double, color: String) -> some View {
        GeometryReader { geo in
            ZStack(alignment: .bottom) {
                RoundedRectangle(cornerRadius: 2)
                    .fill(Color.white.opacity(0.1))
                RoundedRectangle(cornerRadius: 2)
                    .fill(value < 20 ? Color(hex: "#FF5252") : Color(hex: color))
                    .frame(height: geo.size.height * CGFloat(value / 100))
            }
        }
        .frame(width: 6, height: 18)
    }

    private func shortMessage(for pose: CatPose, cat: PetCat) -> String {
        if cat.isSick { return "Hasta" }
        if cat.hunger < 25 { return "Acıktı" }
        if cat.thirst < 25 { return "Susadı" }
        switch pose {
        case .sleeping: return "Uyuyor"
        case .walking:  return "Dolaşıyor"
        case .eating:   return "Yiyor"
        case .happy:    return "Mutlu"
        default:        return "Keyifli"
        }
    }
}

// MARK: - iOS 17+ İnteraktif Kedi Widget Görünümü
#if canImport(AppIntents)
import AppIntents

@available(iOS 17.0, *)
public struct PetInteractiveCatWidgetMediumView: View {
    let entry: PetWidgetEntry

    public var body: some View {
        if let cat = entry.pet {
            HStack(spacing: 12) {
                // Sol: Kedi ve Pozu
                VStack(spacing: 4) {
                    CatSpriteImageView(breed: cat.breed, animation: entry.pose.animation, frameIndex: entry.frameIndex)
                        .frame(width: 60, height: 60)
                    Text(cat.name)
                        .font(.system(size: 11, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                    Text(cat.healthStatus.message)
                        .font(.system(size: 8, weight: .bold))
                        .foregroundColor(cat.isSick ? .red : .white.opacity(0.7))
                        .lineLimit(1)
                }
                .frame(width: 80)

                // Orta: Stat Barları
                VStack(alignment: .leading, spacing: 5) {
                    statBarRow(iconName: "fork.knife", label: "Açlık", value: cat.hunger, color: "#FF9800")
                    statBarRow(iconName: "drop.fill", label: "Su", value: cat.thirst, color: "#2196F3")
                    statBarRow(iconName: "heart.fill", label: "Sevgi", value: cat.happiness, color: "#E91E63")
                    statBarRow(iconName: "bolt.fill", label: "Enerji", value: cat.energy, color: "#4CAF50")
                }

                // Sağ: İnteraktif Widget Butonları
                VStack(spacing: 5) {
                    Button(intent: FeedPetAppIntent()) {
                        HStack(spacing: 3) {
                            Image(systemName: "fork.knife")
                                .font(.system(size: 8))
                            Text("Besle")
                                .font(.system(size: 8, weight: .bold))
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 5)
                        .background(Color(hex: "#FF9800"))
                        .clipShape(Capsule())
                    }

                    Button(intent: WaterPetAppIntent()) {
                        HStack(spacing: 3) {
                            Image(systemName: "drop.fill")
                                .font(.system(size: 8))
                            Text("Su")
                                .font(.system(size: 8, weight: .bold))
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 5)
                        .background(Color(hex: "#2196F3"))
                        .clipShape(Capsule())
                    }

                    Button(intent: PetCatAppIntent()) {
                        HStack(spacing: 3) {
                            Image(systemName: "heart.fill")
                                .font(.system(size: 8))
                            Text("Sev")
                                .font(.system(size: 8, weight: .bold))
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 5)
                        .background(Color(hex: "#E91E63"))
                        .clipShape(Capsule())
                    }
                }
                .frame(width: 62)
            }
            .padding(10)
            .background(
                LinearGradient(
                    colors: [Color(hex: "#1F152B"), Color(hex: "#100B17")],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
        } else {
            Text("Henüz kedi yok")
                .foregroundColor(.white.opacity(0.6))
        }
    }

    private func statBarRow(iconName: String, label: String, value: Double, color: String) -> some View {
        HStack(spacing: 4) {
            Image(systemName: iconName)
                .font(.system(size: 8))
                .foregroundColor(Color(hex: color))
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 3).fill(Color.white.opacity(0.12))
                    RoundedRectangle(cornerRadius: 3).fill(Color(hex: color)).frame(width: geo.size.width * CGFloat(value / 100))
                }
            }
            .frame(height: 5)
            Text("\(Int(value))%").font(.system(size: 8, weight: .bold, design: .monospaced)).foregroundColor(Color(hex: color))
        }
    }
}
#endif

// MARK: - Pet Widget Entry View
public struct PetWidgetEntryView: View {
    var entry: PetTimelineProvider.Entry
    @Environment(\.widgetFamily) var family

    public var body: some View {
        Group {
            switch family {
            case .systemSmall:
                PetWidgetSmallView(entry: entry)
            case .systemMedium:
                if #available(iOS 17.0, *) {
                    PetInteractiveCatWidgetMediumView(entry: entry)
                } else {
                    PetWidgetMediumView(entry: entry)
                }
            default:
                PetWidgetSmallView(entry: entry)
            }
        }
        .widgetURL(URL(string: "bipop://games"))
        .widgetBackgroundCompat {
            Color.black
        }
    }
}

// MARK: - Pet Widget Definition
public struct PetWidget: Widget {
    public let kind: String = "PetWidget"

    public init() {}

    public var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PetTimelineProvider()) { entry in
            PetWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("B!Pop Evcil Hayvan")
        .description("Kedini ana ekranından canlı takip et ve tek dokunuşla besle!")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}
