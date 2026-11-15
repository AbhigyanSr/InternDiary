import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { TECH_DOMAINS } from '../constants/domains.js';
import NewsCard from '../components/newsCard.jsx';

const PAGE_SIZE = 12;

export default function News() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const hasPreferences = (user?.preferredDomains || []).length > 0;

  const [tab, setTab] = useState(hasPreferences ? 'personalized' : 'all');
  const [domain, setDomain] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ articles: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState('');
  const pollRef = useRef(null);

  const loadNews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (domain) params.set('domain', domain);
      if (search) params.set('search', search);
      const token = localStorage.getItem('token');
      const endpoint = tab === 'personalized' ? '/news/personalized' : '/news/public';
      const result = await apiRequest(`${endpoint}?${params}`, 'GET', null, token);
      setData(result);
    } catch (err) {
      setError(err.message || 'Could not load news');
    } finally {
      setLoading(false);
    }
  }, [tab, domain, search, page]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  useEffect(() => () => clearInterval(pollRef.current), []);

  const changeFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const describeRun = (run) => {
    if (!run) return 'Refresh finished.';
    if (run.status === 'failed') return `Refresh failed: ${run.error}`;
    const parts = [`${run.inserted} new article${run.inserted === 1 ? '' : 's'} added`];
    if (run.fallbackSummaries) parts.push(`${run.fallbackSummaries} without AI summary`);
    if (run.feedFailures) parts.push(`${run.feedFailures} feed(s) unreachable`);
    return `Refresh finished: ${parts.join(', ')}.`;
  };

  const handleRefresh = async () => {
    const token = localStorage.getItem('token');
    setRefreshing(true);
    setRefreshMessage('Fetching feeds and summarising articles. This can take a minute...');
    try {
      await apiRequest('/news/refresh', 'POST', null, token);
      clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const status = await apiRequest('/news/status', 'GET', null, token);
          if (!status.running) {
            clearInterval(pollRef.current);
            setRefreshing(false);
            setRefreshMessage(describeRun(status.lastRun));
            loadNews();
          }
        } catch (err) {
          clearInterval(pollRef.current);
          setRefreshing(false);
          setRefreshMessage(err.message || 'Could not check refresh status');
        }
      }, 4000);
    } catch (err) {
      setRefreshing(false);
      setRefreshMessage(err.message || 'Could not start refresh');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-4">
          <div>
            <h1 className="font-sans font-semibold text-3xl text-zinc-900 tracking-tight">Tech News</h1>
            <p className="text-muted mt-1">
              {tab === 'personalized' ? 'Headlines from the domains you follow' : 'Latest headlines across all domains'}
            </p>
          </div>
          {isAdmin && (
            <button type="button" onClick={handleRefresh} disabled={refreshing} className="btn-primary">
              {refreshing ? 'Refreshing...' : 'Refresh news'}
            </button>
          )}
        </div>

        {refreshMessage && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200/60 text-emerald-700 rounded-lg text-sm">
            {refreshMessage}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => changeFilter(setTab)('personalized')}
            className={`chip cursor-pointer transition ${tab === 'personalized' ? '' : 'chip-neutral opacity-60 hover:opacity-100'}`}
          >
            For you
          </button>
          <button
            type="button"
            onClick={() => changeFilter(setTab)('all')}
            className={`chip cursor-pointer transition ${tab === 'all' ? '' : 'chip-neutral opacity-60 hover:opacity-100'}`}
          >
            All news
          </button>
          <span className="text-sm text-muted font-medium ml-2">Domain:</span>
          <button
            type="button"
            onClick={() => changeFilter(setDomain)('')}
            className={`chip cursor-pointer transition ${domain === '' ? '' : 'chip-neutral opacity-60 hover:opacity-100'}`}
          >
            Any
          </button>
          {TECH_DOMAINS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => changeFilter(setDomain)(item)}
              className={`chip cursor-pointer transition ${domain === item ? '' : 'chip-neutral opacity-60 hover:opacity-100'}`}
            >
              {item}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 max-w-2xl">
          <input
            type="text"
            className="field flex-1"
            placeholder="Search headlines, summaries, tags..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <button type="submit" className="btn-outline">Search</button>
          {search && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
            >
              Clear
            </button>
          )}
        </form>

        {tab === 'personalized' && data.personalized === false && (
          <p className="text-sm text-muted mt-3">
            You have not picked any domains yet, so all news is shown.{' '}
            <Link to="/profile" className="text-accent hover:text-accent-hover font-medium">Choose your domains</Link>
          </p>
        )}
      </header>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200/60 text-rose-700 rounded-lg text-sm">{error}</div>
      )}

      {loading ? (
        <div className="text-center p-10">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-muted">Loading news...</p>
        </div>
      ) : data.articles.length === 0 ? (
        <div className="card p-12 text-center" style={{ borderStyle: 'dashed' }}>
          <p className="text-muted">
            {search || domain
              ? 'No articles match these filters.'
              : isAdmin
                ? 'No articles yet. Use "Refresh news" to fetch the latest headlines.'
                : 'No articles yet. Fresh headlines are fetched automatically, check back shortly.'}
          </p>
        </div>
      ) : (
        <>
          <div className="dashboard-grid">
            {data.articles.map((article) => (
              <NewsCard key={article._id} article={article} />
            ))}
          </div>

          <div className="flex items-center justify-between mt-8">
            <p className="text-xs text-muted">
              {data.total} article{data.total === 1 ? '' : 's'}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={data.page <= 1}
                className="btn-secondary"
                aria-label="Previous page"
              >
                ←
              </button>
              <span className="text-xs text-muted">Page {data.page} of {data.pages}</span>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(data.pages, prev + 1))}
                disabled={data.page >= data.pages}
                className="btn-secondary"
                aria-label="Next page"
              >
                →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
