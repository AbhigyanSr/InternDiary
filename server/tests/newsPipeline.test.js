const test = require('node:test');
const assert = require('node:assert/strict');

const News = require('../models/News');
const { TECH_DOMAINS } = require('../constants/domains');
const { fetchArticleContent, fetchFeeds, getRobotsPolicy, normalizeUrl } = require('../utils/newsScraper');
const { enrichArticle, getModel, validateEnrichment } = require('../utils/llmHandler');
const { deduplicateArticles, refreshNews } = require('../utils/newsIngestion');
const {
  startNewsCron,
  stopNewsCron,
  isNewsCronStarted,
  isNewsCronEnabled,
  createCronRunner,
} = require('../utils/newsCron');

test('normalizes tracking parameters and fragments from article URLs', () => {
  assert.equal(normalizeUrl('HTTPS://Example.com/story/?utm_source=x#comments'), 'https://example.com/story');
  assert.equal(normalizeUrl('not a URL'), null);
});

test('News schema has a unique URL index and expected fields', () => {
  const indexes = News.schema.indexes();
  assert.ok(indexes.some(([fields, options]) => fields.url === 1 && options.unique === true));
  assert.ok(News.schema.path('title').isRequired);
  assert.ok(News.schema.path('summary').isRequired);
});

test('News schema rejects domains outside TECH_DOMAINS', () => {
  const article = new News({
    title: 'Article',
    url: 'https://example.com/domain-validation',
    source: 'Example',
    summary: 'Summary',
    domains: ['Blockchain'],
  });
  assert.ok(article.validateSync().errors['domains.0']);
});

test('deduplicates articles by normalized URL', () => {
  const articles = deduplicateArticles([{ url: 'https://example.com/1', title: 'first' }, { url: 'https://example.com/1', title: 'duplicate' }]);
  assert.equal(articles.length, 1);
  assert.equal(articles[0].title, 'first');
});

test('rejects LLM domains outside the shared taxonomy', () => {
  assert.throws(() => validateEnrichment({ summary: 'Valid', tags: ['cloud'], domains: ['Blockchain'] }), /domain/i);
  assert.doesNotThrow(() => validateEnrichment({ summary: 'Valid', tags: ['cloud'], domains: [TECH_DOMAINS[1]] }));
});

test('accepts only approved free-tier Gemini models and counts retry attempts', async () => {
  assert.equal(getModel({ model: 'gemini-3.5-flash-lite' }), 'gemini-3.5-flash-lite');
  assert.throws(() => getModel({ model: 'gemini-2.5-pro' }), /free-tier/i);

  let calls = 0;
  const requestBudget = { used: 0, limit: 2, consume() { if (this.used >= this.limit) throw new Error('budget exhausted'); this.used += 1; } };
  await assert.rejects(
    enrichArticle({ title: 'Article' }, { client: { models: { generateContent: async () => { calls += 1; throw new Error('temporary'); } } }, retries: 5, requestBudget }),
    /temporary|budget exhausted/,
  );
  assert.equal(calls, 2);
  assert.equal(requestBudget.used, 2);
});

test('prevents overlapping ingestion runs and persists only enriched articles', async () => {
  let fetchCalls = 0;
  let writes = 0;
  const NewsModel = {
    find: () => ({ select: () => ({ lean: async () => [] }) }),
    bulkWrite: async (operations) => { writes += operations.length; return { upsertedCount: operations.length }; },
  };
  const fetchFeeds = async () => {
    fetchCalls += 1;
    await new Promise((resolve) => setTimeout(resolve, 10));
    return { articles: [{ url: 'https://example.com/1', title: 'A' }], results: [{ error: null }] };
  };
  const enrichArticle = async () => ({ summary: 'Summary', tags: ['cloud'], domains: ['Cloud'] });

  const [first, second] = await Promise.all([
    refreshNews({ NewsModel, fetchFeeds, enrichArticle, fetchContent: false }),
    refreshNews({ NewsModel, fetchFeeds, enrichArticle, fetchContent: false }),
  ]);

  assert.equal(fetchCalls, 1);
  assert.equal(writes, 1);
  assert.equal(first.inserted, 1);
  assert.equal(second.inserted, 1);
});

test('limits articles and Gemini requests per ingestion run', async () => {
  let writes = 0;
  const NewsModel = {
    find: () => ({ select: () => ({ lean: async () => [] }) }),
    bulkWrite: async (operations) => { writes = operations.length; return { upsertedCount: operations.length }; },
  };
  const client = { models: { generateContent: async () => ({ text: JSON.stringify({ summary: 'Summary', tags: ['cloud'], domains: ['Cloud'] }) }) } };
  const result = await refreshNews({
    NewsModel,
    maxArticles: 3,
    llmRequestBudget: 1,
    fetchContent: false,
    fetchFeeds: async () => ({ articles: [
      { url: 'https://example.com/1', title: 'A' },
      { url: 'https://example.com/2', title: 'B' },
      { url: 'https://example.com/3', title: 'C' },
      { url: 'https://example.com/4', title: 'D' },
    ], results: [{ error: null }] }),
    llmOptions: { client },
  });
  assert.equal(result.articleLimit, 3);
  assert.equal(result.skippedByArticleLimit, 1);
  assert.equal(result.requestBudget, 1);
  assert.equal(result.llmRequests, 1);
  assert.equal(result.skippedByRequestBudget, 2);
  assert.equal(writes, 1);
});

