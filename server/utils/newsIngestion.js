const News = require('../models/News');
const { getRssFeeds } = require('./rssFeeds');
const { fetchFeeds } = require('./newsScraper');
const { enrichArticle } = require('./llmHandler');

let activeRun = null;

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

async function refreshNews(options = {}) {
  if (activeRun) return activeRun;

  activeRun = (async () => {
    const stats = {
      startedAt: new Date(), feeds: 0, feedFailures: 0, fetched: 0, duplicates: 0,
      alreadyStored: 0, enriched: 0, enrichmentFailures: 0, inserted: 0, persistenceFailures: 0,
      articleLimit: 0, skippedByArticleLimit: 0, requestBudget: 0, llmRequests: 0, skippedByRequestBudget: 0,
    };
    const feeds = options.feeds || getRssFeeds();
    stats.feeds = feeds.length;

    const fetched = await (options.fetchFeeds || fetchFeeds)(feeds, {
      fetchContent: options.fetchContent !== false,
    });
    stats.fetched = fetched.articles.length;
    stats.feedFailures = fetched.results.filter((result) => result.error).length;

    const candidates = deduplicateArticles(fetched.articles);
    stats.duplicates = fetched.articles.length - candidates.length;
    stats.articleLimit = readBoundedInteger(options.maxArticles ?? process.env.NEWS_MAX_ARTICLES_PER_RUN, 20, 100);
    stats.requestBudget = readBoundedInteger(options.llmRequestBudget ?? process.env.NEWS_LLM_REQUEST_BUDGET, 20, 100);
    const limitedCandidates = candidates.slice(0, stats.articleLimit);
    stats.skippedByArticleLimit = candidates.length - limitedCandidates.length;
    if (!limitedCandidates.length) return { ...stats, status: 'completed', finishedAt: new Date() };

    const ExistingNews = options.NewsModel || News;
    const existing = await ExistingNews.find({ url: { $in: limitedCandidates.map((article) => article.url) } }).select('url').lean();
    const existingUrls = new Set(existing.map((article) => article.url));
    stats.alreadyStored = existingUrls.size;

    const enrich = options.enrichArticle || enrichArticle;
    const requestBudget = createRequestBudget(stats.requestBudget);
    const operations = [];
    const newArticles = limitedCandidates.filter((candidate) => !existingUrls.has(candidate.url));
    for (const [index, article] of newArticles.entries()) {
      if (requestBudget.used >= requestBudget.limit) {
        stats.skippedByRequestBudget += newArticles.length - index;
        break;
      }
      try {
        const enrichment = await enrich(article, { ...(options.llmOptions || {}), requestBudget });
        operations.push({
          updateOne: {
            filter: { url: article.url },
            update: { $setOnInsert: { ...article, ...enrichment, fetchedAt: new Date() } },
            upsert: true,
          },
        });
        stats.enriched += 1;
      } catch (error) {
        stats.enrichmentFailures += 1;
        options.logger?.warn?.({ url: article.url, error: error.message }, 'News enrichment failed');
      }
    }
    stats.llmRequests = requestBudget.used;

    if (operations.length) {
      try {
        const result = await ExistingNews.bulkWrite(operations, { ordered: false });
        stats.inserted = result.upsertedCount || 0;
      } catch (error) {
        const partialResult = error.result || error;
        stats.inserted = partialResult.upsertedCount || partialResult.nUpserted || 0;
        stats.persistenceFailures += 1;
        options.logger?.error?.({ error: error.message }, 'News persistence failed');
      }
    }
    return { ...stats, status: stats.persistenceFailures ? 'partial' : 'completed', finishedAt: new Date() };
  })().finally(() => { activeRun = null; });

  return activeRun;
}

function isIngestionRunning() {
  return Boolean(activeRun);
}

module.exports = { refreshNews, deduplicateArticles, isIngestionRunning, createRequestBudget };
