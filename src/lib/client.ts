import { ContextClient, type ChainOption } from "context-markets";
import { loadConfig } from "./config.js";

interface CacheEntry {
  client: ContextClient;
  key: string;
}

let readCache: CacheEntry | null = null;
let tradingCache: CacheEntry | null = null;

/** Reset the cached trading client so the next call picks up new env vars. */
export function resetTradingClient(): void {
  tradingCache = null;
}

/** Resolve a key from env vars first, then ~/.config/context/config.env. */
function resolveKey(envKey: string): string | undefined {
  return process.env[envKey] || loadConfig()[envKey] || undefined;
}

function getChain(): ChainOption {
  return process.env.CONTEXT_CHAIN === "testnet" ? "testnet" : "mainnet";
}

function cacheKey(chain: ChainOption, apiKey?: string, privateKey?: string): string {
  return `${chain}_${apiKey ?? ""}_${privateKey ?? ""}`;
}

export function getReadClient(): ContextClient {
  const chain = getChain();
  const apiKey = resolveKey("CONTEXT_API_KEY");
  const key = cacheKey(chain, apiKey);

  if (readCache?.key === key) {
    return readCache.client;
  }

  const client = new ContextClient({ apiKey, chain });
  readCache = { client, key };
  return client;
}

export function getTradingClient(): ContextClient {
  const chain = getChain();
  const apiKey = resolveKey("CONTEXT_API_KEY");
  const privateKey = resolveKey("CONTEXT_PRIVATE_KEY");

  if (!privateKey) {
    throw new Error(
      "No wallet configured. Run context_generate_wallet to create one, " +
      "or set CONTEXT_PRIVATE_KEY in your environment."
    );
  }

  const key = cacheKey(chain, apiKey, privateKey);
  if (tradingCache?.key === key) {
    return tradingCache.client;
  }

  const client = new ContextClient({
    apiKey,
    chain,
    signer: { privateKey: privateKey as `0x${string}` },
  });
  tradingCache = { client, key };
  return client;
}
