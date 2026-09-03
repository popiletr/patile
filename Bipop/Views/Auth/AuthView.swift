import SwiftUI

public struct AuthView: View {
    @EnvironmentObject var state: AppState
    
    @State private var isLoginMode: Bool = false
    
    // Sign Up Fields
    @State private var username: String = ""
    @State private var name: String = ""
    @State private var email: String = ""
    @State private var password: String = ""
    
    // Login Fields
    @State private var loginIdentifier: String = ""
    @State private var loginPassword: String = ""
    
    // UI State
    @State private var isLoading: Bool = false
    @State private var errorMessage: String? = nil
    
    private var initialsPreview: String {
        let cleanName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        if !cleanName.isEmpty {
            let words = cleanName.split(separator: " ")
            if words.count >= 2, let f = words[0].first, let s = words[1].first {
                return "\(f)\(s)".uppercased()
            }
            return String(cleanName.prefix(2)).uppercased()
        }
        let cleanUser = username.trimmingCharacters(in: .whitespacesAndNewlines).replacingOccurrences(of: "@", with: "")
        if !cleanUser.isEmpty {
            return String(cleanUser.prefix(2)).uppercased()
        }
        return "BP"
    }
    
    public var body: some View {
        ZStack {
            // Background
            Color(hex: "#0A0A10").ignoresSafeArea()
            
            // Ambient Neon Glow
            RadialGradient(
                colors: [Color(hex: "#FF007F").opacity(0.2), Color.clear],
                center: .topTrailing,
                startRadius: 20,
                endRadius: 350
            )
            .ignoresSafeArea()
            
            RadialGradient(
                colors: [Color(hex: "#7928CA").opacity(0.18), Color.clear],
                center: .bottomLeading,
                startRadius: 20,
                endRadius: 300
            )
            .ignoresSafeArea()
            
            ScrollView(showsIndicators: false) {
                VStack(spacing: 24) {
                    // Header Logo & Branding
                    VStack(spacing: 8) {
                        Text("B!Pop")
                            .font(.system(size: 38, weight: .black, design: .rounded))
                            .foregroundStyle(
                                LinearGradient(
                                    colors: [Color(hex: "#FF007F"), Color(hex: "#FF71B6")],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                        
                        Text("Partnerinle anında kilit ve ana ekran widget'ı paylaş")
                            .font(.system(size: 13, weight: .medium, design: .rounded))
                            .foregroundColor(.white.opacity(0.6))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 20)
                    }
                    .padding(.top, 40)
                    
                    // Segmented Mode Switcher
                    HStack(spacing: 0) {
                        Button(action: {
                            withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                                isLoginMode = false
                                errorMessage = nil
                            }
                            HapticManager.shared.playSelection()
                        }) {
                            Text("Hızlı Kayıt Ol")
                                .font(.system(size: 14, weight: !isLoginMode ? .bold : .medium, design: .rounded))
                                .foregroundColor(!isLoginMode ? .white : .white.opacity(0.5))
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 10)
                                .background(
                                    !isLoginMode ?
                                    RoundedRectangle(cornerRadius: 12).fill(Color.white.opacity(0.12)) :
                                    RoundedRectangle(cornerRadius: 12).fill(Color.clear)
                                )
                        }
                        
                        Button(action: {
                            withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                                isLoginMode = true
                                errorMessage = nil
                            }
                            HapticManager.shared.playSelection()
                        }) {
                            Text("Giriş Yap")
                                .font(.system(size: 14, weight: isLoginMode ? .bold : .medium, design: .rounded))
                                .foregroundColor(isLoginMode ? .white : .white.opacity(0.5))
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 10)
                                .background(
                                    isLoginMode ?
                                    RoundedRectangle(cornerRadius: 12).fill(Color.white.opacity(0.12)) :
                                    RoundedRectangle(cornerRadius: 12).fill(Color.clear)
                                )
                        }
                    }
                    .padding(4)
                    .background(Color.white.opacity(0.06))
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .padding(.horizontal, 20)
                    
                    // Error Message
                    if let error = errorMessage {
                        HStack(spacing: 8) {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundColor(Color(hex: "#FF453A"))
                            Text(error)
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(Color(hex: "#FF453A"))
                            Spacer()
                        }
                        .padding(12)
                        .background(Color(hex: "#FF453A").opacity(0.15))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .padding(.horizontal, 20)
                    }
                    
                    // Form Content
                    if !isLoginMode {
                        signUpForm
                    } else {
                        loginForm
                    }
                }
                .padding(.bottom, 40)
            }
            .scrollDismissesKeyboard(.interactively)
        }
        .withKeyboardDoneButton()
    }
    
    // MARK: - Sign Up Form
    private var signUpForm: some View {
        VStack(spacing: 16) {
            // Live Initials Badge
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [Color(hex: "#FF007F"), Color(hex: "#7928CA")],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 64, height: 64)
                    .shadow(color: Color(hex: "#FF007F").opacity(0.4), radius: 8)
                
                Text(initialsPreview)
                    .font(.system(size: 24, weight: .heavy, design: .rounded))
                    .foregroundColor(.white)
            }
            .padding(.bottom, 4)
            
            // Username Field
            VStack(alignment: .leading, spacing: 6) {
                Text("Kullanıcı Adı (@tag)")
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .foregroundColor(.white.opacity(0.6))
                
                HStack {
                    Text("@")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(Color(hex: "#FF007F"))
                    TextField("kullaniciadi (örn: nazmi)", text: $username)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                        .foregroundColor(.white)
                }
                .padding(14)
                .background(Color.white.opacity(0.07))
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            }
            .padding(.horizontal, 20)
            
            // Display Name Field
            VStack(alignment: .leading, spacing: 6) {
                Text("Görünen Adın")
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .foregroundColor(.white.opacity(0.6))
                
                TextField("Adın (örn: Nazmi)", text: $name)
                    .foregroundColor(.white)
                    .padding(14)
                    .background(Color.white.opacity(0.07))
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            }
            .padding(.horizontal, 20)
            
            // Email Field
            VStack(alignment: .leading, spacing: 6) {
                Text("E-posta Adresi (Firebase)")
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .foregroundColor(.white.opacity(0.6))
                
                TextField("ornek@mail.com", text: $email)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .disableAutocorrection(true)
                    .foregroundColor(.white)
                    .padding(14)
                    .background(Color.white.opacity(0.07))
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            }
            .padding(.horizontal, 20)
            
            // Password Field
            VStack(alignment: .leading, spacing: 6) {
                Text("Şifre")
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .foregroundColor(.white.opacity(0.6))
                
                SecureField("En az 6 karakter", text: $password)
                    .foregroundColor(.white)
                    .padding(14)
                    .background(Color.white.opacity(0.07))
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            }
            .padding(.horizontal, 20)
            
            // Submit Button
            Button(action: handleSignUp) {
                HStack {
                    if isLoading {
                        ProgressView().tint(.white)
                    } else {
                        Text("B!Pop'a Katıl & Başla")
                            .font(.system(size: 16, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(
                    LinearGradient(
                        colors: [Color(hex: "#FF007F"), Color(hex: "#7928CA")],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .shadow(color: Color(hex: "#FF007F").opacity(0.4), radius: 12, x: 0, y: 6)
            }
            .disabled(isLoading || username.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            .opacity(username.isEmpty ? 0.6 : 1.0)
            .padding(.horizontal, 20)
            .padding(.top, 10)
        }
    }
    
    // MARK: - Login Form
    private var loginForm: some View {
        VStack(spacing: 16) {
            // Identifier (Username or Email)
            VStack(alignment: .leading, spacing: 6) {
                Text("Kullanıcı Adı veya E-posta")
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .foregroundColor(.white.opacity(0.6))
                
                TextField("@kullaniciadi veya mail@domain.com", text: $loginIdentifier)
                    .autocapitalization(.none)
                    .disableAutocorrection(true)
                    .foregroundColor(.white)
                    .padding(14)
                    .background(Color.white.opacity(0.07))
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            }
            .padding(.horizontal, 20)
            
            // Password Field
            VStack(alignment: .leading, spacing: 6) {
                Text("Şifre")
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .foregroundColor(.white.opacity(0.6))
                
                SecureField("Şifreniz", text: $loginPassword)
                    .foregroundColor(.white)
                    .padding(14)
                    .background(Color.white.opacity(0.07))
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            }
            .padding(.horizontal, 20)
            
            // Login Submit Button
            Button(action: handleLogin) {
                HStack {
                    if isLoading {
                        ProgressView().tint(.white)
                    } else {
                        Text("Giriş Yap")
                            .font(.system(size: 16, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(
                    LinearGradient(
                        colors: [Color(hex: "#00F5FF"), Color(hex: "#0066FF")],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .shadow(color: Color(hex: "#0066FF").opacity(0.4), radius: 12, x: 0, y: 6)
            }
            .disabled(isLoading || loginIdentifier.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            .opacity(loginIdentifier.isEmpty ? 0.6 : 1.0)
            .padding(.horizontal, 20)
            .padding(.top, 10)
        }
    }
    
    // MARK: - Actions
    private func handleSignUp() {
        hideKeyboard()
        isLoading = true
        errorMessage = nil
        
        let cleanUsername = username.replacingOccurrences(of: "@", with: "").trimmingCharacters(in: .whitespacesAndNewlines)
        let cleanName = name.isEmpty ? cleanUsername : name
        let cleanEmail = email.isEmpty ? "\(cleanUsername)@bipop.app" : email
        
        Task {
            do {
                let newProfile = UserProfile(
                    id: "",
                    email: cleanEmail,
                    username: cleanUsername,
                    name: cleanName,
                    emoji: "",
                    pairCode: String(UUID().uuidString.prefix(6).uppercased())
                )
                let user = try await APIService.shared.saveUserProfile(newProfile)
                await MainActor.run {
                    state.userProfile = user
                    state.isLoggedIn = true
                    isLoading = false
                    HapticManager.shared.playSuccess()
                }
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                    isLoading = false
                    HapticManager.shared.playError()
                }
            }
        }
    }
    
    private func handleLogin() {
        hideKeyboard()
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                let user = try await APIService.shared.loginUser(
                    identifier: loginIdentifier
                )
                await MainActor.run {
                    state.userProfile = user
                    state.isLoggedIn = true
                    isLoading = false
                    HapticManager.shared.playSuccess()
                }
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                    isLoading = false
                    HapticManager.shared.playError()
                }
            }
        }
    }
}
