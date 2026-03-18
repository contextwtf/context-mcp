# Context Markets MCP Server

Browse, trade, and create prediction markets from any AI agent.

## Install

### Claude Desktop

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "context-markets": {
      "command": "npx",
      "args": ["@contextwtf/mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add context-markets -- npx @contextwtf/mcp
```

No environment variables needed — the server walks you through setup on first use.

## Getting Started

The first time you (or your agent) use a trading tool, the server will guide you through onboarding:

1. **Wallet** — `context_generate_wallet` creates a new wallet or imports an existing private key
2. **Save credentials** — persists to `~/.config/context/config.env` (chmod 600, shared with the [CLI](https://github.com/contextwtf/context-cli))
3. **API key** — pass your Context API key (get one at [context.markets](https://context.markets)) via the `apiKey` param
4. **Approve contracts** — `context_account_setup` approves on-chain (requires ETH on Base for gas)
5. **Deposit USDC** — `context_deposit` deposits USDC into the exchange

If anything fails (no ETH, rate limit, etc.), you can re-run the same tool — it detects your existing config and picks up where you left off.

### Manual setup

If you prefer to configure manually:

```bash
# Option 1: Environment variables
export CONTEXT_API_KEY="your-api-key"
export CONTEXT_PRIVATE_KEY="0x..."

# Option 2: Config file (created by context_generate_wallet or `context setup` in the CLI)
# ~/.config/context/config.env
```

Credentials are loaded in order: env vars > config file.

Need an API key? Visit [context.markets](https://context.markets).

## Available Tools

### Read-only (no wallet needed)

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

### Account setup

| Tool | Description | Key Params |
|------|-------------|------------|
| `context_generate_wallet` | Generate a new wallet or import an existing key | `privateKey`, `apiKey`, `overwrite` |
| `context_wallet_status` | Get address, balances, and approval status | -- |
| `context_account_setup` | Approve USDC spending and operator permissions | -- |
| `context_deposit` | Deposit USDC into the exchange | `amount` |
| `context_mint_test_usdc` | Mint test USDC on Base Sepolia | `amount` |

### Trading

| Tool | Description | Key Params |
|------|-------------|------------|
| `context_place_order` | Place a buy order (limit or market) | `marketId`, `side`, `size`, `price` |
| `context_cancel_order` | Cancel an open order | `nonce` |
| `context_my_orders` | List your open orders | `marketId` |
| `context_get_portfolio` | Get positions with P&L | `kind` |
| `context_get_balance` | Get USDC balance and token holdings | -- |
| `context_create_market` | Create a market from a question | `question` |

## Key Concepts

- **Prices are in cents** (1–99). A price of 65 means $0.65 per share.
- **Outcomes are yes or no.** Each market is a binary question.
- **Read-only tools work with zero config.** Trading tools need a wallet — run `context_generate_wallet` first.
- **Shared config.** The MCP server and [CLI](https://github.com/contextwtf/context-cli) share `~/.config/context/config.env`, so you only set up once.

## Ecosystem

| Package | Description |
|---------|-------------|
| [context-markets](https://github.com/contextwtf/context-sdk) | TypeScript SDK |
| [context-markets-react](https://github.com/contextwtf/context-react) | React hooks |
| [context-markets-mcp](https://github.com/contextwtf/context-mcp) | MCP server for AI agents |
| [context-markets-cli](https://github.com/contextwtf/context-cli) | CLI |
| [context-skills](https://github.com/contextwtf/context-skills) | AI agent skill files |
| [context-plugin](https://github.com/contextwtf/context-plugin) | Claude Code plugin |

## Development

```bash
bun install
bun run build
node dist/index.js
```

## License

MIT
