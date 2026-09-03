import SwiftUI

public struct PopHistoryView: View {
    @EnvironmentObject var state: AppState
    @State private var selectedFilter: Int = 0 // 0: Gelenler (Inbox), 1: Gönderdiklerim (Outbox)
    @State private var selectedDetailPop: PopItem? = nil
    
    public var body: some View {
        NavigationView {
            ZStack {
                Color(hex: "#0A0A0E")
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    headerBar
                        .padding(.horizontal, 16)
                        .padding(.top, 8)
                        .padding(.bottom, 12)
                    
                    filterTabs
                        .padding(.horizontal, 16)
                        .padding(.bottom, 14)
                    
                    let items = selectedFilter == 0 ? state.inboxHistory : state.outboxHistory
                    if items.isEmpty {
                        emptyStateView
                    } else {
                        historyList(items: items)
                    }
                }
            }
            .navigationBarHidden(true)
            .sheet(item: $selectedDetailPop) { pop in
                PopDetailSheet(pop: pop)
            }
        }
    }
    
    // MARK: - Header Bar
    private var headerBar: some View {
        HStack {
            Text("B!Pop Geçmişi")
                .font(.system(size: 24, weight: .heavy, design: .rounded))
                .foregroundColor(.white)
            
            Spacer()
            
            Button(action: {
                Task {
                    await state.syncWithServer()
                }
            }) {
                Image(systemName: "arrow.clockwise")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.white.opacity(0.8))
                    .padding(8)
                    .background(Color.white.opacity(0.08))
                    .clipShape(Circle())
            }
        }
    }
    
    // MARK: - Filter Tabs
    private var filterTabs: some View {
        HStack(spacing: 8) {
            Button(action: {
                withAnimation(.spring()) { selectedFilter = 0 }
                HapticManager.shared.playSelection()
            }) {
                HStack(spacing: 6) {
                    Image(systemName: "tray.and.arrow.down.fill")
                        .font(.system(size: 13))
                    Text("Gelenler (\(state.inboxHistory.count))")
                        .font(.system(size: 13, weight: .bold, design: .rounded))
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(selectedFilter == 0 ? Color(hex: "#FF007F") : Color.white.opacity(0.08))
                .foregroundColor(.white)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            }
            
            Button(action: {
                withAnimation(.spring()) { selectedFilter = 1 }
                HapticManager.shared.playSelection()
            }) {
                HStack(spacing: 6) {
                    Image(systemName: "paperplane.fill")
                        .font(.system(size: 13))
                    Text("Gönderdiklerim (\(state.outboxHistory.count))")
                        .font(.system(size: 13, weight: .bold, design: .rounded))
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(selectedFilter == 1 ? Color(hex: "#7928CA") : Color.white.opacity(0.08))
                .foregroundColor(.white)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            }
        }
    }
    
    // MARK: - Empty State
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Spacer()
            
            ZStack {
                Circle()
                    .fill(Color(hex: "#FF007F").opacity(0.12))
                    .frame(width: 80, height: 80)
                
                Image(systemName: selectedFilter == 0 ? "tray.fill" : "paperplane.fill")
                    .font(.system(size: 32))
                    .foregroundColor(Color(hex: "#FF007F"))
            }
            
            Text(selectedFilter == 0 ? "Henüz B!Pop Gelmedi" : "Henüz B!Pop Göndermedin")
                .font(.system(size: 18, weight: .bold, design: .rounded))
                .foregroundColor(.white)
            
            Text(selectedFilter == 0 ? "Arkadaşın sana ilk sürprizi gönderdiğinde burada görünecek." : "Stüdyoya git ve arkadaşına eğlenceli bir not gönder!")
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(.white.opacity(0.6))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            
            if selectedFilter == 1 {
                Button(action: {
                    state.selectedTab = .studio
                }) {
                    Text("Hemen B!Pop Gönder")
                        .font(.system(size: 14, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 12)
                        .background(Color(hex: "#FF007F"))
                        .clipShape(Capsule())
                }
                .padding(.top, 8)
            }
            
            Spacer()
        }
    }
    
    // MARK: - History List
    private func historyList(items: [PopItem]) -> some View {
        ScrollView(showsIndicators: false) {
            LazyVStack(spacing: 10) {
                ForEach(items) { pop in
                    Button(action: {
                        selectedDetailPop = pop
                        HapticManager.shared.playSelection()
                    }) {
                        HStack(spacing: 12) {
                            // Type Icon Badge
                            ZStack {
                                let note = pop.notePayload ?? NotePayload(text: "")
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(LinearGradient(colors: [Color(hex: note.bgGradientStart), Color(hex: note.bgGradientEnd)], startPoint: .topLeading, endPoint: .bottomTrailing))
                                    .overlay(Image(systemName: "quote.bubble.fill").foregroundColor(.white).font(.system(size: 14)))
                            }
                            .frame(width: 44, height: 44)
                            
                            // Info
                            VStack(alignment: .leading, spacing: 2) {
                                HStack(spacing: 6) {
                                    if selectedFilter == 1 {
                                        Text("SEN")
                                            .font(.system(size: 9, weight: .black))
                                            .foregroundColor(Color(hex: "#00F5FF"))
                                            .padding(.horizontal, 6)
                                            .padding(.vertical, 2)
                                            .background(Color(hex: "#00F5FF").opacity(0.15))
                                            .clipShape(Capsule())
                                        
                                        Text("Arkadaşına Gönderdin")
                                            .font(.system(size: 14, weight: .bold, design: .rounded))
                                            .foregroundColor(.white)
                                    } else {
                                        Text(pop.senderInitials)
                                            .font(.system(size: 10, weight: .black))
                                            .foregroundColor(Color(hex: "#FF007F"))
                                            .padding(.horizontal, 6)
                                            .padding(.vertical, 2)
                                            .background(Color(hex: "#FF007F").opacity(0.15))
                                            .clipShape(Capsule())
                                        
                                        Text(pop.senderName)
                                            .font(.system(size: 14, weight: .bold, design: .rounded))
                                            .foregroundColor(.white)
                                    }
                                    
                                    Spacer()
                                    
                                    Text(pop.createdAt, style: .time)
                                        .font(.system(size: 11))
                                        .foregroundColor(.white.opacity(0.4))
                                }
                                
                                Text(pop.notePayload?.text ?? "Not")
                                    .font(.system(size: 13, weight: .medium))
                                    .foregroundColor(.white.opacity(0.8))
                                    .lineLimit(1)
                            }
                            
                            Image(systemName: "chevron.right")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.white.opacity(0.3))
                        }
                        .padding(12)
                        .background(Color.white.opacity(0.05))
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    }
                    .contextMenu {
                        Button(role: .destructive) {
                            state.deletePopFromHistory(id: pop.id)
                        } label: {
                            Label("Geçmişten Sil", systemImage: "trash")
                        }
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 110)
        }
        .refreshable {
            await state.syncWithServer()
        }
    }
}

// MARK: - Pop Detail Sheet
public struct PopDetailSheet: View {
    public let pop: PopItem
    @Environment(\.dismiss) var dismiss
    
    public var body: some View {
        ZStack {
            Color(hex: "#101018")
                .ignoresSafeArea()
            
            VStack(spacing: 20) {
                // Drag Bar
                Capsule()
                    .fill(Color.white.opacity(0.2))
                    .frame(width: 40, height: 5)
                    .padding(.top, 10)
                
                // Sender Info
                HStack(spacing: 10) {
                    ZStack {
                        Circle()
                            .fill(
                                LinearGradient(
                                    colors: [Color(hex: "#FF007F"), Color(hex: "#7928CA")],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .frame(width: 38, height: 38)
                        Text(pop.senderInitials)
                            .font(.system(size: 14, weight: .heavy, design: .rounded))
                            .foregroundColor(.white)
                    }
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(pop.senderName)
                            .font(.system(size: 16, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                        Text(pop.createdAt, style: .date)
                            .font(.system(size: 12))
                            .foregroundColor(.white.opacity(0.6))
                    }
                    Spacer()
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 22))
                            .foregroundColor(.white.opacity(0.6))
                    }
                }
                .padding(.horizontal, 20)
                
                // Full Content
                WidgetMediumView(pop: pop)
                    .frame(height: 160)
                    .padding(.horizontal, 20)
                
                Spacer()
            }
        }
    }
}
