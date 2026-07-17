import SwiftUI

enum AppFont {
    static func display(_ size: CGFloat) -> Font {
        .custom("CSClaireMono-Regular", size: size, relativeTo: .largeTitle)
    }

    static func body(_ size: CGFloat = 17) -> Font {
        .custom("NeueMontreal-Regular", size: size, relativeTo: .body)
    }

    static func light(_ size: CGFloat = 17) -> Font {
        .custom("NeueMontreal-Light", size: size, relativeTo: .body)
    }
}

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
            .font(.system(.caption2, design: .monospaced, weight: .black))
            .tracking(1)
            .lineLimit(2)
            .fixedSize(horizontal: false, vertical: true)
            .padding(.horizontal, 10)
            .padding(.vertical, 7)
            .background(colour)
            .overlay(Rectangle().stroke(AppColour.ink, lineWidth: 2))
            .hardBackingPlate(x: 3, y: 3)
    }
}

struct HardButton: ButtonStyle {
    var colour: Color = AppColour.ink
    var foreground: Color = .white

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(AppFont.body(15).weight(.bold))
            .textCase(.uppercase)
            .frame(maxWidth: .infinity, minHeight: 50)
            .padding(.horizontal, 14)
            .foregroundStyle(foreground)
            .background(colour)
            .overlay(Rectangle().stroke(AppColour.ink, lineWidth: 2))
            .hardBackingPlate(
                x: configuration.isPressed ? 2 : 5,
                y: configuration.isPressed ? 2 : 5
            )
            // Reserve layout space for the backing plate so cards and the
            // iPhone safe-area clip do not shear the button's bottom edge.
            .padding(.trailing, 5)
            .padding(.bottom, 5)
            .offset(x: configuration.isPressed ? 3 : 0, y: configuration.isPressed ? 3 : 0)
            .animation(.snappy(duration: 0.18), value: configuration.isPressed)
    }
}

struct ManualPanel: View {
    let place: String
    let check: String
    let avoid: String

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Label("Matching assembly panel", systemImage: "book.pages.fill")
                .font(AppFont.body(13).weight(.bold))
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
        .hardBackingPlate(x: 5, y: 5)
        .accessibilityElement(children: .contain)
    }
}

private struct ManualRow: View {
    let label: String
    let value: String
    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(label.uppercased()).font(.system(.caption2, design: .monospaced, weight: .black)).foregroundStyle(.secondary)
            Text(value).font(AppFont.body(15).weight(.semibold))
        }.frame(maxWidth: .infinity, alignment: .leading).padding(12)
    }
}

struct Panel<Content: View>: View {
    let title: String
    let part: String
    @ViewBuilder let content: Content
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var assembled = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                PartLabel(text: part, colour: AppColour.yellow)
                    .opacity(assembled ? 1 : 0)
                    .offset(y: assembled ? 0 : 10)
                Text(title.uppercased())
                    .font(AppFont.display(34).weight(.bold))
                    .tracking(-1.2)
                    .lineSpacing(2)
                    .fixedSize(horizontal: false, vertical: true)
                    .accessibilityAddTraits(.isHeader)
                    .opacity(assembled ? 1 : 0)
                    .offset(y: assembled ? 0 : 14)
                content
                    .opacity(assembled ? 1 : 0)
                    .offset(y: assembled ? 0 : 18)
            }
            .frame(maxWidth: 820, alignment: .leading)
            .padding(.horizontal, 24)
            .padding(.top, 28)
            .padding(.bottom, 96)
        }
        .background(AppColour.paper)
        .safeAreaPadding(.bottom, 12)
        .navigationTitle(title.replacingOccurrences(of: "\n", with: " "))
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            if reduceMotion {
                assembled = true
            } else {
                withAnimation(.spring(duration: 0.55, bounce: 0.12)) {
                    assembled = true
                }
            }
        }
        .onDisappear { assembled = false }
    }
}

private extension View {
    func hardBackingPlate(x: CGFloat, y: CGFloat) -> some View {
        background {
            Rectangle()
                .fill(AppColour.ink)
                .offset(x: x, y: y)
                .accessibilityHidden(true)
        }
    }
}

