import UIKit
import Capacitor
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // UNUserNotificationCenter delegasyonunu kur - arka plan ve kilit ekranı bildirimlerini yönetir
        UNUserNotificationCenter.current().delegate = self

        // Uygulama açılışında ikon üzerindeki bildirim rozetini sıfırla ve bildirim merkezini temizle
        DispatchQueue.main.async {
            application.applicationIconBadgeNumber = 0
            if #available(iOS 16.0, *) {
                UNUserNotificationCenter.current().setBadgeCount(0, withCompletionHandler: nil)
            }
            UNUserNotificationCenter.current().removeAllDeliveredNotifications()
        }
        return true
    }

    // Uygulama acikken veya askidayken gelen bildirimleri yonet
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        // Yalnizca test bildirimi ise on planda goster
        if notification.request.identifier.contains("test") {
            if #available(iOS 14.0, *) {
                completionHandler([.banner, .sound])
            } else {
                completionHandler([.alert, .sound])
            }
        } else {
            // Kullanici zaten oyunun icindeyken bakim bildirimleri tepeden dusup rahatsiz etmesin
            completionHandler([])
        }
    }

    // Kullanıcı kilit ekranında veya bildirim merkezinde bir bildirime dokunduğunda rozeti sıfırla
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        DispatchQueue.main.async {
            UIApplication.shared.applicationIconBadgeNumber = 0
            if #available(iOS 16.0, *) {
                UNUserNotificationCenter.current().setBadgeCount(0, withCompletionHandler: nil)
            }
            center.removeAllDeliveredNotifications()
        }
        completionHandler()
    }

    func applicationWillResignActive(_ application: UIApplication) {
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Cihaz seviyesinde son kapanış zamanını UserDefaults'a kaydet (WebView kapansa bile kalır)
        UserDefaults.standard.set(Date().timeIntervalSince1970, forKey: "pati_last_exit_time")
        UserDefaults.standard.synchronize()
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Uygulamaya her dönüldüğünde ikondaki rozeti kesin olarak sıfırla
        DispatchQueue.main.async {
            application.applicationIconBadgeNumber = 0
            if #available(iOS 16.0, *) {
                UNUserNotificationCenter.current().setBadgeCount(0, withCompletionHandler: nil)
            }
            UNUserNotificationCenter.current().removeAllDeliveredNotifications()
        }
    }

    func applicationWillTerminate(_ application: UIApplication) {
        UserDefaults.standard.set(Date().timeIntervalSince1970, forKey: "pati_last_exit_time")
        UserDefaults.standard.synchronize()
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}

import GameKit
import CryptoKit

@objc(ViewController)
public class ViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        super.capacitorDidLoad()
        bridge?.registerPluginInstance(GameCenterAndCloudPlugin())
        bridge?.registerPluginInstance(NativeNotificationPlugin())
        print("[NativePlugins] GameCenterAndCloud ve NativeNotification basariyla kaydedildi!")
    }
}

