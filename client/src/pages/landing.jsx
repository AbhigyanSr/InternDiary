import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/api.js';
import NewsCard from '../components/newsCard.jsx';

export default function Landing() {
  const [news, setNews] = useState({ loading: true, items: [], error: '' });
  const [interviews, setInterviews] = useState({ loading: true, items: [], error: '' });

  useEffect(() => {
    apiRequest('/news/public?limit=3')
      .then((data) => setNews({ loading: false, items: data.articles || [], error: '' }))
      .catch((err) => setNews({ loading: false, items: [], error: err.message }));
    // No token: the backend returns a capped guest preview list
    apiRequest('/interviews')
      .then((data) => setInterviews({ loading: false, items: data.interviews || [], error: '' }))
      .catch((err) => setInterviews({ loading: false, items: [], error: err.message }));
  }, []);

  return (
    <div className="bg-page min-h-screen">
      {/* Masthead */}
      <header className="masthead">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 md:px-10 py-5">
          <div className="flex items-baseline gap-3">
            <h1 className="brand">Intern Diary</h1>
            <span className="hidden md:inline text-sm text-muted">A field journal for placement season</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-secondary">Log in</Link>
            <Link to="/signup" className="btn-primary">Create account</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-10">
        {/* Hero */}
        <section className="py-16 md:py-24 max-w-3xl">
          <p className="eyebrow mb-5">For students preparing for internships</p>
          <h2 className="display-title mb-6">
            Everything you need for placement season, in one place.
          </h2>
          <p className="lede mb-9 max-w-2xl">
            Track applications, plan your prep, read real interview experiences from
            students who sat the same rounds, and get tech news filtered to the domains
            you actually care about.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/signup" className="btn-primary">Get started</Link>
            <Link to="/login" className="btn-outline">I already have an account</Link>
          </div>
        </section>

        {/* What's inside */}
        <section className="pb-16">
          <div className="story-grid md:grid-cols-4">
            {[
              ['Opportunities', 'Internships, hackathons and webinars, with deadlines you can act on.'],
              ['Application tracker', 'Every application and its status, in one ledger.'],
              ['Prep planner', 'DSA, resume and behavioural prep as a simple checklist.'],
              ['Interview experiences', 'Round-by-round accounts written by students.'],
            ].map(([title, text]) => (
              <div key={title} className="story">
                <h3 className="item-title mb-2">{title}</h3>
                <p className="body-text text-muted">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Public news */}
        <section className="py-12 border-t border-zinc-200">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-8">
            <div>
              <h3 className="section-title">Latest in tech</h3>
              <p className="text-muted mt-1">Summarised and tagged automatically.</p>
            </div>
            <Link to="/login" className="link-accent text-sm">Log in to see more news →</Link>
          </div>
          {news.loading ? (
            <div className="py-10 text-center">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-muted">Loading headlines...</p>
            </div>
          ) : news.items.length === 0 ? (
            <p className="text-muted py-10 text-center">
              {news.error ? 'News is unavailable right now.' : 'Fresh headlines are being fetched. Check back shortly.'}
            </p>
          ) : (
            <>
              <div className="story-grid">
                {news.items.slice(0, 3).map((article) => (
                  <NewsCard key={article._id} article={article} compact />
                ))}
              </div>
              <div className="mt-10 py-8 border-t border-zinc-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <p className="text-muted">Log in to read more headlines and filter them by your domains.</p>
                <Link to="/login" className="btn-primary">Log in to see more news</Link>
              </div>
            </>
          )}
        </section>

        {/* Guest interview previews */}
        <section className="py-12 border-t border-zinc-200">
          <div className="mb-8">
            <h3 className="section-title">Interview experiences</h3>
            <p className="text-muted mt-1">Round-by-round accounts from students who have been through it.</p>
          </div>
          {interviews.items.length > 0 && (
            <div className="story-grid mb-8">
              {interviews.items.map((item) => (
                <div key={item._id} className="story space-y-2">
                  <p className="eyebrow">{item.company}</p>
                  <h4 className="item-title">{item.role}</h4>
                  <p className="text-sm text-muted">{item.difficulty} · {item.outcome}</p>
                  {item.preview && <p className="body-text">{item.preview}</p>}
                </div>
              ))}
            </div>
          )}
          <div className="py-8 border-t border-zinc-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-muted">
              {interviews.loading
                ? 'Loading experiences...'
                : 'Log in to read full experiences and post your own.'}
            </p>
            <Link to="/signup" className="btn-primary">Create account</Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 flex flex-col md:flex-row md:justify-between gap-2">
          <span className="brand text-xl">Intern Diary</span>
          <p className="text-sm text-muted">Made by Abhigyan Srivastava</p>
        </div>
      </footer>
    </div>
  );
}