import { ContextClient } from "context-markets";

let readClientInstance: ContextClient | null = null;
let tradingClientInstance: ContextClient | null = null;

export function getReadClient(): ContextClient {
  if (!readClientInstance) {
    readClientInstance = new ContextClient({
      apiKey: process.env.CONTEXT_API_KEY,
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
      signer: { privateKey: privateKey as `0x${string}` },
    });
  }
  return tradingClientInstance;
}
