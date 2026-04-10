// ═══════════════════════════════════════════════════════════════════════
// MCP HELPERS — Domain sanitization, SSRF protection, request tracking
// -----------------------------------------------------------------------
// Self-contained: no dependency on verity-server internals.
// ═══════════════════════════════════════════════════════════════════════

import { lookup } from 'dns/promises';

/**
 * Sanitize a domain input: strip protocol, www, path, query, hash.
 * @param {string} raw
 * @returns {string} clean domain (e.g. "soskin.fr")
 * @throws {Error} if domain is invalid
 */
export function sanitizeDomain(raw) {
  if (!raw || typeof raw !== 'string') throw new Error('Domain is required');
  let d = raw.trim().toLowerCase();
  // Strip protocol
  d = d.replace(/^https?:\/\//, '');
  // Strip www.
  d = d.replace(/^www\./, '');
  // Strip path, query, hash
  d = d.split('/')[0].split('?')[0].split('#')[0];
  // Validate format
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(d)) {
    throw new Error(`Invalid domain: "${d}"`);
  }
  if (d.length < 3 || d.length > 100) throw new Error('Domain must be 3-100 characters');
  return d;
}

// Private/reserved IP ranges
const PRIVATE_PATTERNS = [
  /^127\./,               // loopback
  /^10\./,                // class A private
  /^192\.168\./,          // class C private
  /^172\.(1[6-9]|2\d|3[01])\./, // class B private
  /^169\.254\./,          // link-local
  /^0\./,                 // current network
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // shared address space
];
const BLOCKED_HOSTS = new Set(['localhost', '0.0.0.0', '::1', 'metadata.google.internal']);

/**
 * Check if a hostname resolves to a private/reserved IP (SSRF protection).
 * @param {string} hostname
 * @returns {Promise<boolean>} true if safe, false if private/blocked
 */
export async function isSafeHost(hostname) {
  if (BLOCKED_HOSTS.has(hostname)) return false;
  // Check if hostname looks like a raw IP
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    return !PRIVATE_PATTERNS.some(p => p.test(hostname));
  }
  // DNS resolve to check for rebinding
  try {
    const { address } = await lookup(hostname);
    return !PRIVATE_PATTERNS.some(p => p.test(address));
  } catch {
    return false; // DNS failure = blocked
  }
}

/**
 * Fetch a URL with timeout and SSRF protection.
 * @param {string} url
 * @param {number} timeoutMs
 * @returns {Promise<{ ok: boolean, status?: number, text?: string, error?: string }>}
 */
export async function safeFetch(url, timeoutMs = 8000) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return { ok: false, error: 'HTTPS required' };
    const safe = await isSafeHost(parsed.hostname);
    if (!safe) return { ok: false, error: 'Blocked: private/reserved IP' };

    const resp = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { 'User-Agent': 'VerityScore-MCP/1.0 (+https://verityscore.io)' },
      redirect: 'follow',
    });
    const text = await resp.text();
    return { ok: resp.ok, status: resp.status, text: text.substring(0, 50000) };
  } catch (e) {
    return { ok: false, error: e.message?.substring(0, 100) || 'Fetch failed' };
  }
}

/**
 * Track an MCP request (fire-and-forget).
 * @param {Object} storage - storage instance (injected)
 * @param {Object} params - { tool, input, ip, userAgent, responseStatus, domain }
 */
export function trackRequest(storage, { tool, input, ip, userAgent, responseStatus, domain }) {
  if (!storage?.trackMcpRequest) return;
  storage.trackMcpRequest({ tool, input, ip, userAgent, responseStatus, domain, timestamp: new Date() }).catch(() => {});
}
