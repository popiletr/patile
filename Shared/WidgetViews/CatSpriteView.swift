import SwiftUI

// MARK: - CatSpriteAnimatedView (Uygulama İçi Canlı Animasyon)
public struct CatSpriteAnimatedView: View {
    public let breed: CatBreed
    public let animation: CatAnimation
    public var interval: TimeInterval = 0.25 // Frame geçiş süresi (250ms)
    public var contentMode: ContentMode = .fit

    @State private var currentFrame: Int = 0
    @State private var timer: Timer? = nil

    public init(breed: CatBreed, animation: CatAnimation, interval: TimeInterval = 0.25, contentMode: ContentMode = .fit) {
        self.breed = breed
        self.animation = animation
        self.interval = interval
        self.contentMode = contentMode
    }

    public var body: some View {
        Group {
            if let image = CatSpriteManager.shared.frame(for: breed, animation: animation, frameIndex: currentFrame) {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: contentMode)
            } else {
                // Fallback emoji if image is loading
                Text(breed.emoji)
                    .font(.system(size: 64))
            }
        }
        .onAppear {
            startAnimation()
        }
        .onDisappear {
            stopAnimation()
        }
        .onChange(of: animation) { _ in
            currentFrame = 0
            startAnimation()
        }
        .onChange(of: breed) { _ in
            currentFrame = 0
            startAnimation()
        }
    }

    private func startAnimation() {
        stopAnimation()
        timer = Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { _ in
            currentFrame = (currentFrame + 1) % animation.frameCount
        }
    }

    private func stopAnimation() {
        timer?.invalidate()
        timer = nil
    }
}

// MARK: - CatSpriteImageView (Widget & Statik Önizleme)
public struct CatSpriteImageView: View {
    public let breed: CatBreed
    public let animation: CatAnimation
    public var frameIndex: Int = 0
    public var contentMode: ContentMode = .fit

    public init(breed: CatBreed, animation: CatAnimation = .idle, frameIndex: Int = 0, contentMode: ContentMode = .fit) {
        self.breed = breed
        self.animation = animation
        self.frameIndex = frameIndex
        self.contentMode = contentMode
    }

    public var body: some View {
        if let image = CatSpriteManager.shared.frame(for: breed, animation: animation, frameIndex: frameIndex) {
            Image(uiImage: image)
                .resizable()
                .aspectRatio(contentMode: contentMode)
        } else {
            Text(breed.emoji)
                .font(.system(size: 40))
        }
    }
}
