import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/api.js';
import NewsCard from '../components/newsCard.jsx';

export default function Landing() {
  const [news, setNews] = useState({ loading: true, items: [], error: '' });
  const [interviews, setInterviews] = useState({ loading: true, items: [], error: '' });

  useEffect(() => {
    apiRequest('/news/public?limit=6')
      .then((data) => setNews({ loading: false, items: data.articles || [], error: '' }))
      .catch((err) => setNews({ loading: false, items: [], error: err.message }));
    // No token: the backend returns a capped guest preview list
    apiRequest('/interviews')
      .then((data) => setInterviews({ loading: false, items: data.interviews || [], error: '' }))
      .catch((err) => setInterviews({ loading: false, items: [], error: err.message }));
  }, []);

  return (
    <div className="bg-page min-h-screen">
      {/* Top bar */}
      <header className="hero-mesh flex justify-between items-center px-6 md:px-12 py-6">
        <div>
          <h1 className="font-serif text-3xl text-zinc-950 tracking-tight text-gradient">Intern Diary</h1>
          <p className="text-xs text-muted mt-1">Track your journey</p>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="btn-outline">Log in</Link>
          <Link to="/signup" className="btn-primary">Create account</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 md:px-12 py-16 md:py-24 max-w-4xl">
        <h2 className="font-serif text-4xl md:text-5xl text-zinc-950 tracking-tight leading-tight mb-6">
          Everything you need for placement season, in one place.
        </h2>
        <p className="text-muted text-lg mb-8 max-w-2xl">
          Track applications, plan your prep, read real interview experiences from
          students who sat the same rounds, and get tech news filtered to the domains
          you actually care about.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/signup" className="btn-primary">Get started</Link>
          <Link to="/login" className="btn-secondary">I already have an account</Link>
        </div>
      </section>

      <div className="px-6 md:px-12">
        <div className="divider"></div>
      </div>

      {/* Public news */}
      <section className="px-6 md:px-12 py-12">
        <h3 className="font-sans font-semibold text-2xl text-zinc-900 tracking-tight mb-2">Latest in tech</h3>
        <p className="text-muted mb-6">
          Summarised and tagged automatically. Log in to filter by your domains.
        </p>
        {news.loading ? (
          <div className="card p-8 text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-muted">Loading headlines...</p>
          </div>
        ) : news.items.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-muted">
              {news.error ? 'News is unavailable right now.' : 'Fresh headlines are being fetched. Check back shortly.'}
            </p>
          </div>
        ) : (
          <div className="dashboard-grid">
            {news.items.map((article) => (
              <NewsCard key={article._id} article={article} compact />
            ))}
          </div>
        )}
      </section>

      {/* Guest interview previews */}
      <section className="px-6 md:px-12 py-12">
        <h3 className="font-sans font-semibold text-2xl text-zinc-900 tracking-tight mb-2">Interview experiences</h3>
        <p className="text-muted mb-6">
          Round-by-round accounts from students who have been through it.
        </p>
        {interviews.items.length > 0 && (
          <div className="dashboard-grid mb-6">
            {interviews.items.map((item) => (
              <div key={item._id} className="card p-5 space-y-2">
                <div className="flex gap-2">
                  <span className="chip text-xs">{item.difficulty}</span>
                  <span className="chip chip-neutral text-xs">{item.outcome}</span>
                </div>
                <h4 className="font-sans font-medium text-xl text-zinc-900 tracking-tight">{item.role}</h4>
                <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">{item.company}</p>
                {item.preview && <p className="text-sm text-muted leading-relaxed">{item.preview}</p>}
              </div>
            ))}
          </div>
        )}
        <div className="card p-8 text-center">
          <p className="text-muted mb-4">
            {interviews.loading
              ? 'Loading experiences...'
              : 'Log in to read full experiences and post your own.'}
          </p>
          <Link to="/signup" className="btn-primary">Create account</Link>
        </div>
      </section>

      <footer className="px-6 md:px-12 py-10 text-center">
        <div className="divider mb-6"></div>
        <p className="text-xs text-muted opacity-40">Made by Abhigyan Srivastava</p>
      </footer>
    </div>
  );
}