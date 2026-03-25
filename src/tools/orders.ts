import { z } from "zod";
import type { PlaceOrderRequest } from "context-markets";
import { getTradingClient } from "../lib/client.js";
import {
  toolResult,
  toolError,
  validateHexNonce,
  type Server,
} from "../lib/utils.js";

// ---------------------------------------------------------------------------
// Shared schemas and helpers
// ---------------------------------------------------------------------------

const outcomeSchema = z.enum(["yes", "no"]).describe("Which outcome token: yes or no");
const sideSchema = z.enum(["buy", "sell"]).describe("Buy to enter a position, sell to exit. Defaults to buy.").default("buy");
const priceSchema = z.number().min(1).max(99).describe("Price in cents (1-99)");
const sizeSchema = z.number().min(0.01).describe("Number of contracts (min 0.01)");
const expirySchema = z.number().positive().describe("Auto-expire the order after this many seconds").optional();
const inventoryModeSchema = z
  .enum(["any", "hold", "mint"])
  .describe(
    "Token inventory mode. 'any' (default): use existing tokens or mint new ones. " +
    "'hold': require existing token inventory. " +
    "'mint': mint new complete sets from USDC (use for sells when you don't hold tokens)."
  )
  .optional();
const takerOnlySchema = z
  .boolean()
  .describe("If true, the order must fill immediately or be voided. Default false.")
  .optional();

const INVENTORY_MODE_MAP = { any: 0, hold: 1, mint: 2 } as const;

/** Build a PlaceOrderRequest from tool params. */
function buildOrderRequest(params: {
  marketId: string;
  outcome: "yes" | "no";
  side: "buy" | "sell";
  priceCents: number;
  size: number;
  expirySeconds?: number;
  inventoryMode?: "any" | "hold" | "mint";
  takerOnly?: boolean;
}): PlaceOrderRequest {
  const req: PlaceOrderRequest = {
    marketId: params.marketId,
    outcome: params.outcome,
    side: params.side,
    priceCents: params.priceCents,
    size: params.size,
  };
  if (params.expirySeconds !== undefined) req.expirySeconds = params.expirySeconds;
  if (params.inventoryMode !== undefined) {
    req.inventoryModeConstraint = INVENTORY_MODE_MAP[params.inventoryMode];
  }
  if (params.takerOnly) {
    req.makerRoleConstraint = 2; // TAKER_ONLY
  }
  return req;
}

// ---------------------------------------------------------------------------
// Tool registration
// ---------------------------------------------------------------------------

