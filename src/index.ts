#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

import { registerMarketTools } from "./tools/markets.js";
import { registerOrderTools } from "./tools/orders.js";
import { registerPortfolioTools } from "./tools/portfolio.js";
import { registerAccountTools } from "./tools/account.js";
import { registerQuestionTools } from "./tools/questions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "..", ".env") });

const server = new McpServer({
  name: "context-markets",
  version: "0.1.0",
});

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
