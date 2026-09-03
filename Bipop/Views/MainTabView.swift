import SwiftUI

public struct MainTabView: View {
    @EnvironmentObject var state: AppState
    
    public var body: some View {
        Group {
            if !state.isLoggedIn {
                AuthView()
                    .transition(.opacity.combined(with: .scale(scale: 0.95)))
            } else {
                authenticatedMainView
                    .transition(.opacity)
            }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.8), value: state.isLoggedIn)
    }
    
    private var authenticatedMainView: some View {
        ZStack(alignment: .bottom) {
            // Main Content Views
            TabView(selection: $state.selectedTab) {
                StudioView()
                    .tag(TabSelection.studio)
                
                GamesHubView()
                    .tag(TabSelection.games)
                
                PopHistoryView()
                    .tag(TabSelection.feed)
                
                PairingView()
                    .tag(TabSelection.pair)
                
                WidgetGuideView()
                    .tag(TabSelection.widgets)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .ignoresSafeArea(.keyboard, edges: .bottom)
            
            // Custom Glassmorphic Floating Tab Bar
            customTabBar
                .padding(.horizontal, 20)
                .padding(.bottom, 12)
        }
        .ignoresSafeArea(.keyboard)
    }
    
    private var customTabBar: some View {
        HStack {
            ForEach(TabSelection.allCases, id: \.self) { tab in
                let isSelected = state.selectedTab == tab
                
                Button(action: {
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) {
                        state.selectedTab = tab
                    }
                    HapticManager.shared.playSelection()
                }) {
                    VStack(spacing: 4) {
                        ZStack(alignment: .topTrailing) {
                            Image(systemName: tab.iconName)
                                .font(.system(size: 18, weight: isSelected ? .bold : .medium))
                                .foregroundColor(isSelected ? Color(hex: "#FF007F") : .white.opacity(0.5))
                                .scaleEffect(isSelected ? 1.15 : 1.0)
                            
                            // Badge for Pending Pair Requests
                            if tab == .pair && !state.pendingRequests.isEmpty {
                                Text("\(state.pendingRequests.count)")
                                    .font(.system(size: 9, weight: .black))
                                    .foregroundColor(.white)
                                    .frame(width: 16, height: 16)
                                    .background(Color(hex: "#FF007F"))
                                    .clipShape(Circle())
                                    .offset(x: 10, y: -8)
                                    .shadow(color: Color(hex: "#FF007F").opacity(0.8), radius: 4)
                            }
                        }
                        .frame(height: 22)
                        
                        Text(tab.rawValue)
                            .font(.system(size: 10, weight: isSelected ? .bold : .medium, design: .rounded))
                            .foregroundColor(isSelected ? .white : .white.opacity(0.5))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                }
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 4)
        .background(
            RoundedRectangle(cornerRadius: 26, style: .continuous)
                .fill(.ultraThinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: 26, style: .continuous)
                        .stroke(
                            LinearGradient(
                                colors: [Color.white.opacity(0.25), Color.clear],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 1
                        )
                )
                .shadow(color: .black.opacity(0.5), radius: 16, x: 0, y: 6)
        )
    }
}
