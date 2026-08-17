// server/constants/domains.js

// Single source of truth for tech domains.
// Imported by the User model, the preferences controller, and (mirrored) the frontend.
// When you add a domain here, add it to client/src/constants/domains.js too.
const TECH_DOMAINS = [
  'Web Dev',
  'Cloud',
  'DevOps',
  'AI/ML',
  'Cybersecurity',
];

module.exports = { TECH_DOMAINS };