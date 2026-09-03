import Foundation
import UIKit
import SwiftUI

// MARK: - Kedi Animasyon Durumları (6 Satır)
public enum CatAnimation: String, CaseIterable, Codable {
    case idle = "idle"       // Satır 0: Oturuyor / Bekliyor (6 frame)
    case walk = "walk"       // Satır 1: Yürüyor (6 frame)
    case sleep = "sleep"     // Satır 2: Uyuyor (6 frame)
    case eat = "eat"         // Satır 3: Yemek yiyor / Su içiyor (6 frame)
    case cry = "cry"         // Satır 4: Acıkmış / Susamış / Hasta / Ağlıyor (6 frame)
    case happy = "happy"     // Satır 5: Mutlu / Sevilmiş / Kalpler (6 frame)

    public var row: Int {
        switch self {
        case .idle:  return 0
        case .walk:  return 1
        case .sleep: return 2
        case .eat:   return 3
        case .cry:   return 4
        case .happy: return 5
        }
    }

    public var frameCount: Int { 6 }

    public var title: String {
        switch self {
        case .idle:  return "Oturuyor"
        case .walk:  return "Yürüyor"
        case .sleep: return "Uyuyor"
        case .eat:   return "Yiyor"
        case .cry:   return "Üzgün / Acıkmış"
        case .happy: return "Mutlu"
        }
    }

    public var iconName: String {
        switch self {
        case .idle:  return "pawprint.fill"
        case .walk:  return "figure.walk"
        case .sleep: return "moon.fill"
        case .eat:   return "fork.knife"
        case .cry:   return "exclamationmark.circle.fill"
        case .happy: return "sparkles"
        }
    }

    public static func from(healthStatus: CatHealthStatus) -> CatAnimation {
        switch healthStatus {
        case .sick: return .cry
        case .recovering: return .sleep
        case .hungry, .thirsty, .needsLove: return .cry
        case .healthy: return .idle
        }
    }
}

// MARK: - CatBreed Asset Extension
extension CatBreed {
    public var spriteAssetName: String {
        switch self {
        case .scottishFold:     return "cat_sprite_scottish_fold"
        case .britishShorthair: return "cat_sprite_british_shorthair"
        case .tabby:            return "cat_sprite_tabby"
        case .blackCat:         return "cat_sprite_black_cat"
        case .orangeTabby:      return "cat_sprite_orange_tabby"
        case .whitePersian:     return "cat_sprite_white_persian"
        case .siamese:          return "cat_sprite_siamese"
        case .calico:           return "cat_sprite_calico"
        }
    }
}

// MARK: - CatSpriteManager
public final class CatSpriteManager {
    public static let shared = CatSpriteManager()

    private let cache = NSCache<NSString, UIImage>()
    private let gridCols: CGFloat = 6.0
    private let gridRows: CGFloat = 6.0

    private init() {
        cache.countLimit = 300
    }

    /// Belirtilen ırk, animasyon ve frame indeksindeki (0..5) görseli döndürür
    public func frame(for breed: CatBreed, animation: CatAnimation, frameIndex: Int) -> UIImage? {
        let safeIndex = max(0, min(animation.frameCount - 1, frameIndex))
        let cacheKey = "\(breed.rawValue)_\(animation.rawValue)_\(safeIndex)" as NSString

        if let cached = cache.object(forKey: cacheKey) {
            return cached
        }

        // Ana sprite sheet görselini yükle
        guard let sheet = loadSpriteSheet(for: breed), let cgImage = sheet.cgImage else {
            return nil
        }

        let sheetWidth = CGFloat(cgImage.width)
        let sheetHeight = CGFloat(cgImage.height)
        let frameWidth = sheetWidth / gridCols
        let frameHeight = sheetHeight / gridRows

        let col = CGFloat(safeIndex)
        let row = CGFloat(animation.row)

        let cropRect = CGRect(
            x: col * frameWidth,
            y: row * frameHeight,
            width: frameWidth,
            height: frameHeight
        )

        guard let croppedCGImage = cgImage.cropping(to: cropRect) else {
            return nil
        }

        let frameImage = UIImage(cgImage: croppedCGImage, scale: sheet.scale, orientation: sheet.imageOrientation)
        cache.setObject(frameImage, forKey: cacheKey)
        return frameImage
    }

    /// Bir animasyonun tüm 6 frame'ini liste olarak döndürür
    public func frames(for breed: CatBreed, animation: CatAnimation) -> [UIImage] {
        var list: [UIImage] = []
        for i in 0..<animation.frameCount {
            if let img = frame(for: breed, animation: animation, frameIndex: i) {
                list.append(img)
            }
        }
        return list
    }

    /// Irkın varsayılan önizleme karesi (Idle Frame 0)
    public func previewImage(for breed: CatBreed) -> UIImage? {
        frame(for: breed, animation: .idle, frameIndex: 0)
    }

    /// Sprite sheet'i Asset Catalog veya Bundle üzerinden yükler
    private func loadSpriteSheet(for breed: CatBreed) -> UIImage? {
        let assetName = breed.spriteAssetName

        // 1. Asset Catalog denemesi
        if let img = UIImage(named: assetName) {
            return img
        }

        // 2. Fallback Bundle denemesi
        if let path = Bundle.main.path(forResource: assetName, ofType: "png"),
           let img = UIImage(contentsOfFile: path) {
            return img
        }

        return nil
    }
}
