# Context Markets MCP Server

Browse, trade, and create prediction markets from any AI agent.

## Quickstart: Claude Desktop

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "context-markets": {
      "command": "npx",
      "args": ["@contextwtf/mcp"],
      "env": {
        "CONTEXT_API_KEY": "your-api-key",
        "CONTEXT_PRIVATE_KEY": "your-wallet-private-key"
      }
    }
  }
}
```

## Quickstart: Claude Code

```bash
claude mcp add context-markets -- npx @contextwtf/mcp
```

## Available Tools

### Read-only (no auth needed)

| Tool | Description | Key Params |
|------|-------------|------------|
| `context_list_markets` | List and search prediction markets | `query`, `status`, `category`, `sortBy`, `limit` |
| `context_get_market` | Get detailed market information | `marketId` |
| `context_get_quotes` | Get bid/ask/last prices for a market | `marketId` |
| `context_get_orderbook` | Get the orderbook (bid/ask ladder) | `marketId`, `depth` |
| `context_simulate_trade` | Simulate a trade without executing | `marketId`, `side`, `amount` |
| `context_price_history` | Get historical price data | `marketId`, `timeframe` |
| `context_get_oracle` | Get AI oracle resolution analysis | `marketId` |
| `context_global_activity` | Get recent trading activity across all markets | -- |

### Trading (requires API key + private key)

| Tool | Description | Key Params |
|------|-------------|------------|
| `context_place_order` | Place a buy order (limit or market) | `marketId`, `side`, `size`, `price` |
| `context_cancel_order` | Cancel an open order | `nonce` |
| `context_my_orders` | List your open orders | `marketId` |
| `context_get_portfolio` | Get positions with P&L | `kind` |
| `context_get_balance` | Get USDC balance and token holdings | -- |
| `context_account_setup` | Approve USDC spending for trading | -- |
| `context_mint_test_usdc` | Mint test USDC on Base Sepolia | `amount` |
| `context_create_market` | Create a market from a question | `question` |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CONTEXT_API_KEY` | For all tools | API key from context.markets |
| `CONTEXT_PRIVATE_KEY` | For trading tools only | Ethereum private key for signing transactions |

Read-only tools work with zero config.

## Development

```bash
bun install
bun run build
node dist/index.js
```
