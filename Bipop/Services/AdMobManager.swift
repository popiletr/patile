import Foundation
import SwiftUI

// MARK: - AdMob & Monetization Manager
public final class AdMobManager: ObservableObject {
    public static let shared = AdMobManager()

    @Published public var isAdReady: Bool = true
    @Published public var isShowingRewardedAd: Bool = false
    @Published public var isPremiumUser: Bool = false // Reklamsız versiyon satın alındı mı?

    private init() {}

    /// Ödüllü Reklam Göster (Rewarded Video Ad)
    /// - Parameters:
    ///   - rewardType: "coins" veya "full_energy" veya "gourmet_food"
    ///   - onReward: Reklam başarıyla izlendiğinde çalışacak callback
    public func showRewardedAd(rewardType: String, onReward: @escaping () -> Void) {
        // Not: Gerçek cihazda Google Mobile Ads SDK (GADRewardedAd) tetiklenir.
        isShowingRewardedAd = true

        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) { [weak self] in
            self?.isShowingRewardedAd = false
            onReward()
        }
    }

    /// Geçiş Reklamı Göster (Mini oyun bitişinde)
    public func showInterstitialAd(completion: (() -> Void)? = nil) {
        guard !isPremiumUser else {
            completion?()
            return
        }

        // Mini oyun sonrası 1.5 saniye ara reklam simülasyonu / SDK çağrısı
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            completion?()
        }
    }

    /// Reklamları Kaldır Satın Alımı (IAP)
    public func purchaseRemoveAds(completion: @escaping (Bool) -> Void) {
        // StoreKit / IAP simülasyonu
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { [weak self] in
            self?.isPremiumUser = true
            UserDefaults.standard.set(true, forKey: "is_premium_no_ads")
            completion(true)
        }
    }
}