struct ChromeDog: View {
    var body: some View {
        Canvas { context, size in
            let gradient = Gradient(colors: [
                .white,
                Color(red: 0.16, green: 0.86, blue: 1),
                Color(red: 0.03, green: 0.42, blue: 0.95),
                Color(red: 0.27, green: 0.86, blue: 1),
                Color(red: 0.02, green: 0.15, blue: 0.42),
            ])
            let stroke = max(2.2, min(size.width, size.height) * 0.012)

            func balloon(
                x: CGFloat,
                y: CGFloat,
                width: CGFloat,
                height: CGFloat,
                rotation: CGFloat = 0
            ) {
                let localRect = CGRect(
                    x: -size.width * width / 2,
                    y: -size.height * height / 2,
                    width: size.width * width,
                    height: size.height * height
                )
                let transform = CGAffineTransform(
                    translationX: size.width * x,
                    y: size.height * y
                ).rotated(by: rotation * .pi / 180)
                let path = Path(ellipseIn: localRect).applying(transform)
                let bounds = path.boundingRect
                context.fill(
                    path,
                    with: .linearGradient(
                        gradient,
                        startPoint: CGPoint(x: bounds.minX, y: bounds.minY),
                        endPoint: CGPoint(x: bounds.maxX, y: bounds.maxY)
                    )
                )
                context.stroke(path, with: .color(.black), lineWidth: stroke)
            }

            // Tail and legs sit behind the body so every joint reads as connected.
            balloon(x: 0.84, y: 0.34, width: 0.10, height: 0.31, rotation: 18)
            balloon(x: 0.76, y: 0.75, width: 0.11, height: 0.36, rotation: -8)
            balloon(x: 0.84, y: 0.76, width: 0.12, height: 0.38, rotation: -10)
            balloon(x: 0.41, y: 0.75, width: 0.11, height: 0.36, rotation: 8)
            balloon(x: 0.49, y: 0.76, width: 0.12, height: 0.38, rotation: 10)
            balloon(x: 0.60, y: 0.55, width: 0.37, height: 0.18)

            // The missing neck fastener: a short vertical balloon plus collar knot.
            balloon(x: 0.40, y: 0.43, width: 0.11, height: 0.23, rotation: -12)
            balloon(x: 0.43, y: 0.53, width: 0.055, height: 0.055)
            balloon(x: 0.79, y: 0.55, width: 0.055, height: 0.055)

            // Complete head assembly from the owner's canonical reference.
            balloon(x: 0.31, y: 0.15, width: 0.12, height: 0.27, rotation: -10)
            balloon(x: 0.41, y: 0.15, width: 0.13, height: 0.28, rotation: 13)
            balloon(x: 0.37, y: 0.29, width: 0.15, height: 0.27, rotation: 5)
            balloon(x: 0.24, y: 0.33, width: 0.27, height: 0.16, rotation: -5)
            balloon(x: 0.105, y: 0.33, width: 0.045, height: 0.075)
            balloon(x: 0.125, y: 0.33, width: 0.035, height: 0.055)

            // Small tied ends make the silhouette unmistakably balloon-built.
            balloon(x: 0.40, y: 0.94, width: 0.07, height: 0.035)
            balloon(x: 0.50, y: 0.95, width: 0.07, height: 0.035)
            balloon(x: 0.76, y: 0.94, width: 0.07, height: 0.035)
            balloon(x: 0.86, y: 0.95, width: 0.07, height: 0.035)

            var tailTip = Path()
            tailTip.move(to: CGPoint(x: size.width * 0.87, y: size.height * 0.18))
            tailTip.addLine(to: CGPoint(x: size.width * 0.90, y: size.height * 0.08))
            context.stroke(
                tailTip,
                with: .linearGradient(
                    gradient,
                    startPoint: CGPoint(x: size.width * 0.87, y: size.height * 0.18),
                    endPoint: CGPoint(x: size.width * 0.90, y: size.height * 0.08)
                ),
                lineWidth: stroke * 1.2
            )
            context.stroke(tailTip, with: .color(.black), lineWidth: stroke * 0.35)
        }
        .accessibilityLabel("Chrome-blue balloon dog, finished-build marker")
    }
}
