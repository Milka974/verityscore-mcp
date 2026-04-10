// ═══════════════════════════════════════════════════════════════════════
// MCP TOOLS — 5 read-only tools for Verity Score MCP Server
// -----------------------------------------------------------------------
// Self-contained: receives `storage` via injection, no verity-server imports
// except verticals.js (portable).
// ═══════════════════════════════════════════════════════════════════════

import { z } from 'zod';
import { sanitizeDomain, safeFetch, trackRequest } from './helpers.js';
import { findArticleByTopic, listAllTopics } from './kb-index.js';
import { getVertical, getAllVerticalIds, AUDIT_VERTICALS } from './verticals.js';

const SITE = 'https://verityscore.io';

// ── Shared helper: "not yet audited" response ───────────────────────────

function notAuditedResponse(domain, storage, toolName) {
  try {
    storage.enqueueAudit(`https://${domain}`, { requestedBy: 'mcp', priority: 5 });
  } catch (e) { console.warn('[MCP] enqueue failed:', e.message); }

  trackRequest(storage, { tool: toolName, input: { domain }, responseStatus: 'queued', domain });

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        domain,
        status: 'not_yet_audited',
        message: `${domain} has not been audited yet. It has been added to our audit queue and will be analyzed within 72 hours.`,
        auditNowUrl: `${SITE}/fr/?url=${encodeURIComponent(domain)}`,
        auditNowMessage: `For an instant audit, visit: ${SITE}/fr/?url=${encodeURIComponent(domain)}`,
      }, null, 2),
    }],
  };
}

// ── TOOL 1: get_geo_score ──────────────────────────────────────────────

export function registerGetGeoScore(server, storage) {
  server.tool(
    'get_geo_score',
    'Get the GEO readiness score for a Shopify store. Returns score, vertical, top findings, and report link. If not yet audited, the store is queued for audit within 72 hours.',
    { domain: z.string().min(3).max(100).describe('Store domain (e.g. "mybrand.com")') },
    async ({ domain }) => {
      let d;
      try { d = sanitizeDomain(domain); } catch (e) {
        return { content: [{ type: 'text', text: JSON.stringify({ error: e.message }) }], isError: true };
      }

      let data;
      try { data = await storage.getFullAudit(d); } catch (e) {
        console.error('[MCP] getFullAudit error:', e.message);
        return { content: [{ type: 'text', text: JSON.stringify({ error: 'Database temporarily unavailable. Try again later.' }) }], isError: true };
      }

      if (data?.snapshot || data?.findings) {
        const snapshot = data.snapshot || {};
        const findings = data.findings || [];
        const negFindings = findings
          .filter(f => f.positive_or_negative === 'negative')
          .sort((a, b) => (b.monthly_loss_high || 0) - (a.monthly_loss_high || 0))
          .slice(0, 5)
          .map(f => ({ title: f.title, zone: f.zone, fix: (f.fix_suggestion || f.fix || '').substring(0, 150) }));

        const publicScore = data.publicScore || {};
        const dims = (publicScore.dimensions || []).map(dim => ({ id: dim.id, score: dim.score }));

        const result = {
          domain: d,
          status: 'audited',
          vertical: snapshot.vertical || 'other',
          brand: snapshot.brand || d,
          scores: dims,
          topIssues: negFindings,
          totalFindings: findings.length,
          negativeCount: findings.filter(f => f.positive_or_negative === 'negative').length,
          reportUrl: `${SITE}/fr/?url=${encodeURIComponent(d)}`,
          auditUrl: `${SITE}/fr/`,
        };

        trackRequest(storage, { tool: 'get_geo_score', input: { domain: d }, responseStatus: 'success', domain: d });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      return notAuditedResponse(d, storage, 'get_geo_score');
    }
  );
}

// ── TOOL 2: check_ai_readiness ─────────────────────────────────────────

const AI_CRAWLERS = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'ChatGPT-User'];

