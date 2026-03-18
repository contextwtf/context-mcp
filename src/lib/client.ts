import { ContextClient } from "@contextwtf/sdk";
import { loadConfig } from "./config.js";

let readClientInstance: ContextClient | null = null;
let tradingClientInstance: ContextClient | null = null;

/** Reset the cached trading client so the next call picks up new env vars. */
export function resetTradingClient(): void {
  tradingClientInstance = null;
}

/** Resolve a key from env vars first, then ~/.config/context/config.env. */
function resolveKey(envKey: string): string | undefined {
  return process.env[envKey] || loadConfig()[envKey] || undefined;
}

export function getReadClient(): ContextClient {
  if (!readClientInstance) {
    readClientInstance = new ContextClient({
      apiKey: resolveKey("CONTEXT_API_KEY"),
    });
  }
  return readClientInstance;
}

export function getTradingClient(): ContextClient {
  if (!tradingClientInstance) {
    const apiKey = resolveKey("CONTEXT_API_KEY");
    const privateKey = resolveKey("CONTEXT_PRIVATE_KEY");
    if (!privateKey) {
      throw new Error(
        "No wallet configured. Run context_generate_wallet to create one, " +
        "or set CONTEXT_PRIVATE_KEY in your environment."
      );
    }
    tradingClientInstance = new ContextClient({
      apiKey,
      signer: { privateKey: privateKey as `0x${string}` },
    });
  }
  return tradingClientInstance;
}
