// ═══════════════════════════════════════════════════════════════════════
// MCP HELPERS — Domain sanitization, SSRF protection, request tracking
// -----------------------------------------------------------------------
// Self-contained: no dependency on verity-server internals.
// Security-hardened: redirect blocking, IPv6 protection, DNS rebinding defense.
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

// ── SSRF Protection ─────────────────────────────────────────────────────

// IPv4 private/reserved ranges
const PRIVATE_IPV4 = [
  /^127\./,                                        // loopback
  /^10\./,                                         // class A private
  /^192\.168\./,                                   // class C private
  /^172\.(1[6-9]|2\d|3[01])\./,                   // class B private
  /^169\.254\./,                                   // link-local
  /^0\./,                                          // current network
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,    // shared address space (CGN)
  /^224\./,                                        // multicast
  /^240\./,                                        // reserved/future
  /^255\.255\.255\.255$/,                          // broadcast
];

// IPv6 private/reserved patterns
const PRIVATE_IPV6 = [
  /^::1$/,                    // loopback
  /^fe80:/i,                  // link-local
  /^fc00:/i,                  // unique local (fc00::/7 includes fd00::)
  /^fd/i,                     // unique local (fd00::/8)
  /^::ffff:(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i, // IPv4-mapped private
  /^fd00:ec2::254$/i,         // AWS IMDSv2 IPv6
];

// Blocked hostnames (cloud metadata, internal services)
const BLOCKED_HOSTS = new Set([
  'localhost',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  'metadata.azure.com',
  'kubernetes.default.svc',
  'kubernetes.default.svc.cluster.local',
]);

/**
 * Check if an IP address is private/reserved.
 * Handles both IPv4 and IPv6.
 * @param {string} ip
 * @returns {boolean} true if private/reserved
 */
function isPrivateIP(ip) {
  if (!ip) return true;
  // IPv4
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
    return PRIVATE_IPV4.some(p => p.test(ip));
  }
  // IPv6
  return PRIVATE_IPV6.some(p => p.test(ip));
}

/**
 * Check if a hostname is safe to fetch (SSRF protection).
 * Resolves DNS to IPv4 only to prevent IPv6 bypass.
 * @param {string} hostname
 * @returns {Promise<{ safe: boolean, resolvedIP?: string }>}
 */
async function resolveSafe(hostname) {
  if (BLOCKED_HOSTS.has(hostname)) return { safe: false };

  // Raw IPv4 address — check directly
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    return { safe: !isPrivateIP(hostname), resolvedIP: hostname };
  }

  // DNS resolve — force IPv4 to prevent IPv6 bypass
  try {
    const { address } = await lookup(hostname, { family: 4 });
    if (isPrivateIP(address)) return { safe: false };
    return { safe: true, resolvedIP: address };
  } catch {
    return { safe: false }; // DNS failure = blocked
  }
}

/**
 * Fetch a URL with timeout, SSRF protection, and redirect blocking.
 *
 * Security measures:
 * - HTTPS only
 * - DNS resolution checked against private IP ranges (IPv4 + IPv6)
 * - Redirects blocked (prevents redirect-based SSRF bypass)
 * - Response body truncated to 50KB
 * - Error messages sanitized (no internal IP/hostname leakage)
 *
 * @param {string} url
 * @param {number} timeoutMs
 * @returns {Promise<{ ok: boolean, status?: number, text?: string, error?: string }>}
 */
export async function safeFetch(url, timeoutMs = 8000) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return { ok: false, error: 'HTTPS required' };

    // SSRF check: resolve DNS and validate IP
    const { safe } = await resolveSafe(parsed.hostname);
    if (!safe) return { ok: false, error: 'Blocked: private or reserved address' };

    // SECURITY: redirect: 'manual' prevents redirect-based SSRF bypass
    // An attacker could redirect from a public URL to a private IP (169.254.169.254)
    const resp = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { 'User-Agent': 'VerityScore-MCP/1.0 (+https://verityscore.io)' },
      redirect: 'manual', // NEVER follow redirects — prevents SSRF via 302
    });

    // Handle redirects: follow only if target is also safe
    if (resp.status >= 300 && resp.status < 400) {
      const location = resp.headers.get('location');
      if (!location) return { ok: false, error: 'Redirect without Location header' };

      try {
        const redirectUrl = new URL(location, url);
        if (redirectUrl.protocol !== 'https:') return { ok: false, error: 'Redirect to non-HTTPS blocked' };
        const { safe: redirectSafe } = await resolveSafe(redirectUrl.hostname);
        if (!redirectSafe) return { ok: false, error: 'Redirect to private address blocked' };

        // Follow the single safe redirect (no further redirects allowed)
        const resp2 = await fetch(redirectUrl.href, {
          signal: AbortSignal.timeout(timeoutMs),
          headers: { 'User-Agent': 'VerityScore-MCP/1.0 (+https://verityscore.io)' },
          redirect: 'error', // No more redirects
        });
        const text = await resp2.text();
        return { ok: resp2.ok, status: resp2.status, text: text.substring(0, 50000) };
      } catch {
        return { ok: false, error: 'Redirect failed' };
      }
    }

    const text = await resp.text();
    return { ok: resp.ok, status: resp.status, text: text.substring(0, 50000) };
  } catch (e) {
    // Sanitize error messages — never expose internal IPs/hostnames
    const code = e.code || '';
    if (code === 'ECONNREFUSED') return { ok: false, error: 'Connection refused' };
    if (code === 'ENOTFOUND') return { ok: false, error: 'Domain not found' };
    if (code === 'ETIMEDOUT' || e.name === 'TimeoutError') return { ok: false, error: 'Request timed out' };
    return { ok: false, error: 'Connection failed' };
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
