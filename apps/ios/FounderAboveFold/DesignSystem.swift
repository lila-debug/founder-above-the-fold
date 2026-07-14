import SwiftUI

enum AppColour {
    static let paper = Color(red: 0.97, green: 0.94, blue: 0.86)
    static let yellow = Color(red: 0.96, green: 0.82, blue: 0.24)
    static let orange = Color(red: 0.94, green: 0.35, blue: 0.16)
    static let teal = Color(red: 0.29, green: 0.66, blue: 0.58)
    static let blue = Color(red: 0.15, green: 0.77, blue: 0.93)
    static let red = Color(red: 0.80, green: 0.24, blue: 0.30)
    static let ink = Color.black
}

struct PartLabel: View {
    let text: String
    var colour: Color = .white

    var body: some View {
        Text(text.uppercased())
            .font(.caption2.weight(.black).monospaced())
            .tracking(1)
            .padding(.horizontal, 10)
            .padding(.vertical, 7)
            .background(colour)
            .overlay(Rectangle().stroke(AppColour.ink, lineWidth: 2))
            .shadow(color: .black, radius: 0, x: 3, y: 3)
    }
}

struct HardButton: ButtonStyle {
    var colour: Color = AppColour.ink
    var foreground: Color = .white

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.subheadline.weight(.black))
            .textCase(.uppercase)
            .frame(maxWidth: .infinity, minHeight: 50)
            .padding(.horizontal, 14)
            .foregroundStyle(foreground)
            .background(colour)
            .overlay(Rectangle().stroke(AppColour.ink, lineWidth: 2))
            .shadow(color: .black, radius: 0, x: configuration.isPressed ? 2 : 5, y: configuration.isPressed ? 2 : 5)
            .offset(x: configuration.isPressed ? 3 : 0, y: configuration.isPressed ? 3 : 0)
    }
}

struct ManualPanel: View {
    let place: String
    let check: String
    let avoid: String

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Label("Matching assembly panel", systemImage: "book.pages.fill")
                .font(.caption.weight(.black))
                .textCase(.uppercase)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(12)
                .background(AppColour.yellow)
            Divider().overlay(.black).frame(height: 2)
            ManualRow(label: "Place", value: place)
            Divider().overlay(.black.opacity(0.3))
            ManualRow(label: "Check", value: check)
            Divider().overlay(.black.opacity(0.3))
            ManualRow(label: "Avoid", value: avoid)
        }
        .background(.white)
        .overlay(Rectangle().stroke(.black, lineWidth: 2))
        .shadow(color: .black, radius: 0, x: 5, y: 5)
        .accessibilityElement(children: .contain)
    }
}

private struct ManualRow: View {
    let label: String
    let value: String
    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(label.uppercased()).font(.caption2.weight(.black).monospaced()).foregroundStyle(.secondary)
            Text(value).font(.subheadline.weight(.bold))
        }.frame(maxWidth: .infinity, alignment: .leading).padding(12)
    }
}

struct Panel<Content: View>: View {
    let title: String
    let part: String
    @ViewBuilder let content: Content

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                PartLabel(text: part, colour: AppColour.yellow)
                Text(title.uppercased())
                    .font(.system(.largeTitle, design: .rounded, weight: .black))
                    .tracking(-1.8)
                    .accessibilityAddTraits(.isHeader)
                content
            }
            .frame(maxWidth: 820, alignment: .leading)
            .padding(20)
            .padding(.bottom, 40)
        }
        .background(AppColour.paper)
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct ChromeDog: View {
    var body: some View {
        Canvas { context, size in
            let gradient = Gradient(colors: [.white, AppColour.blue, Color.blue, AppColour.blue, Color(red: 0.02, green: 0.15, blue: 0.42)])
            func balloon(_ rect: CGRect, rotation: Angle = .zero) {
                context.drawLayer { layer in
                    layer.rotate(by: rotation)
                    layer.fill(Path(ellipseIn: rect), with: .linearGradient(gradient, startPoint: rect.origin, endPoint: CGPoint(x: rect.maxX, y: rect.maxY)))
                    layer.stroke(Path(ellipseIn: rect), with: .color(.black), lineWidth: 3)
                }
            }
            balloon(CGRect(x: size.width*0.15, y: size.height*0.14, width: size.width*0.36, height: size.height*0.18), rotation: .degrees(-12))
            balloon(CGRect(x: size.width*0.37, y: size.height*0.35, width: size.width*0.38, height: size.height*0.18))
            balloon(CGRect(x: size.width*0.27, y: size.height*0.45, width: size.width*0.18, height: size.height*0.45), rotation: .degrees(7))
            balloon(CGRect(x: size.width*0.60, y: size.height*0.46, width: size.width*0.18, height: size.height*0.45), rotation: .degrees(-7))
            balloon(CGRect(x: size.width*0.68, y: size.height*0.12, width: size.width*0.15, height: size.height*0.32))
        }
        .accessibilityLabel("Chrome-blue balloon dog, finished-build marker")
    }
}
