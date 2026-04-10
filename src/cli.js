#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════
// Verity Score MCP Server — Standalone CLI
// Usage: npx @verityscore/mcp-server
// Or:    node src/cli.js
// ═══════════════════════════════════════════════════════════════════════

import express from 'express';
import { mcpRoutes } from './index.js';

const PORT = parseInt(process.env.PORT || '3100', 10);
const app = express();
app.use(express.json());

// No-op storage for standalone mode (no MongoDB)
const standaloneStorage = {
  async getFullAudit() { return null; },
  async enqueueAudit(url) { console.log(`[MCP] Audit queued (standalone): ${url}`); },
  async trackMcpRequest(data) { console.log(`[MCP] ${data.tool}(${data.domain || data.input?.topic || ''})`); },
};

mcpRoutes(app, standaloneStorage);

app.listen(PORT, () => {
  console.log(`Verity Score MCP Server listening on http://localhost:${PORT}/mcp`);
  console.log(`Tools: get_geo_score, check_ai_readiness, get_recommendations, explain_topic, get_vertical_info`);
  console.log(`\nTest: curl -X POST http://localhost:${PORT}/mcp -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'`);
});