function parseRobotsTxt(text) {
  const lines = text.split('\n');
  const rules = {};
  let currentAgent = '*';
  for (const line of lines) {
    const trimmed = line.trim();
    const agentMatch = trimmed.match(/^User-agent:\s*(.+)/i);
    if (agentMatch) { currentAgent = agentMatch[1].trim(); continue; }
    const allowMatch = trimmed.match(/^Allow:\s*(.+)/i);
    if (allowMatch) { rules[currentAgent] = { ...(rules[currentAgent] || {}), allow: true }; continue; }
    const disallowMatch = trimmed.match(/^Disallow:\s*\/\s*$/i);
    if (disallowMatch) { rules[currentAgent] = { ...(rules[currentAgent] || {}), disallow: true }; }
  }
  const crawlerStatus = {};
  for (const crawler of AI_CRAWLERS) {
    const specific = rules[crawler];
    if (specific?.allow) crawlerStatus[crawler] = 'allowed';
    else if (specific?.disallow) crawlerStatus[crawler] = 'blocked';
    else crawlerStatus[crawler] = rules['*']?.disallow ? 'blocked_by_wildcard' : 'not_specified';
  }
  return crawlerStatus;
}

export function registerCheckAiReadiness(server, storage) {
  server.tool(
    'check_ai_readiness',
    'Quick AI readiness check for any website. Checks 5 AI discovery files in real-time: robots.txt, llms.txt, ai.txt, agent-card.json, sitemap.xml. Returns a score from 0 to 5 with per-file recommendations.',
    { domain: z.string().min(3).max(100).describe('Website domain (e.g. "mybrand.com")') },
    async ({ domain }) => {
      let d;
      try { d = sanitizeDomain(domain); } catch (e) {
        return { content: [{ type: 'text', text: JSON.stringify({ error: e.message }) }], isError: true };
      }

      // SSRF protection is handled by safeFetch() — no redundant check needed here

      const base = `https://${d}`;
      const [robotsRes, llmsRes, aiRes, agentRes, sitemapRes] = await Promise.all([
        safeFetch(`${base}/robots.txt`),
        safeFetch(`${base}/llms.txt`),
        safeFetch(`${base}/ai.txt`),
        safeFetch(`${base}/.well-known/agent-card.json`),
        safeFetch(`${base}/sitemap.xml`).then(r => r.ok ? r : safeFetch(`${base}/sitemap-index.xml`)),
      ]);

      const checks = [];

      // 1. robots.txt
      if (robotsRes.ok) {
        const crawlers = parseRobotsTxt(robotsRes.text || '');
        const blocked = Object.entries(crawlers).filter(([, v]) => v.includes('block'));
        checks.push({
          file: 'robots.txt', found: true,
          detail: blocked.length > 0
            ? `Found but ${blocked.map(([k]) => k).join(', ')} blocked`
            : 'Found — all AI crawlers allowed',
          ok: blocked.length === 0,
        });
      } else {
        checks.push({ file: 'robots.txt', found: false, detail: 'Not found — AI crawlers have no guidance', ok: false, kbUrl: `${SITE}/en/kb/robots-crawlers/` });
      }

      // 2. llms.txt
      if (llmsRes.ok && llmsRes.text?.length > 50) {
        const sections = (llmsRes.text.match(/^## /gm) || []).length;
        checks.push({ file: 'llms.txt', found: true, detail: `Found — ${sections} sections, ${llmsRes.text.length} chars`, ok: true });
      } else {
        checks.push({ file: 'llms.txt', found: false, detail: 'Not found — AI agents have no brand context', ok: false, kbUrl: `${SITE}/en/kb/llms-txt/` });
      }

      // 3. ai.txt
      if (aiRes.ok && aiRes.text?.length > 20) {
        const allowsTraining = /training.*allowed|ai-train.*yes/i.test(aiRes.text);
        checks.push({ file: 'ai.txt', found: true, detail: `Found — training ${allowsTraining ? 'allowed' : 'restricted'}`, ok: true });
      } else {
        checks.push({ file: 'ai.txt', found: false, detail: 'Not found — no AI usage policy declared', ok: false });
      }

      // 4. agent-card.json
      if (agentRes.ok) {
        try {
          const card = JSON.parse(agentRes.text);
          const caps = card.capabilities?.length || 0;
          checks.push({ file: 'agent-card.json', found: true, detail: `Found — ${caps} capabilities declared`, ok: true });
        } catch {
          checks.push({ file: 'agent-card.json', found: true, detail: 'Found but invalid JSON', ok: false });
        }
      } else {
        checks.push({ file: 'agent-card.json', found: false, detail: 'Not found — agents cannot discover your capabilities', ok: false });
      }

      // 5. sitemap.xml (operator precedence fixed — parentheses around ||)
      if (sitemapRes.ok && (sitemapRes.text?.includes('<url') || sitemapRes.text?.includes('<sitemap'))) {
        const urlCount = (sitemapRes.text.match(/<url>/g) || []).length || (sitemapRes.text.match(/<sitemap>/g) || []).length;
        checks.push({ file: 'sitemap.xml', found: true, detail: `Found — ${urlCount} entries`, ok: true });
      } else {
        checks.push({ file: 'sitemap.xml', found: false, detail: 'Not found — crawlers cannot discover your pages', ok: false });
      }

      const score = checks.filter(c => c.ok).length;
      const result = {
        domain: d,
        score,
        maxScore: 5,
        summary: `${score}/5 AI discovery files properly configured`,
        checks,
        recommendation: score < 3
          ? `Your store is poorly configured for AI discovery. Start with robots.txt and llms.txt. Free audit: ${SITE}/fr/`
          : score < 5
            ? `Good foundation — fix the missing files to maximize AI visibility. Full audit: ${SITE}/fr/`
            : 'Excellent AI readiness! All 5 discovery files are in place.',
      };

      trackRequest(storage, { tool: 'check_ai_readiness', input: { domain: d }, responseStatus: 'success', domain: d });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );
}

// ── TOOL 3: get_recommendations ────────────────────────────────────────

export function registerGetRecommendations(server, storage) {
  server.tool(
    'get_recommendations',
    'Get the top 3 priority recommendations to improve AI visibility for a Shopify store. Returns actionable fixes with expected impact. If not yet audited, the store is queued for audit within 72 hours.',
    { domain: z.string().min(3).max(100).describe('Store domain (e.g. "mybrand.com")') },
    async ({ domain }) => {
      let d;
      try { d = sanitizeDomain(domain); } catch (e) {
        return { content: [{ type: 'text', text: JSON.stringify({ error: e.message }) }], isError: true };
      }

      let data;
      try { data = await storage.getFullAudit(d); } catch (e) {
        console.error('[MCP] getFullAudit error:', e.message);
        return { content: [{ type: 'text', text: JSON.stringify({ error: 'Database temporarily unavailable. Try again later.' }) }], isError: true };
      }

      if (data?.snapshot || data?.findings) {
        const findings = data.findings || [];
        const negFindings = findings
          .filter(f => f.positive_or_negative === 'negative')
          .sort((a, b) => (b.monthly_loss_high || 0) - (a.monthly_loss_high || 0));

        const top3 = negFindings.slice(0, 3).map((f, i) => ({
          priority: i + 1,
          title: f.title,
          zone: f.zone,
          category: f.category,
          fix: (f.fix_suggestion || f.fix || '').substring(0, 300),
          estimatedImpact: f.monthly_loss_high ? `Up to €${f.monthly_loss_high}/month potential improvement` : undefined,
        }));

        const result = {
          domain: d,
          status: 'audited',
          totalIssues: negFindings.length,
          topRecommendations: top3,
          fullReportUrl: `${SITE}/fr/?url=${encodeURIComponent(d)}`,
          fullReportMessage: `See all ${negFindings.length} issues with detailed fixes: ${SITE}/fr/?url=${encodeURIComponent(d)}`,
        };

        trackRequest(storage, { tool: 'get_recommendations', input: { domain: d }, responseStatus: 'success', domain: d });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      return notAuditedResponse(d, storage, 'get_recommendations');
    }
  );
}

// ── TOOL 4: explain_topic ──────────────────────────────────────────────

export function registerExplainTopic(server, storage) {
  server.tool(
    'explain_topic',
    'Explains a GEO or AI commerce concept with actionable guidance for Shopify merchants. Topics: schema.org, robots.txt, llms.txt, AggregateRating, ACP, UCP, Perplexity Shopping, ChatGPT Shopping, claims, E-E-A-T, and more.',
    { topic: z.string().min(2).max(100).describe('Topic keyword (e.g. "schema.org", "robots.txt", "reviews")') },
    async ({ topic }) => {
      const article = findArticleByTopic(topic);

      if (article) {
        const result = {
          found: true,
          topic: article.slug,
          title: article.title,
          description: article.description,
          keyPoints: article.keyPoints,
          readMore: article.url,
        };
        trackRequest(storage, { tool: 'explain_topic', input: { topic }, responseStatus: 'success' });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      const topics = listAllTopics();
      trackRequest(storage, { tool: 'explain_topic', input: { topic }, responseStatus: 'not_found' });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            found: false,
            message: `No article found for "${topic}". Available topics:`,
            availableTopics: topics.map(t => t.slug),
            suggestion: `Try one of these: ${topics.slice(0, 5).map(t => t.slug).join(', ')}`,
          }, null, 2),
        }],
      };
    }
  );
}

