import SwiftUI

public struct StudioView: View {
    @EnvironmentObject var state: AppState

    public var body: some View {
        NavigationView {
            ZStack {
                Color(hex: "#0A0A0E")
                    .ignoresSafeArea()

                VStack(spacing: 0) {
                    headerBar
                        .padding(.horizontal, 16)
                        .padding(.top, 8)
                        .padding(.bottom, 8)

                    if !state.pendingRequests.isEmpty {
                        incomingRequestBanner
                            .padding(.horizontal, 16)
                            .padding(.bottom, 8)
                    }

                    recipientSelectorBar
                        .padding(.horizontal, 16)
                        .padding(.bottom, 8)

                    ScrollView(showsIndicators: false) {
                        VStack(spacing: 18) {
                            // Gelen not kartı
                            if let received = state.latestReceivedPop,
                               received.senderId != state.userProfile.id {
                                incomingPartnerPopCard(pop: received)
                            }

                            // Not + Sticker Editörü
                            NoteEditorView()

                            sendPopButton
                                .padding(.horizontal, 16)
                                .padding(.top, 10)
                                .padding(.bottom, 110)
                        }
                    }
                    .scrollDismissesKeyboard(.interactively)
                    .refreshable {
                        await state.syncWithServer()
                    }
                }
            }
            .navigationBarHidden(true)
            .withKeyboardDoneButton()
            .alert(isPresented: $state.showPopSentAlert) {
                Alert(
                    title: Text("B!Pop Gönderildi!"),
                    message: Text(state.sentPopSummary),
                    dismissButton: .default(Text("Tamam"))
                )
            }
        }
    }

    // MARK: - Header Bar
    private var headerBar: some View {
        HStack {
            HStack(spacing: 0) {
                Text("B")
                    .font(.system(size: 26, weight: .black, design: .rounded))
                    .foregroundColor(.white)
                Text("!")
                    .font(.system(size: 26, weight: .black, design: .rounded))
                    .foregroundColor(Color(hex: "#FF007F"))
                Text("Pop")
                    .font(.system(size: 26, weight: .black, design: .rounded))
                    .foregroundColor(.white)
            }

            Spacer()

            Button(action: { state.selectedTab = .pair }) {
                HStack(spacing: 6) {
                    Circle()
                        .fill(state.isServerConnected ? Color(hex: "#00FF66") : Color.red)
                        .frame(width: 7, height: 7)
                    Image(systemName: "person.2.fill")
                        .font(.system(size: 11))
                    Text("\(state.friends.count) Arkadaş")
                        .font(.system(size: 12, weight: .bold, design: .rounded))
                }
                .foregroundColor(.white)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(Color.white.opacity(0.1))
                .clipShape(Capsule())
            }
        }
    }

    // MARK: - Recipient Selector Bar
    private var recipientSelectorBar: some View {
        HStack(spacing: 8) {
            Text("Kime:")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(.white.opacity(0.6))

            Menu {
                Button {
                    state.selectedRecipientId = "all"
                    HapticManager.shared.playSelection()
                } label: {
                    Label("Tüm Arkadaşlarım", systemImage: "person.2.fill")
                }

                ForEach(state.friends) { friend in
                    Button {
                        state.selectedRecipientId = friend.id
                        HapticManager.shared.playSelection()
                    } label: {
                        Label("\(friend.name) (@\(friend.username))", systemImage: "person.fill")
                    }
                }
            } label: {
                HStack(spacing: 6) {
                    Image(systemName: state.selectedRecipientId == "all" ? "person.2.fill" : "person.fill")
                        .font(.system(size: 11))

                    if state.selectedRecipientId == "all" {
                        Text("Tüm Arkadaşlarım (\(state.friends.count))")
                    } else if let f = state.friends.first(where: { $0.id == state.selectedRecipientId }) {
                        Text("\(f.name) (@\(f.username))")
                    } else {
                        Text("Tüm Arkadaşlarım")
                    }

                    Image(systemName: "chevron.up.chevron.down")
                        .font(.system(size: 10, weight: .bold))
                }
                .font(.system(size: 12, weight: .bold, design: .rounded))
                .foregroundColor(.white)
                .padding(.horizontal, 10)
                .padding(.vertical, 5)
                .background(Color(hex: "#FF007F").opacity(0.2))
                .clipShape(Capsule())
                .overlay(Capsule().stroke(Color(hex: "#FF007F").opacity(0.5), lineWidth: 1))
            }

            Spacer()
        }
    }

