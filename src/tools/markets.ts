import { z } from "zod";
import { getReadClient } from "../lib/client.js";
import { toolResult, toolError, type Server } from "../lib/utils.js";

export function registerMarketTools(server: Server) {
  // 1. List and search prediction markets
  server.tool(
    "context_list_markets",
    "List and search prediction markets on Context Markets. Returns market titles, prices, volume, and status.",
    {
      query: z.string().describe("Search query to filter markets by title or description").optional(),
      status: z
        .enum(["active", "pending", "resolved", "closed"])
        .describe("Filter by market status")
        .optional(),
      category: z.string().describe("Filter by market category").optional(),
      sortBy: z
        .enum(["new", "volume", "trending", "ending", "chance"])
        .describe("Sort order for results")
        .optional(),
      limit: z.number().describe("Maximum number of markets to return").optional(),
    },
    async (params) => {
      try {
        const client = getReadClient();
        const result = await client.markets.list({
          query: params.query,
          status: params.status,
          sortBy: params.sortBy,
          category: params.category,
          limit: params.limit,
        });
        return toolResult(result);
      } catch (error) {
        return toolError(error);
      }
    }
  );

  // 2. Get detailed market information
  server.tool(
    "context_get_market",
    "Get detailed information about a specific prediction market including description, resolution criteria, prices, and status.",
    {
      marketId: z.string().describe("The unique identifier of the market"),
    },
    async (params) => {
      try {
        const client = getReadClient();
        const result = await client.markets.get(params.marketId);
        return toolResult(result);
      } catch (error) {
        return toolError(error);
      }
    }
  );

  // 3. Get current quotes (bid/ask/last prices)
  server.tool(
    "context_get_quotes",
    "Get current bid/ask/last prices for a market's YES and NO outcomes. Prices are in cents (1-99 = 1%-99% probability).",
    {
      marketId: z.string().describe("The unique identifier of the market"),
    },
    async (params) => {
      try {
        const client = getReadClient();
        const result = await client.markets.quotes(params.marketId);
        return toolResult(result);
      } catch (error) {
        return toolError(error);
      }
    }
  );

  // 4. Get the orderbook
  server.tool(
    "context_get_orderbook",
    "Get the orderbook (bid/ask ladder) for a market. Shows available liquidity at each price level.",
    {
      marketId: z.string().describe("The unique identifier of the market"),
      depth: z.number().describe("Number of price levels to return on each side of the book").optional(),
    },
    async (params) => {
      try {
        const client = getReadClient();
        const result = await client.markets.fullOrderbook(params.marketId, {
          depth: params.depth,
        });
        return toolResult(result);
      } catch (error) {
        return toolError(error);
      }
    }
  );

  // 5. Simulate a trade
  server.tool(
    "context_simulate_trade",
    "Simulate a trade to see estimated fill price, cost, and slippage before placing a real order. Does not execute.",
    {
      marketId: z.string().describe("The unique identifier of the market"),
      side: z.enum(["yes", "no"]).describe("Which outcome to buy: yes or no"),
      amount: z.number().describe("Amount in USD to simulate trading"),
    },
    async (params) => {
      try {
        const client = getReadClient();
        const result = await client.markets.simulate(params.marketId, {
          side: params.side,
          amount: params.amount,
          amountType: "usd",
        });
        return toolResult(result);
      } catch (error) {
        return toolError(error);
      }
    }
  );

  // 6. Get price history
  server.tool(
    "context_price_history",
    "Get historical price data for a market over a specified timeframe.",
    {
      marketId: z.string().describe("The unique identifier of the market"),
      timeframe: z
        .enum(["1h", "6h", "1d", "1w", "1M", "all"])
        .describe("Timeframe for the price history data")
        .optional(),
    },
    async (params) => {
      try {
        const client = getReadClient();
        const result = await client.markets.priceHistory(params.marketId, {
          timeframe: params.timeframe,
        });
        return toolResult(result);
      } catch (error) {
        return toolError(error);
      }
    }
  );

  // 7. Get oracle analysis
  server.tool(
    "context_get_oracle",
    "Get the AI oracle's resolution analysis for a market, including confidence level and sources monitored.",
    {
      marketId: z.string().describe("The unique identifier of the market"),
    },
    async (params) => {
      try {
        const client = getReadClient();
        const result = await client.markets.oracle(params.marketId);
        return toolResult(result);
      } catch (error) {
        return toolError(error);
      }
    }
  );

  // 8. Get global activity
  server.tool(
    "context_global_activity",
    "Get recent trading activity across all markets on Context Markets.",
    {},
    async () => {
      try {
        const client = getReadClient();
        const result = await client.markets.globalActivity();
        return toolResult(result);
      } catch (error) {
        return toolError(error);
      }
    }
  );
}
