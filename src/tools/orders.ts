import { z } from "zod";
import { getTradingClient } from "../lib/client.js";
import { toolResult, toolError, type Server } from "../lib/utils.js";

export function registerOrderTools(server: Server) {
  // 1. Place a buy order
  server.tool(
    "context_place_order",
    "Place a buy order on a prediction market. Prices in cents (1-99), size in contracts (min 0.01). Requires a wallet — run context_generate_wallet first if not set up.",
    {
      marketId: z.string().describe("The unique identifier of the market"),
      side: z.enum(["yes", "no"]).describe("Which outcome to buy: yes or no"),
      size: z.number().describe("Number of contracts to buy (min 0.01)"),
      price: z
        .number()
        .describe("Limit price in cents (1-99). Omit for a market order.")
        .optional(),
    },
    async (params) => {
      try {
        const client = getTradingClient();
        let result;
        if (params.price !== undefined) {
          result = await client.orders.create({
            marketId: params.marketId,
            outcome: params.side,
            side: "buy",
            priceCents: params.price,
            size: params.size,
          });
        } else {
          result = await client.orders.createMarket({
            marketId: params.marketId,
            outcome: params.side,
            side: "buy",
            maxPriceCents: 99,
            maxSize: params.size,
          });
        }
        return toolResult(result);
      } catch (error) {
        return toolError(error);
      }
    }
  );

  // 2. Cancel an open order
  server.tool(
    "context_cancel_order",
    "Cancel an open order by its nonce. Requires a wallet — run context_generate_wallet first if not set up.",
    {
      nonce: z.string().describe("The nonce of the order to cancel"),
    },
    async (params) => {
      try {
        const client = getTradingClient();
        const result = await client.orders.cancel(
          params.nonce as `0x${string}`
        );
        return toolResult(result);
      } catch (error) {
        return toolError(error);
      }
    }
  );

  // 3. List open orders
  server.tool(
    "context_my_orders",
    "List your open orders, optionally filtered to a specific market. Requires a wallet — run context_generate_wallet first if not set up.",
    {
      marketId: z
        .string()
        .describe("Filter orders to a specific market")
        .optional(),
    },
    async (params) => {
      try {
        const client = getTradingClient();
        const result = await client.orders.allMine(params.marketId);
        return toolResult(result);
      } catch (error) {
        return toolError(error);
      }
    }
  );
}
