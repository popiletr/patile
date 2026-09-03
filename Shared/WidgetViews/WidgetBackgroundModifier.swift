import SwiftUI
import WidgetKit

extension View {
    @ViewBuilder
    public func widgetBackgroundCompat<Background: View>(@ViewBuilder _ backgroundView: () -> Background) -> some View {
        #if canImport(WidgetKit)
        if #available(iOSApplicationExtension 17.0, iOS 17.0, *) {
            self.containerBackground(for: .widget) {
                backgroundView()
            }
        } else {
            self.background(backgroundView())
        }
        #else
        self.background(backgroundView())
        #endif
    }
}