@objc(GameCenterAndCloudPlugin)
public class GameCenterAndCloudPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "GameCenterAndCloudPlugin"
    public let jsName = "GameCenterAndCloud"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "signIn", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "saveToCloud", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "loadFromCloud", returnType: CAPPluginReturnPromise)
    ]
    private var observations: [NSObjectProtocol] = []
    private var receivedInitialSync = false
    private var quotaExceeded = false
    private var pendingReads: [CAPPluginCall] = []
    private var accountID: String {
        guard let token = FileManager.default.ubiquityIdentityToken,
              let bytes = try? NSKeyedArchiver.archivedData(withRootObject: token, requiringSecureCoding: false) else { return "" }
        return SHA256.hash(data: bytes).map { String(format: "%02x", $0) }.joined()
    }
    public override func load() {
        let center = NotificationCenter.default
        observations.append(center.addObserver(forName: NSUbiquitousKeyValueStore.didChangeExternallyNotification, object: NSUbiquitousKeyValueStore.default, queue: .main) { [weak self] note in
            guard let self = self else { return }
            let reason = note.userInfo?[NSUbiquitousKeyValueStoreChangeReasonKey] as? Int ?? 0
            self.quotaExceeded = reason == NSUbiquitousKeyValueStoreQuotaViolationChange
            if reason != NSUbiquitousKeyValueStoreQuotaViolationChange { self.receivedInitialSync = true }
            for call in self.pendingReads { self.resolveRead(call) }
            self.pendingReads.removeAll()
            self.notifyListeners("cloudChanged", data: ["reason": reason, "accountId": self.accountID, "quotaExceeded": self.quotaExceeded])
        })
        observations.append(center.addObserver(forName: NSNotification.Name.NSUbiquityIdentityDidChange, object: nil, queue: .main) { [weak self] _ in
            self?.receivedInitialSync = false
            self?.notifyListeners("cloudChanged", data: ["accountChanged": true])
        })
        NSUbiquitousKeyValueStore.default.synchronize()
    }
    deinit { for observation in observations { NotificationCenter.default.removeObserver(observation) } }
    @objc func signIn(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let player = GKLocalPlayer.local
            if player.isAuthenticated { call.resolve(["authenticated": true, "alias": player.alias, "cloudAvailable": !self.accountID.isEmpty]); return }
            var completed = false
            player.authenticateHandler = { [weak self] controller, error in
                guard !completed else { return }
                if let controller = controller, !call.getBool("silent", false) {
                    self?.bridge?.viewController?.present(controller, animated: true)
                } else {
                    completed = true
                    call.resolve(["authenticated": player.isAuthenticated, "alias": player.isAuthenticated ? player.alias : "", "cloudAvailable": !(self?.accountID.isEmpty ?? true), "supported": true])
                }
            }
        }
    }
    private func revision(_ value: String?) -> String? {
        guard let value = value, let data = value.data(using: .utf8), let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return nil }
        if let revision = json["revision"] as? String { return revision }
        if let time = json["saveTime"] as? NSNumber { return "legacy-\(time.stringValue)" }
        return nil
    }
    @objc func saveToCloud(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let key = call.getString("key"), key == "patilife_save_data", let value = call.getString("value"), let data = value.data(using: .utf8), (try? JSONSerialization.jsonObject(with: data)) != nil else { call.reject("Invalid game save"); return }
            guard !self.accountID.isEmpty else { call.reject("Sign in to iCloud to synchronize"); return }
            guard data.count < 950000 else { call.reject("Cloud save is too large; local progress is safe"); return }
            let store = NSUbiquitousKeyValueStore.default
            let current = store.string(forKey: key)
            if let current = current, self.revision(current) != call.getString("expectedRevision") {
                call.resolve(["success": false, "conflict": true, "value": current]); return
            }
            let defaults = UserDefaults.standard
            if let previous = defaults.string(forKey: key) { defaults.set(previous, forKey: key + "_previous") }
            defaults.set(value, forKey: key)
            defaults.set(self.accountID, forKey: key + "_account")
            store.set(value, forKey: key)
            let requested = store.synchronize()
            self.receivedInitialSync = true
            call.resolve(["success": true, "localSaved": true, "cloudAvailable": true, "syncRequested": requested, "remoteConfirmed": false])
        }
    }
    private func resolveRead(_ call: CAPPluginCall) {
        let key = "patilife_save_data", store = NSUbiquitousKeyValueStore.default, defaults = UserDefaults.standard
        let cloud = store.string(forKey: key) ?? ""
        let savedAccount = defaults.string(forKey: key + "_account")
        let local = savedAccount == nil || savedAccount == accountID ? defaults.string(forKey: key) ?? "" : ""
        let ready = !cloud.isEmpty || receivedInitialSync
        call.resolve(["value": cloud, "localValue": local, "ready": ready, "pending": !ready, "cloudAvailable": !accountID.isEmpty, "accountId": accountID, "quotaExceeded": quotaExceeded, "source": cloud.isEmpty ? "icloud_pending" : "icloud"])
    }
    @objc func loadFromCloud(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard call.getString("key") == "patilife_save_data" else { call.reject("Invalid save key"); return }
            guard !self.accountID.isEmpty else { call.reject("iCloud is not signed in"); return }
            NSUbiquitousKeyValueStore.default.synchronize()
            if call.getBool("confirmEmpty", false) { self.receivedInitialSync = true }
            if self.receivedInitialSync || NSUbiquitousKeyValueStore.default.string(forKey: "patilife_save_data") != nil { self.resolveRead(call); return }
            self.pendingReads.append(call)
            DispatchQueue.main.asyncAfter(deadline: .now() + 8) { [weak self] in
                guard let self = self, let index = self.pendingReads.firstIndex(where: { $0 === call }) else { return }
                self.pendingReads.remove(at: index); self.resolveRead(call)
            }
        }
    }
}

