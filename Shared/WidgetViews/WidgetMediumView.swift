import SwiftUI
import WidgetKit

public struct WidgetMediumView: View {
    public let pop: PopItem

    public init(pop: PopItem) {
        self.pop = pop
    }

    public var body: some View {
        ZStack {
            noteMediumContent
            // Sticker overlay
            if let stickers = pop.notePayload?.stickers, !stickers.isEmpty {
                GeometryReader { geo in
                    ForEach(stickers) { sticker in
                        Text(StickerCatalog.all.first(where: { $0.id == sticker.stickerKey })?.emoji ?? "")
                            .font(.system(size: 28 * sticker.scale))
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

    // MARK: - Note Medium
    private var noteMediumContent: some View {
        let note = pop.notePayload ?? NotePayload(text: "")
        return ZStack {
            LinearGradient(
                colors: [Color(hex: note.bgGradientStart), Color(hex: note.bgGradientEnd)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(alignment: .leading, spacing: 6) {
                // Header: sender info
                HStack {
                    HStack(spacing: 6) {
                        Text(pop.senderInitials)
                            .font(.system(size: 10, weight: .black))
                            .foregroundColor(Color(hex: "#FF007F"))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color(hex: "#FF007F").opacity(0.18))
                            .clipShape(Capsule())

                        Text(pop.senderName)
                            .font(.system(size: 14, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                    }

                    Spacer()

                    Text(pop.createdAt, style: .time)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))
                }

                Divider()
                    .background(Color.white.opacity(0.2))

                // Note text
                Text(note.text)
                    .font(.system(size: 15, weight: .semibold, design: .rounded))
                    .foregroundColor(Color(hex: note.textColor))
                    .lineLimit(3)
                    .multilineTextAlignment(.leading)
                    .shadow(color: .black.opacity(0.25), radius: 2, x: 0, y: 1)

                Spacer()

                // Footer
                HStack {
                    Image(systemName: note.iconSymbol)
                        .font(.system(size: 11))
                        .foregroundColor(.white.opacity(0.7))
                    Spacer()
                    Text("B!Pop")
                        .font(.system(size: 10, weight: .black, design: .rounded))
                        .foregroundColor(Color(hex: "#FF007F"))
                }
            }
            .padding(14)
        }
    }
}
