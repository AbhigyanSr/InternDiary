const Parser = require('rss-parser');
const cheerio = require('cheerio');

const parser = new Parser({ timeout: 10000, maxRedirects: 3 });
const MAX_CONTENT_LENGTH = 12000;
const robotsCache = new Map();
const ROBOTS_CACHE_TTL_MS = 60 * 60 * 1000;
let lastRequestAt = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    url.hash = '';
    url.hostname = url.hostname.toLowerCase();
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, '');
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid$|gclid$|mc_cid$|mc_eid$)/i.test(key)) url.searchParams.delete(key);
    }
    return url.toString();
  } catch {
    return null;
  }
}

async function rateLimit(minimumInterval = 0) {
  const interval = Number(process.env.NEWS_REQUEST_INTERVAL_MS || 1000);
  const waitFor = Math.max(0, Math.max(interval, minimumInterval) - (Date.now() - lastRequestAt));
  if (waitFor) await sleep(waitFor);
  lastRequestAt = Date.now();
}

function parseRobots(robotsText) {
  const groups = [];
  let group = null;
  for (const rawLine of String(robotsText || '').split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, '').trim();
    if (!line || !line.includes(':')) continue;
    const separator = line.indexOf(':');
    const key = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (key === 'user-agent') {
      if (!group || group.rules.length || group.crawlDelay) {
        group = { agents: [], rules: [], crawlDelay: 0 };
        groups.push(group);
      }
      if (value) group.agents.push(value.toLowerCase());
    } else if (group && key === 'allow' && value) {
      group.rules.push({ allow: true, pattern: value });
    } else if (group && key === 'disallow' && value) {
      group.rules.push({ allow: false, pattern: value });
    } else if (group && key === 'crawl-delay' && Number.isFinite(Number(value))) {
      group.crawlDelay = Math.max(0, Number(value) * 1000);
    }
  }
  return groups;
}

function robotsPatternMatches(pattern, pathname) {
  const endAnchored = pattern.endsWith('$');
  const source = pattern.replace(/\$$/, '').replace(/[.+?^{}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${source}${endAnchored ? '$' : ''}`).test(pathname);
}

function getRobotsPolicy(robotsText, pathname, userAgent = 'NewsIngestionBot') {
  const groups = parseRobots(robotsText);
  const agent = userAgent.toLowerCase();
  const matching = groups.filter((group) => group.agents.includes(agent));
  const selected = matching.length ? matching : groups.filter((group) => group.agents.includes('*'));
  if (!selected.length) return { allowed: true, crawlDelay: 0 };

  const rules = selected.flatMap((group) => group.rules).filter((rule) => robotsPatternMatches(rule.pattern, pathname));
  if (!rules.length) return { allowed: true, crawlDelay: Math.max(...selected.map((group) => group.crawlDelay)) };
  const longestRule = rules.reduce((current, rule) => rule.pattern.length > current.pattern.length ? rule : current);
  return {
    allowed: longestRule.allow,
    crawlDelay: Math.max(...selected.map((group) => group.crawlDelay)),
  };
}

async function getRobotsPolicyForUrl(url) {
  const parsed = new URL(url);
  const origin = parsed.origin;
  const cached = robotsCache.get(origin);
  if (!cached || cached.expiresAt <= Date.now()) {
    try {
      await rateLimit();
      const response = await fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(5000) });
      if (response.status === 404 || response.status === 410) {
        robotsCache.set(origin, { allowed: true, crawlDelay: 0, expiresAt: Date.now() + ROBOTS_CACHE_TTL_MS });
      } else if (!response.ok) {
        robotsCache.set(origin, { allowed: false, crawlDelay: 0, expiresAt: Date.now() + ROBOTS_CACHE_TTL_MS });
      } else {
        const policy = getRobotsPolicy(await response.text(), parsed.pathname);
        robotsCache.set(origin, { ...policy, expiresAt: Date.now() + ROBOTS_CACHE_TTL_MS });
      }
    } catch {
      robotsCache.set(origin, { allowed: false, crawlDelay: 0, expiresAt: Date.now() + ROBOTS_CACHE_TTL_MS });
    }
  }
  return robotsCache.get(origin);
}

async function canFetchArticle(url) {
  const policy = await getRobotsPolicyForUrl(url);
  return policy.allowed;
}

function firstValue(item, keys) {
  for (const key of keys) {
    if (item[key]) return Array.isArray(item[key]) ? item[key][0] : item[key];
  }
  return '';
}

function extractImage(item) {
  const enclosure = item.enclosure?.url || item.enclosure?.[0]?.url;
  const media = firstValue(item, ['media:content', 'media:thumbnail']);
  return enclosure || media?.$?.url || media?.url || '';
}

function normalizeItem(item, feed) {
  const url = normalizeUrl(item.link || item.guid || item.id);
  if (!url || !item.title?.trim()) return null;
  return {
    title: item.title.trim(),
    url,
    source: feed.name,
    author: item.creator || item.author || item['dc:creator'] || '',
    publishedAt: item.isoDate || item.pubDate || null,
    description: item.contentSnippet || item.content || item.summary || '',
    imageUrl: extractImage(item),
    feedCategory: feed.category,
    domains: feed.domains,
  };
}

async function fetchArticleContent(url) {
  const policy = await getRobotsPolicyForUrl(url);
  if (!policy.allowed) return '';
  await rateLimit(policy.crawlDelay);
  const response = await fetch(url, {
    headers: { 'user-agent': 'InternDiaryNewsIngestion/1.0 (+https://github.com/AbhigyanSr/InternDiary)' },
    signal: AbortSignal.timeout(Number(process.env.NEWS_ARTICLE_TIMEOUT_MS || 10000)),
  });
  if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) return '';
  const html = await response.text();
  const $ = cheerio.load(html);
  $('script, style, noscript, nav, footer, header, form, aside').remove();
  const content = $('article').text() || $('main').text() || $('body').text();
  return content.replace(/\s+/g, ' ').trim().slice(0, MAX_CONTENT_LENGTH);
}

async function fetchFeed(feed, options = {}) {
  try {
    await rateLimit();
    const response = await fetch(feed.url, {
      headers: { accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' },
      signal: AbortSignal.timeout(Number(process.env.NEWS_FEED_TIMEOUT_MS || 10000)),
    });
    if (!response.ok) throw new Error(`Feed returned HTTP ${response.status}`);
    const parsed = await parser.parseString(await response.text());
    const articles = [];
    for (const item of parsed.items || []) {
      const article = normalizeItem(item, feed);
      if (!article) continue;
      if (options.fetchContent) {
        try { article.content = await fetchArticleContent(article.url); } catch (error) { article.contentError = error.message; }
      }
      articles.push(article);
    }
    return { feed, articles, error: null };
  } catch (error) {
    return { feed, articles: [], error };
  }
}

async function fetchFeeds(feeds, options = {}) {
  const results = await Promise.all((feeds || []).map((feed) => fetchFeed(feed, options)));
  return { articles: results.flatMap((result) => result.articles), results };
}

module.exports = { fetchFeed, fetchFeeds, normalizeItem, normalizeUrl, fetchArticleContent, getRobotsPolicy, canFetchArticle };