@objc(NativeNotificationPlugin)
public class NativeNotificationPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NativeNotificationPlugin"
    public let jsName = "NativeNotification"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "requestPermission", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "checkPermission", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "scheduleNotification", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancelNotifications", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "sendTestNotification", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearBadge", returnType: CAPPluginReturnPromise)
    ]

    @objc func clearBadge(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            UIApplication.shared.applicationIconBadgeNumber = 0
            if #available(iOS 16.0, *) {
                UNUserNotificationCenter.current().setBadgeCount(0, withCompletionHandler: nil)
            }
            UNUserNotificationCenter.current().removeAllDeliveredNotifications()
            print("[NativeNotification] Uygulama ikonu rozeti sifirlandi ve bildirimler temizlendi.")
            call.resolve(["success": true])
        }
    }

    @objc func requestPermission(_ call: CAPPluginCall) {
        let center = UNUserNotificationCenter.current()
        center.requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            DispatchQueue.main.async {
                print("[NativeNotification] Izin isteme sonucu: \(granted)")
                call.resolve([
                    "granted": granted,
                    "status": granted ? "authorized" : "denied"
                ])
            }
        }
    }

    @objc func checkPermission(_ call: CAPPluginCall) {
        let center = UNUserNotificationCenter.current()
        center.getNotificationSettings { settings in
            let granted = (settings.authorizationStatus == .authorized || settings.authorizationStatus == .provisional || settings.authorizationStatus == .ephemeral)
            var statusStr = "notDetermined"
            switch settings.authorizationStatus {
            case .authorized: statusStr = "authorized"
            case .denied: statusStr = "denied"
            case .provisional: statusStr = "provisional"
            case .ephemeral: statusStr = "ephemeral"
            case .notDetermined: statusStr = "notDetermined"
            @unknown default: statusStr = "unknown"
            }
            DispatchQueue.main.async {
                call.resolve([
                    "granted": granted,
                    "status": statusStr
                ])
            }
        }
    }

    @objc func scheduleNotification(_ call: CAPPluginCall) {
        guard let id = call.getInt("id"),
              let title = call.getString("title"),
              let body = call.getString("body"),
              let delaySeconds = call.getDouble("delaySeconds") else {
            call.reject("Eksik bildirim parametresi")
            return
        }

        let identifier = "pati_care_\(id)"
        let center = UNUserNotificationCenter.current()
        center.removePendingNotificationRequests(withIdentifiers: [identifier])

        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = UNNotificationSound.default
        content.badge = 1

        let safeDelay = max(1.0, delaySeconds)
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: safeDelay, repeats: false)
        let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)

        center.add(request) { error in
            DispatchQueue.main.async {
                if let err = error {
                    print("[NativeNotification] Bildirim kurulamadi: \(err.localizedDescription)")
                    call.reject("Bildirim eklenemedi: \(err.localizedDescription)")
                } else {
                    print("[NativeNotification] Bildirim basariyla kuruldu: \(identifier), bekleme: \(safeDelay) sn")
                    call.resolve(["success": true, "id": id, "delay": safeDelay])
                }
            }
        }
    }

    @objc func cancelNotifications(_ call: CAPPluginCall) {
        let ids = call.getArray("ids", Int.self) ?? []
        let identifiers = ids.map { "pati_care_\($0)" }
        let center = UNUserNotificationCenter.current()
        center.removePendingNotificationRequests(withIdentifiers: identifiers)
        call.resolve(["success": true])
    }

    @objc func sendTestNotification(_ call: CAPPluginCall) {
        let delay = call.getDouble("delay") ?? 10.0
        let identifier = "pati_test_notif"
        let center = UNUserNotificationCenter.current()
        center.removePendingNotificationRequests(withIdentifiers: [identifier])

        let content = UNMutableNotificationContent()
        content.title = "PatiLife Test"
        content.body = "Miyav! Bildirimler ve ses sistemi kusursuz calisiyor."
        content.sound = UNNotificationSound.default
        content.badge = 1

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: max(1.0, delay), repeats: false)
        let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)

        center.add(request) { error in
            DispatchQueue.main.async {
                if let err = error {
                    call.reject("Test bildirimi kurulamadi: \(err.localizedDescription)")
                } else {
                    print("[NativeNotification] \(delay) saniyelik test bildirimi kuruldu.")
                    call.resolve(["success": true, "delay": delay])
                }
            }
        }
    }
}


