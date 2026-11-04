const { TECH_DOMAINS } = require('../constants/domains');

const RSS_FEEDS = [
  { name: 'Google Developers', category: 'Web Dev', url: 'https://developers.googleblog.com/feeds/posts/default', domains: ['Web Dev', 'Cloud', 'AI/ML'] },
  { name: 'AWS News', category: 'Cloud', url: 'https://aws.amazon.com/blogs/aws/feed/', domains: ['Cloud', 'DevOps'] },
  { name: 'Kubernetes Blog', category: 'DevOps', url: 'https://kubernetes.io/feed.xml', domains: ['DevOps', 'Cloud'] },
  { name: 'Google AI Blog', category: 'AI/ML', url: 'https://blog.google/technology/ai/rss/', domains: ['AI/ML'] },
  { name: 'Microsoft Security Blog', category: 'Cybersecurity', url: 'https://www.microsoft.com/en-us/security/blog/feed/', domains: ['Cybersecurity', 'Cloud'] },
];

function getRssFeeds() {
  const configured = process.env.NEWS_RSS_FEEDS;
  if (!configured) return RSS_FEEDS.map((feed) => ({ ...feed, domains: [...feed.domains] }));

  return configured.split(',').map((entry) => {
    const [name, url, category = 'Web Dev'] = entry.split('|').map((part) => part.trim());
    return { name: name || url, url, category, domains: TECH_DOMAINS.includes(category) ? [category] : ['Web Dev'] };
  }).filter((feed) => /^https?:\/\//i.test(feed.url));
}

module.exports = { RSS_FEEDS, getRssFeeds };
