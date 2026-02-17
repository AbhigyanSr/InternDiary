import { useState } from 'react';

export default function JobCard({ job, onApply, isApplied }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleExpanded();
    }
  };

  return (
    <>
      <div
        className="card card-hover p-5 cursor-pointer"
        onClick={toggleExpanded}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`chip text-xs ${
                job.type === 'Hackathon' ? 'chip-warning' : 
                job.type === 'Webinar' ? 'chip-success' : 
                ''
              }`}>
                {job.type || 'Internship'}
              </span>
              <span className="chip chip-neutral text-xs">
                {new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-1">{job.title || job.role}</h3>
            <p className="text-muted text-sm font-medium">{job.company}</p>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <a 
            href={job.applyLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary text-xs px-4 py-2"
            onClick={(event) => event.stopPropagation()}
          >
            View Posting
          </a>
          {isApplied ? (
            <span className="chip chip-success text-xs">
              ✓ Applied
            </span>
          ) : (
            <button 
              onClick={(event) => {
                event.stopPropagation();
                onApply(job);
              }}
              className="btn-outline text-xs px-4 py-2"
            >
              Applied?
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div
          className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={toggleExpanded}
          role="presentation"
        >
          <div
            className="modal-content w-full max-w-2xl card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between p-6" style={{ borderBottom: '1px solid var(--border-separator)' }}>
              <div className="flex-1 pr-4">
                <span className={`chip text-xs mb-2 inline-block ${
                  job.type === 'Hackathon' ? 'chip-warning' : 
                  job.type === 'Webinar' ? 'chip-success' : 
                  ''
                }`}>
                  {job.type || 'Internship'}
                </span>
                <h3 className="text-2xl font-semibold mb-1">{job.title || job.role}</h3>
                <p className="text-muted font-medium">{job.company}</p>
              </div>
              <button
                type="button"
                onClick={toggleExpanded}
                className="text-muted hover:text-primary text-2xl leading-none transition"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Description</h4>
                <div className="text-sm leading-relaxed p-4 bg-page rounded-lg border border-soft">
                  {job.description?.trim() || 'No description provided.'}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="chip">
                  Deadline: {new Date(job.deadline).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
                <a 
                  href={job.applyLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary px-5 py-2"
                >
                  View Full Posting →
                </a>
                {isApplied ? (
                  <span className="chip chip-success">
                    ✓ Already Applied
                  </span>
                ) : (
                  <button 
                    onClick={() => {
                      onApply(job);
                      toggleExpanded();
                    }}
                    className="btn-outline px-5 py-2"
                  >
                    Mark as Applied
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}