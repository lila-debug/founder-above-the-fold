// swift-tools-version: 6.2
import PackageDescription

let package = Package(
    name: "FounderAboveFoldMac",
    platforms: [.macOS(.v14)],
    products: [
        .executable(name: "FounderAboveFoldMac", targets: ["FounderAboveFoldMac"]),
    ],
    targets: [
        .executableTarget(
            name: "FounderAboveFoldMac",
            resources: [.process("Resources")]
        ),
    ]
)
