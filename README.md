<p align="center">
  <img src="https://mainnet.contextcdn.com/ced823d63df9dff0390d9ad0a4e1ad3905dd199a6c50758c18a5c92a203adbd7" alt="Context" width="100%" />
</p>

<h1 align="center">Context MCP Server</h1>
<p align="center">Browse, trade, and create prediction markets from any AI agent.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@contextwtf/mcp"><img src="https://img.shields.io/npm/v/@contextwtf/mcp" alt="npm" /></a>
  <a href="https://github.com/contextwtf/context-mcp/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License: MIT" /></a>
  <a href="https://discord.gg/RVmzZsAyM4"><img src="https://img.shields.io/badge/Discord-Join-7289da" alt="Discord" /></a>
</p>

## Quick Start

### Claude Code

```bash
claude mcp add context-markets -- npx @contextwtf/mcp
```

### Claude Desktop

Add to your `claude_desktop_config.json`:

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

## Available Tools

### Read-only (no auth needed)

`context_list_markets` · `context_get_market` · `context_get_quotes` · `context_get_orderbook` · `context_simulate_trade` · `context_price_history` · `context_get_oracle` · `context_global_activity`

### Trading (requires API key + private key)

`context_place_order` · `context_cancel_order` · `context_my_orders` · `context_get_portfolio` · `context_get_balance` · `context_account_setup` · `context_mint_test_usdc` · `context_create_market`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CONTEXT_API_KEY` | For all tools | API key from context.markets |
| `CONTEXT_PRIVATE_KEY` | For trading only | Ethereum private key for signing |

Read-only tools work with zero config. Need an API key? Visit [context.markets](https://context.markets).

## Documentation

- **[Tool Catalog](https://docs.context.markets/agents/mcp/tools)** — full list of tools with parameters and examples
- **[MCP Guide](https://docs.context.markets/agents/mcp)** — setup, configuration, and usage patterns

## Ecosystem

| Package | Description |
|---------|-------------|
| **[context-markets](https://github.com/contextwtf/context-sdk)** | TypeScript SDK for trading |
| **[@contextwtf/react](https://github.com/contextwtf/context-react)** | React hooks for market data and trading |
| **[@contextwtf/mcp](https://github.com/contextwtf/context-mcp)** | MCP server for AI agents |
| **[@contextwtf/cli](https://github.com/contextwtf/context-cli)** | CLI for trading from the terminal |
| **[context-skills](https://github.com/contextwtf/context-skills)** | AI agent skill files |
| **[context-plugin](https://github.com/contextwtf/context-plugin)** | Claude Code plugin |

## License

MIT — see [LICENSE](./LICENSE) for details.
