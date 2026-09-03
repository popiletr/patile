import SwiftUI
import UserNotifications
#if canImport(WidgetKit)
import WidgetKit
#endif

// MARK: - App Delegate for Push Notifications & Background Fetch
public class AppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    public func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil
    ) -> Bool {
        // Zero Disk Cache Policy (Reclaims 1GB+ cache storage)
        URLCache.shared.removeAllCachedResponses()
        URLCache.shared.diskCapacity = 0
        URLCache.shared.memoryCapacity = 0
        
        // Register for Push Notifications
        UNUserNotificationCenter.current().delegate = self
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            if granted {
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
        }
        return true
    }
    
    // APNs Device Token Registration
    public func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let tokenParts = deviceToken.map { data in String(format: "%02.2hhx", data) }
        let token = tokenParts.joined()
        print("B!Pop APNs Token: \(token)")
        // Token stored locally for future push integration
    }
    
    // Silent Push Notification (Background Fetch for WidgetKit reload)
    public func application(
        _ application: UIApplication,
        didReceiveRemoteNotification userInfo: [AnyHashable : Any],
        fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
    ) {
        print("B!Pop: Silent Push received with userInfo: \(userInfo)")
        
        // If push contains raw pop json in "pop_payload"
        if let popString = userInfo["pop_payload"] as? String,
           let data = popString.data(using: .utf8),
           let pop = try? JSONDecoder().decode(PopItem.self, from: data) {
            SharedStorage.shared.saveLatestInboxPop(pop)
            completionHandler(.newData)
            return
        }
        
        // Or fetch latest drop for user
        let profile = SharedStorage.shared.getUserProfile()
        Task {
            let inbox = await APIService.shared.fetchInboxFeed(userId: profile.id)
            if let latest = inbox.first {
                SharedStorage.shared.saveLatestInboxPop(latest)
            }
            SharedStorage.shared.reloadWidgets()
            completionHandler(.newData)
        }
    }
}

// MARK: - Main SwiftUI App
@main
struct BipopApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @StateObject private var appState = AppState()
    
    var body: some Scene {
        WindowGroup {
            MainTabView()
                .environmentObject(appState)
                .preferredColorScheme(.dark)
                .onOpenURL { url in
                    handleDeepLink(url)
                }
                .onReceive(NotificationCenter.default.publisher(for: UIApplication.willEnterForegroundNotification)) { _ in
                    Task {
                        await appState.syncWithServer()
                    }
                }
        }
    }
    
    private func handleDeepLink(_ url: URL) {
        print("B!Pop: Opened via deep link: \(url)")
        
        // Check if Spotify track deep link
        if url.scheme == "spotify" || url.absoluteString.contains("open.spotify.com") {
            let trackId = url.absoluteString.replacingOccurrences(of: "spotify:track:", with: "").components(separatedBy: "/").last ?? ""
            let nativeSpotifyURL = URL(string: "spotify:track:\(trackId)")
            let webSpotifyURL = URL(string: "https://open.spotify.com/track/\(trackId)")
            
            if let native = nativeSpotifyURL, UIApplication.shared.canOpenURL(native) {
                UIApplication.shared.open(native, options: [:], completionHandler: nil)
            } else if let web = webSpotifyURL {
                UIApplication.shared.open(web, options: [:], completionHandler: nil)
            }
            return
        }
        
        if url.host == "pair" {
            appState.selectedTab = .pair
        } else if url.host == "studio" {
            appState.selectedTab = .studio
        }
    }
}
