const cron = require('node-cron');
const { refreshNews } = require('./newsIngestion');

let scheduledJob = null;
let running = false;

function startNewsCron(options = {}) {
  if (scheduledJob) return scheduledJob;

  const schedule = options.schedule || process.env.NEWS_CRON_SCHEDULE || '0 * * * *';
  if (!cron.validate(schedule)) throw new Error(`Invalid NEWS_CRON_SCHEDULE: ${schedule}`);
  const ingest = options.refreshNews || refreshNews;
  const logger = options.logger || console;

  scheduledJob = cron.schedule(schedule, async () => {
    if (running) {
      logger.warn?.('Skipping news cron run because the previous run is still active');
      return;
    }
    running = true;
    try {
      await ingest();
    } catch (error) {
      logger.error?.({ error: error.message }, 'Scheduled news ingestion failed');
    } finally {
      running = false;
    }
  }, { scheduled: true });

  return scheduledJob;
}

function stopNewsCron() {
  if (scheduledJob) scheduledJob.stop();
  scheduledJob = null;
  running = false;
}

function isNewsCronStarted() {
  return Boolean(scheduledJob);
}

module.exports = { startNewsCron, stopNewsCron, isNewsCronStarted };
