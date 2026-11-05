# News ingestion pipeline

## Architecture

`newsScraper.js` fetches configured RSS/Atom feeds, normalizes article URLs, applies robots.txt rules, rate limits requests, and extracts article content. `newsIngestion.js` deduplicates candidates, skips URLs already stored in MongoDB, enriches new articles with Gemini, and persists them with unordered URL-based upserts. `newsCron.js` optionally schedules the shared `refreshNews()` function.

## Feeds and normalization

The default feeds are defined in `utils/rssFeeds.js`. `NEWS_RSS_FEEDS` can override them with comma-separated `Name|URL|Category` entries. Invalid HTTP(S) entries are ignored. URLs have fragments, tracking parameters, and trailing path slashes removed, and hostnames lowercased. The `url` field has the unique MongoDB index used for deduplication.

Feed failures are isolated. Feed and article requests have configurable timeouts, robots.txt is honored, article content falls back from `article` to `main` to `body`, and content is capped at 12,000 characters.

## Gemini enrichment

`llmHandler.js` reads `GEMINI_API_KEY` and permits only the configured free-tier models in `FREE_TIER_MODELS`. Responses must be JSON containing a non-empty summary, one to eight tags, and approved `TECH_DOMAINS` values. Article text is explicitly treated as untrusted input. Retries are capped at two and each attempt consumes the shared request budget.

## MongoDB and refresh contract

`News` requires title, normalized URL, source, summary, and approved domains. `refreshNews(options)` returns counters including fetched articles, duplicates, previously stored articles, enrichments, request usage, inserted documents, persistence failures, and status. It is process-local single-flight: concurrent calls in one process share the active run. The duplicate guard and cron overlap guard do not coordinate multiple server instances.

## Cron

Cron starts only after MongoDB connects and only when `NEWS_CRON_ENABLED=true` or `1`. The default schedule is hourly (`0 * * * *`), and invalid expressions are logged without preventing the HTTP server from starting. A running cron invocation is skipped if the prior invocation is still active. `SIGINT` and `SIGTERM` stop the scheduled task and close the HTTP and MongoDB connections.

## Environment variables

See [`server/.env.example`](./.env.example). Never commit real API keys or production connection strings. Important settings include `MONGO_URI`, `GEMINI_API_KEY`, `GEMINI_MODEL`, cron enablement and schedule, RSS overrides, article/request limits, request intervals, and feed/article/Gemini timeouts.

## Tests and operations

Run mocked backend tests with:

```bash
cd server
npm test
```

The real ingestion script is a separate integration test requiring live MongoDB, Gemini credentials, and external RSS/websites. It must not be used as a substitute for unit tests or unrestricted production verification.

## API/UI handoff

The API/UI team owns:

- `GET /api/news/public`
- `GET /api/news/personalized`
- `POST /api/news/refresh` (admin-only)

Personalized results should use `User.preferredDomains`. The ingestion layer provides normalized URLs, summaries, tags, domains, publication metadata, and source fields; route authentication, authorization, pagination, and presentation remain outside this module.

## Known limitations

Overlap protection is process-local and does not provide a distributed lock across multiple server instances. The Gemini timeout races the request promise but cannot cancel an already-running SDK request. Partial unordered bulk-write errors are reported as `partial` and preserve any reported upsert count.
