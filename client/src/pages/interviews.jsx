import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

const PAGE_SIZE = 10;
const EMPTY_FORM = { company: '', role: '', difficulty: 'Medium', outcome: 'Accepted', rounds: [''], tips: '' };

const difficultyChip = (difficulty) => {
  if (difficulty === 'Hard') return 'chip-danger';
  if (difficulty === 'Easy') return 'chip-success';
  return 'chip-warning';
};

const outcomeChip = (outcome) => (outcome === 'Accepted' ? 'chip-success' : 'chip-neutral');

function InterviewBody({ interview }) {
  return (
    <div className="space-y-4">
      {(interview.rounds || []).length > 0 ? (
        <div className="space-y-3">
          {interview.rounds.map((round, index) => (
            <div key={index}>
              <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-1">Round {index + 1}</h4>
              <div className="text-sm leading-relaxed p-4 bg-page rounded-lg border border-soft whitespace-pre-line">{round}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">No round details were shared.</p>
      )}
      {interview.tips && (
        <div>
          <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-1">Tips</h4>
          <div className="text-sm leading-relaxed p-4 bg-page rounded-lg border border-soft whitespace-pre-line">{interview.tips}</div>
        </div>
      )}
    </div>
  );
}

export default function Interviews() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [outcome, setOutcome] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ interviews: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });

  const [pending, setPending] = useState([]);
  const [moderationError, setModerationError] = useState('');

  const loadInterviews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (search) params.set('search', search);
      if (difficulty) params.set('difficulty', difficulty);
      if (outcome) params.set('outcome', outcome);
      const result = await apiRequest(`/interviews?${params}`, 'GET', null, localStorage.getItem('token'));
      setData(result);
    } catch (err) {
      setError(err.message || 'Could not load interview experiences');
    } finally {
      setLoading(false);
    }
  }, [page, search, difficulty, outcome]);

  const loadPending = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const result = await apiRequest('/interviews/pending', 'GET', null, localStorage.getItem('token'));
      setPending(result || []);
    } catch (err) {
      setModerationError(err.message || 'Could not load pending submissions');
    }
  }, [isAdmin]);

  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const handleSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const updateRound = (index, value) => {
    setForm((prev) => ({ ...prev, rounds: prev.rounds.map((round, i) => (i === index ? value : round)) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormMessage({ type: '', text: '' });
    if (!form.company.trim() || !form.role.trim()) {
      setFormMessage({ type: 'error', text: 'Company and role are required.' });
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest('/interviews', 'POST', {
        company: form.company.trim(),
        role: form.role.trim(),
        difficulty: form.difficulty,
        outcome: form.outcome,
        rounds: form.rounds.map((round) => round.trim()).filter(Boolean),
        tips: form.tips.trim(),
      }, localStorage.getItem('token'));
      setForm(EMPTY_FORM);
      setFormMessage({
        type: 'success',
        text: isAdmin
          ? 'Submitted. It is waiting in the moderation queue below.'
          : 'Thanks! Your experience was submitted and will appear once an admin approves it.',
      });
      loadPending();
    } catch (err) {
      setFormMessage({ type: 'error', text: err.message || 'Could not submit your experience' });
    } finally {
      setSubmitting(false);
    }
  };

  const moderate = async (id, action) => {
    setModerationError('');
    const token = localStorage.getItem('token');
    try {
      if (action === 'approve') {
        await apiRequest(`/interviews/${id}/approve`, 'PUT', null, token);
      } else {
        if (!window.confirm('Remove this interview experience? This cannot be undone.')) return;
        await apiRequest(`/interviews/${id}`, 'DELETE', null, token);
      }
      setPending((prev) => prev.filter((item) => item._id !== id));
      loadInterviews();
    } catch (err) {
      setModerationError(err.message || 'Moderation action failed');
    }
  };

  const filterChip = (active) => `chip cursor-pointer transition ${active ? '' : 'chip-neutral opacity-60 hover:opacity-100'}`;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-sans font-semibold text-3xl text-zinc-900 tracking-tight">Interview Experiences</h1>
          <p className="text-muted mt-1">Round-by-round accounts from students who have been through it</p>
        </div>
        <button type="button" onClick={() => setShowForm((prev) => !prev)} className="btn-primary">
          {showForm ? 'Close form' : '+ Share your experience'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <h3 className="font-sans font-semibold text-xl text-zinc-900 tracking-tight">Share your interview experience</h3>
          {formMessage.text && (
            <div className={`px-4 py-3 rounded-lg text-sm border ${formMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200/60 text-rose-700'
              : 'bg-emerald-50 border-emerald-200/60 text-emerald-700'}`}
            >
              {formMessage.text}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="iv-company">Company</label>
              <input id="iv-company" type="text" className="field" value={form.company} placeholder="e.g. Google"
                onChange={(event) => setForm({ ...form, company: event.target.value })} />
            </div>
            <div>
              <label htmlFor="iv-role">Role</label>
              <input id="iv-role" type="text" className="field" value={form.role} placeholder="e.g. SDE Intern"
                onChange={(event) => setForm({ ...form, role: event.target.value })} />
            </div>
            <div>
              <label htmlFor="iv-difficulty">Difficulty</label>
              <select id="iv-difficulty" className="field" value={form.difficulty}
                onChange={(event) => setForm({ ...form, difficulty: event.target.value })}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label htmlFor="iv-outcome">Outcome</label>
              <select id="iv-outcome" className="field" value={form.outcome}
                onChange={(event) => setForm({ ...form, outcome: event.target.value })}>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <label>Rounds</label>
            {form.rounds.map((round, index) => (
              <div key={index} className="flex gap-2 items-start">
                <textarea
                  rows={3}
                  className="field flex-1"
                  value={round}
                  placeholder={`Round ${index + 1}: format, questions asked, how it went...`}
                  onChange={(event) => updateRound(index, event.target.value)}
                />
                {form.rounds.length > 1 && (
                  <button type="button" className="btn-secondary"
                    onClick={() => setForm((prev) => ({ ...prev, rounds: prev.rounds.filter((_, i) => i !== index) }))}
                    aria-label={`Remove round ${index + 1}`}>
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn-outline text-sm"
              onClick={() => setForm((prev) => ({ ...prev, rounds: [...prev.rounds, ''] }))}>
              + Add round
            </button>
          </div>
          <div>
            <label htmlFor="iv-tips">Tips for others (optional)</label>
            <textarea id="iv-tips" rows={3} className="field" value={form.tips}
              placeholder="What would you tell someone preparing for this interview?"
              onChange={(event) => setForm({ ...form, tips: event.target.value })} />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Submitting...' : 'Submit for review'}
          </button>
        </form>
      )}

      {isAdmin && (
        <section className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-sans font-semibold text-2xl text-zinc-900 tracking-tight">Moderation queue</h2>
            <span className="chip">{pending.length} pending</span>
          </div>
          {moderationError && (
            <div className="p-4 bg-rose-50 border border-rose-200/60 text-rose-700 rounded-lg text-sm">{moderationError}</div>
          )}
          {pending.length === 0 ? (
            <p className="text-sm text-muted">No submissions waiting for review.</p>
          ) : (
            <div className="space-y-4">
              {pending.map((item) => (
                <div key={item._id} className="p-4 rounded-lg border border-soft space-y-3">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <h3 className="font-sans font-medium text-xl text-zinc-900 tracking-tight">{item.role}</h3>
                      <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">{item.company}</p>
                      <p className="text-xs text-muted mt-1">
                        Submitted by {item.author?.name || 'Unknown user'}{item.author?.email ? ` (${item.author.email})` : ''} on{' '}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="btn-primary px-4 py-2 text-sm" onClick={() => moderate(item._id, 'approve')}>
                        Approve
                      </button>
                      <button type="button" className="btn-outline text-rose-700 border-rose-200 hover:bg-rose-50 px-4 py-2 text-sm"
                        onClick={() => moderate(item._id, 'reject')}>
                        Reject
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`chip text-xs ${difficultyChip(item.difficulty)}`}>{item.difficulty}</span>
                    <span className={`chip text-xs ${outcomeChip(item.outcome)}`}>{item.outcome}</span>
                  </div>
                  <InterviewBody interview={item} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <input type="text" className="field flex-1" placeholder="Search by company or role..."
            value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
          <button type="submit" className="btn-outline">Search</button>
          {search && (
            <button type="button" className="btn-secondary" onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}>
              Clear
            </button>
          )}
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted font-medium">Difficulty:</span>
          {['', 'Easy', 'Medium', 'Hard'].map((value) => (
            <button key={value || 'any'} type="button" className={filterChip(difficulty === value)}
              onClick={() => { setDifficulty(value); setPage(1); }}>
              {value || 'Any'}
            </button>
          ))}
          <span className="text-sm text-muted font-medium ml-2">Outcome:</span>
          {['', 'Accepted', 'Rejected'].map((value) => (
            <button key={value || 'any'} type="button" className={filterChip(outcome === value)}
              onClick={() => { setOutcome(value); setPage(1); }}>
              {value || 'Any'}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200/60 text-rose-700 rounded-lg text-sm">{error}</div>
        )}

        {loading ? (
          <div className="text-center p-10">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-muted">Loading experiences...</p>
          </div>
        ) : data.interviews.length === 0 ? (
          <div className="card p-12 text-center" style={{ borderStyle: 'dashed' }}>
            <p className="text-muted">
              {search || difficulty || outcome
                ? 'No experiences match these filters.'
                : 'No interview experiences yet. Be the first to share one!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.interviews.map((interview) => {
              const isExpanded = expandedId === interview._id;
              return (
                <div key={interview._id} className="card p-5 space-y-4">
                  <div
                    className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : interview._id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setExpandedId(isExpanded ? null : interview._id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                  >
                    <div>
                      <h3 className="font-sans font-medium text-xl text-zinc-900 tracking-tight">{interview.role}</h3>
                      <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">{interview.company}</p>
                      <p className="text-xs text-muted mt-1">
                        {interview.author?.name ? `Shared by ${interview.author.name} · ` : ''}
                        {new Date(interview.createdAt).toLocaleDateString()}
                        {` · ${(interview.rounds || []).length} round${(interview.rounds || []).length === 1 ? '' : 's'}`}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className={`chip text-xs ${difficultyChip(interview.difficulty)}`}>{interview.difficulty}</span>
                      <span className={`chip text-xs ${outcomeChip(interview.outcome)}`}>{interview.outcome}</span>
                      <span className="text-muted text-sm">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {isExpanded && (
                    <>
                      <InterviewBody interview={interview} />
                      {isAdmin && (
                        <button type="button" className="btn-outline text-rose-700 border-rose-200 hover:bg-rose-50 px-4 py-2 text-sm"
                          onClick={() => moderate(interview._id, 'reject')}>
                          Remove
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {data.total > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted">{data.total} experience{data.total === 1 ? '' : 's'}</p>
            <div className="flex items-center gap-2">
              <button type="button" className="btn-secondary" disabled={data.page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))} aria-label="Previous page">←</button>
              <span className="text-xs text-muted">Page {data.page} of {data.pages}</span>
              <button type="button" className="btn-secondary" disabled={data.page >= data.pages}
                onClick={() => setPage((prev) => Math.min(data.pages, prev + 1))} aria-label="Next page">→</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
