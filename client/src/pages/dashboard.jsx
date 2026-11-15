import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api.js';
import JobCard from '../components/jobCard.jsx';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [filterType, setFilterType] = useState('All');
  const [apps, setApps] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const [jobsData, appsData, tasksData] = await Promise.all([
          apiRequest('/jobs', 'GET', null, token),
          apiRequest('/applications', 'GET', null, token),
          // Stats only: a planner failure should not hide the job feed
          apiRequest('/tasks', 'GET', null, token).catch(() => [])
        ]);
        setJobs(jobsData || []);
        setApps(appsData || []);
        setTasks(tasksData || []);
        const appliedSet = new Set(
          (appsData || [])
            .map(app => app?.opportunity)
            .filter(Boolean)
        );
        setAppliedIds(appliedSet);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
        setError(err.message || 'Could not load opportunities');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleApply = async (job) => {
    try {
      const token = localStorage.getItem('token');
      if (!job?._id) {
        alert('Cannot apply: missing opportunity id');
        return;
      }
      
      const payload = {
        company: job.company,
        role: job.title || job.role, // Use title if available, fallback to role
        status: 'applied',
        opportunity: job._id
      };
      // This sends the job details to our Application model in the backend
      const newApp = await apiRequest('/applications', 'POST', payload, token);

      setAppliedIds(prev => new Set(prev).add(job._id));
      setApps(prev => [newApp, ...prev]);
      alert(`Tracked: Applied to ${job.company}`);
    } catch (err) {
      console.error('Error tracking application:', err);
      alert("Error tracking application: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-10">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-muted">Searching for new openings...</p>
      </div>
    );
  }

  const filteredJobs = filterType === 'All' 
    ? jobs 
    : jobs.filter(job => (job.type || 'Internship') === filterType);

  // Separate active and missed opportunities
  const now = new Date();
  const activeJobs = filteredJobs.filter(job => new Date(job.deadline) >= now);
  const missedJobs = filteredJobs.filter(job =>
    new Date(job.deadline) < now && !appliedIds.has(job._id)
  );

  const allActiveCount = jobs.filter(job => new Date(job.deadline) >= now).length;
  const progressedApps = apps.filter(app => app.status === 'interviewing' || app.status === 'offer').length;
  const completedTasks = tasks.filter(task => task.isCompleted).length;
  const stats = [
    { label: 'Active opportunities', value: allActiveCount },
    { label: 'Applications tracked', value: apps.length },
    { label: 'Interviews & offers', value: progressedApps },
    { label: 'Prep tasks done', value: `${completedTasks}/${tasks.length}` },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-4">
          <div>
            <h1 className="font-sans font-semibold text-3xl text-zinc-900 tracking-tight mb-1">Opportunity Feed</h1>
            <p className="text-muted">Internships, hackathons and webinars posted by your placement team</p>
          </div>
          <div className="chip">
            {activeJobs.length} Active {activeJobs.length === 1 ? 'Opportunity' : 'Opportunities'}
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-200/60 text-rose-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map(stat => (
            <div key={stat.label} className="card p-4">
              <p className="text-xs text-muted uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="font-sans font-semibold text-2xl text-zinc-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted font-medium">Filter:</span>
          <button
            onClick={() => setFilterType('All')}
            className={`chip cursor-pointer transition ${filterType === 'All' ? '' : 'chip-neutral opacity-60 hover:opacity-100'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('Internship')}
            className={`chip cursor-pointer transition ${filterType === 'Internship' ? '' : 'chip-neutral opacity-60 hover:opacity-100'}`}
          >
            Internships
          </button>
          <button
            onClick={() => setFilterType('Hackathon')}
            className={`chip chip-warning cursor-pointer transition ${filterType === 'Hackathon' ? '' : 'chip-neutral opacity-60 hover:opacity-100'}`}
          >
            Hackathons
          </button>
          <button
            onClick={() => setFilterType('Webinar')}
            className={`chip chip-success cursor-pointer transition ${filterType === 'Webinar' ? '' : 'chip-neutral opacity-60 hover:opacity-100'}`}
          >
            Webinars
          </button>
        </div>
      </header>

      {/* Active Opportunities */}
      {activeJobs.length > 0 ? (
        <div className="dashboard-grid">
          {activeJobs.map(job => (
            <JobCard 
              key={job._id} 
              job={job} 
              onApply={() => handleApply(job)} 
              isApplied={appliedIds.has(job._id)}
            />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center" style={{ borderStyle: 'dashed' }}>
          <p className="text-muted">
            {jobs.length === 0 
              ? 'No opportunities posted yet. Check back later!'
              : `No active ${filterType === 'All' ? 'opportunities' : filterType.toLowerCase() + 's'} found. Try a different filter.`}
          </p>
        </div>
      )}

      {/* Missed Opportunities Section */}
      {missedJobs.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border-subtle"></div>
            <h2 className="font-sans font-semibold text-2xl text-zinc-900 tracking-tight">Missed Opportunities</h2>
            <div className="flex-1 h-px bg-border-subtle"></div>
          </div>
          <p className="text-sm text-muted text-center mb-6">
            These opportunities have passed their availability time and you didn't apply. Review them for future reference.
          </p>
          <div className="dashboard-grid opacity-60">
            {missedJobs.map(job => (
              <div key={job._id} className="relative">
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] z-10 rounded-xl flex items-center justify-center pointer-events-none">
                  <span className="chip chip-danger text-xs font-semibold">Time Passed</span>
                </div>
                <JobCard 
                  job={job} 
                  onApply={() => handleApply(job)} 
                  isApplied={appliedIds.has(job._id)}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

