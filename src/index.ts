#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./lib/config.js";

import { registerMarketTools } from "./tools/markets.js";
import { registerOrderTools } from "./tools/orders.js";
import { registerPortfolioTools } from "./tools/portfolio.js";
import { registerAccountTools } from "./tools/account.js";
import { registerQuestionTools } from "./tools/questions.js";

// Load keys from ~/.config/context/config.env (shared with the CLI).
// Env vars take precedence — config file fills in what's missing.
const config = loadConfig();
for (const [key, value] of Object.entries(config)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

const server = new McpServer(
  {
    name: "context-markets",
    version: "0.2.1",
  },
  {
    instructions:
      "Context Markets MCP — trade prediction markets from any AI agent.\n\n" +
      "ONBOARDING: Before any trading operation, the user needs a wallet. " +
      "If a trading tool fails with 'No wallet configured', guide the user through setup:\n" +
      "1. Run context_generate_wallet to create or import a wallet.\n" +
      "2. The user needs ETH on Base for gas fees — show them their address.\n" +
      "3. Run context_account_setup to approve contracts.\n" +
      "4. Deposit USDC with context_deposit.\n\n" +
      "Read-only tools (context_list_markets, context_get_market, context_get_quotes, etc.) " +
      "work without a wallet. Trading, portfolio, account, and market creation tools require a private key.\n\n" +
      "IMPORTANT: Never generate a wallet or overwrite an existing one without explicit user confirmation.",
  },
);

registerMarketTools(server);
registerOrderTools(server);
registerPortfolioTools(server);
registerAccountTools(server);
registerQuestionTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Context Markets MCP server running");
}

main().catch((error) => {
  console.error("Fatal:", error);
  process.exit(1);
});
