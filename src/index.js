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
    name: 'verity-score',
    version: '1.0.0',
  });
  registerAllTools(server, storage);
  return server;
}

/**
 * Mount MCP routes on an existing Express app.
 * Stateless mode: each POST creates a fresh server + transport.
 * @param {import('express').Express} app
 * @param {Object} storage - injected storage dependency
 */
export function mcpRoutes(app, storage) {
  const mcpLimiter = rateLimit({
    windowMs: 60_000,
    max: 10,
    message: { jsonrpc: '2.0', error: { code: -32000, message: 'Rate limit exceeded. Max 10 requests per minute.' }, id: null },
  });

  // POST /mcp — handle MCP JSON-RPC requests (stateless)
  app.post('/mcp', mcpLimiter, async (req, res) => {
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
      console.error('[MCP] POST /mcp error:', e.message);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        });
      }
    }
  });

  // GET /mcp — 405 (stateless = no SSE stream)
  app.get('/mcp', (_req, res) => {
    res.status(405).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed. Use POST for MCP requests.' },
      id: null,
    });
  });

  // DELETE /mcp — 405 (stateless = no session to terminate)
  app.delete('/mcp', (_req, res) => {
    res.status(405).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed. Stateless server — no sessions.' },
      id: null,
    });
  });

  console.info('[MCP] Verity Score MCP server mounted on /mcp (stateless, 5 tools, rate-limited 10 req/min)');
}
