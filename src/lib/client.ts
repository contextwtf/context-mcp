import { ContextClient, type ChainOption } from "context-markets";

let readClientInstance: ContextClient | null = null;
let tradingClientInstance: ContextClient | null = null;

function getChain(): ChainOption {
  return process.env.CONTEXT_CHAIN === "testnet" ? "testnet" : "mainnet";
}

export function getReadClient(): ContextClient {
  if (!readClientInstance) {
    readClientInstance = new ContextClient({
      apiKey: process.env.CONTEXT_API_KEY,
      chain: getChain(),
    });
  }
  return readClientInstance;
}

export function getTradingClient(): ContextClient {
  if (!tradingClientInstance) {
    const apiKey = process.env.CONTEXT_API_KEY;
    const privateKey = process.env.CONTEXT_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error(
        "CONTEXT_PRIVATE_KEY is required for trading operations. " +
        "Set it in your MCP server env config."
      );
    }
    tradingClientInstance = new ContextClient({
      apiKey,
      chain: getChain(),
      signer: { privateKey: privateKey as `0x${string}` },
    });
  }
  return tradingClientInstance;
}
