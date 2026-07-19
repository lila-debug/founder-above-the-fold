// Paid/public production release entrypoint. The guarded conveyor remains shared
// with the earlier private-beta command so there is one deployment mechanism.
await import("./deploy-public-beta.mjs");