    // MARK: - Incoming Request Banner
    private var incomingRequestBanner: some View {
        Button(action: {
            state.selectedTab = .pair
            HapticManager.shared.playSelection()
        }) {
            HStack(spacing: 8) {
                Image(systemName: "person.crop.circle.badge.plus")
                    .font(.system(size: 15))
                    .foregroundColor(.white)

                Text("\(state.pendingRequests.count) yeni eşleşme isteği var")
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .foregroundColor(.white)

                Spacer()

                Text("Görüntüle")
                    .font(.system(size: 11, weight: .heavy))
                    .foregroundColor(.black)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(Color(hex: "#00FF66"))
                    .clipShape(Capsule())
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(
                LinearGradient(
                    colors: [Color(hex: "#FF007F").opacity(0.8), Color(hex: "#7928CA").opacity(0.8)],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .shadow(color: Color(hex: "#FF007F").opacity(0.35), radius: 6)
        }
    }

    // MARK: - Send Button
    private var isSendDisabled: Bool {
        if state.isSending { return true }
        if state.noteText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { return true }
        return false
    }

    private var sendPopButton: some View {
        Button(action: { state.sendCurrentPop() }) {
            HStack(spacing: 10) {
                if state.isSending {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                } else {
                    Image(systemName: "paperplane.fill")
                        .font(.system(size: 18, weight: .bold))
                    Text("B!Pop Gönder")
                        .font(.system(size: 17, weight: .heavy, design: .rounded))
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(
                LinearGradient(
                    colors: isSendDisabled
                        ? [Color.gray.opacity(0.3), Color.gray.opacity(0.2)]
                        : [Color(hex: "#FF007F"), Color(hex: "#7928CA"), Color(hex: "#00F5FF")],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .foregroundColor(.white.opacity(isSendDisabled ? 0.5 : 1.0))
            .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
            .shadow(
                color: isSendDisabled ? .clear : Color(hex: "#FF007F").opacity(0.45),
                radius: 14, x: 0, y: 6
            )
            .scaleEffect(state.isSending ? 0.96 : 1.0)
            .animation(.spring(), value: state.isSending)
        }
        .disabled(isSendDisabled)
    }

    // MARK: - Incoming Partner Pop Card
    private func incomingPartnerPopCard(pop: PopItem) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [Color(hex: "#00F5FF"), Color(hex: "#7928CA")],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 28, height: 28)
                    Text(pop.senderInitials)
                        .font(.system(size: 11, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text("\(pop.senderName) sana yeni bir B!Pop gönderdi")
                        .font(.system(size: 13, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text("@\(pop.senderUsername.isEmpty ? "partner" : pop.senderUsername)")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.white.opacity(0.6))
                }

                Spacer()

                HStack(spacing: 4) {
                    Circle()
                        .fill(Color(hex: "#00FF66"))
                        .frame(width: 6, height: 6)
                    Text("Canlı")
                        .font(.system(size: 10, weight: .heavy))
                        .foregroundColor(Color(hex: "#00FF66"))
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color(hex: "#00FF66").opacity(0.15))
                .clipShape(Capsule())
            }

            // Not içeriği
            if let note = pop.notePayload {
                Text(note.text)
                    .font(.system(size: 13, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .lineLimit(2)
                    .padding(10)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        LinearGradient(
                            colors: [Color(hex: note.bgGradientStart), Color(hex: note.bgGradientEnd)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            }
        }
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(Color(hex: "#1A1A24"))
                .overlay(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .stroke(
                            LinearGradient(
                                colors: [Color(hex: "#00F5FF").opacity(0.6), Color(hex: "#7928CA").opacity(0.3)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 1.5
                        )
                )
        )
        .padding(.horizontal, 16)
        .shadow(color: Color(hex: "#00F5FF").opacity(0.2), radius: 10, y: 4)
    }
}
