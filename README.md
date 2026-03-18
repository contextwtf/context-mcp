<p align="center">
  <img src="https://mainnet.contextcdn.com/ced823d63df9dff0390d9ad0a4e1ad3905dd199a6c50758c18a5c92a203adbd7" alt="Context" width="100%" />
</p>

<h1 align="center">Context MCP Server</h1>
<p align="center">Browse, trade, and create prediction markets from any AI agent.</p>

<p align="center">
  <a href="https://github.com/contextwtf/context-mcp"><img src="https://img.shields.io/npm/v/context-markets-mcp" alt="npm" /></a>
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

`context_list_markets` · `context_get_market` · `context_get_quotes` · `context_get_orderbook` · `context_simulate_trade` · `context_price_history` · `context_get_oracle` · `context_global_activity`

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