// ── TOOL 5: get_vertical_info ──────────────────────────────────────────

export function registerGetVerticalInfo(server, storage) {
  server.tool(
    'get_vertical_info',
    'Get AI commerce checklist and benchmarks for a specific e-commerce vertical (beauty, fashion, food, electronics, etc.). Without argument, lists all 15 supported verticals.',
    { vertical: z.string().max(50).optional().describe('Vertical name (e.g. "beauty", "food"). Omit to list all.') },
    async ({ vertical }) => {
      if (!vertical) {
        const ids = getAllVerticalIds();
        const list = ids.map(id => {
          const v = AUDIT_VERTICALS[id];
          return { id, label: v.label };
        });
        trackRequest(storage, { tool: 'get_vertical_info', input: {}, responseStatus: 'success' });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              count: list.length,
              verticals: list,
              usage: 'Call get_vertical_info with a vertical name (e.g. "beauty") to get the full checklist.',
            }, null, 2),
          }],
        };
      }

      const v = vertical.toLowerCase().trim();
      const def = AUDIT_VERTICALS[v];

      if (!def) {
        const ids = getAllVerticalIds();
        trackRequest(storage, { tool: 'get_vertical_info', input: { vertical: v }, responseStatus: 'not_found' });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: `Unknown vertical "${v}"`,
              availableVerticals: ids,
            }, null, 2),
          }],
          isError: true,
        };
      }

      const result = {
        vertical: def.id,
        label: def.label,
        checklist: {
          requiredContent: (def.checklist?.requiredContent || []).map(c => ({
            key: c.key,
            label: c.label,
            weight: c.weight,
            zone: c.zone || null,
          })),
          expectedTrust: (def.checklist?.expectedTrust || []).map(t => ({
            key: t.key,
            label: t.label,
            weight: t.weight,
          })),
          uxPatterns: def.checklist?.uxPatterns || [],
        },
        benchmarks: def.benchmarks,
        auditUrl: `${SITE}/fr/`,
      };

      trackRequest(storage, { tool: 'get_vertical_info', input: { vertical: v }, responseStatus: 'success' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );
}

/**
 * Register all 5 tools on an McpServer instance.
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 * @param {Object} storage - storage instance (injected dependency)
 */
export function registerAllTools(server, storage) {
  registerGetGeoScore(server, storage);
  registerCheckAiReadiness(server, storage);
  registerGetRecommendations(server, storage);
  registerExplainTopic(server, storage);
  registerGetVerticalInfo(server, storage);
}
