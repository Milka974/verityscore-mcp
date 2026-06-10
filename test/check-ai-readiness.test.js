import test from 'node:test';
import assert from 'node:assert/strict';

import { analyzeRobotsTxt } from '../src/tools.js';

test('robots scoring ignores training and policy bots while reporting them separately', () => {
  const robots = `
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /
`;

  const check = analyzeRobotsTxt(robots);

  assert.equal(check.ok, true);
  assert.equal(check.scoring.blocked.length, 0);
  assert.deepEqual(
    check.policy.blocked.map(bot => bot.userAgent).sort(),
    ['Applebot-Extended', 'ClaudeBot', 'GPTBot', 'Google-Extended'],
  );
  assert.match(check.detail, /shopping discovery\/on-demand bots are not blocked/i);
  assert.doesNotMatch(check.detail, /GPTBot blocked/i);
});

test('robots scoring fails when discovery, search, or on-demand bots are blocked', () => {
  const robots = `
User-agent: OAI-SearchBot
Disallow: /

User-agent: Googlebot
Disallow: /

User-agent: MistralAI-User
Disallow: /

User-agent: GPTBot
Allow: /
`;

  const check = analyzeRobotsTxt(robots);

  assert.equal(check.ok, false);
  assert.deepEqual(check.scoring.blocked.map(bot => bot.userAgent), ['OAI-SearchBot', 'Googlebot', 'MistralAI-User']);
  assert.match(check.detail, /OAI-SearchBot.*blocked/i);
  assert.match(check.detail, /Googlebot/i);
  assert.match(check.detail, /MistralAI-User/i);
});

test('robots scoring: a non-root Allow does NOT override a site-wide Disallow', () => {
  // Real-world pattern: Disallow everything but expose the sitemap.
  const robots = `
User-agent: PerplexityBot
Allow: /sitemap.xml
Disallow: /
`;
  const check = analyzeRobotsTxt(robots);
  assert.equal(check.ok, false);
  assert.deepEqual(check.scoring.blocked.map(bot => bot.userAgent), ['PerplexityBot']);
});

test('robots scoring: Allow: / overrides Disallow: / (equal-length match wins)', () => {
  const robots = `
User-agent: PerplexityBot
Disallow: /
Allow: /
`;
  const check = analyzeRobotsTxt(robots);
  assert.equal(check.ok, true);
  assert.equal(check.scoring.blocked.length, 0);
});

test('robots scoring: a blank line does not leak a directive to the wildcard group', () => {
  // Googlebot is allowed; the blank line must NOT reattribute the next Disallow to '*'.
  const robots = `
User-agent: Googlebot
Allow: /

Disallow: /
`;
  const check = analyzeRobotsTxt(robots);
  // The orphan Disallow after the blank line belongs to no new wildcard group,
  // so no scoring bot should be reported blocked_by_wildcard.
  assert.equal(check.scoring.blocked.length, 0);
});

test('robots scoring: User-agent matching is case-insensitive', () => {
  const robots = `
user-agent: gptbot
disallow: /
`;
  const check = analyzeRobotsTxt(robots);
  assert.deepEqual(check.policy.blocked.map(bot => bot.userAgent), ['GPTBot']);
});

test('robots scoring: inline comments are stripped', () => {
  const robots = `
User-agent: OAI-SearchBot
Disallow: / # block everything for now
`;
  const check = analyzeRobotsTxt(robots);
  assert.equal(check.ok, false);
  assert.deepEqual(check.scoring.blocked.map(bot => bot.userAgent), ['OAI-SearchBot']);
});

test('robots scoring applies grouped user-agent directives to every bot in the group', () => {
  const robots = `
User-agent: OAI-SearchBot
User-agent: Claude-SearchBot
User-agent: Googlebot
Disallow: /

User-agent: GPTBot
Disallow: /
`;

  const check = analyzeRobotsTxt(robots);

  assert.equal(check.ok, false);
  assert.deepEqual(
    check.scoring.blocked.map(bot => bot.userAgent).sort(),
    ['Claude-SearchBot', 'Googlebot', 'OAI-SearchBot'],
  );
  assert.deepEqual(check.policy.blocked.map(bot => bot.userAgent), ['GPTBot']);
});
