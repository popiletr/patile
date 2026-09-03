import SwiftUI
import WidgetKit

// MARK: - Lock Screen Rectangular
public struct LockRectangularView: View {
    public let pop: PopItem

    public init(pop: PopItem) {
        self.pop = pop
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack(spacing: 4) {
                Text(pop.senderInitials)
                    .font(.system(size: 9, weight: .black))
                Text(pop.senderName)
                    .font(.system(size: 11, weight: .bold))
                Spacer()
                Image(systemName: "note.text")
                    .font(.system(size: 10))
            }

            let note = pop.notePayload?.text ?? ""
            if !note.isEmpty {
                Text(note)
                    .font(.system(size: 12, weight: .semibold))
                    .lineLimit(2)
            }
        }
    }
}

// MARK: - Lock Screen Circular
public struct LockCircularView: View {
    public let pop: PopItem

    public init(pop: PopItem) {
        self.pop = pop
    }

    public var body: some View {
        ZStack {
            #if canImport(WidgetKit)
            if #available(iOSApplicationExtension 16.0, iOS 16.0, *) {
                AccessoryWidgetBackground()
            }
            #endif

            VStack(spacing: 1) {
                Image(systemName: "note.text")
                    .font(.system(size: 16, weight: .bold))

                Text(pop.senderInitials)
                    .font(.system(size: 10, weight: .heavy, design: .rounded))
                    .lineLimit(1)
            }
        }
    }
}

// MARK: - Lock Screen Inline
public struct LockInlineView: View {
    public let pop: PopItem

    public init(pop: PopItem) {
        self.pop = pop
    }

    public var body: some View {
        let text = pop.notePayload?.text ?? "Yeni B!Pop"
        Label("\(pop.senderName): \(text)", systemImage: "note.text")
    }
}
