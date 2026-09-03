import SwiftUI

public struct PairingView: View {
    @EnvironmentObject var state: AppState
    
    @State private var partnerInputUsernameOrCode: String = ""
    @State private var searchResults: [SearchUserResult] = []
    @State private var isSearching: Bool = false
    @State private var isSendingRequest: Bool = false
    @State private var isManualRefreshing: Bool = false
    @State private var showCopiedAlert: Bool = false
    @State private var showEditProfileSheet: Bool = false
    @State private var showServerConfigSheet: Bool = false
    @State private var editingName: String = ""
    @State private var customServerURL: String = ""
    
    @FocusState private var isInputFocused: Bool
    
    public var body: some View {
        NavigationView {
            ZStack {
                Color(hex: "#0A0A0E")
                    .ignoresSafeArea()
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 20) {
                        // Header with Manual Refresh
                        headerSection
                        
                        // Server Connection Status Chip
                        serverStatusChip
                        
                        // User Profile Card (Shows @username & Initials & Logout)
                        userProfileCard
                        
                        // INCOMING REQUESTS BANNER (If any)
                        if !state.pendingRequests.isEmpty {
                            incomingRequestsSection
                        }
                        
                        // MY USERNAME & INVITE CARD
                        myInviteCard
                        
                        // ADD FRIEND BY @USERNAME OR CODE
                        addFriendCard
                        
                        // FRIENDS LIST
                        friendsListSection
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 10)
                    .padding(.bottom, 110)
                }
                .scrollDismissesKeyboard(.interactively)
                .refreshable {
                    await state.syncWithServer()
                }
            }
            .navigationBarHidden(true)
            .withKeyboardDoneButton()
            .sheet(isPresented: $showEditProfileSheet) {
                editProfileSheet
            }
            .sheet(isPresented: $showServerConfigSheet) {
                serverConfigSheet
            }
        }
    }
    
    // MARK: - Header
    private var headerSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Arkadaşlarım")
                    .font(.system(size: 26, weight: .heavy, design: .rounded))
                    .foregroundColor(.white)
                
                Text("@kullanıcı_adı ile arkadaşını bul ve bağlan")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.white.opacity(0.6))
            }
            
            Spacer()
            
            // Manual Refresh Button
            Button(action: {
                Task {
                    isManualRefreshing = true
                    HapticManager.shared.playSelection()
                    await state.syncWithServer()
                    try? await Task.sleep(nanoseconds: 400_000_000)
                    isManualRefreshing = false
                }
            }) {
                Image(systemName: "arrow.clockwise")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.white)
                    .rotationEffect(.degrees(isManualRefreshing ? 360 : 0))
                    .animation(isManualRefreshing ? .linear(duration: 0.8).repeatForever(autoreverses: false) : .default, value: isManualRefreshing)
                    .padding(10)
                    .background(Color.white.opacity(0.1))
                    .clipShape(Circle())
            }
        }
    }
    
    // MARK: - Server Status Chip
    private var serverStatusChip: some View {
        Button(action: {
            showServerConfigSheet = true
        }) {
            HStack(spacing: 8) {
                Circle()
                    .fill(state.isServerConnected ? Color(hex: "#00FF66") : Color.red)
                    .frame(width: 8, height: 8)
                
                Text(state.isServerConnected ? "Canlı Sunucu Bağlı (Çevrimiçi)" : "Sunucuya Bağlanılamadı (Ayarla)")
                    .font(.system(size: 11, weight: .bold, design: .rounded))
                    .foregroundColor(state.isServerConnected ? Color(hex: "#00FF66") : .red)
                
                Spacer()
                
                Image(systemName: "slider.horizontal.3")
                    .font(.system(size: 11))
                    .foregroundColor(.white.opacity(0.5))
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(Color.white.opacity(0.06))
            .clipShape(Capsule())
        }
    }
    
    // MARK: - User Profile Card
    private var userProfileCard: some View {
        HStack(spacing: 14) {
            // Initials Avatar
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [Color(hex: "#FF007F"), Color(hex: "#7928CA")],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 48, height: 48)
                
                Text(state.userProfile.initials)
                    .font(.system(size: 18, weight: .heavy, design: .rounded))
                    .foregroundColor(.white)
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(state.userProfile.name)
                    .font(.system(size: 16, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                
                Text("@\(state.userProfile.username)")
                    .font(.system(size: 13, weight: .bold, design: .rounded))
                    .foregroundColor(Color(hex: "#FF007F"))
            }
            
            Spacer()
            
            // Edit Profile Button
            Button(action: {
                editingName = state.userProfile.name
                showEditProfileSheet = true
            }) {
                Image(systemName: "pencil")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(.white)
                    .padding(9)
                    .background(Color.white.opacity(0.1))
                    .clipShape(Circle())
            }
            
            // Logout Button
            Button(action: {
                state.logout()
                HapticManager.shared.playSelection()
            }) {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(Color(hex: "#FF453A"))
                    .padding(9)
                    .background(Color(hex: "#FF453A").opacity(0.15))
                    .clipShape(Circle())
            }
        }
        .padding(14)
        .background(Color.white.opacity(0.06))
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
    }
    
    // MARK: - Incoming Pair Requests Section
    private var incomingRequestsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Circle()
                    .fill(Color(hex: "#FF007F"))
                    .frame(width: 8, height: 8)
                Text("Gelen Eşleşme İstekleri (\(state.pendingRequests.count))")
                    .font(.system(size: 14, weight: .heavy, design: .rounded))
                    .foregroundColor(.white)
            }
            
            ForEach(state.pendingRequests) { req in
                HStack(spacing: 12) {
                    ZStack {
                        Circle()
                            .fill(Color(hex: "#FF007F").opacity(0.3))
                            .frame(width: 42, height: 42)
                        Text(req.initials)
                            .font(.system(size: 15, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                    }
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(req.fromUserName)
                            .font(.system(size: 15, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                        Text(req.fromUsername.isEmpty ? "Eşleşmek istiyor" : "@\(req.fromUsername) seninle eşleşmek istiyor")
                            .font(.system(size: 11))
                            .foregroundColor(.white.opacity(0.7))
                    }
                    
                    Spacer()
                    
                    // Reject
                    Button(action: {
                        Task { await state.respondToRequest(requestId: req.id, accept: false) }
                    }) {
                        Image(systemName: "xmark")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.white.opacity(0.8))
                            .padding(10)
                            .background(Color.white.opacity(0.12))
                            .clipShape(Circle())
                    }
                    
                    // Accept
                    Button(action: {
                        Task { await state.respondToRequest(requestId: req.id, accept: true) }
                    }) {
                        HStack(spacing: 4) {
                            Image(systemName: "checkmark")
                            Text("Kabul Et")
                        }
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.black)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(Color(hex: "#00FF66"))
                        .clipShape(Capsule())
                    }
                }
                .padding(12)
                .background(
                    LinearGradient(
                        colors: [Color(hex: "#FF007F").opacity(0.25), Color(hex: "#14141E")],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .stroke(Color(hex: "#FF007F"), lineWidth: 1.5)
                )
                .shadow(color: Color(hex: "#FF007F").opacity(0.3), radius: 8)
            }
        }
    }
    
    // MARK: - My Invite Card
    private var myInviteCard: some View {
        VStack(spacing: 12) {
            Text("Senin B!Pop Kullanıcı Adın")
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(.white.opacity(0.7))
            
            Text("@\(state.userProfile.username)")
                .font(.system(size: 26, weight: .heavy, design: .rounded))
                .foregroundColor(Color(hex: "#FF007F"))
                .padding(.vertical, 6)
                .padding(.horizontal, 18)
                .background(Color.black.opacity(0.35))
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            
            HStack(spacing: 12) {
                Button(action: {
                    UIPasteboard.general.string = "@\(state.userProfile.username)"
                    HapticManager.shared.playSuccess()
                    showCopiedAlert = true
                }) {
                    HStack(spacing: 6) {
                        Image(systemName: "doc.on.doc.fill")
                        Text("Kullanıcı Adını Kopyala")
                    }
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Color(hex: "#FF007F"))
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                }
                
                if let shareURL = URL(string: "https://bipop.app/@\(state.userProfile.username)") {
                    ShareLink(item: shareURL, message: Text("B!Pop'ta beni ekle ve widget'larımızı bağlayalım! Kullanıcı adım: @\(state.userProfile.username)")) {
                        Image(systemName: "square.and.arrow.up.fill")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.white)
                            .padding(12)
                            .background(Color.white.opacity(0.12))
                            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    }
                }
            }
        }
        .padding(18)
        .background(Color.white.opacity(0.06))
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .alert(isPresented: $showCopiedAlert) {
            Alert(title: Text("Kopyalandı"), message: Text("Kullanıcı adın panoya kopyalandı."), dismissButton: .default(Text("Tamam")))
        }
    }
    
    // MARK: - Add Friend Card
    private var addFriendCard: some View {
        VStack(spacing: 12) {
            Text("Arkadaşını Ekle (@kullanıcı_adı veya Kod)")
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(.white.opacity(0.7))
            
            HStack(spacing: 8) {
                HStack {
                    Text("@")
                        .foregroundColor(Color(hex: "#FF007F"))
                        .font(.system(size: 16, weight: .bold))
                    TextField("kullaniciadi (örn: ayse)", text: $partnerInputUsernameOrCode)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                        .foregroundColor(.white)
                        .focused($isInputFocused)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 12)
                .background(Color.black.opacity(0.35))
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                
                // Quick Paste Button
                Button(action: {
                    if let clipboard = UIPasteboard.general.string?.trimmingCharacters(in: .whitespacesAndNewlines), !clipboard.isEmpty {
                        partnerInputUsernameOrCode = clipboard.replacingOccurrences(of: "@", with: "")
                        HapticManager.shared.playSuccess()
                    }
                }) {
                    VStack(spacing: 2) {
                        Image(systemName: "doc.on.clipboard.fill")
                            .font(.system(size: 14))
                        Text("Yapıştır")
                            .font(.system(size: 9, weight: .bold))
                    }
                    .foregroundColor(Color(hex: "#00F5FF"))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .background(Color(hex: "#00F5FF").opacity(0.15))
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                }
            }
            
            if let feedback = state.requestFeedbackMessage {
                Text(feedback)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(feedback.contains("hata") || feedback.contains("bulunamadı") ? Color.red : Color(hex: "#00FF66"))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 8)
            }
            
            Button(action: {
                isInputFocused = false
                Task {
                    isSendingRequest = true
                    _ = await state.sendPairRequest(toIdentifier: partnerInputUsernameOrCode)
                    partnerInputUsernameOrCode = ""
                    isSendingRequest = false
                }
            }) {
                HStack(spacing: 6) {
                    if isSendingRequest {
                        ProgressView().tint(.white)
                    } else {
                        Image(systemName: "paperplane.fill")
                        Text("Eşleşme İsteği Gönder")
                    }
                }
                .font(.system(size: 14, weight: .bold, design: .rounded))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(
                    LinearGradient(
                        colors: [Color(hex: "#7928CA"), Color(hex: "#00F5FF")],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            }
            .disabled(partnerInputUsernameOrCode.count < 2 || isSendingRequest)
        }
        .padding(18)
        .background(Color.white.opacity(0.06))
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
    }
    
    // MARK: - Friends List Section
    private var friendsListSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Bağlı Arkadaşlarım (\(state.friends.count))")
                    .font(.system(size: 16, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                Spacer()
            }
            
            if state.friends.isEmpty {
                HStack {
                    Spacer()
                    VStack(spacing: 6) {
                        Image(systemName: "person.crop.circle.badge.plus")
                            .font(.system(size: 28))
                            .foregroundColor(.white.opacity(0.4))
                        Text("Henüz bağlı bir arkadaşın yok")
                            .font(.system(size: 13))
                            .foregroundColor(.white.opacity(0.5))
                        Text("Arkadaşının @kullanıcı_adını girip istek gönder.")
                            .font(.system(size: 11))
                            .foregroundColor(.white.opacity(0.35))
                    }
                    .padding(.vertical, 16)
                    Spacer()
                }
                .background(Color.white.opacity(0.04))
                .clipShape(RoundedRectangle(cornerRadius: 16))
            } else {
                ForEach(state.friends, id: \.id) { (friend: Friend) in
                    HStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(Color.white.opacity(0.12))
                                .frame(width: 42, height: 42)
                            Text(friend.initials)
                                .font(.system(size: 15, weight: .bold, design: .rounded))
                                .foregroundColor(.white)
                        }
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text(friend.name)
                                .font(.system(size: 15, weight: .bold, design: .rounded))
                                .foregroundColor(.white)
                            
                            HStack(spacing: 4) {
                                if !friend.username.isEmpty {
                                    Text("@\(friend.username)")
                                        .font(.system(size: 11, weight: .semibold))
                                        .foregroundColor(Color(hex: "#FF007F"))
                                }
                                Circle().fill(Color(hex: "#00FF66")).frame(width: 6, height: 6)
                                Text("Bağlı")
                                    .font(.system(size: 11, weight: .semibold))
                                    .foregroundColor(Color(hex: "#00FF66"))
                            }
                        }
                        
                        Spacer()
                        
                        // Direct Pop Shortcut
                        Button(action: {
                            state.selectedRecipientId = friend.id
                            state.selectedTab = .studio
                            HapticManager.shared.playSelection()
                        }) {
                            Text("B!Pop At")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(.white)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .background(Color(hex: "#FF007F"))
                                .clipShape(Capsule())
                        }
                        
                        // Remove Friend
                        Button(action: {
                            Task { await state.removeFriend(friendId: friend.id) }
                        }) {
                            Image(systemName: "trash")
                                .font(.system(size: 13))
                                .foregroundColor(.red.opacity(0.7))
                                .padding(8)
                        }
                    }
                    .padding(12)
                    .background(Color.white.opacity(0.06))
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                }
            }
        }
    }
    
    // MARK: - Server Config Sheet
    private var serverConfigSheet: some View {
        ZStack {
            Color(hex: "#101018").ignoresSafeArea()
            VStack(spacing: 20) {
                Capsule().fill(Color.white.opacity(0.2)).frame(width: 40, height: 5).padding(.top, 10)
                
                Text("Backend Sunucu & Wi-Fi IP Ayarı")
                    .font(.system(size: 17, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                
                Text("Gerçek iPhone testlerinde Mac'inizin yerel Wi-Fi IP adresi gereklidir:")
                    .font(.system(size: 12))
                    .foregroundColor(.white.opacity(0.7))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 20)
                
                TextField("http://192.168.1.104:3000", text: $customServerURL)
                    .foregroundColor(.white)
                    .padding(12)
                    .background(Color.white.opacity(0.08))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .padding(.horizontal, 20)
                    .autocapitalization(.none)
                    .disableAutocorrection(true)
                
                Button(action: {
                    UserDefaults.standard.set(customServerURL.trimmingCharacters(in: .whitespacesAndNewlines), forKey: AppGroupConstants.keyServerURL)
                    showServerConfigSheet = false
                    Task { await state.syncWithServer() }
                }) {
                    Text("Kaydet & Yeniden Bağlan")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(.black)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color(hex: "#00F5FF"))
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                        .padding(.horizontal, 20)
                }
                
                Spacer()
            }
        }
    }
    
    // MARK: - Edit Profile Sheet
    private var editProfileSheet: some View {
        ZStack {
            Color(hex: "#101018").ignoresSafeArea()
            VStack(spacing: 20) {
                Capsule().fill(Color.white.opacity(0.2)).frame(width: 40, height: 5).padding(.top, 10)
                
                Text("Profilini Düzenle")
                    .font(.system(size: 18, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                
                TextField("Adın", text: $editingName)
                    .foregroundColor(.white)
                    .padding(12)
                    .background(Color.white.opacity(0.08))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .padding(.horizontal, 20)
                
                Button(action: {
                    state.userProfile.name = editingName.isEmpty ? state.userProfile.name : editingName
                    SharedStorage.shared.saveUserProfile(state.userProfile)
                    showEditProfileSheet = false
                    HapticManager.shared.playSuccess()
                }) {
                    Text("Kaydet")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color(hex: "#FF007F"))
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                        .padding(.horizontal, 20)
                }
                Spacer()
            }
        }
    }
}
