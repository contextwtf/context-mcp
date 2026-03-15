import { z } from "zod";
import { getTradingClient } from "../lib/client.js";
import { toolResult, toolError, type Server } from "../lib/utils.js";

export function registerAccountTools(server: Server) {
  // 1. Set up trading account
  server.tool(
    "context_account_setup",
    "Set up your trading account — approves USDC spending and operator permissions. Run this before your first trade. Requires CONTEXT_PRIVATE_KEY.",
    {},
    async () => {
      try {
        const client = getTradingClient();
        const status = await client.account.status();
        if (status.isReady) {
          return toolResult({
            message: "Account already set up.",
            status,
          });
        }
        const result = await client.account.setup();
        return toolResult({
          message: "Account setup complete. You can now place trades.",
          result,
        });
      } catch (error) {
        return toolError(error);
      }
    }
  );

  // 2. Mint test USDC
  server.tool(
    "context_mint_test_usdc",
    "Mint test USDC on Base Sepolia testnet for paper trading. Default 1000 USDC. Requires CONTEXT_PRIVATE_KEY.",
    {
      amount: z
        .number()
        .describe("Amount of test USDC to mint (default 1000)")
        .optional(),
    },
    async (params) => {
      try {
        const client = getTradingClient();
        const mintAmount = params.amount ?? 1000;
        await client.account.mintTestUsdc(mintAmount);
        return toolResult({
          message: `Minted ${mintAmount} test USDC successfully.`,
          amount: mintAmount,
        });
      } catch (error) {
        return toolError(error);
      }
    }
  );
}
