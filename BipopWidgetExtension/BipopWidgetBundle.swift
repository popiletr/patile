import WidgetKit
import SwiftUI

@main
struct BipopWidgetBundle: WidgetBundle {
    var body: some Widget {
        BipopWidget()
        PetWidget()
    }
}