export function registerOrderTools(server: Server) {
  // 1. Place an order (buy or sell)
  server.tool(
    "context_place_order",
    "Place a buy or sell order on a prediction market. " +
    "Prices in cents (1-99), size in contracts (min 0.01). " +
    "Omit price for a market order. " +
    "Note: Market orders (no price specified) will fill at any price up to 99 cents. " +
    "For tighter price control, specify a limit price. " +
    "Requires a wallet — run context_generate_wallet first if not set up.",
    {
      marketId: z.string().describe("The unique identifier of the market"),
      outcome: outcomeSchema,
      side: sideSchema,
      size: sizeSchema,
      price: z
        .number()
        .min(1)
        .max(99)
        .describe("Limit price in cents (1-99). Omit for a market order.")
        .optional(),
      expirySeconds: expirySchema,
      inventoryMode: inventoryModeSchema,
      takerOnly: takerOnlySchema,
    },
    async (params) => {
      try {
        const client = getTradingClient();
        let result;
        if (params.price !== undefined) {
          result = await client.orders.create(
            buildOrderRequest({
              marketId: params.marketId,
              outcome: params.outcome,
              side: params.side,
              priceCents: params.price,
              size: params.size,
              expirySeconds: params.expirySeconds,
              inventoryMode: params.inventoryMode,
              takerOnly: params.takerOnly,
            })
          );
        } else {
          const marketReq: any = {
            marketId: params.marketId,
            outcome: params.outcome,
            side: params.side,
            maxPriceCents: 99,
            maxSize: params.size,
          };
          if (params.expirySeconds !== undefined) marketReq.expirySeconds = params.expirySeconds;
          result = await client.orders.createMarket(marketReq);
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
        const result = await client.orders.cancel(validateHexNonce(params.nonce));
        return toolResult(result);
      } catch (error) {
        return toolError(error);
      }
    }
  );

  // 3. Cancel and replace an order atomically
  server.tool(
    "context_cancel_replace_order",
    "Atomically cancel an existing order and place a new one. " +
    "If either operation fails, both fail — you're never left without a position. " +
    "Requires a wallet — run context_generate_wallet first if not set up.",
    {
      cancelNonce: z.string().describe("Hex nonce of the order to cancel"),
      marketId: z.string().describe("The unique identifier of the market for the new order"),
      outcome: outcomeSchema,
      side: sideSchema,
      priceCents: priceSchema,
      size: sizeSchema,
      expirySeconds: expirySchema,
      inventoryMode: inventoryModeSchema,
      takerOnly: takerOnlySchema,
    },
    async (params) => {
      try {
        const client = getTradingClient();
        const result = await client.orders.cancelReplace(
          validateHexNonce(params.cancelNonce),
          buildOrderRequest({
            marketId: params.marketId,
            outcome: params.outcome,
            side: params.side,
            priceCents: params.priceCents,
            size: params.size,
            expirySeconds: params.expirySeconds,
            inventoryMode: params.inventoryMode,
            takerOnly: params.takerOnly,
          })
        );
        return toolResult(result);
      } catch (error) {
        return toolError(error);
      }
    }
  );

  // 4. List open orders
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

  // 5. Bulk create orders
  server.tool(
    "context_bulk_create_orders",
    "Create multiple orders in a single atomic batch. " +
    "All orders are submitted together — more efficient than placing them one by one. " +
    "Requires a wallet — run context_generate_wallet first if not set up.",
    {
      orders: z.array(
        z.object({
          marketId: z.string().describe("The unique identifier of the market"),
          outcome: outcomeSchema,
          side: sideSchema,
          priceCents: priceSchema,
          size: sizeSchema,
          expirySeconds: expirySchema,
          inventoryMode: inventoryModeSchema,
          takerOnly: takerOnlySchema,
        })
      ).describe("Array of orders to create"),
    },
    async (params) => {
      try {
        const client = getTradingClient();
        const requests = params.orders.map((o) =>
          buildOrderRequest({
            marketId: o.marketId,
            outcome: o.outcome,
            side: o.side,
            priceCents: o.priceCents,
            size: o.size,
            expirySeconds: o.expirySeconds,
            inventoryMode: o.inventoryMode,
            takerOnly: o.takerOnly,
          })
        );
        const result = await client.orders.bulkCreate(requests);
        return toolResult(result);
      } catch (error) {
        return toolError(error);
      }
    }
  );

  // 6. Bulk cancel orders
  server.tool(
    "context_bulk_cancel_orders",
    "Cancel multiple open orders in a single batch. " +
    "Requires a wallet — run context_generate_wallet first if not set up.",
    {
      nonces: z.array(z.string()).describe("Array of hex nonces of orders to cancel"),
    },
    async (params) => {
      try {
        const client = getTradingClient();
        const result = await client.orders.bulkCancel(
          params.nonces.map(validateHexNonce)
        );
        return toolResult(result);
      } catch (error) {
        return toolError(error);
      }
    }
  );

  // 7. Bulk mixed operations (create + cancel atomically)
  server.tool(
    "context_bulk_orders",
    "Atomically create and cancel orders in a single batch. " +
    "Use this for quote updates — cancel stale orders and place new ones in one call. " +
    "Requires a wallet — run context_generate_wallet first if not set up.",
    {
      creates: z.array(
        z.object({
          marketId: z.string().describe("The unique identifier of the market"),
          outcome: outcomeSchema,
          side: sideSchema,
          priceCents: priceSchema,
          size: sizeSchema,
          expirySeconds: expirySchema,
          inventoryMode: inventoryModeSchema,
          takerOnly: takerOnlySchema,
        })
      ).describe("Orders to create").optional(),
      cancelNonces: z.array(z.string()).describe("Hex nonces of orders to cancel").optional(),
    },
    async (params) => {
      try {
        const client = getTradingClient();
        const creates = (params.creates ?? []).map((o) =>
          buildOrderRequest({
            marketId: o.marketId,
            outcome: o.outcome,
            side: o.side,
            priceCents: o.priceCents,
            size: o.size,
            expirySeconds: o.expirySeconds,
            inventoryMode: o.inventoryMode,
            takerOnly: o.takerOnly,
          })
        );
        const cancelNonces = (params.cancelNonces ?? []).map(validateHexNonce);
        const result = await client.orders.bulk(creates, cancelNonces);
        return toolResult(result);
      } catch (error) {
        return toolError(error);
      }
    }
  );
}
