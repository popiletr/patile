import SwiftUI

public struct LiveWidgetPreviewCard: View {
    @EnvironmentObject var state: AppState
    @State private var previewMode: Int = 0 // 0: Home Small, 1: Home Medium, 2: Lock Screen

    public var body: some View {
        VStack(spacing: 12) {
            HStack {
                HStack(spacing: 6) {
                    Circle()
                        .fill(Color(hex: "#FF007F"))
                        .frame(width: 8, height: 8)
                    Text("Canlı Widget Önizlemesi")
                        .font(.system(size: 13, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                }

                Spacer()

                Picker("", selection: $previewMode) {
                    Text("Küçük").tag(0)
                    Text("Orta").tag(1)
                    Text("Kilit").tag(2)
                }
                .pickerStyle(.segmented)
                .frame(width: 170)
            }
            .padding(.horizontal, 4)

            ZStack {
                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .fill(Color(hex: "#16161E"))
                    .overlay(
                        RoundedRectangle(cornerRadius: 24, style: .continuous)
                            .stroke(
                                LinearGradient(
                                    colors: [Color.white.opacity(0.15), Color.clear],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                lineWidth: 1
                            )
                    )

                Group {
                    if previewMode == 0 {
                        WidgetSmallView(pop: currentDraftPop)
                            .frame(width: 155, height: 155)
                            .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                            .shadow(color: .black.opacity(0.4), radius: 10, x: 0, y: 5)
                            .padding(.vertical, 12)
                    } else if previewMode == 1 {
                        WidgetMediumView(pop: currentDraftPop)
                            .frame(width: 320, height: 155)
                            .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                            .shadow(color: .black.opacity(0.4), radius: 10, x: 0, y: 5)
                            .padding(.vertical, 12)
                    } else {
                        lockScreenPreview
                            .padding(.vertical, 16)
                            .padding(.horizontal, 20)
                    }
                }
            }
            .frame(height: 190)
        }
        .padding(.horizontal, 16)
    }

    private var lockScreenPreview: some View {
        VStack(spacing: 8) {
            Text("09:41")
                .font(.system(size: 38, weight: .semibold, design: .rounded))
                .foregroundColor(.white.opacity(0.85))

            HStack {
                LockRectangularView(pop: currentDraftPop)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(Color.white.opacity(0.12))
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        }
    }

    private var currentDraftPop: PopItem {
        PopItem(
            senderId: state.userProfile.id,
            senderUsername: state.userProfile.username,
            senderName: state.userProfile.name.isEmpty ? "Sen" : state.userProfile.name,
            senderEmoji: "",
            type: .note,
            notePayload: NotePayload(
                text: state.noteText.isEmpty ? "Notunu yazmaya başla..." : state.noteText,
                fontStyle: "rounded",
                bgGradientStart: state.noteBgStartHex,
                bgGradientEnd: state.noteBgEndHex,
                textColor: state.noteTextColorHex,
                iconSymbol: state.noteEmojiReaction,
                stickers: state.noteStickers
            )
        )
    }
}
