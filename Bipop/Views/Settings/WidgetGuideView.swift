import SwiftUI

public struct WidgetGuideView: View {
    @EnvironmentObject var state: AppState
    @State private var reloadedStatus: Bool = false
    
    public var body: some View {
        NavigationView {
            ZStack {
                Color(hex: "#0A0A0E")
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 20) {
                        // Header
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Widget Kurulum Rehberi")
                                .font(.system(size: 26, weight: .heavy, design: .rounded))
                                .foregroundColor(.white)
                            
                            Text("B!Pop widget'larını Ana Ekran ve Kilit Ekranına nasıl eklersin?")
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(.white.opacity(0.6))
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        
                        // Force Reload / Test Widget Button
                        Button(action: {
                            SharedStorage.shared.reloadWidgets()
                            HapticManager.shared.playSuccess()
                            reloadedStatus = true
                            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                reloadedStatus = false
                            }
                        }) {
                            HStack(spacing: 8) {
                                Image(systemName: reloadedStatus ? "checkmark.circle.fill" : "arrow.clockwise")
                                    .font(.system(size: 15, weight: .bold))
                                Text(reloadedStatus ? "Widget'lar Yenilendi!" : "Widget'ları Şimdi Yenile")
                                    .font(.system(size: 14, weight: .bold, design: .rounded))
                            }
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(reloadedStatus ? Color(hex: "#00FF66") : Color.white.opacity(0.12))
                            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                        }
                        
                        // Step 1: Kilit Ekranı (Lock Screen)
                        guideCard(
                            stepNumber: "1",
                            title: "Kilit Ekranı Widget'ı Ekleme",
                            subtitle: "Partnerinin anlık notlarını ve şarkılarını telefonunu açmadan gör",
                            icon: "lock.shield.fill",
                            colorHex: "#FF007F",
                            instructions: [
                                "Kilit ekranındayken ekrana basılı tut ve 'Özelleştir'e bas.",
                                "Kilit Ekranını seç ve saatin altındaki widget alanına dokun.",
                                "Listeden 'B!Pop' uygulamasını bul.",
                                "Dikdörtgen veya Dairesel widget'ı seçip 'Bitti'ye dokun."
                            ]
                        )
                        
                        // Step 2: Ana Ekran (Home Screen)
                        guideCard(
                            stepNumber: "2",
                            title: "Ana Ekran Widget'ı Ekleme",
                            subtitle: "Renkli pikseller ve zengin müzik kartları için",
                            icon: "iphone",
                            colorHex: "#7928CA",
                            instructions: [
                                "Ana ekranda boş bir alana basılı tut (uygulamalar sallanana kadar).",
                                "Sol üst köşedeki '+' (Ekle) butonuna dokun.",
                                "Arama çubuğuna 'B!Pop' yaz ve seç.",
                                "Küçük (2x2) veya Orta (4x2) boyutu seçip 'Widget Ekle'ye bas."
                            ]
                        )
                        
                        // Step 3: Spotify İpucu
                        guideCard(
                            stepNumber: "3",
                            title: "Günün Şarkısı İpucu",
                            subtitle: "Widget üzerinden doğrudan Spotify'da çal",
                            icon: "music.note",
                            colorHex: "#1DB954",
                            instructions: [
                                "Partnerinin gönderdiği şarkı widget'ında göründüğünde üzerine dokun.",
                                "B!Pop seni otomatik olarak Spotify'da parçaya yönlendirir."
                            ]
                        )
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 10)
                    .padding(.bottom, 40)
                }
            }
            .navigationBarHidden(true)
        }
    }
    
    // MARK: - Guide Card Component
    private func guideCard(
        stepNumber: String,
        title: String,
        subtitle: String,
        icon: String,
        colorHex: String,
        instructions: [String]
    ) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 10) {
                ZStack {
                    Circle()
                        .fill(Color(hex: colorHex))
                        .frame(width: 34, height: 34)
                    
                    Image(systemName: icon)
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(.white)
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text(subtitle)
                        .font(.system(size: 12))
                        .foregroundColor(.white.opacity(0.6))
                }
            }
            
            VStack(alignment: .leading, spacing: 8) {
                ForEach(Array(instructions.enumerated()), id: \.offset) { index, item in
                    HStack(alignment: .top, spacing: 8) {
                        Text("\(index + 1).")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(Color(hex: colorHex))
                        
                        Text(item)
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.white.opacity(0.85))
                    }
                }
            }
            .padding(.top, 4)
        }
        .padding(16)
        .background(Color.white.opacity(0.06))
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
    }
}