test('cron initialization is idempotent and rejects invalid schedules', () => {
  assert.equal(isNewsCronEnabled('true'), true);
  assert.equal(isNewsCronEnabled('1'), true);
  assert.equal(isNewsCronEnabled('false'), false);
  assert.throws(() => startNewsCron({ schedule: 'not-a-cron' }), /Invalid/);
  const first = startNewsCron({ schedule: '*/5 * * * * *', refreshNews: async () => {} });
  const second = startNewsCron({ schedule: '*/1 * * * * *', refreshNews: async () => {} });
  assert.equal(first, second);
  assert.equal(isNewsCronStarted(), true);
  stopNewsCron();
  assert.equal(isNewsCronStarted(), false);
});

test('cron runner prevents overlap and logs ingestion failures', async () => {
  let resolveFirst;
  let calls = 0;
  const warnings = [];
  const errors = [];
  const runner = createCronRunner({
    refreshNews: async () => {
      calls += 1;
      await new Promise((resolve) => { resolveFirst = resolve; });
      throw new Error('ingestion failed');
    },
    logger: {
      warn: (message) => warnings.push(message),
      error: (details, message) => errors.push({ details, message }),
    },
  });

  const first = runner();
  const second = await runner();
  assert.equal(second, false);
  assert.equal(calls, 1);
  assert.equal(warnings.length, 1);
  resolveFirst();
  assert.equal(await first, false);
  assert.equal(errors.length, 1);
});

test('reports partial bulk-write inserts when MongoDB returns a write error', async () => {
  const errors = [];
  const result = await refreshNews({
    NewsModel: {
      find: () => ({ select: () => ({ lean: async () => [] }) }),
      bulkWrite: async () => {
        const error = new Error('one write failed');
        error.result = { upsertedCount: 1 };
        throw error;
      },
    },
    fetchContent: false,
    fetchFeeds: async () => ({
      articles: [{ url: 'https://example.com/partial', title: 'A' }],
      results: [{ error: null }],
    }),
    enrichArticle: async () => ({ summary: 'Summary', tags: ['cloud'], domains: ['Cloud'] }),
    logger: { error: (details) => errors.push(details) },
  });
  assert.equal(result.inserted, 1);
  assert.equal(result.persistenceFailures, 1);
  assert.equal(result.status, 'partial');
  assert.equal(errors.length, 1);
});

test('isolates invalid feeds and handles empty feeds', async () => {
  const previousFetch = global.fetch;
  const previousInterval = process.env.NEWS_REQUEST_INTERVAL_MS;
  process.env.NEWS_REQUEST_INTERVAL_MS = '0';
  global.fetch = async (url) => {
    if (url.includes('invalid')) return new Response('unavailable', { status: 503 });
    return new Response('<rss version="2.0"><channel><title>Empty</title></channel></rss>', { status: 200, headers: { 'content-type': 'application/rss+xml' } });
  };
  try {
    const result = await fetchFeeds([
      { name: 'Empty', url: 'https://empty.example/feed', category: 'Cloud', domains: ['Cloud'] },
      { name: 'Invalid', url: 'https://invalid.example/feed', category: 'Cloud', domains: ['Cloud'] },
    ]);
    assert.equal(result.articles.length, 0);
    assert.equal(result.results.filter((item) => item.error).length, 1);
  } finally {
    global.fetch = previousFetch;
    if (previousInterval === undefined) delete process.env.NEWS_REQUEST_INTERVAL_MS;
    else process.env.NEWS_REQUEST_INTERVAL_MS = previousInterval;
  }
});

test('extracts article text and falls back to main content', async () => {
  const previousFetch = global.fetch;
  const previousInterval = process.env.NEWS_REQUEST_INTERVAL_MS;
  process.env.NEWS_REQUEST_INTERVAL_MS = '0';
  let articleRequest = false;
  global.fetch = async (url) => {
    if (url.endsWith('/robots.txt')) return new Response('User-agent: *\nAllow: /', { status: 200 });
    articleRequest = true;
    return new Response('<html><main><p>Useful article text.</p><script>ignore()</script></main></html>', {
      status: 200,
      headers: { 'content-type': 'text/html' },
    });
  };
  try {
    assert.equal(await fetchArticleContent('https://extract.example/story'), 'Useful article text.');
    assert.equal(articleRequest, true);
  } finally {
    global.fetch = previousFetch;
    if (previousInterval === undefined) delete process.env.NEWS_REQUEST_INTERVAL_MS;
    else process.env.NEWS_REQUEST_INTERVAL_MS = previousInterval;
  }
});

test('honors robots groups, allow precedence, wildcards, and crawl delay', () => {
  const robots = [
    'User-agent: *',
    'Disallow: /private',
    'Allow: /private/public',
    'Crawl-delay: 2',
    '',
    'User-agent: NewsIngestionBot',
    'Disallow: /bot-only',
    'Allow: /bot-only/public',
  ].join('\n');

  assert.equal(getRobotsPolicy(robots, '/private/report', 'OtherBot').allowed, false);
  assert.equal(getRobotsPolicy(robots, '/private/public/report', 'OtherBot').allowed, true);
  assert.equal(getRobotsPolicy(robots, '/bot-only/report').allowed, false);
  assert.equal(getRobotsPolicy(robots, '/bot-only/public/report').allowed, true);
  assert.equal(getRobotsPolicy(robots, '/public', 'OtherBot').crawlDelay, 2000);
  assert.equal(getRobotsPolicy('User-agent: *\nDisallow: /secret*$', '/secret/path').allowed, false);
});
