<p align="center">
  <img src="https://mainnet.contextcdn.com/ced823d63df9dff0390d9ad0a4e1ad3905dd199a6c50758c18a5c92a203adbd7" alt="Context" width="100%" />
</p>

<h1 align="center">Context MCP Server</h1>
<p align="center">Browse, trade, and create prediction markets from any AI agent.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/context-markets-mcp"><img src="https://img.shields.io/npm/v/context-markets-mcp" alt="npm" /></a>
  <a href="https://github.com/contextwtf/context-mcp/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License: MIT" /></a>
  <a href="https://discord.gg/RVmzZsAyM4"><img src="https://img.shields.io/badge/Discord-Join-7289da" alt="Discord" /></a>
</p>

## Quick Start

### Claude Code

```bash
claude mcp add context-markets -- npx context-markets-mcp
```

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "context-markets": {
      "command": "npx",
      "args": ["context-markets-mcp"]
    }
  }
}
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
| `context_list_markets` | List and search prediction markets on Context Markets | `query`, `status`, `category`, `sortBy`, `limit` |
| `context_get_market` | Get detailed information about a specific prediction market | `marketId` |
| `context_get_quotes` | Get current bid/ask/last prices for a market's YES and NO outcomes | `marketId` |
| `context_get_orderbook` | Get the orderbook (bid/ask ladder) for a market | `marketId`, `depth` |
| `context_simulate_trade` | Simulate a trade to estimate fill price, cost, and slippage | `marketId`, `side`, `amount` |
| `context_price_history` | Get historical price data for a market over a specified timeframe | `marketId`, `timeframe` |
| `context_get_oracle` | Get the AI oracle's resolution analysis for a market | `marketId` |
| `context_global_activity` | Get recent trading activity across all markets | -- |

### Account setup and funding

| Tool | Description | Key Params |
|------|-------------|------------|
| `context_generate_wallet` | Generate a new wallet or import an existing key | `privateKey`, `apiKey`, `overwrite` |
| `context_wallet_status` | Get address, balances, and approval status | -- |
| `context_account_setup` | Approve USDC spending and operator permissions | -- |
| `context_deposit` | Deposit USDC into the exchange | `amount` |
| `context_withdraw` | Withdraw USDC from the exchange back to your wallet | `amount` |
| `context_mint_test_usdc` | Mint test USDC on Base Sepolia | `amount` |

### Trading and orders

| Tool | Description | Key Params |
|------|-------------|------------|
| `context_place_order` | Place a buy or sell order on a prediction market | `marketId`, `outcome`, `side`, `size`, `price` |
| `context_cancel_order` | Cancel an open order | `nonce` |
| `context_cancel_replace_order` | Atomically cancel an existing order and place a new one | `cancelNonce`, `marketId`, `outcome`, `side`, `priceCents`, `size` |
| `context_my_orders` | List your open orders | `marketId` |
| `context_bulk_create_orders` | Create multiple orders in a single atomic batch | `orders` |
| `context_bulk_cancel_orders` | Cancel multiple open orders in a single batch | `nonces` |
| `context_bulk_orders` | Atomically create and cancel orders in a single batch | `creates`, `cancelNonces` |

### Portfolio

| Tool | Description | Key Params |
|------|-------------|------------|
| `context_get_portfolio` | Get positions with P&L | `kind` |
| `context_get_balance` | Get USDC balance and token holdings | -- |

### Market creation

| Tool | Description | Key Params |
|------|-------------|------------|
| `context_create_market` | Create a market from a question | `question` |
| `context_agent_submit_market` | Submit a fully formed market draft, wait for oracle approval, and create it on-chain | `formattedQuestion`, `shortQuestion`, `marketType`, `evidenceMode`, `resolutionCriteria`, `endTime` |

## Key Concepts

- **Prices are in cents** (1–99). A price of 65 means $0.65 per share.
- **Outcomes are yes or no.** Each market is a binary question.
- **Read-only tools work with zero config.** Trading tools need a wallet — run `context_generate_wallet` first.
- **Shared config.** The MCP server and [CLI](https://github.com/contextwtf/context-cli) share `~/.config/context/config.env`, so you only set up once.

## Documentation

- **[Tool Catalog](https://docs.context.markets/agents/mcp/tools)** — full list of tools with parameters and examples
- **[MCP Guide](https://docs.context.markets/agents/mcp)** — setup, configuration, and usage patterns

## Ecosystem

| Package | Description |
|---------|-------------|
| **[context-markets](https://github.com/contextwtf/context-sdk)** | TypeScript SDK for trading |
| **[context-markets-react](https://github.com/contextwtf/context-react)** | React hooks for market data and trading |
| **[context-markets-mcp](https://github.com/contextwtf/context-mcp)** | MCP server for AI agents |
| **[context-markets-cli](https://github.com/contextwtf/context-cli)** | CLI for trading from the terminal |
| **[context-skills](https://github.com/contextwtf/context-skills)** | AI agent skill files |
| **[context-plugin](https://github.com/contextwtf/context-plugin)** | Claude Code plugin |

## License

MIT — see [LICENSE](./LICENSE) for details.
