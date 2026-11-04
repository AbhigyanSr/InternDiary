const mongoose = require('mongoose');
const { TECH_DOMAINS } = require('../constants/domains');

const MAX_URL_LENGTH = 2048;

function normalizeUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    const url = new URL(value.trim());
    url.hash = '';
    url.hostname = url.hostname.toLowerCase();
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, '');

    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid$|gclid$|mc_cid$|mc_eid$)/i.test(key)) {
        url.searchParams.delete(key);
      }
    }

    return url.toString();
  } catch {
    return null;
  }
}

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 500 },
    url: {
      type: String,
      required: true,
      maxlength: MAX_URL_LENGTH,
      set: normalizeUrl,
      validate: { validator: (value) => Boolean(normalizeUrl(value)), message: 'url must be valid' },
    },
    source: { type: String, required: true, trim: true, maxlength: 200 },
    author: { type: String, trim: true, maxlength: 200, default: '' },
    publishedAt: { type: Date, default: null },
    description: { type: String, trim: true, maxlength: 5000, default: '' },
    imageUrl: { type: String, trim: true, maxlength: MAX_URL_LENGTH, default: '' },
    content: { type: String, trim: true, maxlength: 12000, default: '' },
    summary: { type: String, required: true, trim: true, maxlength: 1200 },
    tags: { type: [String], default: [] },
    domains: { type: [{ type: String, enum: TECH_DOMAINS }], required: true, default: [] },
    feedCategory: { type: String, trim: true, default: '' },
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

newsSchema.index({ url: 1 }, { unique: true });
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ domains: 1, publishedAt: -1 });

newsSchema.statics.normalizeUrl = normalizeUrl;

module.exports = mongoose.models.News || mongoose.model('News', newsSchema);
