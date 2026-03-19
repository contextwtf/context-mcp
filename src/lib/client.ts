import { ContextClient, type ChainOption } from "context-markets";
import { loadConfig } from "./config.js";

let readClientInstance: ContextClient | null = null;
let tradingClientInstance: ContextClient | null = null;
let tradingClientKey: string | null = null;

/** Reset the cached trading client so the next call picks up new env vars. */
export function resetTradingClient(): void {
  tradingClientInstance = null;
  tradingClientKey = null;
}

/** Resolve a key from env vars first, then ~/.config/context/config.env. */
function resolveKey(envKey: string): string | undefined {
  return process.env[envKey] || loadConfig()[envKey] || undefined;
}

function getChain(): ChainOption {
  return process.env.CONTEXT_CHAIN === "testnet" ? "testnet" : "mainnet";
}

export function getReadClient(): ContextClient {
  if (!readClientInstance) {
    readClientInstance = new ContextClient({
      apiKey: resolveKey("CONTEXT_API_KEY"),
      chain: getChain(),
    });
  }
  return readClientInstance;
}

export function getTradingClient(): ContextClient {
  // Re-resolve keys on every call so credentials written mid-session are picked up
  const apiKey = resolveKey("CONTEXT_API_KEY");
  const privateKey = resolveKey("CONTEXT_PRIVATE_KEY");
  if (!privateKey) {
    throw new Error(
      "No wallet configured. Run context_generate_wallet to create one, " +
      "or set CONTEXT_PRIVATE_KEY in your environment."
    );
  }
  // Only rebuild the client if the private key changed
  if (!tradingClientInstance || privateKey !== tradingClientKey) {
    tradingClientInstance = new ContextClient({
      apiKey,
      chain: getChain(),
      signer: { privateKey: privateKey as `0x${string}` },
    });
    tradingClientKey = privateKey;
  }
  return tradingClientInstance;
}
