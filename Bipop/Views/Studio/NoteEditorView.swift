import SwiftUI

public struct NoteEditorView: View {
    @EnvironmentObject var state: AppState
    @FocusState private var isNoteFocused: Bool
    @State private var showStickerPanel: Bool = false
    @State private var selectedStickerCategory: String = "Sevgi"

    // Preset Gradients
    private let gradientThemes: [(start: String, end: String, name: String)] = [
        ("#FF007F", "#7928CA", "Neon Sunset"),
        ("#00F5FF", "#0066FF", "Cyber Sky"),
        ("#00FF87", "#0072FF", "Emerald"),
        ("#FF7E5F", "#FEB47B", "Peach"),
        ("#8A2387", "#E94057", "Passion"),
        ("#1F1C2C", "#928DAB", "Midnight"),
        ("#111118", "#222230", "Minimal Dark")
    ]

    private let iconSymbols: [String] = [
        "sparkles", "bolt.fill", "star.fill", "heart.fill",
        "flame.fill", "moon.stars.fill", "sun.max.fill", "quote.bubble.fill"
    ]

    public var body: some View {
        VStack(spacing: 16) {
            // Note Card Preview + Edit
            noteCardView
                .padding(.horizontal, 16)
                .onTapGesture { isNoteFocused = true }

            // Sticker Toggle + Seçili sticker'lar
            stickerToggleRow

            if showStickerPanel {
                stickerPanel
                    .transition(.move(edge: .bottom).combined(with: .opacity))
            }

            // Icon seçici
            iconMoodSelector

            // Renk teması seçici
            backgroundGradientSelector
        }
        .animation(.spring(response: 0.35, dampingFraction: 0.8), value: showStickerPanel)
    }

