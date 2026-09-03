import SwiftUI

public struct CatShopView: View {
    @Environment(\.dismiss) var dismiss
    @Binding var cat: PetCat
    @State private var selectedTab: CatShopItemType = .food
    @State private var feedbackText: String? = nil

    public init(cat: Binding<PetCat>) {
        self._cat = cat
    }

    public var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(hex: "#1F152B"), Color(hex: "#100B17")],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 16) {
                // Header
                HStack {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 26))
                            .foregroundColor(.white.opacity(0.7))
                    }
                    Spacer()
                    Text("Kedi Marketi")
                        .font(.system(size: 20, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                    Spacer()
                    // Coin Sayacı
                    HStack(spacing: 5) {
                        Image(systemName: "circle.circle.fill")
                            .foregroundColor(Color(hex: "#FFC107"))
                        Text("\(cat.coins)")
                            .font(.system(size: 16, weight: .black, design: .rounded))
                            .foregroundColor(Color(hex: "#FFC107"))
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.white.opacity(0.12))
                    .clipShape(Capsule())
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)

                // Ücretsiz Coin Kazanma Bannerı (Rewarded Video Ad)
                Button(action: watchAdForCoins) {
                    HStack(spacing: 12) {
                        Image(systemName: "play.rectangle.fill")
                            .font(.system(size: 24))
                            .foregroundColor(.white)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Ücretsiz 100 Altın Kazan")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(.white)
                            Text("Kısa bir sponsorlu video izle")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(.white.opacity(0.7))
                        }
                        Spacer()
                        Text("+100")
                            .font(.system(size: 14, weight: .black))
                            .foregroundColor(Color(hex: "#FFC107"))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(Color.black.opacity(0.3))
                            .clipShape(Capsule())
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(
                        LinearGradient(
                            colors: [Color(hex: "#FF6B9D"), Color(hex: "#7928CA")],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .shadow(color: Color(hex: "#FF6B9D").opacity(0.3), radius: 8, y: 4)
                }
                .padding(.horizontal, 16)

                // Kategori Sekmeleri
                HStack(spacing: 8) {
                    ForEach(CatShopItemType.allCases, id: \.self) { type in
                        Button(action: { selectedTab = type }) {
                            Text(tabTitle(for: type))
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(selectedTab == type ? .white : .white.opacity(0.6))
                                .padding(.vertical, 8)
                                .padding(.horizontal, 12)
                                .background(selectedTab == type ? Color(hex: "#FF6B9D") : Color.white.opacity(0.08))
                                .clipShape(Capsule())
                        }
                    }
                }
                .padding(.horizontal, 16)

                // Bildirim
                if let feedback = feedbackText {
                    Text(feedback)
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.green)
                        .transition(.opacity)
                }

                // Ürün Listesi
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 12) {
                        ForEach(CatEconomyManager.catalog.filter { $0.type == selectedTab }) { item in
                            shopItemRow(item)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 30)
                }
            }
        }
    }

    private func tabTitle(for type: CatShopItemType) -> String {
        switch type {
        case .food:      return "Mamalar"
        case .drink:     return "İçecekler"
        case .toy:       return "Oyuncaklar"
        case .accessory: return "Aksesuarlar"
        }
    }

    private func shopItemRow(_ item: CatShopItem) -> some View {
        HStack(spacing: 14) {
            Image(systemName: item.icon)
                .font(.system(size: 22))
                .foregroundColor(Color(hex: "#FF6B9D"))
                .frame(width: 50, height: 50)
                .background(Color.white.opacity(0.08))
                .clipShape(RoundedRectangle(cornerRadius: 12))

            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(item.name)
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(.white)
                    if item.isPremium {
                        Text("GURME")
                            .font(.system(size: 9, weight: .black))
                            .foregroundColor(.white)
                            .padding(.horizontal, 5)
                            .padding(.vertical, 2)
                            .background(Color(hex: "#FFC107"))
                            .clipShape(Capsule())
                    }
                }
                Text(item.description)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.white.opacity(0.6))
            }

            Spacer()

            Button(action: { buy(item) }) {
                HStack(spacing: 4) {
                    Text("\(item.price)")
                        .font(.system(size: 14, weight: .heavy, design: .rounded))
                    Image(systemName: "circle.circle.fill")
                        .font(.system(size: 11))
                }
                .foregroundColor(cat.coins >= item.price ? .black : .white.opacity(0.4))
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(cat.coins >= item.price ? Color(hex: "#FFC107") : Color.white.opacity(0.12))
                .clipShape(Capsule())
            }
            .disabled(cat.coins < item.price)
        }
        .padding(12)
        .background(Color.white.opacity(0.05))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private func buy(_ item: CatShopItem) {
        if CatEconomyManager.shared.buyItem(item, for: &cat) {
            feedbackText = "\(item.name) satın alındı ve afiyetle tüketildi."
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
                feedbackText = nil
            }
        }
    }

    private func watchAdForCoins() {
        AdMobManager.shared.showRewardedAd(rewardType: "coins") {
            cat.addCoins(100)
            feedbackText = "+100 Altın hesabına eklendi."
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
                feedbackText = nil
            }
        }
    }
}
