const News = require('../models/News');
const { TECH_DOMAINS } = require('../constants/domains');
const { getRssFeeds } = require('./rssFeeds');
const { fetchFeeds, fetchArticleContent } = require('./newsScraper');
const { enrichArticle } = require('./llmHandler');

let activeRun = null;
let lastRun = null;

function readBoundedInteger(value, fallback, maximum) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) return fallback;
  return Math.min(parsed, maximum);
}

function createRequestBudget(limit) {
  return {
    limit,
    used: 0,
    consume() {
      if (this.used >= this.limit) {
        const error = new Error('Gemini request budget exhausted for this ingestion run');
        error.code = 'GEMINI_REQUEST_BUDGET_EXCEEDED';
        throw error;
      }
      this.used += 1;
    },
  };
}

function deduplicateArticles(articles) {
  const unique = new Map();
  for (const article of articles || []) {
    if (article?.url && !unique.has(article.url)) unique.set(article.url, article);
  }
  return [...unique.values()];
}

// Newest-first within each source, then round-robin across sources so one
// busy feed cannot occupy every slot of the per-run article limit.
function interleaveBySource(articles) {
  const groups = new Map();
  for (const article of articles) {
    const key = article.source || '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(article);
  }
  const time = (article) => {
    const value = Date.parse(article.publishedAt);
    return Number.isNaN(value) ? 0 : value;
  };
  const queues = [...groups.values()].map((group) => [...group].sort((a, b) => time(b) - time(a)));
  const ordered = [];
  let index = 0;
  while (ordered.length < articles.length) {
    for (const queue of queues) {
      if (queue[index]) ordered.push(queue[index]);
    }
    index += 1;
  }
  return ordered;
}

// Used when Gemini is unavailable or fails, so the article is still stored
// with the feed's own description instead of being dropped.
function buildFallbackEnrichment(article) {
  const source = String(article.description || article.content || article.title || '').replace(/\s+/g, ' ').trim();
  let summary = source.slice(0, 400);
  if (source.length > 400) {
    const cut = summary.lastIndexOf(' ');
    summary = `${summary.slice(0, cut > 200 ? cut : 400)}…`;
  }
  const domains = (article.domains || []).filter((domain) => TECH_DOMAINS.includes(domain));
  return {
    summary: summary || article.title,
    tags: article.feedCategory ? [article.feedCategory] : [],
    domains: domains.length ? domains : ['Web Dev'],
  };
}

async function refreshNews(options = {}) {
  if (activeRun) return activeRun;

  activeRun = (async () => {
    const stats = {
      startedAt: new Date(), feeds: 0, feedFailures: 0, fetched: 0, duplicates: 0,
      alreadyStored: 0, enriched: 0, enrichmentFailures: 0, fallbackSummaries: 0, inserted: 0, persistenceFailures: 0,
      articleLimit: 0, skippedByArticleLimit: 0, requestBudget: 0, llmRequests: 0, skippedByRequestBudget: 0,
    };
    const feeds = options.feeds || getRssFeeds();
    stats.feeds = feeds.length;

    // Feeds are fetched without article bodies; bodies are fetched below only
    // for the few articles actually selected for storage.
    const fetched = await (options.fetchFeeds || fetchFeeds)(feeds, { fetchContent: false });
    stats.fetched = fetched.articles.length;
    stats.feedFailures = fetched.results.filter((result) => result.error).length;

    const candidates = deduplicateArticles(fetched.articles);
    stats.duplicates = fetched.articles.length - candidates.length;
    stats.articleLimit = readBoundedInteger(options.maxArticles ?? process.env.NEWS_MAX_ARTICLES_PER_RUN, 20, 100);
    stats.requestBudget = readBoundedInteger(options.llmRequestBudget ?? process.env.NEWS_LLM_REQUEST_BUDGET, 20, 100);
    if (!candidates.length) return { ...stats, status: 'completed', finishedAt: new Date() };

    // Skip already-stored URLs *before* applying the limit, otherwise the same
    // stored articles fill the limit on every run and nothing new is found.
    const NewsModel = options.NewsModel || News;
    const existing = await NewsModel.find({ url: { $in: candidates.map((article) => article.url) } }).select('url').lean();
    const existingUrls = new Set(existing.map((article) => article.url));
    stats.alreadyStored = existingUrls.size;

    const newArticles = interleaveBySource(candidates.filter((candidate) => !existingUrls.has(candidate.url)));
    const limitedCandidates = newArticles.slice(0, stats.articleLimit);
    stats.skippedByArticleLimit = newArticles.length - limitedCandidates.length;
    if (!limitedCandidates.length) return { ...stats, status: 'completed', finishedAt: new Date() };

    if (options.fetchContent !== false) {
      const getContent = options.fetchArticleContent || fetchArticleContent;
      for (const article of limitedCandidates) {
        try { article.content = await getContent(article.url); } catch (error) { article.contentError = error.message; }
      }
    }

    const enrich = options.enrichArticle || enrichArticle;
    const requestBudget = createRequestBudget(stats.requestBudget);
    const operations = [];
    for (const [index, article] of limitedCandidates.entries()) {
      if (requestBudget.used >= requestBudget.limit) {
        // Left for the next run: they are not stored, so they stay "new".
        stats.skippedByRequestBudget += limitedCandidates.length - index;
        break;
      }
      let enrichment;
      try {
        enrichment = await enrich(article, { ...(options.llmOptions || {}), requestBudget });
        stats.enriched += 1;
      } catch (error) {
        stats.enrichmentFailures += 1;
        options.logger?.warn?.({ url: article.url, error: error.message }, 'News enrichment failed');
        if (options.fallbackOnEnrichmentFailure === false) continue;
        enrichment = buildFallbackEnrichment(article);
        stats.fallbackSummaries += 1;
      }
      const { contentError, ...document } = article;
      operations.push({
        updateOne: {
          filter: { url: article.url },
          update: { $setOnInsert: { ...document, ...enrichment, fetchedAt: new Date() } },
          upsert: true,
        },
      });
    }
    stats.llmRequests = requestBudget.used;

    if (operations.length) {
      try {
        const result = await NewsModel.bulkWrite(operations, { ordered: false });
        stats.inserted = result.upsertedCount || 0;
      } catch (error) {
        const partialResult = error.result || error;
        stats.inserted = partialResult.upsertedCount || partialResult.nUpserted || 0;
        stats.persistenceFailures += 1;
        options.logger?.error?.({ error: error.message }, 'News persistence failed');
      }
    }
    return { ...stats, status: stats.persistenceFailures ? 'partial' : 'completed', finishedAt: new Date() };
  })()
    .then((result) => { lastRun = result; return result; })
    .catch((error) => {
      lastRun = { status: 'failed', error: error.message, finishedAt: new Date() };
      throw error;
    })
    .finally(() => { activeRun = null; });

  return activeRun;
}

function isIngestionRunning() {
  return Boolean(activeRun);
}

function getLastRun() {
  return lastRun;
}

module.exports = { refreshNews, deduplicateArticles, isIngestionRunning, getLastRun, createRequestBudget, buildFallbackEnrichment, interleaveBySource };