    // MARK: - Note Card
    private var noteCardView: some View {
        ZStack(alignment: .topLeading) {
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [Color(hex: state.noteBgStartHex), Color(hex: state.noteBgEndHex)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .stroke(Color.white.opacity(0.15), lineWidth: 1)
                )
                .shadow(color: Color(hex: state.noteBgStartHex).opacity(0.35), radius: 10, x: 0, y: 4)

            // Sticker'lar kart üzerinde
            GeometryReader { geo in
                ForEach(state.noteStickers) { sticker in
                    Text(StickerCatalog.all.first(where: { $0.id == sticker.stickerKey })?.emoji ?? "")
                        .font(.system(size: 28 * sticker.scale))
                        .rotationEffect(.degrees(sticker.rotation))
                        .position(
                            x: sticker.positionX * geo.size.width,
                            y: sticker.positionY * geo.size.height
                        )
                        .onLongPressGesture {
                            withAnimation(.spring()) {
                                state.noteStickers.removeAll { $0.id == sticker.id }
                                HapticManager.shared.playSelection()
                            }
                        }
                }
            }

            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Image(systemName: state.noteEmojiReaction.isEmpty ? "sparkles" : state.noteEmojiReaction)
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.white)
                        .padding(8)
                        .background(.ultraThinMaterial)
                        .clipShape(Circle())

                    Spacer()

                    Text("\(state.noteText.count)/120")
                        .font(.system(size: 11, weight: .bold, design: .rounded))
                        .foregroundColor(.white.opacity(0.8))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.black.opacity(0.25))
                        .clipShape(Capsule())
                }

                TextField("Partnerine not yaz...", text: $state.noteText, axis: .vertical)
                    .font(.system(size: 17, weight: .semibold, design: .rounded))
                    .foregroundColor(Color(hex: state.noteTextColorHex))
                    .lineLimit(4)
                    .focused($isNoteFocused)
                    .padding(.vertical, 4)
            }
            .padding(16)
        }
        .frame(height: 160)
    }

    // MARK: - Sticker Toggle Row
    private var stickerToggleRow: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Sticker'lar:")
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .foregroundColor(.white.opacity(0.6))

                Spacer()

                Button(action: {
                    isNoteFocused = false
                    withAnimation { showStickerPanel.toggle() }
                    HapticManager.shared.playSelection()
                }) {
                    HStack(spacing: 5) {
                        Image(systemName: showStickerPanel ? "chevron.up" : "face.smiling")
                            .font(.system(size: 12, weight: .bold))
                        Text(showStickerPanel ? "Kapat" : "Sticker Ekle")
                            .font(.system(size: 12, weight: .bold, design: .rounded))
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color(hex: "#FF007F").opacity(0.2))
                    .clipShape(Capsule())
                    .overlay(Capsule().stroke(Color(hex: "#FF007F").opacity(0.4), lineWidth: 1))
                }
            }
            .padding(.horizontal, 16)

            // Eklenen sticker'ların küçük önizlemesi
            if !state.noteStickers.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 6) {
                        ForEach(state.noteStickers) { sticker in
                            Button(action: {
                                withAnimation(.spring()) {
                                    state.noteStickers.removeAll { $0.id == sticker.id }
                                    HapticManager.shared.playSelection()
                                }
                            }) {
                                ZStack(alignment: .topTrailing) {
                                    Text(StickerCatalog.all.first(where: { $0.id == sticker.stickerKey })?.emoji ?? "")
                                        .font(.system(size: 22))
                                        .padding(6)
                                        .background(Color.white.opacity(0.1))
                                        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))

                                    Image(systemName: "xmark.circle.fill")
                                        .font(.system(size: 12))
                                        .foregroundColor(.red.opacity(0.9))
                                        .offset(x: 4, y: -4)
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                }
            }
        }
    }

    // MARK: - Sticker Panel
    private var stickerPanel: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Kategori tabları
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(StickerCatalog.categories, id: \.self) { cat in
                        let isSelected = selectedStickerCategory == cat
                        Button(action: {
                            selectedStickerCategory = cat
                            HapticManager.shared.playSelection()
                        }) {
                            Text(cat)
                                .font(.system(size: 11, weight: .bold, design: .rounded))
                                .foregroundColor(isSelected ? .black : .white)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(isSelected ? Color(hex: "#FF007F") : Color.white.opacity(0.1))
                                .clipShape(Capsule())
                        }
                    }
                }
                .padding(.horizontal, 16)
            }

            // Sticker grid
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(StickerCatalog.stickers(for: selectedStickerCategory)) { sticker in
                        Button(action: {
                            let newSticker = StickerItem(
                                stickerKey: sticker.id,
                                positionX: Double.random(in: 0.25...0.75),
                                positionY: Double.random(in: 0.25...0.75),
                                scale: Double.random(in: 0.85...1.2),
                                rotation: Double.random(in: -15...15)
                            )
                            withAnimation(.spring()) {
                                state.noteStickers.append(newSticker)
                            }
                            HapticManager.shared.playSelection()
                        }) {
                            Text(sticker.emoji)
                                .font(.system(size: 32))
                                .frame(width: 52, height: 52)
                                .background(Color.white.opacity(0.08))
                                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                        }
                    }
                }
                .padding(.horizontal, 16)
            }
        }
        .padding(.vertical, 12)
        .background(Color.white.opacity(0.05))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .padding(.horizontal, 16)
    }

    // MARK: - Icon Mood Selector
    private var iconMoodSelector: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("İkon Rozeti:")
                .font(.system(size: 12, weight: .bold, design: .rounded))
                .foregroundColor(.white.opacity(0.6))
                .padding(.horizontal, 16)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(iconSymbols, id: \.self) { symbol in
                        let isSelected = state.noteEmojiReaction == symbol
                        Button(action: {
                            state.noteEmojiReaction = symbol
                            HapticManager.shared.playSelection()
                        }) {
                            Image(systemName: symbol)
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(isSelected ? Color(hex: "#FF007F") : .white)
                                .frame(width: 42, height: 42)
                                .background(
                                    isSelected ? Color(hex: "#FF007F").opacity(0.25) : Color.white.opacity(0.08)
                                )
                                .clipShape(Circle())
                                .overlay(
                                    Circle().stroke(
                                        isSelected ? Color(hex: "#FF007F") : Color.clear,
                                        lineWidth: 1.5
                                    )
                                )
                        }
                    }
                }
                .padding(.horizontal, 16)
            }
        }
    }

    // MARK: - Background Gradient Selector
    private var backgroundGradientSelector: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Arka Plan Teması:")
                .font(.system(size: 12, weight: .bold, design: .rounded))
                .foregroundColor(.white.opacity(0.6))
                .padding(.horizontal, 16)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(gradientThemes, id: \.name) { theme in
                        let isSelected = state.noteBgStartHex == theme.start
                        Button(action: {
                            state.noteBgStartHex = theme.start
                            state.noteBgEndHex = theme.end
                            HapticManager.shared.playSelection()
                        }) {
                            VStack(spacing: 4) {
                                RoundedRectangle(cornerRadius: 12, style: .continuous)
                                    .fill(
                                        LinearGradient(
                                            colors: [Color(hex: theme.start), Color(hex: theme.end)],
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        )
                                    )
                                    .frame(width: 54, height: 38)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                                            .stroke(Color.white, lineWidth: isSelected ? 2.5 : 0)
                                    )

                                Text(theme.name)
                                    .font(.system(size: 9, weight: isSelected ? .bold : .medium, design: .rounded))
                                    .foregroundColor(isSelected ? .white : .white.opacity(0.6))
                            }
                        }
                    }
                }
                .padding(.horizontal, 16)
            }
        }
    }
}
