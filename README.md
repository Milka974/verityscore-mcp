# @verityscore/mcp-server

MCP (Model Context Protocol) server for [Verity Score](https://verityscore.io) — the Shopify-first GEO audit platform.

## 5 Tools

| Tool | Description |
|------|-------------|
| `get_geo_score` | GEO readiness score for a Shopify store (8 dimensions, top findings, report link) |
| `check_ai_readiness` | Real-time check of 5 AI discovery files (robots.txt, llms.txt, ai.txt, agent-card.json, sitemap.xml) |
| `get_recommendations` | Top 3 priority fixes with estimated revenue impact |
| `explain_topic` | Expert guides on 19 GEO & AI commerce topics |
| `get_vertical_info` | Checklists & benchmarks for 15 e-commerce verticals |

## Quick Start

### Use the hosted server (recommended)

Add to your Claude Desktop or MCP client config:

```json
{
  "mcpServers": {
    "verity-score": {
      "url": "https://mcp.verityscore.io/mcp"
    }
  }
}
```

### Run locally

```bash
npx @verityscore/mcp-server
```

The server starts on `http://localhost:3100/mcp`.

### Test with curl

```bash
# List all tools
curl -X POST http://localhost:3100/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# Check AI readiness of any site
curl -X POST http://localhost:3100/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"check_ai_readiness","arguments":{"domain":"mybrand.com"}},"id":2}'
```

## Architecture

- **Transport**: Streamable HTTP (stateless)
- **Auth**: None (rate-limited to 10 req/min/IP)
- **Protocol**: MCP v2025-03-26
- **SDK**: `@modelcontextprotocol/sdk` v1.x

## Tools Detail

### `get_geo_score`

Returns the GEO audit score for a Shopify store. If the store has been audited, returns scores across 8 dimensions + top 5 issues. If not yet audited, queues it for analysis within 72 hours.

```
Input:  { "domain": "mybrand.com" }
Output: { "status": "audited", "scores": [...], "topIssues": [...], "reportUrl": "..." }
```

### `check_ai_readiness`

Real-time check of 5 AI discovery files. No database needed — fetches files directly from the target domain.

```
Input:  { "domain": "mybrand.com" }
Output: { "score": 3, "maxScore": 5, "checks": [...], "recommendation": "..." }
```

### `get_recommendations`

Returns top 3 actionable fixes sorted by revenue impact.

```
Input:  { "domain": "mybrand.com" }
Output: { "totalIssues": 42, "topRecommendations": [{ "priority": 1, "title": "...", "fix": "..." }] }
```

### `explain_topic`

Expert knowledge base covering 19 GEO topics. Fuzzy-matches by slug, tag, or title.

```
Input:  { "topic": "schema.org" }
Output: { "title": "Schema.org Product: Why and How", "keyPoints": [...], "readMore": {...} }
```

### `get_vertical_info`

Checklists and benchmarks for 15 e-commerce verticals. Without argument, lists all verticals.

```
Input:  { "vertical": "beauty" }
Output: { "checklist": { "requiredContent": [...], "expectedTrust": [...] }, "benchmarks": {...} }
```

## Links

- **Hosted MCP**: https://mcp.verityscore.io/mcp
- **Website**: https://verityscore.io
- **Free Audit**: https://verityscore.io/fr/
- **Knowledge Base**: https://verityscore.io/en/kb/
- **Agent Card**: https://verityscore.io/.well-known/agent-card.json

## License

MIT
