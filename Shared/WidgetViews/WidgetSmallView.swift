import SwiftUI
import WidgetKit

public struct WidgetSmallView: View {
    public let pop: PopItem

    public init(pop: PopItem) {
        self.pop = pop
    }

    public var body: some View {
        ZStack {
            noteContent
            senderPillOverlay
            // Sticker overlay
            if let stickers = pop.notePayload?.stickers, !stickers.isEmpty {
                GeometryReader { geo in
                    ForEach(stickers) { sticker in
                        Text(StickerCatalog.all.first(where: { $0.id == sticker.stickerKey })?.emoji ?? "")
                            .font(.system(size: 22 * sticker.scale))
                            .rotationEffect(.degrees(sticker.rotation))
                            .position(
                                x: sticker.positionX * geo.size.width,
                                y: sticker.positionY * geo.size.height
                            )
                    }
                }
            }
        }
        .widgetBackgroundCompat {
            Color.black
        }
    }

    // MARK: - Sender Pill Overlay
    private var senderPillOverlay: some View {
        VStack {
            HStack {
                HStack(spacing: 4) {
                    Text(pop.senderInitials)
                        .font(.system(size: 9, weight: .black))
                        .foregroundColor(Color(hex: "#FF007F"))
                    Text(pop.senderName)
                        .font(.system(size: 10, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                        .lineLimit(1)
                }
                .padding(.horizontal, 6)
                .padding(.vertical, 3)
                .background(.ultraThinMaterial)
                .clipShape(Capsule())

                Spacer()
            }
            .padding(8)
            Spacer()
        }
    }

    // MARK: - Note Content
    private var noteContent: some View {
        let note = pop.notePayload ?? NotePayload(text: "B!Pop")
        return ZStack {
            LinearGradient(
                colors: [Color(hex: note.bgGradientStart), Color(hex: note.bgGradientEnd)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(alignment: .leading, spacing: 6) {
                Spacer().frame(height: 24)

                Image(systemName: "quote.bubble.fill")
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.8))

                Text(note.text)
                    .font(.system(size: 13, weight: .semibold, design: .rounded))
                    .foregroundColor(Color(hex: note.textColor))
                    .lineLimit(4)
                    .multilineTextAlignment(.leading)
                    .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)

                Spacer()
            }
            .padding(.horizontal, 10)
            .padding(.bottom, 8)
        }
    }
}
