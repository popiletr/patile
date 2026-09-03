import SwiftUI
import UIKit

public final class HapticManager {
    public static let shared = HapticManager()
    
    private let lightImpact = UIImpactFeedbackGenerator(style: .light)
    private let mediumImpact = UIImpactFeedbackGenerator(style: .medium)
    private let heavyImpact = UIImpactFeedbackGenerator(style: .heavy)
    private let rigidImpact = UIImpactFeedbackGenerator(style: .rigid)
    private let notification = UINotificationFeedbackGenerator()
    
    private init() {
        lightImpact.prepare()
        mediumImpact.prepare()
        heavyImpact.prepare()
        rigidImpact.prepare()
        notification.prepare()
    }
    
    /// Signature "B!Pop" send feedback: double burst
    public func playPopBurst() {
        mediumImpact.impactOccurred()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.08) { [weak self] in
            self?.heavyImpact.impactOccurred(intensity: 1.0)
        }
    }
    
    /// Drawing tick when painting on pixel canvas
    public func playPixelTick() {
        lightImpact.impactOccurred(intensity: 0.4)
    }
    
    /// Success confirmation
    public func playSuccess() {
        notification.notificationOccurred(.success)
    }
    
    /// Error warning
    public func playError() {
        notification.notificationOccurred(.error)
    }
    
    /// Selection change
    public func playSelection() {
        UISelectionFeedbackGenerator().selectionChanged()
    }
}
