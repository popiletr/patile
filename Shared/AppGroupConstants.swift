import Foundation

public enum AppGroupConstants {
    /// App Group Identifier shared between main app and widget extensions
    public static let appGroupId = "group.com.bipop.app"
    
    // UserDefaults Keys
    public static let keyLatestPop = "bipop_latest_pop"
    public static let keyPopHistory = "bipop_pop_history"
    public static let keyOutboxHistory = "bipop_outbox_history"
    public static let keyUserProfile = "bipop_user_profile"
    public static let keyPairInfo = "bipop_pair_info"
    public static let keyFriendsList = "bipop_friends_list"
    public static let keyPendingRequests = "bipop_pending_requests"
    public static let keyWidgetSettings = "bipop_widget_settings"
    public static let keyServerURL = "bipop_server_url"
    
    // Default Backend URL (Local Wi-Fi IP for physical iPhone testing)
    public static let defaultServerURL = "http://192.168.1.104:3000"
    
    // Deep Link Schemes
    public static let appScheme = "bipop://"
    public static let spotifyDeepLinkPrefix = "spotify:track:"
}
