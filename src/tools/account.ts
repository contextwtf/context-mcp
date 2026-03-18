import { z } from "zod";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { formatEther } from "viem";
import { getTradingClient, resetTradingClient } from "../lib/client.js";
import { loadConfig, saveConfig, configPath } from "../lib/config.js";
import { toolResult, toolError, type Server } from "../lib/utils.js";

const MIN_ETH_FOR_GAS = 1_000_000_000_000n; // 0.000001 ETH

// ---------------------------------------------------------------------------
// Tool registration
// ---------------------------------------------------------------------------

export function registerAccountTools(server: Server) {
  // 1. Generate or import a wallet
  server.tool(
    "context_generate_wallet",
    "Generate a new trading wallet or import an existing private key. " +
    "Saves credentials to ~/.config/context/config.env (shared with the Context CLI). " +
    "Also saves the API key if provided. " +
    "IMPORTANT: If a wallet already exists, this will tell you — it will NOT overwrite " +
    "unless you explicitly pass overwrite: true. Always confirm with the user before overwriting.",
    {
      privateKey: z
        .string()
        .describe("Import an existing private key (0x-prefixed hex). Omit to generate a new one.")
        .optional(),
      apiKey: z
        .string()
        .describe("Context API key (ctx_...). Optional but recommended — get one at context.markets.")
        .optional(),
      overwrite: z
        .boolean()
        .describe("Set to true to replace an existing wallet. The agent MUST confirm with the user first.")
        .optional(),
    },
    async (params) => {
      try {
        // Check if a wallet is already configured (env or config file)
        const existingKey = process.env.CONTEXT_PRIVATE_KEY || loadConfig().CONTEXT_PRIVATE_KEY;

        if (existingKey && !params.overwrite) {
          const account = privateKeyToAccount(existingKey as `0x${string}`);
          return toolResult({
            status: "wallet_exists",
            address: account.address,
            configPath: configPath(),
            message:
              "A wallet is already configured. Use context_wallet_status for full details. " +
              "To replace it, call this tool again with overwrite: true — but confirm with the user first, " +
              "as the old key will be lost.",
          });
        }

        // Validate imported key
        let key: string;
        if (params.privateKey) {
          if (!params.privateKey.startsWith("0x") || params.privateKey.length !== 66) {
            return toolResult({
              error: "Invalid private key format. Must be 0x-prefixed + 64 hex characters.",
            });
          }
          key = params.privateKey;
        } else {
          key = generatePrivateKey();
        }

        const account = privateKeyToAccount(key as `0x${string}`);

        // Build config to save
        const toSave: Record<string, string> = { CONTEXT_PRIVATE_KEY: key };
        if (params.apiKey) {
          toSave.CONTEXT_API_KEY = params.apiKey;
          process.env.CONTEXT_API_KEY = params.apiKey;
        }

        // Save to shared config file (chmod 600)
        saveConfig(toSave);
        process.env.CONTEXT_PRIVATE_KEY = key;
        resetTradingClient();

        return toolResult({
          status: params.privateKey ? "imported" : "generated",
          address: account.address,
          privateKey: key,
          savedTo: configPath(),
          message: params.privateKey
            ? "Wallet imported and saved."
            : "New wallet generated and saved. Back up your private key — it cannot be recovered.",
          nextSteps: [
            "Fund the wallet with ETH on Base for gas fees.",
            "Run context_account_setup to approve contracts for trading.",
            "Deposit USDC with context_deposit to start trading.",
          ],
        });
      } catch (error) {
        return toolError(error);
      }
    }
  );

  // 2. Full wallet status
  server.tool(
    "context_wallet_status",
    "Get comprehensive wallet status: address, ETH balance (for gas), USDC balance, " +
    "approval status, and whether the account is ready to trade. " +
    "Requires a wallet — run context_generate_wallet first if not set up.",
    {},
    async () => {
      try {
        const client = getTradingClient();
        const status = await client.account.status();
        const s = status as any;
        return toolResult({
          address: s.address,
          ethBalance: formatEther(s.ethBalance ?? 0n),
          usdcBalance: s.usdcBalance ? (Number(s.usdcBalance) / 1e6).toFixed(2) : "0.00",
          isReady: !status.needsApprovals,
          needsApprovals: status.needsApprovals,
          nextSteps: status.needsApprovals
            ? [
                ...(s.ethBalance < MIN_ETH_FOR_GAS
                  ? [`Send ETH to ${s.address} on Base for gas fees.`]
                  : []),
                "Run context_account_setup to approve contracts.",
                "Run context_deposit to deposit USDC for trading.",
              ]
            : ["Wallet is fully set up. You can start trading."],
        });
      } catch (error) {
        return toolError(error);
      }
    }
  );

  // 3. Set up trading account (approve contracts)
  server.tool(
    "context_account_setup",
    "Approve USDC spending and operator permissions for trading. " +
    "Run this once before your first trade. Requires a wallet and ETH on Base for gas — " +
    "run context_generate_wallet first if not set up.",
    {},
    async () => {
      try {
        const client = getTradingClient();
        const status = await client.account.status();
        if (!status.needsApprovals) {
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

  // 4. Deposit USDC
  server.tool(
    "context_deposit",
    "Deposit USDC into the exchange for trading. Requires approved contracts — " +
    "run context_account_setup first if needed.",
    {
      amount: z
        .number()
        .positive()
        .describe("Amount of USDC to deposit"),
    },
    async (params) => {
      try {
        const client = getTradingClient();
        const txHash = await client.account.deposit(params.amount);
        return toolResult({
          message: `Deposited $${params.amount.toFixed(2)} USDC successfully.`,
          amount: params.amount,
          txHash,
        });
      } catch (error) {
        return toolError(error);
      }
    }
  );

  // 5. Mint test USDC
  server.tool(
    "context_mint_test_usdc",
    "Mint test USDC on Base Sepolia testnet for paper trading. Default 1000 USDC. " +
    "Requires a wallet — run context_generate_wallet first if not set up.",
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
