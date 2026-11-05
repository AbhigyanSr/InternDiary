const cron = require('node-cron');
const { refreshNews: defaultRefreshNews } = require('./newsIngestion');

let scheduledJob = null;

function isNewsCronEnabled(value = process.env.NEWS_CRON_ENABLED) {
  return value === 'true' || value === '1';
}

function createCronRunner({ refreshNews = defaultRefreshNews, logger = console } = {}) {
  let running = false;

  return async function runNewsCron() {
    if (running) {
      logger.warn?.('Skipping news cron run because the previous run is still active');
      return false;
    }

    running = true;
    try {
      await refreshNews();
      return true;
    } catch (error) {
      logger.error?.({ error: error.message }, 'Scheduled news ingestion failed');
      return false;
    } finally {
      running = false;
    }
  };
}

function startNewsCron(options = {}) {
  if (scheduledJob) return scheduledJob;

  const schedule = options.schedule || process.env.NEWS_CRON_SCHEDULE || '0 * * * *';
  if (!cron.validate(schedule)) throw new Error(`Invalid NEWS_CRON_SCHEDULE: ${schedule}`);
  const runNewsCron = createCronRunner({
    refreshNews: options.refreshNews || defaultRefreshNews,
    logger: options.logger || console,
  });

  scheduledJob = cron.schedule(schedule, runNewsCron, { scheduled: true });

  return scheduledJob;
}

function stopNewsCron() {
  if (scheduledJob) scheduledJob.stop();
  scheduledJob = null;
}

function isNewsCronStarted() {
  return Boolean(scheduledJob);
}

module.exports = {
  startNewsCron,
  stopNewsCron,
  isNewsCronStarted,
  isNewsCronEnabled,
  createCronRunner,
};
