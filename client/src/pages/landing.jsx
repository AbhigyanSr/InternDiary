import { Link } from 'react-router-dom';
import { TECH_DOMAINS } from '../constants/domains.js';

export default function Landing() {
  return (
    <div className="bg-page min-h-screen">
      {/* Top bar */}
      <header className="flex justify-between items-center px-6 md:px-12 py-6">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Intern Diary</h1>
          <p className="text-xs text-muted mt-1">Track your journey</p>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="btn-outline">Log in</Link>
          <Link to="/signup" className="btn-primary">Create account</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 md:px-12 py-16 md:py-24 max-w-4xl">
        <h2 className="text-4xl md:text-5xl font-semibold leading-tight mb-6">
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

      {/* Domains */}
      <section className="px-6 md:px-12 py-12">
        <p className="text-sm text-muted uppercase tracking-wider mb-4">
          Pick your domains, get a feed that matches
        </p>
        <div className="flex flex-wrap gap-2">
          {TECH_DOMAINS.map((domain) => (
            <span key={domain} className="chip chip-neutral">{domain}</span>
          ))}
        </div>
      </section>

      <div className="px-6 md:px-12">
        <div className="divider"></div>
      </div>

      {/* Placeholder: Feature 2 renders public news here */}
      <section className="px-6 md:px-12 py-12">
        <h3 className="text-2xl font-semibold mb-2">Latest in tech</h3>
        <p className="text-muted mb-6">
          Summarised and tagged automatically. Log in to filter by your domains.
        </p>
        <div className="card p-8 text-center">
          <p className="text-muted">News feed arrives with the next feature.</p>
        </div>
      </section>

      {/* Placeholder: Feature 4 renders public interview previews here */}
      <section className="px-6 md:px-12 py-12">
        <h3 className="text-2xl font-semibold mb-2">Interview experiences</h3>
        <p className="text-muted mb-6">
          Round-by-round accounts from students who have been through it.
        </p>
        <div className="card p-8 text-center">
          <p className="text-muted mb-4">Log in to read full experiences and post your own.</p>
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