import { z } from "zod";
import { getTradingClient } from "../lib/client.js";
import { toolResult, toolError, type Server } from "../lib/utils.js";

export function registerPortfolioTools(server: Server) {
  // 1. Get portfolio positions
  server.tool(
    "context_get_portfolio",
    "Get your prediction market positions with P&L. Filter by kind: all, active, won, lost, or claimable. Requires a wallet — run context_generate_wallet first if not set up.",
    {
      kind: z
        .enum(["all", "active", "won", "lost", "claimable"])
        .describe("Filter positions by kind")
        .optional(),
    },
    async (params) => {
      try {
        const client = getTradingClient();
        const result = await client.portfolio.get(undefined, {
          kind: params.kind ?? "all",
        });
        return toolResult(result);
      } catch (error) {
        return toolError(error);
      }
    }
  );

  // 2. Get balance
  server.tool(
    "context_get_balance",
    "Get your USDC balance (wallet + settlement) and outcome token holdings. Requires a wallet — run context_generate_wallet first if not set up.",
    {},
    async () => {
      try {
        const client = getTradingClient();
        const result = await client.portfolio.balance();
        return toolResult(result);
      } catch (error) {
        return toolError(error);
      }
    }
  );
}
