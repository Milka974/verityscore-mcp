// ═══════════════════════════════════════════════════════════════════════
// MCP KB INDEX — Static index of Knowledge Base articles for explain_topic
// -----------------------------------------------------------------------
// Self-contained module: no dependency on verity-server internals.
// Ready for microservice extraction.
// ═══════════════════════════════════════════════════════════════════════

const BASE = 'https://verityscore.io';

const KB_ARTICLES = [
  {
    slug: 'schema-org',
    title: 'Schema.org Product: Why and How on Shopify',
    description: 'How to implement schema.org Product, Offer, and AggregateRating markup on Shopify for AI visibility.',
    tags: ['schema-org', 'schema.org', 'structured-data', 'json-ld', 'product', 'offer', 'shopify'],
    keyPoints: [
      'Schema.org Product is the language AI crawlers use to understand your products',
      'Pages with structured data are cited 3.1x more in AI Overviews',
      'Shopify generates basic schema but often misses GTIN, AggregateRating, and OfferShippingDetails',
    ],
  },
  {
    slug: 'aggregate-rating',
    title: 'AggregateRating: Making Your Reviews AI-Readable',
    description: 'Why customer reviews are often invisible to AI and how to expose AggregateRating properly.',
    tags: ['aggregate-rating', 'reviews', 'avis', 'rating', 'schema-org', 'judge.me', 'yotpo'],
    keyPoints: [
      'Reviews in JavaScript-only widgets are invisible to AI crawlers',
      'AggregateRating in JSON-LD makes reviews machine-readable',
      '8 structured reviews outweigh 200 JS-only reviews for AI recommendation',
    ],
  },
  {
    slug: 'robots-crawlers',
    title: 'robots.txt and AI Crawlers: Access Control',
    description: 'How to configure robots.txt for AI search and on-demand crawlers without confusing them with training-policy bots.',
    tags: ['robots.txt', 'robots', 'crawlers', 'gptbot', 'claudebot', 'perplexitybot', 'ai-crawlers', 'access'],
    keyPoints: [
      'Blocking search/on-demand AI crawlers can reduce shopping visibility in ChatGPT, Claude, and Perplexity',
      'Cloudflare may inject Disallow rules for AI bots without your knowledge',
      'Allow visibility crawlers such as OAI-SearchBot, Claude-SearchBot, PerplexityBot, ChatGPT-User, Claude-User, and Perplexity-User; treat GPTBot, ClaudeBot, Google-Extended, and Applebot-Extended as training/policy controls',
    ],
  },
  {
    slug: 'llms-txt',
    title: 'llms.txt: The New robots.txt for LLMs',
    description: 'What is llms.txt, why add it to your Shopify store, and how to write it for AI agents.',
    tags: ['llms.txt', 'llms', 'ai-context', 'brand-context', 'ai-crawlers'],
    keyPoints: [
      'llms.txt gives AI agents structured context about your brand and products',
      'It works like a pitch deck for AI — who you are, what you sell, why you matter',
      'Include links to your key pages, KB articles, and product categories',
    ],
  },
  {
    slug: 'geo-audit',
    title: 'GEO Audit: Optimize Your Shopify Store for AI',
    description: 'A GEO audit measures your store visibility in ChatGPT, Perplexity, and Google AI Mode. Complete guide.',
    tags: ['geo', 'audit', 'geo-audit', 'ai-visibility', 'optimization', 'diagnostic'],
    keyPoints: [
      'A GEO audit checks 149 signals across 8 dimensions of AI readiness',
      'It identifies what AI crawlers can and cannot see on your product pages',
      'Results include prioritized fixes with Shopify-specific instructions',
    ],
  },
  {
    slug: 'geo-readiness',
    title: 'Understanding Your GEO Score: 9 Factors',
    description: 'The GEO Score measures your Shopify store visibility for AI agents. 9 factors explained.',
    tags: ['geo', 'geo-score', 'score', 'readiness', 'factors', 'ai-visibility'],
    keyPoints: [
      'The GEO Score ranges from 0-100 across 8 scoring dimensions',
      'Key factors: crawler access, schema completeness, review exposure, content quality',
      'Stores above 80% see 3-4x more AI recommendations than stores below 50%',
    ],
  },
  {
    slug: 'geo-vs-seo',
    title: "GEO vs SEO: What's the Difference?",
    description: 'SEO optimizes for blue links, GEO for AI answers. Differences and complementarities.',
    tags: ['geo', 'seo', 'comparison', 'difference', 'ai-visibility', 'search'],
    keyPoints: [
      'SEO optimizes for Google ranking, GEO optimizes for AI recommendations',
      'Technical SEO is a prerequisite for GEO — both are needed',
      'E-commerce has the lowest overlap between Google rankings and AI citations',
    ],
  },
  {
    slug: 'acp-agentic-commerce-protocol',
    title: 'ACP — Agentic Commerce Protocol: Shopify Guide',
    description: 'What is ACP, how to enable it on Shopify, and sell through ChatGPT Shopping.',
    tags: ['acp', 'agentic-commerce-protocol', 'chatgpt-shopping', 'openai', 'product-feed', 'shopping'],
    keyPoints: [
      'ACP is how ChatGPT Shopping discovers and recommends products',
      '83% of ChatGPT product recommendations come from Google Shopping feeds',
      'Shopify merchants need a complete Merchant Center feed for ACP visibility',
    ],
  },
  {
    slug: 'ucp-universal-commerce-protocol',
    title: 'UCP — Universal Commerce Protocol: Shopify Guide',
    description: 'What is UCP, how Google and Shopify enable AI agent checkout.',
    tags: ['ucp', 'universal-commerce-protocol', 'google', 'shopify', 'checkout', 'agentic', 'cart'],
    keyPoints: [
      'UCP is the open standard by Google for AI agent commerce (cart, checkout, fulfillment)',
      'Co-developed with Shopify, Etsy, Walmart, Target, Mastercard, Visa',
      'Shopify activates UCP natively — check .well-known/ucp for your store',
    ],
  },
  {
    slug: 'perplexity-shopping',
    title: 'Perplexity Shopping: Merchant Guide',
    description: 'How Perplexity selects products, ranking factors, and optimization for Shopify.',
    tags: ['perplexity', 'perplexity-shopping', 'shopping', 'ranking', 'product-recommendations'],
    keyPoints: [
      'Perplexity ranks by: intent match, schema completeness, price freshness, review trust, checkout',
      'A small brand with complete schema can outrank a big brand with poor structured data',
      'Complete Product schema = +74.1% CTR on Perplexity',
    ],
  },
  {
    slug: 'sell-on-chatgpt-shopify',
    title: 'How to Sell on ChatGPT Shopping from Shopify',
    description: 'Setup checklist to get your Shopify products recommended by ChatGPT Shopping.',
    tags: ['chatgpt', 'chatgpt-shopping', 'sell', 'shopify', 'product-feed', 'visibility'],
    keyPoints: [
      'ChatGPT Shopping pulls 83% of its product data from Google Shopping',
      'Ensure your Google Merchant Center feed is complete (GTIN, price, availability)',
      'Structured reviews (AggregateRating) significantly boost recommendation probability',
    ],
  },
  {
    slug: 'what-is-agentic-commerce',
    title: 'What is Agentic Commerce? Complete Guide',
    description: 'AI agents buying on behalf of consumers. ACP, UCP protocols explained.',
    tags: ['agentic-commerce', 'ai-agents', 'commerce', 'acp', 'ucp', 'mcp', 'ai-shopping'],
    keyPoints: [
      'Agentic commerce = AI agents autonomously browsing, comparing, and purchasing for users',
      'Three protocols: ACP (ChatGPT), UCP (Google), MCP (tool integration)',
      'Shopify merchants benefit from native UCP support since January 2026',
    ],
  },
  {
    slug: 'claims-proof',
    title: 'Claims & Proof: Credibility for AI',
    description: 'How AI agents verify product claims and why unproven claims reduce recommendations.',
    tags: ['claims', 'proof', 'credibility', 'trust', 'anti-hallucination', 'verification'],
    keyPoints: [
      'AI agents increasingly prefer verifiable claims over marketing language',
      'Claims without machine-readable proof are ignored or flagged as unreliable',
      'Add certifications, test results, and structured data to back your claims',
    ],
  },
  {
    slug: 'eeat-signals-ai',
    title: 'E-E-A-T Signals for AI: Trust Evaluation',
    description: 'How AI agents evaluate trust using E-E-A-T signals. Expertise, authority, trust for Shopify.',
    tags: ['eeat', 'e-e-a-t', 'trust', 'expertise', 'authority', 'signals', 'ai-trust'],
    keyPoints: [
      'AI agents evaluate Experience, Expertise, Authoritativeness, and Trust just like Google',
      'Expert endorsements (dermatologist, vet, nutritionist) boost AI trust significantly',
      'Structured Organization schema with knowsAbout establishes topical authority',
    ],
  },
  {
    slug: 'conversational-content',
    title: 'Conversational Content: Writing for Humans AND AI',
    description: 'Structure product page content to be engaging for humans and actionable for AI.',
    tags: ['content', 'copywriting', 'conversational', 'writing', 'product-page', 'description'],
    keyPoints: [
      'AI agents extract factual statements, not marketing fluff',
      'Each paragraph should answer a specific buyer question',
      'Use concrete data points (weight, dimensions, ingredients) instead of vague adjectives',
    ],
  },
  {
    slug: 'pricing-ai-visibility',
    title: 'Pricing and AI Visibility',
    description: 'How AI agents compare prices and why pricing inconsistencies hurt recommendations.',
    tags: ['pricing', 'price', 'ai-visibility', 'comparison', 'offers', 'discounts'],
    keyPoints: [
      'Price mismatch between schema.org and displayed price disqualifies products from recommendations',
      'AI agents compare prices across merchants — competitive pricing matters',
      'Structured discount data (priceValidUntil, sale price) increases AI engagement',
    ],
  },
  {
    slug: 'shipping-returns',
    title: 'Shipping & Returns: AI-Readable Policies',
    description: 'How to structure shipping and return policies so AI agents can extract and compare them.',
    tags: ['shipping', 'returns', 'delivery', 'policy', 'livraison', 'retours', 'schema-org'],
    keyPoints: [
      'OfferShippingDetails and MerchantReturnPolicy in schema.org make policies machine-readable',
      'AI agents compare shipping speed and return windows across competitors',
      'Policy contradictions between pages destroy AI trust',
    ],
  },
  {
    slug: 'ai-buyer-score',
    title: 'AI Buyer Score: The Shopping Agent Checklist',
    description: 'How an AI shopping agent evaluates your store. 9 recommendability criteria.',
    tags: ['ai-buyer', 'ai-buyer-score', 'shopping-agent', 'recommendation', 'checklist', 'evaluation'],
    keyPoints: [
      'The AI Buyer Score simulates an autonomous shopping agent visiting your store',
      'It checks: price visibility, stock accuracy, review trust, checkout friction, data completeness',
      'Scores above 70 indicate the store is "recommendable" by AI agents',
    ],
  },
  {
    slug: 'chatgpt-app-shopify',
    title: 'ChatGPT App for Shopify: Build Your Own',
    description: 'How to build a dedicated ChatGPT App with loyalty, guided selling, and brand voice.',
    tags: ['chatgpt', 'chatgpt-app', 'shopify', 'mcp', 'openai', 'branded-ai', 'loyalty'],
    keyPoints: [
      'Shopify merchants can build branded ChatGPT experiences for their customers',
      'Use MCP to connect your product catalog, loyalty program, and order history',
      'A ChatGPT App differentiates you from competitors using generic AI assistants',
    ],
  },
];

