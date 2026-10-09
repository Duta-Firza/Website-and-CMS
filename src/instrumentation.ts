export async function register() {
  // Node-only: the collector reads /proc + statfs and writes via Mongoose.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { isSelfCollectEnabled, startSelfCollector } = await import(
      "./lib/devtools/self-collect"
    );
    if (isSelfCollectEnabled(process.env)) startSelfCollector();
  }
}
