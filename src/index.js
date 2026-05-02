// ═══════════════════════════════════════════════════════════════════════
// MCP SERVER — Verity Score MCP entry point
// -----------------------------------------------------------------------
// Creates a stateless MCP server with 5 read-only tools.
// Designed for microservice extraction: receives `storage` via injection.
// Mount: mcpRoutes(app, storage) in the main Express server.
// ═══════════════════════════════════════════════════════════════════════

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { registerAllTools } from './tools.js';
import rateLimit from 'express-rate-limit';

/**
 * Create a fresh McpServer with all tools registered.
 * Called per-request in stateless mode.
 * @param {Object} storage - injected storage dependency
 * @returns {McpServer}
 */
function createMcpServer(storage) {
  const server = new McpServer({
    name: 'io.verityscore/geo-audit',
    version: '1.0.1',
  }, {
    instructions: 'Verity Score provides GEO readiness auditing for Shopify e-commerce stores. Use check_ai_readiness for a quick real-time check of any website. Use get_geo_score for a full audit score (queues unknown stores for 72h analysis). Use get_recommendations for actionable fixes. Use explain_topic to learn about GEO concepts (schema.org, robots.txt, llms.txt, etc.). Use get_vertical_info for industry-specific checklists.',
  });
  registerAllTools(server, storage);
  return server;
}

/**
 * Mount MCP routes on an existing Express app.
 * Stateless mode: each POST creates a fresh server + transport.
 * GET and DELETE are routed through the SDK transport for proper spec compliance
 * (Origin header validation, protocol version checks).
 * @param {import('express').Express} app
 * @param {Object} storage - injected storage dependency
 */
export function mcpRoutes(app, storage) {
  const mcpLimiter = rateLimit({
    windowMs: 60_000,
    max: 10,
    message: { jsonrpc: '2.0', error: { code: -32000, message: 'Rate limit exceeded. Max 10 requests per minute.' }, id: null },
  });

  // All methods routed through SDK transport for spec-compliant handling:
  // - POST: handle MCP JSON-RPC requests
  // - GET: SDK returns 405 in stateless mode (no SSE)
  // - DELETE: SDK returns 405 in stateless mode (no sessions)
  // This ensures Origin header validation and proper error formats on all methods.
  const mcpHandler = async (req, res) => {
    try {
      const server = createMcpServer(storage);
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // stateless — no session tracking
      });
      res.on('close', () => {
        transport.close().catch(() => {});
        server.close().catch(() => {});
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (e) {
      console.error(`[MCP] ${req.method} /mcp error:`, e.message);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        });
      }
    }
  };

  app.post('/mcp', mcpLimiter, mcpHandler);
  app.get('/mcp', mcpHandler);
  app.delete('/mcp', mcpHandler);

  console.info('[MCP] Verity Score MCP server mounted on /mcp (stateless, 5 tools, rate-limited 10 req/min)');
}
