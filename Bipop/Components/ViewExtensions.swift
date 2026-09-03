import SwiftUI
import UIKit

// MARK: - Keyboard Dismiss Helper for Main App
public extension View {
    func hideKeyboard() {
        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    }
    
    func dismissKeyboardOnTap() -> some View {
        self.onTapGesture {
            self.hideKeyboard()
        }
    }
}

// MARK: - Keyboard Done Toolbar Modifier
public struct KeyboardDoneToolbar: ViewModifier {
    public func body(content: Content) -> some View {
        content
            .toolbar {
                ToolbarItemGroup(placement: .keyboard) {
                    Spacer()
                    Button("Tamam") {
                        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
                    }
                    .font(.system(size: 15, weight: .bold, design: .rounded))
                    .foregroundColor(Color(hex: "#FF007F"))
                }
            }
    }
}

public extension View {
    func withKeyboardDoneButton() -> some View {
        self.modifier(KeyboardDoneToolbar())
    }
}
