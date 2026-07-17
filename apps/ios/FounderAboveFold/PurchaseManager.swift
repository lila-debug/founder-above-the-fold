import Observation
import StoreKit

@MainActor
@Observable
final class PurchaseManager {
    static let productID = "com.founderabovethefold.license.v1"

    enum ProductLoadState: Equatable {
        case idle
        case loading
        case ready
        case unavailable
    }

    private(set) var product: Product?
    private(set) var productLoadState: ProductLoadState = .idle
    private(set) var isPurchased = false
    private(set) var isLoading = false
    private(set) var status = "Inspecting the Apple licence fastener."

    @ObservationIgnored
    private var updatesTask: Task<Void, Never>?

    init() {
        updatesTask = Task { [weak self] in
            for await result in Transaction.updates {
                guard let self else { return }
                await self.handleTransactionUpdate(result)
            }
        }
    }

    var displayPrice: String {
        if let product {
            return product.displayPrice
        }

        switch productLoadState {
        case .idle, .loading:
            return "Loading price…"
        case .ready, .unavailable:
            return "Price unavailable"
        }
    }

    var canPurchase: Bool {
        product != nil && !isLoading && !isPurchased
    }

    var canRetryProductLoad: Bool {
        productLoadState == .unavailable && !isLoading
    }

    func prepare() async {
        guard !isLoading else { return }
        isLoading = true
        if product == nil {
            productLoadState = .loading
        }
        defer { isLoading = false }

        #if DEBUG
        let hasTestEntitlement = ProcessInfo.processInfo.arguments.contains("--founder-test-entitlement")
        #endif

        do {
            product = try await Product.products(for: [Self.productID]).first
            productLoadState = product == nil ? .unavailable : .ready
            await refreshEntitlement()

            #if DEBUG
            if hasTestEntitlement {
                isPurchased = true
                status = product == nil
                    ? "Simulator licence fitted. The StoreKit test product still needs inspection."
                    : "Simulator-only test entitlement fitted. StoreKit price loaded."
            } else {
                updatePreparedStatus()
            }
            #else
            updatePreparedStatus()
            #endif
        } catch {
            product = nil
            productLoadState = .unavailable
            await refreshEntitlement()

            #if DEBUG
            if hasTestEntitlement {
                isPurchased = true
                status = "Simulator licence fitted. The StoreKit price failed to load; inspect the test product or retry."
            } else {
                status = "The App Store product could not be loaded. Try again or inspect the StoreKit setup."
            }
            #else
            status = "The App Store product could not be loaded. Try again or inspect the StoreKit setup."
            #endif
        }
    }

    func purchase() async -> Bool {
        guard let product else {
            status = "The licence product is unavailable. No payment was attempted."
            return false
        }

        isLoading = true
        defer { isLoading = false }

        do {
            switch try await product.purchase() {
            case .success(let result):
                let transaction = try requireVerified(result)
                guard transaction.productID == Self.productID else {
                    throw PurchaseValidationError.wrongProduct
                }
                await transaction.finish()
                await refreshEntitlement()
                status = isPurchased
                    ? "Purchase verified. The founder cabinet is unlocked."
                    : "Apple returned a transaction, but no current entitlement was found."
                return isPurchased
            case .pending:
                status = "Purchase is pending Apple approval. The cabinet remains locked."
            case .userCancelled:
                status = "Purchase cancelled. No charge was completed."
            @unknown default:
                status = "Apple returned an unknown purchase state. The cabinet remains locked."
            }
        } catch {
            status = "Purchase was not verified. The cabinet remains locked."
        }

        return false
    }

    func restore() async -> Bool {
        isLoading = true
        defer { isLoading = false }

        do {
            try await AppStore.sync()
            await refreshEntitlement()
            status = isPurchased
                ? "Verified licence restored from the Apple ID."
                : "Apple found no current Founder Above the Fold licence."
        } catch {
            status = "Restore did not complete. No local entitlement was changed."
        }

        return isPurchased
    }

    private func refreshEntitlement() async {
        var entitled = false

        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result else { continue }
            if transaction.productID == Self.productID && transaction.revocationDate == nil {
                entitled = true
            }
        }

        isPurchased = entitled
    }

    private func updatePreparedStatus() {
        if isPurchased {
            status = "Verified Apple entitlement fitted."
        } else if product == nil {
            status = "The licence product is not fitted in StoreKit or App Store Connect."
        } else {
            status = "Apple payment sheet ready. No charge occurs before confirmation."
        }
    }

    private func handleTransactionUpdate(
        _ result: VerificationResult<Transaction>
    ) async {
        guard case .verified(let transaction) = result else {
            status = "An unverified StoreKit update was ignored."
            return
        }

        if transaction.productID == Self.productID {
            await transaction.finish()
            await refreshEntitlement()
            status = isPurchased
                ? "Verified Apple entitlement fitted."
                : "The Apple entitlement is no longer active."
        }
    }

    private func requireVerified(
        _ result: VerificationResult<Transaction>
    ) throws -> Transaction {
        switch result {
        case .verified(let transaction):
            return transaction
        case .unverified:
            throw PurchaseValidationError.unverified
        }
    }
}

private enum PurchaseValidationError: Error {
    case unverified
    case wrongProduct
}
