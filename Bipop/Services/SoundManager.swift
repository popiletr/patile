import Foundation
import AudioToolbox
import AVFoundation

public final class SoundManager {
    public static let shared = SoundManager()
    
    private init() {}
    
    /// Signature Pop audio chime
    public func playPopSound() {
        // System Sound 1104 is keyboard pop or 1057 (Tink)
        AudioServicesPlaySystemSound(1104)
    }
    
    /// Sparkle / Success audio chime
    public func playSuccessSound() {
        AudioServicesPlaySystemSound(1025)
    }
}
