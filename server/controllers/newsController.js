const News = require('../models/News');
const { TECH_DOMAINS } = require('../constants/domains');
const { refreshNews, isIngestionRunning, getLastRun } = require('../utils/newsIngestion');

const LIST_FIELDS = 'title url source author publishedAt summary tags domains imageUrl feedCategory fetchedAt';
const AUTO_CHECK_INTERVAL_MS = 10 * 60 * 1000;
let lastAutoCheckAt = 0;

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function parsePaging(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 12, 1), 50);
  return { page, limit };
}

function startRefresh(trigger) {
  if (isIngestionRunning()) return false;
  refreshNews({ logger: console })
    .then((stats) => console.log(`News refresh (${trigger}) finished: ${stats.inserted} inserted, status ${stats.status}`))
    .catch((error) => console.error(`News refresh (${trigger}) failed:`, error.message));
  return true;
}

// Render's free tier sleeps, so the in-process cron cannot be relied on.
// When news is requested and the newest article is older than
// NEWS_AUTO_REFRESH_HOURS, a background refresh is started. Checked at most
// once every 10 minutes per process.
async function maybeAutoRefresh() {
  if (process.env.NEWS_AUTO_REFRESH === 'false') return;
  const now = Date.now();
  if (now - lastAutoCheckAt < AUTO_CHECK_INTERVAL_MS || isIngestionRunning()) return;
  lastAutoCheckAt = now;
  try {
    const hours = Number(process.env.NEWS_AUTO_REFRESH_HOURS) || 6;
    const latest = await News.findOne().sort({ fetchedAt: -1 }).select('fetchedAt').lean();
    if (!latest || now - new Date(latest.fetchedAt).getTime() > hours * 60 * 60 * 1000) {
      startRefresh('auto');
    }
  } catch (error) {
    console.error('News auto-refresh check failed:', error.message);
  }
}

async function listNews(filter, query) {
  const { page, limit } = parsePaging(query);
  const conditions = { ...filter };
  if (query.domain && TECH_DOMAINS.includes(query.domain)) conditions.domains = query.domain;
  if (query.search && String(query.search).trim()) {
    const regex = new RegExp(escapeRegex(String(query.search).trim()), 'i');
    conditions.$or = [{ title: regex }, { summary: regex }, { tags: regex }, { source: regex }];
  }

  const [articles, total] = await Promise.all([
    News.find(conditions)
      .select(LIST_FIELDS)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    News.countDocuments(conditions),
  ]);

  return { articles, page, pages: Math.max(Math.ceil(total / limit), 1), total };
}

const GUEST_ARTICLE_LIMIT = 3;

// @desc    Latest news. Guests (landing page) get only the 3 newest articles,
//          unfiltered; logged-in users ("All" tab) get search, filters, paging.
// @route   GET /api/news/public?page=&limit=&domain=&search=
// @access  Public (full results with a valid token)
const getPublicNews = async (req, res) => {
  try {
    maybeAutoRefresh();
    if (!req.user) {
      const articles = await News.find()
        .select(LIST_FIELDS)
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(GUEST_ARTICLE_LIMIT)
        .lean();
      return res.json({ articles, page: 1, pages: 1, total: articles.length, guestPreview: true });
    }
    res.json(await listNews({}, req.query));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    News filtered to the logged-in user's preferred domains.
//          Falls back to all news when no preferences are set.
// @route   GET /api/news/personalized?page=&limit=&domain=&search=
// @access  Private
const getPersonalizedNews = async (req, res) => {
  try {
    maybeAutoRefresh();
    const preferredDomains = req.user.preferredDomains || [];
    const filter = preferredDomains.length ? { domains: { $in: preferredDomains } } : {};
    const result = await listNews(filter, req.query);
    res.json({ ...result, personalized: preferredDomains.length > 0, preferredDomains });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Start a news ingestion run in the background (Admin only)
// @route   POST /api/news/refresh
// @access  Admin
const triggerRefresh = (req, res) => {
  const started = startRefresh(`admin ${req.user.email}`);
  res.status(202).json({
    message: started ? 'News refresh started' : 'A news refresh is already running',
    running: true,
  });
};

// @desc    Ingestion status for the admin refresh button
// @route   GET /api/news/status
// @access  Admin
const getNewsStatus = async (req, res) => {
  try {
    const [total, latest] = await Promise.all([
      News.countDocuments(),
      News.findOne().sort({ fetchedAt: -1 }).select('fetchedAt').lean(),
    ]);
    res.json({
      running: isIngestionRunning(),
      lastRun: getLastRun(),
      total,
      latestFetchedAt: latest?.fetchedAt || null,
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPublicNews, getPersonalizedNews, triggerRefresh, getNewsStatus };