// ── GEO Evidence Cards Index ──────────────────────────────────────────
// Bundled with the package: ./geo-evidence.json (shipped via package.json files).
// Provides platform-specific impact data, sources, and stats.

let _geoEvidenceCards = [];
try {
  const { createRequire } = await import('module');
  const require = createRequire(import.meta.url);
  const data = require('./geo-evidence.json');
  _geoEvidenceCards = data.cards || [];
} catch (_e) {
  // geo-evidence.json not found - graceful fallback
}

// Build search tags for evidence cards
const _evidenceSearchIndex = _geoEvidenceCards.map(card => ({
  id: card.id,
  searchTerms: [
    card.id,
    card.id.replace(/_/g, '-'),
    card.id.replace(/_/g, ' '),
    ...(card.label?.en || '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2),
    ...(card.label?.fr || '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2),
    card.category,
    ...(card.zones || []).map(z => z.toLowerCase()),
  ].filter(Boolean),
}));

/**
 * Find a GEO evidence card by topic.
 * @param {string} q - normalized query
 * @returns {object|null} evidence card
 */
function _findEvidenceCard(q) {
  // Exact id match
  let idx = _evidenceSearchIndex.findIndex(e => e.id === q || e.id === q.replace(/-/g, '_') || e.id === q.replace(/\s+/g, '_'));
  // Tag match
  if (idx < 0) idx = _evidenceSearchIndex.findIndex(e => e.searchTerms.includes(q) || e.searchTerms.includes(q.replace(/\s+/g, '-')));
  // Partial match
  if (idx < 0) idx = _evidenceSearchIndex.findIndex(e => e.searchTerms.some(t => t.includes(q) || q.includes(t)));
  if (idx < 0) return null;
  return _geoEvidenceCards[idx];
}

/**
 * Find the best matching KB article for a topic string.
 * Match priority: exact slug > exact tag > partial tag/title match.
 * Falls through to GEO evidence cards if no KB article found.
 * @param {string} topic
 * @returns {{ slug, title, description, url, keyPoints, _type: 'kb' } | { _type: 'evidence', ...card } | null}
 */
export function findArticleByTopic(topic) {
  if (!topic || typeof topic !== 'string') return null;
  const q = topic.toLowerCase().trim().replace(/[^a-z0-9\s.-]/g, '');

  // 1. Exact slug match
  let match = KB_ARTICLES.find(a => a.slug === q || a.slug === q.replace(/\s+/g, '-'));
  // 2. Exact tag match
  if (!match) match = KB_ARTICLES.find(a => a.tags.includes(q) || a.tags.includes(q.replace(/\s+/g, '-')));
  // 3. Partial match (tag or title contains query, or query contains tag)
  if (!match) match = KB_ARTICLES.find(a =>
    a.tags.some(t => t.includes(q) || q.includes(t)) ||
    a.title.toLowerCase().includes(q)
  );

  if (match) {
    return {
      _type: 'kb',
      slug: match.slug,
      title: match.title,
      description: match.description,
      url: { en: `${BASE}/en/kb/${match.slug}/`, fr: `${BASE}/fr/kb/${match.slug}/` },
      keyPoints: match.keyPoints,
    };
  }

  // 4. GEO Evidence card match (V2: platform impact + sources)
  const evidenceCard = _findEvidenceCard(q);
  if (evidenceCard) {
    return { _type: 'evidence', ...evidenceCard };
  }

  return null;
}

/**
 * List all available topics (slug + title), including evidence cards.
 * @returns {Array<{ slug, title }>}
 */
export function listAllTopics() {
  const kbTopics = KB_ARTICLES.map(a => ({ slug: a.slug, title: a.title }));
  const evidenceTopics = _geoEvidenceCards.map(c => ({ slug: c.id, title: c.label?.en || c.id }));
  return [...kbTopics, ...evidenceTopics];
}
